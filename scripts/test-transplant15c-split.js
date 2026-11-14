#!/usr/bin/env node
// test-transplant15c-split.js — proof test for the H1 TRANSPLANT,
// family 15C SPLIT, OVE-52 ALONE (arm sim-transplant15c-split-a).
//
// THE QUESTION (evidence/2026-11-14/sim-transplant15c-split-prereg.md,
// written and committed BEFORE the subject was cut): the group arm
// (sim-transplant15c-narrowed) read CARRIER 1/8 for OVE-49 + OVE-52
// together. OVE-49 is test-only. Measure OVE-52 alone on the far end
// 203a32775 (GOOD 4/8), same band 190391–190398, 150d death-aware,
// competent verbatim own-policy, STEP t15c-split. Verdicts (binding
// thresholds, round-2115 §3): <=1/8 CARRIER, 2/8 AMBIGUOUS (re-run
// once), >=3/8 NOT-CARRIER.
//
// STAGE 1 (this commit, with the prereg, before the subject is cut):
//   1. Binding facts — the pick is OVE-52 1c1b23482, single parent
//      748cce3b8, 6 files +511/-158, js=4, no standing.js, no policy.
//   2. Merge-tree pre-check — reproduced live: exactly one conflict,
//      modify/delete on scripts/test-fight-brain-knowledge-probe.js;
//      all four src/js files + docs/ONTOLOGY.md auto-merge clean.
//   3. Classification — the conflicted file is a TEST file, not one
//      of the three resolvable zero-src-reader tooling files, so the
//      pick is in the STOP class per the coordinator's
//      tooling-resolution rule (2026-11-14 ~10:00Z).
//   4. Prereg — carries the prediction, the thresholds, and the
//      STOP procedure before the pick.
//   5. No subject cut yet — branch transplant-15c-split-subject does
//      not exist.
// STAGE 2 (this commit, after the pick attempt — the pick STOPPED):
//   The live pick confirmed the pre-check prediction exactly
//   (modify/delete on scripts/test-fight-brain-knowledge-probe.js,
//   everything else auto-merged), the cherry-pick was aborted per
//   the coordinator's tooling-resolution rule, and the scratch
//   branch was deleted (it pointed at the bare far end — no subject
//   was cut). Stage-2 legs assert the STOP state: no subject branch,
//   no corpus, no driver log, evidence records STOPPED-BY-CONFLICT
//   with the exact conflict list, tree clean, culpritbisect-a
//   116/116. No survival verdict exists for OVE-52 alone.
//
// Usage: node scripts/test-transplant15c-split.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant15c-split');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const OVE52 = '1c1b23482a11581047af8a82cca0040ef7b162a1';
const OVE52_PARENT = '748cce3b8';
const OVE49 = '9bc88d85d7ee4c2f6d3c4c0715315f24b628e449';
const SUBJECT_BRANCH = 'transplant-15c-split-subject';
const STEP = 't15c-split';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const FAR_NATIVE_STANDING_SHA = '75762cb2259da3d4d51c57de1548404b45d8269d36a4503341507ed807540e7c';
const POLICY_SHA = 'a7ff5c516440626621a2382e378e37704c2f5c56a69c4eab30f89461503a864a';
const CONFLICT_FILE = 'scripts/test-fight-brain-knowledge-probe.js';
const RESOLVABLE_TOOLING = ['scripts/green-list.txt', 'scripts/balance-proof.json', 'scripts/phone-frame-proof.json'];
const EXPECTED_JS = ['src/js/engine/combat.js', 'src/js/fieldFights.js', 'src/js/game.js', 'src/js/villager-agency.js'];
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];

function sha256(text) { return crypto.createHash('sha256').update(text).digest('hex'); }
function git(args) { return execSync('git ' + args, { cwd: REPO }).toString().trim(); }
function gitShow(commit, file) { return execSync('git show ' + commit + ':' + file, { cwd: REPO }).toString(); }
function branchExists(name) {
  try { execSync('git rev-parse --verify --quiet ' + name, { cwd: REPO, stdio: 'pipe' }); return true; }
  catch (e) { return false; }
}
function classifyTransplant(n) {
  if (n <= 1) return 'CARRIER';
  if (n === 2) return 'AMBIGUOUS';
  if (n >= 3) return 'NOT-CARRIER';
  return 'UNCLASSIFIABLE';
}

