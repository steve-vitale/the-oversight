#!/usr/bin/env node
// test-transplant15d.js — proof test for the H1 TRANSPLANT, family
// 15D (believed needs / pantry, arm sim-transplant15d-a).
//
// THE QUESTION (evidence/2026-11-14/sim-transplant15d-prereg.md,
// prereg committed before the subject was cut or any judged sim
// ran): land origin family 15D onto the far end 203a32775 (GOOD
// 4/8) — two standalone first-parent commits in origin order:
// 03436c1bc (Believed pantry/cistern for food-security and favors),
// 206fe4931 (OVE-60: duty candidates from believed needs join dawn
// scorer). Grouping prereg:
// hidden_files/family15-grouping-prereg-2026-11-14.md §15D. Binding
// prereg: sim-scale-onramp-round-2115.md §3.
//
// THE OUTCOME: the STOP clause fired at pick 1. The merge-tree
// pre-check predicted conflicts in THREE files — docs/ONTOLOGY.md,
// scripts/green-list.txt, src/js/villager-objectives.js — and the
// live cherry-pick on a throwaway scaffold branch reproduced them
// exactly (UU on all three, markers at ONTOLOGY.md 2021/2031,
// green-list.txt 916, villager-objectives.js 9/25/843). Per the
// coordinator TOOLING-RESOLUTION RULE (decided 2026-11-14 ~10:00Z
// after the 15A/15C STOPs) a conflict confined ENTIRELY to the
// three zero-src-reader tooling files (green-list.txt,
// balance-proof.json, phone-frame-proof.json) would be resolved
// with `git checkout --ours` — but this pick's conflict set also
// holds a docs file and a game-code file, so the rule's STOP
// branch fires: no file was resolved, nothing was hand-edited, no
// subject branch was cut, no judged sim ran, no verdict
// (CARRIER/AMBIGUOUS/NOT-CARRIER) exists for this group. Outcome:
// UNMEASURED-BY-CONFLICT. The coordinator decides the narrowed
// route; this arm decides none of it.
//
// WHAT THIS TEST PROVES:
//   1. Family 15D identity — both picks (hashes, subjects, first
//      parents, exact numstats, no standing.js, no policy file),
//      in first-parent origin order; pick 2's evidence payload
//      recorded; substrate shas (far-end standing, fix, policy).
//   2. Merge-tree pre-check — pick 1 rc=1, conflicted tree
//      f3838750…, conflicted files EXACTLY [docs/ONTOLOGY.md,
//      scripts/green-list.txt, src/js/villager-objectives.js].
//   3. Tooling-resolution rule — the pick-1 conflict set is NOT
//      tooling-only, so the rule returns STOP; unit legs cover
//      the tooling-only, docs, game-code, sw.js, and empty cases.
//   4. Conflict mechanism — green-list tail context lines the far
//      end lacks; believed-pantry markers absent at the far end
//      and present at the pick; ONTOLOGY rule lines.
//   5. Family content — believed-pantry / duty-candidate markers
//      present; no damage/armor/spawn/food-yield/spoilage/wave/
//      table-gate identifier added in either pick's src/js diff
//      (pantryKcal is read as a belief threshold, not a yield
//      change).
//   6. Verdict mapping — classifyTransplant maps every survived
//      count; conflictStop maps any conflicted file to
//      'UNMEASURED' and an empty set to 'NO-CONFLICT';
//      resolveToolingOnly maps the tooling set to 'RESOLVE-OURS'.
//   7. Prereg recorded in the evidence file (base, picks, seeds,
//      horizon, policy, STEP id, thresholds, STOP clause,
//      tooling-resolution rule, subject branch name, merge-tree
//      prediction, live-confirmation note, ordering note).
//   8. Base state — HEAD is on sim-transplant15d-a, no src/js file
//      differs from HEAD, on-disk standing.js is byte-identical
//      to HEAD, the step-script tooling source (master) still
//      carries all four scratch files; the step script names the
//      band 190391-190398.
//   9. STOP outcome — no subject branch exists, no STEP t15d-needs
//      summary/driver log/corpus exists, no cherry-pick is in
//      progress, the scaffold branch is deleted, the evidence file
//      records UNMEASURED-BY-CONFLICT with the exact conflict
//      list, and the prereg commit is an ancestor of HEAD
//      (resolved by message, not hash).
//
// Usage: node scripts/test-transplant15d.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant15d');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const PICK1 = '03436c1bcacbbf0c3d0b868503cf32da162d573b';
const FIRST1 = 'f843fab1cb6b81bf5574263db2f95e7439e67ef8';
const PICK2 = '206fe4931e2e46c86fe22dc2071046ed0ba683ca';
const FIRST2 = '74a16306c2879e58d4c6e0037657d63876e92088';
const MERGEBASE = 'd229b58f595430e2a24c399820061b39c5b689ca';
const SUBJECT_BRANCH = 'transplant-15d-subject';
const SCAFFOLD_BRANCH = 'tmp-15d-predict';
const STEP = 't15d-needs';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
// Merge-tree prediction for pick 1 (rc=1, three conflicted files).
const MT1_TREE = 'f3838750621be4dd12e3e40f2f139ecc79dc76f8';
// Zero-src-reader tooling files the coordinator rule may resolve
// with `git checkout --ours` — and ONLY these.
const TOOLING_FILES = ['scripts/balance-proof.json', 'scripts/green-list.txt', 'scripts/phone-frame-proof.json'];

