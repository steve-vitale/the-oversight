#!/usr/bin/env node
// test-alignstep-a.js — proof test for the FAMILY-7 ALIGN STEP minimal
// ablation on master-tip substrate (arm sim-alignstep-a).
//
// THE QUESTION (evidence/2026-11-15/sim-alignstep-a-prereg.md, committed
// before cutting the subject or running any judged sim): does the align
// step alone — the `vbrainAlignObjective` call in `finishLottery`
// (villager-objectives.js), which rewrites the live objective to the dawn
// commitment when an aimed override wins — collapse survival? Full family
// 7 (merge 23245d5d6, PR #30 dawn honesty) is UNMEASURED and CLOSED by
// attribution (2026-11-15 2015Z coordinator decision — the collapse regime
// was guard-masked, not family-7); this arm does NOT re-judge family 7
// and does NOT hand-reverse PR #30. The transplant7brain arm proved the
// merge's 48-line align function cannot be reversed onto master tip by
// mechanical means (4 of 5 hunks conflict; the tip's align function is
// 114 lines — Phase 6 inserted a DUTY/ASSIGN branch inside it). This arm
// defines a NEW, minimal ablation: remove ONLY the call to
// `vbrainAlignObjective` in `finishLottery`, leaving the function itself
// in place as dead code. 7b already established the no-align behavior
// (the typeof guard returns the objective unchanged when the function is
// absent); removing the call produces exactly that behavior while leaving
// the Phase 6 DUTY/ASSIGN code inside the function untouched — so the
// ablation isolates the align step's effect and nothing else.
//
// WHAT THIS TEST PROVES:
//   1. Family identity — merge 23245d5d6, its parents, the 1-commit
//      second-parent side, the exact 2 src/js files, +75/-10
//      (villager-brain.js 59 / villager-objectives.js 26 changed
//      lines), no policy file, honesty test absent at far end + first
//      parent, present at the merge (blob 77f50489, 214 lines),
//      villager-brain.js absent at the far end / present at the first
//      parent, merge NOT an ancestor of the far end, IS an ancestor of
//      master tip ce0f28a46.
//   2. Ablation-set definition — the exact 5 removed lines at
//      villager-objectives.js:681-685, present verbatim at the tip;
//      `finishLottery` is the ONLY game-code caller of
//      vbrainAlignObjective (one call site); all six objPick returns go
//      through finishLottery; the align function stays in place at the
//      tip (114 lines vs the merge's 44, Phase 6 DUTY/ASSIGN branch
//      present, merge align text NOT a substring of the tip align text);
//      the test files reference the function but are NOT in the
//      ablation set.
//   3. Verdict mapping — gateStopVerdict maps the BASELINE GATE for
//      THIS arm (baseline <=2/8 -> PROCEED, >=3/8 -> STOP-UNMEASURED —
//      the OPPOSITE polarity from 7b, because the question here is live
//      only in the collapsed regime); subjectVerdict maps the
//      subject-minus-baseline delta (>=+2 CARRIER, -1..+1 NOT-CARRIER,
//      <=-2 INVERTED).
//   4. Base state — HEAD is on sim-alignstep-a, based on the master tip
//      (tip is an ancestor of HEAD; every commit above the tip is this
//      arm's own work), no src/js file differs from HEAD, on-disk
//      standing.js is byte-identical to HEAD, and only the arm's own
//      files may be uncommitted.
//   5. Seed-band identity — the step script and the prereg name exactly
//      seeds 190391–190398; the prereg records the matched band as
//      REUSED BY DESIGN (not claimed fresh) with the search scope and
//      the live reuse counts (548 files, 98 preregs); the planned corpus
//      names are distinct from the sibling arms' (alignstep, not
//      t7brain / t7b).
//   6. Live subject state — TWO BRANCHES. Pre-subject (stage 1): no
//      alignstep-subject branch exists yet (expected — the subject is
//      cut only if the baseline gate passes) and the prereg defines the
//      ablation set exactly. Post-subject: the subject branch exists,
//      its tip's parent is the master tip, and the subject diff
//      byte-equals the defined set (one file,
//      src/js/villager-objectives.js, -5/+0, the exact 5 removed lines,
//      no added lines, no other file touched).
//   7. Step corpora — TWO BRANCHES. Pre-leg (stage 1): no baseline or
//      subject summary/corpus exists for the alignstep steps. Post-leg:
//      each present summary parses, names its step, carries a survived
//      count 0..8, and the evidence file records the verdict the
//      pre-registered mapping gives for those numbers; each present
//      corpus dir holds 8 per-seed files.
//
// Usage: node scripts/test-alignstep-a.js
// Exit 0 = pass, 1 = fail. No repo writes.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('alignstep-a');

