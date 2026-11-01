#!/usr/bin/env node
// contactfinish-relay-20261031.js — fresh-process relay for the
// contactfinish sweep (flap response, 2026-11-01).
//
// WHY THIS EXISTS: on 2026-11-01 the container's EPERM write flap
// became process-scoped in practice — a game-loaded sweep process
// failed every file write for 30+ consecutive attempts while fresh
// processes wrote the exact same paths fine. So the game-loaded
// sweep must NEVER write files: it prints JSON lines to stdout
// (a pipe, which works), and THIS fresh process (no game loaded)
// reads stdin and writes the per-seed files with the splitter's
// resilient writer (retry + full-size verification).
//
// Usage: node scripts/contactfinish-sweep-20261031.js [env] \
//   | node scripts/contactfinish-relay-20261031.js
// OUTDIR env (default: evidence/2026-10-31/
// perseed-contactfinish-lever-pilot) is the per-seed dir root.
// Progress goes to stderr; stdout stays empty.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const OUTDIR = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-10-31', 'perseed-contactfinish-lever-pilot');

function sleepSync(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {}
}
function writeResilient(fp, payload) {
  let lastErr = null;
  for (let attempt = 1; attempt <= 180; attempt++) {
    try {
      fs.writeFileSync(fp, payload);
      const sz = fs.statSync(fp).size;
      if (sz > 0 && sz === Buffer.byteLength(payload)) return true;
      lastErr = new Error('short write: ' + sz + ' of ' + Buffer.byteLength(payload) + ' bytes');
    } catch (e) { lastErr = e; }
    if (attempt % 10 === 0) console.error('  relay write waiting out flap (attempt ' + attempt + ', last: ' + (lastErr && lastErr.message) + ')');
    if (attempt < 180) sleepSync(10000);
  }
  try { fs.unlinkSync(fp); } catch (e) {}
  throw lastErr || new Error('write failed');
}

const dir = path.join(OUTDIR, 'leadfeast');
fs.mkdirSync(dir, { recursive: true });
let buf = '';
let wrote = 0, skipped = 0, failed = 0;

function handleLine(line) {
  if (!line.trim()) return;
  let obj;
  try { obj = JSON.parse(line); } catch (e) { console.error('RELAY SKIP: unparsable line: ' + String(e.message)); failed++; return; }
  if (obj == null || obj.seed == null) { console.error('RELAY SKIP: line without seed'); failed++; return; }
  const fp = path.join(dir, 's' + obj.seed + '.json');
  try {
    const parsed = JSON.parse(fs.readFileSync(fp, 'utf8'));
    if (parsed && parsed.seed === obj.seed) { console.error('relay skip s' + obj.seed + ': already present and valid'); skipped++; return; }
  } catch (e) {}
  try {
    const payload = JSON.stringify(obj, null, 1) + '\n';
    writeResilient(fp, payload);
    console.error('relay wrote s' + obj.seed + ' (' + Buffer.byteLength(payload) + ' bytes)');
    wrote++;
  } catch (e) {
    console.error('RELAY ERROR s' + obj.seed + ': ' + (e && e.message));
    failed++;
  }
}

process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buf += chunk;
  let idx;
  while ((idx = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, idx);
    buf = buf.slice(idx + 1);
    handleLine(line);
  }
});
process.stdin.on('end', () => {
  if (buf.trim()) handleLine(buf);
  console.error('relay done: wrote=' + wrote + ' skipped=' + skipped + ' failed=' + failed);
});
