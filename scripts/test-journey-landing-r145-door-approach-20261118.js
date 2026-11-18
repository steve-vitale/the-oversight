#!/usr/bin/env node
// test-journey-landing-r145-door-approach-20261118.js — proof test for the
// r145 DOOR-SKIP fix (journey-landing r145 2026-11-18).
//
// The defect (panel, seed 1234 d9 vs Old Stare, gallowdeer, 4 allies):
// the scholar at (4,7) approached a monster at (4,5) north of the Haven
// hall doors. The nearest tile adjacent to the monster was the hall door
// at (4,6) (the step before it, (3,6), failed "No path there."). A fight
// step landed on (4,6) — and stepping on a door tile in combat escapes
// the fight (game.js FLEE BY DOOR, Steve 2026-10-05: a designed exit,
// not a move). The fight ended 'fled' with 0 strikes, the monster
// unharmed at full HP, 4 allies left behind. The game behaved exactly as
// designed; the POLICY's fight step took the exit by accident.
//
// The fix: fight steps skip door tiles — the shared isDoorTile helper
// (via Game.genDetail, fail-open if unavailable) in TWO places:
//   * closeStep — the approach step (candidate AND the findPath step it
//     actually walks, which can cross a door even when the candidate is
//     not one). If no non-door step remains, returns 'stuck' so the
//     caller waits for the monster to come through.
//   * beastDodgeMove — the trick dodge step. The panel's (4,6) step was
//     fired by THIS function, not closeStep: the gallowdeer's counter is
//     move_windup ("MOVE, don't stare"), and the dodge tried the nearest
//     free tiles — (3,6) refused (wall), then (4,6) (door). The dodge
//     skips doors before counting a candidate, so a doors-only board
//     reads as 'none' (no valid tile), not 'stuck'.
//
// Cases (stub Game/fight — closeStep/beastDodgeMove take Game, f, ctx/p,
// px, py, so no full harness is needed; each case runs in its own process
// so a case cannot leak state into another):
//   door-skip    : scholar (4,7), monster (4,5), doors (4,6),(5,6), wall
//                  (3,6). The nearest adjacent tile is a door; the next
//                  is a wall. closeStep must step onto a NON-door tile
//                  ((3,5) or (5,5)) and never call tbPlayerMove with a
//                  door tile. Returns 'moved'.
//   door-only    : same geometry, but every non-door adjacent tile is
//                  blocked — the only open adjacent tiles are the doors.
//                  closeStep must return 'stuck', scholar unmoved, and
//                  never call tbPlayerMove with a door tile.
//   control      : scholar (4,4), monster (4,2), no doors anywhere near.
//                  Returns 'moved' onto the nearest tile (3,3). Pins the
//                  untouched path.
//   no-genDetail : stub WITHOUT genDetail (old harness/fake). closeStep
//                  must still work — returns 'moved' onto the nearest
//                  tile. Pins fail-open backward compatibility.
//   dodge-door-skip : the panel shape, through the dodge. Scholar (4,7),
//                  doors (4,6),(5,6), wall (3,6), avoid={(3,7)} (the
//                  beam lane). beastDodgeMove must move to a NON-door
//                  tile ((5,7)) and never call tbPlayerMove with a door
//                  tile. Returns 'moved'.
//   dodge-door-only : every non-door tile avoided — the only free tiles
//                  are the doors. beastDodgeMove must return 'none',
//                  scholar unmoved, never call tbPlayerMove with a door.
//
// "FAIL on unfixed code": door-skip, door-only, dodge-door-skip and
// dodge-door-only all fail — unfixed, the scholar ends on (4,6) in each.
// Verified by stashing the fix (see run note).
//
// Usage: node scripts/test-journey-landing-r145-door-approach-20261118.js [door-skip|door-only|control|no-genDetail|dodge-door-skip|dodge-door-only]
//   Default (no arg): runs all six cases, spawning children for the five
//   non-default cases (separate processes).
'use strict';
const { execFileSync } = require('child_process');
const mod = require('./policies/competent');

