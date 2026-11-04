#!/usr/bin/env node
// test-envelope-b.js — proof for scripts/analyze-envelope-b.js.
// Pure synthetic series for the fraction-parameterized logic, PLUS
// the corpus reproduction check: the 0.85 column on the EXISTING
// 28-leg tracer corpus from run fleshout-loop-b-20261103T2130Z
// must reproduce the streakfree-cost evidence's descriptive numbers
// for the verified legs (tie 9/10, strict 8/10, lead-one 9/10,
// mean lead (v**) 3.1 vs (c) 1.9, survivor firing 1/16) and the
// per-seed variant days in that evidence's table. Any mismatch is
// a STOP condition: this test FAILS rather than adjusting the
// corpus or the analyzer. No new sims, no game load, no writes
// except the process exit code. Run: node scripts/test-envelope-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { fireEnvelope, fireVariantAt, summarizeEnvelope } = require('./analyze-envelope-b');
const { fireFallback } = require('./analyze-streakfree-cost-b');

let n = 0;
function check(cond, label) {
  n++;
  assert.ok(cond, label);
  console.log('ok ' + n + ' - ' + label);
}

// Synthetic series builder: one disengaged stretch starting day 1.
// rows: [{loopDay, gateEngaged:false, pantryKcal, hungryStreak}]
function series(pantries) {
  // pantries: array of [day, pantry] pairs, days ascending from 1.
  return { seed: 999101, rows: pantries.map(([d, p]) => ({ loopDay: d, gateEngaged: false, pantryKcal: p, hungryStreak: 1 })) };
}

// 1. Hover at 0.898 of peak (the 83248 shape): peak 17430, day-16
// pantry 15650 = 0.8979. Only fraction 0.90 fires on that evening;
// 0.85/0.87/0.88 must NOT fire via E1 there (falls = 2 by then).
(function () {
  const s = series([[1, 17430], [2, 17430], [3, 17430], [4, 17430], [5, 17430], [6, 17430], [7, 17430], [8, 17430], [9, 17430], [10, 17430], [11, 17430], [12, 17430], [13, 17430], [14, 17430], [15, 17000], [16, 15650]]);
  // falls by day 16: day 15 (17000 < 17430) and day 16 (15650 < 17000) = 2. Good.
  check(fireEnvelope(s, 0.90) != null && fireEnvelope(s, 0.90).day === 16 && fireEnvelope(s, 0.90).clause === 'E1-envelope', 'hover 0.898 fires at 0.90 on day 16 via E1');
  check(fireEnvelope(s, 0.88) == null, 'hover 0.898 does NOT fire at 0.88');
  check(fireEnvelope(s, 0.87) == null, 'hover 0.898 does NOT fire at 0.87');
  check(fireEnvelope(s, 0.85) == null, 'hover 0.898 does NOT fire at 0.85');
})();

// 2. Deep fall to 0.84 of peak fires at EVERY tabled fraction.
(function () {
  const s = series([[1, 10000], [2, 10000], [3, 10000], [4, 10000], [5, 10000], [6, 10000], [7, 10000], [8, 9500], [9, 8400]]);
  for (const fr of [0.85, 0.87, 0.88, 0.90]) {
    const f = fireEnvelope(s, fr);
    check(f != null && f.day === 9 && f.clause === 'E1-envelope', 'deep fall 0.84 fires at ' + fr + ' on day 9');
  }
})();

// 3. Mid fall to 0.86 of peak fires at 0.87/0.88/0.90 but NOT 0.85
// (the 83201-survivor day-14 shape: 20300/23550 = 0.862).
(function () {
  const s = series([[1, 23550], [2, 23550], [3, 23550], [4, 23550], [5, 23550], [6, 23550], [7, 23550], [8, 23550], [9, 23550], [10, 23550], [11, 23550], [12, 23550], [13, 22000], [14, 20300]]);
  check(fireEnvelope(s, 0.85) == null, 'mid fall 0.862 does NOT fire at 0.85');
  const f87 = fireEnvelope(s, 0.87);
  check(f87 != null && f87.day === 14, 'mid fall 0.862 fires at 0.87 on day 14');
  const f90 = fireEnvelope(s, 0.90);
  check(f90 != null && f90.day === 14, 'mid fall 0.862 fires at 0.90 on day 14');
})();

// 4. E2 cliff is fraction-invariant: a fall to 0.60 of peak fires
// via E2 at every fraction, on the same day.
(function () {
  const s = series([[1, 10000], [2, 10000], [3, 10000], [4, 10000], [5, 10000], [6, 10000], [7, 10000], [8, 6000]]);
  for (const fr of [0.85, 0.87, 0.88, 0.90]) {
    const f = fireEnvelope(s, fr);
    check(f != null && f.day === 8 && f.clause === 'E2-cliff', 'cliff 0.60 fires via E2 at ' + fr + ' on day 8');
  }
})();

// 5. Fallback (F) is fraction-invariant (imported verbatim): falls
// >= 3 and pantry <= 0.80 peak, no streak condition — use streak 0.
(function () {
  const s = { seed: 999102, rows: [[1, 10000], [2, 10000], [3, 10000], [4, 10000], [5, 10000], [6, 10000], [7, 10000], [8, 9500], [9, 9000], [10, 8000]].map(([d, p]) => ({ loopDay: d, gateEngaged: false, pantryKcal: p, hungryStreak: 0 })) };
  const f = fireFallback(s);
  check(f != null && f.day === 10 && f.clause === 'F-fallback', 'fallback fires day 10 with streak 0 (verbatim F)');
  // E rule must NOT fire here (streak 0 fails the streak condition).
  check(fireEnvelope(s, 0.90) == null, 'E rule does not fire with streak 0');
})();

