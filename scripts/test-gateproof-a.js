#!/usr/bin/env node
'use strict';
// gateproof-a: legs proving the refreshed measurement proof is real,
// current, and neutral — and that regeneration alone moved no verdict.
// This round: the previous RETAINED panel is the r211-rebased panel
// (evidence/2026-11-15/neutral-r211-rebased.json.gz, 4 cases, seed 7 x
// 4 policies x 150d, panel c015d348), which is stale on this tip because
// the planignite-fix landing (master 9be3676d8) changed manifest-hashed
// Game files after the r211 panel was generated, and the batch ship's
// index.html version stamp also moves the manifest.
// The b20 panel (evidence/2026-11-15/neutral-proofrefresh-b20.json.gz,
// 64 cases) is checked as a second reference for both the neutrality
// reproduction and the stale-input negative check. Row counts are NOT
// comparable this round (4 vs 64) — the maintained proof has been a
// 4-row --n 1 panel since r211, and this round regenerates at that
// spec; only the neutrality tuple is compared across panels.
// The pattern-faithful negatives — the two most recent prior panels —
// are r211-rebased and b20. The 9be3676d8 panel from this round's first
// regeneration (evidence/2026-11-17/neutral-gateproof-a.json.gz) is
// checked as a third negative: master moved during the run (deathcleanup-b
// + r233 touched 6 manifest files), so the first panel is stale on the
// rebased tip and the re-point target is the REGENERATED panel only.
// Older negatives (b19/b18/b13/b12) are verified separately in the
// owed-check (see the round evidence file), not as legs here.
// Run from the repo root: node scripts/test-gateproof-a.js
const fs = require('fs'), path = require('path'), zlib = require('zlib'),
  cp = require('child_process');
const root = path.resolve(__dirname, '..');
const NEW = path.join(root, 'evidence/2026-11-17/neutral-gateproof-a-rebased.json.gz');
const OLD = path.join(root, 'evidence/2026-11-15/neutral-r211-rebased.json.gz');
const OLD6 = path.join(root, 'evidence/2026-11-15/neutral-proofrefresh-b20.json.gz');
const SUPERSEDED = path.join(root, 'evidence/2026-11-17/neutral-gateproof-a.json.gz');
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
function neutTuple(panel) {
  const neut = panel.validity && panel.validity.neutrality || [];
  return JSON.stringify(neut.map(n => [n.policy, n.seed, n.match, n.warnings]));
}

// (a) balance-proof-update validate passes on the new panel.
try {
  const proof = require('./balance-proof.json');
  const panel = readPanel(NEW);
  const normalized = require('./balance-proof-update').validate(root, panel);
  leg('balance-proof-update validate passes on the new panel',
    JSON.stringify(normalized) === JSON.stringify(proof.normalizedSources) &&
    proof.panel === 'evidence/2026-11-17/neutral-gateproof-a-rebased.json.gz',
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

// (e) panel rows complete: 4 observed cases, one per policy/seed combo.
const combos = new Set(fresh.rows.map(r => r.row.policy + '/' + r.row.seed));
leg('panel rows complete (4 observed cases)',
  fresh.rows.length === 4 && combos.size === 4,
  fresh.rows.length + ' rows, ' + combos.size + ' distinct policy/seed combos');

// (f) neutrality verdict reproduces the previous RETAINED panel (r211).
const old = readPanel(OLD);
const oldNeut = old.validity && old.validity.neutrality || [];
leg('neutrality verdict reproduces the retained panel (r211)',
  neutTuple(fresh) === neutTuple(old),
  'retained ' + oldNeut.map(n => n.policy + ':' + (n.match ? 'match' : 'MISMATCH')).join(', '));

// (g) neutrality verdict also reproduces the b20 panel (second reference).
const old6 = readPanel(OLD6);
leg('neutrality verdict reproduces the b20 panel',
  neutTuple(fresh) === neutTuple(old6),
  'b20 ' + (old6.validity.neutrality || []).map(n => n.policy + ':' + (n.match ? 'match' : 'MISMATCH')).join(', '));

// (h) validity.sourcesStable true.
leg('validity.sourcesStable true', fresh.validity && fresh.validity.sourcesStable === true);

// (i) stale-input negative check: the RETAINED panel (r211) must FAIL validate
// on this tip, proving the green result is not vacuous — the harness still
// detects stale source inputs.
try {
  require('./balance-proof-update').validate(root, old);
  leg('stale-input negative check (retained panel r211 fails validate)', false, 'validate passed on a stale panel');
} catch (e) {
  leg('stale-input negative check (retained panel r211 fails validate)',
    /Proof source inputs are not current/.test(e.message), e.message);
}

// (j) stale-input negative check, second reference: the b20 panel must
// also FAIL validate on this tip.
try {
  require('./balance-proof-update').validate(root, old6);
  leg('stale-input negative check (b20 panel fails validate)', false, 'validate passed on a stale panel');
} catch (e) {
  leg('stale-input negative check (b20 panel fails validate)',
    /Proof source inputs are not current/.test(e.message), e.message);
}

// (k) stale-input negative check, third reference: this round's FIRST
// panel (generated on 9be3676d8) must also FAIL validate on the rebased
// tip — proving the regeneration after the master move was owed, not
// cosmetic.
try {
  require('./balance-proof-update').validate(root, readPanel(SUPERSEDED));
  leg('stale-input negative check (9be3676d8 panel fails validate)', false, 'validate passed on a stale panel');
} catch (e) {
  leg('stale-input negative check (9be3676d8 panel fails validate)',
    /Proof source inputs are not current/.test(e.message), e.message);
}

console.log('\ntest-gateproof-a: ' + pass + ' passed, ' + fail + ' failed, 0 todo (phase 0)');
process.exitCode = fail ? 1 : 0;
