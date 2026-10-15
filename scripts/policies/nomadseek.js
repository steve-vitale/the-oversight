// scripts/policies/nomadseek.js — the FORCED-NOMAD policy (2026-10-15).
//
// A capable player that wants The Long Way Home. Plays the full village
// game on the capable stack; answers the Watchers beat (never decline —
// 'feast', like winseek); leaves the moment Game.nomad.canLeave() says ok;
// then walks the road: enters the first leg, moves on when a leg resolves,
// and lets the driver's reunions/all-found logic close the run.
//
// Built for scripts/test-nomad-reachability.js: the honest measurement of
// whether the eligibility gates (global rank + known living scattered kin)
// ever fire in organic play, and whether the road is survivable under a
// real village's departure state (not a rigged 9999999-kcal party).
//
// While on the road the village-side capable.daily is SKIPPED on purpose:
// the bearer <redacted> physically away, and letting the player act in the
// village while walking the road would double-count them (the
// party-members-treated-as-present gap). The engine still ticks the
// village's own day sim; only the player's personal actions pause.
'use strict';
const { capable } = require('./capable');

function note(ctx, m) {
  try { (ctx.nomadNotes = ctx.nomadNotes || []).push(m); } catch (e) {}
}

const nomadseek = Object.assign({}, capable, {
  id: 'nomadseek',

  daily(Game, ctx) {
    const st = Game.state || {};
    const day = (st.scholar || {}).day || 0;
    const N = Game.nomad, D = Game.nomadDrive;

    // The Watchers: answer the global beat. Never decline.
    if (st.pendingGlobal && typeof Game.answerGlobalChoice === 'function') {
      try {
        Game.answerGlobalChoice('feast');
        ctx.nomadGlobalAnswered = (ctx.nomadGlobalAnswered || 0) + 1;
        note(ctx, 'day ' + day + ': answered the Watchers (feast)');
      } catch (e) { note(ctx, 'answerGlobalChoice: ' + e.message); }
    }

    if (!N || !D) { try { capable.daily(Game, ctx); } catch (e) {} return; }

    let onRoad = false;
    try { onRoad = !!(N.onRoad && N.onRoad()); } catch (e) {}

    if (onRoad) {
      // Drive the road. The engine ticks nomad.daily() at endDay on its own.
      ctx.nomadRoadDays = (ctx.nomadRoadDays || 0) + 1;
      try {
        const r = st.road;
        if (r && r.active) {
          // Rest at the foreign village when the packs run thin — a capable
          // traveler doesn't starve past a friendly fire.
          try {
            const leg = r.legs[r.legIndex];
            const v = leg && leg.village;
            const food = Math.round((r.supplies || {}).food || 0);
            const partyN = (r.partyIds || []).length;
            const W = Game.nomadWild;
            if (v && W && food < partyN * 2000 * 6 && !(v.joinedDays > 0) &&
                typeof W.villageMood === 'function' && typeof W.joinVillage === 'function' &&
                W.villageMood(v) >= 0) {
              W.joinVillage(v, 3);
              ctx.nomadJoins = (ctx.nomadJoins || 0) + 1;
              note(ctx, 'day ' + day + ': rested 3 days at ' + (v.name || 'a foreign village'));
            }
          } catch (e) { note(ctx, 'join: ' + e.message); }
          const anyActive = r.legs.some(l => l.status === 'active');
          const cur = r.legs[r.legIndex];
          const pending = r.legs.find(l => l.status === 'pending');
          if (pending && (!anyActive || (cur && cur.status === 'done'))) {
            D.moveOnTap();
            ctx.nomadMoves = (ctx.nomadMoves || 0) + 1;
          }
        }
      } catch (e) { note(ctx, 'road drive: ' + e.message); }
      return;
    }

    // Village life, played capable.
    try { capable.daily(Game, ctx); } catch (e) { note(ctx, 'capable.daily: ' + e.message); }

    // Leave the moment we're eligible.
    let g = { ok: false, reason: 'no_nomad' };
    try { g = N.canLeave ? N.canLeave() : g; } catch (e) { note(ctx, 'canLeave: ' + e.message); }
    if (!g.ok) {
      const reason = g.reason || 'unknown';
      ctx.nomadLastGate = reason;
      ctx.nomadGateDays = ctx.nomadGateDays || {};
      ctx.nomadGateDays[reason] = (ctx.nomadGateDays[reason] || 0) + 1;
      return;
    }
    try {
      const r = N.start();
      if (r && r.active) {
        ctx.nomadDeparted = true;
        ctx.nomadDepartDay = day;
        ctx.nomadDepartKin = (g.kin || []).length;
        ctx.nomadPartySize = (r.partyIds || []).length;
        note(ctx, 'day ' + day + ': LEFT the village (' + ctx.nomadDepartKin + ' known kin, party of ' + ctx.nomadPartySize + ')');
        try { N.enterLeg(0); } catch (e) { note(ctx, 'enterLeg: ' + e.message); }
      }
    } catch (e) { note(ctx, 'start: ' + e.message); }
  },
});

module.exports = { nomadseek };
