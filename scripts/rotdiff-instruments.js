#!/usr/bin/env node
// rotdiff-instruments.js — read-only path-attribution instruments for the
// sim-rotdiff-b diagnostic (fleshout-loop-b-20261020T2235Z, axis food-economy).
//
// Filed question (sim-retagrot-b4 kill): on lead-type trajectories the re-tag
// appeared to INCREASE fast-rot (lead 1.32x vs belong 0.55x pooled split).
// The diagnostic question: what in the ENGINE's stockPantry path rots faster
// than the engine's stockSurplus path — cap binding? piece size? draw order?
// Something else?
//
// Three call sites are wrapped (never changed):
//   Game.stockPantry  -> per-item path-kcal mix _rdK.p, descriptive tags
//                       (_rdArr, _rdClock, _rdOverCap, _rdPiece), write ctx
//   Game.stockSurplus -> per-item path-kcal mix _rdK.s, tags, cap sensors
//   Game.sweepSpoiled -> attributes rotted pantry kcal by path + mechanism
//                       class (cascade below), identity-deduped
//   Game.pantryDraw   -> per-item draw counters + first-draw lag by cohort
//                       (draw-order evidence for the fresh-first question)
//   Game.drawSpoiled  -> desperation eating attributed by path (eaten, not rot)
//
// Per-item path-kcal mix (_rdK = {p, s}) is EXACT, not approximate:
// cross-path merges are impossible (kg differs: a stockPantry 200-kcal piece
// has kg 0.05, a stockSurplus 200-kcal unit has kg 0.2 — stacksMatch compares
// kg), and within-path merges are homogeneous (stacksMatch requires equal
// name, kcalEach, spoilDay, kg — so merged units share clock and piece size).
// Same-day multi-villager surplus merges are handled via before/after unit
// deltas. Untracked remainder (starting staples, depositPantryPieces, ...) =
// 'other' path.
//
// Mechanism cascade (each rotted kcal lands in exactly one class):
//   surplus path : 'surplus-3d'      (always 3-day clock, 200-kcal units)
//   pantry path  : 'pantry-cap'      (written while pantryKcal >= cap — the
//                                     surplus door would have REFUSED it)
//                > 'pantry-clock6'   (clock > 3d: granary bonus extends the
//                                     clock; the surplus path never gets it)
//                > 'pantry-coarse'   (piece kcalEach > 200: coarser than
//                                     surplus units; fresh-first best-fit
//                                     draws finer pieces first in-class)
//                > 'pantry-base'     (3-day, <=200 kcal pieces — same shape
//                                     as surplus; rot here is saturation)
//   other writers: 'other-path'      (starting staples, depositPantryPieces,
//                                     pantryAdd, feast returns — named,
//                                     reported separately)
//
// RNG-clean by construction: tags are extra fields that stacksMatch never
// reads (it compares a fixed field list); wraps call through to the original
// and draw no RNG. Proven by scripts/test-rotdiff-instruments.js (digest
// comparison with/without instruments on identical seeds).
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function pantryOf(Game) { try { return (((Game.state || {}).village || {}).pantry) || null; } catch (e) { return null; } }
function itemKcal(it) { return (it.kcalEach || 0) * (it.units || 0); }
const bump = (o, k, v) => { o[k] = (o[k] || 0) + v; };

// ensure _rdK exists; returns it
function mixOf(it) {
  if (!it._rdK) it._rdK = { p: 0, s: 0 };
  return it._rdK;
}
// split an item's kcal into {p, s, o} by the path mix (pro-rata; exact for
// homogeneous items, which is every item the wrappers create or merge into)
function splitByPath(it) {
  const k = itemKcal(it);
  if (k <= 0) return { p: 0, s: 0, o: 0 };
  const m = it._rdK || { p: 0, s: 0 };
  const p = Math.min(k, Math.max(0, m.p || 0));
  const s = Math.min(k - p, Math.max(0, m.s || 0));
  return { p, s, o: Math.max(0, k - p - s) };
}

