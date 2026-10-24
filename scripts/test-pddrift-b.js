#!/usr/bin/env node
// test-pddrift-b.js — proof for the sim-pddrift-b bisection instruments
// (sim-pddrift-b, 2026-10-24, oversight-flesh-out-loop-b, axis food-economy).
//
// P1 driver carries the FATAL env asserts + anchorCommit tagging + anchor
//    in per-seed filenames (static checks on the driver source).
// P2 analyzer --compare normalizes BOTH ms and medianSurvival out
//    (backlog #870: the pdtradeoff analyzer normalized medianSurvival
//    only); a rot difference still compares DIFFER.
// P3 smoke run in this worktree (master anchor): 1 seed, pd0, dg1,
//    leadfeast → per-seed JSON exists, schema fields present, tagged
//    with the master anchor sha.
// P4 extraction smoke: `git archive c76a5248 | tar -x` into
//    bisect-scratch/, driver copied in, 1 seed pd0 runs there and its
//    output lands in this worktree's proof dir (never /tmp, never a
//    worktree, never a checkout in this worktree).
// P5 analyzer exits 2 on a missing/empty corpus (fails loudly).
// P6 analyzer aggregates a synthetic corpus correctly (ratio math +
//    family bands + exoneration classification).
//
// Proof scratch dirs (evidence/2026-10-24/pddrift-proof/,
// bisect-scratch/) are DELETED by this script on success and on failure
// paths it controls; a leftover after a crash is a loud failure, not a
// silent artifact (the runner asserts cleanup at the end).
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const WT = ROOT;
let pass = 0, fail = 0;
function check(name, ok, extra) {
  if (ok) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function rmDir(p) { try { fs.rmSync(p, { recursive: true, force: true }); } catch (e) {} }
function run(cmd, opts) {
  return spawnSync('bash', ['-c', cmd], Object.assign({ cwd: WT, encoding: 'utf8', timeout: 300000 }, opts || {}));
}

// --- P1: static checks on the driver ---
const driver = fs.readFileSync(path.join(__dirname, 'sweep-pddrift-b.js'), 'utf8');
check('P1a FATAL FEASTSCALE/SEATDRIVE asserts', driver.includes("FEASTSCALE_R13 !== '1'") && driver.includes("SEATDRIVE !== '0'"));
check('P1b FATAL ANCHOR assert', driver.includes('FATAL: ANCHOR=<git sha>'));
check('P1c FATAL PLENTYDEPRI + DEPOSITGATE=1 asserts', driver.includes('requires PLENTYDEPRI=') && driver.includes('DEPOSITGATE=1 must be set'));
check('P1d anchorCommit tagging + anchor in filename', driver.includes('anchorCommit: ANCHOR') && driver.includes('ANCHOR.slice(0, 8)'));
check('P1e dg1-only (no dg0 path)', !driver.includes("DG === 'dg1' ? '1' : '0'") && driver.includes('depositgate: 1'));

// --- P2: analyzer normalization ---
const proofDir = path.join(ROOT, 'evidence', '2026-10-24', 'pddrift-proof');
rmDir(proofDir); fs.mkdirSync(proofDir, { recursive: true });
const base = { seed: 9250, anchorCommit: 'abc', daysAlive: 100, rotFreshKcal: 1000, rotPreservedKcal: 500, medianSurvival: 99, ms: 1234, diag: { ms: 999 } };
fs.writeFileSync(path.join(proofDir, 'a.json'), JSON.stringify(base));
fs.writeFileSync(path.join(proofDir, 'b.json'), JSON.stringify(Object.assign({}, base, { medianSurvival: 50, ms: 777, diag: { ms: 111 } })));
fs.writeFileSync(path.join(proofDir, 'c.json'), JSON.stringify(Object.assign({}, base, { rotFreshKcal: 2000 })));
let r = run(`node scripts/analyze-pddrift-b.js --compare evidence/2026-10-24/pddrift-proof/a.json evidence/2026-10-24/pddrift-proof/b.json`);
check('P2a ms+medianSurvival normalized to IDENTICAL', r.status === 0, 'exit ' + r.status + ' ' + (r.stdout || '') + (r.stderr || ''));
r = run(`node scripts/analyze-pddrift-b.js --compare evidence/2026-10-24/pddrift-proof/a.json evidence/2026-10-24/pddrift-proof/c.json`);
check('P2b real rot difference still DIFFER', r.status === 2, 'exit ' + r.status);

// --- P3: smoke run in this worktree (master anchor) ---
const masterSha = execSync('git rev-parse HEAD', { cwd: WT, encoding: 'utf8' }).trim();
const env3 = Object.assign({}, process.env, { FEASTSCALE_R13: '1', SEATDRIVE: '0', ANCHOR: masterSha, SIDE: 'pd0', PLENTYDEPRI: '0', DEPOSITGATE: '1', POLICY: 'leadfeast', SEEDS: '9250', DAYS: '100', PERSEED_DIR: proofDir, OUT: path.join(proofDir, 'sweep-proof.json') });
r = spawnSync('node', ['scripts/sweep-pddrift-b.js'], { cwd: WT, encoding: 'utf8', timeout: 300000, env: env3 });
const seedFile = fs.readdirSync(proofDir).filter(f => f.includes('-s9250.json') && f.includes('pddrift-b-'));
check('P3a smoke run exits 0', r.status === 0, 'exit ' + r.status + ' ' + (r.stderr || '').slice(-500));
check('P3b per-seed JSON written', seedFile.length === 1, JSON.stringify(seedFile));
if (seedFile.length === 1) {
  const row = JSON.parse(fs.readFileSync(path.join(proofDir, seedFile[0]), 'utf8'));
  check('P3c schema + anchorCommit tag', row.seed === 9250 && row.policy === 'leadfeast' && row.plentydepri === 0 && row.depositgate === 1 && row.anchorCommit === masterSha && typeof row.daysAlive === 'number' && typeof row.rotFreshKcal === 'number', JSON.stringify(Object.keys(row)));
  check('P3d anchor in filename', seedFile[0].includes(masterSha.slice(0, 8)));
}

// --- P4: extraction smoke (old anchor, no checkout, no /tmp worktree) ---
const scratch = path.join(WT, 'bisect-scratch', 'proof-c76a5248');
rmDir(path.join(WT, 'bisect-scratch'));
try {
  execSync(`mkdir -p ${scratch} && git archive c76a5248 | tar -x -C ${scratch}`, { cwd: WT, encoding: 'utf8', timeout: 300000 });
  fs.copyFileSync(path.join(__dirname, 'sweep-pddrift-b.js'), path.join(scratch, 'scripts', 'sweep-pddrift-b.js'));
  const env4 = Object.assign({}, process.env, { FEASTSCALE_R13: '1', SEATDRIVE: '0', ANCHOR: 'c76a5248', SIDE: 'pd0', PLENTYDEPRI: '0', DEPOSITGATE: '1', POLICY: 'leadfeast', SEEDS: '9250', DAYS: '100', PERSEED_DIR: proofDir, OUT: path.join(proofDir, 'sweep-proof-old.json') });
  r = spawnSync('node', ['scripts/sweep-pddrift-b.js'], { cwd: scratch, encoding: 'utf8', timeout: 300000, env: env4 });
  const oldFile = fs.readdirSync(proofDir).filter(f => f.startsWith('pddrift-b-c76a5248-') && f.includes('-s9250.json'));
  check('P4a extracted old-anchor run exits 0', r.status === 0, 'exit ' + r.status + ' ' + (r.stderr || '').slice(-500));
  check('P4b old-anchor per-seed JSON written to worktree proof dir', oldFile.length === 1, JSON.stringify(oldFile));
  if (oldFile.length === 1) {
    const row = JSON.parse(fs.readFileSync(path.join(proofDir, oldFile[0]), 'utf8'));
    check('P4c old-anchor row tagged c76a5248', row.anchorCommit === 'c76a5248' && row.seed === 9250);
  }
} catch (e) {
  check('P4 extraction smoke', false, String(e.message || e).slice(0, 300));
}

// --- P5: analyzer fails loudly on empty corpus ---
const emptyDir = path.join(proofDir, 'empty');
fs.mkdirSync(emptyDir, { recursive: true });
r = run(`node scripts/analyze-pddrift-b.js evidence/2026-10-24/pddrift-proof/empty`);
check('P5 analyzer exits 2 on empty corpus', r.status === 2, 'exit ' + r.status);

// --- P6: synthetic aggregation (ratio math + families) ---
const synthDir = path.join(proofDir, 'synth');
fs.mkdirSync(synthDir, { recursive: true });
function synthRow(anchor, pd, days, rot) {
  return { seed: 9250, policy: 'leadfeast', plentydepri: pd, depositgate: 1, daysAlive: days, villageDays: days * 12, rotFreshKcal: rot, rotPreservedKcal: 0, depriKcal: 0, deathCauses: {}, national: false, table: false, win: false, waveReach: [1], medianSurvival: null, anchorCommit: anchor };
}
// parent OLD: pd0 rot100d 1000, pd1 500 -> 0.500x OLD; commit NEW: pd0 1000, pd1 950 -> 0.950x NEW
fs.writeFileSync(path.join(synthDir, 'pddrift-b-parent-pd0.json'), JSON.stringify(synthRow('parent111', 0, 100, 100000)));
fs.writeFileSync(path.join(synthDir, 'pddrift-b-parent-pd1.json'), JSON.stringify(synthRow('parent111', 1, 100, 50000)));
fs.writeFileSync(path.join(synthDir, 'pddrift-b-commit-pd0.json'), JSON.stringify(synthRow('commit222', 0, 100, 100000)));
fs.writeFileSync(path.join(synthDir, 'pddrift-b-commit-pd1.json'), JSON.stringify(synthRow('commit222', 1, 100, 95000)));
r = run(`node scripts/analyze-pddrift-b.js evidence/2026-10-24/pddrift-proof/synth`);
check('P6a synthetic ratios computed', r.status === 0 && r.stdout.includes('0.500x') && r.stdout.includes('0.950x'), 'exit ' + r.status + ' ' + (r.stdout || '').slice(0, 400));
check('P6b families OLD/NEW shown', (r.stdout || '').includes('OLD') && (r.stdout || '').includes('NEW'));

// --- cleanup (proof dirs must not leak into the commit) ---
rmDir(proofDir);
rmDir(path.join(WT, 'bisect-scratch'));
check('P7 proof scratch cleaned', !fs.existsSync(proofDir) && !fs.existsSync(path.join(WT, 'bisect-scratch')));

console.log(`\ntest-pddrift-b: ${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
