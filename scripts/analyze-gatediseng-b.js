#!/usr/bin/env node
// analyze-gatediseng-b.js — DISENGAGED-STATE candidate census for
// sim-gatediseng-b (DIAG ONLY). Pure functions over evening series;
// no game load, no file writes, no RNG. Reads seed .jsonl objects
// on stdin (one per line, each with a `rows` evening series) and
// prints a JSON summary to stdout. The four candidate rules are
// EXACTLY as fixed in evidence/2026-11-01/sim-gatediseng-b-prereg.md:
//
//   (a) TOTAL-SLIDE: D >= 8, disengaged, pantry(D) <= 0.80 *
//       pantry(D-5), and three consecutive strictly-decreasing
//       falls ending at D (D-3 > D-2 > D-1 > D in pantry terms).
//   (b) HYSTERESIS: D >= 8, disengaged, freshDays > 2.0,
//       hungryStreak < 3, gateOn true. Corpus rows (dipslide /
//       falsefire) record gateEngaged but not gateOn; for those,
//       gateOn is null and the firing is flagged assumedGateOn
//       (armed legs, DEPOSITGATE=1 by construction — see prereg).
//   (c) STAND-DOWN + TREND: S = first evening of the current
//       disengaged stretch; D > S in the same stretch, D >= 8,
//       three consecutive falls ending at D with the whole fall
//       window at/after S (D-3 >= S), and pantry(D) <= 0.90 *
//       pantry(S).
//   (d) FLOOR: D >= 8, disengaged, pantry(D) < 10000.
//
// Firing day per candidate = FIRST evening satisfying its rule.
// "In time" (collapsed trajectories only) = firing day <=
// firstStarvationDay - 3 (first death with cause 'starvation';
// if a collapsed trajectory has no starvation death, its
// collapse day — daysAlive — is used with the same margin).
'use strict';

const FLOOR = 10000;
const HYSTERESIS_DAYS = 2.0;
const SLIDE_FRACTION = 0.80;
const TREND_FRACTION = 0.90;
const ELIGIBLE_DAY = 8;
const IN_TIME_MARGIN = 3;

function rowMap(series) {
  const m = new Map();
  for (const r of (series || [])) {
    if (r != null && typeof r.loopDay === 'number') m.set(r.loopDay, r);
  }
  return m;
}
function pantry(m, d) {
  const r = m.get(d);
  return (r != null && typeof r.pantryKcal === 'number') ? r.pantryKcal : null;
}
function engaged(m, d) {
  const r = m.get(d);
  return r != null && r.gateEngaged === true;
}
function threeFalls(m, d) {
  const a = pantry(m, d - 3), b = pantry(m, d - 2), c = pantry(m, d - 1), e = pantry(m, d);
  if (a == null || b == null || c == null || e == null) return false;
  return a > b && b > c && c > e;
}

function candidateA(m, days) {
  for (const d of days) {
    if (d < ELIGIBLE_DAY || engaged(m, d)) continue;
    const p = pantry(m, d), p5 = pantry(m, d - 5);
    if (p == null || p5 == null) continue;
    if (p <= SLIDE_FRACTION * p5 && threeFalls(m, d)) {
      return { day: d, pantry: p, pantryMinus5: p5, fallPct: 1 - p / p5 };
    }
  }
  return null;
}
function candidateB(m, days) {
  for (const d of days) {
    if (d < ELIGIBLE_DAY || engaged(m, d)) continue;
    const r = m.get(d);
    if (r == null || typeof r.freshDays !== 'number' || typeof r.hungryStreak !== 'number') continue;
    if (r.gateOn === false) continue;
    if (r.freshDays > HYSTERESIS_DAYS && r.hungryStreak < 3) {
      return { day: d, freshDays: r.freshDays, hungryStreak: r.hungryStreak, assumedGateOn: r.gateOn == null };
    }
  }
  return null;
}
function disengagedStretches(m, days) {
  const stretches = [];
  let cur = null;
  for (const d of days) {
    if (!engaged(m, d)) {
      if (cur == null) cur = { start: d, days: [] };
      cur.days.push(d);
    } else if (cur != null) { stretches.push(cur); cur = null; }
  }
  if (cur != null) stretches.push(cur);
  return stretches;
}
function candidateC(m, days) {
  const stretches = disengagedStretches(m, days);
  for (const st of stretches) {
    const sPantry = pantry(m, st.start);
    if (sPantry == null) continue;
    for (const d of st.days) {
      if (d <= st.start || d < ELIGIBLE_DAY) continue;
      if (d - 3 < st.start) continue;
      if (threeFalls(m, d)) {
        const p = pantry(m, d);
        if (p != null && p <= TREND_FRACTION * sPantry) {
          return { day: d, standDownDay: st.start, standDownPantry: sPantry, pantry: p, fallPctVsStandDown: 1 - p / sPantry };
        }
      }
    }
  }
  return null;
}
function candidateD(m, days) {
  for (const d of days) {
    if (d < ELIGIBLE_DAY || engaged(m, d)) continue;
    const p = pantry(m, d);
    if (p != null && p < FLOOR) return { day: d, pantry: p };
  }
  return null;
}

