// winseek-sitdrive-b — WINSEEK + THE SIT DRIVE
// (arm sim-sitdrive-winseek-b, run fleshout-loop-b-20261109T0630Z, axis
// scale-onramp / winnability chain).
//
// POLICY-SIDE ONLY. ZERO src/js changes, zero default flips, no
// changes to any existing policy file. This file composes the FROZEN
// winseek policy (scripts/policies/winseek.js, unmodified) with a sit
// drive on top, gated default-OFF (SITDRIVE_B=1).
//
// THE BLANK (diag sim-sitgap-winseek-b, evidence/2026-11-08/
// sim-sitgap-winseek-b.md): on band 53001–53008 under winseek, 3 seeds
// (53001, 53002, 53007) hold a ready lesser seat 27/25/6 days with the
// scholar at Haven every ready day and ZERO sit-verb calls — winseek
// extends base competent (never linkfeast), competent never calls
// tableTakeSeat, and winseek's tableRoad only answers tableChoices
// prompts that never exist pre-sit. The other 5/8 die before the
// day-90 floor. THIS file builds the sit drive for winseek: a policy
// that calls the real Game.tableTakeSeat() verb on a preview-ready day
// (scholar at Haven, no entry block, no live fight), waiting encounters
// out.
//
// SHAPE DECISION (prereg — do not re-decide): the drive is ported into
// winseek as a composite, NOT lifted into base competent. competent.js
// is frozen substrate shared by every competent-derived policy — a
// drive there changes every baseline those arms measure against. The
// precedent is composition (takeseat.js 2026-10-17, 13/16 tables sat;
// competent-linkfeast-b.js 2026-11-07, TAKESEAT_B=1). The drive below
// is the linkfeast-b shape, copied — classified skips, module-level
// STATS, at-Haven check, never-twice — with its own gate (SITDRIVE_B)
// and its own stats, so winseek's measurement does not couple to
// linkfeast's module. No change to winseek.js or competent.js.
//
// WHAT THE SIT DRIVE DOES:
//   - never while Game.over; never while a tbfight is live
//     (classified skip 'fight' — the seat can wait; it is never a
//     mid-combat move).
//   - never twice: ctx.tsSeatTaken + pg.tableDone.
//   - requires pg.tableAnnounced (the invitation was announced).
//   - requires the scholar at Haven (playerAtHaven — classified
//     skip 'away').
//   - reads tablePreview(): null is a classified skip
//     ('preview-null'); not-ready is a classified skip carrying the
//     engine's why ('not-ready:<why>'). Only a ready preview calls
//     the real Game.tableTakeSeat(), and the result (ok/fail, day,
//     seat kind, doors offered via scholar.tableChoices) is recorded.
//   - the engine owns the day-90 floor: tablePreview() is null
//     before day 90, and the drive never bypasses that.
// WHAT IT DOES NOT DO (stated so the census cannot be misread):
//   - No door answers: never calls tableOfferSeatTaker,
//     tableChooseSeatTaker, or chooseTableOption. The 7-door modal
//     the sit opens is the engine's; winseek's pre-existing tableRoad
//     drains first-option beats after a sit exactly as it would for
//     a human player who sat — that behavior is unchanged by this
//     arm, not added by it.
//   - No sitter choice: the sitting defaults to the player
//     character, the engine's unchanged default in tableScene.
//   - No RNG draws, no state writes before the verb itself: the
//     preview path (tableSeat + tableEarnedPaths + overtimeStanding
//     + fullSeatShortfall + tableEntryBlock) consumes no Math.random
//     (verified 2026-11-07 — the single R() in table.js is
//     tableDeedLines' local mulberry32 stream; overtime.js holds
//     zero Math.random; the witness prereq is pure).
//
// COUNTERS: per-run ctx counters (ts*) plus module-level stats
// (resetTakeseatStats / takeseatStats) so the driver can capture
// per-seed numbers without reaching into harness ctx. The sitgap
// recorder reads these via takeseatStats().
'use strict';
const WINSEEK = require('./winseek');
const winseek = WINSEEK.winseek;

function layerOn() { return process.env.SITDRIVE_B === '1'; }

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function dayPartOf(Game) { try { return (Game.dayPart == null) ? null : (Game.dayPart | 0); } catch (e) { return null; } }

const STATS = { seatAttempts: 0, seatTaken: 0, seatFailed: 0,
  seatDay: null, seatKind: null, doorsOffered: null,
  skips: {}, errors: 0, events: [] };
