// competent-witnessdoor-b — the WITNESS-DOOR drive on the frozen
// doorwalk substrate (arm sim-witnessdoor-b, run
// fleshout-loop-b-20261107T1430Z, axis scale-onramp / winnability
// chain).
//
// POLICY-SIDE ONLY. ZERO src/js changes, zero default flips, no
// changes to any existing policy file — scripts/policies/
// competent-doorwalk-b.js is required, never edited; the fallback
// rotation, the drain, and the sit drive all come from it verbatim.
//
// THE BLANK (sim-doorwalk-b, evidence/2026-11-07/sim-doorwalk-b.md,
// and sim-doorwalk-confirm-b, evidence/2026-11-07/
// sim-doorwalk-confirm-b.md): on frozen band 53001–53008 the
// doorwalk arm walked 5/5 doors and won 5/5 — but witness was
// offered on four sits and NEVER walked (never assigned, never
// the fallback — the fallback was never needed); the confirm on
// band 53201–53212 repeated it (witness offered 4/5, walked 0/5),
// and the feareddoor arm then walked feared 5/5 and won 5/5 on
// the same band. THIS file walks the witness door: when a WITNESS
// door is offered after the sit, walk witness; otherwise fall back
// to the doorwalk rotation exactly.
//
// STEVE-CALL behind this arm (do not re-decide it): only the
// player chooses the village's path and who takes the seat (Steve
// 2026-10-26). This arm MEASURES whether walking the witness door
// works, not whether bots should sit or which path a player should
// take. The policy is a measurement instrument, default OFF
// (WITNESSDOOR_B=1), policy-side only. Feared / dark branches /
// trial-by-combat stay for later runs; this arm walks witness only.
//
// COMPOSITION (frozen in the prereg — do not tune):
//   daily:  doorwalk.daily untouched (linkfeast daily).
//   upkeep: WITNESSDOOR_B unset -> doorwalk.upkeep exactly (the
//           BASELINE leg: doorwalk rotation, DOORWALK_B=1).
//           WITNESSDOOR_B=1 -> linkfeast.upkeep (feast upkeep + sit
//           drive) THEN the witness-door drive. The doorwalk drive
//           itself never runs in the armed leg, so the two legs
//           differ ONLY in which door is picked at the paths offer.
// The harness calls upkeep 3x a day (once per day-part), so on the
// decision point where the sit fires, the door is walked the same
// part — entry day = sit day by construction.
//
// THE DOOR RULE (pre-registered in evidence/2026-11-07/
// sim-witnessdoor-b-prereg.md — POLICY-SIDE, not canon): at a
// paths-phase offer, (1) if 'witness' is offered AND earned, take
// it ('witness-first'). (2) Else the doorwalk rule exactly:
// assigned = ROTATION[(seed - 53001) % 4] with ROTATION =
// ['defiant','assimilated','beloved','relay'] (seed from
// DOORWALK_SEED, set per seed by the driver); assigned if offered,
// else first offered earned non-feared in engine order, else
// feared if it is the only one (the doorwalk rule verbatim).
// A door never offered is NEVER taken (the modalplay precedent).
//
// THE DRAIN RULE (pre-registered — copied from the doorwalk
// prereg, the tablepaths modalplay precedent): challenge beats
// take the FIRST presented option, EXCEPT the trial opt-in is
// NEVER taken ('beat:trial' is skipped). Finals take the first
// option. Downgrade re-applies the witness-first rule among the
// remaining earned 'downgrade:*' options (witness if still
// available, else the doorwalk downgrade rule). The dark
// conscript is REFUSED ('conscript:no'). Demand-price takes the
// first option. Branches stay ledger-earned — the driver NEVER
// overrides tableBranch. The driver NEVER answers a 'seat:*'
// option and NEVER calls tableOfferSeatTaker /
// tableChooseSeatTaker.
//
// MECHANISM NOTE (read from src/js/table-witness.js, not guessed):
// the witness path is three beats on the swing meter, with a
// convict-mid-trial tripwire: every beat choice's effects run
// through swingCheck, and a swing total of -1 or worse fails the
// path ("your own record convicted you mid-trial") and the table
// offers a downgrade. Beat 1 (opening charges): 'cold' +2,
// 'names' +1, 'reserve' +0. Beat 2 (the defense): 'let' +1 when
// protected >= killed, -2 when killed > protected; 'cross' +1;
// 'subpoena' +1 (only when the subpoena ability is held);
// 'silence' -2 light / -4 dark. Beat 3: light 'public' +2 /
// 'settle' +1; dark 'blood' +2 / 'disappoint' +0. Swing starts at
// 1 (docket) + 2 (branch grant: clean-hands light / gavel dark).
// Under the frozen first-option drain: beat 1 'cold' (+2), beat 2
// 'let' (+1 or -2), beat 3 light 'public' (+2) / dark 'blood'
// (+2) — swing ends at 8 light, 5 dark-dirty, so the -1 tripwire
// is unreachable under this drain and witness wins are expected
// on every entry, light or dark. 'silence' (the convict path) is
// never picked because it is never the first option. That is a
// property of the frozen drain, recorded here so the judged
// numbers are read correctly — NOT a reason to tune the beat
// picks (that would be a different lever). The witness prereq
// (lesser+ seat AND ledger.exposed >= 3, table-witness.js) is
// engine-side and is what makes the door offered or not; the
// policy never forces an unearned door.
//
// COUNTERS: per-run module stats (resetWitnessdoorStats /
// witnessdoorStats) mirroring the doorwalk shape so the driver
// and analyzer read the same fields. The doorwalk / takeseat /
// linkdrive / feastdrive module stats keep their own counters;
// the driver resets all of them per seed.
'use strict';
const DW = require('./competent-doorwalk-b');
const LF = require('./competent-linkfeast-b');
const linkfeast = LF.linkfeast;
const doorwalk = DW.doorwalk;

