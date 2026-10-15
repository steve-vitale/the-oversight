// seatdrive — the seat-taking driver (sim-seatdrive, 2026-10-15,
// scale-onramp axis).
//
// THE FINDING (sim-wincensus, ARM 1, this run): the landed win-side layers
// (winpursuit + windefer) are provably INERT on current master. Steve's
// 2026-10-14 commit 116a8b9d ("Table seat is a Haven option, not a morning
// prompt") moved the sit to an active Haven-panel action (tableTakeSeat);
// the ONLY sim policy that takes the seat is capable.js's tableRoad. The
// courtship-road chain (leadcourt/belongseek → scalecourt/competent →
// feastscale → tribfloor) contains ZERO seat-taking verbs: the wincensus
// sweep measured 15/16 invitations, 0 sittings, 0 answers, wins 0/16 both
// sides, 16/16 armed-control pairs byte-identical. The winpursuit drain and
// the windefer hold discipline operate on the table modal, which never
// exists. This layer is the missing DRIVER: it takes the seat when the
// invitation is pending. The landed layers drive the modal — this layer
// only opens the door; it never re-picks doors and never stalls
// mid-challenge.
//
// THE CALL SEQUENCE is capable.js's tableRoad (scripts/policies/capable.js
// ~line 697), replicated verbatim minus the CAPABLE_GREEDY waiting logic
// (a separate tuning layer for another measurement, not this driver):
//   tablePreview() -> pv.ready -> Game.tableTakeSeat() -> r.ok counts.
// The engine owns the scene (table.js tableScene/tableOfferPaths) — the
// policy never reimplements it.
//
// GUARD CLASSIFICATION (sim-findings #294: COUNCIL-GATED VERB PLEAS NEED
// GUARD CLASSIFICATION): tableTakeSeat is a council-gated verb. The layer
// pre-checks the exile/joined gate (the canPropose pattern from
// belongseek.js: !scholar.exiled && !scholar.joinedVillage) and classifies
// a guard refusal (ctx.sdGuardRefused) separately from an attempt
// (ctx.sdSeatAttempts). A guard refusal is never counted as a failed
// attempt. Scholar-alive is a precondition (ctx.sdNoScholar), likewise not
// an attempt. No invitation pending (tablePreview() null) is not an
// attempt either — there is nothing to drive.
//
// COMPOSITION: withSeatDrive wraps the windefer-wrapped tribfloor base
// (the same stack the census measured). Seat first at dawn, then the
// windefer daily drains the modal with the hold discipline, then the base.
// Env-gated SEATDRIVE=1 (default OFF — unset delegates byte-identically;
// the proof's det-gate pins that).
//
// POLICY-SIDE ONLY — zero src/js changes.
'use strict';
const TF = require('./tribfloor');
const WD = require('./windefer');

function layerOn() { return process.env.SEATDRIVE === '1'; }

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

// canPropose pattern (belongseek.js): Haven-council verbs are exile-gated
// in the engine (hierarchy.js _blockIfNotHaven returns null without ever
// scoring when the persona is exiled or has joined another fire). Pre-check
// here so the guard refusal is classified, not counted.
function canPropose(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    return !s.exiled && !s.joinedVillage;
  } catch (e) { return false; }
}

// scholarAlive: the player persona has a living person record. When the
// bearer dies the mantle passes to a new villager; a dead person record
// with no living scholar means there is nobody to sit with.
function scholarAlive(Game) {
  try {
    const sid = Game.villagerId;
    if (!sid || typeof Game.getPerson !== 'function') return true; // cannot tell — do not block on unknowns
    const p = Game.getPerson(sid);
    if (!p) return true; // no record to judge — do not block on unknowns
    return !p.dead;
  } catch (e) { return true; }
}

// driveSeat: the whole driver. Read-only until the seat verb itself; every
// early exit is classified (never an "attempt").
function driveSeat(Game, ctx) {
  let pg = {};
  try { pg = Game.progState ? Game.progState() : {}; } catch (e) {}
  if (pg.tableDone) return; // the seat is locked — nothing to drive
  if (typeof Game.tablePreview !== 'function' || typeof Game.tableTakeSeat !== 'function') return;
  let pv = null;
  try { pv = Game.tablePreview(); } catch (e) { pv = null; }
  if (!pv) return; // no invitation pending — not an attempt
  ctx.sdPreviewSeen = (ctx.sdPreviewSeen | 0) + 1;
  if (!pv.ready) return; // preview exists but not sittable — not an attempt
  if (!scholarAlive(Game)) { ctx.sdNoScholar = (ctx.sdNoScholar | 0) + 1; return; }
  if (!canPropose(Game)) {
    // #294: guard refusal — classified, never counted as an attempt.
    ctx.sdGuardRefused = (ctx.sdGuardRefused | 0) + 1;
    return;
  }
  // The call sequence, exactly as capable.js's tableRoad does it.
  ctx.sdSeatAttempts = (ctx.sdSeatAttempts | 0) + 1;
  let r = null;
  try { r = Game.tableTakeSeat(); } catch (e) { r = null; }
  if (r && r.ok) {
    ctx.sdSeatTaken = (ctx.sdSeatTaken | 0) + 1;
    ctx.sdSeatDay = gday(Game);
    ctx.sdSeatKind = pv.seat;
  } else {
    ctx.sdSeatFailed = (ctx.sdSeatFailed | 0) + 1;
  }
}

function withSeatDrive(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    daily(Game, ctx) {
      if (!layerOn()) return base.daily(Game, ctx); // gate off: pure delegation
      try { driveSeat(Game, ctx); } catch (e) { ctx.sdDriveError = (ctx.sdDriveError | 0) + 1; }
      return base.daily(Game, ctx);
    },
  });
}

// The sweep imports these ids ('leadfeast-windefer', 'belongfeast-windefer'
// — the same ids the census armed side used; both sides share the objects,
// SEATDRIVE is the only switch). The composition mirrors the census armed
// stack exactly: tribfloor base -> withWinDefer -> withSeatDrive.
const leadseat = withSeatDrive(
  WD.withWinDefer(TF.leadfeast, 'leadfeast-windefer', 'leadfeast + win-side layers (WINPURSUIT=1 + WINDEFER=1) over the tribfloor base'),
  'leadfeast-windefer',
  'leadfeast-windefer + seatdrive (SEATDRIVE=1): takes the table seat when the invitation is pending, then the win-side layers drive the modal'
);
const belongseat = withSeatDrive(
  WD.withWinDefer(TF.belongfeast, 'belongfeast-windefer', 'belongfeast + win-side layers (WINPURSUIT=1 + WINDEFER=1) over the tribfloor base'),
  'belongfeast-windefer',
  'belongfeast-windefer + seatdrive (SEATDRIVE=1): takes the table seat when the invitation is pending, then the win-side layers drive the modal'
);

module.exports = {
  layerOn, withSeatDrive, canPropose, scholarAlive, driveSeat,
  leadseat, belongseat,
};
