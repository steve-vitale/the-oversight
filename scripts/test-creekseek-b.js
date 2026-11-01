#!/usr/bin/env node
// test-creekseek-b.js — PURE proof test for the creekseek policy.
// No game load, no corpus dependency: hand-built decision inputs
// and fake-Game move fixtures, judged against the prereg's creek
// move rule (sim-strandwide-b; prereg: evidence/2026-11-01/
// sim-strandwide-b-prereg.md).
'use strict';
const assert = require('assert');
const { creekseekDecision, creekMove } = require('./policies/creekseek-b');

let n = 0;
function check(name, fn) { fn(); n++; console.log('ok ' + n + ' - ' + name); }

const base = {
  gateOn: true, gameOver: false, combat: false, inTent: false,
  atHaven: false, tile: 'forest', targets: [], curPx: 4, curPy: 4,
};

check('gate off -> lever-off, no move', () => {
  assert.deepStrictEqual(creekseekDecision({ ...base, gateOn: false }), { act: false, skip: 'lever-off' });
});

check('game over / combat / tent / at-haven / already-creek all skip', () => {
  assert.strictEqual(creekseekDecision({ ...base, gameOver: true }).skip, 'game-over');
  assert.strictEqual(creekseekDecision({ ...base, combat: true }).skip, 'combat');
  assert.strictEqual(creekseekDecision({ ...base, inTent: true }).skip, 'in-tent');
  assert.strictEqual(creekseekDecision({ ...base, atHaven: true }).skip, 'at-haven');
  assert.strictEqual(creekseekDecision({ ...base, tile: 'creek' }).skip, 'already-creek');
});

check('no targets / no creek targets -> no-creek-offered', () => {
  assert.strictEqual(creekseekDecision(base).skip, 'no-creek-offered');
  assert.strictEqual(creekseekDecision({ ...base, targets: [{ x: 5, y: 4, type: 'forest' }] }).skip, 'no-creek-offered');
});

check('nearest creek wins over farther creek', () => {
  const d = creekseekDecision({
    ...base,
    targets: [{ x: 6, y: 4, type: 'creek' }, { x: 5, y: 4, type: 'creek' }, { x: 4, y: 6, type: 'forest' }],
  });
  assert.strictEqual(d.act, true);
  assert.deepStrictEqual(d.to, { x: 5, y: 4 });
  assert.strictEqual(d.distance, 1);
});

check('tie-break: lowest x, then lowest y, no RNG', () => {
  const d = creekseekDecision({
    ...base,
    targets: [{ x: 4, y: 5, type: 'creek' }, { x: 5, y: 4, type: 'creek' }, { x: 3, y: 4, type: 'creek' }],
  });
  assert.deepStrictEqual(d.to, { x: 3, y: 4 });
  const d2 = creekseekDecision({
    ...base,
    targets: [{ x: 4, y: 5, type: 'creek' }, { x: 4, y: 3, type: 'creek' }],
  });
  assert.deepStrictEqual(d2.to, { x: 4, y: 3 });
});

function fakeGame(o) {
  const g = {
    over: !!o.over,
    state: { scholar: { insideHaven: !!o.insideHaven, insideTent: !!o.inTent }, village: { px: 4, py: 4 } },
    map: { px: o.px, py: o.py },
    _targets: o.targets || [],
    _tileTypes: o.tileTypes || {},
    _refuse: !!o.refuse,
    _say: [],
    playerTile() { return { type: o.tile }; },
    travelTargets() { return this._targets.map((t) => ({ x: t.x, y: t.y })); },
    tileAt(x, y) { return { type: this._tileTypes[x + ',' + y] || 'forest' }; },
    travelTo(x, y) { if (!this._refuse) { this.map.px = x; this.map.py = y; } },
    say(line) { this._say.push(line); },
    inCombat() { return false; },
  };
  return g;
}

check('move: away villager steps to offered creek, says one line', () => {
  process.env.CREEKSEEK_B = '1';
  const g = fakeGame({
    px: 6, py: 6, tile: 'forest',
    targets: [{ x: 6, y: 5 }],
    tileTypes: { '6,5': 'creek' },
  });
  const rec = creekMove(g, {});
  assert.strictEqual(rec.outcome, 'moved-to-creek');
  assert.deepStrictEqual(rec.to, { x: 6, y: 5 });
  assert.strictEqual(g.map.px, 6);
  assert.strictEqual(g.map.py, 5);
  assert.strictEqual(g._say.length, 1);
});

check('move: at-haven villager is NOT dragged out', () => {
  process.env.CREEKSEEK_B = '1';
  const g = fakeGame({
    px: 4, py: 4, tile: 'haven', insideHaven: true,
    targets: [{ x: 5, y: 4 }],
    tileTypes: { '5,4': 'creek' },
  });
  const rec = creekMove(g, {});
  assert.strictEqual(rec.skip, 'at-haven');
  assert.strictEqual(g.map.px, 4);
  assert.strictEqual(g._say.length, 0);
});

check('move: refused hop stays put, no line', () => {
  process.env.CREEKSEEK_B = '1';
  const g = fakeGame({
    px: 6, py: 6, tile: 'forest', refuse: true,
    targets: [{ x: 6, y: 5 }],
    tileTypes: { '6,5': 'creek' },
  });
  const rec = creekMove(g, {});
  assert.strictEqual(rec.outcome, 'travel-refused');
  assert.strictEqual(g.map.px, 6);
  assert.strictEqual(g.map.py, 6);
  assert.strictEqual(g._say.length, 0);
});

check('move: gate off -> lever-off, no move, no line', () => {
  process.env.CREEKSEEK_B = '0';
  const g = fakeGame({
    px: 6, py: 6, tile: 'forest',
    targets: [{ x: 6, y: 5 }],
    tileTypes: { '6,5': 'creek' },
  });
  const rec = creekMove(g, {});
  assert.strictEqual(rec.skip, 'lever-off');
  assert.strictEqual(g.map.px, 6);
  assert.strictEqual(g._say.length, 0);
  process.env.CREEKSEEK_B = '1';
});

console.log('test-creekseek-b: ' + n + ' checks passed');
