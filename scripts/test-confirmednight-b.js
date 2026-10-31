#!/usr/bin/env node
// test-confirmednight-b.js — pure proof test for
// analyze-confirmednight-b.js. No game load, no RNG, no file writes
// to the repo (uses a temp dir under os.tmpdir() for the analyzeDir
// wiring check only).
'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { classifyConfirmed, analyzeDir } = require('./analyze-confirmednight-b');

let passed = 0;
function check(name, fn) { fn(); passed++; console.log('ok: ' + name); }

const HAVEN = { mapPx: 4, mapPy: 4, havenPx: 4, havenPy: 4 };
const CREEK = { mapPx: 1, mapPy: 3, havenPx: 4, havenPy: 4 };
function morning(tile, vessel) {
  const away = tile !== 'haven';
  return Object.assign({ inside: !away, tile }, away ? CREEK : HAVEN, { vesselId: vessel });
}
function evening(tile, o) {
  const away = tile !== 'haven';
  return Object.assign({
    tile, inside: !away, roadActive: false, roadOnRoad: false,
    woodcarry: null, dayLines: [], inCombat: false,
    eveningOutcome: 'policy-no-record', ctxDelta: { forageTrips: 0, tripHomeDetours: 0, patrols: 0 },
  }, away ? CREEK : HAVEN, o || {});
}
function inst(seed, policy, days) {
  return {
    seed, policy, days: days.length, errCount: 0, daysAlive: days.length, endReason: 'horizon',
    decisions: days.map((d, i) => ({
      loopDay: i + 1, morning: d.morning, ctxDelta: d.ctxDelta || { forageTrips: 0, tripHomeDetours: 0, patrols: 0 },
    })),
    evenings: days.map((d, i) => Object.assign({ loopDay: i + 1 }, d.evening)),
  };
}

check('confirmed = genuine + away-cont-with-away-next; haven-following and sleep-return excluded', () => {
  // P3-like camp days 1-3, day 4 morning haven SAME vessel.
  const x = inst(17504, 'deed-seeking', [
    { morning: morning('haven', 'v1'), evening: evening('creek', { dayLines: ['Travel 2 tiles to creek.'] }) },
    { morning: morning('creek', 'v1'), evening: evening('creek', { dayLines: ['The creek runs fast here — no crossing without a bridge or a swim.'] }) },
    { morning: morning('creek', 'v1'), evening: evening('creek') },
    { morning: morning('haven', 'v1'), evening: evening('haven') },
  ]);
  const c = classifyConfirmed(x);
  assert.strictEqual(c.creekTileEvenings, 3);
  assert.deepStrictEqual(c.confirmedDays, [1, 2]);
  assert.strictEqual(c.noAttempt, 2);
  assert.strictEqual(c.failedReturn, 0);
  assert.strictEqual(c.unclassified, 0);
  // Bridge line flags the night but does NOT promote it to FAILED-RETURN.
  assert.strictEqual(c.blockedCrossingNights, 1);
  assert.strictEqual(c.confirmed[1].story, 'NO-ATTEMPT');
  assert.strictEqual(c.confirmed[1].blockedCrossing, true);
  assert.strictEqual(c.unconfirmedHavenFollowing, 1);
  assert.strictEqual(c.unconfirmed[0].kind, 'haven-following');
  assert.strictEqual(c.unconfirmed[0].vesselChanged, false);
  assert.strictEqual(c.camps.length, 1);
  assert.deepStrictEqual(c.camps[0].days, [1, 2, 3]);
  assert.strictEqual(c.camps[0].confirmedNights, 2);
  assert.strictEqual(c.camps[0].endStory, 'woke-at-haven-same-vessel');
});

