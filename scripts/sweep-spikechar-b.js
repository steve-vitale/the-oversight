#!/usr/bin/env node
// sweep-spikechar-b.js — intra-day glut-spike characterization sweep (arm
// sim-spikechar-b, run fleshout-loop-b-20261019T0317Z).
//
// Instrument-only extension of scripts/sweep-leanclass-b.js. Differences:
//   - ARMED-ONLY: both arms of every pair run the governor (SURPLUSFEED=1
//     required; the spike channel must be live on every run). Pairs are
//     seed-level: (leadfeast, belongfeast) per seed.
//   - Full-precision fireFd AND dawnFd (leanclass rounded to 3 decimals and
//     produced one false lean-window flag; metric review demands full
//     precision). dawnFd is looked up per scholar-day from dawnByDay; a
//     dawnFd < 0 means "no dawn sample for that day" and is classified
//     unknown-dawn, NEVER spike (leanclass's -1<=4 vacuity fixed).
//   - Per-scholar-day hunger census at sleep, TWO phases: pre-roll (pilot
//     phase, comparable to the pilot's policy.daily sample) and post-roll
//     (attribution phase). REQUIRED because Game.sleep() itself runs
//     catch-up villagerMealDay calls (proven by event-sequence probe:
//     gov@D calls fire INSIDE sleep(D->D+1)): a pre-sleep census does not
//     post-date all day-D trims. The post-sleep census does — every gov@D
//     call, in-loop or in-sleep, precedes it (seq-verified in the proof
//     test), so a spike trim labeled day D precedes the dayEnded=D
//     post-census within the same day/night cycle by construction.
//   - Monotonic seq on every gov invocation and every census: the analyzer
//     verifies trimSeq < censusSeq for every same-day attribution.
// No game-code changes — wrappers only.
//
// Env: FEASTSCALE_R13=1, SEATDRIVE=0 explicit (asserted; stop on mismatch).
//   SURPLUSFEED=1 required. SEEDS="6611,...,6618" POLICY=leadfeast|belongfeast
//   DAYS=180 OUT=<path> node scripts/sweep-spikechar-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
if (process.env.SURPLUSFEED !== '1') {
  console.error('FATAL: sim-spikechar-b is armed-only (both arms of every pair run the governor); SURPLUSFEED=1 required');
  process.exit(2);
}

const POLICIES = { leadfeast, belongfeast };
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = POLICIES[POLICY_ID] || POLICIES.leadfeast;
const SEEDS = (process.env.SEEDS || '6611,6612,6613,6614,6615,6616,6617,6618')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || ('evidence/2026-10-19/perseed-spikechar-b/sweep-' + POLICY_ID + '.json');