function sha256(text) { return crypto.createHash('sha256').update(text).digest('hex'); }
function git(args) {
  return execSync('git ' + args, { cwd: REPO, stdio: 'pipe' }).toString().trim();
}
function gitShow(commit, file) {
  return execSync('git show ' + commit + ':' + file, { cwd: REPO, stdio: 'pipe' }).toString();
}
function grepCount(commit, pattern, file) {
  try {
    const out = git('grep -c ' + pattern + ' ' + commit + ' -- ' + file);
    return parseInt(out.split(':').pop(), 10);
  } catch (e) { return 0; }
}
function classifyTransplant(n) {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 8) return 'UNCLASSIFIABLE';
  if (n <= 1) return 'CARRIER';
  if (n === 2) return 'AMBIGUOUS';
  return 'NOT-CARRIER';
}
// conflictStop(files): the binding conflict rule — ANY conflicted
// file STOPs the arm (no hand-resolution of game code, no narrowed
// re-run by the arm). Only an empty set proceeds.
function conflictStop(files) {
  if (!Array.isArray(files)) return 'UNCLASSIFIABLE';
  if (files.length === 0) return 'NO-CONFLICT';
  return 'UNMEASURED';
}
// resolveToolingOnly(files): the coordinator TOOLING-RESOLUTION
// RULE (decided 2026-11-14 ~10:00Z, after the 15A/15C STOPs). A
// conflict confined ENTIRELY to the three zero-src-reader tooling
// files resolves per file with `git checkout --ours` and the pick
// continues; ANY other conflicted file (src/js, data, policy,
// docs, test, sw.js, anything else) fires the STOP.
function resolveToolingOnly(files) {
  if (!Array.isArray(files)) return 'UNCLASSIFIABLE';
  if (files.length === 0) return 'NO-CONFLICT';
  if (files.every(function (f) { return TOOLING_FILES.indexOf(f) !== -1; })) return 'RESOLVE-OURS';
  return 'STOP';
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
// addedLines(commit, pathspec): added (+) lines of the pick's diff
// (context and removed lines excluded), so a lever word that only
// appears in untouched context cannot trip the check.
function addedLines(commit, pathspec) {
  const diff = execSync('git diff ' + commit + '^1 ' + commit + ' -- ' + pathspec,
    { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  return diff.split('\n').filter(function (ln) { return ln.indexOf('+') === 0 && ln.indexOf('+++') !== 0; }).join('\n');
}

(async () => {
  // ---- 1. Family 15D identity ----
  T.section('1. Family 15D identity — two standalone first-parent commits, origin order');
  const picks = [
    { sha: PICK1, first: FIRST1, subject: 'Believed pantry/cistern for food-security and favors',
      js: ['src/js/convo-wants.js', 'src/js/villager-goals.js', 'src/js/villager-objectives.js'],
      jsStats: { 'src/js/convo-wants.js': '25\t6\tsrc/js/convo-wants.js', 'src/js/villager-goals.js': '12\t2\tsrc/js/villager-goals.js', 'src/js/villager-objectives.js': '155\t12\tsrc/js/villager-objectives.js' },
      test: 'scripts/test-believed-pantry-perception.js', testStat: '283\t0\tscripts/test-believed-pantry-perception.js',
      onto: '2\t1\tdocs/ONTOLOGY.md', green: '1\t0\tscripts/green-list.txt' },
    { sha: PICK2, first: FIRST2, subject: 'OVE-60: duty candidates from believed needs join dawn scorer',
      js: ['src/js/villager-brain.js'],
      jsStats: { 'src/js/villager-brain.js': '127\t6\tsrc/js/villager-brain.js' },
      test: 'scripts/test-duty-dawn-candidates.js', testStat: '207\t0\tscripts/test-duty-dawn-candidates.js',
      onto: '6\t5\tdocs/ONTOLOGY.md', green: '1\t0\tscripts/green-list.txt' },
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
    for (const f of p.js) {
      const stat = git('diff --numstat ' + p.sha + '^1 ' + p.sha + ' -- ' + f);
      T.ok('pick ' + short + ' ' + f + ' is ' + p.jsStats[f].replace(/\t/g, '/'), stat === p.jsStats[f], stat);
    }
    const testStat = git('diff --numstat ' + p.sha + '^1 ' + p.sha + ' -- ' + p.test);
    T.ok('pick ' + short + ' test file is ' + p.testStat.replace(/\t/g, '/') + ' (new test)', testStat === p.testStat, testStat);
    const ontoStat = git('diff --numstat ' + p.sha + '^1 ' + p.sha + ' -- docs/ONTOLOGY.md');
    T.ok('pick ' + short + ' docs/ONTOLOGY.md is ' + p.onto.replace(/\t/g, '/'), ontoStat === p.onto, ontoStat);
    const greenStat = git('diff --numstat ' + p.sha + '^1 ' + p.sha + ' -- scripts/green-list.txt');
    T.ok('pick ' + short + ' green-list.txt is ' + p.green.replace(/\t/g, '/'), greenStat === p.green, greenStat);
    T.ok('pick ' + short + ' does not touch standing.js', git('diff --name-only ' + p.sha + '^1 ' + p.sha + ' -- src/js/standing.js') === '', '(absent)');
    const polFiles = git('diff --name-only ' + p.sha + '^1 ' + p.sha + ' -- scripts/policies');
    T.ok('pick ' + short + ' touches no policy file', polFiles === '', polFiles || '(none)');
  }
  // Pick 2's evidence payload (recorded, not judged): +5737 lines
  // across 11 files, mostly evidence JSON.
  const p2Files = git('diff --name-only ' + PICK2 + '^1 ' + PICK2).split('\n').sort();
  T.ok('pick 2 touches exactly 11 files (evidence payload included)', p2Files.length === 11, p2Files.length + ' files');
  T.ok('pick 2 carries the duty-dawn-candidates evidence note (+55/0)',
    git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- evidence/2026-11-08/duty-dawn-candidates.md') === '55\t0\tevidence/2026-11-08/duty-dawn-candidates.md', '55/0');
  T.ok('pick 2 carries the two phone-duty-frame receipts (+2684/+2649)',
    git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- evidence/2026-11-08/phone-duty-frame-736-r1.json') === '2684\t0\tevidence/2026-11-08/phone-duty-frame-736-r1.json' &&
    git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- evidence/2026-11-08/phone-duty-frame-844-r1.json') === '2649\t0\tevidence/2026-11-08/phone-duty-frame-844-r1.json', '2684/2649');
  T.ok('pick 2 touches sw.js exactly +1/-0 (one cache-busted ASSETS entry — NOT in the tooling allowlist)',
    git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- sw.js') === '1\t0\tsw.js', '1/0');
  T.ok('pick 2 touches scripts/balance-proof.json (+2/-2, tooling allowlist)',
    git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- scripts/balance-proof.json') === '2\t2\tscripts/balance-proof.json', '2/2');
  T.ok('pick 2 touches scripts/phone-frame-proof.json (+5/-5, tooling allowlist)',
    git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- scripts/phone-frame-proof.json') === '5\t5\tscripts/phone-frame-proof.json', '5/5');
  T.ok('pick 1 touches NO proof-refresh json and NO sw.js (its only tooling file is green-list.txt)',
    git('diff --name-only ' + PICK1 + '^1 ' + PICK1 + ' -- scripts/balance-proof.json scripts/phone-frame-proof.json sw.js') === '', '(absent)');
  // Origin order on the first-parent chain (oldest first).
  const fpOrder = git('log --first-parent --reverse --format=%H ' + MERGEBASE + '..a628aeaf3').split('\n');
  const idx1 = fpOrder.indexOf(PICK1);
  const idx2 = fpOrder.indexOf(PICK2);
  T.ok('both picks are on the first-parent chain d229b58f5..a628aeaf3', idx1 !== -1 && idx2 !== -1, 'idx=' + idx1 + '/' + idx2);
  T.ok('pick order is origin order (03436c1bc before 206fe4931)', idx1 < idx2, idx1 + ' < ' + idx2);
  let isAncestor = false;
  try { execSync('git merge-base --is-ancestor ' + PICK1 + ' ' + PICK2, { cwd: REPO, stdio: 'pipe' }); isAncestor = true; } catch (e) { isAncestor = false; }
  T.ok('pick 1 is an ancestor of pick 2', isAncestor, '03436c1bc ancestor of 206fe4931');
  const farStanding = sha256(gitShow(FAR, 'src/js/standing.js'));
  T.ok('far-end native standing.js sha is 75762cb2...', farStanding.startsWith('75762cb2'), farStanding.slice(0, 12));
  T.ok('fix standing.js sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  const farPolicy = sha256(gitShow(FAR, 'scripts/policies/competent.js'));
  T.ok('far-end policy sha is a7ff5c51...', farPolicy.startsWith('a7ff5c51'), farPolicy.slice(0, 12));

  // ---- 2. Merge-tree pre-check — pick 1 conflicts in three files ----
  T.section('2. Merge-tree pre-check — pick 1 CONFLICTS in docs + tooling + game code');
  // NOTE (label-spelling artifact, verified not a real difference):
  // `git merge-tree` embeds the *spelling* of the refs passed on the
  // command line in the `>>>>>>>` conflict labels, so the conflicted
  // tree OID depends on whether `theirs` is spelled short or full:
  // short '03436c1bc' -> f3838750… (the tree the prereg records, and
  // the one the live scaffold cherry-pick reproduced with `<<<<<<< HEAD`
  // / `>>>>>>> 03436c1bc` labels); full 40-char hash -> ed4e99dc….
  // Same three conflicted files, same hunks, same marker line
  // numbers either way — only the label spelling differs. The
  // primary leg below uses the short spelling to match the prereg;
  // the following leg pins the full-hash run to the same set.
  const mt1 = mergeTree(FIRST1.slice(0, 9), FAR, PICK1.slice(0, 9));
  T.ok('pick 1 merge-tree rc=1 (conflict)', mt1.rc === 1, 'rc=' + mt1.rc);
  T.ok('pick 1 merge-tree tree is f3838750…', mt1.tree === MT1_TREE, mt1.tree.slice(0, 12));
  T.ok('pick 1 merge-tree conflicts EXACTLY [docs/ONTOLOGY.md, scripts/green-list.txt, src/js/villager-objectives.js]',
    JSON.stringify(mt1.conflicted) === JSON.stringify(['docs/ONTOLOGY.md', 'scripts/green-list.txt', 'src/js/villager-objectives.js']), mt1.conflicted.join(', '));
  T.ok('pick 1 merge-tree conflicts a src/js file (game code)',
    mt1.conflicted.some(function (f) { return f.indexOf('src/js/') === 0; }), 'src/js/villager-objectives.js');
  T.ok('pick 1 merge-tree conflicts a docs file',
    mt1.conflicted.some(function (f) { return f.indexOf('docs/') === 0; }), 'docs/ONTOLOGY.md');
  T.ok('pick 1 merge-tree reports stage lines (1/2/3) for all three files',
    ['docs/ONTOLOGY.md', 'scripts/green-list.txt', 'src/js/villager-objectives.js'].every(function (f) {
      return [1, 2, 3].every(function (s) { return mt1.raw.indexOf(' ' + s + '\t' + f) !== -1; });
    }), 'stages 1/2/3 present for all three');
  T.ok('pick 1 merge-tree (full-hash spelling) gives the same three conflicted files (tree ed4e99dc…, label spelling only)',
    (function () {
      const mtFull = mergeTree(FIRST1, FAR, PICK1);
      return mtFull.rc === 1 && mtFull.tree === 'ed4e99dcb43ba9fae03332e4793766dd3c8da89f' &&
        JSON.stringify(mtFull.conflicted) === JSON.stringify(['docs/ONTOLOGY.md', 'scripts/green-list.txt', 'src/js/villager-objectives.js']);
    })(), 'full-hash run: same set, label-only tree difference');
  T.ok('conflictStop maps the pick-1 conflict set to UNMEASURED', conflictStop(mt1.conflicted) === 'UNMEASURED', conflictStop(mt1.conflicted));
  T.ok('resolveToolingOnly maps the pick-1 conflict set to STOP (not tooling-only)', resolveToolingOnly(mt1.conflicted) === 'STOP', resolveToolingOnly(mt1.conflicted));

  // ---- 3. Tooling-resolution rule ----
  T.section('3. Tooling-resolution rule — unit legs for the coordinator decision');
  T.ok('rule: no conflict -> NO-CONFLICT', resolveToolingOnly([]) === 'NO-CONFLICT', resolveToolingOnly([]));
  T.ok('rule: green-list.txt alone -> RESOLVE-OURS', resolveToolingOnly(['scripts/green-list.txt']) === 'RESOLVE-OURS', resolveToolingOnly(['scripts/green-list.txt']));
  T.ok('rule: all three tooling files -> RESOLVE-OURS',
    resolveToolingOnly(['scripts/green-list.txt', 'scripts/balance-proof.json', 'scripts/phone-frame-proof.json']) === 'RESOLVE-OURS', 'all three tooling');
  T.ok('rule: green-list.txt + one src/js file -> STOP',
    resolveToolingOnly(['scripts/green-list.txt', 'src/js/villager-objectives.js']) === 'STOP', resolveToolingOnly(['scripts/green-list.txt', 'src/js/villager-objectives.js']));
  T.ok('rule: docs/ONTOLOGY.md alone -> STOP', resolveToolingOnly(['docs/ONTOLOGY.md']) === 'STOP', resolveToolingOnly(['docs/ONTOLOGY.md']));
  T.ok('rule: sw.js alone -> STOP (sw.js is NOT in the tooling allowlist)',
    resolveToolingOnly(['sw.js']) === 'STOP', resolveToolingOnly(['sw.js']));
  T.ok('rule: a new test file alone -> STOP (test files are NOT in the tooling allowlist)',
    resolveToolingOnly(['scripts/test-believed-pantry-perception.js']) === 'STOP', resolveToolingOnly(['scripts/test-believed-pantry-perception.js']));
  T.ok('rule: the live pick-1 set (docs + tooling + game code) -> STOP',
    resolveToolingOnly(mt1.conflicted) === 'STOP', 'live set -> STOP');
  T.ok('rule allowlist is exactly the three named files',
    JSON.stringify(TOOLING_FILES.slice().sort()) === JSON.stringify(['scripts/balance-proof.json', 'scripts/green-list.txt', 'scripts/phone-frame-proof.json']), TOOLING_FILES.join(', '));

  // ---- 4. Conflict mechanism ----
  T.section('4. Conflict mechanism — tail context the far end lacks; belief API the far end lacks');
  const ctxLines = ['test-person-trust-20261108.js', 'test-raid-danger-heard.js', 'test-win-rallyguard.js', 'test-retarget-gossip.js'];
  for (const f of ctxLines) {
    T.ok('pick-1 first parent lists ' + f + ' in green-list.txt (1 hit)', grepCount(FIRST1, f, 'scripts/green-list.txt') === 1, 'parent=1');
    T.ok('far end lists ' + f + ' NOWHERE in green-list.txt (0 hits)', grepCount(FAR, f, 'scripts/green-list.txt') === 0, 'far=0');
  }
  T.ok('pick-1 first parent does NOT list test-believed-pantry-perception.js (the pick adds it)',
    grepCount(FIRST1, 'test-believed-pantry-perception.js', 'scripts/green-list.txt') === 0, 'parent=0');
  T.ok('far end does NOT list test-believed-pantry-perception.js either',
    grepCount(FAR, 'test-believed-pantry-perception.js', 'scripts/green-list.txt') === 0, 'far=0');
  T.ok('far end lists test-pellet-boost-20261108.js instead (its own tail append, 1 hit)',
    grepCount(FAR, 'test-pellet-boost-20261108.js', 'scripts/green-list.txt') === 1, 'far=1');
  const greenDiff = execSync('git diff ' + PICK1 + '^1 ' + PICK1 + ' -- scripts/green-list.txt', { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  T.ok('pick-1 green-list diff is exactly +1 line (test-believed-pantry-perception.js)',
    greenDiff.indexOf('+scripts/test-believed-pantry-perception.js quick') !== -1 &&
    (greenDiff.match(/^\+[^+]/gm) || []).length === 1, 'one added line');
  T.ok('pick-1 inserts its green-list line between test-raid-danger-heard.js and test-win-rallyguard.js (both lines the far end lacks)',
    greenDiff.indexOf(' scripts/test-raid-danger-heard.js quick\n+scripts/test-believed-pantry-perception.js quick\n scripts/test-win-rallyguard.js quick') !== -1, 'insertion point between the two missing-context lines');
  T.ok('objResourceBelief: 0 hits at the far end, 6 at the pick (new API)',
    grepCount(FAR, 'objResourceBelief', 'src/js/villager-objectives.js') === 0 && grepCount(PICK1, 'objResourceBelief', 'src/js/villager-objectives.js') === 6, 'far=0 pick=6');
  T.ok('objResourceSee: 0 hits at the far end, 6 at the pick (new API)',
    grepCount(FAR, 'objResourceSee', 'src/js/villager-objectives.js') === 0 && grepCount(PICK1, 'objResourceSee', 'src/js/villager-objectives.js') === 6, 'far=0 pick=6');
  T.ok('objResourceLiveSnap: 0 hits at the far end, 3 at the pick (new API)',
    grepCount(FAR, 'objResourceLiveSnap', 'src/js/villager-objectives.js') === 0 && grepCount(PICK1, 'objResourceLiveSnap', 'src/js/villager-objectives.js') === 3, 'far=0 pick=3');
  T.ok('pick-1 diff adds the resource_belief_filtered rule to ONTOLOGY.md',
    execSync('git diff ' + PICK1 + '^1 ' + PICK1 + ' -- docs/ONTOLOGY.md', { cwd: REPO, stdio: 'pipe' }).toString('utf8').indexOf('+- resource_belief_filtered') !== -1, 'rule added');
  T.ok('danger_heard_filtered: 1 hit at the pick parent, 0 at the far end (far end deleted the line the pick keeps)',
    grepCount(FIRST1, 'danger_heard_filtered', 'docs/ONTOLOGY.md') === 1 && grepCount(FAR, 'danger_heard_filtered', 'docs/ONTOLOGY.md') === 0, 'parent=1 far=0');
  T.ok('resource_belief_filtered: 0 hits at the pick parent and 0 at the far end (the pick adds it)',
    grepCount(FIRST1, 'resource_belief_filtered', 'docs/ONTOLOGY.md') === 0 && grepCount(FAR, 'resource_belief_filtered', 'docs/ONTOLOGY.md') === 0, 'parent=0 far=0');

  // ---- 5. Family content ----
  T.section('5. Family content — believed pantry / duty candidates, no lever numbers changed');
  const obj1 = gitShow(PICK1, 'src/js/villager-objectives.js');
  T.ok('pick 1 adds objResourceBelief / objResourceSee / objResourceLiveSnap to villager-objectives.js',
    obj1.indexOf('objResourceBelief') !== -1 && obj1.indexOf('objResourceSee') !== -1 && obj1.indexOf('objResourceLiveSnap') !== -1, 'belief API present');
  T.ok('pick 1 adds the away/stale belief rule (never uses live totals)',
    obj1.indexOf('resource_belief_filtered') !== -1, 'belief rule present');
  const goals1 = gitShow(PICK1, 'src/js/villager-goals.js');
  T.ok('pick 1 reads believed pantry days per villager (pantryDays(G, vid) via objResourceBelief, null on unknown)',
    goals1.indexOf('pantryDays(G, vid)') !== -1 && goals1.indexOf('objResourceBelief') !== -1 && goals1.indexOf('if (b.unknown) return null') !== -1, 'believed pantryDays present');
  const wants1 = gitShow(PICK1, 'src/js/convo-wants.js');
  T.ok('pick 1 village-resource favor scan reads believed water/kcal (unknown belief skips the favor)',
    wants1.indexOf('Village-resource favor scan') !== -1 && wants1.indexOf('objResourceBelief') !== -1 && wants1.indexOf('unknown belief skips') !== -1, 'believed favor scan present');
  const brain2 = gitShow(PICK2, 'src/js/villager-brain.js');
  T.ok('pick 2 adds duty candidates from believed needs (dutyBuildCand / dutyBelievedNeeds / dutyFeedCands)',
    brain2.indexOf('dutyBuildCand') !== -1 && brain2.indexOf('dutyBelievedNeeds') !== -1 && brain2.indexOf('dutyFeedCands') !== -1, 'duty candidates present');
  T.ok('pick 2 keeps Standing assignTask orders binding (no competing ads)',
    brain2.indexOf('assignTask') !== -1, 'assignTask binding present');
  for (const pair of [[PICK1, 'pick 1'], [PICK2, 'pick 2']]) {
    const added = addedLines(pair[0], 'src/js');
    T.ok(pair[1] + ' ADDED src/js lines change no damage/armor/spawn/food-yield/spoilage identifier',
      ['damage', 'armor', 'spawnMonster', 'foodYield', 'spoilage'].every(function (w) { return added.indexOf(w) === -1; }), 'no lever identifiers in added lines');
    T.ok(pair[1] + ' ADDED src/js lines change no wave/table gate (no wave5, deedGate)',
      added.indexOf('wave5') === -1 && added.indexOf('deedGate') === -1, 'no gate identifiers in added lines');
  }

  // ---- 6. Verdict mapping ----
  T.section('6. Verdict mapping — group thresholds + conflict rule + tooling rule');
  const table = [[0, 'CARRIER'], [1, 'CARRIER'], [2, 'AMBIGUOUS'], [3, 'NOT-CARRIER'], [4, 'NOT-CARRIER'], [8, 'NOT-CARRIER'], [-1, 'UNCLASSIFIABLE'], [9, 'UNCLASSIFIABLE'], [NaN, 'UNCLASSIFIABLE']];
  for (const pair of table) {
    T.ok('survived ' + pair[0] + ' -> ' + pair[1], classifyTransplant(pair[0]) === pair[1], classifyTransplant(pair[0]));
  }
  T.ok('conflict rule: no conflict -> NO-CONFLICT', conflictStop([]) === 'NO-CONFLICT', conflictStop([]));
  T.ok('conflict rule: one src/js file -> UNMEASURED', conflictStop(['src/js/villager-objectives.js']) === 'UNMEASURED', conflictStop(['src/js/villager-objectives.js']));
  T.ok('conflict rule: one tooling file -> UNMEASURED (the binding STOP clause; the tooling rule is a separate coordinator decision)',
    conflictStop(['scripts/green-list.txt']) === 'UNMEASURED', conflictStop(['scripts/green-list.txt']));
  T.ok('conflict rule: UU villager-objectives.js + UU ONTOLOGY.md + UU green-list.txt -> UNMEASURED',
    conflictStop(['src/js/villager-objectives.js', 'docs/ONTOLOGY.md', 'scripts/green-list.txt']) === 'UNMEASURED', conflictStop(['src/js/villager-objectives.js', 'docs/ONTOLOGY.md', 'scripts/green-list.txt']));

  // ---- 7. Prereg recorded in the evidence file ----
  T.section('7. Prereg recorded in the evidence file');
  const evPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15d-prereg.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('prereg file exists', ev.length > 0, evPath);
  T.ok('prereg names pick 03436c1bc (believed pantry/cistern)', ev.indexOf('03436c1bc') !== -1, 'pick 1 present');
  T.ok('prereg names pick 206fe4931 (OVE-60)', ev.indexOf('206fe4931') !== -1, 'pick 2 present');
  T.ok('prereg names the far end 203a32775', ev.indexOf('203a32775') !== -1, 'far end present');
  T.ok('prereg names the band 190391-190398', ev.indexOf('190391') !== -1 && ev.indexOf('190398') !== -1, 'band present');
  T.ok('prereg names the STEP id t15d-needs', ev.indexOf('t15d-needs') !== -1, 'STEP present');
  T.ok('prereg records the STOP clause', ev.indexOf('STOP clause') !== -1, 'STOP clause present');
  T.ok('prereg records the thresholds (CARRIER <=1/8, AMBIGUOUS 2/8, NOT-CARRIER >=3/8)',
    ev.indexOf('CARRIER') !== -1 && ev.indexOf('AMBIGUOUS') !== -1 && ev.indexOf('NOT-CARRIER') !== -1, 'thresholds present');
  T.ok('prereg records the subject branch name transplant-15d-subject', ev.indexOf('transplant-15d-subject') !== -1, 'subject branch present');
  T.ok('prereg records the pick-1 merge-tree prediction (rc=1, tree f3838750, three files)',
    ev.indexOf('f3838750') !== -1 && ev.indexOf('src/js/villager-objectives.js') !== -1, 'prediction present');
  T.ok('prereg records the live scaffold confirmation (tmp-15d-predict, UU lines, markers 2021/916/843)',
    ev.indexOf('tmp-15d-predict') !== -1 && ev.indexOf('2021') !== -1 && ev.indexOf('916') !== -1 && ev.indexOf('843') !== -1, 'live confirmation present');
  T.ok('prereg records that pick 2 predictions were NOT run (sequence stops at pick 1)',
    ev.indexOf('PICK 2') !== -1 && ev.indexOf('NOT RUN') !== -1, 'pick-2 note present');
  T.ok('prereg records the outcome as UNMEASURED-BY-CONFLICT', ev.indexOf('UNMEASURED-BY-CONFLICT') !== -1, 'outcome present');
  T.ok('prereg records the tooling-resolution rule (git checkout --ours, decided 2026-11-14 ~10:00Z)',
    ev.indexOf('TOOLING-RESOLUTION RULE') !== -1 && ev.indexOf('git checkout --ours') !== -1, 'tooling rule present');
  T.ok('prereg records the grouping authority (§15D)', ev.indexOf('family15-grouping-prereg-2026-11-14.md') !== -1, 'authority present');
  T.ok('prereg records the canon note (CONVERSATIONS.md; no standalone believed-pantry doc)',
    ev.indexOf('CONVERSATIONS.md') !== -1, 'canon note present');
  T.ok('prereg records the horizon 150d death-aware', ev.indexOf('150d') !== -1, 'horizon present');
  T.ok('prereg records the competent verbatim own-policy', ev.indexOf('competent') !== -1, 'policy present');
  T.ok('prereg records the ordering note (pre-check ran during prereg preparation, subject never cut)',
    ev.indexOf('Ordering note') !== -1, 'ordering note present');
  T.ok('prereg records the sw.js +1 note for pick 2 (not in the tooling allowlist)',
    ev.indexOf('sw.js') !== -1 && ev.indexOf('allowlist') !== -1, 'sw.js note present');

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
  T.ok('HEAD is on the arm branch sim-transplant15d-a (worktree-only)', worktreeOnly(headBranch === 'sim-transplant15d-a'), 'HEAD=' + headBranch);
  const dirtyJs = git('status --porcelain --untracked-files=no -- src/js');
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
  T.ok('subject branch does NOT exist (never cut — STOP fired first)', subjectExists === false, SUBJECT_BRANCH + ' absent');
  let scaffoldExists = true;
  try { git('rev-parse ' + SCAFFOLD_BRANCH); } catch (e) { scaffoldExists = false; }
  T.ok('scaffold branch tmp-15d-predict does NOT exist (deleted after the live confirmation)', scaffoldExists === false, SCAFFOLD_BRANCH + ' absent');
  const t15dSummary = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  T.ok('no step summary exists for t15d-needs (no judged sim ran)', fs.existsSync(t15dSummary) === false, STEP);
  const t15dDriver = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  T.ok('no step driver log exists for t15d-needs (no judged sim ran)', fs.existsSync(t15dDriver) === false, STEP);
  const corpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  T.ok('no step corpus exists for t15d-needs (no judged sim ran)', fs.existsSync(corpusDir) === false, STEP);

  // ---- 9. STOP outcome ----
  T.section('9. STOP outcome — conflict reported, nothing resolved, nothing measured');
  const ev15dPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15d.md');
  const ev15d = fs.existsSync(ev15dPath) ? fs.readFileSync(ev15dPath, 'utf8') : '';
  T.ok('evidence file exists', ev15d.length > 0, ev15dPath);
  T.ok('evidence file records the outcome as UNMEASURED-BY-CONFLICT', ev15d.indexOf('UNMEASURED-BY-CONFLICT') !== -1, 'outcome present');
  T.ok('evidence file records the exact conflict list (UU docs/ONTOLOGY.md, UU scripts/green-list.txt, UU src/js/villager-objectives.js)',
    ev15d.indexOf('UU docs/ONTOLOGY.md') !== -1 && ev15d.indexOf('UU scripts/green-list.txt') !== -1 && ev15d.indexOf('UU src/js/villager-objectives.js') !== -1, 'conflict list present');
  T.ok('evidence file records the marker lines (2021/2031, 916, 9/25/843)',
    ev15d.indexOf('2021') !== -1 && ev15d.indexOf('916') !== -1 && ev15d.indexOf('843') !== -1, 'marker lines present');
  T.ok('evidence file records that no subject branch was cut', ev15d.indexOf('never cut') !== -1 || ev15d.indexOf('NEVER cut') !== -1, 'no-subject note present');
  T.ok('evidence file records that no judged sim ran', ev15d.indexOf('No judged sim ran') !== -1 || ev15d.indexOf('no judged sim') !== -1, 'no-sim note present');
  T.ok('evidence file records the flap note (HOST WRITE FLAP, heartbeat 10:24:59Z)',
    ev15d.indexOf('HOST WRITE FLAP') !== -1 && ev15d.indexOf('10:24:59Z') !== -1, 'flap note present');
  T.ok('evidence file names the coordinator decision owed (narrowed route)', ev15d.indexOf('coordinator') !== -1, 'coordinator note present');
  // Prereg-commit ancestry by MESSAGE, not hash (0608Z lesson: an
  // adoption rebase rewrites hashes). This leg can only pass AFTER
  // the prereg+proof commit lands; the stage-1 (pre-commit) run
  // records it as the single expected failure, and the stage-2
  // (post-commit) run is the green one.
  const logSubjects = git('log --format=%s HEAD');
  T.ok('prereg commit is an ancestor of HEAD (resolved by message, not hash)',
    logSubjects.indexOf('sim-transplant15d-a: prereg + proof (STOP: pick-1 conflicts in villager-objectives.js + ONTOLOGY.md + green-list)') !== -1, 'prereg message present');
  // Base restored: back on the arm branch, clean, standing.js == HEAD.
  const headBranch2 = git('rev-parse --abbrev-ref HEAD');
  T.ok('HEAD is back on the arm branch sim-transplant15d-a after the pre-check (worktree-only)', worktreeOnly(headBranch2 === 'sim-transplant15d-a'), 'HEAD=' + headBranch2);
  const dirtyAfter = git('status --porcelain --untracked-files=no');
  // The only tracked modifications allowed here are this proof file
  // itself and the two evidence files (the STOP-outcome writes,
  // uncommitted until this proof passes). Standing/scratch/conflict
  // residue would show as any other line.
  const allowed = ['scripts/test-transplant15d.js', 'evidence/2026-11-14/sim-transplant15d-prereg.md', 'evidence/2026-11-14/sim-transplant15d.md'];
  const dirtyOther = dirtyAfter.split('\n').filter(function (ln) {
    return ln && !allowed.some(function (a) { return ln.indexOf(a) !== -1; });
  }).join('\n');
  T.ok('tracked tree is clean after the pre-check apart from this proof + the two evidence files', dirtyOther === '', dirtyOther.slice(0, 200) || '(only allowed files)');
  const onDiskStanding2 = sha256(fs.readFileSync(path.join(REPO, 'src', 'js', 'standing.js'), 'utf8'));
  const headStanding2 = sha256(gitShow('HEAD', 'src/js/standing.js'));
  T.ok('on-disk standing.js is byte-identical to HEAD (no swap ever happened)', onDiskStanding2 === headStanding2, onDiskStanding2.slice(0, 12));
  let cherryPickHead = true;
  try { execSync('git rev-parse --verify CHERRY_PICK_HEAD', { cwd: REPO, stdio: 'pipe' }); } catch (e) { cherryPickHead = false; }
  T.ok('no cherry-pick is in progress', cherryPickHead === false, 'CHERRY_PICK_HEAD absent');
  T.ok('no verdict (CARRIER/AMBIGUOUS/NOT-CARRIER) is claimed anywhere in the evidence file',
    ev15d.indexOf('VERDICT: CARRIER') === -1 && ev15d.indexOf('VERDICT: AMBIGUOUS') === -1 && ev15d.indexOf('VERDICT: NOT-CARRIER') === -1, 'no verdict claimed');

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
