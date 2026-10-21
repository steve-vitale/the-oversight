#!/usr/bin/env node
// w5gates-lib.js — wave-5 unlock GATE DECOMPOSITION instrument (flesh-out
// loop arm sim-w5gates, run fleshout-20261021T0146Z, axis scale-onramp).
//
// INSTRUMENT-ONLY DIAGNOSTIC: zero src/js changes, zero scripts/policies
// changes. PURE engine reads — the only engine call with write side
// effects is villageStandingTotal() (fires the idempotent hold/release
// beats and records the one-way peak), which the game itself calls during
// play; the DET gate in the sweep pins instrument-on vs instrument-off
// byte-identical trajectories.
//
// GATE DECOMPOSITION (the code is authoritative — src/js/game.js
// unlockedWave @ 30670, src/js/standing.js villageStandingTotal @ 171,
// waveCombatReadiness @ 209, waveUnlockReady @ 325, standingDeferral @ 377):
//
//   unlockedWave() == 5  IFF  w3rung AND gatedTotal >= t5(200) AND w4faced > 0
//     w3rung:      day >= 25 AND waveLedgerPoints(2) >= 4
//     gatedTotal:  min(raw, holds) where holds are
//                   - plenty-cap: raw >= 200 && capped < 200 && peak < 5 -> 199
//                   - defer4:     raw >= 100 && !rd4.ready && peak < 4  -> 99
//                   - defer5:     capped >= 200 && !rd5.ready && peak < 5 -> 199
//                   plus the monotonic peak ratchet (peak floors the total)
//     w4faced:     waveEngaged(4) > 0 (deedState().wavesFaced, blow-by-blow;
//                   fleeing counts)
//   readiness demands (standingCfg().readyDemand, recalibrated 2026-10-18):
//     wave 4: 3 armored @P>=10, 5 armed, 3 tricks, 1 veteran (wave-3+ killer)
//     wave 5: 4 armored @P>=15, 6 armed, 3 tricks, 2 veterans (wave-4+ killers)
//
// Exports:
//   gateVector(G) — full end-of-run gate vector: each gate's state +
//     distance-to-met + attribution. PURE-ish (see beat caveat above).
//   dailyGateTrace(G) — the compact daily record (for the sweep's trace).
//   attribute(v) — PURE: attributes a gate vector's unlock outcome to gate
//     states. Unit-testable without a harness.
//   GATE_DEFS — the component table (ids, code refs).
'use strict';

const T5_DEFAULT = 200, T4_DEFAULT = 100;

const GATE_DEFS = [
  { id: 'w3rung',    name: 'wave-3 rung (day 25 + 4 wave-2 ledger pts)', ref: 'src/js/game.js:30687 unlockedWave()' },
  { id: 'stand-raw', name: 'standing raw total >= t5 (200)',            ref: 'src/js/standing.js:171 villageStandingTotal()' },
  { id: 'plenty-cap',name: 'plenty cap: bread <= 100 toward t5',        ref: 'src/js/standing.js:171 (hold kind=cap)' },
  { id: 'defer4',    name: 'wave-4 readiness deferral (t4-1 hold)',      ref: 'src/js/standing.js:338 waveUnlockReady(4)' },
  { id: 'defer5',    name: 'wave-5 readiness deferral (t5-1 hold)',      ref: 'src/js/standing.js:209 waveCombatReadiness(5)' },
  { id: 'w4faced',   name: 'wave-4 faced blow-by-blow (>=1 type)',       ref: 'src/js/game.js:30682 waveEngaged(4)' },
];

function num(x, d) { const n = +x; return Number.isFinite(n) ? n : d; }
function i0(x) { return (num(x, 0) | 0); }

function gday(G) {
  try { return (((G.state || {}).scholar || {}).day | 0) || 0; } catch (e) { return 0; }
}

function rdBars(rd) {
  try {
    if (!rd) return { armored: -1, armed: -1, tricks: -1, veterans: -1, short: ['no-read'], ready: false };
    return {
      armored: i0(rd.armored), armed: i0(rd.armed), tricks: i0(rd.tricks), veterans: i0(rd.veterans),
      short: Array.isArray(rd.short) ? rd.short.slice() : [], ready: !!rd.ready,
    };
  } catch (e) { return { armored: -1, armed: -1, tricks: -1, veterans: -1, short: ['read-error'], ready: false }; }
}

