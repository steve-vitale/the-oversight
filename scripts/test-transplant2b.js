#!/usr/bin/env node
// test-transplant2b.js — proof test for the H1 TRANSPLANT, family 2b
// (arm sim-transplant2b-a).
//
// THE QUESTION (evidence/2026-11-13/sim-transplant2b.md, prereg
// committed before any judged sim): re-run origin family 2 — PR #6
// merge 7ddcdfff9 (raid-danger-heard-c0a3, 2 commits on the
// second-parent side, 4 src/js files) — onto the far end 203a32775
// (GOOD 4/8) under a NARROWED prereg that resolves ONLY
// scripts/green-list.txt by union. Family 2 STOPPED on that one
// file; this is a NEW family definition (2b), not a re-judgment of
// family 2. Verdicts (fresh thresholds): <=1/8 CARRIER, 2/8
// AMBIGUOUS (re-run once; 2/8 again -> recorded AMBIGUOUS, treated
// as NOT-CARRIER for ordering, kept on the suspect list),
// >=3/8 NOT-CARRIER.
//
// OUTCOME — MEASURED, VERDICT AMBIGUOUS (recorded):
// subject commit 385a9f7b6 (transplant-2b-subject) built by
// cherry-pick -m 1 7ddcdfff9 + union resolution of the single
// green-list.txt conflict; step t2b-7ddcdfff9 read 2/8, re-run
// t2b-7ddcdfff9r read 2/8 again with byte-identical summaries.
// Family 2b is AMBIGUOUS: not a carrier by the thresholds, kept on
// the suspect list.
//
// WHAT THIS TEST PROVES:
//   1. Family identity — merge 7ddcdfff9, its parents, the 2-commit
//      second-parent side, the exact 4 src/js files, +71/-62.
//   2. Subject exists and is exactly the family + union —
//      transplant-2b-subject points at 385a9f7b6 whose parent is the
//      far end; subject-vs-far-end is the same 14 files; the src/js
//      content diff is byte-identical to the family src/js diff;
//      green-list.txt in the subject equals the far-end file plus
//      exactly the 4 theirs-lines (and adds to the merge file
//      exactly the far-end additions — the theirs-lines were
//      already in the merge file); each union line appears once;
//      no conflict markers anywhere in the subject tree.
//   2b. Conflict predicted by merge-tree (read-only) — exactly ONE
//      content conflict (green-list.txt, 3 markers), other three
//      'changed in both' files clean (0 markers).
//   3. Green-list readers — only scripts/check.js reads the file;
//      zero readers under src/ (the union cannot change game
//      behavior).
//   4. Union + verdict recorded in the evidence file.
//   5. Verdict mapping — classifyTransplant maps every survived
//      count; recordAmbiguous maps (2,2) -> 'AMBIGUOUS' (kept on
//      suspect list, NOT-CARRIER for ordering).
//   6. Corpus — both step summaries exist, each 2/8, perSeed /
//      wall / deathCauses byte-identical across the two runs,
//      anchorCommit 385a9f7b61ad, standing fix + policy shas as
//      preregistered, instrumentErrors 0.
//   7. Base restored — HEAD is back on sim-transplant2b-a, no src/js
//      file differs from HEAD, on-disk standing.js is byte-identical
//      to HEAD, and the step-script tooling source (master) still
//      carries all four scratch files.
//   8. Seed-band identity — the step script and the prereg name
//      exactly seeds 190391–190398.
//
// Usage: node scripts/test-transplant2b.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant2b');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const MERGE = '7ddcdfff9';
const MERGE_BASE = '21ae2d6968';
const SUBJECT_BRANCH = 'transplant-2b-subject';
const SUBJECT = '385a9f7b61ad3f0090cffd7eaa113b91f7c1fcac';
const STEP = 't2b-7ddcdfff9';
const STEP_R = 't2b-7ddcdfff9r';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const EXPECTED_JS = [
  'src/js/game.js', 'src/js/npc-triggers.js',
  'src/js/villager-goals.js', 'src/js/villager-objectives.js',
];
// The union: ours (far end) first, then theirs (family).
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
// Marker counts from the merge-tree dry run, per 'changed in both' file
// (transplant118 counting method: +<<<<<<<, +=======, +>>>>>>>).
const EXPECTED_MARKERS = {
  'docs/ONTOLOGY.md': 0,
  'scripts/green-list.txt': 3,
  'src/js/game.js': 0,
  'src/js/villager-objectives.js': 0,
};

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
// recordAmbiguous(first, rerun): the bisect rule — 2/8 twice stays
// AMBIGUOUS (treated as NOT-CARRIER for ordering, kept on the list).
function recordAmbiguous(first, rerun) {
  if (first !== 2) return classifyTransplant(first);
  if (rerun === 2) return 'AMBIGUOUS';
  return classifyTransplant(rerun);
}
// mergeTreeConflicts(): run `git merge-tree <base> <ours> <theirs>`
// (read-only dry run — touches no worktree) and return { file: markers }
// for each 'changed in both' section.
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
      // A non-diff, non-indented line after the section header ends it.
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
  const mergePlusOurs = mergeGreen.slice();
  const alienIdx = mergePlusOurs.indexOf('scripts/test-alien-expansion-20261107.js');
  mergePlusOurs.splice.apply(mergePlusOurs, [alienIdx + 1, 0].concat(OURS_LINES));
  // The subject is NOT the merge file + 2 ours-lines alone: the far
  // end also added 6 ladder lines elsewhere in the file that the
  // merge file lacks. The exact statement: the lines the subject
  // adds to the merge file are exactly the lines the far end adds
  // to the merge file (6 ladder + 2 pellet) — the 4 theirs-lines
  // were ALREADY in the merge file, so they add nothing relative
  // to it; a duplicated theirs-line would show up here as an extra
  // copy. And nothing in the merge file is missing from the subject.
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

  // ---- 2b. Conflict predicted by merge-tree (read-only) ----
  T.section('2b. Conflict predicted — git merge-tree dry run');
  const mt = mergeTreeConflicts();
  let mtOk = true, mtBad = null;
  for (const f of Object.keys(EXPECTED_MARKERS)) {
    if (mt[f] !== EXPECTED_MARKERS[f]) { mtOk = false; mtBad = f + ' (got ' + mt[f] + ', want ' + EXPECTED_MARKERS[f] + ')'; break; }
  }
  T.ok('merge-tree reports the same conflict set with the same marker counts', mtOk, mtBad || '4/4 match');
  T.ok('merge-tree reports exactly ONE content-conflicted file', Object.keys(mt).filter(function (f) { return mt[f] > 0; }).length === 1, 'conflicted=' + Object.keys(mt).filter(function (f) { return mt[f] > 0; }).join(', '));
  T.ok('merge-tree reports no other changed-in-both file', Object.keys(mt).length === 4, 'sections=' + Object.keys(mt).length + ': ' + Object.keys(mt).join(', '));

  // ---- 3. Green-list readers ----
  T.section('3. Green-list readers — test/check tooling only, never game code');
  const checkJs = fs.readFileSync(path.join(REPO, 'scripts', 'check.js'), 'utf8');
  T.ok('scripts/check.js reads green-list.txt (readList)', checkJs.indexOf("readList('scripts/green-list.txt')") !== -1, 'readList present');
  let srcReaders = [];
  try {
    srcReaders = execSync('git grep -l "green-list" ' + git('rev-parse HEAD') + ' -- src/', { cwd: REPO, stdio: 'pipe' }).toString().trim().split('\n').filter(Boolean);
  } catch (e) { srcReaders = []; }
  T.ok('zero green-list references under src/ (no game-code reader)', srcReaders.length === 0, srcReaders.join(', ') || '(none)');

  // ---- 4. Union + verdict recorded ----
  T.section('4. Union resolution and verdict recorded in the evidence file');
  const evPath = path.join(REPO, 'evidence', '2026-11-13', 'sim-transplant2b.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('evidence file records the subject commit 385a9f7b6', ev.indexOf('385a9f7b6') !== -1, 'subject hash present');
  let recOk = true, recBad = null;
  for (const l of OURS_LINES.concat(THEIRS_LINES)) {
    if (ev.indexOf(l) === -1) { recOk = false; recBad = l; break; }
  }
  T.ok('evidence file names all 6 union lines', recOk, recBad ? 'missing: ' + recBad : '6/6');
  T.ok('evidence file records the verdict as AMBIGUOUS', ev.indexOf('AMBIGUOUS') !== -1, 'AMBIGUOUS present');
  T.ok('evidence file records the narrowed family-2b definition', ev.indexOf('NARROWED') !== -1 || ev.indexOf('Narrowed') !== -1, 'narrowed definition present');

  // ---- 5. Verdict mapping ----
  T.section('5. Verdict mapping — transplant thresholds + re-run rule');
  const table = [[0, 'CARRIER'], [1, 'CARRIER'], [2, 'AMBIGUOUS'], [3, 'NOT-CARRIER'], [4, 'NOT-CARRIER'], [8, 'NOT-CARRIER'], [-1, 'UNCLASSIFIABLE'], [9, 'UNCLASSIFIABLE'], [NaN, 'UNCLASSIFIABLE']];
  for (const pair of table) {
    T.ok('survived ' + pair[0] + ' -> ' + pair[1], classifyTransplant(pair[0]) === pair[1], classifyTransplant(pair[0]));
  }
  T.ok('re-run rule: (2,2) stays AMBIGUOUS', recordAmbiguous(2, 2) === 'AMBIGUOUS', recordAmbiguous(2, 2));
  T.ok('re-run rule: (2,1) becomes CARRIER', recordAmbiguous(2, 1) === 'CARRIER', recordAmbiguous(2, 1));
  T.ok('re-run rule: (2,3) becomes NOT-CARRIER', recordAmbiguous(2, 3) === 'NOT-CARRIER', recordAmbiguous(2, 3));
  T.ok('re-run rule: (1,·) stays CARRIER without a re-run', recordAmbiguous(1, 1) === 'CARRIER', recordAmbiguous(1, 1));

  // ---- 6. Corpus ----
  T.section('6. Corpus — two steps, both 2/8, identical');
  const sumPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  const sumPathR = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP_R + '-summary.json');
  T.ok('first step summary exists', fs.existsSync(sumPath), STEP);
  T.ok('re-run step summary exists', fs.existsSync(sumPathR), STEP_R);
  let s1 = null, s2 = null;
  if (fs.existsSync(sumPath)) s1 = JSON.parse(fs.readFileSync(sumPath, 'utf8'));
  if (fs.existsSync(sumPathR)) s2 = JSON.parse(fs.readFileSync(sumPathR, 'utf8'));
  if (s1 && s2) {
    T.ok('first step survived 2/8 (AMBIGUOUS)', s1.survived === 2 && s1.verdict === 'AMBIGUOUS', s1.survived + '/8 ' + s1.verdict);
    T.ok('re-run survived 2/8 again (AMBIGUOUS)', s2.survived === 2 && s2.verdict === 'AMBIGUOUS', s2.survived + '/8 ' + s2.verdict);
    T.ok('re-run reproduces the first run exactly (perSeed identical)', JSON.stringify(s1.perSeed) === JSON.stringify(s2.perSeed), '8/8 seeds match');
    T.ok('re-run reproduces the first run exactly (wall identical)', JSON.stringify(s1.wall) === JSON.stringify(s2.wall), 'median ' + s1.wall.medianDays + 'd');
    T.ok('re-run reproduces the first run exactly (deathCauses identical)', JSON.stringify(s1.deathCauses) === JSON.stringify(s2.deathCauses), 'deaths ' + s1.wall.deaths);
    T.ok('both steps anchor on the subject commit 385a9f7b61ad', s1.perSeed.every(function (p) { return p.anchorCommit === '385a9f7b61ad'; }) && s2.perSeed.every(function (p) { return p.anchorCommit === '385a9f7b61ad'; }), '8/8 + 8/8');
    T.ok('both steps ran with the standing fix swapped in (f8fda4295a99)', s1.perSeed.every(function (p) { return p.standingFix && p.standingSha === 'f8fda4295a99'; }) && s2.perSeed.every(function (p) { return p.standingFix && p.standingSha === 'f8fda4295a99'; }), '8/8 + 8/8');
    T.ok('both steps ran the far-end policy (a7ff5c516440)', s1.perSeed.every(function (p) { return p.policySha === 'a7ff5c516440'; }) && s2.perSeed.every(function (p) { return p.policySha === 'a7ff5c516440'; }), '8/8 + 8/8');
    T.ok('instrument errors 0 on both runs', s1.instrumentErrors === 0 && s2.instrumentErrors === 0, '0 + 0');
    T.ok('wall: wave-5 1/8, national 0, wins 0 (both runs)', s1.wall.wave5 === 1 && s1.wall.national === 0 && s1.wall.wins === 0, 'wave5=' + s1.wall.wave5 + ' national=' + s1.wall.national + ' wins=' + s1.wall.wins);
  }
  const corpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  const corpusDirR = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP_R);
  T.ok('first step per-seed corpus exists (8 files)', fs.existsSync(corpusDir) && fs.readdirSync(corpusDir).length === 8, corpusDir);
  T.ok('re-run per-seed corpus exists (8 files)', fs.existsSync(corpusDirR) && fs.readdirSync(corpusDirR).length === 8, corpusDirR);

  // ---- 7. Base restored ----
  T.section('7. Base restored — arm branch clean, no swap residue');
  const headBranch = git('rev-parse --abbrev-ref HEAD');
  T.ok('HEAD is back on the arm branch sim-transplant2b-a', headBranch === 'sim-transplant2b-a', 'HEAD=' + headBranch);
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

  // ---- 8. Seed-band identity ----
  T.section('8. Seed-band identity');
  const stepSrc = fs.readFileSync(path.join(REPO, 'scripts', 'culpritbisect-step.sh'), 'utf8');
  T.ok('step script names the band 190391..190398',
    stepSrc.indexOf('190391,190392,190393,190394,190395,190396,190397,190398') !== -1, 'band literal present');
  T.ok('evidence prereg names the same band', ev.indexOf('190391') !== -1 && ev.indexOf('190398') !== -1, 'band in prereg');

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
