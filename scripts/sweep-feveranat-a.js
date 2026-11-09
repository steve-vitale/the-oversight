#!/usr/bin/env node
// sweep-feveranat-a.js — FEVER ANATOMY DIAGNOSIS (measurement only)
// (sim-feveranat-a, 2026-11-07, oversight-flesh-out-loop run fleshout-20261107T1928Z, axis
// food-economy. The 1820Z prodcollapse diagnosis proved HEALTH is the binding constraint of
// production collapse (seed 96203: fever from ~day 12, mean health ~55%, produced/need 0.67
// for 41 days, 3 starvation + 7 sickness deaths) — but the fever itself is UNNAMED in that
// corpus. This arm classifies EVERY fever/sickness episode on a fresh band: incidence,
// duration, vector attribution, treatment in the wild, production cost, spread. DIAG ONLY:
// zero src/js, no lever, no default flip.
//
// MODELED on scripts/sweep-prodcollapse-diag-a.js (commit 6e418c617, read in-tree; own code,
// same harness pattern). Declared deltas:
//   1. Names/paths: feveranat-a-*, corpus evidence/2026-11-07/feveranat-a-corpus/.
//   2. Seeds: exactly 96301-96308 (8 seeds, FRESH band — verified in the prereg across
//      every dated sim-*-prereg.md, the convergence tracker, and sim-findings.md).
//      Days 150 ONLY.
//   3. NEW event wrappers (all read-only, call-through, zero extra RNG — each logs to an
//      in-memory per-seed event array): villageSicknessTick (diff v.sick: onsets with
//      vector + onset conditions, ends with outcome), villagerFoodPoisoning (diff:
//      food-vector onsets), contractDisease (scholar onsets with the engine's own source
//      string), applyStatus (disease-roster ids only: alien quirks + tick_attached;
//      mundane excluded — they go through contractDisease; a reentrancy flag prevents
//      double-logging), villagerCareTick (diff daysLeft: tended patients;
 //      PLUS dutyCure events — a record present at care entry and gone at
 //      care exit was cured by the duty holder in this tick, including a
 //      record the infection loop created earlier in the SAME tick, which
 //      the outer tick wrapper's before/after diff can never see;
 //      sim-sametick-a 2026-11-09, 30 of 33 duty cures on the medicduty
 //      corpus),
//      villagerTreatTick (diff scholar easedUntil), diagnoseDisease (diagnosis events),
//      treatVillager / tendVillager (diff v.sick: cured/eased/wound-care), folkRemedy /
//      treatDisease / useMedicine (diff scholar seList — expected zero calls under
//      competent; the wrapper proves it), removeTick (clean vs botched), sickRestTick
//      (diff scholar seList), cureStatus (cure attribution + scholar sickEnds),
//      seRemove (scholar episode ends: expired vs removed-early).
//   4. villagerMealDay rows KEPT as in prodcollapse (expected, base, knowledgeFactor,
//      knownPlants, occupationFoodSkill, ageCap, healthFrac, trust, assigned task,
//      realized mult) — F5 needs produced/need/healthFrac per villager-day.
//   5. Daily snapshot EXTENDED: full v.sick map, scholar disease list, tickAttached,
//      healerPresent + medicCount, drinksDirty + water clean/dirty, triageHygiene,
//      sickMeanHealth vs healthyMeanHealth over the live roster.
//   6. BARE mode (FEVERANAT_BARE=1): same seeds/days/policy, all recorders SKIPPED
//      except the registerDeath capture (documented exception: it performs no
//      Game-state writes and consumes no RNG — it only appends to an external array),
//      writes only a fingerprint per seed. The recorded run must match it exactly (G2).
//   7. Everything else identical to the prodcollapse pattern: competent FIXED,
//      PLENTYDEPRI=1/DEPOSITGATE=1 FATAL-asserted, registerDeath CALLS THROUGH,
//      writeRobust (fresh child per attempt, 300 attempts, jittered sleep),
//      stdout to the caller's pipe.
//   8. EPISODE DAY CONVENTION (prereg): onset day is dayOf() at the creation call (the
//      night of that day for villageSicknessTick, which runs in endDay); the first
//      policy.daily snapshot showing the entry is the following day. Wrapper events are
//      authoritative; snapshots corroborate.
'use strict';
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

if (process.env.PLENTYDEPRI !== '1' || process.env.DEPOSITGATE !== '1') {
  // Env discipline is enforced for the CLI run (require.main === module);
  // the proof test requires this module in-process with env set by the test.
  if (require.main === module) {
    console.error('FATAL: PLENTYDEPRI=1 and DEPOSITGATE=1 must both be set explicitly (shipped defaults, explicit)');
    process.exit(2);
  }
}
const BARE = process.env.FEVERANAT_BARE === '1';
const SEEDS = (process.env.SEEDS || '')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const BATCH = [96301, 96302, 96303, 96304, 96305, 96306, 96307, 96308];
const isList = (list) => SEEDS.length === list.length && SEEDS.every((s, i) => s === list[i]);
const DAYS = parseInt(process.env.DAYS || '', 10);
const OUT = process.env.OUT || path.join(
  __dirname, '..', 'evidence', '2026-11-07', 'feveranat-a-corpus', 'sweep-competent.json');
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-11-07', 'feveranat-a-corpus');

function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

// ---- fever-anatomy helpers (pure reads only; no RNG, no Game-state writes) ----
// Disease roster from docs/DISEASES.md (mundane 6 + alien 9) + tick_attached.
const DISEASE_IDS = new Set(['disease', 'wound_fever', 'gutrot', 'lockjaw',
  'trichinosis', 'trembles', 'howlbelly', 'gristlefit', 'croakbelly', 'shellgut',
  'witness_maw', 'flockmind', 'eurika', 'east_nile', 'lemons', 'tick_attached']);
const MUNDANE_IDS = new Set(['disease', 'wound_fever', 'gutrot', 'lockjaw',
  'trichinosis', 'trembles']);
const MED_OCC = /nurse|medic|doctor|paramedic|midwife|veterinarian|pharmacist|herbalist|dentist/i;
// villageSicknessTick names map 1:1 to vectors (the engine enforces it).
function vectorForNpcTick(name, cond) {
  if (name === 'wound fever') return { vector: 'wound', evidence: 'hp<40 at onset: ' + (cond.hp != null ? (cond.hp + ' (<40: ' + (cond.hp < 40) + ')') : 'unknown') };
  if (name === 'gut rot') return { vector: 'dirty water', evidence: 'drinksDirty at onset: ' + cond.drinksDirty };
  if (name === 'tick fever') return { vector: 'tick', evidence: 'range profile at onset: ' + (cond.profile || 'unknown') + ' (forager/explorer: ' + (cond.profile === 'forager' || cond.profile === 'explorer') + ')' };
  return { vector: 'unattributed', evidence: 'villageSicknessTick created an unknown name: ' + String(name) };
}
function vectorForFoodName(name) {
  const n = String(name || '');
  if (/^food poisoning/.test(n)) return { vector: 'raw food', evidence: 'meal-time sicken: ' + n };
  if (n === 'bad belly') return { vector: 'unsafe food', evidence: 'meal-time sicken: bad belly' };
  if (n === 'spoiled gut') return { vector: 'spoiled food', evidence: 'meal-time sicken: spoiled gut (desperation)' };
  if (/^poisoned/.test(n)) return { vector: 'poison', evidence: 'meal-time sicken: ' + n };
  return { vector: 'unattributed', evidence: 'villagerFoodPoisoning created an unknown name: ' + n };
}
function vectorForScholarSource(src) {
  const s = String(src || '');
  if (s === 'a mosquito bite') return { vector: 'mosquito (ambient)', evidence: s };
  if (s === 'a heatwave mosquito bite') return { vector: 'mosquito (heatwave)', evidence: s };
  if (s === 'a tick bite') return { vector: 'tick (ambient)', evidence: s };
  if (s === 'a cut gone wrong' || s === 'a dirty cut') return { vector: 'wound', evidence: s };
  if (s === 'a botched tick removal') return { vector: 'tick-removal botch', evidence: s };
  if (s === 'the creek water') return { vector: 'dirty water', evidence: s };
  if (/^the /.test(s)) return { vector: 'food', evidence: s };
  return { vector: 'unattributed', evidence: 'contractDisease source not in map: ' + s };
}

