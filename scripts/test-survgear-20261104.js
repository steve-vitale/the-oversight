// test-survgear-20261104.js — proof for arm sim-survgear-b.
// Fixture tests for the joint counterfactual (overlap, hold expiry,
// same-day kill-and-die, 99104 d147-149 table, survival-only /
// gear-only separation) + determinism + instrument on/off neutrality
// legs on one short seed (driver runs to /tmp only; no repo writes).
// Usage: node scripts/test-survgear-20261104.js
'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'survgear-analyze-20261104'));

let passed = 0;
function check(name, fn) { fn(); passed++; console.log('PASS ' + name); }

function fakeRow(days, kills, fallen) {
  return {
    seed: 99999, days: days.length ? days[days.length - 1].day : 0,
    endReason: 'survived', won: false, scaleRank: 'village',
    unlockedWave: 4, maxWave: 4,
    fights: [], waveKillLog: kills, fallen: fallen || [],
    daily: days, instrumentErrors: [],
  };
}
function snap(day, raw, armored, armed, tricks) {
  return {
    day: day, raw: raw, gated: Math.min(raw, 199),
    readiness5: {
      armored: armored, armed: armed, tricks: tricks, veterans: 0,
      demand: { armored: 4, armorP: 15, armed: 6, tricks: 3, veterans: 2 },
      short: [],
    },
  };
}
function kill(by, d) { return { d: d, mid: 'congregation', w: 4, by: by, via: 'player' }; }

// 1. Overlap: two killers alive together need E=0 on their overlap day.
check('overlap: living pair needs E=0', function () {
  const row = fakeRow(
    [snap(10, 210, 4, 6, 5), snap(11, 210, 4, 6, 5)],
    [kill('a', 5), kill('b', 8)], []);
  const s = AN.analyzeSeed(row);
  assert.strictEqual(s.dayTable[1].minE, 0);
  assert.deepStrictEqual(AN.readyDaysAt(s.dayTable, 0, 0), [10, 11]);
});

// 2. Survival extension: killer1 dies d106, killer2 banked d123.
check('survival extension: E=18 bridges 106->123', function () {
  const row = fakeRow(
    [snap(122, 210, 4, 6, 5), snap(123, 210, 4, 6, 5), snap(124, 210, 4, 6, 5)],
    [kill('a', 101), kill('b', 123)],
    [{ villagerId: 'a', day: 106, cause: 'the wild' }]);
  const s = AN.analyzeSeed(row);
  const d123 = s.dayTable.filter(function (d) { return d.day === 123; })[0];
  assert.strictEqual(d123.minE, 18);
  assert.deepStrictEqual(AN.readyDaysAt(s.dayTable, 17, 0), []);
  assert.deepStrictEqual(AN.readyDaysAt(s.dayTable, 18, 0), [123]);
  assert.deepStrictEqual(AN.readyDaysAt(s.dayTable, 19, 0), [123, 124]);
});

// 3. Same-day kill-and-die contributes to NO day at E=0, to its day at E>=1.
check('same-day kill-and-die: fleeting at E=0, counted at E=1', function () {
  const row = fakeRow(
    [snap(100, 210, 4, 6, 5), snap(101, 210, 4, 6, 5)],
    [kill('a', 100), kill('b', 100)],
    [{ villagerId: 'a', day: 100, cause: 'the arena' }, { villagerId: 'b', day: 100, cause: 'a wound that wouldn\'t close' }]);
  const s = AN.analyzeSeed(row);
  assert.strictEqual(s.dayTable[0].minE, 1);
  assert.deepStrictEqual(AN.readyDaysAt(s.dayTable, 0, 0), []);
  assert.deepStrictEqual(AN.readyDaysAt(s.dayTable, 1, 0), [100]);
});

// 4. Gear hold expiry: legs met only on d10 hold for exactly G days.
check('gear hold expiry: met d10 holds through d10+G only', function () {
  const row = fakeRow(
    [snap(10, 210, 4, 6, 5), snap(11, 210, 0, 0, 5), snap(12, 210, 0, 0, 5), snap(13, 210, 0, 0, 5)],
    [kill('a', 5), kill('b', 6)], []);
  const s = AN.analyzeSeed(row);
  assert.strictEqual(s.dayTable[1].minG, 1);
  assert.strictEqual(s.dayTable[2].minG, 2);
  assert.deepStrictEqual(AN.readyDaysAt(s.dayTable, 0, 0), [10]);
  assert.deepStrictEqual(AN.readyDaysAt(s.dayTable, 0, 1), [10, 11]);
  assert.deepStrictEqual(AN.readyDaysAt(s.dayTable, 0, 2), [10, 11, 12]);
});

// 5. Gear leg never met is never held-met, at any G.
check('gear never met: minG Infinity at any hold', function () {
  const row = fakeRow(
    [snap(10, 210, 4, 0, 5), snap(20, 210, 4, 0, 5)],
    [kill('a', 5), kill('b', 6)], []);
  const s = AN.analyzeSeed(row);
  assert.strictEqual(s.dayTable[0].minG, Infinity);
  assert.deepStrictEqual(AN.readyDaysAt(s.dayTable, 0, 90), []);
});