function barDeficit(bars, dem) {
  // distance-to-met per bar: how many more units each bar needs. dem is the
  // demand object {armored, armed, tricks, veterans}.
  const out = {};
  try {
    out.armor    = Math.max(0, (i0(dem && dem.armored))  - i0(bars && bars.armored));
    out.weapons  = Math.max(0, (i0(dem && dem.armed))     - i0(bars && bars.armed));
    out.tricks   = Math.max(0, (i0(dem && dem.tricks))    - i0(bars && bars.tricks));
    out.veterans = Math.max(0, (i0(dem && dem.veterans))  - i0(bars && bars.veterans));
  } catch (e) { out.armor = out.weapons = out.tricks = out.veterans = -1; }
  return out;
}

// dailyGateTrace(G): the compact per-day record. PURE except the
// villageStandingTotal() beat caveat (see header) — verified neutral by DET.
function dailyGateTrace(G) {
  const t = { d: gday(G) };
  try { t.uw = i0(G.unlockedWave ? G.unlockedWave() : 1); } catch (e) { t.uw = 1; }
  try {
    const vs = G.villageStanding ? G.villageStanding() : {};
    t.raw = i0(vs.total); t.war = i0(vs.war); t.dip = i0(vs.diplomacy); t.plenty = i0(vs.plenty);
    t.warPts = i0(vs.warPts); t.links = i0(vs.links); t.feasts = i0(vs.feasts);
  } catch (e) { t.raw = t.war = t.dip = t.plenty = t.warPts = t.links = t.feasts = -1; }
  try { t.capped = i0(G.standingPlentyCappedTotal ? G.standingPlentyCappedTotal() : -1); } catch (e) { t.capped = -1; }
  try { t.gated = i0(G.villageStandingTotal ? G.villageStandingTotal() : -1); } catch (e) { t.gated = -1; }
  try { t.peak = i0(G._standingPeakWave ? G._standingPeakWave() : 0); } catch (e) { t.peak = 0; }
  try { t.l2 = i0(G.waveLedgerPoints ? G.waveLedgerPoints(2) : -1); } catch (e) { t.l2 = -1; }
  t.r4 = rdBars((function () { try { return G.waveUnlockReady ? G.waveUnlockReady(4) : null; } catch (e) { return null; } })());
  t.r5 = rdBars((function () { try { return G.waveUnlockReady ? G.waveUnlockReady(5) : null; } catch (e) { return null; } })());
  try { t.w4faced = i0(G.waveEngaged ? G.waveEngaged(4) : -1); } catch (e) { t.w4faced = -1; }
  try { t.alive = !!(G.state && G.state.scholar && !G.state.scholar.dead); } catch (e) { t.alive = false; }
  return t;
}

