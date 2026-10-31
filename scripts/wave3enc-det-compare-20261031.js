#!/usr/bin/env node
// wave3enc-det-compare-20261031.js — det-gate comparison for sim-wave3enc-a.
//
// Usage: node scripts/wave3enc-det-compare-20261031.js <onDir> <offDir> <seed...>
// Each dir holds leadfeast/s<seed>.json (splitter output). Compares
// dayHash arrays + end fields (gameDays, won, national, table,
// maxWave, endScaleRank). Exits 0 on full identity, 1 otherwise.
'use strict';
const fs = require('fs');
const path = require('path');
const [onDir, offDir, ...seedArgs] = process.argv.slice(2);
if (!onDir || !offDir || !seedArgs.length) { console.error('usage: wave3enc-det-compare-20261031.js <onDir> <offDir> <seed...>'); process.exit(2); }
let fail = 0;
for (const seed of seedArgs) {
  const on = JSON.parse(fs.readFileSync(path.join(onDir, 'leadfeast', `s${seed}.json`), 'utf8'));
  const off = JSON.parse(fs.readFileSync(path.join(offDir, 'leadfeast', `s${seed}.json`), 'utf8'));
  const hashSame = JSON.stringify(on.hashes) === JSON.stringify(off.hashes);
  const ends = ['gameDays', 'won', 'national', 'table', 'maxWave', 'endScaleRank'];
  const endSame = ends.every(k => JSON.stringify(on[k]) === JSON.stringify(off[k]));
  console.log(`s${seed}: hashes ${hashSame ? 'IDENTICAL' : 'DIFFER'} (${on.hashes.length} vs ${off.hashes.length}) endFields ${endSame ? 'IDENTICAL' : 'DIFFER'} ${JSON.stringify(ends.map(k => [k, on[k], off[k]]))}`);
  if (!hashSame || !endSame) fail = 1;
}
process.exit(fail);
