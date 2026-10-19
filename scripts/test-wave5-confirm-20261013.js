#!/usr/bin/env node
// scripts/test-wave5-confirm-20261013.js — PROOF for the wave-5 reachability
// confirm (scripts/sweep-wave5-confirm-20261013.js). MEASUREMENT ONLY.
//
// Verifies the measurement is honest:
//   1. Standing math on scripted inputs: war/diplomacy/plenty weights on a
//      fresh Game (pure helper path, no sim involved).
//   2. The T5 gate logic: standing >= 200 WITHOUT wave-4 faced -> wave 4
//      (not 5); standing >= 200 WITH wave-4 faced (recordDeedFight, the
//      engine's own feed) -> wave 5; standing < 100 -> below wave 4.
//   3. waveEngaged(4) reads the deed feed (wavesFaced), not the kill
//      ledger — a wave-4 kill counts faced; facing without killing counts
//      too (fleeing counts).
'use strict';
const assert = require('assert');
const K = require('./godpath/lib');
const { stripReadiness, prepareReadiness } = require('./lib/standing-fixture');
const { deathCauses } = require('./sweep-wave5-confirm-20261013');

let pass = 0;
function ok(name, cond) {
  if (!cond) { console.error('FAIL ' + name); process.exitCode = 1; return; }
  pass++; console.log('  PASS ' + name);
}

function unitDeathCauses() {
  const fake = { samples: { deaths: [
    { day: 10, kind: 'villager', who: 'x', cause: 'starved', player: false },
    { day: 12, kind: 'villager', who: 'y', cause: 'starved', player: false },
    { day: 20, kind: 'scholar', who: 'p', cause: 'killed:highbeam', player: true },
  ] } };
  const c = deathCauses(fake);
  ok('deathCauses aggregates by kind+cause', c['villager:starved'] === 2 && c['player:killed:highbeam'] === 1);
  ok('deathCauses handles missing samples', JSON.stringify(deathCauses({})) === '{}');
}

// meetWave3(G): the standing rungs sit on top of the wave-3 rung (audit
// 2026-10-14) — day past the floor + 5 wave-2 ledger points (wave-2 kills
// add no standing; the war source reads waves 3+).
function meetWave3(G) {
  G.state.scholar.day = 30;
  for (const id of ['voice_mimic_radio', 'mirror_stag', 'review_drone', 'bright_idea', 'memory_projector']) G.scoreLedgerKill(id);
}

async function liveGate() {
  const Game = await K.load({ seed: Number(process.env.SEED || 777) });
  Game.debugRegion = 'na_eastern_woodlands';
  K.newRun(Game);
  const cfg = Game.standingCfg();
  ok('cfg t4=100 t5=200', cfg.t4 === 100 && cfg.t5 === 200);
  ok('cfg weights 25/34/20', cfg.warPerKill === 25 && cfg.diplomacyPerLink === 34 && cfg.plentyPerFeast === 20);
  let s = Game.villageStanding();
  ok('fresh game standing 0', s.total === 0);
  ok('fresh game wave 1', Game.unlockedWave() === 1);
  ok('fresh waveEngaged(4) is 0', (Game.waveEngaged(4) | 0) === 0);

  // plenty path: 10 major feasts -> 200 plenty
  meetWave3(Game);
  Game.state.feastLog = [];
  for (let i = 0; i < 10; i++) Game.state.feastLog.push({ quality: 1, day: 10 + i });
  s = Game.villageStanding();
  ok('10 major feasts = 200 plenty', s.plenty === 200 && s.feasts === 10);
  ok('standing total 200', s.total >= 200);
  stripReadiness(Game);
  ok('plenty alone does not promote an unready village', Game.unlockedWave() === 3);
  ok('live village meets wave-5 readiness bars', prepareReadiness(Game, 5).ready);
  ok('ready bread-only village is held below wave 5', Game.unlockedWave() === 4);

  // wave-4 faced via the engine's own feed (fleeing counts — no kill needed)
  Game.recordDeedFight('congregation');
  ok('w4 faced reads the deed feed', Game.waveEngaged(4) >= 1);
  ok('facing wave 4 does not bypass the plenty cap', Game.unlockedWave() === 4);
  for (const id of ['redactor', 'gavel', 'focus_group', 'spool']) Game.recordWaveKill(id);
  ok('non-bread standing plus readiness and w4 faced releases wave 5', Game.unlockedWave() === 5);

  // a wave-4 kill also registers faced (single path integrity)
  const G2 = Game;
  K.newRun(G2);
  prepareReadiness(G2, 5);
  meetWave3(G2);
  G2.state.feastLog = [];
  for (let i = 0; i < 10; i++) G2.state.feastLog.push({ quality: 1, day: 10 + i });
  for (const id of ['redactor', 'gavel', 'focus_group', 'spool']) G2.recordWaveKill(id);
  ok('G2 qualifying standing and readiness, no faced -> still wave 4', G2.unlockedWave() === 4);
  G2.scoreLedgerKill('congregation');
  ok('ledger points alone do not invent a faced deed', G2.waveEngaged(4) === 0 && G2.unlockedWave() === 4);
  // progression.js wraps the real kill recorder to feed the faced deed.
  G2.recordWaveKill('congregation', G2.villagerId);
  ok('actual kill recorder also records facing and releases wave 5', G2.waveEngaged(4) >= 1 && G2.unlockedWave() === 5);

  // below T4 the gate holds
  const G3 = Game;
  K.newRun(G3);
  meetWave3(G3);
  prepareReadiness(G3, 5);
  for (const id of ['redactor', 'gavel', 'focus_group']) G3.recordWaveKill(id);
  s = G3.villageStanding();
  ok('3 w3 kills = 75 standing (below T4)', s.total === 75);
  ok('ready village below standing 100 stays at wave 3', G3.unlockedWave() === 3);
}

(async () => {
  console.log('unit: deathCauses');
  unitDeathCauses();
  console.log('live: T5 gate');
  await liveGate();
  console.log(`\n${pass} passed, ${process.exitCode ? 1 : 0} failed`);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
