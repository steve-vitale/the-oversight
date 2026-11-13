#!/usr/bin/env node
// test-transplant118.js — proof test for the H1 TRANSPLANT, family 1
// (arm sim-transplant118).
//
// THE QUESTION (evidence/2026-11-13/sim-transplant118.md, prereg
// committed before any judged sim): land origin family 1 — PR #118
// merge 1ec04e167 (prove-out-land-all-534ac, 73 commits OVE-129..154,
// 8 src/js files) — onto the far end 203a32775 (GOOD 4/8) and measure
// whether it alone collapses it. Verdicts (fresh thresholds):
// <=1/8 CARRIER, 2/8 AMBIGUOUS (re-run once), >=3/8 NOT-CARRIER.
// Subject lives on scratch branch transplant-118-subject (far end +
// family diff via `git cherry-pick -m 1 1ec04e167`), LEFT in place and
// never committed to the arm branch. Base is the far end, never
// current master. Standing fix swapped in per step exactly as the
// bisect prereg; native restored byte-identical afterwards.
//
// WHAT THIS TEST PROVES:
//   1. Family identity — merge 1ec04e167, its parents, the 73-commit
//      second-parent side, the exact 8 src/js files, +1705/-84.
//   2. Subject completeness — the subject commit exists on
//      transplant-118-subject, its parent is the far end, its tree
//      delta vs the far end carries EXACTLY the family's added and
//      removed lines per file (same file list, same +/- line
//      multisets), so the family diff is applied completely.
//   3. Subject recorded — the evidence file names the subject hash
//      and it matches the branch tip.
//   4. Verdict mapping — classifyTransplant maps every survived
//      count to CARRIER / AMBIGUOUS / NOT-CARRIER / UNCLASSIFIABLE.
//   5. Corpus completeness (post-step) — the step corpus
//      perseed-culpritbisect-a-t118-1ec04e167 holds 8 per-seed JSONs
//      on the band, each with the subject anchor, the fix swap
//      (standingSha f8fda4295a99, standingSwapped true), and the
//      far-end policy sha; the summary exists and the analyzer's
//      survived count agrees with the rows.
//   6. Base restored — HEAD is back on sim-transplant118, no src/js
//      file differs from HEAD (the swap is fully restored), and the
//      step-script tooling source (master) still carries the four
//      scratch files.
//   7. Seed-band identity — the corpus/summary name exactly seeds
//      190391–190398.
//
// Usage: node scripts/test-transplant118.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant118');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const MERGE = '1ec04e167';
const SUBJECT_BRANCH = 'transplant-118-subject';
const STEP = 't118-1ec04e167';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const EXPECTED_JS = [
  'src/js/comms.js', 'src/js/contestEngine.js', 'src/js/conversation.js',
  'src/js/game.js', 'src/js/godverbs.js', 'src/js/titans.js',
  'src/js/villager-brain.js', 'src/js/villager-objectives.js',
];

function sha256(text) { return crypto.createHash('sha256').update(text).digest('hex'); }
function git(args) {
  return execSync('git ' + args, { cwd: REPO, stdio: 'pipe' }).toString().trim();
}
function gitShow(commit, file) {
  return execSync('git show ' + commit + ':' + file, { cwd: REPO, stdio: 'pipe' }).toString();
}
// diffLineSets(a, b, file?): sorted added-line and removed-line
// multisets of `git diff a b [-- file]`, headers excluded. A clean
// cherry-pick of a family diff preserves the +/- lines per file even
// when hunk context shifts against a different base tree.
function diffLineSets(a, b, file) {
  const raw = execSync('git diff ' + a + ' ' + b + (file ? ' -- ' + file : ''),
    { cwd: REPO, stdio: 'pipe', maxBuffer: 64 * 1024 * 1024 }).toString();
  const added = [], removed = [];
  for (const line of raw.split('\n')) {
    if (line.startsWith('+++') || line.startsWith('---')) continue;
    if (line.startsWith('+')) added.push(line.slice(1));
    else if (line.startsWith('-')) removed.push(line.slice(1));
  }
  added.sort(); removed.sort();
  return { added: added, removed: removed };
}
function sameMultiset(a, b) {
  return a.length === b.length && a.every(function (v, i) { return v === b[i]; });
}
function classifyTransplant(n) {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 8) return 'UNCLASSIFIABLE';
  if (n <= 1) return 'CARRIER';
  if (n === 2) return 'AMBIGUOUS';
  return 'NOT-CARRIER';
}

