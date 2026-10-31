#!/usr/bin/env node
// split-departdiag-jsonl-b.js — reads departdiag JSONL from stdin, writes
// one file per seed into <outdir>, retrying each write rapidly until it
// lands. (EPERM-flap transport: this idle process never loads the game,
// so its Atomics.wait sleeps work normally.)
// Usage: node scripts/split-departdiag-jsonl-b.js <outdir> < input.jsonl
// Validates: each line parses and carries seed + decisions + evenings;
// prints a per-seed OK line to stderr. Exit 3 if a file cannot be
// written within 10 minutes (loud failure, never silent).
'use strict';
const fs = require('fs');
const path = require('path');
const outdir = process.argv[2];
if (!outdir) { console.error('usage: split-departdiag-jsonl-b.js <outdir>'); process.exit(2); }
let buf = '';
function writeWithRetry(filePath, data) {
  const deadline = Date.now() + 10 * 60 * 1000;
  for (;;) {
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, data);
      const back = fs.readFileSync(filePath, 'utf8');
      if (back !== data) throw new Error('readback mismatch');
      JSON.parse(back);
      return true;
    } catch (e) {
      if (Date.now() > deadline) return false;
      try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 200); } catch (e2) {}
    }
  }
}
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { buf += chunk; });
process.stdin.on('end', () => {
  const lines = buf.split('\n').filter((l) => l.trim().length > 0);
  let ok = 0;
  for (const line of lines) {
    let inst;
    try { inst = JSON.parse(line); } catch (e) { console.error('BAD JSON LINE'); process.exit(2); }
    if (typeof inst.seed !== 'number' || !Array.isArray(inst.decisions) || !Array.isArray(inst.evenings)) { console.error('BAD LINE (no seed/decisions/evenings)'); process.exit(2); }
    const name = 'departdiag-b-nighttravel-s' + inst.seed + '.json';
    const fp = path.join(outdir, name);
    if (!writeWithRetry(fp, JSON.stringify(inst))) { console.error('WRITE-FAIL ' + fp); process.exit(3); }
    console.error('split OK ' + name);
    ok++;
  }
  console.error('split done: ' + ok + ' files into ' + outdir);
});
