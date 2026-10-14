// allowgate2 — re-arm of r14's 4-day-floor pantry-state gate as a SEPARATE
// policy layer on the r13 feast allowance (loop B, 2026-10-14, food-economy
// axis, sim-findings #187 claimed).
//
// Opt-in via ALLOWGATE2=1 (default OFF); requires FEASTSCALE_R13=1 (the r13
// layer). Wraps leadfeast/belongfeast (the r13 allowance).
//
// THE GATE: the allowance may only spend SURPLUS above the game's own 4-day
// fresh floor (Game.pantryFreshDays — the same floor prodThrottle uses, and
// the same floor the killed feastdoor duty proved live):
//   spendTarget = (freshDays - 4) * burn
// hold when plan.cost > spendTarget. The floor never moves. Gate on pantry
// STATE, never on contribution — the contribution rule is untouched.
// Conservative by design: the engine's pantryDraw draws fresh-first
// (spoilDay-ascending sort, verified in game.js), so the whole plan.cost
// counts against fresh — over-refusal is the safe direction for a harm
// guard.
//
// HOLD TELEMETRY (r15's telemetry blank, fixed): a hold is counted ONLY
// when the allowance would actually have fired this dusk — i.e. the FULL
// r13 candidacy chain (dusk, haven, one-feast/day, cadence, contribution
// >=1500, plan.ok, have >= cost*1.5) passes and ONLY the floor test fails.
// ctx.ag2GateHeld counts real holds, never non-candidate dusks. A gate hold
// must mean the allowance would actually have fired.
//
// Suppressed feasts are POSTPONED, never displaced: Game.hostFeast is
// refused for the held dusk only (finally-restored), so scaleFeast's
// rep.ok is false and the shared cadence tracker (ctx._fsLastFeastDay) is
// NOT marked — the next dusk re-tests and an opening is never displaced.
// Policy-side only; zero src/js changes.
//
// Kill protocol (feastdoor/r15 precedent): if the arm is KILLED, this layer
// file is deleted; the proof, sweep, sense, det-gate, and evidence stay.
'use strict';
const FS = require('./feastscale');
const { recentGives } = require('./competent');

function gateOn() { return process.env.ALLOWGATE2 === '1'; }

// burnAt(Game): the daily fresh-burn rate pantryFreshDays() divides by,
// reconstructed in the engine's own convention (freshKcal / freshDays,
// pop*2000 pre-endDay fallback). Pure read, no state, no RNG.
function burnAt(Game) {
  try {
    const fk = (typeof Game.pantryFreshKcal === 'function') ? Game.pantryFreshKcal() : 0;
    const fd = Game.pantryFreshDays();
    if (isFinite(fd) && fd > 0 && fk > 0) return fk / fd;
    const pop = (((Game.state.village || {}).roster || []).length) || 12;
    return Math.max(1, pop * 2000);
  } catch (e) { return 12 * 2000; }
}

// feastCandidate(Game, ctx): would the r13 allowance fire this dusk?
// Mirrors scaleFeast's full gate chain in the same order — every r13 gate
// kept. TRUE only when the feast WOULD have fired without this layer.
// Returns { candidate, plan, why } — the plan is the pure-read feastPlan.
function feastCandidate(Game, ctx) {
  try {
    if (Game.dayPart !== 2) return { candidate: false, why: 'not-dusk' };
    const s = Game.state.scholar || {}, day = s.day || 0;
    if (s.feastDay === day) return { candidate: false, why: 'feastDay' };
    if (!Game.playerAtHaven || !Game.playerAtHaven()) return { candidate: false, why: 'away' };
    const armed = !!((s.prog || {}).feastSurge);
    // FUSION REACTOR CEILING — same as scaleFeast: the grant is honestly
    // refused, which changes the cadence the gate must mirror.
    let armedForFeast = armed;
    try {
      if (armed && Game.fusionReactorOnline && Game.fusionReactorOnline()) armedForFeast = false;
    } catch (e) {}
    const cadence = armedForFeast ? 7 : 14;
    if (ctx._fsLastFeastDay && (day - ctx._fsLastFeastDay) < cadence) return { candidate: false, why: 'cadence' };
    // R13 CONTRIBUTION RULE — untouched: donations + tribute/tend >= 1500.
    const contrib = recentGives(Game, ctx, 7) + FS.recentTribute(Game, ctx, 7);
    if (contrib < 1500) return { candidate: false, why: 'contrib' };
    let plan = null;
    try { plan = Game.feastPlan ? Game.feastPlan() : null; } catch (e) {}
    if (!plan || !plan.ok) return { candidate: false, why: 'plan' };
    if (plan.have < plan.cost * 1.5) return { candidate: false, why: 'buffer' };
    return { candidate: true, plan, why: 'candidate' };
  } catch (e) { return { candidate: false, why: 'error' }; }
}

function withAllowanceGate2(base, id, desc) {
  return Object.assign({}, base, {
    id,
    desc,
    upkeep(Game, ctx) {
      // Gate off (or r13 layer off): pure delegation — the proof's R1 pins
      // this as byte-identical to the parent.
      if (!gateOn() || !FS.layerOn()) return base.upkeep(Game, ctx);
      const c = feastCandidate(Game, ctx);
      const orig = Game.hostFeast;
      try {
        if (c.candidate) {
          // CANDIDATE ONLY: this is a feast the allowance would actually
          // fire. The gate decides on pantry STATE.
          const fd = Game.pantryFreshDays();
          const spendTarget = (fd - 4) * burnAt(Game);
          if (c.plan.cost > spendTarget) {
            // HOLD: refuse this dusk's hostFeast. rep.ok is false and the
            // why is not the engine's 'Nobody came' room-read, so the
            // cadence tracker is NOT marked — the postponement displaces
            // nothing and the next dusk re-tests.
            ctx.ag2GateHeld = (ctx.ag2GateHeld || 0) + 1;
            Game.hostFeast = function () {
              return { ok: false, why: 'allowgate2: held — firing would push fresh-days below the 4-day floor' };
            };
          }
        }
        base.upkeep(Game, ctx);
      } finally {
        Game.hostFeast = orig;
      }
    },
    daily(Game, ctx) {
      return base.daily(Game, ctx); // pure delegation — trackTribute lives in the r13 layer
    },
  });
}

const belonggate2 = withAllowanceGate2(
  FS.belongfeast, 'belonggate2',
  'belongfeast + 4-day-floor pantry-state gate (ALLOWGATE2=1, requires FEASTSCALE_R13=1): fire only inside surplus above 4 fresh-days'
);
const leadgate2 = withAllowanceGate2(
  FS.leadfeast, 'leadgate2',
  'leadfeast + 4-day-floor pantry-state gate (ALLOWGATE2=1, requires FEASTSCALE_R13=1): fire only inside surplus above 4 fresh-days'
);

module.exports = { belonggate2, leadgate2, withAllowanceGate2, gateOn, feastCandidate, burnAt };
