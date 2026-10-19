#!/usr/bin/env node
// sweep-leanclass-b.js — lean-regime divergence census sweep (arm
// sim-leanclass-b, run fleshout-loop-b-20261019T0130Z).
//
// Instrument-only extension of scripts/sweep-surplusfeed-b.js. Adds:
//   - per-dawn trajectory fingerprint {day, live, pk, fd, ate, share}
//   - per-invocation governor log. ARMED: {day, give, r, fireFd, dawnFd}
//     for every invocation (trim iff r < give). CONTROL: read-only
//     "would-have-trimmed" log {day, give, fireFd, dawnFd} at the same
//     call site (condition evaluated read-only; the gate itself is OFF).
// No game-code changes — wrappers only.
//
// Env: FEASTSCALE_R13=1, SEATDRIVE=0 explicit (asserted; stop on mismatch).
//   SIDE=control|armed SEEDS="6417,...,6424" POLICY=leadfeast|belongfeast
//   DAYS=180 OUT=<path> node scripts/sweep-leanclass-b.js
// Armed sets SURPLUSFEED=1 (gate for the governor).
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
if (process.env.SIDE === 'armed' && process.env.SURPLUSFEED !== '1') {
  console.error('FATAL: SIDE=armed requires SURPLUSFEED=1');
  process.exit(2);
}
if (process.env.SIDE === 'control' && process.env.SURPLUSFEED === '1') {
  console.error('FATAL: SIDE=control must not set SURPLUSFEED=1');
  process.exit(2);
}

const POLICIES = { leadfeast, belongfeast };
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = POLICIES[POLICY_ID] || POLICIES.leadfeast;
const SIDE = process.env.SIDE || 'control';
const SEEDS = (process.env.SEEDS || '6417,6418,6419,6420,6421,6422,6423,6424')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || ('/tmp/sim-leanclass-b/sweep-' + SIDE + '-' + POLICY_ID + '.json');

