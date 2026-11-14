#!/usr/bin/env node
// test-transplant3.js — proof test for the H1 TRANSPLANT, family 3
// (arm sim-transplant3-a).
//
// THE QUESTION (evidence/2026-11-13/sim-transplant3.md, prereg
// committed before any judged sim): land origin family 3 — PR #28
// merge c32ff6fa8 (dialog-recap-teach-35a9, 1 second-parent commit,
// 3 src/js files) — onto the far end 203a32775 (GOOD 4/8) and measure
// whether it alone collapses it. Verdicts (fresh thresholds):
// <=1/8 CARRIER, 2/8 AMBIGUOUS (re-run once), >=3/8 NOT-CARRIER.
//
// OUTCOME — STOP AT THE CHERRY-PICK (recorded in the evidence file):
// `git cherry-pick -m 1 c32ff6fa8` onto the far end CONFLICTED on
// src/js/conversation.js (1 hunk: the family's insertion of
// convoResumeOwnsSitting between convoHasLiveUnfinished and
// convoUnfinishedEngageLine — two anchor methods the far end never
// had, so the insertion has no anchor there). Per the prereg the run
// STOPPED without hand-resolving: no subject commit exists, no step
// ran, no survival number was measured. The verdict for family 3 is
// UNMEASURED, not CARRIER and not NOT-CARRIER.
//
// WHAT THIS TEST PROVES (for the STOP state):
//   1. Family identity — merge c32ff6fa8, its parents, the
//      parents' merge-base 0f55a928c, the 1-commit second-parent
//      side, the exact 3 src/js files, +66/-24.
//   1b. Substrate pre-check — all 3 game-code files exist at the
//      far end; the 2 absent files are additions in the family diff
//      (clean, not DU); merge-tree predicts exactly the one
//      conversation.js conflict hunk (both the parents'-base and the
//      first-parent-base dry runs).
//   2. No subject — the scratch branch transplant-3-subject exists
//      and still points at the far end (no commit on top of it), and
//      its tree is identical to the far end (the family diff was NOT
//      applied).
//   2b. Conflict reproduced without touching the tree — `git
//      merge-tree b41bd6300 203a32775 c32ff6fa8` (the cherry-pick -m 1
//      base = the merge's FIRST PARENT) reports the conversation.js
//      conflict with exactly 1 hunk (3 marker lines) whose "their"
//      side is the unfinished-work methods, and shows
//      villager-agency.js merging cleanly (0 markers).
//   3. Conflict recorded — the evidence file states the STOP, names
//      the conflict file with its UU class and hunk, and records NO
//      subject hash.
//   4. Verdict mapping — classifyTransplant maps every survived
//      count to CARRIER / AMBIGUOUS / NOT-CARRIER / UNCLASSIFIABLE.
//   5. No corpus — no step corpus and no summary exist for STEP
//      t3-c32ff6fa8 (the run correctly stopped before measuring).
//   6. Base restored — HEAD is back on sim-transplant3-a, no src/js
//      file differs from HEAD, on-disk standing.js is byte-identical
//      to HEAD.
//   7. Seed-band identity — the step script and the prereg name
//      exactly seeds 190391–190398.
//
// Usage: node scripts/test-transplant3.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant3');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const MERGE = 'c32ff6fa8';
const MERGE_BASE_PARENTS = '0f55a928c';
const CORRECT_BASE = 'b41bd6300'; // cherry-pick -m 1 base = first parent
const TREE_BASE = 'd229b58f5'; // merge-base of far end and merge (NOT the cherry-pick base)
const SUBJECT_BRANCH = 'transplant-3-subject';
const STEP = 't3-c32ff6fa8';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const EXPECTED_JS = [
  'src/js/conversation.js', 'src/js/convo-beats.js', 'src/js/villager-agency.js',
];
// The two files absent at the far end — additions in the family diff.
const ADDED_FILES = [
  'scripts/test-recap-hammer-20261108.js', 'scripts/test-resume-teach-ownership-20261108.js',
];
// Marker LINE counts from the merge-tree dry runs, per content-conflicted file
// (one conflict hunk = 3 marker lines: <<<<<<<, =======, >>>>>>>).
const EXPECTED_MARKERS = { 'src/js/conversation.js': 3 }; // 1 hunk = 3 marker lines (<<<<<<<, =======, >>>>>>>)

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
// mergeTreeConflicts(base): run `git merge-tree <base> <far> <merge>`
// (read-only dry run — touches no worktree) and return { file: markers }
// for each 'changed in both' section, counting marker lines.
function mergeTreeConflicts(base) {
  const out = execSync('git merge-tree ' + base + ' ' + FAR + ' ' + MERGE,
    { cwd: REPO, stdio: 'pipe', maxBuffer: 512 * 1024 * 1024 }).toString('utf8');
  const lines = out.split('\n');
  const found = {};
  let cur = null;
  const record = function () { if (cur !== null && cur.file !== null) found[cur.file] = cur.markers; };
  for (const ln of lines) {
    if (ln === 'changed in both') { record(); cur = { file: null, markers: 0 }; continue; }
    if (cur !== null && /^[a-z][a-z ]*$/.test(ln)) { record(); cur = null; continue; }
    if (cur !== null) {
      const m = ln.match(/^  base\s+\d+ [0-9a-f]+ (.+)$/);
      if (m && cur.file === null) cur.file = m[1];
      if (ln.indexOf('+<<<<<<<') === 0 || ln.indexOf('+>>>>>>>') === 0 || ln.indexOf('+=======') === 0) cur.markers++;
    }
    if (cur !== null && cur.file !== null && ln !== '' && !ln.startsWith(' ') && !ln.startsWith('+') && !ln.startsWith('-') && !ln.startsWith('@')) {
      record();
      cur = null;
    }
  }
  record();
  return found;
}

