#!/usr/bin/env node
// sweep-windfallrev-b.js — portion-scaled windfall feast + the two
// reconciliations (sim-windfallrev-b, 2026-10-18).
//
// Arms (SIDE):
//   control — PORTIONWINDFALL unset (pure base)
//   full    — PORTIONWINDFALL=1 (both reconciliations on: the layer as designed)
//   norecon — PORTIONWINDFALL=1, WINDFALL_RECONCILE=0 (attribution for (3))
//   noyield — PORTIONWINDFALL=1, WINDFALL_YIELD_SMOKE=0 (attribution for (4))
//
// Pre-registered PRIMARY: (rot:preserved + rot:fresh) absolute per 100 days
// alive — full <= 0.80x control. ENGAGEMENT: windfall tail-burn fires >= 8
// (full side). Guardrails: (a) DOSE-AWARE starve-rate — fail only when the
// rate delta correlates positively with windfall dose at r > +0.3 AND the
// pooled rate rises > +15%; (b) exposure-matched new-death-mode with >=2
// count floor; (c) median survival >= control-10d; (d) laundering 0 at
// convert time. Det-gate byte-identical gate-off.
//
// Env: FEASTSCALE_R13=1, SEATDRIVE=0 explicit (asserted); HUNTSTAFF unset.
// SIDE=control|full|norecon|noyield SEEDS="6801,...,6808" POLICY=leadfeast|belongfeast
//   DAYS=180 OUT=<path> node scripts/sweep-windfallrev-b.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
let withPortionWindfall;
try { ({ withPortionWindfall } = require('./policies/portionwindfall')); }
catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: sim-windfallrev-b layer killed per protocol; sweep vacuous, exit 0.');
    process.exit(0);
  }
  throw e;
}

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
if (process.env.HUNTSTAFF !== undefined && process.env.HUNTSTAFF !== '') {
  console.error('FATAL: HUNTSTAFF must be unset for this run');
  process.exit(2);
}
const SIDE = process.env.SIDE || 'control';
if (SIDE !== 'control' && process.env.PORTIONWINDFALL !== '1') {
  console.error('FATAL: SIDE=' + SIDE + ' requires PORTIONWINDFALL=1');
  process.exit(2);
}
if (SIDE === 'norecon' && process.env.WINDFALL_RECONCILE !== '0') {
  console.error('FATAL: SIDE=norecon requires WINDFALL_RECONCILE=0');
  process.exit(2);
}
if (SIDE === 'noyield' && process.env.WINDFALL_YIELD_SMOKE !== '0') {
  console.error('FATAL: SIDE=noyield requires WINDFALL_YIELD_SMOKE=0');
  process.exit(2);
}

const POLICIES = {
  leadfeast: withPortionWindfall(leadfeast, 'leadwindfallrev', 'leadfeast + windfallrev'),
  belongfeast: withPortionWindfall(belongfeast, 'belongwindfallrev', 'belongfeast + windfallrev'),
};
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = POLICIES[POLICY_ID] || POLICIES.leadfeast;
const SEEDS = (process.env.SEEDS || '6801,6802,6803,6804,6805,6806,6807,6808')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || ('/tmp/sim-windfallrev-b/sweep-' + SIDE + '-' + POLICY_ID + '.json');

function pantryKcal(Game) {
  try { return (((Game.state || {}).village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; }
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'windfallrev-b-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const W = { deaths: [], deathSeen: new Set(), dutyPreserved: 0, laundered: 0, starveDays: 0,
              bearerIds: new Set() };

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

  // --- deaths: kind-aware (findings #517/#525), dedup on (who,day,cause) ---
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

  // --- windfall telemetry: capture ctx from the policy upkeep; bearer ids daily ---
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
      if (G.villagerId) W.bearerIds.add(String(G.villagerId));
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
  const cc = capturedCtx || {};
  let exiled = 0, rosterEnd = 0;
  try {
    const v = Game.state.village || {};
    rosterEnd = (v.roster || []).length;
    for (const id of (v.roster || [])) {
      try { const p = Game.getPerson ? Game.getPerson(id) : null; if (p && p.exiled) exiled++; } catch (e) {}
    }
  } catch (e) {}
  const fireDetail = cc._pwFireDetail || [];
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
    bearerChanges: Math.max(0, W.bearerIds.size - 1),
    windfallFeasts: cc._pwFeasts || 0, windfallKcal: Math.round(cc._pwKcal || 0),
    windfallDoomed: Math.round(cc._pwDoomed || 0), windfallDoomedEaten: Math.round(cc._pwDoomedEaten || 0),
    windfallCapBit: cc._pwCapBit || 0, windfallFireDays: (cc._pwFireDays || []).slice(),
    windfallFreshGrants: fireDetail.filter(f => f.freshGrant).length,
    windfallScavDraws: (cc._pwScavDrawDays || []).length,
    windfallReconSuppress: cc._pwReconSuppress || 0,
    windfallReconSuppressDays: (cc._pwReconSuppressDays || []).slice(),
    windfallSmokeYield: cc._pwSmokeYield || 0,
    windfallSmokeYieldDays: (cc._pwSmokeYieldDays || []).slice(),
    windfallFireDetail: fireDetail.map(f => ({ day: f.day, buffLive: !!f.buffLive, surgeArmed: !!f.surgeArmed,
      freshGrant: !!f.freshGrant, scavDrawn: f.scavDrawn || null, guests: f.guests, spent: f.spent })),
    deaths: W.deaths, ms,
  };
  return { seed, end };
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const { seed: s, end } = await oneRun(seed, DAYS);
    rows.push({ seed: s, end });
    console.log(`done seed=${s} days=${end.days} end=${end.endReason} rank=${end.rank} wave=${end.maxWave} rot=${Math.round(end.rotFresh / 1000)}k/${Math.round(end.rotPreserved / 1000)}k duty=${Math.round(end.dutyPreserved / 1000)}k starveD=${end.starveDays} launder=${end.laundered} won=${end.won} exiled=${end.exiled} bearers=${end.bearerChanges} wf=${end.windfallFeasts} fg=${end.windfallFreshGrants} draws=${end.windfallScavDraws} reconSup=${end.windfallReconSuppress} smokeY=${end.windfallSmokeYield} wfe=${Math.round(end.windfallDoomedEaten / 1000)}k (${end.ms}ms)`);
  }
  fs.mkdirSync(require('path').dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ meta: { side: SIDE, policy: POLICY_ID, days: DAYS, seeds: SEEDS,
    env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', PORTIONWINDFALL: SIDE === 'control' ? 'unset' : '1',
           WINDFALL_RECONCILE: SIDE === 'norecon' ? '0' : 'default-on',
           WINDFALL_YIELD_SMOKE: SIDE === 'noyield' ? '0' : 'default-on' } }, rows }, null, 1));
  console.log('wrote ' + OUT);
})();
