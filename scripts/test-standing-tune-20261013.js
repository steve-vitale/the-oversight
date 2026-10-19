#!/usr/bin/env node
// scripts/test-standing-tune-20261013.js — PROOF for the standing tuning
// sweep (scripts/sweep-standing-tune-20261013.js). MEASUREMENT ONLY.
//
// Verifies the measurement itself:
//   1. Pure helpers: classifyDriver + detectCrossings on scripted rows
//      (edge cases: empty, exact-threshold, monotonic, no-cross).
//   2. Live Game (seeded, full module list): villageStanding() returns the
//      documented breakdown shape; standingCfg() carries t4=100/t5=200;
//      scripted ledger kills move war by +25/pt (per-type cap respected);
//      scripted feastLog entries move plenty by +20; unlockedWave() honors
//      the Standing gate (wave 4 at total>=100, wave 5 needs wave-4 faced).
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');
const { stripReadiness, prepareReadiness } = require('./lib/standing-fixture');
const { classifyDriver, detectCrossings } = require('./sweep-standing-tune-20261013');

let pass = 0;
function ok(name, cond) {
  if (!cond) { console.error('FAIL ' + name); process.exitCode = 1; return; }
  pass++; console.log('  PASS ' + name);
}

function unitHelpers() {
  // classifyDriver
  ok('driver war pure', classifyDriver({ total: 100, war: 100, diplomacy: 0, plenty: 0 }) === 'war');
  ok('driver diplomacy pure', classifyDriver({ total: 102, war: 0, diplomacy: 102, plenty: 0 }) === 'diplomacy');
  ok('driver plenty pure', classifyDriver({ total: 100, war: 0, diplomacy: 0, plenty: 100 }) === 'plenty');
  ok('driver hybrid 50/34/20', classifyDriver({ total: 104, war: 50, diplomacy: 34, plenty: 20 }) === 'hybrid');
  ok('driver boundary 80% is pure', classifyDriver({ total: 100, war: 80, diplomacy: 10, plenty: 10 }) === 'war');
  ok('driver boundary 79% is hybrid', classifyDriver({ total: 100, war: 79, diplomacy: 11, plenty: 10 }) === 'hybrid');
  ok('driver none on zero', classifyDriver({ total: 0, war: 0, diplomacy: 0, plenty: 0 }) === 'none');
  // detectCrossings
  const rows = (tots, waves) => tots.map((t, i) => ({ day: i + 1, total: t, wave: waves[i] || 1, war: t, diplomacy: 0, plenty: 0 }));
  let c = detectCrossings(rows([0, 50, 99, 100, 150], [1, 1, 1, 4, 4]), 100, 200);
  ok('t4 crossing exact threshold', c.t4Day === 4 && c.atT4.total === 100);
  ok('wave4 detected', c.wave4Day === 4);
  ok('no t5 cross', c.t5Day == null && c.wave5Day == null);
  c = detectCrossings(rows([0, 0, 0], [1, 1, 1]), 100, 200);
  ok('no crossings on flat', c.t4Day == null && c.wave4Day == null && c.atT4 == null);
  c = detectCrossings(rows([200, 200], [5, 5]), 100, 200);
  ok('already-above at day 1', c.t4Day === 1 && c.t5Day === 1 && c.wave5Day === 1);
  c = detectCrossings([], 100, 200);
  ok('empty rows safe', c.t4Day == null && c.atT4 == null);
}

async function liveGame() {
  const { Game } = await loadGame({ seed: Number(process.env.SEED || 4242), mode: 'standing-tune-proof' });
  Game.debugRegion = 'na_eastern_woodlands';
  await setupGame(Game);
  // shape
  const cfg = Game.standingCfg();
  ok('cfg t4=100 t5=200', cfg.t4 === 100 && cfg.t5 === 200);
  ok('cfg weights 25/34/20', cfg.warPerKill === 25 && cfg.diplomacyPerLink === 34 && cfg.plentyPerFeast === 20);
  let s = Game.villageStanding();
  ok('breakdown shape', ['total', 'war', 'diplomacy', 'plenty', 'warPts', 'links', 'feasts'].every(k => k in s));
  ok('fresh game standing 0', s.total === 0);
  ok('fresh game wave 1', Game.unlockedWave() === 1);
  // wave-3 rung first (audit 2026-10-14: standing rungs sit on top of it):
  // day past the floor + 5 wave-2 ledger points (no standing from w2).
  Game.state.scholar.day = 30;
  for (const id of ['voice_mimic_radio', 'mirror_stag', 'review_drone', 'bright_idea', 'memory_projector']) Game.recordWaveKill(id);
  stripReadiness(Game);
  // scripted war: 4 wave-3 kills of distinct types -> 100 war
  for (const id of ['redactor', 'gavel', 'focus_group', 'spool']) Game.recordWaveKill(id);
  s = Game.villageStanding();
  ok('4 distinct w3 kills = 100 war', s.war === 100 && s.warPts === 4);
  ok('standing 100 alone holds an unready village at wave 3', Game.unlockedWave() === 3);
  const readiness = prepareReadiness(Game, 4);
  ok('real worn gear, known counters and living veterans meet readiness', readiness.ready);
  ok('wave 4 unlocks at standing 100 once ready', Game.unlockedWave() === 4);
  ok('wave 5 locked without w4 faced', Game.unlockedWave() !== 5);
  // per-type cap: 3 more redactor kills add at most 1 (cap is 2 pts/type)
  Game.recordWaveKill('redactor'); Game.recordWaveKill('redactor'); Game.recordWaveKill('redactor');
  s = Game.villageStanding();
  ok('per-type cap respected', s.warPts === 5 && s.war === 125);
  // scripted plenty: 5 major feasts -> +100
  Game.state.feastLog = [];
  for (let i = 0; i < 5; i++) Game.state.feastLog.push({ quality: 1, day: 10 + i });
  s = Game.villageStanding();
  ok('5 feasts = 100 plenty', s.plenty === 100 && s.feasts === 5);
  ok('thin feasts excluded', (() => { Game.state.feastLog.push({ quality: 0, day: 99 }); return Game.villageStanding().feasts === 5; })());
  // standingLine sane
  const line = Game.standingLine();
  ok('standingLine mentions wave 4', /wave 4 at 100/.test(line));
}

(async () => {
  console.log('unit: helpers');
  unitHelpers();
  console.log('live: game API');
  await liveGame();
  console.log(`\n${pass} passed, ${process.exitCode ? 1 : 0} failed`);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
