// Proof test for the r121 presshop analyzer (Q1 double-press + Q2 detouring hop).
// Runs the REAL analyzer (child process) on (a) synthetic before/after
// fixture corpora and (b) the r120 landing corpus as calibration, and
// asserts the Q1/Q2 counts.
//   Fixtures (one census file per corpus):
//   BEFORE — the r120 shape: two evening nodes, each press 0 ok with
//     pressYield 0 and green3x3After 0, each followed by a failed press 1
//     (strippedSecondFails 2, pressFailEvening 2); a third node with a
//     yielding press 0 (pressYield 250 — the loop breaks, no press 1);
//     one evening-blocked line with two far nodes unreached
//     "(0,0,d4,s47):unreached; (0,1,d4,s42):unreached" and hopDetail: one
//     H-ROUTE (block named, ticks left) + one H-OTHER.
//   AFTER — the r121 shape: press 0 ok, 0 yield, green3x3After 0, then a
//     'together-stopped' (no press 1 — the fix firing); a yielding press 0
//     on the next node; a species-less corner (press 0 ok, 0 yield,
//     green3x3After 2, press 1 fails — counts as a press fail but NOT a
//     stripped second fail); one evening-blocked line with one far node
//     unreached and hopDetail: one H-ROUTE + one reached detour hop
//     (10 steps for a Manhattan-8 walk home→(0,0)).
//   Calibration (r120 corpus, reported never re-scored — the r120 panel
//   verdicts stand): pressFailEvening 7, pressFailTotal 7,
//   togetherStopped 0, strippedSecondFails 0 (the r120 driver records no
//   press/pressYield/green3x3After fields, so the stripped shape is
//   UNMEASURED there, not zero), farUnreached 11, nearUnreached 4.
// Usage: node scripts/test-landing-r121-presshop.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');

const ANALYZER = path.join(__dirname, 'analyze-landing-r121-presshop.js');
const GOAL = path.join(process.env.HOME || '/home/hatch',
  'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-09');

function runAnalyzer(dir) {
  return execSync(`node ${ANALYZER} ${dir}`, { encoding: 'utf8' });
}
function runPair(beforeDir, afterDir) {
  return execSync(`node ${ANALYZER} ${beforeDir} ${afterDir}`, { encoding: 'utf8' });
}
function section(out, label) {
  const start = out.indexOf('=== ' + label);
  assert(start >= 0, 'no ' + label + ' section');
  const end = out.indexOf('\n=== ', start + 1);
  return out.slice(start, end < 0 ? undefined : end);
}
function num(sec, key) {
  const m = new RegExp('\\b' + key + '=(\\d+)').exec(sec);
  assert(m, 'no ' + key + ' in section');
  return +m[1];
}
function census(seed, attempts) {
  return {
    seed,
    r41Summary: { outingAttempts: attempts || [] },
  };
}
function writeCorpus(dir, seed, c) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `journey-landing-r62-census-${seed}.json`), JSON.stringify(c));
}

// (a) Synthetic fixtures: BEFORE and AFTER corpora, one seed each.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'presshop-r121-'));
const beforeDir = path.join(tmp, 'before');
const afterDir = path.join(tmp, 'after');

