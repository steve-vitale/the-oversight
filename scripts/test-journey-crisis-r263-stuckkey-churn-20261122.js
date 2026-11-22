#!/usr/bin/env node
'use strict';
// Proof: the unreachable-flee stuck counter survives fight-object churn
// (journey-crisis r263, fix for the r262 FIGHT-STALL NO-GO).
//
// THE WILD FAILURE (r262 panel, 6 stall-days): the r262 fix keyed
// _closeStuck to the fight OBJECT — reset at fight start whenever
// ctx._fightObj !== f. Spool-replay / influencer-round fights re-create
// the fight object between turns, so the counter never reached 3 and the
// flee never even attempted (fled_unreachable 0 panel-wide; 117-120
// "No path there." lines on pure-stall days). The r262 proof fixture
// passed because it kept ONE fight object across turns — the churn case
// the r262 metric review (item 11) called for.
//
// GREEN (post-fix): the counter is keyed to the monster set + day
// (stuckKey), not the fight object. Re-creating the fight object between
// turns — same monster, same day, same positions — still flees on the
// 3rd consecutive stuck turn. A new day resets the counter; a different
// monster set resets it. A successful move still resets it (r262 control,
// kept verbatim in spirit: the pathable-close control).
//
// Staging mirrors test-journey-crisis-r262-unreachable-flee-20261121.js:
// the fight object is assigned directly; tbPlayerMove is stubbed to
// return false (the no-path geometry) and the barrier exit is stubbed
// shut, so the test proves the DECISION to flee, not the exit itself.
// Exits nonzero on failure.
const assert = require('assert');
const K = require('./godpath/lib');
const { oracleV2 } = require('./policies/oracleV2');

let pass = 0;
function check(name, condition, extra) {
  assert(condition, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

function mockFight(Game, playerXY, monsterXY, monsterHp, monsterCount) {
  const mdef = (Game.data.monsters || []).find(d => d && d.wave === 1) || {};
  const mid = mdef.id || 'deer';
  const fighters = [
    { key: 'p', kind: 'player', mx: playerXY[0], my: playerXY[1], hp: 100, maxHp: 100, alive: true, moveLeft: 5, acted: false },
  ];
  const n = monsterCount || 1;
  for (let i = 0; i < n; i++) {
    fighters.push({ key: 'm_' + i, kind: 'monster', monsterId: mid, mdef, mx: monsterXY[0], my: monsterXY[1], hp: monsterHp || 20, alive: true, moveLeft: 3, acted: false, speed: 2 });
  }
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

  let moveCalls = 0;
  Game.tbPlayerMove = () => { moveCalls++; return false; }; // no path, ever
  Game.tbAfterPlayerAction = () => {}; // no real monster-turn side effects
  Game.tbBarrierExit = () => false; // the exit is shut — we prove the DECISION

  // ---- 1. CHURN: a fresh fight object every turn, same monster + day. ----
  // On unfixed code the counter resets at every fight start and the flee
  // never fires; on fixed code the 3rd consecutive stuck turn flees.
  {
    const ctx = {};
    for (let t = 1; t <= 3; t++) {
      mockFight(Game, [4, 4], [0, 0], 20); // NEW object identity each turn
      freshTurn(Game);
      oracleV2.fight(Game, ctx);
      if (t < 3) {
        check('churn: turn ' + t + ' still no flee (counter survives the re-created fight object)',
          !ctx.fled_unreachable, 'fled=' + ctx.fled_unreachable);
      }
    }
    check('churn: turn 3 flees unreachable despite fight-object churn',
      ctx.fled_unreachable === 1, 'fled_unreachable=' + ctx.fled_unreachable);
    check('churn: the close was attempted each turn before fleeing',
      moveCalls === 4, 'calls=' + moveCalls + ' (3 closes + the flee\'s own edge move)');
  }

  // ---- 2. NEW DAY resets the counter. ----
  // Same monster, same positions, but the day has rolled over: the first
  // stuck turn of the new day must not flee.
  {
    const day0 = ((Game.state || {}).scholar || {}).day || 0;
    Game.state.scholar.day = day0 + 1;
    const ctx = {};
    mockFight(Game, [4, 4], [0, 0], 20);
    freshTurn(Game);
    oracleV2.fight(Game, ctx);
    check('new-day: first stuck turn of a new day does not flee',
      !ctx.fled_unreachable, 'fled=' + ctx.fled_unreachable);
    check('new-day: the close was attempted (the key reset, the path ran)',
      moveCalls === 5, 'calls=' + moveCalls);
    Game.state.scholar.day = day0;
  }

  // ---- 3. NEW MONSTER SET resets the counter. ----
  // Same day, but two monsters instead of one: the key differs, so the
  // counter restarts and the first stuck turn does not flee.
  {
    const ctx = {};
    const before = moveCalls;
    mockFight(Game, [4, 4], [0, 0], 20, 2); // two monsters, same def
    freshTurn(Game);
    oracleV2.fight(Game, ctx);
    check('new-monster-set: first stuck turn against a different monster set does not flee',
      !ctx.fled_unreachable, 'fled=' + ctx.fled_unreachable);
    check('new-monster-set: the close was attempted (the key reset, the path ran)',
      moveCalls === before + 1, 'calls=' + moveCalls + ' before=' + before);
  }

  // ---- 4. CONTROL (r262, kept): a pathable close moves, never flees. ----
  Game.tbPlayerMove = realMove;
  Game.tbAfterPlayerAction = realAfter;
  Game.tbBarrierExit = realBarrier;
  const cands = [[6, 4], [4, 6], [6, 6], [2, 4], [4, 2], [6, 2], [2, 6]];
  let spot = null;
  for (const [mx, my] of cands) {
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
    if (Game.tbfight && Game.tbfight.over) break;
  }
  check('control: pathable close moves the player', moved, 'player stayed at 4,4');
  check('control: pathable close never flees unreachable', !ctx2.fled_unreachable,
    'fled_unreachable=' + ctx2.fled_unreachable);

  Game.tbfight = null;
  console.log(`\nRESULT: ${pass} pass, 0 fail`);
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
