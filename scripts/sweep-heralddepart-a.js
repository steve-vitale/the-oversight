#!/usr/bin/env node
// sweep-heralddepart-a.js — corpus runner for sim-heralddepart-a.
// Runs the driver as a separate process per seed/arm (never two
// harnesses in one process), sequentially, then runs the analyzer.
// Corpus (prereg): departure cases 97400 closecommit, 97338
// musterfed, 97338 lairnoise; band closecommit 97405, 97420,
// 97432, 97433, 97435, 97412, 97418, 97426. 97405 counted once.
// Usage: node scripts/sweep-heralddepart-a.js
'use strict';
const { spawnSync } = require('child_process');
const path = require('path');
const REPO = path.join(__dirname, '..');
const RUNS = [
  ['97400', 'closecommit'],
  ['97338', 'musterfed'],
  ['97338', 'lairnoise'],
  ['97405', 'closecommit'],
  ['97420', 'closecommit'],
  ['97432', 'closecommit'],
  ['97433', 'closecommit'],
  ['97435', 'closecommit'],
  ['97412', 'closecommit'],
  ['97418', 'closecommit'],
  ['97426', 'closecommit'],
];
const ENV = Object.assign({}, process.env, {
  FEASTSCALE_R13: '1', TRIBFLOOR: '1', WINPURSUIT: '1', WINDEFER: '1',
  SEATDRIVE: '1', FULLSEAT: '1', HERALD: '1', DAYS: '180', RUN: 'r1',
});
let failed = 0;
for (const [seed, arm] of RUNS) {
  const env = Object.assign({}, ENV, { ARM: arm, SEEDS: seed });
  const r = spawnSync('node', [path.join(REPO, 'scripts', 'heralddepart-driver-20261102.js')],
    { cwd: REPO, env: env, encoding: 'utf8' });
  const out = (r.stdout || '').trim().split('\n').pop();
  console.log(out);
  if (r.status !== 0) { failed++; console.error('FAILED', seed, arm, (r.stderr || '').slice(-500)); }
}
const a = spawnSync('node', [path.join(REPO, 'scripts', 'heralddepart-analyze-20261102.js'),
  '--out', path.join(REPO, 'evidence', '2026-11-02', 'perseed-heralddepart-a', 'classification.json')],
  { cwd: REPO, encoding: 'utf8' });
console.log(a.stdout);
if (a.status !== 0) { failed++; console.error(a.stderr); }
process.exit(failed ? 1 : 0);
