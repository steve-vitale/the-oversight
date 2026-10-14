#!/usr/bin/env node
// scripts/det-gate-allowancegate-20261014.js — determinism gate for the r14
// allowance-gate arm (r27 rule: 16/16 bit-identical before trusting a
// before/after comparison).
//
// Runs every seed x policy combo twice in-process and requires bit-identical
// per-day trajectory hashes. Env must carry the policy flags:
//   CONTROL: FEASTSCALE_R13=1 (gate unset)
//   ARMED:   FEASTSCALE_R13=1 + FEASTGATE_R13=1
//
// Usage:
//   FEASTSCALE_R13=1 node scripts/det-gate-allowancegate-20261014.js
//   FEASTSCALE_R13=1 FEASTGATE_R13=1 node scripts/det-gate-allowancegate-20261014.js
'use strict';
const { checkDeterminism } = require('./det-gate');

const ARMED = process.env.FEASTGATE_R13 === '1';
const FS = require('./policies/feastscale');
const REG = {
  leadcourt: FS.leadfeast,
  belongseek: FS.belongfeast,
};
const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = parseInt(process.env.DAYS || '180', 10);

(async () => {
  let pass = 0, fail = 0;
  const fails = [];
  for (const pid of Object.keys(REG)) {
    for (const seed of SEEDS) {
      const gate = await checkDeterminism(seed, REG[pid], { days: DAYS, mode: 'ag-detgate-' + pid });
      console.log((gate.identical ? 'IDENTICAL ' : 'DIVERGED  ') + pid + ' s' + seed + ' — ' + gate.summary);
      if (gate.identical) pass++; else { fail++; fails.push(pid + '-s' + seed); }
    }
  }
  console.log(`\nDET-GATE ${ARMED ? 'ARMED' : 'CONTROL'}: ${pass}/16 identical${fail ? ` — DIVERGED: ${fails.join(', ')}` : ''}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('DET-GATE CRASH:', e); process.exit(2); });
