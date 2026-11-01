#!/usr/bin/env node
// test-entrywindow-confirm-b.js — proof tests for sim-entrywindow-confirm-b.
//
// The confirm changes NO game code and NO policy: it judges the pilot's
// frozen entry-window rule, reused verbatim, on a fresh 12-seed band.
// So this test proves the MEASUREMENT, not a change:
//   (1) the frozen rule is intact in the policy module (pure exports:
//       +99 for an empty entry window, identity otherwise, no bonus);
//   (2) the analyzer's GO/NO-GO boundaries match the prereg exactly
//       (share bar -0.10, haul bar "not down", cost bars);
//   (3) the confirm judge (pair + costs + away secondary +
//       60108-shape veto, with 60126-class divergence as a watch item
//       only) decides the pilot fixture GO and vetoes a synthetic
//       60108-shaped band even when the pair passes;
//   (4) the confirm band is 60201-60212, 12 unique seeds, disjoint
//       from the census (60101-60108), pilot (60121-60128), and
//       fertrot reserve (60129-60132) bands, and is named in the
//       committed prereg file.
// Pure only (no live sims). Live determinism of the reused driver is
// covered by scripts/test-entrywindow-b.js (--live-control/--live-det
// on non-judged seed 60109), re-run alongside this file after the
// prereg commit and before the confirm sims.
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

let pass = 0;
function check(name, fn) {
  try { fn(); pass++; console.log('ok - ' + name); }
  catch (e) { console.error('FAIL - ' + name + ': ' + (e && e.message)); process.exitCode = 1; }
}

const policy = require('./policies/competent-entrywindow-b');
const analyzer = require('./analyze-entrywindow-b');

// Confirm judge, mirroring the prereg exactly (pair + cost bars via
// the analyzer's compareBands, plus the away secondary and the
// 60108-shape veto). Divergence is a watch item: named, never a veto.
function judgeConfirm(baseline, armed, perSeed) {
  const cmp = analyzer.compareBands(baseline, armed);
  const reasons = [];
  if (!(cmp.shareDelta <= -0.10)) reasons.push('pair (a) share bar missed: delta ' + cmp.shareDelta);
  if (!(cmp.haulDelta >= 0)) reasons.push('pair (b) haul bar missed: delta ' + cmp.haulDelta);
  if (armed.starvationDeaths > baseline.starvationDeaths + 1)
    reasons.push('cost starvation bar missed');
  if (baseline.medianSurvival && armed.medianSurvival < 0.8 * baseline.medianSurvival)
    reasons.push('cost median-survival bar missed');
  if (armed.awayDayEnds > baseline.awayDayEnds + 5)
    reasons.push('secondary away-total bar missed: armed ' + armed.awayDayEnds + ' vs baseline ' + baseline.awayDayEnds);
  const shape60108 = [];
  for (const s of (perSeed || [])) {
    if (s.armedAwayEnds >= 10 && s.baselineAwayEnds === 0 && s.armedStarvation > s.baselineStarvation)
      shape60108.push(s.seed);
  }
  if (shape60108.length) reasons.push('60108-shaped seed(s) veto: ' + shape60108.join(','));
  const divergences = (perSeed || []).filter((s) =>
    s.armedShare > s.baselineShare && s.armedHaul < s.baselineHaul).map((s) => s.seed);
  return { go: reasons.length === 0, reasons, divergences, shape60108, compare: cmp };
}

function band(share, haul, median, starv, away) {
  return { failedTripDayShare: share, meanDailyHaul: haul, medianSurvival: median,
    starvationDeaths: starv, awayDayEnds: away };
}

