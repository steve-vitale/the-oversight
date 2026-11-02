// policies/musterfed.js — FED-MARCH prototype (sim-musterupkeep-a,
// axis scale-onramp, blank (3) from sim-closedecay-a). POLICY ONLY:
// zero src/js changes. Wraps the closecommit stack (titanroute +
// musterclose + mustergap one-episode commit) and adds ONE leg: while
// a sounded muster stands, pack finished food from the village pantry
// into the scholar's pack up to the NEXT dawn's muster-upkeep need, so
// titanMusterUpkeep can draw a full day's feed from the pack instead
// of finding it empty and charging −2 trust per link.
//
// WHY THIS LEG EXISTS: titanMusterUpkeep (src/js/titans.js) draws need
// = (allied + valid Haven blades) × 1000 kcal/day from
// Game.playerPackSpend ONLY — the scholar's pack, never the village
// pantry — and charges the full −2/link/day whenever got < need, even
// for a 130-of-9000 partial feed. The closedecay trace shows 0 kcal
// fed every day from d98 on 97330 while the pantry held thousands.
// This leg measures whether provisioning the march through the pack
// holds allied trust to contact.
//
// DISCLOSED INSTRUMENT LIMIT: Game.takeFromPantryBulk has no tile gate
// in the code read (only an exile havenStoresAccess check), so a
// marching scholar packs from Haven's pantry mechanically, from the
// road. This arm therefore measures "if the march were fed, does trust
// hold?" — NOT "could a marching scholar physically haul it". A real
// fix would draw upkeep from village stores directly (game-code
// change, Steve-call territory, NOT proposed here).
//
// PERCEPTION LAW (load-bearing): the policy NEVER reads a monster
// roster, an allied roster, or a link list (no trust / opinion /
// arrears reads — the driver instrument reads those for measurement,
// as in the closedecay driver). It decides only from:
//   1. the call record the titanroute leg already heard (ctx.titan.called);
//   2. its OWN muster record (Game.titanMusterState — the coalition the
//      village itself assembled; bearer identity is the scholar's own);
//   3. its own slain flag (Game.state.titans.slain);
//   4. its own pack (Game.playerPackKcal) and the game's own pack verb
//      (Game.takeFromPantryBulk — the village's own stores as source).
// Selection is deterministic (largest kcalEach first, pantry-index
// tiebreak); the leg consumes no RNG of its own. (The verb itself may
// consume RNG via theft-confrontation witness rolls when its bars
// trip — that is the verb's behavior, recorded in the evidence, not
// a decision feed.)
//
// NEED ESTIMATE: (distinct allied blades + distinct muster.haven vids
// excluding the bearer) × 1000. This is an UPPER estimate of the
// engine's need: the engine's titanHavenBlades also filters roster
// membership, which this policy deliberately does NOT read. Over-
// packing is safe (upkeep spends only its need; the rest stays in the
// pack for the scholar or the next dawn) and the driver's got-vs-need
// series shows the true need.
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

function packKcal(Game) {
  try {
    if (typeof Game.playerPackKcal === 'function') return Game.playerPackKcal();
    return 0;
  } catch (e) { return 0; }
}

// Distinct-blade count for the next dawn's need. Game is the only input
// (exported for the proof test's unit checks over a fake Game).
function musterNeedFor(Game, muster) {
  if (!muster) return 0;
  var allied = {};
  ((muster.allies || [])).forEach(function (a) {
    if (a && a.vid) allied[a.villageId + ':' + a.vid] = true;
  });
  var bearer = null;
  try { bearer = Game.villagerId || null; } catch (e) { /* bearer stays null */ }
  var haven = {};
  ((muster.haven || [])).forEach(function (h) {
    var vid = h && (h.vid || h);
    if (vid && vid !== bearer) haven[vid] = true;
  });
  var blades = Object.keys(allied).length + Object.keys(haven).length;
  return { blades: blades, allies: Object.keys(allied).length, haven: Object.keys(haven).length, need: blades * 1000 };
}

function withMusterFed(base, id, desc) {
  const wrapped = Object.assign({}, base, {
    id: id || 'musterfed',
    desc: desc || 'musterfed: pack pantry rations for the next dawn muster upkeep',
    daily(Game, ctx) {
      if (base.daily) {
        try { base.daily(Game, ctx); } catch (e) { ctx.musterfedBaseDailyErr = String(e.message).slice(0, 120); }
      }
      const mf = ctx.musterfed || (ctx.musterfed = { packs: [] });
      try {
        const called = ctx.titan && ctx.titan.called;
        if (!called || typeof called !== 'object') return;
        if (Game.over || Game.tbfight) return;
        if (slain(Game)) return;
        if (typeof Game.takeFromPantryBulk !== 'function') { mf.packError = 'takeFromPantryBulk missing'; return; }
        const muster = musterOf(Game);
        if (!muster || !muster.allies || muster.allies.length === 0) return;
        const est = musterNeedFor(Game, muster);
        if (est.blades <= 0) return;
        const before = packKcal(Game);
        if (before >= est.need) {
          mf.packs.push({ day: gday(Game), blades: est.blades, allies: est.allies, haven: est.haven,
            need: est.need, packBefore: before, packedKcal: 0, packAfter: before, shortfall: 0, note: 'already-fed' });
          return;
        }
        // Deterministic pantry selection: finished food only, largest
        // kcalEach first, pantry-index tiebreak. No RNG of our own.
        var pantry = [];
        try { pantry = (Game.state && Game.state.village && Game.state.village.pantry) || []; } catch (e) { pantry = []; }
        var cands = [];
        for (var i = 0; i < pantry.length; i++) {
          var it = pantry[i];
          if (!it || (it.kcalEach || 0) <= 0 || (it.units || 0) <= 0) continue;
          var finished = true;
          try { if (typeof Game.isFinishedFood === 'function') finished = !!Game.isFinishedFood(it); } catch (e) { finished = true; }
          if (!finished) continue;
          cands.push({ idx: i, kcalEach: it.kcalEach, units: it.units });
        }
        cands.sort(function (a, b) { return (b.kcalEach - a.kcalEach) || (a.idx - b.idx); });
        var selections = {};
        var remaining = est.need - before;
        for (var c = 0; c < cands.length && remaining > 0; c++) {
          var take = Math.min(cands[c].units, Math.ceil(remaining / cands[c].kcalEach));
          if (take <= 0) continue;
          selections[cands[c].idx] = take;
          remaining -= take * cands[c].kcalEach;
        }
        var packed = 0, after = before, note = null;
        if (Object.keys(selections).length === 0) {
          note = 'no-finished-pantry-food';
        } else {
          try { Game.takeFromPantryBulk(selections); } catch (e) { mf.packError = String((e && e.message) || e).slice(0, 120); }
          after = packKcal(Game);
          packed = Math.max(0, after - before);
          if (packed <= 0) note = 'verb-packed-nothing';
        }
        mf.packs.push({ day: gday(Game), blades: est.blades, allies: est.allies, haven: est.haven,
          need: est.need, packBefore: before, packedKcal: packed, packAfter: after,
          shortfall: Math.max(0, est.need - after), note: note });
      } catch (e) {
        mf.packError = String((e && e.message) || e).slice(0, 120);
      }
    },
  });
  return wrapped;
}

module.exports = { withMusterFed, musterNeedFor };
