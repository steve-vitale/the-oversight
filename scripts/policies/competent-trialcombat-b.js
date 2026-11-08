// competent-trialcombat-b — the TRIAL-BY-COMBAT drive on the frozen
// feareddoor substrate (arm sim-trialcombat-b, run
// fleshout-loop-b-20261108T0530Z, axis scale-onramp / winnability
// chain).
//
// POLICY-SIDE ONLY. ZERO src/js changes, zero default flips, no
// changes to any existing policy file — scripts/policies/
// competent-feareddoor-b.js is required, never edited; the feared-
// first door rule, the drain, and the sit drive all come from it
// verbatim.
//
// THE BLANK (sim-feareddoor-b, evidence/2026-11-07/
// sim-feareddoor-b.md): feared was walked 5/5 and won 5/5 — but
// the trial-by-combat door inside the feared path was NEVER entered:
// every prior door drain skips 'beat:trial' by rule ("trial-by-
// combat is opt-in only"). THIS file opts in: when a FEARED door
// is walked and the calibration beat offers the trial, take it.
// Baseline (TRIALCOMBAT_B unset) delegates to the feareddoor
// wrapper byte-identically: feared walked, first-option beats,
// trial never taken.
//
// STEVE-CALL behind this arm (do not re-decide it): only the
// player chooses the village's path and who takes the seat (Steve
// 2026-10-26). This arm MEASURES whether entering the trial works,
// not whether bots should sit or which path a player should take.
// The policy is a measurement instrument, default OFF
// (TRIALCOMBAT_B=1), policy-side only.
//
// COMPOSITION (frozen in the prereg — do not tune):
//   daily:  feareddoor.daily untouched (linkfeast daily).
//   upkeep: TRIALCOMBAT_B unset -> feareddoor.upkeep exactly (the
//           BASELINE leg: feared-first walk, no trial).
//           TRIALCOMBAT_B=1 -> linkfeast.upkeep (feast upkeep + sit
//           drive) THEN the trialcombat-door drive. The feareddoor
//           drive itself never runs in the armed leg, so the two legs
//           differ ONLY in the trial opt-in at feared beat 1.
// The harness calls upkeep 3x a day (once per day-part), so on the
// decision point where the sit fires, the door is walked the same
// part — entry day = sit day by construction.
//
// THE DOOR RULE (pre-registered in evidence/2026-11-08/
// sim-trialcombat-b-prereg.md — POLICY-SIDE, not canon): the
// feareddoor feared-first rule verbatim (FEAR.pickDoorFeared).
//
// THE TRIAL RULE (pre-registered — the whole lever): at a
// 'challenge'-phase modal where T.path === 'feared' AND T.beat
// === 1 AND 'beat:trial' is among the offered options, choose
// 'beat:trial'. Everywhere else the drain is the doorwalk
// pickOption verbatim (first presented option, trial filtered
// out). A trial offered at any other path or beat is NEVER taken
// — the opt-in belongs to the feared calibration beat alone.
// Downgrade re-applies the feared-first rule. Finals take the
// first option. The dark conscript is REFUSED ('conscript:no').
// Demand-price takes the first option. Branches stay ledger-
// earned — the driver NEVER overrides tableBranch. The driver
// NEVER answers a 'seat:*' option and NEVER calls
// tableOfferSeatTaker / tableChooseSeatTaker.
//
// MECHANISM NOTE (read from src/js/table-feared.js, not guessed):
// the trial choice exists only at feared beat 1 (the choice list
// appends { id: 'trial', effects: { trial: true } } iff
// !T.trialRefused). Choosing it pauses the challenge and starts
// a REAL fight: startCombat('finale', { tableTrial: true }) — the
// Finale, wave-5 (1800–2200 HP), fought on the grid right now.
// tbEnd resumes the table (tableTrialResume): won → terror 10;
// lost → weakened +1, terror −3, and if the Bearer dies the
// mantle passes mid-table. The trial fight is driven by the
// harness default fight driver (strike nearest, no abilities) —
// the measurement is whether the default-driven Bearer can beat
// the Finale, not whether a tuned fighter could. The SEAT-TAKER
// GUARD withholds the trial when the sitter is a villager; the
// sit drive takes the seat as the scholar, so the guard is
// expected not to fire — if it does, the analyzer records the
// withheld trial from the transcript ('TRIAL WITHHELD'), not as
// an offered one. The feared prereq (might+killed >= 6,
// table-feared.js) is engine-side and is what makes the door
// offered or not; the policy never forces an unearned door.
//
// COUNTERS: per-run module stats (resetTrialcombatStats /
// trialcombatStats) mirroring the feareddoor shape, plus
// trialsOffered / trialsEntered. The feareddoor / doorwalk /
// takeseat / linkdrive / feastdrive module stats keep their own
// counters; the driver resets all of them per seed.
'use strict';
const DW = require('./competent-doorwalk-b');
const FEAR = require('./competent-feareddoor-b');
const LF = require('./competent-linkfeast-b');
const linkfeast = LF.linkfeast;
const doorwalk = DW.doorwalk;
const feareddoor = FEAR.feareddoor;

