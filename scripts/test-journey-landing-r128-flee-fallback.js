#!/usr/bin/env node
// test-journey-landing-r128-flee-fallback.js — proof test for the r128
// LEGACY-FLEE-FALLBACK fix (journey-landing r128 2026-11-12).
//
// The defect (fresh-band scan, seed 1208 d29 vs The Callback, frozen
// policy): the scholar at (4,4) makes THREE identical `player-move to
// (0,4) moved:false` turns ("Too far — 3 squares left.") while the
// Callback beats them to 2 HP. Root cause, read in code
// (scripts/policies/competent.js fight()/flee()): the legacy flee walk
// passed the FAR edge tile in one call and IGNORED the result — a
// refused move still ended the turn as a flee. Next round the positions
// were unchanged, so the same tile was picked again. A second live shape
// (scan 1205 d20, 1208 d29): at the edge (8,0) the walk passes the
// scholar's OWN tile (8,0) — a silent self-move, ret=true, no movement,
// no line.
//
// The fix: legacyFleeWalk steps ONE tile toward the chosen edge, tries
// the two diagonal one-steps, and accepts a move only when the scholar's
// position actually changes (position check, not the return value —
// tbPlayerMove returns true without moving under the moderator's verb
// block). A moved walk resets the stuck count. A turn where no tile is
// reachable records a stuck turn; at 3 consecutive no-progress flee
// turns on this fight it returns 'unfleeable' — the caller returns false
// WITHOUT ending the turn, so fight() falls through to tricks/strikes in
// the same turn (the r37 gated-resolution shape, ungated for the legacy
// path). Already on the edge, the walk has nowhere to step — that is a
// stuck turn too, not a silent no-op.
//
// Cases (stub Game/fight — legacyFleeWalk takes Game, f, ctx, p, px, py,
// so no full harness is needed; each case runs in its own process so a
// case cannot leak state into another):
//   first-tile-blocked : the one-step tile refuses, the diagonal alternate
//             succeeds — returns 'moved', scholar at the alternate,
//             fleeStuckTurns 0.
//   all-blocked        : every candidate refuses — 1st call 'stuck'
//             (fleeStuckTurns 1), 3rd call 'unfleeable' (fleeBlocked 1,
//             _fleeBlockedFor set), 4th call 'unfleeable' immediately
//             with no further tbPlayerMove calls.
//   moderator-mute     : tbPlayerMove returns true WITHOUT moving (the
//             moderator's verb block) — the position check rejects it:
//             'stuck', fleeStuckTurns 1. The lying return value must not
//             count as a move.
//   on-edge            : scholar already on the edge (0,4) — no step to
//             take: 'stuck', then 'unfleeable' on the 3rd call.
//   control            : one-step tile succeeds — returns 'moved',
//             scholar on it, fleeStuckTurns 0. Pins the untouched path.
//
// "FAIL on unfixed code": legacyFleeWalk is NEW in r128 — on unfixed code
// the export is absent, so the test fails loudly at require time (the
// function cannot be driven at all). The behavioral cases above pin the
// contract the fix must meet; the panel proves the branch calls it.
//
// Usage: node scripts/test-journey-landing-r128-flee-fallback.js [first-tile-blocked|all-blocked|moderator-mute|on-edge|control]
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

if (typeof mod.legacyFleeWalk !== 'function') {
  console.log('FAIL legacyFleeWalk export missing — the r128 fix is not present (unfixed code)');
  process.exit(1);
}
const { legacyFleeWalk } = mod;