let fails = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails++;
}

if (typeof mod.closeStep !== 'function' || typeof mod.beastDodgeMove !== 'function') {
  console.log('FAIL closeStep/beastDodgeMove export missing — the competent policy is not present');
  process.exit(1);
}
const { closeStep, beastDodgeMove } = mod;

// The Haven hall layout (game.js, INSIDE): doors south, row 6, at (4,6)
// and (5,6); spawn at (4,4). Only the rows the stub needs are modeled.
function hallDetail() {
  const rows = [];
  for (let y = 0; y < 9; y++) rows.push(new Array(9).fill('hall'));
  rows[6] = ['wall', 'wall', 'wall', 'wall', 'door', 'door', 'wall', 'wall', 'wall'];
  rows[0] = new Array(9).fill('wall');
  rows[8] = new Array(9).fill('wall');
  return rows;
}

// Scholar starts at (sx,sy), target monster at (tx,ty). The stub's
// tbPlayerMove refuses the tiles named in `blocked` (returns false),
// moves onto any other tile. `occupied` names tiles other fighters stand
// on. `withDoors` adds genDetail with the hall layout; without it the
// stub has no genDetail at all (fail-open case). findPath returns a
// one-step path (so the r6 affordable-prefix rule keeps the full tile:
// path length 1 never exceeds moveLeft 3) — the step IS the candidate.
function stubGame(sx, sy, tx, ty, blocked, occupied, withDoors) {
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
      if ((blocked || []).indexOf(x + ',' + y) >= 0) return false;
      p.mx = x; p.my = y;
      return true;
    },
  };
  if (withDoors) Game.genDetail = (px, py) => hallDetail();
  return { Game, f, p, calls };
}

const isDoorCall = (calls) => calls.some(c => (c[0] === 4 && c[1] === 6) || (c[0] === 5 && c[1] === 6));

