// sharelean — the share_surplus lean valve (sim-sharelean-b, 2026-10-20).
//
// ONE policy-side layer, opt-in via SHARELEAN=1 (default OFF — unset means
// the wrapper delegates to its parent byte-identically; the proof test's RED
// phase pins that). ZERO src/js changes.
//
// The diagnosis (evidence/2026-10-20/sim-prodrebound-b.md): the autonomous
// share_surplus funnel is PRO-CYCLICAL — lean 0.46x fat, Pearson +0.555 — it
// collapses exactly when the pantry is lean, and no production channel answers
// a lean pantry except duty_fish (31.46x, the PRODTHROTTLE disengage leg). The
// throttle only governs DUTIES; share_surplus (84-88% of inflow) never passes
// through it.
//
// The valve: once per daily (dawn posture), when Game.pantryFreshDays() <= 4
// — the PRODTHROTTLE threshold itself (prodThrottleEngaged() is literally
// `pantryFreshDays() > 4`) — the coming village day's share gate opens fully
// and the share write is re-tagged from the share_surplus funnel
// (stockSurplus) into the PANTRY funnel (stockPantry). The funnel answers lean
// the way duty_fish does, without touching the throttle or the fat-side
// sharing culture (fat days keep trust-gated sharing).
//
// Mechanism (D3/D4 in the evidence header):
//   - The gate opens through the engine's OWN trustFactor: trust 100 -> 1.0,
//     the engine's defined "share everything" level. Scoped to one
//     villagerMealDay call, save/restored in finally. This is the engine's
//     CRISIS SHARING precedent ("the village pulls together when it has to")
//     made absolute at the throttle threshold. No engine locals replicated:
//     the ledger (v.gives, giveHist), surplusFeedGovernor, and the
//     remainder-carry honesty fixes all run their natural course.
//     villagerMealDay performs no trust writes (verified by grep), so the
//     save/restore is exact.
//   - The share write is re-tagged: Game.stockSurplus(v, give) becomes
//     Game.stockPantry(give, 'Foraged food') (<=500-kcal pieces, fresh clock)
//     for the meal's duration. The patched stockSurplus returns the kcal
//     actually stored (pantryKcal before/after diff) so the CAPDOOR ledger
//     path stays honest. When CAPDOOR=1 the re-tag defers to the original
//     stockSurplus (the landed cap-door's refusal honesty outranks the tag;
//     the full share still flows through the cap-door path).
//   - The villager's own meal (ownEat, pantry/pack draws) is untouched —
//     nobody eats less. The player is never in the meal loop (engine parity).
//   - Voice: at most one line per armed day, only when kcal actually moved
//     (canon: no silent actions, no transcript spam).
//   - stockPantry is not pantry-cap-bound (substrate fact: only
//     stockSurplus/pantryAdd bind the cap). The valve fires only on lean days
//     (pantry nearly empty), so the 120,000-kcal cap cannot bind — noted, not
//     coded.
//
// Wraps leadfeast/belongfeast (scripts/policies/feastscale.js). Requires
// FEASTSCALE_R13=1 — SHARELEAN=1 without it throws a loud SHARELEAN STOP.
'use strict';
const { belongfeast, leadfeast } = require('./feastscale');

function layerOn() { return process.env.SHARELEAN === '1'; }

function feastscaleOn() { return process.env.FEASTSCALE_R13 === '1'; }

function isCapdoorOn() {
  try { return typeof process !== 'undefined' && process.env && process.env.CAPDOOR === '1'; }
  catch (e) { return false; }
}

// leanNow: dawn-posture fresh-days. Throws-safe -> 999 (not lean -> delegate).
function leanNow(Game) {
  try { return Game.pantryFreshDays(); } catch (e) { return 999; }
}

function pantryKcalNow(Game) {
  const v = (Game.state || {}).village || {};
  return ((v.pantry || [])).reduce((t, it) => t + (it.kcalEach || 0) * (it.units || 1), 0);
}

