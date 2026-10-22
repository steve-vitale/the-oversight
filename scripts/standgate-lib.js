#!/usr/bin/env node
// standgate-lib.js — STANDING GATE instrument (flesh-out loop arm
// sim-standgate, run fleshout-20261022T0437Z, axis scale-onramp).
//
// INSTRUMENT-ONLY DIAGNOSTIC: zero src/js changes, zero scripts/policies
// changes. The instrument wraps the policy daily with PURE engine reads
// (villageStanding / standingPlentyCappedTotal / standingCfg from
// src/js/standing.js) — the DET gate pins instrument-on vs
// instrument-off byte-identical trajectories (same pattern as
// scripts/w5gates-sweep-20261021.js).
//
// THE STANDING HALF of the wave-5 door (see scripts/w5gates-lib.js for the
// full gate decomposition — the sibling readiness arms own the other
// half; do not re-derive here):
//   unlockedWave()==5 needs gatedTotal >= t5 (200) + w4faced + w3rung.
//   gatedTotal = war + diplomacy + min(plenty, cap), with
//     war       = waveLedgerPoints(3)+waveLedgerPoints(4)+waveLedgerPoints(5)
//                 x warPerKill(25)          -> "blood" channel (kills)
//     diplomacy = seasoned regional+ links x diplomacyPerLink(34)
//                                               -> "bonds" channel (court)
//     plenty    = quality>=1 feasts x plentyPerFeast(20), log capped at 60
//                                               -> "bread" channel (feasts)
//
// Exports:
//   CHANNELS      — channel table (ids, point keys, per-point values, live readers).
//   sgSample(G)   — PURE: one daily standing breakdown. Never writes.
//   sgDailyGain(prev, cur) — PURE: attributes the day-over-day delta to
//     named channels (blood/bonds/bread), returning {gains, residuals}.
//     A gain is ATTRIBUTED iff d_points == d_counter * perPoint. Anything
//     else is an UNEXPLAINED residual (0 expected).
//   sgAttributeCorpus(traces) — PURE: corpus-level attribution: total gains
//     by channel, share attributed, unexplained count.
//   installSg(G, rec) — wraps G.say for the sense-test line capture
//     (call-through, trajectory-neutral). Daily sampling is done by the
//     sweep, which owns the policy wrapper.
'use strict';

const CHANNELS = [
  { id: 'blood', name: 'blood — wave-3+ ledger kills x25', counter: 'warPts', points: 'war',   perPoint: 25 },
  { id: 'bonds', name: 'bonds — seasoned regional+ links x34', counter: 'links', points: 'dip', perPoint: 34 },
  { id: 'bread', name: 'bread — quality>=1 feasts x20', counter: 'feasts', points: 'plenty', perPoint: 20 },
];

function gday(G) {
  try { return (((G.state || {}).scholar || {}).day | 0) || 0; } catch (e) { return 0; }
}

function i0(x) { const n = +x; return Number.isFinite(n) ? (n | 0) : 0; }

// sgSample(G): the PURE daily standing breakdown. Reads the engine's own
// villageStanding() (the exact numbers the gate gates on) plus per-wave
// ledger points for blood-source grain. Never writes — verified neutral
// by the sweep's DET gate.
function sgSample(G) {
  const s = { day: gday(G) };
  try {
    const vs = G.villageStanding ? G.villageStanding() : {};
    s.warPts = i0(vs.warPts); s.links = i0(vs.links); s.feasts = i0(vs.feasts);
    s.war = i0(vs.war); s.dip = i0(vs.diplomacy); s.plenty = i0(vs.plenty); s.raw = i0(vs.total);
  } catch (e) {
    s.warPts = s.links = s.feasts = s.war = s.dip = s.plenty = s.raw = -1;
  }
  try {
    s.w3 = i0(G.waveLedgerPoints ? G.waveLedgerPoints(3) : -1);
    s.w4 = i0(G.waveLedgerPoints ? G.waveLedgerPoints(4) : -1);
    s.w5 = i0(G.waveLedgerPoints ? G.waveLedgerPoints(5) : -1);
  } catch (e) { s.w3 = s.w4 = s.w5 = -1; }
  try { s.capped = i0(G.standingPlentyCappedTotal ? G.standingPlentyCappedTotal() : -1); } catch (e) { s.capped = -1; }
  try { s.gated = i0(G.villageStandingTotal ? G.villageStandingTotal() : -1); } catch (e) { s.gated = -1; }
  try {
    const cfg = (typeof G.standingCfg === 'function') ? G.standingCfg() : {};
    s.per = { blood: (cfg.warPerKill | 0) || 25, bonds: (cfg.diplomacyPerLink | 0) || 34, bread: (cfg.plentyPerFeast | 0) || 20 };
    s.t5 = (cfg.t5 | 0) || 200; s.cap = (cfg.plentyCapT5 | 0) || 100;
  } catch (e) { s.per = { blood: 25, bonds: 34, bread: 20 }; s.t5 = 200; s.cap = 100; }
  try { s.alive = !!(G.state && G.state.scholar && !G.state.scholar.dead); } catch (e) { s.alive = false; }
  return s;
}

