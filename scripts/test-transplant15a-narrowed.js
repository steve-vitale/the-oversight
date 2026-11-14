#!/usr/bin/env node
// test-transplant15a-narrowed.js — proof test for the H1 TRANSPLANT,
// family 15A NARROWED (dawn scorer / convo wants, arm
// sim-transplant15a-narrowed-a).
//
// THE QUESTION (evidence/2026-11-14/sim-transplant15a-narrowed-prereg.md,
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
// THE NARROWED ROUTE: the first arm (sim-transplant15a-a) STOPPED
// at pick 1 on a tooling-only conflict (scripts/green-list.txt
// lines 803-809). The coordinator tooling-resolution rule (decided
// 2026-11-14 ~10:00Z, binding for this run's family-15 arms) says:
// a pick conflicting ONLY on zero-src-reader tooling files
// (scripts/green-list.txt, scripts/balance-proof.json,
// scripts/phone-frame-proof.json) resolves EACH such file with
// `git checkout --ours` (keep the far-end version byte-identical)
// and continues; ANY other conflicted file (any src/js, data,
// policy, docs, or test file) STOPS the arm immediately, no
// hand-resolution, no narrowed re-run decided by this arm.
//
// STAGE 1 (this file as committed with the prereg) proves:
//   1. Family 15A identity — all three picks (hashes, subjects,
//      first parents, exact numstats, no standing.js, no policy
//      file), in first-parent origin order.
//   2. Merge-tree pre-check — pick 1 rc=1, conflicted files
//      EXACTLY [scripts/green-list.txt] (tooling-only, resolve
//      --ours, continue); pick 2 rc=1, conflicted files EXACTLY
//      [scripts/green-list.txt, src/js/convo-wants.js] (game-code
//      included, STOP expected); pick-1-resolved tree equals the
//      pick-1 diff minus the green-list line; pick 3 prediction
//      not runnable (needs the pick-2-applied tree).
//   3. Conflict mechanism — pick 2's convo-wants.js hunk assumes
//      the believed-pantry code from 03436c1bc (family 15D),
//      ancestor of the pick-2 base but NOT of the far end; the
//      green-list adjacency class for both picks.
//   4. Family content — dawn-priority + favor-gate + bond/link
//      markers present; no damage/armor/spawn/food-yield/spoilage/
//      wave/table-gate numbers changed (kcal reads believed pantry
//      as a threshold input; build_standing is a drive label and
//      scoring weight, not a changed gate).
//   5. Verdict mapping + tooling-resolution rule —
//      classifyTransplant maps every survived count; resolveTooling
//      maps a tooling-only set to CONTINUE and any src/js (or
//      other non-tooling) file to UNMEASURED.
//   6. Prereg recorded in the evidence file (base, picks, seeds,
//      horizon, policy, STEP id, thresholds, STOP clause, tooling-
//      resolution rule, subject branch name, merge-tree predictions,
//      pick-2 mechanism, pick-3 not-runnable note, ordering note).
//   7. Base state — HEAD is on sim-transplant15a-narrowed-a, no
//      src/js file differs from HEAD, on-disk standing.js is
//      byte-identical to HEAD, the step-script tooling source
//      (master) still carries all four scratch files; the step
//      script names the band 190391-190398; no subject branch
//      exists; no STEP t15a-narrowed summary/driver log/corpus
//      exists; no cherry-pick is in progress.
// STAGE 2 (appended after the live picks) proves the live sequence:
//   8. Live pick 1 resolved the green-list conflict with
//      checkout --ours and its tree equals the predicted
//      pick-1-resolved tree; each resolved tooling file is
//      byte-identical to the far end; the subject's game-code diff
//      equals the picks' diff exactly.
//   9. Live pick 2 outcome (conflict list, STOP if a src/js file
//      conflicted) and the evidence file records the verdict (or
//      UNMEASURED-BY-CONFLICT), the per-seed table, and the
//      telemetry refusal.
//
// Usage: node scripts/test-transplant15a-narrowed.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant15a-narrowed');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const PICK1 = 'c937de65f32d26e064d8935dd984490b2ee50a6c';
const FIRST1 = '1e03b3d69480e2d57c08bd2629aeffdeee4e6f32';
const PICK2 = '4594de6b528e40872c356f1d465762581ce06cd1';
const FIRST2 = '9bc88d85d7ee4c2f6d3c4c0715315f24b628e449';
const PICK3 = '748cce3b8bf9ecbad3b7a73b1d0c7dc555a898e6';
const FIRST3 = '49341fd7824023543b13dca40831d704d49e4637';
const MERGEBASE = 'd229b58f595430e2a24c399820061b39c5b689ca';
const BELIEVED_PANTRY = '03436c1bc';
const SUBJECT_BRANCH = 'transplant-15a-narrowed-subject';
const STEP = 't15a-narrowed';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
// Merge-tree predictions (rc=1 both picks).
const MT1_TREE = '77512a52b7c7537d28d07e193c10cf0799c3b442';
const MT2_TREE = 'ff493cec33720c28342cb3711e7fba3e9869a583';
// Predicted pick-1-resolved tree (temp-index build: far end +
// pick-1 diff minus green-list.txt) and its prediction commit.
const PRED1_TREE = '6d6216e3e414518d2c335829e130e65ec849941b';
const PRED1_COMMIT = '2a66d8023650403002cfd14671f4a10898ac2b95';
const TOOLING_FILES = ['scripts/green-list.txt', 'scripts/balance-proof.json', 'scripts/phone-frame-proof.json'];

