#!/usr/bin/env node
// scripts/test-binddiag-b.js — proof test for the binddiag-b recorder
// (sim-binddiag-b, 2026-11-08, flesh-out loop B, axis scale-onramp).
//
// Proves, WITHOUT a game load:
//   (1) qualifyFromCounts: the pipeline qualification logic on synthetic
//       link counts (lead at 3 seasoned subs, conquest shape, belong bar,
//       covenant/trade at 3 seasoned peers, shape priority order);
//   (2) computeGated: the standing.js gated-total formula on synthetic
//       inputs (defer4 pin at 99, defer5 at 199, plenty cap, peak floor,
//       released totals);
//   (3) recorder purity on a mock Game: recordDaily twice produces
//       identical snapshots, writes NOTHING to game state (deep-equal
//       before/after), and draws NO RNG (Math.random patched to throw).
// Exit 1 on any failure. Run: node scripts/test-binddiag-b.js
'use strict';
const assert = require('assert');
const { computeGated, qualifyFromCounts, snapBinding, recordDaily, ensureBD } = require('./policies/binddiag-b');

let pass = 0;
function check(name, fn) {
  try { fn(); pass++; console.log(`  PASS ${name}`); }
  catch (e) { console.error(`  FAIL ${name}: ${(e && e.message) || e}`); process.exitCode = 1; }
}

// (1) qualifyFromCounts
check('lead qualifies at exactly 3 seasoned subs', () => {
  const q = qualifyFromCounts({ seasonedSubs: 3, allConquered: false, belongGood: false, foreignSize: 0, seasonedCov: 0, seasonedTrade: 0 });
  assert.strictEqual(q.lead, true); assert.strictEqual(q.leadShape, 'lead'); assert.deepStrictEqual(q.shapes, ['lead']);
});
check('lead does NOT qualify at 2 seasoned subs', () => {
  const q = qualifyFromCounts({ seasonedSubs: 2, allConquered: false, belongGood: false, foreignSize: 0, seasonedCov: 0, seasonedTrade: 0 });
  assert.strictEqual(q.lead, false); assert.strictEqual(q.any, false);
});
check('conquest shape when every sub was taken by force', () => {
  const q = qualifyFromCounts({ seasonedSubs: 3, allConquered: true, belongGood: false, foreignSize: 0, seasonedCov: 0, seasonedTrade: 0 });
  assert.strictEqual(q.leadShape, 'conquest'); assert.deepStrictEqual(q.shapes, ['conquest']);
});
check('belong needs good standing AND a foreign 4-realm', () => {
  const no = qualifyFromCounts({ seasonedSubs: 0, allConquered: false, belongGood: true, foreignSize: 3, seasonedCov: 0, seasonedTrade: 0 });
  assert.strictEqual(no.belong, false);
  const yes = qualifyFromCounts({ seasonedSubs: 0, allConquered: false, belongGood: true, foreignSize: 4, seasonedCov: 0, seasonedTrade: 0 });
  assert.strictEqual(yes.belong, true); assert.deepStrictEqual(yes.shapes, ['belong']);
});
check('covenant/trade qualify at 3 seasoned peers each', () => {
  const q = qualifyFromCounts({ seasonedSubs: 0, allConquered: false, belongGood: false, foreignSize: 0, seasonedCov: 3, seasonedTrade: 3 });
  assert.strictEqual(q.covenant, true); assert.strictEqual(q.trade, true);
  assert.deepStrictEqual(q.shapes, ['covenant', 'trade']);
});
check('shape priority order is lead, belong, covenant, trade', () => {
  const q = qualifyFromCounts({ seasonedSubs: 3, allConquered: false, belongGood: true, foreignSize: 4, seasonedCov: 3, seasonedTrade: 3 });
  assert.deepStrictEqual(q.shapes, ['lead', 'belong', 'covenant', 'trade']);
});

