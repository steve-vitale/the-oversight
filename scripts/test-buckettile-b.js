#!/usr/bin/env node
// test-buckettile-b.js — pure proof test for analyze-buckettile-b.js.
// No game load, no RNG, no file writes to the repo (uses a temp dir
// under os.tmpdir() for the analyzeDir wiring check only).
'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { classifyBucketEvening, classifySeedBucket, analyzeDir } = require('./analyze-buckettile-b');

let passed = 0;
function check(name, fn) { fn(); passed++; console.log('ok: ' + name); }

// Synthetic classifySeed day row + raw evening row.
const D = (loopDay, o) => Object.assign({
  loopDay, startsHaven: false, endsHaven: false, eveningAway: true, onRoad: false,
  hasNextMorning: true, nextMorningAway: true, class: 'away-continuation',
  eveningOutcome: 'out-of-reach', eveningTile: 'creek', eveningInside: false,
  eveningMap: [1, 1], morningTile: 'creek', forageDelta: 0, patrolDelta: 0,
  travelLines: 0, rawCreek: false, rawRescued: false, inCombat: false,
}, o);
const E = (o) => Object.assign({ loopDay: 1, eveningOutcome: 'out-of-reach', woodcarry: null }, o);
const CLS = (o) => Object.assign({
  blockType: 'creek', probeAgrees: true, probeError: null, isCreek: true,
  blockedTile: { x: 2, y: 1 }, hopReturnKind: 'block:creek',
}, o);

check('gate1: null bucket + out-of-reach on a creek-tile evening', () => {
  const { gate, detail } = classifyBucketEvening(D(5, {}), E({ loopDay: 5 }));
  assert.strictEqual(gate, 'gate1');
  assert.strictEqual(detail.bucket, null);
  assert.strictEqual(detail.eveningOutcome, 'out-of-reach');
});

check('gate2-creek: travel-refused with bucket creek and creek inputs', () => {
  const wc = { bucket: 'creek', hopReturnKind: 'block:creek', classification: CLS({}), bridge: { attempted: false, skip: 'wood-short' }, rescued: false };
  const { gate, detail } = classifyBucketEvening(D(5, { eveningOutcome: 'travel-refused' }), E({ loopDay: 5, eveningOutcome: 'travel-refused', woodcarry: wc }));
  assert.strictEqual(gate, 'gate2-creek');
  assert.strictEqual(detail.blockType, 'creek');
  assert.strictEqual(detail.probeAgrees, true);
});

check('gate2-other: travel-refused with a non-creek block', () => {
  const wc = { bucket: 'other-refused', hopReturnKind: 'block:tree', classification: CLS({ blockType: 'tree', isCreek: false }), bridge: { attempted: false, skip: null }, rescued: false };
  const { gate, detail } = classifyBucketEvening(D(5, { eveningOutcome: 'travel-refused' }), E({ loopDay: 5, eveningOutcome: 'travel-refused', woodcarry: wc }));
  assert.strictEqual(gate, 'gate2-other');
  assert.strictEqual(detail.blockType, 'tree');
});

check('gate2-unclassified: creek hop that fails probe agreement', () => {
  const wc = { bucket: 'unclassified', hopReturnKind: 'block:creek', classification: CLS({ probeAgrees: false, isCreek: false }), bridge: { attempted: false, skip: null }, rescued: false };
  const { gate } = classifyBucketEvening(D(5, { eveningOutcome: 'travel-refused' }), E({ loopDay: 5, eveningOutcome: 'travel-refused', woodcarry: wc }));
  assert.strictEqual(gate, 'gate2-unclassified');
});

check('unexplained: null bucket with an outcome other than out-of-reach breaks the hypothesis', () => {
  const { gate } = classifyBucketEvening(D(5, { eveningOutcome: 'completed' }), E({ loopDay: 5, eveningOutcome: 'completed', woodcarry: null }));
  assert.strictEqual(gate, 'unexplained');
});

