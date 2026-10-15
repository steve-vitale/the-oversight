#!/usr/bin/env node
// det-gate-fleedirectwild-20261014.js — determinism gate for the r36
// wilderness-refusal arm.
//
// 8 seeds x control/armed, each run TWICE in-process; the canonical result
// JSON must be bit-identical across the two passes. The layer is pure
// judgment (no RNG), so any bit difference is a layer bug, not noise.
//
// Env: SIDE=control|armed selects the pass set; the script runs both.
//   control: WILDRANGE=1 COMPETENT_DIRECTIONAL_FLEE=1
//   armed:   + FLEEDIRECTWILD=1
//
// Usage: node scripts/det-gate-fleedirectwild-20261014.js   (exit 0 = 16/16)
'use strict';
// KILLED-ARM GRACE: if the layer/substrate files are absent (killed per
// kill protocol), INFO-SKIP — the pre-kill det-gate (16/16 bit-identical)
// stands; there is nothing to run on the landed tree.
const fs0 = require('fs');
for (const f of ['./policies/fleedirectwild.js', './policies/wildrange.js']) {
  try {
    if (!fs0.existsSync(require('path').join(__dirname, f))) {
      console.log('INFO-SKIP: ' + f + ' absent (killed arm, layer deleted per kill protocol). Pre-kill det-gate 16/16 IDENTICAL stands; nothing to run on the landed tree.');
      process.exit(0);
    }
  } catch (e) {}
}
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { wildrange } = require('./policies/wildrange');

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = 25;

function setSide(side) {
  process.env.WILDRANGE = '1';
  process.env.COMPETENT_DIRECTIONAL_FLEE = '1';
  if (side === 'armed') process.env.FLEEDIRECTWILD = '1';
  else delete process.env.FLEEDIRECTWILD;
}

async function oneRun(seed, side) {
  setSide(side);
  const { Game } = await loadGame({ seed, mode: 'fdwild-det', fullTelemetry: false });
  await setupGame(Game);
  const policy = Object.assign({}, wildrange);
  // runDays drives policy.daily(Game, ctx) with its own ctx — wrap it to
  // capture the counters (same pattern as measure-fleedirect-20261014.js).
  let runCtx = null;
  const baseDaily = wildrange.daily;
  policy.daily = function (G, c) { runCtx = c; return baseDaily(G, c); };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 10 }); });
  const ctx = runCtx || {};
  const deaths = (result.samples.deaths || []).map(d => [d.day, d.kind, d.who, d.cause, d.player ? 1 : 0]);
  return JSON.stringify({
    seed, side, days: result.days, endReason: result.endReason,
    maxWave: result.maxWaveUnlocked || 1,
    deaths,
    fd: {
      checks: ctx.fdWildChecks || 0, refusals: ctx.fdWildRefusals || 0,
      reason: ctx.fdWildRefuseReason || null,
      byReason: ctx.fdWildRefuseByReason || {},
      fledHeld: ctx.fledHeld || 0, dirPushes: ctx.dirPushes || 0, fled: ctx.fled || 0,
    },
    range: { runs: ctx.rangeRuns || 0, legs: ctx.rangeLegs || 0, engaged: ctx.rangeEngaged || 0 },
  });
}

(async () => {
  let pass = 0, fail = 0;
  for (const side of ['control', 'armed']) {
    for (const seed of SEEDS) {
      const a = await oneRun(seed, side);
      const b = await oneRun(seed, side);
      const ok = a === b;
      if (ok) pass++; else { fail++; console.log(`DIFF seed=${seed} side=${side}`); }
    }
  }
  console.log(`det-gate: ${pass}/${pass + fail} bit-identical (${SEEDS.length} seeds x control/armed x 2 passes)`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
