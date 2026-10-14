#!/usr/bin/env node
// MEASURE (harnessstop arm, 2026-10-14): before/after for the dead-village
// stop-condition fix. Runs runDays (the real harness path) on identical
// seeds+policy, records wall-clock + a trajectory hash for the byte-identical
// guardrail.
//
// Usage: node scripts/measure-harnessstop-20261014.js <out.json> [seed...]
// Seeds default to 505 (the plentycost stall seed) + 4 live seeds.
'use strict';
const fs = require('fs');
const crypto = require('crypto');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');

const SEEDS = process.argv.slice(3).map(Number).filter(n => !isNaN(n));
const seeds = SEEDS.length ? SEEDS : [505, 44, 55, 99, 303];
const OUT = process.argv[2] || '/tmp/harnessstop-measure.json';

function trajHash(result) {
  const h = crypto.createHash('sha1');
  h.update(JSON.stringify({
    samples: result.samples,
    endReason: result.endReason,
    days: result.days,
    gameDays: result.gameDays,
    learnedPlants: result.learnedPlants,
    learnedSkills: result.learnedSkills,
    maxWaveUnlocked: result.maxWaveUnlocked,
    waveKills: result.waveKills,
    pacing: result.pacing,
  }));
  return h.digest('hex');
}

async function main() {
  const rows = [];
  for (const seed of seeds) {
    const t0 = Date.now();
    let row;
    try {
      const { Game, manifest } = await loadGame({ seed, mode: 'harnessstop-measure' });
      await setupGame(Game);
      const policy = Object.assign({}, leadcourt);
      const result = await runDays(Game, policy, { days: 180, manifest, sampleEvery: 10 });
      row = {
        seed, ms: Date.now() - t0, endReason: result.endReason,
        days: result.days, gameDays: result.gameDays,
        trajHash: trajHash(result),
        deaths: (result.samples.deaths || []).length,
      };
    } catch (e) {
      row = { seed, ms: Date.now() - t0, endReason: 'ERROR', error: String(e && e.message).slice(0, 200) };
    }
    rows.push(row);
    console.log(JSON.stringify(row));
  }
  fs.writeFileSync(OUT, JSON.stringify({ when: new Date().toISOString(), rows }, null, 1));
  console.log('wrote ' + OUT);
}
main().catch(e => { console.error('FATAL ' + e.stack); process.exit(1); });
