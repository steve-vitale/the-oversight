// tablepaths — the path-forcing table driver (sim-tablepaths, 2026-10-19,
// flesh-out loop, axis scale-onramp).
//
// THE GAP (sim-seatdrive-posttable, 2026-10-19): the seatdrive+windefer
// stack plays ONE identical track on every sitting (lesser → feared →
// light → "Show mercy" → win, same day, 10/10). Trial-by-combat, the six
// non-feared paths, and dark branches are all unexercised. This layer
// steers the table after sitting to exercise the untested doors — and
// opts into trial-by-combat — while recording per-path mortality
// attribution.
//
// THE DOOR RULE (pre-registered, POLICY-SIDE, not canon — evidence/2026-10-19/sim-tablepaths.md):
// at the 7-door offer, choose the run's ASSIGNED door (composition param,
// from the pre-registered rotation) IF earned per the live
// Game.tableEarnedPaths(). Otherwise fall back to the first earned offered
// door in ['feared','defiant','assimilated','beloved','relay'], recorded
// with the miss. A door never offered is NEVER taken (the modalplay
// precedent — forcing an unearned door would bypass the engine's prereq).
// Witness and indispensable are not in the rotation (witness: no live
// exposure source on this road, Steve-decided 2026-10-11/2026-10-17;
// indispensable: full-seat-only, wave-4/5 unreachable in sims).
//
// THE BEAT RULE (pre-registered): challenge beats take the FIRST presented
// option (the winpursuit drain precedent), EXCEPT the trial opt-in: on
// trial-armed runs (composition param) the driver picks 'beat:trial' when
// offered. Finals: first option. Downgrade: re-apply the door rule among
// remaining earned 'downgrade:*' options. Conscript: refuse
// ('conscript:no'). Demand-price: first option. The ONLY policy choices are
// the door and the trial opt-in; branches stay ledger-earned (the driver
// NEVER overrides tableBranch).
//
// COMPOSITION: withTablePaths wraps the seatdrive stack OUTERMOST:
//   withTablePaths(withSeatDrive(withWinDefer(TF base)))
// The layer's daily takes the seat FIRST (the same exported driveSeat verb
// the inner stack uses — the seat must be taken before the drain, because
// the inner stack's driveSeat fires mid-inner-daily, after an early drain
// would already have run and lost the modal to the inner options[0]
// drain), then drains the modal with the forcing rules, then delegates to
// the inner stack — whose driveSeat no-ops (pg.tableDone) and whose
// windefer tableRoad finds no pending modal. The drain mirrors tableRoad
// exactly (30-answer cap, no-progress stall guard, breaks on Game.over and
// on a live tbfight — the trial pauses the challenge; the harness
// driveFights fights it and the wrapped tbEnd resumes the table).
//
// ATTRIBUTION: every drain iteration is logged into ctx._tablepaths:
// {assigned, trial, walked: [{path, branch}], log: [{day, phase, path,
// branch, beat, optionId, label}], doorEvents, trialEvents, finalsEvents}.
// The probe copies the summary into the per-seed JSON; deaths are stamped
// with tableAtDeath (the parent probe's tableRec).
//
// ENV-GATED TABLEPATHS=1 (default OFF — unset delegates to the base
// policy byte-identically; the proof's DET gate pins that). The door and
// trial are composition params (explicit per run), not env — the sweep
// documents the assignment in the evidence file.
//
// POLICY-SIDE ONLY — zero src/js changes. NEVER edit seatdrive.js or
// windefer.js.
'use strict';
const SD = require('./seatdrive');

// Default-OFF: TABLEPATHS=1 is the only on-switch. Unset (or any other
// value) delegates to the wrapped policy byte-identically.
function layerOn() { return process.env.TABLEPATHS === '1'; }

// Table phases the drain answers. Pre-table, tableState().phase is
// undefined — the layer is a pure no-op.
const TABLE_PHASES = { paths: 1, challenge: 1, finals: 1, downgrade: 1, conscript: 1, 'demand-price': 1 };

function tablePhase(Game) {
  try {
    const T = (typeof Game.tableState === 'function') ? Game.tableState() : null;
    return (T && T.phase != null) ? String(T.phase) : null;
  } catch (e) { return null; }
}

function pendingOptions(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    const tc = s.tableChoices;
    const opts = (tc && tc.options) || [];
    return opts.length ? opts : null;
  } catch (e) { return null; }
}

