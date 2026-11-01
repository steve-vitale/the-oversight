#!/usr/bin/env node
// sim-muster-a-split.js — split a sim-muster-a sweep stdout file into
// per-seed JSONs. Needed because the judged sweep's separator was a
// literal backslash-n (sweep bug, fixed after the sweep): the reused
// vet2mfg splitter splits on real newlines and cannot parse that
// file. This splitter scans tracking JSON string escapes + brace
// depth and emits each top-level object, so it parses BOTH the
// literal-separator file and a correctly newline-separated file.
// Plain node, no game loaded. Writes <evid-dir>/s<seed>.json
// (pretty-printed, same shape as the reused splitter's output).
//   node scripts/sim-muster-a-split.js <stdout.jsonl> <evid-dir>
'use strict';
const fs = require('fs');
const path = require('path');
const src = process.argv[2], evid = process.argv[3];
if (!src || !evid) { console.error('Usage: node scripts/sim-muster-a-split.js <stdout.jsonl> <evid-dir>'); process.exit(2); }
const txt = fs.readFileSync(src, 'utf8');
const objs = [];
let depth = 0, inStr = false, esc = false, start = -1;
for (let i = 0; i < txt.length; i++) {
  const c = txt[i];
  if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue; }
  if (c === '"') { inStr = true; continue; }
  if (c === '{') { if (depth === 0) start = i; depth++; }
  else if (c === '}') { depth--; if (depth === 0 && start >= 0) { objs.push(JSON.parse(txt.slice(start, i + 1))); start = -1; } }
}
if (depth !== 0) { console.error('SPLIT STOP: unbalanced braces'); process.exit(2); }
fs.mkdirSync(evid, { recursive: true });
const seen = new Set();
for (const o of objs) {
  if (!Number.isFinite(o.seed)) { console.error('SPLIT STOP: stdout object without a seed.'); process.exit(2); }
  if (seen.has(o.seed)) { console.error(`SPLIT STOP: duplicate seed ${o.seed}.`); process.exit(2); }
  seen.add(o.seed);
  fs.writeFileSync(path.join(evid, `s${o.seed}.json`), JSON.stringify(o, null, 1) + '\n');
  console.log(`wrote s${o.seed}`);
}
console.log(`split done: ${seen.size} seeds -> ${evid}`);
