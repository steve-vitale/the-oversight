#!/usr/bin/env node
// test-transplant15c-js.js — proof test for the H1 TRANSPLANT,
// family 15C NARROWED JS-ONLY SPLIT, OVE-52 js hunks alone
// (arm sim-transplant15c-js-a).
//
// THE QUESTION (evidence/2026-11-14/sim-transplant15c-js-prereg.md,
// written and committed BEFORE the subject was cut): the group arm
// (sim-transplant15c-narrowed) read CARRIER 1/8 for OVE-49 + OVE-52
// together. OVE-49 is test-only. The split arm
// (sim-transplant15c-split) could not measure OVE-52 alone: its
// cherry-pick conflicts modify/delete on the probe-test refresh, a
// test-file conflict in the STOP class. Coordinator decision 1 in
// evidence/2026-11-14/sim-transplant-round-1355.md routes the
// narrowed split next: pick OVE-52's js hunks only, dropping its
// refresh of the probe test (and, per this arm's brief, its
// docs/ONTOLOGY.md hunk — js only). Measure OVE-52's game code
// ALONE on the far end 203a32775 (GOOD 4/8), same band 190391–
// 190398, 150d death-aware, competent verbatim own-policy, STEP
// t15c-split-js. Verdicts (binding thresholds, round-2115 §3):
// <=1/8 CARRIER, 2/8 AMBIGUOUS (re-run once; a per-seed-identical
// re-run records AMBIGUOUS, deterministic re-runs are vacuous),
// >=3/8 NOT-CARRIER.
//
// STAGE 1 (this commit, with the prereg, before the subject is cut):
//   1. Binding facts — the pick is OVE-52, single parent, 6 files
//      +511/-158, js=4 with exact numstat, no standing.js, no policy.
//   2. Merge-tree pre-check — reproduced live: exactly one conflict,
//      modify/delete on scripts/test-fight-brain-knowledge-probe.js;
//      all four src/js files + docs/ONTOLOGY.md auto-merge clean.
//   3. Drops + classification — the conflicted file is the
//      pre-authorized drop-1 file and ONTOLOGY is the pre-authorized
//      drop-2 file; any OTHER conflict is STOP class per the
//      coordinator's tooling-resolution rule.
//   4. Prereg — carries the prediction, the thresholds, the exact
//      subject-construction method with both drops, and the STOP
//      procedure before the pick.
//   5. No subject cut yet — branch transplant-15c-split-js-subject
//      does not exist.
// STAGE 2 (added after the pick + step — see the evidence file):
//   subject identity (js diff equals the pick's js diff exactly;
//   probe test absent at subject as at far end; ONTOLOGY
//   byte-identical to far end), STEP verdict, evidence records.
//
// Usage: node scripts/test-transplant15c-js.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant15c-js');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const OVE52 = '1c1b23482a11581047af8a82cca0040ef7b162a1';
const OVE52_PARENT = '748cce3b8';
const OVE49 = '9bc88d85d7ee4c2f6d3c4c0715315f24b628e449';
const SUBJECT_BRANCH = 'transplant-15c-split-js-subject';
const STEP = 't15c-split-js';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const FAR_NATIVE_STANDING_SHA = '75762cb2259da3d4d51c57de1548404b45d8269d36a4503341507ed807540e7c';
const POLICY_SHA = 'a7ff5c516440626621a2382e378e37704c2f5c56a69c4eab30f89461503a864a';
const PROBE_FILE = 'scripts/test-fight-brain-knowledge-probe.js';
const ONTOLOGY_FILE = 'docs/ONTOLOGY.md';
const RESOLVABLE_TOOLING = ['scripts/green-list.txt', 'scripts/balance-proof.json', 'scripts/phone-frame-proof.json'];
const EXPECTED_JS = ['src/js/engine/combat.js', 'src/js/fieldFights.js', 'src/js/game.js', 'src/js/villager-agency.js'];
const EXPECTED_JS_NUMSTAT = {
  'src/js/engine/combat.js': [26, 0],
  'src/js/fieldFights.js': [90, 23],
  'src/js/game.js': [59, 11],
  'src/js/villager-agency.js': [172, 0]
};
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];

