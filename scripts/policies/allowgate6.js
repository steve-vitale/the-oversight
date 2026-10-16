// allowgate6 — anti-strand release valve on the allowgate2 4-day-floor gate
// (loop B, 2026-10-16, food-economy axis, sim-findings #187 heterogeneity
// note from the allowgate5 confirm).
//
// Opt-in via ALLOWGATE6=1 (default OFF); requires FEASTSCALE_R13=1 (the r13
// layer) AND ALLOWGATE2=1 (the landed 4-day-floor gate). Wraps belonggate2 /
// leadgate2 (the gate's products). Policy-side only; ZERO src/js changes.
//
// THE FAILURE MODE (evidence/2026-10-15/sim-allowgate5-b.md, leadc-s909):
// on a perpetually-marginal pantry the gate's "not tonight" becomes "not
// ever" — 8 candidate-only holds, 2 feasts vs 15 control, and the feast
// engine never engages while the village slides into a 6-starvation-death
// spiral. The aggregate primary absorbed it; the per-seed didn't.
//
// THE VALVE: count CONSECUTIVE candidate-only holds over consecutive
// candidate EVENTS (candidates are cadence-spaced, so non-candidate dusks
// don't break the chain — "consecutive" means among feasts the allowance
// would actually have fired, never "consecutive days"). After N (default 3,
// ALLOWGATE6_N override) consecutive holds, suspend the hold and allow the
// allowance feast: the village decides to feast anyway rather than let the
// feast engine strand.
//
// DESIGN CALL (documented, Steve can overrule): the hold condition IS the
// marginal-pantry gate — a hold fires ONLY when the full r13 candidacy
// chain passes and ONLY the 4-day-floor test fails, i.e. exactly when the
// pantry sits below (floor + this feast's cost). If the pantry recovered
// above the floor, the candidate would fire and reset the chain; a chain
// of N holds is therefore a proven-persistent marginal pantry. No extra
// tier gate is needed, and none is added — the valve answers the exact
// strand pattern the confirm measured.
//
// THE RELEASE FIRES THE REAL ENGINE PATH: allowgate2's hold works by
// refusing this dusk's Game.hostFeast (restored in its finally). The valve
// calls the real Game.hostFeast() AFTER base.upkeep and mirrors scaleFeast's
// post-fire bookkeeping: the shared cadence tracker (ctx._fsLastFeastDay)
// IS marked (this feast is not postponed — it is the release), fsFeasts /
// fsArmedFeasts counted with the same fusion-reactor ceiling, the "Nobody
// came" room-read marks cadence the same way. The release is narrated
// through Game.say as a village decision — a real person deciding, not a
// counter tripping.
//
// TELEMETRY: ctx.ag6Holds (current consecutive-hold chain), ctx.ag6Releases
// (total release feasts), ctx.ag6ReleaseDays [{day, fd, tier}] for the
// sense read. The gate's own ag2GateHeld still counts the held dusk — the
// gate held, then the valve released it; both facts are kept.
//
// Kill protocol (allowgate2 precedent): if the arm is KILLED, this layer
// file is deleted; the proof, sweep, sense, det-gate, and evidence stay.
'use strict';
const FS = require('./feastscale');
const AG2 = require('./allowgate2');

function gateOn() { return process.env.ALLOWGATE6 === '1'; }

function consecHolds() {
  const n = parseInt(process.env.ALLOWGATE6_N || '3', 10);
  return (isFinite(n) && n >= 1) ? n : 3;
}

// scholarName(Game): the deciding voice for the release line — the scholar
// is the village's feast-host figure (hostFeast uses the same voice).
function scholarName(Game) {
  try { return Game.displayName(Game.villagerId).split(' ')[0]; } catch (e) { return 'you'; }
}

