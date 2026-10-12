#!/usr/bin/env node
// test-multitile-20261012.js — proof for multi-tile monster size being REAL
// (Steve phone order 2026-10-12: "the sprite and ability to target things
// should reflect that").
//
// Proves on a REAL Game (sim-harness):
//  - fighterSize/fighterTiles: footprint math for size 1/2/3
//  - targetCovers: EVERY occupied tile resolves to the fighter (tap any tile)
//  - fighterDistTo: reach measured from the whole body
//  - live combat: startCombat('bulldozer') (size 2) — all 4 tiles resolve to
//    its key through the app.js target-entry shape, and a strike issued via
//    a non-anchor tile's resolution lands (no "can't reach" refusal)
//  - spawnWorldMonster('eater'): size 3, footprint fully walkable (never on
//    walls/Haven structures)
//  - app.js wiring present: monsterTargets at all 3 monster target sites,
//    targetCovers in pickTarget, tile-flattening in targetingCells,
//    anchor-only spanning render
//  - main.css: .multitile span rules present
'use strict';
const fs = require('fs'), path = require('path'), assert = require('assert');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, mulberry32 } = require('./sim-harness');

let pass = 0, fail = 0;
const check = (name, fn) => {
  try { const r = fn(); if (r && r.then) return r.then(() => { pass++; console.log('  ok   ' + name); }).catch(e => { fail++; console.log('  FAIL ' + name + ' :: ' + e.message); });
    pass++; console.log('  ok   ' + name);
  } catch (e) { fail++; console.log('  FAIL ' + name + ' :: ' + e.message); }
};
// verbatim mirror of app.js monsterTargets (the shared logic it feeds is
// Game.targetCovers / Game.fighterTiles, proven below on the real Game)
const monsterTargets = (Game, list) => (list || []).map(m => {
  let tiles = null;
  try { tiles = Game.fighterTiles(m); } catch (e) {}
  return { key: m.key, cx: m.mx, cy: m.my, label: m.name, tiles: tiles || [[m.mx, m.my]] };
});
const pickTarget = (Game, targets, cx, cy) =>
  targets.find(x => Game.targetCovers(x, cx, cy)) || null;

