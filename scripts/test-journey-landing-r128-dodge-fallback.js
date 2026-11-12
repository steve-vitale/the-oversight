#!/usr/bin/env node
// test-journey-landing-r128-dodge-fallback.js — proof test for the r128
// DODGE-FALLBACK fix (journey-landing r128 2026-11-12).
//
// The defect (fresh-band scan, seed 1209 d13 vs The Static Kite, frozen
// policy): the scholar at (8,0) makes FOUR identical dodge attempts to
// (5,3) — "No path there." x3 + one silent — and the trick is counted as
// performed each time (ctx.beastTricks increments) although the scholar
// never moved. Root cause, read in code (scripts/policies/competent.js
// beastTrickPlay): move_windup and sidestep picked ONE tile via
// beastDodgeTile, called Game.tbPlayerMove, IGNORED the result, and called
// trickDone() unconditionally; keep_distance broke after the FIRST
// affordable candidate's move attempt regardless of result, and also
// counted the trick unconditionally.
//
// The fix: move_windup / sidestep try EVERY free tile (nearest first,
// skipping the avoid/lane set) via beastDodgeMove and accept only a real
// position change; keep_distance breaks only when the position actually
// changes and tries the next candidate otherwise. A turn where no tile is
// reachable records ctx.dodgeStuckTurns / ctx._dodgeStuck and ends the
// turn WITHOUT counting the trick — the trick didn't happen, so it must
// not be counted as performed. (A trick with no candidate tile at all
// keeps today's `continue` — the next monster's trick may still fire.)
//
// Cases (stub Game/fight — beastTrickPlay takes Game, f, ctx, p, endTurn,
// so no full harness is needed; each case runs in its own process so a
// case cannot leak state into another):
//   windup-first-blocked : nearest dodge tile refuses, the next succeeds
//             — scholar moves, beastTricks 1. On unfixed code the scholar
//             stays put AND beastTricks is 1 -> FAIL.
//   windup-all-blocked  : every dodge refuses — scholar unmoved,
//             beastTricks 0, dodgeStuckTurns 1, _dodgeStuck.kind
//             'move_windup'. On unfixed code beastTricks is 1 -> FAIL.
//   sidestep-control    : scholar in the lane, nearest out-of-lane tile
//             succeeds — scholar moves, beastTricks 1. Pins the working
//             path (also green on unfixed code).
//   sidestep-all-blocked: every dodge refuses — beastTricks 0,
//             dodgeStuckTurns 1, kind 'sidestep'. On unfixed code
//             beastTricks is 1 -> FAIL.
//   keep-distance-first-blocked : nearest at-distance tile refuses, the
//             next succeeds — scholar moves, beastTricks 1. On unfixed
//             code the scholar stays put AND beastTricks is 1 -> FAIL.
//   keep-distance-all-blocked   : every candidate refuses — beastTricks
//             0, dodgeStuckTurns 1, kind 'keep_distance'. On unfixed
//             code beastTricks is 1 -> FAIL.
//   keep-distance-at-need : scholar already at the trick's distance —
//             no move needed, beastTricks 1, zero tbPlayerMove calls.
//             Pins the untouched path (also green on unfixed code).
//
// Usage: node scripts/test-journey-landing-r128-dodge-fallback.js [case]
//   Default (no arg): runs all seven cases, spawning children for the six
//   non-default cases (separate processes).
'use strict';
const { execFileSync } = require('child_process');
const mod = require('./policies/competent');

let fails = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails++;
}

if (typeof mod.beastTrickPlay !== 'function') {
  console.log('FAIL beastTrickPlay export missing — the r128 fix is not present (unfixed code)');
  process.exit(1);
}
const { beastTrickPlay } = mod;

const MONSTERS = [
  { id: 'statickite', counter: { kind: 'move_windup' } },
  { id: 'bulldozer', counter: { kind: 'sidestep' } },
  { id: 'bright_idea', counter: { kind: 'keep_distance', tiles: 3 } },
];

