#!/usr/bin/env node
// scripts/analyze-foragelead-b.js — census analysis for the forage-stream
// attribution audit. Reads evidence/2026-10-17/perseed-foragelead/*.json
// (full per-seed dumps) and prints the evidence tables:
//   1. bucket attribution (events/kcal, named residual check)
//   2. the 893 mirror: dutyForage via|taskIn[->taskOut] vs policy assigns
//   3. taskLeads occupancy (mechanism from state)
//   4. forager occupation profile (kcal-weighted) vs day-0 roster baseline
//   5. forage share of pantry inflow; kcal per forager-day by bucket
//   6. wall numbers: national/table/wins, wave 4-5, median survival,
//      death-cause shares, starved days
// Writes corpus-summary.json next to the per-seed JSONs.
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-foragelead');
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json') && !f.startsWith('wall-') && f !== 'corpus-summary.json');
const rows = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));

const sum = (a) => a.reduce((t, x) => t + x, 0);
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };

console.log(`corpus: ${rows.length} seeds x policies`);

// ---- 1. bucket attribution ----
const byBucket = {};
for (const r of rows) for (const e of r.forage) {
  byBucket[e.bucket] = byBucket[e.bucket] || { events: 0, kcal: 0, vids: new Set() };
  byBucket[e.bucket].events++;
  byBucket[e.bucket].kcal += (e.kcal || 0);
  if (e.vid) byBucket[e.bucket].vids.add(e.vid);
}
console.log('\n=== 1. forage buckets: events / kcal / distinct foragers ===');
let totE = 0, totK = 0;
for (const k of Object.keys(byBucket).sort()) {
  totE += byBucket[k].events; totK += byBucket[k].kcal;
  console.log(`  ${k}: ${byBucket[k].events} ev / ${byBucket[k].kcal} kcal / ${byBucket[k].vids.size} foragers`);
}
console.log(`  TOTAL: ${totE} ev / ${totK} kcal`);
const uncl = rows.reduce((t, r) => t + (r.unclassified || 0), 0);
console.log(`  named residual (unclassified-forage): ${uncl} (must be 0)`);

// ---- 2. the 893 mirror ----
const byVia = {};
for (const r of rows) for (const e of r.dutyForage) {
  const k = `${e.via}|${e.taskIn}${e.taskIn !== e.taskOut ? '->' + e.taskOut : ''}`;
  byVia[k] = (byVia[k] || 0) + 1;
}
console.log('\n=== 2. dutyForage resolutions via|taskIn[->taskOut] ===');
for (const k of Object.keys(byVia).sort()) console.log(`  ${k}: ${byVia[k]}`);
const forageAssigns = rows.reduce((t, r) => t + r.assigns.filter(e => e.task === 'forage').length, 0);
const allAssigns = {};
for (const r of rows) for (const e of r.assigns) allAssigns[e.task] = (allAssigns[e.task] || 0) + 1;
console.log(`  policy forage assignTask attempts: ${forageAssigns}`);
console.log(`  policy assign mix: ${Object.keys(allAssigns).sort().map(k => `${k}=${allAssigns[k]}`).join(' ')}`);

// ---- 3. taskLeads occupancy ----
let leadDays = 0, forageLeadDays = 0, sampledDays = 0;
const leadTasks = {};
for (const r of rows) for (const s of (r.leads || [])) {
  sampledDays++;
  if (s.entries.length) leadDays++;
  for (const e of s.entries) {
    leadTasks[e.task] = (leadTasks[e.task] || 0) + 1;
    if (e.task === 'forage') forageLeadDays++;
  }
}
console.log('\n=== 3. taskLeads occupancy (sampled ~every 10d) ===');
console.log(`  sampled day-slices: ${sampledDays}; with any lead: ${leadDays} (${(100 * leadDays / Math.max(1, sampledDays)).toFixed(1)}%)`);
console.log(`  with a FORAGE lead: ${forageLeadDays} (${(100 * forageLeadDays / Math.max(1, sampledDays)).toFixed(1)}%)`);
console.log(`  lead domains: ${Object.keys(leadTasks).sort().map(k => `${k}=${leadTasks[k]}`).join(' ')}`);

// ---- 4. forager occupation profile (kcal-weighted) vs roster baseline ----
const foragerKcal = {};
const rosterBase = {};
for (const r of rows) {
  for (const [occ, n] of Object.entries(r.rosterOccDay0 || {})) rosterBase[occ] = (rosterBase[occ] || 0) + n;
  for (const e of r.forage) {
    if (!e.occ || e.bucket.startsWith('player:')) continue;
    foragerKcal[e.occ] = (foragerKcal[e.occ] || 0) + (e.kcal || 0);
  }
}
console.log('\n=== 4. forager occupations (kcal-weighted, villager-side only) vs roster baseline ===');
const totFK = sum(Object.values(foragerKcal)) || 1;
const totR = sum(Object.values(rosterBase)) || 1;
for (const occ of Object.keys(foragerKcal).sort((a, b) => foragerKcal[b] - foragerKcal[a]).slice(0, 15)) {
  console.log(`  ${occ}: ${(100 * foragerKcal[occ] / totFK).toFixed(1)}% of forage kcal | ${(100 * (rosterBase[occ] || 0) / totR).toFixed(1)}% of roster`);
}

