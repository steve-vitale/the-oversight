#!/usr/bin/env node
// test-transplant15b.js — proof test for the H1 TRANSPLANT, family 15B
// (companionScore / objectives) (arm sim-transplant15b-a).
//
// THE QUESTION (evidence/2026-11-14/sim-transplant15b-prereg.md,
// prereg committed before any judged sim — and before cutting the
// subject): land origin family 15B onto the far end 203a32775
// (GOOD 4/8) — three standalone commits in origin order, oldest
// first: 1e03b3d69 "Stop objAskCompanion cross-person objective
// overwrite" (OVE-45), then 8bb704423 "OVE-54: unify companionScore
// across door, party, favor-company", then 134a3d0ab "OVE-54: record
// PR URL in companionScore evidence" (evidence only, rides with 54).
// On ANY live conflict: STOP per the binding prereg
// (sim-scale-onramp-round-2115.md §3) — report the conflict list,
// do NOT hand-resolve game code, do NOT decide a narrowed re-run.
//
// WHAT THIS TEST PROVES (stage 1, sections 1-6):
//   1. Pick 1 identity — commit 1e03b3d69, its first parent
//      03436c1bc (family 15D's first commit), the exact 1 src/js
//      file (+70/-14 villager-objectives.js), the new test file
//      (+294), no policy file, no standing.js.
//   2. Pick 2 identity — commit 8bb704423, its first parent
//      a1567198c, the exact 5 src/js files (companion-score.js +103
//      new, favor-company.js +26/-2, villager-brain.js +12/-1,
//      villager-objectives.js +19/-12, win-plan.js +12/-1), the
//      +5757-line payload with its 5,245-line evidence JSON share,
//      no policy file, no standing.js.
//   3. Pick 3 identity — commit 134a3d0ab, first parent IS pick 2,
//      exactly 1 evidence file (+2/-1), js=0.
//   4. Merge-tree pre-check predictions (read-only, --write-tree,
//      base = each pick's FIRST parent, the base cherry-pick itself
//      uses) — pick 1 PREDICTED CONFLICT (rc=1, tree fc9266a7…,
//      exactly the 4 conflicted files: docs/ONTOLOGY.md,
//      scripts/green-list.txt, scripts/test-raid-danger-heard.js
//      modify/delete, src/js/villager-objectives.js content);
//      picks 2/3 sequence predictions BLOCKED (no clean pick-1 tree
//      exists); supplementary pick-2-vs-far-end and pick-3-vs-far-end
//      predictions recorded with their exact conflict lists.
//   5. Family content — objAskCompanion guard + objCommitGuardOffer
//      (pick 1); companionScore unify (pick 2); no numeric/economy/
//      combat/food/standing/table/wave identifier in any pick's
//      ADDED js lines (word-boundary scan; "Stable" / "bark_armor"
//      context lines are not added lines).
//   6. Verdict mapping — classifyTransplant maps every survived
//      count; conflictStop maps any conflicted file to 'UNMEASURED'
//      and an empty set to 'NO-CONFLICT'.
//   7. Prereg recorded in the evidence file (thresholds, STOP
//      clause, seeds, horizon, policy, canon note, merge-tree
//      predictions with tree OIDs, supplementary predictions,
//      grouping-prereg authority).
//   8. Base state — HEAD is on sim-transplant15b-a, no src/js file
//      differs from HEAD, on-disk standing.js is byte-identical
//      to HEAD, the step-script tooling source (master) still
//      carries all four scratch files; the step script names the
//      band 190391-190398; the subject branch does not exist yet
//      and no step summary/driver log exists yet at stage 1 (those
//      legs flip to the stage-2 state when §9 is appended).
// (stage 2, section 9 — appended after the live pick attempt: live
// pick 1 conflict list, subject branch state, UNMEASURED verdict,
// base restored.)
//
// Usage: node scripts/test-transplant15b.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant15b');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const PICK1 = '1e03b3d69';
const PICK1_FULL = '1e03b3d69480e2d57c08bd2629aeffdeee4e6f32';
const FIRST1 = '03436c1bcacbbf0c3d0b868503cf32da162d573b';
const PICK2 = '8bb704423';
const PICK2_FULL = '8bb7044231d17aaca8efcbbdfd9c1904ecc77dc9';
const FIRST2 = 'a1567198c125a3649b8a8bd5de8bf160c8a51c6b';
const PICK3 = '134a3d0ab';
const PICK3_FULL = '134a3d0ab161d4dcf96616c3bcf4940d6a5dd2fc';
const FIRST3 = PICK2_FULL; // pick 3's first parent IS pick 2
const SUBJECT_BRANCH = 'transplant-15b-subject';
const STEP = 't15b-companion';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
// Predicted conflict tree (merge-tree --write-tree, first-parent base).
const TREE_PICK1 = 'fc9266a7cc404ed7682b552e3d6474c47e7f8ad1';
const PICK1_CONFLICTS = ['docs/ONTOLOGY.md', 'scripts/green-list.txt', 'scripts/test-raid-danger-heard.js', 'src/js/villager-objectives.js'];
const PICK2_FAR_CONFLICTS = ['docs/ONTOLOGY.md', 'index.html', 'scripts/green-list.txt', 'scripts/phone-frame-proof.json', 'src/js/villager-brain.js', 'src/js/villager-objectives.js'];
const PICK3_FAR_CONFLICTS = ['evidence/2026-11-08/companion-score-unify.md'];

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
// conflictStop(files): the arm conflict rule — ANY conflicted file
// STOPs the arm (binding prereg: no hand-resolution of game code,
// no narrowed re-run by the arm). Only an empty set proceeds.
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
// numstatTotal(commit): { files, ins, del } for <commit>^..<commit>.
function numstatTotal(commit) {
  const lines = git('diff --numstat ' + commit + '^ ' + commit).split('\n');
  return lines.reduce(function (acc, line) {
    const p = line.split('\t');
    const ins = parseInt(p[0], 10), del = parseInt(p[1], 10);
    if (Number.isFinite(ins)) acc.ins += ins;
    if (Number.isFinite(del)) acc.del += del;
    acc.files += 1;
    return acc;
  }, { files: 0, ins: 0, del: 0 });
}
// addedJsHasNoLeverIdentifiers(commit): the pick's ADDED js lines
// (not context) carry no survival-lever identifier, word-boundary
// scan — "Stable" must not match "table", "armored" must not match
// "armor", "bark_armor_teach" context must not count (it is not an
// added line).
function addedJsHasNoLeverIdentifiers(commit) {
  const diff = execSync('git diff ' + commit + '^ ' + commit + ' -- src/js', { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  const added = diff.split('\n').filter(function (ln) { return ln.startsWith('+') && !ln.startsWith('+++'); }).join('\n');
  const res = [/\bkcal\b/, /\bdamage\b/, /\barmor\b/, /spawnMonster/, /foodYield/, /spoilage/, /\bstanding\b/, /\btable\b/, /wave5/, /Wave 5/, /deedGate/];
  return res.every(function (re) { return !re.test(added); });
}

(async () => {
  // ---- 1. Pick 1 identity ----
  T.section('1. Pick 1 identity — objAskCompanion overwrite stop 1e03b3d69');
  T.ok('pick 1 commit exists', git('rev-parse ' + PICK1).length === 40, git('log -1 --format=%s ' + PICK1).slice(0, 80));
  T.ok('pick 1 full hash is 1e03b3d69480e2d57c08bd2629aeffdeee4e6f32', git('rev-parse ' + PICK1) === PICK1_FULL, git('rev-parse ' + PICK1).slice(0, 12));
  T.ok('pick 1 subject is "Stop objAskCompanion cross-person objective overwrite"',
    git('log -1 --format=%s ' + PICK1) === 'Stop objAskCompanion cross-person objective overwrite', git('log -1 --format=%s ' + PICK1).slice(0, 80));
  T.ok('pick 1 first parent is 03436c1bc (Believed pantry/cistern, family 15D first commit)',
    git('rev-parse ' + PICK1 + '^') === FIRST1, git('log -1 --format=%h\\ %s ' + PICK1 + '^').slice(0, 80));
  const jsFiles1 = git('diff --name-only ' + PICK1 + '^ ' + PICK1 + ' -- src/js').split('\n').sort();
  T.ok('pick 1 touches exactly the 1 expected src/js file', JSON.stringify(jsFiles1) === JSON.stringify(['src/js/villager-objectives.js']), jsFiles1.join(', '));
  const objStat1 = git('diff --numstat ' + PICK1 + '^ ' + PICK1 + ' -- src/js/villager-objectives.js');
  T.ok('pick 1 villager-objectives.js is +70/-14', objStat1 === '70\t14\tsrc/js/villager-objectives.js', objStat1);
  const testStat1 = git('diff --numstat ' + PICK1 + '^ ' + PICK1 + ' -- scripts/test-companion-objective-overwrite.js');
  T.ok('pick 1 test file is +294/-0 (new test)', testStat1 === '294\t0\tscripts/test-companion-objective-overwrite.js', testStat1);
  const polFiles1 = git('diff --name-only ' + PICK1 + '^ ' + PICK1 + ' -- scripts/policies');
  T.ok('pick 1 touches no policy file', polFiles1 === '', polFiles1 || '(none)');
  T.ok('pick 1 does not touch standing.js', git('diff --name-only ' + PICK1 + '^ ' + PICK1 + ' -- src/js/standing.js') === '', '(absent)');
  const total1 = numstatTotal(PICK1);
  T.ok('pick 1 total is 7 files, +389/-20', total1.files === 7 && total1.ins === 389 && total1.del === 20,
    total1.files + ' files, +' + total1.ins + '/-' + total1.del);
  const allFiles1 = git('diff --name-only ' + PICK1 + '^ ' + PICK1).split('\n').sort();
  T.ok('pick 1 file list matches the prereg',
    JSON.stringify(allFiles1) === JSON.stringify(['docs/ONTOLOGY.md', 'scripts/green-list.txt', 'scripts/test-companion-objective-overwrite.js', 'scripts/test-motivation-wire.js', 'scripts/test-raid-danger-heard.js', 'scripts/test-sick-stayhome-gates-20261022.js', 'src/js/villager-objectives.js']),
    allFiles1.join(', '));
  T.ok('pick 1 first parent has 7 objAskCompanion occurrences (function exists on the origin line)',
    grepCount(FIRST1, 'objAskCompanion', 'src/js/villager-objectives.js') === 7, 'count=7');
  T.ok('far end has 6 objAskCompanion occurrences (function exists at the far end)',
    grepCount(FAR, 'objAskCompanion', 'src/js/villager-objectives.js') === 6, 'count=6');

  // ---- 2. Pick 2 identity ----
  T.section('2. Pick 2 identity — OVE-54 companionScore unify 8bb704423');
  T.ok('pick 2 commit exists', git('rev-parse ' + PICK2).length === 40, git('log -1 --format=%s ' + PICK2).slice(0, 80));
  T.ok('pick 2 full hash is 8bb7044231d17aaca8efcbbdfd9c1904ecc77dc9', git('rev-parse ' + PICK2) === PICK2_FULL, git('rev-parse ' + PICK2).slice(0, 12));
  T.ok('pick 2 subject is "OVE-54: unify companionScore across door, party, favor-company"',
    git('log -1 --format=%s ' + PICK2) === 'OVE-54: unify companionScore across door, party, favor-company', git('log -1 --format=%s ' + PICK2).slice(0, 80));
  T.ok('pick 2 first parent is a1567198c (OVE-55 social rates screen)',
    git('rev-parse ' + PICK2 + '^') === FIRST2, git('log -1 --format=%h\\ %s ' + PICK2 + '^').slice(0, 80));
  const jsFiles2 = git('diff --name-only ' + PICK2 + '^ ' + PICK2 + ' -- src/js').split('\n').sort();
  T.ok('pick 2 touches exactly the 5 expected src/js files',
    JSON.stringify(jsFiles2) === JSON.stringify(['src/js/companion-score.js', 'src/js/favor-company.js', 'src/js/villager-brain.js', 'src/js/villager-objectives.js', 'src/js/win-plan.js']),
    jsFiles2.join(', '));
  T.ok('pick 2 companion-score.js is +103/-0 (new file)',
    git('diff --numstat ' + PICK2 + '^ ' + PICK2 + ' -- src/js/companion-score.js') === '103\t0\tsrc/js/companion-score.js',
    git('diff --numstat ' + PICK2 + '^ ' + PICK2 + ' -- src/js/companion-score.js'));
  T.ok('pick 2 favor-company.js is +26/-2',
    git('diff --numstat ' + PICK2 + '^ ' + PICK2 + ' -- src/js/favor-company.js') === '26\t2\tsrc/js/favor-company.js',
    git('diff --numstat ' + PICK2 + '^ ' + PICK2 + ' -- src/js/favor-company.js'));
  T.ok('pick 2 villager-brain.js is +12/-1',
    git('diff --numstat ' + PICK2 + '^ ' + PICK2 + ' -- src/js/villager-brain.js') === '12\t1\tsrc/js/villager-brain.js',
    git('diff --numstat ' + PICK2 + '^ ' + PICK2 + ' -- src/js/villager-brain.js'));
  T.ok('pick 2 villager-objectives.js is +19/-12',
    git('diff --numstat ' + PICK2 + '^ ' + PICK2 + ' -- src/js/villager-objectives.js') === '19\t12\tsrc/js/villager-objectives.js',
    git('diff --numstat ' + PICK2 + '^ ' + PICK2 + ' -- src/js/villager-objectives.js'));
  T.ok('pick 2 win-plan.js is +12/-1',
    git('diff --numstat ' + PICK2 + '^ ' + PICK2 + ' -- src/js/win-plan.js') === '12\t1\tsrc/js/win-plan.js',
    git('diff --numstat ' + PICK2 + '^ ' + PICK2 + ' -- src/js/win-plan.js'));
  const polFiles2 = git('diff --name-only ' + PICK2 + '^ ' + PICK2 + ' -- scripts/policies');
  T.ok('pick 2 touches no policy file', polFiles2 === '', polFiles2 || '(none)');
  T.ok('pick 2 does not touch standing.js', git('diff --name-only ' + PICK2 + '^ ' + PICK2 + ' -- src/js/standing.js') === '', '(absent)');
  const total2 = numstatTotal(PICK2);
  T.ok('pick 2 total is 14 files, +5757/-28', total2.files === 14 && total2.ins === 5757 && total2.del === 28,
    total2.files + ' files, +' + total2.ins + '/-' + total2.del);
  const evLines2 = git('diff --numstat ' + PICK2 + '^ ' + PICK2 + ' -- evidence/2026-11-08/phone-companion-frame-736-r1.json evidence/2026-11-08/phone-companion-frame-844-r1.json');
  T.ok('pick 2 evidence JSON payload is 2556 + 2689 lines (phone-frame receipts)',
    evLines2.indexOf('2556\t0') !== -1 && evLines2.indexOf('2689\t0') !== -1, evLines2.replace(/\n/g, '; '));
  T.ok('pick 2 index.html adds the companion-score.js script tag',
    git('diff ' + PICK2 + '^ ' + PICK2 + ' -- index.html').indexOf('src/js/companion-score.js') !== -1, 'script tag present');
  const farStanding = sha256(gitShow(FAR, 'src/js/standing.js'));
  T.ok('far-end native standing.js sha is 75762cb2...', farStanding.startsWith('75762cb2'), farStanding.slice(0, 12));
  T.ok('fix standing.js sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  const farPolicy = sha256(gitShow(FAR, 'scripts/policies/competent.js'));
  T.ok('far-end policy sha is a7ff5c51...', farPolicy.startsWith('a7ff5c51'), farPolicy.slice(0, 12));
  let farBrain = '';
  try { farBrain = git('ls-tree ' + FAR + ' -- src/js/villager-brain.js'); } catch (e) { farBrain = ''; }
  T.ok('far-end villager-brain.js ABSENT (added on the origin line after the far end)', farBrain === '', '(absent)');
  let farComp = '';
  try { farComp = git('ls-tree ' + FAR + ' -- src/js/companion-score.js'); } catch (e) { farComp = ''; }
  T.ok('far-end companion-score.js ABSENT (created by pick 2)', farComp === '', '(absent)');
  let farRaid = '';
  try { farRaid = git('ls-tree ' + FAR + ' -- scripts/test-raid-danger-heard.js'); } catch (e) { farRaid = ''; }
  T.ok('far-end test-raid-danger-heard.js ABSENT (deleted on the local line)', farRaid === '', '(absent)');

  // ---- 3. Pick 3 identity ----
  T.section('3. Pick 3 identity — OVE-54 PR-URL evidence note 134a3d0ab');
  T.ok('pick 3 commit exists', git('rev-parse ' + PICK3).length === 40, git('log -1 --format=%s ' + PICK3).slice(0, 80));
  T.ok('pick 3 full hash is 134a3d0ab161d4dcf96616c3bcf4940d6a5dd2fc', git('rev-parse ' + PICK3) === PICK3_FULL, git('rev-parse ' + PICK3).slice(0, 12));
  T.ok('pick 3 subject is "OVE-54: record PR URL in companionScore evidence"',
    git('log -1 --format=%s ' + PICK3) === 'OVE-54: record PR URL in companionScore evidence', git('log -1 --format=%s ' + PICK3).slice(0, 80));
  T.ok('pick 3 first parent IS pick 2 (8bb704423)', git('rev-parse ' + PICK3 + '^') === FIRST3, git('rev-parse ' + PICK3 + '^').slice(0, 12));
  const allFiles3 = git('diff --name-only ' + PICK3 + '^ ' + PICK3).split('\n').filter(Boolean);
  T.ok('pick 3 touches exactly 1 file (evidence only)',
    JSON.stringify(allFiles3) === JSON.stringify(['evidence/2026-11-08/companion-score-unify.md']), allFiles3.join(', '));
  T.ok('pick 3 evidence file is +2/-1',
    git('diff --numstat ' + PICK3 + '^ ' + PICK3) === '2\t1\tevidence/2026-11-08/companion-score-unify.md',
    git('diff --numstat ' + PICK3 + '^ ' + PICK3));
  T.ok('pick 3 touches no src/js file', git('diff --name-only ' + PICK3 + '^ ' + PICK3 + ' -- src/js') === '', '(none)');
  // Pick order in the origin first-parent chain (oldest first).
  const chain = git('log --format=%h --first-parent d229b58f5..a628aeaf3').split('\n');
  T.ok('pick order is oldest-first 1e03b3d69 -> 8bb704423 -> 134a3d0ab in the origin chain',
    chain.indexOf(PICK1) > chain.indexOf(PICK2) && chain.indexOf(PICK2) > chain.indexOf(PICK3),
    'positions ' + chain.indexOf(PICK1) + ' > ' + chain.indexOf(PICK2) + ' > ' + chain.indexOf(PICK3));

  // ---- 4. Merge-tree pre-check predictions ----
  T.section('4. Merge-tree pre-check — PICK 1 PREDICTED CONFLICT, picks 2/3 sequence BLOCKED');
  const mt1 = mergeTree(FIRST1, FAR, PICK1);
  T.ok('pick 1 merge-tree rc=1 (conflict)', mt1.rc === 1, 'rc=' + mt1.rc);
  T.ok('pick 1 merge-tree tree is fc9266a7…', mt1.tree === TREE_PICK1, mt1.tree.slice(0, 12));
  T.ok('pick 1 merge-tree conflicts EXACTLY the 4 prereg files',
    JSON.stringify(mt1.conflicted) === JSON.stringify(PICK1_CONFLICTS.slice().sort()),
    mt1.conflicted.join(', '));
  T.ok('pick 1 merge-tree conflicts a src/js file (game code — the STOP clause will fire on the live pick)',
    mt1.conflicted.indexOf('src/js/villager-objectives.js') !== -1, 'villager-objectives.js in conflict');
  T.ok('pick 1 merge-tree reports the test-raid-danger-heard.js modify/delete',
    mt1.raw.indexOf('scripts/test-raid-danger-heard.js deleted in 203a32775') !== -1, 'modify/delete present');
  T.ok('pick 1 merge-tree reports the villager-objectives.js content conflict',
    mt1.raw.indexOf('CONFLICT (content): Merge conflict in src/js/villager-objectives.js') !== -1, 'content conflict present');
  // Picks 2/3 sequence predictions are BLOCKED: there is no clean
  // pick-1 tree to use as "ours". The prereg records this; the
  // supplementary direct-against-far-end predictions are re-runnable.
  const mt2far = mergeTree(FIRST2, FAR, PICK2);
  T.ok('supplementary pick-2-vs-far-end merge-tree rc=1 (conflict)', mt2far.rc === 1, 'rc=' + mt2far.rc);
  T.ok('supplementary pick-2-vs-far-end conflicts EXACTLY the 6 prereg files',
    JSON.stringify(mt2far.conflicted) === JSON.stringify(PICK2_FAR_CONFLICTS.slice().sort()),
    mt2far.conflicted.join(', '));
  T.ok('supplementary pick-2-vs-far-end reports villager-brain.js modify/delete (file absent at the far end)',
    mt2far.raw.indexOf('src/js/villager-brain.js deleted in 203a32775') !== -1, 'modify/delete present');
  const mt3far = mergeTree(FIRST3, FAR, PICK3);
  T.ok('supplementary pick-3-vs-far-end merge-tree rc=1 (conflict)', mt3far.rc === 1, 'rc=' + mt3far.rc);
  T.ok('supplementary pick-3-vs-far-end conflicts EXACTLY the 1 prereg file',
    JSON.stringify(mt3far.conflicted) === JSON.stringify(PICK3_FAR_CONFLICTS.slice().sort()),
    mt3far.conflicted.join(', '));
  T.ok('supplementary pick-3-vs-far-end reports the evidence-file modify/delete (file absent at the far end)',
    mt3far.raw.indexOf('evidence/2026-11-08/companion-score-unify.md deleted in 203a32775') !== -1, 'modify/delete present');

  // ---- 5. Family content ----
  T.section('5. Family content — companion coherence only, no numeric/economy/combat change');
  const pick1Obj = gitShow(PICK1, 'src/js/villager-objectives.js');
  T.ok('pick 1 adds objCommitGuardOffer (companion self-commit)',
    pick1Obj.indexOf('objCommitGuardOffer(cid, offer)') !== -1, 'objCommitGuardOffer present');
  T.ok('pick 1 objAskCompanion routes through npcInviteDecision (kind lure)',
    pick1Obj.indexOf("kind: 'lure'") !== -1 && pick1Obj.indexOf('npcInviteDecision') !== -1, 'invite arbiter present');
  T.ok('pick 1 records the companion_no_cross_write rule in the header',
    pick1Obj.indexOf('companion_no_cross_write') !== -1, 'rule comment present');
  const pick1Test = gitShow(PICK1, 'scripts/test-companion-objective-overwrite.js');
  T.ok('pick 1 test asserts refuse -> overwrite count 0 and ask returns null',
    pick1Test.indexOf('overwrite count 0') !== -1 || pick1Test.indexOf('overwriteCount') !== -1, 'refuse assertion present');
  const pick2Comp = gitShow(PICK2, 'src/js/companion-score.js');
  T.ok('pick 2 companion-score.js defines companionScore + companionRank',
    pick2Comp.indexOf('function companionScore(') !== -1 && pick2Comp.indexOf('function companionRank(') !== -1, 'both functions present');
  T.ok('pick 2 companion-score.js states the pure-read rule (no Math.random, no writes)',
    pick2Comp.indexOf('companion_no_rng') !== -1 && pick2Comp.indexOf('no Math.random, no writes') !== -1, 'pure-read rule present');
  const pick2Test = gitShow(PICK2, 'scripts/godpath/test-companion-score-unify.js');
  T.ok('pick 2 test asserts door/party/company rankings identical',
    pick2Test.indexOf('identical') !== -1, 'identical-rankings assertion present');
  T.ok('pick 1 added js lines carry no lever identifier (word-boundary scan)',
    addedJsHasNoLeverIdentifiers(PICK1), 'no kcal/damage/armor/spawn/spoilage/standing/table/wave/deedGate in added lines');
  T.ok('pick 2 added js lines carry no lever identifier (word-boundary scan)',
    addedJsHasNoLeverIdentifiers(PICK2), 'no kcal/damage/armor/spawn/spoilage/standing/table/wave/deedGate in added lines');

  // ---- 6. Verdict mapping ----
  T.section('6. Verdict mapping — group thresholds + conflict rule');
  const table = [[0, 'CARRIER'], [1, 'CARRIER'], [2, 'AMBIGUOUS'], [3, 'NOT-CARRIER'], [4, 'NOT-CARRIER'], [8, 'NOT-CARRIER'], [-1, 'UNCLASSIFIABLE'], [9, 'UNCLASSIFIABLE'], [NaN, 'UNCLASSIFIABLE']];
  for (const pair of table) {
    T.ok('survived ' + pair[0] + ' -> ' + pair[1], classifyTransplant(pair[0]) === pair[1], classifyTransplant(pair[0]));
  }
  T.ok('conflict rule: no conflict -> NO-CONFLICT', conflictStop([]) === 'NO-CONFLICT', conflictStop([]));
  T.ok('conflict rule: one src/js file -> UNMEASURED', conflictStop(['src/js/villager-objectives.js']) === 'UNMEASURED', conflictStop(['src/js/villager-objectives.js']));
  T.ok('conflict rule: one tooling file -> UNMEASURED (no narrowed re-run by this arm)',
    conflictStop(['scripts/balance-proof.json']) === 'UNMEASURED', conflictStop(['scripts/balance-proof.json']));
  T.ok('conflict rule: the predicted pick-1 set (4 files incl. game code) -> UNMEASURED',
    conflictStop(PICK1_CONFLICTS) === 'UNMEASURED', conflictStop(PICK1_CONFLICTS));

  // ---- 7. Prereg recorded in the evidence file ----
  T.section('7. Prereg recorded in the evidence file');
  const evPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15b-prereg.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('prereg file exists', ev.length > 0, evPath);
  T.ok('prereg names pick 1e03b3d69', ev.indexOf('1e03b3d69') !== -1, 'pick 1 present');
  T.ok('prereg names pick 8bb704423', ev.indexOf('8bb704423') !== -1, 'pick 2 present');
  T.ok('prereg names pick 134a3d0ab', ev.indexOf('134a3d0ab') !== -1, 'pick 3 present');
  T.ok('prereg names the far end 203a32775', ev.indexOf('203a32775') !== -1, 'far end present');
  T.ok('prereg names the band 190391-190398', ev.indexOf('190391') !== -1 && ev.indexOf('190398') !== -1, 'band present');
  T.ok('prereg names the STEP id t15b-companion', ev.indexOf('t15b-companion') !== -1, 'STEP present');
  T.ok('prereg records the STOP clause', ev.indexOf('STOP clause') !== -1, 'STOP clause present');
  T.ok('prereg records the thresholds (CARRIER <=1/8, AMBIGUOUS 2/8, NOT-CARRIER >=3/8)',
    ev.indexOf('CARRIER') !== -1 && ev.indexOf('AMBIGUOUS') !== -1 && ev.indexOf('NOT-CARRIER') !== -1, 'thresholds present');
  T.ok('prereg records the subject branch name transplant-15b-subject', ev.indexOf('transplant-15b-subject') !== -1, 'subject branch present');
  T.ok('prereg records the predicted pick-1 conflict tree fc9266a7…',
    ev.indexOf('fc9266a7') !== -1, 'predicted tree present');
  T.ok('prereg records the pick-1 PREDICTED CONFLICT (game code included)',
    ev.indexOf('PREDICTED CONFLICT') !== -1 && ev.indexOf('GAME CODE') !== -1, 'prediction present');
  T.ok('prereg records picks 2/3 sequence predictions BLOCKED (no clean pick-1 tree)',
    ev.indexOf('BLOCKED') !== -1 && ev.indexOf('no clean pick-1 tree') !== -1, 'blocked note present');
  T.ok('prereg records the grouping-prereg authority (§15B, t15b-companion)',
    ev.indexOf('family15-grouping-prereg-2026-11-14.md') !== -1 && ev.indexOf('15B') !== -1, 'authority present');
  T.ok('prereg records the canon note (CONVERSATIONS.md covers companion/favor-company)',
    ev.indexOf('CONVERSATIONS.md') !== -1, 'canon note present');
  T.ok('prereg records the horizon 150d death-aware', ev.indexOf('150d') !== -1, 'horizon present');
  T.ok('prereg records the competent verbatim own-policy', ev.indexOf('competent') !== -1, 'policy present');
  T.ok('prereg records the far-end file inventory (villager-brain.js absent at the far end)',
    ev.indexOf('villager-brain.js ABSENT') !== -1, 'inventory present');
  T.ok('prereg records the evidence payload share (5,245 lines of phone-frame JSON)',
    ev.indexOf('5,245') !== -1, 'payload note present');

  // ---- 8. Base state ----
  // NOTE (stage 2): the subject-branch leg below was 'does NOT exist
  // yet' at the stage-1 commit and is superseded now that the subject
  // is cut and the live pick 1 conflicted — it asserts the stage-2
  // state instead (subject exists at the far end, 0 picks applied).
  // The summary/driver-log legs stay 'does NOT exist' at stage 2 as
  // well — the STOP fired before any judged sim, so no step ran and
  // no step artifacts exist. §9 records the stop itself.
  T.section('8. Base state — arm branch clean, subject not cut yet, sim not run');
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
  T.ok('HEAD is on the arm branch sim-transplant15b-a (worktree-only)', worktreeOnly(headBranch === 'sim-transplant15b-a'), 'HEAD=' + headBranch);
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
  T.ok('subject branch exists (cut after the stage-1 commit; live pick 1 conflicted, 0 picks applied)', subjectExists === true, SUBJECT_BRANCH);
  const t15bSummary = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  T.ok('step summary does NOT exist yet (no judged sim has run)', fs.existsSync(t15bSummary) === false, STEP);
  const t15bDriver = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  T.ok('step driver log does NOT exist yet (no judged sim has run)', fs.existsSync(t15bDriver) === false, STEP);

  // ---- 9. Live pick 1 conflicted — STOP, UNMEASURED (stage 2) ----
  T.section('9. Live pick 1 conflicted, STOP fired, group UNMEASURED');
  let subjectTip = null;
  try { subjectTip = git('rev-parse ' + SUBJECT_BRANCH); } catch (e) { subjectTip = null; }
  T.ok('subject branch tip is the far end 203a32775 (0 picks applied)', subjectTip === FAR_FULL, subjectTip ? subjectTip.slice(0, 12) : '(missing)');
  const aheadCount = parseInt(git('rev-list --count ' + FAR + '..' + SUBJECT_BRANCH), 10);
  T.ok('subject branch is 0 commits ahead of the far end (no pick landed)', aheadCount === 0, 'ahead=' + aheadCount);
  const subjectTree = git('rev-parse ' + SUBJECT_BRANCH + '^{tree}');
  const farTree = git('rev-parse ' + FAR + '^{tree}');
  T.ok('subject tip tree equals the far-end tree (aborted pick left no trace)', subjectTree === farTree, subjectTree.slice(0, 12));
  T.ok('the predicted pick-1 conflict set maps to UNMEASURED (conflict rule)', conflictStop(PICK1_CONFLICTS) === 'UNMEASURED', conflictStop(PICK1_CONFLICTS));
  const summaryPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  T.ok('step summary does NOT exist (no judged sim ran — the STOP fired at the live pick)', fs.existsSync(summaryPath) === false, STEP);
  const driverPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  T.ok('step driver log does NOT exist (no judged sim ran)', fs.existsSync(driverPath) === false, STEP);
  const corpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  T.ok('step corpus directory does NOT exist (no judged sim ran)', fs.existsSync(corpusDir) === false, STEP);
  // Evidence file records the stop.
  const ev15bPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15b.md');
  const ev15b = fs.existsSync(ev15bPath) ? fs.readFileSync(ev15bPath, 'utf8') : '';
  T.ok('evidence file exists', ev15b.length > 0, ev15bPath);
  T.ok('evidence file records the verdict as UNMEASURED', ev15b.indexOf('VERDICT: UNMEASURED') !== -1, 'UNMEASURED present');
  T.ok('evidence file records the STOP firing on the first live pick', ev15b.indexOf('STOP clause fired on the FIRST live pick') !== -1 || ev15b.indexOf('STOP (ground truth') !== -1, 'STOP present');
  T.ok('evidence file records the exact conflict list (UU/DU)',
    ev15b.indexOf('UU docs/ONTOLOGY.md') !== -1 && ev15b.indexOf('UU scripts/green-list.txt') !== -1 &&
    ev15b.indexOf('DU scripts/test-raid-danger-heard.js') !== -1 && ev15b.indexOf('UU src/js/villager-objectives.js') !== -1,
    'UU/DU list present');
  T.ok('evidence file records the conflict hunk line numbers (12-17, 2021-2025, 916-926)',
    ev15b.indexOf('lines 12–17') !== -1 && ev15b.indexOf('lines 2021–2025') !== -1 && ev15b.indexOf('lines 916–926') !== -1,
    'hunk lines present');
  T.ok('evidence file records the subject tip 203a32775 (0 picks)', ev15b.indexOf('203a327750a223e0a1465dc51f5409787efdfaae') !== -1, 'subject tip present');
  T.ok('evidence file records no judged sim ran (no STEP spend)',
    ev15b.indexOf('NO STEP RAN') !== -1, 'no-step note present');
  T.ok('evidence file records the flap + index-clobber repair + heartbeat block',
    ev15b.indexOf('HOST WRITE FLAP') !== -1 && ev15b.indexOf('INDEX CLOBBER') !== -1 && ev15b.indexOf('HEARTBEAT BLOCKED') !== -1,
    'infrastructure notes present');
  // Prereg-commit ancestry by MESSAGE, not hash (0608Z lesson: an
  // adoption rebase rewrites hashes).
  const logSubjects = git('log --format=%s HEAD');
  T.ok('prereg commit is an ancestor of HEAD (resolved by message, not hash)',
    logSubjects.indexOf('sim-transplant15b-a: prereg + stage-1 proof') !== -1, 'prereg message present');
  // Base restored: back on the arm branch, clean, standing.js == HEAD.
  const headBranch2 = git('rev-parse --abbrev-ref HEAD');
  T.ok('HEAD is back on the arm branch sim-transplant15b-a after the stop (worktree-only)', worktreeOnly(headBranch2 === 'sim-transplant15b-a'), 'HEAD=' + headBranch2);
  const dirtyAfter = git('status --porcelain --untracked-files=no');
  // The stop left no residue: the ONLY tracked modifications allowed
  // here are this proof file itself (the stage-2 §9 edit) and the
  // evidence file (written after the stop), both uncommitted until
  // this proof passes. Standing/scratch/conflict residue would show
  // as any other line.
  const dirtyOther = dirtyAfter.split('\n').filter(function (ln) {
    return ln && ln.indexOf('scripts/test-transplant15b.js') === -1 && ln.indexOf('evidence/2026-11-14/sim-transplant15b.md') === -1;
  }).join('\n');
  T.ok('tracked tree is clean after the stop apart from this proof file + the evidence file (the stage-2 edits)', dirtyOther === '', dirtyOther.slice(0, 200) || '(only the two stage-2 files)');
  const onDiskStanding2 = sha256(fs.readFileSync(path.join(REPO, 'src', 'js', 'standing.js'), 'utf8'));
  const headStanding2 = sha256(gitShow('HEAD', 'src/js/standing.js'));
  T.ok('on-disk standing.js is byte-identical to HEAD (no swap ever happened)', onDiskStanding2 === headStanding2, onDiskStanding2.slice(0, 12));
  let cherryPickHead = true;
  try { execSync('git rev-parse --verify CHERRY_PICK_HEAD', { cwd: REPO, stdio: 'pipe' }); } catch (e) { cherryPickHead = false; }
  T.ok('no cherry-pick is in progress (aborted after recording)', cherryPickHead === false, 'CHERRY_PICK_HEAD absent');
  T.ok('subject branch is LEFT in place at the far end (not merged, not deleted)', subjectTip === FAR_FULL, subjectTip ? subjectTip.slice(0, 12) : '(missing)');

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
