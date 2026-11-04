// approachconf-analyze-20261104.js — approach-loop analyzer, CONFIRM version
// (arm sim-approachconf-b, Loop B run fleshout-loop-b-20261104T1212Z).
//
// Difference from the pilot analyzer (approachfall-analyze-20261104.js):
// the pilot classified a failed-approach turn with the CLOSEST monster's
// distance (tbfinish outOfRangeAtStart = minDist > range). The approach
// branch in competent.js keys on the WEAKEST monster (lowest hp alive),
// so a closest-monster predicate misclassifies whenever a nearer monster
// is in range while the weakest is out of range (and vice versa). This
// analyzer classifies every zero-tile move-only turn by the WEAKEST
// monster, and splits blocked steps into three reported classes:
//
//   APPROACH-STEP: weakest monster OUT OF RANGE at turn start.
//     This is the only class the CLOSE THE DISTANCE branch can produce:
//     the branch runs only when d0 (Chebyshev dist to weakest) > range.
//     (The issued step may be an intermediate path step, not the final
//     adjacent tile, so no adjacency requirement is imposed here.)
//   FLEE-WALK: weakest monster IN RANGE at turn start AND the move
//     target is NOT adjacent to the weakest monster. The approach branch
//     cannot run while the weakest is in range (it would strike), so
//     such a step is a flee-branch / edge walk, not an approach step.
//     This is the pilot's reclassification, stated exactly.
//   OTHER-BLOCKED: weakest IN RANGE and the target IS adjacent to the
//     weakest (a blocked step into/near the monster's own tile), or the
//     weakest distance / weapon range is unreadable (null). Reported
//     separately, counted in NEITHER the approach nor the flee class.
//
// Loop definition (unchanged from the pilot prereg, weakest-based now):
//   APPROACH-LOOP FIGHT: outcome 'fighter-died' AND strikesLanded == 0
//   AND max same-step run >= 4, where a same-step run is consecutive
//   APPROACH-STEP turns with the same move target AND unchanged monster
//   signature. Threshold 4, not 3: the fallback tolerates 3 failed steps
//   before it fires, so a run of 4 proves it did not break the loop.
//
// FALLBACK PROXY (no direct counter exists in the instrument): after a
// run of >= 3 same-target APPROACH-STEP turns (the mark point), a turn
// is fallback-consistent if it waits (fallback wait), moves to a
// different target (successful re-pick), or zero-tiles to a different
// target on unchanged geometry (re-pick attempt — the unblocked primary
// path is deterministic, so it cannot change target on its own).
// Counted as fallbackEvents / fightsWithFallback. This is a transcript
// proxy, NOT a policy counter: a failed re-pick that re-issues the same
// target, or a wait for an unrelated reason, can blur it in either
// direction. The evidence file must say so.
'use strict';
const A = require('./approachfall-analyze-20261104');

function monsterSig(turn) {
  return A.monsterSig(turn);
}

function weakestMonster(turn) {
  const mons = ((turn.start || {}).monsters || []).filter(function (m) { return m && m.alive; });
  if (!mons.length) return null;
  let w = mons[0];
  for (const m of mons) {
    if ((m.hp != null && w.hp != null && m.hp < w.hp)) w = m;
  }
  return w;
}

function weakestDist(turn, weakest) {
  if (!weakest) return null;
  const dists = (turn.start || {}).dists || [];
  const d = dists.filter(function (x) { return x && x.key === weakest.key; })[0];
  return d ? d.dist : null;
}

function moveTarget(turn) {
  return A.moveTarget(turn);
}

function isZeroTileMoveTurn(turn) {
  const moves = (turn.actions || []).filter(function (a) { return a.kind === 'move'; });
  for (const a of moves) {
    if (a.pre && a.post && a.pre.player && a.post.player &&
        a.pre.player.mx === a.post.player.mx && a.pre.player.my === a.post.player.my) return true;
  }
  return false;
}

function playerMoved(turn) {
  const moves = (turn.actions || []).filter(function (a) { return a.kind === 'move'; });
  for (const a of moves) {
    if (a.pre && a.post && a.pre.player && a.post.player &&
        (a.pre.player.mx !== a.post.player.mx || a.pre.player.my !== a.post.player.my)) return true;
  }
  return false;
}

function targetAdjacentToWeakest(target, weakest) {
  if (!target || !weakest || weakest.mx == null || weakest.my == null) return null;
  const parts = String(target).split(',');
  const cx = parseInt(parts[0], 10), cy = parseInt(parts[1], 10);
  if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null;
  return Math.max(Math.abs(cx - weakest.mx), Math.abs(cy - weakest.my)) <= 1;
}

