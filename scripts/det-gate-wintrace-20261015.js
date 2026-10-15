#!/usr/bin/env node
// scripts/det-gate-wintrace-20261015.js — determinism gate for the wintrace
// diagnostic instrument (sim-wintrace, 2026-10-15).
//
// The instrument is READ-ONLY (samples table state, say-passthrough), so
// traced runs must be bit-identical run-to-run. Requires 16/16 identical
// (8 seeds x {leadfeast, belongfeast} with WINTRAZE=1) before trusting the
// before/after attribution comparison.
//
// Env must carry: FEASTSCALE_R13=1 (substrate), WINTRAZE=1 (instrument on).
//
// Usage:
//   FEASTSCALE_R13=1 WINTRAZE=1 node scripts/det-gate-wintrace-20261015.js
'use strict';
const { checkDeterminism } = require('./det-gate');
const WT = require('./policies/wintrace');

if (process.env.FEASTSCALE_R13 !== '1') {
  console.error('DET-GATE STOP: FEASTSCALE_R13=1 is required.');
  process.exit(2);
}
if (process.env.WINTRAZE !== '1') {
  console.error('DET-GATE STOP: WINTRAZE=1 is required.');
  process.exit(2);
}
const REG = { leadfeast: WT.leadtracer, belongfeast: WT.belongtracer };
const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = parseInt(process.env.DAYS || '180', 10);

(async () => {
  let pass = 0, fail = 0;
  const fails = [];
  for (const pid of Object.keys(REG)) {
    for (const seed of SEEDS) {
      const gate = await checkDeterminism(seed, REG[pid], { days: DAYS, mode: 'wt-detgate-' + pid });
      console.log((gate.identical ? 'IDENTICAL ' : 'DIVERGED  ') + pid + ' s' + seed + ' — ' + gate.summary);
      if (gate.identical) pass++; else { fail++; fails.push(pid + '-s' + seed); }
    }
  }
  console.log(`\nDET-GATE wintrace (traced): ${pass}/16 identical${fail ? ` — DIVERGED: ${fails.join(', ')}` : ''}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('DET-GATE CRASH:', e); process.exit(2); });
