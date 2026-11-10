// cookfirst-analyze-20261110.js — cooking first-numbers analyzer
// (arm sim-cookfirst-a, run fleshout-20261110T1915Z).
// Reads per-seed JSONs from evidence/2026-11-10/perseed-cookfirst-a/,
// builds per-seed + pooled tables, checks neutrality (control vs
// neutral legs) and reconciliation, writes
// evidence/2026-11-10/cookfirst-summary-cookfirst-pilot.json.
// Usage: node scripts/cookfirst-analyze-20261110.js [glob-dir]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = process.argv[2] || path.join(REPO, 'evidence', '2026-11-10', 'perseed-cookfirst-a');
const OUT = path.join(REPO, 'evidence', '2026-11-10', 'cookfirst-summary-cookfirst-pilot.json');

function readSeeds(mode) {
  const files = fs.readdirSync(DIR).filter(function (f) { return f.indexOf('-cookfirst-pilot-' + mode + '.json') !== -1; }).sort();
  return files.map(function (f) { return JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); });
}
function sum(a, f) { return a.reduce(function (t, x) { return t + (f(x) || 0); }, 0); }
function byKey(rows, keyFn) {
  const out = {};
  for (const r of rows) { const k = keyFn(r); out[k] = (out[k] || 0) + 1; }
  return out;
}
function byKcal(rows, keyFn, valFn) {
  const out = {};
  for (const r of rows) { const k = keyFn(r); out[k] = (out[k] || 0) + (valFn(r) || 0); }
  return out;
}
function median(ns) {
  if (!ns.length) return null;
  const s = ns.slice().sort(function (a, b) { return a - b; });
  return s[Math.floor(s.length / 2)];
}

