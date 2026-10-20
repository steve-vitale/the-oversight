// tablepathdriver — the 7-door table driver (sim-tablepathdriver,
// 2026-10-20, flesh-out loop, axis scale-onramp, lever-10 win-path end to
// end).
//
// THE GAP (sim-seatdrive-posttable, 2026-10-19): the SEATDRIVE=1 stack
// plays ONE identical track on all 10 sittings (lesser → feared → light →
// "Show mercy" → win). The sibling arm sim-tablepaths walked 5 doors
// (feared/defiant/assimilated/beloved/relay, all light except relay/grey)
// + trial-by-combat. Still unexercised: INDISPENSABLE, WITNESS, and every
// DARK branch. This layer steers the table after sitting through the
// unexercised surface and records per-path terminal resolution.
//
// THE DOOR RULE (pre-registered, POLICY-SIDE, not canon): at the 7-door
// offer (phase 'paths', every option id 'path:<id>'), choose the run's
// ASSIGNED door from the pre-registered rotation — IF earned per the live
// Game.tableEarnedPaths(). Otherwise FALLBACK = the first earned offered
// door in the 7-order below, recorded with the miss (assigned,
// earnedList, the engine's own why-string for the miss). A door never
// offered is NEVER taken (the modalplay precedent — forcing an unearned
// door would bypass the engine's prereq and invent canon).
//   ROTATION (8 seeds x 2 policies; indispensable + witness get 2 probes
//   each, the rest concentrates on relay (the dark-road candidate) and
//   defiant (replication of the sibling's walk)):
//     leadfeast:   ['indispensable','witness','relay','relay','defiant','relay','defiant','relay']
//     belongfeast: ['witness','indispensable','relay','defiant','relay','defiant','relay','defiant']
//   FALLBACK7 = ['indispensable','witness','defiant','assimilated','beloved','relay','feared']
// Expected on this substrate: indispensable never earned (needs a FULL
// seat; wave-4/5 unreachable — the scale wall), witness never earned
// (ledger.exposed < 3; Steve decided 2026-10-17 the exposure source must
// be built first). Each such assignment is a documented finding with the
// engine's why-string — not a driver failure (the task's explicit rule).
//
// THE BEAT RULE (pre-registered): challenge beats take the FIRST presented
// option (the authored straightforward walk — the winpursuit drain
// precedent). Trial opt-in is a composition param (default OFF — the
// sibling measured trial-by-combat 3/3 lethal; this arm wants clean path
// resolutions). Finals: first option. Downgrade: re-apply the door rule
// among the remaining earned 'downgrade:*' options. Conscript: refuse
// ('conscript:no' — the modalplay precedent; canon: refusable).
// Demand-price: first option. The ONLY policy choices are the door (and
// the trial flag); branches stay ledger-earned — the driver NEVER
// overrides tableBranch (docs/TABLE.md law).
//
// THE DARK-ROAD COMPOSITION: on relay-assigned runs the relaydark layer
// (scripts/policies/relaydark.js, RELAYDARK=1) plays the relay dark
// pre-table through the real verb surface (claim → reroute-efficient →
// deepen → rewrite/skim), aiming lean <= -44, grounding <= 48, darkUses
// >= 6 — so the relay walk can meet the engine's REAL dark band. The
// driver itself never forces a branch; it reads tableBranch and records.
//
// COMPOSITION: withTablePathDriver(withSeatDrive(withWinDefer(
// withRelayDark(TF base)))) on {leadfeast, belongfeast} tribfloor bases.
// The layer's daily takes the seat FIRST (the inner stack's exported
// driveSeat verb — the seat must be taken before the drain, because the
// inner stack's driveSeat fires mid-inner-daily, after an early drain
// would already have run), then drains the modal with the rules above,
// then delegates inward — whose driveSeat no-ops (pg.tableDone) and whose
// windefer tableRoad finds no pending modal. The drain mirrors tableRoad
// exactly (30-answer cap, no-progress stall guard, breaks on Game.over
// and on a live tbfight).
//
// ATTRIBUTION: every drain iteration is logged into ctx._tablepathdriver:
// {assigned, walked: [{path, branch}], log: [{day, phase, path, branch,
// beat, optionId, label}], doorEvents, finalsEvents, branchMargins}.
// branchMargins[pathId] = the engine's live tableBranch(pathId) signals
// at door-walk time — the ledger-dark distance in numbers (the instrument
// for the "why dark never surfaces" finding). The probe copies the
// summary + relay state into the per-seed JSON.
//
// ENV-GATED TABLEPATHDRIVER=1 (default OFF — unset delegates to the
// wrapped policy byte-identically; the proof's DET gate pins that).
//
// POLICY-SIDE ONLY — zero src/js changes, zero new RNG draws. NEVER edit
// seatdrive.js, windefer.js, or tablepaths.js.
'use strict';
const SD = require('./seatdrive');
const WD = require('./windefer');
const TF = require('./tribfloor');
const RD = require('./relaydark');

