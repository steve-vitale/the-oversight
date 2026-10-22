// scripts/lib/luck-instrument.js — binomial luck instrumentation (rogue P0-6, 2026-10-22).
//
// Pagnutti's technique: quantify each sim run's luck as a binomial process so a
// reviewer can distinguish "unlucky run" from "broken design". This module is
// pure math — no game dependencies, no RNG, no state. It is DESCRIPTIVE only:
// nothing here can tune gameplay, grant pity, or change a roll. (Forage pity,
// combat pity, and run-to-run variance compression are forbidden by canon;
// this file contains none of them.)
//
// Input per run: roll streams recorded by the panel observer from the game's
// honest binary chance rolls via G.luckRoll(stream, p, hit). Streams:
//   hunt  — player hunt strikes (per-roll chance, capped at 0.95)
//   trap  — player tile traps (per-trap-night chance, shyness-weighted)
//   snare — villager snare returns (p = 0.4)
//   pit   — villager pit returns (p = 0.18)
//   fish  — player line fishing (per-cast chance)
// Because p varies within a stream (hunt/trap/fish), tails are computed under
// the Poisson-binomial distribution (exact DP), not a fixed-p binomial.
//
// Per stream per run we report:
//   n, k, expected (sum of p), observedRate, lower/upper/twoSided tail probs,
//   luckPct = P(X <= k) — the run's luck percentile, ~Uniform(0,1) under the
//     null. 0 = catastrophically unlucky, 0.5 = neutral, 1 = charmed.
//   tercile: 'unlucky' | 'neutral' | 'lucky' (conditional-format buckets)
// Per run overall: Stouffer's inverse-normal combination of the stream
// percentiles, weighted by sqrt(n) — a single "was this run lucky?" number.
'use strict';

const STREAMS = Object.freeze([
  { id: 'hunt', label: 'Hunt luck', metricId: 'luckHunt' },
  { id: 'trap', label: 'Trap luck', metricId: 'luckTrap' },
  { id: 'snare', label: 'Snare luck', metricId: 'luckSnare' },
  { id: 'pit', label: 'Pit luck', metricId: 'luckPit' },
  { id: 'fish', label: 'Fishing luck', metricId: 'luckFish' },
]);

// Contract metric specs for the luck columns. Appended to
// scripts/balance-metrics.json as new OPTIONAL fields — never rename/remove
// existing entries. direction neutral + reviewChanges false: the scorecard
// renders them as always-'descriptive' columns with zero verdict power.
const CONTRACT_METRICS = Object.freeze([
  ...STREAMS.map(s => ({
    id: s.metricId,
    label: s.label + ' percentile',
    unit: 'luck percentile (0 = unlucky, 0.5 = neutral, 1 = lucky), observable cases',
    direction: 'neutral',
    tolerance: 0.1,
    reviewChanges: false,
  })),
  {
    id: 'luckOverall',
    label: 'Combined run luck percentile',
    unit: 'luck percentile (0 = unlucky, 0.5 = neutral, 1 = lucky), observable cases',
    direction: 'neutral',
    tolerance: 0.1,
    reviewChanges: false,
  },
]);

// Exact Poisson-binomial tail probabilities for independent trials with
// success probabilities ps and k observed successes. DP over the
// distribution; O(n^2). Falls back to a normal approximation with continuity
// correction for very long streams (n > 5000) so a pathological run can't
// stall a child.
function pbTails(ps, k) {
  const n = ps.length;
  if (!n) return { n: 0, k: 0, expected: 0, lower: null, upper: null, twoSided: null };
  const expected = ps.reduce((a, b) => a + b, 0);
  if (n > 5000) {
    const variance = ps.reduce((a, p) => a + p * (1 - p), 0);
    const sd = Math.sqrt(Math.max(variance, 1e-12));
    const zLow = (k + 0.5 - expected) / sd, zHigh = (k - 0.5 - expected) / sd;
    const lower = normCdf(zLow), upper = 1 - normCdf(zHigh);
    return { n, k, expected, lower, upper, twoSided: Math.min(1, 2 * Math.min(lower, upper)) };
  }
  const dp = new Float64Array(n + 1); dp[0] = 1;
  for (const p of ps) {
    const q = 1 - p;
    for (let j = n; j >= 1; j--) dp[j] = dp[j] * q + dp[j - 1] * p;
    dp[0] *= q;
  }
  let lower = 0, upper = 0;
  for (let j = 0; j <= k && j <= n; j++) lower += dp[j];
  for (let j = Math.max(k, 0); j <= n; j++) upper += dp[j];
  const twoSided = Math.min(1, 2 * Math.min(lower, upper));
  return { n, k, expected, lower, upper, twoSided };
}

