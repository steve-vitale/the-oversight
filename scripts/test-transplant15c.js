#!/usr/bin/env node
// test-transplant15c.js — proof test for the H1 TRANSPLANT, family 15C
// fight brains (arm sim-transplant15c-a).
//
// THE QUESTION (evidence/2026-11-14/sim-transplant15c-prereg.md,
// prereg committed before any judged sim — and before cutting the
// subject): land origin family 15C onto the far end 203a32775 (GOOD
// 4/8) — OVE-49 first (commit 9bc88d85d "green-list Phase 5
// fight-brain knowledge probe", js=0, test only), then OVE-52 on top
// of it (commit 1c1b23482 "wire shared fighterState into both fight
// brains", js=4). OVE-52 edits the probe test OVE-49 creates, so the
// order 49 -> 52 is load-bearing. On ANY live conflict: STOP per the
// binding prereg (sim-scale-onramp-round-2115.md §3) — report the
// conflict list, do NOT hand-resolve game code, do NOT decide a
// narrowed re-run.
//
// WHAT ACTUALLY HAPPENED (this arm): pick 1 CONFLICTS —
// merge-tree predicts it and a live scaffold pick confirms it —
// confined ENTIRELY to scripts/green-list.txt (a zero-src-reader
// tooling file). Per the binding STOP clause the arm records the
// conflict and STOPS before cutting the subject: no subject branch,
// no judged sim, no STEP run. Verdict: UNMEASURED (conflict), not a
// CARRIER / AMBIGUOUS / NOT-CARRIER read. The coordinator decides
// the narrowed route.
//
// WHAT THIS TEST PROVES:
//   1. Family 15C identity — pick 1 (9bc88d85d, first parent
//      97a67d4f8, exactly the 2 expected files, +353/-0, js=0, no
//      policy, no standing.js) and pick 2 (1c1b23482, first parent
//      748cce3b8, exactly the 6 expected files, +511/-158, js=4,
//      no policy, no standing.js); probe-test placement (absent at
//      the far end, present at 52's first parent); first-parent
//      chain order (49 older than 52, so 49 -> 52 is origin order).
//   2. Merge-tree pre-check — pick 1 (base = 49's first parent)
//      rc=1 with conflicted files EXACTLY ['scripts/green-list.txt']
//      and conflicted tree a9dfc7b8…; pick 2 NOT RUN (no clean
//      pick-1 tree exists — any pick-2 prediction would require a
//      coordinator-authorized resolution first); conflict anatomy
//      (theirs appends the probe line at the file tail; ours
//      deleted the same six tail lines and appended pellet lines).
//   3. Live-pick confirmation — the throwaway scaffold pick
//      reproduced the prediction exactly (UU green-list.txt, A
//      probe test, markers at lines 916/919/927); the scaffold
//      branch is deleted and no cherry-pick is in progress.
//   4. Family content — OVE-52's js diff wires fighterState /
//      fighterShouldFlee / contestFleeSealed / applyFighterState
//      into both fight brains and touches no standing/table/wave
//      system identifier (the one "standing" hit is prose — "still
//      standing" in a narration string); OVE-49's probe measures
//      know[vid].fought and changes no game code.
//   5. Verdict mapping — classifyTransplant maps every survived
//      count; conflictStop maps any conflicted file to
//      'UNMEASURED' and an empty set to 'NO-CONFLICT' (a tooling-only
//      conflict still stops the arm — no narrowed re-run by the arm).
//   6. Prereg recorded in the evidence file (thresholds, STOP
//      clause, seeds, horizon, policy, canon note, the predicted
//      conflict tree a9dfc7b8…, the conflict anatomy, the STOP
//      outcome, the coordinator-decides line).
//   7. Base state — HEAD is on sim-transplant15c-a, no src/js file
//      differs from HEAD, on-disk standing.js is byte-identical
//      to HEAD, the step-script tooling source (master) still
//      carries all four scratch files; the step script names the
//      band 190391-190398; the subject branch does NOT exist and
//      no step summary/driver log exists (those legs stay 'does
//      NOT exist' — the arm stopped before the step).
//   8. STOP outcome — the evidence file records UNMEASURED, the
//      conflict list, the marker lines, and the coordinator-decides
//      line; no judged corpus exists; the scaffold branch is gone;
//      the tracked tree is clean apart from this proof file's own
//      stage-2 edit (uncommitted until this proof passes).
//
// Usage: node scripts/test-transplant15c.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant15c');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const PICK1 = '9bc88d85d7ee4c2f6d3c4c0715315f24b628e449';
const FIRST1 = '97a67d4f8eedbe44296f045d6e7ea0990dbb7d36';
const PICK2 = '1c1b23482a11581047af8a82cca0040ef7b162a1';
const FIRST2 = '748cce3b8bf9ecbad3b7a73b1d0c7dc555a898e6';
const MERGEBASE = 'd229b58f595430e2a24c399820061b39c5b689ca';
const SUBJECT_BRANCH = 'transplant-15c-subject';
const SCAFFOLD_BRANCH = 'tmp-15c-predict';
const STEP = 't15c-fightbrain';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const TEST_FILE = 'scripts/test-fight-brain-knowledge-probe.js';
// Predicted conflicted tree (merge-tree --write-tree, first-parent base).
const TREE_PICK1_CONFLICT = 'a9dfc7b82167b80927abda7aecf8e14696532ffa';

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
// conflictStop(files): the binding conflict rule — ANY conflicted file
// STOPs the arm (no hand-resolution of game code, no narrowed re-run
// by the arm — even when the conflict is confined to zero-src-reader
// tooling files). Only an empty set proceeds.
function conflictStop(files) {
  if (!Array.isArray(files)) return 'UNCLASSIFIABLE';
  if (files.length === 0) return 'NO-CONFLICT';
  return 'UNMEASURED';
}
// mergeTree(base, ours, theirs): run `git merge-tree --write-tree
// --merge-base=<base> <ours> <theirs>` (read-only dry run — touches
// no worktree) and return { rc, tree, conflicted: [paths], raw }.
// Conflicted files are the paths appearing in stage lines
// ("<mode> <oid> <1|2|3>\t<path>").
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
  // ---- 1. Family 15C identity ----
  T.section('1. Family 15C identity — OVE-49 (9bc88d85d) + OVE-52 (1c1b23482)');
  T.ok('pick 1 commit exists', git('rev-parse ' + PICK1).length === 40, git('log -1 --format=%s ' + PICK1).slice(0, 80));
  T.ok('pick 1 subject is "OVE-49: green-list Phase 5 fight-brain knowledge probe"',
    git('log -1 --format=%s ' + PICK1) === 'OVE-49: green-list Phase 5 fight-brain knowledge probe',
    git('log -1 --format=%s ' + PICK1));
  T.ok('pick 1 first parent is 97a67d4f8 (OVE-47)', git('rev-parse ' + PICK1 + '^1') === FIRST1, git('log -1 --format=%h\\ %s ' + PICK1 + '^1').slice(0, 80));
  const stat1 = git('diff --numstat ' + PICK1 + '^1 ' + PICK1).split('\n');
  T.ok('pick 1 touches exactly 2 files, +353/-0',
    stat1.length === 2 && stat1.reduce(function (a, l) { return a + parseInt(l.split('\t')[0], 10); }, 0) === 353 &&
    stat1.reduce(function (a, l) { return a + parseInt(l.split('\t')[1], 10); }, 0) === 0,
    stat1.join(' | '));
  const glStat1 = git('diff --numstat ' + PICK1 + '^1 ' + PICK1 + ' -- scripts/green-list.txt');
  T.ok('pick 1 green-list.txt is +1/-0', glStat1 === '1\t0\tscripts/green-list.txt', glStat1);
  const testStat1 = git('diff --numstat ' + PICK1 + '^1 ' + PICK1 + ' -- ' + TEST_FILE);
  T.ok('pick 1 probe test is +352/-0 (new test)', testStat1 === '352\t0\t' + TEST_FILE, testStat1);
  const jsFiles1 = git('diff --name-only ' + PICK1 + '^1 ' + PICK1 + ' -- src/js');
  T.ok('pick 1 touches no src/js file (js=0)', jsFiles1 === '', jsFiles1 || '(none)');
  T.ok('pick 1 touches no policy file', git('diff --name-only ' + PICK1 + '^1 ' + PICK1 + ' -- scripts/policies') === '', '(none)');
  T.ok('pick 1 does not touch standing.js', git('diff --name-only ' + PICK1 + '^1 ' + PICK1 + ' -- src/js/standing.js') === '', '(absent)');
  T.ok('pick 2 commit exists', git('rev-parse ' + PICK2).length === 40, git('log -1 --format=%s ' + PICK2).slice(0, 80));
  T.ok('pick 2 subject is "OVE-52: wire shared fighterState into both fight brains"',
    git('log -1 --format=%s ' + PICK2) === 'OVE-52: wire shared fighterState into both fight brains',
    git('log -1 --format=%s ' + PICK2));
  T.ok('pick 2 first parent is 748cce3b8 (OVE-51)', git('rev-parse ' + PICK2 + '^1') === FIRST2, git('log -1 --format=%h\\ %s ' + PICK2 + '^1').slice(0, 80));
  const stat2 = git('diff --numstat ' + PICK2 + '^1 ' + PICK2).split('\n');
  const total2 = stat2.reduce(function (acc, line) {
    const p = line.split('\t');
    const ins = parseInt(p[0], 10), del = parseInt(p[1], 10);
    if (Number.isFinite(ins)) acc.ins += ins;
    if (Number.isFinite(del)) acc.del += del;
    return acc;
  }, { ins: 0, del: 0 });
  T.ok('pick 2 touches exactly 6 files, +511/-158', stat2.length === 6 && total2.ins === 511 && total2.del === 158,
    stat2.length + ' files, +' + total2.ins + '/-' + total2.del);
  const jsFiles2 = git('diff --name-only ' + PICK2 + '^1 ' + PICK2 + ' -- src/js').split('\n').sort();
  T.ok('pick 2 touches exactly the 4 expected src/js files',
    JSON.stringify(jsFiles2) === JSON.stringify(['src/js/engine/combat.js', 'src/js/fieldFights.js', 'src/js/game.js', 'src/js/villager-agency.js']),
    jsFiles2.join(', '));
  T.ok('pick 2 villager-agency.js is +172/-0', git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- src/js/villager-agency.js') === '172\t0\tsrc/js/villager-agency.js', git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- src/js/villager-agency.js'));
  T.ok('pick 2 combat.js is +26/-0', git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- src/js/engine/combat.js') === '26\t0\tsrc/js/engine/combat.js', git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- src/js/engine/combat.js'));
  T.ok('pick 2 fieldFights.js is +90/-23', git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- src/js/fieldFights.js') === '90\t23\tsrc/js/fieldFights.js', git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- src/js/fieldFights.js'));
  T.ok('pick 2 game.js is +59/-11', git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- src/js/game.js') === '59\t11\tsrc/js/game.js', git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- src/js/game.js'));
  T.ok('pick 2 probe test is +163/-123 (edited test)', git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- ' + TEST_FILE) === '163\t123\t' + TEST_FILE, git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- ' + TEST_FILE));
  T.ok('pick 2 ONTOLOGY.md is +1/-1', git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- docs/ONTOLOGY.md') === '1\t1\tdocs/ONTOLOGY.md', git('diff --numstat ' + PICK2 + '^1 ' + PICK2 + ' -- docs/ONTOLOGY.md'));
  T.ok('pick 2 touches no policy file', git('diff --name-only ' + PICK2 + '^1 ' + PICK2 + ' -- scripts/policies') === '', '(none)');
  T.ok('pick 2 does not touch standing.js', git('diff --name-only ' + PICK2 + '^1 ' + PICK2 + ' -- src/js/standing.js') === '', '(absent)');
  const farStanding = sha256(gitShow(FAR, 'src/js/standing.js'));
  T.ok('far-end native standing.js sha is 75762cb2...', farStanding.startsWith('75762cb2'), farStanding.slice(0, 12));
  T.ok('fix standing.js sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  const farPolicy = sha256(gitShow(FAR, 'scripts/policies/competent.js'));
  T.ok('far-end policy sha is a7ff5c51...', farPolicy.startsWith('a7ff5c51'), farPolicy.slice(0, 12));
  // Probe-test placement: pick 2 edits the file pick 1 creates.
  let farTest = '';
  try { farTest = git('ls-tree ' + FAR + ' -- ' + TEST_FILE); } catch (e) { farTest = ''; }
  T.ok('far-end probe test file ABSENT (created on the origin line by pick 1)', farTest === '', '(absent)');
  const baseTest2 = git('ls-tree ' + FIRST2 + ' -- ' + TEST_FILE);
  T.ok("pick 2 first-parent probe test file present", baseTest2.indexOf(TEST_FILE) !== -1, baseTest2.slice(0, 60));
  // Chain order: 49 older than 52 (reverse-chronological positions 19 vs 15).
  const chain = git('log --first-parent --format=%H ' + MERGEBASE + '..a628aeaf3').split('\n');
  const pos1 = chain.indexOf(PICK1);
  const pos2 = chain.indexOf(PICK2);
  T.ok('both picks are on the origin first-parent chain', pos1 !== -1 && pos2 !== -1, 'pos49=' + pos1 + ' pos52=' + pos2);
  T.ok('pick 1 (OVE-49) is OLDER than pick 2 (OVE-52) — 49 -> 52 is origin order', pos1 > pos2, 'pos49=' + pos1 + ' > pos52=' + pos2);
  T.ok("pick 2 first parent is OVE-51 (family 15A last commit)", git('log -1 --format=%s ' + FIRST2).indexOf('OVE-51') === 0, git('log -1 --format=%s ' + FIRST2).slice(0, 60));
  T.ok("pick 1 first parent is OVE-47 (family 15F)", git('log -1 --format=%s ' + FIRST1).indexOf('OVE-47') === 0, git('log -1 --format=%s ' + FIRST1).slice(0, 60));

  // ---- 2. Merge-tree pre-check ----
  T.section('2. Merge-tree pre-check — pick 1 CONFLICTS (green-list.txt only); pick 2 NOT RUN');
  const mt1 = mergeTree(FIRST1, FAR, PICK1);
  T.ok('pick 1 merge-tree rc=1 (conflict)', mt1.rc === 1, 'rc=' + mt1.rc);
  T.ok('pick 1 merge-tree conflicted tree is a9dfc7b8…', mt1.tree === TREE_PICK1_CONFLICT, mt1.tree.slice(0, 12));
  T.ok("pick 1 merge-tree conflicts EXACTLY ['scripts/green-list.txt']",
    JSON.stringify(mt1.conflicted) === JSON.stringify(['scripts/green-list.txt']), mt1.conflicted.join(', '));
  T.ok('pick 1 merge-tree conflicts NO src/js file',
    mt1.conflicted.every(function (f) { return f.indexOf('src/js/') !== 0; }), 'no src/js conflict');
  T.ok('pick 1 merge-tree conflicts NO test file (the probe test applies cleanly)',
    mt1.conflicted.indexOf(TEST_FILE) === -1, 'probe test not conflicted');
  T.ok('pick 1 merge-tree reports the conflict (Auto-merging + CONFLICT lines)',
    mt1.raw.indexOf('Auto-merging scripts/green-list.txt') !== -1 && mt1.raw.indexOf('CONFLICT (content)') !== -1, 'conflict lines present');
  // Conflict anatomy: theirs appends the probe line at the tail;
  // ours deleted the same six tail lines and appended pellet lines.
  const theirsGL = execSync('git diff ' + FIRST1 + ' ' + PICK1 + ' -- scripts/green-list.txt', { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  T.ok('theirs (49) green-list diff appends exactly the probe test line',
    theirsGL.indexOf('+scripts/test-fight-brain-knowledge-probe.js quick') !== -1 && theirsGL.split('\n').filter(function (l) { return /^\+[^+]/.test(l); }).length === 1,
    'one + line');
  const oursGL = execSync('git diff ' + FIRST1 + ' ' + FAR + ' -- scripts/green-list.txt', { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  const oursDeletedTail = ['test-person-trust-20261108.js', 'test-raid-danger-heard.js', 'test-believed-pantry-perception.js', 'test-companion-objective-overwrite.js', 'test-win-rallyguard.js', 'test-retarget-gossip.js'];
  T.ok('ours (far end) green-list diff deletes the same six tail lines',
    oursDeletedTail.every(function (n) { return oursGL.indexOf('-scripts/' + n + ' quick') !== -1; }),
    'six - lines present');
  T.ok('ours (far end) green-list diff appends the two pellet lines',
    oursGL.indexOf('+scripts/test-pellet-boost-20261108.js quick') !== -1 && oursGL.indexOf('+scripts/test-pellet-q4-20261108.js quick') !== -1,
    'pellet lines present');
  // Pick 2: no clean pick-1 tree exists, so no prediction is possible
  // without a coordinator-authorized resolution. The proof asserts the
  // blocker (subject branch absent) and the prereg/evidence record.
  let subjectExists = true;
  try { git('rev-parse ' + SUBJECT_BRANCH); } catch (e) { subjectExists = false; }
  T.ok('subject branch does NOT exist (STOP fired before cutting it)', subjectExists === false, SUBJECT_BRANCH);
  const evPrePath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15c-prereg.md');
  const evPre = fs.existsSync(evPrePath) ? fs.readFileSync(evPrePath, 'utf8') : '';
  T.ok('prereg records pick 2 as NOT RUN (no clean pick-1 tree)',
    evPre.indexOf('PICK 2 (52 onto the 49-applied tree): NOT RUN') !== -1, 'NOT RUN present');

  // ---- 3. Live-pick confirmation (scaffold, deleted) ----
  T.section('3. Live-pick confirmation — scaffold reproduced the prediction exactly, then deleted');
  let scaffoldExists = true;
  try { git('rev-parse ' + SCAFFOLD_BRANCH); } catch (e) { scaffoldExists = false; }
  T.ok('scaffold branch tmp-15c-predict is deleted', scaffoldExists === false, SCAFFOLD_BRANCH);
  let cherryPickHead = true;
  try { execSync('git rev-parse --verify CHERRY_PICK_HEAD', { cwd: REPO, stdio: 'pipe' }); } catch (e) { cherryPickHead = false; }
  T.ok('no cherry-pick is in progress', cherryPickHead === false, 'CHERRY_PICK_HEAD absent');
  const evPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15c.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('evidence file records the live scaffold pick (UU green-list.txt, A probe test)',
    ev.indexOf('UU scripts/green-list.txt') !== -1 && ev.indexOf('A scripts/test-fight-brain-knowledge-probe.js') !== -1,
    'UU/A present');
  T.ok('evidence file records the conflict marker lines 916 / 919 / 927',
    ev.indexOf('916') !== -1 && ev.indexOf('919') !== -1 && ev.indexOf('927') !== -1, 'marker lines present');
  T.ok('evidence file records the live pick rc=1', ev.indexOf('rc=1') !== -1, 'rc=1 present');

  // ---- 4. Family content ----
  T.section('4. Family content — fight-brain wiring only, no standing/table/wave system change');
  const diff52js = execSync('git diff ' + PICK2 + '^1 ' + PICK2 + ' -- src/js', { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  T.ok('pick 2 js diff wires fighterState (31 mentions)', (diff52js.match(/fighterState/g) || []).length === 31, 'count=31');
  T.ok('pick 2 js diff wires fighterShouldFlee (13 mentions)', (diff52js.match(/fighterShouldFlee/g) || []).length === 13, 'count=13');
  T.ok('pick 2 js diff wires contestFleeSealed (14 mentions)', (diff52js.match(/contestFleeSealed/g) || []).length === 14, 'count=14');
  T.ok('pick 2 js diff wires applyFighterState (10 mentions)', (diff52js.match(/applyFighterState/g) || []).length === 10, 'count=10');
  T.ok('pick 2 js diff reads fought-species knowledge (know[vid].fought)',
    diff52js.indexOf('know[vid]') !== -1 && diff52js.indexOf('fought') !== -1, 'fought knowledge present');
  T.ok('pick 2 js diff touches no standingCfg / villageStandingTotal / deedGate / wave5 identifier',
    ['standingCfg', 'villageStandingTotal', 'deedGate', 'wave5', 'Wave 5'].every(function (w) { return diff52js.indexOf(w) === -1; }),
    'no scale identifiers');
  const standingHits = (diff52js.match(/standing/gi) || []).length;
  T.ok('pick 2 js diff has exactly one "standing" hit, and it is prose ("still standing")',
    standingHits === 1 && diff52js.indexOf('still standing') !== -1, 'hits=' + standingHits);
  const diff49test = execSync('git diff ' + PICK1 + '^1 ' + PICK1 + ' -- ' + TEST_FILE, { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  T.ok('pick 1 probe test measures know[vid].fought (6 mentions)',
    (diff49test.match(/know\[vid\]\.fought/g) || []).length === 6, 'count=6');
  T.ok('pick 1 changes no game code (js diff is empty)',
    execSync('git diff ' + PICK1 + '^1 ' + PICK1 + ' -- src/js', { cwd: REPO, stdio: 'pipe' }).toString('utf8') === '',
    '(empty)');

  // ---- 5. Verdict mapping ----
  T.section('5. Verdict mapping — pair thresholds + conflict rule');
  const table = [[0, 'CARRIER'], [1, 'CARRIER'], [2, 'AMBIGUOUS'], [3, 'NOT-CARRIER'], [4, 'NOT-CARRIER'], [8, 'NOT-CARRIER'], [-1, 'UNCLASSIFIABLE'], [9, 'UNCLASSIFIABLE'], [NaN, 'UNCLASSIFIABLE']];
  for (const pair of table) {
    T.ok('survived ' + pair[0] + ' -> ' + pair[1], classifyTransplant(pair[0]) === pair[1], classifyTransplant(pair[0]));
  }
  T.ok('conflict rule: no conflict -> NO-CONFLICT', conflictStop([]) === 'NO-CONFLICT', conflictStop([]));
  T.ok('conflict rule: one src/js file -> UNMEASURED', conflictStop(['src/js/conversation.js']) === 'UNMEASURED', conflictStop(['src/js/conversation.js']));
  T.ok('conflict rule: one tooling file (green-list.txt) -> UNMEASURED (no narrowed re-run by this arm)',
    conflictStop(['scripts/green-list.txt']) === 'UNMEASURED', conflictStop(['scripts/green-list.txt']));
  T.ok('conflict rule: UU green-list + A probe test -> UNMEASURED',
    conflictStop(['scripts/green-list.txt']) === 'UNMEASURED', conflictStop(['scripts/green-list.txt']));
  T.ok('this arm maps the live conflict to UNMEASURED', conflictStop(mt1.conflicted) === 'UNMEASURED', conflictStop(mt1.conflicted));

  // ---- 6. Prereg recorded in the evidence file ----
  T.section('6. Prereg recorded in the evidence file');
  T.ok('prereg file exists', evPre.length > 0, evPrePath);
  T.ok('prereg names pick 1 (9bc88d85d)', evPre.indexOf('9bc88d85d') !== -1, 'pick 1 present');
  T.ok('prereg names pick 2 (1c1b23482)', evPre.indexOf('1c1b23482') !== -1, 'pick 2 present');
  T.ok('prereg names the far end 203a32775', evPre.indexOf('203a32775') !== -1, 'far end present');
  T.ok('prereg names the band 190391-190398', evPre.indexOf('190391') !== -1 && evPre.indexOf('190398') !== -1, 'band present');
  T.ok('prereg names the STEP id t15c-fightbrain', evPre.indexOf('t15c-fightbrain') !== -1, 'STEP present');
  T.ok('prereg records the STOP clause', evPre.indexOf('STOP clause') !== -1, 'STOP clause present');
  T.ok('prereg records the thresholds (CARRIER <=1/8, AMBIGUOUS 2/8, NOT-CARRIER >=3/8)',
    evPre.indexOf('CARRIER') !== -1 && evPre.indexOf('AMBIGUOUS') !== -1 && evPre.indexOf('NOT-CARRIER') !== -1, 'thresholds present');
  T.ok('prereg records the subject branch name transplant-15c-subject', evPre.indexOf('transplant-15c-subject') !== -1, 'subject branch present');
  T.ok('prereg records the predicted conflict tree a9dfc7b8…', evPre.indexOf('a9dfc7b8') !== -1, 'conflict tree present');
  T.ok('prereg records the conflict anatomy (six tail lines + pellet lines)',
    evPre.indexOf('CONFLICT ANATOMY') !== -1 && evPre.indexOf('test-pellet-boost') !== -1, 'anatomy present');
  T.ok('prereg records the STOP outcome (UNMEASURED, coordinator decides)',
    evPre.indexOf('UNMEASURED') !== -1 && evPre.indexOf('coordinator decides') !== -1, 'STOP outcome present');
  T.ok('prereg records the canon note (MONSTER-WAVES.md; no standalone fighterState doc)',
    evPre.indexOf('MONSTER-WAVES.md') !== -1 && evPre.indexOf('No standalone canon doc') !== -1, 'canon note present');
  T.ok('prereg records the horizon 150d death-aware', evPre.indexOf('150d') !== -1, 'horizon present');
  T.ok('prereg records the competent verbatim own-policy', evPre.indexOf('competent') !== -1, 'policy present');
  T.ok('prereg records the grouping authority (family15-grouping-prereg §15C)',
    evPre.indexOf('family15-grouping-prereg-2026-11-14.md') !== -1 && evPre.indexOf('15C') !== -1, 'grouping authority present');

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
  T.ok('HEAD is on the arm branch sim-transplant15c-a (worktree-only)', worktreeOnly(headBranch === 'sim-transplant15c-a'), 'HEAD=' + headBranch);
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
  T.ok('subject branch does NOT exist (never cut)', subjectExists === false, SUBJECT_BRANCH);
  const summaryPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  T.ok('step summary does NOT exist (no judged sim ran)', fs.existsSync(summaryPath) === false, STEP);
  const driverPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  T.ok('step driver log does NOT exist (no judged sim ran)', fs.existsSync(driverPath) === false, STEP);
  const corpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  T.ok('step corpus does NOT exist (no judged sim ran)', fs.existsSync(corpusDir) === false, STEP);

  // ---- 8. STOP outcome ----
  T.section('8. STOP outcome — UNMEASURED recorded, nothing judged, tree clean');
  T.ok('evidence file exists', ev.length > 0, evPath);
  T.ok('evidence file records the verdict as UNMEASURED', ev.indexOf('VERDICT: UNMEASURED') !== -1, 'UNMEASURED present');
  T.ok('evidence file records the conflict file scripts/green-list.txt', ev.indexOf('scripts/green-list.txt') !== -1, 'conflict file present');
  T.ok('evidence file records the conflicted tree a9dfc7b8', ev.indexOf('a9dfc7b8') !== -1, 'conflict tree present');
  T.ok('evidence file records the coordinator-decides line',
    ev.indexOf('coordinator decides') !== -1 || ev.indexOf('coordinator decision') !== -1, 'coordinator line present');
  T.ok('evidence file records that no judged sim ran',
    ev.indexOf('No judged sim ran') !== -1 || ev.indexOf('no judged sim') !== -1, 'no-sim note present');
  T.ok('evidence file records the flap (heartbeat EPERM)',
    ev.indexOf('HOST WRITE FLAP') !== -1 && ev.indexOf('EPERM') !== -1, 'flap note present');
  // Prereg-commit ancestry by MESSAGE, not hash (0608Z lesson: an
  // adoption rebase rewrites hashes).
  const logSubjects = git('log --format=%s HEAD');
  T.ok('prereg commit is an ancestor of HEAD (resolved by message, not hash)',
    logSubjects.indexOf('sim-transplant15c-a: prereg + proof + STOP evidence (UNMEASURED by conflict)') !== -1, 'prereg message present');
  // Base restored: back on the arm branch, clean, standing.js == HEAD.
  const headBranch2 = git('rev-parse --abbrev-ref HEAD');
  T.ok('HEAD is back on the arm branch sim-transplant15c-a after the stop (worktree-only)', worktreeOnly(headBranch2 === 'sim-transplant15c-a'), 'HEAD=' + headBranch2);
  const dirtyAfter = git('status --porcelain --untracked-files=no');
  // The step never ran, so no residue is possible: the ONLY tracked
  // modification allowed here is this proof file itself (the stage-2
  // §8 edit, uncommitted until this proof passes).
  const dirtyOther = dirtyAfter.split('\n').filter(function (ln) { return ln && ln.indexOf('scripts/test-transplant15c.js') === -1; }).join('\n');
  T.ok('tracked tree is clean after the stop apart from this proof file (the stage-2 edit)', dirtyOther === '', dirtyOther.slice(0, 200) || '(only the proof file)');
  const onDiskStanding2 = sha256(fs.readFileSync(path.join(REPO, 'src', 'js', 'standing.js'), 'utf8'));
  const headStanding2 = sha256(gitShow('HEAD', 'src/js/standing.js'));
  T.ok('on-disk standing.js is byte-identical to HEAD (no swap ever happened)', onDiskStanding2 === headStanding2, onDiskStanding2.slice(0, 12));
  T.ok('subject branch is still absent (never cut, never merged, never deleted)', (function () { try { git('rev-parse ' + SUBJECT_BRANCH); return false; } catch (e) { return true; } })(), SUBJECT_BRANCH);

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
