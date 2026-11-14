#!/usr/bin/env node
// test-transplant12-14.js — proof test for the H1 TRANSPLANT, families
// 12+14 COMBINED (arm sim-transplant12-14-a).
//
// THE QUESTION (evidence/2026-11-14/sim-transplant12-14-prereg.md,
// prereg committed before any judged sim — and before cutting the
// subject): land origin families 14 + 12 TOGETHER onto the far end
// 203a32775 (GOOD 4/8) — family 14 first (merge 7688cb7a4 "Merge pull
// request #10 from steve-vitale/cursor/snippet-stage-direction-guard",
// single commit e4836747 "Reject stage-direction snippets as resume
// memory quotes"), then family 12 on top of it (merge ac119e4ed
// "Merge pull request #25 from steve-vitale/cursor/dialog-residual-
// sampler-f726", single commit 3015beec "Reject residual silence/meta
// resume memory quotes"). Family 12 rides on family 14's origin-only
// guard (convoSnippetIsStageDirection: 0 hits at the far end and the
// merge-base, 3 at 12's first parent) and cannot be judged alone —
// the 0615Z arm proved 12 alone conflicts on the far end. On ANY
// live conflict: STOP per the binding prereg
// (sim-scale-onramp-round-2115.md §3) — report the conflict list,
// do NOT hand-resolve game code.
//
// WHAT THIS TEST PROVES (stage 1, sections 1-6):
//   1. Family 14 identity — merge 7688cb7a4, its parents, the
//      single-commit second-parent side, the exact 1 src/js file
//      (+12 conversation.js), the new test file (+21), no policy
//      file, no standing.js.
//   2. Family 12 identity — merge ac119e4ed, its parents, the
//      single-commit second-parent side, the exact 1 src/js file
//      (+18/-3 conversation.js), the edited test file (+55/-2),
//      no policy file, no standing.js; guard origin-only counts.
//   3. Merge-tree pre-checks (read-only, --write-tree, base = each
//      merge's FIRST parent, the base cherry-pick -m 1 itself
//      uses) — pick 1 CLEAN (tree bc52919e…), pick 2 CLEAN onto the
//      14-applied tree (tree e78fac42…), both trees reproduced two
//      independent ways; plus the brief-base artifact leg (base
//      d229b58f5 reports exactly the 2 tooling-file conflicts from
//      cumulative origin-line drift — neither file is in family
//      14's diff, so it is not a family conflict).
//   4. Family content — both guards in the merge trees, OVE-29
//      assertions in the test file; no numeric/economy/combat/food
//      change in either diff.
//   5. Verdict mapping — classifyTransplant maps every survived
//      count for the PAIR; conflictStop maps any conflicted file
//      to 'UNMEASURED' and an empty set to 'NO-CONFLICT'.
//   6. Prereg recorded in the evidence file (thresholds, STOP
//      clause, seeds, horizon, policy, canon note, both merge-tree
//      predictions with tree OIDs, brief-base note, coordinator
//      decision authority).
//   7. Base state — HEAD is on sim-transplant12-14-a, no src/js file
//      differs from HEAD, on-disk standing.js is byte-identical
//      to HEAD, the step-script tooling source (master) still
//      carries all four scratch files; the step script names the
//      band 190391-190398; the subject branch does not exist yet
//      and no step summary/driver log exists yet at stage 1 (those
//      legs flip to the stage-2 state when §8 is appended).
// (stage 2, section 8 — appended after the live picks + step: live
// pick trees equal the predicted trees, subject branch holds both
// picks, subject diff is exactly the two families, step verdict,
// base restored.)
//
// Usage: node scripts/test-transplant12-14.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant12-14');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const MERGE14 = '7688cb7a4';
const FIRST14 = '16cdd690062b3551ff6b4b0d3639770c8af84b5f';
const SECOND14 = 'e4836747ed6daccfc5eb6deec8a8ae8f8dbaf90b';
const MERGE12 = 'ac119e4ed';
const FIRST12 = 'aa5d9ef92d6f5e7d160f6b59bcbf7b54072b1ad0';
const SECOND12 = '3015beec0aefd3a3db394b73c362c2af9f4c2f84';
const MERGEBASE = 'd229b58f595430e2a24c399820061b39c5b689ca';
const SUBJECT_BRANCH = 'transplant-12-14-subject';
const STEP = 't12-14-combined';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const TEST_FILE = 'scripts/test-snippet-stage-direction.js';
// Predicted clean trees (merge-tree --write-tree, first-parent bases).
const TREE_PICK1 = 'bc52919e73e6449e93ab2b64497eb25138d9ee90';
const TREE_PICK2 = 'e78fac42d89e811f6bfce981b7274e5ee3c5c014';

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
// conflictStop(files): the combined-arm conflict rule — ANY conflicted
// file STOPs the arm (binding prereg: no hand-resolution of game
// code, no narrowed re-run by the arm). Only an empty set proceeds.
function conflictStop(files) {
  if (!Array.isArray(files)) return 'UNCLASSIFIABLE';
  if (files.length === 0) return 'NO-CONFLICT';
  return 'UNMEASURED';
}
// mergeTree(base, ours, theirs): run `git merge-tree --write-tree
// --merge-base=<base> <ours> <theirs>` (read-only dry run — touches
// no worktree) and return { rc, tree, conflicted: [paths], raw }.
// Conflicted files are the paths appearing in stage lines
// ("<mode> <oid> <1|2|3>\t<path>"); --write-tree emits no file
// contents, so there are no conflict-marker lines to count.
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
// buildPick1Tree(): rebuild the 14-applied tree in a TEMPORARY index
// (no worktree mutation, no branch): read-tree the far end, apply
// family 14's diff --cached, write-tree. Returns { tree, commit }
// where commit is an unreferenced commit-tree object (same shape as
// the live scaffold pick, whose tree must match).
function buildPick1Tree() {
  const IDX = '/tmp/test-transplant12-14-idx';
  try { fs.unlinkSync(IDX); } catch (e) { /* absent */ }
  const env = Object.assign({}, process.env, { GIT_INDEX_FILE: IDX });
  execSync('git read-tree ' + FAR, { cwd: REPO, stdio: 'pipe', env: env });
  const diff14 = execSync('git diff ' + FIRST14 + ' ' + MERGE14, { cwd: REPO, stdio: 'pipe' });
  execSync('git apply --cached -', { cwd: REPO, stdio: 'pipe', env: env, input: diff14 });
  const tree = execSync('git write-tree', { cwd: REPO, stdio: 'pipe', env: env }).toString().trim();
  const commit = execSync('git commit-tree ' + tree + ' -p ' + FAR + ' -m "prediction scaffold: far end + family 14 (unreferenced)"',
    { cwd: REPO, stdio: 'pipe' }).toString().trim();
  try { fs.unlinkSync(IDX); } catch (e) { /* cleanup */ }
  return { tree: tree, commit: commit };
}

