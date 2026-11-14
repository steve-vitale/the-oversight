#!/usr/bin/env node
// test-transplant15e-on14.js — proof test for the H1 TRANSPLANT,
// family 15E on far end + family 14 (resume / conversation repair
// with its prerequisite guard, arm sim-transplant15e-on14-a).
//
// THE QUESTION (evidence/2026-11-14/sim-transplant15e-on14-prereg.md,
// prereg committed before the subject was cut or any judged sim
// ran): land origin family 15E onto the far end 203a32775 (GOOD
// 4/8) WITH family 14 (PR #10 snippet-stage-direction-guard)
// applied first — four picks in origin order: 7688cb7a4 -m 1
// (family 14), bb6a301cf (resume-offer Yes delivers the unfinished
// thread), 7041e1bfb OVE-33 (proof refresh + stage-direction quote
// check), 4a1c77cf1 OVE-57 (trader-intro deferral + rally-guard
// lottery skip). Coordinator decision:
// evidence/2026-11-14/sim-transplant-round-1215.md (next blank #2,
// the 12+14 precedent). Grouping prereg:
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
//   1. Family 14 identity — the merge, its first parent, its
//      single second-parent commit, exact numstat, no standing.js,
//      no policy file.
//   2. Family 15E identity — all three picks (hashes, subjects,
//      first parents, exact numstats, no standing.js, no policy
//      file), in first-parent origin order.
//   3. Merge-tree pre-check — pick 0 rc=0 CLEAN (tree bc52919e,
//      prediction commit faa868ec); pick 1 rc=0 CLEAN (tree
//      96db10b0, prediction commit ea25872d); pick 2 rc=1,
//      conflicted files EXACTLY [scripts/balance-proof.json,
//      scripts/phone-frame-proof.json,
//      scripts/test-snippet-stage-direction.js,
//      src/js/conversation.js] (game-code included, STOP
//      expected); pick 3 prediction not runnable (needs the
//      pick-2-applied tree); brief-base artifact (d229b58f5 base
//      gives tooling-only drift conflicts, not a family conflict).
//   4. Pick-2 mechanism on the 14-tree — the function now EXISTS
//      on our side but in the NARROW family-14 form; pick 2's +4
//      anchors on the family-12-widened `.replace(...)` line,
//      which our side lacks; family 12 is an ancestor of pick 2's
//      first parent but not of the far end; the test-file +4
//      anchors where the base carries family-12 OVE-29 assertions
//      and our file ends.
//   5. Family content — stage-direction guard (pick 0);
//      resumeOffer/resumeTid + STORY-OFFER follow-through (pick 1);
//      the OVE-33 quote check (pick 2); tradeIntroDeferred +
//      rally-volunteer (pick 3); no damage/armor/spawn/food-yield/
//      spoilage/wave/table-gate numbers changed.
//   6. Verdict mapping + tooling-resolution rule —
//      classifyTransplant maps every survived count; resolveTooling
//      maps a tooling-only set to CONTINUE and any src/js (or
//      other non-tooling) file to UNMEASURED.
//   7. Prereg recorded in the evidence file (base, picks, seeds,
//      horizon, policy, STEP id, thresholds, STOP clause, tooling-
//      resolution rule, subject branch name, merge-tree predictions,
//      pick-2 mechanism, pick-3 not-runnable note, ordering note,
//      seed-band freshness note, brief-base note).
//   8. Base state — HEAD is on sim-transplant15e-on14-a, no src/js
//      file differs from HEAD, on-disk standing.js is byte-identical
//      to HEAD, the step-script tooling source (master) still carries
//      all four scratch files; the step script names the band
//      190391-190398; the subject branch does NOT exist yet (stage 1
//      — rewritten in stage 2 once the subject is cut); no STEP
//      t15e-on14 summary/driver log/corpus exists; no cherry-pick
//      is in progress.
// STAGE 2 (appended after the live picks) proves the live sequence:
//   9. Live picks 0+1 apply cleanly and their trees equal the
//      predicted trees; the subject's game-code diff equals the
//      picks' diff exactly.
//  10. Live pick 2 outcome (conflict list, STOP if a src/js or
//      test file conflicted) and the evidence file records the
//      verdict (or UNMEASURED-BY-CONFLICT), the per-seed table, and
//      the telemetry refusal.
//
// Usage: node scripts/test-transplant15e-on14.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant15e-on14');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAM14 = '7688cb7a46367c88c7bb85e976502ddc0d5456f0';
const FIRST14 = '16cdd690062b3551ff6b4b0d3639770c8af84b5f';
const SIDE14 = 'e4836747ed6daccfc5eb6deec8a8ae8f8dbaf90b';
const PICK1 = 'bb6a301cf6433e2a62fe6a6e5fc95ca9ecd986c1';
const FIRST1 = '7688cb7a46367c88c7bb85e976502ddc0d5456f0';
const PICK2 = '7041e1bfb7e8b69387bd3203a58eed00115ec8d7';
const FIRST2 = 'c32ff6fa804f7ca54e4f2a03a71e3af4f0dbf212';
const PICK3 = '4a1c77cf10733b28e3bc7bc7f3fe47880d6ecc24';
const FIRST3 = '134a3d0ab161d4dcf96616c3bcf4940d6a5dd2fc';
const FAM12 = 'ac119e4ed';
const MERGEBASE = 'd229b58f595430e2a24c399820061b39c5b689ca';
const SUBJECT_BRANCH = 'transplant-15e-on14-subject';
const STEP = 't15e-on14';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
// Merge-tree predictions (pick 0 clean; pick 1 clean; pick 2 rc=1).
const MT0_TREE = 'bc52919e73e6449e93ab2b64497eb25138d9ee90';
const PRED14_COMMIT = 'faa868ec01d43faa3592ada6055b490b0d037c05';
const MT1_TREE = '96db10b05bc53edd44dcb614fd5d22696dc3e4e7';
const PRED1_COMMIT = 'ea25872dd93e38f0dc27d7b6837f2aa1bc4ab9b7';
const MT2_TREE = '6bff133d3ba77e5e8b1928d8892c816382e57a3b';
const BRIEF_BASE_TREE = '015568e3a827c624e12968dc896160b95397164c';
const TOOLING_FILES = ['scripts/green-list.txt', 'scripts/balance-proof.json', 'scripts/phone-frame-proof.json'];

