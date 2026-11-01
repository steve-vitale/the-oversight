#!/usr/bin/env node
// test-latewin-20261101.js — sim-latewin-a proof test (SYNTHETIC rows
// only; no band seeds, so proof runs are not judged sims).
//
// Proves the timeline derivation: staged wave-4 day, placement day,
// omen stage, win day -> gaps computed exactly; censored fields stay
// null, never 0; win-before-placement yields null gaps and
// roadPossibleBeforeWin false; the brief's 13-day test is computed
// separately from road-possible.
'use strict';
const assert = require('assert');
const { deriveTimeline } = require('./latewin-analyze-20261101');

function rows(spec) {
  // spec: array of [day, uw, rank, omenStage, omenDay, won, tableWaiting, seat]
  return spec.map(s => ({
    day: s[0], uw: s[1], rank: s[2] || 'village',
    omenStage: (s[3] === undefined ? null : s[3]),
    omenDay: (s[4] === undefined ? null : s[4]),
    won: s[5] || 0, tableWaiting: s[6] || 0, tableDone: 0,
    seat: s[7] || 'none',
  }));
}
let n = 0;
function check(name, fn) { fn(); n++; console.log('ok - ' + name); }

// 1. The 87120 SHAPE (synthetic analog, not the seed): wave 4 day 144,
// win day 146, omen never started -> all omen fields null, gaps null
// except winGapWave4 = 2, road impossible.
check('late-win shape: win 2 days after wave 4, omen never started', () => {
  const d = deriveTimeline({
    seed: 90001, gameDays: 146, won: 1, maxWave: 4, w4Day: 144,
    endOmenStage: null, endReason: 'over-other',
    timeline: rows([[143, 3, 'national'], [144, 4, 'national'], [145, 4, 'national'], [146, 4, 'global', null, null, 1, 1, 'lesser']]),
    finalRow: { day: 146, seat: 'lesser' },
    instrumentErrors: [], musterErrs: 0,
  });
  assert.strictEqual(d.wave4Day, 144);
  assert.strictEqual(d.omenStartDay, null);
  assert.strictEqual(d.placeDay, null);
  assert.strictEqual(d.winDay, 146);
  assert.strictEqual(d.seatAtWin, 'lesser');
  assert.strictEqual(d.winGapWave4, 2);
  assert.strictEqual(d.winGapPlace, null);
  assert.strictEqual(d.roadPossibleBeforeWin, false);
  assert.strictEqual(d.brief13Fit, false);
  assert.strictEqual(d.completeTimeline, true);
  assert.strictEqual(d.completeWithWave4AndEnd, true);
});

// 2. Win AFTER placement with a 20-day gap: road possible + brief-13 fit.
check('win 20 days after placement: road possible, brief-13 fits', () => {
  const d = deriveTimeline({
    seed: 90002, gameDays: 120, won: 1, maxWave: 4, w4Day: 80,
    endOmenStage: 2, endReason: 'over-other',
    timeline: rows([[80, 4, 'regional'], [85, 4, 'regional', 0, 85], [94, 4, 'national', 2, 94], [114, 4, 'national', 2, 94, 1, 1, 'lesser']]),
    finalRow: { day: 114, seat: 'lesser' },
    instrumentErrors: [], musterErrs: 0,
  });
  assert.strictEqual(d.omenStartDay, 85);
  assert.strictEqual(d.placeDay, 94);
  assert.strictEqual(d.winDay, 114);
  assert.strictEqual(d.winGapPlace, 20);
  assert.strictEqual(d.roadPossibleBeforeWin, true);
  assert.strictEqual(d.brief13Fit, true);
});

// 3. Win 5 days after placement: road possible, brief-13 does NOT fit
// (the two tests must stay separate — a short road is still a road).
check('win 5 days after placement: road possible, brief-13 misses', () => {
  const d = deriveTimeline({
    seed: 90003, gameDays: 100, won: 1, maxWave: 4, w4Day: 70,
    endOmenStage: 2, endReason: 'over-other',
    timeline: rows([[70, 4, 'regional'], [75, 4, 'regional', 0, 75], [84, 4, 'national', 2, 84], [89, 4, 'national', 2, 84, 1, 1, 'lesser']]),
    finalRow: { day: 89, seat: 'lesser' },
    instrumentErrors: [], musterErrs: 0,
  });
  assert.strictEqual(d.placeDay, 84);
  assert.strictEqual(d.winGapPlace, 5);
  assert.strictEqual(d.roadPossibleBeforeWin, true);
  assert.strictEqual(d.brief13Fit, false);
});

