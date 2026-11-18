#!/usr/bin/env node
// Proof test for the r240 walkHome first-block fix (journey-establishment
// r240 2026-11-18).
//
// Finding (panel seed 101401, the collapse seed): the scholar Aria woke
// at (4,2) for 8 straight days (d9-d16) and could not get home to end
// Benoit's broken run — 8 end attempts, all 'end-stranded' — then died
// d16 of sickness while still stuck out there. The way home was blocked
// by a fallen tree at (4,3) AND a fallen tree at (5,3), with a creek at
// (3,2). Both trees are clearable by hand; the creek is not.
//
// Diagnosis (probe, not a guess): Game.walkHome's tryStep OVERWROTE
// `blocked` on every refusal, so the walk reported its LAST refusal —
// the creek met on a west sidestep — instead of its FIRST refusal, the
// tree on the direct route home. travelHome84's clear-and-retry keys
// off the reported block, saw 'creek' (not clearable), and never
// cleared anything. The trees were never cut, the scholar never got
// home, the run never closed.
//
// Fix (src/js/game.js): walkHome records `blocked` on the FIRST refusal
// only, and records `clearableBlocked` — the first refusal
// clearBlockage can handle (fallen_tree / rubble / washed_out). The
// r240 driver's travelHome84 prefers clearableBlocked for the clear
// decision, falling back to the stopping block. This test proves:
//   A: r240 geometry — player (4,2), home (4,4), trees (4,3)+(5,3),
//      creek (3,2): walkHome stops naming the (4,3) TREE (not the
//      creek); clearableBlocked is that tree; clear + retry reaches home.
//   B: detour geometry — player (6,4), home (4,4), creek (5,4), trees
//      (6,5)+(6,3): walkHome stops naming the CREEK (first refusal)
//      with clearableBlocked the (6,5) tree; clear + retry reaches home
//      via the south detour.
//   C (control): open path -> walkHome reaches home, no block named.
//   D: all-creek -> stops naming the creek, clearableBlocked null,
//      clearBlockage refuses.
//   E (source): game.js walkHome has the first-refusal guard +
//      clearableBlocked; the r240 driver travelHome84 prefers it.
// Setup mirrors test-journey-establishment-r137-clearhome.js (broken
// run staging not needed — the walk itself is the unit under test;
// blockages staged via tileAt().blockFrom, creek via tile type).
// Usage: node scripts/test-journey-establishment-r240-walkhome-firstblock.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');
const ROOT = path.join(__dirname, '..');
const DRIVER = path.join(__dirname, 'journey-establishment-r240-20261118.js');
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
async function freshGame() {
  const { Game } = await loadGame({ seed: 385, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const v = Game.state.village || {};
  const home = (Number.isFinite(v.px) && Number.isFinite(v.py)) ? { x: v.px, y: v.py } : { x: 4, y: 4 };
  if (Number.isFinite(v.px) && Number.isFinite(v.py)) { Game.map.px = v.px; Game.map.py = v.py; }
  Game.dayPart = 0;
  function movePlayer(x, y) { Game.map.px = x; Game.map.py = y; try { Game.state.scholar.mx = x; Game.state.scholar.my = y; } catch (e) {} }
  // Stage a fallen-tree blockage on tile (x, y) guarding the approach
  // from (fx, fy): bf.dx/dy point FROM the tile TOWARD the approach
  // origin (travelBlockage: blocked when bf.dx === -sign(x - fx)).
  function stageTree(x, y, fx, fy) {
    const t = Game.tileAt(x, y);
    t.blockFrom = { type: 'fallen_tree', dx: Math.sign(fx - x), dy: Math.sign(fy - y) };
    return t;
  }
  function stageCreek(x, y) {
    const t = Game.tileAt(x, y);
    t.type = 'creek'; t.needsBridge = true; t.bridged = false;
    delete t.blockFrom;
    return t;
  }
  return { Game, home, movePlayer, stageTree, stageCreek };
}
async function main() {
  // A: r240 geometry — trees on the direct tile + the sidestep tile,
  // creek on the far sidestep. The old code reported the creek.
  {
    const t = await freshGame();
    t.movePlayer(4, 2);
    t.stageTree(4, 3, 4, 2); t.stageTree(5, 3, 5, 2); t.stageCreek(3, 2);
    const woodBefore = (() => { try { return t.Game.woodCount(); } catch (e) { return null; } })();
    const w1 = t.Game.walkHome(12);
    check('A1 walkHome stops, not reached', !!(w1 && !w1.reached), JSON.stringify(w1 && { reached: w1.reached, blocked: w1.blocked, interrupted: w1.interrupted }));
    check('A2 stopping block is the (4,3) fallen tree, not the creek', !!(w1 && w1.blocked && w1.blocked.blockType === 'fallen_tree' && w1.blocked.x === 4 && w1.blocked.y === 3), JSON.stringify(w1 && w1.blocked));
    check('A3 clearableBlocked is the (4,3) tree', !!(w1 && w1.clearableBlocked && w1.clearableBlocked.blockType === 'fallen_tree' && w1.clearableBlocked.x === 4 && w1.clearableBlocked.y === 3), JSON.stringify(w1 && w1.clearableBlocked));
    let cleared = false;
    try { cleared = !!t.Game.clearBlockage(w1.clearableBlocked.x, w1.clearableBlocked.y); } catch (e) { cleared = false; }
    check('A4 clearBlockage clears the reported tree', cleared);
    const woodAfter = (() => { try { return t.Game.woodCount(); } catch (e) { return null; } })();
    check('A5 cutting the tree yields +2 wood', woodBefore !== null && woodAfter === woodBefore + 2, `before=${woodBefore} after=${woodAfter}`);
    const w2 = t.Game.walkHome(12);
    check('A6 walkHome retry reaches home', !!(w2 && w2.reached), JSON.stringify(w2 && { reached: w2.reached, steps: w2.steps, blocked: w2.blocked }));
    check('A7 player is home after the retry', t.Game.map.px === t.home.x && t.Game.map.py === t.home.y, `at=(${t.Game.map.px},${t.Game.map.py}) home=(${t.home.x},${t.home.y})`);
  }
  // B: detour geometry — creek on the direct tile, trees on both
  // sidesteps. The walk must name the creek (first refusal) AND offer
  // a clearable tree, so clear-and-retry can detour around the creek.
  {
    const t = await freshGame();
    t.movePlayer(6, 4);
    t.stageCreek(5, 4); t.stageTree(6, 5, 6, 4); t.stageTree(6, 3, 6, 4);
    const w1 = t.Game.walkHome(12);
    check('B1 walkHome stops, not reached', !!(w1 && !w1.reached), JSON.stringify(w1 && { reached: w1.reached, blocked: w1.blocked, interrupted: w1.interrupted }));
    check('B2 stopping block is the (5,4) creek (first refusal)', !!(w1 && w1.blocked && w1.blocked.blockType === 'creek' && w1.blocked.x === 5 && w1.blocked.y === 4), JSON.stringify(w1 && w1.blocked));
    check('B3 clearableBlocked is the (6,5) tree', !!(w1 && w1.clearableBlocked && w1.clearableBlocked.blockType === 'fallen_tree' && w1.clearableBlocked.x === 6 && w1.clearableBlocked.y === 5), JSON.stringify(w1 && w1.clearableBlocked));
    let cleared = false;
    try { cleared = !!t.Game.clearBlockage(w1.clearableBlocked.x, w1.clearableBlocked.y); } catch (e) { cleared = false; }
    check('B4 clearBlockage clears the sidestep tree', cleared);
    const w2 = t.Game.walkHome(12);
    check('B5 walkHome retry reaches home via the detour', !!(w2 && w2.reached), JSON.stringify(w2 && { reached: w2.reached, steps: w2.steps, path: w2.path }));
    check('B6 detour went through the cleared (6,5) tile', !!(w2 && (w2.path || []).some(p => p.x === 6 && p.y === 5)), JSON.stringify(w2 && w2.path));
    check('B7 player is home after the retry', t.Game.map.px === t.home.x && t.Game.map.py === t.home.y, `at=(${t.Game.map.px},${t.Game.map.py}) home=(${t.home.x},${t.home.y})`);
  }
  // C (control): open path -> walkHome reaches home in one call.
  {
    const t = await freshGame();
    t.movePlayer(6, 4);
    const w = t.Game.walkHome(12);
    check('C1 walkHome reaches home on an open path', !!(w && w.reached), JSON.stringify(w && { reached: w.reached, steps: w.steps }));
    check('C2 no block named on an open path', !!(w && w.blocked === null), JSON.stringify(w && w.blocked));
    check('C3 no clearable block named on an open path', !!(w && (w.clearableBlocked === null || w.clearableBlocked === undefined)), JSON.stringify(w && w.clearableBlocked));
  }
  // D: all-creek -> stops naming the creek, nothing clearable.
  {
    const t = await freshGame();
    t.movePlayer(6, 4);
    t.stageCreek(5, 4); t.stageCreek(6, 5); t.stageCreek(6, 3);
    const w = t.Game.walkHome(12);
    check('D1 walkHome stops on creeks', !!(w && !w.reached), JSON.stringify(w && { reached: w.reached, blocked: w.blocked }));
    check('D2 stopping block is a creek', !!(w && w.blocked && w.blocked.blockType === 'creek'), JSON.stringify(w && w.blocked));
    check('D3 clearableBlocked is null with only creeks', !!(w && (w.clearableBlocked === null || w.clearableBlocked === undefined)), JSON.stringify(w && w.clearableBlocked));
    let cleared = null;
    try { cleared = t.Game.clearBlockage(w.blocked.x, w.blocked.y); } catch (e) { cleared = 'error:' + e.message; }
    check('D4 clearBlockage refuses a creek', cleared === false, 'returned=' + JSON.stringify(cleared));
  }
  // E (source): the fix is in game.js walkHome and the r240 driver
  // travelHome84 prefers the clearable refusal.
  {
    const src = fs.readFileSync(path.join(ROOT, 'src/js/game.js'), 'utf8');
    const m = src.match(/walkHome\(maxSteps\) \{[\s\S]*?\n    \},/);
    check('E1 game.js walkHome records blocked on first refusal only', !!(m && /if \(b && !blocked\) blocked = b;/.test(m[0])));
    check('E2 game.js walkHome records clearableBlocked', !!(m && /clearableBlocked/.test(m[0]) && /fallen_tree/.test(m[0])));
    check('E3 game.js walkHome returns clearableBlocked', !!(m && /clearableBlocked: reached \? null : clearableBlocked/.test(m[0])));
    const drv = fs.readFileSync(DRIVER, 'utf8');
    const th = drv.match(/function travelHome84\(\) \{[\s\S]*?\n  \}/);
    check('E4 driver travelHome84 prefers clearableBlocked', !!(th && /clearableBlocked\) \? w\.clearableBlocked : rec\.blocked/.test(th[0])));
    check('E5 driver travelHome84 still clears via blocked.x/blocked.y', !!(th && /Game\.clearBlockage\(blocked\.x, blocked\.y\)/.test(th[0])));
    check('E6 driver travelHome84 records rec.blocked as the stopping block', !!(th && /rec\.blocked = w && w\.blocked \? w\.blocked : null/.test(th[0])));
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('CRASH', e && e.stack || e); process.exit(1); });
