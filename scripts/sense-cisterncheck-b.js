#!/usr/bin/env node
// scripts/sense-cisterncheck-b.js — sense-testing capture for sim-cisterncheck-b.
// Re-runs an armed pilot seed (deterministic) with Game.say wrapped, capturing
// water/redirect/wood/stone beats. SENSE-TESTING LAW: read the lines and judge
// whether the fixed behavior reads as people checking the cistern — and whether
// anything reads robotic (idling, ping-ponging, spam).
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 SEED=66064 POLICY=leadfeast node scripts/sense-cisterncheck-b.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

const SEED = parseInt(process.env.SEED || '66064', 10);
const POLICY = process.env.POLICY || 'leadfeast';
const KEEP = /cistern|eyes the cistern|returns with \d+L|hauls back|pries \d+ stone|checks the pantry|full to the brim/i;

(async () => {
  const base = POLICY === 'belongfeast' ? belongfeast : leadfeast;
  const { Game } = await loadGame({ seed: SEED, mode: 'cisterncheck-sense', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const seen = new Set();
  const osay = Game.say.bind(Game);
  Game.say = function (x) {
    try {
      const s = String(x);
      if (KEEP.test(s)) {
        const day = ((Game.state || {}).scholar || {}).day || 0;
        const key = day + '|' + s.slice(0, 100);
        if (!seen.has(key)) { seen.add(key); lines.push(`[d${day}] ${s.slice(0, 300)}`); }
      }
    } catch (e) {}
    return osay.apply(this, arguments);
  };
  const policy = Object.assign({}, base);
  const result = await runDays(Game, policy, { days: 180 });
  console.log(`seed=${SEED} policy=${POLICY} days=${result.days} end=${result.endReason}`);
  console.log(`captured ${lines.length} water/labor lines; redirects=${(Game.state.village || {}).cisternRedirects || 0} overflowHauls=${(Game.state.village || {}).cisternOverflowHauls || 0}`);
  // Print a stratified sample: first 15, every ~Nth, last 10 — to read across the run.
  const idx = new Set();
  for (let i = 0; i < Math.min(15, lines.length); i++) idx.add(i);
  for (let i = 15; i < lines.length - 10; i += Math.max(1, Math.floor(lines.length / 25))) idx.add(i);
  for (let i = Math.max(0, lines.length - 10); i < lines.length; i++) idx.add(i);
  for (const i of [...idx].sort((a, b) => a - b)) console.log(lines[i]);
})().catch(e => { console.error('SENSE CRASH:', e); process.exit(2); });
