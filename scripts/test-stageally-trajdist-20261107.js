// test-stageally-trajdist-20261107.js — proof for the trajectory-distance
// measurement (arm sim-stageally-confirm2-b). Fixture corpus rows with
// known distances; no game reads, no evidence writes.
'use strict';
const assert = require('assert');
const TD = require('./stageally-trajdist-20261107');

function row(seed, policy, run, days, standing, maxWave, w4kills, pairDays) {
  const daily = [];
  for (let i = 0; i < pairDays; i++) daily.push({ readiness5: { veterans: 2 } });
  for (let i = 0; i < 5; i++) daily.push({ readiness5: { veterans: 0 } });
  const waveKillLog = [];
  for (let i = 0; i < w4kills; i++) waveKillLog.push({ w: 4 });
  return { seed: seed, policy: policy, run: run, days: days, standing: standing,
    maxWave: maxWave, waveKillLog: waveKillLog, daily: daily };
}

let passed = 0;
function check(name, fn) { fn(); passed++; console.log('ok - ' + name); }

// Identical rows: zero distance on every component.
check('identical rows distance 0', function () {
  const a = row(53006, 'staged', 'r1', 150, 440, 5, 11, 20);
  const b = row(53006, 'staged', 'r2', 150, 440, 5, 11, 20);
  const d = TD.distance(a, b);
  assert.strictEqual(d.composite, 0);
  assert.strictEqual(d.dKills, 0);
  assert.strictEqual(d.dPair, 0);
});

// Confirm-b 53006 staged (2 kills, standing ~?, 150d, 0 pair days) vs
// trajfrag 53006 staged (11 kills, 440, 150d, pair days > 0): kills 9,
// standing delta 440-? — use standing 100 vs 440 -> 3.4; pair flip 1.
check('53006 confirm-vs-trajfrag shape', function () {
  const confirm = row(53006, 'staged', 'confirm', 150, 100, 4, 2, 0);
  const traj = row(53006, 'staged', 'trajfrag', 150, 440, 5, 11, 20);
  const d = TD.distance(confirm, traj);
  assert.strictEqual(d.dKills, 9);
  assert.strictEqual(d.dStanding, 3.4);
  assert.strictEqual(d.dMaxWave, 1);
  assert.strictEqual(d.dDays, 0);
  assert.strictEqual(d.dPair, 1);
  assert.strictEqual(d.composite, 14.4);
});

// Pair-days present on both legs: no pair flip even when counts differ.
check('pair on both legs is not a flip', function () {
  const a = row(53001, 'staged', 'r1', 100, 50, 4, 1, 3);
  const b = row(53001, 'staged', 'r2', 100, 50, 4, 1, 9);
  assert.strictEqual(TD.distance(a, b).dPair, 0);
});

// Features: w4 kills count only wave >= 4; pair days count readiness5.veterans >= 2.
check('features count wave>=4 kills and pair days', function () {
  const r = { seed: 1, policy: 'baseline', days: 90, standing: 75, maxWave: 4,
    waveKillLog: [{ w: 3 }, { w: 4 }, { w: 5 }, { w: 2 }],
    daily: [{ readiness5: { veterans: 1 } }, { readiness5: { veterans: 2 } }, { readiness5: { veterans: 3 } }] };
  const f = TD.features(r);
  assert.strictEqual(f.w4Kills, 2);
  assert.strictEqual(f.pairDays, 2);
});

// Missing fields default to zero, never throw.
check('missing fields default safely', function () {
  const d = TD.distance({}, {});
  assert.strictEqual(d.composite, 0);
});

console.log('test-stageally-trajdist-20261107: ' + passed + '/5 passed');
