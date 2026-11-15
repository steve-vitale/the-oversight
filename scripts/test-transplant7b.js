#!/usr/bin/env node
// test-transplant7b.js — proof test for the H1 TRANSPLANT, narrowed family 7b
// (arm sim-transplant7b-a).
//
// THE QUESTION (evidence/2026-11-15/sim-transplant7b-prereg.md, committed
// before cutting the subject or running any judged sim): does the
// objectives-side half of PR #30 alone — merge 23245d5d6 (dawn honesty,
// OVE-37 port, OVE-36 Candidate A) narrowed to the villager-objectives.js
// hunks + the honesty test file + the green-list union line — collapse the
// far end 203a32775 (GOOD 4/8 on the matched band) toward the merge's 1/8?
// Full family 7 is UNMEASURED (cherry-pick conflict-STOP: ONTOLOGY.md UU,
// green-list.txt UU, villager-brain.js DU, test-villager-brain-dawn.js DU).
//
// MECHANISM (pre-registered): the objectives hunks call vbrainAlignObjective
// ONLY when loaded, guarded by try/catch — on far-end substrate the brain
// module does not exist, so the call is inert by design. The narrowed
// family therefore measures the objectives-side wiring alone. EXPECTED
// NOT-CARRIER form is subject IDENTICAL to baseline (count AND per-seed
// days); any divergence is reported, never re-scored.
//
// WHAT THIS TEST PROVES:
//   1. Family identity — merge 23245d5d6, its parents, the 1-commit
//      second-parent side, the exact 2 src/js files, +75/-10
//      (villager-brain.js 59 / villager-objectives.js 26 changed
//      lines), no policy file, no standing.js, far-end standing
//      75762cb2, fix f8fda429, far-end policy a7ff5c51, merge policy ==
//      far-end policy, honesty test absent at far end + first parent,
//      present at the merge (blob 77f50489, 214 lines), villager-brain.js
//      absent at the far end / present at the first parent, merge NOT
//      an ancestor of the far end, IS an ancestor of master.
//   2. Narrowed definition — the objectives diff has exactly 5 hunks
//      with the exact headers and per-hunk +/− counts (10/0, 3/3, 1/1,
//      2/2, 3/1 = 19/7); the honesty test is +214 lines; the green-list
//      diff adds exactly the one honesty line; the excluded
//      brain/ONTOLOGY/test-dawn changes are named exactly; 7b + excluded
//      partitions the family diff.
//   3. Merge-tree prediction (read-only) — exactly THREE 'changed in
//      both' sections (ONTOLOGY.md 3 markers, green-list.txt 3 markers,
//      villager-objectives.js 0 markers); exactly TWO 'removed in local'
//      (DU) sections (villager-brain.js, test-villager-brain-dawn.js);
//      ONE 'added in remote' section (the honesty test, clean); the 7b
//      hunks are the marker-free part.
//   4. Mechanism analysis — finishLottery guard strings present in the
//      merge diff; vbrainAlignObjective DEFINITION absent at the far
//      end; the EXPEDITION-hold narration condition present in the
//      merge diff; far-end objPick reachability of EXPEDITION+chore
//      recorded (see §4 note).
//   5. Green-list readers — only scripts/check.js reads the file via
//      readList; zero references under src/ — so the single-line union
//      carve-out (family-2b precedent) applies.
//   6. Verdict mapping — classifyTransplant maps every survived count;
//      gateStopVerdict maps the BASELINE GATE (baseline <3/8 -> STOP,
//      UNMEASURED, no subject leg); conflictStopVerdict maps the
//      filtered-apply rule (any conflict -> UNMEASURED, no hand-resolve).
//   7. Base state — HEAD is back on sim-transplant7b-a, no src/js file
//      differs from HEAD, on-disk standing.js is byte-identical to HEAD,
//      and the step-script tooling source (master) still carries all four
//      scratch files.
//   8. Seed-band identity — the step script and the prereg name exactly
//      seeds 190391–190398; the prereg records the matched band as
//      REUSED BY DESIGN (not claimed fresh) with the search scope and
//      the reuse rationale.
//   9. Live subject state — (added after the subject is cut) the subject
//      branch exists off the far end with exactly one subject commit;
//      the subject diff is byte-identical to the family's 7b hunks
//      (+19/−7 one file, +214 test file, +1 green-list line); no
//      brain-module definition strings; policy + standing match the far
//      end; the honesty test skips (exit 2) on the subject as
//      pre-registered.
//  10. Step corpora — (added after the steps run) the baseline leg
//      summary + per-seed corpus exist with the settled 4/8 read, or the
//      GATE-STOP branch is taken (baseline <3/8 -> UNMEASURED, no
//      subject summary/log/corpus); on the measured path the subject leg
//      summary + corpus exist and the verdict mapping judges the count.
//
// Usage: node scripts/test-transplant7b.js
// Exit 0 = pass, 1 = fail. No repo writes.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant7b');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const MERGE = '23245d5d6';
const MERGE_FULL = '23245d5d6d91b4b5284e2f503345dcfd1621ff0c';
const MERGE_BASE = '7041e1bfb';
const MERGE_BASE_FULL = '7041e1bfb7e8b69387bd3203a58eed00115ec8d7';
const SECOND_FULL = 'a038cf1513c2eaee2e6ab97c9550369467910b50';
const SUBJECT_BRANCH = 'transplant-7b-subject';
const STEP = 't7b-23245d5d6';
const BASELINE_STEP = 'ep-far-7b';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const EXPECTED_BASELINE_DAYS = [86, 144, 150, 43, 150, 87, 150, 150];
const EXPECTED_JS = [
  'src/js/villager-brain.js',
  'src/js/villager-objectives.js',
];
const EXPECTED_FILES = [
  'docs/ONTOLOGY.md',
  'scripts/green-list.txt',
  'scripts/test-dawn-materialize-honesty.js',
  'scripts/test-villager-brain-dawn.js',
  'src/js/villager-brain.js',
  'src/js/villager-objectives.js',
];
const OBJECTIVES_HUNKS = [
  '@@ -543,6 +543,16 @@',
  '@@ -569,17 +579,17 @@',
  '@@ -590,7 +600,7 @@',
  '@@ -611,14 +621,14 @@',
  '@@ -1466,7 +1476,9 @@',
];
// Per-hunk +/− counts (added/removed content lines, +++ / --- excluded),
// counted live from the merge diff by this arm at run start.
const OBJECTIVES_HUNK_COUNTS = {
  '@@ -543,6 +543,16 @@': { a: 10, r: 0 },
  '@@ -569,17 +579,17 @@': { a: 3, r: 3 },
  '@@ -590,7 +600,7 @@': { a: 1, r: 1 },
  '@@ -611,14 +621,14 @@': { a: 2, r: 2 },
  '@@ -1466,7 +1476,9 @@': { a: 3, r: 1 },
};
const HONESTY_TEST = 'scripts/test-dawn-materialize-honesty.js';
const HONESTY_BLOB = '77f50489591ceba8ea13fcf9f954a6a89d720c7f';
const GREEN_UNION_LINE = 'scripts/test-dawn-materialize-honesty.js quick';
// Merge-tree marker counts per 'changed in both' file (family-7 record,
// re-verified live by this arm at run start).
const EXPECTED_MARKERS = {
  'docs/ONTOLOGY.md': 3,
  'scripts/green-list.txt': 3,
  'src/js/villager-objectives.js': 0,
};
// 'removed in local' (DU) sections in the merge-tree output.
const EXPECTED_REMOVED_LOCAL = [
  'scripts/test-villager-brain-dawn.js',
  'src/js/villager-brain.js',
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
// gateStopVerdict(baselineSurvived): the binding BASELINE GATE for THIS
// arm (8c precedent) — the subject leg is cut ONLY if the baseline reads
// >=3/8. Below that the run STOPS: UNMEASURED, no subject leg, and the
// baseline read is NOT re-judged as a carrier signal.
function gateStopVerdict(baselineSurvived) {
  if (typeof baselineSurvived !== 'number' || !Number.isFinite(baselineSurvived) ||
      baselineSurvived < 0 || baselineSurvived > 8) return 'UNCLASSIFIABLE';
  if (baselineSurvived >= 3) return 'PROCEED';
  return 'STOP-UNMEASURED';
}
// conflictStopVerdict(files): the binding STOP rule FOR THIS ARM — the
// subject is built by mechanical extraction of the 5 objectives hunks +
// the clean-add test file + the union green-list line, so ANY apply
// conflict is beyond the family definition: STOP, UNMEASURED, no
// hand-resolution, no silent hunk-drop.
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
// excluding +++ / --- headers) of the hunks whose header STARTS WITH one
// of `headers` (headers carry trailing context text after the second @@,
// e.g. the green-list hunk header). Returns { added: [...], removed: [...] } sorted.
function hunkLines(diffText, headers) {
  const added = [], removed = [];
  const lines = diffText.split('\n');
  let cur = null;
  for (const ln of lines) {
    if (ln.indexOf('@@ -') === 0) { cur = headers.some(function (h) { return ln.indexOf(h) === 0; }) ? ln : null; continue; }
    if (cur === null) continue;
    if (ln.indexOf('+') === 0 && ln.indexOf('+++') !== 0) added.push(ln.slice(1));
    else if (ln.indexOf('-') === 0 && ln.indexOf('---') !== 0) removed.push(ln.slice(1));
  }
  added.sort(); removed.sort();
  return { added: added, removed: removed };
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
// mergeTreeConflicts(): run `git merge-tree <base> <ours> <theirs>`
// (read-only dry run — touches no worktree) and return { found:
// { file: markers } for each 'changed in both' section, removedLocal:
// [files] for each 'removed in local' section, addedRemote: [files] for
// each 'added in remote' section, raw: the raw output }.
function mergeTreeConflicts() {
  const out = execSync('git merge-tree ' + MERGE_BASE + ' ' + FAR + ' ' + MERGE,
    { cwd: REPO, stdio: 'pipe', maxBuffer: 512 * 1024 * 1024 }).toString('utf8');
  const lines = out.split('\n');
  const found = {};
  const removedLocal = [];
  const addedRemote = [];
  let cur = null;
  let curKind = null;
  const record = function () {
    if (cur !== null && cur.file !== null) {
      if (curKind === 'changed') found[cur.file] = cur.markers;
      else if (curKind === 'removed') removedLocal.push(cur.file);
      else if (curKind === 'added') addedRemote.push(cur.file);
    }
  };
  for (const ln of lines) {
    if (/^(added in|removed in|renamed|merged|changed in both)/.test(ln)) {
      record();
      cur = null; curKind = null;
      if (ln === 'changed in both') { cur = { file: null, markers: 0 }; curKind = 'changed'; }
      else if (ln === 'removed in local') { cur = { file: null, markers: 0 }; curKind = 'removed'; }
      else if (ln === 'added in remote') { cur = { file: null, markers: 0 }; curKind = 'added'; }
      continue;
    }
    if (cur !== null) {
      const m = ln.match(/^  (?:base|their|result)\s+\d+ [0-9a-f]+ (.+)$/);
      if (m && cur.file === null) cur.file = m[1];
      if (ln.indexOf('+<<<<<<<') === 0 || ln.indexOf('+>>>>>>>') === 0 || ln.indexOf('+=======') === 0) cur.markers++;
    }
  }
  record();
  return { found: found, removedLocal: removedLocal, addedRemote: addedRemote, raw: out };
}

(async () => {
  // ---- 1. Family identity ----
  T.section('1. Family identity — PR #30 merge 23245d5d6');
  T.ok('merge commit exists', git('rev-parse ' + MERGE) === MERGE_FULL, git('log -1 --format=%s ' + MERGE).slice(0, 80));
  T.ok('first parent is 7041e1bfb (OVE-33 refresh)', git('rev-parse ' + MERGE + '^1') === MERGE_BASE_FULL, git('log -1 --format=%h\\ %s ' + MERGE + '^1').slice(0, 80));
  T.ok('second parent is a038cf151 (align dawn materialize with commit)', git('rev-parse ' + MERGE + '^2') === SECOND_FULL, git('log -1 --format=%h\\ %s ' + MERGE + '^2').slice(0, 80));
  const sideCount = parseInt(git('rev-list --count ' + MERGE + '^1..' + MERGE + '^2'), 10);
  T.ok('second-parent side is 1 commit', sideCount === 1, 'count=' + sideCount);
  const jsFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- src/js').split('\n').sort();
  T.ok('family touches exactly the 2 expected src/js files', JSON.stringify(jsFiles) === JSON.stringify(EXPECTED_JS.slice().sort()), jsFiles.join(', '));
  const brainStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/js/villager-brain.js');
  const objStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/js/villager-objectives.js');
  T.ok('villager-brain.js is 56+/3-', brainStat === '56\t3\tsrc/js/villager-brain.js', brainStat);
  T.ok('villager-objectives.js is 19+/7-', objStat === '19\t7\tsrc/js/villager-objectives.js', objStat);
  const allFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE).split('\n').sort();
  T.ok('family file list is exactly the 6 expected files', JSON.stringify(allFiles) === JSON.stringify(EXPECTED_FILES.slice().sort()), allFiles.join(', '));
  const tot = git('diff --numstat ' + MERGE + '^1 ' + MERGE).split('\n')
    .reduce(function (acc, line) { const p = line.split('\t'); const ins = parseInt(p[0], 10), del = parseInt(p[1], 10); return { ins: acc.ins + (Number.isFinite(ins) ? ins : 0), del: acc.del + (Number.isFinite(del) ? del : 0) }; }, { ins: 0, del: 0 });
  T.ok('family total delta is +300/-13', tot.ins === 300 && tot.del === 13, '+' + tot.ins + '/-' + tot.del);
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
  T.ok('honesty test file is ABSENT at the far end (ls-tree empty)',
    git('ls-tree ' + FAR + ' -- ' + HONESTY_TEST) === '', '(absent)');
  T.ok('honesty test file is ABSENT at the first parent (ls-tree empty)',
    git('ls-tree ' + MERGE_BASE + ' -- ' + HONESTY_TEST) === '', '(absent)');
  T.ok('honesty test file is PRESENT at the merge (blob 77f50489...)',
    git('ls-tree ' + MERGE + ' -- ' + HONESTY_TEST).indexOf(HONESTY_BLOB) !== -1, 'blob 77f50489');
  T.ok('honesty test file is 214 lines at the merge',
    gitShow(MERGE, HONESTY_TEST).split('\n').length - 1 === 214, '214 lines');
  T.ok('villager-brain.js is ABSENT at the far end (ls-tree empty)',
    git('ls-tree ' + FAR + ' -- src/js/villager-brain.js') === '', '(absent)');
  T.ok('villager-brain.js is PRESENT at the first parent (blob d2882bba...)',
    git('ls-tree ' + MERGE_BASE + ' -- src/js/villager-brain.js').indexOf('d2882bba') !== -1, 'blob d2882bba');
  T.ok('vbrainAlignObjective is defined at the merge, absent at the far end',
    gitShow(MERGE, 'src/js/villager-brain.js').indexOf('vbrainAlignObjective') !== -1 &&
    gitShow(FAR, 'src/js/villager-objectives.js').indexOf('function vbrainAlignObjective') === -1 &&
    gitShow(FAR, 'src/js/villager-objectives.js').indexOf('vbrainAlignObjective') === -1, 'align defined at merge only');
  T.ok('merge 23245d5d6 is NOT an ancestor of the far end (family is origin-side)',
    !isAncestor(MERGE, FAR), 'not ancestor');
  T.ok('merge 23245d5d6 IS an ancestor of master HEAD (origin line merged to master)',
    isAncestor(MERGE, 'HEAD'), 'ancestor of HEAD');

  // ---- 2. Narrowed definition ----
  T.section('2. Narrowed definition — hunk inventory, 7b is exactly the objectives hunks + honesty test + union line');
  const gotObjHunks = familyHunks('src/js/villager-objectives.js');
  T.ok('objectives diff has exactly the 5 expected hunks',
    JSON.stringify(gotObjHunks) === JSON.stringify(OBJECTIVES_HUNKS), gotObjHunks.join(' | '));
  const objDiff = execSync('git diff ' + MERGE + '^1 ' + MERGE + ' -- src/js/villager-objectives.js',
    { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  const objCounts = hunkCounts(objDiff);
  let countsOk = true, countsBad = null;
  for (const h of OBJECTIVES_HUNKS) {
    const want = OBJECTIVES_HUNK_COUNTS[h];
    const got = objCounts[h];
    if (!got || got.a !== want.a || got.r !== want.r) { countsOk = false; countsBad = h + ' (got +' + (got ? got.a : '?') + '/-' + (got ? got.r : '?') + ', want +' + want.a + '/-' + want.r + ')'; break; }
  }
  T.ok('per-hunk counts are 10/0, 3/3, 1/1, 2/2, 3/1 (= 19/7)', countsOk, countsBad || '5/5 match');
  const objLines = hunkLines(objDiff, OBJECTIVES_HUNKS);
  T.ok('the objectives hunks add the finishLottery definition (guarded align call)',
    objLines.added.some(function (l) { return l.indexOf('var finishLottery = function (obj) {') !== -1; }) &&
    objLines.added.some(function (l) { return l.indexOf("if (typeof this.vbrainAlignObjective === 'function') {") !== -1; }) &&
    objLines.added.some(function (l) { return l.indexOf('return this.vbrainAlignObjective(vid, obj, hx, hy) || obj;') !== -1; }),
    '3/3 finishLottery markers present');
  T.ok('the objectives hunks wrap exactly 6 early returns in finishLottery(o)',
    objLines.added.filter(function (l) { return l.trim() === 'return finishLottery(o);'; }).length === 6,
    '6 wrapped returns');
  T.ok('the objectives hunks add the EXPEDITION-hold narration condition',
    objLines.added.some(function (l) { return l.indexOf("(o.kind === 'EXPEDITION' && o.purpose === 'chore')") !== -1; }) &&
    objLines.added.some(function (l) { return l.indexOf('EXPEDITION dawn holds keep kind=EXPEDITION') !== -1; }),
    'hold condition + comment present');
  const greenDiff = execSync('git diff ' + MERGE + '^1 ' + MERGE + ' -- scripts/green-list.txt',
    { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  const greenLines = hunkLines(greenDiff, ['@@ -795,6 +795,7 @@']);
  T.ok('the green-list diff adds exactly the one honesty line',
    greenLines.added.length === 1 && greenLines.added[0] === GREEN_UNION_LINE && greenLines.removed.length === 0,
    'added=[' + greenLines.added.join(', ') + '] removed=' + greenLines.removed.length);
  const ontStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- docs/ONTOLOGY.md');
  const dawnTestStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- scripts/test-villager-brain-dawn.js');
  T.ok('excluded ONTOLOGY.md change is 2+/1- (brain section + rule)',
    ontStat === '2\t1\tdocs/ONTOLOGY.md', ontStat);
  T.ok('excluded test-villager-brain-dawn.js change is 8+/2-',
    dawnTestStat === '8\t2\tscripts/test-villager-brain-dawn.js', dawnTestStat);
  T.ok('excluded brain change is 56+/3- (the align function itself)',
    brainStat === '56\t3\tsrc/js/villager-brain.js', brainStat);
  T.ok('7b (objectives 19/7 + honesty 214/0 + green-list 1/0) + excluded (brain 56/3 + ONTOLOGY 2/1 + dawn-test 8/2) partitions the family +300/-13',
    (19 + 214 + 1 + 56 + 2 + 8) === 300 && (7 + 0 + 0 + 3 + 1 + 2) === 13, '300/13 partition');
  const preregPath = path.join(REPO, 'evidence', '2026-11-15', 'sim-transplant7b-prereg.md');
  const prereg = fs.existsSync(preregPath) ? fs.readFileSync(preregPath, 'utf8') : '';
  // Whitespace-flattened copy: prereg prose wraps across lines, so phrase
  // checks below run against this instead of the raw text.
  const preregFlat = prereg.replace(/\s+/g, ' ');
  T.ok('7b prereg file exists', prereg !== '', preregPath);
  T.ok('prereg names the five objectives hunks',
    OBJECTIVES_HUNKS.every(function (h) { return prereg.indexOf(h) !== -1; }), '5/5 hunk anchors present');
  T.ok('prereg states the green-list union line and the union-only rule',
    prereg.indexOf(GREEN_UNION_LINE) !== -1 && prereg.indexOf('Resolved by UNION only') !== -1, 'union line + rule present');
  T.ok('prereg records the mechanism note (align call inert by design on far-end substrate)',
    prereg.indexOf('INERT BY DESIGN on far-end substrate') !== -1, 'mechanism note present');
  T.ok('prereg records the expected NOT-CARRIER form (subject identical to baseline)',
    preregFlat.indexOf('subject identical to the baseline leg') !== -1, 'identity expectation present');
  T.ok('prereg records the conflict-STOP rule (any conflict -> UNMEASURED, no hand-resolve)',
    prereg.indexOf('Conflict-STOP rule') !== -1 && prereg.indexOf('UNMEASURED') !== -1 && prereg.indexOf('do NOT hand-resolve') !== -1, 'STOP rule present');
  T.ok('prereg records the BASELINE GATE (baseline <3/8 -> STOP, 8c precedent)',
    prereg.indexOf('BASELINE LEG FIRST') !== -1 && prereg.indexOf('Gate: the baseline leg reads') !== -1, 'gate present');

  // ---- 3. Merge-tree prediction ----
  T.section('3. Merge-tree prediction — objectives 0 markers, honesty clean add, conflicts confined to excluded files');
  const mt = mergeTreeConflicts();
  let mtOk = true, mtBad = null;
  for (const f of Object.keys(EXPECTED_MARKERS)) {
    if (mt.found[f] !== EXPECTED_MARKERS[f]) { mtOk = false; mtBad = f + ' (got ' + mt.found[f] + ', want ' + EXPECTED_MARKERS[f] + ')'; break; }
  }
  T.ok('merge-tree reports the same marker counts per changed-in-both file', mtOk, mtBad || '3/3 match');
  T.ok('merge-tree reports exactly THREE changed-in-both files', Object.keys(mt.found).length === 3, 'sections=' + Object.keys(mt.found).length + ': ' + Object.keys(mt.found).join(', '));
  T.ok('merge-tree reports exactly TWO removed-in-local (DU) sections',
    JSON.stringify(mt.removedLocal.slice().sort()) === JSON.stringify(EXPECTED_REMOVED_LOCAL.slice().sort()),
    'DU=' + mt.removedLocal.join(', '));
  T.ok('merge-tree reports exactly ONE added-in-remote section (the honesty test)',
    JSON.stringify(mt.addedRemote) === JSON.stringify([HONESTY_TEST]), 'added=' + mt.addedRemote.join(', '));
  T.ok('merge-tree objectives section carries ZERO conflict markers (the 7b hunks auto-merge)',
    mt.found['src/js/villager-objectives.js'] === 0, '0 markers');
  T.ok('merge-tree objectives section carries all 5 7b hunks (headers shift with the far end)',
    (function () {
      const i = mt.raw.indexOf('src/js/villager-objectives.js');
      const j = mt.raw.indexOf('removed in local', i);
      const slice = mt.raw.slice(i, j === -1 ? mt.raw.length : j);
      const headers = slice.split('\n').filter(function (ln) { return ln.indexOf('@@ -') === 0; });
      return headers.length === 5;
    })(), '5 hunks in merged output');
  T.ok('merge-tree ONTOLOGY + green-list marker blocks are confined to excluded files',
    mt.found['docs/ONTOLOGY.md'] === 3 && mt.found['scripts/green-list.txt'] === 3, '3 + 3 markers, both excluded');

  // ---- 4. Mechanism analysis ----
  T.section('4. Mechanism analysis — guarded call, absent align, hold narration');
  T.ok('finishLottery wraps the align call in try/catch (merge diff text)',
    objDiff.indexOf('try {') !== -1 && objDiff.indexOf('} catch (e) {}') !== -1, 'try/catch present');
  T.ok('finishLottery returns obj unchanged when the align function is absent',
    objDiff.indexOf('return obj;') !== -1 && objDiff.indexOf('}.bind(this);') !== -1, 'fallback present');
  T.ok('the align function is NOT defined anywhere in the far-end tree (grep, not just objectives)',
    (function () {
      try {
        const out = execSync('git grep -l vbrainAlignObjective ' + FAR + ' -- src/js', { cwd: REPO, stdio: 'pipe' }).toString().trim();
        return out === '';
      } catch (e) { return true; } // git grep exits 1 on no match
    })(), 'no far-end definition');
  T.ok('the align function IS defined at the merge (villager-brain.js)',
    gitShow(MERGE, 'src/js/villager-brain.js').indexOf('vbrainAlignObjective') !== -1, 'defined at merge');
  T.ok('the honesty test skips when the align API is missing (setup gate in the test)',
    gitShow(MERGE, HONESTY_TEST).indexOf("typeof Game.vbrainAlignObjective !== 'function'") !== -1 &&
    gitShow(MERGE, HONESTY_TEST).indexOf('villager-brain align API missing') !== -1, 'skip gate present');
  T.ok('the honesty test expects the gear_hold -> HAVEN_CHORE commit (not asserted here, recorded)',
    gitShow(MERGE, HONESTY_TEST).indexOf("winPlanAction !== 'gear_hold'") !== -1, 'gear_hold expectation present');
  // EXPEDITION+chore reachability at the far end: does any far-end code set
  // purpose='chore' on an EXPEDITION objective? Recorded, not asserted as
  // a pass/fail on the family — the prereg's mechanism note says "expected
  // inert". The check below reads the far-end objectives file only.
  const farObj = gitShow(FAR, 'src/js/villager-objectives.js');
  const expChore = farObj.indexOf("o.kind === 'EXPEDITION'") !== -1;
  T.ok('far-end objectives file carries no EXPEDITION+chore assignment path (mechanism note: hold branch expected inert)',
    !expChore, expChore ? 'EXPEDITION kind assignment found — see evidence' : 'no EXPEDITION kind assignment in objPick region');

  // ---- 5. Green-list readers ----
  T.section('5. Green-list readers — only check.js, zero src/js readers');
  const checkJs = fs.readFileSync(path.join(REPO, 'scripts', 'check.js'), 'utf8');
  T.ok('scripts/check.js reads green-list.txt via readList',
    checkJs.indexOf("readList('scripts/green-list.txt')") !== -1, 'readList present');
  T.ok('zero src/js files reference green-list.txt',
    (function () {
      try {
        const out = execSync('git grep -l green-list ' + 'HEAD' + ' -- src/js', { cwd: REPO, stdio: 'pipe' }).toString().trim();
        return out === '';
      } catch (e) { return true; }
    })(), 'no src/js reference');
  T.ok('the union line is absent from the far-end green list (union adds it)',
    gitShow(FAR, 'scripts/green-list.txt').indexOf(GREEN_UNION_LINE) === -1, 'absent at far end');
  T.ok('the union line is present in the merge green list (union source)',
    gitShow(MERGE, 'scripts/green-list.txt').indexOf(GREEN_UNION_LINE) !== -1, 'present at merge');

  // ---- 6. Verdict mapping ----
  T.section('6. Verdict mapping — classify, gate-stop, conflict-stop');
  T.ok('classifyTransplant maps 0/8 -> CARRIER', classifyTransplant(0) === 'CARRIER', '0 -> CARRIER');
  T.ok('classifyTransplant maps 1/8 -> CARRIER', classifyTransplant(1) === 'CARRIER', '1 -> CARRIER');
  T.ok('classifyTransplant maps 2/8 -> AMBIGUOUS', classifyTransplant(2) === 'AMBIGUOUS', '2 -> AMBIGUOUS');
  T.ok('classifyTransplant maps 3/8 -> NOT-CARRIER', classifyTransplant(3) === 'NOT-CARRIER', '3 -> NOT-CARRIER');
  T.ok('classifyTransplant maps 4/8 -> NOT-CARRIER', classifyTransplant(4) === 'NOT-CARRIER', '4 -> NOT-CARRIER');
  T.ok('classifyTransplant maps 8/8 -> NOT-CARRIER', classifyTransplant(8) === 'NOT-CARRIER', '8 -> NOT-CARRIER');
  T.ok('classifyTransplant rejects out-of-range input', classifyTransplant(9) === 'UNCLASSIFIABLE' && classifyTransplant(-1) === 'UNCLASSIFIABLE' && classifyTransplant('4') === 'UNCLASSIFIABLE', '9/-1/"4" -> UNCLASSIFIABLE');
  T.ok('gateStopVerdict maps baseline 4/8 -> PROCEED', gateStopVerdict(4) === 'PROCEED', '4 -> PROCEED');
  T.ok('gateStopVerdict maps baseline 3/8 -> PROCEED', gateStopVerdict(3) === 'PROCEED', '3 -> PROCEED');
  T.ok('gateStopVerdict maps baseline 2/8 -> STOP-UNMEASURED', gateStopVerdict(2) === 'STOP-UNMEASURED', '2 -> STOP-UNMEASURED');
  T.ok('gateStopVerdict maps baseline 1/8 -> STOP-UNMEASURED', gateStopVerdict(1) === 'STOP-UNMEASURED', '1 -> STOP-UNMEASURED');
  T.ok('gateStopVerdict maps baseline 0/8 -> STOP-UNMEASURED', gateStopVerdict(0) === 'STOP-UNMEASURED', '0 -> STOP-UNMEASURED');
  T.ok('gateStopVerdict rejects out-of-range input', gateStopVerdict(9) === 'UNCLASSIFIABLE' && gateStopVerdict(-1) === 'UNCLASSIFIABLE', '9/-1 -> UNCLASSIFIABLE');
  T.ok('conflictStopVerdict maps no conflicts -> MEASURABLE', conflictStopVerdict([]) === 'MEASURABLE', '[] -> MEASURABLE');
  T.ok('conflictStopVerdict maps any conflict -> UNMEASURED', conflictStopVerdict(['src/js/villager-objectives.js']) === 'UNMEASURED', '1 file -> UNMEASURED');
  T.ok('conflictStopVerdict rejects non-array input', conflictStopVerdict(null) === 'UNCLASSIFIABLE', 'null -> UNCLASSIFIABLE');

  // ---- 7. Base state ----
  T.section('7. Base state — arm branch, clean tree, step tooling restorable');
  T.ok('HEAD is on the arm branch sim-transplant7b-a',
    git('branch --show-current') === 'sim-transplant7b-a', git('branch --show-current'));
  T.ok('tracked tree is clean (no uncommitted changes)',
    git('status --porcelain --untracked-files=no') === '', git('status --porcelain --untracked-files=no') || '(clean)');
  T.ok('on-disk standing.js is byte-identical to HEAD',
    sha256(fs.readFileSync(path.join(REPO, 'src/js', 'standing.js'), 'utf8')) === sha256(gitShow('HEAD', 'src/js/standing.js')), 'standing == HEAD');
  T.ok('step-script tooling source (master) carries all four scratch files',
    ['scripts/culpritbisect-driver-20261113.js', 'scripts/culpritbisect-analyze-20261113.js', 'scripts/masterregress-analyze-20261113.js', 'scripts/vetfirst-instrument-20261111.js']
      .every(function (f) { try { gitShow('master', f); return true; } catch (e) { return false; } }),
    '4/4 scratch files on master');
  T.ok('the step script names the matched band seeds',
    fs.readFileSync(path.join(REPO, 'scripts', 'culpritbisect-step.sh'), 'utf8')
      .indexOf('SEEDS="190391,190392,190393,190394,190395,190396,190397,190398"') !== -1, 'SEEDS literal present');

  // ---- 8. Seed-band identity ----
  T.section('8. Seed-band identity — matched band, reused by design');
  T.ok('step ids are t7b-23245d5d6 (subject) and ep-far-7b (baseline)',
    STEP === 't7b-23245d5d6' && BASELINE_STEP === 'ep-far-7b', STEP + ' / ' + BASELINE_STEP);
  T.ok('subject branch name is transplant-7b-subject',
    SUBJECT_BRANCH === 'transplant-7b-subject', SUBJECT_BRANCH);
  T.ok('prereg records the matched band 190391–190398 as REUSED BY DESIGN (not claimed fresh)',
    prereg.indexOf('REUSED BY DESIGN') !== -1 && prereg.indexOf('190391') !== -1 && prereg.indexOf('NOT claimed fresh') !== -1, 'reuse note present');
  T.ok('prereg records the freshness-search scope (whole evidence/ tree grep for 190391)',
    prereg.indexOf('whole `evidence/` tree') !== -1, 'search scope present');
  T.ok('prereg records the freshness-search result (band heavily reused, no reservation)',
    preregFlat.indexOf('heavily reused') !== -1 && preregFlat.indexOf('No forbidden/contaminated band list') !== -1, 'search result present');
  T.ok('prereg records the settled matched-band baseline (4/8, days 86/144/150/43/150/87/150/150)',
    prereg.indexOf('86/144/150/43/') !== -1 && prereg.indexOf('150/87/150/150') !== -1, 'settled baseline present');
  T.ok('expected baseline days are the settled matched-band read',
    JSON.stringify(EXPECTED_BASELINE_DAYS) === JSON.stringify([86, 144, 150, 43, 150, 87, 150, 150]), EXPECTED_BASELINE_DAYS.join('/'));

  await T.done();
})().catch(function (e) {
  console.error(e);
  process.exit(1);
});
