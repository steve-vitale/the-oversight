#!/usr/bin/env node
// analyze-villagergear-20261020.js — pilot analysis for sim-villagergear.
//
// Reads evidence/2026-10-20/perseed-villagergear-pilot/{control,vgear}-*.json
// and judges the pre-registered header (see evidence/2026-10-20/
// sim-villagergear.md):
//   PRIMARY: seeds with >=1 wave-4 kill via=villager — armed >= 2/8.
//   SECONDARY: runs with the 2-living-veterans w5 bar ever met — armed >= 2/16.
//   GUARDRAILS: villager combat deaths <= control*1.2; median survival >=
//     control-10d; starvation deaths <= control; no new death mode;
//     wave-4 unlocks within +-2/16 of control.
// Usage: node scripts/analyze-villagergear-20261020.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-20', 'perseed-villagergear-pilot');
const SEEDS = [64001, 64002, 64003, 64004, 64005, 64006, 64007, 64008];
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

function seedsWithVillagerW4(rows) {
  const bySeed = {};
  for (const r of rows) {
    bySeed[r.seed] = bySeed[r.seed] || 0;
    if (r.hasVillagerW4Kill) bySeed[r.seed] = 1;
  }
  return Object.entries(bySeed).filter(([, v]) => v).map(([s]) => +s);
}

const cSeeds = seedsWithVillagerW4(control), aSeeds = seedsWithVillagerW4(armed);
const cVetRuns = control.filter(r => (r.w5vetsMax | 0) >= 2).length;
const aVetRuns = armed.filter(r => (r.w5vetsMax | 0) >= 2).length;
const cVillD = sumDeaths(control, isVillCombat), aVillD = sumDeaths(armed, isVillCombat);
const cStarv = sumDeaths(control, isStarv), aStarv = sumDeaths(armed, isStarv);
const cMed = median(control.map(r => r.gameDays || 0)), aMed = median(armed.map(r => r.gameDays || 0));
const cW4 = control.filter(r => r.wave4).length, aW4 = armed.filter(r => r.wave4).length;
const cModes = new Set(), aModes = new Set();
for (const r of control) for (const k of Object.keys(r.deathCauses || {})) cModes.add(k);
for (const r of armed) for (const k of Object.keys(r.deathCauses || {})) aModes.add(k);
const newModes = [...aModes].filter(m => !cModes.has(m) && ((armed.reduce((n, r) => n + ((r.deathCauses || {})[m] || 0), 0)) >= 2));

console.log('=== sim-villagergear PILOT ===');
console.log(`PRIMARY seeds w/ villager wave-4 kill: control ${cSeeds.length}/8 [${cSeeds.join(',')}], armed ${aSeeds.length}/8 [${aSeeds.join(',')}] (GO bar >= 2/8 armed)`);
console.log(`  -> ${aSeeds.length >= 2 ? 'GO' : 'NO-GO'}`);
console.log(`SECONDARY runs w/ 2-living-veterans bar met: control ${cVetRuns}/16, armed ${aVetRuns}/16 (bar >= 2/16 armed)`);
console.log('GUARDRAILS:');
console.log(`  villager combat deaths: control ${cVillD}, armed ${aVillD} (bar <= ${Math.ceil(cVillD * 1.2)}) -> ${aVillD <= Math.ceil(cVillD * 1.2) ? 'PASS' : 'MISS'}`);
console.log(`  median survival: control ${cMed}d, armed ${aMed}d (bar >= ${cMed - 10}d) -> ${aMed >= cMed - 10 ? 'PASS' : 'MISS'}`);
console.log(`  starvation deaths: control ${cStarv}, armed ${aStarv} (bar <= ${cStarv}) -> ${aStarv <= cStarv ? 'PASS' : 'MISS'}`);
console.log(`  new death modes (>=2 events): ${newModes.length ? newModes.join(', ') : 'none'} -> ${newModes.length ? 'MISS' : 'PASS'}`);
console.log(`  wave-4 unlocks: control ${cW4}/16, armed ${aW4}/16 (bar +-2) -> ${Math.abs(aW4 - cW4) <= 2 ? 'PASS' : 'MISS'}`);
console.log('MECHANISM (armed vs control):');
const avg = (rows, f) => rows.reduce((n, r) => n + f(r), 0) / rows.length;
console.log(`  donations/run: ${avg(control, r => r.donations).toFixed(1)} -> ${avg(armed, r => r.donations).toFixed(1)}`);
console.log(`  invites/run: ${avg(control, r => r.invites).toFixed(1)} -> ${avg(armed, r => r.invites).toFixed(1)}`);
console.log(`  party end: ${avg(control, r => r.partyEnd).toFixed(1)} -> ${avg(armed, r => r.partyEnd).toFixed(1)}`);
console.log(`  armed villagers (wb>=12): ${avg(control, r => r.armedVillagers).toFixed(1)} -> ${avg(armed, r => r.armedVillagers).toFixed(1)}`);
console.log(`  armored P>=10: ${avg(control, r => r.armoredVillagersP10).toFixed(1)} -> ${avg(armed, r => r.armoredVillagersP10).toFixed(1)}; P>=15: ${avg(control, r => r.armoredVillagersP15).toFixed(1)} -> ${avg(armed, r => r.armoredVillagersP15).toFixed(1)}`);
console.log(`  wave-4 kills: control ${control.reduce((n, r) => n + r.w4kills, 0)} (vill ${control.reduce((n, r) => n + r.w4villagerKills, 0)}), armed ${armed.reduce((n, r) => n + r.w4kills, 0)} (vill ${armed.reduce((n, r) => n + r.w4villagerKills, 0)})`);
console.log(`  wave-4 companion dmg share: control ${avg(control, r => r.w4compDmgShare == null ? 0 : r.w4compDmgShare).toFixed(4)} armed ${avg(armed, r => r.w4compDmgShare == null ? 0 : r.w4compDmgShare).toFixed(4)}`);
console.log('WALL:');
for (const [lab, rows] of [['control', control], ['armed', armed]]) {
  console.log(`  ${lab}: national ${rows.filter(r => r.national).length}/16 table ${rows.filter(r => r.table).length}/16 wins ${rows.filter(r => r.won).length}/16 wave4 ${rows.filter(r => r.wave4).length}/16 wave5 ${rows.filter(r => r.wave5).length}/16`);
}
console.log('\nVillager wave-4 kill detail (armed):');
for (const r of armed) for (const k of (r.w4killsDetail || [])) {
  if (k.by && k.by !== undefined) console.log(`  ${r.policy} s${r.seed} d${k.d} ${k.mid} by=${k.byName} via=${k.via}${k.trick ? ' trick=' + k.trick : ''}`);
}
const out = {
  primary: { controlSeeds: cSeeds, armedSeeds: aSeeds, go: aSeeds.length >= 2 },
  secondary: { controlRuns: cVetRuns, armedRuns: aVetRuns },
  guardrails: {
    villagerCombatDeaths: { control: cVillD, armed: aVillD, pass: aVillD <= Math.ceil(cVillD * 1.2) },
    medianSurvival: { control: cMed, armed: aMed, pass: aMed >= cMed - 10 },
    starvation: { control: cStarv, armed: aStarv, pass: aStarv <= cStarv },
    newDeathModes: { modes: newModes, pass: !newModes.length },
    wave4unlocks: { control: cW4, armed: aW4, pass: Math.abs(aW4 - cW4) <= 2 },
  },
};
fs.writeFileSync(path.join(REPO, 'evidence', '2026-10-20', 'villagergear-pilot-analysis.json'), JSON.stringify(out, null, 2) + '\n');