function sha256(text) { return crypto.createHash('sha256').update(text).digest('hex'); }
function git(args) { return execSync('git ' + args, { cwd: REPO }).toString().trim(); }
function gitShow(commit, file) { return execSync('git show ' + commit + ':' + file, { cwd: REPO }).toString(); }
function branchExists(name) {
  try { execSync('git rev-parse --verify --quiet ' + name, { cwd: REPO, stdio: 'pipe' }); return true; }
  catch (e) { return false; }
}
function fileExistsAt(commit, file) {
  try { execSync('git cat-file -e ' + commit + ':' + file, { cwd: REPO, stdio: 'pipe' }); return true; }
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
  const jsNumstat = {};
  git('diff --numstat ' + OVE52 + '^1 ' + OVE52 + ' -- src/js').split('\n').filter(Boolean).forEach(function (line) {
    const p = line.split('\t'); jsNumstat[p[2]] = [parseInt(p[0], 10), parseInt(p[1], 10)];
  });
  Object.keys(EXPECTED_JS_NUMSTAT).forEach(function (f) {
    const want = EXPECTED_JS_NUMSTAT[f];
    const got = jsNumstat[f] || [-1, -1];
    T.ok('js numstat ' + f + ' is +' + want[0] + '/-' + want[1], got[0] === want[0] && got[1] === want[1], '+' + got[0] + '/-' + got[1]);
  });
  const jsTotals = Object.keys(EXPECTED_JS_NUMSTAT).reduce(function (a, f) { return [a[0] + EXPECTED_JS_NUMSTAT[f][0], a[1] + EXPECTED_JS_NUMSTAT[f][1]]; }, [0, 0]);
  T.ok('js-only total is +347/-34', jsTotals[0] === 347 && jsTotals[1] === 34, '+' + jsTotals[0] + '/-' + jsTotals[1]);
  T.ok('pick does not touch standing.js', git('diff --name-only ' + OVE52 + '^1 ' + OVE52 + ' -- src/js/standing.js') === '', '(absent)');
  T.ok('pick touches no policy file', git('diff --name-only ' + OVE52 + '^1 ' + OVE52 + ' -- scripts/policies') === '', '(none)');
  T.ok('ONTOLOGY hunk is the 1-line Provides refresh', git('diff --numstat ' + OVE52 + '^1 ' + OVE52 + ' -- ' + ONTOLOGY_FILE).indexOf('1\t1\t') === 0, git('diff --numstat ' + OVE52 + '^1 ' + OVE52 + ' -- ' + ONTOLOGY_FILE));
  T.ok('probe-test refresh is +163/-123', git('diff --numstat ' + OVE52 + '^1 ' + OVE52 + ' -- ' + PROBE_FILE).indexOf('163\t123\t') === 0, git('diff --numstat ' + OVE52 + '^1 ' + OVE52 + ' -- ' + PROBE_FILE));
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
  T.ok('merge-tree result hash matches the split arm prediction 4a315a99...', out.split('\n')[0] === '4a315a997194d3fb45d0e79aa7c52d1e7e42e53b', out.split('\n')[0]);
  T.ok('exactly one CONFLICT line', conflicts.length === 1, conflicts.length + ' line(s)');
  T.ok('the conflict is modify/delete on the probe test file', conflicts.length === 1 && conflicts[0].indexOf('modify/delete') !== -1 && conflicts[0].indexOf(PROBE_FILE) !== -1, conflicts[0] || '(none)');
  T.ok('the conflict names the far end deleting the file', conflicts.length === 1 && conflicts[0].indexOf('deleted in ' + FAR) !== -1, conflicts[0] || '(none)');
  EXPECTED_JS.forEach(function (f) {
    T.ok('no conflict on ' + f, out.split('\n').filter(function (l) { return l.indexOf('CONFLICT') !== -1 && l.indexOf(f) !== -1; }).length === 0, 'clean');
  });
  T.ok('no conflict on docs/ONTOLOGY.md', out.split('\n').filter(function (l) { return l.indexOf('CONFLICT') !== -1 && l.indexOf(ONTOLOGY_FILE) !== -1; }).length === 0, 'clean');
  T.ok('fieldFights.js / game.js / villager-agency.js auto-merge', out.indexOf('Auto-merging src/js/fieldFights.js') !== -1 && out.indexOf('Auto-merging src/js/game.js') !== -1 && out.indexOf('Auto-merging src/js/villager-agency.js') !== -1, 'auto-merged');
  T.ok('ONTOLOGY.md auto-merges', out.indexOf('Auto-merging docs/ONTOLOGY.md') !== -1, 'auto-merged');
  T.ok('probe test exists at the pick base', fileExistsAt(OVE52_PARENT, PROBE_FILE) === true, 'exists at 748cce3b8');
  T.ok('probe test is absent at the far end', fileExistsAt(FAR, PROBE_FILE) === false, 'absent at 203a32775');
  T.ok('probe test is absent at the merge-base', fileExistsAt('d229b58f5', PROBE_FILE) === false, 'absent at d229b58f5');
  const creators = git('log --diff-filter=A --first-parent --format=%H d229b58f5..a628aeaf3 -- ' + PROBE_FILE).split('\n').filter(Boolean);
  T.ok('exactly one origin commit created the probe test, and it is OVE-49', creators.length === 1 && creators[0] === OVE49, creators.map(function (c) { return c.slice(0, 12); }).join(', '));
})();

