// gardenb-analyze-20261110.js — gardening first-numbers analyzer
// (arm sim-garden-b, run fleshout-loop-b-20261111T0025Z).
// Reads per-seed JSONs from evidence/2026-11-10/perseed-garden-b/,
// builds per-seed + pooled tables, checks neutrality (control vs
// neutral legs) and reconciliation, writes
// evidence/2026-11-10/garden-summary-garden-pilot.json.
// Usage: node scripts/gardenb-analyze-20261110.js [glob-dir]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = process.argv[2] || path.join(REPO, 'evidence', '2026-11-10', 'perseed-garden-b');
const OUT = path.join(REPO, 'evidence', '2026-11-10', 'garden-summary-garden-pilot.json');

function readSeeds(mode) {
  const files = fs.readdirSync(DIR).filter(function (f) { return f.indexOf('-garden-pilot-' + mode + '.json') !== -1; }).sort();
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
  const hv = out.harvests || [];
  const ac = out.actions || [];
  const tc = out.teaches || [];
  const pr = out.preps || [];
  const et = out.eats || [];
  const dr = out.draws || [];
  const dd = out.deeds || [];
  const dy = out.daily || [];
  const ge = out.gardenEvents || {};
  const inf = out.inflows || [];
  const s = {
    seed: out.seed, days: out.days, gameDays: out.gameDays,
    endReason: out.endReason, won: out.won, scaleRank: out.scaleRank,
    maxWave: out.maxWave, standing: out.standing,
    endPantryKcal: out.endPantryKcal, deaths: (out.deaths || []).length,
    instrumentErrors: (out.instrumentErrors || []).length,
    wrapLive: out.wrapLive || {},
  };
  // 1. Harvests by crop x path; nominal kcal by crop/path/origin.
  s.harvestsByCrop = byKey(hv, function (r) { return r.pid || '?'; });
  s.harvestsByPath = byKey(hv, function (r) { return r.path; });
  s.harvestsByCropPath = byKey(hv, function (r) { return (r.pid || '?') + ':' + r.path; });
  s.harvestOther = hv.filter(function (r) { return r.path === 'other'; }).length;
  s.harvestKcalByCrop = byKcal(hv, function (r) { return r.pid || '?'; }, function (r) { return r.kcalNominal; });
  s.harvestKcalByPath = byKcal(hv, function (r) { return r.path; }, function (r) { return r.kcalNominal; });
  s.harvestKcalTotal = sum(hv, function (r) { return r.kcalNominal; });
  s.harvestUnitsByCrop = byKcal(hv, function (r) { return r.pid || '?'; }, function (r) { return r.units; });
  s.harvestOriginKcal = {};
  for (const r of hv) {
    for (const k of Object.keys(r.origin || {})) {
      s.harvestOriginKcal[k] = (s.harvestOriginKcal[k] || 0) + (r.kcalNominal || 0) * (r.origin[k] || 0);
    }
  }
  s.harvestLegacyKcal = sum(hv.filter(function (r) { return r.legacy; }), function (r) { return r.kcalNominal; });
  s.harvestWeedyKcal = sum(hv.filter(function (r) { return (r.weeds || 0) >= 3; }), function (r) { return r.kcalNominal; });
  s.harvestWeedyCount = hv.filter(function (r) { return (r.weeds || 0) >= 3; }).length;
  // 2. Actions by action (+ path).
  s.actionsByAction = byKey(ac, function (r) { return r.action; });
  s.actionsByActionPath = byKey(ac, function (r) { return (r.action || '?') + ':' + (r.path || '?'); });
  s.makesOk = ac.filter(function (r) { return r.action === 'makePlot' && r.ok; }).length;
  s.sowsPlayer = ac.filter(function (r) { return r.action === 'sowPlot'; });
  s.sowsPlayerByCrop = byKey(s.sowsPlayer, function (r) { return r.pid || '?'; });
  s.sowsPlayerGuided = s.sowsPlayer.filter(function (r) { return r.guided; }).length;
  s.sowsPlayerOk = s.sowsPlayer.filter(function (r) { return r.ok; }).length;
  s.tendsPlayer = ac.filter(function (r) { return r.action === 'tendGarden'; }).length;
  s.tendsNpc = ac.filter(function (r) { return r.action === 'gardenMaintain'; }).length;
  s.tendsNpcPlots = sum(ac.filter(function (r) { return r.action === 'gardenMaintain'; }), function (r) { return r.plotsChanged; });
  s.reclaims = ac.filter(function (r) { return r.action === 'reclaimGarden'; });
  s.reclaimsOk = s.reclaims.filter(function (r) { return r.ok; }).length;
  s.cultivates = ac.filter(function (r) { return r.action === 'cultivateGarden'; });
  s.cultivatesBySource = byKey(s.cultivates, function (r) { return (r.source || '?') + ':' + (r.vid === null ? 'player' : 'npc'); });
  s.cultivateBeds = sum(s.cultivates, function (r) { return r.bedsAffected; });
  s.harvestGardenCalls = ac.filter(function (r) { return r.action === 'harvestGarden'; }).length;
  // Garden-capture events (duty/keeper/assigns/npc sows).
  s.resolutions = (ge.resolutions || []).length;
  s.resolutionsThrottled = (ge.resolutions || []).filter(function (r) { return r.throttle; }).length;
  s.assigns = (ge.assigns || []).length;
  s.keeperTurns = (ge.keeperTurns || []).length;
  s.keeperSets = (ge.keeperSets || []).length;
  s.npcSows = (ge.npcSows || []).length;
  s.npcSowsByCrop = byKey((ge.npcSows || []), function (r) {
    const m = (r.msg || '').match(/sowed (.+?) in the empty plot/);
    return m ? m[1] : '?';
  });
  s.gardenInflows = (ge.gardenInflows || []);
  s.gardenInflowKcal = sum(s.gardenInflows, function (r) { return r.kcal; });
  s.gardenInflowByDoor = byKcal(s.gardenInflows, function (r) { return r.door; }, function (r) { return r.kcal; });
  // 3. Who gardens: duty holders, keeper, sowers, cultivators.
  s.gardenDutyHolders = {};
  for (const r of dy) {
    for (const h of (r.gardenDuty || [])) {
      const k = (h.vid || '?') + '|' + (h.occ || '?');
      const e = s.gardenDutyHolders[k] || (s.gardenDutyHolders[k] = { days: 0 });
      e.days++;
    }
  }
  s.gardenDutyDays = dy.filter(function (r) { return (r.gardenDuty || []).length > 0; }).length;
  s.keeperDays = {};
  for (const r of dy) {
    if (r.keeper) s.keeperDays[r.keeper] = (s.keeperDays[r.keeper] || 0) + 1;
  }
  s.dutyHoldersFromResolutions = byKey((ge.resolutions || []), function (r) { return r.vid || '?'; });
  // 4. Skill + teaching.
  s.teachesByPath = byKey(tc, function (r) { return r.path; });
  s.teachesByOutcome = byKey(tc, function (r) { return r.outcome; });
  s.teaches = tc.map(function (r) { return { day: r.day, teacher: r.teacher, plant: r.plant, outcome: r.outcome, path: r.path }; });
  s.prepsByMethod = byKey(pr, function (r) { return r.method; });
  // Practice reps/steps: max-reached per gardener (roster churn hides
  // gains in first-vs-last, same lesson as cookfirst foodXp).
  s.practiceMax = {};
  s.practiceStepsEnd = {};
  s.knownMax = {};
  if (dy.length) {
    for (const snap of dy) {
      for (const vid of Object.keys(snap.gardeners || {})) {
        const g = snap.gardeners[vid];
        if ((g.reps || 0) > (s.practiceMax[vid] || 0)) s.practiceMax[vid] = g.reps;
        if ((g.known || 0) > (s.knownMax[vid] || 0)) s.knownMax[vid] = g.known;
      }
    }
    const last = dy[dy.length - 1];
    for (const vid of Object.keys(last.gardeners || {})) {
      s.practiceStepsEnd[vid] = last.gardeners[vid].steps;
    }
  }
  s.scholarPlantsEnd = (dy.length ? (dy[dy.length - 1].scholarPlants || {}) : {});
  s.scholarPlantsStart = (dy.length ? (dy[0].scholarPlants || {}) : {});
  s.scholarMagicEnd = (dy.length ? (dy[dy.length - 1].scholarMagic || []) : []);
  // foodXp gardener-task absence check: any foodXp key 'gardener'/'garden'?
  s.foodXpGardenerKeys = 0;
  if (dy.length) {
    for (const snap of dy) {
      for (const vid of Object.keys(snap.foodXp || {})) {
        for (const task of Object.keys(snap.foodXp[vid] || {})) {
          if (task === 'gardener' || task === 'garden') s.foodXpGardenerKeys++;
        }
      }
    }
  }
  // 5. Garden stock over time (daily series kept in corpus; analyzer
  // reports endpoints + peaks).
  s.pantryGardenEnd = (dy.length ? ((dy[dy.length - 1].pantryGarden || {}).total || 0) : 0);
  s.pantryGardenPeak = 0; s.packGardenPeak = 0; s.bedsPeak = 0; s.plantedPeak = 0; s.ripePeak = 0; s.deadPeak = 0;
  s.pantryGardenDays = 0; s.packGardenDays = 0;
  s.plotDays = { beds: 0, planted: 0, ripe: 0, ripeSafe: 0, ripeUnsafe: 0, unplanted: 0, dead: 0 };
  for (const snap of dy) {
    const pg = (snap.pantryGarden || {}).total || 0;
    const kg = (snap.packGarden || {}).total || 0;
    if (pg > s.pantryGardenPeak) s.pantryGardenPeak = pg;
    if (kg > s.packGardenPeak) s.packGardenPeak = kg;
    if (pg > 0) s.pantryGardenDays++;
    if (kg > 0) s.packGardenDays++;
    const pl = snap.plots || {};
    if ((pl.beds || 0) > s.bedsPeak) s.bedsPeak = pl.beds;
    if ((pl.planted || 0) > s.plantedPeak) s.plantedPeak = pl.planted;
    if ((pl.ripe || 0) > s.ripePeak) s.ripePeak = pl.ripe;
    if ((pl.dead || 0) > s.deadPeak) s.deadPeak = pl.dead;
    s.plotDays.beds += (pl.beds || 0);
    s.plotDays.planted += (pl.planted || 0);
    s.plotDays.ripe += (pl.ripe || 0);
    s.plotDays.ripeSafe += (pl.ripeSafe || 0);
    s.plotDays.ripeUnsafe += (pl.ripeUnsafe || 0);
    s.plotDays.unplanted += (pl.unplanted || 0);
    s.plotDays.dead += (pl.dead || 0);
  }
  // 6. Garden-vs-forage share (pantry inflow by name).
  s.inflowByName = {};
  for (const rec of inf) {
    if ((rec.door === 'pantryAdd' && !rec.added) || (rec.kcal || 0) <= 0) continue;
    s.inflowByName[rec.name || '?'] = (s.inflowByName[rec.name || '?'] || 0) + (rec.kcal || 0);
  }
  s.inflowTotal = Object.keys(s.inflowByName).reduce(function (a, k) { return a + s.inflowByName[k]; }, 0);
  s.inflowGarden = (s.inflowByName['Garden harvest'] || 0);
  // Deposit-door gardenShares inflows carry plant names, not the
  // 'Garden harvest' label — count them as garden too.
  s.inflowGardenDeposit = 0;
  for (const rec of (ge.gardenInflows || [])) {
    if (rec.door === 'deposit') s.inflowGardenDeposit += (rec.kcal || 0);
  }
  s.inflowForage = (s.inflowByName['Foraged food'] || 0);
  // Eating: scholar garden kcal + village-meal garden kcal.
  const eatRows = et.filter(function (r) { return r.via === 'eatOne' || r.via === 'eat'; });
  s.eatenGardenKcal = sum(eatRows.filter(function (r) { return r.garden; }), function (r) { return r.ateKcal; });
  s.eatenTotalKcal = sum(eatRows, function (r) { return r.ateKcal; });
  s.teleEatTotal = sum(et.filter(function (r) { return r.via === 'tele-eat'; }), function (r) { return r.ateKcal; });
  s.drawGardenKcal = sum(dr, function (r) { return r.gardenKcal; });
  s.drawTakenTotal = sum(dr, function (r) { return r.taken; });
  s.drawCount = dr.length;
  // 7. deeds.
  s.deedsByDeedWho = byKey(dd, function (r) { return (r.deed || '?') + ':' + (r.who || '?'); });
  s.deedsGarden = dd.length;
  s.gardenSays = (out.gardenSays || []).length;
  s.snapshots = dy.length;
  return s;
}

