#!/usr/bin/env node
// scripts/det-gate-dutyalone-20261014.js — determinism gate for the DUTYALONE
// arm (r27 rule: 16/16 bit-identical before trusting a before/after
// comparison).
//
// Runs every seed x policy combo twice in-process and requires
// bit-identical per-day trajectory hashes. Env must carry the policy
// flags (DUTYALONE=1 + FEASTSCALE_R13=1 for armed; FEASTSCALE_R13=1 only
// for the r13-only control).
//
// Usage:
//   FEASTSCALE_R13=1 node scripts/det-gate-dutyalone-20261014.js
//   DUTYALONE=1 FEASTSCALE_R13=1 node scripts/det-gate-dutyalone-20261014.js
'use strict';
const { checkDeterminism } = require('./det-gate');

const ARMED = process.env.DUTYALONE === '1';
const R13 = process.env.FEASTSCALE_R13 === '1';
if (!R13) {
  console.error('DET-GATE FATAL: FEASTSCALE_R13=1 required (both sides ride the r13 machinery).');
  process.exit(2);
}
const REG = ARMED ? {
  leadcourt: require('./policies/dutyalone').dutylead,
  belongseek: require('./policies/dutyalone').dutybelong,
} : {
  // r13-only control substrate: the duty's marginal effect is measured
  // against leadfeast/belongfeast on identical seeds.
  leadcourt: require('./policies/feastscale').leadfeast,
  belongseek: require('./policies/feastscale').belongfeast,
};
const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = parseInt(process.env.DAYS || '180', 10);

(async () => {
  let pass = 0, fail = 0;
  const fails = [];
  for (const pid of Object.keys(REG)) {
    for (const seed of SEEDS) {
      const gate = await checkDeterminism(seed, REG[pid], { days: DAYS, mode: 'dl-detgate-' + pid });
      console.log((gate.identical ? 'IDENTICAL ' : 'DIVERGED  ') + pid + ' s' + seed + ' — ' + gate.summary);
      if (gate.identical) pass++; else { fail++; fails.push(pid + '-s' + seed); }
    }
  }
  console.log(`\nDET-GATE ${ARMED ? 'ARMED' : 'R13-CONTROL'}: ${pass}/16 identical${fail ? ` — DIVERGED: ${fails.join(', ')}` : ''}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('DET-GATE CRASH:', e); process.exit(2); });
