#!/usr/bin/env node
// sweep-doublenight-fix-a.js — FIX-ARM sweep for sim-doublenight-fix-a
// (2026-11-07/08, run fleshout-20261108T0015Z, Loop A, axis food-economy).
// Runs the sim-mealday-caller-a call-site recorder before AND after the
// endDay double-night fix, on identical seeds, so the fix is judged on
// reproduced dedupe fires (before) vs zero fires (after).
//
// DERIVED from scripts/sweep-mealday-caller-a.js (that script is NOT
// modified). The recorder is VERBATIM: same loadGame/setupGame/runDays,
// same death capture, same meal-row shape, same villageEats invocation
// counter, same villagerMealDay wrapper, same call-site stack capture,
// same writeRobust. Declared deltas (verified by
// scripts/test-doublenight-fix-a.js):
//   1. Names/paths: doublenight-fix-a-*, corpus
//      evidence/2026-11-07/doublenight-fix-a-corpus-before/ (before) and
//      evidence/2026-11-07/doublenight-fix-a-corpus-after/ (after),
//      selected via the OUT / PERSEED_DIR env (the runner passes them;
//      the defaults below point at the BEFORE corpus).
//   2. Seeds: EXACTLY one of three 8-seed lists — P1 98067,98052,98079,
//      98062,98034,98095,98022,98028 (the diag's pilot, deliberate reuse:
//      reproduction requires the same seeds), P2 98051,98029,98065,98081,
//      98092,98093,98099,98012 (extension, iff the before pilot
//      reproduces < 4 fires), or F1 17901,17902,17903,17904,17905,17906,
//      17907,17908 (fresh confirm band — freshness check in the prereg:
//      no prereg names it, no forbidden list names it). The sweep refuses
//      any other seed list; DAYS must be exactly 150.
//   3. Nothing else. In particular MEALDAY_TRACE=1 arms the identical
//      call-site recorder; MEALDAY_TRACE=0 (or unset) runs the identical
//      awayconfirm-shaped meal wrapper only (neutrality baseline).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

if (process.env.PLENTYDEPRI !== '1' || process.env.DEPOSITGATE !== '1') {
  console.error('FATAL: PLENTYDEPRI=1 and DEPOSITGATE=1 must both be set explicitly (shipped defaults, explicit)');
  process.exit(2);
}
const TRACE = (process.env.MEALDAY_TRACE || '0');
if (TRACE !== '0' && TRACE !== '1') {
  console.error('FATAL: MEALDAY_TRACE must be 0 or 1, got: ' + process.env.MEALDAY_TRACE);
  process.exit(2);
}
const SEEDS = (process.env.SEEDS || '')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const P1 = [98067, 98052, 98079, 98062, 98034, 98095, 98022, 98028];
const P2 = [98051, 98029, 98065, 98081, 98092, 98093, 98099, 98012];
const F1 = [17901, 17902, 17903, 17904, 17905, 17906, 17907, 17908];
const isList = (list) => SEEDS.length === list.length && SEEDS.every((s, i) => s === list[i]);
if (!isList(P1) && !isList(P2) && !isList(F1)) {
  console.error('FATAL: seeds must be exactly P1 98067,98052,98079,98062,98034,98095,98022,98028 or P2 98051,98029,98065,98081,98092,98093,98099,98012 or F1 17901,17902,17903,17904,17905,17906,17907,17908, got: ' + (process.env.SEEDS || '(unset)'));
  process.exit(2);
}
const DAYS = parseInt(process.env.DAYS || '', 10);
if (DAYS !== 150) {
  console.error('FATAL: DAYS must be exactly 150, got: ' + (process.env.DAYS || '(unset)'));
  process.exit(2);
}
const OUT = process.env.OUT || path.join(
  __dirname, '..', 'evidence', '2026-11-07', 'doublenight-fix-a-corpus-before', 'sweep-competent-trace' + TRACE + '.json');
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-11-07', 'doublenight-fix-a-corpus-before');

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

