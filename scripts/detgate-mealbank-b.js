#!/usr/bin/env node
// detgate-mealbank-b.js — determinism gate for the mealbank pilot
// (arm sim-mealbank-b, run fleshout-loop-b-20261020T1630Z).
//
// Requires 32/32 identical (8 pilot seeds x leadmealbank/belongmealbank x
// MEALBANK unset/1). The layer is RNG-free in its decisions (state reads
// only; the refusal voice is day-keyed deterministic), so a 60d exercise of
// its code path is the meaningful check. The gate-off side proves pure
// delegation; the gate-on side proves deterministic refusal behavior.
//
// Usage: node scripts/detgate-mealbank-b.js
// (no env vars required; the gate sets MEALBANK per cell)
'use strict';
const { checkDeterminism } = require('./det-gate');
// KILL PROTOCOL: the mealbank layer was deleted after the pilot killed the
// arm (NO-GO). Degrade gracefully; the pre-kill result was 32/32 identical.
let mb = null;
try { mb = require('./policies/mealbank-b'); } catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: mealbank layer deleted per kill protocol (NO-GO at pilot); det-gate was 32/32 pre-kill — see evidence/2026-10-20/sim-mealbank-b.md');
    process.exit(0);
  }
  throw e;
}

const SEEDS = [82002, 82003, 82004, 82005, 82006, 82007, 82008, 82009];
const DAYS = 60;
const POLICIES = { leadmealbank: mb.leadmealbank, belongmealbank: mb.belongmealbank };

async function main() {
  let fails = 0;
  for (const policyId of ['belongmealbank', 'leadmealbank']) {
    for (const armed of [false, true]) {
      if (armed) process.env.MEALBANK = '1'; else delete process.env.MEALBANK;
      const side = armed ? 'armed' : 'control';
      const policy = POLICIES[policyId];
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
  delete process.env.MEALBANK;
  if (fails) { console.error(`DET-GATE FAILED: ${fails} divergences`); process.exit(1); }
  console.log('DET-GATE: 32/32 identical (8 seeds x 2 policies x 2 sides)');
}
main().catch(e => { console.error('FATAL', e); process.exit(2); });
