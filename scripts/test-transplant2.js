#!/usr/bin/env node
// test-transplant2.js — proof test for the H1 TRANSPLANT, family 2
// (arm sim-transplant2-a).
//
// THE QUESTION (evidence/2026-11-13/sim-transplant2.md, prereg
// committed before any judged sim): land origin family 2 — PR #6
// merge 7ddcdfff9 (raid-danger-heard-c0a3, 2 commits on the
// second-parent side, 4 src/js files) — onto the far end 203a32775
// (GOOD 4/8) and measure whether it alone collapses it. Verdicts
// (fresh thresholds): <=1/8 CARRIER, 2/8 AMBIGUOUS (re-run once),
// >=3/8 NOT-CARRIER.
//
// OUTCOME — STOP AT THE CHERRY-PICK (recorded in the evidence file):
// `git cherry-pick -m 1 7ddcdfff9` onto the far end CONFLICTED on
// exactly ONE file: scripts/green-list.txt (a test list, not game
// code). All four src/js files applied cleanly and the two files the
// far end lacked added cleanly. Per the prereg the run STOPPED
// without hand-resolving: no subject commit exists, no step ran, no
// survival number was measured. The verdict for family 2 is
// UNMEASURED, not CARRIER and not NOT-CARRIER.
//
// WHAT THIS TEST PROVES (for the STOP state):
//   1. Family identity — merge 7ddcdfff9, its parents, the 2-commit
//      second-parent side, the exact 4 src/js files, +71/-62.
//   2. No subject — the scratch branch transplant-2-subject exists
//      and still points at the far end (no commit on top of it), and
//      its tree is identical to the far end (the family diff was NOT
//      applied). The 2 files the far end lacked are absent at the
//      far end AND at the merge base, present at the merge (clean
//      additions, not missing substrate).
//   2b. Conflict reproduced without touching the tree — `git
//      merge-tree 21ae2d6968 203a32775 7ddcdfff9` reports exactly the
//      same ONE content conflict (green-list.txt, 3 markers) and
//      shows the other three 'changed in both' files merging cleanly
//      (0 markers).
//   3. Conflict recorded — the evidence file states the STOP, names
//      the conflict file, and records NO subject hash.
//   4. Verdict mapping — classifyTransplant maps every survived
//      count to CARRIER / AMBIGUOUS / NOT-CARRIER / UNCLASSIFIABLE.
//   5. No corpus — no step corpus and no summary exist for STEP
//      t2-7ddcdfff9 (the run correctly stopped before measuring).
//   6. Base restored — HEAD is back on sim-transplant2-a, no src/js
//      file differs from HEAD, on-disk standing.js is byte-identical
//      to HEAD, and the step-script tooling source (master) still
//      carries all four scratch files.
//   7. Seed-band identity — the step script and the prereg name
//      exactly seeds 190391–190398.
//
// Usage: node scripts/test-transplant2.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant2');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const MERGE = '7ddcdfff9';
const MERGE_BASE = '21ae2d6968';
const SUBJECT_BRANCH = 'transplant-2-subject';
const STEP = 't2-7ddcdfff9';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const EXPECTED_JS = [
  'src/js/game.js', 'src/js/npc-triggers.js',
  'src/js/villager-goals.js', 'src/js/villager-objectives.js',
];
// The ONE file the live cherry-pick left unmerged (git status, verbatim).
const CONFLICT_UU = ['scripts/green-list.txt'];
// The two files the far end lacked, added cleanly by the pick.
const ADDED_CLEAN = [
  'evidence/2026-11-08/raid-danger-heard.md',
  'scripts/test-raid-danger-heard.js',
];
// Marker counts from the merge-tree dry run, per 'changed in both' file
// (transplant118 counting method: +<<<<<<<, +=======, +>>>>>>>).
const EXPECTED_MARKERS = {
  'docs/ONTOLOGY.md': 0,
  'scripts/green-list.txt': 3,
  'src/js/game.js': 0,
  'src/js/villager-objectives.js': 0,
};

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
  T.section('1. Family identity — PR #6 merge 7ddcdfff9');
  T.ok('merge commit exists', git('rev-parse ' + MERGE).length === 40, git('log -1 --format=%s ' + MERGE).slice(0, 80));
  T.ok('first parent is 21ae2d6968 (PR #5 merge)', git('rev-parse ' + MERGE + '^1').startsWith('21ae2d6968'), git('log -1 --format=%h\\ %s ' + MERGE + '^1').slice(0, 80));
  T.ok('second parent is dff2cd523 (raid-branch merge)', git('rev-parse ' + MERGE + '^2').startsWith('dff2cd523'), git('log -1 --format=%h\\ %s ' + MERGE + '^2').slice(0, 80));
  const sideCount = parseInt(git('rev-list --count ' + MERGE + '^1..' + MERGE + '^2'), 10);
  T.ok('second-parent side is 2 commits (merge + unify raid danger)', sideCount === 2, 'count=' + sideCount);
  const jsFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- src/js').split('\n').sort();
  T.ok('family touches exactly the 4 expected src/js files', JSON.stringify(jsFiles) === JSON.stringify(EXPECTED_JS.slice().sort()), jsFiles.join(', '));
  const numstat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/js').split('\n')
    .reduce(function (acc, line) { const p = line.split('\t'); return { ins: acc.ins + parseInt(p[0], 10), del: acc.del + parseInt(p[1], 10) }; }, { ins: 0, del: 0 });
  T.ok('family src/js delta is +71/-62', numstat.ins === 71 && numstat.del === 62, '+' + numstat.ins + '/-' + numstat.del);
  const polFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- scripts/policies');
  T.ok('family touches no policy file', polFiles === '', polFiles || '(none)');
  T.ok('family does not touch standing.js', git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- src/js/standing.js') === '', '(absent)');
  const farStanding = sha256(gitShow(FAR, 'src/js/standing.js'));
  T.ok('far-end native standing.js sha is 75762cb2...', farStanding.startsWith('75762cb2'), farStanding.slice(0, 12));
  T.ok('fix standing.js sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  const farPolicy = sha256(gitShow(FAR, 'scripts/policies/competent.js'));
  T.ok('far-end policy sha is a7ff5c51...', farPolicy.startsWith('a7ff5c51'), farPolicy.slice(0, 12));

  // ---- 2. No subject (STOP state) ----
  T.section('2. No subject — branch left at the far end, family NOT applied');
  let subject = null;
  try { subject = git('rev-parse ' + SUBJECT_BRANCH); } catch (e) { subject = null; }
  T.ok('subject branch exists', subject !== null && subject.length === 40, subject ? subject.slice(0, 12) : '(missing)');
  if (subject) {
    T.ok('subject branch still points at the far end (no subject commit)', subject === FAR_FULL, subject.slice(0, 12));
    const treeDiff = git('diff --name-only ' + FAR + ' ' + SUBJECT_BRANCH);
    T.ok('subject tree is identical to the far end (family diff NOT applied)', treeDiff === '', treeDiff.slice(0, 200) || '(empty)');
  }
  let addOk = true, addBad = null;
  for (const f of ADDED_CLEAN) {
    const atFar = git('ls-tree ' + FAR + ' -- ' + f);
    const atBase = git('ls-tree ' + MERGE_BASE + ' -- ' + f);
    const atMerge = git('ls-tree ' + MERGE + ' -- ' + f);
    if (atFar !== '' || atBase !== '' || atMerge === '') { addOk = false; addBad = f; break; }
  }
  T.ok('both added files are absent at far end AND base, present at the merge (clean additions)', addOk, addBad ? 'fails: ' + addBad : '2/2');

  // ---- 2b. Conflict reproduced by merge-tree (read-only) ----
  T.section('2b. Conflict reproduced — git merge-tree dry run');
  const mt = mergeTreeConflicts();
  let mtOk = true, mtBad = null;
  for (const f of Object.keys(EXPECTED_MARKERS)) {
    if (mt[f] !== EXPECTED_MARKERS[f]) { mtOk = false; mtBad = f + ' (got ' + mt[f] + ', want ' + EXPECTED_MARKERS[f] + ')'; break; }
  }
  T.ok('merge-tree reports the same conflict set with the same marker counts', mtOk, mtBad || '4/4 match');
  T.ok('merge-tree reports exactly ONE content-conflicted file', Object.keys(mt).filter(function (f) { return mt[f] > 0; }).length === 1, 'conflicted=' + Object.keys(mt).filter(function (f) { return mt[f] > 0; }).join(', '));
  T.ok('merge-tree shows all four src/js family files merging cleanly (0 markers)', mt['src/js/game.js'] === 0 && mt['src/js/villager-objectives.js'] === 0, 'game.js=' + mt['src/js/game.js'] + ' villager-objectives.js=' + mt['src/js/villager-objectives.js']);
  T.ok('merge-tree reports no other changed-in-both file', Object.keys(mt).length === 4, 'sections=' + Object.keys(mt).length + ': ' + Object.keys(mt).join(', '));

  // ---- 3. Conflict recorded ----
  T.section('3. Conflict recorded in the evidence file');
  const evPath = path.join(REPO, 'evidence', '2026-11-13', 'sim-transplant2.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('evidence file states the cherry-pick conflict STOP', ev.indexOf('Cherry-pick conflict — STOP') !== -1, 'STOP section present');
  T.ok('evidence file records NO subject commit', ev.indexOf('Subject commit: NONE') !== -1, 'NONE recorded');
  let recOk = true, recBad = null;
  for (const f of CONFLICT_UU.concat(ADDED_CLEAN)) {
    if (ev.indexOf(f) === -1) { recOk = false; recBad = f; break; }
  }
  T.ok('evidence file names the conflict file and both clean additions', recOk, recBad ? 'missing: ' + recBad : '3/3');
  T.ok('evidence file records the verdict as UNMEASURED', ev.indexOf('UNMEASURED') !== -1, 'UNMEASURED present');

  // ---- 4. Verdict mapping ----
  T.section('4. Verdict mapping — transplant thresholds');
  const table = [[0, 'CARRIER'], [1, 'CARRIER'], [2, 'AMBIGUOUS'], [3, 'NOT-CARRIER'], [4, 'NOT-CARRIER'], [8, 'NOT-CARRIER'], [-1, 'UNCLASSIFIABLE'], [9, 'UNCLASSIFIABLE'], [NaN, 'UNCLASSIFIABLE']];
  for (const pair of table) {
    T.ok('survived ' + pair[0] + ' -> ' + pair[1], classifyTransplant(pair[0]) === pair[1], classifyTransplant(pair[0]));
  }

  // ---- 5. No corpus (stopped before measuring) ----
  T.section('5. No corpus — the run stopped before any sim');
  const corpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  const summaryPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  T.ok('no step corpus directory exists', !fs.existsSync(corpusDir), corpusDir);
  T.ok('no step summary exists', !fs.existsSync(summaryPath), summaryPath);

  // ---- 6. Base restored ----
  T.section('6. Base restored — arm branch clean, no swap residue');
  const headBranch = git('rev-parse --abbrev-ref HEAD');
  T.ok('HEAD is back on the arm branch sim-transplant2-a', headBranch === 'sim-transplant2-a', 'HEAD=' + headBranch);
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

  // ---- 7. Seed-band identity ----
  T.section('7. Seed-band identity');
  const stepSrc = fs.readFileSync(path.join(REPO, 'scripts', 'culpritbisect-step.sh'), 'utf8');
  T.ok('step script names the band 190391..190398',
    stepSrc.indexOf('190391,190392,190393,190394,190395,190396,190397,190398') !== -1, 'band literal present');
  T.ok('evidence prereg names the same band', ev.indexOf('190391') !== -1 && ev.indexOf('190398') !== -1, 'band in prereg');

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