function pantryKcal(Game) {
  try { return (((Game.state || {}).village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; }
}
function livingCount(Game) {
  try {
    return (((Game.state || {}).village || {}).roster || [])
      .filter(id => { try { const p = Game.getPerson(id); return p && !p.dead; } catch (e) { return false; } }).length;
  } catch (e) { return -1; }
}
function freshDays(Game) {
  try { return +Number(Game.pantryFreshDays()).toFixed(3); } catch (e) { return -1; }
}
function hungerStreak(Game) {
  try { const pg = (typeof Game.progState === 'function') ? Game.progState() : null; return (pg && pg.hungryStreak) || 0; } catch (e) { return 0; }
}
function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'leanclass-b-' + POLICY_ID + '-' + SIDE, fullTelemetry: false });
  await setupGame(Game);
  const W = {
    deaths: [], deathSeen: new Set(), starveDays: 0,
    shareSurplus: 0, ateSum: 0, vdays: 0, producedSum: 0,
    dawnFreshDays: [], fps: [], govLog: [],
  };

  const rotCounted = new Set();
  const oSweep = Game.sweepSpoiled;
  if (typeof oSweep === 'function') Game.sweepSpoiled = function () {
    try {
      for (const it of (((Game.state.village || {}).pantry) || [])) {
        if (it && !it.bonded && !rotCounted.has(it) && Game.isSpoiled && Game.isSpoiled(it)) {
          rotCounted.add(it);
          const fs = (it.foodState === 'preserved' || it.foodState === 'rendered') ? 'preserved' : 'fresh';
          W['rot_' + fs] = (W['rot_' + fs] || 0) + (it.kcalEach || 0) * (it.units || 1);
        }
      }
    } catch (e) {}
    return oSweep.apply(this, arguments);
  };

  const oSur = Game.stockSurplus;
  if (typeof oSur === 'function') Game.stockSurplus = function (v, give) {
    let r = 0;
    try { r = oSur.apply(this, arguments); } catch (e) { r = 0; }
    try { if (typeof r === 'number' && r > 0) W.shareSurplus += r; } catch (e) {}
    return r;
  };

  const oMeal = Game.villagerMealDay;
  if (typeof oMeal === 'function') Game.villagerMealDay = function () {
    const r = oMeal.apply(this, arguments);
    try { W.ateSum += (r && r.ate) || 0; W.vdays++; } catch (e) {}
    return r;
  };
  const oProd = Game.villagerDayProduction;
  if (typeof oProd === 'function') Game.villagerDayProduction = function () {
    const r = oProd.apply(this, arguments);
    try { if (typeof r === 'number' && r > 0) W.producedSum += r; } catch (e) {}
    return r;
  };

  // --- governor call-site log (instrument-only; original behavior untouched) ---
  const oGov = Game.surplusFeedGovernor;
  if (typeof oGov === 'function') Game.surplusFeedGovernor = function (v, give) {
    const fireFd = freshDays(Game), hs = hungerStreak(Game);
    const day = (Game.state.scholar || {}).day || 0;
    const dawnFd = W.dawnFreshDays.length ? W.dawnFreshDays[W.dawnFreshDays.length - 1] : -1;
    const r = oGov.apply(this, arguments);
    try {
      if (SIDE === 'armed') {
        W.govLog.push({ day, give: Math.round(give), r: Math.round(r), fireFd, dawnFd, hs,
          trim: (typeof r === 'number' && r < give) });
      } else {
        // read-only: the gate is OFF; record when the condition WOULD have fired.
        if (fireFd > 4 && hs < 3 && give > 0) {
          W.govLog.push({ day, give: Math.round(give), fireFd, dawnFd, hs, would: true });
        }
      }
    } catch (e) {}
    return r;
  };

  const oSleep = Game.sleep;
  if (typeof oSleep === 'function') Game.sleep = function () {
    const r = oSleep.apply(this, arguments);
    try {
      const fd = freshDays(Game);
      W.dawnFreshDays.push(fd);
      W.fps.push({
        day: ((Game.state || {}).scholar || {}).day || 0,
        live: livingCount(Game), pk: Math.round(pantryKcal(Game)), fd,
        ate: Math.round(W.ateSum), share: Math.round(W.shareSurplus),
      });
    } catch (e) {}
    return r;
  };

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

  let trimDays = 0, trimEvents = 0, trimKcal = 0;
  try {
    const sf = (Game.state.village || {})._surplusFeed || {};
    for (const d of Object.keys(sf.days || {})) {
      trimDays++; trimEvents += sf.days[d].trim; trimKcal += sf.days[d].kcal;
    }
  } catch (e) {}

  let rosterEnd = 0;
  try { rosterEnd = (Game.state.village || {}).roster.length; } catch (e) {}
  const glutDays = W.dawnFreshDays.filter(x => x > 4).length;
  const end = {
    days: result.days, endReason: result.endReason, won: !!Game.won,
    tableWaiting: !!((Game.progState ? Game.progState() : {}).tableWaiting),
    rank: (() => { try { return Game.scaleRank(); } catch (e) { return '?'; } })(),
    nationalLive: !!((Game.state || {}).nationalLive),
    arc: (() => { try { return (Game.progState() || {}).arc || 1; } catch (e) { return 1; } })(),
    maxWave: (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })(),
    rosterEnd, pkEnd: Math.round(pantryKcal(Game)),
    rotFresh: Math.round(W.rot_fresh || 0), rotPreserved: Math.round(W.rot_preserved || 0),
    starveDays: W.starveDays,
    shareSurplus: Math.round(W.shareSurplus),
    produced: Math.round(W.producedSum),
    atePerVday: W.vdays ? +(W.ateSum / W.vdays).toFixed(1) : 0,
    trimDays, trimEvents, trimKcal: Math.round(trimKcal),
    glutDays, dawnDays: W.dawnFreshDays.length,
    deaths: W.deaths, ms,
  };
  const lean = {
    fps: W.fps,
    govLog: W.govLog,
    firstTrimDay: (() => { const t = W.govLog.find(g => g.trim); return t ? t.day : null; })(),
    firstWouldDay: (() => { const t = W.govLog.find(g => g.would); return t ? t.day : null; })(),
  };
  return { seed, end, lean };
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const { seed: s, end, lean } = await oneRun(seed, DAYS);
    rows.push({ seed: s, end, lean });
    console.log(`done seed=${s} days=${end.days} end=${end.endReason} rot=${Math.round(end.rotFresh / 1000)}k share=${Math.round(end.shareSurplus / 1000)}k trim=${end.trimEvents}/${end.trimDays}d glut=${end.glutDays}d govLog=${lean.govLog.length} firstTrim=${lean.firstTrimDay} ate=${end.atePerVday} starveD=${end.starveDays} won=${end.won} (${end.ms}ms)`);
  }
  fs.mkdirSync(require('path').dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ meta: { side: SIDE, policy: POLICY_ID, days: DAYS, seeds: SEEDS, env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', SURPLUSFEED: SIDE === 'armed' ? '1' : 'unset' } }, rows }, null, 1));
  console.log('wrote ' + OUT);
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
