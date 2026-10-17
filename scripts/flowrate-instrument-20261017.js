#!/usr/bin/env node
// scripts/flowrate-instrument-20261017.js — flow-rate diagnostic instrument
// (sim-flowrate-b, 2026-10-17, food-economy axis).
//
// WHY: sim-trig6-b (2026-10-17, KILLED/NO-GO) proved a stock-triggered
// drawdown cannot beat a pantry the lever itself keeps filling, and its
// metric review prescribed that future drawdown arms must (a) pre-register a
// volume-sanity check (max theoretical drawdown vs the prize's required
// delta), (b) consider triggering on FLOW (income rate) not STOCK (pantry
// size), and (c) score the prize as rot-per-pantry-kcal (waste rate), not
// absolute rot. No instrument measures these. This is the calibration.
//
// LAYERED ON the proven wasterate instrument
// (scripts/wasterate-instrument-20261017.js — conservation identity,
// inflow/outflow/rot wraps, validated |rel|=0.00% in vivo on 16 runs). This
// module adds three read-only layers, stacked OUTSIDE the WR wraps (zero
// src/js changes, pure read + call-through, its own reentrancy guard):
//
//   1. PER-DAY INFLOW: every inflow delta attributed to Game.state.scholar.day
//      (t.inflowByDay). t.inflowDayAttributed must EQUAL WR's pantryInKcal
//      exactly — proves the day attribution is complete (no missing day).
//   2. PROVENANCE TAGS: every pantry item carries _frF/_frS/_frU (flow /
//      stock / unknown units). snapshotStartFR tags seed stock; inflow wraps
//      tag new items and merged units by identity-diff. Draws decrement
//      units in place (ratio preserved); filter() preserves refs, so tags
//      are stable across the run.
//   3. ROT PROVENANCE: outer wraps on sweepSpoiled + drawSpoiled attribute
//      every rotted pantry kcal to flow / stock / rounding, in the
//      phantomfood phantomBand pattern (lt100 / b100_200 / ge200 bands).
//
// DEFINITIONS:
//   rotTotal    = pantryRotKcal + pantryRotPreservedKcal + desperationRotKcal
//                 + desperationRotPreservedKcal (the full pantry rot in the
//                 WR conservation identity).
//   rotFlow     = rotted kcal of flow-tagged units.
//   rotStock    = rotted kcal of stock-tagged units.
//   rotRounding = rotTotal - rotFlow - rotStock (untagged units, scan
//                 residue, Math.round residue). The DIAGNOSTIC GO bounds
//                 this: <=1% of rotTotal on every run — the instrument may
//                 not hide real rot in rounding.
//
// SCOPE: the PLAYER's village pantry only (matches WR). Scholar inventory /
// prepStash rot stays in WR's archive-compat fields, outside this
// decomposition.
//
// Usage:
//   const FR = require('./flowrate-instrument-20261017');
//   FR.attachFlowRate(Game, t); FR.snapshotStartFR(Game, t);
//   ... run ...; FR.flowConservation(Game, t); // cross-checks vs WR
'use strict';
const WR = require('./wasterate-instrument-20261017');

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const pv = (Game) => { try { return Game.state.village || null; } catch (e) { return null; } };

