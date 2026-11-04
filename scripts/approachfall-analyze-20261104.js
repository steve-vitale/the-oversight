// approachfall-analyze-20261104.js — approach-loop analyzer (arm
// sim-approachfall-b, Loop B run fleshout-loop-b-20261104T1030Z).
// Pure functions over the fleerepair instrument's per-seed JSONs
// (same corpus shape: exposures with turns, actions, sayLines).
//
// Definitions (pre-registered in sim-approachfall-b-prereg.md):
// - FAILED-APPROACH TURN: turn class 'move-only' (tbfinish analyzer)
//   with >= 1 move action whose pre/post player pos is identical
//   (zero-tile move), AND out-of-range at turn start.
// - MOVE TARGET: the first move action's args (tbPlayerMove cx, cy).
// - MONSTER SIGNATURE: turn.start.monsters key:mx,my,alive joined.
//   A signature change between consecutive turns means the geometry
//   moved, so a same-tile run breaks even if the tile repeats.
// - SAME-STEP RUN: maximal run of consecutive failed-approach turns
//   with the same move target AND unchanged monster signature across
//   the run. A re-pick (different tile) or a wait turn breaks the run,
//   as does a monster move.
// - APPROACH-LOOP FIGHT: exposure outcome 'fighter-died' AND
//   strikesLanded == 0 AND max same-step run >= 4. The threshold is
//   4, not 3: the fallback tolerates 3 failed steps before it fires,
//   so a run of 4 proves the fallback did not break the loop.
//   (A fight that dies on the monster turn after exactly 3 failed
//   steps is a short fight, not a loop — the fallback never got its
//   turn.)
// A turn whose class cannot be read is an analyzer error, never folded.
'use strict';
const A = require('./fleerepair-analyze-20261104');

function monsterSig(turn) {
  try {
    const mons = ((turn.start || {}).monsters || []).filter(function (m) { return m; });
    return mons.map(function (m) {
      return (m.key || '?') + ':' + m.mx + ',' + m.my + ':' + (m.alive ? 'a' : 'd');
    }).sort().join('|');
  } catch (e) { return ''; }
}

function isFailedApproachTurn(ex, turn, summary) {
  if (!summary || summary.cls !== 'move-only') return false;
  const moves = (turn.actions || []).filter(function (a) { return a.kind === 'move'; });
  for (const a of moves) {
    if (a.pre && a.post && a.pre.player && a.post.player &&
        a.pre.player.mx === a.post.player.mx && a.pre.player.my === a.post.player.my) {
      if (summary.flags && summary.flags.outOfRangeAtStart) return true;
    }
  }
  return false;
}

function moveTarget(turn) {
  const moves = (turn.actions || []).filter(function (a) { return a.kind === 'move'; });
  if (!moves.length) return null;
  const args = moves[0].args || [];
  return args.slice(0, 2).join(',');
}

function analyzeApproach(ex) {
  const s = A.summarize(ex);
  const turns = s.turns || [];
  const rawTurns = ex.turns || [];
  const failedFlags = [];
  for (let i = 0; i < turns.length; i++) {
    const raw = rawTurns[i] || {};
    // Summaries and raw turns share order (both derive from ex.turns
    // in order); guard the pairing by turnSeq when present.
    let rt = raw;
    if (raw.turnSeq !== turns[i].turnSeq) {
      const found = rawTurns.filter(function (t) { return t.turnSeq === turns[i].turnSeq; })[0];
      if (found) rt = found;
    }
    const failed = isFailedApproachTurn(ex, rt, turns[i]);
    const noPathLines = ((rt.sayLines || []).filter(function (ln) {
      return String(ln).indexOf('No path there') >= 0;
    })).length;
    failedFlags.push({ turnSeq: turns[i].turnSeq, failed: failed,
      target: failed ? moveTarget(rt) : null, sig: monsterSig(rt),
      noPathLines: noPathLines, cls: turns[i].cls });
  }
  // Same-step runs over consecutive failed turns.
  let maxRun = 0, run = 0, prevTarget = null, prevSig = null;
  for (const f of failedFlags) {
    if (f.failed && run > 0 && f.target === prevTarget && f.sig === prevSig) { run++; }
    else if (f.failed) { run = 1; }
    else { run = 0; }
    if (f.failed) { prevTarget = f.target; prevSig = f.sig; }
    else { prevTarget = null; prevSig = null; }
    if (run > maxRun) maxRun = run;
  }
  const failedCount = failedFlags.filter(function (f) { return f.failed; }).length;
  const noPathTotal = failedFlags.reduce(function (n, f) { return n + f.noPathLines; }, 0);
  const waitTurns = turns.filter(function (t) { return t.cls === 'wait' || t.cls === 'move-wait'; }).length;
  const isLoop = (s.outcome === 'fighter-died' && s.strikesLanded === 0 && maxRun >= 4);
  return { seq: ex.seq, day: ex.day, mid: ex.mid, outcome: s.outcome,
    strikesLanded: s.strikesLanded, nTurns: turns.length,
    failedApproachTurns: failedCount, maxSameStepRun: maxRun,
    noPathLines: noPathTotal, waitTurns: waitTurns, isLoopFight: isLoop,
    turnDetail: failedFlags };
}

module.exports = { analyzeApproach: analyzeApproach, isFailedApproachTurn: isFailedApproachTurn,
  monsterSig: monsterSig, moveTarget: moveTarget,
  // Re-exported so summarizers written against the fleerepair analyzer
  // keep working (summarize = tbfinish turn-economy summary).
  summarize: A.summarize };
