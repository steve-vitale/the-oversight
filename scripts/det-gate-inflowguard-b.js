#!/usr/bin/env node
// scripts/det-gate-inflowguard-b.js — determinism gate for the INFLOW-GUARD
// lever (fleshout loop B, 2026-10-20, arm sim-inflowguard-b). Run BEFORE
// trusting any before/after comparison.
//
// 16 configs (8 fresh seeds x leadfeast/belongfeast), each run TWICE at the
// full 180d death-aware horizon on BOTH sides:
//   - control side: INFLOWGUARD unset (base leadfeast/belongfeast)
//   - armed side:   INFLOWGUARD=1 (iglead/igbelong)
// 16/16 bit-identical pairs required on each side (r27 rule).
//
// Seeds are fresh (4901-4908): 4801-4808 were pantryguard's; the repo's
// banned-seed list (11-88, 111-888, 201-208, 931-938, 982-989, 991-998,
// 1201-1208, 1701-1708, 3101-3108, 3201-3208, 3301-3308, 4201-4308/4401-4508
// ranges, 5101-5108 + singles) is honored. Paired control is re-measured on
// the current tip — never inherited.
//
// Usage:
//   FEASTSCALE_R13=1 node scripts/det-gate-inflowguard-b.js
'use strict';
process.env.FEASTSCALE_R13 = '1';
const { checkDeterminism } = require('./det-gate');
const FS = require('./policies/feastscale');
const IG = require('./policies/inflowguard');

const SEEDS = [4901, 4902, 4903, 4904, 4905, 4906, 4907, 4908];
const SIDES = [
  { name: 'control', env: null, pol: { leadfeast: FS.leadfeast, belongfeast: FS.belongfeast } },
  { name: 'armed', env: '1', pol: { leadfeast: IG.iglead, belongfeast: IG.igbelong } },
];

(async () => {
  let bad = 0, total = 0;
  for (const side of SIDES) {
    if (side.env) process.env.INFLOWGUARD = side.env;
    else delete process.env.INFLOWGUARD;
    console.log(`\n--- ${side.name} side (INFLOWGUARD=${side.env || 'unset'}) ---`);
    for (const pid of ['leadfeast', 'belongfeast']) {
      for (const seed of SEEDS) {
        total++;
        const gate = await checkDeterminism(seed, side.pol[pid], { days: 180, sampleEvery: 181 }); // 2026-10-20: sampleEvery=181 skips the heavy per-day telemetry (pop/pantry/trust/codex every day); the gate hashes every day regardless, so determinism evidence is unchanged — the default sampleEvery=1 made the 180d gate ~14 min/config (~8h total); with 181 the same 32 configs run in minutes
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
