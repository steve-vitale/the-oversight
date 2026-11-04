// approachbranch-analyze-20261104.js — branch split of the approachconf
// APPROACH-STEP class (arm sim-approachbranch-a, Loop B run
// fleshout-20261104T1326Z, axis scale-onramp).
//
// WHY: the approachconf analyzer (sim-approachconf-b) classifies a turn
// APPROACH-STEP from weakest-monster out-of-range + zero-tile move-only
// alone. It never records which policy branch issued the move. The
// approachfire replay proved that mislabels a whole class: the 99605
// seq-2 "approach loop" (14 steps to (0,7)) issues entirely from the
// FLEE branch (legacy walk to the nearest x-edge by a fighter below
// the 35% flee line), never from CLOSE THE DISTANCE. Any loop claim
// leaning on the unsplit class inherits that mislabel.
//
// This analyzer splits every old APPROACH-STEP turn by issuing branch,
// reconstructed from the policy's own precedence in
// scripts/policies/competent.js fight() plus the corpus turn record
// (turn.start.player.hp/maxHp, round, weakest-monster distance, move
// target, exposure monster waves). It is an INFERENCE from recorded
// state + policy source, not a direct recording — the corpus
// instrument records no branch. The inference rules, in order:
//
//   GATE-OFF corpus (policy 'competent', all COMPETENT_* gates off):
//     - hpPct < 0.35 at turn start -> 'flee'. The mid-fight flee line
//       runs BEFORE CLOSE THE DISTANCE on every turn, and with the
//       gates off legacy flee() always returns true (no exit-verified
//       fallthrough, no directional hold, no flee repair): the move
//       cannot be approach-issued.
//     - round == 1 AND fight-start outmatched -> 'flee'. The
//       start-of-fight assessment (total monster maxHp > 2.5 * player
//       maxHp, or maxWave >= 2 with hpPct < 0.7, or hpPct < 0.5) runs
//       only on the fight's first fight() call (ctx._fightObj !== f)
//       and calls flee() before any approach code.
//     - otherwise -> 'approach' (CLOSE THE DISTANCE).
//   GATED corpus (any variant policy: directional flee, exit-verified
//   flee, flee repair, approach fallback):
//     - hpPct < 0.35, or round == 1 AND outmatched -> 'other'. A gated
//       flee() may return false in the SAME turn (directional hold at
//       the haven node, flee-repair unfleeable, exit-verified stuck
//       fallthrough) and fight() then falls through to CLOSE THE
//       DISTANCE — so the same recorded turn shape could be flee- or
//       approach-issued, and the corpus records neither the map node
//       nor the repair state needed to tell. 'other' is the honest
//       bucket, not a third mechanism.
//     - otherwise -> 'approach'. At hpPct >= 0.35 on a non-first turn,
//       no flee branch can pre-empt in these variants (DPS_RACE stays
//       OFF in both variant files; fight-assess is off by default),
//       so the move is approach-issued.
//   Turns whose old class is not 'approach' keep branch null; they were
//   never in the class being split (the instrument already classes
//   edge walks as 'flee-attempt', not 'move-only').
//
// CAVEATS (stated, not hidden):
//   - Single 'approach' turns could in principle be beast-trick moves:
//     beastTrickPlay runs before CLOSE THE DISTANCE and moves the
//     player (move_windup / move_x2 / sidestep / keep_distance).
//     Tricks are one-shot per monster per fight (move_x2 runs at most
//     2 consecutive rounds), so a run of >= 3 same-target approach
//     turns cannot be trick-issued. Loop-relevant runs are robust;
//     single turns are labelled approach-eligible, and the evidence
//     file says so wherever a single turn matters.
//   - 'approach' here means CLOSE THE DISTANCE issued the step. The
//     fallback's own blocked-branch steps (re-pick / wait) are not
//     corpus turns of this class: a re-pick step MOVES (not zero-tile)
//     and a wait is class 'wait', so neither enters the old class.
//   - TRUE-APPROACH LOOP redefines the confirm's loop on the split:
//     outcome 'fighter-died' AND strikesLanded == 0 AND max run of
//     consecutive branch-'approach' turns with the same target and
//     unchanged monster signature >= 4 (same threshold as the old
//     definition, now over true-approach turns only).
//
// Usage: require() from proof tests and the screen script. No writes.
'use strict';
const CONF = require('./approachconf-analyze-20261104');
const FALL = require('./approachfall-analyze-20261104');