// BEFORE: the r120 shape (seed 99981).
{
  const c = census(99981, [
    { day: 12, vid: 'mara', name: 'Mara', kind: 'together', via: 'evening', ok: true, line: 'shrugs, hands empty', forageCount: 1, playerKcal: 0, partnerKcal: 0, node: { x: 6, y: 1, d: 4, stock: 35, green: 35, green3x3: 2 }, press: 0, pressYield: 0, green3x3After: 0 },
    { day: 12, vid: 'mara', name: 'Mara', kind: 'together', via: 'evening', ok: false, line: 'This patch has nothing left to give right now.', forageCount: 1, playerKcal: 0, partnerKcal: 0, node: { x: 6, y: 1, d: 4, stock: 35, green: 35, green3x3: 2 }, press: 1, pressYield: 0, green3x3After: 0 },
    { day: 12, vid: 'mara', name: 'Mara', kind: 'together', via: 'evening', ok: true, line: 'shrugs, hands empty', forageCount: 2, playerKcal: 0, partnerKcal: 0, node: { x: 4, y: 0, d: 4, stock: 36, green: 36, green3x3: 3 }, press: 0, pressYield: 0, green3x3After: 0 },
    { day: 12, vid: 'mara', name: 'Mara', kind: 'together', via: 'evening', ok: false, line: 'This patch has nothing left to give right now.', forageCount: 2, playerKcal: 0, partnerKcal: 0, node: { x: 4, y: 0, d: 4, stock: 36, green: 36, green3x3: 3 }, press: 1, pressYield: 0, green3x3After: 0 },
    { day: 12, vid: 'mara', name: 'Mara', kind: 'together', via: 'evening', ok: true, line: 'holds up their share', forageCount: 3, playerKcal: 130, partnerKcal: 120, node: { x: 8, y: 6, d: 4, stock: 45, green: 46, green3x3: 2 }, press: 0, pressYield: 250, green3x3After: 0 },
    { day: 13, vid: 'xavier', name: 'Xavier', kind: 'evening-blocked', via: 'evening', ok: false, line: '(0,0,d4,s47):unreached; (0,1,d4,s42):unreached', hopDetail: [
      { node: { x: 0, y: 0, d: 4, stock: 47 }, tx: 0, ty: 0, from: { x: 4, y: 4 }, reached: false, steps: 4, blocked: { kind: 'blockage', blockType: 'creek' }, dayPartBefore: 2, dayPartAfter: 2, ticksLeftBefore: 90 },
      { node: { x: 0, y: 1, d: 4, stock: 42 }, tx: 0, ty: 1, from: { x: 4, y: 4 }, reached: false, steps: 3, blocked: null, dayPartBefore: 2, dayPartAfter: 2, ticksLeftBefore: 90 },
    ] },
  ]);
  writeCorpus(beforeDir, 99981, c);
}

// AFTER: the r121 shape (seed 99981, same seed — matched before/after).
{
  const c = census(99981, [
    { day: 12, vid: 'mara', name: 'Mara', kind: 'together', via: 'evening', ok: true, line: 'shrugs, hands empty', forageCount: 1, playerKcal: 0, partnerKcal: 0, node: { x: 6, y: 1, d: 4, stock: 35, green: 35, green3x3: 2 }, press: 0, pressYield: 0, green3x3After: 0 },
    { day: 12, vid: 'mara', name: 'Mara', kind: 'together-stopped', via: 'evening', ok: false, line: 'patch stripped by first press — second press cannot yield', node: { x: 6, y: 1, d: 4, stock: 35, green: 35, green3x3: 0 } },
    { day: 12, vid: 'mara', name: 'Mara', kind: 'together', via: 'evening', ok: true, line: 'holds up their share', forageCount: 2, playerKcal: 130, partnerKcal: 120, node: { x: 4, y: 0, d: 4, stock: 36, green: 36, green3x3: 3 }, press: 0, pressYield: 250, green3x3After: 0 },
    // Species-less corner: press 0 ok, 0 yield, but green3x3After 2 — the
    // driver presses again; the fail is real but NOT a stripped second fail.
    { day: 13, vid: 'xavier', name: 'Xavier', kind: 'together', via: 'evening', ok: true, line: 'shrugs, hands empty', forageCount: 1, playerKcal: 0, partnerKcal: 0, node: { x: 8, y: 6, d: 4, stock: 45, green: 46, green3x3: 2 }, press: 0, pressYield: 0, green3x3After: 2 },
    { day: 13, vid: 'xavier', name: 'Xavier', kind: 'together', via: 'evening', ok: false, line: 'This patch has nothing left to give right now.', forageCount: 1, playerKcal: 0, partnerKcal: 0, node: { x: 8, y: 6, d: 4, stock: 45, green: 46, green3x3: 2 }, press: 1, pressYield: 0, green3x3After: 2 },
    { day: 13, vid: 'xavier', name: 'Xavier', kind: 'evening-blocked', via: 'evening', ok: false, line: '(0,0,d4,s47):unreached', hopDetail: [
      { node: { x: 0, y: 0, d: 4, stock: 47 }, tx: 0, ty: 0, from: { x: 4, y: 4 }, reached: false, steps: 6, blocked: { kind: 'blockage', blockType: 'creek' }, dayPartBefore: 2, dayPartAfter: 2, ticksLeftBefore: 70 },
      { node: { x: 0, y: 1, d: 4, stock: 42 }, tx: 0, ty: 1, from: { x: 4, y: 4 }, reached: true, steps: 10, blocked: null, dayPartBefore: 2, dayPartAfter: 2, ticksLeftBefore: 70 },
    ] },
  ]);
  writeCorpus(afterDir, 99981, c);
}