// gateVector(G): the FULL end-of-run gate vector — every gate component's
// state plus distance-to-met, then attribute(v).
function gateVector(G) {
  const v = {};
  v.day = gday(G);
  // Ledger cfg (day floors + bars) — read live, never hardcoded.
  let dayFloor = 25, w2Floor = 8, bars = { 1: 5, 2: 4, 3: 4, 4: 3, 5: 2 };
  try {
    const wl = (typeof G.waveLedgerCfg === 'function') ? G.waveLedgerCfg() : null;
    if (wl) {
      if (wl.dayFloor != null) dayFloor = wl.dayFloor | 0;
      if (wl.wave2DayFloor != null) w2Floor = wl.wave2DayFloor | 0;
      if (wl.barsPerWave) bars = wl.barsPerWave;
    }
  } catch (e) {}
  v.dayFloor = dayFloor; v.w2Floor = w2Floor;
  const b2need = (bars && bars[2] != null) ? (bars[2] | 0) : 4;
  v.barsPerWave = bars;
  // Ledger points per wave.
  const lp = (w) => { try { return (G.waveLedgerPoints ? (G.waveLedgerPoints(w) | 0) : -1); } catch (e) { return -1; } };
  v.l1 = lp(1); v.l2 = lp(2); v.l3 = lp(3); v.l4 = lp(4); v.l5 = lp(5);
  // G1: wave-3 rung.
  const dayOk = v.day >= dayFloor, l2Ok = v.l2 >= b2need;
  v.w3 = { dayOk, l2Ok, met: dayOk && l2Ok, b2need };
  // Standing sources.
  let vs = {};
  try { vs = G.villageStanding ? G.villageStanding() : {}; } catch (e) {}
  v.raw = i0(vs.total); v.war = i0(vs.war); v.dip = i0(vs.diplomacy); v.plenty = i0(vs.plenty);
  v.warPts = i0(vs.warPts); v.links = i0(vs.links); v.feasts = i0(vs.feasts);
  // Thresholds + plenty cap from the engine's own cfg.
  let t4 = T4_DEFAULT, t5 = T5_DEFAULT, cap = 100, demand4 = null, demand5 = null;
  try {
    const sc = (typeof G.standingCfg === 'function') ? G.standingCfg() : null;
    if (sc) {
      t4 = (sc.t4 | 0) || T4_DEFAULT; t5 = (sc.t5 | 0) || T5_DEFAULT;
      cap = (sc.plentyCapT5 | 0) || 100;
      if (sc.readyDemand) { demand4 = sc.readyDemand[4] || null; demand5 = sc.readyDemand[5] || null; }
    }
  } catch (e) {}
  v.t4 = t4; v.t5 = t5; v.plentyCap = cap; v.demand4 = demand4; v.demand5 = demand5;
  try { v.capped = i0(G.standingPlentyCappedTotal ? G.standingPlentyCappedTotal() : -1); } catch (e) { v.capped = -1; }
  try { v.peak = i0(G._standingPeakWave ? G._standingPeakWave() : 0); } catch (e) { v.peak = 0; }
  try { v.gated = i0(G.villageStandingTotal ? G.villageStandingTotal() : -1); } catch (e) { v.gated = -1; }
  // Readiness bars.
  v.r4 = rdBars((function () { try { return G.waveUnlockReady ? G.waveUnlockReady(4) : null; } catch (e) { return null; } })());
  v.r5 = rdBars((function () { try { return G.waveUnlockReady ? G.waveUnlockReady(5) : null; } catch (e) { return null; } })());
  // Engine's own deferral states.
  try {
    const df4 = G.standingDeferral ? G.standingDeferral(4) : null;
    v.df4 = { deferred: !!(df4 && df4.deferred), grandfathered: !!(df4 && df4.grandfathered), raw: i0(df4 && df4.raw), threshold: i0(df4 && df4.threshold) };
  } catch (e) { v.df4 = { deferred: false, grandfathered: false, raw: -1, threshold: -1 }; }
  try {
    const df5 = G.standingDeferral ? G.standingDeferral(5) : null;
    v.df5 = { deferred: !!(df5 && df5.deferred), grandfathered: !!(df5 && df5.grandfathered), raw: i0(df5 && df5.raw), capped: i0(df5 && df5.capped), threshold: i0(df5 && df5.threshold) };
  } catch (e) { v.df5 = { deferred: false, grandfathered: false, raw: -1, capped: -1, threshold: -1 }; }
  // G6: wave-4 faced.
  try { v.w4faced = i0(G.waveEngaged ? G.waveEngaged(4) : -1); } catch (e) { v.w4faced = -1; }
  try {
    const ds = (typeof G.deedState === 'function') ? G.deedState() : null;
    const faced = (ds && ds.wavesFaced) || {};
    v.w4facedMids = Object.keys(faced).filter((mid) => (faced[mid] | 0) === 4);
    const per = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const mid of Object.keys(faced)) { const w = faced[mid] | 0; if (per[w] !== undefined) per[w]++; }
    v.facedPerWave = per;
  } catch (e) { v.w4facedMids = []; v.facedPerWave = null; }
  // Deed-gate bars — NOT part of the unlock gate (Steve 2026-10-10
  // reversal); recorded as non-binding context.
  try {
    const dg = G.deedGateReady ? G.deedGateReady() : null;
    v.deed = dg ? { ok: !!dg.ok, w1: i0(dg.w1), w2: i0(dg.w2), w3: i0(dg.w3), w4: i0(dg.w4), w5: i0(dg.w5) } : null;
  } catch (e) { v.deed = null; }
  // The engine's verdict.
  try { v.uw = i0(G.unlockedWave ? G.unlockedWave() : 1); } catch (e) { v.uw = 1; }
  // Distance-to-met per gate.
  const dist = {};
  dist.w3rung    = { day: Math.max(0, dayFloor - v.day), l2: Math.max(0, b2need - v.l2) };
  dist['stand-raw'] = { standing: Math.max(0, t5 - v.raw) };
  dist['plenty-cap'] = { loss: Math.max(0, v.raw - v.capped) };
  dist.defer4    = barDeficit(v.r4, demand4);
  dist.defer5    = barDeficit(v.r5, demand5);
  dist.w4faced   = { types: v.w4faced > 0 ? 0 : 1 };
  v.dist = dist;
  v.attr = attribute(v);
  return v;
}

