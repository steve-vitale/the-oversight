#!/usr/bin/env node
// test-reach-wavebeat-20261010.js — Worker B parity sweep (2026-10-10).
// REWRITTEN 2026-10-12 (longsim wave lever r5): the original asserted the
// 2026-10-10 engagement lanes (recordDeedFight unlocking waves) — Steve
// REVERSED those the same day (engagements feed the endgame deed gate only,
// never wave unlocks; see docs/MONSTER-WAVES.md), and its kill-path rig fed
// 8 kills of ONE type against perTypeCap=2 (2 points, never the 4 needed).
// Both staleness classes verified on pristine HEAD (1 pass / 7 fail).
// PROOF now: (1) the reversal holds — deed feed never unlocks waves;
// (2) the kill feed unlocks with a cap-aware rig, beat fires exactly once;
// (3) adoption stays silent; (4) no villager drop-beat for wave 2.
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

async function fresh(seed) {
  const { Game } = await loadGame({ seed, mode: 'reach' });
  await setupGame(Game);
  Game.state.scholar.day = 30; // past the day-25 floor
  return Game;
}

// Cap-aware rig: 2 types x 4 kills = 4 points (perTypeCap=2) -> wave 3.
function killToWave3(Game) {
  for (let i = 0; i < 4; i++) Game.recordWaveKill('voice_mimic_radio');
  for (let i = 0; i < 4; i++) Game.recordWaveKill('review_drone');
}

(async () => {
  let pass = 0, fail = 0;
  const t = (name, fn) => { try { fn(); pass++; console.log('ok -', name); } catch (e) { fail++; console.log('FAIL -', name, '::', e.message); } };

  // PATH 1 (reversal): engagement feed NEVER unlocks waves (Steve 2026-10-10).
  {
    const Game = await fresh(101);
    let beats = [];
    const orig = Game.waveUnlockBeat;
    Game.waveUnlockBeat = function (w) { beats.push(w); return orig.apply(this, arguments); };
    assert.strictEqual(Game.unlockedWave(), 1, 'pre: wave 1');
    Game.recordDeedFight('voice_mimic_radio');
    Game.recordDeedFight('review_drone');
    Game.recordDeedFight('warranty_caller');
    Game.recordDeedFight('understudy');
    t('reversal: deed feed does not unlock wave 3', () => assert.strictEqual(Game.unlockedWave(), 1));
    t('reversal: no beat from deed feed', () => assert.deepStrictEqual(beats, []));
  }

  // PATH 2: kill feed (villager kills) earns wave 3 -> beat fires.
  {
    const Game = await fresh(102);
    let beats = [];
    const orig = Game.waveUnlockBeat;
    Game.waveUnlockBeat = function (w) { beats.push(w); return orig.apply(this, arguments); };
    killToWave3(Game);
    t('kill path: wave 3 unlocks via kills', () => assert.strictEqual(Game.unlockedWave(), 3));
    t('kill path: wave-3 beat fired', () => assert.deepStrictEqual(beats, [3]));
  }

  // IDEMPOTENCY: further feeds don't re-fire.
  {
    const Game = await fresh(103);
    let beats = 0;
    const orig = Game.waveUnlockBeat;
    Game.waveUnlockBeat = function (w) { beats++; return orig.apply(this, arguments); };
    killToWave3(Game);
    Game.recordWaveKill('voice_mimic_radio');
    Game.recordWaveKill('warranty_caller');
    Game.checkWaveUnlockBeat();
    t('idempotent: one beat for wave 3', () => assert.strictEqual(beats, 1));
  }

  // ADOPT: in-flight wave-2 games don't get a spurious wave-2 announcement
  // or villager drop-beat; the wave-3 beat still lands after.
  {
    const Game = await fresh(104);
    Game.state.scholar.day = 10;
    // w1 bar: 3 types x 4 kills = 6 pts >= 5 -> wave 2 unlocks (day 10 >= 8)
    for (let i = 0; i < 4; i++) Game.recordWaveKill('bulldozer');
    for (let i = 0; i < 4; i++) Game.recordWaveKill('hushwolf');
    for (let i = 0; i < 4; i++) Game.recordWaveKill('gallowdeer');
    assert.strictEqual(Game.unlockedWave(), 2, 'pre: wave 2 unlocked');
    const said = [];
    const origSay = Game.say;
    Game.say = function (...a) { said.push(a.join(' ')); return origSay.apply(this, arguments); };
    let beats = [];
    const orig = Game.waveUnlockBeat;
    Game.waveUnlockBeat = function (w) { beats.push(w); return orig.apply(this, arguments); };
    Game.checkWaveUnlockBeat(); // first sight: adopts wave 2 silently
    t('adopt: no spurious wave-2 beat', () => assert.deepStrictEqual(beats, []));
    t('adopt: no villager drop-beat for wave 2', () =>
      assert.strictEqual(said.filter(s => /at the fire/.test(s)).length, 0));
    Game.say = origSay;
    Game.state.scholar.day = 30;
    killToWave3(Game);
    t('adopt: wave-3 beat fires after adoption', () => assert.deepStrictEqual(beats, [3]));
  }

  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})();
