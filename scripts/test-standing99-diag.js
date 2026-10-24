#!/usr/bin/env node
// scripts/test-standing99-diag.js — proof test for the standing99-diag
// recorder (sim-standing99-diag-a). No game harness needed: unit cases for
// the gated-total formula, pin analysis on synthetic trajectories, and
// recorder purity on a mock Game (no game-state writes, no surface when
// the gate is unset). Exit 1 on any failure.
'use strict';
const assert = require('assert');
const { gatedComputed, analyzeTrajectory, recordDaily, withStanding99Diag } = require('./policies/standing99-diag');

let n = 0;
function check(name, fn) { fn(); n++; console.log(`  ok ${n}: ${name}`); }

// --- gatedComputed: the standing.js formula, recomputed from pure reads ---
check('raw 102, rd4 unready -> gated 99 defer4', () => {
  const g = gatedComputed({ war: 0, diplomacy: 102, plenty: 0 }, false, false, 0, { t4: 100, t5: 200, plentyCapT5: 100 });
  assert.strictEqual(g.gated, 99); assert.strictEqual(g.holdKind, 'defer4'); assert.strictEqual(g.raw, 102);
});
check('raw 182, rd4 unready -> gated 99 defer4 (the prior-run pattern)', () => {
  const g = gatedComputed({ war: 0, diplomacy: 102, plenty: 80 }, false, false, 0, { t4: 100, t5: 200, plentyCapT5: 100 });
  assert.strictEqual(g.gated, 99); assert.strictEqual(g.raw, 182); assert.strictEqual(g.capped, 182);
});
check('raw 90, below t4 -> gated 90, no hold', () => {
  const g = gatedComputed({ war: 25, diplomacy: 65, plenty: 0 }, false, false, 0, { t4: 100, t5: 200, plentyCapT5: 100 });
  assert.strictEqual(g.gated, 90); assert.strictEqual(g.holdKind, 'none');
});
check('raw 100, rd4 ready -> gated 100 released', () => {
  const g = gatedComputed({ war: 25, diplomacy: 75, plenty: 0 }, true, false, 0, { t4: 100, t5: 200, plentyCapT5: 100 });
  assert.strictEqual(g.gated, 100); assert.strictEqual(g.holdKind, 'none');
});
check('peak 4 ratchet floors a decayed raw 75 at 100', () => {
  const g = gatedComputed({ war: 75, diplomacy: 0, plenty: 0 }, true, false, 4, { t4: 100, t5: 200, plentyCapT5: 100 });
  assert.strictEqual(g.gated, 100); assert.strictEqual(g.holdKind, 'floor');
});
check('raw 210 with plenty 150 -> plenty cap holds at 199', () => {
  const g = gatedComputed({ war: 25, diplomacy: 35, plenty: 150 }, true, true, 4, { t4: 100, t5: 200, plentyCapT5: 100 });
  assert.strictEqual(g.raw, 210); assert.strictEqual(g.capped, 160); assert.strictEqual(g.gated, 199); assert.strictEqual(g.holdKind, 'cap');
});
check('capped 210, rd5 unready, peak 4 -> defer5 holds at 199', () => {
  const g = gatedComputed({ war: 75, diplomacy: 68, plenty: 80 }, true, false, 4, { t4: 100, t5: 200, plentyCapT5: 100 });
  assert.strictEqual(g.capped, 223); assert.strictEqual(g.gated, 199); assert.strictEqual(g.holdKind, 'defer5');
});
check('raw 200, both ready -> gated 200', () => {
  const g = gatedComputed({ war: 75, diplomacy: 68, plenty: 57 }, true, true, 4, { t4: 100, t5: 200, plentyCapT5: 100 });
  assert.strictEqual(g.gated, 200); assert.strictEqual(g.holdKind, 'none');
});

