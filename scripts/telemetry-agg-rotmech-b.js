#!/usr/bin/env node
// telemetry-agg-rotmech-b.js — aggregate the rotmech per-seed corpus for
// scripts/telemetry-check.js (same method as sim-retagrot-b4).
// Usage: node scripts/telemetry-agg-rotmech-b.js evidence/2026-10-21/perseed-rotmech-b
'use strict';
const fs = require('fs');
const path = require('path');
const dir = process.argv[2] || 'evidence/2026-10-21/perseed-rotmech-b';
const agg = { national: 0, table: 0, wins: 0, exiled: 0, runs: 0 };
for (const fn of ['leadfeast.json', 'belongfeast.json']) {
  const j = JSON.parse(fs.readFileSync(path.join(dir, fn), 'utf8'));
  for (const r of (j.rows || [])) {
    const e = r.end;
    agg.runs++;
    if (e.nationalLive) agg.national++;
    if (e.won) { agg.wins++; agg.table++; }
  }
}
const out = path.join(dir, 'telemetry-agg.json');
fs.writeFileSync(out, JSON.stringify(agg, null, 1));
console.log(JSON.stringify(agg), '->', out);
