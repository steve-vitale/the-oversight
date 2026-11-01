'use strict';
// competent-patchrot-b.js — PATCH-ROTATION policy variant
// (sim-patchrot-b, Loop B food-economy arm, 2026-11-01).
//
// Prereg: evidence/2026-11-01/sim-patchrot-b-prereg.md (committed
// BEFORE any judged sim). Policy-side arm: a NEW policy file, default
// OFF (nothing loads it unless a driver names it), ZERO src/js changes,
// ZERO edits to scripts/policies/competent.js, ZERO policy-default flips.
//
// FROZEN RULE (one sentence, from the prereg): a tile the scholar
// foraged on scholar-day D counts as RESTING on days D and D+1 (the
// ~2-day cell-regrow window from sim-haulsize-b) and is deprioritized
// for forage-target choice on those days, returning to full standing
// at age >= 2 days; the menu is never filtered, only reweighted.
//
// MECHANISM (pure policy reweighting, no game-code change): during
// competent.daily only, the wrapper replaces Game.travelTargets with
// a version returning fresh objects whose `d` is inflated by +99 for
// resting tiles. forageTripSeedFirst sorts its candidates by
// (blocked, effective distance), so among unblocked candidates a
// fresh tile now sorts ahead of a resting one — the trip tries fresh
// ground first and only falls back to resting ground when fewer than
// 3 fresh candidates exist (the trip tries up to 3). Blocked-first
// ordering is untouched: a blocked tile still sorts after unblocked
// ones regardless of rest. No tile is hidden: every candidate stays
// in the menu with its true x/y/type; only the policy's distance
// preference changes, the same way the baseline's vine rule counts a
// thicket as one step nearer.
//
// WHY d-inflation and not a filter or a sort edit: the wrapper cannot
// edit competent.js's sort, and filtering travelTargets would break
// walkTo's best-step search (it needs the full menu). Inflating `d`
// is neutral for walkTo (it computes its own Manhattan distance from
// x/y and ignores `d`) and for the engine (travelTo finds targets by
// x/y, not by d). Known spillovers, stated in the prereg: nearestRubble
// picks by min `d`, so a resting rubble tile may lose a stoneRun to
// a farther fresh one; the feast patrol sorts by descending `d`, so a
// resting tile may look farther and enter its top-4 — the patrol only
// runs while feasted, and COMPETENT_FEAST=0 in this substrate.
//
// VISITED TRACKING: the wrapper records every forage doAction during
// daily (success or failure — a worked-out patch is picked clean
// either way) keyed "x,y" -> scholar day, in the run's ctx
// (ctx.patchrotVisited, a plain object; ctx is per-run). A forage call
// on a resting tile is counted as a stale attempt
// (ctx.patchrotStaleAttempts) — the trip fell back to resting ground
// because fresh candidates ran out or were unreachable. All wrappers
// are restored in a finally; the base daily runs exactly once.
const { competent } = require('./competent');

const PATCHROT_WINDOW = 2; // resting while age < 2 scholar-days
const PATCHROT_PENALTY = 99; // distance inflation for resting tiles

function tileKey(x, y) { return x + ',' + y; }
function scholarDay(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}
function isResting(visited, x, y, day) {
  const last = visited ? visited[tileKey(x, y)] : undefined;
  return (typeof last === 'number') && (day - last) < PATCHROT_WINDOW;
}
// Pure: adjusted distance for one candidate. Exported for tests.
function adjustedDistance(entry, visited, day) {
  const d = (entry && typeof entry.d === 'number') ? entry.d : 0;
  return isResting(visited, entry.x, entry.y, day) ? d + PATCHROT_PENALTY : d;
}
// Pure: reweight a whole travelTargets menu (fresh objects out).
function adjustedTargets(targets, visited, day) {
  return (targets || []).map((t) => Object.assign({}, t, { d: adjustedDistance(t, visited, day) }));
}

const patchrot = Object.assign({}, competent, {
  id: 'competent-patchrot-b',
  desc: 'competent + patch rotation: tiles foraged within the last 2 days sort as 99 steps farther for forage-target choice (sim-patchrot-b)',
  daily(Game, ctx) {
    if (!ctx.patchrotVisited) ctx.patchrotVisited = {};
    const visited = ctx.patchrotVisited;
    const origTravelTargets = Game.travelTargets;
    const origDoAction = Game.doAction;
    if (typeof origTravelTargets === 'function') {
      Game.travelTargets = function () {
        const out = origTravelTargets.apply(this, arguments);
        try {
          const day = scholarDay(Game);
          let penalized = false;
          const adj = (out || []).map((t) => {
            const a = Object.assign({}, t, { d: adjustedDistance(t, visited, day) });
            if (a.d !== t.d) penalized = true;
            return a;
          });
          if (penalized) ctx.patchrotPenalizedMenus = (ctx.patchrotPenalizedMenus || 0) + 1;
          return adj;
        } catch (e) { return out; }
      };
    }
    if (typeof origDoAction === 'function') {
      Game.doAction = function (kind, opts) {
        if (kind !== 'forage') return origDoAction.apply(this, arguments);
        // Record BEFORE the call: position at call time is the tile
        // being worked, and the day is the current scholar day.
        let px = null, py = null, day = 0;
        try { px = Game.map.px; py = Game.map.py; day = scholarDay(Game); } catch (e) {}
        if (px != null && py != null) {
          try {
            if (isResting(visited, px, py, day)) ctx.patchrotStaleAttempts = (ctx.patchrotStaleAttempts || 0) + 1;
            visited[tileKey(px, py)] = day;
            ctx.patchrotForageAttempts = (ctx.patchrotForageAttempts || 0) + 1;
          } catch (e) {}
        }
        return origDoAction.apply(this, arguments);
      };
    }
    try {
      competent.daily(Game, ctx);
    } finally {
      if (typeof origTravelTargets === 'function') Game.travelTargets = origTravelTargets;
      if (typeof origDoAction === 'function') Game.doAction = origDoAction;
    }
    try { ctx.patchrotVisitedTiles = Object.keys(visited).length; } catch (e) {}
  },
});

module.exports = {
  patchrot, PATCHROT_WINDOW, PATCHROT_PENALTY,
  _isResting: isResting, _adjustedDistance: adjustedDistance,
  _adjustedTargets: adjustedTargets, _tileKey: tileKey,
};
