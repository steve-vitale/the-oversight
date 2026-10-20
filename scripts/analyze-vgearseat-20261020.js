#!/usr/bin/env node
// analyze-vgearseat-20261020.js — pilot analysis for sim-vgearseat.
//
// Reads evidence/2026-10-20/perseed-vgearseat/{control,vgear}-*.json
// and judges the pre-registered header (see evidence/2026-10-20/
// sim-vgearseat.md):
//   PRIMARY: seeds reaching wave-5 unlock (maxWave >= 5) — armed >= 2/8.
//   SECONDARY: runs with the 2-living-veterans w5 bar ever met; wave-4 kills
//     via=villager (the vgear pilot's proven mechanism); wall numbers.
//   GUARDRAILS: villager combat deaths <= control*1.2; median survival >=
//     control-10d; starvation deaths <= control; no new death mode;
//     wave-4 unlocks within +-2/16 of control.
// Usage: node scripts/analyze-vgearseat-20261020.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-20', 'perseed-vgearseat');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [64301, 64302, 64303, 64304, 64305, 64306, 64307, 64308]).filter(Number.isFinite);
const POLICIES = ['leadfeast', 'belongfeast'];

function load(arm) {
  const rows = [];
  for (const p of POLICIES) {
    const tag = arm === 'control' ? p : p + '-vgear';
    for (const seed of SEEDS) {
      const fp = path.join(DIR, `${arm}-${tag}-s${seed}.json`);
      if (!fs.existsSync(fp)) { console.error('MISSING sweep file: ' + fp); process.exit(2); }
      rows.push(JSON.parse(fs.readFileSync(fp, 'utf8')));
    }
  }
  return rows;
}
const control = load('control'), armed = load('vgear');

function sumDeaths(rows, pred) {
  let n = 0;
  for (const r of rows) for (const [k, v] of Object.entries(r.deathCauses || {})) if (pred(k)) n += v;
  return n;
}
const isVillCombat = k => /villager/i.test(k) && /combat|fight|battle|monster|raid/i.test(k);
const isStarv = k => /starv|hunger|famine/i.test(k);
function median(a) { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; }

function seedsWithWave5(rows) {
  const bySeed = {};
  for (const r of rows) {
    bySeed[r.seed] = bySeed[r.seed] || 0;
    if (r.wave5) bySeed[r.seed] = 1;
  }
  return Object.entries(bySeed).filter(([, v]) => v).map(([s]) => +s);
}
function seedsWithVillagerW4(rows) {
  const bySeed = {};
  for (const r of rows) {
    bySeed[r.seed] = bySeed[r.seed] || 0;
    if (r.hasVillagerW4Kill) bySeed[r.seed] = 1;
  }
  return Object.entries(bySeed).filter(([, v]) => v).map(([s]) => +s);
}

const cW5 = seedsWithWave5(control), aW5 = seedsWithWave5(armed);
const cVillW4 = seedsWithVillagerW4(control), aVillW4 = seedsWithVillagerW4(armed);
const cVetRuns = control.filter(r => (r.w5vetsMax | 0) >= 2).length;
const aVetRuns = armed.filter(r => (r.w5vetsMax | 0) >= 2).length;
const cVillD = sumDeaths(control, isVillCombat), aVillD = sumDeaths(armed, isVillCombat);
const cStarv = sumDeaths(control, isStarv), aStarv = sumDeaths(armed, isStarv);
const cMed = median(control.map(r => r.gameDays || 0)), aMed = median(armed.map(r => r.gameDays || 0));
const cMax = Math.max(...control.map(r => r.gameDays || 0)), aMax = Math.max(...armed.map(r => r.gameDays || 0));
const cW4 = control.filter(r => r.wave4).length, aW4 = armed.filter(r => r.wave4).length;
const cModes = new Set(), aModes = new Set();
for (const r of control) for (const k of Object.keys(r.deathCauses || {})) cModes.add(k);
for (const r of armed) for (const k of Object.keys(r.deathCauses || {})) aModes.add(k);
const newModes = [...aModes].filter(m => !cModes.has(m) && ((armed.reduce((n, r) => n + ((r.deathCauses || {})[m] || 0), 0)) >= 2));

