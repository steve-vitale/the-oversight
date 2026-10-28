#!/usr/bin/env node
// sweep-awayvoice-reproof-b.js — re-proof sweep for the LANDED away-hunger
// voice beat (sim-awayvoice-b, 2026-10-28, run fleshout-loop-b-20261028T1930Z).
// This run is a DUPLICATE DISPATCH: the beat landed 2026-10-25 (pilot +
// confirm GO 35/35, adopted 2870c771c), so no new lever is judged here.
// DERIVED from scripts/sweep-awayvoice-b.js. Declared deltas:
//   1. Names/paths: awayvoice-b-reproof-*, corpus evidence/2026-10-28/
//      sim-awayvoice-b-reproof-corpus/, per-seed
//      awayvoice-b-reproof-s<seed>.json. Single cell "reproof": current
//      master IS the armed code; there is no baseline cell because no
//      code change is being judged (baseline identity was proven at
//      pilot + confirm).
//   2. Seeds: FRESH ONLY [96001..96008] (verified fresh 2026-10-28:
//      no *9600* corpus filename, no dated-.md mention). DAYS exactly 150.
//   3. packMeal wrapper, say log, competent FIXED, env FATAL asserts,
//      registerDeath call-through, meal wrapper, writeRobust: identical
//      to the landed sweep.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

if (process.env.PLENTYDEPRI !== '1' || process.env.DEPOSITGATE !== '1') {
  console.error('FATAL: PLENTYDEPRI=1 and DEPOSITGATE=1 must both be set explicitly (shipped defaults, explicit)');
  process.exit(2);
}
const CELL = 'reproof'; // single cell: current master IS the armed code
const SEEDS = (process.env.SEEDS || '')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const FRESH = [96001, 96002, 96003, 96004, 96005, 96006, 96007, 96008];
const isList = (list) => SEEDS.length === list.length && SEEDS.every((s, i) => s === list[i]);
if (!isList(FRESH)) {
  console.error('FATAL: seeds must be exactly FRESH 96001,96002,96003,96004,96005,96006,96007,96008, got: ' + (process.env.SEEDS || '(unset)'));
  process.exit(2);
}
const DAYS = parseInt(process.env.DAYS || '', 10);
if (DAYS !== 150) {
  console.error('FATAL: DAYS must be exactly 150, got: ' + (process.env.DAYS || '(unset)'));
  process.exit(2);
}
const OUT = process.env.OUT || path.join(
  __dirname, '..', 'evidence', '2026-10-28', 'sim-awayvoice-b-reproof-corpus', 'sweep-reproof.json');
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-10-28', 'sim-awayvoice-b-reproof-corpus');

