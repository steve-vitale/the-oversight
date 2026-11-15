#!/usr/bin/env node
// test-transplant7redef-match.js — proof test for the H1 TRANSPLANT,
// REDEFINED family-7 ablation, MATCHED-band rerun (arm
// sim-transplant7redef-match-a).
//
// THE QUESTION (evidence/2026-11-15/sim-transplant7redef-match-prereg.md,
// committed before cutting the subject or running any judged sim): does
// the brain-side align behavior alone — the CURRENT vbrainAlignObjective
// step on master-tip substrate, DUTY/ASSIGN branches included — collapse
// survival? The 1215Z arm's fresh-band route is CLOSED (baseline 3/8,
// gate STOP); this arm reruns the same ablation on the MATCHED band
// 190391-190398, where the merge reads collapsed 1/8 — the remaining
// measurement route, authorized by the 1415Z coordinator decision (1).
// The ablation is unchanged: remove the finishLottery call — the single
// game-code call site — so the align effect is fully gone in every
// branch with a -5/+0 diff.
//
// WHAT THIS TEST PROVES:
//   1. Family identity — merge 23245d5d6, its parents, the 1-commit
//      second-parent side, the exact 2 src/js files, +75/-10
//      (villager-brain.js 59 / villager-objectives.js 26 changed
//      lines), no policy file, far-end standing 75762cb2, fix
//      f8fda429, merge NOT an ancestor of the far end, IS an ancestor
//      of master tip b4343ac9d.
//   2. Ablation definition — the CURRENT align function is
//      villager-brain.js:892-1006 (115 lines, 4 branches inventoried);
//      the single game-code caller is finishLottery
//      (villager-objectives.js:682-683); the ablation is exactly the 5
//      removed lines (-5/+0, one file), listed verbatim and matched
//      against the live base source; the rejected stub/delete forms
//      are named with reasons.
//   3. Mechanism analysis — the guarded call is present at the base;
//      the align definition is present; finishLottery routes all 6
//      objPick returns; the commit is still written by
//      vbrainScorePick; vbrainExecuteDepart is untouched (agency still
//      honors the commitment — a separate mechanism).
//   4. Verdict mapping — classifyDelta maps every subject-minus-
//      baseline delta (≥+2 CARRIER / ±1 NOT-CARRIER / ≤-2 INVERTED);
//      gateStopVerdict maps the BASELINE GATE with 7brain polarity
//      (baseline 0-2/8 PROCEED / ≥3/8 STOP-UNMEASURED); sniffVerdict
//      maps the band-health pre-check (all 4 sniff seeds dead before
//      day 30 -> INVESTIGATE, else PROCEED-TO-BASELINE).
//   5. Base state — HEAD is on the arm branch, the base tip is an
//      ancestor of HEAD (rebase-tolerant: no "commits above the tip
//      are all arm work" leg — that leg goes stale on rebase, 7brain
//      56/57 precedent), the prereg names the run id + band, no src/js
//      file differs from HEAD, on-disk standing.js is byte-identical
//      to HEAD, only arm files are uncommitted, step tooling is present
//      (driver + shared analyzer + instrument on master, redefined
//      analyzer + step script on the arm branch), the step script
//      carries the finding-#2381 restore fix.
//   6. Seed-band identity — MATCHED band 190391-190398, step ids
//      ep-tip-7redef-match-sniff / ep-tip-7redef-match / t7redef-match,
//      subject branch transplant-7redef-subject, matched-reuse search
//      recorded (per-seed prereg hits 92/14/19/12/15/14/11/92, corpora
//      across dozens of arms, no forbidden list) — authorized by the
//      1415Z coordinator decision, not a freshness failure.
//   7. Family-test legs (live) — the align script runs on the baseline
//      tree: all 4 cases fire on their pinned seeds and show
//      align-ACTIVE polarity (materialize === expectAlignKind,
//      atCore false); the honesty test runs whole on the baseline
//      (exit 0, pass:true).
//   8. Live subject state — STAGE-1 branch: no subject branch exists
//      yet. After the cut: one commit, diff exactly the ablation set
//      (-5/+0, one file, removed lines byte-identical, no other game
//      file touched, policy + standing == base, brain file untouched),
//      and the align script run live on a /tmp pathspec extract of the
//      subject shows align-INERT polarity on all 4 cases (materialize
//      === corePick) while the commit still carries the override; the
//      honesty test on the subject extract fails with materialize≠
//      commit (the pre-registered expected polarity).
//   9. Step corpora — stage-aware with GUARDED reads (the §10 crash
//      fix from the 1116Z note: a missing summary is reported, never
//      an uncaught ENOENT). STAGE-1 branch: no summaries exist.
//      Intermediate branch: baseline summary exists, subject summary
//      missing (reported, not crashed). Final branch: both exist, the
//      baseline gate is judged, the subject-minus-baseline delta is
//      judged, corpora hold 8 files each, per-seed rows carry the
//      right anchors + fix + policy, instrument errors are 0, and the
//      evidence file records the verdict. The intermediate-state leg
//      is FIXED vs the 1215Z proof: a gate-STOP terminal state is a
//      legitimate end state, not a failed intermediate.
//
// Usage: node scripts/test-transplant7redef-match.js
// Exit 0 = pass, 1 = fail. No repo writes (the /tmp subject extract
// is created under /tmp and removed before the proof exits).
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const K = require('./godpath/lib');
const T = K.reporter('transplant7redef-match');

