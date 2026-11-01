#!/usr/bin/env node
// test-strandtile-b.js — PURE proof test for the strand-episode analyzer.
// No game load, no corpus dependency: hand-built episode inputs and
// exit-day lookups, judged against the prereg's episode rule.
// (sim-strandtile-b; prereg: evidence/2026-10-31/sim-strandtile-b-prereg.md)
'use strict';
const assert = require('assert');
const { groupEpisodes, classifyEpisodeEnd } = require('./analyze-strandtile-b');

let n = 0;
function check(name, fn) { fn(); n++; console.log('ok ' + n + ' - ' + name); }

const baseLookup = {
  exitExists: true, exitGameOver: false, exitMorningVessel: 'v1',
  exitMorningAtHaven: false, exitEveningAtHaven: false,
  exitEveningCreekTile: false, exitEveningExists: true,
  exitConfirmedStory: null, exitFollowingExists: true,
  exitFollowingVessel: 'v1', exitFollowingAtHaven: false,
  legEndReason: 'survived', legDaysAlive: 30, episodeEndDay: 9,
};

check('consecutive same-vessel FR nights group into one episode', () => {
  const eps = groupEpisodes([
    { loopDay: 5, vesselId: 'v1' }, { loopDay: 6, vesselId: 'v1' },
    { loopDay: 7, vesselId: 'v1' }, { loopDay: 8, vesselId: 'v1' },
    { loopDay: 9, vesselId: 'v1' },
  ]);
  assert.strictEqual(eps.length, 1);
  assert.deepStrictEqual(eps[0].days, [5, 6, 7, 8, 9]);
  assert.strictEqual(eps[0].length, 5);
});

check('gap day breaks the episode; singleton counts as an episode', () => {
  const eps = groupEpisodes([
    { loopDay: 5, vesselId: 'v1' }, { loopDay: 6, vesselId: 'v1' },
    { loopDay: 10, vesselId: 'v1' },
  ]);
  assert.strictEqual(eps.length, 2);
  assert.deepStrictEqual(eps[0].days, [5, 6]);
  assert.deepStrictEqual(eps[1].days, [10]);
  assert.strictEqual(eps[1].length, 1);
});

check('vessel change breaks the episode even on consecutive days', () => {
  const eps = groupEpisodes([
    { loopDay: 5, vesselId: 'v1' }, { loopDay: 6, vesselId: 'v2' },
  ]);
  assert.strictEqual(eps.length, 2);
  assert.strictEqual(eps[0].vesselId, 'v1');
  assert.strictEqual(eps[1].vesselId, 'v2');
});

check('exit: no record -> HORIZON; loss + daysAlive<=endDay -> VILLAGE-DEATH', () => {
  const ep = { vesselId: 'v1', startDay: 5, endDay: 9, days: [5, 6, 7, 8, 9], length: 5 };
  assert.strictEqual(classifyEpisodeEnd(ep, { ...baseLookup, exitExists: false }), 'HORIZON');
  assert.strictEqual(classifyEpisodeEnd(ep, {
    ...baseLookup, exitExists: false, legEndReason: 'village-lost', legDaysAlive: 9,
  }), 'VILLAGE-DEATH');
});

check('exit: gameOver evening -> VILLAGE-DEATH; vessel change -> SUCCESSION', () => {
  const ep = { vesselId: 'v1', startDay: 5, endDay: 9, days: [5, 6, 7, 8, 9], length: 5 };
  assert.strictEqual(classifyEpisodeEnd(ep, { ...baseLookup, exitGameOver: true }), 'VILLAGE-DEATH');
  assert.strictEqual(classifyEpisodeEnd(ep, { ...baseLookup, exitMorningVessel: 'v2' }), 'SUCCESSION');
});

check('exit: evening at haven -> WALK-HOME; evening elsewhere -> MOVED-ELSEWHERE', () => {
  const ep = { vesselId: 'v1', startDay: 5, endDay: 9, days: [5, 6, 7, 8, 9], length: 5 };
  assert.strictEqual(classifyEpisodeEnd(ep, { ...baseLookup, exitEveningAtHaven: true }), 'WALK-HOME');
  assert.strictEqual(classifyEpisodeEnd(ep, baseLookup), 'MOVED-ELSEWHERE');
});

check('exit: creek evening, confirmed NO-ATTEMPT -> ATTEMPT-STOPS', () => {
  const ep = { vesselId: 'v1', startDay: 5, endDay: 9, days: [5, 6, 7, 8, 9], length: 5 };
  assert.strictEqual(classifyEpisodeEnd(ep, {
    ...baseLookup, exitEveningCreekTile: true, exitConfirmedStory: 'NO-ATTEMPT',
  }), 'ATTEMPT-STOPS');
});

check('exit: creek evening, haven-following same vessel -> SLEEP-RETURN; changed vessel -> SUCCESSION; no following morning -> HORIZON', () => {
  const ep = { vesselId: 'v1', startDay: 5, endDay: 9, days: [5, 6, 7, 8, 9], length: 5 };
  assert.strictEqual(classifyEpisodeEnd(ep, {
    ...baseLookup, exitEveningCreekTile: true, exitFollowingVessel: 'v1', exitFollowingAtHaven: true,
  }), 'SLEEP-RETURN');
  assert.strictEqual(classifyEpisodeEnd(ep, {
    ...baseLookup, exitEveningCreekTile: true, exitFollowingVessel: 'v2', exitFollowingAtHaven: true,
  }), 'SUCCESSION');
  assert.strictEqual(classifyEpisodeEnd(ep, {
    ...baseLookup, exitEveningCreekTile: true, exitFollowingExists: false,
  }), 'HORIZON');
});

check('exit: morning at haven same vessel (contradicts confirmed) -> UNCLASSIFIED-EDGE', () => {
  const ep = { vesselId: 'v1', startDay: 5, endDay: 9, days: [5, 6, 7, 8, 9], length: 5 };
  assert.strictEqual(classifyEpisodeEnd(ep, { ...baseLookup, exitMorningAtHaven: true }), 'UNCLASSIFIED-EDGE');
});

console.log('test-strandtile-b: ' + n + '/' + n + ' pure checks passed');
