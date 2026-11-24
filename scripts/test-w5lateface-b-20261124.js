// Proof for sim-w5lateface-b: classifier fixtures + live-corpus smoke
// + determinism + cross-corpus agreement.
//   node scripts/test-w5lateface-b-20261124.js
// Exit 0 = all pass. No repo writes: the analyzer runs in-memory.
'use strict';
const assert = require('assert');
const A = require('./w5lateface-b-analyze-20261124.js');

let n = 0;
function check(name, fn) { n++; fn(); console.log('ok ' + n + ' - ' + name); }

// --- synthetic seed records (minimal shape the analyzer reads) ---
function rec(o) {
  return Object.assign({
    seed: 'X', days: 150, endReason: 'survived', villageLost: false,
    scaleRank: 'regional', daily: [], killEvents: [], releaseLines: [],
  }, o);
}
function day(d, extra) {
  return Object.assign({ day: d, peak: 4, w5faced: 0,
    readiness5: { ready: false, veterans: 1, armored: 2, armed: 4, short: ['veterans'] } }, extra || {});
}

// 1. FACED via w5faced snapshot; door day from peak; late by cutoff.
check('FACED via snapshot, late at 101 / early at 100', () => {
  const s = A.deriveSeed(rec({ seed: 'T1', daily: [
    day(100, { peak: 5 }), day(101), day(110, { w5faced: 1 }),
  ], releaseLines: [{ day: 100, line: 'x' }] }));
  assert.strictEqual(s.doorDay, 100);
  assert.strictEqual(s.firstFaceDay, 110);
  assert.strictEqual(s.daysToFace, 10);
  assert.strictEqual(s.late, undefined); // late is assigned in analyze(), not derive
  assert.strictEqual(100 > A.LATE_CUTOFF, false);
  assert.strictEqual(101 > A.LATE_CUTOFF, true);
  const late = Object.assign({}, s, { doorDay: 101, late: true });
  assert.strictEqual(A.classifySeed(late).cls, 'FACED');
});

// 2. Kill before the first w5faced snapshot counts as the face day
// (109306: kill d101, first faced snapshot d102).
check('kill-before-faced-snapshot is the face day', () => {
  const s = A.deriveSeed(rec({ seed: 'T2', daily: [
    day(92, { peak: 5 }), day(101), day(102, { w5faced: 1 }),
  ], killEvents: [{ day: 101, wave: 5, mid: 'editor', by: 'v1', via: 'wild', entryAdded: true }] }));
  assert.strictEqual(s.firstFaceDay, 101);
  assert.strictEqual(s.daysToFace, 9);
});

// 3. Duplicate recordWaveKill calls (entryAdded false) count once.
check('duplicate kill calls count once', () => {
  const s = A.deriveSeed(rec({ seed: 'T3', daily: [day(65, { peak: 5 })],
    killEvents: [
      { day: 91, wave: 5, mid: 'editor', by: 'v1', via: 'player', entryAdded: true },
      { day: 91, wave: 5, mid: 'editor', by: 'v1', via: 'player', entryAdded: false },
    ] }));
  assert.strictEqual(s.w5kills.length, 1);
});

// 4. FACED via contact row only (bloodcluster-style, no snapshot/kill).
check('FACED via contact row only', () => {
  const s = A.deriveSeed(rec({ seed: 'T4', daily: [day(117, { peak: 5 }), day(126)],
    fieldFights: [{ day: 126, mid: 'spoiler', wave: 5, outcome: 'vFlee', rounds: 2 }],
    tbStarts: [] }));
  assert.strictEqual(s.firstFaceDay, 126);
  assert.strictEqual(s.daysToFace, 9);
  assert.strictEqual(A.classifySeed(Object.assign({}, s, { late: true })).cls, 'FACED');
});

// 5. NO-SPAWN: survived, 0 wave-5 anything, wave-4 contacts continue.
check('NO-SPAWN with wave-4 control', () => {
  const s = A.deriveSeed(rec({ seed: 'T5', days: 150, daily: [
    day(138, { peak: 5 }), day(150),
  ], fieldFights: [
    { day: 140, mid: 'eulogy', wave: 4, outcome: 'vFlee', rounds: 2 },
    { day: 145, mid: 'strike', wave: 4, outcome: 'vDie', rounds: 1 },
  ], tbStarts: [] }));
  assert.strictEqual(s.faced, false);
  const c = A.classifySeed(Object.assign({}, s, { late: true }));
  assert.strictEqual(c.cls, 'NO-SPAWN');
});