// Writes go through a FRESH child process per attempt. Host EPERM-flap
// denial is STICKY per process once a write fails (2026-11-07: an in-process
// retry loop failed 300/300 over ~10 min while fresh processes wrote 1.5MB
// files 5/5 in the same minute). Retrying in-process is futile; each child
// reads the payload from stdin (a pipe, never a filesystem write), writes +
// readback-verifies + renames, and exits 0/1/3.
const CHILD_WRITER = `
// NOTE: with node -e, argv has NO script filename: args are argv[1]/argv[2].
const fs = require('fs');
const tmp = process.argv[1], dest = process.argv[2];
let data = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => { data += c; });
process.stdin.on('end', () => {
  try {
    fs.writeFileSync(tmp, data);
    const back = fs.readFileSync(tmp, 'utf8');
    if (back.length !== data.length) process.exit(3);
    fs.renameSync(tmp, dest);
    process.exit(0);
  } catch (e) { process.exit(1); }
});
`;
function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 300; i++) {
    const r = child_process.spawnSync(process.execPath,
      ['-e', CHILD_WRITER, tmp, filePath],
      { input: data, encoding: 'utf8', timeout: 30000, maxBuffer: 64 * 1024 * 1024 });
    if (r.status === 0) return;
    if (i === 299) { console.error('WRITE FAIL LOUDLY', filePath, 'child status=' + r.status); process.exit(2); }
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500 + Math.floor(Math.random() * 2500));
  }
}

