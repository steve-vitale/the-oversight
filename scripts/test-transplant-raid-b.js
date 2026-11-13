#!/usr/bin/env node
// test-transplant-raid-b.js — proof test for the H1 TRANSPLANT, family 2
// (arm sim-transplant-raid-b). Far end 203a32775 + PR #6
// raid-danger-heard-c0a3 (merge 7ddcdfff9), competent verbatim, 150d,
// seeds 190391–190398. Prereg: evidence/2026-11-13/sim-transplant-raid-b.md.
//
// The shared machinery is proven by the reused
// scripts/test-culpritbisect-a.js (116 legs, run as-is). THIS test
// proves the TRANSPLANT mechanics on top of it:
//   1. Seed-band identity — transplant driver + analyzer name exactly
//      seeds 190391–190398; each step writes its own corpus dir and
//      never another arm's.
//   2. Driver guards (transplant leg) — legGuard accepts the fix text
//      and the origin native text (marker present) with ANY policy
//      (record-only), records the swapped flag correctly, and refuses
//      markerless standing and unknown LEGs; the driver run as a
//      script refuses LEG=transplant without STEP (exit 2) and never
//      runs its main loop when required as a module.
//   3. Transplant verdict mapping — classifyTransplant maps every
//      survived count to CARRIER / AMBIGUOUS / NOT-CARRIER /
//      UNCLASSIFIABLE; the rank read maps regional reach the same way
//      as the bisect.
//   4. Subject-diff completeness (SUBJECT_SHA env) — the subject
//      branch tip is exactly one cherry-pick on top of the far end,
//      and its diff vs the far end is the family diff, file for file
//      and line-count for line-count.
//   5. Step-script restore source — the step runner restores its
//      tooling scratch from sim-transplant-raid-b, which exists and
//      carries all four scratch files; the restore source is NOT
//      master (the transplant variants live only on the arm branch).
//   6. Live smoke — the transplant driver runs end-to-end as a
//      subprocess (LEG=smoke, 1 seed, 5 days) and writes a valid
//      per-seed JSON to /tmp.
//
// Usage: node scripts/test-transplant-raid-b.js
//   (SUBJECT_SHA=<tip> node scripts/test-transplant-raid-b.js —
//    runs section 4 as well; without it section 4 is skipped with a
//    note and the rest still proves.)
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const SC = require('./transplant-raid-b-analyze-20261113');
const T = K.reporter('transplant-raid-b');

function sha256(text) { return crypto.createHash('sha256').update(text).digest('hex'); }
function show(commit, file) {
  return execSync('git show ' + commit + ':' + file, { cwd: path.join(__dirname, '..') }).toString();
}
function git(args) {
  return execSync('git ' + args, { cwd: path.join(__dirname, '..') }).toString().trim();
}

// Re-require the driver under a different LEG (LEG is read at require
// time; the guard itself is pure given texts).
function driverForLeg(leg) {
  process.env.LEG = leg;
  const p = require.resolve('./transplant-raid-b-driver-20261113');
  delete require.cache[p];
  return require('./transplant-raid-b-driver-20261113');
}

