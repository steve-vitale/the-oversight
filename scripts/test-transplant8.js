#!/usr/bin/env node
// test-transplant8.js — proof test for the H1 TRANSPLANT, family 8
// (arm sim-transplant8).
//
// THE QUESTION (evidence/2026-11-13/sim-transplant8-prereg.md,
// committed before cutting the subject or running any judged sim):
// land origin family 8 — PR #22 merge 713eb7545
// (live-thread-dry-engage, dialog-coherence audit defect #4, 2
// src/js files) — onto the far end 203a32775 (GOOD 4/8) and measure
// whether it alone collapses it. Verdicts (fresh thresholds):
// <=1/8 CARRIER, 2/8 AMBIGUOUS (re-run once; 2/8 again -> recorded
// AMBIGUOUS, treated as NOT-CARRIER for ordering, kept on the
// suspect list), >=3/8 NOT-CARRIER.
//
// PREDICTED OUTCOME — UNMEASURED (conflict-STOP): the merge-tree
// pre-check predicts FOUR conflict hunks across TWO content-
// conflicted files, both src/js game code (conversation.js 1 hunk,
// convo-dialogue.js 3 hunks) — the far end's later journey work
// (r120 secret replies, sociallife blocked-repeat, favor
// settlement) rewrote the same lines the family rewrote for audit
// #4. The live cherry-pick is expected to reproduce all four hunks
// exactly, the run STOPS, no subject commit exists, no step ran, no
// survival number was measured. The conflicts are NOT tooling-only
// (game code), so the narrowed-tooling rule does not apply to this
// arm; a narrowed 8b would be a NEW family definition needing its
// own prereg and a coordinator decision, NOT this arm's call.
//
// WHAT THIS TEST PROVES:
//   1. Family identity — merge 713eb7545, its parents, the 1-commit
//      second-parent side, the exact 2 src/js files (+87/-3
//      conversation.js, +74/-12 convo-dialogue.js), +389/-15 total
//      over 3 files, no policy file, no standing.js, far-end
//      standing 75762cb2, fix f8fda429, far-end policy a7ff5c51,
//      merge policy == far-end policy, test file absent at far end
//      AND first parent, present at the merge (blob a0161cc9).
//   2. Merge-tree prediction (read-only) — exactly TWO 'changed in
//      both' sections: conversation.js 3 markers, convo-dialogue.js
//      9 markers; exactly TWO content-conflicted files; NO merged
//      sections, NO delete/modify (DU) entries; the test file is
//      'added in remote' (clean addition); the raw output carries
//      the ours/theirs signature lines of all four hunks.
//   3. Conflict-STOP rule + tooling-only analysis —
//      conflictStopVerdict maps the conflict sets for THIS arm: no
//      conflict -> MEASURABLE, ANY conflict -> UNMEASURED (no
//      carve-out — the narrowed-tooling rule does not apply);
//      both conflicted files are src/js game code, so the conflicts
//      are NOT tooling-only.
//   4. Verdict mapping — classifyTransplant maps every survived
//      count to CARRIER / AMBIGUOUS / NOT-CARRIER / UNCLASSIFIABLE.
//   5. Base state — HEAD is on sim-transplant8 in the worktree
//      (or master at the merged tip — branch-identity legs are
//      worktree-aware per the 0215 coordinator note, so the proof
//      stays green on master), no src/js file differs from HEAD,
//      on-disk standing.js is byte-identical to HEAD, and the
//      step-script tooling source (master) still carries all four
//      scratch files.
//   6. Seed-band identity — the step script and the prereg name
//      exactly seeds 190391–190398, the STEP id t8-713eb7545, and
//      the subject branch transplant-8-subject.
//   7. Live conflict record — (added after the pick) the subject
//      branch exists at the far end with NO subject commit; the
//      evidence file records the live UU files and hunks, the
//      UNMEASURED verdict, and the narrowed-8b note as a
//      coordinator decision.
//   8. No corpus — no step summary, driver log, or per-seed corpus
//      exists for STEP t8-713eb7545, because no judged sim ran.
//
// Usage: node scripts/test-transplant8.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant8');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const MERGE = '713eb7545';
const MERGE_FULL = '713eb754524458be067c79fbfd3c89ee814dde80';
const MERGE_BASE = '9f388a524';
const SECOND_FULL = '10724c18ddc5a7ebdc376aef3248cd318a9674f7';
const SUBJECT_BRANCH = 'transplant-8-subject';
const STEP = 't8-713eb7545';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const EXPECTED_JS = [
  'src/js/conversation.js', 'src/js/convo-dialogue.js',
];
const EXPECTED_FILES = [
  'scripts/test-live-thread-engage-dry-20261108.js',
  'src/js/conversation.js',
  'src/js/convo-dialogue.js',
];
// Marker counts from the merge-tree dry run, per 'changed in both' file
// (transplant118 counting method: +<<<<<<<, +=======, +>>>>>>>).
const EXPECTED_MARKERS = {
  'src/js/conversation.js': 3,
  'src/js/convo-dialogue.js': 9,
};
// The one file the far end and the first parent both lack, added
// cleanly by the pick.
const ADDED_CLEAN = 'scripts/test-live-thread-engage-dry-20261108.js';
const ADDED_BLOB = 'a0161cc9e2cff3a1d8dd220ffa160dfafd9a2fe5';
// Ours/theirs signature lines inside the four conflict hunks.
const HUNK_SIGNATURES = [
  'lessonOutcome', 'SECRET REPLIES', 'PLANT TEACH', 'plantTeachOutcome',
  'settledFavor', 'pinnedFavor', 'unfinishedOuting', 'liveUnfinished',
  'helpStructural', '_sayFellBack', 'UNFINISHED HELP BLOCKED',
];

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
// conflictStopVerdict(files): the binding STOP rule FOR THIS ARM —
// the narrowed-tooling rule does NOT apply to family 8 (task brief,
// explicit: full-family attempt; conflicts are src/js game code).
// ANY conflict stops the run (UNMEASURED); only a clean pick is
// MEASURABLE.
function conflictStopVerdict(files) {
  if (!Array.isArray(files)) return 'UNCLASSIFIABLE';
  if (files.length === 0) return 'MEASURABLE';
  return 'UNMEASURED';
}
// mergeTreeConflicts(): run `git merge-tree <base> <ours> <theirs>`
// (read-only dry run — touches no worktree) and return { found:
// { file: markers } for each 'changed in both' section, merged:
// { file: true } for each 'merged' section, raw: the raw output }.
// Sections end only on a known section header, so binary blob lines
// in other sections cannot end a section early.
function mergeTreeConflicts() {
  const out = execSync('git merge-tree ' + MERGE_BASE + ' ' + FAR + ' ' + MERGE,
    { cwd: REPO, stdio: 'pipe', maxBuffer: 512 * 1024 * 1024 }).toString('utf8');
  const lines = out.split('\n');
  const found = {};
  const merged = {};
  let cur = null;
  let curMerged = null;
  const record = function () { if (cur !== null && cur.file !== null) found[cur.file] = cur.markers; };
  for (const ln of lines) {
    if (/^(added in|removed in|renamed|merged|changed in both)/.test(ln)) {
      record();
      cur = (ln === 'changed in both') ? { file: null, markers: 0 } : null;
      curMerged = (ln === 'merged') ? { file: null } : null;
      continue;
    }
    if (cur !== null) {
      const m = ln.match(/^  base\s+\d+ [0-9a-f]+ (.+)$/);
      if (m && cur.file === null) cur.file = m[1];
      if (ln.indexOf('+<<<<<<<') === 0 || ln.indexOf('+>>>>>>>') === 0 || ln.indexOf('+=======') === 0) cur.markers++;
    }
    if (curMerged !== null) {
      const m = ln.match(/^  result\s+\d+ [0-9a-f]+ (.+)$/);
      if (m) merged[m[1]] = true;
    }
  }
  record();
  return { found: found, merged: merged, raw: out };
}

