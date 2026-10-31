#!/usr/bin/env node
// fullseat-det-compare-20261031.js — det-gate comparison for
// sim-fullseat-a (idle process, no game loaded).
// Usage: node scripts/fullseat-det-compare-20261031.js <on.jsonl> <off.jsonl>
// Compares, per seed: dayHash arrays byte-identical (JSON-equal) and
// end fields identical (gameDays, won, national, table, maxWave,
// endScaleRank, endReason). Exits 0 iff all compared seeds pass.
'use strict';
const fs = require('fs');
function load(p) {
  const out = new Map();
  for (const line of fs.readFileSync(p, 'utf8').split('\n').filter(l => l.trim())) {
    const o = JSON.parse(line); out.set(o.seed, o);
  }
  return out;
}
const on = load(process.argv[2]), off = load(process.argv[3]);
let pass = true;
for (const [seed, o] of on) {
  const f = off.get(seed);
  if (!f) { console.log(`s${seed}: OFF leg missing — FAIL`); pass = false; continue; }
  const hashEq = JSON.stringify(o.hashes) === JSON.stringify(f.hashes);
  const ends = ['gameDays', 'won', 'national', 'table', 'maxWave', 'endScaleRank', 'endReason'];
  const endEq = ends.every(k => o[k] === f[k]);
  console.log(`s${seed}: hashes ${hashEq ? 'IDENTICAL' : 'DIFFER'} (${(o.hashes || []).length} vs ${(f.hashes || []).length}) ends ${endEq ? 'IDENTICAL' : 'DIFFER'}`);
  if (!hashEq || !endEq) pass = false;
}
console.log(pass ? 'DET-GATE PASSED' : 'DET-GATE FAILED');
process.exit(pass ? 0 : 1);