const REPO = path.join(__dirname, '..');
const ARM_BRANCH = 'sim-transplant7redef-match-a';
const BASE = 'b4343ac9d';
const BASE_FULL = 'b4343ac9da902370ffc44f58423e6e83c9dbfe23';
const MASTER_TIP_NOW = 'b4343ac9d';
const MASTER_TIP_NOW_FULL = 'b4343ac9da902370ffc44f58423e6e83c9dbfe23';
const FAR = '203a32775';
const FAR_FULL = '203a327750a223e0a1465dc51f5409787efdfaae';
const MERGE = '23245d5d6';
const MERGE_FULL = '23245d5d6d91b4b5284e2f503345dcfd1621ff0c';
const MERGE_BASE = '7041e1bfb';
const SECOND_FULL = 'a038cf1513c2eaee2e6ab97c9550369467910b50';
const SUBJECT_BRANCH = 'transplant-7redef-subject';
const BASELINE_STEP = 'ep-tip-7redef-match';
const SNIFF_STEP = 'ep-tip-7redef-match-sniff';
const SUBJECT_STEP = 't7redef-match';
const FIX_SHA = 'f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078';
const FIX_SHORT = 'f8fda4295a99';
const NATIVE_STANDING_SHA = 'f935997640a0c1df1a1eb52d91172c7bc49cc2b9ab58fe9d77f58a17839388e9';
const POLICY_SHA = '74a890f0844ebc19fce2ac24da360f114b1f366fdb33a185a122f891dc2f0456';
const POLICY_SHORT = '74a890f0844e';
const SEEDS = [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398];
const SNIFF_SEEDS = [190391, 190392, 190393, 190394];
const PREREG = path.join(REPO, 'evidence', '2026-11-15', 'sim-transplant7redef-match-prereg.md');
const EVIDENCE = path.join(REPO, 'evidence', '2026-11-15', 'sim-transplant7redef-match.md');
const ALIGN_SCRIPT = 'scripts/test-transplant7redef-align.js';
const HONESTY_TEST = 'scripts/test-dawn-materialize-honesty.js';
// The CURRENT align function at the base (villager-brain.js:892-1006).
const ALIGN_START_LINE = 892;
const ALIGN_END_LINE = 1006;
// Pinned align-test cases (prereg §Family-test leg): seed, vid, override,
// core pick, and the kind align maps the override onto.
const ALIGN_CASES = [
  { kase: 'gear_hold', seed: 20261109, vid: 'gen_2ut3alf', override: 'win_plan:gear_hold', corePick: 'VISIT', expectAlignKind: 'HAVEN_CHORE', commitChore: 'repair' },
  { kase: 'expedition', seed: 20261109, vid: 'diana_osei', override: 'expedition_hash', corePick: 'HAVEN_CHORE', expectAlignKind: 'EXPEDITION', commitChore: null },
  { kase: 'duty', seed: 20261108, vid: 'gen_wco817u', override: 'duty_top_score', corePick: 'HAVEN_CHORE', expectAlignKind: 'FORAGE', commitChore: null },
  { kase: 'assign', seed: 20261108, vid: 'gen_wco817u', override: 'assign_standing', corePick: 'HAVEN_CHORE', expectAlignKind: 'FORAGE', commitChore: null },
];
// The ablation set: exactly these 5 lines removed from finishLottery
// (villager-objectives.js:681-685), 0 added. Listed in source order;
// comparisons sort both sides.
const ABLATION_REMOVED = [
  '        try {',
  "          if (typeof this.vbrainAlignObjective === 'function') {",
  '            return this.vbrainAlignObjective(vid, obj, hx, hy) || obj;',
  '          }',
  '        } catch (e) {}',
];
const FINISHLOTTERY_BLOCK = [
  '      var finishLottery = function (obj) {',
  '        try {',
  "          if (typeof this.vbrainAlignObjective === 'function') {",
  '            return this.vbrainAlignObjective(vid, obj, hx, hy) || obj;',
  '          }',
  '        } catch (e) {}',
  '        return obj;',
  '      }.bind(this);',
];
const ARM_FILES = [
  'evidence/2026-11-15/sim-transplant7redef-match-prereg.md',
  'evidence/2026-11-15/sim-transplant7redef-match.md',
  'scripts/test-transplant7redef-match.js',
  'scripts/test-transplant7redef-align.js',
  'scripts/transplant7redef-analyze.js',
  'scripts/transplant7redef-step.sh',
];

