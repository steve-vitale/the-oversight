#!/usr/bin/env node
// test-transplant15c-narrowed.js — proof test for the H1 TRANSPLANT,
// family 15C fight brains (arm sim-transplant15c-narrowed-a).
//
// THE QUESTION (evidence/2026-11-14/sim-transplant15c-narrowed-prereg.md,
// a RECONSTRUCTION written after the step ran — the cancelled worker left
// no prereg; the judging bar itself predates the step via the binding
// prereg, round-2115 §3): land origin family 15C — OVE-49 (green-list
// Phase 5 fight-brain knowledge probe, test-only) + OVE-52 (wire shared
// fighterState into both fight brains) — onto the far end 203a32775
// (GOOD 4/8) and measure whether it alone collapses it. Verdicts
// (binding thresholds): <=1/8 CARRIER, 2/8 AMBIGUOUS (re-run once),
// >=3/8 NOT-CARRIER.
//
// OUTCOME — CARRIER: STEP t15c-narrowed, seeds 190391–190398, 150d
// death-aware, competent verbatim own-policy, standing fix swapped in
// per seed: 1/8 survived (190394 only), median 118d, wave-5 2/8,
// national 0, table 0, wins 0.
//
// WHAT THIS TEST PROVES:
//   1. Subject chain — the subject's history 203a32775..12fd9d694 is EXACTLY the
//      two single-parent 15C picks (OVE-49 7183c942e, then OVE-52
//      12fd9d694), with the right parents and the right js footprint
//      (OVE-49 test-only, OVE-52 js=4, combined +740/-35 over 6 files).
//      LANDING SHAPE (coordinator addendum): the evidence commits were
//      rebased --onto master so the landing is evidence-only; the subject
//      lives on branch transplant-15c-narrowed-subject at 12fd9d694 and the
//      arm branch holds exactly the 4 evidence commits on top of master.
//   2. Corpus — 8/8 per-seed JSONs parse, seeds match 190391–190398,
//      STEP is t15c-narrowed, fix swapped in (standingSha f8fda429...,
//      anchor 12fd9d694d3f, policy a7ff5c516440), 0 instrument errors,
//      and days/endReason/deaths/vetSays match the driver log line
//      for line for each seed.
//   3. Verdict — classifyTransplant maps every survived count to
//      CARRIER / AMBIGUOUS / NOT-CARRIER per the binding thresholds,
//      and the corpus's 1/8 reads CARRIER; the evidence file states it.
//   4. Standing restored — the SUBJECT branch's src/js/standing.js is
//      byte-identical to the far-end native (sha256 75762cb2..., verified
//      from the far-end blob, not from a note); the step's fix swap was
//      restored before commit (attested in the evidence). The landing
//      branch itself changes no game code: on-disk standing.js equals the
//      HEAD blob and `git diff` is empty for src/js.
//   5. Prior files unchanged — the 7 per-seed files left by the
//      cancelled worker still hash to the sha256 recorded in the prereg
//      before the fill seed ran (the fill touched only seed 190398).
//   6. Reconstruction recorded — the prereg says plainly it is a
//      reconstruction written after the step, and the evidence file
//      records the cancellation/recovery and the CARRIER verdict.
//
// Usage: node scripts/test-transplant15c-narrowed.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant15c-narrowed');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const OVE49 = '7183c942e07561bdcbea0b6a281a1d680b404e52';
const OVE52 = '12fd9d694d3fde3a4d274cdee948f409c77f4462';
const SUBJECT_BRANCH = 'transplant-15c-narrowed-subject';
const STEP = 't15c-narrowed';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const FAR_NATIVE_STANDING_SHA = '75762cb2259da3d4d51c57de1548404b45d8269d36a4503341507ed807540e7c';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const CORPUS_DIR = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-t15c-narrowed');
const DRIVER_LOG = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-t15c-narrowed-driver.log');
// sha256 of the 7 per-seed files as recorded in the prereg BEFORE the
// fill seed ran (2026-11-14 ~12:27Z). The fill must not have touched them.
const PRIOR_SHA = {
  190391: 'b5260fe88eaf848786a6dd4b493925816a6a3745d9021552ce63c9225e127039',
  190392: '40d9be681eeaf459970ac8c56a23001757cbb4c6de19183afcd7f944e3d96ab1',
  190393: 'd9092e5874fe39e1b618685809391e91de4d929641c178b28f60a11ce1f25cd5',
  190394: '68498d57be7bdfea2e4aea69a422fc673c78036c826c575efe4f25e3e3c897b2',
  190395: 'a440693704554ba051184f9871b7ccb72d83717d6d38c73ef03a2b44673ebc7b',
  190396: '971c8f4f44f923c0ec36b73afcfed320ca8ada605c6d46b9ff152bdeb245b44e',
  190397: '1a36af01334da5fb532ca5b40438a4ea25af68dc5f9f499a160a1e4bde208a07',
};
const EXPECTED_DAYS = { 190391: 60, 190392: 75, 190393: 115, 190394: 150, 190395: 106, 190396: 128, 190397: 121, 190398: 149 };
const EXPECTED_JS = ['src/js/engine/combat.js', 'src/js/fieldFights.js', 'src/js/game.js', 'src/js/villager-agency.js'];

