// test-trailstarve-b.js — proof for the extended starvation-channel taxonomy.
//
// Usage: node scripts/test-trailstarve-b.js
//   No env needed (pure offline data processing; no sims, no RNG).
//   Does NOT write into the repo: the corpus is read-only, the DET check
//   compares two in-memory diag runs (diag writes its file only when run
//   directly as a script).
//
// Proof sections:
//   A. Fixture RED->GREEN: synthetic corpora exercise every channel,
//      precedence ordering, the nearest-dawn pantry join, and the cliff
//      boundary. Each fixture asserts the classifier's verdict.
//   B. Corpus RED->GREEN: the sim-deathcause-b corpus carries the OLD
//      taxonomy's verdicts (8/13 unattributed — the published NO-GO);
//      the NEW classifier must name >=12/13 with 0 instrumentErrors, and
//      match the per-death expected primaries.
//   C. DET: two in-memory runDiag() passes are byte-identical.

'use strict';
var path = require('path');
var assert = require('assert');
var taxonomy = require('./taxonomy-trailstarve-b.js');
var diag = require('./diag-trailstarve-b.js');

var VID = 'v_test1';
function meal(d, vid, o) {
  return Object.assign(
    { d: d, vid: vid, ate: 2000, drawn: 0, gave: 0, fasting: false, away: false,
      produced: 2000, expected: 2000, need: 2000 }, o || {});
}
function mkCorpus(o) {
  return {
    seed: 1, policy: 'test',
    deaths: o.deaths || [],
    deathDayLines: o.lines || [],
    daily: o.daily || [],
    starvechan: {
      meals: o.meals || [], deposits: o.deposits || [], homecomings: o.homecomings || [],
      scholarMeals: o.scholarMeals || [], havenDays: o.havenDays || [], rotDays: o.rotDays || [],
      starv: [],
    },
  };
}
function death(day, who) {
  return { day: day, who: who, vid: VID, kind: 'villager', pclass: 'starvation' };
}
// 6 villagers x 15 days of healthy village rows, plus the deceased's own rows.
function villageRows(deceasedRows, prod, ate) {
  var rows = deceasedRows.slice();
  for (var v = 0; v < 5; v++) {
    for (var d = 1; d <= 15; d++) rows.push(meal(d, 'v_other' + v, { produced: prod === undefined ? 2000 : prod, ate: ate === undefined ? 2000 : ate }));
  }
  return rows;
}
function dawns(map) {
  return Object.keys(map).map(function (k) { return { day: +k, pantryKcal: map[k] }; });
}

var passed = 0, failed = 0;
function t(name, fn) {
  try { fn(); passed++; console.log('ok - ' + name); }
  catch (e) { failed++; console.log('FAIL - ' + name + ': ' + e.message); }
}

// ---------- A. fixtures ----------
t('A1 trail-starvation fires on the signature (away + cliff + pack draws + ample pan)', function () {
  var own = [];
  for (var d = 1; d <= 12; d++) own.push(meal(d, VID, { away: true, produced: 3000 }));
  own.push(meal(13, VID, { away: true, ate: 900, drawn: 700, produced: 200 }));
  own.push(meal(14, VID, { away: true, ate: 800, drawn: 700, produced: 150 }));
  own.push(meal(15, VID, { away: true, ate: 700, drawn: 700, produced: 100 }));
  var c = mkCorpus({
    deaths: [death(15, 'Theo')],
    meals: villageRows(own),
    daily: dawns({ 1: 20000, 8: 18000, 15: 9000 }),
  });
  var r = taxonomy.classifyExtended(c.deaths[0], c);
  assert.strictEqual(r.channel, 'trail-starvation', 'channel=' + r.channel);
  assert.ok(r.channelFlags.indexOf('trail-starvation') >= 0);
  assert.ok(r.diagnostics.cliff);
  assert.ok(r.diagnostics.cliffRatio <= 0.35, 'cliffRatio=' + r.diagnostics.cliffRatio);
  assert.strictEqual(r.diagnostics.pantryAtDeath, 9000);
});

t('A2 no cliff (ratio > 0.35) -> trail does NOT fire', function () {
  var own = [];
  for (var d = 1; d <= 15; d++) own.push(meal(d, VID, { away: true, ate: 900, drawn: 700, produced: 2500 }));
  var c = mkCorpus({
    deaths: [death(15, 'Flat')],
    meals: villageRows(own),
    daily: dawns({ 15: 9000 }),
  });
  var r = taxonomy.classifyExtended(c.deaths[0], c);
  assert.ok(r.channelFlags.indexOf('trail-starvation') < 0, 'flags=' + r.channelFlags);
});

