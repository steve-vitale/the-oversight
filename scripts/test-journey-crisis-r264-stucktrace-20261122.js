#!/usr/bin/env node
'use strict';
// Proof: the unreachable-flee stuck trace records the counter's life
// (journey-crisis r264, instrument for the r263 FIGHT-STALL NO-GO).
//
// THE QUESTION (r263 run note): the r263 panel showed 5 stall-days with
// fled_unreachable ABSENT from the per-seed JSONs (read as 0) and the
// staged churn fixture passing 11/11 — so fight-object churn alone is
// NOT the defeat, and the wild stalls defeat the counter another way.
// The r263 deduction is that the monster SET changes per REPLAY /
// inflate / demand cycle, resetting the monster+day key before 3. This
// test proves the TRACE records what a panel needs to tell the two apart:
// fight-start keys, no-move increments, flee fires, and resets with
// their cause (moved / in-range / strike / ability).
//
// GREEN: churn across re-created fight objects logs three 'start' entries
// with the SAME key, 'inc' entries rising 1-2-3, and a 'flee' entry;
// a monster-set change logs a new key with the counter restarted; a
// strike after a stuck turn logs a 'reset' with why 'strike' and the
// counter restarts from 1 on the next stuck turn.
//
// Staging mirrors test-journey-crisis-r263-stuckkey-churn-20261122.js.
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

const ofKind = (tr, k) => (tr || []).filter(e => e.k === k);

