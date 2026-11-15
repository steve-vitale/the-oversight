// test-transplant6b.js — proof test for the H1 TRANSPLANT, narrowed
// family 6b (arm sim-transplant6b-a).
//
// THE QUESTION (evidence/2026-11-15/sim-transplant6b-prereg.md,
// committed before cutting the subject or running any judged sim):
// land origin family 6's OBJECTIVES-SIDE HALF — narrowed family 6b,
// the seven src/js/villager-objectives.js hunks of merge f843fab1c
// (PR #33 dawn-midday-repick, OVE-38 Candidate B, seam 9) + the new
// test file + the green-list union line — onto the far end 203a32775
// (GOOD 4/8 on the matched band) and measure whether it alone
// collapses it. Verdicts (fresh thresholds, matched band 190391-
// 190398, REUSED BY DESIGN): baseline leg must read >=3/8 or the run
// stops; <=1/8 CARRIER, 2/8 AMBIGUOUS (re-run once; 2/8 again ->
// recorded AMBIGUOUS, treated as NOT-CARRIER for ordering, kept on
// the suspect list), >=3/8 NOT-CARRIER.
//
// PREDICTED OUTCOME — MEASURABLE: the filtered objectives patch
// applies cleanly to the far end with ZERO conflicts, because the
// hunks are marker-free in the full-family merge-tree output. The
// live `git apply` is the authority — ANY conflict in the objectives
// patch fires the conflict-STOP rule (UNMEASURED, no hand-resolution,
// no silent hunk-drop). The green-list union is the ONLY carve-out.
//
// WHAT THIS TEST PROVES:
//   1. Family identity — merge f843fab1c, its parents, the 1-commit
//      second-parent side, the exact 2 src/js files (+47/-1
//      villager-brain.js, +63/-8 villager-objectives.js), +347/-12
//      total over 5 files, no policy file, no standing.js, far-end
//      standing 75762cb2, fix f8fda429, far-end policy a7ff5c51,
//      test file absent at far end AND first parent, present at the
//      merge (blob 70409952), merge NOT an ancestor of the far end,
//      IS an ancestor of master HEAD, villager-brain.js ABSENT at
//      the far end and PRESENT at the first parent (the DU).
//   2. Narrowed definition — the family diff has EXACTLY 7
//      objectives hunks + 6 brain hunks + 4 ONTOLOGY hunks + the
//      green-list hunk + the test-file add; the 6b set is exactly
//      the 7 objectives hunks (named by header); the excluded brain
//      and ONTOLOGY hunks are named exactly; the 6b set + excluded
//      set partition the family hunks exactly.
//   3. Merge-tree prediction (read-only) — objectives marker-free
//      (0 markers); ALL 9 markers confined to ONTOLOGY 2 blocks (6)
//      + green-list 1 block (3); the test file is 'added in remote'
//      (clean addition); villager-brain.js is 'removed in local'
//      (DU, missing substrate — the full-family stop, excluded here).
//   4. Mechanism analysis — `vbrainOwnsDawn` / `vbrainShouldRefresh`
//      / `vbrainMarkPerception` are ABSENT from every src/js file at
//      the far end (git grep); the objRefreshPick guard short-
//      circuits on its first typeof test, so objRefreshPick falls
//      through to objPick (objRefreshPick === objPick on this
//      substrate); objNeedsEmergencyPick is defined in the family
//      but its only caller is the dead guard; the monster-sighting
//      vbrainMarkPerception calls are typeof-guarded; the { dawn:
//      true } opts object is ignored by objPick (vid, hx, hy).
//   5. Green-list union — only scripts/check.js reads
//      green-list.txt; ZERO src/js references; the far-end file has
//      ZERO occurrences of the new line; the union neighbors
//      (test-village-smoke-20261011.js above,
//      test-villager-gear-20261009.js below) are present at the far
//      end; the two family-7 lines are NOT part of the union.
//   6. Conflict-STOP rule + verdict mapping — conflictStopVerdict
//      maps the filtered-patch application: no conflict ->
//      MEASURABLE, green-list-only -> UNION (the authorized
//      carve-out), ANY other conflict -> UNMEASURED (no
//      hand-resolution, no hunk-drop); classifyTransplant maps
//      every survived count to CARRIER / AMBIGUOUS / NOT-CARRIER /
//      UNCLASSIFIABLE; the baseline gate (>=3/8 or STOP) maps to
//      the GATE-STOP branch.
//   7. Base state — HEAD is on sim-transplant6b-a in the worktree
//      (or master at the merged tip — branch-identity legs are
//      worktree-aware per the 0215 coordinator note, so the proof
//      stays green on master), no src/js file differs from HEAD,
//      on-disk standing.js is byte-identical to HEAD, and the
//      step-script tooling source (master) still carries all four
//      scratch files.
//   8. Seed-band identity — the prereg names the MATCHED band
//      190391-190398, REUSED BY DESIGN (88 prereg files reference
//      it), the STEP id t6b-f843fab1c, the baseline STEP id
//      ep-far-6b, the subject branch transplant-6b-subject, and the
//      step script + analyzer used as-is (matched band hardcoded,
//      no /tmp copies needed, unlike 8c's fresh band).
//   9. Live subject state — state-aware: before the subject is
//      cut it asserts the subject branch does NOT exist yet
//      (prereg preceded the subject); once it exists it asserts
//      the branch's parent is the far end, the subject diff is
//      exactly the 6b set (objectives +63/-8 byte-identical
//      added/removed lines, test file blob-identical, green-list
//      +1/-0 the one union line), NO brain/ONTOLOGY content, the
//      6b strings ARE present, subject policy == far-end policy,
//      subject native standing == far-end standing.
//  10. Step corpora — state-aware: before the steps run it
//      asserts no ep-far-6b / t6b-f843fab1c summary, log, or corpus
//      exists; once they exist it asserts the settled matched-band
//      baseline (4/8, fixed days) still anchors the far end, the
//      baseline leg read >=3/8 on seeds 190391-190398, the subject
//      summary exists with a survived count on the same seeds, and
//      the evidence file records the matching verdict. On the
//      GATE-STOP path (baseline <=2/8 — the prereg gate fired)
//      it instead asserts the STOP state: baseline summary exists
//      with survived <=2, NO subject summary/log/corpus exists (no
//      subject leg was cut), and the evidence file records the
//      UNMEASURED stop with the baseline count.
//
// Usage: node scripts/test-transplant6b.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant6b');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const MERGE = 'f843fab1c';
const MERGE_FULL = 'f843fab1cb6b81bf5574263db2f95e7439e67ef8';
const MERGE_BASE = '230dba219';
const MERGE_BASE_FULL = '230dba21979bec1fb933cf646ba982de3c60ee33';
const SECOND_FULL = '713c96f12b97c1ffbcddb3197d187640ecc5cd69';
const SUBJECT_BRANCH = 'transplant-6b-subject';
const STEP = 't6b-f843fab1c';
const BASELINE_STEP = 'ep-far-6b';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const EXPECTED_BASELINE_DAYS = [86, 144, 150, 43, 150, 87, 150, 150];
const EXPECTED_JS = [
  'src/js/villager-brain.js', 'src/js/villager-objectives.js',
];
const EXPECTED_FILES = [
  'docs/ONTOLOGY.md',
  'scripts/green-list.txt',
  'scripts/test-dawn-midday-repick.js',
  'src/js/villager-brain.js',
  'src/js/villager-objectives.js',
];
// Family-diff hunk headers (first-parent numbering), per file.
const FAMILY_HUNKS = {
  'src/js/villager-objectives.js': [
    '@@ -5,6 +5,8 @@',
    '@@ -15,6 +17,7 @@',
    '@@ -264,6 +267,44 @@',
    '@@ -708,12 +749,24 @@',
    '@@ -1141,12 +1194,13 @@',
    '@@ -1435,7 +1489,9 @@',
    '@@ -1449,10 +1505,9 @@',
  ],
  'src/js/villager-brain.js': [
    '@@ -7,6 +7,8 @@',
    '@@ -17,6 +19,7 @@',
    '@@ -34,6 +37,8 @@',
    '@@ -59,13 +64,26 @@',
    '@@ -290,6 +308,8 @@',
    '@@ -302,6 +322,32 @@',
  ],
  'docs/ONTOLOGY.md': [
    '@@ -944,7 +944,7 @@ Godhood capstones — Steve 2026-10-11, requirements reworked',
    '@@ -1984,7 +1984,7 @@ Villager AI. Villagers act on their own with goals and routines.',
    '@@ -1992,6 +1992,7 @@ One dawn scoring entry for Haven villagers — candidates feed, one pass picks,',
    '@@ -2040,10 +2041,11 @@ Villager map memory + cross-node objectives. Villagers remember resource sites o',
  ],
};
// The 6b set: the ONLY hunks in this arm's subject (objectives).
const HUNKS_6B = FAMILY_HUNKS['src/js/villager-objectives.js'];
// Excluded brain hunks (named here to prove 6b excludes all of it).
const EXCLUDED_BRAIN = FAMILY_HUNKS['src/js/villager-brain.js'];
// Excluded ONTOLOGY hunks.
const EXCLUDED_ONTOLOGY = FAMILY_HUNKS['docs/ONTOLOGY.md'];
// Marker counts from the merge-tree dry run, per 'changed in both' file
// (transplant118 counting method: +<<<<<<<, +=======, +>>>>>>>).
const EXPECTED_MARKERS = {
  'docs/ONTOLOGY.md': 6,
  'scripts/green-list.txt': 3,
  'src/js/villager-objectives.js': 0,
};
// The one file the far end and the first parent both lack, added
// cleanly by the pick (part of the 6b subject — named for the
// family-identity + subject legs).
const ADDED_CLEAN = 'scripts/test-dawn-midday-repick.js';
const ADDED_BLOB = '704099528097003fe0b61da18a6a6dbe318ba3b0';
// 6b strings that must be PRESENT in the subject.
const INCLUDED_STRINGS = [
  { file: 'src/js/villager-objectives.js', s: 'objRefreshPick(vid, hx, hy, opts) {' },
  { file: 'src/js/villager-objectives.js', s: 'objNeedsEmergencyPick(vid) {' },
  { file: 'src/js/villager-objectives.js', s: 'midday_repick_event_only' },
  { file: 'src/js/villager-objectives.js', s: "this.vbrainMarkPerception(vid, 'monster_sighting')" },
  { file: 'src/js/villager-objectives.js', s: 'this.objRefreshPick(rid, hx, hy, { dawn: true })' },
  { file: 'src/js/villager-objectives.js', s: 'this.objRefreshPick(rid, hx, hy);' },
];
// Brain/ONTOLOGY strings that must be ABSENT from the subject (they
// live only in the excluded files): the brain-method DEFINITIONS and
// the ONTOLOGY brain section.
const EXCLUDED_STRINGS = [
  { file: 'src/js/villager-objectives.js', s: 'vbrainShouldRefresh(vid, opts) {' },
  { file: 'src/js/villager-objectives.js', s: 'vbrainMarkPerception(vid, reason) {' },
];
// The green-list union line (the ONLY authorized carve-out) and its
// far-end neighbors (the union position).
const UNION_LINE = 'scripts/test-dawn-midday-repick.js quick';
const UNION_ABOVE = 'scripts/test-village-smoke-20261011.js';
const UNION_BELOW = 'scripts/test-villager-gear-20261009.js';
// Family-7 lines that must NOT be added by the union.
const FAMILY7_LINES = [
  'scripts/test-villager-brain-dawn.js quick',
  'scripts/test-dawn-materialize-honesty.js quick',
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
// the objectives patch is pre-filtered to the 6b hunks, so ANY
// conflict in it is beyond the family definition: STOP, UNMEASURED,
// no hand-resolution, no silent hunk-drop. The green-list union is
// the ONLY carve-out: a green-list-only conflict resolves by union.
function conflictStopVerdict(files) {
  if (!Array.isArray(files)) return 'UNCLASSIFIABLE';
  if (files.length === 0) return 'MEASURABLE';
  if (files.length === 1 && files[0] === 'scripts/green-list.txt') return 'UNION';
  return 'UNMEASURED';
}
// baselineGateVerdict(n): the prereg baseline gate — proceed only if
// the baseline leg reads >=3/8.
function baselineGateVerdict(n) {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 8) return 'UNCLASSIFIABLE';
  return n >= 3 ? 'PROCEED' : 'GATE-STOP';
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
// gitGrepAt(commit, pattern): true iff `git grep -l pattern commit --
// src/js/` finds any file (pattern is a fixed string, -F).
function gitGrepAt(commit, pattern) {
  try {
    const out = execSync('git grep -l -F -- ' + JSON.stringify(pattern) + ' ' + commit + ' -- src/js/',
      { cwd: REPO, stdio: 'pipe' }).toString('utf8').trim();
    return out !== '';
  } catch (e) { return false; }
}

(async () => {
  // ---- 1. Family identity ----
  T.section('1. Family identity — PR #33 merge f843fab1c');
  T.ok('merge commit exists', git('rev-parse ' + MERGE) === MERGE_FULL, git('log -1 --format=%s ' + MERGE).slice(0, 80));
  T.ok('first parent is 230dba219 (origin/master #31 merge into OVE-37 port)', git('rev-parse ' + MERGE + '^1') === MERGE_BASE_FULL, git('log -1 --format=%h\\ %s ' + MERGE + '^1').slice(0, 80));
  T.ok('second parent is 713c96f12 (demote mid-day idle objPick without perception)', git('rev-parse ' + MERGE + '^2') === SECOND_FULL, git('log -1 --format=%h\\ %s ' + MERGE + '^2').slice(0, 80));
  const sideCount = parseInt(git('rev-list --count ' + MERGE + '^1..' + MERGE + '^2'), 10);
  T.ok('second-parent side is 1 commit', sideCount === 1, 'count=' + sideCount);
  const jsFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- src/js').split('\n').sort();
  T.ok('family touches exactly the 2 expected src/js files', JSON.stringify(jsFiles) === JSON.stringify(EXPECTED_JS.slice().sort()), jsFiles.join(', '));
  const brainStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/js/villager-brain.js');
  const objStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/js/villager-objectives.js');
  T.ok('villager-brain.js is 47+/1-', brainStat === '47\t1\tsrc/js/villager-brain.js', brainStat);
  T.ok('villager-objectives.js is 63+/8-', objStat === '63\t8\tsrc/js/villager-objectives.js', objStat);
  const allFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE).split('\n').sort();
  T.ok('family file list is exactly the 5 expected files', JSON.stringify(allFiles) === JSON.stringify(EXPECTED_FILES.slice().sort()), allFiles.join(', '));
  const tot = git('diff --numstat ' + MERGE + '^1 ' + MERGE).split('\n')
    .reduce(function (acc, line) { const p = line.split('\t'); const ins = parseInt(p[0], 10), del = parseInt(p[1], 10); return { ins: acc.ins + (Number.isFinite(ins) ? ins : 0), del: acc.del + (Number.isFinite(del) ? del : 0) }; }, { ins: 0, del: 0 });
  T.ok('family total delta is +347/-12', tot.ins === 347 && tot.del === 12, '+' + tot.ins + '/-' + tot.del);
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
  T.ok('test file is PRESENT at the merge (blob 70409952...)',
    git('ls-tree ' + MERGE + ' -- ' + ADDED_CLEAN).indexOf(ADDED_BLOB) !== -1, 'blob 70409952');
  T.ok('villager-brain.js is ABSENT at the far end (ls-tree empty — the DU substrate)',
    git('ls-tree ' + FAR + ' -- src/js/villager-brain.js') === '', '(absent)');
  T.ok('villager-brain.js is PRESENT at the first parent (blob 2f99c9e5...)',
    git('ls-tree ' + MERGE_BASE + ' -- src/js/villager-brain.js').indexOf('2f99c9e5') !== -1, 'blob 2f99c9e5');
  T.ok('merge f843fab1c is NOT an ancestor of the far end (family is origin-side)',
    !isAncestor(MERGE, FAR), 'not ancestor');
  T.ok('merge f843fab1c IS an ancestor of master HEAD (origin line merged to master)',
    isAncestor(MERGE, 'HEAD'), 'ancestor of HEAD');

  // ---- 2. Narrowed definition ----
  T.section('2. Narrowed definition — hunk inventory, 6b is exactly the 7 objectives hunks');
  for (const f of Object.keys(FAMILY_HUNKS)) {
    const got = familyHunks(f);
    T.ok(f + ' has exactly the expected family hunks (' + FAMILY_HUNKS[f].length + ')',
      JSON.stringify(got) === JSON.stringify(FAMILY_HUNKS[f]), got.join(' | '));
  }
  const famDiffObj = execSync('git diff ' + MERGE + '^1 ' + MERGE + ' -- src/js/villager-objectives.js',
    { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  const h6b = hunkLines(famDiffObj, HUNKS_6B);
  T.ok('the 6b hunks are exactly +63/-8', h6b.added.length === 63 && h6b.removed.length === 8,
    '+' + h6b.added.length + '/-' + h6b.removed.length);
  T.ok('the 6b hunks add objRefreshPick + objNeedsEmergencyPick (definitions)',
    h6b.added.some(function (l) { return l.indexOf('objRefreshPick(vid, hx, hy, opts) {') !== -1; }) &&
    h6b.added.some(function (l) { return l.indexOf('objNeedsEmergencyPick(vid) {') !== -1; }),
    '2/2 methods present');
  T.ok('the 6b hunks switch all three mid-day call sites to objRefreshPick',
    h6b.added.filter(function (l) { return l.indexOf('objRefreshPick(rid, hx, hy') !== -1; }).length === 3,
    '3/3 call sites present');
  T.ok('the 6b hunks add the monster_sighting perception marks (2 sites)',
    h6b.added.filter(function (l) { return l.indexOf("vbrainMarkPerception(vid, 'monster_sighting')") !== -1; }).length === 2,
    '2/2 marks present');
  T.ok('the 6b hunks add the midday_repick_event_only rule line',
    h6b.added.some(function (l) { return l.indexOf('midday_repick_event_only') !== -1; }),
    'rule line present');
  T.ok('the 6b hunks remove exactly the three direct objPick call sites',
    h6b.removed.filter(function (l) { return l.indexOf('this.objPick(rid, hx, hy);') !== -1; }).length === 3,
    '3/3 removed objPick calls');
  for (const h of EXCLUDED_BRAIN) {
    T.ok('excluded brain hunk present in family diff: ' + h,
      FAMILY_HUNKS['src/js/villager-brain.js'].indexOf(h) !== -1, h);
  }
  for (const h of EXCLUDED_ONTOLOGY) {
    T.ok('excluded ONTOLOGY hunk present in family diff: ' + h,
      FAMILY_HUNKS['docs/ONTOLOGY.md'].indexOf(h) !== -1, h);
  }
  const greenStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- scripts/green-list.txt');
  T.ok('green-list hunk is exactly +1/-0 (the one union line)', greenStat === '1\t0\tscripts/green-list.txt', greenStat);
  const testStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- ' + ADDED_CLEAN);
  T.ok('test file is exactly +231/-0 (new file)', testStat === '231\t0\t' + ADDED_CLEAN, testStat);
  const preregPath = path.join(REPO, 'evidence', '2026-11-15', 'sim-transplant6b-prereg.md');
  const prereg = fs.existsSync(preregPath) ? fs.readFileSync(preregPath, 'utf8') : '';
  T.ok('6b prereg file exists', prereg !== '', preregPath);
  T.ok('prereg names the seven objectives hunk headers',
    prereg.indexOf('@@ -264,6 +267,44 @@') !== -1 && prereg.indexOf('@@ -1449,10 +1505,9 @@') !== -1, 'hunk anchors present');
  T.ok('prereg states the 6b set is +63/-8, test file +231, green-list +1/-0',
    prereg.indexOf('+63') !== -1 && prereg.indexOf('+231') !== -1, 'deltas present');
  T.ok('prereg names the excluded brain + ONTOLOGY content',
    prereg.indexOf('EXCLUDED: `src/js/villager-brain.js`') !== -1 && prereg.indexOf('docs/ONTOLOGY.md') !== -1, 'exclusion present');
  T.ok('prereg records the predicted outcome MEASURABLE (clean apply)',
    prereg.indexOf('PREDICTED OUTCOME — MEASURABLE') !== -1, 'predicted outcome present');
  T.ok('prereg records the conflict-STOP rule (any objectives conflict -> UNMEASURED, no hand-resolve)',
    prereg.indexOf('Conflict-STOP rule') !== -1 && prereg.indexOf('UNMEASURED') !== -1 && prereg.indexOf('do NOT hand-resolve') !== -1, 'STOP rule present');
  T.ok('prereg records the mechanism analysis (gate dead on far-end substrate; objRefreshPick === objPick)',
    prereg.indexOf('objRefreshPick ≡ objPick') !== -1 && prereg.indexOf('DEAD on this substrate') !== -1, 'mechanism present');
  T.ok('prereg records the green-list union carve-out (family-2b precedent)',
    prereg.indexOf('Green-list union') !== -1 && prereg.indexOf('family-2b precedent') !== -1, 'union present');

  // ---- 3. Merge-tree prediction ----
  T.section('3. Merge-tree prediction — objectives marker-free, all markers in ONTOLOGY + green-list');
  const mt = mergeTreeConflicts();
  let mtOk = true, mtBad = null;
  for (const f of Object.keys(EXPECTED_MARKERS)) {
    if (mt.found[f] !== EXPECTED_MARKERS[f]) { mtOk = false; mtBad = f + ' (got ' + mt.found[f] + ', want ' + EXPECTED_MARKERS[f] + ')'; break; }
  }
  T.ok('merge-tree reports the same marker counts per changed-in-both file', mtOk, mtBad || '3/3 match');
  T.ok('merge-tree reports exactly THREE changed-in-both files', Object.keys(mt.found).length === 3, 'sections=' + Object.keys(mt.found).length + ': ' + Object.keys(mt.found).join(', '));
  const conflicted = Object.keys(mt.found).filter(function (f) { return mt.found[f] > 0; }).sort();
  T.ok('merge-tree reports exactly TWO content-conflicted files', conflicted.length === 2, 'conflicted=' + conflicted.join(', '));
  T.ok('the conflicted files are ONTOLOGY.md + green-list.txt (both excluded from 6b)',
    JSON.stringify(conflicted) === JSON.stringify(['docs/ONTOLOGY.md', 'scripts/green-list.txt']), conflicted.join(', '));
  T.ok('merge-tree reports NO merged sections (nothing merges cleanly in the changed files)',
    Object.keys(mt.merged).length === 0, 'merged=' + Object.keys(mt.merged).join(', ') || '(none)');
  T.ok('merge-tree reports the villager-brain.js delete/modify (removed in local — the DU)',
    mt.raw.indexOf('removed in local') !== -1 && mt.raw.indexOf('src/js/villager-brain.js') !== -1, 'DU present');
  T.ok("raw merge-tree output carries the 'added in remote' test-file section (clean addition)",
    mt.raw.indexOf('added in remote') !== -1 && mt.raw.indexOf(ADDED_CLEAN) !== -1 && mt.raw.indexOf(ADDED_BLOB) !== -1, 'added in remote present');
  T.ok('objectives section carries ZERO markers (the 6b hunks auto-merge)',
    markersBetween(mt.raw, 'src/js/villager-objectives.js', null) === 0, 'markers=0');
  T.ok('ONTOLOGY section carries exactly 6 markers (2 blocks)',
    mt.found['docs/ONTOLOGY.md'] === 6, 'markers=6');
  T.ok('green-list section carries exactly 3 markers (1 block, ours empty)',
    mt.found['scripts/green-list.txt'] === 3, 'markers=3');
  T.ok('total markers in the full-family merge-tree output is 9 (3 blocks x 3)',
    countOccurrences(mt.raw, '+<<<<<<<') + countOccurrences(mt.raw, '+=======') + countOccurrences(mt.raw, '+>>>>>>>') === 9, 'markers=9');

  // ---- 4. Mechanism analysis ----
  T.section('4. Mechanism analysis — what the 6b hunks can and cannot do alone');
  T.ok('vbrainOwnsDawn is ABSENT from every src/js file at the far end (git grep)',
    !gitGrepAt(FAR, 'vbrainOwnsDawn'), 'absent at far end');
  T.ok('vbrainShouldRefresh is ABSENT from every src/js file at the far end (git grep)',
    !gitGrepAt(FAR, 'vbrainShouldRefresh'), 'absent at far end');
  T.ok('vbrainMarkPerception is ABSENT from every src/js file at the far end (git grep)',
    !gitGrepAt(FAR, 'vbrainMarkPerception'), 'absent at far end');
  T.ok('vbrainOwnsDawn IS present at the merge (origin line has the brain module)',
    gitGrepAt(MERGE, 'vbrainOwnsDawn'), 'present at merge');
  T.ok('vbrainShouldRefresh IS present at the merge',
    gitGrepAt(MERGE, 'vbrainShouldRefresh'), 'present at merge');
  const farObj = gitShow(FAR, 'src/js/villager-objectives.js');
  const mergeObj = gitShow(MERGE, 'src/js/villager-objectives.js');
  T.ok('the far-end objPick takes (vid, hx, hy) and ignores extra opts (call-site { dawn: true } is inert)',
    /objPick\(vid, hx, hy\)/.test(farObj), 'objPick(vid, hx, hy) present');
  T.ok('the far end has NO objRefreshPick (the method is new in the family)',
    farObj.indexOf('objRefreshPick') === -1, 'method absent at far end');
  T.ok('the far end has NO objNeedsEmergencyPick (the method is new in the family)',
    farObj.indexOf('objNeedsEmergencyPick') === -1, 'method absent at far end');
  T.ok('the merge objRefreshPick guard short-circuits on the first typeof test (vbrainOwnsDawn)',
    mergeObj.indexOf("typeof this.vbrainOwnsDawn === 'function'") !== -1, 'guard present at merge');
  T.ok('the merge objRefreshPick falls through to objPick when the guard fails',
    mergeObj.indexOf('return this.objPick(vid, hx, hy);') !== -1, 'fall-through present at merge');
  T.ok('objNeedsEmergencyPick is called ONLY from inside the objRefreshPick guard (dead on far-end substrate)',
    (function () {
      const calls = mergeObj.split('\n').filter(function (l) {
        return l.indexOf('objNeedsEmergencyPick(vid)') !== -1 && l.trim().indexOf('//') !== 0;
      });
      return calls.length === 2 && calls.some(function (l) { return l.indexOf('objNeedsEmergencyPick(vid) {') !== -1; }) &&
        calls.some(function (l) { return l.indexOf('!this.objNeedsEmergencyPick(vid)') !== -1; });
    })(), 'definition + 1 guarded call only (header comment excluded)');
  T.ok('the monster_sighting marks are typeof-guarded (no-op without the method)',
    mergeObj.indexOf("typeof this.vbrainMarkPerception === 'function'") !== -1, 'typeof guard present');
  T.ok('the far-end call sites call objPick directly (the three sites 6b switches)',
    (farObj.match(/this\.objPick\(rid, hx, hy\);/g) || []).length === 3, '3/3 direct objPick calls at far end');

  // ---- 5. Green-list union ----
  T.section('5. Green-list union — readers, far-end absence, union position');
  const checkJs = fs.readFileSync(path.join(REPO, 'scripts', 'check.js'), 'utf8');
  T.ok('scripts/check.js reads green-list.txt via readList (the only code reader)',
    checkJs.indexOf("readList('scripts/green-list.txt')") !== -1, 'reader present');
  T.ok('ZERO src/js files reference green-list.txt',
    (function () {
      try {
        const out = execSync('grep -rn "green-list" src/js/ || true', { cwd: REPO, stdio: 'pipe' }).toString('utf8').trim();
        return out === '';
      } catch (e) { return false; }
    })(), 'no src/js references');
  const farGreen = gitShow(FAR, 'scripts/green-list.txt');
  T.ok('far-end green-list contains ZERO occurrences of the union line',
    countOccurrences(farGreen, UNION_LINE) === 0, 'absent at far end');
  T.ok('far-end green-list contains the union-above neighbor (test-village-smoke-20261011.js)',
    farGreen.indexOf(UNION_ABOVE) !== -1, 'neighbor above present');
  T.ok('far-end green-list contains the union-below neighbor (test-villager-gear-20261009.js)',
    farGreen.indexOf(UNION_BELOW) !== -1, 'neighbor below present');
  T.ok('the union-above neighbor immediately precedes the union-below neighbor at the far end (insertion point)',
    (function () {
      const lines = farGreen.split('\n');
      const i = lines.indexOf(UNION_ABOVE);
      return i !== -1 && lines[i + 1] === UNION_BELOW;
    })(), 'adjacent at far end');
  const mergeGreen = gitShow(MERGE, 'scripts/green-list.txt');
  T.ok('merge green-list contains the union line exactly once',
    countOccurrences(mergeGreen, UNION_LINE) === 1, 'present once at merge');
  for (const l of FAMILY7_LINES) {
    T.ok('family-7 line is NOT part of the 6b union: ' + l,
      farGreen.indexOf(l) === -1, 'absent at far end (family 7, excluded)');
  }

  // ---- 6. Conflict-STOP rule + verdict mapping ----
  T.section('6. Conflict-STOP rule + verdict mapping');
  T.ok('conflictStopVerdict: no conflict -> MEASURABLE', conflictStopVerdict([]) === 'MEASURABLE', conflictStopVerdict([]));
  T.ok('conflictStopVerdict: green-list-only conflict -> UNION (the authorized carve-out)',
    conflictStopVerdict(['scripts/green-list.txt']) === 'UNION', conflictStopVerdict(['scripts/green-list.txt']));
  T.ok('conflictStopVerdict: any game-code conflict -> UNMEASURED (no hand-resolve, no hunk-drop)',
    conflictStopVerdict(['src/js/villager-objectives.js']) === 'UNMEASURED', conflictStopVerdict(['src/js/villager-objectives.js']));
  T.ok('conflictStopVerdict: green-list + anything else -> UNMEASURED',
    conflictStopVerdict(['scripts/green-list.txt', 'docs/ONTOLOGY.md']) === 'UNMEASURED', conflictStopVerdict(['scripts/green-list.txt', 'docs/ONTOLOGY.md']));
  T.ok('conflictStopVerdict: non-array input -> UNCLASSIFIABLE', conflictStopVerdict(null) === 'UNCLASSIFIABLE', conflictStopVerdict(null));
  const table = [[0, 'CARRIER'], [1, 'CARRIER'], [2, 'AMBIGUOUS'], [3, 'NOT-CARRIER'], [4, 'NOT-CARRIER'], [8, 'NOT-CARRIER'], [-1, 'UNCLASSIFIABLE'], [9, 'UNCLASSIFIABLE'], [NaN, 'UNCLASSIFIABLE']];
  for (const pair of table) {
    T.ok('survived ' + pair[0] + ' -> ' + pair[1], classifyTransplant(pair[0]) === pair[1], classifyTransplant(pair[0]));
  }
  T.ok('baselineGateVerdict: baseline 4/8 -> PROCEED', baselineGateVerdict(4) === 'PROCEED', baselineGateVerdict(4));
  T.ok('baselineGateVerdict: baseline 3/8 -> PROCEED', baselineGateVerdict(3) === 'PROCEED', baselineGateVerdict(3));
  T.ok('baselineGateVerdict: baseline 2/8 -> GATE-STOP', baselineGateVerdict(2) === 'GATE-STOP', baselineGateVerdict(2));
  T.ok('baselineGateVerdict: baseline 1/8 -> GATE-STOP', baselineGateVerdict(1) === 'GATE-STOP', baselineGateVerdict(1));
  T.ok('baselineGateVerdict: non-number -> UNCLASSIFIABLE', baselineGateVerdict(null) === 'UNCLASSIFIABLE', baselineGateVerdict(null));

  // ---- 7. Base state ----
  T.section('7. Base state — arm branch, clean tree, no swap residue');
  const headBranch = git('rev-parse --abbrev-ref HEAD');
  T.ok('HEAD is on the arm branch sim-transplant6b-a (worktree) or master (merged tip)',
    headBranch === 'sim-transplant6b-a' || headBranch === 'master', 'HEAD=' + headBranch);
  if (headBranch === 'master') {
    T.ok('on master: the arm evidence file is present at HEAD (merged tip)',
      git('ls-tree HEAD -- evidence/2026-11-15/sim-transplant6b.md') !== '', 'merged');
    T.ok('on master: the arm proof test is present at HEAD (merged tip)',
      git('ls-tree HEAD -- scripts/test-transplant6b.js') !== '', 'merged');
    T.ok('on master: the subject branch still points at its subject commit (left in place)',
      (function () { try { return git('rev-parse ' + SUBJECT_BRANCH).length === 40; } catch (e) { return false; } })(), 'branch kept');
  }
  if (headBranch === 'sim-transplant6b-a') {
    T.ok('in the worktree: HEAD is on the arm branch sim-transplant6b-a', true, 'HEAD=sim-transplant6b-a');
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

  // ---- 8. Seed-band identity ----
  T.section('8. Seed-band identity — matched band 190391-190398, REUSED BY DESIGN');
  const stepSrc = fs.readFileSync(path.join(REPO, 'scripts', 'culpritbisect-step.sh'), 'utf8');
  T.ok('the committed step script hardcodes the matched band (run as-is, no /tmp copy)',
    stepSrc.indexOf('190391,190392,190393,190394,190395,190396,190397,190398') !== -1, 'matched-band literal present');
  T.ok('prereg names the matched band 190391-190398', prereg.indexOf('190391') !== -1 && prereg.indexOf('190398') !== -1, 'band in prereg');
  T.ok('prereg records the reuse verdict (REUSED BY DESIGN, not fresh)',
    prereg.indexOf('REUSED BY DESIGN') !== -1, 'reuse verdict present');
  T.ok('prereg records the freshness search scope + result (88 prereg files reference the band)',
    prereg.indexOf('88 prereg files') !== -1, 'search result present');
  T.ok('prereg names the STEP id t6b-f843fab1c', prereg.indexOf('t6b-f843fab1c') !== -1, 'STEP id present');
  T.ok('prereg names the baseline STEP id ep-far-6b', prereg.indexOf('ep-far-6b') !== -1, 'baseline STEP id present');
  T.ok('prereg names the subject branch transplant-6b-subject', prereg.indexOf('transplant-6b-subject') !== -1, 'branch name present');
  T.ok('prereg documents the step script + analyzer used as-is (matched band hardcoded)',
    prereg.indexOf('used as-is') !== -1 || prereg.indexOf('run AS-IS') !== -1, 'as-is mechanism present');
  T.ok('prereg names the baseline gate (>=3/8 or STOP)',
    prereg.indexOf('Gate: the baseline leg reads') !== -1, 'baseline gate present');

  // ---- 9. Live subject state (state-aware) ----
  T.section('9. Live subject state — transplant-6b-subject');
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
    T.ok('subject diff touches exactly the three 6b files (objectives + test file + green-list)',
      JSON.stringify(subjectFiles) === JSON.stringify(['scripts/green-list.txt', 'scripts/test-dawn-midday-repick.js', 'src/js/villager-objectives.js']), subjectFiles.join(', '));
    const subStat = git('diff --numstat ' + FAR + ' ' + SUBJECT_BRANCH + ' -- src/js/villager-objectives.js');
    T.ok('subject objectives diff is exactly +63/-8', subStat === '63\t8\tsrc/js/villager-objectives.js', subStat);
    const subDiff = execSync('git diff ' + FAR + ' ' + SUBJECT_BRANCH + ' -- src/js/villager-objectives.js',
      { cwd: REPO, stdio: 'pipe' }).toString('utf8');
    const subHeaders = subDiff.split('\n').filter(function (ln) { return ln.indexOf('@@ -') === 0; });
    T.ok('subject objectives diff carries exactly SEVEN hunks', subHeaders.length === 7, subHeaders.join(' | '));
    const subAll = hunkLines(subDiff, subHeaders);
    T.ok('subject added/removed lines are byte-identical to the family 6b hunks',
      JSON.stringify(h6b.added) === JSON.stringify(subAll.added) &&
      JSON.stringify(h6b.removed) === JSON.stringify(subAll.removed),
      'subject +' + subAll.added.length + '/-' + subAll.removed.length + ' vs family +' + h6b.added.length + '/-' + h6b.removed.length);
    T.ok('subject test file is byte-identical to the merge copy (blob 70409952...)',
      git('ls-tree ' + SUBJECT_BRANCH + ' -- ' + ADDED_CLEAN).indexOf(ADDED_BLOB) !== -1, 'blob 70409952');
    const subGreenStat = git('diff --numstat ' + FAR + ' ' + SUBJECT_BRANCH + ' -- scripts/green-list.txt');
    T.ok('subject green-list diff is exactly +1/-0 (the one union line)', subGreenStat === '1\t0\tscripts/green-list.txt', subGreenStat);
    const subGreen = gitShow(SUBJECT_BRANCH, 'scripts/green-list.txt');
    T.ok('subject green-list contains the union line exactly once',
      countOccurrences(subGreen, UNION_LINE) === 1, 'present once');
    T.ok('subject green-list contains NO family-7 line',
      FAMILY7_LINES.every(function (l) { return subGreen.indexOf(l) === -1; }), '0 family-7 lines');
    T.ok('subject green-list is the far-end file + the one union line (line-count check)',
      subGreen.split('\n').length === farGreen.split('\n').length + 1, 'lines +1');
    let incOk = true, incBad = null;
    for (const e of INCLUDED_STRINGS) {
      if (gitShow(SUBJECT_BRANCH, e.file).indexOf(e.s) === -1) { incOk = false; incBad = e.file + ': ' + e.s; break; }
    }
    T.ok('subject carries all 6b strings (refresh/emergency methods, rule, marks, call sites)', incOk, incBad || INCLUDED_STRINGS.length + '/' + INCLUDED_STRINGS.length);
    let excOk = true, excBad = null;
    for (const e of EXCLUDED_STRINGS) {
      if (gitShow(SUBJECT_BRANCH, e.file).indexOf(e.s) !== -1) { excOk = false; excBad = e.file + ': ' + e.s; break; }
    }
    T.ok('subject carries NONE of the excluded brain-method definitions', excOk, excBad ? 'present: ' + excBad : '0/' + EXCLUDED_STRINGS.length);
    T.ok('subject carries NO villager-brain.js file (excluded whole module)',
      git('ls-tree ' + SUBJECT_BRANCH + ' -- src/js/villager-brain.js') === '', '(absent)');
    T.ok('subject ONTOLOGY.md is byte-identical to the far end (excluded docs)',
      sha256(gitShow(SUBJECT_BRANCH, 'docs/ONTOLOGY.md')) === sha256(gitShow(FAR, 'docs/ONTOLOGY.md')), 'identical');
    const subPolicy = sha256(gitShow(SUBJECT_BRANCH, 'scripts/policies/competent.js'));
    T.ok('subject policy sha equals the far-end policy sha (no policy drift)', subPolicy === farPolicy, subPolicy.slice(0, 12));
    const subStanding = sha256(gitShow(SUBJECT_BRANCH, 'src/js/standing.js'));
    T.ok('subject native standing.js sha equals the far-end standing sha', subStanding === farStanding, subStanding.slice(0, 12));
    const evPath = path.join(REPO, 'evidence', '2026-11-15', 'sim-transplant6b.md');
    const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
    T.ok('evidence file records the subject commit hash (once the evidence file exists)',
      ev === '' || ev.indexOf(subject) !== -1, ev === '' ? '(evidence not written yet)' : 'subject hash present');
  }

  // ---- 10. Step corpora (state-aware) ----
  T.section('10. Step corpora — settled baseline + this run\'s matched-band legs');
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
  const evPath10 = path.join(REPO, 'evidence', '2026-11-15', 'sim-transplant6b.md');
  const ev10 = fs.existsSync(evPath10) ? fs.readFileSync(evPath10, 'utf8') : '';
  if (!fs.existsSync(baseSumPath) && !fs.existsSync(sumPath)) {
    T.ok('no baseline summary exists yet for ep-far-6b (no judged sim ran)', true, '(not run)');
    T.ok('no baseline driver log exists yet', !fs.existsSync(baseLogPath), 'absent');
    T.ok('no baseline per-seed corpus exists yet', !fs.existsSync(baseCorpusDir), 'absent');
    T.ok('no subject step summary exists yet', true, '(not run)');
    T.ok('no subject driver log exists yet', !fs.existsSync(logPath), 'absent');
    T.ok('no subject per-seed corpus exists yet', !fs.existsSync(corpusDir), 'absent');
  } else {
    T.ok('baseline step summary exists (ep-far-6b)', fs.existsSync(baseSumPath), 'present');
    const base = JSON.parse(fs.readFileSync(baseSumPath, 'utf8'));
    const baseSeeds = (base.perSeed || []).map(function (p) { return p.seed; });
    T.ok('baseline leg ran exactly the matched band 190391-190398',
      JSON.stringify(baseSeeds) === JSON.stringify(SEEDS), JSON.stringify(baseSeeds));
    T.ok('baseline driver log exists', fs.existsSync(baseLogPath), 'present');
    T.ok('baseline per-seed corpus exists', fs.existsSync(baseCorpusDir), 'present');
    if (base.survived <= 2 && !fs.existsSync(sumPath)) {
      // GATE-STOP path (prereg): the baseline did not reproduce
      // far-end health — the run STOPPED, no subject leg was cut.
      T.ok('baseline leg read <=2/8 survived (gate FAILED — STOP)', base.survived <= 2, 'survived=' + base.survived);
      T.ok('NO subject step summary exists (STOP — no subject leg cut)', !fs.existsSync(sumPath), 'absent');
      T.ok('NO subject driver log exists', !fs.existsSync(logPath), 'absent');
      T.ok('NO subject per-seed corpus exists', !fs.existsSync(corpusDir), 'absent');
      T.ok('evidence file exists and records the STOP (UNMEASURED, baseline gate)',
        ev10 !== '' && ev10.indexOf('UNMEASURED') !== -1, 'UNMEASURED present');
      T.ok('evidence file records the baseline survived count',
        ev10.indexOf('survived ' + base.survived + '/8') !== -1, 'survived ' + base.survived + '/8 present');
      T.ok('evidence file records the family-test leg (refresh script)',
        ev10.indexOf('test-transplant6b-refresh') !== -1, 'refresh leg present');
    } else {
      T.ok('baseline leg read >=3/8 survived (gate holds)', base.survived >= 3, 'survived=' + base.survived);
      T.ok('subject step summary exists', fs.existsSync(sumPath), 'present');
      const sub = JSON.parse(fs.readFileSync(sumPath, 'utf8'));
      T.ok('subject summary carries a survived count 0..8', typeof sub.survived === 'number' && sub.survived >= 0 && sub.survived <= 8, 'survived=' + sub.survived);
      const subSeeds = (sub.perSeed || []).map(function (p) { return p.seed; });
      T.ok('subject leg ran exactly the matched band 190391-190398',
        JSON.stringify(subSeeds) === JSON.stringify(SEEDS), JSON.stringify(subSeeds));
      const verdict = base.survived >= 3 ? classifyTransplant(sub.survived) : 'UNCLASSIFIABLE';
      T.ok('subject summary verdict maps from the survived count (' + verdict + ')',
        verdict === 'CARRIER' || verdict === 'AMBIGUOUS' || verdict === 'NOT-CARRIER', verdict);
      T.ok('subject driver log exists', fs.existsSync(logPath), 'present');
      T.ok('subject per-seed corpus exists', fs.existsSync(corpusDir), 'present');
      T.ok('evidence file exists and records the subject verdict ' + verdict,
        ev10 !== '' && ev10.indexOf(verdict) !== -1, verdict + ' present');
      T.ok('evidence file records the subject survived count',
        ev10.indexOf('survived ' + sub.survived + '/8') !== -1, 'survived ' + sub.survived + '/8 present');
      T.ok('evidence file records the baseline survived count',
        ev10.indexOf('survived ' + base.survived + '/8') !== -1, 'baseline survived ' + base.survived + '/8 present');
      T.ok('evidence file records the family-test leg (refresh script)',
        ev10.indexOf('test-transplant6b-refresh') !== -1, 'refresh leg present');
      // Expected NOT-CARRIER form (mechanism analysis): subject
      // trajectories bit-identical to baseline. Reported, not a
      // verdict input — a divergence is still NOT-CARRIER if >=3/8.
      const baseDays = (base.perSeed || []).map(function (p) { return p.days; });
      const subDays = (sub.perSeed || []).map(function (p) { return p.days; });
      T.ok('subject per-seed days are bit-identical to baseline (expected inert form)',
        JSON.stringify(baseDays) === JSON.stringify(subDays),
        'base ' + JSON.stringify(baseDays) + ' vs subject ' + JSON.stringify(subDays));
    }
  }

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