// Standard normal CDF (Abramowitz & Stegun 7.1.26).
function normCdf(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

// Inverse standard normal CDF (Acklam's approximation).
function normInv(p) {
  const q = Math.min(Math.max(p, 1e-12), 1 - 1e-12);
  const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
  const plow = 0.02425, phigh = 1 - plow;
  let x;
  if (q < plow) {
    const r = Math.sqrt(-2 * Math.log(q));
    x = (((((c[0] * r + c[1]) * r + c[2]) * r + c[3]) * r + c[4]) * r + c[5]) /
        ((((d[0] * r + d[1]) * r + d[2]) * r + d[3]) * r + 1);
  } else if (q > phigh) {
    const r = Math.sqrt(-2 * Math.log(1 - q));
    x = -(((((c[0] * r + c[1]) * r + c[2]) * r + c[3]) * r + c[4]) * r + c[5]) /
           ((((d[0] * r + d[1]) * r + d[2]) * r + d[3]) * r + 1);
  } else {
    const r = q - 0.5, r2 = r * r;
    x = (((((a[0] * r2 + a[1]) * r2 + a[2]) * r2 + a[3]) * r2 + a[4]) * r2 + a[5]) * r /
        (((((b[0] * r2 + b[1]) * r2 + b[2]) * r2 + b[3]) * r2 + b[4]) * r2 + 1);
  }
  return x;
}

function tercile(luckPct) {
  if (luckPct == null) return 'none';
  if (luckPct < 1 / 3) return 'unlucky';
  if (luckPct > 2 / 3) return 'lucky';
  return 'neutral';
}

// rolls: array of {p, hit}. Returns the per-stream summary, or null when the
// stream saw no rolls this run (metric value null → "not observed").
function summarizeStream(rolls) {
  const ps = [], n = rolls.length;
  let k = 0;
  for (const r of rolls) {
    const p = Number(r.p);
    if (!Number.isFinite(p) || p < 0 || p > 1) continue;
    ps.push(p);
    if (r.hit) k++;
  }
  if (!ps.length) return null;
  const tails = pbTails(ps, k);
  const luckPct = tails.lower; // P(X <= k): the run's luck percentile
  return {
    n: ps.length, k, expected: tails.expected,
    observedRate: k / ps.length, expectedRate: tails.expected / ps.length,
    lower: tails.lower, upper: tails.upper, twoSided: tails.twoSided,
    luckPct, tercile: tercile(luckPct),
  };
}

// streams: { streamId: [{p, hit}, ...] }. Returns { streams, overall } where
// overall is the Stouffer-combined luck percentile across non-empty streams.
function summarizeRun(streams) {
  const out = {};
  for (const s of STREAMS) out[s.id] = summarizeStream((streams && streams[s.id]) || []);
  const parts = Object.values(out).filter(Boolean);
  let overall = null;
  if (parts.length) {
    let num = 0, den = 0;
    for (const st of parts) {
      const w = Math.sqrt(st.n);
      num += w * normInv(st.luckPct);
      den += w * w;
    }
    const z = num / Math.sqrt(den);
    const pct = normCdf(z);
    overall = { z, luckPct: pct, tercile: tercile(pct), streams: parts.length };
  }
  return { streams: out, overall };
}

// Flat per-run metric values for the panel's metrics object: luckPct per
// stream, null when the stream had no rolls.
function metricValues(summary) {
  const vals = {};
  for (const s of STREAMS) vals[s.metricId] = summary.streams[s.id] ? summary.streams[s.id].luckPct : null;
  vals.luckOverall = summary.overall ? summary.overall.luckPct : null;
  return vals;
}

module.exports = { STREAMS, CONTRACT_METRICS, pbTails, normCdf, normInv, tercile, summarizeStream, summarizeRun, metricValues };
