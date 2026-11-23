#!/usr/bin/env node
'use strict';
// Proof: the unreachable flee aims at the NEAREST AFFORDABLE edge tile
// (journey-crisis r274, FIX 2 for the r264 FIGHT-STALL NO-GO).
//
// THE QUESTION (r264 run note + r274 probe, seed 14601): the flee fired
// 117 times in a day without the fight closing. The probe names the cause:
// the old flee aimed at the west/east edge at the current row (0,py) /
// (8,py), and the move failed on COST — "Too far" on 236/237 calls on
// d26/d144 — because a slowed fighter (moveLeft 1-3) cannot afford a
// 4-5 step path while a 1-step edge sits open (d26 south 1 step, d103
// south 1 step, d144 north 1 step). FIX 2 picks the cheapest edge tile
// whose path COST (tbTerrainCost summed over the found path) fits this
// turn's moveLeft, over all four edges.
//
// GREEN: after 3 stuck turns the flee fires and its move targets the
// 1-step south edge (4,8) — not the 4-step west edge (0,7) — the move
// succeeds, and the barrier exit is attempted with the player on the
// edge (the fight disengages). When NO edge tile is affordable, the flee
// falls back to the old target and fails honestly (the stall is still
// reported, not hidden).
//
// Staging mirrors test-journey-crisis-r264-stucktrace-20261122.js. The
// movement contract is stubbed faithfully (findPath + tbTerrainCost +
// moveLeft, as the real tbPlayerMove decides it); the test proves the
// TARGETING decision — which tile the flee picks. Exits nonzero on
// failure.
const assert = require('assert');
const K = require('./godpath/lib');
const { oracleV2 } = require('./policies/oracleV2');