T.section('3. Drops + classification — both drops pre-authorized, anything else is STOP');
(function () {
  T.ok('drop-1 file is a test file (scripts/test-*)', PROBE_FILE.indexOf('scripts/test-') === 0, PROBE_FILE);
  T.ok('drop-1 file is NOT one of the three resolvable tooling files', RESOLVABLE_TOOLING.indexOf(PROBE_FILE) === -1, 'not resolvable-tooling');
  T.ok('drop-2 file is docs/ONTOLOGY.md (js-only brief)', ONTOLOGY_FILE === 'docs/ONTOLOGY.md', ONTOLOGY_FILE);
  T.ok('drop-2 file is NOT one of the three resolvable tooling files', RESOLVABLE_TOOLING.indexOf(ONTOLOGY_FILE) === -1, 'not resolvable-tooling');
  T.ok('drop-2 file is NOT a src/js file', ONTOLOGY_FILE.indexOf('src/js') !== 0, 'docs only');
  const cases = [[0, 'CARRIER'], [1, 'CARRIER'], [2, 'AMBIGUOUS'], [3, 'NOT-CARRIER'], [4, 'NOT-CARRIER'], [8, 'NOT-CARRIER']];
  cases.forEach(function (pair) {
    T.ok('survived ' + pair[0] + ' -> ' + pair[1], classifyTransplant(pair[0]) === pair[1], classifyTransplant(pair[0]));
  });
})();

T.section('4. Prereg — prediction, thresholds, construction method, STOP procedure');
(function () {
  const pre = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15c-js-prereg.md'), 'utf8');
  T.ok('prereg says it was written before the subject was cut', pre.indexOf('written and committed BEFORE the subject was cut') !== -1, 'pre-cut statement present');
  T.ok('prereg records the merge-tree prediction', pre.indexOf('CONFLICT (modify/delete)') !== -1 && pre.indexOf(PROBE_FILE) !== -1, 'prediction present');
  T.ok('prereg records the result-tree hash 4a315a99...', pre.indexOf('4a315a997194d3fb45d0e79aa7c52d1e7e42e53b') !== -1, 'tree hash present');
  T.ok('prereg carries the binding thresholds', pre.indexOf('≤1/8 CARRIER') !== -1 && pre.indexOf('≥3/8 NOT-CARRIER') !== -1 && pre.indexOf('2/8 AMBIGUOUS') !== -1, 'thresholds present');
  T.ok('prereg names STEP t15c-split-js and the 8 seeds', pre.indexOf(STEP) !== -1 && SEEDS.every(function (s) { return pre.indexOf(String(s)) !== -1; }), 'STEP + seeds present');
  T.ok('prereg states the exact subject-construction method', pre.indexOf('Subject-construction method (exact') !== -1 && pre.indexOf('git cherry-pick -n 1c1b23482') !== -1, 'method present');
  T.ok('prereg declares drop 1 (probe test, git rm)', pre.indexOf('Pre-authorized drop 1 (probe test)') !== -1 && pre.indexOf('git rm scripts/test-fight-brain-knowledge-probe.js') !== -1, 'drop 1 declared');
  T.ok('prereg declares drop 2 (ONTOLOGY, checkout HEAD)', pre.indexOf('Pre-authorized drop 2 (ONTOLOGY)') !== -1 && pre.indexOf('git checkout HEAD -- docs/ONTOLOGY.md') !== -1, 'drop 2 declared');
  T.ok('prereg states the js-only verification (diff equality +347/-34)', pre.indexOf('+347/−34') !== -1 && pre.indexOf('EXACTLY equal to') !== -1, 'verification stated');
  T.ok('prereg states the STOP rule for any other conflict', pre.indexOf('If the live pick conflicts on any file') !== -1 && pre.indexOf('the arm STOPS') !== -1, 'STOP rule present');
  T.ok('prereg records the deterministic re-run caveat', pre.indexOf('deterministic re-runs are') !== -1 && pre.indexOf('vacuous') !== -1, 're-run caveat present');
  T.ok('prereg records the subject branch name', pre.indexOf(SUBJECT_BRANCH) !== -1, SUBJECT_BRANCH);
  T.ok('prereg records the STEP-script hazard (/tmp copy)', pre.indexOf('Copy') !== -1 && pre.indexOf('culpritbisect-step.sh') !== -1 && pre.indexOf('/tmp') !== -1, 'hazard recorded');
})();

