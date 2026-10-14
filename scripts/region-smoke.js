#!/usr/bin/env node
// scripts/region-smoke.js — the playable-region smoke sim (docs/WORLD-REGIONS.md §8, §11).
//
//   REGION=na_eastern_woodlands node scripts/region-smoke.js
//   REGION=africa_sahel_savanna SEEDS=7,42,99 DAYS=60 node scripts/region-smoke.js
//
// Lands the capable bot in REGION (Game.debugRegion) for each seed, one child
// process per seed (never two harnesses in one process), and prints one row
// per seed. Fails (exit 1) if any run crashes, lands somewhere else, or every
// run ends with the village starved out. Writes nothing.
'use strict';
const path = require('path');
const { spawnSync } = require('child_process');

const REGION = process.env.REGION || 'na_eastern_woodlands';
const SEEDS = String(process.env.SEEDS || '7,42,99').split(',').map(Number).filter(n => !isNaN(n));
const DAYS = Number(process.env.DAYS || 60);
const ORIGIN = process.env.ORIGIN || 'Columbus, Ohio';

async function child(seed) {
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { capable } = require('./policies/capable');
  const { Game, loadFails } = await loadGame({ seed, mode: 'region-smoke' });
  Game.debugRegion = REGION;
  let r = null;
  await quietLog(async () => {
    await setupGame(Game, ORIGIN);
    r = await runDays(Game, capable, { days: DAYS });
  });
  const tele = (Game.state && Game.state.telemetry) || [];
  const deaths = tele.filter(e => e.type === 'death');
  const out = {
    seed, region: Game.state.region, landing: Game.state.startLocation, days: r.days, end: r.endReason,
    pop: ((Game.state.village || {}).roster || []).length,
    deaths: deaths.length, starved: deaths.filter(e => /starv|hunger/i.test(String(e.cause || ''))).length,
    loadFails: loadFails.length,
  };
  process.stdout.write('ROW ' + JSON.stringify(out) + '\n');
  process.exit(0);
}

function parent() {
  console.log(`region-smoke: ${REGION}, seeds ${SEEDS.join(',')}, ${DAYS} days, capable bot, origin "${ORIGIN}"`);
  const rows = [];
  let bad = 0;
  for (const seed of SEEDS) {
    const res = spawnSync(process.execPath, [__filename, '--child', String(seed)], { encoding: 'utf8', env: process.env, timeout: 600000 });
    const line = String(res.stdout || '').split('\n').find(l => l.startsWith('ROW '));
    if (!line) { bad++; console.log(`  seed ${seed}: CRASH ${String(res.stderr || '').split('\n').slice(-4).join(' / ')}`); continue; }
    const row = JSON.parse(line.slice(4));
    rows.push(row);
    const wrong = row.region !== REGION;
    if (wrong || row.loadFails) bad++;
    console.log(`  seed ${seed}: ${row.end} day ${row.days} pop ${row.pop} deaths ${row.deaths} (starved ${row.starved}) landing ${row.landing}${wrong ? '  WRONG REGION ' + row.region : ''}`);
  }
  const allStarved = rows.length && rows.every(r => r.end !== 'survived' && r.starved > 0);
  if (allStarved) { bad++; console.log('  FAIL every run starved out'); }
  console.log(bad ? `region-smoke: FAIL (${bad})` : 'region-smoke: OK');
  process.exit(bad ? 1 : 0);
}

if (process.argv[2] === '--child') child(Number(process.argv[3])).catch(e => { console.error(e.stack); process.exit(1); });
else parent();
