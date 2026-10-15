#!/usr/bin/env node
// thirstbank arm (run fleshout-b-20261015T0927Z ARM 1): the v1 thirst-safe shape.
// KILL-PROTOCOL GUARD: INFO-SKIPs (exit 0) if the layer was deleted per a §14 kill.
const fs = require('fs'), path = require('path');
if (!fs.existsSync(path.join(__dirname, 'policies/thirstbank.js'))) {
  console.log('INFO-SKIP: thirstbank layer deleted (killed 2026-10-15); nothing to test.');
  process.exit(0);
}

// det-gate-thirstbank-20261015.js — determinism gate for the thirstbank pilot.
// Requires 32/32 identical (8 seeds x belongseek/leadcourt x THIRSTBANK
// unset/1) before the pilot. Each side must reproduce itself byte-identically;
// the layer is RNG-free in its decisions (state reads only; the
// hatch/discipline narrations are fixed state-derived lines), so a 60d
// exercise of its code path is the meaningful check.
// Usage: node scripts/det-gate-thirstbank-20261015.js
'use strict';
const { checkDeterminism } = require('./det-gate');
let bl = null;
try { bl = require('./policies/thirstbank'); } catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: thirstbank layer absent; det-gate vacuous — see evidence/2026-10-15/sim-thirstbank-b.md');
    process.exit(0);
  }
  throw e;
}

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = 60;

async function main() {
  let fails = 0;
  for (const policyId of ['belongseek', 'leadcourt']) {
    process.env.POLICY = policyId;
    for (const armed of [false, true]) {
      if (armed) process.env.THIRSTBANK = '1'; else delete process.env.THIRSTBANK;
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
  delete process.env.THIRSTBANK;
  if (fails) { console.error(`DET-GATE FAILED: ${fails} divergences`); process.exit(1); }
  console.log('DET-GATE: 32/32 identical (8 seeds x 2 policies x 2 sides)');
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
