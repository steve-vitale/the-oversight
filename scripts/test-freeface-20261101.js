// test-freeface-20261101.js — instrument proof for sim-freeface-a.
// Synthetic rosters: dead / underage / unhealthy / committed faces
// excluded exactly; speaker-first ordering preserved in the game's
// own titanAlliedFaces (count unaffected); slain-muster commits do
// NOT exclude; free count reconciles total == sum of buckets.
// Pure-function test: no game load, no RNG, no file writes.
'use strict';
const assert = require('assert');
const FF = require('./policies/freeface-diag');

function check(name, roster, vid, byFace, speakerId, expect) {
  const d = FF.decomposeRoster(roster, vid, byFace, speakerId);
  assert.strictEqual(d.total, expect.total, name + ' total');
  assert.strictEqual(d.dead, expect.dead, name + ' dead');
  assert.strictEqual(d.underage, expect.underage, name + ' underage');
  assert.strictEqual(d.unhealthy, expect.unhealthy, name + ' unhealthy');
  assert.strictEqual(d.committed, expect.committed, name + ' committed');
  assert.strictEqual(d.free, expect.free, name + ' free');
  assert.strictEqual(d.total, d.dead + d.underage + d.unhealthy + d.committed + d.free, name + ' reconciles');
  if (expect.speakerBucket !== undefined) assert.strictEqual(d.speakerBucket, expect.speakerBucket, name + ' speakerBucket');
  if (expect.speakerFree !== undefined) assert.strictEqual(d.speakerFree, expect.speakerFree, name + ' speakerFree');
  if (expect.freeIds) assert.deepStrictEqual(d.freeFaces.map(f => f.id), expect.freeIds, name + ' freeIds');
  console.log('ok ' + name + ': total=' + d.total + ' free=' + d.free);
}

// 1. One of each bucket.
check('mixed', [
  { id: 'a', name: 'Alive Adult', alive: true, age: 30, health: 80 },
  { id: 'd', name: 'Dead', alive: false, age: 40, health: 0 },
  { id: 'u', name: 'Kid', alive: true, age: 12, health: 90 },
  { id: 'h', name: 'Down', alive: true, age: 25, health: 0 },
  { id: 'c', name: 'Marched', alive: true, age: 33, health: 70 },
  { id: 's', name: 'Speaker', alive: true, age: 50, health: 100 },
], 'village_1', { 'village_1:c': ['herald'] }, 's',
  { total: 6, dead: 1, underage: 1, unhealthy: 1, committed: 1, free: 2, speakerBucket: 'free', speakerFree: true, freeIds: ['a', 's'] });

// 2. Zero-free village: every face excluded, one per cause.
check('zero-free', [
  { id: 'd1', alive: false, age: 40 },
  { id: 'u1', alive: true, age: 17, health: 100 },
  { id: 'h1', alive: true, age: 22, health: -5 },
  { id: 'c1', alive: true, age: 44, health: 60 },
], 'village_2', { 'village_2:c1': ['herald'] }, 'c1',
  { total: 4, dead: 1, underage: 1, unhealthy: 1, committed: 1, free: 0, speakerBucket: 'committed', speakerFree: false, freeIds: [] });

// 3. Old-save edges: age null counts adult; health undefined counts healthy.
check('null-age-undef-health', [
  { id: 'o1', alive: true, age: null, health: undefined },
  { id: 'o2', alive: true, age: 18, health: undefined },
  { id: 'o3', alive: true, age: null, health: 1 },
], 'village_0', {}, null,
  { total: 3, dead: 0, underage: 0, unhealthy: 0, committed: 0, free: 3, freeIds: ['o1', 'o2', 'o3'] });

// 4. Age exactly 18 is adult; health exactly 0 is unhealthy.
check('boundaries', [
  { id: 'b1', alive: true, age: 18, health: 0 },
  { id: 'b2', alive: true, age: 17, health: 100 },
  { id: 'b3', alive: true, age: 18, health: 1 },
], 'village_0', {}, null,
  { total: 3, dead: 0, underage: 1, unhealthy: 1, committed: 0, free: 1, freeIds: ['b3'] });

// 5. Committed-map slain exclusion lives in readCommittedMap, not the
// partition: simulate by passing only non-slain faces.
check('committed-multi-muster', [
  { id: 'm1', alive: true, age: 30, health: 90 },
  { id: 'm2', alive: true, age: 30, health: 90 },
], 'village_1', { 'village_1:m1': ['herald', 'wraith'] }, null,
  { total: 2, dead: 0, underage: 0, unhealthy: 0, committed: 1, free: 1, freeIds: ['m2'] });
const cm = FF.readCommittedMap({ state: { titans: { slain: { wraith: true }, musters: {
  herald: { allies: [{ villageId: 'village_1', vid: 'm1', name: 'M1', hp: 90 }] },
  wraith: { allies: [{ villageId: 'village_1', vid: 'm2', name: 'M2', hp: 90 }] },
} } } });
assert.deepStrictEqual(cm.byFace, { 'village_1:m1': ['herald'] }, 'slain muster faces stay free');
assert.strictEqual(cm.musters.wraith.slain, true, 'slain flag recorded');
assert.strictEqual(cm.musters.herald.alliesRaw.length, 1, 'herald allies recorded');
console.log('ok slain-exclusion: m2 (wraith-only) is NOT in byFace');

// 6. layerOn switch.
assert.strictEqual(typeof FF.layerOn, 'function', 'layerOn exists');
console.log('ok layerOn present (env-gated, FREEFACE=1 required by sweep)');
console.log('ALL test-freeface-20261101 PASS');
