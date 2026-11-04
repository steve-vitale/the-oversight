// test-holdbeat-20261104.js — proof test for the hold-beat instrument +
// analyzer (arm sim-holdbeat-a). Fixture tests (seq ordering both
// directions, overlap-window construction, hold-beat moment capture,
// judgeDiag semantics) + one live harness smoke (capped math, gate ==
// recount, peak-stable snapshot, gate-call counting, live kill event
// with seq + vetkill beat capture). No repo writes.
// Usage: node scripts/test-holdbeat-20261104.js
'use strict';
const path = require('path');
const assert = require('assert');
const AN = require(path.join(__dirname, 'holdbeat-analyze-20261104'));
const INST = require(path.join(__dirname, 'holdbeat-instrument-20261104'));

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('ok ' + pass + ' - ' + name); }

function snap(day, over) {
  return Object.assign({
    day: day, scholarId: 'v_scholar', roster: ['v_scholar'],
    readiness5: { ready: false, armored: 0, armed: 0, tricks: 0, veterans: 0, demand: { armored: 4, armorP: 15, armed: 6, tricks: 3, veterans: 2 }, short: ['veterans'] },
    standing: { total: 0, war: 0, diplomacy: 0, plenty: 0, warPts: 0, links: 0, feasts: 0 },
    capped: 0, peak: 0, deferral5: { deferred: false, ready: false },
    w4faced: 0, w5faced: 0, scaleRank: 'village',
    logW4: [], veteranVids: [], veteranVidsAll: [], veteranRecount: 0, veteranMismatch: false, livingCount: 1,
  }, over || {});
}
function seed(over) {
  return Object.assign({ seed: 1, run: 'fixture', days: 10, endReason: 'village-lost',
    won: false, maxWave: 4, scaleRank: 'village', endUnlockedWave: 4,
    peakBeforeEndCall: 0, peakAfterEndCall: 0, endCallMovedPeak: false,
    daily: [], killEvents: [], beatEvents: [], gateCalls: [], deathEvents: [],
    standingLines: [], instrumentErrors: [] }, over || {});
}

ok('overlap window construction + window day rows', function () {
  const s = AN.summarizeSeed(seed({ daily: [
    snap(108, { veteranRecount: 1, veteranVids: ['a'], readiness5: { ready: false, veterans: 1, short: ['veterans'] }, capped: 210, peak: 4 }),
    snap(109, { veteranRecount: 2, veteranVids: ['a', 'b'], readiness5: { ready: false, veterans: 2, short: ['armor'] }, capped: 210, peak: 4 }),
    snap(110, { veteranRecount: 2, veteranVids: ['a', 'b'], readiness5: { ready: true, veterans: 2, short: [] }, capped: 210, peak: 4 }),
    snap(111, { veteranRecount: 1, veteranVids: ['a'], readiness5: { ready: false, veterans: 1, short: ['veterans'] }, capped: 210, peak: 4 }),
  ], gateCalls: [{ day: 109, seqEntry: 5, seqExit: 6, gated: 199 }, { day: 110, seqEntry: 9, seqExit: 10, gated: 199 }],
  beatEvents: [{ day: 110, kind: 'release5', seq: 11, line: 'greenlit the fifth draft' }] }));
  assert.strictEqual(s.overlapWindows.length, 1);
  assert.strictEqual(s.overlapWindows[0].startDay, 109);
  assert.strictEqual(s.overlapWindows[0].endDay, 110);
  assert.strictEqual(s.overlapDayCount, 2);
  assert.strictEqual(s.overlapWindows[0].days[0].standingSufficient, true);
  assert.strictEqual(s.overlapWindows[0].days[0].gateCalls, 1);
  assert.strictEqual(s.overlapWindows[0].days[1].ready5, true);
  assert.strictEqual(s.overlapWindows[0].days[1].release5Fired, true);
  assert.strictEqual(s.maxLivingVets, 2);
  assert.deepStrictEqual(s.maxLivingVetDays, [109, 110]);
});

ok('Q2 ordering: beat-before-credit (pre-kill read)', function () {
  const s = AN.summarizeSeed(seed({ daily: [snap(134, { veteranRecount: 1 })],
    killEvents: [{ day: 134, fn: 'recordWaveKill', mid: 'm_x', wave: 4, by: 'v1', via: 'player', seqEntry: 50, seqCredit: 52, beastHpAtFightStart: 440, beastMaxHp: 900 }],
    beatEvents: [{ day: 134, kind: 'hold', seq: 40, beatVeterans: 0, momentVeterans: 0, line: 'blood your fighters (0 of 2 veterans)' }],
    gateCalls: [{ day: 134, seqEntry: 30, seqExit: 45, gated: 199 }] }));
  assert.strictEqual(s.killDayOrders.length, 1);
  assert.strictEqual(s.killDayOrders[0].holds[0].order, 'beat-before-credit');
  assert.strictEqual(s.killDayOrders[0].holds[0].momentVeterans, 0);
  assert.strictEqual(s.killDayOrders[0].gatesBeforeCredit, 1);
  assert.strictEqual(s.killDayOrders[0].gatesAfterCredit, 0);
});

