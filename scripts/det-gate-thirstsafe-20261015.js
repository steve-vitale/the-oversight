#!/usr/bin/env node
// KILLED 2026-10-15 (sim-thirstsafe): NO-GO at 16-seed confirm (h1200 1.000x vs <=0.650 bar;
// hunger win is regime-dependent). Layer deleted per kill protocol. This script INFO-SKIPs.
const fs = require('fs'), path = require('path');
if (!fs.existsSync(path.join(__dirname, 'policies/thirstsafe.js'))) {
  console.log('INFO-SKIP: thirstsafe layer deleted (killed 2026-10-15); nothing to test.');
  process.exit(0);
}

// det-gate-thirstsafe-20261015.js — determinism gate for the thirstsafe pilot.
// Requires 32/32 identical (8 seeds x belongseek/leadcourt x BANKLEGSAFE
// unset/1) before the pilot. Each side must reproduce itself byte-identically;
// the layer is RNG-free in its decisions (state reads only; the
// hatch/discipline narrations are fixed state-derived lines), so a 60d
// exercise of its code path is the meaningful check.
// Usage: node scripts/det-gate-thirstsafe-20261015.js
'use strict';
const { checkDeterminism } = require('./det-gate');
let bl = null;
try { bl = require('./policies/thirstsafe'); } catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: thirstsafe layer absent; det-gate vacuous — see evidence/2026-10-15/sim-thirstsafe-b.md');
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
      if (armed) process.env.BANKLEGSAFE = '1'; else delete process.env.BANKLEGSAFE;
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
  delete process.env.BANKLEGSAFE;
  if (fails) { console.error(`DET-GATE FAILED: ${fails} divergences`); process.exit(1); }
  console.log('DET-GATE: 32/32 identical (8 seeds x 2 policies x 2 sides)');
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
