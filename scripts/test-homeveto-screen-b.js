#!/usr/bin/env node
// test-homeveto-screen-b.js — proof for the sim-homeveto-band-b
// screening instrument (prereg evidence/2026-11-02/
// sim-homeveto-band-b-prereg.md, census section). Fixtures are
// driver-shaped records written to /tmp only (new tests must not
// write into the repo). Asserts:
// (a) the screener counts homeward vetoes exactly on a zero-veto
//     leg, a single-seed firing leg, and a mixed multi-seed leg;
// (b) every screening band start in the prereg is outside the
//     banned set (task banned bands + predecessor bands);
// (c) none of the reused instrument files (driver, analyzer,
//     full guard, outward-only variant) is modified in the
//     worktree — the instrument is byte-identical to the
//     ablation run's by git descent, no silent change.
// Exit 0 = PASS, 1 = FAIL.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync, execFileSync } = require('child_process');

let failures = 0;
function check(name, cond, extra) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (extra !== undefined ? ' :: ' + extra : ''));
  if (!cond) failures++;
}

const HERE = __dirname;
const SCREENER = path.join(HERE, 'analyze-homeveto-screen-b.js');

function dayRec(loopDay, opts) {
  return Object.assign({ loopDay, start: { pos: { x: 4, y: 4 }, haven: { x: 4, y: 4 } },
    end: { pos: { x: 4, y: 4 }, haven: { x: 4, y: 4 } },
    vetoes: 0, silentVetoes: 0, lateralPasses: 0, creditUses: 0,
    homewardVetoes: 0, vetoOriginPass: 0, vetoOriginFail: 0, outwardOnlyPasses: 0,
    hops: [], forages: [] }, opts);
}
function runScreener(insts) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'homeveto-screen-'));
  const file = path.join(tmp, 'leg.jsonl');
  fs.writeFileSync(file, insts.map((i) => JSON.stringify(i)).join('\n') + '\n');
  const out = execFileSync('node', [SCREENER, '--file', file], { encoding: 'utf8' });
  fs.rmSync(tmp, { recursive: true, force: true });
  return out;
}

// (a1) Zero-veto leg: 2 seeds, no vetoes at all.
{
  const insts = [64001, 64002].map((seed) => ({ seed, policy: 'competent-homewardstep-b',
    days: [dayRec(1), dayRec(2, { end: { pos: { x: 5, y: 4 }, haven: { x: 4, y: 4 } } })] }));
  const out = runScreener(insts);
  check('screener zero-veto band reports homewardVetoes=0 + QUALIFIES-ARMED=no',
    /homewardVetoes=0/.test(out) && /QUALIFIES-ARMED=no/.test(out), out.trim().split('\n').pop());
  check('screener zero-veto band counts away day-ends (1 per seed)',
    /away=2/.test(out), out.trim().split('\n').pop());
}
// (a2) Single-seed firing leg: 2 homeward vetoes on one day, 1 silent.
{
  const insts = [{ seed: 64001, policy: 'competent-homewardstep-b',
    days: [dayRec(1), dayRec(2, { vetoes: 3, silentVetoes: 1, homewardVetoes: 2, vetoOriginPass: 2 })] }];
  const out = runScreener(insts);
  check('screener firing seed reports homewardVetoes=2 + QUALIFIES-ARMED=YES',
    /homewardVetoes=2/.test(out) && /QUALIFIES-ARMED=YES/.test(out), out.trim().split('\n').pop());
  check('screener firing seed per-seed line shows vetoes 3(1)',
    /64001 \| competent-homewardstep-b \| 2 \| 0 \| 2 \| 3\(1\)/.test(out));
}
// (a3) Mixed multi-seed leg: firing + silent-only + zero seeds.
{
  const insts = [
    { seed: 64101, policy: 'competent-homewardstep-b', days: [dayRec(1, { vetoes: 1, homewardVetoes: 1 })] },
    { seed: 64102, policy: 'competent-homewardstep-b', days: [dayRec(1, { vetoes: 4, silentVetoes: 4 })] },
    { seed: 64103, policy: 'competent-homewardstep-b', days: [dayRec(1)] },
  ];
  const out = runScreener(insts);
  check('screener mixed band totals homewardVetoes=1, vetoes=5',
    /homewardVetoes=1/.test(out) && /vetoes=5\(4 silent\)/.test(out), out.trim().split('\n').pop());
  check('screener mixed band per-seed lines distinguish firing/silent/zero',
    /64101 \| competent-homewardstep-b \| 1 \| 0 \| 1 \| 1\(0\)/.test(out) &&
    /64102 \| competent-homewardstep-b \| 1 \| 0 \| 0 \| 4\(4\)/.test(out) &&
    /64103 \| competent-homewardstep-b \| 1 \| 0 \| 0 \| 0\(0\)/.test(out));
}

// (b) Screening band starts vs banned set.
{
  const screening = [64001, 64101, 64201, 64301, 64401, 64501, 64601, 64701];
  // Banned band starts: task list (as starts) + predecessor bands.
  const banned = new Set([62801, 62001, 62009, 61901, 61909, 62301, 62401, 62501, 62601, 62701,
    62001, 62101, 62201, 61701, 61801]);
  // Expand each banned start to its 8-seed band for overlap testing.
  const bannedSeeds = new Set();
  for (const b of banned) for (let s = b; s < b + 8; s++) bannedSeeds.add(s);
  const overlap = [];
  for (const b of screening) for (let s = b; s < b + 8; s++) if (bannedSeeds.has(s)) overlap.push(s);
  check('screening bands do not overlap any banned band', overlap.length === 0, 'overlap=' + JSON.stringify(overlap));
  check('screening budget is exactly 8 bands', screening.length === 8);
  check('screening bands are 8 seeds each, ascending, non-overlapping',
    screening.every((b, i) => i === 0 || b > screening[i - 1] + 7));
}

// (c) Reused instrument files unmodified in this worktree.
{
  const reused = ['scripts/homext-abl-b-driver.js', 'scripts/analyze-homext-abl-b.js',
    'scripts/policies/competent-homewardstep-b.js', 'scripts/policies/competent-homewardstep-outwardonly-b.js'];
  let status = '';
  try { status = execSync('git status --porcelain', { encoding: 'utf8', cwd: path.join(HERE, '..') }); } catch (e) { status = 'GIT-ERROR'; }
  const touched = reused.filter((f) => status.split('\n').some((l) => l.slice(3).trim() === f));
  check('reused driver/analyzer/policy files unmodified', touched.length === 0 && status !== 'GIT-ERROR',
    touched.length ? 'touched=' + touched.join(',') : 'status-clean-for-reused');
}

console.log(failures === 0 ? 'ALL PASS' : failures + ' FAILURES');
process.exit(failures === 0 ? 0 : 1);
