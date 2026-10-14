#!/usr/bin/env node
// scripts/diag-frozen-time-20261014.js — A/A with Date.now() FROZEN.
// If the s11 divergence disappears, the entropy source is Date.now()-derived
// (IDs / keys). If it persists, the source is elsewhere.
'use strict';
const FIXED = 1760400000000;
Date.now = () => FIXED;
process.env.FEASTSCALE_R13 = '1';
const { leadfeast } = require('./policies/feastscale');
const { checkDeterminism } = require('./det-gate');

async function main() {
  for (const seed of [11, 22, 33, 88]) {
    const gate = await checkDeterminism(seed, leadfeast, { days: 180 });
    console.log(`frozen-time ${gate.summary}`);
  }
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
