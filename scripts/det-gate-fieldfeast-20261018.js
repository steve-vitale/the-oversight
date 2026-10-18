#!/usr/bin/env node
// KILLED AT SWEEP 2026-10-18 (flesh-out loop) — PRIMARY NO-GO
// (0 field-fight deed-banking events vs bar >= 4). Layer deleted
// zero-trace per kill protocol; game code reverted. Instruments
// kept; see evidence/2026-10-17/sim-fieldfeast.md.
// det-gate-fieldfeast-20261018.js — determinism gate for the fieldfeast pilot.
// Requires 32/32 identical (8 seeds x leadfeast/belongfeast x FIELDFEAST
// unset/1) before the pilot. The layer is RNG-free in its decisions (state
// reads only — feastedActive/feastedMult/villagerPowerMult; the fight-record
// narrations are fixed state-derived lines), so a 60d exercise of its code
// path is the meaningful check.
// Known harness issue (entropy-hunt r26): fight-heavy seeds can diverge on
// contest resolution via timestamp-based villager IDs — a divergence there
// is reported with its locus, not hidden.
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/det-gate-fieldfeast-20261018.js
'use strict';
const { checkDeterminism } = require('./det-gate');
const { leadfeast, belongfeast } = require('./policies/feastscale');

if (process.env.FEASTSCALE_R13 !== '1') { console.error('DET-GATE STOP: FEASTSCALE_R13=1 required'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('DET-GATE STOP: SEATDRIVE=0 required EXPLICIT'); process.exit(2); }

const SEEDS = [62111, 62112, 62113, 62114, 62115, 62116, 62117, 62118];
const DAYS = 60;
const POLICIES = { leadfeast, belongfeast };

async function main() {
  let fails = 0;
  for (const policyId of Object.keys(POLICIES)) {
    for (const armed of [false, true]) {
      if (armed) process.env.FIELDFEAST = '1'; else delete process.env.FIELDFEAST;
      const side = armed ? 'armed' : 'control';
      const policy = POLICIES[policyId];
      for (const seed of SEEDS) {
        const gate = await checkDeterminism(seed, policy, { days: DAYS, mode: 'det-gate-fieldfeast' });
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
  delete process.env.FIELDFEAST;
  if (fails) { console.error(`DET-GATE FAILED: ${fails} divergences`); process.exit(1); }
  console.log('DET-GATE: 32/32 identical (8 seeds x 2 policies x 2 sides)');
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