function pantryKcal(Game) {
  try { return (((Game.state || {}).village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; }
}
function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'spikechar-b-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const W = {
    deaths: [], deathSeen: new Set(), starveDays: 0,
    shareSurplus: 0, ateSum: 0, vdays: 0,
    govLog: [], census: [], dawnByDay: {}, seq: 0,
  };

  // --- governor call-site log: full-precision fireFd/dawnFd, monotonic seq ---
  const oGov = Game.surplusFeedGovernor;
  if (typeof oGov === 'function') Game.surplusFeedGovernor = function (v, give) {
    const day = (Game.state.scholar || {}).day || 0;
    let fireFd = -1, hs = 0;
    try { fireFd = Game.pantryFreshDays(); } catch (e) {}
    try { const pg = (typeof Game.progState === 'function') ? Game.progState() : null; hs = (pg && pg.hungryStreak) || 0; } catch (e) {}
    const dawnFd = (W.dawnByDay[day] !== undefined) ? W.dawnByDay[day] : -1;
    const seq = ++W.seq;
    const r = oGov.apply(this, arguments);
    try {
      W.govLog.push({
        seq, day, give: Math.round(give),
        r: (typeof r === 'number') ? Math.round(r) : r,
        fireFd, dawnFd, hs,
        trim: (typeof r === 'number' && r < give),
      });
    } catch (e) {}
    return r;
  };

  // --- sleep wrapper: pre-roll census (pilot phase) + post-roll census
  // (attribution phase: every day-D meal, including in-sleep catch-up meals,
  // precedes it) + dawn reading. Seq assigned in true call order: pre < any
  // in-sleep gov call < post.
  function hungerCensus() {
    let nLiving = 0, nMild = 0, nHungry = 0, maxH = 0;
    try {
      for (const id of (((Game.state || {}).village || {}).roster) || []) {
        let p = null;
        try { p = Game.getPerson(id); } catch (e) {}
        if (!p || p.dead) continue;
        nLiving++;
        let h = 0;
        try { h = (Game.npcNeeds(id).hunger) || 0; } catch (e) {}
        if (h > maxH) maxH = h;
        if (h > 70) nHungry++; else if (h > 50) nMild++;
      }
    } catch (e) {}
    return { nLiving, nMild, nHungry, maxHunger: Math.round(maxH) };
  }
  const oSleep = Game.sleep;
  if (typeof oSleep === 'function') Game.sleep = function () {
    const dayEnded = (Game.state.scholar || {}).day || 0;
    const pre = hungerCensus();
    const sPre = ++W.seq;
    const r = oSleep.apply(this, arguments);
    const sPost = ++W.seq;
    const post = hungerCensus();
    try {
      const dayAfter = (Game.state.scholar || {}).day || 0;
      let fd = -1;
      try { fd = Game.pantryFreshDays(); } catch (e) {}
      W.dawnByDay[dayAfter] = fd; // dawn reading of the new day, full precision
      W.census.push(Object.assign({ seq: sPre, dayEnded, phase: 'pre' }, pre));
      W.census.push(Object.assign({ seq: sPost, dayEnded, phase: 'post' }, post));
    } catch (e) {}
    return r;
  };

  // --- villager eating + surplus funnel (sanity: eating intact, share volume) ---
  const oMeal = Game.villagerMealDay;
  if (typeof oMeal === 'function') Game.villagerMealDay = function () {
    const r = oMeal.apply(this, arguments);
    try { W.ateSum += (r && r.ate) || 0; W.vdays++; } catch (e) {}
    return r;
  };
  const oSur = Game.stockSurplus;
  if (typeof oSur === 'function') Game.stockSurplus = function (v, give) {
    let r = 0;
    try { r = oSur.apply(this, arguments); } catch (e) { r = 0; }
    try { if (typeof r === 'number' && r > 0) W.shareSurplus += r; } catch (e) {}
    return r;
  };

  // --- deaths: kind-aware, dedup ---
  const oDie = Game.registerDeath;
  if (typeof oDie === 'function') Game.registerDeath = function (opts) {
    try {
      const kind = String((opts && opts.kind) || '');
      if (kind === 'person' || kind === 'villager') {
        const who = String((opts && (opts.villagerId || opts.name)) || '?');
        const day = (Game.state.scholar || {}).day || 0;
        const cause = canonCause((opts && opts.cause) || '?');
        const key = who + '|' + day + '|' + cause;
        if (!W.deathSeen.has(key)) {
          W.deathSeen.add(key);
          W.deaths.push({ day, who: who.slice(0, 24), kind, cause });
        }
      }
    } catch (e) {}
    return oDie.apply(this, arguments);
  };

  // --- pilot-comparable daily hunger sample (loop-day granularity) ---
  const policy = Object.assign({}, POLICY);
  const origDaily = POLICY.daily;
  policy.daily = (G, ctx) => {
    try {
      let hungry = 0;
      for (const id of (((G.state || {}).village || {}).roster || [])) {
        try { if (G.npcNeeds && (G.npcNeeds(id).hunger || 0) > 70) hungry++; } catch (e) {}
      }
      if (hungry > 0) W.starveDays++;
    } catch (e) {}
    if (origDaily) return origDaily(G, ctx);
  };

  const t0 = Date.now();
  const result = await runDays(Game, policy, { days, manifest: null });
  const ms = Date.now() - t0;

  let rosterEnd = 0;
  try { rosterEnd = (Game.state.village || {}).roster.length; } catch (e) {}
  const end = {
    days: result.days, endReason: result.endReason, won: !!Game.won,
    tableWaiting: !!((Game.progState ? Game.progState() : {}).tableWaiting),
    rank: (() => { try { return Game.scaleRank(); } catch (e) { return '?'; } })(),
    nationalLive: !!((Game.state || {}).nationalLive),
    arc: (() => { try { return (Game.progState() || {}).arc || 1; } catch (e) { return 1; } })(),
    maxWave: (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })(),
    rosterEnd, pkEnd: Math.round(pantryKcal(Game)),
    starveDays: W.starveDays,
    censusMildDaysPre: W.census.filter(c => c.phase === 'pre' && c.nHungry > 0).length,
    censusMildDaysPost: W.census.filter(c => c.phase === 'post' && c.nHungry > 0).length,
    shareSurplus: Math.round(W.shareSurplus),
    atePerVday: W.vdays ? +(W.ateSum / W.vdays).toFixed(1) : 0,
    govCalls: W.govLog.length, censusDays: W.census.length,
    deaths: W.deaths, ms,
  };
  const char = { govLog: W.govLog, census: W.census, dawnByDay: W.dawnByDay };
  return { seed, end, char };
}

(async () => {
  const dir = path.dirname(OUT);
  fs.mkdirSync(dir, { recursive: true });
  const writeOut = (rows) => {
    fs.writeFileSync(OUT, JSON.stringify({
      meta: {
        side: 'armed', policy: POLICY_ID, days: DAYS, seeds: SEEDS,
        env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', SURPLUSFEED: '1' },
      }, rows,
    }));
  };
  // resume: keep already-written rows (restart-resilient; /tmp wipes kill logs, not evidence)
  let rows = [];
  try {
    const prev = JSON.parse(fs.readFileSync(OUT, 'utf8'));
    if (prev && Array.isArray(prev.rows)) rows = prev.rows;
  } catch (e) {}
  const done = new Set(rows.map(r => r.seed));
  if (done.size) console.log(`resuming: ${done.size} seeds already in ${OUT}, skipping`);
  for (const seed of SEEDS) {
    if (done.has(seed)) continue;
    const { seed: s, end, char } = await oneRun(seed, DAYS);
    rows.push({ seed: s, end, char });
    writeOut(rows); // incremental: a restart loses at most the in-progress seed
    console.log(`done seed=${s} days=${end.days} end=${end.endReason} gov=${end.govCalls} censusD=${end.censusDays} mildPre=${end.censusMildDaysPre} mildPost=${end.censusMildDaysPost} starveD=${end.starveDays} ate=${end.atePerVday} won=${end.won} (${end.ms}ms)`);
  }
  console.log('wrote ' + OUT);
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
