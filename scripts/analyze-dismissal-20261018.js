#!/usr/bin/env node
// analyze-dismissal-20261018.js — the sim-dismissal b2 census classifier and
// the wave-unlock deed counterfactual replay (pure functions; no engine).
//
// B2 DISMISSAL-SHAPE UNIVERSE (binding, pre-registered): a TB fight where the
// trick PERFORMED (f.trickLogByMid non-empty for a mid) and the target FLED
// (result 'routed'|'fled', scholar alive, zero trick-bearing monster deaths,
// zero waveKillLog entries for the mid within ±1d). The trick "worked"
// (dismissal) but dismissal isn't a kill, so the channel correctly
// attributes nothing.
//
// THE COUNTERFACTUAL (the steve-call input): what if a dismissal banked a
// wave-unlock deed? Replay = scoreLedgerKill semantics (waveLedger.js LEGACY
// path — extraPerTypeCap=0 default):
//   points = counterKnownAtStart ? pointsPerCounterKill : pointsPerKill
//   add = min(points, perTypeCap - perType[wave][mid]); capped per type/wave.
// Two readings, reported separately:
//   D1: dismissal scores the kill-base only (1 pt) — "dismissal counts as a
//       deed, but mastery is for kills"
//   D2: dismissal scores with the mastery bonus when the counter was KNOWN
//       at fight start (2 pts — the trick was performed and known) —
//       "the trick did the work"
// The rung ladder mirrors unlockedWave() (game.js): w2 = day>=d2 && pts1>=
// bar1; w3 = day>=dN && pts2>=bar2; w4 = w3 && gated>=t4; w5 = w3 &&
// gated>=t5 && w4faced. Standing's war source = warPts*warPerKill with
// warPts = pts3+pts4+pts5 (dismissals are wave-1/2 only on current defs, so
// the blood source is expected unmoved — the replay VERIFIES this).
// Readiness (armored/armed/tricks/veterans) and peak ratchet are unchanged
// by deed-counting: trick discovery already fires on performance.
'use strict';

const B2_RESULTS = { routed: 1, fled: 1 };

// classifyFights(tbFights, waveKillLog): per-mid rows for every performed
// mid in every captured TB fight. The attribution join runs over the FINAL
// waveKillLog at analysis time (the funnel/attrcensus pattern): the
// instrument's pre-ledger snapshot cannot see the entries the engine writes
// inside its own tbEnd after the snapshot.
// Each row: { seq, day, mid, kind, wave, result, nPerfs, knownAtStart,
//   pAlive, mortality, hpByMid, wklEntries, cls }.
// cls in: attributed | b2-dismissal | b1-performer-died | a2-pyrrhic |
//   won-unattributed | attribution-gap | attributed-cross | other.
function classifyFights(tbFights, waveKillLog) {
  const wkl = waveKillLog || [];
  const rows = [];
  let unattributed = 0, instrumentErrors = 0;
  for (const t of (tbFights || [])) {
    if (!t.started) { instrumentErrors++; continue; }
    const mids = Array.from(new Set((t.mids || []).concat(Object.keys(t.perfs || {}))));
    for (const mid of mids) {
      const nPerfs = ((t.perfs || {})[mid]) | 0;
      if (!nPerfs) continue;
      const entries = [];
      for (const k of wkl) {
        if (k && k.mid === mid && Math.abs((k.d | 0) - (t.day | 0)) <= 1) {
          entries.push({ trick: k.trick ? 1 : 0, by: k.by || null, via: k.via || null, d: k.d | 0 });
        }
      }
      const row = {
        seq: t.seq, day: t.day, mid: mid,
        kind: (t.kindByMid || {})[mid] || null,
        wave: ((t.waveByMid || {})[mid] | 0) || 1,
        result: t.result || null,
        nPerfs: nPerfs,
        knownAtStart: ((t.knownAtStart || {})[mid] | 0) || 0,
        pAlive: (t.pAlive === true) ? 1 : (t.pAlive === false ? 0 : null),
        mortality: (t.mortality || {})[mid] || { dead: 0, alive: 0 },
        hpByMid: ((t.hpByMid || {})[mid] || []).slice(),
        wklEntries: entries,
        cls: null,
      };
      if (row.result == null || row.pAlive == null) { row.cls = 'unattributed'; unattributed++; rows.push(row); continue; }
      const wklTrick = row.wklEntries.filter(e => e && e.trick);
      if (wklTrick.length) { row.cls = 'attributed'; rows.push(row); continue; }
      const dead = row.mortality.dead | 0;
      const isDismissResult = !!B2_RESULTS[row.result];
      if (isDismissResult && dead === 0 && row.pAlive === 1) { row.cls = 'b2-dismissal'; rows.push(row); continue; }
      if (isDismissResult && dead > 0 && row.wklEntries.length === 0) { row.cls = 'attribution-gap'; rows.push(row); continue; }
      if (isDismissResult && dead > 0) { row.cls = 'attributed-cross'; rows.push(row); continue; }
      if (row.result === 'lost' && row.pAlive === 0 && dead > 0) { row.cls = 'a2-pyrrhic'; rows.push(row); continue; }
      if (row.result === 'lost' && row.pAlive === 0) { row.cls = 'b1-performer-died'; rows.push(row); continue; }
      if (row.result === 'won' && row.wklEntries.length === 0) { row.cls = 'won-unattributed'; unattributed++; rows.push(row); continue; }
      row.cls = 'other';
      rows.push(row);
    }
  }
  return { rows: rows, unattributed: unattributed, instrumentErrors: instrumentErrors };
}

