#!/usr/bin/env node
'use strict';
// Proof: fight driver stops after the movement budget is spent
// (journey-landing r140, 2026-11-16).
//
// Defect (r139 metric review, 1168-d20 vs The Paparazzo — 42 failed
// moves, all "No movement left this turn"): closeStep +
// beastStrikeTarget in scripts/policies/competent.js try EVERY adjacent
// tile even when the scholar's moveLeft is already 0, so a spent budget
// spams the engine with refused moves — one per candidate per fight()
// call, until the turn ends elsewhere. A competent player would not keep
// pressing move with no movement left; the analyzer reads the spam as a
// stuck fight.
//
// Fix (same file): both candidate loops stop at once when moveLeft is
// spent — no tbPlayerMove call is issued for a tile the scholar cannot
// reach this turn. A move that fails for another reason (no path, too
// far) still tries the next tile: the r127/r128 every-tile behavior is
// untouched while the budget lasts.
//
// RED (pre-fix): moveLeft 0 -> 8 tbPlayerMove calls, return 'stuck'.
// GREEN (post-fix): moveLeft 0 -> 0 calls, return 'stuck'. The moveLeft
// 3 controls prove real closes still move (no over-correction).
// Direct calls to the exported closeStep / beastStrikeTarget with a stub
// Game. Exits nonzero on failure.
const assert = require('assert');
const { closeStep, beastStrikeTarget } = require('./policies/competent');

let pass = 0;
function check(name, condition, extra) {
  assert(condition, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

// Stub fight: player at (4,4), monster at (7,7) — out of range (d0=3,
// weapon range 1), so both functions take the close path. tbPlayerMove
// mirrors the engine: moveLeft <= 0 refuses without moving; otherwise
// it moves and spends 1.
function makeStub(moveLeft) {
  const p = { key: 'p', kind: 'player', alive: true, mx: 4, my: 4, hp: 100, maxHp: 100, moveLeft };
  const m = { key: 'm_0', kind: 'monster', alive: true, mx: 7, my: 7, hp: 50, maxHp: 50 };
  const f = { id: 'stub-fight', over: false, fighters: [p, m] };
  let moveCalls = 0;
  const Game = {
    tbfight: f,
    tbIsPlayerTurn: () => true,
    equippedWeapon: () => ({ range: 1 }),
    tbTerrainCost: () => 1,
    findPath: (x0, y0, x1, y1) => {
      // A straight path toward the destination (length = chebyshev dist).
      const d = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
      const path = [];
      for (let i = 1; i <= d; i++) {
        path.push([x0 + Math.sign(x1 - x0) * i, y0 + Math.sign(y1 - y0) * i]);
      }
      return path;
    },
    tbPlayerMove: (dx, dy) => {
      moveCalls++;
      if ((p.moveLeft || 0) <= 0) return false;
      p.mx = dx; p.my = dy; p.moveLeft -= 1;
      return true;
    },
    tbPlayerStrike: () => true,
    tbFighter: (key) => (key === 'p' ? p : m),
  };
  return { Game, f, p, m, calls: () => moveCalls };
}

function main() {
  // ---- CASE 1: closeStep, budget spent -> no calls, 'stuck' ----
  {
    const s = makeStub(0);
    const r = closeStep(s.Game, s.f, {}, s.p, 4, 4, 7, 7);
    check('closeStep moveLeft=0 returns stuck', r === 'stuck', `got ${r}`);
    check('closeStep moveLeft=0 issues zero tbPlayerMove calls', s.calls() === 0, `calls=${s.calls()}`);
  }
  // ---- CASE 2: closeStep, budget left -> moves (control) ----
  {
    const s = makeStub(3);
    const r = closeStep(s.Game, s.f, {}, s.p, 4, 4, 7, 7);
    check('closeStep moveLeft=3 returns moved', r === 'moved', `got ${r}`);
    check('closeStep moveLeft=3 actually changed position',
      s.p.mx !== 4 || s.p.my !== 4, `pos=(${s.p.mx},${s.p.my})`);
    check('closeStep moveLeft=3 issued at least one tbPlayerMove call', s.calls() >= 1, `calls=${s.calls()}`);
    check('closeStep moveLeft=3 never went negative on budget', s.p.moveLeft >= 0, `moveLeft=${s.p.moveLeft}`);
  }
  // ---- CASE 3: beastStrikeTarget, budget spent -> no calls, 'stuck' ----
  {
    const s = makeStub(0);
    let ended = 0;
    const endTurn = () => { ended++; };
    const r = beastStrikeTarget(s.Game, s.f, {}, s.p, 4, 4, s.m, endTurn);
    check('beastStrikeTarget moveLeft=0 returns stuck', r === 'stuck', `got ${r}`);
    check('beastStrikeTarget moveLeft=0 issues zero tbPlayerMove calls', s.calls() === 0, `calls=${s.calls()}`);
    check('beastStrikeTarget moveLeft=0 ends the turn', ended === 1, `ended=${ended}`);
  }
  // ---- CASE 4: beastStrikeTarget, budget left -> moves (control) ----
  {
    const s = makeStub(3);
    let ended = 0;
    const endTurn = () => { ended++; };
    const r = beastStrikeTarget(s.Game, s.f, {}, s.p, 4, 4, s.m, endTurn);
    check('beastStrikeTarget moveLeft=3 returns moved', r === 'moved', `got ${r}`);
    check('beastStrikeTarget moveLeft=3 actually changed position',
      s.p.mx !== 4 || s.p.my !== 4, `pos=(${s.p.mx},${s.p.my})`);
    check('beastStrikeTarget moveLeft=3 issued at least one tbPlayerMove call', s.calls() >= 1, `calls=${s.calls()}`);
  }
  // ---- CASE 5: closeStep, budget spent mid-loop -> stops, not spins ----
  // One affordable step spends the whole budget; the loop must not then
  // keep trying the remaining tiles on the spent budget.
  {
    const s = makeStub(1);
    const r = closeStep(s.Game, s.f, {}, s.p, 4, 4, 7, 7);
    check('closeStep moveLeft=1 returns moved', r === 'moved', `got ${r}`);
    check('closeStep moveLeft=1 issued exactly one tbPlayerMove call', s.calls() === 1, `calls=${s.calls()}`);
  }

  console.log(`\n=== RESULT: ${pass} pass ===`);
  process.exit(0);
}

main();
