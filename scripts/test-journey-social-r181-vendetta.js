// test-journey-social-r181-vendetta.js — r181 M1 vendetta-cadence tally (Lane B).
// The r180 panel showed Hayden<->Emma arming 6 plots in 16 days (d7-d22),
// each spring re-arming the next within 2-5 days — the grievance loop has
// no dampener. The r180 metric review made this a watch item: if a future
// panel shows the same pair re-arming past 8-10 plots, the loop's
// cooling-off deserves a design look, not a knob. tallyVendetta is the
// instrument for that watch: maxUnordered (both directions count — a feud
// is two-sided) is the judged number, maxDirected the one-sided shape.
// Proof: synthetic pairs + the r180 4-seed corpus as an anchor
// (43603: Hayden<->Emma 6 unordered / 5 directed Hayden->Emma, d7-d22;
// 43601: two reciprocal pairs at 2 each, no pair >= 4).
'use strict';
const fs = require('fs'), path = require('path');
const { tallyVendetta } = require('./journey-social-r181-helpers');

let pass = 0, fail = 0;
function check(name, got, want) {
  if (got === want) { pass++; console.log('PASS ' + name + ' (' + got + ')'); }
  else { fail++; console.log('FAIL ' + name + ' got=' + JSON.stringify(got) + ' want=' + JSON.stringify(want)); }
}
const arm = (day, leader, target) => ({ day, leader, target });

// 1. Empty input: nothing armed, maxes 0, no pairs.
let r = tallyVendetta([]);
check('empty: total', r.total, 0);
check('empty: maxUnordered', r.maxUnordered, 0);
check('empty: maxDirected', r.maxDirected, 0);
check('empty: pairsGte4', r.pairsGte4.length, 0);

// 2. One-sided pair: directed and unordered agree.
r = tallyVendetta([arm(3, 'A', 'B'), arm(5, 'A', 'B'), arm(9, 'A', 'B')]);
check('one-sided: total', r.total, 3);
check('one-sided: maxDirected', r.maxDirected, 3);
check('one-sided: maxUnordered', r.maxUnordered, 3);
check('one-sided: topDirected pair', r.topDirected[0].pair, 'A->B');
check('one-sided: pairsGte4', r.pairsGte4.length, 0);

// 3. Two-sided feud: unordered counts both directions, directed splits.
r = tallyVendetta([arm(7, 'Hayden', 'Emma'), arm(9, 'Emma', 'Hayden'), arm(11, 'Hayden', 'Emma'), arm(16, 'Hayden', 'Emma'), arm(20, 'Hayden', 'Emma')]);
check('feud: total', r.total, 5);
check('feud: maxUnordered', r.maxUnordered, 5);
check('feud: maxDirected', r.maxDirected, 4);
check('feud: topUnordered pair', r.topUnordered[0].pair, 'Emma<->Hayden');
check('feud: topDirected pair', r.topDirected[0].pair, 'Hayden->Emma');
check('feud: pairsGte4', r.pairsGte4.length, 1);
check('feud: pair span', r.pairsGte4[0].spanDays, 13);
check('feud: pair firstDay', r.pairsGte4[0].firstDay, 7);
check('feud: pair lastDay', r.pairsGte4[0].lastDay, 20);

// 4. Corpus anchor: the r180 4-seed panel armEvents.
const DIR = path.join(__dirname, '..', 'evidence', '2026-11-11');
let allArms = [];
for (const seed of [43601, 43602, 43603, 43604]) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, `journey-social-life-r180-${seed}.json`), 'utf8'));
  allArms.push(...(d.armEvents || []));
}
r = tallyVendetta(allArms);
check('r180 corpus: total', r.total, 10);
check('r180 corpus: maxUnordered', r.maxUnordered, 6);
check('r180 corpus: maxDirected', r.maxDirected, 5);
check('r180 corpus: topUnordered pair', r.topUnordered[0].pair, 'Emma<->Hayden');
check('r180 corpus: topDirected pair', r.topDirected[0].pair, 'Hayden->Emma');
check('r180 corpus: pairsGte4', r.pairsGte4.length, 1);
check('r180 corpus: pair span', r.pairsGte4[0].spanDays, 15);
check('r180 corpus: pair firstDay', r.pairsGte4[0].firstDay, 7);
check('r180 corpus: pair lastDay', r.pairsGte4[0].lastDay, 22);

// 5. Per-seed anchor: 43601 has no pair >= 4 (two reciprocal pairs at 2).
const d43601 = JSON.parse(fs.readFileSync(path.join(DIR, 'journey-social-life-r180-43601.json'), 'utf8'));
r = tallyVendetta(d43601.armEvents || []);
check('43601: total', r.total, 4);
check('43601: maxUnordered', r.maxUnordered, 2);
check('43601: pairsGte4', r.pairsGte4.length, 0);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
