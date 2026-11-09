// test-journey-scale-r122-walkto-20261109.js — proof for journey-scale r122.
// The r113 pilgrimage walkTo tried exactly one d<=3 jump per day and abandoned
// the walk on the first refusal; on 97904 the jump (4,4)->(2,5) is refused by
// travelTo's intermediate-blockage scan — intermediate (2,4) is a creek needing
// a bridge — so 16 identical refusals stalled every trip (0 studies to d158).
// The tied alternative (3,6) is itself a bridgeless creek, and the destination
// (2,8) is itself a bridgeless creek, so exact arrival was impossible on this
// seed at all: the walk must stop at study range (dist 2). The r122 walkTo
// steps orthogonally, tries both axes, then sidesteps — mirroring the engine's
// own walkHome — and stops at a caller-given closeEnough distance.
// Green BEFORE any judged after-leg sim.
// Usage: node scripts/test-journey-scale-r122-walkto-20261109.js
// Seeds: 97904 (the regression), 97901 + 97902 (reach), determinism on 97904.
'use strict';
const assert = require('assert');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');
const TR = require(path.join(__dirname, 'policies', 'scalecourt-traderoad-r113'));

let passed = 0, failed = 0;
function check(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => { passed += 1; console.log('ok ' + passed + ' - ' + name); })
    .catch((e) => { failed += 1; console.error('FAIL - ' + name + '\n  ' + (e && e.stack ? e.stack.split('\n').slice(0, 5).join('\n  ') : e)); process.exitCode = 1; });
}

function manhattan(ax, ay, bx, by) { return Math.abs(ax - bx) + Math.abs(ay - by); }

// Wrap Game.travelTo for the duration of a walkTo call: record every step
// and assert no single step moves more than one orthogonal tile (no teleport).
function recordSteps(Game) {
  const steps = [];
  const orig = Game.travelTo.bind(Game);
  Game.travelTo = function (x, y, force, combatExit) {
    const px0 = Game.map.px, py0 = Game.map.py;
    const ret = orig(x, y, force, combatExit);
    steps.push({ from: [px0, py0], to: [x, y], after: [Game.map.px, Game.map.py] });
    return ret;
  };
  return { steps, restore() { Game.travelTo = orig; } };
}

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'journey-scale-r122-walkto', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}

