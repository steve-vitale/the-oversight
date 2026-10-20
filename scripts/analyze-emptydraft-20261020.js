#!/usr/bin/env node
// analyze-emptydraft-20261020.js — taxonomy aggregator for the
// empty-draft census (sim-emptydraft diagnostic, 2026-10-20).
//
// Reads evidence/2026-10-20/perseed-emptydraft/census/*/*.json and
// prints: raid-night totals, zero-defender share, per-category
// composition means at raid-night, the attribution taxonomy table for
// unmet nights, and the unexplained-night count (GO gate: 0).
//
// Usage: node scripts/analyze-emptydraft-20261020.js
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-emptydraft', 'census');

function readAll() {
  const runs = [];
  if (!fs.existsSync(DIR)) { console.error('no census dir', DIR); process.exit(1); }
  for (const pol of fs.readdirSync(DIR)) {
    const pd = path.join(DIR, pol);
    if (!fs.statSync(pd).isDirectory()) continue;
    for (const f of fs.readdirSync(pd)) {
      if (!f.endsWith('.json')) continue;
      runs.push(JSON.parse(fs.readFileSync(path.join(pd, f), 'utf8')));
    }
  }
  return runs;
}

const runs = readAll();
let nights = 0, zeroDef = 0, unmetTotal = 0, engagedTotal = 0, raidersTotal = 0;
const attrCounts = {};
const compSums = { away: 0, sheltered: 0, wounded: 0, benched: 0, engaged: 0, player: 0 };
let unexplained = 0;
const perRun = [];

for (const r of runs) {
  const rns = r.raidNights || [];
  let rZero = 0;
  for (const rn of rns) {
    nights++;
    unmetTotal += rn.unmet; engagedTotal += rn.engaged; raidersTotal += rn.raiders;
    for (const k of Object.keys(compSums)) compSums[k] += (rn.counts && rn.counts[k]) || 0;
    if (rn.attribution === 'unexplained' || /unknown-category/.test(rn.attribution)) unexplained++;
    if (rn.engaged === 0) {
      zeroDef++;
      rZero++;
      attrCounts[rn.attribution] = (attrCounts[rn.attribution] || 0) + 1;
    }
  }
  perRun.push({ pol: r.policyId, seed: r.seed, nights: rns.length, zero: rZero, days: r.gameDays, end: r.endReason });
}

console.log(`runs=${runs.length} raid-nights=${nights}`);
console.log(`zero-defender nights: ${zeroDef} (${nights ? (100 * zeroDef / nights).toFixed(1) : 0}%)`);
console.log(`raiders=${raidersTotal} engaged=${engagedTotal} unmet=${unmetTotal} (unmet share of raiders: ${raidersTotal ? (100 * unmetTotal / raidersTotal).toFixed(1) : 0}%)`);
console.log(`unexplained nights: ${unexplained} (GO gate: 0)`);
console.log('\nmean composition per raid-night (all roster slots):');
for (const k of Object.keys(compSums)) {
  console.log(`  ${k}: ${(nights ? compSums[k] / nights : 0).toFixed(2)}`);
}
console.log('\nattribution taxonomy (zero-defender nights only):');
const sorted = Object.entries(attrCounts).sort((a, b) => b[1] - a[1]);
for (const [a, n] of sorted) {
  console.log(`  ${a}: ${n} (${zeroDef ? (100 * n / zeroDef).toFixed(1) : 0}%)`);
}
console.log('\nper-run:');
for (const p of perRun) console.log(`  ${p.pol} s${p.seed}: nights=${p.nights} zero=${p.zero} days=${p.days} end=${p.end}`);