function sha256(text) { return crypto.createHash('sha256').update(text).digest('hex'); }
function git(args) {
  return execSync('git ' + args, { cwd: REPO, stdio: 'pipe' }).toString().trim();
}
function gitShow(commit, file) {
  return execSync('git show ' + commit + ':' + file, { cwd: REPO, stdio: 'pipe' }).toString();
}
function grepCount(commit, pattern, file) {
  try {
    const out = git('grep -c \'' + pattern + '\' ' + commit + ' -- ' + file);
    return parseInt(out.split(':').pop(), 10);
  } catch (e) { return 0; }
}
function isAncestor(a, b) {
  try { execSync('git merge-base --is-ancestor ' + a + ' ' + b, { cwd: REPO, stdio: 'pipe' }); return true; }
  catch (e) { return false; }
}
function classifyTransplant(n) {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 8) return 'UNCLASSIFIABLE';
  if (n <= 1) return 'CARRIER';
  if (n === 2) return 'AMBIGUOUS';
  return 'NOT-CARRIER';
}
// resolveTooling(files): the coordinator tooling-resolution rule —
// a conflict set confined to zero-src-reader tooling files
// resolves with `git checkout --ours` and the pick continues; ANY
// other file STOPS the arm (UNMEASURED), no hand-resolution.
function resolveTooling(files) {
  if (!Array.isArray(files)) return 'UNCLASSIFIABLE';
  if (files.length === 0) return 'NO-CONFLICT';
  if (files.every(function (f) { return TOOLING_FILES.indexOf(f) !== -1; })) return 'CONTINUE-OURS';
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

  // ---- 2. Merge-tree pre-check ----
  T.section('2. Merge-tree pre-check — pick 1 tooling-only, pick 2 game-code included');
  const mt1 = mergeTree(FIRST1, FAR, PICK1);
  T.ok('pick 1 merge-tree rc=1 (conflict)', mt1.rc === 1, 'rc=' + mt1.rc);
  T.ok('pick 1 merge-tree tree is 77512a52…', mt1.tree === MT1_TREE, mt1.tree.slice(0, 12));
  T.ok('pick 1 merge-tree conflicts EXACTLY [scripts/green-list.txt]',
    JSON.stringify(mt1.conflicted) === JSON.stringify(['scripts/green-list.txt']), mt1.conflicted.join(', '));
  T.ok('pick 1 merge-tree conflicts NO src/js file',
    mt1.conflicted.every(function (f) { return f.indexOf('src/js/') !== 0; }), 'no src/js conflict');
  T.ok('tooling-resolution rule maps the pick-1 conflict set to CONTINUE-OURS',
    resolveTooling(mt1.conflicted) === 'CONTINUE-OURS', resolveTooling(mt1.conflicted));
  const pred1Numstat = git('diff --numstat ' + FAR + ' ' + PRED1_TREE);
  T.ok('predicted pick-1-resolved tree is 6d6216e3…', git('rev-parse ' + PRED1_TREE + '^{tree}') === PRED1_TREE, PRED1_TREE.slice(0, 12));
  T.ok('predicted pick-1-resolved tree diff vs far end is exactly pick 1 minus green-list (3 files, +320/-3)',
    pred1Numstat.split('\n').sort().join('\n') === ['3\t2\tdocs/ONTOLOGY.md', '206\t0\tscripts/test-convo-dawn-priorities.js', '111\t1\tsrc/js/convo-wants.js'].sort().join('\n'), pred1Numstat.replace(/\n/g, ' | '));
  T.ok('predicted pick-1-resolved tree keeps green-list.txt byte-identical to the far end',
    sha256(gitShow(PRED1_TREE, 'scripts/green-list.txt')) === sha256(gitShow(FAR, 'scripts/green-list.txt')), 'green-list == far end');
  T.ok('prediction commit 2a66d802 carries the predicted tree with parent = far end',
    git('rev-parse ' + PRED1_COMMIT + '^{tree}') === PRED1_TREE && git('rev-parse ' + PRED1_COMMIT + '^1') === git('rev-parse ' + FAR), 'tree+parent ok');
  const mt2 = mergeTree(FIRST2, PRED1_COMMIT, PICK2);
  T.ok('pick 2 merge-tree rc=1 (conflict)', mt2.rc === 1, 'rc=' + mt2.rc);
  T.ok('pick 2 merge-tree tree is ff493cec…', mt2.tree === MT2_TREE, mt2.tree.slice(0, 12));
  T.ok('pick 2 merge-tree conflicts EXACTLY [scripts/green-list.txt, src/js/convo-wants.js]',
    JSON.stringify(mt2.conflicted) === JSON.stringify(['scripts/green-list.txt', 'src/js/convo-wants.js']), mt2.conflicted.join(', '));
  T.ok('pick 2 merge-tree conflicts a src/js file (convo-wants.js)',
    mt2.conflicted.indexOf('src/js/convo-wants.js') !== -1, 'src/js conflict present');
  T.ok('tooling-resolution rule maps the pick-2 conflict set to UNMEASURED (STOP expected)',
    resolveTooling(mt2.conflicted) === 'UNMEASURED', resolveTooling(mt2.conflicted));
  T.ok('pick 3 prediction is NOT runnable (no pick-2-applied tree exists to build it on)',
    true, 'recorded in prereg; no pick-3 merge-tree is asserted');

  // ---- 3. Conflict mechanism ----
  T.section('3. Conflict mechanism — pick 2 assumes believed-pantry code the far end lacks');
  T.ok('03436c1bc (15D believed pantry) IS an ancestor of pick 2\'s first parent',
    isAncestor(BELIEVED_PANTRY, FIRST2), 'ancestor of 9bc88d85d');
  T.ok('03436c1bc (15D believed pantry) IS an ancestor of pick 1\'s first parent',
    isAncestor(BELIEVED_PANTRY, FIRST1), 'ancestor of 1e03b3d69');
  T.ok('03436c1bc (15D believed pantry) is NOT an ancestor of the far end',
    isAncestor(BELIEVED_PANTRY, FAR) === false, 'not ancestor of 203a32775');
  T.ok('"VILLAGER-BRAIN seam 4" has 0 hits at the far end', grepCount(FAR, 'VILLAGER-BRAIN seam 4', 'src/js/convo-wants.js') === 0, 'far=0');
  T.ok('"VILLAGER-BRAIN seam 4" has 1 hit at pick 2\'s first parent', grepCount(FIRST2, 'VILLAGER-BRAIN seam 4', 'src/js/convo-wants.js') === 1, 'base=1');
  T.ok('no intervening first-parent commit between pick 1 and pick 2\'s first parent touches convo-wants.js',
    git('log --oneline ' + PICK1 + '..' + FIRST2 + ' -- src/js/convo-wants.js') === '', 'no intervening convo-wants.js change');
  const mt2Merged = gitShow(MT2_TREE, 'src/js/convo-wants.js');
  T.ok('pick-2 merged tree carries conflict markers in convo-wants.js (one hunk, lines 1868/1876/1885)',
    mt2Merged.indexOf('<<<<<<<') !== -1 && mt2Merged.indexOf('=======') !== -1 && mt2Merged.indexOf('>>>>>>>') !== -1, 'markers present');
  T.ok('pick-2 conflict OURS side keeps the local direct-read scan (pantryKcalLive, rosterN * 4000)',
    mt2Merged.indexOf('pantryKcalLive') !== -1 && mt2Merged.indexOf('rosterN * 4000') !== -1, 'ours side = local scan');
  T.ok('pick-2 conflict THEIRS side is the believed-pantry rewrite (VILLAGER-BRAIN seam 4, shared gates)',
    mt2Merged.indexOf('VILLAGER-BRAIN seam 4') !== -1 && mt2Merged.indexOf('same shared gates as liveness') !== -1, 'theirs side = believed scan');
  const ctxLines = ['test-villager-brain-dawn.js', 'test-dawn-materialize-honesty.js', 'test-dawn-midday-repick.js'];
  for (const f of ctxLines) {
    T.ok('pick-1 first parent lists ' + f + ' in green-list.txt (1 hit)', grepCount(FIRST1, f, 'scripts/green-list.txt') === 1, 'parent=1');
    T.ok('far end lists ' + f + ' NOWHERE in green-list.txt (0 hits)', grepCount(FAR, f, 'scripts/green-list.txt') === 0, 'far=0');
  }
  T.ok('pick-2 green-list diff inserts test-favor-need-threshold-unify.js between pick 1\'s line and test-dawn-materialize-honesty.js',
    git('diff ' + PICK2 + '^1 ' + PICK2 + ' -- scripts/green-list.txt').indexOf(' scripts/test-convo-dawn-priorities.js quick\n+scripts/test-favor-need-threshold-unify.js quick\n scripts/test-dawn-materialize-honesty.js quick') !== -1, 'insertion point between pick-1 line and a line the far end lacks');
  T.ok('pick 3\'s first parent 49341fd78 IS a descendant of pick 2 (sequence dependency)',
    isAncestor(PICK2, FIRST3), 'pick2 ancestor of pick3-base');

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

  // ---- 5. Verdict mapping + tooling-resolution rule ----
  T.section('5. Verdict mapping — group thresholds + tooling-resolution rule');
  const table = [[0, 'CARRIER'], [1, 'CARRIER'], [2, 'AMBIGUOUS'], [3, 'NOT-CARRIER'], [4, 'NOT-CARRIER'], [8, 'NOT-CARRIER'], [-1, 'UNCLASSIFIABLE'], [9, 'UNCLASSIFIABLE'], [NaN, 'UNCLASSIFIABLE']];
  for (const pair of table) {
    T.ok('survived ' + pair[0] + ' -> ' + pair[1], classifyTransplant(pair[0]) === pair[1], classifyTransplant(pair[0]));
  }
  T.ok('resolution rule: no conflict -> NO-CONFLICT', resolveTooling([]) === 'NO-CONFLICT', resolveTooling([]));
  T.ok('resolution rule: green-list.txt only -> CONTINUE-OURS', resolveTooling(['scripts/green-list.txt']) === 'CONTINUE-OURS', resolveTooling(['scripts/green-list.txt']));
  T.ok('resolution rule: balance-proof.json + phone-frame-proof.json -> CONTINUE-OURS',
    resolveTooling(['scripts/balance-proof.json', 'scripts/phone-frame-proof.json']) === 'CONTINUE-OURS', resolveTooling(['scripts/balance-proof.json', 'scripts/phone-frame-proof.json']));
  T.ok('resolution rule: green-list.txt + convo-wants.js -> UNMEASURED (STOP)',
    resolveTooling(['scripts/green-list.txt', 'src/js/convo-wants.js']) === 'UNMEASURED', resolveTooling(['scripts/green-list.txt', 'src/js/convo-wants.js']));
  T.ok('resolution rule: one src/js file alone -> UNMEASURED',
    resolveTooling(['src/js/convo-wants.js']) === 'UNMEASURED', resolveTooling(['src/js/convo-wants.js']));
  T.ok('resolution rule: a docs file -> UNMEASURED',
    resolveTooling(['docs/ONTOLOGY.md']) === 'UNMEASURED', resolveTooling(['docs/ONTOLOGY.md']));
  T.ok('resolution rule: a test file -> UNMEASURED',
    resolveTooling(['scripts/test-convo-dawn-priorities.js']) === 'UNMEASURED', resolveTooling(['scripts/test-convo-dawn-priorities.js']));

  // ---- 6. Prereg recorded in the evidence file ----
  T.section('6. Prereg recorded in the evidence file');
  const evPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15a-narrowed-prereg.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('prereg file exists', ev.length > 0, evPath);
  T.ok('prereg names pick c937de65f (OVE-48)', ev.indexOf('c937de65f') !== -1, 'pick 1 present');
  T.ok('prereg names pick 4594de6b5 (OVE-50)', ev.indexOf('4594de6b5') !== -1, 'pick 2 present');
  T.ok('prereg names pick 748cce3b8 (OVE-51)', ev.indexOf('748cce3b8') !== -1, 'pick 3 present');
  T.ok('prereg names the far end 203a32775', ev.indexOf('203a32775') !== -1, 'far end present');
  T.ok('prereg names the band 190391-190398', ev.indexOf('190391') !== -1 && ev.indexOf('190398') !== -1, 'band present');
  T.ok('prereg names the STEP id t15a-narrowed', ev.indexOf('t15a-narrowed') !== -1, 'STEP present');
  T.ok('prereg names the fresh STEP id rule (do NOT reuse t15a-dawn)', ev.indexOf('t15a-dawn') !== -1, 'STEP freshness present');
  T.ok('prereg records the STOP clause', ev.indexOf('STOP clause') !== -1, 'STOP clause present');
  T.ok('prereg records the coordinator tooling-resolution rule (decided 2026-11-14 ~10:00Z)',
    ev.indexOf('TOOLING-RESOLUTION RULE') !== -1 && ev.indexOf('checkout --ours') !== -1, 'tooling rule present');
  T.ok('prereg records the thresholds (CARRIER <=1/8, AMBIGUOUS 2/8, NOT-CARRIER >=3/8)',
    ev.indexOf('CARRIER') !== -1 && ev.indexOf('AMBIGUOUS') !== -1 && ev.indexOf('NOT-CARRIER') !== -1, 'thresholds present');
  T.ok('prereg records the subject branch name transplant-15a-narrowed-subject', ev.indexOf('transplant-15a-narrowed-subject') !== -1, 'subject branch present');
  T.ok('prereg records the pick-1 merge-tree prediction (rc=1, tree 77512a52, green-list.txt only)',
    ev.indexOf('77512a52') !== -1 && ev.indexOf('scripts/green-list.txt') !== -1, 'pick-1 prediction present');
  T.ok('prereg records the predicted pick-1-resolved tree 6d6216e3…', ev.indexOf('6d6216e3') !== -1, 'pick-1-resolved tree present');
  T.ok('prereg records the pick-2 merge-tree prediction (rc=1, tree ff493cec, green-list + convo-wants.js)',
    ev.indexOf('ff493cec') !== -1 && ev.indexOf('src/js/convo-wants.js') !== -1, 'pick-2 prediction present');
  T.ok('prereg records the pick-2 mechanism (believed pantry 03436c1bc, seam 4, lines 1868-1885)',
    ev.indexOf('03436c1bc') !== -1 && ev.indexOf('1868') !== -1, 'pick-2 mechanism present');
  T.ok('prereg records that the pick-3 prediction is NOT runnable', ev.indexOf('NOT runnable') !== -1, 'pick-3 note present');
  T.ok('prereg records the grouping authority (§15A)', ev.indexOf('family15-grouping-prereg-2026-11-14.md') !== -1, 'authority present');
  T.ok('prereg records the first arm STOP (ae737133a) and that t15a-dawn is not reused',
    ev.indexOf('ae737133a') !== -1, 'first-arm note present');
  T.ok('prereg records the canon note (CONVERSATIONS.md; no standalone OVE-48/50/51 doc)',
    ev.indexOf('CONVERSATIONS.md') !== -1, 'canon note present');
  T.ok('prereg records the horizon 150d death-aware', ev.indexOf('150d') !== -1, 'horizon present');
  T.ok('prereg records the competent verbatim own-policy', ev.indexOf('competent') !== -1, 'policy present');
  T.ok('prereg records the ordering note (pre-check ran during prereg preparation, subject not yet cut)',
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
  T.ok('HEAD is on the arm branch sim-transplant15a-narrowed-a (worktree-only)', worktreeOnly(headBranch === 'sim-transplant15a-narrowed-a'), 'HEAD=' + headBranch);
  const dirtyJs = git('diff --name-only HEAD -- src/js');
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
  T.ok('subject branch does NOT exist yet (not cut — prereg stage)', subjectExists === false, SUBJECT_BRANCH + ' absent');
  const t15aSummary = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  T.ok('no step summary exists for t15a-narrowed (no judged sim ran)', fs.existsSync(t15aSummary) === false, STEP);
  const t15aDriver = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  T.ok('no step driver log exists for t15a-narrowed (no judged sim ran)', fs.existsSync(t15aDriver) === false, STEP);
  const corpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  T.ok('no step corpus exists for t15a-narrowed (no judged sim ran)', fs.existsSync(corpusDir) === false, STEP);
  let cherryPickHead = true;
  try { execSync('git rev-parse --verify CHERRY_PICK_HEAD', { cwd: REPO, stdio: 'pipe' }); } catch (e) { cherryPickHead = false; }
  T.ok('no cherry-pick is in progress', cherryPickHead === false, 'CHERRY_PICK_HEAD absent');
  const dirtyTracked = git('diff --name-only HEAD');
  const allowed = ['scripts/test-transplant15a-narrowed.js', 'evidence/2026-11-14/sim-transplant15a-narrowed-prereg.md'];
  const dirtyOther = dirtyTracked.split('\n').filter(function (ln) {
    return ln && !allowed.some(function (a) { return ln === a; });
  }).join('\n');
  T.ok('tracked tree is clean apart from this proof + the prereg (both uncommitted until this proof passes)', dirtyOther === '', dirtyOther.slice(0, 200) || '(only allowed files)');

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
