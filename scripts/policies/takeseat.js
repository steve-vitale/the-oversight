// takeseat — the take-seat driver for the feastscale substrate
// (flesh-out loop, axis scale-onramp, 2026-10-17).
//
// THE GATE (evidence/2026-10-17/sim-feastblow.md: 'no-driver'): on the true
// feastscale substrate (leadfeast/belongfeast, SEATDRIVE=0), the chain runs
// to completion and then has nowhere to go — foodDeeds 15/16, seat-earned
// (lesser) 15/16, invitation staged 15/16, announced 14/16, tableDone 0/16,
// won 0/16. Base courtship has NO seat-taking verb — only capable.js's
// tableRoad and the seatdrive layer take the seat. This layer is the driver
// on the feastscale road: after the base's upkeep, if the invitation is
// staged AND announced AND the engine says the seat is takeable, drive the
// REAL Game.tableTakeSeat() via the REAL verb. Nothing else: the layer does
// not manufacture invitations, does not answer the table modal, and never
// takes twice. It only opens the door — reachability measurement
// (mission item 3: national → table → wins chain on base courtship).
//
// THE CALL SEQUENCE mirrors capable.js tableRoad (~l694-727) verbatim,
// minus the CAPABLE_GREEDY waiting logic (a separate tuning layer, not
// this driver):
//   !pg.tableDone && Game.tablePreview && Game.tablePreview().ready
//   -> Game.tableTakeSeat()
// Task additions (engine-honest, all read-only): the invitation must also
// be ANNOUNCED (pg.tableAnnounced — the task's stated precondition; the
// announced→table conversion is a measured secondary), and the luxury-move
// safety: never while the game is over, never while a fight is live
// (the feastblow layer's safety precedent).
//
// ENGINE-HONEST (canon docs/TABLE.md, engine src/js/table.js):
// - tablePreview() is null when the invitation is not staged
//   (pg.tableWaiting), when the seat is 'none' (the engine withdraws it
//   aloud — pg.tableWaiting=false), when tableDone, and BEFORE DAY 90
//   ("nonexistent before day 90 — no preview, no button, no spoilers").
//   A null preview is the engine saying "not yours yet" — never bypassed.
// - tableTakeSeat() re-checks the preview itself and locks the seat via
//   tableScene (pg.tableDone=true) — the engine owns the double-take
//   guard; the layer ALSO guards via ctx.tsSeatTaken so the verb is never
//   even invoked twice by this policy.
// - The table modal (tableOfferPaths / tableChoices) that follows a
//   successful sit is the ENGINE's — the layer never re-picks doors, never
//   answers, never stalls it. That is another layer's measurement.
//
// TAKESEAT=1 (default OFF — gate off = pure delegation, byte-identical,
// pinned by the proof's RED phase). Zero src/js changes — policy-side only.
'use strict';
const { belongfeast, leadfeast } = require('./feastscale');

function layerOn() { return process.env.TAKESEAT === '1'; }

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

// takeSeatDrive: the whole driver. Read-only until the seat verb itself;
// every early exit is classified in ctx (never an attempt). The gate is
// checked HERE (not only in the wrapper) so the RED phase pins: gate OFF
// never drives the verb even when called directly.
function takeSeatDrive(Game, ctx) {
  if (!layerOn()) return; // gate off: pure delegation — never drive
  // LUXURY-MOVE SAFETY (feastblow precedent): not while the game is over,
  // never while a fight is live — the seat can wait; it is never a
  // mid-combat move.
  if (Game.over) return;
  const f = Game.tbfight;
  if (f && !f.over) { ctx.tsSkippedFight = (ctx.tsSkippedFight | 0) + 1; return; }
  let pg = {};
  try { pg = Game.progState ? Game.progState() : {}; } catch (e) {}
  if (pg.tableDone) return;          // the seat is locked — never take twice
  if (ctx.tsSeatTaken) return;       // this policy instance already drove it
  if (!pg.tableAnnounced) return;    // the invitation was never announced
  if (typeof Game.tablePreview !== 'function' || typeof Game.tableTakeSeat !== 'function') return;
  let pv = null;
  try { pv = Game.tablePreview(); } catch (e) { pv = null; }
  if (!pv) { ctx.tsPreviewNull = (ctx.tsPreviewNull | 0) + 1; return; } // not staged / not earned / pre-day-90 — the engine's answer
  if (!pv.ready) return;             // the engine says not takeable — never force it
  // THE VERB — exactly as capable.js's tableRoad does it.
  ctx.tsSeatAttempts = (ctx.tsSeatAttempts | 0) + 1;
  let r = null;
  try { r = Game.tableTakeSeat(); } catch (e) { ctx.tsDriveError = (ctx.tsDriveError | 0) + 1; return; }
  if (r && r.ok) {
    ctx.tsSeatTaken = (ctx.tsSeatTaken | 0) + 1;
    ctx.tsSeatDay = gday(Game);
    ctx.tsSeatKind = pv.seat;
  } else {
    ctx.tsSeatFailed = (ctx.tsSeatFailed | 0) + 1;
  }
}

// withTakeSeat: the reposition/feastblow composition pattern — wrap the
// feastscale base; after the base's upkeep, drive the seat verb.
function withTakeSeat(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    upkeep(Game, ctx) {
      base.upkeep(Game, ctx);
      if (!layerOn()) return; // gate off: pure delegation
      try { takeSeatDrive(Game, ctx); } catch (e) { ctx.tsDriveError = (ctx.tsDriveError | 0) + 1; }
    },
  });
}

const leadtakeseat = withTakeSeat(
  leadfeast, 'leadtakeseat',
  'leadfeast + takeseat (TAKESEAT=1): drives Game.tableTakeSeat() via the real verb when the invitation is staged, announced, and the engine says takeable'
);
const belongtakeseat = withTakeSeat(
  belongfeast, 'belongtakeseat',
  'belongfeast + takeseat (TAKESEAT=1): drives Game.tableTakeSeat() via the real verb when the invitation is staged, announced, and the engine says takeable'
);

module.exports = { layerOn, takeSeatDrive, withTakeSeat, leadtakeseat, belongtakeseat };
