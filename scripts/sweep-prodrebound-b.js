#!/usr/bin/env node
// sweep-prodrebound-b.js — PRODUCTION-REBOUND diagnostic sweep (arm
// sim-prodrebound-b, run fleshout-loop-b-20261018T175233Z).
//
// Attributes sim-findings #570: the killed sim-feastdraw-b lever's perverse
// dose-response (Pearson(fd nights, pair rot ratio) = +0.73; backfires
// lead 6206 rot 1.87x, belong 6202 rot 2.10x). Hypothesis: the village
// answers the leaner post-seconds pantry with more production, and the
// marginal production rots.
//
// The original feastdraw layer was deleted zero-trace per kill protocol.
// The armed side uses scripts/prodrebound-feastdraw-replay.js — a
// DIAGNOSTIC-ONLY replay (NOT a lever; never land it). Fidelity gate: the
// replay must reproduce the backfire on the two known seeds
// (pinned in scripts/test-prodrebound-b.js).
//
// Env: FEASTSCALE_R13=1, SEATDRIVE=0 explicit (asserted).
//   SIDE=control|armed SEEDS="6301,...,6308" POLICY=leadfeast|belongfeast
//   DAYS=180 OUT=<path> node scripts/sweep-prodrebound-b.js
// Armed sets FEASTDRAW_REPLAY=1 (gate for the replay layer).
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { withFeastDrawReplay, layerOn } = require('./prodrebound-feastdraw-replay');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
if (process.env.SIDE === 'armed' && !layerOn()) {
  console.error('FATAL: SIDE=armed requires FEASTDRAW_REPLAY=1');
  process.exit(2);
}

const POLICIES = {
  leadfeast: withFeastDrawReplay(leadfeast, 'leadfeastdraw-replay', 'leadfeast + DIAGNOSTIC feastdraw replay (NOT a lever)'),
  belongfeast: withFeastDrawReplay(belongfeast, 'belongfeastdraw-replay', 'belongfeast + DIAGNOSTIC feastdraw replay (NOT a lever)'),
};
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = POLICIES[POLICY_ID] || POLICIES.leadfeast;
const SIDE = process.env.SIDE || 'control';
const SEEDS = (process.env.SEEDS || '6301,6302,6303,6304,6305,6306,6307,6308')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || ('/tmp/sim-prodrebound-b/sweep-' + SIDE + '-' + POLICY_ID + '.json');