function sha256(text) { return crypto.createHash('sha256').update(text).digest('hex'); }
function git(args) { return execSync('git ' + args, { cwd: REPO }).toString().trim(); }
function gitShow(commit, file) { return execSync('git show ' + commit + ':' + file, { cwd: REPO }).toString(); }
function classifyTransplant(n) {
  if (n <= 1) return 'CARRIER';
  if (n === 2) return 'AMBIGUOUS';
  if (n >= 3) return 'NOT-CARRIER';
  return 'UNCLASSIFIABLE';
}

T.section('1. Subject chain — exactly the two 15C picks on the far end');
(function () {
  const range = git('log --format=%H\\ %P\\ %s ' + FAR + '..' + OVE52).split('\n').filter(Boolean);
  T.ok('range far end..OVE-52 is exactly 2 commits', range.length === 2, range.length + ' commits');
  const first = range[1].split(' '); // oldest first in git log order is last
  const second = range[0].split(' ');
  T.ok('first pick is OVE-49 7183c942e', first[0] === OVE49, first[0].slice(0, 12));
  T.ok('OVE-49 parent is the far end', first[1] === FAR_FULL, first[1].slice(0, 12));
  T.ok('OVE-49 subject names the knowledge probe', range[1].indexOf('OVE-49') !== -1, range[1].slice(0, 100));
  T.ok('second pick is OVE-52 12fd9d694', second[0] === OVE52, second[0].slice(0, 12));
  T.ok('OVE-52 parent is OVE-49', second[1] === OVE49, second[1].slice(0, 12));
  T.ok('OVE-52 subject names fighterState', range[0].indexOf('OVE-52') !== -1, range[0].slice(0, 100));
  T.ok('subject tip is the OVE-52 commit', git('rev-parse ' + OVE52) === OVE52, git('rev-parse --short ' + OVE52));
  T.ok('subject branch points at OVE-52', git('rev-parse ' + SUBJECT_BRANCH) === OVE52, git('rev-parse --short ' + SUBJECT_BRANCH));
  // Merge-safe: the count form (master..HEAD === 4) broke the moment the
  // coordinator addendum became a 5th commit, and can never pass on merged
  // master (HEAD == master). Ancestry of the 4 rebased arm commits proves
  // the same fact on the branch and on merged master alike.
  var ARM_COMMITS = ['f26bad4e8ad27c87cc55d6a06318ab33914298e5', '520ab0df2e121c9628f308922f1e22be46b49a96', '4c682e639cf3bd0fc58dc2bc1de60c46405c7057', 'bc679ec4ca804427ae7499a0a2788a259bc08f46'];
  T.ok('the 4 evidence commits are ancestors of HEAD', ARM_COMMITS.every(function (c) { return git('merge-base --is-ancestor ' + c + ' HEAD; echo $?') === '0'; }), 'all 4 ancestors');
  const js49 = git('diff --name-only ' + OVE49 + '^1 ' + OVE49 + ' -- src/js');
  T.ok('OVE-49 touches no src/js file (test-only)', js49 === '', js49 || '(none)');
  const files49 = git('diff --name-only ' + OVE49 + '^1 ' + OVE49).split('\n').filter(Boolean);
  T.ok('OVE-49 touches exactly the probe test file', files49.length === 1 && files49[0] === 'scripts/test-fight-brain-knowledge-probe.js', files49.join(', '));
  const jsFiles = git('diff --name-only ' + FAR + ' ' + OVE52 + ' -- src/js').split('\n').filter(Boolean).sort();
  T.ok('family touches exactly the 4 expected src/js files', JSON.stringify(jsFiles) === JSON.stringify(EXPECTED_JS.slice().sort()), jsFiles.join(', '));
  const numstat = git('diff --numstat ' + FAR + ' ' + OVE52).split('\n').filter(Boolean)
    .reduce(function (acc, line) { const p = line.split('\t'); return { ins: acc.ins + parseInt(p[0], 10), del: acc.del + parseInt(p[1], 10) }; }, { ins: 0, del: 0 });
  T.ok('family diff is +740/-35 over 6 files', numstat.ins === 740 && numstat.del === 35, '+' + numstat.ins + '/-' + numstat.del);
  T.ok('family touches no policy file', git('diff --name-only ' + FAR + ' ' + OVE52 + ' -- scripts/policies') === '', '(none)');
  T.ok('family does not touch standing.js', git('diff --name-only ' + FAR + ' ' + OVE52 + ' -- src/js/standing.js') === '', '(absent)');
})();

