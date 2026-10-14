#!/usr/bin/env node
// scripts/aa-calibrate-feastdoor-20261014.js — A/A noise calibration for the
// FEASTDOOR r13-only follow-up (r25b rotcal precedent, docs/MEASUREMENT.md).
//
// Sims are deterministic: identical seeds give identical results, so the
// calibration compares the r13-only substrate across TWO DISJOINT seed sets
// (A: 11/22/33/44/55/66/77/88, B: 12/23/34/45/56/67/78/89), 8 seeds x 2
// policies each. For each metric, |d| observations are taken per-policy
// (leadcourt A vs B, belongseek A vs B) and pooled (16 runs A vs B); the
// p90 follows the rotcal convention: sorted[min(n-1, floor(0.9n))].
// The hungryDays guardrail bound is one-sided: armed <= r13-only x (1+p90rel).
//
// Usage:
//   FEASTSCALE_R13=1 SEEDS="11,22,33,44,55,66,77,88" LEVER=feastdoor-aa-a \
//     OUT=evidence/2026-10-14/feastdoor-aa-a.json node scripts/measure-feastdoor-r13only-20261014.js
//   FEASTSCALE_R13=1 SEEDS="12,23,34,45,56,67,78,89" LEVER=feastdoor-aa-b \
//     OUT=evidence/2026-10-14/feastdoor-aa-b.json node scripts/measure-feastdoor-r13only-20261014.js
//   node scripts/aa-calibrate-feastdoor-20261014.js evidence/2026-10-14/feastdoor-aa-a.json evidence/2026-10-14/feastdoor-aa-b.json
'use strict';
const fs = require('fs');

const METRICS = ['hungryDays', 'starveDeaths', 'national', 'foodDeeds', 'table'];

function p90(sorted) {
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor(0.9 * sorted.length));
  return sorted.slice().sort((a, b) => a - b)[idx];
}
function mean(a) { return a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0; }

function aggFor(runs, pred) {
  const rs = runs.filter(pred);
  const s = (f) => rs.reduce((t, r) => t + (f(r) || 0), 0);
  return {
    hungryDays: s(r => r.hungryDays),
    starveDeaths: s(r => r.starveDeaths),
    national: s(r => r.national),
    foodDeeds: s(r => r.foodDeeds),
    table: s(r => r.table),
  };
}

const [aFile, bFile] = process.argv.slice(2);
const A = JSON.parse(fs.readFileSync(aFile, 'utf8'));
const B = JSON.parse(fs.readFileSync(bFile, 'utf8'));
const aA = aggFor(A.runs, () => true), aB = aggFor(B.runs, () => true);
const lA = aggFor(A.runs, r => r.policy === 'leadcourt'), lB = aggFor(B.runs, r => r.policy === 'leadcourt');
const bA = aggFor(A.runs, r => r.policy === 'belongseek'), bB = aggFor(B.runs, r => r.policy === 'belongseek');

const report = {};
for (const m of METRICS) {
  const pairs = [
    [lA[m], lB[m], 'leadcourt'], [bA[m], bB[m], 'belongseek'], [aA[m], aB[m], 'pooled16'],
  ];
  const abs = pairs.map(([x, y]) => Math.abs(y - x));
  const rel = pairs.map(([x, y]) => (x > 0 ? Math.abs(y - x) / x : (y > 0 ? Infinity : 0)));
  report[m] = {
    A: aA[m], B: aB[m],
    perGroup: pairs.map(([x, y, g]) => ({ group: g, A: x, B: y })),
    abs: { values: abs, mean: +mean(abs).toFixed(2), p90: +p90(abs).toFixed(2), max: Math.max(...abs) },
    rel: {
      values: rel.map(v => (v === Infinity ? 'Inf' : +v.toFixed(3))),
      mean: rel.some(v => v === Infinity) ? 'Inf' : +mean(rel).toFixed(3),
      p90: rel.some(v => v === Infinity) ? 'Inf' : +p90(rel).toFixed(3),
      max: rel.some(v => v === Infinity) ? 'Inf' : +Math.max(...rel).toFixed(3),
    },
  };
}
console.log(JSON.stringify(report, null, 1));

// One-sided bound recommendation for hungryDays (the pre-registered
// relative guardrail), using the pooled+per-policy p90 relative |d|.
const hd = report.hungryDays;
console.log('\nBOUND RECOMMENDATION:');
console.log(`  hungryDays: r13-only x (1 + p90rel) = r13-only x ${(1 + (hd.rel.p90 === 'Inf' ? 0 : hd.rel.p90)).toFixed(3)}  [p90rel=${hd.rel.p90}, sets A=${hd.A} B=${hd.B}]`);
const sd = report.starveDeaths;
console.log(`  starvation: r13-only + p90abs = r13-only + ${sd.abs.p90}  [sets A=${sd.A} B=${sd.B}]`);
