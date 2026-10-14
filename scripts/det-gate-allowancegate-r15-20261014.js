#!/usr/bin/env node
// scripts/det-gate-allowancegate-r15-20261014.js — determinism gate for the
// r15 allowance-gate arm (r27 rule: 16/16 bit-identical before trusting a
// before/after comparison).
//
// Runs every seed x policy combo twice in-process and requires bit-identical
// per-day trajectory hashes. Env must carry the policy flags:
//   CONTROL: FEASTSCALE_R13=1 (ALLOWANCEGATE unset) — r13-only substrate
//   ARMED:   FEASTSCALE_R13=1 + ALLOWANCEGATE=1 — the r15 pantry-state gate
//
// Usage:
//   FEASTSCALE_R13=1 node scripts/det-gate-allowancegate-r15-20261014.js
//   FEASTSCALE_R13=1 ALLOWANCEGATE=1 node scripts/det-gate-allowancegate-r15-20261014.js
'use strict';
const { checkDeterminism } = require('./det-gate');

const ARMED = process.env.ALLOWANCEGATE === '1';
const FS = require('./policies/feastscale');
let AG;
try {
  AG = require('./policies/allowancegate');
} catch (e) {
  console.log('INFO-SKIP: allowancegate layer absent (reverted per kill protocol)');
  process.exit(0);
}
const REG = ARMED
  ? { leadcourt: AG.leadgate, belongseek: AG.belonggate }
  : { leadcourt: FS.leadfeast, belongseek: FS.belongfeast };
const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = parseInt(process.env.DAYS || '180', 10);

(async () => {
  let pass = 0, fail = 0;
  const fails = [];
  for (const pid of Object.keys(REG)) {
    for (const seed of SEEDS) {
      const gate = await checkDeterminism(seed, REG[pid], { days: DAYS, mode: 'ag15-detgate-' + pid });
      console.log((gate.identical ? 'IDENTICAL ' : 'DIVERGED  ') + pid + ' s' + seed + ' — ' + gate.summary);
      if (gate.identical) pass++; else { fail++; fails.push(pid + '-s' + seed); }
    }
  }
  console.log(`\nDET-GATE r15 ${ARMED ? 'ARMED' : 'CONTROL'}: ${pass}/16 identical${fail ? ` — DIVERGED: ${fails.join(', ')}` : ''}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('DET-GATE CRASH:', e); process.exit(2); });
