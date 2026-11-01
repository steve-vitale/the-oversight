#!/usr/bin/env node
// test-gatediseng-confirm-b.js — PURE proof test for
// sim-gatediseng-confirm-b. Synthetic series ONLY: no judged
// seeds (no 52201-52212, no 51608, no 52101-52108), no judged
// trajectories. Synthetic seed numbers are 999xx, invented.
// Run: node scripts/test-gatediseng-confirm-b.js
// Must run AFTER the prereg commit and BEFORE any judged
// application of the confirm analyzer.
'use strict';
const assert = require('assert');
const { analyzeSeedGatediseng } = require('./analyze-gatediseng-b');
const {
  allCEvenings, warningsForSeed, analyzeSeedConfirm,
  summarizeConfirm, confirmVerdict,
} = require('./analyze-gatediseng-confirm-b');

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

check('all-evenings: stand-down + 3 falls + >=10% fires, and keeps firing while falls continue', () => {
  // day 7 engaged 20000; S=8 at 19000; falls to 18500, 17800, 17000 (day 11, -10.5%), then 16000 (day 12)
  const s = mkSeed(99991, [
    [7, 20000, true], [8, 19000, false], [9, 18500, false],
    [10, 17800, false], [11, 17000, false], [12, 16000, false],
  ]);
  const all = allCEvenings(s.rows);
  assert.deepStrictEqual(all.map((e) => e.day), [11, 12]);
  assert.strictEqual(all[0].standDownDay, 8);
  const w = warningsForSeed(s.rows);
  assert.deepStrictEqual(w.warnings.map((e) => e.day), [11], 'one warning per stretch, not per evening');
  assert.strictEqual(w.allEvenings.length, 2);
});

check('first evening from new analyzer equals reused analyzer candidateC day', () => {
  const s = mkSeed(99992, [
    [7, 20000, true], [8, 19000, false], [9, 18500, false],
    [10, 17800, false], [11, 17000, false], [12, 16000, false],
  ]);
  const reused = analyzeSeedGatediseng(s);
  const mine = analyzeSeedConfirm(s);
  assert.ok(reused.candidates.c_standDownTrend && reused.candidates.c_standDownTrend.day === 11);
  assert.strictEqual(mine.firstFiringDay, 11);
  assert.strictEqual(mine.crossCheckMismatch, false);
});

check('no fire on flicker stretch with only 2 falls before re-engagement', () => {
  const s = mkSeed(99993, [
    [7, 20000, true], [8, 19000, false], [9, 18500, false],
    [10, 19500, true],
  ]);
  assert.deepStrictEqual(allCEvenings(s.rows), []);
  assert.strictEqual(analyzeSeedConfirm(s).firing, false);
});

check('no fire when 3 falls total less than 10% below stand-down', () => {
  const s = mkSeed(99994, [
    [7, 20000, true], [8, 19000, false], [9, 18800, false],
    [10, 18600, false], [11, 18400, false],
  ]);
  assert.deepStrictEqual(allCEvenings(s.rows), []); // -3.2% vs S
});

check('boundary: exactly 90% of stand-down total fires (<=)', () => {
  const s = mkSeed(99995, [
    [7, 20000, true], [8, 19000, false], [9, 18500, false],
    [10, 17800, false], [11, 17100, false], // 17100 = 0.90 * 19000 exactly
  ]);
  assert.deepStrictEqual(allCEvenings(s.rows).map((e) => e.day), [11]);
});

check('no fire before day 8 even with stand-down trend shape', () => {
  const s = mkSeed(99996, [
    [3, 20000, true], [4, 19000, false], [5, 18500, false],
    [6, 17800, false], [7, 17000, false],
  ]);
  assert.deepStrictEqual(allCEvenings(s.rows), []);
});

check('run-start stretch: S is the first evening, fires after 3 falls + 10%', () => {
  const s = mkSeed(99997, [
    [1, 20000, false], [2, 19500, false], [3, 19000, false],
    [4, 18500, false], [5, 18000, false], [6, 17500, false],
    [7, 17000, false], [8, 16500, false], [9, 16000, false],
    [10, 15500, false], [11, 15000, false],
  ]);
  // Falls from day 1: by day 8, 16500 <= 0.90*20000=18000 with 3 falls ending at 8 (5->6,6->7,7->8) — but D-3=5 >= S=1, so day 8 fires.
  const mine = analyzeSeedConfirm(s);
  assert.strictEqual(mine.startsDisengaged, true);
  assert.strictEqual(mine.firstFiringDay, 8);
});