// Death-cause shares (wall numbers).
function shares(rows) {
  const dc = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deathCauses || {})) dc[k] = (dc[k] || 0) + v;
  const tot = Object.values(dc).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(dc).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${k} ${(100 * v / tot).toFixed(1)}%`).join(', ');
}

const nSeeds = SEEDS.length, nRuns = nSeeds * POLICIES.length;
const goBar = Math.ceil(nSeeds / 4); // 25% rate: 2/8 pilot
const vetBar = Math.ceil(nRuns / 8); // 2/16
console.log(`=== sim-vgearseat PILOT ===`);
console.log(`PRIMARY seeds w/ wave-5 unlock: control ${cW5.length}/${nSeeds} [${cW5.join(',')}], armed ${aW5.length}/${nSeeds} [${aW5.join(',')}] (GO bar >= ${goBar}/${nSeeds} armed)`);
console.log(`  -> ${aW5.length >= goBar ? 'GO' : 'NO-GO'}`);
console.log(`SECONDARY runs w/ 2-living-veterans bar met: control ${cVetRuns}/${nRuns}, armed ${aVetRuns}/${nRuns} (bar >= ${vetBar}/${nRuns} armed)`);
console.log(`MECHANISM seeds w/ villager wave-4 kill: control ${cVillW4.length}/${nSeeds} [${cVillW4.join(',')}], armed ${aVillW4.length}/${nSeeds} [${aVillW4.join(',')}]`);
console.log('GUARDRAILS:');
console.log(`  villager combat deaths: control ${cVillD}, armed ${aVillD} (bar <= ${Math.ceil(cVillD * 1.2)}) -> ${aVillD <= Math.ceil(cVillD * 1.2) ? 'PASS' : 'MISS'}`);
console.log(`  median survival: control ${cMed}d, armed ${aMed}d (bar >= ${cMed - 10}d) -> ${aMed >= cMed - 10 ? 'PASS' : 'MISS'}`);
console.log(`  starvation deaths: control ${cStarv}, armed ${aStarv} (bar <= ${cStarv}) -> ${aStarv <= cStarv ? 'PASS' : 'MISS'}`);
console.log(`  new death modes (>=2 events): ${newModes.length ? newModes.join(', ') : 'none'} -> ${newModes.length ? 'MISS' : 'PASS'}`);
const w4tol = 2;
console.log(`  wave-4 unlocks: control ${cW4}/${nRuns}, armed ${aW4}/${nRuns} (bar +-${w4tol}) -> ${Math.abs(aW4 - cW4) <= w4tol ? 'PASS' : 'MISS'}`);
console.log('LAYER ENGAGEMENT (armed vs control):');
const avg = (rows, f) => rows.reduce((n, r) => n + f(r), 0) / rows.length;
console.log(`  donations/run: ${avg(control, r => r.donations).toFixed(1)} -> ${avg(armed, r => r.donations).toFixed(1)}`);
console.log(`  invites/run: ${avg(control, r => r.invites).toFixed(1)} -> ${avg(armed, r => r.invites).toFixed(1)}`);
console.log(`  armed villagers (wb>=12): ${avg(control, r => r.armedVillagers).toFixed(1)} -> ${avg(armed, r => r.armedVillagers).toFixed(1)}`);
console.log(`  wave-4 kills: control ${control.reduce((n, r) => n + r.w4kills, 0)} (vill ${control.reduce((n, r) => n + r.w4villagerKills, 0)}), armed ${armed.reduce((n, r) => n + r.w4kills, 0)} (vill ${armed.reduce((n, r) => n + r.w4villagerKills, 0)})`);
console.log('WALL:');
for (const [lab, rows] of [['control', control], ['armed', armed]]) {
  const wdist = {};
  for (const r of rows) { const k = 'w' + r.maxWave; wdist[k] = (wdist[k] || 0) + 1; }
  console.log(`  ${lab}: national ${rows.filter(r => r.national).length}/${nRuns} table ${rows.filter(r => r.table).length}/${nRuns} wins ${rows.filter(r => r.won).length}/${nRuns} wave-reach ${JSON.stringify(wdist)}`);
  console.log(`    median survival ${median(rows.map(r => r.gameDays || 0))}d, max ${Math.max(...rows.map(r => r.gameDays || 0))}d`);
  console.log(`    death-cause shares: ${shares(rows)}`);
}
console.log('\nWave-5 unlock detail (armed):');
for (const r of armed) if (r.wave5) console.log(`  ${r.policy} s${r.seed}: maxWave=${r.maxWave} national=${r.national} table=${r.table} won=${r.won} w5vetsMax=${r.w5vetsMax} days=${r.gameDays} end=${r.endReason}`);
console.log('\nVillager wave-4 kill detail (armed):');
for (const r of armed) for (const k of (r.w4killsDetail || [])) {
  if (k.by && k.by !== undefined && ['companion', 'patrol', 'wild', 'aid-crisis', 'contest', 'agency', 'sortie'].includes(k.via))
    console.log(`  ${r.policy} s${r.seed} d${k.d} ${k.mid} by=${k.byName} via=${k.via}${k.trick ? ' trick=' + k.trick : ''}`);
}
const out = {
  seeds: SEEDS, nSeeds, nRuns, goBar,
  primary: { controlSeeds: cW5, armedSeeds: aW5, go: aW5.length >= goBar },
  secondary: { controlVetRuns: cVetRuns, armedVetRuns: aVetRuns, controlVillW4: cVillW4, armedVillW4: aVillW4 },
  guardrails: {
    villagerCombatDeaths: { control: cVillD, armed: aVillD, pass: aVillD <= Math.ceil(cVillD * 1.2) },
    medianSurvival: { control: cMed, armed: aMed, pass: aMed >= cMed - 10 },
    starvation: { control: cStarv, armed: aStarv, pass: aStarv <= cStarv },
    newDeathModes: { modes: newModes, pass: !newModes.length },
    wave4unlocks: { control: cW4, armed: aW4, pass: Math.abs(aW4 - cW4) <= 2 },
  },
};
fs.writeFileSync(path.join(REPO, 'evidence', '2026-10-20', 'vgearseat-pilot-analysis.json'), JSON.stringify(out, null, 2) + '\n');
