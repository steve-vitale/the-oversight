#!/usr/bin/env node
// scripts/recover-bowcraft-fallback-confirm-a.js — recover bowcraft-confirm arm-leg
// corpora whose writeRobust file write was refused by the host write
// flap (seeds 107002–107008: the driver fell back to dumping each
// corpus as text to stdout, i.e. the sweep .log file).
//
// The fallback format is one line `@@FALLBACK <target path>` followed
// by the full corpus JSON (JSON.stringify(out, null, 2)). This script
// extracts each block (a block ends at the next per-seed summary line
// — a line starting at column 0 with `{"seed":` — or the next
// @@FALLBACK marker, or EOF), validates it (JSON parses; seed matches
// the target filename; mode arm; bowcraftOn true; anchor is the
// committed fix), and writes it to the target path with write +
// readback verification, retrying up to 10 minutes (the flap is
// intermittent). It refuses to overwrite an existing non-empty corpus
// file. It also removes the 0-byte .tmp files writeRobust left behind.
//
// Usage: node scripts/recover-bowcraft-fallback-confirm-a.js [--log evidence/2026-11-19/bowcraft-confirm-a-arm.log]
// Exit 0 = every missing corpus recovered and validated. Exit 1 = a
// failure (listed). Writes nothing except the recovered corpora (and
// removing the stale .tmp files).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const LOG = process.argv.includes('--log')
  ? process.argv[process.argv.indexOf('--log') + 1]
  : path.join(REPO, 'evidence', '2026-11-19', 'bowcraft-confirm-a-arm.log');

function sleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) {
    const t0 = process.hrtime.bigint();
    while (process.hrtime.bigint() - t0 < BigInt(ms) * 1000000n) {}
  }
}
function writeVerified(filePath, data) {
  // Same discipline as the driver's writeRobust: temp file +
  // readback, then rename; retry 10 minutes on refusal.
  const tmp = filePath + '.recover-tmp-' + process.pid;
  for (let i = 0; i < 240; i++) {
    try {
      fs.writeFileSync(tmp, data);
      const back = fs.readFileSync(tmp, 'utf8');
      if (back.length !== data.length) throw new Error('readback length mismatch');
      fs.renameSync(tmp, filePath);
      const final = fs.readFileSync(filePath, 'utf8');
      if (final.length !== data.length) throw new Error('final readback length mismatch');
      return true;
    } catch (e) {
      if (i === 239) return false;
      sleepMs(2500);
    }
  }
  return false;
}

function main() {
  const lines = fs.readFileSync(LOG, 'utf8').split('\n');
  const blocks = []; // {target, jsonText}
  let cur = null;
  for (const line of lines) {
    if (line.indexOf('@@FALLBACK ') === 0) {
      if (cur) blocks.push(cur);
      cur = { target: line.slice('@@FALLBACK '.length).trim(), parts: [] };
      continue;
    }
    if (!cur) continue;
    // A per-seed summary line starts at column 0 with {"seed":
    // (the dump's own "seed" lines are indented). It ends the block.
    if (line.indexOf('{"seed":') === 0) { blocks.push(cur); cur = null; continue; }
    cur.parts.push(line);
  }
  if (cur) blocks.push(cur);
  console.log('fallback blocks found: ' + blocks.length);
  let recovered = 0, failed = 0;
  for (const b of blocks) {
    const text = b.parts.join('\n').replace(/\n+$/, '') + '\n';
    let obj = null;
    try { obj = JSON.parse(text); } catch (e) {
      console.log('FAIL ' + b.target + ' — dump does not parse as JSON: ' + e.message);
      failed++;
      continue;
    }
    const m = /s(\d+)-bowcraft-confirm-a-arm\.json$/.exec(b.target);
    const wantSeed = m ? parseInt(m[1], 10) : null;
    const ok = obj && obj.seed === wantSeed && obj.mode === 'arm' && obj.bowcraftOn === true &&
      typeof obj.anchorCommit === 'string' && obj.anchorCommit.indexOf('7e0810eea') === 0 &&
      Array.isArray(obj.bowCensus) && obj.bowCensus.length > 0;
    if (!ok) {
      console.log('FAIL ' + b.target + ' — validation failed: ' + JSON.stringify({ seed: obj && obj.seed, wantSeed: wantSeed, mode: obj && obj.mode, bowcraftOn: obj && obj.bowcraftOn, anchor: obj && obj.anchorCommit }));
      failed++;
      continue;
    }
    if (fs.existsSync(b.target) && fs.statSync(b.target).size > 0) {
      console.log('SKIP ' + b.target + ' — a non-empty corpus already exists there');
      continue;
    }
    const data = JSON.stringify(obj, null, 2) + '\n';
    if (writeVerified(b.target, data)) {
      console.log('RECOVERED ' + b.target + ' (seed ' + obj.seed + ', ' + obj.days + 'd, ' + obj.endReason + ')');
      recovered++;
    } else {
      console.log('FAIL ' + b.target + ' — could not write after 10 minutes of retries (flap still up)');
      failed++;
    }
    // Remove writeRobust's 0-byte .tmp file for this seed, if any.
    const dir = path.dirname(b.target);
    const base = path.basename(b.target);
    try {
      for (const f of fs.readdirSync(dir)) {
        if (f.indexOf(base + '.tmp-') === 0) { fs.unlinkSync(path.join(dir, f)); console.log('  removed stale tmp ' + f); }
      }
    } catch (e) {}
  }
  console.log('RECOVER ' + recovered + ' recovered, ' + failed + ' failed');
  if (failed) process.exitCode = 1;
}
main();
