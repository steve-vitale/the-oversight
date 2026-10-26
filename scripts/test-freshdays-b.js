#!/usr/bin/env node
// test-freshdays-b.js — proof for the pantryFreshDays decomposition (DIAG only).
//
// sim-freshdays-b, 2026-10-26. Two legs:
//  (A) UNIT: decompose() on a fake Game re-implements pantryFreshKcal()'s
//      exclusion order and is checked bucket by bucket — including the
//      pemmican case: a real pemmican bar (foodKind 'meat', foodState
//      'pemmican', food.js:1118) is NOT excluded by pantryFreshKcal(),
//      whose pemmican clause tests foodKind, not foodState.
//  (B) CORPUS: the freshdays-b corpus (8 seeds) is valid, untruncated,
//      and every high-value snapshot (reported freshDays >= 50) has
//      component-sum coverage >= 0.95 of the reported freshKcal AND
//      rebuilt days (countedSum / burnMean) within 1% of reported days.
// Reproduction vs the preservesched band (38/38 days, 327 total bound
// days, 3 named values) is REPORTED, not asserted: code may have moved
// since the inflow-b run, and a reproduction miss re-labels the band
// (fresh band) without changing the coverage verdict. Exit non-zero on
// any (A)/(B) failure.
'use strict';
const assert = require('assert');
const { decompose } = require('./freshdays-capture');
const { loadCorpus, reproduction, highDays, validity, SEEDS } = require('./analyze-freshdays-b');

// ---- (A) unit: fake Game with the real pantryFreshKcal() formula ----
function fakeGame(pantry, day, burnHistory) {
  const state = { village: { pantry, burnHistory, roster: ['a', 'b'] }, scholar: { day } };
  const G = {
    state,
    isSpoiled(it) {
      return !!it && it.spoilDay !== undefined && it.spoilDay !== null && it.spoilDay <= day;
    },
    spoilBonusDays() { return 0; },
    pantryFreshKcal() {
      let t = 0;
      for (const it of pantry) {
        if (!it) continue;
        if (it.foodState === 'preserved' || it.foodState === 'rendered' || (it.foodKind || '') === 'pemmican') continue;
        try { if (this.isSpoiled(it)) continue; } catch (e) {}
        t += (it.kcalEach || 0) * (it.units || 1);
      }
      return t;
    },
    pantryFreshDays() {
      const fk = this.pantryFreshKcal();
      if (fk <= 0) return 0;
      const hist = burnHistory.filter((x) => x > 0);
      if (!hist.length) return fk / (2 * 2000);
      return fk / (hist.reduce((a, b) => a + b, 0) / hist.length);
    },
  };
  return G;
}
(function unit() {
  const pantry = [
    { name: 'Smoked deer', foodKind: 'meat', foodState: 'preserved', kcalEach: 500, units: 2, spoilDay: 40 }, // excluded: preserved (1000)
    { name: 'Tallow', foodKind: 'fat', foodState: 'rendered', kcalEach: 500, units: 1, spoilDay: 100 }, // excluded: rendered (500)
    { name: 'Pemmican-kind oddity', foodKind: 'pemmican', foodState: 'ready', kcalEach: 700, units: 1, spoilDay: 100 }, // excluded: foodKind pemmican (700)
    { name: 'Old greens', foodKind: 'plant', foodState: 'ready', kcalEach: 900, units: 1, spoilDay: 5 }, // excluded: spoiled at day 10 (900)
    { name: 'Cooked stew', foodKind: 'plant', foodState: 'cooked', kcalEach: 1000, units: 2, spoilDay: 14, edible: true }, // counted 2000
    { name: 'Acorns in shell', foodKind: 'nut', foodState: 'in_shell', kcalEach: 400, units: 1, spoilDay: 12, edible: false }, // counted 400 (inedible until shelled)
    { name: 'Deer carcass', foodKind: 'meat', foodState: 'carcass', kcalEach: 600, units: 1, spoilDay: 12, edible: false }, // counted 600
    { name: 'Pemmican bar', foodKind: 'meat', foodState: 'pemmican', kcalEach: 800, units: 1, spoilDay: 130, edible: true }, // COUNTED 800: foodKind is 'meat', not 'pemmican'
    { name: 'Ghost stack', foodKind: 'plant', foodState: 'ready', kcalEach: 250, units: 0, spoilDay: 12, edible: true }, // counted 250 via (units || 1)
  ];
  const G = fakeGame(pantry, 10, [2000, 2000]);
  const snap = decompose(G);
  assert.strictEqual(snap.countedSum, 2000 + 400 + 600 + 800 + 250, 'counted sum');
  assert.strictEqual(snap.freshKcalReported, snap.countedSum, 'reported freshKcal equals counted sum');
  assert.strictEqual(snap.coverage, 1, 'coverage exactly 1 on unit pantry');
  assert.strictEqual(snap.excluded.preserved, 1000, 'preserved excluded');
  assert.strictEqual(snap.excluded.rendered, 500, 'rendered excluded');
  assert.strictEqual(snap.excluded.pemmicanKind, 700, 'foodKind pemmican excluded');
  assert.strictEqual(snap.excluded.spoiled, 900, 'spoiled excluded');
  assert.strictEqual(snap.byState.pemmican, 800, 'real pemmican bars are COUNTED as fresh (foodKind miss)');
  assert.strictEqual(snap.byState.in_shell, 400, 'in-shell (inedible) nuts counted');
  assert.strictEqual(snap.byState.carcass, 600, 'carcass counted');
  assert.strictEqual(snap.edibleFalse, 1000, 'inedible counted total');
  assert.strictEqual(snap.zeroUnit, 250, 'zero-unit stack counted at kcalEach x 1');
  assert.strictEqual(snap.bySpoil.immortal, 0, 'no immortal stock in unit pantry');
  assert.strictEqual(snap.rebuiltDays, snap.freshDaysReported, 'rebuilt days equal reported days on unit pantry');
  console.log('UNIT PASS: decompose mirrors pantryFreshKcal(); pemmican-state bars counted, in-shell + carcass counted, zero-unit counted');
})();