// attribute(v): PURE — attributes the unlock outcome to gate states.
//   locked:   unmet gates with distance-to-met; attributed iff >=1 unmet
//             gate (0 unmet but uw<5 = UNEXPLAINED).
//   unlocked: every gate met, OR the peak ratchet grandfathered the holds
//             (a released door stays open while standing falls).
function attribute(v) {
  const gates = [];
  const push = (id, met, detail) => gates.push({ id, met: !!met, detail: detail || null });
  push('w3rung', v.w3 && v.w3.met, v.w3 ? { day: v.day, dayFloor: v.dayFloor, l2: v.l2, b2need: v.w3.b2need, d_day: v.dist.w3rung.day, d_l2: v.dist.w3rung.l2 } : null);
  push('stand-raw', v.raw >= (v.t5 || T5_DEFAULT), { raw: v.raw, t5: v.t5, d: v.dist['stand-raw'].standing });
  const capHit = (v.raw >= (v.t5 || T5_DEFAULT)) && (v.capped < (v.t5 || T5_DEFAULT)) && ((v.peak || 0) < 5);
  push('plenty-cap', !capHit, { raw: v.raw, capped: v.capped, loss: v.dist['plenty-cap'].loss });
  push('defer4', !(v.df4 && v.df4.deferred), {
    deferred: !!(v.df4 && v.df4.deferred), grandfathered: !!(v.df4 && v.df4.grandfathered),
    bars: v.r4 ? { armored: v.r4.armored, armed: v.r4.armed, tricks: v.r4.tricks, veterans: v.r4.veterans } : null,
    short: v.r4 ? v.r4.short : null, deficit: v.dist.defer4, peak: v.peak,
  });
  push('defer5', !(v.df5 && v.df5.deferred), {
    deferred: !!(v.df5 && v.df5.deferred), grandfathered: !!(v.df5 && v.df5.grandfathered),
    bars: v.r5 ? { armored: v.r5.armored, armed: v.r5.armed, tricks: v.r5.tricks, veterans: v.r5.veterans } : null,
    short: v.r5 ? v.r5.short : null, deficit: v.dist.defer5, peak: v.peak,
  });
  push('w4faced', (v.w4faced || 0) > 0, { n: v.w4faced, mids: v.w4facedMids || [] });
  const unmet = gates.filter((g) => !g.met).map((g) => g.id);
  const unlocked = (v.uw || 1) >= 5;
  let binding = null, why = null, attributed = false;
  if (unlocked) {
    // The door is open. Either every gate reads met, or the peak ratchet
    // grandfathered the holds (released doors stay open).
    if (unmet.length === 0) { attributed = true; why = 'all gates met'; }
    else if ((v.peak || 0) >= 5) { attributed = true; why = 'grandfathered: peak ratchet held the door open (standing fell after release)'; }
    else { attributed = false; why = 'UNEXPLAINED: unlocked but gates read unmet ' + unmet.join(','); }
  } else {
    // The door is shut. Engine evaluation order in unlockedWave():
    // w3 -> gated >= t5 -> w4faced; the gated shortfalls bind in
    // villageStandingTotal's hold order (raw shortfall, cap, defer4, defer5).
    if (unmet.length === 0) { attributed = false; why = 'UNEXPLAINED: locked but every gate reads met'; }
    else {
      attributed = true;
      for (const id of ['w3rung', 'stand-raw', 'plenty-cap', 'defer4', 'defer5', 'w4faced']) {
        if (unmet.indexOf(id) >= 0) { binding = id; break; }
      }
      why = 'binding gate: ' + binding + ' (unmet: ' + unmet.join(', ') + ')';
    }
  }
  return { outcome: unlocked ? 'unlocked' : 'locked', gates, unmet, binding, attributed, why };
}

module.exports = { gateVector, dailyGateTrace, attribute, rdBars, barDeficit, GATE_DEFS };
