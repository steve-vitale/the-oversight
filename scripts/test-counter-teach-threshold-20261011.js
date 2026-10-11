#!/usr/bin/env node
// test-counter-teach-threshold-20261011.js — PROOF for the combat-lever change.
// Lever: counterTeachable() threshold 2+ -> 1+ village slain (game.js).
// Asserts:
//   1. After ONE village slay of a counter-bearing type, counterTeachable()
//      returns that type (was: null until 2 slain).
//   2. askAbout(vid, 'beasttricks') teaches the counter (discoverMonsterCounter
//      'taught', state.monsterCounters set).
//   3. The 20-seed sweep evidence shows the measured delta on identical seeds:
//      countersDiscovered 75 -> 166, wave-3 unlock 1/20 -> 5/20.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name); }
}

(async () => {
  console.log('== unit: counterTeachable threshold ==');
  const { Game } = await loadGame({ seed: 42, mode: 'test' });
  await setupGame(Game);
  // no slays yet
  ok(Game.counterTeachable() === null, 'no slays -> not teachable');
  // one village slay of hushwolf (counter-bearing)
  Game.recordWaveKill('hushwolf', { by: 'villager' });
  const t1 = Game.counterTeachable();
  ok(t1 === 'hushwolf', `1 slay -> teachable hushwolf (got ${t1})`);
  // askAbout teaches
  const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
  const r = Game.askAbout(vid, 'beasttricks');
  ok(r && r.taught === 'hushwolf', 'askAbout beasttricks teaches hushwolf');
  ok(!!(Game.state.monsterCounters || {}).hushwolf, 'state.monsterCounters.hushwolf set');
  ok(Game.counterTeachable() !== 'hushwolf', 'known counter no longer teachable');

  console.log('== measurement: sweep evidence delta ==');
  const dir = path.join(__dirname, '..', 'sweep-out');
  const before = JSON.parse(fs.readFileSync(path.join(dir, 'combat-lever-before.json'), 'utf8')).agg.competent;
  const after = JSON.parse(fs.readFileSync(path.join(dir, 'combat-lever-after.json'), 'utf8')).agg.competent;
  ok(before.n === 20 && after.n === 20, 'both sweeps are 20 seeds');
  console.log(`  discoveries: ${before.countersDiscovered} -> ${after.countersDiscovered}`);
  ok(after.countersDiscovered > before.countersDiscovered * 1.5, 'counter discoveries up >50%');
  const w3b = Object.entries(before.maxWaveDist).filter(([w]) => +w >= 3).reduce((t, [, n]) => t + n, 0);
  const w3a = Object.entries(after.maxWaveDist).filter(([w]) => +w >= 3).reduce((t, [, n]) => t + n, 0);
  console.log(`  wave-3+ unlock runs: ${w3b}/20 -> ${w3a}/20`);
  ok(w3a >= w3b, 'wave-3 reach not regressed');
  ok(after.totalDeaths <= before.totalDeaths, `deaths not regressed (${before.totalDeaths} -> ${after.totalDeaths})`);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
