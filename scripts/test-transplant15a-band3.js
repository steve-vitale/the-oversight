#!/usr/bin/env node
// test-transplant15a-band3.js — proof test for the H1 TRANSPLANT,
// family 15A PICK-1 THIRD BAND (OVE-48, arm sim-transplant15a-band3-a).
//
// THE QUESTION (evidence/2026-11-14/sim-transplant15a-band3-prereg.md,
// prereg committed before any judged sim ran): OVE-48 pick-1 alone
// read AMBIGUOUS 2/8 TWICE on the collapse band (190391–190398),
// then BAND-INCONCLUSIVE on fresh band 1 (190449–190456 — the far
// end itself read 1/8 there, so the band could not discriminate).
// COORDINATOR DECISION (this run): this is the LAST band for 15A
// pick-1. One more discriminating band settles it; a third
// BAND-INCONCLUSIVE also closes the item as AMBIGUOUS, unresolvable
// by band variation — do not propose a fourth band.
//
// Two legs, both 150d death-aware, competent verbatim own-policy,
// standing-fix swap f8fda4295a99 per seed:
//   Leg 1 (baseline): far end 203a32775 alone, STEP t15a-band3-base.
//   Leg 2 (subject): transplant-15a-narrowed-subject 493d7a975,
//   STEP t15a-band3-subj — run ONLY if leg 1 gates in (baseline
//   >=3/8). If the baseline reads <=2/8 the arm stops judging and
//   does NOT run the subject leg (task gate, stricter than the
//   fresh arm, which ran both legs regardless).
// DECISION TABLE (binding, this band only): baseline <=2/8 ->
// BAND-INCONCLUSIVE (band cannot discriminate, no verdict on the
// subject; this third BAND-INCONCLUSIVE closes 15A pick-1 as
// AMBIGUOUS permanently — unresolvable by band variation, no
// fourth band); otherwise subject <=1/8 -> CARRIER, subject 2/8 ->
// AMBIGUOUS (stands permanently after this third band, do NOT
// re-run), subject >=3/8 -> NOT-CARRIER.
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
// and the /tmp copy's SEEDS line is edited to the band-3 band
// before running. The proof verifies the repo script still names
// the collapse band (unmodified) and that every per-seed JSON in
// both corpora carries a band-3 seed.
// ANALYZER ADAPTATION (pre-registered, from the fresh arm's
// metric review — NOT an improvisation): scripts/culpritbisect
// -analyze-20261113.js hardcodes the collapse band, so the step
// script's analyzer leg fails on a fresh band even when the driver
// corpus is 8/8 complete. Recovery, same as the fresh arm: restore
// the four tooling scratch files from master, edit ONLY the SEEDS
// line of the scratch analyzer copy (diff vs master: that one
// line), run it with the leg's STEP id appending to the driver
// log, verify the summary (RC 0, seeds field carries the band-3
// band), delete the scratch. The repo analyzer is NOT modified.
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
//   4. Verdict mapping — classifyBand3 maps every (subject,
//      baseline) pair per the binding band-3 decision table,
//      including the gate-first rule and the third-
//      BAND-INCONCLUSIVE closure.
//   5. Prereg recorded in the evidence file (base, pick, band-3
//      band, both STEP ids, decision table, freshness check with
//      rejected bands, coordinator decision, canon note,
//      step-script + analyzer adaptations, gate rule).
//   6. Base state — HEAD is on sim-transplant15a-band3-a, no src/js
//      file differs from HEAD, on-disk standing.js is byte-identical
//      to HEAD, the step-script tooling source (master) still
//      carries all four scratch files, the repo step script still
//      names the collapse band (unmodified), no STEP
//      t15a-band3-base / t15a-band3-subj summary/driver log/corpus
//      exists, no cherry-pick is in progress.
// STAGE 2 (appended after the steps) proves the judged runs:
//   7. Corpus — 8/8 per-seed JSONs parse per leg that ran, seeds
//      match 190457–190464, STEP ids match, fix swapped in
//      (standingSha f8fda429..., correct anchor per leg, policy
//      a7ff5c51), 0 instrument errors, and days/endReason/deaths/
//      vetSays match the driver log line for each seed.
//   8. Verdict — the corpora's survived counts classify per the
//      binding band-3 decision table; the evidence file states it.
//   9. Standing restored — the SUBJECT branch's src/js/standing.js
//      is byte-identical to the far-end native (sha256 75762cb2...,
//      verified from the far-end blob); the landing branch itself
//      changes no game code: on-disk standing.js equals the HEAD
//      blob and `git diff` is empty for src/js.
//  10. Evidence records — verdict, per-seed tables, wall numbers,
//      sense-testing, metric review, telemetry refusal.
//
// Usage: node scripts/test-transplant15a-band3.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant15a-band3');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const PICK1 = 'c937de65f32d26e064d8935dd984490b2ee50a6c';
const FIRST1 = '1e03b3d69480e2d57c08bd2629aeffdeee4e6f32';
const SUBJECT = '493d7a9753aee1c154cf809402e6691ee9a5429e';
const SUBJECT_BRANCH = 'transplant-15a-narrowed-subject';
const STEP_BASE = 't15a-band3-base';
const STEP_SUBJ = 't15a-band3-subj';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const FAR_NATIVE_STANDING_SHA = '75762cb2259da3d4d51c57de1548404b45d8269d36a4503341507ed807540e7c';
const SEEDS = [190457, 190458, 190459, 190460, 190461, 190462, 190463, 190464];
const CORPUS_BASE = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP_BASE);
const CORPUS_SUBJ = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP_SUBJ);
const DRIVER_BASE = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP_BASE + '-driver.log');
const DRIVER_SUBJ = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP_SUBJ + '-driver.log');
const PRED1_TREE = '6d6216e3e414518d2c335829e130e65ec849941b';

