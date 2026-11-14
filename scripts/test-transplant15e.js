#!/usr/bin/env node
// test-transplant15e.js — proof test for the H1 TRANSPLANT,
// family 15E (resume / conversation repair, arm
// sim-transplant15e-a).
//
// THE QUESTION (evidence/2026-11-14/sim-transplant15e-prereg.md,
// prereg committed before the subject was cut or any judged sim
// ran): land origin family 15E onto the far end 203a32775 (GOOD
// 4/8) — three standalone first-parent commits in origin order:
// bb6a301cf (resume-offer Yes delivers the unfinished thread),
// 7041e1bfb OVE-33 (proof refresh + stage-direction quote check),
// 4a1c77cf1 OVE-57 (trader-intro deferral + rally-guard lottery
// skip). Grouping prereg:
// hidden_files/family15-grouping-prereg-2026-11-14.md §15E. Binding
// prereg: sim-scale-onramp-round-2115.md §3.
//
// CONFLICT RULE (coordinator tooling-resolution rule, decided
// 2026-11-14 ~10:00Z, binding for this run's family-15 arms): a
// pick conflicting ONLY on zero-src-reader tooling files
// (scripts/green-list.txt, scripts/balance-proof.json,
// scripts/phone-frame-proof.json) resolves EACH such file with
// `git checkout --ours` (keep the far-end version byte-identical)
// and continues; ANY other conflicted file (any src/js, data,
// policy, docs, or test file) STOPS the arm immediately, no
// hand-resolution, no narrowed re-run decided by this arm.
//
// STAGE 1 (this file as committed with the prereg) proves:
//   1. Family 15E identity — all three picks (hashes, subjects,
//      first parents, exact numstats, no standing.js, no policy
//      file), in first-parent origin order.
//   2. Merge-tree pre-check — pick 1 rc=0 CLEAN (tree f9e9b8b8,
//      prediction commit 19e50e1e); pick 2 rc=1, conflicted files
//      EXACTLY [scripts/balance-proof.json,
//      scripts/phone-frame-proof.json,
//      scripts/test-snippet-stage-direction.js,
//      src/js/conversation.js] (game-code included, STOP
//      expected); pick 3 prediction not runnable (needs the
//      pick-2-applied tree).
//   3. Conflict mechanism — pick 2's hunk lives inside
//      convoSnippetIsStageDirection, introduced by family 14
//      (PR #10 merge 7688cb7a4, pick 1's first parent), which is
//      an ancestor of pick 2's first parent but NOT of the far
//      end; the far end has 0 hits for the function; merged-tree
//      markers at conversation.js lines 1730/1731/1754 with an
//      EMPTY ours side; the test file conflicts modify/delete.
//   4. Family content — resumeOffer/resumeTid + STORY-OFFER
//      follow-through (pick 1); the OVE-33 quote check (pick 2);
//      tradeIntroDeferred + rally-volunteer (pick 3); no
//      damage/armor/spawn/food-yield/spoilage/wave/table-gate
//      numbers changed.
//   5. Verdict mapping + tooling-resolution rule —
//      classifyTransplant maps every survived count; resolveTooling
//      maps a tooling-only set to CONTINUE and any src/js (or
//      other non-tooling) file to UNMEASURED.
//   6. Prereg recorded in the evidence file (base, picks, seeds,
//      horizon, policy, STEP id, thresholds, STOP clause, tooling-
//      resolution rule, subject branch name, merge-tree predictions,
//      pick-2 mechanism, pick-3 not-runnable note, ordering note,
//      seed-band freshness note).
//   7. Base state — HEAD is on sim-transplant15e-a, no src/js file
//      differs from HEAD, on-disk standing.js is byte-identical to
//      HEAD, the step-script tooling source (master) still carries
//      all four scratch files; the step script names the band
//      190391-190398; no subject branch exists; no STEP t15e-resume
//      summary/driver log/corpus exists; no cherry-pick is in
//      progress.
// STAGE 2 (appended after the live picks) proves the live sequence:
//   8. Live pick 1 applies cleanly and its tree equals the
//      predicted pick-1-resolved tree; the subject's game-code diff
//      equals pick 1's diff exactly.
//   9. Live pick 2 outcome (conflict list, STOP if a src/js or
//      test file conflicted) and the evidence file records the
//      verdict (or UNMEASURED-BY-CONFLICT), the per-seed table, and
//      the telemetry refusal.
//
// Usage: node scripts/test-transplant15e.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant15e');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const PICK1 = 'bb6a301cf6433e2a62fe6a6e5fc95ca9ecd986c1';
const FIRST1 = '7688cb7a46367c88c7bb85e976502ddc0d5456f0';
const PICK2 = '7041e1bfb7e8b69387bd3203a58eed00115ec8d7';
const FIRST2 = 'c32ff6fa804f7ca54e4f2a03a71e3af4f0dbf212';
const PICK3 = '4a1c77cf10733b28e3bc7bc7f3fe47880d6ecc24';
const FIRST3 = '134a3d0ab161d4dcf96616c3bcf4940d6a5dd2fc';
const MERGEBASE = 'd229b58f595430e2a24c399820061b39c5b689ca';
const FAM14 = '7688cb7a46367c88c7bb85e976502ddc0d5456f0';
const SUBJECT_BRANCH = 'transplant-15e-subject';
const STEP = 't15e-resume';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
// Merge-tree predictions (pick 1 clean; pick 2 rc=1).
const MT1_TREE = 'f9e9b8b80156e7157793e7ee6a69306edcd5c738';
const MT2_TREE = '8e3ce24f9ddb300116ef2cedd310e8ebcf44128e';
// Predicted pick-1-resolved tree (= pick-1 merged tree, clean)
// and its prediction commit.
const PRED1_TREE = 'f9e9b8b80156e7157793e7ee6a69306edcd5c738';
const PRED1_COMMIT = '19e50e1e0e48b21094eccc9b139672900afaba21';
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
  // ---- 1. Family 15E identity ----
  T.section('1. Family 15E identity — three standalone first-parent commits, origin order');
  const picks = [
    { sha: PICK1, first: FIRST1, subject: 'Deliver unfinished thread on resume-offer Yes', js: ['src/js/conversation.js'], jsStat: '46\t4\tsrc/js/conversation.js', test: 'scripts/test-story-offer-yes-20261108.js', testStat: '73\t0\tscripts/test-story-offer-yes-20261108.js' },
    { sha: PICK2, first: FIRST2, subject: 'OVE-33: refresh stale quick proofs and fix outside-Muse fails', js: ['src/js/conversation.js'], jsStat: '4\t0\tsrc/js/conversation.js', test: 'scripts/test-snippet-stage-direction.js', testStat: '4\t0\tscripts/test-snippet-stage-direction.js' },
    { sha: PICK3, first: FIRST3, subject: 'OVE-57: triage tip quick-check after bond dawn', js: ['src/js/conversation.js', 'src/js/villager-objectives.js'], jsStat: null, test: null, testStat: null },
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
      const convStat = git('diff --numstat ' + p.sha + '^1 ' + p.sha + ' -- src/js/conversation.js');
      T.ok('pick ' + short + ' conversation.js is +21/-2', convStat === '21\t2\tsrc/js/conversation.js', convStat);
      const objStat = git('diff --numstat ' + p.sha + '^1 ' + p.sha + ' -- src/js/villager-objectives.js');
      T.ok('pick ' + short + ' villager-objectives.js is +21/-2', objStat === '21\t2\tsrc/js/villager-objectives.js', objStat);
    }
    if (p.testStat) {
      const testStat = git('diff --numstat ' + p.sha + '^1 ' + p.sha + ' -- ' + p.test);
      T.ok('pick ' + short + ' test file is ' + p.testStat.replace(/\t/g, '/'), testStat === p.testStat, testStat);
    } else {
      const balStat = git('diff --numstat ' + p.sha + '^1 ' + p.sha + ' -- scripts/balance-proof.json');
      T.ok('pick ' + short + ' balance-proof.json is +2/-2', balStat === '2\t2\tscripts/balance-proof.json', balStat);
    }
    T.ok('pick ' + short + ' does not touch standing.js', git('diff --name-only ' + p.sha + '^1 ' + p.sha + ' -- src/js/standing.js') === '', '(absent)');
    const polFiles = git('diff --name-only ' + p.sha + '^1 ' + p.sha + ' -- scripts/policies');
    T.ok('pick ' + short + ' touches no policy file', polFiles === '', polFiles || '(none)');
    const greenStat = git('diff --numstat ' + p.sha + '^1 ' + p.sha + ' -- scripts/green-list.txt');
    T.ok('pick ' + short + ' does not touch green-list.txt', greenStat === '', greenStat || '(absent)');
  }
  T.ok('pick 7041e1bfb balance-proof.json is +2/-2',
    git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- scripts/balance-proof.json') === '2\t2\tscripts/balance-proof.json', 'balance-proof 2/2');
  T.ok('pick 7041e1bfb phone-frame-proof.json is +6/-6',
    git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- scripts/phone-frame-proof.json') === '6\t6\tscripts/phone-frame-proof.json', 'phone-frame-proof 6/6');
  T.ok('pick 7041e1bfb sw.js is +1/-0',
    git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- sw.js') === '1\t0\tsw.js', 'sw.js 1/0');
  const fpOrder = git('log --first-parent --reverse --format=%H ' + MERGEBASE + '..a628aeaf3').split('\n');
  const idx1 = fpOrder.indexOf(PICK1);
  const idx2 = fpOrder.indexOf(PICK2);
  const idx3 = fpOrder.indexOf(PICK3);
  T.ok('all three picks are on the first-parent chain d229b58f5..a628aeaf3', idx1 !== -1 && idx2 !== -1 && idx3 !== -1, 'idx=' + idx1 + '/' + idx2 + '/' + idx3);
  T.ok('pick order is origin order (bb6a301cf before 7041e1bfb before 4a1c77cf1)', idx1 < idx2 && idx2 < idx3, idx1 + ' < ' + idx2 + ' < ' + idx3);
  const farStanding = sha256(gitShow(FAR, 'src/js/standing.js'));
  T.ok('far-end native standing.js sha is 75762cb2...', farStanding.startsWith('75762cb2'), farStanding.slice(0, 12));
  T.ok('fix standing.js sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  const farPolicy = sha256(gitShow(FAR, 'scripts/policies/competent.js'));
  T.ok('far-end policy sha is a7ff5c51...', farPolicy.startsWith('a7ff5c51'), farPolicy.slice(0, 12));

  // ---- 2. Merge-tree pre-check ----
  T.section('2. Merge-tree pre-check — pick 1 clean, pick 2 game-code conflict');
  const mt1 = mergeTree(FIRST1, FAR, PICK1);
  T.ok('pick 1 merge-tree rc=0 (clean)', mt1.rc === 0, 'rc=' + mt1.rc);
  T.ok('pick 1 merge-tree tree is f9e9b8b8…', mt1.tree === MT1_TREE, mt1.tree.slice(0, 12));
  T.ok('pick 1 merge-tree conflicts NOTHING', JSON.stringify(mt1.conflicted) === JSON.stringify([]), mt1.conflicted.join(', ') || '(none)');
  T.ok('tooling-resolution rule maps the pick-1 conflict set to NO-CONFLICT',
    resolveTooling(mt1.conflicted) === 'NO-CONFLICT', resolveTooling(mt1.conflicted));
  T.ok('prediction commit 19e50e1e carries the predicted tree with parent = far end',
    git('rev-parse ' + PRED1_COMMIT + '^{tree}') === PRED1_TREE && git('rev-parse ' + PRED1_COMMIT + '^1') === git('rev-parse ' + FAR), 'tree+parent ok');
  const pred1Numstat = git('diff --numstat ' + FAR + ' ' + PRED1_TREE);
  T.ok('predicted pick-1-resolved tree diff vs far end is exactly pick 1 (3 files, +148/-4)',
    pred1Numstat.split('\n').sort().join('\n') === ['29\t0\tevidence/2026-11-08/story-offer-yes-followthrough.md', '73\t0\tscripts/test-story-offer-yes-20261108.js', '46\t4\tsrc/js/conversation.js'].sort().join('\n'), pred1Numstat.replace(/\n/g, ' | '));
  const mt2 = mergeTree(FIRST2, PRED1_COMMIT, PICK2);
  T.ok('pick 2 merge-tree rc=1 (conflict)', mt2.rc === 1, 'rc=' + mt2.rc);
  T.ok('pick 2 merge-tree tree is 8e3ce24f…', mt2.tree === MT2_TREE, mt2.tree.slice(0, 12));
  T.ok('pick 2 merge-tree conflicts EXACTLY [balance-proof.json, phone-frame-proof.json, test-snippet-stage-direction.js, conversation.js]',
    JSON.stringify(mt2.conflicted) === JSON.stringify(['scripts/balance-proof.json', 'scripts/phone-frame-proof.json', 'scripts/test-snippet-stage-direction.js', 'src/js/conversation.js']), mt2.conflicted.join(', '));
  T.ok('pick 2 merge-tree conflicts a src/js file (conversation.js)',
    mt2.conflicted.indexOf('src/js/conversation.js') !== -1, 'src/js conflict present');
  T.ok('pick 2 merge-tree conflicts a test file (test-snippet-stage-direction.js)',
    mt2.conflicted.indexOf('scripts/test-snippet-stage-direction.js') !== -1, 'test conflict present');
  T.ok('tooling-resolution rule maps the pick-2 conflict set to UNMEASURED (STOP expected)',
    resolveTooling(mt2.conflicted) === 'UNMEASURED', resolveTooling(mt2.conflicted));
  T.ok('pick 3 prediction is NOT runnable (no pick-2-applied tree exists to build it on)',
    true, 'recorded in prereg; no pick-3 merge-tree is asserted');

  // ---- 3. Conflict mechanism ----
  T.section('3. Conflict mechanism — pick 2 assumes family-14 code the far end lacks');
  T.ok('7688cb7a4 (family 14, PR #10) IS an ancestor of pick 2\'s first parent',
    isAncestor(FAM14, FIRST2), 'ancestor of c32ff6fa8');
  T.ok('7688cb7a4 (family 14, PR #10) is NOT an ancestor of the far end',
    isAncestor(FAM14, FAR) === false, 'not ancestor of 203a32775');
  T.ok('"convoSnippetIsStageDirection" has 0 hits at the far end', grepCount(FAR, 'convoSnippetIsStageDirection', 'src/js/conversation.js') === 0, 'far=0');
  T.ok('"convoSnippetIsStageDirection" has 3 hits at pick 2\'s first parent', grepCount(FIRST2, 'convoSnippetIsStageDirection', 'src/js/conversation.js') === 3, 'base=3');
  T.ok('far end still has the sibling snippet helpers (IsHook 3 lines, IsRealBeat 5 lines)',
    grepCount(FAR, 'convoSnippetIsHook', 'src/js/conversation.js') === 3 && grepCount(FAR, 'convoSnippetIsRealBeat', 'src/js/conversation.js') === 5, 'hook=3 realbeat=5');
  const mt2Merged = gitShow(MT2_TREE, 'src/js/conversation.js');
  const mt2Lines = mt2Merged.split('\n');
  T.ok('pick-2 merged tree carries conflict markers in conversation.js at lines 1730/1731/1754',
    mt2Lines[1729].indexOf('<<<<<<<') === 0 && mt2Lines[1730].indexOf('=======') === 0 && mt2Lines[1753].indexOf('>>>>>>>') === 0, 'markers at 1730/1731/1754');
  T.ok('pick-2 conflict OURS side is EMPTY (the function is absent on our side)',
    mt2Lines[1729].indexOf('<<<<<<<') === 0 && mt2Lines[1730].indexOf('=======') === 0, 'ours side empty');
  T.ok('pick-2 conflict THEIRS side is the whole function with the OVE-33 quote check',
    mt2Merged.indexOf('convoSnippetIsStageDirection(sn)') !== -1 && mt2Merged.indexOf('if (/"/.test(s)) return false;') !== -1, 'theirs side = function + quote check');
  const mt2RawLines = mt2.raw.split('\n');
  const testStages = mt2RawLines.map(function (ln) {
    const m = ln.match(/^\d{6} [0-9a-f]{40} (\d)\tscripts\/test-snippet-stage-direction\.js$/);
    return m ? m[1] : null;
  }).filter(function (s) { return s !== null; }).sort();
  T.ok('test-snippet-stage-direction.js conflicts modify/delete (stages 1+3 only, no stage 2)',
    JSON.stringify(testStages) === JSON.stringify(['1', '3']), 'stages=' + testStages.join(','));
  const intervening = git('log --format=%h ' + PICK1 + '..' + FIRST2 + ' -- src/js/conversation.js').split('\n').filter(Boolean);
  T.ok('four origin-side commits between pick 1 and pick 2\'s first parent touch conversation.js (evolution, not the cause)',
    intervening.length === 4 && intervening.indexOf('2c01bb277') !== -1 && intervening.indexOf('3015beec0') !== -1, intervening.join(', '));
  T.ok('pick 3\'s first parent 134a3d0ab IS a descendant of pick 2 (sequence dependency)',
    isAncestor(PICK2, FIRST3), 'pick2 ancestor of pick3-base');

  // ---- 4. Family content ----
  T.section('4. Family content — resume repair, no lever numbers changed');
  const conv1 = gitShow(PICK1, 'src/js/conversation.js');
  T.ok('pick 1 tags the resume opener (resumeOffer flag + resumeTid)',
    conv1.indexOf('resumeOffer') !== -1 && conv1.indexOf('resumeTid') !== -1, 'resumeOffer/resumeTid present');
  T.ok('pick 1 marks the hanging genericQ so Yes follows through (c.genericQ.resumeOffer)',
    conv1.indexOf('c.genericQ.resumeOffer = true') !== -1, 'genericQ resumeOffer present');
  T.ok('pick 1 adds the STORY-OFFER FOLLOW-THROUGH comment in the gq:yn handler',
    conv1.indexOf('STORY-OFFER FOLLOW-THROUGH') !== -1, 'STORY-OFFER comment present');
  T.ok('pick 1 returns resumeOffer on the opener (resumeOffer: !!resumeOffer)',
    conv1.indexOf('resumeOffer: !!resumeOffer') !== -1, 'opener return present');
  const conv2 = gitShow(PICK2, 'src/js/conversation.js');
  T.ok('pick 2 adds the OVE-33 quote check (if (/"/.test(s)) return false;)',
    conv2.indexOf('if (/"/.test(s)) return false;') !== -1, 'quote check present');
  T.ok('pick 2 adds the "Spoken reactions often wrap a beat" comment',
    conv2.indexOf('Spoken reactions often wrap a beat') !== -1, 'comment present');
  const conv3 = gitShow(PICK3, 'src/js/conversation.js');
  T.ok('pick 3 adds the trader-intro deferral (tradeIntroDeferred)',
    conv3.indexOf('tradeIntroDeferred') !== -1, 'tradeIntroDeferred present');
  const obj3 = gitShow(PICK3, 'src/js/villager-objectives.js');
  T.ok('pick 3 adds the rally-guard lottery skip (rally-volunteer decision)',
    obj3.indexOf('rally-volunteer') !== -1 && obj3.indexOf('rallyOnly') !== -1, 'rally-volunteer present');
  T.ok('pick 3 commits the guard via objCommitGuardOffer (no-cross-write preserved)',
    obj3.indexOf('objCommitGuardOffer') !== -1, 'objCommitGuardOffer present');
  for (const pair of [[PICK1, 'pick 1'], [PICK2, 'pick 2'], [PICK3, 'pick 3']]) {
    const diffJs = execSync('git diff ' + pair[0] + '^1 ' + pair[0] + ' -- src/js', { cwd: REPO, stdio: 'pipe' }).toString('utf8');
    // Changed lines only (+/- lines, not context): the pick-3 hunk's
    // context mentions bark_armor_teach, which is not a change.
    const changedJs = diffJs.split('\n').filter(function (ln) {
      return (ln[0] === '+' || ln[0] === '-') && ln.slice(0, 3) !== '+++' && ln.slice(0, 3) !== '---';
    }).join('\n');
    T.ok(pair[1] + ' changed lines touch no damage/armor/spawn/food-yield/spoilage identifier',
      ['damage', 'armor', 'spawnMonster', 'foodYield', 'spoilage'].every(function (w) { return changedJs.indexOf(w) === -1; }), 'no lever identifiers');
    T.ok(pair[1] + ' changed lines touch no wave/table gate (no wave5, deedGate, table-price hunk)',
      changedJs.indexOf('wave5') === -1 && changedJs.indexOf('deedGate') === -1, 'no gate identifiers');
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
  T.ok('resolution rule: green-list.txt + conversation.js -> UNMEASURED (STOP)',
    resolveTooling(['scripts/green-list.txt', 'src/js/conversation.js']) === 'UNMEASURED', resolveTooling(['scripts/green-list.txt', 'src/js/conversation.js']));
  T.ok('resolution rule: one src/js file alone -> UNMEASURED',
    resolveTooling(['src/js/conversation.js']) === 'UNMEASURED', resolveTooling(['src/js/conversation.js']));
  T.ok('resolution rule: a test file -> UNMEASURED',
    resolveTooling(['scripts/test-snippet-stage-direction.js']) === 'UNMEASURED', resolveTooling(['scripts/test-snippet-stage-direction.js']));
  T.ok('resolution rule: a docs file -> UNMEASURED',
    resolveTooling(['docs/ONTOLOGY.md']) === 'UNMEASURED', resolveTooling(['docs/ONTOLOGY.md']));

  // ---- 6. Prereg recorded in the evidence file ----
  T.section('6. Prereg recorded in the evidence file');
  const evPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15e-prereg.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('prereg file exists', ev.length > 0, evPath);
  T.ok('prereg names pick bb6a301cf (resume-offer Yes)', ev.indexOf('bb6a301cf') !== -1, 'pick 1 present');
  T.ok('prereg names pick 7041e1bfb (OVE-33)', ev.indexOf('7041e1bfb') !== -1, 'pick 2 present');
  T.ok('prereg names pick 4a1c77cf1 (OVE-57)', ev.indexOf('4a1c77cf1') !== -1, 'pick 3 present');
  T.ok('prereg names the far end 203a32775', ev.indexOf('203a32775') !== -1, 'far end present');
  T.ok('prereg names the band 190391-190398', ev.indexOf('190391') !== -1 && ev.indexOf('190398') !== -1, 'band present');
  T.ok('prereg names the STEP id t15e-resume', ev.indexOf('t15e-resume') !== -1, 'STEP present');
  T.ok('prereg records the STOP clause', ev.indexOf('STOP clause') !== -1, 'STOP clause present');
  T.ok('prereg records the coordinator tooling-resolution rule (decided 2026-11-14 ~10:00Z)',
    ev.indexOf('TOOLING-RESOLUTION RULE') !== -1 && ev.indexOf('checkout --ours') !== -1, 'tooling rule present');
  T.ok('prereg records the thresholds (CARRIER <=1/8, AMBIGUOUS 2/8, NOT-CARRIER >=3/8)',
    ev.indexOf('CARRIER') !== -1 && ev.indexOf('AMBIGUOUS') !== -1 && ev.indexOf('NOT-CARRIER') !== -1, 'thresholds present');
  T.ok('prereg records the subject branch name transplant-15e-subject', ev.indexOf('transplant-15e-subject') !== -1, 'subject branch present');
  T.ok('prereg records the pick-1 merge-tree prediction (rc=0, tree f9e9b8b8)',
    ev.indexOf('f9e9b8b8') !== -1, 'pick-1 prediction present');
  T.ok('prereg records the predicted pick-1 commit 19e50e1e', ev.indexOf('19e50e1e') !== -1, 'pick-1 commit present');
  T.ok('prereg records the pick-2 merge-tree prediction (rc=1, tree 8e3ce24f, conversation.js)',
    ev.indexOf('8e3ce24f') !== -1 && ev.indexOf('src/js/conversation.js') !== -1, 'pick-2 prediction present');
  T.ok('prereg records the pick-2 mechanism (family 14 7688cb7a4, markers 1730)',
    ev.indexOf('7688cb7a4') !== -1 && ev.indexOf('1730') !== -1, 'pick-2 mechanism present');
  T.ok('prereg records that the pick-3 prediction is NOT runnable', ev.indexOf('NOT runnable') !== -1, 'pick-3 note present');
  T.ok('prereg records the grouping authority (§15E)', ev.indexOf('family15-grouping-prereg-2026-11-14.md') !== -1, 'authority present');
  T.ok('prereg records the canon note (CONVERSATIONS.md; no standalone OVE-33/57 doc)',
    ev.indexOf('CONVERSATIONS.md') !== -1, 'canon note present');
  T.ok('prereg records the horizon 150d death-aware', ev.indexOf('150d') !== -1, 'horizon present');
  T.ok('prereg records the competent verbatim own-policy', ev.indexOf('competent') !== -1, 'policy present');
  T.ok('prereg records the ordering note (pre-check ran during prereg preparation, subject not yet cut)',
    ev.indexOf('Ordering note') !== -1, 'ordering note present');
  T.ok('prereg records the seed-band freshness note (64 preregs, reused by design)',
    ev.indexOf('64 preregs') !== -1 && ev.indexOf('reused BY DESIGN') !== -1, 'seed-band note present');
  T.ok('prereg records the four intervening conversation.js commits (2c01bb277)',
    ev.indexOf('2c01bb277') !== -1, 'intervening commits present');
  T.ok('prereg records how pick 2\'s js file is handled (OVE-33 quote check inside family-14 function)',
    ev.indexOf('How') !== -1 && ev.indexOf('its js file is handled') !== -1, 'pick-2 js handling present');

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
  T.ok('HEAD is on the arm branch sim-transplant15e-a (worktree-only)', worktreeOnly(headBranch === 'sim-transplant15e-a'), 'HEAD=' + headBranch);
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
  T.ok('no subject branch exists yet (cut after the prereg commit; stage 2)', subjectExists === false, SUBJECT_BRANCH + ' absent');
  const t15eSummary = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  T.ok('no step summary exists for t15e-resume (no judged sim ran)', fs.existsSync(t15eSummary) === false, STEP);
  const t15eDriver = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  T.ok('no step driver log exists for t15e-resume (no judged sim ran)', fs.existsSync(t15eDriver) === false, STEP);
  const corpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  T.ok('no step corpus exists for t15e-resume (no judged sim ran)', fs.existsSync(corpusDir) === false, STEP);
  let cherryPickHead = true;
  try { execSync('git rev-parse --verify CHERRY_PICK_HEAD', { cwd: REPO, stdio: 'pipe' }); } catch (e) { cherryPickHead = false; }
  T.ok('no cherry-pick is in progress', cherryPickHead === false, 'CHERRY_PICK_HEAD absent');
  const dirtyTracked = git('diff --name-only HEAD');
  const allowed = ['scripts/test-transplant15e.js', 'evidence/2026-11-14/sim-transplant15e-prereg.md'];
  const dirtyOther = dirtyTracked.split('\n').filter(function (ln) {
    return ln && !allowed.some(function (a) { return ln === a; });
  }).join('\n');
  T.ok('tracked tree is clean apart from this proof + the prereg (uncommitted until this proof passes)', dirtyOther === '', dirtyOther.slice(0, 200) || '(only allowed files)');

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
