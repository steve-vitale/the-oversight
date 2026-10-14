#!/usr/bin/env node
// scripts/det-gate-sixthlink-r27-20261014.js — determinism gate for the
// sixthlink-r27 arm (run BEFORE trusting any before/after comparison).
//
// Baseline policy for this arm's comparisons: FOURTHLINK=1 + FIFTHLINK=1
// (the current tip stack — uncapped courtship + tend-first layer). Armed
// adds SIXTHLINK=1 on top.
//
// Usage:
//   node scripts/det-gate-sixthlink-r27-20261014.js
// Exits 0 when all seeds run bit-identically twice; exits 1 otherwise.
'use strict';
process.env.FOURTHLINK = '1';
process.env.FIFTHLINK = '1';
const { fifthlink } = require('./policies/fifthlink-r26');
const { checkDeterminism } = require('./det-gate');

(async () => {
  console.log('policy under test: id=' + fifthlink.id + ' desc=' + fifthlink.desc);
  if (fifthlink.id !== 'fifthlink-r26') {
    console.error('SMOKE FAIL: expected policy id fifthlink-r26 (FIFTHLINK=1 gate on), got ' + fifthlink.id);
    process.exit(1);
  }
  const seeds = [11, 22, 33, 44, 55, 66, 77, 88];
  let bad = 0;
  for (const seed of seeds) {
    const gate = await checkDeterminism(seed, fifthlink, { days: 180 });
    console.log((gate.identical ? 'PASS ' : 'FAIL ') + gate.summary);
    if (!gate.identical) bad++;
  }
  if (bad) {
    console.error(`DETERMINISM GATE FAILED on ${bad}/${seeds.length} seeds — before/after comparisons NOT trustworthy.`);
    process.exit(1);
  }
  console.log('det-gate GREEN: all seeds bit-identical across runs. Before/after comparisons trustworthy.');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
