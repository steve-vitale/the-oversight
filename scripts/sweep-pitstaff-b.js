#!/usr/bin/env node
// scripts/sweep-pitstaff-b.js — PILOT sweep for the pit-trap staffing layer
// (arm sim-pitstaff-b, loop B food-economy axis, run fleshout-loop-b-20261018T1530Z).
//
// PRE-REGISTRATION (binding; evidence/2026-10-18/sim-pitstaff-b.md; written BEFORE sims — MEASUREMENT.md §14):
//   QUESTION: does staffing pit traps produce boar kills and boar-kcal
//     reaching the pantry?
//   PRIMARY (binding): boar kills armed >= 4 across the armed side AND
//     boar-meat pantry arrivals >= 5,000 kcal (control expected 0 — the
//     killaudit measured 0/1281 run-days).
//   ENGAGEMENT (kill-fast): pit traps armed+set >= 16 across the armed
//     side (the layer must engage). If 0 traps armed at pilot, KILL —
//     never run 16 seeds on an invisible effect.
//   GUARDRAILS: trap-duty deaths <= control+2; median survival >=
//     control-10d; no new death mode; det-gate byte-identical gate-off.
//   HORIZON: 180d death-aware (engine tail). SUBSTRATE: FEASTSCALE_R13=1,
//     SEATDRIVE=0 EXPLICIT; HUNTSTAFF unset (default OFF) both sides.
//   SEEDS: 105101-105104 (killaudit clean baseline) + 4 fresh
//     verified-unused (verified vs all evidence/ seed lists 2026-10-16..18)
//     x {leadfeast,belongfeast} x {control,armed}; own in-sweep paired
//     control, identical seeds.
//   A miss is NO-GO, never re-scored mid-run.
//
// DEATH INSTRUMENTS (findings #525/#528): every tele('death') record
// captures `kind`; villager counts filter kind person/villager only
// (monsters pollute the stream); counts dedup on (who,day,cause). The
// daily wrap snapshots v.taskLeads per day alongside the assignTask wrap
// (engine task-lead hunt duties bypass assignTask).
//
// The armed/control delta is ONLY the env var (same policy object, same
// code path — the det-gate in test-pitstaff-b.js proves the wrapper is
// byte-identical gate-off).
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-pitstaff-b.js
// Targeted: SEEDS="105101" POLICIES="leadfeast" ARMS="armed" DAYS=60 OUT=<dir> node scripts/sweep-pitstaff-b.js
'use strict';
const fs = require('fs');
const path = require('path');

let PS;
try {
  PS = require('./policies/pitstaff');
} catch (e) {
  console.log('INFO-SKIP: scripts/policies/pitstaff.js absent — layer killed zero-trace per NO-GO verdict (sim-pitstaff-b, 2026-10-18). Sweep not run.');
  process.exit(0);
}
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { attachKillInstrument } = require('./killaudit-census-b');
const census = require('./camptask-census-b');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [105101, 105102, 105103, 105104, 105201, 105202, 105203, 105204]).filter(Number.isFinite);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const ARMS = (process.env.ARMS ? process.env.ARMS.split(',').map(s => s.trim()) : ['control', 'armed']);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-pitstaff-b');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const RUN_ID = 'fleshout-loop-b-20261018T1530Z';

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);
const strip = (s) => String(s == null ? '' : s).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 400);
const BOAR_MEAT = 'meat_wild_boar';

