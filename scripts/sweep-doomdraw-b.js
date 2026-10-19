#!/usr/bin/env node
// sweep-doomdraw-b.js — DOOMED-ONLY DRAW DISCIPLINE sweep (sim-doomdraw-b, 2026-10-18).
//
// The draw-side targeting discipline: DOOMDRAW=1 wraps leadfeast/belongfeast
// (leaddoomdraw/belongdoomdraw); at every pantryDraw, doomed first in
// spoilage order (engine law), fresh never below the 2-fresh-days reserve
// floor. Pre-registered PRIMARY: (rot:preserved + rot:fresh) absolute per
// 100 days alive, armed <= 0.85x control. ENGAGEMENT: floor-bound nights >=
// 8 across the armed side (mechanism gate); doomed-drawn share >= 60%
// (discipline operating check). Guardrails: median survival >= control-10d;
// dose-aware starve-rate (pooled >+15% AND Pearson(dose, rate-delta) > +0.3);
// no new death mode (exposure-matched, >=2 floor); laundering 0 at convert
// time; det-gate byte-identical.
//
// Env: FEASTSCALE_R13=1, SEATDRIVE=0 explicit (asserted); DOOMDRAW=1 armed.
// SIDE=control|armed SEEDS="6551,...,6558" POLICY=leaddoomdraw|belongdoomdraw
//   DAYS=180 OUT=<path> node scripts/sweep-doomdraw-b.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
let L;
try { L = require('./policies/doomdraw'); }
catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: sim-doomdraw-b layer killed per protocol; sweep vacuous, exit 0.');
    process.exit(0);
  }
  throw e;
}
const { withDoomDraw } = L;
const { leadfeast, belongfeast } = require('./policies/feastscale');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
if (process.env.SIDE === 'armed' && process.env.DOOMDRAW !== '1') {
  console.error('FATAL: SIDE=armed requires DOOMDRAW=1');
  process.exit(2);
}

const POLICIES = {
  leaddoomdraw: withDoomDraw(leadfeast, 'leaddoomdraw', 'leadfeast + doomed-only draw discipline (DOOMDRAW)'),
  belongdoomdraw: withDoomDraw(belongfeast, 'belongdoomdraw', 'belongfeast + doomed-only draw discipline (DOOMDRAW)'),
};
const POLICY_ID = process.env.POLICY || 'leaddoomdraw';
const POLICY = POLICIES[POLICY_ID] || POLICIES.leaddoomdraw;
const SIDE = process.env.SIDE || 'control';
const SEEDS = (process.env.SEEDS || '6551,6552,6553,6554,6555,6556,6557,6558')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || ('/tmp/sim-doomdraw-b/sweep-' + SIDE + '-' + POLICY_ID + '.json');

function pantryKcal(Game) {
  try { return (((Game.state || {}).village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; }
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'doomdraw-b-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const W = { deaths: [], deathSeen: new Set(), dutyPreserved: 0, laundered: 0, starveDays: 0,
              spoiledDrawn: 0, stockedInflow: 0 };

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

  // --- duty-time cook drive throughput + laundering detection (convert time) ---
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

  // --- drawSpoiled desperation volumes (the harm channel the floor must not open) ---
  const oDS = Game.drawSpoiled;
  if (typeof oDS === 'function') Game.drawSpoiled = function (v, want, exposure) {
    const got = oDS.apply(this, arguments);
    try { W.spoiledDrawn += Math.round(got || 0); } catch (e) {}
    return got;
  };

  // --- stockSurplus inflow (the production-rebound lens: does a fatter pantry cool inflow?) ---
  const oSS = Game.stockSurplus;
  if (typeof oSS === 'function') Game.stockSurplus = function (v, give) {
    const stored = oSS.apply(this, arguments);
    try { W.stockedInflow += Math.round(stored || 0); } catch (e) {}
    return stored;
  };

  // --- deaths: kind-aware (findings #517/#525): person/villager only, dedup on (who,day,cause) ---
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

  // --- doomdraw telemetry: capture ctx from the policy ---
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
  let dd = {};
  try { dd = Object.assign({}, (capturedCtx && capturedCtx._ddTele) || {}); } catch (e) {}
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
    starveDays: W.starveDays, deaths: W.deaths,
    spoiledDrawn: Math.round(W.spoiledDrawn), stockedInflow: Math.round(W.stockedInflow),
    ddDraws: dd.draws || 0, ddHeld: dd.held || 0, ddBound: dd.bound || 0,
    ddWithheld: Math.round(dd.withheld || 0), ddDoomedDrawn: Math.round(dd.doomedDrawn || 0),
    ddDrawnTotal: Math.round(dd.drawnTotal || 0), ddVoiced: dd.voiced || 0,
    ms,
  };
  return { seed, side: SIDE, policy: POLICY_ID, end };
}

(async () => {
  const rows = [];
  for (const s of SEEDS) {
    const r = await oneRun(s, DAYS);
    rows.push(r);
    const e = r.end;
    console.log(`done seed=${s} days=${e.days} end=${e.endReason} rank=${e.rank} wave=${e.maxWave} ` +
      `rot=${Math.round(e.rotFresh / 1000)}k/${Math.round(e.rotPreserved / 1000)}k ` +
      `duty=${Math.round(e.dutyPreserved / 1000)}k starveD=${e.starveDays} launder=${e.laundered} ` +
      `spoilD=${Math.round(e.spoiledDrawn / 1000)}k bound=${e.ddBound} withheld=${Math.round(e.ddWithheld / 1000)}k ` +
      `doomedShare=${e.ddDrawnTotal ? (100 * e.ddDoomedDrawn / e.ddDrawnTotal).toFixed(0) : '-'}% ` +
      `won=${e.won} exiled=${e.exiled} (${e.ms}ms)`);
  }
  fs.mkdirSync(require('path').dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ side: SIDE, policy: POLICY_ID, seeds: SEEDS, days: DAYS, rows }, null, 2) + '\n');
  console.log('wrote ' + OUT);
})().catch(e => { console.error('SWEEP ERROR', e); process.exit(2); });
