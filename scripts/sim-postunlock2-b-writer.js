#!/usr/bin/env node
// sim-postunlock2-b-writer.js — fresh-process file writer for the
// sim-postunlock2-b sweep (run fleshout-20261024T0925Z).
//
// WHY A SEPARATE PROCESS + CHUNKED APPENDS: the container EPERM write
// flap (2026-10-24, this arm) blocks ~30KB single writes for long
// stretches — in-process AND child-process, evidence/ AND scratch
// dirs — while small appends succeed throughout (the sweep's runlog
// appends kept growing; 1-byte probes passed while 30KB writes
// failed). So this writer streams the body in 1KB appends (first
// chunk truncates, rest append), retrying each chunk with backoff.
// Verified hash, then rename over the target (a failed attempt never
// leaves a 0-byte corpse behind).
//
// Usage: node scripts/sim-postunlock2-b-writer.js <path> < payload-json
// Exits 0 with "WROTE <sha12>" on a hash-verified write, 3 otherwise.
'use strict';
const fs = require('fs');
const crypto = require('crypto');
const target = process.argv[2];
if (!target) { console.error('WRITER STOP: no target path.'); process.exit(2); }
const CHUNK = 1024;
const CHUNK_RETRIES = 8;
function sleep(ms) { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
let body = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', c => { body += c; });
process.stdin.on('end', () => {
  const tmp = target + '.tmp-' + process.pid;
  try {
    for (let off = 0; off < body.length; off += CHUNK) {
      const piece = body.slice(off, off + CHUNK);
      let ok = false, lastErr = null;
      for (let a = 0; a < CHUNK_RETRIES && !ok; a++) {
        try {
          if (off === 0) fs.writeFileSync(tmp, piece);
          else fs.appendFileSync(tmp, piece);
          ok = true;
        } catch (e) {
          lastErr = e;
          sleep(Math.min(5000, 500 * (a + 1)));
        }
      }
      if (!ok) throw lastErr;
    }
    const shaWrote = crypto.createHash('sha256').update(body).digest('hex');
    const shaRead = crypto.createHash('sha256').update(fs.readFileSync(tmp)).digest('hex');
    if (shaWrote !== shaRead) throw new Error('hash mismatch');
    fs.renameSync(tmp, target);
    console.log('WROTE ' + shaWrote.slice(0, 12));
    process.exit(0);
  } catch (e) {
    try { fs.unlinkSync(tmp); } catch (e2) {}
    console.error('WRITER-FAIL: ' + String((e && e.message) || e));
    process.exit(3);
  }
});
