#!/usr/bin/env node
// scripts/det-gate-allowancegate2-20261014.js — determinism gate for the
// allowgate2 arm (r27 rule: 16/16 bit-identical before trusting a
// before/after comparison).
//
// Runs every seed x policy combo twice in-process and requires bit-identical
// per-day trajectory hashes. Env must carry the policy flags:
//   CONTROL: FEASTSCALE_R13=1 (ALLOWGATE2 unset) — r13-only substrate
//   ARMED:   FEASTSCALE_R13=1 + ALLOWGATE2=1 — the 4-day-floor pantry gate
//
// Usage:
//   FEASTSCALE_R13=1 node scripts/det-gate-allowancegate2-20261014.js
//   FEASTSCALE_R13=1 ALLOWGATE2=1 node scripts/det-gate-allowancegate2-20261014.js
'use strict';
const { checkDeterminism } = require('./det-gate');

const ARMED = process.env.ALLOWGATE2 === '1';
const FS = require('./policies/feastscale');
let AG2;
try {
  AG2 = require('./policies/allowgate2');
} catch (e) {
  console.log('INFO-SKIP: allowgate2 layer absent (reverted per kill protocol)');
  process.exit(0);
}
const REG = ARMED
  ? { leadcourt: AG2.leadgate2, belongseek: AG2.belonggate2 }
  : { leadcourt: FS.leadfeast, belongseek: FS.belongfeast };
const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = parseInt(process.env.DAYS || '180', 10);

(async () => {
  let pass = 0, fail = 0;
  const fails = [];
  for (const pid of Object.keys(REG)) {
    for (const seed of SEEDS) {
      const gate = await checkDeterminism(seed, REG[pid], { days: DAYS, mode: 'ag2-detgate-' + pid });
      console.log((gate.identical ? 'IDENTICAL ' : 'DIVERGED  ') + pid + ' s' + seed + ' — ' + gate.summary);
      if (gate.identical) pass++; else { fail++; fails.push(pid + '-s' + seed); }
    }
  }
  console.log(`\nDET-GATE allowgate2 ${ARMED ? 'ARMED' : 'CONTROL'}: ${pass}/16 identical${fail ? ` — DIVERGED: ${fails.join(', ')}` : ''}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('DET-GATE CRASH:', e); process.exit(2); });
