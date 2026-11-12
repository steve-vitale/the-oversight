#!/usr/bin/env node
// test-journey-landing-r128-close-fallback.js — proof test for the r128
// CLOSE-FALLBACK fix (journey-landing r128 2026-11-12).
//
// The defect (fresh-band scan, seed 1209 d13 vs The Static Kite, frozen
// policy): the scholar at (8,0) makes FOUR identical `player-move to
// (5,3) moved:false` turns ("No path there."). Root cause, read in code
// AND proved by stack trace (scripts/policies/competent.js fight(),
// inline CLOSE THE DISTANCE block): the generic close path — used when
// no trick fires — picked ONE best adjacent tile, called tbPlayerMove
// once, IGNORED the result, and counted ctx.closed. Next round the
// positions were unchanged, so the same tile was picked again. This is a
// FIFTH unchecked-tbPlayerMove site, found by the r128 probe: the r127
// strike fix covered beastStrikeTarget (called only from the strike
// tricks), not fight()'s inline close. The scan's "failed dodge" reading
// of this fight was wrong — the stack shows all four calls come from the
// inline close (competent.js:4058), never from beastDodgeMove.
//
// The fix: closeStep tries EVERY tile adjacent to the target, nearest
// first, stepping as far as moveLeft pays (the r6 rule), and accepts a
// move only when the scholar's position actually changes (position check,
// not the return value). A moved step counts ctx.closed (done by the
// caller); a turn where no tile is reachable returns 'stuck' and the
// caller records ctx.closeStuckTurns / ctx._closeStuck. The gated
// approach-fallback bookkeeping below the call site is untouched.
//
// Cases (stub Game/fight — closeStep takes Game, f, ctx, p, px, py, tmx,
// tmy, so no full harness is needed; each case runs in its own process so
// a case cannot leak state into another):
//   first-tile-blocked : the nearest adjacent tile refuses, the next
//             succeeds — returns 'moved', scholar on the next tile.
//   all-blocked        : every adjacent tile refuses — returns 'stuck',
//             scholar unmoved.
//   moderator-mute     : tbPlayerMove returns true WITHOUT moving (the
//             moderator's verb block) — the position check rejects it:
//             returns 'stuck'.
//   none               : every adjacent tile occupied — returns 'none',
//             zero tbPlayerMove calls.
//   control            : nearest tile succeeds — returns 'moved', scholar
//             on it. Pins the untouched path.
//
// "FAIL on unfixed code": closeStep is NEW in r128 — on unfixed code the
// export is absent, so the test fails loudly at require time (the
// function cannot be driven at all). The behavioral cases above pin the
// contract the fix must meet; the panel + focused scan prove the call
// site uses it.
//
// Usage: node scripts/test-journey-landing-r128-close-fallback.js [first-tile-blocked|all-blocked|moderator-mute|none|control]
//   Default (no arg): runs all five cases, spawning children for the four
//   non-default cases (separate processes).
'use strict';
const { execFileSync } = require('child_process');
const mod = require('./policies/competent');

let fails = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails++;
}

if (typeof mod.closeStep !== 'function') {
  console.log('FAIL closeStep export missing — the r128 fix is not present (unfixed code)');
  process.exit(1);
}
const { closeStep } = mod;

// Scholar starts at (sx,sy), target monster at (tx,ty). The stub's
// tbPlayerMove refuses the tiles named in `blocked` (returns false),
// returns true WITHOUT moving for the tiles named in `mute` (the
// moderator's verb block), and moves onto any other tile. `occupied`
// names tiles other fighters stand on. `refuseAll` refuses everything.
// findPath returns a one-step path (so the r6 affordable-prefix rule
// keeps the full tile: path length 1 never exceeds moveLeft 3).
function stubGame(sx, sy, tx, ty, blocked, mute, occupied, refuseAll) {
  const p = { key: 'p', mx: sx, my: sy, moveLeft: 3, hp: 100, maxHp: 100 };
  const fighters = [p];
  for (const o of (occupied || [])) fighters.push({ key: 'm_' + o, mx: o[0], my: o[1], alive: true });
  const f = { id: 'fight1', round: 1, over: false, fighters: fighters };
  const calls = [];
  const Game = {
    map: { px: 4, py: 4 },
    tbfight: f,
    tbIsPlayerTurn: () => true,
    findPath: (x0, y0, x1, y1) => [[x1, y1]],
    tbPlayerMove: (x, y) => {
      calls.push([x, y]);
      if (refuseAll) return false;
      if ((mute || []).indexOf(x + ',' + y) >= 0) return true; // muted: true, no move
      if ((blocked || []).indexOf(x + ',' + y) >= 0) return false;
      p.mx = x; p.my = y;
      return true;
    },
  };
  return { Game, f, p, calls };
}

