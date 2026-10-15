#!/usr/bin/env node
// sweep-drinksafe-20261015.js — 8 seeds x {leadcourt, belongseek} x {control, armed},
// 180d death-aware, identical seeds both sides, OWN control in the same sweep.
// Children run one side per process (the competent.js variant is process-wide
// via the resolve hook in run-drinksafe-20261015.js).
//
// Gates (in order): A/B integrity (diff HEAD-vs-worktree competent.js == the
// one regex line) -> det-gate is in test-drinksafe-20261015.js PART B (run it
// first) -> SMOKE=1 sweep (1 seed x 2 policies x 2 sides x 15d).
//
// Usage:
//   SMOKE=1 node scripts/sweep-drinksafe-20261015.js   # gate (2 policies x 1 seed x 2 sides x 15d)
//   node scripts/sweep-drinksafe-20261015.js           # full sweep (32 runs)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

const ROOT = path.join(__dirname, '..');
const EVID = path.join(ROOT, 'evidence', '2026-10-15', 'drinksafe');
const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const POLICIES = ['leadcourt', 'belongseek'];
const SIDES = ['control', 'armed'];
const CONCURRENCY = 3;
const CHILD_TIMEOUT_MS = 30 * 60 * 1000;

const smoke = process.env.SMOKE === '1';
const seeds = smoke ? [11] : SEEDS;
const days = smoke ? 15 : 180;

const OLD_RX = '/creek|well|spring|river|pond|haven/i';
const NEW_RX = '/creek|wetland|pond|haven/i';

function sh(cmd) { return execSync(cmd, { cwd: ROOT }).toString('utf8'); }

function pinControl() {
  const sha = sh('git rev-parse HEAD').trim();
  const ctrlPath = path.join(EVID, `competent-control-${sha.slice(0, 12)}.js`);
  fs.mkdirSync(EVID, { recursive: true });
  const bytes = sh('git show HEAD:scripts/policies/competent.js');
  fs.writeFileSync(ctrlPath, bytes);
  console.error(`control pinned from HEAD ${sha.slice(0, 12)} -> ${ctrlPath}`);
  // A/B integrity: exactly one differing line, the regex swap
  const work = fs.readFileSync(path.join(ROOT, 'scripts', 'policies', 'competent.js'), 'utf8');
  if (!work.includes(NEW_RX) || work.includes(OLD_RX)) {
    console.error('A/B INTEGRITY FAIL: worktree competent.js does not carry the fixed regex'); process.exit(2);
  }
  if (bytes.includes(NEW_RX) || !bytes.includes(OLD_RX)) {
    console.error('A/B INTEGRITY FAIL: HEAD competent.js does not carry the old regex'); process.exit(2);
  }
  const wl = work.split('\n'), cl = bytes.split('\n');
  const diffs = [];
  for (let i = 0; i < Math.max(wl.length, cl.length); i++) if (wl[i] !== cl[i]) diffs.push(i);
  if (diffs.length !== 1 || !cl[diffs[0]].includes(OLD_RX) || !wl[diffs[0]].includes(NEW_RX)) {
    console.error(`A/B INTEGRITY FAIL: diff lines [${diffs.join(',')}] (want exactly the regex line)`);
    process.exit(2);
  }
  console.error('A/B integrity OK: control=old regex, armed=new regex, one line differs');
  return ctrlPath;
}

function runChild(policyId, seed, side, runDays, outPath, pristine) {
  return new Promise((resolve, reject) => {
    const args = [path.join(__dirname, 'run-drinksafe-20261015.js'),
      policyId, String(seed), side, String(runDays), outPath];
    if (pristine) args.push('1');
    const child = spawn('node', args, {
      cwd: ROOT,
      env: Object.assign({}, process.env, { DRINKSAFE_CONTROL: process.env.DRINKSAFE_CONTROL }),
      stdio: ['ignore', 'ignore', 'inherit'],
    });
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`TIMEOUT ${policyId} s${seed} ${side}${pristine ? ' pristine' : ''}`));
    }, CHILD_TIMEOUT_MS);
    child.on('error', (e) => { clearTimeout(timer); reject(e); });
    child.on('exit', (code) => {
      clearTimeout(timer);
      if (code !== 0) reject(new Error(`CHILD EXIT ${code}: ${policyId} s${seed} ${side}${pristine ? ' pristine' : ''}`));
      else resolve();
    });
  });
}

async function pool(tasks) {
  const running = new Set();
  for (const t of tasks) {
    while (running.size >= CONCURRENCY) await Promise.race(running);
    const p = t().finally(() => running.delete(p));
    running.add(p);
  }
  await Promise.all(running);
}

async function main() {
  const ctrlPath = pinControl();
  process.env.DRINKSAFE_CONTROL = ctrlPath;
  const t0 = Date.now();
  const tasks = [];
  for (const policyId of POLICIES) {
    for (const seed of seeds) {
      for (const side of SIDES) {
        const out = path.join(EVID, `run-${policyId}-s${seed}-${side}.json`);
        tasks.push(() => runChild(policyId, seed, side, days, out, false));
      }
    }
  }
  console.error(`sweep: ${tasks.length} runs, concurrency ${CONCURRENCY}, days=${days}${smoke ? ' (SMOKE)' : ''}`);
  await pool(tasks);
  // A/A sanity: pristine twin for leadcourt s11 control must be byte-identical
  // to the instrumented control run (instrument honesty at sweep scale).
  const aaOut = path.join(EVID, 'run-leadcourt-s11-control-pristine.json');
  await runChild('leadcourt', 11, 'control', days, aaOut, true);
  const a = JSON.parse(fs.readFileSync(path.join(EVID, 'run-leadcourt-s11-control.json'), 'utf8'));
  const b = JSON.parse(fs.readFileSync(aaOut, 'utf8'));
  const same = a.hashes.length === b.hashes.length && a.hashes.length > 0 &&
    a.hashes.every((h, i) => h === b.hashes[i]);
  // per-run A/B honesty: every run loaded its side's competent.js
  let honest = true;
  for (const policyId of POLICIES) for (const seed of seeds) for (const side of SIDES) {
    const row = JSON.parse(fs.readFileSync(path.join(EVID, `run-${policyId}-s${seed}-${side}.json`), 'utf8'));
    const isCtrl = row.competentPath === ctrlPath;
    const ok = side === 'control' ? isCtrl : !isCtrl;
    if (!ok) { console.error(`A/B HONESTY FAIL: ${policyId} s${seed} ${side} loaded ${row.competentPath}`); honest = false; }
  }
  console.error(`A/A leadcourt s11 control: ${same ? 'BYTE-IDENTICAL' : 'DIVERGED'} (${a.hashes.length}d)`);
  console.error(`A/B load honesty: ${honest ? 'OK (32/32)' : 'FAIL'}`);
  console.error(`sweep done in ${Math.round((Date.now() - t0) / 1000)}s`);
  if (!same || !honest) process.exit(2);
}
main().catch(e => { console.error('SWEEP ERROR', e.message); process.exit(2); });
