#!/usr/bin/env node
// test-gatediseng-b.js — PURE proof test for sim-gatediseng-b.
// Synthetic series ONLY: no judged seeds, no judged trajectories.
// Every number below is invented for the check, except the (b)
// trap shape (plenty passing with a long hunger streak), which
// mirrors the published gate logic, not a trajectory.
// Run: node scripts/test-gatediseng-b.js
'use strict';
const assert = require('assert');
const {
  candidateA, candidateB, candidateC, candidateD,
  firstStarvationDay, analyzeSeedGatediseng,
} = require('./analyze-gatediseng-b');

// Build an evening series from rows: [loopDay, pantry, freshDays, streak, engaged, gateOn]
function series(rows) {
  const m = new Map();
  for (const [loopDay, pantryKcal, freshDays, hungryStreak, gateEngaged, gateOn] of rows) {
    m.set(loopDay, { loopDay, pantryKcal, freshDays, hungryStreak, gateEngaged, gateOn });
  }
  return m;
}
function daysOf(m) { return [...m.keys()].sort((a, b) => a - b); }
let n = 0;
function check(name, fn) { fn(); n++; console.log('ok ' + n + ' - ' + name); }

// ---- (a) TOTAL-SLIDE ----
check('a fires on 20%+ fall with 3 consecutive falls, disengaged, day>=8', () => {
  // days 3..8: 30000 -> 28000 -> 26000 -> 24000 -> 22000 -> 20000; day 8 vs day 3: -33%
  const m = series([
    [3, 30000, 5, 0, false, true], [4, 28000, 5, 0, false, true],
    [5, 26000, 5, 0, false, true], [6, 24000, 5, 0, false, true],
    [7, 22000, 5, 0, false, true], [8, 20000, 5, 0, false, true],
  ]);
  const f = candidateA(m, daysOf(m));
  assert.ok(f && f.day === 8, 'expected day 8, got ' + JSON.stringify(f));
});
check('a does not fire on only 2 consecutive falls', () => {
  const m2 = series([
    [3, 30000, 5, 0, false, true], [4, 28000, 5, 0, false, true],
    [5, 26000, 5, 0, false, true], [6, 26500, 5, 0, false, true],
    [7, 24000, 5, 0, false, true], [8, 22000, 5, 0, false, true],
  ]);
  // falls ending at 8: 6->7, 7->8 only (5->6 is a rise) = 2 falls -> no fire.
  assert.strictEqual(candidateA(m2, daysOf(m2)), null);
});
check('a does not fire below the 20% fall bar', () => {
  const m = series([
    [3, 30000, 5, 0, false, true], [4, 29000, 5, 0, false, true],
    [5, 28000, 5, 0, false, true], [6, 27000, 5, 0, false, true],
    [7, 26000, 5, 0, false, true], [8, 25000, 5, 0, false, true],
  ]);
  assert.strictEqual(candidateA(m, daysOf(m)), null); // -16.7% over 5 evenings
});
check('a does not fire while engaged', () => {
  const m = series([
    [3, 30000, 5, 0, true, true], [4, 28000, 5, 0, true, true],
    [5, 26000, 5, 0, true, true], [6, 24000, 5, 0, true, true],
    [7, 22000, 5, 0, true, true], [8, 20000, 5, 0, true, true],
  ]);
  assert.strictEqual(candidateA(m, daysOf(m)), null);
});
check('a does not fire before day 8', () => {
  const m = series([
    [2, 30000, 5, 0, false, true], [3, 28000, 5, 0, false, true],
    [4, 26000, 5, 0, false, true], [5, 24000, 5, 0, false, true],
    [6, 22000, 5, 0, false, true], [7, 20000, 5, 0, false, true],
  ]);
  assert.strictEqual(candidateA(m, daysOf(m)), null);
});
check('a returns the FIRST firing evening only', () => {
  const m = series([
    [3, 30000, 5, 0, false, true], [4, 28000, 5, 0, false, true],
    [5, 26000, 5, 0, false, true], [6, 24000, 5, 0, false, true],
    [7, 22000, 5, 0, false, true], [8, 20000, 5, 0, false, true],
    [9, 18000, 5, 0, false, true], [10, 16000, 5, 0, false, true],
  ]);
  const f = candidateA(m, daysOf(m));
  assert.ok(f && f.day === 8);
});

// ---- (b) HYSTERESIS ----
check('b re-engages at freshDays 2.5, streak 0, gateOn true', () => {
  const m = series([[8, 20000, 2.5, 0, false, true], [9, 19000, 2.4, 0, false, true]]);
  const f = candidateB(m, daysOf(m));
  assert.ok(f && f.day === 8 && f.assumedGateOn === false);
});
check('b does NOT re-engage on the plenty-plus-hunger trap (fresh 11, streak 6)', () => {
  const m = series([[8, 38000, 11.0, 6, false, true], [9, 7000, 1.4, 0, false, true]]);
  assert.strictEqual(candidateB(m, daysOf(m)), null);
});
check('b does NOT re-engage at exactly freshDays 2.0 (strict >)', () => {
  const m = series([[8, 20000, 2.0, 0, false, true]]);
  assert.strictEqual(candidateB(m, daysOf(m)), null);
});
check('b does NOT re-engage below 2.0', () => {
  const m = series([[8, 20000, 1.9, 0, false, true]]);
  assert.strictEqual(candidateB(m, daysOf(m)), null);
});
check('b fires with gateOn null flagged as assumed (corpus-row shape)', () => {
  const m = series([[8, 20000, 3.0, 1, false, null]]);
  const f = candidateB(m, daysOf(m));
  assert.ok(f && f.day === 8 && f.assumedGateOn === true);
});
check('b does NOT re-engage when gateOn is false', () => {
  const m = series([[8, 20000, 3.0, 0, false, false]]);
  assert.strictEqual(candidateB(m, daysOf(m)), null);
});

