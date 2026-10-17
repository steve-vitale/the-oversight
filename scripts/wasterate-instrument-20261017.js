#!/usr/bin/env node
// scripts/wasterate-instrument-20261017.js — waste-rate instrument (sim-wasterate-b, 2026-10-17).
//
// DEFINITION (pre-registered): wasteRate = pantryRotKcal / (pantryStartKcal + pantryInKcal)
//   pantryRotKcal   = fresh-kcal that ROTTED in the player's village pantry
//                     (sweepSpoiled removal) + desperationRotKcal (spoiled
//                     pantry kcal eaten desperately via drawSpoiled — it rotted,
//                     eating it doesn't un-rot it).
//   pantryStartKcal = village pantry kcal right after setupGame (seed stock).
//   pantryInKcal    = cumulative kcal deposited into the player's village
//                     pantry during the run, measured per wrapped deposit
//                     funnel as max(0, after-before) on the player's pantry.
//
// COMPLETENESS PROOF: every wrap is pure read + call-through behind ONE
// global reentrancy guard (outermost wrapped call in a nest accumulates;
// caller/callee pairs in the wrap set never double-count). The conservation
// identity pantryStartKcal + pantryInKcal - pantryOutKcal - pantryRotKcal -
// desperationRotKcal = pantryEndKcal must hold within rounding on every run.
// A blown residual NAMES the missing flow instead of silently misattributing
// it (the filename/array-position attribution drift class).
//
// NETTING CAVEAT (documented, bounded): a wrapped method that both deposits
// and withdraws contributes its NET to the inflow bucket. T is therefore a
// LOWER bound on gross inflow and the reported waste rate an UPPER bound on
// the true rate. t.perMethod records per-method in/out so the analyzer can
// quantify the mixed share (mixedInShare).
//
// SCOPE: the PLAYER's village pantry only (this.state.village.pantry at call
// time). Scholar inventory / prepStash rot is recorded separately as
// freshRotKcal (archive-compat with the trig6/drawcap instruments) but
// EXCLUDED from the waste rate — prepStash holds unprocessed hauls that never
// entered the pantry (game.js returnToVillage).
//
// WRAP SET (zero src/js changes — instance-level shadowing only):
//   inflow (delta):  depositPantryPieces, stockSurplus, pantryAdd, linkTick,
//                    tradeTick, drawLeaguePool, answerRaid, awayPartiesReturnTick,
//                    relaySkim, answerSuccession, objReturnEffect
//   outflow (delta): takeFromPantry, takeFromPantryBulk, npcTakeAction,
//                    npcChildAction, resolveOneAssignment
//   outflow (return): _removePantryKcal (returns removed kcal),
//                    pantryDraw (returns {taken,...})
//   rot (snapshot):  sweepSpoiled (pantry-only + archive-compat totals),
//                    drawSpoiled (desperation — snapshot delta on fresh-spoiled
//                    pantry kcal, since the engine eats it without sweeping)
//
// Usage:
//   const { attachWasteRate, snapshotStart, conservation } = require('./wasterate-instrument-20261017');
//   attachWasteRate(Game, t); snapshotStart(Game, t); ...run...; conservation(Game, t);
'use strict';