check('non-creek evenings never enter the creek census (classifySeedBucket)', () => {
  const inst = {
    seed: 17513, policy: 'nighttravel-stack', days: 30, errCount: 0,
    daysAlive: 2, endReason: 'horizon',
    woodcarryStore: { records: 0, classified: 0, unclassified: 0, otherRefused: 0, errs: 0 },
    decisions: [
      { loopDay: 1, morning: { inside: true, tile: 'haven', mapPx: 4, mapPy: 4, havenPx: 4, havenPy: 4 }, ctxDelta: { forageTrips: 0, patrols: 0 } },
      { loopDay: 2, morning: { inside: false, tile: 'creek', mapPx: 1, mapPy: 1, havenPx: 4, havenPy: 4 }, ctxDelta: { forageTrips: 0, patrols: 0 } },
    ],
    evenings: [
      { loopDay: 1, tile: 'creek', inside: false, mapPx: 1, mapPy: 1, havenPx: 4, havenPy: 4, roadActive: false, roadOnRoad: false, eveningOutcome: 'out-of-reach', woodcarry: null, dayLines: ['You walk'], ctxDelta: { forageTrips: 0, patrols: 0 }, inCombat: false },
      { loopDay: 2, tile: 'haven', inside: true, mapPx: 4, mapPy: 4, havenPx: 4, havenPy: 4, roadActive: false, roadOnRoad: false, eveningOutcome: 'completed', woodcarry: null, dayLines: [], ctxDelta: { forageTrips: 0, patrols: 0 }, inCombat: false },
    ],
  };
  const c = classifySeedBucket(inst);
  assert.strictEqual(c.creekTileEvenings, 1);
  assert.strictEqual(c.gate1, 1);
  assert.strictEqual(c.unexplained, 0);
  assert.deepStrictEqual(c.gate1Days, [1]);
  assert.strictEqual(c.storeRecords, 0);
});

check('analyzeDir wiring on a temp corpus dir', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'buckettile-test-'));
  const inst = {
    seed: 17513, policy: 'nighttravel-stack', days: 30, errCount: 0,
    daysAlive: 2, endReason: 'horizon',
    woodcarryStore: { records: 0, classified: 0, unclassified: 0, otherRefused: 0, errs: 0 },
    decisions: [
      { loopDay: 1, morning: { inside: true, tile: 'haven', mapPx: 4, mapPy: 4, havenPx: 4, havenPy: 4 }, ctxDelta: { forageTrips: 0, patrols: 0 } },
      { loopDay: 2, morning: { inside: false, tile: 'creek', mapPx: 1, mapPy: 1, havenPx: 4, havenPy: 4 }, ctxDelta: { forageTrips: 0, patrols: 0 } },
    ],
    evenings: [
      { loopDay: 1, tile: 'creek', inside: false, mapPx: 1, mapPy: 1, havenPx: 4, havenPy: 4, roadActive: false, roadOnRoad: false, eveningOutcome: 'out-of-reach', woodcarry: null, dayLines: ['You walk'], ctxDelta: { forageTrips: 0, patrols: 0 }, inCombat: false },
      { loopDay: 2, tile: 'haven', inside: true, mapPx: 4, mapPy: 4, havenPx: 4, havenPy: 4, roadActive: false, roadOnRoad: false, eveningOutcome: 'completed', woodcarry: null, dayLines: [], ctxDelta: { forageTrips: 0, patrols: 0 }, inCombat: false },
    ],
  };
  fs.writeFileSync(path.join(dir, 'seed-17513.json'), JSON.stringify(inst));
  const census = analyzeDir(dir);
  assert.strictEqual(census.legs, 1);
  assert.strictEqual(census.totalCreekTileEvenings, 1);
  assert.strictEqual(census.totalGate1, 1);
  assert.strictEqual(census.totalUnexplained, 0);
  assert.deepStrictEqual(census.seedsWithCreekTile, [17513]);
  fs.rmSync(dir, { recursive: true, force: true });
});

console.log('test-buckettile-b: ' + passed + '/' + passed + ' pure checks passed');
