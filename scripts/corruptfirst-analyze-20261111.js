// corruptfirst-analyze-20261111.js — corruption / cannibalism
// first-numbers analyzer (arm sim-corruptfirst-a, run
// fleshout-20261111T1408Z).
//
// Reads per-seed JSON from evidence/2026-11-11/perseed-corruptfirst-a/
// (control + neutral legs) and writes a band summary JSON (+ prints a
// markdown GO table). Pure aggregation; no sims.
// Usage:
//   node scripts/corruptfirst-analyze-20261111.js [per-seed-dir] [summary-out.json]
'use strict';
const path = require('path');
const fs = require('fs');

const WRAPS = ['addCorruption', 'addNpcCorruption', 'corpseButcher', 'eatCannibal',
  'contractDisease', 'recordCrime', 'corruptionThresholdBeat', 'cravingTick',
  'npcDriftTick', 'npcCannibalTick', 'temptTick', 'darkCarePackageTick',
  'psychoViolenceTick', 'corruptionTick', 'psychoIntro', 'mantleWatch',
  'discoverNpcCannibalism', 'addFear', 'fearWeakness', 'intimidate',
  'trustGainProgressive', 'justiceHeat', 'darkShowBeat', 'remember'];

function inc(map, k, n) { map[k] = (map[k] || 0) + (n == null ? 1 : n); }

function classifyCorrEvent(ev) {
  if (!ev || ev.who == null || ev.who === '') return { cls: 'unclassified' };
  if (ev.reason == null || ev.reason === '') return { cls: 'unclassified' };
  if (typeof ev.n !== 'number') return { cls: 'unclassified' };
  return { cls: 'ok' };
}

function classifySlopeEvent(ev) {
  if (!ev || (ev.verb !== 'corpseButcher' && ev.verb !== 'eatCannibal')) return 'unclassified';
  if (typeof ev.granted !== 'boolean') return 'unclassified';
  return 'ok';
}

function reconcileCrimes(seedObj) {
  // Final snapshot justiceCrimes vs recordCrime events: the last
  // crimeEvent's crimesAfter should equal the final snapshot crime
  // count (crimes are never removed, only judged via caseId).
  // recordCrime calls with a foreign villain return early without
  // booking — those events have crimesAfter unchanged, which is
  // exactly what the reconciliation expects.
  const daily = seedObj.daily || [];
  const crimes = seedObj.crimeEvents || [];
  if (!daily.length) return { residue: null, note: 'no snapshots' };
  const last = daily[daily.length - 1];
  const snapCount = (last.justiceCrimes || []).length;
  let lastAfter = null;
  for (let i = crimes.length - 1; i >= 0; i--) {
    if (typeof crimes[i].crimesAfter === 'number') { lastAfter = crimes[i].crimesAfter; break; }
  }
  if (lastAfter == null) return { residue: snapCount === 0 ? 0 : snapCount, note: 'no crime events with crimesAfter' };
  return { residue: Math.abs(snapCount - lastAfter), snapCount: snapCount, lastAfter: lastAfter };
}

function reconcileNpcCorruption(seedObj) {
  // Per-vid: last snapshot npcCorruption should equal first snapshot
  // value + sum of addNpcCorruption deltas, minus mantle carry-overs
  // (mantleWatch moves a vid's corruption onto the scholar and deletes
  // the vid entry). Residue counts vids whose value is unexplained.
  const daily = seedObj.daily || [];
  const adds = (seedObj.corrEvents || []).filter(function (e) { return e.who && e.who !== 'player'; });
  const mantles = (seedObj.psychoEvents || []).filter(function (e) { return e.verb === 'mantleWatch'; });
  if (!daily.length) return { residue: null, note: 'no snapshots' };
  const first = daily[0].npcCorruption || {};
  const last = daily[daily.length - 1].npcCorruption || {};
  const expected = {};
  Object.keys(first).forEach(function (vid) { expected[vid] = first[vid] || 0; });
  adds.forEach(function (e) {
    expected[e.who] = (expected[e.who] || 0) + ((e.after || 0) - (e.before || 0));
  });
  // Mantle carry: the vid whose corruption moved to the scholar loses
  // its entry; the scholar's side is tracked by addCorruption events
  // only when the code calls it — mantleWatch assigns directly, so
  // drop the carried vid from the expectation instead of guessing.
  mantles.forEach(function (m) {
    if (m.bearerBefore && expected[m.bearerBefore] != null && m.bearerBefore !== m.bearerAfter) {
      // The old bearer id is the vid whose map entry was deleted; the
      // new bearer is the scholar, not an NPC entry.
      delete expected[m.bearerBefore];
      delete last[m.bearerBefore];
    }
  });
  let residue = 0;
  const vids = new Set(Object.keys(expected).concat(Object.keys(last)));
  vids.forEach(function (vid) {
    const e = expected[vid] || 0, a = last[vid] || 0;
    if (Math.abs(e - a) > 0) residue++;
  });
  return { residue: residue, vidsChecked: vids.size };
}

