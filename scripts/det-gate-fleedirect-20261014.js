#!/usr/bin/env node
// scripts/det-gate-fleedirect-20261014.js — determinism gate for the
// fleedirect r26 arm (run BEFORE trusting any before/after comparison).
//
// Baseline policy: leadfeast (current tip; FEASTSCALE_R13 unset = pure
// leadcourt delegation). CONTROL: FLEEDIRECT unset. ARMED: FLEEDIRECT=1.
// Same code tree, identical seeds, env-var only.
//
// Usage: node scripts/det-gate-fleedirect-20261014.js
// Exits 0 when all seeds run bit-identically twice (16/16); exits 1 otherwise.
'use strict';
const { leadfeast } = require('./policies/feastscale');
const { checkDeterminism } = require('./det-gate');

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];

async function gateSide(label) {
  let bad = 0;
  for (const seed of SEEDS) {
    const gate = await checkDeterminism(seed, leadfeast, { days: 180 });
    console.log((gate.identical ? 'PASS ' : 'FAIL ') + '[' + label + '] ' + gate.summary);
    if (!gate.identical) bad++;
  }
  return bad;
}

(async () => {
  console.log('policy under test: id=' + leadfeast.id);
  let bad = 0;
  delete process.env.FLEEDIRECT;
  console.log('--- control (FLEEDIRECT unset) ---');
  bad += await gateSide('control');
  process.env.FLEEDIRECT = '1';
  console.log('--- armed (FLEEDIRECT=1) ---');
  bad += await gateSide('armed');
  delete process.env.FLEEDIRECT;
  if (bad) {
    console.error(`DETERMINISM GATE FAILED on ${bad}/16 checks — before/after comparisons NOT trustworthy.`);
    process.exit(1);
  }
  console.log('det-gate GREEN 16/16: all seeds bit-identical across runs, both sides. Before/after comparisons trustworthy.');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
