#!/usr/bin/env node
// test-guardablate-a.js — proof test for the CASCADE lingerer
// guard-removal ablation (arm sim-guardablate-a), the DECIDING TEST
// for the family-7 brain-side program decision (1615Z coordinator
// decision 2 + this run's coordinator decision 2).
//
// THE QUESTION (evidence/2026-11-15/sim-guardablate-a-prereg.md,
// committed before any judged sim): does the CASCADE lingerer guard
// alone explain the lifted survival floor? The ONLY src/js change
// between the 1215Z base (1ca2c257d, fresh-band baseline 3/8) and the
// 1615Z base (b4343ac9d, matched-band baseline 8/8) is the +16-line
// guard (commit dc8cbd3f3). This arm supplies the controlled A/B on
// identical seeds: tip with the guard vs tip with EXACTLY the guard
// lines removed. The ablation is the inverse of the landed commit,
// line for line: remove game.js:24147-24162, -16/+0, one file.
//
// WHAT THIS TEST PROVES:
//   1. Guard identity — the 16 lines at game.js:24147-24162 match
//      dc8cbd3f3's added lines byte-identically; the guard sits inside
//      monsterTurn; the lever commit touches exactly src/js/game.js
//      +16 in one hunk; its code comment cites 38/88 scholar deaths.
//   2. Substrate — the only src/js change 1ca2c257d..b4343ac9d is the
//      guard; b4343ac9d..53e7b6a1e src/js is convo-mood +16 (r214
//      plain parting, dialogue-only) + build.js version stamp;
//      standing/policy shas identical across all three bases.
//   3. Ablation definition — the subject diff is exactly the 16
//      removed lines (-16/+0, one file), listed verbatim and matched
//      against the live source; the rejected stub form is named.
//   4. Mechanism analysis — the guarded `if (m.lingering) return;`
//      is present at the base; the movement/combat code after the
//      guard is intact; startCombat, the fieldFight sortie, the gorge
//      and the drift valve are present and untouched by the guard.
//   5. Verdict mapping — classifyVerdict implements BOTH frozen
//      forms: absolute (baseline 8/8: subject <=3 CONFIRMED,
//      >=6 REFUTED, else AMBIGUOUS) and relative (baseline <8/8:
//      subject <= baseline-5 CONFIRMED, >= baseline-2 REFUTED,
//      else AMBIGUOUS); boundary unit-cases for both.
//   6. Base state — HEAD is on the arm branch, the base tip is an
//      ancestor of HEAD (rebase-tolerant), the prereg names the run
//      id + band, no src/js file differs from HEAD, on-disk standing.js
//      is byte-identical to HEAD, only arm files are uncommitted, step
//      tooling is present (driver + shared analyzer + instrument on
//      master, redefined analyzer + step script on the arm branch),
//      the step script carries the finding-#2381 restore fix.
//   7. Guard-effect legs (live, baseline tree) — the cascade-b
//      unit-lingering case passes on the baseline: lingering adjacent
//      no move/no fight, lingering on-cell no fight, non-lingering
//      hungry adjacent DOES engage (positive control), direct
//      startCombat on a lingering raider still fights; the static
//      case passes (guard hunk +16, one file).
//   8. Live subject state — STAGE-1 branch: no subject branch exists
//      yet. After the cut: one commit, diff exactly the ablation set
//      (-16/+0, one file, removed lines byte-identical, no other game
//      file touched, subject game.js == base game.js minus exactly
//      those 16 lines, policy + standing == base), and the
//      multi-turn lingerer check (scripts/test-guardablate-
//      lingerer-turns.js) run live on a /tmp pathspec extract of the
//      subject shows the INVERTED polarity — the unstaged lingering
//      adjacent raider is assigned its stance on turn 1, steps onto
//      the scholar's cell on turn 2, and starts the fight on turn 3
//      (foughtAt 3 on seed 100207), while the same check on the
//      baseline tree shows no fight within 6 turns and the stance
//      never assigned. ADJUDICATION (recorded, not waived): the
//      pre-registered single-turn unit-lingering inversion does NOT
//      hold — the freshly spawned lingerer draws 'territorial'
//      (warns twice, fights on the third turn), so the guard's absence
//      is invisible in ONE turn with an unstaged stance. The proof
//      records the single-turn case passing on the subject as the
//      documented fixture limitation and proves the effect with the
//      multi-turn check on the identical fixture instead. The verdict
//      mapping is untouched by this adjudication.
//   9. Step corpora — stage-aware with GUARDED reads (no ENOENT
//      crash). STAGE-1 branch: no summaries exist. Intermediate
//      branch: baseline summary exists, subject summary missing
//      (reported, not crashed). Final branch: both exist, the drift
//      check against the 1615Z per-seed table is judged (performed +
//      recorded in the evidence, whichever way it reads), the verdict
//      is judged by classifyVerdict, corpora hold 8 files each,
//      per-seed rows carry the right anchors + fix + policy,
//      instrument errors are 0, and the evidence file records the
//      verdict, the drift check, the telemetry refusal, and a metric
//      review.
//
// Usage: node scripts/test-guardablate-a.js
// Exit 0 = pass, 1 = fail. No repo writes (the /tmp subject extract
// is created under /tmp and removed before the proof exits).
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('guardablate-a');

