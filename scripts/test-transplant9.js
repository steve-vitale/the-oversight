#!/usr/bin/env node
// test-transplant9.js — proof test for the H1 TRANSPLANT, family 9
// (arm sim-transplant9).
//
// THE QUESTION (evidence/2026-11-13/sim-transplant9.md, prereg
// committed before any judged sim): land origin family 9 — merge
// e44b0206e "Merge pull request #14 from steve-vitale/cursor/
// favor-debt-help-coherence-bb3e" (js=2, pol=0; single commit
// 15e338184 "Fix favor/debt Help contradicting unfinished
// openers") — onto the far end 203a32775 (GOOD 4/8) via
// `git cherry-pick -m 1 e44b0206e`. The merge-tree dry run predicts
// a CLEAN pick (0 conflict markers): both src/js files auto-merge,
// the test file is a clean add. On ANY live conflict: STOP per the
// binding prereg (sim-scale-onramp-round-2115.md §3) — report the
// conflict list, do NOT hand-resolve game code.
//
// WHAT THIS TEST PROVES (stage 1, sections 1-6):
//   1. Family identity — merge e44b0206e, its parents, the
//      single-commit second-parent side, the exact 2 src/js files
//      (+40/-5 dialogue, +58/-3 wants), the test file (+165/-0),
//      no policy file, no standing.js.
//   2. Merge-tree pre-check (read-only) — exactly TWO changed-in-
//      both files at 0 markers, ONE added-in-remote file at 0
//      markers, no other section, no DU, no conflict markers.
//   3. Family content — the diff is a dialogue-coherence fix only:
//      unfinished-outing and deferred-after-resume guards in
//      convo-dialogue.js, deferred guards + repay-help lines in
//      convo-wants.js; no numeric/economy/combat/food change.
//   4. Verdict mapping — classifyTransplant maps every survived
//      count; conflictStop9 maps any conflicted file to
//      'UNMEASURED' and an empty set to 'NO-CONFLICT'.
//   5. Prereg recorded in the evidence file (thresholds, STOP
//      clause, seeds, horizon, policy, canon note).
//   6. Base state — HEAD is on sim-transplant9, no src/js file
//      differs from HEAD, on-disk standing.js is byte-identical
//      to HEAD, the step-script tooling source (master) still
//      carries all four scratch files; the step script names the
//      band 190391-190398; the subject branch does not exist yet
//      and no step summary/driver log exists yet at stage 1 (those
//      legs flip to the stage-2 state when §7 is appended).
// (stage 2, section 7 — appended after the pick + sim: subject
// commit recorded, family diff byte-identical, step measured,
// base restored.)
//
// Usage: node scripts/test-transplant9.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant9');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const MERGE = 'e44b0206e';
const FIRST = 'aa4f6d54d';
const SECOND = '15e338184';
const SUBJECT_BRANCH = 'transplant-9-subject';
const STEP = 't9-e44b0206e';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const EXPECTED_JS = [
  'src/js/convo-dialogue.js', 'src/js/convo-wants.js',
];
// Blobs from the merge-tree dry run (base = first parent).
const EXPECTED_BLOBS = {
  'src/js/convo-dialogue.js': { base: '00a7a4d4', our: '688757a3', their: 'a5622af34' },
  'src/js/convo-wants.js': { base: '1dbc2c21a', our: '477da4ed', their: 'e451ad028' },
};
const TEST_FILE = 'scripts/test-favor-debt-help-coherence-20261108.js';
const TEST_BLOB = '02d9ccb9d';

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
// conflictStop9(files): the family-9 conflict rule — ANY conflicted
// file STOPs the arm (binding prereg: no hand-resolution of game
// code, no narrowed re-run by the arm). Only an empty set proceeds.
function conflictStop9(files) {
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
  T.section('1. Family identity — favor-debt-help-coherence merge e44b0206e');
  T.ok('merge commit exists', git('rev-parse ' + MERGE).length === 40, git('log -1 --format=%s ' + MERGE).slice(0, 80));
  T.ok('first parent is aa4f6d54d', git('rev-parse ' + MERGE + '^1').startsWith('aa4f6d54d'), git('log -1 --format=%h\\ %s ' + MERGE + '^1').slice(0, 80));
  T.ok('second parent is 15e338184 (the favor-debt fix commit)', git('rev-parse ' + MERGE + '^2').startsWith('15e338184'), git('log -1 --format=%h\\ %s ' + MERGE + '^2').slice(0, 80));
  const sideCount = parseInt(git('rev-list --count ' + MERGE + '^1..' + MERGE + '^2'), 10);
  T.ok('second-parent side is 1 commit', sideCount === 1, 'count=' + sideCount);
  const sideSubject = git('log --format=%s ' + MERGE + '^1..' + MERGE + '^2');
  T.ok('second-parent side is "Fix favor/debt Help contradicting unfinished openers"',
    sideSubject === 'Fix favor/debt Help contradicting unfinished openers', sideSubject.slice(0, 80));
  const jsFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- src/js').split('\n').sort();
  T.ok('family touches exactly the 2 expected src/js files', JSON.stringify(jsFiles) === JSON.stringify(EXPECTED_JS.slice().sort()), jsFiles.join(', '));
  const dlgStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/js/convo-dialogue.js');
  T.ok('convo-dialogue.js is +40/-5', dlgStat === '40\t5\tsrc/js/convo-dialogue.js', dlgStat);
  const wantsStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/js/convo-wants.js');
  T.ok('convo-wants.js is +58/-3', wantsStat === '58\t3\tsrc/js/convo-wants.js', wantsStat);
  const testStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- ' + TEST_FILE);
  T.ok('test file is +165/-0 (new file)', testStat === '165\t0\t' + TEST_FILE, testStat);
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
  T.ok('family total is 3 files, +263/-8', totalLines.length === 3 && totalStat.ins === 263 && totalStat.del === 8,
    totalLines.length + ' files, +' + totalStat.ins + '/-' + totalStat.del);
  const farStanding = sha256(gitShow(FAR, 'src/js/standing.js'));
  T.ok('far-end native standing.js sha is 75762cb2...', farStanding.startsWith('75762cb2'), farStanding.slice(0, 12));
  T.ok('fix standing.js sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  const farPolicy = sha256(gitShow(FAR, 'scripts/policies/competent.js'));
  T.ok('far-end policy sha is a7ff5c51...', farPolicy.startsWith('a7ff5c51'), farPolicy.slice(0, 12));
  // Far-end substrate: both convo files present.
  const farDlg = git('ls-tree ' + FAR + ' -- src/js/convo-dialogue.js');
  T.ok('far-end convo-dialogue.js present (blob 688757a3, == merge-tree ours)', farDlg.indexOf('688757a3') !== -1, farDlg.slice(0, 60));
  const farWants = git('ls-tree ' + FAR + ' -- src/js/convo-wants.js');
  T.ok('far-end convo-wants.js present (blob 477da4ed, == merge-tree ours)', farWants.indexOf('477da4ed') !== -1, farWants.slice(0, 60));
  let farTest = '';
  try { farTest = git('ls-tree ' + FAR + ' -- ' + TEST_FILE); } catch (e) { farTest = ''; }
  T.ok('far-end test file ABSENT (new file, clean add, no DU)', farTest === '', '(absent)');

  // ---- 2. Merge-tree pre-check prediction ----
  T.section('2. Merge-tree pre-check — clean pick predicted (base = first parent)');
  const mt = mergeTreeConflicts();
  const cib = mt.found.changedInBoth;
  T.ok('merge-tree reports exactly TWO changed-in-both files', Object.keys(cib).length === 2,
    Object.keys(cib).join(', '));
  let mtOk = true, mtBad = null;
  for (const f of EXPECTED_JS) {
    if (cib[f] !== 0) { mtOk = false; mtBad = f + ' (got ' + cib[f] + ', want 0)'; break; }
  }
  T.ok('merge-tree reports 0 markers on both changed-in-both files', mtOk, mtBad || '2/2 clean');
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

  // ---- 3. Family content — dialogue coherence only ----
  T.section('3. Family content — Help-coherence fix, no numeric/economy/combat change');
  const mergeDlg = gitShow(MERGE, 'src/js/convo-dialogue.js');
  T.ok('merge dialogue defines unfinishedOuting (water_haul / forage_help not returned)',
    mergeDlg.indexOf('unfinishedOuting') !== -1 && mergeDlg.indexOf("helpFavor.kind === 'water_haul'") !== -1 && mergeDlg.indexOf("helpFavor.kind === 'forage_help'") !== -1, 'unfinishedOuting present');
  T.ok('merge dialogue defines deferredAfterResume (resume opener, unpinned favor)',
    mergeDlg.indexOf('deferredAfterResume') !== -1 && mergeDlg.indexOf('c._resumedOnce') !== -1, 'deferredAfterResume present');
  T.ok('merge dialogue names the unfinished haul honestly on blocked Help',
    mergeDlg.indexOf('We still need to get home and unload what we have') !== -1, 'honest line present');
  const mergeWants = gitShow(MERGE, 'src/js/convo-wants.js');
  T.ok('merge wants adds repay:help:water lines (finish the haul)',
    mergeWants.indexOf('repay:help:water') !== -1 && mergeWants.indexOf('finish the haul') !== -1, 'water repay lines present');
  T.ok('merge wants adds repay:help:forage lines (finish the outing)',
    mergeWants.indexOf('repay:help:forage') !== -1 && mergeWants.indexOf('finish the outing') !== -1, 'forage repay lines present');
  T.ok('merge wants guards the settled short-circuit with deferredAfterResume',
    mergeWants.indexOf('!deferredAfterResume && favor &&') !== -1, 'guard present');
  const familyDiff = execSync('git diff ' + MERGE + '^1 ' + MERGE + ' -- src/js', { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  T.ok('family diff touches no food/economy/combat identifier (kcal, damage, armor, spawn)',
    ['kcal', 'damage', 'armor', 'spawnMonster', 'foodYield', 'spoilage'].every(function (w) { return familyDiff.indexOf(w) === -1; }),
    'no numeric identifiers');
  T.ok('family diff touches no standing/table/wave identifier',
    ['standing', 'table', 'wave5', 'Wave 5', 'deedGate'].every(function (w) { return familyDiff.indexOf(w) === -1; }),
    'no scale identifiers');

  // ---- 4. Verdict mapping ----
  T.section('4. Verdict mapping — transplant thresholds + conflict rule');
  const table = [[0, 'CARRIER'], [1, 'CARRIER'], [2, 'AMBIGUOUS'], [3, 'NOT-CARRIER'], [4, 'NOT-CARRIER'], [8, 'NOT-CARRIER'], [-1, 'UNCLASSIFIABLE'], [9, 'UNCLASSIFIABLE'], [NaN, 'UNCLASSIFIABLE']];
  for (const pair of table) {
    T.ok('survived ' + pair[0] + ' -> ' + pair[1], classifyTransplant(pair[0]) === pair[1], classifyTransplant(pair[0]));
  }
  T.ok('conflict rule: no conflict -> NO-CONFLICT', conflictStop9([]) === 'NO-CONFLICT', conflictStop9([]));
  T.ok('conflict rule: one src/js file -> UNMEASURED', conflictStop9(['src/js/convo-dialogue.js']) === 'UNMEASURED', conflictStop9(['src/js/convo-dialogue.js']));
  T.ok('conflict rule: one tooling file -> UNMEASURED (no narrowed re-run by this arm)',
    conflictStop9(['scripts/balance-proof.json']) === 'UNMEASURED', conflictStop9(['scripts/balance-proof.json']));
  T.ok('conflict rule: both convo files -> UNMEASURED', conflictStop9(EXPECTED_JS) === 'UNMEASURED', conflictStop9(EXPECTED_JS));

  // ---- 5. Prereg recorded in the evidence file ----
  T.section('5. Prereg recorded in the evidence file');
  const evPath = path.join(REPO, 'evidence', '2026-11-13', 'sim-transplant9.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('evidence file exists', ev.length > 0, evPath);
  T.ok('evidence file names the merge e44b0206e', ev.indexOf('e44b0206e') !== -1, 'merge present');
  T.ok('evidence file names the far end 203a32775', ev.indexOf('203a32775') !== -1, 'far end present');
  T.ok('evidence file names the band 190391-190398', ev.indexOf('190391') !== -1 && ev.indexOf('190398') !== -1, 'band present');
  T.ok('evidence file names the STEP id t9-e44b0206e', ev.indexOf('t9-e44b0206e') !== -1, 'STEP present');
  T.ok('evidence file records the STOP clause', ev.indexOf('STOP clause') !== -1, 'STOP clause present');
  T.ok('evidence file records the thresholds (CARRIER <=1/8, AMBIGUOUS 2/8, NOT-CARRIER >=3/8)',
    ev.indexOf('CARRIER') !== -1 && ev.indexOf('AMBIGUOUS') !== -1 && ev.indexOf('NOT-CARRIER') !== -1, 'thresholds present');
  T.ok('evidence file records the subject branch name transplant-9-subject', ev.indexOf('transplant-9-subject') !== -1, 'subject branch present');
  T.ok('evidence file records the clean-pick prediction (0 markers)', ev.indexOf('0 conflict markers') !== -1, 'prediction present');
  T.ok('evidence file records the canon note (CONVERSATIONS.md covers favor coherence)',
    ev.indexOf('CONVERSATIONS.md') !== -1, 'canon note present');
  T.ok('evidence file records the horizon 150d death-aware', ev.indexOf('150d') !== -1, 'horizon present');
  T.ok('evidence file records the competent verbatim own-policy', ev.indexOf('competent') !== -1, 'policy present');

  // ---- 6. Base state ----
  // NOTE (stage 2): the three 'not yet' legs below were true at the
  // stage-1 commit and are superseded now that the subject is cut and
  // the sim ran — they assert the stage-2 state instead.
  T.section('6. Base state — arm branch clean, subject not yet cut, sim not yet run');
  const headBranch = git('rev-parse --abbrev-ref HEAD');
  // worktreeOnly: branch-identity legs are meaningful only in the
  // worker tree. On merged master HEAD is 'master' by design (the
  // arm branch is deleted after landing) — the leg passes there
  // vacuously instead of failing, so the proof stays green on master
  // (0215Z lesson: 4b/5b/7 proofs read 127/129 etc. on master only
  // on branch-identity legs).
  const worktreeOnly = function (cond) { return cond || headBranch === 'master'; };
  T.ok('HEAD is on the arm branch sim-transplant9 (worktree-only)', worktreeOnly(headBranch === 'sim-transplant9'), 'HEAD=' + headBranch);
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
  T.ok('subject branch does NOT exist yet (cut after the stage-1 commit)', subjectExists === false, SUBJECT_BRANCH);
  const t9Summary = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  T.ok('step summary does NOT exist yet (sim not run)', fs.existsSync(t9Summary) === false, STEP);
  const t9Driver = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  T.ok('step driver log does NOT exist yet (sim not run)', fs.existsSync(t9Driver) === false, STEP);

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
