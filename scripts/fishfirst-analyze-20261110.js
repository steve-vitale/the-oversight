// fishfirst-analyze-20261110.js — fishing first-numbers analyzer
// (arm sim-fishfirst-a). Reads evidence/2026-11-10/perseed-fishfirst-a/
// control-leg JSON and prints per-seed + pooled tables as JSON.
// Usage: node scripts/fishfirst-analyze-20261110.js [--out <summary.json>]
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
const DIR = argVal('--dir', path.join(REPO, 'evidence', '2026-11-10', 'perseed-fishfirst-a'));
const RUN = argVal('--run', 'fishfirst-pilot');
const MODE = argVal('--mode', 'control');
const OUT = argVal('--out', null);

const FISH_WORD = /fish|chub|bluegill|catfish|crayfish|bass|trout|perch|salmon|minnow/i;
function isFishName(n) { return !!n && FISH_WORD.test(String(n)); }
function isFishSpecies(id, regionFish) {
  if (!id) return false;
  if ((regionFish || []).indexOf(id) !== -1) return true;
  return FISH_WORD.test(String(id));
}

if (require.main !== module) { module.exports = { isFishName: isFishName, isFishSpecies: isFishSpecies, FISH_WORD: FISH_WORD }; return; }

const files = fs.readdirSync(DIR)
  .filter(function (f) { return f.indexOf('fishfirst-s') === 0 && f.indexOf('-' + RUN + '-' + MODE + '.json') !== -1; })
  .sort();
if (!files.length) { console.error('FISHFIRST-ANALYZE STOP: no control files in ' + DIR); process.exit(2); }

const perSeed = [];
const pooled = {
  seeds: files.length,
  depositsByName: {}, depositsOther: [],
  carcassesByOrigin: {}, carcassesFishByOrigin: {},
  teleFish: 0, teleFishKnown: 0, netSets: 0,
  fishCalls: 0, fishOk: 0, fishRefused: 0, refusedByVid: {}, refusedReasons: {},
  deedsByWho: {}, deedsPlayer: 0,
  cleansFish: 0, cleansOther: 0,
  drawsFishKcal: 0, drawsTotalKcal: 0, drawsByName: {},
  eatsFishKcal: 0, eatsTotalKcal: 0, teleEatTotal: 0,
  dutyHolderDays: 0, shelteredHolderDays: 0, dutyDaysWithHolders: 0,
  noCatchDays: 0, fishedOutSayLines: 0,
  homeFishFirst: [], homeFishMin: [], homeFishMax: [], homeFishLast: [],
  pantryFishPeak: [], pantryFishEnd: [],
  spoiledFishKcal: 0, spoiledPresentKcal: 0,
  fishWiseSeeds: 0,
  unclassifiedDeposits: 0, unclassifiedCarcasses: 0,
  instrumentErrors: 0,
  wall: { wins: 0, national: 0, table: 0, wave4: 0, wave5: 0, regional: 0, survivals: [], deaths: 0 },
};

