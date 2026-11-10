#!/usr/bin/env node
'use strict';
// sim-proofrefresh-b: legs proving the refreshed measurement proof is real,
// current, and neutral — and that regeneration alone moved no verdict.
// Run from the repo root: node scripts/test-proofrefresh-b.js
const fs = require('fs'), path = require('path'), zlib = require('zlib'),
  cp = require('child_process');
const root = path.resolve(__dirname, '..');
const NEW = path.join(root, 'evidence/2026-11-10/neutral-proofrefresh-b.json.gz');
const OLD = path.join(root, 'evidence/2026-11-10/neutral-vetcount-b.json.gz');
let pass = 0, fail = 0;
function leg(name, ok, detail) {
  if (ok) { pass++; console.log('  ok   ' + name + (detail ? ' — ' + detail : '')); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
function run(cmd) {
  const r = cp.spawnSync('node', cmd.split(' '), { cwd: root, encoding: 'utf8' });
  return { code: r.status, out: (r.stdout || '') + (r.stderr || '') };
}
function readPanel(file) {
  const bytes = fs.readFileSync(file);
  return JSON.parse(file.endsWith('.gz') ? zlib.gunzipSync(bytes) : bytes.toString('utf8'));
}

// (a) balance-proof-update validate passes on the new panel.
try {
  const B = require('./balance-panel'), proof = require('./balance-proof.json');
  const panel = readPanel(NEW);
  const normalized = require('./balance-proof-update').validate(root, panel);
  leg('balance-proof-update validate passes on the new panel',
    JSON.stringify(normalized) === JSON.stringify(proof.normalizedSources) &&
    proof.panel === 'evidence/2026-11-10/neutral-proofrefresh-b.json.gz',
    'normalizedSources match scripts/balance-proof.json');
} catch (e) { leg('balance-proof-update validate passes on the new panel', false, e.message); }

// (b) the three proof tests pass.
const t1 = run('scripts/godpath/test-measurement-proof-update.js');
leg('test-measurement-proof-update.js exits 0', t1.code === 0, 'exit ' + t1.code);
const t2 = run('scripts/godpath/test-measurement-workflow.js');
const m2 = t2.out.match(/(\d+) passed, (\d+) failed/);
leg('test-measurement-workflow.js is 9/9', t2.code === 0 && m2 && m2[1] === '9' && m2[2] === '0',
  m2 ? m2[0] : ('exit ' + t2.code));
const t3 = run('scripts/godpath/test-measurement-cache-flags.js');
const m3 = t3.out.match(/(\d+) passed, (\d+) failed/);
leg('test-measurement-cache-flags.js is 4/4', t3.code === 0 && m3 && m3[1] === '4' && m3[2] === '0',
  m3 ? m3[0] : ('exit ' + t3.code));

// (c) neutrality match on every proof case (fresh panel).
const fresh = readPanel(NEW);
const neut = fresh.validity && fresh.validity.neutrality || [];
leg('neutrality match on every proof case',
  neut.length === 4 && neut.every(n => n.match && !n.warnings),
  neut.map(n => n.policy + '@' + n.seed + ':' + (n.match ? 'match' : 'MISMATCH')).join(', '));

// (d) panel rows complete: 64 observed cases, row count matches previous panel.
const old = readPanel(OLD);
const combos = new Set(fresh.rows.map(r => r.row.policy + '/' + r.row.seed));
leg('panel rows complete (64 observed cases)',
  fresh.rows.length === 64 && combos.size === 64,
  fresh.rows.length + ' rows, ' + combos.size + ' distinct policy/seed combos');
leg('row count matches the previous panel',
  fresh.rows.length === old.rows.length,
  'new ' + fresh.rows.length + ' vs old ' + old.rows.length);
const oldNeut = old.validity && old.validity.neutrality || [];
leg('neutrality verdict reproduces the previous panel',
  JSON.stringify(neut.map(n => [n.policy, n.seed, n.match, n.warnings])) ===
  JSON.stringify(oldNeut.map(n => [n.policy, n.seed, n.match, n.warnings])),
  'old ' + oldNeut.map(n => n.policy + ':' + (n.match ? 'match' : 'MISMATCH')).join(', '));

// (e) validity.sourcesStable true.
leg('validity.sourcesStable true', fresh.validity && fresh.validity.sourcesStable === true);

console.log('\ntest-proofrefresh-b: ' + pass + ' passed, ' + fail + ' failed, 0 todo (phase 0)');
process.exitCode = fail ? 1 : 0;
