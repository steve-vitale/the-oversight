#!/usr/bin/env node
// dangerfit-split-20261031.js — idle splitter for the dangerfit runner.
// Reads a stdout JSONL file (one per-seed JSON per line), writes one
// s<seed>.json per line into the target corpus directory. No game code
// loaded, no RNG, no state — safe to run after (never during) a sweep.
// Usage: node scripts/dangerfit-split-20261031.js <stdout.log> <corpusDir>
'use strict';
const fs = require('fs');
const path = require('path');
const src = process.argv[2], dir = process.argv[3];
if (!src || !dir) { console.error('usage: dangerfit-split-20261031.js <stdout.log> <corpusDir>'); process.exit(2); }
const text = fs.readFileSync(src, 'utf8');
const lines = text.split('\n').filter(l => l.trim().length > 0);
fs.mkdirSync(dir, { recursive: true });
const seen = new Set();
for (const line of lines) {
  let j;
  try { j = JSON.parse(line); } catch (e) { console.error('SPLIT STOP: unparseable stdout line: ' + e.message); process.exit(2); }
  if (!Number.isSafeInteger(j.seed)) { console.error('SPLIT STOP: line without integer seed'); process.exit(2); }
  if (seen.has(j.seed)) { console.error('SPLIT STOP: duplicate seed ' + j.seed); process.exit(2); }
  seen.add(j.seed);
  fs.writeFileSync(path.join(dir, `s${j.seed}.json`), JSON.stringify(j, null, 1) + '\n');
}
console.log(`split ${seen.size} seed(s) into ${dir}: ${[...seen].sort((a, b) => a - b).join(',')}`);
