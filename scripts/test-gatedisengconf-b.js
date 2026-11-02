#!/usr/bin/env node
// test-gatedisengconf-b.js — PURE proof test for
// sim-gatedisengconf-b (re-qualification band 76701-76712).
// Synthetic series ONLY: no judged seeds (no 76701-76712, no
// 52201-52212, no 51608, no 52101-52108), no judged
// trajectories. Synthetic seed numbers are 999xx, invented.
// Run: node scripts/test-gatedisengconf-b.js
// Must run AFTER the prereg commit and BEFORE any judged
// application of the confirm analyzers. Proves the carried
// (c) rule's boundaries that the 522 confirm never exercised
// (it fired zero times): the exact-10% boundary, the
// fall-window-must-start-at-or-after-S rule, the day-8
// floor, repeat evenings vs one warning per stretch, and
// the carried verdict bars on synthetic bands.
'use strict';
const assert = require('assert');
const { analyzeSeedConfirm, summarizeConfirm, confirmVerdict } = require('./analyze-gatediseng-confirm-b');

// Rows: [loopDay, pantry, engaged] — freshDays/streak/gateOn
// filled with disengaged-plausible values (fresh 3, streak 0).
function mkSeed(seedNum, rows, opts) {
  const o = opts || {};
  return {
    seed: seedNum,
    endReason: o.endReason || 'survived',
    days: 30,
    daysAlive: o.daysAlive != null ? o.daysAlive : 30,
    deaths: o.deaths || [],
    rows: rows.map(([loopDay, pantryKcal, gateEngaged]) => ({
      loopDay, pantryKcal, freshDays: 3.0, hungryStreak: 0,
      gateEngaged, gateOn: true,
    })),
  };
}
let n = 0;
function check(name, fn) { fn(); n++; console.log('ok ' + n + ' - ' + name); }

// Firing shape used by several checks: day 7 engaged 21000;
// S = 8 at 20000; falls 19500, 19000, 18000 (day 11).
function firingShape() {
  return [
    [7, 21000, true], [8, 20000, false], [9, 19500, false],
    [10, 19000, false], [11, 18000, false],
  ];
}
function quietShape() {
  // Gate never stands down: no stretch, no firing.
  return [[7, 21000, true], [8, 20000, true], [9, 19500, true], [10, 19000, true], [11, 18000, true]];
}

check('exact-10% fall fires (D == 0.90 * S)', () => {
  const a = analyzeSeedConfirm(mkSeed(99991, firingShape()));
  assert.strictEqual(a.firstFiringDay, 11);
  assert.strictEqual(a.crossCheckMismatch, false);
});

check('just above the 10% line does not fire (D == 0.90 * S + 1)', () => {
  const rows = [
    [7, 21000, true], [8, 20000, false], [9, 19500, false],
    [10, 19000, false], [11, 18001, false],
  ];
  const a = analyzeSeedConfirm(mkSeed(99992, rows));
  assert.strictEqual(a.firstFiringDay, null);
});

check('fall window starting before S does not fire, even at exactly 10%', () => {
  // Falls: 7->8 (engaged->stand-down), 8->9, 9->10; D = 10,
  // D-3 = 7 < S = 8, so the window is disqualified even
  // though D (18000) == 0.90 * S-pantry (20000).
  const rows = [
    [7, 25000, true], [8, 20000, false], [9, 19000, false],
    [10, 18000, false],
  ];
  const a = analyzeSeedConfirm(mkSeed(99993, rows));
  assert.strictEqual(a.firstFiringDay, null);
});

check('day-8 floor: shape ending before day 8 does not fire', () => {
  // S = 5 at 20000, falls to 18000 on day 8? No: D must be
  // >= 8 AND D-3 >= S. S = 4, falls days 5-7 ending day 7:
  // D = 7 < 8, so no fire even at exactly 10%.
  const rows = [
    [3, 21000, true], [4, 20000, false], [5, 19500, false],
    [6, 19000, false], [7, 18000, false],
  ];
  const a = analyzeSeedConfirm(mkSeed(99994, rows));
  assert.strictEqual(a.firstFiringDay, null);
});

