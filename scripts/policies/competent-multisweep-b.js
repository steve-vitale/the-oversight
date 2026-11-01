'use strict';
// competent-multisweep-b.js — SECOND-TRIP / MULTI-SWEEP policy variant
// (sim-multisweep-b, Loop B food-economy arm, 2026-11-01).
//
// Prereg: evidence/2026-11-01/sim-multisweep-b-prereg.md (committed
// BEFORE any judged sim). Policy-side arm: a NEW policy file, default
// OFF (nothing loads it unless a driver names it), ZERO src/js changes,
// ZERO edits to scripts/policies/competent.js, ZERO policy-default flips.
//
// RULE (stated in the prereg, frozen here): after the baseline
// competent.daily finishes, IF the scholar is alive, at the haven, and
// the base daily had >= 1 successful forage, the scholar goes out
// AGAIN: up to 2 additional forageTripSeedFirst calls (total <= 3
// sweeps/day, counting the base trip). Each extra trip is guarded:
// alive, at the haven at its start, pack < 95% of cap, no active
// turn-fight. The extra-trip loop STOPS after a trip that returns 0
// (no success — the land is worked out; re-trying the same candidates
// the same day is not a second outing, it is thrashing) or when the
// pack reaches >= 95% of cap. The extra trips run AFTER the base
// daily's sort/donate/eat, i.e. as a genuine second outing from home
// after the first haul is dealt with — the human shape of "sort it,
// then go back out while light remains", not a hidden in-trip loop.
//
// SUCCESS COUNTING: the base daily discards forageTripSeedFirst's
// return, so the wrapper counts successful forage doActions during the
// base daily with a temporary Game.doAction wrapper (captured orig is
// the harness wrapper when present, so pacing/origin accounting still
// runs; the wrapper is restored in a finally). The wrapper counts
// ONLY the base-daily window: extra trips are counted separately in
// ctx (multisweepExtraTrips / multisweepExtraSuccesses), never by
// re-entering the counting window.
const { competent, forageTripSeedFirst } = require('./competent');

function atHaven(Game) {
  try { return !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) { return false; }
}
function packFull(Game) {
  try {
    const kg = Game.packWeight(), cap = Game.packCapacity();
    return (typeof kg === 'number' && typeof cap === 'number' && cap > 0) ? kg >= 0.95 * cap : false;
  } catch (e) { return false; }
}

const multisweep = Object.assign({}, competent, {
  id: 'competent-multisweep-b',
  desc: 'competent + second outing: up to 2 extra forage trips after a successful first sweep (sim-multisweep-b)',
  daily(Game, ctx) {
    let baseSuccesses = 0;
    const origDoAction = Game.doAction;
    if (typeof origDoAction === 'function') {
      Game.doAction = function (kind, opts) {
        const r = origDoAction.apply(this, arguments);
        try { if (kind === 'forage' && r) baseSuccesses++; } catch (e) {}
        return r;
      };
    }
    try {
      competent.daily(Game, ctx);
    } finally {
      if (typeof origDoAction === 'function') Game.doAction = origDoAction;
    }
    ctx.multisweepBaseSuccesses = (ctx.multisweepBaseSuccesses || 0) + baseSuccesses;
    // Extra-outing gate: only after a successful first sweep, from home.
    if (baseSuccesses < 1) { ctx.multisweepSkippedNoSuccess = (ctx.multisweepSkippedNoSuccess || 0) + 1; return; }
    if (Game.over || Game.tbfight || !atHaven(Game)) { ctx.multisweepSkippedNotHome = (ctx.multisweepSkippedNotHome || 0) + 1; return; }
    if (packFull(Game)) { ctx.multisweepSkippedPackFull = (ctx.multisweepSkippedPackFull || 0) + 1; return; }
    for (let i = 0; i < 2; i++) {
      if (Game.over || Game.tbfight || !atHaven(Game) || packFull(Game)) break;
      let got = 0;
      try { got = forageTripSeedFirst(Game, ctx) || 0; } catch (e) { got = 0; }
      ctx.multisweepExtraTrips = (ctx.multisweepExtraTrips || 0) + 1;
      if (got) ctx.multisweepExtraSuccesses = (ctx.multisweepExtraSuccesses || 0) + 1;
      else break; // worked-out land: stop, do not thrash the same candidates
      if (packFull(Game)) break;
    }
  },
});

module.exports = { multisweep, _atHaven: atHaven, _packFull: packFull };