function firstStarvationDay(seedJson) {
  const deaths = (seedJson && seedJson.deaths) || [];
  let first = null;
  for (const x of deaths) {
    if (x && x.cause === 'starvation' && typeof x.day === 'number') {
      if (first == null || x.day < first) first = x.day;
    }
  }
  return first;
}

function analyzeSeedGatediseng(seedJson) {
  const series = (seedJson && seedJson.rows) || [];
  const m = rowMap(series);
  const days = series.map((r) => r.loopDay).filter((d) => typeof d === 'number').sort((a, b) => a - b);
  const stretches = disengagedStretches(m, days);
  const startsDisengaged = stretches.length > 0 && stretches[0].start === days[0] && !engaged(m, days[0]);
  const a = candidateA(m, days), b = candidateB(m, days), c = candidateC(m, days), dd = candidateD(m, days);
  const collapsed = seedJson.endReason === 'village-lost' || (typeof seedJson.daysAlive === 'number' && typeof seedJson.days === 'number' && seedJson.daysAlive < seedJson.days);
  const starveDay = firstStarvationDay(seedJson);
  const refDay = starveDay != null ? starveDay : (collapsed ? seedJson.daysAlive : null);
  const inTime = (f) => (f != null && refDay != null) ? (f.day <= refDay - IN_TIME_MARGIN) : null;
  return {
    seed: seedJson.seed,
    endReason: seedJson.endReason || null,
    daysAlive: seedJson.daysAlive != null ? seedJson.daysAlive : null,
    maxWaveUnlocked: seedJson.maxWaveUnlocked != null ? seedJson.maxWaveUnlocked : null,
    survived: !collapsed,
    collapsed,
    firstStarvationDay: starveDay,
    startsDisengaged,
    candidates: {
      a_totalSlide: a == null ? null : Object.assign({}, a, { inTime: inTime(a) }),
      b_hysteresis: b == null ? null : Object.assign({}, b, { inTime: inTime(b) }),
      c_standDownTrend: c == null ? null : Object.assign({}, c, { inTime: inTime(c) }),
      d_floor: dd == null ? null : Object.assign({}, dd, { inTime: inTime(dd) }),
    },
  };
}

function summarizeGatediseng(allSeeds) {
  const seeds = allSeeds.map((sj) => analyzeSeedGatediseng(sj));
  const survivors = seeds.filter((s) => s.survived);
  const collapsedSeeds = seeds.filter((s) => s.collapsed);
  const keys = ['a_totalSlide', 'b_hysteresis', 'c_standDownTrend', 'd_floor'];
  const rates = {};
  for (const k of keys) {
    const firingSurvivors = survivors.filter((s) => s.candidates[k] != null);
    rates[k] = {
      firingSurvivorSeeds: firingSurvivors.map((s) => s.seed),
      firingSurvivorCount: firingSurvivors.length,
      survivorCount: survivors.length,
      firingSurvivorRate: survivors.length === 0 ? null : firingSurvivors.length / survivors.length,
    };
  }
  return { seeds, survivors: survivors.length, collapsed: collapsedSeeds.map((s) => s.seed), rates };
}

if (require.main === module) {
  let text = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (c) => { text += c; });
  process.stdin.on('end', () => {
    const seeds = text.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
    process.stdout.write(JSON.stringify(summarizeGatediseng(seeds), null, 2) + '\n');
  });
}

module.exports = {
  FLOOR, HYSTERESIS_DAYS, SLIDE_FRACTION, TREND_FRACTION, ELIGIBLE_DAY, IN_TIME_MARGIN,
  candidateA, candidateB, candidateC, candidateD, disengagedStretches,
  firstStarvationDay, analyzeSeedGatediseng, summarizeGatediseng,
};