async function oneRun(seed, days, opts) {
  const bare = !!(opts && opts.bare);
  const { Game } = await loadGame({ seed, mode: 'feveranat-a-competent', fullTelemetry: false });
  await setupGame(Game);
  const W = {
    deaths: [], deathSeen: new Set(), mealRows: [], mealDup: 0,
    daySeries: [], flowSeries: [], sayWin: [], teleWin: [],
    villageDays: 0, starveDays: 0, resDepth: 0,
    // fever-anatomy event arrays (chronological; wrapper events are authoritative)
    sickOnsets: [], sickEnds: [], treatEvents: [], statusEvents: [],
    diagnoses: [], cureEvents: [],
  };
  const trunc = (t) => String(t == null ? '' : t).slice(0, 170);
  const dayOf = () => (((Game.state || {}).scholar || {}).day || 0);
  // Fever helpers bound to this run's Game (all pure reads; no RNG, no writes).
  const npcName = (vid) => {
    try { const p = Game.getPerson && Game.getPerson(vid); if (p && p.name) return String(p.name).split(' ')[0]; } catch (e) {}
    return 'Someone';
  };
  const diseaseIdForNpcName = (name) => {
    try { if (Game.villagerDiseaseId) return Game.villagerDiseaseId({ name }) || null; } catch (e) {}
    const m = { 'wound fever': 'wound_fever', 'gut rot': 'gutrot', 'tick fever': 'disease' };
    return m[name] || null;
  };
  const medicIds = () => {
    const out = [];
    try {
      const v = (Game.state || {}).village || {};
      for (const id of (v.roster || [])) {
        if (id === Game.villagerId) continue;
        let p = null; try { p = Game.getPerson(id); } catch (e) {}
        if (!p || p.dead) continue;
        const msick = (v.sick || {})[id];
        if (msick && (msick.severity || 1) >= 2) continue;
        if (MED_OCC.test(String(p.formerOccupation || '').toLowerCase())) out.push(String(id).slice(0, 24));
      }
    } catch (e) {}
    return out;
  };
  const healerPresentNow = () => {
    try { return Game.campHealerId ? Game.campHealerId('haven') != null : null; } catch (e) { return null; }
  };
  const scholarDiseaseList = () => {
    const out = [];
    try {
      const list = Game.seList ? Game.seList('scholar') : [];
      const diag = ((Game.state || {}).scholar || {}).diagnosed || {};
      for (const e of list) {
        if (!DISEASE_IDS.has(e.id)) continue;
        out.push({ id: e.id, dayPartsLeft: e.dayPartsLeft == null ? null : e.dayPartsLeft,
          diagnosed: !!diag[e.id], severe: !!e.severe, stacks: e.stacks || 1,
          easedUntil: e.easedUntil == null ? null : e.easedUntil });
      }
    } catch (e) {}
    return out;
  };
  const scholarDiseaseMap = () => {
    const m = {};
    for (const e of scholarDiseaseList()) m[e.id] = e;
    return m;
  };
  const flowFor = (day) => {
    let f = W.flowSeries.find(x => x.day === day);
    if (!f) {
      f = { day, stocked: {}, stored: 0, pantryAdd: 0, donated: 0, league: 0,
        drawn: 0, drawGap: 0, spoiledDrawn: 0, spoiledSwept: 0, takeBulk: 0,
        removedKcal: 0, produced: 0, need: 0,
        ate: 0, ownEat: 0, gave: 0, resolved: {}, redirectResolved: {},
        vigorSum: 0, vigorN: 0, depletedSum: 0, barrenSum: 0, forageCalls: 0,
        huntKcal: 0, huntZero: 0, huntCalls: 0, zones: {} };
      W.flowSeries.push(f);
    }
    return f;
  };
  const pantryLive = () => {
    try { if (Game.pantryKcalLive) return Math.round(Game.pantryKcalLive(Game.state.village)); } catch (e) { return null; }
  };

  const snapContext = () => {
    let freshDays = null, pantryKcal = null, freshKcal = null, spoiledKcal = 0,
      preservedKcal = 0, itemCount = 0, unknownCount = 0, pop = null, hungry = 0, awayAtDeath = null;
    try { if (Game.pantryFreshDays) freshDays = Math.round(Game.pantryFreshDays() * 10) / 10; } catch (e) {}
    try { pantryKcal = pantryLive(); } catch (e) {}
    try { if (Game.pantryFreshKcal) freshKcal = Math.round(Game.pantryFreshKcal()); } catch (e) {}
    try {
      const pantry = ((Game.state || {}).village || {}).pantry || [];
      itemCount = pantry.length;
      for (const it of pantry) {
        if (!it) continue;
        if ((it.kcalEach || 0) <= 0) unknownCount++;
        const k = (it.kcalEach || 0) * (it.units || 1);
        try {
          if (it.foodState === 'preserved' || it.foodState === 'rendered' || (it.foodKind || '') === 'pemmican') preservedKcal += k;
          else if (Game.isSpoiled && Game.isSpoiled(it)) spoiledKcal += k;
        } catch (e2) {}
      }
      spoiledKcal = Math.round(spoiledKcal);
      preservedKcal = Math.round(preservedKcal);
    } catch (e) {}
    try {
      const roster = ((Game.state || {}).village || {}).roster || [];
      pop = roster.length;
      for (const id of roster) { try { if (Game.npcNeeds && (Game.npcNeeds(id).hunger || 0) > 70) hungry++; } catch (e2) {} }
    } catch (e) {}
    return { freshDays, pantryKcal, pantryFreshKcal: freshKcal, pantrySpoiledKcal: spoiledKcal,
      preservedKcal, pantryItemCount: itemCount, unknownKcal0Count: unknownCount, pop, hungry, awayAtDeath };
  };

  // --- deaths: CALL-THROUGH capture (kept even in BARE mode: the documented
  // exception — it performs no Game-state writes and consumes no RNG, it only
  // appends to the external W array, so it cannot change the trajectory) ---
  const oDie = Game.registerDeath;
  if (typeof oDie === 'function') Game.registerDeath = function (opts) {
    let row = null;
    try {
      const kind = String((opts && opts.kind) || '');
      if (kind === 'person' || kind === 'villager') {
        const whoId = String((opts && (opts.villagerId || '')) || '');
        const who = whoId || String((opts && opts.name) || '?');
        const day = dayOf();
        const cause = canonCause((opts && opts.cause) || '?');
        const key = who + '|' + day + '|' + cause;
        if (!W.deathSeen.has(key)) {
          W.deathSeen.add(key);
          let whoName = who.slice(0, 24);
          try {
            const nm = Game.npcName && Game.npcName(who);
            if (nm && nm !== 'Someone') whoName = String(nm).slice(0, 24);
          } catch (e) {}
          const ctx = bare ? null : snapContext();
          const v = (Game.state || {}).village || {};
          if (ctx) ctx.awayAtDeath = whoId ? !!((v.away || {})[whoId]) : null;
          row = { day, who: who.slice(0, 24), whoName, kind, cause,
            isPlayer: whoId ? (whoId === Game.villagerId) : false,
            ctx, sayWin: bare ? [] : W.sayWin.slice(-8), teleWin: bare ? [] : W.teleWin.slice(-8) };
          W.deaths.push(row);
        }
      }
    } catch (e) {}
    return oDie.apply(this, arguments);
  };

  if (!bare) {
    // --- transcript windows ---
    const oSay = Game.say;
    if (typeof oSay === 'function') Game.say = function (txt) {
      try { W.sayWin.push('d' + dayOf() + ' ' + trunc(txt)); if (W.sayWin.length > 20) W.sayWin.shift(); } catch (e) {}
      return oSay.apply(this, arguments);
    };
    const oTele = Game.tele;
    if (typeof oTele === 'function') Game.tele = function (type, data) {
      try {
        W.teleWin.push('d' + dayOf() + ' ' + String(type) + ' ' + trunc(data ? JSON.stringify(data) : ''));
        if (W.teleWin.length > 20) W.teleWin.shift();
      } catch (e) {}
      return oTele.apply(this, arguments);
    };

    // --- flow wrappers: read-only, call-through, no RNG ---
    const wrapFlow = (name) => {
      const o = Game[name];
      if (typeof o !== 'function') return;
      Game[name] = function (...args) {
        const day = dayOf();
        if (name === 'stockPantry') {
          const kcal = Math.round(args[0] || 0);
          const nm = String(args[1] || 'unnamed').slice(0, 40);
          const f = flowFor(day);
          if (kcal > 0) f.stocked[nm] = (f.stocked[nm] || 0) + kcal;
        } else if (name === 'sweepSpoiled') {
          const before = pantryLive();
          const r = o.apply(this, args);
          const after = pantryLive();
          if (before != null && after != null && before > after) flowFor(day).spoiledSwept += (before - after);
          return r;
        } else if (name === 'pantryDraw') {
          const r = o.apply(this, args);
          try {
            if (r && r.taken > 0) flowFor(day).drawn += Math.round(r.taken);
            if (r && r.items) {
              let gap = 0;
              for (const d of r.items) gap += (d.units || 0) * (((d.item || {}).kcalEach || 0) - (d.effectiveKcal || 0));
              flowFor(day).drawGap += Math.round(gap);
            }
          } catch (e) {}
          return r;
        } else if (name === 'drawSpoiled') {
          const r = o.apply(this, args);
          if (r > 0) flowFor(day).spoiledDrawn += Math.round(r);
          return r;
        } else if (name === 'stockSurplus') {
          const r = o.apply(this, args);
          if (r > 0) flowFor(day).stored += Math.round(r);
          return r;
        } else if (name === 'drawLeaguePool') {
          const r = o.apply(this, args);
          if (r > 0) flowFor(day).league += Math.round(r);
          return r;
        } else if (name === 'pantryAdd' || name === 'donateToPantry') {
          const before = pantryLive();
          const r = o.apply(this, args);
          const after = pantryLive();
          if (before != null && after != null && after > before) {
            flowFor(day)[name === 'pantryAdd' ? 'pantryAdd' : 'donated'] += (after - before);
          }
          return r;
        } else if (name === '_removePantryKcal') {
          const r = o.apply(this, args);
          if (r > 0) flowFor(day).removedKcal += Math.round(r);
          return r;
        } else if (name === 'takeFromPantryBulk' || name === 'takeFromPantry') {
          const before = pantryLive();
          const r = o.apply(this, args);
          const after = pantryLive();
          if (before != null && after != null && before > after) flowFor(day).takeBulk += (before - after);
          return r;
        }
        return o.apply(this, args);
      };
    };
    for (const n of ['stockPantry', 'sweepSpoiled', 'pantryDraw', 'drawSpoiled',
      'stockSurplus', 'drawLeaguePool', 'pantryAdd', 'donateToPantry',
      'takeFromPantryBulk', 'takeFromPantry', '_removePantryKcal']) wrapFlow(n);

    // --- NEW: forage depletion per call (villagerDepleteTiles returns the dep object) ---
    const oDep = Game.villagerDepleteTiles;
    if (typeof oDep === 'function') Game.villagerDepleteTiles = function (vid, amount) {
      const r = oDep.apply(this, arguments);
      try {
        const f = flowFor(dayOf());
        f.forageCalls++;
        if (r && typeof r.avgVigor === 'number') { f.vigorSum += r.avgVigor; f.vigorN++; }
        if (r) { f.depletedSum += r.depleted || 0; f.barrenSum += r.barren || 0; }
        if (r && r.zone) f.zones[r.zone] = (f.zones[r.zone] || 0) + 1;
      } catch (e) {}
      return r;
    };

    // --- NEW: hunt outcome per call (villagerHuntResolve returns {kcal, aid, msg}) ---
    const oHunt = Game.villagerHuntResolve;
    if (typeof oHunt === 'function') Game.villagerHuntResolve = function (vid, eff) {
      const r = oHunt.apply(this, arguments);
      try {
        const f = flowFor(dayOf());
        f.huntCalls++;
        const kcal = (r && typeof r.kcal === 'number') ? Math.round(r.kcal) : 0;
        f.huntKcal += kcal;
        if (kcal === 0) f.huntZero++;
      } catch (e) {}
      return r;
    };

    // --- duty resolution counts (outermost only; redirect re-resolution separate) ---
    const oRes = Game.resolveOneAssignment;
    if (typeof oRes === 'function') Game.resolveOneAssignment = function (vid, a) {
      const day = dayOf();
      const task = String((a && a.task) || '?');
      const f = flowFor(day);
      if (W.resDepth === 0) f.resolved[task] = (f.resolved[task] || 0) + 1;
      else f.redirectResolved[task] = (f.redirectResolved[task] || 0) + 1;
      W.resDepth++;
      try { return oRes.apply(this, arguments); } finally { W.resDepth--; }
    };

    // --- villagerMealDay wrapper (reads only, no RNG) + production-factor capture ---
    const oMeal = Game.villagerMealDay;
    if (typeof oMeal === 'function') Game.villagerMealDay = function (vid, person, v, ctx) {
      const day = dayOf();
      let hungerBefore = null, healthBefore = null, needEst = 2000, awayBefore = null;
      try { awayBefore = !!(((v || Game.state.village || {}).away || {})[vid]); } catch (e) {}
      try { const n = Game.npcNeeds && Game.npcNeeds(vid); hungerBefore = n ? (n.hunger || 0) : null; } catch (e) {}
      try { healthBefore = ((v || Game.state.village || {}).health || {})[vid]; if (healthBefore === undefined) healthBefore = 100; } catch (e) {}
      try { const p = person || (Game.getPerson && Game.getPerson(vid)); if (p && p.kcalPerDay) needEst = p.kcalPerDay; } catch (e) {}
      let result = null;
      try { result = oMeal.apply(this, arguments); } catch (e) { throw e; }
      let hungerAfter = null, healthAfter = null, produced = null, expected = null;
      try { const n = Game.npcNeeds && Game.npcNeeds(vid); hungerAfter = n ? (n.hunger || 0) : null; } catch (e) {}
      try { healthAfter = ((v || Game.state.village || {}).health || {})[vid]; if (healthAfter === undefined) healthAfter = null; } catch (e) {}
      try { const lg = ((v || Game.state.village || {}).contribLog || {})[vid]; if (lg) { produced = lg.produced; expected = lg.expected; } } catch (e) {}
      // Production-factor decomposition (all reads, no RNG): base capacity,
      // knowledge, occupation skill, age capacity, health fraction, trust,
      // assigned task. These are the levers the collapse diagnosis ranks.
      let base = null, kf = null, knownN = null, occSkill = null, ageCap = null,
        healthFrac = null, trust = null, task = null, mult = null;
      try {
        const p = person || (Game.getPerson && Game.getPerson(vid));
        if (p) {
          if (Game.villagerFoodBase) base = Math.round(Game.villagerFoodBase(p));
          if (Game.occupationFoodSkill) occSkill = Game.occupationFoodSkill(p.formerOccupation || p.occupation);
          if (Game.ageCapacity) ageCap = Game.ageCapacity(p.age);
        }
        if (Game.villagerKnowledgeFactor) kf = Math.round(Game.villagerKnowledgeFactor(vid, v) * 1000) / 1000;
        if (Game.plantsKnownBy) knownN = Game.plantsKnownBy(vid, v).length;
        const h = ((v || Game.state.village || {}).health || {})[vid];
        healthFrac = Math.round(((h === undefined ? 100 : h) / 100) * 1000) / 1000;
        const tv = ((v || Game.state.village || {}).trust || {})[vid];
        trust = (tv === undefined ? null : tv);
        const asg = ((v || Game.state.village || {}).assignments || {})[vid];
        task = asg ? String(asg.task || '?') : null;
        if (produced != null && expected != null && expected > 0) mult = Math.round((produced / expected) * 1000) / 1000;
      } catch (e) {}
      const ate = result ? (result.ate ?? null) : null;
      const drawn = result ? (result.drawn ?? null) : null;
      const gave = result ? (result.gave ?? null) : null;
      const ownEat = (ate != null && drawn != null) ? Math.max(0, ate - drawn) : null;
      const f = flowFor(day);
      if (produced != null) f.produced += Math.round(produced);
      if (needEst) f.need += Math.round(needEst);
      if (ate != null) f.ate += Math.round(ate);
      if (ownEat != null) f.ownEat += Math.round(ownEat);
      if (gave != null) f.gave += Math.round(gave);
      const key = String(vid) + '|' + day;
      const dupIdx = W.mealRows.findIndex(r => r._key === key);
      const row = { _key: key, vid: String(vid).slice(0, 24), day, away: awayBefore,
        ate, drawn, gave, ownEat, produced, expected, base, kf, knownN, occSkill,
        ageCap, healthFrac, trust, task, mult,
        fasting: result ? !!result.fasting : false,
        hungerBefore, hungerAfter, healthBefore, healthAfter, needEst };
      if (dupIdx >= 0) { W.mealDup++; W.mealRows[dupIdx] = row; }
      else W.mealRows.push(row);
      return result;
    };

    // ---- FEVER-ANATOMY wrappers (all read-only, call-through, zero extra RNG) ----
    // villageSicknessTick: diff v.sick before/after (onsets with vector + onset
    // conditions; ends with outcome). The tick also calls villagerCareTick at its
    // end; the care wrapper below fires nested and logs its own diffs — this
    // wrapper uses presence/absence only, so no double counting.
    // SAME-TICK LIMIT (sim-sametick-a): a record created by this tick's
    // infection loop and deleted by the nested care pass (duty cure) is in
    // NEITHER the before nor the after map, so this wrapper cannot see it.
    // That case is captured by the villagerCareTick wrapper below, which
    // observes the record at care entry and logs its deletion as a
    // 'dutyCure' treatEvent; the analyzer joins it to the episode (or
    // synthesizes the 0-day episode). See the care wrapper comment.
    const oVST = Game.villageSicknessTick;
    if (typeof oVST === 'function') Game.villageSicknessTick = function () {
      let before = null, beforeMeta = {}, condBefore = null;
      try {
        const v = (Game.state || {}).village || {};
        before = JSON.parse(JSON.stringify(v.sick || {}));
        for (const vid of Object.keys(before)) {
          let dead = false; try { const p = Game.vpOf && Game.vpOf(vid); dead = !!(p && p.dead); } catch (e) {}
          beforeMeta[vid] = { onRoster: (v.roster || []).includes(vid), dead };
        }
        const drinksDirty = !!v.drankDirty || (((v.water || {}).clean || 0) <= 0 && ((v.water || {}).dirty || 0) > 0);
        let hygiene = false;
        try { hygiene = !!((v.triageHygiene || {}).until >= dayOf()); } catch (e) {}
        const cond = {};
        // HP for EVERY roster villager, not just the currently-healthy: a
        // villager who recovers in this tick can be re-infected in the SAME
        // tick (candidates are computed after the recovery loop), and the
        // re-infection onset needs its own onset conditions.
        for (const vid of (v.roster || [])) {
          let hp = null; try { const h = (v.health || {})[vid]; hp = (h === undefined ? 100 : h); } catch (e) {}
          cond[vid] = { hp, drinksDirty, hygiene };
        }
        condBefore = { cond, drinksDirty, hygiene, healerPresent: healerPresentNow(),
          medicCount: medicIds().length, pop: (v.roster || []).length,
          waterClean: (v.water || {}).clean || 0, waterDirty: (v.water || {}).dirty || 0 };
      } catch (e) {}
      const r = oVST.apply(this, arguments);
      try {
        const v = (Game.state || {}).village || {};
        const after = v.sick || {};
        const day = dayOf();
        for (const vid of Object.keys(after)) {
          // SAME-TICK TURNOVER (found by the G3 check on the judged corpus):
          // a villager who recovers in this tick is a candidate again in the
          // SAME tick and can fall sick with a DIFFERENT disease at once.
          // Diff by (vid, name), not vid presence: a name change is BOTH an
          // end for the old spell and an onset for the new one. Presence-only
          // diffing silently dropped 3 such turnovers (orphan ends + open
          // onsets) on the first judged run.
          const prev = before ? before[vid] : null;
          if (prev && prev.name === after[vid].name) continue; // continuing spell
          const rec = after[vid];
          let profile = null;
          try { const a = Game.agencyState && Game.agencyState(); profile = (a && a.profiles && a.profiles[vid]) || null; } catch (e) {}
          const c = (condBefore && condBefore.cond && condBefore.cond[vid]) || {};
          const vec = vectorForNpcTick(rec.name, { hp: c.hp, profile, drinksDirty: (condBefore || {}).drinksDirty, hygiene: (condBefore || {}).hygiene });
          W.sickOnsets.push({ day, who: String(vid).slice(0, 24), whoName: npcName(vid), kind: 'npc',
            name: rec.name, diseaseId: diseaseIdForNpcName(rec.name), vector: vec.vector,
            vectorSource: 'villageSicknessTick', vectorEvidence: vec.evidence,
            daysLeft0: rec.daysLeft, severity: rec.severity,
            hpAtOnset: c.hp == null ? null : c.hp, rangeProfile: profile,
            drinksDirty: (condBefore || {}).drinksDirty, hygiene: (condBefore || {}).hygiene,
            healerPresent: (condBefore || {}).healerPresent, medicCount: (condBefore || {}).medicCount,
            sayWin: W.sayWin.slice(-3) });
        }
        for (const vid of Object.keys(before || {})) {
          const rec = before[vid];
          // Name change in one tick = the old spell ended (paired below by
          // the analyzer's FIFO on (who, name)); same name still present =
          // continuing spell, no end.
          if (after[vid] && after[vid].name === rec.name) continue;
          const meta = beforeMeta[vid] || {};
          let aliveNow = false;
          try { const p = Game.vpOf && Game.vpOf(vid); aliveNow = (v.roster || []).includes(vid) && !(p && p.dead); } catch (e) {}
          // was on-roster + alive before the tick and is dead/gone after: the
          // tick killed them (hurtVillager) — outcome 'died'. Was already dead
          // or off-roster before: stale-record cleanup, not an episode end.
          const outcome = (!meta.onRoster || meta.dead) ? 'stale-cleanup' : (aliveNow ? 'recovered' : 'died');
          W.sickEnds.push({ day, who: String(vid).slice(0, 24), whoName: npcName(vid), kind: 'npc',
            name: rec.name, diseaseId: diseaseIdForNpcName(rec.name), outcome, by: 'villageSicknessTick' });
        }
      } catch (e) {}
      return r;
    };

    // villagerFoodPoisoning: diff v.sick before/after (food-vector onsets).
    const oVFP = Game.villagerFoodPoisoning;
    if (typeof oVFP === 'function') Game.villagerFoodPoisoning = function (v, vid, exposure) {
      let before = null;
      try { before = (v && v.sick && v.sick[vid]) ? JSON.parse(JSON.stringify(v.sick[vid])) : null; } catch (e) {}
      const r = oVFP.apply(this, arguments);
      try {
        const after = (v && v.sick && v.sick[vid]) || null;
        if (!before && after) {
          const vec = vectorForFoodName(after.name);
          W.sickOnsets.push({ day: dayOf(), who: String(vid).slice(0, 24), whoName: npcName(vid),
            kind: 'npc', name: after.name, diseaseId: diseaseIdForNpcName(after.name),
            vector: vec.vector, vectorSource: 'villagerFoodPoisoning', vectorEvidence: vec.evidence,
            daysLeft0: after.daysLeft, severity: after.severity,
            hpAtOnset: null, rangeProfile: null, drinksDirty: null, hygiene: null,
            healerPresent: healerPresentNow(), medicCount: medicIds().length,
            sayWin: W.sayWin.slice(-3) });
        }
      } catch (e) {}
      return r;
    };

    // contractDisease: scholar onsets with the engine's own source string.
    // The reentrancy flag keeps the applyStatus wrapper below from double-logging
    // the same contraction (contractDisease applies via applyStatus internally).
    let inContractDisease = false;
    const oCD = Game.contractDisease;
    if (typeof oCD === 'function') Game.contractDisease = function (effectId, opts) {
      // Pre-call presence: applyStatus REFRESHES an existing entry (and
      // increments stacks) and still returns true, so a second contraction
      // of a disease the scholar already has is a refresh of the SAME
      // episode, not a new onset. Without this check the scholar eating raw
      // food twice in one day logged two onsets for one entry (96308 d7:
      // two 'disease' onsets, one expiry, one phantom open episode).
      let hadIt = false;
      try { if (Game.hasStatus) hadIt = !!Game.hasStatus('scholar', effectId); } catch (e) {}
      inContractDisease = true;
      let r = false;
      try { r = oCD.apply(this, arguments); } finally { inContractDisease = false; }
      try {
        if (r && !hadIt) {
          const entry = (Game.seList ? Game.seList('scholar') : []).find(e => e.id === effectId);
          const src = (opts && opts.source) || null;
          const vec = vectorForScholarSource(src);
          W.sickOnsets.push({ day: dayOf(), who: 'scholar', whoName: 'scholar', kind: 'scholar',
            name: effectId, diseaseId: effectId, vector: vec.vector,
            vectorSource: 'contractDisease', vectorEvidence: vec.evidence, source: src,
            dayPartsLeft0: entry ? entry.dayPartsLeft : null,
            severity: entry && entry.severe ? 2 : 1,
            hpAtOnset: null, rangeProfile: null, drinksDirty: null, hygiene: null,
            healerPresent: healerPresentNow(), medicCount: medicIds().length,
            sayWin: W.sayWin.slice(-3) });
        }
      } catch (e) {}
      return r;
    };

    // applyStatus: disease-roster ids only. Catches alien quirks + tick_attached
    // on any target, and any mundane disease applied WITHOUT going through
    // contractDisease (a finding in itself). Pre-call presence check: a refresh
    // of an existing entry is not a new onset.
    const oAS = Game.applyStatus;
    if (typeof oAS === 'function') Game.applyStatus = function (target, effectId, opts) {
      let hadIt = false;
      try {
        if (DISEASE_IDS.has(effectId) && Game.hasStatus) hadIt = !!Game.hasStatus(target, effectId);
      } catch (e) {}
      const r = oAS.apply(this, arguments);
      try {
        if (r && DISEASE_IDS.has(effectId) && !inContractDisease && !hadIt) {
          let who = null, whoName = null, kind = null;
          if (target === 'scholar') { who = 'scholar'; whoName = 'scholar'; kind = 'scholar'; }
          else if (target && typeof target === 'object') {
            who = String(target.villagerId || target.id || '?').slice(0, 24);
            whoName = String(target.name || 'Someone').split(' ')[0];
            kind = 'npc-status';
          }
          if (!who) return r;
          const src = (opts && opts.source) || null;
          const pool = (() => { try { const d = Game.seDef && Game.seDef(effectId); return (d && d.pool) || null; } catch (e) { return null; } })();
          if (effectId === 'tick_attached') {
            W.statusEvents.push({ day: dayOf(), kind: 'tick_attached', who, whoName, source: src, sayWin: W.sayWin.slice(-3) });
          } else if (pool === 'alien') {
            W.statusEvents.push({ day: dayOf(), kind: 'alien-quirk', who, whoName, diseaseId: effectId, source: src, sayWin: W.sayWin.slice(-3) });
          } else {
            // Mundane disease via direct applyStatus, bypassing contractDisease.
            W.statusEvents.push({ day: dayOf(), kind: 'disease-direct', who, whoName, diseaseId: effectId, source: src, sayWin: W.sayWin.slice(-3) });
            W.sickOnsets.push({ day: dayOf(), who, whoName, kind: kind === 'scholar' ? 'scholar' : 'npc',
              name: effectId, diseaseId: effectId, vector: 'unattributed',
              vectorSource: 'applyStatus-direct', vectorEvidence: 'mundane disease applied without contractDisease; source: ' + String(src),
              daysLeft0: null, severity: 1, hpAtOnset: null, rangeProfile: null,
              drinksDirty: null, hygiene: null, healerPresent: healerPresentNow(), medicCount: medicIds().length,
              sayWin: W.sayWin.slice(-3) });
          }
        }
      } catch (e) {}
      return r;
    };

    // villagerCareTick: diff daysLeft (tended patients only). Called inside
    // villageSicknessTick, after the tick's own daysLeft-=1 loop, so this diff
    // isolates the care effect.
    // SAME-TICK CURE CAPTURE (sim-sametick-a, 2026-11-09): the care pass is
    // also the ONLY deleter of v.sick inside the tick (medicDutyCureAttempt
    // deletes the record directly — game.js cureIt; the tend path only
    // decrements daysLeft). A record present at care entry and GONE at care
    // exit was cured by the duty holder in this tick — including a record
    // the infection loop created EARLIER IN THE SAME tick, which the outer
    // tick wrapper's before/after diff can never see (it is in neither map:
    // 30 of 33 duty cures on the medicduty corpus). The deletion is logged
    // as a 'dutyCure' treatEvent, never a sickEnd (the tick wrapper already
    // logs the 'recovered' end for multi-day cures, and a second end would
    // orphan-pair). The analyzer joins the event to the open episode, or
    // synthesizes a 0-day episode when no onset exists.
    const oVCT = Game.villagerCareTick;
    if (typeof oVCT === 'function') Game.villagerCareTick = function (nm) {
      let before = null, medics = [], holder = null;
      try {
        const v = (Game.state || {}).village || {};
        before = {};
        for (const [vid, rec] of Object.entries(v.sick || {})) {
          before[vid] = { name: rec.name, daysLeft: rec.daysLeft,
            severity: rec.severity == null ? null : rec.severity };
        }
        medics = medicIds();
        try { holder = Game.medicDutyHolder ? Game.medicDutyHolder() : null; } catch (e2) {}
      } catch (e) {}
      const r = oVCT.apply(this, arguments);
      try {
        const v = (Game.state || {}).village || {};
        for (const vid of Object.keys(before || {})) {
          const b = before[vid];
          const after = (v.sick || {})[vid];
          if (!after) {
            // Record deleted inside care: the duty holder cured this
            // patient (the only deletion in villagerCareTick). The record
            // may have existed for days (onset logged earlier — the
            // analyzer joins to that episode) or have been created by
            // this same tick's infection loop (no onset exists — the
            // analyzer synthesizes the 0-day episode).
            W.treatEvents.push({ day: dayOf(), kind: 'dutyCure', who: String(vid).slice(0, 24),
              whoName: npcName(vid), diseaseName: b.name,
              diseaseId: diseaseIdForNpcName(b.name),
              daysLeftBefore: b.daysLeft, holder: holder ? String(holder).slice(0, 24) : null,
              medics: medics.slice(0, 8) });
          } else if (after.daysLeft < b.daysLeft) {
            W.treatEvents.push({ day: dayOf(), kind: 'villagerCare', who: String(vid).slice(0, 24),
              whoName: npcName(vid), diseaseName: after.name,
              diseaseId: diseaseIdForNpcName(after.name),
              daysLeftBefore: b.daysLeft, daysLeftAfter: after.daysLeft, medics: medics.slice(0, 8) });
          }
        }
      } catch (e) {}
      return r;
    };

    // villagerTreatTick: a medic eases the scholar's sickness (easedUntil moves;
    // dayPartsLeft does not — diff both).
    const oVTT = Game.villagerTreatTick;
    if (typeof oVTT === 'function') Game.villagerTreatTick = function () {
      let before = null;
      try { before = scholarDiseaseMap(); } catch (e) {}
      const r = oVTT.apply(this, arguments);
      try {
        const after = scholarDiseaseMap();
        for (const id of Object.keys(after)) {
          const b = (before || {})[id], a = after[id];
          if (b && (a.easedUntil || 0) > (b.easedUntil || 0)) {
            W.treatEvents.push({ day: dayOf(), kind: 'villagerTreat', who: 'scholar', whoName: 'scholar',
              diseaseId: id, easedUntilBefore: b.easedUntil || null, easedUntilAfter: a.easedUntil || null,
              dayPartsLeftBefore: b.dayPartsLeft, dayPartsLeftAfter: a.dayPartsLeft });
          }
        }
      } catch (e) {}
      return r;
    };

    // diagnoseDisease: every diagnosis (player examine / medic naming / treat path).
    const oDD = Game.diagnoseDisease;
    if (typeof oDD === 'function') Game.diagnoseDisease = function (target, effectId, opts) {
      const r = oDD.apply(this, arguments);
      try {
        if (r) W.diagnoses.push({ day: dayOf(),
          target: target === 'scholar' ? 'scholar' : String((target && (target.villagerId || target.id)) || '?').slice(0, 24),
          diseaseId: effectId, by: (opts && opts.by) || null });
      } catch (e) {}
      return r;
    };

    // treatVillager: diff v.sick (cured = record deleted; eased = daysLeft down).
    // A cure also closes the episode (sickEnd, outcome 'cured').
    const oTV = Game.treatVillager;
    if (typeof oTV === 'function') Game.treatVillager = function (vid, abilityId) {
      let before = null;
      try { const v = (Game.state || {}).village || {}; before = (v.sick || {})[vid] ? JSON.parse(JSON.stringify(v.sick[vid])) : null; } catch (e) {}
      const r = oTV.apply(this, arguments);
      try {
        const v = (Game.state || {}).village || {};
        const after = (v.sick || {})[vid] || null;
        if (before) {
          if (!after) {
            W.treatEvents.push({ day: dayOf(), kind: 'treatVillager', who: String(vid).slice(0, 24), whoName: npcName(vid), abilityId, diseaseName: before.name, diseaseId: diseaseIdForNpcName(before.name), result: 'cured', daysLeftBefore: before.daysLeft, daysLeftAfter: 0 });
            W.sickEnds.push({ day: dayOf(), who: String(vid).slice(0, 24), whoName: npcName(vid), kind: 'npc', name: before.name, diseaseId: diseaseIdForNpcName(before.name), outcome: 'cured', by: 'treatVillager:' + abilityId });
          } else if (after.daysLeft < before.daysLeft) {
            W.treatEvents.push({ day: dayOf(), kind: 'treatVillager', who: String(vid).slice(0, 24), whoName: npcName(vid), abilityId, diseaseName: before.name, diseaseId: diseaseIdForNpcName(before.name), result: 'eased', daysLeftBefore: before.daysLeft, daysLeftAfter: after.daysLeft });
          } else {
            W.treatEvents.push({ day: dayOf(), kind: 'treatVillager', who: String(vid).slice(0, 24), whoName: npcName(vid), abilityId, diseaseName: before.name, diseaseId: diseaseIdForNpcName(before.name), result: 'no-change', daysLeftBefore: before.daysLeft, daysLeftAfter: after.daysLeft });
          }
        }
      } catch (e) {}
      return r;
    };

    // tendVillager: diff v.sick daysLeft, or wound-care HP gain when not sick.
    const oTend = Game.tendVillager;
    if (typeof oTend === 'function') Game.tendVillager = function (vid) {
      let before = null, hpBefore = null;
      try { const v = (Game.state || {}).village || {}; before = (v.sick || {})[vid] ? JSON.parse(JSON.stringify(v.sick[vid])) : null; hpBefore = (v.health || {})[vid]; } catch (e) {}
      const r = oTend.apply(this, arguments);
      try {
        const v = (Game.state || {}).village || {};
        const after = (v.sick || {})[vid] || null;
        const hpAfter = (v.health || {})[vid];
        if (before && after && after.daysLeft < before.daysLeft) {
          W.treatEvents.push({ day: dayOf(), kind: 'tendVillager', who: String(vid).slice(0, 24), whoName: npcName(vid), diseaseName: before.name, diseaseId: diseaseIdForNpcName(before.name), result: 'eased', daysLeftBefore: before.daysLeft, daysLeftAfter: after.daysLeft, hpBefore: hpBefore == null ? null : hpBefore, hpAfter: hpAfter == null ? null : hpAfter });
        } else if (!before && hpBefore != null && hpAfter != null && hpAfter > hpBefore) {
          W.treatEvents.push({ day: dayOf(), kind: 'tendVillager', who: String(vid).slice(0, 24), whoName: npcName(vid), diseaseName: null, diseaseId: null, result: 'wound-care', hpBefore, hpAfter });
        }
      } catch (e) {}
      return r;
    };

    // Scholar self-treatment (folkRemedy / treatDisease / useMedicine): the
    // competent policy never calls these (verified by grep); the wrappers prove
    // it — an event here would be a finding. Log one event per call while sick.
    const wrapScholarTreat = (fnName, kind) => {
      const o = Game[fnName];
      if (typeof o !== 'function') return;
      Game[fnName] = function (...args) {
        let before = null;
        try { before = scholarDiseaseMap(); } catch (e) {}
        const r = o.apply(this, arguments);
        try {
          const after = scholarDiseaseMap();
          const ids = new Set([...Object.keys(before || {}), ...Object.keys(after)]);
          let logged = false;
          for (const id of ids) {
            const b = (before || {})[id], a = after[id];
            if (b && !a) {
              W.treatEvents.push({ day: dayOf(), kind, who: 'scholar', whoName: 'scholar', diseaseId: id, result: 'cured', dayPartsLeftBefore: b.dayPartsLeft, dayPartsLeftAfter: 0, arg: String(args[0] == null ? '' : args[0]) });
              logged = true;
            } else if (b && a && ((a.dayPartsLeft !== b.dayPartsLeft) || ((a.easedUntil || 0) !== (b.easedUntil || 0)))) {
              W.treatEvents.push({ day: dayOf(), kind, who: 'scholar', whoName: 'scholar', diseaseId: id, result: 'eased', dayPartsLeftBefore: b.dayPartsLeft, dayPartsLeftAfter: a.dayPartsLeft, easedUntilBefore: b.easedUntil || null, easedUntilAfter: a.easedUntil || null, arg: String(args[0] == null ? '' : args[0]) });
              logged = true;
            }
          }
          if (!logged && before && Object.keys(before).length) {
            const id0 = Object.keys(before)[0];
            W.treatEvents.push({ day: dayOf(), kind, who: 'scholar', whoName: 'scholar', diseaseId: id0, result: 'no-effect', dayPartsLeftBefore: before[id0].dayPartsLeft, arg: String(args[0] == null ? '' : args[0]) });
          }
        } catch (e) {}
        return r;
      };
    };
    wrapScholarTreat('folkRemedy', 'folkRemedy');
    wrapScholarTreat('treatDisease', 'treatDisease');
    wrapScholarTreat('useMedicine', 'useMedicine');

    // removeTick: clean vs botched (a botched removal contracts wound_fever,
    // logged as its own onset by the contractDisease wrapper during this call).
    const oRT = Game.removeTick;
    if (typeof oRT === 'function') Game.removeTick = function () {
      let hadTick = false, wfBefore = 0;
      try { hadTick = !!(Game.hasStatus && Game.hasStatus('scholar', 'tick_attached')); wfBefore = W.sickOnsets.filter(o => o.kind === 'scholar' && o.diseaseId === 'wound_fever').length; } catch (e) {}
      const r = oRT.apply(this, arguments);
      try {
        if (hadTick) {
          let stillTick = false;
          try { stillTick = !!(Game.hasStatus && Game.hasStatus('scholar', 'tick_attached')); } catch (e) {}
          const wfAfter = W.sickOnsets.filter(o => o.kind === 'scholar' && o.diseaseId === 'wound_fever').length;
          W.treatEvents.push({ day: dayOf(), kind: 'removeTick', who: 'scholar', whoName: 'scholar',
            diseaseId: 'tick_attached',
            result: wfAfter > wfBefore ? 'botched (wound_fever)' : (stillTick ? 'still-attached' : 'clean') });
        }
      } catch (e) {}
      return r;
    };

    // sickRestTick: sleep helps slow-folk diseases (diff scholar seList).
    const oSRT = Game.sickRestTick;
    if (typeof oSRT === 'function') Game.sickRestTick = function (via) {
      let before = null;
      try { before = scholarDiseaseMap(); } catch (e) {}
      const r = oSRT.apply(this, arguments);
      try {
        const after = scholarDiseaseMap();
        for (const id of Object.keys(after)) {
          const b = (before || {})[id], a = after[id];
          if (b && a.dayPartsLeft < b.dayPartsLeft) {
            W.treatEvents.push({ day: dayOf(), kind: 'sickRest', who: 'scholar', whoName: 'scholar', diseaseId: id, result: 'eased', dayPartsLeftBefore: b.dayPartsLeft, dayPartsLeftAfter: a.dayPartsLeft, via: via || null });
          }
        }
      } catch (e) {}
      return r;
    };

    // cureStatus: cure attribution + scholar sickEnds. cureStatus splices the
    // entry directly (it never calls seRemove), so cures are NOT seen by the
    // seRemove wrapper below — this wrapper is their only end record.
    const oCS = Game.cureStatus;
    if (typeof oCS === 'function') Game.cureStatus = function (target, effectId, source) {
      const r = oCS.apply(this, arguments);
      try {
        if (r) {
          W.cureEvents.push({ day: dayOf(), target: target === 'scholar' ? 'scholar' : String((target && (target.villagerId || target.id)) || '?').slice(0, 24), diseaseId: effectId, source: source || null });
          if (target === 'scholar' && MUNDANE_IDS.has(effectId)) {
            W.sickEnds.push({ day: dayOf(), who: 'scholar', whoName: 'scholar', kind: 'scholar', name: effectId, diseaseId: effectId, outcome: 'cured', by: source || 'cureStatus' });
          }
        }
      } catch (e) {}
      return r;
    };

    // seRemove: scholar episode ends via expiry (dayPartsLeft <= 0) or early
    // removal. NOTE: trembles/lockjaw expiry removes the entry and THEN kills
    // the bearer (playerDeath) — the analyzer reclassifies such an end as
    // 'died' when a scholar death row lands the same day with a sickness cause.
    const oSR = Game.seRemove;
    if (typeof oSR === 'function') Game.seRemove = function (target, st) {
      let partsBefore = null, id = null;
      try { id = st && st.id; partsBefore = st && st.dayPartsLeft; } catch (e) {}
      const r = oSR.apply(this, arguments);
      try {
        if (target === 'scholar' && id && MUNDANE_IDS.has(id)) {
          W.sickEnds.push({ day: dayOf(), who: 'scholar', whoName: 'scholar', kind: 'scholar',
            name: id, diseaseId: id,
            outcome: (partsBefore != null && partsBefore <= 0) ? 'recovered (expired)' : 'removed-early',
            dayPartsLeftAtRemoval: partsBefore });
        }
      } catch (e) {}
      return r;
    };
  } // end if (!bare) — fever wrappers above are recorders, skipped in BARE mode

  const policy = Object.assign({}, competent);
  const origDaily = competent.daily;
  const ledgerTotal = (map) => {
    let t = 0;
    try { for (const d of Object.values(map || {})) t += (d.kcal || d.shareEased || 0); } catch (e) {}
    return Math.round(t);
  };
  if (!bare) policy.daily = (G, ctx) => {
    try {
      let hungry = 0;
      const v = (G.state || {}).village || {};
      const roster = v.roster || [];
      W.villageDays += roster.length;
      for (const id of roster) {
        try { if (G.npcNeeds && (G.npcNeeds(id).hunger || 0) > 70) hungry++; } catch (e) {}
      }
      if (hungry > 0) W.starveDays++;
      let fd = null, pk = null, fk = null, cap = null, throttled = null;
      if (G.pantryFreshDays) { fd = G.pantryFreshDays(); }
      try { pk = pantryLive(); } catch (e) {}
      try { if (G.pantryFreshKcal) fk = Math.round(G.pantryFreshKcal()); } catch (e) {}
      try { if (G.pantryCapKcal) cap = Math.round(G.pantryCapKcal()); } catch (e) {}
      try { if (G.prodThrottleEngaged) throttled = !!G.prodThrottleEngaged(); } catch (e) {}
      let spoiledKcal = 0, preservedKcal = 0, sickCount = 0, healthSum = 0, healthN = 0;
      try {
        for (const it of (v.pantry || [])) {
          if (!it) continue;
          const k = (it.kcalEach || 0) * (it.units || 1);
          if (it.foodState === 'preserved' || it.foodState === 'rendered' || (it.foodKind || '') === 'pemmican') preservedKcal += k;
          else { try { if (G.isSpoiled && G.isSpoiled(it)) spoiledKcal += k; } catch (e2) {} }
        }
        for (const id of roster) {
          const h = (v.health || {})[id];
          const hv = (h === undefined ? 100 : h);
          healthSum += hv; healthN++;
          if (hv < 50) sickCount++;
        }
      } catch (e) {}
      // Season + weather (collapse candidates: season/weather).
      let seasonId = null, weather = null;
      try { const se = G.season && G.season(dayOf()); seasonId = se ? (se.id || null) : null; } catch (e) {}
      try { weather = (G.state || {}).weather || null; } catch (e) {}
      // Map ground state (collapse candidate: tile vigor/depletion).
      let meanVigor = null, meanStockRatio = null, barrenTiles = 0, pressuredTiles = 0, forageableTiles = 0;
      try {
        let vSum = 0, rSum = 0;
        const tiles = (G.map && G.map.tiles) || [];
        for (const row of tiles) for (const t of (row || [])) {
          if (!t || !(t.maxStock > 0)) continue;
          forageableTiles++;
          vSum += (t.vigor == null ? 100 : t.vigor);
          let capT = null;
          try { capT = G.tGroundCap ? G.tGroundCap(t) : null; } catch (e2) {}
          if (capT && capT > 0) rSum += ((t.stock || 0) / capT);
          if ((t.stock || 0) === 0) barrenTiles++;
          if ((t.foragePressure || 0) >= 5) pressuredTiles++;
        }
        if (forageableTiles) {
          meanVigor = Math.round((vSum / forageableTiles) * 10) / 10;
          meanStockRatio = Math.round((rSum / forageableTiles) * 1000) / 1000;
        }
      } catch (e) {}
      const awayCount = Object.keys(v.away || {}).length;
      // Assignments with per-task mean competence + mean expected (labor candidate).
      const assignments = {};
      const assignDetail = {};
      try {
        for (const [vid, a] of Object.entries(v.assignments || {})) {
          const t = String((a && a.task) || '?');
          assignments[t] = (assignments[t] || 0) + 1;
          let comp = null, exp = null;
          try { if (G.villagerCompetence) comp = G.villagerCompetence(vid, t); } catch (e2) {}
          try { const p = G.getPerson && G.getPerson(vid); if (p && G.villagerExpectedDaily) exp = Math.round(G.villagerExpectedDaily(p, vid, v)); } catch (e2) {}
          const d = (assignDetail[t] = assignDetail[t] || { n: 0, compSum: 0, compN: 0, expSum: 0, expN: 0 });
          d.n++;
          if (comp != null) { d.compSum += comp; d.compN++; }
          if (exp != null) { d.expSum += exp; d.expN++; }
        }
        for (const t of Object.keys(assignDetail)) {
          const d = assignDetail[t];
          d.meanComp = d.compN ? Math.round((d.compSum / d.compN) * 100) / 100 : null;
          d.meanExpected = d.expN ? Math.round(d.expSum / d.expN) : null;
          delete d.compSum; delete d.compN; delete d.expSum; delete d.expN;
        }
      } catch (e) {}
      const foragerDetail = assignDetail.forage || null;
      // FEVER snapshot (all reads; v.drankDirty here is the flag tonight's
      // villageSicknessTick will consume — the condition for the next gut-rot roll).
      let sickMap = null, scholarSick = null, tickAttached = null, healerPresent = null,
        medicCount = null, drinksDirty = null, waterClean = null, waterDirty = null,
        triageHygiene = null, sickMeanHealth = null, healthyMeanHealth = null, sickCountNPC = 0;
      try {
        sickMap = {};
        for (const [vid, rec] of Object.entries(v.sick || {})) {
          sickMap[vid] = { name: rec.name, daysLeft: rec.daysLeft, severity: rec.severity, diagnosed: !!rec.diagnosed };
        }
        scholarSick = scholarDiseaseList();
        const tickEntry = (G.seList ? G.seList('scholar') : []).find(e => e.id === 'tick_attached');
        tickAttached = tickEntry ? { present: true, day: tickEntry.day == null ? null : tickEntry.day, lastRollDay: tickEntry.lastRollDay == null ? null : tickEntry.lastRollDay } : { present: false, day: null, lastRollDay: null };
        healerPresent = healerPresentNow();
        medicCount = medicIds().length;
        drinksDirty = !!v.drankDirty;
        waterClean = (v.water || {}).clean || 0; waterDirty = (v.water || {}).dirty || 0;
        try { triageHygiene = !!((v.triageHygiene || {}).until >= dayOf()); } catch (e) {}
        let sSum = 0, sN = 0, hSum = 0, hN = 0;
        for (const id of roster) {
          let dead = false; try { const p = G.vpOf && G.vpOf(id); dead = !!(p && p.dead); } catch (e2) {}
          if (dead) continue;
          const h = (v.health || {})[id]; const hv = (h === undefined ? 100 : h);
          if ((v.sick || {})[id]) { sSum += hv; sN++; sickCountNPC++; } else { hSum += hv; hN++; }
        }
        sickMeanHealth = sN ? Math.round((sSum / sN) * 10) / 10 : null;
        healthyMeanHealth = hN ? Math.round((hSum / hN) * 10) / 10 : null;
      } catch (e) {}
      W.daySeries.push({ day: dayOf(), pop: roster.length, hungry,
        freshDays: (fd == null ? null : Math.round(fd * 10) / 10), pantryKcal: pk,
        pantryFreshKcal: fk, pantrySpoiledKcal: Math.round(spoiledKcal),
        preservedKcal: Math.round(preservedKcal),
        pantryCapKcal: cap, capFlag: (pk != null && cap != null) ? (pk >= 0.95 * cap) : null,
        throttleEngaged: throttled,
        throttleRedirects: (v.throttleRedirects || 0),
        throttleExemptDepth: (v.throttleExemptDepth || 0),
        plentyDepriKcal: ledgerTotal((v._plentyDepri || {}).days),
        depositGateKcal: ledgerTotal((v._depositGate || {}).days),
        assignments, assignDetail,
        foragers: foragerDetail ? foragerDetail.n : 0,
        foragerMeanComp: foragerDetail ? foragerDetail.meanComp : null,
        season: seasonId, weather, meanVigor, meanStockRatio, barrenTiles,
        pressuredTiles, forageableTiles, awayCount, sickCount,
        meanHealth: healthN ? Math.round((healthSum / healthN) * 10) / 10 : null,
        sickMap, scholarSick, tickAttached, healerPresent, medicCount,
        drinksDirty, waterClean, waterDirty, triageHygiene,
        sickMeanHealth, healthyMeanHealth, sickCountNPC });
      W.hungrySeries = W.hungrySeries || [];
      W.hungrySeries.push(hungry);
    } catch (e) {}
    if (origDaily) return origDaily(G, ctx);
  };

  const t0 = Date.now();
  const result = await runDays(Game, policy, { days, manifest: null });
  const ms = Date.now() - t0;
  // GROUND-TRUTH DUTY CURES (sim-sametick-a): the game's own cumulative
  // counter (v.medicDutyCures), read once at run end — a pure read, after
  // the sim, so it cannot affect the trajectory. The medicduty recorder
  // reads this same field; the counter and the dutyCure EVENT capture are
  // mechanism-independent (cumulative bookkeeping vs per-tick diffing), so
  // the counter is the denominator the capture is judged against. Bare
  // runs do not record it (they return a fingerprint only).
  const dutyCuresTotal = (() => {
    try {
      const c = ((Game.state || {}).village || {}).medicDutyCures || {};
      return { ability: c.ability || 0, medicine: c.medicine || 0,
        total: (c.ability || 0) + (c.medicine || 0) };
    } catch (e) { return { ability: 0, medicine: 0, total: 0 }; }
  })();

  const deathCauses = {};
  for (const d of W.deaths) deathCauses[d.cause] = (deathCauses[d.cause] || 0) + 1;
  const rank = (() => { try { return String(Game.scaleRank()); } catch (e) { return '?'; } })();
  const won = !!Game.won;
  const national = /national|global/i.test(rank) || !!((Game.state || {}).nationalLive);
  const maxWave = (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })();
  const waveReach = [];
  for (let w = 1; w <= maxWave; w++) waveReach.push(w);
  const med = xs => { const s = xs.slice().sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };
  const freshSeries = W.daySeries.map(x => x.freshDays).filter(x => x != null);
  const finalPop = (() => { try { return (((Game.state || {}).village || {}).roster || []).length; } catch (e) { return null; } })();
  const deathKeys = W.deaths.map(d => d.day + '|' + d.who + '|' + d.cause).sort();
  const fingerprint = { seed, daysAlive: result.days, endReason: result.endReason,
    rank, maxWave, national, table: won, win: won,
    deathCauses, deathKeys, finalPop };
  if (bare) return { seed, perSeed: null, diag: null, fingerprint };

  const perSeed = {
    seed, policy: 'competent',
    plentydepri: 1, depositgate: 1,
    daysAlive: result.days, villageDays: W.villageDays,
    deathCauses, deathRows: W.deaths,
    mealRows: W.mealRows.map(({ _key, ...r }) => r),
    daySeries: W.daySeries, flowSeries: W.flowSeries, national,
    table: won, win: won,
    waveReach, medianSurvival: null,
    freshDaysMedian: (m => (m == null ? null : Math.round(m * 10) / 10))(med(freshSeries)),
    sickOnsets: W.sickOnsets, sickEnds: W.sickEnds, treatEvents: W.treatEvents,
    statusEvents: W.statusEvents, diagnoses: W.diagnoses, cureEvents: W.cureEvents,
    dutyCuresTotal,
  };
  const diag = {
    endReason: result.endReason, rank, maxWave, arc: (() => { try { return (Game.progState() || {}).arc || 1; } catch (e) { return 1; } })(),
    starveDays: W.starveDays, deathRowCount: W.deaths.length,
    mealRowCount: W.mealRows.length, mealDupCount: W.mealDup, ms,
    onsetCount: W.sickOnsets.length, endCount: W.sickEnds.length,
    treatEventCount: W.treatEvents.length, statusEventCount: W.statusEvents.length,
    diagnosisCount: W.diagnoses.length, cureEventCount: W.cureEvents.length,
  };
  return { seed, perSeed, diag, fingerprint };
}

