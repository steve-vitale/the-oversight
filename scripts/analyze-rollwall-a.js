// analyze-rollwall-a.js — classifier + calibration for sim-rollwall-a
// (finding #2590, the ROLL WALL). Reads the rollwall diag corpus
// (evidence/2026-11-21/perseed-rollwall-a-diag/*.json) and:
//   1. Joins every staged-bow departure (stageRows staged=true) to
//      its villagerPocketAmmo row (same vid/day, first ammo row with
//      seq > stage seq on the expedition path).
//   2. Classifies every served 0-ammo departure into exactly one
//      class (prereg §3): roll-fail / no-mats / no-mats (timing) /
//      no-ammo-id / no-ranged / no-attempt / no-recipe / unclassified.
//   3. Reports the departure-craft calibration per rate (all attempts
//      with crafted==1, grouped by ammoRate) with exact binomial
//      95% intervals (Clopper-Pearson via binary search on the
//      binomial CDF — no special functions).
//   4. Reports staging context + wall numbers per seed.
// Usage:
//   node scripts/analyze-rollwall-a.js [corpusDir] [outJson]
//   node scripts/analyze-rollwall-a.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const DEFAULT_DIR = path.join(REPO, 'evidence', '2026-11-21', 'perseed-rollwall-a-diag');
const DEFAULT_OUT = path.join(REPO, 'evidence', '2026-11-21', 'rollwall-a-analysis.json');

const CLASSES = ['roll-fail', 'no-mats', 'no-mats (timing)', 'no-ammo-id', 'no-ranged', 'no-attempt', 'no-recipe', 'unclassified'];

// ---- exact binomial helpers (pure) ----
function binomCdf(k, n, p) {
  // P(X <= k) for X ~ Bin(n, p). Sum of terms; n is small (<= ~300).
  if (k < 0) return 0;
  if (k >= n) return 1;
  if (p <= 0) return 1;
  if (p >= 1) return 0;
  let sum = 0;
  // term for x=0, then iterate up with the recurrence.
  let term = Math.pow(1 - p, n);
  sum += term;
  for (let x = 1; x <= k; x++) {
    term = term * (n - x + 1) / x * p / (1 - p);
    sum += term;
  }
  return Math.min(1, Math.max(0, sum));
}
function clopperPearson(k, n, alpha) {
  alpha = (alpha == null ? 0.05 : alpha);
  if (n === 0) return { lo: null, hi: null };
  let lo = 0, hi = 1;
  if (k > 0) {
    // lo: smallest p with P(X >= k | p) = alpha/2, i.e. 1 - CDF(k-1) = alpha/2.
    let a = 0, b = 1;
    for (let i = 0; i < 200; i++) {
      const m = (a + b) / 2;
      if (1 - binomCdf(k - 1, n, m) < alpha / 2) a = m; else b = m;
    }
    lo = (a + b) / 2;
  }
  if (k < n) {
    // hi: largest p with P(X <= k | p) = alpha/2.
    let a = 0, b = 1;
    for (let i = 0; i < 200; i++) {
      const m = (a + b) / 2;
      if (binomCdf(k, n, m) < alpha / 2) b = m; else a = m;
    }
    hi = (a + b) / 2;
  }
  return { lo: lo, hi: hi };
}

// ---- classification (pure; exported for the proof test) ----
function dawnFiber(census, day) {
  for (const c of (census || [])) if (c.day === day) return c.pileFiber;
  return null;
}
function classifyServed(stage, ammo, homeRows, census) {
  if (!ammo) return { cls: 'no-attempt', detail: 'no ammo row for the served (vid, day)' };
  if (ammo.failReason === 'craft-fail') {
    return { cls: 'roll-fail', detail: 'craft ran at rate ' + ammo.ammoRate + ' (lv ' + ammo.ammoLvBefore + ') and lost' };
  }
  if (ammo.failReason === 'no-mats') {
    const df = dawnFiber(census, ammo.day);
    let timed = false;
    if (df != null && df >= 1) {
      for (const h of (homeRows || [])) {
        if (h.day === ammo.day && h.seq < ammo.seq && h.pileFiberBefore != null && h.pileFiberAfter != null && h.pileFiberAfter < h.pileFiberBefore) { timed = true; break; }
      }
    }
    if (timed) return { cls: 'no-mats (timing)', detail: 'pile fiber 0 at attempt; dawn pile fiber ' + df + '; a home craft took fiber earlier the same day' };
    return { cls: 'no-mats', detail: 'pile fiber ' + ((ammo.pile || {}).fiber != null ? (ammo.pile || {}).fiber : '?') + ' at attempt, pack fiber ' + ammo.packFiberBefore + ', dawn pile fiber ' + df };
  }
  if (ammo.failReason === 'no-ammo-id') return { cls: 'no-ammo-id', detail: 'rangedId ' + ammo.rangedId + ' (spear still seated — bow never seated)' };
  if (ammo.failReason === 'no-ranged') return { cls: 'no-ranged', detail: 'no ranged weapon seated at the attempt' };
  if (ammo.failReason === 'no-recipe') return { cls: 'no-recipe', detail: 'ammo kind ' + ammo.ammoId + ' has no pile recipe' };
  return { cls: 'unclassified', detail: 'failReason=' + ammo.failReason + ' crafted=' + ammo.crafted + ' craftedOk=' + ammo.craftedOk };
}

