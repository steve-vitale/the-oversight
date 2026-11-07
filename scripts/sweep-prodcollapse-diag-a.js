#!/usr/bin/env node
// sweep-prodcollapse-diag-a.js — PRODUCTION-COLLAPSE DIAGNOSIS (measurement only)
// (sim-prodcollapse-a, 2026-11-07, oversight-flesh-out-loop run fleshout-20261107T1820Z, axis
// food-economy. Arm 2 of a 2-arm round; arm 1 works the PLENTY-WEEK lever in a separate tree.
// This arm is DIAG ONLY: it decomposes the collapse regime the sibling diagnosis found —
// seed 96203 produced ~70% of need for a month (days 35-66), freshDays 0-2.4, throttle NEVER
// engaged, 3 starvation deaths — into its binding constraint: labor-days, forager
// count/competence, biome yield (tile vigor/depletion), haul losses, season/weather,
// raid/tariff drains, or something else. Zero src/js, no lever, no default flip.
//
// MODELED on scripts/sweep-prodstore-diag-a.js (commit f7277d2af, read via git show;
// own code, same harness pattern). Declared deltas:
//   1. Names/paths: prodcollapse-a-*, corpus evidence/2026-11-07/prodcollapse-a-corpus/.
//   2. Seeds: exactly 96201-96208 (8 seeds, the SAME band as the sibling diagnosis —
//      reuse is the point; this arm re-runs the baseline itself and never reads the
//      sibling tree's uncommitted corpus files). Days 150 ONLY.
//   3. NEW wrappers (all read-only, call-through, zero extra RNG): villagerDepleteTiles
//      (per forage call: depleted/barren/eroded/avgVigor/zone) and villagerHuntResolve
//      (per hunt call: kcal, aid, zero-kcal flag).
//   4. villagerMealDay rows EXTENDED per (vid,day): expected, base, knowledgeFactor,
//      knownPlants, occupationFoodSkill, ageCap, healthFrac, trust, assigned task,
//      realized mult (produced/expected).
//   5. Daily snapshot EXTENDED: season id, weather, map ground state (meanVigor,
//      meanStockRatio, barrenTiles, pressuredTiles over forageable tiles), awayCount,
//      sickCount (health<50), meanHealth, per-task mean competence + mean expected
//      of assignees, forager headcount + mean forage competence.
//   6. BARE mode (PRODCOLLAPSE_BARE=1): same seeds/days/policy, all recorders SKIPPED
//      except the registerDeath capture (documented exception: it performs no
//      Game-state writes and consumes no RNG — it only appends to an external array),
//      writes only a fingerprint per seed. The recorded run must match it exactly (G2).
//   7. Everything else identical to the prodstore pattern: competent FIXED,
//      PLENTYDEPRI=1/DEPOSITGATE=1 FATAL-asserted, registerDeath CALLS THROUGH,
//      writeRobust (fresh child per attempt, 300 attempts, jittered sleep),
//      stdout to the caller's pipe.
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
const BARE = process.env.PRODCOLLAPSE_BARE === '1';
const SEEDS = (process.env.SEEDS || '')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const BATCH = [96201, 96202, 96203, 96204, 96205, 96206, 96207, 96208];
const isList = (list) => SEEDS.length === list.length && SEEDS.every((s, i) => s === list[i]);
const DAYS = parseInt(process.env.DAYS || '', 10);
const OUT = process.env.OUT || path.join(
  __dirname, '..', 'evidence', '2026-11-07', 'prodcollapse-a-corpus', 'sweep-competent.json');
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-11-07', 'prodcollapse-a-corpus');

function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
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
  const { Game } = await loadGame({ seed, mode: 'prodcollapse-diag-a-competent', fullTelemetry: false });
  await setupGame(Game);
  const W = {
    deaths: [], deathSeen: new Set(), mealRows: [], mealDup: 0,
    daySeries: [], flowSeries: [], sayWin: [], teleWin: [],
    villageDays: 0, starveDays: 0, resDepth: 0,
  };
  const trunc = (t) => String(t == null ? '' : t).slice(0, 170);
  const dayOf = () => (((Game.state || {}).scholar || {}).day || 0);
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
  }

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
        meanHealth: healthN ? Math.round((healthSum / healthN) * 10) / 10 : null });
      W.hungrySeries = W.hungrySeries || [];
      W.hungrySeries.push(hungry);
    } catch (e) {}
    if (origDaily) return origDaily(G, ctx);
  };

  const t0 = Date.now();
  const result = await runDays(Game, policy, { days, manifest: null });
  const ms = Date.now() - t0;

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
  };
  const diag = {
    endReason: result.endReason, rank, maxWave, arc: (() => { try { return (Game.progState() || {}).arc || 1; } catch (e) { return 1; } })(),
    starveDays: W.starveDays, deathRowCount: W.deaths.length,
    mealRowCount: W.mealRows.length, mealDupCount: W.mealDup, ms,
  };
  return { seed, perSeed, diag, fingerprint };
}

if (require.main === module) (async () => {
  if (process.env.PLENTYDEPRI !== '1' || process.env.DEPOSITGATE !== '1') {
    console.error('FATAL: PLENTYDEPRI=1 and DEPOSITGATE=1 must both be set explicitly (shipped defaults, explicit)');
    process.exit(2);
  }
  if (!isList(BATCH)) {
    console.error('FATAL: seeds must be exactly 96201-96208, got: ' + (process.env.SEEDS || '(unset)'));
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
    writeRobust(path.join(PERSEED_DIR, `prodcollapse-a-competent-s${s}.json`),
      JSON.stringify(perSeed));
    console.log(`done seed=${s} days=${perSeed.daysAlive} end=${diag.endReason} rank=${diag.rank} wave=${diag.maxWave} deaths=${diag.deathRowCount} meals=${diag.mealRowCount} won=${perSeed.win} (${diag.ms}ms)`);
  }
  // BARE pass (G2 neutrality): same seeds/days/policy, recorders skipped.
  const bareRows = [];
  for (const seed of SEEDS) {
    const { fingerprint } = await oneRun(seed, DAYS, { bare: true });
    bareRows.push(fingerprint);
    writeRobust(path.join(PERSEED_DIR, `prodcollapse-a-bare-s${seed}.json`),
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
