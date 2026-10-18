#!/usr/bin/env node
// sweep-windfallcap-b.js — cap-alone WINDFALL FEAST measurement sweep (sim-windfallcap-b, 2026-10-18).
//
// The racks-full binding answer, third variant (finding #546 named next):
// policy-side windfall feast (WINDFALLCAP_B=1) keeping the PROVEN 300*roster
// doomed threshold, adding ONLY the frequency cap (max 2 windfall feasts /
// 7d) — bounding glut-cluster compounding without neutering the threshold.
// Pre-registered PRIMARY: (rot:preserved + rot:fresh) absolute per 100 days
// alive, armed <= 0.75x control (the killed arm hit 0.662; the cap-alone
// variant should retain it). GO also requires mechanism engagement
// (windfall feasts >= 8 across the armed side — the prior arm fired ~1/run).
// Guardrails: starvation <= control+2 per-pair (collapse-aware); median
// survival >= control-10d OR (harm unattributed |r|<0.3 AND primary <=
// 0.70x) — the killed arm's adopted metric review; no new death mode; no
// laundering; laundering measured AT CONVERT TIME.
//
// Env: FEASTSCALE_R13=1, SEATDRIVE=0 explicit (asserted); WINDFALLCAP_B=1 armed.
// SIDE=control|armed SEEDS="5601,...,5608" POLICY=leadfeast|belongfeast
//   DAYS=180 OUT=<path> node scripts/sweep-windfallcap-b.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { withWindfallCap } = require('./policies/windfallcapb');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
if (process.env.SIDE === 'armed' && process.env.WINDFALLCAP_B !== '1') {
  console.error('FATAL: SIDE=armed requires WINDFALLCAP_B=1');
  process.exit(2);
}

const POLICIES = {
  leadfeast: withWindfallCap(leadfeast, 'leadfeast+windfallcapb', 'leadfeast + cap-alone windfall feast (WINDFALLCAP_B)'),
  belongfeast: withWindfallCap(belongfeast, 'belongfeast+windfallcapb', 'belongfeast + cap-alone windfall feast (WINDFALLCAP_B)'),
};
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = POLICIES[POLICY_ID] || POLICIES.leadfeast;
const SIDE = process.env.SIDE || 'control';
const SEEDS = (process.env.SEEDS || '5601,5602,5603,5604,5605,5606,5607,5608')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || ('/tmp/sim-windfallcap-b/sweep-' + SIDE + '-' + POLICY_ID + '.json');

function pantryKcal(Game) {
  try { return (((Game.state || {}).village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; }
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'windfallcap-b-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const W = { deaths: [], deathSeen: new Set(), dutyPreserved: 0, laundered: 0, starveDays: 0,
              windfallFeasts: 0, windfallKcal: 0, windfallDoomed: 0 };

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
  // on (who, day, cause). ---
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
    W.windfallFeasts = (capturedCtx && capturedCtx._wfFeasts) || 0;
    W.windfallKcal = (capturedCtx && capturedCtx._wfKcal) || 0;
    W.windfallDoomed = (capturedCtx && capturedCtx._wfDoomed) || 0;
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
    windfallFeasts: W.windfallFeasts, windfallKcal: Math.round(W.windfallKcal),
    windfallDoomed: Math.round(W.windfallDoomed),
    deaths: W.deaths, ms,
  };
  return { seed, end };
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const { seed: s, end } = await oneRun(seed, DAYS);
    rows.push({ seed: s, end });
    console.log(`done seed=${s} days=${end.days} end=${end.endReason} rank=${end.rank} wave=${end.maxWave} rot=${Math.round(end.rotFresh / 1000)}k/${Math.round(end.rotPreserved / 1000)}k duty=${Math.round(end.dutyPreserved / 1000)}k starveD=${end.starveDays} launder=${end.laundered} won=${end.won} exiled=${end.exiled} wf=${end.windfallFeasts} (${end.ms}ms)`);
  }
  fs.mkdirSync(require('path').dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ meta: { side: SIDE, policy: POLICY_ID, days: DAYS, seeds: SEEDS, env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', WINDFALLCAP_B: SIDE === 'armed' ? '1' : 'unset' } }, rows }, null, 1));
  console.log('wrote ' + OUT);
})();
