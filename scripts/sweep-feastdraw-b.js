#!/usr/bin/env node
// sweep-feastdraw-b.js — FEAST-DRAW measurement sweep (sim-feastdraw-b, 2026-10-18).
//
// The rackscap named next: attack the ~125 kcal/person/day nightly DRAW, not
// the smoke capacity. Policy-side feast-draw layer (FEASTDRAW=1): on nights
// when the post-dinner doomed pile (rots at tomorrow's dawn, before any meal
// can touch it) still exceeds 200*roster, the cook serves SECONDS at the
// fire — a supplementary fresh-first draw capped at 400*roster/night, eating
// doomed kcal before they rot. No feast machinery (no feastDay, no
// hunger-30 bomb, no trust/social effects) — the windfall variants'
// meal-displacement is designed out by triggering on abundance.
//
// Pre-registered PRIMARY: (rot:preserved + rot:fresh) ABSOLUTE per 100 days
// alive — armed <= 0.85x control.
// ENGAGEMENT (kill-fast): feast-draw nights >= 8 across the armed side.
// Guardrails: median survival >= control-10d; starvation deaths <= control+2
// per-pair (collapse-aware, both >30d); no new death mode (kind-filtered,
// deduped, thirst/dehydration canonicalized); laundering 0 at convert time;
// det-gate byte-identical gate-off.
//
// Env: FEASTSCALE_R13=1, SEATDRIVE=0 explicit (asserted); FEASTDRAW=1 armed.
// SIDE=control|armed SEEDS="6201,...,6208" POLICY=leadfeastdraw|belongfeastdraw
//   DAYS=180 OUT=<path> node scripts/sweep-feastdraw-b.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { withFeastDraw } = require('./policies/feastdraw');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
if (process.env.SIDE === 'armed' && process.env.FEASTDRAW !== '1') {
  console.error('FATAL: SIDE=armed requires FEASTDRAW=1');
  process.exit(2);
}

const POLICIES = {
  leadfeastdraw: withFeastDraw(leadfeast, 'leadfeastdraw', 'leadfeast + feast-draw layer (FEASTDRAW)'),
  belongfeastdraw: withFeastDraw(belongfeast, 'belongfeastdraw', 'belongfeast + feast-draw layer (FEASTDRAW)'),
};
const POLICY_ID = process.env.POLICY || 'leadfeastdraw';
const POLICY = POLICIES[POLICY_ID] || POLICIES.leadfeastdraw;
const SIDE = process.env.SIDE || 'control';
const SEEDS = (process.env.SEEDS || '6201,6202,6203,6204,6205,6206,6207,6208')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || ('/tmp/sim-feastdraw-b/sweep-' + SIDE + '-' + POLICY_ID + '.json');

function pantryKcal(Game) {
  try { return (((Game.state || {}).village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; }
}

// cause canonicalization (findings #515/#517/#525/#544): thirst/dehydration
// are one death mode.
function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'feastdraw-b-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const W = { deaths: [], deathSeen: new Set(), dutyPreserved: 0, laundered: 0, starveDays: 0 };

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

  // --- deaths: kind-aware, dedup on (who,day,cause), filter to
  // person/villager, canonicalize thirst/dehydration ---
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
  };

  // --- feast-draw telemetry: capture ctx from the policy setup ---
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
    fdNights, fdKcal: Math.round(fdKcal), fdDoomed: Math.round(fdDoomed),
    deaths: W.deaths, ms,
  };
  return { seed, end };
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const { seed: s, end } = await oneRun(seed, DAYS);
    rows.push({ seed: s, end });
    console.log(`done seed=${s} days=${end.days} end=${end.endReason} rank=${end.rank} wave=${end.maxWave} rot=${Math.round(end.rotFresh / 1000)}k/${Math.round(end.rotPreserved / 1000)}k duty=${Math.round(end.dutyPreserved / 1000)}k starveD=${end.starveDays} launder=${end.laundered} won=${end.won} exiled=${end.exiled} fd=${end.fdNights} (${end.ms}ms)`);
  }
  fs.mkdirSync(require('path').dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ meta: { side: SIDE, policy: POLICY_ID, days: DAYS, seeds: SEEDS, env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', FEASTDRAW: SIDE === 'armed' ? '1' : 'unset' } }, rows }, null, 1));
  console.log('wrote ' + OUT);
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