check('FAILED-RETURN via out-of-reach; walk-home camp end', () => {
  const x = inst(17513, 'nighttravel-stack', [
    { morning: morning('haven', 'v1'), evening: evening('creek', { eveningOutcome: 'out-of-reach', dayLines: ['The creek runs fast here — no crossing without a bridge or a swim.'] }) },
    { morning: morning('creek', 'v1'), evening: evening('creek', { eveningOutcome: 'out-of-reach' }) },
    { morning: morning('creek', 'v1'), evening: evening('haven', { eveningOutcome: 'completed' }) },
  ]);
  const c = classifyConfirmed(x);
  assert.deepStrictEqual(c.confirmedDays, [1, 2]);
  assert.strictEqual(c.failedReturn, 2);
  assert.deepStrictEqual(c.confirmed[0].signals, ['outcome:out-of-reach']);
  assert.strictEqual(c.blockedCrossingNights, 1);
  assert.strictEqual(c.camps.length, 1);
  assert.strictEqual(c.camps[0].endStory, 'walk-home');
});

check('FAILED-RETURN via tripHomeDetours; end-of-run unconfirmed; succession camp end', () => {
  const detour = inst(17511, 'nighttravel-stack', [
    { morning: morning('haven', 'v1'), evening: evening('creek'), ctxDelta: { forageTrips: 0, tripHomeDetours: 2, patrols: 0 } },
    { morning: morning('creek', 'v1'), evening: evening('haven', { eveningOutcome: 'completed' }) },
  ]);
  // ctxDelta lives on the decision in the real corpus; the evening carries
  // the same delta object in the driver, so set it on the evening too.
  detour.evenings[0].ctxDelta = { forageTrips: 0, tripHomeDetours: 2, patrols: 0 };
  const cd = classifyConfirmed(detour);
  assert.deepStrictEqual(cd.confirmedDays, [1]);
  assert.strictEqual(cd.failedReturn, 1);
  assert.deepStrictEqual(cd.confirmed[0].signals, ['tripHomeDetours:2']);

  const eor = inst(17508, 'deed-seeking', [
    { morning: morning('haven', 'v1'), evening: evening('creek') },
  ]);
  const ce = classifyConfirmed(eor);
  assert.strictEqual(ce.confirmedNights, 0);
  assert.strictEqual(ce.unconfirmedEndOfRun, 1);
  assert.strictEqual(ce.unconfirmed[0].kind, 'end-of-run');

  const succ = inst(17505, 'deed-seeking', [
    { morning: morning('haven', 'v1'), evening: evening('creek') },
    { morning: morning('creek', 'v1'), evening: evening('creek') },
    { morning: morning('haven', 'v2'), evening: evening('haven') },
  ]);
  const cs = classifyConfirmed(succ);
  assert.deepStrictEqual(cs.confirmedDays, [1]);
  assert.strictEqual(cs.unconfirmed[0].vesselChanged, true);
  assert.strictEqual(cs.camps[0].endStory, 'succession');
});

check('analyzeDir wiring on a temp corpus dir', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'confirmednight-test-'));
  const x = inst(17513, 'nighttravel-stack', [
    { morning: morning('haven', 'v1'), evening: evening('creek', { eveningOutcome: 'out-of-reach' }) },
    { morning: morning('creek', 'v1'), evening: evening('creek', { eveningOutcome: 'out-of-reach' }) },
    { morning: morning('creek', 'v1'), evening: evening('haven', { eveningOutcome: 'completed' }) },
  ]);
  fs.writeFileSync(path.join(dir, 'seed-17513.json'), JSON.stringify(x));
  const census = analyzeDir(dir);
  assert.strictEqual(census.legs, 1);
  assert.strictEqual(census.totalConfirmedNights, 2);
  assert.strictEqual(census.totalFailedReturn, 2);
  assert.strictEqual(census.classificationCompleteness, 1);
  assert.deepStrictEqual(census.seedsWithConfirmedNight, [17513]);
  assert.deepStrictEqual(census.campEndStories, { 'walk-home': 1 });
  fs.rmSync(dir, { recursive: true, force: true });
});

console.log('test-confirmednight-b: ' + passed + '/' + passed + ' pure checks passed');
