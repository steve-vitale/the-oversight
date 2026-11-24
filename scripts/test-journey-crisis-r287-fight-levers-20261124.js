#!/usr/bin/env node
'use strict';
// Proof: the r278-residual FIGHT-STALL levers (journey-crisis r287).
//
// THE QUESTION (r278 run note, all six stall days read in full): the r278
// fixes cleared the named residual days (14600 d78, 14601 d100: 0 failed
// calls) but the stall count moved 2->3/4 via NEW days, two mechanisms:
//   (A) ALREADY ON THE EDGE (14600 d43, 14601 d52, 14603 d83, 14606 d108):
//       player ON an edge tile ((0,1)/(3,0)/(0,4)/(2,8)), moveLeft 0
//       (d43/d52/d83) or 3 (d108), monster far. The flee's cheapest path
//       is length 1 (the tile it stands on), so FIX 3's partial-progress
//       branch never engages and the flee falls to the old target — its
//       own tile — failing 236/236/30/235 times. Root cause (d43
//       sayLines): the opening pushThrough DOES fire and FAILS ("You hurl
//       yourself at the barrier — no escape that way", travelTo blockage
//       on the far side) and the flee then burns the turn pathing to its
//       own tile. The spool replays WAITs and holds still; the fight
//       dissolves at the day boundary, the scholar survives, the day is
//       burned.
//   (B) SEALED POCKET, MONSTER OUT OF RANGE (14600 d73, 14606 d104):
//       all edge paths null; player (4,7) moveLeft 3; monster 2 away —
//       outside weapon range 1, so FIX 1's pocket gate never engages;
//       the close path findPath returns null, 22/11 fails. No working
//       action: wait for the monster to close.
//
// GREEN: (A) after a failed edge push the flee NEVER paths to the player's
// own tile — with no movement left it WAITS (recorded, never counted as a
// flee); with movement it steps to a DIFFERENT edge tile whose outward
// world direction is crossable and tries that push. (B) once the close
// AND the flee have both failed at unchanged geometry, the policy WAITS
// instead of re-attempting — and retries the close only when the monster
// (or the player) has moved. Failed tbPlayerMove calls per stall fight
// drop to the probe count (4), far below the >=10/day bar.
//
// Staging mirrors test-journey-crisis-r278-fight-levers-20261124.js. The
// movement contract is stubbed faithfully (findPath + tbTerrainCost +
// moveLeft, as the real tbPlayerMove decides it); the barrier is stubbed
// with a per-direction working set — a blocked push returns true
// (consumed, as the real tbBarrierExit does for world edge / blockage /
// sealed) WITHOUT ending the fight, so the policy must read
// Game.tbfight.over, never the return value. The strike is stubbed to
// record its target (strike mechanics are the game's, covered by combat
// tests — this proves the POLICY routes to the strike).
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

function mockFight(Game, playerXY, monsterXY, monsterHp, playerHp, moveLeft) {
  const mdef = (Game.data.monsters || []).find(d => d && d.wave === 1) || {};
  const mid = mdef.id || 'deer';
  const fighters = [
    { key: 'p', kind: 'player', mx: playerXY[0], my: playerXY[1], hp: playerHp == null ? 100 : playerHp, maxHp: 100, alive: true, moveLeft: moveLeft == null ? 1 : moveLeft, acted: false },
    { key: 'm_0', kind: 'monster', monsterId: mid, mdef, mx: monsterXY[0], my: monsterXY[1], hp: monsterHp || 20, alive: true, moveLeft: 3, acted: false, speed: 2 },
  ];
  Game.tbfight = { id: 9004, over: false, round: 1, fighters, order: ['p', 'm_0'], turnIdx: 0 };
  return Game.tbfight;
}

function freshTurnMv(Game, mv) {
  const p = Game.tbFighter('p');
  if (p) { p.moveLeft = mv; p.acted = false; }
  const f = Game.tbfight;
  if (f) f.turnIdx = 0;
}

