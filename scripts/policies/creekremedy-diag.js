// policies/creekremedy-diag.js — creek-remedy feasibility DIAG
// recorder (sim-creekremedy-b, 2026-10-29, flesh-out loop B,
// axis food-economy, DIAG ONLY: zero src/js changes,
// policy-side recorder only).
//
// QUESTION (prereg: evidence/2026-10-29/
// sim-creekremedy-b-prereg.md): on a creek-refused
// evening, is the engine's bridge remedy feasible
// same-day from the code's own terms — 4 player-carried
// wood + 60 kcal via Game.buildBridge, no skill gate —
// and if not, which precondition binds (wood? kcal?)?
// A ford mechanic does not exist in the engine, so no
// ford share is ever reported; "mechanic absent" is
// the ford finding.
//
// OBSERVATIONAL ONLY. CREEKREMEDY_DIAG=1 is the only
// on-switch. Unset, the wrapper delegates unchanged: no
// ctx surface, no record. When ON, after the wrapped
// policy's daily, on a travel-refused evening ONLY
// (ctx._ntLast.outcome === 'travel-refused'), the
// recorder classifies on the true refused state
// (position unchanged by refusal):
//   - blockage via scripts/creekpath-probe-b.js
//     directHopBlockage (pure reads) -> {blockType, x,
//     y, leg}, cross-checked vs the policy's own
//     hopReturnKind ('block:<type>');
//   - route-around via bfsRouteAround (orthogonal BFS)
//     -> {length, path} or null, CONTEXT ONLY (the
//     detour lever already covers route-around-able
//     evenings; a BFS error never unclassifies a
//     creek evening);
//   - feasibility reads at refusal time (the
//     post-competent.daily state): player wood
//     (Game.woodCount), village pile
//     (state.village.wood), scholar kcal, swimmer
//     flag, dayTicks, blocked-tile needsBridge /
//     bridged flags.
// The recorder adds NO say lines, draws NO RNG, writes
// NO game state, wraps NO engine function. The only
// writes are the ctx record (ctx._creekremedyLast)
// and the store's own counters. Recording errors are
// counted in the store (errs), never thrown into the
// engine: a recorder error on a refused evening makes
// that evening unclassified by definition.
'use strict';

const { directHopBlockage, bfsRouteAround } = require('../creekpath-probe-b');

function layerOn() { try { return process.env.CREEKREMEDY_DIAG === '1'; } catch (e) { return false; } }