function pantryKcalOf(v) {
  try {
    return ((v || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}

// Fresh convention (archive-compat): preserved / rendered / pemmican are
// NOT "fresh" rot. Mirrors wasterate-instrument's isFreshFood.
function isFreshFood(it) {
  if (!it) return false;
  if (it.foodState === 'preserved' || it.foodState === 'rendered') return false;
  if ((it.foodKind || '') === 'pemmican') return false;
  return true;
}

function newBand() { return { flow: 0, stock: 0, rounding: 0, n: 0 }; }
function bandOf(k) { return k < 100 ? 'lt100' : k < 200 ? 'b100_200' : 'ge200'; }

function attachFlowRate(Game, t) {
  // Base layer first (its wraps end up INSIDE ours).
  WR.attachWasteRate(Game, t);

  t.inflowByDay = {};
  t.inflowDayAttributed = 0;
  t.rotFlow = 0; t.rotStock = 0; t.rotRounding = 0;
  t.rotFlowFresh = 0; t.rotStockFresh = 0;
  t.rotUntaggedItems = 0;
  t.rotBand = { lt100: newBand(), b100_200: newBand(), ge200: newBand() };
  t.rotDespFreshFR = 0;   // cross-check vs WR.desperationRotKcal
  t.rotDespPreservedFR = 0; // cross-check vs WR.desperationRotPreservedKcal
  t.rotSweepFR = 0;       // cross-check vs WR.pantryRotKcal+pantryRotPreservedKcal
  t.frWrapFailed = [];
  t.frErrors = 0;
  t.frWrapped = { flow: [], rot: [] };

  let depth = 0; // own reentrancy guard (stacked outside WR's)
  let isSpoiled = null;
  try { isSpoiled = Game.isSpoiled ? Game.isSpoiled.bind(Game) : null; } catch (e) {}

  const spoiledOf = (it) => { try { return isSpoiled ? !!isSpoiled(it) : false; } catch (e) { return false; } };

  // Split one rotted item's kcal by its provenance counters. Guarantees
  // flow+stock+rounding == itemRot exactly (rounding absorbs the unknown
  // share and the Math.round residue).
  function attributeRot(itemRot, F, S, U, fresh) {
    const tot = (F | 0) + (S | 0) + (U | 0);
    let flow = 0, stock = 0, rounding = 0;
    if (tot > 0) {
      flow = Math.round(itemRot * (F | 0) / tot);
      stock = Math.round(itemRot * (S | 0) / tot);
      rounding = itemRot - flow - stock;
      if ((U | 0) > 0) t.rotUntaggedItems++;
    } else {
      rounding = itemRot;
      t.rotUntaggedItems++;
    }
    t.rotFlow += flow; t.rotStock += stock; t.rotRounding += rounding;
    if (fresh) { t.rotFlowFresh += flow; t.rotStockFresh += stock; }
    const b = t.rotBand[bandOf(itemRot)];
    b.flow += flow; b.stock += stock; b.rounding += rounding; b.n++;
    return { flow, stock, rounding };
  }

  // Inflow/outflow-delta wrap (outer): identity-diff tagging + per-day
  // inflow attribution. Mirrors WR's delta-sign bucketing so
  // inflowDayAttributed tracks WR.pantryInKcal exactly.
  function wrapFlowTag(name) {
    let orig = null;
    try { orig = Game[name]; } catch (e) { t.frErrors++; t.frWrapFailed.push(name); return false; }
    if (typeof orig !== 'function') { t.frWrapFailed.push(name); return false; }
    Game[name] = function (...args) {
      const outer = depth === 0;
      depth++;
      const v = pv(Game);
      const vPantry = v ? v.pantry : null;
      const beforeUnits = outer && vPantry ? new Map(vPantry.map(it => [it, it.units || 0])) : null;
      const before = (outer && vPantry) ? pantryKcalOf(v) : 0;
      const day = outer ? gday(Game) : 0;
      let r, err = null;
      try { r = orig.apply(this, args); } catch (e) { err = e; }
      depth--;
      if (outer && !err) {
        try {
          const v2 = pv(Game);
          const afterArr = (v2 && v2.pantry) ? v2.pantry : [];
          const after = pantryKcalOf(v2);
          // Tagging by identity-diff: new refs are flow; unit growth on a
          // known ref is a merge (added units are flow).
          for (const it of afterArr) {
            if (!it) continue;
            const ub = beforeUnits ? beforeUnits.get(it) : undefined;
            const ua = it.units || 0;
            if (ub === undefined) {
              if (it._frF === undefined && it._frS === undefined && it._frU === undefined) {
                it._frF = ua; it._frS = 0; it._frU = 0;
              }
              // else: counters already present (moved container?) — leave them.
            } else if (ua > ub) {
              if (it._frF === undefined) { it._frF = 0; it._frS = 0; it._frU = ub; }
              it._frF += (ua - ub);
            }
          }
          const d = after - before;
          if (d > 0) {
            t.inflowByDay[day] = (t.inflowByDay[day] || 0) + d;
            t.inflowDayAttributed += d;
          }
        } catch (e) { t.frErrors++; }
      }
      if (err) throw err;
      return r;
    };
    t.frWrapped.flow.push(name);
    return true;
  }

  // Tag on the union of WR's delta wraps (inflow AND outflow-delta: either
  // can push new items, e.g. resolveOneAssignment's conversion).
  for (const n of [...WR.INFLOW, ...WR.OUTFLOW_DELTA]) wrapFlowTag(n);

  // ROT: sweepSpoiled (outer) — attribute every removed spoiled pantry item.
  function wrapSweepSpoiledFR() {
    let orig = null;
    try { orig = Game.sweepSpoiled ? Game.sweepSpoiled.bind(Game) : null; } catch (e) {}
    if (!orig) { t.frWrapFailed.push('sweepSpoiled'); return false; }
    Game.sweepSpoiled = function (...args) {
      const outer = depth === 0;
      depth++;
      let snap = null;
      if (outer) {
        try {
          const v = pv(Game);
          snap = ((v && v.pantry) || []).map(it => ({
            ref: it, units: it.units || 0, ke: it.kcalEach || 0,
            spoiled: spoiledOf(it), F: it._frF, S: it._frS, U: it._frU,
            fresh: isFreshFood(it),
          }));
        } catch (e) { t.frErrors++; }
      }
      let r, err = null;
      try { r = orig.apply(this, args); } catch (e) { err = e; }
      depth--;
      if (outer && !err && snap) {
        try {
          const v2 = pv(Game);
          const afterSet = new Set((v2 && v2.pantry) || []);
          for (const s of snap) {
            if (!s.spoiled) continue;
            if (afterSet.has(s.ref)) continue; // survived the sweep
            const itemRot = Math.round(s.ke * s.units);
            if (itemRot <= 0) continue;
            attributeRot(itemRot, s.F, s.S, s.U, s.fresh);
            t.rotSweepFR += itemRot;
          }
        } catch (e) { t.frErrors++; }
      }
      if (err) throw err;
      return r;
    };
    t.frWrapped.rot.push('sweepSpoiled');
    return true;
  }

  // ROT: drawSpoiled (outer) — desperation eats spoiled stacks, often
  // partially (item.units -= u). Attribute the per-item unit delta.
  function wrapDrawSpoiledFR() {
    let orig = null;
    try { orig = Game.drawSpoiled ? Game.drawSpoiled.bind(Game) : null; } catch (e) {}
    if (!orig) { t.frWrapFailed.push('drawSpoiled'); return false; }
    Game.drawSpoiled = function (...args) {
      const outer = depth === 0;
      depth++;
      let snap = null;
      if (outer) {
        try {
          const v = pv(Game);
          snap = new Map();
          for (const it of ((v && v.pantry) || [])) {
            snap.set(it, { units: it.units || 0, ke: it.kcalEach || 0,
              spoiled: spoiledOf(it), F: it._frF, S: it._frS, U: it._frU,
              fresh: isFreshFood(it) });
          }
        } catch (e) { t.frErrors++; }
      }
      let r, err = null;
      try { r = orig.apply(this, args); } catch (e) { err = e; }
      depth--;
      if (outer && !err && snap) {
        try {
          const v2 = pv(Game);
          const afterUnits = new Map(((v2 && v2.pantry) || []).map(it => [it, it.units || 0]));
          for (const [ref, s] of snap) {
            if (!s.spoiled) continue;
            const ua = afterUnits.has(ref) ? afterUnits.get(ref) : 0;
            // Scan-parity with WR: per-item Math.round on total kcal.
            const deltaRot = Math.max(0, Math.round(s.ke * s.units) - Math.round(s.ke * ua));
            if (deltaRot <= 0) continue;
            attributeRot(deltaRot, s.F, s.S, s.U, s.fresh);
            if (s.fresh) t.rotDespFreshFR += deltaRot;
            else t.rotDespPreservedFR += deltaRot;
          }
        } catch (e) { t.frErrors++; }
      }
      if (err) throw err;
      return r;
    };
    t.frWrapped.rot.push('drawSpoiled');
    return true;
  }

  wrapSweepSpoiledFR();
  wrapDrawSpoiledFR();
  return t;
}

// snapshotStartFR: call AFTER setupGame, BEFORE the run. Tags the seed
// stock, then records S0 via WR.
function snapshotStartFR(Game, t) {
  try {
    const v = pv(Game);
    for (const it of ((v && v.pantry) || [])) {
      it._frF = 0; it._frS = (it.units || 1); it._frU = 0;
    }
  } catch (e) { t.frErrors = (t.frErrors || 0) + 1; }
  return WR.snapshotStart(Game, t);
}

// Cross-checks: the FR attribution must reconcile with the WR books.
function flowConservation(Game, t) {
  const wr = WR.conservation(Game, t);
  const rotTotal = (t.pantryRotKcal || 0) + (t.pantryRotPreservedKcal || 0) +
    (t.desperationRotKcal || 0) + (t.desperationRotPreservedKcal || 0);
  const attrSum = (t.rotFlow || 0) + (t.rotStock || 0) + (t.rotRounding || 0);
  const sweepTotal = (t.pantryRotKcal || 0) + (t.pantryRotPreservedKcal || 0);
  return {
    wr,
    rotTotal,
    attrSum,
    attrResidual: rotTotal - attrSum, // must be 0 by construction
    sweepParity: (t.rotSweepFR || 0) - sweepTotal, // FR scan vs WR scan
    despFreshParity: (t.rotDespFreshFR || 0) - (t.desperationRotKcal || 0),
    despPreservedParity: (t.rotDespPreservedFR || 0) - (t.desperationRotPreservedKcal || 0),
    dayAttrParity: (t.inflowDayAttributed || 0) - (t.pantryInKcal || 0),
    roundingShare: rotTotal > 0 ? (t.rotRounding || 0) / rotTotal : 0,
  };
}

function rotTotalOf(t) {
  return (t.pantryRotKcal || 0) + (t.pantryRotPreservedKcal || 0) +
    (t.desperationRotKcal || 0) + (t.desperationRotPreservedKcal || 0);
}

module.exports = { attachFlowRate, snapshotStartFR, flowConservation, rotTotalOf,
  INFLOW: WR.INFLOW, OUTFLOW_DELTA: WR.OUTFLOW_DELTA };
