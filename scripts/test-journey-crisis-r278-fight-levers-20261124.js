#!/usr/bin/env node
'use strict';
// Proof: the three r274-residual FIGHT-STALL levers (journey-crisis r278).
//
// THE QUESTION (r274 run note): the after-panel cleared the wild-field
// stalls (9 -> 2) but three stall days remained, each a different
// mechanism with a named lever:
//   (1) SEALED POCKET (seed 14600 d78): player (3,3), monster `spool`
//       adjacent (distance 1, in range), every edge path null; the policy
//       flees on low HP before considering the strike.
//   (2) SEALED ARENA (seed 14601 d100): player (1,0), arenaContest true
//       — the barrier holds, the fight cannot end by leaving; the flee
//       fires 11x, moves to the edge fine, the barrier exit is consumed
//       but the fight does NOT end — and the close attempt fails 13x
//       ("No path there." — the first-choice adjacent tile is unpathable).
//   (3) NO AFFORDABLE EDGE (seed 14603 d127, fresh): player (7,4)
//       moveLeft 1, cheapest edge costs 4 — every turn the flee falls
//       back to the old target and fails honestly in place.
//
// GREEN: (1) with a monster in range and no affordable edge, the flee is
// blocked (fledBlocked_neardeath) and the policy STRIKES the adjacent
// monster instead; (2) in a sealed arena the flee never fires
// (fled_unreachable 0) and the policy closes instead — trying the
// target's other adjacent tiles and stepping partway along the first
// reachable path (altCloses 1, player moved); (3) with no affordable
// edge the flee walks partway along the cheapest edge's path (player
// moves one step toward the south edge) instead of failing in place
// against the old target.
//
// Staging mirrors test-journey-crisis-r274-nearest-edge-20261123.js. The
// movement contract is stubbed faithfully (findPath + tbTerrainCost +
// moveLeft, as the real tbPlayerMove decides it); the strike is stubbed
// to record its target (strike mechanics are the game's, covered by
// combat tests — this proves the POLICY routes to the strike).
// Exits nonzero on failure.
const assert = require('assert');
const K = require('./godpath/lib');
const { oracleV2 } = require('./policies/oracleV2');

let pass = 0, fail = 0;
function check(name, condition, extra) {
  if (!condition) {
    fail++;
    console.log('  FAIL ' + name + (extra ? ' :: ' + extra : ''));
    return;
  }
  pass++;
  console.log('  ok ' + name);
}