// 6. 99104 d147-149 fixture (vetshape's one-day miss, shape vs legs).
check('99104 d147-149: ready only at (E>=29, G>=1), never at (28, *)', function () {
  const row = fakeRow(
    [snap(147, 200, 4, 6, 29), snap(148, 200, 4, 6, 29), snap(149, 200, 4, 5, 29)],
    [kill('k1', 107), kill('k1', 120), kill('k2', 149)],
    [{ villagerId: 'k1', day: 121, cause: 'the wild' }, { villagerId: 'k2', day: 149, cause: 'a wound that wouldn\'t close' }]);
  const s = AN.analyzeSeed(row);
  const d147 = s.dayTable[0], d148 = s.dayTable[1], d149 = s.dayTable[2];
  assert.strictEqual(d147.shape, 1);
  assert.strictEqual(d148.shape, 1);
  assert.strictEqual(d149.shape, 2);
  assert.deepStrictEqual(d147.shortDerived, ['veterans']);
  assert.deepStrictEqual(d148.shortDerived, ['veterans']);
  assert.deepStrictEqual(d149.shortDerived, ['weapons', 'veterans']);
  assert.strictEqual(d149.minE, 29);
  assert.strictEqual(d149.minG, 1);
  assert.deepStrictEqual(AN.readyDaysAt(s.dayTable, 28, 30), []);
  assert.deepStrictEqual(AN.readyDaysAt(s.dayTable, 29, 0), []);
  assert.deepStrictEqual(AN.readyDaysAt(s.dayTable, 29, 1), [149]);
  assert.strictEqual(s.minimalE.E, 29);
  assert.strictEqual(s.minimalE.G, 1);
  assert.strictEqual(s.minimalG.G, 1);
  assert.strictEqual(s.minimalG.E, 29);
});

// 7. Survival-only vs gear-only separation.
check('columns stay separate: survival-only and gear-only minima', function () {
  // Survival-only possible: gear met on the overlap day, veterans need E.
  const rowA = fakeRow(
    [snap(50, 210, 4, 6, 5)],
    [kill('a', 40), kill('b', 50)],
    [{ villagerId: 'a', day: 42, cause: 'the wild' }]);
  const sA = AN.analyzeSeed(rowA);
  assert.strictEqual(sA.survivalOnlyMinE, 9); // d50: 50-42+1
  assert.strictEqual(sA.gearOnlyMinG, null); // living max 1 at E=0
  // Gear-only impossible with a single living killer, whatever the hold.
  const rowB = fakeRow(
    [snap(50, 210, 4, 6, 5), snap(51, 210, 0, 0, 5)],
    [kill('a', 50)], []);
  const sB = AN.analyzeSeed(rowB);
  assert.strictEqual(sB.gearOnlyMinG, null);
  assert.strictEqual(sB.survivalOnlyMinE, null);
});

// 8. Gated standing is never the release proxy (raw 200, gated capped 199).
check('gated cap: raw>=200 counts even when gated=199', function () {
  const row = fakeRow(
    [snap(30, 200, 4, 6, 5)],
    [kill('a', 5), kill('b', 6)], []);
  const s = AN.analyzeSeed(row);
  assert.strictEqual(s.dayTable[0].gated, 199);
  assert.deepStrictEqual(AN.readyDaysAt(s.dayTable, 0, 0), [30]);
});

// 9. Analyzer determinism: same corpus analyzed twice is identical.
check('analyzer determinism', function () {
  const dir = path.join(REPO, 'evidence', '2026-11-04', 'perseed-vetshape-b');
  if (!fs.existsSync(dir)) { console.log('  (skip: vetshape corpus absent)'); return; }
  const a = JSON.stringify(AN.analyzeDir(dir.replace('vetshape', 'vetshape')));
  const b = JSON.stringify(AN.analyzeDir(dir.replace('vetshape', 'vetshape')));
  assert.strictEqual(a, b);
});

// 10-11. Live harness legs: determinism + on/off neutrality, seed 99108, 30d.
(function liveLegs() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'survgear-proof-'));
  function run(outName, extraEnv) {
    const outDir = path.join(tmp, outName);
    const env = Object.assign({}, process.env, {
      REPO: REPO, OUTDIR: outDir, DAYS: '30', SEEDS: '99108', RUN: 'proof',
    }, extraEnv || {});
    execSync('node scripts/survgear-driver-20261104.js', { cwd: REPO, env: env, stdio: 'pipe', timeout: 600000 });
    return JSON.parse(fs.readFileSync(path.join(outDir, 'survgear-s99108-proof.json'), 'utf8'));
  }
  const onA = run('on-a');
  const onB = run('on-b');
  check('live determinism: same seed twice identical', function () {
    assert.strictEqual(onA.days, onB.days);
    assert.strictEqual(onA.endReason, onB.endReason);
    assert.strictEqual(JSON.stringify(onA.waveKillLog), JSON.stringify(onB.waveKillLog));
    assert.strictEqual(JSON.stringify(onA.fights), JSON.stringify(onB.fights));
    assert.strictEqual(onA.instrumentErrors.length, 0);
  });
  const off = run('off', { SURVGEAR_OFF: '1' });
  check('live neutrality: instrument on vs off identical trajectory', function () {
    assert.strictEqual(onA.days, off.days);
    assert.strictEqual(onA.endReason, off.endReason);
    assert.strictEqual(JSON.stringify(onA.waveKillLog), JSON.stringify(off.waveKillLog));
    assert.strictEqual(off.instrumentOff, true);
  });
})();

console.log('survgear proof: ' + passed + ' checks PASS');