// Default-OFF: TRIALCOMBAT_B=1 is the only on-switch. Unset (or any
// other value) delegates to the feareddoor wrapper byte-identically
// (the baseline leg: feared-first walk, trial never taken).
function layerOn() { return process.env.TRIALCOMBAT_B === '1'; }

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function dayPartOf(Game) { try { return (Game.dayPart == null) ? null : (Game.dayPart | 0); } catch (e) { return null; } }

const STATS = { answers: 0, doorsEntered: 0, walked: [], offers: [], log: [],
  skips: {}, errors: 0, events: [], stalls: 0, trialsOffered: 0, trialsEntered: 0 };
function resetTrialcombatStats() {
  STATS.answers = 0; STATS.doorsEntered = 0; STATS.walked = []; STATS.offers = [];
  STATS.log = []; STATS.skips = {}; STATS.errors = 0; STATS.events = []; STATS.stalls = 0;
  STATS.trialsOffered = 0; STATS.trialsEntered = 0;
}
function trialcombatStats() { return JSON.parse(JSON.stringify(STATS)); }
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

function tablePhaseOf(Game) {
  try {
    const T = (typeof Game.tableState === 'function') ? Game.tableState() : null;
    return (T && T.phase != null) ? String(T.phase) : null;
  } catch (e) { return null; }
}
function tableSnap(Game) {
  const s = {};
  try {
    const T = (typeof Game.tableState === 'function') ? Game.tableState() : null;
    s.phase = T && T.phase != null ? String(T.phase) : null;
    s.path = T && T.path != null ? String(T.path) : null;
    s.branch = T && T.branch != null ? String(T.branch) : null;
    s.beat = T && T.beat != null ? (T.beat | 0) : null;
    s.trialPending = !!(T && T.trialPending);
  } catch (e) {}
  return s;
}

// pickDoorTrialcombat(Game, opts, assigned): the feared-first door
// rule, verbatim from the feareddoor policy (never re-implemented
// here, so the door rule cannot drift between the legs).
function pickDoorTrialcombat(Game, opts, assigned) {
  return FEAR.pickDoorFeared(Game, opts, assigned);
}

// pickOptionTrialcombat(Game, ms, assigned): one drain pick. Paths
// phase uses the feared-first rule; downgrade re-applies feared-first
// (assigned='feared' into the doorwalk downgrade rule); the challenge
// phase takes 'beat:trial' ONLY at feared beat 1 when offered —
// every other beat/path falls through to the doorwalk pickOption
// verbatim (first presented option, trial filtered out).
function pickOptionTrialcombat(Game, ms, assigned) {
  if (ms.phase === 'paths') {
    const r = FEAR.pickDoorFeared(Game, ms.opts, assigned);
    if (r.skip) return { skip: r.skip };
    return { id: r.pick.id, note: r.pick.why, doorEvent: r.pick };
  }
  if (ms.phase === 'downgrade') return DW.pickOption(Game, ms, 'feared');
  if (ms.phase === 'challenge') {
    const T = ms.T || {};
    const opts = ms.opts || [];
    const trialOffered = opts.some(function (o) { return String((o && o.id) || '') === 'beat:trial'; });
    if (trialOffered && String(T.path || '') === 'feared' && (T.beat | 0) === 1) {
      return { id: 'beat:trial', note: 'trial-opt-in', trialEvent: true };
    }
    // Trial offered at the wrong path/beat (or not offered at all):
    // never take it — the safe first option via the doorwalk rule.
    return DW.pickOption(Game, ms, assigned);
  }
  return DW.pickOption(Game, ms, assigned);
}

