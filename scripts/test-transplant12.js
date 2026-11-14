#!/usr/bin/env node
// test-transplant12.js — proof test for the H1 TRANSPLANT, family 12
// (arm sim-transplant12).
//
// THE QUESTION (evidence/2026-11-14/sim-transplant12-prereg.md, prereg
// committed before any judged sim — and before cutting the subject):
// land origin family 12 — merge ac119e4ed "Merge pull request #25
// from steve-vitale/cursor/dialog-residual-sampler-f726" (js=1,
// pol=0; single commit 3015beec0 "Reject residual silence/meta resume
// memory quotes") — onto the far end 203a32775 (GOOD 4/8) via
// `git cherry-pick -m 1 ac119e4ed`. The merge-tree dry run predicts
// a CONFLICT (1 `+<<<<<<<` marker): the stage-direction guard the
// family extends is ORIGIN-ONLY — the far end has 0 occurrences of
// convoSnippetIsStageDirection and the test file does not exist
// there. On ANY live conflict: STOP per the binding prereg
// (sim-scale-onramp-round-2115.md §3) — report the conflict list,
// do NOT hand-resolve game code.
//
// WHAT THIS TEST PROVES (stage 1, sections 1-6):
//   1. Family identity — merge ac119e4ed, its parents, the
//      single-commit second-parent side, the exact 1 src/js file
//      (+18/-3 conversation.js), the test file (+55/-2),
//      no policy file, no standing.js.
//   2. Merge-tree pre-check (read-only) — exactly ONE changed-in-
//      both file (conversation.js, 1 hunk, 3 marker lines) and ONE
//      removed-in-local file (the test file, 0 markers); no merged
//      section, no added section, no DU entry in the merge-tree
//      output; exactly ONE `+<<<<<<<` line in the whole output.
//   3. Family content — the diff is a dialogue-coherence fix only:
//      widened convoSnippetIsStageDirection + party-join assent
//      guard in conversation.js, OVE-29 assertions in the test
//      file; no numeric/economy/combat/food change.
//   4. Verdict mapping — classifyTransplant maps every survived
//      count; conflictStop12 maps any conflicted file to
//      'UNMEASURED' and an empty set to 'NO-CONFLICT'.
//   5. Prereg recorded in the evidence file (thresholds, STOP
//      clause, seeds, horizon, policy, canon note, merge-tree
//      prediction with the hunk anchor).
//   6. Base state — HEAD is on sim-transplant12-a, no src/js file
//      differs from HEAD, on-disk standing.js is byte-identical
//      to HEAD, the step-script tooling source (master) still
//      carries all four scratch files; the step script names the
//      band 190391-190398; the subject branch does not exist yet
//      and no step summary/driver log exists yet at stage 1 (those
//      legs flip to the stage-2 state when §7 is appended).
// (stage 2, section 7 — appended after the live pick: live conflict
// record, subject branch still at the far end, no subject commit,
// no step artifacts, HEAD back on the arm branch, tree clean.)
//
// Usage: node scripts/test-transplant12.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant12');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const MERGE = 'ac119e4ed';
const FIRST = 'aa5d9ef92d6f5e7d160f6b59bcbf7b54072b1ad0';
const SECOND = '3015beec0';
const SUBJECT_BRANCH = 'transplant-12-subject';
const STEP = 't12-ac119e4ed';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const EXPECTED_JS = ['src/js/conversation.js'];
// Blobs from the merge-tree dry run (base = first parent).
const EXPECTED_BLOBS = {
  'src/js/conversation.js': { base: 'f9f5a340ccb0', our: '1c9439009b19', their: 'ae77aa505688' },
};
const TEST_FILE = 'scripts/test-snippet-stage-direction.js';
const TEST_BLOBS = { base: '405b86d0f8d8', their: '4748638dab0e' };

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
// conflictStop12(files): the family-12 conflict rule — ANY conflicted
// file STOPs the arm (binding prereg: no hand-resolution of game
// code, no narrowed re-run by the arm). Only an empty set proceeds.
function conflictStop12(files) {
  if (!Array.isArray(files)) return 'UNCLASSIFIABLE';
  if (files.length === 0) return 'NO-CONFLICT';
  return 'UNMEASURED';
}
// mergeTreeConflicts(): run `git merge-tree <base> <ours> <theirs>`
// (read-only dry run — touches no worktree) and return
// { changedInBoth: {file: markers}, merged: {file: markers},
//   added: {file: markers}, removed: {file: markers}, raw } for each
// section. Marker lines are the `+<<<<<<<` / `+=======` / `+>>>>>>>`
// lines (bare `^<<<<<<<` grep returns 0 and falsely reports clean).
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
  T.section('1. Family identity — dialog-residual-sampler merge ac119e4ed');
  T.ok('merge commit exists', git('rev-parse ' + MERGE).length === 40, git('log -1 --format=%s ' + MERGE).slice(0, 80));
  T.ok('first parent is aa5d9ef92d6f5e7d160f6b59bcbf7b54072b1ad0', git('rev-parse ' + MERGE + '^1') === FIRST, git('log -1 --format=%h\\ %s ' + MERGE + '^1').slice(0, 80));
  T.ok('second parent is 3015beec0 (the residual-sampler commit)', git('rev-parse ' + MERGE + '^2').startsWith(SECOND), git('log -1 --format=%h\\ %s ' + MERGE + '^2').slice(0, 80));
  const sideCount = parseInt(git('rev-list --count ' + MERGE + '^1..' + MERGE + '^2'), 10);
  T.ok('second-parent side is 1 commit', sideCount === 1, 'count=' + sideCount);
  const sideSubject = git('log --format=%s ' + MERGE + '^1..' + MERGE + '^2');
  T.ok('second-parent side is "Reject residual silence/meta resume memory quotes"',
    sideSubject === 'Reject residual silence/meta resume memory quotes', sideSubject.slice(0, 80));
  const jsFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- src/js').split('\n').sort();
  T.ok('family touches exactly the 1 expected src/js file', JSON.stringify(jsFiles) === JSON.stringify(EXPECTED_JS.slice().sort()), jsFiles.join(', '));
  const convStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/js/conversation.js');
  T.ok('conversation.js is +18/-3', convStat === '18\t3\tsrc/js/conversation.js', convStat);
  const testStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- ' + TEST_FILE);
  T.ok('test file is +55/-2 (edited test)', testStat === '55\t2\t' + TEST_FILE, testStat);
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
  T.ok('family total is 2 files, +73/-5', totalLines.length === 2 && totalStat.ins === 73 && totalStat.del === 5,
    totalLines.length + ' files, +' + totalStat.ins + '/-' + totalStat.del);
  const farStanding = sha256(gitShow(FAR, 'src/js/standing.js'));
  T.ok('far-end native standing.js sha is 75762cb2...', farStanding.startsWith('75762cb2'), farStanding.slice(0, 12));
  T.ok('fix standing.js sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  const farPolicy = sha256(gitShow(FAR, 'scripts/policies/competent.js'));
  T.ok('far-end policy sha is a7ff5c51...', farPolicy.startsWith('a7ff5c51'), farPolicy.slice(0, 12));
  // Far-end substrate: the stage-direction guard is ORIGIN-ONLY.
  let farGuard = 0;
  try { farGuard = parseInt(git('grep -c convoSnippetIsStageDirection ' + FAR + ' -- src/js/conversation.js').split(':').pop(), 10); } catch (e) { farGuard = 0; }
  T.ok('far-end conversation.js has 0 convoSnippetIsStageDirection occurrences (guard is origin-only)', farGuard === 0, 'count=' + farGuard);
  let baseGuard = 0;
  try { baseGuard = parseInt(git('grep -c convoSnippetIsStageDirection ' + FIRST + ' -- src/js/conversation.js').split(':').pop(), 10); } catch (e) { baseGuard = 0; }
  T.ok('first parent has 3 convoSnippetIsStageDirection occurrences', baseGuard === 3, 'count=' + baseGuard);
  let farTest = '';
  try { farTest = git('ls-tree ' + FAR + ' -- ' + TEST_FILE); } catch (e) { farTest = ''; }
  T.ok('far-end test file ABSENT (created on the origin line, never on the local line)', farTest === '', '(absent)');
  const baseTest = git('ls-tree ' + FIRST + ' -- ' + TEST_FILE);
  T.ok('first-parent test file present (blob 405b86d0, == merge-tree base)', baseTest.indexOf('405b86d0') !== -1, baseTest.slice(0, 60));

  // ---- 2. Merge-tree pre-check prediction ----
  T.section('2. Merge-tree pre-check — CONFLICT predicted (base = first parent)');
  const mt = mergeTreeConflicts();
  const cib = mt.found.changedInBoth;
  T.ok('merge-tree reports exactly ONE changed-in-both file', Object.keys(cib).length === 1,
    Object.keys(cib).join(', '));
  T.ok('merge-tree changed-in-both file is src/js/conversation.js with 3 marker lines (1 hunk)',
    cib['src/js/conversation.js'] === 3, 'conversation.js markers=' + cib['src/js/conversation.js']);
  const conflicted = Object.keys(cib).filter(function (f) { return cib[f] > 0; }).sort();
  T.ok('merge-tree reports exactly ONE content-conflicted file', conflicted.length === 1 && conflicted[0] === 'src/js/conversation.js', conflicted.join(', '));
  T.ok('merge-tree reports no merged section', Object.keys(mt.found.merged).length === 0,
    Object.keys(mt.found.merged).join(', ') || '(none)');
  T.ok('merge-tree reports no added section', Object.keys(mt.found.added).length === 0,
    Object.keys(mt.found.added).join(', ') || '(none)');
  const rem = mt.found.removed;
  T.ok('merge-tree reports exactly ONE removed-in-local file (the test file, 0 markers)',
    Object.keys(rem).length === 1 && rem[TEST_FILE] === 0, Object.keys(rem).join(', '));
  T.ok('no DU entry in the merge-tree output', mt.raw.indexOf('deleted in local') === -1 && mt.raw.indexOf('deleted in remote') === -1, 'no DU sections');
  const plusOpen = (mt.raw.match(/^\+<<<<<<</gm) || []).length;
  T.ok('exactly ONE +<<<<<<< line in the whole merge-tree output', plusOpen === 1, 'count=' + plusOpen);
  T.ok('merge-tree hunk anchor is @@ -1725,8 +1725,40 @@', mt.raw.indexOf('@@ -1725,8 +1725,40 @@') !== -1, 'anchor present');
  T.ok('merge-tree hunk shows the bare-ours side (return true; },) vs the family side (stage-direction call + assent guard + method)',
    mt.raw.indexOf('<<<<<<< .our') !== -1 && mt.raw.indexOf('convoSnippetIsStageDirection(sn)) return false') !== -1 && mt.raw.indexOf('had better be worth it') !== -1, 'both sides present');
  const b = EXPECTED_BLOBS['src/js/conversation.js'];
  T.ok('merge-tree conversation.js base/our/their blobs are ' + b.base + '/' + b.our + '/' + b.their,
    mt.raw.indexOf('base   100644 ' + b.base) !== -1 && mt.raw.indexOf('our    100644 ' + b.our) !== -1 && mt.raw.indexOf('their  100644 ' + b.their) !== -1,
    'blobs present');
  T.ok('merge-tree test-file base/their blobs are ' + TEST_BLOBS.base + '/' + TEST_BLOBS.their + ' with NO our blob',
    mt.raw.indexOf('base   100644 ' + TEST_BLOBS.base) !== -1 && mt.raw.indexOf('their  100644 ' + TEST_BLOBS.their) !== -1 && mt.raw.indexOf('our    100644 ' + TEST_BLOBS.base) === -1,
    'test blobs present, no our blob');

  // ---- 3. Family content — dialogue coherence only ----
  T.section('3. Family content — residual-sampler coherence fix, no numeric/economy/combat change');
  const mergeConv = gitShow(MERGE, 'src/js/conversation.js');
  T.ok('merge conversation.js widens convoSnippetIsStageDirection (warm silence + Still-on + Say-it-plain)',
    mergeConv.indexOf('convoSnippetIsStageDirection(sn)') !== -1 && mergeConv.indexOf('Your silence|You say nothing') !== -1 && mergeConv.indexOf('/^Still on\\b/i.test(s)') !== -1 && mergeConv.indexOf('/^Say it plain\\.\\s*Still on\\b/i.test(s)') !== -1, 'widened guard present');
  T.ok('merge conversation.js adds the party-join assent guard (had better be worth it / not carrying your stuff)',
    mergeConv.indexOf('had better be worth it') !== -1 && mergeConv.indexOf('not carrying your stuff') !== -1 && mergeConv.indexOf('watch your back\\. Might as well') !== -1, 'assent guard present');
  T.ok('merge conversation.js strips quote marks before the stage-direction test',
    mergeConv.indexOf('replace(/^["') !== -1, 'quote-strip present');
  const mergeTest = gitShow(MERGE, 'scripts/test-snippet-stage-direction.js');
  T.ok('merge test file adds OVE-29 residual assertions (warm silence + Still-on + Say-it-plain)',
    mergeTest.indexOf('OVE-29 residual sampler') !== -1 && mergeTest.indexOf('You say nothing. Neither do they, for a while') !== -1 && mergeTest.indexOf('Still on that hard time.') !== -1, 'OVE-29 assertions present');
  T.ok('merge test file asserts party-join assent is not a real beat',
    mergeTest.indexOf('...Fine. This had better be worth it.') !== -1, 'assent assertion present');
  const familyDiff = execSync('git diff ' + MERGE + '^1 ' + MERGE + ' -- src/js', { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  T.ok('family diff touches no food/economy/combat identifier (kcal, damage, armor, spawn)',
    ['kcal', 'damage', 'armor', 'spawnMonster', 'foodYield', 'spoilage'].every(function (w) { return familyDiff.indexOf(w) === -1; }),
    'no numeric identifiers');
  // Word-boundary match: a bare 'table' substring would false-positive
  // on 'comfortable' (the warm-silence pool lines).
  T.ok('family diff touches no standing/table/wave identifier',
    [/\bstanding\b/, /\btable\b/, /wave5/, /Wave 5/, /deedGate/].every(function (re) { return !re.test(familyDiff); }),
    'no scale identifiers');

  // ---- 4. Verdict mapping ----
  T.section('4. Verdict mapping — transplant thresholds + conflict rule');
  const table = [[0, 'CARRIER'], [1, 'CARRIER'], [2, 'AMBIGUOUS'], [3, 'NOT-CARRIER'], [4, 'NOT-CARRIER'], [8, 'NOT-CARRIER'], [-1, 'UNCLASSIFIABLE'], [9, 'UNCLASSIFIABLE'], [NaN, 'UNCLASSIFIABLE']];
  for (const pair of table) {
    T.ok('survived ' + pair[0] + ' -> ' + pair[1], classifyTransplant(pair[0]) === pair[1], classifyTransplant(pair[0]));
  }
  T.ok('conflict rule: no conflict -> NO-CONFLICT', conflictStop12([]) === 'NO-CONFLICT', conflictStop12([]));
  T.ok('conflict rule: one src/js file -> UNMEASURED', conflictStop12(['src/js/conversation.js']) === 'UNMEASURED', conflictStop12(['src/js/conversation.js']));
  T.ok('conflict rule: one tooling file -> UNMEASURED (no narrowed re-run by this arm)',
    conflictStop12(['scripts/balance-proof.json']) === 'UNMEASURED', conflictStop12(['scripts/balance-proof.json']));
  T.ok('conflict rule: UU conversation.js + DU test file -> UNMEASURED',
    conflictStop12(['src/js/conversation.js', 'scripts/test-snippet-stage-direction.js']) === 'UNMEASURED', conflictStop12(['src/js/conversation.js', 'scripts/test-snippet-stage-direction.js']));

  // ---- 5. Prereg recorded in the evidence file ----
  T.section('5. Prereg recorded in the evidence file');
  const evPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant12-prereg.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('prereg file exists', ev.length > 0, evPath);
  T.ok('prereg names the merge ac119e4ed', ev.indexOf('ac119e4ed') !== -1, 'merge present');
  T.ok('prereg names the far end 203a32775', ev.indexOf('203a32775') !== -1, 'far end present');
  T.ok('prereg names the band 190391-190398', ev.indexOf('190391') !== -1 && ev.indexOf('190398') !== -1, 'band present');
  T.ok('prereg names the STEP id t12-ac119e4ed', ev.indexOf('t12-ac119e4ed') !== -1, 'STEP present');
  T.ok('prereg records the STOP clause', ev.indexOf('STOP clause') !== -1, 'STOP clause present');
  T.ok('prereg records the thresholds (CARRIER <=1/8, AMBIGUOUS 2/8, NOT-CARRIER >=3/8)',
    ev.indexOf('CARRIER') !== -1 && ev.indexOf('AMBIGUOUS') !== -1 && ev.indexOf('NOT-CARRIER') !== -1, 'thresholds present');
  T.ok('prereg records the subject branch name transplant-12-subject', ev.indexOf('transplant-12-subject') !== -1, 'subject branch present');
  T.ok('prereg records the conflict prediction (CONFLICT-STOP)', ev.indexOf('CONFLICT-STOP') !== -1, 'prediction present');
  T.ok('prereg records the hunk anchor @@ -1725,8 +1725,40 @@', ev.indexOf('@@ -1725,8 +1725,40 @@') !== -1, 'anchor present');
  T.ok('prereg records the canon note (CONVERSATIONS.md covers the sampler; no standalone residual-sampler doc)',
    ev.indexOf('CONVERSATIONS.md') !== -1 && ev.indexOf('No standalone canon doc covers the OVE-29 residual') !== -1, 'canon note present');
  T.ok('prereg records the horizon 150d death-aware', ev.indexOf('150d') !== -1, 'horizon present');
  T.ok('prereg records the competent verbatim own-policy', ev.indexOf('competent') !== -1, 'policy present');
  T.ok('prereg records the origin-only mechanism (0 occurrences at the far end)', ev.indexOf('0 occurrences') !== -1 || ev.indexOf('ORIGIN-ONLY') !== -1, 'mechanism present');

  // ---- 6. Base state ----
  // NOTE (stage 2): the two 'not yet' legs below were true at the
  // stage-1 commit and are superseded once the subject is cut and
  // the live pick runs — they assert the stage-2 state instead.
  T.section('6. Base state — arm branch clean, subject not yet cut, sim not yet run');
  const headBranch = git('rev-parse --abbrev-ref HEAD');
  // worktreeOnly: branch-identity legs are meaningful only in the
  // worker tree. On merged master HEAD is 'master' by design (the
  // arm branch is deleted after landing) — the leg passes there
  // vacuously instead of failing, so the proof stays green on master
  // (0215Z lesson: 4b/5b/7 proofs read 127/129 etc. on master only
  // on branch-identity legs).
  const worktreeOnly = function (cond) { return cond || headBranch === 'master'; };
  T.ok('HEAD is on the arm branch sim-transplant12-a (worktree-only)', worktreeOnly(headBranch === 'sim-transplant12-a'), 'HEAD=' + headBranch);
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
  const t12Summary = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  T.ok('step summary does NOT exist yet (no judged sim has run)', fs.existsSync(t12Summary) === false, STEP);
  const t12Driver = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  T.ok('step driver log does NOT exist yet (no judged sim has run)', fs.existsSync(t12Driver) === false, STEP);

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