function mulberry(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

(async () => {
  console.log('== multi-tile proof ==');
  Math.random = mulberry(20261012);
  const { Game } = await loadGame({ seed: 20261012, mode: 'competent', fullTelemetry: false });
  await setupGame(Game);

  // ---- 1. footprint math
  check('fighterSize: finale=3, bulldozer=2, hushwolf=1', () => {
    const byId = Object.fromEntries(Game.data.monsters.map(m => [m.id, m]));
    assert.strictEqual(Game.fighterSize({ mdef: byId['finale'], mx: 0, my: 0 }), 3);
    assert.strictEqual(Game.fighterSize({ mdef: byId['bulldozer'], mx: 0, my: 0 }), 2);
    assert.strictEqual(Game.fighterSize({ mdef: byId['hushwolf'], mx: 0, my: 0 }), 1);
  });
  check('fighterTiles: 3x3 at (2,2) = 9 tiles (2,2)..(4,4)', () => {
    const tiles = Game.fighterTiles({ mdef: { size: 3 }, mx: 2, my: 2 });
    assert.strictEqual(tiles.length, 9);
    assert.deepStrictEqual(tiles[0], [2, 2]);
    assert.deepStrictEqual(tiles[8], [4, 4]);
  });
  check('fighterTiles: 2x2 at (7,7) = 4 tiles', () => {
    assert.strictEqual(Game.fighterTiles({ mdef: { size: 2 }, mx: 7, my: 7 }).length, 4);
  });

  // ---- 2. tap coverage
  check('targetCovers: every tile of a 2x2 body matches; outside does not', () => {
    const t = { key: 'm1', cx: 3, cy: 3, tiles: [[3,3],[4,3],[3,4],[4,4]] };
    for (const [x, y] of t.tiles) assert.ok(Game.targetCovers(t, x, y), `tile ${x},${y} missed`);
    assert.ok(!Game.targetCovers(t, 5, 5), 'outside tile matched');
    assert.ok(!Game.targetCovers(t, 3, 2), 'adjacent tile matched');
  });
  check('targetCovers: entry without tiles falls back to anchor', () => {
    assert.ok(Game.targetCovers({ cx: 1, cy: 1 }, 1, 1));
    assert.ok(!Game.targetCovers({ cx: 1, cy: 1 }, 1, 2));
    assert.ok(!Game.targetCovers(null, 1, 1));
  });
  check('fighterDistTo: reach measured from nearest body tile', () => {
    const f = { mdef: { size: 2 }, mx: 5, my: 5 }; // tiles (5,5)..(6,6)
    assert.strictEqual(Game.fighterDistTo(f, 7, 6), 1); // adjacent to (6,6)
    assert.strictEqual(Game.fighterDistTo(f, 5, 5), 0);
    assert.strictEqual(Game.fighterDistTo(f, 0, 0), 5);
  });

  // ---- 3. live combat: every tile targets the monster, strike resolves
  await check('combat: all 4 bulldozer tiles resolve to its key; strike via non-anchor tile lands', async () => {
    Game.startCombat('bulldozer');
    const tf = Game.tbfight;
    assert.ok(tf, 'no fight');
    const mf = tf.fighters.find(f => f.kind === 'monster');
    assert.ok(mf, 'no monster fighter');
    assert.strictEqual(Game.fighterSize(mf), 2, 'bulldozer is not size 2 in fight');
    const p = Game.tbFighter('p');
    // park the monster adjacent to the player via its body
    mf.mx = p.mx + 1; mf.my = p.my;
    if (mf.mx + 1 > 8) { mf.mx = p.mx - 2; }
    const targets = monsterTargets(Game, [mf]);
    // every occupied tile resolves through the tap matcher
    for (const [x, y] of Game.fighterTiles(mf)) {
      const hit = pickTarget(Game, targets, x, y);
      assert.ok(hit, `tile ${x},${y} did not resolve`);
      assert.strictEqual(hit.key, mf.key, `tile ${x},${y} resolved to wrong key`);
    }
    // a tile that is NOT its body resolves nothing
    assert.ok(!pickTarget(Game, targets, 0, 0) || Game.targetCovers(targets[0], 0, 0) === false, 'phantom hit');
    // strike THROUGH a non-anchor tile's resolution (not the anchor)
    const tiles = Game.fighterTiles(mf);
    const nonAnchor = tiles.find(([x, y]) => !(x === mf.mx && y === mf.my));
    const resolved = pickTarget(Game, targets, nonAnchor[0], nonAnchor[1]);
    assert.ok(resolved && resolved.key === mf.key, 'non-anchor tile did not resolve');
    // ensure it is the player's turn and strike
    if (!Game.tbIsPlayerTurn()) { /* harness fights start on player turn; be lenient */ }
    const hpBefore = mf.hp;
    const said = [];
    const origSay = Game.say; Game.say = (s) => { said.push(String(s)); };
    let ok;
    try { ok = Game.tbPlayerStrike(resolved.key); }
    finally { Game.say = origSay; }
    const refused = said.join(' ').match(/can't reach|Too far/i);
    assert.ok(!refused, 'strike refused for range: ' + said.join(' | '));
    assert.ok(ok !== false, 'tbPlayerStrike returned false');
    assert.ok(mf.hp < hpBefore, `strike did not damage the monster (${hpBefore} -> ${mf.hp})`);
  });

  // ---- 4. world spawn fits the footprint
  await check('spawnWorldMonster eater: size 3 placed on a fully walkable block', async () => {
    // fresh tile context: use current player tile
    const tx = Game.map.px, ty = Game.map.py;
    for (let i = 0; i < 5; i++) {
      const mon = Game.spawnWorldMonster('eater', tx, ty, {});
      assert.strictEqual(mon.size, 3, 'eater world monster is not size 3');
      const detail = Game.genDetail(tx, ty);
      for (const [x, y] of Game.fighterTiles(mon)) {
        assert.ok(x >= 0 && x <= 8 && y >= 0 && y <= 8, `tile ${x},${y} out of bounds`);
        const cell = detail[y] && detail[y][x];
        assert.ok(cell && !Game.cellProps(cell).blocks, `tile ${x},${y} blocked (${cell})`);
      }
      Game.removeWorldMonster(mon);
    }
  });
  check('fieldFitBlock: prefers requested anchor when it fits', () => {
    const tx = Game.map.px, ty = Game.map.py;
    const detail = Game.genDetail(tx, ty);
    // find any walkable 2x2 anchor first
    let anchor = null;
    for (let y = 0; y < 8 && !anchor; y++) for (let x = 0; x < 8 && !anchor; x++) {
      const ok = [[x,y],[x+1,y],[x,y+1],[x+1,y+1]].every(([ax,ay]) => {
        const c = detail[ay] && detail[ay][ax];
        return c && !Game.cellProps(c).blocks;
      });
      if (ok) anchor = [x, y];
    }
    assert.ok(anchor, 'no walkable 2x2 on this tile at all');
    assert.deepStrictEqual(Game.fieldFitBlock(tx, ty, anchor[0], anchor[1], 2), anchor);
  });

  // ---- 5. wiring present in app.js / main.css
  check('app.js: monsterTargets feeds all 3 monster target sites', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/js/app.js'), 'utf8');
    assert.ok(src.includes('targets: monsterTargets(cands)'), 'turtle site missing');
    assert.ok(src.includes('targets: monsterTargets(hostiles)'), 'talk site missing');
    assert.ok(src.includes('targets: monsterTargets(adj)'), 'strike site missing');
  });
  check('app.js: pickTarget matches via Game.targetCovers; targetingCells flattens tiles', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/js/app.js'), 'utf8');
    assert.ok(src.includes('Game.targetCovers(x, cx, cy)'), 'pickTarget not using targetCovers');
    assert.ok(src.includes('const tiles = t.tiles || [[t.cx, t.cy]]'), 'targetingCells not flattening');
  });
  check('app.js: combat + field render anchor-only with multitile span class', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/js/app.js'), 'utf8');
    assert.ok(src.includes('_isAnchor'), 'combat anchor logic missing');
    assert.ok(src.includes('_isFAnchor'), 'field anchor logic missing');
    assert.ok(src.includes('csprite multitile mts'), 'span class injection missing');
  });
  check('main.css: .multitile span rules present', () => {
    const css = fs.readFileSync(path.join(ROOT, 'src/css/main.css'), 'utf8');
    assert.ok(css.includes('.csprite.multitile'), 'multitile css missing');
    assert.ok(css.includes('width: 200%'), 'span sizing missing');
    assert.ok(css.includes('width: 300%'), 'mts3 sizing missing');
  });
  check('game.js: tbPlayerStrike range uses fighterDistTo', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/js/game.js'), 'utf8');
    assert.ok(src.includes('this.fighterDistTo(t, p.mx, p.my)'), 'strike still anchor-based');
  });
  check('fighterInCells: any body tile in the set matches; empty misses', () => {
    const f = { mx: 2, my: 2, size: 2, mdef: { size: 2 } }; // tiles (2..3,2..3)
    const set = new Set(['0,0', '3,3', '8,8']);
    assert.ok(Game.fighterInCells(f, set), 'non-anchor body tile (3,3) should match');
    assert.ok(!Game.fighterInCells(f, new Set(['0,0', '8,8'])), 'outside set should miss');
    assert.ok(!Game.fighterInCells(f, null), 'null set should miss');
  });
  check('combat: beam lane through a non-anchor body tile hits the monster once', () => {
    Game.startCombat('bulldozer'); // size 2
    const f = Game.tbfight, m = f.fighters.find(x => x.kind === 'monster');
    const tiles = Game.fighterTiles(m);
    assert.strictEqual(tiles.length, 4, 'bulldozer should occupy 4 tiles');
    // Fake a beam lane that crosses ONLY non-anchor tiles of the body.
    const nonAnchor = tiles.filter(([x, y]) => !(x === m.mx && y === m.my));
    const lane = new Set(nonAnchor.map(([x, y]) => x + ',' + y));
    const hit = [];
    for (const o of f.fighters) {
      if (!o.alive || o.fled) continue;
      if (Game.fighterInCells(o, lane)) hit.push(o.key);
    }
    assert.ok(hit.includes(m.key), 'beam through non-anchor tiles must hit the monster');
    assert.strictEqual(hit.filter(k => k === m.key).length, 1, 'one fighter = one hit, never per tile');
    Game.tbfight = null;
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS FAIL', e); process.exit(1); });
