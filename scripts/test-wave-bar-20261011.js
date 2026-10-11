#!/usr/bin/env node
// PROOF TEST: wave-2 ledger bar 5->4 calibration (longsim wave lever 2026-10-11).
// The measured blocker for wave 3 in 20 seeds x200d (competent, seeds 1-20):
// only 4/20 runs filled the wave-2 ledger bar, median fill day 58 — the bar,
// not the day-25 floor, bound. Lowering the bar 5->4 keeps breadth pressure
// (still needs 2+ monster types at perTypeCap=2) while moving wave 3 into
// more runs' lifespans.
//
// Proves:
//   1. waveLedgerCfg reads the calibrated bar: barsPerWave = {5,4,4,3,2}
//   2. unlockedWave: day>=25 + 4 wave-2 points -> 3; 3 points + day>=25 -> 2
//      (bar is the gate, unchanged shape)
//   3. day floor still binds: 4+ wave-2 points at day 10 -> stays 2
//   4. wave-1 bar UNCHANGED: 5 points + day>=8 -> 2; 4 points -> stays 1
//   5. perTypeCap=2 intact: 3rd kill of one type scores 0
//   6. counter-known kill still scores 2 (mastery bonus untouched)
//   7. breadth preserved: 4 points needs 2+ types (2+2), one type caps at 2
//
// Green: SEED=1/2/3 node scripts/test-wave-bar-20261011.js
'use strict';
const H = require('./sim-harness.js');
const SEED = parseInt(process.env.SEED || '20261011', 10);

let pass = 0, fail = 0;
const ok = (name, cond, detail) => {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
};

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

(async () => {
  const { Game } = await H.loadGame({ seed: SEED });
  await H.setupGame(Game);
  console.log('== WAVE-2 BAR CALIBRATION PROOF, SEED ' + SEED + ' ==');

  const s = Game.state.scholar;
  const resetLedger = () => { Game.state.waveLedger = null; Game.ledgerState(); };
  const setDay = (d) => { s.day = d; };

  // 1. config reads the calibrated bar
  const cfg = Game.waveLedgerCfg();
  ok('barsPerWave = {5,4,4,3,2}',
    cfg.barsPerWave[1] === 5 && cfg.barsPerWave[2] === 4 && cfg.barsPerWave[3] === 4 &&
    cfg.barsPerWave[4] === 3 && cfg.barsPerWave[5] === 2,
    JSON.stringify(cfg.barsPerWave));
  ok('other levers untouched (cap 2, floors 8/25, 1pt/2pt)',
    cfg.perTypeCap === 2 && cfg.wave2DayFloor === 8 && cfg.dayFloor === 25 &&
    cfg.pointsPerKill === 1 && cfg.pointsPerCounterKill === 2);

  // helper: score n kills of distinct wave-2 types
  const w2types = () => Game.data.monsters.filter(m => (m.wave || 1) === 2).map(m => m.id);
  const types = w2types();
  ok('wave-2 roster non-empty', types.length >= 5, String(types.length));

  // 2. gate shape: 4 pts + day>=25 -> wave 3; 3 pts -> stays 2.
  // (Fill the wave-1 bar first in each gate test so the wave-2 gate is
  // genuinely what's being measured.)
  const w1types = Game.data.monsters.filter(m => (m.wave || 1) === 1).map(m => m.id);
  const fillW1 = () => { for (let i = 0; i < 5; i++) Game.scoreLedgerKill(w1types[i % w1types.length]); };
  resetLedger(); setDay(30); fillW1();
  Game.scoreLedgerKill(types[0]); Game.scoreLedgerKill(types[0]); // 2 pts, one type
  Game.scoreLedgerKill(types[1]); Game.scoreLedgerKill(types[1]); // 2 pts, second type
  ok('4 w2 points = 4 ledger points', Game.waveLedgerPoints(2) === 4, String(Game.waveLedgerPoints(2)));
  ok('4 w2 pts + day 30 -> unlockedWave 3', Game.unlockedWave() === 3, String(Game.unlockedWave()));
  resetLedger(); setDay(30); fillW1();
  Game.scoreLedgerKill(types[0]); Game.scoreLedgerKill(types[0]);
  Game.scoreLedgerKill(types[1]); // 3 pts
  ok('3 w2 pts + day 30 -> stays wave 2', Game.unlockedWave() === 2, String(Game.unlockedWave()));

  // 3. day floor still binds
  resetLedger(); setDay(10); fillW1();
  Game.scoreLedgerKill(types[0]); Game.scoreLedgerKill(types[0]);
  Game.scoreLedgerKill(types[1]); Game.scoreLedgerKill(types[1]);
  ok('4 w2 pts at day 10 -> stays wave 2 (floor binds)', Game.unlockedWave() === 2, String(Game.unlockedWave()));

  // 4. wave-1 bar unchanged (5)
  resetLedger(); setDay(30);
  for (let i = 0; i < 4; i++) Game.scoreLedgerKill(w1types[i % w1types.length]);
  ok('4 w1 pts + day 30 -> stays wave 1', Game.unlockedWave() === 1, String(Game.unlockedWave()));
  Game.scoreLedgerKill(w1types[4 % w1types.length]);
  ok('5 w1 pts + day 30 -> wave 2', Game.unlockedWave() === 2, String(Game.unlockedWave()));

  // 5. perTypeCap=2 intact: 3rd kill of one type scores 0
  resetLedger();
  const a1 = Game.scoreLedgerKill(types[0]);
  const a2 = Game.scoreLedgerKill(types[0]);
  const a3 = Game.scoreLedgerKill(types[0]);
  ok('perTypeCap=2: 1+1+0', a1 === 1 && a2 === 1 && a3 === 0, [a1, a2, a3].join(','));

  // 6. counter-known kill scores 2 (bonus untouched)
  resetLedger();
  Game.state.monsterCounters = Game.state.monsterCounters || {};
  Game.state.monsterCounters[types[2]] = true;
  const hasCounter = !!(Game.data.monsters.find(m => m.id === types[2]) || {}).counter;
  const b1 = Game.scoreLedgerKill(types[2]);
  ok('counter-known kill scores 2 (def has counter: ' + hasCounter + ')',
    hasCounter ? b1 === 2 : b1 === 1, String(b1));

  // 7. breadth preserved: one type can never fill the w2 bar alone.
  // (Fill the wave-1 bar first so the wave-2 gate is genuinely the test.)
  resetLedger(); setDay(30);
  for (let i = 0; i < 5; i++) Game.scoreLedgerKill(w1types[i % w1types.length]);
  for (let i = 0; i < 6; i++) Game.scoreLedgerKill(types[3]);
  ok('one type caps at 2 points', Game.waveLedgerPoints(2) === 2, String(Game.waveLedgerPoints(2)));
  ok('one type alone cannot unlock wave 3', Game.unlockedWave() === 2, String(Game.unlockedWave()));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