T.section('5. No subject cut yet (stage 1)');
(function () {
  T.ok('subject branch does not exist yet', branchExists(SUBJECT_BRANCH) === false, 'absent');
  T.ok('no t15c-split-js corpus exists (no step ran)', fs.existsSync(path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-t15c-split-js')) === false, 'absent');
  T.ok('no t15c-split-js driver log exists', fs.existsSync(path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-t15c-split-js-driver.log')) === false, 'absent');
})();

T.section('6. Subject identity — js-only, verified (stage 2)');
(function () {
  const SUBJ = 'd56206f70e53f909c7271a776ecce4dad07a3cf4';
  const SUBJ_TREE = '009173473853d4dd5a33cb9448fd256b95a351aa';
  T.ok('subject branch exists (left in place)', branchExists(SUBJECT_BRANCH) === true, SUBJECT_BRANCH);
  T.ok('subject hash is d56206f7...', git('rev-parse ' + SUBJECT_BRANCH) === SUBJ, git('rev-parse --short ' + SUBJECT_BRANCH));
  T.ok('subject parent is the far end', git('rev-parse ' + SUBJECT_BRANCH + '^1') === FAR_FULL, git('rev-parse --short ' + SUBJECT_BRANCH + '^1'));
  T.ok('subject has exactly one parent', (function () { try { git('rev-parse ' + SUBJECT_BRANCH + '^2'); return false; } catch (e) { return true; } })(), 'single-parent');
  T.ok('subject tree is 00917347...', git('rev-parse ' + SUBJECT_BRANCH + '^{tree}') === SUBJ_TREE, SUBJ_TREE.slice(0, 8));
  const subjNumstat = {};
  git('diff --numstat ' + FAR + ' ' + SUBJECT_BRANCH + ' -- src/js').split('\n').filter(Boolean).forEach(function (line) {
    const p = line.split('\t'); subjNumstat[p[2]] = [parseInt(p[0], 10), parseInt(p[1], 10)];
  });
  Object.keys(EXPECTED_JS_NUMSTAT).forEach(function (f) {
    const want = EXPECTED_JS_NUMSTAT[f];
    const got = subjNumstat[f] || [-1, -1];
    T.ok('subject numstat ' + f + ' equals the pick (+' + want[0] + '/-' + want[1] + ')', got[0] === want[0] && got[1] === want[1], '+' + got[0] + '/-' + got[1]);
  });
  // Content-line identity (the prereg's "exactly equal" leg, corrected:
  // raw diff text differs only in hunk headers — line numbers and base
  // blob hashes — so compare the added/removed content lines, in order).
  const contentA = execSync('git diff ' + FAR + ' ' + SUBJECT_BRANCH + ' -- src/js | grep \'^[+-][^+-]\'', { cwd: REPO }).toString();
  const contentB = execSync('git diff ' + OVE52_PARENT + ' ' + OVE52 + ' -- src/js | grep \'^[+-][^+-]\'', { cwd: REPO }).toString();
  T.ok('subject js content lines equal the pick js content lines (370 lines)', contentA === contentB && contentA.split('\n').filter(Boolean).length === 370, contentA.split('\n').filter(Boolean).length + ' lines');
  const statFiles = git('diff --name-only ' + FAR + ' ' + SUBJECT_BRANCH).split('\n').filter(Boolean).sort();
  T.ok('subject stat names ONLY the 4 src/js files', JSON.stringify(statFiles) === JSON.stringify(EXPECTED_JS.slice().sort()), statFiles.join(', '));
  const subjTotals = git('diff --numstat ' + FAR + ' ' + SUBJECT_BRANCH).split('\n').filter(Boolean)
    .reduce(function (acc, line) { const p = line.split('\t'); return { ins: acc.ins + parseInt(p[0], 10), del: acc.del + parseInt(p[1], 10) }; }, { ins: 0, del: 0 });
  T.ok('subject total is +347/-34', subjTotals.ins === 347 && subjTotals.del === 34, '+' + subjTotals.ins + '/-' + subjTotals.del);
  T.ok('probe test is absent at the subject', fileExistsAt(SUBJECT_BRANCH, PROBE_FILE) === false, 'absent');
  T.ok('ONTOLOGY at the subject is byte-identical to the far end', git('diff ' + FAR + ' ' + SUBJECT_BRANCH + ' -- ' + ONTOLOGY_FILE) === '', '(empty diff)');
  T.ok('standing.js at the subject equals the far end', git('diff ' + FAR + ' ' + SUBJECT_BRANCH + ' -- src/js/standing.js') === '', '(empty diff)');
  T.ok('policy at the subject equals the far end', git('diff ' + FAR + ' ' + SUBJECT_BRANCH + ' -- scripts/policies/competent.js') === '', '(empty diff)');
  T.ok('subject message names the pick and the two drops', git('log -1 --format=%B ' + SUBJECT_BRANCH).indexOf('1c1b23482') !== -1 && git('log -1 --format=%B ' + SUBJECT_BRANCH).indexOf('probe-test') !== -1 && git('log -1 --format=%B ' + SUBJECT_BRANCH).indexOf('ONTOLOGY') !== -1, 'pick + drops named');
})();

T.section('7. STEP verdict — CARRIER 1/8, group-identical (stage 2)');
(function () {
  const sumPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  T.ok('STEP summary exists', fs.existsSync(sumPath), 'summary present');
  const s = JSON.parse(fs.readFileSync(sumPath, 'utf8'));
  T.ok('summary step is t15c-split-js', s.step === STEP, s.step);
  T.ok('summary survived is 1/8', s.survived === 1, 'survived ' + s.survived + '/8');
  T.ok('summary verdict is BAD (transplant CARRIER)', s.verdict === 'BAD', s.verdict);
  T.ok('classifyTransplant(1) is CARRIER', classifyTransplant(s.survived) === 'CARRIER', classifyTransplant(s.survived));
  T.ok('summary rank is REGIONAL_INTACT', s.rankVerdict === 'REGIONAL_INTACT', s.rankVerdict);
  T.ok('summary median is 121d', s.wall.medianDays === 121, s.wall.medianDays + 'd');
  T.ok('summary instrument errors are 0', s.instrumentErrors === 0, 'errors ' + s.instrumentErrors);
  T.ok('summary wall wins/national/table are 0', s.wall.wins === 0 && s.wall.national === 0 && s.wall.table === 0, 'wins ' + s.wall.wins + ' national ' + s.wall.national + ' table ' + s.wall.table);
  T.ok('summary wave-5 is 2/8, wave-4 8/8', s.wall.wave5 === 2 && s.wall.wave4 === 8, 'wave5 ' + s.wall.wave5 + '/8 wave4 ' + s.wall.wave4 + '/8');
  T.ok('summary deaths total 690', s.wall.deaths === 690, 'deaths ' + s.wall.deaths);
  const wantDays = { 190391: 60, 190392: 75, 190393: 115, 190394: 150, 190395: 106, 190396: 128, 190397: 121, 190398: 149 };
  s.perSeed.forEach(function (r) {
    T.ok('seed ' + r.seed + ' ran ' + wantDays[r.seed] + 'd', r.days === wantDays[r.seed], r.days + 'd ' + r.endReason);
    T.ok('seed ' + r.seed + ' used the fix standing.js', r.standingFix === true && r.standingSha === 'f8fda4295a99', r.standingSha);
    T.ok('seed ' + r.seed + ' used the far-end policy', r.policySha === POLICY_SHA, r.policySha);
    T.ok('seed ' + r.seed + ' ran on the subject', r.anchorCommit === 'd56206f70e53', r.anchorCommit);
    T.ok('seed ' + r.seed + ' has zero errors', r.errors === 0, 'errors ' + r.errors);
  });
  T.ok('only 190394 survived', s.perSeed.filter(function (r) { return r.days === 150 && r.endReason === 'survived'; }).map(function (r) { return r.seed; }).join(',') === '190394', '190394 only');
  T.ok('blooded is false on all 8 end states', s.perSeed.every(function (r) { return r.blooded === false; }), '0/8 blooded');
  T.ok('tribute veterans-short on all 8', s.perSeed.every(function (r) { return r.tribute && r.tribute.reason === 'veterans-short' && r.tribute.veterans === 0; }), '0/2 everywhere');
  const corpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  const corpusFiles = fs.readdirSync(corpusDir).filter(function (f) { return f.slice(-5) === '.json'; });
  T.ok('corpus holds 8 per-seed JSONs', corpusFiles.length === 8, corpusFiles.length + ' files');
  const logPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  T.ok('driver log exists and records BAD 1/8', fs.existsSync(logPath) && fs.readFileSync(logPath, 'utf8').indexOf('BAD (survived 1/8') !== -1, 'BAD 1/8 in log');
  // Group identity: every per-seed JSON equals the group arm's corpus
  // modulo the step/anchorCommit labels (OVE-49 contributes nothing).
  const groupDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-t15c-narrowed');
  let identical = 0;
  SEEDS.forEach(function (seed) {
    const jf = path.join(corpusDir, 'culpritbisect-s' + seed + '-culpritbisect-pilot-fix.json');
    const gf = path.join(groupDir, 'culpritbisect-s' + seed + '-culpritbisect-pilot-fix.json');
    const j = JSON.parse(fs.readFileSync(jf, 'utf8'));
    const g = JSON.parse(fs.readFileSync(gf, 'utf8'));
    delete j.step; delete j.anchorCommit; delete g.step; delete g.anchorCommit;
    if (JSON.stringify(j) === JSON.stringify(g)) identical += 1;
  });
  T.ok('js-only corpus is field-identical to the group corpus (8/8)', identical === 8, identical + '/8 identical');
})();

T.section('8. Evidence records (stage 2)');
(function () {
  const ev = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15c-js.md'), 'utf8');
  T.ok('evidence states CARRIER', ev.indexOf('Verdict: CARRIER') !== -1, 'CARRIER present');
  T.ok('evidence records the subject hash', ev.indexOf('d56206f70e53f909c7271a776ecce4dad07a3cf4') !== -1, 'subject hash present');
  T.ok('evidence records the subject tree', ev.indexOf('009173473853d4dd5a33cb9448fd256b95a351aa') !== -1, 'subject tree present');
  T.ok('evidence records the group identity 8/8', ev.indexOf('8/8 IDENTICAL') !== -1, '8/8 present');
  T.ok('evidence records the telemetry refusal', ev.indexOf('Telemetry deviation check: REFUSED') !== -1 && ev.indexOf('baseline NOT rolled') !== -1, 'refusal recorded');
  T.ok('evidence records the Blooded check', ev.indexOf('Secondary check (Blooded beat vs end-state)') !== -1 && ev.indexOf('days 133 AND 142') !== -1, 'Blooded recorded');
  T.ok('evidence carries a metric review', ev.indexOf('## Metric review') !== -1 && ev.indexOf('Median convention note') !== -1, 'metric review present');
  T.ok('evidence records the plumbing construction deviation', ev.indexOf('Construction-method deviation') !== -1 && ev.indexOf('merge-tree') !== -1, 'deviation recorded');
  T.ok('evidence records the safe-commit index clobber + repair', ev.indexOf('Safe-commit index clobber') !== -1 && ev.indexOf('git ls-tree -r') !== -1, 'clobber recorded');
  T.ok('evidence records culpritbisect-a 116/116', ev.indexOf('116 passed, 0 failed') !== -1, '116/116 present');
  T.ok('evidence records the per-seed table', ev.indexOf('| 190394 | 150 | survived | 5 | regional | 350 | 130 | false |') !== -1, '190394 row present');
})();

T.section('9. Closeout — tree state, no game code (stage 2)');
(function () {
  T.ok('on-disk standing.js equals HEAD blob', fs.readFileSync(path.join(REPO, 'src', 'js', 'standing.js'), 'utf8') === gitShow('HEAD', 'src/js/standing.js'), 'byte-identical to HEAD');
  T.ok('no src/js file differs from HEAD', git('diff HEAD -- src/js') === '', git('diff --stat HEAD -- src/js') || '(clean)');
  T.ok('subject branch still in place', branchExists(SUBJECT_BRANCH) === true && git('rev-parse ' + SUBJECT_BRANCH).indexOf('d56206f70e53') === 0, 'd56206f7');
  T.ok('on the arm branch', git('branch --show-current') === 'sim-transplant15c-js-a', git('branch --show-current'));
})();

T.done();