const REPO = path.join(__dirname, '..');
const ARM_BRANCH = 'sim-guardablate-a';
const BASE = '53e7b6a1e';
const BASE_FULL = '53e7b6a1eaf4004eab5e58f5c57cc88647142547';
const BASE_1615 = 'b4343ac9d';
const BASE_1615_FULL = 'b4343ac9da902370ffc44f58423e6e83c9dbfe23';
const BASE_1215 = '1ca2c257d';
const GUARD_COMMIT = 'dc8cbd3f3';
const GUARD_COMMIT_FULL = 'dc8cbd3f3eded5f4196ba28e9f392089ba46f47a';
const SUBJECT_BRANCH = 'transplant-guardablate-subject';
const BASELINE_STEP = 'ep-tip-guardablate';
const SUBJECT_STEP = 'tguardablate';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const FIX_SHORT = 'f8fda4295a99';
const NATIVE_STANDING_SHA = 'f935997640a0c1df1a1eb52d91172c7bc49cc2b9ab58fe9d77f58a17839388e9';
const POLICY_SHA = '74a890f0844ebc19fce2ac24da360f114b1f366fdb33a185a122f891dc2f0456';
const POLICY_SHORT = '74a890f0844e';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const PREREG = path.join(REPO, 'evidence', '2026-11-15', 'sim-guardablate-a-prereg.md');
const EVIDENCE = path.join(REPO, 'evidence', '2026-11-15', 'sim-guardablate-a.md');
const CASCADE_TEST = 'scripts/test-cascade-b.js';
const GUARD_START_LINE = 24147;
const GUARD_END_LINE = 24162;
// The guard hunk: exactly the 16 added lines of dc8cbd3f3
// (game.js:24147-24162 at base 53e7b6a1e), listed verbatim in source
// order. The proof matches them against the live base source AND
// against the lever commit's added lines, so any transcription error
// here fails loudly at stage 1 instead of silently passing.
const GUARD_LINES = [
  '      // CASCADE (sim-cascade-b, Stage 1 proven): a lingering raider holds',
  '      // the treeline — it is a siege, answered by sortie or endurance',
  '      // (design call #8, Steve 2026-10-16), not a duel. The sortie code',
  '      // itself says a lone villager against a treeline monster is a',
  '      // funeral, not a sortie. But monsterTurn has no safe-tile check,',
  '      // so the besieger steps onto the scholar — inside the hall, on',
  '      // the Haven tile — and starts a turn-based fight it always wins',
  '      // solo; on \'lost\' tbEnd restores it wounded and it kills the next',
  '      // bearer <redacted> same way (10 repeat instances, 38/88 scholar deaths',
  '      // in the control pilot). It does not move onto the scholar or',
  '      // start combat on contact. The scholar may still walk up and press',
  '      // Fight (startCombat untouched), the sortie still fights it',
  '      // (fieldFight, not monsterTurn), the nightly gorge and the ~6-night',
  '      // drift valve are untouched, and non-lingering intruders still',
  '      // breach exactly as before. Nothing despawns.',
  '      if (m.lingering) return;',
];
// The 1615Z baseline per-seed table (the drift-check reference):
// all 8 survived to day 150. The drift check compares the re-run
// baseline's per-seed days / maxWave / standing against this table.
const DRIFT_1615Z = [
  { seed: 190391, days: 150, maxWave: 5, standing: 380 },
  { seed: 190392, days: 150, maxWave: 4, standing: 199 },
  { seed: 190393, days: 150, maxWave: 4, standing: 199 },
  { seed: 190394, days: 150, maxWave: 5, standing: 490 },
  { seed: 190395, days: 150, maxWave: 4, standing: 199 },
  { seed: 190396, days: 150, maxWave: 5, standing: 290 },
  { seed: 190397, days: 150, maxWave: 4, standing: 199 },
  { seed: 190398, days: 150, maxWave: 5, standing: 295 },
];
const ARM_FILES = [
  'evidence/2026-11-15/sim-guardablate-a-prereg.md',
  'evidence/2026-11-15/sim-guardablate-a.md',
  'scripts/test-guardablate-a.js',
  'scripts/test-guardablate-lingerer-turns.js',
  'scripts/build-guardablate-panels-20261115.js',
  'scripts/transplant7redef-analyze.js',
  'scripts/transplant7redef-step.sh',
];

function sha256(text) { return crypto.createHash('sha256').update(text).digest('hex'); }
function git(args) {
  return execSync('git ' + args, { cwd: REPO, stdio: 'pipe', maxBuffer: 64 * 1024 * 1024 }).toString().trim();
}
function gitOk(args) {
  try { execSync('git ' + args, { cwd: REPO, stdio: 'pipe', maxBuffer: 64 * 1024 * 1024 }); return true; }
  catch (e) { return false; }
}
function gitShow(commit, file) {
  return execSync('git show ' + commit + ':' + file, { cwd: REPO, stdio: 'pipe', maxBuffer: 64 * 1024 * 1024 }).toString();
}
function isAncestor(a, b) {
  try { execSync('git merge-base --is-ancestor ' + a + ' ' + b, { cwd: REPO, stdio: 'pipe' }); return true; }
  catch (e) { return false; }
}
// classifyVerdict(subjectN, baselineN): the FROZEN verdict mapping
// (prereg §Verdict mapping). Absolute form at baseline 8/8, relative
// form below — the branch is decided by the re-run baseline read
// itself, before the subject leg is judged.
function classifyVerdict(subjectN, baselineN) {
  if (typeof subjectN !== 'number' || !Number.isFinite(subjectN) || subjectN < 0 || subjectN > 8) return 'UNCLASSIFIABLE';
  if (typeof baselineN !== 'number' || !Number.isFinite(baselineN) || baselineN < 0 || baselineN > 8) return 'UNCLASSIFIABLE';
  if (baselineN === 8) {
    if (subjectN <= 3) return 'CONFIRMED';
    if (subjectN >= 6) return 'REFUTED';
    return 'AMBIGUOUS';
  }
  if (subjectN <= baselineN - 5) return 'CONFIRMED';
  if (subjectN >= baselineN - 2) return 'REFUTED';
  return 'AMBIGUOUS';
}
// driftAgainst1615Z(perSeed): count the re-run baseline seeds whose
// days / maxWave / standing differ from the 1615Z table. 0 = no drift.
function driftAgainst1615Z(perSeed) {
  if (!Array.isArray(perSeed)) return -1;
  const bySeed = {};
  for (const r of perSeed) bySeed[r.seed] = r;
  let drift = 0;
  for (const ref of DRIFT_1615Z) {
    const r = bySeed[ref.seed];
    if (!r) return -1;
    if (r.days !== ref.days || r.maxWave !== ref.maxWave || r.standing !== ref.standing) drift++;
  }
  return drift;
}
// allHunkLines(diffText): ALL added/removed content lines (+/-,
// excluding +++ / --- headers) across every hunk, sorted.
function allHunkLines(diffText) {
  const added = [], removed = [];
  for (const ln of diffText.split('\n')) {
    if (ln.indexOf('+') === 0 && ln.indexOf('+++') !== 0) added.push(ln.slice(1));
    else if (ln.indexOf('-') === 0 && ln.indexOf('---') !== 0) removed.push(ln.slice(1));
  }
  added.sort(); removed.sort();
  return { added: added, removed: removed };
}
// runNode(args, cwd): run a node script, capturing exit code + stdout
// WITHOUT throwing on nonzero exit (the subject's expected
// unit-lingering failure is exit 1).
function runNode(args, cwd) {
  try {
    const out = execSync('node ' + args, { cwd: cwd || REPO, stdio: 'pipe', maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
    return { code: 0, out: out, err: '' };
  } catch (e) {
    return { code: (e.status != null ? e.status : 1), out: (e.stdout || '').toString('utf8'), err: (e.stderr || '').toString('utf8') };
  }
}
function parseLastJson(out) {
  const lines = out.split('\n').filter(function (ln) { return ln.trim() !== ''; });
  if (lines.length === 0) return null;
  try { return JSON.parse(lines[lines.length - 1]); }
  catch (e) { return null; }
}
// readSummaryIfExists(path): a missing summary is a null, never an
// uncaught ENOENT. The caller branches on the stage.
function readSummaryIfExists(p) {
  try {
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) { return null; }
}
function summaryPath(step) {
  return path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + step + '-summary.json');
}
function corpusDir(step) {
  return path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + step);
}