function perSeed(out) {
  const tr = out.transforms || [];
  const mc = out.methodCalls || [];
  const ln = out.learns || [];
  const et = out.eats || [];
  const dr = out.draws || [];
  const dd = out.deeds || [];
  const dy = out.daily || [];
  const s = {
    seed: out.seed, days: out.days, gameDays: out.gameDays,
    endReason: out.endReason, won: out.won, scaleRank: out.scaleRank,
    maxWave: out.maxWave, standing: out.standing,
    endPantryKcal: out.endPantryKcal, deaths: (out.deaths || []).length,
    instrumentErrors: (out.instrumentErrors || []).length,
    wrapLive: out.wrapLive || {},
  };
  // 1. transforms by path x outcome; kcal by path.
  s.transformsByPath = byKey(tr, function (r) { return r.path; });
  s.transformsByPathOutcome = byKey(tr, function (r) { return r.path + ':' + (r.outcome || '?'); });
  s.transformKcalByPath = byKcal(tr, function (r) { return r.path; }, function (r) { return r.cookedTotal; });
  s.transformRawKcalByPath = byKcal(tr, function (r) { return r.path; }, function (r) { return r.rawTotal; });
  s.transformKcalByKind = byKcal(tr, function (r) { return r.foodKind || '?'; }, function (r) { return r.cookedTotal; });
  s.transformOther = tr.filter(function (r) { return r.path === 'other'; }).length;
  s.transformKnows = { knows: tr.filter(function (r) { return r.knows; }).length, blind: tr.filter(function (r) { return !r.knows; }).length };
  // 2. method calls by method; spoiled refusals; rescued kcal; pemmican.
  s.methodCallsByMethod = byKey(mc, function (r) { return r.method; });
  s.methodCallsByPath = byKey(mc, function (r) { return (r.method || '?') + ':' + (r.path || '?'); });
  s.spoiledRefused = mc.filter(function (r) { return r.spoiledRefused; }).length;
  s.rescuedKcal = sum(mc, function (r) { return r.rescuedKcal; });
  s.rescuedKcalByMethod = byKcal(mc, function (r) { return r.method; }, function (r) { return r.rescuedKcal; });
  s.pemmicanBars = sum(mc, function (r) { return r.bars || 0; });
  s.pemmicanBarKcal = sum(mc, function (r) { return r.barKcal || 0; });
  s.specialistCalls = mc.filter(function (r) { return r.method === 'askSpecialist'; }).map(function (r) {
    return { day: r.day, task: r.task, occ: r.specialistOcc, skill: r.specialistSkill };
  });
  // 3. learns.
  s.learns = ln.map(function (r) { return { day: r.day, tech: r.tech, source: r.source, learned: r.learned }; });
  s.learnsByTechSource = byKey(ln, function (r) { return (r.tech || '?') + ':' + (r.source || '?'); });
  // 4. eating. tele-eat rows are the engine's own totals (reconciliation
  // only); eat-purge rows are spoiled purges (not eating).
  const eatRows = et.filter(function (r) { return r.via === 'eatOne' || r.via === 'eatStashOne' || r.via === 'eat'; });
  s.eatenKcalByState = byKcal(eatRows, function (r) { return r.foodState || 'unknown'; }, function (r) { return r.ateKcal; });
  s.eatenKcalByVia = byKcal(eatRows, function (r) { return r.via; }, function (r) { return r.ateKcal; });
  s.eatenKcalTotal = sum(eatRows, function (r) { return r.ateKcal; });
  s.teleEatTotal = sum(et.filter(function (r) { return r.via === 'tele-eat'; }), function (r) { return r.ateKcal; });
  s.purgedKcal = sum(et.filter(function (r) { return r.via === 'eat-purge'; }), function (r) { return r.purgedKcal; });
  // cooked = any rung beyond raw/cleaned: cooked, smoked, preserved,
  // rendered, pemmican. Raw = raw/cleaned/none/unknown.
  const COOKED_STATES = { cooked: 1, smoked: 1, preserved: 1, rendered: 1, pemmican: 1 };
  s.eatenCookedKcal = 0; s.eatenRawKcal = 0;
  for (const r of eatRows) {
    if (COOKED_STATES[r.foodState]) s.eatenCookedKcal += (r.ateKcal || 0);
    else s.eatenRawKcal += (r.ateKcal || 0);
  }
  // 5. village meal draws.
  s.drawTakenByCook = byKcal(dr, function (r) { return r.cook ? 'cook:true' : 'cook:false'; }, function (r) { return r.taken; });
  s.drawTakenByState = {};
  for (const r of dr) {
    for (const k of Object.keys(r.byState || {})) s.drawTakenByState[k] = (s.drawTakenByState[k] || 0) + r.byState[k];
  }
  s.drawCookedKcal = sum(dr, function (r) { return r.cookedKcal; });
  s.drawCount = dr.length;
  // 6. deeds.
  s.deedsByDeedWho = byKey(dd, function (r) { return (r.deed || '?') + ':' + (r.who || '?'); });
  // 7. daily: duty batches/kcal, cook-duty holder days, foodXp deltas.
  s.dutyBatches = sum(dy, function (r) { return r.dutyBatches; });
  s.dutyKcal = sum(dy, function (r) { return r.dutyKcal; });
  s.cookDutyDays = dy.filter(function (r) { return (r.cookDuty || []).length > 0; }).length;
  s.cookDutyHolders = {};
  for (const r of dy) {
    for (const h of (r.cookDuty || [])) {
      const k = (h.vid || '?') + '|' + (h.occ || '?');
      const e = s.cookDutyHolders[k] || (s.cookDutyHolders[k] = { days: 0, preserver: h.preserver });
      e.days++;
    }
  }
  s.foodXpEnd = {};
  if (dy.length) {
    const last = dy[dy.length - 1];
    for (const vid of Object.keys(last.foodXp || {})) s.foodXpEnd[vid] = last.foodXp[vid];
  }
  s.foodXpDelta = {};
  if (dy.length) {
    const first = dy[0], last = dy[dy.length - 1];
    const vids = new Set(Object.keys(first.foodXp || {}).concat(Object.keys(last.foodXp || {})));
    for (const vid of vids) {
      for (const task of ['cook', 'preserver', 'butcher']) {
        const a = ((first.foodXp || {})[vid] || {})[task] || 0;
        const b = ((last.foodXp || {})[vid] || {})[task] || 0;
        if (b - a !== 0) s.foodXpDelta[vid + ':' + task] = b - a;
      }
    }
  }
  s.spoiledPresentKcalDays = sum(dy, function (r) { return r.spoiledPresentKcal; });
  s.snapshots = dy.length;
  // say scenes: first cook line per day-bucket is kept in the corpus file;
  // the analyzer reports counts only.
  s.cookSays = (out.cookSays || []).length;
  return s;
}

function pool(per) {
  const p = {};
  const numKeys = ['days', 'gameDays', 'deaths', 'instrumentErrors', 'transformOther',
    'spoiledRefused', 'rescuedKcal', 'pemmicanBars', 'pemmicanBarKcal',
    'eatenKcalTotal', 'teleEatTotal', 'purgedKcal', 'eatenCookedKcal', 'eatenRawKcal',
    'drawCookedKcal', 'drawCount', 'dutyBatches', 'dutyKcal', 'cookDutyDays',
    'spoiledPresentKcalDays', 'snapshots', 'cookSays'];
  for (const k of numKeys) p[k + 'Total'] = sum(per, function (s) { return s[k]; });
  p.daysMedian = median(per.map(function (s) { return s.days; }));
  p.wins = per.filter(function (s) { return s.won; }).length;
  p.scaleRanks = byKey(per, function (s) { return s.scaleRank || '?'; });
  p.maxWaveMax = Math.max.apply(null, per.map(function (s) { return s.maxWave || 1; }));
  p.standingMedian = median(per.map(function (s) { return (typeof s.standing === 'number' ? s.standing : 0); }));
  const merge = function (key) {
    const o = {};
    for (const s of per) for (const k of Object.keys(s[key] || {})) o[k] = (o[k] || 0) + s[key][k];
    return o;
  };
  p.transformsByPath = merge('transformsByPath');
  p.transformsByPathOutcome = merge('transformsByPathOutcome');
  p.transformKcalByPath = merge('transformKcalByPath');
  p.transformRawKcalByPath = merge('transformRawKcalByPath');
  p.transformKcalByKind = merge('transformKcalByKind');
  p.transformKnows = merge('transformKnows');
  p.methodCallsByMethod = merge('methodCallsByMethod');
  p.methodCallsByPath = merge('methodCallsByPath');
  p.rescuedKcalByMethod = merge('rescuedKcalByMethod');
  p.learnsByTechSource = merge('learnsByTechSource');
  p.eatenKcalByState = merge('eatenKcalByState');
  p.eatenKcalByVia = merge('eatenKcalByVia');
  p.drawTakenByCook = merge('drawTakenByCook');
  p.drawTakenByState = merge('drawTakenByState');
  p.deedsByDeedWho = merge('deedsByDeedWho');
  p.cookDutyHolders = {};
  for (const s of per) for (const k of Object.keys(s.cookDutyHolders || {})) {
    const e = p.cookDutyHolders[k] || (p.cookDutyHolders[k] = { days: 0, preserver: s.cookDutyHolders[k].preserver });
    e.days += s.cookDutyHolders[k].days;
  }
  p.foodXpDelta = merge('foodXpDelta');
  // eat reconciliation: tele total vs wrap-attributed total.
  p.eatRecon = { teleTotal: p.teleEatTotalTotal, wrapTotal: p.eatenKcalTotalTotal };
  return p;
}

