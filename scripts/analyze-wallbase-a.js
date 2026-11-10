#!/usr/bin/env node
// scripts/analyze-wallbase-a.js — aggregate the sim-wallbase-a per-seed
// corpus into wall numbers. Reads evidence/2026-11-09/sim-wallbase-a/
// wallbase-a-competent-s*.json, writes wallbase-a-summary.json there, and
// prints the wall table to stdout. Pure reader — no Game load, no RNG.
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'evidence', '2026-11-09', 'sim-wallbase-a');
const files = fs.readdirSync(DIR).filter(f => /^wallbase-a-competent-s\d+\.json$/.test(f)).sort();
if (!files.length) { console.error('no per-seed files in ' + DIR); process.exit(1); }
const rows = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));

const n = rows.length;
const sum = (k) => rows.reduce((t, r) => t + (r[k] || 0), 0);
const daysSorted = rows.map(r => r.days).sort((a, b) => a - b);
const median = daysSorted[Math.floor(daysSorted.length / 2)];
const maxDays = daysSorted[daysSorted.length - 1];
const causeTotals = {};
for (const r of rows) for (const [k, v] of Object.entries(r.causeCounts || {})) causeTotals[k] = (causeTotals[k] || 0) + v;
const endReasons = {};
for (const r of rows) endReasons[r.endReason] = (endReasons[r.endReason] || 0) + 1;

const summary = {
  arm: 'sim-wallbase-a', n,
  seeds: rows.map(r => r.seed),
  national: sum('national'), table: sum('table'), entered: sum('entered'), wins: sum('wins'),
  wave4: sum('wave4'), wave5: sum('wave5'),
  waveReach: { 1: rows.filter(r => r.maxWave >= 1).length, 2: rows.filter(r => r.maxWave >= 2).length, 3: rows.filter(r => r.maxWave >= 3).length, 4: sum('wave4'), 5: sum('wave5') },
  arc2: sum('arc2'), arc3: sum('arc3'), arc4: sum('arc4'),
  fourRealm: sum('fourRealm'), maxFiresList: rows.map(r => r.maxFires),
  medianSurvival: median, maxSurvival: maxDays,
  survivals: rows.map(r => ({ seed: r.seed, days: r.days, end: r.endReason })),
  endReasons, causeTotals,
  vests: sum('vests'), vestsVillager: sum('vestsVillager'),
  maxStanding: Math.max.apply(null, rows.map(r => r.maxStanding || 0)),
  endStandings: rows.map(r => ({ seed: r.seed, standing: r.endStanding })),
  instrumentErrors: sum('instrumentErrors'),
};

console.log(`sim-wallbase-a — n=${n} seeds, competent, 150d, PLENTYDEPRI=1 DEPOSITGATE=1`);
console.log(`national ${summary.national}/${n}  table(invited) ${summary.table}/${n}  entered(sat) ${summary.entered}/${n}  wins ${summary.wins}/${n}`);
console.log(`wave reach: 1:${summary.waveReach[1]} 2:${summary.waveReach[2]} 3:${summary.waveReach[3]} 4:${summary.waveReach[4]} 5:${summary.waveReach[5]}`);
console.log(`arc: 2:${summary.arc2} 3:${summary.arc3} 4:${summary.arc4}  fourRealm: ${summary.fourRealm}/${n}  maxFires: [${summary.maxFiresList.join(',')}]`);
console.log(`survival: median ${median}d  max ${maxDays}d  endReasons ${JSON.stringify(endReasons)}`);
console.log(`vests scholar ${summary.vests}  villager ${summary.vestsVillager}  maxStanding ${summary.maxStanding}`);
console.log(`death causes: ${JSON.stringify(causeTotals)}`);
console.log('per-seed:');
for (const r of rows) {
  console.log(`  s${r.seed} days=${r.days} end=${r.endReason} wave=${r.maxWave} arc=${r.maxArc} rank=${r.maxRank} fires=${r.maxFires} standing=${r.endStanding} national=${r.national} table=${r.table} entered=${r.entered} won=${r.wins} deaths=${Object.values(r.causeCounts || {}).reduce((a, b) => a + b, 0)}`);
}
fs.writeFileSync(path.join(DIR, 'wallbase-a-summary.json'), JSON.stringify(summary, null, 1));
console.log('wrote ' + path.join(DIR, 'wallbase-a-summary.json'));
