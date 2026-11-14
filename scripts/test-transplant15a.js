#!/usr/bin/env node
// test-transplant15a.js — proof test for the H1 TRANSPLANT, family
// 15A (dawn scorer / convo wants, arm sim-transplant15a-a).
//
// THE QUESTION (evidence/2026-11-14/sim-transplant15a-prereg.md,
// prereg committed before the subject was cut or any judged sim
// ran): land origin family 15A onto the far end 203a32775 (GOOD
// 4/8) — three standalone first-parent commits in origin order:
// c937de65f OVE-48 (convoSelectWant reads dawn commitment and top
// drive), 4594de6b5 OVE-50 (unify favor-need selection and liveness
// thresholds), 748cce3b8 OVE-51 (bond/link raises as scored dawn
// candidates). Grouping prereg:
// hidden_files/family15-grouping-prereg-2026-11-14.md §15A. Binding
// prereg: sim-scale-onramp-round-2115.md §3.
//
// THE OUTCOME: the STOP clause fired at pick 1. The merge-tree
// pre-check predicted a conflict confined to scripts/green-list.txt
// (tooling-only), and the live cherry-pick on a throwaway scaffold
// branch reproduced it exactly (UU scripts/green-list.txt, markers
// lines 803-809, one hunk). Per the binding STOP clause this arm
// STOPPED: no subject branch was cut, no judged sim ran, no verdict
// (CARRIER/AMBIGUOUS/NOT-CARRIER) exists for this group. Outcome:
// UNMEASURED-BY-CONFLICT. The coordinator decides the narrowed
// route; this arm decides none of it.
//
// WHAT THIS TEST PROVES:
//   1. Family 15A identity — all three picks (hashes, subjects,
//      first parents, exact numstats, no standing.js, no policy
//      file), in first-parent origin order.
//   2. Merge-tree pre-check — pick 1 rc=1, conflicted files
//      EXACTLY [scripts/green-list.txt]; no src/js conflict.
//   3. Conflict mechanism — the three context lines present at
//      the pick's first parent and absent at the far end; the
//      pick's own green-list diff is +1 line.
//   4. Family content — dawn-priority + favor-gate + bond/link
//      markers present; no damage/armor/spawn/food-yield/spoilage/
//      wave/table-gate numbers changed (kcal reads believed pantry
//      as a threshold input; build_standing is a drive label and
//      scoring weight, not a changed gate).
//   5. Verdict mapping — classifyTransplant maps every survived
//      count; conflictStop maps any conflicted file to
//      'UNMEASURED' and an empty set to 'NO-CONFLICT'.
//   6. Prereg recorded in the evidence file (base, picks, seeds,
//      horizon, policy, STEP id, thresholds, STOP clause, subject
//      branch name, merge-tree prediction, live-confirmation note,
//      ordering note).
//   7. Base state — HEAD is on sim-transplant15a-a, no src/js file
//      differs from HEAD, on-disk standing.js is byte-identical
//      to HEAD, the step-script tooling source (master) still
//      carries all four scratch files; the step script names the
//      band 190391-190398.
//   8. STOP outcome — no subject branch exists, no STEP t15a-dawn
//      summary/driver log/corpus exists, no cherry-pick is in
//      progress, the scaffold branch is deleted, the evidence file
//      records UNMEASURED-BY-CONFLICT with the exact conflict
//      list, and the prereg commit is an ancestor of HEAD
//      (resolved by message, not hash).
//
// Usage: node scripts/test-transplant15a.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant15a');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const PICK1 = 'c937de65f32d26e064d8935dd984490b2ee50a6c';
const FIRST1 = '1e03b3d69480e2d57c08bd2629aeffdeee4e6f32';
const PICK2 = '4594de6b528e40872c356f1d465762581ce06cd1';
const FIRST2 = '9bc88d85d7ee4c2f6d3c4c0715315f24b628e449';
const PICK3 = '748cce3b8bf9ecbad3b7a73b1d0c7dc555a898e6';
const FIRST3 = '49341fd7824023543b13dca40831d704d49e4637';
const MERGEBASE = 'd229b58f595430e2a24c399820061b39c5b689ca';
const SUBJECT_BRANCH = 'transplant-15a-subject';
const SCAFFOLD_BRANCH = 'tmp-15a-predict';
const STEP = 't15a-dawn';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
// Merge-tree prediction for pick 1 (rc=1, conflicted green-list.txt only).
const MT1_TREE = '77512a52b7c7537d28d07e193c10cf0799c3b442';

