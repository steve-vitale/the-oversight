#!/usr/bin/env node
// test-transplant15a-fresh.js — proof test for the H1 TRANSPLANT,
// family 15A PICK-1 FRESH-BAND CONFIRM (OVE-48, arm
// sim-transplant15a-fresh-a).
//
// THE QUESTION (evidence/2026-11-14/sim-transplant15a-fresh-prereg.md,
// prereg committed before any judged sim ran): OVE-48 pick-1 alone
// read AMBIGUOUS 2/8 TWICE on the collapse band (190391–190398) —
// STEP t15a-pick1 and the fresh-id re-run t15a-pick1-r2, per-seed
// numbers IDENTICAL on every field. The round-1355 metric review
// established that a deterministic re-run on the same seeds is
// vacuous: it is a reproducibility check, not fresh evidence. The
// honest resolver is a FRESH seed band, not a third run of the old
// band. This arm runs the already-built 15A pick-1 subject against
// the far end on fresh band 190449–190456 and judges it there.
//
// Two legs, both 150d death-aware, competent verbatim own-policy,
// standing-fix swap f8fda4295a99 per seed:
//   Leg 1 (baseline): far end 203a32775 alone, STEP t15a-fresh-base.
//   Leg 2 (subject): transplant-15a-narrowed-subject 493d7a975,
//   STEP t15a-fresh-subj.
// DECISION TABLE (binding, fresh-band only): baseline <=2/8 ->
// BAND-INCONCLUSIVE (band cannot discriminate, no verdict);
// otherwise subject <=1/8 -> CARRIER, subject 2/8 -> AMBIGUOUS
// (record, do NOT re-run), subject >=3/8 -> NOT-CARRIER.
// Picks 2 (OVE-50) and 3 (OVE-51) are NOT measured by this arm:
// pick 2 conflicts on src/js/convo-wants.js because it is written
// against family 15D's believed-pantry code, which the far end
// never had (narrowed-arm evidence); pick 3 was never attempted.
// The subject branch transplant-15a-narrowed-subject already holds
// pick 1 at 493d7a975 — this arm verifies it, never rebuilds it.
//
// STEP-SCRIPT ADAPTATION (pre-registered): scripts/culpritbisect
// -step.sh hardcodes the collapse band. The repo script is NOT
// modified; for BOTH legs the script is copied to /tmp (the
// detached checkout deletes the script itself from the worktree)
// and the /tmp copy's SEEDS line is edited to the fresh band
// before running. The proof verifies the repo script still names
// the collapse band (unmodified) and that every per-seed JSON in
// both corpora carries a fresh-band seed.
//
// STAGE 1 (this file as committed with the prereg) proves:
//   1. Pick-1 identity — hash, subject, first parent, single parent,
//      exact numstats, no standing.js, no policy file.
//   2. Subject verification — the subject branch exists, tip is
//      493d7a975, tree is 6d6216e3… (the predicted pick-1-resolved
//      tree), exactly 1 commit on the far end, diff vs the far end
//      is exactly pick 1 minus green-list.txt (3 files, +320/-3),
//      green-list.txt is NOT in the commit and is byte-identical
//      to the far end, no OVE-50/OVE-51 commit on the subject.
//   3. Pick-1 content — convoDawnPriorities + DAWN_KIND_WANTS /
//      DAWN_DRIVE_WANTS with a 2.0 primary bias; no damage/armor/
//      spawn/food-yield/spoilage/wave/table-gate numbers changed.
//   4. Verdict mapping — classifyFresh maps every (subject,
//      baseline) pair per the binding fresh-band decision table.
//   5. Prereg recorded in the evidence file (base, pick, fresh
//      band, both STEP ids, decision table, freshness check with
//      rejected bands + JSON float artifact, coordinator decision
//      round-1355 blank #3, canon note, step-script adaptation).
//   6. Base state — HEAD is on sim-transplant15a-fresh-a, no src/js
//      file differs from HEAD, on-disk standing.js is byte-identical
//      to HEAD, the step-script tooling source (master) still
//      carries all four scratch files, the repo step script still
//      names the collapse band (unmodified), no STEP
//      t15a-fresh-base / t15a-fresh-subj summary/driver log/corpus
//      exists, no cherry-pick is in progress.
// STAGE 2 (appended after the steps) proves the judged runs:
//   7. Corpus — 8/8 per-seed JSONs parse per leg, seeds match
//      190449–190456, STEP ids match, fix swapped in (standingSha
//      f8fda429..., correct anchor per leg, policy a7ff5c51), 0
//      instrument errors, and days/endReason/deaths/vetSays match
//      the driver log line for each seed.
//   8. Verdict — the corpora's survived counts classify per the
//      binding fresh-band decision table; the evidence file states it.
//   9. Standing restored — the SUBJECT branch's src/js/standing.js
//      is byte-identical to the far-end native (sha256 75762cb2...,
//      verified from the far-end blob); the landing branch itself
//      changes no game code: on-disk standing.js equals the HEAD
//      blob and `git diff` is empty for src/js.
//  10. Evidence records — verdict, per-seed tables, wall numbers,
//      sense-testing, metric review, telemetry refusal.
//
// Usage: node scripts/test-transplant15a-fresh.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant15a-fresh');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const PICK1 = 'c937de65f32d26e064d8935dd984490b2ee50a6c';
const FIRST1 = '1e03b3d69480e2d57c08bd2629aeffdeee4e6f32';
const SUBJECT = '493d7a9753aee1c154cf809402e6691ee9a5429e';
const SUBJECT_BRANCH = 'transplant-15a-narrowed-subject';
const STEP_BASE = 't15a-fresh-base';
const STEP_SUBJ = 't15a-fresh-subj';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const FAR_NATIVE_STANDING_SHA = '75762cb2259da3d4d51c57de1548404b45d8269d36a4503341507ed807540e7c';
const SEEDS = [190449, 190450, 190451, 190452, 190453, 190454, 190455, 190456];
const CORPUS_BASE = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP_BASE);
const CORPUS_SUBJ = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP_SUBJ);
const DRIVER_BASE = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP_BASE + '-driver.log');
const DRIVER_SUBJ = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP_SUBJ + '-driver.log');
const PRED1_TREE = '6d6216e3e414518d2c335829e130e65ec849941b';

