#!/usr/bin/env node
// analyze-unloaddiv-20261014.js — UNLOAD-TRUST DIVERGENCE verdict computation
// (sim-findings #155, scale-onramp r30 diagnostic).
//
// Reads sweep-unloaddiv-{armed,control}-inv2.json (invocation 1 rows only),
// applies the PRE-REGISTERED classification from
// evidence/2026-10-14/sim-unloaddiv.md:
//
//   HIGH-RAID ⟺ mean control-side gorge nights (both policies) >= 8 AND
//                  mean control-side total gorged kcal >= 5000.
//   Per-seed delta = mean over policies of (armedDays - controlDays).
//   PREDICTION: HIGH-RAID -> avgDelta <= 0; LOW-RAID -> avgDelta >= 0.
//   NEUTRAL = |avgDelta| <= 10d (follows the prediction either way).
//   DIAGNOSTIC GO: >= 6/8 seeds follow the sign prediction.
//
// Also prints the per-combo table and the wall numbers (national / table /
// wins, wave 4-5 unlocks, median survival) for both sides.
'use strict';
const fs = require('fs');

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const POLICIES = ['belongseek', 'leadcourt'];

function load(side) {
  const j = JSON.parse(fs.readFileSync(`sweep-unloaddiv-${side}-inv2.json`, 'utf8'));
  const m = new Map();
  for (const r of j.rows) {
    if (r.invocation !== 1) continue;
    m.set(r.policy + ':' + r.seed, r);
  }
  return m;
}

const armed = load('armed');
const control = load('control');

// raid classification per seed — EXOGENOUS, control side only
const seedClass = {};
for (const seed of SEEDS) {
  const rows = POLICIES.map(p => control.get(p + ':' + seed));
  const meanNights = rows.reduce((t, r) => t + r.gorgeNights, 0) / rows.length;
  const meanKcal = rows.reduce((t, r) => t + r.totalGorgedKcal, 0) / rows.length;
  seedClass[seed] = {
    meanNights, meanKcal,
    highRaid: meanNights >= 8 && meanKcal >= 5000,
  };
}

console.log('=== per-seed raid classification (control side) ===');
console.log('seed | meanNights | meanKcal | class');
for (const seed of SEEDS) {
  const c = seedClass[seed];
  console.log(`${seed} | ${c.meanNights.toFixed(1)} | ${Math.round(c.meanKcal)} | ${c.highRaid ? 'HIGH-RAID' : 'low-raid'}`);
}

console.log('\n=== per-combo table ===');
console.log('seed | policy | days A/C | delta | gorgeN A/C | gorgeK A/C');
let follows = 0;
const seedDeltas = {};
for (const seed of SEEDS) {
  const deltas = [];
  for (const p of POLICIES) {
    const a = armed.get(p + ':' + seed), c = control.get(p + ':' + seed);
    const d = a.days - c.days;
    deltas.push(d);
    console.log(`${seed} | ${p.padEnd(10)} | ${a.days}/${c.days} | ${d >= 0 ? '+' : ''}${d} | ${a.gorgeNights}/${c.gorgeNights} | ${a.totalGorgedKcal}/${c.totalGorgedKcal}`);
  }
  const avg = deltas.reduce((t, x) => t + x, 0) / deltas.length;
  seedDeltas[seed] = avg;
  const c = seedClass[seed];
  const neutral = Math.abs(avg) <= 10;
  const ok = (c.highRaid && avg <= 0) || (!c.highRaid && avg >= 0);
  if (ok) follows++;
  console.log(`  -> seed ${seed}: avgDelta=${avg >= 0 ? '+' : ''}${avg.toFixed(1)} ${neutral ? '(neutral)' : ''} predicted=${c.highRaid ? '<=0 (armed worse/neutral)' : '>=0 (armed better/neutral)'} => ${ok ? 'FOLLOWS' : 'MISSES'}`);
}

console.log(`\n=== VERDICT: ${follows}/8 seeds follow the sign prediction (GO needs >= 6/8) ===`);
console.log(follows >= 6 ? 'GO: hypothesis CONFIRMED' : 'NO-GO per §14: hypothesis REFUTED');

function wall(side, m) {
  const rows = [...m.values()];
  const days = rows.map(r => r.days).sort((a, b) => a - b);
  const median = days.length % 2 ? days[days.length >> 1] : (days[days.length / 2 - 1] + days[days.length / 2]) / 2;
  return {
    national: rows.filter(r => r.national).length + '/16',
    table: rows.filter(r => r.table).length + '/16',
    wins: rows.filter(r => r.won).length + '/16',
    wave45: rows.filter(r => r.waveReach >= 4).length + '/16',
    maxWave: Math.max(...rows.map(r => r.waveReach)),
    medianDays: median,
  };
}
console.log('\n=== wall numbers ===');
console.log('control:', JSON.stringify(wall('control', control)));
console.log('armed:  ', JSON.stringify(wall('armed', armed)));