let pass = 0;
function check(name, condition, extra) {
  assert(condition, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

function mockFight(Game, playerXY, monsterXY, monsterHp) {
  const mdef = (Game.data.monsters || []).find(d => d && d.wave === 1) || {};
  const mid = mdef.id || 'deer';
  const fighters = [
    { key: 'p', kind: 'player', mx: playerXY[0], my: playerXY[1], hp: 100, maxHp: 100, alive: true, moveLeft: 1, acted: false },
    { key: 'm_0', kind: 'monster', monsterId: mid, mdef, mx: monsterXY[0], my: monsterXY[1], hp: monsterHp || 20, alive: true, moveLeft: 3, acted: false, speed: 2 },
  ];
  Game.tbfight = { id: 9002, over: false, round: 1, fighters, order: ['p', 'm_0'], turnIdx: 0 };
  return Game.tbfight;
}

function freshTurn(Game) {
  const p = Game.tbFighter('p');
  if (p) { p.moveLeft = 1; p.acted = false; } // the slowed fighter: 1 move/turn
  const f = Game.tbfight;
  if (f) f.turnIdx = 0;
}

async function main() {
  const Game = await K.load({ seed: parseInt(process.env.SEED || '4242', 10) });
  K.newRun(Game);
  const realMove = Game.tbPlayerMove.bind(Game);
  const realAfter = Game.tbAfterPlayerAction ? Game.tbAfterPlayerAction.bind(Game) : null;
  const realBarrier = Game.tbBarrierExit ? Game.tbBarrierExit.bind(Game) : null;
  const realFindPath = Game.findPath ? Game.findPath.bind(Game) : null;
  const realTerrainCost = Game.tbTerrainCost ? Game.tbTerrainCost.bind(Game) : null;

  const moveTargets = []; // every tbPlayerMove target, in order
  const barrierCalls = []; // every tbBarrierExit call {dx, dy, onEdge}
  let failedMoves = 0;
  // Probe geometry (seed 14601 d26): monster across unpathable ground,
  // south edge 1 step away, west edge 4 steps away. findPath answers
  // exactly that; tbTerrainCost is flat 1 so cost == steps.
  Game.findPath = (sx, sy, tx, ty) => {
    if (tx === 4 && ty === 8) return [[4, 8]];
    if (tx === 0 && ty === 7) return [[3, 7], [2, 7], [1, 7], [0, 7]];
    return null;
  };
  Game.tbTerrainCost = () => 1;
  // Faithful tbPlayerMove contract: no path -> false; cost over moveLeft
  // ("Too far") -> false; else walk the path, deduct, true.
  Game.tbPlayerMove = (cx, cy) => {
    moveTargets.push([cx, cy]);
    const p = Game.tbFighter('p');
    if (!p || p.moveLeft <= 0) { failedMoves++; return false; }
    const path = Game.findPath(p.mx, p.my, cx, cy);
    if (!path || !path.length) { failedMoves++; return false; }
    let cost = 0;
    for (const [tx, ty] of path) cost += Game.tbTerrainCost(tx, ty);
    if (cost > p.moveLeft) { failedMoves++; return false; }
    for (const [tx, ty] of path) { p.moveLeft -= Game.tbTerrainCost(tx, ty); p.mx = tx; p.my = ty; }
    return true;
  };
  Game.tbAfterPlayerAction = () => {};
  Game.tbBarrierExit = (dx, dy) => {
    const p = Game.tbFighter('p');
    const onEdge = !!p && ((dx < 0 && p.mx === 0) || (dx > 0 && p.mx === 8) || (dy < 0 && p.my === 0) || (dy > 0 && p.my === 8));
    barrierCalls.push({ dx, dy, onEdge, at: [p ? p.mx : null, p ? p.my : null] });
    return onEdge;
  };

  // ---- 1. THE FLEE AIMS AT THE 1-STEP EDGE, NOT THE 4-STEP ONE. ----
  {
    const ctx = {};
    moveTargets.length = 0; barrierCalls.length = 0; failedMoves = 0;
    for (let t = 1; t <= 3; t++) {
      mockFight(Game, [4, 7], [3, 4], 20); // same monster + day: stable key
      freshTurn(Game);
      oracleV2.fight(Game, ctx);
    }
    check('flee fires once after 3 stuck turns', ctx.fled_unreachable === 1,
      'fled_unreachable=' + ctx.fled_unreachable);
    const fleeMove = moveTargets[moveTargets.length - 1];
    check('the flee move targets the 1-step south edge (4,8)',
      fleeMove && fleeMove[0] === 4 && fleeMove[1] === 8,
      'last move=' + JSON.stringify(fleeMove) + ' all=' + JSON.stringify(moveTargets));
    check('the flee move never aimed at the 4-step west edge (0,7)',
      !moveTargets.some(([x, y]) => x === 0 && y === 7),
      'targets=' + JSON.stringify(moveTargets));
    check('the barrier exit was attempted with the player on the edge',
      barrierCalls.some(c => c.onEdge && c.at[0] === 4 && c.at[1] === 8),
      'barrier=' + JSON.stringify(barrierCalls));
    check('at most 4 failed moves across the 3 stuck turns (3 closes + 0)',
      failedMoves <= 4, 'failedMoves=' + failedMoves);
  }

  // ---- 2. NO AFFORDABLE EDGE: the flee falls back and fails honestly. ----
  {
    const ctx = {};
    Game.findPath = () => null; // every edge unreachable this time
    moveTargets.length = 0; barrierCalls.length = 0; failedMoves = 0;
    for (let t = 1; t <= 3; t++) {
      mockFight(Game, [4, 7], [3, 4], 20);
      freshTurn(Game);
      oracleV2.fight(Game, ctx);
    }
    check('fallback: the flee still fires after 3 stuck turns', ctx.fled_unreachable === 1,
      'fled_unreachable=' + ctx.fled_unreachable);
    check('fallback: the flee aims at the old west-edge target (0,7)',
      moveTargets.some(([x, y]) => x === 0 && y === 7),
      'targets=' + JSON.stringify(moveTargets));
    check('fallback: the barrier exit is never reached (player never on an edge)',
      !barrierCalls.some(c => c.onEdge),
      'barrier=' + JSON.stringify(barrierCalls));
  }

  Game.tbPlayerMove = realMove;
  Game.tbAfterPlayerAction = realAfter;
  Game.tbBarrierExit = realBarrier;
  if (realFindPath) Game.findPath = realFindPath;
  if (realTerrainCost) Game.tbTerrainCost = realTerrainCost;
  Game.tbfight = null;
  console.log(`\nRESULT: ${pass} pass, 0 fail`);
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