T.section('2. Corpus — 8/8 parse, seeds + STEP + fix, driver-log match');
(function () {
  const logLines = fs.readFileSync(DRIVER_LOG, 'utf8').split('\n').filter(Boolean).map(function (l) { return JSON.parse(l); });
  T.ok('driver log has 8 lines (7 prior + 1 fill)', logLines.length === 8, logLines.length + ' lines');
  let survived = 0;
  SEEDS.forEach(function (seed) {
    const file = path.join(CORPUS_DIR, 'culpritbisect-s' + seed + '-culpritbisect-pilot-fix.json');
    T.ok('seed ' + seed + ' file exists', fs.existsSync(file), path.basename(file));
    const j = JSON.parse(fs.readFileSync(file, 'utf8'));
    T.ok('seed ' + seed + ' parses with matching seed + STEP', j.seed === seed && j.step === STEP, 'step=' + j.step);
    T.ok('seed ' + seed + ' ran on the subject anchor', j.anchorCommit === '12fd9d694d3f', j.anchorCommit);
    T.ok('seed ' + seed + ' has the fix swapped in', j.standingFix === true && j.standingSha === 'f8fda4295a99' && j.standingSwapped === true, j.standingSha);
    T.ok('seed ' + seed + ' ran the far-end policy', j.policySha === 'a7ff5c516440', j.policySha);
    T.ok('seed ' + seed + ' has 0 instrument errors', Array.isArray(j.instrumentErrors) && j.instrumentErrors.length === 0, 'errors=' + j.instrumentErrors.length);
    T.ok('seed ' + seed + ' days match the prereg table (' + EXPECTED_DAYS[seed] + ')', j.days === EXPECTED_DAYS[seed], 'days=' + j.days);
    const line = logLines.filter(function (l) { return l.seed === seed; })[0];
    T.ok('seed ' + seed + ' driver-log line matches the JSON', !!line && line.days === j.days && line.endReason === j.endReason && line.deaths === j.deaths.length && line.vetSays === j.vetSays.length && line.errors === j.instrumentErrors.length, line ? 'days=' + line.days + ' end=' + line.endReason : '(no line)');
    if (j.endReason === 'survived') survived++;
  });
  T.ok('corpus reads 1/8 survived', survived === 1, survived + '/8');
  const wave5 = SEEDS.filter(function (s) { const j = JSON.parse(fs.readFileSync(path.join(CORPUS_DIR, 'culpritbisect-s' + s + '-culpritbisect-pilot-fix.json'), 'utf8')); return j.maxWave >= 5; }).length;
  T.ok('corpus reads wave-5 2/8', wave5 === 2, wave5 + '/8');
  const won = SEEDS.filter(function (s) { const j = JSON.parse(fs.readFileSync(path.join(CORPUS_DIR, 'culpritbisect-s' + s + '-culpritbisect-pilot-fix.json'), 'utf8')); return j.won; }).length;
  T.ok('corpus reads wins 0/8', won === 0, won + '/8');
})();