function hpPctOf(turn) {
  const p = (turn.start || {}).player || {};
  const hp = (p.hp == null ? 0 : p.hp);
  const mx = Math.max(1, (p.maxHp == null ? 100 : p.maxHp));
  return hp / mx;
}

// Fight-start outmatched predicate, copied from competent.js fight()
// (the ctx._fightObj !== f block). Runs ONLY on round 1: the block is
// guarded by the first-call check, so a round >= 2 turn can never be
// outmatched-issued however lopsided the numbers look.
function fightStartOutmatched(ex, turn) {
  if (!turn || turn.round !== 1) return false;
  const st = turn.start || {};
  const p = st.player || {};
  const pct = hpPctOf(turn);
  const pmax = (p.maxHp == null ? 100 : p.maxHp);
  const waveByKey = {};
  for (const m of (ex.monsters || [])) waveByKey[m.key] = m.wave;
  const alive = (st.monsters || []).filter(function (m) { return m && m.alive; });
  if (!alive.length) return false;
  let total = 0, maxWave = 1;
  for (const m of alive) {
    total += (m.maxHp == null ? (m.hp || 0) : m.maxHp);
    const w = waveByKey[m.key];
    if (w != null && w > maxWave) maxWave = w;
  }
  if (maxWave === 1 && ex.wave != null) maxWave = Math.max(maxWave, ex.wave);
  return (total > 2.5 * pmax) || (maxWave >= 2 && pct < 0.7) || (pct < 0.5);
}

function classifyTurn(ex, rawTurn, oldRow, gated) {
  const hpPct = hpPctOf(rawTurn);
  const outmatched = fightStartOutmatched(ex, rawTurn);
  let branch = null, reason = null;
  if (oldRow.stepClass !== 'approach') {
    branch = null; reason = 'not-old-approach';
  } else if (!gated && hpPct < 0.35) {
    branch = 'flee'; reason = 'hp<0.35: mid-fight flee line pre-empts CLOSE THE DISTANCE; gate-off flee always returns true';
  } else if (!gated && outmatched) {
    branch = 'flee'; reason = 'round-1 outmatched: fight-start assessment calls flee() before approach';
  } else if (gated && (hpPct < 0.35 || outmatched)) {
    branch = 'other'; reason = 'gated flee may hold/repair-fallthrough to approach in the same turn; corpus records no map node or repair state';
  } else {
    branch = 'approach'; reason = 'no flee branch can pre-empt: hp>=0.35 and not a fight-start outmatched turn';
  }
  return { turnSeq: oldRow.turnSeq, round: rawTurn.round, hpPct: hpPct,
    target: oldRow.target, sig: oldRow.sig, oldClass: oldRow.stepClass,
    branch: branch, reason: reason, outmatched: outmatched };
}

function analyzeBranch(ex, opts) {
  const gated = !!(opts && opts.gated);
  const conf = CONF.analyzeConfirm(ex);
  const rawBySeq = {};
  for (const t of (ex.turns || [])) rawBySeq[t.turnSeq] = t;
  const detail = [];
  for (const row of conf.turnDetail) {
    const raw = rawBySeq[row.turnSeq] || {};
    detail.push(classifyTurn(ex, raw, row, gated));
  }
  const branchDetail = detail.filter(function (d) { return d.oldClass === 'approach'; });
  // True-approach runs: consecutive branch-'approach' turns, same target,
  // unchanged monster signature (same run definition as the old class).
  // Walk the whole detail in turn order: any non-approach turn breaks
  // the run, exactly as the old analyzer breaks on a non-approach row.
  let maxRun = 0, run = 0, prevTarget = null, prevSig = null;
  for (const d of detail) {
    if (d.branch === 'approach' && run > 0 && d.target === prevTarget && d.sig === prevSig) run++;
    else if (d.branch === 'approach') run = 1;
    else run = 0;
    if (d.branch === 'approach') { prevTarget = d.target; prevSig = d.sig; }
    else { prevTarget = null; prevSig = null; }
    if (run > maxRun) maxRun = run;
  }
  const count = function (b) { return branchDetail.filter(function (d) { return d.branch === b; }).length; };
  const isTrueLoop = (conf.outcome === 'fighter-died' && conf.strikesLanded === 0 && maxRun >= 4);
  return { seq: ex.seq, day: ex.day, mid: ex.mid, outcome: conf.outcome,
    strikesLanded: conf.strikesLanded, oldApproachTurns: conf.approachStepTurns,
    oldMaxRun: conf.maxSameStepRun, oldIsLoop: conf.isLoopFight,
    fleeTurns: count('flee'), approachTurns: count('approach'), otherTurns: count('other'),
    maxTrueApproachRun: maxRun, isTrueApproachLoop: isTrueLoop,
    turnDetail: detail };
}

