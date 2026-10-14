#!/usr/bin/env node
// det-gate-takedisc-20261014.js — determinism gate for the takedisc pilot.
// Requires 8/8 identical on BOTH policies (belongseek, leadcourt) and BOTH
// sides (TAKEDISC unset = control, TAKEDISC=1 = armed) before the pilot.
//
// Horizon 60d: the harness clock's 180d determinism was already proven 8/8
// on this tip (wave5cond-r27 arm); this gate checks the takedisc WRAPPER
// doesn't break it. The layer is RNG-free (no Math.random/Date.now in
// decisions), so a 60d exercise of its code path is the meaningful check.
// Usage: node scripts/det-gate-takedisc-20261014.js
'use strict';
const { checkDeterminism } = require('./det-gate');
const td = require('./policies/takedisc');

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = 60;

async function main() {
  let fails = 0;
  for (const policyId of ['belongseek', 'leadcourt']) {
    process.env.POLICY = policyId;
    for (const takedisc of [undefined, '1']) {
      if (takedisc === undefined) delete process.env.TAKEDISC;
      else process.env.TAKEDISC = takedisc;
      const side = takedisc ? 'armed' : 'control';
      const policy = td.policyForRun();
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
  delete process.env.TAKEDISC;
  if (fails) { console.error(`DET-GATE FAILED: ${fails} divergences`); process.exit(1); }
  console.log('DET-GATE: 32/32 identical (8 seeds x 2 policies x 2 sides)');
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
