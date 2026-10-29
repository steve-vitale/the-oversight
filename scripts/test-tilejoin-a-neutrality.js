#!/usr/bin/env node
// scripts/test-tilejoin-a-neutrality.js — OFF/ON instrument check for
// the tilejoin recorder (record-only mode must not change game state).
// Usage: node scripts/test-tilejoin-a-neutrality.js <rowWithRecorder>
//   <rowWithoutRecorder>. Compares every field EXCEPT the tilejoin
// store itself and recorder stack-trace metadata (V8 stack strings
// vary with wrapper depth by construction; breakline-a metric review).
// Prints NEUTRALITY-PASS/FAIL; exits 1 on any game-content diff.
'use strict';
const fs = require('fs');

function strip(x) {
  if (Array.isArray(x)) return x.map(strip);
  if (x && typeof x === 'object') {
    const o = {};
    for (const [k, v] of Object.entries(x)) {
      if (k === 'stack') continue;
      o[k] = strip(v);
    }
    return o;
  }
  return x;
}

function diff(a, b, path, out) {
  if (typeof a !== typeof b) { out.push(`${path}: type ${typeof a} vs ${typeof b}`); return; }
  if (Array.isArray(a)) {
    if (a.length !== b.length) { out.push(`${path}: len ${a.length} vs ${b.length}`); return; }
    for (let i = 0; i < a.length; i++) diff(a[i], b[i], `${path}[${i}]`, out);
    return;
  }
  if (a && typeof a === 'object') {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) {
      if (!(k in a)) out.push(`${path}.${k}: missing in A`);
      else if (!(k in b)) out.push(`${path}.${k}: missing in B`);
      else diff(a[k], b[k], `${path}.${k}`, out);
    }
    return;
  }
  if (a !== b) out.push(`${path}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`);
}

function main() {
  const [fileA, fileB] = process.argv.slice(2);
  if (!fileA || !fileB) { console.error('usage: test-tilejoin-a-neutrality.js <rowA> <rowB>'); process.exit(2); }
  const a = JSON.parse(fs.readFileSync(fileA, 'utf8'));
  const b = JSON.parse(fs.readFileSync(fileB, 'utf8'));
  delete a.tilejoin; delete b.tilejoin;
  const sa = strip(a), sb = strip(b);
  const diffs = [];
  diff(sa, sb, 'row', diffs);
  if (diffs.length === 0) { console.log('NEUTRALITY-PASS (0 game-content diffs, stack metadata + tilejoin store excluded)'); return; }
  console.log(`NEUTRALITY-FAIL (${diffs.length} diffs):`);
  for (const d of diffs.slice(0, 30)) console.log('  ' + d);
  process.exit(1);
}
main();
