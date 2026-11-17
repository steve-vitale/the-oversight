// analyze-deathcleanup-b.js — analyzer for arm sim-deathcleanup-b (BUILD).
// Compares the CONTROL leg (pre-fix) and ARMED leg (post-fix) on identical
// seeds with the deadplan analyzer's frozen counts (reused, not modified):
// each leg is classified by the deadplan bar-3 rule (COSTLY iff any pool
// or slot sub-count is nonzero), then the prereg GO bars are judged:
//   bar 1: armed leg slot (c-i) holder-days 0 AND dead-holder census rows 0,
//          with winPlanStats.deathCleanups > 0 band-wide (hook fired);
//   bar 2: control leg reproduces the defect (slot holder-days > 0 OR
//          dead-holder census rows > 0);
//   bar 3: cost bars — launches ±2, wave-4 kills ±4, starvation deaths ±3,
//          median survival ±10d (armed vs control, band totals / medians).
// Plus the D3 drift smoke (vetparty-drift-check logic, adapted): the
// lever's earliest possible effect is the first villager/person death
// day, NOT the first v4seed day — any daily-fingerprint divergence
// BEFORE that day is substrate drift, not a lever effect.
// Bar 4 (proof green + panel) is judged outside this script; this script
// reports the wall numbers and the panel inputs for it.
// Usage:
//   node scripts/analyze-deathcleanup-b.js --control evidence/2026-11-17/perseed-deathcleanup-b-control --armed evidence/2026-11-17/perseed-deathcleanup-b-armed [--out evidence/2026-11-17/deathcleanup-b-analysis.json]
// Exits 0 iff bars 1, 2, 3 pass AND no pre-lever drift; prints the verdict.
'use strict';
const fs = require('fs');
const path = require('path');
const ANALYZE = require(path.join(__dirname, 'analyze-deadplan-b.js'));

