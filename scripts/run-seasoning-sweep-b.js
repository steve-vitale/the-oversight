// run-seasoning-sweep-b.js — resilient sweep runner for sim-seasoning-b.
//
// WHY THIS FILE EXISTS (method note — see evidence sim-seasoning-b.md):
// the frozen driver (scripts/onlylead-driver-20261115.js, RUN=seasoning-b)
// writes each per-seed JSON through writeRobust, which caps retries at
// 480 x 250ms (~120s) and then dumps the record to stdout (@@FALLBACK).
// During this run the write flap held fresh-file writes / renames
// EPERM for longer than 120s at a time, so two full CLI sweeps lost
// configs to @@FALLBACK (no per-seed file written). This runner calls
// the SAME oneRun (the driver's own exported function — same policies,
// same seeds, same 150d, same record construction) and writes the
// SAME bytes (JSON.stringify(record, null, 2) + '\n') to the SAME
// paths, but retries each write until it succeeds (readback-verified)
// instead of falling back to stdout after 120s. Records are held in
// memory until their file verifies, so no judged sim is ever lost to
// the flap. The driver's refuse-to-overwrite guard is kept: an
// existing valid per-seed file is never re-run or overwritten.
// Zero src/js. Zero policy edits. Zero driver edits.
//
// Usage: node scripts/run-seasoning-sweep-b.js
//   (logs one line per config to stdout; exit 0 only when 16/16 files
//   exist and parse as JSON with 0 instrument errors.)
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DRIVER = require(path.join(REPO, 'scripts', 'onlylead-driver-20261115.js'));

const SEEDS = [102201, 102202, 102203, 102204, 102205, 102206, 102207, 102208];
const POLICIES = [
  { name: 'competent-covenant-b', dir: 'perseed-seasoning-b-control' },
  { name: 'competent-courtship-b', dir: 'perseed-seasoning-b-on' },
];
const DAYS = 150;
const WRITE_RETRY_MS = 250;       // tight interval: clear windows are brief
const WRITE_RETRY_MAX = 4800;      // up to ~20 min per file, then fail loud

function sleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) {
    const t0 = process.hrtime.bigint();
    while (process.hrtime.bigint() - t0 < BigInt(ms) * 1000000n) {}
  }
}
function fileFor(seed, pol) {
  return path.join(REPO, 'evidence', '2026-11-16', pol.dir,
    'seasoning-b-s' + seed + '-' + pol.name + '-seasoning-b.json');
}
function validFile(file) {
  try {
    const rec = JSON.parse(fs.readFileSync(file, 'utf8'));
    return rec && Array.isArray(rec.series) && rec.series.length > 0 &&
      Array.isArray(rec.instrumentErrors) && rec.instrumentErrors.length === 0;
  } catch (e) { return false; }
}
// Write with readback verification, retrying until the flap clears.
// NEVER falls back to stdout: a record that cannot be written stays
// in memory (the caller holds it) and the process fails loud.
function writeVerified(file, data) {
  const tmp = file + '.tmp-' + process.pid;
  for (let i = 0; i < WRITE_RETRY_MAX; i++) {
    try {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(tmp, data);
      const back = fs.readFileSync(tmp, 'utf8');
      if (back.length !== data.length) throw new Error('readback length mismatch');
      fs.renameSync(tmp, file);
      const back2 = fs.readFileSync(file, 'utf8');
      if (back2.length !== data.length) throw new Error('final readback length mismatch');
      return { attempts: i + 1 };
    } catch (e) {
      if (i === WRITE_RETRY_MAX - 1) throw e;
      sleepMs(WRITE_RETRY_MS);
    }
  }
  throw new Error('writeVerified: unreachable');
}

(async function () {
  let done = 0, failed = 0;
  const t0 = process.hrtime.bigint();
  for (const seed of SEEDS) {
    for (const pol of POLICIES) {
      const file = fileFor(seed, pol);
      const label = seed + ' ' + pol.name;
      if (fs.existsSync(file) && validFile(file)) {
        console.log('SKIP ' + label + ' (valid file exists)');
        done++;
        continue;
      }
      if (fs.existsSync(file)) {
        console.error('STOP: ' + file + ' exists but is invalid — refusing to overwrite; inspect it first.');
        process.exitCode = 3;
        return;
      }
      let rec;
      try {
        rec = await DRIVER.oneRun(seed, pol.name, { days: DAYS });
      } catch (e) {
        console.error('STOP: oneRun threw for ' + label + ' — ' + (e && e.stack ? e.stack.split('\n')[0] : e));
        process.exitCode = 1;
        return;
      }
      const data = JSON.stringify(rec, null, 2) + '\n';
      try {
        const w = writeVerified(file, data);
        if (!validFile(file)) throw new Error('wrote but file does not validate');
        console.log('OK ' + label + ' days=' + rec.days + ' end=' + rec.endReason +
          ' scale=' + rec.scaleRank + ' standing=' + rec.standing +
          ' series=' + (rec.series || []).length + 'd errors=' + (rec.instrumentErrors || []).length +
          ' writeAttempts=' + w.attempts);
        done++;
      } catch (e) {
        console.error('STOP: could not write ' + file + ' after ' + WRITE_RETRY_MAX +
          ' attempts — record held in memory only, NOT saved. Last error: ' + String(e.message).slice(0, 200));
        process.exitCode = 1;
        return;
      }
    }
  }
  const secs = (Number(process.hrtime.bigint() - t0) / 1e9).toFixed(1);
  console.log('SWEEP DONE: ' + done + '/16 files, failed=' + failed + ', ' + secs + 's');
  if (done !== 16) process.exitCode = 1;
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