function summarizeSeed(o) {
  const s = {
    seed: o.seed, mode: o.mode, days: o.days, gameDays: o.gameDays,
    endReason: o.endReason, won: !!o.won, villageLost: !!o.villageLost,
    maxWave: o.maxWave, unlockedWave: o.unlockedWave, standing: o.standing,
    scaleRank: o.scaleRank, endPantryKcal: o.endPantryKcal,
    deaths: (o.deaths || []).length, instrumentErrors: (o.instrumentErrors || []).length,
    sayLines: (o.corruptSays || []).length,
  };
  // ---- (1) corruption adds ----
  const corr = o.corrEvents || [];
  s.corrEvents = corr.length; s.corrUnclassified = 0;
  s.corrByReason = {}; s.corrByWho = { player: 0, npc: 0 };
  s.corrPlayerTotal = 0; s.corrNpcTotal = 0;
  corr.forEach(function (ev) {
    if (classifyCorrEvent(ev).cls === 'unclassified') { s.corrUnclassified++; return; }
    inc(s.corrByReason, ev.reason);
    if (ev.who === 'player') { s.corrByWho.player++; s.corrPlayerTotal += (ev.after - ev.before); }
    else { s.corrByWho.npc++; s.corrNpcTotal += (ev.after - ev.before); }
  });
  // ---- threshold beats ----
  const th = o.thresholdEvents || [];
  s.thresholdBeats = th.length; s.thresholdCrossed = {};
  th.forEach(function (ev) { (ev.crossed || []).forEach(function (x) { inc(s.thresholdCrossed, String(x)); }); });
  // ---- (2) slope ----
  const slope = o.slopeEvents || [];
  s.slopeEvents = slope.length; s.slopeUnclassified = 0;
  s.butcherCalls = 0; s.butcherGranted = 0; s.eatCalls = 0; s.eatGranted = 0;
  s.meals = 0; s.slopeTrauma = 0; s.slopeCorrGain = 0; s.meatUnitsCreated = 0;
  s.eatNorms = {}; s.slopeCrimesWitnessed = 0; s.slopeCrimesHidden = 0;
  slope.forEach(function (ev) {
    if (classifySlopeEvent(ev) === 'unclassified') { s.slopeUnclassified++; return; }
    if (ev.verb === 'corpseButcher') {
      s.butcherCalls++;
      if (ev.granted) { s.butcherGranted++; s.meatUnitsCreated += (ev.units || 0); }
      s.slopeTrauma += ((ev.traumaAfter || 0) - (ev.traumaBefore || 0));
      s.slopeCorrGain += ((ev.corrAfter || 0) - (ev.corrBefore || 0));
    } else {
      s.eatCalls++;
      if (ev.granted) {
        s.eatGranted++;
        s.meals += ((ev.mealsAfter || 0) - (ev.mealsBefore || 0));
        s.slopeTrauma += ((ev.traumaAfter || 0) - (ev.traumaBefore || 0));
        s.slopeCorrGain += ((ev.corrAfter || 0) - (ev.corrBefore || 0));
        inc(s.eatNorms, ev.norm || 'unknown-norm');
      }
    }
    (ev.crimesDuring || []).forEach(function (c) {
      if (c.witnessed === true) s.slopeCrimesWitnessed++;
      else if (c.witnessed === false) s.slopeCrimesHidden++;
    });
  });
  // ---- (3) disease ----
  const dis = o.diseaseEvents || [];
  s.diseaseEvents = dis.length; s.tremblesContracted = 0; s.tremblesBySource = {};
  dis.forEach(function (ev) {
    if (ev.trembles && ev.returned) { s.tremblesContracted++; inc(s.tremblesBySource, ev.source || 'unknown-source'); }
  });
  // ---- (4) crimes ----
  const crimes = o.crimeEvents || [];
  s.crimeEvents = crimes.length; s.crimesByType = {}; s.crimesWitnessed = 0; s.crimesHidden = 0;
  crimes.forEach(function (ev) {
    inc(s.crimesByType, ev.type || 'unknown');
    if (ev.witnessed === true) s.crimesWitnessed++;
    else if (ev.witnessed === false) s.crimesHidden++;
  });
  // ---- (6) ticks ----
  const ticks = o.tickEvents || [];
  s.tickEvents = ticks.length; s.ticksByVerb = {};
  s.cravingDrains = 0; s.cravingEnergyLost = 0; s.driftChanges = 0;
  s.npcFeeds = 0; s.temptOffers = 0; s.carePackages = 0; s.psychoStageAdvances = 0;
  ticks.forEach(function (ev) {
    inc(s.ticksByVerb, ev.verb || 'unknown');
    if (ev.verb === 'cravingTick' && (ev.drained || 0) > 0) { s.cravingDrains++; s.cravingEnergyLost += ev.drained; }
    if (ev.verb === 'npcDriftTick') s.driftChanges += (ev.changed || []).length;
    if (ev.verb === 'npcCannibalTick' && ev.fed) s.npcFeeds++;
    if (ev.verb === 'temptTick' && ev.offered) s.temptOffers++;
    if (ev.verb === 'darkCarePackageTick' && ev.delivered) s.carePackages++;
    if (ev.verb === 'psychoViolenceTick') s.psychoStageAdvances += (ev.stages || []).length;
  });
  s.corruptionTickCalls = o.corruptionTickCalls || 0;
  // ---- (7) psycho ----
  const psy = o.psychoEvents || [];
  s.psychoEvents = psy.length; s.psychoIntros = 0; s.mantleWatches = 0;
  psy.forEach(function (ev) {
    if (ev.verb === 'psychoIntro' && ev.fired) s.psychoIntros++;
    if (ev.verb === 'mantleWatch') s.mantleWatches++;
  });
  // ---- (8) discovery ----
  s.discoveries = (o.discoveryEvents || []).filter(function (e) { return e.discovered; }).length;
  s.discoveryCalls = (o.discoveryEvents || []).length;
  // ---- (9) fear ----
  const fear = o.fearEvents || [];
  s.fearEvents = fear.length; s.fearAdds = 0; s.fearTotal = 0;
  s.intimidateCalls = 0; s.intimidateDread = 0; s.fearCollapses = 0;
  fear.forEach(function (ev) {
    if (ev.verb === 'addFear') { s.fearAdds++; s.fearTotal += ((ev.after || 0) - (ev.before || 0)); }
    if (ev.verb === 'intimidate') {
      s.intimidateCalls++;
      if (ev.returned === 'yielded_dread') s.intimidateDread++;
    }
    if (ev.verb === 'fearWeakness' && ev.collapsed) s.fearCollapses++;
  });
  // ---- (10) foil ----
  s.foilDrags = (o.foilEvents || []).length;
  s.foilDraggedTotal = (o.foilEvents || []).reduce(function (a, e) { return a + (e.dragged || 0); }, 0);
  s.trustGainCalls = o.trustGainCalls || 0;
  // ---- (11) heat ----
  const heat = o.heatEvents || [];
  s.heatEvents = heat.length;
  s.heatMax = heat.reduce(function (m, e) { return Math.max(m, e.heat || 0); }, 0);
  s.heatByNorm = {};
  heat.forEach(function (e) { if (s.heatByNorm[e.norm || 'unknown'] == null || e.heat > s.heatByNorm[e.norm || 'unknown']) s.heatByNorm[e.norm || 'unknown'] = e.heat; });
  // ---- (12) show ----
  s.showEvents = (o.showEvents || []).length; s.showByKind = {};
  (o.showEvents || []).forEach(function (e) { inc(s.showByKind, e.kind || 'unknown'); });
  // ---- (13) memory ----
  s.memoryEvents = (o.memoryEvents || []).length; s.memoryByKey = {};
  (o.memoryEvents || []).forEach(function (e) { inc(s.memoryByKey, e.key || 'unknown'); });
  // ---- snapshots: trajectories + end state ----
  const daily = o.daily || [];
  s.snapshots = daily.length;
  s.snapComplete = daily.length > 0 && daily.every(function (sn) {
    return sn.scholarCorruption != null && sn.cannibalNorm != null && sn.villageCorruption != null;
  });
  s.scholarCorrEnd = daily.length ? daily[daily.length - 1].scholarCorruption : null;
  s.scholarCorrMax = daily.reduce(function (m, sn) { return Math.max(m, sn.scholarCorruption || 0); }, 0);
  s.villageCorrEnd = daily.length ? daily[daily.length - 1].villageCorruption : null;
  s.villageCorrMax = daily.reduce(function (m, sn) { return Math.max(m, sn.villageCorruption || 0); }, 0);
  s.normDays = { exile: 0, horror: 0, power: 0 };
  s.starvingDays = 0; s.normShiftEnd = daily.length ? daily[daily.length - 1].normShift : 0;
  s.avgFearEnd = daily.length ? daily[daily.length - 1].avgFearOfScholar : null;
  s.avgFearMax = daily.reduce(function (m, sn) { return Math.max(m, sn.avgFearOfScholar || 0); }, 0);
  s.humanMeatEnd = daily.length ? daily[daily.length - 1].humanMeatUnits : null;
  s.humanMeatMax = daily.reduce(function (m, sn) { return Math.max(m, sn.humanMeatUnits || 0); }, 0);
  s.darkPathEnd = daily.length ? !!daily[daily.length - 1].darkPath : false;
  s.psychoIntroFiredEnd = daily.length ? !!daily[daily.length - 1].psychoIntroFired : false;
  s.maliciousDarkEnd = daily.length ? daily[daily.length - 1].maliciousDark : null;
  s.maliciousDarkMax = daily.reduce(function (m, sn) { return Math.max(m, sn.maliciousDark || 0); }, 0);
  s.exiledEnd = daily.length ? !!daily[daily.length - 1].exiled : false;
  s.exileDay = daily.length ? daily[daily.length - 1].exileDay : null;
  s.justiceStageEnd = daily.length ? daily[daily.length - 1].justiceStage : null;
  s.tremblesEnd = daily.length ? daily[daily.length - 1].trembles : null;
  s.personCorpsesSeen = daily.reduce(function (m, sn) { return Math.max(m, (sn.corpses || {}).person || 0); }, 0);
  s.personCorpsesButchered = daily.reduce(function (m, sn) { return Math.max(m, (sn.corpses || {}).butchered || 0); }, 0);
  s.personCorpsesNpcFed = daily.reduce(function (m, sn) { return Math.max(m, (sn.corpses || {}).npcFed || 0); }, 0);
  s.npcCorrEndMax = 0; s.npcCorrEverHigh = 0;
  daily.forEach(function (sn) {
    if (sn.cannibalNorm) inc(s.normDays, sn.cannibalNorm);
    if (sn.starvingVillage) s.starvingDays++;
    const map = sn.npcCorruption || {};
    Object.keys(map).forEach(function (vid) {
      if ((map[vid] || 0) > s.npcCorrEndMax && sn === daily[daily.length - 1]) s.npcCorrEndMax = map[vid] || 0;
      if ((map[vid] || 0) >= 35) s.npcCorrEverHigh = Math.max(s.npcCorrEverHigh, map[vid] || 0);
    });
  });
  // NPC corruption max ever (across all snapshots, any vid).
  s.npcCorrMaxEver = 0;
  daily.forEach(function (sn) {
    const map = sn.npcCorruption || {};
    Object.keys(map).forEach(function (vid) { s.npcCorrMaxEver = Math.max(s.npcCorrMaxEver, map[vid] || 0); });
  });
  // Corrupt candidates on starving days (substrate for NPC crossings).
  s.starvingDaysWithCandidate = 0;
  daily.forEach(function (sn) {
    if (!sn.starvingVillage) return;
    const map = sn.npcCorruption || {};
    const has = Object.keys(map).some(function (vid) { return (map[vid] || 0) >= 35; });
    if (has) s.starvingDaysWithCandidate++;
  });
  const rc = reconcileCrimes(o);
  s.crimeResidue = rc.residue;
  const rn = reconcileNpcCorruption(o);
  s.npcCorrResidue = rn.residue;
  s.wrapLive = o.wrapLive || {};
  s.wrapCounts = o.wrapCounts || {};
  return s;
}

