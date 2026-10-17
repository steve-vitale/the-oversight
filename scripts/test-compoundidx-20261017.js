#!/usr/bin/env node
// test-compoundidx-20261017.js — proof for the hostile-region compound-index
// census (sim-compoundidx, scale-onramp axis, findings #459/#460).
//
// The census instrument is READ-ONLY (zero src/js, zero policy changes); the
// classifier is a pure function over the instrument's per-run record. This
// test exercises the CLASSIFIER on synthetic fixtures: for each of the five
// compound parts, a fixture where the part is present and one where it is
// absent, plus boundary RED checks proving the thresholds are not vacuous
// (a near-miss must classify absent).
//
// RED->GREEN: this test fails until scripts/census-compoundidx-20261017.js
// exports classifyParts + THRESHOLDS.
'use strict';
const assert = require('assert');
const path = require('path');

const MOD = path.join(__dirname, 'census-compoundidx-20261017.js');
let C = null;
try { C = require(MOD); } catch (e) {
  console.error('RED: cannot require the census module:', e.message);
  process.exit(1);
}
const { classifyParts, THRESHOLDS } = C;
assert.ok(typeof classifyParts === 'function', 'classifyParts exported');
assert.ok(THRESHOLDS && typeof THRESHOLDS === 'object', 'THRESHOLDS exported');

let pass = 0, fail = 0;
const check = (name, fn) => {
  try { fn(); pass++; console.log(`  PASS ${name}`); }
  catch (e) { fail++; console.log(`  FAIL ${name} — ${e.message}`); }
};

// Base record: everything absent.
function base() {
  return {
    seed: 1, policyId: 'leadfeast', endReason: 'village-lost', gameDays: 50,
    hostileSplinterEver: [], forageMaxStage: 0,
    raidKcal: 0, raidEvents: [], gardenRaidCount: 0,
    tributeMaxTerms: 4000, griefGrabs: 0, tributePaidTotal: 0,
    wave3Day: null, villagerDeaths: 0, meatgrinderDeaths: 0, meatgrinderShare: 0,
    pantryPeak: 0, spiralDays: null,
  };
}
const parts = (rec) => classifyParts(rec).parts;

// --- Part 1: forage-ground competition (commons rumorStage >= 1) ---
check('forage present at stage 2', () => {
  const r = base(); r.forageMaxStage = 2;
  assert.strictEqual(parts(r).forage, true);
});
check('forage absent at stage 0', () => {
  assert.strictEqual(parts(base()).forage, false);
});

// --- Part 2: raid hemorrhage (>= 2000 kcal) ---
check('raid present at 8100 kcal (hardseed figure)', () => {
  const r = base(); r.raidKcal = 8100;
  assert.strictEqual(parts(r).raid, true);
});
check('raid absent at 1500 kcal', () => {
  const r = base(); r.raidKcal = 1500;
  assert.strictEqual(parts(r).raid, false);
});

// --- Part 3: grief-leveraged tribute (grab fired AND terms moved) ---
check('tribute present: 2 grabs, terms 11250 (hardseed belongfeast)', () => {
  const r = base(); r.griefGrabs = 2; r.tributeMaxTerms = 11250;
  assert.strictEqual(parts(r).tribute, true);
});
check('tribute absent: no grabs', () => {
  const r = base(); r.tributeMaxTerms = 4000;
  assert.strictEqual(parts(r).tribute, false);
});
check('RED boundary: grab fired but terms never moved past 5000', () => {
  const r = base(); r.griefGrabs = 1; r.tributeMaxTerms = 5000;
  assert.strictEqual(parts(r).tribute, false, 'grief without leverage is not the part');
});

// --- Part 4: wave-3/contest meatgrinder ---
check('meatgrinder present: 6/10 combat deaths post wave-3', () => {
  const r = base(); r.wave3Day = 30; r.villagerDeaths = 10; r.meatgrinderDeaths = 6; r.meatgrinderShare = 0.6;
  assert.strictEqual(parts(r).meatgrinder, true);
});
check('meatgrinder absent: wave 3 never released', () => {
  const r = base(); r.villagerDeaths = 10; r.meatgrinderDeaths = 6; r.meatgrinderShare = 0.6;
  assert.strictEqual(parts(r).meatgrinder, false);
});
check('RED boundary: share 0.4 below the bar', () => {
  const r = base(); r.wave3Day = 30; r.villagerDeaths = 10; r.meatgrinderDeaths = 4; r.meatgrinderShare = 0.4;
  assert.strictEqual(parts(r).meatgrinder, false);
});
check('RED boundary: one combat death is not a meatgrinder', () => {
  const r = base(); r.wave3Day = 30; r.villagerDeaths = 2; r.meatgrinderDeaths = 1; r.meatgrinderShare = 0.5;
  assert.strictEqual(parts(r).meatgrinder, false);
});

// --- Part 5: pantry death spiral (peak >= 20k, <2k within <= 10d) ---
check('spiral present: 40k -> 0 in 8 days (hardseed figure)', () => {
  const r = base(); r.pantryPeak = 40000; r.spiralDays = 8;
  assert.strictEqual(parts(r).spiral, true);
});
check('spiral absent: peak only 15k', () => {
  const r = base(); r.pantryPeak = 15000; r.spiralDays = 5;
  assert.strictEqual(parts(r).spiral, false);
});
check('RED boundary: collapse took 11 days', () => {
  const r = base(); r.pantryPeak = 40000; r.spiralDays = 11;
  assert.strictEqual(parts(r).spiral, false);
});

// --- Compound count + verdict ---
check('compound verdict: 3 parts -> compound', () => {
  const r = base();
  r.forageMaxStage = 2; r.raidKcal = 8100; r.griefGrabs = 2; r.tributeMaxTerms = 11250;
  const c = classifyParts(r);
  assert.strictEqual(c.partCount, 3);
  assert.strictEqual(c.compound, true);
});
check('compound verdict: 2 parts -> sporadic', () => {
  const r = base();
  r.forageMaxStage = 2; r.raidKcal = 8100;
  const c = classifyParts(r);
  assert.strictEqual(c.partCount, 2);
  assert.strictEqual(c.compound, false);
});

// --- Robustness: the classifier never throws on thin records ---
check('classifyParts({}) is all-absent, no throw', () => {
  const c = classifyParts({});
  assert.deepStrictEqual(Object.values(c.parts), [false, false, false, false, false]);
  assert.strictEqual(c.partCount, 0);
});

// --- Thresholds are the pre-registered numbers ---
check('thresholds match the pre-registered values', () => {
  assert.strictEqual(THRESHOLDS.raidKcal, 2000);
  assert.strictEqual(THRESHOLDS.tributeTerms, 6000);
  assert.strictEqual(THRESHOLDS.meatgrinderShare, 0.5);
  assert.strictEqual(THRESHOLDS.meatgrinderMinDeaths, 2);
  assert.strictEqual(THRESHOLDS.spiralPeak, 20000);
  assert.strictEqual(THRESHOLDS.spiralDays, 10);
  assert.strictEqual(THRESHOLDS.compoundParts, 3);
});

console.log(`\ncompoundidx classifier proof: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
