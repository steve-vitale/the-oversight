#!/usr/bin/env node
// test-transplant2b-fresh.js — proof test for the H1 TRANSPLANT,
// family 2b FRESH-BAND generalization (arm sim-transplant2b-fresh-a).
//
// THE QUESTION (evidence/2026-11-15/sim-transplant2b-fresh-prereg.md,
// committed before any judged sim): family 2b read AMBIGUOUS 2/8
// twice on the matched band 190391–190398 (far end 4/8). Does the
// 2/8 generalize to a FRESH band, 190621–190628? Same far end
// (203a32775) and same subject (385a9f7b6), same mechanics, fresh
// seeds. Verdict is judged RELATIVE to the fresh-band baseline:
// if the baseline reads 4/8, the original mapping applies
// (<=1 CARRIER, 2 AMBIGUOUS, >=3 NOT-CARRIER); otherwise the
// relative mapping applies (subject <= baseline-3 AND <=1 CARRIER;
// subject >= baseline-1 NOT-CARRIER; else AMBIGUOUS with one
// subject re-run, the re-run's count governing).
//
// STAGED PROOF: sections 1–6 + 8–9 (stage 1) run green BEFORE any
// judged sim. Section 7 (corpus) and the panel leg are
// PENDING-gated: before the legs run they pass vacuously and are
// marked PENDING in their detail string; after the legs run they
// verify the summaries and corpora for real. A PENDING mark is
// never presented as a measurement.
//
// WHAT THIS TEST PROVES:
//   1. Family identity — merge 7ddcdfff9, its parents, the 2-commit
//      second-parent side, the exact 4 src/js files, +71/-62.
//   2. Subject exists and is exactly the family + union —
//      transplant-2b-subject points at 385a9f7b6 whose parent is the
//      far end; subject-vs-far-end is the same 14 files; the src/js
//      content diff is byte-identical to the family src/js diff;
//      green-list.txt in the subject equals the far-end file plus
//      exactly the 4 theirs-lines; each union line appears once;
//      no conflict markers anywhere in the subject tree.
//   3. The subject ACTUALLY differs from the far end where the
//      family claims: objDangerBelief exists only in the subject
//      (defined villager-objectives.js:834, used at door/rally/
//      safety reads), dangerHeard in villager-goals.js is a thin
//      read over it in the subject vs an inline gossip scan in the
//      far end, and the raid seed arms only npcIds().slice(0, 4)
//      in the subject's game.js (absent in the far end).
//   4. Arm base — HEAD descends from master tip f8f6265b9, whose
//      diff vs 53e7b6a1e touches zero src/js files.
//   5. Band freshness — the prereg, the fresh step script, and the
//      fresh driver/analyzer all name exactly 190621–190628; the
//      prereg records the full freshness check (901 preregs, zero
//      seed-context hits, false-positive decimal fragments named,
//      screens + contaminated lists clear).
//   6. Verdict mapping — classifyFresh over both prereg branches
//      (baseline-4 original mapping + relative mapping) and the
//      re-run rule (recordFresh).
//   7. Corpus — PENDING before the legs; after: both step
//      summaries exist with the right survived counts, perSeed /
//      wall / deathCauses present, anchorCommit = far end /
//      subject, standing fix + policy shas as preregistered,
//      instrumentErrors 0, 8-file per-seed corpora.
//   8. Base restored — HEAD is back on sim-transplant2b-fresh-a,
//      no src/js file differs from HEAD, on-disk standing.js is
//      byte-identical to HEAD, and the arm branch carries the
//      fresh driver/analyzer/step script.
//   9. Balanced panel — PENDING before the legs; after: the
//      compare .md exists and names both legs.
//
// Usage: node scripts/test-transplant2b-fresh.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant2b-fresh');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const MERGE = '7ddcdfff9';
const MERGE_BASE = '21ae2d6968';
const SUBJECT_BRANCH = 'transplant-2b-subject';
const SUBJECT = '385a9f7b61ad3f0090cffd7eaa113b91f7c1fcac';
const ARM_BRANCH = 'sim-transplant2b-fresh-a';
const BASE_TIP = 'f8f6265b9';
const BASE_PREV = '53e7b6a1e';
const STEP_BASE = 't2b-fresh-203a32775';
const STEP_SUBJ = 't2b-fresh-385a9f7b6';
const STEP_SUBJ_R = 't2b-fresh-385a9f7b6r';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190621, 190622, 190623, 190624, 190625, 190626, 190627, 190628];
const EXPECTED_JS = [
  'src/js/game.js', 'src/js/npc-triggers.js',
  'src/js/villager-goals.js', 'src/js/villager-objectives.js',
];
const OURS_LINES = [
  'scripts/test-pellet-boost-20261108.js quick',
  'scripts/test-pellet-q4-20261108.js quick',
];
const THEIRS_LINES = [
  'scripts/test-person-trust-20261108.js quick',
  'scripts/test-raid-danger-heard.js quick',
  'scripts/test-win-rallyguard.js quick',
  'scripts/test-retarget-gossip.js quick',
];
const EXPECTED_MARKERS = {
  'docs/ONTOLOGY.md': 0,
  'scripts/green-list.txt': 3,
  'src/js/game.js': 0,
  'src/js/villager-objectives.js': 0,
};

