// policies/lairsham.js — TRIVIAL-TOUCH control (sim-laircontact-a,
// axis scale-onramp). POLICY ONLY: zero src/js changes. Wraps the
// closecommit stack (titanroute + musterclose + mustergap commit-own)
// and adds ONE leg: while a sounded muster stands, pack exactly ONE
// unit of the first finished-food pantry item into the scholar's pack
// via Game.takeFromPantryBulk, once per daily.
//
// WHY: the musterfed leg moves bulk food (up to 11,000 kcal/day),
// drains the pantry, and trips the fair-share / theft-confrontation
// bars. This leg isolates "any pantry touch" from "bulk food moved":
// one unit cannot trip the single-take bar (1 unit << 4000 kcal and
// << half-pantry) or the 7-day rate bar (1 unit/day << 3000
// kcal/day), moves negligible weight, and drains a negligible
// pantry share — but it DOES call the verb, record a take, and
// mutate pantry/pack by one unit. If this leg kills contact like
// musterfed does, the cause is the touch itself, not the bulk food.
// If it preserves contact while musterfed kills it, the cause is
// the bulk food / weight / drain, not the touch.
//
// PERCEPTION LAW (load-bearing): the policy NEVER reads a monster
// roster, an allied roster, or a link list (no trust / opinion /
// arrears reads — the driver instrument reads those for measurement).
// It decides only from the call record (ctx.titan.called), its OWN
// muster record (Game.titanMusterState), its own slain flag, and the
// game's own pack verb. Selection is deterministic (first finished
// food in pantry order); the leg consumes no RNG of its own. (The
// verb itself consumes no RNG on a one-unit take that trips no bar:
// theftConfrontation returns before its rolls when neither bar fires
// and no confrontation is due — recorded here so a sham-arm RNG
// claim is never overstated.)
'use strict';

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

function slain(Game) {
  try { return !!((((Game.state || {}).titans || {}).slain || {}).herald); } catch (e) { return false; }
}

function musterOf(Game) {
  try {
    if (typeof Game.titanMusterState === 'function') return Game.titanMusterState('herald');
    return null;
  } catch (e) { return null; }
}

function withLairSham(base, id, desc) {
  const wrapped = Object.assign({}, base, {
    id: id || 'lairsham',
    desc: desc || 'lairsham: one-unit pantry touch per day while a muster stands',
    daily(Game, ctx) {
      if (base.daily) {
        try { base.daily(Game, ctx); } catch (e) { ctx.lairshamBaseDailyErr = String(e.message).slice(0, 120); }
      }
      const sh = ctx.lairsham || (ctx.lairsham = { packs: [] });
      try {
        const called = ctx.titan && ctx.titan.called;
        if (!called || typeof called !== 'object') return;
        if (Game.over || Game.tbfight) return;
        if (slain(Game)) return;
        if (typeof Game.takeFromPantryBulk !== 'function') { sh.packError = 'takeFromPantryBulk missing'; return; }
        const muster = musterOf(Game);
        if (!muster || !muster.allies || muster.allies.length === 0) return;
        var pantry = [];
        try { pantry = (Game.state && Game.state.village && Game.state.village.pantry) || []; } catch (e) { pantry = []; }
        var idx = -1, item = null;
        for (var i = 0; i < pantry.length; i++) {
          var it = pantry[i];
          if (!it || (it.kcalEach || 0) <= 0 || (it.units || 0) <= 0) continue;
          var finished = true;
          try { if (typeof Game.isFinishedFood === 'function') finished = !!Game.isFinishedFood(it); } catch (e) { finished = true; }
          if (!finished) continue;
          idx = i; item = it; break;
        }
        if (idx < 0) { sh.packs.push({ day: gday(Game), packedKcal: 0, note: 'no-finished-pantry-food' }); return; }
        var sel = {}; sel[idx] = 1;
        try { Game.takeFromPantryBulk(sel); } catch (e) { sh.packError = String((e && e.message) || e).slice(0, 120); }
        sh.packs.push({ day: gday(Game), idx: idx, name: item.name, kcalEach: item.kcalEach,
          packedKcal: item.kcalEach, note: null });
      } catch (e) {
        sh.packError = String((e && e.message) || e).slice(0, 120);
      }
    },
  });
  return wrapped;
}

module.exports = { withLairSham };
