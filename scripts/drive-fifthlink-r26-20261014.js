#!/usr/bin/env node
// scripts/drive-fifthlink-r26-20261014.js — per-seed watchdog driver for the
// r26 sweep. Each seed runs in its own child process with a wall-clock
// timeout, so one hung seed (the s44 Focus-Group infinite-fight class, still
// open per the tracker) can't stall the whole screen. Per-seed JSONs are
// merged into <outPrefix>-merged.json.
//
// Usage:
//   node scripts/drive-fifthlink-r26-20261014.js \
//     --seeds=11,22,33,44,55,66,77,88,101,202,303,404,505,606,707,808 \
//     --outPrefix=evidence/2026-10-14/sim-fifthlink-r26-screen [--fifthlink=1] [--timeoutMs=900000]
'use strict';
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);
const args = {};
for (const a of argv) {
  const m = a.match(/^--([^=]+)=(.*)$/);
  if (m) args[m[1]] = m[2];
}
const seeds = (args.seeds || '').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const outPrefix = args.outPrefix || 'evidence/2026-10-14/sim-fifthlink-r26';
const timeoutMs = parseInt(args.timeoutMs || '900000', 10);
if (!seeds.length) { console.error('no seeds given'); process.exit(2); }

function runSeed(seed) {
  const out = `${outPrefix}-s${seed}.json`;
  const env = Object.assign({}, process.env, { FOURTHLINK: '1', SEEDS: String(seed), OUT: out });
  if (args.fifthlink === '1') env.FIFTHLINK = '1';
  else delete env.FIFTHLINK;
  return new Promise((resolve) => {
    execFile('node', [path.join(__dirname, 'sweep-fifthlink-r26-20261014.js')],
      { env, timeout: timeoutMs, maxBuffer: 64 * 1024 * 1024 },
      (err, stdout) => {
        if (err) {
          resolve({ seed, ok: false, reason: err.killed ? 'TIMEOUT' : String((err.message || err)).slice(0, 160) });
        } else {
          try {
            const rep = JSON.parse(fs.readFileSync(out, 'utf8'));
            const row = (rep.rows || [])[0] || null;
            resolve({ seed, ok: true, row, tail: String(stdout).trim().split('\n').slice(-1)[0] });
          } catch (e) {
            resolve({ seed, ok: false, reason: 'no-parse: ' + String(e.message).slice(0, 120) });
          }
        }
      });
  });
}

(async () => {
  const t0 = Date.now();
  const results = [];
  for (const seed of seeds) {
    const r = await runSeed(seed);
    results.push(r);
    console.log(`seed ${seed}: ${r.ok ? 'OK  ' + (r.tail || '') : 'FAIL ' + r.reason}`);
  }
  const rows = results.filter(r => r.ok && r.row).map(r => r.row);
  const merged = { label: path.basename(outPrefix), seeds, results: results.map(r => ({ seed: r.seed, ok: r.ok, reason: r.reason || null })), rows };
  fs.writeFileSync(outPrefix + '-merged.json', JSON.stringify(merged, null, 1));
  console.log(`\nwrote ${outPrefix}-merged.json — ${rows.length}/${seeds.length} seeds ok (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
