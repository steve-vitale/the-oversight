#!/usr/bin/env node
// Debug: why did the road wipe on seed 555? Dumps the road log + supplies.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { nomadseek } = require('./policies/nomadseek');

async function main() {
  const seed = parseInt(process.env.SEED || '555', 10);
  const { Game, manifest } = await loadGame({ seed, mode: 'nomad-debug' });
  await setupGame(Game);
  const policy = Object.assign({}, nomadseek);
  const r = await runDays(Game, policy, { days: 200, manifest });
  const road = (Game.state || {}).road || {};
  console.log(`seed ${seed}: ${r.days}d end=${r.endReason} won=${!!Game.won}`);
  console.log(`party: ${(road.partyIds || []).join(',')}`);
  console.log(`supplies at end: ${JSON.stringify(road.supplies)}`);
  console.log(`foundKin: ${(road.foundKin || []).length}, fallen: ${(road.fallen || []).length}`);
  console.log('--- road log ---');
  for (const e of (road.log || [])) {
    const t = typeof e === 'string' ? e : (e.text || JSON.stringify(e));
    if (/die|died|dead|starv|kill|wound|fight|attack|ate|food|forag/i.test(t)) console.log('  ' + t.slice(0, 160));
  }
  console.log('--- last 15 log entries ---');
  for (const e of (road.log || []).slice(-15)) {
    console.log('  ' + (typeof e === 'string' ? e : (e.text || JSON.stringify(e))).slice(0, 160));
  }
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