function pool(per) {
  const p = {};
  const numKeys = ['days', 'gameDays', 'deaths', 'instrumentErrors', 'harvestOther',
    'harvestKcalTotal', 'harvestLegacyKcal', 'harvestWeedyKcal', 'harvestWeedyCount',
    'makesOk', 'sowsPlayerGuided', 'sowsPlayerOk', 'tendsPlayer', 'tendsNpc',
    'tendsNpcPlots', 'reclaimsOk', 'cultivateBeds', 'harvestGardenCalls',
    'resolutions', 'resolutionsThrottled', 'assigns', 'keeperTurns', 'keeperSets',
    'npcSows', 'gardenInflowKcal', 'inflowGardenDeposit', 'gardenDutyDays',
    'foodXpGardenerKeys', 'pantryGardenEnd', 'pantryGardenPeak', 'packGardenPeak',
    'bedsPeak', 'plantedPeak', 'ripePeak', 'deadPeak', 'pantryGardenDays',
    'packGardenDays', 'inflowTotal', 'inflowGarden', 'inflowForage',
    'eatenGardenKcal', 'eatenTotalKcal', 'teleEatTotal', 'drawGardenKcal',
    'drawTakenTotal', 'drawCount', 'deedsGarden', 'gardenSays', 'snapshots'];
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
  p.harvestsByCrop = merge('harvestsByCrop');
  p.harvestsByPath = merge('harvestsByPath');
  p.harvestsByCropPath = merge('harvestsByCropPath');
  p.harvestKcalByCrop = merge('harvestKcalByCrop');
  p.harvestKcalByPath = merge('harvestKcalByPath');
  p.harvestUnitsByCrop = merge('harvestUnitsByCrop');
  p.harvestOriginKcal = merge('harvestOriginKcal');
  p.actionsByAction = merge('actionsByAction');
  p.actionsByActionPath = merge('actionsByActionPath');
  p.sowsPlayerByCrop = merge('sowsPlayerByCrop');
  p.cultivatesBySource = merge('cultivatesBySource');
  p.npcSowsByCrop = merge('npcSowsByCrop');
  p.gardenInflowByDoor = merge('gardenInflowByDoor');
  p.inflowByName = merge('inflowByName');
  p.teachesByPath = merge('teachesByPath');
  p.teachesByOutcome = merge('teachesByOutcome');
  p.prepsByMethod = merge('prepsByMethod');
  p.deedsByDeedWho = merge('deedsByDeedWho');
  p.plotDays = {};
  for (const s of per) for (const k of Object.keys(s.plotDays || {})) p.plotDays[k] = (p.plotDays[k] || 0) + s.plotDays[k];
  p.gardenDutyHolders = {};
  for (const s of per) for (const k of Object.keys(s.gardenDutyHolders || {})) {
    const e = p.gardenDutyHolders[k] || (p.gardenDutyHolders[k] = { days: 0 });
    e.days += s.gardenDutyHolders[k].days;
  }
  p.keeperDays = merge('keeperDays');
  p.dutyHoldersFromResolutions = merge('dutyHoldersFromResolutions');
  p.practiceMax = merge('practiceMax');
  p.knownMax = merge('knownMax');
  // Eat reconciliation: tele total vs wrap-attributed total.
  p.eatRecon = { teleTotal: p.teleEatTotalTotal, wrapTotal: p.eatenTotalKcalTotal };
  return p;
}