function analyzeConfirm(ex) {
  const s = A.summarize(ex);
  const turns = s.turns || [];
  const rawTurns = ex.turns || [];
  const detail = [];
  for (let i = 0; i < turns.length; i++) {
    const raw = rawTurns[i] || {};
    let rt = raw;
    if (raw.turnSeq !== turns[i].turnSeq) {
      const found = rawTurns.filter(function (t) { return t.turnSeq === turns[i].turnSeq; })[0];
      if (found) rt = found;
    }
    const cls = turns[i].cls;
    const zero = isZeroTileMoveTurn(rt);
    // Target is recorded for EVERY move turn, not only zero-tile ones:
    // the fallback proxy must compare a successful re-pick's target
    // against the stuck target, and a moved turn has no zero-tile move.
    const target = moveTarget(rt);
    const weakest = weakestMonster(rt);
    const range = (rt.start && rt.start.weapon) ? rt.start.weapon.range : null;
    const wdist = weakestDist(rt, weakest);
    const inRange = (wdist != null && range != null) ? (wdist <= range) : null;
    const adj = targetAdjacentToWeakest(target, weakest);
    let stepClass = null;
    if (cls === 'move-only' && zero) {
      if (inRange === false) stepClass = 'approach';
      else if (inRange === true && adj === false) stepClass = 'flee-walk';
      else stepClass = 'other-blocked';
    }
    const noPathLines = ((rt.sayLines || []).filter(function (ln) {
      return String(ln).indexOf('No path there') >= 0;
    })).length;
    detail.push({ turnSeq: turns[i].turnSeq, cls: cls, stepClass: stepClass,
      target: target, sig: monsterSig(rt), weakestKey: weakest ? weakest.key : null,
      weakestDist: wdist, weaponRange: range, weakestInRange: inRange,
      targetAdjacentWeakest: adj, noPathLines: noPathLines,
      moved: playerMoved(rt) });
  }
  // Same-step runs over consecutive APPROACH-STEP turns.
  let maxRun = 0, run = 0, prevTarget = null, prevSig = null;
  for (const d of detail) {
    if (d.stepClass === 'approach' && run > 0 && d.target === prevTarget && d.sig === prevSig) run++;
    else if (d.stepClass === 'approach') run = 1;
    else run = 0;
    if (d.stepClass === 'approach') { prevTarget = d.target; prevSig = d.sig; }
    else { prevTarget = null; prevSig = null; }
    if (run > maxRun) maxRun = run;
  }
  // Fallback proxy: after a run of >= 3 same-target approach steps
  // (the mark point), a fallback-consistent turn is:
  //   - a wait / move-wait turn (fallback wait), or
  //   - a move turn to a DIFFERENT target (re-pick): moved = success,
  //     zero-tile = attempt. A zero-tile move to a different target
  //     with UNCHANGED geometry is itself the re-pick attempt: the
  //     unblocked primary path is deterministic (nearest adjacent tile
  //     from an unmoved player to an unmoved monster), so it cannot
  //     change target on its own. A geometry change (sig change) is
  //     NOT a re-pick — it is the policy's reset, and breaks the run.
  let fallbackEvents = 0;
  const fallbackKinds = [];
  let sameRun = 0, lastTarget = null, lastSig = null;
  for (const d of detail) {
    if (d.stepClass === 'approach') {
      if (sameRun >= 3 && d.target !== lastTarget && d.sig === lastSig) {
        fallbackEvents++; fallbackKinds.push('repick-attempt');
        sameRun = 1; lastTarget = d.target; lastSig = d.sig;
      } else if (d.target === lastTarget && d.sig === lastSig) {
        sameRun++;
      } else {
        sameRun = 1; lastTarget = d.target; lastSig = d.sig;
      }
      continue;
    }
    if (sameRun >= 3) {
      if (d.cls === 'wait' || d.cls === 'move-wait') {
        fallbackEvents++; fallbackKinds.push('wait');
      } else if (d.target != null && d.target !== lastTarget && d.moved) {
        fallbackEvents++; fallbackKinds.push('repick-moved');
      }
    }
    sameRun = 0; lastTarget = null; lastSig = null;
  }
  const approachTurns = detail.filter(function (d) { return d.stepClass === 'approach'; }).length;
  const fleeWalkTurns = detail.filter(function (d) { return d.stepClass === 'flee-walk'; }).length;
  const otherBlockedTurns = detail.filter(function (d) { return d.stepClass === 'other-blocked'; }).length;
  const noPathTotal = detail.reduce(function (n, d) { return n + d.noPathLines; }, 0);
  const waitTurns = turns.filter(function (t) { return t.cls === 'wait' || t.cls === 'move-wait'; }).length;
  const isLoop = (s.outcome === 'fighter-died' && s.strikesLanded === 0 && maxRun >= 4);
  return { seq: ex.seq, day: ex.day, mid: ex.mid, outcome: s.outcome,
    strikesLanded: s.strikesLanded, nTurns: turns.length,
    approachStepTurns: approachTurns, fleeWalkTurns: fleeWalkTurns,
    otherBlockedTurns: otherBlockedTurns, maxSameStepRun: maxRun,
    noPathLines: noPathTotal, waitTurns: waitTurns, isLoopFight: isLoop,
    fallbackEvents: fallbackEvents, fallbackKinds: fallbackKinds,
    turnDetail: detail };
}

module.exports = { analyzeConfirm: analyzeConfirm, weakestMonster: weakestMonster,
  weakestDist: weakestDist, targetAdjacentToWeakest: targetAdjacentToWeakest,
  summarize: A.summarize };