// Default-OFF: TABLEPATHDRIVER=1 is the only on-switch. Unset delegates
// to the wrapped policy byte-identically.
function layerOn() { return process.env.TABLEPATHDRIVER === '1'; }

// Pre-registered door rotation (evidence header). Indispensable + witness
// get 2 probes each (one per policy); the remaining 12 concentrate on
// relay (the dark-road candidate) and defiant (sibling replication).
const ROTATION = {
  leadfeast: ['indispensable', 'witness', 'relay', 'relay', 'defiant', 'relay', 'defiant', 'relay'],
  belongfeast: ['witness', 'indispensable', 'relay', 'defiant', 'relay', 'defiant', 'relay', 'defiant'],
};
// Fallback order over all 7 doors (indispensable/witness are never earned
// on this substrate, so the effective fallback starts at defiant).
const FALLBACK7 = ['indispensable', 'witness', 'defiant', 'assimilated', 'beloved', 'relay', 'feared'];

function assignedDoor(policyId, seedIdx) {
  const rot = ROTATION[policyId] || ROTATION.leadfeast;
  return rot[seedIdx % rot.length];
}

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

// earnedDoors(Game): the engine's own pricing — which doors are earned
// RIGHT NOW, with the engine's why-strings. Pure read.
function earnedDoors(Game) {
  const out = [];
  try {
    const paths = (typeof Game.tableEarnedPaths === 'function') ? Game.tableEarnedPaths() : [];
    for (const p of (paths || [])) out.push({ id: String(p.id), earned: !!p.earned, why: String(p.why || '') });
  } catch (e) {}
  return out;
}

// pickDoor(Game, opts, assigned): the door rule. Returns {id, fellBack,
// why, missWhy} or null. A door never offered is NEVER taken.
function pickDoor(Game, opts, assigned) {
  const offered = (opts || []).filter(o => String((o && o.id) || '').indexOf('path:') === 0);
  if (!offered.length) return null;
  const doors = earnedDoors(Game);
  const earnedSet = {};
  const whyOf = {};
  for (const d of doors) { if (d.earned) earnedSet[d.id] = true; whyOf[d.id] = d.why; }
  const offeredIds = offered.map(o => String(o.id).slice(5));
  const offeredEarned = offeredIds.filter(id => earnedSet[id]);
  if (!offeredEarned.length) return null; // nothing earnable — never force
  if (assigned && offeredEarned.indexOf(assigned) >= 0) {
    return { id: 'path:' + assigned, fellBack: false, why: 'assigned+' + assigned };
  }
  // Fallback: first earned offered door in the pre-registered 7-order,
  // with the engine's why-string for the assigned miss.
  for (const id of FALLBACK7) {
    if (offeredEarned.indexOf(id) >= 0) {
      return {
        id: 'path:' + id, fellBack: true,
        why: 'fallback: assigned=' + (assigned || 'none') +
          ' not earned/offered; earned=[' + offeredEarned.join(',') + ']',
        missWhy: assigned ? (whyOf[assigned] || 'no why from engine') : null,
      };
    }
  }
  return null;
}

