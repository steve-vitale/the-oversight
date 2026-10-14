#!/usr/bin/env node
// scripts/det-gate-proposelayer-20261014.js — determinism gate for the
// proposelayer arm (run BEFORE trusting any before/after comparison).
//
// Baseline: competent (pinned, gates OFF). Armed: PROPOSELAYER=1 on top —
// the gate runs on the ARMED stack (the layer under test). Identical-seed
// run pairs must be bit-identical, or before/after comparisons are noise.
//
// Usage:
//   node scripts/det-gate-proposelayer-20261014.js
// Exits 0 when all seeds run bit-identically twice; exits 1 otherwise.
'use strict';
process.env.PROPOSELAYER = '1';
const { proposelayer } = require('./policies/proposelayer');
const { checkDeterminism } = require('./det-gate');

(async () => {
  console.log('policy under test: id=' + proposelayer.id + ' desc=' + proposelayer.desc);
  if (proposelayer.id !== 'proposelayer') {
    console.error('SMOKE FAIL: expected policy id proposelayer (PROPOSELAYER=1 gate on), got ' + proposelayer.id);
    process.exit(1);
  }
  const seeds = [11, 22, 33, 44, 55, 66, 77, 88];
  let bad = 0;
  for (const seed of seeds) {
    const gate = await checkDeterminism(seed, proposelayer, { days: 150 });
    console.log((gate.identical ? 'PASS ' : 'FAIL ') + gate.summary);
    if (!gate.identical) bad++;
  }
  if (bad) {
    console.error(`DETERMINISM GATE FAILED on ${bad}/${seeds.length} seeds — before/after comparisons NOT trustworthy.`);
    process.exit(1);
  }
  console.log('det-gate GREEN: all seeds bit-identical across runs. Before/after comparisons trustworthy.');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
