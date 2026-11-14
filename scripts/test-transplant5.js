#!/usr/bin/env node
// test-transplant5.js — proof test for the H1 TRANSPLANT, family 5
// (arm sim-transplant5-a).
//
// THE QUESTION (evidence/2026-11-13/sim-transplant5.md, prereg
// committed before any judged sim): land origin family 5 — PR #120
// merge abb3c2db2 (garden-measurement-0315, 1 commit on the
// second-parent side, 3 policy files, 0 src/js files) — onto the far
// end 203a32775 (GOOD 4/8) and measure whether it alone collapses
// it. Verdicts (fresh thresholds): <=1/8 CARRIER, 2/8 AMBIGUOUS
// (re-run once), >=3/8 NOT-CARRIER.
//
// OUTCOME — STOP AT THE CHERRY-PICK (recorded in the evidence file):
// `git cherry-pick -m 1 abb3c2db2` onto the far end CONFLICTED on
// exactly ONE file: scripts/balance-proof.json (a proof-pointer
// file, not game code, not green-list.txt). All three policy files,
// the panel corpus and occupation-fixtures.json applied cleanly. The
// conflict is NOT in scripts/green-list.txt, so the coordinator's
// union exception does NOT apply. Per the prereg the run STOPPED
// without hand-resolving: no subject commit exists, no step ran, no
// survival number was measured. The verdict for family 5 is
// UNMEASURED, not CARRIER and not NOT-CARRIER.
//
// WHAT THIS TEST PROVES (for the STOP state):
//   1. Family identity — merge abb3c2db2, its parents, the 1-commit
//      second-parent side, exactly the 3 policy files (+8/-3 each),
//      0 src/js files, the 6-file list, +35/-12.
//   1b. Policy mechanics — the driver loads competent.js from the
//      checked-out tree (REPO-relative require), the step script
//      restores only the 4 tooling scratch files (no policy file),
//      the bisect leg guard is record-only for policy, and the
//      driver loads ONLY competent.js (the nofallback variants ride
//      along unmeasured).
//   2. No subject — the scratch branch transplant-5-subject exists
//      and still points at the far end (no commit on top of it), and
//      its tree is identical to the far end (the family diff was NOT
//      applied). The panel corpus the far end lacked is absent at
//      the far end AND at the first parent, present at the merge
//      (clean addition, not missing substrate).
//   2b. Conflict reproduced without touching the tree — `git
//      merge-tree da153118c 203a32775 abb3c2db2` reports exactly the
//      same ONE content conflict (balance-proof.json, 3 markers)
//      and shows the three policy files merging cleanly (merged
//      sections, result == theirs, 0 markers).
//   3. Conflict recorded — the evidence file states the STOP, names
//      the conflict file, records NO subject hash, and records the
//      verdict as UNMEASURED.
//   4. Verdict mapping — classifyTransplant maps every survived
//      count to CARRIER / AMBIGUOUS / NOT-CARRIER / UNCLASSIFIABLE.
//   5. No corpus — no step corpus and no summary exist for STEP
//      t5-abb3c2db2 (the run correctly stopped before measuring).
//   6. Base restored — HEAD is back on sim-transplant5-a, no src/js
//      file differs from HEAD, on-disk standing.js is byte-identical
//      to HEAD, and the step-script tooling source (master) still
//      carries all four scratch files.
//   7. Seed-band identity — the step script and the prereg name
//      exactly seeds 190391–190398.
//
// Usage: node scripts/test-transplant5.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant5');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const MERGE = 'abb3c2db2';
const MERGE_BASE = 'da153118c';
const SUBJECT_BRANCH = 'transplant-5-subject';
const STEP = 't5-abb3c2db2';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const EXPECTED_POL = [
  'scripts/policies/competent-nofallback-socialD.js',
  'scripts/policies/competent-nofallback.js',
  'scripts/policies/competent.js',
];
const EXPECTED_FILES = [
  'evidence/2026-11-09/neutral-ove160-garden-measurement-panel.json.gz',
  'scripts/balance-proof.json',
  'scripts/godpath/occupation-fixtures.json',
  'scripts/policies/competent-nofallback-socialD.js',
  'scripts/policies/competent-nofallback.js',
  'scripts/policies/competent.js',
];
// The ONE file the live cherry-pick left unmerged (git status, verbatim).
const CONFLICT_UU = ['scripts/balance-proof.json'];
// The one file the far end lacked, added cleanly by the pick.
const ADDED_CLEAN = [
  'evidence/2026-11-09/neutral-ove160-garden-measurement-panel.json.gz',
];
// Marker counts from the merge-tree dry run, per 'changed in both' file
// (transplant118 counting method: +<<<<<<<, +=======, +>>>>>>>).
const EXPECTED_MARKERS = { 'scripts/balance-proof.json': 3 };
// The two panel pointers in the conflict hunk: ours (far end) vs theirs.
const OURS_PANEL = 'evidence/2026-11-10/neutral-r167-adopt.json.gz';
const THEIRS_PANEL = 'evidence/2026-11-09/neutral-ove160-garden-measurement-panel.json.gz';

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
// for each 'changed in both' section, plus the raw output for the
// panel-pointer check. Sections end only on a known section header,
// so binary blob lines in other sections cannot end a section early.
function mergeTreeConflicts() {
  const out = execSync('git merge-tree ' + MERGE_BASE + ' ' + FAR + ' ' + MERGE,
    { cwd: REPO, stdio: 'pipe', maxBuffer: 512 * 1024 * 1024 }).toString('utf8');
  const lines = out.split('\n');
  const found = {};
  let cur = null;
  const record = function () { if (cur !== null && cur.file !== null) found[cur.file] = cur.markers; };
  for (const ln of lines) {
    if (/^(added in|removed in|renamed|merged|changed in both)/.test(ln)) {
      record();
      cur = (ln === 'changed in both') ? { file: null, markers: 0 } : null;
      continue;
    }
    if (cur !== null) {
      const m = ln.match(/^  base\s+\d+ [0-9a-f]+ (.+)$/);
      if (m && cur.file === null) cur.file = m[1];
      if (ln.indexOf('+<<<<<<<') === 0 || ln.indexOf('+>>>>>>>') === 0 || ln.indexOf('+=======') === 0) cur.markers++;
    }
  }
  record();
  return { found: found, raw: out };
}

