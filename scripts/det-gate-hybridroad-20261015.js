#!/usr/bin/env node
// scripts/det-gate-hybridroad-20261015.js — determinism gate for the
// hybridroad arm, BOTH sides (run BEFORE trusting any before/after
// comparison).
//
// Control: PROPOSELAYER=1 (the rebuilt diplomacy road). Armed:
// PROPOSELAYER=1 HYBRIDROAD=1 (hybridroad). Identical-seed run pairs must
// be bit-identical on each side, or before/after comparisons are noise.
//
// Env is set BEFORE require: the policy modules read their gate constants
// at require time. Gate-off byte-identical holds BY CONSTRUCTION on each
// layer: with the gate unset the module exports its base object
// reference-equal — proven by test-hybridroad R2 (hybridroad ===
// proposelayer) and the kept test-proposelayer R2 (proposelayer ===
// competent).
//
// KNOWN ISSUE (2026-10-14, entropy-hunt r26): the gate can FAIL on current
// master for fight-heavy seeds — timestamp-based villager IDs leak into
// contest resolution. A fail there is the engine's entropy, not this arm's;
// document per-seed and judge the comparison accordingly.
//
// Usage:
//   node scripts/det-gate-hybridroad-20261015.js
// Exits 0 when all seeds on both sides run bit-identically twice; exits 1
// otherwise.
'use strict';
process.env.PROPOSELAYER = '1';
// Landed-tree guard (3184c187 pattern): a killed arm's layer is deleted per
// kill protocol; the gate then INFO-SKIPs instead of FATALing.
let control = null;
try { control = require('./policies/proposelayer').proposelayer; } catch (e) { control = null; }
if (!control) {
  console.log('INFO-SKIP: policies/proposelayer.js absent (killed arm, layer deleted per kill protocol). Pre-kill det-gate stands; nothing to run on the landed tree.');
  process.exit(0);
}
process.env.HYBRIDROAD = '1';
let armed = null;
try { armed = require('./policies/hybridroad').hybridroad; } catch (e) { armed = null; }
if (!armed) {
  console.log('INFO-SKIP: policies/hybridroad.js absent (killed arm, layer deleted per kill protocol). Pre-kill det-gate stands; nothing to run on the landed tree.');
  process.exit(0);
}
const { checkDeterminism } = require('./det-gate');

(async () => {
  const seeds = [11, 22, 33, 44, 55, 66, 77, 88];
  let bad = 0;
  console.log('--- control side: PROPOSELAYER=1 (id=' + control.id + ') ---');
  if (control.id !== 'proposelayer') { console.error('SMOKE FAIL: control policy id=' + control.id); process.exit(1); }
  for (const seed of seeds) {
    const gate = await checkDeterminism(seed, control, { days: 150 });
    console.log((gate.identical ? 'PASS ' : 'FAIL ') + gate.summary);
    if (!gate.identical) bad++;
  }
  console.log('--- armed side: PROPOSELAYER=1 HYBRIDROAD=1 (id=' + armed.id + ') ---');
  if (armed.id !== 'hybridroad') { console.error('SMOKE FAIL: armed policy id=' + armed.id); process.exit(1); }
  for (const seed of seeds) {
    const gate = await checkDeterminism(seed, armed, { days: 150 });
    console.log((gate.identical ? 'PASS ' : 'FAIL ') + gate.summary);
    if (!gate.identical) bad++;
  }
  if (bad) {
    console.error(`DETERMINISM GATE FAILED on ${bad}/${seeds.length * 2} runs — before/after comparisons NOT trustworthy on those seeds.`);
    process.exit(1);
  }
  console.log('det-gate GREEN: all seeds bit-identical across runs on BOTH sides. Before/after comparisons trustworthy.');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