function sha256(text) { return crypto.createHash('sha256').update(text).digest('hex'); }
function git(args) {
  return execSync('git ' + args, { cwd: REPO, stdio: 'pipe' }).toString().trim();
}
function gitShow(commit, file) {
  return execSync('git show ' + commit + ':' + file, { cwd: REPO, stdio: 'pipe' }).toString();
}
function grepCount(commit, pattern, file) {
  try {
    const out = git('grep -c ' + pattern + ' ' + commit + ' -- ' + file);
    return parseInt(out.split(':').pop(), 10);
  } catch (e) { return 0; }
}
function classifyTransplant(n) {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 8) return 'UNCLASSIFIABLE';
  if (n <= 1) return 'CARRIER';
  if (n === 2) return 'AMBIGUOUS';
  return 'NOT-CARRIER';
}
// conflictStop(files): the binding conflict rule — ANY conflicted
// file STOPs the arm (no hand-resolution of game code, no narrowed
// re-run by the arm). Only an empty set proceeds.
function conflictStop(files) {
  if (!Array.isArray(files)) return 'UNCLASSIFIABLE';
  if (files.length === 0) return 'NO-CONFLICT';
  return 'UNMEASURED';
}
// mergeTree(base, ours, theirs): run `git merge-tree --write-tree
// --merge-base=<base> <ours> <theirs>` (read-only dry run — touches
// no worktree) and return { rc, tree, conflicted: [paths], raw }.
function mergeTree(base, ours, theirs) {
  let rc = 0;
  let out = '';
  try {
    out = execSync('git merge-tree --write-tree --merge-base=' + base + ' ' + ours + ' ' + theirs,
      { cwd: REPO, stdio: 'pipe', maxBuffer: 512 * 1024 * 1024 }).toString('utf8');
  } catch (e) {
    rc = e.status || 1;
    out = (e.stdout || Buffer.alloc(0)).toString('utf8');
  }
  const lines = out.split('\n');
  const tree = (lines[0] || '').trim();
  const conflicted = [];
  for (const ln of lines) {
    const m = ln.match(/^\d{6} [0-9a-f]{40} [123]\t(.+)$/);
    if (m && conflicted.indexOf(m[1]) === -1) conflicted.push(m[1]);
  }
  return { rc: rc, tree: tree, conflicted: conflicted.sort(), raw: out };
}

