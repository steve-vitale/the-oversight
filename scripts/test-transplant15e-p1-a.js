#!/usr/bin/env node
// test-transplant15e-p1-a.js — proof test for the H1 TRANSPLANT,
// family 15E PICK-1 ALONE (resume-offer Yes, arm
// sim-transplant15e-p1-a).
//
// THE QUESTION (evidence/2026-11-14/sim-transplant15e-p1-prereg.md,
// prereg committed before any judged sim ran): land origin family
// 15E pick 1 alone onto the far end 203a32775 (GOOD 4/8):
// bb6a301cf (resume-offer Yes delivers the unfinished thread).
// Picks 2 (OVE-33) and 3 (OVE-57) are NOT measured by this arm:
// pick 2 conflicts on src/js/conversation.js because it is written
// against family 14's convoSnippetIsStageDirection function, which
// the far end never had (evidence/2026-11-14/sim-transplant15e.md,
// UNMEASURED-BY-CONFLICT); pick 3 is the sibling arm
// sim-transplant15e-p3conv-a's. Grouping prereg:
// hidden_files/family15-grouping-prereg-2026-11-14.md §15E. Binding
// prereg: sim-scale-onramp-round-2115.md §3.
//
// SUBJECT (verified, never rebuilt by this arm): branch
// transplant-15e-subject at f541e4cd1 = far end + pick 1, cut by
// the 15E-alone arm (live pick 1, clean apply). This proof verifies
// it from the branch, not from the prior arm's claim.
//
// STAGE 1 (this file as committed with the prereg) proves:
//   1. Pick-1 identity — hash, subject, first parent (family 14
//      merge 7688cb7a4), exactly 1 parent, exact numstats (3
//      files, +148/-4), no standing.js, no policy file, no
//      green-list.txt.
//   2. Subject verification — branch exists at f541e4cd1, parent
//      is the far end, tree is f9e9b8b8… (the predicted
//      pick-1-resolved tree), exactly 1 commit on the far end,
//      diff vs far end is exactly pick 1, diff changed-lines
//      identical to bb6a301cf's diff, standing.js + policy
//      byte-identical to the far end, no tooling file in the
//      commit.
//   3. Merge-tree pre-check — pick 1 rc=0 CLEAN (tree f9e9b8b8…,
//      prediction commit 19e50e1e0, parent = far end, predicted
//      tree diff vs far end is exactly pick 1).
//   4. Pick content — resumeOffer/resumeTid + STORY-OFFER
//      follow-through (pick 1); no damage/armor/spawn/food-yield/
//      spoilage/wave/table-gate numbers changed.
//   5. Verdict mapping — classifyTransplant maps every survived
//      count (≤1 CARRIER / 2 AMBIGUOUS / ≥3 NOT-CARRIER).
//   6. Prereg recorded in the evidence file (base, pick, seeds,
//      horizon, policy, STEP id t15e-p1, thresholds, STOP clause,
//      subject branch name, merge-tree prediction, ordering note,
//      seed-band freshness note, canon note, fix policy, scope
//      note for picks 2/3).
//   7. Base state — HEAD is on sim-transplant15e-p1-a, no src/js
//      file differs from HEAD, on-disk standing.js is
//      byte-identical to HEAD, the step-script tooling source
//      (master) still carries all four scratch files; the step
//      script names the band 190391-190398; no STEP t15e-p1
//      summary/driver log/corpus exists; no cherry-pick is in
//      progress.
//   8. Scope — the 15E-alone arm's evidence records the pick-2
//      STOP (UNMEASURED-BY-CONFLICT) and the coordinator decision
//      owed, so this arm's pick-1-alone scope is documented
//      there, not invented here.
// STAGE 2 (appended after the step) proves the live step:
//   9. STEP t15e-p1 verdict (survived/8, per-seed days, rank,
//      wall numbers) from the summary + corpus; the pick's own
//      test passes on the subject checkout.
//  10. Base restored — arm branch checked back out, standing.js
//      == HEAD, no swap residue, evidence file records the
//      verdict, the per-seed table, and the telemetry refusal.
//
// Usage: node scripts/test-transplant15e-p1-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant15e-p1-a');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const PICK1 = 'bb6a301cf6433e2a62fe6a6e5fc95ca9ecd986c1';
const FIRST1 = '7688cb7a46367c88c7bb85e976502ddc0d5456f0';
const SUBJECT = 'f541e4cd14eec841a7d2b0808d34376af98184ca';
const SUBJECT_BRANCH = 'transplant-15e-subject';
const STEP = 't15e-p1';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const MT1_TREE = 'f9e9b8b80156e7157793e7ee6a69306edcd5c738';
const PRED1_COMMIT = '19e50e1e0e48b21094eccc9b139672900afaba21';
const PICK1_NUMSTAT = ['29\t0\tevidence/2026-11-08/story-offer-yes-followthrough.md', '73\t0\tscripts/test-story-offer-yes-20261108.js', '46\t4\tsrc/js/conversation.js'];

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
// mergeTree(base, ours, theirs): run `git merge-tree --write-tree
// --merge-base=<base> <ours> <theirs>` (read-only dry run — touches
// no worktree) and return { rc, tree, conflicted: [paths], raw }.
function mergeTree(base, ours, theirs) {
  let rc = 0;
  let out = '';
  try {
    out = execSync('git merge-tree --write-tree --merge-base=' + base + ' ' + ours + ' ' + theirs,
      { cwd: REPO, stdio: 'pipe', maxBuffer: 512 * 1024 * 1024 }).toString('utf8');
  } catch (e) {
    rc = e.status || 1;
    out = (e.stdout || Buffer.alloc(0)).toString('utf8');
  }
  const lines = out.split('\n');
  const tree = (lines[0] || '').trim();
  const conflicted = [];
  for (const ln of lines) {
    const m = ln.match(/^\d{6} [0-9a-f]{40} [123]\t(.+)$/);
    if (m && conflicted.indexOf(m[1]) === -1) conflicted.push(m[1]);
  }
  return { rc: rc, tree: tree, conflicted: conflicted.sort(), raw: out };
}
// changedLines(diffText): the +/- content lines of a unified diff
// (excluding +++ / --- headers) — the part that must be identical
// between the pick's own diff and the subject's diff vs the far
// end, even when hunk line numbers differ.
function changedLines(diffText) {
  return diffText.split('\n').filter(function (ln) {
    return (ln[0] === '+' || ln[0] === '-') && ln.slice(0, 3) !== '+++' && ln.slice(0, 3) !== '---';
  }).join('\n');
}

