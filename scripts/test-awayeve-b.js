#!/usr/bin/env node
// test-awayeve-b.js — pure proof test for scripts/analyze-awayeve-b.js.
// (sim-awayeve-b; prereg: evidence/2026-11-01/
// sim-awayeve-b-prereg.md, committed BEFORE any judged leg.)
// No game load, no jest: plain node asserts on synthetic corpora.
// Temp corpus dirs live under os.tmpdir(), never in the repo.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { endCauseOf, returnStoryOf, analyzeSeed, analyzeDir } = require('./analyze-awayeve-b');

let pass = 0;
function eq(actual, expected, label) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) { console.error('FAIL ' + label + ': expected ' + e + ' got ' + a); process.exitCode = 1; }
  else { pass++; console.log('ok - ' + label); }
}

// Snap builder: haven node is (4,4) unless stated otherwise.
function snap(o) {
  return {
    inside: o.inside === undefined ? false : o.inside,
    insideTent: o.insideTent || false,
    tile: o.tile || null,
    mapPx: o.mapPx === undefined ? null : o.mapPx,
    mapPy: o.mapPy === undefined ? null : o.mapPy,
    havenPx: 4, havenPy: 4,
    vesselId: o.vessel === undefined ? null : o.vessel,
    roadActive: o.roadActive || false, roadOnRoad: o.roadOnRoad || false,
  };
}
function havenSnap(vessel) { return snap({ inside: true, tile: 'haven', mapPx: 4, mapPy: 4, vessel }); }
function wildSnap(tile, x, y, vessel, extra) {
  return snap(Object.assign({ inside: false, tile, mapPx: x, mapPy: y, vessel }, extra || {}));
}
function day(loopDay, morning, evening, extra) {
  const e = Object.assign({
    loopDay, eveningOutcome: 'policy-no-record', dayLines: [],
    ctxDelta: {}, inCombat: false, gameOver: false,
  }, evening, extra || {});
  // evening snap fields live on the evening row itself.
  return {
    dec: { loopDay, morning, ctxDelta: (extra && extra.ctxDelta) || {} },
    eve: e,
  };
}
function instFromDays(days, extra) {
  const decisions = days.map((d) => d.dec);
  const evenings = days.map((d) => d.eve).filter(Boolean);
  return Object.assign({
    seed: 1, policy: 'test', days: days.length, daysAlive: days.length,
    endReason: 'survived', errCount: 0, decisions, evenings,
  }, extra || {});
}

// --- end-cause ordering + subkinds ---
eq(endCauseOf({ inCombat: true, eveningOutcome: 'travel-refused' }, {}).cause, 'blocked-combat', 'combat beats refusal');
eq(endCauseOf({ insideTent: true, eveningOutcome: 'policy-no-record' }, {}).cause, 'tent-camp', 'tent beats no-record');
eq(endCauseOf({ eveningOutcome: 'travel-refused' }, {}), { cause: 'return-attempted', subkind: 'travel-refused' }, 'travel-refused subkind');
eq(endCauseOf({ eveningOutcome: 'out-of-reach' }, {}), { cause: 'return-attempted', subkind: 'out-of-reach' }, 'out-of-reach subkind');
eq(endCauseOf({ eveningOutcome: 'policy-no-record' }, { tripHomeDetours: 2 }), { cause: 'return-attempted', subkind: 'tripHomeDetours:2' }, 'detour delta promotes');
eq(endCauseOf({ eveningOutcome: 'policy-no-record' }, {}).cause, 'no-return-step', 'policy-no-record');
eq(endCauseOf({ eveningOutcome: 'game-over' }, {}), { cause: 'other', subkind: 'game-over' }, 'other verbatim');

// --- return-story unit cases (via returnStoryOf directly) ---
const baseRec = { vesselId: 'v1', endCause: 'return-attempted', endSubkind: 'out-of-reach' };
eq(returnStoryOf(baseRec, null, 'survived').story, 'still-away-at-horizon', 'horizon story');
eq(returnStoryOf(baseRec, null, 'village-lost').story, 'ended-other', 'village-death story');
eq(returnStoryOf(baseRec, { dec: { morning: havenSnap('v2') }, eve: havenSnap('v2') }, 'survived').subkind, 'succession', 'succession subkind');
eq(returnStoryOf(baseRec, { dec: { morning: havenSnap('v1') }, eve: havenSnap('v1') }, 'survived').subkind, 'woke-at-haven-same-vessel', 'woke-at-haven subkind');
eq(returnStoryOf(baseRec, { dec: { morning: wildSnap('meadow', 5, 4, 'v1') }, eve: havenSnap('v1') }, 'survived').story, 'walked-home-next-day', 'walked-home-next-day');
eq(returnStoryOf(baseRec, { dec: { morning: wildSnap('meadow', 5, 4, 'v1') }, eve: wildSnap('forest_floor', 6, 4, 'v1') }, 'survived').story, 'failed-return', 'failed-return');
eq(returnStoryOf({ vesselId: 'v1', endCause: 'no-return-step', endSubkind: null }, { dec: { morning: wildSnap('meadow', 5, 4, 'v1') }, eve: wildSnap('forest_floor', 6, 4, 'v1') }, 'survived').story, 'no-attempt', 'no-attempt');
eq(returnStoryOf(baseRec, { dec: { morning: wildSnap('meadow', 5, 4, 'v1') }, eve: snap({ tile: 'road', roadActive: true, vessel: 'v1' }) }, 'survived').subkind, 'road-transition', 'road-transition subkind');
eq(returnStoryOf(baseRec, { dec: { morning: wildSnap('meadow', 5, 4, 'v1') }, eve: null }, 'survived').story, 'UNCLASSIFIED', 'missing next evening unclassified');

