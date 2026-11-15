// test-wave5kill-b.js — proof test for scripts/analyze-wave5kill-b.js.
// Synthetic per-seed fixtures (hand-built, no corpus numbers): each
// outcome class, the unclassified guards, instrument-error detection,
// kill:death ratio, veteran-attrition summaries, and the frozen wave-5
// id set vs src/data/monsters.json. Run: node scripts/test-wave5kill-b.js
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const A = require('./analyze-wave5kill-b.js');

let pass = 0;
function check(name, fn) {
  fn();
  pass += 1;
  console.log('ok - ' + name);
}

const W5 = new Set(A.W5_IDS);
function baseSeed(over) {
  const d = {
    seed: 1, policy: 'test', days: 150, endReason: 'survived',
    maxWave: 5, waveKills: { '1': 10, '5': 0 },
    events: [{ day: 80, kind: 'unlockedWave', wave: 5 }],
    series: [
      { d: 79, w5: 0, vet5: 2, rd5ready: true, rd5short: [] },
      { d: 80, w5: 0, vet5: 2, rd5ready: true, rd5short: [] },
      { d: 100, w5: 0, vet5: 1, rd5ready: false, rd5short: ['veterans'] },
      { d: 150, w5: 0, vet5: 1, rd5ready: false, rd5short: ['veterans'] }
    ],
    deaths: [], instrumentErrors: []
  };
  return Object.assign(d, over || {});
}

check('NEVER-FACED classifies (unlocked, faced 0, kills 0)', function () {
  const r = A.classifySeed(baseSeed(), W5);
  assert.strictEqual(r.cls, 'NEVER-FACED');
  assert.deepStrictEqual(r.errors, []);
  assert.strictEqual(r.unlockDay, 80);
  assert.strictEqual(r.vet5AtUnlock, 2);
  assert.strictEqual(r.vet5AtEnd, 1);
  assert.strictEqual(r.readyDaysAfterUnlock, 1);
  assert.strictEqual(r.dominantShort, 'veterans');
});

check('FACED-NOT-KILLED classifies (faced 2, kills 0)', function () {
  const d = baseSeed();
  d.series[2].w5 = 1; d.series[3].w5 = 2;
  const r = A.classifySeed(d, W5);
  assert.strictEqual(r.cls, 'FACED-NOT-KILLED');
  assert.deepStrictEqual(r.errors, []);
  assert.strictEqual(r.facedDistinct, 2);
  assert.strictEqual(r.firstFacedDay, 100);
  assert.strictEqual(r.vet5AtFirstFaced, 1);
});

check('KILLED classifies with deaths-to-W5 split scholar/villager', function () {
  const d = baseSeed({ waveKills: { '1': 10, '5': 3 } });
  d.series[2].w5 = 1; d.series[3].w5 = 2;
  d.deaths = [
    { day: 110, kind: 'monster', who: 'editor', cause: 'combat', player: false },
    { day: 120, kind: 'monster', who: 'spoiler', cause: 'combat', player: true },
    { day: 130, kind: 'monster', who: 'gallowdeer', cause: 'villager combat', player: false }
  ];
  const r = A.classifySeed(d, W5);
  assert.strictEqual(r.cls, 'KILLED');
  assert.strictEqual(r.kills, 3);
  assert.strictEqual(r.deathsW5, 2);
  assert.strictEqual(r.deathsW5Scholar, 1);
  assert.strictEqual(r.deathsW5Villager, 1);
  assert.deepStrictEqual(r.errors, []);
});

check('LOCKED classifies (maxWave 4, no unlock event)', function () {
  const d = baseSeed({ maxWave: 4, events: [], waveKills: { '1': 10, '4': 2 } });
  d.series.forEach(function (r) { r.w5 = 0; });
  const r = A.classifySeed(d, W5);
  assert.strictEqual(r.cls, 'LOCKED');
  assert.strictEqual(r.unlocked, false);
  assert.deepStrictEqual(r.errors, []);
});

check('guard: kills without unlock is an error', function () {
  const d = baseSeed({ maxWave: 4, events: [], waveKills: { '1': 10, '5': 2 } });
  const r = A.classifySeed(d, W5);
  assert.ok(r.errors.indexOf('kills-without-unlock') !== -1);
});

check('guard: faced before unlock day is an error', function () {
  const d = baseSeed();
  d.series[0].w5 = 1; // day 79, unlock is day 80
  const r = A.classifySeed(d, W5);
  assert.ok(r.errors.indexOf('faced-before-unlock') !== -1);
});

check('guard: non-empty instrumentErrors is an error', function () {
  const d = baseSeed({ instrumentErrors: ['recorder dropped a day'] });
  const r = A.classifySeed(d, W5);
  assert.ok(r.errors.some(function (e) { return e.indexOf('instrumentErrors:') === 0; }));
});

check('guard: maxWave 5 without unlock event is an error', function () {
  const d = baseSeed({ events: [] });
  const r = A.classifySeed(d, W5);
  assert.ok(r.errors.indexOf('maxWave5-no-unlock-event') !== -1);
});

check('kill:death ratio + pooled classes via analyzeLeg on a temp dir', function () {
  const os = require('os');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'w5kill-leg-'));
  const seeds = [
    baseSeed({ seed: 11 }), // NEVER-FACED
    baseSeed({ seed: 12, waveKills: { '1': 10, '5': 5 } }), // KILLED, no deaths
    baseSeed({ seed: 13, maxWave: 4, events: [], waveKills: { '1': 10 } }) // LOCKED
  ];
  seeds[1].series[2].w5 = 1; seeds[1].series[3].w5 = 3;
  seeds[1].deaths = [
    { day: 110, kind: 'monster', who: 'editor', cause: 'combat', player: false },
    { day: 120, kind: 'monster', who: 'editor', cause: 'combat', player: false }
  ];
  seeds.forEach(function (s, i) {
    fs.writeFileSync(path.join(dir, 's' + i + '.json'), JSON.stringify(s));
  });
  const leg = A.analyzeLeg(dir, W5);
  assert.strictEqual(leg.pooled.seeds, 3);
  assert.strictEqual(leg.pooled.unlocked, 2);
  assert.strictEqual(leg.pooled.classes['NEVER-FACED'], 1);
  assert.strictEqual(leg.pooled.classes.KILLED, 1);
  assert.strictEqual(leg.pooled.classes.LOCKED, 1);
  assert.strictEqual(leg.pooled.totalKills, 5);
  assert.strictEqual(leg.pooled.killsPerUnlocked, 2.5);
  assert.strictEqual(leg.pooled.killsPerFaced, 5);
  assert.strictEqual(leg.pooled.totalDeathsW5, 2);
  assert.strictEqual(leg.pooled.killDeathRatio, 2.5);
  assert.strictEqual(leg.pooled.instrumentErrors, 0);
  assert.strictEqual(leg.pooled.unclassified, 0);
  fs.rmSync(dir, { recursive: true, force: true });
});

check('frozen wave-5 id set matches src/data/monsters.json exactly', function () {
  const live = A.loadWave5Ids(path.join(__dirname, '..', 'src', 'data', 'monsters.json'));
  assert.deepStrictEqual(live, A.W5_IDS.slice().sort());
});

console.log('test-wave5kill-b: ' + pass + '/10 checks passed');
