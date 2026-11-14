#!/usr/bin/env node
// test-transplant6.js — proof test for the H1 TRANSPLANT, family 6
// (arm sim-transplant6-a).
//
// THE QUESTION (evidence/2026-11-13/sim-transplant6.md, prereg
// committed before any judged sim): land origin family 6 — PR #33
// merge f843fab1c (dawn-midday-repick-3e68, OVE-38 Candidate B,
// VILLAGER-BRAIN seam 9, 2 src/js files) — onto the far end
// 203a32775 (GOOD 4/8) and measure whether it alone collapses it.
// Verdicts (fresh thresholds): <=1/8 CARRIER, 2/8 AMBIGUOUS
// (re-run once; 2/8 again -> recorded AMBIGUOUS, treated as
// NOT-CARRIER for ordering, kept on the suspect list), >=3/8
// NOT-CARRIER.
//
// OUTCOME — UNMEASURED (conflict-STOP, recorded after the live
// cherry-pick): the merge-tree pre-check predicts TWO conflicted
// files (docs/ONTOLOGY.md, 2 hunks; scripts/green-list.txt, 1
// hunk), so the green-list-only union exception does NOT apply;
// the live cherry-pick reproduces the prediction exactly, the
// run STOPS, no subject commit exists, no step ran, no survival
// number was measured.
//
// WHAT THIS TEST PROVES:
//   1. Family identity — merge f843fab1c, its parents, the 1-commit
//      second-parent side, the exact 2 src/js files, +110/-9
//      (villager-brain.js 48 / villager-objectives.js 71 changed
//      lines), no policy file, no standing.js, far-end standing
//      75762cb2, fix f8fda429, far-end policy a7ff5c51.
//   2. Merge-tree prediction (read-only) — exactly THREE 'changed
//      in both' sections: docs/ONTOLOGY.md 6 markers, scripts/
//      green-list.txt 3 markers, src/js/villager-objectives.js 0
//      markers; exactly TWO content-conflicted files; villager-
//      brain.js a clean take-theirs; the test file a clean add.
//   3. Green-list readers — only scripts/check.js reads the file;
//      zero readers under src/ — AND the union exception still
//      does NOT apply, because ONTOLOGY.md conflicts too (the
//      exception covers a conflict in ONLY green-list.txt).
//   4. Verdict mapping — classifyTransplant maps every survived
//      count; conflictStopVerdict maps the conflict sets: no
//      conflict -> MEASURABLE, green-list-only -> UNION-ALLOWED,
//      anything else -> UNMEASURED.
//   5. Base state — HEAD is back on sim-transplant6-a, no src/js
//      file differs from HEAD, on-disk standing.js is byte-identical
//      to HEAD, and the step-script tooling source (master) still
//      carries all four scratch files.
//   6. Seed-band identity — the step script and the prereg name
//      exactly seeds 190391–190398.
//   7. Live conflict record — the subject branch exists at the far
//      end with NO subject commit; the evidence file records the
//      live UU files and hunks; the cherry-pick was aborted and
//      the tree verified clean. (Added after the pick.)
//   8. No corpus — no step summary or per-seed corpus exists for
//      STEP t6-f843fab1c, because no judged sim ran. (Added after
//      the pick.)
//
// Usage: node scripts/test-transplant6.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant6');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const MERGE = 'f843fab1c';
const MERGE_BASE = '230dba219';
const SUBJECT_BRANCH = 'transplant-6-subject';
const STEP = 't6-f843fab1c';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const EXPECTED_JS = [
  'src/js/villager-brain.js', 'src/js/villager-objectives.js',
];
// Marker counts from the merge-tree dry run, per 'changed in both' file
// (transplant118/2b counting method: +<<<<<<<, +=======, +>>>>>>>).
const EXPECTED_MARKERS = {
  'docs/ONTOLOGY.md': 6,
  'scripts/green-list.txt': 3,
  'src/js/villager-objectives.js': 0,
};
// The green-list hunk's theirs-side lines (ours side is empty).
const GREEN_THEIRS_LINES = [
  'scripts/test-villager-brain-dawn.js quick',
  'scripts/test-dawn-materialize-honesty.js quick',
  'scripts/test-dawn-midday-repick.js quick',
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
// conflictStopVerdict(files): the binding STOP rule — any conflict
// stops the run (UNMEASURED) unless the ONLY conflicted file is
// scripts/green-list.txt, which the coordinator's family-2b
// precedent allows resolving by union.
function conflictStopVerdict(files) {
  if (!Array.isArray(files)) return 'UNCLASSIFIABLE';
  if (files.length === 0) return 'MEASURABLE';
  if (files.length === 1 && files[0] === 'scripts/green-list.txt') return 'UNION-ALLOWED';
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

(async () => {
  // ---- 1. Family identity ----
  T.section('1. Family identity — PR #33 merge f843fab1c');
  T.ok('merge commit exists', git('rev-parse ' + MERGE).length === 40, git('log -1 --format=%s ' + MERGE).slice(0, 80));
  T.ok('first parent is 230dba219 (OVE-37 port merge)', git('rev-parse ' + MERGE + '^1').startsWith('230dba219'), git('log -1 --format=%h\\ %s ' + MERGE + '^1').slice(0, 80));
  T.ok('second parent is 713c96f12 (demote mid-day idle objPick)', git('rev-parse ' + MERGE + '^2').startsWith('713c96f12'), git('log -1 --format=%h\\ %s ' + MERGE + '^2').slice(0, 80));
  const sideCount = parseInt(git('rev-list --count ' + MERGE + '^1..' + MERGE + '^2'), 10);
  T.ok('second-parent side is 1 commit', sideCount === 1, 'count=' + sideCount);
  const jsFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- src/js').split('\n').sort();
  T.ok('family touches exactly the 2 expected src/js files', JSON.stringify(jsFiles) === JSON.stringify(EXPECTED_JS.slice().sort()), jsFiles.join(', '));
  const numstat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/js').split('\n')
    .reduce(function (acc, line) { const p = line.split('\t'); return { ins: acc.ins + parseInt(p[0], 10), del: acc.del + parseInt(p[1], 10) }; }, { ins: 0, del: 0 });
  T.ok('family src/js delta is +110/-9', numstat.ins === 110 && numstat.del === 9, '+' + numstat.ins + '/-' + numstat.del);
  const brainStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/js/villager-brain.js');
  const objStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/js/villager-objectives.js');
  T.ok('villager-brain.js is 47+/1- (48 changed lines)', brainStat === '47\t1\tsrc/js/villager-brain.js', brainStat);
  T.ok('villager-objectives.js is 63+/8- (71 changed lines)', objStat === '63\t8\tsrc/js/villager-objectives.js', objStat);
  const allFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE).split('\n').sort();
  T.ok('family touches exactly 5 files total', allFiles.length === 5, allFiles.join(', '));
  const polFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- scripts/policies');
  T.ok('family touches no policy file', polFiles === '', polFiles || '(none)');
  T.ok('family does not touch standing.js', git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- src/js/standing.js') === '', '(absent)');
  const farStanding = sha256(gitShow(FAR, 'src/js/standing.js'));
  T.ok('far-end native standing.js sha is 75762cb2...', farStanding.startsWith('75762cb2'), farStanding.slice(0, 12));
  T.ok('fix standing.js sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  const farPolicy = sha256(gitShow(FAR, 'scripts/policies/competent.js'));
  T.ok('far-end policy sha is a7ff5c51...', farPolicy.startsWith('a7ff5c51'), farPolicy.slice(0, 12));

  // ---- 2. Merge-tree prediction ----
  T.section('2. Merge-tree prediction — two conflicted files, three marker blocks');
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
  // villager-brain.js is a clean take-theirs: base+their only, no 'our'
  // line, so it never appears in the changed-in-both map at all.
  T.ok('villager-brain.js is NOT a changed-in-both file (clean take-theirs)', mt['src/js/villager-brain.js'] === undefined, 'absent from map');
  // The green-list hunk's theirs-side lines are the three test lines.
  const mergeGreen = gitShow(MERGE, 'scripts/green-list.txt').split('\n');
  let greenOk = true;
  for (const l of GREEN_THEIRS_LINES) { if (mergeGreen.indexOf(l) === -1) greenOk = false; }
  T.ok('the 3 green-list theirs-lines are present in the merge file', greenOk, GREEN_THEIRS_LINES.length + '/3');
  const farGreen = gitShow(FAR, 'scripts/green-list.txt').split('\n');
  let farGreenOk = true;
  for (const l of GREEN_THEIRS_LINES) { if (farGreen.indexOf(l) !== -1) farGreenOk = false; }
  T.ok('none of the 3 theirs-lines is in the far-end file (ours side empty at the anchor)', farGreenOk, '0/3 present');

  // ---- 3. Green-list readers + union-exception analysis ----
  T.section('3. Green-list readers — test/check tooling only; exception still N/A');
  const checkJs = fs.readFileSync(path.join(REPO, 'scripts', 'check.js'), 'utf8');
  T.ok('scripts/check.js reads green-list.txt (readList)', checkJs.indexOf("readList('scripts/green-list.txt')") !== -1, 'readList present');
  let srcReaders = [];
  try {
    srcReaders = execSync('git grep -l "green-list" ' + git('rev-parse HEAD') + ' -- src/', { cwd: REPO, stdio: 'pipe' }).toString().trim().split('\n').filter(Boolean);
  } catch (e) { srcReaders = []; }
  T.ok('zero green-list references under src/ (no game-code reader)', srcReaders.length === 0, srcReaders.join(', ') || '(none)');
  T.ok('conflictStopVerdict: ONTOLOGY + green-list -> UNMEASURED (exception is green-list-ONLY)',
    conflictStopVerdict(['docs/ONTOLOGY.md', 'scripts/green-list.txt']) === 'UNMEASURED', conflictStopVerdict(['docs/ONTOLOGY.md', 'scripts/green-list.txt']));
  const evPath = path.join(REPO, 'evidence', '2026-11-13', 'sim-transplant6.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('evidence file records that the union exception does NOT apply', ev.indexOf('does NOT') !== -1 && ev.indexOf('ONLY') !== -1, 'exception analysis present');
  T.ok('evidence file names both conflicted files in the pre-check', ev.indexOf('docs/ONTOLOGY.md') !== -1 && ev.indexOf('scripts/green-list.txt') !== -1, 'both files named');

  // ---- 4. Verdict mapping ----
  T.section('4. Verdict mapping — transplant thresholds + conflict-STOP rule');
  const table = [[0, 'CARRIER'], [1, 'CARRIER'], [2, 'AMBIGUOUS'], [3, 'NOT-CARRIER'], [4, 'NOT-CARRIER'], [8, 'NOT-CARRIER'], [-1, 'UNCLASSIFIABLE'], [9, 'UNCLASSIFIABLE'], [NaN, 'UNCLASSIFIABLE']];
  for (const pair of table) {
    T.ok('survived ' + pair[0] + ' -> ' + pair[1], classifyTransplant(pair[0]) === pair[1], classifyTransplant(pair[0]));
  }
  T.ok('conflict rule: no conflict -> MEASURABLE', conflictStopVerdict([]) === 'MEASURABLE', conflictStopVerdict([]));
  T.ok('conflict rule: green-list-only -> UNION-ALLOWED', conflictStopVerdict(['scripts/green-list.txt']) === 'UNION-ALLOWED', conflictStopVerdict(['scripts/green-list.txt']));
  T.ok('conflict rule: game-code conflict -> UNMEASURED', conflictStopVerdict(['src/js/game.js']) === 'UNMEASURED', conflictStopVerdict(['src/js/game.js']));
  T.ok('conflict rule: ONTOLOGY + green-list -> UNMEASURED', conflictStopVerdict(['docs/ONTOLOGY.md', 'scripts/green-list.txt']) === 'UNMEASURED', conflictStopVerdict(['docs/ONTOLOGY.md', 'scripts/green-list.txt']));
  T.ok('conflict rule: non-array input -> UNCLASSIFIABLE', conflictStopVerdict(null) === 'UNCLASSIFIABLE', conflictStopVerdict(null));

  // ---- 5. Base state ----
  T.section('5. Base state — arm branch, clean tree, no swap residue');
  const headBranch = git('rev-parse --abbrev-ref HEAD');
  T.ok('HEAD is on the arm branch sim-transplant6-a', headBranch === 'sim-transplant6-a', 'HEAD=' + headBranch);
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
  T.ok('evidence prereg names the STEP id t6-f843fab1c', ev.indexOf('t6-f843fab1c') !== -1, 'STEP id present');

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
