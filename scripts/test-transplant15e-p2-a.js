#!/usr/bin/env node
// test-transplant15e-p2-a.js — proof test for the H1 TRANSPLANT,
// family 15E pick 2 ALONE on the 14+12 base (resume / conversation
// repair, arm sim-transplant15e-p2-a).
//
// THE QUESTION (evidence/2026-11-14/sim-transplant15e-p2-prereg.md,
// prereg committed before the subject was cut or any judged sim
// ran): land pick 2 (7041e1bfb, OVE-33) onto the 14+12 base
// (transplant-12-14-subject c8655548f — far end + family 14 +
// family 12, both exonerated) WITHOUT pick 1, and judge it alone.
// Pick 2 cannot land on the bare far end: its one game-code hunk
// (a 4-line quote check inside `convoSnippetIsStageDirection`)
// sits inside a function family 14 introduced that the far end
// never had (proven by the 15E-alone arm, which STOPped at pick
// 2). On the 14+12 base the function exists, so pick 2 alone is
// buildable there — the 1412 arm already applied it on top of
// pick 1 (subject 312647db0); this arm isolates it. Grouping
// prereg: hidden_files/family15-grouping-prereg-2026-11-14.md
// §15E. Binding prereg: sim-scale-onramp-round-2115.md §3.
//
// TOOLING-RESOLUTION RULE (coordinator-decided, binding for this
// run's family-15 arms, decided 2026-11-14 ~10:00Z): the pick may
// conflict ONLY on zero-src-reader tooling files
// (scripts/green-list.txt, scripts/balance-proof.json,
// scripts/phone-frame-proof.json), each resolved with
// `git checkout --ours` (the 14+12-base version kept
// byte-identical). ANY other conflicted file (any src/js, data,
// policy, docs, or test file) STOPS the arm as
// UNMEASURED-BY-CONFLICT. The proof MUST assert: (1) the
// subject's game-code diff equals the pick's diff exactly, and
// (2) each resolved tooling file is byte-identical to the 14+12
// base.
//
// STAGE 1 (this file as committed with the prereg) proves:
//   1. Pick 2 identity — hash, subject, first parent, single
//      parent (standalone, not a merge), exact numstats, no
//      standing.js, no policy file.
//   2. Merge-tree pre-check — rc=1, tree 4111ed85…, conflicted
//      files EXACTLY [scripts/balance-proof.json,
//      scripts/phone-frame-proof.json] (conversation.js, the
//      snippet test, and sw.js auto-merged clean, blobs
//      6e095015… / 92e4b9fe…); marker lines 3/6/9 and 7/15/23 +
//      81/91/101 (the same files and lines the p12 arm's pick-2
//      prediction named); predicted subject tree 35857b15…
//      (prediction commit c7e82c97, parent = 14+12 base), whose
//      diff vs the base is EXACTLY pick 2 minus the two tooling
//      files (10 files).
//   3. Pick-2 mechanism — `convoSnippetIsStageDirection` exists
//      on the 14+12 base (defined line 1745, family-12-widened
//      anchor) but NOT at the far end; the quote check has 0 hits
//      on the base, 1 in the pick; the snippet test carries family
//      12's OVE-29 form (74 lines at pick 2's base and on the
//      base) and the OVE-33 assertions have 0 hits on the base, 1
//      in the pick.
//   4. Family content — the quote check + OVE-33 assertions +
//      godpath test fixes + sw.js villager-brain asset line; the
//      pick changes no damage/armor/spawn/food-yield/spoilage/
//      wave/table-gate numbers.
//   5. Verdict mapping + tooling-resolution rule —
//      classifyTransplant maps every survived count;
//      resolveTooling maps the exact predicted two-file set to
//      TOOLING-CONTINUE and any other conflicted file (including
//      conversation.js or the snippet test) to UNMEASURED.
//   6. Prereg recorded in the evidence file (base, pick, seeds,
//      horizon, policy, STEP id, thresholds, STOP clause,
//      tooling-resolution rule, subject branch name, merge-tree
//      predictions, mechanism, ordering note, seed-band freshness
//      note).
//   7. Base state — HEAD is on sim-transplant15e-p2-a, no src/js
//      file differs from HEAD, on-disk standing.js is
//      byte-identical to HEAD, the step-script tooling source
//      (master) still carries all four scratch files; the step
//      script names the band 190391-190398; the subject branch
//      does NOT exist yet (stage 1 — rewritten in stage 2 once
//      the subject is cut); no STEP t15e-p2 summary/driver
//      log/corpus exists; no cherry-pick is in progress.
// STAGE 2 (appended after the live pick + judged step) proves:
//   8. Live pick applies with exactly the two predicted
//      conflicts; both resolved --ours (14+12-base versions
//      kept); the subject tree equals the predicted tree
//      35857b15…; the subject diff vs the 14+12 base is exactly
//      pick 2 minus the two tooling files; both tooling files are
//      byte-identical to the 14+12 base; conversation.js and the
//      snippet test carry the OVE-33 content.
//   9. The step verdict (survived 4/8, NOT-CARRIER, per-seed days
//      seed-for-seed identical to the far end) and the evidence
//      file records it, the subject hash, the telemetry refusal,
//      the pick-2-alone isolation note, and the write-flap
//      recovery (fallback extraction + analyzer re-run).
//   7 (rewritten in stage 2). Base state — HEAD is back on
//      sim-transplant15e-p2-a, the subject branch exists at the
//      live pick acdbc793f, the step summary / driver log / corpus
//      exist (8 per-seed JSONs), no cherry-pick is in progress,
//      the tracked tree is clean apart from this proof + the
//      prereg + the evidence file.
//
// Usage: node scripts/test-transplant15e-p2-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant15e-p2-a');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const BASE = 'c8655548f4be892c7722f2bbb46910c3c7262d5c';
const BASE_TREE = 'e78fac42d89e811f6bfce981b7274e5ee3c5c014';
const PICK2 = '7041e1bfb7e8b69387bd3203a58eed00115ec8d7';
const FIRST2 = 'c32ff6fa804f7ca54e4f2a03a71e3af4f0dbf212';
const MERGEBASE = 'd229b58f595430e2a24c399820061b39c5b689ca';
const SUBJECT_BRANCH = 'transplant-15e-p2-subject';
const STEP = 't15e-p2';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
// Merge-tree prediction (pick 2 on the 14+12 base).
const MT_TREE = '4111ed85351a31a1ebc0da371da74c5b9d5315b0';
const MT_CONV_BLOB = '6e095015446e86912f68ef40fcb226a95ff739f0';
const MT_TEST_BLOB = '92e4b9fe882dd3422bbfea71980638a2b80131cf';
const PRED_TREE = '35857b15ff5a61750b9dccf9ab1f21bb8c3d705f';
const PRED_COMMIT = 'c7e82c9774871ca6596264a30a1b0fdae25528b6';
const BAL_OURS_BLOB = 'd0c6a42ff2395a49672f235f0218a3f969619dee';
const PHONE_OURS_BLOB = 'b06910148b2bb567ca3941b2ac3245872f74f632';
const TOOLING_FILES = ['scripts/green-list.txt', 'scripts/balance-proof.json', 'scripts/phone-frame-proof.json'];
const PREDICTED_CONFLICTS = ['scripts/balance-proof.json', 'scripts/phone-frame-proof.json'];

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
// a conflict set of EXACTLY the two predicted tooling files
// resolves (each --ours) and the pick continues; ANY other
// conflicted file (including conversation.js or the snippet test)
// STOPS the arm (UNMEASURED), no hand-resolution, no narrowed
// re-run decided by this arm.
function resolveTooling(files) {
  if (!Array.isArray(files)) return 'UNCLASSIFIABLE';
  if (files.length === 0) return 'NO-CONFLICT';
  const sorted = files.slice().sort();
  if (JSON.stringify(sorted) === JSON.stringify(PREDICTED_CONFLICTS.slice().sort())) return 'TOOLING-CONTINUE';
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
  const parents = git('show -s --format=%P ' + PICK2).split(' ').filter(Boolean);
  T.ok('pick 2 has exactly 1 parent (standalone, not a merge)', parents.length === 1, 'parents=' + parents.length);
  const stat2 = git('diff --numstat ' + PICK2 + '^1 ' + PICK2);
  T.ok('pick 2 diff is exactly 12 files',
    stat2.split('\n').sort().join('\n') === ['-\t-\tevidence/2026-11-08/neutral-ove33-master-quick.json.gz', '2585\t0\tevidence/2026-11-08/phone-ove33-frame-736-r1.json', '2686\t0\tevidence/2026-11-08/phone-ove33-frame-844-r1.json', '2\t2\tscripts/balance-proof.json', '4\t0\tscripts/godpath/test-mobile-combat-cadence.js', '1\t1\tscripts/godpath/test-occupation-panels.js', '3\t2\tscripts/godpath/test-time-save-crashes.js', '6\t6\tscripts/phone-frame-proof.json', '3\t0\tscripts/test-establishment-r20-fixes-20261020.js', '4\t0\tscripts/test-snippet-stage-direction.js', '4\t0\tsrc/js/conversation.js', '1\t0\tsw.js'].sort().join('\n'), stat2.replace(/\n/g, ' | '));
  T.ok('pick 2 conversation.js is +4/-0', git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- src/js/conversation.js') === '4\t0\tsrc/js/conversation.js', 'conversation 4/0');
  T.ok('pick 2 test-snippet-stage-direction.js is +4/-0', git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- scripts/test-snippet-stage-direction.js') === '4\t0\tscripts/test-snippet-stage-direction.js', 'snippet test 4/0');
  T.ok('pick 2 balance-proof.json is +2/-2', git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- scripts/balance-proof.json') === '2\t2\tscripts/balance-proof.json', 'balance-proof 2/2');
  T.ok('pick 2 phone-frame-proof.json is +6/-6', git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- scripts/phone-frame-proof.json') === '6\t6\tscripts/phone-frame-proof.json', 'phone-frame 6/6');
  T.ok('pick 2 sw.js is +1/-0', git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- sw.js') === '1\t0\tsw.js', 'sw.js 1/0');
  T.ok('pick 2 does not touch standing.js', git('diff --name-only ' + PICK2 + '^1 ' + PICK2 + ' -- src/js/standing.js') === '', '(absent)');
  T.ok('pick 2 touches no policy file', git('diff --name-only ' + PICK2 + '^1 ' + PICK2 + ' -- scripts/policies') === '', '(none)');
  T.ok('pick 2 does not touch green-list.txt', git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- scripts/green-list.txt') === '', '(absent)');
  T.ok('pick 2 touches no data/docs file', git('diff --name-only ' + PICK2 + '^1 ' + PICK2 + ' -- src/data docs') === '', '(none)');
  const fpOrder = git('log --first-parent --reverse --format=%H ' + MERGEBASE + '..a628aeaf3').split('\n');
  T.ok('pick 2 is on the first-parent chain d229b58f5..a628aeaf3', fpOrder.indexOf(PICK2) !== -1, 'idx=' + fpOrder.indexOf(PICK2));
  T.ok('pick 2\'s first parent c32ff6fa8 is NOT an ancestor of the far end (family 3 is not on the far end)',
    isAncestor(FIRST2, FAR) === false, 'not ancestor of 203a32775');
  T.ok('family 14 IS an ancestor of pick 2\'s first parent (the function exists on the origin line)',
    isAncestor('7688cb7a46367c88c7bb85e976502ddc0d5456f0', FIRST2) === true, 'family 14 ancestor of c32ff6fa8');
  T.ok('family 12 IS an ancestor of pick 2\'s first parent (the widened form exists on the origin line)',
    isAncestor('ac119e4ed27b2aa66131929795a4d3d0f381900b', FIRST2) === true, 'family 12 ancestor of c32ff6fa8');
  const farStanding = sha256(gitShow(FAR, 'src/js/standing.js'));
  T.ok('far-end native standing.js sha is 75762cb2...', farStanding.startsWith('75762cb2'), farStanding.slice(0, 12));
  T.ok('fix standing.js sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  const farPolicy = sha256(gitShow(FAR, 'scripts/policies/competent.js'));
  T.ok('far-end policy sha is a7ff5c51...', farPolicy.startsWith('a7ff5c51'), farPolicy.slice(0, 12));

  // ---- 1b. Base identity (the 14+12 subject) ----
  T.section('1b. Base identity — 14+12 subject c8655548f, far end + family 14 + family 12');
  T.ok('base commit exists', git('rev-parse ' + BASE).length === 40, git('log -1 --format=%s ' + BASE).slice(0, 80));
  T.ok('base subject is the family-12 merge (Merge pull request #25)',
    git('log -1 --format=%s ' + BASE) === 'Merge pull request #25 from steve-vitale/cursor/dialog-residual-sampler-f726', git('log -1 --format=%s ' + BASE).slice(0, 80));
  T.ok('base tree is e78fac42… (the exonerated 12+14 tree)',
    git('rev-parse ' + BASE + '^{tree}') === BASE_TREE, git('rev-parse ' + BASE + '^{tree}').slice(0, 12));
  T.ok('base branch transplant-12-14-subject points at c8655548f',
    git('rev-parse transplant-12-14-subject') === BASE, 'branch tip ok');
  T.ok('base standing.js is the far-end native (families 14/12 do not touch it)',
    sha256(gitShow(BASE, 'src/js/standing.js')).startsWith('75762cb2'), 'standing = far-end native');
  T.ok('base policy is the far-end own policy (a7ff5c51…)',
    sha256(gitShow(BASE, 'scripts/policies/competent.js')).startsWith('a7ff5c51'), 'policy = far end');
  T.ok('base has exactly 2 commits on top of the far end (families 14 + 12)',
    git('rev-list --count ' + FAR + '..' + BASE) === '2', 'count=2');
  T.ok('base log order is family 14 then family 12',
    git('log --reverse --format=%s ' + FAR + '..' + BASE).split('\n').join(' | ').indexOf('snippet-stage-direction-guard') !== -1 &&
    git('log --reverse --format=%s ' + FAR + '..' + BASE).split('\n').join(' | ').indexOf('dialog-residual-sampler') !== -1, git('log --reverse --format=%s ' + FAR + '..' + BASE).split('\n').join(' | '));

  // ---- 2. Merge-tree pre-check ----
  T.section('2. Merge-tree pre-check — rc=1, exactly the two predicted tooling conflicts, game code clean');
  // Merge-tree OIDs depend on the refs AS SPELLED (full 40-char
  // hashes throughout, as the 15E prereg records — a short spelling
  // gives a different tree OID, same file set).
  const mt = mergeTree(git('rev-parse ' + FIRST2), git('rev-parse ' + BASE), git('rev-parse ' + PICK2));
  T.ok('merge-tree rc=1 (conflict)', mt.rc === 1, 'rc=' + mt.rc);
  T.ok('merge-tree tree is 4111ed85…', mt.tree === MT_TREE, mt.tree.slice(0, 12));
  T.ok('merge-tree conflicts EXACTLY [scripts/balance-proof.json, scripts/phone-frame-proof.json]',
    JSON.stringify(mt.conflicted) === JSON.stringify(['scripts/balance-proof.json', 'scripts/phone-frame-proof.json']), mt.conflicted.join(', '));
  T.ok('merge-tree auto-merged conversation.js (no CONFLICT line for it)',
    mt.autoMerged.indexOf('src/js/conversation.js') !== -1 && mt.raw.indexOf('CONFLICT (content): Merge conflict in src/js/conversation.js') === -1, mt.autoMerged.join(', '));
  T.ok('merge-tree auto-merged test-snippet-stage-direction.js (no CONFLICT line for it)',
    mt.autoMerged.indexOf('scripts/test-snippet-stage-direction.js') === -1 && mt.raw.indexOf('CONFLICT (modify/delete): scripts/test-snippet-stage-direction.js') === -1 && mt.raw.indexOf('CONFLICT (content): Merge conflict in scripts/test-snippet-stage-direction.js') === -1, 'no snippet-test conflict (file exists on base, auto-applies)');
  T.ok('merge-tree auto-merged sw.js', mt.autoMerged.indexOf('sw.js') !== -1, mt.autoMerged.join(', '));
  T.ok('merge-tree merged conversation.js blob is 6e095015… (exactly the pick\'s resulting blob)',
    git('ls-tree ' + MT_TREE + ' -- src/js/conversation.js').indexOf(MT_CONV_BLOB) !== -1, git('ls-tree ' + MT_TREE + ' -- src/js/conversation.js').slice(0, 60));
  T.ok('merge-tree merged test-snippet-stage-direction.js blob is 92e4b9fe… (exactly the pick\'s resulting blob)',
    git('ls-tree ' + MT_TREE + ' -- scripts/test-snippet-stage-direction.js').indexOf(MT_TEST_BLOB) !== -1, git('ls-tree ' + MT_TREE + ' -- scripts/test-snippet-stage-direction.js').slice(0, 60));
  T.ok('tooling-resolution rule maps the conflict set to TOOLING-CONTINUE', resolveTooling(mt.conflicted) === 'TOOLING-CONTINUE', resolveTooling(mt.conflicted));
  T.ok('tooling-resolution rule maps a conversation.js conflict to UNMEASURED (STOP)',
    resolveTooling(['scripts/balance-proof.json', 'scripts/phone-frame-proof.json', 'src/js/conversation.js']) === 'UNMEASURED', 'conversation.js conflict stops');
  T.ok('tooling-resolution rule maps a snippet-test conflict to UNMEASURED (STOP)',
    resolveTooling(['scripts/balance-proof.json', 'scripts/phone-frame-proof.json', 'scripts/test-snippet-stage-direction.js']) === 'UNMEASURED', 'snippet-test conflict stops');
  T.ok('tooling-resolution rule maps an empty conflict set to NO-CONFLICT', resolveTooling([]) === 'NO-CONFLICT', 'empty set');
  const mtBal = gitShow(MT_TREE, 'scripts/balance-proof.json');
  T.ok('merged-tree balance-proof.json carries conflict markers at lines 3/6/9',
    mtBal.split('\n')[2].indexOf('<<<<<<<') === 0 && mtBal.split('\n')[5] === '=======' && mtBal.split('\n')[8].indexOf('>>>>>>>') === 0, 'markers 3/6/9');
  const mtPhone = gitShow(MT_TREE, 'scripts/phone-frame-proof.json');
  T.ok('merged-tree phone-frame-proof.json carries conflict markers at lines 7/15/23',
    mtPhone.split('\n')[6].indexOf('<<<<<<<') === 0 && mtPhone.split('\n')[14] === '=======' && mtPhone.split('\n')[22].indexOf('>>>>>>>') === 0, 'markers 7/15/23');
  T.ok('merged-tree phone-frame-proof.json carries conflict markers at lines 81/91/101',
    mtPhone.split('\n')[80].indexOf('<<<<<<<') === 0 && mtPhone.split('\n')[90] === '=======' && mtPhone.split('\n')[100].indexOf('>>>>>>>') === 0, 'markers 81/91/101');
  T.ok('the conflict files and marker lines match the p12 arm\'s pick-2 prediction exactly (same two files, same lines)',
    mt.conflicted.length === 2 && mtBal.split('\n')[2].indexOf('<<<<<<<') === 0 && mtPhone.split('\n')[6].indexOf('<<<<<<<') === 0, 'matches p12 prediction');
  T.ok('prediction commit c7e82c97 carries the predicted subject tree with parent = 14+12 base',
    git('rev-parse ' + PRED_COMMIT + '^{tree}') === PRED_TREE && git('rev-parse ' + PRED_COMMIT + '^1') === git('rev-parse ' + BASE), 'tree+parent ok');
  const predNumstat = git('diff --numstat ' + BASE + ' ' + PRED_TREE);
  T.ok('predicted subject tree diff vs the 14+12 base is EXACTLY pick 2 minus the two tooling files (10 files)',
    predNumstat.split('\n').sort().join('\n') === ['-\t-\tevidence/2026-11-08/neutral-ove33-master-quick.json.gz', '2585\t0\tevidence/2026-11-08/phone-ove33-frame-736-r1.json', '2686\t0\tevidence/2026-11-08/phone-ove33-frame-844-r1.json', '4\t0\tscripts/godpath/test-mobile-combat-cadence.js', '1\t1\tscripts/godpath/test-occupation-panels.js', '3\t2\tscripts/godpath/test-time-save-crashes.js', '3\t0\tscripts/test-establishment-r20-fixes-20261020.js', '4\t0\tscripts/test-snippet-stage-direction.js', '4\t0\tsrc/js/conversation.js', '1\t0\tsw.js'].sort().join('\n'), predNumstat.replace(/\n/g, ' | '));
  T.ok('predicted subject conversation.js blob is the merge-tree merged blob 6e095015…',
    git('ls-tree ' + PRED_TREE + ' -- src/js/conversation.js').indexOf(MT_CONV_BLOB) !== -1, 'blob matches');
  T.ok('predicted subject test-snippet-stage-direction.js blob is the merge-tree merged blob 92e4b9fe…',
    git('ls-tree ' + PRED_TREE + ' -- scripts/test-snippet-stage-direction.js').indexOf(MT_TEST_BLOB) !== -1, 'blob matches');
  T.ok('predicted subject balance-proof.json blob is the 14+12-base blob d0c6a42f…',
    git('ls-tree ' + PRED_TREE + ' -- scripts/balance-proof.json').indexOf(BAL_OURS_BLOB) !== -1, 'balance-proof = base');
  T.ok('predicted subject phone-frame-proof.json blob is the 14+12-base blob b0691014…',
    git('ls-tree ' + PRED_TREE + ' -- scripts/phone-frame-proof.json').indexOf(PHONE_OURS_BLOB) !== -1, 'phone-frame-proof = base');
  T.ok('predicted subject sw.js diff is +1 with the villager-brain asset line (same line as the pick)',
    git('diff ' + BASE + ' ' + PRED_TREE + ' -- sw.js').indexOf('"./src/js/villager-brain.js?v=2294ef815-20261108-112829",') !== -1, 'villager-brain line present');
  T.ok('predicted subject sw.js diff is +1/-0',
    git('diff --numstat ' + BASE + ' ' + PRED_TREE + ' -- sw.js') === '1\t0\tsw.js', 'sw.js 1/0');
  T.ok('predicted subject conversation.js diff is +4/-0 (exactly the pick\'s game-code hunk)',
    git('diff --numstat ' + BASE + ' ' + PRED_TREE + ' -- src/js/conversation.js') === '4\t0\tsrc/js/conversation.js', 'conversation 4/0');

  // ---- 3. Pick-2 mechanism ----
  T.section('3. Pick-2 mechanism — quote check inside convoSnippetIsStageDirection, present on 14+12, absent at far end');
  T.ok('convoSnippetIsStageDirection has 0 hits at the far end (the far end never had family 14)',
    grepCount(FAR, 'convoSnippetIsStageDirection', 'src/js/conversation.js') === 0, '0 hits at far end');
  T.ok('convoSnippetIsStageDirection has 2 hits on the 14+12 base (call + definition)',
    grepCount(BASE, 'convoSnippetIsStageDirection', 'src/js/conversation.js') === 2, '2 hits on base');
  T.ok('convoSnippetIsStageDirection has 3 hits at pick 2\'s first parent (call + definition + comment)',
    grepCount(FIRST2, 'convoSnippetIsStageDirection', 'src/js/conversation.js') === 3, '3 hits at pick base');
  T.ok('the function is defined on the 14+12 base (convoSnippetIsStageDirection(sn) {)',
    gitShow(BASE, 'src/js/conversation.js').indexOf('convoSnippetIsStageDirection(sn) {') !== -1, 'definition present');
  T.ok('the base carries the family-12-widened quote-strip anchor (.replace(...) quote strip)',
    gitShow(BASE, 'src/js/conversation.js').indexOf("const s = String(sn).trim().replace(/^[\"'“”]+|[\"'“”]+$/g, '');") !== -1, 'widened anchor present');
  T.ok('the quote check has 0 hits on the 14+12 base',
    grepCount(BASE, 'if (/"/.test(s)) return false;', 'src/js/conversation.js') === 0, '0 hits on base');
  T.ok('the quote check has 1 hit in the pick',
    grepCount(PICK2, 'if (/"/.test(s)) return false;', 'src/js/conversation.js') === 1, '1 hit in pick');
  T.ok('the pick\'s conversation.js hunk carries the spoken-reactions comment',
    git('diff ' + PICK2 + '^1 ' + PICK2 + ' -- src/js/conversation.js').indexOf('Spoken reactions often wrap a beat + dialogue') !== -1, 'comment present');
  T.ok('the pick\'s conversation.js hunk names the They-go-still beat',
    git('diff ' + PICK2 + '^1 ' + PICK2 + ' -- src/js/conversation.js').indexOf("They go still.") !== -1, 'beat named');
  const baseTestLines = gitShow(BASE, 'scripts/test-snippet-stage-direction.js').split('\n').length;
  const pickBaseTestLines = gitShow(FIRST2, 'scripts/test-snippet-stage-direction.js').split('\n').length;
  T.ok('the snippet test file has 74 lines on the 14+12 base (family 12 OVE-29 form)',
    baseTestLines === 74 || baseTestLines === 75, 'lines=' + baseTestLines);
  T.ok('the snippet test file has 74 lines at pick 2\'s first parent (same insertion context)',
    pickBaseTestLines === 74 || pickBaseTestLines === 75, 'lines=' + pickBaseTestLines);
  T.ok('the OVE-33 assertions (\'They go still.\') have 0 hits on the 14+12 base test file',
    grepCount(BASE, 'They go still', 'scripts/test-snippet-stage-direction.js') === 0, '0 hits on base');
  T.ok('the OVE-33 assertions (\'They go still.\') have 1 hit in the pick',
    grepCount(PICK2, 'They go still', 'scripts/test-snippet-stage-direction.js') === 1, '1 hit in pick');
  T.ok('the pick\'s test hunk asserts the quoted beat is NOT stage direction',
    git('diff ' + PICK2 + '^1 ' + PICK2 + ' -- scripts/test-snippet-stage-direction.js').indexOf("assert.strictEqual(G.convoSnippetIsStageDirection(still), false);") !== -1, 'assertion present');
  T.ok('sw.js villager-brain asset line has 0 hits on the 14+12 base',
    grepCount(BASE, 'villager-brain', 'sw.js') === 0, '0 hits on base');
  T.ok('sw.js villager-brain asset line has 1 hit in the pick',
    grepCount(PICK2, 'villager-brain', 'sw.js') === 1, '1 hit in pick');

  // ---- 4. Family content ----
  T.section('4. Family content — quote check only; no numbers moved');
  const pickConvDiff = git('diff ' + PICK2 + '^1 ' + PICK2 + ' -- src/js/conversation.js');
  T.ok('conversation.js hunk says only pure mood/silence narration is stage direction',
    pickConvDiff.indexOf('only pure mood/silence narration is stage direction') !== -1, 'rule stated');
  T.ok('the pick changes no wave/table/standing numbers (no standing.js, no deed gate, no wave file)',
    git('diff --name-only ' + PICK2 + '^1 ' + PICK2 + ' -- src/js/standing.js src/js/table.js src/js/progression.js src/js/monsterWaves.js') === '', '(none)');
  T.ok('the pick changes no damage/armor/spawn/food numbers (conversation + tests + receipts + sw asset only)',
    pickConvDiff.indexOf('damage') === -1, 'no damage lever');
  T.ok('the pick carries the godpath test fixes (combat cadence, occupation panels, time-save crashes)',
    git('diff --name-only ' + PICK2 + '^1 ' + PICK2).indexOf('scripts/godpath/test-mobile-combat-cadence.js') !== -1 &&
    git('diff --name-only ' + PICK2 + '^1 ' + PICK2).indexOf('scripts/godpath/test-occupation-panels.js') !== -1 &&
    git('diff --name-only ' + PICK2 + '^1 ' + PICK2).indexOf('scripts/godpath/test-time-save-crashes.js') !== -1, 'godpath fixes present');
  T.ok('the pick carries the r20 establishment test fix (+3)',
    git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- scripts/test-establishment-r20-fixes-20261020.js') === '3\t0\tscripts/test-establishment-r20-fixes-20261020.js', 'establishment fix present');
  T.ok('the pick carries the two phone-frame receipts (evidence, +2585/+2686)',
    git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- evidence/2026-11-08/phone-ove33-frame-736-r1.json') === '2585\t0\tevidence/2026-11-08/phone-ove33-frame-736-r1.json', 'receipts present');

  // ---- 5. Verdict mapping + tooling-resolution rule ----
  T.section('5. Verdict mapping + tooling-resolution rule');
  T.ok('classifyTransplant(0) = CARRIER', classifyTransplant(0) === 'CARRIER', '0/8');
  T.ok('classifyTransplant(1) = CARRIER', classifyTransplant(1) === 'CARRIER', '1/8');
  T.ok('classifyTransplant(2) = AMBIGUOUS', classifyTransplant(2) === 'AMBIGUOUS', '2/8');
  T.ok('classifyTransplant(3) = NOT-CARRIER', classifyTransplant(3) === 'NOT-CARRIER', '3/8');
  T.ok('classifyTransplant(4) = NOT-CARRIER (far-end baseline)', classifyTransplant(4) === 'NOT-CARRIER', '4/8');
  T.ok('classifyTransplant(8) = NOT-CARRIER', classifyTransplant(8) === 'NOT-CARRIER', '8/8');
  T.ok('classifyTransplant(9) = UNCLASSIFIABLE', classifyTransplant(9) === 'UNCLASSIFIABLE', '9/8');
  T.ok('resolveTooling maps the exact predicted two-file set to TOOLING-CONTINUE',
    resolveTooling(['scripts/balance-proof.json', 'scripts/phone-frame-proof.json']) === 'TOOLING-CONTINUE', 'predicted set');
  T.ok('resolveTooling maps a tooling-only subset to UNMEASURED (both files are part of the prediction)',
    resolveTooling(['scripts/balance-proof.json']) === 'UNMEASURED', 'subset stops');
  T.ok('resolveTooling maps any extra file to UNMEASURED',
    resolveTooling(['scripts/balance-proof.json', 'scripts/phone-frame-proof.json', 'src/js/game.js']) === 'UNMEASURED', 'extra file stops');
  T.ok('resolveTooling maps a non-array to UNCLASSIFIABLE', resolveTooling(null) === 'UNCLASSIFIABLE', 'null input');

  // ---- 6. Prereg recorded ----
  T.section('6. Prereg recorded in the evidence file');
  const evPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15e-p2-prereg.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('prereg file exists', ev.length > 0, evPath);
  T.ok('prereg records the base (14+12 subject c8655548f, tree e78fac42…)', ev.indexOf('c8655548f') !== -1 && ev.indexOf('e78fac42') !== -1, 'base present');
  T.ok('prereg records the far-end baseline (203a32775, GOOD 4/8)', ev.indexOf('203a32775') !== -1 && ev.indexOf('GOOD 4/8') !== -1, 'far end present');
  T.ok('prereg records the pick (7041e1bfb, OVE-33)', ev.indexOf('7041e1bfb') !== -1 && ev.indexOf('OVE-33') !== -1, 'pick present');
  T.ok('prereg records the seeds 190391–190398', ev.indexOf('190391') !== -1 && ev.indexOf('190398') !== -1, 'seeds present');
  T.ok('prereg records the horizon 150d death-aware', ev.indexOf('150d') !== -1, 'horizon present');
  T.ok('prereg records the competent verbatim own-policy', ev.indexOf('competent') !== -1, 'policy present');
  T.ok('prereg records STEP id t15e-p2', ev.indexOf('t15e-p2') !== -1, 'STEP present');
  T.ok('prereg records the thresholds (≤1 CARRIER / 2 AMBIGUOUS / ≥3 NOT-CARRIER)',
    ev.indexOf('CARRIER') !== -1 && ev.indexOf('AMBIGUOUS') !== -1 && ev.indexOf('NOT-CARRIER') !== -1, 'thresholds present');
  T.ok('prereg records the STOP clause (any non-tooling conflict stops as UNMEASURED-BY-CONFLICT)',
    ev.indexOf('STOP clause') !== -1 && ev.indexOf('UNMEASURED-BY-CONFLICT') !== -1, 'STOP present');
  T.ok('prereg records the tooling-resolution rule (both files --ours, 14+12-base version kept)',
    ev.indexOf('TOOLING-RESOLUTION RULE') !== -1 && ev.indexOf('git checkout --ours') !== -1, 'rule present');
  T.ok('prereg records the pick-2-alone isolation (no pick 1; p12 judged picks 1+2 as a unit)',
    ev.indexOf('pick 2 alone') !== -1 || ev.indexOf('pick 2 ALONE') !== -1, 'isolation present');
  T.ok('prereg records the subject branch name transplant-15e-p2-subject',
    ev.indexOf('transplant-15e-p2-subject') !== -1, 'subject branch present');
  T.ok('prereg records the merge-tree predictions (tree 4111ed85…, predicted tree 35857b15…, prediction commit c7e82c97)',
    ev.indexOf('4111ed85') !== -1 && ev.indexOf('35857b15') !== -1 && ev.indexOf('c7e82c97') !== -1, 'predictions present');
  T.ok('prereg records the marker lines (3/6/9 and 7/15/23 and 81/91/101)',
    ev.indexOf('3/6/9') !== -1 && ev.indexOf('7/15/23') !== -1 && ev.indexOf('81/91/101') !== -1, 'markers present');
  T.ok('prereg records the pick-2 mechanism (convoSnippetIsStageDirection, family 14, widened anchor)',
    ev.indexOf('convoSnippetIsStageDirection') !== -1 && ev.indexOf('family 14') !== -1, 'mechanism present');
  T.ok('prereg records the base exoneration (family 14 + 12+14 NOT-CARRIER 4/8)',
    ev.indexOf('Base exoneration') !== -1 && ev.indexOf('NOT-CARRIER 4/8') !== -1, 'exoneration present');
  T.ok('prereg records the canon note (CONVERSATIONS.md; no standalone OVE-33 doc)',
    ev.indexOf('CONVERSATIONS.md') !== -1, 'canon note present');
  T.ok('prereg records the grouping authority (§15E)',
    ev.indexOf('family15-grouping-prereg-2026-11-14.md') !== -1, 'authority present');
  T.ok('prereg records the ordering note (pre-check ran during prereg preparation, subject not yet cut)',
    ev.indexOf('Ordering note') !== -1, 'ordering note present');
  T.ok('prereg records the seed-band freshness note (78 preregs, reused by design)',
    ev.indexOf('78 preregs') !== -1 && ev.indexOf('reused BY DESIGN') !== -1, 'seed-band note present');
  T.ok('prereg records the build method (cherry-pick 7041e1bfb, checkout --ours)',
    ev.indexOf('git cherry-pick 7041e1bfb') !== -1 && ev.indexOf('git checkout --ours') !== -1, 'build method present');
  T.ok('prereg records the fix sha f8fda4295a99', ev.indexOf('f8fda4295a99') !== -1, 'fix sha present');

  // ---- 7. Base state (stage 2) ----
  T.section('7. Base state — arm branch clean, subject cut at acdbc793f, step t15e-p2 ran');
  const headBranch = git('rev-parse --abbrev-ref HEAD');
  // worktreeOnly: branch-identity legs are meaningful only in the
  // worker tree. On merged master HEAD is 'master' by design (the
  // arm branch is deleted after landing) — the leg passes there
  // vacuously instead of failing, so the proof stays green on master.
  // Prereg-commit ancestry legs resolve by message/subject, not hash
  // (an adoption rebase rewrites hashes).
  const worktreeOnly = function (cond) { return cond || headBranch === 'master'; };
  T.ok('HEAD is on the arm branch sim-transplant15e-p2-a (worktree-only)', worktreeOnly(headBranch === 'sim-transplant15e-p2-a'), 'HEAD=' + headBranch);
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
  T.ok('subject branch exists at the live pick acdbc793f (stage 2)', subjectExists === true && git('rev-parse ' + SUBJECT_BRANCH).startsWith('acdbc793f'), SUBJECT_BRANCH + ' at acdbc793f');
  const tSummary = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  T.ok('step summary EXISTS for t15e-p2 (stage 2 — the judged sim ran)', fs.existsSync(tSummary) === true, STEP);
  const tDriver = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  T.ok('step driver log EXISTS for t15e-p2 (stage 2 — the judged sim ran)', fs.existsSync(tDriver) === true, STEP);
  const corpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  T.ok('step corpus EXISTS for t15e-p2 (stage 2 — the judged sim ran)', fs.existsSync(corpusDir) === true, STEP);
  T.ok('step corpus holds exactly 8 per-seed JSONs', fs.existsSync(corpusDir) && fs.readdirSync(corpusDir).filter(function (f) { return f.endsWith('.json'); }).length === 8, '8 seeds');
  let cherryPickHead = true;
  try { execSync('git rev-parse --verify CHERRY_PICK_HEAD', { cwd: REPO, stdio: 'pipe' }); } catch (e) { cherryPickHead = false; }
  T.ok('no cherry-pick is in progress', cherryPickHead === false, 'CHERRY_PICK_HEAD absent');
  const dirtyTracked = git('diff --name-only HEAD');
  const allowed = ['scripts/test-transplant15e-p2-a.js', 'evidence/2026-11-14/sim-transplant15e-p2-prereg.md', 'evidence/2026-11-14/sim-transplant15e-p2.md'];
  const dirtyOther = dirtyTracked.split('\n').filter(function (ln) {
    return ln && !allowed.some(function (a) { return ln === a; });
  }).join('\n');
  T.ok('tracked tree is clean apart from this proof + the prereg + the evidence file (uncommitted until this proof passes)', dirtyOther === '', dirtyOther.slice(0, 200) || '(only allowed files)');

  // ---- 8. Live pick — exactly the two predicted conflicts, resolved --ours, tree equals prediction ----
  T.section('8. Live pick — two predicted conflicts, --ours resolutions, tree equals prediction');
  const LIVE_SUBJECT = 'acdbc793f07bdb02609353be0d5543dd583efab3';
  T.ok('subject branch exists', (function () { try { git('rev-parse ' + SUBJECT_BRANCH); return true; } catch (e) { return false; } })(), SUBJECT_BRANCH + ' present');
  T.ok('subject tip is the live pick acdbc793f (OVE-33)',
    git('rev-parse ' + SUBJECT_BRANCH) === LIVE_SUBJECT && git('log -1 --format=%s ' + SUBJECT_BRANCH) === 'OVE-33: refresh stale quick proofs and fix outside-Muse fails', git('log -1 --format=%h\\ %s ' + SUBJECT_BRANCH).slice(0, 80));
  T.ok('subject tip tree is 35857b15… (the predicted subject tree)',
    git('rev-parse ' + SUBJECT_BRANCH + '^{tree}') === PRED_TREE, git('rev-parse ' + SUBJECT_BRANCH + '^{tree}').slice(0, 12));
  T.ok('subject has exactly 1 commit on top of the 14+12 base (the single pick)',
    git('rev-list --count ' + BASE + '..' + SUBJECT_BRANCH) === '1', 'count=1');
  T.ok('subject parent is the 14+12 base c8655548f',
    git('rev-parse ' + SUBJECT_BRANCH + '^1') === git('rev-parse ' + BASE), 'parent = 14+12 base');
  const subjNumstat = git('diff --numstat ' + BASE + ' ' + SUBJECT_BRANCH);
  T.ok('subject diff vs the 14+12 base is EXACTLY pick 2 minus the two tooling files (10 files)',
    subjNumstat.split('\n').sort().join('\n') === ['-\t-\tevidence/2026-11-08/neutral-ove33-master-quick.json.gz', '2585\t0\tevidence/2026-11-08/phone-ove33-frame-736-r1.json', '2686\t0\tevidence/2026-11-08/phone-ove33-frame-844-r1.json', '4\t0\tscripts/godpath/test-mobile-combat-cadence.js', '1\t1\tscripts/godpath/test-occupation-panels.js', '3\t2\tscripts/godpath/test-time-save-crashes.js', '3\t0\tscripts/test-establishment-r20-fixes-20261020.js', '4\t0\tscripts/test-snippet-stage-direction.js', '4\t0\tsrc/js/conversation.js', '1\t0\tsw.js'].sort().join('\n'), subjNumstat.replace(/\n/g, ' | '));
  T.ok('subject conversation.js blob is the merge-tree merged blob 6e095015…',
    git('ls-tree ' + SUBJECT_BRANCH + ' -- src/js/conversation.js').indexOf(MT_CONV_BLOB) !== -1, 'blob matches');
  T.ok('subject conversation.js diff vs the base is +4/-0 (exactly the pick\'s game-code hunk)',
    git('diff --numstat ' + BASE + ' ' + SUBJECT_BRANCH + ' -- src/js/conversation.js') === '4\t0\tsrc/js/conversation.js', 'conversation 4/0');
  T.ok('subject test-snippet-stage-direction.js blob is the merge-tree merged blob 92e4b9fe…',
    git('ls-tree ' + SUBJECT_BRANCH + ' -- scripts/test-snippet-stage-direction.js').indexOf(MT_TEST_BLOB) !== -1, 'blob matches');
  T.ok('subject balance-proof.json blob is the 14+12-base blob d0c6a42f… (byte-identical to the base)',
    git('ls-tree ' + SUBJECT_BRANCH + ' -- scripts/balance-proof.json').indexOf(BAL_OURS_BLOB) !== -1, 'balance-proof = base');
  T.ok('subject balance-proof.json is byte-identical to the 14+12 base (no diff)',
    git('diff --stat ' + BASE + ' ' + SUBJECT_BRANCH + ' -- scripts/balance-proof.json') === '', 'identical');
  T.ok('subject phone-frame-proof.json blob is the 14+12-base blob b0691014… (byte-identical to the base)',
    git('ls-tree ' + SUBJECT_BRANCH + ' -- scripts/phone-frame-proof.json').indexOf(PHONE_OURS_BLOB) !== -1, 'phone-frame-proof = base');
  T.ok('subject phone-frame-proof.json is byte-identical to the 14+12 base (no diff)',
    git('diff --stat ' + BASE + ' ' + SUBJECT_BRANCH + ' -- scripts/phone-frame-proof.json') === '', 'identical');
  T.ok('the pick\'s own diff DOES touch balance-proof.json +2/-2 (the resolution dropped it)',
    git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- scripts/balance-proof.json') === '2\t2\tscripts/balance-proof.json', 'pick diff 2/2');
  T.ok('the pick\'s own diff DOES touch phone-frame-proof.json +6/-6 (the resolution dropped it)',
    git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- scripts/phone-frame-proof.json') === '6\t6\tscripts/phone-frame-proof.json', 'pick diff 6/6');
  T.ok('the live subject carries the OVE-33 quote check in conversation.js',
    gitShow(SUBJECT_BRANCH, 'src/js/conversation.js').indexOf('if (/"/.test(s)) return false;') !== -1, 'quote check landed');
  T.ok('the live subject carries the OVE-33 assertions in the snippet test',
    gitShow(SUBJECT_BRANCH, 'scripts/test-snippet-stage-direction.js').indexOf("They go still.") !== -1, 'assertions landed');
  T.ok('the live subject carries the villager-brain asset line in sw.js',
    gitShow(SUBJECT_BRANCH, 'sw.js').indexOf('villager-brain.js?v=2294ef815-20261108-112829') !== -1, 'sw.js line landed');
  const headBranch2 = git('rev-parse --abbrev-ref HEAD');
  T.ok('HEAD is back on the arm branch sim-transplant15e-p2-a after the live pick (worktree-only)', worktreeOnly(headBranch2 === 'sim-transplant15e-p2-a'), 'HEAD=' + headBranch2);
  let cherryPickHead2 = true;
  try { execSync('git rev-parse --verify CHERRY_PICK_HEAD', { cwd: REPO, stdio: 'pipe' }); } catch (e) { cherryPickHead2 = false; }
  T.ok('no cherry-pick is in progress (the pick was continued, not aborted)', cherryPickHead2 === false, 'CHERRY_PICK_HEAD absent');

  // ---- 9. Step verdict — survived 4/8, NOT-CARRIER, far-end days reproduced seed-for-seed ----
  T.section('9. Step verdict — t15e-p2 survived 4/8, NOT-CARRIER');
  const sumPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  const sum = JSON.parse(fs.readFileSync(sumPath, 'utf8'));
  T.ok('step summary step id is t15e-p2', sum.step === STEP, sum.step);
  T.ok('step summary anchor commit is the subject acdbc793f07b', sum.perSeed.every(function (s) { return s.anchorCommit === 'acdbc793f07b'; }), 'anchor ok');
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
    driverLog.indexOf('culpritbisect-a t15e-p2: GOOD (survived 4/8)') !== -1 && driverLog.indexOf('rank: REGIONAL_INTACT') !== -1, 'analyzer classification present');
  T.ok('driver log records the fix sha f8fda4295a99 on all 8 seed result lines (compact form)',
    (driverLog.match(/"standingSha":"f8fda4295a99"/g) || []).length === 8, 'fix sha on 8 result lines');
  T.ok('driver log records the flap-hit INCOMPLETE line AND the recovered GOOD line (both stay on record)',
    driverLog.indexOf('INCOMPLETE corpus — missing seeds: 190395, 190396, 190397, 190398') !== -1 && driverLog.indexOf('culpritbisect-a t15e-p2: GOOD (survived 4/8)') !== -1, 'both lines present');
  T.ok('driver log carries the four @@FALLBACK blocks the corpus was recovered from',
    (driverLog.match(/@@FALLBACK /g) || []).length === 4, '4 fallback blocks');
  T.ok('on-disk standing.js is byte-identical to the arm-branch HEAD (native restored after the step)',
    sha256(fs.readFileSync(path.join(REPO, 'src', 'js', 'standing.js'), 'utf8')) === sha256(gitShow('HEAD', 'src/js/standing.js')), 'standing.js restored');
  // The four scratch files are TRACKED on the arm branch (the step
  // tooling lives there), so "no scratch left" means: none of them
  // shows as untracked or modified after the step — the tracked
  // files are intact and byte-identical to HEAD.
  const statusNow = git('status --porcelain');
  let scratchLeft = false;
  for (const f of ['scripts/culpritbisect-driver-20261113.js', 'scripts/culpritbisect-analyze-20261113.js', 'scripts/masterregress-analyze-20261113.js', 'scripts/vetfirst-instrument-20261111.js']) {
    if (statusNow.indexOf(f) !== -1) scratchLeft = true;
  }
  T.ok('no step tooling scratch residue in git status (tracked files untouched)', scratchLeft === false, 'status clean of scratch');
  const evMdPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15e-p2.md');
  const evMd = fs.existsSync(evMdPath) ? fs.readFileSync(evMdPath, 'utf8') : '';
  T.ok('evidence file exists', evMd.length > 0, evMdPath);
  T.ok('evidence file records the verdict NOT-CARRIER', evMd.indexOf('VERDICT: NOT-CARRIER') !== -1, 'verdict present');
  T.ok('evidence file records survived 4/8 and the per-seed days 86/144/150/43/150/87/150/150',
    evMd.indexOf('4/8') !== -1 && evMd.indexOf('86/144/150/43/150/87/150/150') !== -1, 'survival present');
  T.ok('evidence file records the subject hash acdbc793f and the predicted tree 35857b15…',
    evMd.indexOf('acdbc793f') !== -1 && evMd.indexOf('35857b15') !== -1, 'subject present');
  T.ok('evidence file records wave-5 2/8, median 150d, deaths 629',
    evMd.indexOf('wave-5 2/8') !== -1 && evMd.indexOf('150d') !== -1 && evMd.indexOf('629') !== -1, 'secondaries present');
  T.ok('evidence file records the telemetry deviation check refusal (recorder-corpus, baseline NOT rolled)',
    evMd.indexOf('Telemetry deviation check') !== -1 && evMd.indexOf('Baseline NOT') !== -1, 'telemetry note present');
  T.ok('evidence file records the pick-2-alone isolation (no pick 1 in the subject)',
    evMd.indexOf('pick 2 alone') !== -1 || evMd.indexOf('pick 2 ALONE') !== -1, 'isolation note present');
  T.ok('evidence file records the sense-test (resume opener never offered: 0 matches in the corpus)',
    evMd.indexOf('SENSE-TESTING') !== -1 && evMd.indexOf('0 resume-opener') !== -1, 'sense note present');
  T.ok('evidence file records the seed-for-seed far-end identity (same days on all 8 seeds)',
    evMd.indexOf('seed-for-seed') !== -1 || evMd.indexOf('seed for seed') !== -1, 'identity note present');
  T.ok('evidence file records the step duration and STEP id t15e-p2',
    evMd.indexOf('t15e-p2') !== -1, 'STEP present');
  T.ok('evidence file records the metric review section',
    evMd.indexOf('Metric review') !== -1, 'metric review present');
  T.ok('evidence file records the write-flap recovery (window, fallback extraction, analyzer re-run)',
    (evMd.indexOf('WRITE FLAP') !== -1 || evMd.indexOf('write flap') !== -1) && evMd.indexOf('FALLBACK') !== -1 && evMd.indexOf('21:39') !== -1, 'flap note present');

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
