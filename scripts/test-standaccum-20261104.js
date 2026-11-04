// test-standaccum-20261104.js — proof test for the standing-accumulation
// diag instrument + analyzer (arm sim-standaccum-b). Fixture-based
// (link-reason counting, transition events, trajectory classes,
// top-missing naming, gear-ready detection, end-snapshot rule) plus
// two live harness legs: (1) a fresh loaded game snapshots with the
// standing breakdown reconciling exactly (war == warPts*25,
// diplomacy == links*34, plenty == qualifying feasts*20, gated >= 0)
// and zero instrument errors; (2) determinism: the same seed loads
// twice and yields identical day-0 standing snapshots.
// Usage: node scripts/test-standaccum-20261104.js
'use strict';
const path = require('path');
const assert = require('assert');
const AN = require(path.join(__dirname, 'standaccum-analyze-20261104'));

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('ok ' + pass + ' - ' + name); }

function snap(day, over) {
  return Object.assign({
    day: day, living: 5, gated: 0,
    standing: { total: 0, war: 0, diplomacy: 0, plenty: 0, warPts: 0, links: 0, feasts: 0 },
    ledger: { 3: 0, 4: 0, 5: 0 }, links: [],
    feasts: { total: 0, qualifying: 0, subquality: 0, entries: [] },
    readiness5: { ready: false, armored: 0, armed: 0, tricks: 0, veterans: 0 },
    w4faced: false, peakWave: 0,
  }, over || {});
}
function seedOut(daily, over) {
  return Object.assign({ seed: 99101, run: 'fixture', days: 100, endReason: 'village-lost',
    won: false, villageLost: true, scaleRank: 'regional', maxWave: 4, unlockedWave: 4,
    standing: 0, daily: daily, instrumentErrors: [] }, over || {});
}

ok('link reason counts: counts/too-young/low-trust/not-regional split', function () {
  const s = snap(50, { links: [
    { key: 'a', reason: 'counts' }, { key: 'b', reason: 'too-young' },
    { key: 'c', reason: 'low-trust' }, { key: 'd', reason: 'not-regional' },
    { key: 'e', reason: 'not-regional' },
  ] });
  const c = AN.countLinksByReason(s);
  assert.strictEqual(c.counts, 1); assert.strictEqual(c['too-young'], 1);
  assert.strictEqual(c['low-trust'], 1); assert.strictEqual(c['not-regional'], 2);
  assert.strictEqual(c.total, 5);
});

ok('deriveEvents: link appears, reason change, vanishes, feast, ledger gain', function () {
  const prev = snap(10, { links: [{ key: 'a|x', other: 'A', reason: 'too-young' }, { key: 'b|x', other: 'B', reason: 'counts' }],
    feasts: { total: 1, entries: [{ day: 5, quality: 1 }] }, ledger: { 3: 2, 4: 0, 5: 0 } });
  const cur = snap(11, { links: [{ key: 'a|x', other: 'A', reason: 'counts' }, { key: 'c|x', other: 'C', reason: 'too-young' }],
    feasts: { total: 2, entries: [{ day: 5, quality: 1 }, { day: 11, quality: 0 }] }, ledger: { 3: 3, 4: 0, 5: 0 } });
  const evs = AN.deriveEvents(prev, cur);
  const kinds = evs.map(function (e) { return e.kind; }).sort();
  assert.deepStrictEqual(kinds, ['feast-added', 'ledger-gain', 'link-appears', 'link-reason-change', 'link-vanishes']);
});

ok('trajectory: bread-capped when plenty at cap and war+diplomacy < 100', function () {
  const s = AN.summarizeSeed(seedOut([
    snap(50, { gated: 150, standing: { total: 170, war: 25, diplomacy: 34, plenty: 110, warPts: 1, links: 1, feasts: 6 } }),
  ], { unlockedWave: 4 }));
  assert.strictEqual(s.trajectory, 'bread-capped');
});

