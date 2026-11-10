// test-spawncensus-a.js — proof for the spawn-census analyzer
// (arm sim-spawncensus-a). Proves the instrument/analyzer BEFORE any
// judged sim runs on the fresh band. Zero src/js. Node harness rules:
// no game load here — pure analysis over recorded corpora + synthetic rows.
//   node scripts/test-spawncensus-a.js
'use strict';
const assert = require('assert');
const path = require('path');
const A = require(path.join(__dirname, 'spawncensus-analyze-20261110'));

let checks = 0;
function check(name, fn) { fn(); checks++; console.log('ok - ' + name); }

// 1. Roster: 72 kinds, waves 25/15/9/10/10/3, as the coverage audit read them.
check('roster is 72 kinds with the audited wave split', function () {
  const roster = A.loadRoster();
  assert.strictEqual(roster.length, 72);
  const byWave = {};
  roster.forEach(function (r) { byWave[r.wave] = (byWave[r.wave] || 0) + 1; });
  assert.deepStrictEqual(byWave, { 1: 25, 2: 15, 3: 9, 4: 10, 5: 10, 6: 3 });
  assert.strictEqual(roster.filter(function (r) { return r.poolNote === 'campaignOnly'; }).length, 5);
  assert.strictEqual(roster.filter(function (r) { return r.poolNote === 'titan-omen'; }).length, 3);
});

// 2. Reproduction: re-aggregate the encounterprod-b baseline corpus and
// reproduce the audit's published example seed exactly (s99141: 49 spawns,
// W1 19 / W2 10 / W3 14 / W4 6 / W5 0; 14 casts; 0 instrument errors).
check('reproduces encounterprod-b seed 99141 wave totals exactly', function () {
  const sum = A.analyzeDir(path.join(__dirname, '..', 'evidence', '2026-11-05', 'perseed-encounterprod-b'), 'baseline');
  assert.strictEqual(sum.seeds, 8);
  const s = sum.perSeed.filter(function (x) { return x.seed === 99141; })[0];
  assert.ok(s, 'seed 99141 present');
  assert.strictEqual(s.spawnsTotal, 49);
  assert.deepStrictEqual(s.spawnWaveTotals, { 1: 19, 2: 10, 3: 14, 4: 6 });
  assert.strictEqual(s.castsTotal, 14);
  assert.strictEqual(s.instrumentErrors, 0);
  assert.strictEqual(s.killWaveTotals[5] || 0, 0);
  // Every roster kind has a row even on this old corpus.
  assert.strictEqual(Object.keys(s.kinds).length, 72);
});

// 3. Determinism: two analyses of the same corpus are byte-identical.
check('analyzer is deterministic', function () {
  const dir = path.join(__dirname, '..', 'evidence', '2026-11-05', 'perseed-encounterprod-b');
  const a = JSON.stringify(A.analyzeDir(dir, 'baseline'));
  const b = JSON.stringify(A.analyzeDir(dir, 'baseline'));
  assert.strictEqual(a, b);
});

// 4. W5 separation: a synthetic seed with one W4 kill and one W5 kill
// reports them in separate wave buckets, never folded together.
check('W5 kills are separated from W4 kills', function () {
  const roster = A.loadRoster();
  const row = {
    seed: 1, days: 150, endReason: 'done', won: false, unlockedWave: 5, maxWave: 5,
    spawns: [{ id: 'editor', wave: 5, day: 79, source: 'background', veteran: false }],
    casts: [], fights: [{ mid: 'editor', wave: 5, day: 79, channel: 'field' }],
    waveKillLog: [
      { d: 44, mid: 'algorithm', w: 4, by: 'v1', via: 'wild', trick: null },
      { d: 79, mid: 'editor', w: 5, by: 'v1', via: 'wild', trick: null },
    ],
    instrumentErrors: [],
  };
  const s = A.analyzeSeed(row, roster);
  assert.deepStrictEqual(s.killWaveTotals, { 4: 1, 5: 1 });
  assert.strictEqual(s.kinds.editor.kills, 1);
  assert.deepStrictEqual(s.kinds.editor.killsByWave, { 5: 1 });
  assert.strictEqual(s.kinds.algorithm.killsByWave[4], 1);
  assert.strictEqual(s.kinds.editor.faced, 1);
  assert.strictEqual(s.kinds.editor.spawns, 1);
});

// 5. Completeness: census rows cover all 72 roster kinds; campaignOnly
// kinds are explicitly marked (not silently absent); 0-spawn kinds stay
// in the table.
check('census covers all 72 kinds with explicit pool notes', function () {
  const sum = A.analyzeDir(path.join(__dirname, '..', 'evidence', '2026-11-05', 'perseed-encounterprod-b'), 'baseline');
  assert.strictEqual(sum.census.length, 72);
  assert.strictEqual(sum.rosterSize, 72);
  const net = sum.census.filter(function (r) { return r.id === 'network_heart'; })[0];
  assert.ok(net, 'network_heart has a row');
  assert.strictEqual(net.poolNote, 'campaignOnly');
  assert.strictEqual(net.spawns, 0);
  const herald = sum.census.filter(function (r) { return r.id === 'herald'; })[0];
  assert.strictEqual(herald.poolNote, 'titan-omen');
  // No unknown ids in the old corpus.
  assert.deepStrictEqual(sum.unknownIds, []);
});

// 6. Zero-error capture is checkable: the old baseline corpus has 0
// instrument errors on all 8 seeds.
check('old baseline corpus has 0 instrument errors on all seeds', function () {
  const sum = A.analyzeDir(path.join(__dirname, '..', 'evidence', '2026-11-05', 'perseed-encounterprod-b'), 'baseline');
  assert.strictEqual(sum.totalInstrumentErrors, 0);
  sum.perSeed.forEach(function (s) { assert.strictEqual(s.instrumentErrors, 0); });
});

console.log('test-spawncensus-a: ' + checks + ' checks passed');
