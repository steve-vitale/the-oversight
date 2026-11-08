'use strict';
// scripts/test-riskdeath-b.js — proof for the sim-riskdeath-b death-cause read.
//
// Proves: (1) the analyzer's family table is kind-aware (monster:villager
// combat is a kill, never a human death; player:the wild is a player death);
// (2) a synthetic 8-seed panel pair with a planted cause yields the known
// DIAG-GO verdict, and a smeared-cause pair yields DIAG-NO-GO; (3) the real
// panel re-read reproduces the committed compare's published totals and the
// recorded DIAG-NO-GO verdict (best candidate player:the wild, +9, paired
// t-interval covering 0).
// Fixture panels are written to os.tmpdir() — never into the repo.
const assert = require('assert');
const zlib = require('zlib');
const fs = require('fs');
const os = require('os');
const path = require('path');
const A = require('./analyze-riskdeath-b.js');

let pass = 0, fail = 0;
function check(name, fn) {
  try { fn(); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ' — ' + e.message); }
}

function row(policy, seed, deaths, days) {
  const agg = A.aggregateRow(deaths);
  return { row: { policy, seed, gameDays: days || 90, waveReach: 4, maxArc: 3,
    national: 0, entered: 0, won: 0, table: 0, deaths },
    metrics: { playerDeaths: agg.playerTotal, villageDeaths: agg.total,
      survival30: 1, survival60: 0, bearerChanges: agg.playerTotal,
      playerDeaths100Days: 0, villageDeaths100Days: 0 },
    samples: { 0: { day: 2, bearer: 'b0', livingNpcs: 10 } } };
}
function writePanel(dir, rows) {
  const doc = { schemaVersion: 1, options: { policies: ['risk-aware'], seeds: [53001] }, rows };
  fs.writeFileSync(path.join(dir, 'panel.json.gz'), zlib.gzipSync(JSON.stringify(doc)));
}
function fixturePair(beforeDeaths, afterDeaths) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'riskdeath-'));
  const bd = path.join(dir, 'before'), ad = path.join(dir, 'after');
  fs.mkdirSync(bd); fs.mkdirSync(ad);
  const seeds = [53001, 53002, 53003, 53004, 53005, 53006, 53007, 53008];
  writePanel(bd, seeds.map((s, i) => row('risk-aware', s, beforeDeaths[i], 90)));
  writePanel(ad, seeds.map((s, i) => row('risk-aware', s, afterDeaths[i], 90)));
  return { before: path.join(bd, 'panel.json.gz'), after: path.join(ad, 'panel.json.gz') };
}

check('kind-aware aggregation: monster kills are not human deaths', () => {
  const agg = A.aggregateRow({ 'monster:villager combat': 5, 'monster:combat': 2,
    'player:the wild': 3, 'villager:monster': 1, 'villager:sickness': 1 });
  assert.strictEqual(agg.playerTotal, 3);
  assert.strictEqual(agg.humanTotal, 5);
  assert.strictEqual(agg.monsterTotal, 7);
  assert.strictEqual(agg.total, 12);
  assert.strictEqual(agg.fam.monsterKill, 7);
  assert.strictEqual(agg.fam.violent, 4); // player wild 3 + villager monster 1
  assert.strictEqual(agg.fam.sickness, 1);
});

check('family registration: dehydration is thirst, lockjaw is sickness', () => {
  assert.strictEqual(A.familyOf('player', 'dehydration'), 'thirst');
  assert.strictEqual(A.familyOf('villager', 'thirst'), 'thirst');
  assert.strictEqual(A.familyOf('player', 'lockjaw'), 'sickness');
  assert.strictEqual(A.familyOf('player', 'the night'), 'other');
  assert.strictEqual(A.familyOf('villager', 'the phoenix link'), 'other');
  assert.strictEqual(A.familyOf('monster', 'villager combat'), 'monsterKill');
});

check('planted cause: concentrated wild deaths yield DIAG-GO', () => {
  const b = [], a = [];
  for (let i = 0; i < 8; i++) {
    b.push({ 'player:the wild': 5, 'monster:villager combat': 10 });
    a.push({ 'player:the wild': 7, 'monster:villager combat': 10 }); // +2/seed, every seed
  }
  const f = fixturePair(b, a);
  const res = A.analyze(f.before, f.after);
  const v = A.verdict(res);
  assert.strictEqual(v.verdict, 'DIAG-GO');
  assert.strictEqual(v.hits[0].what, 'player cause player:the wild');
  assert.strictEqual(v.hits[0].delta, 16);
  assert.ok(v.hits[0].tInterval[0] > 0, 't-interval excludes 0');
});

