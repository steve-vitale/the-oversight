#!/usr/bin/env node
// waitsalign-sleep-sweep-b.js — runs the single-value sleep
// probe once per evening-clock value, each in its OWN child
// process (one harness per process), and writes the collected
// table to evidence/2026-10-31/sim-waitsalign-a-sleepprobe.json
// with an EPERM-flap retry loop.
// Usage: SEED=<seed> VALUES="400,448,449,451" node
//   scripts/waitsalign-sleep-sweep-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function realSleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) { try { require('child_process').execSync('sleep ' + (ms / 1000)); } catch (e2) {} }
}
function writeRetry(filePath, data) {
  for (let i = 0; i < 12; i++) {
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, data);
      if (fs.readFileSync(filePath, 'utf8') === data) return true;
    } catch (e) { realSleepMs(2000); }
  }
  return false;
}

const SEED = process.env.SEED || '15215';
const VALUES = (process.env.VALUES || '400,440,444,447,448,449,450,451,455,460,480,500')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const results = [];
for (const eve of VALUES) {
  try {
    const out = execFileSync(process.execPath,
      [path.join(__dirname, 'waitsalign-sleep-probe-b.js')],
      { env: { ...process.env, EVE: String(eve), SEED }, encoding: 'utf8', timeout: 120000 });
    const line = out.trim().split('\n').filter(Boolean).pop();
    const row = JSON.parse(line);
    results.push(row);
    console.log('EVE ' + eve + ' -> morning ' + row.morning + ' rolledInSleep=' + row.dayRolledInSleep
      + ' refused=' + row.sleepRefused + (row.interrupted ? ' INTERRUPTED=' + row.interrupted : ''));
  } catch (e) {
    console.error('PROBE FAIL EVE ' + eve + ': ' + String((e && (e.message || e)) || e).slice(0, 200));
    results.push({ seed: parseInt(SEED, 10), eve, error: String((e && (e.message || e)) || e).slice(0, 200) });
  }
}
const outPath = path.join(__dirname, '..', 'evidence', '2026-10-31', 'sim-waitsalign-a-sleepprobe-s' + SEED + '.json');
if (!writeRetry(outPath, JSON.stringify({ seed: parseInt(SEED, 10), results }, null, 1))) {
  console.error('WRITE FAIL LOUDLY ' + outPath);
  process.exit(3);
}
console.log('wrote ' + outPath);
