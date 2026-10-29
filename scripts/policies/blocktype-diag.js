// policies/blocktype-diag.js — refused-evening blockage census
// recorder (sim-blocktype-b, 2026-10-29, flesh-out loop B,
// axis food-economy, DIAG ONLY: zero src/js changes,
// policy-side recorder only).
//
// QUESTION (prereg: evidence/2026-10-29/
// sim-blocktype-b-prereg.md): on current master, with the
// evening-detour gate OFF, which blockage types still refuse
// evenings, in what shares, and which are already covered by
// a route-around (answered by the eveningdetour lever) vs
// genuinely uncovered (no BFS route-around home exists)?
//
// OBSERVATIONAL ONLY. BLOCKTYPE_DIAG=1 is the only
// on-switch. Unset, the wrapper delegates unchanged: no
// ctx surface, no record. When ON, after the wrapped
// policy's daily, on a travel-refused evening ONLY
// (ctx._ntLast.outcome === 'travel-refused': haven
// offered, hop refused, not combat, not tent), the
// recorder classifies on the true refused state
// (position unchanged by refusal):
//   - blockage via scripts/creekpath-probe-b.js
//     directHopBlockage (pure reads, mirrored from
//     travelTo's refusal scan) -> {blockType, x, y, leg};
//   - cross-check vs the policy's own hopReturnKind
//     ('block:<type>'): a mismatch is recorded with
//     probeAgrees=false and counts as UNCLASSIFIED
//     (never papered over);
//   - route-around via bfsRouteAround (orthogonal BFS,
//     each step travelBlockage-clean) -> {length, path}
//     or null. The BFS is the judge, exactly as in the
//     eveningdetour prereg: no orthogonal path counts
//     as NO route-around, honestly uncovered.
// The recorder adds NO say lines, draws NO RNG, writes
// NO game state, wraps NO engine function. The only
// writes are the ctx record (ctx._blocktypeLast) and
// the store's own counters — the same class as the
// departhold recorder precedent. Recording errors are
// counted in the store (errs), never thrown into the
// engine: a recorder error on a refused evening makes
// that evening unclassified by definition.
'use strict';

const { directHopBlockage, bfsRouteAround } = require('../creekpath-probe-b');

function layerOn() { try { return process.env.BLOCKTYPE_DIAG === '1'; } catch (e) { return false; } }

function newStore() {
  return { records: [], errs: 0, errors: [], classified: 0, unclassified: 0 };
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

// Classify one refused evening from live state. Pure reads
// only (directHopBlockage + bfsRouteAround). Returns the
// record; never throws (errors are returned as fields).
function classifyRefusedEvening(Game, nt) {
  const rec = {
    blockType: null, blockedTile: null, leg: null,
    hopReturnKind: (nt && nt.travel) ? (nt.travel.hopReturnKind || null) : null,
    probeAgrees: false, probeError: null,
    routeAroundLength: null, routeAroundPath: null, routeAroundError: null,
    departure: null, haven: null, kcal: null,
  };
  try {
    const before = (nt && nt.before) || {};
    rec.departure = { tile: before.tile || null, mapPx: (before.mapPx === undefined ? null : before.mapPx), mapPy: (before.mapPy === undefined ? null : before.mapPy) };
    rec.haven = nt.haven ? { hx: nt.haven.hx, hy: nt.haven.hy, type: nt.haven.type || null } : null;
    rec.kcal = (before.kcal === undefined ? null : before.kcal);
    if (!rec.haven || rec.haven.hx === null || rec.haven.hx === undefined) {
      rec.probeError = 'no-haven';
      return rec;
    }
    let probe = null;
    try { probe = directHopBlockage(Game, rec.haven.hx, rec.haven.hy); }
    catch (e) { rec.probeError = 'directHopBlockage: ' + String(e && e.message).slice(0, 120); return rec; }
    if (!probe) {
      // The hop refused but the probe finds no blockage:
      // a genuine disagreement, recorded honestly.
      rec.probeError = 'probe-found-no-blockage';
      return rec;
    }
    rec.blockType = probe.blockType || null;
    rec.blockedTile = { x: probe.x, y: probe.y };
    rec.leg = probe.leg || null;
    const hopType = hopTypeOf(rec.hopReturnKind);
    rec.probeAgrees = !!(rec.blockType && hopType && rec.blockType === hopType);
    if (!rec.probeAgrees) return rec;
    let route = null;
    try { route = bfsRouteAround(Game, rec.haven.hx, rec.haven.hy); }
    catch (e) { rec.routeAroundError = 'bfsRouteAround: ' + String(e && e.message).slice(0, 120); return rec; }
    if (route && route.error) { rec.routeAroundError = route.error; return rec; }
    if (route) {
      rec.routeAroundLength = (route.length === undefined ? null : route.length);
      rec.routeAroundPath = route.path || null;
    } else {
      rec.routeAroundLength = null;
      rec.routeAroundPath = null;
    }
    return rec;
  } catch (e) {
    rec.probeError = 'classify: ' + String(e && e.message).slice(0, 120);
    return rec;
  }
}

// A record is CLASSIFIED iff it has a non-null blockType,
// probeAgrees, and no error field set. Anything else is
// UNCLASSIFIED (prereg definition).
function isClassified(rec) {
  if (!rec) return false;
  if (!rec.blockType || !rec.probeAgrees) return false;
  if (rec.probeError || rec.routeAroundError) return false;
  return true;
}

function withBlocktypeDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (!layerOn()) return r;
      try { ctx._blocktype = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      let last = null;
      try {
        const nt = ctx._ntLast || {};
        if (nt.outcome === 'travel-refused') {
          last = classifyRefusedEvening(Game, nt);
          try { st.records.push(last); } catch (e) { noteErr(st, 'daily.push', e); }
          if (isClassified(last)) st.classified++;
          else st.unclassified++;
        }
      } catch (e) { noteErr(st, 'daily.classify', e); }
      try { ctx._blocktypeLast = last; } catch (e) { noteErr(st, 'daily.ctxlast', e); }
      return r;
    },
  });
}

module.exports = {
  layerOn, newStore, classifyRefusedEvening, isClassified, withBlocktypeDiag,
};