// 4. Omen started but never placed by the win: gaps null, road false.
check('omen started, never placed: win gaps null, road false', () => {
  const d = deriveTimeline({
    seed: 90004, gameDays: 110, won: 1, maxWave: 4, w4Day: 90,
    endOmenStage: 1, endReason: 'over-other',
    timeline: rows([[90, 4, 'regional'], [95, 4, 'regional', 0, 95], [100, 4, 'national', 1, 95], [110, 4, 'national', 1, 95, 1, 1, 'lesser']]),
    finalRow: { day: 110, seat: 'lesser' },
    instrumentErrors: [], musterErrs: 0,
  });
  assert.strictEqual(d.omenStartDay, 95);
  assert.strictEqual(d.placeDay, null);
  assert.strictEqual(d.winGapPlace, null);
  assert.strictEqual(d.roadPossibleBeforeWin, false);
});

// 5. Un-won seed to the cap: win fields null, end-gaps labeled, never
// win-gaps; national/table days still derived.
check('un-won cap seed: win null, end-gaps only', () => {
  const d = deriveTimeline({
    seed: 90005, gameDays: 201, won: 0, maxWave: 4, w4Day: 100,
    endOmenStage: 2, endReason: 'observation-cap',
    timeline: rows([[100, 4, 'regional'], [120, 4, 'national', 2, 120], [201, 4, 'national', 2, 120]]),
    finalRow: { day: 201, seat: 'none' },
    instrumentErrors: [], musterErrs: 0,
  });
  assert.strictEqual(d.winDay, null);
  assert.strictEqual(d.seatAtWin, null);
  assert.strictEqual(d.winGapWave4, null);
  assert.strictEqual(d.endGapWave4, 101);
  assert.strictEqual(d.endGapPlace, 81);
  assert.strictEqual(d.roadPossibleBeforeWin, false);
  assert.strictEqual(d.completeWithWave4AndEnd, true);
});

// 6. Never wave 4: wave4Day null, winGapWave4 null (never 0).
check('never wave 4: censored fields null, never 0', () => {
  const d = deriveTimeline({
    seed: 90006, gameDays: 167, won: 0, maxWave: 2, w4Day: null,
    endOmenStage: null, endReason: 'observation-cap',
    timeline: rows([[100, 2, 'national'], [167, 2, 'national']]),
    finalRow: { day: 167, seat: 'none' },
    instrumentErrors: [], musterErrs: 0,
  });
  assert.strictEqual(d.wave4Day, null);
  assert.strictEqual(d.placeDay, null);
  assert.strictEqual(d.endGapWave4, null);
  assert.strictEqual(d.completeWithWave4AndEnd, false);
});

// 7. Win landing after the last daily call: finalRow carries winDay.
check('win after last daily: finalRow carries winDay + seat', () => {
  const d = deriveTimeline({
    seed: 90007, gameDays: 90, won: 1, maxWave: 3, w4Day: null,
    endOmenStage: null, endReason: 'over-other',
    timeline: rows([[89, 3, 'national']]),
    finalRow: { day: 90, seat: 'lesser' },
    instrumentErrors: [], musterErrs: 0,
  });
  assert.strictEqual(d.winDay, 90);
  assert.strictEqual(d.seatAtWin, 'lesser');
});

// 8. Error rows break completeness; empty timeline is incomplete.
check('error row / empty timeline are incomplete', () => {
  const bad = deriveTimeline({
    seed: 90008, gameDays: 100, won: 0, maxWave: 4, w4Day: 50,
    endOmenStage: null, endReason: 'over-other',
    timeline: rows([[50, 4, 'regional']]).concat([{ day: 51, uw: 4, rank: 'regional', error: 'boom' }]),
    finalRow: { day: 100, seat: 'none' },
    instrumentErrors: ['x'], musterErrs: 0,
  });
  assert.strictEqual(bad.completeTimeline, false);
  const empty = deriveTimeline({
    seed: 90009, gameDays: 10, won: 0, maxWave: 1, w4Day: null,
    endOmenStage: null, endReason: 'over-other', timeline: [],
    finalRow: { day: 10, seat: 'none' },
    instrumentErrors: [], musterErrs: 0,
  });
  assert.strictEqual(empty.completeTimeline, false);
});

console.log(`test-latewin-20261101: ${n}/8 green (synthetic only)`);
