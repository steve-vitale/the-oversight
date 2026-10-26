#!/usr/bin/env node
// scripts/test-r52split-a.js — r52 3-file drift split driver
// (scale-onramp axis, 2026-10-26: restore ONE of abilityActions.js /
// corpses.js / corruption.js to its e8f2ccad7 version at a time,
// re-run the 73671-73678 band with the flip arm's instrument
// VERBATIM (scripts/test-rebaseline-sweep.js), record per-file
// tables. DIAG/MEASUREMENT ONLY — every swap is reverted before
// this script exits, and the final src/js state is verified
// byte-identical to HEAD by blob hash.
//
// Usage:
//   node scripts/test-r52split-a.js <corpus>   # corpus = rebaseline | combined | ability | corpses | corruption
//   node scripts/test-r52split-a.js --verify   # verify only: files match HEAD blobs, no swap
//
// Corpora:
//   rebaseline : no swap (current HEAD engine)
//   combined   : all 3 files -> e8f2ccad7 (E3 control)
//   ability     : abilityActions.js -> e8f2ccad7 only
//   corpses    : corpses.js -> e8f2ccad7 only
//   corruption : corruption.js -> e8f2ccad7 only
//
// EVID dir per corpus: evidence/2026-10-26/perseed-sim-r52split-a-<corpus>/
// Exit 1 if any sweep seed fails, the summary corpus gate fails,
// or the post-run restore verification fails. The restore runs in
// a finally block: a sweep failure still restores the files.
// Write flap class (2026-10-24): file writes retry 8x with backoff
// and are verified by blob hash after every write.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const OLD = 'e8f2ccad7';
const FILES = ['src/js/abilityActions.js', 'src/js/corpses.js', 'src/js/corruption.js'];
const CORPORA = {
  rebaseline: [],
  combined: FILES,
  ability: ['src/js/abilityActions.js'],
  corpses: ['src/js/corpses.js'],
  corruption: ['src/js/corruption.js'],
};
const SEEDS = [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];

function sh(cmd, args) {
  return execFileSync(cmd, args, { cwd: REPO, encoding: 'utf8' }).trim();
}
function blobHash(rev, file) { return sh('git', ['rev-parse', `${rev}:${file}`]); }
function fileHash(file) { return sh('git', ['hash-object', file]); }
function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) { /* best-effort */ } }
function writeVerified(file, bytes, expectHash) {
  let lastErr = null;
  for (let a = 1; a <= 8; a++) {
    try {
      fs.writeFileSync(path.join(REPO, file), bytes);
      const got = fileHash(file);
      if (got === expectHash) return;
      lastErr = new Error(`hash mismatch after write: got ${got} want ${expectHash}`);
    } catch (e) { lastErr = e; }
    console.log(`WRITE-RETRY ${file} attempt=${a} err=${String((lastErr && lastErr.message) || lastErr).slice(0, 160)}`);
    if (a < 8) sleepMs(Math.min(10000, 1000 * a));
  }
  throw lastErr;
}
function verifyHead() {
  for (const f of FILES) {
    const want = blobHash('HEAD', f);
    const got = fileHash(f);
    if (got !== want) throw new Error(`HEAD VERIFY FAIL ${f}: got ${got} want ${want}`);
  }
  console.log('HEAD-VERIFY OK: all 3 files byte-identical to HEAD blobs');
}
function swapToOld(files) {
  for (const f of files) {
    const bytes = execFileSync('git', ['show', `${OLD}:${f}`], { cwd: REPO });
    writeVerified(f, bytes, blobHash(OLD, f));
    console.log(`SWAPPED ${f} -> ${OLD} (blob ${blobHash(OLD, f).slice(0, 12)})`);
  }
}
function runSweep(corpus) {
  const evid = path.join(REPO, 'evidence', '2026-10-26', `perseed-sim-r52split-a-${corpus}`);
  fs.mkdirSync(evid, { recursive: true });
  for (const seed of SEEDS) {
    const r = spawnSync('node', ['scripts/test-rebaseline-sweep.js', '--one', 'rebaseline', String(seed)],
      { cwd: REPO, encoding: 'utf8', env: Object.assign({}, process.env, { EVID: evid }) });
    const line = (r.stdout || '').split('\n').filter(l => l.indexOf(`[rebaseline seed ${seed}]`) >= 0).join('\n');
    console.log(line || `(seed ${seed}: no sweep line; exit=${r.status})`);
    if (r.status !== 0) {
      console.log((r.stdout || '').slice(-2000));
      console.log((r.stderr || '').slice(-2000));
      throw new Error(`sweep seed ${seed} failed (exit ${r.status})`);
    }
  }
  const s = spawnSync('node', ['scripts/test-rebaseline-sweep.js', '--summary'],
    { cwd: REPO, encoding: 'utf8', env: Object.assign({}, process.env, { EVID: evid }) });
  console.log(s.stdout || '');
  if (s.status !== 0) {
    console.log((s.stderr || '').slice(-2000));
    throw new Error(`summary gate failed for corpus ${corpus} (exit ${s.status})`);
  }
  console.log(`CORPUS ${corpus} COMPLETE -> ${evid}`);
}
function main() {
  const arg = process.argv[2];
  if (arg === '--verify') { verifyHead(); return; }
  if (!CORPORA[arg]) { console.error('usage: test-r52split-a.js <rebaseline|combined|ability|corpses|corruption|--verify>'); process.exit(2); }
  console.log(`R52SPLIT corpus=${arg} base=${sh('git', ['rev-parse', 'HEAD']).slice(0, 12)} old=${OLD}`);
  verifyHead();
  try {
    swapToOld(CORPORA[arg]);
    runSweep(arg);
  } finally {
    // Restore EVERYTHING to HEAD, verified by blob hash, even on failure.
    for (const f of FILES) {
      const bytes = execFileSync('git', ['show', `HEAD:${f}`], { cwd: REPO });
      writeVerified(f, bytes, blobHash('HEAD', f));
    }
    console.log('RESTORED all 3 files to HEAD');
    verifyHead();
  }
}
if (require.main === module) main();