ok('Q2 ordering: beat-after-credit (real count gap)', function () {
  const s = AN.summarizeSeed(seed({ daily: [snap(134, { veteranRecount: 1 })],
    killEvents: [{ day: 134, fn: 'recordWaveKill', mid: 'm_x', wave: 4, by: 'v1', via: 'player', seqEntry: 50, seqCredit: 52 }],
    beatEvents: [{ day: 134, kind: 'hold', seq: 80, beatVeterans: 1, momentVeterans: 1, line: 'blood your fighters (1 of 2 veterans)' }],
    gateCalls: [{ day: 134, seqEntry: 70, seqExit: 90, gated: 199 }] }));
  assert.strictEqual(s.killDayOrders[0].holds[0].order, 'beat-after-credit');
  assert.strictEqual(s.killDayOrders[0].gatesAfterCredit, 1);
});

ok('hold-beat regex + release5 regex classify correctly', function () {
  assert.ok(INST.HOLD_RE.test('blood your fighters (0 of 2 veterans)'));
  const m = 'blood your fighters (1 of 2 veterans)'.match(INST.HOLD_RE);
  assert.strictEqual(m[1], '1');
  assert.ok(INST.RELEASE5_RE.test('the System greenlit the fifth draft'));
  assert.ok(!INST.RELEASE5_RE.test('Wave 4 talent has been released into your sector'));
});

ok('judgeDiag: window + ordered beat => both definitive; no window + errors => Q1 not definitive', function () {
  const withBoth = AN.summarizeSeed(seed({ daily: [snap(108, { veteranRecount: 2 })],
    killEvents: [{ day: 108, wave: 4, by: 'v1', seqEntry: 1, seqCredit: 2 }],
    beatEvents: [{ day: 108, kind: 'hold', seq: 3, beatVeterans: 2, momentVeterans: 2 }] }));
  const j1 = AN.judgeDiag([withBoth]);
  assert.strictEqual(j1.q1Definitive, true);
  assert.strictEqual(j1.q2Definitive, true);
  assert.strictEqual(j1.totalWindows, 1);
  const noWindowErr = AN.summarizeSeed(seed({ daily: [snap(108, { veteranRecount: 1 })], instrumentErrors: ['x: boom'] }));
  const j2 = AN.judgeDiag([noWindowErr]);
  assert.strictEqual(j2.q1Definitive, false);
  assert.strictEqual(j2.q2Definitive, false);
  const noWindowClean = AN.summarizeSeed(seed({ daily: [snap(108, { veteranRecount: 1 })] }));
  const j3 = AN.judgeDiag([noWindowClean]);
  assert.strictEqual(j3.q1Definitive, true);
  assert.strictEqual(j3.q2Definitive, false);
});

// --- live harness smoke ---
(async function () {
  const { loadGame, setupGame } = require(path.join(__dirname, 'sim-harness'));
  const { Game } = await loadGame({ seed: 99101, mode: 'holdbeat-proof', fullTelemetry: false });
  await setupGame(Game);
  const inst = INST.install(Game);
  try {
    const snap0 = inst.snapshot();
    assert.ok(snap0.readiness5 && typeof snap0.readiness5.ready === 'boolean', 'gate readiness5 present');
    assert.strictEqual(snap0.veteranRecount, (snap0.readiness5.veterans | 0), 'recount == gate veteran count on a fresh game');
    assert.ok(snap0.standing && typeof snap0.standing.total === 'number', 'standing breakdown present');
    assert.strictEqual(snap0.capped, ((snap0.standing.war | 0) + (snap0.standing.diplomacy | 0) + Math.min((snap0.standing.plenty | 0), 100)),
      'capped == war + diplomacy + min(plenty,100)');
    assert.ok(Number.isInteger(snap0.peak), 'peak is an integer');
    const peakBefore = snap0.peak;
    inst.snapshot();
    assert.strictEqual(inst.t.daily[1].peak, peakBefore, 'snapshot does not move the peak');
    assert.strictEqual(inst.t.gateCalls.length, 0, 'snapshot makes no natural gate calls');
    const gatesBefore = Game.villageStandingTotal();
    assert.strictEqual(inst.t.gateCalls.length, 1, 'gate wrap counts a natural gate call');
    assert.ok(Number.isInteger(gatesBefore), 'gated total is an integer');
    const m4 = (Game.data.monsters || []).find(function (m) { return m && (m.wave || 1) === 4; });
    assert.ok(m4, 'a wave-4 monster def must exist');
    const roster = ((Game.state || {}).village || {}).roster || [];
    const vid = roster.find(function (id) { return id && id !== Game.villagerId; }) || Game.villagerId;
    Game.recordWaveKill(m4.id, vid, 'wild', null);
    assert.strictEqual(inst.t.killEvents.length, 1, 'live kill event captured');
    assert.strictEqual(inst.t.killEvents[0].wave, 4);
    assert.ok(inst.t.killEvents[0].seqCredit > inst.t.killEvents[0].seqEntry, 'kill credit seq after entry seq');
    assert.ok(inst.t.beatEvents.some(function (b) { return b.kind === 'vetkill'; }), 'live vetkill beat captured with seq');
    const snap1 = inst.snapshot();
    assert.ok((snap1.logW4 || []).some(function (e) { return e.by === vid && e.w === 4; }), 'kill in logW4 snapshot');
    assert.strictEqual(inst.t.instrumentErrors.length, 0, 'no instrument errors');
    pass++;
    console.log('ok ' + pass + ' - live harness smoke: capped math, gate == recount, peak-stable snapshot, gate-call counting, live kill + vetkill beat');
  } finally {
    try { inst.uninstall(); } catch (e) {}
  }
  console.log('PASS ' + pass + '/' + pass);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
