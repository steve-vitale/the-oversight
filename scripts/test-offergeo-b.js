#!/usr/bin/env node
// test-offergeo-b.js — pure proof test for analyze-offergeo-b.js (DIAG ONLY).
// (sim-offergeo-b; prereg: evidence/2026-11-01/sim-offergeo-b-prereg.md.)
// No game load, no RNG, no file writes outside the synthetic corpus dir
// it builds under os.tmpdir() and removes afterwards. Run:
//   node scripts/test-offergeo-b.js
'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  manhattan, bandOf, classifyOffer, departureOf, nextMorning, analyzeDirs,
} = require('./analyze-offergeo-b');

let n = 0;
function check(name, fn) { fn(); n++; console.log('ok ' + n + ' ' + name); }

// Manhattan distance (code's own metric, nighttravel.js + travelTargets).
check('manhattan (5,3)->(4,4) = 2 (17563 day-5 P1 hop)', () => assert.strictEqual(manhattan(5, 3), 2));
check('manhattan (4,3)->(4,4) = 1 (17563 day-5 creekseek hop)', () => assert.strictEqual(manhattan(4, 3), 1));
check('manhattan (2,0)->(4,4) = 6 (17563 creek episode)', () => assert.strictEqual(manhattan(2, 0), 6));
check('manhattan (6,7)->(4,4) = 5 (17549 stuck tile)', () => assert.strictEqual(manhattan(6, 7), 5));
check('manhattan haven->haven = 0', () => assert.strictEqual(manhattan(4, 4), 0));

// Band boundaries (prereg: A <=3, B 4-5, C >=6).
check('band boundaries 3/4 and 5/6', () => {
  assert.strictEqual(bandOf(3), 'A<=3'); assert.strictEqual(bandOf(4), 'B4-5');
  assert.strictEqual(bandOf(5), 'B4-5'); assert.strictEqual(bandOf(6), 'C>=6');
  assert.strictEqual(bandOf(1), 'A<=3'); assert.strictEqual(bandOf(10), 'C>=6');
  assert.strictEqual(bandOf(null), null);
});

// Offer classification for every outcome in the taxonomy.
check('offer classification: out-of-reach = not offered', () => {
  const c = classifyOffer({ eveningOutcome: 'out-of-reach', travelledHome: false });
  assert.deepStrictEqual([c.evaluated, c.offered, c.kind], [true, false, 'offer-no']);
});
check('offer classification: travel-refused = offered', () => {
  const c = classifyOffer({ eveningOutcome: 'travel-refused', travelledHome: false });
  assert.deepStrictEqual([c.evaluated, c.offered, c.kind], [true, true, 'hop-refused']);
});
check('offer classification: hop-yes-entry-no = offered', () => {
  const c = classifyOffer({ eveningOutcome: 'walk-no-path', travelledHome: true });
  assert.deepStrictEqual([c.evaluated, c.offered, c.kind], [true, true, 'hop-yes-entry-no']);
});
check('offer classification: hop-yes-entry-yes = offered', () => {
  const c = classifyOffer({ eveningOutcome: 'completed', travelledHome: true });
  assert.deepStrictEqual([c.evaluated, c.offered, c.kind], [true, true, 'hop-yes-entry-yes']);
});
check('offer classification: entry-only excluded, not "offered"', () => {
  const c = classifyOffer({ eveningOutcome: 'completed', travelledHome: false });
  assert.deepStrictEqual([c.evaluated, c.excludedReason], [false, 'entry-only-haven']);
});
check('offer classification: entry-fail-only excluded', () => {
  const c = classifyOffer({ eveningOutcome: 'walk-no-path', travelledHome: false });
  assert.deepStrictEqual([c.evaluated, c.excludedReason], [false, 'entry-only-haven']);
});
check('offer classification: guard-combat excluded before offer', () => {
  const c = classifyOffer({ eveningOutcome: 'blocked-combat', travelledHome: false });
  assert.deepStrictEqual([c.evaluated, c.excludedReason], [false, 'guard-before-offer']);
});
check('offer classification: no-step excluded', () => {
  const c = classifyOffer({ eveningOutcome: 'policy-no-record', travelledHome: false });
  assert.deepStrictEqual([c.evaluated, c.excludedReason], [false, 'no-step']);
});
check('offer classification: travel-arrived-combat = offered', () => {
  const c = classifyOffer({ eveningOutcome: 'travel-arrived-combat', travelledHome: false });
  assert.deepStrictEqual([c.evaluated, c.offered], [true, true]);
});
check('offer classification: surprise outcomes flagged', () => {
  assert.strictEqual(classifyOffer({ eveningOutcome: 'haven-unknown', travelledHome: false }).surprise, true);
  assert.strictEqual(classifyOffer({ eveningOutcome: 'step-error', travelledHome: false }).surprise, true);
  assert.strictEqual(classifyOffer({ eveningOutcome: 'detour-stopped', travelledHome: false }).surprise, true);
  assert.strictEqual(classifyOffer({ eveningOutcome: 'bogus-outcome', travelledHome: false }).surprise, true);
});