function runCase(which) {
  if (which === 'first-tile-blocked') {
    // Scholar (8,0), target (4,4): nearest adjacent tile is (5,3) — blocked
    // — so the next, (4,3) (dd 4, insertion order ahead of (5,4)), must land.
    const { Game, f, p } = stubGame(8, 0, 4, 4, ['5,3'], [], [], false);
    const ctx = {};
    const r = closeStep(Game, f, ctx, p, 8, 0, 4, 4);
    check('first-tile-blocked returns moved', r === 'moved', 'got ' + r);
    check('first-tile-blocked scholar actually moved', p.mx !== 8 || p.my !== 0, 'still at 8,0');
    check('first-tile-blocked scholar took the next tile', p.mx === 4 && p.my === 3, 'at ' + p.mx + ',' + p.my);
  } else if (which === 'all-blocked') {
    const { Game, f, p, calls } = stubGame(8, 0, 4, 4, [], [], [], true);
    const ctx = {};
    const r = closeStep(Game, f, ctx, p, 8, 0, 4, 4);
    check('all-blocked returns stuck', r === 'stuck', 'got ' + r);
    check('all-blocked scholar unmoved', p.mx === 8 && p.my === 0, 'at ' + p.mx + ',' + p.my);
    check('all-blocked tried more than one tile', calls.length > 1, 'calls=' + calls.length);
  } else if (which === 'moderator-mute') {
    // Every adjacent tile "succeeds" (returns true) but the scholar never moves.
    const { Game, f, p } = stubGame(8, 0, 4, 4, [], ['3,3', '3,4', '3,5', '4,3', '4,5', '5,3', '5,4', '5,5'], []);
    const ctx = {};
    const r = closeStep(Game, f, ctx, p, 8, 0, 4, 4);
    check('moderator-mute returns stuck (lying return rejected)', r === 'stuck', 'got ' + r);
    check('moderator-mute scholar unmoved', p.mx === 8 && p.my === 0, 'at ' + p.mx + ',' + p.my);
  } else if (which === 'none') {
    // Every adjacent tile of (4,4) occupied by another fighter.
    const occ = [[3, 3], [3, 4], [3, 5], [4, 3], [4, 5], [5, 3], [5, 4], [5, 5]];
    const { Game, f, p, calls } = stubGame(8, 0, 4, 4, [], [], occ);
    const ctx = {};
    const r = closeStep(Game, f, ctx, p, 8, 0, 4, 4);
    check('none returns none', r === 'none', 'got ' + r);
    check('none scholar unmoved', p.mx === 8 && p.my === 0, 'at ' + p.mx + ',' + p.my);
    check('none no move attempted', calls.length === 0, 'calls=' + calls.length);
  } else if (which === 'control') {
    const { Game, f, p } = stubGame(8, 0, 4, 4, [], [], []);
    const ctx = {};
    const r = closeStep(Game, f, ctx, p, 8, 0, 4, 4);
    check('control returns moved', r === 'moved', 'got ' + r);
    check('control scholar stepped onto the nearest tile', p.mx === 5 && p.my === 3, 'at ' + p.mx + ',' + p.my);
  } else {
    console.log('unknown case: ' + which);
    fails++;
  }
}

const arg = process.argv[2];
if (!arg) {
  runCase('first-tile-blocked');
  for (const c of ['all-blocked', 'moderator-mute', 'none', 'control']) {
    try {
      execFileSync(process.execPath, [__filename, c], { stdio: 'inherit' });
    } catch (e) { fails++; console.log('FAIL child ' + c + ' exited non-zero'); }
  }
} else {
  runCase(arg);
}
process.exit(fails ? 1 : 0);
