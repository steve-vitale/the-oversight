// write-stdin-to-file-b.js — writer half of the split sweep runner
// for sim-seasoning-b. Reads a per-seed record JSON from STDIN,
// validates it (parses, has a non-empty series, 0 instrument errors),
// then writes it to the given path with readback verification,
// retrying until the write flap clears. This process NEVER requires
// the driver (or any sim code): it stays a fresh, small process, so
// its file writes behave like the probe writes that succeed during
// clear windows. Refuses to overwrite an existing valid file (exit 3,
// like the driver's own guard); an existing INVALID file is also
// refused (exit 3 — inspect it first, never silently replace).
// Usage: <producer> | node scripts/write-stdin-to-file-b.js <file>
//   exit 0 when the file exists and validates; exit 1 on bad stdin
//   or unwritable file after the short retry budget (~10s); exit 2
//   when this process was born unable to write (caller respawns).
'use strict';
const fs = require('fs');
const path = require('path');

const RETRY_MS = 250;
const RETRY_MAX = 40; // ~10s: only a backstop for a sub-second flicker.
// A process that flipped to unable stays unable for minutes (proven
// 12:44-12:47), so long in-process retries just stall the caller;
// the caller respawns a fresh writer instead (record stays in memory).

function sleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) {
    const t0 = process.hrtime.bigint();
    while (process.hrtime.bigint() - t0 < BigInt(ms) * 1000000n) {}
  }
}
function validData(data) {
  try {
    const rec = JSON.parse(data);
    return rec && Array.isArray(rec.series) && rec.series.length > 0 &&
      Array.isArray(rec.instrumentErrors) && rec.instrumentErrors.length === 0;
  } catch (e) { return false; }
}
function validFile(file) {
  try { return validData(fs.readFileSync(file, 'utf8')); } catch (e) { return false; }
}

// Probe FIRST, before consuming stdin: the write flap is decided
// per-process at spawn (a process born in a blocked window stays
// blocked; a process born in a clear window writes freely — proven
// by the 12:26-12:38 A/B loops). If this process cannot write, exit 2
// at once so the caller's retry loop can respawn a fresh process
// instead of retrying inside a permanently blocked one. The in-loop
// retries below are only a backstop for a window that flips mid-write.
// On probe success, write a .ready file so the sim-side runner knows
// THIS process (the one that will write the file) is write-capable
// before it spends ~20s on the sim; remove it when done. The probe
// lives in the shared scratch dir (not the corpora dir) and its
// unlink is best-effort: only the WRITE proves writeability (a
// failed write leaves a 0-byte probe file — the syscall that is
// denied is write(), not open()).
const file = process.argv[2];
if (!file) { console.error('usage: node scripts/write-stdin-to-file-b.js <file>'); process.exitCode = 2; }
else if (fs.existsSync(file)) {
  if (validFile(file)) { console.error('SKIP: valid file already exists: ' + file); process.exitCode = 0; }
  else { console.error('STOP: ' + file + ' exists but is invalid — refusing to overwrite.'); process.exitCode = 3; }
} else {
  const probe = 'evidence/2026-11-16/.writer-probe-' + process.pid;
  let canWrite = false;
  try { fs.writeFileSync(probe, 'p'); canWrite = true; } catch (e) { canWrite = false; }
  try { fs.unlinkSync(probe); } catch (e) { /* best-effort only */ }
  if (!canWrite) { console.error('PROBE-FAIL: this process cannot write (born in a blocked window); exit 2 so the caller respawns.'); process.exitCode = 2; return; }
  try { fs.writeFileSync(file + '.ready', 'ok'); } catch (e) { console.error('PROBE-FAIL: cannot write .ready; exit 2.'); process.exitCode = 2; return; }
  function clearReady() { try { fs.unlinkSync(file + '.ready'); } catch (e) { /* best-effort */ } }
  let chunks = [];
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', function (c) { chunks.push(c); });
  process.stdin.on('end', function () {
    const data = chunks.join('');
    if (!validData(data)) {
      console.error('STOP: stdin is not a valid per-seed record (bad JSON, empty series, or instrument errors). NOT written.');
      clearReady();
      process.exitCode = 1;
      return;
    }
    const tmp = file + '.tmp-' + process.pid;
    for (let i = 0; i < RETRY_MAX; i++) {
      try {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(tmp, data);
        const back = fs.readFileSync(tmp, 'utf8');
        if (back.length !== data.length) throw new Error('tmp readback length mismatch');
        fs.renameSync(tmp, file);
        const back2 = fs.readFileSync(file, 'utf8');
        if (back2.length !== data.length) throw new Error('final readback length mismatch');
        if (!validFile(file)) throw new Error('wrote but file does not validate');
        console.error('WROTE ' + file + ' attempts=' + (i + 1));
        clearReady();
        process.exitCode = 0;
        return;
      } catch (e) {
        if (i === RETRY_MAX - 1) {
          console.error('STOP: could not write ' + file + ' after ' + RETRY_MAX + ' attempts: ' + String(e.message).slice(0, 200));
          clearReady();
          process.exitCode = 1;
          return;
        }
        sleepMs(RETRY_MS);
      }
    }
  });
  process.stdin.on('error', function (e) { console.error('STOP: stdin error: ' + e.message); clearReady(); process.exitCode = 1; });
}
