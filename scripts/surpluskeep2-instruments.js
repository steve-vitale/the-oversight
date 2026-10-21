#!/usr/bin/env node
// surpluskeep2-instruments.js — gate-crossing instruments for
// sim-surpluskeep2-b (loop B, threshold-gated SURPLUSFEED CONFIRM).
//
// The parent diagnostic (sim-surpluskeep-diag-b, evidence/2026-10-21/
// sim-surpluskeep-diag-b.md) REJECTED the dose-proportional trim->upkeep
// hypothesis twice and exemplified (n=1, seed 8802 leadfeast) the
// THRESHOLD-GATED mechanism: the pantry falls through the POLICY's own
// absolute tendLink gate (leadcourt.js:61 — tending fires ONLY when
// pantryKcal > 20000; at/below 20k the policy never calls tendLink, so
// tending is SKIPPED) -> skipped tend-weeks -> subordinate trust erodes ->
// no-break dissolution at the _linkSeasoned trust-40 bar.
//
// This arm confirms the threshold mechanism systematically. New
// instrumentation in THIS file (pure telemetry; every wrap calls through,
// draws no RNG, writes no game state; verified by the det-gate):
//   1. gate sensor: a Game.sleep wrap (outside the upkeep probe's — both
//      call through) records the dawn pantry kcal EVERY DAY:
//      G.pantryDaily = [[day, kcalRounded], ...]. The weekly series and
//      gate-crossing detection are pure functions below (unit-testable).
// Everything else (per-link trust snapshots, tend/tribute events, breaks,
// nationalLive edges, dissolution say-lines) is REUSED from the parent's
// proof-tested upkeep-instruments-surpluskeep-b.js — required, not copied,
// not modified.
//
// GATE DIRECTION (code-grounded): the mechanism-relevant crossing is
// DOWNWARD — pantry falls from ABOVE 20000 to AT/BELOW 20000, after which
// the policy's gate closes and tending stops. (The assignment brief's
// "upward" is inverted vs leadcourt.js:61; documented in the evidence.)
//
// Usage: same env as the parent probe (FEASTSCALE_R13=1 SEATDRIVE=0,
// SURPLUSFEED=1 armed / unset control). PRISTINE=1 skips ALL wraps.
'use strict';
const { attachUpkeepProbe, dayOf, pantryKcal } = require('./upkeep-instruments-surpluskeep-b');

const TEND_GATE_KCAL = 20000; // leadcourt.js:61 — tending fires iff pantryKcal > 20000

function attachGateSensor(Game) {
  const G = { pantryDaily: [] }; // [day, kcalRounded] at each dawn
  Game._gateSensor = G; // instrument-state marker (RED gate reads it)
  const o = Game.sleep;
  if (typeof o === 'function') Game.sleep = function () {
    const r = o.apply(this, arguments);
    try { G.pantryDaily.push([dayOf(Game), Math.round(pantryKcal(Game))]); } catch (e) {}
    return r;
  };
  return G;
}

// --- pure detection (no Game access; unit-tested) ---

// pantryDaily [[day,kcal]...] -> dense weekly array: kcal at the dawn of
// each week's first recorded day (week w = days 7w..7w+6). Missing weeks
// stay undefined (never interpolated — a gap is a gap).
function weeklyPantry(pantryDaily) {
  const weeks = [];
  for (const [d, k] of pantryDaily) {
    if (!Number.isInteger(d) || typeof k !== 'number') continue;
    const w = Math.floor(d / 7);
    if (weeks[w] === undefined) weeks[w] = Math.round(k);
  }
  const out = [];
  for (let w = 0; w < weeks.length; w++) out[w] = weeks[w];
  return out;
}

// Downward gate crossings: week w-1 pantry ABOVE the gate, week w AT or
// BELOW it. The policy's gate closes at/after week w -> tending stops.
function detectGateCrossings(weekly, gate) {
  const g = (gate == null ? TEND_GATE_KCAL : gate);
  const events = [];
  for (let w = 1; w < weekly.length; w++) {
    const prev = weekly[w - 1], cur = weekly[w];
    if (prev === undefined || cur === undefined) continue;
    if (prev > g && cur <= g) events.push({ week: w, beforeKcal: prev, afterKcal: cur, dir: 'down' });
  }
  return events;
}

// Upward recrossings (pantry climbs back above the gate — tending resumes).
// Recorded for the gate-recrossed-transient attribution only.
function detectRecrossings(weekly, gate) {
  const g = (gate == null ? TEND_GATE_KCAL : gate);
  const events = [];
  for (let w = 1; w < weekly.length; w++) {
    const prev = weekly[w - 1], cur = weekly[w];
    if (prev === undefined || cur === undefined) continue;
    if (prev <= g && cur > g) events.push({ week: w, beforeKcal: prev, afterKcal: cur, dir: 'up' });
  }
  return events;
}

module.exports = {
  attachGateSensor, attachUpkeepProbe, dayOf, pantryKcal,
  weeklyPantry, detectGateCrossings, detectRecrossings,
  TEND_GATE_KCAL,
};