check('continued falls after firing: many raw evenings, one warning per stretch', () => {
  const rows = firingShape().concat([[12, 17000, false], [13, 16000, false]]);
  const a = analyzeSeedConfirm(mkSeed(99995, rows));
  assert.strictEqual(a.firstFiringDay, 11);
  assert.deepStrictEqual(a.allCEveningDays, [11, 12, 13]);
  assert.deepStrictEqual(a.warningDays, [11]);
});

check('re-engagement then a new stand-down opens a second warning', () => {
  const rows = firingShape().concat([
    [12, 17000, true], // gate re-engages: stretch 1 ends
    [13, 20000, false], // new stretch S = 13
    [14, 19000, false], [15, 18500, false], [16, 18000, false], // D = 16, exactly 10%
  ]);
  const a = analyzeSeedConfirm(mkSeed(99996, rows));
  assert.deepStrictEqual(a.warningDays, [11, 16]);
});

check('startsDisengaged: stretch beginning on the first recorded evening counts', () => {
  // First evening is disengaged (S = day 1 in the recorded
  // series); a 3-fall + 10% shape after it fires. Use days
  // 1-8 so D >= 8: S = 1 is only usable once D-3 >= 1.
  const rows = [
    [1, 30000, false], [2, 29000, false], [3, 28000, false],
    [4, 27000, false], [5, 26000, false], [6, 25000, false],
    [7, 24000, false], [8, 23000, false],
  ];
  // D = 8: falls 5->6, 6->7, 7->8, D-3 = 5 >= S = 1, and
  // 23000 <= 0.90 * 30000 = 27000, so it fires on day 8 —
  // the first eligible evening. This checks both the flag
  // path (startsDisengaged true) and that a run starting
  // disengaged can still fire once eligible.
  const a = analyzeSeedConfirm(mkSeed(99997, rows));
  assert.strictEqual(a.startsDisengaged, true);
  assert.strictEqual(a.firstFiringDay, 8);
});

check('carried verdict: 3/12 firing survivors PASSES, 4/12 FAILS', () => {
  const band = (nFiring) => {
    const seeds = [];
    for (let i = 0; i < 12; i++) {
      seeds.push(mkSeed(99980 + i, i < nFiring ? firingShape() : quietShape()));
    }
    const s = summarizeConfirm(seeds);
    return confirmVerdict(s);
  };
  assert.strictEqual(band(3), 'PASS');
  assert.strictEqual(band(4), 'FAIL');
});

check('carried verdict: collapsing seed firing late FAILS; collapsing seed never firing FAILS', () => {
  const late = mkSeed(99988, firingShape(), {
    endReason: 'village-lost', daysAlive: 13,
    deaths: [{ day: 12, cause: 'starvation' }],
  });
  // firing day 11, first starvation day 12: 11 <= 12 - 3 is
  // false, so inTime is false -> FAIL.
  const s1 = summarizeConfirm([late].concat(
    Array.from({ length: 11 }, (_, i) => mkSeed(99970 + i, quietShape()))));
  assert.strictEqual(confirmVerdict(s1), 'FAIL');
  const never = mkSeed(99989, quietShape(), {
    endReason: 'village-lost', daysAlive: 20,
    deaths: [{ day: 18, cause: 'starvation' }],
  });
  const s2 = summarizeConfirm([never].concat(
    Array.from({ length: 11 }, (_, i) => mkSeed(99960 + i, quietShape()))));
  assert.strictEqual(confirmVerdict(s2), 'FAIL');
});

check('carried verdict: zero survivors is INSUFFICIENT-DATA, not a rate', () => {
  const s = summarizeConfirm([]);
  assert.strictEqual(s.survivorCount, 0);
  assert.strictEqual(confirmVerdict(s), 'INSUFFICIENT-DATA');
});

console.log('gatedisengconf proof: ' + n + '/' + n + ' checks passed');
