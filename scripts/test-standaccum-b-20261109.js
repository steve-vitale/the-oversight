// test-standaccum-b-20261109.js — proof test for the standing-accumulation
// diag part-2 instrument + analyzer (arm sim-standaccum-b, run
// fleshout-loop-b-20261109T2307Z). Fixture-based (new trajectory classes
// + precedence, binding-constraint rule + day-counts, ready-day splits)
// plus two live harness legs: (1) a fresh loaded game snapshots with
// the standing breakdown reconciling exactly (war == warPts*25,
// diplomacy == links*34, plenty == qualifying feasts*20, gated >= 0)
// and zero instrument errors; (2) determinism: the same seed loads
// twice and yields identical day-0 standing snapshots.
// Usage: node scripts/test-standaccum-b-20261109.js
'use strict';
const path = require('path');
const assert = require('assert');
const AN = require(path.join(__dirname, 'standaccum-analyze-20261109'));

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('ok ' + pass + ' - ' + name); }

function snap(day, over) {
  return Object.assign({
    day: day, living: 5, gated: 0,
    standing: { total: 0, war: 0, diplomacy: 0, plenty: 0, warPts: 0, links: 0, feasts: 0 },
    ledger: { 3: 0, 4: 0, 5: 0 }, links: [],
    feasts: { total: 0, qualifying: 0, subquality: 0, entries: [] },
    readiness5: { ready: false, armored: 0, armed: 0, tricks: 0, veterans: 0, short: [] },
    w4faced: false, peakWave: 0, standingLine: null,
  }, over || {});
}
function seedOut(daily, over) {
  return Object.assign({ seed: 99101, run: 'fixture', days: 100, endReason: 'village-lost',
    won: false, villageLost: true, scaleRank: 'village', maxWave: 4, unlockedWave: 4,
    standing: 0, daily: daily, instrumentErrors: [] }, over || {});
}
function readySnap(day, gated, war, dip, plenty, w4) {
  return snap(day, {
    gated: gated,
    standing: { total: war + dip + plenty, war: war, diplomacy: dip, plenty: plenty, warPts: war / 25, links: dip / 34, feasts: plenty / 20 },
    readiness5: { ready: true, armored: 4, armed: 7, tricks: 20, veterans: 2, short: [], demand: { armored: 4, armorP: 15, armed: 6, tricks: 3, veterans: 2 } },
    w4faced: !!w4,
    standingLine: 'Standing ' + (war + dip + plenty) + ' (war ' + war + ' · bonds ' + dip + ' · bread ' + plenty + ') — wave 4 at 100, wave 5 at 200',
  });
}

ok('trajectory: released on a ready day with gated >= 200 and wave-4 faced', function () {
  const s = AN.summarizeSeed(seedOut([
    snap(70, { gated: 120, standing: { total: 120, war: 100, diplomacy: 0, plenty: 20, warPts: 4, links: 0, feasts: 1 } }),
    readySnap(76, 210, 150, 0, 60, true),
  ], { unlockedWave: 5 }));
  assert.strictEqual(s.released, true);
  assert.strictEqual(s.trajectory, 'released');
  assert.strictEqual(s.binding.binding, 'none');
});

ok('trajectory: bars-met-standing-short (the gearbar-99107 shape)', function () {
  const s = AN.summarizeSeed(seedOut([
    readySnap(76, 150, 100, 0, 50, true),
    readySnap(77, 150, 100, 0, 50, true),
    readySnap(78, 150, 100, 0, 50, true),
  ]));
  assert.strictEqual(s.released, false);
  assert.strictEqual(s.trajectory, 'bars-met-standing-short');
  assert.deepStrictEqual(s.readyDays, [76, 77, 78]);
  assert.strictEqual(s.binding.binding, 'diplomacy');
  assert.deepStrictEqual(s.binding.dayCounts, { war: 0, diplomacy: 3, plenty: 0 });
  assert.strictEqual(s.binding.refKind, 'ready-days');
  assert.strictEqual(s.readyDaySplits.length, 3);
  assert.strictEqual(s.readyDaySplits[0].war, 100);
  assert.strictEqual(s.readyDaySplits[0].diplomacy, 0);
  assert.strictEqual(s.readyDaySplits[0].plenty, 50);
});