t('A3 wound-compounded is primary when it is the whole story', function () {
  var own = [];
  for (var d = 1; d <= 15; d++) own.push(meal(d, VID, { ate: 1700, produced: 1800 }));
  var c = mkCorpus({
    deaths: [death(15, 'Mauled')],
    meals: villageRows(own),
    daily: dawns({ 15: 6000 }),
    lines: [{ d: 14, line: '🩸 The Beast mauled Mauled (−40 health) over 2 rounds.' }],
  });
  var r = taxonomy.classifyExtended(c.deaths[0], c);
  assert.strictEqual(r.channel, 'wound-compounded', 'channel=' + r.channel);
});

t('A4 wound-compounded rides as a flag when inflow-failure is primary', function () {
  var own = [];
  for (var d = 1; d <= 15; d++) own.push(meal(d, VID, { ate: 1100, produced: 1300 }));
  var c = mkCorpus({
    deaths: [death(15, 'Zihao')],
    meals: villageRows(own, 1300, 1100),
    daily: dawns({ 15: 1000 }),
    lines: [{ d: 15, line: '🩹 Zihao is still hurting (2 HP) — no healer at haven.' }],
  });
  var r = taxonomy.classifyExtended(c.deaths[0], c);
  assert.strictEqual(r.channel, 'inflow-failure', 'channel=' + r.channel);
  assert.ok(r.channelFlags.indexOf('wound-compounded') >= 0, 'flags=' + r.channelFlags);
});

t('A5 inflow-failure famine shape (inflow ~0.7x need, pan crashed)', function () {
  var own = [];
  for (var d = 1; d <= 15; d++) own.push(meal(d, VID, { ate: 1100, produced: 1400 }));
  var c = mkCorpus({
    deaths: [death(15, 'Hungry')],
    meals: villageRows(own, 1400, 1100),
    daily: dawns({ 1: 6000, 15: 1120 }),
  });
  var r = taxonomy.classifyExtended(c.deaths[0], c);
  assert.strictEqual(r.channel, 'inflow-failure', 'channel=' + r.channel);
  assert.ok(r.diagnostics.inflowNeedRatio < 0.9, 'ratio=' + r.diagnostics.inflowNeedRatio);
});

t('A6 inflow-failure thin-pool shape (inflow ~1.0x need, pan crashed)', function () {
  var own = [];
  for (var d = 1; d <= 15; d++) own.push(meal(d, VID, { ate: 1700, drawn: 300, produced: 2000 }));
  var c = mkCorpus({
    deaths: [death(15, 'Pool')],
    meals: villageRows(own),
    daily: dawns({ 1: 5350, 15: 500 }),
  });
  var r = taxonomy.classifyExtended(c.deaths[0], c);
  assert.strictEqual(r.channel, 'inflow-failure', 'channel=' + r.channel);
  assert.ok(r.diagnostics.inflowNeedRatio <= 1.05, 'ratio=' + r.diagnostics.inflowNeedRatio);
});

t('A7 inflow-failure does NOT fire when the pantry is ample', function () {
  var own = [];
  for (var d = 1; d <= 15; d++) own.push(meal(d, VID, { ate: 1900, produced: 2000 }));
  var c = mkCorpus({
    deaths: [death(15, 'Fine')],
    meals: villageRows(own),
    daily: dawns({ 15: 16000 }),
  });
  var r = taxonomy.classifyExtended(c.deaths[0], c);
  assert.ok(r.channelFlags.indexOf('inflow-failure') < 0, 'flags=' + r.channelFlags);
});

t('A8 distribution fires (deceased <0.6 while village >=0.9)', function () {
  var own = [];
  for (var d = 1; d <= 15; d++) own.push(meal(d, VID, { ate: 1000, produced: 2000 }));
  var c = mkCorpus({
    deaths: [death(15, 'Hoarded')],
    // village others at 1980/2000 so the village mean stays >= 0.9 even with
    // the deceased's own rows included in the village ledger.
    meals: villageRows(own, 2000, 1980),
    daily: dawns({ 15: 2000 }),
  });
  var r = taxonomy.classifyExtended(c.deaths[0], c);
  // inflow-failure also holds here; distribution outranks it.
  assert.strictEqual(r.channel, 'distribution', 'channel=' + r.channel);
  assert.ok(r.channelFlags.indexOf('inflow-failure') >= 0, 'flags=' + r.channelFlags);
});