async function main() {
  // (a) 97904 — the exact regression: the old jump is refused by the (2,4)
  // intermediate creek, the destination is itself a creek, so the walk must
  // stop at study range (dist 2) having gone around — never onto a creek.
  await check('97904: walkTo(2,8,2) reaches study range around the creeks, no teleport', async () => {
    const Game = await freshGame(97904);
    assert.strictEqual(Game.map.px, 4, 'scholar starts at Haven x=4');
    assert.strictEqual(Game.map.py, 4, 'scholar starts at Haven y=4');
    const v0 = ((Game.state || {}).otherVillages || []).find(v => v && v.id === 'village_0');
    assert.ok(v0, 'village_0 exists on 97904');
    assert.strictEqual(v0.x, 2, 'village_0 x is 2 (r113 evidence)');
    assert.strictEqual(v0.y, 8, 'village_0 y is 8 (r113 evidence)');
    // The mechanism, pinned from the tile data (not inferred):
    const t24 = Game.tileAt(2, 4), t36 = Game.tileAt(3, 6), t28 = Game.tileAt(2, 8), t25 = Game.tileAt(2, 5);
    assert.strictEqual(t24.type, 'creek', '(2,4) is a creek');
    assert.ok(t24.needsBridge, '(2,4) creek needs a bridge — the intermediate that refused the old jump');
    assert.strictEqual(t36.type, 'creek', '(3,6) is a creek');
    assert.ok(t36.needsBridge, '(3,6) creek needs a bridge — the tied alternative was blocked too');
    assert.strictEqual(t28.type, 'creek', '(2,8) is a creek');
    assert.ok(t28.needsBridge, '(2,8) creek needs a bridge — exact arrival is impossible on this seed');
    assert.ok(!Game.travelBlockage(2, 5), '(2,5) itself is passable (its creek needs no bridge)');
    const rec = recordSteps(Game);
    let result;
    try { result = TR.walkTo(Game, v0.x, v0.y, 2); } finally { rec.restore(); }
    const dEnd = manhattan(v0.x, v0.y, Game.map.px, Game.map.py);
    for (const s of rec.steps) {
      if (s.after[0] !== s.from[0] || s.after[1] !== s.from[1]) {
        assert.strictEqual(manhattan(s.from[0], s.from[1], s.after[0], s.after[1]), 1,
          'every successful step moves exactly one orthogonal tile: ' + JSON.stringify(s));
        assert.ok(s.after[0] >= 0 && s.after[0] <= 8 && s.after[1] >= 0 && s.after[1] <= 8,
          'walk stays on the board: ' + JSON.stringify(s.after));
        const stood = Game.tileAt(s.after[0], s.after[1]);
        assert.ok(!(stood && stood.type === 'creek' && stood.needsBridge && !stood.bridged),
          'walk never stands on a bridgeless creek: ' + JSON.stringify(s.after));
      }
    }
    assert.ok(result.steps > 0, 'walk took steps (was 0 before the fix — stalled at Haven)');
    assert.ok(result.reached, 'walk reached study range (dist<=2); ended at (' + Game.map.px + ',' + Game.map.py + ') dist=' + dEnd + ' after ' + result.steps + ' steps');
    assert.ok(dEnd <= 2, 'end distance is study range: ' + dEnd);
    console.log('    path: ' + rec.steps.filter(s => s.after[0] !== s.from[0] || s.after[1] !== s.from[1]).map(s => '(' + s.after[0] + ',' + s.after[1] + ')').join(' -> '));
  });

  // (b) Reach: on two further seeds the walk reaches study range of the
  // nearest village or stops honestly with the block named — never a
  // silent stall at Haven.
  for (const seed of [97901, 97902]) {
    await check(seed + ': walkTo reaches study range of the nearest village or stops honestly', async () => {
      const Game = await freshGame(seed);
      assert.strictEqual(Game.map.px, 4);
      assert.strictEqual(Game.map.py, 4);
      const cands = ((Game.state || {}).otherVillages || []).filter(v => v && v.id !== 'haven');
      assert.ok(cands.length > 0, 'other villages exist on ' + seed);
      const nt = cands.slice().sort((a, b) =>
        manhattan(a.x || 4, a.y || 4, 4, 4) - manhattan(b.x || 4, b.y || 4, 4, 4))[0];
      const d0 = manhattan(nt.x || 4, nt.y || 4, 4, 4);
      const rec = recordSteps(Game);
      let result;
      try { result = TR.walkTo(Game, nt.x || 4, nt.y || 4, 2); } finally { rec.restore(); }
      for (const s of rec.steps) {
        if (s.after[0] !== s.from[0] || s.after[1] !== s.from[1]) {
          assert.strictEqual(manhattan(s.from[0], s.from[1], s.after[0], s.after[1]), 1, 'no teleport on ' + seed);
        }
      }
      const d1 = manhattan(nt.x || 4, nt.y || 4, Game.map.px, Game.map.py);
      assert.ok(result.reached || result.blocked, seed + ': reached or stopped with a block named (reached=' + result.reached + ' blocked=' + JSON.stringify(result.blocked) + ')');
      assert.ok(d1 < d0 || result.reached, seed + ': distance closed (was ' + d0 + ', now ' + d1 + ') or reached');
      console.log('    nearest=' + nt.id + ' at (' + (nt.x || 4) + ',' + (nt.y || 4) + ') d0=' + d0 + ' -> end (' + Game.map.px + ',' + Game.map.py + ') dist=' + d1 + ' steps=' + result.steps + ' reached=' + result.reached);
    });
  }

  // (c) Determinism: same seed twice, same end position.
  await check('97904 determinism: walkTo(2,8,2) twice gives the same end position', async () => {
    const ends = [];
    for (let i = 0; i < 2; i++) {
      const Game = await freshGame(97904);
      const result = TR.walkTo(Game, 2, 8, 2);
      ends.push([Game.map.px, Game.map.py, result.steps, result.reached]);
    }
    assert.deepStrictEqual(ends[0], ends[1], 'identical end state on re-run: ' + JSON.stringify(ends));
    console.log('    ends: ' + JSON.stringify(ends));
  });

  // (d) Honest stop: all four orthogonal neighbours creeked — walk stays put, block named.
  await check('97904 honest stop: creek-ringed Haven stops the walk with the block named', async () => {
    const Game = await freshGame(97904);
    for (const [x, y] of [[3, 4], [5, 4], [4, 3], [4, 5]]) {
      const t = Game.tileAt(x, y);
      assert.ok(t, 'tile (' + x + ',' + y + ') exists');
      t.type = 'creek'; t.needsBridge = true; t.bridged = false;
      delete t.blockFrom;
    }
    const rec = recordSteps(Game);
    let result;
    try { result = TR.walkTo(Game, 2, 8, 2); } finally { rec.restore(); }
    assert.strictEqual(Game.map.px, 4, 'scholar stays at Haven x=4');
    assert.strictEqual(Game.map.py, 4, 'scholar stays at Haven y=4');
    assert.strictEqual(result.steps, 0, 'no steps taken when ringed');
    assert.ok(result.blocked, 'stopping block is named (not a silent stall)');
    assert.strictEqual(result.blocked.blockType, 'creek', 'block named as creek, got ' + JSON.stringify(result.blocked));
    assert.strictEqual(result.reached, false, 'not reached');
  });

  // (e) Return-home walk: the same walkTo brings the scholar back to Haven exactly.
  await check('97904: walkTo(4,4) returns the scholar home from the study edge', async () => {
    const Game = await freshGame(97904);
    const out = TR.walkTo(Game, 2, 8, 2);
    assert.ok(out.reached, 'reached study range first, ended (' + Game.map.px + ',' + Game.map.py + ')');
    const back = TR.walkTo(Game, 4, 4);
    assert.ok(back.reached, 'returned home; ended at (' + Game.map.px + ',' + Game.map.py + ')');
    assert.strictEqual(Game.map.px, 4);
    assert.strictEqual(Game.map.py, 4);
  });

  console.log('\nproof: ' + passed + ' passed, ' + failed + ' failed');
  if (failed) process.exitCode = 1;
}

main().catch((e) => { console.error('PROOF CRASH\n' + (e && e.stack ? e.stack : e)); process.exitCode = 1; });