check('re-engagement then new stand-down gives a second warning (one per stretch)', () => {
  const s = mkSeed(99998, [
    [7, 30000, true], [8, 28000, false], [9, 27000, false],
    [10, 26000, false], [11, 24000, false], // -14.3% vs 28000, fires day 11
    [12, 26000, true], // re-engage
    [13, 24000, false], [14, 23000, false], [15, 22000, false],
    [16, 21000, false], // -12.5% vs 24000, fires day 16
  ]);
  const w = warningsForSeed(s.rows);
  assert.deepStrictEqual(w.warnings.map((e) => e.day), [11, 16]);
  assert.strictEqual(w.allEvenings.length, 2);
});

check('in-time: firing day <= starvation-3 is in time; no firing on collapse fails verdict', () => {
  const collapsing = (fireRows, deaths) => mkSeed(99999, fireRows, {
    endReason: 'village-lost', daysAlive: 28, deaths,
  });
  const inTimeSeed = collapsing([
    [7, 20000, true], [8, 19000, false], [9, 18500, false],
    [10, 17800, false], [11, 17000, false],
  ], [{ day: 21, cause: 'starvation' }]);
  // This shape fires day 11 (not 15) — use it to check inTime flag arithmetic via a later-firing shape instead:
  const late = mkSeed(99990, [
    [7, 40000, true], [8, 39000, false], [9, 38500, false],
    [10, 38000, false], [11, 37500, false], [12, 37000, false],
    [13, 36500, false], [14, 36000, false], [15, 35500, false],
    [16, 35000, false], [17, 34500, false], [18, 34000, false],
    [19, 33500, false],
  ], { endReason: 'village-lost', daysAlive: 28, deaths: [{ day: 21, cause: 'starvation' }] });
  // 33500 vs S=39000 is -14.1% but 3-fall + 10% shape is met much earlier (day 11: 37500 <= 35100? No: 37500 > 35100, so no fire until pantry <= 35100, i.e. day 16 at 35000).
  const lateOut = analyzeSeedConfirm(late);
  assert.strictEqual(lateOut.firstFiringDay, 16);
  assert.strictEqual(lateOut.inTime, true); // 16 <= 21-3
  assert.strictEqual(analyzeSeedConfirm(inTimeSeed).firstFiringDay, 11);
  assert.strictEqual(analyzeSeedConfirm(inTimeSeed).inTime, true); // 11 <= 21-3
  const noFireCollapse = mkSeed(99989, [[7, 20000, true], [8, 19000, true]], {
    endReason: 'village-lost', daysAlive: 28, deaths: [{ day: 21, cause: 'starvation' }],
  });
  const sum = summarizeConfirm([noFireCollapse, mkSeed(99988, [[7, 20000, true]])]);
  assert.strictEqual(confirmVerdict(sum), 'FAIL');
});

check('confirm verdict: rate exactly 25% passes, 33% fails, zero survivors is insufficient', () => {
  const surv = (seedNum, firing) => mkSeed(seedNum, firing
    ? [[7, 20000, true], [8, 19000, false], [9, 18500, false], [10, 17800, false], [11, 17000, false]]
    : [[7, 20000, true], [8, 19000, true]]);
  const passBand = summarizeConfirm([surv(99981, true), surv(99982, false), surv(99983, false), surv(99984, false)]);
  assert.strictEqual(passBand.firingSurvivorRate, 0.25);
  assert.strictEqual(confirmVerdict(passBand), 'PASS');
  const failBand = summarizeConfirm([surv(99981, true), surv(99982, false), surv(99983, false)]);
  // 1/3 = 33.3% > 25%
  assert.strictEqual(confirmVerdict(failBand), 'FAIL');
  const empty = summarizeConfirm([]);
  assert.strictEqual(confirmVerdict(empty), 'INSUFFICIENT-DATA');
});

check('evenings stats: mean/median/max over firing seeds only', () => {
  const a = mkSeed(99971, [
    [7, 20000, true], [8, 19000, false], [9, 18500, false],
    [10, 17800, false], [11, 17000, false], [12, 16000, false],
  ]); // raw 2
  const b = mkSeed(99972, [
    [7, 20000, true], [8, 19000, false], [9, 18500, false],
    [10, 17800, false], [11, 17000, false],
  ]); // raw 1
  const c = mkSeed(99973, [[7, 20000, true], [8, 19000, true]]); // no fire, excluded
  const sum = summarizeConfirm([a, b, c]);
  assert.deepStrictEqual(sum.eveningsPerFiringSeed.rawCounts, [2, 1]);
  assert.strictEqual(sum.eveningsPerFiringSeed.rawMean, 1.5);
  assert.strictEqual(sum.eveningsPerFiringSeed.rawMedian, 1.5);
  assert.strictEqual(sum.eveningsPerFiringSeed.rawMax, 2);
  assert.deepStrictEqual(sum.crossCheckMismatches, []);
});

console.log('gatediseng-confirm proof: ' + n + '/' + n + ' checks passed');