function main() {
  const control = readSeeds('control');
  const neutral = readSeeds('neutral');
  if (!control.length) { console.error('GARDENB-ANALYZE STOP: no control per-seed files in ' + DIR); process.exit(2); }
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
  const ALL_WRAPS = ['gardenHarvestTaken', 'harvestGarden', 'tendGarden', 'makePlot', 'sowPlot',
    'cultivateGarden', 'reclaimGarden', 'gardenMaintain', 'teachPlant', 'cookFood', 'shellNuts',
    'eatOne', 'eat', 'tele', 'pantryDraw', 'noteDeed', 'creditDeed',
    // reused captures' wraps (garden-capture + inflow-capture):
    'assignTask', 'gardenKeeperTurn', 'resolveOneAssignment', 'villagerSowPlot',
    'setGardenKeeper', 'stockPantry', 'depositPantryPieces', 'pantryAdd', 'say'];
  const wrapDead = ALL_WRAPS.filter(function (w) { return !wrapLive[w]; });
  const go = {
    noOtherHarvests: pooled.harvestOtherTotal === 0,
    zeroInstrumentErrors: pooled.instrumentErrorsTotal === 0,
    neutrality: neut.compared === control.length && neut.matched === neut.compared,
    completeCapture: control.length === 8,
  };
  go.all = go.noOtherHarvests && go.zeroInstrumentErrors && go.neutrality && go.completeCapture;
  const summary = {
    arm: 'gardenb', run: 'garden-pilot', band: '180217-180224',
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
    harvests: pooled.harvestsByPath,
    harvestKcalByCrop: pooled.harvestKcalByCrop,
    harvestKcalByPath: pooled.harvestKcalByPath,
    actions: pooled.actionsByAction,
    resolutions: { total: pooled.resolutionsTotal, throttled: pooled.resolutionsThrottledTotal },
    inflowByName: pooled.inflowByName,
    eatenGarden: pooled.eatenGardenKcalTotal, drawnGarden: pooled.drawGardenKcalTotal,
    teleVsWrap: pooled.eatRecon,
    teaches: pooled.teachesByPath,
    neutrality: neut.matched + '/' + neut.compared,
    wrapDead: wrapDead, errors: pooled.instrumentErrorsTotal,
    go: go.all,
  }, null, 2));
  console.log('wrote ' + path.relative(REPO, OUT));
}

if (require.main === module) main();

module.exports = { perSeed: perSeed, pool: pool, readSeeds: readSeeds };
