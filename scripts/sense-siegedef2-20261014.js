#!/usr/bin/env node
// scripts/sense-siegedef2-20261014.js — sense-testing helper (not a proof).
// Runs the ARMED policy (SIEGEDEF2=1) on a wave-5-unlocking seed, captures
// EVERY Game.say line to a file. For reading the siege window with human
// eyes: watch muster narrations, patrol fights, scholar disengages,
// villager dialogue/reactions (SENSE-TESTING LAW).
//
// Usage: SEED=55 DAYS=150 node scripts/sense-siegedef2-20261014.js
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.SIEGEDEF2 = '1';
const fs = require('fs');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { siegeleadfeast } = require('./policies/siegedef2');

(async () => {
  const seed = parseInt(process.env.SEED || '55', 10);
  const days = parseInt(process.env.DAYS || '150', 10);
  const { Game } = await loadGame({ seed, mode: 'siegedef2-sense', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const ogSay = Game.say.bind(Game);
  Game.say = function (text) {
    try {
      const day = ((Game.state || {}).scholar || {}).day || 0;
      lines.push(`[d${day}] ${String(text).slice(0, 280)}`);
    } catch (e) {}
    return ogSay(text);
  };
  const policy = Object.assign({}, siegeleadfeast);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 }); });
  const out = `/home/hatch/workspace/worktrees/sim-siegedef2r/evidence/2026-10-15/siegedef2-transcript-s${seed}.txt`;
  fs.writeFileSync(out, lines.join('\n'));
  console.log(`captured ${lines.length} lines -> ${out} (${result.days}d ${result.endReason})`);
  // siege-relevant excerpt index: patrol / watch / disengage / flee lines
  const idx = lines
    .map((l, i) => ({ l, i }))
    .filter(({ l }) => /patrol|perimeter|watch|siege|barrier|BARRIER|flee|retreat|walks the|keeps watch/i.test(l));
  console.log(`siege-relevant lines: ${idx.length}`);
  for (const { l } of idx.slice(0, 60)) console.log('  ' + l);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
