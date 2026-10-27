#!/usr/bin/env node
// test-crisis-r58-instrument.js — PROOF for journey crisis r58 (instrument only).
// Before/after, no game change:
//  (1) DEATH_SAY_RE: r57 literal matches "bloodied but breathing" (via the
//      "died" substring inside "bloodied"); r58 word-boundaried literal does
//      not, while still matching true death lines.
//  (2) lingerBook sorties gate: r58 driver source gates the increment on
//      ret.ok; the old ungated form is absent. The live behavioral proof is
//      seed 9412 in the r58 panel (refused d57 must leave book sorties 0).
// Usage: node scripts/test-crisis-r58-instrument.js
'use strict';
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, 'journey-crisis-r58-delayed-20261027.js'), 'utf8');
let fail = 0;
function check(name, cond) { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name); if (!cond) fail++; }

// (2) gate present, old form absent
check('gate: increment gated on ret.ok', src.includes('if (b && ret && ret.ok) { b.sorties++; b.lastSortieDay = day; }'));
check('gate: old ungated form absent', !src.includes('if (b) { b.sorties++; b.lastSortieDay = day; }'));

// (1) extract the live regex from the driver and test it
const m = /const DEATH_SAY_RE = (\/.+\/[a-z]*);/.exec(src);
check('regex: DEATH_SAY_RE found in driver', !!m);
const re = m ? eval(m[1]) : null; // eslint-disable-line no-eval
const OLD = /didn't come back|carries the body|goes down|fell at|fell in|died|dead|buried|laid to rest|succumbed|didn't make it|mourn|grief|grave/i;
const cases = [
  ['Ella stood down the Flashbulb Moth, 3 rounds, bloodied but breathing', false, true],
  ['Aylin stood down the Redactor, bloodied but breathing', false, true],
  ['Dina faced The Ugly Thing at the treeline, and didn\'t come back', true, true],
  ['Loud-Eyes is dead', true, true],
  ['The village sits with its grief tonight', true, true], // grief alternation unchanged by design
];
for (const [line, wantNew, wantOld] of cases) {
  check('OLD matches "' + line.slice(0, 40) + '..." = ' + wantOld, OLD.test(line) === wantOld);
  check('NEW matches "' + line.slice(0, 40) + '..." = ' + wantNew, re.test(line) === wantNew);
}
if (fail) { console.log('FAILURES: ' + fail); process.exit(1); }
console.log('ALL PASS');
