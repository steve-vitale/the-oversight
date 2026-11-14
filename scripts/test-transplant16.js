#!/usr/bin/env node
// test-transplant16.js — proof test for the H1 TRANSPLANT,
// family 16 (js=0 merges, the last family, arm sim-transplant16-a).
//
// THE QUESTION (evidence/2026-11-14/sim-transplant16-prereg.md,
// prereg committed before the subject was cut or any judged sim
// ran): land origin family 16 onto the far end 203a32775 (GOOD
// 4/8) — twelve merges in origin order: #15 holdout-tradeoff,
// #17 phone-fun-proof, #19 phone-fun-r2, #21 living-garden-deed,
// #23 bonds-goal-pick-probe, #24 heard-raid-danger, #27
// dawn-scoring-entry, #31 one_person_army attainment, #49
// phase6-role-census, #50 improvements-verify-evidence, #119
// ove-159-phone-refresh, #121 ove-161-capable-seed-65. Family
// definition: sim-scale-onramp-round-2115.md §3, family 16.
// Grouping prereg: family15-grouping-prereg-2026-11-14.md (its
// closing note names family 16 as the last unmeasured family).
//
// THE TOOLING-RESOLUTION RULE (coordinator, decided 2026-11-14
// ~10:00Z, binding for this run's family-15/16 arms): a pick
// conflicting ONLY on zero-src-reader tooling files
// (scripts/green-list.txt, scripts/balance-proof.json,
// scripts/phone-frame-proof.json) resolves EACH such file with
// `git checkout --ours` (keep the far-end version byte-identical)
// and continues; ANY other conflicted file (any src/js, data,
// policy, docs, evidence, or test file) STOPS the arm immediately,
// no hand-resolution, no narrowed re-run decided by this arm.
//
// THE PREDICTED OUTCOME (from the merge-tree pre-check): pick 1
// (#15) conflicts on evidence/2026-11-08/prove-out-holdout.md —
// NON-TOOLING, modify/delete against a file the far end never
// had — so the arm is expected to STOP at pick 1
// (UNMEASURED-BY-CONFLICT) with NO judged sim. Picks 2-12 have
// NO chained prediction (the chain stops at pick 1); their
// far-end-based reads are INFORMATIONAL ONLY, recorded in the
// prereg so the coordinator can see which later picks carry the
// same missing-file shape and which are clean against the far end.
//
// STAGE 1 (this file as committed with the prereg) proves:
//   1. Family 16 identity — all twelve merges (hashes, subjects,
//      first + second parents, exact numstats, js=0, pol=0, no
//      standing.js, no policy file, no green-list.txt, none an
//      ancestor of the far end), in first-parent origin order.
//   2. Merge-tree pre-check — pick 1 rc=1 with EXACTLY the one
//      non-tooling file (STOP expected); picks 2-12 informational
//      far-end-based reads reproduced exactly (clean / tooling-only
//      / non-tooling shapes, labeled informational, never treated
//      as chained predictions).
//   3. Pick-1 mechanism — the file exists at pick 1's base and is
//      absent from the far end; it was added and modified by
//      side-branch commits (NOT first-parent); the merged tree
//      reports CONFLICT (modify/delete), stages 1+3 only.
//   4. Family content — no src/js in any pick; the probe scripts
//      are measure-only; the pick-12 test change is a seed re-seed
//      (63 -> 65, no assertion changed); no lever identifiers in
//      the tooling-JSON or test diffs.
//   5. Verdict mapping + tooling-resolution rule —
//      classifyTransplant maps every survived count; resolveTooling
//      maps a tooling-only set to CONTINUE and any non-tooling
//      file to UNMEASURED.
//   6. Prereg recorded in the evidence file (base, picks, seeds,
//      horizon, policy, STEP id, thresholds, STOP clause, tooling-
//      resolution rule, subject branch name, merge-tree predictions,
//      pick-1 mechanism, informational reads, ordering note,
//      seed-band freshness note).
//   7. Base state — HEAD is on sim-transplant16-a, no src/js file
//      differs from HEAD, on-disk standing.js is byte-identical
//      to HEAD, the step-script tooling source (master) still
//      carries all four scratch files; the step script names the
//      band 190391-190398; no subject branch exists yet; no STEP
//      t16-merges summary/driver log/corpus exists; no
//      cherry-pick is in progress.
// STAGE 2 (appended after the live pick) proves the live sequence:
//   8. Live pick 1 outcome (conflict list, STOP since a non-tooling
//      file conflicted) and the evidence file records the verdict
//      (UNMEASURED-BY-CONFLICT), the coordinator decision owed,
//      and that no judged sim ran.
//
// NOTE on scoped git reads: this proof avoids whole-tree `git diff`
// (a full-tree scan took ~16 min on a loaded box in the 15F arm;
// the run-start full check already established WORKTREE CLEAN).
// Dirt checks use pathspecs (scripts, evidence/2026-11-14, src/js)
// covering every path this arm writes; all other git calls are
// object-database reads (rev-parse, log, show, diff <commit>
// <commit>, merge-tree) and stay fast.
//
// Usage: node scripts/test-transplant16.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant16');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const PICKS = [
  { sha: 'b9f64660c73d6ec9c026415fb78dc51bd59055e8', first: 'e44b0206e5cf0c63c3603fb0580592564e72f676', second: 'ef7383bc0d052580f54369800f8529f1c10da117', subject: "Merge pull request #15 from steve-vitale/cursor/holdout-tradeoff-007e",
    numstat: ["20\t10\tevidence/2026-11-08/prove-out-holdout.md"] },
  { sha: 'b74db6460dd1de9a0e081cfa0517a2e4b798cabd', first: 'b9f64660c73d6ec9c026415fb78dc51bd59055e8', second: '07e3e3624a0a9cb03f3f8917b8451ea44e1da65d', subject: "Merge pull request #17 from steve-vitale/cursor/phone-fun-proof-master",
    numstat: ["2624\t0\tevidence/2026-11-08/phone-fun-frame-736-r1.json", "2696\t0\tevidence/2026-11-08/phone-fun-frame-844-r1.json", "5\t0\tevidence/2026-11-08/phone-fun-frame-r1.md", "96\t82\tscripts/phone-frame-proof.json"] },
  { sha: 'eb975a8a2e4e495904aa88fa04dc64908d6f398b', first: 'b74db6460dd1de9a0e081cfa0517a2e4b798cabd', second: '9e7d61b93897ebb2441b7321a5e4113457c6e5e0', subject: "Merge pull request #19 from steve-vitale/cursor/phone-fun-r2-master",
    numstat: ["2704\t0\tevidence/2026-11-08/phone-fun-frame-736-r2.json", "2620\t0\tevidence/2026-11-08/phone-fun-frame-844-r2.json", "6\t2\tevidence/2026-11-08/phone-fun-frame-r1.md", "6\t6\tscripts/phone-frame-proof.json"] },
  { sha: '9f388a524a534d922f90a76a8f04d0d3bbb31e70', first: 'eb975a8a2e4e495904aa88fa04dc64908d6f398b', second: '9095b34421543cfd178f36d63708b3802e90b6a9', subject: "Merge pull request #21 from steve-vitale/cursor/living-garden-deed-master",
    numstat: ["1262\t0\tevidence/2026-11-08/living-garden-deed-attainment-panel.json", "16\t0\tevidence/2026-11-08/living-garden-deed-attainment-panel.log", "54\t0\tevidence/2026-11-08/living-garden-deed-attainment.md", "389\t0\tscripts/godpath/test-living-garden-deed-attainment.js"] },
  { sha: 'cd535096fbe19656cec3322d28679839a1a91bc3', first: '713eb754524458be067c79fbfd3c89ee814dde80', second: '49fb2770d59c29aa653b5273e56bb3b756ea1932', subject: "Merge pull request #23 from steve-vitale/cursor/bonds-goal-pick-probe-9cfc",
    numstat: ["460\t0\tscripts/probe-bonds-goal-pick-20261108.js"] },
  { sha: 'aa5d9ef92d6f5e7d160f6b59bcbf7b54072b1ad0', first: 'cd535096fbe19656cec3322d28679839a1a91bc3', second: '5599559cb65a375ca886ccfd9d894b5adbed8e8e', subject: "Merge pull request #24 from steve-vitale/cursor/heard-raid-danger-3a06",
    numstat: ["4\t1\tevidence/2026-11-08/raid-danger-heard.md", "46\t0\tscripts/test-raid-danger-heard.js"] },
  { sha: 'b41bd630012cba1f160870a20fe925c273b020ce', first: '0f55a928c162ff0e7c46cd5f17d239b293614d92', second: 'f2a6d79f30f0e4ca30a488188bfbe153e8b386a3', subject: "Merge pull request #27 from steve-vitale/cursor/dawn-scoring-entry-7449",
    numstat: ["114\t0\tevidence/2026-11-08/dawn-pick-conflict.json", "49\t0\tevidence/2026-11-08/dawn-pick-conflict.md", "320\t0\tscripts/probe-dawn-pick-conflict-20261108.js"] },
  { sha: '230dba21979bec1fb933cf646ba982de3c60ee33', first: '055c48f62a3a9902f66d9fea88e57390fa1954ad', second: '652caa69c2f063d261fa6bc01ae1d1f694f20d9c', subject: "Merge origin/master (#31 one_person_army attainment) into OVE-37 port Co-authored-by: stevenvitale123 <stevenvitale123@gmail.com>",
    numstat: ["1048\t0\tevidence/2026-11-08/one-person-army-deed-attainment-panel.json", "16\t0\tevidence/2026-11-08/one-person-army-deed-attainment-panel.log", "55\t0\tevidence/2026-11-08/one-person-army-deed-attainment.md", "331\t0\tscripts/godpath/test-one-person-army-deed-attainment.js"] },
  { sha: '18ed96788cc507bda6434750051062c2b1afb893', first: '206fe4931e2e46c86fe22dc2071046ed0ba683ca', second: 'c019457b1a838b165ce0a5f5521fa2f4432f42ed', subject: "Merge pull request #49 from steve-vitale/cursor/phase6-role-census-01bc",
    numstat: ["1000\t0\tevidence/2026-11-08/phase6-role-census/analysis.json", "50\t0\tevidence/2026-11-08/phase6-role-census/analysis.log", "961\t0\tevidence/2026-11-08/phase6-role-census/panel.json", "34\t0\tevidence/2026-11-08/phase6-role-census/panel.log", "1\t0\tevidence/2026-11-08/phase6-role-census/rolecensus-p6-capable-seed1.json", "1\t0\tevidence/2026-11-08/phase6-role-census/rolecensus-p6-capable-seed1234.json", "1\t0\tevidence/2026-11-08/phase6-role-census/rolecensus-p6-capable-seed2.json", "1\t0\tevidence/2026-11-08/phase6-role-census/rolecensus-p6-capable-seed2026.json", "1\t0\tevidence/2026-11-08/phase6-role-census/rolecensus-p6-capable-seed3.json", "1\t0\tevidence/2026-11-08/phase6-role-census/rolecensus-p6-capable-seed31337.json", "1\t0\tevidence/2026-11-08/phase6-role-census/rolecensus-p6-capable-seed4.json", "1\t0\tevidence/2026-11-08/phase6-role-census/rolecensus-p6-capable-seed42.json", "1\t0\tevidence/2026-11-08/phase6-role-census/rolecensus-p6-capable-seed5.json", "1\t0\tevidence/2026-11-08/phase6-role-census/rolecensus-p6-capable-seed555.json", "1\t0\tevidence/2026-11-08/phase6-role-census/rolecensus-p6-capable-seed6.json", "1\t0\tevidence/2026-11-08/phase6-role-census/rolecensus-p6-capable-seed7.json", "1\t0\tevidence/2026-11-08/phase6-role-census/rolecensus-p6-capable-seed777.json", "1\t0\tevidence/2026-11-08/phase6-role-census/rolecensus-p6-capable-seed8.json", "1\t0\tevidence/2026-11-08/phase6-role-census/rolecensus-p6-capable-seed9.json", "1\t0\tevidence/2026-11-08/phase6-role-census/rolecensus-p6-capable-seed99.json", "1\t0\tevidence/2026-11-08/phase6-role-census/rolecensus-p6-competent-seed1.json", "1\t0\tevidence/2026-11-08/phase6-role-census/rolecensus-p6-competent-seed1234.json", "1\t0\tevidence/2026-11-08/phase6-role-census/rolecensus-p6-competent-seed2.json", "1\t0\tevidence/2026-11-08/phase6-role-census/rolecensus-p6-competent-seed2026.json", "1\t0\tevidence/2026-11-08/phase6-role-census/rolecensus-p6-competent-seed3.json", "1\t0\tevidence/2026-11-08/phase6-role-census/rolecensus-p6-competent-seed31337.json", "1\t0\tevidence/2026-11-08/phase6-role-census/rolecensus-p6-competent-seed4.json", "1\t0\tevidence/2026-11-08/phase6-role-census/rolecensus-p6-competent-seed42.json", "1\t0\tevidence/2026-11-08/phase6-role-census/rolecensus-p6-competent-seed5.json", "1\t0\tevidence/2026-11-08/phase6-role-census/rolecensus-p6-competent-seed555.json", "1\t0\tevidence/2026-11-08/phase6-role-census/rolecensus-p6-competent-seed6.json", "1\t0\tevidence/2026-11-08/phase6-role-census/rolecensus-p6-competent-seed7.json", "1\t0\tevidence/2026-11-08/phase6-role-census/rolecensus-p6-competent-seed777.json", "1\t0\tevidence/2026-11-08/phase6-role-census/rolecensus-p6-competent-seed8.json", "1\t0\tevidence/2026-11-08/phase6-role-census/rolecensus-p6-competent-seed9.json", "1\t0\tevidence/2026-11-08/phase6-role-census/rolecensus-p6-competent-seed99.json", "395\t0\tscripts/analyze-phase6-role-census-20261108.js", "471\t0\tscripts/probe-phase6-role-census-20261108.js"] },
  { sha: '3339c0195d2aceb202826ec95da92ff2f0c03fa7', first: '18ed96788cc507bda6434750051062c2b1afb893', second: '1b061300e21375b491bdca3379981c5e07b85552', subject: "Merge pull request #50 from steve-vitale/cursor/improvements-verify-evidence-f8e3",
    numstat: ["3636\t0\tevidence/2026-11-08/improvements-verify-cmp.json", "1\t0\tevidence/2026-11-08/improvements-verify-cmp.log", "158\t0\tevidence/2026-11-08/improvements-verify-cmp.md", "2861\t0\tevidence/2026-11-08/improvements-verify-features.json", "0\t0\tevidence/2026-11-08/improvements-verify-features.log", "1086\t0\tevidence/2026-11-08/improvements-verify-features.md", "2\t0\tevidence/2026-11-08/improvements-verify-panel.log", "-\t-\tevidence/2026-11-08/improvements-verify-panel/panel.json.gz"] },
  { sha: 'da153118c36741465e7630a7078f907ef6236952', first: '1ec04e16715b5693293df8f84a51e59cd02aaf56', second: 'be5620e7bbc25a20bdf831c98f6ee3477ebf57c5', subject: "Merge pull request #119 from steve-vitale/cursor/ove-159-phone-refresh-01a5",
    numstat: ["2583\t0\tevidence/2026-11-09/phone-ove159-frame-736-r1.json", "2592\t0\tevidence/2026-11-09/phone-ove159-frame-844-r1.json", "12\t0\tevidence/2026-11-09/phone-ove159-frame-r1.md", "5\t5\tscripts/phone-frame-proof.json"] },
  { sha: 'a628aeaf3b7c3f2b0bca1a5f4baf58cef1c100e4', first: 'abb3c2db25ef2234f9a4b82adaf1f1b2191195e4', second: '9a085609fd5460e560c3f3841e4079e67b73166e', subject: "Merge pull request #121 from steve-vitale/cursor/ove-161-capable-seed-65",
    numstat: ["1\t1\tscripts/test-capable-bot-20261014.js"] },
];
const MERGEBASE = 'd229b58f595430e2a24c399820061b39c5b689ca';
const PICK1_SIDE_ADD = '0ee7b3a39';
const PICK1_SIDE_MOD = 'ef7383bc0d052580f54369800f8529f1c10da117';
const SUBJECT_BRANCH = 'transplant-16-subject';
const STEP = 't16-merges';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
// Pick-1 merge-tree prediction (full-SHA args; tree OIDs are
// sensitive to the argument spelling, so the proof reproduces
// these exactly). No resolved tree, no prediction commit: the
// chain stops at pick 1.
const MT1 = { tree: '7c338f19a15d8ee0430560227bbc97b5a08e4498', conflicted: ['evidence/2026-11-08/prove-out-holdout.md'], resolved: null, pred: null, rc: 1 };
// Picks 2-12 INFORMATIONAL far-end-based reads (each pick merged
// against the BARE far end, same --merge-base=<first-parent>
// convention). NOT chained predictions: a pick's chained conflict
// set can differ from its bare-far-end set (e.g. pick 3's
// phone-fun-frame-r1.md conflict exists only because pick 2 adds
// that file). Recorded so the coordinator can see the shapes.
const INFO = [
  { tree: '155a799b8ea1f57089ad76948f92274b7686654f', conflicted: [], rc: 0 },
  { tree: 'd39ff096f581fc10e84605e71505afd9c8b27084', conflicted: ['evidence/2026-11-08/phone-fun-frame-r1.md', 'scripts/phone-frame-proof.json'], rc: 1 },
  { tree: 'bb446d104611ddc6bd19b5503567e417de984453', conflicted: [], rc: 0 },
  { tree: 'f59e24b8854a90b75414f6c8e9f209d5ad9bfc22', conflicted: [], rc: 0 },
  { tree: 'c7002fea20b552844527e3d7d3eff0e3a36a21f1', conflicted: ['evidence/2026-11-08/raid-danger-heard.md', 'scripts/test-raid-danger-heard.js'], rc: 1 },
  { tree: '5a37af9e89b215a09b33e631cf3355b254d70e19', conflicted: [], rc: 0 },
  { tree: '1ba44f8c153923b770161e9a480c76ac0f6f9c67', conflicted: [], rc: 0 },
  { tree: 'b091cab8e91f93ba776874fad214aa91ac3f49ae', conflicted: [], rc: 0 },
  { tree: '5b91fd6c5fb985f771f6325b9c1facce308afb10', conflicted: [], rc: 0 },
  { tree: '0ae869e3e5904092a3547c8498e8d5268e012a22', conflicted: ['scripts/phone-frame-proof.json'], rc: 1 },
  { tree: '7ad7801f68aaffc6833a59797cb7ec34970d52f2', conflicted: ['scripts/test-capable-bot-20261014.js'], rc: 1 },
];
const TOOLING_FILES = ['scripts/green-list.txt', 'scripts/balance-proof.json', 'scripts/phone-frame-proof.json'];

