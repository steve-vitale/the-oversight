#!/usr/bin/env node
// test-transplant10b.js — proof test for the H1 TRANSPLANT, narrowed
// family 10b (arm sim-transplant10b).
//
// THE QUESTION (evidence/2026-11-13/sim-transplant10b-prereg.md,
// committed before cutting the subject or running any judged sim):
// land origin family 10 — PR #4 merge fbb9c53ed
// (person-trust-map-41aa, 1 commit on the second-parent side, NEW
// src/js/person-trust.js +233, bond-initiation.js +7/-6 comment-only)
// — onto the far end 203a32775 (GOOD 4/8) as NARROWED family 10b:
// the cherry-pick conflicts confined to scripts/balance-proof.json
// and scripts/green-list.txt (both zero src/ readers) are resolved
// per the narrowed definition (balance-proof.json OURS, green-list
// UNION). Measure whether the person-trust map alone collapses the
// far end. Verdicts: <=1/8 CARRIER, 2/8 AMBIGUOUS (re-run once),
// >=3/8 NOT-CARRIER.
//
// Family 10 (arm sim-transplant10) was UNMEASURED on exactly these
// two tooling conflicts; 10b is a NEW family definition under the
// coordinator's narrowed-tooling rule (0015Z coordinator decision,
// validated by measurement on narrowed 4b and 5b), never a
// re-judgment of family 10.
//
// WHAT THIS TEST PROVES (prereg stage — before the subject exists):
//   1. Family identity — merge fbb9c53ed, its parents, the 1-commit
//      second-parent side, exactly the 2 src/js files (person-trust
//      233+/0-, bond-initiation 7+/6- comment-only), 0 policy files,
//      the 12-file list, +594/-8.
//   1b. Driver mechanics — the driver loads competent.js from the
//      checked-out tree (REPO-relative require), the step script
//      restores only the 4 tooling scratch files (no policy file),
//      the bisect leg guard is record-only for policy.
//   1c. Narrowed-tooling justification — BOTH conflicted files
//      (balance-proof.json, green-list.txt) have ZERO readers in
//      src/ (git grep), the merge-tree predicts the conflicts
//      confined to those two files, the prereg records the narrowed
//      definition, and no src/js file is conflicted.
//   2. Subject built — the scratch branch transplant-10b-subject
//      exists on top of the far end (the live pick conflicted ONLY
//      on the two tooling files, resolved per the narrowed
//      definition); the person-trust module is absent at the far end
//      AND at the first parent, present at the merge (clean
//      addition, not missing substrate).
//   2b. Conflict predicted by merge-tree (read-only) — `git
//      merge-tree a76333124 203a32775 fbb9c53ed` reports exactly the
//      same TWO content conflicts (3 markers each) and shows the
//      other family files merging cleanly, with no DU / no src/js
//      conflict.
//   3. Prereg recorded — the prereg file states the narrowed
//      definition, the STEP id, the verdict thresholds, the seed
//      band, and the distinct subject-branch name.
//   4. Verdict mapping — classifyTransplant maps every survived
//      count to CARRIER / AMBIGUOUS / NOT-CARRIER / UNCLASSIFIABLE.
//   5. Corpus exists — the step corpus + summary exist for STEP
//      t10b-fbb9c53ed (detail checked in §9).
//   6. Base restored — HEAD is on the arm branch (worktree-only
//      leg: on master it asserts the arm work is merged instead),
//      no src/js file differs from HEAD, on-disk standing.js is
//      byte-identical to HEAD, and the step-script tooling source
//      (master) still carries all four scratch files.
//   7. Seed-band identity — the step script and the prereg name
//      exactly seeds 190391–190398.
//
// MEASURED OUTCOME (evidence/2026-11-13/sim-transplant10b.md):
// subject 4d7351b720c7360a84d2d8489e52efc9c285717f, STEP
// t10b-fbb9c53ed, survived 3/8 → NOT-CARRIER. The person-trust map
// alone does not collapse the far end. Per-seed days
// 132/120/130/102/150/150/150/93 are byte-identical to the narrowed
// 4b step's — the two families leave the band trajectory untouched.
//
// POST-STEP SECTIONS (added after the step runs; the evidence file
// evidence/2026-11-13/sim-transplant10b.md records the verdict):
//   8. Subject state — transplant-10b-subject points at a commit on
//      top of the far end; the subject's src/js diff is
//      byte-identical to the family diff; balance-proof.json on the
//      subject equals the far-end blob (ours); green-list equals the
//      far end + exactly the person-trust line (union); the
//      person-trust module blob equals the merge blob.
//   9. Step corpus — the per-seed corpus + summary exist for STEP
//      t10b-fbb9c53ed, the summary's survived count matches the
//      evidence verdict, and every per-seed JSON records the
//      far-end policySha (the family touches no policy file).
//   10. Base restored (post-step) — same as §6, re-checked after
//      the step checkout + restore.
//
// Usage: node scripts/test-transplant10b.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant10b');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const MERGE = 'fbb9c53ed';
const MERGE_BASE = 'a76333124';
const ARM_BRANCH = 'sim-transplant10b';
const PREREG_COMMIT = 'e67a3088ca53a0ffeb515aed3c0b80a3f2b58879';
const SUBJECT_BRANCH = 'transplant-10b-subject';
const SUBJECT_FULL = '4d7351b720c7360a84d2d8489e52efc9c285717f';
const SUBJECT_PERSON_TRUST_BLOB = 'e9334c61defb11004eeb2bf632e9b41eec969c68';
const FAR_POLICY_SHA = 'a7ff5c516440';
const STEP = 't10b-fbb9c53ed';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const EXPECTED_JS = [
  'src/js/bond-initiation.js',
  'src/js/person-trust.js',
];
const EXPECTED_FILES = [
  'docs/ONTOLOGY.md',
  'evidence/2026-11-08/neutral-person-trust.json.gz',
  'evidence/2026-11-08/person-trust-prereg.md',
  'evidence/2026-11-08/person-trust.md',
  'index.html',
  'scripts/balance-proof.json',
  'scripts/green-list.txt',
  'scripts/person-trust-panel-20261108.js',
  'scripts/test-person-trust-20261108.js',
  'src/js/bond-initiation.js',
  'src/js/person-trust.js',
  'sw.js',
];
// The TWO files the merge-tree predicts as conflicted (and the live
// pick is expected to conflict on, resolved per the narrowed
// definition: balance-proof ours, green-list union).
const CONFLICT_FILES = ['scripts/balance-proof.json', 'scripts/green-list.txt'];
// The files the far end lacked, added cleanly by the pick (6: the new
// module, its panel + test scripts, and the family's 3 evidence files).
const ADDED_CLEAN = [
  'src/js/person-trust.js',
  'scripts/person-trust-panel-20261108.js',
  'scripts/test-person-trust-20261108.js',
  'evidence/2026-11-08/neutral-person-trust.json.gz',
  'evidence/2026-11-08/person-trust-prereg.md',
  'evidence/2026-11-08/person-trust.md',
];
// Marker counts from the merge-tree dry run, per 'changed in both' file
// (transplant118 counting method: +<<<<<<<, +=======, +>>>>>>>).
const EXPECTED_MARKERS = { 'scripts/balance-proof.json': 3, 'scripts/green-list.txt': 3 };
// The two panel pointers in the balance-proof conflict hunk: ours (far end) vs theirs.
const OURS_PANEL = 'evidence/2026-11-10/neutral-r167-adopt.json.gz';
const THEIRS_PANEL = 'evidence/2026-11-08/neutral-person-trust.json.gz';
const PERSON_TRUST_LINE = 'scripts/test-person-trust-20261108.js quick';

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
  T.section('1. Family identity — PR #4 merge fbb9c53ed');
  T.ok('merge commit exists', git('rev-parse ' + MERGE).length === 40, git('log -1 --format=%s ' + MERGE).slice(0, 80));
  T.ok('first parent is a76333124 (family-13 brawler merge)', git('rev-parse ' + MERGE + '^1').startsWith('a76333124'), git('log -1 --format=%h\\ %s ' + MERGE + '^1').slice(0, 80));
  T.ok('second parent is 4588114119f (person-trust commit)', git('rev-parse ' + MERGE + '^2').startsWith('4588114119f'), git('log -1 --format=%h\\ %s ' + MERGE + '^2').slice(0, 80));
  const sideCount = parseInt(git('rev-list --count ' + MERGE + '^1..' + MERGE + '^2'), 10);
  T.ok('second-parent side is 1 commit (person-trust only)', sideCount === 1, 'count=' + sideCount);
  const jsFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- src/js').split('\n').sort();
  T.ok('family touches exactly the 2 expected src/js files (js=2)', JSON.stringify(jsFiles) === JSON.stringify(EXPECTED_JS.slice().sort()), jsFiles.join(', '));
  const ptStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/js/person-trust.js').split('\t');
  T.ok('person-trust.js is NEW +233/-0', parseInt(ptStat[0], 10) === 233 && parseInt(ptStat[1], 10) === 0, '+' + ptStat[0] + '/-' + ptStat[1]);
  const biStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/js/bond-initiation.js').split('\t');
  T.ok('bond-initiation.js is +7/-6', parseInt(biStat[0], 10) === 7 && parseInt(biStat[1], 10) === 6, '+' + biStat[0] + '/-' + biStat[1]);
  const biDiff = git('diff ' + MERGE + '^1 ' + MERGE + ' -- src/js/bond-initiation.js');
  const biAdded = biDiff.split('\n').filter(function (l) { return l.indexOf('+') === 0 && l.indexOf('+++') !== 0; });
  const biRemoved = biDiff.split('\n').filter(function (l) { return l.indexOf('-') === 0 && l.indexOf('---') !== 0; });
  T.ok('bond-initiation.js change is comment-only (every +/- line is a // comment)',
    biAdded.every(function (l) { return l.replace(/^\+/, '').trim().indexOf('//') === 0; }) &&
    biRemoved.every(function (l) { return l.replace(/^-/, '').trim().indexOf('//') === 0; }),
    biAdded.length + ' added / ' + biRemoved.length + ' removed, all comments');
  const polFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- scripts/policies');
  T.ok('family touches no policy file (pol=0)', polFiles === '', polFiles || '(none)');
  const allFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE).split('\n').sort();
  T.ok('family file list is exactly the 12 expected files', JSON.stringify(allFiles) === JSON.stringify(EXPECTED_FILES.slice().sort()), allFiles.join(', '));
  const tot = git('diff --numstat ' + MERGE + '^1 ' + MERGE).split('\n')
    .reduce(function (acc, line) { const p = line.split('\t'); const ins = parseInt(p[0], 10), del = parseInt(p[1], 10); return { ins: acc.ins + (Number.isFinite(ins) ? ins : 0), del: acc.del + (Number.isFinite(del) ? del : 0) }; }, { ins: 0, del: 0 });
  T.ok('family total delta is +594/-8', tot.ins === 594 && tot.del === 8, '+' + tot.ins + '/-' + tot.del);
  T.ok('family does not touch standing.js', git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- src/js/standing.js') === '', '(absent)');
  const farStanding = sha256(gitShow(FAR, 'src/js/standing.js'));
  T.ok('far-end native standing.js sha is 75762cb2...', farStanding.startsWith('75762cb2'), farStanding.slice(0, 12));
  T.ok('fix standing.js sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  const farPolicy = sha256(gitShow(FAR, 'scripts/policies/competent.js'));
  T.ok('far-end policy sha is a7ff5c51...', farPolicy.startsWith(FAR_POLICY_SHA), farPolicy.slice(0, 12));
  T.ok('first-parent bond-initiation.js blob equals the far-end blob (identical base)',
    git('rev-parse ' + MERGE_BASE + ':src/js/bond-initiation.js') === git('rev-parse ' + FAR + ':src/js/bond-initiation.js'), 'd131970a');
  T.ok('first-parent index.html blob equals the far-end blob (identical base)',
    git('rev-parse ' + MERGE_BASE + ':index.html') === git('rev-parse ' + FAR + ':index.html'), '40d531d9');
  T.ok('merge person-trust.js blob is e9334c61...',
    git('rev-parse ' + MERGE + ':src/js/person-trust.js') === SUBJECT_PERSON_TRUST_BLOB, SUBJECT_PERSON_TRUST_BLOB.slice(0, 12));

  // ---- 1b. Driver mechanics ----
  T.section('1b. Driver mechanics — the driver loads the SUBJECT policy');
  const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'culpritbisect-driver-20261113.js'), 'utf8');
  T.ok('driver requires competent.js relative to REPO (the checked-out tree)',
    driverSrc.indexOf("require(path.join(REPO, 'scripts', 'policies', 'competent'))") !== -1, 'REPO-relative require present');
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

  // ---- 1c. Narrowed-tooling justification — BOTH files ----
  T.section('1c. Narrowed-tooling justification — BOTH conflicted files have zero src/ readers');
  function srcReadersOf(pat) {
    try { return execSync('git grep -l "' + pat + '" -- src/', { cwd: REPO, stdio: 'pipe' }).toString().trim(); } catch (e) { return ''; }
  }
  T.ok('balance-proof.json has ZERO readers in src/ (git grep src/ empty)', srcReadersOf('balance-proof') === '', srcReadersOf('balance-proof').slice(0, 200) || '(none)');
  T.ok('green-list.txt has ZERO readers in src/ (git grep src/ empty)', srcReadersOf('green-list') === '', srcReadersOf('green-list').slice(0, 200) || '(none)');
  let glReaders = '';
  try { glReaders = execSync('git grep -l "green-list" -- "*.js" "*.txt" "*.sh"', { cwd: REPO, stdio: 'pipe' }).toString().trim(); } catch (e) { glReaders = ''; }
  const glList = glReaders.split('\n').filter(Boolean);
  const glToolingOnly = glList.every(function (f) { return f.indexOf('scripts/') === 0 || f.indexOf('evidence/') === 0; });
  T.ok('every green-list reader is measurement/proof tooling (scripts/ or evidence/, no game code)',
    glToolingOnly && glList.length > 0 && glList.indexOf('scripts/check.js') !== -1, glList.length + ' readers, all tooling');
  const preregPath = path.join(REPO, 'evidence', '2026-11-13', 'sim-transplant10b-prereg.md');
  const prereg = fs.existsSync(preregPath) ? fs.readFileSync(preregPath, 'utf8') : '';
  T.ok('prereg records the narrowed 10b definition (balance-proof ours, green-list UNION)',
    prereg.indexOf('NARROWED 10b DEFINITION') !== -1 && prereg.indexOf('balance-proof.json` OURS') !== -1 && prereg.indexOf('green-list.txt` UNION') !== -1, 'narrowed definition present');
  T.ok('prereg records the STOP rule for any conflict beyond the two tooling files',
    prereg.indexOf('If the pick hits ANY') !== -1, 'STOP rule present');

  // ---- 2. Subject built (post-step state) ----
  T.section('2. Subject built — branch on top of the far end, family applied');
  let subject = null;
  try { subject = git('rev-parse ' + SUBJECT_BRANCH); } catch (e) { subject = null; }
  T.ok('subject branch exists', subject !== null && subject.length === 40, subject ? subject.slice(0, 12) : '(missing)');
  if (subject) {
    T.ok('subject branch points at the recorded subject commit 4d7351b720c73', subject === SUBJECT_FULL, subject.slice(0, 12));
    T.ok('subject parent is the far end 203a32775', git('rev-parse ' + SUBJECT_BRANCH + '^1') === FAR_FULL, git('rev-parse ' + SUBJECT_BRANCH + '^1').slice(0, 12));
  }
  let addOk = true, addBad = null;
  for (const f of ADDED_CLEAN) {
    const atFar = git('ls-tree ' + FAR + ' -- ' + f);
    const atBase = git('ls-tree ' + MERGE_BASE + ' -- ' + f);
    const atMerge = git('ls-tree ' + MERGE + ' -- ' + f);
    if (atFar !== '' || atBase !== '' || atMerge === '') { addOk = false; addBad = f; break; }
  }
  T.ok('the 6 new files are absent at far end AND base, present at the merge (clean additions)', addOk, addBad ? 'fails: ' + addBad : '6/6');
  let farFilesOk = true, farFilesBad = null;
  for (const f of EXPECTED_FILES) {
    if (ADDED_CLEAN.indexOf(f) !== -1) continue;
    if (git('ls-tree ' + FAR + ' -- ' + f) === '') { farFilesOk = false; farFilesBad = f; break; }
  }
  T.ok('every other family file exists at the far end (ls-tree pre-check)', farFilesOk, farFilesBad ? 'missing: ' + farFilesBad : '6/6');

  // ---- 2b. Conflict predicted by merge-tree (read-only) ----
  T.section('2b. Conflict predicted — git merge-tree dry run');
  const mt = mergeTreeConflicts();
  let mtOk = true, mtBad = null;
  for (const f of Object.keys(EXPECTED_MARKERS)) {
    if (mt.found[f] !== EXPECTED_MARKERS[f]) { mtOk = false; mtBad = f + ' (got ' + mt.found[f] + ', want ' + EXPECTED_MARKERS[f] + ')'; break; }
  }
  T.ok('merge-tree reports the same conflict set with the same marker counts', mtOk, mtBad || '2/2 match');
  T.ok('merge-tree reports exactly TWO content-conflicted files', Object.keys(mt.found).filter(function (f) { return mt.found[f] > 0; }).length === 2, 'conflicted=' + Object.keys(mt.found).filter(function (f) { return mt.found[f] > 0; }).join(', '));
  T.ok('merge-tree reports four changed-in-both sections total (2 conflicted + ONTOLOGY + sw.js)',
    Object.keys(mt.found).length === 4, 'sections=' + Object.keys(mt.found).length + ': ' + Object.keys(mt.found).join(', '));
  T.ok('merge-tree conflict hunk carries the far-end r167 panel pointer (ours)', mt.raw.indexOf(OURS_PANEL) !== -1, OURS_PANEL);
  T.ok('merge-tree conflict hunk carries the family person-trust panel pointer (theirs)', mt.raw.indexOf(THEIRS_PANEL) !== -1, THEIRS_PANEL);
  T.ok('merge-tree reports NO src/js conflict (no src/js file in a changed-in-both section)',
    Object.keys(mt.found).filter(function (f) { return f.indexOf('src/js/') === 0; }).length === 0, 'no src/js conflict');
  T.ok('merge-tree reports NO DU (deleted-by-us/them) entry', !/deleted by (us|them)/i.test(mt.raw), 'no DU');
  T.ok('merge-tree merges index.html cleanly (merged section, result == theirs)',
    mt.merged['index.html'] === true && mt.raw.indexOf('  result 100644 659049c64d7267d0fdf5c201bfeab179f141f300 index.html') !== -1, 'index.html clean');
  T.ok('merge-tree merges bond-initiation.js cleanly (merged section, result == theirs)',
    mt.merged['src/js/bond-initiation.js'] === true && mt.raw.indexOf('  result 100644 1a8092cf558e75064918b53551aa0663a93684a6 src/js/bond-initiation.js') !== -1, 'bond-initiation.js clean');
  T.ok('merge-tree reports the green-list hunk with the ours pellet lines and the theirs person-trust line',
    mt.raw.indexOf('scripts/test-pellet-boost-20261108.js quick') !== -1 && mt.raw.indexOf(PERSON_TRUST_LINE) !== -1, 'both sides present in hunk');

  // ---- 3. Prereg recorded ----
  T.section('3. Prereg recorded');
  T.ok('prereg file exists', prereg !== '', preregPath);
  T.ok('prereg states the STEP id t10b-fbb9c53ed', prereg.indexOf('t10b-fbb9c53ed') !== -1, 'STEP id present');
  T.ok('prereg states the verdict thresholds (CARRIER / AMBIGUOUS / NOT-CARRIER)', prereg.indexOf('CARRIER') !== -1 && prereg.indexOf('AMBIGUOUS') !== -1 && prereg.indexOf('NOT-CARRIER') !== -1, 'thresholds present');
  T.ok('prereg states the 2/8 re-run is a stability check, not fresh evidence', prereg.indexOf('stability check, not fresh evidence') !== -1, 'stability note present');
  T.ok('prereg states the distinct narrowed subject branch name transplant-10b-subject', prereg.indexOf('transplant-10b-subject') !== -1, 'branch name present');
  T.ok('prereg states the family-10 branch is untouched (transplant-10-subject left alone)', prereg.indexOf('does not touch that branch') !== -1, 'untouched note present');

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

  // ---- 6. Base restored (worktree-only branch leg) ----
  T.section('6. Base restored — arm branch clean, no swap residue');
  const headBranch = git('rev-parse --abbrev-ref HEAD');
  if (headBranch === ARM_BRANCH) {
    T.ok('HEAD is on the arm branch sim-transplant10b (worktree-only leg)', true, 'HEAD=' + headBranch);
  } else {
    // On master (post-merge) the arm branch is gone by design: assert
    // the arm work is present instead, so the proof stays green.
    let merged = false;
    try { execSync('git merge-base --is-ancestor ' + PREREG_COMMIT + ' HEAD', { cwd: REPO, stdio: 'pipe' }); merged = true; } catch (e) { merged = false; }
    T.ok('arm prereg commit is an ancestor of HEAD (arm merged; branch-identity leg is worktree-only)', merged, 'HEAD=' + headBranch + ', prereg ' + PREREG_COMMIT.slice(0, 12) + ' ancestor=' + merged);
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

  // ---- 7. Seed-band identity ----
  T.section('7. Seed-band identity');
  T.ok('step script names the band 190391..190398',
    stepSrc.indexOf('190391,190392,190393,190394,190395,190396,190397,190398') !== -1, 'band literal present');
  T.ok('prereg names the same band', prereg.indexOf('190391') !== -1 && prereg.indexOf('190398') !== -1, 'band in prereg');

  // ---- 8. Subject state — narrowed resolution verified ----
  T.section('8. Subject state — measured src/js diff byte-identical, tooling resolved per definition');
  const subjJsDiff = execSync('git diff ' + FAR + ' ' + SUBJECT_FULL + ' -- src/js/', { cwd: REPO, stdio: 'pipe' }).toString();
  const famJsDiff = execSync('git diff ' + MERGE + '^1 ' + MERGE + ' -- src/js/', { cwd: REPO, stdio: 'pipe' }).toString();
  T.ok('subject-vs-far-end src/js diff is BYTE-IDENTICAL to the family diff', subjJsDiff === famJsDiff, 'subject ' + subjJsDiff.length + ' bytes vs family ' + famJsDiff.length + ' bytes');
  const subjPolDiff = execSync('git diff ' + FAR + ' ' + SUBJECT_FULL + ' -- scripts/policies/', { cwd: REPO, stdio: 'pipe' }).toString();
  T.ok('subject-vs-far-end policy diff is empty (family touches no policy file)', subjPolDiff === '', subjPolDiff.length + ' bytes');
  const subjBpBlob = git('ls-tree ' + SUBJECT_FULL + ' -- scripts/balance-proof.json').split(/\s+/)[2];
  const farBpBlob = git('ls-tree ' + FAR + ' -- scripts/balance-proof.json').split(/\s+/)[2];
  T.ok('subject balance-proof.json blob equals the far-end blob (ours)', subjBpBlob === farBpBlob, (subjBpBlob || '').slice(0, 12));
  const subjBp = gitShow(SUBJECT_FULL, 'scripts/balance-proof.json');
  T.ok('subject balance-proof.json carries the far-end r167 panel pointer (ours)', subjBp.indexOf(OURS_PANEL) !== -1 && subjBp.indexOf(THEIRS_PANEL) === -1, OURS_PANEL);
  const subjGlDiff = execSync('git diff ' + FAR + ' ' + SUBJECT_FULL + ' -- scripts/green-list.txt', { cwd: REPO, stdio: 'pipe' }).toString();
  T.ok('subject green-list diff vs far end is exactly +1 line (the person-trust line)',
    subjGlDiff.indexOf('+' + PERSON_TRUST_LINE) !== -1 && (subjGlDiff.match(/^\+[^+]/gm) || []).length === 1, subjGlDiff.split('\n').filter(function (l) { return l.indexOf('+') === 0 && l.indexOf('+++') !== 0; }).join(' | '));
  const subjPtBlob = git('ls-tree ' + SUBJECT_FULL + ' -- src/js/person-trust.js').split(/\s+/)[2];
  T.ok('subject person-trust.js blob equals the merge blob (theirs)', subjPtBlob === SUBJECT_PERSON_TRUST_BLOB, (subjPtBlob || '').slice(0, 12));
  const subjBiBlob = git('ls-tree ' + SUBJECT_FULL + ' -- src/js/bond-initiation.js').split(/\s+/)[2];
  const mergeBiBlob = git('ls-tree ' + MERGE + ' -- src/js/bond-initiation.js').split(/\s+/)[2];
  T.ok('subject bond-initiation.js blob equals the merge blob (theirs)', subjBiBlob === mergeBiBlob, (subjBiBlob || '').slice(0, 12));
  const subjIdxBlob = git('ls-tree ' + SUBJECT_FULL + ' -- index.html').split(/\s+/)[2];
  const mergeIdxBlob = git('ls-tree ' + MERGE + ' -- index.html').split(/\s+/)[2];
  T.ok('subject index.html blob equals the merge blob (theirs)', subjIdxBlob === mergeIdxBlob, (subjIdxBlob || '').slice(0, 12));
  const subjStandingBlob = git('ls-tree ' + SUBJECT_FULL + ' -- src/js/standing.js').split(/\s+/)[2];
  const farStandingBlob = git('ls-tree ' + FAR + ' -- src/js/standing.js').split(/\s+/)[2];
  T.ok('subject standing.js blob equals the far-end native blob (no standing change in family)', subjStandingBlob === farStandingBlob, (subjStandingBlob || '').slice(0, 12));
  const subjStat = git('diff --numstat ' + FAR + ' ' + SUBJECT_FULL).split('\n')
    .reduce(function (acc, line) { const p = line.split('\t'); const ins = parseInt(p[0], 10), del = parseInt(p[1], 10); return { ins: acc.ins + (Number.isFinite(ins) ? ins : 0), del: acc.del + (Number.isFinite(del) ? del : 0), n: acc.n + 1 }; }, { ins: 0, del: 0, n: 0 });
  T.ok('subject diff vs far end is 11 files, +592/-6 (family +594/-8 minus the ours pointer)', subjStat.n === 11 && subjStat.ins === 592 && subjStat.del === 6, subjStat.n + ' files, +' + subjStat.ins + '/-' + subjStat.del);

  // ---- 9. Step corpus — subject measured on all 8 seeds ----
  T.section('9. Step corpus — STEP t10b-fbb9c53ed measured the SUBJECT');
  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
  T.ok('summary step id is t10b-fbb9c53ed', summary.step === STEP, summary.step);
  T.ok('summary seeds are exactly 190391..190398', JSON.stringify(summary.seeds) === JSON.stringify(SEEDS), (summary.seeds || []).join(','));
  T.ok('summary survived is 3/8', summary.survived === 3, 'survived=' + summary.survived);
  T.ok('summary verdict is GOOD', summary.verdict === 'GOOD', summary.verdict);
  T.ok('summary rankVerdict is REGIONAL_INTACT', summary.rankVerdict === 'REGIONAL_INTACT', summary.rankVerdict);
  T.ok('summary instrument errors are 0', summary.instrumentErrors === 0, 'errors=' + summary.instrumentErrors);
  T.ok('summary wall wave-5 is 5/8', summary.wall && summary.wall.wave5 === 5, 'wave5=' + (summary.wall && summary.wall.wave5));
  T.ok('summary wall wins/national/table are all 0', summary.wall && summary.wall.wins === 0 && summary.wall.national === 0 && summary.wall.table === 0, 'wins=' + (summary.wall && summary.wall.wins));
  const corpusFiles = fs.readdirSync(corpusDir).filter(function (f) { return f.slice(-5) === '.json'; }).sort();
  T.ok('per-seed corpus has exactly 8 files', corpusFiles.length === 8, corpusFiles.length + ' files');
  let perSeedOk = true, perSeedBad = null;
  for (const f of corpusFiles) {
    const j = JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8'));
    if (j.policySha !== FAR_POLICY_SHA || j.anchorCommit !== SUBJECT_FULL.slice(0, 12) || j.standingFix !== true || j.standingSha !== 'f8fda4295a99' || j.step !== STEP) { perSeedOk = false; perSeedBad = f; break; }
  }
  T.ok('every per-seed JSON records the FAR-END policySha, subject anchor, fix standing, STEP id', perSeedOk, perSeedBad ? 'fails: ' + perSeedBad : '8/8');
  const driverLog = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log'), 'utf8');
  // NOTE: the step script's echo lines (HEAD / fix swap / own policy
  // sha) go to the step's stdout, NOT into this log file — the log
  // holds the driver's per-seed JSON lines + the analyzer output.
  // The per-seed lines are the log's record of the far-end policy.
  T.ok('driver log per-seed lines record the FAR-END policySha + fix standingSha on all 8 seeds',
    (driverLog.match(/"policySha":"a7ff5c516440"/g) || []).length === 8 && (driverLog.match(/"standingSha":"f8fda4295a99"/g) || []).length === 8 && (driverLog.match(/"standingFix":true/g) || []).length === 8, '8/8 per-seed lines');
  T.ok('driver log records GOOD (survived 3/8', driverLog.indexOf('GOOD (survived 3/8') !== -1, 'classification present');
  const evPath = path.join(REPO, 'evidence', '2026-11-13', 'sim-transplant10b.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('evidence file records the verdict NOT-CARRIER', ev.indexOf('NOT-CARRIER') !== -1, 'NOT-CARRIER present');
  T.ok('evidence file records the subject commit hash', ev.indexOf(SUBJECT_FULL) !== -1, 'subject hash present');
  T.ok('evidence file records the telemetry refusal (not a deviation)', ev.indexOf('refusing') !== -1 && ev.indexOf('NOT rolled') !== -1, 'refusal note present');

  // ---- 10. Base restored (post-step) ----
  T.section('10. Base restored — arm branch clean after the step, no swap residue');
  const headBranch2 = git('rev-parse --abbrev-ref HEAD');
  if (headBranch2 === ARM_BRANCH) {
    T.ok('HEAD is back on the arm branch sim-transplant10b (worktree-only leg)', true, 'HEAD=' + headBranch2);
  } else {
    let merged = false;
    try { execSync('git merge-base --is-ancestor ' + PREREG_COMMIT + ' HEAD', { cwd: REPO, stdio: 'pipe' }); merged = true; } catch (e) { merged = false; }
    T.ok('arm prereg commit is an ancestor of HEAD (arm merged; branch-identity leg is worktree-only)', merged, 'HEAD=' + headBranch2 + ', prereg ancestor=' + merged);
  }
  const dirtyJs2 = git('status --porcelain --untracked-files=no -- src/js');
  T.ok('no src/js file differs from HEAD', dirtyJs2 === '', dirtyJs2.slice(0, 200) || '(clean)');
  const onDiskStanding2 = sha256(fs.readFileSync(path.join(REPO, 'src', 'js', 'standing.js'), 'utf8'));
  const headStanding2 = sha256(gitShow('HEAD', 'src/js/standing.js'));
  T.ok('on-disk standing.js is byte-identical to HEAD (no swap residue)', onDiskStanding2 === headStanding2, onDiskStanding2.slice(0, 12) + ' vs HEAD ' + headStanding2.slice(0, 12));
  T.ok('subject branch still points at the recorded subject commit (left in place)', git('rev-parse ' + SUBJECT_BRANCH) === SUBJECT_FULL, 'branch kept');

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
