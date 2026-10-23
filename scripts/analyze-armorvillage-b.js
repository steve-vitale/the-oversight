#!/usr/bin/env node
// analyze-armorvillage-b.js — sim-armorvillage-b PILOT analysis.
// Reads evidence/2026-10-23/perseed-armorvillage-b/{control,armed}/*.json,
// judges the pre-registered primary + guardrails, prints the verdict.
//
// PRIMARY (binding): (1) pile deposits >=2/seed on >=6/8 armed seeds;
// (2) villagers equipped from pile/hand-off >=2/seed on >=6/8 armed seeds;
// (3) NPC craft beats produce >=1/seed on >=6/8 armed seeds;
// AND median per-seed-median daily armored15-fighter count armed > control + 0.5.
// GO = primary met in full + all guardrails pass.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-23', 'perseed-armorvillage-b');

function load(arm) {
  const d = path.join(DIR, arm);
  return fs.readdirSync(d).filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(d, f), 'utf8')));
}
function median(xs) {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : null;
}

const control = load('control');
const armed = load('armed');
console.log(`configs: control ${control.length}, armed ${armed.length}`);

// seeds keyed: group armed by seed for the >=6/8 bars (per-policy rows collapsed by max)
function bySeed(rows) {
  const m = {};
  for (const r of rows) {
    const k = r.seed;
    m[k] = m[k] || { seed: k, deposits: 0, equipped: 0, crafts: 0, days: [] };
    m[k].deposits = Math.max(m[k].deposits, r.deposits);
    m[k].equipped = Math.max(m[k].equipped, r.equippedFromStructure);
    m[k].crafts = Math.max(m[k].crafts, r.crafts);
    m[k].days.push(r.days);
  }
  return Object.values(m);
}
const aSeeds = bySeed(armed);
const bar1 = aSeeds.filter(s => s.deposits >= 2).length;
const bar2 = aSeeds.filter(s => s.equipped >= 2).length;
const bar3 = aSeeds.filter(s => s.crafts >= 1).length;
console.log(`mechanism bars (armed, per seed, n=${aSeeds.length}):`);
console.log(`  (1) deposits>=2: ${bar1}/8 ${bar1 >= 6 ? 'PASS' : 'FAIL'}`);
console.log(`  (2) equipped-from-structure>=2: ${bar2}/8 ${bar2 >= 6 ? 'PASS' : 'FAIL'}`);
console.log(`  (3) crafts>=1: ${bar3}/8 ${bar3 >= 6 ? 'PASS' : 'FAIL'}`);

const cMed = median(bySeed(control).map(s => median(control.filter(r => r.seed === s.seed).map(r => r.medDailyArmored15).filter(x => x != null))));
const aMed = median(aSeeds.map(s => median(armed.filter(r => r.seed === s.seed).map(r => r.medDailyArmored15).filter(x => x != null))));
const armoredOK = aMed != null && cMed != null && aMed > cMed + 0.5;
console.log(`armored15 median-of-medians: control ${cMed}, armed ${aMed} (bar armed > control+0.5) ${armoredOK ? 'PASS' : 'FAIL'}`);

// guardrails
const cDays = median(control.map(r => r.days)), aDays = median(armed.map(r => r.days));
const cStarv = control.reduce((s, r) => s + r.starvDeaths, 0), aStarv = armed.reduce((s, r) => s + r.starvDeaths, 0);
console.log(`guardrails: median survival control ${cDays}d armed ${aDays}d; starvation control ${cStarv} armed ${aStarv}`);
const causeShare = (rows) => {
  const tot = rows.reduce((s, r) => s + r.nDeaths, 0);
  const by = {};
  for (const r of rows) for (const d of r.deaths) {
    const k = String(d.cause || 'unknown').slice(0, 40);
    by[k] = (by[k] || 0) + 1;
  }
  return { tot, by };
};
const cc = causeShare(control), ac = causeShare(armed);
console.log('death-cause shares (control):', JSON.stringify(cc.by));
console.log('death-cause shares (armed):  ', JSON.stringify(ac.by));
const cKinds = new Set(control.flatMap(r => r.deaths.map(d => String(d.kind || '?'))));
const newKinds = [...new Set(armed.flatMap(r => r.deaths.map(d => String(d.kind || '?'))))].filter(k => !cKinds.has(k));
console.log('new death kinds armed-only:', newKinds.length ? newKinds : 'none');

const primaryGO = bar1 >= 6 && bar2 >= 6 && bar3 >= 6 && armoredOK;
console.log(`\nPRIMARY: ${primaryGO ? 'GO' : 'NO-GO'}`);
