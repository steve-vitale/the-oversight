#!/usr/bin/env node
// test-gap-w1-sensors.js — proof for gap-phase2 W1 scale-combat sensor fixes:
//   line 844: waveKillLog dedupe on (day, mid, by, via, trick) in both
//             recordWaveKill and recordPyrrhicKill (double-write logs once).
//   line 361: 'wave_unlock' telemetry event fires on a wave rise (first
//             observation adopts silently, like the unlock beat itself).
//   line 346: alien-player fights (startAlienCombat, built directly in
//             encounters.js) emit the same 'combat_start' telemetry that
//             startCombat emits, alien-flagged.
// Usage: node scripts/test-gap-w1-sensors.js  (from the repo root)
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

(async () => {
  const { Game } = await loadGame({ seed: 42, fullTelemetry: true });
  await quietLog(async () => { await setupGame(Game); });
  const scholarVid = Game.villagerId;
  const roster = ((Game.state.village || {}).roster || []).filter(v => v !== scholarVid);
  const villagerVid = roster[0] || 'villager-test';

  // --- line 844: recordWaveKill dedupe ---
  const baseLog = (Game.state.waveKillLog || []).length;
  await quietLog(async () => {
    Game.recordWaveKill('bulldozer', scholarVid, 'player', null);
    Game.recordWaveKill('bulldozer', scholarVid, 'player', null); // exact repeat
  });
  const afterDup = (Game.state.waveKillLog || []).length;
  ok('844 recordWaveKill exact repeat logs once', afterDup === baseLog + 1,
    `base=${baseLog} after=${afterDup}`);
  await quietLog(async () => {
    Game.recordWaveKill('bulldozer', scholarVid, 'player', 'sidestep'); // different trick
  });
  const afterTrick = (Game.state.waveKillLog || []).length;
  ok('844 different trick still logs', afterTrick === afterDup + 1,
    `afterDup=${afterDup} afterTrick=${afterTrick}`);

  // --- line 844: recordPyrrhicKill dedupe ---
  const baseP = (Game.state.waveKillLog || []).length;
  await quietLog(async () => {
    Game.recordPyrrhicKill('hushwolf', villagerVid, 'wild', null);
    Game.recordPyrrhicKill('hushwolf', villagerVid, 'wild', null); // exact repeat
  });
  const afterP = (Game.state.waveKillLog || []).length;
  ok('844 recordPyrrhicKill exact repeat logs once', afterP === baseP + 1,
    `base=${baseP} after=${afterP}`);

  // --- line 361: wave_unlock telemetry ---
  const tele = () => (Game.state.telemetry || []);
  const teleBefore = tele().filter(e => e.type === 'wave_unlock').length;
  const pg = (typeof Game.progState === 'function') ? Game.progState() : {};
  pg._teleSeen = pg._teleSeen || {};
  pg._teleSeen.waveUnlock = 1; // pretend we observed wave 1 already
  const origUnlocked = Game.unlockedWave;
  Game.unlockedWave = () => 3;
  try {
    await quietLog(async () => { Game.checkWaveUnlockBeat(); });
  } finally { Game.unlockedWave = origUnlocked; }
  const rises = tele().filter(e => e.type === 'wave_unlock');
  const fresh = rises.slice(teleBefore);
  ok('361 wave_unlock event fires on rise', fresh.length >= 1,
    `before=${teleBefore} rises=${rises.length}`);
  if (fresh.length) {
    ok('361 wave_unlock carries from/to', fresh[0].from === 1 && fresh[0].to === 3,
      JSON.stringify({ from: fresh[0].from, to: fresh[0].to }));
  }

  // --- line 346: alien-player combat_start ---
  const teleBeforeAlien = tele().filter(e => e.type === 'combat_start' && e.alien).length;
  let alienErr = null;
  try {
    await quietLog(async () => {
      const s = Game.state.scholar || {};
      s.mx = 4; s.my = 4;
      const fighter = { name: 'Test Stranger', alienPid: 'ap-test', hp: 100, maxHp: 100, speed: 5 };
      Game.startAlienCombat(fighter);
    });
  } catch (e) { alienErr = e; }
  const alienEvents = tele().filter(e => e.type === 'combat_start' && e.alien);
  ok('346 alien fight emits combat_start (alien:true)', !alienErr && alienEvents.length > teleBeforeAlien,
    alienErr ? String(alienErr && alienErr.message) : `before=${teleBeforeAlien} after=${alienEvents.length}`);

  console.log(`\n${pass} pass, ${fail} fail`);
  if (fail) process.exit(1);
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
