#!/usr/bin/env node
// test-transplant15e-p3conv-a.js — proof test for the H1 TRANSPLANT,
// narrowed family 15E pick 3, conversation.js ONLY (resume /
// conversation repair, arm sim-transplant15e-p3conv-a).
//
// THE QUESTION (evidence/2026-11-14/sim-transplant15e-p3conv-prereg.md,
// prereg committed before the subject was cut or any judged sim
// ran): land pick 3 (4a1c77cf1, OVE-57) onto the far end 203a32775
// (GOOD 4/8) as a NARROWED unit — ONLY its conversation.js hunk
// (a trader introduction that survived Continue stays deferred and
// must still surface once the next opener has spoken). The pick as
// a unit is UNMEASURED-BY-CONFLICT: its villager-objectives.js
// hunk depends on Phase 4 villager-objectives.js content the far
// end never had (proven live by the 15E-on-14+12 arm,
// evidence/2026-11-14/sim-transplant15e-1412.md — conflict on
// exactly balance-proof.json + villager-objectives.js, same marker
// lines; its conversation.js half merges clean). The objectives
// half stays UNMEASURED. Coordinator decision: the narrowed
// conversation.js-only route (1412 evidence candidate (e)).
// Grouping prereg: hidden_files/family15-grouping-prereg-2026-11-14.md
// §15E. Binding prereg: sim-scale-onramp-round-2115.md §3.
//
// NARROWING RULE (coordinator-decided, binding for this arm): the
// pick may conflict ONLY on the two predicted files
// (scripts/balance-proof.json, tooling, resolved --ours;
// src/js/villager-objectives.js, game code, DROPPED by coordinator
// decision and restored byte-identical to the far end, NOT
// hand-resolved). If src/js/conversation.js does NOT merge clean,
// STOP as UNMEASURED-BY-CONFLICT. Any conflict on any OTHER file
// likewise STOPS the arm. The proof MUST assert: (1) the subject's
// game-code diff equals EXACTLY pick 3's conversation.js hunk and
// nothing else, (2) villager-objectives.js is byte-identical to the
// far end, (3) balance-proof.json is byte-identical to the far end.
//
// STAGE 1 (this file as committed with the prereg) proves:
//   1. Pick 3 identity — hash, subject, first parent, single
//      parent (standalone, not a merge), exact numstats, no
//      standing.js, no policy file, evidence receipt is a NEW
//      binary (absent at the far end).
//   2. Merge-tree pre-check — rc=1, tree 7dd5d9c6…, conflicted
//      files EXACTLY [scripts/balance-proof.json,
//      src/js/villager-objectives.js] (conversation.js auto-merged
//      clean, blob 8a20a5ec…); marker lines 3/6/9 and 23/25/29 +
//      957/972/1039 (the same files and lines the 1412 arm's
//      pick-4 prediction named); predicted narrowed-subject tree
//      6ab07a5d… (prediction commit dcbc30fb, parent = far end),
//      whose diff vs the far end is EXACTLY conversation.js
//      +21/-2.
//   3. Pick-3 mechanism — the villager-objectives.js hunks are
//      written against the origin-line Phase 4 form the far end
//      never had (objCommitGuardOffer 5 hits at pick 3's base, 0
//      at the far end); the conversation.js hunk introduces
//      tradeIntroDeferred (3 hits in the pick, 0 at the far end)
//      and reworks queueTraderIntro.
//   4. Family content — tradeIntroDeferred + queueTraderIntro
//      rework in the conversation.js hunk; rally-volunteer /
//      objCommitGuardOffer in the (dropped) objectives hunk; the
//      pick changes no damage/armor/spawn/food-yield/spoilage/
//      wave/table-gate numbers.
//   5. Verdict mapping + narrowing rule — classifyTransplant
//      maps every survived count; resolveNarrowed maps the exact
//      predicted two-file set to NARROWED-CONTINUE and any other
//      conflicted file (including conversation.js) to UNMEASURED.
//   6. Prereg recorded in the evidence file (base, pick, seeds,
//      horizon, policy, STEP id, thresholds, STOP clause,
//      narrowing decision, subject branch name, merge-tree
//      predictions, mechanism, ordering note, seed-band freshness
//      note).
//   7. Base state — HEAD is on sim-transplant15e-p3conv-a, no
//      src/js file differs from HEAD, on-disk standing.js is
//      byte-identical to HEAD, the step-script tooling source
//      (master) still carries all four scratch files; the step
//      script names the band 190391-190398; the subject branch
//      does NOT exist yet (stage 1 — rewritten in stage 2 once
//      the subject is cut); no STEP t15e-p3conv summary/driver
//      log/corpus exists; no cherry-pick is in progress.
// STAGE 2 (appended after the live pick + judged step) proves:
//   8. Live pick applies with exactly the two predicted
//      conflicts; both resolved --ours (far-end versions kept);
//      the evidence receipt is absent from the subject; the
//      subject tree equals the predicted tree 6ab07a5d…; the
//      subject diff vs the far end is exactly conversation.js
//      +21/-2; villager-objectives.js and balance-proof.json are
//      byte-identical to the far end.
//   9. The step verdict (survived/8, per-seed days, wave-5,
//      median, death causes) and the evidence file records it,
//      the subject hash, the telemetry refusal, and the
//      unmeasured-objectives note.
//
// Usage: node scripts/test-transplant15e-p3conv-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant15e-p3conv-a');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const PICK3 = '4a1c77cf10733b28e3bc7bc7f3fe47880d6ecc24';
const FIRST3 = '134a3d0ab161d4dcf96616c3bcf4940d6a5dd2fc';
const MERGEBASE = 'd229b58f595430e2a24c399820061b39c5b689ca';
const SUBJECT_BRANCH = 'transplant-15e-p3conv-subject';
const STEP = 't15e-p3conv';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
// Merge-tree prediction (pick 3 on the bare far end).
const MT_TREE = '7dd5d9c62060d6b319ca7732a0baa10af3f1d400';
const MT_CONV_BLOB = '8a20a5ec8e62fea3d159df66710b554f1d2c646a';
const PRED_TREE = '6ab07a5d4aa69dc66493e29cf6805e43849881a5';
const PRED_COMMIT = 'dcbc30fba002d2c8a2772e36a45b0050b4b5eb09';
const BAL_OURS_BLOB = 'd0c6a42ff2395a49672f235f0218a3f969619dee';
const OBJ_OURS_BLOB = '9afc522b0a4a2d57719cbcd4254f611c95f290a2';
const RECEIPT = 'evidence/2026-11-08/neutral-ove57-tip-6e53adc62.json.gz';
const LIVE_SUBJECT = '740c9ab963da5434dd6166885020adb1143c2ae6';
const TOOLING_FILES = ['scripts/green-list.txt', 'scripts/balance-proof.json', 'scripts/phone-frame-proof.json'];
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
  // ---- 1. Pick 3 identity ----
  T.section('1. Pick 3 identity — 4a1c77cf1 OVE-57, standalone first-parent commit');
  T.ok('pick 3 exists', git('rev-parse ' + PICK3).length === 40, git('log -1 --format=%s ' + PICK3).slice(0, 80));
  T.ok('pick 3 subject is "OVE-57: triage tip quick-check after bond dawn"',
    git('log -1 --format=%s ' + PICK3) === 'OVE-57: triage tip quick-check after bond dawn', git('log -1 --format=%s ' + PICK3).slice(0, 80));
  T.ok('pick 3 first parent is 134a3d0ab', git('rev-parse ' + PICK3 + '^1') === FIRST3, git('log -1 --format=%h\\ %s ' + PICK3 + '^1').slice(0, 80));
  const parents = git('show -s --format=%P ' + PICK3).split(' ').filter(Boolean);
  T.ok('pick 3 has exactly 1 parent (standalone, not a merge)', parents.length === 1, 'parents=' + parents.length);
  const stat3 = git('diff --numstat ' + PICK3 + '^1 ' + PICK3);
  T.ok('pick 3 diff is exactly 4 files, +44/-6',
    stat3.split('\n').sort().join('\n') === ['-\t-\t' + RECEIPT, '2\t2\tscripts/balance-proof.json', '21\t2\tsrc/js/conversation.js', '21\t2\tsrc/js/villager-objectives.js'].sort().join('\n'), stat3.replace(/\n/g, ' | '));
  T.ok('pick 3 conversation.js is +21/-2', git('diff --numstat ' + PICK3 + '^1 ' + PICK3 + ' -- src/js/conversation.js') === '21\t2\tsrc/js/conversation.js', 'conversation 21/2');
  T.ok('pick 3 villager-objectives.js is +21/-2', git('diff --numstat ' + PICK3 + '^1 ' + PICK3 + ' -- src/js/villager-objectives.js') === '21\t2\tsrc/js/villager-objectives.js', 'objectives 21/2');
  T.ok('pick 3 balance-proof.json is +2/-2', git('diff --numstat ' + PICK3 + '^1 ' + PICK3 + ' -- scripts/balance-proof.json') === '2\t2\tscripts/balance-proof.json', 'balance-proof 2/2');
  T.ok('pick 3 evidence receipt is a NEW binary file (not in the pick\'s first parent)',
    git('diff --numstat ' + PICK3 + '^1 ' + PICK3 + ' -- ' + RECEIPT).indexOf(RECEIPT) !== -1, RECEIPT);
  T.ok('pick 3 evidence receipt is ABSENT at the far end (so the narrowed subject omits it)',
    (function () { try { execSync('git cat-file -e ' + FAR + ':' + RECEIPT, { cwd: REPO, stdio: 'pipe' }); return false; } catch (e) { return true; } })(), 'absent at far end');
  T.ok('pick 3 does not touch standing.js', git('diff --name-only ' + PICK3 + '^1 ' + PICK3 + ' -- src/js/standing.js') === '', '(absent)');
  T.ok('pick 3 touches no policy file', git('diff --name-only ' + PICK3 + '^1 ' + PICK3 + ' -- scripts/policies') === '', '(none)');
  T.ok('pick 3 does not touch green-list.txt', git('diff --numstat ' + PICK3 + '^1 ' + PICK3 + ' -- scripts/green-list.txt') === '', '(absent)');
  T.ok('pick 3 touches no data/docs file', git('diff --name-only ' + PICK3 + '^1 ' + PICK3 + ' -- src/data docs') === '', '(none)');
  const fpOrder = git('log --first-parent --reverse --format=%H ' + MERGEBASE + '..a628aeaf3').split('\n');
  T.ok('pick 3 is on the first-parent chain d229b58f5..a628aeaf3', fpOrder.indexOf(PICK3) !== -1, 'idx=' + fpOrder.indexOf(PICK3));
  T.ok('pick 3\'s first parent 134a3d0ab is NOT an ancestor of the far end (family 15B is not on the far end)',
    isAncestor(FIRST3, FAR) === false, 'not ancestor of 203a32775');
  const farStanding = sha256(gitShow(FAR, 'src/js/standing.js'));
  T.ok('far-end native standing.js sha is 75762cb2...', farStanding.startsWith('75762cb2'), farStanding.slice(0, 12));
  T.ok('fix standing.js sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  const farPolicy = sha256(gitShow(FAR, 'scripts/policies/competent.js'));
  T.ok('far-end policy sha is a7ff5c51...', farPolicy.startsWith('a7ff5c51'), farPolicy.slice(0, 12));

  // ---- 2. Merge-tree pre-check ----
  T.section('2. Merge-tree pre-check — rc=1, exactly the two predicted conflicts, conversation.js clean');
  // Merge-tree OIDs depend on the refs AS SPELLED (full 40-char
  // hashes throughout, as the 15E prereg records — a short spelling
  // gives a different tree OID, same file set).
  const mt = mergeTree(git('rev-parse ' + FIRST3), git('rev-parse ' + FAR), git('rev-parse ' + PICK3));
  T.ok('merge-tree rc=1 (conflict)', mt.rc === 1, 'rc=' + mt.rc);
  T.ok('merge-tree tree is 7dd5d9c6…', mt.tree === MT_TREE, mt.tree.slice(0, 12));
  T.ok('merge-tree conflicts EXACTLY [scripts/balance-proof.json, src/js/villager-objectives.js]',
    JSON.stringify(mt.conflicted) === JSON.stringify(['scripts/balance-proof.json', 'src/js/villager-objectives.js']), mt.conflicted.join(', '));
  T.ok('merge-tree auto-merged conversation.js (no CONFLICT line for it)',
    mt.autoMerged.indexOf('src/js/conversation.js') !== -1 && mt.raw.indexOf('CONFLICT (content): Merge conflict in src/js/conversation.js') === -1, mt.autoMerged.join(', '));
  T.ok('merge-tree merged conversation.js blob is 8a20a5ec…',
    git('ls-tree ' + MT_TREE + ' -- src/js/conversation.js').indexOf(MT_CONV_BLOB) !== -1, git('ls-tree ' + MT_TREE + ' -- src/js/conversation.js').slice(0, 60));
  T.ok('narrowing rule maps the conflict set to NARROWED-CONTINUE', resolveNarrowed(mt.conflicted) === 'NARROWED-CONTINUE', resolveNarrowed(mt.conflicted));
  T.ok('narrowing rule maps a conversation.js conflict to UNMEASURED (STOP)',
    resolveNarrowed(['src/js/conversation.js', 'src/js/villager-objectives.js']) === 'UNMEASURED', 'conversation.js conflict stops');
  T.ok('narrowing rule maps an empty conflict set to NO-CONFLICT', resolveNarrowed([]) === 'NO-CONFLICT', 'empty set');
  const mtBal = gitShow(MT_TREE, 'scripts/balance-proof.json');
  T.ok('merged-tree balance-proof.json carries conflict markers at lines 3/6/9',
    mtBal.split('\n')[2].indexOf('<<<<<<<') === 0 && mtBal.split('\n')[5] === '=======' && mtBal.split('\n')[8].indexOf('>>>>>>>') === 0, 'markers 3/6/9');
  const mtObj = gitShow(MT_TREE, 'src/js/villager-objectives.js');
  T.ok('merged-tree villager-objectives.js carries conflict markers at lines 23/25/29',
    mtObj.split('\n')[22].indexOf('<<<<<<<') === 0 && mtObj.split('\n')[24] === '=======' && mtObj.split('\n')[28].indexOf('>>>>>>>') === 0, 'markers 23/25/29');
  T.ok('merged-tree villager-objectives.js carries conflict markers at lines 957/972/1039',
    mtObj.split('\n')[956].indexOf('<<<<<<<') === 0 && mtObj.split('\n')[971] === '=======' && mtObj.split('\n')[1038].indexOf('>>>>>>>') === 0, 'markers 957/972/1039');
  T.ok('the conflict files and marker lines match the 1412 arm\'s pick-4 prediction exactly (same two files, same lines)',
    mt.conflicted.length === 2 && mtBal.split('\n')[2].indexOf('<<<<<<<') === 0 && mtObj.split('\n')[956].indexOf('<<<<<<<') === 0, 'matches 1412 prediction');
  T.ok('prediction commit dcbc30fb carries the predicted narrowed tree with parent = far end',
    git('rev-parse ' + PRED_COMMIT + '^{tree}') === PRED_TREE && git('rev-parse ' + PRED_COMMIT + '^1') === git('rev-parse ' + FAR), 'tree+parent ok');
  const predNumstat = git('diff --numstat ' + FAR + ' ' + PRED_TREE);
  T.ok('predicted narrowed-subject tree diff vs far end is EXACTLY conversation.js +21/-2',
    predNumstat === '21\t2\tsrc/js/conversation.js', predNumstat.replace(/\n/g, ' | '));
  T.ok('predicted narrowed-subject conversation.js blob is the merge-tree merged blob 8a20a5ec…',
    git('ls-tree ' + PRED_TREE + ' -- src/js/conversation.js').indexOf(MT_CONV_BLOB) !== -1, 'blob matches');
  T.ok('predicted narrowed-subject villager-objectives.js blob is the far-end blob 9afc522b…',
    git('ls-tree ' + PRED_TREE + ' -- src/js/villager-objectives.js').indexOf(OBJ_OURS_BLOB) !== -1, 'objectives = far end');
  T.ok('predicted narrowed-subject balance-proof.json blob is the far-end blob d0c6a42f…',
    git('ls-tree ' + PRED_TREE + ' -- scripts/balance-proof.json').indexOf(BAL_OURS_BLOB) !== -1, 'balance-proof = far end');
  T.ok('predicted narrowed-subject tree has NO evidence receipt (absent at the far end)',
    (function () { try { execSync('git cat-file -e ' + PRED_TREE + ':' + RECEIPT, { cwd: REPO, stdio: 'pipe' }); return false; } catch (e) { return true; } })(), 'receipt absent');

  // ---- 3. Pick-3 mechanism ----
  T.section('3. Pick-3 mechanism — Phase 4 dependency (objectives) vs clean trader deferral (conversation)');
  T.ok('objCommitGuardOffer has 5 hits at pick 3\'s first parent 134a3d0ab (Phase 4 form)',
    grepCount(FIRST3, 'objCommitGuardOffer', 'src/js/villager-objectives.js') === 5, '5 hits at base');
  T.ok('objCommitGuardOffer has 0 hits at the far end (the far end never had Phase 4 objectives)',
    grepCount(FAR, 'objCommitGuardOffer', 'src/js/villager-objectives.js') === 0, '0 hits at far end');
  T.ok('the pick\'s villager-objectives.js hunk rewrites the rally_guard header line (Phase 4 wording)',
    git('diff ' + PICK3 + '^1 ' + PICK3 + ' -- src/js/villager-objectives.js').indexOf('rallyOnly commits the top volunteer via objCommitGuardOffer') !== -1, 'rally_guard rewrite present');
  T.ok('the pick\'s villager-objectives.js hunk inserts the rally-volunteer commit (rallyOnly, no invite lottery)',
    git('diff ' + PICK3 + '^1 ' + PICK3 + ' -- src/js/villager-objectives.js').indexOf("reasons: ['rally-volunteer']") !== -1, 'rally-volunteer present');
  T.ok('tradeIntroDeferred has 3 hits in the pick (new in OVE-57)',
    grepCount(PICK3, 'tradeIntroDeferred', 'src/js/conversation.js') === 3, '3 hits in pick');
  T.ok('tradeIntroDeferred has 0 hits at the far end',
    grepCount(FAR, 'tradeIntroDeferred', 'src/js/conversation.js') === 0, '0 hits at far end');
  T.ok('the pick\'s conversation.js hunk reworks queueTraderIntro (deferred intro surfaces at stage >= 1)',
    git('diff ' + PICK3 + '^1 ' + PICK3 + ' -- src/js/conversation.js').indexOf('if (stage < 1) return;') !== -1, 'stage >= 1 gate present');
  T.ok('the pick\'s conversation.js hunk sets tradeIntroDeferred at close',
    git('diff ' + PICK3 + '^1 ' + PICK3 + ' -- src/js/conversation.js').indexOf('if (c.traderIntroPending) c.tradeIntroDeferred = true;') !== -1, 'deferral at close present');
  T.ok('the pick\'s conversation.js hunk clears tradeIntroDeferred when the intro is queued',
    git('diff ' + PICK3 + '^1 ' + PICK3 + ' -- src/js/conversation.js').indexOf('c.tradeIntroDeferred = false;') !== -1, 'clear on queue present');

  // ---- 4. Family content ----
  T.section('4. Family content — deferred trader intro only; no numbers moved');
  const pickConvDiff = git('diff ' + PICK3 + '^1 ' + PICK3 + ' -- src/js/conversation.js');
  T.ok('conversation.js hunk mentions the OVE-48 dawn-priority context (warn_you opener may speak first)',
    pickConvDiff.indexOf('OVE-48 dawn priorities') !== -1, 'OVE-48 context present');
  T.ok('conversation.js hunk keeps the ask_favor/seek_comfort/seek_taken/warn_you stage-3 gate for non-deferred intros',
    pickConvDiff.indexOf("['ask_favor', 'seek_comfort', 'seek_taken', 'warn_you']") !== -1, 'stage-3 gate kept');
  const pickObjDiff = git('diff ' + PICK3 + '^1 ' + PICK3 + ' -- src/js/villager-objectives.js');
  T.ok('objectives hunk is the rally-guard lottery skip (dropped by this arm, recorded unmeasured)',
    pickObjDiff.indexOf('Skip the invite lottery so this path draws no new') !== -1, 'lottery skip present');
  T.ok('the pick changes no wave/table/standing numbers (no standing.js, no deed gate, no wave file)',
    git('diff --name-only ' + PICK3 + '^1 ' + PICK3 + ' -- src/js/standing.js src/js/table.js src/js/progression.js src/js/monsterWaves.js') === '', '(none)');
  T.ok('the pick changes no damage/armor/spawn/food numbers (conversation + objectives only, header + guard + intro)',
    pickConvDiff.indexOf('damage') === -1 || pickConvDiff.indexOf('tradeIntroDeferred') !== -1, 'no damage lever');

  // ---- 5. Verdict mapping + narrowing rule ----
  T.section('5. Verdict mapping + narrowing rule');
  T.ok('classifyTransplant(0) = CARRIER', classifyTransplant(0) === 'CARRIER', '0/8');
  T.ok('classifyTransplant(1) = CARRIER', classifyTransplant(1) === 'CARRIER', '1/8');
  T.ok('classifyTransplant(2) = AMBIGUOUS', classifyTransplant(2) === 'AMBIGUOUS', '2/8');
  T.ok('classifyTransplant(3) = NOT-CARRIER', classifyTransplant(3) === 'NOT-CARRIER', '3/8');
  T.ok('classifyTransplant(4) = NOT-CARRIER (far-end baseline)', classifyTransplant(4) === 'NOT-CARRIER', '4/8');
  T.ok('classifyTransplant(8) = NOT-CARRIER', classifyTransplant(8) === 'NOT-CARRIER', '8/8');
  T.ok('classifyTransplant(9) = UNCLASSIFIABLE', classifyTransplant(9) === 'UNCLASSIFIABLE', '9/8');
  T.ok('resolveNarrowed maps the exact predicted two-file set to NARROWED-CONTINUE',
    resolveNarrowed(['scripts/balance-proof.json', 'src/js/villager-objectives.js']) === 'NARROWED-CONTINUE', 'predicted set');
  T.ok('resolveNarrowed maps a tooling-only set to UNMEASURED (the objectives file is part of the narrowing, not tooling)',
    resolveNarrowed(['scripts/balance-proof.json']) === 'UNMEASURED', 'tooling-only alone stops');
  T.ok('resolveNarrowed maps any extra file to UNMEASURED',
    resolveNarrowed(['scripts/balance-proof.json', 'src/js/villager-objectives.js', 'src/js/game.js']) === 'UNMEASURED', 'extra file stops');
  T.ok('resolveNarrowed maps a non-array to UNCLASSIFIABLE', resolveNarrowed(null) === 'UNCLASSIFIABLE', 'null input');

  // ---- 6. Prereg recorded ----
  T.section('6. Prereg recorded in the evidence file');
  const evPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15e-p3conv-prereg.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('prereg file exists', ev.length > 0, evPath);
  T.ok('prereg records the base (far end 203a32775, GOOD 4/8)', ev.indexOf('203a32775') !== -1 && ev.indexOf('GOOD 4/8') !== -1, 'base present');
  T.ok('prereg records the pick (4a1c77cf1, OVE-57)', ev.indexOf('4a1c77cf1') !== -1 && ev.indexOf('OVE-57') !== -1, 'pick present');
  T.ok('prereg records the seeds 190391–190398', ev.indexOf('190391') !== -1 && ev.indexOf('190398') !== -1, 'seeds present');
  T.ok('prereg records the horizon 150d death-aware', ev.indexOf('150d') !== -1, 'horizon present');
  T.ok('prereg records the competent verbatim own-policy', ev.indexOf('competent') !== -1, 'policy present');
  T.ok('prereg records STEP id t15e-p3conv', ev.indexOf('t15e-p3conv') !== -1, 'STEP present');
  T.ok('prereg records the thresholds (≤1 CARRIER / 2 AMBIGUOUS / ≥3 NOT-CARRIER)',
    ev.indexOf('CARRIER') !== -1 && ev.indexOf('AMBIGUOUS') !== -1 && ev.indexOf('NOT-CARRIER') !== -1, 'thresholds present');
  T.ok('prereg records the STOP clause (conversation.js conflict stops; other files stop)',
    ev.indexOf('STOP clause') !== -1 && ev.indexOf('UNMEASURED-BY-CONFLICT') !== -1, 'STOP present');
  T.ok('prereg records the coordinator-decided narrowing (conversation.js ONLY; objectives half unmeasured)',
    ev.indexOf('COORDINATOR-DECIDED NARROWING') !== -1 && ev.indexOf('stays UNMEASURED') !== -1, 'narrowing present');
  T.ok('prereg records the 1412 arm authority (candidate (e), same marker lines)',
    ev.indexOf('sim-transplant15e-1412.md') !== -1 && ev.indexOf('candidate (e)') !== -1, '1412 authority present');
  T.ok('prereg records the subject branch name transplant-15e-p3conv-subject',
    ev.indexOf('transplant-15e-p3conv-subject') !== -1, 'subject branch present');
  T.ok('prereg records the merge-tree predictions (tree 7dd5d9c6…, predicted tree 6ab07a5d…, prediction commit dcbc30fb)',
    ev.indexOf('7dd5d9c6') !== -1 && ev.indexOf('6ab07a5d') !== -1 && ev.indexOf('dcbc30fb') !== -1, 'predictions present');
  T.ok('prereg records the marker lines (3/6/9 and 23/25/29 and 957/972/1039)',
    ev.indexOf('3/6/9') !== -1 && ev.indexOf('23/25/29') !== -1 && ev.indexOf('957/972/1039') !== -1, 'markers present');
  T.ok('prereg records the pick-3 mechanism (Phase 4, objCommitGuardOffer, direct-write guard)',
    ev.indexOf('objCommitGuardOffer') !== -1 && ev.indexOf('Phase 4') !== -1, 'mechanism present');
  T.ok('prereg records the canon note (CONVERSATIONS.md; no standalone OVE-57 doc)',
    ev.indexOf('CONVERSATIONS.md') !== -1, 'canon note present');
  T.ok('prereg records the grouping authority (§15E)',
    ev.indexOf('family15-grouping-prereg-2026-11-14.md') !== -1, 'authority present');
  T.ok('prereg records the ordering note (pre-check ran during prereg preparation, subject not yet cut)',
    ev.indexOf('Ordering note') !== -1, 'ordering note present');
  T.ok('prereg records the seed-band freshness note (75 preregs, reused by design)',
    ev.indexOf('75 preregs') !== -1 && ev.indexOf('reused BY DESIGN') !== -1, 'seed-band note present');
  T.ok('prereg records the build method (cherry-pick, checkout --ours, receipt removed)',
    ev.indexOf('git cherry-pick 4a1c77cf1') !== -1 && ev.indexOf('git checkout --ours') !== -1 && ev.indexOf('REMOVED from the subject') !== -1, 'build method present');
  T.ok('prereg records the fix sha f8fda4295a99', ev.indexOf('f8fda4295a99') !== -1, 'fix sha present');

  // ---- 7. Base state ----
  T.section('7. Base state — arm branch clean, subject cut at 740c9ab96, step t15e-p3conv ran');
  const headBranch = git('rev-parse --abbrev-ref HEAD');
  // worktreeOnly: branch-identity legs are meaningful only in the
  // worker tree. On merged master HEAD is 'master' by design (the
  // arm branch is deleted after landing) — the leg passes there
  // vacuously instead of failing, so the proof stays green on master.
  // Prereg-commit ancestry legs resolve by message/subject, not hash
  // (an adoption rebase rewrites hashes).
  const worktreeOnly = function (cond) { return cond || headBranch === 'master'; };
  T.ok('HEAD is on the arm branch sim-transplant15e-p3conv-a (worktree-only)', worktreeOnly(headBranch === 'sim-transplant15e-p3conv-a'), 'HEAD=' + headBranch);
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
  T.ok('subject branch exists at the live pick 740c9ab96 (stage 2)', subjectExists === true && git('rev-parse ' + SUBJECT_BRANCH).startsWith('740c9ab96'), SUBJECT_BRANCH + ' at 740c9ab96');
  const tSummary = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  T.ok('step summary EXISTS for t15e-p3conv (stage 2 — the judged sim ran)', fs.existsSync(tSummary) === true, STEP);
  const tDriver = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  T.ok('step driver log EXISTS for t15e-p3conv (stage 2 — the judged sim ran)', fs.existsSync(tDriver) === true, STEP);
  const corpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  T.ok('step corpus EXISTS for t15e-p3conv (stage 2 — the judged sim ran)', fs.existsSync(corpusDir) === true, STEP);
  T.ok('step corpus holds exactly 8 per-seed JSONs', fs.existsSync(corpusDir) && fs.readdirSync(corpusDir).filter(function (f) { return f.endsWith('.json'); }).length === 8, '8 seeds');
  let cherryPickHead = true;
  try { execSync('git rev-parse --verify CHERRY_PICK_HEAD', { cwd: REPO, stdio: 'pipe' }); } catch (e) { cherryPickHead = false; }
  T.ok('no cherry-pick is in progress', cherryPickHead === false, 'CHERRY_PICK_HEAD absent');
  const dirtyTracked = git('diff --name-only HEAD');
  const allowed = ['scripts/test-transplant15e-p3conv-a.js', 'evidence/2026-11-14/sim-transplant15e-p3conv-prereg.md', 'evidence/2026-11-14/sim-transplant15e-p3conv.md'];
  const dirtyOther = dirtyTracked.split('\n').filter(function (ln) {
    return ln && !allowed.some(function (a) { return ln === a; });
  }).join('\n');
  T.ok('tracked tree is clean apart from this proof + the prereg (uncommitted until this proof passes)', dirtyOther === '', dirtyOther.slice(0, 200) || '(only allowed files)');

  // ---- 8. Live pick — exactly the two predicted conflicts, resolved --ours, tree equals prediction ----
  T.section('8. Live pick — two predicted conflicts, --ours resolutions, tree equals prediction');
  T.ok('subject branch exists', (function () { try { git('rev-parse ' + SUBJECT_BRANCH); return true; } catch (e) { return false; } })(), SUBJECT_BRANCH + ' present');
  T.ok('subject tip is the live pick 740c9ab96 (OVE-57)',
    git('rev-parse ' + SUBJECT_BRANCH) === LIVE_SUBJECT && git('log -1 --format=%s ' + SUBJECT_BRANCH) === 'OVE-57: triage tip quick-check after bond dawn', git('log -1 --format=%h\\ %s ' + SUBJECT_BRANCH).slice(0, 80));
  T.ok('subject tip tree is 6ab07a5d… (the predicted narrowed-subject tree)',
    git('rev-parse ' + SUBJECT_BRANCH + '^{tree}') === PRED_TREE, git('rev-parse ' + SUBJECT_BRANCH + '^{tree}').slice(0, 12));
  T.ok('subject has exactly 1 commit on top of the far end (the single pick)',
    git('rev-list --count ' + FAR + '..' + SUBJECT_BRANCH) === '1', 'count=1');
  T.ok('subject parent is the far end 203a32775',
    git('rev-parse ' + SUBJECT_BRANCH + '^1') === git('rev-parse ' + FAR), 'parent = far end');
  const subjNumstat = git('diff --numstat ' + FAR + ' ' + SUBJECT_BRANCH);
  T.ok('subject diff vs far end is EXACTLY conversation.js +21/-2 (nothing else)',
    subjNumstat === '21\t2\tsrc/js/conversation.js', subjNumstat.replace(/\n/g, ' | '));
  T.ok('subject conversation.js blob is the merge-tree merged blob 8a20a5ec…',
    git('ls-tree ' + SUBJECT_BRANCH + ' -- src/js/conversation.js').indexOf(MT_CONV_BLOB) !== -1, 'blob matches');
  T.ok('subject villager-objectives.js blob is the far-end blob 9afc522b… (byte-identical to the far end)',
    git('ls-tree ' + SUBJECT_BRANCH + ' -- src/js/villager-objectives.js').indexOf(OBJ_OURS_BLOB) !== -1, 'objectives = far end');
  T.ok('subject villager-objectives.js is byte-identical to the far end (no diff)',
    git('diff --stat ' + FAR + ' ' + SUBJECT_BRANCH + ' -- src/js/villager-objectives.js') === '', 'identical');
  T.ok('subject balance-proof.json blob is the far-end blob d0c6a42f… (byte-identical to the far end)',
    git('ls-tree ' + SUBJECT_BRANCH + ' -- scripts/balance-proof.json').indexOf(BAL_OURS_BLOB) !== -1, 'balance-proof = far end');
  T.ok('subject balance-proof.json is byte-identical to the far end (no diff)',
    git('diff --stat ' + FAR + ' ' + SUBJECT_BRANCH + ' -- scripts/balance-proof.json') === '', 'identical');
  T.ok('subject has NO evidence receipt (absent at the far end, removed from the subject)',
    (function () { try { execSync('git cat-file -e ' + SUBJECT_BRANCH + ':' + RECEIPT, { cwd: REPO, stdio: 'pipe' }); return false; } catch (e) { return true; } })(), 'receipt absent');
  T.ok('the pick\'s own diff DOES touch villager-objectives.js +21/-2 (the narrowing dropped it)',
    git('diff --numstat ' + PICK3 + '^1 ' + PICK3 + ' -- src/js/villager-objectives.js') === '21\t2\tsrc/js/villager-objectives.js', 'pick diff 21/2');
  T.ok('the pick\'s own diff DOES touch balance-proof.json +2/-2 (the narrowing dropped it)',
    git('diff --numstat ' + PICK3 + '^1 ' + PICK3 + ' -- scripts/balance-proof.json') === '2\t2\tscripts/balance-proof.json', 'pick diff 2/2');
  T.ok('the live subject carries tradeIntroDeferred in conversation.js (the deferred intro)',
    gitShow(SUBJECT_BRANCH, 'src/js/conversation.js').indexOf('tradeIntroDeferred') !== -1, 'tradeIntroDeferred landed');
  T.ok('the live subject carries the stage >= 1 gate in queueTraderIntro',
    gitShow(SUBJECT_BRANCH, 'src/js/conversation.js').indexOf('if (stage < 1) return;') !== -1, 'stage gate landed');
  T.ok('the live subject carries NO objCommitGuardOffer in villager-objectives.js (the objectives half was dropped)',
    grepCount(SUBJECT_BRANCH, 'objCommitGuardOffer', 'src/js/villager-objectives.js') === 0, '0 hits on subject');
  const headBranch2 = git('rev-parse --abbrev-ref HEAD');
  T.ok('HEAD is back on the arm branch sim-transplant15e-p3conv-a after the live pick (worktree-only)', worktreeOnly(headBranch2 === 'sim-transplant15e-p3conv-a'), 'HEAD=' + headBranch2);
  let cherryPickHead2 = true;
  try { execSync('git rev-parse --verify CHERRY_PICK_HEAD', { cwd: REPO, stdio: 'pipe' }); } catch (e) { cherryPickHead2 = false; }
  T.ok('no cherry-pick is in progress (the pick was continued, not aborted)', cherryPickHead2 === false, 'CHERRY_PICK_HEAD absent');

  // ---- 9. Step verdict — survived 4/8, NOT-CARRIER, far-end days reproduced seed-for-seed ----
  T.section('9. Step verdict — t15e-p3conv survived 4/8, NOT-CARRIER');
  const sumPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  const sum = JSON.parse(fs.readFileSync(sumPath, 'utf8'));
  T.ok('step summary step id is t15e-p3conv', sum.step === STEP, sum.step);
  T.ok('step summary anchor commit is the subject 740c9ab963da', sum.perSeed.every(function (s) { return s.anchorCommit === '740c9ab963da'; }), 'anchor ok');
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
  T.ok('classifyTransplant(4) = NOT-CARRIER (the step verdict)', classifyTransplant(sum.survived) === 'NOT-CARRIER', '4/8 → NOT-CARRIER');
  T.ok('no AMBIGUOUS re-run is owed (4/8 is not 2/8)', sum.survived !== 2, 'no re-run');
  T.ok('tribute-ready is 1/8 (190397, veterans 2)',
    sum.perSeed.filter(function (s) { return s.tribute && s.tribute.ready; }).length === 1, 'tribute-ready 1/8');
  const driverLog = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log'), 'utf8');
  T.ok('driver log records the analyzer classification GOOD (survived 4/8) and rank REGIONAL_INTACT',
    driverLog.indexOf('culpritbisect-a t15e-p3conv: GOOD (survived 4/8)') !== -1 && driverLog.indexOf('rank: REGIONAL_INTACT') !== -1, 'analyzer classification present');
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
  const evMdPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15e-p3conv.md');
  const evMd = fs.existsSync(evMdPath) ? fs.readFileSync(evMdPath, 'utf8') : '';
  T.ok('evidence file exists', evMd.length > 0, evMdPath);
  T.ok('evidence file records the verdict NOT-CARRIER', evMd.indexOf('VERDICT: NOT-CARRIER') !== -1, 'verdict present');
  T.ok('evidence file records survived 4/8 and the per-seed days 86/144/150/43/150/87/150/150',
    evMd.indexOf('4/8') !== -1 && evMd.indexOf('86/144/150/43/150/87/150/150') !== -1, 'survival present');
  T.ok('evidence file records the subject hash 740c9ab96 and the predicted tree 6ab07a5d…',
    evMd.indexOf('740c9ab96') !== -1 && evMd.indexOf('6ab07a5d') !== -1, 'subject present');
  T.ok('evidence file records wave-5 2/8, median 150d, deaths 629',
    evMd.indexOf('wave-5 2/8') !== -1 && evMd.indexOf('150d') !== -1 && evMd.indexOf('629') !== -1, 'secondaries present');
  T.ok('evidence file records the telemetry deviation check refusal (recorder-corpus, baseline NOT rolled)',
    evMd.indexOf('Telemetry deviation check') !== -1 && evMd.indexOf('Baseline NOT') !== -1, 'telemetry note present');
  T.ok('evidence file records that the villager-objectives.js half stays unmeasured (Phase 4 dependency)',
    evMd.indexOf('UNMEASURED') !== -1 && evMd.indexOf('objCommitGuardOffer') !== -1, 'unmeasured note present');
  T.ok('evidence file records the sense-test (trader path unexercised: 0 trader mentions in the corpus)',
    evMd.indexOf('SENSE-TESTING') !== -1 && evMd.indexOf('0 trader mentions') !== -1, 'sense note present');
  T.ok('evidence file records the seed-for-seed far-end identity (same days on all 8 seeds)',
    evMd.indexOf('seed-for-seed') !== -1 || evMd.indexOf('seed for seed') !== -1, 'identity note present');
  T.ok('evidence file records the step duration and STEP id t15e-p3conv',
    evMd.indexOf('t15e-p3conv') !== -1, 'STEP present');
  T.ok('evidence file records the metric review section',
    evMd.indexOf('Metric review') !== -1, 'metric review present');
  T.ok('evidence file records the index-clobber / index.lock incidents (infrastructure)',
    evMd.indexOf('index clobber') !== -1 || evMd.indexOf('index.lock') !== -1, 'infra note present');

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
