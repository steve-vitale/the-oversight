#!/usr/bin/env node
// test-transplant15f.js — proof test for the H1 TRANSPLANT,
// family 15F (proof refreshes, likely inert, arm
// sim-transplant15f-a).
//
// THE QUESTION (evidence/2026-11-14/sim-transplant15f-prereg.md,
// prereg committed before the subject was cut or any judged sim
// ran): land origin family 15F onto the far end 203a32775 (GOOD
// 4/8) — seven standalone first-parent commits in origin order:
// 055c48f62 OVE-37 (refresh phone/balance proofs on master tip),
// 97a67d4f8 OVE-47 (refresh phone-frame proof on master tip),
// 49341fd78 OVE-53 (refresh phone-frame proof after favor
// thresholds), 6e53adc62 OVE-56 (refresh phone-frame proof after
// bond dawn), a1567198c OVE-55 (Phase 4 social rates screen on tip
// 748cce3b8), be39a0a4e OVE-57 (refresh proofs on tip 134a3d0ab
// after rebase), 74a16306c OVE-61 (refresh person-trust non-aimed
// errand mix baseline). Grouping prereg:
// hidden_files/family15-grouping-prereg-2026-11-14.md §15F. Binding
// prereg: sim-scale-onramp-round-2115.md §3.
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
//
// THE PREDICTED OUTCOME (from the merge-tree pre-check): picks 1-4
// and 6 conflict ONLY on the two proof JSONs (resolve --ours,
// continue); pick 5 applies cleanly; pick 7 conflicts on
// evidence/2026-11-08/person-trust-prereg.md AND
// scripts/test-person-trust-20261108.js — NON-TOOLING, both
// modify/delete against the person-trust writer feature the far
// end never had — so the arm is expected to STOP at pick 7
// (UNMEASURED-BY-CONFLICT) with NO judged sim.
//
// STAGE 1 (this file as committed with the prereg) proves:
//   1. Family 15F identity — all seven picks (hashes, subjects,
//      first parents, exact numstats, js=0, no standing.js, no
//      policy file, no green-list.txt), in first-parent origin
//      order.
//   2. Merge-tree pre-check — picks 1-4 and 6 rc=1 with
//      tooling-only conflict sets (resolve --ours, continue);
//      pick 5 rc=0 clean; pick 7 rc=1 with EXACTLY the two
//      non-tooling files (STOP expected); each predicted-resolved
//      tree and prediction commit; every resolved tree keeps all
//      three tooling files byte-identical to the far end; the
//      pick-6 .gz deletion is clean (both sides deleted).
//   3. Pick-7 mechanism — both files exist at pick 7's base and
//      are absent from ours and the far end; they were added by
//      side-branch commit 458811411 (person-trust writers, NOT
//      first-parent); the merged tree reports both as
//      CONFLICT (modify/delete), stages 1+3 only.
//   4. Family content — no src/js in any pick; the proof-JSON
//      diffs move only panel pointers/digests; the probe script
//      is measure-only; the pick-7 test re-baselines seed 84101
//      (OVE-61); no lever identifiers in the tooling-JSON or
//      test diffs.
//   5. Verdict mapping + tooling-resolution rule —
//      classifyTransplant maps every survived count; resolveTooling
//      maps a tooling-only set to CONTINUE and any non-tooling
//      file to UNMEASURED.
//   6. Prereg recorded in the evidence file (base, picks, seeds,
//      horizon, policy, STEP id, thresholds, STOP clause, tooling-
//      resolution rule, subject branch name, merge-tree predictions,
//      pick-7 mechanism, ordering note, seed-band freshness note).
//   7. Base state — HEAD is on sim-transplant15f-a, no src/js file
//      differs from HEAD, on-disk standing.js is byte-identical
//      to HEAD, the step-script tooling source (master) still
//      carries all four scratch files; the step script names the
//      band 190391-190398; no subject branch exists yet; no STEP
//      t15f-proofs summary/driver log/corpus exists; no
//      cherry-pick is in progress.
// STAGE 2 (appended after the live picks) proves the live sequence:
//   8. Live picks 1-6 resolved the tooling conflicts with
//      checkout --ours and each live tree equals its predicted
//      resolved tree; each resolved tooling file is byte-identical
//      to the far end; the subject's diff vs the far end equals
//      picks 1-6 minus tooling.
//   9. Live pick 7 outcome (conflict list, STOP since non-tooling
//      files conflicted) and the evidence file records the verdict
//      (UNMEASURED-BY-CONFLICT), the coordinator decision owed,
//      and that no judged sim ran.
//
// NOTE on scoped git reads: this proof avoids whole-tree `git diff`
// (a full-tree scan took ~16 min on this loaded box; the run-start
// full check already established WORKTREE CLEAN). Dirt checks use
// pathspecs (scripts, evidence/2026-11-14, src/js) covering every
// path this arm writes; all other git calls are object-database
// reads (rev-parse, log, show, diff <commit> <commit>, merge-tree)
// and stay fast.
//
// Usage: node scripts/test-transplant15f.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant15f');

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
  { sha: '74a16306c2879e58d4c6e0037657d63876e92088', first: 'be39a0a4e0e7eeb93dda2dccdc4189a399ceb9bc', subject: 'OVE-61: refresh person-trust non-aimed errand mix baseline',
    numstat: ['42\t0\tevidence/2026-11-08/person-trust-prereg.md', '8\t7\tscripts/test-person-trust-20261108.js'] },
];
const MERGEBASE = 'd229b58f595430e2a24c399820061b39c5b689ca';
const PERSON_TRUST_SIDE = '4588114119f62e93788fb463385f8556457b2f72';
const SUBJECT_BRANCH = 'transplant-15f-subject';
const STEP = 't15f-proofs';
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
  { tree: '13f1049ef9b229ca9d70a6486f38f093d45004d6', conflicted: ['evidence/2026-11-08/person-trust-prereg.md', 'scripts/test-person-trust-20261108.js'], resolved: null, pred: null, rc: 1 },
];
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
function sortedNumstat(a, b) {
  return git('diff --numstat ' + a + ' ' + b).split('\n').filter(Boolean).sort().join('\n');
}