// --- boar-channel instruments (read-only wraps; zero RNG draws, zero game-state writes) ---
function attachBoarInstrument(Game, t) {
  t.boarDonations = [];   // donateToPantry of meat_wild_boar {day, kcal, units}
  t.boarArrivals = [];    // pantry identity-ledger arrivals {day, kcal, units}
  t.fatSlabs = [];        // carcassToMeat fat generations {day, species, slabs}
  t.pitBeats = [];        // say() msgs matching pit/boar (sense-test corpus), capped
  t.recipeLevels = { snare: 0, pit_trap: 0 };
  t.taskLeadsDays = [];   // finding #528: per-day v.taskLeads snapshot
  t.pitCrafts = 0;        // tele('craft') id==='pit_trap' (the layer's staffing verb)
  t.pitCraftLog = [];     // {day} per craft
  t.errors = t.errors || 0;
  const seenPantry = new Set(); // item object identity -> recorded
  const seenFat = new Set();

  // 0. the layer's staffing verb: tele('craft') id==='pit_trap'
  try {
    if (typeof Game.tele === 'function') {
      const oTele = Game.tele.bind(Game);
      Game.tele = function (type, data) {
        let r; try { r = oTele.apply(this, arguments); } catch (e) { r = undefined; }
        try {
          if (type === 'craft' && data && data.id === 'pit_trap') {
            t.pitCrafts++;
            t.pitCraftLog.push({ day: gday(Game) });
          }
        } catch (e) { t.errors++; }
        return r;
      };
    }
  } catch (e) { t.errors++; }

  // 1. boar-meat donations: the scholar's donate path into the hall pantry
  try {
    if (typeof Game.donateToPantry === 'function') {
      const orig = Game.donateToPantry.bind(Game);
      Game.donateToPantry = function (idx) {
        let item = null;
        try {
          const inv = Game.state.scholar.inventory || [];
          item = inv[idx] || null;
          if (item && String(item.plantId) === BOAR_MEAT) {
            t.boarDonations.push({ day: gday(Game), kcal: num((item.kcalEach || 0) * (item.units || 1)), units: num(item.units || 1) });
          }
        } catch (e) { t.errors++; }
        return orig(idx);
      };
    } else t.errors++;
  } catch (e) { t.errors++; }

  // 2. pantry identity ledger: catches EVERY boar-meat arrival (kitchen
  //    drive, stash pooling, donations — any path), by object identity.
  t.scanPantry = function () {
    try {
      const pan = ((Game.state || {}).village || {}).pantry || [];
      for (const it of pan) {
        if (!it || String(it.plantId) !== BOAR_MEAT || seenPantry.has(it)) continue;
        seenPantry.add(it);
        t.boarArrivals.push({ day: gday(Game), kcal: num((it.kcalEach || 0) * (it.units || 1)), units: num(it.units || 1) });
      }
    } catch (e) { t.errors++; }
  };

  // 3. fat slabs: carcassToMeat generation sites (butchering). Identity
  //    ledger over fat items (foodKind==='fat'), species from plantId.
  try {
    if (typeof Game.carcassToMeat === 'function') {
      const orig = Game.carcassToMeat.bind(Game);
      Game.carcassToMeat = function (inv, i, knows) {
        let out = null, err = null;
        try { out = orig(inv, i, knows); } catch (e) { err = e; }
        try {
          for (const it of (inv || [])) {
            if (!it || it.foodKind !== 'fat' || seenFat.has(it)) continue;
            seenFat.add(it);
            t.fatSlabs.push({ day: gday(Game), species: String(it.plantId || '').replace(/^fat_/, '') || 'unknown',
              slabs: num(it.units || 1) });
          }
        } catch (e) { t.errors++; }
        if (err) throw err;
        return out;
      };
    } else t.errors++;
  } catch (e) { t.errors++; }

  // 4. pit/boar narration corpus (sense-test law)
  try {
    const base = Game.say && Game.say.bind(Game);
    if (base) {
      Game.say = function (msg) {
        try {
          const s = strip(msg);
          if (/pit trap|pit_trap|dig the pit|wild boar|boar/i.test(s)) {
            if (t.pitBeats.length < 4000) t.pitBeats.push({ day: gday(Game), text: s });
          }
        } catch (e) {}
        return base(msg);
      };
    }
  } catch (e) { t.errors++; }
}

