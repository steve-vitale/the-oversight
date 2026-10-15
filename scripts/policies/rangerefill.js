// rangerefill.js — RANGING WATER-SAFETY policy layer (loop B, food-economy
// axis; sim-findings #292 "ranging without wild fills").
//
// Rebuilt 2026-10-15 (sim-rangerefill2, ARM 2 of the 10:10Z run) from the
// r46b spec after the §14-prescribed honest re-test: the killed layer was
// deleted per kill protocol; the rebuild spec is evidence/2026-10-15/
// sim-rangerefill-b.md "What was built". The bar for THIS run is the honest
// one pre-registered in the r46b §14 metric review: (b) scopes to FILLABLE
// departures (cistern clean > 0 at the departure dawn) — the r46b miss
// states (pack 2/3 + dry cistern, physically unfillable 3rd bottle) are
// excluded by construction.
//
// POLICY-SIDE LAYER, gate RANGEREFILL=1 (default OFF). Zero src/js changes.
// When the gate is off, the named exports ARE the base policy objects
// (same references — the sweep's gate-off control path is untouched).
//
// Canon note: there is NO water/thirst canon doc (stated per the canon
// rule; not invented). All water mechanics read from src/js/game.js as-is:
// Game.fillWater() (haven well draws 1L clean from the cistern; wild
// creek/wetland/pond free but risky), Game.boilWater(), Game.drinkWater(),
// Game.pourWater(). Cistern 40L.
//
// Sub-finding fixed IN-LAYER (competent.js untouched — sibling arm's area):
// the competent-family drinkSafe fills opportunistically only when the tile
// type matches /creek|well|spring|river|pond|haven/i — but the engine's
// fillable wild set is exactly {creek, wetland, pond} (game.js fillWater).
// `wetland` — the most common wild water — is MISSED by the policy regex,
// and well/spring/river are not tile types at all. This layer uses the
// engine-exact set.
//
// What the layer does (gate on):
//  1. Departure precondition: at every haven dawn, BEFORE the base policy's
//     daily (so before any departure), top the pack to 3 bottles from the
//     haven well. Honest Game.fillWater() — 10 kcal + 1 tick per bottle,
//     engine refusals honored.
//  2. Gate fallback (the Violet Pang state): dawn at haven with EMPTY pack
//     + DRY cistern -> haul from the nearest personally-visited water tile
//     (creek/wetland/pond — the engine's own refusal suggests "Haul from a
//     creek (risky water)"), hop-by-hop via the honest walkTo pattern, then
//     fill. Voiced once. If no water tile is honestly known, recorded
//     unresolvable and the day proceeds (measured residual).
//  3. En-route fills: Game.travelTo wrapped (installed in setup, gate-on
//     only): after every non-combat arrival on a creek/wetland/pond tile
//     with room in the pack, fill toward full. Skips combatExit arrivals
//     (nobody stops to fill mid-flee) and mid-combat travel.
//  4. Auditable dawn log on ctx (_rfDawnLog: day, packBefore/After,
//     cisternClean, gateTripped, packAfterFallback) for the GO measurement.
'use strict';

const GATE_ON = process.env.RANGEREFILL === '1';
const { leadcourt } = require('./leadcourt');
const { belongseek } = require('./belongseek');
const { competent } = require('./competent');

// The competent-family pack standard: 3 bottles.
const PACK_FULL = 3;
// ENGINE-EXACT wild fillable set (game.js fillWater): {creek, wetland, pond}.
const WILD_WATER = { creek: true, wetland: true, pond: true };

function packLiters(Game) {
  try { return (Game.state.scholar.water || []).length; } catch (e) { return 0; }
}
function atHaven(Game) {
  try { return !!Game.playerAtHaven(); } catch (e) { return false; }
}
function cisternClean(Game) {
  try { return Math.floor(((Game.state.village || {}).water || {}).clean || 0); }
  catch (e) { return 0; }
}
function scholarDay(Game) {
  try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; }
}

// Honest top-up primitive: fill toward PACK_FULL via the real verb, honoring
// every engine refusal (dry cistern, dry ground, pack weight). Returns the
// number of bottles actually gained. THE RED PATCH
// (~/workspace/rangerefill-red-20261015.patch) neuters the while condition
// below — keep this shape or RED-verification breaks.
function topUpPack(Game) {
  let gained = 0;
  try {
    let guard = 0;
    while (packLiters(Game) < PACK_FULL && guard++ < 6 && !Game.over) {
      const before = packLiters(Game);
      try { Game.fillWater(); } catch (e) { break; }
      if (packLiters(Game) <= before) break; // refused: dry cistern / dry ground / pack weight
      gained++;
    }
  } catch (e) {}
  return gained;
}

// hop-by-hop honest walk toward (tx,ty): one travelTo per hop, no force,
// bounded. travelTargets only reaches d<=3, so a single travelTo can't
// cross the map — walk it like a player would. (Same pattern as the
// competent-family walkTo; kept in-layer so the layer never edits
// competent.js.)
function rfWalkTo(Game, tx, ty) {
  try {
    let guard = 0;
    while ((Game.map.px !== tx || Game.map.py !== ty) && guard++ < 10 && !Game.over && !Game.tbfight) {
      let best = null, bd = 1e9;
      for (const tt of (Game.travelTargets() || [])) {
        const d = Math.abs(tt.x - tx) + Math.abs(tt.y - ty);
        if (d < bd) { bd = d; best = tt; }
      }
      if (!best) break;
      const px0 = Game.map.px, py0 = Game.map.py;
      try { Game.travelTo(best.x, best.y); } catch (e) { break; }
      if (Game.map.px === px0 && Game.map.py === py0) break; // refused: stay put, safely
    }
  } catch (e) {}
}

