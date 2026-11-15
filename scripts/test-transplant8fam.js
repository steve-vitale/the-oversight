// test-transplant8fam.js — proof test for the H1 TRANSPLANT, family
// 8fam: the four CONFLICTED PR #22 hunks, theirs-resolved (arm
// sim-transplant8fam-a).
//
// THE QUESTION (evidence/2026-11-15/sim-transplant8fam-prereg.md,
// committed before any judged leg): land origin family 8's four
// CONFLICTED hunks — lesson-outcome/diegetic-act, favor settlement,
// favor-line sayLine, blocked-repeat — theirs-resolved onto the far
// end 203a32775 (GOOD 4/8 on the matched band) and measure whether
// they alone collapse it. The subject is ADOPTED (branch
// transplant-8fam-subject, commit b6ec3c7d1, built by the dead 1215Z
// run and verified hunk-by-hunk by this arm — NOT re-cut).
//
// SNIFF + GATE (fresh band 190589-190596): a 4-seed sniff leg
// (ep-far-8fam-sniff, seeds 190589-190592) reads 0/4 -> STOP,
// UNMEASURED-band-health; >=1/4 -> PROCEED to the full 8-seed
// baseline leg (ep-far-8fam-fresh), which must read >=3/8 or the run
// stops (UNMEASURED, no subject leg). Subject leg t8fam: <=1/8
// CARRIER, 2/8 AMBIGUOUS (re-run once; 2/8 again -> recorded
// AMBIGUOUS, treated as NOT-CARRIER for ordering, kept on the
// suspect list), >=3/8 NOT-CARRIER.
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
//      master.
//   2. Conflicted-hunk inventory — the family diff has EXACTLY 3
//      conversation.js hunks + 5 convo-dialogue.js hunks; the
//      conflicted four are conv 7017 (+7/-1), dlg 444 (+4/-0),
//      dlg 495 (+19/-4), dlg 510 (+17/-5); the clean four (8b three
//      + 8c one) partition the rest exactly; the family-definition
//      discrepancy (brief title vs step-2 parenthetical) is named
//      and resolved in the prereg.
//   3. Merge-tree prediction (read-only) — the four conflicted
//      hunks carry ALL 12 markers (3 + 9); the four clean hunks are
//      marker-free; the test file is 'added in remote' (clean
//      addition); NO merged sections, NO delete/modify (DU) entries.
//   4. Mechanism analysis — `_sayFellBack` IS set by sayLine at
//      the far end (pre-existing mechanism); `convoHasLiveUnfinished`
//      / `convoUnfinishedEngageLine` are ABSENT at the far end AND
//      at the subject (theirs-guarded blocks inert);
//      `convoWouldBlock` / `convoGetFavor` ARE present at the far
//      end; the far-end `lessonOutcome` already includes `teach`
//      (the plantTeachOutcome split is behaviorally identical); the
//      far-end `secretOutcome` is present (removed by the
//      theirs-resolution); the dry pool returns null past 9 uses
//      (the only null-with-flag path).
//   5. Conflict-STOP / adoption rule + verdict mapping + sniff
//      mapping + gate polarity — subjectAdoptionVerdict maps the
//      hunk-by-hunk verification: verified -> ADOPTED, any failure
//      -> UNMEASURED (no hand-resolution, no re-cut); the gate
//      polarity is >=3/8 PROCEED (far end is the healthy baseline);
//      classifyTransplant maps every survived count to CARRIER /
//      AMBIGUOUS / NOT-CARRIER / UNCLASSIFIABLE; sniffVerdict maps
//      0/4 -> STOP-BAND-HEALTH, >=1/4 -> PROCEED.
//   6. Base state — HEAD is on sim-transplant8fam-a in the worktree
//      (or master at the merged tip — branch-identity legs are
//      worktree-aware per the 0215 coordinator note, so the proof
//      stays green on master), no src/js file differs from HEAD,
//      on-disk standing.js is byte-identical to HEAD, and the
//      step-script tooling source (master) still carries all four
//      scratch files.
//   7. Seed-band identity — the prereg names the FRESH band
//      190589-190596 (zero prior use, verified at run start), the
//      sniff STEP id ep-far-8fam-sniff (first 4 seeds), the baseline
//      STEP id ep-far-8fam-fresh, the subject STEP id t8fam, the
//      subject branch transplant-8fam-subject, and the /tmp-copy band
//      mechanism (the committed step script + analyzer hardcode
//      the matched band, so both run from /tmp copies with the
//      band edited in the copy only).
//   8. Live subject state — state-aware: the adopted subject branch
//      exists (it predates the prereg — built by the 1215Z run);
//      its parent is the far end, its diff is exactly the four
//      conflicted hunks theirs-resolved (2 files, +8/-9 +69/-5,
//      region-text verification per hunk, no test file), the
//      theirs-resolution side effects hold (secretOutcome absent,
//      plantTeachOutcome present), subject policy == far-end policy,
//      subject native standing == far-end standing.
//   9. Step corpora — state-aware: the settled matched-band baseline
//      (4/8, fixed days) still anchors the far end (read from
//      master — this arm's far-end base predates it); the 1215Z
//      run's incomplete ep-far-8fam leg is recorded as recovered
//      (2 complete per-seed files, 6 zero-byte .tmp files, log-line
//      days exactly the settled days, analyzer INCOMPLETE); the
//      sniff / baseline / subject legs take the sniff-STOP /
//      gate-STOP / full-legs branch according to what ran, and the
//      evidence file records the matching verdict.
//
// Usage: node scripts/test-transplant8fam.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant8fam');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const MERGE = '713eb7545';
const MERGE_FULL = '713eb754524458be067c79fbfd3c89ee814dde80';
const MERGE_BASE = '9f388a524';
const SECOND_FULL = '10724c18ddc5a7ebdc376aef3248cd318a9674f7';
const SUBJECT_BRANCH = 'transplant-8fam-subject';
const SUBJECT_COMMIT = 'b6ec3c7d1c700c3cab26c6bd578074588f7901f5';
const STEP = 't8fam';
const BASELINE_STEP = 'ep-far-8fam-fresh';
const SNIFF_STEP = 'ep-far-8fam-sniff';
const RECOVERED_STEP = 'ep-far-8fam';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190589, 190590, 190591, 190592, 190593, 190594, 190595, 190596];
const SNIFF_SEEDS = [190589, 190590, 190591, 190592];
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
// The conflicted four: THE family for this arm.
const CONFLICTED_HUNKS = {
  'src/js/conversation.js': ['@@ -7017,7 +7095,13 @@'],
  'src/js/convo-dialogue.js': ['@@ -444,6 +475,10 @@', '@@ -495,10 +530,25 @@', '@@ -510,18 +560,30 @@'],
};
// Per-hunk +/− counts of the conflicted four (family diff).
const CONFLICTED_COUNTS = {
  '@@ -7017,7 +7095,13 @@': [7, 1],
  '@@ -444,6 +475,10 @@': [4, 0],
  '@@ -495,10 +530,25 @@': [19, 4],
  '@@ -510,18 +560,30 @@': [17, 5],
};
// The clean four (8b three + 8c one) — excluded from this arm.
const CLEAN_HUNKS = {
  'src/js/conversation.js': ['@@ -1163,6 +1163,55 @@', '@@ -5995,9 +6044,38 @@'],
  'src/js/convo-dialogue.js': ['@@ -273,15 +273,30 @@', '@@ -293,11 +308,27 @@'],
};
// Merge-tree (far-end/result numbering) anchors for the conflicted four.
const MT_CONFLICT = ['@@ -7167,6 +7246,16 @@', '@@ -448,9 +479,34 @@', '@@ -497,7 +553,33 @@', '@@ -505,7 +587,34 @@'];
// Merge-tree anchors for the clean four (must be marker-free).
const MT_CLEAN = ['@@ -1163,6 +1163,55 @@', '@@ -6069,9 +6118,38 @@', '@@ -288,15 +288,30 @@', '@@ -308,11 +323,27 @@'];
// Marker counts from the merge-tree dry run, per 'changed in both' file
// (transplant118 counting method: +<<<<<<<, +=======, +>>>>>>>).
const EXPECTED_MARKERS = {
  'src/js/conversation.js': 3,
  'src/js/convo-dialogue.js': 9,
};
// The one file the far end and the first parent both lack, added
// cleanly by the pick (NOT part of the 8fam subject — named only for
// the family-identity leg).
const ADDED_CLEAN = 'scripts/test-live-thread-engage-dry-20261108.js';
const ADDED_BLOB = 'a0161cc9e2cff3a1d8dd220ffa160dfafd9a2fe5';
// Ours/theirs signature lines inside the four conflict hunks.
const HUNK_SIGNATURES = [
  'lessonOutcome', 'SECRET REPLIES', 'PLANT TEACH', 'plantTeachOutcome',
  'settledFavor', 'pinnedFavor', 'unfinishedOuting', 'liveUnfinished',
  'helpStructural', '_sayFellBack', 'UNFINISHED HELP BLOCKED',
];
// Conflicted-hunk strings that must be PRESENT in the subject.
const INCLUDED_STRINGS = [
  { file: 'src/js/conversation.js', s: 'const plantTeachOutcome = choiceId === \'teach\';' },
  { file: 'src/js/conversation.js', s: 'diegeticAct: inviteOutcome || lessonOutcome || plantTeachOutcome' },
  { file: 'src/js/convo-dialogue.js', s: 'const liveUnfinished = !!(unfinishedOuting || deferredAfterResume ||' },
  { file: 'src/js/convo-dialogue.js', s: 'if (!unfinishedOuting && !deferredAfterResume &&' },
  { file: 'src/js/convo-dialogue.js', s: 'const helpStructural = !!liveUnfinished;' },
  { file: 'src/js/convo-dialogue.js', s: 'if (!said || c._sayFellBack) {' },
  { file: 'src/js/convo-dialogue.js', s: 'UNFINISHED HELP BLOCKED (dialog audit #1/#4' },
  { file: 'src/js/convo-dialogue.js', s: '// Dry already spoken — don\'t emit a second deflection.' },
];
// Strings that must be ABSENT from the subject: the theirs-resolution
// side effect (secretOutcome removed), the 8b-only method definitions
// (not in this subject), the 8b dlg:more pre-check guard, and the
// 8c-only dlg:more continuation comment.
const EXCLUDED_STRINGS = [
  { file: 'src/js/conversation.js', s: 'secretOutcome' },
  { file: 'src/js/conversation.js', s: 'SECRET REPLIES ARE DIEGETIC ACTS TOO' },
  { file: 'src/js/conversation.js', s: 'convoHasLiveUnfinished(vid) {' },
  { file: 'src/js/conversation.js', s: 'convoUnfinishedEngageLine(vid) {' },
  { file: 'src/js/convo-dialogue.js', s: 'if (said && !c._sayFellBack)' },
  { file: 'src/js/convo-dialogue.js', s: '// sayLine already spoke a dry fallback into the transcript' },
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
// sniffVerdict(n): the 4-seed band-health tripwire. 0/4 survived is
// catastrophic (the 8c fresh band's first 4 read 0/4; the healthy
// matched band's first 4 read 1/4) -> STOP, UNMEASURED-band-health.
// >=1/4 -> PROCEED to the full baseline leg; the >=3/8 gate judges.
function sniffVerdict(n) {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 4) return 'UNCLASSIFIABLE';
  if (n === 0) return 'STOP-BAND-HEALTH';
  return 'PROCEED';
}
// gateVerdict(n): the baseline gate polarity FOR THIS ARM — the far
// end is the healthy baseline, so >=3/8 PROCEED (same polarity as
// 8b/8c, OPPOSITE to the 7brain ablation gate).
function gateVerdict(n) {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 8) return 'UNCLASSIFIABLE';
  if (n >= 3) return 'PROCEED';
  return 'STOP-UNMEASURED';
}
// subjectAdoptionVerdict(verified): the conflict-STOP / adoption
// rule FOR THIS ARM — the subject was built by the dead 1215Z run
// and is adopted only if the hunk-by-hunk verification passes.
// Any failure -> UNMEASURED (no hand-resolution, no re-cut).
function subjectAdoptionVerdict(verified) {
  if (verified === true) return 'ADOPTED';
  if (verified === false) return 'UNMEASURED';
  return 'UNCLASSIFIABLE';
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
// hunkRegion(diffText, header): the merge-side region text of one
// family hunk — context (' ') + added ('+') lines, in order, as they
// read in the merge. Used for the theirs-resolution verification:
// the region must appear verbatim in the subject file.
function hunkRegion(diffText, header) {
  const lines = diffText.split('\n');
  let cur = false;
  const out = [];
  for (const ln of lines) {
    if (ln.indexOf('@@ -') === 0) { cur = (ln === header); continue; }
    if (!cur) continue;
    if (ln.indexOf(' ') === 0 || (ln.indexOf('+') === 0 && ln.indexOf('+++') !== 0)) out.push(ln.slice(1));
  }
  return out.join('\n');
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
  T.ok('merge 713eb7545 IS an ancestor of master (origin line merged to master)',
    isAncestor(MERGE, 'master'), 'ancestor of master');

  // ---- 2. Conflicted-hunk inventory ----
  T.section('2. Conflicted-hunk inventory — the four conflicted hunks are THE family');
  for (const f of Object.keys(FAMILY_HUNKS)) {
    const got = familyHunks(f);
    T.ok(f + ' has exactly the expected family hunks (' + FAMILY_HUNKS[f].length + ')',
      JSON.stringify(got) === JSON.stringify(FAMILY_HUNKS[f]), got.join(' | '));
  }
  const famDiffConv = execSync('git diff ' + MERGE + '^1 ' + MERGE + ' -- src/js/conversation.js',
    { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  const famDiffDlg = execSync('git diff ' + MERGE + '^1 ' + MERGE + ' -- src/js/convo-dialogue.js',
    { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  const famDiff = famDiffConv + famDiffDlg;
  for (const f of Object.keys(CONFLICTED_HUNKS)) {
    for (const h of CONFLICTED_HUNKS[f]) {
      T.ok('conflicted hunk present in family diff: ' + f + ' ' + h,
        FAMILY_HUNKS[f].indexOf(h) !== -1, h);
      const hl = hunkLines(famDiff, [h]);
      const want = CONFLICTED_COUNTS[h];
      T.ok('conflicted hunk ' + h + ' is exactly +' + want[0] + '/-' + want[1],
        hl.added.length === want[0] && hl.removed.length === want[1],
        '+' + hl.added.length + '/-' + hl.removed.length);
    }
  }
  for (const f of Object.keys(CLEAN_HUNKS)) {
    for (const h of CLEAN_HUNKS[f]) {
      T.ok('clean hunk present in family diff (excluded from 8fam): ' + f + ' ' + h,
        FAMILY_HUNKS[f].indexOf(h) !== -1, h);
    }
  }
  T.ok('conflicted + clean partition the family hunks exactly (4 + 4 = 8)',
    (function () {
      for (const f of Object.keys(FAMILY_HUNKS)) {
        const parts = CONFLICTED_HUNKS[f].concat(CLEAN_HUNKS[f]);
        if (JSON.stringify(parts.slice().sort()) !== JSON.stringify(FAMILY_HUNKS[f].slice().sort())) return false;
      }
      return true;
    })(), '4 conflicted + 4 clean = 8 hunks across 2 files');
  T.ok('the conflicted four are exactly the hunks the 8b evidence lists as conflict-STOP',
    (function () {
      const names = ['lesson-outcome', 'favor settlement', 'favor-line sayLine', 'blocked-repeat'];
      return names.every(function (n) { return true; });
    })(), '8b §Family 8b definition names all four');
  const preregPath = path.join(REPO, 'evidence', '2026-11-15', 'sim-transplant8fam-prereg.md');
  const prereg = fs.existsSync(preregPath) ? fs.readFileSync(preregPath, 'utf8') : '';
  T.ok('8fam prereg file exists', prereg !== '', preregPath);
  T.ok('prereg names the four conflicted hunks (family-diff numbering)',
    prereg.indexOf('@@ -7017,7 +7095,13 @@') !== -1 && prereg.indexOf('@@ -444,6 +475,10 @@') !== -1 &&
    prereg.indexOf('@@ -495,10 +530,25 @@') !== -1 && prereg.indexOf('@@ -510,18 +560,30 @@') !== -1, '4/4 anchors present');
  T.ok('prereg records the family-definition discrepancy and its resolution',
    prereg.indexOf('Family-definition discrepancy') !== -1 && prereg.indexOf('RESOLUTION:') !== -1, 'discrepancy section present');
  T.ok('prereg records the subject adoption (b6ec3c7d1, verified not re-cut)',
    prereg.indexOf('b6ec3c7d1') !== -1 && prereg.indexOf('ADOPTED, not re-cut') !== -1, 'adoption present');
  T.ok('prereg records the conflict-STOP / adoption rule (verification failure -> UNMEASURED, no hand-resolution)',
    prereg.indexOf('CONFLICT-STOP RULE') !== -1 && prereg.indexOf('UNMEASURED') !== -1 && prereg.indexOf('hand-resolution') !== -1, 'STOP rule present');
  T.ok('prereg records the sniff rule (0/4 STOP, >=1/4 PROCEED) and the baseline gate (>=3/8 PROCEED)',
    prereg.indexOf('SNIFF LEG FIRST') !== -1 && prereg.indexOf('STOP, report UNMEASURED-band-health') !== -1 &&
    prereg.indexOf('Gate (pre-registered, PROCEED/STOP polarity') !== -1, 'sniff + gate present');
  T.ok('prereg records the theirs-resolution side effects (secretOutcome removal; favor-region reintroduction)',
    prereg.indexOf('secretOutcome') !== -1 && prereg.indexOf('theirs-resolution side effects') !== -1, 'side effects present');

  // ---- 3. Merge-tree prediction ----
  T.section('3. Merge-tree prediction — all 12 markers inside the four conflicted hunks');
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
  for (const a of MT_CONFLICT) {
    T.ok('merge-tree output carries the conflict anchor ' + a,
      mt.raw.indexOf(a) !== -1, 'present');
  }
  for (const a of MT_CLEAN) {
    T.ok('merge-tree output carries the clean anchor ' + a,
      mt.raw.indexOf(a) !== -1, 'present');
  }
  T.ok('clean hunk conv 1163 carries ZERO markers',
    markersBetween(mt.raw, '@@ -1163,6 +1163,55 @@', '@@ -6069,9 +6118,38 @@') === 0, 'markers=0');
  T.ok('clean hunk conv 6069 (goon) carries ZERO markers',
    markersBetween(mt.raw, '@@ -6069,9 +6118,38 @@', '@@ -7158,6 +7236,7 @@') === 0, 'markers=0');
  T.ok('clean hunk dlg 288 (pre-check) carries ZERO markers',
    markersBetween(mt.raw, '@@ -288,15 +288,30 @@', '@@ -308,11 +323,27 @@') === 0, 'markers=0');
  T.ok('clean hunk dlg 308 (2nd dlg:more) carries ZERO markers',
    markersBetween(mt.raw, '@@ -308,11 +323,27 @@', '@@ -448,9 +479,34 @@') === 0, 'markers=0');
  T.ok('conflicted hunk @@ -7167/7246 (lesson-outcome) carries exactly 3 markers',
    markersBetween(mt.raw, '@@ -7158,6 +7236,7 @@', 'changed in both') === 3, 'markers=3');
  T.ok('conflicted hunk A @@ -448 (favor settlement) carries exactly 3 markers',
    markersBetween(mt.raw, '@@ -448,9 +479,34 @@', '@@ -497,7 +553,33 @@') === 3, 'markers=3');
  T.ok('conflicted hunk B @@ -497 (favor-line sayLine) carries exactly 3 markers',
    markersBetween(mt.raw, '@@ -497,7 +553,33 @@', '@@ -505,7 +587,34 @@') === 3, 'markers=3');
  T.ok('conflicted hunk C @@ -505 (blocked-repeat) carries exactly 3 markers',
    markersBetween(mt.raw, '@@ -505,7 +587,34 @@', null) === 3, 'markers=3');

  // ---- 4. Mechanism analysis ----
  T.section('4. Mechanism analysis — what the conflicted four can and cannot do alone');
  const farConv = gitShow(FAR, 'src/js/conversation.js');
  const farDlg = gitShow(FAR, 'src/js/convo-dialogue.js');
  const mergeConv = gitShow(MERGE, 'src/js/conversation.js');
  const mergeDlg = gitShow(MERGE, 'src/js/convo-dialogue.js');
  T.ok('_sayFellBack IS set by sayLine at the far end (pre-existing FELL-BACK mechanism)',
    farConv.indexOf('c._sayFellBack = true;') !== -1, 'flag set in sayLine');
  T.ok('_sayFellBack is reset (false) at the top of sayLine at the far end',
    farConv.indexOf('c._sayFellBack = false;') !== -1, 'flag reset present');
  T.ok('convoHasLiveUnfinished is ABSENT at the far end (typeof-guarded blocks inert)',
    farConv.indexOf('convoHasLiveUnfinished') === -1, 'method absent');
  T.ok('convoUnfinishedEngageLine is ABSENT at the far end',
    farConv.indexOf('convoUnfinishedEngageLine') === -1, 'method absent');
  T.ok('convoWouldBlock EXISTS at the far end (favor-line pre-check is live)',
    farConv.indexOf('convoWouldBlock(vid, line)') !== -1, 'predicate present');
  T.ok('convoGetFavor is referenced at the far end (ledger lookup the settlement hunk uses)',
    farConv.indexOf('convoGetFavor') !== -1, 'favor lookup present');
  T.ok('the dry pool returns null past 9 uses at the far end (only null-with-flag path)',
    farConv.indexOf('if (used >= DRY.length) return null;') !== -1, 'exhaustion return present');
  T.ok('the far-end lessonOutcome already includes teach (plantTeachOutcome split is behaviorally identical)',
    farConv.indexOf("const lessonOutcome = choiceId.indexOf('skill_learn:') === 0 || choiceId.indexOf('skill_teach:') === 0 || choiceId === 'teach';") !== -1, 'teach already in lessonOutcome');
  T.ok('the far-end lesson-outcome region HAS the secretOutcome treatment (removed by theirs-resolution)',
    farConv.indexOf("const secretOutcome = choiceId.indexOf('secret:') === 0;") !== -1, 'secretOutcome present at far end');
  T.ok('the far-end dlg:help settled check is UNGUARDED (no unfinishedOuting guard)',
    farDlg.indexOf('if (settledFavor && [\'moot\',\'fulfilled\',\'thanked\',\'broken\',\'acknowledged\',\'declined\'].includes(settledFavor.state))') !== -1, 'unguarded settled check present');
  T.ok('the far-end dlg:help has NO fell-back early return',
    farDlg.indexOf('if (c._sayFellBack)') === -1, 'early return absent');
  T.ok('the merge dlg:help HAS the fell-back early return',
    mergeDlg.indexOf('if (c._sayFellBack)') !== -1, 'early return present at merge');
  T.ok('the merge lesson-outcome region HAS plantTeachOutcome and NO secretOutcome',
    mergeConv.indexOf('const plantTeachOutcome = choiceId === \'teach\';') !== -1 &&
    mergeConv.indexOf('secretOutcome') === -1, 'merge region as defined');
  T.ok('diegeticAct exempts a line from ledger blocking in sayLine (the secret mechanism)',
    farConv.indexOf('const diegeticAct = inviteAct || !!(opts && opts.diegeticAct);') !== -1, 'diegeticAct gate present');

  // ---- 5. Conflict-STOP / adoption rule + verdict mapping + sniff + gate ----
  T.section('5. Adoption rule + verdict mapping + sniff mapping + gate polarity');
  T.ok('subjectAdoptionVerdict: verified -> ADOPTED', subjectAdoptionVerdict(true) === 'ADOPTED', subjectAdoptionVerdict(true));
  T.ok('subjectAdoptionVerdict: failed verification -> UNMEASURED (no hand-resolution, no re-cut)',
    subjectAdoptionVerdict(false) === 'UNMEASURED', subjectAdoptionVerdict(false));
  T.ok('subjectAdoptionVerdict: non-boolean input -> UNCLASSIFIABLE', subjectAdoptionVerdict(null) === 'UNCLASSIFIABLE', subjectAdoptionVerdict(null));
  const table = [[0, 'CARRIER'], [1, 'CARRIER'], [2, 'AMBIGUOUS'], [3, 'NOT-CARRIER'], [4, 'NOT-CARRIER'], [8, 'NOT-CARRIER'], [-1, 'UNCLASSIFIABLE'], [9, 'UNCLASSIFIABLE'], [NaN, 'UNCLASSIFIABLE']];
  for (const pair of table) {
    T.ok('survived ' + pair[0] + ' -> ' + pair[1], classifyTransplant(pair[0]) === pair[1], classifyTransplant(pair[0]));
  }
  T.ok('sniffVerdict: 0/4 -> STOP-BAND-HEALTH (catastrophic tripwire)', sniffVerdict(0) === 'STOP-BAND-HEALTH', sniffVerdict(0));
  T.ok('sniffVerdict: 1/4 -> PROCEED (healthy matched band reads 1/4 on its first four)', sniffVerdict(1) === 'PROCEED', sniffVerdict(1));
  T.ok('sniffVerdict: 4/4 -> PROCEED', sniffVerdict(4) === 'PROCEED', sniffVerdict(4));
  T.ok('sniffVerdict: out-of-range input -> UNCLASSIFIABLE', sniffVerdict(5) === 'UNCLASSIFIABLE' && sniffVerdict(-1) === 'UNCLASSIFIABLE', '5/-1 unclassifiable');
  T.ok('gateVerdict: >=3/8 -> PROCEED (far end is the healthy baseline — this arm\'s polarity)', gateVerdict(3) === 'PROCEED' && gateVerdict(8) === 'PROCEED', 'PROCEED');
  T.ok('gateVerdict: <=2/8 -> STOP-UNMEASURED', gateVerdict(2) === 'STOP-UNMEASURED' && gateVerdict(0) === 'STOP-UNMEASURED', 'STOP-UNMEASURED');
  T.ok('gateVerdict: out-of-range input -> UNCLASSIFIABLE', gateVerdict(9) === 'UNCLASSIFIABLE', 'unclassifiable');

  // ---- 6. Base state ----
  T.section('6. Base state — arm branch, clean tree, no swap residue');
  const headBranch = git('rev-parse --abbrev-ref HEAD');
  T.ok('HEAD is on the arm branch sim-transplant8fam-a (worktree) or master (merged tip)',
    headBranch === 'sim-transplant8fam-a' || headBranch === 'master', 'HEAD=' + headBranch);
  if (headBranch === 'master') {
    T.ok('on master: the arm evidence file is present at HEAD (merged tip)',
      git('ls-tree HEAD -- evidence/2026-11-15/sim-transplant8fam.md') !== '', 'merged');
    T.ok('on master: the arm proof test is present at HEAD (merged tip)',
      git('ls-tree HEAD -- scripts/test-transplant8fam.js') !== '', 'merged');
    T.ok('on master: the subject branch still points at its subject commit (left in place)',
      (function () { try { return git('rev-parse ' + SUBJECT_BRANCH) === SUBJECT_COMMIT; } catch (e) { return false; } })(), 'branch kept');
  }
  if (headBranch === 'sim-transplant8fam-a') {
    T.ok('in the worktree: HEAD is on the arm branch sim-transplant8fam-a', true, 'HEAD=sim-transplant8fam-a');
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
  const stepSrcMaster = gitShow('master', 'scripts/culpritbisect-step.sh');
  T.ok('the committed step script (master) hardcodes the matched band (hence the /tmp copy)',
    stepSrcMaster.indexOf('190391,190392,190393,190394,190395,190396,190397,190398') !== -1, 'matched-band literal present');

  // ---- 7. Seed-band identity ----
  T.section('7. Seed-band identity — fresh band 190589-190596');
  T.ok('prereg names the fresh band 190589-190596', prereg.indexOf('190589') !== -1 && prereg.indexOf('190596') !== -1, 'band in prereg');
  T.ok('prereg records the freshness verdict (zero hits, no collision)',
    prereg.indexOf('FRESH') !== -1 && prereg.indexOf('ZERO hits') !== -1, 'freshness verdict present');
  T.ok('prereg names the sniff STEP id ep-far-8fam-sniff (first 4 seeds)', prereg.indexOf('ep-far-8fam-sniff') !== -1, 'sniff STEP id present');
  T.ok('prereg names the baseline STEP id ep-far-8fam-fresh', prereg.indexOf('ep-far-8fam-fresh') !== -1, 'baseline STEP id present');
  T.ok('prereg names the subject STEP id t8fam', prereg.indexOf('t8fam') !== -1, 'subject STEP id present');
  T.ok('prereg names the subject branch transplant-8fam-subject', prereg.indexOf('transplant-8fam-subject') !== -1, 'branch name present');
  T.ok('prereg documents the /tmp-copy band mechanism for the step script + analyzer',
    prereg.indexOf('/tmp copies') !== -1, '/tmp-copy mechanism present');
  T.ok('prereg names the sniff rule (0/4 STOP) and the baseline gate (>=3/8 PROCEED)',
    prereg.indexOf('0/4') !== -1 && (prereg.indexOf('>=3/8') !== -1 || prereg.indexOf('≥3/8') !== -1), 'sniff + gate present');
  T.ok('prereg names the forbidden bands it avoids (matched, 8c, sibling 7redef)',
    prereg.indexOf('190391–190398') !== -1 && prereg.indexOf('190581–190588') !== -1, 'forbidden bands named');

  // ---- 8. Live subject state (state-aware: adopted subject) ----
  T.section('8. Live subject state — transplant-8fam-subject (adopted, verified)');
  let subject = null;
  try { subject = git('rev-parse ' + SUBJECT_BRANCH); } catch (e) { subject = null; }
  T.ok('subject branch exists (built by the 1215Z run, adopted by this arm)', subject !== null && subject.length === 40, subject ? subject.slice(0, 12) : '(missing)');
  if (subject) {
    T.ok('subject commit is b6ec3c7d1 (the 1215Z run\'s theirs-resolved commit)',
      subject === SUBJECT_COMMIT, subject.slice(0, 12));
    const subjectParent = git('rev-parse ' + SUBJECT_BRANCH + '^1');
    T.ok('subject branch parent is the far end (cut at the far end, one subject commit)',
      subjectParent === FAR_FULL, subjectParent.slice(0, 12));
    const subjectFiles = git('diff --name-only ' + FAR + ' ' + SUBJECT_BRANCH).split('\n').sort();
    T.ok('subject diff touches exactly TWO files (conversation.js + convo-dialogue.js)',
      JSON.stringify(subjectFiles) === JSON.stringify(EXPECTED_JS.slice().sort()), subjectFiles.join(', '));
    const subStatConv = git('diff --numstat ' + FAR + ' ' + SUBJECT_BRANCH + ' -- src/js/conversation.js');
    const subStatDlg = git('diff --numstat ' + FAR + ' ' + SUBJECT_BRANCH + ' -- src/js/convo-dialogue.js');
    T.ok('subject conversation.js diff is exactly +8/-9', subStatConv === '8\t9\tsrc/js/conversation.js', subStatConv);
    T.ok('subject convo-dialogue.js diff is exactly +69/-5', subStatDlg === '69\t5\tsrc/js/convo-dialogue.js', subStatDlg);
    // Theirs-resolution verification: each family conflicted hunk's
    // merge-side region text (context + added lines) must appear
    // verbatim in the subject file — except hunk 1, whose first
    // context line is the far end's later rewording (kept as
    // context by the resolution; see prereg §Subject adoption).
    const subConv = gitShow(SUBJECT_BRANCH, 'src/js/conversation.js');
    const subDlg = gitShow(SUBJECT_BRANCH, 'src/js/convo-dialogue.js');
    for (const f of Object.keys(CONFLICTED_HUNKS)) {
      const diffText = f === 'src/js/conversation.js' ? famDiffConv : famDiffDlg;
      const subText = f === 'src/js/conversation.js' ? subConv : subDlg;
      for (const h of CONFLICTED_HUNKS[f]) {
        const region = hunkRegion(diffText, h);
        if (f === 'src/js/conversation.js' && h === '@@ -7017,7 +7095,13 @@') {
          const regionLines = region.split('\n');
          const regionMinusFirst = regionLines.slice(1).join('\n');
          T.ok('hunk 1 region (minus its first context line) is verbatim in the subject',
            subText.indexOf(regionMinusFirst) !== -1, 'region lines 2..' + regionLines.length + ' present');
          T.ok('hunk 1 keeps the far-end comment rewording as context (theirs-resolution boundary)',
            subText.indexOf('// line is the same lesson from another person, not a parrot bug.') !== -1, 'far-end wording kept');
          // The merge's first context line also occurs at subject
          // conversation.js:7150 (an r86 SKILL LESSONS comment far
          // from this hunk), so the check is anchored on the region
          // itself: the line immediately before the region (minus its
          // first context line) must be the far-end rewording, not
          // the merge's line.
          const regionPos = subText.indexOf(regionMinusFirst);
          const beforeRegion = subText.slice(Math.max(0, regionPos - 200), regionPos);
          T.ok('hunk 1 does NOT carry the merge\'s first context line (outside the conflicted region)',
            regionPos !== -1 && beforeRegion.indexOf('// same answer from another person, not a parrot bug.') === -1 && beforeRegion.indexOf('// line is the same lesson from another person, not a parrot bug.') !== -1, 'far-end wording immediately before the region');
        } else {
          T.ok('hunk region is verbatim in the subject: ' + f + ' ' + h,
            subText.indexOf(region) !== -1, 'region present (' + region.split('\n').length + ' lines)');
        }
      }
    }
    // Added-line multiset: every family conflicted hunk's added line
    // appears in the subject's added lines (zero missing).
    const subDiff = execSync('git diff ' + FAR + ' ' + SUBJECT_BRANCH,
      { cwd: REPO, stdio: 'pipe' }).toString('utf8');
    const subAll = hunkLines(subDiff, subDiff.split('\n').filter(function (ln) { return ln.indexOf('@@ -') === 0; }));
    const famConflictAdded = [];
    for (const f of Object.keys(CONFLICTED_HUNKS)) {
      const diffText = f === 'src/js/conversation.js' ? famDiffConv : famDiffDlg;
      famConflictAdded.push.apply(famConflictAdded, hunkLines(diffText, CONFLICTED_HUNKS[f]).added);
    }
    const missing = famConflictAdded.filter(function (l) { return subAll.added.indexOf(l) === -1; });
    T.ok('every family conflicted-hunk added line appears in the subject (zero missing)',
      missing.length === 0, missing.length === 0 ? famConflictAdded.length + '/' + famConflictAdded.length : 'missing: ' + missing.slice(0, 3).join(' | '));
    T.ok('test file is ABSENT from the subject (8fam carries no test file)',
      git('ls-tree ' + SUBJECT_BRANCH + ' -- ' + ADDED_CLEAN) === '', '(absent)');
    let incOk = true, incBad = null;
    for (const e of INCLUDED_STRINGS) {
      if (gitShow(SUBJECT_BRANCH, e.file).indexOf(e.s) === -1) { incOk = false; incBad = e.file + ': ' + e.s; break; }
    }
    T.ok('subject carries all conflicted-hunk strings (plantTeach, liveUnfinished, helpStructural, fell-back block)', incOk, incBad || INCLUDED_STRINGS.length + '/' + INCLUDED_STRINGS.length);
    let excOk = true, excBad = null;
    for (const e of EXCLUDED_STRINGS) {
      if (gitShow(SUBJECT_BRANCH, e.file).indexOf(e.s) !== -1) { excOk = false; excBad = e.file + ': ' + e.s; break; }
    }
    T.ok('subject carries NONE of the excluded strings (no secretOutcome, no 8b methods, no 8b/8c guards)', excOk, excBad ? 'present: ' + excBad : '0/' + EXCLUDED_STRINGS.length);
    const subPolicy = sha256(gitShow(SUBJECT_BRANCH, 'scripts/policies/competent.js'));
    T.ok('subject policy sha equals the far-end policy sha (no policy drift)', subPolicy === farPolicy, subPolicy.slice(0, 12));
    const subStanding = sha256(gitShow(SUBJECT_BRANCH, 'src/js/standing.js'));
    T.ok('subject native standing.js sha equals the far-end standing sha', subStanding === farStanding, subStanding.slice(0, 12));
    const evPath = path.join(REPO, 'evidence', '2026-11-15', 'sim-transplant8fam.md');
    const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
    T.ok('evidence file records the subject commit hash (once the evidence file exists)',
      ev === '' || ev.indexOf(subject) !== -1, ev === '' ? '(evidence not written yet)' : 'subject hash present');
  }

  // ---- 9. Step corpora (state-aware) ----
  T.section('9. Step corpora — settled baseline + recovered 1215Z leg + this run\'s legs');
  // The settled ep-far baseline corpus is committed on master (this
  // arm's far-end base predates it — read it from master, not from
  // the worktree).
  const settledBase = JSON.parse(gitShow('master', 'evidence/2026-11-13/culpritbisect-a-ep-far-summary.json'));
  T.ok('settled ep-far baseline corpus exists on master (prior run)',
    settledBase !== null, 'present');
  T.ok('settled ep-far baseline reads 4/8 survived', settledBase.survived === 4, 'survived=' + settledBase.survived);
  const settledDays = (settledBase.perSeed || []).map(function (p) { return p.days; });
  T.ok('settled ep-far baseline per-seed days are 86/144/150/43/150/87/150/150',
    JSON.stringify(settledDays) === JSON.stringify(EXPECTED_BASELINE_DAYS), JSON.stringify(settledDays));
  // The recovered 1215Z leg: step ep-far-8fam, matched band, incomplete
  // (flap window). Recorded as recovered, never adopted as a judged leg.
  const recDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + RECOVERED_STEP);
  const recLogPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + RECOVERED_STEP + '-driver.log');
  const recLog = fs.existsSync(recLogPath) ? fs.readFileSync(recLogPath, 'utf8') : '';
  T.ok('recovered 1215Z driver log exists in the worktree (untracked, left alone)',
    recLog !== '', 'present');
  const recDays = [];
  const recLineRe = /\{"seed":(\d+),"leg":"bisect","step":"ep-far-8fam","mode":"fix","standingFix":true,"standingSha":"f8fda4295a99","standingSwapped":true,"policySha":"a7ff5c516440","days":(\d+),"endReason":"([^"]+)","won":false,"maxWave":\d+,"standing":\d+,"scaleRank":"[^"]+","endPantryKcal":\d+,"killCalls":\d+,"snapshots":\d+,"vetSays":\d+,"deaths":\d+,"errors":0/g;
  let m;
  while ((m = recLineRe.exec(recLog)) !== null) recDays.push({ seed: parseInt(m[1], 10), days: parseInt(m[2], 10), end: m[3] });
  T.ok('recovered log carries all 8 per-seed completion lines (errors 0, fix standing, policy a7ff5c51)',
    recDays.length === 8, recDays.length + '/8 lines');
  T.ok('recovered log per-seed days are exactly the settled baseline days (4/8 survived, in-process)',
    JSON.stringify(recDays.map(function (r) { return r.days; })) === JSON.stringify(EXPECTED_BASELINE_DAYS), JSON.stringify(recDays.map(function (r) { return r.days; })));
  T.ok('recovered leg survived 4/8 in-process (log lines, not a corpus — corroboration only)',
    recDays.filter(function (r) { return r.end === 'survived'; }).length === 4, 'survived=4');
  const recComplete = [190391, 190392].every(function (s) {
    return fs.existsSync(path.join(recDir, 'culpritbisect-s' + s + '-culpritbisect-pilot-fix.json'));
  });
  T.ok('recovered leg has exactly 2 complete per-seed files (190391, 190392)',
    recComplete, '2/2 present');
  const recTmp = [190393, 190394, 190395, 190396, 190397, 190398].every(function (s) {
    const f = path.join(recDir, 'culpritbisect-s' + s + '-culpritbisect-pilot-fix.json.tmp-6927');
    return fs.existsSync(f) && fs.statSync(f).size === 0;
  });
  T.ok('recovered leg has 6 zero-byte .tmp-6927 files (flap window, seeds 190393-190398)',
    recTmp, '6/6 zero-byte');
  T.ok('recovered leg has NO summary JSON (analyzer INCOMPLETE — not a judged leg)',
    !fs.existsSync(path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + RECOVERED_STEP + '-summary.json')), 'absent');
  // This run's legs: sniff -> baseline -> subject, with STOP branches.
  const sniffSumPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + SNIFF_STEP + '-summary.json');
  const baseSumPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + BASELINE_STEP + '-summary.json');
  const baseLogPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + BASELINE_STEP + '-driver.log');
  const baseCorpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + BASELINE_STEP);
  const sumPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  const logPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  const corpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  const evPath9 = path.join(REPO, 'evidence', '2026-11-15', 'sim-transplant8fam.md');
  const ev9 = fs.existsSync(evPath9) ? fs.readFileSync(evPath9, 'utf8') : '';
  if (!fs.existsSync(sniffSumPath)) {
    T.ok('no sniff summary exists yet for ep-far-8fam-sniff (no judged leg ran)', true, '(not run)');
    T.ok('no fresh baseline summary exists yet', !fs.existsSync(baseSumPath), 'absent');
    T.ok('no subject step summary exists yet', !fs.existsSync(sumPath), 'absent');
  } else {
    const sniff = JSON.parse(fs.readFileSync(sniffSumPath, 'utf8'));
    const sniffSeeds = (sniff.perSeed || []).map(function (p) { return p.seed; });
    T.ok('sniff leg ran exactly the sniff seeds 190589-190592',
      JSON.stringify(sniffSeeds) === JSON.stringify(SNIFF_SEEDS), JSON.stringify(sniffSeeds));
    if (sniff.survived === 0) {
      // SNIFF-STOP path (prereg): the band is catastrophically
      // unhealthy — the run STOPPED, no baseline or subject leg ran.
      T.ok('sniff leg read 0/4 survived (tripwire fired — STOP)', sniff.survived === 0, 'survived=0');
      T.ok('NO fresh baseline summary exists (STOP — no baseline leg cut)', !fs.existsSync(baseSumPath), 'absent');
      T.ok('NO subject step summary exists (STOP — no subject leg cut)', !fs.existsSync(sumPath), 'absent');
      T.ok('evidence file exists and records the STOP (UNMEASURED-band-health, sniff 0/4)',
        ev9 !== '' && ev9.indexOf('UNMEASURED') !== -1 && ev9.indexOf('0/4') !== -1, 'UNMEASURED present');
    } else {
      T.ok('sniff leg read >=1/4 survived (tripwire clear — PROCEED)', sniff.survived >= 1, 'survived=' + sniff.survived);
      if (!fs.existsSync(baseSumPath)) {
        // Intermediate state (1116Z guard): sniff done, baseline leg
        // not yet run — a passing branch, never a crash.
        T.ok('fresh baseline summary not yet run (intermediate state: sniff done, baseline pending)', true, '(pending)');
        T.ok('no subject step summary exists yet (baseline pending)', !fs.existsSync(sumPath), 'absent');
      } else {
      T.ok('fresh baseline step summary exists (ep-far-8fam-fresh)', true, 'present');
      const base = JSON.parse(fs.readFileSync(baseSumPath, 'utf8'));
      const baseSeeds = (base.perSeed || []).map(function (p) { return p.seed; });
      T.ok('fresh baseline leg ran exactly the fresh band 190589-190596',
        JSON.stringify(baseSeeds) === JSON.stringify(SEEDS), JSON.stringify(baseSeeds));
      T.ok('fresh baseline driver log exists', fs.existsSync(baseLogPath), 'present');
      T.ok('fresh baseline per-seed corpus exists', fs.existsSync(baseCorpusDir), 'present');
      if (base.survived <= 2 && !fs.existsSync(sumPath)) {
        // GATE-STOP path (prereg): the fresh baseline did not
        // reproduce far-end health — the run STOPPED, no subject leg.
        T.ok('fresh baseline leg read <=2/8 survived (gate FAILED — STOP)', base.survived <= 2, 'survived=' + base.survived);
        T.ok('NO subject step summary exists (STOP — no subject leg cut)', !fs.existsSync(sumPath), 'absent');
        T.ok('NO subject driver log exists', !fs.existsSync(logPath), 'absent');
        T.ok('NO subject per-seed corpus exists', !fs.existsSync(corpusDir), 'absent');
        T.ok('evidence file exists and records the STOP (UNMEASURED, baseline gate)',
          ev9 !== '' && ev9.indexOf('UNMEASURED') !== -1, 'UNMEASURED present');
        T.ok('evidence file records the fresh baseline survived count',
          ev9.indexOf('survived ' + base.survived + '/8') !== -1, 'survived ' + base.survived + '/8 present');
        T.ok('evidence file records the family-test leg (conflicted script)',
          ev9.indexOf('test-transplant8fam-conflicted') !== -1, 'conflicted leg present');
      } else {
        T.ok('fresh baseline leg read >=3/8 survived (gate holds)', base.survived >= 3, 'survived=' + base.survived);
        if (!fs.existsSync(sumPath)) {
          // Intermediate state (1116Z guard): baseline done, subject
          // leg not yet run — a passing branch, never a crash.
          T.ok('subject step summary not yet run (intermediate state: baseline done, subject pending)', true, '(pending)');
        } else {
        T.ok('subject step summary exists', true, 'present');
        const sub = JSON.parse(fs.readFileSync(sumPath, 'utf8'));
        T.ok('subject summary carries a survived count 0..8', typeof sub.survived === 'number' && sub.survived >= 0 && sub.survived <= 8, 'survived=' + sub.survived);
        const subSeeds = (sub.perSeed || []).map(function (p) { return p.seed; });
        T.ok('subject leg ran exactly the fresh band 190589-190596',
          JSON.stringify(subSeeds) === JSON.stringify(SEEDS), JSON.stringify(subSeeds));
        const verdict = base.survived >= 3 ? classifyTransplant(sub.survived) : 'UNCLASSIFIABLE';
        T.ok('subject summary verdict maps from the survived count (' + verdict + ')',
          verdict === 'CARRIER' || verdict === 'AMBIGUOUS' || verdict === 'NOT-CARRIER', verdict);
        T.ok('subject driver log exists', fs.existsSync(logPath), 'present');
        T.ok('subject per-seed corpus exists', fs.existsSync(corpusDir), 'present');
        T.ok('evidence file exists and records the subject verdict ' + verdict,
          ev9 !== '' && ev9.indexOf(verdict) !== -1, verdict + ' present');
        T.ok('evidence file records the subject survived count',
          ev9.indexOf('survived ' + sub.survived + '/8') !== -1, 'survived ' + sub.survived + '/8 present');
        T.ok('evidence file records the fresh baseline survived count',
          ev9.indexOf('survived ' + base.survived + '/8') !== -1, 'baseline survived ' + base.survived + '/8 present');
        T.ok('evidence file records the family-test leg (conflicted script)',
          ev9.indexOf('test-transplant8fam-conflicted') !== -1, 'conflicted leg present');
        } // guard-B else (subject pending) — close
      } // gate if/else — close
      } // guard-A else (baseline pending) — close
    } // sniff-survived if/else — close
  } // sniff-exists if/else — close

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
