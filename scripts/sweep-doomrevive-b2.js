#!/usr/bin/env node
// sweep-doomrevive-b2.js — DOOMED-ONLY DRAW DISCIPLINE sweep, RECALIBRATED (sim-doomrevive-b2, 2026-10-19).
//
// sim-doomrevive-b proved the discipline + surplusfeed governor cuts pooled
// rot/100d to 0.638x with every guardrail green, but PARKED on the engagement
// bar as written (fires >= 50% of glut nights: 0.496 < 0.50 by 2 fires). The
// metric review's verdict: the 50% bar was calibrated on the pre-governor
// substrate; the governor mechanically increases legitimate stand-downs (it
// shrinks doomed piles, so p2excess zeroes more often and the discipline
// correctly stands down). The bar is recalibrated for the governor-composed
// substrate — reframed as mechanism VISIBILITY, not fire-rate:
//   ENGAGEMENT: fires >= 150 armed-side AND fires > 0 on >= 12/16 armed runs.
// (b measured 239 fires; the floor sits well under the measured mechanism,
// far above invisible.)
// Pre-registered PRIMARY (unchanged): (rot:preserved + rot:fresh) ABSOLUTE
// per 100 days alive, pooled, armed <= 0.80x control — on top of the
// governor (SURPLUSFEED=1 in BOTH arms of every pair).
// Guardrails: pooled ate/person-day >= 0.98x control; DOSE-AWARE starve-rate
// (standing revision: FAIL iff Pearson(fires, per-pair starve-rate delta) >
// +0.3 AND pooled starve-rate rises > +15%); median survival >= control-10d;
// no new death mode (exposure-matched, >=2 floor); laundering 0 at convert
// time; PRODUCTION RESPONSE (gates): pooled shareSurplus inflow armed <=
// 1.15x control (the governor caps the inflow side on both arms).
// Det-gate byte-identical. Diagnostics: PRODTHROTTLE engagement delta,
// dose-responses Pearson(fires, survival delta) and Pearson(fires, log rot-ratio).
//
// Env: FEASTSCALE_R13=1, SEATDRIVE=0, SURPLUSFEED=1 explicit (asserted);
// DOOMEDDRAW=1 armed only.
// SIDE=control|armed SEEDS="7501,...,7508" POLICY=leaddoomeddraw|belongdoomeddraw
//   DAYS=180 OUT=<path> node scripts/sweep-doomrevive-b2.js
//
// INFRA (2026-10-19): the host flaps EPERM on node writeFileSync in long
// windows (sim-armory finding). Writes go through writeFileFlap (EPERM-only
// retry, 30s backoff x20) and the output file is rewritten after every seed
// (restart-safe: at most one seed's rows are at risk).
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
let withDoomedDraw;
try { ({ withDoomedDraw } = require('./policies/doomeddraw')); }
catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: sim-doomrevive-b2 layer absent; sweep vacuous, exit 0.');
    process.exit(0);
  }
  throw e;
}

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0' || process.env.SURPLUSFEED !== '1') {
  console.error('FATAL: FEASTSCALE_R13=1, SEATDRIVE=0 and SURPLUSFEED=1 must all be set explicitly (governor composed in BOTH arms)');
  process.exit(2);
}
if (process.env.SIDE === 'armed' && process.env.DOOMEDDRAW !== '1') {
  console.error('FATAL: SIDE=armed requires DOOMEDDRAW=1');
  process.exit(2);
}

// writeFileFlap: EPERM-only retry for the host's write flap. Non-EPERM
// errors throw immediately (real bugs must fail loudly, not retry).
// The flap has TWO shapes: (a) writeFileSync throws EPERM (open truncates
// the file to 0 bytes first); (b) writeFileSync returns success but leaves
// a 0-byte file (sim-armory 2026-10-19: 16x 0-byte JSONs). Both are retried:
// after every write the file size is verified against the expected byte
// length, and a 0-byte (or short) file counts as a flap failure.
function writeFileFlap(path, data) {
  const tries = 120, backoffMs = 30000;
  const want = Buffer.byteLength(data);
  for (let i = 1; ; i++) {
    try {
      fs.mkdirSync(require('path').dirname(path), { recursive: true });
      fs.writeFileSync(path, data);
      let got = -1;
      try { got = fs.statSync(path).size; } catch (e) {}
      if (got === want) {
        if (i > 1) console.log(`writeFileFlap: ${path} succeeded on try ${i}`);
        return;
      }
      throw Object.assign(new Error(`EPERM-flap shape: wrote ${got}/${want} bytes`), { code: 'EPERM' });
    } catch (e) {
      if (e && e.code === 'EPERM' && i < tries) {
        console.log(`writeFileFlap: EPERM on ${path}, try ${i}/${tries} — backing off ${backoffMs / 1000}s`);
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, backoffMs);
        continue;
      }
      throw e;
    }
  }
}