function analyzeFile(j) {
  const seed = j.seed;
  const stageRows = j.stageRows || [];
  const ammoRows = j.ammoRows || [];
  const homeRows = j.homeCraftRows || [];
  const census = j.dawnCensus || [];
  // Join: for each staged departure, the first ammo row for the same
  // vid/day with seq > stage seq, expedition path preferred.
  const served = [];
  let joinMismatch = 0;
  for (const s of stageRows) {
    if (!s.staged) continue;
    if (!(s.source === 'crafted' || s.source === 'fromStash' || s.source === 'fromArmory')) continue;
    let best = null;
    for (const a of ammoRows) {
      if (a.vid !== s.vid || a.day !== s.day) continue;
      if (a.seq <= s.seq) continue;
      if (a.path === 'expedition') { best = a; break; }
      if (!best) best = a;
    }
    if (best && !best.servedThisDepart) joinMismatch++;
    served.push({ stage: s, ammo: best || null });
  }
  const servedZero = [];
  for (const dep of served) {
    const carriedAfter = dep.ammo ? dep.ammo.carriedAfter : null;
    if (carriedAfter === 0 || dep.ammo === null) {
      const c = classifyServed(dep.stage, dep.ammo, homeRows, census);
      servedZero.push({ seed: seed, day: dep.stage.day, vid: dep.stage.vid,
        stageSource: dep.stage.source, stageItem: dep.stage.itemId,
        rangedId: dep.ammo ? dep.ammo.rangedId : null,
        ammoId: dep.ammo ? dep.ammo.ammoId : null,
        carriedBefore: dep.ammo ? dep.ammo.carriedBefore : null,
        carriedAfter: carriedAfter,
        ammoRate: dep.ammo ? dep.ammo.ammoRate : null,
        ammoLvBefore: dep.ammo ? dep.ammo.ammoLvBefore : null,
        failReason: dep.ammo ? dep.ammo.failReason : 'no-row',
        pileFiber: dep.ammo && dep.ammo.pile ? dep.ammo.pile.fiber : null,
        packFiber: dep.ammo ? dep.ammo.packFiberBefore : null,
        cls: c.cls, detail: c.detail });
    }
  }
  // Calibration: all departure craft attempts by rate.
  const byRate = {};
  for (const a of ammoRows) {
    if (a.crafted !== 1) continue;
    const k = (a.ammoRate != null ? String(a.ammoRate) : '?');
    byRate[k] = byRate[k] || { n: 0, ok: 0 };
    byRate[k].n++;
    if (a.craftedOk) byRate[k].ok++;
  }
  const calibration = {};
  for (const k of Object.keys(byRate)) {
    const b = byRate[k];
    const ci = clopperPearson(b.ok, b.n, 0.05);
    const stated = parseFloat(k);
    calibration[k] = { n: b.n, ok: b.ok, obs: b.n ? (b.ok / b.n) : null,
      lo: ci.lo, hi: ci.hi,
      stated: isFinite(stated) ? stated : null,
      calibrated: (isFinite(stated) && ci.lo != null) ? (ci.lo <= stated && stated <= ci.hi) : null };
  }
  // Staging context.
  const stageBySource = {};
  for (const s of stageRows) stageBySource[s.source || '?'] = (stageBySource[s.source || '?'] || 0) + 1;
  let skillGatedStaging = 0;
  for (const s of stageRows) {
    if (s.source !== 'noSource') continue;
    const matsOk = (s.pileBefore && s.ownBefore)
      ? ((s.pileBefore.branch + s.ownBefore.branch) >= 1 && (s.pileBefore.vine + s.ownBefore.vine) >= 1)
      : false;
    if ((s.lvBowBefore | 0) < 1 && (s.lvCrudeBefore | 0) < 1 && matsOk) skillGatedStaging++;
  }
  const starvation = (j.deaths || []).filter(function (d) { return d.cause === 'starvation' || d.kind === 'starvation'; }).length;
  return { seed: seed, days: j.days, endReason: j.endReason, villageLost: !!j.villageLost,
    maxWave: j.maxWave, standing: j.standing, scaleRank: j.scaleRank, won: !!j.won,
    deaths: (j.deaths || []).length, starvation: starvation,
    instrumentErrors: (j.instrumentErrors || []).length,
    stageRows: stageRows.length, ammoRows: ammoRows.length,
    homeCraftRows: homeRows.length,
    servedDepartures: served.length,
    servedZero: servedZero,
    servedZeroCount: servedZero.length,
    joinMismatch: joinMismatch,
    calibration: calibration,
    stageBySource: stageBySource,
    skillGatedStaging: skillGatedStaging };
}