function sha256(text) { return crypto.createHash('sha256').update(text).digest('hex'); }
function git(args) { return execSync('git ' + args, { cwd: REPO, stdio: 'pipe' }).toString().trim(); }
function gitShow(commit, file) { return execSync('git show ' + commit + ':' + file, { cwd: REPO, stdio: 'pipe' }).toString(); }
// Binding band-3 decision table (prereg): the baseline gates
// discrimination first; the subject count is judged only when the
// baseline reads >=3/8. A 2/8 subject is AMBIGUOUS and stands
// permanently after this third band (do NOT re-run — deterministic
// re-run is vacuous, round-1355 metric review). A third
// BAND-INCONCLUSIVE closes the item as AMBIGUOUS, unresolvable by
// band variation — no fourth band.
function classifyBand3(subject, baseline) {
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

  // ---- 4. Verdict mapping — band-3 decision table ----
  T.section('4. Verdict mapping — binding band-3 decision table');
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
      classifyBand3(row[0], row[1]) === row[2], classifyBand3(row[0], row[1]));
  }
  T.ok('the baseline gate decides first (subject 0/8 on a 1/8 baseline is BAND-INCONCLUSIVE, not CARRIER)',
    classifyBand3(0, 1) === 'BAND-INCONCLUSIVE' && classifyBand3(0, 4) === 'CARRIER', 'gate-first');
  T.ok('the old-band table is NOT reused here (2/8 alone no longer triggers a re-run)',
    classifyBand3(2, 4) === 'AMBIGUOUS', 'AMBIGUOUS, no re-run leg');
  T.ok('a third BAND-INCONCLUSIVE closes the item (prereg: no fourth band, AMBIGUOUS stands permanently)',
    classifyBand3(0, 1) === 'BAND-INCONCLUSIVE', 'closure rule recorded in prereg §Decision table');

  // ---- 5. Prereg recorded in the evidence file ----
  T.section('5. Prereg recorded in the evidence file');
  const prePath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15a-band3-prereg.md');
  const pre = fs.existsSync(prePath) ? fs.readFileSync(prePath, 'utf8') : '';
  T.ok('prereg file exists', pre.length > 0, prePath);
  T.ok('prereg names pick c937de65f (OVE-48)', pre.indexOf('c937de65f') !== -1, 'pick 1 present');
  T.ok('prereg names the far end 203a32775', pre.indexOf('203a32775') !== -1, 'far end present');
  T.ok('prereg names the band-3 band 190457-190464', pre.indexOf('190457') !== -1 && pre.indexOf('190464') !== -1, 'band-3 band present');
  T.ok('prereg names both STEP ids (t15a-band3-base, t15a-band3-subj)', pre.indexOf('t15a-band3-base') !== -1 && pre.indexOf('t15a-band3-subj') !== -1, 'STEP ids present');
  T.ok('prereg records the decision table (baseline ≤2/8 → BAND-INCONCLUSIVE, gate first)',
    pre.indexOf('BAND-INCONCLUSIVE if the baseline itself reads ≤2/8') !== -1, 'BAND-INCONCLUSIVE rule present');
  T.ok('prereg records the CARRIER rule (subject ≤1/8 AND baseline ≥3/8)',
    pre.indexOf('CARRIER if subject ≤1/8 AND baseline ≥3/8') !== -1, 'CARRIER rule present');
  T.ok('prereg records the AMBIGUOUS rule (subject 2/8, stands permanently after this third band)',
    pre.indexOf('AMBIGUOUS if subject reads 2/8') !== -1 && pre.indexOf('stands permanently') !== -1, 'AMBIGUOUS rule present');
  T.ok('prereg records the NOT-CARRIER rule (subject ≥3/8)',
    pre.indexOf('NOT-CARRIER if subject ≥3/8') !== -1, 'NOT-CARRIER rule present');
  T.ok('prereg records the third-band closure (third BAND-INCONCLUSIVE closes the item, no fourth band)',
    pre.indexOf('no fourth band') !== -1, 'closure rule present');
  T.ok('prereg records the gate rule (subject leg runs ONLY if the baseline gates in)',
    pre.indexOf('only if gated in') !== -1, 'gate rule present');
  T.ok('prereg records the freshness check (zero hits in .md, prereg, tracker)',
    pre.indexOf('Freshness check') !== -1 && pre.indexOf('ZERO hits in any') !== -1, 'freshness section present');
  T.ok('prereg records the rejected bands (190391, 190449, 190401, 190411, 190419, 190441)',
    pre.indexOf('190391') !== -1 && pre.indexOf('190449') !== -1 && pre.indexOf('190401') !== -1 && pre.indexOf('190411') !== -1 && pre.indexOf('190419') !== -1 && pre.indexOf('190441') !== -1, 'rejected bands present');
  T.ok('prereg records the subject tip 493d7a975 and the predicted tree 6d6216e3…', pre.indexOf('493d7a975') !== -1 && pre.indexOf('6d6216e3') !== -1, 'subject tip+tree present');
  T.ok('prereg records the coordinator decision (this run is the LAST band for 15A pick-1)',
    pre.indexOf('LAST band') !== -1, 'coordinator decision present');
  T.ok('prereg records the old-band 2/8-twice read and the fresh-band-1 BAND-INCONCLUSIVE read',
    pre.indexOf('2/8 TWICE') !== -1 && pre.indexOf('BAND-INCONCLUSIVE') !== -1, 'prior-band history present');
  T.ok('prereg records the canon note (VILLAGER-BRAIN.md Phase 4, convoSelectWant reads commitment + top drive)',
    pre.indexOf('VILLAGER-BRAIN.md') !== -1 && pre.indexOf('current commitment and') !== -1, 'canon note present');
  T.ok('prereg records the step-script adaptation (/tmp copy, SEEDS line edited to the band-3 band, repo script NOT modified)',
    pre.indexOf('STEP-SCRIPT ADAPTATION') !== -1 && pre.indexOf('NOT modified') !== -1 && pre.indexOf('190457,...,190464') !== -1, 'step-script adaptation present');
  T.ok('prereg records the analyzer adaptation (scratch-only SEEDS edit, named up front)',
    pre.indexOf('ANALYZER ADAPTATION') !== -1 && pre.indexOf('scratch-only') !== -1, 'analyzer adaptation present');
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
  T.ok('HEAD is on the arm branch sim-transplant15a-band3-a (worktree-only)', worktreeOnly(headBranch === 'sim-transplant15a-band3-a'), 'HEAD=' + headBranch);
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
  T.ok('repo step script does NOT name the band-3 band (the /tmp copy carries it, not the repo)',
    stepSrc.indexOf('190457') === -1, 'no band-3 band in repo script');
  // STAGE 2 (appended after the steps): the judged runs exist now,
  // so the six "no step ..." legs below are replaced by "step ran"
  // legs for the legs that actually ran (baseline always; subject
  // only if gated in).
  const baseSummary = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP_BASE + '-summary.json');
  T.ok('no step summary exists for t15a-band3-base (judged sim not run yet)', fs.existsSync(baseSummary) === false, STEP_BASE);
  const baseDriver = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP_BASE + '-driver.log');
  T.ok('no step driver log exists for t15a-band3-base (judged sim not run yet)', fs.existsSync(baseDriver) === false, STEP_BASE);
  T.ok('no step corpus exists for t15a-band3-base (judged sim not run yet)', fs.existsSync(CORPUS_BASE) === false, STEP_BASE);
  const subjSummary = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP_SUBJ + '-summary.json');
  T.ok('no step summary exists for t15a-band3-subj (judged sim not run yet)', fs.existsSync(subjSummary) === false, STEP_SUBJ);
  const subjDriver = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP_SUBJ + '-driver.log');
  T.ok('no step driver log exists for t15a-band3-subj (judged sim not run yet)', fs.existsSync(subjDriver) === false, STEP_SUBJ);
  T.ok('no step corpus exists for t15a-band3-subj (judged sim not run yet)', fs.existsSync(CORPUS_SUBJ) === false, STEP_SUBJ);
  let cherryPickHead = true;
  try { execSync('git rev-parse --verify CHERRY_PICK_HEAD', { cwd: REPO, stdio: 'pipe' }); } catch (e) { cherryPickHead = false; }
  T.ok('no cherry-pick is in progress', cherryPickHead === false, 'CHERRY_PICK_HEAD absent');
  const dirtyTracked = git('diff --name-only HEAD');
  const allowed = ['scripts/test-transplant15a-band3.js', 'evidence/2026-11-14/sim-transplant15a-band3-prereg.md'];
  const dirtyOther = dirtyTracked.split('\n').filter(function (ln) {
    return ln && !allowed.some(function (a) { return ln === a; });
  }).join('\n');
  T.ok('tracked tree is clean apart from this proof + the prereg (uncommitted until this proof passes)', dirtyOther === '', dirtyOther.slice(0, 200) || '(only allowed files)');

  T.done();
})();
