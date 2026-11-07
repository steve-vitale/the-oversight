// competent-linkfeast-b — the LINK+FEAST composite + the SIT DRIVE
// (arm sim-takeseat-b, run fleshout-loop-b-20261107T1330Z, axis
// scale-onramp / winnability chain).
//
// POLICY-SIDE ONLY. ZERO src/js changes, zero default flips, no
// changes to any existing policy file. This file composes the two
// FROZEN substrates (scripts/policies/competent-linkdrive-b.js and
// scripts/policies/competent-feastdrive-b.js, both unmodified —
// which themselves compose onto the FROZEN staged substrate,
// scripts/policies/competent-stageally-a.js, unmodified) into one
// policy, and adds the sit drive on top.
//
// THE BLANK (diag sim-sitstep2-b, evidence/2026-11-07/sim-sitstep2-b.md):
// on band 53001–53008 the linkdrive-armed replay earns lesser seats
// on 4/8 seeds, the offer is announced and ready, the scholar is at
// Haven and alive on 75/75 preview-ready days — and the sit verb is
// called 0 times, tableChoices never surface, the table is never sat.
// The feast drive (landed GO, eaf80f65f) bought the surge deed on 5/8,
// so the seat's other half is done. THIS file builds the sit drive: a
// policy that calls the real Game.tableTakeSeat() verb on a
// preview-ready day (scholar at Haven, no entry block, no live fight),
// waiting encounters out.
//
// STEVE-CALL behind this arm (do not re-decide it): only the player
// chooses the village's path and who takes the seat (Steve
// 2026-10-26). This arm MEASURES whether sitting works, not whether
// bots should sit. The sit drive is a measurement instrument,
// default OFF (TAKESEAT_B=1), policy-side only.
//
// COMPOSITION (frozen in the prereg — do not tune):
//   daily:  feastdrive.daily (staged.daily + donate-down) THEN
//           linkDrive — staged.daily runs exactly once.
//   upkeep: feastdrive.upkeep (staged.upkeep + feast-at-dusk) THEN
//           the sit drive.
// The gate-OFF composite is the baseline leg; the gate-ON composite
// is the armed leg. Same file, same base, same seeds, same days.
//
// WHAT THE SIT DRIVE DOES (the takeseat.js gate shape, copied
// verbatim — 2026-10-17, 13/16 tables sat on the feastscale
// substrate):
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
// WHAT IT DOES NOT DO (stated so the census cannot be misread):
//   - No door answers: never calls tableOfferSeatTaker,
//     tableChooseSeatTaker, or chooseTableOption. The 7-door modal
//     the sit opens is the engine's; this arm measures whether the
//     sit works and what the modal does in a node sim, it does not
//     play the doors. Any door-answering is a separate pre-registered
//     decision.
//   - No sitter choice: the sitting defaults to the player
//     character, the engine's unchanged default in tableScene.
//   - No RNG draws, no state writes before the verb itself: the
//     preview path (tableSeat + tableEarnedPaths + overtimeStanding
//     + fullSeatShortfall + tableEntryBlock) consumes no Math.random
//     (verified 2026-11-07 — the single R() in table.js is
//     tableDeedLines' local mulberry32 stream; overtime.js holds
//     zero Math.random; the witness prereq is pure). The
//     trajectory-neutrality of the armed leg on never-sat seeds is
//     also proven live by the proof test (seed 53001, no-seat seed).
//
// COUNTERS: per-run ctx counters (ts*) plus module-level stats
// (resetTakeseatStats / takeseatStats) so the driver can capture
// per-seed numbers without reaching into harness ctx. The linkdrive
// and feastdrive module stats keep their own counters; the driver
// resets all three per seed.
'use strict';
const FEAST = require('./competent-feastdrive-b');
const LINK = require('./competent-linkdrive-b');
const feastdrive = FEAST.feastdrive;

function layerOn() { return process.env.TAKESEAT_B === '1'; }

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

const linkfeast = Object.assign({}, feastdrive, {
  id: 'competent-linkfeast-b',
  desc: 'competent-stageally-a + link drive + feast drive + sit drive (TAKESEAT_B=1): drives Game.tableTakeSeat() via the real verb when the invitation is staged, announced, and the engine says takeable',
  daily(Game, ctx) {
    try { feastdrive.daily(Game, ctx); } catch (e) { noteErr('daily-feastdrive', e); }
    try { LINK.linkDrive(Game, ctx); } catch (e) { noteErr('daily-linkdrive', e); }
  },
  upkeep(Game, ctx) {
    try { if (typeof feastdrive.upkeep === 'function') feastdrive.upkeep(Game, ctx); } catch (e) { noteErr('upkeep-feastdrive', e); }
    try { takeSeatDrive(Game, ctx); } catch (e) { noteErr('upkeep-takeseat', e); }
  },
});

module.exports = { linkfeast: linkfeast,
  layerOn: layerOn, takeSeatDrive: takeSeatDrive,
  resetTakeseatStats: resetTakeseatStats, takeseatStats: takeseatStats,
  resetLinkdriveStats: LINK.resetLinkdriveStats, linkdriveStats: LINK.linkdriveStats,
  resetFeastdriveStats: FEAST.resetFeastdriveStats, feastdriveStats: FEAST.feastdriveStats };
