#!/usr/bin/env node
// test-transplant15e-p12-a.js — proof test for the H1 TRANSPLANT,
// 15E picks 1+2 on far end + family 14 + family 12 (resume /
// conversation repair on the exonerated 14+12 base, arm
// sim-transplant15e-p12-a).
//
// THE QUESTION (evidence/2026-11-14/sim-transplant15e-p12-prereg.md,
// prereg committed before any judged sim ran): the 15E-on-14+12 arm
// (sim-transplant15e-1412-a) stopped UNMEASURED-BY-CONFLICT at its
// pick 4 (4a1c77cf1, OVE-57 — villager-objectives.js Phase 4
// dependency); its subject branch transplant-15e-1412-subject
// already holds far end + family 14 + family 12 + 15E pick 1
// (bb6a301cf, resume-offer Yes delivers the unfinished thread) +
// 15E pick 2 (7041e1bfb, OVE-33). This arm measures picks 1+2 as
// one unit on that already-built subject (coordinator-decision
// candidate (c) from sim-transplant15e-1412.md). Base exoneration:
// family 14 alone is MEASURED NOT-CARRIER 4/8
// (sim-transplant14.md) and the 12+14 pair is MEASURED NOT-CARRIER
// 4/8, seed-for-seed identical to the far end
// (sim-transplant12-14.md) — so any collapse in this subject is
// attributable to picks 1+2. The subject is VERIFIED here, NOT
// rebuilt. Binding prereg: sim-scale-onramp-round-2115.md §3.
//
// CONFLICT RULE (coordinator tooling-resolution rule, decided
// 2026-11-14 ~10:00Z, binding for this run's family-15 arms): a
// pick conflicting ONLY on zero-src-reader tooling files
// (scripts/green-list.txt, scripts/balance-proof.json,
// scripts/phone-frame-proof.json) resolves EACH such file with
// `git checkout --ours` (keep the far-end version byte-identical)
// and continues; ANY other conflicted file (any src/js, data,
// policy, docs, or test file) STOPS the arm immediately, no
// hand-resolution, no narrowed re-run decided by this arm. This
// arm performs NO cherry-pick; the rule binds only as the record
// of how the subject's pick 2 was resolved (tooling-only, both
// files --ours, by the prior arm).
//
// STAGE 1 (this file as committed with the prereg) proves:
//   1. Family 14 identity — the merge, its first parent, its
//      single second-parent commit, exact numstat, no standing.js,
//      no policy file.
//   2. Family 12 identity — the merge, its first parent, its
//      single second-parent commit, exact numstat, no standing.js,
//      no policy file.
//   3. Picks 1+2 identity — both picks (hashes, subjects, first
//      parents, exact numstats, no standing.js, no policy file),
//      in first-parent origin order; pick 4 (4a1c77cf1) is NOT in
//      the subject.
//   4. Subject verification — the existing branch holds exactly
//      the four commits in order on the far end, with the four
//      predicted trees; the subject diff vs the far end is exactly
//      picks 0-3 net; both resolved tooling files are byte-identical
//      to the far end; villager-objectives.js untouched.
//   5. Merge-tree pre-check re-run — pick 0 rc=0 CLEAN (tree
//      bc52919e, prediction commit d632a89b); pick 1 rc=0 CLEAN
//      (tree e78fac42, prediction commit 4566f962 — the 12+14
//      subject tree); pick 2 (this arm's pick 1) rc=0 CLEAN (tree
//      45f64b03, prediction commit 6f389c10); pick 3 (this arm's
//      pick 2) rc=1, conflicted files EXACTLY
//      [scripts/balance-proof.json, scripts/phone-frame-proof.json]
//      (tooling-only, CONTINUE-OURS; resolved tree e6fab899,
//      prediction commit a7180fc9); brief-base artifact.
//   6. Pick-1 + pick-2 mechanisms — pick 1 tags the resume opener
//      (resumeOffer/resumeTid, STORY-OFFER follow-through); pick 2's
//      game-code hunks merge clean because family 12's widening
//      supplies the anchor (convoSnippetIsStageDirection 3 hits at
//      the predicted pick-1 tree, widened anchor present).
//   7. Family content — stage-direction guard (family 14);
//      residual widening (family 12); resumeOffer/resumeTid +
//      STORY-OFFER follow-through (pick 1); the OVE-33 quote check
//      (pick 2); no damage/armor/spawn/food-yield/spoilage/wave/
//      table-gate numbers changed.
//   8. Verdict mapping + tooling-resolution rule —
//      classifyTransplant maps every survived count; resolveTooling
//      maps a tooling-only set to CONTINUE and any src/js (or
//      other non-tooling) file to UNMEASURED.
//   9. Prereg recorded in the evidence file (base, picks, seeds,
//      horizon, policy, STEP id, thresholds, subject verification,
//      base exoneration, merge-tree predictions, mechanisms,
//      ordering note, seed-band freshness note).
//  10. Base state — HEAD is on sim-transplant15e-p12-a, no src/js
//      file differs from HEAD, on-disk standing.js is byte-identical
//      to HEAD, the step-script tooling source (master) still carries
//      all four scratch files, the subject branch exists at
//      312647db0, no step summary/driver/corpus exists for t15e-p12
//      (no judged sim ran yet), no cherry-pick in progress.
//
// STAGE 2 (appended after the step) proves:
//  11. Step verdict — the t15e-p12 summary exists and reads the
//      judged survived/8 with the classification the thresholds
//      demand, per-seed days, wall numbers; the corpus exists (8
//      per-seed JSONs); the driver log exists.
//  12. Evidence record — the evidence file records the verdict,
//      the survived/8 read, the per-seed table, the subject tip
//      and trees, the STEP id, the telemetry refusal, and the
//      sense-testing read; HEAD is back on the arm branch, the
//      native standing.js is restored byte-identical, no
//      cherry-pick in progress, tracked tree clean apart from
//      this proof + prereg + evidence.
//
// Usage: node scripts/test-transplant15e-p12-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant15e-p12-a');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAM14 = '7688cb7a46367c88c7bb85e976502ddc0d5456f0';
const FIRST14 = '16cdd690062b3551ff6b4b0d3639770c8af84b5f';
const SIDE14 = 'e4836747ed6daccfc5eb6deec8a8ae8f8dbaf90b';
const FAM12 = 'ac119e4ed27b2aa66131929795a4d3d0f381900b';
const FIRST12 = 'aa5d9ef92d6f5e7d160f6b59bcbf7b54072b1ad0';
const SIDE12 = '3015beec0aefd3a3db394b73c362c2af9f4c2f84';
const PICK1 = 'bb6a301cf6433e2a62fe6a6e5fc95ca9ecd986c1';
const FIRST1 = '7688cb7a46367c88c7bb85e976502ddc0d5456f0';
const PICK2 = '7041e1bfb7e8b69387bd3203a58eed00115ec8d7';
const FIRST2 = 'c32ff6fa804f7ca54e4f2a03a71e3af4f0dbf212';
const PICK4 = '4a1c77cf10733b28e3bc7bc7f3fe47880d6ecc24';
const MERGEBASE = 'd229b58f595430e2a24c399820061b39c5b689ca';
const SUBJECT_BRANCH = 'transplant-15e-1412-subject';
const STEP = 't15e-p12';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
// Merge-tree predictions (picks 0-1 clean; pick 1 clean; pick 2 tooling-only).
const MT0_TREE = 'bc52919e73e6449e93ab2b64497eb25138d9ee90';
const PRED0_COMMIT = 'd632a89b1369dc970b6b2fb2966b17d331eaa292';
const MT1_TREE = 'e78fac42d89e811f6bfce981b7274e5ee3c5c014';
const PRED1_COMMIT = '4566f962837d83464c918c513206deb6b54349ad';
const MT2_TREE = '45f64b03acaf50e38af24df375793cba9c666ae6';
const PRED2_COMMIT = '6f389c109888b13f72246271adb48b41f0b0d791';
const MT3_TREE = '9f0ee83bbc349c07ca16811689236df66836f144';
const MT3RES_TREE = 'e6fab8999c9039e0cf987dccdefcab63a2f154b8';
const PRED3_COMMIT = 'a7180fc9a6482feec46d0bfae4a2b82b617dda9e';
const LIVE0 = 'abd8d575433bd2557467f7789f32c643567184c4';
const LIVE1 = '588f054d1d0855fb76197de10bab26180288216b';
const LIVE2 = 'e0af0163ad89e2d8d25cf237e1fe3f506fd1fe30';
const LIVE3 = '312647db088a2cd0dcd8800f014f4722863668e6';
const BRIEF_BASE_TREE = '015568e3a827c624e12968dc896160b95397164c';
const BAL_OURS_BLOB = 'd0c6a42ff2395a49672f235f0218a3f969619dee';
const PHONE_OURS_BLOB = 'b06910148b2bb567ca3941b2ac3245872f74f632';
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

  // ---- 2. Family 12 identity ----
  T.section('2. Family 12 identity — PR #25 dialog-residual-sampler merge');
  T.ok('family 12 merge ac119e4ed exists', git('rev-parse ' + FAM12).length === 40, git('log -1 --format=%s ' + FAM12).slice(0, 80));
  T.ok('family 12 subject is "Merge pull request #25 from steve-vitale/cursor/dialog-residual-sampler-f726"',
    git('log -1 --format=%s ' + FAM12) === 'Merge pull request #25 from steve-vitale/cursor/dialog-residual-sampler-f726', git('log -1 --format=%s ' + FAM12).slice(0, 80));
  T.ok('family 12 first parent is aa5d9ef92', git('rev-parse ' + FAM12 + '^1') === FIRST12, git('log -1 --format=%h\\ %s ' + FAM12 + '^1').slice(0, 80));
  const parents12 = git('show -s --format=%P ' + FAM12).split(' ').filter(Boolean);
  T.ok('family 12 has exactly 2 parents (a merge)', parents12.length === 2, 'parents=' + parents12.length);
  T.ok('family 12 second-parent side is exactly 1 commit 3015beec0', git('rev-parse ' + FAM12 + '^2') === SIDE12, git('log -1 --format=%h\\ %s ' + FAM12 + '^2').slice(0, 80));
  T.ok('family 12 second-parent subject is "Reject residual silence/meta resume memory quotes"',
    git('log -1 --format=%s ' + SIDE12) === 'Reject residual silence/meta resume memory quotes', git('log -1 --format=%s ' + SIDE12).slice(0, 80));
  const stat12 = git('diff --numstat ' + FAM12 + '^1 ' + FAM12);
  T.ok('family 12 diff is exactly 2 files, +73/-5 (conversation.js +18/-3, test +55/-2)',
    stat12.split('\n').sort().join('\n') === ['55\t2\tscripts/test-snippet-stage-direction.js', '18\t3\tsrc/js/conversation.js'].sort().join('\n'), stat12.replace(/\n/g, ' | '));
  T.ok('family 12 does not touch standing.js', git('diff --name-only ' + FAM12 + '^1 ' + FAM12 + ' -- src/js/standing.js') === '', '(absent)');
  T.ok('family 12 touches no policy file', git('diff --name-only ' + FAM12 + '^1 ' + FAM12 + ' -- scripts/policies') === '', '(none)');
  T.ok('family 12 touches no data/docs file', git('diff --name-only ' + FAM12 + '^1 ' + FAM12 + ' -- src/data docs') === '', '(none)');
  T.ok('family 12 conversation.js is +18/-3', git('diff --numstat ' + FAM12 + '^1 ' + FAM12 + ' -- src/js/conversation.js') === '18\t3\tsrc/js/conversation.js', 'conversation 18/3');
  T.ok('family 12 test file is +55/-2 (edited, not new)', git('diff --numstat ' + FAM12 + '^1 ' + FAM12 + ' -- scripts/test-snippet-stage-direction.js') === '55\t2\tscripts/test-snippet-stage-direction.js', 'test 55/2');
  T.ok('family 14 IS an ancestor of family 12\'s first parent (14 precedes 12 on the origin line)',
    isAncestor(FAM14, FIRST12), '14 ancestor of aa5d9ef92');
  T.ok('family 12 is NOT an ancestor of the far end', isAncestor(FAM12, FAR) === false, 'not ancestor of 203a32775');
  T.ok('the 12+14 subject branch exists at c8655548f (measured NOT-CARRIER precedent)',
    git('rev-parse transplant-12-14-subject').startsWith('c8655548f'), git('log -1 --format=%h\\ %s transplant-12-14-subject').slice(0, 80));
  T.ok('the 12+14 subject tree is e78fac42… (the same tree this arm\'s subject carries at 588f054d1)',
    git('rev-parse transplant-12-14-subject^{tree}') === MT1_TREE, git('rev-parse transplant-12-14-subject^{tree}').slice(0, 12));
  const subj1214Numstat = git('diff --numstat ' + FAR + ' transplant-12-14-subject');
  T.ok('the 12+14 subject diff vs far end is 2 files, +101 (conversation.js +27, test +74)',
    subj1214Numstat.split('\n').sort().join('\n') === ['74\t0\tscripts/test-snippet-stage-direction.js', '27\t0\tsrc/js/conversation.js'].sort().join('\n'), subj1214Numstat.replace(/\n/g, ' | '));

  // ---- 3. Picks 1+2 identity ----
  T.section('3. Picks 1+2 identity — two standalone first-parent commits, origin order; pick 4 NOT in the subject');
  const picks = [
    { sha: PICK1, first: FIRST1, subject: 'Deliver unfinished thread on resume-offer Yes', js: ['src/js/conversation.js'], jsStat: '46\t4\tsrc/js/conversation.js', test: 'scripts/test-story-offer-yes-20261108.js', testStat: '73\t0\tscripts/test-story-offer-yes-20261108.js' },
    { sha: PICK2, first: FIRST2, subject: 'OVE-33: refresh stale quick proofs and fix outside-Muse fails', js: ['src/js/conversation.js'], jsStat: '4\t0\tsrc/js/conversation.js', test: 'scripts/test-snippet-stage-direction.js', testStat: '4\t0\tscripts/test-snippet-stage-direction.js' },
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
    const stat = git('diff --numstat ' + p.sha + '^1 ' + p.sha + ' -- ' + p.js[0]);
    T.ok('pick ' + short + ' ' + p.js[0] + ' is ' + p.jsStat.replace(/\t/g, '/'), stat === p.jsStat, stat);
    const testStat = git('diff --numstat ' + p.sha + '^1 ' + p.sha + ' -- ' + p.test);
    T.ok('pick ' + short + ' test file is ' + p.testStat.replace(/\t/g, '/'), testStat === p.testStat, testStat);
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
  T.ok('both picks are on the first-parent chain d229b58f5..a628aeaf3', idx1 !== -1 && idx2 !== -1, 'idx=' + idx1 + '/' + idx2);
  T.ok('pick order is origin order (bb6a301cf before 7041e1bfb)', idx1 < idx2, idx1 + ' < ' + idx2);
  T.ok('family 14 precedes family 12 precedes both picks on the origin line',
    isAncestor(FAM14, FIRST12) && isAncestor(FAM12, FIRST2) && isAncestor(FAM14, FIRST1) && isAncestor(PICK1, FIRST2), '14 < 12 < pick1 < pick2');
  T.ok('pick 4a1c77cf1 (OVE-57) exists as an origin commit', git('rev-parse ' + PICK4).length === 40, git('log -1 --format=%s ' + PICK4).slice(0, 80));
  T.ok('pick 4a1c77cf1 is NOT an ancestor of the subject (not judged by this arm)',
    isAncestor(PICK4, SUBJECT_BRANCH) === false, 'not ancestor of ' + SUBJECT_BRANCH);
  T.ok('no OVE-57 commit exists on the subject log',
    git('log --format=%s ' + FAR + '..' + SUBJECT_BRANCH).indexOf('OVE-57') === -1, 'no OVE-57 commit');
  const farStanding = sha256(gitShow(FAR, 'src/js/standing.js'));
  T.ok('far-end native standing.js sha is 75762cb2...', farStanding.startsWith('75762cb2'), farStanding.slice(0, 12));
  T.ok('fix standing.js sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  const farPolicy = sha256(gitShow(FAR, 'scripts/policies/competent.js'));
  T.ok('far-end policy sha is a7ff5c51...', farPolicy.startsWith('a7ff5c51'), farPolicy.slice(0, 12));

  // ---- 4. Subject verification ----
  T.section('4. Subject verification — the existing branch holds exactly the four commits, with the four predicted trees');
  let subjectExists = true;
  try { git('rev-parse ' + SUBJECT_BRANCH); } catch (e) { subjectExists = false; }
  T.ok('subject branch exists', subjectExists === true, SUBJECT_BRANCH + ' present');
  T.ok('subject tip is the pick-2 commit 312647db0 (OVE-33)',
    git('rev-parse ' + SUBJECT_BRANCH) === LIVE3 && git('log -1 --format=%s ' + SUBJECT_BRANCH) === 'OVE-33: refresh stale quick proofs and fix outside-Muse fails', git('log -1 --format=%h\\ %s ' + SUBJECT_BRANCH).slice(0, 80));
  T.ok('subject tip tree is e6fab899… (the predicted pick-2-resolved tree)',
    git('rev-parse ' + SUBJECT_BRANCH + '^{tree}') === MT3RES_TREE, git('rev-parse ' + SUBJECT_BRANCH + '^{tree}').slice(0, 12));
  T.ok('subject has exactly 4 commits on top of the far end (family 14, family 12, pick 1, pick 2)',
    git('rev-list --count ' + FAR + '..' + SUBJECT_BRANCH) === '4', 'count=4');
  const subjLog = git('log --format=%H --reverse ' + FAR + '..' + SUBJECT_BRANCH).split('\n');
  T.ok('subject log oldest-first is exactly [abd8d5754, 588f054d1, e0af0163a, 312647db0]',
    JSON.stringify(subjLog) === JSON.stringify([LIVE0, LIVE1, LIVE2, LIVE3]), subjLog.map(function (h) { return h.slice(0, 9); }).join(', '));
  T.ok('pick-0 commit is abd8d5754 (family 14 merge message)',
    git('rev-parse ' + LIVE0) === LIVE0 && git('log -1 --format=%s ' + LIVE0) === 'Merge pull request #10 from steve-vitale/cursor/snippet-stage-direction-guard', git('log -1 --format=%h\\ %s ' + LIVE0).slice(0, 80));
  T.ok('pick-0 commit tree is bc52919e… (the predicted pick-0-resolved tree)',
    git('rev-parse ' + LIVE0 + '^{tree}') === MT0_TREE, git('rev-parse ' + LIVE0 + '^{tree}').slice(0, 12));
  T.ok('pick-0 commit numstat is exactly family 14 (test +21, conversation +12)',
    git('diff --numstat ' + FAR + ' ' + LIVE0).split('\n').sort().join('\n') === ['21\t0\tscripts/test-snippet-stage-direction.js', '12\t0\tsrc/js/conversation.js'].sort().join('\n'), git('diff --numstat ' + FAR + ' ' + LIVE0).replace(/\n/g, ' | '));
  T.ok('pick-1 commit is 588f054d1 (family 12 merge message)',
    git('rev-parse ' + LIVE1) === LIVE1 && git('log -1 --format=%s ' + LIVE1) === 'Merge pull request #25 from steve-vitale/cursor/dialog-residual-sampler-f726', git('log -1 --format=%h\\ %s ' + LIVE1).slice(0, 80));
  T.ok('pick-1 commit tree is e78fac42… (the predicted pick-1-resolved tree)',
    git('rev-parse ' + LIVE1 + '^{tree}') === MT1_TREE, git('rev-parse ' + LIVE1 + '^{tree}').slice(0, 12));
  T.ok('pick-1 commit numstat is exactly family 12 (test +55/-2, conversation +18/-3)',
    git('diff --numstat ' + LIVE0 + ' ' + LIVE1).split('\n').sort().join('\n') === ['55\t2\tscripts/test-snippet-stage-direction.js', '18\t3\tsrc/js/conversation.js'].sort().join('\n'), git('diff --numstat ' + LIVE0 + ' ' + LIVE1).replace(/\n/g, ' | '));
  T.ok('pick-1 commit tree equals the 12+14 subject tree (same content, same tree)',
    git('rev-parse ' + LIVE1 + '^{tree}') === git('rev-parse transplant-12-14-subject^{tree}'), 'trees match');
  T.ok('pick 1 (this arm) commit is e0af0163a (resume-offer Yes)',
    git('rev-parse ' + LIVE2) === LIVE2 && git('log -1 --format=%s ' + LIVE2) === 'Deliver unfinished thread on resume-offer Yes', git('log -1 --format=%h\\ %s ' + LIVE2).slice(0, 80));
  T.ok('pick 1 commit tree is 45f64b03… (the predicted pick-1-resolved tree)',
    git('rev-parse ' + LIVE2 + '^{tree}') === MT2_TREE, git('rev-parse ' + LIVE2 + '^{tree}').slice(0, 12));
  const pick1Files = git('diff --name-only ' + LIVE1 + ' ' + LIVE2).split('\n').sort();
  T.ok('pick 1 commit touches exactly the 3 pick-1 files (no tooling file in the commit)',
    JSON.stringify(pick1Files) === JSON.stringify(['evidence/2026-11-08/story-offer-yes-followthrough.md', 'scripts/test-story-offer-yes-20261108.js', 'src/js/conversation.js']), pick1Files.join(', '));
  T.ok('pick 1 commit numstat is exactly pick 1 (evidence +29, test +73, conversation +46/-4)',
    git('diff --numstat ' + LIVE1 + ' ' + LIVE2).split('\n').sort().join('\n') === ['29\t0\tevidence/2026-11-08/story-offer-yes-followthrough.md', '73\t0\tscripts/test-story-offer-yes-20261108.js', '46\t4\tsrc/js/conversation.js'].sort().join('\n'), git('diff --numstat ' + LIVE1 + ' ' + LIVE2).replace(/\n/g, ' | '));
  T.ok('pick 2 (this arm) commit is 312647db0 (OVE-33)',
    git('rev-parse ' + LIVE3) === LIVE3 && git('log -1 --format=%s ' + LIVE3) === 'OVE-33: refresh stale quick proofs and fix outside-Muse fails', git('log -1 --format=%h\\ %s ' + LIVE3).slice(0, 80));
  const pick2Files = git('diff --name-only ' + LIVE2 + ' ' + LIVE3).split('\n').sort();
  T.ok('pick 2 commit touches exactly pick 2 MINUS the two tooling files (10 files)',
    JSON.stringify(pick2Files) === JSON.stringify(['evidence/2026-11-08/neutral-ove33-master-quick.json.gz', 'evidence/2026-11-08/phone-ove33-frame-736-r1.json', 'evidence/2026-11-08/phone-ove33-frame-844-r1.json', 'scripts/godpath/test-mobile-combat-cadence.js', 'scripts/godpath/test-occupation-panels.js', 'scripts/godpath/test-time-save-crashes.js', 'scripts/test-establishment-r20-fixes-20261020.js', 'scripts/test-snippet-stage-direction.js', 'src/js/conversation.js', 'sw.js']), pick2Files.join(', '));
  T.ok('the pick-2 commit does NOT touch balance-proof.json (resolved --ours, dropped from the commit)',
    git('diff --name-only ' + LIVE2 + ' ' + LIVE3 + ' -- scripts/balance-proof.json') === '', '(absent)');
  T.ok('the pick-2 commit does NOT touch phone-frame-proof.json (resolved --ours, dropped from the commit)',
    git('diff --name-only ' + LIVE2 + ' ' + LIVE3 + ' -- scripts/phone-frame-proof.json') === '', '(absent)');
  T.ok('subject balance-proof blob is the OURS blob d0c6a42f (far-end version)',
    git('ls-tree ' + SUBJECT_BRANCH + ' -- scripts/balance-proof.json').indexOf(BAL_OURS_BLOB) !== -1, 'balance-proof blob = ours');
  T.ok('subject phone-frame-proof blob is the OURS blob b0691014 (far-end version)',
    git('ls-tree ' + SUBJECT_BRANCH + ' -- scripts/phone-frame-proof.json').indexOf(PHONE_OURS_BLOB) !== -1, 'phone-frame-proof blob = ours');
  T.ok('subject balance-proof blob equals the FAR-END blob (byte-identical)',
    git('ls-tree ' + FAR + ' -- scripts/balance-proof.json').indexOf(BAL_OURS_BLOB) !== -1, 'balance-proof = far end');
  T.ok('subject phone-frame-proof blob equals the FAR-END blob (byte-identical)',
    git('ls-tree ' + FAR + ' -- scripts/phone-frame-proof.json').indexOf(PHONE_OURS_BLOB) !== -1, 'phone-frame-proof = far end');
  T.ok('subject diff vs far end is exactly picks 0-3 net on src/js (conversation.js 77/4; no other src/js file)',
    git('diff --numstat ' + FAR + ' ' + SUBJECT_BRANCH + ' -- src/js') === '77\t4\tsrc/js/conversation.js', git('diff --numstat ' + FAR + ' ' + SUBJECT_BRANCH + ' -- src/js').replace(/\n/g, ' | '));
  T.ok('subject test-snippet-stage-direction.js is 78/0 vs the far end',
    git('diff --numstat ' + FAR + ' ' + SUBJECT_BRANCH + ' -- scripts/test-snippet-stage-direction.js') === '78\t0\tscripts/test-snippet-stage-direction.js', git('diff --numstat ' + FAR + ' ' + SUBJECT_BRANCH + ' -- scripts/test-snippet-stage-direction.js'));
  T.ok('villager-objectives.js is byte-identical between the far end and the subject (no pick in this unit touches it)',
    git('diff --stat ' + FAR + ' ' + SUBJECT_BRANCH + ' -- src/js/villager-objectives.js') === '', 'identical');
  T.ok('green-list.txt is byte-identical between the far end and the subject',
    git('diff --stat ' + FAR + ' ' + SUBJECT_BRANCH + ' -- scripts/green-list.txt') === '', 'identical');
  T.ok('subject conversation.js carries the OVE-33 quote check (if (/"/.test(s)) return false;)',
    gitShow(LIVE3, 'src/js/conversation.js').indexOf('if (/"/.test(s)) return false;') !== -1, 'quote check present');
  T.ok('subject test file carries the OVE-33 assertions ("They go still.")',
    gitShow(LIVE3, 'scripts/test-snippet-stage-direction.js').indexOf('They go still.') !== -1, 'OVE-33 assertions present');
  T.ok('subject conversation.js carries the resume-offer tagging (resumeOffer)',
    gitShow(LIVE3, 'src/js/conversation.js').indexOf('resumeOffer') !== -1, 'resumeOffer present');

  // ---- 5. Merge-tree pre-check re-run ----
  T.section('5. Merge-tree pre-check re-run — picks 0-1 clean, pick 2 (this arm\'s pick 1) clean, pick 2 tooling-only');
  const mt0 = mergeTree(FIRST14, FAR, FAM14);
  T.ok('pick 0 merge-tree rc=0 (clean)', mt0.rc === 0, 'rc=' + mt0.rc);
  T.ok('pick 0 merge-tree tree is bc52919e… (the 12+14 prediction, reproduced)', mt0.tree === MT0_TREE, mt0.tree.slice(0, 12));
  T.ok('pick 0 merge-tree conflicts NOTHING', JSON.stringify(mt0.conflicted) === JSON.stringify([]), mt0.conflicted.join(', ') || '(none)');
  T.ok('tooling-resolution rule maps the pick-0 conflict set to NO-CONFLICT',
    resolveTooling(mt0.conflicted) === 'NO-CONFLICT', resolveTooling(mt0.conflicted));
  T.ok('prediction commit d632a89b carries the predicted tree with parent = far end',
    git('rev-parse ' + PRED0_COMMIT + '^{tree}') === MT0_TREE && git('rev-parse ' + PRED0_COMMIT + '^1') === git('rev-parse ' + FAR), 'tree+parent ok');
  const pred0Numstat = git('diff --numstat ' + FAR + ' ' + MT0_TREE);
  T.ok('predicted pick-0-resolved tree diff vs far end is exactly family 14 (2 files, +33)',
    pred0Numstat.split('\n').sort().join('\n') === ['21\t0\tscripts/test-snippet-stage-direction.js', '12\t0\tsrc/js/conversation.js'].sort().join('\n'), pred0Numstat.replace(/\n/g, ' | '));
  const mt1 = mergeTree(FIRST12, PRED0_COMMIT, FAM12);
  T.ok('pick 1 merge-tree rc=0 (clean)', mt1.rc === 0, 'rc=' + mt1.rc);
  T.ok('pick 1 merge-tree tree is e78fac42… (the 12+14 prediction, reproduced)', mt1.tree === MT1_TREE, mt1.tree.slice(0, 12));
  T.ok('pick 1 merge-tree conflicts NOTHING', JSON.stringify(mt1.conflicted) === JSON.stringify([]), mt1.conflicted.join(', ') || '(none)');
  T.ok('tooling-resolution rule maps the pick-1 conflict set to NO-CONFLICT',
    resolveTooling(mt1.conflicted) === 'NO-CONFLICT', resolveTooling(mt1.conflicted));
  T.ok('prediction commit 4566f962 carries the predicted tree with parent = predicted pick-0 commit',
    git('rev-parse ' + PRED1_COMMIT + '^{tree}') === MT1_TREE && git('rev-parse ' + PRED1_COMMIT + '^1') === PRED0_COMMIT, 'tree+parent ok');
  const pred1Numstat = git('diff --numstat ' + MT0_TREE + ' ' + MT1_TREE);
  T.ok('predicted pick-1-resolved tree diff vs pick-0 tree is exactly family 12 (2 files, +73/-5)',
    pred1Numstat.split('\n').sort().join('\n') === ['55\t2\tscripts/test-snippet-stage-direction.js', '18\t3\tsrc/js/conversation.js'].sort().join('\n'), pred1Numstat.replace(/\n/g, ' | '));
  const mt2 = mergeTree(FIRST1, PRED1_COMMIT, PICK1);
  T.ok('pick 1 (this arm) merge-tree rc=0 (clean)', mt2.rc === 0, 'rc=' + mt2.rc);
  T.ok('pick 1 merge-tree tree is 45f64b03…', mt2.tree === MT2_TREE, mt2.tree.slice(0, 12));
  T.ok('pick 1 merge-tree conflicts NOTHING', JSON.stringify(mt2.conflicted) === JSON.stringify([]), mt2.conflicted.join(', ') || '(none)');
  T.ok('tooling-resolution rule maps the pick-1 conflict set to NO-CONFLICT',
    resolveTooling(mt2.conflicted) === 'NO-CONFLICT', resolveTooling(mt2.conflicted));
  T.ok('prediction commit 6f389c10 carries the predicted tree with parent = predicted pick-1 commit',
    git('rev-parse ' + PRED2_COMMIT + '^{tree}') === MT2_TREE && git('rev-parse ' + PRED2_COMMIT + '^1') === PRED1_COMMIT, 'tree+parent ok');
  const pred2Numstat = git('diff --numstat ' + MT1_TREE + ' ' + MT2_TREE);
  T.ok('predicted pick-1-resolved tree diff vs pick-1 tree is exactly pick 1 (3 files, +148/-4)',
    pred2Numstat.split('\n').sort().join('\n') === ['29\t0\tevidence/2026-11-08/story-offer-yes-followthrough.md', '73\t0\tscripts/test-story-offer-yes-20261108.js', '46\t4\tsrc/js/conversation.js'].sort().join('\n'), pred2Numstat.replace(/\n/g, ' | '));
  const mt3 = mergeTree(FIRST2, PRED2_COMMIT, PICK2);
  T.ok('pick 2 (this arm) merge-tree rc=1 (conflict)', mt3.rc === 1, 'rc=' + mt3.rc);
  T.ok('pick 2 merge-tree tree is 9f0ee83b…', mt3.tree === MT3_TREE, mt3.tree.slice(0, 12));
  T.ok('pick 2 merge-tree conflicts EXACTLY [balance-proof.json, phone-frame-proof.json] (tooling-only)',
    JSON.stringify(mt3.conflicted) === JSON.stringify(['scripts/balance-proof.json', 'scripts/phone-frame-proof.json']), mt3.conflicted.join(', '));
  T.ok('pick 2 merge-tree conflicts NO src/js file (conversation.js merges clean)',
    mt3.conflicted.indexOf('src/js/conversation.js') === -1, 'no src/js conflict');
  T.ok('pick 2 merge-tree conflicts NO test file (test-snippet-stage-direction.js merges clean)',
    mt3.conflicted.indexOf('scripts/test-snippet-stage-direction.js') === -1, 'no test conflict');
  T.ok('tooling-resolution rule maps the pick-2 conflict set to CONTINUE-OURS',
    resolveTooling(mt3.conflicted) === 'CONTINUE-OURS', resolveTooling(mt3.conflicted));
  const mt3Bal = gitShow(MT3_TREE, 'scripts/balance-proof.json').split('\n');
  T.ok('pick-2 merged tree carries balance-proof markers at lines 3/6/9',
    mt3Bal[2].indexOf('<<<<<<<') === 0 && mt3Bal[5].indexOf('=======') === 0 && mt3Bal[8].indexOf('>>>>>>>') === 0, 'markers at 3/6/9');
  const mt3Phone = gitShow(MT3_TREE, 'scripts/phone-frame-proof.json').split('\n');
  T.ok('pick-2 merged tree carries phone-frame-proof markers at lines 7/15/23 and 81/91/101',
    mt3Phone[6].indexOf('<<<<<<<') === 0 && mt3Phone[14].indexOf('=======') === 0 && mt3Phone[22].indexOf('>>>>>>>') === 0 &&
    mt3Phone[80].indexOf('<<<<<<<') === 0 && mt3Phone[90].indexOf('=======') === 0 && mt3Phone[100].indexOf('>>>>>>>') === 0, 'markers at 7/15/23 + 81/91/101');
  T.ok('pick-2 conflicted tree conversation.js already carries the OVE-33 quote check (game-code hunk merged)',
    gitShow(MT3_TREE, 'src/js/conversation.js').indexOf('if (/"/.test(s)) return false;') !== -1, 'quote check merged');
  T.ok('pick-2 conflicted tree test file already carries the OVE-33 assertions ("They go still.")',
    gitShow(MT3_TREE, 'scripts/test-snippet-stage-direction.js').indexOf('They go still.') !== -1, 'OVE-33 assertions merged');
  T.ok('pick-2-resolved tree e6fab899… carries the OURS balance-proof blob (d0c6a42f)',
    git('ls-tree ' + MT3RES_TREE + ' -- scripts/balance-proof.json').indexOf(BAL_OURS_BLOB) !== -1, 'balance-proof blob = ours');
  T.ok('pick-2-resolved tree e6fab899… carries the OURS phone-frame-proof blob (b0691014)',
    git('ls-tree ' + MT3RES_TREE + ' -- scripts/phone-frame-proof.json').indexOf(PHONE_OURS_BLOB) !== -1, 'phone-frame-proof blob = ours');
  T.ok('the OURS balance-proof blob equals the FAR-END blob (far-end version kept byte-identical)',
    git('ls-tree ' + FAR + ' -- scripts/balance-proof.json').indexOf(BAL_OURS_BLOB) !== -1, 'balance-proof = far end');
  T.ok('the OURS phone-frame-proof blob equals the FAR-END blob (far-end version kept byte-identical)',
    git('ls-tree ' + FAR + ' -- scripts/phone-frame-proof.json').indexOf(PHONE_OURS_BLOB) !== -1, 'phone-frame-proof = far end');
  T.ok('prediction commit a7180fc9 carries the predicted pick-2-resolved tree with parent = predicted pick-1 commit',
    git('rev-parse ' + PRED3_COMMIT + '^{tree}') === MT3RES_TREE && git('rev-parse ' + PRED3_COMMIT + '^1') === PRED2_COMMIT, 'tree+parent ok');
  const pred3Numstat = git('diff --numstat ' + MT2_TREE + ' ' + MT3RES_TREE);
  T.ok('predicted pick-2-resolved tree diff vs pick-1 tree is exactly pick 2 MINUS the two tooling files',
    pred3Numstat.split('\n').filter(function (ln) { return ln.indexOf('.gz') === -1; }).sort().join('\n') ===
    ['2585\t0\tevidence/2026-11-08/phone-ove33-frame-736-r1.json', '2686\t0\tevidence/2026-11-08/phone-ove33-frame-844-r1.json', '4\t0\tscripts/godpath/test-mobile-combat-cadence.js', '1\t1\tscripts/godpath/test-occupation-panels.js', '3\t2\tscripts/godpath/test-time-save-crashes.js', '3\t0\tscripts/test-establishment-r20-fixes-20261020.js', '4\t0\tscripts/test-snippet-stage-direction.js', '4\t0\tsrc/js/conversation.js', '1\t0\tsw.js'].sort().join('\n'), pred3Numstat.replace(/\n/g, ' | '));
  const mtBrief = mergeTree(MERGEBASE, FAR, FAM14);
  T.ok('brief-base artifact: merge-base d229b58f5 as base gives rc=1 (drift, not a family conflict)',
    mtBrief.rc === 1, 'rc=' + mtBrief.rc);
  T.ok('brief-base artifact tree is 015568e3… (short-FAR spelling, as the prior arms ran it)',
    mtBrief.tree === BRIEF_BASE_TREE, mtBrief.tree.slice(0, 12));
  T.ok('brief-base artifact conflicts EXACTLY [balance-proof.json, green-list.txt] (cumulative-line drift)',
    JSON.stringify(mtBrief.conflicted) === JSON.stringify(['scripts/balance-proof.json', 'scripts/green-list.txt']), mtBrief.conflicted.join(', '));

  // ---- 6. Pick-1 + pick-2 mechanisms ----
  T.section('6. Pick-1 + pick-2 mechanisms — resume-offer tagging; OVE-33 unblocked by the family-12 widening');
  T.ok('7688cb7a4 (family 14, PR #10) IS an ancestor of pick 2\'s first parent',
    isAncestor(FAM14, FIRST2), 'ancestor of c32ff6fa8');
  T.ok('ac119e4ed (family 12, PR #25) IS an ancestor of pick 2\'s first parent',
    isAncestor(FAM12, FIRST2), 'ancestor of c32ff6fa8');
  T.ok('ac119e4ed (family 12, PR #25) is NOT an ancestor of the far end',
    isAncestor(FAM12, FAR) === false, 'not ancestor of 203a32775');
  T.ok('"convoSnippetIsStageDirection" has 0 hits at the far end', grepCount(FAR, 'convoSnippetIsStageDirection', 'src/js/conversation.js') === 0, 'far=0');
  T.ok('"convoSnippetIsStageDirection" has 3 hits at the predicted pick-1 tree (guard + widening present)',
    grepCount(PRED2_COMMIT, 'convoSnippetIsStageDirection', 'src/js/conversation.js') === 3, 'pred=3');
  const pred2Conv = gitShow(MT2_TREE, 'src/js/conversation.js');
  const base2Conv = gitShow(FIRST2, 'src/js/conversation.js');
  T.ok('predicted pick-1 tree carries the WIDENED anchor (const s = String(sn).trim().replace, 1 hit)',
    countIn(pred2Conv, 'const s = String(sn).trim().replace') === 1, 'wide anchor present');
  T.ok('predicted pick-1 tree does NOT carry the narrow anchor',
    countIn(pred2Conv, 'const s = String(sn).trim();') === 0, 'narrow anchor absent');
  T.ok('pick 2\'s base carries the WIDENED anchor (1 hit)',
    countIn(base2Conv, 'const s = String(sn).trim().replace') === 1, 'wide anchor present at base');
  const pred2TestLines = gitShow(MT2_TREE, 'scripts/test-snippet-stage-direction.js').split('\n').length;
  const base2TestLines = gitShow(FIRST2, 'scripts/test-snippet-stage-direction.js').split('\n').length;
  T.ok('predicted pick-1 test file is 74 lines (family 12 widened it)', pred2TestLines === 75, 'lines=' + pred2TestLines + ' (74 + trailing newline)');
  T.ok('pick 2\'s base test file is 74 lines (insertion context now matches)', base2TestLines === 75, 'lines=' + base2TestLines + ' (74 + trailing newline)');
  T.ok('pick 1 IS an ancestor of pick 2\'s first parent',
    isAncestor(PICK1, FIRST2), 'ancestor of c32ff6fa8');
  T.ok('"objCommitGuardOffer" has 0 hits at the far end (Phase 4 form absent — the OVE-57 dependency is not in this unit)',
    grepCount(FAR, 'objCommitGuardOffer', 'src/js/villager-objectives.js') === 0, 'far=0');
  T.ok('"objCommitGuardOffer" has 0 hits on the subject (this unit never touches villager-objectives.js)',
    grepCount(SUBJECT_BRANCH, 'objCommitGuardOffer', 'src/js/villager-objectives.js') === 0, 'subject=0');

  // ---- 7. Family content ----
  T.section('7. Family content — guard, widening, resume repair, OVE-33 quote check; no lever numbers changed');
  const conv14 = gitShow(FAM14, 'src/js/conversation.js');
  T.ok('family 14 adds convoSnippetIsStageDirection (the guard function)',
    conv14.indexOf('convoSnippetIsStageDirection(sn)') !== -1, 'guard present at the merge');
  T.ok('family 14 guard rejects stage-direction snippets ("Still on what they confided")',
    conv14.indexOf('Still on what they confided') !== -1, 'stage-direction pattern present');
  const test14 = gitShow(FAM14, 'scripts/test-snippet-stage-direction.js');
  T.ok('family 14 test asserts the guard (They glance at the fire is stage direction)',
    test14.indexOf("G.convoSnippetIsStageDirection('They glance at the fire, then back.')") !== -1, 'guard assertion present');
  const conv12 = gitShow(FAM12, 'src/js/conversation.js');
  T.ok('family 12 adds the quote-strip anchor (const s = String(sn).trim().replace)',
    conv12.indexOf('const s = String(sn).trim().replace') !== -1, 'quote-strip present');
  T.ok('family 12 widens the guard to warm silence ("You say nothing")',
    conv12.indexOf('You say nothing') !== -1, 'warm-silence pattern present');
  T.ok('family 12 widens the guard to recap scaffolding ("Say it plain")',
    conv12.indexOf('Say it plain') !== -1, 'recap pattern present');
  T.ok('family 12 adds the party-join assent guard in convoSnippetIsRealBeat ("had better be worth it")',
    conv12.indexOf('had better be worth it') !== -1, 'party-join assent guard present');
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
  for (const pair of [[FAM14, 'family 14'], [FAM12, 'family 12'], [PICK1, 'pick 1'], [PICK2, 'pick 2']]) {
    const diffJs = execSync('git diff ' + pair[0] + '^1 ' + pair[0] + ' -- src/js', { cwd: REPO, stdio: 'pipe' }).toString('utf8');
    const changedJs = diffJs.split('\n').filter(function (ln) {
      return (ln[0] === '+' || ln[0] === '-') && ln.slice(0, 3) !== '+++' && ln.slice(0, 3) !== '---';
    }).join('\n');
    T.ok(pair[1] + ' changed lines touch no damage/armor/spawn/food-yield/spoilage identifier',
      ['damage', 'armor', 'spawnMonster', 'foodYield', 'spoilage'].every(function (w) { return changedJs.indexOf(w) === -1; }), 'no lever identifiers');
    T.ok(pair[1] + ' changed lines touch no wave/table gate (no wave5, deedGate, table-price hunk)',
      changedJs.indexOf('wave5') === -1 && changedJs.indexOf('deedGate') === -1, 'no gate identifiers');
  }

  // ---- 8. Verdict mapping + tooling-resolution rule ----
  T.section('8. Verdict mapping — unit thresholds + tooling-resolution rule');
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
  T.ok('resolution rule: balance-proof.json + villager-objectives.js -> UNMEASURED (STOP)',
    resolveTooling(['scripts/balance-proof.json', 'src/js/villager-objectives.js']) === 'UNMEASURED', resolveTooling(['scripts/balance-proof.json', 'src/js/villager-objectives.js']));
  T.ok('resolution rule: a test file -> UNMEASURED',
    resolveTooling(['scripts/test-snippet-stage-direction.js']) === 'UNMEASURED', resolveTooling(['scripts/test-snippet-stage-direction.js']));
  T.ok('resolution rule: a docs file -> UNMEASURED',
    resolveTooling(['docs/ONTOLOGY.md']) === 'UNMEASURED', resolveTooling(['docs/ONTOLOGY.md']));

  // ---- 9. Prereg recorded in the evidence file ----
  T.section('9. Prereg recorded in the evidence file');
  const evPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15e-p12-prereg.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('prereg file exists', ev.length > 0, evPath);
  T.ok('prereg names family 14 merge 7688cb7a4 (PR #10)', ev.indexOf('7688cb7a4') !== -1, 'family 14 present');
  T.ok('prereg names family 12 merge ac119e4ed (PR #25)', ev.indexOf('ac119e4ed') !== -1, 'family 12 present');
  T.ok('prereg names pick bb6a301cf (resume-offer Yes)', ev.indexOf('bb6a301cf') !== -1, 'pick 1 present');
  T.ok('prereg names pick 7041e1bfb (OVE-33)', ev.indexOf('7041e1bfb') !== -1, 'pick 2 present');
  T.ok('prereg names pick 4a1c77cf1 (OVE-57) as NOT in the subject', ev.indexOf('4a1c77cf1') !== -1 && ev.indexOf('NOT in the subject') !== -1, 'pick 4 exclusion present');
  T.ok('prereg names the far end 203a32775', ev.indexOf('203a32775') !== -1, 'far end present');
  T.ok('prereg names the band 190391-190398', ev.indexOf('190391') !== -1 && ev.indexOf('190398') !== -1, 'band present');
  T.ok('prereg names the STEP id t15e-p12', ev.indexOf('t15e-p12') !== -1, 'STEP present');
  T.ok('prereg names the subject branch transplant-15e-1412-subject at 312647db0', ev.indexOf('transplant-15e-1412-subject') !== -1 && ev.indexOf('312647db0') !== -1, 'subject present');
  T.ok('prereg records the thresholds (CARRIER <=1/8, AMBIGUOUS 2/8, NOT-CARRIER >=3/8)',
    ev.indexOf('CARRIER') !== -1 && ev.indexOf('AMBIGUOUS') !== -1 && ev.indexOf('NOT-CARRIER') !== -1, 'thresholds present');
  T.ok('prereg records the subject verification (trees bc52919e / e78fac42 / 45f64b03 / e6fab899)',
    ev.indexOf('bc52919e') !== -1 && ev.indexOf('e78fac42') !== -1 && ev.indexOf('45f64b03') !== -1 && ev.indexOf('e6fab899') !== -1, 'trees present');
  T.ok('prereg records the subject is verified, NOT rebuilt (Do NOT rebuild)',
    ev.indexOf('Do NOT rebuild') !== -1, 'verify-not-rebuild present');
  T.ok('prereg records the base exoneration (family 14 NOT-CARRIER 4/8; 12+14 NOT-CARRIER 4/8)',
    ev.indexOf('Base exoneration') !== -1 && ev.indexOf('sim-transplant14.md') !== -1 && ev.indexOf('sim-transplant12-14.md') !== -1, 'exoneration present');
  T.ok('prereg records the prior arm outcome (UNMEASURED-BY-CONFLICT at pick 4, STEP t15e-on1412 never ran)',
    ev.indexOf('UNMEASURED-BY-CONFLICT') !== -1 && ev.indexOf('t15e-on1412') !== -1, 'prior outcome present');
  T.ok('prereg records candidate (c) (measure picks 2+3 / picks 1+2)',
    ev.indexOf('candidate (c)') !== -1, 'candidate (c) present');
  T.ok('prereg records the coordinator tooling-resolution rule (decided 2026-11-14 ~10:00Z)',
    ev.indexOf('TOOLING-RESOLUTION RULE') !== -1 && ev.indexOf('checkout --ours') !== -1, 'tooling rule present');
  T.ok('prereg records the pick-2 merge-tree prediction (rc=1, tree 9f0ee83b, tooling-only)',
    ev.indexOf('9f0ee83b') !== -1 && ev.indexOf('tooling-only') !== -1, 'pick-2 prediction present');
  T.ok('prereg records the pick-2-resolved tree e6fab899 and prediction commit a7180fc9',
    ev.indexOf('e6fab899') !== -1 && ev.indexOf('a7180fc9') !== -1, 'pick-2-resolved present');
  T.ok('prereg records the pick-2 mechanism (family 12 widening, markers 3/6/9)',
    ev.indexOf('Pick-2 mechanism') !== -1 && ev.indexOf('3/6/9') !== -1, 'pick-2 mechanism present');
  T.ok('prereg records the grouping authority (§15E)', ev.indexOf('family15-grouping-prereg-2026-11-14.md') !== -1, 'authority present');
  T.ok('prereg records the canon note (CONVERSATIONS.md; no standalone OVE-33 doc)',
    ev.indexOf('CONVERSATIONS.md') !== -1, 'canon note present');
  T.ok('prereg records the horizon 150d death-aware', ev.indexOf('150d') !== -1, 'horizon present');
  T.ok('prereg records the competent verbatim own-policy', ev.indexOf('competent') !== -1, 'policy present');
  T.ok('prereg records the ordering note (pre-check re-ran during prereg preparation, subject already exists)',
    ev.indexOf('Ordering note') !== -1, 'ordering note present');
  T.ok('prereg records the seed-band freshness note (75 preregs, reused by design)',
    ev.indexOf('75 preregs') !== -1 && ev.indexOf('reused BY DESIGN') !== -1, 'seed-band note present');
  T.ok('prereg records the resolutions (pick 2 tooling files, checkout --ours, byte-identical to the far end)',
    ev.indexOf('Resolutions recorded') !== -1 && ev.indexOf('d0c6a42f') !== -1 && ev.indexOf('b0691014') !== -1, 'resolutions present');
  T.ok('prereg records that no cherry-pick is performed by this arm (STOP clause not applicable)',
    ev.indexOf('no cherry-pick is performed') !== -1, 'no-pick note present');

  // ---- 10. Base state ----
  T.section('10. Base state — arm branch clean, subject verified, sim not run');
  const headBranch = git('rev-parse --abbrev-ref HEAD');
  // worktreeOnly: branch-identity legs are meaningful only in the
  // worker tree. On merged master HEAD is 'master' by design (the
  // arm branch is deleted after landing) — the leg passes there
  // vacuously instead of failing, so the proof stays green on master
  // (0215Z lesson). Prereg-commit ancestry legs resolve by
  // message/subject, not hash (0608Z lesson: an adoption rebase
  // rewrites hashes).
  const worktreeOnly = function (cond) { return cond || headBranch === 'master'; };
  T.ok('HEAD is on the arm branch sim-transplant15e-p12-a (worktree-only)', worktreeOnly(headBranch === 'sim-transplant15e-p12-a'), 'HEAD=' + headBranch);
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
  let cherryPickHead = true;
  try { execSync('git rev-parse --verify CHERRY_PICK_HEAD', { cwd: REPO, stdio: 'pipe' }); } catch (e) { cherryPickHead = false; }
  T.ok('no cherry-pick is in progress', cherryPickHead === false, 'CHERRY_PICK_HEAD absent');
  const tSummary = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  T.ok('no step summary exists for t15e-p12 (no judged sim ran)', fs.existsSync(tSummary) === false, STEP);
  const tDriver = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  T.ok('no step driver log exists for t15e-p12 (no judged sim ran)', fs.existsSync(tDriver) === false, STEP);
  const corpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  T.ok('no step corpus exists for t15e-p12 (no judged sim ran)', fs.existsSync(corpusDir) === false, STEP);
  const dirtyTracked = git('diff --name-only HEAD');
  const allowed = ['scripts/test-transplant15e-p12-a.js', 'evidence/2026-11-14/sim-transplant15e-p12-prereg.md', 'evidence/2026-11-14/sim-transplant15e-p12.md'];
  const dirtyOther = dirtyTracked.split('\n').filter(function (ln) {
    return ln && !allowed.some(function (a) { return ln === a; });
  }).join('\n');
  T.ok('tracked tree is clean apart from this proof + the prereg + the evidence file (uncommitted until this proof passes)', dirtyOther === '', dirtyOther.slice(0, 200) || '(only allowed files)');

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
