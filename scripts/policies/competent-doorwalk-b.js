// competent-doorwalk-b — the DOOR-WALKING drive on the frozen takeseat
// substrate (arm sim-doorwalk-b, run fleshout-loop-b-20261107T1430Z, axis
// scale-onramp / winnability chain).
//
// POLICY-SIDE ONLY. ZERO src/js changes, zero default flips, no
// changes to any existing policy file. This file wraps the FROZEN
// takeseat composite (scripts/policies/competent-linkfeast-b.js,
// unmodified — frozen staged + linkdrive + feastdrive + sit drive)
// and adds the door-walking drive on top.
//
// THE BLANK (sim-takeseat-b, evidence/2026-11-07/sim-takeseat-b.md):
// on band 53001–53008 the takeseat substrate sits 5/8 lesser seats
// with 5–6 doors offered and 0 entered. The sitting is built; the
// winning is unmeasured. THIS file builds the door-walk drive: after
// the sit, choose and enter an earned door through the engine's real
// door-choice verb (Game.chooseTableOption('path:<id>')) and play the
// path to its resolution.
//
// STEVE-CALL behind this arm (do not re-decide it): only the player
// chooses the village's path and who takes the seat (Steve
// 2026-10-26). This arm MEASURES whether walking a door works, not
// whether bots should sit or which path a player should take. The
// policy is a measurement instrument, default OFF (DOORWALK_B=1),
// policy-side only.
//
// COMPOSITION (frozen in the prereg — do not tune):
//   daily:  linkfeast.daily untouched.
//   upkeep: linkfeast.upkeep (feast upkeep + sit drive) THEN the
//           door-walk drive. The harness calls upkeep 3x a day (once
//           per day-part), so on the decision point where the sit
//           fires, the door is walked the same part — entry day =
//           sit day by construction.
// The gate-OFF wrapper is the baseline leg (sits happen, doors never
// answered); the gate-ON wrapper is the armed leg. Same file, same
// base, same seeds, same days.
//
// THE DOOR RULE (pre-registered in evidence/2026-11-07/
// sim-doorwalk-b-prereg.md — POLICY-SIDE, not canon): at a
// paths-phase offer, ASSIGNED = ROTATION[(seed - 53001) % 4] with
// ROTATION = ['defiant','assimilated','beloved','relay'] (seed from
// DOORWALK_SEED, set per seed by the driver). (1) If ASSIGNED is
// offered, take it. (2) Else take the first offered door that is NOT
// 'feared', in engine (offered) order. (3) Else (only feared offered)
// take feared. A door never offered is NEVER taken (the modalplay
// precedent — forcing an unearned door would bypass the engine's
// prereq).
//
// THE DRAIN RULE (pre-registered — the one judgment is the door;
// everything after it is mechanical, the tablepaths modalplay
// precedent, scripts/policies/tablepaths.js 2026-10-19): challenge
// beats take the FIRST presented option, EXCEPT the trial opt-in is
// NEVER taken ('beat:trial' is skipped — trial-by-combat risks the
// Bearer's life and is opt-in only; this arm does not opt in).
// Finals take the first option. Downgrade re-applies the door rule
// among the remaining earned 'downgrade:*' options. The dark
// conscript is REFUSED ('conscript:no'). Demand-price takes the
// first option. Branches stay ledger-earned — the driver NEVER
// overrides tableBranch. The driver NEVER answers a 'seat:*'
// option and NEVER calls tableOfferSeatTaker /
// tableChooseSeatTaker.
//
// MECHANISM (from src/js/table.js, verified 2026-11-07, not guessed):
// tableTakeSeat() (no sitter id) calls tableScene() directly — no
// seat-taker modal intervenes; tableScene sets pg.tableDone, phase
// 'paths', and opens the 7-door modal via tableOfferPaths, which
// offers ONLY earned paths as {id: 'path:' + p.id}.
// chooseTableOption('path:<id>') in phase 'paths' calls
// tableStartPath: T.path set, branch read from the ledger, phase
// 'challenge', beat 0. chooseTableOption routes by phase (paths /
// challenge / finals / downgrade / conscript / demand-price) and is
// the single UI entry point. tableEarnedPaths() and tableBranch()
// are pure reads — the only Math.random in table.js/table-*.js is
// the cosmetic framing draw inside tableDeedLines (called from the
// sit's audit, already drawn by the sit itself) — so the drive's
// pre-verb reads draw no RNG and write no state; post-entry
// divergence is by design and the substrate guard judges exactness
// PRE-ENTRY.
//
// COUNTERS: per-run module stats (resetDoorwalkStats /
// doorwalkStats) so the driver can capture per-seed numbers without
// reaching into harness ctx. The linkfeast / takeseat / linkdrive /
// feastdrive module stats keep their own counters; the driver resets
// all of them per seed.
'use strict';
const LF = require('./competent-linkfeast-b');
const linkfeast = LF.linkfeast;