function resetTakeseatStats() {
  STATS.seatAttempts = 0; STATS.seatTaken = 0; STATS.seatFailed = 0;
  STATS.seatDay = null; STATS.seatKind = null; STATS.doorsOffered = null;
  STATS.skips = {}; STATS.errors = 0; STATS.events = [];
}
function takeseatStats() { return JSON.parse(JSON.stringify(STATS)); }
function noteErr(where, e) {
  try {
    STATS.errors += 1;
    if (STATS.events.length < 200) STATS.events.push({ day: -1, what: 'error:' + where, detail: String((e && e.message) || e).slice(0, 120) });
  } catch (e2) {}
}
function skip(reason, Game) {
  try {
    STATS.skips[reason] = (STATS.skips[reason] || 0) + 1;
    if (STATS.events.length < 200) {
      STATS.events.push({ day: gday(Game), part: dayPartOf(Game), what: 'skip', detail: reason });
    }
  } catch (e) {}
}

// takeSeatDrive: the whole driver. Read-only until the seat verb
// itself; every early exit is classified in STATS (never an attempt).
// The gate is checked HERE (not only in the wrapper) so the RED phase
// pins: gate OFF never drives the verb even when called directly.
function takeSeatDrive(Game, ctx) {
  if (!layerOn()) return; // gate off: pure delegation — never drive
  try {
    // LUXURY-MOVE SAFETY (takeseat.js precedent): not while the game
    // is over, never while a fight is live — the seat can wait.
    if (Game.over) { skip('over', Game); return; }
    const f = Game.tbfight;
    if (f && !f.over) { skip('fight', Game); return; }
    let pg = {};
    try { pg = Game.progState ? Game.progState() : {}; } catch (e) {}
    if (pg.tableDone) { skip('already-done', Game); return; } // the seat is locked — never take twice
    if (ctx && ctx.tsSeatTaken) { skip('already-taken', Game); return; } // this policy instance already drove it
    if (!pg.tableAnnounced) { skip('not-announced', Game); return; } // the invitation was never announced
    if (typeof Game.playerAtHaven === 'function') {
      let atHaven = false;
      try { atHaven = !!Game.playerAtHaven(); } catch (e) { atHaven = false; }
      if (!atHaven) { skip('away', Game); return; }
    }
    if (typeof Game.tablePreview !== 'function' || typeof Game.tableTakeSeat !== 'function') { skip('no-verbs', Game); return; }
    let pv = null;
    try { pv = Game.tablePreview(); } catch (e) { noteErr('tablePreview', e); return; }
    if (!pv) { skip('preview-null', Game); return; } // not staged / not earned / pre-day-90 — the engine's answer
    if (!pv.ready) { skip('not-ready:' + String(pv.why || 'unknown block').slice(0, 80), Game); return; } // the engine says not takeable — never force it
    // THE VERB — exactly as capable.js's tableRoad does it.
    STATS.seatAttempts += 1;
    try { if (ctx) ctx.tsSeatAttempts = (ctx.tsSeatAttempts || 0) + 1; } catch (e) {}
    const day = gday(Game);
    const kind = pv.seat || null;
    let r = null;
    try { r = Game.tableTakeSeat(); } catch (e) { STATS.seatFailed += 1; noteErr('tableTakeSeat', e); return; }
    if (r && r.ok) {
      STATS.seatTaken += 1;
      STATS.seatDay = day;
      STATS.seatKind = kind;
      try { if (ctx) { ctx.tsSeatTaken = (ctx.tsSeatTaken || 0) + 1; ctx.tsSeatDay = day; ctx.tsSeatKind = kind; } } catch (e) {}
      let doors = null;
      try {
        const tc = ((Game.state || {}).scholar || {}).tableChoices;
        doors = (tc && tc.options) ? tc.options.length : 0;
      } catch (e) { doors = null; }
      STATS.doorsOffered = doors;
      if (STATS.events.length < 200) {
        STATS.events.push({ day: day, part: dayPartOf(Game), what: 'sat', detail: 'seat ' + String(kind) + ', doors offered ' + String(doors) });
      }
    } else {
      STATS.seatFailed += 1;
      if (STATS.events.length < 200) {
        STATS.events.push({ day: day, part: dayPartOf(Game), what: 'failed', detail: String((r && r.msg) || 'no msg').slice(0, 120) });
      }
    }
  } catch (e) { noteErr('takeSeatDrive', e); }
}

const winseekSitdrive = Object.assign({}, winseek, {
  id: 'winseek-sitdrive-b',
  desc: 'winseek + sit drive (SITDRIVE_B=1): drives Game.tableTakeSeat() via the real verb when the invitation is staged, announced, and the engine says takeable',
  upkeep(Game, ctx) {
    try { if (typeof winseek.upkeep === 'function') winseek.upkeep(Game, ctx); } catch (e) { noteErr('upkeep-winseek', e); }
    try { takeSeatDrive(Game, ctx); } catch (e) { noteErr('upkeep-takeseat', e); }
  },
});

module.exports = { winseekSitdrive: winseekSitdrive,
  layerOn: layerOn, takeSeatDrive: takeSeatDrive,
  resetTakeseatStats: resetTakeseatStats, takeseatStats: takeseatStats };
