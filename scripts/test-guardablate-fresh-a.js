#!/usr/bin/env node
// test-guardablate-fresh-a.js — proof test for the CASCADE lingerer
// guard-removal ablation on a FRESH band (arm sim-guardablate-fresh-a),
// the DECIDING TEST for the family-7 brain-side program decision
// under the REVISED bar (1715Z metric review: CONFIRMED at subject
// <= baseline-3).
//
// THE QUESTION (evidence/2026-11-15/sim-guardablate-fresh-a-prereg.md,
// committed before any judged sim): does the CASCADE lingerer guard
// alone explain the lifted survival floor — on seeds no earlier run
// has used (fresh band 190631–190638), under a bar that can actually
// be met? The 1715Z arm read AMBIGUOUS on the matched band (subject
// 1/8 vs baseline 4/8) because its frozen CONFIRMED bar
// (baseline-5) was unreachable at baseline 4/8. This arm re-runs the
// controlled A/B on identical fresh seeds: tip with the guard vs tip
// with EXACTLY the guard lines removed. Nothing else differs between
// the legs. The ablation is the inverse of the landed commit, line
// for line: remove game.js:24147-24162, -16/+0, one file.
//
// WHAT THIS TEST PROVES:
//   1. Guard identity — the 16 lines at game.js:24147-24162 match
//      dc8cbd3f3's added lines byte-identically; the guard sits inside
//      monsterTurn; the lever commit touches exactly src/js/game.js
//      +16 in one hunk; its code comment cites 38/88 scholar deaths.
//   2. Substrate — the only src/js change 1ca2c257d..b4343ac9d is the
//      guard; 53e7b6a1e..605d72bd4 src is alienPlayers 3/3 + game.js
//      31/7 (quoteWrap/sysSay display-only + the producerparty lever
//      added AND reverted, net zero) + sigW3c 4/4; standing/policy
//      shas identical at both bases; the producerparty lever is
//      absent from the tip.
//   3. Ablation definition — the subject diff is exactly the 16
//      removed lines (-16/+0, one file), listed verbatim and matched
//      against the live source; the rejected stub form is named.
//   4. Mechanism analysis — the guarded `if (m.lingering) return;`
//      is present at the base; the movement/combat code after the
//      guard is intact; startCombat, the fieldFight sortie, the gorge
//      and the drift valve are present and untouched by the guard.
//   5. Verdict mapping — classifyVerdict implements the FROZEN
//      REVISED form: subject <= baseline-3 CONFIRMED, subject >=
//      baseline-1 REFUTED, else AMBIGUOUS; boundary unit-cases; the
//      baseline gate (B < 3 -> STOP, fallback band, else UNMEASURED).
//   6. Base state — HEAD is on the arm branch, the base tip is an
//      ancestor of HEAD (rebase-tolerant), the prereg names the run
//      id + band + fallback, no src/js file differs from HEAD,
//      on-disk standing.js is byte-identical to HEAD, only arm files
//      are uncommitted, step tooling is present (guardablate-fresh
//      driver + analyzer + step script on the arm branch, shared
//      20261113 tooling on master).
//   7. Guard-effect legs (live, baseline tree) — the cascade-b
//      unit-lingering case passes on the baseline: lingering adjacent
//      no move/no fight, lingering on-cell no fight, non-lingering
//      hungry adjacent DOES engage (positive control), direct
//      startCombat on a lingering raider still fights; the static
//      case passes (guard hunk +16, one file); the multi-turn check
//      shows no fight within 6 turns and the stance never assigned.
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
//      never assigned. ADJUDICATION (carried from the 1715Z proof,
//      not waived): the pre-registered single-turn unit-lingering
//      inversion does NOT hold — the freshly spawned lingerer draws
//      'territorial' (warns twice, fights on the third turn), so the
//      guard's absence is invisible in ONE turn with an unstaged
//      stance. The proof records the single-turn case passing on the
//      subject as the documented fixture limitation and proves the
//      effect with the multi-turn check on the identical fixture
//      instead. The verdict mapping is untouched by this adjudication.
//   9. Step corpora — stage-aware with GUARDED reads (no ENOENT
//      crash). STAGE-1 branch: no summaries exist. Intermediate
//      branch: baseline summary exists, subject summary missing
//      (reported, not crashed). Final branch: both exist, the gate is
//      judged (B >= 3 to proceed; a B < 3 baseline requires the
//      fallback leg or an UNMEASURED record), the verdict is judged by
//      the revised mapping (the re-run step governs when present),
//      corpora hold 8 files each, per-seed rows carry the right
//      anchors + fix + policy, instrument errors are 0, and the
//      evidence file records the verdict, the gate outcome, the
//      telemetry refusal, and a metric review.
//  10. Fresh-band record — the chosen band 190631–190638 and the
//      fallback 190661–190668, the search scope, and the results
//      (incl. the false-positive kcal hits and the two rejected
//      fallback candidates with reasons) are recorded in the prereg
//      and re-asserted here.
//
// Usage: node scripts/test-guardablate-fresh-a.js
// Exit 0 = pass, 1 = fail. No repo writes (the /tmp subject extract
// is created under /tmp and removed before the proof exits).
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('guardablate-fresh-a');

