#!/usr/bin/env node
// test-directional-flee-r1.js — PROOF for the scale-wall r2 "DIRECTIONAL-FLEE"
// lever (policy-side, gate COMPETENT_DIRECTIONAL_FLEE=1, default OFF).
//
// r1's honest diagnosis: the barrier push extracted scholars from fights but
// pushed through the NEAREST edge, stranding hurt, hungry scholars on unknown
// nodes (monster deaths 16→25, starvation 9→13; seed-44 trace: a day-25
// scholar pushed (4,4)→(3,4)→(2,4) AWAY from haven and starved the same day).
// The blank: fleeing must be DIRECTIONAL (toward haven/safety, judging the
// destination), plus a recover-and-return window that walks the scholar home
// to eat/rest instead of wandering the new node.
//
//   A: DIRECTION CHOICE — at node (6,4) (east of haven), the policy walks to
//      the WEST edge and pushes WEST toward haven — not the nearest x-edge
//      east (the legacy behavior: px=6>4 → tx=8 → push to (7,4), away).
//   B: DESTINATION JUDGMENT — (b1) with a monster sitting on the havenward
//      node, the policy rejudges and picks a non-monster direction;
//      (b2) AT the haven node the policy HOLDS (no push leads toward safety)
//      instead of pushing outward.
//   C: RECOVER-AND-RETURN — after a directional push, recovering() is true
//      and recoverStep() moves the scholar havenward; the window is bounded
//      (expires after 2 days; ends early when fed+healed at haven) and the
//      whole lever is inert with the gate off.
//
// Usage: node scripts/test-directional-flee-r1.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const pol = require('./policies/competent');
const { competent, chooseFleeDir, dirFleeOn, markRecover, recovering, recoverStep } = pol;

function gate(on) {
  if (on) process.env.COMPETENT_DIRECTIONAL_FLEE = '1';
  else delete process.env.COMPETENT_DIRECTIONAL_FLEE;
  delete process.env.COMPETENT_DPS_RACE; // DPS instrument stays inert throughout
}

async function fresh(seed) {
  const { Game } = await loadGame({ seed, mode: 'dirflee-proof' });
  await setupGame(Game);
  const s = Game.state.scholar;
  s.health = 100; s.hp = 100; s.maxHp = 100;
  s.kcal = 2600; s.hydration = 80; s.energy = 100; s.trauma = 0;
  return Game;
}

// Drive policy.fight until the fight ends or maxCalls player turns pass.
function driveFight(Game, ctx, maxCalls) {
  let calls = 0;
  while (Game.tbfight && !Game.tbfight.over && calls++ < (maxCalls || 60) && !Game.over) {
    if (!Game.tbIsPlayerTurn()) break;
    let handled = false;
    try { handled = competent.fight(Game, ctx); }
    catch (e) { console.error('fight threw: ' + (e && e.message)); break; }
    if (!handled) break;
  }
  return calls;
}

