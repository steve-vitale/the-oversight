#!/usr/bin/env node
// test-transplant8b.js — proof test for the H1 TRANSPLANT, narrowed
// family 8b (arm sim-transplant8b-a).
//
// THE QUESTION (evidence/2026-11-14/sim-transplant8b-prereg.md,
// committed before cutting the subject or running any judged sim):
// land origin family 8's CLEAN-HUNKS SUBSET — narrowed family 8b,
// coordinator-defined (new methods + goon delivery + dlg:more
// pre-check + the family's test file, excluding the four conflicted
// hunks AND the unlisted clean second dlg:more hunk) — onto the far
// end 203a32775 (GOOD 4/8) and measure whether it alone collapses
// it. Verdicts (fresh thresholds): <=1/8 CARRIER, 2/8 AMBIGUOUS
// (re-run once; 2/8 again -> recorded AMBIGUOUS, treated as
// NOT-CARRIER for ordering, kept on the suspect list), >=3/8
// NOT-CARRIER. Baseline leg ep-far-8b on 203a32775 runs FIRST and must
// reproduce 4/8 (per-seed days 86/144/150/43/150/87/150/150),
// or the run stops before any subject step.
//
// PREDICTED OUTCOME — MEASURABLE: the filtered patch (three clean
// hunks + test file) applies cleanly to the far end with ZERO
// conflicts, because each included hunk appears marker-free in the
// full-family merge-tree output. The live `git apply` is the
// authority — ANY conflict fires the conflict-STOP rule
// (UNMEASURED, no hand-resolution, no silent hunk-drop).
//
// WHAT THIS TEST PROVES:
//   1. Family identity — merge 713eb7545, its parents, the 1-commit
//      second-parent side, the exact 2 src/js files (+87/-3
//      conversation.js, +74/-12 convo-dialogue.js), +389/-15 total
//      over 3 files, no policy file, no standing.js, far-end
//      standing 75762cb2, fix f8fda429, far-end policy a7ff5c51,
//      merge policy == far-end policy, test file absent at far end
//      AND first parent, present at the merge (blob a0161cc9),
//      merge NOT an ancestor of the far end, IS an ancestor of
//      master HEAD.
//   2. Narrowed definition — the family diff has EXACTLY 3
//      conversation.js hunks + 5 convo-dialogue.js hunks; the
//      included set is {conv 1163, conv 5995, dlg 273}, the
//      excluded conflicted set is {conv 7017, dlg 444, 495, 510},
//      and the unlisted clean second dlg:more hunk (dlg 293) is
//      documented as excluded by the coordinator's ONLY list.
//   3. Merge-tree prediction (read-only) — the three included
//      hunks + the unlisted clean hunk appear marker-free; ALL
//      markers (3 + 9) sit inside the four excluded hunks; the
//      test file is 'added in remote' (clean addition); NO merged
//      sections, NO delete/modify (DU) entries.
//   4. Conflict-STOP rule + verdict mapping —
//      conflictStopVerdict maps the filtered-patch application:
//      no conflict -> MEASURABLE, ANY conflict -> UNMEASURED (no
//      carve-out, no hunk-drop); classifyTransplant maps every
//      survived count to CARRIER / AMBIGUOUS / NOT-CARRIER /
//      UNCLASSIFIABLE.
//   5. Base state — HEAD is on sim-transplant8b-a in the worktree
//      (or master at the merged tip — branch-identity legs are
//      worktree-aware per the 0215 coordinator note, so the proof
//      stays green on master), no src/js file differs from HEAD,
//      on-disk standing.js is byte-identical to HEAD, and the
//      step-script tooling source (master) still carries all four
//      scratch files.
//   6. Seed-band identity — the step script and the prereg name
//      exactly seeds 190391–190398, the STEP id t8b, the baseline
//      STEP id ep-far, and the subject branch transplant-8b-subject.
//   7. Live subject state — state-aware: before the subject is
//      cut it asserts the subject branch does NOT exist yet
//      (prereg preceded the subject); once it exists it asserts
//      the branch's parent is the far end, the subject diff's
//      added/removed lines are byte-identical to the family's
//      clean hunks, the test-file blob is a0161cc9, the excluded
//      family-only strings are absent, subject policy == far-end
//      policy, subject native standing == far-end standing.
//   8. Step corpora — state-aware: before the steps run it
//      asserts no t8b / ep-far summary, log, or corpus exists;
//      once they exist it asserts the baseline leg reproduced
//      4/8 with the expected per-seed days, the subject summary
//      exists with a survived count, and the evidence file
//      records the matching verdict.
//
// Usage: node scripts/test-transplant8b.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant8b');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const MERGE = '713eb7545';
const MERGE_FULL = '713eb754524458be067c79fbfd3c89ee814dde80';
const MERGE_BASE = '9f388a524';
const SECOND_FULL = '10724c18ddc5a7ebdc376aef3248cd318a9674f7';
const SUBJECT_BRANCH = 'transplant-8b-subject';
const STEP = 't8b';
const BASELINE_STEP = 'ep-far-8b';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const EXPECTED_BASELINE_DAYS = [86, 144, 150, 43, 150, 87, 150, 150];
const EXPECTED_JS = [
  'src/js/conversation.js', 'src/js/convo-dialogue.js',
];
const EXPECTED_FILES = [
  'scripts/test-live-thread-engage-dry-20261108.js',
  'src/js/conversation.js',
  'src/js/convo-dialogue.js',
];
// Family-diff hunk headers (first-parent numbering), per file.
const FAMILY_HUNKS = {
  'src/js/conversation.js': [
    '@@ -1163,6 +1163,55 @@',
    '@@ -5995,9 +6044,38 @@',
    '@@ -7017,7 +7095,13 @@',
  ],
  'src/js/convo-dialogue.js': [
    '@@ -273,15 +273,30 @@',
    '@@ -293,11 +308,27 @@',
    '@@ -444,6 +475,10 @@',
    '@@ -495,10 +530,25 @@',
    '@@ -510,18 +560,30 @@',
  ],
};
// Included hunks (family-diff headers) — the coordinator-defined 8b.
const INCLUDED_HUNKS = {
  'src/js/conversation.js': ['@@ -1163,6 +1163,55 @@', '@@ -5995,9 +6044,38 @@'],
  'src/js/convo-dialogue.js': ['@@ -273,15 +273,30 @@'],
};
// Excluded conflicted hunks (family-diff headers).
const EXCLUDED_CONFLICT_HUNKS = {
  'src/js/conversation.js': ['@@ -7017,7 +7095,13 @@'],
  'src/js/convo-dialogue.js': ['@@ -444,6 +475,10 @@', '@@ -495,10 +530,25 @@', '@@ -510,18 +560,30 @@'],
};
// The unlisted clean hunk: merges without markers but NOT in the
// coordinator's ONLY list, so excluded from 8b by definition.
const UNLISTED_CLEAN_HUNK = '@@ -293,11 +308,27 @@';
// Merge-tree (far-end/result numbering) anchors for the included hunks.
const MT_INCLUDED = ['@@ -1163,6 +1163,55 @@', '@@ -6069,9 +6118,38 @@', '@@ -288,15 +288,30 @@'];
const MT_UNLISTED_CLEAN = '@@ -308,11 +323,27 @@';
// Merge-tree conflict anchors (the four excluded hunks).
const MT_CONFLICT = ['@@ -7167,6 +7246,16 @@', '@@ -448,9 +479,34 @@', '@@ -497,7 +553,33 @@', '@@ -505,7 +587,34 @@'];
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
// Family-only strings that must be ABSENT from the 8b subject (they
// live only in the excluded hunks): plant-teach outcome id,
// the favor-settlement liveUnfinished definition, the Help
// structural pre-check, the liveUnfinished favor-block condition.
const EXCLUDED_STRINGS = [
  { file: 'src/js/conversation.js', s: 'plantTeachOutcome' },
  { file: 'src/js/convo-dialogue.js', s: 'const liveUnfinished' },
  { file: 'src/js/convo-dialogue.js', s: 'if (helpStructural && typeof this.convoWouldBlock' },
  { file: 'src/js/convo-dialogue.js', s: 'if (liveUnfinished ||' },
];
// Included-hunk strings that must be PRESENT in the 8b subject.
const INCLUDED_STRINGS = [
  { file: 'src/js/conversation.js', s: 'convoHasLiveUnfinished' },
  { file: 'src/js/conversation.js', s: 'convoUnfinishedEngageLine' },
  { file: 'src/js/conversation.js', s: 'goonExempt' },
  { file: 'src/js/conversation.js', s: 'LIVE UNFINISHED (dialog audit #4' },
  { file: 'src/js/convo-dialogue.js', s: 'LIVE UNFINISHED (dialog audit #4' },
];