function pantryKcalOf(v) {
  try {
    return ((v || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}

// Spoilage scan, split by the archive "fresh" convention (preserved /
// rendered / pemmican excluded — matches the trig6/drawcap rot instrument)
// vs non-fresh (preserved/rendered/pemmican). The ENGINE's sweep removes ALL
// spoiled pantry items (no foodState filter — food.js:2333), so the
// conservation identity needs both; the archive-comparable waste rate uses
// fresh only.
function isFreshFood(it) {
  if (!it) return false;
  if (it.foodState === 'preserved' || it.foodState === 'rendered') return false;
  if ((it.foodKind || '') === 'pemmican') return false;
  return true;
}

function spoiledScan(Game, arr) {
  let fk = 0, fn = 0, pk = 0, pn = 0;
  let isSpoiled = null;
  try { isSpoiled = Game.isSpoiled ? Game.isSpoiled.bind(Game) : null; } catch (e) {}
  for (const it of (arr || [])) {
    if (!it) continue;
    let s = false;
    try { s = isSpoiled ? !!isSpoiled(it) : false; } catch (e) {}
    if (!s) continue;
    const k = Math.round((it.kcalEach || 0) * (it.units || 1));
    if (isFreshFood(it)) { fk += k; fn++; } else { pk += k; pn++; }
  }
  return { fk, fn, pk, pn };
}

// legacy name kept for the test hook
function spoiledFreshScan(Game, arr) {
  const s = spoiledScan(Game, arr);
  return { k: s.fk, n: s.fn };
}

const INFLOW = ['depositPantryPieces', 'stockPantry', 'stockSurplus', 'pantryAdd', 'linkTick',
  'tradeTick', 'drawLeaguePool', 'answerRaid', 'awayPartiesReturnTick',
  'relaySkim', 'answerSuccession', 'objReturnEffect'];
const OUTFLOW_DELTA = ['takeFromPantry', 'takeFromPantryBulk', 'npcTakeAction',
  'npcChildAction', 'resolveOneAssignment', 'pantryDraw', 'apPlaygroundRaid'];
// NOTE on pantryDraw: DELTA-style, not return-style, on purpose.
// pantryDraw(v, want, {cook:true}) reports out.taken at COOKED kcal
// (cookTransform perfect-outcome) while the pantry loses RAW kcal — the
// return overstates actual pantry outflow whenever cooking adds calories
// (measured -6.15% residual before this fix). The delta measures exactly what
// left the pantry. Delta-style is also inherently scoped: draws from a COPY
// pantry (game.js:27718 what-if) or another village naturally delta to 0.
// return-value outflow funnels: [methodName, kcalOfReturn]
const OUTFLOW_RETURN = [
  ['_removePantryKcal', (r) => r | 0],
];

function attachWasteRate(Game, t) {
  t.pantryStartKcal = 0;
  t.pantryInKcal = 0;
  t.pantryOutKcal = 0;
  t.pantryRotKcal = 0;
  t.pantryRotItems = 0;
  t.pantryRotPreservedKcal = 0; // spoiled preserved/rendered/pemmican (engine removes; archive excludes)
  t.pantryRotPreservedItems = 0;
  t.desperationRotKcal = 0;
  t.desperationRotItems = 0;
  t.desperationRotPreservedKcal = 0;
  t.desperationRotPreservedItems = 0;
  t.freshRotKcal = 0;   // archive-compat: scholar inv + prepStash + pantry
  t.freshRotItems = 0;
  t.perMethod = {};
  t.wrapped = { inflow: [], outflow: [], rot: [] };
  t.wrapFailed = [];
  t.wrErrors = 0;

  let depth = 0; // single global reentrancy guard
  const pv = () => { try { return Game.state.village || null; } catch (e) { return null; } };
  const bump = (name, dk) => {
    const m = t.perMethod[name] || (t.perMethod[name] = { in: 0, out: 0 });
    if (dk >= 0) m.in += dk; else m.out += -dk;
  };

  // wrapFlow: delta-style or return-style wrap with the global guard.
  // kind is documentary ('in'/'out'); the DELTA SIGN decides the bucket so
  // mixed methods stay identity-exact.
  function wrapFlow(name, kind, viaReturn) {
    let orig = null;
    try { orig = Game[name]; } catch (e) { t.wrErrors++; t.wrapFailed.push(name); return false; }
    if (typeof orig !== 'function') { t.wrapFailed.push(name); return false; }
    Game[name] = function (...args) {
      const outer = depth === 0;
      depth++;
      const v = pv();
      const vPantry = v ? v.pantry : null;
      const before = (outer && vPantry) ? pantryKcalOf(v) : 0;
      let r, err = null;
      try { r = orig.apply(this, args); } catch (e) { err = e; }
      depth--;
      if (outer && !err) {
        try {
          if (viaReturn) {
            const k = Math.max(0, Math.round(viaReturn(r) || 0));
            if (k > 0) {
              if (kind === 'out') { t.pantryOutKcal += k; bump(name, -k); }
              else { t.pantryInKcal += k; bump(name, k); }
            }
          } else {
            const v2 = pv();
            const after = (v2 && v2.pantry) ? pantryKcalOf(v2) : 0;
            const d = after - before;
            if (d > 0) { t.pantryInKcal += d; bump(name, d); }
            else if (d < 0) { t.pantryOutKcal += -d; bump(name, d); }
          }
        } catch (e) { t.wrErrors++; }
      }
      if (err) throw err;
      return r;
    };
    t.wrapped[kind === 'in' ? 'inflow' : 'outflow'].push(name);
    return true;
  }

  for (const n of INFLOW) wrapFlow(n, 'in', null);
  for (const n of OUTFLOW_DELTA) wrapFlow(n, 'out', null);
  for (const [n, kf] of OUTFLOW_RETURN) wrapFlow(n, 'out', kf);

  // ROT: sweepSpoiled — snapshot spoiled fresh kcal just before the engine's
  // sweep runs (same convention as the trig6/drawcap instrument), plus a
  // pantry-only split for the waste-rate numerator.
  function wrapSweepSpoiled() {
    let orig = null;
    try { orig = Game.sweepSpoiled ? Game.sweepSpoiled.bind(Game) : null; } catch (e) {}
    if (!orig) { t.wrapFailed.push('sweepSpoiled'); return false; }
    Game.sweepSpoiled = function (...args) {
      const outer = depth === 0;
      depth++;
      let snap = null;
      if (outer) {
        try {
          const s = Game.state.scholar || {};
          const pinv = s.inventory || [];
          let ps = null;
          try { ps = Game.prepStash ? Game.prepStash() : null; } catch (e) {}
          const v = pv();
          const a = spoiledScan(Game, pinv);
          const b = (ps && ps !== pinv) ? spoiledScan(Game, ps) : { fk: 0, fn: 0, pk: 0, pn: 0 };
          const c = spoiledScan(Game, v ? v.pantry : []);
          snap = { fk: a.fk + b.fk + c.fk, fn: a.fn + b.fn + c.fn,
                   pfk: c.fk, pfn: c.fn, ppk: c.pk, ppn: c.pn };
        } catch (e) { t.wrErrors++; }
      }
      let r, err = null;
      try { r = orig.apply(this, args); } catch (e) { err = e; }
      depth--;
      if (outer && !err && snap) {
        t.freshRotKcal += snap.fk; t.freshRotItems += snap.fn;
        t.pantryRotKcal += snap.pfk; t.pantryRotItems += snap.pfn;
        t.pantryRotPreservedKcal += snap.ppk; t.pantryRotPreservedItems += snap.ppn;
      }
      if (err) throw err;
      return r;
    };
    t.wrapped.rot.push('sweepSpoiled');
    return true;
  }

  // ROT: drawSpoiled — desperation eating of spoiled stacks bypasses
  // sweepSpoiled (the archive instruments are blind to it — R3 documents the
  // blank). Snapshot-delta on fresh-spoiled pantry kcal; the engine only
  // removes spoiled items here, so the delta is exactly the desperation rot.
  function wrapDrawSpoiled() {
    let orig = null;
    try { orig = Game.drawSpoiled ? Game.drawSpoiled.bind(Game) : null; } catch (e) {}
    if (!orig) { t.wrapFailed.push('drawSpoiled'); return false; }
    Game.drawSpoiled = function (...args) {
      const outer = depth === 0;
      depth++;
      const v = pv();
      const before = outer && v ? spoiledScan(Game, v.pantry) : { fk: 0, fn: 0, pk: 0, pn: 0 };
      let r, err = null;
      try { r = orig.apply(this, args); } catch (e) { err = e; }
      depth--;
      if (outer && !err) {
        try {
          const v2 = pv();
          const after = v2 ? spoiledScan(Game, v2.pantry) : { fk: 0, fn: 0, pk: 0, pn: 0 };
          const dfk = Math.max(0, before.fk - after.fk);
          const dfn = Math.max(0, before.fn - after.fn);
          const dpk = Math.max(0, before.pk - after.pk);
          const dpn = Math.max(0, before.pn - after.pn);
          t.desperationRotKcal += dfk; t.desperationRotItems += dfn;
          t.desperationRotPreservedKcal += dpk; t.desperationRotPreservedItems += dpn;
          bump('drawSpoiled', -(dfk + dpk)); // identity bucket: it left the pantry
          t.pantryOutKcal += 0; // (kept out of outflow — it is ROT, not use)
        } catch (e) { t.wrErrors++; }
      }
      if (err) throw err;
      return r;
    };
    t.wrapped.rot.push('drawSpoiled');
    return true;
  }

  wrapSweepSpoiled();
  wrapDrawSpoiled();
  t.__wrapFlow = wrapFlow; // test hook: lets the proof exercise the guard
  return t;
}

// snapshotStart: call AFTER setupGame, BEFORE the run — S0 is seed stock.
function snapshotStart(Game, t) {
  try {
    const v = Game.state.village || null;
    t.pantryStartKcal = pantryKcalOf(v);
  } catch (e) { t.wrErrors = (t.wrErrors || 0) + 1; }
  return t.pantryStartKcal;
}

function rotTotal(t) {
  return (t.pantryRotKcal || 0) + (t.pantryRotPreservedKcal || 0) +
         (t.desperationRotKcal || 0) + (t.desperationRotPreservedKcal || 0);
}
function rotFresh(t) {
  return (t.pantryRotKcal || 0) + (t.desperationRotKcal || 0);
}

function conservation(Game, t) {
  const end = pantryKcalOf((() => { try { return Game.state.village || null; } catch (e) { return null; } })());
  const rot = rotTotal(t);
  const residual = (t.pantryStartKcal || 0) + (t.pantryInKcal || 0)
    - (t.pantryOutKcal || 0) - rot - end;
  const denom = Math.max(1, (t.pantryStartKcal || 0) + (t.pantryInKcal || 0));
  return { start: t.pantryStartKcal || 0, in: t.pantryInKcal || 0, out: t.pantryOutKcal || 0,
    rotPantry: t.pantryRotKcal || 0, rotDesp: t.desperationRotKcal || 0,
    rotPreserved: (t.pantryRotPreservedKcal || 0) + (t.desperationRotPreservedKcal || 0), end,
    residual, rel: residual / denom };
}

// wasteRate (PRIMARY, archive-comparable): fresh pantry rot / pantry throughput.
// wasteRateAll (diagnostic): every rotted pantry kcal / pantry throughput.
function wasteRate(t) {
  const denom = (t.pantryStartKcal || 0) + (t.pantryInKcal || 0);
  return denom > 0 ? rotFresh(t) / denom : 0;
}
function wasteRateAll(t) {
  const denom = (t.pantryStartKcal || 0) + (t.pantryInKcal || 0);
  return denom > 0 ? rotTotal(t) / denom : 0;
}

// mixedInShare: fraction of inflow that passed through methods which also
// show outflow (the netting bound on T-as-lower-bound).
function mixedInShare(t) {
  let mixed = 0, total = 0;
  for (const m of Object.values(t.perMethod || {})) {
    total += m.in || 0;
    if ((m.out || 0) > 0) mixed += m.in || 0;
  }
  return total > 0 ? mixed / total : 0;
}

module.exports = { attachWasteRate, snapshotStart, conservation, wasteRate, wasteRateAll,
  mixedInShare, pantryKcalOf, INFLOW, OUTFLOW_DELTA, OUTFLOW_RETURN };
