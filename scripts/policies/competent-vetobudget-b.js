'use strict';
// competent-vetobudget-b.js — VETO BUDGET (sim-vetobudget-b, Loop B
// food-economy arm, 2026-11-02).
// Prereg: evidence/2026-11-02/sim-vetobudget-b-prereg.md (committed
// BEFORE any judged sim). Policy-side arm: a NEW policy file, default
// OFF (nothing loads it unless a driver names it), ZERO src/js
// changes, ZERO edits to scripts/policies/competent.js or
// scripts/policies/competent-homewardstep-b.js, ZERO policy-default
// flips.
//
// THE FAILURE THIS FIXES (findings backlog, sim-homewardstep-rpt-b):
// on seed 62808 the same step (4,4)->(4,1) is silently refused 3x/day
// for 22 days (66 vetoes, 65 silent on that step) while the scholar
// ends every day home and fed — competent re-picking of a
// permanently refused route.
//
// THE ONE DEFINITION (prereg, decided up front): N = 3 silent
// vetoes per expedition. An "expedition" is the scholar's ongoing
// pursuit of ONE route: a run-scoped campaign to take a particular
// step (ordered tile pair from -> to), beginning with that step's
// first veto and ending when the route is abandoned or the run
// ends. The budget does NOT reset at dawn — a per-day budget would
// throttle the pattern to N/day but leave the scholar re-attempting
// the same refused route for weeks, which is the blank itself.
// "Same step" is the ordered pair, not the destination: the same
// destination approached from elsewhere is a different approach
// with different escape geometry, so it carries its own budget.
// Only SILENT vetoes count: the first, spoken veto is the scholar
// learning the route is refused; it does not count toward N. Silent
// vetoes are detected via the guard's OWN ctx counters
// (homewardstepSilentVetoes delta across the guarded travelTo
// call) — no re-implementation of the guard's silence logic.
//
// ABORT BEHAVIOR (prereg, precise): the moment a step's Nth silent
// veto is recorded, that step is marked ABANDONED (ctx set,
// run-scoped, permanent for the run — the expedition is OVER, not
// paused). Every later travelTo attempt of an abandoned step is
// SUPPRESSED: the wrapper returns the guard-veto-shaped block
// ({blockType:'homewardstep', vetoed:true}) WITHOUT invoking the
// guard — no new veto counted, no narration, no escapeCheck sim.
// Competent's trip loop then does exactly what it does on a veto —
// moves to its next candidate, which on 62808 is near-home forage
// (the named productive home behavior); if no candidate succeeds,
// the day's haven chores in competent.daily still run.
//
// NARRATION (sim-abandonspeak-b, 2026-11-02; canon: no silent
// actions — every action narrates honestly, including failures).
// The abandonment itself is spoken, exactly once, through the same
// Game.say narration hook the guard uses for its veto line, at the
// moment the step is marked abandoned. Suppressed attempts stay
// silent (the line is the abandonment, not a per-attempt shout).
// The line is fixed second-person in-world wording with no counts,
// coordinates, or mechanism words. Narration never changes
// behavior: it is a say() call only, wrapped so a narration failure
// cannot break travel.
//
// NEVER SUPPRESSED: force calls, combatExit calls, self-calls
// (tent-clearing side effects), and any call while in combat pass
// through untouched, exactly as the guard passes them. On wrapper
// error, fall back to the guarded call (never break the game on
// instrument failure). Narration added by sim-abandonspeak-b only:
// one Game.say abandonment line at the abandonment moment (see
// NARRATION above); nothing else in this file speaks.
//
// KNOWN RISK (prereg, judged by the no-harm bars): E(D) is
// recomputed per attempt, so a step refused today could pass later
// (e.g. rubble cleared meanwhile). A permanently abandoned step
// stays abandoned even if it later opens — the scholar never
// relearns the opened route. That cost, if real, shows up in haul,
// away, failed-trip, survival, and idling bars.
//
// PERCEPTION (Steve 2026-10-28, no magic lists): the budget reads
// only the scholar's own travel attempts and the guard's own veto
// counters — lived refusals, not a roster or a global list. A step
// is abandoned because the scholar itself was refused on it N
// times, never because of anything it did not experience.
const { competent } = require('./competent');
const { installGuard } = require('./competent-homewardstep-b');

// Prereg N. No env override: an override would invite mid-run re-scoring.
const VETOBUDGET_N = 3;

// The one abandonment line (sim-abandonspeak-b). Fixed text, second
// person, in-world wording; no mechanism words, counts, or coords.
const ABANDON_LINE = 'You stop trying that way \u2014 it has turned you back again and again, and you will not spend another day on a road that will not open.';

