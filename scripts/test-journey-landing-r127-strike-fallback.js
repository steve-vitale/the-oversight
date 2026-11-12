#!/usr/bin/env node
// test-journey-landing-r127-strike-fallback.js — proof test for the r127
// STRIKE-FALLBACK fix (journey-landing r127 2026-11-12).
//
// The defect (panel r126, seed 1151 d28, scholar vs The Focus Group + 2
// eye-heads, ally Nadia; fight log in the r126 AFTER census): the scholar
// moves once to (7,7), then makes THREE `player-move to (6,6) moved:false`
// turns and strikes 0 times while Nadia deals all 90 damage. Root cause,
// read in code (scripts/policies/competent.js beastStrikeTarget): out of
// range, the policy picked ONE best adjacent tile, called
// Game.tbPlayerMove(dx,dy), and IGNORED the result — a refused move still
// ended the turn as 'moved' and still counted ctx.closed. Next round the
// positions were unchanged, so the same tile was picked again.
//
// The fix: try EVERY adjacent tile (interior 1..7, unoccupied), nearest
// first, and accept a move only when the scholar's position actually
// changes (position check, not the return value — tbPlayerMove returns
// true without moving under the moderator's verb block). A failed move
// counts nothing; a turn where no tile is reachable returns 'stuck' and
// records ctx.stuckTurns / ctx._strikeStuck.
//
// Cases (stub Game/fight — the function takes Game, f, ctx, p, px, py,
// tgt, endTurn as arguments, so no full harness is needed; each case runs
// in its own process so a case cannot leak state into another):
//   first-tile-blocked : the best tile's tbPlayerMove refuses, the second
//             tile succeeds — scholar moves, returns 'moved', ctx.closed
//             = 1. On unfixed code: returns 'moved' with the scholar
//             unmoved and ctx.closed = 1 -> FAIL.
//   all-blocked        : every move refuses — returns 'stuck',
//             ctx.stuckTurns = 1, ctx.closed = 0. On unfixed code returns
//             'moved' with ctx.closed = 1 -> FAIL.
//   control            : best tile succeeds — returns 'moved', scholar
//             moved, ctx.closed = 1. Pins the untouched path.
//
// Usage: node scripts/test-journey-landing-r127-strike-fallback.js [first-tile-blocked|all-blocked|control]
//   Default (no arg): runs all three cases, spawning children for the two
//   non-default cases (separate processes).
'use strict';
const { execFileSync } = require('child_process');
const { beastStrikeTarget } = require('./policies/competent');

let fails = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails++;
}

// Scholar at (7,7), target The Focus Group at (5,5), weapon range 1.
// Adjacent tiles sorted by Chebyshev distance from (7,7): (6,6) d1 first,
// then (6,7)/(7,6) d1, then the d2 ring. The stub's tbPlayerMove refuses
// the tiles named in `blocked` and moves onto any other tile.
function stubGame(blocked) {
  const p = { mx: 7, my: 7, moveLeft: 3, hp: 100, maxHp: 100 };
  const tgt = { key: 'm_0', mx: 5, my: 5, alive: true };
  const f = { fighters: [
    { key: 'p', mx: 7, my: 7, alive: true },
    { key: 'm_0', mx: 5, my: 5, alive: true, kind: 'monster' },
  ] };
  const Game = {
    equippedWeapon: () => ({ range: 1 }),
    findPath: (x0, y0, x1, y1) => [[x1, y1]],
    tbTerrainCost: () => 1,
    tbIsPlayerTurn: () => true,
    tbPlayerMove: (x, y) => {
      if ((blocked || []).indexOf(x + ',' + y) >= 0) return false;
      p.mx = x; p.my = y;
      return true;
    },
    tbPlayerStrike: () => {},
  };
  return { Game, f, p, tgt };
}

function runCase(which) {
  if (which === 'first-tile-blocked') {
    const { Game, f, p, tgt } = stubGame(['6,6']);
    const ctx = {};
    let ended = false;
    const r = beastStrikeTarget(Game, f, ctx, p, 7, 7, tgt, () => { ended = true; });
    check('first-tile-blocked returns moved', r === 'moved', 'got ' + r);
    check('first-tile-blocked scholar actually moved', p.mx !== 7 || p.my !== 7, 'still at 7,7');
    check('first-tile-blocked scholar did NOT take the blocked tile', !(p.mx === 6 && p.my === 6), 'at 6,6');
    check('first-tile-blocked closed counts the real move', ctx.closed === 1, 'closed=' + ctx.closed);
    check('first-tile-blocked turn ended', ended === true);
    check('first-tile-blocked no stuck recorded', !ctx.stuckTurns, 'stuckTurns=' + ctx.stuckTurns);
  } else if (which === 'all-blocked') {
    // Block every tile the policy can step onto: all 8 adjacent tiles of
    // (5,5) plus the scholar's own tile (findPath may return a step short
    // of the tile — the stub refuses any destination in the blocked set).
    const blocked = ['4,4', '4,5', '4,6', '5,4', '5,6', '6,4', '6,5', '6,6', '7,7'];
    const { Game, f, p, tgt } = stubGame(blocked);
    const ctx = {};
    let ended = false;
    const r = beastStrikeTarget(Game, f, ctx, p, 7, 7, tgt, () => { ended = true; });
    check('all-blocked returns stuck', r === 'stuck', 'got ' + r);
    check('all-blocked scholar unmoved', p.mx === 7 && p.my === 7, 'at ' + p.mx + ',' + p.my);
    check('all-blocked stuck recorded', ctx.stuckTurns === 1, 'stuckTurns=' + ctx.stuckTurns);
    check('all-blocked closed counts nothing', !ctx.closed, 'closed=' + ctx.closed);
    check('all-blocked stuck detail names the target', ctx._strikeStuck && ctx._strikeStuck.target[0] === 5 && ctx._strikeStuck.target[1] === 5, JSON.stringify(ctx._strikeStuck));
    check('all-blocked turn ended', ended === true);
  } else if (which === 'control') {
    const { Game, f, p, tgt } = stubGame([]);
    const ctx = {};
    let ended = false;
    const r = beastStrikeTarget(Game, f, ctx, p, 7, 7, tgt, () => { ended = true; });
    check('control returns moved', r === 'moved', 'got ' + r);
    check('control scholar moved onto the best tile', p.mx === 6 && p.my === 6, 'at ' + p.mx + ',' + p.my);
    check('control closed counts the move', ctx.closed === 1, 'closed=' + ctx.closed);
    check('control turn ended', ended === true);
  } else {
    console.log('unknown case: ' + which);
    fails++;
  }
}

const arg = process.argv[2];
if (!arg) {
  runCase('first-tile-blocked');
  for (const c of ['all-blocked', 'control']) {
    try {
      execFileSync(process.execPath, [__filename, c], { stdio: 'inherit' });
    } catch (e) { fails++; console.log('FAIL child ' + c + ' exited non-zero'); }
  }
} else {
  runCase(arg);
}
process.exit(fails ? 1 : 0);