// drainTableTrialcombat: the forcing drain. The doorwalk drainTable loop
// contract (30-answer cap, no-progress stall guard, Game.over
// break, live-fight break), with pickOptionTrialcombat in place of the
// doorwalk pickOption and the trialcombat module stats in place of the
// feareddoor stats. Read-only until each chooseTableOption call.
// A feared beat-1 modal offering the trial is counted in
// STATS.trialsOffered once, at pick time; a taken trial in
// STATS.trialsEntered.
function drainTableTrialcombat(Game, ctx, assigned) {
  let n = 0, lastSig = null, stall = 0;
  if (!DW.modalState(Game)) { skip(tablePhaseOf(Game) === 'paths' ? 'no-doors-offered' : 'no-options', Game); return 0; }
  for (;;) {
    if (Game.over) break;
    if (n >= 30) break;
    try { if (Game.tbfight && !Game.tbfight.over) { skip('fight-live', Game); break; } } catch (e) {}
    const ms = DW.modalState(Game);
    if (!ms) break;
    const sig = ms.phase + '|' + ms.opts.map(function (o) { return o.id; }).join(',');
    if (sig === lastSig && ++stall >= 2) { STATS.stalls = (STATS.stalls | 0) + 1; break; }
    lastSig = sig;
    const pick = pickOptionTrialcombat(Game, ms, assigned);
    if (pick.skip) { skip(pick.skip, Game); break; }
    if (!pick.id) break;
    const before = tableSnap(Game);
    // The trial offer is visible exactly here: a challenge-phase modal
    // at feared beat 1 whose options include 'beat:trial'. Count it
    // once per walk (the drain breaks on the live fight right after
    // taking it, and moves past beat 1 otherwise).
    const trialOfferedHere = (before.phase === 'challenge' && before.path === 'feared' &&
      (before.beat | 0) === 1 && (ms.opts || []).some(function (o) { return String((o && o.id) || '') === 'beat:trial'; }));
    if (trialOfferedHere) STATS.trialsOffered = (STATS.trialsOffered | 0) + 1;
    if (pick.id === 'beat:trial') STATS.trialsEntered = (STATS.trialsEntered | 0) + 1;
    try { Game.chooseTableOption(pick.id); } catch (e) { noteErr('chooseTableOption', e); break; }
    n++;
    STATS.answers = (STATS.answers | 0) + 1;
    const after = tableSnap(Game);
    const rec = {
      day: gday(Game), phase: before.phase, path: before.path, branch: before.branch,
      beat: before.beat, optionId: pick.id, note: pick.note,
      toPhase: after.phase, toPath: after.path, toBranch: after.branch, toBeat: after.beat,
      trialPending: after.trialPending,
      trialOffered: !!trialOfferedHere, trialPicked: pick.id === 'beat:trial',
    };
    STATS.log.push(rec);
    if (pick.doorEvent) {
      STATS.offers.push({ day: rec.day, offered: pick.doorEvent.offered || null,
        assigned: assigned || null, picked: String(pick.id).replace(/^(path:|downgrade:)/, ''),
        rule: pick.doorEvent.why });
      if (STATS.events.length < 200) {
        STATS.events.push({ day: rec.day, part: dayPartOf(Game), what: 'door', detail: pick.id + ' (' + pick.doorEvent.why + ')' });
      }
    }
    // A door walked: record the walk (phase 'paths' -> 'challenge' with
    // a path set, or a 'downgrade:' pick that starts a new path).
    if ((before.phase === 'paths' && after.path && after.phase === 'challenge') ||
        (before.phase === 'downgrade' && after.path && after.phase === 'challenge')) {
      STATS.doorsEntered = (STATS.doorsEntered | 0) + 1;
      STATS.walked.push({ day: rec.day, path: after.path, branch: after.branch,
        door: pick.id, fellBack: !!(pick.doorEvent && pick.doorEvent.fellBack) });
      try { if (ctx) { ctx.tcWalked = (ctx.tcWalked | 0) + 1; ctx.tcWalkedPath = after.path; ctx.tcWalkedDay = rec.day; } } catch (e) {}
      if (STATS.events.length < 200) {
        STATS.events.push({ day: rec.day, part: dayPartOf(Game), what: 'walked', detail: after.path + ' (' + (after.branch || '?') + ')' });
      }
    }
    if (before.phase === 'finals') {
      if (STATS.events.length < 200) {
        STATS.events.push({ day: rec.day, part: dayPartOf(Game), what: 'final', detail: pick.id + ' on ' + (before.path || '?') });
      }
    }
    if (STATS.log.length > 400) STATS.log.splice(0, STATS.log.length - 400);
  }
  return n;
}

