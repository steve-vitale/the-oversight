#!/usr/bin/env node
// sweep-portionwindfall-b3.js — PORTION-SCALED windfall feast REVIVAL sweep (sim-portionwindfall-b3, 2026-10-18).
//
// Finding #571's named next under the REVISED guardrails: same proven
// spec as sim-portionwindfall-b / -b2 (300*roster doomed trigger, NO
// frequency cap, 275*roster cost cap via top-trust guest subset).
// Pre-registered PRIMARY: (rot:preserved + rot:fresh) absolute per 100 days
// alive, armed <= 0.80x control. ENGAGEMENT GO: windfall tail-burn fires
// (a fire with another windfall <=2d earlier) >= 400 across the armed side,
// cap-bit on every firing (the #571 bar — b measured 477, b2 measured 295).
// Guardrail (a) dose-aware: per-pair starve RATE reported (both >30d); FAIL
// iff pooled armed rate > control x1.15 AND Pearson(windfall count,
// per-pair rate delta) > +0.3 (b2's metric review retired the 1.15x per-pair
// ratio as noise-firing; #582 adopted this standing form).
// Guardrail (b): new-death-mode exposure-matched, >=2 count floor.
// Guardrail (c): median survival >= control-10d (dose-response + the #538
// split rule available). Guardrail (d): laundering 0 at convert time.
// Guardrail (e): ate/person-day intact (pooled): armed >= control x 0.98.
//
// Env: FEASTSCALE_R13=1, SEATDRIVE=0 explicit (asserted); PORTIONWINDFALL=1 armed.
// SIDE=control|armed SEEDS="6201,...,6208" POLICY=leadfeast|belongfeast
//   DAYS=180 OUT=<path> node scripts/sweep-portionwindfall-b3.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
let withPortionWindfall;
try { ({ withPortionWindfall } = require('./policies/portionwindfall')); }
catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: sim-portionwindfall-b3 layer killed per protocol; sweep vacuous, exit 0.');
    process.exit(0);
  }
  throw e;
}

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
if (process.env.SIDE === 'armed' && process.env.PORTIONWINDFALL !== '1') {
  console.error('FATAL: SIDE=armed requires PORTIONWINDFALL=1');
  process.exit(2);
}

const POLICIES = {
  leadfeast: withPortionWindfall(leadfeast, 'leadfeast+portionwindfall', 'leadfeast + portion-scaled windfall feast (PORTIONWINDFALL)'),
  belongfeast: withPortionWindfall(belongfeast, 'belongfeast+portionwindfall', 'belongfeast + portion-scaled windfall feast (PORTIONWINDFALL)'),
};
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = POLICIES[POLICY_ID] || POLICIES.leadfeast;
const SIDE = process.env.SIDE || 'control';
const SEEDS = (process.env.SEEDS || '7201,7202,7203,7204,7205,7206,7207,7208')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || ('/tmp/sim-portionwindfall-b3/sweep-' + SIDE + '-' + POLICY_ID + '.json');