const ROTATION = ['defiant', 'assimilated', 'beloved', 'relay'];
const BASE_SEED = 53001;

// Default-OFF: DOORWALK_B=1 is the only on-switch. Unset (or any
// other value) delegates to the wrapped policy byte-identically.
function layerOn() { return process.env.DOORWALK_B === '1'; }

// assignedDoorFor(seed): the pre-registered rotation. Pure; the proof
// pins the mapping (53001 defiant, 53002 assimilated, 53003 beloved,
// 53004 relay, 53005 defiant, 53006 assimilated, 53007 beloved,
// 53008 relay).
function assignedDoorFor(seed) {
  const s = parseInt(seed, 10);
  if (!Number.isFinite(s)) return ROTATION[0];
  return ROTATION[((s - BASE_SEED) % ROTATION.length + ROTATION.length) % ROTATION.length];
}
function assignedDoor() {
  try {
    const s = (typeof process !== 'undefined' && process.env && process.env.DOORWALK_SEED) || '';
    return assignedDoorFor(s);
  } catch (e) { return ROTATION[0]; }
}

// Table phases the drain answers. Pre-table, tableState().phase is
// undefined — the layer is a pure no-op. 'seat-taker' is deliberately
// ABSENT: the drain never answers a sitter choice.
const TABLE_PHASES = { paths: 1, challenge: 1, finals: 1, downgrade: 1, conscript: 1, 'demand-price': 1 };

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function dayPartOf(Game) { try { return (Game.dayPart == null) ? null : (Game.dayPart | 0); } catch (e) { return null; } }

const STATS = { answers: 0, doorsEntered: 0, walked: [], offers: [], log: [],
  skips: {}, errors: 0, events: [], stalls: 0 };
function resetDoorwalkStats() {
  STATS.answers = 0; STATS.doorsEntered = 0; STATS.walked = []; STATS.offers = [];
  STATS.log = []; STATS.skips = {}; STATS.errors = 0; STATS.events = []; STATS.stalls = 0;
}
function doorwalkStats() { return JSON.parse(JSON.stringify(STATS)); }
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
function pendingOptions(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    const tc = s.tableChoices;
    const opts = (tc && tc.options) || [];
    return opts.length ? opts : null;
  } catch (e) { return null; }
}
function modalState(Game) {
  const phase = tablePhaseOf(Game);
  if (!phase || !TABLE_PHASES[phase]) return null;
  const opts = pendingOptions(Game);
  if (!opts) return null;
  let T = null;
  try { T = (typeof Game.tableState === 'function') ? Game.tableState() : null; } catch (e) {}
  return { phase, opts, T };
}

// earnedDoorIds(Game): the engine's own pricing — which doors are
// earned RIGHT NOW. Pure read.
function earnedDoorIds(Game) {
  const out = [];
  try {
    const paths = (typeof Game.tableEarnedPaths === 'function') ? Game.tableEarnedPaths() : [];
    for (const p of (paths || [])) if (p && p.earned) out.push(String(p.id));
  } catch (e) {}
  return out;
}

// pickDoor(Game, opts, assigned): the door rule. Returns
// {id, fellBack, why, offered} or null (with the skip reason).
function pickDoor(Game, opts, assigned) {
  const offered = (opts || []).filter(o => String((o && o.id) || '').indexOf('path:') === 0);
  if (!offered.length) return { pick: null, skip: 'no-doors-offered' };
  const earned = earnedDoorIds(Game);
  const offeredIds = offered.map(o => String(o.id).slice(5));
  const offeredEarned = offeredIds.filter(id => earned.indexOf(id) >= 0);
  if (!offeredEarned.length) return { pick: null, skip: 'no-earned-door' };
  if (assigned && offeredEarned.indexOf(assigned) >= 0) {
    return { pick: { id: 'path:' + assigned, fellBack: false, why: 'assigned+' + assigned, offered: offeredIds }, skip: null };
  }
  const nonFeared = offeredEarned.filter(id => id !== 'feared');
  if (nonFeared.length) {
    // First earned non-feared door, in engine (offered) order.
    const first = offeredIds.find(id => nonFeared.indexOf(id) >= 0);
    return { pick: { id: 'path:' + first, fellBack: true, why: 'fallback-non-feared: assigned=' + (assigned || 'none') + ' not offered/earned; earned=[' + offeredEarned.join(',') + ']', offered: offeredIds }, skip: null };
  }
  return { pick: { id: 'path:' + offeredEarned[0], fellBack: true, why: 'only-feared', offered: offeredIds }, skip: null };
}