function main() {
  const control = readSeeds('control');
  const neutral = readSeeds('neutral');
  if (!control.length) { console.error('COOKFIRST-ANALYZE STOP: no control per-seed files in ' + DIR); process.exit(2); }
  const per = control.map(perSeed);
  const pooled = pool(per);
  // Neutrality: days + endPantryKcal + death count, per seed.
  const neut = { compared: 0, matched: 0, mismatches: [] };
  const neutBySeed = {};
  for (const n of neutral) neutBySeed[n.seed] = n;
  for (const c of control) {
    const n = neutBySeed[c.seed];
    if (!n) continue;
    neut.compared++;
    const ok = (c.days === n.days) && (c.endPantryKcal === n.endPantryKcal) && ((c.deaths || []).length === (n.deaths || []).length);
    if (ok) neut.matched++;
    else neut.mismatches.push({ seed: c.seed, control: { days: c.days, endPantryKcal: c.endPantryKcal, deaths: (c.deaths || []).length }, neutral: { days: n.days, endPantryKcal: n.endPantryKcal, deaths: (n.deaths || []).length } });
  }
  // Wrap-liveness across the pilot.
  const wrapLive = {};
  for (const c of control) for (const k of Object.keys(c.wrapLive || {})) wrapLive[k] = true;
  const ALL_WRAPS = ['cookTransform', 'cookFood', 'cookAll', 'cleanCarcass', 'preserveFood', 'renderFat', 'makePemmican', 'askSpecialist', 'learnTechnique', 'eatOne', 'eatStashOne', 'eat', 'tele', 'pantryDraw', 'noteDeed', 'creditDeed'];
  const wrapDead = ALL_WRAPS.filter(function (w) { return !wrapLive[w]; });
  const go = {
    noOtherTransforms: pooled.transformOtherTotal === 0,
    zeroInstrumentErrors: pooled.instrumentErrorsTotal === 0,
    neutrality: neut.compared === control.length && neut.matched === neut.compared,
    completeCapture: control.length === 8,
  };
  go.all = go.noOtherTransforms && go.zeroInstrumentErrors && go.neutrality && go.completeCapture;
  const summary = {
    arm: 'cookfirst', run: 'cookfirst-pilot', band: '180201-180208',
    seeds: control.map(function (c) { return c.seed; }),
    neutralSeeds: neutral.map(function (n) { return n.seed; }),
    perSeed: per, pooled: pooled,
    neutrality: neut, wrapLive: wrapLive, wrapDead: wrapDead,
    go: go,
  };
  fs.writeFileSync(OUT, JSON.stringify(summary, null, 2) + '\n');
  console.log(JSON.stringify({
    seeds: control.length, neutral: neutral.length,
    daysMedian: pooled.daysMedian, wins: pooled.wins, maxWaveMax: pooled.maxWaveMax,
    transforms: pooled.transformsByPath,
    transformKcal: pooled.transformKcalByPath,
    methods: pooled.methodCallsByMethod,
    eatenByState: pooled.eatenKcalByState,
    eatenCooked: pooled.eatenCookedKcalTotal, eatenRaw: pooled.eatenRawKcalTotal,
    teleVsWrap: pooled.eatRecon,
    duty: { batches: pooled.dutyBatchesTotal, kcal: pooled.dutyKcalTotal },
    learns: pooled.learnsByTechSource,
    neutrality: neut.matched + '/' + neut.compared,
    wrapDead: wrapDead, errors: pooled.instrumentErrorsTotal,
    go: go.all,
  }, null, 2));
  console.log('wrote ' + path.relative(REPO, OUT));
}

if (require.main === module) main();

module.exports = { perSeed: perSeed, pool: pool, readSeeds: readSeeds };