// Post-mark true-approach turns: branch-'approach' turns AFTER the first
// 3-turn true-approach run has marked the fight (the fallback's mark
// point). These are the turns on which the fallback's blocked branch
// can first run in a replay — the firing substrate.
function postMarkApproachTurns(branchResult) {
  // Walk the FULL turn detail (not just old-approach rows): any
  // intervening turn breaks the run, matching the old run definition.
  // Note the policy subtlety this deliberately does NOT model: a
  // strike turn does not clear ctx._approachStuck, so the policy's
  // mark could survive a strike where this run breaks. Candidate
  // fights in this arm have no intervening turns, so the distinction
  // does not touch any number reported here.
  const rows = branchResult.turnDetail;
  let run = 0, prevTarget = null, prevSig = null, markedIdx = -1;
  for (let i = 0; i < rows.length; i++) {
    const d = rows[i];
    if (d.branch === 'approach' && run > 0 && d.target === prevTarget && d.sig === prevSig) run++;
    else if (d.branch === 'approach') run = 1;
    else run = 0;
    if (d.branch === 'approach') { prevTarget = d.target; prevSig = d.sig; }
    else { prevTarget = null; prevSig = null; }
    if (run >= 3 && markedIdx < 0) markedIdx = i;
  }
  if (markedIdx < 0) return [];
  return rows.slice(markedIdx + 1).filter(function (d) { return d.branch === 'approach'; });
}

function summarizeCorpus(dirPath) {
  const fs = require('fs');
  const path = require('path');
  const files = fs.readdirSync(dirPath).filter(function (f) { return f.slice(-5) === '.json'; }).sort();
  const perFight = [];
  const totals = { files: 0, old: 0, flee: 0, approach: 0, other: 0, trueLoops: 0, oldLoops: 0 };
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dirPath, f))); } catch (e) { continue; }
    totals.files++;
    const gated = d.policy !== 'competent';
    for (const ex of (d.exposures || [])) {
      let r;
      try { r = analyzeBranch(ex, { gated: gated }); } catch (e) { continue; }
      if (!r.oldApproachTurns) continue;
      totals.old += r.oldApproachTurns;
      totals.flee += r.fleeTurns;
      totals.approach += r.approachTurns;
      totals.other += r.otherTurns;
      if (r.isTrueApproachLoop) totals.trueLoops++;
      if (r.oldIsLoop) totals.oldLoops++;
      perFight.push({ file: f, policy: d.policy, run: d.run, seed: d.seed,
        seq: r.seq, day: r.day, mid: r.mid, outcome: r.outcome,
        strikesLanded: r.strikesLanded, old: r.oldApproachTurns,
        flee: r.fleeTurns, approach: r.approachTurns, other: r.otherTurns,
        oldMaxRun: r.oldMaxRun, maxTrueRun: r.maxTrueApproachRun,
        oldIsLoop: r.oldIsLoop, isTrueLoop: r.isTrueApproachLoop,
        postMark: postMarkApproachTurns(r).map(function (d2) {
          return { turnSeq: d2.turnSeq, round: d2.round, hpPct: d2.hpPct, target: d2.target };
        }),
        detail: r.turnDetail.filter(function (d2) { return d2.oldClass === 'approach'; }) });
    }
  }
  return { totals: totals, fights: perFight };
}

module.exports = { hpPctOf: hpPctOf, fightStartOutmatched: fightStartOutmatched,
  classifyTurn: classifyTurn, analyzeBranch: analyzeBranch,
  postMarkApproachTurns: postMarkApproachTurns, summarizeCorpus: summarizeCorpus,
  monsterSig: FALL.monsterSig };
