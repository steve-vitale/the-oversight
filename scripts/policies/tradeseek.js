// tradeseek — competent + TRADE-road scale courtship (journey-scale r5 2026-10-17).
//
// A competent player who ALSO courts the scale ladder via the TRADE road:
// the charter — pooled routes, tariff income, no mutual defense (docs/SCALE.md,
// Steve 2026-10-10: "the no-swords clause in plain ink").
//
// Built on scalecourt: competent base + answered beats/calls + climb-before-
// knock (opinion-10 bar + codex pilgrimage). The differences from scalecourt:
//   1. TRADE-FIRST courtship: one proposeTrade/day at/above the opinion-10 bar,
//      7-day cooldown per village, targeting the 3 seasoned trade links the
//      national bar needs (30+ days, trust 40+). Covenant/lead proposals are
//      shielded so the TRADE measurement isn't confounded by a covenant beat
//      staging first and stealing the national slot (the same confound the
//      belong road's shield fixed in r4).
//   2. Trade calls answered by the inherited courtship (send when the pantry
//      can carry the favor — priced at 1,500 kcal repaid — else refuse aloud;
//      the charter allows it).
// Canon read: docs/CANON.md, docs/SCALE.md (trade shape + charter beats),
// src/js/hierarchy.js (proposeTrade/_proposePeer/answerTradeCall/tariff tick).
'use strict';
const { scalecourt } = require('./scalecourt');

function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

// Council verbs (proposeTrade included) are Haven-council verbs: the exile
// guard (hierarchy.js _blockIfNotHaven) returns null without scoring when the
// persona is exiled or has joined another fire. Proposing into that gate
// burns cooldowns for nothing — gate first.
function canPropose(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    return !s.exiled && !s.joinedVillage;
  } catch (e) { return false; }
}

// TRADE courtship: the knock, after the climb. The opinion-10 bar and the
// codex pilgrimage live in the inherited scalecourt.daily courtship block —
// this only fires proposals, trade-first, one a day. A competent player
// knows the trade league needs THREE seasoned fires (docs/SCALE.md) and
// courts toward that bar, not at random.
function tradeCourtship(Game, ctx) {
  try {
    const day = gday(Game);
    const st = Game.state;
    if (day < 25) return;
    if (st.pendingCounter || st.pendingAccord || st.pendingNational) return;
    // the persona is walking the pilgrimage — the knock waits (one body)
    if (ctx._pilgrim || ctx._returning) return;
    if (!canPropose(Game)) return;
    if (pantryKcal(Game) <= 12000) return;
    const active = (Game.hierarchyState ? (Game.hierarchyState() || []) : [])
      .filter(l => l && l.status === 'active');
    const trN = active.filter(l => l.kind === 'trade').length;
    if (trN >= 3) return;
    ctx._propCool = ctx._propCool || {};
    const coolOk = (vid, kind) => ((ctx._propCool[vid + ':' + kind] || 0) + 7 <= day);
    const markCool = (vid, kind) => { ctx._propCool[vid + ':' + kind] = day; };
    const cands = (st.otherVillages || []).filter(v =>
      v && v.id !== 'haven' && Game.knowsVillage && Game.knowsVillage(v) &&
      !(Game.linkWith && Game.linkWith(v.id)));
    for (const t of cands) {
      if ((t.opinion || 0) < 10) continue; // below the bar: climb, don't knock
      if (!coolOk(t.id, 'trade')) continue;
      markCool(t.id, 'trade');
      try { if (Game.proposeTrade) Game.proposeTrade(t.id); } catch (e) {}
      ctx.tradeProposed = (ctx.tradeProposed || 0) + 1;
      break; // one proposal per day — courtship takes time
    }
  } catch (e) {}
}

const tradeseek = Object.assign({}, scalecourt, {
  id: 'tradeseek',
  desc: 'scalecourt + TRADE-road courtship (trade-first proposals at/above the opinion-10 bar toward 3 seasoned trade links, trade calls answered; LEAD/covenant proposals shielded)',
  daily(Game, ctx) {
    tradeCourtship(Game, ctx);
    // PROPOSAL SHIELD: scalecourt.daily would court the LEAD and covenant
    // roads (its own proposals). Those are measured elsewhere; here they'd
    // confound the TRADE measurement (a covenant beat staging first would
    // steal the national slot). Block those proposal verbs for the duration
    // of the inherited daily; all answering (beats, counters, demands,
    // tribute, calls, crises) runs. proposeTrade stays live — the inherited
    // climb (opinion bar + pilgrimage) and the trade courtship order both
    // still use it.
    const op = Game.proposeLink, oc = Game.proposeCovenant;
    Game.proposeLink = function () { return null; };
    if (typeof oc === 'function') Game.proposeCovenant = function () { return null; };
    try { scalecourt.daily(Game, ctx); }
    finally {
      Game.proposeLink = op;
      if (typeof oc === 'function') Game.proposeCovenant = oc;
    }
  },
});

module.exports = { tradeseek };