const pairOut = runPair(beforeDir, afterDir);
const beforeSec = section(pairOut, 'BEFORE');
const afterSec = section(pairOut, 'AFTER');
assert.strictEqual(num(beforeSec, 'pressFailEvening'), 2, 'fixtures BEFORE: pressFailEvening 2');
assert.strictEqual(num(beforeSec, 'strippedSecondFails'), 2, 'fixtures BEFORE: strippedSecondFails 2');
assert.strictEqual(num(beforeSec, 'togetherStopped'), 0, 'fixtures BEFORE: togetherStopped 0');
assert.strictEqual(num(beforeSec, 'farUnreached'), 2, 'fixtures BEFORE: farUnreached 2');
assert(beforeSec.includes('H-ROUTE:1 H-HOP:0 H-GUARD:0 H-OTHER:1'), 'fixtures BEFORE: hop classes H-ROUTE:1 H-OTHER:1');
assert.strictEqual(num(afterSec, 'pressFailEvening'), 1, 'fixtures AFTER: pressFailEvening 1');
assert.strictEqual(num(afterSec, 'strippedSecondFails'), 0, 'fixtures AFTER: strippedSecondFails 0');
assert.strictEqual(num(afterSec, 'togetherStopped'), 1, 'fixtures AFTER: togetherStopped 1');
assert.strictEqual(num(afterSec, 'speciesLessCorner'), 1, 'fixtures AFTER: speciesLessCorner 1');
assert.strictEqual(num(afterSec, 'farUnreached'), 1, 'fixtures AFTER: farUnreached 1');
assert(afterSec.includes('H-ROUTE:1 H-HOP:0 H-GUARD:0 H-OTHER:0'), 'fixtures AFTER: hop classes H-ROUTE:1 only');
assert.strictEqual(num(afterSec, 'detourReached'), 1, 'fixtures AFTER: detourReached 1');
assert(pairOut.includes('Q1: DOUBLE-PRESS-STOP-WORKS'), 'fixtures: Q1 verdict line');
assert(pairOut.includes('Q2: DETOUR-HELPS'), 'fixtures: Q2 verdict line');
console.log('fixtures: PASS (BEFORE 2 fails/2 stripped/2 far-unreached; AFTER 1 fail/0 stripped/1 stopped/1 species-less/1 far-unreached/1 detour)');

// (b) Calibration on the r120 corpus (pre-r121 driver: no press fields, no
// together-stopped, no hopDetail — the stripped shape is UNMEASURED there).
{
  const out = runAnalyzer(path.join(GOAL, 'landing-r120'));
  const sec = section(out, 'BEFORE');
  assert.strictEqual(num(sec, 'pressFailEvening'), 7, 'r120 calibration: pressFailEvening 7');
  assert.strictEqual(num(sec, 'pressFailTotal'), 7, 'r120 calibration: pressFailTotal 7');
  assert.strictEqual(num(sec, 'togetherStopped'), 0, 'r120 calibration: togetherStopped 0');
  assert.strictEqual(num(sec, 'strippedSecondFails'), 0, 'r120 calibration: strippedSecondFails 0 (no press fields — unmeasured, not zero)');
  assert.strictEqual(num(sec, 'farUnreached'), 11, 'r120 calibration: farUnreached 11');
  assert.strictEqual(num(sec, 'nearUnreached'), 4, 'r120 calibration: nearUnreached 4');
}

fs.rmSync(tmp, { recursive: true, force: true });
console.log('test-landing-r121-presshop: PASS (fixtures + r120 corpus)');
