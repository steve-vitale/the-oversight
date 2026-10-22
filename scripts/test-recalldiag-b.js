// test-recalldiag-b.js — proof for the expedition-recall trigger DIAG.
//
// Usage: node scripts/test-recalldiag-b.js
//   No env needed (pure offline data processing; no sims, no RNG).
//   Reads the corpus read-only for the DET section's corpus-run leg; the
//   judged corpus numbers are produced by taxonomy-recalldiag-b.js itself.
//
// Proof sections:
//   A. Fixture RED->GREEN: synthetic meal rows exercise trigger fire on the
//      exact signature and no-fire on EACH single missing condition
//      (not-away, no-majority, no-cliff, thin-baseline, baseline-too-low,
//      no-pack-draw, pantry-not-ample for Rule B), episode grouping, and
//      lead-time computation.
//   B. Wound retainer RED->GREEN: synthetic say lines exercise maul/hurting
//      extraction from deathDayLines AND lossDayLines, the 3d window, name
//      matching (victim-only), and non-victim exclusion.
//   C. DET: two in-memory runDiag() passes are byte-identical.

'use strict';
var assert = require('assert');
var tax = require('./taxonomy-recalldiag-b.js');

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
// 10 away-days at 3000, then the collapse under test.
function rowsWith(tail) {
  var rows = [];
  for (var d = 1; d <= 10; d++) rows.push(meal(d));
  tail.forEach(function (r, i) { rows.push(meal(11 + i, r)); });
  var m = new Map();
  rows.forEach(function (r) { m.set(r.d, r); });
  return m;
}
function pantry(v) {
  var m = new Map();
  for (var d = 1; d <= 20; d++) m.set(d, v === undefined ? 20000 : v);
  return m;
}

// ---------- A. trigger fixtures ----------
t('A1 fires on the exact signature (Rule A)', function () {
  var rows = rowsWith([{ produced: 200, drawn: 800 }]);
  var r = tax.triggerDay(rows, pantry(), 11, false);
  assert.ok(r.fire, 'should fire: ' + JSON.stringify(r));
  assert.ok(r.ratio <= 0.40, 'ratio=' + r.ratio);
});
t('A2 Rule B fires with ample pantry, Rule A unaffected', function () {
  var rows = rowsWith([{ produced: 200, drawn: 800 }]);
  assert.ok(tax.triggerDay(rows, pantry(20000), 11, true).fire, 'B should fire');
  assert.ok(tax.triggerDay(rows, pantry(20000), 11, false).fire, 'A should fire');
});
t('A3 no fire when not away', function () {
  var rows = rowsWith([{ produced: 200, drawn: 800, away: false }]);
  var r = tax.triggerDay(rows, pantry(), 11, false);
  assert.ok(!r.fire && r.why === 'not-away', 'why=' + r.why);
});
t('A4 no fire without away-majority (3/7 away)', function () {
  var rows = new Map();
  for (var d = 1; d <= 10; d++) rows.set(d, meal(d, { away: false }));
  // only 3 away-days in the window d5..d11
  [5, 6, 11].forEach(function (d) { rows.set(d, meal(d, { away: true })); });
  rows.set(11, meal(11, { away: true, produced: 200, drawn: 800 }));
  var r = tax.triggerDay(rows, pantry(), 11, false);
  assert.ok(!r.fire && r.why === 'no-majority', 'why=' + JSON.stringify(r));
});
t('A5 no fire without a cliff (steady production)', function () {
  var rows = rowsWith([{ produced: 2900, drawn: 800 }]);
  var r = tax.triggerDay(rows, pantry(), 11, false);
  assert.ok(!r.fire && r.why === 'no-cliff', 'why=' + JSON.stringify(r));
});
t('A6 cliff boundary: 0.41x baseline does not fire', function () {
  var rows = rowsWith([{ produced: 1230, drawn: 800 }]); // 1230/3000 = 0.41
  var r = tax.triggerDay(rows, pantry(), 11, false);
  assert.ok(!r.fire && r.why === 'no-cliff', 'why=' + JSON.stringify(r));
});
t('A7 baseline with exactly 3 away-days still fires (minimum viable baseline)', function () {
  // NOTE: with complete rows the thin-baseline guard is unreachable —
  // away-majority (>=4/7 incl. today) implies >=3 away-days before today —
  // but the guard stays as defensive code for sparse data. This fixture
  // pins the 3-day minimum boundary.
  var rows = new Map();
  [8, 9, 10].forEach(function (d) { rows.set(d, meal(d, { away: true })); });
  rows.set(11, meal(11, { away: true, produced: 200, drawn: 800 }));
  for (var d = 5; d <= 7; d++) rows.set(d, meal(d, { away: false }));
  var r = tax.triggerDay(rows, pantry(), 11, false);
  assert.ok(r.fire, 'should fire on 3-day baseline: ' + JSON.stringify(r));
});
t('A8 no fire when the patch never produced (baseline < 800)', function () {
  var rows = new Map();
  for (var d = 1; d <= 10; d++) rows.set(d, meal(d, { produced: 500 }));
  rows.set(11, meal(11, { produced: 100, drawn: 800 }));
  var r = tax.triggerDay(rows, pantry(), 11, false);
  assert.ok(!r.fire && r.why === 'baseline-too-low', 'why=' + JSON.stringify(r));
});
t('A9 no fire without pack-draw dependence', function () {
  var rows = rowsWith([{ produced: 200, drawn: 100 }]); // 100 < 0.3*2000
  var r = tax.triggerDay(rows, pantry(), 11, false);
  assert.ok(!r.fire && r.why === 'no-pack-draw', 'why=' + JSON.stringify(r));
});
t('A10 Rule B does not fire on thin pantry; Rule A still fires (knowledge caveat)', function () {
  var rows = rowsWith([{ produced: 200, drawn: 800 }]);
  var rb = tax.triggerDay(rows, pantry(3000), 11, true);
  assert.ok(!rb.fire && rb.why === 'pantry-not-ample', 'why=' + JSON.stringify(rb));
  assert.ok(tax.triggerDay(rows, pantry(3000), 11, false).fire, 'A fires');
});
t('A11 episodes group fire-days with gaps <= 2', function () {
  var eps = tax.episodes([{ d: 8 }, { d: 10 }, { d: 11 }, { d: 14 }]);
  assert.strictEqual(eps.length, 2, 'eps=' + JSON.stringify(eps));
  assert.deepStrictEqual([eps[0].first, eps[0].last], [8, 11]);
  assert.deepStrictEqual([eps[1].first, eps[1].last], [14, 14]);
});
t('A12 lead time uses the last episode ending within 7d of death', function () {
  var lt = tax.leadTime([{ d: 8 }, { d: 20 }, { d: 21 }], 21);
  assert.strictEqual(lt.lead, 1, 'lead=' + JSON.stringify(lt));
  assert.strictEqual(lt.episode.first, 20);
});
t('A13 lead time 0 when the only episode is older than 7d', function () {
  var lt = tax.leadTime([{ d: 5 }], 21);
  assert.strictEqual(lt.lead, 0, 'lead=' + JSON.stringify(lt));
});
t('A14 fire on death day gives lead 0', function () {
  var lt = tax.leadTime([{ d: 21 }], 21);
  assert.strictEqual(lt.lead, 0, 'lead=' + JSON.stringify(lt));
});

