#!/usr/bin/env node
// analyze-nodewitness-20261016.js — gate judge for the sim-nodewitness pilot.
// Reads evidence/2026-10-16/perseed-nodewitness/*.json, judges the
// pre-registered PRIMARY / SECONDARY / guardrails. No re-scoring: the
// header in evidence/2026-10-16/sim-nodewitness.md binds.
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-nodewitness');

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json'));
const runs = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
const T = runs.filter(r => r.arm === 'treatment');
const C = runs.filter(r => r.arm === 'control');

const sum = (rs, k) => rs.reduce((a, r) => a + (r[k] || 0), 0);
const med = (rs, k) => {
  const v = rs.map(r => r[k] || 0).sort((a, b) => a - b);
  return v.length ? v[Math.floor(v.length / 2)] : 0;
};

console.log(`runs: treatment ${T.length}, control ${C.length}`);

// PRIMARY (binding): hyper-lethal trick learnings (eater/audit/cancellation)
// > 0 on the treatment sweep (baseline 0/16).
const tPrimary = sum(T, 'nPrimaryLearned');
const cPrimary = sum(C, 'nPrimaryLearned');
console.log(`PRIMARY: treatment primaryLearned=${tPrimary} (bar >0), control=${cPrimary} (baseline 0)`);
console.log(`  treatment per-run: ${T.map(r => `${r.policyId}-s${r.seed}:${r.nPrimaryLearned}`).join(' ')}`);
const tWitDisc = T.flatMap(r => (r.primaryWitnessDiscovered || []).map(d => `${d.id}@d${d.day}(s${r.seed})`));
console.log(`  treatment witness-discovered (primary set): ${tWitDisc.join(', ') || 'none'}`);

// SECONDARY: trick executions vs the newly-hooked set ≥ 2.
const tExec = sum(T, 'apexExecutions');
const cExec = sum(C, 'apexExecutions');
console.log(`SECONDARY: treatment apexExecutions=${tExec} (bar ≥2), control=${cExec}`);
const tally = {};
for (const r of T) for (const [k, v] of Object.entries(r.apexTally || {})) tally[k] = (tally[k] || 0) + v;
console.log(`  treatment tally: ${JSON.stringify(tally)}`);

// Mechanism signal: node-witness reports.
console.log(`MECHANISM: treatment nodeWitnessReports=${sum(T, 'nNodeWitnessReports')}, discovered=${sum(T, 'nNodeWitnessDiscovered')}`);
const bySp = {};
for (const r of T) for (const [k, v] of Object.entries(r.nodeWitnessBySpecies || {})) bySp[k] = (bySp[k] || 0) + v;
console.log(`  by species: ${JSON.stringify(bySp)}`);
console.log(`  control nodeWitnessReports=${sum(C, 'nNodeWitnessReports')} (expect 0 — layer off)`);

// Guardrails: national ≥ control−2 · median ≥ control−10d · no new death mode.
const tNat = sum(T, 'national'), cNat = sum(C, 'national');
const tMed = med(T, 'days'), cMed = med(C, 'days');
console.log(`GUARDRAIL national: treatment ${tNat}/16 vs control ${cNat}/16 (bar ≥ ${cNat - 2}) → ${tNat >= cNat - 2 ? 'HOLD' : 'MISS'}`);
console.log(`GUARDRAIL median days: treatment ${tMed} vs control ${cMed} (bar ≥ ${cMed - 10}) → ${tMed >= cMed - 10 ? 'HOLD' : 'MISS'}`);
const cCauses = new Set();
for (const r of C) for (const k of Object.keys(r.deathCauses || {})) cCauses.add(k);
const newModes = new Set();
for (const r of T) for (const k of Object.keys(r.deathCauses || {})) if (!cCauses.has(k)) newModes.add(k);
console.log(`GUARDRAIL new death modes: ${[...newModes].join(', ') || 'none'} → ${newModes.size ? 'MISS' : 'HOLD'}`);

// Wall context.
console.log(`WALL treatment: national ${tNat}/16, table ${sum(T, 'table')}/16, won ${sum(T, 'won')}/16, wave4 ${sum(T, 'wave4Reached')}/16, wave5 ${sum(T, 'wave5Reached')}/16, median ${tMed}d`);
console.log(`WALL control:   national ${cNat}/16, table ${sum(C, 'table')}/16, won ${sum(C, 'won')}/16, wave4 ${sum(C, 'wave4Reached')}/16, wave5 ${sum(C, 'wave5Reached')}/16, median ${cMed}d`);

const primaryGo = tPrimary > 0;
const secondaryGo = tExec >= 2;
const guardsGo = (tNat >= cNat - 2) && (tMed >= cMed - 10) && (newModes.size === 0);
console.log(`\nVERDICT: PRIMARY ${primaryGo ? 'GO' : 'NO-GO'} · SECONDARY ${secondaryGo ? 'GO' : 'NO-GO'} · GUARDRAILS ${guardsGo ? 'HOLD' : 'MISS'}`);
console.log(`OVERALL: ${primaryGo && guardsGo ? 'GO (confirm on 12-16 runs)' : 'NO-GO — kill per protocol'}`);
