#!/usr/bin/env node
// test-packcomp-b.js — proof for sim-packcomp-b (DIAG ONLY).
// Pure counterfactual checks (no harness) + one live field-capture
// control (--live-control, seed 51109, NON-pilot) proving the driver
// records foodState / hiddenKcal / lump fields on real returns.
// Prereg gate (1): pure checks AND the live control green BEFORE any
// judged sim. Usage:
//   node scripts/test-packcomp-b.js            (pure checks only)
//   node scripts/test-packcomp-b.js --live-control   (+ live control)
'use strict';
const assert = require('assert');
const { countReturn } = require('./packcomp-b-count');

let n = 0;
function check(name, fn) {
  n++;
  fn();
  console.log('ok ' + n + ' - ' + name);
}
function fin(units, kcalEach) {
  return { name: 'Finished', units, kcalEach, foodState: 'ready', unprocessed: false, finished: true };
}
function unk(units, hiddenKcal, extra) {
  return Object.assign({ name: 'unknown plant', plantId: 'dandelion', units, kcalEach: 0,
    hiddenKcal, dataCal: hiddenKcal, edibility: 'safe', foodState: 'unknown',
    unprocessed: true, finished: false, lumpComp: null }, extra || {});
}
function shell(units, hiddenKcal) {
  return { name: 'Hickory Nuts (in shell)', plantId: 'hickory_nut', units, kcalEach: 0,
    hiddenKcal, dataCal: hiddenKcal, foodState: 'in_shell', unprocessed: true, finished: false };
}
function mat(units) {
  return { name: 'Stick', units, kcalEach: 0, foodState: null, unprocessed: false, finished: false };
}

check('finished-only pack passes through unchanged in all channels', () => {
  const r = countReturn([fin(10, 100), fin(5, 200)]);
  assert.strictEqual(r.finished, 2000);
  assert.strictEqual(r.a, 2000); assert.strictEqual(r.b, 2000); assert.strictEqual(r.c, 2000);
  assert.strictEqual(r.wouldA, false); assert.strictEqual(r.wouldC, false);
});
check('exact-2000 boundary does not would-unload; 2001 does', () => {
  const r = countReturn([fin(20, 100), unk(1, 1)]);
  // finished 2000 + unknown 1 = 2001 -> would unload on (a) and (c)
  assert.strictEqual(r.finished, 2000); assert.strictEqual(r.a, 2001);
  assert.strictEqual(r.wouldA, true); assert.strictEqual(r.wouldB, false);
  const r2 = countReturn([fin(20, 100)]);
  assert.strictEqual(r2.wouldA, false); assert.strictEqual(r2.wouldC, false);
});
check('unknown non-lump counts at revealed (hiddenKcal) value in (a) and (c), not (b)', () => {
  const r = countReturn([unk(10, 45)]);
  assert.strictEqual(r.unknownValue, 450);
  assert.strictEqual(r.a, 450); assert.strictEqual(r.b, 0); assert.strictEqual(r.c, 450);
});
check('unknown non-lump falls back to dataCal when hiddenKcal absent', () => {
  const r = countReturn([unk(4, null, { hiddenKcal: null, dataCal: 50 })]);
  assert.strictEqual(r.unknownValue, 200);
});
check('unknown lump sums over components by caloriesPerUnit', () => {
  const lump = { name: 'unknown shoots', units: 0, kcalEach: 0, foodState: 'unknown',
    unprocessed: true, finished: false,
    lumpComp: [
      { pid: 'dandelion', units: 10, calPerUnit: 45, edibility: 'safe', isNut: false, mustCook: false },
      { pid: 'cattail', units: 5, calPerUnit: 100, edibility: 'safe', isNut: false, mustCook: false },
    ] };
  const r = countReturn([lump]);
  assert.strictEqual(r.unknownValue, 950);
  assert.strictEqual(r.a, 950); assert.strictEqual(r.b, 0);
});
check('avoid-edibility unknown counts 0 (identified — not food)', () => {
  const r = countReturn([unk(10, 90, { edibility: 'avoid' })]);
  assert.strictEqual(r.unknownValue, 0);
  const lump = { name: 'unknown shoots', units: 0, kcalEach: 0, foodState: 'unknown',
    unprocessed: true, finished: false,
    lumpComp: [{ pid: 'poison_x', units: 8, calPerUnit: 90, edibility: 'avoid', isNut: false, mustCook: false }] };
  assert.strictEqual(countReturn([lump]).unknownValue, 0);
});
check('in-shell nuts count at round(hidden x 0.75) in (b) and (c), not (a)', () => {
  const r = countReturn([shell(10, 100)]);
  assert.strictEqual(r.shelledValue, 750);
  assert.strictEqual(r.a, 0); assert.strictEqual(r.b, 750); assert.strictEqual(r.c, 750);
  // rounding: 101 x 0.75 = 75.75 -> 76 per unit
  const r2 = countReturn([shell(3, 101)]);
  assert.strictEqual(r2.shelledValue, 228);
});
check('in-shell falls back to dataCal when hiddenKcal absent', () => {
  const r = countReturn([shell(4, null, )].map((x) => Object.assign(x, { hiddenKcal: null, dataCal: 80 })));
  assert.strictEqual(r.shelledValue, 240);
});
check('disjointness: no item counted in two channels; (c) = finished + unknown + shelled', () => {
  const r = countReturn([fin(10, 100), unk(10, 45), shell(10, 100), mat(5)]);
  assert.strictEqual(r.finished, 1000); assert.strictEqual(r.unknownValue, 450);
  assert.strictEqual(r.shelledValue, 750);
  assert.strictEqual(r.c, 2200); assert.strictEqual(r.wouldC, true);
  assert.strictEqual(r.a, 1450); assert.strictEqual(r.b, 1750);
});
check('materials count 0 in every channel', () => {
  const r = countReturn([mat(20), { name: 'Vine', units: 3, kcalEach: 0, foodState: null, unprocessed: false, finished: false }]);
  assert.strictEqual(r.c, 0); assert.strictEqual(r.materialsUnits, 23);
});
check('carcass / cleaned / needsCooking residual counts 0, reported separately', () => {
  const carcass = { name: 'Deer carcass', units: 1, kcalEach: 5000, foodState: 'carcass', unprocessed: true, finished: false };
  const raw = { name: 'Raw meat', units: 2, kcalEach: 300, foodState: 'cleaned', unprocessed: true, finished: false };
  const r = countReturn([carcass, raw]);
  assert.strictEqual(r.c, 0); assert.strictEqual(r.residualUnprocKcal, 5600);
});
check('nut share of unknown value tracked for the (a)-excluding-nut sensitivity', () => {
  const lump = { name: 'unknown nuts', units: 0, kcalEach: 0, foodState: 'unknown',
    unprocessed: true, finished: false,
    lumpComp: [
      { pid: 'hickory_nut', units: 10, calPerUnit: 100, edibility: 'safe', isNut: true, mustCook: false },
      { pid: 'dandelion', units: 10, calPerUnit: 45, edibility: 'safe', isNut: false, mustCook: false },
    ] };
  const r = countReturn([lump]);
  assert.strictEqual(r.unknownValue, 1450); assert.strictEqual(r.nutUnknownValue, 1000);
  assert.strictEqual(r.aNoNut, 450);
});
check('must-cook share of unknown value tracked for the sensitivity', () => {
  const lump = { name: 'unknown shoots', units: 0, kcalEach: 0, foodState: 'unknown',
    unprocessed: true, finished: false,
    lumpComp: [
      { pid: 'mustcook_x', units: 10, calPerUnit: 80, edibility: 'safe', isNut: false, mustCook: true },
      { pid: 'dandelion', units: 10, calPerUnit: 45, edibility: 'safe', isNut: false, mustCook: false },
    ] };
  const r = countReturn([lump]);
  assert.strictEqual(r.mustCookUnknownValue, 800); assert.strictEqual(r.aNoMustCook, 450);
});
check('missing per-unit value flags incomplete, never zero-fills silently', () => {
  const bad = unk(5, null, { hiddenKcal: null, dataCal: null });
  const r = countReturn([bad]);
  assert.strictEqual(r.incomplete, true);
  assert.ok(r.incompleteReasons.length >= 1);
});
check('empty pack is 0 everywhere, no would-unload', () => {
  const r = countReturn([]);
  assert.strictEqual(r.c, 0); assert.strictEqual(r.wouldC, false);
});