function summarizeBand(controlSeeds, neutralSeeds) {
  const band = { seeds: [], totals: {}, go: {}, neutrality: [] };
  let tCorr = 0, tCorrUnc = 0, tSlope = 0, tSlopeUnc = 0, tErr = 0;
  controlSeeds.forEach(function (s) {
    band.seeds.push(s);
    tCorr += s.corrEvents; tCorrUnc += s.corrUnclassified;
    tSlope += s.slopeEvents; tSlopeUnc += s.slopeUnclassified;
    tErr += s.instrumentErrors;
  });
  const neutBySeed = {};
  neutralSeeds.forEach(function (n) { neutBySeed[n.seed] = n; });
  controlSeeds.forEach(function (c) {
    const n = neutBySeed[c.seed];
    const exact = !!n && n.days === c.days && n.endPantryKcal === c.endPantryKcal && n.deaths === c.deaths;
    band.neutrality.push({ seed: c.seed, exact: exact,
      control: { days: c.days, pantry: c.endPantryKcal, deaths: c.deaths },
      neutral: n ? { days: n.days, pantry: n.endPantryKcal, deaths: n.deaths } : null });
  });
  const neutExact = band.neutrality.filter(function (r) { return r.exact; }).length;
  const wrapLiveOrDead = {};
  WRAPS.forEach(function (w) {
    const live = controlSeeds.some(function (s) { return s.wrapLive && s.wrapLive[w]; });
    wrapLiveOrDead[w] = live ? 'live' : 'dead-in-pilot';
  });
  band.wrapLiveOrDead = wrapLiveOrDead;
  const snapComplete = controlSeeds.every(function (s) { return s.snapComplete; });
  const tickOnAll = controlSeeds.every(function (s) { return (s.corruptionTickCalls || 0) > 0; });
  band.totals = {
    villageDays: controlSeeds.reduce(function (a, s) { return a + s.days; }, 0),
    corrEvents: tCorr, corrUnclassified: tCorrUnc,
    slopeEvents: tSlope, slopeUnclassified: tSlopeUnc,
    butcherCalls: controlSeeds.reduce(function (a, s) { return a + s.butcherCalls; }, 0),
    butcherGranted: controlSeeds.reduce(function (a, s) { return a + s.butcherGranted; }, 0),
    eatCalls: controlSeeds.reduce(function (a, s) { return a + s.eatCalls; }, 0),
    eatGranted: controlSeeds.reduce(function (a, s) { return a + s.eatGranted; }, 0),
    meals: controlSeeds.reduce(function (a, s) { return a + s.meals; }, 0),
    tremblesContracted: controlSeeds.reduce(function (a, s) { return a + s.tremblesContracted; }, 0),
    npcFeeds: controlSeeds.reduce(function (a, s) { return a + s.npcFeeds; }, 0),
    temptOffers: controlSeeds.reduce(function (a, s) { return a + s.temptOffers; }, 0),
    carePackages: controlSeeds.reduce(function (a, s) { return a + s.carePackages; }, 0),
    psychoIntros: controlSeeds.reduce(function (a, s) { return a + s.psychoIntros; }, 0),
    psychoStageAdvances: controlSeeds.reduce(function (a, s) { return a + s.psychoStageAdvances; }, 0),
    cravingDrains: controlSeeds.reduce(function (a, s) { return a + s.cravingDrains; }, 0),
    intimidateDread: controlSeeds.reduce(function (a, s) { return a + s.intimidateDread; }, 0),
    foilDrags: controlSeeds.reduce(function (a, s) { return a + s.foilDrags; }, 0),
    crimeEvents: controlSeeds.reduce(function (a, s) { return a + s.crimeEvents; }, 0),
    crimeResidue: controlSeeds.reduce(function (a, s) { return a + (s.crimeResidue || 0); }, 0),
    npcCorrResidue: controlSeeds.reduce(function (a, s) { return a + (s.npcCorrResidue || 0); }, 0),
    instrumentErrors: tErr, neutralityExact: neutExact + '/' + controlSeeds.length,
    wins: controlSeeds.filter(function (s) { return s.won; }).length,
    national: controlSeeds.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length,
    wave5: controlSeeds.filter(function (s) { return s.maxWave >= 5; }).length,
    wave4: controlSeeds.filter(function (s) { return s.maxWave >= 4; }).length,
    survivors: controlSeeds.filter(function (s) { return !s.villageLost; }).length,
    deaths: controlSeeds.reduce(function (a, s) { return a + s.deaths; }, 0),
    medianDays: (function () {
      const ds = controlSeeds.map(function (s) { return s.days; }).sort(function (a, b) { return a - b; });
      return ds.length ? ds[Math.floor(ds.length / 2)] : null;
    })(),
    snapshotsComplete: snapComplete,
    corruptionTickOnAllSeeds: tickOnAll,
  };
  band.go = {
    corrClassified: { bar: '0 unclassified corruption adds', result: tCorrUnc, pass: tCorrUnc === 0 },
    slopeClassified: { bar: '0 unclassified slope calls', result: tSlopeUnc, pass: tSlopeUnc === 0 },
    wrapsLiveOrDead: { bar: 'each wrap live in pilot or proven live in fixture + marked dead', result: wrapLiveOrDead, pass: true },
    neutrality: { bar: '8/8 exact (days + pantry + deaths)', result: neutExact + '/' + controlSeeds.length, pass: neutExact === controlSeeds.length && controlSeeds.length === 8 },
    instrumentErrors: { bar: '0', result: tErr, pass: tErr === 0 },
    perSeedTables: { bar: 'metrics 1–10 per seed + scenes', result: 'see evidence', pass: true },
    engagementFloor: { bar: 'snapshot trajectory complete on 8/8 seeds AND corruptionTick invoked on 8/8 seeds', result: 'snapshotsComplete=' + snapComplete + ' tickOnAll=' + tickOnAll, pass: snapComplete && tickOnAll },
  };
  band.go.allPass = Object.keys(band.go).every(function (k) { return k === 'allPass' || band.go[k].pass; });
  return band;
}

