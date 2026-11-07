#!/usr/bin/env node
// sweep-prodstore-diag-a.js — FOOD PRODUCTION/STORAGE DIAGNOSIS (measurement only)
// (sim-prodstore-a, 2026-11-07, oversight-flesh-out-loop run fleshout-20261107T1615Z, axis
// food-economy. First production/storage arm: the awayconfirm 100-seed corpus showed 35
// villager starvation deaths ALL with pantryKcal exactly 0 and freshDays exactly 0 —
// genuine scarcity, not distribution. This sweep measures WHAT caps production/storage:
// forage/hunt/fish/garden yields, personal production vs need, spoilage, the
// PRODTHROTTLE + PLENTYDEPRI + DEPOSITGATE easings, the pantry cap, preservation
// throughput, and labor allocation — on fresh seeds, before any lever is designed.
//
// DERIVED from scripts/sweep-awayconfirm-a.js (same harness pattern, same env
// discipline). Declared deltas (verified by scripts/test-prodstore-diag-a.js):
//   1. Names/paths: prodstore-a-*, corpus evidence/2026-11-07/prodstore-a-corpus/.
//   2. Seeds: exactly 96201-96208 (8 seeds, the pilot/diagnosis batch); days 150 ONLY.
//      Band verified fresh before sims (see prereg: 99101-99108 and 99351-99358
//      both collided; 96201-96208 zero hits in all dated preregs + tracker +
//      sim-findings + evidence band strings).
//   3. Flow wrappers ADDED (all read-only, call-through, no RNG): stockPantry
//      (kcal by name per day), stockSurplus (stored kcal), pantryAdd (pantry-delta
//      kcal), pantryDraw (taken kcal + drawGap, the cook-valuation gap between
//      physical units x kcalEach and booked units x effectiveKcal), drawSpoiled
//      (kcal), donateToPantry (pantry-delta kcal), drawLeaguePool (kcal),
//      sweepSpoiled (pantry kcal removed), takeFromPantryBulk/takeFromPantry
//      (player pack takes, pantry-delta kcal), _removePantryKcal (aid/tribute/
//      sortie/demand removals, returns kcal removed), resolveOneAssignment
//      (resolved task counts; redirect re-resolutions counted separately under
//      'redirect:<task>'). KNOWN RESIDUAL: npcTakeAction's ambient pantry
//      snacking (game.js npcTakeAction: a hungry NPC eats one pantry unit
//      directly, hunger -30) is inline code with no named function to wrap —
//      it lands in the accounting residual, which the analyzer reports per
//      seed. If the residual is large, that snacking is the prime suspect.
//   4. villagerMealDay wrapper records produced (contribLog), ownEat (= ate -
//      drawn), ate, drawn, gave, fasting, away, hunger/health before/after,
//      needEst — deduped per (vid,day) like awayconfirm (a second caller exists).
//   5. Daily snapshot in policy.daily: pantryKcalLive, pantryFreshKcal,
//      pantrySpoiledKcal (live - fresh), preservedKcal (preserved/rendered/
//      pemmican states), pantryFreshDays, pantryCapKcal, throttleEngaged,
//      throttleRedirects / throttleExemptDepth / plentyDepriKcal /
//      depositGateKcal (cumulative ledger reads), pop, hungry count,
//      assignments by task, cap flag (pantryKcal >= 0.95 x cap).
//   6. registerDeath capture + pantry ctx as awayconfirm, extended with
//      pantrySpoiledKcal and preservedKcal.
//   7. FATAL guard: PRODSTORE_LEVER must be unset — the diagnosis never runs armed.
//   8. Everything else identical in behavior to the awayconfirm family:
//      competent FIXED, PLENTYDEPRI=1/DEPOSITGATE=1 FATAL-asserted,
//      registerDeath CALLS THROUGH, meal wrapper reads only, writeRobust
//      (300 attempts, 2s backoff), stdout to the caller's pipe.
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
if (process.env.PRODSTORE_LEVER && require.main === module) {
  console.error('FATAL: PRODSTORE_LEVER must be unset for the diagnosis sweep (this run measures the unarmed baseline)');
  process.exit(2);
}
const SEEDS = (process.env.SEEDS || '')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const BATCH = [96201, 96202, 96203, 96204, 96205, 96206, 96207, 96208];
const isList = (list) => SEEDS.length === list.length && SEEDS.every((s, i) => s === list[i]);
const DAYS = parseInt(process.env.DAYS || '', 10);
const OUT = process.env.OUT || path.join(
  __dirname, '..', 'evidence', '2026-11-07', 'prodstore-a-corpus', 'sweep-competent.json');
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-11-07', 'prodstore-a-corpus');