// sgDailyGain(prev, cur): attribute the day-over-day change to channels.
// For each channel: dPoints and dCounter; attributed iff
// dPoints == dCounter * perPoint. Positive and negative deltas both
// counted (feast-log trim at 60 entries can shrink bread; links can
// break). Returns gains[] = {day, channel, dCounter, dPoints} and
// residuals[] = {day, channel, dCounter, dPoints, expected, resid} where
// resid != 0.
function sgDailyGain(prev, cur) {
  const gains = [], residuals = [];
  if (!prev || !cur) return { gains, residuals };
  for (const ch of CHANNELS) {
    const dPts = i0(cur[ch.points]) - i0(prev[ch.points]);
    const dCnt = i0(cur[ch.counter]) - i0(prev[ch.counter]);
    const per = (cur.per && cur.per[ch.id]) || ch.perPoint;
    const expected = dCnt * per;
    if (dPts !== expected) {
      residuals.push({ day: cur.day, channel: ch.id, dCounter: dCnt, dPoints: dPts, per, expected, resid: dPts - expected });
    } else if (dPts !== 0) {
      gains.push({ day: cur.day, channel: ch.id, dCounter: dCnt, dPoints: dPts });
    }
  }
  return { gains, residuals };
}

// sgAttributeCorpus(traces): traces = array of per-run {seed, policyId,
// samples: [...]}. PURE. Returns corpus attribution:
//   { totalGain, byChannel: {blood:{n,dPts}, bonds:{...}, bread:{...}},
//     attributedPts, residualPts, unexplained: n, shareAttributed, runs }
// shareAttributed = attributedPts / (attributedPts + |residualPts|)
// DIAG-GO: shareAttributed >= 0.95 AND unexplained residuals == 0.
function sgAttributeCorpus(traces) {
  const byChannel = {};
  for (const ch of CHANNELS) byChannel[ch.id] = { gains: 0, pts: 0, losses: 0 };
  let attributedPts = 0, residualPts = 0, residualEvents = 0, runs = 0;
  const residList = [];
  for (const t of (traces || [])) {
    if (!t || !Array.isArray(t.samples) || t.samples.length < 2) continue;
    runs++;
    for (let i = 1; i < t.samples.length; i++) {
      const r = sgDailyGain(t.samples[i - 1], t.samples[i]);
      for (const g of r.gains) {
        byChannel[g.channel].gains++;
        if (g.dPoints > 0) { byChannel[g.channel].pts += g.dPoints; attributedPts += g.dPoints; }
        else byChannel[g.channel].losses += g.dPoints;
      }
      for (const x of r.residuals) {
        residualEvents++;
        residualPts += Math.abs(x.resid);
        residList.push({ seed: t.seed, policyId: t.policyId, seed_day: x.day, channel: x.channel, dCounter: x.dCounter, dPoints: x.dPoints, resid: x.resid });
      }
    }
  }
  const totalPts = attributedPts + residualPts;
  const shareAttributed = totalPts > 0 ? attributedPts / totalPts : 1;
  const diagGo = shareAttributed >= 0.95 && residualEvents === 0;
  return { runs, byChannel, attributedPts, residualPts, residualEvents, shareAttributed, diagGo, residList };
}

// installSg(G, rec): capture System/say lines with their day for the
// SENSE-TESTING law (read the fiction around the largest standing gains).
// Call-through: appends only, returns the original value untouched —
// trajectory-neutral.
const SG_LINE_RE = /feast|standing|fifth draft|the next act|talent has been released|veteran|kills?|link|bond|allied|court/i;
function installSg(G, rec) {
  const lines = [];
  let osay = null;
  try {
    osay = G.say.bind(G);
    G.say = function (x) {
      try {
        const s = String(x);
        if (SG_LINE_RE.test(s)) lines.push({ d: gday(G), text: s.slice(0, 600) });
      } catch (e) {}
      return osay.apply(this, arguments);
    };
  } catch (e) {}
  rec.sayLines = lines;
  return () => { try { if (osay) G.say = osay; } catch (e) {} };
}

module.exports = { CHANNELS, sgSample, sgDailyGain, sgAttributeCorpus, installSg, gday };