// Scholar starts at (sx,sy). The stub's tbPlayerMove refuses the tiles
// named in `blocked` (returns false), returns true WITHOUT moving for the
// tiles named in `mute` (the moderator's verb block), and moves onto any
// other tile.
function stubGame(sx, sy, blocked, mute) {
  const p = { key: 'p', mx: sx, my: sy, moveLeft: 3, hp: 100, maxHp: 100 };
  const f = { id: 'fight1', round: 1, over: false, fighters: [p] };
  const calls = [];
  const Game = {
    map: { px: 4, py: 4 },
    tbfight: f,
    tbIsPlayerTurn: () => true,
    tbPlayerMove: (x, y) => {
      calls.push([x, y]);
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
    // Scholar (4,4), edge tx=0: one-step (3,4) refuses, diagonal (3,5) succeeds.
    const { Game, f, p } = stubGame(4, 4, ['3,4'], []);
    const ctx = {};
    const r = legacyFleeWalk(Game, f, ctx, p, 4, 4);
    check('first-tile-blocked returns moved', r === 'moved', 'got ' + r);
    check('first-tile-blocked scholar actually moved', p.mx !== 4 || p.my !== 4, 'still at 4,4');
    check('first-tile-blocked scholar took the diagonal alternate', p.mx === 3 && p.my === 5, 'at ' + p.mx + ',' + p.my);
    check('first-tile-blocked no stuck recorded', !ctx.fleeStuckTurns, 'fleeStuckTurns=' + ctx.fleeStuckTurns);
  } else if (which === 'all-blocked') {
    const { Game, f, p, calls } = stubGame(4, 4, ['3,4', '3,5', '3,3'], []);
    const ctx = {};
    const r1 = legacyFleeWalk(Game, f, ctx, p, 4, 4);
    check('all-blocked 1st call returns stuck', r1 === 'stuck', 'got ' + r1);
    check('all-blocked scholar unmoved', p.mx === 4 && p.my === 4, 'at ' + p.mx + ',' + p.my);
    check('all-blocked stuck recorded', ctx.fleeStuckTurns === 1, 'fleeStuckTurns=' + ctx.fleeStuckTurns);
    check('all-blocked stuck detail names the edge', ctx._fleeWalkStuckAt && ctx._fleeWalkStuckAt.target[0] === 0 && ctx._fleeWalkStuckAt.target[1] === 4, JSON.stringify(ctx._fleeWalkStuckAt));
    const r2 = legacyFleeWalk(Game, f, ctx, p, 4, 4);
    check('all-blocked 2nd call returns stuck', r2 === 'stuck', 'got ' + r2);
    check('all-blocked stuck count grows', ctx.fleeStuckTurns === 2, 'fleeStuckTurns=' + ctx.fleeStuckTurns);
    const r3 = legacyFleeWalk(Game, f, ctx, p, 4, 4);
    check('all-blocked 3rd call returns unfleeable', r3 === 'unfleeable', 'got ' + r3);
    check('all-blocked fight marked unfleeable', ctx._fleeBlockedFor === f.id && ctx.fleeBlocked === 1, '_fleeBlockedFor=' + ctx._fleeBlockedFor + ' fleeBlocked=' + ctx.fleeBlocked);
    const nBefore = calls.length;
    const r4 = legacyFleeWalk(Game, f, ctx, p, 4, 4);
    check('all-blocked 4th call unfleeable immediately', r4 === 'unfleeable', 'got ' + r4);
    check('all-blocked 4th call makes no new moves', calls.length === nBefore, 'calls grew ' + nBefore + ' -> ' + calls.length);
  } else if (which === 'moderator-mute') {
    // Every candidate "succeeds" (returns true) but the scholar never moves.
    const { Game, f, p } = stubGame(4, 4, [], ['3,4', '3,5', '3,3']);
    const ctx = {};
    const r = legacyFleeWalk(Game, f, ctx, p, 4, 4);
    check('moderator-mute returns stuck (lying return rejected)', r === 'stuck', 'got ' + r);
    check('moderator-mute scholar unmoved', p.mx === 4 && p.my === 4, 'at ' + p.mx + ',' + p.my);
    check('moderator-mute stuck recorded', ctx.fleeStuckTurns === 1, 'fleeStuckTurns=' + ctx.fleeStuckTurns);
  } else if (which === 'on-edge') {
    // Scholar already on the edge (0,4): the walk has nowhere to step.
    const { Game, f, p } = stubGame(0, 4, [], []);
    const ctx = {};
    const r1 = legacyFleeWalk(Game, f, ctx, p, 0, 4);
    check('on-edge 1st call returns stuck', r1 === 'stuck', 'got ' + r1);
    check('on-edge scholar unmoved', p.mx === 0 && p.my === 4, 'at ' + p.mx + ',' + p.my);
    legacyFleeWalk(Game, f, ctx, p, 0, 4);
    const r3 = legacyFleeWalk(Game, f, ctx, p, 0, 4);
    check('on-edge 3rd call returns unfleeable', r3 === 'unfleeable', 'got ' + r3);
    check('on-edge fight marked unfleeable', ctx._fleeBlockedFor === f.id, '_fleeBlockedFor=' + ctx._fleeBlockedFor);
  } else if (which === 'control') {
    const { Game, f, p } = stubGame(4, 4, [], []);
    const ctx = {};
    const r = legacyFleeWalk(Game, f, ctx, p, 4, 4);
    check('control returns moved', r === 'moved', 'got ' + r);
    check('control scholar stepped one tile toward the edge', p.mx === 3 && p.my === 4, 'at ' + p.mx + ',' + p.my);
    check('control no stuck recorded', !ctx.fleeStuckTurns, 'fleeStuckTurns=' + ctx.fleeStuckTurns);
  } else {
    console.log('unknown case: ' + which);
    fails++;
  }
}

const arg = process.argv[2];
if (!arg) {
  runCase('first-tile-blocked');
  for (const c of ['all-blocked', 'moderator-mute', 'on-edge', 'control']) {
    try {
      execFileSync(process.execPath, [__filename, c], { stdio: 'inherit' });
    } catch (e) { fails++; console.log('FAIL child ' + c + ' exited non-zero'); }
  }
} else {
  runCase(arg);
}
process.exit(fails ? 1 : 0);
