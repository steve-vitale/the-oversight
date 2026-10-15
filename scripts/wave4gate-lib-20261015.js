#!/usr/bin/env node
'use strict';
// scripts/wave4gate-lib-20261015.js — shared gate sampler + binding-rung
// classifier for the wave-4/5 unlock gate audit (fleshout-a-2026-10-15T151641Z,
// loop A, arm: wave-4/wave-5 unlock gate audit, 2026-10-15).
//
// INSTRUMENT ONLY — reads engine state, never writes game code. Shared by
// scripts/wave4gate-20261015.js (the 16-run sweep) and
// scripts/test-wave4gate-20261015.js (the proof test), so both read the same
// way and the test proves the sweep's instrument.
//
// The gate as read from current master (2026-10-15):
//   unlockedWave() (game.js): w3 = day >= dayFloor(25) && waveLedgerPoints(2)
//     >= barsPerWave[2] (4, from src/data/wave-ledger.json — the task brief's
//     "≥5" is stale: that was the pre-r2 calibration).
//     w5 = w3 && villageStandingTotal() >= t5(200) && waveEngaged(4) > 0
//     w4 = w3 && villageStandingTotal() >= t4(100)
//   villageStandingTotal() (standing.js) is the GATED number: raw standing =
//     war(25/kill-point, waves 3-5 ledger) + diplomacy(34/seasoned regional+
//     link) + plenty(20/major feast); the readiness gate v3 can HOLD it:
//     - defer4: raw >= t4 but waveEngaged(3) < readyFacedW3(3) -> holds at t4-1
//     - defer5: capped >= t5 but waveEngaged(4) < readyFacedW4(2) -> holds at t5-1
//     - plenty cap: plenty counts at most plentyCapT5(100) toward the T5 bar;
//       raw >= t5 but capped < t5 holds the gated total at t5-1. The cap is a
//       rung of its own (standing-cap) — a village that earned 245 standing
//       on bread is not "standing-raw".
//     - peak ratchet: once released, the total never drops below the released
//       wave's threshold.
//
// Calling sampleGate() is ENGINE-READ-EQUIVALENT: the engine itself calls
// unlockedWave() (hence villageStandingTotal()) on every spawn check, so the
// peak ratchet and hold/release beats it may touch are engine traffic, not
// instrument mutation. The proof test asserts output determinism across
// repeated reads of the same state.
const G = {};

G.cfgOf = function (Game) {
  let wl = {}, sc = {};
  try { wl = (typeof Game.waveLedgerCfg === 'function') ? Game.waveLedgerCfg() : {}; } catch (e) {}
  try { sc = (typeof Game.standingCfg === 'function') ? Game.standingCfg() : {}; } catch (e) {}
  const bars = (wl && wl.barsPerWave) || {};
  return {
    bar1: ((bars[1] | 0) || 5),
    bar2: ((bars[2] | 0) || 4),
    d2: wl.wave2DayFloor != null ? (wl.wave2DayFloor | 0) : 8,
    dN: wl.dayFloor != null ? (wl.dayFloor | 0) : 25,
    t4: (sc.t4 | 0) || 100,
    t5: (sc.t5 | 0) || 200,
    readyFacedW3: (sc.readyFacedW3 | 0) || 3,
    readyFacedW4: (sc.readyFacedW4 | 0) || 2,
    plentyCapT5: (sc.plentyCapT5 | 0) || 100,
  };
};

// sampleGate(Game): bounded read-only snapshot of the wave-4/5 gate state.
G.sampleGate = function (Game) {
  const c = G.cfgOf(Game);
  const s = { day: 0, uw: 1, pts1: 0, pts2: 0, raw: 0, gated: 0, capped: 0,
    war: 0, diplomacy: 0, plenty: 0, warPts: 0, links: 0, feasts: 0,
    engaged3: 0, engaged4: 0, rd4: null, rd5: null, peak: 0, line: null,
    cfg: { bar2: c.bar2, dN: c.dN, t4: c.t4, t5: c.t5,
      readyFacedW3: c.readyFacedW3, readyFacedW4: c.readyFacedW4 } };
  try { s.day = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0; } catch (e) {}
  try { s.pts1 = Game.waveLedgerPoints ? (Game.waveLedgerPoints(1) | 0) : 0; } catch (e) {}
  try { s.pts2 = Game.waveLedgerPoints ? (Game.waveLedgerPoints(2) | 0) : 0; } catch (e) {}
  try { s.engaged3 = Game.waveEngaged ? (Game.waveEngaged(3) | 0) : 0; } catch (e) {}
  try { s.engaged4 = Game.waveEngaged ? (Game.waveEngaged(4) | 0) : 0; } catch (e) {}
  try { s.rd4 = Game.waveUnlockReady ? Game.waveUnlockReady(4) : null; } catch (e) {}
  try { s.rd5 = Game.waveUnlockReady ? Game.waveUnlockReady(5) : null; } catch (e) {}
  try {
    const b = Game.villageStanding ? Game.villageStanding() : null;
    if (b) {
      s.war = (b.war | 0) || 0; s.diplomacy = (b.diplomacy | 0) || 0;
      s.plenty = (b.plenty | 0) || 0; s.warPts = (b.warPts | 0) || 0;
      s.links = (b.links | 0) || 0; s.feasts = (b.feasts | 0) || 0;
    }
    s.raw = (s.war | 0) + (s.diplomacy | 0) + (s.plenty | 0);
    s.capped = (s.war | 0) + (s.diplomacy | 0) + Math.min((s.plenty | 0), (c.plentyCapT5 | 0) || 100);
  } catch (e) {}
  try { s.gated = Game.villageStandingTotal ? (Game.villageStandingTotal() | 0) : s.raw; } catch (e) {}
  try { s.peak = (Game._standingPeakWave ? Game._standingPeakWave() : 0) | 0; } catch (e) {}
  try { s.line = Game.standingLine ? String(Game.standingLine()) : null; } catch (e) {}
  try { s.uw = Game.unlockedWave ? (Game.unlockedWave() | 0) : 1; } catch (e) {}
  return s;
};

