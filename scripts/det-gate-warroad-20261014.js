#!/usr/bin/env node
// scripts/det-gate-warroad-20261014.js — determinism gate for the warroad arm
// (run BEFORE trusting any before/after comparison).
//
// Baseline: competent (pinned, gates OFF). Armed: WARROAD=1 on top — the
// gate runs on the ARMED stack (the layer under test). Identical-seed run
// pairs must be bit-identical, or before/after comparisons are noise.
//
// Gate-off byte-identical holds BY CONSTRUCTION: with WARROAD unset the
// module exports the competent object itself (reference-equal) — proven by
// test-warroad R2.
//
// KNOWN ISSUE (2026-10-14, entropy-hunt r26): the gate can FAIL on current
// master for fight-heavy seeds — timestamp-based villager IDs leak into
// contest resolution. A fail there is the engine's entropy, not this arm's;
// document per-seed and judge the comparison accordingly.
//
// Usage:
//   WARROAD=1 node scripts/det-gate-warroad-20261014.js
// Exits 0 when all seeds run bit-identically twice; exits 1 otherwise.
'use strict';
process.env.WARROAD = '1';
const { warroad } = require('./policies/warroad');
const { checkDeterminism } = require('./det-gate');

(async () => {
  console.log('policy under test: id=' + warroad.id + ' desc=' + warroad.desc);
  if (warroad.id !== 'warroad') {
    console.error('SMOKE FAIL: expected policy id warroad (WARROAD=1 gate on), got ' + warroad.id);
    process.exit(1);
  }
  const seeds = [11, 22, 33, 44, 55, 66, 77, 88];
  let bad = 0;
  for (const seed of seeds) {
    const gate = await checkDeterminism(seed, warroad, { days: 150 });
    console.log((gate.identical ? 'PASS ' : 'FAIL ') + gate.summary);
    if (!gate.identical) bad++;
  }
  if (bad) {
    console.error(`DETERMINISM GATE FAILED on ${bad}/${seeds.length} seeds — before/after comparisons NOT trustworthy on those seeds.`);
    process.exit(1);
  }
  console.log('det-gate GREEN: all seeds bit-identical across runs. Before/after comparisons trustworthy.');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