async function oneRun(seed, policyId, arm) {
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  // same policy object both arms; the ONLY delta is the PITSTAFF env var
  const policy = PS.withPitStaff(base, policyId + '+pitstaff', 'sweep');
  if (arm === 'armed') process.env.PITSTAFF = '1'; else delete process.env.PITSTAFF;
  const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  const t = { errors: 0 };
  census.attachBeatRing(Game, t);
  attachKillInstrument(Game, t);
  attachBoarInstrument(Game, t);
  const hist = { maxRank: 0, table: false, exiled: false, starvedDays: 0, maxArc: 1, maxWave: 1, wins: 0 };
  const oDaily = policy.daily;
  policy.daily = (G, ctx) => {
    try {
      const day = (G.state.scholar || {}).day || 0;
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting || pg.tableDone) hist.table = true;
      if (pg.gameWon) hist.wins = 1;
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      if ((G.state.scholar || {}).exiled) hist.exiled = true;
      if ((((G.state.village || {}).village || {}).hungryDays || 0) > 0) hist.starvedDays++;
      try { const a = (((G.state || {}).scholar || {}).prog || {}).arc || 1; if (a > hist.maxArc) hist.maxArc = a; } catch (e) {}
      try { const w = G.unlockedWave ? (G.unlockedWave() | 0) : 1; if (w > hist.maxWave) hist.maxWave = w; } catch (e) {}
      // recipe knowledge (the layer's engagement gate substrate)
      try {
        const r = ((G.state || {}).codex || {}).recipes || {};
        t.recipeLevels.snare = Math.max(t.recipeLevels.snare, (r.snare || {}).level || 0);
        t.recipeLevels.pit_trap = Math.max(t.recipeLevels.pit_trap, (r.pit_trap || {}).level || 0);
      } catch (e) { t.errors++; }
      // finding #528: engine task-lead hunts bypass the assignTask wrap
      try {
        const leads = Object.entries((G.state.village || {}).taskLeads || {}).map(([task, vid]) => ({ task: String(task), vid: String(vid) }));
        if (leads.length) t.taskLeadsDays.push({ day, leads });
      } catch (e) { t.errors++; }
      // pantry boar-meat identity ledger
      try { t.scanPantry(); } catch (e) { t.errors++; }
    } catch (e) { t.errors++; }
    if (oDaily) { try { return oDaily(G, ctx); } catch (e) { return undefined; } }
    return undefined;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 30 }); });
  const days = num(result && result.days);
  delete process.env.PITSTAFF;

  const boarKills = t.killEvents.filter(k => k.species === 'wild_boar' && k.outcome === 'kill');
  const pitsSet = (t.trapsSet && t.trapsSet.pit_trap) || 0;
  const boarMeatKcal = t.boarArrivals.reduce((a, r) => a + (r.kcal || 0), 0);
  const fatSlabUnits = t.fatSlabs.reduce((a, r) => a + (r.slabs || 0), 0);
  // trap-duty deaths: person/villager-kind teles whose cause names traps/pits/goring
  const trapDeaths = (t.personDeaths || []).filter(d => /trap|pit|gore|boar/i.test(String(d.cause || '')));

  const out = {
    schema: 'pitstaff-sweep-b/1', runId: RUN_ID, seed, policy: policyId, arm, days,
    pitstaff: arm === 'armed' ? 1 : 0,
    errors: t.errors,
    // primary metrics
    boarKills: boarKills.length,
    boarKillEvents: boarKills,
    boarMeatPantryKcal: Math.round(boarMeatKcal),
    boarDonations: t.boarDonations,
    boarArrivals: t.boarArrivals,
    // engagement
    pitsSet,
    trapsSet: t.trapsSet,
    trapsOnTiles: t.trapsOnTiles,
    pitCrafts: t.pitCrafts,
    pitCraftLog: t.pitCraftLog,
    // guardrails
    trapDutyDeaths: trapDeaths.length,
    trapDeaths: trapDeaths,
    personDeaths: t.personDeaths,
    monsterKills: (t.monsterKills || []).length,
    // substrate/corollary
    fatSlabs: t.fatSlabs,
    fatSlabUnits,
    recipeLevels: t.recipeLevels,
    taskLeadsDays: t.taskLeadsDays,
    kills: t.killEvents,
    totalKills: t.killEvents.filter(k => k.channel !== 'fishing' && k.channel !== 'food-other').length,
    carcassesCleaned: t.carcassesCleaned,
    huntResolves: t.huntResolves.length,
    pitBeats: t.pitBeats,
    beats: t.beats || [],
    wall: { maxRank: hist.maxRank, table: hist.table, exiled: hist.exiled, starvedDays: hist.starvedDays,
      maxArc: hist.maxArc, maxWave: hist.maxWave, wins: hist.wins },
    // telemetry-checker contract (top-level booleans; killaudit metric-review lesson)
    national: hist.maxRank >= 2, table: !!hist.table, wins: hist.wins > 0, exiled: !!hist.exiled,
  };
  out.schemaClean = !!(out.kills && out.personDeaths) && out.kills.every(k => k.day != null && k.channel && k.outcome);
  return out;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const rows = [];
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      for (const arm of ARMS) {
        let r;
        try {
          r = await oneRun(seed, pid, arm);
        } catch (e) {
          console.error(`CRASH ${arm} ${pid} s${seed}: ${e && e.message}`);
          r = { schema: 'pitstaff-sweep-b/1', seed, policy: pid, arm, crashed: true, error: String(e && e.message).slice(0, 200) };
        }
        fs.writeFileSync(path.join(OUT, `${pid}-${arm}-${seed}.json`), JSON.stringify(r, null, 1));
        rows.push(r);
        if (!r.crashed) {
          console.log(`${pid}-${arm}-${seed}: days=${r.days} boarKills=${r.boarKills} boarMeatKcal=${r.boarMeatPantryKcal} pitsSet=${r.pitsSet} fatSlabs=${r.fatSlabUnits} trapDeaths=${r.trapDutyDeaths} pitL=${r.recipeLevels.pit_trap} errors=${r.errors} schemaClean=${r.schemaClean}`);
        }
      }
    }
  }
  const good = rows.filter(r => !r.crashed);
  const armed = good.filter(r => r.arm === 'armed'), control = good.filter(r => r.arm === 'control');
  const sum = (rs, f) => rs.reduce((a, r) => a + (r[f] || 0), 0);
  console.log('\n=== corpus vs pre-registration ===');
  console.log(`  runs: ${good.length}/${rows.length} (armed ${armed.length}, control ${control.length})`);
  console.log(`  ENGAGEMENT pit traps armed+set: armed=${sum(armed, 'pitsSet')} (bar >= 16; KILL if 0)`);
  console.log(`  PRIMARY boar kills armed: ${sum(armed, 'boarKills')} (bar >= 4); control: ${sum(control, 'boarKills')} (expected 0)`);
  console.log(`  PRIMARY boar-meat pantry kcal armed: ${sum(armed, 'boarMeatPantryKcal')} (bar >= 5000); control: ${sum(control, 'boarMeatPantryKcal')}`);
  console.log(`  corollary fat slabs armed: ${sum(armed, 'fatSlabUnits')} (killaudit bar was >= 12); control: ${sum(control, 'fatSlabUnits')}`);
  console.log(`  GUARD trap-duty deaths: armed=${sum(armed, 'trapDutyDeaths')} control=${sum(control, 'trapDutyDeaths')} (bar <= control+2)`);
  const med = (rs) => { const ds = rs.map(r => r.days || 0).sort((a, b) => a - b); return ds.length ? ds[Math.floor(ds.length / 2)] : 0; };
  console.log(`  GUARD median survival: armed=${med(armed)}d control=${med(control)}d (bar >= control-10d)`);
  const newModes = {};
  for (const r of armed) for (const d of (r.personDeaths || [])) { const c = String(d.cause || 'unknown'); newModes[c] = (newModes[c] || 0) + 1; }
  const ctlModes = new Set();
  for (const r of control) for (const d of (r.personDeaths || [])) ctlModes.add(String(d.cause || 'unknown'));
  const unseen = Object.keys(newModes).filter(c => !ctlModes.has(c));
  console.log(`  GUARD new death modes on armed: ${unseen.length ? unseen.join(', ') : 'none'}`);
  const wall = (rs) => ({ national: rs.filter(r => r.national).length, table: rs.filter(r => r.table).length, wins: rs.filter(r => r.wins).length,
    wave4: rs.filter(r => (r.wall || {}).maxWave >= 4).length, wave5: rs.filter(r => (r.wall || {}).maxWave >= 5).length });
  console.log(`  wall armed: ${JSON.stringify(wall(armed))} control: ${JSON.stringify(wall(control))}`);
  const err = good.filter(r => r.errors > 0 || !r.schemaClean);
  console.log(`  errors/schemaDirty: ${err.length}/${good.length}`);
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { oneRun, OUT };