// The stub's tbPlayerMove refuses the tiles named in `blocked` (returns
// false) and moves onto any other tile. `refuseAll` refuses everything.
function stubGame(sx, sy, mx, my, mid, telegraphCells, blocked, refuseAll) {
  const p = { key: 'p', mx: sx, my: sy, moveLeft: 3, hp: 100, maxHp: 100 };
  const m = { key: 'm_0', kind: 'monster', monsterId: mid, alive: true, hp: 50, maxHp: 50,
    mx: mx, my: my, telegraph: telegraphCells ? { cells: telegraphCells } : null };
  const f = { id: 'fight1', round: 1, over: false, fighters: [p, m] };
  const calls = [];
  const Game = {
    data: { monsters: MONSTERS },
    state: { monsterCounters: { statickite: 1, bulldozer: 1, bright_idea: 1 }, codex: { monsters: {} }, scholar: {} },
    map: { px: 4, py: 4 },
    tbfight: f,
    tbIsPlayerTurn: () => true,
    findPath: (x0, y0, x1, y1) => [[x1, y1]],
    tbTerrainCost: () => 1,
    tbPlayerMove: (x, y) => {
      calls.push([x, y]);
      if (refuseAll) return false;
      if ((blocked || []).indexOf(x + ',' + y) >= 0) return false;
      p.mx = x; p.my = y;
      return true;
    },
  };
  return { Game, f, p, m, calls };
}