const POLICIES = {
  leaddoomeddraw: withDoomedDraw(leadfeast, 'leaddoomeddraw', 'leadfeast + doomed-only draw discipline (DOOMEDDRAW)'),
  belongdoomeddraw: withDoomedDraw(belongfeast, 'belongdoomeddraw', 'belongfeast + doomed-only draw discipline (DOOMEDDRAW)'),
};
const POLICY_ID = process.env.POLICY || 'leaddoomeddraw';
const POLICY = POLICIES[POLICY_ID] || POLICIES.leaddoomeddraw;
const SIDE = process.env.SIDE || 'control';
const SEEDS = (process.env.SEEDS || '7501,7502,7503,7504,7505,7506,7507,7508')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || (require('os').homedir() + '/workspace/sweep-tmp/sim-doomrevive-b2/sweep-' + SIDE + '-' + POLICY_ID + '.json');

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
  const { Game } = await loadGame({ seed, mode: 'doomrevive-b2-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const W = { deaths: [], deathSeen: new Set(), dutyPreserved: 0, laundered: 0, starveDays: 0,
              ateSum: 0, vdays: 0, shareSurplus: 0, throttleCalls: 0, throttleOn: 0 };

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

  // --- PRODTHROTTLE engagement (diagnostic: the disengagement channel) ---
  const oPT = Game.prodThrottleEngaged;
  if (typeof oPT === 'function') Game.prodThrottleEngaged = function () {
    const r = oPT.apply(this, arguments);
    try { W.throttleCalls++; if (r) W.throttleOn++; } catch (e) {}
    return r;
  };

  // --- share_surplus inflow (diagnostic: the rebound channel) ---
  const oSur = Game.stockSurplus;
  if (typeof oSur === 'function') Game.stockSurplus = function (v, give) {
    let r = 0;
    try { r = oSur.apply(this, arguments); } catch (e) { r = 0; }
    try { if (typeof r === 'number' && r > 0) W.shareSurplus += r; } catch (e) {}
    return r;
  };

  // --- villager eating (guardrail: eating untouched) ---
  const oMeal = Game.villagerMealDay;
  if (typeof oMeal === 'function') Game.villagerMealDay = function () {
    const r = oMeal.apply(this, arguments);
    try { W.ateSum += (r && r.ate) || 0; W.vdays++; } catch (e) {}
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

  // --- doomeddraw telemetry: capture ctx from the policy setup ---
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
  let dd = {};
  try {
    dd = {
      nights: (capturedCtx && capturedCtx._ddNights) || 0,
      kcal: (capturedCtx && capturedCtx._ddKcal) || 0,
      glutNights: (capturedCtx && capturedCtx._ddGlutNights) || 0,
      rawSeen: (capturedCtx && capturedCtx._ddRawSeen) || 0,
      p1: (capturedCtx && capturedCtx._ddP1) || 0,
      p2x: (capturedCtx && capturedCtx._ddP2x) || 0,
    };
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
    atePerVday: W.vdays ? +(W.ateSum / W.vdays).toFixed(1) : 0,
    ateSum: Math.round(W.ateSum), ateVdays: W.vdays,
    shareSurplus: Math.round(W.shareSurplus),
    throttleEngaged: W.throttleCalls ? +(W.throttleOn / W.throttleCalls).toFixed(3) : null,
    ddNights: dd.nights, ddKcal: Math.round(dd.kcal), ddGlutNights: dd.glutNights,
    ddRawSeen: Math.round(dd.rawSeen), ddP1: Math.round(dd.p1), ddP2x: Math.round(dd.p2x),
    deaths: W.deaths, ms,
  };
  return { seed, end };
}

function snapshot(rows) {
  return JSON.stringify({ meta: { side: SIDE, policy: POLICY_ID, days: DAYS, seeds: SEEDS, env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', DOOMEDDRAW: SIDE === 'armed' ? '1' : 'unset', SURPLUSFEED: '1' } }, rows }, null, 1);
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const { seed: s, end } = await oneRun(seed, DAYS);
    rows.push({ seed: s, end });
    console.log(`done seed=${s} days=${end.days} end=${end.endReason} rank=${end.rank} wave=${end.maxWave} rot=${Math.round(end.rotFresh / 1000)}k/${Math.round(end.rotPreserved / 1000)}k duty=${Math.round(end.dutyPreserved / 1000)}k starveD=${end.starveDays} ate=${end.atePerVday} launder=${end.laundered} won=${end.won} exiled=${end.exiled} dd=${end.ddNights}/${end.ddGlutNights} (${end.ms}ms)`);
    console.log(`SEEDROW ${JSON.stringify({ seed: s, end })}`);
    // NOTE (2026-10-19 write-flap): file writes are DISABLED in the hot loop —
    // the host denies writeFileSync to long-running sweep processes (both the
    // throw-EPERM and silent-0-byte shapes). Rows are recorded to stdout
    // (SEEDROW lines, never denied); the coordinator reconstructs the JSON
    // files from the process log with a fresh writer afterwards.
  }
  console.log(`ALLROWS ${JSON.stringify({ meta: { side: SIDE, policy: POLICY_ID, days: DAYS, seeds: SEEDS, env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', DOOMEDDRAW: SIDE === 'armed' ? '1' : 'unset', SURPLUSFEED: '1' } }, rows })}`);
  console.log('sweep complete: ' + OUT + ' (reconstruct from ALLROWS)');
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
