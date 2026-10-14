'use strict';
// test-determinism-gate-20261014.js — proof test for the determinism gate.
//
// RED PHASE (current master): the gate FAILS on leadfeast s44 — the two
// in-process runs diverge, proving the gate detects the timestamp-ID
// nondeterminism (contestEngine.js _cxSeed / cands.sort).
//
// EXPECTED OUTCOME ON CURRENT MASTER: this test EXITS 1 (RED), printing the
// divergence. That IS the proof — the gate works, the code is nondeterministic.
// WHEN THE GAME-CODE FIX LANDS (deterministic IDs or ID-agnostic contest
// seeding), this test should EXIT 0 (GREEN) with no changes.
//
// Run: node scripts/test-determinism-gate-20261014.js
process.env.FEASTSCALE_R13 = '1';
const { checkDeterminism } = require('./det-gate');
const { leadfeast } = require('./policies/feastscale');

(async () => {
  console.log('=== determinism gate proof (leadfeast, seed 44, 180d) ===');
  const gate = await checkDeterminism(44, leadfeast, { days: 180, mode: 'det-gate-test' });
  console.log('gate result:', gate.summary);
  console.log('identical:', gate.identical);
  if (!gate.identical) {
    console.log('');
    console.log('RED (expected on current master): the gate correctly detected');
    console.log('in-process nondeterminism. Root cause: timestamp-based villager');
    console.log('IDs leak into contestEngine.js _cxSeed and cands.sort().');
    console.log('See evidence/2026-10-14/sim-entropy-r26.md for the diagnosis.');
    process.exit(1);
  }
  console.log('');
  console.log('GREEN: trajectories bit-identical — the game-code fix has landed.');
  process.exit(0);
})().catch(e => { console.error('GATE ERROR', e); process.exit(2); });