// attachRotDiff(Game) -> W. Applies all wraps; returns the collector.
function attachRotDiff(Game) {
  const W = {
    // inflow by path
    writePantryKcal: 0, writeSurplusKcal: 0,
    writePantryCalls: 0, writeSurplusCalls: 0,
    writeNames: {},          // stockPantry name -> kcal
    clockMix: {},            // 'pantry|3' / 'pantry|6' / 'surplus|3' -> kcal
    // rot attribution
    rotClass: {},            // mechanism class -> rotted kcal
    rotPath: { pantry: 0, surplus: 0, other: 0 },
    rotDrawsByClass: {},     // class -> {n, drawsSum, satSum(days)}
    unclassifiedRot: 0,      // must stay 0 (0 unexplained mechanism classes)
    desperationByPath: { pantry: 0, surplus: 0, other: 0 }, // drawSpoiled: eaten
    // cap sensors
    capRefuseN: 0, capRefuseKcal: 0,        // stockSurplus refused at cap
    capTruncateKcal: 0,                    // stockSurplus partially truncated
    overCapWriteN: 0, overCapWriteKcal: 0, // stockPantry wrote while over cap
    dayRefMismatch: 0,                     // scholar.day != v.day at write
    // draw-order sensors
    drawCalls: 0,
    drawnKcalByPath: { pantry: 0, surplus: 0, other: 0 },
    firstDrawLag: {},        // 'pantry|6' etc -> {n, lagSum}
  };

  function tagNew(it, path, d, clockLen, overCap, piece) {
    if ('_rdPath' in it) return;
    it._rdPath = path;
    it._rdArr = d;
    it._rdClock = clockLen;
    it._rdOverCap = overCap ? 1 : 0;
    it._rdPiece = piece;
  }

  // ---- stockPantry wrap ----
  const oStock = Game.stockPantry;
  if (typeof oStock === 'function') Game.stockPantry = function (kcal, name, opts) {
    const d = dayOf(Game);
    let before = null;
    try {
      before = new Map();
      for (const it of (pantryOf(Game) || [])) if (it) before.set(it, it.units || 0);
    } catch (e) {}
    let cap = Infinity, pk = 0;
    try { cap = Game.pantryCapKcal(); pk = Game.pantryKcal(); } catch (e) {}
    const overCap = pk >= cap;
    let sgb = 0;
    try { sgb = Game.granarySpoilBonus ? Game.granarySpoilBonus() : 0; } catch (e) {}
    const clockLen = 3 + (sgb || 0);
    let r;
    try { r = oStock.apply(this, arguments); } catch (e) { r = undefined; }
    try {
      if (typeof kcal === 'number' && kcal > 0) {
        const wk = Math.round(kcal);
        W.writePantryCalls++;
        W.writePantryKcal += wk;
        bump(W.writeNames, String(name || 'Foraged food'), wk);
        bump(W.clockMix, 'pantry|' + clockLen, wk);
        if (overCap) { W.overCapWriteN++; W.overCapWriteKcal += wk; }
        for (const it of (pantryOf(Game) || [])) {
          if (!it) continue;
          const k = itemKcal(it);
          if (!before.has(it)) {
            // brand-new item from this write
            mixOf(it).p += k;
            tagNew(it, 'pantry', d, clockLen, overCap, it.kcalEach || 0);
          } else {
            // merged units: attribute the unit delta
            const delta = Math.max(0, (it.units || 0) - (before.get(it) || 0)) * (it.kcalEach || 0);
            if (delta > 0) {
              mixOf(it).p += delta;
              tagNew(it, 'pantry', d, clockLen, overCap, it.kcalEach || 0);
            }
          }
        }
      }
    } catch (e) {}
    return r;
  };

  // ---- stockSurplus wrap ----
  const oSur = Game.stockSurplus;
  if (typeof oSur === 'function') Game.stockSurplus = function (v, give) {
    const d = dayOf(Game);
    let before = null;
    try {
      before = new Map();
      for (const it of ((((this.state || {}).village || {}).pantry) || [])) if (it) before.set(it, it.units || 0);
    } catch (e) {}
    let room = Infinity, remBefore = 0;
    try {
      const vv = (this.state || {}).village || {};
      room = Game.pantryCapKcal() - Game.pantryKcal();
      remBefore = Number(vv._surplusRemainder) || 0;
    } catch (e) {}
    try {
      const vd = (v && v.day) || 0;
      if (vd && d && vd !== d) W.dayRefMismatch++;
    } catch (e) {}
    const expUnits = Math.floor((remBefore + (Number(give) || 0)) / 200);
    let r = 0;
    try { r = oSur.apply(this, arguments); } catch (e) { r = 0; }
    try {
      if ((Number(give) || 0) > 0) {
        W.writeSurplusCalls++;
        if (room <= 0) { W.capRefuseN++; W.capRefuseKcal += Math.round(Number(give)); }
        else if (typeof r === 'number' && r > 0 && expUnits > 0) {
          const trunc = Math.max(0, expUnits * 200 - r);
          if (trunc > 0) W.capTruncateKcal += trunc;
        }
        if (typeof r === 'number' && r > 0) {
          W.writeSurplusKcal += Math.round(r);
          bump(W.clockMix, 'surplus|3', Math.round(r));
          for (const it of ((((this.state || {}).village || {}).pantry) || [])) {
            if (!it) continue;
            const k = itemKcal(it);
            if (!before.has(it)) {
              mixOf(it).s += k;
              tagNew(it, 'surplus', d, 3, false, 200);
            } else {
              const delta = Math.max(0, (it.units || 0) - (before.get(it) || 0)) * (it.kcalEach || 0);
              if (delta > 0) {
                mixOf(it).s += delta;
                tagNew(it, 'surplus', d, 3, false, 200);
              }
            }
          }
        }
      }
    } catch (e) {}
    return r;
  };

  // cascade: one mechanism class for a pantry-path rotted kcal
  function pantryClass(it) {
    if (it._rdOverCap) return 'pantry-cap';
    if ((it._rdClock || 3) > 3) return 'pantry-clock6';
    if ((it._rdPiece || 0) > 200) return 'pantry-coarse';
    return 'pantry-base';
  }

  // ---- sweepSpoiled wrap: attribute rotted kcal ----
  const rotCounted = new Set();
  const oSweep = Game.sweepSpoiled;
  if (typeof oSweep === 'function') Game.sweepSpoiled = function () {
    const rotDay = dayOf(Game);
    try {
      for (const it of (pantryOf(Game) || [])) {
        if (!it || it.bonded || rotCounted.has(it)) continue;
        let spoiled = false;
        try { spoiled = !!(Game.isSpoiled && Game.isSpoiled(it)); } catch (e) {}
        if (!spoiled) continue;
        rotCounted.add(it);
        const k = itemKcal(it);
        if (k <= 0) continue;
        const sp = splitByPath(it);
        W.rotPath.pantry += sp.p; W.rotPath.surplus += sp.s; W.rotPath.other += sp.o;
        const draws = it._rdDraws || 0;
        const arr = (typeof it._rdArr === 'number') ? it._rdArr : rotDay;
        const rec = (cls, kk) => {
          if (kk <= 0) return;
          bump(W.rotClass, cls, kk);
          const cell = W.rotDrawsByClass[cls] || (W.rotDrawsByClass[cls] = { n: 0, drawsSum: 0, satSum: 0 });
          cell.n++; cell.drawsSum += draws; cell.satSum += Math.max(0, rotDay - arr);
        };
        rec(pantryClass(it), sp.p);
        rec('surplus-3d', sp.s);
        rec('other-path', sp.o);
      }
    } catch (e) {}
    return oSweep.apply(this, arguments);
  };

  // ---- drawSpoiled wrap: desperation eating (eaten, not rotted) ----
  const oDrawSp = Game.drawSpoiled;
  if (typeof oDrawSp === 'function') Game.drawSpoiled = function (v, want, exposure) {
    let before = null;
    try {
      before = new Map();
      for (const it of ((v && v.pantry) || [])) if (it) before.set(it, { units: it.units || 0, ke: it.kcalEach || 0, sp: splitByPath(it) });
    } catch (e) {}
    const r = oDrawSp.apply(this, arguments);
    try {
      const after = new Map();
      for (const it of ((v && v.pantry) || [])) if (it) after.set(it, it.units || 0);
      for (const [it, b] of (before || new Map())) {
        const lost = Math.max(0, b.units - (after.has(it) ? after.get(it) : 0));
        if (lost > 0) {
          const lk = lost * b.ke;
          const tot = itemKcal({ kcalEach: b.ke, units: b.units }) || 1;
          W.desperationByPath.pantry += lk * (b.sp.p / tot);
          W.desperationByPath.surplus += lk * (b.sp.s / tot);
          W.desperationByPath.other += lk * (b.sp.o / tot);
        }
      }
    } catch (e) {}
    return r;
  };

  // ---- pantryDraw wrap: draw counters + first-draw lag by cohort ----
  const oDraw = Game.pantryDraw;
  if (typeof oDraw === 'function') Game.pantryDraw = function (v, want, opts) {
    const d = dayOf(Game);
    let r;
    try { r = oDraw.apply(this, arguments); } catch (e) { r = { taken: 0, items: [] }; }
    try {
      W.drawCalls++;
      for (const e of (r.items || [])) {
        const it = e && e.item;
        if (!it) continue;
        it._rdDraws = (it._rdDraws || 0) + 1;
        const sp = splitByPath(it);
        const k = (e.units || 0) * (e.effectiveKcal || it.kcalEach || 0);
        const tot = (sp.p + sp.s + sp.o) || 1;
        W.drawnKcalByPath.pantry += k * (sp.p / tot);
        W.drawnKcalByPath.surplus += k * (sp.s / tot);
        W.drawnKcalByPath.other += k * (sp.o / tot);
        if (it._rdFirstDraw == null && typeof it._rdArr === 'number') {
          it._rdFirstDraw = d;
          const ch = (it._rdPath === 'pantry') ? 'pantry|' + (it._rdClock || '?') : (it._rdPath || 'other');
          const cell = W.firstDrawLag[ch] || (W.firstDrawLag[ch] = { n: 0, lagSum: 0 });
          cell.n++; cell.lagSum += Math.max(0, d - it._rdArr);
        }
      }
    } catch (e) {}
    return r;
  };

  return W;
}

