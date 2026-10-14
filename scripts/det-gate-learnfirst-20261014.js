#!/usr/bin/env node
// scripts/det-gate-learnfirst-20261014.js — determinism gate for the
// LEARN-FIRST arm (run BEFORE trusting any before/after comparison).
//
// Policy stack: LEARNFIRST=1 on the learnfirst wrapper (leadfeast +
// learn-first engagement judgment). 8 pilot seeds x 180d death-aware,
// each run twice in-process; all pairs must be bit-identical (16/16).
//
// KNOWN RISK (det-gate.js, entropy-hunt r26 2026-10-14): timestamp-based
// villager IDs can leak into contest RNG on fight-heavy seeds (leadfeast
// s44). A FAIL here is reported seed-by-seed — the sweep then treats that
// seed's comparison as provisional (see evidence metric-review).
//
// Usage:
//   node scripts/det-gate-learnfirst-20261014.js
// Exits 0 when all seeds run bit-identically twice; exits 1 otherwise.
'use strict';
process.env.LEARNFIRST = '1';
const { learnfirst } = require('./policies/learnfirst');
const { checkDeterminism } = require('./det-gate');

(async () => {
  console.log('policy under test: id=' + learnfirst.id + ' desc=' + learnfirst.desc);
  if (learnfirst.id !== 'learnfirst') {
    console.error('SMOKE FAIL: expected policy id learnfirst (LEARNFIRST=1 gate on), got ' + learnfirst.id);
    process.exit(1);
  }
  const seeds = [11, 22, 33, 44, 55, 66, 77, 88];
  let bad = 0;
  for (const seed of seeds) {
    const gate = await checkDeterminism(seed, learnfirst, { days: 180 });
    console.log((gate.identical ? 'PASS ' : 'FAIL ') + gate.summary);
    if (!gate.identical) bad++;
  }
  if (bad) {
    console.error(`DETERMINISM GATE FAILED on ${bad}/${seeds.length} seeds — before/after comparisons NOT trustworthy on those seeds.`);
    process.exit(1);
  }
  console.log('det-gate GREEN: 8/8 seeds bit-identical across runs (16/16). Before/after comparisons trustworthy.');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
