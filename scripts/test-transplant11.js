#!/usr/bin/env node
// test-transplant11.js — proof test for the H1 TRANSPLANT, family 11
// (arm sim-transplant11-a).
//
// THE QUESTION (evidence/2026-11-14/sim-transplant11.md, prereg
// evidence/2026-11-14/sim-transplant11-prereg.md committed before
// any judged sim): land origin family 11 — merge 0f55a928c "Merge
// pull request #26 from steve-vitale/cursor/voice-line-decoration-
// stack-b24a" (js=1, pol=0; single commit 5b7d83426 "Stop voiceLine
// stacking on authored questions") — onto the far end 203a32775
// (GOOD 4/8) via `git cherry-pick -m 1 0f55a928c`. The merge-tree dry
// run predicts a CLEAN pick (0 conflict markers): the one src/js file
// auto-merges, the test file is a clean add. On ANY live conflict:
// STOP per the binding prereg (sim-scale-onramp-round-2115.md §3) —
// report the conflict list, do NOT hand-resolve game code.
//
// WHAT THIS TEST PROVES (stage 1, sections 1-6):
//   1. Family identity — merge 0f55a928c, its parents, the
//      single-commit second-parent side, the exact 1 src/js file
//      (+20/-0 conversation.js), the test file (+137/-0), no policy
//      file, no standing.js.
//   2. Merge-tree pre-check (read-only) — exactly ONE changed-in-
//      both file at 0 markers, ONE added-in-remote file at 0
//      markers, no other section, no DU, no conflict markers.
//   3. Family content — the diff is a dialogue-coherence fix only:
//      the FORMAL QUESTION GUARD in voiceLine (asksQ honesty gate);
//      no numeric/economy/combat/food change, no scale identifier.
//   4. Verdict mapping — classifyTransplant maps every survived
//      count; conflictStop11 maps any conflicted file to
//      'UNMEASURED' and an empty set to 'NO-CONFLICT'.
//   5. Prereg recorded in the evidence file (thresholds, STOP
//      clause, seeds, horizon, policy, canon note).
//   6. Base state — HEAD is on sim-transplant11-a, no src/js file
//      differs from HEAD, on-disk standing.js is byte-identical
//      to HEAD, the step-script tooling source (master) still
//      carries all four scratch files; the step script names the
//      band 190391-190398; the subject branch exists and the step
//      summary/driver log exist (stage-2 state).
// (stage 2, section 7 — subject commit recorded, family diff
// content-identical, step measured 5/8 NOT-CARRIER, base restored.)
//
// Usage: node scripts/test-transplant11.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant11');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const MERGE = '0f55a928c';
const FIRST = 'ac119e4ed27b2aa66131929795a4d3d0f381900b';
const SECOND = '5b7d83426';
const SUBJECT_BRANCH = 'transplant-11-subject';
const SUBJECT = '3b8ba98b0f8b88f2d42861058163b11ac73b8b5e';
const STEP = 't11-0f55a928c';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const EXPECTED_JS = ['src/js/conversation.js'];
// Blobs from the merge-tree dry run (base = first parent).
const EXPECTED_BLOBS = {
  'src/js/conversation.js': { base: 'ae77aa50', our: '1c943900', their: 'cdef3941' },
};
const TEST_FILE = 'scripts/test-voice-question-decoration-20261108.js';
const TEST_BLOB = '7af18719';

