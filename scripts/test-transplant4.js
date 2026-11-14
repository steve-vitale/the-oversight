#!/usr/bin/env node
// test-transplant4.js — proof test for the H1 TRANSPLANT, family 4
// (arm sim-transplant4-a).
//
// THE QUESTION (evidence/2026-11-13/sim-transplant4.md, prereg
// committed before any judged sim): land origin family 4 — merge
// c0a85b17e "Merge origin/master into forager deed branch" (js=3,
// pol=0; two sub-families, person-trust side + forager/brawler-deed
// side; the WHOLE family is measured, no split) — onto the far end
// 203a32775 (GOOD 4/8) via `git cherry-pick -m 1 c0a85b17e`. On ANY
// conflict STOP, no hand-resolve of game code; the ONE exception
// (family-2b precedent) covers ONLY a conflict in
// scripts/green-list.txt alone, resolved by union after verifying
// only scripts/check.js reads it and zero src/js files do. Any
// other conflicted file -> UNMEASURED, deliverable is the conflict
// report.
//
// OUTCOME — UNMEASURED (conflict-STOP): the live cherry-pick
// reproduced the merge-tree pre-check EXACTLY — the same three
// files (scripts/balance-proof.json, scripts/godpath/validate.js,
// scripts/green-list.txt), the same hunks, 3 markers each; the
// other 16 family files staged cleanly. The pick was aborted; the
// subject branch is LEFT at the far end (no subject commit). No sim
// ran, no survival number exists.
//
// WHAT THIS TEST PROVES:
//   1. Family identity — merge c0a85b17e, its parents, the 4-commit
//      second-parent side, the exact 3 src/js files, +264/-6.
//   2. Merge-tree pre-check (read-only) — exactly THREE
//      content-conflicted files with the predicted marker counts,
//      the other four 'changed in both' files clean (0 markers),
//      plus the 4 clean 'merged' sections (incl. bond-initiation.js),
//      and the exact ours/theirs lines of each conflict hunk.
//   3. Conflicted-file readers — green-list.txt read only by
//      scripts/check.js, zero readers under src/ (union-eligible
//      on its own, but NOT alone); balance-proof.json and
//      validate.js read only by scripts/ tooling, never by src/.
//   4. Verdict mapping — classifyTransplant maps every survived
//      count; conflictStop maps a multi-file conflict to
//      'UNMEASURED' and a green-list-only conflict to 'UNION-OK'.
//   5. Prereg recorded in the evidence file (family, thresholds,
//      pre-check, readers, canon note).
//   6. Base state — HEAD is on sim-transplant4-a, no src/js file
//      differs from HEAD, on-disk standing.js is byte-identical
//      to HEAD, and the step-script tooling source (master) still
//      carries all four scratch files; the step script names the
//      band 190391-190398.
//   7. (stage 2) Live conflict — the cherry-pick conflicted in
//      exactly the three predicted files with the predicted hunks;
//      the subject branch is LEFT at the far end (no subject
//      commit); the evidence file records the conflict report and
//      the UNMEASURED verdict.
//
// Usage: node scripts/test-transplant4.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant4');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const MERGE = 'c0a85b17e';
const MERGE_BASE = 'c15b8c56cbca42e0a0864bd9750366456984f95d';
const SUBJECT_BRANCH = 'transplant-4-subject';
const STEP = 't4-c0a85b17e';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const EXPECTED_JS = [
  'src/js/bond-initiation.js', 'src/js/godpath.js', 'src/js/person-trust.js',
];
// Marker counts from the merge-tree dry run, per 'changed in both' file
// (transplant118 counting method: +<<<<<<<, +=======, +>>>>>>>).
// NOTE: there are SEVEN 'changed in both' sections, not eight —
// src/js/bond-initiation.js is a 'merged' section (our side == base;
// only the family changed it), listed in EXPECTED_MERGED below.
const EXPECTED_MARKERS = {
  'docs/ONTOLOGY.md': 0,
  'scripts/balance-proof.json': 3,
  'scripts/godpath/validate.js': 3,
  'scripts/green-list.txt': 3,
  'src/data/godpaths.json': 0,
  'src/js/godpath.js': 0,
  'sw.js': 0,
};
// 'merged' sections (clean three-way result, result/our OID lines
// only, diff is ours -> result): all 0 markers.
const EXPECTED_MERGED = [
  'index.html',
  'scripts/godpath/ladder.js',
  'scripts/proof-godhood-rework-20261013.js',
  'src/js/bond-initiation.js',
];
// The three conflict hunks, ours (far end) vs theirs (family).
const CONFLICT_HUNKS = {
  'scripts/balance-proof.json': {
    ours: ['"panel": "evidence/2026-11-10/neutral-r167-adopt.json.gz",',
      '"panelDigest": "ff87680261d3e717228bbaac1c2551269fb711464364d1cce49e3ccc0fa9975f",'],
    theirs: ['"panel": "evidence/2026-11-08/neutral-person-trust.json.gz",',
      '"panelDigest": "b90b3411685bafd74504a2885cf41dadaaf906fec83413219078a8cf8ff3c44c",'],
  },
  'scripts/godpath/validate.js': {
    ours: ["['relay_office', 'market_exchange', 'field_truth_shared', 'care_survived', 'outmatched_escape', 'ward_rescue', 'apex_hunt', 'death_refused']"],
    theirs: ["'harvest_fed', 'outmatched_kill'"],
  },
  'scripts/green-list.txt': {
    ours: ['scripts/test-pellet-boost-20261108.js quick',
      'scripts/test-pellet-q4-20261108.js quick'],
    theirs: ['scripts/test-person-trust-20261108.js quick'],
  },
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
// conflictStop(conflictedFiles): the prereg's conflict rule — a
// green-list-only conflict is union-eligible; anything else STOPs.
function conflictStop(files) {
  if (!Array.isArray(files)) return 'UNCLASSIFIABLE';
  if (files.length === 0) return 'NO-CONFLICT';
  if (files.length === 1 && files[0] === 'scripts/green-list.txt') return 'UNION-OK';
  return 'UNMEASURED';
}
// mergeTreeConflicts(): run `git merge-tree <base> <ours> <theirs>`
// (read-only dry run — touches no worktree) and return
// { changedInBoth: {file: markers}, merged: {file: markers}, raw }
// for each section. Section headers are the exact status words
// ('changed in both', 'merged', 'added in remote', ...); a 'merged'
// section carries result/our OID lines only and its diff is
// ours -> result.
function mergeTreeConflicts() {
  const out = execSync('git merge-tree ' + MERGE_BASE + ' ' + FAR + ' ' + MERGE,
    { cwd: REPO, stdio: 'pipe', maxBuffer: 512 * 1024 * 1024 }).toString('utf8');
  const lines = out.split('\n');
  const STATUS = { 'changed in both': 'changedInBoth', 'merged': 'merged',
    'added in remote': 'added', 'added in local': 'added',
    'removed in local': 'removed', 'removed in remote': 'removed' };
  const found = { changedInBoth: {}, merged: {} };
  let cur = null;
  const record = function () {
    if (cur !== null && cur.file !== null && found[cur.kind]) found[cur.kind][cur.file] = cur.markers;
  };
  for (const ln of lines) {
    if (STATUS[ln]) { record(); cur = { kind: STATUS[ln], file: null, markers: 0 }; continue; }
    if (cur !== null) {
      const m = ln.match(/^  (?:base|our|their|result)\s+\d+ [0-9a-f]+ (.+)$/);
      if (m && cur.file === null) cur.file = m[1];
      if (ln.indexOf('+<<<<<<<') === 0 || ln.indexOf('+>>>>>>>') === 0 || ln.indexOf('+=======') === 0) cur.markers++;
    }
  }
  record();
  return { found: found, raw: out };
}

(async () => {
  // ---- 1. Family identity ----
  T.section('1. Family identity — forager-deed merge c0a85b17e');
  T.ok('merge commit exists', git('rev-parse ' + MERGE).length === 40, git('log -1 --format=%s ' + MERGE).slice(0, 80));
  T.ok('first parent is c15b8c56c (Living Garden lived harvest deed)', git('rev-parse ' + MERGE + '^1').startsWith('c15b8c56c'), git('log -1 --format=%h\\ %s ' + MERGE + '^1').slice(0, 80));
  T.ok('second parent is fbb9c53ed (PR #4 person-trust-map merge)', git('rev-parse ' + MERGE + '^2').startsWith('fbb9c53ed'), git('log -1 --format=%h\\ %s ' + MERGE + '^2').slice(0, 80));
  const sideCount = parseInt(git('rev-list --count ' + MERGE + '^1..' + MERGE + '^2'), 10);
  T.ok('second-parent side is 4 commits (PR #4 + PR #3 + 2 deed commits)', sideCount === 4, 'count=' + sideCount);
  const sideSubjects = git('log --format=%s ' + MERGE + '^1..' + MERGE + '^2').split('\n');
  T.ok('second-parent side carries both sub-families (person-trust + brawler deed)',
    sideSubjects.some(function (s) { return s.indexOf('person-trust') !== -1; }) &&
    sideSubjects.some(function (s) { return s.indexOf('Brawler') !== -1; }),
    sideSubjects.join(' | ').slice(0, 160));
  const jsFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- src/js').split('\n').sort();
  T.ok('family touches exactly the 3 expected src/js files', JSON.stringify(jsFiles) === JSON.stringify(EXPECTED_JS.slice().sort()), jsFiles.join(', '));
  const numstat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/js').split('\n')
    .reduce(function (acc, line) { const p = line.split('\t'); return { ins: acc.ins + parseInt(p[0], 10), del: acc.del + parseInt(p[1], 10) }; }, { ins: 0, del: 0 });
  T.ok('family src/js delta is +264/-6', numstat.ins === 264 && numstat.del === 6, '+' + numstat.ins + '/-' + numstat.del);
  const bondStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/js/bond-initiation.js');
  T.ok('bond-initiation.js is +7/-6 (13 lines changed, comment reword)', bondStat === '7\t6\tsrc/js/bond-initiation.js', bondStat);
  const trustStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/js/person-trust.js');
  T.ok('person-trust.js is +233/-0 (new module)', trustStat === '233\t0\tsrc/js/person-trust.js', trustStat);
  const godStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/js/godpath.js');
  T.ok('godpath.js is +24/-0', godStat === '24\t0\tsrc/js/godpath.js', godStat);
  const polFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- scripts/policies');
  T.ok('family touches no policy file', polFiles === '', polFiles || '(none)');
  T.ok('family does not touch standing.js', git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- src/js/standing.js') === '', '(absent)');
  const godpathsStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/data/godpaths.json');
  T.ok('godpaths.json is +6/-0 (outmatched_kill deed)', godpathsStat === '6\t0\tsrc/data/godpaths.json', godpathsStat);
  // Binary files carry '-' for ins/del in numstat — skip those lines.
  const totalLines = git('diff --numstat ' + MERGE + '^1 ' + MERGE).split('\n');
  const totalStat = totalLines.reduce(function (acc, line) {
    const p = line.split('\t');
    const ins = parseInt(p[0], 10), del = parseInt(p[1], 10);
    if (Number.isFinite(ins)) acc.ins += ins;
    if (Number.isFinite(del)) acc.del += del;
    return acc;
  }, { ins: 0, del: 0 });
  T.ok('family total is 19 files, +875/-10', totalLines.length === 19 && totalStat.ins === 875 && totalStat.del === 10,
    totalLines.length + ' files, +' + totalStat.ins + '/-' + totalStat.del);
  const farStanding = sha256(gitShow(FAR, 'src/js/standing.js'));
  T.ok('far-end native standing.js sha is 75762cb2...', farStanding.startsWith('75762cb2'), farStanding.slice(0, 12));
  T.ok('fix standing.js sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  const farPolicy = sha256(gitShow(FAR, 'scripts/policies/competent.js'));
  T.ok('far-end policy sha is a7ff5c51...', farPolicy.startsWith('a7ff5c51'), farPolicy.slice(0, 12));

  // ---- 2. Merge-tree pre-check prediction ----
  T.section('2. Merge-tree pre-check — three conflicts predicted (base = first parent)');
  const mt = mergeTreeConflicts();
  const cib = mt.found.changedInBoth;
  let mtOk = true, mtBad = null;
  for (const f of Object.keys(EXPECTED_MARKERS)) {
    if (cib[f] !== EXPECTED_MARKERS[f]) { mtOk = false; mtBad = f + ' (got ' + cib[f] + ', want ' + EXPECTED_MARKERS[f] + ')'; break; }
  }
  T.ok('merge-tree reports the predicted marker counts on all 7 changed-in-both files', mtOk, mtBad || '7/7 match');
  const conflicted = Object.keys(cib).filter(function (f) { return cib[f] > 0; }).sort();
  T.ok('merge-tree reports exactly THREE content-conflicted files', conflicted.length === 3,
    conflicted.join(', '));
  T.ok('the three conflicted files are balance-proof.json, validate.js, green-list.txt',
    JSON.stringify(conflicted) === JSON.stringify(['scripts/balance-proof.json', 'scripts/godpath/validate.js', 'scripts/green-list.txt']),
    conflicted.join(', '));
  T.ok('merge-tree reports no other changed-in-both file', Object.keys(cib).length === 7,
    'sections=' + Object.keys(cib).length + ': ' + Object.keys(cib).join(', '));
  let mgOk = true, mgBad = null;
  for (const f of EXPECTED_MERGED) {
    if (mt.found.merged[f] !== 0) { mgOk = false; mgBad = f + ' (got ' + mt.found.merged[f] + ', want 0)'; break; }
  }
  T.ok('merge-tree reports the 4 clean merged sections (incl. bond-initiation.js) at 0 markers', mgOk, mgBad || '4/4 clean');
  T.ok('merge-tree reports no other merged section', Object.keys(mt.found.merged).length === 4,
    'sections=' + Object.keys(mt.found.merged).length + ': ' + Object.keys(mt.found.merged).join(', '));
  // bond-initiation.js merges cleanly because the far end did not
  // touch it: our blob == the family's base blob d131970a2.
  const ourBond = git('show ' + FAR + ':src/js/bond-initiation.js | git hash-object --stdin');
  T.ok('far-end bond-initiation.js is byte-identical to the family base (d131970a2)', ourBond.startsWith('d131970a2'), ourBond.slice(0, 12));
  // Exact hunk lines (ours/theirs) as the merge-tree output carries them.
  for (const f of Object.keys(CONFLICT_HUNKS)) {
    const h = CONFLICT_HUNKS[f];
    let hOk = true, hBad = null;
    for (const side of ['ours', 'theirs']) {
      for (const ln of h[side]) {
        if (mt.raw.indexOf('+' + ln) === -1 && mt.raw.indexOf(ln) === -1) { hOk = false; hBad = side + ': ' + ln.slice(0, 60); break; }
      }
      if (!hOk) break;
    }
    T.ok('merge-tree hunk for ' + f + ' carries the recorded ours/theirs lines', hOk, hBad || 'lines present');
  }

  // ---- 3. Conflicted-file readers ----
  T.section('3. Conflicted-file readers — tooling only, never game code');
  const checkJs = fs.readFileSync(path.join(REPO, 'scripts', 'check.js'), 'utf8');
  T.ok('scripts/check.js reads green-list.txt (readList)', checkJs.indexOf("readList('scripts/green-list.txt')") !== -1, 'readList present');
  let srcGreen = [];
  try {
    srcGreen = execSync('git grep -l "green-list" ' + git('rev-parse HEAD') + ' -- src/', { cwd: REPO, stdio: 'pipe' }).toString().trim().split('\n').filter(Boolean);
  } catch (e) { srcGreen = []; }
  T.ok('zero green-list references under src/ (no game-code reader)', srcGreen.length === 0, srcGreen.join(', ') || '(none)');
  let srcProof = [];
  try {
    srcProof = execSync('git grep -l "balance-proof.json" ' + git('rev-parse HEAD') + ' -- src/', { cwd: REPO, stdio: 'pipe' }).toString().trim().split('\n').filter(Boolean);
  } catch (e) { srcProof = []; }
  T.ok('zero balance-proof.json references under src/', srcProof.length === 0, srcProof.join(', ') || '(none)');
  let srcValidate = [];
  try {
    srcValidate = execSync('git grep -l "godpath/validate" ' + git('rev-parse HEAD') + ' -- src/', { cwd: REPO, stdio: 'pipe' }).toString().trim().split('\n').filter(Boolean);
  } catch (e) { srcValidate = []; }
  T.ok('zero godpath/validate references under src/', srcValidate.length === 0, srcValidate.join(', ') || '(none)');
  T.ok('the conflict set is NOT green-list-only, so the union carve-out does not apply',
    conflictStop(conflicted) === 'UNMEASURED', conflictStop(conflicted));

  // ---- 4. Verdict mapping ----
  T.section('4. Verdict mapping — transplant thresholds + conflict rule');
  const table = [[0, 'CARRIER'], [1, 'CARRIER'], [2, 'AMBIGUOUS'], [3, 'NOT-CARRIER'], [4, 'NOT-CARRIER'], [8, 'NOT-CARRIER'], [-1, 'UNCLASSIFIABLE'], [9, 'UNCLASSIFIABLE'], [NaN, 'UNCLASSIFIABLE']];
  for (const pair of table) {
    T.ok('survived ' + pair[0] + ' -> ' + pair[1], classifyTransplant(pair[0]) === pair[1], classifyTransplant(pair[0]));
  }
  T.ok('conflict rule: green-list-only -> UNION-OK', conflictStop(['scripts/green-list.txt']) === 'UNION-OK', conflictStop(['scripts/green-list.txt']));
  T.ok('conflict rule: green-list + one other file -> UNMEASURED',
    conflictStop(['scripts/green-list.txt', 'scripts/balance-proof.json']) === 'UNMEASURED',
    conflictStop(['scripts/green-list.txt', 'scripts/balance-proof.json']));
  T.ok('conflict rule: this family (3 files) -> UNMEASURED', conflictStop(conflicted) === 'UNMEASURED', conflictStop(conflicted));
  T.ok('conflict rule: no conflict -> NO-CONFLICT', conflictStop([]) === 'NO-CONFLICT', conflictStop([]));

  // ---- 5. Prereg recorded in the evidence file ----
  T.section('5. Prereg recorded in the evidence file');
  const evPath = path.join(REPO, 'evidence', '2026-11-13', 'sim-transplant4.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('evidence file exists', ev.length > 0, evPath);
  T.ok('evidence file names the merge c0a85b17e', ev.indexOf('c0a85b17e') !== -1, 'merge present');
  T.ok('evidence file names the far end 203a32775', ev.indexOf('203a32775') !== -1, 'far end present');
  T.ok('evidence file names the band 190391-190398', ev.indexOf('190391') !== -1 && ev.indexOf('190398') !== -1, 'band present');
  T.ok('evidence file records the three conflicted files',
    ev.indexOf('scripts/balance-proof.json') !== -1 && ev.indexOf('scripts/godpath/validate.js') !== -1 && ev.indexOf('scripts/green-list.txt') !== -1,
    '3/3 files named');
  T.ok('evidence file records the union carve-out (green-list-only)', ev.indexOf('green-list.txt') !== -1 && ev.indexOf('UNION') !== -1 || ev.indexOf('union') !== -1, 'carve-out present');
  T.ok('evidence file records the two sub-families caveat', ev.indexOf('sub-famil') !== -1, 'sub-families present');
  T.ok('evidence file records the canon note (no standalone person-trust canon doc)', ev.indexOf('No standalone canon doc covers person-trust') !== -1, 'canon note present');

  // ---- 6. Base state ----
  T.section('6. Base state — arm branch clean, no swap residue');
  const headBranch = git('rev-parse --abbrev-ref HEAD');
  T.ok('HEAD is on the arm branch sim-transplant4-a', headBranch === 'sim-transplant4-a', 'HEAD=' + headBranch);
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
  const stepSrc = fs.readFileSync(path.join(REPO, 'scripts', 'culpritbisect-step.sh'), 'utf8');
  T.ok('step script names the band 190391..190398',
    stepSrc.indexOf('190391,190392,190393,190394,190395,190396,190397,190398') !== -1, 'band literal present');

  // ---- 7. Live conflict (stage 2) ----
  T.section('7. Live conflict — pick reproduced the pre-check exactly, then aborted');
  let subjectTip = null;
  try { subjectTip = git('rev-parse ' + SUBJECT_BRANCH); } catch (e) { subjectTip = null; }
  T.ok('subject branch exists', subjectTip !== null && subjectTip.length === 40, subjectTip ? subjectTip.slice(0, 12) : '(missing)');
  if (subjectTip) {
    T.ok('subject branch is LEFT at the far end (no subject commit)', subjectTip === FAR_FULL, subjectTip.slice(0, 12));
  }
  const ev2 = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('evidence file records the verdict as UNMEASURED (conflict-STOP)', ev2.indexOf('VERDICT: UNMEASURED (conflict-STOP)') !== -1, 'UNMEASURED present');
  T.ok('evidence file records the live pick (16 of 19 staged cleanly)', ev2.indexOf('16 of 19') !== -1, '16/19 present');
  let liveOk = true, liveBad = null;
  for (const frag of ['live lines 3–9', 'live lines 91–103', 'live lines 916–921']) {
    if (ev2.indexOf(frag) === -1) { liveOk = false; liveBad = frag; break; }
  }
  T.ok('evidence file records all three live conflict line ranges', liveOk, liveBad || '3/3 ranges');
  T.ok('evidence file records the abort (pick aborted, branch back at far end)', ev2.indexOf('cherry-pick --abort') !== -1, 'abort recorded');
  T.ok('evidence file records that no hand-resolution happened', ev2.indexOf('No hand-resolution') !== -1, 'no hand-resolution recorded');
  const t4Summary = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  T.ok('no step summary exists (no sim ran)', !fs.existsSync(t4Summary), STEP);
  const t4Driver = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  T.ok('no step driver log exists (no sim ran)', !fs.existsSync(t4Driver), STEP);
  const headBranch2 = git('rev-parse --abbrev-ref HEAD');
  T.ok('HEAD is back on the arm branch sim-transplant4-a after the pick', headBranch2 === 'sim-transplant4-a', 'HEAD=' + headBranch2);
  const dirtyAfter = git('status --porcelain --untracked-files=no');
  T.ok('tracked tree is clean after the abort', dirtyAfter === '', dirtyAfter.slice(0, 200) || '(clean)');
  const onDiskStanding2 = sha256(fs.readFileSync(path.join(REPO, 'src', 'js', 'standing.js'), 'utf8'));
  const headStanding2 = sha256(gitShow('HEAD', 'src/js/standing.js'));
  T.ok('on-disk standing.js still byte-identical to HEAD (no swap ever ran)', onDiskStanding2 === headStanding2, onDiskStanding2.slice(0, 12));

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
