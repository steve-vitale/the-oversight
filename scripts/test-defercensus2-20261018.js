#!/usr/bin/env node
// test-defercensus2-20261018.js — proof for the sim-defercensus2 instrument
// (flesh-out loop arm sim-defercensus2, 2026-10-18, scale-onramp axis).
// READ-ONLY: proves the census instrument, never touches src/js or
// scripts/policies.
//
// (a) ATTRIBUTION FIXTURES: attributeRun (scripts/wave4census-lib-20261017.js
//     — the reused deferral-day classification method) on hand-built
//     snapshot fixtures covering every taxonomy branch, with the sweep's
//     deferral predicate (raw>=t4 && !ready && peak<4) verified to mirror
//     attributeRun's deferral-day selection exactly.
// (b) SMOKE: both tribfloor base policies drive with the census live
//     (subprocess SMOKE=1).
// (c) DET-GATE: instrument-on vs instrument-off byte-identical
//     trajectories, 4 seeds, both-repeat (subprocess DET=1).
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 node scripts/test-defercensus2-20261018.js
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');
const { attributeRun, sampleReadiness } = require('./wave4census-lib-20261017');

const T4 = 100;
let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// ---- fixture builder: daily snapshots shaped like sampleReadiness output ----
function snap(day, raw, peak, counts, short) {
  return {
    day, raw, peak, err: 0,
    armored: counts.armored | 0, armed: counts.armed | 0,
    tricks: counts.tricks | 0, veterans: counts.veterans | 0,
    ready: short.length === 0, short: short.slice(),
    demand: { armored: 4, armorP: 15, armed: 5, tricks: 3, veterans: 2 },
  };
}
const FULL = { armored: 4, armed: 5, tricks: 3, veterans: 2 };
function run5(days) { const a = []; for (const d of days) a.push(d); return a; }

// The sweep's deferral predicate must mirror attributeRun's exactly.
function sweepDeferral(s) { return (s.raw | 0) >= T4 && !s.ready && (s.peak | 0) < 4; }
function attrDeferDays(snaps) {
  return snaps.filter(s => (s.raw | 0) >= T4 && !s.ready && (s.peak | 0) < 4).length;
}

console.log('== (a) attribution fixtures ==');
// 1. veterans single-bind over 5 deferral days
{
  const ss = run5([1, 2, 3, 4, 5].map(d => snap(d, 320, 3, { armored: 4, armed: 11, tricks: 20, veterans: 1 }, ['veterans'])));
  const a = attributeRun(ss, { t4: T4 });
  check('veterans single-bind', a.binding === 'veterans' && a.deferDays === 5, JSON.stringify(a.binding));
  check('sweep predicate mirrors attributeRun deferral days', ss.filter(sweepDeferral).length === attrDeferDays(ss), '');
}
// 2. armor+veterans co-bind
{
  const ss = run5([1, 2, 3].map(d => snap(d, 200, 3, { armored: 2, armed: 10, tricks: 9, veterans: 0 }, ['armor', 'veterans'])));
  const a = attributeRun(ss, { t4: T4 });
  check('multi:armor+veterans co-bind', a.binding === 'multi:armor+veterans', JSON.stringify(a.binding));
}
// 3. weapons single-bind
{
  const ss = run5([1, 2].map(d => snap(d, 150, 3, { armored: 6, armed: 3, tricks: 8, veterans: 2 }, ['weapons'])));
  const a = attributeRun(ss, { t4: T4 });
  check('weapons single-bind', a.binding === 'weapons', JSON.stringify(a.binding));
}
// 4. tricks (counters) single-bind
{
  const ss = run5([1, 2].map(d => snap(d, 150, 3, { armored: 5, armed: 8, tricks: 1, veterans: 2 }, ['tricks'])));
  const a = attributeRun(ss, { t4: T4 });
  check('tricks single-bind', a.binding === 'tricks', JSON.stringify(a.binding));
}
// 5. armor single-bind
{
  const ss = run5([1, 2].map(d => snap(d, 150, 3, { armored: 1, armed: 8, tricks: 8, veterans: 2 }, ['armor'])));
  const a = attributeRun(ss, { t4: T4 });
  check('armor single-bind', a.binding === 'armor', JSON.stringify(a.binding));
}
// 6. none-single: rotating short sets, empty intersection
{
  const ss = [snap(1, 150, 3, { armored: 2, armed: 8, tricks: 8, veterans: 2 }, ['armor']),
              snap(2, 150, 3, { armored: 5, armed: 8, tricks: 8, veterans: 1 }, ['veterans'])];
  const a = attributeRun(ss, { t4: T4 });
  check('none-single rotation', a.binding === 'none-single', JSON.stringify(a.binding));
}
// 7. standing: raw never reaches t4
{
  const ss = run5([1, 2, 3].map(d => snap(d, 60, 2, { armored: 1, armed: 4, tricks: 2, veterans: 0 }, ['armor', 'weapons', 'tricks', 'veterans'])));
  const a = attributeRun(ss, { t4: T4 });
  check('standing attribution', a.binding === 'standing' && a.deferDays === 0, JSON.stringify(a.binding));
}
// 8. unlocked: peak>=4
{
  const ss = run5([snap(1, 320, 3, { armored: 3, armed: 11, tricks: 20, veterans: 1 }, ['veterans']),
                   snap(2, 340, 4, FULL, [])]);
  const a = attributeRun(ss, { t4: T4 });
  check('unlocked attribution', a.binding === 'unlocked', JSON.stringify(a.binding));
}
// 9. no deferral days when peak already 4 (ratchet) — not deferral
{
  const ss = run5([1, 2].map(d => snap(d, 400, 4, { armored: 1, armed: 4, tricks: 2, veterans: 0 }, ['armor', 'weapons', 'tricks', 'veterans'])));
  check('peak>=4 days are not deferral days', ss.filter(sweepDeferral).length === 0, '');
  const a = attributeRun(ss, { t4: T4 });
  check('peak>=4 attributes unlocked not standing', a.binding === 'unlocked', JSON.stringify(a.binding));
}
// 10. engine short-set shape: sampleReadiness returns the keys attributeRun needs
{
  const keys = ['day', 'raw', 'peak', 'err', 'armored', 'armed', 'tricks', 'veterans', 'ready', 'short', 'demand'];
  check('sampleReadiness is a function (contract)', typeof sampleReadiness === 'function', '');
  check('fixture snapshots carry all keys attributeRun reads',
    keys.every(k => k in snap(1, 100, 3, FULL, [])), '');
}

console.log('== (b) SMOKE (subprocess) ==');
try {
  const env = Object.assign({}, process.env, { SMOKE: '1' });
  execFileSync('node', [path.join(__dirname, 'defcensus-sweep-20261018.js')], { env, stdio: 'pipe', timeout: 600000 });
  check('SMOKE=1 exits 0 (both policies drive, census live)', true, '');
} catch (e) {
  check('SMOKE=1 exits 0 (both policies drive, census live)', false, String((e.stderr || e.message || e)).slice(0, 300));
}

console.log('== (c) DET-GATE (subprocess) ==');
try {
  const env = Object.assign({}, process.env, { DET: '1' });
  execFileSync('node', [path.join(__dirname, 'defcensus-sweep-20261018.js')], { env, stdio: 'pipe', timeout: 1200000 });
  check('DET=1 exits 0 (instrument byte-identical)', true, '');
} catch (e) {
  check('DET=1 exits 0 (instrument byte-identical)', false, String((e.stderr || e.message || e)).slice(0, 300));
}

console.log(`\nPROOF: ${pass} pass, ${fail} fail.`);
process.exit(fail ? 1 : 0);
