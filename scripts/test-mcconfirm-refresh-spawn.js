#!/usr/bin/env node
// test-mcconfirm-refresh-spawn.js — spawn-time measurement for item (b)
// of sim-mcconfirm-refresh-b: does the cache-flags test's 30s spawn cap
// hold under concurrent-panel load?
//
// WHAT THIS SCRIPT DOES (test runs only, no sims of its own — the load
// panel IS the sibling panel, the same shape as the b7/b8 trip):
//   1. Starts a sibling balance-panel (16 seeds, capable, 150d) in the
//      background and keeps one running through the whole measurement,
//      restarting the IDENTICAL command on a fresh --out dir if it exits
//      (every restart is recorded).
//   2. Times N=12 sequential COLD spawns of the test's exact invocation
//      (node scripts/balance-panel.js --seeds 7 --policies zero --days 1
//      --par 1, fresh tmp out dir each, SIMOPT alternating 0/1) with a
//      generous 300s outer timeout, so the true spawn time is measured
//      instead of the 30s cap cutting it.
//   3. Runs the cache-flags test itself 3x consecutively under the same
//      load and records each run's exit code + "N passed, M failed".
//   4. Writes every sample + the decision inputs to
//      evidence/2026-11-12/mcconfirm-refresh-spawn-measure.json and
//      prints p50 / p95 (linear interpolation + nearest-rank) / max /
//      count over 30s.
//
// EXIT CODE: 0 when the measurement completed with a sibling panel
// alive throughout (the GO/NO-GO verdict lives in the evidence file,
// not in this exit code); 1 on a measurement failure (load would not
// start, a spawn errored other than by timeout, the test file is
// missing). This script never changes the 30s cap — the cap decision
// is a separate, preregistered step.
//
// Usage: node scripts/test-mcconfirm-refresh-spawn.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const cp = require('child_process');
const ROOT = path.join(__dirname, '..');
const RESULTS = path.join(ROOT, 'evidence', '2026-11-12', 'mcconfirm-refresh-spawn-measure.json');
const N_SPAWNS = 12;
const OUTER_TIMEOUT_MS = 300000;
const LOAD_SEEDS = '7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9';
const LOAD_POLICIES = 'capable';
const LOAD_DAYS = '150';

function loadAvg() {
  try { return fs.readFileSync('/proc/loadavg', 'utf8').trim().split(/\s+/).slice(0, 3).join(' '); }
  catch (e) { return 'unavailable:' + e.message; }
}
function sleep(ms) { const t0 = Date.now(); while (Date.now() - t0 < ms) {} }
function percentile(sorted, p) {
  // Linear interpolation (numpy 'linear'): rank = p/100 * (n-1).
  const n = sorted.length;
  if (n === 0) return null;
  if (n === 1) return sorted[0];
  const rank = (p / 100) * (n - 1);
  const lo = Math.floor(rank), hi = Math.ceil(rank);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (rank - lo);
}
function nearestRank(sorted, p) {
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1))];
}

const results = {
  run: 'mcconfirm-refresh-spawn',
  startedUtc: new Date().toISOString(),
  load: {
    command: 'node scripts/balance-panel.js --root <worktree> --seeds ' + LOAD_SEEDS +
      ' --policies ' + LOAD_POLICIES + ' --days ' + LOAD_DAYS + ' --out /tmp/mcconfirm-refresh-load-panel[-rN]',
    restarts: [],
  },
  loadAvg: {},
  spawns: [],
  testRuns: [],
  verdictInputs: {},
};

let loadChild = null;
let loadRound = 0;
const loadOutDirs = [];
function startLoad() {
  loadRound++;
  const outDir = '/tmp/mcconfirm-refresh-load-panel' + (loadRound === 1 ? '' : '-r' + loadRound);
  loadOutDirs.push(outDir);
  const logFile = fs.openSync('/tmp/mcconfirm-refresh-load-panel-' + loadRound + '.log', 'w');
  loadChild = cp.spawn(process.execPath, [
    path.join(ROOT, 'scripts', 'balance-panel.js'),
    '--root', ROOT, '--seeds', LOAD_SEEDS, '--policies', LOAD_POLICIES,
    '--days', LOAD_DAYS, '--out', outDir,
  ], { cwd: ROOT, detached: true, stdio: ['ignore', logFile, logFile] });
  loadChild.unref();
  results.load.restarts.push({ round: loadRound, startedUtc: new Date().toISOString(), outDir: outDir, pid: loadChild.pid });
  return loadChild;
}
function loadAlive() {
  if (!loadChild) return false;
  try { process.kill(loadChild.pid, 0); return true; } catch (e) { return false; }
}
function ensureLoad() {
  if (!loadAlive()) {
    const prev = results.load.restarts[results.load.restarts.length - 1];
    if (prev) prev.endedUtc = new Date().toISOString();
    startLoad();
    sleep(5000); // let the restarted panel get going before timing resumes
  }
}
function stopLoad() {
  if (loadChild) {
    try { process.kill(-loadChild.pid, 'SIGTERM'); } catch (e) { try { loadChild.kill('SIGTERM'); } catch (e2) {} }
    loadChild = null;
  }
}

const cacheFlagsTest = path.join(ROOT, 'scripts', 'godpath', 'test-measurement-cache-flags.js');
if (!fs.existsSync(cacheFlagsTest)) {
  console.error('MEASUREMENT FAILURE: cache-flags test missing: ' + cacheFlagsTest);
  process.exit(1);
}