function analyzeDir(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return /\.json$/.test(f); }).sort();
  const perSeed = [];
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    perSeed.push(analyzeFile(j));
  }
  // Band rollup.
  const classes = {};
  for (const c of CLASSES) classes[c] = 0;
  let servedZeroTotal = 0, servedTotal = 0, unclassified = 0, joinMismatch = 0, errors = 0;
  let nat = 0, wins = 0, w4 = 0, w5 = 0, surv = [];
  const calibBand = {};
  for (const s of perSeed) {
    servedTotal += s.servedDepartures;
    servedZeroTotal += s.servedZeroCount;
    joinMismatch += s.joinMismatch;
    errors += s.instrumentErrors;
    if (s.scaleRank === 'national' || (typeof s.scaleRank === 'string' && s.scaleRank.indexOf('national') !== -1)) nat++;
    if (s.won) wins++;
    if ((s.maxWave | 0) >= 4) w4++;
    if ((s.maxWave | 0) >= 5) w5++;
    surv.push(s.days);
    for (const z of s.servedZero) classes[z.cls] = (classes[z.cls] || 0) + 1;
    for (const k of Object.keys(s.calibration)) {
      calibBand[k] = calibBand[k] || { n: 0, ok: 0 };
      calibBand[k].n += s.calibration[k].n;
      calibBand[k].ok += s.calibration[k].ok;
    }
    if (s.servedZero.some(function (z) { return z.cls === 'unclassified'; })) unclassified += s.servedZero.filter(function (z) { return z.cls === 'unclassified'; }).length;
  }
  const calibrationBand = {};
  for (const k of Object.keys(calibBand)) {
    const b = calibBand[k];
    const ci = clopperPearson(b.ok, b.n, 0.05);
    const stated = parseFloat(k);
    calibrationBand[k] = { n: b.n, ok: b.ok, obs: b.n ? (b.ok / b.n) : null,
      lo: ci.lo, hi: ci.hi, stated: isFinite(stated) ? stated : null,
      calibrated: (isFinite(stated) && ci.lo != null) ? (ci.lo <= stated && stated <= ci.hi) : null };
  }
  surv.sort(function (a, b) { return a - b; });
  const medianSurv = surv.length ? surv[Math.floor(surv.length / 2)] : null;
  let dominant = null, dominantN = 0;
  for (const c of CLASSES) {
    if (c === 'unclassified') continue;
    if ((classes[c] || 0) > dominantN) { dominantN = classes[c]; dominant = c; }
  }
  const totalAttempts = Object.keys(calibBand).reduce(function (a, k) { return a + calibBand[k].n; }, 0);
  const diagGo = (unclassified === 0) && (dominantN >= 4 || totalAttempts >= 20);
  return { dir: dir, seeds: perSeed.length, perSeed: perSeed,
    servedTotal: servedTotal, servedZeroTotal: servedZeroTotal,
    classes: classes, unclassified: unclassified, joinMismatch: joinMismatch,
    instrumentErrors: errors,
    calibrationBand: calibrationBand, totalAttempts: totalAttempts,
    dominant: dominant, dominantN: dominantN,
    diagGo: diagGo,
    wall: { national: nat, wins: wins, wave4: w4, wave5: w5, medianSurvival: medianSurv } };
}