// The full modal state the drain needs for one pick.
function modalState(Game) {
  const phase = tablePhase(Game);
  if (!phase || !TABLE_PHASES[phase]) return null;
  const opts = pendingOptions(Game);
  if (!opts) return null;
  let T = null;
  try { T = (typeof Game.tableState === 'function') ? Game.tableState() : null; } catch (e) {}
  return { phase, opts, T };
}

// earnedDoorIds(Game): the engine's own pricing — which doors are earned
// RIGHT NOW. Pure read.
function earnedDoorIds(Game) {
  const out = [];
  try {
    const paths = (typeof Game.tableEarnedPaths === 'function') ? Game.tableEarnedPaths() : [];
    for (const p of (paths || [])) if (p && p.earned) out.push(String(p.id));
  } catch (e) {}
  return out;
}

// pickDoor(Game, opts, assigned): the door rule. Returns {id, fellBack, why} or null.
function pickDoor(Game, opts, assigned) {
  const offered = (opts || []).filter(o => String((o && o.id) || '').indexOf('path:') === 0);
  if (!offered.length) return null;
  const earned = earnedDoorIds(Game);
  const offeredIds = offered.map(o => String(o.id).slice(5));
  const offeredEarned = offeredIds.filter(id => earned.indexOf(id) >= 0);
  if (!offeredEarned.length) return null; // nothing earnable — never force
  if (assigned && offeredEarned.indexOf(assigned) >= 0) {
    return { id: 'path:' + assigned, fellBack: false, why: 'assigned+' + assigned };
  }
  // Fallback: first earned offered door in the pre-registered order.
  const FALLBACK = ['feared', 'defiant', 'assimilated', 'beloved', 'relay'];
  for (const id of FALLBACK) {
    if (offeredEarned.indexOf(id) >= 0) {
      return {
        id: 'path:' + id, fellBack: true,
        why: 'fallback: assigned=' + (assigned || 'none') +
          ' not earned/offered; earned=[' + offeredEarned.join(',') + ']',
      };
    }
  }
  return null;
}

// pickBeat(opts, trialArmed): the beat rule. First presented option,
// EXCEPT the trial opt-in on trial-armed runs.
function pickBeat(opts, trialArmed) {
  if (!opts || !opts.length) return null;
  if (trialArmed) {
    const trial = opts.find(o => String((o && o.id) || '') === 'beat:trial');
    if (trial) return { id: trial.id, trial: true, why: 'trial-opt-in' };
  }
  return { id: opts[0].id, trial: false, why: 'first-option' };
}