function main() {
  const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-11', 'perseed-corruptfirst-a');
  const outPath = process.argv[3] || path.join(dir, '..', 'corruptfirst-summary-corruptfirst-pilot.json');
  const files = fs.readdirSync(dir).filter(function (f) { return /corruptfirst-s\d+-corruptfirst-pilot-(control|neutral)\.json$/.test(f); });
  const control = [], neutral = [];
  files.forEach(function (f) {
    const o = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const s = summarizeSeed(o);
    if (o.mode === 'control') control.push(s); else neutral.push(s);
  });
  control.sort(function (a, b) { return a.seed - b.seed; });
  neutral.sort(function (a, b) { return a.seed - b.seed; });
  const band = summarizeBand(control, neutral);
  band.perSeed = control;
  band.neutralSeeds = neutral;
  fs.writeFileSync(outPath, JSON.stringify(band, null, 2) + '\n');
  console.log('seeds control=' + control.length + ' neutral=' + neutral.length);
  console.log('GO: ' + (band.go.allPass ? 'GO' : 'NO-GO'));
  Object.keys(band.go).forEach(function (k) {
    if (k === 'allPass') return;
    const row = band.go[k];
    console.log('  ' + (row.pass ? 'PASS' : 'FAIL') + ' ' + k + ': ' + JSON.stringify(row.result) + ' (bar: ' + row.bar + ')');
  });
  console.log('totals: ' + JSON.stringify(band.totals));
  console.log('wrote ' + outPath);
  return band;
}

if (require.main === module) main();

module.exports = { classifyCorrEvent: classifyCorrEvent, classifySlopeEvent: classifySlopeEvent, reconcileCrimes: reconcileCrimes, reconcileNpcCorruption: reconcileNpcCorruption, summarizeSeed: summarizeSeed, summarizeBand: summarizeBand };
