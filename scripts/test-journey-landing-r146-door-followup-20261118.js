#!/usr/bin/env node
// test-journey-landing-r146-door-followup-20261118.js — proof test for the
// r146 DOOR-SKIP follow-up (journey-landing r146 2026-11-18) + the fledBad
// probe instrument (r145 metric-review items 8 and 7).
//
// The defect class (r145): stepping on a door tile in combat escapes the
// fight (game.js FLEE BY DOOR, Steve 2026-10-05 — a designed exit, not a
// move). r145 fixed it in closeStep and beastDodgeMove. The same class
// lived in three more fight-step sites, which did not fire on the r145
// panel: beastStrikeTarget (the strike-approach walk — its stepped tile
// is a findPath prefix step, which can be a door even when the destination
// is not one), the move_x2 trick pick, and the keep_distance trick pick
// (both move directly onto a beastFreeTiles candidate, which includes
// door tiles). The fix: the same shared isDoorTile helper guards all
// three. Engine check first: tbPlayerMove flees ONLY when the move ENDS
// on a door tile (game.js reads the final cell after the path walk), so
// the guard is on the tile the move ENDS on — the stepped tile in
// beastStrikeTarget (mirror of the r145 closeStep guard), the picked tile
// in move_x2 / keep_distance (the move goes straight there).
//
// The probe (r145 metric-review item 7): r145 recorded fledBad=1 with
// the firing fight unpinned. fledBadSample records the conditions at the
// single increment site (the legacy outmatched block in the competent
// fight function) into ctx.fledBadLog — day, totalMhp, maxWave, hpPct,
// pmax, monster id/hp/maxHp — so the run can NAME the fight by matching
// the census fights81 record. Record-only; no behavior change.
//
// Cases (stub Game/fight — each case runs in its own process so a case
// cannot leak state into another):
//   strike-door-step : scholar (4,7), monster (4,5), doors (4,6),(5,6),
//                  wall (3,6). The nearest adjacent tile is a door; the
//                  route to (3,5) crosses the door (4,6) as its first
//                  step. beastStrikeTarget must end on a NON-door tile
//                  ((3,5)) and never call tbPlayerMove with a door tile.
//                  Returns 'moved'.
//   strike-door-only : every non-door adjacent tile blocked — the only
//                  open adjacent tiles are the doors. beastStrikeTarget
//                  must return 'stuck', scholar unmoved, never call
//                  tbPlayerMove with a door tile.
//   strike-control   : scholar (4,4), monster (4,2), no doors near.
//                  Returns 'moved' onto the nearest tile (3,3). Pins the
//                  untouched path.
//   strike-no-genDetail : stub WITHOUT genDetail (old harness/fake).
//                  beastStrikeTarget must still work — returns 'moved'
//                  onto the nearest tile (4,6). Pins fail-open backward
//                  compatibility.
//   movex2-pick      : move_x2 trick (review_drone, tiles 1), scholar
//                  (4,7), monster (4,5), moveLeft 1. The trick must fire
//                  onto a non-door tile ((3,7)) and count beastTricks=1.
//                  Pins the untouched trick path.
//   movex2-door-only : move_x2 with (3,7)/(5,7) unwalkable and (3,6) a
//                  wall — the only affordable picks are the doors.
//                  beastTrickPlay must move nowhere, count no trick, and
//                  never call tbPlayerMove with a door tile.
//   keepdist-door-skip : keep_distance trick (tiles 1), scholar (4,7),
//                  monster (4,5), (3,4)/(3,5)/(3,6) unwalkable, moveLeft
//                  2. The first affordable pick is the door (4,6) —
//                  (4,4) costs 3, over budget; it must be skipped and the
//                  trick must end on (5,5) — the route (5,6)->(5,5) is 2
//                  steps, inside the budget — never calling tbPlayerMove
//                  with a door tile.
//   keepdist-pick    : keep_distance positive control — scholar (4,7),
//                  monster (4,5), only (3,6) a wall. The trick must end
//                  on (3,4). Pins the untouched trick path.
//   fledbad-sample   : fledBadSample records one full entry (day,
//                  totalMhp, maxWave, hpPct, pmax, monster id/hp/maxHp).
//   fledbad-append   : a second sample appends; the log grows to 2 with
//                  the second day.
//   fledbad-noday    : a Game without state records day null and does not
//                  throw. Pins fail-open.
//
// "FAIL on unfixed code": strike-door-step, strike-door-only,
// movex2-door-only and keepdist-door-skip all fail — unfixed, the scholar
// ends on (4,6) in each (verified by stashing the fix; see run note).
// fledbad-* fail if the helper is absent or records the wrong shape.
//
// Usage: node scripts/test-journey-landing-r146-door-followup-20261118.js [case]
//   Default (no arg): runs strike-door-step, spawning children for the
//   other cases (separate processes).
'use strict';
const { execFileSync } = require('child_process');
const mod = require('./policies/competent');

