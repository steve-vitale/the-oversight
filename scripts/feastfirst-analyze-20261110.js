// feastfirst-analyze-20261110.js — feast/tribute first-numbers analyzer
// (arm sim-feastfirst-a). Reads evidence/2026-11-10/perseed-feastfirst-a/
// control-leg JSON and prints per-seed + pooled tables as JSON.
// Usage: node scripts/feastfirst-analyze-20261110.js [--out <summary.json>]
//   [--dir <perseed-dir>] [--run <run-tag>] [--mode control]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

const args = process.argv.slice(2);
function argVal(flag, def) {
  const i = args.indexOf(flag);
  return (i >= 0 && args[i + 1]) ? args[i + 1] : def;
}
const DIR = argVal('--dir', path.join(REPO, 'evidence', '2026-11-10', 'perseed-feastfirst-a'));
const RUN = argVal('--run', 'feastfirst-pilot');
const MODE = argVal('--mode', 'control');
const OUT = argVal('--out', null);

if (require.main !== module) { module.exports = { byQuality: byQuality }; return; }

const files = fs.readdirSync(DIR)
  .filter(function (f) { return f.indexOf('feastfirst-s') === 0 && f.indexOf('-' + RUN + '-' + MODE + '.json') !== -1; })
  .sort();
if (!files.length) { console.error('FEASTFIRST-ANALYZE STOP: no control files in ' + DIR); process.exit(2); }

const perSeed = [];
const pooled = {
  seeds: files.length,
  feasts: 0, feastsByQuality: {}, feastsSpentKcal: 0, feastsArmed: 0, feastsBuffGranted: 0,
  feastsWithDraw: 0, feastsFirstDay: [], feastsLastDay: [],
  plans: 0, plansOk: 0, plansNotOkByWhy: {}, plansOkNoFeast: 0,
  nonFire: { bufferFail: 0, cadenceBlocked: 0, residual: 0 },
  grants: 0, grantsGranted: 0, grantsRefreshed: 0, grantsRefusedByWhy: {},
  surgeUses: 0, drawsDrawn: 0, drawMonsters: {}, drawFaced: 0, drawDrivenOff: 0,
  bundleContributions: {}, bundleCompleteFeasts: 0, bundleStagesBanked: [],
  bundleMaxCount: 0, buyouts: 0, buyoutSpentKcal: 0,
  channels: 0, keepsakeReadyMax: 0, armedSeeds: 0, armingDays: [],
  tributesByVerb: {}, tributePaidKcal: 0, systemFavorDemands: 0,
  pantryRemovalKcalByCaller: {}, pantryRemovalKcal: 0,
  pantryDrawFeastKcal: 0, pantryDrawTotalKcal: 0, pantryDrawPreview: 0,
  pelletPasses: 0, pelletHolderDays: 0, reactorOnlineDays: 0,
  hungryDays: 0, hungryMax: 0, feastsWhileReactorOnline: 0,
  depositsByName: {},
  instrumentErrors: 0, unclassifiedEvents: 0,
  feastLogFinal: [], ladderStages: [], bundleBonusFinal: [], standingPlentyFinal: [],
  wall: { wins: 0, national: 0, table: 0, wave4: 0, wave5: 0, regional: 0, survivals: [], deaths: 0 },
  senseLines: [],
};

function byQuality(q) { return (q === 0 ? 'thin(0)' : q === 1 ? 'fine(1)' : q === 2 ? 'legendary(2)' : 'unknown(' + q + ')'); }

