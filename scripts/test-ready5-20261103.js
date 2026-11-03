// test-ready5-20261103.js — proof test for the readiness-5 release
// re-measurement instrument + analyzer (arm sim-ready5-a).
// Fixture-based (ready-day/run math, veteran-to-kill linkage,
// door-rule release classification, blocked-day splits) plus one live
// harness smoke: a fresh loaded game snapshots with gate veteran
// count == instrument recount, capped == war+diplomacy+min(plenty,100),
// and no instrument errors. No repo writes.
// Usage: node scripts/test-ready5-20261103.js
'use strict';
const path = require('path');
const assert = require('assert');
const AN = require(path.join(__dirname, 'ready5-analyze-20261103'));
const INST = require(path.join(__dirname, 'ready5-instrument-20261103'));

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('ok ' + pass + ' - ' + name); }

function snap(day, over) {
  return Object.assign({
    day: day, scholarId: 'v_scholar', roster: ['v_scholar'],
    readiness5: { ready: false, armored: 0, armed: 0, tricks: 0, veterans: 0, demand: { armored: 4, armorP: 15, armed: 6, tricks: 3, veterans: 2 }, short: ['veterans'] },
    readiness4: { ready: true },
    standing: { total: 0, war: 0, diplomacy: 0, plenty: 0 },
    capped: 0, peak: 0, deferral5: { deferred: false, ready: false },
    w4faced: 0, w5faced: 0, w3rung: { met: true }, scaleRank: 'village',
    logW4: [], veteranVids: [], veteranVidsAll: [], veteranRecount: 0, veteranMismatch: false, livingCount: 1,
  }, over || {});
}
function seed(over) {
  return Object.assign({ seed: 1, run: 'fixture', days: 10, endReason: 'village-lost',
    won: false, maxWave: 4, scaleRank: 'village', endUnlockedWave: 4,
    peakBeforeEndCall: 0, peakAfterEndCall: 0, endCallMovedPeak: false,
    daily: [], killEvents: [], deathEvents: [], standingLines: [], instrumentErrors: [] }, over || {});
}
function readySnap(day, capped, peak) {
  return snap(day, { readiness5: { ready: true, armored: 4, armed: 6, tricks: 3, veterans: 2, demand: { armored: 4, armorP: 15, armed: 6, tricks: 3, veterans: 2 }, short: [] },
    standing: { total: capped, war: capped, diplomacy: 0, plenty: 0 }, capped: capped, peak: peak });
}

// --- ready-day math ---
ok('ready days + contiguous runs', function () {
  const s = AN.summarizeSeed(seed({ daily: [snap(10), readySnap(11, 150, 0), readySnap(12, 150, 0), snap(13), readySnap(14, 150, 0)] }));
  assert.deepStrictEqual(s.readyDays, [11, 12, 14]);
  assert.deepStrictEqual(s.readyRuns, [{ start: 11, end: 12 }, { start: 14, end: 14 }]);
  assert.strictEqual(s.readyDayCount, 3);
});

// --- veteran reconciliation ---
ok('veteran reconciles to kill log; dead killer is not a veteran', function () {
  const last = snap(20, { logW4: [{ d: 5, mid: 'suburb', w: 4, by: 'v_a', via: 'companion' }, { d: 6, mid: 'congregation', w: 4, by: 'v_b', via: 'player' }, { d: 7, mid: 'eater', w: 4, by: 'v_dead', via: 'wild' }],
    veteranVids: ['v_a', 'v_b'], veteranVidsAll: ['v_a', 'v_b', 'v_dead'], veteranRecount: 2 });
  const s = AN.summarizeSeed(seed({ daily: [snap(10), last] }));
  assert.deepStrictEqual(s.vetWithoutKill, []);
  assert.deepStrictEqual(s.killersNotVeterans, ['v_dead']);
  assert.strictEqual(s.logW4Count, 3);
});
ok('veteran without a kill entry is flagged', function () {
  const last = snap(20, { logW4: [], veteranVids: ['v_ghost'], veteranRecount: 1 });
  const s = AN.summarizeSeed(seed({ daily: [last] }));
  assert.deepStrictEqual(s.vetWithoutKill, ['v_ghost']);
});
ok('gate/recount mismatch days flagged', function () {
  const s = AN.summarizeSeed(seed({ daily: [snap(10, { veteranMismatch: true }), snap(11, { veteranMismatch: false })] }));
  assert.deepStrictEqual(s.mismatchDays, [10]);
});