// Default-OFF: WITNESSDOOR_B=1 is the only on-switch. Unset (or any
// other value) delegates to the doorwalk wrapper byte-identically
// (the baseline leg: doorwalk rotation).
function layerOn() { return process.env.WITNESSDOOR_B === '1'; }

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function dayPartOf(Game) { try { return (Game.dayPart == null) ? null : (Game.dayPart | 0); } catch (e) { return null; } }

const STATS = { answers: 0, doorsEntered: 0, walked: [], offers: [], log: [],
  skips: {}, errors: 0, events: [], stalls: 0 };
function resetWitnessdoorStats() {
  STATS.answers = 0; STATS.doorsEntered = 0; STATS.walked = []; STATS.offers = [];
  STATS.log = []; STATS.skips = {}; STATS.errors = 0; STATS.events = []; STATS.stalls = 0;
}
function witnessdoorStats() { return JSON.parse(JSON.stringify(STATS)); }
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

// pickDoorWitness(Game, opts, assigned): the witness-first door rule.
// Returns { pick, skip } in the doorwalk pickDoor shape.
function pickDoorWitness(Game, opts, assigned) {
  const offered = (opts || []).filter(function (o) { return String((o && o.id) || '').indexOf('path:') === 0; });
  if (!offered.length) return { pick: null, skip: 'no-doors-offered' };
  const earned = DW.earnedDoorIds(Game);
  const offeredIds = offered.map(function (o) { return String(o.id).slice(5); });
  const offeredEarned = offeredIds.filter(function (id) { return earned.indexOf(id) >= 0; });
  if (!offeredEarned.length) return { pick: null, skip: 'no-earned-door' };
  if (offeredEarned.indexOf('witness') >= 0) {
    return { pick: { id: 'path:witness', fellBack: false, why: 'witness-first', offered: offeredIds }, skip: null };
  }
  // Witness not offered/earned: the doorwalk rotation rule exactly.
  return DW.pickDoor(Game, opts, assigned);
}

// pickOptionWitness(Game, ms, assigned): one drain pick. Paths phase
// uses the witness-first rule; downgrade re-applies witness-first
// (assigned='witness' into the doorwalk downgrade rule); every other
// phase is the doorwalk pickOption verbatim.
function pickOptionWitness(Game, ms, assigned) {
  if (ms.phase === 'paths') {
    const r = pickDoorWitness(Game, ms.opts, assigned);
    if (r.skip) return { skip: r.skip };
    return { id: r.pick.id, note: r.pick.why, doorEvent: r.pick };
  }
  if (ms.phase === 'downgrade') return DW.pickOption(Game, ms, 'witness');
  return DW.pickOption(Game, ms, assigned);
}

