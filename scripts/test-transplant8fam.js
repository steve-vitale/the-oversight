// test-transplant8fam.js — proof test for the H1 TRANSPLANT, family 8
// AS A FAMILY: the four CONFLICTED PR #22 hunks, theirs-resolved
// (arm sim-transplant8fam-a).
//
// THE QUESTION (evidence/2026-11-15/sim-transplant8fam-prereg.md,
// committed before cutting the subject or running any judged sim):
// land origin family 8's four CONFLICTED hunks — merge 713eb7545
// (PR #22 live-thread-dry-engage) — AS ONE SUBJECT, resolved by
// taking THEIRS in the conflicted regions, onto the far end
// 203a32775 (GOOD 4/8 on the matched band) and measure whether the
// family together collapses it. Verdicts (matched band
// 190391-190398): baseline leg must read >=3/8 or the run stops;
// <=1/8 CARRIER, 2/8 AMBIGUOUS (re-run once; 2/8 again -> recorded
// AMBIGUOUS, treated as NOT-CARRIER for ordering, kept on the suspect
// list), >=3/8 NOT-CARRIER.
//
// PREDICTED OUTCOME — MEASURABLE BY THEIRS-RESOLUTION: the live
// `git cherry-pick -m 1 713eb7545` onto the far end conflicts in
// exactly the TWO predicted files (pick_rc=1), with markers at the
// positions the family-8 arm recorded live; each marker region is
// resolved by taking THEIRS verbatim; the four auto-merged clean
// hunks (the 8b three + the 8c one) are reversed out; the subject
// diff is exactly the four hunks' theirs-content (+8/-6 and +69/-5).
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
//   2. Four-hunk definition — the family diff has EXACTLY 3
//      conversation.js hunks + 5 convo-dialogue.js hunks; the
//      conflicted four are named exactly in BOTH numberings
//      (family-diff + merge-tree); the 8b included set and the 8c
//      hunk are named as EXCLUDED; the hunk-A +22/-3 (merge-tree)
//      vs +4/-0 (family-diff) distinction is stated in the prereg.
//   3. Merge-tree prediction (read-only) — the four conflicted
//      hunks carry ALL 12 markers (3 + 9) with the exact
//      ours/theirs line counts per region (9/8, 3/22, 1/23, 1/24);
//      the four clean hunks are marker-free; the test file is
//      'added in remote' (clean addition); NO merged sections, NO
//      delete/modify (DU) entries. NOTE: the merge-tree display
//      ELIDES unchanged middle lines of a long ours span (hunk 1
//      shows only 6 of its 9 ours lines), so region contents are
//      derived from the files by anchor lines (REGIONS below),
//      not from the merge-tree display.
//   4. Mechanism analysis — reference counts at the far end vs
//      the merge for every name the hunks touch; secretOutcome
//      def+use inside the region; convoWouldBlock EXISTS at the far
//      end (so the hunk-B pre-check is live);
//      convoHasLiveUnfinished / convoUnfinishedEngageLine absent
//      at the far end (so liveUnfinished reduces to outing||
//      deferred); _sayFellBack set by sayLine at the far end.
//   5. CONFLICT-RESOLUTION RULE + verdict mapping —
//      applyTheirs returns exactly the theirs lines (drops ours);
//      deviationVerdict maps any subject-construction deviation
//      (extra file, marker mismatch, failed clean-hunk reversal)
//      to UNMEASURED; classifyTransplant maps every survived count
//      to CARRIER / AMBIGUOUS / NOT-CARRIER / UNCLASSIFIABLE.
//   6. Base state — HEAD is on sim-transplant8fam-a in the worktree
//      (or master at the merged tip — branch-identity legs are
//      worktree-aware per the 0215 coordinator note, so the proof
//      stays green on master), no src/js file differs from HEAD,
//      on-disk standing.js is byte-identical to HEAD, and the
//      step-script tooling source (master) still carries all four
//      scratch files.
//   7. Seed-band identity — the prereg names the MATCHED band
//      190391-190398 (the band the far end's settled 4/8 was
//      measured on, reproduced three times), the STEP id t8fam,
//      the baseline STEP id ep-far-8fam, the subject branch
//      transplant-8fam-subject, and the band-health pre-check. The
//      /tmp copy of the step script needs NO band edit (the
//      committed tooling already hardcodes the matched band);
//      the copy exists only so the detached checkout cannot unlink
//      the running script itself.
//   8. Family-test leg (dialogue instrument) — the #4 proof is
//      pre-registered EXPECTED-FAIL/partial as a diagnostic only,
//      never a verdict input; the test file is absent at the far
//      end and (once cut) at the subject; the evidence file, once
//      written, records the observed #4 outcome.
//   9. Live subject state — the subject branch does not exist yet
//      at prereg stage; once cut it asserts the branch's parent is
//      the far end, the subject diff is exactly the four hunks'
//      theirs-content (+8/-9 one hunk, +69/-5 three hunks,
//      each conflicted region's subject text equal to the merge's
//      region text by anchor-delimited comparison), the test file
//      is ABSENT from the subject, NONE of the 8b/8c-only strings
//      are present, all four-hunk theirs-strings ARE present,
//      subject policy == far-end policy, subject native standing
//      == far-end standing, and both subject files parse (vm.Script
//      syntax check).
//  10. Step corpora — state-aware WITH the 1116Z guard: every
//      summary read is preceded by an fs.existsSync check on the
//      SAME path in the SAME branch, and the intermediate state
//      (baseline summary exists, subject summary absent, baseline
//      >=3/8) is its own passing branch that never touches the
//      subject summary path. The proof passes in ALL FOUR states
//      (neither / baseline-only-healthy / baseline-only-gate-stop
//      / both), not just at stage 1 and at the final state.
//
// Usage: node scripts/test-transplant8fam.js
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
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
const STEP = 't8fam';
const BASELINE_STEP = 'ep-far-8fam';
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
// The four CONFLICTED hunks (family-diff headers).
const CONFLICT_HUNKS = {
  'src/js/conversation.js': ['@@ -7017,7 +7095,13 @@'],
  'src/js/convo-dialogue.js': ['@@ -444,6 +475,10 @@', '@@ -495,10 +530,25 @@', '@@ -510,18 +560,30 @@'],
};
// The 8b included set (named here to prove 8fam excludes all of it).
const INCLUDED_8B = {
  'src/js/conversation.js': ['@@ -1163,6 +1163,55 @@', '@@ -5995,9 +6044,38 @@'],
  'src/js/convo-dialogue.js': ['@@ -273,15 +273,30 @@'],
};
// The 8c hunk (named here to prove 8fam excludes it).
const HUNK_8C = '@@ -293,11 +308,27 @@';
// Merge-tree (far-end/result numbering) anchors for the four
// conflicted hunks.
const MT_CONFLICT = ['@@ -7167,6 +7246,16 @@', '@@ -448,9 +479,34 @@', '@@ -497,7 +553,33 @@', '@@ -505,7 +587,34 @@'];
// Merge-tree anchors for the four CLEAN hunks (reversed out).
const MT_CLEAN = ['@@ -1163,6 +1163,55 @@', '@@ -6069,9 +6118,38 @@', '@@ -288,15 +288,30 @@', '@@ -308,11 +323,27 @@'];
// Marker counts from the merge-tree dry run, per 'changed in both' file.
const EXPECTED_MARKERS = {
  'src/js/conversation.js': 3,
  'src/js/convo-dialogue.js': 9,
};
// Ours/theirs line counts per conflicted region, in file order
// (conversation.js hunk 1; convo-dialogue.js hunks A, B, C).
// Derived from the FAR-END and MERGE files by anchor lines (see
// REGIONS), NOT from the merge-tree display — the display elides
// hunk 1's three middle ours lines (context-window elision).
const EXPECTED_REGION_COUNTS = {
  'src/js/conversation.js': [{ ours: 9, theirs: 8 }],
  'src/js/convo-dialogue.js': [{ ours: 3, theirs: 22 }, { ours: 1, theirs: 23 }, { ours: 1, theirs: 24 }],
};
// Anchor-delimited conflict regions: [startAnchor, endAnchor] are
// CONTEXT lines (present identically in the far end, the merge, and
// the subject — each verified unique in all three files). The region
// is the lines strictly between them. This is immune to the
// merge-tree display's context elision.
const REGIONS = [
  { file: 'src/js/conversation.js',
    start: "      const inviteOutcome = choiceId === 'invite_party';",
    end: '      // WANT ARC (convo rebuild 2026-10-11): answering their question engages',
    far: 9, merge: 8 },
  { file: 'src/js/convo-dialogue.js',
    start: '        c.transcript.push({ who: \'you\', text: \'"How can I help?"\' });',
    end: "          const line = '\"It\\'s already handled. Thank you for asking.\"';",
    far: 3, merge: 22 },
  { file: 'src/js/convo-dialogue.js',
    start: '        const composed = this.convoComposeDlg(vid, favorLine, choiceId);',
    end: '        // BLOCKED REPEAT (dialog-ui-fix 2026-10-11, defect 6; cycling',
    far: 1, merge: 23 },
  { file: 'src/js/convo-dialogue.js',
    start: '        // the claimed line from the transcript.',
    end: '          const dup = this.convoSelfRepeatLine(vid) || \'"I just said — did you miss it?"\';',
    far: 1, merge: 24 },
];
// regionText(text, start, end): lines strictly between the first
// occurrence of `start` and the first occurrence of `end` after it.
// Returns null when either anchor is missing or out of order.
function regionText(text, start, end) {
  const lines = text.split('\n');
  const si = lines.indexOf(start);
  const ei = lines.indexOf(end, si + 1);
  if (si === -1 || ei === -1 || ei <= si) return null;
  return lines.slice(si + 1, ei);
}
// Expected subject diff vs the far end, per file (added/removed).
const EXPECTED_SUBJECT_NUMSTAT = {
  'src/js/conversation.js': '8\t9\tsrc/js/conversation.js',
  'src/js/convo-dialogue.js': '69\t5\tsrc/js/convo-dialogue.js',
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
// Four-hunk theirs-strings that must be PRESENT in the subject.
const INCLUDED_STRINGS = [
  { file: 'src/js/conversation.js', s: "const plantTeachOutcome = choiceId === 'teach';" },
  { file: 'src/js/conversation.js', s: 'diegeticAct: inviteOutcome || lessonOutcome || plantTeachOutcome' },
  { file: 'src/js/conversation.js', s: '// PLANT TEACH IS A DIEGETIC ACT (dialog audit #4 2026-11-08): the' },
  { file: 'src/js/convo-dialogue.js', s: 'const pinnedFavor = c.want?.favor || null;' },
  { file: 'src/js/convo-dialogue.js', s: 'const liveUnfinished = !!(unfinishedOuting || deferredAfterResume ||' },
  { file: 'src/js/convo-dialogue.js', s: 'if (!unfinishedOuting && !deferredAfterResume &&' },
  { file: 'src/js/convo-dialogue.js', s: 'const helpStructural = !!liveUnfinished;' },
  { file: 'src/js/convo-dialogue.js', s: "if (helpStructural && typeof this.convoWouldBlock === 'function' &&" },
  { file: 'src/js/convo-dialogue.js', s: 'structural: helpStructural || undefined,' },
  { file: 'src/js/convo-dialogue.js', s: 'if (!said || c._sayFellBack) {' },
  { file: 'src/js/convo-dialogue.js', s: "if (liveUnfinished || (c.want && c.want.id === 'repay')) {" },
  { file: 'src/js/convo-dialogue.js', s: 'if (c._sayFellBack) {' },
  { file: 'src/js/convo-dialogue.js', s: '// UNFINISHED HELP BLOCKED (dialog audit #1/#4 2026-11-08): never' },
];
// 8b/8c-only strings + far-end ours lines that must be ABSENT from
// the subject (the clean hunks are reversed out; the conflicted
// regions take theirs).
const EXCLUDED_STRINGS = [
  { file: 'src/js/conversation.js', s: 'convoHasLiveUnfinished(vid) {' },
  { file: 'src/js/conversation.js', s: 'convoUnfinishedEngageLine(vid) {' },
  { file: 'src/js/conversation.js', s: 'let goonText = hb.text;' },
  { file: 'src/js/conversation.js', s: 'const goonSaid = this.sayLine(vid, goonText, goonOpts);' },
  { file: 'src/js/conversation.js', s: 'SECRET REPLIES' },
  { file: 'src/js/conversation.js', s: 'secretOutcome' },
  { file: 'src/js/conversation.js', s: "lessonOutcome = choiceId.indexOf('skill_learn:') === 0 || choiceId.indexOf('skill_teach:') === 0 || choiceId === 'teach';" },
  { file: 'src/js/convo-dialogue.js', s: 'if (said && !c._sayFellBack)' },
  { file: 'src/js/convo-dialogue.js', s: '// sayLine already spoke a dry fallback into the transcript' },
  { file: 'src/js/convo-dialogue.js', s: 'name it instead of "that\'s all."' },
  { file: 'src/js/convo-dialogue.js', s: 'this.convoWouldBlock(vid, composed) &&' },
  { file: 'src/js/convo-dialogue.js', s: "const said = this.sayLine(vid, composed, { tag: (c.want && c.want.id === 'ask_favor') ? 'favor' : undefined });" },
];
// Far-end lines the clean-hunk reversal must PRESERVE in the subject.
const PRESERVED_STRINGS = [
  { file: 'src/js/convo-dialogue.js', s: 'return { line: composed, choices: this.convoChoices(vid), ended: false, transcript: c.transcript.slice() };' },
  { file: 'src/js/conversation.js', s: 'done(hb.text, gl);' },
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
function countOccurrences(text, s) {
  let n = 0, i = 0;
  for (;;) { const j = text.indexOf(s, i); if (j === -1) return n; n++; i = j + s.length; }
}
function classifyTransplant(n) {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 8) return 'UNCLASSIFIABLE';
  if (n <= 1) return 'CARRIER';
  if (n === 2) return 'AMBIGUOUS';
  return 'NOT-CARRIER';
}
// applyTheirs(region): the binding CONFLICT-RESOLUTION RULE as a
// pure function — a conflicted region resolves to exactly its THEIRS
// lines; the OURS lines are dropped, never merged into a union.
function applyTheirs(region) {
  if (!region || !Array.isArray(region.theirs)) return null;
  return region.theirs.slice();
}
// deviationVerdict(d): the binding STOP rule FOR THIS ARM — any
// deviation from the predicted subject construction (extra file in
// the subject diff, marker-count/position mismatch on the live pick,
// a clean-hunk reversal failure) stops the arm as UNMEASURED; only
// a clean construction is MEASURABLE.
function deviationVerdict(d) {
  if (!d || typeof d !== 'object') return 'UNCLASSIFIABLE';
  if (d.extraFiles || d.markerMismatch || d.reversalFailed) return 'UNMEASURED';
  return 'MEASURABLE';
}
// readJsonIfExists(p): the 1116Z §10 guard as a function — a missing
// summary reads as null, never an uncaught ENOENT. Callers branch on
// the null; they never readFileSync a path they have not checked.
function readJsonIfExists(p) {
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { return { __error: String((e && e.message) || e) }; }
}
function syntaxOk(code, filename) {
  try { new vm.Script(code, { filename: filename }); return true; }
  catch (e) { return false; }
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
// diffLines(diffText): ALL added/removed content lines of a unified
// diff (every hunk), as sorted multisets { added, removed }.
function diffLines(diffText) {
  const added = [], removed = [];
  for (const ln of diffText.split('\n')) {
    if (ln.indexOf('+') === 0 && ln.indexOf('+++') !== 0) added.push(ln.slice(1));
    else if (ln.indexOf('-') === 0 && ln.indexOf('---') !== 0) removed.push(ln.slice(1));
  }
  added.sort(); removed.sort();
  return { added: added, removed: removed };
}
// mergeTreeRegions(): run `git merge-tree <base> <ours> <theirs>`
// (read-only dry run — touches no worktree) and return { found:
// { file: markers } for each 'changed in both' section, merged:
// { file: true } for each 'merged' section, regions: [{ file,
// headers, ours, theirs }] per conflict span, raw: the raw output }.
// Merge-tree conflict format (verified against /tmp/mt8fam.txt):
// ours lines are SPACE-prefixed between `+<<<<<<<` and `+=======`;
// theirs lines are `+`-prefixed between `+=======` and `+>>>>>>>`;
// a span may cross @@ hunk headers (the lesson-outcome span starts
// in @@ -7158 and continues across @@ -7167).
function mergeTreeRegions() {
  const out = execSync('git merge-tree ' + MERGE_BASE + ' ' + FAR + ' ' + MERGE,
    { cwd: REPO, stdio: 'pipe', maxBuffer: 512 * 1024 * 1024 }).toString('utf8');
  const lines = out.split('\n');
  const found = {};
  const merged = {};
  const regions = [];
  let cur = null;       // { file, markers } for the current changed-in-both section
  let curMerged = null;
  let curFile = null;
  let span = null;      // { file, headers, ours, theirs } for the open conflict span
  let spanState = null; // 'ours' | 'theirs'
  const closeSpan = function () { if (span !== null) { regions.push(span); span = null; spanState = null; } };
  const record = function () { if (cur !== null && cur.file !== null) found[cur.file] = cur.markers; };
  for (const ln of lines) {
    if (/^(added in|removed in|renamed|merged|changed in both)/.test(ln)) {
      record();
      closeSpan();
      cur = (ln === 'changed in both') ? { file: null, markers: 0 } : null;
      curMerged = (ln === 'merged') ? { file: null } : null;
      continue;
    }
    if (ln.indexOf('@@ -') === 0) {
      if (span !== null) span.headers.push(ln);
      continue;
    }
    if (cur !== null) {
      const m = ln.match(/^  base\s+\d+ [0-9a-f]+ (.+)$/);
      if (m && cur.file === null) { cur.file = m[1]; curFile = m[1]; }
      if (ln.indexOf('+<<<<<<<') === 0 || ln.indexOf('+>>>>>>>') === 0 || ln.indexOf('+=======') === 0) cur.markers++;
    }
    if (curMerged !== null) {
      const m = ln.match(/^  result\s+\d+ [0-9a-f]+ (.+)$/);
      if (m) merged[m[1]] = true;
    }
    if (ln.indexOf('+<<<<<<<') === 0) {
      span = { file: curFile, headers: [], ours: [], theirs: [] };
      spanState = 'ours';
      continue;
    }
    if (ln.indexOf('+=======') === 0) { spanState = 'theirs'; continue; }
    if (ln.indexOf('+>>>>>>>') === 0) { closeSpan(); continue; }
    if (span !== null && spanState === 'ours' && ln.indexOf(' ') === 0) span.ours.push(ln.slice(1));
    else if (span !== null && spanState === 'theirs' && ln.indexOf('+') === 0) span.theirs.push(ln.slice(1));
  }
  record();
  closeSpan();
  return { found: found, merged: merged, regions: regions, raw: out };
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
function countOccurrencesRaw(raw, s) {
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

  // ---- 2. Four-hunk definition ----
  T.section('2. Four-hunk definition — hunk inventory, conflicted four named exactly');
  for (const f of Object.keys(FAMILY_HUNKS)) {
    const got = familyHunks(f);
    T.ok(f + ' has exactly the expected family hunks (' + FAMILY_HUNKS[f].length + ')',
      JSON.stringify(got) === JSON.stringify(FAMILY_HUNKS[f]), got.join(' | '));
  }
  for (const f of Object.keys(CONFLICT_HUNKS)) {
    for (const h of CONFLICT_HUNKS[f]) {
      T.ok('conflicted hunk present in family diff: ' + f + ' ' + h,
        FAMILY_HUNKS[f].indexOf(h) !== -1, h);
    }
  }
  for (const f of Object.keys(INCLUDED_8B)) {
    for (const h of INCLUDED_8B[f]) {
      T.ok('8b included hunk present in family diff (excluded from 8fam): ' + f + ' ' + h,
        FAMILY_HUNKS[f].indexOf(h) !== -1, h);
    }
  }
  T.ok('8c hunk present in family diff (excluded from 8fam): ' + HUNK_8C,
    FAMILY_HUNKS['src/js/convo-dialogue.js'].indexOf(HUNK_8C) !== -1, HUNK_8C);
  T.ok('8b + conflict + 8c partition the family hunks exactly',
    (function () {
      for (const f of Object.keys(FAMILY_HUNKS)) {
        const parts = INCLUDED_8B[f].concat(CONFLICT_HUNKS[f]);
        if (f === 'src/js/convo-dialogue.js') parts.push(HUNK_8C);
        if (JSON.stringify(parts.slice().sort()) !== JSON.stringify(FAMILY_HUNKS[f].slice().sort())) return false;
      }
      return true;
    })(), '3 + 4 + 1 = 8 hunks across 2 files');
  const famDiffConv = execSync('git diff ' + MERGE + '^1 ' + MERGE + ' -- src/js/conversation.js',
    { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  const famDiffDlg = execSync('git diff ' + MERGE + '^1 ' + MERGE + ' -- src/js/convo-dialogue.js',
    { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  const hA = hunkLines(famDiffDlg, ['@@ -444,6 +475,10 @@']);
  T.ok('family-diff hunk A is +4/-0 (the liveUnfinished const only)',
    hA.added.length === 4 && hA.removed.length === 0, '+' + hA.added.length + '/-' + hA.removed.length);
  T.ok('family-diff hunk A adds exactly the liveUnfinished const',
    hA.added.some(function (l) { return l.indexOf('const liveUnfinished') !== -1; }), 'liveUnfinished present');
  const h1 = hunkLines(famDiffConv, ['@@ -7017,7 +7095,13 @@']);
  T.ok('family-diff hunk 1 is +7/-1 (plant-teach outcome)',
    h1.added.length === 7 && h1.removed.length === 1, '+' + h1.added.length + '/-' + h1.removed.length);
  T.ok('family-diff hunk 1 removes the lessonOutcome sayLine call, adds plantTeachOutcome',
    h1.removed.length === 1 && h1.removed[0].indexOf('diegeticAct') !== -1 &&
    h1.added.some(function (l) { return l.indexOf('plantTeachOutcome') !== -1; }), 'plant-teach markers present');
  const preregPath = path.join(REPO, 'evidence', '2026-11-15', 'sim-transplant8fam-prereg.md');
  const prereg = fs.existsSync(preregPath) ? fs.readFileSync(preregPath, 'utf8') : '';
  T.ok('8fam prereg file exists', prereg !== '', preregPath);
  T.ok('prereg names the four conflicted hunks (merge-tree anchors)',
    MT_CONFLICT.every(function (a) { return prereg.indexOf(a) !== -1; }), '4/4 anchors present');
  T.ok('prereg states the CONFLICT-RESOLUTION RULE (theirs, not a union hybrid)',
    prereg.indexOf('CONFLICT-RESOLUTION RULE') !== -1 && prereg.indexOf('NOT a') !== -1 && prereg.indexOf('union hybrid') !== -1, 'rule present');
  T.ok('prereg states taking theirs discards the teach + SECRET REPLIES block',
    prereg.indexOf("|| choiceId === 'teach'") !== -1 && prereg.indexOf('SECRET REPLIES') !== -1, 'discard stated');
  T.ok('prereg states the hunk-A distinction (+22/-3, NOT +4/-0)',
    prereg.indexOf('+22') !== -1 && prereg.indexOf('NOT +4/−0') !== -1, 'distinction present');
  T.ok('prereg states the expected subject diff (+8/-9 and +69/-5)',
    prereg.indexOf('+8') !== -1 && prereg.indexOf('+69') !== -1, 'expected diff present');
  T.ok('prereg states NO test file in the subject (game code only)',
    prereg.indexOf('NO test file in the subject') !== -1, 'no-test-file rule present');
  T.ok('prereg records the merge-tree pre-check prediction (MEASURABLE BY THEIRS-RESOLUTION)',
    prereg.indexOf('PREDICTED OUTCOME — MEASURABLE BY THEIRS-RESOLUTION') !== -1, 'prediction present');
  T.ok('prereg records the subject-construction procedure (pick, theirs-resolve, reverse clean hunks)',
    prereg.indexOf('Subject construction') !== -1 && prereg.indexOf('git apply -R') !== -1, 'procedure present');
  T.ok('prereg records the §10 intermediate-state guard (1116Z fix)',
    prereg.indexOf('1116Z') !== -1 && prereg.indexOf('intermediate-state') !== -1, 'guard note present');

  // ---- 3. Merge-tree prediction ----
  T.section('3. Merge-tree prediction — all markers in the four conflicted hunks');
  const mt = mergeTreeRegions();
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
    T.ok('merge-tree output carries the clean hunk anchor ' + a,
      mt.raw.indexOf(a) !== -1, 'present');
  }
  T.ok('merge-tree output carries exactly FOUR conflict spans',
    mt.regions.length === 4, 'spans=' + mt.regions.length);
  for (const f of Object.keys(EXPECTED_REGION_COUNTS)) {
    const got = mt.regions.filter(function (r) { return r.file === f; });
    T.ok(f + ' carries exactly the expected conflict spans (' + EXPECTED_REGION_COUNTS[f].length + ')',
      got.length === EXPECTED_REGION_COUNTS[f].length, 'spans=' + got.length);
  }
  // Anchor-delimited region contents (immune to the merge-tree
  // display's context elision — see the prereg correction note).
  // For each region: the merge file's region has exactly the
  // expected length and equals the merge-tree theirs lines (the
  // theirs side is shown complete); the far-end file's region has
  // exactly the expected length and CONTAINS the merge-tree ours
  // lines (the display shows only the 6 of hunk 1's 9 ours lines
  // adjacent to the markers).
  const farConv0 = gitShow(FAR, 'src/js/conversation.js');
  const farDlg0 = gitShow(FAR, 'src/js/convo-dialogue.js');
  const mergeConv0 = gitShow(MERGE, 'src/js/conversation.js');
  const mergeDlg0 = gitShow(MERGE, 'src/js/convo-dialogue.js');
  REGIONS.forEach(function (rg, idx) {
    const farText = rg.file === 'src/js/conversation.js' ? farConv0 : farDlg0;
    const mergeText = rg.file === 'src/js/conversation.js' ? mergeConv0 : mergeDlg0;
    const farRegion = regionText(farText, rg.start, rg.end);
    const mergeRegion = regionText(mergeText, rg.start, rg.end);
    T.ok('region ' + (idx + 1) + ' anchors are unique in the far-end file',
      countOccurrences(farText, rg.start) === 1 && countOccurrences(farText, rg.end) === 1, '1/1');
    T.ok('region ' + (idx + 1) + ' anchors are unique in the merge file',
      countOccurrences(mergeText, rg.start) === 1 && countOccurrences(mergeText, rg.end) === 1, '1/1');
    T.ok('region ' + (idx + 1) + ' far-end region has exactly ' + rg.far + ' lines',
      farRegion !== null && farRegion.length === rg.far, farRegion === null ? 'null' : 'lines=' + farRegion.length);
    T.ok('region ' + (idx + 1) + ' merge region has exactly ' + rg.merge + ' lines',
      mergeRegion !== null && mergeRegion.length === rg.merge, mergeRegion === null ? 'null' : 'lines=' + mergeRegion.length);
    const span = mt.regions[idx];
    T.ok('region ' + (idx + 1) + ' merge region equals the merge-tree theirs lines',
      mergeRegion !== null && span !== undefined && JSON.stringify(mergeRegion.slice().sort()) === JSON.stringify(span.theirs.slice().sort()),
      mergeRegion === null ? 'null' : 'merge=' + mergeRegion.length + ' theirs=' + (span ? span.theirs.length : '?'));
    T.ok('region ' + (idx + 1) + ' far-end region contains all merge-tree ours lines (display elides the rest)',
      farRegion !== null && span !== undefined && span.ours.every(function (l) { return farRegion.indexOf(l) !== -1; }),
      span ? 'ours shown=' + span.ours.length + ' of far=' + (farRegion === null ? '?' : farRegion.length) : 'no span');
  });
  T.ok('conversation.js span ours lines carry the teach + SECRET REPLIES block',
    mt.regions[0].ours.some(function (l) { return l.indexOf("|| choiceId === 'teach'") !== -1; }) &&
    mt.regions[0].ours.some(function (l) { return l.indexOf('SECRET REPLIES') !== -1; }) &&
    mt.regions[0].ours.some(function (l) { return l.indexOf('secretOutcome') !== -1; }), '3/3 ours markers');
  T.ok('conversation.js span theirs lines carry the PLANT TEACH block + plantTeachOutcome',
    mt.regions[0].theirs.some(function (l) { return l.indexOf('PLANT TEACH') !== -1; }) &&
    mt.regions[0].theirs.some(function (l) { return l.indexOf('plantTeachOutcome') !== -1; }), '2/2 theirs markers');
  T.ok('convo-dialogue.js span A theirs lines carry pinnedFavor + liveUnfinished + the guarded if',
    mt.regions[1].theirs.some(function (l) { return l.indexOf('pinnedFavor') !== -1; }) &&
    mt.regions[1].theirs.some(function (l) { return l.indexOf('const liveUnfinished') !== -1; }) &&
    mt.regions[1].theirs.some(function (l) { return l.indexOf('if (!unfinishedOuting && !deferredAfterResume &&') !== -1; }), '3/3 theirs markers');
  T.ok('clean hunk @@ -308 carries ZERO markers',
    markersBetween(mt.raw, '@@ -308,11 +323,27 @@', '@@ -448,9 +479,34 @@') === 0, 'markers=0');
  T.ok('conflict hunk @@ -448 (favor settlement) carries exactly 3 markers',
    markersBetween(mt.raw, '@@ -448,9 +479,34 @@', '@@ -497,7 +553,33 @@') === 3, 'markers=3');
  T.ok('conflict hunk B @@ -497 (favor-line sayLine) carries exactly 3 markers',
    markersBetween(mt.raw, '@@ -497,7 +553,33 @@', '@@ -505,7 +587,34 @@') === 3, 'markers=3');
  T.ok('conflict hunk C @@ -505 (blocked-repeat) carries exactly 3 markers',
    markersBetween(mt.raw, '@@ -505,7 +587,34 @@', null) === 3, 'markers=3');
  T.ok('conflict hunk 1 (lesson-outcome) carries exactly 3 markers',
    markersBetween(mt.raw, '@@ -7158,6 +7236,7 @@', 'changed in both') === 3, 'markers=3');

  // ---- 4. Mechanism analysis ----
  T.section('4. Mechanism analysis — what the four hunks can and cannot do alone');
  const farConv = gitShow(FAR, 'src/js/conversation.js');
  const farDlg = gitShow(FAR, 'src/js/convo-dialogue.js');
  const mergeConv = gitShow(MERGE, 'src/js/conversation.js');
  const mergeDlg = gitShow(MERGE, 'src/js/convo-dialogue.js');
  T.ok('secretOutcome: 2 occurrences at the far end, 0 at the merge (def+use inside the region)',
    countOccurrences(farConv, 'secretOutcome') === 2 && countOccurrences(mergeConv, 'secretOutcome') === 0, 'far=2 merge=0');
  T.ok('unfinishedOuting: 0 at the far end, 6 at the merge (introduced by theirs)',
    countOccurrences(farDlg, 'unfinishedOuting') === 0 && countOccurrences(mergeDlg, 'unfinishedOuting') === 6, 'far=0 merge=6');
  T.ok('deferredAfterResume: 0 at the far end, 3 at the merge',
    countOccurrences(farDlg, 'deferredAfterResume') === 0 && countOccurrences(mergeDlg, 'deferredAfterResume') === 3, 'far=0 merge=3');
  T.ok('helpFavor / pinnedFavor / ledgerFavor: 0 at the far end, present at the merge',
    countOccurrences(farDlg, 'helpFavor') === 0 && countOccurrences(mergeDlg, 'helpFavor') === 9 &&
    countOccurrences(farDlg, 'pinnedFavor') === 0 && countOccurrences(mergeDlg, 'pinnedFavor') === 3 &&
    countOccurrences(farDlg, 'ledgerFavor') === 0 && countOccurrences(mergeDlg, 'ledgerFavor') === 2, 'far=0/0/0 merge=9/3/2');
  T.ok('liveUnfinished / helpStructural: 0 at the far end, present at the merge',
    countOccurrences(farDlg, 'liveUnfinished') === 0 && countOccurrences(mergeDlg, 'liveUnfinished') === 3 &&
    countOccurrences(farDlg, 'helpStructural') === 0 && countOccurrences(mergeDlg, 'helpStructural') === 3, 'far=0/0 merge=3/3');
  T.ok('plantTeachOutcome: 0 at the far end, 2 at the merge (def+use inside hunk 1)',
    countOccurrences(farConv, 'plantTeachOutcome') === 0 && countOccurrences(mergeConv, 'plantTeachOutcome') === 2, 'far=0 merge=2');
  T.ok('convoWouldBlock EXISTS at the far end (hunk-B pre-check is live, not inert)',
    countOccurrences(farConv, 'convoWouldBlock') > 0 && countOccurrences(farDlg, 'convoWouldBlock') > 0, 'far conv=' + countOccurrences(farConv, 'convoWouldBlock') + ' dlg=' + countOccurrences(farDlg, 'convoWouldBlock'));
  T.ok('convoHasLiveUnfinished is ABSENT at the far end (liveUnfinished reduces to outing||deferred)',
    countOccurrences(farConv, 'convoHasLiveUnfinished') === 0 && countOccurrences(farDlg, 'convoHasLiveUnfinished') === 0, 'absent at far end');
  T.ok('convoUnfinishedEngageLine is ABSENT at the far end (typeof-guarded call sites fall back)',
    countOccurrences(farConv, 'convoUnfinishedEngageLine') === 0 && countOccurrences(farDlg, 'convoUnfinishedEngageLine') === 0, 'absent at far end');
  T.ok('convoGetFavor EXISTS at the far end (hunk A typeof-guarded call is safe)',
    countOccurrences(farDlg, 'convoGetFavor') > 0, 'present at far end');
  T.ok('_sayFellBack IS set by sayLine at the far end (pre-existing FELL-BACK mechanism)',
    farConv.indexOf('c._sayFellBack = true;') !== -1, 'flag set in sayLine');
  T.ok('_sayFellBack is reset (false) at the top of sayLine at the far end',
    farConv.indexOf('c._sayFellBack = false;') !== -1, 'flag reset present');
  T.ok('the dry pool returns null past 9 uses at the far end (only null-with-flag path)',
    farConv.indexOf('if (used >= DRY.length) return null;') !== -1, 'exhaustion return present');
  T.ok('the far-end dlg:more returns line: composed (the line 8c changes — preserved by the 8c reversal)',
    farDlg.indexOf('return { line: composed, choices: this.convoChoices(vid), ended: false, transcript: c.transcript.slice() };') !== -1, 'composed return present');
  T.ok('the far-end favor-line sayLine is the bare call (no helpStructural — removed by the far end)',
    farDlg.indexOf("const said = this.sayLine(vid, composed, { tag: (c.want && c.want.id === 'ask_favor') ? 'favor' : undefined });") !== -1, 'bare call present');
  T.ok('the far-end blocked-repeat check is the bare if (!said) (no fell-back handling)',
    farDlg.indexOf('if (!said) {') !== -1, 'bare check present');
  T.ok('convoSelfRepeatLine / convoWantEngage / convoComposeDlg exist at the far end',
    countOccurrences(farConv, 'convoSelfRepeatLine') > 0 && countOccurrences(farDlg, 'convoWantEngage') > 0 && countOccurrences(farDlg, 'convoComposeDlg') > 0, '3/3 present');

  // ---- 5. Conflict-STOP rule + verdict mapping ----
  T.section('5. CONFLICT-RESOLUTION RULE + verdict mapping');
  T.ok('applyTheirs returns exactly the theirs lines (drops ours, no union)',
    JSON.stringify(applyTheirs({ ours: ['a'], theirs: ['b', 'c'] })) === JSON.stringify(['b', 'c']), 'theirs only');
  T.ok('applyTheirs on the lesson-outcome region returns the plant-teach lines, not the secret lines',
    (function () {
      const r = mt.regions[0];
      const got = applyTheirs(r);
      return got.some(function (l) { return l.indexOf('plantTeachOutcome') !== -1; }) &&
        !got.some(function (l) { return l.indexOf('secretOutcome') !== -1; });
    })(), 'theirs only');
  T.ok('applyTheirs with no theirs array returns null (unresolvable region)',
    applyTheirs({ ours: ['a'] }) === null, 'null');
  T.ok('deviationVerdict: clean construction -> MEASURABLE',
    deviationVerdict({ extraFiles: false, markerMismatch: false, reversalFailed: false }) === 'MEASURABLE', 'MEASURABLE');
  T.ok('deviationVerdict: extra file in the subject diff -> UNMEASURED',
    deviationVerdict({ extraFiles: true, markerMismatch: false, reversalFailed: false }) === 'UNMEASURED', 'UNMEASURED');
  T.ok('deviationVerdict: marker mismatch on the live pick -> UNMEASURED',
    deviationVerdict({ extraFiles: false, markerMismatch: true, reversalFailed: false }) === 'UNMEASURED', 'UNMEASURED');
  T.ok('deviationVerdict: clean-hunk reversal failure -> UNMEASURED',
    deviationVerdict({ extraFiles: false, markerMismatch: false, reversalFailed: true }) === 'UNMEASURED', 'UNMEASURED');
  T.ok('deviationVerdict: non-object input -> UNCLASSIFIABLE', deviationVerdict(null) === 'UNCLASSIFIABLE', 'UNCLASSIFIABLE');
  const table = [[0, 'CARRIER'], [1, 'CARRIER'], [2, 'AMBIGUOUS'], [3, 'NOT-CARRIER'], [4, 'NOT-CARRIER'], [8, 'NOT-CARRIER'], [-1, 'UNCLASSIFIABLE'], [9, 'UNCLASSIFIABLE'], [NaN, 'UNCLASSIFIABLE']];
  for (const pair of table) {
    T.ok('survived ' + pair[0] + ' -> ' + pair[1], classifyTransplant(pair[0]) === pair[1], classifyTransplant(pair[0]));
  }

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
      (function () { try { return git('rev-parse ' + SUBJECT_BRANCH).length === 40; } catch (e) { return false; } })(), 'branch kept');
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
  const scratchPresent = ['scripts/culpritbisect-driver-20261113.js', 'scripts/culpritbisect-analyze-20261113.js', 'scripts/masterregress-analyze-20261113.js', 'scripts/vetfirst-instrument-20261111.js']
    .filter(function (f) { return git('ls-files -- ' + f) !== ''; });
  T.ok('the four step-script tooling files are tracked at HEAD (landed on master, not scratch residue)',
    scratchPresent.length === 4, scratchPresent.length + '/4 tracked');

  // ---- 7. Seed-band identity ----
  T.section('7. Seed-band identity — matched band 190391-190398');
  const stepSrc = fs.readFileSync(path.join(REPO, 'scripts', 'culpritbisect-step.sh'), 'utf8');
  T.ok('the committed step script hardcodes the matched band (no band edit needed)',
    stepSrc.indexOf('190391,190392,190393,190394,190395,190396,190397,190398') !== -1, 'matched-band literal present');
  T.ok('prereg names the MATCHED band 190391-190398', prereg.indexOf('190391') !== -1 && prereg.indexOf('190398') !== -1, 'band in prereg');
  T.ok('prereg states the band-health pre-check (settled 4/8 reproduced three times)',
    prereg.indexOf('reproduced THREE') !== -1 || prereg.indexOf('reproduced three times') !== -1, 'pre-check present');
  T.ok('prereg names the STEP id t8fam', prereg.indexOf('t8fam') !== -1, 'STEP id present');
  T.ok('prereg names the baseline STEP id ep-far-8fam', prereg.indexOf('ep-far-8fam') !== -1, 'baseline STEP id present');
  T.ok('prereg names the subject branch transplant-8fam-subject', prereg.indexOf('transplant-8fam-subject') !== -1, 'branch name present');
  T.ok('prereg documents the /tmp-copy mechanism (running-script protection, no band edit)',
    prereg.indexOf('/tmp copy') !== -1, '/tmp-copy mechanism present');
  T.ok('prereg names the baseline gate (>=3/8 or STOP)',
    prereg.indexOf('BASELINE GATE') !== -1 && prereg.indexOf('≥3/8') !== -1, 'baseline gate present');
  T.ok('prereg states the expected baseline (4/8 with the exact per-seed days)',
    prereg.indexOf('86/144/150/43/150/87/150/150') !== -1, 'expected baseline present');

  // ---- 8. Family-test leg (dialogue instrument) ----
  T.section('8. Family-test leg — #4 proof is EXPECTED-FAIL/partial, diagnostic only');
  T.ok('prereg pre-registers the #4 proof as EXPECTED-FAIL/partial (diagnostic only, never a verdict input)',
    prereg.indexOf('EXPECTED-FAIL/partial') !== -1 && prereg.indexOf('never a verdict input') !== -1, 'pre-registration present');
  T.ok('prereg records the Dale goon setup failure expectation (missing 8b method)',
    prereg.indexOf('convoHasLiveUnfinished(vid)') !== -1 && prereg.indexOf('SETUP FAILURE') !== -1, 'expectation present');
  T.ok('prereg records the #14 missing-file expectation (pre-existing far-end substrate gap)',
    prereg.indexOf('test-favor-debt-help-coherence-20261108') !== -1 && prereg.indexOf('MODULE_NOT_FOUND') !== -1, 'expectation present');
  T.ok('the #4 proof file exists at the merge (blob a0161cc9, the diagnostic instrument)',
    git('ls-tree ' + MERGE + ' -- ' + ADDED_CLEAN).indexOf(ADDED_BLOB) !== -1, 'blob a0161cc9');
  T.ok('the #4 proof file is ABSENT at the far end (it exists on neither the far end nor the subject)',
    git('ls-tree ' + FAR + ' -- ' + ADDED_CLEAN) === '', '(absent)');
  const evPath8 = path.join(REPO, 'evidence', '2026-11-15', 'sim-transplant8fam.md');
  const ev8 = fs.existsSync(evPath8) ? fs.readFileSync(evPath8, 'utf8') : '';
  if (ev8 === '') {
    T.ok('evidence file does not exist yet (family-test leg not run)', true, '(not written)');
    T.ok('no family-test outcome recorded yet', true, '(not run)');
  } else {
    T.ok('evidence file records the family-test leg (#4 proof)',
      ev8.indexOf('test-live-thread-engage-dry-20261108') !== -1, '#4 proof named');
    T.ok('evidence file records the family-test leg as diagnostic (EXPECTED-FAIL/partial or observed outcome)',
      ev8.indexOf('EXPECTED-FAIL') !== -1 || ev8.indexOf('diagnostic') !== -1, 'diagnostic framing present');
    T.ok('evidence file records the #14 missing-file outcome',
      ev8.indexOf('test-favor-debt-help-coherence-20261108') !== -1, '#14 named');
  }

  // ---- 9. Live subject state (state-aware) ----
  T.section('9. Live subject state — transplant-8fam-subject');
  let subject = null;
  try { subject = git('rev-parse ' + SUBJECT_BRANCH); } catch (e) { subject = null; }
  if (!subject) {
    T.ok('subject branch does NOT exist yet (prereg preceded the subject)', true, '(not cut)');
    T.ok('no subject commit exists yet', true, '(not cut)');
    T.ok('no subject diff exists yet', true, '(not cut)');
  } else {
    T.ok('subject branch exists', subject.length === 40, subject.slice(0, 12));
    const subjectParent = git('rev-parse ' + SUBJECT_BRANCH + '^1');
    T.ok('subject branch parent is the far end (cut at the far end, one subject commit)',
      subjectParent === FAR_FULL, subjectParent.slice(0, 12));
    const subjectCommitCount = parseInt(git('rev-list --count ' + FAR + '..' + SUBJECT_BRANCH), 10);
    T.ok('subject branch carries exactly ONE commit on the far end',
      subjectCommitCount === 1, 'commits=' + subjectCommitCount);
    const subjectFiles = git('diff --name-only ' + FAR + ' ' + SUBJECT_BRANCH).split('\n').sort();
    T.ok('subject diff touches exactly TWO files (conversation.js + convo-dialogue.js)',
      JSON.stringify(subjectFiles) === JSON.stringify(EXPECTED_JS.slice().sort()), subjectFiles.join(', '));
    for (const f of EXPECTED_JS) {
      const subStat = git('diff --numstat ' + FAR + ' ' + SUBJECT_BRANCH + ' -- ' + f);
      T.ok('subject diff ' + f + ' is exactly ' + EXPECTED_SUBJECT_NUMSTAT[f].split('\t').slice(0, 2).join('/'),
        subStat === EXPECTED_SUBJECT_NUMSTAT[f], subStat);
    }
    for (const f of EXPECTED_JS) {
      const subDiff = execSync('git diff ' + FAR + ' ' + SUBJECT_BRANCH + ' -- ' + f,
        { cwd: REPO, stdio: 'pipe' }).toString('utf8');
      const subHeaders = subDiff.split('\n').filter(function (ln) { return ln.indexOf('@@ -') === 0; });
      const wantHunks = f === 'src/js/conversation.js' ? 1 : 3;
      T.ok('subject diff ' + f + ' carries exactly ' + wantHunks + ' hunk(s)',
        subHeaders.length === wantHunks, subHeaders.join(' | '));
    }
    // Exact theirs-content: per region, the subject file's region
    // text must equal the MERGE file's region text exactly (same
    // anchors, same lines, same order). Together with the numstat
    // counts above (which pin the diff to exactly these four
    // regions), this proves the subject diff is exactly the four
    // hunks' theirs-content and nothing else. (A merge-tree
    // multiset comparison is NOT used: the display elides hunk 1's
    // middle ours lines, so it cannot serve as the ours oracle.)
    REGIONS.forEach(function (rg, idx) {
      const mergeText = gitShow(MERGE, rg.file);
      const subjectText = gitShow(SUBJECT_BRANCH, rg.file);
      const mergeRegion = regionText(mergeText, rg.start, rg.end);
      const subjectRegion = regionText(subjectText, rg.start, rg.end);
      T.ok('region ' + (idx + 1) + ' anchors are unique in the subject file',
        countOccurrences(subjectText, rg.start) === 1 && countOccurrences(subjectText, rg.end) === 1, '1/1');
      T.ok('region ' + (idx + 1) + ' subject region equals the merge region exactly (' + rg.merge + ' lines)',
        mergeRegion !== null && subjectRegion !== null && JSON.stringify(subjectRegion) === JSON.stringify(mergeRegion),
        subjectRegion === null ? 'null' : 'subject=' + subjectRegion.length + ' merge=' + (mergeRegion === null ? '?' : mergeRegion.length));
    });
    T.ok('test file is ABSENT from the subject (8fam carries no test file)',
      git('ls-tree ' + SUBJECT_BRANCH + ' -- ' + ADDED_CLEAN) === '', '(absent)');
    let incOk = true, incBad = null;
    for (const e of INCLUDED_STRINGS) {
      if (gitShow(SUBJECT_BRANCH, e.file).indexOf(e.s) === -1) { incOk = false; incBad = e.file + ': ' + e.s; break; }
    }
    T.ok('subject carries all four-hunk theirs-strings (' + INCLUDED_STRINGS.length + ')', incOk, incBad || INCLUDED_STRINGS.length + '/' + INCLUDED_STRINGS.length);
    let excOk = true, excBad = null;
    for (const e of EXCLUDED_STRINGS) {
      if (gitShow(SUBJECT_BRANCH, e.file).indexOf(e.s) !== -1) { excOk = false; excBad = e.file + ': ' + e.s; break; }
    }
    T.ok('subject carries NONE of the 8b/8c-only + far-end ours strings', excOk, excBad ? 'present: ' + excBad : '0/' + EXCLUDED_STRINGS.length);
    let presOk = true, presBad = null;
    for (const e of PRESERVED_STRINGS) {
      if (gitShow(SUBJECT_BRANCH, e.file).indexOf(e.s) === -1) { presOk = false; presBad = e.file + ': ' + e.s; break; }
    }
    T.ok('subject preserves the far-end lines the clean-hunk reversal restores', presOk, presBad || PRESERVED_STRINGS.length + '/' + PRESERVED_STRINGS.length);
    const subPolicy = sha256(gitShow(SUBJECT_BRANCH, 'scripts/policies/competent.js'));
    T.ok('subject policy sha equals the far-end policy sha (no policy drift)', subPolicy === farPolicy, subPolicy.slice(0, 12));
    const subStanding = sha256(gitShow(SUBJECT_BRANCH, 'src/js/standing.js'));
    T.ok('subject native standing.js sha equals the far-end standing sha', subStanding === farStanding, subStanding.slice(0, 12));
    T.ok('subject conversation.js parses (vm.Script syntax check)',
      syntaxOk(gitShow(SUBJECT_BRANCH, 'src/js/conversation.js'), 'conversation.js'), 'syntax ok');
    T.ok('subject convo-dialogue.js parses (vm.Script syntax check)',
      syntaxOk(gitShow(SUBJECT_BRANCH, 'src/js/convo-dialogue.js'), 'convo-dialogue.js'), 'syntax ok');
    const evPath9 = path.join(REPO, 'evidence', '2026-11-15', 'sim-transplant8fam.md');
    const ev9 = fs.existsSync(evPath9) ? fs.readFileSync(evPath9, 'utf8') : '';
    T.ok('evidence file records the subject commit hash (once the evidence file exists)',
      ev9 === '' || ev9.indexOf(subject) !== -1, ev9 === '' ? '(evidence not written yet)' : 'subject hash present');
  }

  // ---- 10. Step corpora (state-aware, 1116Z-guarded) ----
  T.section('10. Step corpora — settled baseline anchor + this run\'s matched-band legs (1116Z-guarded)');
  // REGRESSION LEGS for the 1116Z crash class (6b3way evidence): the
  // unguarded readFileSync(sumPath) after a "subject step summary
  // exists" leg crashed with uncaught ENOENT in the intermediate
  // state (baseline summary exists, subject summary absent). The
  // guard is readJsonIfExists + explicit existsSync branches below.
  T.ok('readJsonIfExists returns null for a missing summary (no throw, no ENOENT)',
    readJsonIfExists(path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-no-such-step-summary.json')) === null, 'null, not a crash');
  const settledBasePath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-ep-far-summary.json');
  T.ok('settled ep-far baseline corpus exists on master (prior run)',
    fs.existsSync(settledBasePath), 'present');
  // The settled read is itself guarded: the path was just checked
  // with existsSync in the SAME branch before this read.
  const settledBase = readJsonIfExists(settledBasePath);
  T.ok('settled ep-far baseline reads 4/8 survived', settledBase !== null && settledBase.survived === 4, settledBase === null ? 'null' : 'survived=' + settledBase.survived);
  const settledDays = settledBase !== null ? (settledBase.perSeed || []).map(function (p) { return p.days; }) : [];
  T.ok('settled ep-far baseline per-seed days are 86/144/150/43/150/87/150/150',
    JSON.stringify(settledDays) === JSON.stringify(EXPECTED_BASELINE_DAYS), JSON.stringify(settledDays));
  const baseSumPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + BASELINE_STEP + '-summary.json');
  const baseLogPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + BASELINE_STEP + '-driver.log');
  const baseCorpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + BASELINE_STEP);
  const sumPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  const logPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  const corpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  const evPath10 = path.join(REPO, 'evidence', '2026-11-15', 'sim-transplant8fam.md');
  const ev10 = fs.existsSync(evPath10) ? fs.readFileSync(evPath10, 'utf8') : '';
  const baseExists = fs.existsSync(baseSumPath);
  const subExists = fs.existsSync(sumPath);
  if (!baseExists && !subExists) {
    // STATE (a): neither leg has run — stage 1 / pre-run.
    T.ok('no baseline summary exists yet for ep-far-8fam (no judged sim ran)', true, '(not run)');
    T.ok('no baseline driver log exists yet', !fs.existsSync(baseLogPath), 'absent');
    T.ok('no baseline per-seed corpus exists yet', !fs.existsSync(baseCorpusDir), 'absent');
    T.ok('no subject step summary exists yet', true, '(not run)');
    T.ok('no subject driver log exists yet', !fs.existsSync(logPath), 'absent');
    T.ok('no subject per-seed corpus exists yet', !fs.existsSync(corpusDir), 'absent');
  } else if (baseExists && !subExists) {
    // STATE (b)/(c): baseline leg ran, subject leg has not. The
    // subject summary path is NEVER read in this branch — that is
    // the 1116Z guard. The baseline summary read below is guarded
    // by the baseExists check in THIS branch's condition.
    const base = readJsonIfExists(baseSumPath);
    T.ok('baseline step summary exists (ep-far-8fam)', base !== null && base.survived !== undefined, base === null ? 'null' : 'survived=' + base.survived);
    const baseSeeds = base !== null ? (base.perSeed || []).map(function (p) { return p.seed; }) : [];
    T.ok('baseline leg ran exactly the matched band 190391-190398',
      JSON.stringify(baseSeeds) === JSON.stringify(SEEDS), JSON.stringify(baseSeeds));
    T.ok('baseline driver log exists', fs.existsSync(baseLogPath), 'present');
    T.ok('baseline per-seed corpus exists', fs.existsSync(baseCorpusDir), 'present');
    if (base !== null && base.survived <= 2) {
      // STATE (c): GATE-STOP path (prereg) — the matched-band
      // baseline did not reproduce far-end health; the run STOPPED,
      // no subject leg was cut.
      T.ok('baseline leg read <=2/8 survived (gate FAILED — STOP)', base.survived <= 2, 'survived=' + base.survived);
      T.ok('NO subject step summary exists (STOP — no subject leg cut)', !fs.existsSync(sumPath), 'absent');
      T.ok('NO subject driver log exists', !fs.existsSync(logPath), 'absent');
      T.ok('NO subject per-seed corpus exists', !fs.existsSync(corpusDir), 'absent');
      T.ok('evidence file exists and records the STOP (UNMEASURED, baseline gate)',
        ev10 !== '' && ev10.indexOf('UNMEASURED') !== -1, 'UNMEASURED present');
      T.ok('evidence file records the baseline survived count',
        ev10.indexOf('survived ' + base.survived + '/8') !== -1, 'survived ' + base.survived + '/8 present');
    } else {
      // STATE (b): INTERMEDIATE — baseline healthy (>=3/8), subject
      // leg pending. This branch PASSES without touching sumPath.
      T.ok('baseline leg read >=3/8 survived (gate holds)', base !== null && base.survived >= 3, base === null ? 'null' : 'survived=' + base.survived);
      T.ok('INTERMEDIATE: NO subject step summary exists yet (subject leg pending)', !fs.existsSync(sumPath), 'absent');
      T.ok('INTERMEDIATE: NO subject driver log exists yet', !fs.existsSync(logPath), 'absent');
      T.ok('INTERMEDIATE: NO subject per-seed corpus exists yet', !fs.existsSync(corpusDir), 'absent');
      T.ok('INTERMEDIATE: no subject verdict recorded yet (evidence does not judge a leg that has not run)',
        ev10 === '' || ev10.indexOf('t8fam') === -1 || ev10.indexOf('NOT-CARRIER') === -1, ev10 === '' ? '(evidence not written yet)' : 'no premature verdict');
    }
  } else if (baseExists && subExists) {
    // STATE (d): both legs ran — the final state. Both reads are
    // guarded by the existsSync checks in THIS branch's condition.
    const base = readJsonIfExists(baseSumPath);
    const sub = readJsonIfExists(sumPath);
    T.ok('baseline step summary exists (ep-far-8fam)', base !== null, 'present');
    T.ok('subject step summary exists (t8fam)', sub !== null, 'present');
    const baseSeeds = base !== null ? (base.perSeed || []).map(function (p) { return p.seed; }) : [];
    T.ok('baseline leg ran exactly the matched band 190391-190398',
      JSON.stringify(baseSeeds) === JSON.stringify(SEEDS), JSON.stringify(baseSeeds));
    T.ok('baseline leg read >=3/8 survived (gate holds)', base !== null && base.survived >= 3, base === null ? 'null' : 'survived=' + base.survived);
    T.ok('subject summary carries a survived count 0..8', sub !== null && typeof sub.survived === 'number' && sub.survived >= 0 && sub.survived <= 8, sub === null ? 'null' : 'survived=' + sub.survived);
    const subSeeds = sub !== null ? (sub.perSeed || []).map(function (p) { return p.seed; }) : [];
    T.ok('subject leg ran exactly the matched band 190391-190398',
      JSON.stringify(subSeeds) === JSON.stringify(SEEDS), JSON.stringify(subSeeds));
    const verdict = (base !== null && base.survived >= 3 && sub !== null) ? classifyTransplant(sub.survived) : 'UNCLASSIFIABLE';
    T.ok('subject summary verdict maps from the survived count (' + verdict + ')',
      verdict === 'CARRIER' || verdict === 'AMBIGUOUS' || verdict === 'NOT-CARRIER', verdict);
    T.ok('baseline driver log exists', fs.existsSync(baseLogPath), 'present');
    T.ok('baseline per-seed corpus exists', fs.existsSync(baseCorpusDir), 'present');
    T.ok('subject driver log exists', fs.existsSync(logPath), 'present');
    T.ok('subject per-seed corpus exists', fs.existsSync(corpusDir), 'present');
    T.ok('evidence file exists and records the subject verdict ' + verdict,
      ev10 !== '' && ev10.indexOf(verdict) !== -1, verdict + ' present');
    T.ok('evidence file records the subject survived count',
      ev10 !== '' && sub !== null && ev10.indexOf('survived ' + sub.survived + '/8') !== -1, sub === null ? 'null' : 'survived ' + sub.survived + '/8 present');
    T.ok('evidence file records the baseline survived count',
      ev10 !== '' && base !== null && ev10.indexOf('survived ' + base.survived + '/8') !== -1, base === null ? 'null' : 'baseline survived ' + base.survived + '/8 present');
    T.ok('evidence file records the family-test leg (#4 proof)',
      ev10.indexOf('test-live-thread-engage-dry-20261108') !== -1, '#4 proof named');
    T.ok('evidence file carries a metric-review section (§14)',
      ev10.indexOf('Metric review') !== -1, 'metric review present');
  } else {
    // STATE (e): subject summary without a baseline summary — can
    // never happen under the measurement plan (baseline leg runs
    // first). Fail loudly rather than judging.
    T.ok('subject summary exists WITHOUT a baseline summary (impossible state — FAIL LOUDLY)', false, 'subExists=' + subExists + ' baseExists=' + baseExists);
  }

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
