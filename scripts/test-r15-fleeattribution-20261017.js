#!/usr/bin/env node
// test-r15-fleeattribution-20261017.js — RED->GREEN proof for the r15 blank
// fill: the fleeMidTrick summary must carry fledHopeless/fleeLearn/holdLine
// (the wrapper records them; the old summary mapping dropped them), so the
// design-honest C2'' bar (hopeless-path violations above the 25% hold-line
// floor) is directly measurable.
//
// RED: evidence/2026-10-17/journey-deepening-r15-competent-8805.json as
// written by the pre-fix harness has fleeMidTrick entries WITHOUT
// fledHopeless (verified by assertRed below against a saved snapshot).
// GREEN: after the fix + re-run of seed 8805, the entries carry the flags
// and hopelessOver == 0 (the 2 C2' flags are vBreak-floor withdrawals, not
// hopeless-path violations).
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const J = path.join(ROOT, 'evidence', '2026-10-17', 'journey-deepening-r15-competent-8805.json');

let fail = 0;
function ok(cond, msg) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + msg);
  if (!cond) fail++;
}

const mode = process.argv[2] || 'green';
if (mode === 'red') {
  // RED: the pre-fix JSON must LACK the attribution flags.
  const j = JSON.parse(fs.readFileSync(J, 'utf8'));
  const fm = (((j.counterwire || {}).fleeMidTrick) || []);
  ok(fm.length > 0, 'red: pre-fix run has flee-mid-trick events to attribute (' + fm.length + ')');
  ok(fm.every(f => f.fledHopeless === undefined), 'red: fledHopeless ABSENT from summary (the bug)');
  ok(fm.every(f => f.fleeLearn === undefined), 'red: fleeLearn ABSENT from summary (the bug)');
  ok(!('fleeMidTrickHopelessOver' in (j.counterwire || {})), 'red: fleeMidTrickHopelessOver ABSENT (unmeasurable)');
} else {
  // GREEN: post-fix re-run must carry the flags and show hopelessOver == 0.
  const j = JSON.parse(fs.readFileSync(J, 'utf8'));
  const cw = j.counterwire || {};
  const fm = cw.fleeMidTrick || [];
  ok(fm.length > 0, 'green: re-run has flee-mid-trick events (' + fm.length + ')');
  ok(fm.every(f => typeof f.fledHopeless === 'boolean'), 'green: fledHopeless present on all events');
  ok(fm.every(f => typeof f.fleeLearn === 'boolean'), 'green: fleeLearn present on all events');
  ok(fm.every(f => typeof f.holdLine === 'boolean'), 'green: holdLine present on all events');
  ok('fleeMidTrickHopelessOver' in cw, 'green: fleeMidTrickHopelessOver present');
  ok((cw.fleeMidTrickHopelessOver || []).length === 0,
    'green: hopelessOver == 0 (all >25% flees are floor-path, design-honest)');
  // The 2 previously-flagged events must be floor-path: holdLine beat fired,
  // fledHopeless false.
  const over = cw.fleeMidTrickOver || [];
  ok(over.length === 2, 'green: fleeOver still 2 (same events, re-attributed)');
  ok(over.every(f => f.holdLine === true && f.fledHopeless === false),
    'green: both over-threshold events had the hold-line beat and are NOT hopeless-path');
}
process.exit(fail ? 1 : 0);