// Move the live monster fighter in the CURRENT fight object (no re-mock:
// the real game keeps one fight object across turns, so the fight-start
// block runs once and the stuck key stays stable).
function moveMonster(Game, x, y) {
  const m = Game.tbFighter('m_0');
  if (m) { m.mx = x; m.my = y; }
  return m;
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
  // workingDirs: push directions that actually exit (set per section).
  // Any other outward push returns true (consumed) WITHOUT ending the
  // fight — the real tbBarrierExit behavior for world edge / blockage.
  let workingDirs = new Set();
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
    const dir = dx < 0 ? 'w' : dx > 0 ? 'e' : dy < 0 ? 'n' : 's';
    barrierCalls.push({ dx, dy, dir, at: [p ? p.mx : null, p ? p.my : null] });
    if (workingDirs.has(dir)) {
      try { if (Game.tbfight) Game.tbfight.over = true; } catch (e) {}
      return true;
    }
    return true; // consumed the push attempt; the fight continues
  };
  Game.tbPlayerStrike = (key) => { strikeTargets.push(key); return true; };
  Game.equippedWeapon = () => ({ range: 1, bonus: 0 });
  Game.map = { px: 4, py: 4 }; // mid-map: every outward world neighbor exists

  // ---- 1. L1 EDGE + MOVELEFT 0 (r278 seed 14600 d43). ----
  // Player (0,1) moveLeft 0, spool (7,5) hp 325, west push blocked, edge
  // paths cost 1 (reachable, just not with 0 movement). The old flee
  // falls to the old target — its own tile (0,1) — and fails 236 times.
  // The fix: the flee waits (no move attempt at moveLeft 0), the close
  // waits once the flee has failed at unchanged geometry, and the day
  // burns quietly instead of spamming failed moves.
  {
    const ctx = {};
    moveTargets.length = 0; barrierCalls.length = 0; strikeTargets.length = 0; failedMoves = 0;
    workingDirs = new Set(); // every push blocked (far-side blockage)
    Game.findPath = (sx, sy, tx, ty) => {
      // Edge tiles are pathable (cost 1 from (0,1) to the next west tile);
      // the monster's adjacent tiles are reachable in principle — the
      // failures here are moveLeft 0 ("Too far"), not missing paths.
      if ((tx === 0 && ty === 2) || (tx === 0 && ty === 0)) return [[tx, ty]];
      if (tx === 6 && ty === 5) return [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 5]];
      return null;
    };
    // Mock ONCE: the real game keeps one fight object across turns (the
    // fight-start block runs once; the stuck key stays stable). Each turn
    // only refreshes the slowed fighter's moveLeft (still 0).
    mockFight(Game, [0, 1], [7, 5], 325, 100, 0);
    for (let t = 1; t <= 8; t++) {
      freshTurnMv(Game, 0); // the slowed fighter: 0 movement every turn
      oracleV2.fight(Game, ctx);
    }
    const p = Game.tbFighter('p');
    check('d43: the player never moves off (0,1)',
      p && p.mx === 0 && p.my === 1, 'player=' + (p ? p.mx + ',' + p.my : null));
    check('d43: no move ever targets the player\'s own tile (0,1)',
      !moveTargets.some(([x, y]) => x === 0 && y === 1),
      'moves=' + JSON.stringify(moveTargets));
    check('d43: failed moves are only the close probes (4), not a daily spam',
      failedMoves === 4, 'failedMoves=' + failedMoves);
    check('d43: the edge wait fires (moveLeft 0, push blocked)',
      (ctx.waited_edge || 0) >= 1, 'waited_edge=' + ctx.waited_edge);
    check('d43: the close wait fires once the flee has failed at this geometry',
      (ctx.waited_close || 0) >= 1, 'waited_close=' + ctx.waited_close);
    check('d43: a wait is never counted as a flee',
      !ctx.fled_unreachable && !ctx.fled,
      'fled=' + ctx.fled + ' fled_unreachable=' + ctx.fled_unreachable);
  }

  // ---- 2. L1 EDGE STEP (r278 seed 14606 d108 shape). ----
  // Player (2,8) moveLeft 3, hp 20/100 (neardeath), influencer (3,2).
  // South push blocked; the west edge tile (0,7) is 3 steps away and its
  // outward world neighbor exists. The fix steps to (0,7) and pushes
  // west instead of failing against its own tile.
  {
    const ctx = {};
    moveTargets.length = 0; barrierCalls.length = 0; strikeTargets.length = 0; failedMoves = 0;
    workingDirs = new Set(['w']); // west exits; south is blocked
    Game.findPath = (sx, sy, tx, ty) => {
      if (tx === 0 && ty === 7) return [[1, 8], [0, 8], [0, 7]];
      if (tx === 0 && ty === 8) return [[1, 8], [0, 8]];
      return null;
    };
    mockFight(Game, [2, 8], [3, 2], 850, 20, 3);
    freshTurnMv(Game, 3);
    oracleV2.fight(Game, ctx);
    const p = Game.tbFighter('p');
    check('d108: the flee steps to a different edge tile (0,7), not its own tile',
      p && p.mx === 0 && p.my === 7, 'player=' + (p ? p.mx + ',' + p.my : null));
    check('d108: the west push is attempted from the new edge tile',
      barrierCalls.some(b => b.dir === 'w' && b.at[0] === 0 && b.at[1] === 7),
      'barrier=' + JSON.stringify(barrierCalls));
    check('d108: the exit counts as a flee (the fight ended)',
      ctx.fled_neardeath === 1, 'fled_neardeath=' + ctx.fled_neardeath);
    check('d108: no move fails',
      failedMoves === 0, 'failedMoves=' + failedMoves);
    check('d108: no move targets the player\'s own tile (2,8)',
      !moveTargets.some(([x, y]) => x === 2 && y === 8),
      'moves=' + JSON.stringify(moveTargets));
  }

  // ---- 2b. L1 EDGE STEP, WORLD EDGE (no crossable direction). ----
  // Same shape, but the world sits at its west edge (map.px 0): the west
  // push has nowhere to go, north/east are unaffordable at moveLeft 3.
  // The fix waits instead of failing against its own tile.
  {
    const ctx = {};
    moveTargets.length = 0; barrierCalls.length = 0; strikeTargets.length = 0; failedMoves = 0;
    workingDirs = new Set(); // every push blocked
    Game.map = { px: 0, py: 4 }; // world's west edge: no west exit exists
    Game.findPath = (sx, sy, tx, ty) => {
      if (tx === 0 && ty === 7) return [[1, 8], [0, 8], [0, 7]];
      return null;
    };
    mockFight(Game, [2, 8], [3, 2], 850, 20, 3);
    freshTurnMv(Game, 3);
    oracleV2.fight(Game, ctx);
    const p = Game.tbFighter('p');
    check('world-edge: the player waits on (2,8) — no crossable exit',
      p && p.mx === 2 && p.my === 8, 'player=' + (p ? p.mx + ',' + p.my : null));
    check('world-edge: the edge wait fires',
      (ctx.waited_edge || 0) >= 1, 'waited_edge=' + ctx.waited_edge);
    check('world-edge: no move fails',
      failedMoves === 0, 'failedMoves=' + failedMoves);
    Game.map = { px: 4, py: 4 };
  }

  // ---- 3. L2 CLOSE WAIT (r278 seed 14600 d73). ----
  // Player (4,7) moveLeft 3, influencer (4,5) hp 696, ALL edge paths null,
  // the close findPath null. The old policy retried the same failed close
  // 22 times a day. The fix: probe, flee, then wait at unchanged geometry
  // — and retry only when the monster moves, striking when it comes close.
  {
    const ctx = {};
    moveTargets.length = 0; barrierCalls.length = 0; strikeTargets.length = 0; failedMoves = 0;
    workingDirs = new Set(); // no exit anywhere (sealed pocket)
    Game.findPath = () => null; // sealed pocket: no path anywhere
    // Mock ONCE (same fight object across turns, as in the real game).
    mockFight(Game, [4, 7], [4, 5], 696, 100, 3);
    for (let t = 1; t <= 8; t++) {
      freshTurnMv(Game, 3);
      oracleV2.fight(Game, ctx);
    }
    check('d73: failed moves are only the close probes (4)',
      failedMoves === 4, 'failedMoves=' + failedMoves);
    check('d73: the close wait fires (geometry unchanged after the failed flee)',
      (ctx.waited_close || 0) >= 1, 'waited_close=' + ctx.waited_close);
    check('d73: the player never moves',
      (() => { const p = Game.tbFighter('p'); return p && p.mx === 4 && p.my === 7; })(),
      'player=' + (() => { const p = Game.tbFighter('p'); return p ? p.mx + ',' + p.my : null; })());
    // The monster sidesteps (still out of range): the close is retried.
    // (Mutate the live fighter — no re-mock, so the fight-start block
    // stays skipped and the close path runs directly.)
    const failedBefore = failedMoves;
    const waitedBefore = ctx.waited_close || 0;
    moveMonster(Game, 5, 5);
    freshTurnMv(Game, 3);
    oracleV2.fight(Game, ctx);
    check('d73: a moved monster re-opens the close (one new probe)',
      failedMoves === failedBefore + 1, 'failedMoves=' + failedMoves + ' before=' + failedBefore);
    check('d73: the moved-monster turn does not wait',
      (ctx.waited_close || 0) === waitedBefore, 'waited_close=' + ctx.waited_close);
    // The monster closes to adjacent: the strike fires.
    moveMonster(Game, 4, 6);
    freshTurnMv(Game, 3);
    oracleV2.fight(Game, ctx);
    check('d73: a monster in range gets struck',
      ctx.struck >= 1 && strikeTargets.includes('m_0'),
      'struck=' + ctx.struck + ' strikes=' + JSON.stringify(strikeTargets));
  }

  // ---- 4. REGRESSION: r278 FIX 3 partial-progress flee still works. ----
  // Player (7,4) hp 20/100 (neardeath), monster (4,5) out of range,
  // cheapest edge south (7,8) costs 4, moveLeft 1. The flee walks one
  // step toward the south edge instead of failing in place.
  {
    const ctx = {};
    moveTargets.length = 0; barrierCalls.length = 0; strikeTargets.length = 0; failedMoves = 0;
    workingDirs = new Set();
    Game.findPath = (sx, sy, tx, ty) => {
      if (tx === 7 && ty === 8) return [[7, 5], [7, 6], [7, 7], [7, 8]];
      if (tx === 7 && ty === 5) return [[7, 5]];
      return null;
    };
    mockFight(Game, [7, 4], [4, 5], 61, 20, 1);
    freshTurnMv(Game, 1);
    oracleV2.fight(Game, ctx);
    check('regression: the neardeath flee fires (disengage is possible, just far)',
      ctx.fled_neardeath === 1, 'fled_neardeath=' + ctx.fled_neardeath);
    check('regression: the flee steps toward the cheapest edge (7,5)',
      moveTargets.some(([x, y]) => x === 7 && y === 5),
      'moves=' + JSON.stringify(moveTargets));
    const p = Game.tbFighter('p');
    check('regression: the player actually moved to (7,5)',
      p && p.mx === 7 && p.my === 5, 'player=' + (p ? p.mx + ',' + p.my : null));
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
