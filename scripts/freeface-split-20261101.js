#!/usr/bin/env node
// freeface-split-20261101.js — idle splitter for freeface-sweep stdout.
// Reads a sweep.stdout file (one {"seed","out"} JSON line per seed),
// writes evidence/2026-11-01/perseed-freeface/leadfeast/s<seed>.json
// per seed. Pure file work: run it in a plain node process, never
// inside a game-loaded process.
// Usage: node scripts/freeface-split-20261101.js <stdout-file>
'use strict';
const fs = require('fs');
const path = require('path');
const src = process.argv[2];
if (!src) { console.error('usage: freeface-split-20261101.js <stdout-file>'); process.exit(2); }
const outDir = path.join(__dirname, '..', 'evidence', '2026-11-01', 'perseed-freeface', 'leadfeast');
fs.mkdirSync(outDir, { recursive: true });
const lines = fs.readFileSync(src, 'utf8').split('\n').filter(l => l.trim().length);
let n = 0;
for (const line of lines) {
  const row = JSON.parse(line);
  const out = row.out;
  fs.writeFileSync(path.join(outDir, 's' + row.seed + '.json'), JSON.stringify(out, null, 2) + '\n');
  n++;
}
console.log('split ' + n + ' seeds into ' + outDir);
