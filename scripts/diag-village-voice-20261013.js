#!/usr/bin/env node
// scripts/diag-village-voice-20261013.js — SENSE-TESTING sample: captures the
// village's say-log (villager dialogue, work beats, food/rot lines) from a
// short sim for human reading. Prints the lines; the author judges meaning,
// coherence, relevance — never just counts.
// Usage: SEED=11 DAYS=30 node scripts/diag-village-voice-20261013.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

(async () => {
  const seed = parseInt(process.env.SEED || '11', 10);
  const days = parseInt(process.env.DAYS || '30', 10);
  const { Game } = await loadGame({ seed, mode: 'villagevoice' });
  await setupGame(Game);
  const lines = [];
  const origSay = Game.say;
  Game.say = function (txt) {
    try {
      if (typeof txt === 'string' && txt.length < 400) {
        const day = (Game.state.scholar || {}).day || 0;
        // keep villager-voiced lines: work, food, smoke, rot, social
        if (/[🏹🎣🌱🍲🪵💧🗣️💬❝“]/.test(txt) || /smoke racks|spoiled|pantry|taught|told|asked|mutter/.test(txt))
          lines.push(`d${day}: ${txt.slice(0, 220)}`);
      }
    } catch (e) {}
    return origSay.apply(this, arguments);
  };
  const policy = Object.assign({}, competent);
  await runDays(Game, policy, { days });
  // print a stratified sample: first 15, then every ~Nth to cover the arc
  const n = lines.length;
  console.log(`captured ${n} villager-voiced lines over ${days}d (seed ${seed})`);
  const idxs = new Set();
  for (let i = 0; i < Math.min(15, n); i++) idxs.add(i);
  for (let i = 15; i < n; i += Math.max(1, Math.floor(n / 20))) idxs.add(i);
  for (const i of [...idxs].sort((a, b) => a - b)) console.log(lines[i]);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