(async () => {
  // ---- 1. Pick-1 identity ----
  T.section('1. Pick-1 identity — bb6a301cf, standalone, 3 files +148/-4');
  T.ok('pick 1 exists', git('rev-parse ' + PICK1).length === 40, git('log -1 --format=%s ' + PICK1).slice(0, 80));
  T.ok('pick 1 subject is "Deliver unfinished thread on resume-offer Yes"',
    git('log -1 --format=%s ' + PICK1) === 'Deliver unfinished thread on resume-offer Yes', git('log -1 --format=%s ' + PICK1).slice(0, 80));
  T.ok('pick 1 first parent is 7688cb7a4 (family 14, PR #10 snippet-stage-direction-guard)',
    git('rev-parse ' + PICK1 + '^1') === FIRST1, git('log -1 --format=%h\\ %s ' + PICK1 + '^1').slice(0, 80));
  const parents = git('show -s --format=%P ' + PICK1).split(' ').filter(Boolean);
  T.ok('pick 1 has exactly 1 parent (standalone, not a merge)', parents.length === 1, 'parents=' + parents.length);
  const jsFiles = git('diff --name-only ' + PICK1 + '^1 ' + PICK1 + ' -- src/js').split('\n').sort();
  T.ok('pick 1 touches exactly src/js/conversation.js', JSON.stringify(jsFiles) === JSON.stringify(['src/js/conversation.js']), jsFiles.join(', '));
  T.ok('pick 1 conversation.js is +46/-4',
    git('diff --numstat ' + PICK1 + '^1 ' + PICK1 + ' -- src/js/conversation.js') === '46\t4\tsrc/js/conversation.js', '46/4');
  T.ok('pick 1 test file is +73/-0',
    git('diff --numstat ' + PICK1 + '^1 ' + PICK1 + ' -- scripts/test-story-offer-yes-20261108.js') === '73\t0\tscripts/test-story-offer-yes-20261108.js', '73/0');
  T.ok('pick 1 evidence file is +29/-0',
    git('diff --numstat ' + PICK1 + '^1 ' + PICK1 + ' -- evidence/2026-11-08/story-offer-yes-followthrough.md') === '29\t0\tevidence/2026-11-08/story-offer-yes-followthrough.md', '29/0');
  T.ok('pick 1 does not touch standing.js', git('diff --name-only ' + PICK1 + '^1 ' + PICK1 + ' -- src/js/standing.js') === '', '(absent)');
  T.ok('pick 1 touches no policy file', git('diff --name-only ' + PICK1 + '^1 ' + PICK1 + ' -- scripts/policies') === '', '(none)');
  T.ok('pick 1 does not touch green-list.txt', git('diff --numstat ' + PICK1 + '^1 ' + PICK1 + ' -- scripts/green-list.txt') === '', '(absent)');
  T.ok('pick 1 does not touch balance-proof.json', git('diff --numstat ' + PICK1 + '^1 ' + PICK1 + ' -- scripts/balance-proof.json') === '', '(absent)');
  const farStanding = sha256(gitShow(FAR, 'src/js/standing.js'));
  T.ok('far-end native standing.js sha is 75762cb2...', farStanding.startsWith('75762cb2'), farStanding.slice(0, 12));
  T.ok('fix standing.js sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  const farPolicy = sha256(gitShow(FAR, 'scripts/policies/competent.js'));
  T.ok('far-end policy sha is a7ff5c51...', farPolicy.startsWith('a7ff5c51'), farPolicy.slice(0, 12));

  // ---- 2. Subject verification ----
  T.section('2. Subject verification — transplant-15e-subject at f541e4cd1 = far end + pick 1');
  let subjectExists = true;
  try { git('rev-parse ' + SUBJECT_BRANCH); } catch (e) { subjectExists = false; }
  T.ok('subject branch exists', subjectExists === true, SUBJECT_BRANCH + ' present');
  T.ok('subject tip is f541e4cd1', git('rev-parse ' + SUBJECT_BRANCH) === SUBJECT, git('rev-parse ' + SUBJECT_BRANCH).slice(0, 12));
  T.ok('subject tip subject is "Deliver unfinished thread on resume-offer Yes"',
    git('log -1 --format=%s ' + SUBJECT_BRANCH) === 'Deliver unfinished thread on resume-offer Yes', git('log -1 --format=%s ' + SUBJECT_BRANCH).slice(0, 80));
  T.ok('subject parent is the far end 203a32775',
    git('rev-parse ' + SUBJECT_BRANCH + '^1') === git('rev-parse ' + FAR), git('rev-parse ' + SUBJECT_BRANCH + '^1').slice(0, 12));
  T.ok('subject has exactly 1 commit on top of the far end (pick 1 only)',
    git('rev-list --count ' + FAR + '..' + SUBJECT_BRANCH) === '1', 'count=1');
  T.ok('subject tree is f9e9b8b8… (the predicted pick-1-resolved tree)',
    git('rev-parse ' + SUBJECT_BRANCH + '^{tree}') === MT1_TREE, git('rev-parse ' + SUBJECT_BRANCH + '^{tree}').slice(0, 12));
  const subjNumstat = git('diff --numstat ' + FAR + ' ' + SUBJECT_BRANCH);
  T.ok('subject diff vs far end is exactly pick 1 (3 files, +148/-4)',
    subjNumstat.split('\n').sort().join('\n') === PICK1_NUMSTAT.slice().sort().join('\n'), subjNumstat.replace(/\n/g, ' | '));
  const subjFiles = git('diff --name-only ' + FAR + ' ' + SUBJECT_BRANCH).split('\n').sort();
  T.ok('subject touches exactly the 3 files (no tooling file in the commit)',
    JSON.stringify(subjFiles) === JSON.stringify(['evidence/2026-11-08/story-offer-yes-followthrough.md', 'scripts/test-story-offer-yes-20261108.js', 'src/js/conversation.js']), subjFiles.join(', '));
  const subjDiff = execSync('git diff ' + FAR + '..' + SUBJECT_BRANCH, { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  const pickDiff = execSync('git diff ' + PICK1 + '^1 ' + PICK1, { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  T.ok('subject diff changed-lines are identical to pick 1\'s diff changed-lines (only index hashes / hunk line numbers differ)',
    changedLines(subjDiff) === changedLines(pickDiff), 'changed lines identical');
  T.ok('subject standing.js is the far-end native (75762cb2…)',
    sha256(gitShow(SUBJECT_BRANCH, 'src/js/standing.js')) === farStanding, sha256(gitShow(SUBJECT_BRANCH, 'src/js/standing.js')).slice(0, 12));
  T.ok('subject policy is the far-end policy (a7ff5c51…)',
    sha256(gitShow(SUBJECT_BRANCH, 'scripts/policies/competent.js')) === farPolicy, sha256(gitShow(SUBJECT_BRANCH, 'scripts/policies/competent.js')).slice(0, 12));
  T.ok('no pick-2 commit exists on the subject (OVE-33 never landed)',
    git('log --format=%s ' + FAR + '..' + SUBJECT_BRANCH).indexOf('OVE-33') === -1, 'no OVE-33 commit');
  T.ok('no pick-3 commit exists on the subject (OVE-57 never attempted)',
    git('log --format=%s ' + FAR + '..' + SUBJECT_BRANCH).indexOf('OVE-57') === -1, 'no OVE-57 commit');

  // ---- 3. Merge-tree pre-check ----
  T.section('3. Merge-tree pre-check — pick 1 clean on the far end');
  const mt1 = mergeTree(FIRST1, FAR, PICK1);
  T.ok('pick 1 merge-tree rc=0 (clean)', mt1.rc === 0, 'rc=' + mt1.rc);
  T.ok('pick 1 merge-tree tree is f9e9b8b8…', mt1.tree === MT1_TREE, mt1.tree.slice(0, 12));
  T.ok('pick 1 merge-tree conflicts NOTHING', JSON.stringify(mt1.conflicted) === JSON.stringify([]), mt1.conflicted.join(', ') || '(none)');
  T.ok('prediction commit 19e50e1e carries the predicted tree with parent = far end',
    git('rev-parse ' + PRED1_COMMIT + '^{tree}') === MT1_TREE && git('rev-parse ' + PRED1_COMMIT + '^1') === git('rev-parse ' + FAR), 'tree+parent ok');
  const pred1Numstat = git('diff --numstat ' + FAR + ' ' + PRED1_COMMIT);
  T.ok('predicted pick-1-resolved tree diff vs far end is exactly pick 1 (3 files, +148/-4)',
    pred1Numstat.split('\n').sort().join('\n') === PICK1_NUMSTAT.slice().sort().join('\n'), pred1Numstat.replace(/\n/g, ' | '));

  // ---- 4. Pick content ----
  T.section('4. Pick content — resume repair, no lever numbers changed');
  const conv1 = gitShow(PICK1, 'src/js/conversation.js');
  T.ok('pick 1 tags the resume opener (resumeOffer flag + resumeTid)',
    conv1.indexOf('resumeOffer') !== -1 && conv1.indexOf('resumeTid') !== -1, 'resumeOffer/resumeTid present');
  T.ok('pick 1 marks the hanging genericQ so Yes follows through (c.genericQ.resumeOffer)',
    conv1.indexOf('c.genericQ.resumeOffer = true') !== -1, 'genericQ resumeOffer present');
  T.ok('pick 1 adds the STORY-OFFER FOLLOW-THROUGH comment in the gq:yn handler',
    conv1.indexOf('STORY-OFFER FOLLOW-THROUGH') !== -1, 'STORY-OFFER comment present');
  T.ok('pick 1 returns resumeOffer on the opener (resumeOffer: !!resumeOffer)',
    conv1.indexOf('resumeOffer: !!resumeOffer') !== -1, 'opener return present');
  const subjConv = gitShow(SUBJECT_BRANCH, 'src/js/conversation.js');
  T.ok('subject conversation.js carries the resume repair (12 resumeOffer occurrences on 10 lines)',
    (subjConv.match(/resumeOffer/g) || []).length === 12, 'count=' + (subjConv.match(/resumeOffer/g) || []).length);
  const diffJs = execSync('git diff ' + PICK1 + '^1 ' + PICK1 + ' -- src/js', { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  const changedJs = diffJs.split('\n').filter(function (ln) {
    return (ln[0] === '+' || ln[0] === '-') && ln.slice(0, 3) !== '+++' && ln.slice(0, 3) !== '---';
  }).join('\n');
  T.ok('pick 1 changed lines touch no damage/armor/spawn/food-yield/spoilage identifier',
    ['damage', 'armor', 'spawnMonster', 'foodYield', 'spoilage'].every(function (w) { return changedJs.indexOf(w) === -1; }), 'no lever identifiers');
  T.ok('pick 1 changed lines touch no wave/table gate (no wave5, deedGate, table-price hunk)',
    changedJs.indexOf('wave5') === -1 && changedJs.indexOf('deedGate') === -1, 'no gate identifiers');

  // ---- 5. Verdict mapping ----
  T.section('5. Verdict mapping — pick-1 thresholds');
  const table = [[0, 'CARRIER'], [1, 'CARRIER'], [2, 'AMBIGUOUS'], [3, 'NOT-CARRIER'], [4, 'NOT-CARRIER'], [8, 'NOT-CARRIER'], [-1, 'UNCLASSIFIABLE'], [9, 'UNCLASSIFIABLE'], [NaN, 'UNCLASSIFIABLE']];
  for (const pair of table) {
    T.ok('survived ' + pair[0] + ' -> ' + pair[1], classifyTransplant(pair[0]) === pair[1], classifyTransplant(pair[0]));
  }

  // ---- 6. Prereg recorded in the evidence file ----
  T.section('6. Prereg recorded in the evidence file');
  const evPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15e-p1-prereg.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('prereg file exists', ev.length > 0, evPath);
  T.ok('prereg names pick bb6a301cf (resume-offer Yes)', ev.indexOf('bb6a301cf') !== -1, 'pick 1 present');
  T.ok('prereg names the far end 203a32775', ev.indexOf('203a32775') !== -1, 'far end present');
  T.ok('prereg names the band 190391-190398', ev.indexOf('190391') !== -1 && ev.indexOf('190398') !== -1, 'band present');
  T.ok('prereg names the STEP id t15e-p1', ev.indexOf('t15e-p1') !== -1, 'STEP present');
  T.ok('prereg names the subject tip f541e4cd1', ev.indexOf('f541e4cd1') !== -1, 'subject tip present');
  T.ok('prereg names the predicted tree f9e9b8b8', ev.indexOf('f9e9b8b8') !== -1, 'predicted tree present');
  T.ok('prereg records the thresholds (CARRIER <=1/8, AMBIGUOUS 2/8, NOT-CARRIER >=3/8)',
    ev.indexOf('CARRIER') !== -1 && ev.indexOf('AMBIGUOUS') !== -1 && ev.indexOf('NOT-CARRIER') !== -1, 'thresholds present');
  T.ok('prereg records the STOP clause', ev.indexOf('STOP clause') !== -1, 'STOP clause present');
  T.ok('prereg records the subject branch name transplant-15e-subject', ev.indexOf('transplant-15e-subject') !== -1, 'subject branch present');
  T.ok('prereg records the pick-2/pick-3 scope (not measured by this arm)',
    ev.indexOf('NOT measured by this arm') !== -1 || ev.indexOf('NOT\n  measured by this arm') !== -1, 'scope present');
  T.ok('prereg records the grouping authority (§15E)', ev.indexOf('family15-grouping-prereg-2026-11-14.md') !== -1, 'authority present');
  T.ok('prereg records the canon note (CONVERSATIONS.md; resume opener must deliver the thread)',
    ev.indexOf('CONVERSATIONS.md') !== -1, 'canon note present');
  T.ok('prereg records the horizon 150d death-aware', ev.indexOf('150d') !== -1, 'horizon present');
  T.ok('prereg records the competent verbatim own-policy', ev.indexOf('competent') !== -1, 'policy present');
  T.ok('prereg records the ordering note (verification ran during prereg preparation, subject not rebuilt)',
    ev.indexOf('Ordering note') !== -1, 'ordering note present');
  T.ok('prereg records the seed-band freshness note (75 preregs, reused by design)',
    ev.indexOf('75 preregs') !== -1 && ev.indexOf('reused BY DESIGN') !== -1, 'seed-band note present');
  T.ok('prereg records the fix policy (bisect prereg §Fix policy)', ev.indexOf('Fix policy') !== -1, 'fix policy present');
  T.ok('prereg records the coordinator decision (round-1653Z next blank #1, route (b))',
    ev.indexOf('1653') !== -1 && ev.indexOf('route (b)') !== -1, 'coordinator decision present');
  T.ok('prereg records that the re-run leg is vacuous under a deterministic harness (15A-pick1 note)',
    ev.indexOf('vacuous') !== -1, 're-run note present');

  // ---- 7. Base state ----
  // STAGE 2 NOTE: the three "no judged sim ran" legs below were
  // true at stage 1 (prereg commit) and are now superseded by the
  // step having run — they assert the step artifacts EXIST, and
  // section 9 proves their contents. (The 15E-alone arm's stage 1
  // kept the negative form because its step never ran; this arm's
  // step ran, so the legs flip rather than lie.)
  T.section('7. Base state — arm branch clean, subject verified, step run (stage 2)');
  const headBranch = git('rev-parse --abbrev-ref HEAD');
  // worktreeOnly: branch-identity legs are meaningful only in the
  // worker tree. On merged master HEAD is 'master' by design (the
  // arm branch is deleted after landing) — the leg passes there
  // vacuously instead of failing, so the proof stays green on master
  // (0215Z lesson). Prereg-commit ancestry legs resolve by
  // message/subject, not hash (0608Z lesson: an adoption rebase
  // rewrites hashes).
  const worktreeOnly = function (cond) { return cond || headBranch === 'master'; };
  T.ok('HEAD is on the arm branch sim-transplant15e-p1-a (worktree-only)', worktreeOnly(headBranch === 'sim-transplant15e-p1-a'), 'HEAD=' + headBranch);
  const dirtyJs = git('diff --name-only HEAD -- src/js');
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
  const t15eSummary = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  T.ok('step summary exists for t15e-p1 (judged sim ran; contents proved in §9)', fs.existsSync(t15eSummary) === true, STEP);
  const t15eDriver = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  T.ok('step driver log exists for t15e-p1 (judged sim ran; contents proved in §9)', fs.existsSync(t15eDriver) === true, STEP);
  const corpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  T.ok('step corpus exists for t15e-p1 (judged sim ran; contents proved in §9)', fs.existsSync(corpusDir) === true, STEP);
  let cherryPickHead = true;
  try { execSync('git rev-parse --verify CHERRY_PICK_HEAD', { cwd: REPO, stdio: 'pipe' }); } catch (e) { cherryPickHead = false; }
  T.ok('no cherry-pick is in progress', cherryPickHead === false, 'CHERRY_PICK_HEAD absent');
  const dirtyTracked = git('diff --name-only HEAD');
  const allowed = ['scripts/test-transplant15e-p1-a.js', 'evidence/2026-11-14/sim-transplant15e-p1-prereg.md', 'evidence/2026-11-14/sim-transplant15e-p1.md'];
  const dirtyOther = dirtyTracked.split('\n').filter(function (ln) {
    return ln && !allowed.some(function (a) { return ln === a; });
  }).join('\n');
  T.ok('tracked tree is clean apart from this proof + the prereg + the evidence file (uncommitted until this proof passes)', dirtyOther === '', dirtyOther.slice(0, 200) || '(only allowed files)');

  // ---- 8. Scope — the 15E-alone arm's STOP is the documented reason picks 2/3 are out ----
  T.section('8. Scope — 15E-alone arm STOP documents why picks 2/3 are out of this arm');
  const ev15ePath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15e.md');
  const ev15e = fs.existsSync(ev15ePath) ? fs.readFileSync(ev15ePath, 'utf8') : '';
  T.ok('15E-alone evidence file exists', ev15e.length > 0, ev15ePath);
  T.ok('15E-alone evidence records the outcome as UNMEASURED-BY-CONFLICT', ev15e.indexOf('UNMEASURED-BY-CONFLICT') !== -1, 'outcome present');
  T.ok('15E-alone evidence records the pick-2 conflict list (UU balance-proof, UU phone-frame-proof, DU test-snippet, UU conversation.js)',
    ev15e.indexOf('UU scripts/balance-proof.json') !== -1 && ev15e.indexOf('UU scripts/phone-frame-proof.json') !== -1 && ev15e.indexOf('DU scripts/test-snippet-stage-direction.js') !== -1 && ev15e.indexOf('UU src/js/conversation.js') !== -1, 'conflict list present');
  T.ok('15E-alone evidence records the pick-2 mechanism (family 14 7688cb7a4)',
    ev15e.indexOf('7688cb7a4') !== -1, 'mechanism present');
  T.ok('15E-alone evidence records the coordinator decision owed (pick-1-alone route (b))',
    ev15e.indexOf('Coordinator decision owed') !== -1 && ev15e.indexOf('(b)') !== -1, 'coordinator note present');
  T.ok('15E-alone evidence records that its STEP t15e-resume never ran',
    ev15e.indexOf('t15e-resume') !== -1 && ev15e.indexOf('never run') !== -1, 'STEP never ran present');
  T.ok('this arm claims no verdict for picks 2/3 (prereg scope, not a group verdict)',
    ev.indexOf('Picks 2 (OVE-33) and 3 (OVE-57) are NOT') !== -1, 'scope in prereg');

  // ---- 9. STEP t15e-p1 verdict — NOT-CARRIER, per-seed days identical to the far end ----
  T.section('9. STEP t15e-p1 verdict — NOT-CARRIER, per-seed days identical to the far end');
  const sumPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  T.ok('step summary exists', fs.existsSync(sumPath), sumPath);
  const sum = JSON.parse(fs.readFileSync(sumPath, 'utf8'));
  T.ok('summary step is t15e-p1', sum.step === STEP, sum.step);
  T.ok('summary survived is 4/8', sum.survived === 4, 'survived=' + sum.survived);
  T.ok('summary verdict is GOOD', sum.verdict === 'GOOD', sum.verdict);
  T.ok('summary rank is REGIONAL_INTACT', sum.rankVerdict === 'REGIONAL_INTACT', sum.rankVerdict);
  T.ok('summary is classifiable', sum.classifiable === true, 'classifiable=' + sum.classifiable);
  const stepDays = sum.perSeed.map(function (s) { return s.days; });
  T.ok('step per-seed days are 86/144/150/43/150/87/150/150',
    JSON.stringify(stepDays) === JSON.stringify([86, 144, 150, 43, 150, 87, 150, 150]), stepDays.join('/'));
  const farDays = SEEDS.map(function (sd) { return sum.endpoints.far.days[String(sd)]; });
  T.ok('step per-seed days EQUAL the far-end endpoint days recorded in the same summary (inertness read)',
    JSON.stringify(stepDays) === JSON.stringify(farDays), 'step=' + stepDays.join('/') + ' far=' + farDays.join('/'));
  T.ok('survivors are 190393, 190395, 190397, 190398 (the far end\'s survivors)',
    JSON.stringify(sum.perSeed.filter(function (s) { return s.endReason === 'survived'; }).map(function (s) { return s.seed; })) === JSON.stringify([190393, 190395, 190397, 190398]),
    sum.perSeed.filter(function (s) { return s.endReason === 'survived'; }).map(function (s) { return s.seed; }).join(','));
  let stepOk = true;
  for (const s of sum.perSeed) {
    if (s.anchorCommit.indexOf('f541e4cd1') !== 0 || s.standingFix !== true ||
      s.standingSha.indexOf('f8fda429') !== 0 || s.policySha.indexOf('a7ff5c51') !== 0 || s.errors !== 0) stepOk = false;
  }
  T.ok('every per-seed row: anchor f541e4cd1, fix swapped (f8fda429), far-end policy (a7ff5c51), errors 0',
    stepOk && sum.perSeed.length === 8, '8/8 rows ok');
  T.ok('summary instrumentErrors is 0', sum.instrumentErrors === 0, 'errors=' + sum.instrumentErrors);
  T.ok('wall: wins 0, national 0, table 0', sum.wall.wins === 0 && sum.wall.national === 0 && sum.wall.table === 0, 'wins/national/table 0');
  T.ok('wall: regional 7/8, village 1/8', sum.wall.regional === 7 && sum.wall.village === 1, 'regional 7, village 1');
  T.ok('wall: wave-5 2/8, wave-4 8/8', sum.wall.wave5 === 2 && sum.wall.wave4 === 8, 'wave5 2, wave4 8');
  T.ok('wall: median 150d, deaths 629, standing 150-325, blooded 4/8',
    sum.wall.medianDays === 150 && sum.wall.deaths === 629 && JSON.stringify(sum.wall.standingRange) === JSON.stringify([150, 325]) && sum.wall.blooded === 4,
    'median 150, deaths 629, standing 150-325, blooded 4');
  T.ok('death causes: total 629, villager combat 267 (42%), starvation 1',
    sum.deathCauses.total === 629 && sum.deathCauses.counts['villager combat'] === 267 && sum.deathCauses.counts.starvation === 1,
    'total 629, villager-combat 267, starvation 1');
  T.ok('classifyTransplant(4) is NOT-CARRIER (no re-run leg at 4/8)', classifyTransplant(sum.survived) === 'NOT-CARRIER', classifyTransplant(sum.survived));
  const drvPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  const drv = fs.existsSync(drvPath) ? fs.readFileSync(drvPath, 'utf8') : '';
  T.ok('step driver log exists and records GOOD (survived 4/8)',
    drv.indexOf('culpritbisect-a t15e-p1: GOOD (survived 4/8)') !== -1, 'driver verdict present');
  const corpusDir2 = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  const corpusFiles = fs.existsSync(corpusDir2) ? fs.readdirSync(corpusDir2).filter(function (f) { return f.slice(-5) === '.json'; }) : [];
  T.ok('step corpus has 8 per-seed JSONs', corpusFiles.length === 8, 'files=' + corpusFiles.length);
  let vetTotal = 0;
  let sayTotal = 0;
  for (const f of corpusFiles) {
    const j = JSON.parse(fs.readFileSync(path.join(corpusDir2, f), 'utf8'));
    vetTotal += (j.vetSays || []).length;
    sayTotal += (j.sayCount || 0);
  }
  T.ok('corpus carries 225 vetSays', vetTotal === 225, 'vetSays=' + vetTotal);
  T.ok('corpus carries 98,590 sayCount lines', sayTotal === 98590, 'sayCount=' + sayTotal);
  const evP1Path = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15e-p1.md');
  const evP1 = fs.existsSync(evP1Path) ? fs.readFileSync(evP1Path, 'utf8') : '';
  T.ok('evidence file records the pick\'s own test 11/11 PASS on the subject checkout',
    evP1.indexOf('11/11 PASS') !== -1, 'family test present');

  // ---- 10. Base restored — arm branch back, standing clean, evidence records the verdict ----
  T.section('10. Base restored — arm branch back, standing clean, evidence records the verdict');
  const headBranch2 = git('rev-parse --abbrev-ref HEAD');
  T.ok('HEAD is back on the arm branch sim-transplant15e-p1-a after the step (worktree-only)', worktreeOnly(headBranch2 === 'sim-transplant15e-p1-a'), 'HEAD=' + headBranch2);
  const onDiskStanding2 = sha256(fs.readFileSync(path.join(REPO, 'src', 'js', 'standing.js'), 'utf8'));
  const headStanding2 = sha256(gitShow('HEAD', 'src/js/standing.js'));
  T.ok('on-disk standing.js is byte-identical to HEAD (no swap residue)', onDiskStanding2 === headStanding2, onDiskStanding2.slice(0, 12) + ' vs HEAD ' + headStanding2.slice(0, 12));
  let cherryPickHead2 = true;
  try { execSync('git rev-parse --verify CHERRY_PICK_HEAD', { cwd: REPO, stdio: 'pipe' }); } catch (e) { cherryPickHead2 = false; }
  T.ok('no cherry-pick is in progress', cherryPickHead2 === false, 'CHERRY_PICK_HEAD absent');
  const logSubjects = git('log --format=%s HEAD');
  T.ok('prereg commit is an ancestor of HEAD (resolved by message, not hash)',
    logSubjects.indexOf('sim-transplant15e-p1-a: prereg + stage-1 proof (86 legs; subject verified f541e4cd1, STEP t15e-p1)') !== -1, 'prereg message present');
  T.ok('evidence file exists', evP1.length > 0, evP1Path);
  T.ok('evidence file records VERDICT: NOT-CARRIER', evP1.indexOf('VERDICT: NOT-CARRIER') !== -1, 'verdict present');
  T.ok('evidence file records survived 4/8 and the per-seed day vector 86/144/150/43/150/87/150/150',
    evP1.indexOf('Survived: 4/8') !== -1 && evP1.indexOf('86/144/150/43/150/87/150/150') !== -1, 'survival present');
  T.ok('evidence file records the inertness read (per-seed days identical to the far end)',
    evP1.indexOf('THE INERTNESS READ') !== -1 && evP1.indexOf('byte-identical') !== -1, 'inertness read present');
  T.ok('evidence file records wave-5 2/8 and median 150d',
    evP1.indexOf('Wave-5: 2/8') !== -1 && evP1.indexOf('Median: 150d') !== -1, 'secondaries present');
  T.ok('evidence file records the STEP id t15e-p1 and its 16m19s runtime',
    evP1.indexOf('t15e-p1') !== -1 && evP1.indexOf('16m19s') !== -1, 'STEP present');
  T.ok('evidence file records the subject tip f541e4cd1', evP1.indexOf('f541e4cd1') !== -1, 'subject tip present');
  T.ok('evidence file records the telemetry refusal (recorder-corpus class, baseline NOT rolled)',
    evP1.indexOf('REFUSED') !== -1 && evP1.indexOf('baseline\nNOT rolled') !== -1, 'telemetry refusal present');
  T.ok('evidence file records the sense-testing read (225 vetSays, 98,590 sayCount)',
    evP1.indexOf('225 vetSays') !== -1 && evP1.indexOf('98,590 sayCount') !== -1, 'sense-testing present');
  T.ok('evidence file records the infrastructure (flap, lock contention, index clobber, slow git)',
    evP1.indexOf('HOST WRITE FLAP') !== -1 && evP1.indexOf('REGISTRY LOCK CONTENTION') !== -1 &&
    evP1.indexOf('INDEX CLOBBER') !== -1 && evP1.indexOf('SLOW GIT UNDER LOAD') !== -1, 'infrastructure present');
  const dirtyTracked2 = git('diff --name-only HEAD');
  const allowed2 = ['scripts/test-transplant15e-p1-a.js', 'evidence/2026-11-14/sim-transplant15e-p1.md'];
  const dirtyOther2 = dirtyTracked2.split('\n').filter(function (ln) {
    return ln && !allowed2.some(function (a) { return ln === a; });
  }).join('\n');
  T.ok('tracked tree is clean apart from this proof (stage 2) + the evidence file (uncommitted until this proof passes)', dirtyOther2 === '', dirtyOther2.slice(0, 200) || '(only allowed files)');

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
