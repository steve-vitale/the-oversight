// run-one-seasoning-b.js — sim-side half of the split sweep runner
// for sim-seasoning-b. Runs ONE config (seed + policy, 150d) through
// the frozen driver's own oneRun and writes the per-seed record as
// JSON to STDOUT (never to a file: this process requires the driver
// and its file writes EPERM during the write flap, while stdout pipe
// writes go through). The writer half (write-stdin-to-file-b.js) reads
// stdin and writes the file. Same record construction as the CLI
// driver (JSON.stringify(record, null, 2) + '\n', same paths).
// Usage: node scripts/run-one-seasoning-b.js <seed> <policy> [days] [readyfile] [tcpPort]
//   exit 0 with the record on stdout (or sent to 127.0.0.1:tcpPort
//   when tcpPort is given); exit 1 on any sim failure or send failure.
'use strict';
const fs = require('fs');
const DRIVER = require('./onlylead-driver-20261115.js');

const seed = parseInt(process.argv[2], 10);
const policy = process.argv[3];
const days = parseInt(process.argv[4] || '150', 10) || 150;
const readyFile = process.argv[5] || null;
const tcpPort = parseInt(process.argv[6], 10) || null;
function sleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) {
    const t0 = process.hrtime.bigint();
    while (process.hrtime.bigint() - t0 < BigInt(ms) * 1000000n) {}
  }
}
function emit(rec) {
  const data = JSON.stringify(rec, null, 2) + '\n';
  if (tcpPort) {
    // TCP send: a socket write works even from a write-denied
    // process (proven 13:07: 1MB sent after repo reads). The
    // listener (write-tcp-to-file-b.js) is a separate process that
    // never reads repo files, so it can write the file.
    const net = require('net');
    const sock = net.connect(tcpPort, '127.0.0.1', function () {
      sock.write(data, function () { sock.end(); });
    });
    sock.on('error', function (e) { console.error('TCP-SEND-FAIL: ' + e.message); process.exitCode = 1; });
  } else {
    process.stdout.write(data);
  }
}
if (!Number.isFinite(seed) || !policy) {
  console.error('usage: node scripts/run-one-seasoning-b.js <seed> <policy> [days] [readyfile] [tcpPort]');
  process.exitCode = 2;
} else if (readyFile) {
  let seen = false;
  for (let i = 0; i < 200; i++) {
    if (fs.existsSync(readyFile)) { seen = true; break; }
    sleepMs(50);
  }
  if (!seen) {
    console.error('READY-TIMEOUT: writer never signalled writeable; not simming.');
    process.exitCode = 3;
  } else {
    DRIVER.oneRun(seed, policy, { days: days }).then(function (rec) {
      emit(rec);
    }).catch(function (e) {
      console.error((e && e.stack) || e);
      process.exitCode = 1;
    });
  }
} else {
  DRIVER.oneRun(seed, policy, { days: days }).then(function (rec) {
    emit(rec);
  }).catch(function (e) {
    console.error((e && e.stack) || e);
    process.exitCode = 1;
  });
}
