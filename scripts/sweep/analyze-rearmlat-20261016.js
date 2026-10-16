#!/usr/bin/env node
// scripts/sweep/analyze-rearmlat-20261016.js — pooled analysis for the
// sim-rearmlat-b sweep (loop B, 2026-10-16, food-economy axis; #385/#386).
//
// Reads evidence/2026-10-16/perseed-rearmlat/<policy>-s<seed>.json and
// recomputes the census: PRIMARY GO (attribution rate >= 0.95), re-arm
// latency distribution, meal-driven vs voluntary-take-driven share,
// cold-shoulder trigger agreement rate, wall numbers.
//
// Usage: node scripts/sweep/analyze-rearmlat-20261016.js
// Exits 1 if the PRIMARY GO is missed (a miss is NO-GO, never re-scored).
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', '..', 'evidence', '2026-10-16', 'perseed-rearmlat');

function main() {
  const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json') && f !== 'summary.json');
  const runs = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
  if (runs.length === 0) { console.error('no per-seed JSONs'); process.exit(2); }

  const armed = [], firings = [];
  let attributed = 0, mealDriven = 0, agreed = 0, errRuns = 0;
  for (const r of runs) {
    if ((r.rearm.errors || []).length) errRuns++;
    for (const e of (r.rearm.rearms || []).filter(x => x.rearmed)) {
      armed.push(e); if (e.attributed) attributed++; if (e.driver === 'meal') mealDriven++;
    }
    for (const f of ((r.rearm.coldShoulder || {}).firings || [])) {
      firings.push(f); if (f.agreed7 === true) agreed++;
    }
  }
  const lat = armed.map(e => e.latency).sort((a, b) => a - b);
  const hist = {};
  for (const l of lat) hist[l] = (hist[l] || 0) + 1;
  const days = runs.map(r => r.days).sort((a, b) => a - b);
  const deathCauses = {};
  for (const r of runs) for (const [k, v] of Object.entries(r.deaths || {})) deathCauses[k] = (deathCauses[k] || 0) + v;

  const primaryRate = armed.length ? attributed / armed.length : 0;
  const go = armed.length > 0 && primaryRate >= 0.95;
  const report = {
    nRuns: runs.length,
    instrumentErrors: errRuns,
    primary: { nRearmEvents: armed.length, nAttributed: attributed, rate: +primaryRate.toFixed(4), go },
    latencyDist: { min: lat[0], max: lat[lat.length - 1], median: lat[Math.floor(lat.length / 2)], hist },
    drivers: { mealDriven, voluntaryDriven: armed.length - mealDriven,
      mealShare: armed.length ? +(mealDriven / armed.length).toFixed(4) : null },
    coldShoulder: { nFirings: firings.length, nAgreed7: agreed,
      agreementRate7: firings.length ? +(agreed / firings.length).toFixed(4) : null },
    wall: {
      national: runs.reduce((s, r) => s + (r.national || 0), 0),
      table: runs.reduce((s, r) => s + (r.table || 0), 0),
      wins: runs.reduce((s, r) => s + (r.wins || 0), 0),
      exiled: runs.reduce((s, r) => s + (r.exiled || 0), 0),
      wave4: runs.filter(r => r.maxWave >= 4).length,
      wave5: runs.filter(r => r.maxWave >= 5).length,
      medianSurvival: days[Math.floor(days.length / 2)], maxSurvival: days[days.length - 1],
    },
    deathCauses,
  };
  console.log(JSON.stringify(report, null, 1));
  console.log(go ? '\nPRIMARY GO: PASS' : '\nPRIMARY GO: MISS (NO-GO)');
  process.exit(go ? 0 : 1);
}
main();