try {
  console.log('mcconfirm-refresh-spawn: starting sibling load panel (round 1)...');
  startLoad();
  results.loadAvg.start = loadAvg();
  sleep(15000); // grace: let the load panel get its workers going
  if (!loadAlive()) {
    console.error('MEASUREMENT FAILURE: load panel died within the grace period');
    stopLoad();
    process.exit(1);
  }
  console.log('mcconfirm-refresh-spawn: load alive (pid ' + loadChild.pid + '), loadavg ' + results.loadAvg.start);

  for (let i = 0; i < N_SPAWNS; i++) {
    ensureLoad();
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'oversight-spawn-measure-'));
    const simopt = String(i % 2);
    const t0 = Date.now();
    let r;
    try {
      r = cp.spawnSync(process.execPath, [
        path.join(ROOT, 'scripts', 'balance-panel.js'),
        '--root', ROOT, '--seeds', '7', '--policies', 'zero', '--days', '1',
        '--out', out, '--par', '1',
      ], { cwd: ROOT, env: Object.assign({}, process.env, { SIMOPT: simopt }), encoding: 'utf8', timeout: OUTER_TIMEOUT_MS });
    } catch (e) {
      r = { status: null, error: String(e && e.message || e) };
    }
    const ms = Date.now() - t0;
    const sample = {
      i: i, simopt: simopt, ms: ms, seconds: +(ms / 1000).toFixed(1),
      status: (r && typeof r.status === 'number') ? r.status : null,
      timedOutOuter: !!(r && r.error && /ETIMEDOUT/.test(String(r.error.code || r.error))),
      over30s: ms > 30000,
      loadAlive: loadAlive(),
    };
    results.spawns.push(sample);
    console.log('  spawn ' + i + ' (SIMOPT=' + simopt + '): ' + sample.seconds + 's status=' + sample.status +
      (sample.timedOutOuter ? ' OUTER-TIMEOUT' : '') + (sample.over30s ? ' OVER-30s' : ''));
    try { fs.rmSync(out, { recursive: true, force: true }); } catch (e) {}
  }
  results.loadAvg.afterSpawns = loadAvg();

  for (let k = 0; k < 3; k++) {
    ensureLoad();
    const t0 = Date.now();
    const r = cp.spawnSync(process.execPath, [cacheFlagsTest],
      { cwd: ROOT, encoding: 'utf8', timeout: 600000 });
    const ms = Date.now() - t0;
    const out = (r.stdout || '') + (r.stderr || '');
    const m = out.match(/(\d+) passed, (\d+) failed/);
    const run = {
      k: k, ms: ms, seconds: +(ms / 1000).toFixed(1), exitCode: r.status,
      passed: m ? Number(m[1]) : null, failed: m ? Number(m[2]) : null,
      loadAlive: loadAlive(),
    };
    results.testRuns.push(run);
    console.log('  cache-flags test run ' + k + ': exit=' + r.status + ' ' +
      (m ? m[0] : 'no pass/fail line') + ' in ' + run.seconds + 's');
  }
  results.loadAvg.end = loadAvg();
} finally {
  stopLoad();
  for (const d of loadOutDirs) { try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) {} }
}

const times = results.spawns.map(function (s) { return s.ms; }).sort(function (a, b) { return a - b; });
const p50 = percentile(times, 50);
const p95 = percentile(times, 95);
const p95nr = nearestRank(times, 95);
const max = times[times.length - 1];
const over30 = results.spawns.filter(function (s) { return s.over30s; }).length;
results.verdictInputs = {
  n: times.length,
  samplesSeconds: results.spawns.map(function (s) { return s.seconds; }),
  p50Seconds: +(p50 / 1000).toFixed(1),
  p95SecondsInterp: +(p95 / 1000).toFixed(1),
  p95SecondsNearestRank: +(p95nr / 1000).toFixed(1),
  maxSeconds: +(max / 1000).toFixed(1),
  over30sCount: over30,
  testPassesOldCap: results.testRuns.filter(function (r) { return r.exitCode === 0; }).length + '/3',
  loadAliveThroughout: results.spawns.every(function (s) { return s.loadAlive; }) &&
    results.testRuns.every(function (r) { return r.loadAlive; }),
  loadRestarts: results.load.restarts.length,
};
results.finishedUtc = new Date().toISOString();
fs.writeFileSync(RESULTS, JSON.stringify(results, null, 2) + '\n');
console.log('mcconfirm-refresh-spawn: n=' + times.length +
  ' p50=' + results.verdictInputs.p50Seconds + 's' +
  ' p95(interp)=' + results.verdictInputs.p95SecondsInterp + 's' +
  ' p95(nearest-rank)=' + results.verdictInputs.p95SecondsNearestRank + 's' +
  ' max=' + results.verdictInputs.maxSeconds + 's' +
  ' over30s=' + over30 + '/' + times.length);
console.log('  cache-flags test under load: ' + results.verdictInputs.testPassesOldCap + ' passed (old 30s cap)');
console.log('  load alive throughout: ' + results.verdictInputs.loadAliveThroughout +
  ', restarts: ' + results.verdictInputs.loadRestarts);
console.log('  loadavg start=' + results.loadAvg.start + ' afterSpawns=' + results.loadAvg.afterSpawns + ' end=' + results.loadAvg.end);
console.log('  results: ' + path.relative(ROOT, RESULTS));
if (!results.verdictInputs.loadAliveThroughout) {
  console.error('MEASUREMENT FAILURE: load panel lapsed during the measurement');
  process.exit(1);
}
process.exit(0);