// callSiteFromStack: first stack frame BELOW this sweep file — the game code
// that called Game.villagerMealDay. Returns { site, frames }: site is the
// first non-sweep frame (e.g. "Game.villageEats (src/js/game.js:32246:9)"),
// frames the first 6 non-sweep frames for classification. Pure read.
function callSiteFromStack() {
  try {
    const stack = (new Error('mealday-trace').stack || '').split('\n').slice(1);
    const frames = [];
    for (const line of stack) {
      const t = line.trim();
      if (!t) continue;
      if (t.indexOf('sweep-doublenight-fix-a') !== -1) continue;
      if (t.indexOf('callSiteFromStack') !== -1) continue;
      frames.push(t.replace(/^at\s+/, '').slice(0, 200));
      if (frames.length >= 6) break;
    }
    return { site: frames[0] || '', frames };
  } catch (e) { return { site: '', frames: [] }; }
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'doublenight-fix-a-competent', fullTelemetry: false });
  await setupGame(Game);
  const W = {
    deaths: [], deathSeen: new Set(), mealRows: [], mealDup: 0,
    daySeries: [], hungrySeries: [], sayWin: [], teleWin: [],
    villageDays: 0, starveDays: 0,
    mealCalls: [], eatsInv: 0, curEatsInv: 0, curEatsSeq: 0,
  };
  const trunc = (t) => String(t == null ? '' : t).slice(0, 170);

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

  // --- deaths: CALL-THROUGH capture (awayconfirm delta 3, unchanged) ---
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

  // --- transcript windows ---
  const oSay = Game.say;
  if (typeof oSay === 'function') Game.say = function (txt) {
    try { W.sayWin.push('d' + (((Game.state || {}).scholar || {}).day || 0) + ' ' + trunc(txt)); if (W.sayWin.length > 20) W.sayWin.shift(); } catch (e) {}
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

  // --- villageEats invocation counter (reads only: a counter, no game state) ---
  const oEats = Game.villageEats;
  if (typeof oEats === 'function') Game.villageEats = function () {
    W.eatsInv += 1;
    W.curEatsInv = W.eatsInv;
    W.curEatsSeq = 0;
    return oEats.apply(this, arguments);
  };

  // --- villagerMealDay wrapper: awayconfirm delta 4 + call-site recorder ---
  const oMeal = Game.villagerMealDay;
  if (typeof oMeal === 'function') Game.villagerMealDay = function (vid, person, v, ctx) {
    const day = ((Game.state || {}).scholar || {}).day || 0;
    let hungerBefore = null, healthBefore = null, needEst = 2000, awayBefore = null;
    try { awayBefore = !!(((v || Game.state.village || {}).away || {})[vid]); } catch (e) {}
    try { const n = Game.npcNeeds && Game.npcNeeds(vid); hungerBefore = n ? (n.hunger || 0) : null; } catch (e) {}
    try { healthBefore = ((v || Game.state.village || {}).health || {})[vid]; if (healthBefore === undefined) healthBefore = 100; } catch (e) {}
    try { const p = person || (Game.getPerson && Game.getPerson(vid)); if (p && p.kcalPerDay) needEst = p.kcalPerDay; } catch (e) {}
    // Recorder (trace-on only): call site + invocation identity, read BEFORE
    // the call so a second call's site is captured even if the call throws.
    // Stack capture reads no RNG and writes no game state.
    let site = '', frames = [], eatsInv = W.curEatsInv, seq = 0;
    if (TRACE === '1') {
      const cs = callSiteFromStack();
      site = cs.site; frames = cs.frames;
      W.curEatsSeq += 1; seq = W.curEatsSeq;
    }
    let result = null;
    try { result = oMeal.apply(this, arguments); } catch (e) { throw e; }
    let hungerAfter = null, healthAfter = null;
    try { const n = Game.npcNeeds && Game.npcNeeds(vid); hungerAfter = n ? (n.hunger || 0) : null; } catch (e) {}
    try { healthAfter = ((v || Game.state.village || {}).health || {})[vid]; if (healthAfter === undefined) healthAfter = null; } catch (e) {}
    const key = String(vid) + '|' + day;
    // DEDUPE (awayconfirm delta 3): keep ONE row per (vid,day) — last call
    // wins — and count the replacement. The recorder additionally logs the
    // replacement call so the analyzer can classify the fire.
    const dupIdx = W.mealRows.findIndex(r => r._key === key);
    const isDup = dupIdx >= 0;
    const row = { _key: key, vid: String(vid).slice(0, 24), day, away: awayBefore,
      ate: result ? (result.ate ?? null) : null, drawn: result ? (result.drawn ?? null) : null,
      fasting: result ? !!result.fasting : false,
      hungerBefore, hungerAfter, healthBefore, healthAfter, needEst };
    if (isDup) { W.mealDup++; W.mealRows[dupIdx] = row; }
    else W.mealRows.push(row);
    if (TRACE === '1') {
      W.mealCalls.push({ vid: String(vid).slice(0, 24), day, away: awayBefore,
        site, frames, eatsInv, seq, isDup,
        ate: row.ate, drawn: row.drawn, fasting: row.fasting,
        hungerBefore, hungerAfter, healthBefore, healthAfter, needEst });
    }
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
    seed, policy: 'competent',
    plentydepri: 1, depositgate: 1, mealdayTrace: TRACE === '1' ? 1 : 0,
    daysAlive: result.days, villageDays: W.villageDays,
    deathCauses, deathRows: W.deaths,
    mealRows: W.mealRows.map(({ _key, ...r }) => r),
    daySeries: W.daySeries, national,
    table: won, win: won,
    waveReach, medianSurvival: null,
    freshDaysMedian: (m => (m == null ? null : Math.round(m * 10) / 10))(med(freshSeries)),
  };
  if (TRACE === '1') {
    perSeed.mealCalls = W.mealCalls;
    perSeed.eatsInvocations = W.eatsInv;
  }
  const diag = {
    endReason: result.endReason, rank, maxWave, arc: (() => { try { return (Game.progState() || {}).arc || 1; } catch (e) { return 1; } })(),
    starveDays: W.starveDays, deathRowCount: W.deaths.length,
    mealRowCount: W.mealRows.length, mealDupCount: W.mealDup, ms,
    eatsInvCount: W.eatsInv, callLogCount: W.mealCalls.length,
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
    writeRobust(path.join(PERSEED_DIR, `doublenight-fix-a-competent-s${s}-trace${TRACE}.json`),
      JSON.stringify(perSeed));
    console.log(`done seed=${s} days=${perSeed.daysAlive} end=${diag.endReason} rank=${diag.rank} wave=${diag.maxWave} deaths=${diag.deathRowCount} meals=${diag.mealRowCount} dups=${diag.mealDupCount} eatsInv=${diag.eatsInvCount} calls=${diag.callLogCount} won=${perSeed.win} (${diag.ms}ms)`);
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
  writeRobust(OUT, JSON.stringify({ meta: { cell: 'competent', policy: 'competent', days: DAYS, seeds: allSeeds, trace: TRACE, env: { PLENTYDEPRI: '1', DEPOSITGATE: '1', MEALDAY_TRACE: TRACE } }, rows: merged }));
  console.log('wrote ' + OUT + ' (' + merged.length + ' rows)');
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });

module.exports = { oneRun, callSiteFromStack, P1, P2, F1, DAYS };
