#!/usr/bin/env node
// analyze-sensorconfirm3-b.js — (e*) SCREEN-THEN-TRACER CONFIRM analyzer
// for sim-sensorconfirm3-b (DIAG ONLY). Pure functions over evening
// series; no game load, no file writes, no RNG. The (c) rule is NOT
// reimplemented here: it is imported from the reused
// scripts/analyze-gatediseng-b.js, and the confirm cross-check requires
// the thin (c) first firings to match the reused analyzer's on ALL
// tracer legs (import form, as in confirm2 — a wiring check, not an
// independent reimplementation; see the supply pilot's metric review (5)).
//
// (e*) rule, exactly as fixed in
// evidence/2026-11-03/sim-sensorconfirm3-b-prereg.md:
//   S = first evening of the current disengaged stretch.
//   peak(D) = max pantry over S..D in the same stretch.
//   falls(D) = count of evenings t in (S..D] with
//     pantry(t) < pantry(t-1) (cumulative, not consecutive).
//   Fire at the FIRST evening D in the stretch with D > S,
//   D >= 8, disengaged, hungryStreak(D) >= 1, where either:
//     (E1) falls(D) >= 2 AND pantry(D) <= 0.90 * peak(D), or
//     (E2) pantry(D) <= 0.65 * peak(D).
// Collapsing (confirm3 definition, window-inclusive) = endReason
// 'village-lost' WITH a starvation death; reference day = first
// starvation death day. Lead = reference day - first firing day;
// no-fire counts as negative infinity for the lead-vs-(c) legs.
// Survivor = survived the full 30d (reused analyzer's survived flag:
// not collapsed, i.e. daysAlive == days and endReason != village-lost).
'use strict';
const { analyzeSeedGatediseng, firstStarvationDay } = require('./analyze-gatediseng-b');

const ENVELOPE_FRACTION = 0.90;
const CLIFF_FRACTION = 0.65;
const ELIGIBLE_DAY = 8;
const STREAK_MIN = 1;

function fireEstar(seedJson) {
  const rows = ((seedJson && seedJson.rows) || []).slice()
    .sort((a, b) => a.loopDay - b.loopDay);
  const m = new Map(rows.map((r) => [r.loopDay, r]));
  const stretches = [];
  let cur = null;
  for (const r of rows) {
    if (!r.gateEngaged) {
      if (cur == null) cur = { start: r.loopDay, days: [] };
      cur.days.push(r.loopDay);
    } else if (cur != null) { stretches.push(cur); cur = null; }
  }
  if (cur != null) stretches.push(cur);
  for (const st of stretches) {
    const S = st.start;
    const sPan = m.get(S) != null ? m.get(S).pantryKcal : null;
    if (sPan == null) continue;
    let peak = sPan;
    let falls = 0;
    let prev = sPan;
    for (const d of st.days) {
      if (d === S) continue;
      const row = m.get(d);
      const p = row != null ? row.pantryKcal : null;
      if (p == null) continue;
      if (prev != null && p < prev) falls++;
      if (p > peak) peak = p;
      if (d >= ELIGIBLE_DAY && row.hungryStreak != null && row.hungryStreak >= STREAK_MIN) {
        if (p <= CLIFF_FRACTION * peak) {
          return { day: d, clause: 'E2-cliff', standDownDay: S, standDownPantry: sPan, pantry: p, peak, falls };
        }
        if (falls >= 2 && p <= ENVELOPE_FRACTION * peak) {
          return { day: d, clause: 'E1-envelope', standDownDay: S, standDownPantry: sPan, pantry: p, peak, falls };
        }
      }
      prev = p;
    }
  }
  return null;
}

// Screen classification from a tracer JSON line: endReason + deaths.
// 'collapsing' = village-lost + >= 1 starvation death (window-inclusive:
// a day-30 loss counts). 'survivor' = full 30d, not village-lost.
// Anything else = 'other'.
function classifyScreen(seedJson) {
  const starve = firstStarvationDay(seedJson);
  if (seedJson.endReason === 'village-lost' && starve != null) return 'collapsing';
  if (seedJson.endReason !== 'village-lost' && seedJson.daysAlive === 30) return 'survivor';
  if (seedJson.endReason !== 'village-lost' && seedJson.daysAlive != null
    && seedJson.days != null && seedJson.daysAlive >= seedJson.days) return 'survivor';
  return 'other';
}