T.section('1. Binding facts — the pick is OVE-52, single parent, js=4');
(function () {
  T.ok('pick tip is OVE-52 1c1b23482', git('rev-parse ' + OVE52) === OVE52, git('rev-parse --short ' + OVE52));
  T.ok('OVE-52 subject names fighterState', git('log -1 --format=%s ' + OVE52).indexOf('OVE-52') !== -1, git('log -1 --format=%s ' + OVE52).slice(0, 60));
  let parents;
  try { parents = git('rev-parse ' + OVE52 + '^2'); } catch (e) { parents = ''; }
  T.ok('OVE-52 has exactly one parent (no ^2)', parents === '', 'single-parent');
  T.ok('OVE-52 first parent is OVE-51 748cce3b8', git('rev-parse ' + OVE52 + '^1').indexOf(OVE52_PARENT) === 0, git('rev-parse --short ' + OVE52 + '^1'));
  const files = git('diff --name-only ' + OVE52 + '^1 ' + OVE52).split('\n').filter(Boolean).sort();
  T.ok('pick touches exactly 6 files', files.length === 6, files.join(', '));
  const jsFiles = git('diff --name-only ' + OVE52 + '^1 ' + OVE52 + ' -- src/js').split('\n').filter(Boolean).sort();
  T.ok('pick touches exactly the 4 expected src/js files', JSON.stringify(jsFiles) === JSON.stringify(EXPECTED_JS.slice().sort()), jsFiles.join(', '));
  const numstat = git('diff --numstat ' + OVE52 + '^1 ' + OVE52).split('\n').filter(Boolean)
    .reduce(function (acc, line) { const p = line.split('\t'); return { ins: acc.ins + parseInt(p[0], 10), del: acc.del + parseInt(p[1], 10) }; }, { ins: 0, del: 0 });
  T.ok('pick diff is +511/-158', numstat.ins === 511 && numstat.del === 158, '+' + numstat.ins + '/-' + numstat.del);
  T.ok('pick does not touch standing.js', git('diff --name-only ' + OVE52 + '^1 ' + OVE52 + ' -- src/js/standing.js') === '', '(absent)');
  T.ok('pick touches no policy file', git('diff --name-only ' + OVE52 + '^1 ' + OVE52 + ' -- scripts/policies') === '', '(none)');
  T.ok('far-end native standing.js sha is 75762cb2...', sha256(gitShow(FAR, 'src/js/standing.js')) === FAR_NATIVE_STANDING_SHA, FAR_NATIVE_STANDING_SHA.slice(0, 12));
  T.ok('fix file sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  T.ok('far-end policy sha is a7ff5c51...', sha256(gitShow(FAR, 'scripts/policies/competent.js')) === POLICY_SHA, POLICY_SHA.slice(0, 12));
  T.ok('OVE-49 is a different commit (not picked here)', OVE49 !== OVE52, OVE49.slice(0, 12));
  T.ok('OVE-49 is an ancestor of the pick base (its file is why the pick conflicts)', git('merge-base --is-ancestor ' + OVE49 + ' ' + OVE52_PARENT + '; echo $?') === '0', 'ancestor');
})();

T.section('2. Merge-tree pre-check — reproduced live, exactly one conflict');
(function () {
  let out = '';
  let code = 0;
  try {
    out = execSync('git merge-tree --write-tree --merge-base=' + OVE52_PARENT + ' ' + FAR + ' ' + OVE52, { cwd: REPO }).toString();
  } catch (e) {
    code = e.status;
    out = (e.stdout || '').toString();
  }
  const conflicts = out.split('\n').filter(function (l) { return l.indexOf('CONFLICT') !== -1; });
  T.ok('merge-tree exits non-zero (a conflict is predicted)', code !== 0, 'exit ' + code);
  T.ok('exactly one CONFLICT line', conflicts.length === 1, conflicts.length + ' line(s)');
  T.ok('the conflict is modify/delete on the probe test file', conflicts.length === 1 && conflicts[0].indexOf('modify/delete') !== -1 && conflicts[0].indexOf(CONFLICT_FILE) !== -1, conflicts[0] || '(none)');
  T.ok('the conflict names the far end deleting the file', conflicts.length === 1 && conflicts[0].indexOf('deleted in ' + FAR) !== -1, conflicts[0] || '(none)');
  EXPECTED_JS.forEach(function (f) {
    T.ok('no conflict on ' + f, out.indexOf('CONFLICT') === -1 || out.split('\n').filter(function (l) { return l.indexOf('CONFLICT') !== -1 && l.indexOf(f) !== -1; }).length === 0, 'clean');
  });
  T.ok('no conflict on docs/ONTOLOGY.md', out.split('\n').filter(function (l) { return l.indexOf('CONFLICT') !== -1 && l.indexOf('docs/ONTOLOGY.md') !== -1; }).length === 0, 'clean');
  T.ok('fieldFights.js / game.js / villager-agency.js auto-merge', out.indexOf('Auto-merging src/js/fieldFights.js') !== -1 && out.indexOf('Auto-merging src/js/game.js') !== -1 && out.indexOf('Auto-merging src/js/villager-agency.js') !== -1, 'auto-merged');
  // Why the conflict exists: the file was created by OVE-49 on the
  // origin line and never existed on the master line.
  let atBase = true, atFar = true, atMergeBase = true;
  try { execSync('git cat-file -e ' + OVE52_PARENT + ':' + CONFLICT_FILE, { cwd: REPO, stdio: 'pipe' }); } catch (e) { atBase = false; }
  try { execSync('git cat-file -e ' + FAR + ':' + CONFLICT_FILE, { cwd: REPO, stdio: 'pipe' }); } catch (e) { atFar = false; }
  try { execSync('git cat-file -e d229b58f5:' + CONFLICT_FILE, { cwd: REPO, stdio: 'pipe' }); } catch (e) { atMergeBase = false; }
  T.ok('probe test exists at the pick base', atBase === true, 'exists at 748cce3b8');
  T.ok('probe test is absent at the far end', atFar === false, 'absent at 203a32775');
  T.ok('probe test is absent at the merge-base', atMergeBase === false, 'absent at d229b58f5');
  const creators = git('log --diff-filter=A --first-parent --format=%H d229b58f5..a628aeaf3 -- ' + CONFLICT_FILE).split('\n').filter(Boolean);
  T.ok('exactly one origin commit created the probe test, and it is OVE-49', creators.length === 1 && creators[0] === OVE49, creators.map(function (c) { return c.slice(0, 12); }).join(', '));
})();

T.section('3. Classification — test-file conflict is STOP class, not resolvable');
(function () {
  T.ok('conflicted file is a test file', CONFLICT_FILE.indexOf('scripts/test-') === 0, CONFLICT_FILE);
  T.ok('conflicted file is NOT one of the three resolvable tooling files', RESOLVABLE_TOOLING.indexOf(CONFLICT_FILE) === -1, 'not in ' + RESOLVABLE_TOOLING.join(', '));
  const cases = [[0, 'CARRIER'], [1, 'CARRIER'], [2, 'AMBIGUOUS'], [3, 'NOT-CARRIER'], [4, 'NOT-CARRIER'], [8, 'NOT-CARRIER']];
  cases.forEach(function (pair) {
    T.ok('survived ' + pair[0] + ' -> ' + pair[1], classifyTransplant(pair[0]) === pair[1], classifyTransplant(pair[0]));
  });
})();

T.section('4. Prereg — prediction, thresholds, and STOP procedure recorded first');
(function () {
  const pre = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15c-split-prereg.md'), 'utf8');
  T.ok('prereg says it was written before the subject was cut', pre.indexOf('written and committed BEFORE the subject was cut') !== -1, 'pre-cut statement present');
  T.ok('prereg records the merge-tree prediction', pre.indexOf('CONFLICT (modify/delete)') !== -1 && pre.indexOf(CONFLICT_FILE) !== -1, 'prediction present');
  T.ok('prereg predicts the STOP outcome', pre.indexOf('Predicted outcome of the live pick: STOP') !== -1, 'STOP prediction present');
  T.ok('prereg carries the binding thresholds', pre.indexOf('≤1/8 CARRIER') !== -1 && pre.indexOf('≥3/8 NOT-CARRIER') !== -1 && pre.indexOf('2/8 AMBIGUOUS') !== -1, 'thresholds present');
  T.ok('prereg names STEP t15c-split and the 8 seeds', pre.indexOf(STEP) !== -1 && SEEDS.every(function (s) { return pre.indexOf(String(s)) !== -1; }), 'STEP + seeds present');
  T.ok('prereg forbids a narrowed re-run decided by this arm', pre.indexOf('no narrowed re-run decided by this arm') !== -1, 'no-narrowed-decision present');
  T.ok('prereg records the subject branch name', pre.indexOf(SUBJECT_BRANCH) !== -1, SUBJECT_BRANCH);
})();

T.section('5. STOP state — no subject, no step, no corpus (stage 2)');
(function () {
  T.ok('subject branch does not exist (deleted after the abort)', branchExists(SUBJECT_BRANCH) === false, 'absent');
  T.ok('no t15c-split corpus exists (no step ran)', fs.existsSync(path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-t15c-split')) === false, 'absent');
  T.ok('no t15c-split driver log exists', fs.existsSync(path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-t15c-split-driver.log')) === false, 'absent');
  const ev = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15c-split.md'), 'utf8');
  T.ok('evidence states STOPPED-BY-CONFLICT', ev.indexOf('Verdict: STOPPED-BY-CONFLICT') !== -1, 'STOPPED-BY-CONFLICT present');
  T.ok('evidence records the exact conflict list (one file)', ev.indexOf('Exact conflict list') !== -1 && ev.indexOf(CONFLICT_FILE) !== -1 && ev.indexOf('one file only') !== -1, 'conflict list present');
  T.ok('evidence records the pick was aborted per the rule', ev.indexOf('git cherry-pick --abort') !== -1 && ev.indexOf('no hand-resolution') !== -1, 'abort recorded');
  T.ok('evidence records the subject branch was deleted', ev.indexOf('was deleted') !== -1 && ev.indexOf('no subject branch') !== -1, 'deletion recorded');
  T.ok('evidence states there is no CARRIER / NOT-CARRIER read', ev.indexOf('no CARRIER / NOT-CARRIER read') !== -1, 'no-verdict statement present');
  T.ok('evidence records the safe-commit index clobber + repair', ev.indexOf('Safe-commit index clobber') !== -1 && ev.indexOf('git ls-tree -r') !== -1, 'clobber recorded');
  const pre = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15c-split-prereg.md'), 'utf8');
  T.ok('prereg prediction matches the observed pick conflict', pre.indexOf('deleted in 203a32775 and modified in 1c1b23482') !== -1 && ev.indexOf('deleted in HEAD and modified in 1c1b23482') !== -1, 'prediction == observation');
  T.ok('evidence records no narrowed re-run decided by this arm', ev.indexOf('That is a coordinator') !== -1 && ev.indexOf('not this arm') !== -1, 'coordinator-decides recorded');
})();

T.section('6. Closeout — tree clean, no game code, culpritbisect-a green');
(function () {
  T.ok('on-disk standing.js equals HEAD blob', fs.readFileSync(path.join(REPO, 'src', 'js', 'standing.js'), 'utf8') === gitShow('HEAD', 'src/js/standing.js'), 'byte-identical to HEAD');
  T.ok('no src/js file differs from HEAD', git('status --short -- src/js') === '', git('status --short -- src/js') || '(clean)');
  T.ok('tracked tree is clean', git('status --porcelain --untracked-files=no') === '', git('status --porcelain --untracked-files=no') || '(clean)');
  const ev = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15c-split.md'), 'utf8');
  T.ok('evidence records culpritbisect-a 116/116', ev.indexOf('116 passed, 0 failed') !== -1, '116/116 present');
  T.ok('evidence records telemetry N/A (no corpus)', ev.indexOf('Telemetry deviation check: N/A') !== -1, 'telemetry N/A present');
  T.ok('evidence carries the Blooded check forward unmeasured', ev.indexOf('Not measured') !== -1 && ev.indexOf('Blooded beat vs end-state') !== -1, 'Blooded carried forward');
})();

T.done();