// Departure recovery rules.
check('departure: non-hop evening = evening snap', () => {
  const d = departureOf({ eveningOutcome: 'out-of-reach', travelledHome: false, mapPx: 2, mapPy: 0, tile: 'creek' }, null, 'nighttravel-stack');
  assert.deepStrictEqual([d.mapPx, d.mapPy, d.tile, d.distance], [2, 0, 'creek', 6]);
});
check('departure: P1 hop pinned by creekseek-from, not arrival', () => {
  const eve = { eveningOutcome: 'walk-no-path', travelledHome: true, mapPx: 4, mapPy: 4, tile: 'haven', dayLines: ['Travel 2 tiles to Haven.'] };
  const d = departureOf(eve, { csFrom: { mapPx: 5, mapPy: 3, tile: 'forest_floor' }, csArrival: { mapPx: 4, mapPy: 3, tile: 'creek' } }, 'nighttravel-stack');
  assert.deepStrictEqual([d.mapPx, d.mapPy, d.distance], [5, 3, 2]);
  assert.match(d.provenance, /creekseek-from/);
});
check('departure: creekseek hop pinned by arrival, not from', () => {
  const eve = { eveningOutcome: 'walk-no-path', travelledHome: true, mapPx: 4, mapPy: 4, tile: 'haven', dayLines: ['Travel 1 tile to Haven.'] };
  const d = departureOf(eve, { csFrom: { mapPx: 5, mapPy: 3, tile: 'forest_floor' }, csArrival: { mapPx: 4, mapPy: 3, tile: 'creek' } }, 'creekseek-stack');
  assert.deepStrictEqual([d.mapPx, d.mapPy, d.distance], [4, 3, 1]);
});
check('departure: hop without cross record falls back to day line, tile unpinned', () => {
  const eve = { eveningOutcome: 'walk-no-path', travelledHome: true, mapPx: 4, mapPy: 4, tile: 'haven', dayLines: ['Travel 2 tiles to Haven.'] };
  const d = departureOf(eve, null, 'nighttravel-stack');
  assert.deepStrictEqual([d.mapPx, d.distance], [null, 2]);
  assert.match(d.provenance, /day-line/);
});
check('departure: hop with no line and no cross = unpinned', () => {
  const eve = { eveningOutcome: 'walk-no-path', travelledHome: true, mapPx: 4, mapPy: 4, tile: 'haven', dayLines: [] };
  const d = departureOf(eve, null, 'nighttravel-stack');
  assert.strictEqual(d.distance, null);
  assert.match(d.provenance, /unpinned/);
});