console.log('pure checks: ' + n + '/' + n + ' green');

async function liveControl() {
  // Env contract for the control: same as judged legs, but the seed is
  // 51109 (NON-pilot) and the result is judged only as "recorder works".
  process.env.POLICY = 'competent';
  process.env.COMPETENT_FEAST = '0';
  process.env.SEATDRIVE = '0';
  process.env.PLENTYDEPRI = '0';
  process.env.DEPOSITGATE = '0';
  process.env.DAYS = '30';
  const { oneInstance } = require('./packcomp-b-driver');
  const inst = await oneInstance(51109);
  const live = (inst.homecomings || []).filter((r) => r.overAtEntry === false);
  assert.ok(live.length >= 1, 'live control: expected >=1 live return, got ' + live.length);
  let sawFoodState = false, sawHiddenOrLump = false, sawFinishedFigure = false;
  for (const r of live) {
    assert.ok(r.packBefore && Array.isArray(r.packBefore.items), 'live control: packBefore items missing');
    assert.strictEqual(typeof r.packBefore.finishedKcal, 'number', 'live control: finishedKcal figure missing');
    sawFinishedFigure = true;
    for (const it of r.packBefore.items) {
      if (it.foodState !== undefined && it.foodState !== null) sawFoodState = true;
      if (it.hiddenKcal != null || Array.isArray(it.lumpComp)) sawHiddenOrLump = true;
    }
  }
  assert.ok(sawFoodState, 'live control: no item carried a foodState');
  assert.ok(sawHiddenOrLump, 'live control: no item carried hiddenKcal or a lump composition');
  assert.ok(sawFinishedFigure, 'live control: no finished-pack figure');
  console.log('live control: seed 51109, ' + live.length + ' live returns, foodState + hiddenKcal/lump fields present — PASS');
}

if (process.argv.includes('--live-control')) {
  liveControl().then(() => {
    console.log('test-packcomp-b: ALL GREEN (pure + live control)');
  }).catch((e) => { console.error('LIVE CONTROL FAILED:', e && (e.stack || e)); process.exit(1); });
} else {
  console.log('test-packcomp-b: pure checks GREEN (run --live-control for the live field-capture control)');
}