// hpShape(hpByMid): the HP state at flight, per mid — { n, minPct, maxPct,
// fled }. The struck lead vs the unscathed pack.
function hpShape(entries) {
  const xs = (entries || []).filter(e => e && e.maxHp > 0);
  if (!xs.length) return { n: 0, minPct: null, maxPct: null, fled: 0 };
  const pcts = xs.map(e => e.hp / e.maxHp);
  return {
    n: xs.length,
    minPct: Math.round(Math.min.apply(null, pcts) * 100),
    maxPct: Math.round(Math.max.apply(null, pcts) * 100),
    fled: xs.filter(e => e.fled).length,
  };
}

// replayLedger(cfg, ledgerPoints, ledgerPerType, dismissals, d2):
// cfg = { pointsPerKill, pointsPerCounterKill, perTypeCap }.
// ledgerPoints = {1:n,2:n,3:n,4:n,5:n}; ledgerPerType = {wave:{mid:n}}.
// dismissals = [{mid, wave, knownAtStart, day, seq}] in any order (sorted
// here by day,seq — ledger order is fight order).
// Returns { points, perType, deeds: [{mid,wave,points,scored}] }.
function replayLedger(cfg, ledgerPoints, ledgerPerType, dismissals, d2) {
  const points = {};
  for (let w = 1; w <= 5; w++) points[w] = (ledgerPoints[w] | 0) || 0;
  const perType = {};
  for (let w = 1; w <= 5; w++) {
    perType[w] = {};
    const src = (ledgerPerType || {})[w] || {};
    for (const k of Object.keys(src)) perType[w][k] = (src[k] | 0) || 0;
  }
  const base = cfg.pointsPerKill | 0, bonus = cfg.pointsPerCounterKill | 0, cap = cfg.perTypeCap | 0;
  const order = (dismissals || []).slice().sort((a, b) => (((a.day | 0) - (b.day | 0)) || ((a.seq | 0) - (b.seq | 0))));
  const deeds = [];
  for (const d of order) {
    const wave = (d.wave | 0) || 1;
    const pts = (d2 && d.knownAtStart) ? bonus : base;
    const room = Math.max(0, cap - ((perType[wave][d.mid] | 0) || 0));
    const add = Math.min(pts, room);
    if (add > 0) {
      perType[wave][d.mid] = ((perType[wave][d.mid] | 0) || 0) + add;
      points[wave] += add;
    }
    deeds.push({ mid: d.mid, wave: wave, points: pts, scored: add });
  }
  return { points: points, perType: perType, deeds: deeds };
}

// rungsOf: the unlockedWave() rung ladder, pure. cfg =
// { barsPerWave, wave2DayFloor, dayFloor }. standingGated = the gated
// standing total; t4, t5 thresholds; w4faced boolean.
function rungsOf(cfg, day, points, standingGated, t4, t5, w4faced) {
  const bar = cfg.barsPerWave || {};
  const d2 = cfg.wave2DayFloor != null ? cfg.wave2DayFloor : 8;
  const dN = cfg.dayFloor != null ? cfg.dayFloor : 25;
  const pts = (w) => (points[w] | 0) || 0;
  const w3 = day >= dN && pts(2) >= ((bar[2] | 0) || 5);
  if (w3 && standingGated >= t5 && w4faced) return 5;
  if (w3 && standingGated >= t4) return 4;
  if (w3) return 3;
  if (day >= d2 && pts(1) >= ((bar[1] | 0) || 5)) return 2;
  return 1;
}

