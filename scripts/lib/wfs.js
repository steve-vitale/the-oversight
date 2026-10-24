// scripts/lib/wfs.js -- EPERM-hardened file writes (2026-10-23).
//
// This container intermittently returns EPERM on file writes (same class as
// the jest transform-cache chown quirk and the 2026-10-23 .git lock-write
// flap: write(2) on an open fd fails, flapping OK/EPERM across seconds).
// Plain fs.writeFileSync in a long sim run therefore dies at an arbitrary
// seed boundary. wfsSync retries with backoff and reports loudly instead
// of throwing; callers can then fall back (alt path, stdout dump) rather
// than losing the whole run.
//
// Usage: const { wfsSync } = require('./lib/wfs');
//        if (!wfsSync(fp, data)) { /* fallback */ }
'use strict';
const fs = require('fs');

function sleepSync(ms) {
  const t = Date.now();
  while (Date.now() - t < ms) { /* busy-wait: keeps it sync-safe inside sim callbacks */ }
}

// Returns true on success, false after all retries. Never throws.
function wfsSync(fp, data, opts) {
  const o = opts || {};
  const tries = o.tries || 8;
  let last = null;
  for (let i = 0; i < tries; i++) {
    try {
      fs.writeFileSync(fp, data);
      if (i > 0) console.log(`wfs: ${fp} succeeded on retry ${i + 1}/${tries}`);
      return true;
    } catch (e) {
      last = e;
      if (i < tries - 1) sleepSync(150 * (i + 1));
    }
  }
  console.log(`wfs FAILED after ${tries} tries: ${fp} :: ${last && last.message}`);
  return false;
}

module.exports = { wfsSync };