ok('trajectory: diplomacy-starved when diplomacy 0 with near-miss pool', function () {
  const s = AN.summarizeSeed(seedOut([
    snap(50, { gated: 60, standing: { total: 60, war: 50, diplomacy: 0, plenty: 10, warPts: 2, links: 0, feasts: 1 },
      links: [{ key: 'a', reason: 'too-young' }, { key: 'b', reason: 'not-regional' }] }),
  ], { unlockedWave: 3 }));
  assert.strictEqual(s.trajectory, 'diplomacy-starved');
});

ok('trajectory: war-starved when war < 50 and no ledger growth in prior 30d', function () {
  const s = AN.summarizeSeed(seedOut([
    snap(10, { standing: { total: 20, war: 0, diplomacy: 0, plenty: 20, warPts: 0, links: 0, feasts: 1 } }),
    snap(50, { gated: 40, standing: { total: 40, war: 0, diplomacy: 0, plenty: 40, warPts: 0, links: 0, feasts: 2 },
      readiness5: { ready: false, armored: 4, armed: 6, tricks: 5, veterans: 0 } }),
  ], { unlockedWave: 3 }));
  assert.strictEqual(s.trajectory, 'war-starved');
});

ok('trajectory: released when wave 5 unlocked', function () {
  const s = AN.summarizeSeed(seedOut([
    snap(90, { gated: 200, standing: { total: 210, war: 100, diplomacy: 68, plenty: 40, warPts: 4, links: 2, feasts: 2 }, peakWave: 5 }),
  ], { unlockedWave: 5 }));
  assert.strictEqual(s.trajectory, 'released');
});

ok('top missing = smallest gate-effective component; plenty capped at 100', function () {
  const s = AN.summarizeSeed(seedOut([
    snap(70, { gated: 150, standing: { total: 250, war: 25, diplomacy: 68, plenty: 160, warPts: 1, links: 2, feasts: 8 } }),
  ], { unlockedWave: 4 }));
  assert.strictEqual(s.topMissing, 'war');
});

ok('gear-ready days use gear bars only, independent of tricks/veterans', function () {
  const s = AN.summarizeSeed(seedOut([
    snap(30, { readiness5: { ready: false, armored: 4, armed: 6, tricks: 1, veterans: 0 } }),
    snap(31, { readiness5: { ready: false, armored: 3, armed: 6, tricks: 9, veterans: 2 } }),
  ]));
  assert.deepStrictEqual(s.gearReadyDays, [30]);
  assert.deepStrictEqual(s.readyDays, []);
});

ok('end = last snapshot with living >= 1, not the post-collapse tail', function () {
  const s = AN.summarizeSeed(seedOut([
    snap(80, { living: 2, gated: 120, standing: { total: 120, war: 50, diplomacy: 34, plenty: 36, warPts: 2, links: 1, feasts: 2 } }),
    snap(81, { living: 0, gated: 0, standing: { total: 0, war: 0, diplomacy: 0, plenty: 0, warPts: 0, links: 0, feasts: 0 } }),
  ]));
  assert.strictEqual(s.endDay, 80);
  assert.strictEqual(s.endGated, 120);
});

ok('prior-30d deltas anchor on first gear-ready day', function () {
  const s = AN.summarizeSeed(seedOut([
    snap(10, { standing: { total: 40, war: 0, diplomacy: 0, plenty: 40, warPts: 0, links: 0, feasts: 2 } }),
    snap(40, { readiness5: { ready: false, armored: 4, armed: 6, tricks: 2, veterans: 0 },
      standing: { total: 74, war: 0, diplomacy: 34, plenty: 40, warPts: 0, links: 1, feasts: 2 } }),
  ]));
  assert.strictEqual(s.anchorDay, 40);
  assert.strictEqual(s.prior30deltas.diplomacy, 34);
  assert.strictEqual(s.prior30deltas.raw, 34);
});

(async function () {
  const { loadGame, setupGame } = require(path.join(__dirname, 'sim-harness'));
  const INST = require(path.join(__dirname, 'standaccum-instrument-20261104'));
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
