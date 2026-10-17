#!/usr/bin/env node
// scripts/analyze-capdoor-20261017.js — verdict for the sim-capdoor-b sweep.
// Reads evidence/2026-10-17/perseed-capdoor/{control,armed}/*.json, prints
// the before/after table and judges the run against its pre-registration
// (evidence/2026-10-17/sim-capdoor-b.md, docs/MEASUREMENT.md §14).
'use strict';
const fs = require('fs');
const path = require('path');
const BASE = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-capdoor');

function load(side) {
  const dir = path.join(BASE, side);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => {
    try { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { return null; }
  }).filter(Boolean);
}
function median(xs) {
  if (!xs.length) return 0;
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function sum(xs) { return xs.reduce((a, b) => a + b, 0); }

const control = load('control'), armed = load('armed');
console.log(`== sim-capdoor-b verdict: control n=${control.length} armed n=${armed.length} ==`);
if (!control.length || !armed.length) { console.log('INCOMPLETE — both sides needed.'); process.exit(2); }

const agg = (rows) => ({
  phantom: rows.map(r => r.phantom),
  evap: rows.map(r => r.phantomEvap || 0),
  windfall: rows.map(r => r.phantomWindfall || 0),
  refused: rows.map(r => r.refusedKcal),
  beats: sum(rows.map(r => r.voiceBeats)),
  calls: sum(rows.map(r => r.surplusCalls)),
  national: sum(rows.map(r => r.national)),
  table: sum(rows.map(r => r.table)),
  wins: sum(rows.map(r => r.wins)),
  wave4: sum(rows.map(r => r.wave4)),
  wave5: sum(rows.map(r => r.wave5)),
  surv: rows.map(r => r.gameDays),
  starved: rows.map(r => r.starvedDays),
  exiled: sum(rows.map(r => r.exiled)),
  freeloadGossip: rows.map(r => r.freeloadGossip || 0),
  freeloadWarning: rows.map(r => r.freeloadWarning || 0),
  freeloadVote: rows.map(r => r.freeloadVote || 0),
  deaths: (() => { const d = {}; for (const r of rows) for (const [k, v] of Object.entries(r.deaths || {})) d[k] = (d[k] || 0) + v; return d; })(),
});
const C = agg(control), A = agg(armed);
const n = control.length;
const fmt = (x) => (x >= 0 ? '+' : '') + Math.round(x).toLocaleString('en-US');

console.log('\n-- cap-door instrument --');
console.log(`control evap/run (recorded, never received): min ${fmt(Math.min(...C.evap))} med ${fmt(median(C.evap))} max ${fmt(Math.max(...C.evap))} total ${fmt(sum(C.evap))}`);
console.log(`control windfall/run (received, never recorded): med ${fmt(median(C.windfall))} total ${fmt(sum(C.windfall))}`);
console.log(`armed   evap/run: max ${fmt(Math.max(...A.evap.map(Math.abs)))} (must be 0) | windfall/run: max ${fmt(Math.max(...A.windfall.map(Math.abs)))} (must be 0)`);
console.log(`armed refused total: ${fmt(sum(A.refused))} kcal over ${A.calls} surplus calls; voice beats fired: ${A.beats}`);
console.log(`control surplus calls: ${C.calls}`);

console.log('\n-- wall numbers (control vs armed) --');
console.log(`national: ${C.national} vs ${A.national} | table: ${C.table} vs ${A.table} | wins: ${C.wins} vs ${A.wins}`);
console.log(`wave4: ${C.wave4} vs ${A.wave4} | wave5: ${C.wave5} vs ${A.wave5}`);
console.log(`median survival: ${median(C.surv).toFixed(1)}d vs ${median(A.surv).toFixed(1)}d (max ${Math.max(...C.surv)} vs ${Math.max(...A.surv)})`);
console.log(`starvedDays total: ${sum(C.starved)} vs ${sum(A.starved)} | exiled runs: ${C.exiled} vs ${A.exiled}`);
console.log(`freeloader stages (gossip/warning/vote): ${sum(C.freeloadGossip||[])}/${sum(C.freeloadWarning||[])}/${sum(C.freeloadVote||[])} vs ${sum(A.freeloadGossip||[])}/${sum(A.freeloadWarning||[])}/${sum(A.freeloadVote||[])}`);

console.log('\n-- death causes (control vs armed) --');
const causes = new Set([...Object.keys(C.deaths), ...Object.keys(A.deaths)]);
for (const k of [...causes].sort()) console.log(`  ${k}: ${C.deaths[k] || 0} vs ${A.deaths[k] || 0}`);

console.log('\n-- §14 verdict --');
const verdicts = [];
const armedEvapZero = A.evap.every(p => p === 0);
const armedWindZero = A.windfall.every(p => p === 0);
verdicts.push([armedEvapZero && armedWindZero, 'PRIMARY armed evap==0 and windfall==0 on all 16 runs', `maxEvap=${fmt(Math.max(...A.evap))} maxWind=${fmt(Math.max(...A.windfall))}`]);
const medCEvap = median(C.evap);
verdicts.push([medCEvap >= 100000, 'BLANK-EXISTENCE median control evap>=100k', `median=${fmt(medCEvap)}`]);
verdicts.push([A.national >= C.national - 2, 'national >= control-2', `${A.national} vs ${C.national}`]);
verdicts.push([median(A.surv) >= median(C.surv) - 10, 'median survival >= control-10d', `${median(A.surv).toFixed(1)} vs ${median(C.surv).toFixed(1)}`]);
verdicts.push([sum(A.starved) <= sum(C.starved) + 2, 'starvation <= control+2', `${sum(A.starved)} vs ${sum(C.starved)}`]);
const newModes = [...causes].filter(k => (A.deaths[k] || 0) >= 2 && !(C.deaths[k] || 0));
verdicts.push([newModes.length === 0, 'no new death-cause mode on armed', newModes.length ? newModes.join(',') : 'none']);
let allGo = true;
for (const [ok, name, detail] of verdicts) {
  console.log(`  ${ok ? 'GO  ' : 'NO-GO'} ${name} (${detail})`);
  if (!ok) allGo = false;
}
console.log(allGo ? '\nVERDICT: GO — lever lands.' : '\nVERDICT: NO-GO — kill protocol.');
process.exit(allGo ? 0 : 1);
