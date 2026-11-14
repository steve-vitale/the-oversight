#!/usr/bin/env node
// test-transplant14.js — proof test for the H1 TRANSPLANT, family 14
// (arm sim-transplant14-a).
//
// THE QUESTION (evidence/2026-11-14/sim-transplant14-prereg.md, binding
// prereg evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 +
// evidence/2026-11-13/sim-culpritbisect-a-prereg.md): land origin
// family 14 — PR #10 merge 7688cb7a4 (snippet stage-direction guard,
// convoSnippetIsStageDirection, +12 in src/js/conversation.js) — onto
// the far end 203a32775 (GOOD 4/8) and measure whether it alone
// collapses it. Verdicts (fresh thresholds): <=1/8 CARRIER, 2/8
// AMBIGUOUS (re-run once; 2/8 again -> recorded AMBIGUOUS, treated as
// NOT-CARRIER for ordering, kept on the suspect list), >=3/8
// NOT-CARRIER.
//
// MEASURED OUTCOME — NOT-CARRIER 4/8 (STEP t14-7688cb7a4, subject
// 9f713657b). Per-seed days 86/144/150/43/150/87/150/150 are
// BYTE-IDENTICAL to the far-end endpoint days: the subject reproduces
// the far end seed-for-seed. Mechanism: the guard NEVER FIRES in the
// corpus — 'glance at the fire' / 'comfortable quiet' / 'tired smile'
// / 'resume' / 'convoSnippet' appear 0 times in all 8 per-seed files,
// 0 of 225 vetSays lines match a stage-direction pattern, and no
// resume opener fires at all. The guard's own behavior is proven
// directly from the subject's code (extracted function: stage
// directions true, real speech false). The merge-tree pre-check with
// the PRESCRIBED base (d229b58f5) predicts conflicts in two
// zero-src-reader tooling files (scripts/balance-proof.json,
// scripts/green-list.txt) — an artifact of both sides having moved
// those files since the merge base; the cherry-pick-base merge-tree
// (16cdd6900, the operation the live pick actually runs) exits 0
// clean, and the live cherry-pick reproduced it exactly.
//
// WHAT THIS TEST PROVES:
//   1. Family identity — merge 7688cb7a4, its parents, the 1-commit
//      second-parent side, the exact 1 src/js file (+12/-0), 2 files
//      +33/-0 total, no policy file, no standing.js, far-end
//      standing 75762cb2, fix f8fda429, far-end policy a7ff5c51,
//      the guard ABSENT at the far end and PRESENT at the merge,
//      the side commit's diff identical to the merge's diff.
//   2. Merge-tree prediction (read-only) — prescribed base:
//      exactly NINE 'changed in both' sections, exactly TWO conflicts
//      (SIX marker lines: +<<<<<<< / +======= / +>>>>>>> per
//      conflict), both in zero-src-reader tooling files
//      (balance-proof.json, green-list.txt); the conversation.js
//      section carries no marker. Cherry-pick base (16cdd6900):
//      exit 0, ZERO markers, test file added in remote, the guard
//      hunk applies cleanly.
//   3. Subject — branch transplant-14-subject exists at 9f713657b,
//      parent is the far end, subject diff vs the far end is the
//      family diff (2 files +33/-0), the test-file blob matches the
//      merge's blob, the subject conversation.js carries the guard
//      (call site + method, 2 mentions of the name).
//   4. Guard behavior — the extracted convoSnippetIsStageDirection
//      from the subject returns true for the three stage-direction
//      shapes and false for real speech / empty / null.
//   5. Step verdict — summary survived 4 (bisect verdict GOOD ->
//      transplant NOT-CARRIER), per-seed days byte-identical to the
//      far-end endpoint days, anchorCommit is the subject,
//      standingFix true, policy sha a7ff5c51, errors 0, wall numbers
//      (wave-5 2/8, wave-4 8/8, regional 7/8, national 0, table 0,
//      wins 0, deaths 629, median 150d, standing 150–325, blooded
//      4/8, tribute-ready 1/8).
//   6. Mechanism — the guard never fires in the corpus (0 mentions
//      of every stage-direction / resume token in all 8 per-seed
//      files; 225 vetSays, 0 stage-pattern hits, 0 resume-pattern
//      hits).
//   7. Verdict mapping — classifyTransplant maps every survived
//      count to the binding transplant verdict.
//   8. Base state — HEAD is back on sim-transplant14-a
//      (WORKTREE-ONLY leg: on the merged tip the arm branch is
//      deleted by design, so the leg asserts the merged-tip
//      replacement instead), no src/js file differs from HEAD,
//      on-disk standing.js is byte-identical to HEAD, and the
//      step-script tooling source (master) still carries all four
//      scratch files.
//   9. Seed-band identity — the step script and the prereg name
//      exactly seeds 190391–190398; the evidence names STEP
//      t14-7688cb7a4.
//  10. Evidence record — the evidence file records the verdict
//      NOT-CARRIER, the byte-identical days, the subject hash, the
//      telemetry refusal, the guard-never-fires mechanism, and the
//      merge-tree tooling-conflict note.
//  11. Corpus exists — the step summary, the driver log, and all 8
//      per-seed JSONs exist for STEP t14-7688cb7a4.
//
// Usage: node scripts/test-transplant14.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant14');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const MERGE = '7688cb7a4';
const MERGE_BASE = 'd229b58f595430e2a24c399820061b39c5b689ca';
const FIRST_PARENT = '16cdd690062b3551ff6b4b0d3639770c8af84b5f';
const SECOND_COMMIT = 'e4836747ed6daccfc5eb6deec8a8ae8f8dbaf90b';
const SUBJECT_BRANCH = 'transplant-14-subject';
const SUBJECT = '9f713657bb16438ccd9303ee7d15ed62c90ce447';
const STEP = 't14-7688cb7a4';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const FAR_DAYS = [86, 144, 150, 43, 150, 87, 150, 150];
// Prescribed-base merge-tree: the nine 'changed in both' files.
const EXPECTED_CHANGED_BOTH = [
  'docs/ONTOLOGY.md',
  'scripts/balance-proof.json',
  'scripts/green-list.txt',
  'src/js/conversation.js',
  'src/js/convo-wants.js',
  'src/js/game.js',
  'src/js/villager-agency.js',
  'src/js/villager-objectives.js',
  'sw.js',
];
// The two files whose prescribed-base sections carry real markers.
const EXPECTED_MARKER_FILES = ['scripts/balance-proof.json', 'scripts/green-list.txt'];
const TEST_FILE_BLOB = '405b86d0f8d8fa4bee87923c5ca97ea581543fec';

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
function countOccurrences(text, needle) {
  let n = 0, i = 0;
  while ((i = text.indexOf(needle, i)) !== -1) { n++; i += needle.length; }
  return n;
}
// mergeTree(base): run `git merge-tree <base> <ours> <theirs>`
// (read-only dry run — touches no worktree) and return
// { sections: {file: {kind, markers}}, markers: n, raw, exitCode }.
// Markers are counted as +<<<<<<< / +======= / +>>>>>>> lines —
// merge-tree prefixes markers with '+', so a bare ^<<<<<<< grep
// misses them.
function mergeTree(base) {
  let out = '';
  let exitCode = 0;
  try {
    out = execSync('git merge-tree ' + base + ' ' + FAR + ' ' + MERGE,
      { cwd: REPO, stdio: 'pipe', maxBuffer: 512 * 1024 * 1024 }).toString('utf8');
  } catch (e) {
    exitCode = e.status;
    out = (e.stdout || Buffer.alloc(0)).toString('utf8');
  }
  const lines = out.split('\n');
  const sections = {};
  let sectionKind = null;
  let sectionFile = null;
  let markers = 0;
  for (const ln of lines) {
    if (ln === 'merged' || ln === 'added in remote' || ln === 'added in local' ||
        ln === 'changed in both' || ln === 'removed in local' || ln === 'removed in remote' ||
        ln === 'renamed') { sectionKind = ln; sectionFile = null; continue; }
    const m = ln.match(/^  (?:result|base|our|their)\s+\d+ [0-9a-f]+ (.+)$/);
    if (m && sectionKind) {
      sectionFile = m[1];
      if (!sections[sectionFile]) sections[sectionFile] = { kind: sectionKind, markers: 0 };
    }
    if (ln.indexOf('+<<<<<<<') === 0 || ln.indexOf('+>>>>>>>') === 0 || ln.indexOf('+=======') === 0) {
      markers++;
      if (sectionFile && sections[sectionFile]) sections[sectionFile].markers++;
    }
  }
  return { sections: sections, markers: markers, raw: out, exitCode: exitCode };
}

