#!/usr/bin/env node
// det-gate-w5avoid-20261014.js — determinism gate for the W5-AVOIDANCE
// DOCTRINE arm (run BEFORE trusting any before/after comparison).
//
// Policy stack: W5AVOID=1 on the w5avoid wrapper (leadfeast + the avoidance
// doctrine). 8 pilot seeds x 180d death-aware, each run twice in-process via
// scripts/det-gate.js checkDeterminism; all pairs must be bit-identical
// (16/16).
//
// KNOWN RISK (det-gate.js, entropy-hunt r26 2026-10-14): timestamp-based
// villager IDs can leak into contest RNG on fight-heavy seeds (leadfeast
// s44). A FAIL here is reported seed-by-seed — the sweep then treats that
// seed's comparison as provisional (see evidence metric-review).
//
// KILLED-ARM GUARD: if the layer is absent (deleted per kill protocol),
// degrade to INFO-SKIP, not MODULE_NOT_FOUND (6th-instance lesson).
//
// Usage:
//   FEASTSCALE_R13=1 node scripts/det-gate-w5avoid-20261014.js
// Exits 0 when all seeds run bit-identically twice; exits 1 otherwise.
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.W5AVOID = '1';
let wa = null;
try { wa = require('./policies/w5avoid'); } catch (e) { /* absent: killed arm */ }
if (require.main === module && !wa) {
  console.log('INFO-SKIP: w5avoid layer absent (killed arm, deleted per kill protocol).');
  process.exit(0);
}
const { checkDeterminism } = require('./det-gate');

(async () => {
  const policy = wa.leadfeastW5avoid;
  console.log('policy under test: id=' + policy.id + ' desc=' + policy.desc);
  if (policy.id !== 'leadfeast+w5avoid') {
    console.error('SMOKE FAIL: expected policy id leadfeast+w5avoid (W5AVOID=1 gate on), got ' + policy.id);
    process.exit(1);
  }
  if (typeof policy.daily !== 'function') {
    console.error('SMOKE FAIL: unwrapped policy.daily is not a function — the gate would run policy-less.');
    process.exit(1);
  }
  const seeds = [11, 22, 33, 44, 55, 66, 77, 88];
  let bad = 0;
  for (const seed of seeds) {
    const gate = await checkDeterminism(seed, policy, { days: 180 });
    console.log((gate.identical ? 'PASS ' : 'FAIL ') + gate.summary);
    if (!gate.identical) bad++;
  }
  if (bad) {
    console.error(`DETERMINISM GATE FAILED on ${bad}/${seeds.length} seeds — before/after comparisons NOT trustworthy on those seeds.`);
    process.exit(1);
  }
  console.log('det-gate GREEN: 8/8 seeds bit-identical across runs (16/16). Before/after comparisons trustworthy.');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