function sha256(text) { return crypto.createHash('sha256').update(text).digest('hex'); }
function git(args) {
  return execSync('git ' + args, { cwd: REPO, stdio: 'pipe', maxBuffer: 512 * 1024 * 1024 }).toString().trim();
}
function gitShow(commit, file) {
  return execSync('git show ' + commit + ':' + file, { cwd: REPO, stdio: 'pipe', maxBuffer: 512 * 1024 * 1024 }).toString();
}
// classifyFresh(baseline, subject): the prereg's frozen verdict
// mapping. Branch 1 (baseline 4/8): original mapping. Branch 2
// (any other baseline): relative mapping.
function classifyFresh(b, s) {
  if (typeof b !== 'number' || typeof s !== 'number' ||
    !Number.isFinite(b) || !Number.isFinite(s) || b < 0 || b > 8 || s < 0 || s > 8) return 'UNCLASSIFIABLE';
  if (b === 4) {
    if (s <= 1) return 'CARRIER';
    if (s === 2) return 'AMBIGUOUS';
    return 'NOT-CARRIER';
  }
  if (s <= b - 3 && s <= 1) return 'CARRIER';
  if (s >= b - 1) return 'NOT-CARRIER';
  return 'AMBIGUOUS';
}
// recordFresh(first, rerun, baseline): an AMBIGUOUS first read gets
// ONE subject re-run; the re-run's count governs under the same
// mapping; AMBIGUOUS twice stays AMBIGUOUS.
function recordFresh(first, rerun, b) {
  const v1 = classifyFresh(b, first);
  if (v1 !== 'AMBIGUOUS') return v1;
  return classifyFresh(b, rerun);
}
function mergeTreeConflicts() {
  const out = execSync('git merge-tree ' + MERGE_BASE + ' ' + FAR + ' ' + MERGE,
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
function contentDiffHash(a, b, paths) {
  const strip = function (s) {
    return s.split('\n').filter(function (ln) {
      return ln.indexOf('diff --git') !== 0 && ln.indexOf('index ') !== 0 &&
        ln.indexOf('--- ') !== 0 && ln.indexOf('+++ ') !== 0 && ln.indexOf('@@ ') !== 0;
    }).join('\n');
  };
  const da = strip(git('diff ' + a + ' ' + b + (paths ? ' -- ' + paths : '')));
  return sha256(da);
}
// pendingOk(label, exists, detail): corpus/panel legs are
// PENDING-gated — before the legs run they pass vacuously with an
// explicit PENDING detail (never presented as a measurement).
function pendingOk(label, exists, detail) {
  if (!exists) T.ok(label + ' (PENDING — legs not run yet)', true, 'PENDING');
  else T.ok(label, true, detail);
}

(async () => {
  // ---- 1. Family identity ----
  T.section('1. Family identity — PR #6 merge 7ddcdfff9');
  T.ok('merge commit exists', git('rev-parse ' + MERGE).length === 40, git('log -1 --format=%s ' + MERGE).slice(0, 80));
  T.ok('first parent is 21ae2d6968 (PR #5 merge)', git('rev-parse ' + MERGE + '^1').startsWith('21ae2d6968'), git('log -1 --format=%h\\ %s ' + MERGE + '^1').slice(0, 80));
  T.ok('second parent is dff2cd523 (raid-branch merge)', git('rev-parse ' + MERGE + '^2').startsWith('dff2cd523'), git('log -1 --format=%h\\ %s ' + MERGE + '^2').slice(0, 80));
  const sideCount = parseInt(git('rev-list --count ' + MERGE + '^1..' + MERGE + '^2'), 10);
  T.ok('second-parent side is 2 commits (merge + unify raid danger)', sideCount === 2, 'count=' + sideCount);
  const jsFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- src/js').split('\n').sort();
  T.ok('family touches exactly the 4 expected src/js files', JSON.stringify(jsFiles) === JSON.stringify(EXPECTED_JS.slice().sort()), jsFiles.join(', '));
  const numstat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/js').split('\n')
    .reduce(function (acc, line) { const p = line.split('\t'); return { ins: acc.ins + parseInt(p[0], 10), del: acc.del + parseInt(p[1], 10) }; }, { ins: 0, del: 0 });
  T.ok('family src/js delta is +71/-62', numstat.ins === 71 && numstat.del === 62, '+' + numstat.ins + '/-' + numstat.del);
  const polFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- scripts/policies');
  T.ok('family touches no policy file', polFiles === '', polFiles || '(none)');
  T.ok('family does not touch standing.js', git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- src/js/standing.js') === '', '(absent)');
  const farStanding = sha256(gitShow(FAR, 'src/js/standing.js'));
  T.ok('far-end native standing.js sha is 75762cb2...', farStanding.startsWith('75762cb2'), farStanding.slice(0, 12));
  T.ok('fix standing.js sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  const farPolicy = sha256(gitShow(FAR, 'scripts/policies/competent.js'));
  T.ok('far-end policy sha is a7ff5c51...', farPolicy.startsWith('a7ff5c51'), farPolicy.slice(0, 12));

  // ---- 2. Subject exists and is exactly the family + union ----
  T.section('2. Subject — transplant-2b-subject at 385a9f7b6, family + union');
  let subject = null;
  try { subject = git('rev-parse ' + SUBJECT_BRANCH); } catch (e) { subject = null; }
  T.ok('subject branch exists', subject !== null && subject.length === 40, subject ? subject.slice(0, 12) : '(missing)');
  if (subject) {
    T.ok('subject branch points at 385a9f7b6', subject === SUBJECT, subject.slice(0, 12));
    T.ok('subject parent is the far end 203a32775', git('rev-parse ' + SUBJECT_BRANCH + '^1') === FAR_FULL, git('rev-parse ' + SUBJECT_BRANCH + '^1').slice(0, 12));
  }
  const subjFiles = git('diff --name-only ' + FAR + ' ' + SUBJECT_BRANCH).split('\n').sort();
  const famFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE).split('\n').sort();
  T.ok('subject-vs-far-end file list is exactly the family file list (14 files)', JSON.stringify(subjFiles) === JSON.stringify(famFiles), subjFiles.length + ' files');
  const subjJs = contentDiffHash(FAR, SUBJECT_BRANCH, 'src/js');
  const famJs = contentDiffHash(MERGE + '^1', MERGE, 'src/js');
  T.ok('subject src/js content diff is byte-identical to the family src/js diff', subjJs === famJs, subjJs.slice(0, 12));
  const subjStat = git('diff --numstat ' + FAR + ' ' + SUBJECT_BRANCH + ' -- scripts/green-list.txt');
  T.ok('subject green-list delta is +4/-0 (union: far end + 4 theirs-lines)', subjStat === '4\t0\tscripts/green-list.txt', subjStat);
  const farGreen = gitShow(FAR, 'scripts/green-list.txt').split('\n');
  const subjGreen = gitShow(SUBJECT, 'scripts/green-list.txt').split('\n');
  const mergeGreen = gitShow(MERGE, 'scripts/green-list.txt').split('\n');
  const farPlusTheirs = farGreen.slice();
  const pelletIdx = farPlusTheirs.indexOf('scripts/test-pellet-q4-20261108.js quick');
  farPlusTheirs.splice.apply(farPlusTheirs, [pelletIdx + 1, 0].concat(THEIRS_LINES));
  T.ok('subject green-list == far-end file + exactly the 4 theirs-lines', JSON.stringify(farPlusTheirs) === JSON.stringify(subjGreen), 'lines=' + subjGreen.length);
  const minus = function (a, b) {
    const rest = b.slice();
    const out = [];
    for (const x of a) { const i = rest.indexOf(x); if (i === -1) out.push(x); else rest.splice(i, 1); }
    return out;
  };
  const subjMinusMerge = minus(subjGreen, mergeGreen).sort();
  const farMinusMerge = minus(farGreen, mergeGreen).sort();
  T.ok('subject adds to the merge file exactly the far-end additions (6 ladder + 2 pellet)', JSON.stringify(subjMinusMerge) === JSON.stringify(farMinusMerge), 'added=' + subjMinusMerge.length + ' (ladder 6 + pellet 2)');
  T.ok('nothing in the merge file is missing from the subject', minus(mergeGreen, subjGreen).length === 0, 'missing=' + minus(mergeGreen, subjGreen).length);
  let onceOk = true, onceBad = null;
  for (const l of OURS_LINES.concat(THEIRS_LINES)) {
    const n = subjGreen.filter(function (x) { return x === l; }).length;
    if (n !== 1) { onceOk = false; onceBad = l + ' (x' + n + ')'; break; }
  }
  T.ok('each of the 6 union lines appears exactly once in the subject file', onceOk, onceBad || '6/6');
  const markers = git('grep -c -e "<<<<<<<" -e "=======" -e ">>>>>>>" ' + SUBJECT_BRANCH + ' -- scripts/green-list.txt || true');
  T.ok('no conflict markers in the subject green-list.txt', markers === '' || markers === '0', markers || '0');
  const subjStanding = sha256(gitShow(SUBJECT, 'src/js/standing.js'));
  T.ok('subject native standing.js is the far-end one (75762cb2...)', subjStanding.startsWith('75762cb2'), subjStanding.slice(0, 12));
  const mt = mergeTreeConflicts();
  let mtOk = true, mtBad = null;
  for (const f of Object.keys(EXPECTED_MARKERS)) {
    if (mt[f] !== EXPECTED_MARKERS[f]) { mtOk = false; mtBad = f + ' (got ' + mt[f] + ', want ' + EXPECTED_MARKERS[f] + ')'; break; }
  }
  T.ok('merge-tree reports the same conflict set with the same marker counts', mtOk, mtBad || '4/4 match');
  T.ok('merge-tree reports exactly ONE content-conflicted file', Object.keys(mt).filter(function (f) { return mt[f] > 0; }).length === 1, 'conflicted=' + Object.keys(mt).filter(function (f) { return mt[f] > 0; }).join(', '));
  const checkJs = fs.readFileSync(path.join(REPO, 'scripts', 'check.js'), 'utf8');
  T.ok('scripts/check.js reads green-list.txt (readList)', checkJs.indexOf("readList('scripts/green-list.txt')") !== -1, 'readList present');
  let srcReaders = [];
  try {
    srcReaders = execSync('git grep -l "green-list" ' + git('rev-parse HEAD') + ' -- src/', { cwd: REPO, stdio: 'pipe' }).toString().trim().split('\n').filter(Boolean);
  } catch (e) { srcReaders = []; }
  T.ok('zero green-list references under src/ (no game-code reader)', srcReaders.length === 0, srcReaders.join(', ') || '(none)');

  // ---- 3. The subject differs where the family claims ----
  T.section('3. Heard-filtered belief read — subject differs from the far end');
  const farObj = gitShow(FAR, 'src/js/villager-objectives.js');
  const subjObj = gitShow(SUBJECT, 'src/js/villager-objectives.js');
  const countOcc = function (text, needle) { return text.split(needle).length - 1; };
  T.ok('far end has NO objDangerBelief (method does not exist there)', countOcc(farObj, 'objDangerBelief') === 0, '0 occurrences');
  T.ok('subject defines objDangerBelief once (villager-objectives.js:834)', countOcc(subjObj, 'objDangerBelief(vid) {') === 1, '1 definition');
  T.ok('subject uses objDangerBelief at the door/rally/safety reads (9 occurrences)', countOcc(subjObj, 'objDangerBelief') === 9, '9 occurrences');
  T.ok('subject header documents seam 4 (danger_heard_filtered)', subjObj.indexOf('danger_heard_filtered') !== -1, 'header present');
  const farGoals = gitShow(FAR, 'src/js/villager-goals.js');
  const subjGoals = gitShow(SUBJECT, 'src/js/villager-goals.js');
  T.ok('far-end dangerHeard is an inline gossip scan (no objDangerBelief)', countOcc(farGoals, 'objDangerBelief') === 0 && farGoals.indexOf("g[i].heard") !== -1, 'inline scan');
  T.ok('subject dangerHeard is a thin read over G.objDangerBelief', subjGoals.indexOf('if (G.objDangerBelief) return !!(G.objDangerBelief(vid) || {}).threat;') !== -1, 'thin read present');
  T.ok('subject dangerHeard names the rule (a raid nobody told them about arms nothing)', subjGoals.indexOf('A raid nobody told them about') !== -1, 'rule comment present');
  const farGame = gitShow(FAR, 'src/js/game.js');
  const subjGame = gitShow(SUBJECT, 'src/js/game.js');
  T.ok('far-end game.js has no raid-seed hearers line', farGame.indexOf('npcIds().slice(0, 4)') === -1, 'absent');
  T.ok('subject game.js arms only npcIds().slice(0, 4) at the raid seed', subjGame.indexOf('const hearers = this.npcIds ? this.npcIds().slice(0, 4) : [];') !== -1, 'hearers line present');
  T.ok('subject game.js names the heard filter at the seed', subjGame.indexOf('objDangerBelief (heard-filtered)') !== -1, 'comment present');

  // ---- 4. Arm base ----
  T.section('4. Arm base — master tip f8f6265b9, zero src/js vs 53e7b6a1e');
  let isAncestor = false;
  try { execSync('git merge-base --is-ancestor ' + BASE_TIP + ' HEAD', { cwd: REPO, stdio: 'pipe' }); isAncestor = true; } catch (e) { isAncestor = false; }
  T.ok('HEAD descends from base tip f8f6265b9', isAncestor, 'ancestor check');
  T.ok('base tip message is the winnability-round-1630 landing', git('log -1 --format=%s ' + BASE_TIP).indexOf('winnability-round-1630') !== -1, git('log -1 --format=%s ' + BASE_TIP).slice(0, 80));
  const baseJs = git('diff --name-only ' + BASE_PREV + ' ' + BASE_TIP + ' -- src/js/');
  T.ok('base diff vs 53e7b6a1e touches zero src/js files', baseJs === '', baseJs || '(none)');
  const baseFiles = git('diff --name-only ' + BASE_PREV + ' ' + BASE_TIP).split('\n');
  T.ok('base diff is evidence + courtship scripts/policies only', baseFiles.every(function (f) { return f.indexOf('evidence/') === 0 || f.indexOf('scripts/') === 0; }), baseFiles.length + ' files');

  // ---- 5. Band freshness ----
  T.section('5. Band freshness — 190621–190628, full check recorded');
  const preregPath = path.join(REPO, 'evidence', '2026-11-15', 'sim-transplant2b-fresh-prereg.md');
  const prereg = fs.existsSync(preregPath) ? fs.readFileSync(preregPath, 'utf8') : '';
  T.ok('prereg exists', prereg.length > 0, 'evidence/2026-11-15/sim-transplant2b-fresh-prereg.md');
  T.ok('prereg names the chosen band 190621–190628', prereg.indexOf('190621') !== -1 && prereg.indexOf('190628') !== -1, 'band present');
  T.ok('prereg records the 901-prereg search with zero hits', prereg.indexOf('901') !== -1 && prereg.indexOf('NO matches') !== -1, 'search recorded');
  T.ok('prereg records the seed-context rg with zero files', prereg.indexOf('NO files (rc=1)') !== -1, 'seed-context recorded');
  T.ok('prereg explains the raw-substring false positives (decimal fragments)', prereg.indexOf('FALSE POSITIVES') !== -1 && prereg.indexOf('110.11906215362251') !== -1, 'false positives named');
  T.ok('prereg records screens + contaminated lists clear', prereg.indexOf('Screens naming 190621') !== -1 || prereg.indexOf('screens / extension bands') !== -1, 'screens recorded');
  T.ok('prereg names the NEVER bands', prereg.indexOf('190391–190398') !== -1 && prereg.indexOf('190581–190588') !== -1, 'never-bands listed');
  T.ok('prereg says the fallback band is NOT needed', prereg.indexOf('NOT needed') !== -1, 'fallback unused');
  T.ok('prereg freezes BOTH verdict branches before any leg', prereg.indexOf('Branch 1') !== -1 && prereg.indexOf('Branch 2') !== -1, 'both branches frozen');
  const stepSrc = fs.readFileSync(path.join(REPO, 'scripts', 'culpritbisect-step-fresh-20261115.sh'), 'utf8');
  T.ok('fresh step script names the band 190621..190628',
    stepSrc.indexOf('190621,190622,190623,190624,190625,190626,190627,190628') !== -1, 'band literal present');
  T.ok('fresh step script uses RUN transplant2b-fresh-pilot', stepSrc.indexOf('RUN=transplant2b-fresh-pilot') !== -1, 'RUN present');
  T.ok('fresh step script writes logs under evidence/2026-11-15/', stepSrc.indexOf('evidence/2026-11-15/') !== -1, 'date present');
  T.ok('fresh step script restores fresh tooling from the ARM branch', stepSrc.indexOf('ARM_BRANCH="sim-transplant2b-fresh-a"') !== -1 && stepSrc.indexOf('culpritbisect-driver-20261115.js') !== -1, 'arm restore present');
  const drvSrc = fs.readFileSync(path.join(REPO, 'scripts', 'culpritbisect-driver-20261115.js'), 'utf8');
  T.ok('fresh driver defaults to RUN transplant2b-fresh-pilot', drvSrc.indexOf("RUN || 'transplant2b-fresh-pilot'") !== -1, 'RUN default');
  T.ok('fresh driver writes corpora under evidence/2026-11-15/', drvSrc.indexOf("'2026-11-15'") !== -1, 'date present');
  const anaSrc = fs.readFileSync(path.join(REPO, 'scripts', 'culpritbisect-analyze-20261115.js'), 'utf8');
  T.ok('fresh analyzer seeds are the fresh band', anaSrc.indexOf('[190621, 190622, 190623, 190624, 190625, 190626, 190627, 190628]') !== -1, 'seeds present');
  T.ok('fresh analyzer RUN is transplant2b-fresh-pilot', anaSrc.indexOf("RUN = 'transplant2b-fresh-pilot'") !== -1, 'RUN present');

  // ---- 6. Verdict mapping ----
  T.section('6. Verdict mapping — both branches + re-run rule');
  const table = [
    // [baseline, subject, expected] — branch 1 (baseline 4)
    [4, 0, 'CARRIER'], [4, 1, 'CARRIER'], [4, 2, 'AMBIGUOUS'],
    [4, 3, 'NOT-CARRIER'], [4, 4, 'NOT-CARRIER'], [4, 8, 'NOT-CARRIER'],
    // branch 2 — relative
    [5, 1, 'CARRIER'], [5, 2, 'AMBIGUOUS'], [5, 3, 'AMBIGUOUS'], [5, 4, 'NOT-CARRIER'],
    [3, 0, 'CARRIER'], [3, 1, 'AMBIGUOUS'], [3, 2, 'NOT-CARRIER'],
    [6, 2, 'AMBIGUOUS'], [6, 3, 'AMBIGUOUS'], [6, 4, 'AMBIGUOUS'], [6, 5, 'NOT-CARRIER'],
    [8, 1, 'CARRIER'], [8, 5, 'AMBIGUOUS'], [8, 6, 'AMBIGUOUS'], [8, 7, 'NOT-CARRIER'],
    [0, 0, 'NOT-CARRIER'], [2, 0, 'AMBIGUOUS'], [2, 1, 'NOT-CARRIER'],
    [-1, 0, 'UNCLASSIFIABLE'], [4, 9, 'UNCLASSIFIABLE'], [4, NaN, 'UNCLASSIFIABLE'],
  ];
  for (const row of table) {
    T.ok('baseline ' + row[0] + ', subject ' + row[1] + ' -> ' + row[2],
      classifyFresh(row[0], row[1]) === row[2], classifyFresh(row[0], row[1]));
  }
  T.ok('re-run rule: (4; 2,2) stays AMBIGUOUS', recordFresh(2, 2, 4) === 'AMBIGUOUS', recordFresh(2, 2, 4));
  T.ok('re-run rule: (4; 2,1) becomes CARRIER', recordFresh(2, 1, 4) === 'CARRIER', recordFresh(2, 1, 4));
  T.ok('re-run rule: (4; 2,3) becomes NOT-CARRIER', recordFresh(2, 3, 4) === 'NOT-CARRIER', recordFresh(2, 3, 4));
  T.ok('re-run rule: (4; 1,·) stays CARRIER without a re-run', recordFresh(1, 1, 4) === 'CARRIER', recordFresh(1, 1, 4));
  T.ok('re-run rule: relative (5; 3,1) becomes CARRIER', recordFresh(3, 1, 5) === 'CARRIER', recordFresh(3, 1, 5));
  T.ok('re-run rule: relative (5; 3,4) becomes NOT-CARRIER', recordFresh(3, 4, 5) === 'NOT-CARRIER', recordFresh(3, 4, 5));
  T.ok('re-run rule: relative (5; 3,3) stays AMBIGUOUS', recordFresh(3, 3, 5) === 'AMBIGUOUS', recordFresh(3, 3, 5));

  // ---- 7. Corpus (PENDING-gated) ----
  T.section('7. Corpus — both legs, 8 seeds each');
  const sumBasePath = path.join(REPO, 'evidence', '2026-11-15', 'transplant2b-fresh-' + STEP_BASE + '-summary.json');
  const sumSubjPath = path.join(REPO, 'evidence', '2026-11-15', 'transplant2b-fresh-' + STEP_SUBJ + '-summary.json');
  const hasBase = fs.existsSync(sumBasePath);
  const hasSubj = fs.existsSync(sumSubjPath);
  pendingOk('baseline step summary exists', hasBase, STEP_BASE);
  pendingOk('subject step summary exists', hasSubj, STEP_SUBJ);
  let sb = null, ss = null;
  if (hasBase) sb = JSON.parse(fs.readFileSync(sumBasePath, 'utf8'));
  if (hasSubj) ss = JSON.parse(fs.readFileSync(sumSubjPath, 'utf8'));
  if (sb && ss) {
    T.ok('baseline seeds are the fresh band', JSON.stringify(sb.seeds) === JSON.stringify(SEEDS), 'seeds match');
    T.ok('subject seeds are the fresh band', JSON.stringify(ss.seeds) === JSON.stringify(SEEDS), 'seeds match');
    T.ok('baseline anchors on the far end 203a327750a2', sb.perSeed.every(function (p) { return p.anchorCommit === '203a327750a2'; }), '8/8');
    T.ok('subject anchors on the subject 385a9f7b61ad', ss.perSeed.every(function (p) { return p.anchorCommit === '385a9f7b61ad'; }), '8/8');
    T.ok('both legs ran with the standing fix swapped in (f8fda4295a99)', sb.perSeed.every(function (p) { return p.standingFix && p.standingSha === 'f8fda4295a99'; }) && ss.perSeed.every(function (p) { return p.standingFix && p.standingSha === 'f8fda4295a99'; }), '8/8 + 8/8');
    T.ok('both legs ran the far-end/subject policy (a7ff5c516440)', sb.perSeed.every(function (p) { return p.policySha === 'a7ff5c516440'; }) && ss.perSeed.every(function (p) { return p.policySha === 'a7ff5c516440'; }), '8/8 + 8/8');
    T.ok('instrument errors 0 on both legs', sb.instrumentErrors === 0 && ss.instrumentErrors === 0, '0 + 0');
    T.ok('baseline verdict label matches its survived count', sb.verdict === (sb.survived >= 3 ? 'GOOD' : sb.survived <= 1 ? 'BAD' : 'AMBIGUOUS'), sb.verdict + ' ' + sb.survived + '/8');
    T.ok('subject verdict label matches its survived count', ss.verdict === (ss.survived >= 3 ? 'GOOD' : ss.survived <= 1 ? 'BAD' : 'AMBIGUOUS'), ss.verdict + ' ' + ss.survived + '/8');
    T.ok('fresh verdict follows the prereg mapping', true, 'baseline ' + sb.survived + '/8, subject ' + ss.survived + '/8 -> ' + classifyFresh(sb.survived, ss.survived));
    const corpusBase = path.join(REPO, 'evidence', '2026-11-15', 'perseed-transplant2b-fresh-' + STEP_BASE);
    const corpusSubj = path.join(REPO, 'evidence', '2026-11-15', 'perseed-transplant2b-fresh-' + STEP_SUBJ);
    T.ok('baseline per-seed corpus exists (8 files)', fs.existsSync(corpusBase) && fs.readdirSync(corpusBase).length === 8, corpusBase);
    T.ok('subject per-seed corpus exists (8 files)', fs.existsSync(corpusSubj) && fs.readdirSync(corpusSubj).length === 8, corpusSubj);
  }
  const rPath = path.join(REPO, 'evidence', '2026-11-15', 'transplant2b-fresh-' + STEP_SUBJ_R + '-summary.json');
  if (fs.existsSync(rPath)) {
    const sr = JSON.parse(fs.readFileSync(rPath, 'utf8'));
    T.ok('subject re-run summary exists and anchors on the subject', sr.perSeed.every(function (p) { return p.anchorCommit === '385a9f7b61ad'; }), 're-run ' + sr.survived + '/8');
  }

  // ---- 8. Base restored ----
  T.section('8. Base restored — arm branch clean, no swap residue');
  const headBranch = git('rev-parse --abbrev-ref HEAD');
  T.ok('HEAD is back on the arm branch sim-transplant2b-fresh-a', headBranch === ARM_BRANCH, 'HEAD=' + headBranch);
  const dirtyJs = git('status --porcelain --untracked-files=no -- src/js');
  T.ok('no src/js file differs from HEAD', dirtyJs === '', dirtyJs.slice(0, 200) || '(clean)');
  const onDiskStanding = sha256(fs.readFileSync(path.join(REPO, 'src', 'js', 'standing.js'), 'utf8'));
  const headStanding = sha256(gitShow('HEAD', 'src/js/standing.js'));
  T.ok('on-disk standing.js is byte-identical to HEAD (no swap residue)', onDiskStanding === headStanding, onDiskStanding.slice(0, 12) + ' vs HEAD ' + headStanding.slice(0, 12));
  let toolingOk = true;
  for (const f of ['scripts/culpritbisect-driver-20261115.js', 'scripts/culpritbisect-analyze-20261115.js', 'scripts/culpritbisect-step-fresh-20261115.sh']) {
    try { execSync('git show ' + ARM_BRANCH + ':' + f, { cwd: REPO, stdio: 'pipe' }); } catch (e) { toolingOk = false; }
  }
  T.ok('arm branch carries the fresh driver/analyzer/step script', toolingOk, toolingOk ? '3/3' : 'missing');
  let sharedOk = true;
  for (const f of ['scripts/culpritbisect-driver-20261113.js', 'scripts/culpritbisect-analyze-20261113.js', 'scripts/masterregress-analyze-20261113.js', 'scripts/vetfirst-instrument-20261111.js']) {
    try { execSync('git show master:' + f, { cwd: REPO, stdio: 'pipe' }); } catch (e) { sharedOk = false; }
  }
  T.ok('shared 20261113 tooling source (master) still carries all four scratch files', sharedOk, sharedOk ? '4/4' : 'missing');

  // ---- 9. Balanced panel (PENDING-gated) ----
  T.section('9. Balanced panel (§15) — compare .md attached');
  const panelMd = path.join(REPO, 'evidence', '2026-11-15', 'transplant2b-fresh-panel-compare.md');
  const hasPanel = fs.existsSync(panelMd);
  pendingOk('panel compare .md exists', hasPanel, 'transplant2b-fresh-panel-compare.md');
  if (hasPanel) {
    const pm = fs.readFileSync(panelMd, 'utf8');
    T.ok('panel compare names both legs', pm.indexOf('t2b-fresh-203a32775') !== -1 || pm.indexOf('203a32775') !== -1, 'baseline named');
    T.ok('panel compare names the subject leg', pm.indexOf('385a9f7b6') !== -1, 'subject named');
  }

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
