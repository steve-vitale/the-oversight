#!/usr/bin/env node
// det-gate-mealonly-20261014.js — determinism gate for the mealonly pilot.
// Requires 32/32 identical (8 seeds x belongseek/leadcourt x MEALONLY unset/1)
// before the pilot. The layer is RNG-free in its decisions (state reads only;
// the hatch narration is a fixed state-derived line), so a 60d exercise of
// its code path is the meaningful check.
// Usage: node scripts/det-gate-mealonly-20261014.js
'use strict';
const { checkDeterminism } = require('./det-gate');
const mo = require('./policies/mealonly');

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = 60;

async function main() {
  let fails = 0;
  for (const policyId of ['belongseek', 'leadcourt']) {
    process.env.POLICY = policyId;
    for (const mealonly of [undefined, '1']) {
      if (mealonly === undefined) delete process.env.MEALONLY;
      else process.env.MEALONLY = mealonly;
      const side = mealonly ? 'armed' : 'control';
      const policy = mo.policyForRun();
      for (const seed of SEEDS) {
        const gate = await checkDeterminism(seed, policy, { days: DAYS });
        const tag = `${policyId}/${side}/s${seed}`;
        if (gate.identical) {
          console.log(`IDENTICAL ${tag}`);
        } else {
          console.log(`DIVERGED  ${tag}: ${gate.summary}`);
          fails++;
        }
      }
    }
  }
  delete process.env.MEALONLY;
  if (fails) { console.error(`DET-GATE FAILED: ${fails} divergences`); process.exit(1); }
  console.log('DET-GATE: 32/32 identical (8 seeds x 2 policies x 2 sides)');
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