// pickOption(Game, ms, params): one drain pick. Returns {id, note} or null.
function pickOption(Game, ms, params) {
  const { phase, opts, T } = ms;
  if (phase === 'paths') {
    const p = pickDoor(Game, opts, params.door);
    return p ? { id: p.id, note: p.why, doorEvent: p } : null;
  }
  if (phase === 'challenge') {
    const b = pickBeat(opts, !!params.trial);
    return b ? { id: b.id, note: b.why, trialEvent: b.trial } : null;
  }
  if (phase === 'finals') {
    return { id: opts[0].id, note: 'final-first' };
  }
  if (phase === 'downgrade') {
    // Re-apply the door rule among the remaining earned downgrade doors.
    // downgrade:* options map 1:1 onto path ids.
    const dg = (opts || []).filter(o => String((o && o.id) || '').indexOf('downgrade:') === 0);
    if (!dg.length) return null;
    const earned = earnedDoorIds(Game);
    const failed = ((T && T.failedDoors) || []).map(String);
    const cands = dg.filter(o => {
      const id = String(o.id).slice(10);
      return earned.indexOf(id) >= 0 && failed.indexOf(id) < 0;
    });
    if (!cands.length) return null;
    if (params.door) {
      const keep = cands.find(o => String(o.id).slice(10) === params.door);
      if (keep) return { id: keep.id, note: 'downgrade-assigned+' + params.door };
    }
    return { id: cands[0].id, note: 'downgrade-first-earned' };
  }
  if (phase === 'conscript') {
    const no = (opts || []).find(o => String((o && o.id) || '') === 'conscript:no');
    return no ? { id: no.id, note: 'conscript-refuse' } : null;
  }
  if (phase === 'demand-price') {
    return { id: opts[0].id, note: 'demand-price-first' };
  }
  return null;
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function ensureTP(ctx, params) {
  let TP = ctx._tablepaths;
  if (!TP || TP.assigned !== params.door) {
    TP = ctx._tablepaths = {
      assigned: params.door || null, trial: !!params.trial,
      walked: [], log: [], doorEvents: [], trialEvents: [], finalsEvents: [],
      answers: 0, stalls: 0,
    };
  }
  return TP;
}

function snapTable(Game) {
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

// drainTable: the forcing drain. Mirrors tableRoad's loop contract
// (30-answer cap, no-progress stall guard, Game.over break, live-fight
// break) with the door/beat/trial rules above. Read-only until each
// chooseTableOption call.
function drainTable(Game, ctx, params) {
  const TP = ensureTP(ctx, params);
  let n = 0, lastSig = null, stall = 0;
  for (;;) {
    if (Game.over) break;
    if (n >= 30) break;
    try { if (Game.tbfight && !Game.tbfight.over) break; } catch (e) {}
    const ms = modalState(Game);
    if (!ms) break;
    const sig = ms.phase + '|' + ms.opts.map(o => o.id).join(',');
    if (sig === lastSig && ++stall >= 2) { TP.stalls = (TP.stalls | 0) + 1; break; }
    lastSig = sig;
    const pick = pickOption(Game, ms, params);
    if (!pick) break;
    const before = snapTable(Game);
    try { Game.chooseTableOption(pick.id); } catch (e) { break; }
    n++;
    TP.answers = (TP.answers | 0) + 1;
    const after = snapTable(Game);
    const rec = {
      day: gday(Game), phase: before.phase, path: before.path, branch: before.branch,
      beat: before.beat, optionId: pick.id, note: pick.note,
      toPhase: after.phase, toPath: after.path, toBranch: after.branch, toBeat: after.beat,
      trialPending: after.trialPending,
    };
    TP.log.push(rec);
    if (pick.doorEvent) TP.doorEvents.push({ day: rec.day, picked: pick.id, fellBack: !!pick.doorEvent.fellBack, why: pick.doorEvent.why });
    if (pick.trialEvent) {
      TP.trialEvents.push({ day: rec.day, path: before.path || after.path, fired: after.trialPending });
    }
    if (before.phase === 'finals') TP.finalsEvents.push({ day: rec.day, path: before.path, branch: before.branch, finalId: pick.id });
    // A door walked: record the walk (phase 'paths' → 'challenge' with a path set).
    if (before.phase === 'paths' && after.path && after.phase === 'challenge') {
      TP.walked.push({ day: rec.day, path: after.path, branch: after.branch, door: pick.id, fellBack: !!(pick.doorEvent && pick.doorEvent.fellBack) });
    }
    if (TP.log.length > 400) TP.log.splice(0, TP.log.length - 400);
  }
  return n;
}

function withTablePaths(inner, id, desc, params) {
  params = params || {};
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      if (!layerOn()) return inner.daily(Game, ctx); // gate off: pure delegation
      try {
        // The seat must be taken BEFORE the drain: the inner stack's
        // driveSeat fires mid-inner-daily (after this layer's drain would
        // have run), so draining first would always lose the modal to the
        // inner options[0] drain. Take the seat here with the same exported
        // verb the inner stack uses; the inner driveSeat then no-ops
        // (pg.tableDone) and the inner tableRoad finds no pending modal.
        // (The seat is never taken pre-90 — tablePreview requires the floor
        // — so the windefer hold discipline has nothing to preempt.)
        SD.driveSeat(Game, ctx);
        drainTable(Game, ctx, params);
      } catch (e) { ctx.tpDrainError = (ctx.tpDrainError | 0) + 1; }
      return inner.daily(Game, ctx);
    },
  });
}

// The sweep builds these compositions; params.documented in the evidence
// file's pre-registered rotation.
const TF = require('./tribfloor');
const WD = require('./windefer');

function composedFor(policyId, params) {
  const base = policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  const tag = policyId === 'leadfeast' ? 'lead' : 'belong';
  const wd = WD.withWinDefer(base, `${tag}-windefer`, `${policyId} + win-side layers (WINPURSUIT=1 + WINDEFER=1)`);
  const sd = SD.withSeatDrive(wd, `${tag}-windefer`, `${policyId} + win-side stack + seatdrive (SEATDRIVE=1)`);
  return withTablePaths(sd, `${tag}-tablepaths`,
    `${policyId} + seatdrive stack + tablepaths (TABLEPATHS=1, door=${params.door}, trial=${!!params.trial})`, params);
}

module.exports = {
  layerOn, withTablePaths, composedFor, drainTable, pickOption, pickDoor, pickBeat,
  modalState, earnedDoorIds, TABLE_PHASES,
};