// counterfactual(snapshot, dismissals): snapshot =
// { day, cfg: {barsPerWave, wave2DayFloor, dayFloor, pointsPerKill,
//     pointsPerCounterKill, perTypeCap, warPerKill, t4, t5, plentyCap},
//   ledgerPoints: {1..5}, ledgerPerType: {wave:{mid:n}},
//   standing: {war, diplomacy, plenty}, gated, rd4Ready, rd5Ready, peak,
//   w4faced }.
// Returns { actualWave, d1Wave, d2Wave, d1Flips, d2Flips, details } where
// flips = per-rung boolean diffs {w2,w3,w4,w5}.
function counterfactual(snapshot, dismissals) {
  const cfg = snapshot.cfg;
  const warPerKill = cfg.warPerKill | 0;
  const t4 = cfg.t4 | 0, t5 = cfg.t5 | 0;
  const actualWave = rungsOf(cfg, snapshot.day, snapshot.ledgerPoints, snapshot.gated, t4, t5, !!snapshot.w4faced);

  function gatedWith(points) {
    // War source re-feeds from the counterfactual ledger; diplomacy/plenty
    // unchanged by deed-counting. Holds recomputed (readiness unchanged).
    const warPts = ((points[3] | 0) || 0) + ((points[4] | 0) || 0) + ((points[5] | 0) || 0);
    const war = warPts * warPerKill;
    const raw = war + ((snapshot.standing.diplomacy | 0) || 0) + ((snapshot.standing.plenty | 0) || 0);
    const cap = cfg.plentyCapT5 | 0 || 100;
    const capped = war + ((snapshot.standing.diplomacy | 0) || 0) + Math.min((snapshot.standing.plenty | 0) || 0, cap);
    const holds = [];
    const peak = snapshot.peak | 0;
    if (raw >= t5 && capped < t5 && peak < 5) holds.push(t5 - 1);
    if (raw >= t4 && !snapshot.rd4Ready && peak < 4) holds.push(t4 - 1);
    if (capped >= t5 && !snapshot.rd5Ready && peak < 5) holds.push(t5 - 1);
    let gated = raw;
    for (const b of holds) if (b < gated) gated = b;
    return { gated: gated, war: war, raw: raw };
  }

  function flipsFor(d2) {
    const replay = replayLedger(
      { pointsPerKill: cfg.pointsPerKill, pointsPerCounterKill: cfg.pointsPerCounterKill, perTypeCap: cfg.perTypeCap },
      snapshot.ledgerPoints, snapshot.ledgerPerType, dismissals, d2);
    const g = gatedWith(replay.points);
    const w = rungsOf(cfg, snapshot.day, replay.points, g.gated, t4, t5, !!snapshot.w4faced);
    const rungAt = (wave) => {
      const bar = cfg.barsPerWave || {};
      const d2f = cfg.wave2DayFloor != null ? cfg.wave2DayFloor : 8;
      const dNf = cfg.dayFloor != null ? cfg.dayFloor : 25;
      const pts = (x) => (replay.points[x] | 0) || 0;
      const apts = (x) => (snapshot.ledgerPoints[x] | 0) || 0;
      switch (wave) {
        case 2: return { cf: snapshot.day >= d2f && pts(1) >= ((bar[1] | 0) || 5), act: snapshot.day >= d2f && apts(1) >= ((bar[1] | 0) || 5) };
        case 3: return { cf: snapshot.day >= dNf && pts(2) >= ((bar[2] | 0) || 5), act: snapshot.day >= dNf && apts(2) >= ((bar[2] | 0) || 5) };
        default: return { cf: false, act: false };
      }
    };
    const r2 = rungAt(2), r3 = rungAt(3);
    const ag = snapshot.gated | 0;
    return {
      wave: w,
      deeds: replay.deeds,
      deedPoints: replay.deeds.reduce((s, d) => s + d.scored, 0),
      rungs: {
        w2: { flipped: r2.cf && !r2.act }, w3: { flipped: r3.cf && !r3.act },
        w4: { flipped: w >= 4 && actualWave < 4 }, w5: { flipped: w >= 5 && actualWave < 5 },
      },
      gated: g.gated, war: g.war,
    };
  }

  const d1 = flipsFor(false), d2r = flipsFor(true);
  return {
    actualWave: actualWave,
    d1Wave: d1.wave, d2Wave: d2r.wave,
    d1: d1, d2: d2r,
  };
}

module.exports = {
  classifyFights: classifyFights,
  hpShape: hpShape,
  replayLedger: replayLedger,
  rungsOf: rungsOf,
  counterfactual: counterfactual,
};