function sha256(text) { return crypto.createHash('sha256').update(text).digest('hex'); }
function git(args) {
  return execSync('git ' + args, { cwd: REPO, stdio: 'pipe' }).toString().trim();
}
function gitShow(commit, file) {
  return execSync('git show ' + commit + ':' + file, { cwd: REPO, stdio: 'pipe' }).toString();
}
function countIn(text, needle) { return text.split(needle).length - 1; }
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
  // ---- 1. Family 14 identity ----
  T.section('1. Family 14 identity — PR #10 snippet-stage-direction-guard merge');
  T.ok('family 14 merge 7688cb7a4 exists', git('rev-parse ' + FAM14).length === 40, git('log -1 --format=%s ' + FAM14).slice(0, 80));
  T.ok('family 14 subject is "Merge pull request #10 from steve-vitale/cursor/snippet-stage-direction-guard"',
    git('log -1 --format=%s ' + FAM14) === 'Merge pull request #10 from steve-vitale/cursor/snippet-stage-direction-guard', git('log -1 --format=%s ' + FAM14).slice(0, 80));
  T.ok('family 14 first parent is 16cdd69006', git('rev-parse ' + FAM14 + '^1') === FIRST14, git('log -1 --format=%h\\ %s ' + FAM14 + '^1').slice(0, 80));
  const parents14 = git('show -s --format=%P ' + FAM14).split(' ').filter(Boolean);
  T.ok('family 14 has exactly 2 parents (a merge)', parents14.length === 2, 'parents=' + parents14.length);
  T.ok('family 14 second-parent side is exactly 1 commit e4836747e', git('rev-parse ' + FAM14 + '^2') === SIDE14, git('log -1 --format=%h\\ %s ' + FAM14 + '^2').slice(0, 80));
  T.ok('family 14 second-parent subject is "Reject stage-direction snippets as resume memory quotes"',
    git('log -1 --format=%s ' + SIDE14) === 'Reject stage-direction snippets as resume memory quotes', git('log -1 --format=%s ' + SIDE14).slice(0, 80));
  const stat14 = git('diff --numstat ' + FAM14 + '^1 ' + FAM14);
  T.ok('family 14 diff is exactly 2 files, +33 (conversation.js +12, test +21)',
    stat14.split('\n').sort().join('\n') === ['21\t0\tscripts/test-snippet-stage-direction.js', '12\t0\tsrc/js/conversation.js'].sort().join('\n'), stat14.replace(/\n/g, ' | '));
  T.ok('family 14 does not touch standing.js', git('diff --name-only ' + FAM14 + '^1 ' + FAM14 + ' -- src/js/standing.js') === '', '(absent)');
  T.ok('family 14 touches no policy file', git('diff --name-only ' + FAM14 + '^1 ' + FAM14 + ' -- scripts/policies') === '', '(none)');
  T.ok('family 14 touches no data/docs file', git('diff --name-only ' + FAM14 + '^1 ' + FAM14 + ' -- src/data docs') === '', '(none)');
  T.ok('family 14 test file is NEW (+21/-0)', git('diff --numstat ' + FAM14 + '^1 ' + FAM14 + ' -- scripts/test-snippet-stage-direction.js') === '21\t0\tscripts/test-snippet-stage-direction.js', 'test 21/0');
  T.ok('family 14 conversation.js is +12/-0', git('diff --numstat ' + FAM14 + '^1 ' + FAM14 + ' -- src/js/conversation.js') === '12\t0\tsrc/js/conversation.js', 'conversation 12/0');

  // ---- 2. Family 15E identity ----
  T.section('2. Family 15E identity — three standalone first-parent commits, origin order');
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
  T.ok('all three 15E picks are on the first-parent chain d229b58f5..a628aeaf3', idx1 !== -1 && idx2 !== -1 && idx3 !== -1, 'idx=' + idx1 + '/' + idx2 + '/' + idx3);
  T.ok('pick order is origin order (bb6a301cf before 7041e1bfb before 4a1c77cf1)', idx1 < idx2 && idx2 < idx3, idx1 + ' < ' + idx2 + ' < ' + idx3);
  T.ok('family 14 precedes all three 15E picks on the origin line (14 is pick 1\'s first parent)',
    isAncestor(FAM14, FIRST1) && isAncestor(FAM14, FIRST2) && isAncestor(PICK1, FIRST2) && isAncestor(PICK2, FIRST3), '14 < pick1 < pick2 < pick3');
  const farStanding = sha256(gitShow(FAR, 'src/js/standing.js'));
  T.ok('far-end native standing.js sha is 75762cb2...', farStanding.startsWith('75762cb2'), farStanding.slice(0, 12));
  T.ok('fix standing.js sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  const farPolicy = sha256(gitShow(FAR, 'scripts/policies/competent.js'));
  T.ok('far-end policy sha is a7ff5c51...', farPolicy.startsWith('a7ff5c51'), farPolicy.slice(0, 12));

  // ---- 3. Merge-tree pre-check ----
  T.section('3. Merge-tree pre-check — picks 0+1 clean, pick 2 game-code conflict');
  const mt0 = mergeTree(FIRST14, FAR, FAM14);
  T.ok('pick 0 merge-tree rc=0 (clean)', mt0.rc === 0, 'rc=' + mt0.rc);
  T.ok('pick 0 merge-tree tree is bc52919e… (the 12+14 prediction, reproduced)', mt0.tree === MT0_TREE, mt0.tree.slice(0, 12));
  T.ok('pick 0 merge-tree conflicts NOTHING', JSON.stringify(mt0.conflicted) === JSON.stringify([]), mt0.conflicted.join(', ') || '(none)');
  T.ok('tooling-resolution rule maps the pick-0 conflict set to NO-CONFLICT',
    resolveTooling(mt0.conflicted) === 'NO-CONFLICT', resolveTooling(mt0.conflicted));
  T.ok('prediction commit faa868ec carries the predicted tree with parent = far end',
    git('rev-parse ' + PRED14_COMMIT + '^{tree}') === MT0_TREE && git('rev-parse ' + PRED14_COMMIT + '^1') === git('rev-parse ' + FAR), 'tree+parent ok');
  const pred0Numstat = git('diff --numstat ' + FAR + ' ' + MT0_TREE);
  T.ok('predicted pick-0-resolved tree diff vs far end is exactly family 14 (2 files, +33)',
    pred0Numstat.split('\n').sort().join('\n') === ['21\t0\tscripts/test-snippet-stage-direction.js', '12\t0\tsrc/js/conversation.js'].sort().join('\n'), pred0Numstat.replace(/\n/g, ' | '));
  const mt1 = mergeTree(FIRST1, PRED14_COMMIT, PICK1);
  T.ok('pick 1 merge-tree rc=0 (clean)', mt1.rc === 0, 'rc=' + mt1.rc);
  T.ok('pick 1 merge-tree tree is 96db10b0…', mt1.tree === MT1_TREE, mt1.tree.slice(0, 12));
  T.ok('pick 1 merge-tree conflicts NOTHING', JSON.stringify(mt1.conflicted) === JSON.stringify([]), mt1.conflicted.join(', ') || '(none)');
  T.ok('tooling-resolution rule maps the pick-1 conflict set to NO-CONFLICT',
    resolveTooling(mt1.conflicted) === 'NO-CONFLICT', resolveTooling(mt1.conflicted));
  T.ok('prediction commit ea25872d carries the predicted tree with parent = predicted pick-0 commit',
    git('rev-parse ' + PRED1_COMMIT + '^{tree}') === MT1_TREE && git('rev-parse ' + PRED1_COMMIT + '^1') === PRED14_COMMIT, 'tree+parent ok');
  const pred1Numstat = git('diff --numstat ' + MT0_TREE + ' ' + MT1_TREE);
  T.ok('predicted pick-1-resolved tree diff vs pick-0 tree is exactly pick 1 (3 files, +148/-4)',
    pred1Numstat.split('\n').sort().join('\n') === ['29\t0\tevidence/2026-11-08/story-offer-yes-followthrough.md', '73\t0\tscripts/test-story-offer-yes-20261108.js', '46\t4\tsrc/js/conversation.js'].sort().join('\n'), pred1Numstat.replace(/\n/g, ' | '));
  const mt2 = mergeTree(FIRST2, PRED1_COMMIT, PICK2);
  T.ok('pick 2 merge-tree rc=1 (conflict)', mt2.rc === 1, 'rc=' + mt2.rc);
  T.ok('pick 2 merge-tree tree is 6bff133d…', mt2.tree === MT2_TREE, mt2.tree.slice(0, 12));
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
  const mtBrief = mergeTree(MERGEBASE, FAR, FAM14);
  T.ok('brief-base artifact: merge-base d229b58f5 as base gives rc=1 (drift, not a family conflict)',
    mtBrief.rc === 1, 'rc=' + mtBrief.rc);
  T.ok('brief-base artifact tree is 015568e3…', mtBrief.tree === BRIEF_BASE_TREE, mtBrief.tree.slice(0, 12));
  T.ok('brief-base artifact conflicts EXACTLY [balance-proof.json, green-list.txt] (cumulative-line drift)',
    JSON.stringify(mtBrief.conflicted) === JSON.stringify(['scripts/balance-proof.json', 'scripts/green-list.txt']), mtBrief.conflicted.join(', '));

  // ---- 4. Pick-2 mechanism on the 14-tree ----
  T.section('4. Pick-2 mechanism — function present but narrow; pick 2 needs family 12\'s widening');
  T.ok('7688cb7a4 (family 14, PR #10) IS an ancestor of pick 2\'s first parent',
    isAncestor(FAM14, FIRST2), 'ancestor of c32ff6fa8');
  T.ok('7688cb7a4 (family 14, PR #10) is NOT an ancestor of the far end',
    isAncestor(FAM14, FAR) === false, 'not ancestor of 203a32775');
  T.ok('ac119e4ed (family 12, PR #25) IS an ancestor of pick 2\'s first parent',
    isAncestor(FAM12, FIRST2), 'ancestor of c32ff6fa8');
  T.ok('ac119e4ed (family 12, PR #25) is NOT an ancestor of the far end',
    isAncestor(FAM12, FAR) === false, 'not ancestor of 203a32775');
  T.ok('"convoSnippetIsStageDirection" has 0 hits at the far end', grepCount(FAR, 'convoSnippetIsStageDirection', 'src/js/conversation.js') === 0, 'far=0');
  T.ok('"convoSnippetIsStageDirection" has 3 hits at pick 2\'s first parent', grepCount(FIRST2, 'convoSnippetIsStageDirection', 'src/js/conversation.js') === 3, 'base=3');
  T.ok('"convoSnippetIsStageDirection" has 3 hits at the predicted pick-1 tree (function present now)', grepCount(PRED1_COMMIT, 'convoSnippetIsStageDirection', 'src/js/conversation.js') === 3, 'pred1=3');
  const pred1Conv = gitShow(MT1_TREE, 'src/js/conversation.js');
  const baseConv = gitShow(FIRST2, 'src/js/conversation.js');
  T.ok('predicted pick-1 tree carries the NARROW guard (const s = String(sn).trim();, 1 hit)',
    countIn(pred1Conv, 'const s = String(sn).trim();') === 1, 'narrow anchor present');
  T.ok('predicted pick-1 tree does NOT carry the widened anchor (no .replace strip)',
    countIn(pred1Conv, 'const s = String(sn).trim().replace') === 0, 'wide anchor absent');
  T.ok('pick 2\'s base carries the WIDENED anchor (1 hit)',
    countIn(baseConv, 'const s = String(sn).trim().replace') === 1, 'wide anchor present at base');
  T.ok('pick 2\'s base does NOT carry the narrow anchor',
    countIn(baseConv, 'const s = String(sn).trim();') === 0, 'narrow anchor absent at base');
  T.ok('predicted pick-1 tree carries the narrow return ("Still on what they confided")',
    countIn(pred1Conv, 'Still on what they confided') === 1, 'narrow return present');
  const mt2Conv = gitShow(MT2_TREE, 'src/js/conversation.js');
  const mt2ConvLines = mt2Conv.split('\n');
  T.ok('pick-2 merged tree carries conflict markers in conversation.js at lines 1738/1742/1756',
    mt2ConvLines[1737].indexOf('<<<<<<<') === 0 && mt2ConvLines[1741].indexOf('=======') === 0 && mt2ConvLines[1755].indexOf('>>>>>>>') === 0, 'markers at 1738/1742/1756');
  T.ok('pick-2 conflict OURS side is the NARROW body (not empty — the function exists now)',
    mt2ConvLines[1738].indexOf('const s = String(sn).trim();') !== -1 && mt2ConvLines[1739].indexOf('Still on what they confided') !== -1, 'ours side = narrow body');
  T.ok('pick-2 conflict THEIRS side is the widened body plus the OVE-33 quote check',
    mt2Conv.indexOf('convoSnippetIsStageDirection(sn)') !== -1 && mt2Conv.indexOf('if (/"/.test(s)) return false;') !== -1 && mt2Conv.indexOf('const s = String(sn).trim().replace') !== -1, 'theirs side = widened + quote check');
  const pred1TestLines = gitShow(MT1_TREE, 'scripts/test-snippet-stage-direction.js').split('\n').length;
  const baseTestLines = gitShow(FIRST2, 'scripts/test-snippet-stage-direction.js').split('\n').length;
  T.ok('predicted pick-1 test file is 21 lines (family 14 only)', pred1TestLines === 22, 'lines=' + pred1TestLines + ' (21 + trailing newline)');
  T.ok('pick 2\'s base test file is 74 lines (family 12 widened it)', baseTestLines === 75, 'lines=' + baseTestLines + ' (74 + trailing newline)');
  const mt2Test = gitShow(MT2_TREE, 'scripts/test-snippet-stage-direction.js');
  const mt2TestLines = mt2Test.split('\n');
  T.ok('pick-2 merged tree carries conflict markers in the test file at lines 18/21/26',
    mt2TestLines[17].indexOf('<<<<<<<') === 0 && mt2TestLines[20].indexOf('=======') === 0 && mt2TestLines[25].indexOf('>>>>>>>') === 0, 'markers at 18/21/26');
  T.ok('pick-2 test conflict THEIRS side is the OVE-33 assertions (characterGen reaction wrapper)',
    mt2Test.indexOf('characterGen reaction wrapper') !== -1 && mt2Test.indexOf("They go still.") !== -1, 'theirs side = OVE-33 assertions');
  const mt2Bal = gitShow(MT2_TREE, 'scripts/balance-proof.json').split('\n');
  T.ok('pick-2 merged tree carries balance-proof markers at lines 3/6/9',
    mt2Bal[2].indexOf('<<<<<<<') === 0 && mt2Bal[5].indexOf('=======') === 0 && mt2Bal[8].indexOf('>>>>>>>') === 0, 'markers at 3/6/9');
  const mt2Phone = gitShow(MT2_TREE, 'scripts/phone-frame-proof.json').split('\n');
  T.ok('pick-2 merged tree carries phone-frame-proof markers at lines 7/15/23 and 81/91/101',
    mt2Phone[6].indexOf('<<<<<<<') === 0 && mt2Phone[14].indexOf('=======') === 0 && mt2Phone[22].indexOf('>>>>>>>') === 0 &&
    mt2Phone[80].indexOf('<<<<<<<') === 0 && mt2Phone[90].indexOf('=======') === 0 && mt2Phone[100].indexOf('>>>>>>>') === 0, 'markers at 7/15/23 + 81/91/101');
  T.ok('pick 3\'s first parent 134a3d0ab IS a descendant of pick 2 (sequence dependency)',
    isAncestor(PICK2, FIRST3), 'pick2 ancestor of pick3-base');

  // ---- 5. Family content ----
  T.section('5. Family content — stage-direction guard, resume repair, no lever numbers changed');
  const conv14 = gitShow(FAM14, 'src/js/conversation.js');
  T.ok('family 14 adds convoSnippetIsStageDirection (the guard function)',
    conv14.indexOf('convoSnippetIsStageDirection(sn)') !== -1, 'guard present at the merge');
  T.ok('family 14 guard rejects stage-direction snippets ("Still on what they confided")',
    conv14.indexOf('Still on what they confided') !== -1, 'stage-direction pattern present');
  const test14 = gitShow(FAM14, 'scripts/test-snippet-stage-direction.js');
  T.ok('family 14 test asserts the guard (They glance at the fire is stage direction)',
    test14.indexOf("G.convoSnippetIsStageDirection('They glance at the fire, then back.')") !== -1, 'guard assertion present');
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
  for (const pair of [[FAM14, 'family 14'], [PICK1, 'pick 1'], [PICK2, 'pick 2'], [PICK3, 'pick 3']]) {
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

  // ---- 6. Verdict mapping + tooling-resolution rule ----
  T.section('6. Verdict mapping — group thresholds + tooling-resolution rule');
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

  // ---- 7. Prereg recorded in the evidence file ----
  T.section('7. Prereg recorded in the evidence file');
  const evPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15e-on14-prereg.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('prereg file exists', ev.length > 0, evPath);
  T.ok('prereg names family 14 merge 7688cb7a4 (PR #10)', ev.indexOf('7688cb7a4') !== -1, 'family 14 present');
  T.ok('prereg names pick bb6a301cf (resume-offer Yes)', ev.indexOf('bb6a301cf') !== -1, 'pick 1 present');
  T.ok('prereg names pick 7041e1bfb (OVE-33)', ev.indexOf('7041e1bfb') !== -1, 'pick 2 present');
  T.ok('prereg names pick 4a1c77cf1 (OVE-57)', ev.indexOf('4a1c77cf1') !== -1, 'pick 3 present');
  T.ok('prereg names the far end 203a32775', ev.indexOf('203a32775') !== -1, 'far end present');
  T.ok('prereg names the band 190391-190398', ev.indexOf('190391') !== -1 && ev.indexOf('190398') !== -1, 'band present');
  T.ok('prereg names the STEP id t15e-on14', ev.indexOf('t15e-on14') !== -1, 'STEP present');
  T.ok('prereg records the STOP clause', ev.indexOf('STOP clause') !== -1, 'STOP clause present');
  T.ok('prereg records the coordinator tooling-resolution rule (decided 2026-11-14 ~10:00Z)',
    ev.indexOf('TOOLING-RESOLUTION RULE') !== -1 && ev.indexOf('checkout --ours') !== -1, 'tooling rule present');
  T.ok('prereg records the thresholds (CARRIER <=1/8, AMBIGUOUS 2/8, NOT-CARRIER >=3/8)',
    ev.indexOf('CARRIER') !== -1 && ev.indexOf('AMBIGUOUS') !== -1 && ev.indexOf('NOT-CARRIER') !== -1, 'thresholds present');
  T.ok('prereg records the subject branch name transplant-15e-on14-subject', ev.indexOf('transplant-15e-on14-subject') !== -1, 'subject branch present');
  T.ok('prereg records the pick-0 merge-tree prediction (rc=0, tree bc52919e)',
    ev.indexOf('bc52919e') !== -1, 'pick-0 prediction present');
  T.ok('prereg records the predicted pick-0 commit faa868ec', ev.indexOf('faa868ec') !== -1, 'pick-0 commit present');
  T.ok('prereg records the pick-1 merge-tree prediction (rc=0, tree 96db10b0)',
    ev.indexOf('96db10b0') !== -1, 'pick-1 prediction present');
  T.ok('prereg records the predicted pick-1 commit ea25872d', ev.indexOf('ea25872d') !== -1, 'pick-1 commit present');
  T.ok('prereg records the pick-2 merge-tree prediction (rc=1, tree 6bff133d, conversation.js)',
    ev.indexOf('6bff133d') !== -1 && ev.indexOf('src/js/conversation.js') !== -1, 'pick-2 prediction present');
  T.ok('prereg records the pick-2 mechanism (family 12 ac119e4ed, markers 1738)',
    ev.indexOf('ac119e4ed') !== -1 && ev.indexOf('1738') !== -1, 'pick-2 mechanism present');
  T.ok('prereg records that the pick-3 prediction is NOT runnable', ev.indexOf('NOT runnable') !== -1, 'pick-3 note present');
  T.ok('prereg records the grouping authority (§15E)', ev.indexOf('family15-grouping-prereg-2026-11-14.md') !== -1, 'authority present');
  T.ok('prereg records the coordinator decision (round-1215, next blank #2)',
    ev.indexOf('sim-transplant-round-1215.md') !== -1 && ev.indexOf('next blank #2') !== -1, 'coordinator decision present');
  T.ok('prereg records the 12+14 precedent authority', ev.indexOf('sim-transplant12-14-prereg.md') !== -1, '12+14 authority present');
  T.ok('prereg records the canon note (CONVERSATIONS.md; no standalone OVE-33/57 doc)',
    ev.indexOf('CONVERSATIONS.md') !== -1, 'canon note present');
  T.ok('prereg records the horizon 150d death-aware', ev.indexOf('150d') !== -1, 'horizon present');
  T.ok('prereg records the competent verbatim own-policy', ev.indexOf('competent') !== -1, 'policy present');
  T.ok('prereg records the ordering note (pre-check ran during prereg preparation, subject not yet cut)',
    ev.indexOf('Ordering note') !== -1, 'ordering note present');
  T.ok('prereg records the seed-band freshness note (64 preregs, reused by design)',
    ev.indexOf('64 preregs') !== -1 && ev.indexOf('reused BY DESIGN') !== -1, 'seed-band note present');
  T.ok('prereg records the brief-base artifact (tree 015568e3, tooling-only drift)',
    ev.indexOf('015568e3') !== -1 && ev.indexOf('BRIEF-BASE NOTE') !== -1, 'brief-base note present');
  T.ok('prereg records the follow-up candidates for the coordinator (14+12 first / pick-1 alone / pick-1+pick-3)',
    ev.indexOf('(a2) land 14+12 first') !== -1, 'follow-up candidates present');

  // ---- 8. Base state ----
  T.section('8. Base state — arm branch clean, subject not cut, sim not run');
  const headBranch = git('rev-parse --abbrev-ref HEAD');
  // worktreeOnly: branch-identity legs are meaningful only in the
  // worker tree. On merged master HEAD is 'master' by design (the
  // arm branch is deleted after landing) — the leg passes there
  // vacuously instead of failing, so the proof stays green on master
  // (0215Z lesson). Prereg-commit ancestry legs resolve by
  // message/subject, not hash (0608Z lesson: an adoption rebase
  // rewrites hashes).
  const worktreeOnly = function (cond) { return cond || headBranch === 'master'; };
  T.ok('HEAD is on the arm branch sim-transplant15e-on14-a (worktree-only)', worktreeOnly(headBranch === 'sim-transplant15e-on14-a'), 'HEAD=' + headBranch);
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
  T.ok('subject branch does NOT exist yet (stage 1 — rewritten in stage 2 once the subject is cut)', subjectExists === false, SUBJECT_BRANCH + ' absent');
  const t15eSummary = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  T.ok('no step summary exists for t15e-on14 (no judged sim ran)', fs.existsSync(t15eSummary) === false, STEP);
  const t15eDriver = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  T.ok('no step driver log exists for t15e-on14 (no judged sim ran)', fs.existsSync(t15eDriver) === false, STEP);
  const corpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  T.ok('no step corpus exists for t15e-on14 (no judged sim ran)', fs.existsSync(corpusDir) === false, STEP);
  let cherryPickHead = true;
  try { execSync('git rev-parse --verify CHERRY_PICK_HEAD', { cwd: REPO, stdio: 'pipe' }); } catch (e) { cherryPickHead = false; }
  T.ok('no cherry-pick is in progress', cherryPickHead === false, 'CHERRY_PICK_HEAD absent');
  const dirtyTracked = git('diff --name-only HEAD');
  const allowed = ['scripts/test-transplant15e-on14.js', 'evidence/2026-11-14/sim-transplant15e-on14-prereg.md', 'evidence/2026-11-14/sim-transplant15e-on14.md'];
  const dirtyOther = dirtyTracked.split('\n').filter(function (ln) {
    return ln && !allowed.some(function (a) { return ln === a; });
  }).join('\n');
  T.ok('tracked tree is clean apart from this proof + the prereg + the evidence file (uncommitted until this proof passes)', dirtyOther === '', dirtyOther.slice(0, 200) || '(only allowed files)');

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