// ---- (B) corpus ----
const corpus = loadCorpus();
assert.strictEqual(corpus.length, 8, '8 corpus files');
for (const per of corpus) {
  assert.strictEqual(per.policy, 'competent-nofeast', 'band policy, seed ' + per.seed);
  assert.strictEqual(per.cookTruncated, false, 'cook not truncated, seed ' + per.seed);
  assert.strictEqual(per.freshCookTruncated, false, 'fresh cook not truncated, seed ' + per.seed);
  assert.ok((per.freshDaily || []).length > 0, 'daily snapshots present, seed ' + per.seed);
}
console.log('CORPUS VALIDITY PASS: 8 seeds, competent-nofeast, no truncation');
const val = validity(corpus);
console.log('validity: ' + JSON.stringify(val.map((v) => [v.seed, v.dailyN, v.cookN])));

const rep = reproduction(corpus);
console.log(`REPRO: totalBound=${rep.totalBound} (preservesched 327) expected38Present=${rep.expected38Present}/38 missing=${JSON.stringify(rep.missing)}`);
for (const n of rep.named) {
  console.log(`REPRO NAMED: seed ${n.seed} day ${n.day} quoted=${n.quoted} substrateFd=${n.substrateFd} diff=${n.diff} snapFd=${n.snapFd} snapCoverage=${n.snapCoverage}`);
}
const reproOk = rep.totalBound === 327 && rep.expected38Present === 38 &&
  rep.named.every((n) => n.substrateFd != null && Math.abs(n.substrateFd - n.quoted) <= 0.15);
console.log('REPRO ' + (reproOk ? 'PASS (preservesched band reproduced)' : 'FAIL (band re-labels as fresh band; coverage verdict unaffected)'));

const hi = highDays(corpus);
console.log(`HIGH: ${hi.nSnapshots} snapshots >= 50 days over ${hi.nDays} distinct days; minCoverage=${hi.minCoverage} maxCoverage=${hi.maxCoverage} maxReported=${hi.maxReported}`);
assert.ok(hi.nSnapshots > 0, 'at least one reproduced high-value snapshot');
assert.ok(hi.minCoverage != null && hi.minCoverage >= 0.95, 'coverage >= 0.95 on every high snapshot');
assert.ok(hi.shares.length > 0 && hi.shares[0].bucket, 'one named dominant component identified');
console.log('COVERAGE PASS: min coverage ' + hi.minCoverage + '; dominant component: ' + hi.shares[0].bucket + ' (' + (hi.shares[0].share * 100).toFixed(1) + '%)');
for (const d of hi.denom) {
  if (d.reported != null && d.burnMean) {
    const rebuilt = d.freshKcal / d.burnMean;
    assert.ok(Math.abs(rebuilt - d.reported) / d.reported <= 0.01, 'rebuilt days within 1% of reported, seed ' + d.seed + ' day ' + d.day);
  }
}
console.log('DENOMINATOR IDENTITY PASS: countedSum/burnMean rebuilds reported days within 1% on all high snapshots');
console.log('ALL PROOF CHECKS PASS (reproduction reported separately above)');
