#!/usr/bin/env node
// scripts/det-gate-plentycap-20261015.js — determinism gate for the
// sim-plentycap pilot. Runs the full pilot suite (leadfeast/belongfeast x
// 8 seeds, 180d death-aware, FEASTSCALE_R13=1) TWICE in-process per variant
// (control / faced-only / cap-only — the env gate switches variants, no
// file swaps) and requires bit-identical trajectories
// ({day,total,capped,wave,defer4,defer5} per day + final days/endReason).
// Exit 1 on any divergence.
'use strict';
process.env.FEASTSCALE_R13 = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { belongfeast, leadfeast } = require('./policies/feastscale');

const SEEDS = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
const DAYS = 180;
const POLICY_REGISTRY = { leadfeast, belongfeast };
const VARIANTS = ['control', 'faced-only', 'cap-only'];

async function trajectoryHash(pid, seed, variant) {
  process.env.STANDING_VARIANT = (variant === 'control') ? 'both' : variant;
  const base = POLICY_REGISTRY[pid];
  const { Game } = await loadGame({ seed, mode: `detgate-plentycap-${variant}-${pid}` });
  await quietLog(async () => { await setupGame(Game); });
  const policy = Object.assign({}, base);
  const orig = base.daily;
  const rows = [];
  policy.daily = (G, ctx) => {
    try {
      rows.push([
        (G.state.scholar || {}).day || 0,
        (typeof G.villageStandingTotal === 'function') ? G.villageStandingTotal() : -1,
        (typeof G.standingPlentyCappedTotal === 'function') ? G.standingPlentyCappedTotal() : -1,
        (typeof G.unlockedWave === 'function') ? (G.unlockedWave() | 0) : -1,
        (typeof G.standingDeferral === 'function') && G.standingDeferral(4).deferred ? 1 : 0,
        (typeof G.standingDeferral === 'function') && G.standingDeferral(5).deferred ? 1 : 0,
        (typeof G._standingVariant === 'function') ? G._standingVariant() : '?',
      ]);
    } catch (e) {}
    if (orig) { try { return orig(G, ctx); } catch (e) {} }
  };
  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 10 }); });
  return JSON.stringify({ rows, days: result.days, endReason: result.endReason });
}

(async () => {
  // Kill-protocol INFO-SKIP: the arm was killed and standing.js reverted
  // byte-clean — the env-gated variants cannot exist. Skip, don't crash
  // (never MODULE_NOT_FOUND).
  const probe = await loadGame({ seed: 1, mode: 'plentycap-detgate-probe' });
  if (typeof probe.Game._standingVariant !== 'function') {
    console.log('INFO-SKIP: plentycap layer deleted per kill protocol (no env reader in standing.js); see evidence/2026-10-15/sim-plentycap.md');
    process.exit(0);
  }
  const fails = [];
  for (const variant of VARIANTS) {
    for (const pid of Object.keys(POLICY_REGISTRY)) {
      for (const seed of SEEDS) {
        const h1 = await trajectoryHash(pid, seed, variant);
        const h2 = await trajectoryHash(pid, seed, variant);
        const ok = h1 === h2;
        console.log(`  ${ok ? 'PASS' : 'FAIL'} ${variant}/${pid}/s${seed} ${ok ? 'identical' : 'DIVERGED'}`);
        if (!ok) fails.push(`${variant}/${pid}/s${seed}`);
      }
    }
  }
  delete process.env.STANDING_VARIANT;
  const totalRuns = VARIANTS.length * Object.keys(POLICY_REGISTRY).length * SEEDS.length;
  console.log(fails.length ? `\nDET-GATE STOP (plentycap): ${fails.join(', ')}` : `\nDET-GATE GREEN (plentycap): ${totalRuns}/${totalRuns} identical`);
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
