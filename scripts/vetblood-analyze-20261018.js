#!/usr/bin/env node
// vetblood-analyze-20261018.js — pilot verdict for sim-vetblood.
// Reads evidence/2026-10-18/perseed-vetblood/{armed,control}/ and judges
// the pre-registered gates (see sim-vetblood.md): engagement (STEP 1),
// primary ever-produced delta (STEP 2), secondaries, guardrails.
// Usage: node scripts/vetblood-analyze-20261018.js [armedLabel] [controlLabel]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const BASE = path.join(REPO, 'evidence', '2026-10-18', 'perseed-vetblood');
const armedLabel = process.argv[2] || 'armed';
const controlLabel = process.argv[3] || 'control';

function load(label) {
  const dir = path.join(BASE, label);
  const rows = [];
  for (const f of fs.readdirSync(dir)) {
    if (f === '_summary.json' || !f.endsWith('.json')) continue;
    rows.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  }
  return rows.filter(r => !r.error);
}
function med(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

const armed = load(armedLabel), control = load(controlLabel);
const n = armed.length;
console.log(`armed=${armedLabel} n=${n}  control=${controlLabel} n=${control.length}`);
if (n !== control.length || n === 0) { console.error('ARM SIZE MISMATCH — abort'); process.exit(2); }

// STEP 1: engagement gate — kill-steering engages in >= 4/16 armed runs.
const engA = armed.filter(r => (r.vbYields | 0) >= 1).length;
const hunA = armed.filter(r => (r.vbHunts | 0) >= 1).length;
const engC = control.filter(r => (r.vbYields | 0) >= 1).length;
console.log(`\nSTEP 1 engagement: armed yields>=1 in ${engA}/${n} (bar >= 4), hunts>=1 in ${hunA}/${n}; control yields ${engC}/${n}`);
const step1 = engA >= 4;
console.log(`STEP 1: ${step1 ? 'GO' : 'KILL — mechanism does not engage'}`);

// STEP 2: primary — ever-produced share delta >= +4/16.
const prodA = armed.filter(r => r.firstVetDay != null);
const prodC = control.filter(r => r.firstVetDay != null);
const dEver = prodA.length - prodC.length;
console.log(`\nSTEP 2 primary (ever-produced): armed ${prodA.length}/${n} vs control ${prodC.length}/${n} => delta ${dEver >= 0 ? '+' : ''}${dEver} (bar >= +4)`);
const step2 = dEver >= 4;
console.log(`STEP 2: ${step2 ? 'GO' : 'NO-GO'}`);

// Secondaries.
const medFvdA = med(prodA.map(r => r.firstVetDay));
const medFvdC = med(prodC.map(r => r.firstVetDay));
console.log(`\nsecondary median firstVetDay (producers): armed ${medFvdA} vs control ${medFvdC} (bar: armed <= control - 10)`);
const w3vA = armed.reduce((t, r) => t + (r.w3VillagerKills | 0), 0);
const w3vC = control.reduce((t, r) => t + (r.w3VillagerKills | 0), 0);
console.log(`secondary villager wave-3+ kills: armed ${w3vA} vs control ${w3vC}`);
const w4A = armed.filter(r => r.wave4).length, w4C = control.filter(r => r.wave4).length;
console.log(`wave-4 unlocks: armed ${w4A}/${n} vs control ${w4C}/${n}`);
const natA = armed.filter(r => r.national).length, natC = control.filter(r => r.national).length;
const tabA = armed.filter(r => r.table).length, tabC = control.filter(r => r.table).length;
const wonA = armed.filter(r => r.won).length, wonC = control.filter(r => r.won).length;
console.log(`wall: national ${natA}v${natC} table ${tabA}v${tabC} won ${wonA}v${wonC}`);

// Guardrails.
const scdA = armed.reduce((t, r) => t + (r.scholarCombatDeaths | 0), 0);
const scdC = control.reduce((t, r) => t + (r.scholarCombatDeaths | 0), 0);
const medDaysA = med(armed.map(r => r.days)), medDaysC = med(control.map(r => r.days));
const stvA = armed.reduce((t, r) => t + (r.starveDeaths | 0), 0);
const stvC = control.reduce((t, r) => t + (r.starveDeaths | 0), 0);
console.log(`\nguardrails: scholarCombatDeaths ${scdA}v${scdC} (bar armed<=control); medianDays ${medDaysA}v${medDaysC} (bar armed>=control-25); starveDeaths ${stvA}v${stvC} (bar armed<=control+1)`);
const g1 = scdA <= scdC, g2 = medDaysA >= medDaysC - 25, g3 = stvA <= stvC + 1;
console.log(`guardrails: ${g1 && g2 && g3 ? 'PASS' : 'FAIL'} [combat:${g1 ? 'ok' : 'MISS'} survival:${g2 ? 'ok' : 'MISS'} starve:${g3 ? 'ok' : 'MISS'}]`);
// New death mode: cause present in armed with n>=3 and absent in control.
const dcA = {}, dcC = {};
for (const r of armed) for (const [k, v] of Object.entries(r.deathCauses || {})) dcA[k] = (dcA[k] || 0) + v;
for (const r of control) for (const [k, v] of Object.entries(r.deathCauses || {})) dcC[k] = (dcC[k] || 0) + v;
const newModes = Object.keys(dcA).filter(k => dcA[k] >= 3 && !(dcC[k] >= 1));
console.log(`new death mode (n>=3, absent in control): ${newModes.length ? newModes.join(',') : 'none'}`);

// Per-seed pair table (identical seeds): firstVetDay and vbYields.
console.log('\nper-seed pairs (seed policy | armed firstVet/Y | control firstVet/Y):');
const key = r => `${r.policyId}-s${r.seed}`;
const cmap = new Map(control.map(r => [key(r), r]));
for (const r of armed.slice().sort((a, b) => key(a) < key(b) ? -1 : 1)) {
  const c = cmap.get(key(r));
  console.log(`  ${key(r)} | A firstVet=${r.firstVetDay} Y=${r.vbYields} H=${r.vbHunts} w3v=${r.w3VillagerKills} | C firstVet=${c ? c.firstVetDay : '?'} Y=${c ? c.vbYields : '?'} H=${c ? c.vbHunts : '?'} w3v=${c ? c.w3VillagerKills : '?'}`);
}

console.log(`\nVERDICT: step1=${step1 ? 'GO' : 'KILL'} step2=${step2 ? 'GO' : 'NO-GO'} guardrails=${g1 && g2 && g3 && !newModes.length ? 'PASS' : 'FAIL'}`);