function sha256(text) { return crypto.createHash('sha256').update(text).digest('hex'); }
function git(args) { return execSync('git ' + args, { cwd: REPO, stdio: 'pipe' }).toString().trim(); }
function gitShow(commit, file) { return execSync('git show ' + commit + ':' + file, { cwd: REPO, stdio: 'pipe' }).toString(); }
// Binding fresh-band decision table (prereg): the baseline gates
// discrimination first; the subject count is judged only when the
// baseline reads >=3/8. A 2/8 subject is AMBIGUOUS and is NOT
// re-run (deterministic re-run is vacuous — round-1355 metric review).
function classifyFresh(subject, baseline) {
  if (typeof subject !== 'number' || typeof baseline !== 'number' ||
      !Number.isFinite(subject) || !Number.isFinite(baseline) ||
      subject < 0 || subject > 8 || baseline < 0 || baseline > 8) return 'UNCLASSIFIABLE';
  if (baseline <= 2) return 'BAND-INCONCLUSIVE';
  if (subject <= 1) return 'CARRIER';
  if (subject === 2) return 'AMBIGUOUS';
  return 'NOT-CARRIER';
}

(async () => {
  // ---- 1. Pick-1 identity ----
  T.section('1. Pick-1 identity — OVE-48, standalone first-parent commit');
  T.ok('pick 1 exists', git('rev-parse ' + PICK1).length === 40, git('log -1 --format=%s ' + PICK1).slice(0, 80));
  T.ok('pick 1 subject is "OVE-48: convoSelectWant reads dawn commitment and top drive"',
    git('log -1 --format=%s ' + PICK1) === 'OVE-48: convoSelectWant reads dawn commitment and top drive', git('log -1 --format=%s ' + PICK1).slice(0, 80));
  T.ok('pick 1 first parent is 1e03b3d69', git('rev-parse ' + PICK1 + '^1') === FIRST1, git('log -1 --format=%h\\ %s ' + PICK1 + '^1').slice(0, 80));
  const parents = git('show -s --format=%P ' + PICK1).split(' ').filter(Boolean);
  T.ok('pick 1 has exactly 1 parent (standalone, not a merge)', parents.length === 1, 'parents=' + parents.length);
  const jsFiles = git('diff --name-only ' + PICK1 + '^1 ' + PICK1 + ' -- src/js').split('\n').sort();
  T.ok('pick 1 touches exactly one src/js file (convo-wants.js)', JSON.stringify(jsFiles) === JSON.stringify(['src/js/convo-wants.js']), jsFiles.join(', '));
  T.ok('pick 1 convo-wants.js is +111/-1', git('diff --numstat ' + PICK1 + '^1 ' + PICK1 + ' -- src/js/convo-wants.js') === '111\t1\tsrc/js/convo-wants.js', git('diff --numstat ' + PICK1 + '^1 ' + PICK1 + ' -- src/js/convo-wants.js'));
  T.ok('pick 1 test file is +206/-0 (new test)', git('diff --numstat ' + PICK1 + '^1 ' + PICK1 + ' -- scripts/test-convo-dawn-priorities.js') === '206\t0\tscripts/test-convo-dawn-priorities.js', git('diff --numstat ' + PICK1 + '^1 ' + PICK1 + ' -- scripts/test-convo-dawn-priorities.js'));
  T.ok('pick 1 docs/ONTOLOGY.md is +3/-2', git('diff --numstat ' + PICK1 + '^1 ' + PICK1 + ' -- docs/ONTOLOGY.md') === '3\t2\tdocs/ONTOLOGY.md', git('diff --numstat ' + PICK1 + '^1 ' + PICK1 + ' -- docs/ONTOLOGY.md'));
  T.ok('pick 1 green-list.txt is +1/-0', git('diff --numstat ' + PICK1 + '^1 ' + PICK1 + ' -- scripts/green-list.txt') === '1\t0\tscripts/green-list.txt', git('diff --numstat ' + PICK1 + '^1 ' + PICK1 + ' -- scripts/green-list.txt'));
  T.ok('pick 1 does not touch standing.js', git('diff --name-only ' + PICK1 + '^1 ' + PICK1 + ' -- src/js/standing.js') === '', '(absent)');
  const polFiles = git('diff --name-only ' + PICK1 + '^1 ' + PICK1 + ' -- scripts/policies');
  T.ok('pick 1 touches no policy file', polFiles === '', polFiles || '(none)');
  const farStanding = sha256(gitShow(FAR, 'src/js/standing.js'));
  T.ok('far-end native standing.js sha is 75762cb2...', farStanding === FAR_NATIVE_STANDING_SHA, farStanding.slice(0, 12));
  T.ok('fix standing.js sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  const farPolicy = sha256(gitShow(FAR, 'scripts/policies/competent.js'));
  T.ok('far-end policy sha is a7ff5c51...', farPolicy.startsWith('a7ff5c51'), farPolicy.slice(0, 12));

  // ---- 2. Subject verification ----
  T.section('2. Subject verification — branch holds pick 1 only, tree equals prediction');
  let subjectExists = true;
  try { git('rev-parse ' + SUBJECT_BRANCH); } catch (e) { subjectExists = false; }
  T.ok('subject branch transplant-15a-narrowed-subject exists', subjectExists, SUBJECT_BRANCH + ' present');
  T.ok('subject tip is the pick-1 commit 493d7a975 (OVE-48)',
    git('rev-parse ' + SUBJECT_BRANCH) === SUBJECT && git('log -1 --format=%s ' + SUBJECT_BRANCH) === 'OVE-48: convoSelectWant reads dawn commitment and top drive', git('log -1 --format=%h\\ %s ' + SUBJECT_BRANCH).slice(0, 80));
  T.ok('subject tip tree is 6d6216e3… (the predicted pick-1-resolved tree)',
    git('rev-parse ' + SUBJECT_BRANCH + '^{tree}') === PRED1_TREE, git('rev-parse ' + SUBJECT_BRANCH + '^{tree}').slice(0, 12));
  T.ok('subject has exactly 1 commit on top of the far end (pick 1 only)',
    git('rev-list --count ' + FAR + '..' + SUBJECT_BRANCH) === '1', 'count=1');
  T.ok('subject parent is the far end', git('rev-parse ' + SUBJECT_BRANCH + '^1') === FAR_FULL, git('rev-parse --short ' + SUBJECT_BRANCH + '^1'));
  T.ok('subject green-list.txt is byte-identical to the far end (checkout --ours kept it)',
    sha256(gitShow(SUBJECT_BRANCH, 'scripts/green-list.txt')) === sha256(gitShow(FAR, 'scripts/green-list.txt')), 'green-list == far end');
  T.ok('subject green-list.txt blob is 410eccee... (recorded in the prereg)',
    git('rev-parse ' + SUBJECT_BRANCH + ':scripts/green-list.txt') === '410eccee8b091c9c5cc16b1931d98822f81fa601' && git('rev-parse ' + FAR + ':scripts/green-list.txt') === '410eccee8b091c9c5cc16b1931d98822f81fa601', 'blob 410eccee');
  const subjNumstat = git('diff --numstat ' + FAR + ' ' + SUBJECT_BRANCH);
  T.ok('subject diff vs far end is exactly pick 1 minus green-list (3 files, +320/-3)',
    subjNumstat.split('\n').sort().join('\n') === ['3\t2\tdocs/ONTOLOGY.md', '206\t0\tscripts/test-convo-dawn-priorities.js', '111\t1\tsrc/js/convo-wants.js'].sort().join('\n'), subjNumstat.replace(/\n/g, ' | '));
  const pick1Files = git('diff --name-only ' + SUBJECT_BRANCH + '^1 ' + SUBJECT_BRANCH).split('\n').sort();
  T.ok('pick-1 commit touches exactly the 3 non-tooling files (green-list.txt NOT in the commit)',
    JSON.stringify(pick1Files) === JSON.stringify(['docs/ONTOLOGY.md', 'scripts/test-convo-dawn-priorities.js', 'src/js/convo-wants.js']), pick1Files.join(', '));
  T.ok('no pick-2 commit exists on the subject (OVE-50 never landed)',
    git('log --format=%s ' + FAR + '..' + SUBJECT_BRANCH).indexOf('OVE-50') === -1, 'no OVE-50 commit');
  T.ok('no pick-3 commit exists on the subject (OVE-51 never attempted)',
    git('log --format=%s ' + FAR + '..' + SUBJECT_BRANCH).indexOf('OVE-51') === -1, 'no OVE-51 commit');
  T.ok('subject standing.js is byte-identical to the far-end native (pick 1 never touched it)',
    sha256(gitShow(SUBJECT_BRANCH, 'src/js/standing.js')) === FAR_NATIVE_STANDING_SHA, 'standing == far end native');

  // ---- 3. Pick-1 content ----
  T.section('3. Pick-1 content — dawn coherence, no lever numbers changed');
  const conv1 = gitShow(PICK1, 'src/js/convo-wants.js');
  T.ok('pick 1 adds convoDawnPriorities (dawn commitment + top drive read)',
    conv1.indexOf('convoDawnPriorities') !== -1, 'convoDawnPriorities present');
  T.ok('pick 1 adds DAWN_KIND_WANTS / DAWN_DRIVE_WANTS with a 2.0 primary bias',
    conv1.indexOf('DAWN_KIND_WANTS') !== -1 && conv1.indexOf('DAWN_DRIVE_WANTS') !== -1 && conv1.indexOf('DAWN_BIAS_PRIMARY = 2.0') !== -1, 'bias tables present');
  const diffJs = execSync('git diff ' + PICK1 + '^1 ' + PICK1 + ' -- src/js', { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  T.ok('pick 1 diff changes no damage/armor/spawn/food-yield/spoilage identifier',
    ['damage', 'armor', 'spawnMonster', 'foodYield', 'spoilage'].every(function (w) { return diffJs.indexOf(w) === -1; }), 'no lever identifiers');
  T.ok('pick 1 diff changes no wave/table gate (no wave5, deedGate hunk)',
    diffJs.indexOf('wave5') === -1 && diffJs.indexOf('deedGate') === -1, 'no gate identifiers');

  // ---- 4. Verdict mapping — fresh-band decision table ----
  T.section('4. Verdict mapping — binding fresh-band decision table');
  const table = [
    [0, 4, 'CARRIER'], [1, 3, 'CARRIER'], [1, 8, 'CARRIER'],
    [2, 3, 'AMBIGUOUS'], [2, 4, 'AMBIGUOUS'], [2, 8, 'AMBIGUOUS'],
    [3, 4, 'NOT-CARRIER'], [4, 4, 'NOT-CARRIER'], [8, 8, 'NOT-CARRIER'],
    [0, 2, 'BAND-INCONCLUSIVE'], [1, 1, 'BAND-INCONCLUSIVE'], [4, 0, 'BAND-INCONCLUSIVE'],
    [2, 2, 'BAND-INCONCLUSIVE'], [8, 2, 'BAND-INCONCLUSIVE'],
    [-1, 4, 'UNCLASSIFIABLE'], [2, 9, 'UNCLASSIFIABLE'], [NaN, 4, 'UNCLASSIFIABLE'], [2, NaN, 'UNCLASSIFIABLE']
  ];
  for (const row of table) {
    T.ok('subject ' + row[0] + '/8, baseline ' + row[1] + '/8 -> ' + row[2],
      classifyFresh(row[0], row[1]) === row[2], classifyFresh(row[0], row[1]));
  }
  T.ok('the old-band table is NOT reused here (2/8 alone no longer triggers a re-run)',
    classifyFresh(2, 4) === 'AMBIGUOUS', 'AMBIGUOUS, no re-run leg');

  // ---- 5. Prereg recorded in the evidence file ----
  T.section('5. Prereg recorded in the evidence file');
  const prePath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15a-fresh-prereg.md');
  const pre = fs.existsSync(prePath) ? fs.readFileSync(prePath, 'utf8') : '';
  T.ok('prereg file exists', pre.length > 0, prePath);
  T.ok('prereg names pick c937de65f (OVE-48)', pre.indexOf('c937de65f') !== -1, 'pick 1 present');
  T.ok('prereg names the far end 203a32775', pre.indexOf('203a32775') !== -1, 'far end present');
  T.ok('prereg names the fresh band 190449-190456', pre.indexOf('190449') !== -1 && pre.indexOf('190456') !== -1, 'fresh band present');
  T.ok('prereg names both STEP ids (t15a-fresh-base, t15a-fresh-subj)', pre.indexOf('t15a-fresh-base') !== -1 && pre.indexOf('t15a-fresh-subj') !== -1, 'STEP ids present');
  T.ok('prereg records the decision table (CARRIER subject ≤1/8 AND baseline ≥3/8)',
    pre.indexOf('CARRIER if subject ≤1/8 AND baseline ≥3/8') !== -1, 'CARRIER rule present');
  T.ok('prereg records the AMBIGUOUS rule (subject 2/8, do NOT re-run)',
    pre.indexOf('AMBIGUOUS if subject reads 2/8') !== -1 && pre.indexOf('Do NOT re-run') !== -1, 'AMBIGUOUS rule present');
  T.ok('prereg records the NOT-CARRIER rule (subject ≥3/8)',
    pre.indexOf('NOT-CARRIER if subject ≥3/8') !== -1, 'NOT-CARRIER rule present');
  T.ok('prereg records the BAND-INCONCLUSIVE rule (baseline ≤2/8)',
    pre.indexOf('BAND-INCONCLUSIVE if the baseline itself reads ≤2/8') !== -1, 'BAND-INCONCLUSIVE rule present');
  T.ok('prereg records the freshness check (zero hits in .md, prereg, tracker)',
    pre.indexOf('Freshness check') !== -1 && pre.indexOf('ZERO hits in any') !== -1, 'freshness section present');
  T.ok('prereg records the rejected bands (190401, 190411, 190419)',
    pre.indexOf('190401') !== -1 && pre.indexOf('190411') !== -1 && pre.indexOf('190419') !== -1, 'rejected bands present');
  T.ok('prereg records the JSON float-substring artifact (sweep-belongfeast.json, not a reservation)',
    pre.indexOf('sweep-belongfeast.json') !== -1 && pre.indexOf('float-substring') !== -1, 'artifact note present');
  T.ok('prereg records the subject tip 493d7a975 and the predicted tree 6d6216e3…', pre.indexOf('493d7a975') !== -1 && pre.indexOf('6d6216e3') !== -1, 'subject tip+tree present');
  T.ok('prereg records the coordinator decision (round-1355, decision 3 / blank #3)', pre.indexOf('sim-transplant-round-1355.md') !== -1 && pre.indexOf('blank #3') !== -1, 'coordinator decision present');
  T.ok('prereg records the old-band 2/8-twice read and the vacuous re-run (round-1355 metric review)',
    pre.indexOf('2/8 TWICE') !== -1 && pre.indexOf('vacuous') !== -1, 'old-band history present');
  T.ok('prereg records the canon note (VILLAGER-BRAIN.md Phase 4, convoSelectWant reads commitment + top drive)',
    pre.indexOf('VILLAGER-BRAIN.md') !== -1 && pre.indexOf('current commitment and') !== -1, 'canon note present');
  T.ok('prereg records the step-script adaptation (/tmp copy, SEEDS line edited to the fresh band, repo script NOT modified)',
    pre.indexOf('STEP-SCRIPT ADAPTATION') !== -1 && pre.indexOf('NOT modified') !== -1 && pre.indexOf('190449,...,190456') !== -1, 'step-script adaptation present');
  T.ok('prereg records the horizon 150d death-aware', pre.indexOf('150d') !== -1, 'horizon present');
  T.ok('prereg records the competent verbatim own-policy', pre.indexOf('competent verbatim') !== -1, 'policy present');
  T.ok('prereg records the fix policy (bisect prereg)', pre.indexOf('Fix policy') !== -1, 'fix policy present');
  T.ok('prereg records the ordering note (subject + freshness verified during prereg preparation, no STEP corpus yet)',
    pre.indexOf('Ordering note') !== -1, 'ordering note present');

  // ---- 6. Base state ----
  T.section('6. Base state — arm branch clean, subject verified, sim not run');
  const headBranch = git('rev-parse --abbrev-ref HEAD');
  // worktreeOnly: branch-identity legs are meaningful only in the
  // worker tree. On merged master HEAD is 'master' by design (the
  // arm branch is deleted after landing) — the leg passes there
  // vacuously instead of failing, so the proof stays green on master.
  const worktreeOnly = function (cond) { return cond || headBranch === 'master'; };
  T.ok('HEAD is on the arm branch sim-transplant15a-fresh-a (worktree-only)', worktreeOnly(headBranch === 'sim-transplant15a-fresh-a'), 'HEAD=' + headBranch);
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
  T.ok('repo step script still names the collapse band 190391..190398 (NOT modified for this arm)',
    stepSrc.indexOf('190391,190392,190393,190394,190395,190396,190397,190398') !== -1, 'collapse band literal present');
  T.ok('repo step script does NOT name the fresh band (the /tmp copy carries it, not the repo)',
    stepSrc.indexOf('190449') === -1, 'no fresh band in repo script');
  // STAGE 2 (appended after the steps): the judged runs exist now,
  // so the six "no step ..." legs below are replaced by "step ran"
  // legs for BOTH STEP ids (t15a-fresh-base and t15a-fresh-subj).
  // The stage-1 form of this file passed 84/84 before any judged
  // sim ran; this form proves the judged runs.
  const baseSummary = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP_BASE + '-summary.json');
  T.ok('step summary exists for t15a-fresh-base (judged sim ran)', fs.existsSync(baseSummary) === true, STEP_BASE);
  const baseDriver = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP_BASE + '-driver.log');
  T.ok('step driver log exists for t15a-fresh-base (judged sim ran)', fs.existsSync(baseDriver) === true, STEP_BASE);
  T.ok('step corpus exists for t15a-fresh-base (judged sim ran)', fs.existsSync(CORPUS_BASE) === true, STEP_BASE);
  const subjSummary = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP_SUBJ + '-summary.json');
  T.ok('step summary exists for t15a-fresh-subj (judged sim ran)', fs.existsSync(subjSummary) === true, STEP_SUBJ);
  const subjDriver = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP_SUBJ + '-driver.log');
  T.ok('step driver log exists for t15a-fresh-subj (judged sim ran)', fs.existsSync(subjDriver) === true, STEP_SUBJ);
  T.ok('step corpus exists for t15a-fresh-subj (judged sim ran)', fs.existsSync(CORPUS_SUBJ) === true, STEP_SUBJ);
  let cherryPickHead = true;
  try { execSync('git rev-parse --verify CHERRY_PICK_HEAD', { cwd: REPO, stdio: 'pipe' }); } catch (e) { cherryPickHead = false; }
  T.ok('no cherry-pick is in progress', cherryPickHead === false, 'CHERRY_PICK_HEAD absent');
  const dirtyTracked = git('diff --name-only HEAD');
  const allowed = ['scripts/test-transplant15a-fresh.js', 'evidence/2026-11-14/sim-transplant15a-fresh-prereg.md', 'evidence/2026-11-14/sim-transplant15a-fresh.md'];
  const dirtyOther = dirtyTracked.split('\n').filter(function (ln) {
    return ln && !allowed.some(function (a) { return ln === a; });
  }).join('\n');
  T.ok('tracked tree is clean apart from this proof + the prereg + the evidence file (uncommitted until this proof passes)', dirtyOther === '', dirtyOther.slice(0, 200) || '(only allowed files)');

  // ---- 7. Corpus — both legs, 8/8 parse, fresh-band seeds, fix, driver-log match ----
  T.section('7. Corpus — 8/8 parse, fresh-band seeds, fix swapped in, driver-log match');
  const BASE_DAYS = { 190449: 107, 190450: 150, 190451: 109, 190452: 87, 190453: 77, 190454: 88, 190455: 134, 190456: 150 };
  const BASE_END = { 190449: 'village-lost', 190450: 'survived', 190451: 'village-lost', 190452: 'village-lost', 190453: 'village-lost', 190454: 'village-lost', 190455: 'village-lost', 190456: 'village-lost' };
  const BASE_DEATHS = { 190449: 78, 190450: 121, 190451: 83, 190452: 64, 190453: 71, 190454: 65, 190455: 71, 190456: 104 };
  const BASE_VETSAYS = { 190449: 22, 190450: 47, 190451: 25, 190452: 74, 190453: 20, 190454: 14, 190455: 44, 190456: 29 };
  const BASE_WAVE = { 190449: 4, 190450: 5, 190451: 5, 190452: 4, 190453: 4, 190454: 4, 190455: 5, 190456: 4 };
  const SUBJ_DAYS = { 190449: 110, 190450: 141, 190451: 116, 190452: 41, 190453: 78, 190454: 104, 190455: 96, 190456: 96 };
  const SUBJ_DEATHS = { 190449: 69, 190450: 137, 190451: 106, 190452: 41, 190453: 85, 190454: 60, 190455: 74, 190456: 83 };
  const SUBJ_VETSAYS = { 190449: 14, 190450: 38, 190451: 76, 190452: 67, 190453: 14, 190454: 15, 190455: 45, 190456: 31 };
  const SUBJ_WAVE = { 190449: 4, 190450: 5, 190451: 5, 190452: 3, 190453: 4, 190454: 4, 190455: 5, 190456: 4 };
  function checkCorpus(stepId, corpusDirPath, driverLogPath, anchor12, expDays, expEnd, expDeaths, expVetSays, expWave) {
    const logLines = fs.readFileSync(driverLogPath, 'utf8').split('\n').filter(function (l) { return l.indexOf('{') === 0; }).map(function (l) { return JSON.parse(l); });
    T.ok(stepId + ': driver log has 8 JSON lines', logLines.length === 8, logLines.length + ' lines');
    let survived = 0;
    let wave5 = 0;
    SEEDS.forEach(function (seed) {
      const file = path.join(corpusDirPath, 'culpritbisect-s' + seed + '-culpritbisect-pilot-fix.json');
      T.ok(stepId + ' seed ' + seed + ' file exists', fs.existsSync(file), path.basename(file));
      const j = JSON.parse(fs.readFileSync(file, 'utf8'));
      T.ok(stepId + ' seed ' + seed + ' parses with a FRESH-BAND seed + STEP', j.seed === seed && SEEDS.indexOf(j.seed) !== -1 && j.step === stepId, 'step=' + j.step);
      T.ok(stepId + ' seed ' + seed + ' ran on the ' + (stepId === STEP_BASE ? 'far-end' : 'subject') + ' anchor', j.anchorCommit === anchor12, j.anchorCommit);
      T.ok(stepId + ' seed ' + seed + ' has the fix swapped in', j.standingFix === true && j.standingSha === 'f8fda4295a99' && j.standingSwapped === true, j.standingSha);
      T.ok(stepId + ' seed ' + seed + ' ran the far-end policy', j.policySha === 'a7ff5c516440', j.policySha);
      T.ok(stepId + ' seed ' + seed + ' has 0 instrument errors', Array.isArray(j.instrumentErrors) && j.instrumentErrors.length === 0, 'errors=' + j.instrumentErrors.length);
      T.ok(stepId + ' seed ' + seed + ' days match the evidence table (' + expDays[seed] + ')', j.days === expDays[seed], 'days=' + j.days);
      T.ok(stepId + ' seed ' + seed + ' endReason is ' + expEnd[seed], j.endReason === expEnd[seed], j.endReason);
      T.ok(stepId + ' seed ' + seed + ' maxWave is ' + expWave[seed], j.maxWave === expWave[seed], 'maxWave=' + j.maxWave);
      T.ok(stepId + ' seed ' + seed + ' deaths match the evidence table (' + expDeaths[seed] + ')', j.deaths.length === expDeaths[seed], 'deaths=' + j.deaths.length);
      T.ok(stepId + ' seed ' + seed + ' vetSays match the evidence table (' + expVetSays[seed] + ')', j.vetSays.length === expVetSays[seed], 'vetSays=' + j.vetSays.length);
      const line = logLines.filter(function (l) { return l.seed === seed; })[0];
      T.ok(stepId + ' seed ' + seed + ' driver-log line matches the JSON', !!line && line.days === j.days && line.endReason === j.endReason && line.deaths === j.deaths.length && line.vetSays === j.vetSays.length && line.errors === j.instrumentErrors.length, line ? 'days=' + line.days + ' end=' + line.endReason : '(no line)');
      if (j.endReason === 'survived') survived++;
      if (j.maxWave >= 5) wave5++;
    });
    return { survived: survived, wave5: wave5 };
  }
  const baseRes = checkCorpus(STEP_BASE, CORPUS_BASE, DRIVER_BASE, '203a327750a2', BASE_DAYS, BASE_END, BASE_DEATHS, BASE_VETSAYS, BASE_WAVE);
  T.ok('baseline leg reads 1/8 survived', baseRes.survived === 1, baseRes.survived + '/8');
  T.ok('baseline leg reads wave-5 3/8', baseRes.wave5 === 3, baseRes.wave5 + '/8');
  const SUBJ_END = { 190449: 'village-lost', 190450: 'village-lost', 190451: 'village-lost', 190452: 'village-lost', 190453: 'village-lost', 190454: 'village-lost', 190455: 'village-lost', 190456: 'village-lost' };
  const subjRes = checkCorpus(STEP_SUBJ, CORPUS_SUBJ, DRIVER_SUBJ, '493d7a9753ae', SUBJ_DAYS, SUBJ_END, SUBJ_DEATHS, SUBJ_VETSAYS, SUBJ_WAVE);
  T.ok('subject leg reads 0/8 survived', subjRes.survived === 0, subjRes.survived + '/8');
  T.ok('subject leg reads wave-5 3/8', subjRes.wave5 === 3, subjRes.wave5 + '/8');
  // Field-for-field corpus comparison (round-1355 metric review: the
  // cheap decisive check). Unlike 15F (byte-identical corpora), the
  // pick is NOT deterministically inert here: days differ on all 8
  // seeds, deaths and vetSays on all 8 — trajectories diverge
  // everywhere. Only the survival read stays within one seed.
  let sameDays = 0, sameDeaths = 0, sameVet = 0, sameEnd = 0, sameWave = 0;
  SEEDS.forEach(function (seed) {
    const b = JSON.parse(fs.readFileSync(path.join(CORPUS_BASE, 'culpritbisect-s' + seed + '-culpritbisect-pilot-fix.json'), 'utf8'));
    const u = JSON.parse(fs.readFileSync(path.join(CORPUS_SUBJ, 'culpritbisect-s' + seed + '-culpritbisect-pilot-fix.json'), 'utf8'));
    if (b.days === u.days) sameDays++;
    if (b.deaths.length === u.deaths.length) sameDeaths++;
    if (b.vetSays.length === u.vetSays.length) sameVet++;
    if (b.endReason === u.endReason) sameEnd++;
    if (b.maxWave === u.maxWave) sameWave++;
  });
  T.ok('field-for-field: days identical on 0/8 seeds (pick moves trajectories, not inert)', sameDays === 0, sameDays + '/8');
  T.ok('field-for-field: deaths identical on 0/8 seeds', sameDeaths === 0, sameDeaths + '/8');
  T.ok('field-for-field: vetSays identical on 0/8 seeds', sameVet === 0, sameVet + '/8');
  T.ok('field-for-field: endReason identical on 7/8 seeds (only 190450 flips survived->lost)', sameEnd === 7, sameEnd + '/8');
  T.ok('field-for-field: maxWave identical on 7/8 seeds (only 190452 drops 4->3)', sameWave === 7, sameWave + '/8');
  // Analyzer adaptation: the repo analyzer hardcodes the collapse
  // band (it is NOT modified); the summaries were produced by a
  // scratch copy with only the SEEDS line edited, and carry the
  // fresh band in their seeds field.
  const repoAnalyzer = execSync('git show master:scripts/culpritbisect-analyze-20261113.js', { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  T.ok('repo analyzer (master) still hardcodes the collapse band (scratch-only adaptation, repo untouched)',
    repoAnalyzer.indexOf('const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];') !== -1, 'collapse band in repo analyzer');
  const sumBase = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP_BASE + '-summary.json'), 'utf8'));
  const sumSubj = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP_SUBJ + '-summary.json'), 'utf8'));
  T.ok('baseline summary seeds are the fresh band 190449–190456', JSON.stringify(sumBase.seeds) === JSON.stringify(SEEDS), JSON.stringify(sumBase.seeds));
  T.ok('subject summary seeds are the fresh band 190449–190456', JSON.stringify(sumSubj.seeds) === JSON.stringify(SEEDS), JSON.stringify(sumSubj.seeds));
  T.ok('baseline summary survived is 1', sumBase.survived === 1, 'survived=' + sumBase.survived);
  T.ok('subject summary survived is 0', sumSubj.survived === 0, 'survived=' + sumSubj.survived);
  T.ok('baseline summary median is 109d', sumBase.wall.medianDays === 109, 'median=' + sumBase.wall.medianDays);
  T.ok('subject summary median is 104d', sumSubj.wall.medianDays === 104, 'median=' + sumSubj.wall.medianDays);
  T.ok('baseline summary wave-5 is 3/8', sumBase.wall.wave5 === 3, 'wave5=' + sumBase.wall.wave5);
  T.ok('subject summary wave-5 is 3/8', sumSubj.wall.wave5 === 3, 'wave5=' + sumSubj.wall.wave5);
  T.ok('both summaries read national/table/wins 0', sumBase.wall.national === 0 && sumBase.wall.table === 0 && sumBase.wall.wins === 0 && sumSubj.wall.national === 0 && sumSubj.wall.table === 0 && sumSubj.wall.wins === 0, '0/0/0 both legs');
  T.ok('baseline summary deaths total is 657', sumBase.wall.deaths === 657, 'deaths=' + sumBase.wall.deaths);
  T.ok('subject summary deaths total is 655', sumSubj.wall.deaths === 655, 'deaths=' + sumSubj.wall.deaths);
  T.ok('baseline summary instrument errors are 0', sumBase.instrumentErrors === 0, 'errors=' + sumBase.instrumentErrors);
  T.ok('subject summary instrument errors are 0', sumSubj.instrumentErrors === 0, 'errors=' + sumSubj.instrumentErrors);

  // ---- 8. Verdict — BAND-INCONCLUSIVE per the binding fresh-band decision table ----
  T.section('8. Verdict — baseline 1/8 gates the table: BAND-INCONCLUSIVE, no verdict on the subject');
  T.ok('classifyFresh(0, 1) is BAND-INCONCLUSIVE (baseline ≤2/8 gates first)', classifyFresh(0, 1) === 'BAND-INCONCLUSIVE', classifyFresh(0, 1));
  T.ok('classifyFresh(1, 1) would also be BAND-INCONCLUSIVE (the baseline, not the subject, decides)', classifyFresh(1, 1) === 'BAND-INCONCLUSIVE', classifyFresh(1, 1));
  T.ok('the subject 0/8 is NOT called CARRIER (CARRIER needs baseline ≥3/8)', classifyFresh(0, 4) === 'CARRIER' && classifyFresh(0, 1) !== 'CARRIER', '0/8 on a 1/8 baseline is not CARRIER');
  T.ok('baseline summary verdict is BAD (bisect classification for ≤1/8)', sumBase.verdict === 'BAD', sumBase.verdict);
  T.ok('subject summary verdict is BAD (bisect classification for ≤1/8)', sumSubj.verdict === 'BAD', sumSubj.verdict);
  const ev = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15a-fresh.md'), 'utf8');
  T.ok('evidence file states the BAND-INCONCLUSIVE verdict', ev.indexOf('BAND-INCONCLUSIVE') !== -1, 'BAND-INCONCLUSIVE present');
  T.ok('evidence file records baseline 1/8 and subject 0/8', ev.indexOf('1/8') !== -1 && ev.indexOf('0/8') !== -1, '1/8 and 0/8 present');
  T.ok('evidence file records that 15A stays AMBIGUOUS on the old band (no verdict claimed here)',
    ev.indexOf('stays AMBIGUOUS') !== -1, 'old-band AMBIGUOUS carried');
  const pre2 = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15a-fresh-prereg.md'), 'utf8');
  T.ok('prereg carries the binding decision table (baseline gate first)', pre2.indexOf('BAND-INCONCLUSIVE if the baseline itself reads ≤2/8') !== -1, 'decision table present');

  // ---- 9. Standing restored — byte-identical to the far-end native ----
  T.section('9. Standing restored — byte-identical to the far-end native');
  // LANDING SHAPE (15C-narrowed precedent): the evidence commits
  // are rebased --onto master so the landing is evidence-only; the
  // subject is no longer an ancestor of HEAD. The native-standing
  // facts are therefore proven against the subject BRANCH (which
  // pick 1 never touched — the family does not touch standing.js,
  // §1 leg), and the no-game-code fact against the on-disk file
  // vs HEAD.
  const subjectStanding = gitShow(SUBJECT_BRANCH, 'src/js/standing.js');
  T.ok('subject-branch standing.js sha is 75762cb2...', sha256(subjectStanding) === FAR_NATIVE_STANDING_SHA, sha256(subjectStanding).slice(0, 12));
  T.ok('subject-branch standing.js equals the far-end blob', subjectStanding === gitShow(FAR, 'src/js/standing.js'), 'byte-identical to far end');
  const onDisk = fs.readFileSync(path.join(REPO, 'src', 'js', 'standing.js'), 'utf8');
  T.ok('on-disk standing.js equals HEAD blob', onDisk === gitShow('HEAD', 'src/js/standing.js'), 'byte-identical to HEAD');
  T.ok('no src/js file differs from HEAD', git('status --short -- src/js') === '', git('status --short -- src/js') || '(clean)');
  T.ok('fix file sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  // Prereg-commit ancestry resolves by message/subject, not hash
  // (an adoption rebase rewrites hashes).
  const armSubjects = git('log --format=%s HEAD');
  T.ok('prereg commit exists on the arm branch by subject (not hash)',
    armSubjects.indexOf('sim-transplant15a-fresh-a: prereg') !== -1 && armSubjects.indexOf('STEPs t15a-fresh-base / t15a-fresh-subj') !== -1, 'prereg subject present');

  // ---- 10. Evidence records ----
  T.section('10. Evidence records — verdict, tables, wall, sense-testing, metric review, telemetry, infra');
  T.ok('evidence file exists', ev.length > 0, 'evidence/2026-11-14/sim-transplant15a-fresh.md');
  T.ok('evidence records both per-seed tables (baseline 107/150/109/87/77/88/134/150; subject 110/141/116/41/78/104/96/96)',
    ev.indexOf('107') !== -1 && ev.indexOf('141') !== -1 && ev.indexOf('190452') !== -1, 'per-seed tables present');
  T.ok('evidence records the wall numbers (national 0, table 0, wins 0, wave-5 3/8 both legs, medians 109d/104d)',
    ev.indexOf('national 0') !== -1 && ev.indexOf('wave-5 3/8') !== -1 && ev.indexOf('109d') !== -1 && ev.indexOf('104d') !== -1, 'wall numbers present');
  T.ok('evidence records the sense-testing section (transcripts read, people-like)',
    ev.indexOf('Sense-testing') !== -1 && ev.indexOf('read like people') !== -1, 'sense-testing present');
  T.ok('evidence records the Blooded beat-vs-flag corroboration (beat fires, flag false, on both legs)',
    ev.indexOf('BLOODED BEAT vs FLAG') !== -1 && ev.indexOf('corroborated') !== -1, 'blooded flag present');
  T.ok('evidence records the low-trust refusal repeat flag (seed 190452, both legs)',
    ev.indexOf('low-trust refusal') !== -1 && ev.indexOf('190452') !== -1, 'refusal flag present');
  T.ok('evidence records the field-for-field comparison (days 0/8 identical, not inert)',
    ev.indexOf('Field-for-field') !== -1 && ev.indexOf('0/8') !== -1, 'field comparison present');
  T.ok('evidence records the metric review (fresh band harsher than the collapse band)',
    ev.indexOf('Metric review') !== -1 && ev.indexOf('harsher') !== -1, 'metric review present');
  T.ok('evidence records the telemetry refusal (recorder-corpus class)',
    ev.indexOf('Telemetry deviation check') !== -1 && ev.indexOf('REFUSED') !== -1, 'telemetry refusal present');
  T.ok('evidence records the step-script hazard (/tmp copy route, SEEDS edit)',
    ev.indexOf('STEP-SCRIPT HAZARD') !== -1 && ev.indexOf('/tmp') !== -1, 'step-script hazard present');
  T.ok('evidence records the analyzer hardcode + scratch-only adaptation',
    ev.indexOf('ANALYZER HARDCODE') !== -1 && ev.indexOf('scratch-only') !== -1, 'analyzer adaptation present');
  T.ok('evidence records the service-restart recovery (leg 1 interrupted at 1 seed, re-run clean)',
    ev.indexOf('SERVICE RESTART') !== -1 && ev.indexOf('re-run') !== -1, 'restart recovery present');
  T.ok('evidence records the safe-commit index clobber repair',
    ev.indexOf('INDEX CLOBBER') !== -1 && ev.indexOf('update-index') !== -1, 'clobber repair present');

  T.done();
})();
