// muster-b-write.js — flap-safe file write (arm sim-muster-b).
// The host write flap (2026-11-24) refuses the WRITE step on fresh or
// empty files for minutes at a time, while the CREATE step succeeds —
// so a plain writeFileSync leaves a 0-byte file behind, and every
// retry against that same (now empty) path is refused again. The fix:
// write to a fresh temp sibling name on every attempt and rename into
// place only after the bytes are down. A failed attempt unlinks its
// 0-byte temp, so no poisoned path survives. Retries 30 x 10s, then
// throws (never silent).
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function writeFileFlapSafe(file, content) {
  const dir = path.dirname(file);
  const base = path.basename(file);
  let last = null;
  for (let attempt = 1; attempt <= 30; attempt++) {
    const tmp = path.join(dir, '.' + base + '.tmp-' + process.pid + '-' + attempt);
    try {
      fs.writeFileSync(tmp, content);
      const got = fs.statSync(tmp).size;
      if (got !== Buffer.byteLength(content)) throw new Error('short write: ' + got + ' of ' + Buffer.byteLength(content));
      fs.renameSync(tmp, file);
      return;
    } catch (e) {
      last = e;
      try { fs.unlinkSync(tmp); } catch (e2) {}
      if (!/EPERM|EACCES|short write/.test(String((e && e.code) || e.message || e))) throw e;
      if (attempt < 30) {
        try { console.error('muster-b-write: ' + file + ' attempt ' + attempt + '/30 failed (' + String((e && e.code) || e.message).slice(0, 60) + '), retry in 10s'); } catch (e3) {}
        try { execSync('sleep 10'); } catch (e4) {}
      }
    }
  }
  throw last;
}

module.exports = { writeFileFlapSafe };