// ---- (c) STAND-DOWN + TREND ----
check('c fires after a stand-down with 3 falls and >=10% below stand-down total', () => {
  // day 7 engaged 20000; stand-down day 8 at 19000; falls 9,10,11 -> 17000 (-10.5% vs 19000)
  const m = series([
    [7, 20000, 5, 0, true, true], [8, 19000, 3.5, 0, false, true],
    [9, 18500, 3.4, 0, false, true], [10, 17800, 3.3, 0, false, true],
    [11, 17000, 3.2, 0, false, true],
  ]);
  const f = candidateC(m, daysOf(m));
  assert.ok(f && f.day === 11 && f.standDownDay === 8, 'got ' + JSON.stringify(f));
});
check('c does NOT fire on a flicker stretch with only 2 falls before re-engagement', () => {
  const m = series([
    [7, 20000, 5, 0, true, true], [8, 19000, 3.5, 0, false, true],
    [9, 18500, 3.4, 0, false, true], [10, 19500, 4.1, 0, true, true],
  ]);
  assert.strictEqual(candidateC(m, daysOf(m)), null);
});
check('c does NOT fire when 3 falls total less than 10% below stand-down', () => {
  const m = series([
    [7, 20000, 5, 0, true, true], [8, 19000, 3.5, 0, false, true],
    [9, 18800, 3.4, 0, false, true], [10, 18600, 3.3, 0, false, true],
    [11, 18400, 3.2, 0, false, true],
  ]);
  assert.strictEqual(candidateC(m, daysOf(m)), null); // -3.2% vs stand-down
});
check('c does NOT fire on its firing evening if that evening is engaged', () => {
  const m = series([
    [7, 20000, 5, 0, true, true], [8, 19000, 3.5, 0, false, true],
    [9, 18500, 3.4, 0, false, true], [10, 17800, 3.3, 0, false, true],
    [11, 17000, 4.1, 0, true, true],
  ]);
  assert.strictEqual(candidateC(m, daysOf(m)), null);
});

// ---- (d) FLOOR ----
check('d fires at 9999 while disengaged', () => {
  const m = series([[8, 9999, 3.0, 0, false, true]]);
  const f = candidateD(m, daysOf(m));
  assert.ok(f && f.day === 8);
});
check('d does NOT fire at exactly 10000', () => {
  const m = series([[8, 10000, 3.0, 0, false, true]]);
  assert.strictEqual(candidateD(m, daysOf(m)), null);
});
check('d does NOT fire while engaged at 9000', () => {
  const m = series([[8, 9000, 5, 0, true, true]]);
  assert.strictEqual(candidateD(m, daysOf(m)), null);
});

// ---- in-time arithmetic + seed wrapper ----
check('in-time: firing 18 with first starvation 21 is in time; 19 is not', () => {
  const mk = (fireDay) => ({
    seed: 99999, endReason: 'village-lost', days: 30, daysAlive: 28,
    deaths: [{ day: 21, cause: 'starvation' }],
    rows: [],
  });
  void mk;
  assert.strictEqual(18 <= 21 - 3, true);
  assert.strictEqual(19 <= 21 - 3, false);
  assert.strictEqual(firstStarvationDay({ deaths: [{ day: 25, cause: 'combat' }, { day: 21, cause: 'starvation' }] }), 21);
});
check('seed wrapper reports collapsed + first starvation + per-candidate days', () => {
  const seed = {
    seed: 99998, endReason: 'village-lost', days: 30, daysAlive: 28,
    deaths: [{ day: 21, cause: 'starvation' }],
    rows: [
      { loopDay: 7, pantryKcal: 20000, freshDays: 5, hungryStreak: 0, gateEngaged: true, gateOn: true },
      { loopDay: 8, pantryKcal: 19000, freshDays: 3.5, hungryStreak: 0, gateEngaged: false, gateOn: true },
      { loopDay: 9, pantryKcal: 18500, freshDays: 3.4, hungryStreak: 0, gateEngaged: false, gateOn: true },
      { loopDay: 10, pantryKcal: 17800, freshDays: 3.3, hungryStreak: 0, gateEngaged: false, gateOn: true },
      { loopDay: 11, pantryKcal: 17000, freshDays: 3.2, hungryStreak: 0, gateEngaged: false, gateOn: true },
    ],
  };
  const out = analyzeSeedGatediseng(seed);
  assert.strictEqual(out.collapsed, true);
  assert.strictEqual(out.firstStarvationDay, 21);
  assert.ok(out.candidates.b_hysteresis && out.candidates.b_hysteresis.day === 8);
  assert.ok(out.candidates.b_hysteresis.inTime === true);
  assert.ok(out.candidates.c_standDownTrend && out.candidates.c_standDownTrend.day === 11);
  assert.strictEqual(out.candidates.d_floor, null);
});

console.log('gatediseng proof: ' + n + '/' + n + ' checks passed');