function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

// Writes go through a FRESH child process per attempt. Host EPERM-flap
// denial is STICKY per process once a write fails (2026-11-07: an in-process
// retry loop failed 300/300 over ~10 min while fresh processes wrote 1.5MB
// files 5/5 in the same minute, and the proof test's L7 retry loop failed
// 30/30 while standalone probes succeeded). Retrying in-process is futile;
// each child reads the payload from stdin (a pipe, never a filesystem
// write), writes + readback-verifies + renames, and exits 0/1/3.
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
  // 300 fresh-child attempts x ~2s = ~10 min span per file: the flap's bad
  // stretches run minutes, its good windows tens of seconds; a file only
  // needs one good second. Failing loudly after the budget keeps a stuck
  // sweep visible instead of silently incomplete.
  for (let i = 0; i < 300; i++) {
    const r = child_process.spawnSync(process.execPath,
      ['-e', CHILD_WRITER, tmp, filePath],
      { input: data, encoding: 'utf8', timeout: 30000, maxBuffer: 64 * 1024 * 1024 });
    if (r.status === 0) return;
    if (i === 299) { console.error('WRITE FAIL LOUDLY', filePath, 'child status=' + r.status); process.exit(2); }
    // JITTERED real sleep (0.5-3s), never a fixed cadence: a fixed 2s retry
    // loop failed 300/300 while a jittered attempt succeeded immediately in
    // the same minute (2026-11-07) — the fixed cadence aliases with the
    // flap's period. Atomics.wait sleeps without spinning CPU.
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500 + Math.floor(Math.random() * 2500));  }
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'prodstore-diag-a-competent', fullTelemetry: false });
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
        ate: 0, ownEat: 0, gave: 0, resolved: {}, redirectResolved: {} };
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

  // --- deaths: CALL-THROUGH capture ---
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
          const ctx = snapContext();
          const v = (Game.state || {}).village || {};
          ctx.awayAtDeath = whoId ? !!((v.away || {})[whoId]) : null;
          row = { day, who: who.slice(0, 24), whoName, kind, cause,
            isPlayer: whoId ? (whoId === Game.villagerId) : false,
            ctx, sayWin: W.sayWin.slice(-8), teleWin: W.teleWin.slice(-8) };
          W.deaths.push(row);
        }
      }
    } catch (e) {}
    return oDie.apply(this, arguments);
  };

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
  const wrapFlow = (name, fn) => {
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
          // COOK-VALUATION GAP: the pantry physically loses units x kcalEach,
          // but taken books units x effectiveKcal (cooked value, which for
          // plants can differ from the raw net). The gap is a real pantry
          // outflow the books don't show; measure it so the closure is honest.
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
        // Aid gifts, tribute, sortie rations, demands: real pantry outflows
        // NOT through pantryDraw. Returns the kcal actually removed.
        const r = o.apply(this, args);
        if (r > 0) flowFor(day).removedKcal += Math.round(r);
        return r;
      } else if (name === 'takeFromPantryBulk' || name === 'takeFromPantry') {
        // Player pack takes: pantry outflow NOT through pantryDraw. Delta-measured.
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
    'takeFromPantryBulk', 'takeFromPantry', '_removePantryKcal']) wrapFlow(n, 0);

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

  // --- villagerMealDay wrapper (reads only, no RNG) ---
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
    let hungerAfter = null, healthAfter = null, produced = null;
    try { const n = Game.npcNeeds && Game.npcNeeds(vid); hungerAfter = n ? (n.hunger || 0) : null; } catch (e) {}
    try { healthAfter = ((v || Game.state.village || {}).health || {})[vid]; if (healthAfter === undefined) healthAfter = null; } catch (e) {}
    try { const lg = ((v || Game.state.village || {}).contribLog || {})[vid]; if (lg) produced = lg.produced; } catch (e) {}
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
      ate, drawn, gave, ownEat, produced,
      fasting: result ? !!result.fasting : false,
      hungerBefore, hungerAfter, healthBefore, healthAfter, needEst };
    if (dupIdx >= 0) { W.mealDup++; W.mealRows[dupIdx] = row; }
    else W.mealRows.push(row);
    return result;
  };

  const policy = Object.assign({}, competent);
  const origDaily = competent.daily;
  const ledgerTotal = (map) => {
    let t = 0;
    try { for (const d of Object.values(map || {})) t += (d.kcal || d.shareEased || 0); } catch (e) {}
    return Math.round(t);
  };
  policy.daily = (G, ctx) => {
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
      let spoiledKcal = 0, preservedKcal = 0;
      try {
        for (const it of (v.pantry || [])) {
          if (!it) continue;
          const k = (it.kcalEach || 0) * (it.units || 1);
          if (it.foodState === 'preserved' || it.foodState === 'rendered' || (it.foodKind || '') === 'pemmican') preservedKcal += k;
          else { try { if (G.isSpoiled && G.isSpoiled(it)) spoiledKcal += k; } catch (e2) {} }
        }
      } catch (e) {}
      const assignments = {};
      try {
        for (const [vid, a] of Object.entries(v.assignments || {})) {
          const t = String((a && a.task) || '?');
          assignments[t] = (assignments[t] || 0) + 1;
        }
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
        assignments });
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
  return { seed, perSeed, diag };
}