// First n survivors in seed order from screen-classified lines
// (input order is seed order; never re-sorted by any outcome).
function sampleSurvivors(screenLines, n) {
  const out = [];
  for (const sj of screenLines) {
    if (classifyScreen(sj) === 'survivor') { out.push(sj.seed); if (out.length >= n) break; }
  }
  return out;
}

function analyzeSeedSensorconfirm3(seedJson) {
  const base = analyzeSeedGatediseng(seedJson);
  const c = base.candidates.c_standDownTrend;
  const e = fireEstar(seedJson);
  const collapsing = seedJson.endReason === 'village-lost' && base.firstStarvationDay != null;
  const legacyCollapsing = base.collapsed && base.firstStarvationDay != null;
  const ref = collapsing ? base.firstStarvationDay : null;
  const lead = (f) => (f != null && ref != null) ? (ref - f.day) : null;
  const leadC = lead(c);
  const leadE = lead(e);
  const beatsOrTies = (leadE != null) && (leadC == null || leadE >= leadC);
  const strictlyBeats = (leadE != null) && (leadC == null || leadE > leadC);
  return {
    seed: seedJson.seed,
    survived: base.survived,
    collapsed: base.collapsed,
    collapsing,
    collapsedDivergence: legacyCollapsing !== collapsing,
    daysAlive: base.daysAlive,
    endReason: base.endReason,
    maxWaveUnlocked: base.maxWaveUnlocked,
    firstStarvationDay: base.firstStarvationDay,
    referenceDay: ref,
    c: c == null ? null : { day: c.day, lead: leadC },
    e: e == null ? null : Object.assign({}, e, { lead: leadE }),
    leadComparison: { beatsOrTies, strictlyBeats },
  };
}

// Still-collapsing rule: a screened candidate whose tracer analysis is
// not collapsing is excluded (never a rule failure). Returns the kept
// analyses and the excluded seed numbers.
function applyStillCollapsing(tracerAnalyses) {
  const still = [];
  const excluded = [];
  for (const a of tracerAnalyses) {
    if (a.collapsing) still.push(a);
    else excluded.push(a.seed);
  }
  return { still, excluded };
}

function summarizeAnalyses(analyses) {
  const collapsing = analyses.filter((s) => s.collapsing);
  const survivors = analyses.filter((s) => s.survived);
  const other = analyses.filter((s) => !s.collapsing && !s.survived);
  const countGate = collapsing.length >= 4 && survivors.length >= 12;
  const fireLeg = collapsing.length > 0 && collapsing.every((s) => s.e != null);
  const tieLeg = collapsing.length > 0 && collapsing.every((s) => s.leadComparison.beatsOrTies);
  const strictLeg = collapsing.length > 0
    && collapsing.filter((s) => s.leadComparison.strictlyBeats).length >= Math.ceil(0.50 * collapsing.length);
  const leadOneLeg = collapsing.length > 0
    && collapsing.filter((s) => s.e != null && s.e.lead >= 1).length >= Math.ceil(0.75 * collapsing.length);
  const firingSurvivors = survivors.filter((s) => s.e != null).map((s) => s.seed);
  const costLeg = survivors.length > 0 && firingSurvivors.length <= Math.floor(0.25 * survivors.length);
  const legs = { countGate, fireLeg, tieLeg, strictLeg, leadOneLeg, costLeg };
  const verdict = !countGate ? 'INSUFFICIENT-DATA'
    : (Object.values(legs).every(Boolean) ? 'CONFIRM-GO' : 'CONFIRM-NO-GO');
  return { seeds: analyses, collapsing: collapsing.map((s) => s.seed), survivors: survivors.map((s) => s.seed),
    other: other.map((s) => s.seed), legs, firingSurvivors, verdict };
}

function summarizeSensorconfirm3(allSeeds) {
  return summarizeAnalyses(allSeeds.map((sj) => analyzeSeedSensorconfirm3(sj)));
}

if (require.main === module) {
  let text = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (c) => { text += c; });
  process.stdin.on('end', () => {
    const seeds = text.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
    process.stdout.write(JSON.stringify(summarizeSensorconfirm3(seeds), null, 2) + '\n');
  });
}

module.exports = { fireEstar, classifyScreen, sampleSurvivors, analyzeSeedSensorconfirm3,
  applyStillCollapsing, summarizeAnalyses, summarizeSensorconfirm3 };
