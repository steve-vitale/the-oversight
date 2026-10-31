#!/usr/bin/env node
// regtable-split-20261031.js — idle splitter for the regtable sweep.
//
// Reads a stdout JSONL file (one JSON object per line, one per seed,
// written by scripts/regtable-sweep-20261031.js) and writes one
// per-seed JSON file per line into <outdir>/leadfeast/s<seed>.json.
// This process loads NO game code, so its file writes are not subject
// to the game-loaded-process write hazard. A failed or short write
// deletes the partial file and exits nonzero — never a 0-byte file
// left standing as data.
//
// Usage: node scripts/regtable-split-20261031.js <jsonl> <outdir>
'use strict';
const fs = require('fs');
const path = require('path');

const jsonl = process.argv[2];
const outdir = process.argv[3];
if (!jsonl || !outdir) { console.error('Usage: regtable-split-20261031.js <jsonl> <outdir>'); process.exit(2); }
const dir = path.join(outdir, 'leadfeast');
fs.mkdirSync(dir, { recursive: true });
const text = fs.readFileSync(jsonl, 'utf8');
const lines = text.split('\n').filter(l => l.trim().length > 0);
if (!lines.length) { console.error('SPLIT STOP: no JSON lines in ' + jsonl); process.exit(2); }
for (const line of lines) {
  let obj;
  try { obj = JSON.parse(line); } catch (e) { console.error('SPLIT STOP: unparsable line: ' + line.slice(0, 120)); process.exit(2); }
  if (!Number.isFinite(obj.seed)) { console.error('SPLIT STOP: line without a seed'); process.exit(2); }
  const fp = path.join(dir, `s${obj.seed}.json`);
  const payload = JSON.stringify(obj, null, 1) + '\n';
  try {
    fs.writeFileSync(fp, payload);
    const sz = fs.statSync(fp).size;
    if (sz === 0 || sz !== Buffer.byteLength(payload)) throw new Error(`short write: ${sz} of ${Buffer.byteLength(payload)} bytes`);
  } catch (e) {
    try { fs.unlinkSync(fp); } catch (e2) {}
    console.error(`SPLIT STOP: s${obj.seed} write failed: ${e.message}`);
    process.exit(2);
  }
  console.log(`split s${obj.seed}: ${Buffer.byteLength(payload)} bytes -> ${fp}`);
}
console.log(`split done: ${lines.length} seeds`);