for (const f of files) {
  const o = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const s = { seed: o.seed, days: o.days, endReason: o.endReason, won: o.won, villageLost: o.villageLost, scaleRank: o.scaleRank, maxWave: o.maxWave, standing: o.standing, deaths: o.deaths.length, endPantryKcal: o.endPantryKcal, errors: o.instrumentErrors.length };
  pooled.instrumentErrors += o.instrumentErrors.length;

  // (1) deposits by name
  const depByName = {};
  for (const d of (o.deposits || [])) {
    depByName[d.name] = (depByName[d.name] || 0) + (d.kcal || 0);
    pooled.depositsByName[d.name] = (pooled.depositsByName[d.name] || 0) + (d.kcal || 0);
    if (d.name !== 'Fish catch' && d.name !== 'Foraged food' && d.name !== 'Game meat' && d.name !== 'Garden harvest' && d.name !== 'Genesis fruit' && d.name !== 'Meal leftovers') {
      pooled.depositsOther.push({ seed: o.seed, day: d.day, name: d.name, kcal: d.kcal });
    }
  }
  s.deposits = depByName;
  s.fishCatchKcal = depByName['Fish catch'] || 0;
  s.fishCatchDays = new Set((o.deposits || []).filter(function (d) { return d.name === 'Fish catch'; }).map(function (d) { return d.day; })).size;

  // (2) carcasses by origin; fish-species split
  const carcByOrigin = {};
  const carcFishByOrigin = {};
  for (const c of (o.carcasses || [])) {
    const org = c.origin || 'unknown-origin';
    carcByOrigin[org] = carcByOrigin[org] || { n: 0, kcal: 0 };
    carcByOrigin[org].n++; carcByOrigin[org].kcal += (c.kcal || 0);
    pooled.carcassesByOrigin[org] = pooled.carcassesByOrigin[org] || { n: 0, kcal: 0 };
    pooled.carcassesByOrigin[org].n++; pooled.carcassesByOrigin[org].kcal += (c.kcal || 0);
    if (!c.origin) pooled.unclassifiedCarcasses++;
    if (isFishSpecies(c.species, o.regionFish)) {
      carcFishByOrigin[org] = carcFishByOrigin[org] || { n: 0, kcal: 0 };
      carcFishByOrigin[org].n++; carcFishByOrigin[org].kcal += (c.kcal || 0);
      pooled.carcassesFishByOrigin[org] = pooled.carcassesFishByOrigin[org] || { n: 0, kcal: 0 };
      pooled.carcassesFishByOrigin[org].n++; pooled.carcassesFishByOrigin[org].kcal += (c.kcal || 0);
    }
  }
  s.carcassesByOrigin = carcByOrigin;
  s.carcassesFishByOrigin = carcFishByOrigin;

  // (3) tele fish + nets
  s.teleFish = (o.teleFish || []).length;
  s.teleFishKnown = (o.teleFish || []).filter(function (t) { return t.known; }).length;
  pooled.teleFish += s.teleFish; pooled.teleFishKnown += s.teleFishKnown;
  s.netSets = (o.netSets || []).length;
  pooled.netSets += s.netSets;

  // (4) staffing
  const calls = (o.fishCalls || []);
  s.fishCalls = calls.length;
  s.fishOk = calls.filter(function (c) { return c.ret === 'ok'; }).length;
  s.fishRefused = calls.filter(function (c) { return c.ret === 'refused'; }).length;
  s.fishNull = calls.filter(function (c) { return c.ret === 'null'; }).length;
  s.refusedByVid = {};
  s.refusedReasons = {};
  for (const c of calls) {
    pooled.fishCalls++;
    if (c.ret === 'ok') pooled.fishOk++;
    else if (c.ret === 'refused') {
      pooled.fishRefused++;
      pooled.refusedByVid[c.vid] = (pooled.refusedByVid[c.vid] || 0) + 1;
      s.refusedByVid[c.vid] = (s.refusedByVid[c.vid] || 0) + 1;
      const r = (c.reason || c.lastRefusalReason || 'unknown');
      pooled.refusedReasons[r] = (pooled.refusedReasons[r] || 0) + 1;
      s.refusedReasons[r] = (s.refusedReasons[r] || 0) + 1;
    }
    if (c.verb !== 'assignTask') s.otherPathCalls = (s.otherPathCalls || 0) + 1;
  }
  s.otherPathCalls = s.otherPathCalls || 0;

  // (5) deeds
  s.deeds = {};
  for (const d of (o.deeds || [])) {
    s.deeds[d.who] = (s.deeds[d.who] || 0) + 1;
    pooled.deedsByWho[d.who] = (pooled.deedsByWho[d.who] || 0) + 1;
    if (d.who === 'player') pooled.deedsPlayer++;
  }

  // (7) cleans
  s.cleansFish = 0; s.cleansOther = 0;
  for (const c of (o.cleans || [])) {
    if (isFishName(c.pre && c.pre.name)) { s.cleansFish++; pooled.cleansFish++; }
    else { s.cleansOther++; pooled.cleansOther++; }
  }

  // (8) draws by name
  s.drawsFishKcal = 0; s.drawsTotalKcal = 0;
  for (const d of (o.draws || [])) {
    for (const nm of Object.keys(d.byName || {})) {
      s.drawsTotalKcal += d.byName[nm];
      pooled.drawsTotalKcal += d.byName[nm];
      pooled.drawsByName[nm] = (pooled.drawsByName[nm] || 0) + d.byName[nm];
      if (isFishName(nm)) s.drawsFishKcal += d.byName[nm];
    }
  }
  pooled.drawsFishKcal += s.drawsFishKcal;

  // (9) eats
  s.eatsFishKcal = 0; s.eatsTotalKcal = 0; s.eatsPurgedKcal = 0;
  for (const e of (o.eats || [])) {
    if (e.via === 'eat-purge') { s.eatsPurgedKcal += (e.purgedKcal || 0); continue; }
    if (e.via === 'tele-eat') continue;
    s.eatsTotalKcal += (e.ateKcal || 0);
    pooled.eatsTotalKcal += (e.ateKcal || 0);
    if (isFishName(e.name)) { s.eatsFishKcal += (e.ateKcal || 0); pooled.eatsFishKcal += (e.ateKcal || 0); }
  }
  s.teleEatTotal = (o.teleEat || []).reduce(function (a, t) { return a + (t.ateKcal || 0); }, 0);
  pooled.teleEatTotal += s.teleEatTotal;

  // (10) daily snapshots
  const daily = o.daily || [];
  s.snapDays = daily.length;
  s.dutyHolderDays = 0; s.shelteredHolderDays = 0; s.dutyDaysWithHolders = 0;
  s.dutyHolders = {};
  const fishCatchDays = new Set((o.deposits || []).filter(function (d) { return d.name === 'Fish catch'; }).map(function (d) { return d.day; }));
  s.noCatchDays = 0;
  let peakFish = 0, endFish = 0, homeFirst = null, homeMin = Infinity, homeMax = 0, homeLast = null;
  let spoiledFish = 0, spoiledAll = 0;
  for (const snap of daily) {
    const holders = snap.fishDuty || [];
    if (holders.length) {
      s.dutyDaysWithHolders++;
      for (const h of holders) {
        s.dutyHolderDays++;
        s.dutyHolders[h.vid] = s.dutyHolders[h.vid] || { occ: h.occ, days: 0, shelteredDays: 0 };
        s.dutyHolders[h.vid].days++;
        if (h.sheltered) { s.shelteredHolderDays++; s.dutyHolders[h.vid].shelteredDays++; }
      }
      const unsheltered = holders.some(function (h) { return !h.sheltered; });
      if (unsheltered && !fishCatchDays.has(snap.day)) s.noCatchDays++;
    }
    let pf = 0;
    for (const nm of Object.keys(snap.pantryByName || {})) if (isFishName(nm)) pf += snap.pantryByName[nm].kcal;
    if (pf > peakFish) peakFish = pf;
    endFish = pf;
    if (snap.homeFish) {
      if (homeFirst === null) homeFirst = snap.homeFish.total;
      if (snap.homeFish.total < homeMin) homeMin = snap.homeFish.total;
      if (snap.homeFish.total > homeMax) homeMax = snap.homeFish.total;
      homeLast = snap.homeFish.total;
    }
    spoiledFish += (snap.spoiledFishKcal || 0);
    spoiledAll += (snap.spoiledPresentKcal || 0);
  }
  s.pantryFishPeak = peakFish; s.pantryFishEnd = endFish;
  s.homeFishFirst = homeFirst; s.homeFishMin = (homeMin === Infinity ? null : homeMin);
  s.homeFishMax = homeMax; s.homeFishLast = homeLast;
  s.spoiledFishKcal = spoiledFish; s.spoiledPresentKcal = spoiledAll;
  s.fishWise = daily.some(function (x) { return x.fishWise; });
  pooled.dutyHolderDays += s.dutyHolderDays;
  pooled.shelteredHolderDays += s.shelteredHolderDays;
  pooled.dutyDaysWithHolders += s.dutyDaysWithHolders;
  pooled.noCatchDays += s.noCatchDays;
  pooled.homeFishFirst.push(homeFirst); pooled.homeFishMin.push(s.homeFishMin);
  pooled.homeFishMax.push(homeMax); pooled.homeFishLast.push(homeLast);
  pooled.pantryFishPeak.push(peakFish); pooled.pantryFishEnd.push(endFish);
  pooled.spoiledFishKcal += spoiledFish; pooled.spoiledPresentKcal += spoiledAll;
  if (s.fishWise) pooled.fishWiseSeeds++;
  s.fishedOutSayLines = (o.fishSays || []).filter(function (x) { return /fished out|walked the banks/i.test(x.line); }).length;
  pooled.fishedOutSayLines += s.fishedOutSayLines;
  s.fishSayLines = (o.fishSays || []).length;
  // Prod-throttle ledger (cumulative counters from the last snapshot).
  const lastSnap = daily[daily.length - 1];
  s.throttleRedirects = lastSnap ? (lastSnap.throttleRedirectsCum || 0) : 0;
  s.throttleExemptDepth = lastSnap ? (lastSnap.throttleExemptDepthCum || 0) : 0;
  pooled.throttleRedirects = (pooled.throttleRedirects || 0) + s.throttleRedirects;
  pooled.throttleExemptDepth = (pooled.throttleExemptDepth || 0) + s.throttleExemptDepth;

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

const summary = { run: RUN, mode: MODE, files: files, perSeed: perSeed, pooled: pooled };
if (OUT) fs.writeFileSync(OUT, JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
