#!/usr/bin/env node
// analyze-sensor-supply-b.js — (e*) FIXED KNOWN-COLLAPSER SUPPLY PILOT
// analyzer for sim-sensor-supply-b (DIAG ONLY). Pure functions over
// evening series; no game load, no file writes, no RNG. The judged (c)
// rule is NOT reimplemented for judging: it is imported from the reused
// scripts/analyze-gatediseng-b.js. An independent (c) implementation
// (fireCIndependent, from the prereg definition) exists ONLY for the
// cross-check field: a mismatch between it and the reused (c) is the
// loud failure, never a re-score of the judged (c) values.
//
// (e*) rule, exactly as fixed in
// evidence/2026-11-03/sim-sensor-supply-b-prereg.md:
//   S = first evening of the current disengaged stretch.
//   peak(D) = max pantry over S..D in the stretch.
//   falls(D) = count of evenings t in (S..D] with
//     pantry(t) < pantry(t-1) (cumulative, not consecutive).
//   Fire at the FIRST evening D in the stretch with D > S,
//   D >= 8, disengaged, hungryStreak(D) >= 1, where either:
//     (E1) falls(D) >= 2 AND pantry(D) <= 0.90 * peak(D), or
//     (E2) pantry(D) <= 0.65 * peak(D).
// Collapsing (pilot definition, window-inclusive) = village-lost WITH
// a starvation death, daysAlive <= 30; reference day = first
// starvation death day. Operationally: base.collapsed AND
// base.firstStarvationDay != null, where base is the reused
// gatediseng analysis. Lead = reference day - first firing day;
// no-fire counts as negative infinity for the lead-vs-(c) legs.
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

// Independent (c) reimplementation, CROSS-CHECK ONLY (never judged).
// Prereg definition: S = first evening of the current disengaged
// stretch; D > S, D >= 8, three consecutive falls ending at D with
// D-3 >= S, and pantry(D) <= 0.90 * pantry(S). First such D wins.
function fireCIndependent(seedJson) {
  const rows = ((seedJson && seedJson.rows) || []).slice()
    .sort((a, b) => a.loopDay - b.loopDay);
  const m = new Map(rows.map((r) => [r.loopDay, r]));
  const pan = (d) => { const r = m.get(d); return (r != null && typeof r.pantryKcal === 'number') ? r.pantryKcal : null; };
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
    const sPan = pan(st.start);
    if (sPan == null) continue;
    for (const d of st.days) {
      if (d <= st.start || d < ELIGIBLE_DAY) continue;
      if (d - 3 < st.start) continue;
      const a = pan(d - 3), b = pan(d - 2), c = pan(d - 1), e = pan(d);
      if (a == null || b == null || c == null || e == null) continue;
      if (a > b && b > c && c > e && e <= 0.90 * sPan) {
        return { day: d, standDownDay: st.start, standDownPantry: sPan, pantry: e };
      }
    }
  }
  return null;
}

function analyzeSeedSensorSupply(seedJson) {
  const base = analyzeSeedGatediseng(seedJson);
  const c = base.candidates.c_standDownTrend;
  const cInd = fireCIndependent(seedJson);
  const cDay = c == null ? null : c.day;
  const cIndDay = cInd == null ? null : cInd.day;
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
    cIndependentDay: cIndDay,
    crossCheckMatch: cDay === cIndDay,
    e: e == null ? null : Object.assign({}, e, { lead: leadE }),
    leadComparison: { beatsOrTies, strictlyBeats },
  };
}

// roles: object mapping seed number -> 'candidate' | 'cost' | 'context'.
// A seed with no role is treated as 'candidate' (defensive default;
// the pilot CLI always passes explicit roles).
function summarizeSensorSupply(allSeeds, roles) {
  const rmap = roles || {};
  const seeds = allSeeds.map((sj) => {
    const a = analyzeSeedSensorSupply(sj);
    a.role = rmap[sj.seed] || 'candidate';
    return a;
  });
  const candidates = seeds.filter((s) => s.role === 'candidate');
  const stillCollapsing = candidates.filter((s) => s.collapsing);
  const excluded = candidates.filter((s) => !s.collapsing);
  const costSeeds = seeds.filter((s) => s.role === 'cost');
  const costSurvivors = costSeeds.filter((s) => s.survived);
  const newlyCollapsingCost = costSeeds.filter((s) => s.collapsing);
  const firingCostSurvivors = costSurvivors.filter((s) => s.e != null).map((s) => s.seed);
  const n = stillCollapsing.length;
  const countGate = n >= 4;
  const membershipChange = newlyCollapsingCost.length > 0;
  const fireLeg = n > 0 && stillCollapsing.every((s) => s.e != null);
  const tieLeg = n > 0 && stillCollapsing.every((s) => s.leadComparison.beatsOrTies);
  const strictLeg = n > 0
    && stillCollapsing.filter((s) => s.leadComparison.strictlyBeats).length >= Math.ceil(0.50 * n);
  const leadOneLeg = n > 0
    && stillCollapsing.filter((s) => s.e != null && s.e.lead >= 1).length >= Math.ceil(0.75 * n);
  const costLeg = costSurvivors.length > 0
    && firingCostSurvivors.length <= Math.floor(0.25 * costSurvivors.length);
  const crossCheckMismatches = seeds.filter((s) => !s.crossCheckMatch).map((s) => s.seed);
  const crossCheckLeg = crossCheckMismatches.length === 0;
  const legs = { countGate, fireLeg, tieLeg, strictLeg, leadOneLeg, costLeg, crossCheckLeg };
  let verdict;
  if (!countGate || membershipChange || !crossCheckLeg) verdict = 'INSUFFICIENT-DATA';
  else verdict = Object.values(legs).every(Boolean) ? 'PILOT-GO' : 'PILOT-NO-GO';
  return {
    seeds,
    stillCollapsing: stillCollapsing.map((s) => s.seed),
    excludedCandidates: excluded.map((s) => s.seed),
    costSurvivors: costSurvivors.map((s) => s.seed),
    newlyCollapsingCost: newlyCollapsingCost.map((s) => s.seed),
    firingCostSurvivors,
    crossCheckMismatches,
    legs,
    verdict,
  };
}

if (require.main === module) {
  let text = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (c) => { text += c; });
  process.stdin.on('end', () => {
    const seeds = text.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
    // Roles are passed via env SENSOR_SUPPLY_ROLES as JSON, or default
    // to candidate for every seed (caller must pass roles for a real
    // pilot judgment; the summary echoes the roles used).
    let roles = null;
    try { roles = process.env.SENSOR_SUPPLY_ROLES ? JSON.parse(process.env.SENSOR_SUPPLY_ROLES) : null; } catch (e) { roles = null; }
    process.stdout.write(JSON.stringify(summarizeSensorSupply(seeds, roles), null, 2) + '\n');
  });
}

module.exports = { fireEstar, fireCIndependent, analyzeSeedSensorSupply, summarizeSensorSupply };