check('frozen rule: penalty constant is 99', () => {
  assert.strictEqual(policy.ENTRYWINDOW_PENALTY, 99);
});
check('frozen rule: empty window +99, paying window identity, unknown identity (no bonus)', () => {
  const adj = policy._adjustedDistance;
  assert.strictEqual(adj({ d: 5 }, 0), 104);
  assert.strictEqual(adj({ d: 5 }, 1), 5);
  assert.strictEqual(adj({ d: 5 }, 7), 5);
  assert.strictEqual(adj({ d: 5 }, null), 5);
  assert.strictEqual(adj({ d: 0 }, 0), 99);
});
check('frozen rule: policy id is the entrywindow variant, not competent', () => {
  assert.strictEqual(policy.entrywindow.id, 'competent-entrywindow-b');
});
check('analyzer: pilot fixture judges GO (share 0.258->0.058, haul 633.7->967.9, costs clean)', () => {
  const cmp = analyzer.compareBands(band(0.258, 633.7, 30, 2, 30), band(0.058, 967.9, 30, 0, 17));
  assert.strictEqual(cmp.go, true);
  assert.strictEqual(cmp.shareDelta, -0.2);
  assert.strictEqual(cmp.haulDelta, 334.2);
});
check('analyzer: share delta exactly -0.10 passes, -0.09 fails', () => {
  assert.strictEqual(analyzer.compareBands(band(0.300, 500, 30, 0, 0), band(0.200, 500, 30, 0, 0)).go, true);
  assert.strictEqual(analyzer.compareBands(band(0.300, 500, 30, 0, 0), band(0.210, 500, 30, 0, 0)).go, false);
});
check('analyzer: haul down by any amount fails even when share passes', () => {
  assert.strictEqual(analyzer.compareBands(band(0.300, 500, 30, 0, 0), band(0.100, 499.9, 30, 0, 0)).go, false);
});
check('analyzer: starvation baseline+2 fails, baseline+1 passes', () => {
  assert.strictEqual(analyzer.compareBands(band(0.300, 500, 30, 1, 0), band(0.100, 500, 30, 3, 0)).go, false);
  assert.strictEqual(analyzer.compareBands(band(0.300, 500, 30, 1, 0), band(0.100, 500, 30, 2, 0)).go, true);
});
check('analyzer: median survival below 0.8x fails', () => {
  assert.strictEqual(analyzer.compareBands(band(0.300, 500, 30, 0, 0), band(0.100, 500, 23, 0, 0)).go, false);
  assert.strictEqual(analyzer.compareBands(band(0.300, 500, 30, 0, 0), band(0.100, 500, 24, 0, 0)).go, true);
});
check('confirm judge: away total +6 fails, +5 passes', () => {
  const b = band(0.300, 500, 30, 0, 10), a6 = band(0.100, 500, 30, 0, 16), a5 = band(0.100, 500, 30, 0, 15);
  assert.strictEqual(judgeConfirm(b, a6, []).go, false);
  assert.strictEqual(judgeConfirm(b, a5, []).go, true);
});
check('confirm judge: 60108-shaped seed vetoes even when the pair passes', () => {
  const b = band(0.300, 500, 30, 0, 0), a = band(0.100, 600, 30, 1, 12);
  const perSeed = [{ seed: 60207, baselineAwayEnds: 0, armedAwayEnds: 12, baselineStarvation: 0, armedStarvation: 1,
    baselineShare: 0.3, armedShare: 0.1, baselineHaul: 500, armedHaul: 600 }];
  const j = judgeConfirm(b, a, perSeed);
  assert.strictEqual(j.go, false);
  assert.deepStrictEqual(j.shape60108, [60207]);
});
check('confirm judge: 60108 shape needs starvation too (away-only seed does not veto)', () => {
  const b = band(0.300, 500, 30, 0, 0), a = band(0.100, 600, 30, 0, 12);
  const perSeed = [{ seed: 60207, baselineAwayEnds: 0, armedAwayEnds: 12, baselineStarvation: 0, armedStarvation: 0,
    baselineShare: 0.3, armedShare: 0.1, baselineHaul: 500, armedHaul: 600 }];
  const j = judgeConfirm(b, a, perSeed);
  assert.strictEqual(j.go, false); // away total 12 > 0+5 still fails the total bar
  assert.deepStrictEqual(j.shape60108, []);
});
check('confirm judge: 60126-class divergence is named but never vetoes', () => {
  const b = band(0.300, 500, 30, 0, 0), a = band(0.100, 600, 30, 0, 0);
  const perSeed = [{ seed: 60203, baselineAwayEnds: 0, armedAwayEnds: 0, baselineStarvation: 0, armedStarvation: 0,
    baselineShare: 0.067, armedShare: 0.100, baselineHaul: 609.7, armedHaul: 235.2 }];
  const j = judgeConfirm(b, a, perSeed);
  assert.strictEqual(j.go, true);
  assert.deepStrictEqual(j.divergences, [60203]);
});
check('confirm band: 60201-60212, 12 unique seeds, disjoint from census/pilot/reserve', () => {
  const confirm = [];
  for (let s = 60201; s <= 60212; s++) confirm.push(s);
  assert.strictEqual(confirm.length, 12);
  assert.strictEqual(new Set(confirm).size, 12);
  const banned = new Set();
  for (let s = 60101; s <= 60108; s++) banned.add(s);
  for (let s = 60121; s <= 60128; s++) banned.add(s);
  for (let s = 60129; s <= 60132; s++) banned.add(s);
  for (const s of confirm) assert(!banned.has(s), 'confirm seed ' + s + ' collides with a prior band');
});
check('confirm band: prereg file names every confirm seed', () => {
  const prereg = fs.readFileSync(path.join(__dirname, '..', 'evidence', '2026-11-01', 'sim-entrywindow-confirm-b-prereg.md'), 'utf8');
  for (let s = 60201; s <= 60212; s++) assert(prereg.includes(String(s)), 'prereg missing seed ' + s);
  assert(prereg.includes('60201-60212') || prereg.includes('60201, 60202'));
});

console.log('test-entrywindow-confirm-b: ' + pass + ' checks passed');
