#!/usr/bin/env node
// test-latework-creek-a.js — fixture proof for sim-latework-creek-a
// (2026-11-04, flesh-out loop, axis food-economy): the late-work
// narration line must name the place the work actually happened,
// never a hardcoded creek, and the genuine creek line must stay
// byte-identical. Tests the exported lateWorkPlace helper from
// scripts/policies/bankfood-diag.js with stub Games — no sim, no
// Game eval, no repo writes. Exit nonzero on any failure.
'use strict';
const fs = require('fs');
const path = require('path');
const { lateWorkPlace } = require('./policies/bankfood-diag');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function lineFor(wp, g, f) {
  return wp.phrase
    ? `You work late ${wp.phrase} — ${g} deadfall gathers and ${f} forages — until the night is too far gone for real sleep.`
    : `You work late — ${g} deadfall gathers and ${f} forages — until the night is too far gone for real sleep.`;
}
const stub = (type) => ({ playerTile: () => ({ type }) });
const OLD_CREEK = 'You work late at the creek — 2 deadfall gathers and 0 forages — until the night is too far gone for real sleep.';

// (b) genuine creek evening: byte-identical old line.
check('creek line byte-identical', lineFor(lateWorkPlace(stub('creek'), null), 2, 0) === OLD_CREEK,
  lineFor(lateWorkPlace(stub('creek'), null), 2, 0));

// (a) forest_floor evening: no creek, names the forest floor.
const ff = lateWorkPlace(stub('forest_floor'), null);
check('forest_floor no creek', !lineFor(ff, 2, 0).includes('creek'), lineFor(ff, 2, 0));
check('forest_floor names place', lineFor(ff, 2, 0) === 'You work late on the forest floor — 2 deadfall gathers and 0 forages — until the night is too far gone for real sleep.', lineFor(ff, 2, 0));

// Every other non-creek terrain: phrase present, no 'creek' anywhere.
const expected = {
  grove: 'in the grove', meadow: 'in the meadow', thicket: 'in the thicket',
  wetland: 'at the wetland', trail_edge: 'on the old trail', ruin: 'at the old place',
  haven: 'at Haven', building: 'at the building', street: 'on the old street',
  plaza: 'on the old plaza', cache: 'at a buried cache',
};
for (const [ty, phrase] of Object.entries(expected)) {
  const wp = lateWorkPlace(stub(ty), null);
  check(ty + ' phrase', wp.phrase === phrase && wp.type === ty, JSON.stringify(wp));
  check(ty + ' no creek', !lineFor(wp, 1, 3).includes('creek'), lineFor(wp, 1, 3));
}

// Fallback: null tile falls back to evening-start type; no fallback -> neutral.
const fb = lateWorkPlace({ playerTile: () => null }, 'forest_floor');
check('fallback to evening-start tile', fb.phrase === 'on the forest floor' && fb.type === 'forest_floor', JSON.stringify(fb));
const neutral = lateWorkPlace({ playerTile: () => null }, null);
check('neutral no-place line', neutral.phrase === '' && neutral.type === null
  && lineFor(neutral, 0, 3) === 'You work late — 0 deadfall gathers and 3 forages — until the night is too far gone for real sleep.', lineFor(neutral, 0, 3));

// Throwing / missing playerTile never throws and never names a wrong place.
const thr = lateWorkPlace({ playerTile: () => { throw new Error('boom'); } }, 'meadow');
check('throwing playerTile falls back', thr.phrase === 'in the meadow', JSON.stringify(thr));
const miss = lateWorkPlace({}, null);
check('missing playerTile neutral', miss.phrase === '' && miss.type === null, JSON.stringify(miss));

// (c) no other narration line changed: the policy source carries
// exactly one hardcoded 'at the creek' — the map entry itself — and
// no second late-work template.
const src = fs.readFileSync(path.join(__dirname, 'policies', 'bankfood-diag.js'), 'utf8');
const mapHits = (src.match(/creek: 'at the creek'/g) || []).length;
check('single creek map entry', mapHits === 1, 'hits=' + mapHits);
const oldTemplate = (src.match(/You work late at the creek/g) || []).length;
check('old hardcoded template gone', oldTemplate === 0, 'hits=' + oldTemplate);
const lateTemplates = (src.match(/You work late/g) || []).length;
check('exactly two late-work templates (phrase + neutral branches)', lateTemplates === 2, 'hits=' + lateTemplates);

console.log(`\nlatework-creek-a fixture: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