function mockFight(Game, playerXY, monsterXY, monsterHp, playerHp) {
  const mdef = (Game.data.monsters || []).find(d => d && d.wave === 1) || {};
  const mid = mdef.id || 'deer';
  const fighters = [
    { key: 'p', kind: 'player', mx: playerXY[0], my: playerXY[1], hp: playerHp == null ? 100 : playerHp, maxHp: 100, alive: true, moveLeft: 1, acted: false },
    { key: 'm_0', kind: 'monster', monsterId: mid, mdef, mx: monsterXY[0], my: monsterXY[1], hp: monsterHp || 20, alive: true, moveLeft: 3, acted: false, speed: 2 },
  ];
  Game.tbfight = { id: 9003, over: false, round: 1, fighters, order: ['p', 'm_0'], turnIdx: 0 };
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
  const realStrike = Game.tbPlayerStrike ? Game.tbPlayerStrike.bind(Game) : null;
  const realWeapon = Game.equippedWeapon ? Game.equippedWeapon.bind(Game) : null;

  const moveTargets = []; // every tbPlayerMove target, in order
  const barrierCalls = [];
  const strikeTargets = [];
  let failedMoves = 0;
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
  Game.tbPlayerStrike = (key) => { strikeTargets.push(key); return true; };
  Game.equippedWeapon = () => ({ range: 1, bonus: 0 });

  // ---- 1. SEALED POCKET: strike instead of fleeing. ----
  // Player (4,4) hp 20/100 (neardeath), monster adjacent (4,5), every
  // edge path null (the sealed pocket). The old policy flees on low HP
  // before considering the strike — and the flee cannot disengage.
  {
    const ctx = {};
    moveTargets.length = 0; barrierCalls.length = 0; strikeTargets.length = 0; failedMoves = 0;
    Game.findPath = () => null; // sealed pocket: no path anywhere
    mockFight(Game, [4, 4], [4, 5], 20, 20);
    freshTurn(Game);
    oracleV2.fight(Game, ctx);
    check('pocket: the neardeath flee never fires', !ctx.fled_neardeath,
      'fled_neardeath=' + ctx.fled_neardeath);
    check('pocket: no flee fires at all', !ctx.fled, 'fled=' + ctx.fled);
    check('pocket: the block is recorded (pocket seal)', (ctx.fledBlocked_neardeath || 0) >= 1,
      'fledBlocked_neardeath=' + ctx.fledBlocked_neardeath);
    check('pocket: the policy strikes the adjacent monster',
      ctx.struck === 1 && strikeTargets[0] === 'm_0',
      'struck=' + ctx.struck + ' strikeTargets=' + JSON.stringify(strikeTargets));
    check('pocket: no move is attempted (the strike is in place)',
      moveTargets.length === 0, 'moves=' + JSON.stringify(moveTargets));
  }

  // ---- 2. SEALED ARENA: no flee; close instead (alt-close). ----
  // Player (4,7), monster (3,4) across unpathable ground, arenaContest
  // live. The first-choice adjacent tile (2,5) is unpathable, but (3,5)
  // is reachable in 3 steps — with moveLeft 1 the policy steps partway
  // to (4,6) instead of burning the turn on the barrier.
  {
    const ctx = {};
    moveTargets.length = 0; barrierCalls.length = 0; strikeTargets.length = 0; failedMoves = 0;
    Game.findPath = (sx, sy, tx, ty) => {
      if (tx === 3 && ty === 5) return [[4, 6], [3, 6], [3, 5]];
      if (tx === 4 && ty === 6) return [[4, 6]];
      return null;
    };
    Game.state.arenaContest = { contestId: 'test-arena' };
    try {
      for (let t = 1; t <= 3; t++) {
        mockFight(Game, [4, 7], [3, 4], 20); // same monster + day: stable key
        freshTurn(Game);
        oracleV2.fight(Game, ctx);
      }
    } finally {
      delete Game.state.arenaContest;
    }
    check('arena: the unreachable flee never fires', !ctx.fled_unreachable,
      'fled_unreachable=' + ctx.fled_unreachable);
    check('arena: the block is recorded (arena seal)', (ctx.fledBlocked_unreachable || 0) >= 1,
      'fledBlocked_unreachable=' + ctx.fledBlocked_unreachable);
    check('arena: the alt-close fires once', ctx.altCloses === 1,
      'altCloses=' + ctx.altCloses);
    const p = Game.tbFighter('p');
    check('arena: the player stepped partway toward the monster (4,6)',
      p && p.mx === 4 && p.my === 6, 'player=' + (p ? p.mx + ',' + p.my : null));
    check('arena: the barrier exit was never attempted (no flee)',
      barrierCalls.length === 0, 'barrier=' + JSON.stringify(barrierCalls));
  }

  // ---- 3. NO AFFORDABLE EDGE: partial-progress flee. ----
  // Player (7,4) hp 20/100 (neardeath), monster (4,5) out of range,
  // cheapest edge south (7,8) costs 4, moveLeft 1. The old flee falls
  // back to the old target (8,4) and fails in place; the fix walks one
  // step toward the south edge instead.
  {
    const ctx = {};
    moveTargets.length = 0; barrierCalls.length = 0; strikeTargets.length = 0; failedMoves = 0;
    Game.findPath = (sx, sy, tx, ty) => {
      if (tx === 7 && ty === 8) return [[7, 5], [7, 6], [7, 7], [7, 8]];
      if (tx === 7 && ty === 5) return [[7, 5]];
      return null;
    };
    mockFight(Game, [7, 4], [4, 5], 61, 20);
    freshTurn(Game);
    oracleV2.fight(Game, ctx);
    check('partial: the neardeath flee fires (disengage is possible, just far)',
      ctx.fled_neardeath === 1, 'fled_neardeath=' + ctx.fled_neardeath);
    check('partial: the flee steps toward the cheapest edge (7,5)',
      moveTargets.some(([x, y]) => x === 7 && y === 5),
      'moves=' + JSON.stringify(moveTargets));
    check('partial: the flee never aims at the old target (8,4)',
      !moveTargets.some(([x, y]) => x === 8 && y === 4),
      'moves=' + JSON.stringify(moveTargets));
    const p = Game.tbFighter('p');
    check('partial: the player actually moved to (7,5)',
      p && p.mx === 7 && p.my === 5, 'player=' + (p ? p.mx + ',' + p.my : null));
    check('partial: the step cost exactly the 1 moveLeft',
      p && p.moveLeft === 0, 'moveLeft=' + (p ? p.moveLeft : null));
  }

  Game.tbPlayerMove = realMove;
  Game.tbAfterPlayerAction = realAfter;
  Game.tbBarrierExit = realBarrier;
  if (realFindPath) Game.findPath = realFindPath;
  if (realTerrainCost) Game.tbTerrainCost = realTerrainCost;
  if (realStrike) Game.tbPlayerStrike = realStrike;
  if (realWeapon) Game.equippedWeapon = realWeapon;
  Game.tbfight = null;
  console.log(`\nRESULT: ${pass} pass, ${fail} fail`);
  if (fail) process.exitCode = 1;
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