// (2) computeGated — the standing.js formula
check('defer4 pin: raw 102, rd4 unready, peak 0 -> gated 99', () => {
  const g = computeGated(102, 102, false, false, 0, 100, 200);
  assert.strictEqual(g.gated, 99); assert.deepStrictEqual(g.holds, ['defer4']); assert.deepStrictEqual(g.binding, ['defer4']);
});
check('defer5 pin: raw 292 capped 252, rd5 unready -> gated 199', () => {
  const g = computeGated(292, 252, true, false, 4, 100, 200);
  assert.strictEqual(g.gated, 199); assert.deepStrictEqual(g.holds, ['defer5']);
});
check('plenty cap: raw 250 capped 150 -> gated 199 (cap hold)', () => {
  const g = computeGated(250, 150, true, true, 0, 100, 200);
  assert.strictEqual(g.gated, 199); assert.deepStrictEqual(g.holds, ['cap']);
});
check('released: rd4 ready, raw 172 -> gated 172, no holds', () => {
  const g = computeGated(172, 172, true, false, 0, 100, 200);
  assert.strictEqual(g.gated, 172); assert.deepStrictEqual(g.holds, []);
});
check('peak floor: peak 4, raw collapsed to 65 -> gated 100', () => {
  const g = computeGated(65, 65, false, false, 4, 100, 200);
  assert.strictEqual(g.gated, 100); assert.deepStrictEqual(g.holds, []);
});
check('below bar: raw 60, nothing held -> gated 60', () => {
  const g = computeGated(60, 60, false, false, 0, 100, 200);
  assert.strictEqual(g.gated, 60); assert.deepStrictEqual(g.holds, []);
});
check('tightest hold binds: raw 250 capped 150 + rd5 unready -> cap 199 wins over defer5 199 (tie, both named)', () => {
  const g = computeGated(250, 150, true, false, 0, 100, 200);
  assert.strictEqual(g.gated, 199);
});