function tileKey(x, y) { return x + ',' + y; }
function stepKey(fx, fy, tx, ty) { return fx + ',' + fy + '->' + tx + ',' + ty; }

// Installs the budget travelTo wrapper OUTSIDE the guard's travelTo
// (installGuard must already have run, so Game.travelTo is the
// guarded version). Returns a restore function. Exported so the
// proof test can exercise the wrapper without a full game.
function installBudget(Game, ctx) {
  const guarded = Game.travelTo;
  if (typeof guarded !== 'function') return () => {};
  if (!ctx) return () => {};
  if (!(ctx.vetobudgetCounts instanceof Map)) ctx.vetobudgetCounts = new Map();
  if (!(ctx.vetobudgetAbandoned instanceof Set)) ctx.vetobudgetAbandoned = new Set();
  if (!Array.isArray(ctx.vetobudgetLog)) ctx.vetobudgetLog = [];
  // Null-checks only: installBudget runs once per daily(), so these must
  // never reset mid-run — they initialize on first install and persist.
  if (ctx.vetobudgetSuppressions == null) ctx.vetobudgetSuppressions = 0;
  if (ctx.vetobudgetAbandonments == null) ctx.vetobudgetAbandonments = 0;
  const log = (entry) => {
    try {
      ctx.vetobudgetLog.push(entry);
      if (ctx.vetobudgetLog.length > 20000) ctx.vetobudgetLog.splice(0, ctx.vetobudgetLog.length - 20000);
    } catch (e) {}
  };
  Game.travelTo = function (x, y, force, combatExit) {
    let entered = false;
    try {
      if (!Game || Game.over) { entered = true; return guarded.apply(this, arguments); }
      try { if (Game.inCombat && Game.inCombat()) { entered = true; return guarded.apply(this, arguments); } } catch (e) {}
      if (combatExit || force) { entered = true; return guarded.apply(this, arguments); }
      const px = Game.map.px, py = Game.map.py;
      if (x === px && y === py) { entered = true; return guarded.apply(this, arguments); } // self-call: tent-clearing side effects
      const key = stepKey(px, py, x, y);
      if (ctx.vetobudgetAbandoned.has(key)) {
        ctx.vetobudgetSuppressions = (ctx.vetobudgetSuppressions || 0) + 1;
        log({ from: { x: px, y: py }, to: { x, y }, suppressed: true });
        return { blockType: 'homewardstep', vetoed: true };
      }
      const prevSilent = ctx.homewardstepSilentVetoes || 0;
      entered = true;
      const res = guarded.apply(this, arguments);
      try {
        const silentDelta = (ctx.homewardstepSilentVetoes || 0) - prevSilent;
        if (silentDelta > 0) {
          const count = (ctx.vetobudgetCounts.get(key) || 0) + silentDelta;
          ctx.vetobudgetCounts.set(key, count);
          log({ from: { x: px, y: py }, to: { x, y }, silentVeto: true, count });
          if (count >= VETOBUDGET_N && !ctx.vetobudgetAbandoned.has(key)) {
            ctx.vetobudgetAbandoned.add(key);
            ctx.vetobudgetAbandonments = (ctx.vetobudgetAbandonments || 0) + 1;
            log({ from: { x: px, y: py }, to: { x, y }, abandoned: true, count });
            // Speak the abandonment once, through the guard's own
            // narration hook. Narration failure must never break travel.
            try { if (Game && typeof Game.say === 'function') Game.say(ABANDON_LINE); } catch (e3) {}
          }
        }
      } catch (e2) {}
      return res;
    } catch (e) {
      // Never break the game on instrument failure: if the guarded
      // call already ran, rethrow (no double execution); otherwise
      // fall back to the guarded call exactly once.
      if (entered) throw e;
      try { return guarded.apply(this, arguments); } catch (e2) { throw e2; }
    }
  };
  return () => { Game.travelTo = guarded; };
}

function dailyWithBudget(Game, ctx) {
  const restoreGuard = installGuard(Game, ctx, { shadow: false });
  const restoreBudget = installBudget(Game, ctx);
  try { competent.daily(Game, ctx); } finally { restoreBudget(); restoreGuard(); }
}

const vetobudget = Object.assign({}, competent, {
  daily(Game, ctx) { dailyWithBudget(Game, ctx); },
});

module.exports = { vetobudget, installBudget, VETOBUDGET_N, ABANDON_LINE, stepKey, tileKey };
