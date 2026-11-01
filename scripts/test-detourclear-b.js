#!/usr/bin/env node
// test-detourclear-b.js — proof test for the detourclear classifier/verdict.
// (sim-detourclear-b; prereg: evidence/2026-11-01/sim-detourclear-b-prereg.md.)
// Pure proof tests (cost table, verdict rule, completeness) + analyzer
// wiring on a synthetic corpus dir in os.tmpdir() (never the repo).
'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { costFor, median, classificationComplete, verdictFor, analyzeCensus, analyzeProbe, analyzeVerdict } = require('./analyze-detourclear-b');

let n = 0;
function check(name, fn) {
  n++;
  try { fn(); console.log('ok ' + n + ' ' + name); }
  catch (e) { console.error('FAIL ' + n + ' ' + name + ': ' + (e && e.message)); process.exitCode = 1; }
}

// Cost table (src/js/game.js clearBlockage / buildBridge).
check('fallen_tree: 60 kcal, 32 ticks, clearable, +2 wood', () => {
  const c = costFor('fallen_tree', 0);
  assert.strictEqual(c.clearable, true); assert.strictEqual(c.kcal, 60); assert.strictEqual(c.ticks, 32); assert.strictEqual(c.wood, 0);
});
check('rubble: 40 kcal, 32 ticks, clearable', () => {
  const c = costFor('rubble', 9);
  assert.strictEqual(c.clearable, true); assert.strictEqual(c.kcal, 40); assert.strictEqual(c.ticks, 32);
});
check('washed_out wood<4: scramble 80 kcal, 32 ticks', () => {
  const c = costFor('washed_out', 2);
  assert.strictEqual(c.clearable, true); assert.strictEqual(c.kcal, 80); assert.strictEqual(c.ticks, 32); assert.strictEqual(c.wood, 0);
});
check('washed_out wood>=4: bridge 60 kcal, 96 ticks, 4 wood', () => {
  const c = costFor('washed_out', 4);
  assert.strictEqual(c.clearable, true); assert.strictEqual(c.kcal, 60); assert.strictEqual(c.ticks, 96); assert.strictEqual(c.wood, 4);
});
check('washed_out wood>=4 boundary: wood=3 scrambles, wood=4 bridges', () => {
  assert.strictEqual(costFor('washed_out', 3).ticks, 32);
  assert.strictEqual(costFor('washed_out', 4).ticks, 96);
});
check('creek: NOT clearable by hand; bridge/swim alternatives stated', () => {
  const c = costFor('creek', 4);
  assert.strictEqual(c.clearable, false);
  assert.strictEqual(c.bridge.wood, 4); assert.strictEqual(c.bridge.ticks, 96);
  assert.strictEqual(c.swim.kcal, 20);
});
check('unknown block type: clearable null, never silently clearable', () => {
  assert.strictEqual(costFor('mystery', 0).clearable, null);
});
check('median: odd, even, empty', () => {
  assert.strictEqual(median([5, 1, 3]), 3);
  assert.strictEqual(median([1, 2, 3, 4]), 2.5);
  assert.strictEqual(median([]), null);
  assert.strictEqual(median([null, 7, null]), 7);
});

// Completeness: all ten prereg fields required.
const full = { blockType: 'fallen_tree', blockedTile: { x: 4, y: 3 }, approachTile: { x: 4, y: 2 }, detourLength: 5, approachWalkSteps: 1, kcal: 2330, wood: 4, swimmer: false, dayTicks: 273, ticksToDayEnd: 239 };
check('complete classification passes', () => { assert.strictEqual(classificationComplete(full), true); });
for (const f of Object.keys(full)) {
  check('incomplete without ' + f + ' fails', () => {
    const c = Object.assign({}, full); c[f] = null;
    assert.strictEqual(classificationComplete(c), false);
  });
}

// Verdict rule (prereg, fixed).
function att(over) {
  return Object.assign({ blockType: 'fallen_tree', detourLength: 5, clearedReached: true, woodBefore: 0 }, over);
}
check('verdict: cleared + detour>=4 -> clear-beats-detour', () => {
  assert.strictEqual(verdictFor(att({ detourLength: 4 }), 0), 'clear-beats-detour');
});
check('verdict: cleared + repeat>=2 -> clear-beats-detour even on short detour', () => {
  assert.strictEqual(verdictFor(att({ detourLength: 2 }), 2), 'clear-beats-detour');
});
check('verdict: cleared + short detour + no repeat -> both-work-detour-cheaper-tonight', () => {
  assert.strictEqual(verdictFor(att({ detourLength: 2 }), 1), 'both-work-detour-cheaper-tonight');
});
check('verdict: clearable but probe failed + detour exists -> clear-fails-detour-wins', () => {
  assert.strictEqual(verdictFor(att({ clearedReached: false, detourLength: 3 }), 0), 'clear-fails-detour-wins');
});
check('verdict: clearable but probe failed + no detour -> both-fail', () => {
  assert.strictEqual(verdictFor(att({ clearedReached: false, detourLength: null }), 0), 'both-fail');
});
check('verdict: creek not clearable + detour exists -> detour-only', () => {
  assert.strictEqual(verdictFor({ blockType: 'creek', detourLength: 3, clearedReached: false, woodBefore: 0 }, 0), 'detour-only');
});
check('verdict: creek not clearable + no detour -> neither', () => {
  assert.strictEqual(verdictFor({ blockType: 'creek', detourLength: null, clearedReached: false, woodBefore: 0 }, 0), 'neither');
});
check('verdict: washed_out bridge case follows clearable branch', () => {
  assert.strictEqual(verdictFor({ blockType: 'washed_out', detourLength: 5, clearedReached: true, woodBefore: 4 }, 0), 'clear-beats-detour');
});

