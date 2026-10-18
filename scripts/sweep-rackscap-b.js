#!/usr/bin/env node
// sweep-rackscap-b.js — SMOKE-RACKS CAPACITY measurement sweep (sim-rackscap-b, 2026-10-18).
//
// The game-code arm: RACKSCAP_B=1 doubles the duty-time cook drive's rackCap
// (125 -> 250 multiplier, game.js) so doomed fresh can move into
// smoked-and-eaten stock instead of rotting at the racks-full beat.
//
// Pre-registered PRIMARY (binding, §14): (rot:fresh + rot:preserved) ABSOLUTE
// per 100 days alive — armed <= 0.85x control. (Share is confounded with
// survival length per finding #534's metric review.)
// ENGAGEMENT (kill-fast): extra preserved kcal produced armed vs control
// >= 100k across the armed side (duty-time cook drive throughput delta).
// GUARDRAILS: rot:preserved ABSOLUTE armed <= control (the cap must not create
// preserved rot); median survival >= control-10d; per-pair starvation <= +2;
// laundering 0 measured AT CONVERT TIME; no new death mode.
//
// Env: FEASTSCALE_R13=1, SEATDRIVE=0 explicit (asserted); RACKSCAP_B=1 armed,
// unset control.
// SIDE=control|armed SEEDS="5111,...,5118" POLICY=leadfeast|belongfeast
//   DAYS=180 OUT=<path> node scripts/sweep-rackscap-b.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
const SIDE = process.env.SIDE || 'control';
if (SIDE === 'armed' && process.env.RACKSCAP_B !== '1') {
  console.error('FATAL: SIDE=armed requires RACKSCAP_B=1');
  process.exit(2);
}
if (SIDE === 'control' && process.env.RACKSCAP_B === '1') {
  console.error('FATAL: SIDE=control requires RACKSCAP_B unset');
  process.exit(2);
}

const POLICIES = { leadfeast, belongfeast };
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = POLICIES[POLICY_ID] || POLICIES.leadfeast;
const SEEDS = (process.env.SEEDS || '5111,5112,5113,5114,5115,5116,5117,5118')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || ('/home/hatch/workspace/sim-rackscap-b/sweep-' + SIDE + '-' + POLICY_ID + '.json');

function pantryKcal(Game) {
  try { return (((Game.state || {}).village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; }
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'rackscap-b-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const W = { deaths: [], deathSeen: new Set(), dutyPreserved: 0, laundered: 0, starveDays: 0,
              racksFullBeats: 0, racksWorkedBeats: 0, racksSamples: [] };

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

  // --- duty-time cook drive throughput + at-convert-time laundering ---
  // (lesson #101: laundering is measured when the convert happens, not later)
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

  // --- duty narration: racks-full vs racks-worked beats (sense-testing) ---
  const oSay = Game.say;
  Game.say = function (s) {
    try {
      const t = String(s || '');
      if (/racks are already full/.test(t)) {
        W.racksFullBeats++;
        if (W.racksSamples.length < 30) W.racksSamples.push({ kind: 'racks-full', line: t.slice(0, 220) });
      } else if (/worked the smoke racks/.test(t)) {
        W.racksWorkedBeats++;
        if (W.racksSamples.length < 30) W.racksSamples.push({ kind: 'racks-worked', line: t.slice(0, 220) });
      }
    } catch (e) {}
    return oSay.apply(this, arguments);
  };

  // --- deaths: kind-aware (findings #517/#525/#530): filter to
  // person/villager only, dedup on (who, day, cause). ---
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
    return oDie.apply(this, arguments);
  };

  // --- starvation pressure: hungry (>70) villagers per day ---
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
    racksFullBeats: W.racksFullBeats, racksWorkedBeats: W.racksWorkedBeats,
    racksSamples: W.racksSamples,
    deaths: W.deaths, ms,
  };
  return { seed, end };
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const { seed: s, end } = await oneRun(seed, DAYS);
    rows.push({ seed: s, end });
    console.log(`done seed=${s} days=${end.days} end=${end.endReason} rank=${end.rank} wave=${end.maxWave} rot=${Math.round(end.rotFresh / 1000)}k/${Math.round(end.rotPreserved / 1000)}k duty=${Math.round(end.dutyPreserved / 1000)}k racksFull=${end.racksFullBeats} racksWorked=${end.racksWorkedBeats} starveD=${end.starveDays} launder=${end.laundered} won=${end.won} (${end.ms}ms)`);
  }
  fs.mkdirSync(require('path').dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ meta: { side: SIDE, policy: POLICY_ID, days: DAYS, seeds: SEEDS, arm: 'RACKSCAP_B', env: { FEASTSCALE_R13: '1', SEATDRIVE: '0' } }, rows }, null, 1));
  console.log('wrote ' + OUT);
})().catch(e => { console.error('SWEEP ERROR', e); process.exit(2); });