function sha256(text) { return crypto.createHash('sha256').update(text).digest('hex'); }
function git(args) {
  return execSync('git ' + args, { cwd: REPO, stdio: 'pipe' }).toString().trim();
}
function gitShow(commit, file) {
  return execSync('git show ' + commit + ':' + file, { cwd: REPO, stdio: 'pipe' }).toString();
}
function classifyTransplant(n) {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 8) return 'UNCLASSIFIABLE';
  if (n <= 1) return 'CARRIER';
  if (n === 2) return 'AMBIGUOUS';
  return 'NOT-CARRIER';
}
// conflictStop11(files): the family-11 conflict rule — ANY conflicted
// file STOPs the arm (binding prereg: no hand-resolution of game
// code, no narrowed re-run by the arm). Only an empty set proceeds.
function conflictStop11(files) {
  if (!Array.isArray(files)) return 'UNCLASSIFIABLE';
  if (files.length === 0) return 'NO-CONFLICT';
  return 'UNMEASURED';
}
// mergeTreeConflicts(): run `git merge-tree <base> <ours> <theirs>`
// (read-only dry run — touches no worktree) and return
// { changedInBoth: {file: markers}, merged: {file: markers},
//   added: {file: markers}, raw } for each section. Section headers
// are the exact status words ('changed in both', 'merged', 'added in
// remote', ...).
function mergeTreeConflicts() {
  const out = execSync('git merge-tree ' + FIRST + ' ' + FAR + ' ' + MERGE,
    { cwd: REPO, stdio: 'pipe', maxBuffer: 512 * 1024 * 1024 }).toString('utf8');
  const lines = out.split('\n');
  const STATUS = { 'changed in both': 'changedInBoth', 'merged': 'merged',
    'added in remote': 'added', 'added in local': 'added',
    'removed in local': 'removed', 'removed in remote': 'removed' };
  const found = { changedInBoth: {}, merged: {}, added: {}, removed: {} };
  let cur = null;
  const record = function () {
    if (cur !== null && cur.file !== null && found[cur.kind]) found[cur.kind][cur.file] = cur.markers;
  };
  for (const ln of lines) {
    if (STATUS[ln]) { record(); cur = { kind: STATUS[ln], file: null, markers: 0 }; continue; }
    if (cur !== null) {
      const m = ln.match(/^  (?:base|our|their|result)\s+\d+ [0-9a-f]+ (.+)$/);
      if (m && cur.file === null) cur.file = m[1];
      if (ln.indexOf('+<<<<<<<') === 0 || ln.indexOf('+>>>>>>>') === 0 || ln.indexOf('+=======') === 0) cur.markers++;
    }
  }
  record();
  return { found: found, raw: out };
}