if (require.main === module) (async () => {
  if (process.env.PLENTYDEPRI !== '1' || process.env.DEPOSITGATE !== '1') {
    console.error('FATAL: PLENTYDEPRI=1 and DEPOSITGATE=1 must both be set explicitly (shipped defaults, explicit)');
    process.exit(2);
  }
  if (!isList(BATCH)) {
    console.error('FATAL: seeds must be exactly 96301-96308, got: ' + (process.env.SEEDS || '(unset)'));
    process.exit(2);
  }
  if (DAYS !== 150) {
    console.error('FATAL: DAYS must be exactly 150, got: ' + (process.env.DAYS || '(unset)'));
    process.exit(2);
  }
  const rows = [];
  for (const seed of SEEDS) {
    const { seed: s, perSeed, diag, fingerprint } = await oneRun(seed, DAYS, { bare: false });
    rows.push({ seed: s, perSeed, diag, fingerprint });
    try { fs.mkdirSync(PERSEED_DIR, { recursive: true }); }
    catch (e) { console.error('MKDIR FAIL LOUDLY', PERSEED_DIR, e.message); process.exit(2); }
    writeRobust(path.join(PERSEED_DIR, `feveranat-a-competent-s${s}.json`),
      JSON.stringify(perSeed));
    console.log(`done seed=${s} days=${perSeed.daysAlive} end=${diag.endReason} rank=${diag.rank} wave=${diag.maxWave} deaths=${diag.deathRowCount} meals=${diag.mealRowCount} onsets=${diag.onsetCount} ends=${diag.endCount} treats=${diag.treatEventCount} won=${perSeed.win} (${diag.ms}ms)`);
  }
  // BARE pass (G2 neutrality): same seeds/days/policy, recorders skipped.
  const bareRows = [];
  for (const seed of SEEDS) {
    const { fingerprint } = await oneRun(seed, DAYS, { bare: true });
    bareRows.push(fingerprint);
    writeRobust(path.join(PERSEED_DIR, `feveranat-a-bare-s${seed}.json`),
      JSON.stringify(fingerprint));
    console.log(`bare seed=${seed} days=${fingerprint.daysAlive} end=${fingerprint.endReason} deaths=${Object.values(fingerprint.deathCauses).reduce((a, b) => a + b, 0)}`);
  }
  try { fs.mkdirSync(require('path').dirname(OUT), { recursive: true }); }
  catch (e) { console.error('MKDIR FAIL LOUDLY', OUT, e.message); process.exit(2); }
  let merged = rows;
  try {
    if (fs.existsSync(OUT)) {
      const prev = JSON.parse(fs.readFileSync(OUT, 'utf8'));
      const bySeed = new Map();
      for (const r of (prev.rows || [])) bySeed.set(r.seed, r);
      for (const r of rows) bySeed.set(r.seed, r);
      merged = [...bySeed.values()].sort((a, b) => a.seed - b.seed);
    }
  } catch (e) { console.error('SUMMARY MERGE FAIL', OUT, e.message); process.exit(2); }
  const allSeeds = merged.map(r => r.seed).sort((a, b) => a - b);
  writeRobust(OUT, JSON.stringify({ meta: { cell: 'competent', policy: 'competent', days: DAYS, seeds: allSeeds, env: { PLENTYDEPRI: '1', DEPOSITGATE: '1' } }, rows: merged, bare: bareRows }));
  console.log('wrote ' + OUT + ' (' + merged.length + ' rows, ' + bareRows.length + ' bare)');
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });

module.exports = { oneRun, BATCH, DAYS, writeRobust };