T.section('3. Verdict — binding thresholds, corpus reads CARRIER');
(function () {
  const cases = [[0, 'CARRIER'], [1, 'CARRIER'], [2, 'AMBIGUOUS'], [3, 'NOT-CARRIER'], [4, 'NOT-CARRIER'], [8, 'NOT-CARRIER']];
  cases.forEach(function (pair) {
    T.ok('survived ' + pair[0] + ' -> ' + pair[1], classifyTransplant(pair[0]) === pair[1], classifyTransplant(pair[0]));
  });
  T.ok('1/8 classifies CARRIER', classifyTransplant(1) === 'CARRIER', 'CARRIER');
  const ev = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15c-narrowed.md'), 'utf8');
  T.ok('evidence file states the CARRIER verdict', ev.indexOf('Verdict: CARRIER') !== -1, 'CARRIER present');
  T.ok('evidence file records 1/8 survived', ev.indexOf('1/8 survived') !== -1, '1/8 present');
  const pre = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15c-narrowed-prereg.md'), 'utf8');
  T.ok('prereg carries the binding thresholds', pre.indexOf('≤1/8 CARRIER') !== -1 && pre.indexOf('≥3/8 NOT-CARRIER') !== -1, 'thresholds present');
})();

T.section('4. Standing restored — byte-identical to the far-end native');
(function () {
  // LANDING SHAPE (coordinator addendum 2026-11-14): the evidence commits
  // were rebased --onto master so the landing is evidence-only; the subject
  // is no longer an ancestor of HEAD. The native-standing facts are therefore
  // proven against the subject BRANCH (which the picks never touched —
  // the family does not touch standing.js, leg above), and the no-game-code
  // fact against the on-disk file vs HEAD.
  const subjectStanding = gitShow(SUBJECT_BRANCH, 'src/js/standing.js');
  T.ok('subject-branch standing.js sha is 75762cb2...', sha256(subjectStanding) === FAR_NATIVE_STANDING_SHA, sha256(subjectStanding).slice(0, 12));
  T.ok('subject-branch standing.js equals the far-end blob', subjectStanding === gitShow(FAR, 'src/js/standing.js'), 'byte-identical to far end');
  const onDisk = fs.readFileSync(path.join(REPO, 'src', 'js', 'standing.js'), 'utf8');
  T.ok('on-disk standing.js equals HEAD blob', onDisk === gitShow('HEAD', 'src/js/standing.js'), 'byte-identical to HEAD');
  T.ok('no src/js file differs from HEAD', git('status --short -- src/js') === '', git('status --short -- src/js') || '(clean)');
  T.ok('fix file sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
})();

T.section('5. Prior files unchanged — the 7 pre-fill per-seed files');
(function () {
  Object.keys(PRIOR_SHA).forEach(function (seed) {
    const file = path.join(CORPUS_DIR, 'culpritbisect-s' + seed + '-culpritbisect-pilot-fix.json');
    const hash = sha256(fs.readFileSync(file));
    T.ok('seed ' + seed + ' sha256 unchanged since the prereg record', hash === PRIOR_SHA[seed], hash.slice(0, 12));
  });
  const fillHash = sha256(fs.readFileSync(path.join(CORPUS_DIR, 'culpritbisect-s190398-culpritbisect-pilot-fix.json')));
  T.ok('fill seed 190398 file exists with its own hash', fillHash.length === 64, fillHash.slice(0, 12));
})();

T.section('6. Reconstruction recorded — no backdating');
(function () {
  const pre = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15c-narrowed-prereg.md'), 'utf8');
  T.ok('prereg says plainly it is a reconstruction', pre.indexOf('RECONSTRUCTION') !== -1, 'RECONSTRUCTION present');
  T.ok('prereg says it was NOT written before the step', pre.indexOf('NOT written before the step') !== -1, 'not-before-the-step present');
  T.ok('prereg says it does not backdate', pre.indexOf('does not backdate') !== -1 || pre.indexOf('instead of backdating') !== -1, 'no-backdate present');
  const ev = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant15c-narrowed.md'), 'utf8');
  T.ok('evidence records the cancellation and recovery', ev.indexOf('cancelled') !== -1 && ev.indexOf('verified everything from') !== -1, 'cancellation recorded');
  T.ok('evidence records the telemetry refusal', ev.indexOf('Telemetry deviation check') !== -1 && ev.indexOf('REFUSES') !== -1, 'telemetry refusal recorded');
})();

T.done();