let fails = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails++;
}

if (typeof mod.beastStrikeTarget !== 'function' || typeof mod.beastTrickPlay !== 'function' ||
    typeof mod.fledBadSample !== 'function') {
  console.log('FAIL beastStrikeTarget/beastTrickPlay/fledBadSample export missing — the competent policy is not present');
  process.exit(1);
}
const { beastStrikeTarget, beastTrickPlay, fledBadSample } = mod;

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

// BFS findPath over interior tiles 1..7 (8-directional, cost 1/step).
// `blocked` is a Set of 'x,y' unwalkable tiles (walls + extras); doors
// are walkable (the engine's findPath routes through them — that is the
// premise of the r145 closeStep fix). Occupied tiles are not traversed.
// Returns the step list (excluding the start, including the destination),
// or [] when the destination is unreachable.
function bfsPath(sx, sy, tx, ty, blocked, occupied) {
  if (blocked.has(tx + ',' + ty) || occupied.has(tx + ',' + ty)) return [];
  const prev = new Map();
  const seen = new Set([sx + ',' + sy]);
  const q = [[sx, sy]];
  while (q.length) {
    const [x, y] = q.shift();
    if (x === tx && y === ty) break;
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      if (!dx && !dy) continue;
      const nx = x + dx, ny = y + dy;
      if (nx < 1 || nx > 7 || ny < 1 || ny > 7) continue;
      const k = nx + ',' + ny;
      if (seen.has(k) || blocked.has(k) || occupied.has(k)) continue;
      seen.add(k); prev.set(k, [x, y]); q.push([nx, ny]);
    }
  }
  if (!seen.has(tx + ',' + ty)) return [];
  const path = [];
  let cur = [tx, ty];
  while (!(cur[0] === sx && cur[1] === sy)) { path.unshift(cur); cur = prev.get(cur[0] + ',' + cur[1]); }
  return path;
}

// Scholar at (sx,sy), monster at (tx,ty) with the given monster id and
// counter def. `blocked` names tiles tbPlayerMove refuses AND the BFS
// treats as unwalkable. `occupied` names tiles other fighters stand on.
// `withDoors` adds genDetail with the hall layout; without it the stub
// has no genDetail at all (fail-open case). moveLeft sets the scholar's
// movement budget for the turn.
function stubGame(sx, sy, tx, ty, mid, counter, blocked, occupied, withDoors, moveLeft) {
  const p = { key: 'p', mx: sx, my: sy, moveLeft: (moveLeft != null ? moveLeft : 3), hp: 100, maxHp: 100, alive: true };
  const m = { key: 'm_0', kind: 'monster', monsterId: mid, hp: 168, maxHp: 168, alive: true, mx: tx, my: ty };
  const fighters = [p, m];
  for (const o of (occupied || [])) fighters.push({ key: 'm_' + o, mx: o[0], my: o[1], alive: true });
  const f = { id: 'fight1', round: 1, over: false, fighters: fighters };
  const calls = [];
  const blockedSet = new Set(blocked || []);
  const occupiedSet = new Set(fighters.filter(x => x.key !== 'p').map(x => x.mx + ',' + x.my));
  const Game = {
    map: { px: 4, py: 4 },
    state: { scholar: { day: 9 }, monsterCounters: {}, codex: { monsters: {} } },
    data: { monsters: [{ id: mid, wave: 1, counter: counter }] },
    tbfight: f,
    tbIsPlayerTurn: () => true,
    findPath: (x0, y0, x1, y1) => bfsPath(x0, y0, x1, y1, blockedSet, occupiedSet),
    tbTerrainCost: () => 1,
    tbPlayerMove: (x, y) => {
      calls.push([x, y]);
      if (blockedSet.has(x + ',' + y)) return false;
      p.mx = x; p.my = y;
      return true;
    },
    tbPlayerStrike: (k) => { calls.push(['strike', k]); return true; },
    equippedWeapon: () => ({ range: 1 }),
  };
  Game.state.monsterCounters[mid] = true; // trick known: the policy may use it
  if (withDoors) Game.genDetail = (px, py) => hallDetail();
  return { Game, f, p, m, calls };
}