// ---------- B. wound retainer fixtures ----------
function corpusWith(lines, lossLines) {
  return { deathDayLines: lines || [], lossDayLines: lossLines || [] };
}
function say(d, line) { return { d: d, line: line }; }

t('B1 maul beat in deathDayLines names the victim', function () {
  var c = corpusWith([say(36, '\uD83E\uDE78 The Inspiration mauled Zinaida (-12 health) over 1 round.')]);
  var h = tax.woundBeats(c, 'Zinaida', 36);
  assert.strictEqual(h.length, 1, 'hits=' + JSON.stringify(h));
  assert.strictEqual(h[0].kind, 'maul');
  assert.strictEqual(h[0].dmg, 12);
});
t('B2 hurting beat in lossDayLines names the victim (the Kenneth/Laura gap)', function () {
  var c = corpusWith([], [say(143, '\uD83E\uDE78 The Big Beast mauled Kenneth (-85 health) over 2 rounds.')]);
  var h = tax.woundBeats(c, 'Kenneth', 143);
  assert.strictEqual(h.length, 1, 'hits=' + JSON.stringify(h));
  assert.strictEqual(h[0].dmg, 85);
  var c2 = corpusWith([], [say(65, '\uD83E\uDE79 Laura is still hurting (11 HP) \u2014 no healer at haven.')]);
  var h2 = tax.woundBeats(c2, 'Laura', 65);
  assert.strictEqual(h2.length, 1, 'hits=' + JSON.stringify(h2));
  assert.strictEqual(h2[0].kind, 'hurting');
  assert.strictEqual(h2[0].hp, 11);
});
t('B3 beat outside the 3d window does not attach', function () {
  var c = corpusWith([say(30, '\uD83E\uDE78 The Inspiration mauled Zinaida (-12 health) over 1 round.')]);
  assert.strictEqual(tax.woundBeats(c, 'Zinaida', 36).length, 0);
});
t('B4 wound line naming someone else does not attach to the deceased', function () {
  var c = corpusWith([say(36, '\uD83E\uDE78 The Inspiration mauled Clarence (-17 health) over 1 round.')]);
  assert.strictEqual(tax.woundBeats(c, 'Zinaida', 36).length, 0);
});
t('B5 hurting beat 2d before death attaches (Zihao d41 -> d43)', function () {
  var c = corpusWith([say(41, '\uD83E\uDE79 Zihao is still hurting (2 HP) \u2014 no healer at haven.')]);
  var h = tax.woundBeats(c, 'Zihao', 43);
  assert.strictEqual(h.length, 1, 'hits=' + JSON.stringify(h));
});
t('B6 non-wound lines never match (gossip, patch, pack)', function () {
  var c = corpusWith([
    say(36, 'You catch fragments by the fire \u2014 Zinaida telling Wakana about Devon.'),
    say(36, 'This patch is worked out \u2014 step to another green patch and forage again.'),
  ]);
  assert.strictEqual(tax.woundBeats(c, 'Zinaida', 36).length, 0);
});

// ---------- C. DET ----------
t('C1 two in-memory runDiag() passes are byte-identical', function () {
  var a = JSON.stringify(tax.runDiag());
  var b = JSON.stringify(tax.runDiag());
  assert.strictEqual(a, b, 'lengths ' + a.length + ' vs ' + b.length);
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