// pickBeat(opts): the beat rule. First presented option, EXCEPT the
// trial opt-in is NEVER taken (trial-by-combat is opt-in only).
function pickBeat(opts) {
  if (!opts || !opts.length) return { pick: null, skip: 'no-beat-options' };
  const safe = opts.filter(o => String((o && o.id) || '') !== 'beat:trial');
  if (!safe.length) return { pick: null, skip: 'trial-only' };
  return { pick: { id: safe[0].id, trial: false, why: 'first-option' }, skip: null };
}

// pickOption(Game, ms, assigned): one drain pick. Returns
// {id, note, doorEvent} or {skip}.
function pickOption(Game, ms, assigned) {
  const phase = ms.phase, opts = ms.opts, T = ms.T;
  if (phase === 'paths') {
    const r = pickDoor(Game, opts, assigned);
    if (r.skip) return { skip: r.skip };
    return { id: r.pick.id, note: r.pick.why, doorEvent: r.pick };
  }
  if (phase === 'challenge') {
    const b = pickBeat(opts);
    if (b.skip) return { skip: b.skip };
    return { id: b.pick.id, note: b.pick.why, trialEvent: b.pick.trial };
  }
  if (phase === 'finals') {
    return { id: opts[0].id, note: 'final-first' };
  }
  if (phase === 'downgrade') {
    // Re-apply the door rule among the remaining earned downgrade doors.
    const dg = (opts || []).filter(o => String((o && o.id) || '').indexOf('downgrade:') === 0);
    if (!dg.length) return { skip: 'no-downgrade-options' };
    const earned = earnedDoorIds(Game);
    const failed = ((T && T.failedDoors) || []).map(String);
    const cands = dg.filter(o => {
      const id = String(o.id).slice(10);
      return earned.indexOf(id) >= 0 && failed.indexOf(id) < 0;
    });
    if (!cands.length) return { skip: 'no-earned-downgrade' };
    if (assigned) {
      const keep = cands.find(o => String(o.id).slice(10) === assigned);
      if (keep) return { id: keep.id, note: 'downgrade-assigned+' + assigned, doorEvent: { id: String(keep.id).slice(10), fellBack: false, why: 'downgrade-assigned+' + assigned, offered: cands.map(o => String(o.id).slice(10)) } };
    }
    const nonFeared = cands.filter(o => String(o.id).slice(10) !== 'feared');
    const first = nonFeared.length ? nonFeared[0] : cands[0];
    return { id: first.id, note: 'downgrade-first-earned', doorEvent: { id: String(first.id).slice(10), fellBack: true, why: 'downgrade-first-earned', offered: cands.map(o => String(o.id).slice(10)) } };
  }
  if (phase === 'conscript') {
    const no = (opts || []).find(o => String((o && o.id) || '') === 'conscript:no');
    if (!no) return { skip: 'conscript-no-missing' };
    return { id: no.id, note: 'conscript-refuse' };
  }
  if (phase === 'demand-price') {
    return { id: opts[0].id, note: 'demand-price-first' };
  }
  return { skip: 'not-ready:' + phase };
}