function runCase(which) {
  if (which === 'door-skip') {
    // Panel geometry: scholar (4,7), monster (4,5). Adjacent tiles by
    // distance from the scholar: (4,6) door d=1, (3,6) wall d=1,
    // (5,6) door d=1, (3,5)/(5,5) d=2, (3,4)/(4,4)/(5,4) d=3.
    // (3,6) is a wall (refused); the doors must be skipped.
    const { Game, f, p, calls } = stubGame(4, 7, 4, 5, ['3,6'], [], true);
    const ctx = {};
    const r = closeStep(Game, f, ctx, p, 4, 7, 4, 5);
    check('door-skip returns moved', r === 'moved', 'got ' + r);
    check('door-skip never steps on a door tile', !isDoorCall(calls), 'calls=' + JSON.stringify(calls));
    check('door-skip scholar ends off the doors', !((p.mx === 4 || p.mx === 5) && p.my === 6), 'at ' + p.mx + ',' + p.my);
    check('door-skip scholar closed on a flanking tile', (p.mx === 3 && p.my === 5) || (p.mx === 5 && p.my === 5), 'at ' + p.mx + ',' + p.my);
  } else if (which === 'door-only') {
    // Every non-door adjacent tile blocked: (3,5),(5,5),(3,4),(4,4),(5,4)
    // blocked, (3,6) wall. Only the doors (4,6),(5,6) are open — and they
    // must not be taken.
    const blocked = ['3,6', '3,5', '5,5', '3,4', '4,4', '5,4'];
    const { Game, f, p, calls } = stubGame(4, 7, 4, 5, blocked, [], true);
    const ctx = {};
    const r = closeStep(Game, f, ctx, p, 4, 7, 4, 5);
    check('door-only returns stuck', r === 'stuck', 'got ' + r);
    check('door-only scholar unmoved', p.mx === 4 && p.my === 7, 'at ' + p.mx + ',' + p.my);
    check('door-only never steps on a door tile', !isDoorCall(calls), 'calls=' + JSON.stringify(calls));
  } else if (which === 'control') {
    // No doors near: scholar (4,4), monster (4,2). Nearest adjacent tiles
    // are (3,3),(4,3),(5,3) (all dd=1); loop order tries (3,3) first.
    const { Game, f, p, calls } = stubGame(4, 4, 4, 2, [], [], true);
    const ctx = {};
    const r = closeStep(Game, f, ctx, p, 4, 4, 4, 2);
    check('control returns moved', r === 'moved', 'got ' + r);
    check('control scholar stepped onto the nearest tile', p.mx === 3 && p.my === 3, 'at ' + p.mx + ',' + p.my);
    check('control no door calls', !isDoorCall(calls), 'calls=' + JSON.stringify(calls));
  } else if (which === 'no-genDetail') {
    // Stub WITHOUT genDetail: the door check must fail open — the
    // approach behaves exactly as before (steps onto the nearest tile,
    // doors included, since the stub cannot tell it is a door).
    const { Game, f, p } = stubGame(4, 7, 4, 5, ['3,6'], [], false);
    const ctx = {};
    const r = closeStep(Game, f, ctx, p, 4, 7, 4, 5);
    check('no-genDetail returns moved (fail-open)', r === 'moved', 'got ' + r);
    check('no-genDetail scholar stepped onto the nearest open tile', p.mx === 4 && p.my === 6, 'at ' + p.mx + ',' + p.my);
  } else if (which === 'dodge-door-skip') {
    // The panel shape, through the dodge: scholar (4,7), monster (4,5),
    // doors (4,6),(5,6), wall (3,6), beam lane covering (3,7) (avoid).
    // beastDodgeMove tries the nearest free tiles first: (3,6) refused,
    // (3,7) avoided, (4,6)/(5,6) doors must be skipped, (5,7) moves.
    const { Game, f, p, calls } = stubGame(4, 7, 4, 5, ['3,6'], [[4, 5]], true);
    const r = beastDodgeMove(Game, f, p, 4, 7, new Set(['3,7']));
    check('dodge-door-skip returns moved', r === 'moved', 'got ' + r);
    check('dodge-door-skip never steps on a door tile', !isDoorCall(calls), 'calls=' + JSON.stringify(calls));
    check('dodge-door-skip scholar ends off the doors', !((p.mx === 4 || p.mx === 5) && p.my === 6), 'at ' + p.mx + ',' + p.my);
    check('dodge-door-skip scholar dodged to the open tile', p.mx === 5 && p.my === 7, 'at ' + p.mx + ',' + p.my);
  } else if (which === 'dodge-door-only') {
    // Every non-door tile avoided — the only free tiles are the doors.
    // The dodge must report 'none' (no valid tile), scholar unmoved,
    // never stepping on a door.
    const avoid = new Set();
    for (let tx = 1; tx <= 7; tx++) for (let ty = 1; ty <= 7; ty++) {
      if ((tx === 4 && ty === 7) || (tx === 4 && ty === 6) || (tx === 5 && ty === 6)) continue;
      avoid.add(tx + ',' + ty);
    }
    const { Game, f, p, calls } = stubGame(4, 7, 4, 5, ['3,6'], [[4, 5]], true);
    const r = beastDodgeMove(Game, f, p, 4, 7, avoid);
    check('dodge-door-only returns none', r === 'none', 'got ' + r);
    check('dodge-door-only scholar unmoved', p.mx === 4 && p.my === 7, 'at ' + p.mx + ',' + p.my);
    check('dodge-door-only never steps on a door tile', !isDoorCall(calls), 'calls=' + JSON.stringify(calls));
  } else {
    console.log('unknown case: ' + which);
    fails++;
  }
}

const arg = process.argv[2];
if (!arg) {
  runCase('door-skip');
  for (const c of ['door-only', 'control', 'no-genDetail', 'dodge-door-skip', 'dodge-door-only']) {
    try {
      execFileSync(process.execPath, [__filename, c], { stdio: 'inherit' });
    } catch (e) { fails++; console.log('FAIL child ' + c + ' exited non-zero'); }
  }
} else {
  runCase(arg);
}
process.exit(fails ? 1 : 0);