function pantryKcal(Game) {
  try { return (((Game.state || {}).village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; }
}

function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'prodrebound-b-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const W = {
    deaths: [], deathSeen: new Set(), dutyPreserved: 0, laundered: 0, starveDays: 0,
    inflow: {}, // per-channel stockPantry kcal
    throttleCalls: 0, throttleEngaged: 0,
    assignCounts: {},
    dawnSamples: [], // {day, freshKcal, freshDays, burnAvg} sampled after sleep (dawn)
    burnDaily: [],
  };
  const ch = (k, v) => { if (typeof v === 'number' && v > 0) W.inflow[k] = (W.inflow[k] || 0) + v; };

  // --- rot:fresh vs rot:preserved (dedupe by item identity) ---
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

  // --- duty-task flag + cook smoke-drive throughput + laundering ---
  const oROA = Game.resolveOneAssignment;
  if (typeof oROA === 'function') Game.resolveOneAssignment = function (vid, a) {
    const prev = Game._diagDutyTask;
    let isCook = false;
    try {
      Game._diagDutyTask = (a && a.task) || null;
      isCook = (Game._diagDutyTask === 'cook');
    } catch (e) {}
    let beforePres = new Map(), beforeSpoiled = new Set();
    if (isCook) {
      try {
        for (const it of (((Game.state.village || {}).pantry) || [])) {
          if (!it) continue;
          if (it.foodState === 'preserved' || it.foodState === 'rendered')
            beforePres.set(it, (it.kcalEach || 0) * (it.units || 1));
          if (Game.isSpoiled && Game.isSpoiled(it)) beforeSpoiled.add(it);
        }
      } catch (e) {}
    }
    let r;
    try { r = oROA.apply(this, arguments); }
    finally { try { Game._diagDutyTask = prev; } catch (e) {} }
    if (isCook) {
      try {
        for (const it of (((Game.state.village || {}).pantry) || [])) {
          if (!it) continue;
          if (it.foodState === 'preserved' || it.foodState === 'rendered') {
            const k = (it.kcalEach || 0) * (it.units || 1);
            const prevK = beforePres.get(it) || 0;
            if (k > prevK) {
              W.dutyPreserved += (k - prevK);
              if (beforeSpoiled.has(it)) W.laundered++;
            }
          }
        }
      } catch (e) {}
    }
    return r;
  };

  // --- objReturnEffect flag: haul vs traps vs water returns ---
  const oRet = Game.objReturnEffect;
  if (typeof oRet === 'function') Game.objReturnEffect = function (vid, purpose) {
    const prev = Game._diagReturnPurpose;
    try { Game._diagReturnPurpose = purpose || null; } catch (e) {}
    try { return oRet.apply(this, arguments); }
    finally { try { Game._diagReturnPurpose = prev; } catch (e) {} }
  };

  // --- inflow funnel: stockPantry attributed by duty flag / return purpose / name ---
  const oStock = Game.stockPantry;
  if (typeof oStock === 'function') Game.stockPantry = function (kcal, name, opts) {
    try {
      if (typeof kcal === 'number' && kcal > 0) {
        const dt = Game._diagDutyTask, rp = Game._diagReturnPurpose;
        const n = String(name || '');
        if (dt) ch('duty_' + dt, kcal);
        else if (rp === 'haul') ch('haul_field', kcal);
        else if (rp === 'traps' || /snared/i.test(n)) ch('traps', kcal);
        else if (/meal leftovers/i.test(n)) ch('leftovers', kcal);
        else if (/system-replicated|trial feast|genesis fruit|refunded/i.test(n)) ch('system', kcal);
        else if (/foraged|garden harvest|fish catch|game meat/i.test(n)) ch('away_wild', kcal);
        else ch('other', kcal);
      }
    } catch (e) {}
    return oStock.apply(this, arguments);
  };

  // --- villager surplus-share funnel (stockSurplus pushes pantry directly) ---
  const oSur = Game.stockSurplus;
  if (typeof oSur === 'function') Game.stockSurplus = function (v, give) {
    let r = 0;
    try { r = oSur.apply(this, arguments); } catch (e) { r = 0; }
    try { if (typeof r === 'number' && r > 0) ch('share_surplus', r); } catch (e) {}
    return r;
  };

  // --- PRODTHROTTLE sensor: how often does the pantry-full gate engage? ---
  const oThr = Game.prodThrottleEngaged;
  if (typeof oThr === 'function') Game.prodThrottleEngaged = function () {
    let r = false;
    try { r = !!oThr.apply(this, arguments); } catch (e) {}
    try { W.throttleCalls++; if (r) W.throttleEngaged++; } catch (e) {}
    return r;
  };

  // --- duty assignment mix (policy-side; should be ~identical both arms) ---
  const oAssign = Game.assignTask;
  if (typeof oAssign === 'function') Game.assignTask = function (vid, task, opts) {
    try { const t = String(task || '?'); W.assignCounts[t] = (W.assignCounts[t] || 0) + 1; } catch (e) {}
    return oAssign.apply(this, arguments);
  };

  // --- dawn sensor snapshot: what the day's duties see (after sleep rolls the day) ---
  const oSleep = Game.sleep;
  if (typeof oSleep === 'function') Game.sleep = function () {
    const r = oSleep.apply(this, arguments);
    try {
      const v = (Game.state || {}).village || {};
      const day = ((Game.state || {}).scholar || {}).day || 0;
      let freshKcal = 0, freshDays = 0, burnAvg = 0;
      try { freshKcal = Game.pantryFreshKcal ? Game.pantryFreshKcal() : 0; } catch (e) {}
      try { freshDays = Game.pantryFreshDays ? Game.pantryFreshDays() : 0; } catch (e) {}
      try {
        const hist = (v.burnHistory || []).filter(x => x > 0);
        if (hist.length) burnAvg = hist.reduce((a, b) => a + b, 0) / hist.length;
      } catch (e) {}
      W.dawnSamples.push({ day, freshKcal: Math.round(freshKcal), freshDays: +Number(freshDays).toFixed(3), burnAvg: Math.round(burnAvg) });
    } catch (e) {}
    return r;
  };

  // --- deaths: kind-aware, dedup on (who,day,cause), person/villager only ---
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

  // --- ctx capture + starveDays ---
  let capturedCtx = null;
  const policy = Object.assign({}, POLICY);
  const origSetup = POLICY.setup;
  policy.setup = (G, ctx) => {
    capturedCtx = ctx;
    if (origSetup) return origSetup(G, ctx);
  };
  const origDaily = POLICY.daily;
  policy.daily = (G, ctx) => {
    capturedCtx = capturedCtx || ctx;
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
  let fdNights = 0, fdKcal = 0, fdDoomed = 0;
  try {
    fdNights = (capturedCtx && capturedCtx._fdNights) || 0;
    fdKcal = (capturedCtx && capturedCtx._fdKcal) || 0;
    fdDoomed = (capturedCtx && capturedCtx._fdDoomedSeen) || 0;
  } catch (e) {}
  let exiled = 0, rosterEnd = 0, throttleRedirects = 0, throttleExempt = 0;
  try {
    const v = Game.state.village || {};
    rosterEnd = (v.roster || []).length;
    throttleRedirects = v.throttleRedirects || 0;
    throttleExempt = v.throttleExemptDepth || 0;
    for (const id of (v.roster || [])) {
      try { const p = Game.getPerson ? Game.getPerson(id) : null; if (p && p.exiled) exiled++; } catch (e) {}
    }
  } catch (e) {}
  const inflowRounded = {};
  for (const k of Object.keys(W.inflow)) inflowRounded[k] = Math.round(W.inflow[k]);
  const end = {
    days: result.days, endReason: result.endReason, won: !!Game.won,
    tableWaiting: !!((Game.progState ? Game.progState() : {}).tableWaiting),
    rank: (() => { try { return Game.scaleRank(); } catch (e) { return '?'; } })(),
    nationalLive: !!((Game.state || {}).nationalLive),
    arc: (() => { try { return (Game.progState() || {}).arc || 1; } catch (e) { return 1; } })(),
    maxWave: (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })(),
    rosterEnd, exiled, pkEnd: Math.round(pantryKcal(Game)),
    rotFresh: Math.round(W.rot_fresh || 0), rotPreserved: Math.round(W.rot_preserved || 0),
    dutyPreserved: Math.round(W.dutyPreserved), laundered: W.laundered,
    starveDays: W.starveDays,
    inflow: inflowRounded,
    throttleCalls: W.throttleCalls, throttleEngaged: W.throttleEngaged,
    throttleRedirects, throttleExempt,
    assignCounts: W.assignCounts,
    dawn: W.dawnSamples,
    fdNights, fdKcal: Math.round(fdKcal), fdDoomed: Math.round(fdDoomed),
    deaths: W.deaths, ms,
  };
  return { seed, end };
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const { seed: s, end } = await oneRun(seed, DAYS);
    const inTot = Object.entries(end.inflow || {}).reduce((t, [k, v]) => t + (k === 'leftovers' || k === 'system' ? 0 : v), 0);
    rows.push({ seed: s, end });
    console.log(`done seed=${s} days=${end.days} end=${end.endReason} rank=${end.rank} wave=${end.maxWave} rot=${Math.round(end.rotFresh / 1000)}k/${Math.round(end.rotPreserved / 1000)}k inflow=${Math.round(inTot / 1000)}k duty=${Math.round(end.dutyPreserved / 1000)}k thr=${end.throttleEngaged}/${end.throttleCalls} starveD=${end.starveDays} launder=${end.laundered} won=${end.won} fd=${end.fdNights} (${end.ms}ms)`);
  }
  fs.mkdirSync(require('path').dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ meta: { side: SIDE, policy: POLICY_ID, days: DAYS, seeds: SEEDS, env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', FEASTDRAW_REPLAY: SIDE === 'armed' ? '1' : 'unset' } }, rows }, null, 1));
  console.log('wrote ' + OUT);
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