function sha256(text) { return crypto.createHash('sha256').update(text).digest('hex'); }
function git(args) {
  return execSync('git ' + args, { cwd: REPO, stdio: 'pipe' }).toString().trim();
}
function gitShow(commit, file) {
  return execSync('git show ' + commit + ':' + file, { cwd: REPO, stdio: 'pipe' }).toString();
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
  // ---- 1. Family 16 identity ----
  T.section('1. Family 16 identity — twelve merges, origin order, js=0, none an ancestor of the far end');
  for (const p of PICKS) {
    const short = p.sha.slice(0, 9);
    T.ok('pick ' + short + ' exists', git('rev-parse ' + p.sha).length === 40, git('log -1 --format=%s ' + p.sha).slice(0, 80));
    T.ok('pick ' + short + ' subject is "' + p.subject + '"', git('log -1 --format=%s ' + p.sha) === p.subject, git('log -1 --format=%s ' + p.sha).slice(0, 80));
    T.ok('pick ' + short + ' first parent is ' + p.first.slice(0, 9), git('rev-parse ' + p.sha + '^1') === p.first, git('log -1 --format=%h\\ %s ' + p.sha + '^1').slice(0, 80));
    T.ok('pick ' + short + ' second parent is ' + p.second.slice(0, 9), git('rev-parse ' + p.sha + '^2') === p.second, git('log -1 --format=%h\\ %s ' + p.sha + '^2').slice(0, 80));
    const parents = git('show -s --format=%P ' + p.sha).split(' ').filter(Boolean);
    T.ok('pick ' + short + ' has exactly 2 parents (a merge)', parents.length === 2, 'parents=' + parents.length);
    const jsFiles = git('diff --name-only ' + p.sha + '^1 ' + p.sha + ' -- src/js');
    T.ok('pick ' + short + ' touches no src/js file (js=0)', jsFiles === '', jsFiles || '(none)');
    const numstat = git('diff --numstat ' + p.sha + '^1 ' + p.sha).split('\n').filter(Boolean).sort().join('\n');
    T.ok('pick ' + short + ' numstat matches the prereg (' + p.numstat.length + ' files)',
      numstat === p.numstat.slice().sort().join('\n'), numstat.replace(/\n/g, ' | ').slice(0, 300));
    T.ok('pick ' + short + ' does not touch standing.js', git('diff --name-only ' + p.sha + '^1 ' + p.sha + ' -- src/js/standing.js') === '', '(absent)');
    const polFiles = git('diff --name-only ' + p.sha + '^1 ' + p.sha + ' -- scripts/policies');
    T.ok('pick ' + short + ' touches no policy file', polFiles === '', polFiles || '(none)');
    const greenFiles = git('diff --name-only ' + p.sha + '^1 ' + p.sha + ' -- scripts/green-list.txt');
    T.ok('pick ' + short + ' touches no green-list.txt', greenFiles === '', greenFiles || '(none)');
    T.ok('pick ' + short + ' is NOT an ancestor of the far end (subject is not the far end)',
      isAncestor(p.sha, FAR) === false, 'not-ancestor');
  }
  const fpOrder = git('log --first-parent --reverse --format=%H ' + MERGEBASE + '..a628aeaf3').split('\n');
  const idxs = PICKS.map(function (p) { return fpOrder.indexOf(p.sha); });
  T.ok('all twelve picks are on the first-parent chain d229b58f5..a628aeaf3', idxs.every(function (i) { return i !== -1; }), 'idx=' + idxs.join('/'));
  T.ok('pick order is origin order (positions 13,14,15,16,18,19,22,27,46,47,49,51 of 51)',
    JSON.stringify(idxs) === JSON.stringify([12, 13, 14, 15, 17, 18, 21, 26, 45, 46, 48, 50]), idxs.join(' < '));
  T.ok('pick 8 (#31) is a branch merge, not a PR merge (subject names origin/master #31)',
    PICKS[7].subject.indexOf('Merge origin/master (#31') === 0, PICKS[7].subject.slice(0, 40));
  T.ok('pick 12 (#121) is also the origin tip a628aeaf3 (second parent of the merge e4dbe581b)',
    git('rev-parse e4dbe581b^2') === PICKS[11].sha, 'e4dbe581b^2 == a628aeaf3');
  const farStanding = sha256(gitShow(FAR, 'src/js/standing.js'));
  T.ok('far-end native standing.js sha is 75762cb2...', farStanding.startsWith('75762cb2'), farStanding.slice(0, 12));
  T.ok('fix standing.js sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  const farPolicy = sha256(gitShow(FAR, 'scripts/policies/competent.js'));
  T.ok('far-end policy sha is a7ff5c51...', farPolicy.startsWith('a7ff5c51'), farPolicy.slice(0, 12));

  // ---- 2. Merge-tree pre-check ----
  T.section('2. Merge-tree pre-check — pick 1 non-tooling STOP; picks 2-12 informational far-end reads');
  const mt1 = mergeTree(PICKS[0].first, FAR_FULL, PICKS[0].sha);
  T.ok('pick 1 merge-tree rc=1', mt1.rc === 1, 'rc=' + mt1.rc);
  T.ok('pick 1 merge-tree tree is ' + MT1.tree.slice(0, 12) + '…', mt1.tree === MT1.tree, mt1.tree.slice(0, 12));
  T.ok('pick 1 merge-tree conflicts EXACTLY [evidence/2026-11-08/prove-out-holdout.md]',
    JSON.stringify(mt1.conflicted) === JSON.stringify(MT1.conflicted), mt1.conflicted.join(', ') || '(none)');
  T.ok('tooling-resolution rule maps the pick-1 conflict set to UNMEASURED (STOP expected)',
    resolveTooling(mt1.conflicted) === 'UNMEASURED', resolveTooling(mt1.conflicted));
  T.ok('pick 1 has NO resolved tree and NO prediction commit (STOP, nothing to build on)',
    MT1.resolved === null && MT1.pred === null, 'resolved=null pred=null');
  T.ok('pick-1 merged tree reports CONFLICT (modify/delete) for prove-out-holdout.md (deleted in the far end, modified in b9f64660c)',
    mt1.raw.indexOf('CONFLICT (modify/delete): evidence/2026-11-08/prove-out-holdout.md deleted in 203a327750a223e0a1465dc51f5409787efdfaae and modified in b9f64660c73d6ec9c026415fb78dc51bd59055e8') !== -1, 'modify/delete prove-out-holdout.md');
  for (let i = 1; i < PICKS.length; i++) {
    const p = PICKS[i];
    const info = INFO[i - 1];
    const mt = mergeTree(p.first, FAR_FULL, p.sha);
    T.ok('pick ' + (i + 1) + ' INFORMATIONAL far-end read rc=' + info.rc + ' (NOT a chained prediction)',
      mt.rc === info.rc, 'rc=' + mt.rc);
    T.ok('pick ' + (i + 1) + ' INFORMATIONAL far-end tree is ' + info.tree.slice(0, 12) + '…',
      mt.tree === info.tree, mt.tree.slice(0, 12));
    T.ok('pick ' + (i + 1) + ' INFORMATIONAL far-end conflicts EXACTLY [' + info.conflicted.join(', ') + ']',
      JSON.stringify(mt.conflicted) === JSON.stringify(info.conflicted.slice().sort()), mt.conflicted.join(', ') || '(none)');
    T.ok('pick ' + (i + 1) + ' INFORMATIONAL read resolves via the rule to ' + (info.conflicted.length === 0 ? 'NO-CONFLICT' : (info.conflicted.every(function (f) { return TOOLING_FILES.indexOf(f) !== -1; }) ? 'CONTINUE-OURS' : 'UNMEASURED')),
      resolveTooling(mt.conflicted) === (info.conflicted.length === 0 ? 'NO-CONFLICT' : (info.conflicted.every(function (f) { return TOOLING_FILES.indexOf(f) !== -1; }) ? 'CONTINUE-OURS' : 'UNMEASURED')), resolveTooling(mt.conflicted));
  }

  // ---- 3. Pick-1 mechanism ----
  T.section('3. Pick-1 mechanism — accepted tradeoff written on a file the far end never had');
  T.ok('0ee7b3a39 (prove-out holdout add) is NOT on the first-parent chain (side-branch commit)',
    fpOrder.indexOf(PICK1_SIDE_ADD + '00000000000000000000000000000000'.slice(0, 0)) === -1 || fpOrder.indexOf(git('rev-parse ' + PICK1_SIDE_ADD)) === -1, 'not first-parent');
  T.ok('0ee7b3a39 subject is "evidence: prove-out 64-seed holdout on 816404356"',
    git('log -1 --format=%s ' + PICK1_SIDE_ADD) === 'evidence: prove-out 64-seed holdout on 816404356', git('log -1 --format=%s ' + PICK1_SIDE_ADD).slice(0, 60));
  T.ok('0ee7b3a39 adds prove-out-holdout.md',
    git('diff --name-only ' + PICK1_SIDE_ADD + '^1 ' + PICK1_SIDE_ADD).indexOf('evidence/2026-11-08/prove-out-holdout.md') !== -1, 'file added by side branch');
  T.ok('ef7383bc0 (accept tradeoff) is NOT on the first-parent chain (side-branch commit)',
    fpOrder.indexOf(git('rev-parse ' + PICK1_SIDE_MOD)) === -1, 'not first-parent');
  T.ok('ef7383bc0 subject is "evidence: accept prove-out holdout review_required tradeoff"',
    git('log -1 --format=%s ' + PICK1_SIDE_MOD) === 'evidence: accept prove-out holdout review_required tradeoff', git('log -1 --format=%s ' + PICK1_SIDE_MOD).slice(0, 60));
  T.ok('ef7383bc0 is pick 1\'s second parent', git('rev-parse ' + PICKS[0].sha + '^2') === PICK1_SIDE_MOD, 'second parent');
  T.ok('ef7383bc0 modifies prove-out-holdout.md (+20/-10 — the same numstat as the merge diff)',
    git('diff --numstat ' + PICK1_SIDE_MOD + '^1 ' + PICK1_SIDE_MOD + ' -- evidence/2026-11-08/prove-out-holdout.md') === '20\t10\tevidence/2026-11-08/prove-out-holdout.md', '20/10');
  T.ok('prove-out-holdout.md EXISTS at pick-1 base e44b0206e (blob aff0d5ec…)',
    git('ls-tree ' + PICKS[0].first + ' -- evidence/2026-11-08/prove-out-holdout.md').indexOf('aff0d5ec5fea1848571e2883439943627674daa7') !== -1, 'base has it');
  T.ok('prove-out-holdout.md is ABSENT from the far end',
    (function () { try { execSync('git cat-file -e ' + FAR + ':evidence/2026-11-08/prove-out-holdout.md', { cwd: REPO, stdio: 'pipe' }); return false; } catch (e) { return true; } })(), '(absent at far end)');
  T.ok('prove-out-holdout.md is D in the diff pick-1-base -> far end',
    git('diff --name-status ' + PICKS[0].first + ' ' + FAR + ' -- evidence/2026-11-08/prove-out-holdout.md') === 'D\tevidence/2026-11-08/prove-out-holdout.md', 'D status');
  T.ok('pick-1 merged tree leaves the THEIRS version of prove-out-holdout.md in the tree (accepted review_required section present)',
    gitShow(MT1.tree, 'evidence/2026-11-08/prove-out-holdout.md').indexOf('accepted `review_required`') !== -1, 'theirs version in tree');
  T.ok('pick-1 merged tree stages are 1 + 3 only (base aff0d5ec…, theirs d1b27ea5…, no stage 2)',
    mt1.raw.indexOf('100644 aff0d5ec5fea1848571e2883439943627674daa7 1\tevidence/2026-11-08/prove-out-holdout.md') !== -1 &&
    mt1.raw.indexOf('100644 d1b27ea56ff7006924198fdf41a9c85cbdaef4d5 3\tevidence/2026-11-08/prove-out-holdout.md') !== -1 &&
    mt1.raw.indexOf(' 2\tevidence/2026-11-08/prove-out-holdout.md') === -1, 'stages 1+3');

  // ---- 4. Family content ----
  T.section('4. Family content — evidence/proof/test only, no lever numbers changed');
  const probe5 = gitShow(PICKS[4].sha, 'scripts/probe-bonds-goal-pick-20261108.js');
  T.ok('pick 5 probe script is measure-only ("Measure-only", "No policy/food/Loop B edits")',
    probe5.indexOf('Measure-only') !== -1 && probe5.indexOf('No policy/food/Loop B edits') !== -1, 'measure-only markers');
  const probe7 = gitShow(PICKS[6].sha, 'scripts/probe-dawn-pick-conflict-20261108.js');
  T.ok('pick 7 probe script is measure-only ("Measure-only", "No policy/food/Loop B edits")',
    probe7.indexOf('Measure-only') !== -1 && probe7.indexOf('No policy/food/Loop B edits') !== -1, 'measure-only markers');
  const probe9 = gitShow(PICKS[8].sha, 'scripts/probe-phase6-role-census-20261108.js');
  T.ok('pick 9 probe script is measure-only ("Measurement only. No Game/runtime edits")',
    probe9.indexOf('Measurement only. No Game/runtime edits') !== -1, 'measure-only markers');
  const test12diff = execSync('git diff ' + PICKS[11].sha + '^1 ' + PICKS[11].sha + ' -- scripts/test-capable-bot-20261014.js', { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  T.ok('pick 12 test diff changes the seed 63 -> 65 only (one line, seed-drift re-seed)',
    test12diff.indexOf('K.load({ seed: 63 })') !== -1 && test12diff.indexOf('K.load({ seed: 65 })') !== -1, 'seed 63 -> 65');
  T.ok('pick 12 test diff changes no lever identifiers (seed re-seed, not a retune)',
    ['damage', 'armor', 'spawnMonster', 'foodYield', 'spoilage', 'wave5', 'deedGate'].every(function (w) { return test12diff.indexOf(w) === -1; }), 'no lever identifiers');
  const test12 = gitShow(PICKS[11].sha, 'scripts/test-capable-bot-20261014.js');
  T.ok('pick 12 test names the seed-65 restoring run (2026-11-09, tip abb3c2db2, all sections pass, no assertion changed)',
    test12.indexOf('Seed 65 (2026-11-09, tip abb3c2db2') !== -1 && test12.indexOf('no assertion changed') !== -1, 'seed-65 note present');
  for (let i = 0; i < PICKS.length; i++) {
    const diffJs = execSync('git diff ' + PICKS[i].sha + '^1 ' + PICKS[i].sha + ' -- src/js', { cwd: REPO, stdio: 'pipe' }).toString('utf8');
    T.ok('pick ' + (i + 1) + ' src/js diff is empty (no game code at all)', diffJs === '', '(empty)');
  }
  for (const idx of [1, 2, 10]) {
    const proofDiff = execSync('git diff ' + PICKS[idx].sha + '^1 ' + PICKS[idx].sha + ' -- scripts/phone-frame-proof.json', { cwd: REPO, stdio: 'pipe' }).toString('utf8');
    T.ok('pick ' + (idx + 1) + ' phone-frame-proof diff changes no lever identifiers (receipt refresh only)',
      ['damage', 'armor', 'spawnMonster', 'foodYield', 'spoilage', 'wave5', 'deedGate'].every(function (w) { return proofDiff.indexOf(w) === -1; }), 'no lever identifiers');
  }
  const prereg1 = gitShow(PICKS[0].sha, 'evidence/2026-11-08/prove-out-holdout.md');
  T.ok('pick 1 theirs version names the accepted review_required decision (Decision: National confirms)',
    prereg1.indexOf('accepted `review_required`') !== -1 && prereg1.indexOf('National confirms') !== -1, 'accepted decision present');

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
  T.ok('resolution rule: phone-frame-proof.json alone -> CONTINUE-OURS',
    resolveTooling(['scripts/phone-frame-proof.json']) === 'CONTINUE-OURS', resolveTooling(['scripts/phone-frame-proof.json']));
  T.ok('resolution rule: prove-out-holdout.md alone -> UNMEASURED (STOP)',
    resolveTooling(['evidence/2026-11-08/prove-out-holdout.md']) === 'UNMEASURED', resolveTooling(['evidence/2026-11-08/prove-out-holdout.md']));
  T.ok('resolution rule: test-capable-bot alone -> UNMEASURED (STOP)',
    resolveTooling(['scripts/test-capable-bot-20261014.js']) === 'UNMEASURED', resolveTooling(['scripts/test-capable-bot-20261014.js']));
  T.ok('resolution rule: a src/js file -> UNMEASURED',
    resolveTooling(['src/js/convo-wants.js']) === 'UNMEASURED', resolveTooling(['src/js/convo-wants.js']));

  // ---- 6. Prereg recorded in the evidence file ----
  T.section('6. Prereg recorded in the evidence file');
  const evPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant16-prereg.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('prereg file exists', ev.length > 0, evPath);
  for (const p of PICKS) {
    T.ok('prereg names pick ' + p.sha.slice(0, 9), ev.indexOf(p.sha.slice(0, 9)) !== -1, 'pick present');
  }
  T.ok('prereg names the far end 203a32775', ev.indexOf('203a32775') !== -1, 'far end present');
  T.ok('prereg names the band 190391-190398', ev.indexOf('190391') !== -1 && ev.indexOf('190398') !== -1, 'band present');
  T.ok('prereg names the STEP id t16-merges', ev.indexOf('t16-merges') !== -1, 'STEP present');
  T.ok('prereg records the STOP clause', ev.indexOf('STOP clause') !== -1, 'STOP clause present');
  T.ok('prereg records the coordinator tooling-resolution rule (decided 2026-11-14 ~10:00Z)',
    ev.indexOf('TOOLING-RESOLUTION RULE') !== -1 && ev.indexOf('checkout --ours') !== -1, 'tooling rule present');
  T.ok('prereg records the thresholds (CARRIER <=1/8, AMBIGUOUS 2/8, NOT-CARRIER >=3/8)',
    ev.indexOf('CARRIER') !== -1 && ev.indexOf('AMBIGUOUS') !== -1 && ev.indexOf('NOT-CARRIER') !== -1, 'thresholds present');
  T.ok('prereg records the subject branch name transplant-16-subject', ev.indexOf('transplant-16-subject') !== -1, 'subject branch present');
  T.ok('prereg records merge-tree 7c338f19…', ev.indexOf('7c338f19') !== -1, 'merge-tree present');
  for (const info of INFO) {
    T.ok('prereg records informational tree ' + info.tree.slice(0, 8) + '…', ev.indexOf(info.tree.slice(0, 8)) !== -1, 'info tree present');
  }
  T.ok('prereg records the pick-1 mechanism (0ee7b3a39, ef7383bc0, modify/delete, prove-out-holdout)',
    ev.indexOf('0ee7b3a39') !== -1 && ev.indexOf('ef7383bc0') !== -1 && ev.indexOf('modify/delete') !== -1 && ev.indexOf('prove-out-holdout') !== -1, 'pick-1 mechanism present');
  T.ok('prereg labels picks 2-12 reads INFORMATIONAL ONLY (not chained predictions)',
    ev.indexOf('INFORMATIONAL') !== -1 && ev.indexOf('NO chained prediction') !== -1, 'informational label present');
  T.ok('prereg records the seed-band freshness note (64+ files, matched band)',
    ev.indexOf('Seed-band freshness note') !== -1 && ev.indexOf('64+ files') !== -1, 'seed-band note present');
  T.ok('prereg records the grouping authority (family15-grouping-prereg-2026-11-14.md)',
    ev.indexOf('family15-grouping-prereg-2026-11-14.md') !== -1, 'authority present');
  T.ok('prereg records the canon note (no canon doc covers evidence/proof/test-only merge landings)',
    ev.indexOf('No canon doc covers') !== -1, 'canon note present');
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
  T.ok('HEAD is on the arm branch sim-transplant16-a (worktree-only)', worktreeOnly(headBranch === 'sim-transplant16-a'), 'HEAD=' + headBranch);
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
  // Stage 2: the subject branch was cut after the prereg commit;
  // its tip is the far end (zero picks applied — pick 1 STOPPED).
  let subjectExists = true;
  try { git('rev-parse ' + SUBJECT_BRANCH); } catch (e) { subjectExists = false; }
  T.ok('subject branch exists (cut after the prereg commit; stage 2)', subjectExists === true, SUBJECT_BRANCH + ' present');
  T.ok('subject tip is the far end 203a32775 (zero picks applied)',
    git('rev-parse ' + SUBJECT_BRANCH) === FAR_FULL, git('rev-parse ' + SUBJECT_BRANCH).slice(0, 12));
  T.ok('subject has exactly 0 commits on top of the far end (pick 1 never landed)',
    git('rev-list --count ' + FAR + '..' + SUBJECT_BRANCH) === '0', 'count=0');
  T.ok('subject tip subject is the far-end subject (sim-wave5kill-a)',
    git('log -1 --format=%s ' + SUBJECT_BRANCH) === 'sim-wave5kill-a: blooded damage/survivability lever for wave-5 kills [needs-eyes] — pilot GO (6 kills from 0) + confirm GO (6 vs 2 control) on fresh band 99867-99882; proof 35/0; panel review_required (village-deaths watch, see evidence)', git('log -1 --format=%s ' + SUBJECT_BRANCH).slice(0, 80));
  T.ok('subject tree equals the far-end tree (nothing applied)',
    git('rev-parse ' + SUBJECT_BRANCH + '^{tree}') === git('rev-parse ' + FAR + '^{tree}'), 'trees equal');
  const t16Summary = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  T.ok('no step summary exists for t16-merges (no judged sim ran)', fs.existsSync(t16Summary) === false, STEP);
  const t16Driver = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  T.ok('no step driver log exists for t16-merges (no judged sim ran)', fs.existsSync(t16Driver) === false, STEP);
  const corpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  T.ok('no step corpus exists for t16-merges (no judged sim ran)', fs.existsSync(corpusDir) === false, STEP);
  let cherryPickHead = true;
  try { execSync('git rev-parse --verify CHERRY_PICK_HEAD', { cwd: REPO, stdio: 'pipe' }); } catch (e) { cherryPickHead = false; }
  T.ok('no cherry-pick is in progress', cherryPickHead === false, 'CHERRY_PICK_HEAD absent');
  const dirtyTracked = git('diff --name-only HEAD -- scripts evidence/2026-11-14 src/js');
  const allowed = ['scripts/test-transplant16.js', 'evidence/2026-11-14/sim-transplant16-prereg.md', 'evidence/2026-11-14/sim-transplant16.md'];
  const dirtyOther = dirtyTracked.split('\n').filter(function (ln) {
    return ln && !allowed.some(function (a) { return ln === a; });
  }).join('\n');
  T.ok('tracked tree is clean apart from this proof + the prereg (uncommitted until this proof passes)', dirtyOther === '', dirtyOther.slice(0, 200) || '(only allowed files)');

  // ---- 8. Live pick 1 — STOP outcome, nothing resolved, nothing measured ----
  T.section('8. STOP outcome — pick-1 conflict reported, nothing hand-resolved, nothing measured');
  const ev16Path = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant16.md');
  const ev16 = fs.existsSync(ev16Path) ? fs.readFileSync(ev16Path, 'utf8') : '';
  T.ok('evidence file exists', ev16.length > 0, ev16Path);
  T.ok('evidence file records the outcome as UNMEASURED-BY-CONFLICT', ev16.indexOf('UNMEASURED-BY-CONFLICT') !== -1, 'outcome present');
  T.ok('evidence file records the exact conflict list (DU evidence/2026-11-08/prove-out-holdout.md)',
    ev16.indexOf('DU evidence/2026-11-08/prove-out-holdout.md') !== -1, 'conflict list present');
  T.ok('evidence file records the modify/delete wording (deleted in HEAD and modified in b9f64660c)',
    ev16.indexOf('CONFLICT (modify/delete)') !== -1 && ev16.indexOf('deleted in HEAD and modified in b9f64660c') !== -1, 'modify/delete present');
  T.ok('evidence file records stages 1 + 3 only, no stage 2 (base blob aff0d5ec…, theirs d1b27ea5…)',
    ev16.indexOf('stages 1 + 3') !== -1 && ev16.indexOf('aff0d5ec') !== -1 && ev16.indexOf('d1b27ea5') !== -1, 'stages present');
  T.ok('evidence file records the subject left at the far end 203a32775 with zero picks applied',
    ev16.indexOf('LEFT in place at 203a32775') !== -1 && ev16.indexOf('ZERO picks') !== -1, 'subject tip present');
  T.ok('evidence file records the live pick-1 merge tree 7c338f19…',
    ev16.indexOf('7c338f19') !== -1, 'live tree present');
  T.ok('evidence file records that no judged sim ran', ev16.indexOf('No judged sim ran') !== -1, 'no-sim note present');
  T.ok('evidence file records the pick-1 mechanism (0ee7b3a39, ef7383bc0, prove-out holdout note)',
    ev16.indexOf('0ee7b3a39') !== -1 && ev16.indexOf('ef7383bc0') !== -1, 'mechanism present');
  T.ok('evidence file records the coordinator decision owed (drop pick 1 / land the note first / record unmeasurable)',
    ev16.indexOf('Coordinator decision owed') !== -1, 'coordinator note present');
  T.ok('evidence file records the infrastructure (flap ALL-OK, index clobber, telemetry NOT RUN)',
    ev16.indexOf('HOST WRITE FLAP') !== -1 && ev16.indexOf('INDEX CLOBBER') !== -1 &&
    ev16.indexOf('Telemetry deviation check: NOT RUN') !== -1, 'infrastructure present');
  T.ok('evidence file records that no file was resolved (Resolutions recorded: NONE)',
    ev16.indexOf('Resolutions recorded: NONE') !== -1, 'no-resolution note present');
  T.ok('evidence file records Verdict: NONE', ev16.indexOf('Verdict: NONE') !== -1, 'verdict NONE present');
  T.ok('evidence file records STEP t16-merges never ran (no corpus, summary, or driver log)',
    ev16.indexOf('STEP t16-merges: never run') !== -1, 'STEP note present');
  T.ok('no verdict (CARRIER/AMBIGUOUS/NOT-CARRIER) is claimed anywhere in the evidence file',
    ev16.indexOf('VERDICT: CARRIER') === -1 && ev16.indexOf('VERDICT: AMBIGUOUS') === -1 && ev16.indexOf('VERDICT: NOT-CARRIER') === -1, 'no verdict claimed');
  T.ok('evidence file records the informational reads (NOT predictions, #119 tooling-only, #121 test conflict)',
    ev16.indexOf('INFORMATIONAL ONLY') !== -1 && ev16.indexOf('#119') !== -1 && ev16.indexOf('#121') !== -1, 'informational reads present');
  T.ok('evidence file records the sense-testing note (no transcripts — no judged sim ran)',
    ev16.indexOf('Sense-testing') !== -1 && ev16.indexOf('no transcripts exist') !== -1, 'sense-testing present');
  // Prereg-commit ancestry by MESSAGE, not hash (0608Z lesson: an
  // adoption rebase rewrites hashes).
  const logSubjects = git('log --format=%s HEAD');
  T.ok('prereg commit is an ancestor of HEAD (resolved by message, not hash)',
    logSubjects.indexOf('sim-transplant16-a: prereg + stage-1 proof (290 legs; pick 1 non-tooling STOP predicted, picks 2-12 informational only)') !== -1, 'prereg message present');
  const headBranch2 = git('rev-parse --abbrev-ref HEAD');
  T.ok('HEAD is back on the arm branch sim-transplant16-a after the live pick (worktree-only)', worktreeOnly(headBranch2 === 'sim-transplant16-a'), 'HEAD=' + headBranch2);
  let cherryPickHead2 = true;
  try { execSync('git rev-parse --verify CHERRY_PICK_HEAD', { cwd: REPO, stdio: 'pipe' }); } catch (e) { cherryPickHead2 = false; }
  T.ok('no cherry-pick is in progress (pick 1 was aborted)', cherryPickHead2 === false, 'CHERRY_PICK_HEAD absent');
  T.ok('no pick-1 commit exists on the subject (holdout-tradeoff never landed)',
    git('log --format=%s ' + FAR + '..' + SUBJECT_BRANCH).indexOf('holdout-tradeoff') === -1, 'no pick-1 commit');
  T.ok('subject diff vs far end is empty (nothing applied)',
    git('diff --name-only ' + FAR + ' ' + SUBJECT_BRANCH) === '', '(empty diff)');

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