// trialcombatDoorDrive: the whole driver. Read-only until a door/beat verb
// itself; every early exit is classified in STATS (never an answer).
// The gate is checked HERE (not only in the wrapper) so the RED phase
// pins: gate OFF never drives the verb even when called directly.
function trialcombatDoorDrive(Game, ctx) {
  if (!layerOn()) return; // gate off: pure delegation — never drive
  try {
    // LUXURY-MOVE SAFETY (takeseat.js precedent): not while the game
    // is over, never while a fight is live — the door can wait.
    if (Game.over) { skip('over', Game); return; }
    const f = Game.tbfight;
    if (f && !f.over) { skip('fight-live', Game); return; }
    if (typeof Game.tableState !== 'function' || typeof Game.chooseTableOption !== 'function') { skip('no-verbs', Game); return; }
    const phase = tablePhaseOf(Game);
    if (!phase) { skip('preview-null', Game); return; } // no modal pending — the idle path (pure reads only)
    if (phase === 'seat-taker') { skip('seat-taker', Game); return; } // the sitter is the player's choice — never answered
    if (phase === 'done') { skip('already-done', Game); return; } // the path resolved — nothing left to answer
    if (!DW.TABLE_PHASES[phase]) { skip('not-ready:' + phase, Game); return; }
    // ALREADY-ENTERED: a paths-phase re-offer for a sitting that
    // already walked a door (e.g. a win-deferral re-offer) is never
    // re-walked — one door per sitting. Tracked by sitting id so a
    // genuinely new sitting is unaffected.
    if (phase === 'paths' && ctx && (ctx.tcWalked | 0) > 0) {
      let sitting = null;
      try { const pg = Game.progState ? Game.progState() : {}; sitting = (pg && pg.tableSittingId != null) ? pg.tableSittingId : null; } catch (e) {}
      if (ctx.tcSittingId != null && sitting != null && ctx.tcSittingId === sitting) { skip('already-entered', Game); return; }
      try { if (sitting != null) ctx.tcSittingId = sitting; } catch (e) {}
    }
    if (phase === 'paths' && ctx) {
      try {
        const pg = Game.progState ? Game.progState() : {};
        if (pg && pg.tableSittingId != null) ctx.tcSittingId = pg.tableSittingId;
      } catch (e) {}
    }
    drainTableTrialcombat(Game, ctx, DW.assignedDoor());
  } catch (e) { noteErr('trialcombatDoorDrive', e); }
}

const trialcombat = Object.assign({}, feareddoor, {
  id: 'competent-trialcombat-b',
  desc: 'competent-feareddoor-b + trial opt-in (TRIALCOMBAT_B=1): after the sit, walks the FEARED door when offered and earned, and at the calibration beat takes the TRIAL BY COMBAT when offered; plays the path to its resolution (first-option beats otherwise, conscript refused)',
  daily(Game, ctx) {
    return feareddoor.daily(Game, ctx);
  },
  upkeep(Game, ctx) {
    if (!layerOn()) return feareddoor.upkeep(Game, ctx);
    try { linkfeast.upkeep(Game, ctx); } catch (e) { noteErr('upkeep-linkfeast', e); }
    try { trialcombatDoorDrive(Game, ctx); } catch (e) { noteErr('upkeep-trialcombat', e); }
  },
});

module.exports = { trialcombat: trialcombat,
  layerOn: layerOn, trialcombatDoorDrive: trialcombatDoorDrive, drainTableTrialcombat: drainTableTrialcombat,
  pickOptionTrialcombat: pickOptionTrialcombat, pickDoorTrialcombat: pickDoorTrialcombat,
  resetTrialcombatStats: resetTrialcombatStats, trialcombatStats: trialcombatStats,
  resetFeareddoorStats: FEAR.resetFeareddoorStats, feareddoorStats: FEAR.feareddoorStats,
  resetDoorwalkStats: DW.resetDoorwalkStats, doorwalkStats: DW.doorwalkStats,
  resetTakeseatStats: DW.resetTakeseatStats, takeseatStats: DW.takeseatStats,
  resetLinkdriveStats: DW.resetLinkdriveStats, linkdriveStats: DW.linkdriveStats,
  resetFeastdriveStats: DW.resetFeastdriveStats, feastdriveStats: DW.feastdriveStats };