// Wrap Game.travelTo (gate-on only): record honest water-tile knowledge and
// fill opportunistically on arrival. Idempotent via Game._rfTravelWrapped.
function installTravelFill(Game, ctx) {
  try {
    if (Game._rfTravelWrapped) return;
    const orig = Game.travelTo.bind(Game);
    Game.travelTo = function (x, y, force, combatExit) {
      let r = null, threw = null;
      try { r = orig(x, y, force, combatExit); } catch (e) { threw = e; }
      try {
        const arrived = !threw && Game.map && Game.map.px === x && Game.map.py === y && !Game.over;
        if (arrived) {
          let tt = null;
          try { const t = Game.playerTile(); tt = t && t.type; } catch (e) {}
          if (tt && WILD_WATER[tt]) {
            // Honest map knowledge: we stood here, there is water here.
            const kw = (ctx._rfKnownWater = ctx._rfKnownWater || {});
            kw[x + ',' + y] = tt;
            let inCombat = false;
            try { inCombat = !!Game.inCombat(); } catch (e) {}
            // Nobody stops to fill mid-flee (combatExit) or mid-fight. During
            // a gate-haul walk the fallback's own top-up credits the haul
            // (ctx._rfGateHaulActive) — the wrap skips so bottles aren't
            // double-credited.
            if (!combatExit && !inCombat && !ctx._rfGateHaulActive) {
              const g = topUpPack(Game);
              if (g > 0) ctx.rf_filled_enroute = (ctx.rf_filled_enroute || 0) + g;
            }
          }
        }
      } catch (e) {}
      if (threw) throw threw;
      return r;
    };
    Game._rfTravelWrapped = true;
  } catch (e) {}
}

function nearestKnownWater(Game, ctx) {
  try {
    const kw = ctx._rfKnownWater || {};
    const px = Game.map.px, py = Game.map.py;
    let best = null, bd = 1e9;
    for (const k of Object.keys(kw)) {
      const parts = k.split(',');
      const x = +parts[0], y = +parts[1];
      if (!isFinite(x) || !isFinite(y)) continue;
      const d = Math.abs(x - px) + Math.abs(y - py);
      if (d < bd) { bd = d; best = { x, y }; }
    }
    return best;
  } catch (e) { return null; }
}

// The dawn step: top-up at haven, then the Violet Pang gate. Runs BEFORE the
// base policy's daily so the pack state precedes any departure.
function rangerefillDawn(Game, ctx) {
  try {
    if (!atHaven(Game) || Game.over) return;
    const day = scholarDay(Game);
    const packBefore = packLiters(Game);
    const cisternBefore = cisternClean(Game);
    const gained = topUpPack(Game);
    if (gained > 0) ctx.rf_filled_dawn = (ctx.rf_filled_dawn || 0) + gained;
    const packAfter = packLiters(Game);
    let gateTripped = false, packAfterFallback = null;
    if (packAfter === 0 && cisternClean(Game) < 1) {
      gateTripped = true;
      ctx.rf_gateTrips = (ctx.rf_gateTrips || 0) + 1;
      const target = nearestKnownWater(Game, ctx);
      if (!target) {
        // No water tile honestly known — recorded, the day proceeds.
        ctx.rf_gateUnresolvable = (ctx.rf_gateUnresolvable || 0) + 1;
        packAfterFallback = packAfter;
      } else {
        ctx.rf_gateHauls = (ctx.rf_gateHauls || 0) + 1;
        try { Game.say("The cistern's dry and your bottles are empty — you haul water from the creek before ranging out."); } catch (e) {}
        ctx._rfGateHaulActive = true;
        try { rfWalkTo(Game, target.x, target.y); } catch (e) {}
        ctx._rfGateHaulActive = false;
        topUpPack(Game);
        packAfterFallback = packLiters(Game);
        // Explicit gate-haul credit (r46b metric review: the r46b counter
        // misattributed these to filledEnroute; the mechanism was verified
        // via the dawn log + transcripts).
        const hauled = Math.max(0, packAfterFallback - packAfter);
        ctx.rf_gateHaulBottles = (ctx.rf_gateHaulBottles || 0) + hauled;
        ctx.rf_filled_gatehaul = (ctx.rf_filled_gatehaul || 0) + hauled;
      }
    }
    (ctx._rfDawnLog = ctx._rfDawnLog || []).push({
      day: day,
      packBefore: packBefore,
      packAfter: packAfter,
      cisternClean: cisternBefore,
      gateTripped: gateTripped,
      packAfterFallback: packAfterFallback,
    });
  } catch (e) {}
}

function wrapPolicy(base, suffix) {
  const w = Object.assign({}, base, {
    id: 'rangerefill-' + suffix,
    desc: (base.desc || base.id || suffix) + ' + RANGEREFILL ranging water-safety layer',
  });
  w.setup = async function (Game, ctx) {
    try { installTravelFill(Game, ctx); } catch (e) {}
    if (base.setup) return base.setup(Game, ctx);
  };
  w.daily = function (Game, ctx) {
    try { installTravelFill(Game, ctx); } catch (e) {}
    rangerefillDawn(Game, ctx);
    return base.daily(Game, ctx);
  };
  return w;
}

module.exports = GATE_ON
  ? {
      RANGEREFILL: true,
      rangerefillLeadcourt: wrapPolicy(leadcourt, 'leadcourt'),
      rangerefillBelongseek: wrapPolicy(belongseek, 'belongseek'),
      rangerefillCompetent: wrapPolicy(competent, 'competent'),
      rangerefillDawn: rangerefillDawn,
      installTravelFill: installTravelFill,
    }
  : {
      RANGEREFILL: false,
      rangerefillLeadcourt: leadcourt,
      rangerefillBelongseek: belongseek,
      rangerefillCompetent: competent,
    };
