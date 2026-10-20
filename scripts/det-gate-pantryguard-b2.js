#!/usr/bin/env node
// scripts/det-gate-pantryguard-b2.js — determinism gate for the PANTRY-GUARD
// lever (fleshout loop B, 2026-10-20, arm sim-pantryguard-b2). Run BEFORE
// trusting any before/after comparison.
//
// 16 configs (8 fresh seeds x leadfeast/belongfeast), each run TWICE at the
// full 180d death-aware horizon on BOTH sides:
//   - control side: PANTRYGUARD unset (base leadfeast/belongfeast)
//   - armed side:   PANTRYGUARD=1 (pglead/pgbelong)
// 16/16 bit-identical pairs required on each side (r27 rule).
//
// Seeds are fresh (4801-4808): the pre-registered 11/22/33/44+55/66/77/88 are
// on the repo's banned-seed list (11-88 banned). Paired control is re-measured
// on the current tip — never inherited.
//
// Usage:
//   FEASTSCALE_R13=1 node scripts/det-gate-pantryguard-b2.js
'use strict';
process.env.FEASTSCALE_R13 = '1';
const { checkDeterminism } = require('./det-gate');
const FS = require('./policies/feastscale');
const PG = require('./policies/pantryguard');

const SEEDS = [4801, 4802, 4803, 4804, 4805, 4806, 4807, 4808];
const SIDES = [
  { name: 'control', env: null, pol: { leadfeast: FS.leadfeast, belongfeast: FS.belongfeast } },
  { name: 'armed', env: '1', pol: { leadfeast: PG.pglead, belongfeast: PG.pgbelong } },
];

(async () => {
  let bad = 0, total = 0;
  for (const side of SIDES) {
    if (side.env) process.env.PANTRYGUARD = side.env;
    else delete process.env.PANTRYGUARD;
    console.log(`\n--- ${side.name} side (PANTRYGUARD=${side.env || 'unset'}) ---`);
    for (const pid of ['leadfeast', 'belongfeast']) {
      for (const seed of SEEDS) {
        total++;
        const gate = await checkDeterminism(seed, side.pol[pid], { days: 180 });
        console.log((gate.identical ? 'PASS ' : 'FAIL ') + side.name + '/' + pid + ' ' + gate.summary);
        if (!gate.identical) bad++;
      }
    }
  }
  console.log(`\ndet-gate: ${total - bad}/${total} pairs bit-identical.`);
  if (bad) {
    console.error(`DETERMINISM GATE FAILED on ${bad}/${total} pairs — before/after comparisons NOT trustworthy.`);
    process.exit(1);
  }
  console.log('det-gate GREEN: 16/16 control + 16/16 armed pairs bit-identical. Comparisons trustworthy.');
})().catch(e => { console.error('FATAL', e); process.exit(2); });