function loadDir(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return /\.json$/.test(f); }).sort();
  return files.map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); });
}
function median(xs) {
  const s = (xs || []).slice().sort(function (a, b) { return a - b; });
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function launches(j) {
  return (j.v4departs || []).filter(function (d) { return d && d.result === 'launch'; }).length;
}
function starvationDeaths(j) {
  return (j.deaths || []).filter(function (d) {
    if (!d || (d.kind !== 'villager' && d.kind !== 'person')) return false;
    const c = String(d.cause || '').toLowerCase();
    return c.indexOf('starv') !== -1 || c.indexOf('hunger') !== -1;
  }).length;
}
function deathCleanups(j) {
  try { return ((j.winPlanStats || {}).deathCleanups) | 0; } catch (e) { return 0; }
}
function firstDeathDay(j) {
  let first = null;
  for (const d of (j.deaths || [])) {
    if (!d || (d.kind !== 'villager' && d.kind !== 'person')) continue;
    if (first == null || d.day < first) first = (d.day | 0);
  }
  return first;
}
// Daily fingerprint (vetparty-drift-check): waveKillLog, vets, roster
// dead flags, wave4Slain, ready4/ready5 readiness flags.
function fp(day) {
  const roster = (day.roster || []).map(function (r) { return r.vid + ':' + (r.dead ? 1 : 0); }).join(',');
  const wkl = (day.waveKillLog || []).map(function (e) { return (e.vid || e.killer || e.by || '?') + '@' + (e.w | 0) + ':' + (e.mid || e.id || '?'); }).join(',');
  return JSON.stringify({
    wkl: wkl,
    w4slain: day.wave4Slain,
    v3: (day.vetsW3 || {}).count, v4: (day.vetsW4 || {}).count,
    r4: day.ready4 && day.ready4.ready, r5: day.ready5 && day.ready5.ready,
    roster: roster,
  });
}
function driftSmoke(controlFiles, armedFiles) {
  const bySeed = {};
  for (const j of controlFiles) bySeed[j.seed] = bySeed[j.seed] || {};
  for (const j of controlFiles) bySeed[j.seed].control = j;
  for (const j of armedFiles) { bySeed[j.seed] = bySeed[j.seed] || {}; bySeed[j.seed].armed = j; }
  const perSeed = [];
  let drift = 0;
  for (const seed of Object.keys(bySeed).sort()) {
    const c = bySeed[seed].control, a = bySeed[seed].armed;
    if (!c || !a) { perSeed.push({ seed: Number(seed), firstLeverDay: null, firstDivDay: null, note: 'missing leg file' }); drift++; continue; }
    const firstLeverDay = firstDeathDay(c) != null && firstDeathDay(a) != null
      ? Math.min(firstDeathDay(c), firstDeathDay(a))
      : (firstDeathDay(c) != null ? firstDeathDay(c) : firstDeathDay(a));
    const cDays = (c.daily || []);
    const aDays = (a.daily || []);
    const aByDay = {};
    for (const d of aDays) aByDay[d.day] = d;
    let firstDivDay = null;
    for (const d of cDays) {
      const ad = aByDay[d.day];
      if (!ad) { firstDivDay = d.day; break; }
      if (fp(d) !== fp(ad)) { firstDivDay = d.day; break; }
    }
    const isDrift = firstDivDay != null && firstLeverDay != null && firstDivDay < firstLeverDay;
    if (isDrift) drift++;
    perSeed.push({ seed: Number(seed), firstLeverDay: firstLeverDay, firstDivDay: firstDivDay,
      drift: isDrift, note: firstDivDay == null ? 'IDENTICAL' : (isDrift ? 'DRIFT before lever day' : 'diverges on/after lever day') });
  }
  return { perSeed: perSeed, driftSeeds: drift };
}

function summarize(files) {
  const cls = ANALYZE.classify(files);
  const perSeed = files.map(function (j) {
    const one = ANALYZE.analyzeOne(j);
    return {
      seed: j.seed, gameDays: j.gameDays, endReason: j.endReason,
      standing: j.standing, scaleRank: j.scaleRank, won: !!j.won,
      maxWave: j.maxWave, deaths: (j.deaths || []).length,
      launches: launches(j), wave4Kills: one.wave4Kills, wave5Kills: one.wave5Kills,
      starvationDeaths: starvationDeaths(j), deathCleanups: deathCleanups(j),
      slotHolderDays: one.slot.holderDays, slotHolders: one.slot.holders.length,
      censusDead: one.linger.censusDead, censusTotal: one.linger.censusTotal,
      firstDeathDay: firstDeathDay(j),
    };
  });
  const totals = {
    launches: perSeed.reduce(function (a, s) { return a + s.launches; }, 0),
    wave4Kills: perSeed.reduce(function (a, s) { return a + s.wave4Kills; }, 0),
    wave5Kills: perSeed.reduce(function (a, s) { return a + s.wave5Kills; }, 0),
    starvationDeaths: perSeed.reduce(function (a, s) { return a + s.starvationDeaths; }, 0),
    deathCleanups: perSeed.reduce(function (a, s) { return a + s.deathCleanups; }, 0),
    slotHolderDays: perSeed.reduce(function (a, s) { return a + s.slotHolderDays; }, 0),
    censusDead: perSeed.reduce(function (a, s) { return a + s.censusDead; }, 0),
    censusTotal: perSeed.reduce(function (a, s) { return a + s.censusTotal; }, 0),
    medianSurvival: median(perSeed.map(function (s) { return s.gameDays; })),
    deaths: perSeed.reduce(function (a, s) { return a + s.deaths; }, 0),
  };
  return { classify: cls, perSeed: perSeed, totals: totals, wall: cls.leg.wall };
}

if (require.main === module) (function () {
  const args = process.argv.slice(2);
  function arg(name) {
    const i = args.indexOf(name);
    return (i !== -1 && args[i + 1]) ? args[i + 1] : null;
  }
  const controlDir = arg('--control'), armedDir = arg('--armed'), outPath = arg('--out');
  if (!controlDir || !armedDir) {
    console.error('DEATHCLEANUP STOP: --control and --armed dirs required.');
    process.exit(2);
  }
  const controlFiles = loadDir(controlDir);
  const armedFiles = loadDir(armedDir);
  if (controlFiles.length !== 8 || armedFiles.length !== 8) {
    console.error('DEATHCLEANUP STOP: expected 8+8 files, got control=' + controlFiles.length + ' armed=' + armedFiles.length + '.');
    process.exit(2);
  }
  const control = summarize(controlFiles);
  const armed = summarize(armedFiles);
  const drift = driftSmoke(controlFiles, armedFiles);

  const bar1 = armed.totals.slotHolderDays === 0 && armed.totals.censusDead === 0 && armed.totals.deathCleanups > 0;
  const bar2 = control.totals.slotHolderDays > 0 || control.totals.censusDead > 0;
  const dLaunches = armed.totals.launches - control.totals.launches;
  const dW4 = armed.totals.wave4Kills - control.totals.wave4Kills;
  const dStarv = armed.totals.starvationDeaths - control.totals.starvationDeaths;
  const dSurv = armed.totals.medianSurvival - control.totals.medianSurvival;
  const bar3 = Math.abs(dLaunches) <= 2 && Math.abs(dW4) <= 4 && Math.abs(dStarv) <= 3 && Math.abs(dSurv) <= 10;
  const driftClean = drift.driftSeeds === 0;
  const report = {
    arm: 'deathcleanup-b',
    bars: {
      bar1_armedClean: bar1,
      bar1_detail: { slotHolderDays: armed.totals.slotHolderDays, censusDead: armed.totals.censusDead,
        censusTotal: armed.totals.censusTotal, deathCleanups: armed.totals.deathCleanups,
        armedVerdict: armed.classify.verdict, armedPoolTotal: armed.classify.poolTotal,
        armedSlotTotal: armed.classify.slotTotal },
      bar2_controlReproduces: bar2,
      bar2_detail: { slotHolderDays: control.totals.slotHolderDays, censusDead: control.totals.censusDead,
        censusTotal: control.totals.censusTotal, controlVerdict: control.classify.verdict,
        controlPoolTotal: control.classify.poolTotal, controlSlotTotal: control.classify.slotTotal },
      bar3_noRegression: bar3,
      bar3_detail: { dLaunches: dLaunches, dWave4Kills: dW4, dStarvationDeaths: dStarv, dMedianSurvival: dSurv,
        control: { launches: control.totals.launches, wave4Kills: control.totals.wave4Kills,
          starvationDeaths: control.totals.starvationDeaths, medianSurvival: control.totals.medianSurvival },
        armed: { launches: armed.totals.launches, wave4Kills: armed.totals.wave4Kills,
          starvationDeaths: armed.totals.starvationDeaths, medianSurvival: armed.totals.medianSurvival } },
      driftClean: driftClean,
    },
    control: { wall: control.wall, totals: control.totals, perSeed: control.perSeed,
      classify: { verdict: control.classify.verdict, poolTotal: control.classify.poolTotal,
        slotTotal: control.classify.slotTotal, censusDeadTotal: control.classify.censusDeadTotal,
        censusTotal: control.classify.censusTotal, validityOk: control.classify.validityOk },
      perSeedFull: control.classify.leg.perSeed },
    armed: { wall: armed.wall, totals: armed.totals, perSeed: armed.perSeed,
      classify: { verdict: armed.classify.verdict, poolTotal: armed.classify.poolTotal,
        slotTotal: armed.classify.slotTotal, censusDeadTotal: armed.classify.censusDeadTotal,
        censusTotal: armed.classify.censusTotal, validityOk: armed.classify.validityOk },
      perSeedFull: armed.classify.leg.perSeed },
    drift: drift,
  };
  if (outPath) fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n');
  console.log('bar1 armed clean (slot 0, dead census 0, cleanups > 0): ' + bar1 +
    ' (slotDays=' + armed.totals.slotHolderDays + ' censusDead=' + armed.totals.censusDead +
    '/' + armed.totals.censusTotal + ' cleanups=' + armed.totals.deathCleanups + ')');
  console.log('bar2 control reproduces defect: ' + bar2 +
    ' (slotDays=' + control.totals.slotHolderDays + ' censusDead=' + control.totals.censusDead +
    '/' + control.totals.censusTotal + ' verdict=' + control.classify.verdict + ')');
  console.log('bar3 no regression: ' + bar3 +
    ' (dLaunches=' + dLaunches + ' dW4=' + dW4 + ' dStarv=' + dStarv + ' dSurv=' + dSurv + ')');
  console.log('drift clean (no divergence before first death day): ' + driftClean);
  for (const s of drift.perSeed) {
    console.log('  seed ' + s.seed + ': firstLeverDay=' + s.firstLeverDay + ' firstDivDay=' + s.firstDivDay + ' -> ' + s.note);
  }
  console.log('wall CONTROL: ' + JSON.stringify(control.wall));
  console.log('wall ARMED  : ' + JSON.stringify(armed.wall));
  const fail = !bar1 || !bar2 || !bar3 || !driftClean;
  if (fail) {
    console.log('ANALYZER FAIL: bar1=' + bar1 + ' bar2=' + bar2 + ' bar3=' + bar3 + ' driftClean=' + driftClean);
    process.exitCode = 1;
  }
})();

module.exports = { loadDir: loadDir, summarize: summarize, driftSmoke: driftSmoke,
  launches: launches, starvationDeaths: starvationDeaths, deathCleanups: deathCleanups,
  firstDeathDay: firstDeathDay };
