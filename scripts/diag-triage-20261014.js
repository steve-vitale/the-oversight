#!/usr/bin/env node
// scripts/diag-triage-20261014.js — diagnostic for the pantry-triage arm.
// Question: WHERE does the would-rot fresh surplus actually live?
// Classifies every fresh-rot kcal at sweep time into:
//   deathTail    — no living villagers in roster (rot after the village died)
//   noCook2d     — no cook-duty resolution in the 2 days before rot
//   racksBlocked — the most recent cook resolution was a racks-full stand-down
//                  (or the racks are currently full at rot time)
//   driven       — the drive was running and still missed it (budget, reserve,
//                  window edges, post-cook arrivals)
// Also logs per-day cook-drive stats on the final day of each run (or a sample).
//
// Usage:
//   SEEDS="11,22,33,44,55,66,77,88" POLICIES="leadcourt,belongseek" DAYS=180 \
//     OUT=/tmp/triage-diag.json node scripts/diag-triage-20261014.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const POLICY_REGISTRY = {
  leadcourt: require('./policies/leadcourt').leadcourt,
  belongseek: require('./policies/belongseek').belongseek,
};
// NOTE (2026-10-14): unwrap the policy object — see measure-triage-20261014.js.

function instrument(Game) {
  const W = {
    rotDeathTail: 0, rotNoCook: 0, rotRacksBlocked: 0, rotDriven: 0,
    cookResolutions: 0, racksFullStandDowns: 0, budgetCapped: 0,
    preservedKcalDrive: 0, eligibleKcalSeen: 0,
  };
  let lastCookDay = -999;
  let lastCookRacksFull = false;

  const dayOf = () => { try { return (Game.state.scholar || {}).day || 1; } catch (e) { return 1; } };
  const rosterAlive = () => { try { return ((Game.state.village || {}).roster || []).length; } catch (e) { return 0; } };

  // Track cook resolutions and the drive's inputs/outputs from pantry state.
  const oResolve = Game.resolveOneAssignment;
  if (typeof oResolve === 'function') Game.resolveOneAssignment = function (vid, a) {
    const r = oResolve.apply(this, arguments);
    try {
      if (a && a.task === 'cook') {
        W.cookResolutions++;
        lastCookDay = dayOf();
        lastCookRacksFull = false;
      }
    } catch (e) {}
    return r;
  };
  // Detect the racks-full stand-down via its honest narration line.
  const oSay = Game.say;
  if (typeof oSay === 'function') Game.say = function (msg) {
    try {
      if (typeof msg === 'string' && msg.indexOf('The racks are already full') >= 0) {
        W.racksFullStandDowns++;
        lastCookRacksFull = true;
      }
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
  // Catch drive throughput by watching pantry preserved kcal around each cook resolution.
  const preservedKcalNow = () => {
    let k = 0;
    try {
      for (const it of ((Game.state.village || {}).pantry || [])) {
        if (it && (it.foodState === 'preserved' || it.foodState === 'rendered'))
          k += (it.kcalEach || 0) * (it.units || 1);
      }
    } catch (e) {}
    return k;
  };
  // Approximate the drive's racks-cap (skill 0 → ownShelf 15) for classification.
  const racksFullApprox = () => {
    try {
      const v = Game.state.village || {};
      const roster = (v.roster || []).length || 10;
      const cap = 125 * roster * 13; // ownShelf 15 → max(1, 15-2)
      return preservedKcalNow() >= cap;
    } catch (e) { return false; }
  };

  const rotCounted = new Set();
  const oSweep = Game.sweepSpoiled;
  if (typeof oSweep === 'function') Game.sweepSpoiled = function () {
    try {
      const day = dayOf();
      const alive = rosterAlive();
      for (const it of (((Game.state.village || {}).pantry) || [])) {
        if (it && !it.bonded && !rotCounted.has(it) && Game.isSpoiled && Game.isSpoiled(it)) {
          rotCounted.add(it);
          const k = (it.kcalEach || 0) * (it.units || 1);
          const isPreserved = it.foodState === 'preserved' || it.foodState === 'rendered' || (it.foodKind || '') === 'pemmican';
          if (!isPreserved && k > 0) {
            if (alive === 0) W.rotDeathTail += k;
            else if (day - lastCookDay >= 2) W.rotNoCook += k;
            else if (lastCookRacksFull || racksFullApprox()) W.rotRacksBlocked += k;
            else W.rotDriven += k;
          }
        }
      }
    } catch (e) {}
    return oSweep.apply(this, arguments);
  };
  return W;
}

async function oneRun(seed, pid, days) {
  const base = POLICY_REGISTRY[pid];
  const { Game } = await loadGame({ seed, mode: 'triage-diag-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const W = instrument(Game);
  const policy = Object.assign({}, base);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 }); });
  let hungry = 0;
  try { hungry = (Game.state.village || {}).hungryDays || 0; } catch (e) {}
  return {
    policy: pid, seed, days: result.days, endReason: result.endReason,
    waveReach: result.maxWaveUnlocked || 1,
    deathTail: Math.round(W.rotDeathTail), noCook: Math.round(W.rotNoCook),
    racksBlocked: Math.round(W.rotRacksBlocked), driven: Math.round(W.rotDriven),
    cookResolutions: W.cookResolutions, standDowns: W.racksFullStandDowns,
    hungryDays: hungry,
  };
}

async function main() {
  const seeds = (process.env.SEEDS || '11').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const pids = (process.env.POLICIES || 'leadcourt').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const outFile = process.env.OUT || null;
  const rows = [];
  for (const pid of pids) for (const seed of seeds) {
    const r = await oneRun(seed, pid, days);
    rows.push(r);
    const tot = r.deathTail + r.noCook + r.racksBlocked + r.driven;
    console.log(`  [${pid} s${seed}] days=${r.days} end=${r.endReason} wave=${r.waveReach} rot=${(tot / 1000).toFixed(0)}k (death:${(r.deathTail / 1000).toFixed(0)}k noCook:${(r.noCook / 1000).toFixed(0)}k racks:${(r.racksBlocked / 1000).toFixed(0)}k driven:${(r.driven / 1000).toFixed(0)}k) cooks=${r.cookResolutions} standdowns=${r.standDowns}`);
  }
  const sum = k => rows.reduce((t, r) => t + r[k], 0);
  const tot = sum('deathTail') + sum('noCook') + sum('racksBlocked') + sum('driven');
  console.log(`\nTOTAL rot=${(tot / 1000).toFixed(1)}k  deathTail=${(sum('deathTail') / 1000).toFixed(1)}k  noCook2d=${(sum('noCook') / 1000).toFixed(1)}k  racksBlocked=${(sum('racksBlocked') / 1000).toFixed(1)}k  driven-miss=${(sum('driven') / 1000).toFixed(1)}k`);
  console.log(`cookResolutions=${sum('cookResolutions')} racksFullStandDowns=${sum('standDowns')}`);
  if (outFile) require('fs').writeFileSync(outFile, JSON.stringify(rows, null, 1));
}

main().catch(e => { console.error('DIAG FAIL:', e && e.message); process.exit(1); });
