#!/usr/bin/env node
// scripts/det-gate-siegedef2-20261014.js — determinism gate for the
// siegedef2 r33 arm (run BEFORE trusting any before/after comparison).
//
// Substrate: leadfeast with FEASTSCALE_R13=1 (the plentycost road).
// CONTROL: SIEGEDEF2 unset (pure leadfeast delegation).
// ARMED: SIEGEDEF2=1 (the Haven watch + scholar engage judgment).
// Same code tree, identical seeds, env-var only.
//
// Usage: node scripts/det-gate-siegedef2-20261014.js
// Exits 0 when all seeds run bit-identically twice (16/16); exits 1 otherwise.
'use strict';
process.env.FEASTSCALE_R13 = '1';
const { siegeleadfeast } = require('./policies/siegedef2');
const { checkDeterminism } = require('./det-gate');

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];

async function gateSide(label) {
  let bad = 0;
  for (const seed of SEEDS) {
    const gate = await checkDeterminism(seed, siegeleadfeast, { days: 180 });
    console.log((gate.identical ? 'PASS ' : 'FAIL ') + '[' + label + '] ' + gate.summary);
    if (!gate.identical) bad++;
  }
  return bad;
}

(async () => {
  console.log('policy under test: id=' + siegeleadfeast.id + ' FEASTSCALE_R13=1');
  let bad = 0;
  delete process.env.SIEGEDEF2;
  console.log('--- control (SIEGEDEF2 unset) ---');
  bad += await gateSide('control');
  process.env.SIEGEDEF2 = '1';
  console.log('--- armed (SIEGEDEF2=1) ---');
  bad += await gateSide('armed');
  delete process.env.SIEGEDEF2;
  if (bad) {
    console.error(`DETERMINISM GATE FAILED on ${bad}/16 checks — before/after comparisons NOT trustworthy.`);
    process.exit(1);
  }
  console.log('det-gate GREEN 16/16: all seeds bit-identical across runs, both sides. Before/after comparisons trustworthy.');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
