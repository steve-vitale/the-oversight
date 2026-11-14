#!/usr/bin/env node
// test-transplant15e-p23-a.js — proof test for the H1 TRANSPLANT,
// family 15E picks 2+3 TOGETHER on the 14+12 base, pick 3 narrowed
// to its conversation.js half (resume / conversation repair, arm
// sim-transplant15e-p23-a).
//
// THE QUESTION (evidence/2026-11-14/sim-transplant15e-p23-prereg.md,
// prereg committed before the subject was cut or any judged sim
// ran): land pick 2 (7041e1bfb, OVE-33) whole and pick 3
// (4a1c77cf1, OVE-57) narrowed to its conversation.js half onto
// the 14+12 base (transplant-12-14-subject c8655548f — far end
// 203a32775 + family 14 + family 12, MEASURED NOT-CARRIER as a
// pair) and judge the interaction of the OVE-33 quote check with
// the OVE-57 trader-intro repair — the one combination the prior
// arms never measured (pick 1 alone: NOT-CARRIER 4/8; picks 1+2
// on 14+12: NOT-CARRIER 4/8; narrowed pick-3-conversation alone
// on the bare far end: NOT-CARRIER 4/8, seed-for-seed identical).
// Pick 3's villager-objectives.js half stays UNMEASURED: it is
// written against Phase 4 villager-objectives.js content the far
// end never had (proven live by the 15E-on-14+12 arm,
// evidence/2026-11-14/sim-transplant15e-1412.md — conflict on
// exactly balance-proof.json + villager-objectives.js, same marker
// lines; its conversation.js half merges clean). The objectives
// half stays UNMEASURED. Coordinator decision: the picks-2+3
// route (1412 evidence candidate (c)) with the p3conv narrowing
// precedent for pick 3.
// Grouping prereg: hidden_files/family15-grouping-prereg-2026-11-14.md
// §15E. Binding prereg: sim-scale-onramp-round-2115.md §3.
//
// NARROWING RULE (coordinator-decided, binding for this arm):
// pick 2 may conflict ONLY on the two predicted tooling files
// (scripts/balance-proof.json, scripts/phone-frame-proof.json,
// each resolved --ours). Pick 3 may conflict ONLY on the two
// predicted files (scripts/balance-proof.json, tooling, resolved
// --ours; src/js/villager-objectives.js, game code, DROPPED by
// coordinator decision and restored byte-identical to the pick-2
// tree, NOT hand-resolved). If src/js/conversation.js does NOT
// merge clean on either pick, STOP as UNMEASURED-BY-CONFLICT. Any
// conflict on any OTHER file likewise STOPS the arm. The proof
// MUST assert: (1) the subject's game-code diff equals EXACTLY
// picks 2+3's game-code diff MINUS the dropped objectives hunk,
// (2) villager-objectives.js is byte-identical to the 14+12 base,
// (3) balance-proof.json and phone-frame-proof.json are
// byte-identical to the 14+12 base.
//
// STAGE 1 (this file as committed with the prereg) proves:
//   1. Pick 2 identity — hash, subject, first parent, single
//      parent (standalone, not a merge), exact numstats, no
//      standing.js, no policy file, evidence receipt is a NEW
//      binary (absent at the pick's first parent and at the base).
//   2. Pick 3 identity — hash, subject, first parent, single
//      parent, exact numstats, no standing.js, no policy file,
//      evidence receipt is a NEW binary (absent at the base).
//   3. Base identity — the 14+12 subject branch exists at
//      c8655548f, tree e78fac42…, its log is the two merges on
//      the far end, the far end is its ancestor, far-end
//      standing/policy shas.
//   4. Merge-tree pre-check, pick 2 — rc=1, tree 4111ed85…,
//      conflicted files EXACTLY [scripts/balance-proof.json,
//      scripts/phone-frame-proof.json] (conversation.js,
//      test-snippet-stage-direction.js and sw.js auto-merged
//      clean); marker lines 3/6/9 and 7/15/23 + 81/91/101 (the
//      same files and lines the 1412 arm's pick-3 prediction
//      named); predicted pick-2-resolved tree 35857b15… (prediction
//      commit 2263a1c3, parent = the 14+12 base), whose diff vs
//      the base is exactly pick 2 minus the two tooling files
//      (10 files).
//   5. Merge-tree pre-check, pick 3 — rc=1, tree 3ba598f9…,
//      conflicted files EXACTLY [scripts/balance-proof.json,
//      src/js/villager-objectives.js] (conversation.js auto-merged
//      clean, blob c816f9a2…); marker lines 3/6/9 and 23/25/29 +
//      957/972/1039 (the same files and lines the 1412 arm's
//      pick-4 prediction and the p3conv pre-check named);
//      predicted narrowed-subject tree 1c6c8954… (prediction commit
//      c19aad22, parent = the 14+12 base), whose diff vs the base
//      is exactly conversation.js +25/-2 and the pick-2 files.
//   6. Pick mechanisms — the family-12-widened quote-strip
//      anchor is present on the 14+12 base (1 hit) so pick 2's
//      hunk lands; objCommitGuardOffer has 5 hits at pick 3's
//      base and 0 at the far end and 0 at the 14+12 base (Phase 4
//      dependency); tradeIntroDeferred has 3 hits in pick 3 and
//      0 at the base.
//   7. Family content — the OVE-33 quote check and the OVE-57
//      deferred trader intro in the conversation.js hunks; the
//      rally-volunteer / objCommitGuardOffer in the (dropped)
//      objectives hunk; no numbers moved.
//   8. Verdict mapping + narrowing rules — classifyTransplant
//      maps every survived count; resolveTooling maps the exact
//      predicted two-tooling-file set to TOOLING-CONTINUE and any
//      other conflicted file to UNMEASURED; resolveNarrowed maps
//      the exact predicted two-file set to NARROWED-CONTINUE and
//      any other conflicted file (including conversation.js) to
//      UNMEASURED.
//   9. Prereg recorded in the evidence file (base, picks, seeds,
//      horizon, policy, STEP id, thresholds, STOP clause,
//      narrowing decision, subject branch name, merge-tree
//      predictions, mechanisms, ordering note, seed-band freshness
//      note).
//  10. Base state — HEAD is on sim-transplant15e-p23-a, no
//      src/js file differs from HEAD, on-disk standing.js is
//      byte-identical to HEAD, the step-script tooling source
//      (master) still carries all four scratch files; the step
//      script names the band 190391-190398; the subject branch
//      does NOT exist yet (stage 1 — rewritten in stage 2 once
//      the subject is cut); no STEP t15e-p23 summary/driver
//      log/corpus exists; no cherry-pick is in progress.
// STAGE 2 (appended after the live picks + judged step) proves:
//  11. Live picks apply with exactly the predicted conflicts;
//      both tooling files resolved --ours; the objectives file
//      dropped --ours; the evidence receipt is absent from the
//      subject; the subject tree equals the predicted tree
//      1c6c8954…; the subject diff vs the 14+12 base is exactly
//      the predicted 10 files; villager-objectives.js,
//      balance-proof.json and phone-frame-proof.json are
//      byte-identical to the base.
//  12. The step verdict (survived/8, per-seed days, wave-5,
//      median, death causes) and the evidence file records it,
//      the subject hash, the telemetry refusal, and the
//      unmeasured-objectives note.
//
// Usage: node scripts/test-transplant15e-p23-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant15e-p23-a');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const BASE = 'c8655548f4be892c7722f2bbb46910c3c7262d5c';
const BASE_TREE = 'e78fac42d89e811f6bfce981b7274e5ee3c5c014';
const PICK2 = '7041e1bfb7e8b69387bd3203a58eed00115ec8d7';
const FIRST2 = 'c32ff6fa804f7ca54e4f2a03a71e3af4f0dbf212';
const PICK3 = '4a1c77cf10733b28e3bc7bc7f3fe47880d6ecc24';
const FIRST3 = '134a3d0ab161d4dcf96616c3bcf4940d6a5dd2fc';
const MERGEBASE = 'd229b58f595430e2a24c399820061b39c5b689ca';
const SUBJECT_BRANCH = 'transplant-15e-p23-subject';
const STEP = 't15e-p23';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
// Merge-tree prediction (pick 2 on the 14+12 base).
const MT2_TREE = '4111ed85351a31a1ebc0da371da74c5b9d5315b0';
const PRED2_TREE = '35857b15ff5a61750b9dccf9ab1f21bb8c3d705f';
const PRED2_COMMIT = '2263a1c360ac49259c6d071db6d6d3ace19e2902';
// Merge-tree prediction (pick 3 on the predicted pick-2-resolved tree).
const MT3_TREE = '3ba598f98f4594ff2be0a7d33afd8de5948829a3';
const MT3_CONV_BLOB = 'c816f9a2904d1114a907465b8189143d1590ce6a';
const PRED_TREE = '1c6c8954270cd5da11bb41f32a74fe0e4bd7ca8c';
const PRED_COMMIT = 'c19aad22147d1fe40a71a2cae2f8d522901d50bd';
const BAL_OURS_BLOB = 'd0c6a42ff2395a49672f235f0218a3f969619dee';
const PHONE_OURS_BLOB = 'b06910148b2bb567ca3941b2ac3245872f74f632';
const OBJ_OURS_BLOB = '9afc522b0a4a2d57719cbcd4254f611c95f290a2';
const RECEIPT2 = 'evidence/2026-11-08/neutral-ove33-master-quick.json.gz';
const RECEIPT3 = 'evidence/2026-11-08/neutral-ove57-tip-6e53adc62.json.gz';
const LIVE_SUBJECT = 'PLACEHOLDER-LIVE-SUBJECT-HASH';
const TOOLING_FILES = ['scripts/green-list.txt', 'scripts/balance-proof.json', 'scripts/phone-frame-proof.json'];
const PICK2_TOOLING = ['scripts/balance-proof.json', 'scripts/phone-frame-proof.json'];
const NARROWED_FILES = ['scripts/balance-proof.json', 'src/js/villager-objectives.js'];

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
// a conflict set of EXACTLY the predicted tooling files resolves
// --ours and the pick continues; ANY other conflicted file
// (including conversation.js) STOPS the arm (UNMEASURED).
function resolveTooling(files) {
  if (!Array.isArray(files)) return 'UNCLASSIFIABLE';
  if (files.length === 0) return 'NO-CONFLICT';
  const sorted = files.slice().sort();
  if (JSON.stringify(sorted) === JSON.stringify(PICK2_TOOLING.slice().sort())) return 'TOOLING-CONTINUE';
  return 'UNMEASURED';
}
// resolveNarrowed(files): the coordinator-decided narrowing rule —
// a conflict set of EXACTLY the two predicted files resolves
// (balance-proof --ours, villager-objectives --ours i.e. dropped)
// and the narrowed pick continues; ANY other conflicted file
// (including conversation.js) STOPS the arm (UNMEASURED), no
// hand-resolution, no narrowed re-run decided by this arm.
function resolveNarrowed(files) {
  if (!Array.isArray(files)) return 'UNCLASSIFIABLE';
  if (files.length === 0) return 'NO-CONFLICT';
  const sorted = files.slice().sort();
  if (JSON.stringify(sorted) === JSON.stringify(NARROWED_FILES.slice().sort())) return 'NARROWED-CONTINUE';
  return 'UNMEASURED';
}
// mergeTree(base, ours, theirs): run `git merge-tree --write-tree
// --merge-base=<base> <ours> <theirs>` (read-only dry run — touches
// no worktree) and return { rc, tree, conflicted: [paths], raw }.
// Both section kinds are read: the `changed in both` entries (stage
// 1/2/3 lines) AND the `Auto-merging` messages — the parser tracks
// both, per the sim-findings.md lesson.
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
  const autoMerged = [];
  for (const ln of lines) {
    const m = ln.match(/^Auto-merging (.+)$/);
    if (m) autoMerged.push(m[1]);
  }
  return { rc: rc, tree: tree, conflicted: conflicted.sort(), autoMerged: autoMerged.sort(), raw: out };
}