// (3) recorder purity on a mock Game
function mockGame() {
  const state = {
    scholar: { day: 70 },
    networkLive: true, networkLiveDay: 30,
    nationalLive: false, globalLive: false, scaleRefused: false,
    pendingNational: null, _natDefer: {},
    foreignPolities: [{ primary: 'v2', subs: ['v3', 'v4'], day: 10 }],
    feastLog: [],
    waveKillLog: [],
    monsterCounters: {},
  };
  const links = [
    { id: 'l1', status: 'active', primary: 'haven', subordinate: 'v1', day: 20, trust: 55, conquered: false },
    { id: 'l2', status: 'active', primary: 'haven', subordinate: 'v2', day: 22, trust: 61, conquered: false },
    { id: 'l3', status: 'active', primary: 'haven', subordinate: 'v3', day: 25, trust: 44, conquered: false },
    { id: 'l4', status: 'active', primary: 'haven', subordinate: 'v4', day: 60, trust: 33, conquered: false },
  ];
  return {
    state,
    scaleRank: () => (state.nationalLive ? 'national' : state.networkLive ? 'regional' : 'village'),
    hierarchyState: () => links,
    _linkSeasoned: (l, forConquest, forPolity) => {
      if (!l || l.status !== 'active') return false;
      if ((state.scholar.day - (l.day || 0)) < 30) return false;
      if (forConquest) return true;
      return (l.trust || 0) >= 40;
    },
    villageStanding: () => ({ total: 102, war: 0, diplomacy: 102, plenty: 0, warPts: 0, links: 3, feasts: 0 }),
    standingCfg: () => ({ t4: 100, t5: 200, plentyCapT5: 100 }),
    waveUnlockReady: (w) => ({ wave: w, ready: false, armored: 4, armed: 9, tricks: 17, veterans: 0, demand: { armored: 3, armed: 5, tricks: 3, veterans: 1 }, short: ['veterans'] }),
    _standingPeakWave: () => 0,
    unlockedWave: () => 3,
    won: false,
  };
}
check('mock snap: 3 seasoned subs at day 70 qualify LEAD', () => {
  const G = mockGame();
  const s = snapBinding(G);
  assert.strictEqual(s.links.subs, 4);
  assert.strictEqual(s.links.seasonedSubs, 3);
  assert.strictEqual(s.qualify.lead, true);
  assert.strictEqual(s.qualify.leadShape, 'lead');
  assert.strictEqual(s.standing.gated, 99);
  assert.deepStrictEqual(s.standing.holds, ['defer4']);
  assert.strictEqual(s.standing.rd4.veterans, 0);
});
check('mock snap: young 4th sub is not seasoned (trust 33, 10d old)', () => {
  const G = mockGame();
  const s = snapBinding(G);
  const young = s.links.subsDetail.find(d => d.id === 'v4');
  assert.strictEqual(young.seasoned, false);
  assert.strictEqual(young.trustGap, 7);
  assert.strictEqual(young.daysToSeason, 20);
});
check('recordDaily twice: identical snapshots, no state writes, no RNG draw', () => {
  const G = mockGame();
  const before = JSON.stringify(G.state);
  const realRandom = Math.random;
  Math.random = () => { throw new Error('RNG drawn by recorder'); };
  try {
    const ctx = {};
    recordDaily(G, ctx);
    const firstPoint = JSON.stringify(ctx._binddiag.traj[0]);
    const firstDays = JSON.stringify(ctx._binddiag.first);
    recordDaily(G, ctx);
    assert.strictEqual(JSON.stringify(ctx._binddiag.traj[0]), firstPoint);
    assert.strictEqual(ctx._binddiag.traj.length, 2);
    assert.strictEqual(JSON.stringify(ctx._binddiag.first), firstDays);
    assert.strictEqual(ctx._binddiag.days, 2);
    assert.strictEqual(ctx._binddiag.errs, 0);
  } finally { Math.random = realRandom; }
  assert.strictEqual(JSON.stringify(G.state), before, 'recorder wrote to game state');
});
check('recordDaily infers a same-day staged+answered beat from a nationalLive flip', () => {
  const G = mockGame();
  const ctx = {};
  recordDaily(G, ctx); // day 70, regional, no pending
  // The substrate answers a staged beat the same tick it stages: the
  // end-of-day sample never sees pendingNational, but nationalLive flips
  // on with the engine-stamped shape. The beat must be inferred, not lost.
  G.state.nationalLive = true; G.state.nationalShape = 'lead'; G.state.nationalDay = 71;
  G.state.scholar.day = 71;
  recordDaily(G, ctx);
  assert.strictEqual(ctx._binddiag.beats.length, 1);
  assert.strictEqual(ctx._binddiag.beats[0].outcome, 'answered');
  assert.strictEqual(ctx._binddiag.beats[0].shape, 'lead');
  assert.strictEqual(ctx._binddiag.beats[0].inferred, 'same-day');
  assert.strictEqual(ctx._binddiag.beats[0].stagedDay, 71);
  assert.strictEqual(ctx._binddiag.first.pendingDay, 71);
  assert.strictEqual(ctx._binddiag.first.pendingShape, 'lead');
  assert.strictEqual(ctx._binddiag.first.nationalDay, 71);
});
check('recordDaily detects a staged beat and its answer', () => {
  const G = mockGame();
  const ctx = {};
  recordDaily(G, ctx); // day 70, no pending
  G.state.pendingNational = { shape: 'lead', day: 71, villages: ['haven', 'v1', 'v2', 'v3'] };
  G.state.scholar.day = 71;
  recordDaily(G, ctx); // staged
  assert.strictEqual(ctx._binddiag.beats.length, 1);
  assert.strictEqual(ctx._binddiag.beats[0].shape, 'lead');
  G.state.pendingNational = null;
  G.state.nationalLive = true; G.state.nationalShape = 'lead'; G.state.nationalDay = 72;
  G.state.scholar.day = 72;
  recordDaily(G, ctx); // answered
  assert.strictEqual(ctx._binddiag.beats[0].outcome, 'answered');
  assert.strictEqual(ctx._binddiag.first.nationalDay, 72);
  assert.strictEqual(ctx._binddiag.first.nationalShape, 'lead');
  G.state.nationalLive = false;
  G.state.scholar.day = 73;
  recordDaily(G, ctx); // lost
  assert.strictEqual(ctx._binddiag.nationalLost.length, 1);
  assert.strictEqual(ctx._binddiag.nationalLost[0].day, 73);
});
check('recordDaily detects a beat that dies unanswered', () => {
  const G = mockGame();
  const ctx = {};
  G.state.pendingNational = { shape: 'belong', day: 71, villages: ['haven', 'v2'] };
  G.state.scholar.day = 71;
  recordDaily(G, ctx);
  G.state.pendingNational = null;
  G.state.scholar.day = 72;
  recordDaily(G, ctx);
  assert.strictEqual(ctx._binddiag.beats[0].outcome, 'died');
});

console.log(`\ntest-binddiag-b: ${pass} checks passed${process.exitCode ? ' (FAILURES ABOVE)' : ''}`);
if (process.exitCode) process.exit(1);