t('A9 homecoming-timing fires', function () {
  var own = [];
  for (var d = 1; d <= 15; d++) own.push(meal(d, VID, { ate: 1700, produced: 1800 }));
  var hv = [];
  for (var h = 1; h <= 15; h++) hv.push({ d: h, atHaven: h > 12 });
  var c = mkCorpus({
    deaths: [death(15, 'Late')],
    meals: villageRows(own),
    daily: dawns({ 15: 6000 }),
    havenDays: hv,
    homecomings: [{ d: 16, pantryBefore: 0, pantryAfter: 0, givenKcal: 6000, invBefore: 0, invAfter: 0, awayBefore: true }],
  });
  var r = taxonomy.classifyExtended(c.deaths[0], c);
  assert.strictEqual(r.channel, 'homecoming-timing', 'channel=' + r.channel);
});

t('A10 scholar-from-haul fires and outranks inflow-failure', function () {
  var own = [];
  for (var d = 1; d <= 15; d++) own.push(meal(d, VID, { ate: 1000, produced: 2000 }));
  var hv = [];
  var sch = [];
  for (var h = 1; h <= 15; h++) { hv.push({ d: h, atHaven: h > 7 }); sch.push({ d: h, meal: 2100, atHaven: h > 7 }); }
  var c = mkCorpus({
    deaths: [death(15, 'Skimmed')],
    // village coverage kept < 0.9 so distribution stays out of the way;
    // scholar-from-haul is judged on its own terms against inflow-failure.
    meals: villageRows(own, 2000, 1700),
    daily: dawns({ 15: 2000 }),
    havenDays: hv,
    scholarMeals: sch,
  });
  var r = taxonomy.classifyExtended(c.deaths[0], c);
  assert.strictEqual(r.channel, 'scholar-from-haul', 'channel=' + r.channel);
  assert.ok(r.channelFlags.indexOf('inflow-failure') >= 0, 'flags=' + r.channelFlags);
});

t('A11 rot fires when the sensor sees it (outranks inflow-failure)', function () {
  var own = [];
  var rot = [];
  for (var d = 1; d <= 15; d++) {
    own.push(meal(d, VID, { ate: 1100, produced: 1400 }));
    rot.push({ d: d, rotStock: 0, rotStockFresh: 40000, rotStockPres: 0 });
  }
  var c = mkCorpus({
    deaths: [death(15, 'Rotted')],
    meals: villageRows(own, 1400, 1100),
    daily: dawns({ 15: 1000 }),
    rotDays: rot,
  });
  var r = taxonomy.classifyExtended(c.deaths[0], c);
  assert.strictEqual(r.channel, 'rot', 'channel=' + r.channel);
});

t('A12 mild case stays unattributed (honest miss)', function () {
  var own = [];
  for (var d = 1; d <= 15; d++) own.push(meal(d, VID, { ate: 1700, produced: 1800 }));
  var c = mkCorpus({
    deaths: [death(15, 'Mild')],
    meals: villageRows(own),
    daily: dawns({ 15: 6000 }),
  });
  var r = taxonomy.classifyExtended(c.deaths[0], c);
  assert.strictEqual(r.channel, 'unattributed', 'channel=' + r.channel);
  assert.deepStrictEqual(r.channelFlags, []);
});

t('A13 pantry-at-death uses nearest dawn (gap-day death)', function () {
  var own = [];
  for (var d = 1; d <= 12; d++) own.push(meal(d, VID, { away: true, produced: 3000 }));
  own.push(meal(13, VID, { away: true, ate: 900, drawn: 700, produced: 200 }));
  own.push(meal(14, VID, { away: true, ate: 800, drawn: 700, produced: 150 }));
  own.push(meal(15, VID, { away: true, ate: 700, drawn: 700, produced: 100 }));
  // death on d15 but no dawn row for d13-15: join must fall back to d12.
  var c = mkCorpus({
    deaths: [death(15, 'Gap')],
    meals: villageRows(own),
    daily: dawns({ 1: 20000, 12: 8600 }),
  });
  var r = taxonomy.classifyExtended(c.deaths[0], c);
  assert.strictEqual(r.diagnostics.pantryAtDeath, 8600);
  assert.strictEqual(r.channel, 'trail-starvation', 'channel=' + r.channel);
});

t('A14 trail + wound: primary trail, wound rides as flag', function () {
  var own = [];
  for (var d = 1; d <= 12; d++) own.push(meal(d, VID, { away: true, produced: 3000 }));
  own.push(meal(13, VID, { away: true, ate: 900, drawn: 700, produced: 200 }));
  own.push(meal(14, VID, { away: true, ate: 800, drawn: 700, produced: 150 }));
  own.push(meal(15, VID, { away: true, ate: 700, drawn: 700, produced: 100 }));
  var c = mkCorpus({
    deaths: [death(15, 'Zinaida')],
    meals: villageRows(own),
    daily: dawns({ 15: 10774 }),
    lines: [{ d: 15, line: '🩸 The Inspiration mauled Zinaida (−12 health) over 1 round.' }],
  });
  var r = taxonomy.classifyExtended(c.deaths[0], c);
  assert.strictEqual(r.channel, 'trail-starvation', 'channel=' + r.channel);
  assert.deepStrictEqual(r.channelFlags, ['trail-starvation', 'wound-compounded']);
});