(async () => {
  // ---- 1. Family identity ----
  T.section('1. Family identity — PR #10 merge 7688cb7a4');
  T.ok('merge commit exists', git('rev-parse ' + MERGE).length === 40, git('log -1 --format=%s ' + MERGE).slice(0, 80));
  T.ok('first parent is 16cdd6900 (curious-stale-opener-fix merge)', git('rev-parse ' + MERGE + '^1').startsWith('16cdd6900'), git('log -1 --format=%h\\ %s ' + MERGE + '^1').slice(0, 80));
  T.ok('second parent is e4836747e (stage-direction guard commit)', git('rev-parse ' + MERGE + '^2').startsWith('e4836747e'), git('log -1 --format=%h\\ %s ' + MERGE + '^2').slice(0, 80));
  const sideCount = parseInt(git('rev-list --count ' + MERGE + '^1..' + MERGE + '^2'), 10);
  T.ok('second-parent side is 1 commit', sideCount === 1, 'count=' + sideCount);
  const jsFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- src/js').split('\n').sort();
  T.ok('family touches exactly 1 src/js file (conversation.js)', JSON.stringify(jsFiles) === JSON.stringify(['src/js/conversation.js']), jsFiles.join(', '));
  T.ok('conversation.js is 12+/0-', git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- src/js/conversation.js') === '12\t0\tsrc/js/conversation.js', 'conversation.js +12');
  T.ok('test-snippet-stage-direction.js is 21+/0- (new)', git('diff --numstat ' + MERGE + '^1 ' + MERGE + ' -- scripts/test-snippet-stage-direction.js') === '21\t0\tscripts/test-snippet-stage-direction.js', 'test +21');
  const allFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE).split('\n').sort();
  T.ok('family touches exactly 2 files total', allFiles.length === 2, allFiles.join(', '));
  const totalStat = git('diff --numstat ' + MERGE + '^1 ' + MERGE).split('\n')
    .reduce(function (acc, line) { const p = line.split('\t'); return { ins: acc.ins + (p[0] === '-' ? 0 : parseInt(p[0], 10)), del: acc.del + (p[1] === '-' ? 0 : parseInt(p[1], 10)) }; }, { ins: 0, del: 0 });
  T.ok('family total delta is +33/-0', totalStat.ins === 33 && totalStat.del === 0, '+' + totalStat.ins + '/-' + totalStat.del);
  const polFiles = git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- scripts/policies');
  T.ok('family touches no policy file', polFiles === '', polFiles || '(none)');
  T.ok('family does not touch standing.js', git('diff --name-only ' + MERGE + '^1 ' + MERGE + ' -- src/js/standing.js') === '', '(absent)');
  const farStanding = sha256(gitShow(FAR, 'src/js/standing.js'));
  T.ok('far-end native standing.js sha is 75762cb2...', farStanding.startsWith('75762cb2'), farStanding.slice(0, 12));
  T.ok('fix standing.js sha is f8fda429...', sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, FIX_SHA.slice(0, 12));
  const farPolicy = sha256(gitShow(FAR, 'scripts/policies/competent.js'));
  T.ok('far-end policy sha is a7ff5c51...', farPolicy.startsWith('a7ff5c51'), farPolicy.slice(0, 12));
  const farConv = gitShow(FAR, 'src/js/conversation.js');
  T.ok('convoSnippetIsStageDirection is ABSENT at the far end', countOccurrences(farConv, 'convoSnippetIsStageDirection') === 0, 'count=0');
  const mergeConv = gitShow(MERGE, 'src/js/conversation.js');
  T.ok('convoSnippetIsStageDirection is PRESENT at the merge (2 mentions)', countOccurrences(mergeConv, 'convoSnippetIsStageDirection') === 2, 'count=2');
  const sideStat = git('diff --numstat ' + SECOND_COMMIT + '^ ' + SECOND_COMMIT).split('\n')
    .reduce(function (acc, line) { const p = line.split('\t'); return { ins: acc.ins + (p[0] === '-' ? 0 : parseInt(p[0], 10)), del: acc.del + (p[1] === '-' ? 0 : parseInt(p[1], 10)) }; }, { ins: 0, del: 0 });
  T.ok('the side commit itself is the same 2 files +33/-0', sideStat.ins === 33 && sideStat.del === 0, '+' + sideStat.ins + '/-' + sideStat.del);
  const sideFiles = git('diff --name-only ' + SECOND_COMMIT + '^ ' + SECOND_COMMIT).split('\n').sort();
  T.ok('the side commit touches the same 2 files', JSON.stringify(sideFiles) === JSON.stringify(allFiles), sideFiles.join(', '));

  // ---- 2. Merge-tree prediction ----
  T.section('2a. Merge-tree prediction, prescribed base — 9 changed-in-both, 2 tooling conflicts');
  const mt = mergeTree(MERGE_BASE);
  const changedBoth = Object.keys(mt.sections).filter(function (f) { return mt.sections[f].kind === 'changed in both'; }).sort();
  T.ok('prescribed-base merge-tree reports exactly NINE changed-in-both sections',
    JSON.stringify(changedBoth) === JSON.stringify(EXPECTED_CHANGED_BOTH.slice().sort()),
    changedBoth.length + ': ' + changedBoth.join(', '));
  T.ok('prescribed-base merge-tree reports exactly TWO conflicts (SIX marker lines)', mt.markers === 6, 'markers=' + mt.markers);
  let markerFilesOk = true;
  for (const f of EXPECTED_MARKER_FILES) {
    if (!mt.sections[f] || mt.sections[f].markers === 0) { markerFilesOk = false; break; }
  }
  T.ok('both markers sit in zero-src-reader tooling files (balance-proof.json, green-list.txt)', markerFilesOk, EXPECTED_MARKER_FILES.join(', '));
  T.ok('the conversation.js section carries NO marker', mt.sections['src/js/conversation.js'] && mt.sections['src/js/conversation.js'].markers === 0, 'conversation.js markers=0');
  T.ok('no src/js section other than conversation.js carries a marker',
    Object.keys(mt.sections).filter(function (f) { return f.indexOf('src/js/') === 0 && mt.sections[f].markers > 0; }).length === 0, 'no js markers');
  T.section('2b. Merge-tree prediction, cherry-pick base — clean pick');
  const mtPick = mergeTree(FIRST_PARENT);
  T.ok('cherry-pick-base merge-tree exits 0 (clean)', mtPick.exitCode === 0, 'exit=' + mtPick.exitCode);
  T.ok('cherry-pick-base merge-tree reports ZERO conflict markers', mtPick.markers === 0, 'markers=' + mtPick.markers);
  T.ok('cherry-pick-base merge-tree adds the test file in remote with the merge blob',
    mtPick.sections['scripts/test-snippet-stage-direction.js'] && mtPick.sections['scripts/test-snippet-stage-direction.js'].kind === 'added in remote',
    'test file added in remote');
  T.ok('cherry-pick-base merge-tree raw output carries the guard hunk for conversation.js',
    mtPick.raw.indexOf('convoSnippetIsStageDirection(sn)) return false;') !== -1, 'guard hunk present');

  // ---- 3. Subject ----
  T.section('3. Subject — transplant-14-subject at 9f713657b');
  let subject = null;
  try { subject = git('rev-parse ' + SUBJECT_BRANCH); } catch (e) { subject = null; }
  T.ok('subject branch exists', subject !== null && subject.length === 40, subject ? subject.slice(0, 12) : '(missing)');
  if (subject) {
    T.ok('subject branch points at 9f713657bb16...', subject === SUBJECT, subject.slice(0, 12));
    T.ok('subject parent is the far end 203a32775', git('rev-parse ' + SUBJECT_BRANCH + '^1') === FAR_FULL, 'parent=' + git('rev-parse ' + SUBJECT_BRANCH + '^1').slice(0, 12));
  }
  const subjFiles = git('diff --name-only ' + FAR + ' ' + SUBJECT_BRANCH).split('\n').sort();
  T.ok('subject diff vs far end is exactly the 2 family files', subjFiles.length === 2, subjFiles.join(', '));
  const subjStat = git('diff --numstat ' + FAR + ' ' + SUBJECT_BRANCH).split('\n')
    .reduce(function (acc, line) { const p = line.split('\t'); return { ins: acc.ins + (p[0] === '-' ? 0 : parseInt(p[0], 10)), del: acc.del + (p[1] === '-' ? 0 : parseInt(p[1], 10)) }; }, { ins: 0, del: 0 });
  T.ok('subject diff vs far end is +33/-0 (the family diff)', subjStat.ins === 33 && subjStat.del === 0, '+' + subjStat.ins + '/-' + subjStat.del);
  T.ok('subject test-file blob matches the merge blob', git('ls-tree ' + SUBJECT_BRANCH + ' -- scripts/test-snippet-stage-direction.js').indexOf(TEST_FILE_BLOB) !== -1, 'blob ' + TEST_FILE_BLOB.slice(0, 12));
  const subjConv = gitShow(SUBJECT_BRANCH, 'src/js/conversation.js');
  T.ok('subject conversation.js carries the guard (2 mentions)', countOccurrences(subjConv, 'convoSnippetIsStageDirection') === 2, 'count=2');
  T.ok('subject conversation.js carries the guard call site', subjConv.indexOf('if (this.convoSnippetIsStageDirection(sn)) return false;') !== -1, 'call site present');
  T.ok('subject conversation.js carries the guard comment', subjConv.indexOf('STAGE DIRECTION (prove-out 2026-11-08)') !== -1, 'comment present');
  const subjAdded = git('diff ' + FAR + ' ' + SUBJECT_BRANCH + ' -- src/js/conversation.js').split('\n').filter(function (l) { return l.indexOf('+') === 0 && l.indexOf('+++') !== 0; });
  const famAdded = git('diff ' + MERGE + '^1 ' + MERGE + ' -- src/js/conversation.js').split('\n').filter(function (l) { return l.indexOf('+') === 0 && l.indexOf('+++') !== 0; });
  T.ok('subject added lines equal the family added lines (same +12)', JSON.stringify(subjAdded) === JSON.stringify(famAdded), 'added lines identical');

  // ---- 4. Guard behavior (extracted from the subject's code) ----
  T.section('4. Guard behavior — extracted convoSnippetIsStageDirection from the subject');
  const fnMatch = subjConv.match(/convoSnippetIsStageDirection\(sn\) \{([\s\S]*?)\n    \},/);
  T.ok('guard method extracts from the subject conversation.js', fnMatch !== null, fnMatch ? 'extracted' : 'no match');
  let guard = null;
  if (fnMatch) { guard = new Function('sn', fnMatch[1]); }
  if (guard) {
    T.ok('stage direction "They glance at the fire..." -> true', guard('They glance at the fire, then back.') === true, 'true');
    T.ok('stage direction "A comfortable quiet settles..." -> true', guard('A comfortable quiet settles between you.') === true, 'true');
    T.ok('stage direction with "A tired smile" -> true', guard("You're a good listener. A tired smile.") === true, 'true');
    T.ok('stage direction "Still on what they confided" -> true', guard('Still on what they confided last week.') === true, 'true');
    T.ok('real speech "The water haul went wrong..." -> false', guard('The water haul went wrong after the storm.') === false, 'false');
    T.ok('real speech "We need more hands on the wall" -> false', guard('We need more hands on the wall.') === false, 'false');
    T.ok('empty string -> false', guard('') === false, 'false');
    T.ok('null -> false', guard(null) === false, 'false');
  }

  // ---- 5. Step verdict ----
  T.section('5. Step verdict — survived 4/8, byte-identical to the far end');
  const sumPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  const summary = JSON.parse(fs.readFileSync(sumPath, 'utf8'));
  T.ok('summary step id is t14-7688cb7a4', summary.step === STEP, summary.step);
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
  T.ok('anchorCommit is the subject 9f713657b', summary.perSeed.every(function (r) { return r.anchorCommit === '9f713657bb16'; }), summary.perSeed[0].anchorCommit.slice(0, 12));
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

  // ---- 6. Mechanism ----
  T.section('6. Mechanism — the guard never fires in the corpus');
  const corpusDir = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  const tokens = ['glance at the fire', 'comfortable quiet', 'tired smile', 'resume', 'convoSnippet', 'pick it up', 'They glance'];
  const tokenCounts = {};
  let vetSaysTotal = 0, stageHits = 0, resumeHits = 0;
  const stageRe = /glance at the fire|comfortable quiet settles|tired smile|^They |^A comfortable |^A warmth |^A tired |Still on what they confided/i;
  const resumeRe = /pick it up|never (did )?finish|we left it|wandered off/i;
  for (const f of fs.readdirSync(corpusDir).sort()) {
    const text = fs.readFileSync(path.join(corpusDir, f), 'utf8');
    for (const tok of tokens) { tokenCounts[tok] = (tokenCounts[tok] || 0) + countOccurrences(text.toLowerCase(), tok.toLowerCase()); }
    const j = JSON.parse(text);
    for (const v of (j.vetSays || [])) {
      vetSaysTotal++;
      const line = (v && v.line) || '';
      if (stageRe.test(line)) stageHits++;
      if (resumeRe.test(line)) resumeHits++;
    }
  }
  for (const tok of tokens) {
    T.ok("'" + tok + "' appears 0 times across the corpus", tokenCounts[tok] === 0, 'mentions=' + tokenCounts[tok]);
  }
  T.ok('vetSays total is 225', vetSaysTotal === 225, 'total=' + vetSaysTotal);
  T.ok('0 vetSays lines match a stage-direction pattern', stageHits === 0, 'hits=' + stageHits);
  T.ok('0 vetSays lines match a resume-opener pattern', resumeHits === 0, 'hits=' + resumeHits);

  // ---- 7. Verdict mapping ----
  T.section('7. Verdict mapping — transplant thresholds');
  const table = [[0, 'CARRIER'], [1, 'CARRIER'], [2, 'AMBIGUOUS'], [3, 'NOT-CARRIER'], [4, 'NOT-CARRIER'], [8, 'NOT-CARRIER'], [-1, 'UNCLASSIFIABLE'], [9, 'UNCLASSIFIABLE'], [NaN, 'UNCLASSIFIABLE']];
  for (const pair of table) {
    T.ok('survived ' + pair[0] + ' -> ' + pair[1], classifyTransplant(pair[0]) === pair[1], classifyTransplant(pair[0]));
  }

  // ---- 8. Base state ----
  T.section('8. Base state — arm branch (worktree-only leg), clean tree, no swap residue');
  const headBranch = git('rev-parse --abbrev-ref HEAD');
  if (headBranch === 'sim-transplant14-a') {
    T.ok('HEAD is on the arm branch sim-transplant14-a (worktree-only leg)', true, 'HEAD=' + headBranch);
  } else {
    // WORKTREE-ONLY leg: on the merged tip the arm branch is deleted
    // by design, so the leg asserts the merged-tip replacement
    // instead — this test file is tracked at HEAD and the subject
    // branch (kept) still points at the subject commit. This keeps
    // the proof green on master (cf. round-0215 proof-on-master note).
    const tracked = git('ls-tree HEAD -- scripts/test-transplant14.js');
    T.ok('HEAD is on the merged tip, not the arm branch (worktree-only leg: merged-tip replacement)',
      tracked.indexOf('test-transplant14.js') !== -1, 'HEAD=' + headBranch + ' — arm branch deleted on merge by design');
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
  const preregTracked = git('ls-tree HEAD -- evidence/2026-11-14/sim-transplant14-prereg.md');
  T.ok('the prereg file is tracked at HEAD (committed before the subject)', preregTracked.indexOf('sim-transplant14-prereg.md') !== -1, 'tracked');

  // ---- 9. Seed-band identity ----
  T.section('9. Seed-band identity');
  const stepSrc = fs.readFileSync(path.join(REPO, 'scripts', 'culpritbisect-step.sh'), 'utf8');
  T.ok('step script names the band 190391..190398',
    stepSrc.indexOf('190391,190392,190393,190394,190395,190396,190397,190398') !== -1, 'band literal present');
  const prereg = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant14-prereg.md'), 'utf8');
  T.ok('prereg names the same band', prereg.indexOf('190391') !== -1 && prereg.indexOf('190398') !== -1, 'band in prereg');
  T.ok('prereg names the STEP id t14-7688cb7a4', prereg.indexOf('t14-7688cb7a4') !== -1, 'STEP id present');
  T.ok('prereg names the subject branch transplant-14-subject', prereg.indexOf('transplant-14-subject') !== -1, 'subject branch present');
  const evPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-transplant14.md');
  const ev = fs.existsSync(evPath) ? fs.readFileSync(evPath, 'utf8') : '';
  T.ok('evidence names the STEP id t14-7688cb7a4', ev.indexOf('t14-7688cb7a4') !== -1, 'STEP id present');

  // ---- 10. Evidence record ----
  T.section('10. Evidence record — verdict, identity, telemetry, mechanism');
  T.ok('evidence records the verdict NOT-CARRIER', ev.indexOf('NOT-CARRIER') !== -1, 'NOT-CARRIER present');
  T.ok('evidence records the byte-identical days', ev.indexOf('BYTE-IDENTICAL') !== -1 || ev.indexOf('byte-identical') !== -1, 'byte-identical present');
  T.ok('evidence records the subject hash 9f713657b', ev.indexOf('9f713657b') !== -1, 'subject hash present');
  T.ok('evidence records the telemetry refusal', ev.indexOf('REFUSED') !== -1 && ev.indexOf('recorder-corpus') !== -1, 'refusal present');
  T.ok('evidence records the guard-never-fires mechanism', ev.indexOf('never fires') !== -1, 'mechanism present');
  T.ok('evidence records the merge-tree tooling-conflict note', ev.indexOf('balance-proof.json') !== -1 && ev.indexOf('green-list.txt') !== -1, 'tooling-conflict note present');

  // ---- 11. Corpus exists ----
  T.section('11. Corpus — summary, driver log, 8 per-seed files');
  const logPath = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-driver.log');
  T.ok('step summary exists', fs.existsSync(sumPath), 'summary present');
  T.ok('driver log exists and is non-empty', fs.existsSync(logPath) && fs.statSync(logPath).size > 0, 'log size=' + (fs.existsSync(logPath) ? fs.statSync(logPath).size : 0));
  const perSeedFiles = fs.readdirSync(corpusDir).filter(function (f) { return f.indexOf('culpritbisect-s') === 0; });
  T.ok('all 8 per-seed JSONs exist', perSeedFiles.length === 8, 'files=' + perSeedFiles.length);
  T.ok('driver log records the GOOD classification', fs.readFileSync(logPath, 'utf8').indexOf('GOOD') !== -1, 'GOOD in log');

  T.done();
})().catch(function (e) { console.error('HARNESS ERROR', e); process.exit(1); });