(async () => {
  // ---- 1. Family identity ----
  T.section('1. Family identity — PR #120 merge abb3c2db2');
  T.ok('merge commit exists', git('rev-parse ' + MERGE).length === 40, git('log -1 --format=%s ' + MERGE).slice(0, 80));
  T.ok('first parent is da153118c (PR #119 merge)', git('rev-parse ' + MERGE + '^1').startsWith('da153118c'), git('log -1 --format=%h\\ %s ' + MERGE + '^1').slice(0, 80));
  T.ok('second parent is 91cb6fa20 (OVE-160 commit)', git('rev-parse ' + MERGE + '^2').startsWith('91cb6fa20'), git('log -1 --format=%h\\ %s ' + MERGE + '^2').slice(0, 80));
  const sideCount = parseInt(git('rev-list --count ' + MERGE + '^1..' + MERGE + '^2'), 10);
  T.ok('second-parent side is 1 commit (OVE-160 only)', sideCount === 1, 'count=' + sideCount);
  const jsFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- src/js');
  T.ok('family touches no src/js file (js=0)', jsFiles === '', jsFiles || '(none)');
  const polFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- scripts/policies').split('\n').sort();
  T.ok('family touches exactly the 3 expected policy files (pol=3)', JSON.stringify(polFiles) === JSON.stringify(EXPECTED_POL.slice().sort()), polFiles.join(', '));
  let polOk = true, polBad = null;
  for (const f of EXPECTED_POL) {
    const ns = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- ' + f).split('\t');
    if (parseInt(ns[0], 10) !== 8 || parseInt(ns[1], 10) !== 3) { polOk = false; polBad = f + ' (+' + ns[0] + '/-' + ns[1] + ')'; break; }
  }
  T.ok('each policy file is the same 11-line change (+8/-3)', polOk, polBad || '3/3 +8/-3');
  const allFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE).split('\n').sort();
  T.ok('family file list is exactly the 6 expected files', JSON.stringify(allFiles) === JSON.stringify(EXPECTED_FILES.slice().sort()), allFiles.join(', '));
  const tot = git('diff --numstat ' + MERGE + '^1 ' + MERGE).split('\n')
    .reduce(function (acc, line) { const p = line.split('\t'); const ins = parseInt(p[0], 10), del = parseInt(p[1], 10); return { ins: acc.ins + (Number.isFinite(ins) ? ins : 0), del: acc.del + (Number.isFinite(del) ? del : 0) }; }, { ins: 0, del: 0 });
  T.ok('family total delta is +35/-12', tot.ins === 35 && tot.del === 12, '+' + tot.ins + '/-' + tot.del);
  T.ok('family does not touch standing.js', git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- src/js/standing.js') === '', '(absent)');
  const farStanding = sha256(gitShow(FAR, 'src/js/standing.js'));
  T.ok('far-end native standing.js sha is 75762cb2...', farStanding.startsWith('75762cb2'), farStanding.slice(0, 12));
  T.ok('fix standing.js sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  const farPolicy = sha256(gitShow(FAR, 'scripts/policies/competent.js'));
  T.ok('far-end policy sha is a7ff5c51...', farPolicy.startsWith('a7ff5c51'), farPolicy.slice(0, 12));
  const mergePolicy = sha256(gitShow(MERGE, 'scripts/policies/competent.js'));
  T.ok('merge policy sha is 26a87e49...', mergePolicy.startsWith('26a87e49'), mergePolicy.slice(0, 12));
  const basePolicy = sha256(gitShow(MERGE_BASE, 'scripts/policies/competent.js'));
  T.ok('first-parent policy equals the far-end policy (no far-end policy drift)', basePolicy === farPolicy, basePolicy.slice(0, 12));
  // The moved appointment block is byte-identical in all three files.
  const block = 'Appoint while residents are still at Haven';
  let blockOk = true;
  for (const f of EXPECTED_POL) {
    if (gitShow(MERGE, f).indexOf(block) === -1 || gitShow(FAR, f).indexOf(block) !== -1) { blockOk = false; break; }
  }
  T.ok('the appoint-first comment exists in all 3 merge policy files, in none at the far end', blockOk, blockOk ? '3/3' : 'mismatch');

  // ---- 1b. Policy mechanics (first policy family) ----
  T.section('1b. Policy mechanics — the driver loads the SUBJECT policy');
  const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'culpritbisect-driver-20261113.js'), 'utf8');
  T.ok('driver requires competent.js relative to REPO (the checked-out tree)',
    driverSrc.indexOf("require(path.join(REPO, 'scripts', 'policies', 'competent'))") !== -1, 'REPO-relative require present');
  T.ok('driver loads ONLY competent.js (no nofallback require)',
    driverSrc.indexOf('competent-nofallback') === -1, 'no nofallback require in driver');
  T.ok('driver leg guard is record-only for policy (policySha null = any policy, sha recorded)',
    driverSrc.indexOf('policySha: null') !== -1, 'policySha: null present');
  const stepSrc = fs.readFileSync(path.join(REPO, 'scripts', 'culpritbisect-step.sh'), 'utf8');
  const scratch = ['scripts/culpritbisect-driver-20261113.js', 'scripts/culpritbisect-analyze-20261113.js', 'scripts/masterregress-analyze-20261113.js', 'scripts/vetfirst-instrument-20261111.js'];
  let scratchOk = true;
  for (const f of scratch) { if (stepSrc.indexOf(f) === -1) { scratchOk = false; break; } }
  T.ok('step script restores exactly the 4 tooling scratch files from master', scratchOk, scratchOk ? '4/4 named' : 'missing');
  const scratchLoop = stepSrc.slice(stepSrc.indexOf('for f in scripts/culpritbisect-driver'));
  T.ok('step script restores NO policy file as scratch (the restore loop names only the 4 tooling files)',
    scratchLoop.indexOf('for f in scripts/culpritbisect-driver') === 0 && scratchLoop.slice(0, scratchLoop.indexOf('; do')).indexOf('policies') === -1, 'restore loop is tooling-only');
  T.ok('evidence records the nofallback variants as unmeasured (ride along, not judged)',
    fs.readFileSync(path.join(REPO, 'evidence', '2026-11-13', 'sim-transplant5.md'), 'utf8').indexOf('were NOT measured') !== -1, 'not-measured note present');

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
  T.ok('the panel corpus is absent at far end AND base, present at the merge (clean addition)', addOk, addBad ? 'fails: ' + addBad : '1/1');

  // ---- 2b. Conflict reproduced by merge-tree (read-only) ----
  T.section('2b. Conflict reproduced — git merge-tree dry run');
  const mt = mergeTreeConflicts();
  let mtOk = true, mtBad = null;
  for (const f of Object.keys(EXPECTED_MARKERS)) {
    if (mt.found[f] !== EXPECTED_MARKERS[f]) { mtOk = false; mtBad = f + ' (got ' + mt.found[f] + ', want ' + EXPECTED_MARKERS[f] + ')'; break; }
  }
  T.ok('merge-tree reports the same conflict set with the same marker counts', mtOk, mtBad || '1/1 match');
  T.ok('merge-tree reports exactly ONE content-conflicted file', Object.keys(mt.found).filter(function (f) { return mt.found[f] > 0; }).length === 1, 'conflicted=' + Object.keys(mt.found).filter(function (f) { return mt.found[f] > 0; }).join(', '));
  T.ok('merge-tree reports no other changed-in-both file', Object.keys(mt.found).length === 1, 'sections=' + Object.keys(mt.found).length + ': ' + Object.keys(mt.found).join(', '));
  T.ok('merge-tree conflict hunk carries the far-end r167 panel pointer (ours)', mt.raw.indexOf(OURS_PANEL) !== -1, OURS_PANEL);
  T.ok('merge-tree conflict hunk carries the family ove160 panel pointer (theirs)', mt.raw.indexOf(THEIRS_PANEL) !== -1, THEIRS_PANEL);
  let polMergeOk = true, polMergeBad = null;
  for (const f of EXPECTED_POL) {
    const mergeBlob = git('rev-parse ' + MERGE + ':' + f);
    if (mt.raw.indexOf('  result 100644 ' + mergeBlob + ' ' + f) === -1) { polMergeOk = false; polMergeBad = f; break; }
  }
  T.ok('merge-tree merges all three policy files cleanly (merged sections, result == theirs)', polMergeOk, polMergeBad ? 'no clean merge for: ' + polMergeBad : '3/3 clean');

  // ---- 3. Conflict recorded ----
  T.section('3. Conflict recorded in the evidence file');
  const evPath = path.join(REPO, 'evidence', '2026-11-13', 'sim-transplant5.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('evidence file states the cherry-pick conflict STOP', ev.indexOf('Cherry-pick conflict — STOP') !== -1, 'STOP section present');
  T.ok('evidence file records NO subject commit', ev.indexOf('Subject commit: NONE') !== -1, 'NONE recorded');
  let recOk = true, recBad = null;
  for (const f of CONFLICT_UU.concat(ADDED_CLEAN)) {
    if (ev.indexOf(f) === -1) { recOk = false; recBad = f; break; }
  }
  T.ok('evidence file names the conflict file and the clean addition', recOk, recBad ? 'missing: ' + recBad : '2/2');
  T.ok('evidence file records the verdict as UNMEASURED', ev.indexOf('UNMEASURED') !== -1, 'UNMEASURED present');
  T.ok('evidence file records that the union exception does NOT apply (not green-list.txt)', ev.indexOf('does NOT apply') !== -1, 'exception note present');

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
  T.ok('HEAD is back on the arm branch sim-transplant5-a', headBranch === 'sim-transplant5-a', 'HEAD=' + headBranch);
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
  T.ok('step script names the band 190391..190398',
    stepSrc.indexOf('190391,190392,190393,190394,190395,190396,190397,190398') !== -1, 'band literal present');
  T.ok('evidence prereg names the same band', ev.indexOf('190391') !== -1 && ev.indexOf('190398') !== -1, 'band in prereg');

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
