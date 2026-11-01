#!/usr/bin/env node
// vet2mfg-det-compare.js — recorder-neutrality comparison for the
// vet2mfg det leg: ON (all recorders + funnel capture) vs OFF (bare
// substrate) JSONs for the same seed must agree on end fields.
//
// Usage: node scripts/vet2mfg-det-compare.js <on.json> <off.json>
// Exit 0 on PASS, 1 on FAIL. Prints the compared fields.
'use strict';
const fs = require('fs');
const a = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const b = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const FIELDS = ['days', 'gameDays', 'won', 'national', 'table', 'maxWave', 'endScaleRank', 'endReason'];
let ok = true;
for (const f of FIELDS) {
  const same = JSON.stringify(a[f]) === JSON.stringify(b[f]);
  if (!same) ok = false;
  console.log(`  ${f}: ON=${JSON.stringify(a[f])} OFF=${JSON.stringify(b[f])} ${same ? 'same' : 'DIFFERS'}`);
}
console.log(`DET-COMPARE seed=${a.seed} -> ${ok ? 'PASS' : 'FAIL'}`);
if (!ok) process.exit(1);
