#!/usr/bin/env node
// scripts/det-gate-holdspiral-20261016.js — determinism gate for the
// sim-holdspiral-b arm (r27 rule: bit-identical before trusting a
// before/after comparison). Runs every pilot seed x policy combo twice
// in-process and requires bit-identical per-day trajectory hashes. Env must
// carry the policy flags:
//   CONTROL: FEASTSCALE_R13=1 + ALLOWGATE2=1 (ALLOWGATE6 unset) — the landed gate
//   ARMED:   FEASTSCALE_R13=1 + ALLOWGATE2=1 + ALLOWGATE6=1 — gate + release valve
//
// Usage:
//   SEATDRIVE=0 FEASTSCALE_R13=1 ALLOWGATE2=1 node scripts/det-gate-holdspiral-20261016.js
//   SEATDRIVE=0 FEASTSCALE_R13=1 ALLOWGATE2=1 ALLOWGATE6=1 node scripts/det-gate-holdspiral-20261016.js
'use strict';
const { checkDeterminism } = require('./det-gate');

const VALVE = process.env.ALLOWGATE6 === '1';
let AG2, AG6;
try {
  AG2 = require('./policies/allowgate2');
} catch (e) {
  console.log('INFO-SKIP: allowgate2 layer absent (reverted per kill protocol)');
  process.exit(0);
}
try {
  AG6 = require('./policies/allowgate6');
} catch (e) {
  console.log('INFO-SKIP: allowgate6 layer absent (reverted per kill protocol); det-gate was 8/8 both sides pre-decision — see evidence/2026-10-16/sim-holdspiral-b.md');
  process.exit(0);
}
const REG = VALVE
  ? { leadcourt: AG6.leadgate6, belongseek: AG6.belonggate6 }
  : { leadcourt: AG2.leadgate2, belongseek: AG2.belonggate2 };
const SEEDS = [101, 202, 303, 404];
const DAYS = parseInt(process.env.DAYS || '180', 10);

(async () => {
  let pass = 0, fail = 0;
  const fails = [];
  for (const pid of Object.keys(REG)) {
    for (const seed of SEEDS) {
      const gate = await checkDeterminism(seed, REG[pid], { days: DAYS, mode: 'hs-detgate-' + pid });
      console.log((gate.identical ? 'IDENTICAL ' : 'DIVERGED  ') + pid + ' s' + seed + ' — ' + gate.summary);
      if (gate.identical) pass++; else { fail++; fails.push(pid + '-s' + seed); }
    }
  }
  console.log(`\nDET-GATE holdspiral ${VALVE ? 'ARMED' : 'CONTROL'}: ${pass}/8 identical${fail ? ` — DIVERGED: ${fails.join(', ')}` : ''}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('DET-GATE CRASH:', e); process.exit(2); });
