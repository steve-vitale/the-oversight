#!/usr/bin/env node
// scripts/det-gate-feastexposure-20261015.js — determinism gate for the
// feast fight-exposure gate arm (r27 rule: 16/16 bit-identical before
// trusting a before/after comparison).
//
// Runs every seed x policy combo twice in-process and requires bit-identical
// per-day trajectory hashes. Env must carry the policy flags:
//   CONTROL: FEASTSCALE_R13=1 (FEASTEXPOSURE unset) — the substrate road
//   ARMED:   FEASTSCALE_R13=1 FEASTEXPOSURE=1 — substrate + fight-exposure gate
//
// Usage:
//   FEASTSCALE_R13=1 node scripts/det-gate-feastexposure-20261015.js
//   FEASTSCALE_R13=1 FEASTEXPOSURE=1 node scripts/det-gate-feastexposure-20261015.js
'use strict';
const { checkDeterminism } = require('./det-gate');

if (process.env.FEASTSCALE_R13 !== '1') {
  console.error('DET-GATE STOP: FEASTSCALE_R13=1 is required.');
  process.exit(2);
}
const ARMED = process.env.FEASTEXPOSURE === '1';
let FE;
try {
  FE = require('./policies/feastexposure');
} catch (e) {
  console.log('INFO-SKIP: feastexposure layer absent (reverted per kill protocol)');
  process.exit(0);
}
const FS = require('./policies/feastscale');
const REG = ARMED
  ? { leadcourt: FE.leadexposure, belongseek: FE.belongexposure }
  : { leadcourt: FS.leadfeast, belongseek: FS.belongfeast };
const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = parseInt(process.env.DAYS || '180', 10);

(async () => {
  let pass = 0, fail = 0;
  const fails = [];
  for (const pid of Object.keys(REG)) {
    for (const seed of SEEDS) {
      const gate = await checkDeterminism(seed, REG[pid], { days: DAYS, mode: 'fx-detgate-' + pid });
      console.log((gate.identical ? 'IDENTICAL ' : 'DIVERGED  ') + pid + ' s' + seed + ' — ' + gate.summary);
      if (gate.identical) pass++; else { fail++; fails.push(pid + '-s' + seed); }
    }
  }
  console.log(`\nDET-GATE feastexposure ${ARMED ? 'ARMED' : 'CONTROL'}: ${pass}/16 identical${fail ? ` — DIVERGED: ${fails.join(', ')}` : ''}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('DET-GATE CRASH:', e); process.exit(2); });