(async () => {
  const prereg = fs.existsSync(PREREG) ? fs.readFileSync(PREREG, 'utf8') : '';
  const preregFlat = prereg.replace(/\s+/g, ' ');

  // ---- 1. Guard identity ----
  T.section('1. Guard identity — dc8cbd3f3 +16 lines, verbatim at base');
  T.ok('guard commit dc8cbd3f3 full sha is dc8cbd3f3eded5f4196ba28e9f392089ba46f47a',
    git('rev-parse ' + GUARD_COMMIT) === GUARD_COMMIT_FULL, git('rev-parse --short ' + GUARD_COMMIT));
  const leverDiffStat = git('diff --numstat ' + GUARD_COMMIT + '^ ' + GUARD_COMMIT + ' -- src/');
  T.ok('lever commit src/ change is exactly one file: src/js/game.js +16/-0 (the commit also adds scripts/ tooling, which is not game code)',
    leverDiffStat === '16\t0\tsrc/js/game.js', leverDiffStat.replace(/\n/g, ' | '));
  const leverDiff = execSync('git diff ' + GUARD_COMMIT + '^ ' + GUARD_COMMIT + ' -- src/js/game.js', { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  T.ok('lever commit game.js diff is exactly 1 hunk',
    (leverDiff.match(/^@@/gm) || []).length === 1, 'hunks=1');
  const leverLines = allHunkLines(leverDiff);
  T.ok('lever commit added lines are byte-identical to the prereg guard hunk (16/16, sorted)',
    JSON.stringify(leverLines.added) === JSON.stringify(GUARD_LINES.slice().sort()), leverLines.added.length + ' added');
  T.ok('lever commit removed ZERO lines',
    leverLines.removed.length === 0, 'removed=' + leverLines.removed.length);
  // CORRECTION (stage-1 run): the 38/88 citation lives in the guard's
  // CODE COMMENT (the commit's diff), not in the commit message — the
  // message is a bare subject line. The 1615Z evidence's "its commit
  // cites" phrasing is loose; the citation is in the code the commit
  // added, checked here against the live comment text.
  T.ok('guard code comment cites 38/88 scholar deaths (10 repeat instances, control pilot)',
    GUARD_LINES.join('\n').indexOf('38/88 scholar deaths') !== -1 && GUARD_LINES.join('\n').indexOf('10 repeat instances') !== -1, '38/88 in comment');
  const baseGame = gitShow(BASE, 'src/js/game.js');
  const baseGameLines = baseGame.split('\n');
  T.ok('guard block at base is game.js:24147-24162, exactly the prereg text',
    JSON.stringify(baseGameLines.slice(GUARD_START_LINE - 1, GUARD_END_LINE)) === JSON.stringify(GUARD_LINES),
    baseGameLines.slice(GUARD_START_LINE - 1, GUARD_START_LINE + 1).join(' | '));
  T.ok('guard block is 16 lines (24147-24162)',
    (GUARD_END_LINE - GUARD_START_LINE + 1) === 16, '16 lines');
  const mtIdx = baseGame.indexOf('monsterTurn() {');
  T.ok('monsterTurn exists in game.js at base',
    mtIdx >= 0, 'monsterTurn found');
  const mtEnd = baseGame.indexOf('\n    },', mtIdx);
  const mtBody = baseGame.slice(mtIdx, mtEnd < 0 ? mtIdx + 8000 : mtEnd);
  T.ok('guard sits INSIDE monsterTurn (if (m.lingering) return; in the body)',
    mtBody.indexOf('if (m.lingering) return;') !== -1, 'guard in monsterTurn');
  T.ok('guard comment cites sim-cascade-b + design call #8 inside monsterTurn',
    mtBody.indexOf('CASCADE (sim-cascade-b') !== -1 && mtBody.indexOf('design call #8') !== -1, 'comment present');
  T.ok('prereg records the guard identity VERIFIED VERBATIM (STOP-if-mismatch rule)',
    preregFlat.indexOf('VERIFIED VERBATIM at base before any sim') !== -1 && preregFlat.indexOf('STOPPED here and reported') !== -1, 'verbatim rule recorded');

  // ---- 2. Substrate ----
  T.section('2. Substrate — guard-only between 1215Z/1615Z bases; convo-mood + version stamp to tip');
  const diff1215_1615 = git('diff --numstat ' + BASE_1215 + ' ' + BASE_1615 + ' -- src/js/');
  T.ok('only src/js change 1ca2c257d..b4343ac9d is the guard (game.js +16/-0)',
    diff1215_1615 === '16\t0\tsrc/js/game.js', diff1215_1615.replace(/\n/g, ' | '));
  const diff1615_tip = git('diff --numstat ' + BASE_1615 + ' ' + BASE + ' -- src/js/');
  T.ok('src/js change b4343ac9d..53e7b6a1e is build.js 1/1 + convo-mood.js 16/0 only',
    diff1615_tip === '1\t1\tsrc/js/build.js\n16\t0\tsrc/js/convo-mood.js', diff1615_tip.replace(/\n/g, ' | '));
  const convoDiff = execSync('git diff ' + BASE_1615 + ' ' + BASE + ' -- src/js/convo-mood.js', { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  T.ok('convo-mood diff is the r214 plain parting (dialogue-only, no survival path)',
    convoDiff.indexOf('PLAIN PARTING') !== -1 && convoDiff.indexOf('journey-establishment r214') !== -1, 'plain parting');
  T.ok('convo-mood diff touches no survival/combat code',
    !/monsterTurn|tbEnd|startCombat|fieldFight|hurtVillager|addHealth/i.test(convoDiff), 'dialogue only');
  const buildDiff = execSync('git diff ' + BASE_1615 + ' ' + BASE + ' -- src/js/build.js', { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  T.ok('build.js diff is the version stamp only',
    buildDiff.indexOf('BUILD_VERSION') !== -1 && (buildDiff.match(/^@@/gm) || []).length === 1, 'version stamp only');
  T.ok('native standing sha is f9359976... at the 1215Z base',
    sha256(gitShow(BASE_1215, 'src/js/standing.js')) === NATIVE_STANDING_SHA, 'native sha @1215Z');
  T.ok('native standing sha is f9359976... at the 1615Z base',
    sha256(gitShow(BASE_1615, 'src/js/standing.js')) === NATIVE_STANDING_SHA, 'native sha @1615Z');
  T.ok('native standing sha is f9359976... at this tip',
    sha256(gitShow(BASE, 'src/js/standing.js')) === NATIVE_STANDING_SHA, 'native sha @tip');
  T.ok('policy sha is 74a890f0... at the 1215Z base',
    sha256(gitShow(BASE_1215, 'scripts/policies/competent.js')) === POLICY_SHA, 'policy @1215Z');
  T.ok('policy sha is 74a890f0... at the 1615Z base',
    sha256(gitShow(BASE_1615, 'scripts/policies/competent.js')) === POLICY_SHA, 'policy @1615Z');
  T.ok('policy sha is 74a890f0... at this tip',
    sha256(gitShow(BASE, 'scripts/policies/competent.js')) === POLICY_SHA, 'policy @tip');
  T.ok('fix standing sha is f8fda429... (from 5157782a4)',
    sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, 'fix sha verified');
  T.ok('prereg records the substrate verification (both diffs + shas)',
    preregFlat.indexOf('Substrate verification by THIS arm at run start') !== -1 &&
    preregFlat.indexOf('dialogue-only') !== -1, 'substrate recorded');

  // ---- 3. Ablation definition ----
  T.section('3. Ablation definition — remove exactly the 16 guard lines, -16/+0, one file');
  T.ok('ablation is exactly the 16 guard lines, 0 added (listed verbatim in the prereg)',
    preregFlat.indexOf('REMOVE EXACTLY the 16 guard lines above') !== -1 && preregFlat.indexOf('−16/+0') !== -1, '-16/+0 one file');
  T.ok('prereg names the rejected stub form with a reason',
    preregFlat.indexOf('stub (e.g. forcing') !== -1 && preregFlat.indexOf('measure a different change') !== -1, 'stub rejected');
  T.ok('ablation restores the pre-guard behavior (monsterTurn no longer returns early for lingerers)',
    preregFlat.indexOf('no longer returns early for a lingering player-tile monster') !== -1, 'restored behavior stated');
  T.ok('ablation touches nothing else (sortie, gorge, drift valve, startCombat, non-lingering breach untouched on BOTH legs)',
    preregFlat.indexOf('untouched on BOTH legs') !== -1, 'nothing else touched');

  // ---- 4. Mechanism analysis ----
  T.section('4. Mechanism analysis — guard, movement/combat code, preserved paths');
  T.ok('guarded return present at base',
    baseGame.indexOf('if (m.lingering) return;') !== -1, 'guard present');
  T.ok('movement/combat code immediately after the guard is intact (const px = s.mx ?? 4)',
    baseGame.indexOf('const px = s.mx ?? 4, py = s.my ?? 4;') !== -1, 'code after guard intact');
  T.ok('glasswing trap trigger follows the guard (the next block is untouched)',
    baseGame.indexOf('GLASSWING TRAP TRIGGER') !== -1, 'glasswing block present');
  T.ok('startCombat is defined (the Fight-button path is preserved)',
    baseGame.indexOf('startCombat') !== -1, 'startCombat present');
  T.ok('fieldFight is referenced (the sortie path is preserved)',
    baseGame.indexOf('fieldFight') !== -1, 'fieldFight present');
  T.ok('lingering-raider machinery is present (lingeringRaiders / answerLingerer / lingerKeyFor in havenGrowth.js + comms.js)',
    (function () {
      const hg = fs.readFileSync(path.join(REPO, 'src', 'js', 'havenGrowth.js'), 'utf8');
      const cm = fs.readFileSync(path.join(REPO, 'src', 'js', 'comms.js'), 'utf8');
      return (hg.indexOf('lingeringRaiders') !== -1 || cm.indexOf('lingeringRaiders') !== -1) &&
        (hg.indexOf('answerLingerer') !== -1 || cm.indexOf('answerLingerer') !== -1);
    })(), 'linger machinery present');
  T.ok('prereg mechanism states the guard removes a scholar-death path (38/88 in the control pilot)',
    preregFlat.indexOf('38/88') !== -1, '38/88 in prereg');

  // ---- 5. Verdict mapping ----
  T.section('5. Verdict mapping — absolute + relative forms, frozen');
  const absCases = [[0, 8, 'CONFIRMED'], [3, 8, 'CONFIRMED'], [4, 8, 'AMBIGUOUS'], [5, 8, 'AMBIGUOUS'], [6, 8, 'REFUTED'], [8, 8, 'REFUTED']];
  T.ok('classifyVerdict absolute form: baseline 8/8, subject <=3 CONFIRMED / 4-5 AMBIGUOUS / >=6 REFUTED',
    absCases.every(function (c) { return classifyVerdict(c[0], c[1]) === c[2]; }),
    absCases.map(function (c) { return c[0] + '/8=' + classifyVerdict(c[0], c[1]); }).join(', '));
  const relCases = [[2, 7, 'CONFIRMED'], [3, 7, 'AMBIGUOUS'], [5, 7, 'REFUTED'], [0, 5, 'CONFIRMED'], [1, 5, 'AMBIGUOUS'], [3, 5, 'REFUTED'], [4, 6, 'REFUTED'], [0, 4, 'AMBIGUOUS'], [2, 4, 'REFUTED']];
  // NOTE on the relative form's reach: CONFIRMED needs a 5-survivor gap
  // (subject <= baseline-5), so it is unreachable when the baseline
  // reads below 5/8 — e.g. baseline 4, subject 0 is AMBIGUOUS (gap 4),
  // not CONFIRMED. That is the frozen mapping's arithmetic, not a bug;
  // the evidence file's metric review flags it.
  T.ok('classifyVerdict relative form: baseline <8/8, subject <= baseline-5 CONFIRMED / >= baseline-2 REFUTED / else AMBIGUOUS',
    relCases.every(function (c) { return classifyVerdict(c[0], c[1]) === c[2]; }),
    relCases.map(function (c) { return c[0] + 'vs' + c[1] + '=' + classifyVerdict(c[0], c[1]); }).join(', '));
  T.ok('classifyVerdict rejects non-counts as UNCLASSIFIABLE',
    classifyVerdict(9, 8) === 'UNCLASSIFIABLE' && classifyVerdict(4, -1) === 'UNCLASSIFIABLE' && classifyVerdict('4', 8) === 'UNCLASSIFIABLE', 'rejects 9/-1/string');
  T.ok('prereg states BOTH forms frozen with the branch rule (8/8 -> absolute, <8/8 -> relative)',
    preregFlat.indexOf('ABSOLUTE form (applies when the re-run baseline reads 8/8') !== -1 &&
    preregFlat.indexOf('RELATIVE form (applies when the re-run baseline reads <8/8') !== -1 &&
    preregFlat.indexOf('no re-scoring against a friendlier metric mid-run') !== -1, 'both forms frozen');
  T.ok('prereg states what CONFIRMED does and does not do (closes family 7 BY ATTRIBUTION; align step stays UNMEASURED)',
    preregFlat.indexOf('UNMEASURABLE-by-attribution') !== -1 && preregFlat.indexOf('stays UNMEASURED') !== -1, 'closure scope stated');
  T.ok('prereg states there is NO baseline gate on this arm (any baseline read proceeds)',
    preregFlat.indexOf('There is NO baseline gate on this arm') !== -1, 'no gate recorded');

  // ---- 6. Base state ----
  T.section('6. Base state — arm branch at base, only arm files uncommitted');
  T.ok('HEAD is on the arm branch sim-guardablate-a',
    git('branch --show-current') === ARM_BRANCH, git('branch --show-current'));
  T.ok('arm branch is based on master 53e7b6a1e (base is an ancestor of HEAD)',
    isAncestor(BASE, 'HEAD'), 'base ancestor of HEAD');
  T.ok('master tip is BASE or a descendant of BASE (no rewind; rebase-tolerant)',
    isAncestor(BASE, 'master'), 'tip >= base');
  T.ok('prereg exists on disk and names the run id fleshout-20261115T1715Z',
    prereg.indexOf('fleshout-20261115T1715Z') !== -1, 'run id present');
  T.ok('prereg names the matched band 190391-190398',
    prereg.indexOf('190391') !== -1 && prereg.indexOf('190398') !== -1, 'band present');
  T.ok('no src/js file differs from HEAD',
    git('status --porcelain -- src/js') === '', 'src/js clean');
  T.ok('on-disk standing.js is byte-identical to HEAD',
    sha256(fs.readFileSync(path.join(REPO, 'src', 'js', 'standing.js'), 'utf8')) === sha256(gitShow('HEAD', 'src/js/standing.js')), 'standing == HEAD');
  const rawStatus = execSync('git status --porcelain --untracked-files=no', { cwd: REPO, stdio: 'pipe' }).toString();
  const dirty = rawStatus.split('\n').filter(Boolean).map(function (ln) { return ln.slice(3); });
  T.ok('only the arm files may be uncommitted (prereg, proof, panel builder, evidence)',
    dirty.every(function (f) { return ARM_FILES.indexOf(f) !== -1; }),
    dirty.length === 0 ? 'clean' : dirty.join(', '));
  T.ok('step-script tooling source (master) carries driver + shared analyzer + instrument',
    ['scripts/culpritbisect-driver-20261113.js', 'scripts/masterregress-analyze-20261113.js', 'scripts/vetfirst-instrument-20261111.js']
      .every(function (f) { try { gitShow('master', f); return true; } catch (e) { return false; } }),
    '3/3 scratch files on master');
  T.ok('redefined analyzer exists on the arm branch',
    fs.existsSync(path.join(REPO, 'scripts', 'transplant7redef-analyze.js')), 'analyzer present');
  T.ok('redefined step script exists on the arm branch',
    fs.existsSync(path.join(REPO, 'scripts', 'transplant7redef-step.sh')), 'step script present');
  T.ok('step script carries the finding-#2381 restore fix (checkout from the step commit, never delete tracked scratch)',
    (function () {
      const s = fs.readFileSync(path.join(REPO, 'scripts', 'transplant7redef-step.sh'), 'utf8');
      return s.indexOf('git checkout HEAD -- "$f"') !== -1 && s.indexOf('finding #2381') !== -1 &&
        s.indexOf('rm -f scripts/culpritbisect-driver-20261113.js') === -1;
    })(), 'restore-from-commit present, bulk delete gone');
  T.ok('step script defaults SEEDS to the fresh band (this run passes the matched band in the env)',
    fs.readFileSync(path.join(REPO, 'scripts', 'transplant7redef-step.sh'), 'utf8')
      .indexOf('SEEDS="${SEEDS:-190581,190582,190583,190584,190585,190586,190587,190588}"') !== -1, 'SEEDS default present');
  T.ok('analyzer takes SEEDS from the environment (no hardcoded matched band)',
    fs.readFileSync(path.join(REPO, 'scripts', 'transplant7redef-analyze.js'), 'utf8')
      .indexOf('process.env.SEEDS') !== -1, 'SEEDS from env');
  T.ok('cascade-b proof exists on the arm branch (the guard-effect instrument)',
    fs.existsSync(path.join(REPO, 'scripts', 'test-cascade-b.js')), 'cascade-b proof present');

  // ---- 7. Guard-effect legs (live, baseline tree) ----
  T.section('7. Guard-effect legs — cascade-b unit-lingering passes on the baseline tree');
  const cascadeStatic = runNode(CASCADE_TEST + ' 100207 static');
  const cascadeStaticJson = parseLastJson(cascadeStatic.out);
  T.ok('cascade-b static passes on the baseline (guard hunk +16, one file, no flee/damage code)',
    cascadeStatic.code === 0 && cascadeStaticJson !== null && cascadeStaticJson.pass === true,
    'code=' + cascadeStatic.code + ' ' + (cascadeStaticJson ? JSON.stringify(cascadeStaticJson) : cascadeStatic.out.slice(0, 120)));
  const unitBase = runNode(CASCADE_TEST + ' 100207 unit-lingering');
  const unitBaseJson = parseLastJson(unitBase.out);
  T.ok('cascade-b unit-lingering passes on the baseline (exit 0, pass:true)',
    unitBase.code === 0 && unitBaseJson !== null && unitBaseJson.pass === true,
    'code=' + unitBase.code + ' ' + (unitBaseJson ? JSON.stringify(unitBaseJson) : unitBase.out.slice(0, 120)));
  if (unitBaseJson !== null && unitBaseJson.pass === true) {
    T.ok('baseline (1) lingering adjacent raider does NOT move and starts NO fight',
      unitBaseJson.adjacentLingering && unitBaseJson.adjacentLingering.moved === false && unitBaseJson.adjacentLingering.fought === false,
      JSON.stringify(unitBaseJson.adjacentLingering));
    T.ok('baseline (2) lingering raider ON the scholar cell starts NO fight',
      unitBaseJson.onCellLingering && unitBaseJson.onCellLingering.fought === false,
      JSON.stringify(unitBaseJson.onCellLingering));
    T.ok('baseline (3) NON-lingering hungry adjacent raider DOES engage (positive control: the turn is live)',
      unitBaseJson.adjacentPlain && unitBaseJson.adjacentPlain.fought === true,
      JSON.stringify(unitBaseJson.adjacentPlain));
    T.ok('baseline (4) direct startCombat on a lingering raider still starts the fight (Fight-button path preserved)',
      unitBaseJson.directStartCombat && unitBaseJson.directStartCombat.fought === true,
      JSON.stringify(unitBaseJson.directStartCombat));
  }
  // Multi-turn contrast on the baseline tree: the same unstaged lingering
  // adjacent raider, 6 monsterTurns — the guard returns before the stance
  // machine runs, so no fight ever starts (and the stance stays null).
  const turnsBase = runNode('scripts/test-guardablate-lingerer-turns.js --turns 6 --expect nofight');
  const turnsBaseJson = parseLastJson(turnsBase.out);
  T.ok('baseline multi-turn: no fight within 6 turns (exit 0, pass:true)',
    turnsBase.code === 0 && turnsBaseJson !== null && turnsBaseJson.pass === true,
    'code=' + turnsBase.code + ' ' + (turnsBaseJson ? JSON.stringify(turnsBaseJson) : turnsBase.out.slice(0, 120)));
  if (turnsBaseJson !== null && turnsBaseJson.pass === true) {
    T.ok('baseline multi-turn: foughtAt is 0 (never engaged)',
      turnsBaseJson.foughtAt === 0, 'foughtAt=' + turnsBaseJson.foughtAt);
    T.ok('baseline multi-turn: stance stays null (the guard returns before the stance machine runs)',
      turnsBaseJson.stance === null, 'stance=' + turnsBaseJson.stance);
  }

  // ---- 8. Live subject state ----
  T.section('8. Live subject state — subject branch + inverted polarity on the subject');
  const subjectExists = gitOk('show-ref --verify refs/heads/' + SUBJECT_BRANCH);
  if (!subjectExists) {
    T.ok('subject branch transplant-guardablate-subject does NOT exist yet (stage 1)',
      true, 'no subject branch');
    T.ok('no subject commit exists (branch absent, so nothing to verify)',
      !gitOk('rev-parse ' + SUBJECT_BRANCH), 'no subject commit');
    T.ok('prereg orders the subject cut ONLY after the baseline leg has run',
      preregFlat.indexOf('ONLY after the baseline leg has run') !== -1, 'baseline-first order recorded');
  } else {
    const subjFull = git('rev-parse ' + SUBJECT_BRANCH);
    T.ok('subject branch exists at ' + subjFull.slice(0, 12),
      subjFull.length === 40, subjFull.slice(0, 12));
    T.ok('subject branch carries exactly one commit on the arm branch',
      parseInt(git('rev-list --count ' + ARM_BRANCH + '..' + SUBJECT_BRANCH), 10) === 1, 'count=1');
    const subjNum = git('diff --numstat ' + SUBJECT_BRANCH + '^ ' + SUBJECT_BRANCH);
    T.ok('subject diff numstat is exactly -16/+0, one file (src/js/game.js) — numstat columns are added-then-deleted, so -16/+0 reads 0<TAB>16',
      subjNum === '0\t16\tsrc/js/game.js', subjNum.replace(/\n/g, ' | '));
    const subjDiff = execSync('git diff ' + SUBJECT_BRANCH + '^ ' + SUBJECT_BRANCH, { cwd: REPO, stdio: 'pipe' }).toString('utf8');
    const subjLines = allHunkLines(subjDiff);
    T.ok('subject diff removed lines are byte-identical to the guard hunk (16/16)',
      JSON.stringify(subjLines.removed) === JSON.stringify(GUARD_LINES.slice().sort()), subjLines.removed.length + ' removed');
    T.ok('subject diff adds ZERO lines',
      subjLines.added.length === 0, 'added=' + subjLines.added.length);
    T.ok('subject diff touches no other file',
      git('diff --name-only ' + SUBJECT_BRANCH + '^ ' + SUBJECT_BRANCH) === 'src/js/game.js', 'one file');
    T.ok('subject diff is exactly 1 hunk',
      (subjDiff.match(/^@@/gm) || []).length === 1, 'hunks=1');
    const subjGame = gitShow(SUBJECT_BRANCH, 'src/js/game.js');
    T.ok('subject game.js has NO lingering guard (if (m.lingering) return; gone)',
      subjGame.indexOf('if (m.lingering) return;') === -1, 'guard gone');
    T.ok('subject game.js == base game.js minus exactly the 16 guard lines (line-level)',
      (function () {
        const baseLines = baseGame.split('\n');
        const expect = baseLines.slice(0, GUARD_START_LINE - 1).concat(baseLines.slice(GUARD_END_LINE)).join('\n');
        return subjGame === expect;
      })(), 'line-level identity');
    T.ok('subject game.js still carries the code after the guard (const px = s.mx ?? 4)',
      subjGame.indexOf('const px = s.mx ?? 4, py = s.my ?? 4;') !== -1, 'code after guard intact');
    T.ok('subject policy sha equals the base policy sha (74a890f0...)',
      sha256(gitShow(SUBJECT_BRANCH, 'scripts/policies/competent.js')) === POLICY_SHA, 'policy == base');
    T.ok('subject native standing sha equals the base native standing sha (f9359976...)',
      sha256(gitShow(SUBJECT_BRANCH, 'src/js/standing.js')) === NATIVE_STANDING_SHA, 'standing == base');
    T.ok('subject convo-mood.js is byte-identical to the base (untouched)',
      sha256(gitShow(SUBJECT_BRANCH, 'src/js/convo-mood.js')) === sha256(gitShow(BASE, 'src/js/convo-mood.js')), 'convo-mood untouched');
    // Live inverted-polarity check on a /tmp pathspec extract of the subject.
    const extDir = '/tmp/guardablate-subj-' + subjFull.slice(0, 12);
    try {
      execSync('rm -rf ' + extDir + ' && mkdir -p ' + extDir, { cwd: REPO, stdio: 'pipe' });
      execSync('git archive ' + SUBJECT_BRANCH + ' src scripts index.html manifest.json sw.js build-source.json | tar -x -C ' + extDir, { cwd: REPO, stdio: 'pipe' });
      // ADJUDICATION (see the header §8 note): the pre-registered
      // single-turn unit-lingering inversion does NOT hold — the
      // unstaged lingerer draws 'territorial' and fights on turn 3,
      // so one monsterTurn cannot see the guard's absence. The
      // single-turn case therefore PASSES on the subject, and that
      // pass is the documented fixture limitation, not a guard
      // survival: the multi-turn check below proves the effect.
      const unitSubj = runNode(CASCADE_TEST + ' 100207 unit-lingering', extDir);
      const unitSubjJson = parseLastJson(unitSubj.out);
      T.ok('ADJUDICATED single-turn: unit-lingering on the subject extract PASSES (exit 0 — the guard absence is invisible in ONE turn: the unstaged lingerer draws territorial, fights on turn 3)',
        unitSubj.code === 0 && unitSubjJson !== null && unitSubjJson.pass === true,
        'code=' + unitSubj.code + ' ' + (unitSubjJson ? JSON.stringify(unitSubjJson.adjacentLingering) : unitSubj.out.slice(0, 120)));
      // The multi-turn check proves the inverted polarity on the
      // identical fixture: copy the check script into the extract
      // (it is not on the subject branch — the subject commit is
      // exactly the ablation) and run it expecting a fight.
      fs.copyFileSync(path.join(REPO, 'scripts', 'test-guardablate-lingerer-turns.js'), path.join(extDir, 'scripts', 'test-guardablate-lingerer-turns.js'));
      const turnsSubj = runNode('scripts/test-guardablate-lingerer-turns.js --turns 6 --expect fight', extDir);
      const turnsSubjJson = parseLastJson(turnsSubj.out);
      T.ok('subject multi-turn: a fight DOES start within 6 turns (exit 0, pass:true — the pre-registered inverted polarity, over turns)',
        turnsSubj.code === 0 && turnsSubjJson !== null && turnsSubjJson.pass === true,
        'code=' + turnsSubj.code + ' ' + (turnsSubjJson ? JSON.stringify(turnsSubjJson) : turnsSubj.out.slice(0, 120)));
      if (turnsSubjJson !== null && turnsSubjJson.pass === true) {
        T.ok('subject multi-turn: foughtAt is 3 (territorial warns twice, fights on the third turn — cascade-b\'s own comment)',
          turnsSubjJson.foughtAt === 3, 'foughtAt=' + turnsSubjJson.foughtAt);
        T.ok('subject multi-turn: stance is territorial (the stance machine runs once the guard is gone)',
          turnsSubjJson.stance === 'territorial', 'stance=' + turnsSubjJson.stance);
        T.ok('subject multi-turn: the raider ends ON the scholar\'s cell [4,4] (it stepped onto the scholar)',
          JSON.stringify(turnsSubjJson.cell) === JSON.stringify([4, 4]), 'cell=' + JSON.stringify(turnsSubjJson.cell));
      }
    } finally {
      try { execSync('rm -rf ' + extDir, { cwd: REPO, stdio: 'pipe' }); } catch (e) {}
    }
    const evidenceText = fs.existsSync(EVIDENCE) ? fs.readFileSync(EVIDENCE, 'utf8') : '';
    T.ok('evidence file exists and records the subject commit ' + subjFull.slice(0, 12),
      evidenceText !== '' && evidenceText.indexOf(subjFull.slice(0, 12)) !== -1, EVIDENCE);
  }

  // ---- 9. Step corpora ----
  T.section('9. Step corpora — stage-aware, guarded reads (no ENOENT crash)');
  const baseSummary = readSummaryIfExists(summaryPath(BASELINE_STEP));
  const subjSummary = readSummaryIfExists(summaryPath(SUBJECT_STEP));
  const stage = !baseSummary && !subjSummary ? 'none' : (baseSummary && !subjSummary ? 'baseline-only' : (baseSummary && subjSummary ? 'both' : 'subject-only'));
  T.ok('corpus stage is one of none / baseline-only / both (never subject-only)',
    stage !== 'subject-only', 'stage=' + stage);
  if (stage === 'none') {
    T.ok('no baseline summary exists yet (stage 1)',
      baseSummary === null, 'no baseline summary');
    T.ok('no subject summary exists yet (stage 1)',
      subjSummary === null, 'no subject summary');
    T.ok('no baseline corpus dir exists yet (stage 1)',
      !fs.existsSync(corpusDir(BASELINE_STEP)), 'no baseline corpus');
    T.ok('no subject corpus dir exists yet (stage 1)',
      !fs.existsSync(corpusDir(SUBJECT_STEP)), 'no subject corpus');
  }
  if (baseSummary !== null) {
    T.ok('baseline summary reads the matched band seeds',
      JSON.stringify(baseSummary.seeds) === JSON.stringify(SEEDS), 'seeds=' + baseSummary.seeds.join(','));
    T.ok('baseline per-seed anchorCommit is the base ' + BASE,
      baseSummary.perSeed.every(function (r) { return r.anchorCommit === BASE_FULL.slice(0, 12); }), '8/8 rows base');
    T.ok('baseline rows carry the fix standing + base policy',
      baseSummary.perSeed.every(function (r) { return r.standingFix === true && r.standingSha === FIX_SHORT && r.policySha === POLICY_SHORT; }), 'fix + policy');
    T.ok('baseline instrument errors are 0',
      baseSummary.instrumentErrors === 0, 'errors=' + baseSummary.instrumentErrors);
    const drift = driftAgainst1615Z(baseSummary.perSeed);
    T.ok('baseline drift check computable (0 = identical to the 1615Z per-seed table, >0 = drifted seeds)',
      drift >= 0, 'drift=' + drift + ' seeds');
    T.ok('baseline survived count is a number 0-8',
      typeof baseSummary.survived === 'number' && baseSummary.survived >= 0 && baseSummary.survived <= 8, 'survived=' + baseSummary.survived + '/8');
  }
  if (stage === 'baseline-only') {
    T.ok('INTERMEDIATE STATE: baseline summary exists, subject summary missing (reported, not crashed)',
      baseSummary !== null && subjSummary === null, 'baseline present, subject missing');
    T.ok('INTERMEDIATE STATE: no subject branch is required yet (the cut waits on the baseline leg completing)',
      true, 'cut follows baseline');
  }
  if (stage === 'both') {
    T.ok('subject summary reads the matched band seeds',
      JSON.stringify(subjSummary.seeds) === JSON.stringify(SEEDS), 'seeds=' + subjSummary.seeds.join(','));
    T.ok('subject per-seed anchorCommit is the subject commit',
      (function () {
        // The driver records a 12-char anchor; `git rev-parse --short`
        // returns 9 chars in this repo — compare the 12-char prefix.
        const subjShort12 = git('rev-parse ' + SUBJECT_BRANCH).slice(0, 12);
        return subjSummary.perSeed.every(function (r) { return r.anchorCommit === subjShort12; });
      })(), '8/8 rows subject');
    T.ok('subject rows carry the fix standing + base policy',
      subjSummary.perSeed.every(function (r) { return r.standingFix === true && r.standingSha === FIX_SHORT && r.policySha === POLICY_SHORT; }), 'fix + policy');
    T.ok('subject instrument errors are 0',
      subjSummary.instrumentErrors === 0, 'errors=' + subjSummary.instrumentErrors);
    const verdict = classifyVerdict(subjSummary.survived, baseSummary.survived);
    T.ok('guard verdict is ' + verdict + ' (subject ' + subjSummary.survived + '/8, baseline ' + baseSummary.survived + '/8)',
      verdict === 'CONFIRMED' || verdict === 'REFUTED' || verdict === 'AMBIGUOUS', 'verdict=' + verdict);
    const drift = driftAgainst1615Z(baseSummary.perSeed);
    T.ok('baseline drift vs 1615Z is computed (drift=' + drift + ' seeds)',
      drift >= 0, 'drift=' + drift);
    const baseCorpus = corpusDir(BASELINE_STEP);
    const subjCorpus = corpusDir(SUBJECT_STEP);
    T.ok('baseline per-seed corpus holds 8 files',
      fs.existsSync(baseCorpus) && fs.readdirSync(baseCorpus).length === 8, '8 files');
    T.ok('subject per-seed corpus holds 8 files',
      fs.existsSync(subjCorpus) && fs.readdirSync(subjCorpus).length === 8, '8 files');
    T.ok('baseline driver log exists',
      fs.existsSync(path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + BASELINE_STEP + '-driver.log')), 'baseline log present');
    T.ok('subject driver log exists',
      fs.existsSync(path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + SUBJECT_STEP + '-driver.log')), 'subject log present');
    const evidenceText = fs.existsSync(EVIDENCE) ? fs.readFileSync(EVIDENCE, 'utf8') : '';
    const evidenceFlat = evidenceText.replace(/\s+/g, ' ');
    T.ok('evidence records the verdict ' + verdict,
      evidenceFlat.indexOf(verdict) !== -1, 'verdict recorded');
    T.ok('evidence records the drift check against the 1615Z table',
      evidenceText.indexOf('Drift check') !== -1 && (evidenceFlat.indexOf('no drift') !== -1 || evidenceFlat.indexOf('drift') !== -1), 'drift recorded');
    T.ok('evidence records the telemetry refusal (recorder-corpus, baseline NOT rolled)',
      evidenceFlat.indexOf('REFUSED') !== -1 && evidenceFlat.indexOf('baseline NOT rolled') !== -1, 'refusal recorded');
    T.ok('evidence carries a metric-review section',
      evidenceText.indexOf('Metric review') !== -1, 'metric review present');
    T.ok('evidence carries a sense-testing section',
      evidenceText.indexOf('Sense-testing') !== -1, 'sense-testing present');
  }

  await T.done();
})().catch(function (e) {
  console.error(e);
  process.exit(1);
});
