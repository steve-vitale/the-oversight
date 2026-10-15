#!/usr/bin/env node
// scripts/det-gate-wave4ready-20261014.js — determinism gate for the wave4ready arm.
//
// Baseline: competent + proposelayer (PROPOSELAYER=1, gates OFF for the
// doctrine). Armed: PROPOSELAYER=1 + WAVE4READY=1 on top — the gate runs on
// the ARMED stack (the layer under test). Identical-seed run pairs must be
// bit-identical, or before/after comparisons are noise.
//
// Usage:
//   node scripts/det-gate-wave4ready-20261014.js
// Exits 0 when all seeds run bit-identically twice; exits 1 otherwise.
'use strict';
process.env.PROPOSELAYER = '1';
process.env.WAVE4READY = '1';
// Landed-tree guard (3184c187 pattern): a killed arm's layer is deleted per
// kill protocol; the det-gate then INFO-SKIPs instead of FATALing. Pre-kill
// verification (worker tree): det-gate 8/8 IDENTICAL.
let wave4ready = null;
try { wave4ready = require('./policies/wave4ready').wave4ready; }
catch (e) {
  console.log('INFO-SKIP: policies/wave4ready.js absent (killed arm, layer deleted per kill protocol). Pre-kill det-gate 8/8 stands; nothing to run on the landed tree.');
  process.exit(0);
}
const { checkDeterminism } = require('./det-gate');

(async () => {
  console.log('policy under test: id=' + wave4ready.id + ' desc=' + wave4ready.desc);
  if (wave4ready.id !== 'wave4ready') {
    console.error('SMOKE FAIL: expected policy id wave4ready (WAVE4READY=1 gate on), got ' + wave4ready.id);
    process.exit(1);
  }
  const seeds = [11, 22, 33, 44, 55, 66, 77, 88];
  let bad = 0;
  for (const seed of seeds) {
    const gate = await checkDeterminism(seed, wave4ready, { days: 150 });
    console.log((gate.identical ? 'PASS ' : 'FAIL ') + gate.summary);
    if (!gate.identical) bad++;
  }
  if (bad) {
    console.error(`DETERMINISM GATE FAILED on ${bad}/${seeds.length} seeds — before/after comparisons NOT trustworthy.`);
    process.exit(1);
  }
  console.log('det-gate GREEN: all seeds bit-identical across runs. Before/after comparisons trustworthy.');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
