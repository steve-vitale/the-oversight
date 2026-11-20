#!/usr/bin/env node
// test-journey-landing-r149-close-nopath-20261120.js — proof test for the
// r149 CLOSE-NOPATH fix (journey-landing r149 2026-11-20).
//
// The defect (panel r149 AFTER-FIX, seed 1277 d25 vs the Spool, wave 3):
// the scholar stands at the grid corner (8,8) — walled in, the orthogonal
// edge neighbours are barrier walls and the diagonal is corner-cut-blocked,
// so the game's findPath returns null for every tile — and the approach
// burns 14 refused moves in two rounds (7 per round, "No path there." once
// then deduped silent) trying every tile adjacent to the monster. The
// fight was still won (the scholar struck 4× for damage once the Spool
// closed in), so the v3 refused-turns metric — which binds on zero-DMG
// fights — does not count them; but the turns are wasted on refused verbs
// all the same, the same defect family as the r149 dodge scan.
//
// Root cause, read in code (scripts/policies/competent.js): closeStep
// calls Game.findPath and uses the path ONLY to truncate a too-long step
// — it never checks whether the path EXISTS, so a null-path candidate is
// attempted anyway and refused. beastStrikeTarget has the identical shape
// (a null path falls through to the full-destination attempt). The fix:
// skip a candidate with no path, in both helpers, without calling
// tbPlayerMove. (The dodge twin was fixed in beastDodgeMove earlier this
// run; the Spool fight's 14 refusals came from closeStep, not a dodge —
// the Spool has no policy counter, so no trick fires for it.)
//
// Cases (stub Game/fight — closeStep/beastStrikeTarget take Game, f, ctx,
// p, so no full harness is needed; each case runs in its own process so a
// case cannot leak state into another):
//   close-corner    : the panel shape — scholar (8,8), moveLeft 3,
//             monster at (6,6). findPath from the corner returns null
//             for every adjacent tile. Zero tbPlayerMove calls, 'stuck'.
//             On unfixed code the scan attempts all 8 adjacent tiles
//             (calls=8) -> FAIL.
//   close-reachable : scholar (4,4), moveLeft 3, monster (5,5) —
//             scholar moves adjacent, 'moved'. Pins the working path
//             (also green on unfixed code).
//   strike-corner   : the same cornered shape via beastStrikeTarget —
//             zero calls, 'stuck', turn ended. On unfixed code the scan
//             attempts all 8 adjacent tiles -> FAIL.
//   strike-reachable: scholar (4,4), monster (5,5) via beastStrikeTarget
//             — moves adjacent, 'moved'. Pins the working path (also
//             green on unfixed code).
//
// Usage: node scripts/test-journey-landing-r149-close-nopath-20261120.js [case]
//   Default (no arg): runs all four cases, spawning children for the three
//   non-default cases (separate processes).
'use strict';
const { execFileSync } = require('child_process');
const mod = require('./policies/competent');

let fails = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails++;
}

if (typeof mod.closeStep !== 'function' || typeof mod.beastStrikeTarget !== 'function') {
  console.log('FAIL closeStep/beastStrikeTarget export missing');
  process.exit(1);
}
const { closeStep, beastStrikeTarget } = mod;

// The stub models the walled-in corner faithfully: findPath from (8,8)
// returns null (the orthogonal edge neighbours are barrier walls and the
// diagonal is corner-cut-blocked — game.js findPath), everywhere else it
// returns a Chebyshev path. tbPlayerMove mirrors the game: no path, or a
// cost over moveLeft, is refused without moving.
function chebPath(x0, y0, x1, y1) {
  const out = [];
  let x = x0, y = y0;
  while (x !== x1 || y !== y1) {
    x += Math.sign(x1 - x);
    y += Math.sign(y1 - y);
    out.push([x, y]);
  }
  return out;
}

