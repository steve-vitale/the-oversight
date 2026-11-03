#!/usr/bin/env node
// analyze-sensorredesign-b.js — (e*) STAND-DOWN + ENVELOPE + HUNGER
// CORROBORATION analyzer for sim-sensorredesign-b (DIAG ONLY).
// Pure functions over evening series; no game load, no file writes,
// no RNG. The (c) rule is NOT reimplemented here: it is imported
// from the reused scripts/analyze-gatediseng-b.js, and the pilot
// cross-check requires both to agree on (c) first firings.
//
// (e*) rule, exactly as fixed in
// evidence/2026-11-02/sim-sensorredesign-b-prereg.md:
//   S = first evening of the current disengaged stretch.
//   peak(D) = max pantry over S..D in the same stretch.
//   falls(D) = count of evenings t in (S..D] with
//     pantry(t) < pantry(t-1) (cumulative, not consecutive).
//   Fire at the FIRST evening D in the stretch with D > S,
//   D >= 8, disengaged, hungryStreak(D) >= 1, where either:
//     (E1) falls(D) >= 2 AND pantry(D) <= 0.90 * peak(D), or
//     (E2) pantry(D) <= 0.65 * peak(D).
// Reference day per collapsing seed (carried rule): first
// starvation death day, else collapse day (daysAlive).
// Lead = reference day - first firing day; no-fire counts as
// null lead and fails outright (worse than any firing).
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

function analyzeSeedSensorredesign(seedJson) {
  const base = analyzeSeedGatediseng(seedJson);
  const c = base.candidates.c_standDownTrend;
  const e = fireEstar(seedJson);
  const ref = base.firstStarvationDay != null ? base.firstStarvationDay
    : (base.collapsed ? base.daysAlive : null);
  const lead = (f) => (f != null && ref != null) ? (ref - f.day) : null;
  const leadC = lead(c);
  const leadE = lead(e);
  // No-fire counts as negative infinity for the lead-vs-(c) leg.
  const beatsOrTies = (leadE != null) && (leadC == null || leadE >= leadC);
  const strictlyBeats = (leadE != null) && (leadC == null || leadE > leadC);
  return {
    seed: seedJson.seed,
    survived: base.survived,
    collapsed: base.collapsed,
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

function summarizeSensorredesign(allSeeds) {
  const seeds = allSeeds.map((sj) => analyzeSeedSensorredesign(sj));
  const collapsed = seeds.filter((s) => s.collapsed);
  const survivors = seeds.filter((s) => s.survived);
  const timeliness = {
    fired: collapsed.filter((s) => s.e != null).length,
    collapsing: collapsed.length,
    beatsOrTies: collapsed.filter((s) => s.leadComparison.beatsOrTies).length,
    strictlyBeats: collapsed.filter((s) => s.leadComparison.strictlyBeats).length,
    holds: collapsed.length > 0
      && collapsed.every((s) => s.e != null)
      && collapsed.every((s) => s.leadComparison.beatsOrTies)
      && collapsed.filter((s) => s.leadComparison.strictlyBeats).length >= 2,
  };
  const cost = {
    firingSurvivors: survivors.filter((s) => s.e != null).map((s) => s.seed),
    firingSurvivorCount: survivors.filter((s) => s.e != null).length,
    survivorCount: survivors.length,
    holds: survivors.length > 0
      && survivors.filter((s) => s.e != null).length <= Math.floor(0.25 * survivors.length),
  };
  return { seeds, timeliness, cost, verdict: (timeliness.holds && cost.holds) ? 'PILOT-GO' : 'PILOT-NO-GO' };
}

if (require.main === module) {
  let text = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (c) => { text += c; });
  process.stdin.on('end', () => {
    const seeds = text.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
    process.stdout.write(JSON.stringify(summarizeSensorredesign(seeds), null, 2) + '\n');
  });
}

module.exports = {
  ENVELOPE_FRACTION, CLIFF_FRACTION, ELIGIBLE_DAY, STREAK_MIN,
  fireEstar, analyzeSeedSensorredesign, summarizeSensorredesign,
};
