#!/usr/bin/env node
// PROOF (journey social r172, 2026-11-10): double-confession tally.
// The r172 driver wraps Game.confrontDoubt / Game.confrontTheft and
// records {sitting, vid, day, method, outcome} per call; tallyConfessions
// groups 'confessed' outcomes by sitting. A sitting with >=2 confessed
// outcomes is a double confession — two DIFFERENT secrets confessed in
// one sitting (the stale-doubt guard returns 'already-confessed' for
// the SAME lie, so a second 'confessed' in one sitting is always a
// second secret). Deflects, attacks, clears and already-confessed
// outcomes never count. Confessions fired outside a driven conversation
// (sitting null) are reported as outsideSittingConfessed and never
// grouped into a double.
// RED: run against a helpers file without tallyConfessions (require
// fails) or with the pre-fix tally that groups 'outside' events into
// a double (case 5 fails).
// GREEN: all fixture assertions pass.
// Usage: node scripts/test-journey-social-r172-confess.js
'use strict';
const { tallyConfessions } = require('./journey-social-r172-helpers');
let failures = 0;
const fail = (m) => { console.error(`FAIL: ${m}`); failures++; };
const eq = (got, want, what) => { if (got !== want) fail(`${what}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); };
const ok = (cond, what) => { if (!cond) fail(what); };

// (1) Empty input: all zeros, no crash.
const empty = tallyConfessions([]);
eq(empty.total, 0, 'empty total');
eq(empty.confessed, 0, 'empty confessed');
eq(empty.doubleSittings, 0, 'empty doubles');

// (2) One sitting, two confessions, different methods (identity lie +
// theft — the Arlo r167 shape): a double.
const arlo = tallyConfessions([
  { day: 41, sitting: 7, vid: 'arlo', tag: 'C-friendship', method: 'confrontTheft', outcome: 'confessed' },
  { day: 41, sitting: 7, vid: 'arlo', tag: 'C-friendship', method: 'confrontDoubt', outcome: 'confessed' },
]);
eq(arlo.total, 2, 'arlo total');
eq(arlo.confessed, 2, 'arlo confessed');
eq(arlo.doubleSittings, 1, 'arlo doubles');
eq(arlo.doubles.length, 1, 'arlo doubles rows');
eq(arlo.doubles[0].count, 2, 'arlo double count');
eq(arlo.doubles[0].sitting, 's7', 'arlo double sitting');
eq(arlo.doubles[0].vid, 'arlo', 'arlo double vid');
ok(arlo.doubles[0].methods.includes('confrontDoubt') && arlo.doubles[0].methods.includes('confrontTheft'), 'arlo double methods');

// (3) Two sittings, one confession each: no double.
const twoSingles = tallyConfessions([
  { day: 10, sitting: 1, vid: 'a', tag: 'C-friendship', method: 'confrontDoubt', outcome: 'confessed' },
  { day: 12, sitting: 2, vid: 'b', tag: 'D-talk-request', method: 'confrontTheft', outcome: 'confessed' },
]);
eq(twoSingles.doubleSittings, 0, 'two singles doubles');
eq(twoSingles.singleSittings, 2, 'two singles singleSittings');
eq(twoSingles.sittingsWithConfession, 2, 'two singles sittingsWithConfession');

// (4) One confession + deflect + already-confessed in one sitting:
// still a single (non-confessed outcomes never count).
const mixed = tallyConfessions([
  { day: 20, sitting: 3, vid: 'c', tag: 'C-friendship', method: 'confrontDoubt', outcome: 'confessed' },
  { day: 20, sitting: 3, vid: 'c', tag: 'C-friendship', method: 'confrontDoubt', outcome: 'deflected' },
  { day: 20, sitting: 3, vid: 'c', tag: 'C-friendship', method: 'confrontDoubt', outcome: 'already-confessed' },
  { day: 20, sitting: 3, vid: 'c', tag: 'C-friendship', method: 'confrontDoubt', outcome: 'pressed' },
]);
eq(mixed.confessed, 1, 'mixed confessed');
eq(mixed.doubleSittings, 0, 'mixed doubles');
eq(mixed.byOutcome.deflected, 1, 'mixed byOutcome deflected');
eq(mixed.byOutcome['already-confessed'], 1, 'mixed byOutcome already-confessed');

// (5) Two confessions fired OUTSIDE any driven conversation (sitting
// null): reported, never grouped into a double.
const outside = tallyConfessions([
  { day: 30, sitting: null, vid: 'd', tag: null, method: 'confrontDoubt', outcome: 'confessed' },
  { day: 31, sitting: null, vid: 'e', tag: null, method: 'confrontTheft', outcome: 'confessed' },
]);
eq(outside.confessed, 2, 'outside confessed');
eq(outside.doubleSittings, 0, 'outside doubles');
eq(outside.outsideSittingConfessed, 2, 'outside outsideSittingConfessed');
eq(outside.sittingsWithConfession, 1, 'outside sittingsWithConfession counts the outside bucket once');

// (6) Three confessions in one sitting: one double row, count 3.
const triple = tallyConfessions([
  { day: 50, sitting: 9, vid: 'f', tag: 'C-friendship', method: 'confrontDoubt', outcome: 'confessed' },
  { day: 50, sitting: 9, vid: 'f', tag: 'C-friendship', method: 'confrontTheft', outcome: 'confessed' },
  { day: 50, sitting: 9, vid: 'f', tag: 'C-friendship', method: 'confrontDoubt', outcome: 'confessed' },
]);
eq(triple.doubleSittings, 1, 'triple doubles');
eq(triple.doubles[0].count, 3, 'triple double count');

// (7) Null/undefined input: no crash, all zeros.
const nil = tallyConfessions(null);
eq(nil.total, 0, 'null total');
eq(nil.doubleSittings, 0, 'null doubles');

if (failures) { console.error(`test-journey-social-r172-confess: ${failures} FAILURE(S)`); process.exit(1); }
console.log('test-journey-social-r172-confess: ALL PASS');
