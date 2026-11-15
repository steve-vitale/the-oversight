#!/usr/bin/env node
// test-transplant7brain.js — proof test for the H1 TRANSPLANT, brain-side
// ablation of PR #30 on master-tip substrate (arm sim-transplant7brain-a).
//
// THE QUESTION (evidence/2026-11-15/sim-transplant7brain-prereg.md, committed
// before cutting the subject or running any judged sim): does the brain-side
// half of PR #30 alone — merge 23245d5d6 (dawn honesty, OVE-37 port, OVE-36
// Candidate A), narrowed to the villager-brain.js hunks reversed onto master
// tip — collapse survival? The objectives-side half (7b) measured
// NOT-CARRIER (subject identical to the far-end baseline 4/8), because
// finishLottery calls vbrainAlignObjective only when loaded and the align
// function does not exist on far-end substrate. The brain-side half is the
// entire remaining carrier question for family 7, and it cannot be
// transplanted onto the far end (missing-substrate wall) — so this arm
// measures it the other way round: ABLATION on master-tip substrate, which
// HAS the brain module. Full family 7 is UNMEASURED (cherry-pick
// conflict-STOP: ONTOLOGY.md UU, green-list.txt UU, villager-brain.js DU,
// test-villager-brain-dawn.js DU).
//
// MECHANISM (pre-registered): with the align function gone, finishLottery's
// typeof guard returns the objective unchanged, so the live objective keeps
// the CORE lottery kind instead of being rewritten to the dawn commitment:
// aimed overrides are recorded on the commitment + log but no longer
// materialize in the villager's actual errand. The brain module itself stays
// loaded (vbrainOwnsDawn() true, vbrainScorePick present) — only the align
// step is removed.
//
// WHAT THIS TEST PROVES:
//   1. Family identity — merge 23245d5d6, its parents, the 1-commit
//      second-parent side, the exact 2 src/js files, +75/-10
//      (villager-brain.js 59 / villager-objectives.js 26 changed
//      lines), no policy file, honesty test absent at far end + first
//      parent, present at the merge (blob 77f50489, 214 lines),
//      villager-brain.js absent at the far end / present at the first
//      parent, merge NOT an ancestor of the far end, IS an ancestor of
//      master tip.
//   2. Ablation inventory — the brain diff has exactly 5 hunks with the
//      exact headers and per-hunk +/− counts (1/0, 1/0, 2/0, 4/3, 48/0
//      = 56/3); the excluded objectives/ONTOLOGY/green-list/test-dawn
//      changes are named exactly; brain + objectives partitions the
//      family src/js diff (56/3 + 19/7 = 75/10); the test file is NOT
//      in the ablation set (it references vbrainAlignObjective once at
//      the tip); the objectives-side wiring STAYS (finishLottery guard
//      calls vbrainAlignObjective when loaded).
//   3. Reverse-apply pre-check — the whole-patch `git apply --check -R`
//      FAILS on master tip; per-hunk verdicts re-run live are
//      FAIL/FAIL/FAIL/CLEAN/FAIL; the merge's align text is NOT a
//      verbatim substring of the tip's align text (tip 114 lines vs
//      merge 44 — Phase 6 inserted a DUTY/ASSIGN branch); the drift
//      cause is named (12 commits touching villager-brain.js since the
//      merge).
//   4. Verdict mapping — conflictStopVerdict maps the failed-hunk list
//      ([1,2,3,5] -> UNMEASURED-conflict); gateStopVerdict maps the
//      BASELINE GATE for THIS arm (baseline <=2/8 -> PROCEED, >=3/8 ->
//      STOP-UNMEASURED — the OPPOSITE polarity from 7b, because the
//      question here is live only in the collapsed regime);
//      subjectVerdict maps the subject-minus-baseline delta
//      (>=+2 CARRIER, -1..+1 NOT-CARRIER, <=-2 INVERTED).
//   5. Base state — HEAD is on sim-transplant7brain-a, based on the
//      master tip (tip is an ancestor of HEAD; every commit above the tip
//      is this arm's own work), no src/js file differs from HEAD, on-disk
//      standing.js is byte-identical to HEAD, and only the arm's own files
//      may be uncommitted.
//   6. Seed-band identity — the step script and the prereg name exactly
//      seeds 190391–190398; the prereg records the matched band as
//      REUSED BY DESIGN (not claimed fresh) with the search scope and
//      the reuse rationale; the planned corpus names are distinct from
//      the sibling arm's and from 7b's.
//   7. Live subject state — CONFLICT-STOP BRANCH: no
//      transplant-7brain-subject branch exists, no subject commit, the
//      prereg records the conflict list and the UNMEASURED-conflict
//      verdict.
//   8. Step corpora — CONFLICT-STOP BRANCH: no baseline or subject
//      summary/corpus exists for the t7brain steps; the evidence file,
//      when present, records the UNMEASURED-conflict verdict.
//
// Usage: node scripts/test-transplant7brain.js
// Exit 0 = pass, 1 = fail. No repo writes (per-hunk checks use temp files
// under os.tmpdir() and `git apply --check`, which writes nothing).
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant7brain');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const MERGE = '23245d5d6';
const MERGE_FULL = '23245d5d6d91b4b5284e2f503345dcfd1621ff0c';
const MERGE_BASE = '7041e1bfb';
const MERGE_BASE_FULL = '7041e1bfb7e8b69387bd3203a58eed00115ec8d7';
const SECOND_FULL = 'a038cf1513c2eaee2e6ab97c9550369467910b50';
const MASTER_TIP = '7251dcb4f';
const MASTER_TIP_FULL = '7251dcb4f11ec2d1b9ef78eb1493197f7dcd9c2c';
const ARM_BRANCH = 'sim-transplant7brain-a';
const SUBJECT_BRANCH = 'transplant-7brain-subject';
const STEP = 't7brain-23245d5d6';
const BASELINE_STEP = 'ep-tip-7brain';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const EXPECTED_FILES = [
  'docs/ONTOLOGY.md',
  'scripts/green-list.txt',
  'scripts/test-dawn-materialize-honesty.js',
  'scripts/test-villager-brain-dawn.js',
  'src/js/villager-brain.js',
  'src/js/villager-objectives.js',
];
const BRAIN_HUNKS = [
  '@@ -5,6 +5,7 @@',
  '@@ -15,6 +16,7 @@',
  '@@ -281,6 +283,8 @@',
  '@@ -413,9 +417,10 @@',
  '@@ -438,6 +443,54 @@',
];
// Per-hunk +/− counts (added/removed content lines, +++ / --- excluded),
// counted live from the merge diff by this arm at run start.
const BRAIN_HUNK_COUNTS = {
  '@@ -5,6 +5,7 @@': { a: 1, r: 0 },
  '@@ -15,6 +16,7 @@': { a: 1, r: 0 },
  '@@ -281,6 +283,8 @@': { a: 2, r: 0 },
  '@@ -413,9 +417,10 @@': { a: 4, r: 3 },
  '@@ -438,6 +443,54 @@': { a: 48, r: 0 },
};
// Reverse-apply verdict per hunk (1-based) on master tip, re-run live.
const EXPECTED_REVERSE = { 1: 'FAIL', 2: 'FAIL', 3: 'FAIL', 4: 'CLEAN', 5: 'FAIL' };
const HONESTY_TEST = 'scripts/test-dawn-materialize-honesty.js';
const HONESTY_BLOB = '77f50489591ceba8ea13fcf9f954a6a89d720c7f';
const PREREG = path.join(REPO, 'evidence', '2026-11-15', 'sim-transplant7brain-prereg.md');
const EVIDENCE = path.join(REPO, 'evidence', '2026-11-15', 'sim-transplant7brain.md');
// Files this arm may leave uncommitted (prereg, this proof, evidence).
const ARM_FILES = [
  'evidence/2026-11-15/sim-transplant7brain-prereg.md',
  'scripts/test-transplant7brain.js',
  'evidence/2026-11-15/sim-transplant7brain.md',
];

