#!/usr/bin/env node
// analyze-counterwire-20261016.js — compares treatment vs control on
// IDENTICAL seeds (the pilot/confirm sweeps of the sim-counterwire arm).
//
// PRIMARY (binding, from evidence/2026-10-16/sim-counterwire.md):
//   GO iff (a) >=1 counter-executed kill of a wave-3+ species on treatment
//   across the sweep, AND (b) mean field deaths/run WITHIN wave-3+-reached
//   runs is lower on treatment than on identical-seed control.
// Guardrails: national_treatment >= national_control - 2; maxWave not worse;
//   no new death mode; median survival report-only (win-truncation).
//
// Usage: node scripts/analyze-counterwire-20261016.js [pilot|confirm]
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-counterwire-arm');
const ROUND = process.argv[2] || 'pilot';
const PILOT_SEEDS = [702, 703, 704, 705, 708, 709, 710, 719];
const CONFIRM_SEEDS = [711, 712, 713, 714, 715, 716, 717, 720];
const seeds = ROUND === 'confirm' ? CONFIRM_SEEDS : PILOT_SEEDS;
const policies = ROUND === 'confirm' ? ['leadfeast', 'belongfeast'] : ['leadfeast'];

function load(policyId, seed, arm) {
  const p = path.join(EVID, `${policyId}-s${seed}-${arm}.json`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const rows = [];
for (const policyId of policies) {
  for (const seed of seeds) {
    const t = load(policyId, seed, 'treatment');
    const c = load(policyId, seed, 'control');
    rows.push({ policyId, seed, t, c });
  }
}

const mean = (a) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN;
const sum = (a) => a.reduce((x, y) => x + y, 0);

console.log(`== sim-counterwire ${ROUND}: treatment vs control (${rows.length} seed-pairs) ==`);

// (a) counter-executed w3+ kills
const trickW3T = sum(rows.map(r => r.t.trickKillsW3));
const trickW3C = sum(rows.map(r => r.c.trickKillsW3));
const trickW3VT = sum(rows.map(r => r.t.trickKillsW3V));
console.log(`counter-executed w3+ kills: treatment=${trickW3T} (villager ${trickW3VT}) control=${trickW3C}`);
console.log(`counter-executed kills (all waves): treatment=${sum(rows.map(r => r.t.trickKillsAll))} control=${sum(rows.map(r => r.c.trickKillsAll))}`);

// (b) field-death-rate WITHIN wave-3+-reached runs (identical seeds)
const w3t = rows.filter(r => r.t.wave3Reached && r.c.wave3Reached);
const w3tOnly = rows.filter(r => r.t.wave3Reached);
const w3cOnly = rows.filter(r => r.c.wave3Reached);
const dT = mean(w3t.map(r => r.t.fieldDeaths));
const dC = mean(w3t.map(r => r.c.fieldDeaths));
console.log(`wave-3+-reached pairs: ${w3t.length}/${rows.length} (treatment-reached ${w3tOnly.length}, control-reached ${w3cOnly.length})`);
console.log(`mean field deaths/run within reached pairs: treatment=${dT.toFixed(2)} control=${dC.toFixed(2)} (delta ${(dT - dC).toFixed(2)})`);

// discovery / knowledge
console.log(`w3+ tricks known (mean/run): treatment=${mean(rows.map(r => r.t.nW3TricksKnown)).toFixed(2)} control=${mean(rows.map(r => r.c.nW3TricksKnown)).toFixed(2)}`);
console.log(`discoveries (mean/run): treatment=${mean(rows.map(r => r.t.nDiscovered)).toFixed(1)} control=${mean(rows.map(r => r.c.nDiscovered)).toFixed(1)}`);

// trick executions (tally counts every performed trick action, not just kills)
const tallyT = {};
for (const r of rows) { for (const [k, v] of Object.entries(r.t.trickTally || {})) tallyT[k] = (tallyT[k] || 0) + v; }
const tallyC = {};
for (const r of rows) { for (const [k, v] of Object.entries(r.c.trickTally || {})) tallyC[k] = (tallyC[k] || 0) + v; }
const w3keys = (t) => Object.entries(t).filter(([k]) => /redactor|gavel|focus|tos|callback|adbreak|strike|suburb|eulogy|algorithm|congregation|nielsen|spoiler|bad_note|prone|confess|bore|examine|farewell|look_away|meet_demand|leave|contradict|argue/.test(k));
console.log('trick executions (tally, treatment): ' + JSON.stringify(tallyT));
console.log('w3+ trick executions (tally, treatment): ' + JSON.stringify(Object.fromEntries(w3keys(tallyT))));
console.log('w3+ trick executions (tally, control): ' + JSON.stringify(Object.fromEntries(w3keys(tallyC))));

// guardrails
const natT = sum(rows.map(r => r.t.national)), natC = sum(rows.map(r => r.c.national));
const wonT = sum(rows.map(r => r.t.won)), wonC = sum(rows.map(r => r.c.won));
const maxWT = Math.max(...rows.map(r => r.t.maxWave)), maxWC = Math.max(...rows.map(r => r.c.maxWave));
const daysT = rows.map(r => r.t.days).sort((a, b) => a - b), daysC = rows.map(r => r.c.days).sort((a, b) => a - b);
const med = (a) => a[Math.floor(a.length / 2)];
console.log(`national: treatment=${natT} control=${natC} (guardrail: >= ${natC - 2})`);
console.log(`won: treatment=${wonT} control=${wonC}`);
console.log(`maxWave: treatment=${maxWT} control=${maxWC} (guardrail: not worse)`);
console.log(`median days (report-only, win-truncation): treatment=${med(daysT)} control=${med(daysC)}`);

// death modes: any cause on treatment absent from control?
const causesT = {}, causesC = {};
for (const r of rows) { for (const [k, v] of Object.entries(r.t.deathCauses)) causesT[k] = (causesT[k] || 0) + v; for (const [k, v] of Object.entries(r.c.deathCauses)) causesC[k] = (causesC[k] || 0) + v; }
const newModes = Object.keys(causesT).filter(k => !causesC[k]);
console.log(`death modes treatment-only: ${newModes.length ? newModes.join(' | ') : 'none'}`);

// which tricks executed (from treatment kills)? — read from beats dir if needed; summary here
console.log('\n-- per-seed --');
for (const r of rows) {
  console.log(`s${r.seed} ${r.policyId}: T[d=${r.t.days} w=${r.t.maxWave} nat=${r.t.national} won=${r.t.won} deaths=${r.t.fieldDeaths} trickW3=${r.t.trickKillsW3} w3known=${r.t.nW3TricksKnown}] C[d=${r.c.days} w=${r.c.maxWave} nat=${r.c.national} won=${r.c.won} deaths=${r.c.fieldDeaths} trickW3=${r.c.trickKillsW3} w3known=${r.c.nW3TricksKnown}]`);
}

// verdict
const goA = trickW3T > 0;
const goB = w3t.length > 0 && dT < dC;
const guardNat = natT >= natC - 2;
const guardWave = maxWT >= maxWC;
const guardModes = newModes.length === 0;
console.log('\n== VERDICT ==');
console.log(`(a) w3+ counter-executed kills > 0: ${goA ? 'GO' : 'NO-GO'} (${trickW3T})`);
console.log(`(b) field-death-rate down within reached pairs: ${goB ? 'GO' : 'NO-GO'} (${isNaN(dT) ? 'n/a' : dT.toFixed(2) + ' vs ' + dC.toFixed(2)})`);
console.log(`guardrails: national ${guardNat ? 'OK' : 'BREACH'} | wave-reach ${guardWave ? 'OK' : 'BREACH'} | no-new-death-mode ${guardModes ? 'OK' : 'BREACH'}`);
console.log(`PRIMARY: ${(goA && goB && guardNat && guardWave && guardModes) ? 'GO' : 'NO-GO'}`);
