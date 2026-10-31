#!/usr/bin/env node
// vet2-det-compare-20261031.js — det-gate comparison for sim-vet2-a.
// Compares one seed's ON leg (VET2=1) vs OFF leg (VET2 unset) stdout
// lines: dayHash arrays + end fields must be byte-identical.
// Usage: node scripts/vet2-det-compare-20261031.js <on.jsonl> <off.jsonl> <seed>
'use strict';
const fs = require('fs');
function load(fp, seed) {
  const lines = fs.readFileSync(fp, 'utf8').split('\n').filter(l => l.trim());
  for (const line of lines) {
    const o = JSON.parse(line);
    if (o.seed === seed) return o;
  }
  throw new Error(`seed ${seed} not found in ${fp}`);
}
const [onFp, offFp, seedArg] = process.argv.slice(2);
const seed = parseInt(seedArg, 10);
const on = load(onFp, seed), off = load(offFp, seed);
const fields = ['gameDays', 'won', 'national', 'table', 'maxWave', 'endScaleRank', 'endReason'];
let ok = true;
if (JSON.stringify(on.hashes) !== JSON.stringify(off.hashes)) {
  ok = false;
  console.log(`  hashes differ: on ${on.hashes.length} vs off ${off.hashes.length}`);
} else console.log(`  hashes identical (${on.hashes.length})`);
for (const f of fields) {
  if (on[f] !== off[f]) { ok = false; console.log(`  field ${f} differs: on=${on[f]} off=${off[f]}`); }
  else console.log(`  field ${f} identical (${on[f]})`);
}
console.log(ok ? `DET PASS seed ${seed}` : `DET FAIL seed ${seed}`);
process.exit(ok ? 0 : 1);