(async () => {
  // ---- 1. Pick 2 identity ----
  T.section('1. Pick 2 identity — 7041e1bfb OVE-33, standalone first-parent commit');
  T.ok('pick 2 exists', git('rev-parse ' + PICK2).length === 40, git('log -1 --format=%s ' + PICK2).slice(0, 80));
  T.ok('pick 2 subject is "OVE-33: refresh stale quick proofs and fix outside-Muse fails"',
    git('log -1 --format=%s ' + PICK2) === 'OVE-33: refresh stale quick proofs and fix outside-Muse fails', git('log -1 --format=%s ' + PICK2).slice(0, 80));
  T.ok('pick 2 first parent is c32ff6fa8', git('rev-parse ' + PICK2 + '^1') === FIRST2, git('log -1 --format=%h\\ %s ' + PICK2 + '^1').slice(0, 80));
  const parents2 = git('show -s --format=%P ' + PICK2).split(' ').filter(Boolean);
  T.ok('pick 2 has exactly 1 parent (standalone, not a merge)', parents2.length === 1, 'parents=' + parents2.length);
  const stat2 = git('diff --numstat ' + PICK2 + '^1 ' + PICK2);
  T.ok('pick 2 diff is exactly 12 files',
    stat2.split('\n').sort().join('\n') === ['-\t-\t' + RECEIPT2, '2585\t0\tevidence/2026-11-08/phone-ove33-frame-736-r1.json', '2686\t0\tevidence/2026-11-08/phone-ove33-frame-844-r1.json', '2\t2\tscripts/balance-proof.json', '4\t0\tscripts/godpath/test-mobile-combat-cadence.js', '1\t1\tscripts/godpath/test-occupation-panels.js', '3\t2\tscripts/godpath/test-time-save-crashes.js', '6\t6\tscripts/phone-frame-proof.json', '3\t0\tscripts/test-establishment-r20-fixes-20261020.js', '4\t0\tscripts/test-snippet-stage-direction.js', '4\t0\tsrc/js/conversation.js', '1\t0\tsw.js'].sort().join('\n'), stat2.replace(/\n/g, ' | '));
  T.ok('pick 2 conversation.js is +4/-0', git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- src/js/conversation.js') === '4\t0\tsrc/js/conversation.js', 'conversation 4/0');
  T.ok('pick 2 test-snippet-stage-direction.js is +4/-0', git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- scripts/test-snippet-stage-direction.js') === '4\t0\tscripts/test-snippet-stage-direction.js', 'test-snippet 4/0');
  T.ok('pick 2 balance-proof.json is +2/-2', git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- scripts/balance-proof.json') === '2\t2\tscripts/balance-proof.json', 'balance-proof 2/2');
  T.ok('pick 2 phone-frame-proof.json is +6/-6', git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- scripts/phone-frame-proof.json') === '6\t6\tscripts/phone-frame-proof.json', 'phone-frame-proof 6/6');
  T.ok('pick 2 evidence receipt is a NEW binary file (not in the pick\'s first parent)',
    git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- ' + RECEIPT2).indexOf(RECEIPT2) !== -1, RECEIPT2);
  T.ok('pick 2 evidence receipt is ABSENT at the 14+12 base (so the subject carries it only as the pick adds it)',
    (function () { try { execSync('git cat-file -e ' + BASE + ':' + RECEIPT2, { cwd: REPO, stdio: 'pipe' }); return false; } catch (e) { return true; } })(), 'absent at base');
  T.ok('pick 2 does not touch standing.js', git('diff --name-only ' + PICK2 + '^1 ' + PICK2 + ' -- src/js/standing.js') === '', '(absent)');
  T.ok('pick 2 touches no policy file', git('diff --name-only ' + PICK2 + '^1 ' + PICK2 + ' -- scripts/policies') === '', '(none)');
  T.ok('pick 2 does not touch green-list.txt', git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- scripts/green-list.txt') === '', '(absent)');
  T.ok('pick 2 touches no data/docs file', git('diff --name-only ' + PICK2 + '^1 ' + PICK2 + ' -- src/data docs') === '', '(none)');
  const fpOrder = git('log --first-parent --reverse --format=%H ' + MERGEBASE + '..a628aeaf3').split('\n');
  T.ok('pick 2 is on the first-parent chain d229b58f5..a628aeaf3', fpOrder.indexOf(PICK2) !== -1, 'idx=' + fpOrder.indexOf(PICK2));
  T.ok('pick 2\'s first parent c32ff6fa8 is NOT an ancestor of the far end (family 3 is not on the far end)',
    isAncestor(FIRST2, FAR) === false, 'not ancestor of 203a32775');
  T.ok('pick 1 (bb6a301cf) IS an ancestor of pick 2\'s first parent (sequence dependency)',
    isAncestor('bb6a301cf6433e2a62fe6a6e5fc95ca9ecd986c1', FIRST2) === true, 'pick 1 precedes pick 2');
  T.ok('pick 2 IS an ancestor of pick 3\'s first parent 134a3d0ab (sequence dependency)',
    isAncestor(PICK2, FIRST3) === true, 'pick 2 precedes pick 3');

  // ---- 2. Pick 3 identity ----
  T.section('2. Pick 3 identity — 4a1c77cf1 OVE-57, standalone first-parent commit');
  T.ok('pick 3 exists', git('rev-parse ' + PICK3).length === 40, git('log -1 --format=%s ' + PICK3).slice(0, 80));
  T.ok('pick 3 subject is "OVE-57: triage tip quick-check after bond dawn"',
    git('log -1 --format=%s ' + PICK3) === 'OVE-57: triage tip quick-check after bond dawn', git('log -1 --format=%s ' + PICK3).slice(0, 80));
  T.ok('pick 3 first parent is 134a3d0ab', git('rev-parse ' + PICK3 + '^1') === FIRST3, git('log -1 --format=%h\\ %s ' + PICK3 + '^1').slice(0, 80));
  const parents3 = git('show -s --format=%P ' + PICK3).split(' ').filter(Boolean);
  T.ok('pick 3 has exactly 1 parent (standalone, not a merge)', parents3.length === 1, 'parents=' + parents3.length);
  const stat3 = git('diff --numstat ' + PICK3 + '^1 ' + PICK3);
  T.ok('pick 3 diff is exactly 4 files, +44/-6',
    stat3.split('\n').sort().join('\n') === ['-\t-\t' + RECEIPT3, '2\t2\tscripts/balance-proof.json', '21\t2\tsrc/js/conversation.js', '21\t2\tsrc/js/villager-objectives.js'].sort().join('\n'), stat3.replace(/\n/g, ' | '));
  T.ok('pick 3 conversation.js is +21/-2', git('diff --numstat ' + PICK3 + '^1 ' + PICK3 + ' -- src/js/conversation.js') === '21\t2\tsrc/js/conversation.js', 'conversation 21/2');
  T.ok('pick 3 villager-objectives.js is +21/-2', git('diff --numstat ' + PICK3 + '^1 ' + PICK3 + ' -- src/js/villager-objectives.js') === '21\t2\tsrc/js/villager-objectives.js', 'objectives 21/2');
  T.ok('pick 3 balance-proof.json is +2/-2', git('diff --numstat ' + PICK3 + '^1 ' + PICK3 + ' -- scripts/balance-proof.json') === '2\t2\tscripts/balance-proof.json', 'balance-proof 2/2');
  T.ok('pick 3 evidence receipt is a NEW binary file (not in the pick\'s first parent)',
    git('diff --numstat ' + PICK3 + '^1 ' + PICK3 + ' -- ' + RECEIPT3).indexOf(RECEIPT3) !== -1, RECEIPT3);
  T.ok('pick 3 evidence receipt is ABSENT at the 14+12 base (so the narrowed subject omits it)',
    (function () { try { execSync('git cat-file -e ' + BASE + ':' + RECEIPT3, { cwd: REPO, stdio: 'pipe' }); return false; } catch (e) { return true; } })(), 'absent at base');
  T.ok('pick 3 does not touch standing.js', git('diff --name-only ' + PICK3 + '^1 ' + PICK3 + ' -- src/js/standing.js') === '', '(absent)');
  T.ok('pick 3 touches no policy file', git('diff --name-only ' + PICK3 + '^1 ' + PICK3 + ' -- scripts/policies') === '', '(none)');
  T.ok('pick 3 does not touch green-list.txt', git('diff --numstat ' + PICK3 + '^1 ' + PICK3 + ' -- scripts/green-list.txt') === '', '(absent)');
  T.ok('pick 3 touches no data/docs file', git('diff --name-only ' + PICK3 + '^1 ' + PICK3 + ' -- src/data docs') === '', '(none)');
  T.ok('pick 3 is on the first-parent chain d229b58f5..a628aeaf3', fpOrder.indexOf(PICK3) !== -1, 'idx=' + fpOrder.indexOf(PICK3));
  T.ok('pick 3 follows pick 2 on the first-parent chain (origin order)',
    fpOrder.indexOf(PICK3) > fpOrder.indexOf(PICK2), 'pick2 idx=' + fpOrder.indexOf(PICK2) + ' pick3 idx=' + fpOrder.indexOf(PICK3));
  T.ok('pick 3\'s first parent 134a3d0ab is NOT an ancestor of the far end (family 15B is not on the far end)',
    isAncestor(FIRST3, FAR) === false, 'not ancestor of 203a32775');

  // ---- 3. Base identity ----
  T.section('3. Base identity — transplant-12-14-subject c8655548f (far end + 14 + 12)');
  T.ok('base branch transplant-12-14-subject exists at c8655548f', git('rev-parse ' + 'transplant-12-14-subject') === BASE, BASE.slice(0, 9));
  T.ok('base tree is e78fac42… (exactly the tree the 12+14 arm\'s subject holds)',
    git('rev-parse ' + BASE + '^{tree}') === BASE_TREE, git('rev-parse ' + BASE + '^{tree}').slice(0, 12));
  T.ok('base tip subject is the family-12 merge (Merge pull request #25)',
    git('log -1 --format=%s ' + BASE) === 'Merge pull request #25 from steve-vitale/cursor/dialog-residual-sampler-f726', git('log -1 --format=%s ' + BASE).slice(0, 60));
  T.ok('base second commit is the family-14 merge (Merge pull request #10)',
    git('log -1 --format=%s ' + BASE + '^1') === 'Merge pull request #10 from steve-vitale/cursor/snippet-stage-direction-guard', git('log -1 --format=%s ' + BASE + '^1').slice(0, 60));
  T.ok('base third commit is the far end 203a32775', git('rev-parse ' + BASE + '^1^1') === git('rev-parse ' + FAR), 'far end is base grandparent');
  T.ok('far end is an ancestor of the base', isAncestor(FAR, BASE) === true, 'far end precedes base');
  T.ok('base has exactly 2 commits on top of the far end (families 14 and 12)',
    git('rev-list --count ' + FAR + '..' + BASE) === '2', 'count=2');
  const farStanding = sha256(gitShow(FAR, 'src/js/standing.js'));
  T.ok('far-end native standing.js sha is 75762cb2...', farStanding.startsWith('75762cb2'), farStanding.slice(0, 12));
  T.ok('fix standing.js sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  const farPolicy = sha256(gitShow(FAR, 'scripts/policies/competent.js'));
  T.ok('far-end policy sha is a7ff5c51...', farPolicy.startsWith('a7ff5c51'), farPolicy.slice(0, 12));
  T.ok('base policy is the far-end policy (no pick touches policies)',
    sha256(gitShow(BASE, 'scripts/policies/competent.js')) === farPolicy, 'policy identical');

  // ---- 4. Merge-tree pre-check, pick 2 ----
  T.section('4. Merge-tree pre-check, pick 2 — rc=1, exactly the two predicted tooling conflicts');
  const mt2 = mergeTree(git('rev-parse ' + FIRST2), git('rev-parse ' + BASE), git('rev-parse ' + PICK2));
  T.ok('merge-tree pick 2 rc=1 (conflict)', mt2.rc === 1, 'rc=' + mt2.rc);
  T.ok('merge-tree pick 2 tree is 4111ed85…', mt2.tree === MT2_TREE, mt2.tree.slice(0, 12));
  T.ok('merge-tree pick 2 conflicts EXACTLY [scripts/balance-proof.json, scripts/phone-frame-proof.json]',
    JSON.stringify(mt2.conflicted) === JSON.stringify(['scripts/balance-proof.json', 'scripts/phone-frame-proof.json']), mt2.conflicted.join(', '));
  T.ok('merge-tree pick 2 auto-merged conversation.js (no CONFLICT line for it)',
    mt2.autoMerged.indexOf('src/js/conversation.js') !== -1 && mt2.raw.indexOf('CONFLICT (content): Merge conflict in src/js/conversation.js') === -1, mt2.autoMerged.join(', '));
  // The test file changed only on the theirs side (base→ours is
  // empty: the 14+12 base already carries family 12's OVE-29
  // assertions, 74 lines, identical to pick 2's first parent), so
  // merge-tree takes theirs silently with NO "Auto-merging" line —
  // the leg asserts the absence of a CONFLICT line instead.
  T.ok('merge-tree pick 2 has no CONFLICT line for test-snippet-stage-direction.js (one-sided take of theirs)',
    mt2.raw.indexOf('CONFLICT (content): Merge conflict in scripts/test-snippet-stage-direction.js') === -1, 'no conflict on test file');
  T.ok('merge-tree pick 2 auto-merged sw.js (no CONFLICT line for it)',
    mt2.autoMerged.indexOf('sw.js') !== -1 && mt2.raw.indexOf('CONFLICT (content): Merge conflict in sw.js') === -1, 'sw auto-merged');
  T.ok('tooling rule maps the pick-2 conflict set to TOOLING-CONTINUE', resolveTooling(mt2.conflicted) === 'TOOLING-CONTINUE', resolveTooling(mt2.conflicted));
  T.ok('tooling rule maps a conversation.js conflict to UNMEASURED (STOP)',
    resolveTooling(['src/js/conversation.js', 'scripts/phone-frame-proof.json']) === 'UNMEASURED', 'conversation.js conflict stops');
  T.ok('tooling rule maps an empty conflict set to NO-CONFLICT', resolveTooling([]) === 'NO-CONFLICT', 'empty set');
  const mt2Bal = gitShow(MT2_TREE, 'scripts/balance-proof.json');
  T.ok('merged-tree pick 2 balance-proof.json carries conflict markers at lines 3/6/9',
    mt2Bal.split('\n')[2].indexOf('<<<<<<<') === 0 && mt2Bal.split('\n')[5] === '=======' && mt2Bal.split('\n')[8].indexOf('>>>>>>>') === 0, 'markers 3/6/9');
  const mt2Phone = gitShow(MT2_TREE, 'scripts/phone-frame-proof.json');
  T.ok('merged-tree pick 2 phone-frame-proof.json carries conflict markers at lines 7/15/23',
    mt2Phone.split('\n')[6].indexOf('<<<<<<<') === 0 && mt2Phone.split('\n')[14] === '=======' && mt2Phone.split('\n')[22].indexOf('>>>>>>>') === 0, 'markers 7/15/23');
  T.ok('merged-tree pick 2 phone-frame-proof.json carries conflict markers at lines 81/91/101',
    mt2Phone.split('\n')[80].indexOf('<<<<<<<') === 0 && mt2Phone.split('\n')[90] === '=======' && mt2Phone.split('\n')[100].indexOf('>>>>>>>') === 0, 'markers 81/91/101');
  T.ok('the pick-2 conflict files and marker lines match the 1412 arm\'s pick-3 prediction exactly (same two files, same lines)',
    mt2.conflicted.length === 2 && mt2Bal.split('\n')[2].indexOf('<<<<<<<') === 0 && mt2Phone.split('\n')[6].indexOf('<<<<<<<') === 0, 'matches 1412 prediction');
  T.ok('merged-tree pick 2 conversation.js carries the OVE-33 quote check (if (/"test(s)) return false;)',
    gitShow(MT2_TREE, 'src/js/conversation.js').indexOf('if (/"/.test(s)) return false;') !== -1, 'quote check merged');
  T.ok('merged-tree pick 2 test file carries the OVE-33 "They go still." assertion',
    gitShow(MT2_TREE, 'scripts/test-snippet-stage-direction.js').indexOf('They go still.') !== -1, 'OVE-33 assertion merged');
  T.ok('prediction commit 2263a1c3 carries the predicted pick-2-resolved tree with parent = the 14+12 base',
    git('rev-parse ' + PRED2_COMMIT + '^{tree}') === PRED2_TREE && git('rev-parse ' + PRED2_COMMIT + '^1') === git('rev-parse ' + BASE), 'tree+parent ok');
  const pred2Numstat = git('diff --numstat ' + BASE + ' ' + PRED2_TREE);
  T.ok('predicted pick-2-resolved tree diff vs base is exactly pick 2 MINUS the two tooling files (10 files)',
    pred2Numstat.split('\n').sort().join('\n') === ['-\t-\t' + RECEIPT2, '2585\t0\tevidence/2026-11-08/phone-ove33-frame-736-r1.json', '2686\t0\tevidence/2026-11-08/phone-ove33-frame-844-r1.json', '4\t0\tscripts/godpath/test-mobile-combat-cadence.js', '1\t1\tscripts/godpath/test-occupation-panels.js', '3\t2\tscripts/godpath/test-time-save-crashes.js', '3\t0\tscripts/test-establishment-r20-fixes-20261020.js', '4\t0\tscripts/test-snippet-stage-direction.js', '4\t0\tsrc/js/conversation.js', '1\t0\tsw.js'].sort().join('\n'), pred2Numstat.replace(/\n/g, ' | '));
  T.ok('predicted pick-2-resolved tree balance-proof.json blob is the base blob d0c6a42f…',
    git('ls-tree ' + PRED2_TREE + ' -- scripts/balance-proof.json').indexOf(BAL_OURS_BLOB) !== -1, 'balance-proof = base');
  T.ok('predicted pick-2-resolved tree phone-frame-proof.json blob is the base blob b0691014…',
    git('ls-tree ' + PRED2_TREE + ' -- scripts/phone-frame-proof.json').indexOf(PHONE_OURS_BLOB) !== -1, 'phone-frame-proof = base');

  // ---- 5. Merge-tree pre-check, pick 3 ----
  T.section('5. Merge-tree pre-check, pick 3 — rc=1, exactly balance-proof.json + villager-objectives.js');
  const mt3 = mergeTree(git('rev-parse ' + FIRST3), git('rev-parse ' + PRED2_COMMIT), git('rev-parse ' + PICK3));
  T.ok('merge-tree pick 3 rc=1 (conflict)', mt3.rc === 1, 'rc=' + mt3.rc);
  T.ok('merge-tree pick 3 tree is 3ba598f9…', mt3.tree === MT3_TREE, mt3.tree.slice(0, 12));
  T.ok('merge-tree pick 3 conflicts EXACTLY [scripts/balance-proof.json, src/js/villager-objectives.js]',
    JSON.stringify(mt3.conflicted) === JSON.stringify(['scripts/balance-proof.json', 'src/js/villager-objectives.js']), mt3.conflicted.join(', '));
  T.ok('merge-tree pick 3 auto-merged conversation.js (no CONFLICT line for it)',
    mt3.autoMerged.indexOf('src/js/conversation.js') !== -1 && mt3.raw.indexOf('CONFLICT (content): Merge conflict in src/js/conversation.js') === -1, mt3.autoMerged.join(', '));
  T.ok('merge-tree pick 3 merged conversation.js blob is c816f9a2…',
    git('ls-tree ' + MT3_TREE + ' -- src/js/conversation.js').indexOf(MT3_CONV_BLOB) !== -1, git('ls-tree ' + MT3_TREE + ' -- src/js/conversation.js').slice(0, 60));
  T.ok('narrowing rule maps the pick-3 conflict set to NARROWED-CONTINUE', resolveNarrowed(mt3.conflicted) === 'NARROWED-CONTINUE', resolveNarrowed(mt3.conflicted));
  T.ok('narrowing rule maps a conversation.js conflict to UNMEASURED (STOP)',
    resolveNarrowed(['src/js/conversation.js', 'src/js/villager-objectives.js']) === 'UNMEASURED', 'conversation.js conflict stops');
  T.ok('narrowing rule maps an empty conflict set to NO-CONFLICT', resolveNarrowed([]) === 'NO-CONFLICT', 'empty set');
  const mt3Bal = gitShow(MT3_TREE, 'scripts/balance-proof.json');
  T.ok('merged-tree pick 3 balance-proof.json carries conflict markers at lines 3/6/9',
    mt3Bal.split('\n')[2].indexOf('<<<<<<<') === 0 && mt3Bal.split('\n')[5] === '=======' && mt3Bal.split('\n')[8].indexOf('>>>>>>>') === 0, 'markers 3/6/9');
  const mt3Obj = gitShow(MT3_TREE, 'src/js/villager-objectives.js');
  T.ok('merged-tree pick 3 villager-objectives.js carries conflict markers at lines 23/25/29',
    mt3Obj.split('\n')[22].indexOf('<<<<<<<') === 0 && mt3Obj.split('\n')[24] === '=======' && mt3Obj.split('\n')[28].indexOf('>>>>>>>') === 0, 'markers 23/25/29');
  T.ok('merged-tree pick 3 villager-objectives.js carries conflict markers at lines 957/972/1039',
    mt3Obj.split('\n')[956].indexOf('<<<<<<<') === 0 && mt3Obj.split('\n')[971] === '=======' && mt3Obj.split('\n')[1038].indexOf('>>>>>>>') === 0, 'markers 957/972/1039');
  T.ok('the pick-3 conflict files and marker lines match the 1412 arm\'s pick-4 prediction and the p3conv pre-check exactly (same two files, same lines)',
    mt3.conflicted.length === 2 && mt3Bal.split('\n')[2].indexOf('<<<<<<<') === 0 && mt3Obj.split('\n')[956].indexOf('<<<<<<<') === 0, 'matches 1412 + p3conv predictions');
  T.ok('prediction commit c19aad22 carries the predicted narrowed-subject tree with parent = the 14+12 base',
    git('rev-parse ' + PRED_COMMIT + '^{tree}') === PRED_TREE && git('rev-parse ' + PRED_COMMIT + '^1') === git('rev-parse ' + BASE), 'tree+parent ok');
  const predNumstat = git('diff --numstat ' + BASE + ' ' + PRED_TREE);
  T.ok('predicted narrowed-subject tree diff vs base is exactly 10 files (conversation.js +25/-2, test-snippet +4, OVE-33 files, sw.js)',
    predNumstat.split('\n').sort().join('\n') === ['-\t-\t' + RECEIPT2, '2585\t0\tevidence/2026-11-08/phone-ove33-frame-736-r1.json', '2686\t0\tevidence/2026-11-08/phone-ove33-frame-844-r1.json', '4\t0\tscripts/godpath/test-mobile-combat-cadence.js', '1\t1\tscripts/godpath/test-occupation-panels.js', '3\t2\tscripts/godpath/test-time-save-crashes.js', '3\t0\tscripts/test-establishment-r20-fixes-20261020.js', '4\t0\tscripts/test-snippet-stage-direction.js', '25\t2\tsrc/js/conversation.js', '1\t0\tsw.js'].sort().join('\n'), predNumstat.replace(/\n/g, ' | '));
  T.ok('predicted narrowed-subject tree conversation.js is +25/-2 (pick 2 +4 plus pick 3 +21/-2)',
    git('diff --numstat ' + BASE + ' ' + PRED_TREE + ' -- src/js/conversation.js') === '25\t2\tsrc/js/conversation.js', 'conversation 25/2');
  T.ok('predicted narrowed-subject conversation.js blob is the merge-tree merged blob c816f9a2…',
    git('ls-tree ' + PRED_TREE + ' -- src/js/conversation.js').indexOf(MT3_CONV_BLOB) !== -1, 'blob matches');
  T.ok('predicted narrowed-subject villager-objectives.js blob is the base blob 9afc522b…',
    git('ls-tree ' + PRED_TREE + ' -- src/js/villager-objectives.js').indexOf(OBJ_OURS_BLOB) !== -1, 'objectives = base');
  T.ok('predicted narrowed-subject balance-proof.json blob is the base blob d0c6a42f…',
    git('ls-tree ' + PRED_TREE + ' -- scripts/balance-proof.json').indexOf(BAL_OURS_BLOB) !== -1, 'balance-proof = base');
  T.ok('predicted narrowed-subject phone-frame-proof.json blob is the base blob b0691014…',
    git('ls-tree ' + PRED_TREE + ' -- scripts/phone-frame-proof.json').indexOf(PHONE_OURS_BLOB) !== -1, 'phone-frame-proof = base');
  T.ok('predicted narrowed-subject tree has NO pick-3 evidence receipt (absent at the base)',
    (function () { try { execSync('git cat-file -e ' + PRED_TREE + ':' + RECEIPT3, { cwd: REPO, stdio: 'pipe' }); return false; } catch (e) { return true; } })(), 'receipt absent');
  T.ok('predicted narrowed-subject tree HAS the pick-2 evidence receipt (the pick adds it)',
    (function () { try { execSync('git cat-file -e ' + PRED_TREE + ':' + RECEIPT2, { cwd: REPO, stdio: 'pipe' }); return true; } catch (e) { return false; } })(), 'OVE-33 receipt present');

  // ---- 6. Pick mechanisms ----
  T.section('6. Pick mechanisms — family-12 anchor present on base; Phase 4 dependency (objectives)');
  T.ok('the family-12-widened quote-strip anchor has 1 hit on the 14+12 base (pick 2\'s hunk can land)',
    grepCount(BASE, 'const s = String(sn).trim().replace', 'src/js/conversation.js') === 1, 'anchor present on base');
  T.ok('the OVE-33 quote check has 0 hits on the 14+12 base (it is new in pick 2)',
    grepCount(BASE, 'if (/"/.test(s)) return false;', 'src/js/conversation.js') === 0, '0 hits at base');
  T.ok('the OVE-33 "They go still." assertion has 0 hits on the 14+12 base (it is new in pick 2)',
    grepCount(BASE, 'They go still.', 'scripts/test-snippet-stage-direction.js') === 0, '0 hits at base');
  T.ok('objCommitGuardOffer has 5 hits at pick 3\'s first parent 134a3d0ab (Phase 4 form)',
    grepCount(FIRST3, 'objCommitGuardOffer', 'src/js/villager-objectives.js') === 5, '5 hits at base');
  T.ok('objCommitGuardOffer has 0 hits at the far end (the far end never had Phase 4 objectives)',
    grepCount(FAR, 'objCommitGuardOffer', 'src/js/villager-objectives.js') === 0, '0 hits at far end');
  T.ok('objCommitGuardOffer has 0 hits on the 14+12 base (no pick in this arm supplies Phase 4 objectives)',
    grepCount(BASE, 'objCommitGuardOffer', 'src/js/villager-objectives.js') === 0, '0 hits at base');
  T.ok('the pick\'s villager-objectives.js hunk rewrites the rally_guard header line (Phase 4 wording)',
    git('diff ' + PICK3 + '^1 ' + PICK3 + ' -- src/js/villager-objectives.js').indexOf('rallyOnly commits the top volunteer via objCommitGuardOffer') !== -1, 'rally_guard rewrite present');
  T.ok('the pick\'s villager-objectives.js hunk inserts the rally-volunteer commit (rallyOnly, no invite lottery)',
    git('diff ' + PICK3 + '^1 ' + PICK3 + ' -- src/js/villager-objectives.js').indexOf("reasons: ['rally-volunteer']") !== -1, 'rally-volunteer present');
  T.ok('tradeIntroDeferred has 3 hits in the pick (new in OVE-57)',
    grepCount(PICK3, 'tradeIntroDeferred', 'src/js/conversation.js') === 3, '3 hits in pick');
  T.ok('tradeIntroDeferred has 0 hits at the 14+12 base',
    grepCount(BASE, 'tradeIntroDeferred', 'src/js/conversation.js') === 0, '0 hits at base');
  T.ok('the pick\'s conversation.js hunk reworks queueTraderIntro (deferred intro surfaces at stage >= 1)',
    git('diff ' + PICK3 + '^1 ' + PICK3 + ' -- src/js/conversation.js').indexOf('if (stage < 1) return;') !== -1, 'stage >= 1 gate present');
  T.ok('the pick\'s conversation.js hunk sets tradeIntroDeferred at close',
    git('diff ' + PICK3 + '^1 ' + PICK3 + ' -- src/js/conversation.js').indexOf('if (c.traderIntroPending) c.tradeIntroDeferred = true;') !== -1, 'deferral at close present');
  T.ok('the pick\'s conversation.js hunk clears tradeIntroDeferred when the intro is queued',
    git('diff ' + PICK3 + '^1 ' + PICK3 + ' -- src/js/conversation.js').indexOf('c.tradeIntroDeferred = false;') !== -1, 'clear on queue present');
  T.ok('the pick-2 conversation.js hunk inserts the quote check inside convoSnippetIsStageDirection',
    git('diff ' + PICK2 + '^1 ' + PICK2 + ' -- src/js/conversation.js').indexOf('if (/"/.test(s)) return false;') !== -1, 'quote check present');

  // ---- 7. Family content ----
  T.section('7. Family content — quoted beats are memory; deferred trader intro surfaces; no numbers moved');
  const pick2ConvDiff = git('diff ' + PICK2 + '^1 ' + PICK2 + ' -- src/js/conversation.js');
  T.ok('pick-2 conversation.js hunk is a comment + quote check (quoted beats are real memory)',
    pick2ConvDiff.indexOf('Quoted beats are real memory') !== -1 || pick2ConvDiff.indexOf('real memory') !== -1, 'quote-check rationale present');
  const pick3ConvDiff = git('diff ' + PICK3 + '^1 ' + PICK3 + ' -- src/js/conversation.js');
  T.ok('pick-3 conversation.js hunk mentions the OVE-48 dawn-priority context (warn_you opener may speak first)',
    pick3ConvDiff.indexOf('OVE-48 dawn priorities') !== -1, 'OVE-48 context present');
  T.ok('pick-3 conversation.js hunk keeps the ask_favor/seek_comfort/seek_taken/warn_you stage-3 gate for non-deferred intros',
    pick3ConvDiff.indexOf("['ask_favor', 'seek_comfort', 'seek_taken', 'warn_you']") !== -1, 'stage-3 gate kept');
  const pick3ObjDiff = git('diff ' + PICK3 + '^1 ' + PICK3 + ' -- src/js/villager-objectives.js');
  T.ok('pick-3 objectives hunk is the rally-guard lottery skip (dropped by this arm, recorded unmeasured)',
    pick3ObjDiff.indexOf('Skip the invite lottery so this path draws no new') !== -1, 'lottery skip present');
  T.ok('neither pick changes any wave/table/standing numbers (no standing.js, no deed gate, no wave file)',
    git('diff --name-only ' + PICK2 + '^1 ' + PICK2 + ' -- src/js/standing.js src/js/table.js src/js/progression.js src/js/monsterWaves.js') === '' && git('diff --name-only ' + PICK3 + '^1 ' + PICK3 + ' -- src/js/standing.js src/js/table.js src/js/progression.js src/js/monsterWaves.js') === '', '(none)');
  T.ok('neither pick changes any damage/armor/spawn/food numbers (conversation + objectives + proofs only)',
    pick2ConvDiff.indexOf('damage') === -1 && pick3ConvDiff.indexOf('damage') === -1, 'no damage lever');

  // ---- 8. Verdict mapping + narrowing rules ----
  T.section('8. Verdict mapping + narrowing rules');
  T.ok('classifyTransplant(0) = CARRIER', classifyTransplant(0) === 'CARRIER', '0/8');
  T.ok('classifyTransplant(1) = CARRIER', classifyTransplant(1) === 'CARRIER', '1/8');
  T.ok('classifyTransplant(2) = AMBIGUOUS', classifyTransplant(2) === 'AMBIGUOUS', '2/8');
  T.ok('classifyTransplant(3) = NOT-CARRIER', classifyTransplant(3) === 'NOT-CARRIER', '3/8');
  T.ok('classifyTransplant(4) = NOT-CARRIER (far-end baseline)', classifyTransplant(4) === 'NOT-CARRIER', '4/8');
  T.ok('classifyTransplant(8) = NOT-CARRIER', classifyTransplant(8) === 'NOT-CARRIER', '8/8');
  T.ok('classifyTransplant(9) = UNCLASSIFIABLE', classifyTransplant(9) === 'UNCLASSIFIABLE', '9/8');
  T.ok('resolveTooling maps the exact predicted two-tooling-file set to TOOLING-CONTINUE',
    resolveTooling(['scripts/balance-proof.json', 'scripts/phone-frame-proof.json']) === 'TOOLING-CONTINUE', 'predicted set');
  T.ok('resolveTooling maps a tooling-only subset to UNMEASURED (both files are part of the prediction)',
    resolveTooling(['scripts/balance-proof.json']) === 'UNMEASURED', 'subset stops');
  T.ok('resolveTooling maps any extra file to UNMEASURED',
    resolveTooling(['scripts/balance-proof.json', 'scripts/phone-frame-proof.json', 'src/js/game.js']) === 'UNMEASURED', 'extra file stops');
  T.ok('resolveTooling maps a non-array to UNCLASSIFIABLE', resolveTooling(null) === 'UNCLASSIFIABLE', 'null input');
  T.ok('resolveNarrowed maps the exact predicted two-file set to NARROWED-CONTINUE',
    resolveNarrowed(['scripts/balance-proof.json', 'src/js/villager-objectives.js']) === 'NARROWED-CONTINUE', 'predicted set');
  T.ok('resolveNarrowed maps a tooling-only set to UNMEASURED (the objectives file is part of the narrowing, not tooling)',
    resolveNarrowed(['scripts/balance-proof.json']) === 'UNMEASURED', 'tooling-only alone stops');
  T.ok('resolveNarrowed maps any extra file to UNMEASURED',
    resolveNarrowed(['scripts/balance-proof.json', 'src/js/villager-objectives.js', 'src/js/game.js']) === 'UNMEASURED', 'extra file stops');
  T.ok('resolveNarrowed maps a non-array to UNCLASSIFIABLE', resolveNarrowed(null) === 'UNCLASSIFIABLE', 'null input');

  // ---- 9. Prereg recorded ----
  T.section('9. Prereg recorded in the evidence file');
  const evPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15e-p23-prereg.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('prereg file exists', ev.length > 0, evPath);
  T.ok('prereg records the base (transplant-12-14-subject c8655548f, far end 203a32775, GOOD 4/8)', ev.indexOf('c8655548f') !== -1 && ev.indexOf('203a32775') !== -1 && ev.indexOf('GOOD 4/8') !== -1, 'base present');
  T.ok('prereg records the picks (7041e1bfb OVE-33, 4a1c77cf1 OVE-57)', ev.indexOf('7041e1bfb') !== -1 && ev.indexOf('4a1c77cf1') !== -1 && ev.indexOf('OVE-33') !== -1 && ev.indexOf('OVE-57') !== -1, 'picks present');
  T.ok('prereg records the seeds 190391–190398', ev.indexOf('190391') !== -1 && ev.indexOf('190398') !== -1, 'seeds present');
  T.ok('prereg records the horizon 150d death-aware', ev.indexOf('150d') !== -1, 'horizon present');
  T.ok('prereg records the competent verbatim own-policy', ev.indexOf('competent') !== -1, 'policy present');
  T.ok('prereg records STEP id t15e-p23', ev.indexOf('t15e-p23') !== -1, 'STEP present');
  T.ok('prereg records the thresholds (≤1 CARRIER / 2 AMBIGUOUS / ≥3 NOT-CARRIER)',
    ev.indexOf('CARRIER') !== -1 && ev.indexOf('AMBIGUOUS') !== -1 && ev.indexOf('NOT-CARRIER') !== -1, 'thresholds present');
  T.ok('prereg records the STOP clause (conversation.js conflict stops; other files stop)',
    ev.indexOf('STOP clause') !== -1 && ev.indexOf('UNMEASURED-BY-CONFLICT') !== -1, 'STOP present');
  T.ok('prereg records the coordinator-decided narrowing (pick 3 conversation.js ONLY; objectives half unmeasured)',
    ev.indexOf('COORDINATOR-DECIDED NARROWING') !== -1 && ev.indexOf('stays UNMEASURED') !== -1, 'narrowing present');
  T.ok('prereg records the 1412 arm authority (candidate (c), same marker lines)',
    ev.indexOf('sim-transplant15e-1412.md') !== -1 && ev.indexOf('candidate (c)') !== -1, '1412 authority present');
  T.ok('prereg records the p3conv narrowing precedent',
    ev.indexOf('sim-transplant15e-p3conv.md') !== -1 && ev.indexOf('p3conv precedent') !== -1, 'p3conv precedent present');
  T.ok('prereg records the subject branch name transplant-15e-p23-subject',
    ev.indexOf('transplant-15e-p23-subject') !== -1, 'subject branch present');
  T.ok('prereg records the merge-tree predictions (trees 4111ed85… / 3ba598f9…, predicted trees 35857b15… / 1c6c8954…, prediction commits 2263a1c3 / c19aad22)',
    ev.indexOf('4111ed85') !== -1 && ev.indexOf('3ba598f9') !== -1 && ev.indexOf('35857b15') !== -1 && ev.indexOf('1c6c8954') !== -1 && ev.indexOf('2263a1c3') !== -1 && ev.indexOf('c19aad22') !== -1, 'predictions present');
  T.ok('prereg records the marker lines (3/6/9, 7/15/23, 81/91/101, 23/25/29, 957/972/1039)',
    ev.indexOf('3/6/9') !== -1 && ev.indexOf('7/15/23') !== -1 && ev.indexOf('81/91/101') !== -1 && ev.indexOf('23/25/29') !== -1 && ev.indexOf('957/972/1039') !== -1, 'markers present');
  T.ok('prereg records the pick mechanisms (Phase 4, objCommitGuardOffer, quote-strip anchor, direct-write guard)',
    ev.indexOf('objCommitGuardOffer') !== -1 && ev.indexOf('Phase 4') !== -1 && ev.indexOf('quote-strip') !== -1, 'mechanisms present');
  T.ok('prereg records the canon note (CONVERSATIONS.md; no standalone OVE-33/57 doc)',
    ev.indexOf('CONVERSATIONS.md') !== -1, 'canon note present');
  T.ok('prereg records the grouping authority (§15E)',
    ev.indexOf('family15-grouping-prereg-2026-11-14.md') !== -1, 'authority present');
  T.ok('prereg records the ordering note (pre-check ran during prereg preparation, subject not yet cut)',
    ev.indexOf('Ordering note') !== -1, 'ordering note present');
  T.ok('prereg records the seed-band freshness note (78 preregs, reused by design)',
    ev.indexOf('78 preregs') !== -1 && ev.indexOf('reused BY DESIGN') !== -1, 'seed-band note present');
  T.ok('prereg records the build method (cherry-pick 7041e1bfb, cherry-pick 4a1c77cf1, checkout --ours, receipt removed)',
    ev.indexOf('git cherry-pick') !== -1 && ev.indexOf('git checkout --ours') !== -1 && ev.indexOf('REMOVED from the subject') !== -1, 'build method present');
  T.ok('prereg records the fix sha f8fda4295a99', ev.indexOf('f8fda4295a99') !== -1, 'fix sha present');

  // ---- 10. Base state ----
  T.section('10. Base state — arm branch clean, subject not yet cut, step t15e-p23 not yet run');
  const headBranch = git('rev-parse --abbrev-ref HEAD');
  // worktreeOnly: branch-identity legs are meaningful only in the
  // worker tree. On merged master HEAD is 'master' by design (the
  // arm branch is deleted after landing) — the leg passes there
  // vacuously instead of failing, so the proof stays green on master.
  // Prereg-commit ancestry legs resolve by message/subject, not hash
  // (an adoption rebase rewrites hashes).
  const worktreeOnly = function (cond) { return cond || headBranch === 'master'; };
  T.ok('HEAD is on the arm branch sim-transplant15e-p23-a (worktree-only)', worktreeOnly(headBranch === 'sim-transplant15e-p23-a'), 'HEAD=' + headBranch);
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
  T.ok('subject branch exists at the live pick 1efa1c1ab (stage 2)', subjectExists === true && git('rev-parse ' + SUBJECT_BRANCH).startsWith('1efa1c1ab'), SUBJECT_BRANCH + ' at 1efa1c1ab');
  const tSummary = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  T.ok('step summary EXISTS for t15e-p23 (stage 2 — the judged sim ran)', fs.existsSync(tSummary) === true, STEP);
  const tDriver = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  T.ok('step driver log EXISTS for t15e-p23 (stage 2 — the judged sim ran)', fs.existsSync(tDriver) === true, STEP);
  const corpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  T.ok('step corpus EXISTS for t15e-p23 (stage 2 — the judged sim ran)', fs.existsSync(corpusDir) === true, STEP);
  T.ok('step corpus holds exactly 8 per-seed JSONs', fs.existsSync(corpusDir) && fs.readdirSync(corpusDir).filter(function (f) { return f.endsWith('.json'); }).length === 8, '8 seeds');
  let cherryPickHead = true;
  try { execSync('git rev-parse --verify CHERRY_PICK_HEAD', { cwd: REPO, stdio: 'pipe' }); } catch (e) { cherryPickHead = false; }
  T.ok('no cherry-pick is in progress', cherryPickHead === false, 'CHERRY_PICK_HEAD absent');
  const dirtyTracked = git('diff --name-only HEAD');
  const allowed = ['scripts/test-transplant15e-p23-a.js', 'evidence/2026-11-14/sim-transplant15e-p23-prereg.md', 'evidence/2026-11-14/sim-transplant15e-p23.md'];
  const dirtyOther = dirtyTracked.split('\n').filter(function (ln) {
    return ln && !allowed.some(function (a) { return ln === a; });
  }).join('\n');
  T.ok('tracked tree is clean apart from this proof + the prereg + the evidence file (uncommitted until this proof passes)', dirtyOther === '', dirtyOther.slice(0, 200) || '(only allowed files)');

  // ---- 11. Live picks — exactly the predicted conflicts, resolved --ours, tree equals prediction ----
  T.section('11. Live picks — two predicted conflicts each, --ours resolutions, tree equals prediction');
  T.ok('subject branch exists', (function () { try { git('rev-parse ' + SUBJECT_BRANCH); return true; } catch (e) { return false; } })(), SUBJECT_BRANCH + ' present');
  T.ok('subject tip is the live pick 1efa1c1ab (OVE-57)',
    git('rev-parse ' + SUBJECT_BRANCH).startsWith('1efa1c1ab') && git('log -1 --format=%s ' + SUBJECT_BRANCH) === 'OVE-57: triage tip quick-check after bond dawn', git('log -1 --format=%h\\ %s ' + SUBJECT_BRANCH).slice(0, 80));
  T.ok('subject tip tree is 1c6c8954… (the predicted narrowed-subject tree)',
    git('rev-parse ' + SUBJECT_BRANCH + '^{tree}') === PRED_TREE, git('rev-parse ' + SUBJECT_BRANCH + '^{tree}').slice(0, 12));
  T.ok('subject has exactly 2 commits on top of the 14+12 base (the two picks)',
    git('rev-list --count ' + BASE + '..' + SUBJECT_BRANCH) === '2', 'count=2');
  T.ok('subject pick-2 commit is c6e64d524 (OVE-33)',
    git('rev-parse ' + SUBJECT_BRANCH + '^1').startsWith('c6e64d524') && git('log -1 --format=%s ' + SUBJECT_BRANCH + '^1') === 'OVE-33: refresh stale quick proofs and fix outside-Muse fails', git('log -1 --format=%h\\ %s ' + SUBJECT_BRANCH + '^1').slice(0, 80));
  T.ok('subject pick-2 commit tree is 35857b15… (the predicted pick-2-resolved tree)',
    git('rev-parse ' + SUBJECT_BRANCH + '^1^{tree}') === PRED2_TREE, git('rev-parse ' + SUBJECT_BRANCH + '^1^{tree}').slice(0, 12));
  T.ok('subject pick-2 commit parent is the 14+12 base c8655548f',
    git('rev-parse ' + SUBJECT_BRANCH + '^1^1') === git('rev-parse ' + BASE), 'parent = base');
  const subjPick2Numstat = git('diff --numstat ' + BASE + ' ' + SUBJECT_BRANCH + '^1');
  T.ok('live pick-2 diff vs base is exactly pick 2 MINUS the two tooling files (10 files)',
    subjPick2Numstat.split('\n').sort().join('\n') === ['-\t-\t' + RECEIPT2, '2585\t0\tevidence/2026-11-08/phone-ove33-frame-736-r1.json', '2686\t0\tevidence/2026-11-08/phone-ove33-frame-844-r1.json', '4\t0\tscripts/godpath/test-mobile-combat-cadence.js', '1\t1\tscripts/godpath/test-occupation-panels.js', '3\t2\tscripts/godpath/test-time-save-crashes.js', '3\t0\tscripts/test-establishment-r20-fixes-20261020.js', '4\t0\tscripts/test-snippet-stage-direction.js', '4\t0\tsrc/js/conversation.js', '1\t0\tsw.js'].sort().join('\n'), subjPick2Numstat.replace(/\n/g, ' | '));
  T.ok('live pick-3 commit diff vs pick-2 tree is EXACTLY conversation.js +21/-2 (nothing else)',
    git('diff --numstat ' + SUBJECT_BRANCH + '^1 ' + SUBJECT_BRANCH) === '21\t2\tsrc/js/conversation.js', git('diff --numstat ' + SUBJECT_BRANCH + '^1 ' + SUBJECT_BRANCH).replace(/\n/g, ' | '));
  const subjNumstat = git('diff --numstat ' + BASE + ' ' + SUBJECT_BRANCH);
  T.ok('subject diff vs base is EXACTLY the predicted 10 files (conversation.js +25/-2, test-snippet +4, OVE-33 files, sw.js)',
    subjNumstat.split('\n').sort().join('\n') === ['-\t-\t' + RECEIPT2, '2585\t0\tevidence/2026-11-08/phone-ove33-frame-736-r1.json', '2686\t0\tevidence/2026-11-08/phone-ove33-frame-844-r1.json', '4\t0\tscripts/godpath/test-mobile-combat-cadence.js', '1\t1\tscripts/godpath/test-occupation-panels.js', '3\t2\tscripts/godpath/test-time-save-crashes.js', '3\t0\tscripts/test-establishment-r20-fixes-20261020.js', '4\t0\tscripts/test-snippet-stage-direction.js', '25\t2\tsrc/js/conversation.js', '1\t0\tsw.js'].sort().join('\n'), subjNumstat.replace(/\n/g, ' | '));
  T.ok('subject conversation.js blob is the merge-tree merged blob c816f9a2…',
    git('ls-tree ' + SUBJECT_BRANCH + ' -- src/js/conversation.js').indexOf(MT3_CONV_BLOB) !== -1, 'blob matches');
  T.ok('subject villager-objectives.js blob is the base blob 9afc522b… (byte-identical to the base)',
    git('ls-tree ' + SUBJECT_BRANCH + ' -- src/js/villager-objectives.js').indexOf(OBJ_OURS_BLOB) !== -1, 'objectives = base');
  T.ok('subject villager-objectives.js is byte-identical to the base (no diff)',
    git('diff --stat ' + BASE + ' ' + SUBJECT_BRANCH + ' -- src/js/villager-objectives.js') === '', 'identical');
  T.ok('subject balance-proof.json blob is the base blob d0c6a42f… (byte-identical to the base)',
    git('ls-tree ' + SUBJECT_BRANCH + ' -- scripts/balance-proof.json').indexOf(BAL_OURS_BLOB) !== -1, 'balance-proof = base');
  T.ok('subject balance-proof.json is byte-identical to the base (no diff)',
    git('diff --stat ' + BASE + ' ' + SUBJECT_BRANCH + ' -- scripts/balance-proof.json') === '', 'identical');
  T.ok('subject phone-frame-proof.json blob is the base blob b0691014… (byte-identical to the base)',
    git('ls-tree ' + SUBJECT_BRANCH + ' -- scripts/phone-frame-proof.json').indexOf(PHONE_OURS_BLOB) !== -1, 'phone-frame-proof = base');
  T.ok('subject phone-frame-proof.json is byte-identical to the base (no diff)',
    git('diff --stat ' + BASE + ' ' + SUBJECT_BRANCH + ' -- scripts/phone-frame-proof.json') === '', 'identical');
  T.ok('subject has NO pick-3 evidence receipt (absent at the base, removed from the subject)',
    (function () { try { execSync('git cat-file -e ' + SUBJECT_BRANCH + ':' + RECEIPT3, { cwd: REPO, stdio: 'pipe' }); return false; } catch (e) { return true; } })(), 'receipt absent');
  T.ok('subject HAS the pick-2 evidence receipt (the pick adds it)',
    (function () { try { execSync('git cat-file -e ' + SUBJECT_BRANCH + ':' + RECEIPT2, { cwd: REPO, stdio: 'pipe' }); return true; } catch (e) { return false; } })(), 'OVE-33 receipt present');
  T.ok('the pick\'s own diff DOES touch villager-objectives.js +21/-2 (the narrowing dropped it)',
    git('diff --numstat ' + PICK3 + '^1 ' + PICK3 + ' -- src/js/villager-objectives.js') === '21\t2\tsrc/js/villager-objectives.js', 'pick diff 21/2');
  T.ok('the pick\'s own diff DOES touch balance-proof.json +2/-2 (the narrowing dropped it)',
    git('diff --numstat ' + PICK3 + '^1 ' + PICK3 + ' -- scripts/balance-proof.json') === '2\t2\tscripts/balance-proof.json', 'pick diff 2/2');
  T.ok('the live subject carries tradeIntroDeferred in conversation.js (the deferred intro)',
    gitShow(SUBJECT_BRANCH, 'src/js/conversation.js').indexOf('tradeIntroDeferred') !== -1, 'tradeIntroDeferred landed');
  T.ok('the live subject carries the stage >= 1 gate in queueTraderIntro',
    gitShow(SUBJECT_BRANCH, 'src/js/conversation.js').indexOf('if (stage < 1) return;') !== -1, 'stage gate landed');
  T.ok('the live subject carries the OVE-33 quote check in conversation.js',
    gitShow(SUBJECT_BRANCH, 'src/js/conversation.js').indexOf('if (/"/.test(s)) return false;') !== -1, 'quote check landed');
  T.ok('the live subject carries the OVE-33 "They go still." assertion in the test file',
    gitShow(SUBJECT_BRANCH, 'scripts/test-snippet-stage-direction.js').indexOf('They go still.') !== -1, 'OVE-33 assertion landed');
  T.ok('the live subject carries NO objCommitGuardOffer in villager-objectives.js (the objectives half was dropped)',
    grepCount(SUBJECT_BRANCH, 'objCommitGuardOffer', 'src/js/villager-objectives.js') === 0, '0 hits on subject');
  const headBranch2 = git('rev-parse --abbrev-ref HEAD');
  T.ok('HEAD is back on the arm branch sim-transplant15e-p23-a after the live picks (worktree-only)', worktreeOnly(headBranch2 === 'sim-transplant15e-p23-a'), 'HEAD=' + headBranch2);
  let cherryPickHead2 = true;
  try { execSync('git rev-parse --verify CHERRY_PICK_HEAD', { cwd: REPO, stdio: 'pipe' }); } catch (e) { cherryPickHead2 = false; }
  T.ok('no cherry-pick is in progress (both picks were continued, not aborted)', cherryPickHead2 === false, 'CHERRY_PICK_HEAD absent');

  // ---- 12. Step verdict — survived 4/8, NOT-CARRIER, far-end days reproduced seed-for-seed ----
  T.section('12. Step verdict — t15e-p23 survived 4/8, NOT-CARRIER');
  const sumPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  const sum = JSON.parse(fs.readFileSync(sumPath, 'utf8'));
  T.ok('step summary step id is t15e-p23', sum.step === STEP, sum.step);
  T.ok('step summary anchor commit is the subject 1efa1c1ab502', sum.perSeed.every(function (s) { return s.anchorCommit === '1efa1c1ab502'; }), 'anchor ok');
  T.ok('step summary survived is 4/8', sum.survived === 4, 'survived=' + sum.survived);
  T.ok('step summary verdict is GOOD (bisect-rule classification)', sum.verdict === 'GOOD', sum.verdict);
  T.ok('step summary rank is REGIONAL_INTACT', sum.rankVerdict === 'REGIONAL_INTACT', sum.rankVerdict);
  T.ok('step summary median is 150d', sum.wall.medianDays === 150, 'median=' + sum.wall.medianDays);
  T.ok('step summary instrument errors are 0', sum.instrumentErrors === 0, 'errors=' + sum.instrumentErrors);
  T.ok('step summary wave-5 is 2/8', sum.wall.wave5 === 2, 'wave5=' + sum.wall.wave5);
  T.ok('step summary wave-4 is 8/8', sum.wall.wave4 === 8, 'wave4=' + sum.wall.wave4);
  T.ok('step summary regional is 7/8, village 1/8', sum.wall.regional === 7 && sum.wall.village === 1, 'regional=' + sum.wall.regional + ' village=' + sum.wall.village);
  T.ok('step summary national is 0, table 0, wins 0', sum.wall.national === 0 && sum.wall.table === 0 && sum.wall.wins === 0, 'national/table/wins 0');
  T.ok('step summary deaths total 629', sum.wall.deaths === 629, 'deaths=' + sum.wall.deaths);
  T.ok('step summary standing range is 150–325', sum.wall.standingRange[0] === 150 && sum.wall.standingRange[1] === 325, sum.wall.standingRange.join('–'));
  T.ok('step summary blooded is 4/8', sum.wall.blooded === 4, 'blooded=' + sum.wall.blooded);
  const perSeedDays = sum.perSeed.map(function (s) { return s.days; }).join('/');
  T.ok('per-seed days are 86/144/150/43/150/87/150/150 — EXACTLY the far-end days, seed for seed',
    perSeedDays === '86/144/150/43/150/87/150/150', perSeedDays);
  T.ok('per-seed days match the summary endpoints.far.days exactly',
    JSON.stringify(sum.perSeed.map(function (s) { return s.days; })) === JSON.stringify([86, 144, 150, 43, 150, 87, 150, 150]), 'matches far endpoint');
  T.ok('survivors are exactly 190393, 190395, 190397, 190398 (the far end\'s survivors)',
    JSON.stringify(sum.perSeed.filter(function (s) { return s.endReason === 'survived'; }).map(function (s) { return s.seed; })) === JSON.stringify([190393, 190395, 190397, 190398]), 'survivors match');
  T.ok('every seed ran with the fix swapped in (standingSha f8fda4295a99, standingFix true)',
    sum.perSeed.every(function (s) { return s.standingFix === true && s.standingSha === 'f8fda4295a99'; }), 'fix on all seeds');
  T.ok('every seed ran the far-end own policy (policySha a7ff5c516440, 12-char recorded form)',
    sum.perSeed.every(function (s) { return s.policySha === 'a7ff5c516440'; }), 'policy ok');
  T.ok('every seed ran with 0 instrument errors',
    sum.perSeed.every(function (s) { return s.errors === 0; }), 'errors 0 on all seeds');
  T.ok('death-cause shares are combat-dominated (villager combat 267, combat 130, expedition 126, the wild 74)',
    sum.deathCauses.counts['villager combat'] === 267 && sum.deathCauses.counts.combat === 130 && sum.deathCauses.counts.expedition === 126 && sum.deathCauses.counts['the wild'] === 74, 'causes match');
  T.ok('classifyTransplant(4) = NOT-CARRIER (the step verdict)', classifyTransplant(sum.survived) === 'NOT-CARRIER', '4/8 → NOT-CARRIER');
  T.ok('no AMBIGUOUS re-run is owed (4/8 is not 2/8)', sum.survived !== 2, 'no re-run');
  T.ok('tribute-ready is 1/8 (190397, veterans 2)',
    sum.perSeed.filter(function (s) { return s.tribute && s.tribute.ready; }).length === 1, 'tribute-ready 1/8');
  const driverLog = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log'), 'utf8');
  T.ok('driver log records the analyzer classification GOOD (survived 4/8) and rank REGIONAL_INTACT',
    driverLog.indexOf('culpritbisect-a t15e-p23: GOOD (survived 4/8)') !== -1 && driverLog.indexOf('rank: REGIONAL_INTACT') !== -1, 'analyzer classification present');
  T.ok('driver log records the fix sha f8fda4295a99 on all 8 seeds',
    (driverLog.match(/f8fda4295a99/g) || []).length === 8, 'fix sha on 8 seeds');
  T.ok('on-disk standing.js is byte-identical to the arm-branch HEAD (native restored after the step)',
    sha256(fs.readFileSync(path.join(REPO, 'src', 'js', 'standing.js'), 'utf8')) === sha256(gitShow('HEAD', 'src/js/standing.js')), 'standing.js restored');
  // The four scratch files are TRACKED on master (the step tooling
  // lives there), so "no scratch left" means: none of them shows as
  // untracked or modified after the step — the detached-checkout
  // scratch copies are gone and the tracked files are untouched.
  const statusNow = git('status --porcelain');
  let scratchLeft = false;
  for (const f of ['scripts/culpritbisect-driver-20261113.js', 'scripts/culpritbisect-analyze-20261113.js', 'scripts/masterregress-analyze-20261113.js', 'scripts/vetfirst-instrument-20261111.js']) {
    if (statusNow.indexOf(f) !== -1) scratchLeft = true;
  }
  T.ok('no step tooling scratch residue in git status (tracked files untouched, scratch copies gone)', scratchLeft === false, 'status clean of scratch');
  const evMdPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15e-p23.md');
  const evMd = fs.existsSync(evMdPath) ? fs.readFileSync(evMdPath, 'utf8') : '';
  T.ok('evidence file exists', evMd.length > 0, evMdPath);
  T.ok('evidence file records the verdict NOT-CARRIER', evMd.indexOf('VERDICT: NOT-CARRIER') !== -1, 'verdict present');
  T.ok('evidence file records survived 4/8 and the per-seed days 86/144/150/43/150/87/150/150',
    evMd.indexOf('4/8') !== -1 && evMd.indexOf('86/144/150/43/150/87/150/150') !== -1, 'survival present');
  T.ok('evidence file records the subject hash 1efa1c1ab and the predicted tree 1c6c8954…',
    evMd.indexOf('1efa1c1ab') !== -1 && evMd.indexOf('1c6c8954') !== -1, 'subject present');
  T.ok('evidence file records wave-5 2/8, median 150d, deaths 629',
    evMd.indexOf('wave-5 2/8') !== -1 && evMd.indexOf('150d') !== -1 && evMd.indexOf('629') !== -1, 'secondaries present');
  T.ok('evidence file records the telemetry deviation check refusal (recorder-corpus, baseline NOT rolled)',
    evMd.indexOf('Telemetry deviation check') !== -1 && evMd.indexOf('Baseline NOT') !== -1, 'telemetry note present');
  T.ok('evidence file records that the villager-objectives.js half stays unmeasured (Phase 4 dependency)',
    evMd.indexOf('UNMEASURED') !== -1 && evMd.indexOf('objCommitGuardOffer') !== -1, 'unmeasured note present');
  T.ok('evidence file records the sense-test (dialogue paths unexercised: 0 trader mentions in the corpus)',
    evMd.indexOf('SENSE-TESTING') !== -1 && evMd.indexOf('0 trader mentions') !== -1, 'sense note present');
  T.ok('evidence file records the seed-for-seed far-end identity (same days on all 8 seeds)',
    evMd.indexOf('seed-for-seed') !== -1 || evMd.indexOf('seed for seed') !== -1, 'identity note present');
  T.ok('evidence file records the step duration and STEP id t15e-p23',
    evMd.indexOf('t15e-p23') !== -1, 'STEP present');
  T.ok('evidence file records the metric review section',
    evMd.indexOf('Metric review') !== -1, 'metric review present');
  T.ok('evidence file records the write-flap step failure and recovery (infrastructure)',
    evMd.indexOf('write flap') !== -1 || evMd.indexOf('FLAP') !== -1, 'infra note present');

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
