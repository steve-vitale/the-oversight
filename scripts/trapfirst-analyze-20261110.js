// trapfirst-analyze-20261110.js — trapping first-numbers analyzer
// (arm sim-trapfirst-a). Reads evidence/2026-11-10/perseed-trapfirst-a/
// control-leg JSON and prints per-seed + pooled tables as JSON.
// Usage: node scripts/trapfirst-analyze-20261110.js [--out <summary.json>]
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
const DIR = argVal('--dir', path.join(REPO, 'evidence', '2026-11-10', 'perseed-trapfirst-a'));
const RUN = argVal('--run', 'trapfirst-pilot');
const MODE = argVal('--mode', 'control');
const OUT = argVal('--out', null);

// Data-def HP for the #1826 spawn check.
let MONSTER_DEFS = {};
try {
  const ms = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
  for (const m of ms) MONSTER_DEFS[m.id] = m;
} catch (e) { MONSTER_DEFS = {}; }
function defHp(id) {
  const d = MONSTER_DEFS[id] || {};
  if (Array.isArray(d.hp) && typeof d.hp[0] === 'number') return d.hp[0];
  if (typeof d.hp === 'number') return d.hp;
  return null;
}

const TRAP_MEAT_NAME = /snared meat|pit meat|game meat/i;
const PIT_NAME = /^Pit meat \(/i;
function isTrapDepositName(n) {
  if (!n) return false;
  return /snared meat/i.test(n) || PIT_NAME.test(n);
}
function isMeatDepositName(n) {
  if (!n) return false;
  return /meat/i.test(n);
}

if (require.main !== module) { module.exports = { defHp: defHp, isTrapDepositName: isTrapDepositName, isMeatDepositName: isMeatDepositName }; return; }

const files = fs.readdirSync(DIR)
  .filter(function (f) { return f.indexOf('trapfirst-s') === 0 && f.indexOf('-' + RUN + '-' + MODE + '.json') !== -1; })
  .sort();
if (!files.length) { console.error('TRAPFIRST-ANALYZE STOP: no control files in ' + DIR); process.exit(2); }

const perSeed = [];
const pooled = {
  seeds: files.length,
  depositsByName: {}, depositsOther: [],
  carcassesByOrigin: {},
  trapSetsByRecipe: {}, trapSetsWire: 0, trapSetsNull: 0,
  trapSetsWithGame: 0, trapSetsNoGame: 0, trapSetsKnownGame: 0, trapSetsUnknownGame: 0,
  trapCraftsByRecipe: {}, trapCraftsBlind: 0, trapCraftsKnown: 0, trapCraftsNull: 0,
  trapChecks: 0,
  luckByStream: {},
  teleTrapByType: {},
  huntCalls: 0, huntOk: 0, huntRefused: 0, huntNull: 0,
  deadfallCalls: 0, deadfallOk: 0, deadfallRefused: 0,
  refusedByVid: {}, refusedReasons: {},
  deedsByWho: {}, deedsPlayer: 0,
  spawnsTotal: 0, spawnsByCaller: {}, trapSpawns: 0, trapSpawnHpOk: 0, trapSpawnHpBad: [],
  wandererSpawns: 0, wandererSpawnHpBad: [],
  cleansTrapped: 0, cleansOther: 0, cleansUnknown: 0,
  drawsTrapMeatKcal: 0, drawsTotalKcal: 0, drawsByName: {},
  eatsTrapMeatKcal: 0, eatsTotalKcal: 0, teleEatTotal: 0,
  trapDepositKcal: 0, meatDepositKcal: 0, totalDepositKcal: 0,
  trappedCarcassKcal: 0, trappedCarcasses: 0,
  spoiledTrapMeatKcal: 0,
  maxTrapCount: 0, knowsSnareMax: 0, knowsPitMax: 0,
  unclassifiedDeposits: 0, unclassifiedCarcasses: 0, unclassifiedSets: 0,
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
    pooled.totalDepositKcal += (d.kcal || 0);
    if (!d.name) pooled.unclassifiedDeposits++;
    if (isTrapDepositName(d.name)) pooled.trapDepositKcal += (d.kcal || 0);
    if (isMeatDepositName(d.name)) pooled.meatDepositKcal += (d.kcal || 0);
    if (d.name !== 'Snared meat' && !PIT_NAME.test(d.name || '') && d.name !== 'Game meat' && d.name !== 'Fish catch' && d.name !== 'Foraged food' && d.name !== 'Garden harvest' && d.name !== 'Genesis fruit' && d.name !== 'Meal leftovers') {
      pooled.depositsOther.push({ seed: o.seed, day: d.day, name: d.name, kcal: d.kcal });
    }
  }
  s.deposits = depByName;
  s.snaredKcal = depByName['Snared meat'] || 0;
  s.pitKcal = Object.keys(depByName).filter(function (n) { return PIT_NAME.test(n); }).reduce(function (a, n) { return a + depByName[n]; }, 0);
  s.pitBySpecies = {};
  for (const n of Object.keys(depByName)) if (PIT_NAME.test(n)) s.pitBySpecies[n] = depByName[n];
  s.gameKcal = depByName['Game meat'] || 0;
  s.trapDepositKcal = s.snaredKcal + s.pitKcal;
  s.totalDepositKcal = Object.keys(depByName).reduce(function (a, n) { return a + depByName[n]; }, 0);

  // (2) carcasses by origin
  const carcByOrigin = {};
  for (const c of (o.carcasses || [])) {
    const org = c.origin || 'unknown-origin';
    carcByOrigin[org] = carcByOrigin[org] || { n: 0, kcal: 0 };
    carcByOrigin[org].n++; carcByOrigin[org].kcal += (c.kcal || 0);
    pooled.carcassesByOrigin[org] = pooled.carcassesByOrigin[org] || { n: 0, kcal: 0 };
    pooled.carcassesByOrigin[org].n++; pooled.carcassesByOrigin[org].kcal += (c.kcal || 0);
    if (!c.origin) pooled.unclassifiedCarcasses++;
    if (c.origin === 'trapped') { pooled.trappedCarcasses++; pooled.trappedCarcassKcal += (c.kcal || 0); }
  }
  s.carcassesByOrigin = carcByOrigin;
  s.trappedCarcasses = (carcByOrigin.trapped || { n: 0 }).n;
  s.trappedCarcassKcal = (carcByOrigin.trapped || { kcal: 0 }).kcal;

  // (3) sets + crafts
  const setsByRecipe = {};
  let setsWire = 0, setsNull = 0, setsWithGame = 0, setsNoGame = 0, setsKnown = 0, setsUnknown = 0;
  for (const st of (o.trapSets || [])) {
    if (!st.recipeId) { pooled.unclassifiedSets++; continue; }
    setsByRecipe[st.recipeId] = setsByRecipe[st.recipeId] || { n: 0, ok: 0, null: 0, wire: 0 };
    setsByRecipe[st.recipeId].n++;
    pooled.trapSetsByRecipe[st.recipeId] = pooled.trapSetsByRecipe[st.recipeId] || { n: 0, ok: 0, null: 0, wire: 0 };
    pooled.trapSetsByRecipe[st.recipeId].n++;
    if (st.retNull) { setsByRecipe[st.recipeId].null++; pooled.trapSetsByRecipe[st.recipeId].null++; setsNull++; pooled.trapSetsNull++; }
    else { setsByRecipe[st.recipeId].ok++; pooled.trapSetsByRecipe[st.recipeId].ok++; }
    if (st.wire) { setsWire++; pooled.trapSetsWire++; setsByRecipe[st.recipeId].wire++; pooled.trapSetsByRecipe[st.recipeId].wire++; }
    const elig = st.eligible || [];
    if (elig.length) { setsWithGame++; pooled.trapSetsWithGame++; } else { setsNoGame++; pooled.trapSetsNoGame++; }
    if ((st.eligibleKnown || []).length) { setsKnown++; pooled.trapSetsKnownGame++; } else { setsUnknown++; pooled.trapSetsUnknownGame++; }
  }
  s.trapSetsByRecipe = setsByRecipe;
  s.trapSetsWire = setsWire; s.trapSetsNull = setsNull;
  s.trapSetsWithGame = setsWithGame; s.trapSetsNoGame = setsNoGame;
  s.trapSetsKnownGame = setsKnown; s.trapSetsUnknownGame = setsUnknown;
  const craftsByRecipe = {};
  let craftsBlind = 0, craftsKnown = 0, craftsNull = 0;
  for (const cr of (o.trapCrafts || [])) {
    if (!cr.isTrap) continue;
    craftsByRecipe[cr.recipeId] = craftsByRecipe[cr.recipeId] || { n: 0, ok: 0, null: 0, blind: 0 };
    craftsByRecipe[cr.recipeId].n++;
    pooled.trapCraftsByRecipe[cr.recipeId] = pooled.trapCraftsByRecipe[cr.recipeId] || { n: 0, ok: 0, null: 0, blind: 0 };
    pooled.trapCraftsByRecipe[cr.recipeId].n++;
    if (cr.retNull) { craftsByRecipe[cr.recipeId].null++; pooled.trapCraftsByRecipe[cr.recipeId].null++; craftsNull++; pooled.trapCraftsNull++; }
    else { craftsByRecipe[cr.recipeId].ok++; pooled.trapCraftsByRecipe[cr.recipeId].ok++; }
    if (cr.blind) { craftsBlind++; pooled.trapCraftsBlind++; craftsByRecipe[cr.recipeId].blind++; pooled.trapCraftsByRecipe[cr.recipeId].blind++; }
    else { craftsKnown++; pooled.trapCraftsKnown++; }
  }
  s.trapCraftsByRecipe = craftsByRecipe;
  s.trapCraftsBlind = craftsBlind; s.trapCraftsKnown = craftsKnown; s.trapCraftsNull = craftsNull;

  // (5) checks + luck rolls
  s.trapChecks = (o.trapChecks || []).length;
  pooled.trapChecks += s.trapChecks;
  const luckByStream = {};
  for (const lr of (o.luckRolls || [])) {
    luckByStream[lr.stream] = luckByStream[lr.stream] || { rolls: 0, hits: 0 };
    luckByStream[lr.stream].rolls++; if (lr.hit) luckByStream[lr.stream].hits++;
    pooled.luckByStream[lr.stream] = pooled.luckByStream[lr.stream] || { rolls: 0, hits: 0 };
    pooled.luckByStream[lr.stream].rolls++; if (lr.hit) pooled.luckByStream[lr.stream].hits++;
  }
  s.luckByStream = luckByStream;

  // (6) villager trap tele
  const teleByType = {};
  for (const tt of (o.teleTrap || [])) {
    teleByType[tt.type] = teleByType[tt.type] || { n: 0, caught: 0, kcal: 0, species: {} };
    teleByType[tt.type].n++;
    pooled.teleTrapByType[tt.type] = pooled.teleTrapByType[tt.type] || { n: 0, caught: 0, kcal: 0, species: {} };
    pooled.teleTrapByType[tt.type].n++;
    if (tt.caught) {
      teleByType[tt.type].caught++; teleByType[tt.type].kcal += (tt.kcal || 0);
      pooled.teleTrapByType[tt.type].caught++; pooled.teleTrapByType[tt.type].kcal += (tt.kcal || 0);
      if (tt.species) {
        teleByType[tt.type].species[tt.species] = (teleByType[tt.type].species[tt.species] || 0) + 1;
        pooled.teleTrapByType[tt.type].species[tt.species] = (pooled.teleTrapByType[tt.type].species[tt.species] || 0) + 1;
      }
    }
  }
  s.teleTrapByType = teleByType;

  // (7) staffing: hunt + deadfall (stick duty)
  const hc = (o.huntCalls || []);
  s.huntCalls = hc.filter(function (c) { return c.task === 'hunt'; }).length;
  s.huntOk = hc.filter(function (c) { return c.task === 'hunt' && c.ret === 'ok'; }).length;
  s.huntRefused = hc.filter(function (c) { return c.task === 'hunt' && c.ret === 'refused'; }).length;
  s.huntNull = hc.filter(function (c) { return c.task === 'hunt' && c.ret === 'null'; }).length;
  s.deadfallCalls = hc.filter(function (c) { return c.task === 'deadfall'; }).length;
  s.deadfallOk = hc.filter(function (c) { return c.task === 'deadfall' && c.ret === 'ok'; }).length;
  s.deadfallRefused = hc.filter(function (c) { return c.task === 'deadfall' && c.ret === 'refused'; }).length;
  pooled.huntCalls += s.huntCalls; pooled.huntOk += s.huntOk; pooled.huntRefused += s.huntRefused; pooled.huntNull += s.huntNull;
  pooled.deadfallCalls += s.deadfallCalls; pooled.deadfallOk += s.deadfallOk; pooled.deadfallRefused += s.deadfallRefused;
  s.refusedByVid = {};
  for (const c of hc) {
    if (c.ret === 'refused') {
      pooled.refusedByVid[c.vid] = (pooled.refusedByVid[c.vid] || 0) + 1;
      s.refusedByVid[c.vid] = (s.refusedByVid[c.vid] || 0) + 1;
      const r = (c.reason || c.lastRefusalReason || 'unknown');
      pooled.refusedReasons[r] = (pooled.refusedReasons[r] || 0) + 1;
    }
  }

  // (8) deeds
  s.deedsTrapping = (o.deeds || []).filter(function (d) { return d.deed === 'trapping'; }).length;
  s.deedsPlayer = (o.deeds || []).filter(function (d) { return d.deed === 'trapping' && d.who === 'player'; }).length;
  for (const d of (o.deeds || [])) {
    pooled.deedsByWho[d.who || 'unknown'] = (pooled.deedsByWho[d.who || 'unknown'] || 0) + 1;
    if (d.who === 'player') pooled.deedsPlayer++;
  }

  // (9) spawns — the #1826 check
  const spawnsByCaller = {};
  let trapSpawns = 0, trapHpOk = 0; const trapHpBad = [];
  let wandSpawns = 0; const wandHpBad = [];
  for (const sp of (o.spawns || [])) {
    pooled.spawnsTotal++;
    const caller = sp.caller || 'unknown-caller';
    spawnsByCaller[caller] = (spawnsByCaller[caller] || 0) + 1;
    pooled.spawnsByCaller[caller] = (pooled.spawnsByCaller[caller] || 0) + 1;
    const dhp = defHp(sp.id);
    const hpOk = (dhp === null) || (sp.hp === dhp);
    if (/gwTrapTick/.test(caller)) {
      trapSpawns++; pooled.trapSpawns++;
      if (hpOk) { trapHpOk++; pooled.trapSpawnHpOk++; }
      else { trapHpBad.push({ seed: o.seed, day: sp.day, id: sp.id, hp: sp.hp, defHp: dhp }); pooled.trapSpawnHpBad.push({ seed: o.seed, day: sp.day, id: sp.id, hp: sp.hp, defHp: dhp }); }
    }
    if (/wanderer|encounterWanderer|checkEncounter/.test(caller)) {
      wandSpawns++; pooled.wandererSpawns++;
      if (!hpOk) wandHpBad.push({ seed: o.seed, day: sp.day, id: sp.id, hp: sp.hp, defHp: dhp });
    }
    if (!hpOk && !/gwTrapTick|wanderer|encounterWanderer|checkEncounter/.test(caller)) {
      // Other bare-{id} spawn shapes carrying wrong HP — record, don't judge here.
      pooled.trapSpawnHpBad.push({ seed: o.seed, day: sp.day, id: sp.id, hp: sp.hp, defHp: dhp, caller: caller });
    }
  }
  s.spawnsTotal = (o.spawns || []).length;
  s.spawnsByCaller = spawnsByCaller;
  s.trapSpawns = trapSpawns; s.trapSpawnHpOk = trapHpOk; s.trapSpawnHpBad = trapHpBad;
  s.wandererSpawns = wandSpawns; s.wandererSpawnHpBad = wandHpBad;
  pooled.wandererSpawnHpBad = (pooled.wandererSpawnHpBad || []).concat(wandHpBad);

  // (10) cleans
  s.cleansTrapped = (o.cleans || []).filter(function (c) { return c.trapped; }).length;
  s.cleansOther = (o.cleans || []).filter(function (c) { return !c.trapped && c.name; }).length;
  s.cleansUnknown = (o.cleans || []).filter(function (c) { return !c.trapped && !c.name; }).length;
  pooled.cleansTrapped += s.cleansTrapped; pooled.cleansOther += s.cleansOther; pooled.cleansUnknown += s.cleansUnknown;

  // (11) draws
  let drawsTrap = 0, drawsTotal = 0; const drawsByName = {};
  for (const dr of (o.draws || [])) {
    for (const nm of Object.keys(dr.byName || {})) {
      const k = dr.byName[nm] || 0;
      drawsByName[nm] = (drawsByName[nm] || 0) + k;
      pooled.drawsByName[nm] = (pooled.drawsByName[nm] || 0) + k;
      drawsTotal += k; pooled.drawsTotalKcal += k;
      if (TRAP_MEAT_NAME.test(nm)) { drawsTrap += k; pooled.drawsTrapMeatKcal += k; }
    }
  }
  s.drawsTrapMeatKcal = drawsTrap; s.drawsTotalKcal = drawsTotal; s.drawsByName = drawsByName;

  // (12) eats
  let eatsTrap = 0, eatsTotal = 0;
  for (const e of (o.eats || [])) {
    if (e.via === 'eat-purge') continue;
    eatsTotal += (e.ateKcal || 0); pooled.eatsTotalKcal += (e.ateKcal || 0);
    if (e.name && (TRAP_MEAT_NAME.test(e.name) || /\(trapped\)/i.test(e.name))) { eatsTrap += (e.ateKcal || 0); pooled.eatsTrapMeatKcal += (e.ateKcal || 0); }
  }
  s.eatsTrapMeatKcal = eatsTrap; s.eatsTotalKcal = eatsTotal;
  s.teleEatTotal = (o.teleEat || []).reduce(function (a, t) { return a + (t.ateKcal || 0); }, 0);
  pooled.teleEatTotal += s.teleEatTotal;

  // (13) daily-derived
  const daily = o.daily || [];
  let maxTrap = 0, lastTrap = 0, knowsSnareMax = 0, knowsPitMax = 0;
  let wlFirst = null, wlMin = null, wlMax = null, wlLast = null;
  let spoiledTrap = 0, endRecipeLevels = null, endSnareWire = null;
  for (const d of daily) {
    if (typeof d.trapCount === 'number') { if (d.trapCount > maxTrap) maxTrap = d.trapCount; lastTrap = d.trapCount; }
    if (typeof d.knowsSnare === 'number' && d.knowsSnare > knowsSnareMax) knowsSnareMax = d.knowsSnare;
    if (typeof d.knowsPit === 'number' && d.knowsPit > knowsPitMax) knowsPitMax = d.knowsPit;
    if (d.mapTrapWildlife && typeof d.mapTrapWildlife.total === 'number') {
      const v = d.mapTrapWildlife.total;
      if (wlFirst === null) wlFirst = v;
      if (wlMin === null || v < wlMin) wlMin = v;
      if (wlMax === null || v > wlMax) wlMax = v;
      wlLast = v;
    }
    if (typeof d.spoiledTrapMeatKcal === 'number') spoiledTrap = d.spoiledTrapMeatKcal;
    endRecipeLevels = d.recipeLevels || endRecipeLevels;
    endSnareWire = (typeof d.snareWireLevel === 'number' ? d.snareWireLevel : endSnareWire);
  }
  s.maxTrapCount = maxTrap; s.lastTrapCount = lastTrap;
  s.knowsSnareMax = knowsSnareMax; s.knowsPitMax = knowsPitMax;
  s.mapTrapWildlife = { first: wlFirst, min: wlMin, max: wlMax, last: wlLast };
  s.spoiledTrapMeatKcalEnd = spoiledTrap;
  s.endRecipeLevels = endRecipeLevels; s.endSnareWire = endSnareWire;
  s.snapshots = daily.length;
  pooled.maxTrapCount = Math.max(pooled.maxTrapCount, maxTrap);
  pooled.knowsSnareMax = Math.max(pooled.knowsSnareMax, knowsSnareMax);
  pooled.knowsPitMax = Math.max(pooled.knowsPitMax, knowsPitMax);
  pooled.spoiledTrapMeatKcal += spoiledTrap;

  // wall
  pooled.wall.survivals.push(o.days);
  pooled.wall.deaths += o.deaths.length;
  if (o.won) pooled.wall.wins++;
  if (o.scaleRank === 'national' || o.scaleRank === 'galactic') pooled.wall.national++;
  if (o.scaleRank === 'table' || o.scaleRank === 'galactic') pooled.wall.table++;
  if ((o.maxWave || 1) >= 4) pooled.wall.wave4++;
  if ((o.maxWave || 1) >= 5) pooled.wall.wave5++;
  if (o.scaleRank === 'regional' || o.scaleRank === 'national' || o.scaleRank === 'table' || o.scaleRank === 'galactic') pooled.wall.regional++;
  s.wall = { won: !!o.won, scaleRank: o.scaleRank, maxWave: o.maxWave, standing: o.standing };

  perSeed.push(s);
}

pooled.wall.survivals.sort(function (a, b) { return a - b; });
const sv = pooled.wall.survivals;
pooled.wall.medianSurvival = sv.length ? (sv.length % 2 ? sv[(sv.length - 1) / 2] : (sv[sv.length / 2 - 1] + sv[sv.length / 2]) / 2) : null;
pooled.wall.villageLost = perSeed.filter(function (s) { return s.villageLost; }).length;

const out = { perSeed: perSeed, pooled: pooled };
if (OUT) fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out, null, 2));
