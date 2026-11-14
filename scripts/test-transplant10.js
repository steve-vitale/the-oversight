#!/usr/bin/env node
// test-transplant10.js — proof test for the H1 TRANSPLANT, family 10
// (arm sim-transplant10).
//
// THE QUESTION (evidence/2026-11-13/sim-transplant10.md, prereg
// evidence/2026-11-13/sim-scale-onramp-round-2115.md §3, binding):
// land origin family 10 — PR #4 merge fbb9c53ed (person-trust map,
// NEW src/js/person-trust.js +233, src/js/bond-initiation.js comment
// rewrite) — onto the far end 203a32775 (GOOD 4/8) and measure
// whether it alone collapses it. Verdicts (fresh thresholds): <=1/8
// CARRIER, 2/8 AMBIGUOUS (re-run once; 2/8 again -> recorded
// AMBIGUOUS, treated as NOT-CARRIER for ordering, kept on the
// suspect list), >=3/8 NOT-CARRIER.
//
// PREDICTED OUTCOME — UNMEASURED (conflict-STOP): the merge-tree
// pre-check predicts TWO content-conflicted files
// (scripts/balance-proof.json, 1 hunk, 3 markers;
// scripts/green-list.txt, 1 hunk, 3 markers) plus two clean
// changed-in-both merges (docs/ONTOLOGY.md, sw.js, 0 markers each),
// six added-in-remote files, and NO delete/modify entries. The live
// cherry-pick is expected to reproduce both conflicts exactly, the
// run STOPS, no subject commit exists, no step ran, no survival
// number was measured. The narrowed-tooling rule does NOT apply to
// this arm (task brief, explicit — a narrowed 10b is a coordinator
// decision, not this arm's call), even though both conflicts are
// confined to zero-src-reader tooling files.
//
// WHAT THIS TEST PROVES:
//   1. Family identity — merge fbb9c53ed, its parents, the 1-commit
//      second-parent side, the exact 2 src/js files, +240/-6
//      (person-trust.js 233+/0- NEW, bond-initiation.js 7+/6-
//      comment-only), 12 files +594/-8 total, no policy file, no
//      standing.js, far-end standing 75762cb2, fix f8fda429, far-end
//      policy a7ff5c51, person-trust.js ABSENT at the far end and
//      the first parent / PRESENT at the merge, bond-initiation.js
//      blob identical at the far end and the first parent.
//   2. Merge-tree prediction (read-only) — exactly FOUR 'changed
//      in both' sections with marker counts {ONTOLOGY 0,
//      balance-proof 3, green-list 3, sw.js 0}; exactly TWO
//      content-conflicted files; index.html and bond-initiation.js
//      NOT changed-in-both (ours == base for both, trivial merges);
//      exactly SIX added-in-remote files; NO removed-in-local /
//      removed-in-remote sections (no DU anywhere).
//   3. Readers + tooling-only analysis — scripts/check.js reads
//      green-list.txt; ZERO readers under src/ for green-list.txt
//      AND for balance-proof.json; balance-proof.json IS named by
//      measurement tooling (positive control); the conflicts ARE
//      confined to tooling files, but conflictStopVerdict maps ANY
//      conflict -> UNMEASURED on this arm (no carve-out — the
//      narrowed-tooling rule does not apply).
//   4. Verdict mapping — classifyTransplant maps every survived
//      count; conflictStopVerdict maps the conflict sets for THIS
//      arm.
//   5. Base state — HEAD is back on sim-transplant10 (WORKTREE-ONLY
//      leg: on the merged tip the arm branch is deleted by design,
//      so the leg asserts the merged-tip replacement instead), no
//      src/js file differs from HEAD, on-disk standing.js is
//      byte-identical to HEAD, and the step-script tooling source
//      (master) still carries all four scratch files.
//   6. Seed-band identity — the step script and the prereg name
//      exactly seeds 190391–190398.
//   7. Live conflict record — the subject branch exists at the far
//      end with NO subject commit; the evidence file records the
//      live UU files and hunks, the exact marker lines and stage
//      blobs, the UNMEASURED verdict, the abort + clean tree, the
//      narrowed-10b note as a coordinator decision, and the SEVENTH
//      family to stop.
//   8. No corpus — no step summary, driver log, or per-seed corpus
//      exists for STEP t10-fbb9c53ed, because no judged sim ran.
//
// Usage: node scripts/test-transplant10.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant10');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const MERGE = 'fbb9c53ed';
const MERGE_BASE = 'a76333124';
const SUBJECT_BRANCH = 'transplant-10-subject';
const STEP = 't10-fbb9c53ed';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const EXPECTED_JS = [
  'src/js/bond-initiation.js', 'src/js/person-trust.js',
];
// Marker counts from the merge-tree dry run, per 'changed in both' file
// (transplant118/2b counting method: +<<<<<<<, +=======, +>>>>>>>).
const EXPECTED_MARKERS = {
  'docs/ONTOLOGY.md': 0,
  'scripts/balance-proof.json': 3,
  'scripts/green-list.txt': 3,
  'sw.js': 0,
};
// The six added-in-remote files.
const EXPECTED_ADDED = [
  'evidence/2026-11-08/neutral-person-trust.json.gz',
  'evidence/2026-11-08/person-trust-prereg.md',
  'evidence/2026-11-08/person-trust.md',
  'scripts/person-trust-panel-20261108.js',
  'scripts/test-person-trust-20261108.js',
  'src/js/person-trust.js',
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
// the narrowed-tooling rule does NOT apply to family 10 (task brief,
// explicit: a narrowed 10b is a coordinator decision, not this arm's
// call). ANY conflict stops the run (UNMEASURED); only a clean pick
// is MEASURABLE. The conflicts being tooling-only does not change
// this arm's verdict — it only shapes the coordinator's next step.
function conflictStopVerdict(files) {
  if (!Array.isArray(files)) return 'UNCLASSIFIABLE';
  if (files.length === 0) return 'MEASURABLE';
  return 'UNMEASURED';
}
// mergeTreeConflicts(): run `git merge-tree <base> <ours> <theirs>`
// (read-only dry run — touches no worktree) and return { file: markers }
// for each 'changed in both' section. (Parser copied from
// test-transplant7.js; the counting method counts +<<<<<<<,
// +=======, +>>>>>>> lines — merge-tree prefixes markers with '+',
// so a bare ^<<<<<<< grep misses them.)
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
// mergeTreeAddedInRemote(): return the file list from the raw
// merge-tree output's 'added in remote' sections.
function mergeTreeAddedInRemote() {
  const out = execSync('git merge-tree ' + MERGE_BASE + ' ' + FAR + ' ' + MERGE,
    { cwd: REPO, stdio: 'pipe', maxBuffer: 512 * 1024 * 1024 }).toString('utf8');
  const lines = out.split('\n');
  const added = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === 'added in remote') {
      const m = (lines[i + 1] || '').match(/^  their\s+\d+ [0-9a-f]+ (.+)$/);
      if (m) added.push(m[1]);
    }
  }
  return added.sort();
}
function mergeTreeRaw() {
  return execSync('git merge-tree ' + MERGE_BASE + ' ' + FAR + ' ' + MERGE,
    { cwd: REPO, stdio: 'pipe', maxBuffer: 512 * 1024 * 1024 }).toString('utf8');
}

