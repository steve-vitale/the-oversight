#!/usr/bin/env node
// test-transplant4b.js — proof test for the H1 TRANSPLANT, narrowed
// family 4b (arm sim-transplant4b-a).
//
// THE QUESTION (evidence/2026-11-13/sim-transplant4b.md, prereg
// committed before any judged sim): land origin family 4 — merge
// c0a85b17e "Merge origin/master into forager deed branch" (js=3,
// pol=0; two sub-families, person-trust side + forager/brawler-deed
// side) — onto the far end 203a32775 (GOOD 4/8) via
// `git cherry-pick -m 1 c0a85b17e`, resolving the three scripts/
// tooling conflicts per the NARROWED 4b DEFINITION (authorized under
// the narrowed-tooling rule, coordinator decision in
// sim-transplant-round-0015.md §Method decision): balance-proof.json
// OURS (far-end pointer; the driver never reads it), validate.js
// THEIRS (justified by grep: the transplanted godpath.js emits
// outmatched_kill, which only theirs accepts), green-list.txt UNION
// (both sides' added lines, no deletions). Family 4 itself was
// UNMEASURED (conflict-STOP, sim-transplant4.md); 4b is a NEW family
// definition, never a re-judgment.
//
// WHAT THIS TEST PROVES (stage 1, sections 1-6):
//   1. Family identity — merge c0a85b17e, its parents, the 4-commit
//      second-parent side, the exact 3 src/js files, +264/-6.
//   2. Merge-tree pre-check (read-only) — exactly THREE
//      content-conflicted files with the predicted marker counts,
//      the other four 'changed in both' files clean (0 markers),
//      the 4 clean 'merged' sections (incl. bond-initiation.js),
//      the 8 clean 'added in remote' sections (incl. the new
//      person-trust.js — no DU), and the exact ours/theirs lines of
//      each conflict hunk. The parser tracks BOTH 'changed in both'
//      and 'merged' sections (the family-4 arm's stage-1 proof
//      initially missed bond-initiation.js that way).
//   3. Narrowed-resolution grep justifications — all three conflicted
//      files have zero readers in src/; the driver/analyzer never
//      read balance-proof.json; the validate.js theirs-choice is
//      justified (merge godpath.js references both events, the
//      first parent carries harvest_fed x5 / outmatched_kill x0, the
//      far end carries neither, theirs is a strict superset of ours);
//      the conflict rule admits exactly the three narrowed files.
//   4. Verdict mapping — classifyTransplant maps every survived
//      count; conflictStop4b maps the narrowed set to 'NARROWED-OK'
//      and any other file to 'UNMEASURED'.
//   5. Prereg recorded in the evidence file (narrowed definition,
//      grep justifications, STOP clause, thresholds, canon note).
//   6. Base state — HEAD is on sim-transplant4b-a, no src/js file
//      differs from HEAD, on-disk standing.js is byte-identical
//      to HEAD, the step-script tooling source (master) still
//      carries all four scratch files; the step script names the
//      band 190391-190398; the subject branch does not exist yet
//      and no step summary/driver log exists yet.
// (stage 2, section 7 — appended after the pick + sim: subject
// commit recorded, family diff byte-identical, resolutions verified,
// step summary present, base restored.)
//
// Usage: node scripts/test-transplant4b.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant4b');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const MERGE = 'c0a85b17e';
const MERGE_BASE = 'c15b8c56cbca42e0a0864bd9750366456984f95d';
const SUBJECT_BRANCH = 'transplant-4b-subject';
const STEP = 't4b-c0a85b17e';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const EXPECTED_JS = [
  'src/js/bond-initiation.js', 'src/js/godpath.js', 'src/js/person-trust.js',
];
// Marker counts from the merge-tree dry run, per 'changed in both' file
// (transplant118 counting method: +<<<<<<<, +=======, +>>>>>>>).
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
// 'added in remote' sections (new files, clean add): all 0 markers.
const EXPECTED_ADDED = [
  'evidence/2026-11-08/brawler-deed-audit.md',
  'evidence/2026-11-08/neutral-person-trust.json.gz',
  'evidence/2026-11-08/person-trust-prereg.md',
  'evidence/2026-11-08/person-trust.md',
  'scripts/godpath/test-brawler-deed.js',
  'scripts/person-trust-panel-20261108.js',
  'scripts/test-person-trust-20261108.js',
  'src/js/person-trust.js',
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
const NARROWED_FILES = [
  'scripts/balance-proof.json', 'scripts/godpath/validate.js', 'scripts/green-list.txt',
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
// conflictStop4b(conflictedFiles): the narrowed-4b conflict rule —
// the conflict set must be a non-empty SUBSET of the three narrowed
// files; anything else (a fourth file, any src/js file) STOPs.
function conflictStop4b(files) {
  if (!Array.isArray(files)) return 'UNCLASSIFIABLE';
  if (files.length === 0) return 'NO-CONFLICT';
  if (files.every(function (f) { return NARROWED_FILES.indexOf(f) !== -1; })) return 'NARROWED-OK';
  return 'UNMEASURED';
}
// mergeTreeConflicts(): run `git merge-tree <base> <ours> <theirs>`
// (read-only dry run — touches no worktree) and return
// { changedInBoth: {file: markers}, merged: {file: markers},
//   added: {file: markers}, raw } for each section. Section headers
// are the exact status words ('changed in both', 'merged', 'added in
// remote', ...); a 'merged' section carries result/our OID lines
// only and its diff is ours -> result.
function mergeTreeConflicts() {
  const out = execSync('git merge-tree ' + MERGE_BASE + ' ' + FAR + ' ' + MERGE,
    { cwd: REPO, stdio: 'pipe', maxBuffer: 512 * 1024 * 1024 }).toString('utf8');
  const lines = out.split('\n');
  const STATUS = { 'changed in both': 'changedInBoth', 'merged': 'merged',
    'added in remote': 'added', 'added in local': 'added',
    'removed in local': 'removed', 'removed in remote': 'removed' };
  const found = { changedInBoth: {}, merged: {}, added: {} };
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
  T.section('1. Family identity — forager-deed merge c0a85b17e (narrowed 4b)');
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
  // Far-end substrate: bond + godpath present, person-trust absent.
  const farBond = git('ls-tree ' + FAR + ' -- src/js/bond-initiation.js');
  T.ok('far-end bond-initiation.js present (blob d131970a2, == family base)', farBond.indexOf('d131970a2') !== -1, farBond.slice(0, 60));
  const farGod = git('ls-tree ' + FAR + ' -- src/js/godpath.js');
  T.ok('far-end godpath.js present', farGod.length > 0, farGod.slice(0, 60));
  let farTrust = '';
  try { farTrust = git('ls-tree ' + FAR + ' -- src/js/person-trust.js'); } catch (e) { farTrust = ''; }
  T.ok('far-end person-trust.js ABSENT (new file, clean add, no DU)', farTrust === '', '(absent)');

  // ---- 2. Merge-tree pre-check prediction ----
  T.section('2. Merge-tree pre-check — three tooling conflicts predicted (base = first parent)');
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
  let adOk = true, adBad = null;
  for (const f of EXPECTED_ADDED) {
    if (mt.found.added[f] !== 0) { adOk = false; adBad = f + ' (got ' + mt.found.added[f] + ', want 0)'; break; }
  }
  T.ok('merge-tree reports the 8 clean added-in-remote sections (incl. person-trust.js) at 0 markers', adOk, adBad || '8/8 clean');
  T.ok('merge-tree reports no other added section', Object.keys(mt.found.added).length === 8,
    'sections=' + Object.keys(mt.found.added).length + ': ' + Object.keys(mt.found.added).join(', '));
  T.ok('no DU entry anywhere (person-trust.js is a clean add, not deleted-then-updated)',
    mt.raw.indexOf('deleted in local') === -1 && mt.raw.indexOf('deleted in remote') === -1, 'no DU sections');
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

  // ---- 3. Narrowed-resolution grep justifications ----
  T.section('3. Narrowed-resolution grep justifications — tooling only, zero src/ readers');
  const checkJs = fs.readFileSync(path.join(REPO, 'scripts', 'check.js'), 'utf8');
  T.ok('scripts/check.js reads green-list.txt (readList)', checkJs.indexOf("readList('scripts/green-list.txt')") !== -1, 'readList present');
  const head = git('rev-parse HEAD');
  function srcRefs(needle) {
    try {
      return execSync('git grep -l "' + needle + '" ' + head + ' -- src/', { cwd: REPO, stdio: 'pipe' }).toString().trim().split('\n').filter(Boolean);
    } catch (e) { return []; }
  }
  T.ok('zero green-list references under src/ (no game-code reader)', srcRefs('green-list').length === 0, srcRefs('green-list').join(', ') || '(none)');
  T.ok('zero balance-proof.json references under src/', srcRefs('balance-proof.json').length === 0, srcRefs('balance-proof.json').join(', ') || '(none)');
  T.ok('zero godpath/validate references under src/', srcRefs('godpath/validate').length === 0, srcRefs('godpath/validate').join(', ') || '(none)');
  const driver = fs.readFileSync(path.join(REPO, 'scripts', 'culpritbisect-driver-20261113.js'), 'utf8');
  const analyzer = fs.readFileSync(path.join(REPO, 'scripts', 'culpritbisect-analyze-20261113.js'), 'utf8');
  T.ok('bisect driver never reads balance-proof.json', driver.indexOf('balance-proof') === -1, 'no match');
  T.ok('bisect analyzer never reads balance-proof.json', analyzer.indexOf('balance-proof') === -1, 'no match');
  T.ok('bisect driver never invokes validate.js or check.js', driver.indexOf('validate.js') === -1 && driver.indexOf('check.js') === -1, 'no match');
  // validate.js theirs-justification: merge godpath.js has both events.
  const mergeGod = gitShow(MERGE, 'src/js/godpath.js');
  T.ok('merge godpath.js references outmatched_kill', mergeGod.indexOf('outmatched_kill') !== -1, 'present');
  T.ok('merge godpath.js references harvest_fed', mergeGod.indexOf('harvest_fed') !== -1, 'present');
  const firstGod = gitShow(MERGE_BASE, 'src/js/godpath.js');
  const firstHarvest = (firstGod.match(/harvest_fed/g) || []).length;
  const firstOutmatched = (firstGod.match(/outmatched_kill/g) || []).length;
  T.ok('first-parent godpath.js carries harvest_fed x5 (Living Garden, not the family diff)', firstHarvest === 5, 'count=' + firstHarvest);
  T.ok('first-parent godpath.js carries outmatched_kill x0', firstOutmatched === 0, 'count=' + firstOutmatched);
  const farGodText = gitShow(FAR, 'src/js/godpath.js');
  T.ok('far-end godpath.js references NEITHER event', farGodText.indexOf('harvest_fed') === -1 && farGodText.indexOf('outmatched_kill') === -1, 'neither present');
  let farJsEvent = [];
  try {
    farJsEvent = execSync('git grep -l -E "harvest_fed|outmatched_kill" ' + FAR + ' -- src/js', { cwd: REPO, stdio: 'pipe' }).toString().trim().split('\n').filter(Boolean);
  } catch (e) { farJsEvent = []; }
  T.ok('no far-end src/js file references either event', farJsEvent.length === 0, farJsEvent.join(', ') || '(none)');
  // Theirs validator is a strict superset of ours.
  const oursValidate = gitShow(FAR, 'scripts/godpath/validate.js');
  const theirsValidate = gitShow(MERGE, 'scripts/godpath/validate.js');
  T.ok('ours validator lacks outmatched_kill (would reject the subject\'s own deed)', oursValidate.indexOf('outmatched_kill') === -1, 'absent in ours');
  T.ok('ours validator lacks harvest_fed', oursValidate.indexOf('harvest_fed') === -1, 'absent in ours');
  T.ok('theirs validator accepts outmatched_kill', theirsValidate.indexOf('outmatched_kill') !== -1, 'present in theirs');
  T.ok('theirs validator accepts harvest_fed', theirsValidate.indexOf('harvest_fed') !== -1, 'present in theirs');
  const oursEvents = ['relay_office', 'market_exchange', 'field_truth_shared', 'care_survived', 'outmatched_escape', 'ward_rescue', 'apex_hunt', 'death_refused'];
  T.ok('theirs validator still accepts all 8 ours events (strict superset)', oursEvents.every(function (e) { return theirsValidate.indexOf(e) !== -1; }), '8/8 present');
  T.ok('the narrowed conflict set is exactly the 3 authorized files', conflictStop4b(conflicted) === 'NARROWED-OK', conflictStop4b(conflicted));

  // ---- 4. Verdict mapping ----
  T.section('4. Verdict mapping — transplant thresholds + narrowed conflict rule');
  const table = [[0, 'CARRIER'], [1, 'CARRIER'], [2, 'AMBIGUOUS'], [3, 'NOT-CARRIER'], [4, 'NOT-CARRIER'], [8, 'NOT-CARRIER'], [-1, 'UNCLASSIFIABLE'], [9, 'UNCLASSIFIABLE'], [NaN, 'UNCLASSIFIABLE']];
  for (const pair of table) {
    T.ok('survived ' + pair[0] + ' -> ' + pair[1], classifyTransplant(pair[0]) === pair[1], classifyTransplant(pair[0]));
  }
  T.ok('conflict rule: the 3 narrowed files -> NARROWED-OK', conflictStop4b(conflicted) === 'NARROWED-OK', conflictStop4b(conflicted));
  T.ok('conflict rule: green-list-only -> NARROWED-OK (subset of the rule)', conflictStop4b(['scripts/green-list.txt']) === 'NARROWED-OK', conflictStop4b(['scripts/green-list.txt']));
  T.ok('conflict rule: narrowed 3 + one src/js file -> UNMEASURED',
    conflictStop4b(['scripts/balance-proof.json', 'scripts/godpath/validate.js', 'scripts/green-list.txt', 'src/js/godpath.js']) === 'UNMEASURED',
    conflictStop4b(['scripts/balance-proof.json', 'scripts/godpath/validate.js', 'scripts/green-list.txt', 'src/js/godpath.js']));
  T.ok('conflict rule: narrowed 3 + one other scripts file -> UNMEASURED',
    conflictStop4b(['scripts/balance-proof.json', 'scripts/godpath/validate.js', 'scripts/green-list.txt', 'docs/ONTOLOGY.md']) === 'UNMEASURED',
    conflictStop4b(['scripts/balance-proof.json', 'scripts/godpath/validate.js', 'scripts/green-list.txt', 'docs/ONTOLOGY.md']));
  T.ok('conflict rule: no conflict -> NO-CONFLICT', conflictStop4b([]) === 'NO-CONFLICT', conflictStop4b([]));

  // ---- 5. Prereg recorded in the evidence file ----
  T.section('5. Prereg recorded in the evidence file');
  const evPath = path.join(REPO, 'evidence', '2026-11-13', 'sim-transplant4b.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('evidence file exists', ev.length > 0, evPath);
  T.ok('evidence file names the merge c0a85b17e', ev.indexOf('c0a85b17e') !== -1, 'merge present');
  T.ok('evidence file names the far end 203a32775', ev.indexOf('203a32775') !== -1, 'far end present');
  T.ok('evidence file names the band 190391-190398', ev.indexOf('190391') !== -1 && ev.indexOf('190398') !== -1, 'band present');
  T.ok('evidence file names the STEP id t4b-c0a85b17e', ev.indexOf('t4b-c0a85b17e') !== -1, 'STEP present');
  T.ok('evidence file records the NARROWED 4b DEFINITION', ev.indexOf('NARROWED 4b DEFINITION') !== -1, 'narrowed definition present');
  T.ok('evidence file records the balance-proof.json OURS resolution', ev.indexOf('balance-proof.json') !== -1 && ev.indexOf('OURS') !== -1, 'ours present');
  T.ok('evidence file records the validate.js THEIRS resolution', ev.indexOf('validate.js') !== -1 && ev.indexOf('THEIRS') !== -1, 'theirs present');
  T.ok('evidence file records the green-list UNION resolution', ev.indexOf('green-list.txt') !== -1 && ev.indexOf('UNION') !== -1, 'union present');
  T.ok('evidence file records the validate.js grep justification (both events + first parent)',
    ev.indexOf('harvest_fed') !== -1 && ev.indexOf('outmatched_kill') !== -1 && ev.indexOf('FIRST PARENT') !== -1, 'justification present');
  T.ok('evidence file records the STOP clause', ev.indexOf('STOP clause') !== -1, 'STOP clause present');
  T.ok('evidence file records the narrowed-tooling rule authorization', ev.indexOf('narrowed-tooling rule') !== -1, 'rule present');
  T.ok('evidence file records that 4b is a NEW family definition, never a re-judgment',
    ev.indexOf('NEW family definition') !== -1, 'new-definition note present');
  T.ok('evidence file records the canon note (no standalone person-trust canon doc)', ev.indexOf('No standalone canon doc covers person-trust') !== -1, 'canon note present');
  T.ok('evidence file records the subject branch name transplant-4b-subject', ev.indexOf('transplant-4b-subject') !== -1, 'subject branch present');
  T.ok('evidence file records the far-end substrate check (no DU)', ev.indexOf('zero DU entries') !== -1, 'no-DU note present');

  // ---- 6. Base state ----
  T.section('6. Base state — arm branch clean, subject not yet cut, no sim yet');
  const headBranch = git('rev-parse --abbrev-ref HEAD');
  T.ok('HEAD is on the arm branch sim-transplant4b-a', headBranch === 'sim-transplant4b-a', 'HEAD=' + headBranch);
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
  let subjectExists = true;
  try { git('rev-parse ' + SUBJECT_BRANCH); } catch (e) { subjectExists = false; }
  T.ok('subject branch does not exist yet (cut after this commit)', !subjectExists, SUBJECT_BRANCH);
  const t4bSummary = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  T.ok('no step summary exists yet (no sim ran)', !fs.existsSync(t4bSummary), STEP);
  const t4bDriver = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  T.ok('no step driver log exists yet (no sim ran)', !fs.existsSync(t4bDriver), STEP);

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
