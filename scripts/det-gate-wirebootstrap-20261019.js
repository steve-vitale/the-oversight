#!/usr/bin/env node
// det-gate-wirebootstrap-20261019.js — determinism gate for the wirebootstrap pilot.
// Requires 16/16 identical (8 seeds x {leadfeast, belongfeast}, layer OFF)
// before the pilot. The withWireBootstrap wrapper must be a strict
// pass-through when WIREBOOTSTRAP is unset: zero verb calls, zero ctx
// writes, zero RNG draws.
//
// RNG HYGIENE (#614): policy-side layers that act consume game RNG. This
// gate proves the OFF side is byte-identical; the ON side's divergence is
// mechanism + RNG/schedule perturbation mixed (reported, not hidden).
// Usage: node scripts/det-gate-wirebootstrap-20261019.js
'use strict';
const { checkDeterminism } = require('./det-gate');
const { POLICY_REGISTRY } = require('./sweep-compare');
const wb = require('./policies/wirebootstrap');

const SEEDS = [31701, 31702, 31703, 31704, 31705, 31706, 31707, 31708];
const DAYS = 60;

async function main() {
  delete process.env.WIREBOOTSTRAP; // gate-off: the wrapper must be neutral
  if (wb.layerOn()) { console.error('DET-GATE STOP: layerOn() true with flag unset'); process.exit(2); }
  let fails = 0, total = 0;
  for (const policyId of ['leadfeast', 'belongfeast']) {
    const base = POLICY_REGISTRY[policyId];
    if (!base) { console.error('DET-GATE STOP: unknown policy ' + policyId); process.exit(2); }
    const policy = wb.withWireBootstrap(base, policyId + '-wb');
    for (const seed of SEEDS) {
      total++;
      const gate = await checkDeterminism(seed, policy, { days: DAYS });
      const tag = `${policyId}/off/s${seed}`;
      if (gate.identical) {
        console.log(`IDENTICAL ${tag}`);
      } else {
        console.log(`DIVERGED  ${tag}: ${gate.summary}`);
        fails++;
      }
    }
  }
  if (fails) { console.error(`DET-GATE FAILED: ${fails}/${total} divergences`); process.exit(1); }
  console.log(`DET-GATE: ${total}/${total} identical (8 seeds x 2 policies, layer OFF)`);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
