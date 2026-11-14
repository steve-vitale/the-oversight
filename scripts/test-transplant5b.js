#!/usr/bin/env node
// test-transplant5b.js — proof test for the H1 TRANSPLANT, narrowed
// family 5b (arm sim-transplant5b-a).
//
// THE QUESTION (evidence/2026-11-13/sim-transplant5b-prereg.md,
// committed before cutting the subject or running any judged sim):
// land origin family 5 — PR #120 merge abb3c2db2
// (garden-measurement-0315, 1 commit on the second-parent side, 3
// policy files, 0 src/js files) — onto the far end 203a32775 (GOOD
// 4/8) as NARROWED family 5b: the cherry-pick conflict confined to
// scripts/balance-proof.json (zero src/ readers) is resolved by
// taking the far-end (ours) pointer. Measure whether the garden-
// keeper appointment reorder alone collapses the far end. Verdicts:
// <=1/8 CARRIER, 2/8 AMBIGUOUS (re-run once), >=3/8 NOT-CARRIER.
//
// Family 5 (arm sim-transplant5-a) was UNMEASURED on exactly this
// conflict; 5b is a NEW family definition under the coordinator's
// narrowed-tooling rule (evidence/2026-11-13/
// sim-transplant-round-0015.md), never a re-judgment of family 5.
//
// WHAT THIS TEST PROVES (prereg stage — before the subject exists):
//   1. Family identity — merge abb3c2db2, its parents, the 1-commit
//      second-parent side, exactly the 3 policy files (+8/-3 each),
//      0 src/js files, the 6-file list, +35/-12.
//   1b. Policy mechanics — the driver loads competent.js from the
//      checked-out tree (REPO-relative require), the step script
//      restores only the 4 tooling scratch files (no policy file),
//      the bisect leg guard is record-only for policy, and the
//      driver loads ONLY competent.js (the nofallback variants ride
//      along unmeasured).
//   1c. Narrowed-tooling justification — balance-proof.json has
//      ZERO readers in src/ (git grep), the merge-tree predicts the
//      conflict confined to that one file, the prereg records the
//      narrowed definition, and no src/js file is in the family.
//   2. Subject built — the scratch branch transplant-5b-subject
//      exists on top of the far end (the live pick conflicted ONLY
//      on balance-proof.json, resolved ours per the narrowed
//      definition); the panel corpus is absent at the far end AND
//      at the first parent, present at the merge (clean addition,
//      not missing substrate).
//   2b. Conflict predicted by merge-tree (read-only) — `git
//      merge-tree da153118c 203a32775 abb3c2db2` reports exactly the
//      same ONE content conflict (balance-proof.json, 3 markers)
//      and shows the three policy files + occupation-fixtures
//      merging cleanly (merged sections, result == theirs, 0
//      markers), with no DU / src/js section.
//   3. Prereg recorded — the prereg file states the narrowed
//      definition, the STEP id, the verdict thresholds, the seed
//      band, and the nofallback-variants-unmeasured note.
//   4. Verdict mapping — classifyTransplant maps every survived
//      count to CARRIER / AMBIGUOUS / NOT-CARRIER / UNCLASSIFIABLE.
//   5. Corpus exists — the step corpus + summary exist for STEP
//      t5b-abb3c2db2 (detail checked in §9).
//   6. Base restored — HEAD is on sim-transplant5b-a, no src/js
//      file differs from HEAD, on-disk standing.js is byte-identical
//      to HEAD, and the step-script tooling source (master) still
//      carries all four scratch files.
//   7. Seed-band identity — the step script and the prereg name
//      exactly seeds 190391–190398.
//
// MEASURED OUTCOME (evidence/2026-11-13/sim-transplant5b.md):
// subject c3e2970e85d51d117c94cf97bd0d14933c2b650f, STEP
// t5b-abb3c2db2, survived 4/8 → NOT-CARRIER. The garden-keeper
// reorder alone does not collapse the far end.
//
// POST-STEP SECTIONS (added after the step runs; the evidence file
// evidence/2026-11-13/sim-transplant5b.md records the verdict):
//   8. Subject state — transplant-5b-subject points at a commit on
//      top of the far end; the subject's three policy files differ
//      from the far end exactly by the family diff (byte-identical
//      measured diff); balance-proof.json on the subject equals the
//      far-end blob (ours); the .gz corpus and occupation-fixtures
//      match the merge.
//   9. Step corpus — the per-seed corpus + summary exist for STEP
//      t5b-abb3c2db2, the summary's survived count matches the
//      evidence verdict, and every per-seed JSON records the
//      subject policySha.
//   10. Base restored (post-step) — same as §6, re-checked after
//      the step checkout + restore.
//
// Usage: node scripts/test-transplant5b.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant5b');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const MERGE = 'abb3c2db2';
const MERGE_BASE = 'da153118c';
const SUBJECT_BRANCH = 'transplant-5b-subject';
const SUBJECT_FULL = 'c3e2970e85d51d117c94cf97bd0d14933c2b650f';
const SUBJECT_POLICY_SHA = '26a87e493578';
const STEP = 't5b-abb3c2db2';
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
// The ONE file the merge-tree predicts as conflicted (and the live
// pick is expected to conflict on, resolved ours per the narrowed
// definition).
const CONFLICT_FILE = 'scripts/balance-proof.json';
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
// NOTE: the parser tracks BOTH 'changed in both' AND 'merged'
// sections (the family-4 arm's stage-1 proof initially missed a
// file by tracking only one kind).
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

  // ---- 1b. Policy mechanics (first policy family, re-verified) ----
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
  const preregPath = path.join(REPO, 'evidence', '2026-11-13', 'sim-transplant5b-prereg.md');
  const prereg = fs.existsSync(preregPath) ? fs.readFileSync(preregPath, 'utf8') : '';
  T.ok('prereg records the nofallback variants as unmeasured (ride along, not judged)',
    prereg.indexOf('were NOT measured') !== -1, 'not-measured note present');

  // ---- 1c. Narrowed-tooling justification ----
  T.section('1c. Narrowed-tooling justification — balance-proof.json has zero src/ readers');
  let srcReaders = '';
  try { srcReaders = execSync('git grep -l "balance-proof" -- src/', { cwd: REPO, stdio: 'pipe' }).toString().trim(); } catch (e) { srcReaders = ''; }
  T.ok('balance-proof.json has ZERO readers in src/ (git grep src/ empty)', srcReaders === '', srcReaders.slice(0, 200) || '(none)');
  let allReaders = '';
  try { allReaders = execSync('git grep -l "balance-proof" -- "*.js" "*.json" "*.txt" "*.sh"', { cwd: REPO, stdio: 'pipe' }).toString().trim(); } catch (e) { allReaders = ''; }
  const readerList = allReaders.split('\n').filter(Boolean);
  const toolingOnly = readerList.every(function (f) {
    return f.indexOf('scripts/') === 0 || f.indexOf('evidence/') === 0;
  });
  T.ok('every balance-proof reader is measurement/proof tooling or evidence (no game code)',
    toolingOnly && readerList.length > 0, readerList.length + ' readers, all tooling/evidence');
  T.ok('prereg records the narrowed 5b definition (balance-proof.json ours, far-end pointer)',
    prereg.indexOf('NARROWED 5b DEFINITION') !== -1 && prereg.indexOf('balance-proof.json ours') !== -1, 'narrowed definition present');
  T.ok('prereg records the STOP rule for any conflict outside balance-proof.json',
    prereg.indexOf('If ANY conflict appears outside') !== -1, 'STOP rule present');

  // ---- 2. Subject built (post-step state) ----
  T.section('2. Subject built — branch on top of the far end, family applied');
  let subject = null;
  try { subject = git('rev-parse ' + SUBJECT_BRANCH); } catch (e) { subject = null; }
  T.ok('subject branch exists', subject !== null && subject.length === 40, subject ? subject.slice(0, 12) : '(missing)');
  if (subject) {
    T.ok('subject branch points at the recorded subject commit c3e2970e85d5', subject === SUBJECT_FULL, subject.slice(0, 12));
    T.ok('subject parent is the far end 203a32775', git('rev-parse ' + SUBJECT_BRANCH + '^1') === FAR_FULL, git('rev-parse ' + SUBJECT_BRANCH + '^1').slice(0, 12));
  }
  let addOk = true, addBad = null;
  for (const f of ADDED_CLEAN) {
    const atFar = git('ls-tree ' + FAR + ' -- ' + f);
    const atBase = git('ls-tree ' + MERGE_BASE + ' -- ' + f);
    const atMerge = git('ls-tree ' + MERGE + ' -- ' + f);
    if (atFar !== '' || atBase !== '' || atMerge === '') { addOk = false; addBad = f; break; }
  }
  T.ok('the panel corpus is absent at far end AND base, present at the merge (clean addition)', addOk, addBad ? 'fails: ' + addBad : '1/1');
  let farFilesOk = true, farFilesBad = null;
  for (const f of EXPECTED_FILES) {
    if (f === ADDED_CLEAN[0]) continue;
    if (git('ls-tree ' + FAR + ' -- ' + f) === '') { farFilesOk = false; farFilesBad = f; break; }
  }
  T.ok('every other family file exists at the far end (ls-tree pre-check)', farFilesOk, farFilesBad ? 'missing: ' + farFilesBad : '5/5');

  // ---- 2b. Conflict predicted by merge-tree (read-only) ----
  T.section('2b. Conflict predicted — git merge-tree dry run');
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
  T.ok('merge-tree reports NO src/js section at all', mt.raw.indexOf('src/js/') === -1, 'no src/js in merge-tree output');
  T.ok('merge-tree reports NO DU (deleted-by-us/them) entry', !/deleted by (us|them)/i.test(mt.raw), 'no DU');
  let polMergeOk = true, polMergeBad = null;
  for (const f of EXPECTED_POL) {
    if (!mt.merged[f]) { polMergeOk = false; polMergeBad = f; break; }
    const mergeBlob = git('rev-parse ' + MERGE + ':' + f);
    if (mt.raw.indexOf('  result 100644 ' + mergeBlob + ' ' + f) === -1) { polMergeOk = false; polMergeBad = f; break; }
  }
  T.ok('merge-tree merges all three policy files cleanly (merged sections, result == theirs)', polMergeOk, polMergeBad ? 'no clean merge for: ' + polMergeBad : '3/3 clean');
  const fixBlob = git('rev-parse ' + MERGE + ':scripts/godpath/occupation-fixtures.json');
  T.ok('merge-tree merges occupation-fixtures.json cleanly (result == theirs)',
    mt.merged['scripts/godpath/occupation-fixtures.json'] === true && mt.raw.indexOf('  result 100644 ' + fixBlob + ' scripts/godpath/occupation-fixtures.json') !== -1, 'fixtures clean');

  // ---- 3. Prereg recorded ----
  T.section('3. Prereg recorded');
  T.ok('prereg file exists', prereg !== '', preregPath);
  T.ok('prereg states the STEP id t5b-abb3c2db2', prereg.indexOf('t5b-abb3c2db2') !== -1, 'STEP id present');
  T.ok('prereg states the verdict thresholds (CARRIER / AMBIGUOUS / NOT-CARRIER)', prereg.indexOf('CARRIER') !== -1 && prereg.indexOf('AMBIGUOUS') !== -1 && prereg.indexOf('NOT-CARRIER') !== -1, 'thresholds present');
  T.ok('prereg states the 2/8 re-run is a stability check, not fresh evidence', prereg.indexOf('stability check, not fresh evidence') !== -1, 'stability note present');
  T.ok('prereg states the narrowed subject branch name transplant-5b-subject', prereg.indexOf('transplant-5b-subject') !== -1, 'branch name present');

  // ---- 4. Verdict mapping ----
  T.section('4. Verdict mapping — transplant thresholds');
  const table = [[0, 'CARRIER'], [1, 'CARRIER'], [2, 'AMBIGUOUS'], [3, 'NOT-CARRIER'], [4, 'NOT-CARRIER'], [8, 'NOT-CARRIER'], [-1, 'UNCLASSIFIABLE'], [9, 'UNCLASSIFIABLE'], [NaN, 'UNCLASSIFIABLE']];
  for (const pair of table) {
    T.ok('survived ' + pair[0] + ' -> ' + pair[1], classifyTransplant(pair[0]) === pair[1], classifyTransplant(pair[0]));
  }

  // ---- 5. Corpus exists (detail in §9) ----
  T.section('5. Corpus exists — the step ran');
  const corpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  const summaryPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  T.ok('step corpus directory exists', fs.existsSync(corpusDir), corpusDir);
  T.ok('step summary exists', fs.existsSync(summaryPath), summaryPath);

  // ---- 6. Base restored ----
  T.section('6. Base restored — arm branch clean, no swap residue');
  const headBranch = git('rev-parse --abbrev-ref HEAD');
  T.ok('HEAD is on the arm branch sim-transplant5b-a', headBranch === 'sim-transplant5b-a', 'HEAD=' + headBranch);
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
  T.ok('prereg names the same band', prereg.indexOf('190391') !== -1 && prereg.indexOf('190398') !== -1, 'band in prereg');

  // ---- 8. Subject state — narrowed resolution verified ----
  T.section('8. Subject state — measured policy diff byte-identical, balance-proof ours');
  const subjPolDiff = execSync('git diff ' + FAR + ' ' + SUBJECT_FULL + ' -- scripts/policies/', { cwd: REPO, stdio: 'pipe' }).toString();
  const famPolDiff = execSync('git diff ' + MERGE + '^1 ' + MERGE + ' -- scripts/policies/', { cwd: REPO, stdio: 'pipe' }).toString();
  T.ok('subject-vs-far-end policy diff is BYTE-IDENTICAL to the family diff', subjPolDiff === famPolDiff, 'subject ' + subjPolDiff.length + ' bytes vs family ' + famPolDiff.length + ' bytes');
  const subjPolicy = sha256(gitShow(SUBJECT_FULL, 'scripts/policies/competent.js'));
  T.ok('subject competent.js sha is the merge policy sha 26a87e49...', subjPolicy.startsWith(SUBJECT_POLICY_SHA), subjPolicy.slice(0, 12));
  const subjBpBlob = git('ls-tree ' + SUBJECT_FULL + ' -- scripts/balance-proof.json').split(/\s+/)[2];
  const farBpBlob = git('ls-tree ' + FAR + ' -- scripts/balance-proof.json').split(/\s+/)[2];
  T.ok('subject balance-proof.json blob equals the far-end blob (ours)', subjBpBlob === farBpBlob, (subjBpBlob || '').slice(0, 12));
  const subjBp = gitShow(SUBJECT_FULL, 'scripts/balance-proof.json');
  T.ok('subject balance-proof.json carries the far-end r167 panel pointer (ours)', subjBp.indexOf(OURS_PANEL) !== -1 && subjBp.indexOf(THEIRS_PANEL) === -1, OURS_PANEL);
  const subjFixBlob = git('ls-tree ' + SUBJECT_FULL + ' -- scripts/godpath/occupation-fixtures.json').split(/\s+/)[2];
  const mergeFixBlob = git('ls-tree ' + MERGE + ' -- scripts/godpath/occupation-fixtures.json').split(/\s+/)[2];
  T.ok('subject occupation-fixtures.json blob equals the merge blob (theirs)', subjFixBlob === mergeFixBlob, (subjFixBlob || '').slice(0, 12));
  const subjCorpusBlob = git('ls-tree ' + SUBJECT_FULL + ' -- ' + ADDED_CLEAN[0]).split(/\s+/)[2];
  const mergeCorpusBlob = git('ls-tree ' + MERGE + ' -- ' + ADDED_CLEAN[0]).split(/\s+/)[2];
  T.ok('subject panel corpus blob equals the merge blob (theirs)', subjCorpusBlob === mergeCorpusBlob, (subjCorpusBlob || '').slice(0, 12));
  const subjStandingBlob = git('ls-tree ' + SUBJECT_FULL + ' -- src/js/standing.js').split(/\s+/)[2];
  const farStandingBlob = git('ls-tree ' + FAR + ' -- src/js/standing.js').split(/\s+/)[2];
  T.ok('subject standing.js blob equals the far-end native blob (no standing change in family)', subjStandingBlob === farStandingBlob, (subjStandingBlob || '').slice(0, 12));
  const subjStat = git('diff --numstat ' + FAR + ' ' + SUBJECT_FULL).split('\n')
    .reduce(function (acc, line) { const p = line.split('\t'); const ins = parseInt(p[0], 10), del = parseInt(p[1], 10); return { ins: acc.ins + (Number.isFinite(ins) ? ins : 0), del: acc.del + (Number.isFinite(del) ? del : 0), n: acc.n + 1 }; }, { ins: 0, del: 0, n: 0 });
  T.ok('subject diff vs far end is 5 files, +33/-10 (family +35/-12 minus the ours pointer)', subjStat.n === 5 && subjStat.ins === 33 && subjStat.del === 10, subjStat.n + ' files, +' + subjStat.ins + '/-' + subjStat.del);

  // ---- 9. Step corpus — subject policy measured on all 8 seeds ----
  T.section('9. Step corpus — STEP t5b-abb3c2db2 measured the SUBJECT policy');
  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
  T.ok('summary step id is t5b-abb3c2db2', summary.step === STEP, summary.step);
  T.ok('summary seeds are exactly 190391..190398', JSON.stringify(summary.seeds) === JSON.stringify(SEEDS), (summary.seeds || []).join(','));
  T.ok('summary survived is 4/8', summary.survived === 4, 'survived=' + summary.survived);
  T.ok('summary verdict is GOOD', summary.verdict === 'GOOD', summary.verdict);
  T.ok('summary rankVerdict is REGIONAL_INTACT', summary.rankVerdict === 'REGIONAL_INTACT', summary.rankVerdict);
  T.ok('summary instrument errors are 0', summary.instrumentErrors === 0, 'errors=' + summary.instrumentErrors);
  T.ok('summary wall wave-5 is 2/8', summary.wall && summary.wall.wave5 === 2, 'wave5=' + (summary.wall && summary.wall.wave5));
  T.ok('summary wall wins/national/table are all 0', summary.wall && summary.wall.wins === 0 && summary.wall.national === 0 && summary.wall.table === 0, 'wins=' + (summary.wall && summary.wall.wins));
  const corpusFiles = fs.readdirSync(corpusDir).filter(function (f) { return f.slice(-5) === '.json'; }).sort();
  T.ok('per-seed corpus has exactly 8 files', corpusFiles.length === 8, corpusFiles.length + ' files');
  let perSeedOk = true, perSeedBad = null;
  for (const f of corpusFiles) {
    const j = JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8'));
    if (j.policySha !== SUBJECT_POLICY_SHA || j.anchorCommit !== SUBJECT_FULL.slice(0, 12) || j.standingFix !== true || j.standingSha !== 'f8fda4295a99' || j.step !== STEP) { perSeedOk = false; perSeedBad = f; break; }
  }
  T.ok('every per-seed JSON records the SUBJECT policySha, subject anchor, fix standing, STEP id', perSeedOk, perSeedBad ? 'fails: ' + perSeedBad : '8/8');
  const driverLog = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log'), 'utf8');
  // NOTE: the step script's echo lines (HEAD / fix swap / own policy
  // sha) go to the step's stdout, NOT into this log file — the log
  // holds the driver's per-seed JSON lines + the analyzer output.
  // The per-seed lines are the log's record of the subject policy.
  T.ok('driver log per-seed lines record the SUBJECT policySha + fix standingSha on all 8 seeds',
    (driverLog.match(/"policySha":"26a87e493578"/g) || []).length === 8 && (driverLog.match(/"standingSha":"f8fda4295a99"/g) || []).length === 8 && (driverLog.match(/"standingFix":true/g) || []).length === 8, '8/8 per-seed lines');
  T.ok('driver log records GOOD (survived 4/8', driverLog.indexOf('GOOD (survived 4/8') !== -1, 'classification present');
  const evPath = path.join(REPO, 'evidence', '2026-11-13', 'sim-transplant5b.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('evidence file records the verdict NOT-CARRIER', ev.indexOf('NOT-CARRIER') !== -1, 'NOT-CARRIER present');
  T.ok('evidence file records the subject commit hash', ev.indexOf(SUBJECT_FULL) !== -1, 'subject hash present');
  T.ok('evidence file records the telemetry refusal (not a deviation)', ev.indexOf('refusing') !== -1 && ev.indexOf('NOT rolled') !== -1, 'refusal note present');

  // ---- 10. Base restored (post-step) ----
  T.section('10. Base restored — arm branch clean after the step, no swap residue');
  const headBranch2 = git('rev-parse --abbrev-ref HEAD');
  T.ok('HEAD is back on the arm branch sim-transplant5b-a', headBranch2 === 'sim-transplant5b-a', 'HEAD=' + headBranch2);
  const dirtyJs2 = git('status --porcelain --untracked-files=no -- src/js');
  T.ok('no src/js file differs from HEAD', dirtyJs2 === '', dirtyJs2.slice(0, 200) || '(clean)');
  const onDiskStanding2 = sha256(fs.readFileSync(path.join(REPO, 'src', 'js', 'standing.js'), 'utf8'));
  const headStanding2 = sha256(gitShow('HEAD', 'src/js/standing.js'));
  T.ok('on-disk standing.js is byte-identical to HEAD (no swap residue)', onDiskStanding2 === headStanding2, onDiskStanding2.slice(0, 12) + ' vs HEAD ' + headStanding2.slice(0, 12));
  T.ok('subject branch still points at the recorded subject commit (left in place)', git('rev-parse ' + SUBJECT_BRANCH) === SUBJECT_FULL, 'branch kept');

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