// --- analyzeTrajectory on a synthetic pinned trajectory ---
function synthPoint(day, war, diplomacy, plenty, rd4ready) {
  const raw = war + diplomacy + plenty;
  const gated = raw >= 100 && !rd4ready ? 99 : raw;
  return { day, war, diplomacy, plenty, warPts: 0, links: 0, feasts: 0, raw, capped: raw, gated,
    holdKind: gated < raw ? 'defer4' : 'none', defer4: raw >= 100 && !rd4ready, defer5: false, capHold: false,
    peak: 0, rd4: { ready: rd4ready, armored: 1, armed: 2, tricks: 1, veterans: 0, demand: { armored: 3, armed: 5, tricks: 3, veterans: 1 }, short: rd4ready ? [] : ['veterans'] },
    rd5: { ready: false, armored: 0, armed: 0, tricks: 0, veterans: 0, demand: null, short: ['armor', 'weapons', 'veterans'] },
    unlockedWave: gated >= 100 ? 4 : 3, errs: 0 };
}
check('synthetic pin: first pin day, days pinned, at-pin components, stall', () => {
  const traj = [
    synthPoint(10, 0, 34, 0, false),
    synthPoint(20, 0, 68, 0, false),
    synthPoint(30, 0, 68, 20, false),
    synthPoint(40, 0, 102, 20, false), // raw 122 -> gated 99, first pin
    synthPoint(50, 0, 102, 20, false),
    synthPoint(60, 0, 136, 20, false), // diplomacy still grows UNDER the pin
    synthPoint(70, 0, 136, 20, false),
  ];
  const a = analyzeTrajectory(traj);
  assert.strictEqual(a.pinned, true);
  assert.strictEqual(a.firstPinDay, 40);
  assert.strictEqual(a.daysPinned, 4);
  assert.deepStrictEqual([a.atPin.war, a.atPin.diplomacy, a.atPin.plenty], [0, 102, 20]);
  assert.strictEqual(a.maxRaw.raw, 156);
  assert.strictEqual(a.maxCapped.capped, 156);
  assert.strictEqual(a.t5Approach.distToT5, 44);
  const dipl = a.components.find(c => c.component === 'diplomacy');
  const plen = a.components.find(c => c.component === 'plenty');
  assert.strictEqual(dipl.deltaPinToEnd, 34); // grew under the pin — the hold hides growth
  assert.strictEqual(plen.deltaPinToEnd, 0);
  assert.strictEqual(plen.lastIncreaseDay, 30);
  assert.ok(a.stalledAll.includes('plenty'));
});
check('synthetic no-pin: pinned=false, null pin fields, no crash', () => {
  const traj = [synthPoint(10, 0, 34, 0, false), synthPoint(20, 0, 68, 0, false)];
  const a = analyzeTrajectory(traj);
  assert.strictEqual(a.pinned, false);
  assert.strictEqual(a.firstPinDay, null);
  assert.strictEqual(a.daysPinned, 0);
  assert.strictEqual(a.atPin, null);
});
check('analyzeTrajectory(null) -> null', () => {
  assert.strictEqual(analyzeTrajectory(null), null);
  assert.strictEqual(analyzeTrajectory([]), null);
});

// --- recorder purity on a mock Game ---
function mockGame(breakdown) {
  return {
    state: { scholar: { day: 42 }, _standingPeakWave: 0 },
    villageStanding: () => ({ ...breakdown }),
    standingCfg: () => ({ t4: 100, t5: 200, plentyCapT5: 100, warPerKill: 25, diplomacyPerLink: 34, plentyPerFeast: 20 }),
    waveUnlockReady: (w) => (w === 4
      ? { ready: false, armored: 1, armed: 2, tricks: 1, veterans: 0, demand: { armored: 3, armed: 5, tricks: 3, veterans: 1 }, short: ['veterans'] }
      : { ready: false, armored: 0, armed: 0, tricks: 0, veterans: 0, demand: null, short: ['armor', 'weapons', 'veterans'] }),
    unlockedWave: () => 3,
  };
}
check('recordDaily writes only ctx, never game state, and tracks growth', () => {
  const Game = mockGame({ war: 0, diplomacy: 102, plenty: 0, warPts: 0, links: 3, feasts: 0 });
  const ctx = {};
  process.env.STANDING99 = '1';
  recordDaily(Game, ctx);
  // The test itself advances the day (as the engine would); the recorder
  // must add nothing else to game state — no peak write, no new keys.
  Game.state.scholar.day = 43;
  const beforeSecond = JSON.stringify(Game.state);
  Game.villageStanding = () => ({ war: 0, diplomacy: 102, plenty: 20, warPts: 0, links: 3, feasts: 1 });
  recordDaily(Game, ctx);
  assert.strictEqual(JSON.stringify(Game.state), beforeSecond);
  const D = ctx._standing99diag;
  assert.strictEqual(D.traj.length, 2);
  assert.strictEqual(D.traj[0].gated, 99);
  assert.strictEqual(D.traj[0].holdKind, 'defer4');
  assert.strictEqual(D.traj[1].plenty, 20);
  assert.strictEqual(D.traj[1].raw, 122);
  assert.strictEqual(D.traj[1].gated, 99); // still held — growth hidden by the hold
  assert.strictEqual(D.errs, 0);
});
check('gate unset: wrapped daily creates no recorder surface', () => {
  delete process.env.STANDING99;
  const inner = { daily: () => 'inner-result' };
  const wrapped = withStanding99Diag(inner, 'standing99-diag', 'test');
  const ctx = {};
  const r = wrapped.daily(mockGame({ war: 0, diplomacy: 0, plenty: 0, warPts: 0, links: 0, feasts: 0 }), ctx);
  assert.strictEqual(r, 'inner-result');
  assert.strictEqual(ctx._standing99diag, undefined);
});
check('gate set: wrapped daily records after inner daily', () => {
  process.env.STANDING99 = '1';
  const inner = { daily: () => 'inner-result' };
  const wrapped = withStanding99Diag(inner, 'standing99-diag', 'test');
  const ctx = {};
  wrapped.daily(mockGame({ war: 0, diplomacy: 68, plenty: 0, warPts: 0, links: 2, feasts: 0 }), ctx);
  assert.strictEqual(ctx._standing99diag.traj.length, 1);
  assert.strictEqual(ctx._standing99diag.traj[0].gated, 68);
  delete process.env.STANDING99;
});

console.log(`\ntest-standing99-diag: ${n} checks passed`);