const REPO = path.join(__dirname, '..');
const ARM_BRANCH = 'sim-guardablate-fresh-a';
const BASE = '605d72bd4';
const BASE_FULL = '605d72bd439d038143cb999aea46a386b4b7f345';
const BASE_1715 = '53e7b6a1e';
const BASE_1715_FULL = '53e7b6a1eaf4004eab5e58f5c57cc88647142547';
const BASE_1615 = 'b4343ac9d';
const BASE_1615_FULL = 'b4343ac9da902370ffc44f58423e6e83c9dbfe23';
const BASE_1215 = '1ca2c257d';
const GUARD_COMMIT = 'dc8cbd3f3';
const GUARD_COMMIT_FULL = 'dc8cbd3f3eded5f4196ba28e9f392089ba46f47a';
const SUBJECT_BRANCH = 'transplant-guardablate-fresh-subject';
const BASELINE_STEP = 'ep-tip-guardablate-fresh';
const SUBJECT_STEP = 'tguardablate-fresh';
const RERUN_STEP = 'tguardablate-fresh-r';
const FALLBACK_BASELINE_STEP = 'ep-tip-guardablate-fresh-fb';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const FIX_SHORT = 'f8fda4295a99';
const NATIVE_STANDING_SHA = 'f935997640a0c1df1a1eb52d91172c7bc49cc2b9ab58fe9d77f58a17839388e9';
const POLICY_SHA = '74a890f0844ebc19fce2ac24da360f114b1f366fdb33a185a122f891dc2f0456';
const POLICY_SHORT = '74a890f0844e';
const SEEDS = [190631, 190632, 190633, 190634, 190635, 190636, 190637, 190638];
const FALLBACK_SEEDS = [190661, 190662, 190663, 190664, 190665, 190666, 190667, 190668];
const PREREG = path.join(REPO, 'evidence', '2026-11-15', 'sim-guardablate-fresh-a-prereg.md');
const EVIDENCE = path.join(REPO, 'evidence', '2026-11-15', 'sim-guardablate-fresh-a.md');
const CASCADE_TEST = 'scripts/test-cascade-b.js';
const GUARD_START_LINE = 24147;
const GUARD_END_LINE = 24162;
// The guard hunk: exactly the 16 added lines of dc8cbd3f3
// (game.js:24147-24162 at base 605d72bd4), listed verbatim in source
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
// (No drift reference table on this arm: the fresh band has no prior
// read to drift against. The baseline leg IS the control; the gate
// in §Gate judges whether it can carry a verdict.)
const ARM_FILES = [
  'evidence/2026-11-15/sim-guardablate-fresh-a-prereg.md',
  'evidence/2026-11-15/sim-guardablate-fresh-a.md',
  'scripts/test-guardablate-fresh-a.js',
  'scripts/culpritbisect-driver-guardablate-fresh-20261115.js',
  'scripts/culpritbisect-analyze-guardablate-fresh-20261115.js',
  'scripts/culpritbisect-step-guardablate-fresh-20261115.sh',
  'scripts/build-guardablate-fresh-panels-20261115.js',
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
// classifyVerdict(subjectN, baselineN): the FROZEN REVISED verdict
// mapping (prereg §Verdict mapping, from the 1715Z metric review):
// CONFIRMED at subject <= baseline-3, REFUTED at subject >=
// baseline-1, else AMBIGUOUS. The bar is reachable at any baseline
// >= 3 — the gate (classifyGate) keeps baselines below 3 out of the
// verdict entirely.
function classifyVerdict(subjectN, baselineN) {
  if (typeof subjectN !== 'number' || !Number.isFinite(subjectN) || subjectN < 0 || subjectN > 8) return 'UNCLASSIFIABLE';
  if (typeof baselineN !== 'number' || !Number.isFinite(baselineN) || baselineN < 0 || baselineN > 8) return 'UNCLASSIFIABLE';
  if (subjectN <= baselineN - 3) return 'CONFIRMED';
  if (subjectN >= baselineN - 1) return 'REFUTED';
  return 'AMBIGUOUS';
}
// classifyGate(baselineN): the BASELINE GATE (prereg §Gate). A
// baseline below 3/8 cannot judge the revised bar (CONFIRMED needs a
// 3-gap) — the arm must try the fallback band, and stop UNMEASURED
// if the fallback also reads below 3.
function classifyGate(baselineN) {
  if (typeof baselineN !== 'number' || !Number.isFinite(baselineN) || baselineN < 0 || baselineN > 8) return 'UNCLASSIFIABLE';
  return baselineN >= 3 ? 'PROCEED' : 'STOP';
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
  return path.join(REPO, 'evidence', '2026-11-15', 'guardablate-fresh-' + step + '-summary.json');
}
function corpusDir(step) {
  return path.join(REPO, 'evidence', '2026-11-15', 'perseed-guardablate-fresh-' + step);
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
  T.section('2. Substrate — guard-only 1215Z/1615Z; quoteWrap/sysSay + reverted lever to tip');
  const diff1215_1615 = git('diff --numstat ' + BASE_1215 + ' ' + BASE_1615 + ' -- src/js/');
  T.ok('only src/js change 1ca2c257d..b4343ac9d is the guard (game.js +16/-0)',
    diff1215_1615 === '16\t0\tsrc/js/game.js', diff1215_1615.replace(/\n/g, ' | '));
  const diff1715_tip = git('diff --numstat ' + BASE_1715 + ' ' + BASE + ' -- src/');
  T.ok('src change 53e7b6a1e..605d72bd4 is alienPlayers 3/3 + game.js 31/7 + sigW3c 4/4 only',
    diff1715_tip === '3\t3\tsrc/js/alienPlayers.js\n31\t7\tsrc/js/game.js\n4\t4\tsrc/js/sigW3c.js', diff1715_tip.replace(/\n/g, ' | '));
  const tipGameDiff = execSync('git diff ' + BASE_1715 + ' ' + BASE + ' -- src/js/game.js', { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  T.ok('game.js tip diff is the r211 quoteWrap/sysSay display-only change (no combat/survival code)',
    tipGameDiff.indexOf('quoteWrap') !== -1 && tipGameDiff.indexOf('sysSay') !== -1 &&
    !/monsterTurn|tbEnd|startCombat|fieldFight|hurtVillager|addHealth|winPlan/i.test(tipGameDiff), 'display only');
  T.ok('producerparty lever is ABSENT from the tip game.js (added in 50c874822, reverted in 43124ee25)',
    gitOk('show 50c874822') && gitOk('show 43124ee25') &&
    git('grep -c producerparty ' + BASE + ' -- src/js/game.js || true') === '' &&
    !/PRODUCERPARTY/i.test(gitShow(BASE, 'src/js/game.js')), 'no producerparty at tip');
  T.ok('producerparty add (+19) and revert (-19) net to zero between 53e7b6a1e and the tip',
    git('diff --numstat 50c874822 43124ee25 -- src/js/game.js') === '0\t19\tsrc/js/game.js', 'add+revert net zero');
  T.ok('native standing sha is f9359976... at the 1715Z base',
    sha256(gitShow(BASE_1715, 'src/js/standing.js')) === NATIVE_STANDING_SHA, 'native sha @1715Z');
  T.ok('native standing sha is f9359976... at this tip',
    sha256(gitShow(BASE, 'src/js/standing.js')) === NATIVE_STANDING_SHA, 'native sha @tip');
  T.ok('policy sha is 74a890f0... at the 1715Z base',
    sha256(gitShow(BASE_1715, 'scripts/policies/competent.js')) === POLICY_SHA, 'policy @1715Z');
  T.ok('policy sha is 74a890f0... at this tip',
    sha256(gitShow(BASE, 'scripts/policies/competent.js')) === POLICY_SHA, 'policy @tip');
  T.ok('fix standing sha is f8fda429... (from 5157782a4)',
    sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, 'fix sha verified');
  T.ok('prereg records the substrate verification (both diffs + shas + reverted lever)',
    preregFlat.indexOf('Substrate verification by THIS arm at run start') !== -1 &&
    preregFlat.indexOf('REVERTED') !== -1, 'substrate recorded');

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
  T.section('5. Verdict mapping — revised form (S <= B-3 CONFIRMED, S >= B-1 REFUTED) + gate');
  const revCases = [
    [5, 8, 'CONFIRMED'], [6, 8, 'AMBIGUOUS'], [7, 8, 'REFUTED'], [8, 8, 'REFUTED'],
    [1, 4, 'CONFIRMED'], [2, 4, 'AMBIGUOUS'], [3, 4, 'REFUTED'],
    [0, 3, 'CONFIRMED'], [1, 3, 'AMBIGUOUS'], [2, 3, 'REFUTED'],
    [2, 5, 'CONFIRMED'], [3, 5, 'AMBIGUOUS'], [4, 5, 'REFUTED'],
    [4, 7, 'CONFIRMED'], [5, 7, 'AMBIGUOUS'], [6, 7, 'REFUTED'],
    [0, 8, 'CONFIRMED'],
  ];
  T.ok('classifyVerdict revised form: S <= B-3 CONFIRMED / S >= B-1 REFUTED / else AMBIGUOUS',
    revCases.every(function (c) { return classifyVerdict(c[0], c[1]) === c[2]; }),
    revCases.map(function (c) { return c[0] + 'vs' + c[1] + '=' + classifyVerdict(c[0], c[1]); }).join(', '));
  T.ok('classifyVerdict rejects non-counts as UNCLASSIFIABLE',
    classifyVerdict(9, 8) === 'UNCLASSIFIABLE' && classifyVerdict(4, -1) === 'UNCLASSIFIABLE' && classifyVerdict('4', 8) === 'UNCLASSIFIABLE', 'rejects 9/-1/string');
  T.ok('the 1715Z read (S=1, B=4) classifies CONFIRMED under the revised bar (the cross-check, not this run\'s verdict)',
    classifyVerdict(1, 4) === 'CONFIRMED', '1vs4=CONFIRMED');
  T.ok('classifyGate: B >= 3 PROCEED, B < 3 STOP',
    classifyGate(8) === 'PROCEED' && classifyGate(3) === 'PROCEED' && classifyGate(2) === 'STOP' && classifyGate(0) === 'STOP' && classifyGate(-1) === 'UNCLASSIFIABLE', 'gate 8/3/2/0');
  T.ok('prereg states the REVISED mapping frozen (CONFIRMED at S <= B-3, REFUTED at S >= B-1, AMBIGUOUS + one re-run)',
    preregFlat.indexOf('CONFIRMED** — S ≤ B−3') !== -1 &&
    preregFlat.indexOf('REFUTED** — S ≥ B−1') !== -1 &&
    preregFlat.indexOf('AMBIGUOUS** — else') !== -1 &&
    preregFlat.indexOf('tguardablate-fresh-r') !== -1 &&
    preregFlat.indexOf('no re-scoring against a friendlier metric mid-run') !== -1, 'revised mapping frozen');
  T.ok('prereg states the BASELINE GATE (B < 3/8 STOP, fallback band, else UNMEASURED)',
    preregFlat.indexOf('BASELINE GATE:** if the fresh baseline reads **B < 3/8, STOP**') !== -1 &&
    preregFlat.indexOf('STOP **UNMEASURED**') !== -1, 'gate recorded');
  T.ok('prereg states what CONFIRMED does and does not do (closes family 7 BY ATTRIBUTION; align step stays UNMEASURED)',
    preregFlat.indexOf('UNMEASURABLE-by-attribution') !== -1 && preregFlat.indexOf('stays UNMEASURED') !== -1, 'closure scope stated');

  // ---- 6. Base state ----
  T.section('6. Base state — arm branch at base, only arm files uncommitted');
  T.ok('HEAD is on the arm branch sim-guardablate-fresh-a',
    git('branch --show-current') === ARM_BRANCH, git('branch --show-current'));
  T.ok('arm branch is based on master 605d72bd4 (base is an ancestor of HEAD)',
    isAncestor(BASE, 'HEAD'), 'base ancestor of HEAD');
  T.ok('master tip is BASE or a descendant of BASE (no rewind; rebase-tolerant)',
    isAncestor(BASE, 'master'), 'tip >= base');
  T.ok('prereg exists on disk and names the run id fleshout-20261115T2015Z',
    prereg.indexOf('fleshout-20261115T2015Z') !== -1, 'run id present');
  T.ok('prereg names the fresh band 190631-190638',
    prereg.indexOf('190631') !== -1 && prereg.indexOf('190638') !== -1, 'band present');
  T.ok('prereg names the fallback band 190661-190668',
    prereg.indexOf('190661') !== -1 && prereg.indexOf('190668') !== -1, 'fallback present');
  T.ok('no src/js file differs from HEAD',
    git('status --porcelain -- src/js') === '', 'src/js clean');
  T.ok('on-disk standing.js is byte-identical to HEAD',
    sha256(fs.readFileSync(path.join(REPO, 'src', 'js', 'standing.js'), 'utf8')) === sha256(gitShow('HEAD', 'src/js/standing.js')), 'standing == HEAD');
  const rawStatus = execSync('git status --porcelain --untracked-files=no', { cwd: REPO, stdio: 'pipe' }).toString();
  const dirty = rawStatus.split('\n').filter(Boolean).map(function (ln) { return ln.slice(3); });
  T.ok('only the arm files may be uncommitted (prereg, proof, driver/analyzer/step/panel, evidence)',
    dirty.every(function (f) { return ARM_FILES.indexOf(f) !== -1; }),
    dirty.length === 0 ? 'clean' : dirty.join(', '));
  T.ok('step-script tooling source (master) carries driver + shared analyzer + instrument',
    ['scripts/culpritbisect-driver-20261113.js', 'scripts/masterregress-analyze-20261113.js', 'scripts/vetfirst-instrument-20261111.js']
      .every(function (f) { try { gitShow('master', f); return true; } catch (e) { return false; } }),
    '3/3 scratch files on master');
  T.ok('guardablate-fresh driver exists on the arm branch',
    fs.existsSync(path.join(REPO, 'scripts', 'culpritbisect-driver-guardablate-fresh-20261115.js')), 'driver present');
  T.ok('guardablate-fresh analyzer exists on the arm branch',
    fs.existsSync(path.join(REPO, 'scripts', 'culpritbisect-analyze-guardablate-fresh-20261115.js')), 'analyzer present');
  T.ok('guardablate-fresh step script exists on the arm branch',
    fs.existsSync(path.join(REPO, 'scripts', 'culpritbisect-step-guardablate-fresh-20261115.sh')), 'step script present');
  T.ok('guardablate-fresh panel builder exists on the arm branch',
    fs.existsSync(path.join(REPO, 'scripts', 'build-guardablate-fresh-panels-20261115.js')), 'panel builder present');
  T.ok('step script restore() never rm-deletes tracked scratch (checkout-from-HEAD for tracked files, rm only for untracked)',
    (function () {
      const s = fs.readFileSync(path.join(REPO, 'scripts', 'culpritbisect-step-guardablate-fresh-20261115.sh'), 'utf8');
      return s.indexOf('git checkout HEAD -- "$f"') !== -1 &&
        s.indexOf('TRACKED at the step commit') !== -1 &&
        s.indexOf('rm -f scripts/culpritbisect-driver-20261113.js') === -1;
    })(), 'restore-from-HEAD present, bulk delete gone');
  T.ok('step script restores the guardablate-fresh driver/analyzer from the ARM branch and shared tooling from master',
    (function () {
      const s = fs.readFileSync(path.join(REPO, 'scripts', 'culpritbisect-step-guardablate-fresh-20261115.sh'), 'utf8');
      return s.indexOf('culpritbisect-driver-guardablate-fresh-20261115.js') !== -1 &&
        s.indexOf('culpritbisect-analyze-guardablate-fresh-20261115.js') !== -1 &&
        s.indexOf('ARM_BRANCH="sim-guardablate-fresh-a"') !== -1 &&
        s.indexOf('git show "$BRANCH:$f"') !== -1;
    })(), 'restore sources correct');
  T.ok('step script defaults SEEDS to the fresh band 190631-190638',
    fs.readFileSync(path.join(REPO, 'scripts', 'culpritbisect-step-guardablate-fresh-20261115.sh'), 'utf8')
      .indexOf('SEEDS="190631,190632,190633,190634,190635,190636,190637,190638"') !== -1, 'SEEDS default present');
  T.ok('analyzer hardcodes the fresh band seeds (matched band appears only as a reference note)',
    (function () {
      const s = fs.readFileSync(path.join(REPO, 'scripts', 'culpritbisect-analyze-guardablate-fresh-20261115.js'), 'utf8');
      const seedsLine = s.split('\n').filter(function (ln) { return ln.indexOf('const SEEDS') === 0; })[0] || '';
      return seedsLine.indexOf('190631') !== -1 && seedsLine.indexOf('190391') === -1 &&
        s.indexOf('reference only') !== -1;
    })(), 'analyzer seeds fresh');
  T.ok('driver defaults RUN to guardablate-fresh-pilot and writes guardablate-fresh per-seed files',
    (function () {
      const s = fs.readFileSync(path.join(REPO, 'scripts', 'culpritbisect-driver-guardablate-fresh-20261115.js'), 'utf8');
      return s.indexOf("const RUN = process.env.RUN || 'guardablate-fresh-pilot';") !== -1 &&
        s.indexOf("'guardablate-fresh-s' + seed") !== -1 &&
        s.indexOf("'perseed-guardablate-fresh-' + STEP") !== -1;
    })(), 'driver RUN + prefix fresh');
  T.ok('cascade-b proof exists on the arm branch (the guard-effect instrument)',
    fs.existsSync(path.join(REPO, 'scripts', 'test-cascade-b.js')), 'cascade-b proof present');
  T.ok('multi-turn lingerer check exists on the arm branch (the §8 instrument)',
    fs.existsSync(path.join(REPO, 'scripts', 'test-guardablate-lingerer-turns.js')), 'linger-turns present');

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
  const rerunSummary = readSummaryIfExists(summaryPath(RERUN_STEP));
  const fallbackSummary = readSummaryIfExists(summaryPath(FALLBACK_BASELINE_STEP));
  // Effective legs: the fallback baseline governs only when the primary
  // baseline fails the gate; the re-run subject governs when present.
  const effBaseline = (baseSummary && classifyGate(baseSummary.survived) === 'PROCEED') ? baseSummary : fallbackSummary;
  const effSubject = rerunSummary || subjSummary;
  const stage = !baseSummary && !subjSummary && !rerunSummary && !fallbackSummary ? 'none'
    : (baseSummary && !subjSummary && !rerunSummary && !fallbackSummary ? 'baseline-only'
    : (baseSummary && classifyGate(baseSummary.survived) === 'STOP' && fallbackSummary && !subjSummary && !rerunSummary ? 'gate-fallback'
    : (effBaseline && effSubject ? 'both' : 'partial')));
  T.ok('corpus stage is one of none / baseline-only / gate-fallback / both (never subject-only without a baseline)',
    stage !== 'partial' || (baseSummary !== null), 'stage=' + stage);
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
    T.ok('baseline summary reads the fresh band seeds',
      JSON.stringify(baseSummary.seeds) === JSON.stringify(SEEDS), 'seeds=' + baseSummary.seeds.join(','));
    T.ok('baseline per-seed anchorCommit is the base ' + BASE,
      baseSummary.perSeed.every(function (r) { return r.anchorCommit === BASE_FULL.slice(0, 12); }), '8/8 rows base');
    T.ok('baseline rows carry the fix standing + base policy',
      baseSummary.perSeed.every(function (r) { return r.standingFix === true && r.standingSha === FIX_SHORT && r.policySha === POLICY_SHORT; }), 'fix + policy');
    T.ok('baseline instrument errors are 0',
      baseSummary.instrumentErrors === 0, 'errors=' + baseSummary.instrumentErrors);
    T.ok('baseline survived count is a number 0-8',
      typeof baseSummary.survived === 'number' && baseSummary.survived >= 0 && baseSummary.survived <= 8, 'survived=' + baseSummary.survived + '/8');
    T.ok('baseline gate is ' + classifyGate(baseSummary.survived) + ' (B=' + baseSummary.survived + '/8)',
      classifyGate(baseSummary.survived) === 'PROCEED' || classifyGate(baseSummary.survived) === 'STOP', 'gate=' + classifyGate(baseSummary.survived));
  }
  if (fallbackSummary !== null) {
    T.ok('fallback baseline summary reads the fallback band seeds',
      JSON.stringify(fallbackSummary.seeds) === JSON.stringify(FALLBACK_SEEDS), 'seeds=' + fallbackSummary.seeds.join(','));
    T.ok('fallback baseline per-seed anchorCommit is the base ' + BASE,
      fallbackSummary.perSeed.every(function (r) { return r.anchorCommit === BASE_FULL.slice(0, 12); }), '8/8 rows base');
    T.ok('fallback baseline instrument errors are 0',
      fallbackSummary.instrumentErrors === 0, 'errors=' + fallbackSummary.instrumentErrors);
    T.ok('fallback baseline gate is ' + classifyGate(fallbackSummary.survived) + ' (B=' + fallbackSummary.survived + '/8)',
      classifyGate(fallbackSummary.survived) === 'PROCEED' || classifyGate(fallbackSummary.survived) === 'STOP', 'gate=' + classifyGate(fallbackSummary.survived));
  }
  if (stage === 'baseline-only') {
    T.ok('INTERMEDIATE STATE: baseline summary exists, subject summary missing (reported, not crashed)',
      baseSummary !== null && subjSummary === null, 'baseline present, subject missing');
    T.ok('INTERMEDIATE STATE: no subject branch is required yet (the cut waits on the baseline leg completing AND the gate passing)',
      true, 'cut follows baseline + gate');
  }
  if (stage === 'gate-fallback') {
    T.ok('GATE STATE: primary baseline failed the gate (B < 3/8) and the fallback baseline leg ran',
      baseSummary !== null && classifyGate(baseSummary.survived) === 'STOP' && fallbackSummary !== null, 'fallback leg present');
    T.ok('GATE STATE: no subject summary exists (the subject is not cut on a failed gate)',
      subjSummary === null && rerunSummary === null, 'no subject yet');
  }
  if (stage === 'both') {
    T.ok('effective baseline passed the gate (B=' + effBaseline.survived + '/8)',
      classifyGate(effBaseline.survived) === 'PROCEED', 'gate PROCEED');
    T.ok('subject summary reads the fresh band seeds',
      JSON.stringify(effSubject.seeds) === JSON.stringify(SEEDS), 'seeds=' + effSubject.seeds.join(','));
    T.ok('subject per-seed anchorCommit is the subject commit',
      (function () {
        // The driver records a 12-char anchor; `git rev-parse --short`
        // returns 9 chars in this repo — compare the 12-char prefix.
        const subjShort12 = git('rev-parse ' + SUBJECT_BRANCH).slice(0, 12);
        return effSubject.perSeed.every(function (r) { return r.anchorCommit === subjShort12; });
      })(), '8/8 rows subject');
    T.ok('subject rows carry the fix standing + base policy',
      effSubject.perSeed.every(function (r) { return r.standingFix === true && r.standingSha === FIX_SHORT && r.policySha === POLICY_SHORT; }), 'fix + policy');
    T.ok('subject instrument errors are 0',
      effSubject.instrumentErrors === 0, 'errors=' + effSubject.instrumentErrors);
    const verdict = classifyVerdict(effSubject.survived, effBaseline.survived);
    T.ok('guard verdict is ' + verdict + ' (subject ' + effSubject.survived + '/8, baseline ' + effBaseline.survived + '/8)',
      verdict === 'CONFIRMED' || verdict === 'REFUTED' || verdict === 'AMBIGUOUS', 'verdict=' + verdict);
    if (rerunSummary !== null) {
      T.ok('re-run subject leg governed (fresh step id tguardablate-fresh-r; first subject read was AMBIGUOUS)',
        classifyVerdict(subjSummary.survived, effBaseline.survived) === 'AMBIGUOUS', 'first=' + subjSummary.survived + '/8 AMBIGUOUS');
    }
    const baseCorpus = corpusDir(effBaseline === fallbackSummary ? FALLBACK_BASELINE_STEP : BASELINE_STEP);
    const subjCorpus = corpusDir(rerunSummary !== null ? RERUN_STEP : SUBJECT_STEP);
    T.ok('baseline per-seed corpus holds 8 files',
      fs.existsSync(baseCorpus) && fs.readdirSync(baseCorpus).length === 8, '8 files');
    T.ok('subject per-seed corpus holds 8 files',
      fs.existsSync(subjCorpus) && fs.readdirSync(subjCorpus).length === 8, '8 files');
    T.ok('baseline driver log exists',
      fs.existsSync(path.join(REPO, 'evidence', '2026-11-15', 'guardablate-fresh-' + (effBaseline === fallbackSummary ? FALLBACK_BASELINE_STEP : BASELINE_STEP) + '-driver.log')), 'baseline log present');
    T.ok('subject driver log exists',
      fs.existsSync(path.join(REPO, 'evidence', '2026-11-15', 'guardablate-fresh-' + (rerunSummary !== null ? RERUN_STEP : SUBJECT_STEP) + '-driver.log')), 'subject log present');
    const evidenceText = fs.existsSync(EVIDENCE) ? fs.readFileSync(EVIDENCE, 'utf8') : '';
    const evidenceFlat = evidenceText.replace(/\s+/g, ' ');
    T.ok('evidence records the verdict ' + verdict,
      evidenceFlat.indexOf(verdict) !== -1, 'verdict recorded');
    T.ok('evidence records the baseline gate outcome',
      evidenceText.indexOf('Gate') !== -1 && (evidenceFlat.indexOf('gate') !== -1), 'gate recorded');
    T.ok('evidence records the telemetry refusal (recorder-corpus, baseline NOT rolled)',
      evidenceFlat.indexOf('REFUSED') !== -1 && evidenceFlat.indexOf('baseline NOT rolled') !== -1, 'refusal recorded');
    T.ok('evidence carries a metric-review section',
      evidenceText.indexOf('Metric review') !== -1, 'metric review present');
    T.ok('evidence carries a sense-testing section',
      evidenceText.indexOf('Sense-testing') !== -1, 'sense-testing present');
  }
  if (baseSummary !== null && classifyGate(baseSummary.survived) === 'STOP' && fallbackSummary !== null && classifyGate(fallbackSummary.survived) === 'STOP') {
    const evidenceText = fs.existsSync(EVIDENCE) ? fs.readFileSync(EVIDENCE, 'utf8') : '';
    T.ok('GATE-STOP FINAL: both baselines failed the gate, evidence records STOP UNMEASURED and no subject leg ran',
      evidenceText.indexOf('UNMEASURED') !== -1 && subjSummary === null && rerunSummary === null, 'UNMEASURED recorded');
  }

  // ---- 10. Fresh-band record ----
  T.section('10. Fresh-band record — band + fallback + search scope in the prereg');
  T.ok('prereg records the chosen band 190631-190638 as FRESH with the full check',
    preregFlat.indexOf('Chosen band: **190631–190638**') !== -1 && preregFlat.indexOf('full check') !== -1, 'band recorded');
  T.ok('prereg records the fallback band 190661-190668 as pre-screened the same way',
    preregFlat.indexOf('Fallback band (pre-screened') !== -1 && preregFlat.indexOf('190661–190668') !== -1, 'fallback recorded');
  T.ok('prereg records the false-positive kcal hits (190638.28... pantry float, 190632.47... spoilage float)',
    preregFlat.indexOf('190638.2857142857') !== -1 && preregFlat.indexOf('190632.47378020972') !== -1, 'false positives recorded');
  T.ok('prereg records the rejected fallback candidates with reasons (190641-190648 named in 7redef prereg; 190651-190658: 190658 named in cut2confirm prereg)',
    preregFlat.indexOf('190641–190648') !== -1 && preregFlat.indexOf('190651–190658') !== -1 &&
    preregFlat.indexOf('sim-transplant7redef-prereg.md') !== -1 && preregFlat.indexOf('sim-cut2confirm-b-prereg.md') !== -1, 'rejections recorded');
  T.ok('prereg records the 2b-fresh naming of 190631-190638 (pre-screened unused fallback) with the adjudication',
    preregFlat.indexOf('sim-transplant2b-fresh-prereg.md') !== -1 && preregFlat.indexOf('pre-screened, UNUSED fallback') !== -1, 'naming adjudicated');

  await T.done();
})().catch(function (e) {
  console.error(e);
  process.exit(1);
});