function runCase(which) {
  if (which === 'windup-first-blocked') {
    // Scholar (8,0), statickite telegraph avoids (7,1); nearest free dodge
    // tile is (6,1) — blocked — so the next, (6,2), must land.
    const { Game, f, p } = stubGame(8, 0, 5, 5, 'statickite', [{ cx: 7, cy: 1 }], ['6,1'], false);
    const ctx = {};
    let ended = false;
    const r = beastTrickPlay(Game, f, ctx, p, () => { ended = true; });
    check('windup-first-blocked trick plays', r === true, 'got ' + r);
    check('windup-first-blocked scholar actually moved', p.mx !== 8 || p.my !== 0, 'still at 8,0');
    check('windup-first-blocked scholar took the next tile', p.mx === 6 && p.my === 2, 'at ' + p.mx + ',' + p.my);
    check('windup-first-blocked trick counted once', ctx.beastTricks === 1, 'beastTricks=' + ctx.beastTricks);
    check('windup-first-blocked turn ended', ended === true);
    check('windup-first-blocked no stuck recorded', !ctx.dodgeStuckTurns, 'dodgeStuckTurns=' + ctx.dodgeStuckTurns);
  } else if (which === 'windup-all-blocked') {
    const { Game, f, p } = stubGame(8, 0, 5, 5, 'statickite', [{ cx: 7, cy: 1 }], [], true);
    const ctx = {};
    let ended = false;
    const r = beastTrickPlay(Game, f, ctx, p, () => { ended = true; });
    check('windup-all-blocked trick plays (turn spent)', r === true, 'got ' + r);
    check('windup-all-blocked scholar unmoved', p.mx === 8 && p.my === 0, 'at ' + p.mx + ',' + p.my);
    check('windup-all-blocked trick NOT counted', !ctx.beastTricks, 'beastTricks=' + ctx.beastTricks);
    check('windup-all-blocked stuck recorded', ctx.dodgeStuckTurns === 1, 'dodgeStuckTurns=' + ctx.dodgeStuckTurns);
    check('windup-all-blocked stuck detail names the trick', ctx._dodgeStuck && ctx._dodgeStuck.kind === 'move_windup', JSON.stringify(ctx._dodgeStuck));
    check('windup-all-blocked turn ended', ended === true);
  } else if (which === 'sidestep-control') {
    // Scholar (4,4) inside the lane (4,4)-(5,4)-(6,4); bulldozer at (5,5).
    // Nearest free tile outside the lane is (3,3).
    const { Game, f, p } = stubGame(4, 4, 5, 5, 'bulldozer', [{ cx: 4, cy: 4 }, { cx: 5, cy: 4 }, { cx: 6, cy: 4 }], [], false);
    const ctx = {};
    let ended = false;
    const r = beastTrickPlay(Game, f, ctx, p, () => { ended = true; });
    check('sidestep-control trick plays', r === true, 'got ' + r);
    check('sidestep-control scholar moved off the lane', p.mx === 3 && p.my === 3, 'at ' + p.mx + ',' + p.my);
    check('sidestep-control trick counted once', ctx.beastTricks === 1, 'beastTricks=' + ctx.beastTricks);
    check('sidestep-control turn ended', ended === true);
  } else if (which === 'sidestep-all-blocked') {
    const { Game, f, p } = stubGame(4, 4, 5, 5, 'bulldozer', [{ cx: 4, cy: 4 }, { cx: 5, cy: 4 }, { cx: 6, cy: 4 }], [], true);
    const ctx = {};
    let ended = false;
    const r = beastTrickPlay(Game, f, ctx, p, () => { ended = true; });
    check('sidestep-all-blocked trick plays (turn spent)', r === true, 'got ' + r);
    check('sidestep-all-blocked scholar unmoved', p.mx === 4 && p.my === 4, 'at ' + p.mx + ',' + p.my);
    check('sidestep-all-blocked trick NOT counted', !ctx.beastTricks, 'beastTricks=' + ctx.beastTricks);
    check('sidestep-all-blocked stuck recorded', ctx.dodgeStuckTurns === 1, 'dodgeStuckTurns=' + ctx.dodgeStuckTurns);
    check('sidestep-all-blocked stuck detail names the trick', ctx._dodgeStuck && ctx._dodgeStuck.kind === 'sidestep', JSON.stringify(ctx._dodgeStuck));
    check('sidestep-all-blocked turn ended', ended === true);
  } else if (which === 'keep-distance-first-blocked') {
    // Bright_idea at (5,5), need 3; scholar (4,4) is 1 out. Nearest tile
    // exactly 3 out is (2,2) — blocked — so the next, (2,3), must land.
    const { Game, f, p } = stubGame(4, 4, 5, 5, 'bright_idea', null, ['2,2'], false);
    const ctx = {};
    let ended = false;
    const r = beastTrickPlay(Game, f, ctx, p, () => { ended = true; });
    check('keep-distance-first-blocked trick plays', r === true, 'got ' + r);
    check('keep-distance-first-blocked scholar actually moved', p.mx !== 4 || p.my !== 4, 'still at 4,4');
    check('keep-distance-first-blocked scholar took the next tile', p.mx === 2 && p.my === 3, 'at ' + p.mx + ',' + p.my);
    check('keep-distance-first-blocked trick counted once', ctx.beastTricks === 1, 'beastTricks=' + ctx.beastTricks);
    check('keep-distance-first-blocked turn ended', ended === true);
    check('keep-distance-first-blocked no stuck recorded', !ctx.dodgeStuckTurns, 'dodgeStuckTurns=' + ctx.dodgeStuckTurns);
  } else if (which === 'keep-distance-all-blocked') {
    const { Game, f, p } = stubGame(4, 4, 5, 5, 'bright_idea', null, [], true);
    const ctx = {};
    let ended = false;
    const r = beastTrickPlay(Game, f, ctx, p, () => { ended = true; });
    check('keep-distance-all-blocked trick plays (turn spent)', r === true, 'got ' + r);
    check('keep-distance-all-blocked scholar unmoved', p.mx === 4 && p.my === 4, 'at ' + p.mx + ',' + p.my);
    check('keep-distance-all-blocked trick NOT counted', !ctx.beastTricks, 'beastTricks=' + ctx.beastTricks);
    check('keep-distance-all-blocked stuck recorded', ctx.dodgeStuckTurns === 1, 'dodgeStuckTurns=' + ctx.dodgeStuckTurns);
    check('keep-distance-all-blocked stuck detail names the trick', ctx._dodgeStuck && ctx._dodgeStuck.kind === 'keep_distance', JSON.stringify(ctx._dodgeStuck));
    check('keep-distance-all-blocked turn ended', ended === true);
  } else if (which === 'keep-distance-at-need') {
    // Scholar (2,2) is already exactly 3 out from bright_idea (5,5).
    const { Game, f, p, calls } = stubGame(2, 2, 5, 5, 'bright_idea', null, [], false);
    const ctx = {};
    let ended = false;
    const r = beastTrickPlay(Game, f, ctx, p, () => { ended = true; });
    check('keep-distance-at-need trick plays', r === true, 'got ' + r);
    check('keep-distance-at-need scholar stayed put', p.mx === 2 && p.my === 2, 'at ' + p.mx + ',' + p.my);
    check('keep-distance-at-need trick counted once', ctx.beastTricks === 1, 'beastTricks=' + ctx.beastTricks);
    check('keep-distance-at-need no move attempted', calls.length === 0, 'calls=' + calls.length);
    check('keep-distance-at-need turn ended', ended === true);
  } else {
    console.log('unknown case: ' + which);
    fails++;
  }
}

const arg = process.argv[2];
if (!arg) {
  runCase('windup-first-blocked');
  for (const c of ['windup-all-blocked', 'sidestep-control', 'sidestep-all-blocked', 'keep-distance-first-blocked', 'keep-distance-all-blocked', 'keep-distance-at-need']) {
    try {
      execFileSync(process.execPath, [__filename, c], { stdio: 'inherit' });
    } catch (e) { fails++; console.log('FAIL child ' + c + ' exited non-zero'); }
  }
} else {
  runCase(arg);
}
process.exit(fails ? 1 : 0);