function withSpiralRelease(base, id, desc) {
  return Object.assign({}, base, {
    id,
    desc,
    upkeep(Game, ctx) {
      // Valve off (or the r13 layer / the gate off): pure delegation — the
      // proof's R1 pins this as byte-identical to the gate's products.
      if (!gateOn() || !FS.layerOn() || !AG2.gateOn()) return base.upkeep(Game, ctx);
      const prevHeld = ctx.ag2GateHeld || 0;
      const prevFeasts = ctx.fsFeasts || 0;
      base.upkeep(Game, ctx);
      const held = (ctx.ag2GateHeld || 0) - prevHeld;
      const fired = (ctx.fsFeasts || 0) - prevFeasts;
      if (fired) { ctx.ag6Holds = 0; return; } // a feast fired: the chain breaks
      if (!held) return; // non-candidate dusk: chain untouched (candidates are cadence-spaced)
      ctx.ag6Holds = (ctx.ag6Holds || 0) + 1;
      if (ctx.ag6Holds < consecHolds()) return;
      // RELEASE VALVE: N consecutive candidate-only holds on a pantry the
      // floor test keeps refusing — "not tonight" has become "not ever".
      // The village decides to feast anyway. Fire the real engine path the
      // gate refused (restored by allowgate2's finally — this IS the path
      // scaleFeast would have taken).
      let fd = -1, tier = 'unknown';
      try { fd = Game.pantryFreshDays(); } catch (e) {}
      try { tier = (typeof Game.villageFoodTier === 'function') ? Game.villageFoodTier() : 'unknown'; } catch (e) {}
      const who = scholarName(Game);
      let rep = null;
      try {
        Game.say(`${consecHolds()} held dusks in a row — the pantry keeps saying not tonight. ${who} looks at the shelves and says: "Not tonight has become not ever. We eat together — we fill the shelves tomorrow." The village decides to feast anyway. (allowgate6: release valve — the hold chain is suspended, the allowance feast fires)`);
        rep = Game.hostFeast();
      } catch (e) { rep = null; }
      const s = Game.state.scholar || {}, day = s.day || 0;
      if (rep && rep.ok) {
        // mirror scaleFeast's post-fire bookkeeping, cadence included: the
        // release feast is not postponed — it is the opening.
        ctx._fsLastFeastDay = day;
        ctx.fsFeasts = (ctx.fsFeasts || 0) + 1;
        let armedForFeast = !!((s.prog || {}).feastSurge);
        try { if (armedForFeast && Game.fusionReactorOnline && Game.fusionReactorOnline()) armedForFeast = false; } catch (e) {}
        if (armedForFeast) ctx.fsArmedFeasts = (ctx.fsArmedFeasts || 0) + 1;
        ctx.ag6Releases = (ctx.ag6Releases || 0) + 1;
        ctx.ag6ReleaseDays = ctx.ag6ReleaseDays || [];
        ctx.ag6ReleaseDays.push({ day, fd: +fd.toFixed(2), tier });
        ctx.ag6Holds = 0; // a feast fired: the chain breaks
      } else if (rep && /Nobody came/.test(rep.why || '')) {
        // the village is in no shape to feast — read the room, don't
        // re-light the fire tomorrow (same as scaleFeast).
        ctx._fsLastFeastDay = day;
        ctx.ag6Holds = 0;
      }
      // any other refusal: the chain stands (the pantry is still marginal,
      // the village still wants to feast) — the next candidate retries.
    },
    daily(Game, ctx) {
      return base.daily(Game, ctx); // pure delegation — trackTribute lives in the r13 layer
    },
  });
}

const belonggate6 = withSpiralRelease(
  AG2.belonggate2, 'belonggate6',
  'belonggate2 + anti-strand release valve (ALLOWGATE6=1, requires FEASTSCALE_R13=1 + ALLOWGATE2=1): after N consecutive candidate-only holds, the village feasts anyway'
);
const leadgate6 = withSpiralRelease(
  AG2.leadgate2, 'leadgate6',
  'leadgate2 + anti-strand release valve (ALLOWGATE6=1, requires FEASTSCALE_R13=1 + ALLOWGATE2=1): after N consecutive candidate-only holds, the village feasts anyway'
);

module.exports = { belonggate6, leadgate6, withSpiralRelease, gateOn, consecHolds };