(async () => {
  // ---- 1. Family 15F identity ----
  T.section('1. Family 15F identity — seven standalone first-parent commits, origin order');
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
  T.ok('all seven picks are on the first-parent chain d229b58f5..a628aeaf3', idxs.every(function (i) { return i !== -1; }), 'idx=' + idxs.join('/'));
  T.ok('pick order is origin order (055c48f62 before 97a67d4f8 before 49341fd78 before 6e53adc62 before a1567198c before be39a0a4e before 74a16306c)',
    idxs.every(function (v, i, a) { return i === 0 || a[i - 1] < v; }), idxs.join(' < '));
  const farStanding = sha256(gitShow(FAR, 'src/js/standing.js'));
  T.ok('far-end native standing.js sha is 75762cb2...', farStanding.startsWith('75762cb2'), farStanding.slice(0, 12));
  T.ok('fix standing.js sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  const farPolicy = sha256(gitShow(FAR, 'scripts/policies/competent.js'));
  T.ok('far-end policy sha is a7ff5c51...', farPolicy.startsWith('a7ff5c51'), farPolicy.slice(0, 12));

  // ---- 2. Merge-tree pre-check ----
  T.section('2. Merge-tree pre-check — picks 1-4 and 6 tooling-only, pick 5 clean, pick 7 non-tooling STOP');
  let ours = FAR_FULL;
  for (let i = 0; i < PICKS.length; i++) {
    const p = PICKS[i];
    const m = MT[i];
    const mt = mergeTree(p.first, ours, p.sha);
    T.ok('pick ' + (i + 1) + ' merge-tree rc=' + m.rc, mt.rc === m.rc, 'rc=' + mt.rc);
    T.ok('pick ' + (i + 1) + ' merge-tree tree is ' + m.tree.slice(0, 12) + '…', mt.tree === m.tree, mt.tree.slice(0, 12));
    T.ok('pick ' + (i + 1) + ' merge-tree conflicts EXACTLY [' + m.conflicted.join(', ') + ']',
      JSON.stringify(mt.conflicted) === JSON.stringify(m.conflicted.slice().sort()), mt.conflicted.join(', ') || '(none)');
    if (i < 6) {
      T.ok('tooling-resolution rule maps the pick-' + (i + 1) + ' conflict set to ' + (m.conflicted.length === 0 ? 'NO-CONFLICT' : 'CONTINUE-OURS'),
        resolveTooling(mt.conflicted) === (m.conflicted.length === 0 ? 'NO-CONFLICT' : 'CONTINUE-OURS'), resolveTooling(mt.conflicted));
    } else {
      T.ok('tooling-resolution rule maps the pick-7 conflict set to UNMEASURED (STOP expected)',
        resolveTooling(mt.conflicted) === 'UNMEASURED', resolveTooling(mt.conflicted));
    }
    if (m.resolved) {
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
    } else {
      T.ok('pick 7 has NO resolved tree and NO prediction commit (STOP, nothing to build on)',
        m.resolved === null && m.pred === null, 'resolved=null pred=null');
    }
  }
  const cumul6 = sortedNumstat(FAR, MT[5].pred);
  T.ok('cumulative resolved diff (far end -> pick-6-resolved) is exactly picks 1-6 minus tooling (20 files)',
    cumul6 === CUMUL6.slice().sort().join('\n'), cumul6.replace(/\n/g, ' | ').slice(0, 300));
  // Pick-6 .gz deletion is clean (both sides deleted): the file is
  // present at pick 6's base, absent from the pick-6-resolved tree.
  T.ok('neutral-ove57-tip-6e53adc62.json.gz IS present at pick-6 base 4a1c77cf1',
    git('ls-tree ' + PICKS[5].first + ' -- evidence/2026-11-08/neutral-ove57-tip-6e53adc62.json.gz') !== '', 'base has it');
  T.ok('neutral-ove57-tip-6e53adc62.json.gz is ABSENT from the pick-6-resolved tree (both-sides-deleted, clean)',
    git('ls-tree ' + MT[5].pred + ' -- evidence/2026-11-08/neutral-ove57-tip-6e53adc62.json.gz') === '', '(absent)');
  T.ok('neutral-ove57-tip-134a3d0ab.json.gz IS present in the pick-6-resolved tree (the replacement panel)',
    git('ls-tree ' + MT[5].pred + ' -- evidence/2026-11-08/neutral-ove57-tip-134a3d0ab.json.gz') !== '', 'replacement present');

  // ---- 3. Pick-7 mechanism ----
  T.section('3. Pick-7 mechanism — refresh on top of a person-trust feature the far end lacks');
  T.ok('458811411 (person-trust writers) is NOT on the first-parent chain (side-branch commit)',
    fpOrder.indexOf(PERSON_TRUST_SIDE) === -1, 'not first-parent');
  T.ok('458811411 subject is "Write per-villager trust map from lived events"',
    git('log -1 --format=%s ' + PERSON_TRUST_SIDE) === 'Write per-villager trust map from lived events', git('log -1 --format=%s ' + PERSON_TRUST_SIDE).slice(0, 60));
  T.ok('458811411 adds src/js/person-trust.js (+233)',
    git('diff --numstat ' + PERSON_TRUST_SIDE + '^1 ' + PERSON_TRUST_SIDE + ' -- src/js/person-trust.js') === '233\t0\tsrc/js/person-trust.js', 'person-trust.js +233');
  T.ok('458811411 adds person-trust-prereg.md (+48) and test-person-trust-20261108.js (+162)',
    git('diff --numstat ' + PERSON_TRUST_SIDE + '^1 ' + PERSON_TRUST_SIDE + ' -- evidence/2026-11-08/person-trust-prereg.md') === '48\t0\tevidence/2026-11-08/person-trust-prereg.md' &&
    git('diff --numstat ' + PERSON_TRUST_SIDE + '^1 ' + PERSON_TRUST_SIDE + ' -- scripts/test-person-trust-20261108.js') === '162\t0\tscripts/test-person-trust-20261108.js', 'prereg +48, test +162');
  T.ok('person-trust-prereg.md EXISTS at pick-7 base be39a0a4e',
    git('ls-tree ' + PICKS[6].first + ' -- evidence/2026-11-08/person-trust-prereg.md') !== '', 'base has prereg.md');
  T.ok('test-person-trust-20261108.js EXISTS at pick-7 base be39a0a4e',
    git('ls-tree ' + PICKS[6].first + ' -- scripts/test-person-trust-20261108.js') !== '', 'base has test');
  T.ok('person-trust-prereg.md is ABSENT from the pick-6-resolved tree (ours)',
    git('ls-tree ' + MT[5].pred + ' -- evidence/2026-11-08/person-trust-prereg.md') === '', '(absent from ours)');
  T.ok('test-person-trust-20261108.js is ABSENT from the pick-6-resolved tree (ours)',
    git('ls-tree ' + MT[5].pred + ' -- scripts/test-person-trust-20261108.js') === '', '(absent from ours)');
  T.ok('person-trust-prereg.md is ABSENT from the far end',
    (function () { try { execSync('git cat-file -e ' + FAR + ':evidence/2026-11-08/person-trust-prereg.md', { cwd: REPO, stdio: 'pipe' }); return false; } catch (e) { return true; } })(), '(absent at far end)');
  T.ok('test-person-trust-20261108.js is ABSENT from the far end',
    (function () { try { execSync('git cat-file -e ' + FAR + ':scripts/test-person-trust-20261108.js', { cwd: REPO, stdio: 'pipe' }); return false; } catch (e) { return true; } })(), '(absent at far end)');
  const mt7 = mergeTree(PICKS[6].first, MT[5].pred, PICKS[6].sha);
  T.ok('pick-7 merged tree reports CONFLICT (modify/delete) for person-trust-prereg.md (deleted in ours, modified in theirs)',
    mt7.raw.indexOf('CONFLICT (modify/delete): evidence/2026-11-08/person-trust-prereg.md deleted in 0dd7267b') !== -1, 'modify/delete prereg.md');
  T.ok('pick-7 merged tree reports CONFLICT (modify/delete) for test-person-trust-20261108.js (deleted in ours, modified in theirs)',
    mt7.raw.indexOf('CONFLICT (modify/delete): scripts/test-person-trust-20261108.js deleted in 0dd7267b') !== -1, 'modify/delete test');
  T.ok('pick-7 merged tree leaves the THEIRS version of person-trust-prereg.md in the tree (OVE-61 section present)',
    gitShow(MT[6].tree, 'evidence/2026-11-08/person-trust-prereg.md').indexOf('Baseline refresh 2026-11-08 (OVE-61)') !== -1, 'theirs prereg.md in tree');
  T.ok('pick-7 merged tree leaves the THEIRS version of the test in the tree (OVE-61 comment present)',
    gitShow(MT[6].tree, 'scripts/test-person-trust-20261108.js').indexOf('(OVE-61)') !== -1, 'theirs test in tree');

  // ---- 4. Family content ----
  T.section('4. Family content — proof refreshes only, no lever numbers changed');
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
  const test7 = gitShow(PICKS[6].sha, 'scripts/test-person-trust-20261108.js');
  T.ok('pick 7 test re-baselines seed 84101 (BASELINE seed: 84101, OVE-61 comment)',
    test7.indexOf('seed: 84101') !== -1 && test7.indexOf('(OVE-61)') !== -1 && test7.indexOf('const BASELINE') !== -1, 'seed 84101 baseline');
  const test7diff = execSync('git diff ' + PICKS[6].sha + '^1 ' + PICKS[6].sha + ' -- scripts/test-person-trust-20261108.js', { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  T.ok('pick 7 test diff changes no lever identifiers (tolerance rebaseline, not a retune)',
    ['damage', 'armor', 'spawnMonster', 'foodYield', 'spoilage', 'wave5', 'deedGate'].every(function (w) { return test7diff.indexOf(w) === -1; }), 'no lever identifiers');
  const prereg7 = gitShow(PICKS[6].sha, 'evidence/2026-11-08/person-trust-prereg.md');
  T.ok('pick 7 prereg names the d229b58f5 tip baseline and the OVE-61 refresh section',
    prereg7.indexOf('Tip baseline: `d229b58f5`') !== -1 && prereg7.indexOf('Baseline refresh 2026-11-08 (OVE-61)') !== -1, 'baseline + refresh section');
  for (let i = 0; i < PICKS.length; i++) {
    const diffJs = execSync('git diff ' + PICKS[i].sha + '^1 ' + PICKS[i].sha + ' -- src/js', { cwd: REPO, stdio: 'pipe' }).toString('utf8');
    T.ok('pick ' + (i + 1) + ' src/js diff is empty (no game code at all)', diffJs === '', '(empty)');
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

  // ---- 6. Prereg recorded in the evidence file ----
  T.section('6. Prereg recorded in the evidence file');
  const evPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15f-prereg.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('prereg file exists', ev.length > 0, evPath);
  for (const p of PICKS) {
    T.ok('prereg names pick ' + p.sha.slice(0, 9) + ' (' + p.subject.slice(0, 20) + '…)', ev.indexOf(p.sha.slice(0, 9)) !== -1, 'pick present');
  }
  T.ok('prereg names the far end 203a32775', ev.indexOf('203a32775') !== -1, 'far end present');
  T.ok('prereg names the band 190391-190398', ev.indexOf('190391') !== -1 && ev.indexOf('190398') !== -1, 'band present');
  T.ok('prereg names the STEP id t15f-proofs', ev.indexOf('t15f-proofs') !== -1, 'STEP present');
  T.ok('prereg records the STOP clause', ev.indexOf('STOP clause') !== -1, 'STOP clause present');
  T.ok('prereg records the coordinator tooling-resolution rule (decided 2026-11-14 ~10:00Z)',
    ev.indexOf('TOOLING-RESOLUTION RULE') !== -1 && ev.indexOf('checkout --ours') !== -1, 'tooling rule present');
  T.ok('prereg records the thresholds (CARRIER <=1/8, AMBIGUOUS 2/8, NOT-CARRIER >=3/8)',
    ev.indexOf('CARRIER') !== -1 && ev.indexOf('AMBIGUOUS') !== -1 && ev.indexOf('NOT-CARRIER') !== -1, 'thresholds present');
  T.ok('prereg records the subject branch name transplant-15f-subject', ev.indexOf('transplant-15f-subject') !== -1, 'subject branch present');
  for (const m of MT) {
    T.ok('prereg records merge-tree ' + m.tree.slice(0, 8) + '…', ev.indexOf(m.tree.slice(0, 8)) !== -1, 'merge-tree present');
  }
  for (const m of MT) {
    if (m.resolved) T.ok('prereg records resolved tree ' + m.resolved.slice(0, 8) + '…', ev.indexOf(m.resolved.slice(0, 8)) !== -1, 'resolved tree present');
    if (m.pred) T.ok('prereg records prediction commit ' + m.pred.slice(0, 8), ev.indexOf(m.pred.slice(0, 8)) !== -1, 'pred commit present');
  }
  T.ok('prereg records the pick-7 mechanism (458811411, modify/delete, person-trust)',
    ev.indexOf('458811411') !== -1 && ev.indexOf('modify/delete') !== -1 && ev.indexOf('person-trust') !== -1, 'pick-7 mechanism present');
  T.ok('prereg records the 15F WARNING (tooling files regenerated per tip)',
    ev.indexOf('15F WARNING') !== -1, 'warning present');
  T.ok('prereg records the seed-band freshness note (64 files, matched band)',
    ev.indexOf('Seed-band freshness note') !== -1 && ev.indexOf('64 files') !== -1, 'seed-band note present');
  T.ok('prereg records the grouping authority (§15F)', ev.indexOf('family15-grouping-prereg-2026-11-14.md') !== -1, 'authority present');
  T.ok('prereg records the canon note (no canon doc covers proof refreshes)',
    ev.indexOf('No canon doc covers proof-refresh') !== -1, 'canon note present');
  T.ok('prereg records the horizon 150d death-aware', ev.indexOf('150d') !== -1, 'horizon present');
  T.ok('prereg records the competent verbatim own-policy', ev.indexOf('competent') !== -1, 'policy present');
  T.ok('prereg records the ordering note (pre-check ran during prereg preparation, subject not yet cut)',
    ev.indexOf('Ordering note') !== -1, 'ordering note present');

  // ---- 7. Base state ----
  T.section('7. Base state — arm branch clean, subject cut (picks 1-6), sim not run');
  const headBranch = git('rev-parse --abbrev-ref HEAD');
  // worktreeOnly: branch-identity legs are meaningful only in the
  // worker tree. On merged master HEAD is 'master' by design (the
  // arm branch is deleted after landing) — the leg passes there
  // vacuously instead of failing, so the proof stays green on master
  // (0215Z lesson). Prereg-commit ancestry legs resolve by
  // message/subject, not hash (0608Z lesson: an adoption rebase
  // rewrites hashes).
  const worktreeOnly = function (cond) { return cond || headBranch === 'master'; };
  T.ok('HEAD is on the arm branch sim-transplant15f-a (worktree-only)', worktreeOnly(headBranch === 'sim-transplant15f-a'), 'HEAD=' + headBranch);
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
  // Stage 2: the subject branch now exists (cut after the prereg
  // commit); its tip is the pick-6 commit 4eca36017 (OVE-57).
  let subjectExists = true;
  try { git('rev-parse ' + SUBJECT_BRANCH); } catch (e) { subjectExists = false; }
  T.ok('subject branch exists (cut after the prereg commit; stage 2)', subjectExists === true, SUBJECT_BRANCH + ' present');
  T.ok('subject tip is the pick-6 commit 4eca36017 (OVE-57)',
    git('rev-parse ' + SUBJECT_BRANCH).startsWith('4eca36017') && git('log -1 --format=%s ' + SUBJECT_BRANCH) === 'OVE-57: refresh proofs on tip 134a3d0ab after rebase', git('log -1 --format=%h\\ %s ' + SUBJECT_BRANCH).slice(0, 80));
  const t15fSummary = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  T.ok('no step summary exists for t15f-proofs (no judged sim ran)', fs.existsSync(t15fSummary) === false, STEP);
  const t15fDriver = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  T.ok('no step driver log exists for t15f-proofs (no judged sim ran)', fs.existsSync(t15fDriver) === false, STEP);
  const corpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  T.ok('no step corpus exists for t15f-proofs (no judged sim ran)', fs.existsSync(corpusDir) === false, STEP);
  let cherryPickHead = true;
  try { execSync('git rev-parse --verify CHERRY_PICK_HEAD', { cwd: REPO, stdio: 'pipe' }); } catch (e) { cherryPickHead = false; }
  T.ok('no cherry-pick is in progress', cherryPickHead === false, 'CHERRY_PICK_HEAD absent');
  const dirtyTracked = git('diff --name-only HEAD -- scripts evidence/2026-11-14 src/js');
  const allowed = ['scripts/test-transplant15f.js', 'evidence/2026-11-14/sim-transplant15f-prereg.md', 'evidence/2026-11-14/sim-transplant15f.md'];
  const dirtyOther = dirtyTracked.split('\n').filter(function (ln) {
    return ln && !allowed.some(function (a) { return ln === a; });
  }).join('\n');
  T.ok('tracked tree is clean apart from this proof + the prereg + the evidence file (uncommitted until this proof passes)', dirtyOther === '', dirtyOther.slice(0, 200) || '(only allowed files)');

  // ---- 8. Live picks 1-6 — tooling conflicts resolved, trees equal predictions ----
  T.section('8. Live picks 1-6 — tooling conflicts resolved --ours, trees equal predictions');
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
  T.ok('subject has exactly 6 commits on top of the far end (picks 1-6 only)',
    git('rev-list --count ' + FAR + '..' + SUBJECT_BRANCH) === '6', 'count=6');
  T.ok('no pick-7 commit exists on the subject (OVE-61 never landed)',
    git('log --format=%s ' + FAR + '..' + SUBJECT_BRANCH).indexOf('OVE-61') === -1, 'no OVE-61 commit');
  const subjNumstat = sortedNumstat(FAR, SUBJECT_BRANCH);
  T.ok('subject diff vs far end is exactly picks 1-6 minus tooling (20 files)',
    subjNumstat === CUMUL6.slice().sort().join('\n'), subjNumstat.replace(/\n/g, ' | ').slice(0, 300));
  for (const f of TOOLING_FILES) {
    T.ok('subject tip keeps ' + f + ' byte-identical to the far end (checkout --ours kept it)',
      sha256(gitShow(SUBJECT_BRANCH, f)) === sha256(gitShow(FAR, f)), f + ' == far end');
  }
  T.ok('neutral-ove57-tip-6e53adc62.json.gz is ABSENT from the subject tip (both-sides-deleted, clean)',
    git('ls-tree ' + SUBJECT_BRANCH + ' -- evidence/2026-11-08/neutral-ove57-tip-6e53adc62.json.gz') === '', '(absent)');
  T.ok('neutral-ove57-tip-134a3d0ab.json.gz IS present at the subject tip (the replacement panel)',
    git('ls-tree ' + SUBJECT_BRANCH + ' -- evidence/2026-11-08/neutral-ove57-tip-134a3d0ab.json.gz') !== '', 'replacement present');

  // ---- 9. STOP outcome — pick-7 conflict reported, nothing resolved, nothing measured ----
  T.section('9. STOP outcome — pick-7 conflict reported, nothing hand-resolved, nothing measured');
  const ev15fPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15f.md');
  const ev15f = fs.existsSync(ev15fPath) ? fs.readFileSync(ev15fPath, 'utf8') : '';
  T.ok('evidence file exists', ev15f.length > 0, ev15fPath);
  T.ok('evidence file records the outcome as UNMEASURED-BY-CONFLICT', ev15f.indexOf('UNMEASURED-BY-CONFLICT') !== -1, 'outcome present');
  T.ok('evidence file records the exact conflict list (DU person-trust-prereg.md, DU test-person-trust-20261108.js)',
    ev15f.indexOf('DU evidence/2026-11-08/person-trust-prereg.md') !== -1 && ev15f.indexOf('DU scripts/test-person-trust-20261108.js') !== -1, 'conflict list present');
  T.ok('evidence file records the modify/delete wording (deleted in HEAD and modified in 74a16306c)',
    ev15f.indexOf('CONFLICT (modify/delete)') !== -1 && ev15f.indexOf('deleted in HEAD and modified in 74a16306c') !== -1, 'modify/delete present');
  T.ok('evidence file records stages 1 + 3 only, no stage 2 (base blobs cadcb6e4…/1e5037c2…, theirs 06c4d95a…/d9cfe464…)',
    ev15f.indexOf('stages 1 + 3 only') !== -1 && ev15f.indexOf('cadcb6e4') !== -1 && ev15f.indexOf('06c4d95a') !== -1, 'stages present');
  T.ok('evidence file records the subject tip 4eca36017 and the predicted tree 7bee7b39…',
    ev15f.indexOf('4eca36017') !== -1 && ev15f.indexOf('7bee7b39') !== -1, 'subject tip present');
  T.ok('evidence file records the live pick-1 tree 67eb5c37… and pick-2 tree 875ce641…',
    ev15f.indexOf('67eb5c37') !== -1 && ev15f.indexOf('875ce641') !== -1, 'live trees present');
  T.ok('evidence file records the resolutions (checkout --ours, picks 1-4 and 6, far-end version kept byte-identical)',
    ev15f.indexOf('checkout --ours') !== -1 && ev15f.indexOf('Resolutions recorded') !== -1, 'resolutions present');
  T.ok('evidence file records that no judged sim ran', ev15f.indexOf('No judged sim ran') !== -1, 'no-sim note present');
  T.ok('evidence file records the pick-7 mechanism (458811411, person-trust, side-branch)',
    ev15f.indexOf('458811411') !== -1 && ev15f.indexOf('person-trust') !== -1, 'mechanism present');
  T.ok('evidence file records the coordinator decision owed (picks 1-6 alone / person-trust first / record unmeasurable)',
    ev15f.indexOf('Coordinator decision owed') !== -1, 'coordinator note present');
  T.ok('evidence file records the infrastructure (flap ALL-OK, index clobber, telemetry NOT RUN)',
    ev15f.indexOf('HOST WRITE FLAP') !== -1 && ev15f.indexOf('INDEX CLOBBER') !== -1 &&
    ev15f.indexOf('Telemetry deviation check: NOT RUN') !== -1, 'infrastructure present');
  // Prereg-commit ancestry by MESSAGE, not hash (0608Z lesson: an
  // adoption rebase rewrites hashes).
  const logSubjects = git('log --format=%s HEAD');
  T.ok('prereg commit is an ancestor of HEAD (resolved by message, not hash)',
    logSubjects.indexOf('sim-transplant15f-a: prereg + stage-1 proof (236 legs; picks 1-4/6 tooling-only, pick 5 clean, pick 7 non-tooling STOP predicted)') !== -1, 'prereg message present');
  const headBranch2 = git('rev-parse --abbrev-ref HEAD');
  T.ok('HEAD is back on the arm branch sim-transplant15f-a after the live picks (worktree-only)', worktreeOnly(headBranch2 === 'sim-transplant15f-a'), 'HEAD=' + headBranch2);
  let cherryPickHead2 = true;
  try { execSync('git rev-parse --verify CHERRY_PICK_HEAD', { cwd: REPO, stdio: 'pipe' }); } catch (e) { cherryPickHead2 = false; }
  T.ok('no cherry-pick is in progress (pick 7 was aborted)', cherryPickHead2 === false, 'CHERRY_PICK_HEAD absent');
  T.ok('no verdict (CARRIER/AMBIGUOUS/NOT-CARRIER) is claimed anywhere in the evidence file',
    ev15f.indexOf('VERDICT: CARRIER') === -1 && ev15f.indexOf('VERDICT: AMBIGUOUS') === -1 && ev15f.indexOf('VERDICT: NOT-CARRIER') === -1, 'no verdict claimed');
  T.ok('evidence file records Verdict: NONE', ev15f.indexOf('Verdict: NONE') !== -1, 'verdict NONE present');

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