// Analyzer wiring on a synthetic corpus dir (os.tmpdir, never the repo).
check('analyzer: census + probe + verdict over synthetic corpora', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'detourclear-test-'));
  const cdir = path.join(tmp, 'census'), pdir = path.join(tmp, 'probe');
  fs.mkdirSync(cdir); fs.mkdirSync(pdir);
  const cls = (bt, bx, by) => Object.assign({}, full, { blockType: bt, blockedTile: { x: bx, y: by } });
  const censusSeed = {
    seed: 17567, probe: false,
    evenings: [
      { loopDay: 5, eveningOutcome: 'travel-refused', hopReturnKind: 'block:fallen_tree', classification: cls('fallen_tree', 4, 3) },
      { loopDay: 6, eveningOutcome: 'travel-refused', hopReturnKind: 'block:fallen_tree', classification: cls('fallen_tree', 4, 3) },
      { loopDay: 7, eveningOutcome: 'travel-refused', hopReturnKind: 'block:creek', classification: Object.assign({}, full, { blockType: 'creek', blockedTile: { x: 2, y: 3 }, detourLength: 2, swimmer: false, wood: 1 }) },
      { loopDay: 8, eveningOutcome: 'completed', classification: null },
    ],
  };
  fs.writeFileSync(path.join(cdir, 'detourclear-b-census-s17567.json'), JSON.stringify(censusSeed));
  const cen = analyzeCensus([cdir]);
  assert.strictEqual(cen.refusedTotal, 3);
  assert.strictEqual(cen.refusedComplete, 3);
  assert.strictEqual(cen.byType.fallen_tree.n, 2);
  assert.strictEqual(cen.repeats['17567|4,3'], 2);
  const probeSeed = {
    seed: 17567, probe: true,
    evenings: [
      { loopDay: 5, eveningOutcome: 'travel-refused', classification: cls('fallen_tree', 4, 3), probe: { blockType: 'fallen_tree', blockedTile: { x: 4, y: 3 }, approachTile: { x: 4, y: 2 }, walkOk: true, action: 'clearBlockage', actionReturn: true, blockGone: true, reHopMoved: true, kcalBefore: 2330, kcalAfterAction: 2270, dayTicksBefore: 273, dayTicksAfterAction: 305, dayRolled: false, woodBefore: 0 } },
      { loopDay: 7, eveningOutcome: 'travel-refused', classification: Object.assign({}, full, { blockType: 'creek', detourLength: 2 }), probe: { blockType: 'creek', blockedTile: { x: 2, y: 3 }, approachTile: { x: 2, y: 2 }, walkOk: true, action: 'none-creek-no-wood', actionReturn: null, blockGone: false, reHopMoved: null, kcalBefore: 1500, kcalAfterAction: 1500, dayTicksBefore: 300, dayTicksAfterAction: 300, dayRolled: false, woodBefore: 1 } },
    ],
  };
  fs.writeFileSync(path.join(pdir, 'detourclear-b-probe-s17567.json'), JSON.stringify(probeSeed));
  const pr = analyzeProbe([pdir]);
  assert.strictEqual(pr.attemptsTotal, 2);
  assert.strictEqual(pr.byType.fallen_tree.clearedReached, 1);
  const ver = analyzeVerdict(cen, pr);
  assert.strictEqual(ver.verdicts, undefined); // verdict rows live in ver.rows
  assert.strictEqual(ver.rows[0].verdict, 'clear-beats-detour'); // repeat 2 nights
  assert.strictEqual(ver.rows[1].verdict, 'detour-only'); // creek, no wood, detour exists
  assert.strictEqual(ver.byType.fallen_tree.censusN, 2);
  fs.rmSync(tmp, { recursive: true, force: true });
});

console.log('test-detourclear-b: ' + n + ' checks, exit ' + (process.exitCode || 0));
