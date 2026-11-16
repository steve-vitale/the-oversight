// write-tcp-to-file-b.js — TCP writer for sim-seasoning-b.
// Listens on 127.0.0.1:<port>, accepts ONE connection carrying a
// per-seed record JSON, validates it, and writes it to <file> with
// readback verification and patient retries. This process NEVER
// requires the driver or any sim code, and NEVER reads a repo file
// or a FIFO (both wedge writes — see evidence): it only reads node
// builtins + its own 3.5KB script. The runner (run-one-seasoning-b.js
// --tcp) connects after its sim and sends the record; the transfer
// is a TCP socket write, which works even from a write-denied
// process. Probe-first + .ready handshake (same as
// write-stdin-to-file-b.js): probe at startup, exit 2 at once if
// born unable to write; on probe success write <file>.ready so the
// runner knows THIS process is write-capable before it spends ~20s
// on the sim; remove .ready when done. Refuses to overwrite an
// existing valid file (exit 3).
// Usage: node scripts/write-tcp-to-file-b.js <file> <port>
//   exit 0 when the file exists and validates; exit 1 on bad record
//   or no connection in 120s or unwritable after the retry budget;
//   exit 2 when born unable to write (caller respawns).
'use strict';
const fs = require('fs');
const net = require('net');
const path = require('path');

const RETRY_MS = 250;
const RETRY_MAX = 360; // ~90s: the listener runs as a FOREGROUND exec
// (yield 120s), so its whole run must finish inside the yield. If it
// cannot write in 90s, it exits 1 and the caller retries the config
// with a fresh listener (the sim re-runs, ~20-45s).
const CONNECT_TIMEOUT_MS = 600000; // 10 min: sims run 35s-2min+ under
// load and the listener must outlive the sim; the 120s default timed
// out mid-sim (proven 15:06: sim took ~2min, listener gone, send
// ECONNREFUSED). The listener still exits on first connection end,
// so a long timeout costs nothing on the happy path.

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
function clearReady(file) { try { fs.unlinkSync(file + '.ready'); } catch (e) { /* best-effort */ } }

const file = process.argv[2];
const port = parseInt(process.argv[3], 10);
if (!file || !Number.isFinite(port)) { console.error('usage: node scripts/write-tcp-to-file-b.js <file> <port>'); process.exitCode = 2; }
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
  const srv = net.createServer(function (sock) {
    const chunks = [];
    sock.on('data', function (c) { chunks.push(c); });
    sock.on('end', function () {
      srv.close();
      clearTimeout(connTimer); // do not let the idle timer overwrite
      // the write verdict: without this, a successful write still
      // exits 1 when the timer fires (proven 14:56).
      const data = Buffer.concat(chunks).toString('utf8');
      if (!validData(data)) {
        console.error('STOP: received data is not a valid per-seed record. NOT written.');
        clearReady(file);
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
          clearReady(file);
          process.exitCode = 0;
          return;
        } catch (e) {
          if (i === RETRY_MAX - 1) {
            console.error('STOP: could not write ' + file + ' after ' + RETRY_MAX + ' attempts: ' + String(e.message).slice(0, 200));
            clearReady(file);
            process.exitCode = 1;
            return;
          }
          sleepMs(RETRY_MS);
        }
      }
    });
    sock.on('error', function (e) { console.error('STOP: socket error: ' + e.message); clearReady(file); clearTimeout(connTimer); srv.close(); process.exitCode = 1; });
  });
  srv.on('error', function (e) { console.error('STOP: listen error: ' + e.message); clearReady(file); clearTimeout(connTimer); process.exitCode = 1; });
  srv.listen(port, '127.0.0.1', function () { console.error('LISTENING port=' + port); });
  const connTimer = setTimeout(function () {
    console.error('STOP: no connection in ' + (CONNECT_TIMEOUT_MS / 1000) + 's; exiting.');
    clearReady(file);
    srv.close();
    process.exitCode = 1;
  }, CONNECT_TIMEOUT_MS);
}
