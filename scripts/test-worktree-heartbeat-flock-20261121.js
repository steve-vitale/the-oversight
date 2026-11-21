// test-worktree-heartbeat-flock-20261121.js — proof test for the
// journey-landing r151 worktree-heartbeat.sh flock timeout.
//
// The heartbeat script must FAIL LOUD (non-zero, bounded time, no
// heartbeat written) when the registry lock is held, instead of blocking
// indefinitely behind it (r149: a beat hung ~19 min silently).
//
// Two cases, both against the LIVE registry (the script hardcodes its
// paths; holding the lock ~10s is normal contention scale):
//   1. free lock: heartbeat lands (rc 0, heartbeat_at advances).
//   2. held lock: heartbeat with HEARTBEAT_FLOCK_TIMEOUT=3 exits 1
//      within 10s and writes NO heartbeat.
// Usage: node scripts/test-worktree-heartbeat-flock-20261121.js
//   HB_SCRIPT=/path/to/worktree-heartbeat.sh  (default: sibling script)
// Exits 0 iff both cases pass.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const HOME = os.homedir();
const WTBASE = path.join(HOME, 'workspace', 'worktrees');
const REG = path.join(WTBASE, 'REGISTRY.json');
const LOCK = path.join(WTBASE, 'REGISTRY.lock');
const SCRIPT = process.env.HB_SCRIPT || path.join(__dirname, 'worktree-heartbeat.sh');

let pass = 0;
let fail = 0;
function check(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (ok) pass++; else fail++;
}

function readHeartbeat(slug) {
  const data = JSON.parse(fs.readFileSync(REG, 'utf8'));
  const tree = (data.trees || []).find(t => t.slug === slug);
  return tree ? tree.heartbeat_at : null;
}

function pickSlug() {
  const data = JSON.parse(fs.readFileSync(REG, 'utf8'));
  const trees = data.trees || [];
  const mine = trees.find(t => t.slug === 'journey-landing');
  if (mine) return mine.slug;
  if (trees.length) return trees[0].slug;
  return null;
}

function runHeartbeat(envExtra, timeoutMs) {
  const start = Date.now();
  const r = spawnSync('bash', [SCRIPT, SLUG], {
    env: { ...process.env, ...envExtra },
    timeout: timeoutMs,
    encoding: 'utf8',
  });
  return { rc: r.status, ms: Date.now() - start, stderr: (r.stderr || '').trim() };
}

const SLUG = pickSlug();
if (!SLUG) {
  console.log('FAIL no registered worktree slug in REGISTRY.json — cannot run');
  process.exit(1);
}
if (!fs.existsSync(SCRIPT)) {
  console.log(`FAIL heartbeat script missing: ${SCRIPT}`);
  process.exit(1);
}
console.log(`slug=${SLUG} script=${SCRIPT}`);

// Case 1: free lock — heartbeat lands. (Bounded 60s flock wait + 90s
// outer timeout: under live contention a sibling registration can hold
// the lock for minutes; a manual proof run retries when the tree is
// quieter. The discriminating case is case 2 below.)
const before1 = readHeartbeat(SLUG);
const r1 = runHeartbeat({ HEARTBEAT_FLOCK_TIMEOUT: '60' }, 90000);
const after1 = readHeartbeat(SLUG);
check('free-lock rc 0', r1.rc === 0, `rc=${r1.rc} stderr=${r1.stderr}`);
check('free-lock heartbeat_at advances', before1 !== after1 && !!after1, `${before1} -> ${after1}`);

// Case 2: held lock — heartbeat fails loud within 10s, writes nothing.
const before2 = readHeartbeat(SLUG);
const holder = spawn('bash', ['-c', `exec 200>"${LOCK}"; flock -x 200; sleep 10`], { stdio: 'ignore' });
const sleepSync = ms => spawnSync('sleep', [String(ms / 1000)]);
sleepSync(1500); // let the holder acquire the lock
const r2 = runHeartbeat({ HEARTBEAT_FLOCK_TIMEOUT: '3' }, 15000);
const after2 = readHeartbeat(SLUG);
holder.kill('SIGKILL');
check('held-lock rc 1 (fail loud, not hang)', r2.rc === 1, `rc=${r2.rc} in ${r2.ms}ms stderr=${r2.stderr}`);
check('held-lock bounded time (<10s)', r2.ms < 10000, `${r2.ms}ms`);
check('held-lock no heartbeat written', before2 === after2, `${before2} -> ${after2}`);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