// summarize(W) -> plain JSON-friendly rollup for the sweep output.
function summarize(W) {
  const round1 = (o) => { const r = {}; for (const k of Object.keys(o || {})) r[k] = Math.round(o[k]); return r; };
  const lag = {};
  for (const k of Object.keys(W.firstDrawLag || {})) {
    const c = W.firstDrawLag[k];
    lag[k] = { n: c.n, meanLagDays: c.n ? +(c.lagSum / c.n).toFixed(2) : 0 };
  }
  const rotDraws = {};
  for (const k of Object.keys(W.rotDrawsByClass || {})) {
    const c = W.rotDrawsByClass[k];
    rotDraws[k] = {
      n: c.n,
      meanDraws: c.n ? +(c.drawsSum / c.n).toFixed(2) : 0,
      meanSatDays: c.n ? +(c.satSum / c.n).toFixed(2) : 0,
    };
  }
  return {
    writePantryKcal: Math.round(W.writePantryKcal),
    writeSurplusKcal: Math.round(W.writeSurplusKcal),
    writePantryCalls: W.writePantryCalls,
    writeSurplusCalls: W.writeSurplusCalls,
    writeNames: round1(W.writeNames),
    clockMix: round1(W.clockMix),
    rotClass: round1(W.rotClass),
    rotPath: round1(W.rotPath),
    rotDrawsByClass: rotDraws,
    unclassifiedRot: Math.round(W.unclassifiedRot),
    desperationByPath: round1(W.desperationByPath),
    capRefuseN: W.capRefuseN,
    capRefuseKcal: Math.round(W.capRefuseKcal),
    capTruncateKcal: Math.round(W.capTruncateKcal),
    overCapWriteN: W.overCapWriteN,
    overCapWriteKcal: Math.round(W.overCapWriteKcal),
    dayRefMismatch: W.dayRefMismatch,
    drawCalls: W.drawCalls,
    drawnKcalByPath: round1(W.drawnKcalByPath),
    firstDrawLag: lag,
  };
}

module.exports = { attachRotDiff, summarize, dayOf, splitByPath };