ok('trajectory: standing-clears-veterans-hold binds veterans-hold', function () {
  const s = AN.summarizeSeed(seedOut([
    snap(98, { gated: 199, standing: { total: 210, war: 150, diplomacy: 0, plenty: 60, warPts: 6, links: 0, feasts: 3 },
      readiness5: { ready: false, armored: 4, armed: 9, tricks: 25, veterans: 0, short: ['veterans'] } }),
  ]));
  assert.strictEqual(s.trajectory, 'standing-clears-veterans-hold');
  assert.strictEqual(s.binding.binding, 'veterans-hold');
  assert.deepStrictEqual(s.peakShortBars, ['veterans']);
});

ok('trajectory: never-unlocked (peak gated < 100) beats standing-short', function () {
  const s = AN.summarizeSeed(seedOut([
    snap(54, { gated: 50, standing: { total: 50, war: 50, diplomacy: 0, plenty: 0, warPts: 2, links: 0, feasts: 0 } }),
  ], { unlockedWave: 3 }));
  assert.strictEqual(s.trajectory, 'never-unlocked');
  assert.strictEqual(s.binding.binding, 'diplomacy');
  assert.strictEqual(s.binding.refKind, 'peak-gated-day');
});

ok('trajectory: standing-short for peak gated 100-199 with no ready day', function () {
  const s = AN.summarizeSeed(seedOut([
    snap(95, { gated: 180, standing: { total: 180, war: 100, diplomacy: 0, plenty: 80, warPts: 4, links: 0, feasts: 4 } }),
  ]));
  assert.strictEqual(s.trajectory, 'standing-short');
  assert.strictEqual(s.binding.binding, 'diplomacy');
});

ok('precedence: ready days win over a veterans-hold peak', function () {
  const s = AN.summarizeSeed(seedOut([
    readySnap(76, 150, 100, 0, 50, true),
    snap(98, { gated: 199, standing: { total: 225, war: 200, diplomacy: 0, plenty: 25, warPts: 8, links: 0, feasts: 1 },
      readiness5: { ready: false, armored: 4, armed: 9, tricks: 25, veterans: 0, short: ['veterans'] } }),
  ]));
  assert.strictEqual(s.trajectory, 'bars-met-standing-short');
});

ok('dayBinding: argmax shortfall vs pure-path targets; diplomacy wins at 0', function () {
  const b = AN.dayBinding(snap(50, { standing: { total: 210, war: 150, diplomacy: 0, plenty: 60, warPts: 6, links: 0, feasts: 3 } }));
  assert.deepStrictEqual(b, ['diplomacy']);
});

ok('dayBinding: war wins when it is furthest from its 200 target', function () {
  const b = AN.dayBinding(snap(50, { standing: { total: 120, war: 0, diplomacy: 0, plenty: 120, warPts: 0, links: 0, feasts: 6 } }));
  // war short 200, diplomacy short 204, plenty short 0 -> diplomacy still wins; use a case where war truly leads:
  assert.deepStrictEqual(b, ['diplomacy']);
  const b2 = AN.dayBinding(snap(50, { standing: { total: 134, war: 0, diplomacy: 34, plenty: 100, warPts: 0, links: 1, feasts: 5 } }));
  assert.deepStrictEqual(b2, ['war']);
});

ok('dayBinding: tie returns all tied sources', function () {
  // war 100 -> short 100; diplomacy 204 -> short 0; plenty 0 -> short 100.
  const b = AN.dayBinding(snap(50, { standing: { total: 304, war: 100, diplomacy: 204, plenty: 0, warPts: 4, links: 6, feasts: 0 } }));
  assert.deepStrictEqual(b, ['war', 'plenty']);
});