// Next-morning pairing + day-30 exclusion.
function synthInst() {
  return {
    seed: 1, policy: 'nighttravel-stack',
    decisions: [
      { loopDay: 1, morning: { kcal: 100, tile: 'haven', mapPx: 4, mapPy: 4, inside: true, vesselId: 'v1' } },
      { loopDay: 2, morning: { kcal: 80, tile: 'haven', mapPx: 4, mapPy: 4, inside: false, vesselId: 'v1' } },
    ],
    evenings: [
      { loopDay: 1, kcal: 120, tile: 'haven', mapPx: 4, mapPy: 4, vesselId: 'v1', inCombat: false, gameOver: false },
      { loopDay: 2, kcal: 90, tile: 'creek', mapPx: 2, mapPy: 0, vesselId: 'v1', inCombat: true, gameOver: false },
    ],
  };
}
check('nextMorning: day-1 evening pairs with day-2 morning, delta + kcal math', () => {
  const inst = synthInst();
  const nm = nextMorning(inst, inst.evenings[0]);
  assert.strictEqual(nm.kcalDelta, -40); // 80 - 120
  assert.strictEqual(nm.stillAtHaven, true);
  assert.strictEqual(nm.insideNextMorning, false);
  assert.strictEqual(nm.vesselSame, true);
  assert.strictEqual(nm.nextEvening.class, 'away');
  assert.strictEqual(nm.nextEvening.inCombat, true);
});
check('nextMorning: last evening has no following morning (day-30 exclusion shape)', () => {
  const inst = synthInst();
  assert.strictEqual(nextMorning(inst, inst.evenings[1]), null);
});

// Analyzer wiring on a synthetic corpus dir.
check('analyzer wiring on synthetic corpus dir', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'offergeo-test-'));
  try {
    const inst = {
      seed: 17563, policy: 'nighttravel-stack', days: 30,
      decisions: [
        { loopDay: 1, morning: { kcal: 100, tile: 'haven', mapPx: 4, mapPy: 4, inside: true, vesselId: 'v1' } },
        { loopDay: 2, morning: { kcal: 50, tile: 'haven', mapPx: 4, mapPy: 4, inside: false, vesselId: 'v1' } },
        { loopDay: 3, morning: { kcal: 40, tile: 'creek', mapPx: 2, mapPy: 0, inside: false, vesselId: 'v1' } },
      ],
      evenings: [
        { loopDay: 1, eveningOutcome: 'completed', travelledHome: false, tile: 'haven', mapPx: 4, mapPy: 4, inside: true, kcal: 120, vesselId: 'v1', dayLines: [] },
        { loopDay: 2, eveningOutcome: 'walk-no-path', travelledHome: true, tile: 'haven', mapPx: 4, mapPy: 4, inside: false, kcal: 0, vesselId: 'v1', dayLines: ['Travel 2 tiles to Haven.'] },
        { loopDay: 3, eveningOutcome: 'out-of-reach', travelledHome: false, tile: 'creek', mapPx: 2, mapPy: 0, inside: false, kcal: 30, vesselId: 'v1', dayLines: [] },
      ],
    };
    fs.writeFileSync(path.join(dir, 'x.json'), JSON.stringify(inst));
    const res = analyzeDirs([dir]);
    assert.strictEqual(res.policies['nighttravel-stack'].evaluated, 2); // hop + offer-no
    assert.strictEqual(res.policies['nighttravel-stack'].offered, 1);
    assert.strictEqual(res.pooled.bands['A<=3'].n, 1); // hop at d=2
    assert.strictEqual(res.pooled.bands['C>=6'].n, 1); // offer-no at d=6
    assert.strictEqual(res.pooled.entryFail.n, 1); // hop entry-fail haven evening
    assert.strictEqual(res.pooled.entrySuccess.n, 1);
    assert.strictEqual(res.surprises.length, 0);
    assert.strictEqual(res.havenCoordViolations.length, 0);
    const hopRow = res.offerRows.find((r) => r.kind === 'hop-yes-entry-no');
    assert.strictEqual(hopRow.band, 'A<=3');
    assert.strictEqual(hopRow.departure.distance, 2);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
check('analyzer flags haven-tile snap off (4,4) as a coord violation', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'offergeo-test-'));
  try {
    const inst = {
      seed: 9, policy: 'nighttravel-stack', days: 30, decisions: [],
      evenings: [{ loopDay: 1, eveningOutcome: 'completed', travelledHome: false, tile: 'haven', mapPx: 5, mapPy: 5, inside: false, kcal: 10, vesselId: 'v1', dayLines: [] }],
    };
    fs.writeFileSync(path.join(dir, 'x.json'), JSON.stringify(inst));
    const res = analyzeDirs([dir]);
    assert.strictEqual(res.havenCoordViolations.length, 1);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

console.log('test-offergeo-b: ' + n + '/' + n + ' green');
