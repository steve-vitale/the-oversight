#!/usr/bin/env node
// test-strandred-b.js — pure proof test for analyze-strandred-b.js.
// No game load, no RNG, no file writes to the repo (uses a temp dir
// under os.tmpdir() for the analyzeDir wiring check only).
'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { classifyCreek, analyzeDir } = require('./analyze-strandred-b');
const { classifySeed } = require('./analyze-absencehunt-b');

let passed = 0;
function check(name, fn) { fn(); passed++; console.log('ok: ' + name); }

// Synthetic classified days (shape produced by classifySeed).
const D = (loopDay, o) => Object.assign({
  loopDay, startsHaven: true, endsHaven: true, eveningAway: false, onRoad: false,
  hasNextMorning: true, nextMorningAway: false, class: 'stay',
  eveningOutcome: 'policy-no-record', eveningTile: 'haven', eveningInside: true,
  eveningMap: [4, 4], morningTile: 'haven', forageDelta: 0, patrolDelta: 0,
  travelLines: 0, rawCreek: false, rawRescued: false, inCombat: false,
}, o);

check('genuine creek-tile evening counts; haven creek tile does not', () => {
  const days = [
    D(1, { class: 'genuine', eveningTile: 'creek', endsHaven: false, eveningAway: true }),
    D(2, { class: 'away-continuation', eveningTile: 'creek', endsHaven: false, eveningAway: true, startsHaven: false }),
    D(3, { class: 'stay', eveningTile: 'creek', endsHaven: true }),
    D(4, { class: 'sleep-return', eveningTile: 'creek', endsHaven: false, eveningAway: true }),
  ];
  const c = classifyCreek(days);
  assert.strictEqual(c.creekTileEvenings, 3);
  assert.deepStrictEqual(c.creekTileDays, [1, 2, 4]);
  assert.strictEqual(c.genuineCreekTileEvenings, 1);
  assert.deepStrictEqual(c.genuineCreekTileDays, [1]);
  assert.strictEqual(c.sleepReturnCreekEvenings, 1);
  assert.strictEqual(c.continuationCreekEvenings, 1);
});

check('camp = consecutive creek-tile evenings; genuine iff opening night genuine', () => {
  const days = [
    D(5, { class: 'genuine', eveningTile: 'creek', endsHaven: false, eveningAway: true }),
    D(6, { class: 'away-continuation', eveningTile: 'creek', endsHaven: false, eveningAway: true, startsHaven: false }),
    D(7, { class: 'away-continuation', eveningTile: 'creek', endsHaven: false, eveningAway: true, startsHaven: false }),
    D(9, { class: 'genuine', eveningTile: 'creek', endsHaven: false, eveningAway: true }),
    D(10, { class: 'stay', eveningTile: 'haven', endsHaven: true }),
  ];
  const c = classifyCreek(days);
  assert.strictEqual(c.camps.length, 1);
  assert.deepStrictEqual(c.camps[0].days, [5, 6, 7]);
  assert.strictEqual(c.camps[0].genuine, true);
  assert.strictEqual(c.genuineCamps.length, 1);
});

check('road creek evening excluded; single creek night is not a camp', () => {
  const days = [
    D(1, { class: 'road-absence', eveningTile: 'creek', endsHaven: false, eveningAway: true, onRoad: true }),
    D(2, { class: 'genuine', eveningTile: 'creek', endsHaven: false, eveningAway: true }),
  ];
  const c = classifyCreek(days);
  assert.strictEqual(c.creekTileEvenings, 1);
  assert.strictEqual(c.camps.length, 0);
});

check('wiring: classifySeed -> classifyCreek on a synthetic instance', () => {
  // One genuine creek night: day1 morning haven, evening creek away,
  // day2 morning away (away-continuation day), day2 evening haven.
  const inst = {
    seed: 99999, policy: 'deed-seeking', days: 30, errCount: 0,
    daysAlive: 2, endReason: 'horizon',
    decisions: [
      { loopDay: 1, morning: { inside: true, tile: 'haven', mapPx: 4, mapPy: 4, havenPx: 4, havenPy: 4 }, ctxDelta: { forageTrips: 0, patrols: 1 } },
      { loopDay: 2, morning: { inside: false, tile: 'creek', mapPx: 1, mapPy: 3, havenPx: 4, havenPy: 4 }, ctxDelta: { forageTrips: 1, patrols: 0 } },
    ],
    evenings: [
      { loopDay: 1, tile: 'creek', inside: false, mapPx: 1, mapPy: 3, havenPx: 4, havenPy: 4, roadActive: false, roadOnRoad: false, woodcarry: null, dayLines: ['You walk to the creek'], ctxDelta: { forageTrips: 0, patrols: 1 }, inCombat: false },
      { loopDay: 2, tile: 'haven', inside: true, mapPx: 4, mapPy: 4, havenPx: 4, havenPy: 4, roadActive: false, roadOnRoad: false, woodcarry: null, dayLines: [], ctxDelta: { forageTrips: 1, patrols: 0 }, inCombat: false },
    ],
  };
  const base = classifySeed(inst);
  assert.strictEqual(base.genuine, 1);
  const c = classifyCreek(base.days);
  assert.strictEqual(c.genuineCreekTileEvenings, 1);
  assert.deepStrictEqual(c.genuineCreekTileDays, [1]);
});

check('analyzeDir wiring on a temp corpus dir', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'strandred-test-'));
  const inst = {
    seed: 17505, policy: 'deed-seeking', days: 30, errCount: 0, daysAlive: 2, endReason: 'horizon',
    decisions: [
      { loopDay: 1, morning: { inside: true, tile: 'haven', mapPx: 4, mapPy: 4, havenPx: 4, havenPy: 4 }, ctxDelta: { forageTrips: 0, patrols: 1 } },
      { loopDay: 2, morning: { inside: false, tile: 'creek', mapPx: 1, mapPy: 3, havenPx: 4, havenPy: 4 }, ctxDelta: { forageTrips: 1, patrols: 0 } },
    ],
    evenings: [
      { loopDay: 1, tile: 'creek', inside: false, mapPx: 1, mapPy: 3, havenPx: 4, havenPy: 4, roadActive: false, roadOnRoad: false, woodcarry: null, dayLines: ['You walk'], ctxDelta: { forageTrips: 0, patrols: 1 }, inCombat: false },
      { loopDay: 2, tile: 'haven', inside: true, mapPx: 4, mapPy: 4, havenPx: 4, havenPy: 4, roadActive: false, roadOnRoad: false, woodcarry: null, dayLines: [], ctxDelta: { forageTrips: 1, patrols: 0 }, inCombat: false },
    ],
  };
  fs.writeFileSync(path.join(dir, 'seed-17505.json'), JSON.stringify(inst));
  const census = analyzeDir(dir);
  assert.strictEqual(census.legs, 1);
  assert.strictEqual(census.totalGenuineCreekTileEvenings, 1);
  assert.deepStrictEqual(census.seedsWithGenuineCreekTile, [17505]);
  fs.rmSync(dir, { recursive: true, force: true });
});

console.log('test-strandred-b: ' + passed + '/' + passed + ' pure checks passed');
