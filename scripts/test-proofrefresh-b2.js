#!/usr/bin/env node
'use strict';
// sim-proofrefresh-b2: legs proving the refreshed measurement proof is real,
// current, and neutral — and that regeneration alone moved no verdict.
// Round 2: the previous retained panel is the seed-7-only r127scholar panel
// (4 rows), while this refresh restores the canonical 64-case spec, so the
// neutrality-reproduction leg compares the 4 proof-case verdicts only; row
// completeness is judged against this panel command's own spec (64 cases).
// Run from the repo root: node scripts/test-proofrefresh-b2.js
const fs = require('fs'), path = require('path'), zlib = require('zlib'),
  cp = require('child_process');
const root = path.resolve(__dirname, '..');
const NEW = path.join(root, 'evidence/2026-11-10/neutral-proofrefresh-b2.json.gz');
const OLD = path.join(root, 'evidence/2026-11-10/neutral-r127scholar.json.gz');
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
  const proof = require('./balance-proof.json');
  const panel = readPanel(NEW);
  const normalized = require('./balance-proof-update').validate(root, panel);
  leg('balance-proof-update validate passes on the new panel',
    JSON.stringify(normalized) === JSON.stringify(proof.normalizedSources) &&
    proof.panel === 'evidence/2026-11-10/neutral-proofrefresh-b2.json.gz',
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

// (c) ontology validation green.
const t4 = run('scripts/validate-ontology.js');
leg('validate-ontology.js exits 0', t4.code === 0 && /systems validated/.test(t4.out),
  (t4.out.match(/All \d+ systems validated/) || ['exit ' + t4.code])[0]);

// (d) neutrality match on every proof case (fresh panel).
const fresh = readPanel(NEW);
const neut = fresh.validity && fresh.validity.neutrality || [];
leg('neutrality match on every proof case',
  neut.length === 4 && neut.every(n => n.match && !n.warnings),
  neut.map(n => n.policy + '@' + n.seed + ':' + (n.match ? 'match' : 'MISMATCH')).join(', '));

// (e) panel rows complete: 64 observed cases, one per policy/seed combo.
const combos = new Set(fresh.rows.map(r => r.row.policy + '/' + r.row.seed));
leg('panel rows complete (64 observed cases)',
  fresh.rows.length === 64 && combos.size === 64,
  fresh.rows.length + ' rows, ' + combos.size + ' distinct policy/seed combos');

// (f) neutrality verdict reproduces the previous (seed-7-only) panel.
// Row counts differ by design this round (64 vs 4 — canonical spec restored),
// so only the 4 proof-case verdicts are compared.
const old = readPanel(OLD);
const oldNeut = old.validity && old.validity.neutrality || [];
leg('neutrality verdict reproduces the previous panel',
  JSON.stringify(neut.map(n => [n.policy, n.seed, n.match, n.warnings])) ===
  JSON.stringify(oldNeut.map(n => [n.policy, n.seed, n.match, n.warnings])),
  'old ' + oldNeut.map(n => n.policy + ':' + (n.match ? 'match' : 'MISMATCH')).join(', '));

// (g) validity.sourcesStable true.
leg('validity.sourcesStable true', fresh.validity && fresh.validity.sourcesStable === true);

// (h) stale-input negative check: the OLD panel must FAIL validate on this
// tip, proving the green result is not vacuous — the harness still detects
// stale source inputs.
try {
  require('./balance-proof-update').validate(root, old);
  leg('stale-input negative check (old panel fails validate)', false, 'validate passed on a stale panel');
} catch (e) {
  leg('stale-input negative check (old panel fails validate)',
    /Proof source inputs are not current/.test(e.message), e.message);
}

console.log('\ntest-proofrefresh-b2: ' + pass + ' passed, ' + fail + ' failed, 0 todo (phase 0)');
process.exitCode = fail ? 1 : 0;