function sha256(text) { return crypto.createHash('sha256').update(text).digest('hex'); }
function git(args) {
  return execSync('git ' + args, { cwd: REPO, stdio: 'pipe' }).toString().trim();
}
function gitShow(commit, file) {
  return execSync('git show ' + commit + ':' + file, { cwd: REPO, stdio: 'pipe' }).toString();
}
function gitOk(args) {
  try { execSync('git ' + args, { cwd: REPO, stdio: 'pipe' }); return true; }
  catch (e) { return false; }
}
function isAncestor(a, b) {
  try { execSync('git merge-base --is-ancestor ' + a + ' ' + b, { cwd: REPO, stdio: 'pipe' }); return true; }
  catch (e) { return false; }
}
function diffText(revA, revB, file) {
  return execSync('git diff ' + revA + ' ' + revB + ' -- ' + file, { cwd: REPO, stdio: 'pipe' }).toString('utf8');
}
// conflictStopVerdict(failedHunks): the binding STOP rule FOR THIS ARM —
// the subject is built by mechanical reverse-application of the 5 brain
// hunks onto master tip, so ANY apply conflict is beyond the ablation
// definition: STOP, UNMEASURED-conflict, no hand-resolution, no silent
// hunk-drop.
function conflictStopVerdict(failedHunks) {
  if (!Array.isArray(failedHunks)) return 'UNCLASSIFIABLE';
  if (failedHunks.length === 0) return 'MEASURABLE';
  return 'UNMEASURED';
}
// gateStopVerdict(baselineSurvived): the binding BASELINE GATE for THIS
// arm — the carrier question is live on master-tip substrate ONLY if the
// baseline reads <=2/8 (the collapsed regime). At >=3/8 the collapse
// regime is gone on current master: STOP, UNMEASURED-substrate, no subject
// leg, and the baseline read is NOT re-judged as a carrier signal.
// NOTE the opposite polarity from 7b (there the gate needed >=3/8 to
// proceed, because the far end was the healthy 4/8 baseline).
function gateStopVerdict(baselineSurvived) {
  if (typeof baselineSurvived !== 'number' || !Number.isFinite(baselineSurvived) ||
      baselineSurvived < 0 || baselineSurvived > 8) return 'UNCLASSIFIABLE';
  if (baselineSurvived <= 2) return 'PROCEED';
  return 'STOP-UNMEASURED';
}
// subjectVerdict(delta): subject-minus-baseline survivors, judged by the
// pre-registered mapping in the prereg.
function subjectVerdict(delta) {
  if (typeof delta !== 'number' || !Number.isFinite(delta)) return 'UNCLASSIFIABLE';
  if (delta >= 2) return 'CARRIER';
  if (delta <= -2) return 'INVERTED';
  return 'NOT-CARRIER';
}
// familyHunks(file): the @@ headers of `git diff MERGE^1 MERGE -- file`.
function familyHunks(file) {
  const out = execSync('git diff ' + MERGE + '^1 ' + MERGE + ' -- ' + file,
    { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  return out.split('\n').filter(function (ln) { return ln.indexOf('@@ -') === 0; });
}
// hunkCounts(diffText): per-header { a, r } content-line counts.
function hunkCounts(diffText) {
  const counts = {};
  let cur = null;
  for (const ln of diffText.split('\n')) {
    if (ln.indexOf('@@ -') === 0) { cur = ln; counts[cur] = { a: 0, r: 0 }; continue; }
    if (cur === null) continue;
    if (ln.indexOf('+') === 0 && ln.indexOf('+++') !== 0) counts[cur].a++;
    else if (ln.indexOf('-') === 0 && ln.indexOf('---') !== 0) counts[cur].r++;
  }
  return counts;
}
// splitHunks(diffText): [{ header, body }] for each @@ hunk.
function splitHunks(diffText) {
  const hunks = [];
  let cur = null;
  for (const ln of diffText.split('\n')) {
    if (ln.indexOf('@@ -') === 0) { cur = { header: ln, body: [ln] }; hunks.push(cur); continue; }
    if (cur) cur.body.push(ln);
  }
  return hunks;
}
// reverseCheck(hunk): run `git apply --check -R` on one hunk (written to a
// temp file; --check writes nothing) against the worktree. Returns
// 'CLEAN' or 'FAIL'.
function reverseCheck(hunkText) {
  const tmp = path.join(os.tmpdir(), 't7brain-hunk-' + process.pid + '.patch');
  fs.writeFileSync(tmp, hunkText);
  try {
    execSync('git apply --check -R ' + tmp, { cwd: REPO, stdio: 'pipe' });
    return 'CLEAN';
  } catch (e) {
    return 'FAIL';
  } finally {
    try { fs.unlinkSync(tmp); } catch (e) {}
  }
}
// alignFunctionText(srcText): the vbrainAlignObjective function definition
// (from its declaration to its closing '    },').
function alignFunctionText(srcText) {
  const start = srcText.indexOf('vbrainAlignObjective: function (vid, o, hx, hy) {');
  if (start === -1) return null;
  const end = srcText.indexOf('\n    },', start);
  if (end === -1) return null;
  return srcText.slice(start, end);
}

(async function () {
  T.section('1. Family identity — PR #30 merge 23245d5d6');
  T.ok('merge full sha is 23245d5d6d91b4b5284e2f503345dcfd1621ff0c',
    git('rev-parse ' + MERGE) === MERGE_FULL, MERGE_FULL);
  T.ok('first parent is 7041e1bfb (OVE-33 refresh)',
    git('rev-parse ' + MERGE + '^1') === MERGE_BASE_FULL, MERGE_BASE_FULL);
  T.ok('second parent is a038cf151 (align dawn materialize)',
    git('rev-parse ' + MERGE + '^2') === SECOND_FULL, SECOND_FULL);
  T.ok('second-parent side is 1 commit',
    git('rev-list --count ' + MERGE_BASE + '..' + MERGE + '^2') === '1', '1 commit');
  const stat = git('diff --stat ' + MERGE + '^1 ' + MERGE);
  T.ok('merge diff touches exactly 6 files',
    stat.split('\n').filter(function (l) { return l.indexOf('|') !== -1; }).length === 6, '6 files');
  const files = git('diff --name-only ' + MERGE + '^1 ' + MERGE).split('\n').sort();
  T.ok('merge diff file list is exactly the 6 known files',
    JSON.stringify(files) === JSON.stringify(EXPECTED_FILES.slice().sort()), files.join(', '));
  const numstat = execSync('git diff --numstat ' + MERGE + '^1 ' + MERGE,
    { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  const byFile = {};
  numstat.trim().split('\n').forEach(function (ln) {
    const parts = ln.split('\t');
    byFile[parts[2]] = { a: parseInt(parts[0], 10), r: parseInt(parts[1], 10) };
  });
  T.ok('villager-brain.js numstat is 56+/3-',
    byFile['src/js/villager-brain.js'] && byFile['src/js/villager-brain.js'].a === 56 &&
    byFile['src/js/villager-brain.js'].r === 3, '56/3');
  T.ok('villager-objectives.js numstat is 19+/7-',
    byFile['src/js/villager-objectives.js'] && byFile['src/js/villager-objectives.js'].a === 19 &&
    byFile['src/js/villager-objectives.js'].r === 7, '19/7');
  T.ok('src/js total is +75/-10',
    byFile['src/js/villager-brain.js'].a + byFile['src/js/villager-objectives.js'].a === 75 &&
    byFile['src/js/villager-brain.js'].r + byFile['src/js/villager-objectives.js'].r === 10, '+75/-10');
  T.ok('no scripts/policies file in the merge diff',
    files.every(function (f) { return f.indexOf('scripts/policies/') !== 0; }), 'pol=0');
  T.ok('merge is NOT an ancestor of the far end 203a32775',
    !isAncestor(MERGE, FAR), 'not ancestor of far end');
  T.ok('merge IS an ancestor of master tip 7251dcb4f',
    isAncestor(MERGE, MASTER_TIP), 'ancestor of master tip');
  T.ok('honesty test is +214 lines, blob 77f50489 at the merge',
    git('rev-parse ' + MERGE + ':' + HONESTY_TEST) === HONESTY_BLOB &&
    gitShow(MERGE, HONESTY_TEST).split('\n').length - 1 === 214, 'blob 77f50489, 214 lines');
  T.ok('honesty test absent at the far end and at the first parent',
    !gitOk('cat-file -e ' + FAR + ':' + HONESTY_TEST) &&
    !gitOk('cat-file -e ' + MERGE_BASE + ':' + HONESTY_TEST), 'absent at far end + first parent');
  T.ok('villager-brain.js absent at the far end, present at the first parent',
    git('ls-tree ' + FAR + ' -- src/js/villager-brain.js') === '' &&
    git('ls-tree ' + MERGE_BASE + ' -- src/js/villager-brain.js') !== '', 'absent far end / present first parent');

  T.section('2. Ablation inventory — brain diff is exactly 5 hunks, 56/3');
  const brainDiff = diffText(MERGE + '^1', MERGE, 'src/js/villager-brain.js');
  const brainHeaders = familyHunks('src/js/villager-brain.js');
  T.ok('brain diff has exactly 5 hunks',
    brainHeaders.length === 5, brainHeaders.length + ' hunks');
  T.ok('brain hunk headers are exactly the 5 known headers',
    JSON.stringify(brainHeaders) === JSON.stringify(BRAIN_HUNKS), brainHeaders.join(' | '));
  const counts = hunkCounts(brainDiff);
  T.ok('per-hunk counts are 1/0, 1/0, 2/0, 4/3, 48/0 (= 56/3)',
    BRAIN_HUNKS.every(function (h) {
      return counts[h] && counts[h].a === BRAIN_HUNK_COUNTS[h].a && counts[h].r === BRAIN_HUNK_COUNTS[h].r;
    }), JSON.stringify(counts));
  const objDiff = diffText(MERGE + '^1', MERGE, 'src/js/villager-objectives.js');
  const objCounts = hunkCounts(objDiff);
  const objTotal = Object.keys(objCounts).reduce(function (acc, h) {
    return { a: acc.a + objCounts[h].a, r: acc.r + objCounts[h].r };
  }, { a: 0, r: 0 });
  T.ok('objectives diff is 5 hunks, 19/7 — brain + objectives partitions the family src/js diff (75/10)',
    familyHunks('src/js/villager-objectives.js').length === 5 &&
    objTotal.a === 19 && objTotal.r === 7, '19/7, 5 hunks');
  T.ok('excluded changes are named exactly: ONTOLOGY.md, green-list.txt, test-villager-brain-dawn.js, objectives hunks',
    byFile['docs/ONTOLOGY.md'] && byFile['docs/ONTOLOGY.md'].a === 2 && byFile['docs/ONTOLOGY.md'].r === 1 &&
    byFile['scripts/green-list.txt'] && byFile['scripts/green-list.txt'].a === 1 && byFile['scripts/green-list.txt'].r === 0 &&
    byFile['scripts/test-villager-brain-dawn.js'] && byFile['scripts/test-villager-brain-dawn.js'].a === 8 &&
    byFile['scripts/test-villager-brain-dawn.js'].r === 2, 'excluded files match');
  const brainTestTip = fs.readFileSync(path.join(REPO, 'scripts', 'test-villager-brain-dawn.js'), 'utf8');
  T.ok('test file is NOT in the ablation set: it references vbrainAlignObjective exactly once at the tip',
    (brainTestTip.match(/vbrainAlignObjective/g) || []).length === 1, '1 reference');
  const objTip = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-objectives.js'), 'utf8');
  T.ok('objectives-side wiring STAYS at the tip: finishLottery calls vbrainAlignObjective only when loaded',
    objTip.indexOf("if (typeof this.vbrainAlignObjective === 'function')") !== -1 &&
    objTip.indexOf('return this.vbrainAlignObjective(vid, obj, hx, hy) || obj;') !== -1,
    'typeof guard + call present');

  T.section('3. Reverse-apply pre-check — whole patch fails, 4 of 5 hunks fail');
  const brainHeader = brainDiff.split('@@ -')[0];
  T.ok('whole-patch git apply --check -R FAILS on master tip',
    (function () {
      // Write the whole patch to a temp file and check it for real.
      const tmp = path.join(os.tmpdir(), 't7brain-whole-' + process.pid + '.patch');
      fs.writeFileSync(tmp, brainDiff);
      try { execSync('git apply --check -R ' + tmp, { cwd: REPO, stdio: 'pipe' }); return false; }
      catch (e) { return true; }
      finally { try { fs.unlinkSync(tmp); } catch (e2) {} }
    })(), 'whole patch fails');
  const hunks = splitHunks(brainDiff);
  const verdicts = {};
  hunks.forEach(function (h, idx) {
    let single = brainHeader + h.body.join('\n');
    if (single.slice(-1) !== '\n') single += '\n';
    verdicts[idx + 1] = reverseCheck(single);
  });
  T.ok('per-hunk reverse verdicts are FAIL/FAIL/FAIL/CLEAN/FAIL',
    JSON.stringify(verdicts) === JSON.stringify(EXPECTED_REVERSE), JSON.stringify(verdicts));
  T.ok('the align function itself (hunk 5) FAILS reverse-apply — the carrier question is unbuildable mechanically',
    verdicts[5] === 'FAIL', 'hunk 5 FAIL');
  const tipBrain = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
  const tipAlign = alignFunctionText(tipBrain);
  const mergeAlign = alignFunctionText(gitShow(MERGE, 'src/js/villager-brain.js'));
  T.ok('merge align text is NOT a verbatim substring of the tip align text',
    tipAlign !== null && mergeAlign !== null && tipAlign.indexOf(mergeAlign.trim()) === -1,
    'merge align not in tip align');
  T.ok('tip align function is 114 lines vs the merge 44 — Phase 6 grew it',
    tipAlign !== null && mergeAlign !== null &&
    tipAlign.split('\n').length === 114 && mergeAlign.split('\n').length === 44,
    'tip ' + (tipAlign ? tipAlign.split('\n').length : '?') + ' lines, merge ' +
    (mergeAlign ? mergeAlign.split('\n').length : '?') + ' lines');
  T.ok('tip align carries the Phase 6 DUTY/ASSIGN branch (the drift that broke the reverse)',
    tipAlign !== null && tipAlign.indexOf("c.kind === 'DUTY'") !== -1 &&
    tipAlign.indexOf('dutyTask') !== -1, 'DUTY/ASSIGN branch present');
  T.ok('villager-brain.js changed in 12 commits between the merge and master tip',
    git('rev-list --count ' + MERGE + '..' + MASTER_TIP + ' -- src/js/villager-brain.js') === '12', '12 commits');

  T.section('4. Verdict mapping — conflict-stop, baseline gate, subject delta');
  T.ok('conflictStopVerdict: empty failed list -> MEASURABLE',
    conflictStopVerdict([]) === 'MEASURABLE', '[] -> MEASURABLE');
  T.ok('conflictStopVerdict: live failed hunks [1,2,3,5] -> UNMEASURED',
    conflictStopVerdict([1, 2, 3, 5]) === 'UNMEASURED', '[1,2,3,5] -> UNMEASURED');
  T.ok('conflictStopVerdict: any single failed hunk -> UNMEASURED (no silent hunk-drop)',
    conflictStopVerdict([5]) === 'UNMEASURED' && conflictStopVerdict([4]) === 'UNMEASURED', 'any fail -> UNMEASURED');
  T.ok('gateStopVerdict: baseline 0/1/2 -> PROCEED (collapsed regime, question live)',
    gateStopVerdict(0) === 'PROCEED' && gateStopVerdict(1) === 'PROCEED' && gateStopVerdict(2) === 'PROCEED',
    '0,1,2 -> PROCEED');
  T.ok('gateStopVerdict: baseline 3..8 -> STOP-UNMEASURED (collapse regime gone, question moot)',
    [3, 4, 5, 6, 7, 8].every(function (n) { return gateStopVerdict(n) === 'STOP-UNMEASURED'; }),
    '3..8 -> STOP-UNMEASURED');
  T.ok('subjectVerdict: delta >= +2 -> CARRIER',
    subjectVerdict(2) === 'CARRIER' && subjectVerdict(3) === 'CARRIER' && subjectVerdict(8) === 'CARRIER',
    '+2/+3/+8 -> CARRIER');
  T.ok('subjectVerdict: delta -1..+1 -> NOT-CARRIER',
    subjectVerdict(-1) === 'NOT-CARRIER' && subjectVerdict(0) === 'NOT-CARRIER' && subjectVerdict(1) === 'NOT-CARRIER',
    '-1/0/+1 -> NOT-CARRIER');
  T.ok('subjectVerdict: delta <= -2 -> INVERTED',
    subjectVerdict(-2) === 'INVERTED' && subjectVerdict(-3) === 'INVERTED', '-2/-3 -> INVERTED');

  T.section('5. Base state — arm branch at master tip, only arm files uncommitted');
  T.ok('HEAD is the arm branch sim-transplant7brain-a',
    git('branch --show-current') === ARM_BRANCH, git('branch --show-current'));
  T.ok('arm branch is based on master tip 7251dcb4f (tip is an ancestor of HEAD)',
    isAncestor(MASTER_TIP, 'HEAD'), 'tip ancestor of HEAD');
  T.ok('every commit above the tip on this branch is this arm\'s own work',
    git('log --format=%s ' + MASTER_TIP + '..HEAD').split('\n').filter(Boolean)
      .every(function (s) { return s.indexOf('H1 transplant 7brain') === 0; }),
    git('log --oneline ' + MASTER_TIP + '..HEAD').split('\n').filter(Boolean).join(' | ') || 'at tip');
  T.ok('no src/js file differs from HEAD',
    git('status --porcelain -- src/js') === '', 'src/js clean');
  T.ok('on-disk standing.js is byte-identical to HEAD',
    sha256(fs.readFileSync(path.join(REPO, 'src', 'js', 'standing.js'))) ===
    sha256(gitShow('HEAD', 'src/js/standing.js')), 'standing.js == HEAD');
  // Porcelain lines are XY + space + path; use the RAW output (git()
  // trims, which eats the first line's leading status-space and shifts
  // a fixed slice by one).
  const rawStatus = execSync('git status --porcelain', { cwd: REPO, stdio: 'pipe' }).toString();
  const dirty = rawStatus.split('\n').filter(Boolean).map(function (ln) { return ln.slice(3); });
  T.ok('only the arm files may be uncommitted (prereg, this proof, evidence)',
    dirty.every(function (f) { return ARM_FILES.indexOf(f) !== -1; }),
    dirty.length === 0 ? 'clean' : dirty.join(', '));

  T.section('6. Seed-band identity — matched band, reused by design');
  const stepScript = fs.readFileSync(path.join(REPO, 'scripts', 'culpritbisect-step.sh'), 'utf8');
  T.ok('step script seeds are exactly 190391-190398',
    stepScript.indexOf('SEEDS="190391,190392,190393,190394,190395,190396,190397,190398"') !== -1,
    'SEEDS 190391..190398');
  const preregText = fs.readFileSync(PREREG, 'utf8');
  T.ok('prereg names the matched band 190391-190398 and the step ids t7brain-23245d5d6 / ep-tip-7brain',
    preregText.indexOf('190391') !== -1 && preregText.indexOf(STEP) !== -1 &&
    preregText.indexOf(BASELINE_STEP) !== -1, 'band + step ids in prereg');
  T.ok('prereg records the band as REUSED BY DESIGN (not claimed fresh)',
    preregText.indexOf('REUSED BY DESIGN') !== -1 && preregText.indexOf('NOT fresh') !== -1,
    'reuse-by-design recorded');
  T.ok('prereg records the freshness search scope (whole evidence/ tree) and result (497 files, 88 preregs)',
    preregText.indexOf('497 files') !== -1 && preregText.indexOf('88') !== -1,
    '497 files / 88 preregs');
  T.ok('planned corpus names are distinct from the sibling arm and from 7b (t7brain, not t7b)',
    STEP.indexOf('t7brain') === 0 && STEP !== 't7b-23245d5d6' &&
    ('perseed-culpritbisect-a-' + STEP).indexOf('t7brain') !== -1, STEP);

  T.section('7. Live subject state — CONFLICT-STOP BRANCH (no subject exists)');
  T.ok('subject branch transplant-7brain-subject does NOT exist',
    !gitOk('show-ref --verify refs/heads/' + SUBJECT_BRANCH), 'no subject branch');
  T.ok('no subject commit exists (branch absent, so nothing to verify)',
    !gitOk('rev-parse ' + SUBJECT_BRANCH), 'no subject commit');
  T.ok('prereg records the conflict list (4 of 5 hunks fail, including the align function itself)',
    preregText.indexOf('4 of 5 hunks fail') !== -1 &&
    preregText.indexOf('INCLUDING the align function itself') !== -1, 'conflict list recorded');
  T.ok('prereg records the UNMEASURED-conflict verdict for the conflict-STOP path',
    preregText.indexOf('UNMEASURED-conflict') !== -1, 'UNMEASURED-conflict in prereg');

  T.section('8. Step corpora — CONFLICT-STOP BRANCH (no corpus exists)');
  const baseSummary = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + BASELINE_STEP + '-summary.json');
  const subjSummary = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  const baseCorpus = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + BASELINE_STEP);
  const subjCorpus = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  T.ok('no baseline summary exists for ep-tip-7brain (no leg ran)',
    !fs.existsSync(baseSummary), 'no baseline summary');
  T.ok('no subject summary exists for t7brain-23245d5d6 (no leg ran)',
    !fs.existsSync(subjSummary), 'no subject summary');
  T.ok('no baseline corpus dir exists for ep-tip-7brain',
    !fs.existsSync(baseCorpus), 'no baseline corpus');
  T.ok('no subject corpus dir exists for t7brain-23245d5d6',
    !fs.existsSync(subjCorpus), 'no subject corpus');
  T.ok('evidence file, when present, records the UNMEASURED-conflict verdict (absent at stage 1)',
    !fs.existsSync(EVIDENCE) || fs.readFileSync(EVIDENCE, 'utf8').indexOf('UNMEASURED-conflict') !== -1,
    fs.existsSync(EVIDENCE) ? 'verdict recorded' : 'evidence not yet written (stage 1)');

  await T.done();
})().catch(function (e) {
  console.error(e);
  process.exit(1);
});