(async () => {
  // ---- 1. Seed-band identity ----
  T.section('1. Seed-band identity — 190391–190398, the vetphantom band');
  T.ok('analyzer SEEDS = 190391–190398', JSON.stringify(SC.SEEDS) === JSON.stringify([190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398]),
    'SEEDS=' + JSON.stringify(SC.SEEDS));
  T.ok('analyzer RUN = transplant-raid-b-pilot', SC.RUN === 'transplant-raid-b-pilot', 'RUN=' + SC.RUN);
  const driverSrc = fs.readFileSync(path.join(__dirname, 'transplant-raid-b-driver-20261113.js'), 'utf8');
  T.ok('driver writes to perseed-transplant-raid-b-<step>', driverSrc.indexOf('perseed-transplant-raid-b-') !== -1, 'outDir check');
  T.ok('driver does NOT write to any culpritbisect corpus', driverSrc.indexOf('perseed-culpritbisect-a-') === -1, 'no cross-corpus write');
  T.ok('driver does NOT write to any masterregress corpus', driverSrc.indexOf('perseed-masterregress-a-') === -1, 'no cross-corpus write');
  T.ok('driver does NOT write to the firstparent corpus', driverSrc.indexOf('perseed-bisect-firstparent-a') === -1, 'no cross-corpus write');
  T.ok('driver arm label is transplant-raid-b', driverSrc.indexOf("arm: 'transplant-raid-b'") !== -1, 'arm label');
  T.ok('synthetic per-seed filenames match the analyzer pattern', SC.perSeedFile(190391, 'subject').endsWith('transplant-raid-b-s190391-transplant-raid-b-pilot-fix.json'),
    SC.perSeedFile(190391, 'subject'));

  // ---- 2. Driver guards (transplant leg) ----
  T.section('2. Driver guards — marker standing + any policy accepted, markerless refused, STEP required');
  const fixText = show('5157782a4', 'src/js/standing.js');
  const originStanding = show('d229b58f5', 'src/js/standing.js');
  const farStanding = show('203a32775', 'src/js/standing.js');
  const farPolicy = show('203a32775', 'scripts/policies/competent.js');
  const mergePolicy = show('e4dbe581b', 'scripts/policies/competent.js');
  T.ok('pinned fix text HAS the roster-check marker', fixText.indexOf('ROSTER CHECK') !== -1, 'marker present');
  T.ok('origin standing LACKS the marker (swap required at every step)', originStanding.indexOf('ROSTER CHECK') === -1, 'no marker at the merge-base');
  T.ok('far standing is the pre-fix file (no marker)', farStanding.indexOf('ROSTER CHECK') === -1, 'no marker at far end');
  let DR = driverForLeg('transplant');
  let g = DR.legGuard(fixText, farPolicy);
  T.ok('transplant: fix + far policy accepted', g.ok === true && g.standingOk === true && g.policyOk === true, 'ok=' + g.ok + ' standingSha=' + g.standingSha + ' policySha=' + g.policySha);
  T.ok('transplant: fix sha recorded as f8fda4295a99', g.standingSha === 'f8fda4295a99' && g.standingShaFull === DR.EXPECTED_FIX_SHA, 'sha=' + g.standingSha);
  T.ok('transplant: swapped flag TRUE for the fix text', g.standingSwapped === true, 'swapped=' + g.standingSwapped);
  g = DR.legGuard(fixText, mergePolicy);
  T.ok('transplant: fix + merge policy accepted (policy is record-only)', g.ok === true, 'ok=' + g.ok + ' policySha=' + g.policySha);
  T.ok('transplant: merge policy sha recorded as 26a87e493578', g.policySha === '26a87e493578', 'policySha=' + g.policySha);
  T.ok('transplant: far policy sha recorded as a7ff5c516440', DR.legGuard(fixText, farPolicy).policySha === 'a7ff5c516440', 'policySha check');
  g = DR.legGuard(originStanding, farPolicy);
  T.ok('transplant: origin native standing refused (marker required)', g.ok === false && g.standingOk === false, 'ok=' + g.ok);
  T.ok('transplant: swapped flag FALSE for native standing', g.standingSwapped === false, 'swapped=' + g.standingSwapped);
  g = DR.legGuard(farStanding, farPolicy);
  T.ok('transplant: pre-fix far standing refused', g.ok === false && g.standingOk === false, 'ok=' + g.ok);
  DR = driverForLeg('smoke');
  g = DR.legGuard(fixText, farPolicy);
  T.ok('smoke: marker standing + any policy accepted', g.ok === true, 'ok=' + g.ok);
  g = DR.legGuard(originStanding, farPolicy);
  T.ok('smoke: markerless standing refused even in smoke mode', g.ok === false, 'ok=' + g.ok);
  DR = driverForLeg('bogus');
  g = DR.legGuard(fixText, farPolicy);
  T.ok('unknown LEG refused', g.ok === false && /unknown LEG/.test(g.error || ''), 'error=' + (g.error || ''));
  T.ok('legGuard refuses non-strings', DR.legGuard(null, null).ok === false, 'null refused');
  function runDriverExpectRefusal(envExtra) {
    try {
      execSync('node ' + path.join(__dirname, 'transplant-raid-b-driver-20261113.js'),
        { cwd: path.join(__dirname, '..'), env: Object.assign({}, process.env, envExtra, { SEEDS: '190391' }), stdio: 'pipe' });
      return null;
    } catch (e) { return e; }
  }
  let refusal = runDriverExpectRefusal({ LEG: 'transplant' });
  T.ok('driver LEG=transplant without STEP exits 2 with TRANSPLANT-RAID-B STOP', refusal !== null && refusal.status === 2 &&
    /TRANSPLANT-RAID-B STOP: LEG=transplant requires STEP/.test(String((refusal.stderr || '') + (refusal.stdout || ''))),
    refusal ? ('status=' + refusal.status + ' ' + String(refusal.stderr || '').slice(0, 160)) : 'driver did not refuse');
  refusal = runDriverExpectRefusal({ LEG: 'bogus', STEP: 'subject' });
  T.ok('driver LEG=bogus exits 2 with TRANSPLANT-RAID-B STOP', refusal !== null && refusal.status === 2 &&
    /TRANSPLANT-RAID-B STOP: unknown LEG/.test(String((refusal.stderr || '') + (refusal.stdout || ''))),
    refusal ? ('status=' + refusal.status) : 'driver did not refuse');
  T.ok('driver main loop runs only as a script, not on require', driverSrc.indexOf('if (require.main === module) (async function ()') !== -1, 'require.main guard');

  // ---- 3. Transplant verdict mapping ----
  T.section('3. Transplant verdict mapping — CARRIER / AMBIGUOUS / NOT-CARRIER');
  for (const [n, want] of [[8, 'NOT-CARRIER'], [5, 'NOT-CARRIER'], [4, 'NOT-CARRIER'], [3, 'NOT-CARRIER'], [2, 'AMBIGUOUS'], [1, 'CARRIER'], [0, 'CARRIER']]) {
    T.ok('classifyTransplant: ' + n + '/8 -> ' + want, SC.classifyTransplant(n) === want, 'got ' + SC.classifyTransplant(n));
  }
  T.ok('classifyTransplant: out-of-range 9 -> UNCLASSIFIABLE', SC.classifyTransplant(9) === 'UNCLASSIFIABLE', SC.classifyTransplant(9));
  T.ok('classifyTransplant: NaN -> UNCLASSIFIABLE', SC.classifyTransplant(NaN) === 'UNCLASSIFIABLE', String(SC.classifyTransplant(NaN)));
  T.ok('classifyStep alias agrees with classifyTransplant', SC.classifyStep(1) === 'CARRIER' && SC.classifyStep(4) === 'NOT-CARRIER' && SC.classifyStep(2) === 'AMBIGUOUS', 'alias check');
  for (const [n, want] of [[8, 'REGIONAL_INTACT'], [5, 'REGIONAL_INTACT'], [4, 'RANK_INCONCLUSIVE'], [3, 'RANK_INCONCLUSIVE'], [2, 'RANK_STALL'], [0, 'RANK_STALL']]) {
    T.ok('rank: ' + n + '/8 regional -> ' + want, SC.classifyRegional(n) === want, 'got ' + SC.classifyRegional(n));
  }
  T.ok('rank: out-of-range 9 -> UNCLASSIFIABLE', SC.classifyRegional(9) === 'UNCLASSIFIABLE', SC.classifyRegional(9));

  // ---- 4. Subject-diff completeness (SUBJECT_SHA env) ----
  const SUBJECT_SHA = process.env.SUBJECT_SHA || '';
  if (!SUBJECT_SHA) {
    console.log('\n4. Subject-diff completeness — SKIPPED (no SUBJECT_SHA env; run with SUBJECT_SHA=<tip>)');
  } else {
    T.section('4. Subject-diff completeness — subject tip is far end + family 2, nothing else');
    let subjectOk = false;
    try { git('rev-parse --verify ' + SUBJECT_SHA); subjectOk = true; } catch (e) { subjectOk = false; }
    T.ok('subject sha resolves (' + SUBJECT_SHA.slice(0, 12) + ')', subjectOk, SUBJECT_SHA);
    if (subjectOk) {
      let ancestor = false;
      try { git('merge-base --is-ancestor 203a32775 ' + SUBJECT_SHA); ancestor = true; } catch (e) { ancestor = false; }
      T.ok('far end 203a32775 is an ancestor of the subject', ancestor, 'merge-base check');
      const count = parseInt(git('rev-list --count 203a32775..' + SUBJECT_SHA), 10);
      T.ok('subject is exactly 1 commit on top of the far end', count === 1, 'count=' + count);
      const familyFiles = git('diff --name-only 7ddcdfff9^1 7ddcdfff9').split('\n').sort().join('\n');
      const subjectFiles = git('diff --name-only 203a32775 ' + SUBJECT_SHA).split('\n').sort().join('\n');
      T.ok('subject-vs-far file list == family file list (14 files)', subjectFiles === familyFiles,
        'subject=' + subjectFiles.split('\n').length + ' files, family=' + familyFiles.split('\n').length + ' files');
      const familyStat = git('diff --numstat 7ddcdfff9^1 7ddcdfff9').split('\n').sort().join('\n');
      const subjectStat = git('diff --numstat 203a32775 ' + SUBJECT_SHA).split('\n').sort().join('\n');
      T.ok('subject-vs-far numstat == family numstat (same lines added/deleted per file)', subjectStat === familyStat, 'numstat check');
      const objText = show(SUBJECT_SHA, 'src/js/villager-objectives.js');
      T.ok('subject carries objDangerBelief (the one shared read)', objText.indexOf('objDangerBelief(vid)') !== -1, 'objDangerBelief present');
      const gameText = show(SUBJECT_SHA, 'src/js/game.js');
      T.ok('subject carries the hearers-named raid seed', gameText.indexOf('npcIds().slice(0, 4)') !== -1, 'hearers seed present');
      const goalsText = show(SUBJECT_SHA, 'src/js/villager-goals.js');
      T.ok('subject safety drive reads the shared belief', goalsText.indexOf('objDangerBelief(vid)') !== -1, 'dangerHeard via belief');
    }
  }

  // ---- 5. Step-script restore source ----
  T.section('5. Step-script restore source — BRANCH exists and carries the transplant tooling');
  const stepSrc = fs.readFileSync(path.join(__dirname, 'transplant-raid-b-step.sh'), 'utf8');
  const branchMatch = stepSrc.match(/^BRANCH="([^"]+)"/m);
  T.ok('step script declares a BRANCH', branchMatch !== null, 'BRANCH=' + (branchMatch ? branchMatch[1] : 'none'));
  const restoreBranch = branchMatch ? branchMatch[1] : '';
  T.ok('step script BRANCH is sim-transplant-raid-b', restoreBranch === 'sim-transplant-raid-b', 'BRANCH=' + restoreBranch);
  T.ok('step script BRANCH is NOT master (transplant variants live only on the arm branch)', restoreBranch !== 'master', 'BRANCH=' + restoreBranch);
  T.ok('step script BRANCH is NOT the deleted sim-culpritbisect-a', restoreBranch !== 'sim-culpritbisect-a', 'BRANCH=' + restoreBranch);
  let restoreBranchExists = false;
  try { git('rev-parse --verify ' + restoreBranch); restoreBranchExists = true; } catch (e) { restoreBranchExists = false; }
  T.ok('step script BRANCH resolves to a ref (' + restoreBranch + ')', restoreBranchExists, 'BRANCH=' + restoreBranch);
  const scratchFiles = [
    'scripts/transplant-raid-b-driver-20261113.js',
    'scripts/transplant-raid-b-analyze-20261113.js',
    'scripts/masterregress-analyze-20261113.js',
    'scripts/vetfirst-instrument-20261111.js',
  ];
  for (const f of scratchFiles) {
    let okScratch = false;
    try { show(restoreBranch, f); okScratch = true; } catch (e) { okScratch = false; }
    T.ok('restore source ' + restoreBranch + ' carries ' + f, okScratch, f);
  }

  // ---- 6. Live smoke: the transplant driver runs end-to-end ----
  T.section('6. Live smoke — driver runs 1 seed x 5 days (LEG=smoke)');
  const smokeDir = path.join('/tmp', 'transplant-raid-b-smoke');
  fs.rmSync(smokeDir, { recursive: true, force: true });
  let smokeOut = null, smokeErr = null;
  try {
    smokeOut = execSync('node ' + path.join(__dirname, 'transplant-raid-b-driver-20261113.js'),
      { cwd: path.join(__dirname, '..'), env: Object.assign({}, process.env, { LEG: 'smoke', DAYS: '5', SEEDS: '190391', RUN: 'transplant-raid-b-smoke' }), stdio: 'pipe' }).toString();
  } catch (e) { smokeErr = e; }
  const smokeFile = path.join(smokeDir, 'transplant-raid-b-s190391-transplant-raid-b-smoke-fix.json');
  T.ok('smoke driver exits 0', smokeErr === null, smokeErr ? String(smokeErr.stderr || smokeErr.message).slice(0, 200) : 'exit 0');
  T.ok('smoke driver writes its per-seed JSON', fs.existsSync(smokeFile), 'file=' + smokeFile);
  if (fs.existsSync(smokeFile)) {
    const row = JSON.parse(fs.readFileSync(smokeFile, 'utf8'));
    T.ok('smoke row is the smoke leg, seed 190391, 5 days', row.leg === 'smoke' && row.seed === 190391 && row.days === 5,
      'leg=' + row.leg + ' seed=' + row.seed + ' days=' + row.days);
    T.ok('smoke row arm is transplant-raid-b', row.arm === 'transplant-raid-b', 'arm=' + row.arm);
    T.ok('smoke row carries daily snapshots (days-1 cadence)', Array.isArray(row.daily) && row.daily.length === row.days - 1, 'snapshots=' + (row.daily || []).length + ' days=' + row.days);
    T.ok('smoke row last snapshot is on the final game day', row.daily[row.daily.length - 1].day === row.gameDays, 'lastSnapDay=' + row.daily[row.daily.length - 1].day + ' gameDays=' + row.gameDays);
    T.ok('smoke row has zero instrument errors', (row.instrumentErrors || []).length === 0, 'errors=' + (row.instrumentErrors || []).length);
    T.ok('smoke row records the branch standing sha', typeof row.standingSha === 'string' && row.standingSha.length === 12, 'standingSha=' + row.standingSha);
    const branchStandingSha = sha256(fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'standing.js'), 'utf8'));
    const expectSwapped = branchStandingSha === 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
    T.ok('smoke row standingSwapped matches the on-disk file (native fix, not the swap, unless byte-identical)', row.standingSwapped === expectSwapped, 'standingSwapped=' + row.standingSwapped + ' expected=' + expectSwapped);
  }
  fs.rmSync(smokeDir, { recursive: true, force: true });

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