// 6. DIED-BEFORE-FACE: village lost, no face.
check('DIED-BEFORE-FACE', () => {
  const s = A.deriveSeed(rec({ seed: 'T6', days: 97, endReason: 'village-lost',
    villageLost: true, daily: [day(65, { peak: 5 }), day(97)] }));
  const c = A.classifySeed(Object.assign({}, s, { late: true }));
  assert.strictEqual(c.cls, 'DIED-BEFORE-FACE');
});

// 7. UNCLASSIFIED: survived, no face, no contacts of any wave
// post-door — no-spawn cannot be separated from no-meetings.
check('UNCLASSIFIED when no post-door meetings at all', () => {
  const s = A.deriveSeed(rec({ seed: 'T7', daily: [day(138, { peak: 5 }), day(150)],
    fieldFights: [], tbStarts: [] }));
  assert.strictEqual(A.classifySeed(Object.assign({}, s, { late: true })).cls, 'UNCLASSIFIED');
});

// 8. UNCLASSIFIED: survived, no face, no contact rows in the corpus.
check('UNCLASSIFIED without contact data', () => {
  const s = A.deriveSeed(rec({ seed: 'T8', daily: [day(138, { peak: 5 }), day(150)] }));
  assert.strictEqual(s.hasContactData, false);
  assert.strictEqual(A.classifySeed(Object.assign({}, s, { late: true })).cls, 'UNCLASSIFIED');
});

// 9. Door cross-check tolerates the day-before release line.
check('door cross-check tolerates release day-before', () => {
  const s = A.deriveSeed(rec({ seed: 'T9', daily: [day(117, { peak: 5 })],
    releaseLines: [{ day: 116, line: 'RATINGS ARE UP' }] }));
  assert.strictEqual(s.doorDay, 117);
  assert.strictEqual(s.releaseDay, 116);
  assert.strictEqual(s.doorCrossCheckOk, true);
});

// --- live-corpus smoke: the judged corpora, as committed ---
check('live corpora: 6 unlocks, frozen door days, 0 unclassified', () => {
  const out = A.analyze();
  assert.deepStrictEqual(out.missingFiles, [], 'all corpus files present');
  assert.strictEqual(out.seedsExamined, 24, '8 pilot + 16 confirm seeds');
  const doors = {};
  for (const u of out.unlocks) doors[u.seed] = u.doorDay;
  assert.deepStrictEqual(doors, {
    '109301': 80, '109306': 92, '109311': 117,
    '109312': 89, '109313': 65, '109314': 138,
  }, 'door days match the published evidence');
  assert.strictEqual(out.primary.lateUnlocked, 2, 'late = 109311, 109314');
  assert.strictEqual(out.primary.facedLate, 1, '109311 faced, 109314 did not');
  assert.strictEqual(out.primary.unclassifiedLate, 0, 'GO bar: 0 unclassified');
  assert.deepStrictEqual(out.crossCorpus.disagreements, [], 'corpora agree on door/face days');
  const bySeed = {};
  for (const u of out.unlocks) bySeed[u.seed] = u;
  assert.strictEqual(bySeed['109311'].outcome, 'FACED');
  assert.strictEqual(bySeed['109311'].daysToFace, 9);
  assert.strictEqual(bySeed['109314'].outcome, 'NO-SPAWN');
  assert.strictEqual(bySeed['109314'].runway, 12);
  assert.strictEqual(bySeed['109301'].daysToFace, 1);
  assert.strictEqual(bySeed['109306'].daysToFace, 9, 'kill day 101, not snapshot day 102');
  assert.strictEqual(bySeed['109312'].daysToFace, 6);
  assert.strictEqual(bySeed['109313'].daysToFace, 10);
  // Deduped kills: 109313 has ONE wave-5 log row (vetpair correction).
  assert.strictEqual(bySeed['109313'].w5kills.length, 1);
  assert.strictEqual(bySeed['109312'].w5kills.length, 2);
  // 109314: zero wave-5 contacts while wave-4 contacts continue.
  assert.strictEqual(bySeed['109314'].contacts.w5total, 0);
  assert.ok(bySeed['109314'].contacts.w4total > 0, 'spawn-side control');
});

// --- determinism: two runs over the frozen corpora are identical ---
check('determinism: analyze() twice is byte-identical', () => {
  const a = JSON.stringify(A.analyze());
  const b = JSON.stringify(A.analyze());
  assert.strictEqual(a, b);
});

console.log('test-w5lateface-b: ' + n + '/' + n + ' PASS');