// classifySample(s, c): the PURE binding-rung attribution for one sampled
// gate state. s is sampleGate-shaped ({day, uw, pts2, raw, gated, capped,
// war, diplomacy, plenty, warPts, links, feasts, engaged3, engaged4, rd4,
// rd5}); c is cfgOf-shaped ({bar2, dN, t4, t5, readyFacedW3, readyFacedW4}).
// No engine calls — safe to run over historical rows, so the sweep can
// report which rungs bound MID-RUN (the end-state classification alone
// hides a deferral that bit for 20 days and then released).
G.classifySample = function (s, c) {
  let w4;
  if (s.day < c.dN) {
    w4 = { unlocked: false, binding: 'w3-day-floor',
      day: s.day, dayFloor: c.dN, pts2: s.pts2, need2: c.bar2 };
  } else if (s.pts2 < c.bar2) {
    w4 = { unlocked: false, binding: 'w3-ledger2',
      day: s.day, pts2: s.pts2, need2: c.bar2 };
  } else if (s.uw >= 4) {
    w4 = { unlocked: true, binding: 'unlocked', day: s.day };
  } else if (s.gated >= c.t4) {
    // uw < 4 but the gate reads open — inconsistent (should not happen);
    // classify as unlocked-by-bar with a flag rather than hiding it.
    w4 = { unlocked: true, binding: 'unlocked-bar-inconsistent',
      day: s.day, gated: s.gated, uw: s.uw };
  } else if (s.raw >= c.t4 && s.rd4 && !s.rd4.ready) {
    w4 = { unlocked: false, binding: 'standing-defer4',
      day: s.day, raw: s.raw, gated: s.gated, t4: c.t4,
      engaged3: s.engaged3, need3: c.readyFacedW3,
      war: s.war, diplomacy: s.diplomacy, plenty: s.plenty,
      links: s.links, feasts: s.feasts, warPts: s.warPts };
  } else {
    w4 = { unlocked: false, binding: 'standing-raw',
      day: s.day, raw: s.raw, gated: s.gated, t4: c.t4,
      engaged3: s.engaged3, need3: c.readyFacedW3,
      war: s.war, diplomacy: s.diplomacy, plenty: s.plenty,
      links: s.links, feasts: s.feasts, warPts: s.warPts };
  }
  let w5;
  if (s.uw >= 5) {
    w5 = { unlocked: true, binding: 'unlocked', day: s.day };
  } else if (s.uw < 4) {
    w5 = { unlocked: false, binding: 'w4-not-unlocked', day: s.day };
  } else if (s.gated >= c.t5 && s.engaged4 > 0) {
    w5 = { unlocked: true, binding: 'unlocked-bar-inconsistent',
      day: s.day, gated: s.gated, uw: s.uw };
  } else if (s.engaged4 <= 0) {
    w5 = { unlocked: false, binding: 'w4faced',
      day: s.day, engaged4: s.engaged4, raw: s.raw, gated: s.gated, t5: c.t5 };
  } else if (s.raw >= c.t5 && s.capped < c.t5) {
    w5 = { unlocked: false, binding: 'standing-cap',
      day: s.day, raw: s.raw, capped: s.capped, gated: s.gated, t5: c.t5,
      engaged4: s.engaged4, need4: c.readyFacedW4,
      war: s.war, diplomacy: s.diplomacy, plenty: s.plenty,
      links: s.links, feasts: s.feasts, warPts: s.warPts };
  } else if (s.raw >= c.t5 && s.rd5 && !s.rd5.ready) {
    w5 = { unlocked: false, binding: 'standing-defer5',
      day: s.day, raw: s.raw, gated: s.gated, t5: c.t5,
      engaged4: s.engaged4, need4: c.readyFacedW4,
      war: s.war, diplomacy: s.diplomacy, plenty: s.plenty,
      links: s.links, feasts: s.feasts, warPts: s.warPts };
  } else {
    w5 = { unlocked: false, binding: 'standing-raw',
      day: s.day, raw: s.raw, gated: s.gated, t5: c.t5,
      engaged4: s.engaged4, need4: c.readyFacedW4,
      war: s.war, diplomacy: s.diplomacy, plenty: s.plenty,
      links: s.links, feasts: s.feasts, warPts: s.warPts };
  }
  return { w4, w5 };
};

// classifyGate(Game): sample the live state, then attribute purely.
G.classifyGate = function (Game) {
  const s = G.sampleGate(Game);
  const r = G.classifySample(s, s.cfg);
  return { day: s.day, uw: s.uw, cfg: s.cfg, w4: r.w4, w5: r.w5, sample: s };
};

// SAYRE: the say-capture filter for the sense test — wave/standing beats
// only, bounded per run by the caller.
G.SAYRE = /wave|standing|mirror draft|final draft|producers|unlock|greenlit|talent|not for strangers|stays in the wings|bread alone|ratings are up/i;

module.exports = G;