// --- door-rule release classification ---
ok('peak-to-5 with a release line same day is classified', function () {
  const s = AN.summarizeSeed(seed({
    daily: [snap(10, { peak: 4 }), snap(11, { peak: 5 })],
    standingLines: [{ day: 11, via: 'sysSay', line: '📡 RATINGS ARE UP... the Producers have greenlit the fifth draft. Wave 5 talent has been released.' }],
  }));
  assert.strictEqual(s.doorOpenDay, 11);
  assert.deepStrictEqual(s.unclassifiedReleases, []);
  assert.strictEqual(s.releaseLines.length, 1);
});
ok('peak-to-5 without any release line is unclassified', function () {
  const s = AN.summarizeSeed(seed({ daily: [snap(10, { peak: 4 }), snap(11, { peak: 5 })], standingLines: [] }));
  assert.strictEqual(s.unclassifiedReleases.length, 1);
  assert.strictEqual(s.unclassifiedReleases[0].day, 11);
});
ok('end-call release line without snapshot peak is not unclassified', function () {
  const s = AN.summarizeSeed(seed({ daily: [snap(10, { peak: 4 })],
    standingLines: [{ day: 10, via: 'sysSay', line: '📡 RATINGS ARE UP... the Producers have greenlit the fifth draft.' }],
    endUnlockedWave: 5, endCallMovedPeak: true }));
  assert.deepStrictEqual(s.unclassifiedReleases, []);
});
ok('hold lines counted, not mistaken for releases', function () {
  const s = AN.summarizeSeed(seed({ daily: [snap(10)],
    standingLines: [{ day: 10, via: 'sysSay', line: '📡 The fifth draft stays in the wings. It wants a village that can fight — blood your fighters (0 of 2 veterans).' }] }));
  assert.strictEqual(s.holdLineCount, 1);
  assert.strictEqual(s.releaseLines.length, 0);
  assert.deepStrictEqual(s.unclassifiedReleases, []);
});

// --- blocked-day splits ---
ok('ready + standing-short days vs standing-ok-not-ready short bars', function () {
  const s = AN.summarizeSeed(seed({ daily: [
    readySnap(11, 150, 0),
    snap(12, { capped: 210, standing: { total: 210, war: 210, diplomacy: 0, plenty: 0 }, readiness5: { ready: false, armored: 4, armed: 6, tricks: 3, veterans: 0, short: ['veterans'] } }),
    readySnap(13, 210, 0),
  ] }));
  assert.strictEqual(s.readyBlockedStandingDays, 1, 'day 11 ready but capped 150');
  assert.strictEqual(s.readyBlockedOtherDays, 1, 'day 13 ready, capped 210, peak still 0');
  assert.strictEqual(s.standingOkNotReadyDays, 1);
  assert.deepStrictEqual(s.shortBarDays, { veterans: 1 });
  assert.strictEqual(s.bestCapped, 210);
  assert.deepStrictEqual(s.bestSplit, { war: 210, diplomacy: 0, plenty: 0 });
});

// --- live harness smoke ---
(async function () {
  const { loadGame, setupGame } = require(path.join(__dirname, 'sim-harness'));
  const { Game } = await loadGame({ seed: 99101, mode: 'ready5-proof', fullTelemetry: false });
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
    assert.ok(snap0.deferral5 && typeof snap0.deferral5.deferred === 'boolean', 'deferral5 present');
    // Snapshot must NOT move the peak (read-only readers only).
    const peakBefore = snap0.peak;
    inst.snapshot();
    assert.strictEqual(inst.t.daily[1].peak, peakBefore, 'snapshot does not move the peak');
    assert.strictEqual(inst.t.instrumentErrors.length, 0, 'no instrument errors');
    // A live wave-4 kill lands in killEvents and in the log recount.
    const m4 = (Game.data.monsters || []).find(function (m) { return m && (m.wave || 1) === 4; });
    assert.ok(m4, 'a wave-4 monster def must exist');
    const roster = ((Game.state || {}).village || {}).roster || [];
    const vid = roster.find(function (id) { return id && id !== Game.villagerId; }) || Game.villagerId;
    Game.recordWaveKill(m4.id, vid, 'wild', null);
    assert.strictEqual(inst.t.killEvents.length, 1, 'live kill event captured');
    assert.strictEqual(inst.t.killEvents[0].wave, 4);
    const snap1 = inst.snapshot();
    assert.ok((snap1.logW4 || []).some(function (e) { return e.by === vid && e.w === 4; }), 'kill in logW4 snapshot');
    pass++;
    console.log('ok ' + pass + ' - live harness smoke: gate == recount, capped math, peak-stable snapshot, live kill event');
  } finally {
    try { inst.uninstall(); } catch (e) {}
  }
  console.log('READY5-PROOF ' + pass + ' PASS');
})().catch(function (e) { console.error('READY5-PROOF FAIL: ' + (e && e.stack)); process.exitCode = 1; });
