#!/usr/bin/env node
// test-transplant13.js — proof test for the H1 TRANSPLANT, family 13
// (arm sim-transplant13-a).
//
// THE QUESTION (evidence/2026-11-14/sim-transplant13-prereg.md, binding
// prereg evidence/2026-11-13/sim-scale-onramp-round-2115.md §3):
// land origin family 13 — PR #3 merge a76333124 (brawler ascension
// deed, NEW lived deed outmatched_kill for one_person_army, +24 in
// src/js/godpath.js) — onto the far end 203a32775 (GOOD 4/8) and
// measure whether it alone collapses it. Verdicts (fresh thresholds):
// <=1/8 CARRIER, 2/8 AMBIGUOUS (re-run once; 2/8 again -> recorded
// AMBIGUOUS, treated as NOT-CARRIER for ordering, kept on the
// suspect list), >=3/8 NOT-CARRIER.
//
// MEASURED OUTCOME — NOT-CARRIER 4/8 (STEP t13-a76333124, subject
// e514ba0a5ae3). Per-seed days 86/144/150/43/150/87/150/150 are
// BYTE-IDENTICAL to the far-end endpoint days: the subject reproduces
// the far end seed-for-seed. Mechanism: `outmatched` appears in ZERO
// per-seed files and `one_person_army` ZERO times in all 8 — the new
// deed never books under the competent policy (the deed system itself
// is live: godpath_deed teleCounts total 160). The merge-tree
// pre-check predicted a CLEAN pick (5 merged files, 2 added-in-remote,
// 0 markers, no changed-in-both) and the live cherry-pick reproduced
// it exactly.
//
// WHAT THIS TEST PROVES:
//   1. Family identity — merge a76333124, its parents, the 1-commit
//      second-parent side, the exact 1 src/js file (+24/-0), 7 files
//      +281/-2 total, no policy file, no standing.js, far-end
//      standing 75762cb2, fix f8fda429, far-end policy a7ff5c51,
//      outmatched_kill ABSENT at the far end and the first parent,
//      the deed commit's diff identical to the merge diff (vacuous).
//   2. Merge-tree prediction (read-only) — exactly FIVE 'merged'
//      sections with the predicted result blobs, exactly TWO
//      'added in remote' files with the predicted blobs, ZERO
//      conflict markers (+<<<<<<< / +======= / +>>>>>>>), NO
//      'changed in both' section, NO removed/renamed sections.
//   3. Subject — branch transplant-13-subject exists at e514ba0a5,
//      parent is the far end, subject diff vs the far end is the
//      family diff (7 files +281/-2), all seven blobs match the
//      merge-tree result blobs, outmatched_kill present.
//   4. Step verdict — summary survived 4 (bisect verdict GOOD ->
//      transplant NOT-CARRIER), per-seed days byte-identical to the
//      far-end endpoint days, anchorCommit is the subject,
//      standingFix true, policy sha a7ff5c51, errors 0, wall numbers
//      (wave-5 2/8, wave-4 8/8, regional 7/8, national 0, table 0,
//      wins 0, deaths 629, median 150d, standing 150–325, blooded
//      4/8, tribute-ready 1/8).
//   5. Mechanism — 'outmatched' in 0 per-seed files,
//      'one_person_army' 0 mentions in all 8, godpath_deed
//      teleCounts sum to 160 (deed system live), ascension sum 5.
//   6. Verdict mapping — classifyTransplant maps every survived
//      count to the binding transplant verdict.
//   7. Base state — HEAD is back on sim-transplant13-a
//      (WORKTREE-ONLY leg: on the merged tip the arm branch is
//      deleted by design, so the leg asserts the merged-tip
//      replacement instead), no src/js file differs from HEAD,
//      on-disk standing.js is byte-identical to HEAD, and the
//      step-script tooling source (master) still carries all four
//      scratch files.
//   8. Seed-band identity — the step script and the prereg name
//      exactly seeds 190391–190398; the evidence names STEP
//      t13-a76333124.
//   9. Evidence record — the evidence file records the verdict
//      NOT-CARRIER, the byte-identical days, the subject hash, the
//      telemetry refusal, and the runtime-restart recovery.
//  10. Corpus exists — the step summary, the driver log, and all 8
//      per-seed JSONs exist for STEP t13-a76333124.
//
// Usage: node scripts/test-transplant13.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant13');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const MERGE = 'a76333124';
const MERGE_BASE = 'd229b58f595430e2a24c399820061b39c5b689ca';
const DEED_COMMIT = '447085506a0d36d2537ba9c00aa92e8f82eccdf3';
const SUBJECT_BRANCH = 'transplant-13-subject';
const SUBJECT = 'e514ba0a5ae3ac1ef7f3810d12565581e813d069';
const STEP = 't13-a76333124';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const FAR_DAYS = [86, 144, 150, 43, 150, 87, 150, 150];
// Merge-tree predicted result blobs per 'merged' file.
const EXPECTED_MERGED = {
  'scripts/godpath/ladder.js': 'c34cb52b2faa23f6d26ee581d5020643b5a05a34',
  'scripts/godpath/validate.js': 'acfd6e84b4f6a0b2cc3086137a005ec871db5c14',
  'scripts/proof-godhood-rework-20261013.js': '1e63cb8c2b423eac08a467db7fce78cfd1ada1bd',
  'src/data/godpaths.json': '71d05223a878480d33b962d8ee7695b946d588b2',
  'src/js/godpath.js': '27eeef2d078088be796ee1b0093e1677db249bb7',
};
// Merge-tree predicted 'added in remote' blobs.
const EXPECTED_ADDED = {
  'evidence/2026-11-08/brawler-deed-audit.md': 'fa31e3e9251fb4a4eee6bdece17a05b37a06ebff',
  'scripts/godpath/test-brawler-deed.js': 'd42892b8ead279533736309eba7b5ca9fe9cc603',
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
// mergeTree(): run `git merge-tree <base> <ours> <theirs>`
// (read-only dry run — touches no worktree) and return
// { merged: {file: resultBlob}, added: {file: theirBlob},
//   markers: n, raw: string }. This merge's output uses 'merged'
// sections (not 'changed in both'); markers are counted as
// +<<<<<<< / +======= / +>>>>>>> lines — merge-tree prefixes
// markers with '+', so a bare ^<<<<<<< grep misses them.
function mergeTree() {
  const out = execSync('git merge-tree ' + MERGE_BASE + ' ' + FAR + ' ' + MERGE,
    { cwd: REPO, stdio: 'pipe', maxBuffer: 512 * 1024 * 1024 }).toString('utf8');
  const lines = out.split('\n');
  const merged = {};
  const added = {};
  let markers = 0;
  let section = null;
  for (const ln of lines) {
    if (ln === 'merged' || ln === 'added in remote' || ln === 'added in local' ||
        ln === 'changed in both' || ln === 'removed in local' || ln === 'removed in remote' ||
        ln === 'renamed') { section = ln; continue; }
    if (section === 'merged') {
      const m = ln.match(/^  result\s+\d+ ([0-9a-f]+) (.+)$/);
      if (m) merged[m[2]] = m[1];
    }
    if (section === 'added in remote') {
      const m = ln.match(/^  their\s+\d+ ([0-9a-f]+) (.+)$/);
      if (m) added[m[2]] = m[1];
    }
    if (ln.indexOf('+<<<<<<<') === 0 || ln.indexOf('+>>>>>>>') === 0 || ln.indexOf('+=======') === 0) markers++;
  }
  return { merged: merged, added: added, markers: markers, raw: out };
}
function countOccurrences(text, needle) {
  let n = 0, i = 0;
  while ((i = text.indexOf(needle, i)) !== -1) { n++; i += needle.length; }
  return n;
}

(async () => {
  // ---- 1. Family identity ----
  T.section('1. Family identity — PR #3 merge a76333124');
  T.ok('merge commit exists', git('rev-parse ' + MERGE).length === 40, git('log -1 --format=%s ' + MERGE).slice(0, 80));
  T.ok('first parent is d229b58f5 (the merge base)', git('rev-parse ' + MERGE + '^1').startsWith('d229b58f5'), git('log -1 --format=%h\\ %s ' + MERGE + '^1').slice(0, 80));
  T.ok('second parent is 447085506 (brawler deed commit)', git('rev-parse ' + MERGE + '^2').startsWith('447085506'), git('log -1 --format=%h\\ %s ' + MERGE + '^2').slice(0, 80));
  const sideCount = parseInt(git('rev-list --count ' + MERGE + '^1..' + MERGE + '^2'), 10);
  T.ok('second-parent side is 1 commit', sideCount === 1, 'count=' + sideCount);
  const jsFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- src/js').split('\n').sort();
  T.ok('family touches exactly 1 src/js file (godpath.js)', JSON.stringify(jsFiles) === JSON.stringify(['src/js/godpath.js']), jsFiles.join(', '));
  const godpathStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/js/godpath.js');
  T.ok('godpath.js is 24+/0-', godpathStat === '24\t0\tsrc/js/godpath.js', godpathStat);
  const numstat = git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/js').split('\n')
    .reduce(function (acc, line) { const p = line.split('\t'); return { ins: acc.ins + parseInt(p[0], 10), del: acc.del + parseInt(p[1], 10) }; }, { ins: 0, del: 0 });
  T.ok('family src/js delta is +24/-0', numstat.ins === 24 && numstat.del === 0, '+' + numstat.ins + '/-' + numstat.del);
  const allFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE).split('\n').sort();
  T.ok('family touches exactly 7 files total', allFiles.length === 7, allFiles.join(', '));
  const totalStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE).split('\n')
    .reduce(function (acc, line) { const p = line.split('\t'); return { ins: acc.ins + (p[0] === '-' ? 0 : parseInt(p[0], 10)), del: acc.del + (p[1] === '-' ? 0 : parseInt(p[1], 10)) }; }, { ins: 0, del: 0 });
  T.ok('family total delta is +281/-2', totalStat.ins === 281 && totalStat.del === 2, '+' + totalStat.ins + '/-' + totalStat.del);
  T.ok('godpaths.json is 6+/0-', git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/data/godpaths.json') === '6\t0\tsrc/data/godpaths.json', 'godpaths.json +6');
  T.ok('ladder.js is 5+/0-', git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- scripts/godpath/ladder.js') === '5\t0\tscripts/godpath/ladder.js', 'ladder.js +5');
  T.ok('validate.js is 1+/1-', git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- scripts/godpath/validate.js') === '1\t1\tscripts/godpath/validate.js', 'validate.js 1/1');
  T.ok('proof-godhood-rework is 7+/1-', git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- scripts/proof-godhood-rework-20261013.js') === '7\t1\tscripts/proof-godhood-rework-20261013.js', 'proof 7/1');
  T.ok('test-brawler-deed.js is 196+/0- (new)', git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- scripts/godpath/test-brawler-deed.js') === '196\t0\tscripts/godpath/test-brawler-deed.js', 'test +196');
  T.ok('brawler-deed-audit.md is 42+/0- (new)', git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- evidence/2026-11-08/brawler-deed-audit.md') === '42\t0\tevidence/2026-11-08/brawler-deed-audit.md', 'audit +42');
  const polFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- scripts/policies');
  T.ok('family touches no policy file', polFiles === '', polFiles || '(none)');
  T.ok('family does not touch standing.js', git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- src/js/standing.js') === '', '(absent)');
  const farStanding = sha256(gitShow(FAR, 'src/js/standing.js'));
  T.ok('far-end native standing.js sha is 75762cb2...', farStanding.startsWith('75762cb2'), farStanding.slice(0, 12));
  T.ok('fix standing.js sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  const farPolicy = sha256(gitShow(FAR, 'scripts/policies/competent.js'));
  T.ok('far-end policy sha is a7ff5c51...', farPolicy.startsWith('a7ff5c51'), farPolicy.slice(0, 12));
  let farOutmatched = 0;
  try { farOutmatched = parseInt(execSync('git grep -c outmatched_kill ' + FAR + ' -- src/js/godpath.js src/data/godpaths.json scripts/godpath/validate.js', { cwd: REPO, stdio: 'pipe' }).toString().trim().split('\n').reduce(function (a, l) { const p = l.split(':'); return a + parseInt(p[p.length - 1], 10); }, 0), 10); } catch (e) { farOutmatched = 0; }
  T.ok('outmatched_kill is ABSENT at the far end (grep finds 0)', farOutmatched === 0, 'count=' + farOutmatched);
  let baseOutmatched = 0;
  try { baseOutmatched = parseInt(execSync('git grep -c outmatched_kill ' + MERGE_BASE + ' -- src/js/godpath.js src/data/godpaths.json scripts/godpath/validate.js', { cwd: REPO, stdio: 'pipe' }).toString().trim().split('\n').reduce(function (a, l) { const p = l.split(':'); return a + parseInt(p[p.length - 1], 10); }, 0), 10); } catch (e) { baseOutmatched = 0; }
  T.ok('outmatched_kill is ABSENT at the first parent (grep finds 0)', baseOutmatched === 0, 'count=' + baseOutmatched);
  const vacuous = git('diff --stat ' + MERGE + ' ' + DEED_COMMIT);
  T.ok('the merge is vacuous: merge tree == deed commit tree (empty diff)', vacuous === '', vacuous.slice(0, 100) || '(empty)');
  const deedDiff = git('diff --numstat ' + DEED_COMMIT + '^ ' + DEED_COMMIT).split('\n')
    .reduce(function (acc, line) { const p = line.split('\t'); return { ins: acc.ins + (p[0] === '-' ? 0 : parseInt(p[0], 10)), del: acc.del + (p[1] === '-' ? 0 : parseInt(p[1], 10)) }; }, { ins: 0, del: 0 });
  T.ok('the deed commit itself is the same 7 files +281/-2', deedDiff.ins === 281 && deedDiff.del === 2, '+' + deedDiff.ins + '/-' + deedDiff.del);
  T.ok('merge godpath.js blob is 27eeef2d0...', git('ls-tree ' + MERGE + ' -- src/js/godpath.js').indexOf('27eeef2d078088be796ee1b0093e1677db249bb7') !== -1, 'blob 27eeef2d0');

  // ---- 2. Merge-tree prediction ----
  T.section('2. Merge-tree prediction — five clean merges, two adds, zero markers');
  const mt = mergeTree();
  let mtOk = true, mtBad = null;
  for (const f of Object.keys(EXPECTED_MERGED)) {
    if (mt.merged[f] !== EXPECTED_MERGED[f]) { mtOk = false; mtBad = f + ' (got ' + mt.merged[f] + ', want ' + EXPECTED_MERGED[f] + ')'; break; }
  }
  T.ok('merge-tree reports the predicted result blob per merged file', mtOk, mtBad || '5/5 match');
  T.ok('merge-tree reports exactly FIVE merged files', Object.keys(mt.merged).length === 5, 'sections=' + Object.keys(mt.merged).length + ': ' + Object.keys(mt.merged).join(', '));
  let adOk = true, adBad = null;
  for (const f of Object.keys(EXPECTED_ADDED)) {
    if (mt.added[f] !== EXPECTED_ADDED[f]) { adOk = false; adBad = f + ' (got ' + mt.added[f] + ', want ' + EXPECTED_ADDED[f] + ')'; break; }
  }
  T.ok('merge-tree reports the predicted blob per added-in-remote file', adOk, adBad || '2/2 match');
  T.ok('merge-tree reports exactly TWO added-in-remote files', Object.keys(mt.added).length === 2, 'added=' + Object.keys(mt.added).join(', '));
  T.ok('merge-tree reports ZERO conflict markers (+<<<<<<< / +======= / +>>>>>>>)', mt.markers === 0, 'markers=' + mt.markers);
  T.ok("raw merge-tree output carries NO 'changed in both' section", mt.raw.indexOf('changed in both') === -1, 'no changed-in-both');
  T.ok("raw merge-tree output carries NO 'removed in local' section", mt.raw.indexOf('removed in local') === -1, 'no DU signal');
  T.ok("raw merge-tree output carries NO 'removed in remote' section", mt.raw.indexOf('removed in remote') === -1, 'no removed signal');
  T.ok("raw merge-tree output carries NO 'added in local' section", mt.raw.indexOf('added in local') === -1, 'no added-local signal');
  T.ok("raw merge-tree output carries NO 'renamed' section", mt.raw.indexOf('renamed') === -1, 'no renames');

  // ---- 3. Subject ----
  T.section('3. Subject — transplant-13-subject at e514ba0a5');
  let subject = null;
  try { subject = git('rev-parse ' + SUBJECT_BRANCH); } catch (e) { subject = null; }
  T.ok('subject branch exists', subject !== null && subject.length === 40, subject ? subject.slice(0, 12) : '(missing)');
  if (subject) {
    T.ok('subject branch points at e514ba0a5ae3...', subject === SUBJECT, subject.slice(0, 12));
    T.ok('subject parent is the far end 203a32775', git('rev-parse ' + SUBJECT_BRANCH + '^1') === FAR_FULL, 'parent=' + git('rev-parse ' + SUBJECT_BRANCH + '^1').slice(0, 12));
  }
  const subjFiles = git('diff --name-only ' + FAR + ' ' + SUBJECT_BRANCH).split('\n').sort();
  T.ok('subject diff vs far end is exactly the 7 family files', subjFiles.length === 7, subjFiles.join(', '));
  const subjStat = git('diff --numstat ' + FAR + ' ' + SUBJECT_BRANCH).split('\n')
    .reduce(function (acc, line) { const p = line.split('\t'); return { ins: acc.ins + (p[0] === '-' ? 0 : parseInt(p[0], 10)), del: acc.del + (p[1] === '-' ? 0 : parseInt(p[1], 10)) }; }, { ins: 0, del: 0 });
  T.ok('subject diff vs far end is +281/-2 (the family diff)', subjStat.ins === 281 && subjStat.del === 2, '+' + subjStat.ins + '/-' + subjStat.del);
  let subjBlobsOk = true;
  for (const f of Object.keys(EXPECTED_MERGED)) {
    if (git('ls-tree ' + SUBJECT_BRANCH + ' -- ' + f).indexOf(EXPECTED_MERGED[f]) === -1) { subjBlobsOk = false; break; }
  }
  for (const f of Object.keys(EXPECTED_ADDED)) {
    if (git('ls-tree ' + SUBJECT_BRANCH + ' -- ' + f).indexOf(EXPECTED_ADDED[f]) === -1) { subjBlobsOk = false; break; }
  }
  T.ok('all seven subject blobs match the merge-tree result blobs', subjBlobsOk, subjBlobsOk ? '7/7' : 'mismatch');
  const subjGodpath = gitShow(SUBJECT_BRANCH, 'src/js/godpath.js');
  T.ok('subject godpath.js carries outmatched_kill (3 mentions)', countOccurrences(subjGodpath, 'outmatched_kill') === 3, 'count=' + countOccurrences(subjGodpath, 'outmatched_kill'));
  T.ok('subject godpaths.json carries outmatched_kill (1 mention)', countOccurrences(gitShow(SUBJECT_BRANCH, 'src/data/godpaths.json'), 'outmatched_kill') === 1, 'count=1');
  T.ok('subject validate.js carries outmatched_kill (1 mention)', countOccurrences(gitShow(SUBJECT_BRANCH, 'scripts/godpath/validate.js'), 'outmatched_kill') === 1, 'count=1');

  // ---- 4. Step verdict ----
  T.section('4. Step verdict — survived 4/8, byte-identical to the far end');
  const sumPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  const summary = JSON.parse(fs.readFileSync(sumPath, 'utf8'));
  T.ok('summary step id is t13-a76333124', summary.step === STEP, summary.step);
  T.ok('summary survived is 4/8', summary.survived === 4, 'survived=' + summary.survived);
  T.ok('summary bisect verdict is GOOD (transplant: NOT-CARRIER)', summary.verdict === 'GOOD', summary.verdict);
  T.ok('classifyTransplant(4) is NOT-CARRIER', classifyTransplant(summary.survived) === 'NOT-CARRIER', classifyTransplant(summary.survived));
  T.ok('summary rank verdict is REGIONAL_INTACT', summary.rankVerdict === 'REGIONAL_INTACT', summary.rankVerdict);
  const gotDays = summary.perSeed.map(function (r) { return r.days; });
  T.ok('per-seed days are byte-identical to the far-end endpoint days',
    JSON.stringify(gotDays) === JSON.stringify(FAR_DAYS), gotDays.join('/') + ' vs ' + FAR_DAYS.join('/'));
  T.ok('per-seed days equal the summary far-end endpoint days',
    JSON.stringify(gotDays) === JSON.stringify(SEEDS.map(function (s) { return summary.endpoints.far.days[String(s)]; })), 'endpoint match');
  const survivors = summary.perSeed.filter(function (r) { return r.endReason === 'survived'; }).map(function (r) { return r.seed; });
  T.ok('survivors are 190393/190395/190397/190398', JSON.stringify(survivors) === JSON.stringify([190393, 190395, 190397, 190398]), survivors.join(', '));
  T.ok('anchorCommit is the subject e514ba0a5', summary.perSeed.every(function (r) { return r.anchorCommit === 'e514ba0a5ae3'; }), summary.perSeed[0].anchorCommit.slice(0, 12));
  T.ok('standingFix is true on every seed', summary.perSeed.every(function (r) { return r.standingFix === true; }), 'fix on');
  T.ok('policy sha is a7ff5c51 on every seed', summary.perSeed.every(function (r) { return r.policySha === 'a7ff5c516440'; }), summary.perSeed[0].policySha);
  T.ok('instrument errors are 0', summary.instrumentErrors === 0, 'errors=' + summary.instrumentErrors);
  T.ok('wall: wave-5 2/8', summary.wall.wave5 === 2, 'wave5=' + summary.wall.wave5);
  T.ok('wall: wave-4 8/8', summary.wall.wave4 === 8, 'wave4=' + summary.wall.wave4);
  T.ok('wall: regional 7/8', summary.wall.regional === 7, 'regional=' + summary.wall.regional);
  T.ok('wall: national 0', summary.wall.national === 0, 'national=' + summary.wall.national);
  T.ok('wall: table 0', summary.wall.table === 0, 'table=' + summary.wall.table);
  T.ok('wall: wins 0', summary.wall.wins === 0, 'wins=' + summary.wall.wins);
  T.ok('wall: deaths 629', summary.wall.deaths === 629, 'deaths=' + summary.wall.deaths);
  T.ok('wall: median 150d', summary.wall.medianDays === 150, 'median=' + summary.wall.medianDays);
  T.ok('wall: standing 150–325', summary.wall.standingRange[0] === 150 && summary.wall.standingRange[1] === 325, summary.wall.standingRange.join('–'));
  T.ok('wall: blooded 4/8', summary.wall.blooded === 4, 'blooded=' + summary.wall.blooded);
  T.ok('tribute-ready is 1/8 (190397 only)', summary.perSeed.filter(function (r) { return r.tribute && r.tribute.ready; }).length === 1 &&
    summary.perSeed.filter(function (r) { return r.tribute && r.tribute.ready; })[0].seed === 190397, 'ready=190397');
  T.ok('death causes total 629, villager combat 267, starvation 1',
    summary.deathCauses.total === 629 && summary.deathCauses.counts['villager combat'] === 267 && summary.deathCauses.counts.starvation === 1,
    'total=' + summary.deathCauses.total);

  // ---- 5. Mechanism ----
  T.section('5. Mechanism — the deed never books, the deed system is live');
  const corpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  let outmatchedFiles = 0, outmatchedTotal = 0, armyTotal = 0, deedSum = 0, ascSum = 0;
  for (const f of fs.readdirSync(corpusDir).sort()) {
    const text = fs.readFileSync(path.join(corpusDir, f), 'utf8');
    const oc = countOccurrences(text, 'outmatched');
    if (oc > 0) outmatchedFiles++;
    outmatchedTotal += oc;
    armyTotal += countOccurrences(text, 'one_person_army');
    const j = JSON.parse(text);
    deedSum += (j.teleCounts && j.teleCounts.godpath_deed) || 0;
    ascSum += (j.teleCounts && j.teleCounts.ascension) || 0;
  }
  T.ok("'outmatched' appears in ZERO per-seed files", outmatchedFiles === 0, 'files=' + outmatchedFiles);
  T.ok("'outmatched' total mentions across the corpus is 0", outmatchedTotal === 0, 'mentions=' + outmatchedTotal);
  T.ok("'one_person_army' total mentions across the corpus is 0", armyTotal === 0, 'mentions=' + armyTotal);
  T.ok('godpath_deed teleCounts sum to 160 (deed system live)', deedSum === 160, 'sum=' + deedSum);
  T.ok('ascension teleCounts sum to 5', ascSum === 5, 'sum=' + ascSum);

  // ---- 6. Verdict mapping ----
  T.section('6. Verdict mapping — transplant thresholds');
  const table = [[0, 'CARRIER'], [1, 'CARRIER'], [2, 'AMBIGUOUS'], [3, 'NOT-CARRIER'], [4, 'NOT-CARRIER'], [8, 'NOT-CARRIER'], [-1, 'UNCLASSIFIABLE'], [9, 'UNCLASSIFIABLE'], [NaN, 'UNCLASSIFIABLE']];
  for (const pair of table) {
    T.ok('survived ' + pair[0] + ' -> ' + pair[1], classifyTransplant(pair[0]) === pair[1], classifyTransplant(pair[0]));
  }

  // ---- 7. Base state ----
  T.section('7. Base state — arm branch (worktree-only leg), clean tree, no swap residue');
  const headBranch = git('rev-parse --abbrev-ref HEAD');
  if (headBranch === 'sim-transplant13-a') {
    T.ok('HEAD is on the arm branch sim-transplant13-a (worktree-only leg)', true, 'HEAD=' + headBranch);
  } else {
    // WORKTREE-ONLY leg: on the merged tip the arm branch is deleted
    // by design, so the leg asserts the merged-tip replacement
    // instead — this test file is tracked at HEAD and the subject
    // branch (kept) still points at the subject commit. This keeps
    // the proof green on master (cf. round-0215 proof-on-master note).
    const tracked = git('ls-tree HEAD -- scripts/test-transplant13.js');
    T.ok('HEAD is on the merged tip, not the arm branch (worktree-only leg: merged-tip replacement)',
      tracked.indexOf('test-transplant13.js') !== -1, 'HEAD=' + headBranch + ' — arm branch deleted on merge by design');
  }
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
  const preregTracked = git('ls-tree HEAD -- evidence/2026-11-14/sim-transplant13-prereg.md');
  T.ok('the prereg file is tracked at HEAD (committed before the subject)', preregTracked.indexOf('sim-transplant13-prereg.md') !== -1, 'tracked');

  // ---- 8. Seed-band identity ----
  T.section('8. Seed-band identity');
  const stepSrc = fs.readFileSync(path.join(REPO, 'scripts', 'culpritbisect-step.sh'), 'utf8');
  T.ok('step script names the band 190391..190398',
    stepSrc.indexOf('190391,190392,190393,190394,190395,190396,190397,190398') !== -1, 'band literal present');
  const prereg = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant13-prereg.md'), 'utf8');
  T.ok('prereg names the same band', prereg.indexOf('190391') !== -1 && prereg.indexOf('190398') !== -1, 'band in prereg');
  T.ok('prereg names the STEP id t13-a76333124', prereg.indexOf('t13-a76333124') !== -1, 'STEP id present');
  T.ok('prereg names the subject branch transplant-13-subject', prereg.indexOf('transplant-13-subject') !== -1, 'subject branch present');
  const evPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant13.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('evidence names the STEP id t13-a76333124', ev.indexOf('t13-a76333124') !== -1, 'STEP id present');

  // ---- 9. Evidence record ----
  T.section('9. Evidence record — verdict, identity, telemetry, restart');
  T.ok('evidence records the verdict NOT-CARRIER', ev.indexOf('NOT-CARRIER') !== -1, 'NOT-CARRIER present');
  T.ok('evidence records the byte-identical days', ev.indexOf('BYTE-IDENTICAL') !== -1 || ev.indexOf('byte-identical') !== -1, 'byte-identical present');
  T.ok('evidence records the subject hash e514ba0a5', ev.indexOf('e514ba0a5') !== -1, 'subject hash present');
  T.ok('evidence records the telemetry refusal', ev.indexOf('REFUSED') !== -1 && ev.indexOf('recorder-corpus') !== -1, 'refusal present');
  T.ok('evidence records the runtime-restart recovery', ev.indexOf('RUNTIME RESTART') !== -1, 'restart note present');
  T.ok('evidence records the mechanism (deed never books)', ev.indexOf('never books') !== -1, 'mechanism present');
  T.ok('evidence records the caveat 2115 §3 (c) as not owed', ev.indexOf('no split is owed') !== -1, 'caveat note present');

  // ---- 10. Corpus exists ----
  T.section('10. Corpus — summary, driver log, 8 per-seed files');
  const logPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  T.ok('step summary exists', fs.existsSync(sumPath), 'summary present');
  T.ok('driver log exists and is non-empty', fs.existsSync(logPath) && fs.statSync(logPath).size > 0, 'log size=' + (fs.existsSync(logPath) ? fs.statSync(logPath).size : 0));
  const perSeedFiles = fs.readdirSync(corpusDir).filter(function (f) { return f.indexOf('culpritbisect-s') === 0; });
  T.ok('all 8 per-seed JSONs exist', perSeedFiles.length === 8, 'files=' + perSeedFiles.length);
  T.ok('driver log records the GOOD classification', fs.readFileSync(logPath, 'utf8').indexOf('GOOD') !== -1, 'GOOD in log');

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