function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 300; i++) {
    try {
      fs.writeFileSync(tmp, data);
      const back = fs.readFileSync(tmp, 'utf8');
      if (back.length !== data.length) throw new Error('readback length mismatch');
      fs.renameSync(tmp, filePath);
      return;
    } catch (e) {
      if (i === 299) { console.error('WRITE FAIL LOUDLY', filePath, e.code || e.message); process.exit(2); }
      const t0 = performance.now(); while (performance.now() - t0 < 2000) {}
    }
  }
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'awayvoice-reproof-b-competent', fullTelemetry: false });
  await setupGame(Game);
  const W = {
    deaths: [], deathSeen: new Set(), mealRows: [], mealDup: 0,
    daySeries: [], hungrySeries: [], sayWin: [], teleWin: [],
    sayLog: [], sayTruncated: false, packCalls: [],
    villageDays: 0, starveDays: 0,
  };
  const trunc = (t) => String(t == null ? '' : t).slice(0, 300);

  const snapContext = () => {
    let freshDays = null, pantryKcal = null, freshKcal = null, spoiledKcal = 0,
      itemCount = 0, unknownCount = 0, pop = null, hungry = 0, awayAtDeath = null;
    try { if (Game.pantryFreshDays) freshDays = Math.round(Game.pantryFreshDays() * 10) / 10; } catch (e) {}
    try { if (Game.pantryKcalLive) pantryKcal = Math.round(Game.pantryKcalLive(Game.state.village)); } catch (e) {}
    try { if (Game.pantryFreshKcal) freshKcal = Math.round(Game.pantryFreshKcal()); } catch (e) {}
    try {
      const pantry = ((Game.state || {}).village || {}).pantry || [];
      itemCount = pantry.length;
      for (const it of pantry) {
        if (!it) continue;
        if ((it.kcalEach || 0) <= 0) unknownCount++;
        try { if (Game.isSpoiled && Game.isSpoiled(it)) spoiledKcal += (it.kcalEach || 0) * (it.units || 1); } catch (e2) {}
      }
      spoiledKcal = Math.round(spoiledKcal);
    } catch (e) {}
    try {
      const roster = ((Game.state || {}).village || {}).roster || [];
      pop = roster.length;
      for (const id of roster) { try { if (Game.npcNeeds && (Game.npcNeeds(id).hunger || 0) > 70) hungry++; } catch (e2) {} }
    } catch (e) {}
    return { freshDays, pantryKcal, pantryFreshKcal: freshKcal, pantrySpoiledKcal: spoiledKcal,
      pantryItemCount: itemCount, unknownKcal0Count: unknownCount, pop, hungry, awayAtDeath };
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
        const day = (Game.state.scholar || {}).day || 0;
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

  // --- transcript windows + FULL say log ---
  const oSay = Game.say;
  if (typeof oSay === 'function') Game.say = function (txt) {
    try {
      const line = 'd' + (((Game.state || {}).scholar || {}).day || 0) + ' ' + trunc(txt);
      W.sayWin.push(line); if (W.sayWin.length > 20) W.sayWin.shift();
      if (W.sayLog.length < 50000) W.sayLog.push(line); else W.sayTruncated = true;
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
  const oTele = Game.tele;
  if (typeof oTele === 'function') Game.tele = function (type, data) {
    try {
      W.teleWin.push('d' + (((Game.state || {}).scholar || {}).day || 0) + ' ' + String(type) + ' ' + trunc(data ? JSON.stringify(data) : ''));
      if (W.teleWin.length > 20) W.teleWin.shift();
    } catch (e) {}
    return oTele.apply(this, arguments);
  };

  // --- packMeal wrapper (awayvoice delta 3): call-through, reads only ---
  const oPack = Game.packMeal;
  if (typeof oPack === 'function') Game.packMeal = function (vid, want, exposure) {
    const day = ((Game.state || {}).scholar || {}).day || 0;
    let awayBefore = null, healthBefore = null, firstName = null;
    try { awayBefore = !!((((Game.state || {}).village || {}).away || {})[vid]); } catch (e) {}
    try { healthBefore = (((Game.state || {}).village || {}).health || {})[vid]; if (healthBefore === undefined) healthBefore = 100; } catch (e) {}
    try {
      const p = Game.getPerson && Game.getPerson(vid);
      if (p && p.name) firstName = String(p.name).split(' ')[0];
    } catch (e) {}
    const sayBefore = W.sayLog.length;
    let take = null;
    try { take = oPack.apply(this, arguments); } catch (e) { throw e; }
    // beatLines: say lines emitted during THIS call only (baseline: none
    // from the beat; armed: the beat line, if it fired). Attribution rides
    // on the call, never on substring matching.
    const beatLines = W.sayLog.slice(sayBefore);
    W.packCalls.push({ vid: String(vid).slice(0, 24), day, away: awayBefore,
      healthBefore, want, take, firstName, beatLines });
    return take;
  };

  // --- villagerMealDay wrapper: reads only, no RNG, dedupe last-wins ---
  const oMeal = Game.villagerMealDay;
  if (typeof oMeal === 'function') Game.villagerMealDay = function (vid, person, v, ctx) {
    const day = ((Game.state || {}).scholar || {}).day || 0;
    let hungerBefore = null, healthBefore = null, needEst = 2000, awayBefore = null;
    try { awayBefore = !!(((v || Game.state.village || {}).away || {})[vid]); } catch (e) {}
    try { const n = Game.npcNeeds && Game.npcNeeds(vid); hungerBefore = n ? (n.hunger || 0) : null; } catch (e) {}
    try { healthBefore = ((v || Game.state.village || {}).health || {})[vid]; if (healthBefore === undefined) healthBefore = 100; } catch (e) {}
    try { const p = person || (Game.getPerson && Game.getPerson(vid)); if (p && p.kcalPerDay) needEst = p.kcalPerDay; } catch (e) {}
    let result = null;
    try { result = oMeal.apply(this, arguments); } catch (e) { throw e; }
    let hungerAfter = null, healthAfter = null;
    try { const n = Game.npcNeeds && Game.npcNeeds(vid); hungerAfter = n ? (n.hunger || 0) : null; } catch (e) {}
    try { healthAfter = ((v || Game.state.village || {}).health || {})[vid]; if (healthAfter === undefined) healthAfter = null; } catch (e) {}
    const key = String(vid) + '|' + day;
    const dupIdx = W.mealRows.findIndex(r => r._key === key);
    const row = { _key: key, vid: String(vid).slice(0, 24), day, away: awayBefore,
      ate: result ? (result.ate ?? null) : null, drawn: result ? (result.drawn ?? null) : null,
      fasting: result ? !!result.fasting : false,
      hungerBefore, hungerAfter, healthBefore, healthAfter, needEst };
    if (dupIdx >= 0) { W.mealDup++; W.mealRows[dupIdx] = row; }
    else W.mealRows.push(row);
    return result;
  };

  const policy = Object.assign({}, competent);
  const origDaily = competent.daily;
  policy.daily = (G, ctx) => {
    try {
      let hungry = 0;
      const roster = ((G.state || {}).village || {}).roster || [];
      W.villageDays += roster.length;
      for (const id of roster) {
        try { if (G.npcNeeds && (G.npcNeeds(id).hunger || 0) > 70) hungry++; } catch (e) {}
      }
      if (hungry > 0) W.starveDays++;
      let fd = null, pk = null;
      if (G.pantryFreshDays) { fd = G.pantryFreshDays(); }
      try { if (G.pantryKcalLive) pk = Math.round(G.pantryKcalLive(G.state.village)); } catch (e) {}
      W.daySeries.push({ day: ((G.state || {}).scholar || {}).day || 0, pop: roster.length, hungry,
        freshDays: (fd == null ? null : Math.round(fd * 10) / 10), pantryKcal: pk });
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
    seed, cell: CELL, policy: 'competent',
    plentydepri: 1, depositgate: 1,
    daysAlive: result.days, villageDays: W.villageDays,
    deathCauses, deathRows: W.deaths,
    mealRows: W.mealRows.map(({ _key, ...r }) => r),
    packCalls: W.packCalls,
    sayLog: W.sayLog, sayTruncated: W.sayTruncated,
    daySeries: W.daySeries, national,
    table: won, win: won,
    waveReach, medianSurvival: null,
    freshDaysMedian: (m => (m == null ? null : Math.round(m * 10) / 10))(med(freshSeries)),
  };
  const diag = {
    endReason: result.endReason, rank, maxWave, arc: (() => { try { return (Game.progState() || {}).arc || 1; } catch (e) { return 1; } })(),
    starveDays: W.starveDays, deathRowCount: W.deaths.length,
    mealRowCount: W.mealRows.length, mealDupCount: W.mealDup,
    packCallCount: W.packCalls.length, sayLogCount: W.sayLog.length, ms,
  };
  return { seed, perSeed, diag };
}

if (require.main === module) (async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const { seed: s, perSeed, diag } = await oneRun(seed, DAYS);
    rows.push({ seed: s, perSeed, diag });
    try { fs.mkdirSync(PERSEED_DIR, { recursive: true }); }
    catch (e) { console.error('MKDIR FAIL LOUDLY', PERSEED_DIR, e.message); process.exit(2); }
    writeRobust(path.join(PERSEED_DIR, `awayvoice-b-reproof-s${s}.json`),
      JSON.stringify(perSeed));
    console.log(`done seed=${s} cell=${CELL} days=${perSeed.daysAlive} end=${diag.endReason} rank=${diag.rank} wave=${diag.maxWave} deaths=${diag.deathRowCount} meals=${diag.mealRowCount} packCalls=${diag.packCallCount} sayLines=${diag.sayLogCount} won=${perSeed.win} (${diag.ms}ms)`);
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
  writeRobust(OUT, JSON.stringify({ meta: { cell: CELL, policy: 'competent', days: DAYS, seeds: allSeeds, env: { PLENTYDEPRI: '1', DEPOSITGATE: '1' } }, rows: merged }));
  console.log('wrote ' + OUT + ' (' + merged.length + ' rows)');
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });

module.exports = { oneRun, FRESH, DAYS };
