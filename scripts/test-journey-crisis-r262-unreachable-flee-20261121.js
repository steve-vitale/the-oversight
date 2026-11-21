#!/usr/bin/env node
'use strict';
// Proof: the competent policy disengages from an unreachable target
// (journey-crisis r262, fix 1 — r261 new finding: radio-mimic fight stall).
//
// THE STALL (r261 panel, seed 14584 d27): the breach fight's mimic ends
// reveal-phase across unpathable ground — findPath fails for every tile
// adjacent to it, its own rush breaks on the first failed step — and the
// policy retried the same failed close 116 times while the fight never
// resolved. v2Fight had no stuck counter and no disengage rule.
//
// GREEN (post-fix): in a fight where the target stays out of weapon
// range and the player's position never changes across the close
// attempts, the policy flees ('unreachable') after 3 consecutive stuck
// turns — not on turns 1–2, and by turn 4 at the latest. A control with
// a real pathable close asserts the player moves and never flees.
// Staging mirrors test-abilities-break-20261010's mockCombat: the fight
// object is assigned directly; tbPlayerMove is stubbed to return false
// (simulating the no-path geometry) and the barrier exit is stubbed
// shut, so the test proves the DECISION to flee, not the exit itself.
// The wild confirmation (no stall-days on the panel) is the r262 panel
// instrument (FIGHT-STALL section). Exits nonzero on failure.
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
    { key: 'p', kind: 'player', mx: playerXY[0], my: playerXY[1], hp: 100, maxHp: 100, alive: true, moveLeft: 5, acted: false },
    { key: 'm_0', kind: 'monster', monsterId: mid, mdef, mx: monsterXY[0], my: monsterXY[1], hp: monsterHp || 20, alive: true, moveLeft: 3, acted: false, speed: 2 },
  ];
  Game.tbfight = { id: 9001, over: false, round: 1, fighters, order: ['p', 'm_0'], turnIdx: 0 };
  return Game.tbfight;
}

function freshTurn(Game) {
  const p = Game.tbFighter('p');
  if (p) { p.moveLeft = 5; p.acted = false; }
  const f = Game.tbfight;
  if (f) f.turnIdx = 0;
}

async function main() {
  const Game = await K.load({ seed: parseInt(process.env.SEED || '4242', 10) });
  K.newRun(Game);
  const realMove = Game.tbPlayerMove.bind(Game);
  const realAfter = Game.tbAfterPlayerAction ? Game.tbAfterPlayerAction.bind(Game) : null;
  const realBarrier = Game.tbBarrierExit ? Game.tbBarrierExit.bind(Game) : null;

  // ---- 1. unreachable target: no flee on turns 1-2, flee by turn 4. ----
  mockFight(Game, [4, 4], [0, 0], 20);
  let moveCalls = 0;
  Game.tbPlayerMove = () => { moveCalls++; return false; }; // no path, ever
  Game.tbAfterPlayerAction = () => {}; // no real monster-turn side effects
  Game.tbBarrierExit = () => false; // the exit is shut — we prove the DECISION
  const ctx = {};
  freshTurn(Game);
  const r1 = oracleV2.fight(Game, ctx);
  check('unreachable: turn 1 engages (no flee)', r1 === true && !ctx.fled_unreachable, 'fled=' + ctx.fled_unreachable);
  check('unreachable: turn 1 attempted the close', moveCalls === 1, 'calls=' + moveCalls);
  freshTurn(Game);
  oracleV2.fight(Game, ctx);
  check('unreachable: turn 2 still no flee', !ctx.fled_unreachable, 'fled=' + ctx.fled_unreachable);
  freshTurn(Game);
  oracleV2.fight(Game, ctx);
  check('unreachable: turn 3 flees (stuck counter hits 3)',
    ctx.fled_unreachable === 1, 'fled_unreachable=' + ctx.fled_unreachable);
  check('unreachable: turn 3 attempted the close before fleeing',
    moveCalls === 4, 'calls=' + moveCalls + ' (3 closes + the flee\'s own edge move)');
  freshTurn(Game);
  oracleV2.fight(Game, ctx);
  check('unreachable: while still stuck, the policy keeps fleeing (never reverts to the plain close loop)',
    ctx.fled_unreachable === 2, 'fled_unreachable=' + ctx.fled_unreachable);

  // ---- 2. control: a pathable close moves the player and never flees. ----
  Game.tbPlayerMove = realMove;
  Game.tbAfterPlayerAction = realAfter;
  Game.tbBarrierExit = realBarrier;
  // Find a monster spot whose policy target tile is really pathable on
  // this seeded map (the control must not depend on one terrain cell).
  const cands = [[6, 4], [4, 6], [6, 6], [2, 4], [4, 2], [6, 2], [2, 6]];
  let spot = null;
  for (const [mx, my] of cands) {
    // replicate the policy's target pick: the adjacent tile closest to (4,4)
    let bx = null, by = null, bd = 1e9;
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      if (!dx && !dy) continue;
      const cx = mx + dx, cy = my + dy;
      if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
      const dd = Math.max(Math.abs(cx - 4), Math.abs(cy - 4));
      if (dd < bd) { bd = dd; bx = cx; by = cy; }
    }
    if (bx == null) continue;
    let path = null;
    try { path = Game.findPath(4, 4, bx, by); } catch (e) { path = null; }
    if (path) { spot = [mx, my]; break; }
  }
  check('control: a pathable monster spot exists on this map', !!spot, 'spot=' + JSON.stringify(spot));
  const ctx2 = {};
  mockFight(Game, [4, 4], spot, 20);
  let moved = false;
  for (let t = 0; t < 4; t++) {
    freshTurn(Game);
    oracleV2.fight(Game, ctx2);
    const p = Game.tbFighter('p');
    if (p && (p.mx !== 4 || p.my !== 4)) moved = true;
    // the real tbAfterPlayerAction runs the monster turn; keep the
    // monster far enough that it cannot close to range inside 4 turns
    // (it starts at distance 2+ and the player moves toward it, so the
    // fight may end in a strike — either way, no unreachable flee).
    if (Game.tbfight && Game.tbfight.over) break;
  }
  check('control: pathable close moves the player', moved, 'player stayed at 4,4');
  check('control: pathable close never flees unreachable', !ctx2.fled_unreachable,
    'fled_unreachable=' + ctx2.fled_unreachable);

  Game.tbfight = null;
  console.log(`\nRESULT: ${pass} pass, 0 fail`);
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
