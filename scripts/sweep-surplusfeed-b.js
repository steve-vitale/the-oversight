#!/usr/bin/env node
// sweep-surplusfeed-b.js — surplus-share governor pilot sweep (arm
// sim-surplusfeed-b, run fleshout-loop-b-20261018T1930Z).
//
// Env: FEASTSCALE_R13=1, SEATDRIVE=0 explicit (asserted).
//   SIDE=control|armed SEEDS="6401,...,6408" POLICY=leadfeast|belongfeast
//   DAYS=180 OUT=<path> node scripts/sweep-surplusfeed-b.js
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

const POLICIES = { leadfeast, belongfeast };
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = POLICIES[POLICY_ID] || POLICIES.leadfeast;
const SIDE = process.env.SIDE || 'control';
const SEEDS = (process.env.SEEDS || '6401,6402,6403,6404,6405,6406,6407,6408')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || ('/tmp/sim-surplusfeed-b/sweep-' + SIDE + '-' + POLICY_ID + '.json');

function pantryKcal(Game) {
  try { return (((Game.state || {}).village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; }
}

function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'surplusfeed-b-' + POLICY_ID + '-' + SIDE, fullTelemetry: false });
  await setupGame(Game);
  const W = {
    deaths: [], deathSeen: new Set(), starveDays: 0,
    shareSurplus: 0, ateSum: 0, vdays: 0, producedSum: 0,
    dawnFreshDays: [],
  };

  // --- rot: fresh vs preserved (dedupe by item identity) ---
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

  // --- villager surplus-share funnel (the governed channel) ---
  const oSur = Game.stockSurplus;
  if (typeof oSur === 'function') Game.stockSurplus = function (v, give) {
    let r = 0;
    try { r = oSur.apply(this, arguments); } catch (e) { r = 0; }
    try { if (typeof r === 'number' && r > 0) W.shareSurplus += r; } catch (e) {}
    return r;
  };

  // --- villager eating + production (guardrail: eating untouched) ---
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

  // --- dawn sensor: freshDays at dawn (glut-day definition) ---
  const oSleep = Game.sleep;
  if (typeof oSleep === 'function') Game.sleep = function () {
    const r = oSleep.apply(this, arguments);
    try {
      if (Game.pantryFreshDays) W.dawnFreshDays.push(+Number(Game.pantryFreshDays()).toFixed(3));
    } catch (e) {}
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

  // --- governor telemetry ---
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
  return { seed, end };
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const { seed: s, end } = await oneRun(seed, DAYS);
    rows.push({ seed: s, end });
    console.log(`done seed=${s} days=${end.days} end=${end.endReason} rot=${Math.round(end.rotFresh / 1000)}k share=${Math.round(end.shareSurplus / 1000)}k trim=${end.trimEvents}/${end.trimDays}d glut=${end.glutDays}d ate=${end.atePerVday} starveD=${end.starveDays} won=${end.won} (${end.ms}ms)`);
  }
  fs.mkdirSync(require('path').dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ meta: { side: SIDE, policy: POLICY_ID, days: DAYS, seeds: SEEDS, env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', SURPLUSFEED: SIDE === 'armed' ? '1' : 'unset' } }, rows }, null, 1));
  console.log('wrote ' + OUT);
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
