#!/usr/bin/env node
// analyze-witnesslearn-20261016.js — judge the sim-witnesslearn pilot gates
// from the landed per-seed JSONs. Pre-registered PRIMARY (binding, a miss
// is NO-GO, never re-scored): witness-reported learning events for the
// hyper-lethal set (eater/spoiler/timeslot + other one-round killers) ≥2
// on treatment vs 0 control. Guardrails: national ≥ control−2, median
// survival ≥ control−10d, no new death mode, field deaths ≤ control+2.
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-witnesslearn');

const files = fs.readdirSync(EVID).filter(f => f.endsWith('.json'));
const rows = files.map(f => JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8')));
const T = rows.filter(r => r.arm === 'treatment');
const C = rows.filter(r => r.arm === 'control');
const sum = (rs, k) => rs.reduce((a, r) => a + (r[k] || 0), 0);
const median = (a) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[(s.length - 1) >> 1] : 0; };

console.log(`runs: treatment ${T.length}, control ${C.length}`);
console.log('');
console.log('== PRIMARY (binding) ==');
console.log('treatment nHyperReports:', sum(T, 'nHyperReports'), '| control nHyperReports:', sum(C, 'nHyperReports'));
console.log('treatment nHyperCoreReports (eater/spoiler/timeslot):', sum(T, 'nHyperCoreReports'), '| control:', sum(C, 'nHyperCoreReports'));
console.log('treatment nWitnessReports (all species):', sum(T, 'nWitnessReports'), '| control:', sum(C, 'nWitnessReports'));
console.log('treatment nWitnessDiscovered:', sum(T, 'nWitnessDiscovered'), '| control:', sum(C, 'nWitnessDiscovered'));
const spT = {};
for (const r of T) for (const [k, v] of Object.entries(r.witnessBySpecies || {})) spT[k] = (spT[k] || 0) + v;
console.log('treatment witnessBySpecies:', JSON.stringify(spT));
const spC = {};
for (const r of C) for (const [k, v] of Object.entries(r.witnessBySpecies || {})) spC[k] = (spC[k] || 0) + v;
console.log('control witnessBySpecies:', JSON.stringify(spC));
const primary = sum(T, 'nHyperReports') >= 2 && sum(C, 'nHyperReports') === 0;
console.log('PRIMARY:', primary ? 'GO' : 'NO-GO', `(need treatment ≥2, control =0)`);
console.log('');
console.log('== GUARDRAILS ==');
console.log('national: treatment', sum(T, 'national'), '| control', sum(C, 'national'), '| bar ≥', sum(C, 'national') - 2, sum(T, 'national') >= sum(C, 'national') - 2 ? 'HOLD' : 'BREACH');
console.log('median days: treatment', median(T.map(r => r.days)), '| control', median(C.map(r => r.days)), '| bar ≥', median(C.map(r => r.days)) - 10, median(T.map(r => r.days)) >= median(C.map(r => r.days)) - 10 ? 'HOLD' : 'BREACH');
console.log('field deaths: treatment', sum(T, 'fieldDeaths'), '| control', sum(C, 'fieldDeaths'), '| bar ≤', sum(C, 'fieldDeaths') + 2, sum(T, 'fieldDeaths') <= sum(C, 'fieldDeaths') + 2 ? 'HOLD' : 'BREACH');
// new death modes: causes on treatment absent from control
const cT = {}, cC = {};
for (const r of T) for (const [k, v] of Object.entries(r.deathCauses || {})) cT[k] = (cT[k] || 0) + v;
for (const r of C) for (const [k, v] of Object.entries(r.deathCauses || {})) cC[k] = (cC[k] || 0) + v;
const novel = Object.keys(cT).filter(k => !(k in cC));
console.log('treatment-only death causes:', JSON.stringify(novel), novel.length ? 'BREACH (check: pre-existing rare?)' : 'HOLD');
console.log('');
console.log('== SECONDARIES ==');
console.log('table: treatment', sum(T, 'table'), '| control', sum(C, 'table'));
console.log('won:', sum(T, 'won'), '|', sum(C, 'won'));
console.log('wave4: treatment', sum(T, 'wave4Reached'), '| control', sum(C, 'wave4Reached'));
console.log('wave5: treatment', sum(T, 'wave5Reached'), '| control', sum(C, 'wave5Reached'));
console.log('max days: treatment', Math.max(...T.map(r => r.days)), '| control', Math.max(...C.map(r => r.days)));
console.log('trick executions (witnessExecutions): treatment', sum(T, 'witnessExecutions'), '| control', sum(C, 'witnessExecutions'));
console.log('deaths total: treatment', sum(T, 'deaths'), '| control', sum(C, 'deaths'));
console.log('death causes treatment:', JSON.stringify(cT));
console.log('death causes control:', JSON.stringify(cC));
