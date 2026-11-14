#!/usr/bin/env node
// test-transplant7.js — proof test for the H1 TRANSPLANT, family 7
// (arm sim-transplant7-a).
//
// THE QUESTION (evidence/2026-11-13/sim-transplant7.md, prereg
// committed before any judged sim): land origin family 7 — PR #30
// merge 23245d5d6 (dawn honesty, OVE-37 port, OVE-36 Candidate A,
// 2 src/js files) — onto the far end 203a32775 (GOOD 4/8) and
// measure whether it alone collapses it. Verdicts (fresh
// thresholds): <=1/8 CARRIER, 2/8 AMBIGUOUS (re-run once; 2/8 again
// -> recorded AMBIGUOUS, treated as NOT-CARRIER for ordering, kept
// on the suspect list), >=3/8 NOT-CARRIER.
//
// PREDICTED OUTCOME — UNMEASURED (conflict-STOP): the merge-tree
// pre-check predicts TWO content-conflicted files (docs/ONTOLOGY.md,
// 1 hunk; scripts/green-list.txt, 1 hunk) plus TWO delete/modify
// entries (src/js/villager-brain.js AND scripts/test-villager-brain-
// dawn.js — both ABSENT at the far end, PRESENT at the first parent:
// the family-6 missing-substrate wall, twice over). The live
// cherry-pick is expected to reproduce all four unmerged paths
// exactly, the run STOPS, no subject commit exists, no step ran, no
// survival number was measured. The narrowed-tooling rule does NOT
// apply to this arm (task brief, explicit — full-family attempt);
// the conflicts are NOT tooling-only in any case (one is game code,
// one is docs).
//
// WHAT THIS TEST PROVES:
//   1. Family identity — merge 23245d5d6, its parents, the 1-commit
//      second-parent side, the exact 2 src/js files, +75/-10
//      (villager-brain.js 59 / villager-objectives.js 26 changed
//      lines), no policy file, no standing.js, far-end standing
//      75762cb2, fix f8fda429, far-end policy a7ff5c51.
//   2. Merge-tree prediction (read-only) — exactly THREE 'changed
//      in both' sections: docs/ONTOLOGY.md 3 markers, scripts/
//      green-list.txt 3 markers, src/js/villager-objectives.js 0
//      markers; exactly TWO content-conflicted files; the raw
//      merge-tree output ALSO carries TWO 'removed in local'
//      (delete/modify) sections — src/js/villager-brain.js and
//      scripts/test-villager-brain-dawn.js — the DU signals the
//      substrate gate catches before any pick.
//   3. Green-list readers — only scripts/check.js reads the file;
//      zero readers under src/ — AND the conflicts are NOT
//      tooling-only (game-code DU + docs conflict), so no narrowed
//      7b follows from this arm.
//   4. Verdict mapping — classifyTransplant maps every survived
//      count; conflictStopVerdict maps the conflict sets for THIS
//      arm: no conflict -> MEASURABLE, ANY conflict -> UNMEASURED
//      (no union carve-out — the narrowed-tooling rule does not
//      apply to family 7).
//   5. Base state — HEAD is back on sim-transplant7-a, no src/js
//      file differs from HEAD, on-disk standing.js is byte-identical
//      to HEAD, and the step-script tooling source (master) still
//      carries all four scratch files.
//   6. Seed-band identity — the step script and the prereg name
//      exactly seeds 190391–190398.
//   7. Live conflict record — (added after the pick) the subject
//      branch exists at the far end with NO subject commit; both
//      DUs recorded; the evidence file records the live UU files
//      and hunks, the UNMEASURED verdict, and the narrowed-7b note
//      as a coordinator decision.
//   8. No corpus — no step summary, driver log, or per-seed corpus
//      exists for STEP t7-23245d5d6, because no judged sim ran.
//
// Usage: node scripts/test-transplant7.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant7');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const MERGE = '23245d5d6';
const MERGE_BASE = '7041e1bfb';
const SUBJECT_BRANCH = 'transplant-7-subject';
const STEP = 't7-23245d5d6';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const EXPECTED_JS = [
  'src/js/villager-brain.js', 'src/js/villager-objectives.js',
];
// Marker counts from the merge-tree dry run, per 'changed in both' file
// (transplant118/2b counting method: +<<<<<<<, +=======, +>>>>>>>).
const EXPECTED_MARKERS = {
  'docs/ONTOLOGY.md': 3,
  'scripts/green-list.txt': 3,
  'src/js/villager-objectives.js': 0,
};
// The green-list hunk's theirs-side lines (ours side is empty).
const GREEN_THEIRS_LINES = [
  'scripts/test-villager-brain-dawn.js quick',
  'scripts/test-dawn-materialize-honesty.js quick',
];
// The two delete/modify ('removed in local') files.
const EXPECTED_DU = [
  'src/js/villager-brain.js',
  'scripts/test-villager-brain-dawn.js',
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
// the narrowed-tooling rule does NOT apply to family 7 (task brief,
// explicit: full-family attempt). ANY conflict stops the run
// (UNMEASURED); only a clean pick is MEASURABLE.
function conflictStopVerdict(files) {
  if (!Array.isArray(files)) return 'UNCLASSIFIABLE';
  if (files.length === 0) return 'MEASURABLE';
  return 'UNMEASURED';
}
// mergeTreeConflicts(): run `git merge-tree <base> <ours> <theirs>`
// (read-only dry run — touches no worktree) and return { file: markers }
// for each 'changed in both' section.
function mergeTreeConflicts() {
  const out = execSync('git merge-tree ' + MERGE_BASE + ' ' + FAR + ' ' + MERGE,
    { cwd: REPO, stdio: 'pipe', maxBuffer: 512 * 1024 * 1024 }).toString('utf8');
  const lines = out.split('\n');
  const found = {};
  let cur = null;
  const record = function () { if (cur !== null && cur.file !== null) found[cur.file] = cur.markers; };
  for (const ln of lines) {
    if (ln === 'changed in both') { record(); cur = { file: null, markers: 0 }; continue; }
    if (cur !== null && /^[a-z][a-z ]*$/.test(ln)) { record(); cur = null; continue; }
    if (cur !== null) {
      const m = ln.match(/^  base\s+\d+ [0-9a-f]+ (.+)$/);
      if (m && cur.file === null) cur.file = m[1];
      if (ln.indexOf('+<<<<<<<') === 0 || ln.indexOf('+>>>>>>>') === 0 || ln.indexOf('+=======') === 0) cur.markers++;
    }
    if (cur !== null && cur.file !== null && ln !== '' && !ln.startsWith(' ') && !ln.startsWith('+') && !ln.startsWith('-') && !ln.startsWith('@')) {
      // A non-diff, non-indented line after the section header ends it.
      record();
      cur = null;
    }
  }
  record();
  return found;
}
// mergeTreeRemovedInLocal(): return the file list from the raw
// merge-tree output's 'removed in local' sections (delete/modify:
// base + their blobs only, no 'our' line).
function mergeTreeRemovedInLocal() {
  const out = execSync('git merge-tree ' + MERGE_BASE + ' ' + FAR + ' ' + MERGE,
    { cwd: REPO, stdio: 'pipe', maxBuffer: 512 * 1024 * 1024 }).toString('utf8');
  const lines = out.split('\n');
  const removed = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === 'removed in local') {
      const m = (lines[i + 1] || '').match(/^  base\s+\d+ [0-9a-f]+ (.+)$/);
      if (m) removed.push(m[1]);
    }
  }
  return removed.sort();
}