const isDoorCall = (calls) => calls.some(c => (c[0] === 4 && c[1] === 6) || (c[0] === 5 && c[1] === 6));
const endTurnStub = () => {};

function runCase(which) {
  if (which === 'strike-door-step') {
    // Panel geometry: scholar (4,7), monster (4,5). Adjacent tiles by
    // distance from the scholar: (4,6) door d=1, (3,6) wall d=1,
    // (5,6) door d=1, (3,5)/(5,5) d=2, (3,4)/(4,4)/(5,4) d=3.
    // (3,6) is a wall (refused); the doors must be skipped; the route
    // to (3,5) crosses (4,6) as its first step but ENDS on (3,5).
    const { Game, f, p, m, calls } = stubGame(4, 7, 4, 5, 'gallowdeer', null, ['3,6'], [], true, 3);
    const ctx = {};
    const r = beastStrikeTarget(Game, f, ctx, p, 4, 7, m, endTurnStub);
    check('strike-door-step returns moved', r === 'moved', 'got ' + r);
    check('strike-door-step never steps on a door tile', !isDoorCall(calls), 'calls=' + JSON.stringify(calls));
    check('strike-door-step scholar ends off the doors', !((p.mx === 4 || p.mx === 5) && p.my === 6), 'at ' + p.mx + ',' + p.my);
    check('strike-door-step scholar closed on the flanking tile', p.mx === 3 && p.my === 5, 'at ' + p.mx + ',' + p.my);
  } else if (which === 'strike-door-only') {
    // Every non-door adjacent tile blocked: (3,5),(5,5),(3,4),(4,4),(5,4)
    // blocked, (3,6) wall. Only the doors (4,6),(5,6) are open — and they
    // must not be taken.
    const blocked = ['3,6', '3,5', '5,5', '3,4', '4,4', '5,4'];
    const { Game, f, p, m, calls } = stubGame(4, 7, 4, 5, 'gallowdeer', null, blocked, [], true, 3);
    const ctx = {};
    const r = beastStrikeTarget(Game, f, ctx, p, 4, 7, m, endTurnStub);
    check('strike-door-only returns stuck', r === 'stuck', 'got ' + r);
    check('strike-door-only scholar unmoved', p.mx === 4 && p.my === 7, 'at ' + p.mx + ',' + p.my);
    check('strike-door-only never steps on a door tile', !isDoorCall(calls), 'calls=' + JSON.stringify(calls));
    check('strike-door-only records the stuck turn', ctx.stuckTurns === 1, 'stuckTurns=' + ctx.stuckTurns);
  } else if (which === 'strike-control') {
    // No doors near: scholar (4,4), monster (4,2). Nearest adjacent tiles
    // are (3,3),(4,3),(5,3) (all dd=1); loop order tries (3,3) first.
    const { Game, f, p, m, calls } = stubGame(4, 4, 4, 2, 'gallowdeer', null, [], [], true, 3);
    const ctx = {};
    const r = beastStrikeTarget(Game, f, ctx, p, 4, 4, m, endTurnStub);
    check('strike-control returns moved', r === 'moved', 'got ' + r);
    check('strike-control scholar stepped onto the nearest tile', p.mx === 3 && p.my === 3, 'at ' + p.mx + ',' + p.my);
    check('strike-control no door calls', !isDoorCall(calls), 'calls=' + JSON.stringify(calls));
  } else if (which === 'strike-no-genDetail') {
    // Stub WITHOUT genDetail: the door check must fail open — the
    // approach behaves exactly as before (steps onto the nearest tile,
    // doors included, since the stub cannot tell it is a door).
    const { Game, f, p, m } = stubGame(4, 7, 4, 5, 'gallowdeer', null, ['3,6'], [], false, 3);
    const ctx = {};
    const r = beastStrikeTarget(Game, f, ctx, p, 4, 7, m, endTurnStub);
    check('strike-no-genDetail returns moved (fail-open)', r === 'moved', 'got ' + r);
    check('strike-no-genDetail scholar stepped onto the nearest open tile', p.mx === 4 && p.my === 6, 'at ' + p.mx + ',' + p.my);
  } else if (which === 'movex2-pick') {
    // move_x2 positive control: review_drone, tiles 1, scholar (4,7),
    // monster (4,5), moveLeft 1. Only adjacent tiles are affordable;
    // farthest-first picks (3,7). The trick must fire and count.
    const { Game, f, p, m, calls } = stubGame(4, 7, 4, 5, 'review_drone', { kind: 'move_x2', tiles: 1 }, ['3,6'], [], true, 1);
    const ctx = {};
    const r = beastTrickPlay(Game, f, ctx, p, endTurnStub);
    check('movex2-pick trick fires', r === true, 'got ' + r);
    check('movex2-pick scholar dodged to the far tile', p.mx === 3 && p.my === 7, 'at ' + p.mx + ',' + p.my);
    check('movex2-pick no door calls', !isDoorCall(calls), 'calls=' + JSON.stringify(calls));
    check('movex2-pick trick counted', ctx.beastTricks === 1, 'beastTricks=' + ctx.beastTricks);
  } else if (which === 'movex2-door-only') {
    // move_x2 with (3,7)/(5,7) unwalkable and (3,6) a wall — with
    // moveLeft 1 the only affordable picks are the doors (4,6),(5,6).
    // The trick must not fire, the scholar must not move, and no door
    // tile may be stepped on.
    const { Game, f, p, m, calls } = stubGame(4, 7, 4, 5, 'review_drone', { kind: 'move_x2', tiles: 1 }, ['3,6', '3,7', '5,7'], [], true, 1);
    const ctx = {};
    const r = beastTrickPlay(Game, f, ctx, p, endTurnStub);
    check('movex2-door-only trick does not fire', r !== true, 'got ' + r);
    check('movex2-door-only scholar unmoved', p.mx === 4 && p.my === 7, 'at ' + p.mx + ',' + p.my);
    check('movex2-door-only never steps on a door tile', !isDoorCall(calls), 'calls=' + JSON.stringify(calls));
    check('movex2-door-only trick not counted', !ctx.beastTricks, 'beastTricks=' + ctx.beastTricks);
  } else if (which === 'keepdist-door-skip') {
    // keep_distance (tiles 1), scholar (4,7), monster (4,5),
    // (3,4)/(3,5)/(3,6) unwalkable. The first affordable pick is the
    // door (4,6); it must be skipped and the trick must end on (5,4).
    const { Game, f, p, m, calls } = stubGame(4, 7, 4, 5, 'bright_idea', { kind: 'keep_distance', tiles: 1 }, ['3,4', '3,5', '3,6'], [], true, 2);
    const ctx = {};
    const r = beastTrickPlay(Game, f, ctx, p, endTurnStub);
    check('keepdist-door-skip trick fires', r === true, 'got ' + r);
    check('keepdist-door-skip scholar ends off the doors', !((p.mx === 4 || p.mx === 5) && p.my === 6), 'at ' + p.mx + ',' + p.my);
    check('keepdist-door-skip scholar kept distance on the open tile', p.mx === 5 && p.my === 5, 'at ' + p.mx + ',' + p.my);
    check('keepdist-door-skip never steps on a door tile', !isDoorCall(calls), 'calls=' + JSON.stringify(calls));
    check('keepdist-door-skip trick counted', ctx.beastTricks === 1, 'beastTricks=' + ctx.beastTricks);
  } else if (which === 'keepdist-pick') {
    // keep_distance positive control: scholar (4,7), monster (4,5),
    // only (3,6) a wall. The nearest exactly-1-out tile is (3,4); the
    // trick must end there. Pins the untouched trick path.
    const { Game, f, p, m, calls } = stubGame(4, 7, 4, 5, 'bright_idea', { kind: 'keep_distance', tiles: 1 }, ['3,6'], [], true, 3);
    const ctx = {};
    const r = beastTrickPlay(Game, f, ctx, p, endTurnStub);
    check('keepdist-pick trick fires', r === true, 'got ' + r);
    check('keepdist-pick scholar kept distance on the nearest tile', p.mx === 3 && p.my === 4, 'at ' + p.mx + ',' + p.my);
    check('keepdist-pick no door calls', !isDoorCall(calls), 'calls=' + JSON.stringify(calls));
    check('keepdist-pick trick counted', ctx.beastTricks === 1, 'beastTricks=' + ctx.beastTricks);
  } else if (which === 'fledbad-sample') {
    // The probe records one full entry at the increment site.
    const ctx = {};
    const Game = { state: { scholar: { day: 9 } } };
    const monsters = [{ monsterId: 'gallowdeer', hp: 145, maxHp: 168 }];
    fledBadSample(ctx, Game, monsters, 168, 1, 0.95, 100);
    const log = ctx.fledBadLog || [];
    check('fledbad-sample records one entry', log.length === 1, 'len=' + log.length);
    const e = log[0] || {};
    check('fledbad-sample day', e.day === 9, 'day=' + e.day);
    check('fledbad-sample totalMhp', e.totalMhp === 168, 'totalMhp=' + e.totalMhp);
    check('fledbad-sample maxWave', e.maxWave === 1, 'maxWave=' + e.maxWave);
    check('fledbad-sample hpPct', e.hpPct === 0.95, 'hpPct=' + e.hpPct);
    check('fledbad-sample pmax', e.pmax === 100, 'pmax=' + e.pmax);
    check('fledbad-sample monster', Array.isArray(e.mons) && e.mons.length === 1 &&
      e.mons[0].id === 'gallowdeer' && e.mons[0].hp === 145 && e.mons[0].maxHp === 168,
      'mons=' + JSON.stringify(e.mons));
  } else if (which === 'fledbad-append') {
    // A second sample appends; the log grows to 2 with the second day.
    const ctx = {};
    fledBadSample(ctx, { state: { scholar: { day: 9 } } },
      [{ monsterId: 'gallowdeer', hp: 145, maxHp: 168 }], 168, 1, 0.95, 100);
    fledBadSample(ctx, { state: { scholar: { day: 12 } } },
      [{ monsterId: 'hummice', hp: 60, maxHp: 60 }, { monsterId: 'hummice', hp: 60, maxHp: 60 }], 120, 1, 0.4, 100);
    const log = ctx.fledBadLog || [];
    check('fledbad-append log grows to 2', log.length === 2, 'len=' + log.length);
    check('fledbad-append second day', log[1] && log[1].day === 12, 'day=' + (log[1] && log[1].day));
    check('fledbad-append second monsters', log[1] && log[1].mons && log[1].mons.length === 2 &&
      log[1].mons[0].id === 'hummice', 'mons=' + JSON.stringify(log[1] && log[1].mons));
    check('fledbad-append first entry intact', log[0] && log[0].day === 9, 'day=' + (log[0] && log[0].day));
  } else if (which === 'fledbad-noday') {
    // A Game without state records day null and does not throw.
    const ctx = {};
    let threw = false;
    try {
      fledBadSample(ctx, {}, [{ monsterId: 'gallowdeer', hp: 168, maxHp: 168 }], 168, 1, 1, 100);
    } catch (e) { threw = true; }
    const log = ctx.fledBadLog || [];
    check('fledbad-noday does not throw', !threw, '');
    check('fledbad-noday records one entry', log.length === 1, 'len=' + log.length);
    check('fledbad-noday day is null', log[0] && log[0].day === null, 'day=' + (log[0] && log[0].day));
  } else {
    console.log('unknown case: ' + which);
    fails++;
  }
}

const arg = process.argv[2];
if (!arg) {
  runCase('strike-door-step');
  for (const c of ['strike-door-only', 'strike-control', 'strike-no-genDetail',
    'movex2-pick', 'movex2-door-only', 'keepdist-door-skip', 'keepdist-pick',
    'fledbad-sample', 'fledbad-append', 'fledbad-noday']) {
    try {
      execFileSync(process.execPath, [__filename, c], { stdio: 'inherit' });
    } catch (e) { fails++; console.log('FAIL child ' + c + ' exited non-zero'); }
  }
} else {
  runCase(arg);
}
process.exit(fails ? 1 : 0);
