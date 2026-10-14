#!/usr/bin/env node
// THROTTLE A/A VARIANCE CALIBRATION (fleshout-b, 2026-10-14).
//
// From the two A/A repeats (same side, identical seeds) measures the suite's
// own noise floor and proposes VARIANCE-CALIBRATED guardrails for the
// throttle-confirm adjudication — replacing the hand-set ±10d median bound
// and the armed ≤ before+max(5,25%) starvation bound (metric review 2, 3, 6).
//
// Proposed guardrails (written into the evidence pre-registration header):
//   G1 median survival (one-sided): armed_median >= before_median - ceil(p90 of
//      |per-seed A/A day deltas|). Fail only if the median regresses more
//      than the suite's own p90 single-seed swing.
//   G2 starvation (denominator-aware): armed starve-per-100-village-days
//      <= before starve-per-100-village-days + p90 of |per-seed A/A
//      per-100-day starve-rate deltas|. The 100-villager-day rate is also
//      measured and reported (the confirm rows lack villager-days, so the
//      confirm re-adjudication uses the village-day denominator on both
//      sides — identical-seed pairing keeps it honest).
//
// Usage: node scripts/calibrate-throttle-aa-20261014.js <aa-a.json> <aa-b.json>
//        [out-calibration.json]
'use strict';
const fs = require('fs');
const [aPath, bPath, outPath] = process.argv.slice(2);
const A = JSON.parse(fs.readFileSync(aPath, 'utf8'));
const B = JSON.parse(fs.readFileSync(bPath, 'utf8'));

const med = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
const mean = (xs) => xs.reduce((t, x) => t + x, 0) / Math.max(1, xs.length);
const q = (xs, p) => { const s = [...xs].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const key = (r) => r.policy + ':' + r.seed;
const bMap = new Map(B.rows.map(r => [key(r), r]));
const pairs = A.rows.map(r => [r, bMap.get(key(r))]).filter(([, b]) => b);

const dDays = pairs.map(([a, b]) => b.days - a.days);
const absD = dDays.map(Math.abs);
const dayNoise = { p50: med(absD), p90: q(absD, 0.9), p95: q(absD, 0.95), max: Math.max(...absD), meanAbs: mean(absD) };

// Starvation-rate per seed: per-100 village-days (starve*100/days) and
// per-100 villager-days (instrumented) — deltas between identical-side runs.
const rateD = (r) => (r.days > 0 ? 100 * r.starveDeaths / r.days : 0);
const rateVD = (r) => r.starvePer100vd || 0;
const dRateD = pairs.map(([a, b]) => rateD(b) - rateD(a)).map(Math.abs);
const dRateVD = pairs.map(([a, b]) => rateVD(b) - rateVD(a)).map(Math.abs);
const starveNoise = {
  countPerSeed: { p50: med(dDays.map((_, i) => Math.abs(pairs[i][1].starveDeaths - pairs[i][0].starveDeaths))), p90: q(pairs.map(([a, b]) => Math.abs(b.starveDeaths - a.starveDeaths)), 0.9) },
  per100days: { p50: med(dRateD), p90: q(dRateD, 0.9), max: Math.max(...dRateD) },
  per100vd: { p50: med(dRateVD), p90: q(dRateVD, 0.9), max: Math.max(...dRateVD) },
};

const medianBoundDays = Math.ceil(dayNoise.p90);
const starveRateBound = starveNoise.per100days.p90;

const cal = {
  nPairs: pairs.length,
  dayNoise, starveNoise,
  guardrails: {
    G1_median_survival_days: {
      rule: 'armed_median >= before_median - MEDIAN_BOUND_DAYS',
      MEDIAN_BOUND_DAYS: medianBoundDays,
      derivation: 'ceil(p90 of |per-seed A/A day deltas|)',
    },
    G2_starvation_per100days: {
      rule: 'armed_rate <= before_rate + STARVE_RATE_BOUND',
      STARVE_RATE_BOUND: +starveRateBound.toFixed(3),
      derivation: 'p90 of |per-seed A/A starve-per-100-village-days deltas|',
    },
    note_vd: 'per-100-villager-day noise measured for future runs; confirm re-adjudication uses the village-day denominator (confirm rows lack villager-days)',
    G2vd_p90_per100vd: +starveNoise.per100vd.p90.toFixed(3),
  },
  honesty: {
    limitation: 'master moved since the confirm (loop-A r24 landings + ship-loop commits); this A/A ran on the current tip, so the noise floor is an estimate of the confirm suite\u2019s, not identical to it. Do not over-claim.',
    aMedian: med(A.rows.map(r => r.days)), bMedian: med(B.rows.map(r => r.days)),
    aTotalStarve: A.rows.reduce((t, r) => t + r.starveDeaths, 0),
    bTotalStarve: B.rows.reduce((t, r) => t + r.starveDeaths, 0),
  },
};

console.log('=== THROTTLE A/A VARIANCE CALIBRATION ===');
console.log(`pairs: ${pairs.length} (8 seeds x 2 policies, same side twice)`);
console.log(`day-noise |Δ|: mean=${dayNoise.meanAbs.toFixed(1)}d p50=${dayNoise.p50}d p90=${dayNoise.p90}d p95=${dayNoise.p95}d max=${dayNoise.max}d`);
console.log(`starve-count |Δ| per seed: p50=${starveNoise.countPerSeed.p50} p90=${starveNoise.countPerSeed.p90}`);
console.log(`starve-rate |Δ| per 100 village-days: p50=${starveNoise.per100days.p50.toFixed(3)} p90=${starveNoise.per100days.p90.toFixed(3)} max=${starveNoise.per100days.max.toFixed(3)}`);
console.log(`starve-rate |Δ| per 100 villager-days: p50=${starveNoise.per100vd.p50.toFixed(3)} p90=${starveNoise.per100vd.p90.toFixed(3)}`);
console.log('\n--- proposed variance-calibrated guardrails ---');
console.log(`G1 median survival: armed_median >= before_median - ${medianBoundDays}d  (one-sided; ceil of p90 |Δdays|)`);
console.log(`G2 starvation: armed_rate <= before_rate + ${starveRateBound.toFixed(3)} (per 100 village-days; p90 |Δrate|)`);
if (outPath) { fs.writeFileSync(outPath, JSON.stringify(cal, null, 1)); console.error('wrote ' + outPath); }