// --- full-seed census: haven / road / away separation, stories, episodes ---
const days = [
  day(1, havenSnap('v1'), havenSnap('v1')),
  day(2, havenSnap('v1'), wildSnap('meadow', 5, 4, 'v1')), // away, departure, no-attempt -> walked home (day3 ends haven)
  day(3, wildSnap('meadow', 5, 4, 'v1'), havenSnap('v1')), // haven evening (walk home)
  day(4, havenSnap('v1'), wildSnap('creek', 5, 5, 'v1'), { eveningOutcome: 'out-of-reach' }), // away, departure, failed (day5 away)
  day(5, wildSnap('creek', 5, 5, 'v1'), wildSnap('forest_floor', 6, 5, 'v1'), { eveningOutcome: 'travel-refused' }), // away, continuation, failed? next morning vessel changes
  day(6, havenSnap('v2'), snap({ tile: 'road', roadActive: true, mapPx: 4, mapPy: 3, vessel: 'v2' })), // road evening
  day(7, havenSnap('v2'), wildSnap('creek', 5, 5, 'v2')), // away singleton, horizon (no day8)
];
const inst = instFromDays(days);
const s = analyzeSeed(inst);
eq(s.gateOk, true, 'gateOk on complete leg');
eq(s.havenEvenings, 2, 'haven evenings (days 1,3)');
eq(s.roadEvenings, 1, 'road evening separate (day 6)');
eq(s.awayEvenings, 4, 'away evenings (days 2,4,5,7)');
eq(s.awayDays, [2, 4, 5, 7], 'away days');
eq(s.awayByTile, { meadow: 1, creek: 2, forest_floor: 1 }, 'away by tile');
eq(s.awayByStart, { departure: 3, continuation: 1 }, 'away by start');
eq(s.awayByEndCause, { 'no-return-step': 2, 'return-attempted': 2 }, 'away by end-cause');
eq(s.awayByEndSubkind, { null: 2, 'out-of-reach': 1, 'travel-refused': 1 }, 'away by end subkind');
eq(s.awayByReturnStory, { 'walked-home-next-day': 1, 'failed-return': 1, 'ended-other': 1, 'still-away-at-horizon': 1 }, 'away by return story');
eq(s.classificationCompleteness, 1, 'completeness 1');
eq(s.creekAwayEvenings, 2, 'creek away subset');
// Episodes: day2 singleton, days4-5 run, day7 singleton = 3 episodes.
eq(s.episodeCount, 3, 'episodes: [2], [4,5], [7]');
eq(s.episodes.map((e) => [e.days, e.endStory]), [[[2], 'WALK-HOME'], [[4, 5], 'SUCCESSION'], [[7], 'HORIZON']], 'episode ends');

// --- atHaven variants: node-position haven, tile haven ---
const nodeDays = [
  day(1, havenSnap('v1'), snap({ inside: false, tile: 'meadow', mapPx: 4, mapPy: 4, vessel: 'v1' })),
];
eq(analyzeSeed(instFromDays(nodeDays)).havenEvenings, 1, 'map-node evening is haven, not away');

// --- gate predicate: village-lost short leg passes, survived short leg fails ---
const shortLost = instFromDays(
  [day(1, havenSnap('v1'), wildSnap('meadow', 5, 4, 'v1'))],
  { days: 30, daysAlive: 1, endReason: 'village-lost' });
eq(analyzeSeed(shortLost).gateOk, true, 'village-lost short leg passes gate');
const shortSurv = instFromDays(
  [day(1, havenSnap('v1'), wildSnap('meadow', 5, 4, 'v1'))],
  { days: 30, daysAlive: 1, endReason: 'survived' });
eq(analyzeSeed(shortSurv).gateOk, false, 'survived short leg fails gate');

// --- UNCLASSIFIED via full seed: next decision exists, next evening missing ---
const uncDays = [
  day(1, havenSnap('v1'), wildSnap('meadow', 5, 4, 'v1')),
  { dec: { loopDay: 2, morning: wildSnap('meadow', 5, 4, 'v1'), ctxDelta: {} }, eve: null },
];
const uncInst = { seed: 2, policy: 'test', days: 2, daysAlive: 2, endReason: 'survived', errCount: 0,
  decisions: uncDays.map((d) => d.dec), evenings: [uncDays[0].eve] };
const us = analyzeSeed(uncInst);
eq(us.awayByReturnStory, { UNCLASSIFIED: 1 }, 'unclassified on missing next evening');
eq(us.classificationCompleteness, 0, 'completeness 0 on unclassified leg');

// --- analyzeDir wiring on a synthetic corpus dir ---
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'awayeve-test-'));
fs.writeFileSync(path.join(dir, 'a.json'), JSON.stringify(inst));
fs.writeFileSync(path.join(dir, 'b.json'), JSON.stringify(shortLost));
const census = analyzeDir(dir);
eq(census.legs, 2, 'analyzeDir legs');
eq(census.totalAwayEvenings, 5, 'analyzeDir total away (4 + 1)');
eq(census.gateOkLegs, 2, 'analyzeDir gateOk legs');
eq(census.awayByTile.creek, 2, 'analyzeDir tile merge');
fs.rmSync(dir, { recursive: true, force: true });

console.log('awayeve proof: ' + pass + ' assertions passed');
