#!/usr/bin/env node
// analyze-sensorconfirm2-b.js — (e*) FRESH-BAND CONFIRM analyzer for
// sim-sensorconfirm2-b (DIAG ONLY). Pure functions over evening series;
// no game load, no file writes, no RNG. The (c) rule is NOT
// reimplemented here: it is imported from the reused
// scripts/analyze-gatediseng-b.js, and the confirm cross-check requires
// both to agree on (c) first firings.
//
// (e*) rule, exactly as fixed in
// evidence/2026-11-02/sim-sensorconfirm2-b-prereg.md:
//   S = first evening of the current disengaged stretch.
//   peak(D) = max pantry over S..D in the same stretch.
//   falls(D) = count of evenings t in (S..D] with
//     pantry(t) < pantry(t-1) (cumulative, not consecutive).
//   Fire at the FIRST evening D in the stretch with D > S,
//   D >= 8, disengaged, hungryStreak(D) >= 1, where either:
//     (E1) falls(D) >= 2 AND pantry(D) <= 0.90 * peak(D), or
//     (E2) pantry(D) <= 0.65 * peak(D).
// Collapsing (confirm definition) = lost before 30d WITH a starvation
// death; reference day = first starvation death day. Lead = reference
// day - first firing day; no-fire counts as negative infinity for the
// lead-vs-(c) legs.
'use strict';
const { analyzeSeedGatediseng } = require('./analyze-gatediseng-b');

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

function analyzeSeedSensorconfirm(seedJson) {
  const base = analyzeSeedGatediseng(seedJson);
  const c = base.candidates.c_standDownTrend;
  const e = fireEstar(seedJson);
  const collapsing = base.collapsed && base.firstStarvationDay != null;
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

function summarizeSensorconfirm(allSeeds) {
  const seeds = allSeeds.map((sj) => analyzeSeedSensorconfirm(sj));
  const collapsing = seeds.filter((s) => s.collapsing);
  const survivors = seeds.filter((s) => s.survived);
  const other = seeds.filter((s) => !s.collapsing && !s.survived);
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
  return { seeds, collapsing: collapsing.map((s) => s.seed), survivors: survivors.map((s) => s.seed),
    other: other.map((s) => s.seed), legs, firingSurvivors, verdict };
}

if (require.main === module) {
  let text = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (c) => { text += c; });
  process.stdin.on('end', () => {
    const seeds = text.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
    process.stdout.write(JSON.stringify(summarizeSensorconfirm(seeds), null, 2) + '\n');
  });
}

module.exports = { fireEstar, analyzeSeedSensorconfirm, summarizeSensorconfirm };
