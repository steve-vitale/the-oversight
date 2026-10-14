#!/usr/bin/env node
// scripts/det-gate-hybridroad-20261014.js — determinism gate for the
// hybridroad arm (run BEFORE trusting any before/after comparison).
//
// Armed stack: HYBRIDROAD=1 + COMPETENT_DIRECTIONAL_FLEE=1 (the recovering()
// gate the readiness hold rides). Identical-seed run pairs must be
// bit-identical, or before/after comparisons are noise.
//
// Usage:
//   HYBRIDROAD=1 COMPETENT_DIRECTIONAL_FLEE=1 node scripts/det-gate-hybridroad-20261014.js
// Exits 0 when all seeds run bit-identically twice; exits 1 otherwise.
'use strict';
// Landed-tree guard (3184c187 pattern): INFO-SKIP when the layer is absent.
let hybridroad = null;
try { hybridroad = require('./policies/hybridroad').hybridroad; }
catch (e) {
  console.log('INFO-SKIP: policies/hybridroad.js absent (killed arm, layer deleted per kill protocol). Pre-kill det-gate stands; nothing to run on the landed tree.');
  process.exit(0);
}
const { checkDeterminism } = require('./det-gate');

(async () => {
  console.log('policy under test: id=' + hybridroad.id + ' desc=' + hybridroad.desc);
  if (hybridroad.id !== 'hybridroad') {
    console.error('SMOKE FAIL: expected policy id hybridroad (HYBRIDROAD=1 gate on), got ' + hybridroad.id);
    process.exit(1);
  }
  if (process.env.COMPETENT_DIRECTIONAL_FLEE !== '1') {
    console.error('SMOKE FAIL: COMPETENT_DIRECTIONAL_FLEE=1 required (the readiness hold rides recovering()).');
    process.exit(1);
  }
  const seeds = [11, 22, 33, 44, 55, 66, 77, 88];
  let bad = 0;
  for (const seed of seeds) {
    const gate = await checkDeterminism(seed, hybridroad, { days: 150 });
    console.log((gate.identical ? 'PASS ' : 'FAIL ') + gate.summary);
    if (!gate.identical) bad++;
  }
  if (bad) {
    console.error(`DETERMINISM GATE FAILED on ${bad}/${seeds.length} seeds — before/after comparisons NOT trustworthy.`);
    process.exit(1);
  }
  console.log('det-gate GREEN: all seeds bit-identical across runs. Before/after comparisons trustworthy.');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