function pantryKcal(Game) {
  try { return (((Game.state || {}).village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; }
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'portionwindfall-b3-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const W = { deaths: [], deathSeen: new Set(), dutyPreserved: 0, laundered: 0, starveDays: 0,
              windfallFeasts: 0, windfallKcal: 0, windfallDoomed: 0, windfallDoomedEaten: 0,
              windfallCapBit: 0, windfallFireDays: [] };

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

  // --- duty-time cook drive throughput + laundering detection ---
  const oROA = Game.resolveOneAssignment;
  if (typeof oROA === 'function') Game.resolveOneAssignment = function (vid, a) {
    let isCook = false;
    try { isCook = !!(a && a.task === 'cook'); } catch (e) {}
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
    const r = oROA.apply(this, arguments);
    if (isCook) {
      try {
        for (const it of (((Game.state.village || {}).pantry) || [])) {
          if (!it) continue;
          if (it.foodState === 'preserved' || it.foodState === 'rendered') {
            const k = (it.kcalEach || 0) * (it.units || 1);
            const prev = beforePres.get(it) || 0;
            if (k > prev) {
              W.dutyPreserved += (k - prev);
              if (beforeSpoiled.has(it)) W.laundered++;
            }
          }
        }
      } catch (e) {}
    }
    return r;
  };

  // --- deaths: kind-aware (findings #517/#525): capture tele kind, filter to
  // person/villager only (monster kills pollute the share otherwise), dedup
  // on (who, day, cause). Thirst/dehydration canonicalization happens in the
  // analyzer (#515/#544). ---
  const oDie = Game.registerDeath;
  if (typeof oDie === 'function') Game.registerDeath = function (opts) {
    try {
      const kind = String((opts && opts.kind) || '');
      if (kind === 'person' || kind === 'villager') {
        const who = String((opts && (opts.villagerId || opts.name)) || '?');
        const day = (Game.state.scholar || {}).day || 0;
        const cause = String((opts && opts.cause) || '?').slice(0, 32);
        const key = who + '|' + day + '|' + cause;
        if (!W.deathSeen.has(key)) {
          W.deathSeen.add(key);
          W.deaths.push({ day, who: who.slice(0, 24), kind, cause });
        }
      }
    } catch (e) {}
  };

  // --- villager eating (guardrail (e): ate/person-day intact, pooled) ---
  const oMeal = Game.villagerMealDay;
  if (typeof oMeal === 'function') Game.villagerMealDay = function () {
    const r = oMeal.apply(this, arguments);
    try { W.ateSum = (W.ateSum || 0) + ((r && r.ate) || 0); W.vdays = (W.vdays || 0) + 1; } catch (e) {}
    return r;
  };

  // --- windfall feast telemetry: capture ctx from the policy upkeep ---
  let capturedCtx = null;
  const policy = Object.assign({}, POLICY);
  const origUpkeep = POLICY.upkeep;
  policy.upkeep = (G, ctx) => {
    capturedCtx = ctx;
    if (origUpkeep) return origUpkeep(G, ctx);
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
  try {
    W.windfallFeasts = (capturedCtx && capturedCtx._pwFeasts) || 0;
    W.windfallKcal = (capturedCtx && capturedCtx._pwKcal) || 0;
    W.windfallDoomed = (capturedCtx && capturedCtx._pwDoomed) || 0;
    W.windfallDoomedEaten = (capturedCtx && capturedCtx._pwDoomedEaten) || 0;
    W.windfallCapBit = (capturedCtx && capturedCtx._pwCapBit) || 0;
    W.windfallFireDays = ((capturedCtx && capturedCtx._pwFireDays) || []).slice();
  } catch (e) {}
  let exiled = 0, rosterEnd = 0;
  try {
    const v = Game.state.village || {};
    rosterEnd = (v.roster || []).length;
    for (const id of (v.roster || [])) {
      try { const p = Game.getPerson ? Game.getPerson(id) : null; if (p && p.exiled) exiled++; } catch (e) {}
    }
  } catch (e) {}
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
    atePerVday: W.vdays ? +((W.ateSum || 0) / W.vdays).toFixed(1) : 0,
    ateSum: Math.round(W.ateSum || 0), ateVdays: W.vdays || 0,
    windfallFeasts: W.windfallFeasts, windfallKcal: Math.round(W.windfallKcal),
    windfallDoomed: Math.round(W.windfallDoomed), windfallDoomedEaten: Math.round(W.windfallDoomedEaten),
    windfallCapBit: W.windfallCapBit, windfallFireDays: W.windfallFireDays,
    deaths: W.deaths, ms,
  };
  return { seed, end };
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const { seed: s, end } = await oneRun(seed, DAYS);
    rows.push({ seed: s, end });
    console.log(`done seed=${s} days=${end.days} end=${end.endReason} rank=${end.rank} wave=${end.maxWave} rot=${Math.round(end.rotFresh / 1000)}k/${Math.round(end.rotPreserved / 1000)}k duty=${Math.round(end.dutyPreserved / 1000)}k starveD=${end.starveDays} ate=${end.atePerVday} launder=${end.laundered} won=${end.won} exiled=${end.exiled} wf=${end.windfallFeasts} wfe=${Math.round(end.windfallDoomedEaten / 1000)}k (${end.ms}ms)`);
  }
  fs.mkdirSync(require('path').dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ meta: { side: SIDE, policy: POLICY_ID, days: DAYS, seeds: SEEDS, env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', PORTIONWINDFALL: SIDE === 'armed' ? '1' : 'unset' } }, rows }, null, 1));
  console.log('wrote ' + OUT);
})();
