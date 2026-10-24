#!/usr/bin/env node
// sim-write-robust.js — EPERM-flap-hardened writer (gap 852/621, generalizing
// the postunlock2-b chunked writer, gap 886 already-resolved, into a shared
// module). writeFileRobust(path, text): atomic temp+rename, per-attempt
// read-back hash verification, retries with backoff on write denial.
// It does not cure the container EPERM flap — nothing in userland does —
// it makes a sweep survive it instead of dying silently on a 0-byte JSON.
// Sync API (sweep scripts are sync writers); returns { bytes, sha256, attempts }.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function sleepSync(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) { /* busy-wait: sweep writers are sync; keep it short */ }
}

function writeFileRobust(file, text, opts) {
  const o = Object.assign({ retries: 8, baseDelayMs: 200 }, opts || {});
  const want = crypto.createHash('sha256').update(text).digest('hex');
  const dir = path.dirname(file);
  let lastErr = null;
  for (let attempt = 1; attempt <= o.retries; attempt++) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      const tmp = file + '.tmp-' + process.pid + '-' + attempt;
      fs.writeFileSync(tmp, text);
      const back = fs.readFileSync(tmp, 'utf8');
      const got = crypto.createHash('sha256').update(back).digest('hex');
      if (got !== want) throw new Error('read-back hash mismatch (wrote ' + want.slice(0, 12) + ', read ' + got.slice(0, 12) + ')');
      fs.renameSync(tmp, file);
      const final = fs.readFileSync(file, 'utf8');
      if (crypto.createHash('sha256').update(final).digest('hex') !== want) throw new Error('final read-back hash mismatch');
      return { bytes: Buffer.byteLength(text), sha256: want, attempts: attempt };
    } catch (e) {
      lastErr = e;
      if (attempt < o.retries) sleepSync(o.baseDelayMs * attempt);
    }
  }
  throw lastErr;
}

module.exports = { writeFileRobust };