function sha256(text) { return crypto.createHash('sha256').update(text).digest('hex'); }
function git(args) {
  return execSync('git ' + args, { cwd: REPO, stdio: 'pipe' }).toString().trim();
}
function gitOk(args) {
  try { execSync('git ' + args, { cwd: REPO, stdio: 'pipe' }); return true; }
  catch (e) { return false; }
}
function gitShow(commit, file) {
  return execSync('git show ' + commit + ':' + file, { cwd: REPO, stdio: 'pipe' }).toString();
}
function isAncestor(a, b) {
  try { execSync('git merge-base --is-ancestor ' + a + ' ' + b, { cwd: REPO, stdio: 'pipe' }); return true; }
  catch (e) { return false; }
}
// classifyDelta(subjectN, baselineN): the transplant verdict mapping
// (7brain delta form, confirmed against the culpritbisect prereg).
function classifyDelta(subjectN, baselineN) {
  if (typeof subjectN !== 'number' || !Number.isFinite(subjectN) || subjectN < 0 || subjectN > 8) return 'UNCLASSIFIABLE';
  if (typeof baselineN !== 'number' || !Number.isFinite(baselineN) || baselineN < 0 || baselineN > 8) return 'UNCLASSIFIABLE';
  const d = subjectN - baselineN;
  if (d >= 2) return 'CARRIER';
  if (d <= -2) return 'INVERTED';
  return 'NOT-CARRIER';
}
// gateStopVerdict(baselineN): the BASELINE GATE with 7brain polarity —
// the question is live ONLY in the collapsed regime.
function gateStopVerdict(baselineN) {
  if (typeof baselineN !== 'number' || !Number.isFinite(baselineN) || baselineN < 0 || baselineN > 8) return 'UNCLASSIFIABLE';
  if (baselineN >= 3) return 'STOP-UNMEASURED';
  return 'PROCEED';
}
// sniffVerdict(perSeed): the band-health pre-check — catastrophic only
// when ALL sniff seeds die before day 30.
function sniffVerdict(perSeed) {
  if (!Array.isArray(perSeed) || perSeed.length === 0) return 'UNCLASSIFIABLE';
  if (perSeed.some(function (r) { return typeof r.days !== 'number'; })) return 'UNCLASSIFIABLE';
  if (perSeed.every(function (r) { return r.days < 30; })) return 'INVESTIGATE';
  return 'PROCEED-TO-BASELINE';
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
// WITHOUT throwing on nonzero exit (the honesty test's expected subject
// failure is exit 1, and the align script's skip is exit 2).
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
// readSummaryIfExists(path): the §10 crash fix — a missing summary is a
// null, never an uncaught ENOENT. The caller branches on the stage.
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

  // ---- 1. Family identity ----
  T.section('1. Family identity — PR #30 merge 23245d5d6');
  T.ok('merge 23245d5d6 full sha is 23245d5d6d91b4b5284e2f503345dcfd1621ff0c',
    git('rev-parse ' + MERGE) === MERGE_FULL, git('rev-parse --short ' + MERGE));
  T.ok('merge first parent is 7041e1bfb',
    git('rev-parse ' + MERGE + '^1').indexOf(MERGE_BASE) === 0, git('rev-parse --short ' + MERGE + '^1'));
  T.ok('merge second parent is a038cf151 (1 commit, second-parent side)',
    git('rev-parse ' + MERGE + '^2') === SECOND_FULL, git('rev-parse --short ' + MERGE + '^2'));
  T.ok('merge second-parent side is exactly 1 commit',
    parseInt(git('rev-list --count ' + MERGE + '^1..' + MERGE + '^2'), 10) === 1, 'count=1');
  const famStat = git('diff --stat ' + MERGE + '^1 ' + MERGE);
  T.ok('merge touches 6 files',
    parseInt(git('diff --numstat ' + MERGE + '^1 ' + MERGE).split('\n').length, 10) === 6, '6 files');
  const famNum = git('diff --numstat ' + MERGE + '^1 ' + MERGE);
  T.ok('merge src/js is exactly villager-brain.js 56+/3- and villager-objectives.js 19+/7-',
    famNum.indexOf('56\t3\tsrc/js/villager-brain.js') !== -1 && famNum.indexOf('19\t7\tsrc/js/villager-objectives.js') !== -1, famNum.replace(/\n/g, ' | '));
  T.ok('merge touches no scripts/policies file',
    famNum.indexOf('scripts/policies/') === -1, 'pol=0');
  T.ok('merge is NOT an ancestor of the far end 203a32775',
    !isAncestor(MERGE, FAR), 'not ancestor of far end');
  T.ok('merge IS an ancestor of master tip b4343ac9d',
    isAncestor(MERGE, MASTER_TIP_NOW), 'ancestor of tip');
  T.ok('base b4343ac9d IS the master tip at run start',
    git('rev-parse master') === BASE_FULL, git('rev-parse --short master'));
  T.ok('diff base..tip is empty (base IS the tip — no rebase owed at adoption)',
    git('diff --name-only ' + BASE + ' ' + MASTER_TIP_NOW) === '', 'empty diff');

  // ---- 2. Ablation definition ----
  T.section('2. Ablation definition — CURRENT align function + the 5-line call removal');
  const baseBrain = gitShow(BASE, 'src/js/villager-brain.js');
  const baseBrainLines = baseBrain.split('\n');
  T.ok('CURRENT align function starts at villager-brain.js:892',
    baseBrainLines[ALIGN_START_LINE - 1] === '    vbrainAlignObjective: function (vid, o, hx, hy) {', baseBrainLines[ALIGN_START_LINE - 1]);
  T.ok('CURRENT align function ends at villager-brain.js:1006',
    baseBrainLines[ALIGN_END_LINE - 1] === '    },', baseBrainLines[ALIGN_END_LINE - 1]);
  T.ok('CURRENT align function is 115 lines (892-1006)',
    (ALIGN_END_LINE - ALIGN_START_LINE + 1) === 115, '115 lines');
  const alignText = baseBrainLines.slice(ALIGN_START_LINE - 1, ALIGN_END_LINE).join('\n');
  T.ok('align branch 1 (win-plan holds) present',
    alignText.indexOf('Win-plan holds') !== -1, 'win-plan holds');
  T.ok('align branch 2 (EXPEDITION hash/party_launch) present',
    alignText.indexOf('EXPEDITION (hash or party_launch)') !== -1, 'EXPEDITION branch');
  T.ok('align branch 3 (DUTY top-score / ASSIGN standing) present',
    alignText.indexOf('DUTY top-score / ASSIGN standing') !== -1, 'DUTY/ASSIGN branch');
  T.ok('align branch 4 (any-other-override fallthrough) present',
    alignText.indexOf('Any other aimed override') !== -1, 'fallthrough');
  T.ok('align function calls no Math.random at runtime (hash only; one comment mentions it)',
    alignText.indexOf('Math.random(') === -1, 'no Math.random( call');
  T.ok('align function uses dawnHashRoll facing (no new draws)',
    alignText.indexOf('dawnHashRoll') !== -1, 'dawnHashRoll present');
  const baseObj = gitShow(BASE, 'src/js/villager-objectives.js');
  const baseObjLines = baseObj.split('\n');
  const finishBlock = baseObjLines.slice(679, 687);
  T.ok('finishLottery block at villager-objectives.js:680-687 is exactly the prereg text',
    JSON.stringify(finishBlock) === JSON.stringify(FINISHLOTTERY_BLOCK), finishBlock.join(' | '));
  const callSites = (baseObj.match(/this\.vbrainAlignObjective\(vid, obj, hx, hy\)/g) || []).length;
  T.ok('villager-objectives.js calls vbrainAlignObjective exactly once (the finishLottery call)',
    callSites === 1, 'calls=' + callSites);
  T.ok('the typeof guard for the call appears exactly once',
    (baseObj.match(/typeof this\.vbrainAlignObjective === 'function'/g) || []).length === 1, 'guards=1');
  const brainCallRefs = (baseBrain.match(/vbrainAlignObjective\(vid, o, hx, hy\)/g) || []).length;
  T.ok('the ONLY game-code call of vbrainAlignObjective is finishLottery :682-683 (the one brain-file match is the provides header comment)',
    brainCallRefs === 1 && baseBrainLines[7].indexOf('vbrainAlignObjective(vid, o, hx, hy)') !== -1 &&
    baseObj.indexOf("if (typeof this.vbrainAlignObjective === 'function')") !== -1, 'header comment only');
  T.ok('finishLottery is the routing for objPick returns (6 call sites)',
    (baseObj.match(/return finishLottery\(o\);/g) || []).length === 6, '6 returns');
  T.ok('prereg names the ablation form (REMOVE THE CALL) and rejects stub/delete with reasons',
    prereg.indexOf('REMOVE THE CALL') !== -1 && prereg.indexOf('Rejected forms') !== -1 && prereg.indexOf('stubbing the body') !== -1 && prereg.indexOf('deleting the function') !== -1, 'form + rejections recorded');
  T.ok('prereg records the ablation as exactly -5/+0, one file',
    preregFlat.indexOf('EXACTLY this hunk: one file') !== -1 && preregFlat.indexOf('−5/+0') !== -1, '-5/+0 one file');

  // ---- 3. Mechanism analysis ----
  T.section('3. Mechanism analysis — guard, definition, commit, depart');
  T.ok('finishLottery guard (typeof === function) present at base',
    baseObj.indexOf("if (typeof this.vbrainAlignObjective === 'function')") !== -1, 'guard present');
  T.ok('align definition present at base',
    baseBrain.indexOf('vbrainAlignObjective: function (vid, o, hx, hy) {') !== -1, 'definition present');
  T.ok('vbrainScorePick writes the commit (writeCommit call present)',
    baseBrain.indexOf('writeCommit(this, vid, Object.assign({}, logged') !== -1, 'commit written');
  T.ok('vbrainExecuteDepart honors the commitment (separate mechanism, untouched)',
    baseBrain.indexOf('vbrainExecuteDepart: function (vid, hx, hy, announce)') !== -1, 'depart present');
  T.ok('DUTY practiceTask stamp lives inside the align DUTY branch (consequence, not a separate change)',
    alignText.indexOf("o.practiceTask = dutyTask") !== -1, 'OVE-74 stamp inside align');
  T.ok('prereg mechanism analysis states the pick/commit/log are identical up to the align rewrite',
    preregFlat.indexOf('pick, commit, and log are identical') !== -1, 'identity up to align');

  // ---- 4. Verdict mapping ----
  T.section('4. Verdict mapping — delta, gate, sniff');
  const deltaCases = [[8, 0, 'CARRIER'], [5, 3, 'CARRIER'], [4, 2, 'CARRIER'], [2, 0, 'CARRIER'], [3, 2, 'NOT-CARRIER'], [4, 4, 'NOT-CARRIER'], [1, 2, 'NOT-CARRIER'], [0, 1, 'NOT-CARRIER'], [0, 2, 'INVERTED'], [1, 4, 'INVERTED'], [0, 8, 'INVERTED']];
  T.ok('classifyDelta maps every subject-minus-baseline delta',
    deltaCases.every(function (c) { return classifyDelta(c[0], c[1]) === c[2]; }), deltaCases.map(function (c) { return c[0] + '-' + c[1] + '=' + classifyDelta(c[0], c[1]); }).join(', '));
  T.ok('classifyDelta rejects non-counts as UNCLASSIFIABLE',
    classifyDelta(9, 0) === 'UNCLASSIFIABLE' && classifyDelta(4, -1) === 'UNCLASSIFIABLE' && classifyDelta('4', 0) === 'UNCLASSIFIABLE', 'rejects 9/-1/string');
  T.ok('gateStopVerdict: baseline 0-2 PROCEED, >=3 STOP-UNMEASURED (7brain polarity)',
    [0, 1, 2].every(function (n) { return gateStopVerdict(n) === 'PROCEED'; }) &&
    [3, 4, 8].every(function (n) { return gateStopVerdict(n) === 'STOP-UNMEASURED'; }), '0-2 PROCEED / 3+ STOP');
  T.ok('gateStopVerdict rejects non-counts as UNCLASSIFIABLE',
    gateStopVerdict(9) === 'UNCLASSIFIABLE' && gateStopVerdict(-1) === 'UNCLASSIFIABLE', 'rejects 9/-1');
  T.ok('sniffVerdict: all 4 sniff seeds dead before day 30 -> INVESTIGATE',
    sniffVerdict([{ days: 12 }, { days: 25 }, { days: 29 }, { days: 5 }]) === 'INVESTIGATE', 'all <30 INVESTIGATE');
  T.ok('sniffVerdict: any sniff seed at day 30+ -> PROCEED-TO-BASELINE',
    sniffVerdict([{ days: 12 }, { days: 43 }, { days: 29 }, { days: 5 }]) === 'PROCEED-TO-BASELINE', 'one 43d PROCEED');
  T.ok('sniffVerdict: empty/non-numeric -> UNCLASSIFIABLE',
    sniffVerdict([]) === 'UNCLASSIFIABLE' && sniffVerdict([{ days: 'x' }]) === 'UNCLASSIFIABLE', 'rejects empty/bad');
  T.ok('prereg states the gate as a RANGE (0-2 PROCEED / >=3 STOP) with the 7b polarity contrast',
    preregFlat.indexOf('baseline survived 0–2/8 → PROCEED') !== -1 && preregFlat.indexOf('opposite polarity from 7b') !== -1, 'range + contrast recorded');
  T.ok('prereg states the delta mapping (not the 8c count mapping) with the reason',
    preregFlat.indexOf('delta form is the applicable one here') !== -1, 'delta form justified');

  // ---- 5. Base state ----
  T.section('5. Base state — arm branch at base, only arm files uncommitted');
  T.ok('HEAD is on the arm branch sim-transplant7redef-match-a',
    git('branch --show-current') === ARM_BRANCH, git('branch --show-current'));
  T.ok('arm branch is based on master b4343ac9d (base is an ancestor of HEAD)',
    isAncestor(BASE, 'HEAD'), 'base ancestor of HEAD');
  T.ok('master tip b4343ac9d is an ancestor of HEAD or HEAD is its ancestor (rebase-tolerant)',
    isAncestor(MASTER_TIP_NOW, 'HEAD') || isAncestor('HEAD', MASTER_TIP_NOW), 'tip/HEAD related');
  T.ok('prereg exists on disk and names the run id fleshout-20261115T1515Z',
    prereg.indexOf('fleshout-20261115T1515Z') !== -1, 'run id present');
  T.ok('prereg names the matched band 190391-190398',
    prereg.indexOf('190391') !== -1 && prereg.indexOf('190398') !== -1, 'band present');
  T.ok('no src/js file differs from HEAD',
    git('status --porcelain -- src/js') === '', 'src/js clean');
  T.ok('on-disk standing.js is byte-identical to HEAD',
    sha256(fs.readFileSync(path.join(REPO, 'src', 'js', 'standing.js'), 'utf8')) === sha256(gitShow('HEAD', 'src/js/standing.js')), 'standing == HEAD');
  // Porcelain lines are XY + space + path; use the RAW output (git()
  // trims, which eats the first line's leading status-space and shifts
  // a fixed slice by one).
  const rawStatus = execSync('git status --porcelain --untracked-files=no', { cwd: REPO, stdio: 'pipe' }).toString();
  const dirty = rawStatus.split('\n').filter(Boolean).map(function (ln) { return ln.slice(3); });
  T.ok('only the arm files may be uncommitted (prereg, proof, analyzer, step script, evidence)',
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
  T.ok('fix standing sha is f8fda429... (from 5157782a4)',
    sha256(gitShow('5157782a4', 'src/js/standing.js')) === FIX_SHA, 'fix sha verified');
  T.ok('native standing sha at base is f9359976...',
    sha256(gitShow(BASE, 'src/js/standing.js')) === NATIVE_STANDING_SHA, 'native sha verified');
  T.ok('policy sha at base is 74a890f0...',
    sha256(gitShow(BASE, 'scripts/policies/competent.js')) === POLICY_SHA, 'policy sha verified');

  // ---- 6. Seed-band identity ----
  T.section('6. Seed-band identity — MATCHED band 190391-190398 (deliberate reuse, authorized)');
  T.ok('step ids are ep-tip-7redef-match-sniff (sniff), ep-tip-7redef-match (baseline), t7redef-match (subject)',
    SNIFF_STEP === 'ep-tip-7redef-match-sniff' && BASELINE_STEP === 'ep-tip-7redef-match' && SUBJECT_STEP === 't7redef-match', SNIFF_STEP + ' / ' + BASELINE_STEP + ' / ' + SUBJECT_STEP);
  T.ok('subject branch name is transplant-7redef-subject',
    SUBJECT_BRANCH === 'transplant-7redef-subject', SUBJECT_BRANCH);
  T.ok('matched band is exactly 190391-190398 (8 seeds)',
    JSON.stringify(SEEDS) === JSON.stringify([190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398]), SEEDS.join(','));
  T.ok('sniff seeds are the first 4 of the matched band',
    JSON.stringify(SNIFF_SEEDS) === JSON.stringify([190391, 190392, 190393, 190394]), SNIFF_SEEDS.join(','));
  T.ok('prereg records the band as MATCHED (not fresh) with the 1415Z authorizing decision',
    prereg.indexOf('MATCHED') !== -1 && prereg.indexOf('190391–190398') !== -1 &&
    prereg.indexOf('1415Z coordinator decision') !== -1, 'MATCHED + authorization recorded');
  T.ok('prereg records the per-seed prereg hit counts (92/14/19/12/15/14/11/92 — expected matched reuse, not a collision)',
    prereg.indexOf('190391: 92 prereg hits') !== -1 && prereg.indexOf('190398: 92') !== -1 &&
    prereg.indexOf('190397: 11') !== -1, 'hit counts recorded');
  T.ok('prereg states the hits are deliberate authorized reuse, not contamination',
    preregFlat.indexOf('NOT a collision') !== -1 && preregFlat.indexOf('DELIBERATE and authorized') !== -1, 'reuse authorized, not a collision');
  T.ok('prereg records no forbidden-list reservation bars the band',
    preregFlat.indexOf('no file named *forbidden* exists') !== -1, 'no forbidden list');
  T.ok('prereg records the CASCADE guard caveat on the matched-band expectation',
    preregFlat.indexOf('CASCADE guard') !== -1 && preregFlat.indexOf('PRE-GUARD expectation') !== -1, 'guard caveat recorded');
  T.ok('step script defaults SEEDS to the fresh band (the match run passes the matched band in the env)',
    fs.readFileSync(path.join(REPO, 'scripts', 'transplant7redef-step.sh'), 'utf8')
      .indexOf('SEEDS="${SEEDS:-190581,190582,190583,190584,190585,190586,190587,190588}"') !== -1, 'SEEDS default present');
  T.ok('prereg records the matched-band SEEDS env invocation',
    prereg.indexOf('SEEDS=190391,190392,190393,190394,190395,190396,190397,190398') !== -1, 'SEEDS env recorded');
  T.ok('analyzer takes SEEDS from the environment (no hardcoded matched band)',
    fs.readFileSync(path.join(REPO, 'scripts', 'transplant7redef-analyze.js'), 'utf8')
      .indexOf("process.env.SEEDS") !== -1, 'SEEDS from env');

  // ---- 7. Family-test legs (live, baseline tree) ----
  T.section('7. Family-test legs — align ACTIVE on the baseline tree (all 4 cases)');
  for (const c of ALIGN_CASES) {
    const r = runNode(ALIGN_SCRIPT + ' --case=' + c.kase + ' --seed=' + c.seed);
    const j = parseLastJson(r.out);
    T.ok(c.kase + ': align script exits 0 (override fired) on seed ' + c.seed,
      r.code === 0 && j !== null && j.pass === true, 'code=' + r.code + ' ' + (j ? j.vid || '' : r.out.slice(0, 80)));
    if (j !== null && j.pass === true) {
      T.ok(c.kase + ': firing vid is the pinned ' + c.vid,
        j.vid === c.vid, 'vid=' + j.vid);
      T.ok(c.kase + ': override is ' + c.override,
        j.override === c.override, 'override=' + j.override);
      T.ok(c.kase + ': core pick is ' + c.corePick,
        j.corePick === c.corePick, 'corePick=' + j.corePick);
      T.ok(c.kase + ': materialize is the align kind ' + c.expectAlignKind + ' (align ACTIVE)',
        j.materialize === c.expectAlignKind && j.aligned === true, 'materialize=' + j.materialize);
      T.ok(c.kase + ': materialize is NOT the core pick (atCore false)',
        j.atCore === false, 'atCore=' + j.atCore);
      T.ok(c.kase + ': commit still carries the override kind ' + (c.kase === 'duty' ? 'DUTY' : c.kase === 'assign' ? 'ASSIGN' : c.expectAlignKind),
        j.commitKind === (c.kase === 'duty' ? 'DUTY' : c.kase === 'assign' ? 'ASSIGN' : c.expectAlignKind), 'commitKind=' + j.commitKind);
      if (c.commitChore !== null) {
        T.ok(c.kase + ': chore reads the commit chore (' + c.commitChore + ')',
          j.chore === c.commitChore && j.choreIsCommitChore === true, 'chore=' + j.chore);
      }
      if (c.kase === 'duty') {
        T.ok('duty: dutyTask is forage', j.dutyTask === 'forage', 'dutyTask=' + j.dutyTask);
      }
      if (c.kase === 'assign') {
        T.ok('assign: assignTask is forage', j.assignTask === 'forage', 'assignTask=' + j.assignTask);
      }
    }
  }
  const honestBase = runNode(HONESTY_TEST);
  const honestBaseJson = parseLastJson(honestBase.out);
  T.ok('honesty test runs whole on the baseline (exit 0, pass:true, materialize==commit)',
    honestBase.code === 0 && honestBaseJson !== null && honestBaseJson.pass === true &&
    honestBaseJson.honest && honestBaseJson.honest.materialize === 'HAVEN_CHORE' &&
    honestBaseJson.honest.commit === 'HAVEN_CHORE',
    'code=' + honestBase.code + ' ' + (honestBaseJson ? JSON.stringify(honestBaseJson.honest) : honestBase.out.slice(0, 80)));

  // ---- 8. Live subject state ----
  T.section('8. Live subject state — subject branch + align INERT on the subject');
  const subjectExists = gitOk('show-ref --verify refs/heads/' + SUBJECT_BRANCH);
  if (!subjectExists) {
    T.ok('subject branch transplant-7redef-subject does NOT exist yet (stage 1)',
      true, 'no subject branch');
    T.ok('no subject commit exists (branch absent, so nothing to verify)',
      !gitOk('rev-parse ' + SUBJECT_BRANCH), 'no subject commit');
    T.ok('prereg orders the subject cut ONLY after the baseline gate passes',
      preregFlat.indexOf('ONLY after the baseline gate passes') !== -1, 'gate-first order recorded');
  } else {
    const subjFull = git('rev-parse ' + SUBJECT_BRANCH);
    T.ok('subject branch exists at ' + subjFull.slice(0, 12),
      subjFull.length === 40, subjFull.slice(0, 12));
    T.ok('subject branch carries exactly one commit on the arm branch',
      parseInt(git('rev-list --count ' + ARM_BRANCH + '..' + SUBJECT_BRANCH), 10) === 1, 'count=1');
    const subjNum = git('diff --numstat ' + SUBJECT_BRANCH + '^ ' + SUBJECT_BRANCH);
    T.ok('subject diff numstat is exactly -5/+0, one file (villager-objectives.js)',
      subjNum === '5\t0\tsrc/js/villager-objectives.js', subjNum.replace(/\n/g, ' | '));
    const subjDiff = execSync('git diff ' + SUBJECT_BRANCH + '^ ' + SUBJECT_BRANCH, { cwd: REPO, stdio: 'pipe' }).toString('utf8');
    const subjLines = allHunkLines(subjDiff);
    T.ok('subject diff removed lines are byte-identical to the ablation set (5/5)',
      JSON.stringify(subjLines.removed) === JSON.stringify(ABLATION_REMOVED.slice().sort()), subjLines.removed.join(' | '));
    T.ok('subject diff adds ZERO lines',
      subjLines.added.length === 0, 'added=' + subjLines.added.length);
    T.ok('subject diff touches no other file',
      git('diff --name-only ' + SUBJECT_BRANCH + '^ ' + SUBJECT_BRANCH) === 'src/js/villager-objectives.js', 'one file');
    T.ok('subject villager-brain.js is byte-identical to the base (untouched)',
      sha256(gitShow(SUBJECT_BRANCH, 'src/js/villager-brain.js')) === sha256(gitShow(BASE, 'src/js/villager-brain.js')), 'brain untouched');
    T.ok('subject policy sha equals the base policy sha (74a890f0...)',
      sha256(gitShow(SUBJECT_BRANCH, 'scripts/policies/competent.js')) === POLICY_SHA, 'policy == base');
    T.ok('subject native standing sha equals the base native standing sha (f9359976...)',
      sha256(gitShow(SUBJECT_BRANCH, 'src/js/standing.js')) === NATIVE_STANDING_SHA, 'standing == base');
    const subjObj = gitShow(SUBJECT_BRANCH, 'src/js/villager-objectives.js');
    T.ok('subject finishLottery no longer calls vbrainAlignObjective',
      subjObj.indexOf('vbrainAlignObjective') === -1, 'call gone');
    T.ok('subject finishLottery still returns obj (wrapper intact)',
      subjObj.indexOf('var finishLottery = function (obj) {') !== -1 && subjObj.indexOf('return obj;') !== -1, 'wrapper intact');
    // Live inert check on a /tmp pathspec extract of the subject.
    const extDir = '/tmp/t7redef-subj-' + subjFull.slice(0, 12);
    try {
      execSync('rm -rf ' + extDir + ' && mkdir -p ' + extDir, { cwd: REPO, stdio: 'pipe' });
      execSync('git archive ' + SUBJECT_BRANCH + ' src scripts index.html manifest.json sw.js build-source.json | tar -x -C ' + extDir, { cwd: REPO, stdio: 'pipe' });
      for (const c of ALIGN_CASES) {
        const r = runNode(ALIGN_SCRIPT + ' --case=' + c.kase + ' --seed=' + c.seed, extDir);
        const j = parseLastJson(r.out);
        T.ok('subject ' + c.kase + ': align script exits 0 (override fired) on seed ' + c.seed,
          r.code === 0 && j !== null && j.pass === true, 'code=' + r.code);
        if (j !== null && j.pass === true) {
          T.ok('subject ' + c.kase + ': firing vid is the pinned ' + c.vid,
            j.vid === c.vid, 'vid=' + j.vid);
          T.ok('subject ' + c.kase + ': override still fires (' + c.override + ') — commit unchanged',
            j.override === c.override, 'override=' + j.override);
          T.ok('subject ' + c.kase + ': materialize is the CORE pick ' + c.corePick + ' (align INERT)',
            j.materialize === c.corePick && j.atCore === true, 'materialize=' + j.materialize);
          T.ok('subject ' + c.kase + ': materialize is NOT the align kind (aligned false)',
            j.aligned === false, 'aligned=' + j.aligned);
          T.ok('subject ' + c.kase + ': commit still carries the override kind',
            j.commitKind === (c.kase === 'duty' ? 'DUTY' : c.kase === 'assign' ? 'ASSIGN' : c.expectAlignKind), 'commitKind=' + j.commitKind);
        }
      }
      const honestSubj = runNode(HONESTY_TEST, extDir);
      const honestSubjJson = parseLastJson(honestSubj.out);
      T.ok('honesty test on the subject extract FAILS with materialize≠commit (exit 1 — the pre-registered expected polarity)',
        honestSubj.code === 1 && honestSubjJson !== null && honestSubjJson.pass === false &&
        honestSubjJson.fail === 'materialize≠commit on conflict fixture',
        'code=' + honestSubj.code + ' fail=' + (honestSubjJson ? honestSubjJson.fail : honestSubj.out.slice(0, 80)));
    } finally {
      try { execSync('rm -rf ' + extDir, { cwd: REPO, stdio: 'pipe' }); } catch (e) {}
    }
    const evidenceText = fs.existsSync(EVIDENCE) ? fs.readFileSync(EVIDENCE, 'utf8') : '';
    T.ok('evidence file exists and records the subject commit ' + subjFull.slice(0, 12),
      evidenceText !== '' && evidenceText.indexOf(subjFull.slice(0, 12)) !== -1, EVIDENCE);
  }

  // ---- 9. Step corpora ----
  T.section('9. Step corpora — stage-aware, guarded reads (no ENOENT crash)');
  const sniffSummary = readSummaryIfExists(summaryPath(SNIFF_STEP));
  const baseSummary = readSummaryIfExists(summaryPath(BASELINE_STEP));
  const subjSummary = readSummaryIfExists(summaryPath(SUBJECT_STEP));
  const stage = !baseSummary && !subjSummary ? 'none' : (baseSummary && !subjSummary ? 'baseline-only' : (baseSummary && subjSummary ? 'both' : 'subject-only'));
  T.ok('corpus stage is one of none / baseline-only / both (never subject-only)',
    stage !== 'subject-only', 'stage=' + stage);
  if (stage === 'none') {
    T.ok('no sniff summary exists yet (stage 1)',
      sniffSummary === null, 'no sniff summary');
    T.ok('no baseline summary exists yet (stage 1)',
      baseSummary === null, 'no baseline summary');
    T.ok('no subject summary exists yet (stage 1)',
      subjSummary === null, 'no subject summary');
    T.ok('no baseline corpus dir exists yet (stage 1)',
      !fs.existsSync(corpusDir(BASELINE_STEP)), 'no baseline corpus');
    T.ok('no subject corpus dir exists yet (stage 1)',
      !fs.existsSync(corpusDir(SUBJECT_STEP)), 'no subject corpus');
  }
  if (sniffSummary !== null) {
    T.ok('sniff summary reads the first 4 matched seeds',
      JSON.stringify(sniffSummary.seeds) === JSON.stringify(SNIFF_SEEDS), 'seeds=' + sniffSummary.seeds.join(','));
    T.ok('sniff verdict is not INVESTIGATE (the run proceeded past the band-health pre-check)',
      sniffVerdict(sniffSummary.perSeed) !== 'INVESTIGATE', 'sniff=' + sniffVerdict(sniffSummary.perSeed));
    T.ok('sniff per-seed anchorCommit is the base ' + BASE,
      sniffSummary.perSeed.every(function (r) { return r.anchorCommit === BASE_FULL.slice(0, 12); }), '8/8... 4/4 rows base');
    T.ok('sniff rows carry the fix standing + base policy',
      sniffSummary.perSeed.every(function (r) { return r.standingFix === true && r.standingSha === FIX_SHORT && r.policySha === POLICY_SHORT; }), 'fix + policy');
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
    const gate = gateStopVerdict(baseSummary.survived);
    T.ok('baseline gate verdict is ' + gate + ' (survived ' + baseSummary.survived + '/8)',
      gate === 'PROCEED' || gate === 'STOP-UNMEASURED', 'gate=' + gate);
    if (gate === 'STOP-UNMEASURED') {
      T.ok('gate STOP: no subject branch exists (no subject leg was cut)',
        !subjectExists, 'no subject on gate STOP');
      T.ok('gate STOP: no subject summary exists',
        subjSummary === null, 'no subject summary');
    }
  }
  if (stage === 'baseline-only') {
    T.ok('INTERMEDIATE STATE: baseline summary exists, subject summary missing (reported, not crashed)',
      baseSummary !== null && subjSummary === null, 'baseline present, subject missing');
    // FIXED vs the 1215Z proof: a gate-STOP terminal state (baseline
    // summary present, no subject branch, no subject summary) is a
    // legitimate end state, not a failed intermediate — the 1215Z
    // proof's "baseline gate is PROCEED" leg contradicted its own
    // STOP handling and was adjudicated, not waived.
    T.ok('INTERMEDIATE STATE: baseline gate is PROCEED (subject leg follows) or STOP-UNMEASURED (terminal — the run ends here, no subject)',
      gateStopVerdict(baseSummary.survived) === 'PROCEED' || gateStopVerdict(baseSummary.survived) === 'STOP-UNMEASURED', 'gate=' + gateStopVerdict(baseSummary.survived));
  }
  if (stage === 'both') {
    T.ok('baseline gate is PROCEED (a STOP would have ended the run with no subject leg)',
      gateStopVerdict(baseSummary.survived) === 'PROCEED', 'gate PROCEED');
    T.ok('subject summary reads the matched band seeds',
      JSON.stringify(subjSummary.seeds) === JSON.stringify(SEEDS), 'seeds=' + subjSummary.seeds.join(','));
    T.ok('subject per-seed anchorCommit is the subject commit',
      (function () {
        const subjShort = git('rev-parse --short ' + SUBJECT_BRANCH);
        return subjSummary.perSeed.every(function (r) { return r.anchorCommit === subjShort; });
      })(), '8/8 rows subject');
    T.ok('subject rows carry the fix standing + base policy',
      subjSummary.perSeed.every(function (r) { return r.standingFix === true && r.standingSha === FIX_SHORT && r.policySha === POLICY_SHORT; }), 'fix + policy');
    T.ok('subject instrument errors are 0',
      subjSummary.instrumentErrors === 0, 'errors=' + subjSummary.instrumentErrors);
    const delta = classifyDelta(subjSummary.survived, baseSummary.survived);
    T.ok('transplant verdict is ' + delta + ' (subject ' + subjSummary.survived + '/8 minus baseline ' + baseSummary.survived + '/8)',
      delta === 'CARRIER' || delta === 'NOT-CARRIER' || delta === 'INVERTED', 'delta=' + delta);
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
    T.ok('evidence records the transplant verdict ' + delta,
      evidenceFlat.indexOf(delta) !== -1, 'verdict recorded');
    T.ok('evidence records the telemetry refusal (recorder-corpus, baseline NOT rolled)',
      evidenceFlat.indexOf('REFUSED') !== -1 && evidenceFlat.indexOf('baseline NOT rolled') !== -1, 'refusal recorded');
    T.ok('evidence carries a metric-review section',
      evidenceText.indexOf('Metric review') !== -1, 'metric review present');
  }

  await T.done();
})().catch(function (e) {
  console.error(e);
  process.exit(1);
});