function newStore() {
  return { records: [], errs: 0, errors: [], classified: 0, unclassified: 0, otherRefused: 0 };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

function hopTypeOf(hopReturnKind) {
  if (typeof hopReturnKind !== 'string') return null;
  const m = /^block:(.+)$/.exec(hopReturnKind);
  return m ? m[1] : null;
}

function combatLive(Game) {
  try { if (Game.inCombat && Game.inCombat()) return true; } catch (e) {}
  try { if (Game.pendingEncounter) return true; } catch (e) {}
  try { if (Game.tbfight && !Game.tbfight.over) return true; } catch (e) {}
  return false;
}

// Pure feasibility judge over a record's raw fields (prereg
// definition). Unit-tested by scripts/test-creekremedy-b.js
// T1; the recorder only fills the fields, never re-judges.
function feasibleOf(r) {
  if (!r) return { feasible: false, floorFeasible: false, binding: 'other' };
  const needsBridge = r.blockedTileNeedsBridge === true;
  const bridged = r.blockedTileBridged === true;
  const woodOk = (r.woodPlayer !== null && r.woodPlayer !== undefined && r.woodPlayer >= 4);
  const kcalOk = (r.kcal !== null && r.kcal !== undefined && r.kcal >= 60);
  const aliveOk = !r.gameOver && !r.combatLive;
  const feasible = !!(needsBridge && !bridged && woodOk && kcalOk && aliveOk);
  const floorFeasible = !!(feasible && r.kcal !== null && r.kcal !== undefined && (r.kcal - 60) >= 200);
  let binding = null;
  if (!feasible) {
    if (!needsBridge || bridged) binding = 'other';
    else if (!aliveOk) binding = 'other';
    else if (!woodOk) binding = 'wood-short';
    else if (!kcalOk) binding = 'kcal-short';
    else binding = 'other';
  }
  return { feasible, floorFeasible, binding };
}

// Classify one refused evening from live state. Pure reads
// only. Returns the record; never throws (errors are
// returned as fields).
function classifyRefusedEvening(Game, nt) {
  const rec = {
    blockType: null, blockedTile: null, leg: null,
    hopReturnKind: (nt && nt.travel) ? (nt.travel.hopReturnKind || null) : null,
    probeAgrees: false, probeError: null,
    routeAroundLength: null, routeAroundPath: null, routeAroundError: null,
    departure: null, haven: null,
    kcal: null, kcalLive: null, woodPlayer: null, woodPile: null,
    swimmer: null, dayTicks: null, dayTicksLive: null, ticksToDayEnd: null, rollsDay: null,
    blockedTileNeedsBridge: null, blockedTileBridged: null,
    gameOver: null, combatLive: null,
    isCreek: false, feasible: false, floorFeasible: false, binding: null,
  };
  try {
    const before = (nt && nt.before) || {};
    rec.departure = { tile: before.tile || null, mapPx: (before.mapPx === undefined ? null : before.mapPx), mapPy: (before.mapPy === undefined ? null : before.mapPy) };
    rec.haven = nt.haven ? { hx: nt.haven.hx, hy: nt.haven.hy, type: nt.haven.type || null } : null;
    rec.kcal = (before.kcal === undefined ? null : before.kcal);
    rec.dayTicks = (before.dayTicks === undefined ? null : before.dayTicks);
    rec.gameOver = !!Game.over;
    try { rec.combatLive = combatLive(Game); } catch (e) { rec.combatLive = null; }
    try { const sch = (Game.state || {}).scholar || {}; rec.kcalLive = (sch.kcal === undefined ? null : Math.round(sch.kcal)); } catch (e) { rec.kcalLive = null; }
    try { const sch = (Game.state || {}).scholar || {}; rec.dayTicksLive = (sch.dayTicks === undefined ? null : sch.dayTicks); } catch (e) { rec.dayTicksLive = null; }
    try { rec.woodPlayer = (typeof Game.woodCount === 'function') ? Game.woodCount() : null; } catch (e) { rec.woodPlayer = null; }
    try { const v = (Game.state || {}).village || {}; rec.woodPile = (v.wood === undefined ? null : v.wood); } catch (e) { rec.woodPile = null; }
    try { rec.swimmer = (typeof Game.hasAbility === 'function') ? !!Game.hasAbility('swimmer') : null; } catch (e) { rec.swimmer = null; }
    if (rec.dayTicks !== null && rec.dayTicks !== undefined) {
      rec.ticksToDayEnd = 512 - rec.dayTicks;
      rec.rollsDay = rec.ticksToDayEnd < 96;
    }
    if (!rec.haven || rec.haven.hx === null || rec.haven.hx === undefined) {
      rec.probeError = 'no-haven';
      return rec;
    }
    let probe = null;
    try { probe = directHopBlockage(Game, rec.haven.hx, rec.haven.hy); }
    catch (e) { rec.probeError = 'directHopBlockage: ' + String(e && e.message).slice(0, 120); return rec; }
    if (!probe) { rec.probeError = 'probe-found-no-blockage'; return rec; }
    rec.blockType = probe.blockType || null;
    rec.blockedTile = { x: probe.x, y: probe.y };
    rec.leg = probe.leg || null;
    const hopType = hopTypeOf(rec.hopReturnKind);
    // NOTE: for intermediate-leg blocks the hop destination
    // is haven but the blocked tile is the intermediate, so
    // agreement is judged on TYPE: same-type counts as
    // agreement (the probe's tile is authoritative for the
    // record); a type mismatch is a disagreement.
    rec.probeAgrees = !!(rec.blockType && hopType && rec.blockType === hopType);
    try {
      const t = Game.tileAt(rec.blockedTile.x, rec.blockedTile.y);
      if (t) { rec.blockedTileNeedsBridge = (t.needsBridge === undefined ? null : !!t.needsBridge); rec.blockedTileBridged = (t.bridged === undefined ? null : !!t.bridged); }
    } catch (e) { /* tile flags stay null; feasibility judges needsBridge false -> other */ }
    try {
      const route = bfsRouteAround(Game, rec.haven.hx, rec.haven.hy);
      if (route && route.error) rec.routeAroundError = route.error;
      else if (route) { rec.routeAroundLength = (route.length === undefined ? null : route.length); rec.routeAroundPath = route.path || null; }
      else { rec.routeAroundLength = null; rec.routeAroundPath = null; }
    } catch (e) { rec.routeAroundError = 'bfsRouteAround: ' + String(e && e.message).slice(0, 120); }
    const hopSaysCreek = hopType === 'creek';
    rec.isCreek = !!(hopSaysCreek && rec.probeAgrees && rec.blockType === 'creek' && !rec.probeError);
    if (rec.isCreek) {
      const f = feasibleOf(rec);
      rec.feasible = f.feasible; rec.floorFeasible = f.floorFeasible; rec.binding = f.binding;
    }
    return rec;
  } catch (e) {
    rec.probeError = 'classify: ' + String(e && e.message).slice(0, 120);
    return rec;
  }
}

// A record is a CLASSIFIED CREEK evening iff isCreek and
// no probe error. A travel-refused evening whose hop says
// creek but which is not isCreek is UNCLASSIFIED (prereg
// definition). Non-creek refusals are OTHER-REFUSED.
function bucketOf(rec) {
  if (!rec) return 'none';
  if (rec.isCreek && !rec.probeError) return 'creek';
  const hopType = hopTypeOf(rec.hopReturnKind);
  if (hopType === 'creek') return 'unclassified';
  return 'other-refused';
}

function withCreekremedyDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (!layerOn()) return r;
      try { ctx._creekremedy = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      let last = null;
      try {
        const nt = ctx._ntLast || {};
        if (nt.outcome === 'travel-refused') {
          last = classifyRefusedEvening(Game, nt);
          try { st.records.push(last); } catch (e) { noteErr(st, 'daily.push', e); }
          const b = bucketOf(last);
          if (b === 'creek') st.classified++;
          else if (b === 'unclassified') st.unclassified++;
          else if (b === 'other-refused') st.otherRefused++;
        }
      } catch (e) { noteErr(st, 'daily.classify', e); }
      try { ctx._creekremedyLast = last; } catch (e) { noteErr(st, 'daily.ctxlast', e); }
      return r;
    },
  });
}

module.exports = {
  layerOn, newStore, classifyRefusedEvening, feasibleOf, bucketOf, withCreekremedyDiag,
};
