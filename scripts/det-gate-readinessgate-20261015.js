#!/usr/bin/env node
// scripts/det-gate-readinessgate-20261015.js — determinism gate for the
// readiness-gate pilot. Runs the full pilot suite (leadfeast/belongfeast x
// 8 seeds, 180d death-aware, FEASTSCALE_R13=1) TWICE in-process on the
// CURRENT standing.js and requires bit-identical trajectories
// ({day,total,wave,defer4} per day + final days/endReason). Exit 1 on any
// divergence. Run once per side (SIDE=control|armed); the sweep's ALL=1
// mode owns the file swap — this script never swaps.
'use strict';
process.env.FEASTSCALE_R13 = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { belongfeast, leadfeast } = require('./policies/feastscale');

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = 180;
const POLICY_REGISTRY = { leadfeast, belongfeast };
const SIDE = process.env.SIDE || 'armed';

async function trajectoryHash(pid, seed) {
  const base = POLICY_REGISTRY[pid];
  const { Game } = await loadGame({ seed, mode: `detgate-${SIDE}-${pid}` });
  await quietLog(async () => { await setupGame(Game); });
  const policy = Object.assign({}, base);
  const orig = base.daily;
  const rows = [];
  policy.daily = (G, ctx) => {
    try {
      rows.push([
        (G.state.scholar || {}).day || 0,
        (typeof G.villageStandingTotal === 'function') ? G.villageStandingTotal() : -1,
        (typeof G.unlockedWave === 'function') ? (G.unlockedWave() | 0) : -1,
        (typeof G.standingDeferral === 'function') && G.standingDeferral(4).deferred ? 1 : 0,
        (typeof G.waveEngaged === 'function') ? (G.waveEngaged(3) | 0) : -1,
        (typeof G.waveEngaged === 'function') ? (G.waveEngaged(4) | 0) : -1,
        (typeof G._standingPeakWave === 'function') ? (G._standingPeakWave() | 0) : -1,
      ]);
    } catch (e) {}
    if (orig) { try { return orig(G, ctx); } catch (e) {} }
  };
  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 10 }); });
  return JSON.stringify({ rows, days: result.days, endReason: result.endReason });
}

(async () => {
  const fails = [];
  for (const pid of Object.keys(POLICY_REGISTRY)) {
    for (const seed of SEEDS) {
      const h1 = await trajectoryHash(pid, seed);
      const h2 = await trajectoryHash(pid, seed);
      const ok = h1 === h2;
      console.log(`  ${ok ? 'PASS' : 'FAIL'} ${pid}/s${seed} ${ok ? 'identical' : 'DIVERGED'} (${(h1.length / 1024).toFixed(0)}k chars)`);
      if (!ok) fails.push(pid + '/s' + seed);
    }
  }
  console.log(fails.length ? `\nDET-GATE STOP (${SIDE}): ${fails.join(', ')}` : `\nDET-GATE GREEN (${SIDE}): 16/16 identical`);
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
