#!/usr/bin/env node
// test-vetbisect-20261023.js — proof gates for the vetbaseline-bisect DIAG
// instrument (arm sim-vetbaseline-bisect, convergence backlog #829).
//
// E0: shape + env guard (usage prints; substrate guard fires without KILLDISC).
// E1: det-gate — same commit => identical kill totals AND byte-identical
//     JSONs across two full 16-config control corpora.
// E2: old anchor 4945cf38c => control kill total == 2 (RED->GREEN anchor).
// E3: new anchor f2daadf3d => control kill total == 10 (RED->GREEN anchor).
//
// E2/E3 ARE the endpoint validation: if they fail, the drift does not
// reproduce with this instrument — STOP, do not bisect a phantom.
// The tree is restored to its starting branch at the end (try/finally).
//
// Usage (env-trap lesson: run EXACTLY per this env):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   ARMORYDRIVE=1 KILLDISC=1 \
//   node test-vetbisect-20261023.js --tree <repo-tree> --runner <diag-script> --scratch <dir>
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync, spawnSync } = require('child_process');

const OLD = '4945cf38c0195c8e51bff8dd9889d51715085120';
const NEW = 'f2daadf3d40eb3379448084d2c94dc0dd4572393';

function arg(name) {
  const i = process.argv.indexOf(name);
  return (i >= 0 && i + 1 < process.argv.length) ? process.argv[i + 1] : null;
}
const TREE = arg('--tree');
const RUNNER = arg('--runner');
const SCRATCH = arg('--scratch');
if (!TREE || !RUNNER || !SCRATCH) {
  console.error('Usage: node test-vetbisect-20261023.js --tree <repo-tree> --runner <diag-script> --scratch <dir>');
  process.exit(2);
}
fs.mkdirSync(SCRATCH, { recursive: true });

let PASS = 0, FAIL = 0;
function check(name, ok, detail) {
  if (ok) { PASS++; console.log(`  [PASS] ${name}${detail ? ' — ' + detail : ''}`); }
  else { FAIL++; console.log(`  [FAIL] ${name}${detail ? ' — ' + detail : ''}`); }
}

function runRunner(out, commit) {
  const args = [RUNNER, '--tree', TREE, '--out', out];
  if (commit) args.push('--commit', commit);
  const r = spawnSync('node', args, { env: process.env, stdio: 'pipe', encoding: 'utf8', timeout: 25 * 60 * 1000 });
  return r;
}
function totalFrom(out) {
  const fp = path.join(out, 'ledger.jsonl');
  const lines = fs.readFileSync(fp, 'utf8').trim().split('\n');
  return JSON.parse(lines[lines.length - 1]);
}
function sha256Dir(out) {
  const h = {};
  for (const f of fs.readdirSync(out).filter(f => f.endsWith('.json') && f !== 'ledger.jsonl')) {
    h[f] = crypto.createHash('sha256').update(fs.readFileSync(path.join(out, f))).digest('hex');
  }
  return h;
}

// Starting branch for restore.
let startRef = null;
try { startRef = execSync('git rev-parse --abbrev-ref HEAD', { cwd: TREE }).toString().trim(); } catch (e) {}
if (!startRef || startRef === 'HEAD') startRef = 'sim-vetbaseline-bisect';

try {
  console.log('E0: shape + env guard');
  check('runner script exists', fs.existsSync(RUNNER), RUNNER);
  const help = spawnSync('node', [RUNNER], { env: process.env, encoding: 'utf8' });
  check('usage prints on missing args', /VETBISECT STOP|Usage/.test((help.stderr || '') + (help.stdout || '')), 'exit=' + help.status);
  const noEnv = Object.assign({}, process.env);
  delete noEnv.KILLDISC;
  const guard = spawnSync('node', [RUNNER, '--tree', TREE, '--out', path.join(SCRATCH, 'e0-guard')],
    { env: noEnv, encoding: 'utf8' });
  check('substrate guard fires without KILLDISC=1', guard.status === 2 && /KILLDISC/.test(guard.stderr || ''), 'exit=' + guard.status);

  console.log('E1: det-gate (same commit => identical corpus)');
  const d1 = path.join(SCRATCH, 'e1-a'), d2 = path.join(SCRATCH, 'e1-b');
  const r1 = runRunner(d1, null);
  check('det run A completes', r1.status === 0, r1.status !== 0 ? (r1.stderr || '').slice(-300) : '');
  let leg1 = null;
  if (r1.status === 0) { leg1 = totalFrom(d1); console.log(`       run A: commit=${leg1.commit} total=${leg1.total}`); }
  const r2 = runRunner(d2, null);
  check('det run B completes', r2.status === 0, r2.status !== 0 ? (r2.stderr || '').slice(-300) : '');
  if (r1.status === 0 && r2.status === 0) {
    const leg2 = totalFrom(d2);
    check('det: same commit', leg1.commit === leg2.commit, `${leg1.commit} vs ${leg2.commit}`);
    check('det: identical kill totals', leg1.total === leg2.total, `${leg1.total} vs ${leg2.total}`);
    const h1 = sha256Dir(d1), h2 = sha256Dir(d2);
    const keys = Object.keys(h1);
    const same = keys.length === 16 && keys.every(k => h1[k] === h2[k]);
    check('det: byte-identical JSONs (sha256, 16 files)', same, `${keys.length} files`);
  }

  console.log('E2: old anchor 4945cf38c => total == 2');
  const dOld = path.join(SCRATCH, 'e2-old');
  const rOld = runRunner(dOld, OLD);
  check('old-anchor corpus completes', rOld.status === 0, rOld.status !== 0 ? (rOld.stderr || '').slice(-300) : '');
  if (rOld.status === 0) {
    const leg = totalFrom(dOld);
    console.log(`       old anchor: commit=${leg.commit} total=${leg.total} seedsWith=${leg.seedsWith}`);
    check('old anchor reproduces 2 kills', leg.total === 2, `total=${leg.total}`);
  }

  console.log('E3: new anchor f2daadf3d => total == 10');
  const dNew = path.join(SCRATCH, 'e3-new');
  const rNew = runRunner(dNew, NEW);
  check('new-anchor corpus completes', rNew.status === 0, rNew.status !== 0 ? (rNew.stderr || '').slice(-300) : '');
  if (rNew.status === 0) {
    const leg = totalFrom(dNew);
    console.log(`       new anchor: commit=${leg.commit} total=${leg.total} seedsWith=${leg.seedsWith}`);
    check('new anchor reproduces 10 kills', leg.total === 10, `total=${leg.total}`);
  }
} finally {
  try {
    execSync(`git checkout ${startRef}`, { cwd: TREE, stdio: ['ignore', 'pipe', 'pipe'] });
    const back = execSync('git rev-parse HEAD', { cwd: TREE }).toString().trim().slice(0, 12);
    console.log(`restored tree to ${startRef} (${back})`);
  } catch (e) {
    console.error('PROOF FAIL: could not restore tree to ' + startRef + ': ' + ((e && e.message) || e));
    FAIL++;
  }
}

console.log(`\nvetbisect proof: ${PASS} PASS, ${FAIL} FAIL`);
process.exit(FAIL ? 1 : 0);