function dayOf(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

// voiceValveDay: one honest line per armed day, only when kcal moved.
function voiceValveDay(Game, ctx, leanDays) {
  const day = dayOf(Game);
  if (ctx._slVoicedDay === day) return;
  ctx._slVoicedDay = day;
  ctx._slValveDays = (ctx._slValveDays || 0) + 1;
  try {
    const fd = Math.max(0, Math.round(leanDays));
    const shelf = fd < 1 ? 'almost no fresh food left' : `~${fd} day${fd === 1 ? '' : 's'} of fresh left`;
    Game.say(`🍲 The pantry shelves are thin (${shelf}). The village pulls together — today's surplus goes to the common store, not into packs.`);
  } catch (e) {}
}

// mealWithValve: one villagerMealDay call with the valve engaged.
function mealWithValve(Game, layer, ctx, vid, person, v, cx) {
  const vv = v || Game.state.village || {};
  // D3: open the share gate through the engine's own trustFactor.
  const hadTrust = !!vv.trust;
  if (!hadTrust) vv.trust = {};
  const tHad = Object.prototype.hasOwnProperty.call(vv.trust, vid);
  const tSaved = vv.trust[vid];
  vv.trust[vid] = 100;
  // D4: re-tag the share write into the PANTRY funnel.
  const oSur = layer.oSur;
  const capdoor = layer.capdoor;
  let moved = 0;
  Game.stockSurplus = function (sv, give) {
    if (capdoor) return oSur.apply(this, arguments); // defer to the cap-door's honesty
    let before = 0, after = 0;
    try { before = pantryKcalNow(this); } catch (e) {}
    try { this.stockPantry(give, 'Foraged food'); } catch (e) {}
    try { after = pantryKcalNow(this); } catch (e) {}
    const stored = Math.max(0, Math.round(after - before));
    moved += stored;
    return stored; // the CAPDOOR ledger path reads this return honestly
  };
  try {
    return layer.oVMD.apply(Game, [vid, person, vv, cx]);
  } finally {
    Game.stockSurplus = oSur;
    if (tHad) vv.trust[vid] = tSaved; else delete vv.trust[vid];
    if (!hadTrust) delete vv.trust;
    if (moved > 0) {
      ctx._slMovedKcal = (ctx._slMovedKcal || 0) + moved;
      voiceValveDay(Game, ctx, layer.leanDays);
    }
  }
}

function disarmValve(Game) {
  if (!Game._slArmed) return;
  Game._slArmed = false;
  const s = Game._slSaved || {};
  try { if (s.vmd) Game.villagerMealDay = s.vmd; } catch (e) {}
  try { if (s.sleep) Game.sleep = s.sleep; } catch (e) {}
  try { delete Game._slSaved; } catch (e) {}
}

// armValve: lean day — the valve covers this daily AND the Game.sleep() that
// follows it (runDays calls policy.daily just before sleep; the village meals
// run inside sleep -> endDay -> villageEats). The sleep wrapper disarms.
function armValve(Game, ctx, leanDays) {
  const oVMD = Game.villagerMealDay;
  const oSleep = Game.sleep;
  const oSur = Game.stockSurplus;
  const layer = { oVMD, oSur, capdoor: isCapdoorOn(), leanDays };
  Game._slSaved = { vmd: oVMD, sleep: oSleep };
  Game._slArmed = true;
  Game.villagerMealDay = function (vid, person, v, cx) {
    if (!Game._slArmed || !layerOn()) return layer.oVMD.apply(this, arguments);
    return mealWithValve(this, layer, ctx, vid, person, v, cx);
  };
  Game.sleep = function (...a) {
    try { return oSleep.apply(this, a); }
    finally { disarmValve(Game); }
  };
}

function withShareLean(base, id, desc) {
  return Object.assign({}, base, {
    id,
    desc,
    upkeep(Game, ctx) {
      base.upkeep(Game, ctx); // the valve is a daily-posture layer; upkeep untouched
    },
    daily(Game, ctx) {
      if (!layerOn()) return base.daily(Game, ctx); // gate off: pure delegation
      if (!feastscaleOn()) {
        throw new Error('SHARELEAN STOP: SHARELEAN=1 requires FEASTSCALE_R13=1 — wrong substrate, refusing to run');
      }
      disarmValve(Game); // stale-arm cleanup: a previous daily whose sleep never ran
      ctx._slEvals = (ctx._slEvals || 0) + 1;
      const fd = leanNow(Game);
      const lean = fd <= 4; // the PRODTHROTTLE threshold (D1)
      ctx._slLeanDay = lean;
      if (!lean) return base.daily(Game, ctx);
      ctx._slArms = (ctx._slArms || 0) + 1;
      armValve(Game, ctx, fd);
      try { return base.daily(Game, ctx); }
      catch (e) { disarmValve(Game); throw e; }
      // NOTE: no finally-disarm — the sleep wrapper disarms after the
      // village day (villageEats) runs. A leaked arm is behaviorally inert:
      // the villagerMealDay wrap checks Game._slArmed, and the next daily
      // disarms before evaluating.
    },
  });
}

const belongsharelean = withShareLean(
  belongfeast, 'belongsharelean',
  'belongfeast + share_surplus lean valve (SHARELEAN=1): lean days (freshDays<=4) open the share gate fully and re-tag the share into the PANTRY funnel'
);
const leadsharelean = withShareLean(
  leadfeast, 'leadsharelean',
  'leadfeast + share_surplus lean valve (SHARELEAN=1): lean days (freshDays<=4) open the share gate fully and re-tag the share into the PANTRY funnel'
);

module.exports = { belongsharelean, leadsharelean, withShareLean, layerOn, leanNow };