function selftest() {
  let passed = 0, failed = 0;
  function check(name, cond, extra) {
    if (cond) { passed++; console.log('  PASS ' + name); }
    else { failed++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
  }
  // CI sanity: 14/20 at p=0.6 contains 0.6; 0/6 excludes 0.6 (the
  // fiberfetch 6/6 framing contrast — the subset interval excludes
  // the rate, the full-attempt interval contains it).
  const ciFull = clopperPearson(14, 20, 0.05);
  check('CI 14/20 contains 0.60', ciFull.lo <= 0.6 && 0.6 <= ciFull.hi, JSON.stringify(ciFull));
  const ciSix = clopperPearson(0, 6, 0.05);
  check('CI 0/6 excludes 0.60 (subset framing)', ciSix.hi < 0.6, JSON.stringify(ciSix));
  const ciZero = clopperPearson(0, 0, 0.05);
  check('CI 0/0 is null', ciZero.lo === null && ciZero.hi === null);
  const ciAll = clopperPearson(25, 25, 0.05);
  check('CI 25/25 has hi 1 and lo < 1', ciAll.hi === 1 && ciAll.lo < 1, JSON.stringify(ciAll));
  // Classification fixtures.
  const stage = { day: 33, vid: 'v1', staged: true, source: 'crafted', itemId: 'crude_bow' };
  const home = [{ seq: 5, day: 33, batchesMade: 1, pileFiberBefore: 2, pileFiberAfter: 1, makers: [] }];
  const census = [{ day: 33, pileFiber: 2 }];
  check('roll-fail', classifyServed(stage, { failReason: 'craft-fail', ammoRate: 0.6, ammoLvBefore: 1 }, home, census).cls === 'roll-fail');
  check('no-mats plain (dawn 0)', classifyServed(stage, { failReason: 'no-mats', pile: { fiber: 0 }, packFiberBefore: 0 }, [], [{ day: 33, pileFiber: 0 }]).cls === 'no-mats');
  check('no-mats timing (dawn 2, home craft drained first)', classifyServed(stage, { seq: 9, day: 33, failReason: 'no-mats', pile: { fiber: 0 }, packFiberBefore: 0 }, home, census).cls === 'no-mats (timing)');
  check('no-mats not timing when home craft ran after', classifyServed(stage, { seq: 3, day: 33, failReason: 'no-mats', pile: { fiber: 0 }, packFiberBefore: 0 }, home, census).cls === 'no-mats');
  check('no-ammo-id', classifyServed(stage, { failReason: 'no-ammo-id', rangedId: 'hunting_spear' }, home, census).cls === 'no-ammo-id');
  check('no-ranged', classifyServed(stage, { failReason: 'no-ranged' }, home, census).cls === 'no-ranged');
  check('no-attempt', classifyServed(stage, null, home, census).cls === 'no-attempt');
  check('no-recipe', classifyServed(stage, { failReason: 'no-recipe', ammoId: 'dart' }, home, census).cls === 'no-recipe');
  check('unclassified on unknown reason', classifyServed(stage, { failReason: 'stock-draw', crafted: 0 }, home, census).cls === 'unclassified');
  // Join + rollup fixture.
  const j = { seed: 1, days: 150, endReason: 'survived', villageLost: false, maxWave: 5, standing: 199, scaleRank: 'regional', won: false,
    deaths: [], instrumentErrors: [],
    stageRows: [
      { seq: 10, day: 33, vid: 'v1', staged: true, source: 'crafted', itemId: 'crude_bow', lvBowBefore: 0, lvCrudeBefore: 1, pileBefore: { branch: 0, vine: 0, wood: 0 }, ownBefore: { branch: 0, vine: 0, wood: 0 }, spearHolder: true, craftedOk: true, roll35Rate: 0.6, depmatSite: true },
      { seq: 20, day: 40, vid: 'v2', staged: true, source: 'fromStash', itemId: 'bow', lvBowBefore: 0, lvCrudeBefore: 0, pileBefore: { branch: 1, vine: 1, wood: 1 }, ownBefore: { branch: 0, vine: 0, wood: 0 }, spearHolder: false, craftedOk: false, roll35Rate: null, depmatSite: false },
      { seq: 30, day: 50, vid: 'v3', staged: false, source: 'noSource', itemId: null, lvBowBefore: 0, lvCrudeBefore: 0, pileBefore: { branch: 1, vine: 1, wood: 1 }, ownBefore: { branch: 0, vine: 0, wood: 0 }, spearHolder: true, craftedOk: false, roll35Rate: null, depmatSite: false },
    ],
    ammoRows: [
      { seq: 11, day: 33, vid: 'v1', path: 'expedition', rangedId: 'crude_bow', ammoId: 'arrow', servedThisDepart: true, carriedBefore: 0, carriedAfter: 0, pile: { fiber: 3 }, packFiberBefore: 0, ammoLvBefore: 1, pocketed: 0, crafted: 1, craftedOk: false, ammoRate: 0.6, failReason: 'craft-fail' },
      { seq: 21, day: 40, vid: 'v2', path: 'expedition', rangedId: 'bow', ammoId: 'arrow', servedThisDepart: true, carriedBefore: 0, carriedAfter: 5, pile: { fiber: 2 }, packFiberBefore: 0, ammoLvBefore: 1, pocketed: 5, crafted: 1, craftedOk: true, ammoRate: 0.6, failReason: 'craft-ok' },
    ],
    homeCraftRows: [], dawnCensus: [{ day: 33, pileFiber: 3 }, { day: 40, pileFiber: 2 }] };
  const a = analyzeFile(j);
  check('join finds 2 served departures', a.servedDepartures === 2, 'got ' + a.servedDepartures);
  check('servedZero is 1 (v1 roll-fail)', a.servedZeroCount === 1 && a.servedZero[0].cls === 'roll-fail', JSON.stringify(a.servedZero));
  check('no join mismatch', a.joinMismatch === 0);
  check('calibration 0.6 is 1/2', a.calibration['0.6'] && a.calibration['0.6'].n === 2 && a.calibration['0.6'].ok === 1, JSON.stringify(a.calibration));
  check('skill-gated staging counts the noSource row', a.skillGatedStaging === 1, 'got ' + a.skillGatedStaging);
  console.log('ROLLWALL_ANALYZE_SELFTEST ' + passed + ' passed, ' + failed + ' failed');
  return failed;
}

if (require.main === module) {
  if (process.argv.indexOf('--selftest') !== -1) {
    const f = selftest();
    process.exit(f ? 1 : 0);
  }
  const dir = process.argv[2] || DEFAULT_DIR;
  const outPath = process.argv[3] || DEFAULT_OUT;
  const res = analyzeDir(dir);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(res, null, 2) + '\n');
  console.log('seeds: ' + res.seeds);
  console.log('served departures: ' + res.servedTotal + ' | served 0-ammo: ' + res.servedZeroTotal);
  console.log('classes: ' + JSON.stringify(res.classes));
  console.log('unclassified: ' + res.unclassified + ' | joinMismatch: ' + res.joinMismatch + ' | instrumentErrors: ' + res.instrumentErrors);
  console.log('dominant: ' + res.dominant + ' (' + res.dominantN + ') | total attempts: ' + res.totalAttempts);
  for (const k of Object.keys(res.calibrationBand).sort()) {
    const c = res.calibrationBand[k];
    console.log('rate ' + k + ': n=' + c.n + ' ok=' + c.ok + ' obs=' + (c.obs != null ? c.obs.toFixed(3) : null) + ' 95% CI [' + c.lo.toFixed(3) + ', ' + c.hi.toFixed(3) + '] calibrated=' + c.calibrated);
  }
  console.log('wall: national ' + res.wall.national + '/8, wins ' + res.wall.wins + '/8, wave4 ' + res.wall.wave4 + '/8, wave5 ' + res.wall.wave5 + '/8, median survival ' + res.wall.medianSurvival + 'd');
  console.log('DIAG-GO: ' + res.diagGo);
  console.log('analysis: ' + outPath);
}

module.exports = { analyzeFile: analyzeFile, analyzeDir: analyzeDir, classifyServed: classifyServed, clopperPearson: clopperPearson, binomCdf: binomCdf, selftest: selftest };
