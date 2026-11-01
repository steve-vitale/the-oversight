#!/usr/bin/env node
// test-refusewin-b.js — pure proof for scripts/analyze-refusewin-b.js.
// (sim-refusewin-b; prereg committed BEFORE any judged leg.)
// Synthetic legs only; no game load, no file writes outside argv.
// Usage: node scripts/test-refusewin-b.js
'use strict';
const assert = require('assert');
const { gateOf, groupEpisodes, classifyEpisode, analyzeLeg } = require('./analyze-refusewin-b');

let n = 0;
function check(name, fn) { fn(); n++; console.log('ok ' + n + ' ' + name); }

function eve(day, outcome, extra) {
  return Object.assign({
    loopDay: day, eveningOutcome: outcome, tile: outcome === 'travel-refused' ? 'wetland' : 'haven',
    mapPx: outcome === 'travel-refused' ? 5 : 4, mapPy: outcome === 'travel-refused' ? 3 : 4,
    inside: outcome !== 'travel-refused', gameOver: false, dayLines: [],
    ntTravel: { hopReturnKind: 'block:creek' },
    creekremedy: { blockType: 'creek', blockedTile: { x: 4, y: 3 }, routeAroundPath: [[5, 3], [5, 4], [4, 4]], hopReturnKind: 'block:creek' },
  }, extra || {});
}
function leg(days, evenings, endReason, daysAlive) {
  return {
    seed: 1, policy: 'bare', days, daysAlive: daysAlive != null ? daysAlive : days,
    endReason: endReason || 'survived', errCount: 0,
    decisions: evenings.map((e) => ({ loopDay: e.loopDay })),
    evenings,
  };
}

check('resolved-by-daytime-walk with route + travel lines', () => {
  const evenings = [eve(10, 'travel-refused'), eve(11, 'travel-refused'),
    eve(12, 'completed', { dayLines: ['Travel 1 tile to Haven.', 'You walk back into Haven.'] })];
  const { byDay, episodes } = groupEpisodes(evenings);
  assert.strictEqual(episodes.length, 1);
  const c = classifyEpisode(episodes[0], byDay, leg(30, evenings));
  assert.strictEqual(c.classification, 'resolved-by-daytime-walk');
  assert.strictEqual(c.resolutionDay, 12);
  assert.deepStrictEqual(c.days, [10, 11]);
  assert.deepStrictEqual(c.blockedTiles, ['4,3']);
  assert.deepStrictEqual(c.routeAroundPaths, ['[[5,3],[5,4],[4,4]]']);
  assert.strictEqual(c.resolutionTravelLines.length, 2);
});

check('still-refused-at-horizon (run to last day, survived)', () => {
  const evenings = [eve(29, 'travel-refused'), eve(30, 'travel-refused')];
  const { byDay, episodes } = groupEpisodes(evenings);
  const c = classifyEpisode(episodes[0], byDay, leg(30, evenings));
  assert.strictEqual(c.classification, 'still-refused-at-horizon');
  assert.strictEqual(c.horizonDay, 30);
});

check('ended-other by leg ending (village-lost, day recorded)', () => {
  const evenings = [eve(34, 'travel-refused'), eve(35, 'travel-refused')];
  const L = leg(60, evenings, 'village-lost', 35);
  const { byDay, episodes } = groupEpisodes(evenings);
  const c = classifyEpisode(episodes[0], byDay, L);
  assert.strictEqual(c.classification, 'ended-other');
  assert.strictEqual(c.endKind, 'leg-ended');
  assert.strictEqual(c.endDay, 35);
});

check('ended-other by moved (out-of-reach next evening)', () => {
  const evenings = [eve(10, 'travel-refused'),
    eve(11, 'out-of-reach', { tile: 'forest_floor', mapPx: 2, mapPy: 2, inside: false })];
  const { byDay, episodes } = groupEpisodes(evenings);
  const c = classifyEpisode(episodes[0], byDay, leg(30, evenings));
  assert.strictEqual(c.classification, 'ended-other');
  assert.strictEqual(c.endOutcome, 'out-of-reach');
  assert.strictEqual(c.endDay, 11);
});

check('episodes split across a non-refused evening (never merged)', () => {
  const evenings = [eve(10, 'travel-refused'), eve(11, 'completed'),
    eve(12, 'travel-refused'), eve(13, 'travel-refused')];
  const { episodes } = groupEpisodes(evenings);
  assert.strictEqual(episodes.length, 2);
  assert.deepStrictEqual(episodes[0].days, [10]);
  assert.deepStrictEqual(episodes[1].days, [12, 13]);
});

check('UNCLASSIFIED only when no next evening and no recorded ending', () => {
  const evenings = [eve(10, 'travel-refused')];
  const L = leg(30, evenings, 'survived', 20); // truncated, no ending recorded
  const { byDay, episodes } = groupEpisodes(evenings);
  const c = classifyEpisode(episodes[0], byDay, L);
  assert.strictEqual(c.classification, 'UNCLASSIFIED');
});

check('gate: survived short leg fails, village-lost short leg passes', () => {
  const evenings = [eve(1, 'completed')];
  assert.strictEqual(gateOf(leg(30, evenings, 'survived', 1)).pass, false);
  assert.strictEqual(gateOf(leg(30, evenings, 'village-lost', 1)).pass, true);
  assert.strictEqual(gateOf(leg(30, evenings, 'over-other', 1)).pass, true);
});

check('gate: errs and count mismatch still fail', () => {
  const L = leg(30, [eve(1, 'completed')]);
  L.errCount = 1;
  assert.strictEqual(gateOf(L).pass, false);
  const L2 = leg(30, [eve(1, 'completed')]);
  L2.decisions = [];
  assert.strictEqual(gateOf(L2).pass, false);
});

check('analyzeLeg aggregates counts and flags unclassified', () => {
  const evenings = [eve(10, 'travel-refused'), eve(11, 'travel-refused'),
    eve(12, 'completed', { dayLines: ['Travel 1 tile to Haven.'] })];
  const a = analyzeLeg(leg(30, evenings));
  assert.strictEqual(a.totalRefusals, 2);
  assert.strictEqual(a.episodeCount, 1);
  assert.strictEqual(a.episodes[0].classification, 'resolved-by-daytime-walk');
  assert.strictEqual(a.gate.pass, true);
});

check('fallen_tree episode keeps its own blocked tile + route', () => {
  const evenings = [eve(29, 'travel-refused', {
    tile: 'forest_floor', mapPx: 4, mapPy: 2,
    ntTravel: { hopReturnKind: 'block:fallen_tree' },
    creekremedy: { blockType: 'fallen_tree', blockedTile: { x: 4, y: 3 }, routeAroundPath: [[4, 2], [5, 2], [5, 3], [4, 3], [4, 4]], hopReturnKind: 'block:fallen_tree' },
  })];
  const { byDay, episodes } = groupEpisodes(evenings);
  const c = classifyEpisode(episodes[0], byDay, leg(30, evenings));
  assert.strictEqual(c.classification, 'still-refused-at-horizon');
  assert.deepStrictEqual(c.blockedTiles, ['4,3']);
  assert.deepStrictEqual(c.blockTypeSplit, { fallen_tree: 1 });
});

console.log('test-refusewin-b: ' + n + '/' + n + ' pure checks pass');
