#!/usr/bin/env node
// scripts/det-gate-candwindow-20261014.js — determinism gate for the
// candwindow arm (run BEFORE trusting any before/after comparison).
//
// Baseline stack for this arm: FOURTHLINK=1 + FIFTHLINK=1 (the subaid
// stack). Armed adds CANDWINDOW=1 on top. The gate runs on the ARMED stack
// (the layer under test) — identical-seed run pairs must be bit-identical.
//
// Usage:
//   node scripts/det-gate-candwindow-20261014.js
// Exits 0 when all seeds run bit-identically twice; exits 1 otherwise.
'use strict';
process.env.FOURTHLINK = '1';
process.env.FIFTHLINK = '1';
process.env.CANDWINDOW = '1';
const { candwindow } = require('./policies/candwindow');
const { checkDeterminism } = require('./det-gate');

(async () => {
  console.log('policy under test: id=' + candwindow.id + ' desc=' + candwindow.desc);
  if (candwindow.id !== 'candwindow') {
    console.error('SMOKE FAIL: expected policy id candwindow (CANDWINDOW=1 gate on), got ' + candwindow.id);
    process.exit(1);
  }
  const seeds = [11, 22, 33, 44, 55, 66, 77, 88];
  let bad = 0;
  for (const seed of seeds) {
    const gate = await checkDeterminism(seed, candwindow, { days: 180 });
    console.log((gate.identical ? 'PASS ' : 'FAIL ') + gate.summary);
    if (!gate.identical) bad++;
  }
  if (bad) {
    console.error(`DETERMINISM GATE FAILED on ${bad}/${seeds.length} seeds — before/after comparisons NOT trustworthy.`);
    process.exit(1);
  }
  console.log('det-gate GREEN: all seeds bit-identical across runs. Before/after comparisons trustworthy.');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