// ---- 5. forage share of inflow; kcal per forager-day ----
let inflowKcal = 0, forageKcal = totK;
for (const r of rows) for (const d of Object.keys(r.inflow || {})) for (const n of Object.keys(r.inflow[d])) inflowKcal += r.inflow[d][n];
const inflowNames = {};
for (const r of rows) for (const d of Object.keys(r.inflow || {})) for (const n of Object.keys(r.inflow[d])) inflowNames[n] = (inflowNames[n] || 0) + r.inflow[d][n];
console.log('\n=== 5. forage share of pantry inflow ===');
console.log(`  forage ${forageKcal} kcal / total inflow ${inflowKcal} kcal = ${(100 * forageKcal / Math.max(1, inflowKcal)).toFixed(1)}%`);
console.log('  top inflow names: ' + Object.keys(inflowNames).sort((a, b) => inflowNames[b] - inflowNames[a]).slice(0, 8).map(n => `${n}=${inflowNames[n]}`).join(' '));
const foragerDays = {};
for (const r of rows) for (const e of r.forage) {
  if (e.vid && !e.bucket.startsWith('player:')) {
    const k = `${e.bucket}`;
    foragerDays[k] = foragerDays[k] || { fd: new Set(), kcal: 0 };
    foragerDays[k].fd.add(`${r.seed}-${r.policy}-${e.vid}-${e.day}`);
    foragerDays[k].kcal += (e.kcal || 0);
  }
}
console.log('  kcal per forager-day (identity-bearing buckets):');
for (const k of Object.keys(foragerDays).sort()) {
  const f = foragerDays[k];
  console.log(`    ${k}: ${f.kcal} kcal / ${f.fd.size} forager-days = ${(f.kcal / Math.max(1, f.fd.size)).toFixed(0)} kcal/fd`);
}
// events/day + kcal/day across the corpus
const daysSum = sum(rows.map(r => r.days || 0));
console.log(`  corpus: ${totE} events / ${daysSum} run-days = ${(totE / Math.max(1, daysSum)).toFixed(2)} forage events/day; ${Math.round(totK / Math.max(1, daysSum))} forage kcal/day`);

// ---- 6. wall ----
const wall = { national: 0, table: 0, wins: 0, wave4: 0, wave5: 0, exiled: 0 };
const surv = [], starved = [];
const deathCauses = {};
for (const r of rows) {
  if (r.wall.maxRank >= 2) wall.national++;
  if (r.wall.table) wall.table++;
  if (r.wall.wins) wall.wins++;
  if (r.wall.maxWave >= 4) wall.wave4++;
  if (r.wall.maxWave >= 5) wall.wave5++;
  if (r.wall.exiled) wall.exiled++;
  if (r.days) surv.push(r.days);
  starved.push(r.wall.starvedDays || 0);
  for (const d of (r.deaths || [])) { const c = d.cause || 'unknown'; deathCauses[c] = (deathCauses[c] || 0) + 1; }
}
console.log(`\n=== 6. wall (${rows.length} runs) ===`);
console.log(`  national=${wall.national} table=${wall.table} wins=${wall.wins} exiled=${wall.exiled} wave4=${wall.wave4} wave5=${wall.wave5}`);
console.log(`  median survival=${med(surv)}d max=${Math.max(...surv, 0)}d; starved-days total=${sum(starved)}`);
const totD = sum(Object.values(deathCauses));
console.log(`  deaths=${totD}: ` + Object.keys(deathCauses).sort((a, b) => deathCauses[b] - deathCauses[a]).slice(0, 10).map(c => `${c}=${deathCauses[c]}`).join(' '));

// ---- sense-test candidates: forage-rich days ----
const beatDays = {};
for (const r of rows) for (const b of (r.beats || [])) {
  const k = `${r.policy}-${r.seed}|${b.day}`;
  beatDays[k] = beatDays[k] || { beats: [], kcal: 0 };
  beatDays[k].beats.push(b.text);
  if (beatDays[k].beats.length > 40) beatDays[k].beats.splice(0, 10);
}
for (const r of rows) for (const e of r.forage) {
  const k = `${r.policy}-${r.seed}|${e.day}`;
  if (beatDays[k]) beatDays[k].kcal += (e.kcal || 0);
}
const ranked = Object.keys(beatDays).map(k => ({ k, n: beatDays[k].beats.length, kcal: beatDays[k].kcal }))
  .sort((a, b) => b.n - a.n).slice(0, 5);
console.log('\n=== 7. sense-test candidates (most forage beats) ===');
for (const c of ranked) console.log(`  ${c.k}: ${c.n} beats, ${c.kcal} forage kcal`);

const summary = {
  schema: 'foragelead-corpus/1', runs: rows.length, seeds: [...new Set(rows.map(r => r.seed))].sort(),
  buckets: Object.fromEntries(Object.keys(byBucket).sort().map(k => [k, { events: byBucket[k].events, kcal: byBucket[k].kcal, foragers: byBucket[k].vids.size }])),
  unclassified: uncl,
  dutyForageByVia: byVia, policyForageAssignAttempts: forageAssigns,
  taskLeads: { sampledDays, leadDays, forageLeadDays, leadTasks },
  forageShareOfInflow: inflowKcal > 0 ? forageKcal / inflowKcal : null,
  forageKcal, inflowKcal,
  kcalPerForagerDay: Object.fromEntries(Object.keys(foragerDays).sort().map(k => [k, { kcal: foragerDays[k].kcal, foragerDays: foragerDays[k].fd.size }])),
  wall: Object.assign({}, wall, { medianSurvival: med(surv), maxSurvival: Math.max(...surv, 0), starvedDays: sum(starved), deathCauses }),
  senseCandidates: ranked.map(c => c.k),
};
fs.writeFileSync(path.join(DIR, 'corpus-summary.json'), JSON.stringify(summary, null, 1));
console.log('\nwrote corpus-summary.json');