const REPO = path.join(__dirname, '..');
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const MERGE = '23245d5d6';
const MERGE_FULL = '23245d5d6d91b4b5284e2f503345dcfd1621ff0c';
const MERGE_BASE = '7041e1bfb';
const MERGE_BASE_FULL = '7041e1bfb7e8b69387bd3203a58eed00115ec8d7';
const SECOND_FULL = 'a038cf1513c2eaee2e6ab97c9550369467910b50';
const MASTER_TIP = 'ce0f28a46';
const MASTER_TIP_FULL = 'ce0f28a464f63b4c4573b060b3e190efa9e68364';
const ARM_BRANCH = 'sim-alignstep-a';
const SUBJECT_BRANCH = 'alignstep-subject';
const STEP = 'talignstep';
const BASELINE_STEP = 'ep-tip-alignstep';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const EXPECTED_FILES = [
  'docs/ONTOLOGY.md',
  'scripts/green-list.txt',
  'scripts/test-dawn-materialize-honesty.js',
  'scripts/test-villager-brain-dawn.js',
  'src/js/villager-brain.js',
  'src/js/villager-objectives.js',
];
// The exact 5 lines the ablation removes (villager-objectives.js:681-685
// at master tip), verbatim, in order.
const REMOVED_LINES = [
  "        try {",
  "          if (typeof this.vbrainAlignObjective === 'function') {",
  "            return this.vbrainAlignObjective(vid, obj, hx, hy) || obj;",
  "          }",
  "        } catch (e) {}",
];
const HONESTY_TEST = 'scripts/test-dawn-materialize-honesty.js';
const HONESTY_BLOB = '77f50489591ceba8ea13fcf9f954a6a89d720c7f';
const PREREG = path.join(REPO, 'evidence', '2026-11-15', 'sim-alignstep-a-prereg.md');
const EVIDENCE = path.join(REPO, 'evidence', '2026-11-15', 'sim-alignstep-a.md');
// Files this arm may leave uncommitted (prereg, this proof, evidence).
const ARM_FILES = [
  'evidence/2026-11-15/sim-alignstep-a-prereg.md',
  'scripts/test-alignstep-a.js',
  'evidence/2026-11-15/sim-alignstep-a.md',
];

function sha256(text) { return crypto.createHash('sha256').update(text).digest('hex'); }
function git(args) {
  return execSync('git ' + args, { cwd: REPO, stdio: 'pipe' }).toString().trim();
}
function gitShow(commit, file) {
  return execSync('git show ' + commit + ':' + file, { cwd: REPO, stdio: 'pipe' }).toString();
}
function gitOk(args) {
  try { execSync('git ' + args, { cwd: REPO, stdio: 'pipe' }); return true; }
  catch (e) { return false; }
}
function isAncestor(a, b) {
  try { execSync('git merge-base --is-ancestor ' + a + ' ' + b, { cwd: REPO, stdio: 'pipe' }); return true; }
  catch (e) { return false; }
}
function diffText(revA, revB, file) {
  return execSync('git diff ' + revA + ' ' + revB + ' -- ' + file, { cwd: REPO, stdio: 'pipe' }).toString('utf8');
}
// gateStopVerdict(baselineSurvived): the binding BASELINE GATE for THIS
// arm — the carrier question is live on master-tip substrate ONLY if the
// baseline reads <=2/8 (the collapsed regime). At >=3/8 the collapse
// regime is gone on current master: STOP, UNMEASURED-substrate, no subject
// leg, and the baseline read is NOT re-judged as a carrier signal.
// NOTE the opposite polarity from 7b (there the gate needed >=3/8 to
// proceed, because the far end was the healthy 4/8 baseline).
function gateStopVerdict(baselineSurvived) {
  if (typeof baselineSurvived !== 'number' || !Number.isFinite(baselineSurvived) ||
      baselineSurvived < 0 || baselineSurvived > 8) return 'UNCLASSIFIABLE';
  if (baselineSurvived <= 2) return 'PROCEED';
  return 'STOP-UNMEASURED';
}
// subjectVerdict(delta): subject-minus-baseline survivors, judged by the
// pre-registered mapping in the prereg.
function subjectVerdict(delta) {
  if (typeof delta !== 'number' || !Number.isFinite(delta)) return 'UNCLASSIFIABLE';
  if (delta >= 2) return 'CARRIER';
  if (delta <= -2) return 'INVERTED';
  return 'NOT-CARRIER';
}
// alignFunctionText(srcText): the vbrainAlignObjective function definition
// (from its declaration to its closing '    },').
function alignFunctionText(srcText) {
  const start = srcText.indexOf('vbrainAlignObjective: function (vid, o, hx, hy) {');
  if (start === -1) return null;
  const end = srcText.indexOf('\n    },', start);
  if (end === -1) return null;
  return srcText.slice(start, end);
}
// finishLotteryBlock(srcText): the finishLottery definition (from its
// declaration to its closing '}.bind(this);').
function finishLotteryBlock(srcText) {
  const start = srcText.indexOf('var finishLottery = function (obj) {');
  if (start === -1) return null;
  const end = srcText.indexOf('}.bind(this);', start);
  if (end === -1) return null;
  return srcText.slice(start, end + '}.bind(this);'.length);
}