(async () => {
  // ---- 1. Family identity ----
  T.section('1. Family identity — PR #28 merge c32ff6fa8');
  T.ok('merge commit exists', git('rev-parse ' + MERGE).length === 40, git('log -1 --format=%s ' + MERGE).slice(0, 80));
  T.ok('first parent is b41bd6300 (PR #27 merge)', git('rev-parse ' + MERGE + '^1').startsWith('b41bd6300'), git('log -1 --format=%h\\ %s ' + MERGE + '^1').slice(0, 80));
  T.ok('second parent is 2c01bb277 (recap-hammer tip)', git('rev-parse ' + MERGE + '^2').startsWith('2c01bb277'), git('log -1 --format=%h\\ %s ' + MERGE + '^2').slice(0, 80));
  T.ok('parents merge-base is 0f55a928c (PR #26 merge, family 11)', git('merge-base ' + MERGE + '^1 ' + MERGE + '^2').startsWith(MERGE_BASE_PARENTS), git('merge-base ' + MERGE + '^1 ' + MERGE + '^2').slice(0, 12));
  const sideCount = parseInt(git('rev-list --count ' + MERGE_BASE_PARENTS + '..' + MERGE + '^2'), 10);
  T.ok('second-parent side is 1 commit', sideCount === 1, 'count=' + sideCount);
  const jsFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- src/js').split('\n').sort();
  T.ok('family touches exactly the 3 expected src/js files', JSON.stringify(jsFiles) === JSON.stringify(EXPECTED_JS.slice().sort()), jsFiles.join(', '));
  const numstat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/js').split('\n')
    .reduce(function (acc, line) { const p = line.split('\t'); return { ins: acc.ins + parseInt(p[0], 10), del: acc.del + parseInt(p[1], 10) }; }, { ins: 0, del: 0 });
  T.ok('family src/js delta is +66/-24', numstat.ins === 66 && numstat.del === 24, '+' + numstat.ins + '/-' + numstat.del);
  const polFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- scripts/policies');
  T.ok('family touches no policy file', polFiles === '', polFiles || '(none)');
  T.ok('family does not touch standing.js', git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- src/js/standing.js') === '', '(absent)');
  const farStanding = sha256(gitShow(FAR, 'src/js/standing.js'));
  T.ok('far-end native standing.js sha is 75762cb2...', farStanding.startsWith('75762cb2'), farStanding.slice(0, 12));
  T.ok('fix standing.js sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  const farPolicy = sha256(gitShow(FAR, 'scripts/policies/competent.js'));
  T.ok('far-end policy sha is a7ff5c51...', farPolicy.startsWith('a7ff5c51'), farPolicy.slice(0, 12));
  const totalFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE).split('\n').length;
  T.ok('family diff is exactly 9 files (3 js + 6 test scripts)', totalFiles === 9, 'files=' + totalFiles);
  T.ok('merge-base of far end and merge is d229b58f5 (informational — NOT the cherry-pick base)', git('merge-base ' + FAR + ' ' + MERGE).startsWith(TREE_BASE), git('merge-base ' + FAR + ' ' + MERGE).slice(0, 12));
  T.ok('cherry-pick -m 1 base is the first parent b41bd6300', git('rev-parse ' + MERGE + '^1').startsWith(CORRECT_BASE), git('rev-parse ' + MERGE + '^1').slice(0, 12));

  // ---- 1b. Substrate pre-check ----
  T.section('1b. Substrate pre-check — merge-tree dry runs');
  let subOk = true, subBad = null;
  for (const f of EXPECTED_JS) {
    if (git('ls-tree ' + FAR + ' -- ' + f) === '') { subOk = false; subBad = f; break; }
  }
  T.ok('all 3 game-code files exist at the far end', subOk, subBad ? 'missing: ' + subBad : '3/3');
  const added = git('diff --diff-filter=A --name-only ' + MERGE + '^1 ' + MERGE).split('\n').sort();
  T.ok('the 2 files absent at the far end are additions in the family diff', JSON.stringify(added) === JSON.stringify(ADDED_FILES.slice().sort()), added.join(', '));
  let absentOk = true;
  for (const f of ADDED_FILES) {
    if (git('ls-tree ' + FAR + ' -- ' + f) !== '') { absentOk = false; break; }
  }
  T.ok('both added files are absent at the far end (clean, not DU)', absentOk, absentOk ? '2/2 absent' : 'present at far end');
  const mtParents = mergeTreeConflicts(MERGE_BASE_PARENTS);
  T.ok('parents-base merge-tree predicts exactly the conversation.js conflict (1 hunk, 3 marker lines)', mtParents['src/js/conversation.js'] === 3, 'markers=' + mtParents['src/js/conversation.js']);
  T.ok('parents-base merge-tree shows villager-agency.js merging cleanly (0 markers)', mtParents['src/js/villager-agency.js'] === 0, 'markers=' + mtParents['src/js/villager-agency.js']);
  // The anchor methods exist at the first parent but NOT at the far end.
  const farConvo = gitShow(FAR, 'src/js/conversation.js');
  const parentConvo = gitShow(MERGE + '^1', 'src/js/conversation.js');
  T.ok('anchor method convoHasLiveUnfinished exists at the first parent', parentConvo.indexOf('convoHasLiveUnfinished(vid)') !== -1, 'present at ' + MERGE + '^1');
  T.ok('anchor method convoHasLiveUnfinished is ABSENT at the far end', farConvo.indexOf('convoHasLiveUnfinished(vid)') === -1, 'absent at far end');
  T.ok('anchor method convoUnfinishedEngageLine exists at the first parent', parentConvo.indexOf('convoUnfinishedEngageLine(vid)') !== -1, 'present at ' + MERGE + '^1');
  T.ok('anchor method convoUnfinishedEngageLine is ABSENT at the far end', farConvo.indexOf('convoUnfinishedEngageLine(vid)') === -1, 'absent at far end');
  // The lessonOutcome/plantTeachOutcome split is first-parent content, not family content.
  T.ok('the lessonOutcome split exists at the first parent', parentConvo.indexOf('plantTeachOutcome') !== -1, 'split at ' + MERGE + '^1');
  const famDiff = git('diff ' + MERGE + '^1 ' + MERGE + ' -- src/js/conversation.js');
  T.ok('the family diff does NOT contain the lessonOutcome split', famDiff.indexOf('plantTeachOutcome') === -1, 'split not in family diff');
  T.ok('the family diff DOES insert convoResumeOwnsSitting', famDiff.indexOf('+    convoResumeOwnsSitting(vid)') !== -1, 'insertion in family diff');

  // ---- 2. No subject (STOP state) ----
  T.section('2. No subject — branch left at the far end, family NOT applied');
  let subject = null;
  try { subject = git('rev-parse ' + SUBJECT_BRANCH); } catch (e) { subject = null; }
  T.ok('subject branch exists', subject !== null && subject.length === 40, subject ? subject.slice(0, 12) : '(missing)');
  if (subject) {
    T.ok('subject branch still points at the far end (no subject commit)', subject === FAR_FULL, subject.slice(0, 12));
    const treeDiff = git('diff --name-only ' + FAR + ' ' + SUBJECT_BRANCH);
    T.ok('subject tree is identical to the far end (family diff NOT applied)', treeDiff === '', treeDiff.slice(0, 200) || '(empty)');
  }

  // ---- 2b. Conflict reproduced by merge-tree (read-only) ----
  T.section('2b. Conflict reproduced — git merge-tree dry run (first-parent base)');
  const mt = mergeTreeConflicts(CORRECT_BASE);
  let mtOk = true, mtBad = null;
  for (const f of Object.keys(EXPECTED_MARKERS)) {
    if (mt[f] !== EXPECTED_MARKERS[f]) { mtOk = false; mtBad = f + ' (got ' + mt[f] + ', want ' + EXPECTED_MARKERS[f] + ')'; break; }
  }
  T.ok('first-parent-base merge-tree reports the conversation.js conflict with 1 hunk (3 marker lines)', mtOk, mtBad || '1/1 match');
  T.ok('first-parent-base merge-tree shows villager-agency.js merging cleanly (0 markers)', mt['src/js/villager-agency.js'] === 0, 'markers=' + mt['src/js/villager-agency.js']);
  T.ok('first-parent-base merge-tree shows convo-beats.js untouched (no section)', mt['src/js/convo-beats.js'] === undefined, 'section=' + mt['src/js/convo-beats.js']);
  // The conflict hunk's "their" side is the unfinished-work methods.
  // Extract the conversation.js 'changed in both' section by its base line.
  const mtRaw = execSync('git merge-tree ' + CORRECT_BASE + ' ' + FAR + ' ' + MERGE,
    { cwd: REPO, stdio: 'pipe', maxBuffer: 512 * 1024 * 1024 }).toString('utf8');
  const mtLines = mtRaw.split('\n');
  let convoSection = null, inConvo = false;
  for (let i = 0; i < mtLines.length; i++) {
    const ln = mtLines[i];
    if (ln === 'changed in both') { inConvo = false; continue; }
    if (/^[a-z][a-z ]*$/.test(ln) && ln !== 'changed in both') { if (inConvo) break; continue; }
    const m = ln.match(/^  base\s+\d+ [0-9a-f]+ (.+)$/);
    if (m && m[1] === 'src/js/conversation.js') { inConvo = true; convoSection = ''; continue; }
    if (inConvo) convoSection += ln + '\n';
  }
  T.ok('conflict hunk carries convoResumeOwnsSitting as the insertion', convoSection !== null && convoSection.indexOf('convoResumeOwnsSitting') !== -1, 'insertion in hunk');
  T.ok('conflict hunk carries convoHasLiveUnfinished on the their side', convoSection !== null && convoSection.indexOf('convoHasLiveUnfinished') !== -1, 'anchor method in hunk');

  // ---- 3. Conflict recorded ----
  T.section('3. Conflict recorded in the evidence file');
  const evPath = path.join(REPO, 'evidence', '2026-11-13', 'sim-transplant3.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('evidence file states the cherry-pick conflict STOP', ev.indexOf('Cherry-pick conflict — STOP') !== -1, 'STOP section present');
  T.ok('evidence file records NO subject commit', ev.indexOf('Subject commit: NONE') !== -1, 'NONE recorded');
  T.ok('evidence file names the conflict file src/js/conversation.js', ev.indexOf('src/js/conversation.js') !== -1, 'conversation.js named');
  T.ok('evidence file names the inserted method convoResumeOwnsSitting', ev.indexOf('convoResumeOwnsSitting') !== -1, 'method named');
  T.ok('evidence file records the missing-substrate cause (anchor methods absent at the far end)', ev.indexOf('NONE of the three exists') !== -1, 'cause recorded');
  T.ok('evidence file records the verdict as UNMEASURED', ev.indexOf('UNMEASURED') !== -1, 'UNMEASURED present');
  T.ok('evidence file records the pre-check base correction', ev.indexOf('CORRECTION to the pre-check') !== -1, 'correction recorded');

  // ---- 4. Verdict mapping ----
  T.section('4. Verdict mapping — transplant thresholds');
  const table = [[0, 'CARRIER'], [1, 'CARRIER'], [2, 'AMBIGUOUS'], [3, 'NOT-CARRIER'], [4, 'NOT-CARRIER'], [8, 'NOT-CARRIER'], [-1, 'UNCLASSIFIABLE'], [9, 'UNCLASSIFIABLE'], [NaN, 'UNCLASSIFIABLE']];
  for (const pair of table) {
    T.ok('survived ' + pair[0] + ' -> ' + pair[1], classifyTransplant(pair[0]) === pair[1], classifyTransplant(pair[0]));
  }

  // ---- 5. No corpus (stopped before measuring) ----
  T.section('5. No corpus — the run stopped before any sim');
  const corpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  const summaryPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  T.ok('no step corpus directory exists', !fs.existsSync(corpusDir), corpusDir);
  T.ok('no step summary exists', !fs.existsSync(summaryPath), summaryPath);

  // ---- 6. Base restored ----
  T.section('6. Base restored — arm branch clean, no swap residue');
  const headBranch = git('rev-parse --abbrev-ref HEAD');
  T.ok('HEAD is back on the arm branch sim-transplant3-a', headBranch === 'sim-transplant3-a', 'HEAD=' + headBranch);
  const dirtyJs = git('status --porcelain --untracked-files=no -- src/js');
  T.ok('no src/js file differs from HEAD', dirtyJs === '', dirtyJs.slice(0, 200) || '(clean)');
  const onDiskStanding = sha256(fs.readFileSync(path.join(REPO, 'src', 'js', 'standing.js'), 'utf8'));
  const headStanding = sha256(gitShow('HEAD', 'src/js/standing.js'));
  T.ok('on-disk standing.js is byte-identical to HEAD (no swap residue)', onDiskStanding === headStanding, onDiskStanding.slice(0, 12) + ' vs HEAD ' + headStanding.slice(0, 12));

  // ---- 7. Seed-band identity ----
  T.section('7. Seed-band identity');
  const stepSrc = fs.readFileSync(path.join(REPO, 'scripts', 'culpritbisect-step.sh'), 'utf8');
  T.ok('step script names the band 190391..190398',
    stepSrc.indexOf('190391,190392,190393,190394,190395,190396,190397,190398') !== -1, 'band literal present');
  T.ok('evidence prereg names the same band', ev.indexOf('190391') !== -1 && ev.indexOf('190398') !== -1, 'band in prereg');

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