(async () => {
  // ---- 1. Family identity ----
  T.section('1. Family identity — PR #4 merge fbb9c53ed');
  T.ok('merge commit exists', git('rev-parse ' + MERGE).length === 40, git('log -1 --format=%s ' + MERGE).slice(0, 80));
  T.ok('first parent is a76333124 (family-13 brawler merge)', git('rev-parse ' + MERGE + '^1').startsWith('a76333124'), git('log -1 --format=%h\\ %s ' + MERGE + '^1').slice(0, 80));
  T.ok('second parent is 4588114119f (person-trust side)', git('rev-parse ' + MERGE + '^2').startsWith('4588114119f'), git('log -1 --format=%h\\ %s ' + MERGE + '^2').slice(0, 80));
  const sideCount = parseInt(git('rev-list --count ' + MERGE + '^1..' + MERGE + '^2'), 10);
  T.ok('second-parent side is 1 commit', sideCount === 1, 'count=' + sideCount);
  const jsFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- src/js').split('\n').sort();
  T.ok('family touches exactly the 2 expected src/js files', JSON.stringify(jsFiles) === JSON.stringify(EXPECTED_JS.slice().sort()), jsFiles.join(', '));
  const numstat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/js').split('\n')
    .reduce(function (acc, line) { const p = line.split('\t'); return { ins: acc.ins + parseInt(p[0], 10), del: acc.del + parseInt(p[1], 10) }; }, { ins: 0, del: 0 });
  T.ok('family src/js delta is +240/-6', numstat.ins === 240 && numstat.del === 6, '+' + numstat.ins + '/-' + numstat.del);
  const trustStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/js/person-trust.js');
  const bondStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/js/bond-initiation.js');
  T.ok('person-trust.js is 233+/0- (NEW)', trustStat === '233\t0\tsrc/js/person-trust.js', trustStat);
  T.ok('bond-initiation.js is 7+/6- (comment rewrite)', bondStat === '7\t6\tsrc/js/bond-initiation.js', bondStat);
  const allFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE).split('\n').sort();
  T.ok('family touches exactly 12 files total', allFiles.length === 12, allFiles.join(', '));
  const totalStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE).split('\n')
    .reduce(function (acc, line) { const p = line.split('\t'); return { ins: acc.ins + (p[0] === '-' ? 0 : parseInt(p[0], 10)), del: acc.del + (p[1] === '-' ? 0 : parseInt(p[1], 10)) }; }, { ins: 0, del: 0 });
  T.ok('family total delta is +594/-8', totalStat.ins === 594 && totalStat.del === 8, '+' + totalStat.ins + '/-' + totalStat.del);
  const polFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- scripts/policies');
  T.ok('family touches no policy file', polFiles === '', polFiles || '(none)');
  T.ok('family does not touch standing.js', git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- src/js/standing.js') === '', '(absent)');
  const farStanding = sha256(gitShow(FAR, 'src/js/standing.js'));
  T.ok('far-end native standing.js sha is 75762cb2...', farStanding.startsWith('75762cb2'), farStanding.slice(0, 12));
  T.ok('fix standing.js sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  const farPolicy = sha256(gitShow(FAR, 'scripts/policies/competent.js'));
  T.ok('far-end policy sha is a7ff5c51...', farPolicy.startsWith('a7ff5c51'), farPolicy.slice(0, 12));
  T.ok('person-trust.js is ABSENT at the far end (ls-tree empty)',
    git('ls-tree ' + FAR + ' -- src/js/person-trust.js') === '', '(absent)');
  T.ok('person-trust.js is ABSENT at the first parent (ls-tree empty)',
    git('ls-tree ' + MERGE_BASE + ' -- src/js/person-trust.js') === '', '(absent)');
  T.ok('person-trust.js is PRESENT at the merge (blob e9334c61...)',
    git('ls-tree ' + MERGE + ' -- src/js/person-trust.js').indexOf('e9334c61defb11004eeb2bf632e9b41eec969c68') !== -1, 'blob e9334c61');
  const farBond = git('ls-tree ' + FAR + ' -- src/js/bond-initiation.js');
  const baseBond = git('ls-tree ' + MERGE_BASE + ' -- src/js/bond-initiation.js');
  T.ok('bond-initiation.js blob is IDENTICAL at the far end and the first parent (d131970a)',
    farBond === baseBond && farBond.indexOf('d131970a2d71fe47b3907e2b65f900f852bf4eca') !== -1, farBond.slice(0, 60));
  const mergeIndex = gitShow(MERGE, 'index.html');
  const farIndex = gitShow(FAR, 'index.html');
  T.ok('merge index.html loads person-trust.js after skill-teaching.js',
    mergeIndex.indexOf('src/js/person-trust.js') !== -1 && mergeIndex.indexOf('src/js/person-trust.js') > mergeIndex.indexOf('src/js/skill-teaching.js'), 'script tag present');
  T.ok('far-end index.html does NOT load person-trust.js',
    farIndex.indexOf('src/js/person-trust.js') === -1, '(absent)');

  // ---- 2. Merge-tree prediction ----
  T.section('2. Merge-tree prediction — two conflicted files, two clean merges, six adds, no DU');
  const mt = mergeTreeConflicts();
  let mtOk = true, mtBad = null;
  for (const f of Object.keys(EXPECTED_MARKERS)) {
    if (mt[f] !== EXPECTED_MARKERS[f]) { mtOk = false; mtBad = f + ' (got ' + mt[f] + ', want ' + EXPECTED_MARKERS[f] + ')'; break; }
  }
  T.ok('merge-tree reports the same marker counts per changed-in-both file', mtOk, mtBad || '4/4 match');
  T.ok('merge-tree reports exactly FOUR changed-in-both files', Object.keys(mt).length === 4, 'sections=' + Object.keys(mt).length + ': ' + Object.keys(mt).join(', '));
  const conflicted = Object.keys(mt).filter(function (f) { return mt[f] > 0; }).sort();
  T.ok('merge-tree reports exactly TWO content-conflicted files', conflicted.length === 2, 'conflicted=' + conflicted.join(', '));
  T.ok('the conflicted files are balance-proof.json + green-list.txt',
    JSON.stringify(conflicted) === JSON.stringify(['scripts/balance-proof.json', 'scripts/green-list.txt']), conflicted.join(', '));
  T.ok('ONTOLOGY.md merges cleanly (0 markers)', mt['docs/ONTOLOGY.md'] === 0, 'markers=0');
  T.ok('sw.js merges cleanly (0 markers)', mt['sw.js'] === 0, 'markers=0');
  T.ok('index.html is NOT a changed-in-both file (trivial merge: ours == base)',
    mt['index.html'] === undefined, 'absent from map');
  T.ok('bond-initiation.js is NOT a changed-in-both file (trivial merge: ours == base)',
    mt['src/js/bond-initiation.js'] === undefined, 'absent from map');
  const farHtmlBlob = git('ls-tree ' + FAR + ' -- index.html').split(/\s+/)[2];
  const baseHtmlBlob = git('ls-tree ' + MERGE_BASE + ' -- index.html').split(/\s+/)[2];
  T.ok('index.html blob is IDENTICAL at the far end and the first parent (40d531d9)',
    farHtmlBlob === baseHtmlBlob && farHtmlBlob === '40d531d9d7b4e98dcc5c1b94b17e011cb16c91be', farHtmlBlob);
  const added = mergeTreeAddedInRemote();
  T.ok('merge-tree reports exactly SIX added-in-remote files', added.length === 6, 'added=' + added.join(', '));
  T.ok('the added files are the 3 evidence files + panel + test + person-trust.js',
    JSON.stringify(added) === JSON.stringify(EXPECTED_ADDED.slice().sort()), added.join(', '));
  const mtRaw = mergeTreeRaw();
  T.ok("raw merge-tree output carries NO 'removed in local' section (no DU)",
    mtRaw.indexOf('removed in local') === -1, 'no DU signal');
  T.ok("raw merge-tree output carries NO 'removed in remote' section",
    mtRaw.indexOf('removed in remote') === -1, 'no removed signal');
  T.ok("raw merge-tree output carries NO 'added in local' section",
    mtRaw.indexOf('added in local') === -1, 'no added-local signal');
  // The two conflict hunks' theirs-side lines.
  const mergeProof = gitShow(MERGE, 'scripts/balance-proof.json');
  T.ok('merge balance-proof.json points at the person-trust panel corpus',
    mergeProof.indexOf('evidence/2026-11-08/neutral-person-trust.json.gz') !== -1, 'theirs panel present');
  const farProof = gitShow(FAR, 'scripts/balance-proof.json');
  T.ok('far-end balance-proof.json points at the r167-adopt panel corpus',
    farProof.indexOf('evidence/2026-11-10/neutral-r167-adopt.json.gz') !== -1, 'ours panel present');
  T.ok('far-end balance-proof.json does NOT carry the person-trust pointer',
    farProof.indexOf('neutral-person-trust') === -1, '(absent)');
  const mergeGreen = gitShow(MERGE, 'scripts/green-list.txt').split('\n');
  const farGreen = gitShow(FAR, 'scripts/green-list.txt').split('\n');
  T.ok('the theirs green-list line is present in the merge file',
    mergeGreen.indexOf('scripts/test-person-trust-20261108.js quick') !== -1, 'theirs line present');
  T.ok('the theirs green-list line is NOT in the far-end file',
    farGreen.indexOf('scripts/test-person-trust-20261108.js quick') === -1, '(absent)');
  T.ok('the ours green-list pellet lines ARE in the far-end file',
    farGreen.indexOf('scripts/test-pellet-boost-20261108.js quick') !== -1 &&
    farGreen.indexOf('scripts/test-pellet-q4-20261108.js quick') !== -1, '2/2 ours lines present');

  // ---- 3. Readers + tooling-only analysis ----
  T.section('3. Readers — both conflicts confined to zero-src-reader tooling files');
  const checkJs = fs.readFileSync(path.join(REPO, 'scripts', 'check.js'), 'utf8');
  T.ok('scripts/check.js reads green-list.txt (readList)', checkJs.indexOf("readList('scripts/green-list.txt')") !== -1, 'readList present');
  let srcReadersGreen = [];
  try {
    srcReadersGreen = execSync('git grep -l "green-list" ' + git('rev-parse HEAD') + ' -- src/', { cwd: REPO, stdio: 'pipe' }).toString().trim().split('\n').filter(Boolean);
  } catch (e) { srcReadersGreen = []; }
  T.ok('zero green-list references under src/ (no game-code reader)', srcReadersGreen.length === 0, srcReadersGreen.join(', ') || '(none)');
  let srcReadersProof = [];
  try {
    srcReadersProof = execSync('git grep -l "balance-proof" ' + git('rev-parse HEAD') + ' -- src/', { cwd: REPO, stdio: 'pipe' }).toString().trim().split('\n').filter(Boolean);
  } catch (e) { srcReadersProof = []; }
  T.ok('zero balance-proof references under src/ (no game-code reader)', srcReadersProof.length === 0, srcReadersProof.join(', ') || '(none)');
  const proofUpdate = fs.readFileSync(path.join(REPO, 'scripts', 'balance-proof-update.js'), 'utf8');
  T.ok('balance-proof.json IS named by measurement tooling (positive control: balance-proof-update.js)',
    proofUpdate.indexOf('balance-proof') !== -1, 'tooling reader present');
  T.ok('conflictStopVerdict: both tooling conflicts -> UNMEASURED on this arm (no carve-out)',
    conflictStopVerdict(['scripts/balance-proof.json', 'scripts/green-list.txt']) === 'UNMEASURED', 'UNMEASURED');
  T.ok('conflictStopVerdict: green-list-only ALSO -> UNMEASURED on this arm (narrowed-tooling rule does NOT apply)',
    conflictStopVerdict(['scripts/green-list.txt']) === 'UNMEASURED', conflictStopVerdict(['scripts/green-list.txt']));
  const evPath = path.join(REPO, 'evidence', '2026-11-13', 'sim-transplant10.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('evidence file records that the narrowed-tooling rule does NOT apply', ev.indexOf('does NOT apply') !== -1, 'rule note present');
  T.ok('evidence file records that the conflicts ARE confined to zero-src-reader tooling files',
    ev.indexOf('ARE confined to zero-src-reader tooling') !== -1, 'tooling-only analysis present');
  T.ok('evidence file names a narrowed 10b as a coordinator decision, not this arm\'s call',
    ev.indexOf('narrowed 10b') !== -1 && ev.indexOf('coordinator decision') !== -1, '10b note present');

  // ---- 4. Verdict mapping ----
  T.section('4. Verdict mapping — transplant thresholds + conflict-STOP rule');
  const table = [[0, 'CARRIER'], [1, 'CARRIER'], [2, 'AMBIGUOUS'], [3, 'NOT-CARRIER'], [4, 'NOT-CARRIER'], [8, 'NOT-CARRIER'], [-1, 'UNCLASSIFIABLE'], [9, 'UNCLASSIFIABLE'], [NaN, 'UNCLASSIFIABLE']];
  for (const pair of table) {
    T.ok('survived ' + pair[0] + ' -> ' + pair[1], classifyTransplant(pair[0]) === pair[1], classifyTransplant(pair[0]));
  }
  T.ok('conflict rule: no conflict -> MEASURABLE', conflictStopVerdict([]) === 'MEASURABLE', conflictStopVerdict([]));
  T.ok('conflict rule: any single conflict -> UNMEASURED', conflictStopVerdict(['scripts/green-list.txt']) === 'UNMEASURED', conflictStopVerdict(['scripts/green-list.txt']));
  T.ok('conflict rule: non-array input -> UNCLASSIFIABLE', conflictStopVerdict(null) === 'UNCLASSIFIABLE', conflictStopVerdict(null));

  // ---- 5. Base state ----
  T.section('5. Base state — arm branch (worktree-only leg), clean tree, no swap residue');
  const headBranch = git('rev-parse --abbrev-ref HEAD');
  if (headBranch === 'sim-transplant10') {
    T.ok('HEAD is on the arm branch sim-transplant10 (worktree-only leg)', true, 'HEAD=' + headBranch);
  } else {
    // WORKTREE-ONLY leg: on the merged tip the arm branch is deleted
    // by design, so the leg asserts the merged-tip replacement
    // instead — this test file is tracked at HEAD and the subject
    // branch (kept) still points at the far end. This keeps the
    // proof green on master (cf. round-0215 proof-on-master note).
    const tracked = git('ls-tree HEAD -- scripts/test-transplant10.js');
    T.ok('HEAD is on the merged tip, not the arm branch (worktree-only leg: merged-tip replacement)',
      tracked.indexOf('test-transplant10.js') !== -1, 'HEAD=' + headBranch + ' — arm branch deleted on merge by design');
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

  // ---- 6. Seed-band identity ----
  T.section('6. Seed-band identity');
  const stepSrc = fs.readFileSync(path.join(REPO, 'scripts', 'culpritbisect-step.sh'), 'utf8');
  T.ok('step script names the band 190391..190398',
    stepSrc.indexOf('190391,190392,190393,190394,190395,190396,190397,190398') !== -1, 'band literal present');
  T.ok('evidence prereg names the same band', ev.indexOf('190391') !== -1 && ev.indexOf('190398') !== -1, 'band in prereg');
  T.ok('evidence prereg names the STEP id t10-fbb9c53ed', ev.indexOf('t10-fbb9c53ed') !== -1, 'STEP id present');

  // ---- 7. Live conflict record ----
  T.section('7. Live conflict record — two unmerged paths, no subject commit');
  let subject = null;
  try { subject = git('rev-parse ' + SUBJECT_BRANCH); } catch (e) { subject = null; }
  T.ok('subject branch exists', subject !== null && subject.length === 40, subject ? subject.slice(0, 12) : '(missing)');
  if (subject) {
    T.ok('subject branch points at the far end (no subject commit)', subject === FAR_FULL, subject.slice(0, 12));
  }
  T.ok('evidence file records the verdict as UNMEASURED', ev.indexOf('UNMEASURED') !== -1, 'UNMEASURED present');
  T.ok('evidence file records TWO unmerged paths', ev.indexOf('TWO unmerged paths') !== -1, 'two paths named');
  T.ok('evidence file records the balance-proof conflict (UU, panel pair)',
    ev.indexOf('UU `scripts/balance-proof.json`') !== -1 && ev.indexOf('neutral-person-trust.json.gz') !== -1, 'balance-proof conflict present');
  T.ok('evidence file records the green-list conflict (UU, pellet vs person-trust lines)',
    ev.indexOf('UU `scripts/green-list.txt`') !== -1 && ev.indexOf('test-pellet-boost-20261108.js') !== -1, 'green-list conflict present');
  T.ok('evidence file records the balance-proof marker lines (3, 6, 9)',
    ev.indexOf('3, 6, 9') !== -1, 'marker lines present');
  T.ok('evidence file records the green-list marker lines (916, 919, 921)',
    ev.indexOf('916, 919, 921') !== -1, 'marker lines present');
  T.ok('evidence file records the balance-proof stage blobs',
    ev.indexOf('6dd3a0ab2771d56fcbc68d298d8764736641fe75') !== -1 &&
    ev.indexOf('d0c6a42ff2395a49672f235f0218a3f969619dee') !== -1 &&
    ev.indexOf('16071b27be169b692892158381462e41cca37bd8') !== -1, 'stage blobs present');
  T.ok('evidence file records the green-list stage blobs',
    ev.indexOf('9576711dd5f5c521e5189b62cb5b7765df6d817e') !== -1 &&
    ev.indexOf('410eccee8b091c9c5cc16b1931d98822f81fa601') !== -1 &&
    ev.indexOf('ba5d513845672aac97b038cdc40d6dccd16f6f7c') !== -1, 'stage blobs present');
  T.ok('evidence file records the cherry-pick abort and the tree verified clean',
    ev.indexOf('cherry-pick --abort') !== -1 && ev.indexOf('verified clean') !== -1, 'abort + clean recorded');
  T.ok('evidence file records this as the SEVENTH family to stop on divergence',
    ev.indexOf('SEVENTH family') !== -1, 'seventh recorded');
  T.ok('evidence file records NO src/js conflict and NO DU',
    ev.indexOf('No src/js conflict, no DU') !== -1, 'clean-staging note present');

  // ---- 8. No corpus ----
  T.section('8. No corpus — no judged sim ran');
  const sumPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  const logPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  const corpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  T.ok('no step summary exists for t10-fbb9c53ed', !fs.existsSync(sumPath), 'absent');
  T.ok('no driver log exists for t10-fbb9c53ed', !fs.existsSync(logPath), 'absent');
  T.ok('no per-seed corpus exists for t10-fbb9c53ed', !fs.existsSync(corpusDir), 'absent');

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
