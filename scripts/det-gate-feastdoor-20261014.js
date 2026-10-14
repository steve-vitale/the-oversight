#!/usr/bin/env node
// scripts/det-gate-feastdoor-20261014.js — determinism gate for the FEASTDOOR
// arm (r27 rule: 16/16 or 32/32 bit-identical before trusting a before/after
// comparison).
//
// Runs every seed x policy combo twice in-process and requires
// bit-identical per-day trajectory hashes. Env must carry the policy
// flags (FEASTDOOR=1 + FEASTSCALE_R13=1 for armed; unset for control).
//
// Usage:
//   node scripts/det-gate-feastdoor-20261014.js
//   FEASTDOOR=1 FEASTSCALE_R13=1 node scripts/det-gate-feastdoor-20261014.js
'use strict';
const { checkDeterminism } = require('./det-gate');

const ARMED = process.env.FEASTDOOR === '1';
const R13 = process.env.FEASTSCALE_R13 === '1';
const REG = ARMED ? {
  leadcourt: require('./policies/feastdoor').doorlead,
  belongseek: require('./policies/feastdoor').doorbelong,
} : R13 ? {
  // r13-only control substrate (FEASTSCALE_R13=1, FEASTDOOR unset):
  // the duty's marginal effect is measured against leadfeast/belongfeast.
  leadcourt: require('./policies/feastscale').leadfeast,
  belongseek: require('./policies/feastscale').belongfeast,
} : {
  leadcourt: require('./policies/leadcourt').leadcourt,
  belongseek: require('./policies/belongseek').belongseek,
};
const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = parseInt(process.env.DAYS || '180', 10);

(async () => {
  let pass = 0, fail = 0;
  const fails = [];
  for (const pid of Object.keys(REG)) {
    for (const seed of SEEDS) {
      const gate = await checkDeterminism(seed, REG[pid], { days: DAYS, mode: 'fd-detgate-' + pid });
      console.log((gate.identical ? 'IDENTICAL ' : 'DIVERGED  ') + pid + ' s' + seed + ' — ' + gate.summary);
      if (gate.identical) pass++; else { fail++; fails.push(pid + '-s' + seed); }
    }
  }
  console.log(`\nDET-GATE ${ARMED ? 'ARMED' : 'CONTROL'}: ${pass}/16 identical${fail ? ` — DIVERGED: ${fails.join(', ')}` : ''}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('DET-GATE CRASH:', e); process.exit(2); });
