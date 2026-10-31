#!/usr/bin/env node
// vet2-split-20261031.js — split a vet2 sweep stdout file into per-seed
// JSONs. IDLE process: plain node, no game loaded, so real sleeps work
// and the EPERM flap can be waited out (resilient writer, same pattern
// as wavegate-sweep's post-run writer: 180 x 10s, full-size verify,
// 0-byte file deleted on final failure so no 0-byte file ever stands
// as data).
//
// Usage: node scripts/vet2-split-20261031.js <stdout.jsonl> <evid-dir>
// Writes <evid-dir>/leadfeast/s<seed>.json, one per stdout line.
// Fails loudly on a duplicate seed, an unparsable line, or a line
// without a seed (never silently drops a seed).
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const src = process.argv[2];
const evid = process.argv[3];
if (!src || !evid) { console.error('Usage: node scripts/vet2-split-20261031.js <stdout.jsonl> <evid-dir>'); process.exit(2); }
const text = fs.readFileSync(src, 'utf8');
const lines = text.split('\n').filter(l => l.trim().length > 0);
const outDir = path.join(evid, 'leadfeast');
fs.mkdirSync(outDir, { recursive: true });

function resilientWrite(fp, payload) {
  let written = false, lastErr = null;
  for (let attempt = 1; attempt <= 180 && !written; attempt++) {
    try {
      fs.writeFileSync(fp, payload);
      const sz = fs.statSync(fp).size;
      if (sz > 0 && sz === Buffer.byteLength(payload)) written = true;
      else lastErr = new Error(`short write: ${sz} of ${Buffer.byteLength(payload)} bytes`);
    } catch (e) { lastErr = e; }
    if (!written) {
      if (attempt % 10 === 0) console.log(`  write ${fp} still waiting out flap (attempt ${attempt}, last: ${lastErr && lastErr.message})`);
      if (attempt < 180) { try { execSync('sleep 10'); } catch (e) {} }
    }
  }
  if (!written) { try { fs.unlinkSync(fp); } catch (e) {} throw lastErr || new Error('write failed'); }
}

const seen = new Set();
for (const line of lines) {
  let obj;
  try { obj = JSON.parse(line); } catch (e) { console.error('SPLIT STOP: unparsable stdout line: ' + line.slice(0, 200)); process.exit(2); }
  if (!obj || !Number.isFinite(obj.seed)) { console.error('SPLIT STOP: stdout line without a seed.'); process.exit(2); }
  if (seen.has(obj.seed)) { console.error(`SPLIT STOP: duplicate seed ${obj.seed} in stdout.`); process.exit(2); }
  seen.add(obj.seed);
  const fp = path.join(outDir, `s${obj.seed}.json`);
  resilientWrite(fp, JSON.stringify(obj, null, 1) + '\n');
  console.log(`wrote s${obj.seed} (${Buffer.byteLength(JSON.stringify(obj, null, 1) + '\n')} bytes)`);
}
console.log(`split done: ${seen.size} seeds -> ${outDir}`);
