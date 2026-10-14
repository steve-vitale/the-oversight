#!/usr/bin/env node
// scripts/test-wave4-gate-20261014.js — wave 4 can't unlock before wave 3.
// Bug (audit 2026-10-14): unlockedWave() returned 4 on standing >= t4 alone,
// skipping the wave-3 rung (day floor + wave-2 ledger points). Fix: the
// standing rungs (4 and 5) also require the wave-3 conditions.
'use strict';
const K = require('./godpath/lib');
(async () => {
  const T = K.reporter('test-wave4-gate-20261014');
  const Game = await K.load({ seed: 7 });
  K.newRun(Game);
  const cfg = Game.waveLedgerCfg ? Game.waveLedgerCfg() : {};
  const dN = (cfg && cfg.dayFloor != null) ? cfg.dayFloor : 25;
  const bar2 = ((cfg && cfg.barsPerWave && cfg.barsPerWave[2]) | 0) || 5;
  Game.villageStandingTotal = () => 9999;   // far past t4 and t5
  let pts = { 1: 99, 2: 0 };
  Game.waveLedgerPoints = (w) => pts[w] | 0;

  Game.state.scholar.day = 12;
  T.ok('high standing, day 12, 0 wave-2 points -> wave < 4', Game.unlockedWave() < 4, 'got ' + Game.unlockedWave());

  Game.state.scholar.day = dN + 1;
  T.ok('high standing, past day floor, 0 wave-2 points -> wave < 4', Game.unlockedWave() < 4, 'got ' + Game.unlockedWave());

  Game.state.scholar.day = 12; pts[2] = bar2;
  T.ok('high standing, wave-2 bar met but before day floor -> wave < 4', Game.unlockedWave() < 4, 'got ' + Game.unlockedWave());

  Game.state.scholar.day = dN + 1; pts[2] = bar2;
  T.ok('high standing + wave-3 conditions met -> wave >= 4', Game.unlockedWave() >= 4, 'got ' + Game.unlockedWave());

  Game.villageStandingTotal = () => 0;
  T.ok('wave-3 conditions met, no standing -> wave 3', Game.unlockedWave() === 3, 'got ' + Game.unlockedWave());
  T.done();
})();