for (const f of files) {
  const o = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const s = { seed: o.seed, days: o.days, endReason: o.endReason, won: o.won, villageLost: o.villageLost, scaleRank: o.scaleRank, maxWave: o.maxWave, standing: o.standing, deaths: o.deaths.length, endPantryKcal: o.endPantryKcal, errors: o.instrumentErrors.length };
  pooled.instrumentErrors += o.instrumentErrors.length;

  const feasts = (o.feasts || []).filter(function (x) { return x.ok; });
  const feastsFailed = (o.feasts || []).filter(function (x) { return !x.ok; });
  s.feasts = feasts.length;
  s.feastsFailed = feastsFailed.length;
  s.feastsByQuality = {};
  s.feastsSpentKcal = 0; s.feastsArmed = 0; s.feastsBuffGranted = 0; s.feastsWithDraw = 0;
  s.bundleCompleteFeasts = 0; s.bundleMaxCount = 0; s.bundleContributions = {};
  for (const ft of feasts) {
    const qk = byQuality(ft.quality);
    s.feastsByQuality[qk] = (s.feastsByQuality[qk] || 0) + 1;
    pooled.feastsByQuality[qk] = (pooled.feastsByQuality[qk] || 0) + 1;
    s.feastsSpentKcal += (ft.spent || 0);
    if ((ft.surgeSpent || 0) > 0) s.feastsArmed++;
    if (ft.buffGranted) s.feastsBuffGranted++;
    if (ft.draw) s.feastsWithDraw++;
    if (ft.bundle) {
      if (ft.bundle.count > s.bundleMaxCount) s.bundleMaxCount = ft.bundle.count;
      for (const c of (ft.bundle.contributions || [])) {
        s.bundleContributions[c] = (s.bundleContributions[c] || 0) + 1;
        pooled.bundleContributions[c] = (pooled.bundleContributions[c] || 0) + 1;
      }
      if (ft.bundle.complete) s.bundleCompleteFeasts++;
    }
    if (ft.quality === null || ft.quality === undefined || ft.spent === null) pooled.unclassifiedEvents++;
  }
  for (const ft of feastsFailed) {
    if (!ft.why) pooled.unclassifiedEvents++;
  }
  pooled.feasts += s.feasts;
  pooled.feastsSpentKcal += s.feastsSpentKcal;
  pooled.feastsArmed += s.feastsArmed;
  pooled.feastsBuffGranted += s.feastsBuffGranted;
  pooled.feastsWithDraw += s.feastsWithDraw;
  pooled.bundleCompleteFeasts += s.bundleCompleteFeasts;
  if (s.bundleMaxCount > pooled.bundleMaxCount) pooled.bundleMaxCount = s.bundleMaxCount;
  s.feastsFirstDay = feasts.length ? feasts[0].day : null;
  s.feastsLastDay = feasts.length ? feasts[feasts.length - 1].day : null;
  if (s.feastsFirstDay !== null) pooled.feastsFirstDay.push(s.feastsFirstDay);
  if (s.feastsLastDay !== null) pooled.feastsLastDay.push(s.feastsLastDay);
  s.feastDays = feasts.map(function (x) { return x.day; });

  // (2) plans + non-fires.
  const plans = o.plans || [];
  s.plans = plans.length;
  s.plansOk = plans.filter(function (p) { return p.ok; }).length;
  s.plansNotOkByWhy = {};
  for (const p of plans) {
    if (p.ok) continue;
    const w = p.why || 'unknown';
    s.plansNotOkByWhy[w] = (s.plansNotOkByWhy[w] || 0) + 1;
    pooled.plansNotOkByWhy[w] = (pooled.plansNotOkByWhy[w] || 0) + 1;
    if (!p.why) pooled.unclassifiedEvents++;
  }
  pooled.plans += s.plans; pooled.plansOk += s.plansOk;
  // Non-fire split: ok-plan days with no feast that day.
  const feastDaySet = {};
  for (const ft of feasts) feastDaySet[ft.day] = true;
  const okPlanDays = {};
  for (const p of plans) if (p.ok) okPlanDays[p.day] = p;
  s.nonFire = { bufferFail: 0, cadenceBlocked: 0, residual: 0 };
  let lastFeastDay = null;
  const sortedDays = Object.keys(okPlanDays).map(Number).sort(function (a, b) { return a - b; });
  for (const d of sortedDays) {
    if (feastDaySet[d]) { lastFeastDay = d; continue; }
    const p = okPlanDays[d];
    if (typeof p.have === 'number' && typeof p.cost === 'number' && p.have < p.cost * 1.5) { s.nonFire.bufferFail++; continue; }
    const cadence = p.armed ? 7 : 14;
    if (lastFeastDay !== null && (d - lastFeastDay) < cadence) { s.nonFire.cadenceBlocked++; continue; }
    s.nonFire.residual++;
  }
  pooled.nonFire.bufferFail += s.nonFire.bufferFail;
  pooled.nonFire.cadenceBlocked += s.nonFire.cadenceBlocked;
  pooled.nonFire.residual += s.nonFire.residual;
  pooled.plansOkNoFeast += s.nonFire.bufferFail + s.nonFire.cadenceBlocked + s.nonFire.residual;

  // (3) grants / surge / draws.
  const grants = o.grants || [];
  s.grants = grants.length;
  s.grantsGranted = grants.filter(function (g) { return g.granted; }).length;
  s.grantsRefreshed = grants.filter(function (g) { return g.granted && g.refreshed; }).length;
  s.grantsRefusedByWhy = {};
  for (const g of grants) {
    if (g.granted) continue;
    const w = g.why || 'unknown';
    const key = /reactor/i.test(w) ? 'reactor-ceiling' : /keepsake|devotion|armed/i.test(w) ? 'devotion-gate' : w.slice(0, 80);
    s.grantsRefusedByWhy[key] = (s.grantsRefusedByWhy[key] || 0) + 1;
    pooled.grantsRefusedByWhy[key] = (pooled.grantsRefusedByWhy[key] || 0) + 1;
    if (!g.why) pooled.unclassifiedEvents++;
  }
  pooled.grants += s.grants; pooled.grantsGranted += s.grantsGranted; pooled.grantsRefreshed += s.grantsRefreshed;
  s.surgeUses = (o.surgeUses || []).length;
  pooled.surgeUses += s.surgeUses;
  s.drawsDrawn = (o.draws || []).filter(function (d) { return d.drawn; }).length;
  s.drawMonsters = {};
  for (const d of (o.draws || [])) {
    if (!d.drawn) continue;
    s.drawMonsters[d.monsterId || 'unknown'] = (s.drawMonsters[d.monsterId || 'unknown'] || 0) + 1;
    pooled.drawMonsters[d.monsterId || 'unknown'] = (pooled.drawMonsters[d.monsterId || 'unknown'] || 0) + 1;
  }
  pooled.drawsDrawn += s.drawsDrawn;
  s.drawFaced = (o.drawFaces || []).filter(function (x) { return x.kind === 'face'; }).length;
  s.drawDrivenOff = (o.drawFaces || []).filter(function (x) { return x.kind === 'driveOff'; }).length;
  pooled.drawFaced += s.drawFaced; pooled.drawDrivenOff += s.drawDrivenOff;

  // (4) buy-outs.
  s.buyouts = (o.buyouts || []).filter(function (b) { return b.ok; }).length;
  s.buyoutSpentKcal = (o.buyouts || []).filter(function (b) { return b.ok; }).reduce(function (a, b) { return a + (b.spent || 0); }, 0);
  pooled.buyouts += s.buyouts; pooled.buyoutSpentKcal += s.buyoutSpentKcal;

  // (5) devotion.
  s.channels = (o.channels || []).length;
  pooled.channels += s.channels;
  s.keepsakeReadyMax = (o.keepsakeReady || []).reduce(function (a, x) { return Math.max(a, x.n || 0); }, 0);
  if (s.keepsakeReadyMax > pooled.keepsakeReadyMax) pooled.keepsakeReadyMax = s.keepsakeReadyMax;
  const daily = o.daily || [];
  s.armed = daily.some(function (x) { return x.feastSurge !== null && x.feastSurge !== undefined && x.feastSurge !== 0 && x.feastSurge !== false; });
  if (s.armed) pooled.armedSeeds++;
  const armSnap = daily.find(function (x) { return x.feastSurge !== null && x.feastSurge !== undefined && x.feastSurge !== 0 && x.feastSurge !== false; });
  s.armingDay = armSnap ? armSnap.day : null;
  if (s.armingDay !== null) pooled.armingDays.push(s.armingDay);
  s.surgeResonanceEnd = daily.length ? daily[daily.length - 1].surgeResonance : null;
  s.surgeResonanceMax = daily.reduce(function (a, x) { return Math.max(a, x.surgeResonance || 0); }, 0);

  // (6) tribute verbs.
  s.tributesByVerb = {};
  for (const tb of (o.tributes || [])) {
    s.tributesByVerb[tb.verb] = (s.tributesByVerb[tb.verb] || 0) + 1;
    pooled.tributesByVerb[tb.verb] = (pooled.tributesByVerb[tb.verb] || 0) + 1;
  }
  s.systemFavorDemands = daily.filter(function (x) { return x.pendingSystemFavor; }).length;
  pooled.systemFavorDemands += s.systemFavorDemands;
  s.pantryRemovalKcalByCaller = {};
  s.pantryRemovalKcal = 0;
  for (const r of (o.pantryRemovals || [])) {
    const c = r.caller || 'unknown';
    s.pantryRemovalKcalByCaller[c] = (s.pantryRemovalKcalByCaller[c] || 0) + (r.paid || 0);
    pooled.pantryRemovalKcalByCaller[c] = (pooled.pantryRemovalKcalByCaller[c] || 0) + (r.paid || 0);
    s.pantryRemovalKcal += (r.paid || 0);
  }
  pooled.pantryRemovalKcal += s.pantryRemovalKcal;

  // (8) pantry draws: feast cost vs total.
  s.pantryDrawFeastKcal = 0; s.pantryDrawTotalKcal = 0; s.pantryDrawPreview = 0;
  for (const d of (o.pantryDraws || [])) {
    if (d.preview) { s.pantryDrawPreview++; continue; }
    const tk = d.taken || 0;
    s.pantryDrawTotalKcal += tk;
    if (d.caller === 'hostFeast' || d.caller === 'feastBundleBuyOut') s.pantryDrawFeastKcal += tk;
  }
  pooled.pantryDrawFeastKcal += s.pantryDrawFeastKcal;
  pooled.pantryDrawTotalKcal += s.pantryDrawTotalKcal;
  pooled.pantryDrawPreview += s.pantryDrawPreview;
  s.depositsByName = {};
  for (const dep of (o.deposits || [])) {
    s.depositsByName[dep.name] = (s.depositsByName[dep.name] || 0) + (dep.kcal || 0);
    pooled.depositsByName[dep.name] = (pooled.depositsByName[dep.name] || 0) + (dep.kcal || 0);
  }

  // (7) pellet.
  s.pelletPasses = (o.pelletPasses || []).length;
  pooled.pelletPasses += s.pelletPasses;
  s.reactorOnlineDays = daily.filter(function (x) { return x.reactorOnline; }).length;
  s.pelletHolderDays = daily.filter(function (x) { return x.pelletHolder && x.pelletHolder.vid; }).length;
  pooled.reactorOnlineDays += s.reactorOnlineDays;
  pooled.pelletHolderDays += s.pelletHolderDays;
  s.hungryDays = daily.filter(function (x) { return (x.hungryCount || 0) > 0; }).length;
  s.hungryMax = daily.reduce(function (a, x) { return Math.max(a, x.hungryCount || 0); }, 0);
  pooled.hungryDays += s.hungryDays;
  if (s.hungryMax > pooled.hungryMax) pooled.hungryMax = s.hungryMax;
  s.feastsWhileReactorOnline = feasts.filter(function (ft) {
    const snap = daily.find(function (x) { return x.day === ft.day; });
    return snap && snap.reactorOnline;
  }).length;
  pooled.feastsWhileReactorOnline += s.feastsWhileReactorOnline;

  // daily finals: feast log / ladder / standing.
  const lastSnap = daily[daily.length - 1];
  s.feastLogFinal = lastSnap && Array.isArray(lastSnap.feastLog) ? lastSnap.feastLog : [];
  s.feastLogMajor = s.feastLogFinal.filter(function (e) { return ((e && e.quality) | 0) >= 1; }).length;
  s.feastLogBundles = s.feastLogFinal.filter(function (e) { return e && e.bundle === true; }).length;
  s.ladderStage = lastSnap ? lastSnap.ladderStage : null;
  s.bundleBonus = lastSnap ? lastSnap.bundleBonus : null;
  s.bundleStages = lastSnap ? lastSnap.bundleStages : null;
  pooled.feastLogFinal.push({ seed: o.seed, entries: s.feastLogFinal.length, major: s.feastLogMajor, bundles: s.feastLogBundles });
  if (s.ladderStage !== null && s.ladderStage !== undefined) pooled.ladderStages.push(s.ladderStage);
  if (s.bundleBonus !== null && s.bundleBonus !== undefined) pooled.bundleBonusFinal.push(s.bundleBonus);
  const st = o.standing;
  // villageStandingTotal() returns a plain number, not a breakdown, so
  // plenty is derived from the feast log: +20 per major feast
  // (standing.js:138-146 — quality >= 1 counts as major).
  s.standingPlenty = 20 * s.feastLogMajor;
  s.standingTotal = (typeof st === 'number') ? st : ((st && typeof st.total === 'number') ? st.total : null);
  if (s.standingPlenty !== null) pooled.standingPlentyFinal.push(s.standingPlenty);
  s.snapDays = daily.length;
  s.feastSayLines = (o.feastSays || []).length;
  s.feastSaysSample = (o.feastSays || []).filter(function (x) { return /🍖 FEAST|THE BUNDLE|FEASTED|tribute/i.test(x.line); }).slice(0, 6);
  for (const sl of s.feastSaysSample) pooled.senseLines.push({ seed: o.seed, day: sl.day, line: sl.line });

  // wall
  if (o.won) pooled.wall.wins++;
  if (o.scaleRank === 'national' || o.scaleRank === 3) pooled.wall.national++;
  if (o.scaleRank === 'regional' || o.scaleRank === 2) pooled.wall.regional++;
  if (o.maxWave >= 4) pooled.wall.wave4++;
  if (o.maxWave >= 5) pooled.wall.wave5++;
  pooled.wall.survivals.push(o.days);
  pooled.wall.deaths += o.deaths.length;

  perSeed.push(s);
}

pooled.wall.survivals.sort(function (a, b) { return a - b; });
pooled.wall.medianSurvival = pooled.wall.survivals.length ? pooled.wall.survivals[Math.floor(pooled.wall.survivals.length / 2)] : null;
pooled.bundleStagesBanked = perSeed.reduce(function (a, s) { return a.concat(s.bundleStages || []); }, []).filter(function (v, i, arr) { return arr.indexOf(v) === i; }).sort();

const summary = { run: RUN, mode: MODE, files: files, perSeed: perSeed, pooled: pooled };
if (OUT) fs.writeFileSync(OUT, JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
