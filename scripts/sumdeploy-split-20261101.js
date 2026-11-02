#!/usr/bin/env node
// sumdeploy-split-20261101.js — IDLE SPLITTER (no game load).
// Reads a stdout file from scripts/sumdeploy-replay-20261101.js and
// writes one per-seed JSON per line into evidence/2026-11-02/
// perseed-sumdeploy-a/<prefix>-s<seed>.json. Refuses on duplicate
// seeds or non-sum lines. Run in a FOREGROUND exec, never a
// backgrounded pipe (see muster3-split lesson).
// Usage: node scripts/sumdeploy-split-20261101.js <stdoutfile> <prefix>
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-11-02', 'perseed-sumdeploy-a');
const infile = process.argv[2];
const prefix = process.argv[3];
if (!infile || !prefix) { console.error('usage: sumdeploy-split-20261101.js <stdoutfile> <prefix>'); process.exit(2); }
const lines = fs.readFileSync(infile, 'utf8').split('\n').filter(l => l.trim().length);
const seen = {};
fs.mkdirSync(DIR, { recursive: true });
for (const line of lines) {
  let rec;
  try { rec = JSON.parse(line); } catch (e) { console.error('SKIP non-JSON line: ' + line.slice(0, 120)); continue; }
  if (!rec || typeof rec.seed !== 'number' || !rec.deploy) { console.error('SKIP non-deploy line: ' + line.slice(0, 120)); continue; }
  if (seen[rec.seed]) { console.error('DUPLICATE seed ' + rec.seed); process.exit(2); }
  seen[rec.seed] = true;
  const fp = path.join(DIR, prefix + '-s' + rec.seed + '.json');
  fs.writeFileSync(fp, JSON.stringify(rec.deploy, null, 1) + '\n');
  console.log('wrote ' + fp);
}
console.log('split seeds=' + Object.keys(seen).sort().join(','));
