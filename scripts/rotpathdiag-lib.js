#!/usr/bin/env node
// rotpathdiag-lib.js — INSTRUMENT-ONLY diagnostic library (loop B, arm sim-rotpathdiag-b).
//
// Root-cause instrument for sim-retagrot-b4's open questions:
//   (a) what in the Game.stockPantry path rots faster than the engine's
//       stockSurplus path (cap binding? piece size? pantry draw order?
//       dawn-sweep behavior?)
//   (b) why the retagrot benefit concentrates where the crisis-bypass binds.
//
// Design: call-path attribution at the pantry choke points. Every wrap calls
// through to the original and only counts — ZERO src/js changes, ZERO behavior
// change (pinned by scripts/test-rotpathdiag-b.js DET: instrumented vs
// pristine byte-identical). New pantry items are identity-tagged with _diagP
// (a field stacksMatch ignores — same precedent as the glutprobe _diagCh
// tags, proven det-safe); the dawn sweep attributes rot by that tag.
//
// Paths: 'SP' (Game.stockPantry), 'SS' (engine stockSurplus), 'DPP'
// (depositPantryPieces), 'INIT' (pantry stock present at attach), 'UN'
// (untagged — written through a path this instrument does not wrap).
//
// Sensors:
//   - choke recorders: inflow kcal + piece-size histograms per path.
//   - SS: crisis flag per write (pantryKcal < 5000 — the engine's own crisis
//     condition, read-only), cap-room, refused kcal (give - stored).
//   - SP: over-cap writes (pantryKcal >= cap at write — stockPantry has NO cap
//     check, unlike stockSurplus/pantryAdd).
//   - merge-mix: kcal merging into a stack tagged with a DIFFERENT path
//     (tag inheritance dilutes path attribution; measured, not assumed).
//   - sweepSpoiled: identity-deduped rot by path, by name, days-in-pantry at
//     rot, fast-rot (<=3d, fresh only — the retagrot primary definition).
//   - pantryDraw: drawn kcal + mean days-to-spoil at draw (the draw order is
//     FRESH-FIRST in code — no DRAWCOARSE exists; verified by grep).
//   - sleep (dawn sensor): pantryKcal, cap, over-cap kcal, freshDays, doomedKcal.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 (SURPLUSFEED unset) node <driver>
// See scripts/test-rotpathdiag-b.js (proof) and scripts/sweep-rotpathdiag-b.js.
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function vPantryKcal(Game) {
  try { return (((Game.state || {}).village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; }
}
function vCap(Game) { try { return Game.pantryCapKcal ? Game.pantryCapKcal() : 120000; } catch (e) { return 120000; } }

const PIECE_BUCKETS = ['le100', '101_200', '201_300', '301_400', '401_500', 'gt500'];
function pieceBucket(pk) {
  pk = Math.round(pk || 0);
  if (pk <= 100) return 'le100';
  if (pk <= 200) return '101_200';
  if (pk <= 300) return '201_300';
  if (pk <= 400) return '301_400';
  if (pk <= 500) return '401_500';
  return 'gt500';
}

function attachRotPathDiag(Game) {
  const W = {
    inflow: { SP: 0, SS: 0, DPP: 0 },       // kcal actually entering per path
    writes: { SP: 0, SS: 0, DPP: 0 },       // write call counts per path
    pieceHist: { SP: {}, SS: {}, DPP: {} }, // piece-size kcal histograms
    // SS sensors
    ssGive: 0, ssStored: 0, ssRefused: 0, ssRefusalEvents: 0,
    ssCrisisKcal: 0, ssNonCrisisKcal: 0,     // give split by crisis flag
    // SP sensors
    spOverCapKcal: 0, spOverCapEvents: 0,   // kcal written while pantry >= cap
    spNormalKcal: 0,
    // merge-mix: kcal merged into a stack carrying a different path tag
    mergeMixKcal: 0,
    // rot attribution (rotByPathFastSub holds the crisis/overcap sub-buckets
    // separately so summing rotByPathFast never double-counts)
    rotByPath: {}, rotByPathFast: {}, rotByPathFastSub: {}, rotByName: {},
    rotLagSum: {}, rotLagN: {},              // days-in-pantry at rot, per path
    untaggedRotKcal: 0, untaggedRotN: 0,
    // draw sensor
    drawKcal: 0, drawDays: 0,
    drawUrgKcalSum: 0, drawUrgKcal: 0,       // sum((spoilDay-day)*kcal), kcal
    // dawn sensor
    dawnSamples: [],
  };
  const rotCounted = new Set();

  const bumpHist = (path, pk, kcal) => {
    const b = pieceBucket(pk);
    W.pieceHist[path][b] = (W.pieceHist[path][b] || 0) + kcal;
  };
  const snapPantry = () => {
    // Map(item -> units) + Set, for new-item detection and merge-mix.
    const m = new Map();
    try { for (const it of (((Game.state || {}).village || {}).pantry) || []) if (it) m.set(it, it.units || 0); } catch (e) {}
    return m;
  };
  const tagNew = (before, tag) => {
    try {
      for (const it of (((Game.state || {}).village || {}).pantry) || []) {
        if (it && !before.has(it) && !('_diagP' in it)) it._diagP = tag;
      }
    } catch (e) {}
  };
  const detectMergeMix = (before, path, kcalEachOf) => {
    // units that grew on a pre-existing stack whose tag names another path
    try {
      for (const [it, u0] of before) {
        const u1 = it.units || 0;
        if (u1 > u0) {
          const tp = it._diagP && it._diagP.p;
          if (tp && tp !== path) W.mergeMixKcal += Math.round((u1 - u0) * kcalEachOf(it));
        }
      }
    } catch (e) {}
  };

  // INIT tagging: pantry stock present at attach (village staples etc.)
  try {
    for (const it of (((Game.state || {}).village || {}).pantry) || []) {
      if (it && !('_diagP' in it)) it._diagP = { p: 'INIT', arr: 0 };
    }
  } catch (e) {}

  // --- choke 1: Game.stockPantry (the re-tag's path; NO cap check in engine) ---
  {
    const o = Game.stockPantry;
    if (typeof o === 'function') Game.stockPantry = function (kcal, name, opts) {
      const day = dayOf(Game);
      const pkBefore = vPantryKcal(Game), cap = vCap(Game);
      const overCap = pkBefore >= cap;
      const pieceMax = Math.max(1, Math.round(((opts || {}).pieceKcal) || 500));
      const before = snapPantry();
      const r = o.apply(this, arguments);
      try {
        const k = Math.round(Number(kcal) || 0);
        if (k > 0) {
          W.inflow.SP += k; W.writes.SP++;
          if (overCap) { W.spOverCapKcal += k; W.spOverCapEvents++; }
          else W.spNormalKcal += k;
          // reconstruct the piece multiset: full pieceMax pieces + remainder
          let rem = k, nFull = 0;
          while (rem > pieceMax) { rem -= pieceMax; nFull++; }
          for (let i = 0; i < nFull; i++) bumpHist('SP', pieceMax, pieceMax);
          if (rem > 0) bumpHist('SP', rem, rem);
          tagNew(before, { p: 'SP', arr: day, oc: overCap ? 1 : 0, pk: pieceMax });
          detectMergeMix(before, 'SP', (it) => it.kcalEach || 0);
        }
      } catch (e) {}
      return r;
    };
  }

  // --- choke 2: engine stockSurplus (cap-bound; crisis flag sensed read-only) ---
  {
    const o = Game.stockSurplus;
    if (typeof o === 'function') Game.stockSurplus = function (v, give) {
      const day = dayOf(Game);
      const pkBefore = vPantryKcal(Game), cap = vCap(Game);
      const crisis = pkBefore < 5000; // the engine's own crisis condition
      const before = snapPantry();
      let stored = 0;
      try { stored = o.apply(this, arguments) || 0; } catch (e) { stored = 0; }
      try {
        const g = Math.round(Number(give) || 0);
        const s = Math.round(Number(stored) || 0);
        if (g > 0) {
          W.inflow.SS += s; W.writes.SS++;
          W.ssGive += g; W.ssStored += s;
          const refused = Math.max(0, g - s);
          if (refused > 0) { W.ssRefused += refused; W.ssRefusalEvents++; }
          if (crisis) W.ssCrisisKcal += g; else W.ssNonCrisisKcal += g;
          // 200-kcal units (engine constant)
          const units = Math.floor(s / 200);
          for (let i = 0; i < units; i++) bumpHist('SS', 200, 200);
          const urem = s - units * 200;
          if (urem > 0) bumpHist('SS', urem, urem);
          tagNew(before, { p: 'SS', arr: day, cr: crisis ? 1 : 0 });
          detectMergeMix(before, 'SS', () => 200);
        }
      } catch (e) {}
      return stored;
    };
  }

  // --- choke 3: depositPantryPieces (donations, tribute, take conversions) ---
  {
    const o = Game.depositPantryPieces;
    if (typeof o === 'function') Game.depositPantryPieces = function (v, src, pieceKcal) {
      const day = dayOf(Game);
      const before = snapPantry();
      let dep = 0;
      try { dep = o.apply(this, arguments) || 0; } catch (e) { dep = 0; }
      try {
        const k = Math.round(Number(dep) || 0);
        if (k > 0) {
          W.inflow.DPP += k; W.writes.DPP++;
          const cap = Math.max(1, Math.round(pieceKcal || 500));
          bumpHist('DPP', cap, k); // cap-labeled (actual pieces vary by src)
          tagNew(before, { p: 'DPP', arr: day });
          detectMergeMix(before, 'DPP', (it) => it.kcalEach || 0);
        }
      } catch (e) {}
      return dep;
    };
  }

  // --- other fresh writers (9-21d clocks; never fast-rot, tagged for completeness) ---
  // Each wrap snapshots the pantry, calls through, and tags only NEW items.
  // Inner choke tags land first (they run inside these methods), so SP/SS/DPP
  // attribution is never stolen by the outer tag.
  for (const method of ['tradeTick', 'drawLeaguePool', 'answerRaid',
                        'answerSuccession', 'awayPartiesReturnTick', '_cxWinnerShare']) {
    const o = Game[method];
    if (typeof o === 'function') Game[method] = function () {
      const day = dayOf(Game);
      const before = snapPantry();
      const r = o.apply(this, arguments);
      try { tagNew(before, { p: 'OTHER', arr: day }); } catch (e) {}
      return r;
    };
  }

  // --- rot attribution: the dawn sweep, identity-deduped, by arrival tag ---
  {
    const o = Game.sweepSpoiled;
    if (typeof o === 'function') Game.sweepSpoiled = function () {
      const rotDay = dayOf(Game);
      try {
        for (const it of (((Game.state.village || {}).pantry) || [])) {
          if (it && !it.bonded && !rotCounted.has(it) && Game.isSpoiled && Game.isSpoiled(it)) {
            rotCounted.add(it);
            const k = Math.round((it.kcalEach || 0) * (it.units || 1));
            const fresh = !(it.foodState === 'preserved' || it.foodState === 'rendered');
            if (!fresh || k <= 0) continue;
            const nm = String(it.name || '?').slice(0, 40);
            W.rotByName[nm] = (W.rotByName[nm] || 0) + k;
            const tag = it._diagP;
            if (tag && tag.p) {
              const p = tag.p;
              W.rotByPath[p] = (W.rotByPath[p] || 0) + k;
              const lag = rotDay - (typeof tag.arr === 'number' ? tag.arr : rotDay);
              W.rotLagSum[p] = (W.rotLagSum[p] || 0) + lag * k;
              W.rotLagN[p] = (W.rotLagN[p] || 0) + k;
              if (lag <= 3) {
                W.rotByPathFast[p] = (W.rotByPathFast[p] || 0) + k;
                // sub-buckets answering (a) and (b) — separate object, no double-count
                if (p === 'SS') {
                  const ck = tag.cr ? 'SS:crisis' : 'SS:noncrisis';
                  W.rotByPathFastSub[ck] = (W.rotByPathFastSub[ck] || 0) + k;
                }
                if (p === 'SP') {
                  const ok = tag.oc ? 'SP:overcap' : 'SP:normal';
                  W.rotByPathFastSub[ok] = (W.rotByPathFastSub[ok] || 0) + k;
                }
              }
            } else {
              W.untaggedRotKcal += k; W.untaggedRotN++;
            }
          }
        }
      } catch (e) {}
      return o.apply(this, arguments);
    };
  }

  // --- draw sensor: what the fresh-first draw actually takes ---
  {
    const o = Game.pantryDraw;
    if (typeof o === 'function') Game.pantryDraw = function (v, want, opts) {
      const day = dayOf(Game);
      const r = o.apply(this, arguments);
      try {
        const taken = Math.round((r && r.taken) || 0);
        if (taken > 0) {
          W.drawKcal += taken; W.drawDays++;
          let urgSum = 0, urgK = 0;
          for (const d of ((r && r.items) || [])) {
            const it = d && d.item;
            if (!it) continue;
            const kk = Math.round((d.units || 0) * (d.effectiveKcal || it.kcalEach || 0));
            const urg = (Number(it.spoilDay) || day) - day;
            urgSum += urg * kk; urgK += kk;
          }
          W.drawUrgKcalSum += urgSum; W.drawUrgKcal += urgK;
        }
      } catch (e) {}
      return r;
    };
  }

  // --- dawn sensor: what the day's economy sees (after sleep rolls the day) ---
  {
    const o = Game.sleep;
    if (typeof o === 'function') Game.sleep = function () {
      const r = o.apply(this, arguments);
      try {
        const vv = (Game.state || {}).village || {};
        const day = dayOf(Game);
        const pk = vPantryKcal(Game), cap = vCap(Game);
        let freshDays = 0, doomedKcal = 0;
        try { freshDays = Game.pantryFreshDays ? Game.pantryFreshDays() : 0; } catch (e) {}
        try {
          for (const it of (vv.pantry || [])) {
            if (!it) continue;
            if (it.foodState === 'preserved' || it.foodState === 'rendered' || (it.foodKind || '') === 'pemmican') continue;
            try { if (Game.isSpoiled && Game.isSpoiled(it)) continue; } catch (e2) {}
            const effSpoil = (Number(it.spoilDay) || 0) + (Number(it.granaryDays) || 0);
            if (effSpoil === day + 1) doomedKcal += Math.round((it.kcalEach || 0) * (it.units || 1));
          }
        } catch (e) {}
        W.dawnSamples.push({
          day, pantryKcal: Math.round(pk), cap: Math.round(cap),
          overCapKcal: Math.round(Math.max(0, pk - cap)),
          freshDays: +Number(freshDays).toFixed(3),
          doomedKcal: Math.round(doomedKcal),
        });
      } catch (e) {}
      return r;
    };
  }

  return W;
}

module.exports = { attachRotPathDiag, dayOf, vPantryKcal, vCap };
