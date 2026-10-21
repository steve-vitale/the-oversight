// nowinwindow — the no-win policy layer (flesh-out loop, 2026-10-21,
// arm sim-nowinwindow, axis scale-onramp, backlog #748's named next).
//
// THE QUESTION (sim-windowreach-r3, DIAG-insufficient-data, run
// fleshout-20261021T1615Z): the wave-5 door is a lagging indicator of wins —
// 4 measured unlocks, all won through the window without fighting wave-5.
// The win truncates every measurement at ~d90-130, so wave-5 REACH is
// unmeasured. The r3 arm proved the harness cannot continue post-win within
// the DIAG read-only constraint (runDays stops at Game.over; clearing it
// would be a game-state write). The honest route to a true post-unlock
// window census: a policy that reaches the door but NEVER sits.
//
// THE VETO: the only sim seat verbs are capable.js's tableRoad and
// seatdrive.js's driveSeat — both funnel through the engine verb
// Game.tableTakeSeat() (table.js:783; the single entry to the table modal,
// and all four `won = true` sites live downstream of it). The layer wraps
// the vgearconfirm winning stack OUTSIDE and, for the duration of the inner
// policy's daily, replaces Game.tableTakeSeat with a refusing stub. Every
// sit attempt — seatdrive's, capable's, any future driver's — is declined.
// Invitations are NOT suppressed: tablePreview() still reads live, the
// table is still announced, overtime still accrues (the honest cost of
// refusing the seat, per docs/TABLE.md). The seat is never taken, so the
// modal never opens and winseek's tableRoad drain stays a no-op.
//
// Env-gated NOWINWINDOW=1, default OFF — unset = pure delegation to the
// vgearconfirm substrate (the proof's det-gate pins byte-identity).
// POLICY-SIDE ONLY — zero src/js changes.
'use strict';
const VCE = require('./vgearconfirm');

function layerOn() { return process.env.NOWINWINDOW === '1'; }

// withNoWin(base, id, desc): refuse the seat. When the layer is off this is
// pure delegation. When on, Game.tableTakeSeat is neutered for the duration
// of base.daily (restored in a finally — the engine verb is an own property
// of the Game instance, table.js self-attaches via Object.assign, so a plain
// reassign/restore is exact). Refusals are counted on ctx for the sweep's
// honest reporting: nwSeatRefusals (every declined sit) and
// nwFirstRefusalDay (the first day the seat was declined).
function withNoWin(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    daily(Game, ctx) {
      if (!layerOn()) return base.daily(Game, ctx); // gate off: pure delegation
      const orig = Game.tableTakeSeat;
      let day = 0;
      try { day = (((Game.state || {}).scholar || {}).day | 0) || 0; } catch (e) {}
      const refusing = function () {
        try {
          ctx.nwSeatRefusals = (ctx.nwSeatRefusals | 0) + 1;
          if (!ctx.nwFirstRefusalDay) ctx.nwFirstRefusalDay = day;
        } catch (e) {}
        // Decline the invitation aloud in the refusal shape the drivers
        // already handle: driveSeat counts r.ok===false as a failed attempt,
        // never a sit. Nothing downstream of the sit can run.
        return { ok: false, refused: 'nowinwindow', msg: 'The seat stays empty. The village is not done yet.' };
      };
      Game.tableTakeSeat = refusing;
      try {
        return base.daily(Game, ctx);
      } finally {
        try { Game.tableTakeSeat = orig; } catch (e) {}
      }
    },
  });
}

// armedFor(base): the vgearconfirm winning stack, seat-refusing.
// base in {'leadfeast','belongfeast'} (vgearconfirm.normBase).
function armedFor(base) {
  const b = VCE.normBase(base);
  const tag = b === 'leadfeast' ? 'lead' : 'belong';
  const inner = VCE.armedFor(b);
  return withNoWin(inner,
    `${tag}-nowinwindow`,
    `${b} + win-side layers + seatdrive + VILLAGERGEAR (the vgearconfirm winning substrate) + NOWINWINDOW=1: the seat is refused, invitations declined, the post-invitation window runs to the horizon`);
}

module.exports = { layerOn, withNoWin, armedFor };
