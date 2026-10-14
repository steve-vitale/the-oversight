#!/usr/bin/env node
// scripts/detgate-armed-wave5cond-r27.js — A/A determinism gate for the ARMED
// policy (condfeast, WAVE5COND=1) on the 8-seed set. Both sides of the
// before/after must be deterministic for the comparison to be controlled.
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.WAVE5COND = '1';
const { condfeast } = require('./policies/wave5cond');
const { checkDeterminism } = require('./det-gate');

async function main() {
  const seeds = [11, 22, 33, 44, 55, 66, 77, 88];
  let allOk = true;
  for (const seed of seeds) {
    const gate = await checkDeterminism(seed, condfeast, { days: 180 });
    console.log(`armed ${gate.summary}`);
    if (!gate.identical) allOk = false;
  }
  console.log(allOk ? 'ARMED DET-GATE: ALL IDENTICAL' : 'ARMED DET-GATE: DIVERGENCE FOUND');
  process.exit(allOk ? 0 : 1);
}
main().catch(e => { console.error('FATAL', e); process.exit(2); });