// pickBeat(opts, trialArmed): the beat rule. First presented option,
// EXCEPT the trial opt-in on trial-armed runs (default off this arm).
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
    const dg = (opts || []).filter(o => String((o && o.id) || '').indexOf('downgrade:') === 0);
    if (!dg.length) return null;
    const doors = earnedDoors(Game);
    const earnedSet = {};
    for (const d of doors) if (d.earned) earnedSet[d.id] = true;
    const failed = ((T && T.failedDoors) || []).map(String);
    const cands = dg.filter(o => {
      const id = String(o.id).slice(10);
      return earnedSet[id] && failed.indexOf(id) < 0;
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

function ensureTPD(ctx, params) {
  let TPD = ctx._tablepathdriver;
  if (!TPD || TPD.assigned !== params.door) {
    TPD = ctx._tablepathdriver = {
      assigned: params.door || null, trial: !!params.trial,
      walked: [], log: [], doorEvents: [], trialEvents: [], finalsEvents: [],
      branchMargins: {}, answers: 0, stalls: 0,
    };
  }
  return TPD;
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

// branchMargins(Game): the engine's live tableBranch(pathId) signals for
// the ledger paths, captured at door-walk time. PURE reads — the
// instrument for the "why dark never surfaces" finding: dark vs light
// margins in the engine's own numbers.
const MARGIN_PATHS = ['feared', 'indispensable', 'beloved', 'witness', 'assimilated', 'defiant'];
function branchMargins(Game) {
  const out = {};
  try {
    for (const pid of MARGIN_PATHS) {
      if (typeof Game.tableBranch !== 'function') break;
      const s = Game.tableBranch(pid) || {};
      out[pid] = {
        branch: s.branch || null, dark: s.dark | 0, light: s.light | 0,
        notes: (s.notes || []).slice(0, 8),
      };
    }
  } catch (e) {}
  return out;
}

// drainTable: the forcing drain. Mirrors tableRoad's loop contract
// (30-answer cap, no-progress stall guard, Game.over break, live-fight
// break) with the door/beat rules above. Read-only until each
// chooseTableOption call.
function drainTable(Game, ctx, params) {
  const TPD = ensureTPD(ctx, params);
  let n = 0, lastSig = null, stall = 0;
  for (;;) {
    if (Game.over) break;
    if (n >= 30) break;
    try { if (Game.tbfight && !Game.tbfight.over) break; } catch (e) {}
    const ms = modalState(Game);
    if (!ms) break;
    const sig = ms.phase + '|' + ms.opts.map(o => o.id).join(',');
    if (sig === lastSig && ++stall >= 2) { TPD.stalls = (TPD.stalls | 0) + 1; break; }
    lastSig = sig;
    const pick = pickOption(Game, ms, params);
    if (!pick) break;
    const before = snapTable(Game);
    try { Game.chooseTableOption(pick.id); } catch (e) { break; }
    n++;
    TPD.answers = (TPD.answers | 0) + 1;
    const after = snapTable(Game);
    const rec = {
      day: gday(Game), phase: before.phase, path: before.path, branch: before.branch,
      beat: before.beat, optionId: pick.id, note: pick.note,
      toPhase: after.phase, toPath: after.path, toBranch: after.branch, toBeat: after.beat,
      trialPending: after.trialPending,
    };
    TPD.log.push(rec);
    if (pick.doorEvent) {
      TPD.doorEvents.push({
        day: rec.day, picked: pick.id, fellBack: !!pick.doorEvent.fellBack,
        why: pick.doorEvent.why, missWhy: pick.doorEvent.missWhy || null,
      });
    }
    if (pick.trialEvent) {
      TPD.trialEvents.push({ day: rec.day, path: before.path || after.path, fired: after.trialPending });
    }
    if (before.phase === 'finals') TPD.finalsEvents.push({ day: rec.day, path: before.path, branch: before.branch, finalId: pick.id });
    // A door walked: record the walk (phase 'paths' -> 'challenge' with a
    // path set) + the engine's branch margins for the ledger paths.
    if (before.phase === 'paths' && after.path && after.phase === 'challenge') {
      TPD.walked.push({ day: rec.day, path: after.path, branch: after.branch, door: pick.id, fellBack: !!(pick.doorEvent && pick.doorEvent.fellBack) });
      try { TPD.branchMargins = branchMargins(Game); } catch (e) {}
    }
    if (TPD.log.length > 400) TPD.log.splice(0, TPD.log.length - 400);
  }
  return n;
}

function withTablePathDriver(inner, id, desc, params) {
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
        SD.driveSeat(Game, ctx);
        drainTable(Game, ctx, params);
      } catch (e) { ctx.tpdDrainError = (ctx.tpdDrainError | 0) + 1; }
      return inner.daily(Game, ctx);
    },
  });
}

// composedFor(policyId, seedIdx, opts): the full arm composition.
//   withTablePathDriver(withSeatDrive(withWinDefer(withRelayDark(TF base))))
// opts.relaydarkAll: activate the relaydark road on every run (diagnostic);
// default activates it only on relay-assigned runs.
function composedFor(policyId, seedIdx, opts) {
  opts = opts || {};
  const base = policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  const tag = policyId === 'leadfeast' ? 'lead' : 'belong';
  const door = assignedDoor(policyId, seedIdx);
  const rdActive = !!(opts.relaydarkAll || door === 'relay');
  const rd = RD.withRelayDark(base, `${tag}-relaydark`,
    `${policyId} + relaydark road (RELAYDARK=1, active=${rdActive})`, { active: rdActive });
  const wd = WD.withWinDefer(rd, `${tag}-windefer`, `${policyId} + win-side layers (WINPURSUIT=1 + WINDEFER=1)`);
  const sd = SD.withSeatDrive(wd, `${tag}-windefer`, `${policyId} + win-side stack + seatdrive (SEATDRIVE=1)`);
  return withTablePathDriver(sd, `${tag}-tablepathdriver`,
    `${policyId} + seatdrive stack + tablepathdriver (TABLEPATHDRIVER=1, door=${door}, trial=false, relaydark-active=${rdActive})`,
    { door, trial: false });
}

module.exports = {
  layerOn, withTablePathDriver, composedFor, assignedDoor, drainTable, pickOption,
  pickDoor, pickBeat, modalState, earnedDoors, branchMargins, TABLE_PHASES,
  ROTATION, FALLBACK7,
};