(async () => {
  // ---- 1. Family identity ----
  T.section('1. Family identity — PR #22 merge 713eb7545');
  T.ok('merge commit exists', git('rev-parse ' + MERGE) === MERGE_FULL, git('log -1 --format=%s ' + MERGE).slice(0, 80));
  T.ok('first parent is 9f388a524 (PR #21 merge, living-garden-deed)', git('rev-parse ' + MERGE + '^1').startsWith('9f388a524'), git('log -1 --format=%h\\ %s ' + MERGE + '^1').slice(0, 80));
  T.ok('second parent is 10724c18d (fix live unfinished Help/engage drying)', git('rev-parse ' + MERGE + '^2') === SECOND_FULL, git('log -1 --format=%h\\ %s ' + MERGE + '^2').slice(0, 80));
  const sideCount = parseInt(git('rev-list --count ' + MERGE + '^1..' + MERGE + '^2'), 10);
  T.ok('second-parent side is 1 commit', sideCount === 1, 'count=' + sideCount);
  const jsFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- src/js').split('\n').sort();
  T.ok('family touches exactly the 2 expected src/js files', JSON.stringify(jsFiles) === JSON.stringify(EXPECTED_JS.slice().sort()), jsFiles.join(', '));
  const convStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/js/conversation.js');
  const dlgStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/js/convo-dialogue.js');
  T.ok('conversation.js is 87+/3-', convStat === '87\t3\tsrc/js/conversation.js', convStat);
  T.ok('convo-dialogue.js is 74+/12-', dlgStat === '74\t12\tsrc/js/convo-dialogue.js', dlgStat);
  const allFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE).split('\n').sort();
  T.ok('family file list is exactly the 3 expected files', JSON.stringify(allFiles) === JSON.stringify(EXPECTED_FILES.slice().sort()), allFiles.join(', '));
  const tot = git('diff --numstat ' + MERGE + '^1 ' + MERGE).split('\n')
    .reduce(function (acc, line) { const p = line.split('\t'); const ins = parseInt(p[0], 10), del = parseInt(p[1], 10); return { ins: acc.ins + (Number.isFinite(ins) ? ins : 0), del: acc.del + (Number.isFinite(del) ? del : 0) }; }, { ins: 0, del: 0 });
  T.ok('family total delta is +389/-15', tot.ins === 389 && tot.del === 15, '+' + tot.ins + '/-' + tot.del);
  const polFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- scripts/policies');
  T.ok('family touches no policy file (pol=0)', polFiles === '', polFiles || '(none)');
  T.ok('family does not touch standing.js', git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- src/js/standing.js') === '', '(absent)');
  const farStanding = sha256(gitShow(FAR, 'src/js/standing.js'));
  T.ok('far-end native standing.js sha is 75762cb2...', farStanding.startsWith('75762cb2'), farStanding.slice(0, 12));
  T.ok('fix standing.js sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  const farPolicy = sha256(gitShow(FAR, 'scripts/policies/competent.js'));
  T.ok('far-end policy sha is a7ff5c51...', farPolicy.startsWith('a7ff5c51'), farPolicy.slice(0, 12));
  const mergePolicy = sha256(gitShow(MERGE, 'scripts/policies/competent.js'));
  T.ok('merge policy sha equals the far-end policy sha (no policy drift)', mergePolicy === farPolicy, mergePolicy.slice(0, 12));
  T.ok('test file is ABSENT at the far end (ls-tree empty)',
    git('ls-tree ' + FAR + ' -- ' + ADDED_CLEAN) === '', '(absent)');
  T.ok('test file is ABSENT at the first parent (ls-tree empty)',
    git('ls-tree ' + MERGE_BASE + ' -- ' + ADDED_CLEAN) === '', '(absent)');
  T.ok('test file is PRESENT at the merge (blob a0161cc9...)',
    git('ls-tree ' + MERGE + ' -- ' + ADDED_CLEAN).indexOf(ADDED_BLOB) !== -1, 'blob a0161cc9');
  // The family's new methods exist at the merge, in neither endpoint.
  T.ok('convoHasLiveUnfinished exists at the merge, not at the far end',
    gitShow(MERGE, 'src/js/conversation.js').indexOf('convoHasLiveUnfinished') !== -1 &&
    gitShow(FAR, 'src/js/conversation.js').indexOf('convoHasLiveUnfinished') === -1, 'method present at merge only');
  T.ok('convoUnfinishedEngageLine exists at the merge, not at the far end',
    gitShow(MERGE, 'src/js/conversation.js').indexOf('convoUnfinishedEngageLine') !== -1 &&
    gitShow(FAR, 'src/js/conversation.js').indexOf('convoUnfinishedEngageLine') === -1, 'method present at merge only');

  // ---- 2. Merge-tree prediction ----
  T.section('2. Merge-tree prediction — two conflicted files, four hunks, no DU');
  const mt = mergeTreeConflicts();
  let mtOk = true, mtBad = null;
  for (const f of Object.keys(EXPECTED_MARKERS)) {
    if (mt.found[f] !== EXPECTED_MARKERS[f]) { mtOk = false; mtBad = f + ' (got ' + mt.found[f] + ', want ' + EXPECTED_MARKERS[f] + ')'; break; }
  }
  T.ok('merge-tree reports the same marker counts per changed-in-both file', mtOk, mtBad || '2/2 match');
  T.ok('merge-tree reports exactly TWO changed-in-both files', Object.keys(mt.found).length === 2, 'sections=' + Object.keys(mt.found).length + ': ' + Object.keys(mt.found).join(', '));
  const conflicted = Object.keys(mt.found).filter(function (f) { return mt.found[f] > 0; }).sort();
  T.ok('merge-tree reports exactly TWO content-conflicted files', conflicted.length === 2, 'conflicted=' + conflicted.join(', '));
  T.ok('the conflicted files are conversation.js + convo-dialogue.js',
    JSON.stringify(conflicted) === JSON.stringify(EXPECTED_JS.slice().sort()), conflicted.join(', '));
  T.ok('conversation.js carries exactly 1 conflict hunk (3 markers)', mt.found['src/js/conversation.js'] === 3, 'markers=3');
  T.ok('convo-dialogue.js carries exactly 3 conflict hunks (9 markers)', mt.found['src/js/convo-dialogue.js'] === 9, 'markers=9');
  T.ok('merge-tree reports NO merged sections (nothing merges cleanly in the changed files)',
    Object.keys(mt.merged).length === 0, 'merged=' + Object.keys(mt.merged).join(', ') || '(none)');
  T.ok('merge-tree reports NO delete/modify (DU) entry',
    !/deleted by (us|them)/i.test(mt.raw) && mt.raw.indexOf('removed in local') === -1 && mt.raw.indexOf('removed in remote') === -1, 'no DU');
  T.ok("raw merge-tree output carries the 'added in remote' test-file section (clean addition)",
    mt.raw.indexOf('added in remote') !== -1 && mt.raw.indexOf(ADDED_CLEAN) !== -1 && mt.raw.indexOf(ADDED_BLOB) !== -1, 'added in remote present');
  let sigOk = true, sigBad = null;
  for (const s of HUNK_SIGNATURES) {
    if (mt.raw.indexOf(s) === -1) { sigOk = false; sigBad = s; break; }
  }
  T.ok('raw merge-tree output carries all four hunks\' ours/theirs signature lines', sigOk, sigBad ? 'missing: ' + sigBad : HUNK_SIGNATURES.length + '/' + HUNK_SIGNATURES.length);
  T.ok('merge-tree conflict hunk anchors are the lesson-outcome region (conversation.js @@ -7167)',
    mt.raw.indexOf('@@ -7167,6 +7246,16 @@') !== -1, 'anchor present');
  T.ok('merge-tree conflict hunk anchors include all three convo-dialogue.js hunks',
    mt.raw.indexOf('@@ -448,9 +479,34 @@') !== -1 && mt.raw.indexOf('@@ -497,7 +553,33 @@') !== -1 && mt.raw.indexOf('@@ -505,7 +587,34 @@') !== -1, '3/3 anchors present');

  // ---- 3. Conflict-STOP rule + tooling-only analysis ----
  T.section('3. Conflict-STOP rule — conflicts are src/js game code, NOT tooling-only');
  T.ok('both conflicted files are under src/ (game code, not tooling)',
    conflicted.every(function (f) { return f.indexOf('src/') === 0; }), conflicted.join(', '));
  T.ok('conflictStopVerdict: conversation.js + convo-dialogue.js -> UNMEASURED (no carve-out on this arm)',
    conflictStopVerdict(['src/js/conversation.js', 'src/js/convo-dialogue.js']) === 'UNMEASURED', 'UNMEASURED');
  T.ok('conflictStopVerdict: single src/js conflict ALSO -> UNMEASURED on this arm (narrowed-tooling rule does NOT apply)',
    conflictStopVerdict(['src/js/convo-dialogue.js']) === 'UNMEASURED', conflictStopVerdict(['src/js/convo-dialogue.js']));
  T.ok('conflictStopVerdict: test-file-only conflict ALSO -> UNMEASURED on this arm (full-family attempt)',
    conflictStopVerdict([ADDED_CLEAN]) === 'UNMEASURED', conflictStopVerdict([ADDED_CLEAN]));
  const preregPath = path.join(REPO, 'evidence', '2026-11-13', 'sim-transplant8-prereg.md');
  const prereg = fs.existsSync(preregPath) ? fs.readFileSync(preregPath, 'utf8') : '';
  T.ok('prereg file exists', prereg !== '', preregPath);
  T.ok('prereg records that the conflicts are NOT tooling-only', prereg.indexOf('NOT tooling-only') !== -1, 'tooling-only analysis present');
  T.ok('prereg records that the narrowed-tooling rule does NOT apply', prereg.indexOf('does not apply') !== -1, 'rule note present');
  T.ok('prereg records the predicted outcome UNMEASURED (conflict-STOP)', prereg.indexOf('PREDICTED OUTCOME — UNMEASURED') !== -1, 'predicted outcome present');
  T.ok('prereg records the narrowed-8b route as a coordinator decision, not this arm\'s call',
    prereg.indexOf('narrowed 8b') !== -1 && prereg.indexOf('coordinator decision') !== -1, '8b note present');

  // ---- 4. Verdict mapping ----
  T.section('4. Verdict mapping — transplant thresholds + conflict-STOP rule');
  const table = [[0, 'CARRIER'], [1, 'CARRIER'], [2, 'AMBIGUOUS'], [3, 'NOT-CARRIER'], [4, 'NOT-CARRIER'], [8, 'NOT-CARRIER'], [-1, 'UNCLASSIFIABLE'], [9, 'UNCLASSIFIABLE'], [NaN, 'UNCLASSIFIABLE']];
  for (const pair of table) {
    T.ok('survived ' + pair[0] + ' -> ' + pair[1], classifyTransplant(pair[0]) === pair[1], classifyTransplant(pair[0]));
  }
  T.ok('conflict rule: no conflict -> MEASURABLE', conflictStopVerdict([]) === 'MEASURABLE', conflictStopVerdict([]));
  T.ok('conflict rule: any single conflict -> UNMEASURED', conflictStopVerdict(['src/js/conversation.js']) === 'UNMEASURED', conflictStopVerdict(['src/js/conversation.js']));
  T.ok('conflict rule: non-array input -> UNCLASSIFIABLE', conflictStopVerdict(null) === 'UNCLASSIFIABLE', conflictStopVerdict(null));

  // ---- 5. Base state ----
  T.section('5. Base state — arm branch, clean tree, no swap residue');
  const headBranch = git('rev-parse --abbrev-ref HEAD');
  // Worktree-aware branch identity (0215 coordinator note): the strict
  // arm-branch assertion is true only in the worker tree; on master
  // (merged tip) the arm's evidence + proof files must be present at
  // HEAD instead. Either way the leg stays green after landing.
  T.ok('HEAD is on the arm branch sim-transplant8 (worktree) or master (merged tip)',
    headBranch === 'sim-transplant8' || headBranch === 'master', 'HEAD=' + headBranch);
  if (headBranch === 'master') {
    T.ok('on master: the arm evidence file is present at HEAD (merged tip)',
      git('ls-tree HEAD -- evidence/2026-11-13/sim-transplant8.md') !== '', 'merged');
    T.ok('on master: the arm proof test is present at HEAD (merged tip)',
      git('ls-tree HEAD -- scripts/test-transplant8.js') !== '', 'merged');
    T.ok('on master: the subject branch still points at the far end (left in place)',
      git('rev-parse ' + SUBJECT_BRANCH) === FAR_FULL, 'branch kept');
  }
  if (headBranch === 'sim-transplant8') {
    T.ok('in the worktree: HEAD is on the arm branch sim-transplant8', true, 'HEAD=sim-transplant8');
  }
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

  // ---- 6. Seed-band identity ----
  T.section('6. Seed-band identity');
  const stepSrc = fs.readFileSync(path.join(REPO, 'scripts', 'culpritbisect-step.sh'), 'utf8');
  T.ok('step script names the band 190391..190398',
    stepSrc.indexOf('190391,190392,190393,190394,190395,190396,190397,190398') !== -1, 'band literal present');
  T.ok('prereg names the same band', prereg.indexOf('190391') !== -1 && prereg.indexOf('190398') !== -1, 'band in prereg');
  T.ok('prereg names the STEP id t8-713eb7545', prereg.indexOf('t8-713eb7545') !== -1, 'STEP id present');
  T.ok('prereg names the subject branch transplant-8-subject', prereg.indexOf('transplant-8-subject') !== -1, 'branch name present');

  // ---- 7. Live conflict record ----
  T.section('7. Live conflict record — two UU paths, one clean add, no subject commit');
  let subject = null;
  try { subject = git('rev-parse ' + SUBJECT_BRANCH); } catch (e) { subject = null; }
  T.ok('subject branch exists', subject !== null && subject.length === 40, subject ? subject.slice(0, 12) : '(missing)');
  if (subject) {
    T.ok('subject branch points at the far end (no subject commit)', subject === FAR_FULL, subject.slice(0, 12));
  }
  const evPath = path.join(REPO, 'evidence', '2026-11-13', 'sim-transplant8.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('evidence file exists', ev !== '', evPath);
  T.ok('evidence file records the verdict as UNMEASURED', ev.indexOf('UNMEASURED') !== -1, 'UNMEASURED present');
  T.ok('evidence file records FOUR unmerged paths', ev.indexOf('FOUR unmerged paths') !== -1, 'four paths named');
  T.ok('evidence file records the UU on conversation.js', ev.indexOf('UU `src/js/conversation.js`') !== -1, 'UU conversation.js present');
  T.ok('evidence file records the UU on convo-dialogue.js', ev.indexOf('UU `src/js/convo-dialogue.js`') !== -1, 'UU convo-dialogue.js present');
  T.ok('evidence file records the clean add of the test file', ev.indexOf('A `scripts/test-live-thread-engage-dry-20261108.js`') !== -1, 'clean add present');
  T.ok('evidence file records the conversation.js marker lines (7239, 7249, 7258)',
    ev.indexOf('7239') !== -1 && ev.indexOf('7249') !== -1 && ev.indexOf('7258') !== -1, 'marker lines present');
  T.ok('evidence file records the convo-dialogue.js marker lines (482, 556, 590)',
    ev.indexOf('482') !== -1 && ev.indexOf('556') !== -1 && ev.indexOf('590') !== -1, 'marker lines present');
  T.ok('evidence file records the second hunk marker lines (486, 558, 592)',
    ev.indexOf('486') !== -1 && ev.indexOf('558') !== -1 && ev.indexOf('592') !== -1, 'marker lines present');
  T.ok('evidence file records the third hunk marker lines (509, 582, 617)',
    ev.indexOf('509') !== -1 && ev.indexOf('582') !== -1 && ev.indexOf('617') !== -1, 'marker lines present');
  T.ok('evidence file records that there is NO DU', ev.indexOf('No DU') !== -1, 'no DU recorded');
  T.ok('evidence file records the abort (refresh, abort_rc=0, tree verified clean)',
    ev.indexOf('update-index --refresh') !== -1 && ev.indexOf('cherry-pick') !== -1 && ev.indexOf('abort') !== -1 && ev.indexOf('verified clean') !== -1, 'abort recorded');
  T.ok('evidence file proposes the narrowed 8b route as a coordinator decision, not this arm\'s call',
    ev.indexOf('narrowed 8b') !== -1 && ev.indexOf('coordinator decision') !== -1, '8b note present');
  T.ok('evidence file records that the conflicts are NOT tooling-only',
    ev.indexOf('NOT tooling-only') !== -1, 'tooling-only analysis present');
  T.ok('evidence file names the same-lines-rewritten wall', ev.indexOf('same-lines-rewritten wall') !== -1, 'wall named');
  T.ok('evidence file records the subject branch hash (far end, left in place)',
    ev.indexOf(FAR_FULL) !== -1, 'subject hash present');

  // ---- 8. No corpus ----
  T.section('8. No corpus — no judged sim ran');
  const sumPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  const logPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  const corpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  T.ok('no step summary exists for t8-713eb7545', !fs.existsSync(sumPath), 'absent');
  T.ok('no driver log exists for t8-713eb7545', !fs.existsSync(logPath), 'absent');
  T.ok('no per-seed corpus exists for t8-713eb7545', !fs.existsSync(corpusDir), 'absent');
  T.ok('evidence file records that no telemetry check ran (no corpus)', ev.indexOf('step corpus exists') !== -1 && ev.indexOf('did not run') !== -1 && ev.indexOf('NOT rolled') !== -1, 'telemetry note present');

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