async function main() {
  const Game = await K.load({ seed: parseInt(process.env.SEED || '4242', 10) });
  K.newRun(Game);
  const realMove = Game.tbPlayerMove.bind(Game);
  const realAfter = Game.tbAfterPlayerAction ? Game.tbAfterPlayerAction.bind(Game) : null;
  const realBarrier = Game.tbBarrierExit ? Game.tbBarrierExit.bind(Game) : null;
  const realStrike = Game.tbPlayerStrike ? Game.tbPlayerStrike.bind(Game) : null;

  Game.tbPlayerMove = () => false; // no path, ever
  Game.tbAfterPlayerAction = () => {}; // no real monster-turn side effects
  Game.tbBarrierExit = () => false; // the exit is shut — we prove the DECISION

  // ---- 1. CHURN: a fresh fight object every turn, same monster + day. ----
  {
    const ctx = {};
    for (let t = 1; t <= 3; t++) {
      mockFight(Game, [4, 4], [0, 0], 20); // NEW object identity each turn
      freshTurn(Game);
      oracleV2.fight(Game, ctx);
    }
    check('churn: the flee fires on the 3rd stuck turn', ctx.fled_unreachable === 1,
      'fled_unreachable=' + ctx.fled_unreachable);
    const tr = ctx._stuckTrace || [];
    const starts = ofKind(tr, 'start');
    check('churn: three fight-start entries recorded', starts.length === 3,
      'starts=' + starts.length + ' trace=' + JSON.stringify(tr));
    check('churn: all three starts carry the SAME key (counter survives the re-created fight object)',
      starts.length === 3 && starts.every(s => s.key === starts[0].key),
      'keys=' + JSON.stringify(starts.map(s => s.key)));
    const incs = ofKind(tr, 'inc');
    check('churn: increments rise 1-2-3', incs.length === 3 && incs.map(e => e.s).join(',') === '1,2,3',
      'incs=' + JSON.stringify(incs.map(e => e.s)));
    const flees = ofKind(tr, 'flee');
    check('churn: one flee entry with the same key', flees.length === 1 && flees[0].key === starts[0].key,
      'flees=' + JSON.stringify(flees));
    check('churn: the trace day matches the game day',
      tr.every(e => e.d === (((Game.state || {}).scholar || {}).day || 0)),
      'days=' + JSON.stringify(tr.map(e => e.d)));
  }

  // ---- 2. NEW MONSTER SET: the key changes, the counter restarts. ----
  {
    const ctx = {};
    mockFight(Game, [4, 4], [0, 0], 20, 2); // two monsters, same def
    freshTurn(Game);
    oracleV2.fight(Game, ctx);
    const tr = ctx._stuckTrace || [];
    const starts = ofKind(tr, 'start');
    check('new-set: one start entry, counter at 0 after the key change',
      starts.length === 1 && starts[0].s === 0, 'starts=' + JSON.stringify(starts));
    check('new-set: the key names two monsters (differs from the one-monster key)',
      typeof starts[0].key === 'string' && starts[0].key.indexOf('+') !== -1,
      'key=' + starts[0].key);
    check('new-set: first stuck turn does not flee', !ctx.fled_unreachable,
      'fled=' + ctx.fled_unreachable);
  }

  // ---- 3. RESET BY STRIKE: a stuck turn, then an in-range turn. ----
  {
    const ctx = {};
    mockFight(Game, [4, 4], [0, 0], 20);
    freshTurn(Game);
    oracleV2.fight(Game, ctx); // stuck turn 1: inc s=1
    check('strike-reset: one increment recorded', ofKind(ctx._stuckTrace, 'inc').length === 1,
      'trace=' + JSON.stringify(ctx._stuckTrace));
    // Monster now in range: the strike path runs and must log the reset.
    // Same hp as turn 1 (20) so the fight assessment matches turn 1 and
    // the policy does not flee 'outmatched' before it can strike — with
    // hp 200 the assessor judged the fight unfavored and fled instead.
    mockFight(Game, [4, 4], [5, 4], 20); // same day, in range
    freshTurn(Game);
    Game.tbPlayerStrike = realStrike;
    oracleV2.fight(Game, ctx);
    const resets = ofKind(ctx._stuckTrace, 'reset');
    check('strike-reset: a reset entry names the strike as the cause',
      resets.length === 1 && resets[0].w === 'strike', 'resets=' + JSON.stringify(resets));
    check('strike-reset: the reset entry carries the stuck value it cleared (1)',
      resets.length === 1 && resets[0].s === 1, 'resets=' + JSON.stringify(resets));
    check('strike-reset: no flee fired', !ctx.fled_unreachable,
      'fled=' + ctx.fled_unreachable);
    // The counter restarts: the next stuck turn increments from 1, not 2.
    Game.tbPlayerMove = () => false;
    mockFight(Game, [4, 4], [0, 0], 20);
    freshTurn(Game);
    oracleV2.fight(Game, ctx);
    const incs = ofKind(ctx._stuckTrace, 'inc');
    check('strike-reset: the next stuck turn increments from 1 again',
      incs.length === 2 && incs[1].s === 1, 'incs=' + JSON.stringify(incs.map(e => e.s)));
  }

  // ---- 4. CAP: the trace never grows past 1000 entries per ctx. ----
  // A fresh fight object every turn logs a 'start' entry each time; the
  // counter is reset before every call so the flee never fires and the
  // entries keep coming — 1200 calls attempt 2400 pushes, the cap holds.
  {
    const ctx = {};
    for (let i = 0; i < 1200; i++) {
      mockFight(Game, [4, 4], [0, 0], 20); // fresh object each turn
      freshTurn(Game);
      ctx._closeStuck = 0; // hold the counter below the flee threshold
      oracleV2.fight(Game, ctx);
    }
    check('cap: the trace is bounded at 1000 entries',
      (ctx._stuckTrace || []).length === 1000, 'len=' + (ctx._stuckTrace || []).length);
    check('cap: no flee fired while the counter was held below 3',
      !ctx.fled_unreachable, 'fled=' + ctx.fled_unreachable);
  }

  Game.tbPlayerMove = realMove;
  Game.tbAfterPlayerAction = realAfter;
  Game.tbBarrierExit = realBarrier;
  if (realStrike) Game.tbPlayerStrike = realStrike;
  Game.tbfight = null;
  console.log(`\nRESULT: ${pass} pass, 0 fail`);
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