// drainTable: the forcing drain. Mirrors tablepaths.js's loop contract
// (30-answer cap, no-progress stall guard, Game.over break, live-fight
// break) with the door/beat rules above. Read-only until each
// chooseTableOption call.
function drainTable(Game, ctx, assigned) {
  let n = 0, lastSig = null, stall = 0;
  // First look: a drainable phase with no options to answer is a
  // classified skip, not a silent break (paths-phase with no options
  // is literally 'no doors offered').
  if (!modalState(Game)) { skip(tablePhaseOf(Game) === 'paths' ? 'no-doors-offered' : 'no-options', Game); return 0; }
  for (;;) {
    if (Game.over) break;
    if (n >= 30) break;
    try { if (Game.tbfight && !Game.tbfight.over) { skip('fight-live', Game); break; } } catch (e) {}
    const ms = modalState(Game);
    if (!ms) break;
    const sig = ms.phase + '|' + ms.opts.map(o => o.id).join(',');
    if (sig === lastSig && ++stall >= 2) { STATS.stalls = (STATS.stalls | 0) + 1; break; }
    lastSig = sig;
    const pick = pickOption(Game, ms, assigned);
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
    // A door walked: record the walk (phase 'paths' → 'challenge' with
    // a path set, or a 'downgrade:' pick that starts a new path).
    if ((before.phase === 'paths' && after.path && after.phase === 'challenge') ||
        (before.phase === 'downgrade' && after.path && after.phase === 'challenge')) {
      STATS.doorsEntered = (STATS.doorsEntered | 0) + 1;
      STATS.walked.push({ day: rec.day, path: after.path, branch: after.branch,
        door: pick.id, fellBack: !!(pick.doorEvent && pick.doorEvent.fellBack) });
      try { if (ctx) { ctx.dwWalked = (ctx.dwWalked | 0) + 1; ctx.dwWalkedPath = after.path; ctx.dwWalkedDay = rec.day; } } catch (e) {}
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

// doorWalkDrive: the whole driver. Read-only until a door/beat verb
// itself; every early exit is classified in STATS (never an answer).
// The gate is checked HERE (not only in the wrapper) so the RED phase
// pins: gate OFF never drives the verb even when called directly.
function doorWalkDrive(Game, ctx) {
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
    if (!TABLE_PHASES[phase]) { skip('not-ready:' + phase, Game); return; }
    // ALREADY-ENTERED: a paths-phase re-offer for a sitting that
    // already walked a door (e.g. a win-deferral re-offer) is never
    // re-walked — one door per sitting. Tracked by sitting id so a
    // genuinely new sitting is unaffected.
    if (phase === 'paths' && ctx && (ctx.dwWalked | 0) > 0) {
      let sitting = null;
      try { const pg = Game.progState ? Game.progState() : {}; sitting = (pg && pg.tableSittingId != null) ? pg.tableSittingId : null; } catch (e) {}
      if (ctx.dwSittingId != null && sitting != null && ctx.dwSittingId === sitting) { skip('already-entered', Game); return; }
      try { if (sitting != null) ctx.dwSittingId = sitting; } catch (e) {}
    }
    if (phase === 'paths' && ctx) {
      try {
        const pg = Game.progState ? Game.progState() : {};
        if (pg && pg.tableSittingId != null) ctx.dwSittingId = pg.tableSittingId;
      } catch (e) {}
    }
    drainTable(Game, ctx, assignedDoor());
  } catch (e) { noteErr('doorWalkDrive', e); }
}

const doorwalk = Object.assign({}, linkfeast, {
  id: 'competent-doorwalk-b',
  desc: 'competent-linkfeast-b + door-walk drive (DOORWALK_B=1): after the sit, walks the pre-registered assigned earned door via Game.chooseTableOption and plays the path to its resolution (first-option beats, no trial, conscript refused)',
  daily(Game, ctx) {
    return linkfeast.daily(Game, ctx);
  },
  upkeep(Game, ctx) {
    try { linkfeast.upkeep(Game, ctx); } catch (e) { noteErr('upkeep-linkfeast', e); }
    try { doorWalkDrive(Game, ctx); } catch (e) { noteErr('upkeep-doorwalk', e); }
  },
});

module.exports = { doorwalk: doorwalk,
  layerOn: layerOn, doorWalkDrive: doorWalkDrive, drainTable: drainTable,
  pickOption: pickOption, pickDoor: pickDoor, pickBeat: pickBeat,
  modalState: modalState, earnedDoorIds: earnedDoorIds, TABLE_PHASES: TABLE_PHASES,
  ROTATION: ROTATION, BASE_SEED: BASE_SEED,
  assignedDoor: assignedDoor, assignedDoorFor: assignedDoorFor,
  resetDoorwalkStats: resetDoorwalkStats, doorwalkStats: doorwalkStats,
  resetTakeseatStats: LF.resetTakeseatStats, takeseatStats: LF.takeseatStats,
  resetLinkdriveStats: LF.resetLinkdriveStats, linkdriveStats: LF.linkdriveStats,
  resetFeastdriveStats: LF.resetFeastdriveStats, feastdriveStats: LF.feastdriveStats };