// ---------- B. corpus RED->GREEN ----------
var corpusDir = path.join(__dirname, '..', 'evidence', '2026-10-22', 'perseed-deathcause-b');

t('B1 RED baseline: the OLD taxonomy left 8/13 unattributed (the published NO-GO)', function () {
  var census = diag.runDiag(corpusDir);
  var oldUn = 0, oldTotal = 0;
  census.runs.forEach(function (r) {
    r.starvationDeaths.forEach(function (dth) {
      oldTotal++;
      if (dth.oldChannel === 'unattributed') oldUn++;
    });
  });
  assert.strictEqual(oldTotal, 13, 'corpus starvation deaths=' + oldTotal);
  assert.strictEqual(oldUn, 8, 'old unattributed=' + oldUn);
});

t('B2 GREEN: extended taxonomy names 13/13 with 0 instrumentErrors (bar >=12/13)', function () {
  var census = diag.runDiag(corpusDir);
  assert.strictEqual(census.totals.starvationDeaths, 13);
  assert.strictEqual(census.totals.unattributed, 0, 'unattributed=' + census.totals.unattributed);
  assert.strictEqual(census.totals.named, 13);
  assert.ok(census.totals.named >= 12, 'bar');
  assert.strictEqual(census.instrumentErrors.length, 0, JSON.stringify(census.instrumentErrors));
});

t('B3 per-death primaries match the characterized shapes', function () {
  var census = diag.runDiag(corpusDir);
  var expected = {
    '66050|belongfeast|Theo|29': 'trail-starvation',
    '66050|belongfeast|Somchai|135': 'inflow-failure',
    '66050|belongfeast|Ingrid|141': 'inflow-failure',
    '66050|belongfeast|Kenneth|143': 'inflow-failure',
    '66053|belongfeast|Juan|8': 'trail-starvation',
    '66053|belongfeast|Irving|21': 'trail-starvation',
    '66053|belongfeast|Zinaida|36': 'trail-starvation',
    '66050|leadfeast|Zihao|43': 'inflow-failure',
    '66050|leadfeast|Pavel|48': 'inflow-failure',
    '66050|leadfeast|Theo|50': 'inflow-failure',
    '66050|leadfeast|Ruth|54': 'inflow-failure',
    '66050|leadfeast|Laura|65': 'inflow-failure',
    '66053|leadfeast|Juan|8': 'trail-starvation',
  };
  var seen = {};
  census.runs.forEach(function (r) {
    r.starvationDeaths.forEach(function (dth) {
      var k = r.seed + '|' + r.policy + '|' + dth.who + '|' + dth.day;
      seen[k] = (seen[k] || 0) + 1;
      assert.strictEqual(dth.channel, expected[k], k + ' -> ' + dth.channel + ' (expected ' + expected[k] + ')');
    });
  });
  assert.strictEqual(Object.keys(seen).length, 13);
});

t('B4 wound-compounded flags land on the transcript-confirmed cases', function () {
  var census = diag.runDiag(corpusDir);
  var flagged = [];
  census.runs.forEach(function (r) {
    r.starvationDeaths.forEach(function (dth) {
      if (dth.channelFlags.indexOf('wound-compounded') >= 0) flagged.push(dth.who + ' d' + dth.day);
    });
  });
  flagged.sort();
  assert.deepStrictEqual(flagged, ['Zihao d43', 'Zinaida d36'], 'flagged=' + JSON.stringify(flagged));
});

t('B5 Juan x2 (byte-identical seed-determined death) classifies identically', function () {
  var census = diag.runDiag(corpusDir);
  var juans = [];
  census.runs.forEach(function (r) {
    r.starvationDeaths.forEach(function (dth) {
      if (dth.who === 'Juan') juans.push(dth.channel + '|' + dth.channelFlags.join(','));
    });
  });
  assert.strictEqual(juans.length, 2);
  assert.strictEqual(juans[0], juans[1], JSON.stringify(juans));
});

// ---------- C. DET ----------
t('C1 DET: two in-memory diag runs are byte-identical', function () {
  var a = JSON.stringify(diag.runDiag(corpusDir));
  var b = JSON.stringify(diag.runDiag(corpusDir));
  assert.strictEqual(a, b, 'lengths ' + a.length + ' vs ' + b.length);
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