(async () => {
  let fails = 0;
  const check = (name, cond, extra) => {
    console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (extra ? ' — ' + extra : ''));
    if (!cond) fails++;
  };

  // ---------- A: havenward exit, not nearest edge ----------
  gate(true);
  {
    const Game = await fresh(11);
    // put the scholar at node (6,4) — east of haven (4,4)
    Game.map.px = 6; Game.map.py = 4;
    Game.startCombat('hushwolf');
    const f = Game.tbfight;
    if (!f) throw new Error('A: no fight started');
    // outmatched at fight start (300 HP monster) → flee() fires on turn 1
    // with the scholar at FULL hp — survives the walk for the assertion
    const mo = f.fighters.find(x => x.kind === 'monster');
    mo.hp = 300; mo.maxHp = 300;
    const p0 = Game.tbFighter('p');
    p0.hp = 100; p0.maxHp = 100; p0.alive = true;
    p0.mx = 4; p0.my = 4; // grid center
    const ctx = {};
    // A1: pure direction choice
    const dir = chooseFleeDir(Game, 6, 4);
    console.log('A1: chooseFleeDir(6,4) =', JSON.stringify(dir && { dx: dir.dx, dy: dir.dy, score: dir.score, havenward: dir.havenward }));
    check('A1: direction choice is havenward (west), not nearest-edge east',
      dir && dir.dx === -1 && dir.dy === 0 && dir.havenward === true,
      'dx=' + (dir && dir.dx));
    // A2: one policy turn — the walk heads WEST (toward the chosen edge)
    const mxBefore = p0.mx;
    competent.fight(Game, ctx);
    console.log(`A2: grid (${mxBefore},4) → (${p0.mx},${p0.my}), node=(${Game.map.px},${Game.map.py})`);
    check('A2: the flee walk moves toward the havenward (west) edge',
      p0.mx < mxBefore, `mx ${mxBefore}→${p0.mx}`);
    // A3: teleport to the west edge (as if the walk completed), re-arm the
    // new-fight assessment, advance to the player's turn — the push must
    // exit WEST toward haven, landing on (5,4)
    p0.mx = 0; p0.my = 4;
    p0.hp = 100; // full hp: survives the monster's intervening turns
    ctx._fightObj = null; // re-run the new-fight outmatched assessment
    let adv = 0;
    while (Game.tbfight && !Game.tbfight.over && !Game.tbIsPlayerTurn() && adv++ < 30 && !Game.over) {
      try { Game.tbAdvance(); } catch (e) { break; }
    }
    if (Game.tbIsPlayerTurn()) competent.fight(Game, ctx);
    const det = ctx.dirPushDetail || null;
    console.log('A3: dirPushDetail =', JSON.stringify(det), 'node now=(' + Game.map.px + ',' + Game.map.py + ')');
    check('A3: the barrier push exits havenward (west)',
      det && det.dir[0] === -1 && det.dir[1] === 0, JSON.stringify(det && det.dir));
    check('A3: the push lands closer to haven (6,4)→(5,4)',
      det && det.to[0] === 5 && det.to[1] === 4, JSON.stringify(det && det.to));
    check('A3: a push marks the recover-and-return window',
      (ctx.recoverMarks || 0) >= 1 && recovering(Game, ctx) === true,
      'recoverMarks=' + (ctx.recoverMarks || 0));
  }

  // ---------- B: destination judgment ----------
  gate(true);
  {
    // B1: monster on the havenward node → rejudge, never push into it
    const Game = await fresh(22);
    Game.map.px = 4; Game.map.py = 6; // 2 south of haven; havenward = north
    const md = (Game.data.monsters || []).find(m => m.id === 'hushwolf') || (Game.data.monsters || [])[0];
    let spawned = null;
    try { spawned = Game.spawnWorldMonster(md, 4, 5); } catch (e) { console.error('spawn failed: ' + (e && e.message)); }
    const seen = Game.monsterAt(4, 5);
    const dir = chooseFleeDir(Game, 4, 6);
    console.log('B1: monsterAt(4,5)=' + !!seen, 'chooseFleeDir(4,6) =', JSON.stringify(dir && { dx: dir.dx, dy: dir.dy, score: dir.score, danger: dir.danger }));
    check('B1: test setup — a world monster sits on the havenward node', !!seen);
    check('B1: the policy rejudges — does NOT push north into the monster',
      dir && !(dir.dx === 0 && dir.dy === -1), JSON.stringify(dir && [dir.dx, dir.dy]));
    check('B1: the rejudged direction is not monster-active',
      dir && dir.danger === false, 'danger=' + (dir && dir.danger));
    if (spawned) { try { Game.removeWorldMonster(spawned); } catch (e) {} }
  }
  {
    // B2: AT the haven node → HOLD (chooseFleeDir null; flee returns false;
    // no push; the scholar stands with the pantry instead of pushing outward
    // like the seed-44 trace)
    const Game = await fresh(33);
    Game.map.px = 4; Game.map.py = 4; // haven
    const dir = chooseFleeDir(Game, 4, 4);
    check('B2: at haven, chooseFleeDir returns null (hold — no safe push)', dir === null, 'dir=' + JSON.stringify(dir));
    Game.startCombat('hushwolf');
    const f = Game.tbfight;
    if (!f) throw new Error('B2: no fight started');
    const mo = f.fighters.find(x => x.kind === 'monster');
    mo.hp = 300; mo.maxHp = 300; // outmatched → flee() attempted at fight start
    const p0 = Game.tbFighter('p');
    p0.hp = 100; p0.maxHp = 100; p0.alive = true; p0.mx = 4; p0.my = 4;
    const ctx = {};
    competent.fight(Game, ctx);
    console.log(`B2: fledHeld=${ctx.fledHeld || 0} barrierPushes=${ctx.barrierPushes || 0} node=(${Game.map.px},${Game.map.py}) fightOver=${f.over || !Game.tbfight}`);
    check('B2: the hold is recorded (no outward push from haven)', (ctx.fledHeld || 0) >= 1, 'fledHeld=' + (ctx.fledHeld || 0));
    check('B2: no barrier push fired at haven', (ctx.barrierPushes || 0) === 0, 'pushes=' + (ctx.barrierPushes || 0));
    check('B2: the scholar is still at haven (not stranded outward)', Game.map.px === 4 && Game.map.py === 4);
  }

  // ---------- C: recover-and-return ----------
  gate(true);
  {
    const Game = await fresh(44);
    const day = (Game.state.scholar && Game.state.scholar.day) || 0;
    const ctx = {};
    check('C0: not recovering before any push', recovering(Game, ctx) === false);
    // a pushed scholar is hurt and displaced — set that state BEFORE marking
    Game.map.px = 6; Game.map.py = 6;
    Game.state.scholar.kcal = 500;
    markRecover(Game, ctx);
    check('C1: recovering() true after a directional push', recovering(Game, ctx) === true);
    // displaced scholar walks home
    const dBefore = Math.abs(6 - 4) + Math.abs(6 - 4);
    recoverStep(Game, ctx);
    const dAfter = Math.abs(Game.map.px - 4) + Math.abs(Game.map.py - 4);
    const fought = !!Game.tbfight;
    console.log(`C2: node (6,6)→(${Game.map.px},${Game.map.py}) dist ${dBefore}→${dAfter} fightStarted=${fought} recoverDays=${ctx.recoverDays || 0}`);
    check('C2: recoverStep moves the scholar havenward (or a fight interrupted the walk)',
      dAfter < dBefore || fought, `dist ${dBefore}→${dAfter}`);
    // bounded window: expires after 2 days
    const s = Game.state.scholar;
    s.day = day + 3;
    check('C3: the window expires (day > until)', recovering(Game, ctx) === false);
    // early out: fed + healed at haven ends recovery
    markRecover(Game, ctx);
    Game.map.px = 4; Game.map.py = 4;
    s.kcal = Game.kcalCap() * 0.9; s.hp = (s.maxHp || 100) * 0.9;
    check('C4: fed+healed at haven ends recovery early', recovering(Game, ctx) === false);
  }
  // gate off: everything inert
  gate(false);
  {
    const Game = await fresh(55);
    const ctx = {};
    check('C5: gate off — dirFleeOn() false', dirFleeOn() === false);
    markRecover(Game, ctx); // even a stale mark must not engage recovery
    check('C5: gate off — recovering() stays false', recovering(Game, ctx) === false);
    const dir = chooseFleeDir(Game, 6, 4);
    check('C5: direction choice is pure (works with gate off, policy just never calls it)',
      dir && dir.dx === -1, 'dx=' + (dir && dir.dx));
  }

  console.log(fails === 0 ? '\nALL PASS' : `\n${fails} FAILURES`);
  process.exit(fails === 0 ? 0 : 1);
})().catch(e => { console.error('PROOF CRASHED: ' + (e && e.stack || e)); process.exit(2); });