if (require.main === module) (async () => {
  if (process.env.PLENTYDEPRI !== '1' || process.env.DEPOSITGATE !== '1') {
    console.error('FATAL: PLENTYDEPRI=1 and DEPOSITGATE=1 must both be set explicitly (shipped defaults, explicit)');
    process.exit(2);
  }
  if (process.env.PRODSTORE_LEVER) {
    console.error('FATAL: PRODSTORE_LEVER must be unset for the diagnosis sweep (this run measures the unarmed baseline)');
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
    const { seed: s, perSeed, diag } = await oneRun(seed, DAYS);
    rows.push({ seed: s, perSeed, diag });
    try { fs.mkdirSync(PERSEED_DIR, { recursive: true }); }
    catch (e) { console.error('MKDIR FAIL LOUDLY', PERSEED_DIR, e.message); process.exit(2); }
    writeRobust(path.join(PERSEED_DIR, `prodstore-a-competent-s${s}.json`),
      JSON.stringify(perSeed));
    console.log(`done seed=${s} days=${perSeed.daysAlive} end=${diag.endReason} rank=${diag.rank} wave=${diag.maxWave} deaths=${diag.deathRowCount} meals=${diag.mealRowCount} won=${perSeed.win} (${diag.ms}ms)`);
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
  writeRobust(OUT, JSON.stringify({ meta: { cell: 'competent', policy: 'competent', days: DAYS, seeds: allSeeds, env: { PLENTYDEPRI: '1', DEPOSITGATE: '1' } }, rows: merged }));
  console.log('wrote ' + OUT + ' (' + merged.length + ' rows)');
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });

module.exports = { oneRun, BATCH, DAYS, writeRobust };
