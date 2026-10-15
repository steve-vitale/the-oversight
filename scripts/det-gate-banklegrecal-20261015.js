#!/usr/bin/env node
// det-gate-banklegrecal-20261015.js — determinism gate for the banklegrecal pilot.
// Requires 32/32 identical (8 seeds x belongseek/leadfeast x BANKLEGRECAL unset/1)
// before the pilot. The layer is RNG-free in its decisions (state reads only;
// the hatch/discipline narrations are fixed state-derived lines), so a 60d
// exercise of its code path is the meaningful check.
// Known harness issue (entropy-hunt r26): fight-heavy seeds can diverge on
// contest resolution via timestamp-based villager IDs — a divergence there
// is reported with its locus, not hidden.
// Usage: node scripts/det-gate-banklegrecal-20261015.js
'use strict';
const { checkDeterminism } = require('./det-gate');
// KILL PROTOCOL (loop B ARM3 NO-GO at pilot, 2026-10-15): the banklegrecal layer
// was deleted. Degrade gracefully instead of crashing on the missing module.
let bl = null;
try { bl = require('./policies/banklegrecal'); } catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: banklegrecal layer deleted per kill protocol (NO-GO at pilot); det-gate was 32/32 pre-kill — see evidence/2026-10-15/sim-banklegrecal-b.md');
    process.exit(0);
  }
  throw e;
}

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = 60;

async function main() {
  let fails = 0;
  for (const policyId of ['belongseek', 'leadfeast']) {
    process.env.POLICY = policyId;
    for (const armed of [false, true]) {
      if (armed) process.env.BANKLEGRECAL = '1'; else delete process.env.BANKLEGRECAL;
      const side = armed ? 'armed' : 'control';
      const policy = bl.policyForRun();
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
  delete process.env.BANKLEGRECAL;
  if (fails) { console.error(`DET-GATE FAILED: ${fails} divergences`); process.exit(1); }
  console.log('DET-GATE: 32/32 identical (8 seeds x 2 policies x 2 sides)');
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
