#!/usr/bin/env node
// wave3enc-split-20261031.js — idle splitter for the wave3enc sweep.
//
// Reads a JSONL file (one JSON object per line, as printed by
// scripts/wave3enc-sweep-20261031.js) and writes one per-seed JSON
// file per line into <outDir>/leadfeast/s<seed>.json. This process
// loads NO game code, so its clock is real: the resilient writer
// (retry + full-size verification, 0-byte deleted on final failure)
// can actually wait out the container EPERM flap, unlike a retry
// inside a game-loaded process.
//
// Usage: node scripts/wave3enc-split-20261031.js <jsonlFile> <outDir>
'use strict';
const fs = require('fs');
const path = require('path');

const jsonlFile = process.argv[2];
const outDir = process.argv[3];
if (!jsonlFile || !outDir) { console.error('usage: wave3enc-split-20261031.js <jsonlFile> <outDir>'); process.exit(2); }

function sleepSync(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) { /* ignore */ }
}
function writeResilient(fp, payload) {
  let lastErr = null;
  for (let attempt = 1; attempt <= 180; attempt++) {
    try {
      fs.writeFileSync(fp, payload);
      const sz = fs.statSync(fp).size;
      if (sz > 0 && sz === Buffer.byteLength(payload)) return true;
      lastErr = new Error(`short write: ${sz} of ${Buffer.byteLength(payload)} bytes`);
    } catch (e) { lastErr = e; }
    if (attempt % 10 === 0) console.log(`  write ${path.basename(fp)} still waiting out flap (attempt ${attempt}, last: ${lastErr && lastErr.message})`);
    if (attempt < 180) sleepSync(10000);
  }
  try { fs.unlinkSync(fp); } catch (e) {}
  throw lastErr || new Error('write failed');
}

const raw = fs.readFileSync(jsonlFile, 'utf8');
const lines = raw.split('\n').filter(l => l.trim().length > 0);
const dir = path.join(outDir, 'leadfeast');
fs.mkdirSync(dir, { recursive: true });
let wrote = 0;
for (const line of lines) {
  let obj;
  try { obj = JSON.parse(line); } catch (e) { console.error('SPLIT SKIP: unparsable line: ' + String(e.message)); continue; }
  if (obj == null || obj.seed == null) { console.error('SPLIT SKIP: line without seed'); continue; }
  const fp = path.join(dir, `s${obj.seed}.json`);
  const payload = JSON.stringify(obj, null, 1) + '\n';
  writeResilient(fp, payload);
  console.log(`wrote s${obj.seed} (${Buffer.byteLength(payload)} bytes)`);
  wrote++;
}
console.log(`split done: ${wrote}/${lines.length} lines written to ${dir}`);
