#!/usr/bin/env node
// arrears-route-split-20261102.js — IDLE SPLITTER (no game load).
// Reads a stdout file from scripts/arrears-route-replay-20261102.js
// and writes one per-seed JSON per line into evidence/2026-11-02/
// perseed-arrears-route-a/<prefix>-s<seed>.json. Refuses on duplicate
// seeds or non-ar lines. Run in a FOREGROUND exec, never a
// backgrounded pipe (see muster3-split lesson).
// Usage: node scripts/arrears-route-split-20261102.js <stdoutfile> <prefix>
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-11-02', 'perseed-arrears-route-a');
const infile = process.argv[2];
const prefix = process.argv[3];
if (!infile || !prefix) { console.error('usage: arrears-route-split-20261102.js <stdoutfile> <prefix>'); process.exit(2); }
const lines = fs.readFileSync(infile, 'utf8').split('\n').filter(l => l.trim().length);
const seen = {};
fs.mkdirSync(DIR, { recursive: true });
for (const line of lines) {
  let rec;
  try { rec = JSON.parse(line); } catch (e) { console.error('SKIP non-JSON line: ' + line.slice(0, 120)); continue; }
  if (!rec || typeof rec.seed !== 'number' || !rec.ar) { console.error('SKIP non-ar line: ' + line.slice(0, 120)); continue; }
  if (seen[rec.seed]) { console.error('DUPLICATE seed ' + rec.seed); process.exit(2); }
  seen[rec.seed] = true;
  const fp = path.join(DIR, prefix + '-s' + rec.seed + '.json');
  fs.writeFileSync(fp, JSON.stringify(rec.ar, null, 1) + '\n');
  console.log('wrote ' + fp);
}
console.log('split seeds=' + Object.keys(seen).sort().join(','));