function stubGame(sx, sy, moveLeft, mx, my) {
  const p = { key: 'p', mx: sx, my: sy, moveLeft: moveLeft, hp: 100, maxHp: 100 };
  const m = { key: 'm_0', kind: 'monster', monsterId: 'spool', alive: true, hp: 50, maxHp: 50, mx: mx, my: my };
  const f = { id: 'fight1', round: 1, over: false, fighters: [p, m] };
  const calls = [];
  const strikes = [];
  const Game = {
    data: { monsters: [] },
    state: { monsterCounters: {}, codex: { monsters: {} }, scholar: {} },
    map: { px: 4, py: 4 },
    tbfight: f,
    tbIsPlayerTurn: () => true,
    tbFighter: (k) => (k === 'p' ? p : m),
    equippedWeapon: () => ({ range: 1 }),
    findPath: (x0, y0, x1, y1) => {
      if (x0 === 8 && y0 === 8) return null; // walled-in corner: no path out
      return chebPath(x0, y0, x1, y1);
    },
    tbTerrainCost: () => 1,
    tbPlayerMove: (x, y) => {
      calls.push([x, y]);
      const path = (p.mx === 8 && p.my === 8) ? null : chebPath(p.mx, p.my, x, y);
      if (!path || !path.length) return false;
      if (path.length > p.moveLeft) return false;
      p.moveLeft -= path.length;
      p.mx = x; p.my = y;
      return true;
    },
    tbPlayerStrike: (k) => { strikes.push(k); return true; },
  };
  return { Game, f, p, m, calls, strikes };
}

function runCase(which) {
  if (which === 'close-corner') {
    // Scholar (8,8), moveLeft 3, monster at (6,6). All 8 adjacent tiles
    // have no path from the corner.
    const { Game, f, p, calls } = stubGame(8, 8, 3, 6, 6);
    const ctx = {};
    const r = closeStep(Game, f, ctx, p, 8, 8, 6, 6);
    check('close-corner returns stuck', r === 'stuck', 'got ' + r);
    check('close-corner NO move attempted (null-path scan refused)', calls.length === 0, 'calls=' + calls.length);
    check('close-corner scholar unmoved', p.mx === 8 && p.my === 8, 'at ' + p.mx + ',' + p.my);
  } else if (which === 'close-reachable') {
    // Scholar (3,3), moveLeft 3, monster (5,5) — nearest adjacent tile
    // is (4,4), cost 1. The scholar must land on it in one attempt.
    // (The scholar's own tile is never a candidate here: (3,3) is not
    // adjacent to (5,5).)
    const { Game, f, p, calls } = stubGame(3, 3, 3, 5, 5);
    const ctx = {};
    const r = closeStep(Game, f, ctx, p, 3, 3, 5, 5);
    check('close-reachable returns moved', r === 'moved', 'got ' + r);
    check('close-reachable scholar moved adjacent to the monster', p.mx === 4 && p.my === 4, 'at ' + p.mx + ',' + p.my);
    check('close-reachable one attempt', calls.length === 1, 'calls=' + calls.length);
  } else if (which === 'strike-corner') {
    // Same cornered shape via beastStrikeTarget (out of range, range 1).
    const { Game, f, p, m, calls } = stubGame(8, 8, 3, 6, 6);
    const ctx = {};
    let ended = false;
    const r = beastStrikeTarget(Game, f, ctx, p, 8, 8, m, () => { ended = true; });
    check('strike-corner returns stuck', r === 'stuck', 'got ' + r);
    check('strike-corner NO move attempted (null-path scan refused)', calls.length === 0, 'calls=' + calls.length);
    check('strike-corner scholar unmoved', p.mx === 8 && p.my === 8, 'at ' + p.mx + ',' + p.my);
    check('strike-corner turn ended', ended === true);
  } else if (which === 'strike-reachable') {
    // Scholar (3,3) is out of range (d0=2 > range 1) but can close:
    // nearest adjacent tile is (4,4). Moves, 'moved', one attempt.
    const { Game, f, p, m, calls } = stubGame(3, 3, 3, 5, 5);
    const ctx = {};
    let ended = false;
    const r = beastStrikeTarget(Game, f, ctx, p, 3, 3, m, () => { ended = true; });
    check('strike-reachable returns moved', r === 'moved', 'got ' + r);
    check('strike-reachable scholar moved adjacent to the monster', p.mx === 4 && p.my === 4, 'at ' + p.mx + ',' + p.my);
    check('strike-reachable turn ended', ended === true);
    check('strike-reachable one attempt', calls.length === 1, 'calls=' + calls.length);
  } else {
    console.log('unknown case: ' + which);
    fails++;
  }
}

const arg = process.argv[2];
if (!arg) {
  runCase('close-corner');
  for (const c of ['close-reachable', 'strike-corner', 'strike-reachable']) {
    try {
      execFileSync(process.execPath, [__filename, c], { stdio: 'inherit' });
    } catch (e) { fails++; console.log('FAIL child ' + c + ' exited non-zero'); }
  }
} else {
  runCase(arg);
}
process.exit(fails ? 1 : 0);