(async () => {
  // ---- 1. Family identity ----
  T.section('1. Family identity — PR #30 merge 23245d5d6');
  T.ok('merge commit exists', git('rev-parse ' + MERGE).length === 40, git('log -1 --format=%s ' + MERGE).slice(0, 80));
  T.ok('first parent is 7041e1bfb (OVE-33 refresh)', git('rev-parse ' + MERGE + '^1').startsWith('7041e1bfb'), git('log -1 --format=%h\\ %s ' + MERGE + '^1').slice(0, 80));
  T.ok('second parent is a038cf151 (align dawn materialize)', git('rev-parse ' + MERGE + '^2').startsWith('a038cf151'), git('log -1 --format=%h\\ %s ' + MERGE + '^2').slice(0, 80));
  const sideCount = parseInt(git('rev-list --count ' + MERGE + '^1..' + MERGE + '^2'), 10);
  T.ok('second-parent side is 1 commit', sideCount === 1, 'count=' + sideCount);
  const jsFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- src/js').split('\n').sort();
  T.ok('family touches exactly the 2 expected src/js files', JSON.stringify(jsFiles) === JSON.stringify(EXPECTED_JS.slice().sort()), jsFiles.join(', '));
  const numstat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/js').split('\n')
    .reduce(function (acc, line) { const p = line.split('\t'); return { ins: acc.ins + parseInt(p[0], 10), del: acc.del + parseInt(p[1], 10) }; }, { ins: 0, del: 0 });
  T.ok('family src/js delta is +75/-10', numstat.ins === 75 && numstat.del === 10, '+' + numstat.ins + '/-' + numstat.del);
  const brainStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/js/villager-brain.js');
  const objStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/js/villager-objectives.js');
  T.ok('villager-brain.js is 56+/3- (59 changed lines)', brainStat === '56\t3\tsrc/js/villager-brain.js', brainStat);
  T.ok('villager-objectives.js is 19+/7- (26 changed lines)', objStat === '19\t7\tsrc/js/villager-objectives.js', objStat);
  const allFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE).split('\n').sort();
  T.ok('family touches exactly 6 files total', allFiles.length === 6, allFiles.join(', '));
  const polFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- scripts/policies');
  T.ok('family touches no policy file', polFiles === '', polFiles || '(none)');
  T.ok('family does not touch standing.js', git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- src/js/standing.js') === '', '(absent)');
  const farStanding = sha256(gitShow(FAR, 'src/js/standing.js'));
  T.ok('far-end native standing.js sha is 75762cb2...', farStanding.startsWith('75762cb2'), farStanding.slice(0, 12));
  T.ok('fix standing.js sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  const farPolicy = sha256(gitShow(FAR, 'scripts/policies/competent.js'));
  T.ok('far-end policy sha is a7ff5c51...', farPolicy.startsWith('a7ff5c51'), farPolicy.slice(0, 12));

  // ---- 2. Merge-tree prediction ----
  T.section('2. Merge-tree prediction — two conflicted files, two marker blocks, two DUs');
  const mt = mergeTreeConflicts();
  let mtOk = true, mtBad = null;
  for (const f of Object.keys(EXPECTED_MARKERS)) {
    if (mt[f] !== EXPECTED_MARKERS[f]) { mtOk = false; mtBad = f + ' (got ' + mt[f] + ', want ' + EXPECTED_MARKERS[f] + ')'; break; }
  }
  T.ok('merge-tree reports the same marker counts per changed-in-both file', mtOk, mtBad || '3/3 match');
  T.ok('merge-tree reports exactly THREE changed-in-both files', Object.keys(mt).length === 3, 'sections=' + Object.keys(mt).length + ': ' + Object.keys(mt).join(', '));
  const conflicted = Object.keys(mt).filter(function (f) { return mt[f] > 0; }).sort();
  T.ok('merge-tree reports exactly TWO content-conflicted files', conflicted.length === 2, 'conflicted=' + conflicted.join(', '));
  T.ok('the conflicted files are ONTOLOGY.md + green-list.txt',
    JSON.stringify(conflicted) === JSON.stringify(['docs/ONTOLOGY.md', 'scripts/green-list.txt']), conflicted.join(', '));
  T.ok('villager-objectives.js merges cleanly (0 markers)', mt['src/js/villager-objectives.js'] === 0, 'markers=0');
  // The two delete/modify signals: neither DU file appears in the
  // changed-in-both map, but the raw merge-tree output carries a
  // 'removed in local' section for each (base + their blobs only,
  // no 'our' line) — the substrate gate catches both before any pick.
  const du = mergeTreeRemovedInLocal();
  T.ok('merge-tree reports exactly TWO removed-in-local (DU) files', du.length === 2, 'du=' + du.join(', '));
  T.ok('the DU files are villager-brain.js + test-villager-brain-dawn.js',
    JSON.stringify(du) === JSON.stringify(EXPECTED_DU.slice().sort()), du.join(', '));
  T.ok('villager-brain.js is NOT a changed-in-both file (delete/modify, not a clean merge)', mt['src/js/villager-brain.js'] === undefined, 'absent from map');
  T.ok('test-villager-brain-dawn.js is NOT a changed-in-both file (delete/modify, not a clean merge)', mt['scripts/test-villager-brain-dawn.js'] === undefined, 'absent from map');
  const mtRaw = execSync('git merge-tree ' + MERGE_BASE + ' ' + FAR + ' ' + MERGE,
    { cwd: REPO, stdio: 'pipe', maxBuffer: 512 * 1024 * 1024 }).toString('utf8');
  T.ok("raw merge-tree output carries the 'removed in local' villager-brain.js section (the DU signal)",
    mtRaw.indexOf('removed in local') !== -1 && mtRaw.indexOf('src/js/villager-brain.js') !== -1, 'DU signal present');
  T.ok('villager-brain.js is ABSENT at the far end (ls-tree empty)',
    git('ls-tree ' + FAR + ' -- src/js/villager-brain.js') === '', '(absent)');
  T.ok('villager-brain.js is PRESENT at the first parent (blob d2882bba9...)',
    git('ls-tree ' + MERGE_BASE + ' -- src/js/villager-brain.js').indexOf('d2882bba9dfd87a0b7358155c647f585c04d745f') !== -1, 'blob d2882bba9');
  T.ok('test-villager-brain-dawn.js is ABSENT at the far end (ls-tree empty)',
    git('ls-tree ' + FAR + ' -- scripts/test-villager-brain-dawn.js') === '', '(absent)');
  T.ok('test-villager-brain-dawn.js is PRESENT at the first parent (blob 0ffc7a868...)',
    git('ls-tree ' + MERGE_BASE + ' -- scripts/test-villager-brain-dawn.js').indexOf('0ffc7a868decddf8e13d8d4766bcbc96e172dff7') !== -1, 'blob 0ffc7a868');
  // The green-list hunk's theirs-side lines are the two test lines.
  const mergeGreen = gitShow(MERGE, 'scripts/green-list.txt').split('\n');
  let greenOk = true;
  for (const l of GREEN_THEIRS_LINES) { if (mergeGreen.indexOf(l) === -1) greenOk = false; }
  T.ok('the 2 green-list theirs-lines are present in the merge file', greenOk, GREEN_THEIRS_LINES.length + '/2');
  const farGreen = gitShow(FAR, 'scripts/green-list.txt').split('\n');
  let farGreenOk = true;
  for (const l of GREEN_THEIRS_LINES) { if (farGreen.indexOf(l) !== -1) farGreenOk = false; }
  T.ok('neither theirs-line is in the far-end file (ours side empty at the anchor)', farGreenOk, '0/2 present');

  // ---- 3. Green-list readers + tooling-only analysis ----
  T.section('3. Green-list readers — test/check tooling only; conflicts NOT tooling-only');
  const checkJs = fs.readFileSync(path.join(REPO, 'scripts', 'check.js'), 'utf8');
  T.ok('scripts/check.js reads green-list.txt (readList)', checkJs.indexOf("readList('scripts/green-list.txt')") !== -1, 'readList present');
  let srcReaders = [];
  try {
    srcReaders = execSync('git grep -l "green-list" ' + git('rev-parse HEAD') + ' -- src/', { cwd: REPO, stdio: 'pipe' }).toString().trim().split('\n').filter(Boolean);
  } catch (e) { srcReaders = []; }
  T.ok('zero green-list references under src/ (no game-code reader)', srcReaders.length === 0, srcReaders.join(', ') || '(none)');
  T.ok('conflictStopVerdict: ONTOLOGY + green-list + 2 DUs -> UNMEASURED (no carve-out on this arm)',
    conflictStopVerdict(['docs/ONTOLOGY.md', 'scripts/green-list.txt', 'src/js/villager-brain.js', 'scripts/test-villager-brain-dawn.js']) === 'UNMEASURED', 'UNMEASURED');
  T.ok('conflictStopVerdict: green-list-only ALSO -> UNMEASURED on this arm (narrowed-tooling rule does NOT apply)',
    conflictStopVerdict(['scripts/green-list.txt']) === 'UNMEASURED', conflictStopVerdict(['scripts/green-list.txt']));
  const evPath = path.join(REPO, 'evidence', '2026-11-13', 'sim-transplant7.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('evidence file records that the narrowed-tooling rule does NOT apply', ev.indexOf('does NOT apply') !== -1, 'rule note present');
  T.ok('evidence file records that the conflicts are NOT tooling-only', ev.indexOf('NOT tooling-only') !== -1, 'tooling-only analysis present');
  T.ok('evidence file names both content-conflicted files in the pre-check', ev.indexOf('docs/ONTOLOGY.md') !== -1 && ev.indexOf('scripts/green-list.txt') !== -1, 'both files named');

  // ---- 4. Verdict mapping ----
  T.section('4. Verdict mapping — transplant thresholds + conflict-STOP rule');
  const table = [[0, 'CARRIER'], [1, 'CARRIER'], [2, 'AMBIGUOUS'], [3, 'NOT-CARRIER'], [4, 'NOT-CARRIER'], [8, 'NOT-CARRIER'], [-1, 'UNCLASSIFIABLE'], [9, 'UNCLASSIFIABLE'], [NaN, 'UNCLASSIFIABLE']];
  for (const pair of table) {
    T.ok('survived ' + pair[0] + ' -> ' + pair[1], classifyTransplant(pair[0]) === pair[1], classifyTransplant(pair[0]));
  }
  T.ok('conflict rule: no conflict -> MEASURABLE', conflictStopVerdict([]) === 'MEASURABLE', conflictStopVerdict([]));
  T.ok('conflict rule: any single conflict -> UNMEASURED', conflictStopVerdict(['src/js/villager-brain.js']) === 'UNMEASURED', conflictStopVerdict(['src/js/villager-brain.js']));
  T.ok('conflict rule: non-array input -> UNCLASSIFIABLE', conflictStopVerdict(null) === 'UNCLASSIFIABLE', conflictStopVerdict(null));

  // ---- 5. Base state ----
  T.section('5. Base state — arm branch, clean tree, no swap residue');
  const headBranch = git('rev-parse --abbrev-ref HEAD');
  T.ok('HEAD is on the arm branch sim-transplant7-a', headBranch === 'sim-transplant7-a', 'HEAD=' + headBranch);
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
  T.ok('evidence prereg names the same band', ev.indexOf('190391') !== -1 && ev.indexOf('190398') !== -1, 'band in prereg');
  T.ok('evidence prereg names the STEP id t7-23245d5d6', ev.indexOf('t7-23245d5d6') !== -1, 'STEP id present');

  // ---- 7. Live conflict record ----
  T.section('7. Live conflict record — four unmerged paths, no subject commit');
  let subject = null;
  try { subject = git('rev-parse ' + SUBJECT_BRANCH); } catch (e) { subject = null; }
  T.ok('subject branch exists', subject !== null && subject.length === 40, subject ? subject.slice(0, 12) : '(missing)');
  if (subject) {
    T.ok('subject branch points at the far end (no subject commit)', subject === FAR_FULL, subject.slice(0, 12));
  }
  T.ok('evidence file records the verdict as UNMEASURED', ev.indexOf('UNMEASURED') !== -1, 'UNMEASURED present');
  T.ok('evidence file records FOUR unmerged paths', ev.indexOf('FOUR unmerged paths') !== -1, 'four paths named');
  T.ok('evidence file records the DU on villager-brain.js', ev.indexOf('DU') !== -1 && ev.indexOf('villager-brain.js') !== -1, 'DU present');
  T.ok('evidence file records the DU on test-villager-brain-dawn.js', ev.indexOf('test-villager-brain-dawn.js') !== -1 && ev.indexOf('Same wall, test file') !== -1, 'test-file DU present');
  T.ok('evidence file records the live ONTOLOGY hunk lines (1977, 1994)', ev.indexOf('1977') !== -1 && ev.indexOf('1994') !== -1, 'hunk lines present');
  T.ok('evidence file records the live green-list hunk lines (803)', ev.indexOf('803') !== -1, 'hunk line present');
  T.ok('evidence file records villager-brain.js ABSENT at the far end', ev.indexOf('ABSENT at the far end') !== -1, 'absent recorded');
  T.ok('evidence file records the abort retry (not-uptodate, refresh, rc=0)',
    ev.indexOf('not uptodate') !== -1 && ev.indexOf('update-index --refresh') !== -1, 'abort retry recorded');
  T.ok('evidence file records that the cherry-pick was aborted and the tree verified clean',
    ev.indexOf('cherry-pick --abort') !== -1 && ev.indexOf('verified clean') !== -1, 'abort + clean recorded');
  T.ok('evidence file proposes the narrowed 7b route as a coordinator decision, not this arm\'s call',
    ev.indexOf('narrowed') !== -1 && ev.indexOf('coordinator decision') !== -1, '7b note present');
  T.ok('evidence file records that the conflicts are NOT tooling-only',
    ev.indexOf('NOT tooling-only') !== -1, 'tooling-only analysis present');

  // ---- 8. No corpus ----
  T.section('8. No corpus — no judged sim ran');
  const sumPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  const logPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  const corpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  T.ok('no step summary exists for t7-23245d5d6', !fs.existsSync(sumPath), 'absent');
  T.ok('no driver log exists for t7-23245d5d6', !fs.existsSync(logPath), 'absent');
  T.ok('no per-seed corpus exists for t7-23245d5d6', !fs.existsSync(corpusDir), 'absent');

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
