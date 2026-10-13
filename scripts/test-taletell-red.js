#!/usr/bin/env node
// scripts/test-taletell-red.js — finding #28 RED phase.
//
// The blank: a monster type the scholar never personally encounters never
// gets its village name however many villagers kill. The naming debate
// waits on a report (identifyMonster) that only the scholar's encounters
// ever produce.
//
// Desired behavior (fails on current code):
//   1. A villager kill of an unreported type queues a killer's tale.
//   2. The night fireside beat plays the tale: the killer tells it in
//      their own words (descriptor-gated, real behaviors), villagers
//      react, and the tale feeds the EXISTING debate machinery
//      (reported + knowers=[killer] -> monsterNewsCheck -> proposals).
//   3. Given enough gossip, the debate converges to a village name.
//
// Exit 0 = desired behavior present (GREEN). Exit 1 = blank confirmed (RED).
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const MID = 'hummice'; // wave-1 type the scholar will never meet in this test

function fail(msg) {
  console.log('RED — blank confirmed:', msg);
  process.exit(1);
}
function ok(msg) { console.log('GREEN:', msg); }

(async () => {
  const { Game } = await loadGame({ seed: 4242, mode: 'taletell-red', fullTelemetry: false });
  await setupGame(Game);
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  if (roster.length < 4) fail('need a real roster, got ' + roster.length);
  const killer = roster[0];

  // 1. The villager kills a type the scholar never encounters.
  Game.recordWaveKill(MID, killer);

  // Desired: a tale is queued for the night fire.
  const tales = Game.state.killerTales || [];
  const mine = tales.find(t => t.mid === MID && t.killer === killer && !t.told);
  if (!mine) fail('villager kill queued no tale (killerTales empty/missing)');

  // 2. Drive the clock to night (dayPart 3) so the fireside beat can fire.
  let guard = 0;
  while (Game.dayPart !== 3 && guard++ < 8) Game.advancePart();
  if (Game.dayPart !== 3) fail('could not reach night');

  // Desired: a tale transcript exists and the report entered the debate machinery.
  const e = (Game.state.codex.monsters || {})[MID] || {};
  if (!e.reported) fail('tale never flipped the report — codex still unreported');
  if (!(e.knowers || []).includes(killer)) fail('killer is not a knower');
  const log = Game.state.killerTaleLog || [];
  if (!log.length) fail('no tale transcript recorded');

  // 3. Let gossip work: run parts until the debate kicks or 60 parts pass.
  guard = 0;
  while (!e.namingKicked && guard++ < 60) Game.advancePart();
  if (!e.namingKicked) fail('debate never kicked after tale + gossip');
  // And convergence: proposals -> majority -> village name.
  guard = 0;
  while (!e.villageName && guard++ < 200) Game.advancePart();
  if (!e.villageName) fail('debate kicked but never converged to a village name');

  ok(`tale queued, told at night, debate kicked and converged: "${e.villageName}"`);
  console.log('--- sample tale transcript ---');
  console.log(String(log[0]).slice(0, 600));
  process.exit(0);
})().catch(err => { console.error('HARNESS ERROR:', err && err.message); process.exit(2); });
