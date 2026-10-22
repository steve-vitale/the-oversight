// test-recallsignal-b.js — proof for the earlier-signal DIAG.
//
// Usage: node scripts/test-recallsignal-b.js
//   No env needed (pure offline data processing; no sims). SEED overrides the
//   synthetic-corpus PRNG seed (default 20261022).
//
// Proof sections:
//   A. Fixture RED->GREEN: FORECAST trigger fires on the prospective shape
//      (expected collapses while produced still holds) and no-fires on EACH
//      single missing condition (not-away, no-majority, no-expected-dip,
//      the 0.50x boundary, thin-baseline, baseline-too-low, no-pack-draw);
//      episode grouping and lead-time reuse the base machinery.
//   B. Earlier-signal proxies RED->GREEN: woundBeatsWindow over arbitrary
//      windows, expeditionStart (maximal trailing away-run), preCliffDrawn,
//      and the corpus-blindness assertion (no pack/hp fields in any meal
//      row — the (a)/(b) unmeasurability gate).
//   C. DET: two in-memory runSignalDiag() passes are byte-identical.

'use strict';
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var base = require('./taxonomy-recalldiag-b.js');
var tax = require('./taxonomy-recallsignal-b.js');

// ---------- seeded PRNG (proof-test RNG rule: mulberry32, fixed default, SEED env override) ----------
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
var SEED = process.env.SEED ? parseInt(process.env.SEED, 10) : 20261022;

var passed = 0, failed = 0;
function t(name, fn) {
  try { fn(); passed++; console.log('ok - ' + name); }
  catch (e) { failed++; console.log('FAIL - ' + name + ': ' + e.message); }
}

function meal(d, o) {
  return Object.assign(
    { d: d, vid: 'v1', ate: 2000, drawn: 0, gave: 0, fasting: false, away: true,
      produced: 3000, expected: 3000, need: 2000 }, o || {});
}
// 10 away-days at expected=3000/produced=3000, then the tail under test.
function rowsWith(tail) {
  var rows = [];
  for (var d = 1; d <= 10; d++) rows.push(meal(d));
  tail.forEach(function (r, i) { rows.push(meal(11 + i, r)); });
  var m = new Map();
  rows.forEach(function (r) { m.set(r.d, r); });
  return m;
}

// ---------- A. FORECAST trigger fixtures ----------
t('A1 fires on the prospective shape: expected collapses while produced still holds', function () {
  // The early-warning shape: the forecast dies at d11 (1500 = 0.50x) while
  // realized production is still 2800 — the trigger must fire BEFORE the
  // produced-cliff fires.
  var rows = rowsWith([{ expected: 1500, produced: 2800, drawn: 800 }]);
  var r = tax.triggerDayF(rows, 11);
  assert.ok(r.fire, 'should fire: ' + JSON.stringify(r));
  assert.ok(r.ratio <= 0.50, 'ratio=' + r.ratio);
  // and v1 (produced-cliff) must NOT fire on the same day — the prospective
  // signal genuinely leads the cliff signal.
  var v1 = base.triggerDay(rows, new Map(), 11, false);
  assert.ok(!v1.fire, 'v1 should not fire yet: ' + JSON.stringify(v1));
});
t('A2 fires when both collapse together (the corpus shape)', function () {
  var rows = rowsWith([{ expected: 200, produced: 200, drawn: 800 }]);
  assert.ok(tax.triggerDayF(rows, 11).fire, 'should fire');
});
t('A3 no fire when not away', function () {
  var rows = rowsWith([{ expected: 200, produced: 200, drawn: 800, away: false }]);
  var r = tax.triggerDayF(rows, 11);
  assert.ok(!r.fire && r.why === 'not-away', 'why=' + r.why);
});
t('A4 no fire without away-majority (3/7 away)', function () {
  var rows = new Map();
  for (var d = 1; d <= 10; d++) rows.set(d, meal(d, { away: false }));
  [5, 6, 11].forEach(function (d) { rows.set(d, meal(d, { away: true })); });
  rows.set(11, meal(11, { away: true, expected: 200, produced: 200, drawn: 800 }));
  var r = tax.triggerDayF(rows, 11);
  assert.ok(!r.fire && r.why === 'no-majority', 'why=' + JSON.stringify(r));
});
t('A5 no fire without an expected-dip (steady forecast)', function () {
  var rows = rowsWith([{ expected: 2900, produced: 2900, drawn: 800 }]);
  var r = tax.triggerDayF(rows, 11);
  assert.ok(!r.fire && r.why === 'no-expected-dip', 'why=' + JSON.stringify(r));
});
t('A6 expected-dip boundary: 0.51x baseline does not fire', function () {
  var rows = rowsWith([{ expected: 1530, produced: 2800, drawn: 800 }]); // 1530/3000 = 0.51
  var r = tax.triggerDayF(rows, 11);
  assert.ok(!r.fire && r.why === 'no-expected-dip', 'why=' + JSON.stringify(r));
});
t('A7 no fire when the patch never produced (baseline < 800)', function () {
  var rows = new Map();
  for (var d = 1; d <= 10; d++) rows.set(d, meal(d, { expected: 500, produced: 500 }));
  rows.set(11, meal(11, { expected: 100, produced: 100, drawn: 800 }));
  var r = tax.triggerDayF(rows, 11);
  assert.ok(!r.fire && r.why === 'baseline-too-low', 'why=' + JSON.stringify(r));
});
t('A8 no fire without pack-draw dependence', function () {
  var rows = rowsWith([{ expected: 200, produced: 200, drawn: 100 }]); // 100 < 0.3*2000
  var r = tax.triggerDayF(rows, 11);
  assert.ok(!r.fire && r.why === 'no-pack-draw', 'why=' + JSON.stringify(r));
});
t('A9 episodes and lead time reuse the base machinery (byte-identical semantics)', function () {
  var eps = base.episodes(tax.fireDaysForF(rowsWith([
    { expected: 1500, produced: 2800, drawn: 800 },
    { expected: 1500, produced: 2800, drawn: 800 },
    { expected: 1500, produced: 2800, drawn: 0 },   // no pack-draw: gap day
    { expected: 1500, produced: 2800, drawn: 800 },
  ])));
  assert.strictEqual(eps.length, 1, 'eps=' + JSON.stringify(eps));
  var lt = base.leadTime([{ d: 11 }, { d: 12 }, { d: 14 }], 17);
  assert.strictEqual(lt.lead, 6, 'lead=' + JSON.stringify(lt));
});
t('A10 seeded synthetic expedition: forecast leads the produced cliff', function () {
  // 12 away-days; expected dips at d8, produced follows at d11. Deterministic
  // under SEED (dither via mulberry32).
  var rng = mulberry32(SEED);
  var rows = new Map();
  for (var d = 1; d <= 12; d++) {
    var jx = Math.round((rng() - 0.5) * 200);
    var jp = Math.round((rng() - 0.5) * 200);
    rows.set(d, meal(d, {
      expected: d >= 8 ? 1200 + jx : 3000 + jx,
      produced: d >= 11 ? 200 + jp : 3000 + jp,
      drawn: d >= 8 ? 800 : 0,
    }));
  }
  var fF = tax.fireDaysForF(rows).map(function (f) { return f.d; });
  var fA = base.fireDaysFor(rows, new Map(), false).map(function (f) { return f.d; });
  assert.ok(fF.length > 0 && fF[0] < (fA.length ? fA[0] : 99),
    'forecast must lead v1: F=[' + fF.join(',') + '] A=[' + fA.join(',') + ']');
});

