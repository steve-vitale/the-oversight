#!/usr/bin/env node
// scripts/det-gate-feasttable-20261014.js — determinism gate for the
// feasttable arm (r27 rule: 16/16 bit-identical before trusting a
// before/after comparison).
//
// Runs every seed x policy combo twice in-process and requires bit-identical
// per-day trajectory hashes. Env must carry the policy flags:
//   CONTROL: (FEASTTABLE unset) — the base courtship policies, no feasts
//   ARMED:   FEASTTABLE=1 — belongtable/leadtable (candidate-gated,
//            floor-honored major feasts)
//
// Usage:
//   node scripts/det-gate-feasttable-20261014.js
//   FEASTTABLE=1 node scripts/det-gate-feasttable-20261014.js
'use strict';
const { checkDeterminism } = require('./det-gate');

const ARMED = process.env.FEASTTABLE === '1';
let FT;
try {
  FT = require('./policies/feasttable');
} catch (e) {
  console.log('INFO-SKIP: feasttable layer absent (reverted per kill protocol)');
  process.exit(0);
}
const { belongseek } = require('./policies/belongseek');
const { leadcourt } = require('./policies/leadcourt');
const REG = ARMED
  ? { leadcourt: FT.leadtable, belongseek: FT.belongtable }
  : { leadcourt, belongseek };
const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = parseInt(process.env.DAYS || '180', 10);

(async () => {
  let pass = 0, fail = 0;
  const fails = [];
  for (const pid of Object.keys(REG)) {
    for (const seed of SEEDS) {
      const gate = await checkDeterminism(seed, REG[pid], { days: DAYS, mode: 'ft-detgate-' + pid });
      console.log((gate.identical ? 'IDENTICAL ' : 'DIVERGED  ') + pid + ' s' + seed + ' — ' + gate.summary);
      if (gate.identical) pass++; else { fail++; fails.push(pid + '-s' + seed); }
    }
  }
  console.log(`\nDET-GATE feasttable ${ARMED ? 'ARMED' : 'CONTROL'}: ${pass}/16 identical${fail ? ` — DIVERGED: ${fails.join(', ')}` : ''}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('DET-GATE CRASH:', e); process.exit(2); });