check('smeared cause: one-seed spike yields DIAG-NO-GO', () => {
  const b = [], a = [];
  for (let i = 0; i < 8; i++) {
    b.push({ 'player:the wild': 5, 'monster:villager combat': 10 });
    a.push({ 'player:the wild': 5, 'monster:villager combat': 10 });
  }
  a[0] = { 'player:the wild': 17, 'monster:villager combat': 10 }; // +12 on one seed only
  const f = fixturePair(b, a);
  const res = A.analyze(f.before, f.after);
  const v = A.verdict(res);
  assert.strictEqual(v.verdict, 'DIAG-NO-GO');
  assert.strictEqual(v.bestPlayer.key, 'player:the wild');
  assert.strictEqual(v.bestPlayer.delta, 12);
  assert.ok(v.bestPlayer.paired.tLo <= 0, 't-interval covers 0');
});

check('real panels: totals reproduce the committed compare', () => {
  const base = path.join(__dirname, '..', 'evidence', '2026-11-08', 'panel-flippanel-b');
  const res = A.analyze(path.join(base, 'before', 'panel.json.gz'), path.join(base, 'after', 'panel.json.gz'));
  const ra = res.policies['risk-aware'], cap = res.policies.capable;
  assert.deepStrictEqual([ra.totals.playerDeaths.before, ra.totals.playerDeaths.after], [43, 55]);
  assert.deepStrictEqual([ra.totals.villageDeaths.before, ra.totals.villageDeaths.after], [478, 512]);
  assert.deepStrictEqual([cap.totals.playerDeaths.before, cap.totals.playerDeaths.after], [17, 16]);
  assert.deepStrictEqual([cap.totals.villageDeaths.before, cap.totals.villageDeaths.after], [475, 428]);
  // First-bearer split reproduces the compare: capable surv30 7->4, risk-aware 7->7.
  assert.deepStrictEqual(cap.firstBearer.surv30, [7, 4]);
  assert.deepStrictEqual(ra.firstBearer.surv30, [7, 7]);
  // First-bearer deaths flat on risk-aware; the whole +12 is successors.
  assert.deepStrictEqual(ra.firstBearer.firstBearerDeaths, [7, 7]);
  assert.deepStrictEqual(ra.firstBearer.successorDeaths, [36, 48]);
});

check('real panels: paired player delta +1.5/run, t-interval covers 0', () => {
  const base = path.join(__dirname, '..', 'evidence', '2026-11-08', 'panel-flippanel-b');
  const res = A.analyze(path.join(base, 'before', 'panel.json.gz'), path.join(base, 'after', 'panel.json.gz'));
  const diffs = res.policies['risk-aware'].perSeed.map(r => r.after.playerTotal - r.before.playerTotal);
  assert.deepStrictEqual(diffs, [6, 0, 0, 3, 0, 0, 3, 0]);
  const s = A.pairedStats(diffs);
  assert.strictEqual(s.mean, 1.5);
  assert.ok(s.tLo < 0 && s.tHi > 0, 't-interval covers 0: [' + s.tLo.toFixed(2) + ', ' + s.tHi.toFixed(2) + ']');
});

check('real panels: recorded verdict is DIAG-NO-GO, best candidate wild +9', () => {
  const base = path.join(__dirname, '..', 'evidence', '2026-11-08', 'panel-flippanel-b');
  const res = A.analyze(path.join(base, 'before', 'panel.json.gz'), path.join(base, 'after', 'panel.json.gz'));
  const v = A.verdict(res);
  assert.strictEqual(v.verdict, 'DIAG-NO-GO');
  assert.strictEqual(v.bestPlayer.key, 'player:the wild');
  assert.strictEqual(v.bestPlayer.delta, 9);
  assert.ok(v.bestPlayer.paired.tLo <= 0, 'wild t-interval covers 0');
  assert.strictEqual(v.bestVillage.family, 'monsterKill');
  assert.strictEqual(v.bestVillage.delta, 23);
  assert.ok(v.bestVillage.paired.tLo <= 0, 'monsterKill t-interval covers 0');
});

check('bearer-change proxy: detects a bearer change, misses same-day repeats', () => {
  const days = A.bearerChangeDays({
    0: { day: 2, bearer: 'a' }, 1: { day: 3, bearer: 'a' }, 2: { day: 4, bearer: 'b' }, 3: { day: 5, bearer: 'b' },
  });
  assert.deepStrictEqual(days, [4]);
});

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