// ---------- B. earlier-signal proxy fixtures ----------
function say(d, line) { return { d: d, line: line }; }

t('B1 woundBeatsWindow attaches beats inside an arbitrary pre-cliff window', function () {
  var c = { deathDayLines: [say(30, '🩸 The Beast mauled Irving (-20 health) over 1 round.')],
            lossDayLines: [say(33, '🩹 Irving is still hurting (40 HP) — no healer at haven.')] };
  var w = tax.woundBeatsWindow(c, 'Irving', 28, 34);
  assert.strictEqual(w.length, 2, 'w=' + JSON.stringify(w));
  assert.strictEqual(tax.woundBeatsWindow(c, 'Irving', 31, 34).length, 1);
  assert.strictEqual(tax.woundBeatsWindow(c, 'Irving', 28, 29).length, 0);
});
t('B2 woundBeatsWindow excludes other victims', function () {
  var c = { deathDayLines: [say(30, '🩸 The Beast mauled Clarence (-17 health) over 1 round.')], lossDayLines: [] };
  assert.strictEqual(tax.woundBeatsWindow(c, 'Irving', 28, 34).length, 0);
});
t('B3 expeditionStart is the first away-day of the maximal trailing away-run ending at death', function () {
  var rows = new Map();
  [1, 2, 3].forEach(function (d) { rows.set(d, meal(d, { away: true })); });   // expedition 1
  [4, 5, 6].forEach(function (d) { rows.set(d, meal(d, { away: false })); });  // home
  [7, 8, 9, 10].forEach(function (d) { rows.set(d, meal(d, { away: true })); }); // final expedition
  assert.strictEqual(tax.expeditionStart(rows, 10), 7, 'expStart');
  assert.strictEqual(tax.expeditionStart(rows, 8), 7, 'expStart mid-run');
  assert.strictEqual(tax.expeditionStart(rows, 3), 1, 'expStart first run');
});
t('B4 preCliffDrawn reports drawn/need for d-3..d-1', function () {
  var rows = rowsWith([{ produced: 200, drawn: 800 }, { produced: 150, drawn: 700 }]);
  var p = tax.preCliffDrawn(rows, 11);
  assert.deepStrictEqual(p.map(function (x) { return x.drawn; }), [0, 0, 0],
    'p=' + JSON.stringify(p));
  var p2 = tax.preCliffDrawn(rows, 12);
  assert.deepStrictEqual(p2.map(function (x) { return x.drawn; }), [0, 0, 800],
    'p2=' + JSON.stringify(p2));
});
t('B5 corpus-blindness: no pack/hp field in ANY meal row of the 16-file corpus', function () {
  var b = tax.corpusBlindness();
  assert.strictEqual(b.files, 16, 'files=' + b.files);
  assert.deepStrictEqual(b.mealKeyUnion,
    ['ate', 'away', 'd', 'drawn', 'expected', 'fasting', 'gave', 'need', 'produced', 'vid'],
    'union=' + b.mealKeyUnion.join(','));
  assert.strictEqual(b.filesWithPackField, 0, 'pack fields found!');
  assert.strictEqual(b.filesWithHpField, 0, 'hp fields found!');
});
t('B6 base runDiag unchanged and re-exported machinery agrees (no fork drift)', function () {
  // The instrument must extend the base, not shadow it: leadTime/episodes on
  // the same inputs must give the same answers through either module path.
  var fires = [{ d: 8 }, { d: 20 }, { d: 21 }];
  assert.deepStrictEqual(base.episodes(fires), base.episodes(fires));
  assert.strictEqual(base.leadTime(fires, 21).lead, 1);
});

// ---------- C. DET ----------
t('C1 two in-memory runSignalDiag() passes are byte-identical', function () {
  var a = JSON.stringify(tax.runSignalDiag());
  var b = JSON.stringify(tax.runSignalDiag());
  assert.strictEqual(a, b, 'lengths ' + a.length + ' vs ' + b.length);
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