ok('bindingSeed: day-counts across ready days, shared ties recorded', function () {
  const daily = [
    readySnap(76, 150, 100, 0, 50, true),
    readySnap(77, 175, 125, 0, 50, true),
    readySnap(78, 134, 0, 34, 100, true),
  ];
  const sum = { trajectory: 'bars-met-standing-short', readyDays: [76, 77, 78], released: false, peakGatedDay: 77 };
  const b = AN.bindingSeed(daily, sum);
  assert.strictEqual(b.binding, 'diplomacy');
  assert.deepStrictEqual(b.dayCounts, { war: 1, diplomacy: 2, plenty: 0 });
  assert.strictEqual(b.tiedDays, 0);
});

ok('bindingSeed: peak-day fallback when no ready days exist', function () {
  const daily = [
    snap(50, { standing: { total: 50, war: 50, diplomacy: 0, plenty: 0, warPts: 2, links: 0, feasts: 0 } }),
    snap(98, { gated: 199, standing: { total: 210, war: 150, diplomacy: 0, plenty: 60, warPts: 6, links: 0, feasts: 3 },
      readiness5: { ready: false, armored: 4, armed: 9, tricks: 25, veterans: 1, short: ['veterans', 'armored'] } }),
  ];
  const sum = { trajectory: 'standing-short', readyDays: [], released: false, peakGatedDay: 98 };
  const b = AN.bindingSeed(daily, sum);
  assert.strictEqual(b.binding, 'diplomacy');
  assert.strictEqual(b.refKind, 'peak-gated-day');
  assert.deepStrictEqual(b.refDays, [98]);
});

(async function () {
  const { loadGame, setupGame } = require(path.join(__dirname, 'sim-harness'));
  const INST = require(path.join(__dirname, 'standaccum-instrument-20261109'));
  const { Game } = await loadGame({ seed: 99101, mode: 'standaccum-proof', fullTelemetry: false });
  await setupGame(Game);
  const inst = INST.install(Game);
  const s0 = inst.snapshot();
  assert.strictEqual(inst.t.instrumentErrors.length, 0, '0 instrument errors on smoke');
  assert.ok(s0.standing, 'standing breakdown present');
  assert.strictEqual(s0.standing.war, (s0.standing.warPts | 0) * 25, 'war == warPts*25');
  assert.strictEqual(s0.standing.diplomacy, (s0.standing.links | 0) * 34, 'diplomacy == links*34');
  assert.strictEqual(s0.standing.plenty, (s0.standing.feasts | 0) * 20, 'plenty == qualifying feasts*20');
  assert.strictEqual(s0.standing.total, (s0.standing.war | 0) + (s0.standing.diplomacy | 0) + (s0.standing.plenty | 0), 'total == sum of components');
  assert.ok((s0.gated | 0) >= 0, 'gated total non-negative');
  assert.ok(Array.isArray(s0.links), 'link roll is an array');
  pass++; console.log('ok ' + pass + ' - live harness smoke: standing breakdown reconciles, 0 instrument errors');
  inst.uninstall();
  // Determinism leg: same seed loads twice, identical day-0 standing.
  const { Game: Game2 } = await loadGame({ seed: 99101, mode: 'standaccum-proof', fullTelemetry: false });
  await setupGame(Game2);
  const inst2 = INST.install(Game2);
  const s0b = inst2.snapshot();
  assert.deepStrictEqual(
    { gated: s0b.gated, standing: s0b.standing, ledger: s0b.ledger },
    { gated: s0.gated, standing: s0.standing, ledger: s0.ledger },
    'same seed, same day-0 standing snapshot');
  pass++; console.log('ok ' + pass + ' - determinism leg: same seed reproduces day-0 standing snapshot');
  inst2.uninstall();
  console.log('PASS ' + pass + '/' + pass);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