(async () => {
  // ---- 1. Family 15A identity ----
  T.section('1. Family 15A identity — three standalone first-parent commits, origin order');
  const picks = [
    { sha: PICK1, first: FIRST1, subject: 'OVE-48: convoSelectWant reads dawn commitment and top drive', js: ['src/js/convo-wants.js'], jsStat: '111\t1\tsrc/js/convo-wants.js', test: 'scripts/test-convo-dawn-priorities.js', testStat: '206\t0\tscripts/test-convo-dawn-priorities.js' },
    { sha: PICK2, first: FIRST2, subject: 'OVE-50: unify favor-need selection and liveness thresholds', js: ['src/js/convo-wants.js'], jsStat: '171\t43\tsrc/js/convo-wants.js', test: 'scripts/test-favor-need-threshold-unify.js', testStat: '171\t0\tscripts/test-favor-need-threshold-unify.js' },
    { sha: PICK3, first: FIRST3, subject: 'OVE-51: bond/link raises as scored dawn candidates', js: ['src/js/bond-initiation.js', 'src/js/villager-brain.js'], jsStat: null, test: 'scripts/test-bond-dawn-candidates.js', testStat: '264\t0\tscripts/test-bond-dawn-candidates.js' },
  ];
  for (const p of picks) {
    const short = p.sha.slice(0, 9);
    T.ok('pick ' + short + ' exists', git('rev-parse ' + p.sha).length === 40, git('log -1 --format=%s ' + p.sha).slice(0, 80));
    T.ok('pick ' + short + ' subject is "' + p.subject + '"', git('log -1 --format=%s ' + p.sha) === p.subject, git('log -1 --format=%s ' + p.sha).slice(0, 80));
    T.ok('pick ' + short + ' first parent is ' + p.first.slice(0, 9), git('rev-parse ' + p.sha + '^1') === p.first, git('log -1 --format=%h\\ %s ' + p.sha + '^1').slice(0, 80));
    const parents = git('show -s --format=%P ' + p.sha).split(' ').filter(Boolean);
    T.ok('pick ' + short + ' has exactly 1 parent (standalone, not a merge)', parents.length === 1, 'parents=' + parents.length);
    const jsFiles = git('diff --name-only ' + p.sha + '^1 ' + p.sha + ' -- src/js').split('\n').sort();
    T.ok('pick ' + short + ' touches exactly the expected src/js files', JSON.stringify(jsFiles) === JSON.stringify(p.js.slice().sort()), jsFiles.join(', '));
    if (p.jsStat) {
      const stat = git('diff --numstat ' + p.sha + '^1 ' + p.sha + ' -- ' + p.js[0]);
      T.ok('pick ' + short + ' ' + p.js[0] + ' is ' + p.jsStat.replace(/\t/g, '/'), stat === p.jsStat, stat);
    } else {
      const bondStat = git('diff --numstat ' + p.sha + '^1 ' + p.sha + ' -- src/js/bond-initiation.js');
      T.ok('pick ' + short + ' bond-initiation.js is +298/-69', bondStat === '298\t69\tsrc/js/bond-initiation.js', bondStat);
      const brainStat = git('diff --numstat ' + p.sha + '^1 ' + p.sha + ' -- src/js/villager-brain.js');
      T.ok('pick ' + short + ' villager-brain.js is +17/-4', brainStat === '17\t4\tsrc/js/villager-brain.js', brainStat);
    }
    const testStat = git('diff --numstat ' + p.sha + '^1 ' + p.sha + ' -- ' + p.test);
    T.ok('pick ' + short + ' test file is ' + p.testStat.replace(/\t/g, '/') + ' (new test)', testStat === p.testStat, testStat);
    T.ok('pick ' + short + ' does not touch standing.js', git('diff --name-only ' + p.sha + '^1 ' + p.sha + ' -- src/js/standing.js') === '', '(absent)');
    const polFiles = git('diff --name-only ' + p.sha + '^1 ' + p.sha + ' -- scripts/policies');
    T.ok('pick ' + short + ' touches no policy file', polFiles === '', polFiles || '(none)');
    const greenStat = git('diff --numstat ' + p.sha + '^1 ' + p.sha + ' -- scripts/green-list.txt');
    T.ok('pick ' + short + ' green-list.txt is +1/-0', greenStat === '1\t0\tscripts/green-list.txt', greenStat);
  }
  // Origin order on the first-parent chain (full hashes: %h
  // abbreviates to 9 chars in this repo, so 7-char prefixes miss).
  const fpOrder = git('log --first-parent --reverse --format=%H ' + MERGEBASE + '..a628aeaf3').split('\n');
  const idx1 = fpOrder.indexOf(PICK1);
  const idx2 = fpOrder.indexOf(PICK2);
  const idx3 = fpOrder.indexOf(PICK3);
  T.ok('all three picks are on the first-parent chain d229b58f5..a628aeaf3', idx1 !== -1 && idx2 !== -1 && idx3 !== -1, 'idx=' + idx1 + '/' + idx2 + '/' + idx3);
  T.ok('pick order is origin order (c937de65f before 4594de6b5 before 748cce3b8)', idx1 < idx2 && idx2 < idx3, idx1 + ' < ' + idx2 + ' < ' + idx3);
  const idx55 = fpOrder.indexOf(git('rev-parse a1567198c'));
  T.ok('OVE-55 (a1567198c, "screen on tip 748cce3b8") comes after 748cce3b8 on the chain, confirming 748cce3b8 closes the group',
    idx55 > idx3, 'idx55=' + idx55 + ' > idx3=' + idx3);
  const farStanding = sha256(gitShow(FAR, 'src/js/standing.js'));
  T.ok('far-end native standing.js sha is 75762cb2...', farStanding.startsWith('75762cb2'), farStanding.slice(0, 12));
  T.ok('fix standing.js sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  const farPolicy = sha256(gitShow(FAR, 'scripts/policies/competent.js'));
  T.ok('far-end policy sha is a7ff5c51...', farPolicy.startsWith('a7ff5c51'), farPolicy.slice(0, 12));

  // ---- 2. Merge-tree pre-check — pick 1 conflicts, tooling-only ----
  T.section('2. Merge-tree pre-check — pick 1 CONFLICTS, confined to scripts/green-list.txt');
  const mt1 = mergeTree(FIRST1, FAR, PICK1);
  T.ok('pick 1 merge-tree rc=1 (conflict)', mt1.rc === 1, 'rc=' + mt1.rc);
  T.ok('pick 1 merge-tree tree is 77512a52…', mt1.tree === MT1_TREE, mt1.tree.slice(0, 12));
  T.ok('pick 1 merge-tree conflicts EXACTLY [scripts/green-list.txt]',
    JSON.stringify(mt1.conflicted) === JSON.stringify(['scripts/green-list.txt']), mt1.conflicted.join(', '));
  T.ok('pick 1 merge-tree conflicts NO src/js file',
    mt1.conflicted.every(function (f) { return f.indexOf('src/js/') !== 0; }), 'no src/js conflict');
  T.ok('pick 1 merge-tree conflicts NO docs file',
    mt1.conflicted.every(function (f) { return f.indexOf('docs/') !== 0; }), 'no docs conflict');
  T.ok('pick 1 merge-tree reports the green-list stage lines (1/2/3)',
    /^\d{6} [0-9a-f]{40} 1\tscripts\/green-list\.txt$/m.test(mt1.raw) &&
    /^\d{6} [0-9a-f]{40} 2\tscripts\/green-list\.txt$/m.test(mt1.raw) &&
    /^\d{6} [0-9a-f]{40} 3\tscripts\/green-list\.txt$/m.test(mt1.raw), 'stages 1/2/3 present');
  T.ok('conflictStop maps the pick-1 conflict set to UNMEASURED', conflictStop(mt1.conflicted) === 'UNMEASURED', conflictStop(mt1.conflicted));

  // ---- 3. Conflict mechanism ----
  T.section('3. Conflict mechanism — three context lines the far end lacks, pick adds a fourth adjacent line');
  const ctxLines = ['test-villager-brain-dawn.js', 'test-dawn-materialize-honesty.js', 'test-dawn-midday-repick.js'];
  for (const f of ctxLines) {
    T.ok('pick-1 first parent lists ' + f + ' in green-list.txt (1 hit)', grepCount(FIRST1, f, 'scripts/green-list.txt') === 1, 'parent=1');
    T.ok('far end lists ' + f + ' NOWHERE in green-list.txt (0 hits)', grepCount(FAR, f, 'scripts/green-list.txt') === 0, 'far=0');
  }
  T.ok('pick-1 first parent does NOT list test-convo-dawn-priorities.js (the pick adds it)',
    grepCount(FIRST1, 'test-convo-dawn-priorities.js', 'scripts/green-list.txt') === 0, 'parent=0');
  T.ok('far end does NOT list test-convo-dawn-priorities.js either',
    grepCount(FAR, 'test-convo-dawn-priorities.js', 'scripts/green-list.txt') === 0, 'far=0');
  T.ok('pick-1 green-list diff is exactly +1 line (test-convo-dawn-priorities.js)',
    git('diff ' + PICK1 + '^1 ' + PICK1 + ' -- scripts/green-list.txt').indexOf('+scripts/test-convo-dawn-priorities.js quick') !== -1 &&
    (git('diff ' + PICK1 + '^1 ' + PICK1 + ' -- scripts/green-list.txt').match(/^\+[^+]/gm) || []).length === 1, 'one added line');
  T.ok('pick-1 inserts its green-list line between test-villager-brain-dawn.js and test-dawn-materialize-honesty.js (both lines the far end lacks)',
    git('diff ' + PICK1 + '^1 ' + PICK1 + ' -- scripts/green-list.txt').indexOf(' scripts/test-villager-brain-dawn.js quick\n+scripts/test-convo-dawn-priorities.js quick\n scripts/test-dawn-materialize-honesty.js quick') !== -1, 'insertion point between the two missing-context lines');

  // ---- 4. Family content ----
  T.section('4. Family content — dawn coherence, no lever numbers changed');
  const conv1 = gitShow(PICK1, 'src/js/convo-wants.js');
  T.ok('pick 1 adds convoDawnPriorities (dawn commitment + top drive read)',
    conv1.indexOf('convoDawnPriorities') !== -1, 'convoDawnPriorities present');
  T.ok('pick 1 adds DAWN_KIND_WANTS / DAWN_DRIVE_WANTS with a 2.0 primary bias',
    conv1.indexOf('DAWN_KIND_WANTS') !== -1 && conv1.indexOf('DAWN_DRIVE_WANTS') !== -1 && conv1.indexOf('DAWN_BIAS_PRIMARY = 2.0') !== -1, 'bias tables present');
  const conv2 = gitShow(PICK2, 'src/js/convo-wants.js');
  T.ok('pick 2 adds the shared FAVOR_NEED_GATE vocabulary',
    conv2.indexOf('FAVOR_NEED_GATE') !== -1, 'FAVOR_NEED_GATE present');
  T.ok('pick 2 reads believed pantry kcal as a threshold input (pantryKcal / pantryKcalLive)',
    conv2.indexOf('pantryKcal') !== -1, 'pantryKcal read present');
  const bond3 = gitShow(PICK3, 'src/js/bond-initiation.js');
  T.ok('pick 3 raises PROPOSE_BOND / RAISE_LINK as scored dawn candidates',
    bond3.indexOf('PROPOSE_BOND') !== -1 && bond3.indexOf('RAISE_LINK') !== -1, 'bond/link candidates present');
  T.ok('pick 3 scores build_standing drive weights (1.2 + min(1.5, weight))',
    bond3.indexOf('build_standing') !== -1 && bond3.indexOf('Math.min(1.5') !== -1, 'build_standing weights present');
  for (const pair of [[PICK1, 'pick 1'], [PICK2, 'pick 2'], [PICK3, 'pick 3']]) {
    const diffJs = execSync('git diff ' + pair[0] + '^1 ' + pair[0] + ' -- src/js', { cwd: REPO, stdio: 'pipe' }).toString('utf8');
    T.ok(pair[1] + ' diff changes no damage/armor/spawn/food-yield/spoilage identifier',
      ['damage', 'armor', 'spawnMonster', 'foodYield', 'spoilage'].every(function (w) { return diffJs.indexOf(w) === -1; }), 'no lever identifiers');
    T.ok(pair[1] + ' diff changes no wave/table gate (no wave5, deedGate, table-price hunk)',
      diffJs.indexOf('wave5') === -1 && diffJs.indexOf('deedGate') === -1, 'no gate identifiers');
  }

  // ---- 5. Verdict mapping ----
  T.section('5. Verdict mapping — group thresholds + conflict rule');
  const table = [[0, 'CARRIER'], [1, 'CARRIER'], [2, 'AMBIGUOUS'], [3, 'NOT-CARRIER'], [4, 'NOT-CARRIER'], [8, 'NOT-CARRIER'], [-1, 'UNCLASSIFIABLE'], [9, 'UNCLASSIFIABLE'], [NaN, 'UNCLASSIFIABLE']];
  for (const pair of table) {
    T.ok('survived ' + pair[0] + ' -> ' + pair[1], classifyTransplant(pair[0]) === pair[1], classifyTransplant(pair[0]));
  }
  T.ok('conflict rule: no conflict -> NO-CONFLICT', conflictStop([]) === 'NO-CONFLICT', conflictStop([]));
  T.ok('conflict rule: one src/js file -> UNMEASURED', conflictStop(['src/js/convo-wants.js']) === 'UNMEASURED', conflictStop(['src/js/convo-wants.js']));
  T.ok('conflict rule: one tooling file -> UNMEASURED (no narrowed re-run by this arm)',
    conflictStop(['scripts/green-list.txt']) === 'UNMEASURED', conflictStop(['scripts/green-list.txt']));
  T.ok('conflict rule: UU convo-wants.js + DU test file -> UNMEASURED',
    conflictStop(['src/js/convo-wants.js', 'scripts/test-convo-dawn-priorities.js']) === 'UNMEASURED', conflictStop(['src/js/convo-wants.js', 'scripts/test-convo-dawn-priorities.js']));

  // ---- 6. Prereg recorded in the evidence file ----
  T.section('6. Prereg recorded in the evidence file');
  const evPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15a-prereg.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('prereg file exists', ev.length > 0, evPath);
  T.ok('prereg names pick c937de65f (OVE-48)', ev.indexOf('c937de65f') !== -1, 'pick 1 present');
  T.ok('prereg names pick 4594de6b5 (OVE-50)', ev.indexOf('4594de6b5') !== -1, 'pick 2 present');
  T.ok('prereg names pick 748cce3b8 (OVE-51)', ev.indexOf('748cce3b8') !== -1, 'pick 3 present');
  T.ok('prereg names the far end 203a32775', ev.indexOf('203a32775') !== -1, 'far end present');
  T.ok('prereg names the band 190391-190398', ev.indexOf('190391') !== -1 && ev.indexOf('190398') !== -1, 'band present');
  T.ok('prereg names the STEP id t15a-dawn', ev.indexOf('t15a-dawn') !== -1, 'STEP present');
  T.ok('prereg records the STOP clause', ev.indexOf('STOP clause') !== -1, 'STOP clause present');
  T.ok('prereg records the thresholds (CARRIER <=1/8, AMBIGUOUS 2/8, NOT-CARRIER >=3/8)',
    ev.indexOf('CARRIER') !== -1 && ev.indexOf('AMBIGUOUS') !== -1 && ev.indexOf('NOT-CARRIER') !== -1, 'thresholds present');
  T.ok('prereg records the subject branch name transplant-15a-subject', ev.indexOf('transplant-15a-subject') !== -1, 'subject branch present');
  T.ok('prereg records the pick-1 merge-tree prediction (rc=1, green-list.txt only)',
    ev.indexOf('77512a52') !== -1 && ev.indexOf('scripts/green-list.txt') !== -1, 'prediction present');
  T.ok('prereg records the live scaffold confirmation (UU, lines 803-809)',
    ev.indexOf('tmp-15a-predict') !== -1 && ev.indexOf('803') !== -1, 'live confirmation present');
  T.ok('prereg records that picks 2/3 predictions were NOT run (sequence stops at pick 1)',
    ev.indexOf('PICKS 2 AND 3') !== -1, 'picks 2/3 note present');
  T.ok('prereg records the outcome as UNMEASURED-BY-CONFLICT', ev.indexOf('UNMEASURED-BY-CONFLICT') !== -1, 'outcome present');
  T.ok('prereg records the grouping authority (§15A)', ev.indexOf('family15-grouping-prereg-2026-11-14.md') !== -1, 'authority present');
  T.ok('prereg records the canon note (CONVERSATIONS.md; no standalone OVE-48/50/51 doc)',
    ev.indexOf('CONVERSATIONS.md') !== -1, 'canon note present');
  T.ok('prereg records the horizon 150d death-aware', ev.indexOf('150d') !== -1, 'horizon present');
  T.ok('prereg records the competent verbatim own-policy', ev.indexOf('competent') !== -1, 'policy present');
  T.ok('prereg records the ordering note (pre-check ran during prereg preparation, subject never cut)',
    ev.indexOf('Ordering note') !== -1, 'ordering note present');

  // ---- 7. Base state ----
  T.section('7. Base state — arm branch clean, subject not cut, sim not run');
  const headBranch = git('rev-parse --abbrev-ref HEAD');
  // worktreeOnly: branch-identity legs are meaningful only in the
  // worker tree. On merged master HEAD is 'master' by design (the
  // arm branch is deleted after landing) — the leg passes there
  // vacuously instead of failing, so the proof stays green on master
  // (0215Z lesson). Prereg-commit ancestry legs resolve by
  // message/subject, not hash (0608Z lesson: an adoption rebase
  // rewrites hashes).
  const worktreeOnly = function (cond) { return cond || headBranch === 'master'; };
  T.ok('HEAD is on the arm branch sim-transplant15a-a (worktree-only)', worktreeOnly(headBranch === 'sim-transplant15a-a'), 'HEAD=' + headBranch);
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
  T.ok('subject branch does NOT exist (never cut — STOP fired first)', subjectExists === false, SUBJECT_BRANCH + ' absent');
  let scaffoldExists = true;
  try { git('rev-parse ' + SCAFFOLD_BRANCH); } catch (e) { scaffoldExists = false; }
  T.ok('scaffold branch tmp-15a-predict does NOT exist (deleted after the live confirmation)', scaffoldExists === false, SCAFFOLD_BRANCH + ' absent');
  const t15aSummary = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  T.ok('no step summary exists for t15a-dawn (no judged sim ran)', fs.existsSync(t15aSummary) === false, STEP);
  const t15aDriver = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  T.ok('no step driver log exists for t15a-dawn (no judged sim ran)', fs.existsSync(t15aDriver) === false, STEP);
  const corpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  T.ok('no step corpus exists for t15a-dawn (no judged sim ran)', fs.existsSync(corpusDir) === false, STEP);

  // ---- 8. STOP outcome ----
  T.section('8. STOP outcome — conflict reported, nothing resolved, nothing measured');
  const ev15aPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15a.md');
  const ev15a = fs.existsSync(ev15aPath) ? fs.readFileSync(ev15aPath, 'utf8') : '';
  T.ok('evidence file exists', ev15a.length > 0, ev15aPath);
  T.ok('evidence file records the outcome as UNMEASURED-BY-CONFLICT', ev15a.indexOf('UNMEASURED-BY-CONFLICT') !== -1, 'outcome present');
  T.ok('evidence file records the exact conflict list (UU scripts/green-list.txt, lines 803-809)',
    ev15a.indexOf('UU scripts/green-list.txt') !== -1 && ev15a.indexOf('803') !== -1, 'conflict list present');
  T.ok('evidence file records that no subject branch was cut', ev15a.indexOf('never cut') !== -1 || ev15a.indexOf('NEVER cut') !== -1, 'no-subject note present');
  T.ok('evidence file records that no judged sim ran', ev15a.indexOf('No judged sim ran') !== -1 || ev15a.indexOf('no judged sim') !== -1, 'no-sim note present');
  T.ok('evidence file records the flap window (heartbeat EPERM retries, success 09:51:53Z)',
    ev15a.indexOf('HOST WRITE FLAP') !== -1 && ev15a.indexOf('09:51:53Z') !== -1, 'flap note present');
  T.ok('evidence file names the coordinator decision owed (narrowed route)', ev15a.indexOf('coordinator') !== -1, 'coordinator note present');
  // Prereg-commit ancestry by MESSAGE, not hash (0608Z lesson: an
  // adoption rebase rewrites hashes).
  const logSubjects = git('log --format=%s HEAD');
  T.ok('prereg commit is an ancestor of HEAD (resolved by message, not hash)',
    logSubjects.indexOf('sim-transplant15a-a: prereg + proof (STOP: green-list conflict at pick 1)') !== -1, 'prereg message present');
  // Base restored: back on the arm branch, clean, standing.js == HEAD.
  const headBranch2 = git('rev-parse --abbrev-ref HEAD');
  T.ok('HEAD is back on the arm branch sim-transplant15a-a after the pre-check (worktree-only)', worktreeOnly(headBranch2 === 'sim-transplant15a-a'), 'HEAD=' + headBranch2);
  const dirtyAfter = git('status --porcelain --untracked-files=no');
  // The only tracked modifications allowed here are this proof file
  // itself and the two evidence files (the STOP-outcome writes,
  // uncommitted until this proof passes). Standing/scratch/conflict
  // residue would show as any other line.
  const allowed = ['scripts/test-transplant15a.js', 'evidence/2026-11-14/sim-transplant15a-prereg.md', 'evidence/2026-11-14/sim-transplant15a.md'];
  const dirtyOther = dirtyAfter.split('\n').filter(function (ln) {
    return ln && !allowed.some(function (a) { return ln.indexOf(a) !== -1; });
  }).join('\n');
  T.ok('tracked tree is clean after the pre-check apart from this proof + the two evidence files', dirtyOther === '', dirtyOther.slice(0, 200) || '(only allowed files)');
  const onDiskStanding2 = sha256(fs.readFileSync(path.join(REPO, 'src', 'js', 'standing.js'), 'utf8'));
  const headStanding2 = sha256(gitShow('HEAD', 'src/js/standing.js'));
  T.ok('on-disk standing.js is byte-identical to HEAD (no swap ever happened)', onDiskStanding2 === headStanding2, onDiskStanding2.slice(0, 12));
  let cherryPickHead = true;
  try { execSync('git rev-parse --verify CHERRY_PICK_HEAD', { cwd: REPO, stdio: 'pipe' }); } catch (e) { cherryPickHead = false; }
  T.ok('no cherry-pick is in progress', cherryPickHead === false, 'CHERRY_PICK_HEAD absent');
  T.ok('no verdict (CARRIER/AMBIGUOUS/NOT-CARRIER) is claimed anywhere in the evidence file',
    ev15a.indexOf('VERDICT: CARRIER') === -1 && ev15a.indexOf('VERDICT: AMBIGUOUS') === -1 && ev15a.indexOf('VERDICT: NOT-CARRIER') === -1, 'no verdict claimed');

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