function sha256(text) { return crypto.createHash('sha256').update(text).digest('hex'); }
function git(args) {
  return execSync('git ' + args, { cwd: REPO, stdio: 'pipe' }).toString().trim();
}
function gitShow(commit, file) {
  return execSync('git show ' + commit + ':' + file, { cwd: REPO, stdio: 'pipe' }).toString();
}
function isAncestor(a, b) {
  try { execSync('git merge-base --is-ancestor ' + a + ' ' + b, { cwd: REPO, stdio: 'pipe' }); return true; }
  catch (e) { return false; }
}
function classifyTransplant(n) {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 8) return 'UNCLASSIFIABLE';
  if (n <= 1) return 'CARRIER';
  if (n === 2) return 'AMBIGUOUS';
  return 'NOT-CARRIER';
}
// conflictStopVerdict(files): the binding STOP rule FOR THIS ARM —
// the patch is pre-filtered to the three clean hunks + test file, so
// ANY conflict on application is beyond the four excluded hunks:
// STOP, UNMEASURED, no hand-resolution, no silent hunk-drop.
function conflictStopVerdict(files) {
  if (!Array.isArray(files)) return 'UNCLASSIFIABLE';
  if (files.length === 0) return 'MEASURABLE';
  return 'UNMEASURED';
}
// familyHunks(file): the @@ headers of `git diff MERGE^1 MERGE -- file`.
function familyHunks(file) {
  const out = execSync('git diff ' + MERGE + '^1 ' + MERGE + ' -- ' + file,
    { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  return out.split('\n').filter(function (ln) { return ln.indexOf('@@ -') === 0; });
}
// hunkLines(diffText, headers): added/removed content lines (+/-,
// excluding +++ / --- headers) of the hunks whose header is in
// `headers`. Returns { added: [...], removed: [...] } sorted.
function hunkLines(diffText, headers) {
  const added = [], removed = [];
  const lines = diffText.split('\n');
  let cur = null;
  for (const ln of lines) {
    if (ln.indexOf('@@ -') === 0) { cur = headers.indexOf(ln) !== -1 ? ln : null; continue; }
    if (cur === null) continue;
    if (ln.indexOf('+') === 0 && ln.indexOf('+++') !== 0) added.push(ln.slice(1));
    else if (ln.indexOf('-') === 0 && ln.indexOf('---') !== 0) removed.push(ln.slice(1));
  }
  added.sort(); removed.sort();
  return { added: added, removed: removed };
}
// mergeTreeConflicts(): run `git merge-tree <base> <ours> <theirs>`
// (read-only dry run — touches no worktree) and return { found:
// { file: markers } for each 'changed in both' section, merged:
// { file: true } for each 'merged' section, raw: the raw output }.
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
// markersBetween(raw, start, end): conflict-marker lines in the raw
// merge-tree output strictly between the first occurrence of `start`
// and the first occurrence of `end` after it (end null = to EOF).
// The @@ -7167 anchor is a context line INSIDE the @@ -7158 conflict
// block, so slices must be taken on the outer hunk anchors only.
function markersBetween(raw, start, end) {
  const i = raw.indexOf(start);
  if (i === -1) return -1;
  const j = end === null ? raw.length : raw.indexOf(end, i + start.length);
  if (j === -1) return -1;
  const slice = raw.slice(i, j);
  let n = 0;
  for (const ln of slice.split('\n')) {
    if (ln.indexOf('+<<<<<<<') === 0 || ln.indexOf('+>>>>>>>') === 0 || ln.indexOf('+=======') === 0) n++;
  }
  return n;
}
function countOccurrences(raw, s) {
  let n = 0, i = 0;
  for (;;) { const j = raw.indexOf(s, i); if (j === -1) return n; n++; i = j + s.length; }
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
  T.ok('convoHasLiveUnfinished exists at the merge, not at the far end',
    gitShow(MERGE, 'src/js/conversation.js').indexOf('convoHasLiveUnfinished') !== -1 &&
    gitShow(FAR, 'src/js/conversation.js').indexOf('convoHasLiveUnfinished') === -1, 'method present at merge only');
  T.ok('convoUnfinishedEngageLine exists at the merge, not at the far end',
    gitShow(MERGE, 'src/js/conversation.js').indexOf('convoUnfinishedEngageLine') !== -1 &&
    gitShow(FAR, 'src/js/conversation.js').indexOf('convoUnfinishedEngageLine') === -1, 'method present at merge only');
  T.ok('merge 713eb7545 is NOT an ancestor of the far end (family is origin-side)',
    !isAncestor(MERGE, FAR), 'not ancestor');
  T.ok('merge 713eb7545 IS an ancestor of master HEAD (origin line merged to master)',
    isAncestor(MERGE, 'HEAD'), 'ancestor of HEAD');

  // ---- 2. Narrowed definition ----
  T.section('2. Narrowed definition — hunk inventory, included vs excluded');
  for (const f of Object.keys(FAMILY_HUNKS)) {
    const got = familyHunks(f);
    T.ok(f + ' has exactly the expected family hunks (' + FAMILY_HUNKS[f].length + ')',
      JSON.stringify(got) === JSON.stringify(FAMILY_HUNKS[f]), got.join(' | '));
  }
  for (const f of Object.keys(INCLUDED_HUNKS)) {
    for (const h of INCLUDED_HUNKS[f]) {
      T.ok('included hunk present in family diff: ' + f + ' ' + h,
        FAMILY_HUNKS[f].indexOf(h) !== -1, h);
    }
  }
  for (const f of Object.keys(EXCLUDED_CONFLICT_HUNKS)) {
    for (const h of EXCLUDED_CONFLICT_HUNKS[f]) {
      T.ok('excluded conflict hunk present in family diff: ' + f + ' ' + h,
        FAMILY_HUNKS[f].indexOf(h) !== -1, h);
    }
  }
  T.ok('unlisted clean hunk present in family diff: convo-dialogue.js ' + UNLISTED_CLEAN_HUNK,
    FAMILY_HUNKS['src/js/convo-dialogue.js'].indexOf(UNLISTED_CLEAN_HUNK) !== -1, UNLISTED_CLEAN_HUNK);
  T.ok('included + excluded-conflict + unlisted-clean partition the family hunks exactly',
    (function () {
      for (const f of Object.keys(FAMILY_HUNKS)) {
        const parts = INCLUDED_HUNKS[f].concat(EXCLUDED_CONFLICT_HUNKS[f]);
        if (f === 'src/js/convo-dialogue.js') parts.push(UNLISTED_CLEAN_HUNK);
        if (JSON.stringify(parts.slice().sort()) !== JSON.stringify(FAMILY_HUNKS[f].slice().sort())) return false;
      }
      return true;
    })(), '3 + 4 + 1 = 8 hunks across 2 files');
  const preregPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant8b-prereg.md');
  const prereg = fs.existsSync(preregPath) ? fs.readFileSync(preregPath, 'utf8') : '';
  T.ok('8b prereg file exists', prereg !== '', preregPath);
  T.ok('prereg names the three included hunks (merge-tree numbering)',
    prereg.indexOf('@@ -1163,6 +1163,55 @@') !== -1 && prereg.indexOf('@@ -6069,9 +6118,38 @@') !== -1 && prereg.indexOf('@@ -288,15 +288,30 @@') !== -1, '3/3 anchors present');
  T.ok('prereg names the four excluded conflict hunks',
    prereg.indexOf('@@ -7167,6 +7246,16 @@') !== -1 && prereg.indexOf('@@ -448,9 +479,34 @@') !== -1 && prereg.indexOf('@@ -497,7 +553,33 @@') !== -1 && prereg.indexOf('@@ -505,7 +587,34 @@') !== -1, '4/4 anchors present');
  T.ok('prereg documents the unlisted clean second dlg:more hunk as excluded by the ONLY list',
    prereg.indexOf('@@ -293,11 +308,27 @@') !== -1 && prereg.indexOf('EXCLUDED BUT CLEAN') !== -1 && prereg.indexOf('ONLY') !== -1, 'unlisted-clean note present');
  T.ok('prereg states the test file is included (blob a0161cc9)',
    prereg.indexOf('test-live-thread-engage-dry-20261108.js') !== -1 && prereg.indexOf('a0161cc9') !== -1, 'test file named');
  T.ok('prereg records the predicted outcome MEASURABLE (clean apply)',
    prereg.indexOf('PREDICTED OUTCOME — MEASURABLE') !== -1, 'predicted outcome present');
  T.ok('prereg records the conflict-STOP rule (any conflict -> UNMEASURED, no hand-resolve)',
    prereg.indexOf('Conflict-STOP rule') !== -1 && prereg.indexOf('UNMEASURED') !== -1 && prereg.indexOf('do NOT hand-resolve') !== -1, 'STOP rule present');

  // ---- 3. Merge-tree prediction ----
  T.section('3. Merge-tree prediction — included hunks marker-free, all markers in excluded hunks');
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
  for (const a of MT_INCLUDED) {
    T.ok('merge-tree output carries the included clean hunk anchor ' + a,
      countOccurrences(mt.raw, a) === 1, 'present once');
  }
  T.ok('merge-tree output carries the unlisted clean hunk anchor ' + MT_UNLISTED_CLEAN,
    countOccurrences(mt.raw, MT_UNLISTED_CLEAN) === 1, 'present once');
  for (const a of MT_CONFLICT) {
    T.ok('merge-tree output carries the conflict anchor ' + a,
      mt.raw.indexOf(a) !== -1, 'present');
  }
  T.ok('included hunk @@ -1163 (new methods) carries ZERO markers',
    markersBetween(mt.raw, '@@ -1163,6 +1163,55 @@', '@@ -6069,9 +6118,38 @@') === 0, 'markers=0');
  T.ok('included hunk @@ -6069 (goon) carries ZERO markers',
    markersBetween(mt.raw, '@@ -6069,9 +6118,38 @@', '@@ -7158,6 +7236,7 @@') === 0, 'markers=0');
  T.ok('included hunk @@ -288 (dlg:more pre-check) carries ZERO markers',
    markersBetween(mt.raw, '@@ -288,15 +288,30 @@', '@@ -308,11 +323,27 @@') === 0, 'markers=0');
  T.ok('unlisted clean hunk @@ -308 carries ZERO markers',
    markersBetween(mt.raw, '@@ -308,11 +323,27 @@', '@@ -448,9 +479,34 @@') === 0, 'markers=0');
  T.ok('excluded hunk @@ -7158/7167 (lesson-outcome) carries exactly 3 markers',
    markersBetween(mt.raw, '@@ -7158,6 +7236,7 @@', 'changed in both') === 3, 'markers=3');
  T.ok('excluded hunk A @@ -448 (favor settlement) carries exactly 3 markers',
    markersBetween(mt.raw, '@@ -448,9 +479,34 @@', '@@ -497,7 +553,33 @@') === 3, 'markers=3');
  T.ok('excluded hunk B @@ -497 (favor-line sayLine) carries exactly 3 markers',
    markersBetween(mt.raw, '@@ -497,7 +553,33 @@', '@@ -505,7 +587,34 @@') === 3, 'markers=3');
  T.ok('excluded hunk C @@ -505 (blocked-repeat) carries exactly 3 markers',
    markersBetween(mt.raw, '@@ -505,7 +587,34 @@', null) === 3, 'markers=3');

  // ---- 4. Conflict-STOP rule + verdict mapping ----
  T.section('4. Conflict-STOP rule + verdict mapping');
  T.ok('both conflicted files are under src/ (game code, not tooling)',
    conflicted.every(function (f) { return f.indexOf('src/') === 0; }), conflicted.join(', '));
  T.ok('conflictStopVerdict: no conflict -> MEASURABLE', conflictStopVerdict([]) === 'MEASURABLE', conflictStopVerdict([]));
  T.ok('conflictStopVerdict: any single conflict -> UNMEASURED (no hunk-drop, no hand-resolve)',
    conflictStopVerdict(['src/js/conversation.js']) === 'UNMEASURED', conflictStopVerdict(['src/js/conversation.js']));
  T.ok('conflictStopVerdict: non-array input -> UNCLASSIFIABLE', conflictStopVerdict(null) === 'UNCLASSIFIABLE', conflictStopVerdict(null));
  const table = [[0, 'CARRIER'], [1, 'CARRIER'], [2, 'AMBIGUOUS'], [3, 'NOT-CARRIER'], [4, 'NOT-CARRIER'], [8, 'NOT-CARRIER'], [-1, 'UNCLASSIFIABLE'], [9, 'UNCLASSIFIABLE'], [NaN, 'UNCLASSIFIABLE']];
  for (const pair of table) {
    T.ok('survived ' + pair[0] + ' -> ' + pair[1], classifyTransplant(pair[0]) === pair[1], classifyTransplant(pair[0]));
  }

  // ---- 5. Base state ----
  T.section('5. Base state — arm branch, clean tree, no swap residue');
  const headBranch = git('rev-parse --abbrev-ref HEAD');
  // Worktree-aware branch identity (0215 coordinator note): the strict
  // arm-branch assertion is true only in the worker tree; on master
  // (merged tip) the arm's evidence + proof files must be present at
  // HEAD instead. Either way the leg stays green after landing.
  T.ok('HEAD is on the arm branch sim-transplant8b-a (worktree) or master (merged tip)',
    headBranch === 'sim-transplant8b-a' || headBranch === 'master', 'HEAD=' + headBranch);
  if (headBranch === 'master') {
    T.ok('on master: the arm evidence file is present at HEAD (merged tip)',
      git('ls-tree HEAD -- evidence/2026-11-14/sim-transplant8b.md') !== '', 'merged');
    T.ok('on master: the arm proof test is present at HEAD (merged tip)',
      git('ls-tree HEAD -- scripts/test-transplant8b.js') !== '', 'merged');
    T.ok('on master: the subject branch still points at its subject commit (left in place)',
      (function () { try { return git('rev-parse ' + SUBJECT_BRANCH).length === 40; } catch (e) { return false; } })(), 'branch kept');
  }
  if (headBranch === 'sim-transplant8b-a') {
    T.ok('in the worktree: HEAD is on the arm branch sim-transplant8b-a', true, 'HEAD=sim-transplant8b-a');
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
  const scratchPresent = ['scripts/culpritbisect-driver-20261113.js', 'scripts/culpritbisect-analyze-20261113.js', 'scripts/masterregress-analyze-20261113.js', 'scripts/vetfirst-instrument-20261111.js']
    .filter(function (f) { return git('ls-files -- ' + f) !== ''; });
  T.ok('the four step-script tooling files are tracked at HEAD (landed on master, not scratch residue)',
    scratchPresent.length === 4, scratchPresent.length + '/4 tracked');

  // ---- 6. Seed-band identity ----
  T.section('6. Seed-band identity');
  const stepSrc = fs.readFileSync(path.join(REPO, 'scripts', 'culpritbisect-step.sh'), 'utf8');
  T.ok('step script names the band 190391..190398',
    stepSrc.indexOf('190391,190392,190393,190394,190395,190396,190397,190398') !== -1, 'band literal present');
  T.ok('prereg names the same band', prereg.indexOf('190391') !== -1 && prereg.indexOf('190398') !== -1, 'band in prereg');
  T.ok('prereg names the STEP id t8b', prereg.indexOf('t8b') !== -1, 'STEP id present');
  T.ok('prereg names the baseline STEP id ep-far-8b', prereg.indexOf('ep-far-8b') !== -1, 'baseline STEP id present');
  T.ok('prereg names the subject branch transplant-8b-subject', prereg.indexOf('transplant-8b-subject') !== -1, 'branch name present');
  T.ok('prereg names the expected baseline per-seed days 86/144/150/43/150/87/150/150',
    prereg.indexOf('86/144/150/43/150/87/150/150') !== -1, 'baseline days present');

  // ---- 7. Live subject state (state-aware) ----
  T.section('7. Live subject state — transplant-8b-subject');
  let subject = null;
  try { subject = git('rev-parse ' + SUBJECT_BRANCH); } catch (e) { subject = null; }
  if (!subject) {
    T.ok('subject branch does NOT exist yet (prereg preceded the subject)', true, '(not cut)');
    T.ok('no subject commit exists yet', true, '(not cut)');
  } else {
    T.ok('subject branch exists', subject.length === 40, subject.slice(0, 12));
    const subjectParent = git('rev-parse ' + SUBJECT_BRANCH + '^1');
    T.ok('subject branch parent is the far end (cut at the far end, one subject commit)',
      subjectParent === FAR_FULL, subjectParent.slice(0, 12));
    const subjectFiles = git('diff --name-only ' + FAR + ' ' + SUBJECT_BRANCH).split('\n').sort();
    T.ok('subject diff touches exactly the 3 expected files',
      JSON.stringify(subjectFiles) === JSON.stringify(EXPECTED_FILES.slice().sort()), subjectFiles.join(', '));
    // Byte-identical clean hunks: the subject diff's added/removed
    // content lines (modulo hunk-header line numbers) must equal the
    // family diff's included-hunk added/removed lines exactly.
    let linesOk = true, linesBad = null;
    for (const f of Object.keys(INCLUDED_HUNKS)) {
      const famDiff = execSync('git diff ' + MERGE + '^1 ' + MERGE + ' -- ' + f,
        { cwd: REPO, stdio: 'pipe' }).toString('utf8');
      const subDiff = execSync('git diff ' + FAR + ' ' + SUBJECT_BRANCH + ' -- ' + f,
        { cwd: REPO, stdio: 'pipe' }).toString('utf8');
      const fam = hunkLines(famDiff, INCLUDED_HUNKS[f]);
      // All hunks in the subject diff for this file (the subject diff
      // for a file contains ONLY the included hunks, by construction).
      const subHeaders = subDiff.split('\n').filter(function (ln) { return ln.indexOf('@@ -') === 0; });
      const subAll = hunkLines(subDiff, subHeaders);
      if (JSON.stringify(fam.added) !== JSON.stringify(subAll.added) ||
          JSON.stringify(fam.removed) !== JSON.stringify(subAll.removed)) {
        linesOk = false;
        linesBad = f + ' (fam +' + fam.added.length + '/-' + fam.removed.length +
          ' vs subject +' + subAll.added.length + '/-' + subAll.removed.length + ')';
        break;
      }
    }
    T.ok('subject src/js added/removed lines are byte-identical to the family clean hunks', linesOk, linesBad || 'match');
    T.ok('subject test file blob is a0161cc9 (family blob)',
      git('ls-tree ' + SUBJECT_BRANCH + ' -- ' + ADDED_CLEAN).indexOf(ADDED_BLOB) !== -1, 'blob a0161cc9');
    let incOk = true, incBad = null;
    for (const e of INCLUDED_STRINGS) {
      if (gitShow(SUBJECT_BRANCH, e.file).indexOf(e.s) === -1) { incOk = false; incBad = e.file + ': ' + e.s; break; }
    }
    T.ok('subject carries all included-hunk strings (new methods, goon, dlg:more)', incOk, incBad || INCLUDED_STRINGS.length + '/' + INCLUDED_STRINGS.length);
    let excOk = true, excBad = null;
    for (const e of EXCLUDED_STRINGS) {
      if (gitShow(SUBJECT_BRANCH, e.file).indexOf(e.s) !== -1) { excOk = false; excBad = e.file + ': ' + e.s; break; }
    }
    T.ok('subject carries NONE of the excluded family-only strings', excOk, excBad ? 'present: ' + excBad : '0/' + EXCLUDED_STRINGS.length);
    const subPolicy = sha256(gitShow(SUBJECT_BRANCH, 'scripts/policies/competent.js'));
    T.ok('subject policy sha equals the far-end policy sha (no policy drift)', subPolicy === farPolicy, subPolicy.slice(0, 12));
    const subStanding = sha256(gitShow(SUBJECT_BRANCH, 'src/js/standing.js'));
    T.ok('subject native standing.js sha equals the far-end standing sha', subStanding === farStanding, subStanding.slice(0, 12));
    const evPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant8b.md');
    const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
    T.ok('evidence file records the subject commit hash', ev !== '' && ev.indexOf(subject) !== -1, 'subject hash present');
  }

  // ---- 8. Step corpora (state-aware) ----
  T.section('8. Step corpora — settled baseline + this run\'s legs');
  // The bisect arm's settled ep-far corpus is committed on master:
  // it is the prior-run baseline record, NOT this run's leg. This
  // run re-verifies it with the fresh id ep-far-8b (see prereg).
  const settledBasePath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-ep-far-summary.json');
  T.ok('settled ep-far baseline corpus exists on master (prior run)',
    fs.existsSync(settledBasePath), 'present');
  const settledBase = JSON.parse(fs.readFileSync(settledBasePath, 'utf8'));
  T.ok('settled ep-far baseline reads 4/8 survived', settledBase.survived === 4, 'survived=' + settledBase.survived);
  const settledDays = (settledBase.perSeed || []).map(function (p) { return p.days; });
  T.ok('settled ep-far baseline per-seed days are 86/144/150/43/150/87/150/150',
    JSON.stringify(settledDays) === JSON.stringify(EXPECTED_BASELINE_DAYS), JSON.stringify(settledDays));
  const baseSumPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + BASELINE_STEP + '-summary.json');
  const baseLogPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + BASELINE_STEP + '-driver.log');
  const baseCorpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + BASELINE_STEP);
  const sumPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  const logPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  const corpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  const evPath8 = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant8b.md');
  const ev8 = fs.existsSync(evPath8) ? fs.readFileSync(evPath8, 'utf8') : '';
  if (!fs.existsSync(baseSumPath) && !fs.existsSync(sumPath)) {
    T.ok('no fresh baseline summary exists yet for ep-far-8b (no judged sim ran)', true, '(not run)');
    T.ok('no fresh baseline driver log exists yet', !fs.existsSync(baseLogPath), 'absent');
    T.ok('no fresh baseline per-seed corpus exists yet', !fs.existsSync(baseCorpusDir), 'absent');
    T.ok('no subject step summary exists yet', true, '(not run)');
    T.ok('no subject driver log exists yet', !fs.existsSync(logPath), 'absent');
    T.ok('no subject per-seed corpus exists yet', !fs.existsSync(corpusDir), 'absent');
  } else {
    T.ok('fresh baseline step summary exists (ep-far-8b)', fs.existsSync(baseSumPath), 'present');
    const base = JSON.parse(fs.readFileSync(baseSumPath, 'utf8'));
    T.ok('fresh baseline leg reproduced the far end at 4/8 survived', base.survived === 4, 'survived=' + base.survived);
    const baseDays = (base.perSeed || []).map(function (p) { return p.days; });
    T.ok('fresh baseline leg per-seed days match the masterregress far leg (86/144/150/43/150/87/150/150)',
      JSON.stringify(baseDays) === JSON.stringify(EXPECTED_BASELINE_DAYS), JSON.stringify(baseDays));
    T.ok('fresh baseline driver log exists', fs.existsSync(baseLogPath), 'present');
    T.ok('fresh baseline per-seed corpus exists', fs.existsSync(baseCorpusDir), 'present');
    T.ok('subject step summary exists', fs.existsSync(sumPath), 'present');
    const sub = JSON.parse(fs.readFileSync(sumPath, 'utf8'));
    T.ok('subject summary carries a survived count 0..8', typeof sub.survived === 'number' && sub.survived >= 0 && sub.survived <= 8, 'survived=' + sub.survived);
    const verdict = classifyTransplant(sub.survived);
    T.ok('subject summary verdict maps from the survived count (' + verdict + ')',
      verdict === 'CARRIER' || verdict === 'AMBIGUOUS' || verdict === 'NOT-CARRIER', verdict);
    T.ok('subject driver log exists', fs.existsSync(logPath), 'present');
    T.ok('subject per-seed corpus exists', fs.existsSync(corpusDir), 'present');
    T.ok('evidence file exists and records the subject verdict ' + verdict,
      ev8 !== '' && ev8.indexOf(verdict) !== -1, verdict + ' present');
    T.ok('evidence file records the subject survived count',
      ev8.indexOf('survived ' + sub.survived + '/8') !== -1, 'survived ' + sub.survived + '/8 present');
    T.ok('evidence file records the baseline leg reproduction (4/8)',
      ev8.indexOf('4/8') !== -1, 'baseline 4/8 present');
  }

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