(async () => {
  // ---- 1. Family identity ----
  T.section('1. Family identity — PR #118 merge 1ec04e167');
  T.ok('merge commit exists', git('rev-parse ' + MERGE).length === 40, git('log -1 --format=%s ' + MERGE).slice(0, 80));
  T.ok('first parent is 3339c0195 (PR #50 merge)', git('rev-parse ' + MERGE + '^1').startsWith('3339c0195'), git('log -1 --format=%h\\ %s ' + MERGE + '^1').slice(0, 80));
  T.ok('second parent is 534ac4e9d (OVE-154 tip)', git('rev-parse ' + MERGE + '^2').startsWith('534ac4e9d'), git('log -1 --format=%h\\ %s ' + MERGE + '^2').slice(0, 80));
  const sideCount = parseInt(git('rev-list --count ' + MERGE + '^1..' + MERGE + '^2'), 10);
  T.ok('second-parent side is 73 commits (OVE-129..154)', sideCount === 73, 'count=' + sideCount);
  const jsFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- src/js').split('\n').sort();
  T.ok('family touches exactly the 8 expected src/js files', JSON.stringify(jsFiles) === JSON.stringify(EXPECTED_JS.slice().sort()), jsFiles.join(', '));
  const numstat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/js').split('\n')
    .reduce(function (acc, line) { const p = line.split('\t'); return { ins: acc.ins + parseInt(p[0], 10), del: acc.del + parseInt(p[1], 10) }; }, { ins: 0, del: 0 });
  T.ok('family src/js delta is +1705/-84', numstat.ins === 1705 && numstat.del === 84, '+' + numstat.ins + '/-' + numstat.del);
  const polFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- scripts/policies');
  T.ok('family touches no policy file', polFiles === '', polFiles || '(none)');
  T.ok('family does not touch standing.js', git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- src/js/standing.js') === '', '(absent)');
  const farStanding = sha256(gitShow(FAR, 'src/js/standing.js'));
  T.ok('far-end native standing.js sha is 75762cb2...', farStanding.startsWith('75762cb2'), farStanding.slice(0, 12));
  T.ok('fix standing.js sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  const farPolicy = sha256(gitShow(FAR, 'scripts/policies/competent.js'));
  T.ok('far-end policy sha is a7ff5c51...', farPolicy.startsWith('a7ff5c51'), farPolicy.slice(0, 12));

  // ---- 2. Subject completeness ----
  T.section('2. Subject — transplant-118-subject = far end + family diff');
  let subject = null;
  try { subject = git('rev-parse ' + SUBJECT_BRANCH); } catch (e) { subject = null; }
  T.ok('subject branch exists', subject !== null && subject.length === 40, subject ? subject.slice(0, 12) : '(missing)');
  if (subject) {
    const parent = git('rev-parse ' + SUBJECT_BRANCH + '^1');
    T.ok('subject parent is the far end 203a32775', parent.startsWith(FAR), parent.slice(0, 12));
    const parents = git('rev-list --parents -n 1 ' + SUBJECT_BRANCH).split(' ');
    T.ok('subject is a plain commit (one parent, cherry-pick of a merge)', parents.length === 2, parents.length + ' fields');
    const famFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE).split('\n').sort();
    const subFiles = git('diff --name-only ' + FAR + ' ' + SUBJECT_BRANCH).split('\n').sort();
    T.ok('subject changes exactly the family file list (' + famFiles.length + ' files)',
      JSON.stringify(famFiles) === JSON.stringify(subFiles),
      'family=' + famFiles.length + ' subject=' + subFiles.length);
    let allMatch = true, checked = 0, firstBad = null;
    for (const f of famFiles) {
      const fam = diffLineSets(MERGE + '^1', MERGE, f);
      const sub = diffLineSets(FAR, SUBJECT_BRANCH, f);
      checked++;
      if (!sameMultiset(fam.added, sub.added) || !sameMultiset(fam.removed, sub.removed)) {
        allMatch = false; firstBad = firstBad || f; break;
      }
    }
    T.ok('every family file carries the same +/- lines on the subject (' + checked + ' files checked)',
      allMatch, firstBad ? 'first mismatch: ' + firstBad : 'all match');
  }

  // ---- 3. Subject recorded ----
  T.section('3. Subject recorded in the evidence file');
  const evPath = path.join(REPO, 'evidence', '2026-11-13', 'sim-transplant118.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  const m = ev.match(/Subject commit:\s*([0-9a-f]{40})/);
  T.ok('evidence file records a full subject hash', !!m, m ? m[1].slice(0, 12) : '(no hash recorded)');
  if (m && subject) T.ok('recorded hash matches the branch tip', m[1] === subject, m[1].slice(0, 12) + ' vs ' + subject.slice(0, 12));

  // ---- 4. Verdict mapping ----
  T.section('4. Verdict mapping — transplant thresholds');
  const table = [[0, 'CARRIER'], [1, 'CARRIER'], [2, 'AMBIGUOUS'], [3, 'NOT-CARRIER'], [4, 'NOT-CARRIER'], [8, 'NOT-CARRIER'], [-1, 'UNCLASSIFIABLE'], [9, 'UNCLASSIFIABLE'], [NaN, 'UNCLASSIFIABLE']];
  for (const pair of table) {
    T.ok('survived ' + pair[0] + ' -> ' + pair[1], classifyTransplant(pair[0]) === pair[1], classifyTransplant(pair[0]));
  }

  // ---- 5. Corpus completeness (post-step) ----
  T.section('5. Corpus completeness — step ' + STEP);
  const corpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  const summaryPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  let rows = [];
  for (const seed of SEEDS) {
    const f = path.join(corpusDir, 'culpritbisect-s' + seed + '-culpritbisect-pilot-fix.json');
    if (fs.existsSync(f)) rows.push(JSON.parse(fs.readFileSync(f, 'utf8')));
  }
  T.ok('corpus holds all 8 per-seed JSONs', rows.length === 8, rows.length + '/8 in ' + corpusDir);
  if (rows.length === 8 && subject) {
    const subjShort = subject.slice(0, 12);
    T.ok('every row is the transplant step on the subject anchor',
      rows.every(function (r) { return r.step === STEP && r.anchorCommit === subjShort; }),
      rows.map(function (r) { return r.anchorCommit; }).join(','));
    T.ok('every row ran with the fix swapped in (sha f8fda429..., swapped true)',
      rows.every(function (r) { return r.standingSwapped === true && r.standingSha === FIX_SHA.slice(0, 12); }),
      rows.map(function (r) { return r.standingSha + ':' + r.standingSwapped; }).join(' '));
    T.ok('every row ran the far-end policy (a7ff5c51...)',
      rows.every(function (r) { return r.policySha === farPolicy.slice(0, 12); }),
      rows.map(function (r) { return r.policySha; }).join(' '));
    T.ok('every row has zero instrument errors',
      rows.every(function (r) { return (r.instrumentErrors || []).length === 0; }),
      'errors=' + rows.map(function (r) { return (r.instrumentErrors || []).length; }).join(','));
  }
  if (fs.existsSync(summaryPath)) {
    const s = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    T.ok('summary exists and names the step', s.step === STEP, 'step=' + s.step);
    T.ok('summary seeds are exactly the band 190391-190398', JSON.stringify(s.seeds) === JSON.stringify(SEEDS), JSON.stringify(s.seeds));
    const survivedFromRows = rows.filter(function (r) { return !r.villageLost; }).length;
    T.ok('summary survived agrees with the rows', s.survived === survivedFromRows, 'summary=' + s.survived + ' rows=' + survivedFromRows);
    T.ok('summary verdict is a transplant verdict (' + classifyTransplant(s.survived) + ')',
      ['CARRIER', 'AMBIGUOUS', 'NOT-CARRIER'].indexOf(classifyTransplant(s.survived)) !== -1,
      'survived=' + s.survived + ' -> ' + classifyTransplant(s.survived));
  } else {
    T.ok('summary exists (step not yet run — run the step, then re-run this test)', false, '(missing: ' + summaryPath + ')');
  }

  // ---- 6. Base restored ----
  T.section('6. Base restored — arm branch clean, swap fully undone');
  const headBranch = git('rev-parse --abbrev-ref HEAD');
  T.ok('HEAD is back on the arm branch sim-transplant118', headBranch === 'sim-transplant118', 'HEAD=' + headBranch);
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

  // ---- 7. Seed-band identity ----
  T.section('7. Seed-band identity');
  const stepSrc = fs.readFileSync(path.join(REPO, 'scripts', 'culpritbisect-step.sh'), 'utf8');
  T.ok('step script names the band 190391..190398',
    stepSrc.indexOf('190391,190392,190393,190394,190395,190396,190397,190398') !== -1, 'band literal present');
  T.ok('evidence prereg names the same band', ev.indexOf('190391') !== -1 && ev.indexOf('190398') !== -1, 'band in prereg');

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