(async () => {
  // ---- 1. Family 14 identity ----
  T.section('1. Family 14 identity — snippet-stage-direction-guard merge 7688cb7a4');
  T.ok('merge commit exists', git('rev-parse ' + MERGE14).length === 40, git('log -1 --format=%s ' + MERGE14).slice(0, 80));
  T.ok('first parent is 16cdd690062b3551ff6b4b0d3639770c8af84b5f', git('rev-parse ' + MERGE14 + '^1') === FIRST14, git('log -1 --format=%h\\ %s ' + MERGE14 + '^1').slice(0, 80));
  T.ok('second parent is e4836747 (the stage-direction-guard commit)', git('rev-parse ' + MERGE14 + '^2').startsWith(SECOND14.slice(0, 9)), git('log -1 --format=%h\\ %s ' + MERGE14 + '^2').slice(0, 80));
  const sideCount14 = parseInt(git('rev-list --count ' + MERGE14 + '^1..' + MERGE14 + '^2'), 10);
  T.ok('second-parent side is 1 commit', sideCount14 === 1, 'count=' + sideCount14);
  const sideSubject14 = git('log --format=%s ' + MERGE14 + '^1..' + MERGE14 + '^2');
  T.ok('second-parent side is "Reject stage-direction snippets as resume memory quotes"',
    sideSubject14 === 'Reject stage-direction snippets as resume memory quotes', sideSubject14.slice(0, 80));
  const jsFiles14 = git('diff --name-only ' + MERGE14 + '^1 ' + MERGE14 + ' -- src/js').split('\n').sort();
  T.ok('family 14 touches exactly the 1 expected src/js file', JSON.stringify(jsFiles14) === JSON.stringify(['src/js/conversation.js']), jsFiles14.join(', '));
  const convStat14 = git('diff --numstat ' + MERGE14 + '^1 ' + MERGE14 + ' -- src/js/conversation.js');
  T.ok('family 14 conversation.js is +12/-0', convStat14 === '12\t0\tsrc/js/conversation.js', convStat14);
  const testStat14 = git('diff --numstat ' + MERGE14 + '^1 ' + MERGE14 + ' -- ' + TEST_FILE);
  T.ok('family 14 test file is +21/-0 (new test)', testStat14 === '21\t0\t' + TEST_FILE, testStat14);
  const polFiles14 = git('diff --name-only ' + MERGE14 + '^1 ' + MERGE14 + ' -- scripts/policies');
  T.ok('family 14 touches no policy file', polFiles14 === '', polFiles14 || '(none)');
  T.ok('family 14 does not touch standing.js', git('diff --name-only ' + MERGE14 + '^1 ' + MERGE14 + ' -- src/js/standing.js') === '', '(absent)');
  const total14 = git('diff --numstat ' + MERGE14 + '^1 ' + MERGE14).split('\n');
  const totalStat14 = total14.reduce(function (acc, line) {
    const p = line.split('\t');
    const ins = parseInt(p[0], 10), del = parseInt(p[1], 10);
    if (Number.isFinite(ins)) acc.ins += ins;
    if (Number.isFinite(del)) acc.del += del;
    return acc;
  }, { ins: 0, del: 0 });
  T.ok('family 14 total is 2 files, +33/-0', total14.length === 2 && totalStat14.ins === 33 && totalStat14.del === 0,
    total14.length + ' files, +' + totalStat14.ins + '/-' + totalStat14.del);
  T.ok('family 14 first parent has 0 convoSnippetIsStageDirection occurrences (guard not yet built)',
    grepCount(FIRST14, 'convoSnippetIsStageDirection', 'src/js/conversation.js') === 0, 'count=0');
  const merge14Conv = gitShow(MERGE14, 'src/js/conversation.js');
  T.ok('merge 14 conversation.js ADDS convoSnippetIsStageDirection', merge14Conv.indexOf('convoSnippetIsStageDirection') !== -1, 'guard present');
  T.ok('merge 14 conversation.js guard catches "They glance" / "comfortable quiet" / "Still on what they confided"',
    merge14Conv.indexOf('They |A comfortable |A warmth |A tired |Still on what they confided') !== -1, 'guard patterns present');
  let test14AtFirst = '';
  try { test14AtFirst = git('ls-tree ' + FIRST14 + ' -- ' + TEST_FILE); } catch (e) { test14AtFirst = ''; }
  T.ok('family 14 first parent has NO test file (family 14 creates it)', test14AtFirst === '', '(absent)');
  const test14AtMerge = git('ls-tree ' + MERGE14 + ' -- ' + TEST_FILE);
  T.ok('merge 14 test file present', test14AtMerge.indexOf(TEST_FILE) !== -1, test14AtMerge.slice(0, 60));

  // ---- 2. Family 12 identity ----
  T.section('2. Family 12 identity — dialog-residual-sampler merge ac119e4ed');
  T.ok('merge commit exists', git('rev-parse ' + MERGE12).length === 40, git('log -1 --format=%s ' + MERGE12).slice(0, 80));
  T.ok('first parent is aa5d9ef92d6f5e7d160f6b59bcbf7b54072b1ad0', git('rev-parse ' + MERGE12 + '^1') === FIRST12, git('log -1 --format=%h\\ %s ' + MERGE12 + '^1').slice(0, 80));
  T.ok('second parent is 3015beec0 (the residual-sampler commit)', git('rev-parse ' + MERGE12 + '^2').startsWith(SECOND12.slice(0, 9)), git('log -1 --format=%h\\ %s ' + MERGE12 + '^2').slice(0, 80));
  const sideCount12 = parseInt(git('rev-list --count ' + MERGE12 + '^1..' + MERGE12 + '^2'), 10);
  T.ok('second-parent side is 1 commit', sideCount12 === 1, 'count=' + sideCount12);
  const sideSubject12 = git('log --format=%s ' + MERGE12 + '^1..' + MERGE12 + '^2');
  T.ok('second-parent side is "Reject residual silence/meta resume memory quotes"',
    sideSubject12 === 'Reject residual silence/meta resume memory quotes', sideSubject12.slice(0, 80));
  const jsFiles12 = git('diff --name-only ' + MERGE12 + '^1 ' + MERGE12 + ' -- src/js').split('\n').sort();
  T.ok('family 12 touches exactly the 1 expected src/js file', JSON.stringify(jsFiles12) === JSON.stringify(['src/js/conversation.js']), jsFiles12.join(', '));
  const convStat12 = git('diff --numstat ' + MERGE12 + '^1 ' + MERGE12 + ' -- src/js/conversation.js');
  T.ok('family 12 conversation.js is +18/-3 (brief shorthand 21 is the --stat total, not insertions)',
    convStat12 === '18\t3\tsrc/js/conversation.js', convStat12);
  const testStat12 = git('diff --numstat ' + MERGE12 + '^1 ' + MERGE12 + ' -- ' + TEST_FILE);
  T.ok('family 12 test file is +55/-2 (edited test)', testStat12 === '55\t2\t' + TEST_FILE, testStat12);
  const polFiles12 = git('diff --name-only ' + MERGE12 + '^1 ' + MERGE12 + ' -- scripts/policies');
  T.ok('family 12 touches no policy file', polFiles12 === '', polFiles12 || '(none)');
  T.ok('family 12 does not touch standing.js', git('diff --name-only ' + MERGE12 + '^1 ' + MERGE12 + ' -- src/js/standing.js') === '', '(absent)');
  const total12 = git('diff --numstat ' + MERGE12 + '^1 ' + MERGE12).split('\n');
  const totalStat12 = total12.reduce(function (acc, line) {
    const p = line.split('\t');
    const ins = parseInt(p[0], 10), del = parseInt(p[1], 10);
    if (Number.isFinite(ins)) acc.ins += ins;
    if (Number.isFinite(del)) acc.del += del;
    return acc;
  }, { ins: 0, del: 0 });
  T.ok('family 12 total is 2 files, +73/-5', total12.length === 2 && totalStat12.ins === 73 && totalStat12.del === 5,
    total12.length + ' files, +' + totalStat12.ins + '/-' + totalStat12.del);
  const farStanding = sha256(gitShow(FAR, 'src/js/standing.js'));
  T.ok('far-end native standing.js sha is 75762cb2...', farStanding.startsWith('75762cb2'), farStanding.slice(0, 12));
  T.ok('fix standing.js sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  const farPolicy = sha256(gitShow(FAR, 'scripts/policies/competent.js'));
  T.ok('far-end policy sha is a7ff5c51...', farPolicy.startsWith('a7ff5c51'), farPolicy.slice(0, 12));
  // Guard origin-only counts (the reason 12 rides on 14).
  T.ok('far-end conversation.js has 0 convoSnippetIsStageDirection occurrences (guard is origin-only)',
    grepCount(FAR, 'convoSnippetIsStageDirection', 'src/js/conversation.js') === 0, 'count=0');
  T.ok('merge-base d229b58f5 has 0 occurrences',
    grepCount(MERGEBASE, 'convoSnippetIsStageDirection', 'src/js/conversation.js') === 0, 'count=0');
  T.ok('family 12 first parent has 3 occurrences',
    grepCount(FIRST12, 'convoSnippetIsStageDirection', 'src/js/conversation.js') === 3, 'count=3');
  let farTest = '';
  try { farTest = git('ls-tree ' + FAR + ' -- ' + TEST_FILE); } catch (e) { farTest = ''; }
  T.ok('far-end test file ABSENT (created on the origin line by family 14, never on the local line)', farTest === '', '(absent)');
  const baseTest12 = git('ls-tree ' + FIRST12 + ' -- ' + TEST_FILE);
  T.ok('family 12 first-parent test file present', baseTest12.indexOf(TEST_FILE) !== -1, baseTest12.slice(0, 60));

  // ---- 3. Merge-tree pre-check predictions ----
  T.section('3. Merge-tree pre-check — BOTH picks CLEAN (base = each merge first parent)');
  const mt1 = mergeTree(FIRST14, FAR, MERGE14);
  T.ok('pick 1 merge-tree rc=0 (clean)', mt1.rc === 0, 'rc=' + mt1.rc);
  T.ok('pick 1 merge-tree tree is bc52919e…', mt1.tree === TREE_PICK1, mt1.tree.slice(0, 12));
  T.ok('pick 1 merge-tree reports ZERO conflicted files', mt1.conflicted.length === 0, mt1.conflicted.join(', ') || '(none)');
  T.ok('pick 1 merge-tree output has no conflict markers', mt1.raw.indexOf('<<<<<<<') === -1 && mt1.raw.indexOf('>>>>>>>') === -1, 'no markers');
  // Pick 2: rebuild the 14-applied tree in a temp index and predict.
  const scaffold = buildPick1Tree();
  T.ok('temp-index rebuild of the 14-applied tree equals the pick-1 merge-tree (bc52919e…)',
    scaffold.tree === TREE_PICK1, scaffold.tree.slice(0, 12));
  const mt2 = mergeTree(FIRST12, scaffold.commit, MERGE12);
  T.ok('pick 2 merge-tree rc=0 (clean)', mt2.rc === 0, 'rc=' + mt2.rc);
  T.ok('pick 2 merge-tree tree is e78fac42…', mt2.tree === TREE_PICK2, mt2.tree.slice(0, 12));
  T.ok('pick 2 merge-tree reports ZERO conflicted files', mt2.conflicted.length === 0, mt2.conflicted.join(', ') || '(none)');
  T.ok('pick 2 merge-tree output has no conflict markers', mt2.raw.indexOf('<<<<<<<') === -1 && mt2.raw.indexOf('>>>>>>>') === -1, 'no markers');
  // The predicted pick-2 tree carries both families' content.
  T.ok('predicted pick-2 tree has 2 convoSnippetIsStageDirection hits in conversation.js',
    grepCount(TREE_PICK2, 'convoSnippetIsStageDirection', 'src/js/conversation.js') === 2, 'count=2');
  T.ok('predicted pick-2 tree has the residual widening (Your silence / You say nothing)',
    gitShow(TREE_PICK2, 'src/js/conversation.js').indexOf('Your silence|You say nothing') !== -1, 'widened guard present');
  T.ok('predicted pick-2 tree has the party-join assent guard',
    gitShow(TREE_PICK2, 'src/js/conversation.js').indexOf('had better be worth it') !== -1, 'assent guard present');
  T.ok('predicted pick-2 tree test file has 3 residual/Residual markers',
    grepCount(TREE_PICK2, 'residual', 'scripts/test-snippet-stage-direction.js') +
    grepCount(TREE_PICK2, 'Residual', 'scripts/test-snippet-stage-direction.js') === 3, 'count=3');
  // Brief-base artifact leg: base d229b58f5 mis-predicts tooling conflicts.
  const mtBrief = mergeTree(MERGEBASE, FAR, MERGE14);
  T.ok('brief-base (d229b58f5) merge-tree rc=1', mtBrief.rc === 1, 'rc=' + mtBrief.rc);
  T.ok('brief-base merge-tree conflicts EXACTLY the 2 tooling files (balance-proof.json, green-list.txt)',
    JSON.stringify(mtBrief.conflicted) === JSON.stringify(['scripts/balance-proof.json', 'scripts/green-list.txt']),
    mtBrief.conflicted.join(', '));
  T.ok('brief-base merge-tree conflicts NO src/js file',
    mtBrief.conflicted.every(function (f) { return f.indexOf('src/js/') !== 0; }), 'no src/js conflict');
  const driftFiles = git('diff --name-only ' + MERGEBASE + ' ' + MERGE14 + ' -- scripts/balance-proof.json scripts/green-list.txt').split('\n').filter(Boolean);
  T.ok('both tooling files change on the origin line d229b58f5..7688cb7a4 (cumulative drift)',
    driftFiles.length === 2, driftFiles.join(', '));
  const fam14Files = git('diff --name-only ' + FIRST14 + ' ' + MERGE14).split('\n').filter(Boolean);
  T.ok('NEITHER tooling file is in family 14 own diff (first parent .. merge)',
    fam14Files.indexOf('scripts/balance-proof.json') === -1 && fam14Files.indexOf('scripts/green-list.txt') === -1,
    fam14Files.join(', '));

  // ---- 4. Family content — dialogue coherence only ----
  T.section('4. Family content — dialogue-coherence fix only, no numeric/economy/combat change');
  const merge12Conv = gitShow(MERGE12, 'src/js/conversation.js');
  T.ok('merge 12 conversation.js widens convoSnippetIsStageDirection (warm silence + Still-on + Say-it-plain)',
    merge12Conv.indexOf('convoSnippetIsStageDirection(sn)') !== -1 && merge12Conv.indexOf('Your silence|You say nothing') !== -1 && merge12Conv.indexOf('/^Still on\\b/i.test(s)') !== -1 && merge12Conv.indexOf('/^Say it plain\\.\\s*Still on\\b/i.test(s)') !== -1, 'widened guard present');
  T.ok('merge 12 conversation.js adds the party-join assent guard (had better be worth it / not carrying your stuff)',
    merge12Conv.indexOf('had better be worth it') !== -1 && merge12Conv.indexOf('not carrying your stuff') !== -1 && merge12Conv.indexOf('watch your back\\. Might as well') !== -1, 'assent guard present');
  T.ok('merge 12 conversation.js strips quote marks before the stage-direction test',
    merge12Conv.indexOf('replace(/^["') !== -1, 'quote-strip present');
  const merge12Test = gitShow(MERGE12, 'scripts/test-snippet-stage-direction.js');
  T.ok('merge 12 test file adds OVE-29 residual assertions (warm silence + Still-on + Say-it-plain)',
    merge12Test.indexOf('OVE-29 residual sampler') !== -1 && merge12Test.indexOf('You say nothing. Neither do they, for a while') !== -1 && merge12Test.indexOf('Still on that hard time.') !== -1, 'OVE-29 assertions present');
  T.ok('merge 12 test file asserts party-join assent is not a real beat',
    merge12Test.indexOf('...Fine. This had better be worth it.') !== -1, 'assent assertion present');
  const merge14Test = gitShow(MERGE14, 'scripts/test-snippet-stage-direction.js');
  T.ok('merge 14 test file asserts stage-direction snippets are not resume quotes',
    merge14Test.indexOf('stage-direction') !== -1 || merge14Test.indexOf('StageDirection') !== -1, 'stage-direction assertions present');
  const diff14js = execSync('git diff ' + MERGE14 + '^1 ' + MERGE14 + ' -- src/js', { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  const diff12js = execSync('git diff ' + MERGE12 + '^1 ' + MERGE12 + ' -- src/js', { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  T.ok('family 14 diff touches no food/economy/combat identifier (kcal, damage, armor, spawn)',
    ['kcal', 'damage', 'armor', 'spawnMonster', 'foodYield', 'spoilage'].every(function (w) { return diff14js.indexOf(w) === -1; }),
    'no numeric identifiers');
  T.ok('family 12 diff touches no food/economy/combat identifier (kcal, damage, armor, spawn)',
    ['kcal', 'damage', 'armor', 'spawnMonster', 'foodYield', 'spoilage'].every(function (w) { return diff12js.indexOf(w) === -1; }),
    'no numeric identifiers');
  T.ok('family 14 diff touches no standing/table/wave identifier',
    [/\bstanding\b/, /\btable\b/, /wave5/, /Wave 5/, /deedGate/].every(function (re) { return !re.test(diff14js); }),
    'no scale identifiers');
  T.ok('family 12 diff touches no standing/table/wave identifier',
    [/\bstanding\b/, /\btable\b/, /wave5/, /Wave 5/, /deedGate/].every(function (re) { return !re.test(diff12js); }),
    'no scale identifiers');

  // ---- 5. Verdict mapping ----
  T.section('5. Verdict mapping — pair thresholds + conflict rule');
  const table = [[0, 'CARRIER'], [1, 'CARRIER'], [2, 'AMBIGUOUS'], [3, 'NOT-CARRIER'], [4, 'NOT-CARRIER'], [8, 'NOT-CARRIER'], [-1, 'UNCLASSIFIABLE'], [9, 'UNCLASSIFIABLE'], [NaN, 'UNCLASSIFIABLE']];
  for (const pair of table) {
    T.ok('survived ' + pair[0] + ' -> ' + pair[1], classifyTransplant(pair[0]) === pair[1], classifyTransplant(pair[0]));
  }
  T.ok('conflict rule: no conflict -> NO-CONFLICT', conflictStop([]) === 'NO-CONFLICT', conflictStop([]));
  T.ok('conflict rule: one src/js file -> UNMEASURED', conflictStop(['src/js/conversation.js']) === 'UNMEASURED', conflictStop(['src/js/conversation.js']));
  T.ok('conflict rule: one tooling file -> UNMEASURED (no narrowed re-run by this arm)',
    conflictStop(['scripts/balance-proof.json']) === 'UNMEASURED', conflictStop(['scripts/balance-proof.json']));
  T.ok('conflict rule: UU conversation.js + DU test file -> UNMEASURED',
    conflictStop(['src/js/conversation.js', 'scripts/test-snippet-stage-direction.js']) === 'UNMEASURED', conflictStop(['src/js/conversation.js', 'scripts/test-snippet-stage-direction.js']));

  // ---- 6. Prereg recorded in the evidence file ----
  T.section('6. Prereg recorded in the evidence file');
  const evPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant12-14-prereg.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('prereg file exists', ev.length > 0, evPath);
  T.ok('prereg names merge 7688cb7a4 (family 14)', ev.indexOf('7688cb7a4') !== -1, 'merge 14 present');
  T.ok('prereg names merge ac119e4ed (family 12)', ev.indexOf('ac119e4ed') !== -1, 'merge 12 present');
  T.ok('prereg names the far end 203a32775', ev.indexOf('203a32775') !== -1, 'far end present');
  T.ok('prereg names the band 190391-190398', ev.indexOf('190391') !== -1 && ev.indexOf('190398') !== -1, 'band present');
  T.ok('prereg names the STEP id t12-14-combined', ev.indexOf('t12-14-combined') !== -1, 'STEP present');
  T.ok('prereg records the STOP clause', ev.indexOf('STOP clause') !== -1, 'STOP clause present');
  T.ok('prereg records the thresholds (CARRIER <=1/8, AMBIGUOUS 2/8, NOT-CARRIER >=3/8)',
    ev.indexOf('CARRIER') !== -1 && ev.indexOf('AMBIGUOUS') !== -1 && ev.indexOf('NOT-CARRIER') !== -1, 'thresholds present');
  T.ok('prereg records the subject branch name transplant-12-14-subject', ev.indexOf('transplant-12-14-subject') !== -1, 'subject branch present');
  T.ok('prereg records both predicted clean trees (bc52919e… and e78fac42…)',
    ev.indexOf('bc52919e') !== -1 && ev.indexOf('e78fac42') !== -1, 'predicted trees present');
  T.ok('prereg records the brief-base note (d229b58f5 tooling drift, not a family conflict)',
    ev.indexOf('BRIEF-BASE NOTE') !== -1, 'brief-base note present');
  T.ok('prereg records the coordinator decision (12+14 together, 0615Z closeout + sim-findings line 2329)',
    ev.indexOf('0615Z') !== -1 && ev.indexOf('2329') !== -1, 'authority present');
  T.ok('prereg records the canon note (CONVERSATIONS.md covers the sampler; no standalone residual-sampler doc)',
    ev.indexOf('CONVERSATIONS.md') !== -1 && ev.indexOf('No standalone canon doc covers the OVE-29 residual') !== -1, 'canon note present');
  T.ok('prereg records the horizon 150d death-aware', ev.indexOf('150d') !== -1, 'horizon present');
  T.ok('prereg records the competent verbatim own-policy', ev.indexOf('competent') !== -1, 'policy present');
  T.ok('prereg records the origin-only mechanism (0 occurrences at the far end)', ev.indexOf('0 hits') !== -1 || ev.indexOf('ORIGIN-ONLY') !== -1 || ev.indexOf('origin-only') !== -1, 'mechanism present');

  // ---- 7. Base state ----
  // NOTE (stage 2): the subject-branch leg below was 'does NOT exist
  // yet' at the stage-1 commit and is superseded once the subject is
  // cut and the live picks run — it asserts the stage-2 state
  // instead (subject exists with 2 commits, tip tree e78fac42…).
  T.section('7. Base state — arm branch clean, subject not cut yet, sim not run');
  const headBranch = git('rev-parse --abbrev-ref HEAD');
  // worktreeOnly: branch-identity legs are meaningful only in the
  // worker tree. On merged master HEAD is 'master' by design (the
  // arm branch is deleted after landing) — the leg passes there
  // vacuously instead of failing, so the proof stays green on master
  // (0215Z lesson: 4b/5b/7 proofs read 127/129 etc. on master only
  // on branch-identity legs). Prereg-commit ancestry legs resolve by
  // message/subject, not hash (0608Z lesson: an adoption rebase
  // rewrites hashes).
  const worktreeOnly = function (cond) { return cond || headBranch === 'master'; };
  T.ok('HEAD is on the arm branch sim-transplant12-14-a (worktree-only)', worktreeOnly(headBranch === 'sim-transplant12-14-a'), 'HEAD=' + headBranch);
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
  T.ok('subject branch does NOT exist yet (cut after the stage-1 commit)', subjectExists === false, SUBJECT_BRANCH);
  const t1214Summary = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  T.ok('step summary does NOT exist yet (no judged sim has run)', fs.existsSync(t1214Summary) === false, STEP);
  const t1214Driver = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  T.ok('step driver log does NOT exist yet (no judged sim has run)', fs.existsSync(t1214Driver) === false, STEP);

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
