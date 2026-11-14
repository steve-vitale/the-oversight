#!/usr/bin/env node
// test-transplant15f-picks16.js — proof test for the H1 TRANSPLANT,
// family 15F picks 1–6 ALONE (arm sim-transplant15f-picks16-a).
//
// THE QUESTION (evidence/2026-11-14/sim-transplant15f-picks16-prereg.md,
// prereg committed before any judged sim ran): land origin family
// 15F picks 1–6 onto the far end 203a32775 (GOOD 4/8) — six
// standalone first-parent commits in origin order: 055c48f62 OVE-37
// (refresh phone/balance proofs on master tip), 97a67d4f8 OVE-47
// (refresh phone-frame proof on master tip), 49341fd78 OVE-53
// (refresh phone-frame proof after favor thresholds), 6e53adc62
// OVE-56 (refresh phone-frame proof after bond dawn), a1567198c
// OVE-55 (Phase 4 social rates screen on tip 748cce3b8), be39a0a4e
// OVE-57 (refresh proofs on tip 134a3d0ab after rebase). Pick 7
// (74a16306c OVE-61, person-trust baseline refresh) is EXCLUDED:
// it depends on the person-trust writer feature the far end never
// had, and the 15F group arm STOPPED on it. Coordinator decision:
// evidence/2026-11-14/sim-transplant-round-1215.md (next blank #4,
// route (a)). Grouping prereg:
// hidden_files/family15-grouping-prereg-2026-11-14.md §15F. Binding
// prereg: sim-scale-onramp-round-2115.md §3.
//
// THE SUBJECT ALREADY EXISTS: branch `transplant-15f-subject` at
// 4eca36017, built by the 15F group arm (picks 1–6 landed live,
// each tree byte-identical to its merge-tree prediction; pick 7
// attempted and aborted). This arm does NOT re-pick — it verifies
// the subject from the branch (§3) and runs the STEP against its
// tip. If the subject does not verify, FAIL LOUDLY and stop.
//
// THE TOOLING-RESOLUTION RULE (coordinator, decided 2026-11-14
// ~10:00Z, binding for this run's family-15 arms): a pick
// conflicting ONLY on zero-src-reader tooling files
// (scripts/green-list.txt, scripts/balance-proof.json,
// scripts/phone-frame-proof.json) resolves EACH such file with
// `git checkout --ours` (keep the far-end version byte-identical)
// and continues; ANY other conflicted file (any src/js, data,
// policy, docs, evidence, or test file) STOPS the arm immediately,
// no hand-resolution, no narrowed re-run decided by this arm.
// (For THIS arm the picks are already landed — the rule is
// recorded because the subject's validity rests on it; the live
// resolutions are in the 15F evidence, seven entries, all
// `git checkout --ours` + `git add`.)
//
// STAGE 1 (this file as committed with the prereg) proves:
//   1. Family 15F picks 1–6 identity — all six picks (hashes,
//      subjects, first parents, exact numstats, js=0, no
//      standing.js, no policy file, no green-list.txt), in
//      first-parent origin order.
//   2. Merge-tree pre-check — picks 1–4 and 6 rc=1 with
//      tooling-only conflict sets (resolve --ours, continue);
//      pick 5 rc=0 clean; each predicted-resolved tree and
//      prediction commit; every resolved tree keeps all three
//      tooling files byte-identical to the far end; the pick-6
//      .gz deletion is clean (both sides deleted).
//   3. Subject verification — branch transplant-15f-subject
//      exists at 4eca36017 (tree 7bee7b39…, the predicted
//      pick-6-resolved tree); exactly six commits on the far end
//      in origin order; each live pick tree equals its predicted
//      resolved tree; the subject's diff vs the far end equals
//      picks 1–6 minus tooling (20 files, all additions); all
//      three tooling files byte-identical to the far end; no
//      OVE-61 commit on the subject.
//   4. Pick-7 exclusion — pick 7 is not on the subject; its two
//      files belong to the person-trust writer feature (side-
//      branch commit 458811411, NOT first-parent) the far end
//      lacks; the pick-7 merge-tree conflicts on exactly those
//      two non-tooling files (STOP class).
//   5. Family content — no src/js in any pick; the proof-JSON
//      diffs move only panel pointers/digests; the probe script
//      is measure-only; no lever identifiers in the tooling-JSON
//      diffs.
//   6. Verdict mapping + tooling-resolution rule —
//      classifyTransplant maps every survived count; resolveTooling
//      maps a tooling-only set to CONTINUE and any non-tooling
//      file to UNMEASURED.
//   7. Prereg recorded in the evidence file (base, picks, seeds,
//      horizon, policy, STEP id, thresholds, STOP clause, tooling-
//      resolution rule, subject branch name + verification,
//      merge-tree predictions, pick-7 exclusion, ordering note,
//      seed-band freshness note).
//   8. Base state — HEAD is on sim-transplant15f-picks16-a, no
//      src/js file differs from HEAD, on-disk standing.js is
//      byte-identical to HEAD, the step-script tooling source
//      (master) still carries all four scratch files; the step
//      script names the band 190391-190398; no subject re-pick
//      is in progress; no STEP t15f-picks16 summary/driver log/
//      corpus exists; no cherry-pick is in progress.
// STAGE 2 (appended after the STEP) proves the step:
//   9. Step corpus + summary + verdict — 8 per-seed JSONs exist
//      and parse; every seed ran on the subject tip 4eca36017
//      with the fix swapped in (standingSha f8fda4295a99,
//      policySha a7ff5c51…); the summary's survived count equals
//      the per-seed 'survived' count and the verdict is
//      classifyTransplant(survived); the driver log shows the
//      swap and no FAIL.
//  10. Evidence recorded — the evidence file records the verdict
//      (matching the summary), the per-seed table, wall numbers,
//      sense-testing, metric review, and infrastructure; the
//      prereg commit is an ancestor of HEAD (by message, not
//      hash); HEAD is back on the arm branch; standing.js is
//      restored byte-identical to HEAD; no cherry-pick is in
//      progress.
//
// NOTE on scoped git reads: this proof avoids whole-tree `git diff`
// (a full-tree scan took ~16 min on a loaded box in the 15F arm;
// the run-start full check already established WORKTREE CLEAN).
// Dirt checks use pathspecs (scripts, evidence/2026-11-14, src/js)
// covering every path this arm writes; all other git calls are
// object-database reads (rev-parse, log, show, diff <commit>
// <commit>, merge-tree) and stay fast.
//
// Usage: node scripts/test-transplant15f-picks16.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant15f-picks16');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const PICKS = [
  { sha: '055c48f62a3a9902f66d9fea88e57390fa1954ad', first: '23245d5d6d91b4b5284e2f503345dcfd1621ff0c', subject: 'OVE-37: refresh phone/balance proofs on master tip',
    numstat: ['-\t-\tevidence/2026-11-08/neutral-ove37-master-port.json.gz', '2613\t0\tevidence/2026-11-08/phone-ove37-master-frame-736-r1.json', '2609\t0\tevidence/2026-11-08/phone-ove37-master-frame-844-r1.json', '2\t2\tscripts/balance-proof.json', '9\t9\tscripts/phone-frame-proof.json'] },
  { sha: '97a67d4f8eedbe44296f045d6e7ea0990dbb7d36', first: 'c937de65f32d26e064d8935dd984490b2ee50a6c', subject: 'OVE-47: refresh phone-frame proof on master tip',
    numstat: ['2660\t0\tevidence/2026-11-08/phone-fun-reverify-frame-736-r2.json', '2727\t0\tevidence/2026-11-08/phone-fun-reverify-frame-844-r2.json', '9\t0\tevidence/2026-11-08/phone-fun-reverify-r1.md', '8\t8\tscripts/phone-frame-proof.json'] },
  { sha: '49341fd7824023543b13dca40831d704d49e4637', first: '4594de6b528e40872c356f1d465762581ce06cd1', subject: 'OVE-53: refresh phone-frame proof after favor thresholds',
    numstat: ['2561\t0\tevidence/2026-11-08/phone-favor-frame-736-r1.json', '2653\t0\tevidence/2026-11-08/phone-favor-frame-844-r1.json', '10\t0\tevidence/2026-11-08/phone-favor-frame-r1.md', '5\t5\tscripts/phone-frame-proof.json'] },
  { sha: '6e53adc62e1570a9fdf3a80e1c20bee05004e709', first: '1c1b23482a11581047af8a82cca0040ef7b162a1', subject: 'OVE-56: refresh phone-frame proof after bond dawn',
    numstat: ['2729\t0\tevidence/2026-11-08/phone-bond-frame-736-r1.json', '2725\t0\tevidence/2026-11-08/phone-bond-frame-844-r1.json', '11\t0\tevidence/2026-11-08/phone-bond-frame-r1.md', '10\t10\tscripts/phone-frame-proof.json'] },
  { sha: 'a1567198c125a3649b8a8bd5de8bf160c8a51c6b', first: '6e53adc62e1570a9fdf3a80e1c20bee05004e709', subject: 'OVE-55: Phase 4 social rates screen on tip 748cce3b8',
    numstat: ['207\t0\tevidence/2026-11-08/phase4-social-rates-analysis.json', '66\t0\tevidence/2026-11-08/phase4-social-rates-analysis.md', '3008\t0\tevidence/2026-11-08/phase4-social-rates-panel.json', '606\t0\tscripts/probe-phase4-social-rates-20261108.js'] },
  { sha: 'be39a0a4e0e7eeb93dda2dccdc4189a399ceb9bc', first: '4a1c77cf10733b28e3bc7bc7f3fe47880d6ecc24', subject: 'OVE-57: refresh proofs on tip 134a3d0ab after rebase',
    numstat: ['-\t-\tevidence/2026-11-08/neutral-ove57-tip-134a3d0ab.json.gz', '-\t-\tevidence/2026-11-08/neutral-ove57-tip-6e53adc62.json.gz', '2633\t0\tevidence/2026-11-08/phone-ove57-frame-736-r1.json', '2712\t0\tevidence/2026-11-08/phone-ove57-frame-844-r1.json', '8\t0\tevidence/2026-11-08/phone-ove57-frame-r1.md', '2\t2\tscripts/balance-proof.json', '6\t6\tscripts/phone-frame-proof.json'] },
];
const PICK7 = { sha: '74a16306c2879e58d4c6e0037657d63876e92088', first: 'be39a0a4e0e7eeb93dda2dccdc4189a399ceb9bc', subject: 'OVE-61: refresh person-trust non-aimed errand mix baseline' };
const MERGEBASE = 'd229b58f595430e2a24c399820061b39c5b689ca';
const PERSON_TRUST_SIDE = '4588114119f62e93788fb463385f8556457b2f72';
const SUBJECT_BRANCH = 'transplant-15f-subject';
const SUBJECT_TIP = '4eca36017f5f2cd76d255afc85cf98af307d630b';
const SUBJECT_TREE = '7bee7b39eb98ce201163aaf86528d7aed220ce5b';
const STEP = 't15f-picks16';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
// Merge-tree predictions (full-SHA args; tree OIDs are sensitive to
// the argument spelling, so the proof reproduces these exactly).
// [mtTree, conflicted, resolvedTree, predCommit]
const MT = [
  { tree: '1a2a7a47cb3e9c406200b0b442a0b6c23f0c80e1', conflicted: ['scripts/balance-proof.json', 'scripts/phone-frame-proof.json'], resolved: '67eb5c3763a9122a2063917c4f81bfc4e0088bfb', pred: '54ee8f9dc967595700ea9b768455147b9e9f149e', rc: 1 },
  { tree: '85563e78dafece7d8b389702d3ff508866d47d74', conflicted: ['scripts/phone-frame-proof.json'], resolved: '875ce641821a1d07fd13123b567ed08a684d9993', pred: '6c0e62869bfd31fd2e62a7b47f445f2dba790579', rc: 1 },
  { tree: '249dc673425f2d195dde6b5fc2ce1dd4e96aae1e', conflicted: ['scripts/phone-frame-proof.json'], resolved: '62931b19ce3e3745968d4a6a288ab6a3924c26a7', pred: '3f61a00fc721e7dabeaa76830f83d988dec9cc01', rc: 1 },
  { tree: 'a647e5e0a1a1c884b648adc8c2d70e9d16a9c1d7', conflicted: ['scripts/phone-frame-proof.json'], resolved: 'f8d9ce88b8d0c835b452a06de16b8e484696fabe', pred: '97104ebe4f817bfc4d310835c10fb9a44dffc297', rc: 1 },
  { tree: '043917f554d59a316b57bd34a010d2e97b49b6e3', conflicted: [], resolved: '043917f554d59a316b57bd34a010d2e97b49b6e3', pred: '0352381b7b46dc9e265ae88c7fcb4e9833e60604', rc: 0 },
  { tree: 'c4ee41198c86ece805c2712019b2e92676a52e00', conflicted: ['scripts/balance-proof.json', 'scripts/phone-frame-proof.json'], resolved: '7bee7b39eb98ce201163aaf86528d7aed220ce5b', pred: '0dd7267b1953938815e7c992fd8adc2dcfc579b4', rc: 1 },
];
// Pick-7 merge-tree prediction (from the 15F prereg; the pick is
// EXCLUDED here, but the prediction proves the exclusion class).
const MT7 = { tree: '13f1049ef9b229ca9d70a6486f38f093d45004d6', conflicted: ['evidence/2026-11-08/person-trust-prereg.md', 'scripts/test-person-trust-20261108.js'], rc: 1 };
// Incremental resolved diffs (pick N resolved tree vs pick N-1
// resolved tree; pick 1 vs the far end) — each is the pick's diff
// minus its tooling files.
const INCR = [
  ['-\t-\tevidence/2026-11-08/neutral-ove37-master-port.json.gz', '2613\t0\tevidence/2026-11-08/phone-ove37-master-frame-736-r1.json', '2609\t0\tevidence/2026-11-08/phone-ove37-master-frame-844-r1.json'],
  ['2660\t0\tevidence/2026-11-08/phone-fun-reverify-frame-736-r2.json', '2727\t0\tevidence/2026-11-08/phone-fun-reverify-frame-844-r2.json', '9\t0\tevidence/2026-11-08/phone-fun-reverify-r1.md'],
  ['2561\t0\tevidence/2026-11-08/phone-favor-frame-736-r1.json', '2653\t0\tevidence/2026-11-08/phone-favor-frame-844-r1.json', '10\t0\tevidence/2026-11-08/phone-favor-frame-r1.md'],
  ['2729\t0\tevidence/2026-11-08/phone-bond-frame-736-r1.json', '2725\t0\tevidence/2026-11-08/phone-bond-frame-844-r1.json', '11\t0\tevidence/2026-11-08/phone-bond-frame-r1.md'],
  ['207\t0\tevidence/2026-11-08/phase4-social-rates-analysis.json', '66\t0\tevidence/2026-11-08/phase4-social-rates-analysis.md', '3008\t0\tevidence/2026-11-08/phase4-social-rates-panel.json', '606\t0\tscripts/probe-phase4-social-rates-20261108.js'],
  ['-\t-\tevidence/2026-11-08/neutral-ove57-tip-134a3d0ab.json.gz', '2633\t0\tevidence/2026-11-08/phone-ove57-frame-736-r1.json', '2712\t0\tevidence/2026-11-08/phone-ove57-frame-844-r1.json', '8\t0\tevidence/2026-11-08/phone-ove57-frame-r1.md'],
];
// Cumulative resolved diff (far end -> pick-6-resolved tree).
const CUMUL6 = ['-\t-\tevidence/2026-11-08/neutral-ove37-master-port.json.gz', '-\t-\tevidence/2026-11-08/neutral-ove57-tip-134a3d0ab.json.gz', '10\t0\tevidence/2026-11-08/phone-favor-frame-r1.md', '11\t0\tevidence/2026-11-08/phone-bond-frame-r1.md', '207\t0\tevidence/2026-11-08/phase4-social-rates-analysis.json', '2561\t0\tevidence/2026-11-08/phone-favor-frame-736-r1.json', '2609\t0\tevidence/2026-11-08/phone-ove37-master-frame-844-r1.json', '2613\t0\tevidence/2026-11-08/phone-ove37-master-frame-736-r1.json', '2633\t0\tevidence/2026-11-08/phone-ove57-frame-736-r1.json', '2653\t0\tevidence/2026-11-08/phone-favor-frame-844-r1.json', '2660\t0\tevidence/2026-11-08/phone-fun-reverify-frame-736-r2.json', '2712\t0\tevidence/2026-11-08/phone-ove57-frame-844-r1.json', '2725\t0\tevidence/2026-11-08/phone-bond-frame-844-r1.json', '2727\t0\tevidence/2026-11-08/phone-fun-reverify-frame-844-r2.json', '2729\t0\tevidence/2026-11-08/phone-bond-frame-736-r1.json', '3008\t0\tevidence/2026-11-08/phase4-social-rates-panel.json', '606\t0\tscripts/probe-phase4-social-rates-20261108.js', '66\t0\tevidence/2026-11-08/phase4-social-rates-analysis.md', '8\t0\tevidence/2026-11-08/phone-ove57-frame-r1.md', '9\t0\tevidence/2026-11-08/phone-fun-reverify-r1.md'];
const TOOLING_FILES = ['scripts/green-list.txt', 'scripts/balance-proof.json', 'scripts/phone-frame-proof.json'];
// The six live pick commits on the subject branch (from the 15F arm).
const LIVE = [
  { sha: 'c833d182d1f3197288c05da2508c6a0fff431606', subject: 'OVE-37: refresh phone/balance proofs on master tip',
    files: ['evidence/2026-11-08/neutral-ove37-master-port.json.gz', 'evidence/2026-11-08/phone-ove37-master-frame-736-r1.json', 'evidence/2026-11-08/phone-ove37-master-frame-844-r1.json'] },
  { sha: '1654a4f67a003adc4746227013453e16aefdce1a', subject: 'OVE-47: refresh phone-frame proof on master tip',
    files: ['evidence/2026-11-08/phone-fun-reverify-frame-736-r2.json', 'evidence/2026-11-08/phone-fun-reverify-frame-844-r2.json', 'evidence/2026-11-08/phone-fun-reverify-r1.md'] },
  { sha: 'e59dfa2620d3fdaa57268f46352732e76f7b5b3d', subject: 'OVE-53: refresh phone-frame proof after favor thresholds',
    files: ['evidence/2026-11-08/phone-favor-frame-736-r1.json', 'evidence/2026-11-08/phone-favor-frame-844-r1.json', 'evidence/2026-11-08/phone-favor-frame-r1.md'] },
  { sha: 'bc5fbf7521a91aa2114462fbad0d1303e6f69ed8', subject: 'OVE-56: refresh phone-frame proof after bond dawn',
    files: ['evidence/2026-11-08/phone-bond-frame-736-r1.json', 'evidence/2026-11-08/phone-bond-frame-844-r1.json', 'evidence/2026-11-08/phone-bond-frame-r1.md'] },
  { sha: '952d4cf048055927df885a18b0b13dbb32c32e70', subject: 'OVE-55: Phase 4 social rates screen on tip 748cce3b8',
    files: ['evidence/2026-11-08/phase4-social-rates-analysis.json', 'evidence/2026-11-08/phase4-social-rates-analysis.md', 'evidence/2026-11-08/phase4-social-rates-panel.json', 'scripts/probe-phase4-social-rates-20261108.js'] },
  { sha: '4eca36017f5f2cd76d255afc85cf98af307d630b', subject: 'OVE-57: refresh proofs on tip 134a3d0ab after rebase',
    files: ['evidence/2026-11-08/neutral-ove57-tip-134a3d0ab.json.gz', 'evidence/2026-11-08/phone-ove57-frame-736-r1.json', 'evidence/2026-11-08/phone-ove57-frame-844-r1.json', 'evidence/2026-11-08/phone-ove57-frame-r1.md'] },
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
function sortedNumstat(a, b) {
  return git('diff --numstat ' + a + ' ' + b).split('\n').filter(Boolean).sort().join('\n');
}

(async () => {
  // ---- 1. Family 15F picks 1–6 identity ----
  T.section('1. Family 15F picks 1-6 identity — six standalone first-parent commits, origin order');
  for (const p of PICKS) {
    const short = p.sha.slice(0, 9);
    T.ok('pick ' + short + ' exists', git('rev-parse ' + p.sha).length === 40, git('log -1 --format=%s ' + p.sha).slice(0, 80));
    T.ok('pick ' + short + ' subject is "' + p.subject + '"', git('log -1 --format=%s ' + p.sha) === p.subject, git('log -1 --format=%s ' + p.sha).slice(0, 80));
    T.ok('pick ' + short + ' first parent is ' + p.first.slice(0, 9), git('rev-parse ' + p.sha + '^1') === p.first, git('log -1 --format=%h\\ %s ' + p.sha + '^1').slice(0, 80));
    const parents = git('show -s --format=%P ' + p.sha).split(' ').filter(Boolean);
    T.ok('pick ' + short + ' has exactly 1 parent (standalone, not a merge)', parents.length === 1, 'parents=' + parents.length);
    const jsFiles = git('diff --name-only ' + p.sha + '^1 ' + p.sha + ' -- src/js');
    T.ok('pick ' + short + ' touches no src/js file (js=0)', jsFiles === '', jsFiles || '(none)');
    const numstat = git('diff --numstat ' + p.sha + '^1 ' + p.sha).split('\n').filter(Boolean).sort().join('\n');
    T.ok('pick ' + short + ' numstat matches the prereg (' + p.numstat.length + ' files)',
      numstat === p.numstat.slice().sort().join('\n'), numstat.replace(/\n/g, ' | '));
    T.ok('pick ' + short + ' does not touch standing.js', git('diff --name-only ' + p.sha + '^1 ' + p.sha + ' -- src/js/standing.js') === '', '(absent)');
    const polFiles = git('diff --name-only ' + p.sha + '^1 ' + p.sha + ' -- scripts/policies');
    T.ok('pick ' + short + ' touches no policy file', polFiles === '', polFiles || '(none)');
    const greenFiles = git('diff --name-only ' + p.sha + '^1 ' + p.sha + ' -- scripts/green-list.txt');
    T.ok('pick ' + short + ' touches no green-list.txt', greenFiles === '', greenFiles || '(none)');
  }
  const fpOrder = git('log --first-parent --reverse --format=%H ' + MERGEBASE + '..a628aeaf3').split('\n');
  const idxs = PICKS.map(function (p) { return fpOrder.indexOf(p.sha); });
  T.ok('all six picks are on the first-parent chain d229b58f5..a628aeaf3', idxs.every(function (i) { return i !== -1; }), 'idx=' + idxs.join('/'));
  T.ok('pick order is origin order (055c48f62 before 97a67d4f8 before 49341fd78 before 6e53adc62 before a1567198c before be39a0a4e)',
    idxs.every(function (v, i, a) { return i === 0 || a[i - 1] < v; }), idxs.join(' < '));
  const farStanding = sha256(gitShow(FAR, 'src/js/standing.js'));
  T.ok('far-end native standing.js sha is 75762cb2...', farStanding.startsWith('75762cb2'), farStanding.slice(0, 12));
  T.ok('fix standing.js sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  const farPolicy = sha256(gitShow(FAR, 'scripts/policies/competent.js'));
  T.ok('far-end policy sha is a7ff5c51...', farPolicy.startsWith('a7ff5c51'), farPolicy.slice(0, 12));

  // ---- 2. Merge-tree pre-check ----
  T.section('2. Merge-tree pre-check — picks 1-4 and 6 tooling-only, pick 5 clean');
  let ours = FAR_FULL;
  for (let i = 0; i < PICKS.length; i++) {
    const p = PICKS[i];
    const m = MT[i];
    const mt = mergeTree(p.first, ours, p.sha);
    T.ok('pick ' + (i + 1) + ' merge-tree rc=' + m.rc, mt.rc === m.rc, 'rc=' + mt.rc);
    T.ok('pick ' + (i + 1) + ' merge-tree tree is ' + m.tree.slice(0, 12) + '…', mt.tree === m.tree, mt.tree.slice(0, 12));
    T.ok('pick ' + (i + 1) + ' merge-tree conflicts EXACTLY [' + m.conflicted.join(', ') + ']',
      JSON.stringify(mt.conflicted) === JSON.stringify(m.conflicted.slice().sort()), mt.conflicted.join(', ') || '(none)');
    T.ok('tooling-resolution rule maps the pick-' + (i + 1) + ' conflict set to ' + (m.conflicted.length === 0 ? 'NO-CONFLICT' : 'CONTINUE-OURS'),
      resolveTooling(mt.conflicted) === (m.conflicted.length === 0 ? 'NO-CONFLICT' : 'CONTINUE-OURS'), resolveTooling(mt.conflicted));
    T.ok('pick-' + (i + 1) + '-resolved tree is ' + m.resolved.slice(0, 12) + '…',
      git('rev-parse ' + m.pred + '^{tree}') === m.resolved, m.resolved.slice(0, 12));
    const parent = i === 0 ? FAR_FULL : MT[i - 1].pred;
    T.ok('prediction commit ' + m.pred.slice(0, 9) + ' has parent = previous predicted tree',
      git('rev-parse ' + m.pred + '^1') === parent, 'parent=' + git('rev-parse ' + m.pred + '^1').slice(0, 9));
    const incr = sortedNumstat(i === 0 ? FAR : MT[i - 1].pred, m.pred);
    T.ok('pick-' + (i + 1) + ' incremental resolved diff is exactly the pick minus tooling (' + INCR[i].length + ' files)',
      incr === INCR[i].slice().sort().join('\n'), incr.replace(/\n/g, ' | '));
    for (const f of TOOLING_FILES) {
      T.ok('pick-' + (i + 1) + '-resolved tree keeps ' + f + ' byte-identical to the far end',
        sha256(gitShow(m.pred, f)) === sha256(gitShow(FAR, f)), f + ' == far end');
    }
    ours = m.pred;
  }
  const cumul6 = sortedNumstat(FAR, MT[5].pred);
  T.ok('cumulative resolved diff (far end -> pick-6-resolved) is exactly picks 1-6 minus tooling (20 files)',
    cumul6 === CUMUL6.slice().sort().join('\n'), cumul6.replace(/\n/g, ' | ').slice(0, 300));
  T.ok('neutral-ove57-tip-6e53adc62.json.gz IS present at pick-6 base 4a1c77cf1',
    git('ls-tree ' + PICKS[5].first + ' -- evidence/2026-11-08/neutral-ove57-tip-6e53adc62.json.gz') !== '', 'base has it');
  T.ok('neutral-ove57-tip-6e53adc62.json.gz is ABSENT from the pick-6-resolved tree (both-sides-deleted, clean)',
    git('ls-tree ' + MT[5].pred + ' -- evidence/2026-11-08/neutral-ove57-tip-6e53adc62.json.gz') === '', '(absent)');
  T.ok('neutral-ove57-tip-134a3d0ab.json.gz IS present in the pick-6-resolved tree (the replacement panel)',
    git('ls-tree ' + MT[5].pred + ' -- evidence/2026-11-08/neutral-ove57-tip-134a3d0ab.json.gz') !== '', 'replacement present');

  // ---- 3. Subject verification ----
  T.section('3. Subject verification — branch transplant-15f-subject at 4eca36017, picks 1-6 live');
  let subjectExists = true;
  try { git('rev-parse ' + SUBJECT_BRANCH); } catch (e) { subjectExists = false; }
  T.ok('subject branch exists (pre-built by the 15F arm, left in place)', subjectExists === true, SUBJECT_BRANCH + ' present');
  T.ok('subject tip is the pick-6 commit 4eca36017 (OVE-57)',
    git('rev-parse ' + SUBJECT_BRANCH) === SUBJECT_TIP && git('log -1 --format=%s ' + SUBJECT_BRANCH) === 'OVE-57: refresh proofs on tip 134a3d0ab after rebase', git('log -1 --format=%h\\ %s ' + SUBJECT_BRANCH).slice(0, 80));
  T.ok('subject tip tree is 7bee7b39… (the predicted pick-6-resolved tree)',
    git('rev-parse ' + SUBJECT_BRANCH + '^{tree}') === SUBJECT_TREE, git('rev-parse ' + SUBJECT_BRANCH + '^{tree}').slice(0, 12));
  T.ok('subject has exactly 6 commits on top of the far end (picks 1-6 only)',
    git('rev-list --count ' + FAR + '..' + SUBJECT_BRANCH) === '6', 'count=6');
  T.ok('no pick-7 commit exists on the subject (OVE-61 never landed)',
    git('log --format=%s ' + FAR + '..' + SUBJECT_BRANCH).indexOf('OVE-61') === -1, 'no OVE-61 commit');
  for (let i = 0; i < LIVE.length; i++) {
    const c = LIVE[i];
    const m = MT[i];
    T.ok('live pick-' + (i + 1) + ' commit exists (' + c.sha.slice(0, 9) + ', ' + c.subject.slice(0, 30) + '…)',
      git('rev-parse ' + c.sha).length === 40 && git('log -1 --format=%s ' + c.sha) === c.subject, git('log -1 --format=%h\\ %s ' + c.sha).slice(0, 80));
    T.ok('live pick-' + (i + 1) + ' tree is ' + m.resolved.slice(0, 12) + '… (the predicted pick-' + (i + 1) + '-resolved tree)',
      git('rev-parse ' + c.sha + '^{tree}') === m.resolved, git('rev-parse ' + c.sha + '^{tree}').slice(0, 12));
    const liveFiles = git('diff --name-only ' + c.sha + '^1 ' + c.sha).split('\n').filter(Boolean).sort();
    T.ok('live pick-' + (i + 1) + ' commit touches exactly the ' + c.files.length + ' non-tooling files (no proof JSON, no green-list)',
      JSON.stringify(liveFiles) === JSON.stringify(c.files.slice().sort()), liveFiles.join(', '));
    const parent = i === 0 ? FAR_FULL : LIVE[i - 1].sha;
    T.ok('live pick-' + (i + 1) + ' parent is ' + (i === 0 ? 'the far end' : 'live pick-' + i),
      git('rev-parse ' + c.sha + '^1') === parent, 'parent=' + git('rev-parse ' + c.sha + '^1').slice(0, 9));
  }
  const subjNumstat = sortedNumstat(FAR, SUBJECT_BRANCH);
  T.ok('subject diff vs far end is exactly picks 1-6 minus tooling (20 files)',
    subjNumstat === CUMUL6.slice().sort().join('\n'), subjNumstat.replace(/\n/g, ' | ').slice(0, 300));
  const subjDeletions = git('diff --numstat ' + FAR + ' ' + SUBJECT_BRANCH).split('\n').filter(Boolean).reduce(function (acc, ln) { const d = ln.split('\t')[1]; return acc + (d === '-' ? 0 : parseInt(d, 10)); }, 0);
  T.ok('subject diff has 0 deletions (all additions)', subjDeletions === 0, 'deletions=' + subjDeletions);
  for (const f of TOOLING_FILES) {
    T.ok('subject tip keeps ' + f + ' byte-identical to the far end (checkout --ours kept it)',
      sha256(gitShow(SUBJECT_BRANCH, f)) === sha256(gitShow(FAR, f)), f + ' == far end');
  }
  T.ok('neutral-ove57-tip-6e53adc62.json.gz is ABSENT from the subject tip (both-sides-deleted, clean)',
    git('ls-tree ' + SUBJECT_BRANCH + ' -- evidence/2026-11-08/neutral-ove57-tip-6e53adc62.json.gz') === '', '(absent)');
  T.ok('neutral-ove57-tip-134a3d0ab.json.gz IS present at the subject tip (the replacement panel)',
    git('ls-tree ' + SUBJECT_BRANCH + ' -- evidence/2026-11-08/neutral-ove57-tip-134a3d0ab.json.gz') !== '', 'replacement present');

  // ---- 4. Pick-7 exclusion ----
  T.section('4. Pick-7 exclusion — refresh on top of a person-trust feature the far end lacks');
  T.ok('pick 7 exists (74a16306c OVE-61)', git('rev-parse ' + PICK7.sha).length === 40, git('log -1 --format=%s ' + PICK7.sha).slice(0, 80));
  T.ok('pick 7 subject is "' + PICK7.subject + '"', git('log -1 --format=%s ' + PICK7.sha) === PICK7.subject, git('log -1 --format=%s ' + PICK7.sha).slice(0, 80));
  T.ok('pick 7 first parent is pick 6 (be39a0a4e)', git('rev-parse ' + PICK7.sha + '^1') === PICK7.first, 'first parent=pick 6');
  T.ok('458811411 (person-trust writers) is NOT on the first-parent chain (side-branch commit)',
    fpOrder.indexOf(PERSON_TRUST_SIDE) === -1, 'not first-parent');
  T.ok('458811411 subject is "Write per-villager trust map from lived events"',
    git('log -1 --format=%s ' + PERSON_TRUST_SIDE) === 'Write per-villager trust map from lived events', git('log -1 --format=%s ' + PERSON_TRUST_SIDE).slice(0, 60));
  T.ok('458811411 adds src/js/person-trust.js (+233)',
    git('diff --numstat ' + PERSON_TRUST_SIDE + '^1 ' + PERSON_TRUST_SIDE + ' -- src/js/person-trust.js') === '233\t0\tsrc/js/person-trust.js', 'person-trust.js +233');
  T.ok('person-trust-prereg.md is ABSENT from the far end',
    (function () { try { execSync('git cat-file -e ' + FAR + ':evidence/2026-11-08/person-trust-prereg.md', { cwd: REPO, stdio: 'pipe' }); return false; } catch (e) { return true; } })(), '(absent at far end)');
  T.ok('test-person-trust-20261108.js is ABSENT from the far end',
    (function () { try { execSync('git cat-file -e ' + FAR + ':scripts/test-person-trust-20261108.js', { cwd: REPO, stdio: 'pipe' }); return false; } catch (e) { return true; } })(), '(absent at far end)');
  T.ok('person-trust-prereg.md is ABSENT from the subject tip (pick 7 never landed)',
    git('ls-tree ' + SUBJECT_BRANCH + ' -- evidence/2026-11-08/person-trust-prereg.md') === '', '(absent from subject)');
  T.ok('test-person-trust-20261108.js is ABSENT from the subject tip (pick 7 never landed)',
    git('ls-tree ' + SUBJECT_BRANCH + ' -- scripts/test-person-trust-20261108.js') === '', '(absent from subject)');
  const mt7 = mergeTree(PICK7.first, MT[5].pred, PICK7.sha);
  T.ok('pick-7 merge-tree rc=1', mt7.rc === MT7.rc, 'rc=' + mt7.rc);
  T.ok('pick-7 merge-tree tree is ' + MT7.tree.slice(0, 12) + '…', mt7.tree === MT7.tree, mt7.tree.slice(0, 12));
  T.ok('pick-7 merge-tree conflicts EXACTLY the two non-tooling files',
    JSON.stringify(mt7.conflicted) === JSON.stringify(MT7.conflicted.slice().sort()), mt7.conflicted.join(', '));
  T.ok('tooling-resolution rule maps the pick-7 conflict set to UNMEASURED (STOP class — correctly excluded)',
    resolveTooling(mt7.conflicted) === 'UNMEASURED', resolveTooling(mt7.conflicted));
  T.ok('pick-7 merged tree reports CONFLICT (modify/delete) for person-trust-prereg.md (deleted in ours, modified in theirs)',
    mt7.raw.indexOf('CONFLICT (modify/delete): evidence/2026-11-08/person-trust-prereg.md deleted in 0dd7267b') !== -1, 'modify/delete prereg.md');
  T.ok('pick-7 merged tree reports CONFLICT (modify/delete) for test-person-trust-20261108.js (deleted in ours, modified in theirs)',
    mt7.raw.indexOf('CONFLICT (modify/delete): scripts/test-person-trust-20261108.js deleted in 0dd7267b') !== -1, 'modify/delete test');

  // ---- 5. Family content ----
  T.section('5. Family content — proof refreshes only, no lever numbers changed');
  const bal1 = gitShow(PICKS[0].sha, 'scripts/balance-proof.json');
  T.ok('pick 1 balance-proof.json points at the new neutral panel (neutral-ove37-master-port.json.gz)',
    bal1.indexOf('neutral-ove37-master-port.json.gz') !== -1, 'new panel pointer');
  const bal1base = gitShow(PICKS[0].first, 'scripts/balance-proof.json');
  T.ok('pick 1 base balance-proof.json points at the old panel (neutral-ove33-master-quick.json.gz)',
    bal1base.indexOf('neutral-ove33-master-quick.json.gz') !== -1, 'old panel pointer');
  const balDiff = execSync('git diff ' + PICKS[0].sha + '^1 ' + PICKS[0].sha + ' -- scripts/balance-proof.json', { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  T.ok('pick 1 balance-proof diff changes only panel + panelDigest lines (no lever identifiers)',
    ['damage', 'armor', 'spawnMonster', 'foodYield', 'spoilage', 'wave5', 'deedGate'].every(function (w) { return balDiff.indexOf(w) === -1; }), 'no lever identifiers');
  const probe5 = gitShow(PICKS[4].sha, 'scripts/probe-phase4-social-rates-20261108.js');
  T.ok('pick 5 probe script is measure-only ("Measure-only social rates screen", "No Game/runtime edits")',
    probe5.indexOf('Measure-only social rates screen') !== -1 && probe5.indexOf('No Game/runtime edits') !== -1, 'measure-only markers');
  for (let i = 0; i < PICKS.length; i++) {
    const diffJs = execSync('git diff ' + PICKS[i].sha + '^1 ' + PICKS[i].sha + ' -- src/js', { cwd: REPO, stdio: 'pipe' }).toString('utf8');
    T.ok('pick ' + (i + 1) + ' src/js diff is empty (no game code at all)', diffJs === '', '(empty)');
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
  T.ok('resolution rule: phone-frame-proof.json alone -> CONTINUE-OURS',
    resolveTooling(['scripts/phone-frame-proof.json']) === 'CONTINUE-OURS', resolveTooling(['scripts/phone-frame-proof.json']));
  T.ok('resolution rule: green-list.txt + phone-frame-proof.json -> CONTINUE-OURS',
    resolveTooling(['scripts/green-list.txt', 'scripts/phone-frame-proof.json']) === 'CONTINUE-OURS', resolveTooling(['scripts/green-list.txt', 'scripts/phone-frame-proof.json']));
  T.ok('resolution rule: person-trust-prereg.md + test-person-trust -> UNMEASURED (STOP)',
    resolveTooling(['evidence/2026-11-08/person-trust-prereg.md', 'scripts/test-person-trust-20261108.js']) === 'UNMEASURED', resolveTooling(['evidence/2026-11-08/person-trust-prereg.md', 'scripts/test-person-trust-20261108.js']));
  T.ok('resolution rule: one evidence file alone -> UNMEASURED',
    resolveTooling(['evidence/2026-11-08/person-trust-prereg.md']) === 'UNMEASURED', resolveTooling(['evidence/2026-11-08/person-trust-prereg.md']));
  T.ok('resolution rule: one test file alone -> UNMEASURED',
    resolveTooling(['scripts/test-person-trust-20261108.js']) === 'UNMEASURED', resolveTooling(['scripts/test-person-trust-20261108.js']));
  T.ok('resolution rule: a src/js file -> UNMEASURED',
    resolveTooling(['src/js/convo-wants.js']) === 'UNMEASURED', resolveTooling(['src/js/convo-wants.js']));

  // ---- 7. Prereg recorded in the evidence file ----
  T.section('7. Prereg recorded in the evidence file');
  const evPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15f-picks16-prereg.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('prereg file exists', ev.length > 0, evPath);
  for (const p of PICKS) {
    T.ok('prereg names pick ' + p.sha.slice(0, 9) + ' (' + p.subject.slice(0, 20) + '…)', ev.indexOf(p.sha.slice(0, 9)) !== -1, 'pick present');
  }
  T.ok('prereg names the far end 203a32775', ev.indexOf('203a32775') !== -1, 'far end present');
  T.ok('prereg names the band 190391-190398', ev.indexOf('190391') !== -1 && ev.indexOf('190398') !== -1, 'band present');
  T.ok('prereg names the STEP id t15f-picks16', ev.indexOf('t15f-picks16') !== -1, 'STEP present');
  T.ok('prereg records the STOP clause', ev.indexOf('STOP clause') !== -1, 'STOP clause present');
  T.ok('prereg records the coordinator tooling-resolution rule (decided 2026-11-14 ~10:00Z)',
    ev.indexOf('TOOLING-RESOLUTION RULE') !== -1 && ev.indexOf('checkout --ours') !== -1, 'tooling rule present');
  T.ok('prereg records the thresholds (CARRIER <=1/8, AMBIGUOUS 2/8, NOT-CARRIER >=3/8)',
    ev.indexOf('CARRIER') !== -1 && ev.indexOf('AMBIGUOUS') !== -1 && ev.indexOf('NOT-CARRIER') !== -1, 'thresholds present');
  T.ok('prereg records the subject branch name transplant-15f-subject', ev.indexOf('transplant-15f-subject') !== -1, 'subject branch present');
  T.ok('prereg records the subject tip 4eca36017 and the predicted tree 7bee7b39…',
    ev.indexOf('4eca36017') !== -1 && ev.indexOf('7bee7b39') !== -1, 'subject tip present');
  T.ok('prereg records the coordinator decision (round-1215, next blank #4, route (a))',
    ev.indexOf('sim-transplant-round-1215.md') !== -1 && ev.indexOf('route (a)') !== -1, 'coordinator decision present');
  for (const m of MT) {
    T.ok('prereg records merge-tree ' + m.tree.slice(0, 8) + '…', ev.indexOf(m.tree.slice(0, 8)) !== -1, 'merge-tree present');
  }
  for (const m of MT) {
    T.ok('prereg records resolved tree ' + m.resolved.slice(0, 8) + '…', ev.indexOf(m.resolved.slice(0, 8)) !== -1, 'resolved tree present');
    T.ok('prereg records prediction commit ' + m.pred.slice(0, 8), ev.indexOf(m.pred.slice(0, 8)) !== -1, 'pred commit present');
  }
  T.ok('prereg records the pick-7 exclusion (458811411, modify/delete, person-trust)',
    ev.indexOf('458811411') !== -1 && ev.indexOf('modify/delete') !== -1 && ev.indexOf('person-trust') !== -1, 'pick-7 exclusion present');
  T.ok('prereg records the 15F WARNING (tooling files regenerated per tip)',
    ev.indexOf('15F WARNING') !== -1, 'warning present');
  T.ok('prereg records the seed-band freshness note (68 files, matched band)',
    ev.indexOf('Seed-band freshness note') !== -1 && ev.indexOf('68 files') !== -1, 'seed-band note present');
  T.ok('prereg records the grouping authority (§15F)', ev.indexOf('family15-grouping-prereg-2026-11-14.md') !== -1, 'authority present');
  T.ok('prereg records the canon note (no canon doc covers proof refreshes)',
    ev.indexOf('No canon doc covers proof-refresh') !== -1, 'canon note present');
  T.ok('prereg records the horizon 150d death-aware', ev.indexOf('150d') !== -1, 'horizon present');
  T.ok('prereg records the competent verbatim own-policy', ev.indexOf('competent') !== -1, 'policy present');
  T.ok('prereg records the ordering note (pre-check live-validated, subject pre-existed and verified)',
    ev.indexOf('Ordering note') !== -1, 'ordering note present');
  T.ok('prereg records the subject verification (six commits, 20 files, 30547 insertions, 0 deletions)',
    ev.indexOf('Subject verification') !== -1 && ev.indexOf('30547') !== -1, 'subject verification present');

  // ---- 8. Base state ----
  T.section('8. Base state — arm branch clean, subject verified, sim not run');
  const headBranch = git('rev-parse --abbrev-ref HEAD');
  // worktreeOnly: branch-identity legs are meaningful only in the
  // worker tree. On merged master HEAD is 'master' by design (the
  // arm branch is deleted after landing) — the leg passes there
  // vacuously instead of failing, so the proof stays green on master
  // (0215Z lesson). Prereg-commit ancestry legs resolve by
  // message/subject, not hash (0608Z lesson: an adoption rebase
  // rewrites hashes).
  const worktreeOnly = function (cond) { return cond || headBranch === 'master'; };
  T.ok('HEAD is on the arm branch sim-transplant15f-picks16-a (worktree-only)', worktreeOnly(headBranch === 'sim-transplant15f-picks16-a'), 'HEAD=' + headBranch);
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
  const t15fSummary = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  T.ok('no step summary exists for t15f-picks16 (no judged sim ran)', fs.existsSync(t15fSummary) === false, STEP);
  const t15fDriver = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  T.ok('no step driver log exists for t15f-picks16 (no judged sim ran)', fs.existsSync(t15fDriver) === false, STEP);
  const corpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  T.ok('no step corpus exists for t15f-picks16 (no judged sim ran)', fs.existsSync(corpusDir) === false, STEP);
  let cherryPickHead = true;
  try { execSync('git rev-parse --verify CHERRY_PICK_HEAD', { cwd: REPO, stdio: 'pipe' }); } catch (e) { cherryPickHead = false; }
  T.ok('no cherry-pick is in progress', cherryPickHead === false, 'CHERRY_PICK_HEAD absent');
  const dirtyTracked = git('diff --name-only HEAD -- scripts evidence/2026-11-14 src/js');
  const allowed = ['scripts/test-transplant15f-picks16.js', 'evidence/2026-11-14/sim-transplant15f-picks16-prereg.md', 'evidence/2026-11-14/sim-transplant15f-picks16.md'];
  const dirtyOther = dirtyTracked.split('\n').filter(function (ln) {
    return ln && !allowed.some(function (a) { return ln === a; });
  }).join('\n');
  T.ok('tracked tree is clean apart from this proof + the prereg + the evidence file (uncommitted until this proof passes)', dirtyOther === '', dirtyOther.slice(0, 200) || '(only allowed files)');

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