(async function () {
  T.section('1. Family identity — PR #30 merge 23245d5d6');
  T.ok('merge full sha is 23245d5d6d91b4b5284e2f503345dcfd1621ff0c',
    git('rev-parse ' + MERGE) === MERGE_FULL, MERGE_FULL);
  T.ok('first parent is 7041e1bfb (OVE-33 refresh)',
    git('rev-parse ' + MERGE + '^1') === MERGE_BASE_FULL, MERGE_BASE_FULL);
  T.ok('second parent is a038cf151 (align dawn materialize)',
    git('rev-parse ' + MERGE + '^2') === SECOND_FULL, SECOND_FULL);
  T.ok('second-parent side is 1 commit',
    git('rev-list --count ' + MERGE_BASE + '..' + MERGE + '^2') === '1', '1 commit');
  const stat = git('diff --stat ' + MERGE + '^1 ' + MERGE);
  T.ok('merge diff touches exactly 6 files',
    stat.split('\n').filter(function (l) { return l.indexOf('|') !== -1; }).length === 6, '6 files');
  const files = git('diff --name-only ' + MERGE + '^1 ' + MERGE).split('\n').sort();
  T.ok('merge diff file list is exactly the 6 known files',
    JSON.stringify(files) === JSON.stringify(EXPECTED_FILES.slice().sort()), files.join(', '));
  const numstat = execSync('git diff --numstat ' + MERGE + '^1 ' + MERGE,
    { cwd: REPO, stdio: 'pipe' }).toString('utf8');
  const byFile = {};
  numstat.trim().split('\n').forEach(function (ln) {
    const parts = ln.split('\t');
    byFile[parts[2]] = { a: parseInt(parts[0], 10), r: parseInt(parts[1], 10) };
  });
  T.ok('villager-brain.js numstat is 56+/3-',
    byFile['src/js/villager-brain.js'] && byFile['src/js/villager-brain.js'].a === 56 &&
    byFile['src/js/villager-brain.js'].r === 3, '56/3');
  T.ok('villager-objectives.js numstat is 19+/7-',
    byFile['src/js/villager-objectives.js'] && byFile['src/js/villager-objectives.js'].a === 19 &&
    byFile['src/js/villager-objectives.js'].r === 7, '19/7');
  T.ok('src/js total is +75/-10',
    byFile['src/js/villager-brain.js'].a + byFile['src/js/villager-objectives.js'].a === 75 &&
    byFile['src/js/villager-brain.js'].r + byFile['src/js/villager-objectives.js'].r === 10, '+75/-10');
  T.ok('no scripts/policies file in the merge diff',
    files.every(function (f) { return f.indexOf('scripts/policies/') !== 0; }), 'pol=0');
  T.ok('merge is NOT an ancestor of the far end 203a32775',
    !isAncestor(MERGE, FAR), 'not ancestor of far end');
  T.ok('merge IS an ancestor of master tip ce0f28a46',
    isAncestor(MERGE, MASTER_TIP), 'ancestor of master tip');
  T.ok('honesty test is +214 lines, blob 77f50489 at the merge',
    git('rev-parse ' + MERGE + ':' + HONESTY_TEST) === HONESTY_BLOB &&
    gitShow(MERGE, HONESTY_TEST).split('\n').length - 1 === 214, 'blob 77f50489, 214 lines');
  T.ok('honesty test absent at the far end and at the first parent',
    !gitOk('cat-file -e ' + FAR + ':' + HONESTY_TEST) &&
    !gitOk('cat-file -e ' + MERGE_BASE + ':' + HONESTY_TEST), 'absent at far end + first parent');
  T.ok('villager-brain.js absent at the far end, present at the first parent',
    git('ls-tree ' + FAR + ' -- src/js/villager-brain.js') === '' &&
    git('ls-tree ' + MERGE_BASE + ' -- src/js/villager-brain.js') !== '', 'absent far end / present first parent');

  T.section('2. Ablation-set definition — the call in finishLottery, and only the call');
  const objTip = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-objectives.js'), 'utf8');
  const objLines = objTip.split('\n');
  T.ok('the 5 removed lines are present verbatim at villager-objectives.js:681-685',
    REMOVED_LINES.every(function (ln, i) { return objLines[680 + i] === ln; }),
    objLines.slice(680, 685).join(' | '));
  const finBlock = finishLotteryBlock(objTip);
  T.ok('finishLottery block is exactly the 8-line definition (call + return obj + bind)',
    finBlock !== null && finBlock.split('\n').length === 8, finBlock ? finBlock.split('\n').length + ' lines' : 'missing');
  T.ok('finishLottery is the ONLY game-code caller of vbrainAlignObjective (one call site)',
    (objTip.match(/this\.vbrainAlignObjective\(/g) || []).length === 1, '1 call site');
  T.ok('all six objPick returns go through finishLottery(o)',
    (objTip.match(/return finishLottery\(o\);/g) || []).length === 6, '6 returns');
  T.ok('the typeof guard is the only other vbrainAlignObjective reference in objectives',
    (objTip.match(/vbrainAlignObjective/g) || []).length === 3, '3 references (guard + call + OVE-74 comment)');
  const tipBrain = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
  const tipAlign = alignFunctionText(tipBrain);
  const mergeAlign = alignFunctionText(gitShow(MERGE, 'src/js/villager-brain.js'));
  T.ok('the align function stays in place at the tip (present, 114 lines vs the merge 44)',
    tipAlign !== null && mergeAlign !== null &&
    tipAlign.split('\n').length === 114 && mergeAlign.split('\n').length === 44,
    'tip ' + (tipAlign ? tipAlign.split('\n').length : '?') + ' lines, merge ' +
    (mergeAlign ? mergeAlign.split('\n').length : '?') + ' lines');
  T.ok('merge align text is NOT a verbatim substring of the tip align text',
    tipAlign !== null && mergeAlign !== null && tipAlign.indexOf(mergeAlign.trim()) === -1,
    'merge align not in tip align');
  T.ok('tip align carries the Phase 6 DUTY/ASSIGN branch (untouched by the ablation)',
    tipAlign !== null && tipAlign.indexOf("c.kind === 'DUTY'") !== -1 &&
    tipAlign.indexOf('dutyTask') !== -1, 'DUTY/ASSIGN branch present');
  T.ok('villager-brain.js changed in 12 commits between the merge and master tip',
    git('rev-list --count ' + MERGE + '..' + MASTER_TIP + ' -- src/js/villager-brain.js') === '12', '12 commits');
  const honestyTip = fs.readFileSync(path.join(REPO, HONESTY_TEST), 'utf8');
  T.ok('honesty test references vbrainAlignObjective but is NOT in the ablation set (function stays)',
    honestyTip.indexOf('vbrainAlignObjective') !== -1 &&
    tipBrain.indexOf('vbrainAlignObjective: function (vid, o, hx, hy) {') !== -1, 'test references, function present');
  const brainTestTip = fs.readFileSync(path.join(REPO, 'scripts', 'test-villager-brain-dawn.js'), 'utf8');
  T.ok('test-villager-brain-dawn.js references vbrainAlignObjective exactly once and is NOT in the ablation set',
    (brainTestTip.match(/vbrainAlignObjective/g) || []).length === 1, '1 reference');

  T.section('3. Verdict mapping — baseline gate, subject delta');
  T.ok('gateStopVerdict: baseline 0/1/2 -> PROCEED (collapsed regime, question live)',
    gateStopVerdict(0) === 'PROCEED' && gateStopVerdict(1) === 'PROCEED' && gateStopVerdict(2) === 'PROCEED',
    '0,1,2 -> PROCEED');
  T.ok('gateStopVerdict: baseline 3..8 -> STOP-UNMEASURED (collapse regime gone, question moot)',
    [3, 4, 5, 6, 7, 8].every(function (n) { return gateStopVerdict(n) === 'STOP-UNMEASURED'; }),
    '3..8 -> STOP-UNMEASURED');
  T.ok('gateStopVerdict: out-of-range -> UNCLASSIFIABLE',
    gateStopVerdict(-1) === 'UNCLASSIFIABLE' && gateStopVerdict(9) === 'UNCLASSIFIABLE' &&
    gateStopVerdict('x') === 'UNCLASSIFIABLE', 'unclassifiable');
  T.ok('subjectVerdict: delta >= +2 -> CARRIER',
    subjectVerdict(2) === 'CARRIER' && subjectVerdict(3) === 'CARRIER' && subjectVerdict(8) === 'CARRIER',
    '+2/+3/+8 -> CARRIER');
  T.ok('subjectVerdict: delta -1..+1 -> NOT-CARRIER',
    subjectVerdict(-1) === 'NOT-CARRIER' && subjectVerdict(0) === 'NOT-CARRIER' && subjectVerdict(1) === 'NOT-CARRIER',
    '-1/0/+1 -> NOT-CARRIER');
  T.ok('subjectVerdict: delta <= -2 -> INVERTED',
    subjectVerdict(-2) === 'INVERTED' && subjectVerdict(-3) === 'INVERTED', '-2/-3 -> INVERTED');

  T.section('4. Base state — arm branch at master tip, only arm files uncommitted');
  T.ok('HEAD is the arm branch sim-alignstep-a',
    git('branch --show-current') === ARM_BRANCH, git('branch --show-current'));
  T.ok('arm branch is based on master tip ce0f28a46 (tip is an ancestor of HEAD)',
    isAncestor(MASTER_TIP, 'HEAD'), 'tip ancestor of HEAD');
  T.ok('every commit above the tip on this branch is this arm\'s own work',
    git('log --format=%s ' + MASTER_TIP + '..HEAD').split('\n').filter(Boolean)
      .every(function (s) { return s.indexOf('sim-alignstep-a') === 0; }),
    git('log --oneline ' + MASTER_TIP + '..HEAD').split('\n').filter(Boolean).join(' | ') || 'at tip');
  T.ok('no src/js file differs from HEAD',
    git('status --porcelain -- src/js') === '', 'src/js clean');
  T.ok('on-disk standing.js is byte-identical to HEAD',
    sha256(fs.readFileSync(path.join(REPO, 'src', 'js', 'standing.js'))) ===
    sha256(gitShow('HEAD', 'src/js/standing.js')), 'standing.js == HEAD');
  // Porcelain lines are XY + space + path; use the RAW output (git()
  // trims, which eats the first line's leading status-space and shifts
  // a fixed slice by one).
  const rawStatus = execSync('git status --porcelain', { cwd: REPO, stdio: 'pipe' }).toString();
  const dirty = rawStatus.split('\n').filter(Boolean).map(function (ln) { return ln.slice(3); });
  T.ok('only the arm files may be uncommitted (prereg, this proof, evidence)',
    dirty.every(function (f) { return ARM_FILES.indexOf(f) !== -1; }),
    dirty.length === 0 ? 'clean' : dirty.join(', '));

  T.section('5. Seed-band identity — matched band, reused by design');
  const stepScript = fs.readFileSync(path.join(REPO, 'scripts', 'culpritbisect-step.sh'), 'utf8');
  T.ok('step script seeds are exactly 190391-190398',
    stepScript.indexOf('SEEDS="190391,190392,190393,190394,190395,190396,190397,190398"') !== -1,
    'SEEDS 190391..190398');
  const preregText = fs.readFileSync(PREREG, 'utf8');
  T.ok('prereg names the matched band 190391-190398 and the step ids talignstep / ep-tip-alignstep',
    preregText.indexOf('190391') !== -1 && preregText.indexOf(STEP) !== -1 &&
    preregText.indexOf(BASELINE_STEP) !== -1, 'band + step ids in prereg');
  T.ok('prereg records the band as REUSED BY DESIGN (not claimed fresh)',
    preregText.indexOf('REUSED BY DESIGN') !== -1 && preregText.indexOf('NOT fresh') !== -1,
    'reuse-by-design recorded');
  T.ok('prereg records the freshness search scope (whole evidence/ tree) and result (548 files, 98 preregs)',
    preregText.indexOf('548 files') !== -1 && preregText.indexOf('98') !== -1,
    '548 files / 98 preregs');
  T.ok('planned corpus names are distinct from the sibling arms and from 7b (alignstep, not t7brain)',
    STEP.indexOf('talignstep') === 0 && BASELINE_STEP.indexOf('ep-tip-alignstep') === 0 &&
    ('perseed-culpritbisect-a-' + STEP).indexOf('alignstep') !== -1, STEP + ' / ' + BASELINE_STEP);

  T.section('6. Live subject state — pre-subject OR subject-exists branch');
  const subjectExists = gitOk('show-ref --verify refs/heads/' + SUBJECT_BRANCH);
  if (!subjectExists) {
    T.ok('subject branch alignstep-subject does NOT exist yet (stage 1 — cut only if the gate passes)',
      true, 'no subject branch (pre-subject)');
    T.ok('prereg defines the ablation set exactly (5 lines, one file, -5/+0, zero other files)',
      preregText.indexOf('remove EXACTLY these 5 lines') !== -1 &&
      preregText.indexOf('−5/+0') !== -1 &&
      preregText.indexOf('Zero other files') !== -1, 'ablation set defined');
  } else {
    const subjTip = git('rev-parse ' + SUBJECT_BRANCH);
    const subjParent = git('rev-parse ' + SUBJECT_BRANCH + '^');
    T.ok('subject branch alignstep-subject exists',
      true, 'branch present, tip ' + subjTip.slice(0, 12));
    T.ok('subject branch is based on master tip ce0f28a46 (its parent is the tip)',
      subjParent === MASTER_TIP_FULL, 'parent ' + subjParent.slice(0, 12));
    const subjFiles = git('diff --name-only ' + MASTER_TIP + ' ' + SUBJECT_BRANCH).split('\n').filter(Boolean);
    T.ok('subject diff touches exactly one file: src/js/villager-objectives.js',
      subjFiles.length === 1 && subjFiles[0] === 'src/js/villager-objectives.js', subjFiles.join(', '));
    const subjNumstat = execSync('git diff --numstat ' + MASTER_TIP + ' ' + SUBJECT_BRANCH + ' -- src/js/villager-objectives.js',
      { cwd: REPO, stdio: 'pipe' }).toString().trim();
    T.ok('subject diff numstat is -5/+0 (0 added, 5 removed)',
      subjNumstat === '0\t5\tsrc/js/villager-objectives.js', subjNumstat);
    const subjDiff = diffText(MASTER_TIP, SUBJECT_BRANCH, 'src/js/villager-objectives.js');
    const removed = subjDiff.split('\n').filter(function (ln) {
      return ln.indexOf('-') === 0 && ln.indexOf('---') !== 0;
    }).map(function (ln) { return ln.slice(1); });
    const added = subjDiff.split('\n').filter(function (ln) {
      return ln.indexOf('+') === 0 && ln.indexOf('+++') !== 0;
    });
    T.ok('subject diff removes exactly the 5 defined lines, in order',
      JSON.stringify(removed) === JSON.stringify(REMOVED_LINES), removed.join(' | '));
    T.ok('subject diff adds no lines',
      added.length === 0, added.length + ' added');
    const subjObj = gitShow(SUBJECT_BRANCH, 'src/js/villager-objectives.js');
    const subjFin = finishLotteryBlock(subjObj);
    T.ok('subject finishLottery is the 3-line passthrough (return obj, no align call)',
      subjFin !== null && subjFin.split('\n').length === 3 &&
      subjFin.indexOf('vbrainAlignObjective') === -1, subjFin ? subjFin.replace(/\n/g, ' ') : 'missing');
    T.ok('subject still defines vbrainAlignObjective in villager-brain.js (function stays, dead code)',
      gitShow(SUBJECT_BRANCH, 'src/js/villager-brain.js').indexOf(
        'vbrainAlignObjective: function (vid, o, hx, hy) {') !== -1, 'function present in subject');
  }

  T.section('7. Step corpora — pre-leg OR measured-legs branch');
  const baseSummary = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + BASELINE_STEP + '-summary.json');
  const subjSummary = path.join(REPO, 'evidence', '2026-11-13', 'culpritbisect-a-' + STEP + '-summary.json');
  const baseCorpus = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + BASELINE_STEP);
  const subjCorpus = path.join(REPO, 'evidence', '2026-11-13', 'perseed-culpritbisect-a-' + STEP);
  let baseSurvived = null;
  let subjSurvived = null;
  if (!fs.existsSync(baseSummary)) {
    T.ok('no baseline summary exists for ep-tip-alignstep (no leg ran yet — stage 1)',
      true, 'no baseline summary');
  } else {
    const s = JSON.parse(fs.readFileSync(baseSummary, 'utf8'));
    baseSurvived = s.survived;
    T.ok('baseline summary parses and names step ep-tip-alignstep',
      s.step === BASELINE_STEP, 'step ' + s.step);
    T.ok('baseline survived is an integer 0..8',
      Number.isInteger(s.survived) && s.survived >= 0 && s.survived <= 8, 'survived ' + s.survived + '/8');
    T.ok('baseline corpus dir exists with 8 per-seed files',
      fs.existsSync(baseCorpus) &&
      fs.readdirSync(baseCorpus).filter(function (f) { return f.indexOf('.json') !== -1; }).length === 8,
      fs.existsSync(baseCorpus) ? fs.readdirSync(baseCorpus).length + ' files' : 'missing');
  }
  if (!fs.existsSync(subjSummary)) {
    T.ok('no subject summary exists for talignstep (no subject leg ran yet)',
      true, 'no subject summary');
  } else {
    const s = JSON.parse(fs.readFileSync(subjSummary, 'utf8'));
    subjSurvived = s.survived;
    T.ok('subject summary parses and names step talignstep',
      s.step === STEP, 'step ' + s.step);
    T.ok('subject survived is an integer 0..8',
      Number.isInteger(s.survived) && s.survived >= 0 && s.survived <= 8, 'survived ' + s.survived + '/8');
    T.ok('subject corpus dir exists with 8 per-seed files',
      fs.existsSync(subjCorpus) &&
      fs.readdirSync(subjCorpus).filter(function (f) { return f.indexOf('.json') !== -1; }).length === 8,
      fs.existsSync(subjCorpus) ? fs.readdirSync(subjCorpus).length + ' files' : 'missing');
  }
  if (fs.existsSync(EVIDENCE)) {
    const evText = fs.readFileSync(EVIDENCE, 'utf8');
    if (baseSurvived !== null) {
      const gate = gateStopVerdict(baseSurvived);
      T.ok('evidence records the baseline-gate verdict the mapping gives (' + gate + ')',
        gate === 'PROCEED' ? evText.indexOf('PROCEED') !== -1 || evText.indexOf('gate passes') !== -1
          : evText.indexOf('UNMEASURED-substrate') !== -1, 'gate ' + gate);
    } else {
      T.ok('evidence file, when present with no baseline yet, carries no verdict claim',
        evText.indexOf('UNMEASURED-substrate') === -1 || baseSurvived !== null, 'no premature verdict');
    }
    if (baseSurvived !== null && subjSurvived !== null) {
      const v = subjectVerdict(subjSurvived - baseSurvived);
      T.ok('evidence records the subject verdict the mapping gives (' + v + ')',
        evText.indexOf(v) !== -1, 'verdict ' + v);
    }
  } else {
    T.ok('evidence file not yet written (stage 1)',
      true, 'no evidence yet');
  }

  await T.done();
})().catch(function (e) {
  console.error(e);
  process.exit(1);
});
