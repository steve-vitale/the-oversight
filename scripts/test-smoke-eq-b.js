#!/usr/bin/env node
// test-smoke-eq-b.js — proof for the sim-smoke-eq-b prereg (DIAG only).
//
// sim-smoke-eq-b, 2026-10-26, oversight-flesh-out-loop-b.
// Asserts every prereg leg in pilot mode; with --confirm it
// asserts the confirm legs against the 9780-9795 corpora.
// Exit 0 iff every asserted leg passes; exit 1 names the
// failing legs. The failures ARE the verdict when they occur:
// the proof encodes the prereg, and a miss is NO-GO, never
// re-scored.
//
// Usage:
//   node scripts/test-smoke-eq-b.js
//   node scripts/test-smoke-eq-b.js --confirm
'use strict';
const { execSync } = require('child_process');
const path = require('path');
const { analyze } = require('./analyze-smoke-eq-b');

const PIN = 'a02b0c8f2';
const PIN_PATHS = [
  'src/', 'index.html', 'scripts/sim-harness.js',
  'scripts/sweep-stockdoor-b.js', 'scripts/sweep-mealdraw-b.js',
  'scripts/mealdraw-capture.js', 'scripts/stockdoor-capture.js',
  'scripts/substrate-capture.js', 'scripts/inflow-capture.js',
  'scripts/preservesched-resid-capture.js',
  'scripts/substrate-days.js', 'scripts/inflow-days.js',
  'scripts/plainvoice-capture.js', 'scripts/policies/',
];
const BASE = path.join(__dirname, '..', 'evidence', '2026-10-26');
const CONFIRM = process.argv.includes('--confirm');

function git(args) {
  return execSync('git ' + args, { cwd: path.join(__dirname, '..'), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}
function check(name, ok, detail) {
  console.log((ok ? 'PASS' : 'FAIL') + ' leg-' + name + (detail ? ' — ' + detail : ''));
  return ok;
}
let failures = 0;
function leg(name, ok, detail) {
  if (!check(name, ok, detail)) failures++;
}

// Leg 0: base pin (three-point design; this run checks at proof time).
try {
  const ancestor = git('merge-base --is-ancestor ' + PIN + ' HEAD && echo YES || echo NO').trim();
  const diff = git('diff ' + PIN + ' HEAD -- ' + PIN_PATHS.join(' ')).trim();
  const status = git('status --short -- ' + PIN_PATHS.join(' ')).trim();
  leg('0-pin', ancestor === 'YES' && diff === '' && status === '',
    'ancestor=' + ancestor + ' diffLines=' + (diff ? diff.split('\n').length : 0) + ' dirtyPaths=' + (status ? status.split('\n').length : 0));
} catch (e) {
  leg('0-pin', false, 'git check threw: ' + (e.message || e));
}

const controlDir = path.join(BASE, CONFIRM ? 'sim-smoke-eq-b-confirm-control-corpus' : 'sim-smoke-eq-b-control-corpus');
const judgedDir = path.join(BASE, CONFIRM ? 'sim-smoke-eq-b-confirm-corpus' : 'sim-smoke-eq-b-corpus');
let out = null;
try {
  out = analyze({ controlDir, judgedDir, focusSeed: CONFIRM ? 0 : 9750 });
} catch (e) {
  console.log('FAIL analyzer — ' + (e.message || e));
  process.exit(1);
}

if (!CONFIRM) {
  leg('1-control', out.controlGatePass && out.controlFiles === 8,
    'files=' + out.controlFiles + ' truncBad=' + JSON.stringify(out.controlTruncBad));
  leg('2-determinism', out.determinism.pass && out.determinism.seeds.length === 8,
    'mismatches=' + JSON.stringify(out.determinism.mismatches));
  const f = out.focus || {};
  leg('3-windows', !!f.allClosed,
    'checkable=' + (f.checkable || 0) + ' open=' + JSON.stringify((f.open || []).map(w => w.day + ':' + w.residual3)));
  leg('4-residuals', out.leg4Pass,
    JSON.stringify(out.leg4.map(x => ({ seed: x.seed, day: x.day, coveringDay: x.coveringDay, pass: x.pass, residual3: x.covering ? x.covering.residual3 : null }))));
  const w = (f.workedDay29 || {});
  const workedOk = w.surplusFresh === 1400 && w.surplusPreserved === 1120 && w.totalKept === 1737;
  leg('5-crosschecks', out.crossChecks.pass && workedOk,
    'mealCall=' + out.crossChecks.mealCallChecked + '/' + out.crossChecks.mealCallMismatchTotal +
    ' spoil=' + out.crossChecks.spoilChecked + '/' + out.crossChecks.spoilMismatchTotal +
    ' truncBad=' + JSON.stringify(out.crossChecks.truncBad) +
    ' smokeTruncBad=' + JSON.stringify(out.crossChecks.smokeTruncBad) +
    ' ctxMismatch=' + out.judgedInstrument.ctxMismatch +
    ' residJoinMiss=' + out.judgedInstrument.residJoinMiss +
    ' workedDay29: recs=' + (w.recs ? w.recs.length : 0) +
    ' surplusFresh=' + w.surplusFresh + ' surplusPreserved=' + w.surplusPreserved +
    ' totalKept=' + w.totalKept + ' totalPreserved=' + w.totalPreserved);
  console.log('generalized windows: ' + out.generalized.total + ' checkable, ' + out.generalized.open.length + ' open (three-term)');
  for (const ow of out.generalized.open.slice(0, 30)) {
    console.log('  OPEN seed=' + ow.seed + ' day=' + ow.day + ' gross=' + ow.gross + ' surviving=' + ow.surviving + ' draws=' + ow.draws + ' smokeFresh=' + ow.smokeFresh + ' residual3=' + ow.residual3);
  }
  console.log('wall judged:', JSON.stringify(out.wallJudged));
  console.log('wall control:', JSON.stringify(out.wallControl));
} else {
  leg('6a-neutrality', out.determinism.pass && out.determinism.seeds.length === 16,
    'mismatches=' + JSON.stringify(out.determinism.mismatches));
  leg('6b-crosschecks', out.crossChecks.pass,
    'mealCall=' + out.crossChecks.mealCallChecked + '/' + out.crossChecks.mealCallMismatchTotal +
    ' spoil=' + out.crossChecks.spoilChecked + '/' + out.crossChecks.spoilMismatchTotal +
    ' truncBad=' + JSON.stringify(out.crossChecks.truncBad));
  leg('6c-windows', out.generalized.allClosed && out.generalized.total >= 8,
    'checkable=' + out.generalized.total + ' open=' + out.generalized.open.length);
  for (const ow of out.generalized.open.slice(0, 30)) {
    console.log('  OPEN seed=' + ow.seed + ' day=' + ow.day + ' residual3=' + ow.residual3);
  }
  console.log('wall judged:', JSON.stringify(out.wallJudged));
}

if (failures) {
  console.log('RESULT: ' + failures + ' leg(s) FAILED');
  process.exit(1);
}
console.log('RESULT: all asserted legs PASS');
