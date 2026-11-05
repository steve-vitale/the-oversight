#!/usr/bin/env node
// test-strandnight-a.js — pure proof for the stranded-night census.
// No harness, no Game, no repo writes. Fixtures only.
// Proves, per the sim-strandnight-a prereg:
//  (1) a 0-action no-gather-target flip counts as a distinct night
//      and, with no bedding line anywhere, does NOT carry one;
//  (2) a settle line in sleep-phase lines counts as carrying;
//  (3) a bedding line already in daily-phase lines counts as carrying;
//  (4) an acted flip, a bank evening, and any other skip are excluded;
//  (5) a clock/kcal-moving '0-action' record is an anomaly, excluded;
//  (6) the dawn night-out line alone does NOT count as bedding;
//  (7) the same night on two legs counts once (distinct, never legs);
//  (8) tile/position fields pass through for the sense read.
'use strict';
const assert = require('assert');
const { beddingLines, nightOutLines, isZeroActionNight, judgeNight, analyzeCorpora } = require('./analyze-strandnight-a');
// NOTE: the corpus tests use analyzeCorpora (parsed objects, no disk)
// rather than analyzeDir: in this worktree's process, writes of the
// fixture files into a fresh /tmp dir failed deterministically with
// EPERM (0-byte file, write denied) across 6 runs while identical
// inline writes passed — the Nov 4 evening write flap. analyzeDir is
// a thin loader over analyzeCorpora and is exercised by the real
// census run, not by this unit proof.

let n = 0;
function check(name, fn) { fn(); n++; console.log('ok ' + n + ' ' + name); }
function eveRow(loopDay, eve, extra) {
  return Object.assign({ loopDay, tile: 'thicket', mx: 8, my: 8,
    eveningSayTail: ['Travel 1 tile to thicket.'],
    daySayFull: ['Travel 1 tile to thicket.'], nightSay: [], sleepFired: false,
    bankfoodEvening: eve }, extra || {});
}
function zeroEve() {
  return { mode: 'flip', skip: 'no-gather-target', actions: [], clockBefore: 401, clockAfter: 401, kcalBefore: 2330, kcalAfter: 2330, packBefore: { edibleKcal: 270 } };
}

check('0-action flip with no bedding line counts and does not carry', () => {
  const j = judgeNight('17021', eveRow(51, zeroEve()));
  assert.ok(j); assert.strictEqual(j.key, '17021/51'); assert.strictEqual(j.carriesBedding, false);
  assert.strictEqual(j.carriesDailyOnly, false); assert.strictEqual(j.carriesSleepOnly, false);
});
check('settle line in sleep-phase lines counts as carrying (sleep only)', () => {
  const j = judgeNight('17021', eveRow(51, zeroEve(), { nightSay: ['You settle into the cold ground. Sleep takes you.'], sleepFired: true }));
  assert.ok(j); assert.strictEqual(j.carriesBedding, true); assert.strictEqual(j.carriesSleepOnly, true); assert.strictEqual(j.carriesDailyOnly, false);
});
check('sleeping-rough warning line counts as bedding', () => {
  const j = judgeNight('17021', eveRow(52, zeroEve(), { nightSay: ['Sleeping rough means the cold ground — heal ~16.'], sleepFired: true }));
  assert.strictEqual(j.carriesBedding, true);
});
check('bedding line already in daily lines counts as carrying (daily only)', () => {
  const j = judgeNight('17021', eveRow(51, zeroEve(), { daySayFull: ['You bed down in the thicket, back to the thorns.'] }));
  assert.strictEqual(j.carriesBedding, true); assert.strictEqual(j.carriesDailyOnly, true); assert.strictEqual(j.carriesSleepOnly, false);
});
check('acted flip excluded even with no bedding line', () => {
  const e = zeroEve(); e.actions = [{ kind: 'gather' }];
  assert.strictEqual(judgeNight('17021', eveRow(51, e)), null);
});
check('bank evening excluded', () => {
  const e = zeroEve(); e.mode = 'bank'; e.skip = null;
  assert.strictEqual(judgeNight('17021', eveRow(51, e)), null);
});
check('other skip excluded', () => {
  const e = zeroEve(); e.skip = 'flip-too-far'; e.mode = 'skip';
  assert.strictEqual(judgeNight('17021', eveRow(51, e)), null);
});
check('clock-moving 0-action record is an anomaly, not a night', () => {
  const e = zeroEve(); e.clockAfter = 412;
  assert.strictEqual(isZeroActionNight(e), 'anomaly');
  assert.strictEqual(judgeNight('17021', eveRow(51, e)), null);
});
check('kcal-moving 0-action record is an anomaly', () => {
  const e = zeroEve(); e.kcalAfter = 2400;
  assert.strictEqual(isZeroActionNight(e), 'anomaly');
});
check('dawn night-out line alone does NOT count as bedding, but is flagged', () => {
  const j = judgeNight('17021', eveRow(51, zeroEve(), { nightSay: ['Dawn. You wake stiff and cold. You spent the night out here, away from Haven — and you are still out here at dawn.'], sleepFired: true }));
  assert.strictEqual(j.carriesBedding, false); assert.strictEqual(j.nightOut, true);
});
check('beddingLines picks only bedding lines from a mixed stream', () => {
  const got = beddingLines(['Travel 1 tile to thicket.', 'You settle into the cold ground. Sleep takes you.', 'Dawn. You wake stiff and cold.']);
  assert.deepStrictEqual(got, ['You settle into the cold ground. Sleep takes you.']);
});
check('nightOutLines picks only the night-out line', () => {
  assert.strictEqual(nightOutLines(['You spent the night out here, away from Haven.']).length, 1);
  assert.strictEqual(nightOutLines(['You settle into the cold ground.']).length, 0);
});
check('analyzeCorpora counts nights across seeds and dedupes a repeated row', () => {
  const corpus = (seed) => ({ seed, evenings: [
    eveRow(51, zeroEve(), { nightSay: ['You settle into the cold ground. Sleep takes you.'], sleepFired: true }),
    eveRow(51, zeroEve(), { nightSay: ['You settle into the cold ground. Sleep takes you.'], sleepFired: true }),
    eveRow(52, zeroEve()),
  ] });
  const r = analyzeCorpora([corpus(17021), corpus(17023)]);
  // Per seed: 51 (twice in the file, counted once) + 52 = 2 distinct;
  // two seeds = 4 distinct, 2 carrying (the 51s).
  assert.strictEqual(r.distinctNights, 4);
  assert.strictEqual(r.carryingBedding, 2);
  assert.strictEqual(r.carryingSleepOnly, 2);
  assert.strictEqual(r.anomalies.length, 0);
});
check('analyzeCorpora flags anomalies and excludes them from distinct nights', () => {
  const e = zeroEve(); e.clockAfter = 420;
  const r = analyzeCorpora([{ seed: 17021, evenings: [eveRow(51, e), eveRow(52, zeroEve())] }]);
  assert.strictEqual(r.distinctNights, 1);
  assert.strictEqual(r.anomalies.length, 1);
  assert.strictEqual(r.anomalies[0].key, '17021/51');
});
check('tile and pack fields pass through for the sense read', () => {
  const j = judgeNight('17021', eveRow(51, zeroEve()));
  assert.strictEqual(j.tile, 'thicket'); assert.strictEqual(j.packEdibleBefore, 270); assert.strictEqual(j.clockBefore, 401);
});

console.log('test-strandnight-a: ' + n + '/' + n + ' GREEN');
