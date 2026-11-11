// preserve-analyze-20261110.js — preservation first-numbers analyzer
// (arm sim-preserve-a, run fleshout-20261110T2215Z).
// Reads per-seed JSONs from evidence/2026-11-10/perseed-preserve-a/,
// builds per-seed + pooled tables, checks neutrality (control vs
// neutral legs) and reconciliation (duty diff vs _haulcount tap; eat
// tele vs wraps; vanish vs draws), writes
// evidence/2026-11-10/preserve-summary-preserve-pilot.json.
// Usage: node scripts/preserve-analyze-20261110.js [glob-dir]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = process.argv[2] || path.join(REPO, 'evidence', '2026-11-10', 'perseed-preserve-a');
const OUT = path.join(REPO, 'evidence', '2026-11-10', 'preserve-summary-preserve-pilot.json');

function readSeeds(mode) {
  const files = fs.readdirSync(DIR).filter(function (f) { return f.indexOf('-preserve-pilot-' + mode + '.json') !== -1; }).sort();
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
  const mc = out.methodCalls || [];
  const dr = out.dutyResolutions || [];
  const ln = out.learns || [];
  const et = out.eats || [];
  const dw = out.draws || [];
  const dd = out.deeds || [];
  const dy = out.daily || [];
  const vn = out.vanishes || [];
  const s = {
    seed: out.seed, days: out.days, gameDays: out.gameDays,
    endReason: out.endReason, won: out.won, scaleRank: out.scaleRank,
    maxWave: out.maxWave, standing: out.standing,
    endPantryKcal: out.endPantryKcal, deaths: (out.deaths || []).length,
    instrumentErrors: (out.instrumentErrors || []).length,
    wrapLive: out.wrapLive || {},
  };
  // 1. preservation events by method + caller path.
  s.methodCallsByMethod = byKey(mc, function (r) { return r.method; });
  s.methodCallsByPath = byKey(mc, function (r) { return (r.method || '?') + ':' + (r.path || '?'); });
  s.methodCallsUnclassified = mc.filter(function (r) { return r.path === 'unknown' || r.path === 'other'; }).length;
  s.kcalInByMethod = byKcal(mc, function (r) { return r.method; }, function (r) { return r.kcalIn; });
  s.kcalOutByMethod = byKcal(mc, function (r) { return r.method; }, function (r) { return r.kcalOut; });
  s.shelfGainedByMethod = byKcal(mc, function (r) { return r.method; }, function (r) { return r.shelfGained; });
  s.rescuedKcalByMethod = byKcal(mc, function (r) { return r.method; }, function (r) { return r.rescuedKcal; });
  s.rescuedKcal = sum(mc, function (r) { return r.rescuedKcal; });
  s.spoiledRefusedN = sum(mc, function (r) { return r.refusedN; });
  s.spoiledRefusedKcal = sum(mc, function (r) { return r.refusedKcal; });
  s.pemmicanBars = sum(mc, function (r) { return r.bars || 0; });
  s.pemmicanBarKcal = sum(mc, function (r) { return r.barKcal || 0; });
  s.pemmicanSets = sum(mc, function (r) { return (r.sets || []).length; });
  s.smokeConvertedN = sum(mc.filter(function (r) { return r.method === 'preserveFood'; }), function (r) { return r.convertedN || 0; });
  s.renderConvertedN = sum(mc.filter(function (r) { return r.method === 'renderFat'; }), function (r) { return r.convertedN || 0; });
  s.specialistCalls = mc.filter(function (r) { return r.method === 'askSpecialist'; }).map(function (r) {
    return { day: r.day, task: r.task, occ: r.specialistOcc, skill: r.specialistSkill };
  });
  s.specialistPreserverCalls = s.specialistCalls.filter(function (r) { return r.task === 'preserver'; }).length;
  // 2. duty racks (exact diff) + tap cross-check.
  s.dutyResolutions = dr.length;
  s.dutyBatchesDiff = sum(dr, function (r) { return r.batches; });
  s.dutyKcalDiff = sum(dr, function (r) { return r.kcalOut; });
  s.dutyKcalInDiff = sum(dr, function (r) { return r.kcalIn; });
  s.dutyShelfGained = sum(dr, function (r) { return r.shelfGained; });
  s.dutyRescuedKcal = sum(dr, function (r) { return r.rescuedKcal; });
  s.dutyTapBatches = sum(dr, function (r) { return r.tapBatches; });
  s.dutyTapKcal = sum(dr, function (r) { return r.tapKcal; });
  s.dutyTapMismatches = dr.filter(function (r) { return !r.tapAgrees; }).length;
  s.dutyTapMismatchRows = dr.filter(function (r) { return !r.tapAgrees; }).map(function (r) {
    return { day: r.day, vid: r.vid, batches: r.batches, tapBatches: r.tapBatches, kcalOut: r.kcalOut, tapKcal: r.tapKcal };
  });
  s.dutyRacksFullResolutions = dr.filter(function (r) { return r.racksFull; }).length;
  s.dutyRacksFullBlockedKcal = sum(dr.filter(function (r) { return r.racksFull; }), function (r) { return r.aboutToRotBefore; });
  s.dutyLeftToRotKcal = sum(dr, function (r) { return r.leftToRot; });
  s.dutyAboutToRotBefore = sum(dr, function (r) { return r.aboutToRotBefore; });
  // Smoked-vs-dried label. The engine renames every converted item
  // (game.js duty convert: name + ' (smoked)' if /fish/i, else ' (dried)').
  // The instrument records that post name as postName (new corpora); older
  // corpora carry only the pre-conversion name, so derive the label from
  // the engine's own rule on the pre name — the same rule the split-matcher
  // already verified live on every split conversion (suffix match + kcal
  // consistency). A recorded suffix always wins over the derivation.
  s.dutySmokedNames = byKey(dr.reduce(function (a, r) { return a.concat(r.converted || []); }, []),
    function (c) {
      const post = c.postName || '';
      if (post.indexOf('(smoked)') !== -1) return 'smoked';
      if (post.indexOf('(dried)') !== -1) return 'dried';
      const pre = c.name || '';
      if (pre.indexOf('(smoked)') !== -1) return 'smoked';
      if (pre.indexOf('(dried)') !== -1) return 'dried';
      if (!pre) return 'other-name';
      return /fish/i.test(pre) ? 'smoked' : 'dried';
    });
  s.dutySplitConversions = dr.reduce(function (a, r) { return a + (r.converted || []).filter(function (c) { return c.split; }).length; }, 0);
  s.dutySplitFallbacks = dr.reduce(function (a, r) { return a + (r.converted || []).filter(function (c) { return c.split && c.splitMatch === 'name-fallback'; }).length; }, 0);
  s.dutyMaxTapKcalDiff = Math.max.apply(null, dr.map(function (r) { return Math.abs(r.tapKcalDiff || 0); }).concat([0]));
  // Snapshot tap totals (independent of the wrap): must equal the diff sums.
  s.snapDutyBatches = sum(dy, function (r) { return r.dutyBatches; });
  s.snapDutyKcal = sum(dy, function (r) { return r.dutyKcal; });
  // 3. learns.
  s.learns = ln.map(function (r) { return { day: r.day, tech: r.tech, source: r.source, learned: r.learned }; });
  s.learnsByTechSource = byKey(ln, function (r) { return (r.tech || '?') + ':' + (r.source || '?'); });
  // 4. eating. tele-eat rows are the engine's own totals (reconciliation
  // only); eat-purge rows are spoiled purges (not eating).
  const eatRows = et.filter(function (r) { return r.via === 'eatOne' || r.via === 'eatStashOne' || r.via === 'eat'; });
  s.eatenKcalByState = byKcal(eatRows, function (r) { return r.foodState || 'unknown'; }, function (r) { return r.ateKcal; });
  s.eatenKcalByVia = byKcal(eatRows, function (r) { return r.via; }, function (r) { return r.ateKcal; });
  s.eatenKcalTotal = sum(eatRows, function (r) { return r.ateKcal; });
  s.eatenPreservedKcal = sum(eatRows.filter(function (r) { return r.foodState === 'preserved'; }), function (r) { return r.ateKcal; });
  s.eatenRenderedKcal = sum(eatRows.filter(function (r) { return r.foodState === 'rendered'; }), function (r) { return r.ateKcal; });
  s.eatenPemmicanKcal = sum(eatRows.filter(function (r) { return r.foodState === 'pemmican'; }), function (r) { return r.ateKcal; });
  s.teleEatTotal = sum(et.filter(function (r) { return r.via === 'tele-eat'; }), function (r) { return r.ateKcal; });
  s.purgedKcal = sum(et.filter(function (r) { return r.via === 'eat-purge'; }), function (r) { return r.purgedKcal; });
  // 5. village meal draws.
  s.drawTakenByCook = byKcal(dw, function (r) { return r.cook ? 'cook:true' : 'cook:false'; }, function (r) { return r.taken; });
  s.drawTakenByState = {};
  for (const r of dw) {
    for (const k of Object.keys(r.byState || {})) s.drawTakenByState[k] = (s.drawTakenByState[k] || 0) + r.byState[k];
  }
  s.drawPreservedKcal = s.drawTakenByState.preserved || 0;
  s.drawRenderedKcal = s.drawTakenByState.rendered || 0;
  s.drawPemmicanKcal = s.drawTakenByState.pemmican || 0;
  s.drawCookedKcal = sum(dw, function (r) { return r.cookedKcal; });
  s.drawCount = dw.length;
  // 6. deeds.
  s.deedsByDeedWho = byKey(dd, function (r) { return (r.deed || '?') + ':' + (r.who || '?'); });
  s.preservingDeeds = dd.length;
  // 7. daily: cook-duty holders, foodXp, preserved stock series, vanishes.
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
  s.foodXpMax = {};
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
    // MAX-REACHED (roster churn hides gains: a holder who earns XP and
    // then dies/leaves vanishes from the last snapshot, so first-vs-last
    // delta reads 0. Max across all snapshots is the honest measure.)
    for (const snap of dy) {
      for (const vid of Object.keys(snap.foodXp || {})) {
        for (const task of ['cook', 'preserver', 'butcher']) {
          const v = (snap.foodXp[vid] || {})[task] || 0;
          const k = vid + ':' + task;
          if (v > 0 && v > (s.foodXpMax[k] || 0)) s.foodXpMax[k] = v;
        }
      }
    }
  }
  // Preserved stock series (pantry + pack), from the daily snapshots.
  function stateKcal(snap, where, state) {
    try { return (((snap || {})[where] || {})[state] || {}).kcal || 0; } catch (e) { return 0; }
  }
  s.preservedStockPantrySeries = dy.map(function (r) { return { day: r.day, preserved: stateKcal(r, 'pantry', 'preserved'), rendered: stateKcal(r, 'pantry', 'rendered'), pemmican: stateKcal(r, 'pantry', 'pemmican') }; });
  s.preservedStockPackSeries = dy.map(function (r) { return { day: r.day, preserved: stateKcal(r, 'pack', 'preserved'), rendered: stateKcal(r, 'pack', 'rendered'), pemmican: stateKcal(r, 'pack', 'pemmican') }; });
  s.peakPreservedPantryKcal = Math.max.apply(null, s.preservedStockPantrySeries.map(function (r) { return r.preserved; }).concat([0]));
  s.peakRenderedPantryKcal = Math.max.apply(null, s.preservedStockPantrySeries.map(function (r) { return r.rendered; }).concat([0]));
  s.peakPemmicanPantryKcal = Math.max.apply(null, s.preservedStockPantrySeries.map(function (r) { return r.pemmican; }).concat([0]));
  s.endPreservedPantryKcal = dy.length ? stateKcal(dy[dy.length - 1], 'pantry', 'preserved') : 0;
  s.endRenderedPantryKcal = dy.length ? stateKcal(dy[dy.length - 1], 'pantry', 'rendered') : 0;
  s.endPemmicanPantryKcal = dy.length ? stateKcal(dy[dy.length - 1], 'pantry', 'pemmican') : 0;
  s.endPreservedPackKcal = dy.length ? stateKcal(dy[dy.length - 1], 'pack', 'preserved') : 0;
  s.endRenderedPackKcal = dy.length ? stateKcal(dy[dy.length - 1], 'pack', 'rendered') : 0;
  s.endPemmicanPackKcal = dy.length ? stateKcal(dy[dy.length - 1], 'pack', 'pemmican') : 0;
  // Preserved share of the pantry at end (and the peak-day share).
  s.endPreservedShare = s.endPantryKcal > 0 ? ((s.endPreservedPantryKcal + s.endRenderedPantryKcal + s.endPemmicanPantryKcal) / s.endPantryKcal) : null;
  // Vanishes: spoiled-lost preserved kcal (object-tracked, draw-reconciled).
  s.vanishSpoiledLostKcal = sum(vn.filter(function (r) { return r.spoiledLost; }), function (r) { return r.kcal; });
  s.vanishSpoiledLostN = vn.filter(function (r) { return r.spoiledLost; }).length;
  s.vanishSpoiledLostByState = byKcal(vn.filter(function (r) { return r.spoiledLost; }), function (r) { return r.state; }, function (r) { return r.kcal; });
  s.vanishUnexplainedKcal = sum(vn.filter(function (r) { return !r.spoiledLost; }), function (r) { return r.kcal; });
  s.vanishUnexplainedN = vn.filter(function (r) { return !r.spoiledLost; }).length;
  s.vanishDrawnKcal = sum(dy, function (r) { return r.vanishPresDrawnKcal; });
  s.snapshots = dy.length;
  s.preserveSays = (out.preserveSays || []).length;
  s.racksFullSayLines = (out.preserveSays || []).filter(function (r) { return /racks are already full/i.test(r.line || ''); }).length;
  s.shouldHaveSmokedLines = (out.preserveSays || []).filter(function (r) { return /Should've smoked/i.test(r.line || ''); }).length;
  return s;
}

function pool(per) {
  const p = {};
  const numKeys = ['days', 'gameDays', 'deaths', 'instrumentErrors', 'methodCallsUnclassified',
    'rescuedKcal', 'spoiledRefusedN', 'spoiledRefusedKcal', 'pemmicanBars', 'pemmicanBarKcal', 'pemmicanSets',
    'smokeConvertedN', 'renderConvertedN', 'specialistPreserverCalls',
    'dutyResolutions', 'dutyBatchesDiff', 'dutyKcalDiff', 'dutyKcalInDiff', 'dutyShelfGained',
    'dutyRescuedKcal', 'dutyTapBatches', 'dutyTapKcal', 'dutyTapMismatches',
    'dutyRacksFullResolutions', 'dutyRacksFullBlockedKcal', 'dutyLeftToRotKcal', 'dutyAboutToRotBefore',
    'dutySplitConversions', 'snapDutyBatches', 'snapDutyKcal',
    'dutySplitFallbacks',
    'eatenKcalTotal', 'eatenPreservedKcal', 'eatenRenderedKcal', 'eatenPemmicanKcal',
    'teleEatTotal', 'purgedKcal',
    'drawPreservedKcal', 'drawRenderedKcal', 'drawPemmicanKcal', 'drawCookedKcal', 'drawCount',
    'preservingDeeds', 'cookDutyDays',
    'vanishSpoiledLostKcal', 'vanishSpoiledLostN', 'vanishUnexplainedKcal', 'vanishUnexplainedN', 'vanishDrawnKcal',
    'snapshots', 'preserveSays', 'racksFullSayLines', 'shouldHaveSmokedLines'];
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
  p.methodCallsByMethod = merge('methodCallsByMethod');
  p.methodCallsByPath = merge('methodCallsByPath');
  p.kcalInByMethod = merge('kcalInByMethod');
  p.kcalOutByMethod = merge('kcalOutByMethod');
  p.shelfGainedByMethod = merge('shelfGainedByMethod');
  p.rescuedKcalByMethod = merge('rescuedKcalByMethod');
  p.learnsByTechSource = merge('learnsByTechSource');
  p.eatenKcalByState = merge('eatenKcalByState');
  p.eatenKcalByVia = merge('eatenKcalByVia');
  p.drawTakenByCook = merge('drawTakenByCook');
  p.drawTakenByState = merge('drawTakenByState');
  p.deedsByDeedWho = merge('deedsByDeedWho');
  p.dutySmokedNames = merge('dutySmokedNames');
  p.vanishSpoiledLostByState = merge('vanishSpoiledLostByState');
  p.cookDutyHolders = {};
  for (const s of per) for (const k of Object.keys(s.cookDutyHolders || {})) {
    const e = p.cookDutyHolders[k] || (p.cookDutyHolders[k] = { days: 0, preserver: s.cookDutyHolders[k].preserver });
    e.days += s.cookDutyHolders[k].days;
  }
  p.foodXpDelta = merge('foodXpDelta');
  p.foodXpMax = merge('foodXpMax');
  // Eat reconciliation: tele total vs wrap-attributed total.
  p.eatRecon = { teleTotal: p.teleEatTotalTotal, wrapTotal: p.eatenKcalTotalTotal };
  // Duty reconciliation: diff batches/kcal vs tap batches/kcal vs snapshot tap.
  p.dutyRecon = {
    diffBatches: p.dutyBatchesDiffTotal, tapBatches: p.dutyTapBatchesTotal, snapBatches: p.snapDutyBatchesTotal,
    diffKcal: p.dutyKcalDiffTotal, tapKcal: p.dutyTapKcalTotal, snapKcal: p.snapDutyKcalTotal,
    mismatches: p.dutyTapMismatchesTotal,
  };
  // Stock peaks (max over seeds of the per-seed peaks).
  p.peakPreservedPantryKcal = Math.max.apply(null, per.map(function (s) { return s.peakPreservedPantryKcal; }).concat([0]));
  p.peakRenderedPantryKcal = Math.max.apply(null, per.map(function (s) { return s.peakRenderedPantryKcal; }).concat([0]));
  p.peakPemmicanPantryKcal = Math.max.apply(null, per.map(function (s) { return s.peakPemmicanPantryKcal; }).concat([0]));
  return p;
}

function main() {
  const control = readSeeds('control');
  const neutral = readSeeds('neutral');
  if (!control.length) { console.error('PRESERVE-ANALYZE STOP: no control per-seed files in ' + DIR); process.exit(2); }
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
  const ALL_WRAPS = ['preserveFood', 'renderFat', 'makePemmican', 'askSpecialist', 'resolveOneAssignment', 'learnTechnique', 'eatOne', 'eatStashOne', 'eat', 'tele', 'pantryDraw', 'noteDeed', 'creditDeed'];
  const wrapDead = ALL_WRAPS.filter(function (w) { return !wrapLive[w]; });
  const go = {
    noUnclassifiedCalls: pooled.methodCallsUnclassifiedTotal === 0,
    dutyTapAgrees: pooled.dutyTapMismatchesTotal === 0,
    zeroInstrumentErrors: pooled.instrumentErrorsTotal === 0,
    neutrality: neut.compared === control.length && neut.matched === neut.compared,
    completeCapture: control.length === 8,
  };
  go.all = go.noUnclassifiedCalls && go.dutyTapAgrees && go.zeroInstrumentErrors && go.neutrality && go.completeCapture;
  const summary = {
    arm: 'preserve', run: 'preserve-pilot', band: '180209-180216',
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
    methods: pooled.methodCallsByMethod,
    methodsByPath: pooled.methodCallsByPath,
    kcalIn: pooled.kcalInByMethod, kcalOut: pooled.kcalOutByMethod,
    shelfGained: pooled.shelfGainedByMethod,
    rescuedByMethod: pooled.rescuedKcalByMethod,
    duty: pooled.dutyRecon,
    dutyRacksFull: pooled.dutyRacksFullResolutionsTotal,
    dutyLeftToRot: pooled.dutyLeftToRotKcalTotal,
    eatenByState: pooled.eatenKcalByState,
    drawnByState: pooled.drawTakenByState,
    vanishLost: pooled.vanishSpoiledLostKcalTotal,
    vanishUnexplained: pooled.vanishUnexplainedKcalTotal,
    learns: pooled.learnsByTechSource,
    neutrality: neut.matched + '/' + neut.compared,
    wrapDead: wrapDead, errors: pooled.instrumentErrorsTotal,
    go: go.all,
  }, null, 2));
  console.log('wrote ' + path.relative(REPO, OUT));
}

if (require.main === module) main();

module.exports = { perSeed: perSeed, pool: pool, readSeeds: readSeeds };