// 6. Variant first-firing: earliest of (e) and (F) wins; tie goes to (e).
(function () {
  // F fires day 10 (falls 3, 0.80 peak, streak 0 so E cannot fire).
  const sF = { seed: 999103, rows: [[1, 10000], [2, 10000], [3, 10000], [4, 10000], [5, 10000], [6, 10000], [7, 10000], [8, 9500], [9, 9000], [10, 8000]].map(([d, p]) => ({ loopDay: d, gateEngaged: false, pantryKcal: p, hungryStreak: 0 })) };
  const vF = fireVariantAt(sF, 0.85);
  check(vF != null && vF.day === 10 && vF.clause === 'F-fallback', 'variant picks F when only F fires');
  // Both fire day 9: E at 0.85 (0.84 peak, streak 1) and F cannot
  // (falls only 2) — so variant is E. Then a both-fire tie case:
  // falls 3 and fraction 0.80 on day 10 with streak 1: E fires day
  // 10 (0.80 <= 0.85, falls 3) and F fires day 10 too; tie -> E.
  const sTie = { seed: 999104, rows: [[1, 10000], [2, 10000], [3, 10000], [4, 10000], [5, 10000], [6, 10000], [7, 10000], [8, 9500], [9, 9000], [10, 8000]].map(([d, p]) => ({ loopDay: d, gateEngaged: false, pantryKcal: p, hungryStreak: 1 })) };
  const vTie = fireVariantAt(sTie, 0.85);
  check(vTie != null && vTie.day === 10 && vTie.clause === 'E1-envelope', 'variant tie on one day goes to E, not F');
})();

// 7. Fraction 0.85 on the 0.85 analyzer reproduces fireEstar85's
// day on a synthetic cliff series (sanity: parameterization does
// not shift the base rule). (fireEstar85 imported for this check.)
(function () {
  const { fireEstar85 } = require('./analyze-streakfree-cost-b');
  const s = series([[1, 20000], [2, 20000], [3, 20000], [4, 20000], [5, 20000], [6, 20000], [7, 20000], [8, 19000], [9, 17000], [10, 16000]]);
  const a = fireEstar85(s);
  const b = fireEnvelope(s, 0.85);
  check(a != null && b != null && a.day === b.day && a.clause === b.clause, '0.85 parameterized rule matches fireEstar85 day+clause on synthetic series');
})();

// 8. CORPUS REPRODUCTION CHECK (step 2 of the task — STOP on mismatch).
(function () {
  const corpusPath = path.join(__dirname, '..', 'evidence', '2026-11-03', 'sim-streakfree-cost-b-tracer.jsonl');
  const text = fs.readFileSync(corpusPath, 'utf8');
  const seeds = text.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
  check(seeds.length === 28, 'corpus has 28 legs');
  const sum = summarizeEnvelope(seeds);
  check(JSON.stringify(sum.verifiedCollapsing) === JSON.stringify([83230, 83248, 83263, 83272, 83281, 83284, 83286, 83336, 83341, 83379]), 'verified collapsing legs are the expected 10');
  check(sum.verifiedSurvivors.length === 16, 'verified survivors are 16');
  check(JSON.stringify(sum.unverifiedSeeds) === JSON.stringify([83373, 83377]), 'unverified legs are exactly 83373, 83377, reported separately');
  const col85 = sum.perFraction['0.85'];
  check(col85.fireCount === 10, 'repro 0.85: fire 10/10');
  check(col85.tieCount === 9, 'repro 0.85: tie 9/10');
  check(col85.strictCount === 8, 'repro 0.85: strict 8/10');
  check(col85.leadOneCount === 9, 'repro 0.85: lead-one 9/10');
  check(col85.meanLeadV === 3.1, 'repro 0.85: mean lead (v**) 3.1');
  check(col85.meanLeadC === 1.9, 'repro 0.85: mean lead (c) 1.9');
  check(col85.survivorFireCount === 1 && JSON.stringify(col85.survivorFireSeeds) === JSON.stringify([83201]), 'repro 0.85: survivor firing 1/16 (83201)');
  // Per-seed variant days at 0.85 must match the streakfree-cost
  // evidence table for the 10 verified collapsing legs.
  const expectedV = { 83230: 13, 83248: 18, 83263: 19, 83272: 20, 83281: 28, 83284: 21, 83286: 16, 83336: 21, 83341: 14, 83379: 23 };
  const expectedC = { 83230: 15, 83248: 17, 83263: 20, 83272: 21, 83281: 28, 83284: 23, 83286: 17, 83336: 25, 83341: 15, 83379: 24 };
  for (const s of sum.seeds.filter((x) => x.collapsing && x.verified)) {
    const v = s.perFraction['0.85'].v;
    check(v != null && v.day === expectedV[s.seed], 'repro 0.85: variant day seed ' + s.seed + ' = ' + expectedV[s.seed]);
    check(s.c != null && s.c.day === expectedC[s.seed], 'repro 0.85: (c) day seed ' + s.seed + ' = ' + expectedC[s.seed]);
  }
  // The unverified legs never enter the verified aggregates: the
  // 0.85 verified tie count (9) is computed over 10 legs, not 12.
  check(sum.verifiedCollapsing.length === 10 && !sum.verifiedCollapsing.includes(83373) && !sum.verifiedCollapsing.includes(83377), 'unverified legs excluded from verified denominators');
})();

console.log('test-envelope-b: ' + n + '/' + n + ' checks passed');