// drainTableWitness: the forcing drain. The doorwalk drainTable loop
// contract (30-answer cap, no-progress stall guard, Game.over
// break, live-fight break), with pickOptionWitness in place of the
// doorwalk pickOption and the witness module stats in place of the
// doorwalk stats. Read-only until each chooseTableOption call.
function drainTableWitness(Game, ctx, assigned) {
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
    const pick = pickOptionWitness(Game, ms, assigned);
    if (pick.skip) { skip(pick.skip, Game); break; }
    if (!pick.id) break;
    const before = tableSnap(Game);
    try { Game.chooseTableOption(pick.id); } catch (e) { noteErr('chooseTableOption', e); break; }
    n++;
    STATS.answers = (STATS.answers | 0) + 1;
    const after = tableSnap(Game);
    const rec = {
      day: gday(Game), phase: before.phase, path: before.path, branch: before.branch,
      beat: before.beat, optionId: pick.id, note: pick.note,
      toPhase: after.phase, toPath: after.path, toBranch: after.branch, toBeat: after.beat,
      trialPending: after.trialPending,
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
      try { if (ctx) { ctx.wdWalked = (ctx.wdWalked | 0) + 1; ctx.wdWalkedPath = after.path; ctx.wdWalkedDay = rec.day; } } catch (e) {}
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

// witnessDoorDrive: the whole driver. Read-only until a door/beat verb
// itself; every early exit is classified in STATS (never an answer).
// The gate is checked HERE (not only in the wrapper) so the RED phase
// pins: gate OFF never drives the verb even when called directly.
function witnessDoorDrive(Game, ctx) {
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
    if (phase === 'paths' && ctx && (ctx.wdWalked | 0) > 0) {
      let sitting = null;
      try { const pg = Game.progState ? Game.progState() : {}; sitting = (pg && pg.tableSittingId != null) ? pg.tableSittingId : null; } catch (e) {}
      if (ctx.wdSittingId != null && sitting != null && ctx.wdSittingId === sitting) { skip('already-entered', Game); return; }
      try { if (sitting != null) ctx.wdSittingId = sitting; } catch (e) {}
    }
    if (phase === 'paths' && ctx) {
      try {
        const pg = Game.progState ? Game.progState() : {};
        if (pg && pg.tableSittingId != null) ctx.wdSittingId = pg.tableSittingId;
      } catch (e) {}
    }
    drainTableWitness(Game, ctx, DW.assignedDoor());
  } catch (e) { noteErr('witnessDoorDrive', e); }
}

const witnessdoor = Object.assign({}, doorwalk, {
  id: 'competent-witnessdoor-b',
  desc: 'competent-doorwalk-b + witness-first door rule (WITNESSDOOR_B=1): after the sit, walks the WITNESS door when offered and earned, else the doorwalk rotation exactly; plays the path to its resolution (first-option beats, no trial, conscript refused)',
  daily(Game, ctx) {
    return doorwalk.daily(Game, ctx);
  },
  upkeep(Game, ctx) {
    if (!layerOn()) return doorwalk.upkeep(Game, ctx);
    try { linkfeast.upkeep(Game, ctx); } catch (e) { noteErr('upkeep-linkfeast', e); }
    try { witnessDoorDrive(Game, ctx); } catch (e) { noteErr('upkeep-witnessdoor', e); }
  },
});

module.exports = { witnessdoor: witnessdoor,
  layerOn: layerOn, witnessDoorDrive: witnessDoorDrive, drainTableWitness: drainTableWitness,
  pickOptionWitness: pickOptionWitness, pickDoorWitness: pickDoorWitness,
  resetWitnessdoorStats: resetWitnessdoorStats, witnessdoorStats: witnessdoorStats,
  resetDoorwalkStats: DW.resetDoorwalkStats, doorwalkStats: DW.doorwalkStats,
  resetTakeseatStats: DW.resetTakeseatStats, takeseatStats: DW.takeseatStats,
  resetLinkdriveStats: DW.resetLinkdriveStats, linkdriveStats: DW.linkdriveStats,
  resetFeastdriveStats: DW.resetFeastdriveStats, feastdriveStats: DW.feastdriveStats };