(async () => {
  // ---- 1. Family identity ----
  T.section('1. Family identity — voice-line-decoration merge 0f55a928c');
  T.ok('merge commit exists', git('rev-parse ' + MERGE).length === 40, git('log -1 --format=%s ' + MERGE).slice(0, 80));
  T.ok('first parent is ac119e4ed (the family-12 merge)', git('rev-parse ' + MERGE + '^1').startsWith('ac119e4ed'), git('log -1 --format=%h\\ %s ' + MERGE + '^1').slice(0, 80));
  T.ok('second parent is 5b7d83426 (the voiceLine stacking fix)', git('rev-parse ' + MERGE + '^2').startsWith('5b7d83426'), git('log -1 --format=%h\\ %s ' + MERGE + '^2').slice(0, 80));
  const sideCount = parseInt(git('rev-list --count ' + MERGE + '^1..' + MERGE + '^2'), 10);
  T.ok('second-parent side is 1 commit', sideCount === 1, 'count=' + sideCount);
  const sideSubject = git('log --format=%s ' + MERGE + '^1..' + MERGE + '^2');
  T.ok('second-parent side is "Stop voiceLine stacking on authored questions"',
    sideSubject === 'Stop voiceLine stacking on authored questions', sideSubject.slice(0, 80));
  const jsFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- src/js').split('\n').sort();
  T.ok('family touches exactly the 1 expected src/js file', JSON.stringify(jsFiles) === JSON.stringify(EXPECTED_JS.slice().sort()), jsFiles.join(', '));
  const convStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/js/conversation.js');
  T.ok('conversation.js is +20/-0', convStat === '20\t0\tsrc/js/conversation.js', convStat);
  const testStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- ' + TEST_FILE);
  T.ok('test file is +137/-0 (new file)', testStat === '137\t0\t' + TEST_FILE, testStat);
  const polFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- scripts/policies');
  T.ok('family touches no policy file', polFiles === '', polFiles || '(none)');
  T.ok('family does not touch standing.js', git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- src/js/standing.js') === '', '(absent)');
  const totalLines = git('diff --numstat ' + MERGE + '^1 ' + MERGE).split('\n');
  const totalStat = totalLines.reduce(function (acc, line) {
    const p = line.split('\t');
    const ins = parseInt(p[0], 10), del = parseInt(p[1], 10);
    if (Number.isFinite(ins)) acc.ins += ins;
    if (Number.isFinite(del)) acc.del += del;
    return acc;
  }, { ins: 0, del: 0 });
  T.ok('family total is 2 files, +157/-0', totalLines.length === 2 && totalStat.ins === 157 && totalStat.del === 0,
    totalLines.length + ' files, +' + totalStat.ins + '/-' + totalStat.del);
  const farStanding = sha256(gitShow(FAR, 'src/js/standing.js'));
  T.ok('far-end native standing.js sha is 75762cb2...', farStanding.startsWith('75762cb2'), farStanding.slice(0, 12));
  T.ok('fix standing.js sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  const farPolicy = sha256(gitShow(FAR, 'scripts/policies/competent.js'));
  T.ok('far-end policy sha is a7ff5c51...', farPolicy.startsWith('a7ff5c51'), farPolicy.slice(0, 12));
  // Far-end substrate: conversation.js present; test file absent.
  const farConv = git('ls-tree ' + FAR + ' -- src/js/conversation.js');
  T.ok('far-end conversation.js present (blob 1c943900, == merge-tree ours)', farConv.indexOf('1c943900') !== -1, farConv.slice(0, 60));
  let farTest = '';
  try { farTest = git('ls-tree ' + FAR + ' -- ' + TEST_FILE); } catch (e) { farTest = ''; }
  T.ok('far-end test file ABSENT (new file, clean add, no DU)', farTest === '', '(absent)');

  // ---- 2. Merge-tree pre-check prediction ----
  T.section('2. Merge-tree pre-check — clean pick predicted (base = first parent)');
  const mt = mergeTreeConflicts();
  const cib = mt.found.changedInBoth;
  T.ok('merge-tree reports exactly ONE changed-in-both file', Object.keys(cib).length === 1,
    Object.keys(cib).join(', '));
  let mtOk = true, mtBad = null;
  for (const f of EXPECTED_JS) {
    if (cib[f] !== 0) { mtOk = false; mtBad = f + ' (got ' + cib[f] + ', want 0)'; break; }
  }
  T.ok('merge-tree reports 0 markers on the changed-in-both file', mtOk, mtBad || '1/1 clean');
  const conflicted = Object.keys(cib).filter(function (f) { return cib[f] > 0; }).sort();
  T.ok('merge-tree reports ZERO content-conflicted files', conflicted.length === 0, conflicted.join(', ') || '(none)');
  T.ok('merge-tree reports no merged section', Object.keys(mt.found.merged).length === 0,
    Object.keys(mt.found.merged).join(', ') || '(none)');
  T.ok('merge-tree reports exactly ONE added-in-remote section (the test file)',
    Object.keys(mt.found.added).length === 1 && mt.found.added[TEST_FILE] === 0,
    Object.keys(mt.found.added).join(', '));
  T.ok('merge-tree reports no removed section', Object.keys(mt.found.removed).length === 0, '(none)');
  T.ok('no DU entry anywhere', mt.raw.indexOf('deleted in local') === -1 && mt.raw.indexOf('deleted in remote') === -1, 'no DU sections');
  T.ok('no conflict markers anywhere in the merge-tree output', mt.raw.indexOf('+<<<<<<<') === -1 && mt.raw.indexOf('+>>>>>>>') === -1 && mt.raw.indexOf('+=======') === -1, '0 markers');
  for (const f of EXPECTED_JS) {
    const b = EXPECTED_BLOBS[f];
    T.ok('merge-tree ' + f + ' base/our/their blobs are ' + b.base + '/' + b.our + '/' + b.their,
      mt.raw.indexOf('base   100644 ' + b.base) !== -1 && mt.raw.indexOf('our    100644 ' + b.our) !== -1 && mt.raw.indexOf('their  100644 ' + b.their) !== -1,
      'blobs present');
  }
  T.ok('merge-tree test-file blob is ' + TEST_BLOB, mt.raw.indexOf('their  100644 ' + TEST_BLOB) !== -1, 'test blob present');

  // ---- 3. Family content — dialogue-coherence fix only ----
  T.section('3. Family content — FORMAL QUESTION GUARD, no numeric/economy/combat change');
  const mergeConv = gitShow(MERGE, 'src/js/conversation.js');
  T.ok('merge conversation.js defines asksQ (any "?" honesty gate)',
    mergeConv.indexOf('const asksQ = /\\?/.test(inner);') !== -1, 'asksQ present');
  T.ok('merge conversation.js defines the FORMAL QUESTION GUARD (dialog audit #5)',
    mergeConv.indexOf('FORMAL QUESTION GUARD') !== -1 && mergeConv.indexOf('dialog audit #5') !== -1, 'guard present');
  T.ok('merge conversation.js keeps isQ terminal-mark only (RNG lockstep)',
    mergeConv.indexOf('isQ stays terminal-mark only') !== -1, 'isQ comment present');
  T.ok('merge conversation.js keeps soft closers folding on plain questions',
    mergeConv.indexOf('Soft address/punct closers') !== -1 && mergeConv.indexOf('still fold on plain') !== -1, 'soft-closer rule present');
  T.ok('merge conversation.js names the stacked-opener defect ("Practical view: Okay, real question")',
    mergeConv.indexOf('Practical view: Okay, real question') !== -1, 'defect example present');
  const familyDiff = execSync('git diff ' + MERGE + '^1 ' + MERGE + ' -- src/js', { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  T.ok('family diff touches no food/economy/combat identifier (kcal, damage, armor, spawn)',
    ['kcal', 'damage', 'armor', 'spawnMonster', 'foodYield', 'spoilage'].every(function (w) { return familyDiff.indexOf(w) === -1; }),
    'no numeric identifiers');
  T.ok('family diff touches no standing/table/wave identifier',
    ['standing', 'table', 'wave5', 'Wave 5', 'deedGate'].every(function (w) { return familyDiff.indexOf(w) === -1; }),
    'no scale identifiers');

  // ---- 4. Verdict mapping ----
  T.section('4. Verdict mapping — transplant thresholds + conflict rule');
  const table = [[0, 'CARRIER'], [1, 'CARRIER'], [2, 'AMBIGUOUS'], [3, 'NOT-CARRIER'], [4, 'NOT-CARRIER'], [5, 'NOT-CARRIER'], [8, 'NOT-CARRIER'], [-1, 'UNCLASSIFIABLE'], [9, 'UNCLASSIFIABLE'], [NaN, 'UNCLASSIFIABLE']];
  for (const pair of table) {
    T.ok('survived ' + pair[0] + ' -> ' + pair[1], classifyTransplant(pair[0]) === pair[1], classifyTransplant(pair[0]));
  }
  T.ok('conflict rule: no conflict -> NO-CONFLICT', conflictStop11([]) === 'NO-CONFLICT', conflictStop11([]));
  T.ok('conflict rule: one src/js file -> UNMEASURED', conflictStop11(['src/js/conversation.js']) === 'UNMEASURED', conflictStop11(['src/js/conversation.js']));
  T.ok('conflict rule: one tooling file -> UNMEASURED (no narrowed re-run by this arm)',
    conflictStop11(['scripts/balance-proof.json']) === 'UNMEASURED', conflictStop11(['scripts/balance-proof.json']));
  T.ok('conflict rule: both tooling files -> UNMEASURED', conflictStop11(['scripts/balance-proof.json', 'scripts/green-list.txt']) === 'UNMEASURED', conflictStop11(['scripts/balance-proof.json', 'scripts/green-list.txt']));

  // ---- 5. Prereg recorded in the evidence file ----
  T.section('5. Prereg recorded in the evidence file');
  const evPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant11.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('evidence file exists', ev.length > 0, evPath);
  T.ok('evidence file names the merge 0f55a928c', ev.indexOf('0f55a928c') !== -1, 'merge present');
  T.ok('evidence file names the far end 203a32775', ev.indexOf('203a32775') !== -1, 'far end present');
  T.ok('evidence file names the band 190391-190398', ev.indexOf('190391') !== -1 && ev.indexOf('190398') !== -1, 'band present');
  T.ok('evidence file names the STEP id t11-0f55a928c', ev.indexOf('t11-0f55a928c') !== -1, 'STEP present');
  T.ok('evidence file records the STOP clause', ev.indexOf('STOP clause') !== -1, 'STOP clause present');
  T.ok('evidence file records the thresholds (CARRIER <=1/8, AMBIGUOUS 2/8, NOT-CARRIER >=3/8)',
    ev.indexOf('CARRIER') !== -1 && ev.indexOf('AMBIGUOUS') !== -1 && ev.indexOf('NOT-CARRIER') !== -1, 'thresholds present');
  T.ok('evidence file records the subject branch name transplant-11-subject', ev.indexOf('transplant-11-subject') !== -1, 'subject branch present');
  T.ok('evidence file records the clean-pick prediction (0 markers)', ev.indexOf('0 conflict markers') !== -1, 'prediction present');
  T.ok('evidence file records the canon note (CONVERSATIONS.md covers dialogue; no doc covers voice-line decoration)',
    ev.indexOf('CONVERSATIONS.md') !== -1 && ev.indexOf('NO canon doc') !== -1, 'canon note present');
  T.ok('evidence file records the horizon 150d death-aware', ev.indexOf('150d') !== -1, 'horizon present');
  T.ok('evidence file records the competent verbatim own-policy', ev.indexOf('competent') !== -1, 'policy present');
  const prPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant11-prereg.md');
  const pr = fs.existsSync(prPath) ? fs.readFileSync(prPath, 'utf8') : '';
  T.ok('prereg file exists (committed before the subject/sim)', pr.length > 0, prPath);
  T.ok('prereg file records the merge-tree pre-check (clean pick)', pr.indexOf('CLEAN pick') !== -1, 'pre-check present');
  T.ok('prereg file records the FORMAL QUESTION GUARD content', pr.indexOf('FORMAL QUESTION GUARD') !== -1, 'guard content present');

  // ---- 6. Base state ----
  T.section('6. Base state — arm branch clean, subject cut, sim run');
  const headBranch = git('rev-parse --abbrev-ref HEAD');
  // worktreeOnly: branch-identity legs are meaningful only in the
  // worker tree. On merged master HEAD is 'master' by design (the
  // arm branch is deleted after landing) — the leg passes there
  // vacuously instead of failing, so the proof stays green on master
  // (0215Z lesson: 4b/5b/7 proofs read 127/129 etc. on master only
  // on branch-identity legs).
  const worktreeOnly = function (cond) { return cond || headBranch === 'master'; };
  T.ok('HEAD is on the arm branch sim-transplant11-a (worktree-only)', worktreeOnly(headBranch === 'sim-transplant11-a'), 'HEAD=' + headBranch);
  const dirtyJs = git('status --porcelain --untracked-files=no -- src/js');
  T.ok('no src/js file differs from HEAD', dirtyJs === '', dirtyJs.slice(0, 200) || '(clean)');
  const onDiskStanding = sha256(fs.readFileSync(path.join(REPO, 'src', 'js', 'standing.js'), 'utf8'));
  const headStanding = sha256(gitShow('HEAD', 'src/js/standing.js'));
  T.ok('on-disk standing.js is byte-identical to HEAD (no swap residue)', onDiskStanding === headStanding, onDiskStanding.slice(0, 12) + ' vs HEAD ' + headStanding.slice(0, 12));
  let toolingOk = true;
  for (const f of ['scripts/culpritbisect-driver-20261113.js', 'scripts/culpritbisect-analyze-20261113.js', 'scripts/masterregress-analyze-20261113.js', 'scripts/vetfirst-instrument-20261111.js']) {
    try { execSync('git show master:' + f, { cwd: REPO, stdio: 'pipe' }); } catch (e) { toolingOk = false; }
  }
  T.ok('step-script tooling source (master) still carries all four scratch files', toolingOk, toolingOk ? '4/4' : 'missing');
  const stepSrc = fs.readFileSync(path.join(REPO, 'scripts', 'culpritbisect-step.sh'), 'utf8');
  T.ok('step script names the band 190391..190398',
    stepSrc.indexOf('190391,190392,190393,190394,190395,190396,190397,190398') !== -1, 'band literal present');
  let subjectExists = true;
  try { git('rev-parse ' + SUBJECT_BRANCH); } catch (e) { subjectExists = false; }
  T.ok('subject branch exists (cut after the prereg commit)', subjectExists === true, SUBJECT_BRANCH);
  const t11Summary = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  T.ok('step summary exists (sim ran)', fs.existsSync(t11Summary) === true, STEP);
  const t11Driver = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  T.ok('step driver log exists (sim ran)', fs.existsSync(t11Driver) === true, STEP);

  // ---- 7. Subject + sim (stage 2) ----
  T.section('7. Subject built, family diff verified, step measured 5/8 NOT-CARRIER');
  let subjectTip = null;
  try { subjectTip = git('rev-parse ' + SUBJECT_BRANCH); } catch (e) { subjectTip = null; }
  T.ok('subject branch exists at the recorded commit', subjectTip === SUBJECT, subjectTip ? subjectTip.slice(0, 12) : '(missing)');
  T.ok('subject parent is the far end 203a32775', git('rev-parse ' + SUBJECT + '^') === FAR_FULL, git('rev-parse ' + SUBJECT + '^').slice(0, 12));
  T.ok('subject standing.js is the far-end native (swap restored, 75762cb2...)',
    sha256(gitShow(SUBJECT, 'src/js/standing.js')).startsWith('75762cb2'), sha256(gitShow(SUBJECT, 'src/js/standing.js')).slice(0, 12));
  T.ok('subject competent.js is the far-end policy (a7ff5c51...)',
    sha256(gitShow(SUBJECT, 'scripts/policies/competent.js')).startsWith('a7ff5c51'), sha256(gitShow(SUBJECT, 'scripts/policies/competent.js')).slice(0, 12));
  // Measured family diff content-identical: compare CONTENT lines only
  // (blob hashes + hunk line numbers legitimately differ — the far-end
  // conversation.js sits on a different base than the first parent).
  function diffContentLines(a, b, paths) {
    const out = execSync('git diff ' + a + ' ' + b + ' -- ' + paths, { cwd: REPO, stdio: 'pipe' }).toString('utf8');
    return out.split('\n').filter(function (ln) { return /^[-+][^-+]/.test(ln); }).join('\n');
  }
  const subjectMeasured = diffContentLines(FAR, SUBJECT, 'src/js scripts/policies ' + TEST_FILE);
  const familyMeasured = diffContentLines(MERGE + '^1', MERGE, 'src/js scripts/policies ' + TEST_FILE);
  T.ok('measured family diff (src/js + policies + test file) is content-identical: subject-vs-far-end == family-vs-first-parent',
    subjectMeasured === familyMeasured, 'content lines match');
  const subConv = gitShow(SUBJECT, 'src/js/conversation.js');
  T.ok('subject conversation.js carries asksQ + FORMAL QUESTION GUARD',
    subConv.indexOf('const asksQ = /\\?/.test(inner);') !== -1 && subConv.indexOf('FORMAL QUESTION GUARD') !== -1, 'guard present');
  let subjectMarkers = [];
  try {
    subjectMarkers = execSync('git grep -l -E "^(<<<<<<<|=======|>>>>>>>)" ' + SUBJECT + ' -- scripts/ src/', { cwd: REPO, stdio: 'pipe' }).toString().trim().split('\n').filter(Boolean);
  } catch (e) { subjectMarkers = []; }
  T.ok('no conflict markers anywhere in the subject tree', subjectMarkers.length === 0, subjectMarkers.join(', ') || '(none)');
  // Step summary + driver log.
  const summaryPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  T.ok('step summary exists', fs.existsSync(summaryPath), STEP);
  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
  T.ok('summary step id is t11-0f55a928c', summary.step === STEP, summary.step);
  T.ok('summary survived is 5/8', summary.survived === 5, 'survived=' + summary.survived);
  T.ok('summary verdict is GOOD', summary.verdict === 'GOOD', summary.verdict);
  T.ok('5/8 maps to NOT-CARRIER (binding threshold)', classifyTransplant(summary.survived) === 'NOT-CARRIER', classifyTransplant(summary.survived));
  T.ok('summary rank is REGIONAL_INTACT', summary.rankVerdict === 'REGIONAL_INTACT', summary.rankVerdict);
  T.ok('summary median is 150d', summary.wall.medianDays === 150, 'median=' + summary.wall.medianDays);
  T.ok('summary wave-5 is 2/8', summary.wall.wave5 === 2, 'wave5=' + summary.wall.wave5);
  T.ok('summary wave-4 is 8/8', summary.wall.wave4 === 8, 'wave4=' + summary.wall.wave4);
  T.ok('summary national/table/wins are 0', summary.wall.national === 0 && summary.wall.table === 0 && summary.wall.wins === 0, '0/0/0');
  T.ok('summary regional is 8/8, village 0/8', summary.wall.regional === 8 && summary.wall.village === 0, 'regional=' + summary.wall.regional + ' village=' + summary.wall.village);
  T.ok('summary deaths total 736', summary.wall.deaths === 736, 'deaths=' + summary.wall.deaths);
  T.ok('summary standing range is 199-320', summary.wall.standingRange[0] === 199 && summary.wall.standingRange[1] === 320, summary.wall.standingRange.join('-'));
  T.ok('summary blooded is 2/8', summary.wall.blooded === 2, 'blooded=' + summary.wall.blooded);
  T.ok('summary instrument errors are 0', summary.instrumentErrors === 0, 'errors=' + summary.instrumentErrors);
  const seedDays = { 190391: 95, 190392: 150, 190393: 150, 190394: 150, 190395: 150, 190396: 150, 190397: 137, 190398: 140 };
  let seedsOk = true, seedsBad = null;
  for (const row of summary.perSeed) {
    if (row.days !== seedDays[row.seed] || row.anchorCommit !== '3b8ba98b0f8b' || row.standingFix !== true || row.standingSha !== 'f8fda4295a99' || row.policySha !== 'a7ff5c516440' || row.errors !== 0) {
      seedsOk = false; seedsBad = 'seed ' + row.seed; break;
    }
  }
  T.ok('all 8 per-seed legs ran on the subject with the fix swapped in, 0 errors', seedsOk, seedsBad || '8/8 legs clean');
  const survivors = summary.perSeed.filter(function (r) { return r.endReason === 'survived'; }).map(function (r) { return r.seed; });
  T.ok('survivors are 190392, 190393, 190394, 190395, 190396', JSON.stringify(survivors) === JSON.stringify([190392, 190393, 190394, 190395, 190396]), survivors.join(', '));
  // Non-inertness read: per-seed days are NOT identical to the far-end
  // endpoint days recorded in the bisect prereg (86/144/150/43/150/
  // 87/150/150) — the family moves trajectories in both directions.
  const farDays = { 190391: 86, 190392: 144, 190393: 150, 190394: 43, 190395: 150, 190396: 87, 190397: 150, 190398: 150 };
  let moved = 0;
  for (const row of summary.perSeed) {
    if (row.days !== farDays[row.seed]) moved++;
  }
  T.ok('per-seed days are NOT identical to the far-end endpoint days (family moves trajectories: 6/8 seeds differ)',
    moved === 6, moved + '/8 differ');
  T.ok('190394 improved 43d -> 150d (largest single-seed move)', seedDays[190394] === 150 && farDays[190394] === 43, '43 -> 150');
  T.ok('tribute-ready on 0/8 (all veterans-short)', summary.perSeed.filter(function (r) { return r.tribute && r.tribute.ready; }).length === 0, '0/8 ready');
  const driverLogPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  T.ok('step driver log exists', fs.existsSync(driverLogPath), STEP);
  const driverLog = fs.readFileSync(driverLogPath, 'utf8');
  T.ok('driver log records the GOOD 5/8 classification', driverLog.indexOf('GOOD (survived 5/8)') !== -1, 'GOOD 5/8 present');
  // Sense-testing corpus checks: conversation volume is high, no
  // stacked decoration anywhere in the corpus, the corpus carries
  // no conversation transcripts (instrument limitation, recorded).
  const corpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  const corpusFiles = fs.readdirSync(corpusDir).filter(function (f) { return f.slice(-5) === '.json'; });
  T.ok('step corpus holds 8 per-seed JSONs', corpusFiles.length === 8, corpusFiles.length + ' files');
  let corpusText = '', totVet = 0, totSay = 0;
  for (const f of corpusFiles) {
    const c = JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8'));
    corpusText += fs.readFileSync(path.join(corpusDir, f), 'utf8');
    totVet += (c.vetSays || []).length;
    totSay += c.sayCount || 0;
  }
  T.ok('corpus holds 226 vetSays (defense broadcasts)', totVet === 226, 'vetSays=' + totVet);
  T.ok('corpus holds 114716 sayCount lines (conversation volume high)', totSay === 114716, 'sayCount=' + totSay);
  T.ok('stacked opener "Practical view:" appears 0 times in the corpus',
    corpusText.split('Practical view:').length - 1 === 0, '0 mentions');
  T.ok('fighting closer "Extremely normal" appears 0 times in the corpus',
    corpusText.split('Extremely normal').length - 1 === 0, '0 mentions');
  T.ok('authored question "funniest thing" appears 0 times (corpus carries no conversation transcripts)',
    corpusText.split('funniest thing').length - 1 === 0, '0 mentions');
  // Evidence records the verdict + subject + numbers.
  const ev2 = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('evidence file records the verdict as NOT-CARRIER', ev2.indexOf('VERDICT: NOT-CARRIER') !== -1, 'NOT-CARRIER present');
  T.ok('evidence file records the subject commit 3b8ba98b0', ev2.indexOf('3b8ba98b0') !== -1, 'subject hash present');
  T.ok('evidence file records survived 5/8', ev2.indexOf('5/8') !== -1, '5/8 present');
  T.ok('evidence file records the telemetry refusal', ev2.indexOf('refusing recorder-corpus') !== -1 || ev2.indexOf('REFUSED') !== -1, 'refusal recorded');
  T.ok('evidence file records the content-identical diff verification', ev2.indexOf('content-identical') !== -1, 'verification recorded');
  T.ok('evidence file records the non-identical-days read', ev2.indexOf('NOT identical') !== -1, 'non-inertness recorded');
  T.ok('evidence file records the family test 11/11 PASS on the subject', ev2.indexOf('11/11 PASS') !== -1, 'family test recorded');
  // Base restored: back on the arm branch, clean, standing.js == HEAD.
  const headBranch2 = git('rev-parse --abbrev-ref HEAD');
  T.ok('HEAD is back on the arm branch sim-transplant11-a after the step (worktree-only)', worktreeOnly(headBranch2 === 'sim-transplant11-a'), 'HEAD=' + headBranch2);
  const dirtyAfter = git('status --porcelain --untracked-files=no');
  T.ok('tracked tree is clean after the step', dirtyAfter === '', dirtyAfter.slice(0, 200) || '(clean)');
  const onDiskStanding2 = sha256(fs.readFileSync(path.join(REPO, 'src', 'js', 'standing.js'), 'utf8'));
  const headStanding2 = sha256(gitShow('HEAD', 'src/js/standing.js'));
  T.ok('on-disk standing.js is byte-identical to HEAD (no swap residue)', onDiskStanding2 === headStanding2, onDiskStanding2.slice(0, 12));
  T.ok('subject branch is LEFT in place (not merged, not deleted)', subjectTip === SUBJECT, subjectTip ? subjectTip.slice(0, 12) : '(missing)');

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
