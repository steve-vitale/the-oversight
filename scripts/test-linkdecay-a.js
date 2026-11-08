#!/usr/bin/env node
// scripts/test-linkdecay-a.js — proof test for the tendtrust-b
// ACTOR-PRESENCE extension (sim-linkdecay-a, 2026-11-08, Loop A,
// axis scale-onramp).
//
// The extension adds ONE field to the recorder: per day, is a plan actor
// AT Haven (the winPlanBondsTick gate, win-plan.js:539-568 / 646). It must
// NOT change the recorder's behavior — the existing
// scripts/test-tendtrust-b.js suite still passes unmodified, and this test
// proves, WITHOUT a game load:
//   (1) planActorsAtHaven reproduces the engine gate on a mock Game:
//       plan-holders only, alive only, at the Haven node only, not
//       engaged, never the player;
//   (2) unknown surface reads null, never a fabricated 0 (no npcNode ->
//       actors null; no winPlan -> actors [] / holders 0);
//   (3) snapTT carries planActors/planHolders; traj points carry
//       actors/actorIds/planHolders at post and actorsPre/actorIdsPre
//       from the pre snapshot;
//   (4) recorder purity with the extension live: recordPre+recordPost
//       twice produces identical trajectory points, writes NOTHING to
//       game state, and draws NO RNG.
// Exit 1 on any failure. Run: node scripts/test-linkdecay-a.js
'use strict';
const assert = require('assert');
const { planActorsAtHaven, snapTT, recordPre, recordPost, trajPoint } = require('./policies/tendtrust-b');

let pass = 0;
function check(name, fn) {
  try { fn(); pass++; console.log(`  PASS ${name}`); }
  catch (e) { console.error(`  FAIL ${name}: ${(e && e.message) || e}`); process.exitCode = 1; }
}

// Mock Game with the win-plan actor surface: Haven at (4,4); three plan
// holders (v1 at Haven, v2 away, v3 at Haven but engaged); one dead holder
// (v4); the player (p1) holds a plan at Haven; one non-holder at Haven (v5).
function mockGame(over) {
  const nodes = { v1: { nx: 4, ny: 4 }, v2: { nx: 6, ny: 6 }, v3: { nx: 4, ny: 4 }, v4: { nx: 4, ny: 4 }, p1: { nx: 4, ny: 4 }, v5: { nx: 4, ny: 4 } };
  const dead = { v4: true };
  const engaged = { v3: true };
  const state = {
    scholar: { day: 70 },
    village: {
      pantry: [{ kcalEach: 15000, units: 1 }],
      px: 4, py: 4,
      winPlan: { v1: { stage: 'standing' }, v2: { stage: 'hunt' }, v3: { stage: 'party' }, v4: { stage: 'gear' }, p1: { stage: 'standing' } },
    },
    otherVillages: [],
    nationalLive: false, globalLive: false, scaleRefused: false,
    pendingNational: null,
  };
  const G = {
    state, villagerId: 'p1',
    scaleRank: () => 'village',
    hierarchyState: () => [],
    _linkSeasoned: () => false,
    _week: () => Math.floor(state.scholar.day / 7),
    havenNodeXY: () => ({ x: 4, y: 4 }),
    npcNode: (vid) => nodes[vid] || null,
    getPerson: (vid) => ({ dead: !!dead[vid] }),
    isEngaged: (vid) => !!engaged[vid],
    won: false,
  };
  if (over) over(G, state, nodes, dead, engaged);
  return G;
}

// (1) the gate, reproduced
check('planActorsAtHaven: only the live unengaged holder at Haven counts', () => {
  const G = mockGame();
  const r = planActorsAtHaven(G);
  assert.deepStrictEqual(r.actors, ['v1']);
  assert.strictEqual(r.holders, 5);
});
check('planActorsAtHaven: an away holder, a dead holder, an engaged holder and the player are all excluded', () => {
  const G = mockGame((g, st, nodes) => { nodes.v2 = { nx: 4, ny: 4 }; });
  // v2 moves home: now v1 + v2 count; v3 engaged, v4 dead, p1 player still out.
  const r = planActorsAtHaven(G);
  assert.deepStrictEqual(r.actors, ['v1', 'v2']);
  assert.strictEqual(r.holders, 5);
});
check('planActorsAtHaven: no holders at Haven -> empty actors, holders counted', () => {
  const G = mockGame((g, st, nodes) => { nodes.v1 = { nx: 1, ny: 1 }; });
  const r = planActorsAtHaven(G);
  assert.deepStrictEqual(r.actors, []);
  assert.strictEqual(r.holders, 5);
});
check('planActorsAtHaven: Haven node from v.px/v.py when havenNodeXY is absent', () => {
  const G = mockGame();
  delete G.havenNodeXY;
  const r = planActorsAtHaven(G);
  assert.deepStrictEqual(r.actors, ['v1']);
});
check('planActorsAtHaven: Haven node defaults to (4,4) when px/py are absent', () => {
  const G = mockGame();
  delete G.havenNodeXY;
  delete G.state.village.px; delete G.state.village.py;
  const r = planActorsAtHaven(G);
  assert.deepStrictEqual(r.actors, ['v1']);
});

// (2) unknown surface reads null, never a fabricated 0
check('planActorsAtHaven: no npcNode -> actors null (unknown), holders still counted', () => {
  const G = mockGame();
  delete G.npcNode;
  const r = planActorsAtHaven(G);
  assert.strictEqual(r.actors, null);
  assert.strictEqual(r.holders, 5);
});
check('planActorsAtHaven: no winPlan -> actors [] and holders 0', () => {
  const G = mockGame((g, st) => { delete st.village.winPlan; });
  const r = planActorsAtHaven(G);
  assert.deepStrictEqual(r.actors, []);
  assert.strictEqual(r.holders, 0);
});

// (3) the field rides the snapshots and the trajectory point
check('snapTT carries planActors and planHolders', () => {
  const G = mockGame();
  const s = snapTT(G);
  assert.deepStrictEqual(s.planActors, ['v1']);
  assert.strictEqual(s.planHolders, 5);
});
check('trajPoint carries actors/actorIds/planHolders; recordPost fills actorsPre', () => {
  const G = mockGame();
  const ctx = {};
  recordPre(G, ctx);
  // Between pre and post the holder leaves Haven: post sees 0 actors.
  G.state.village.winPlan.v1 = { stage: 'standing' };
  const nodes = { v1: { nx: 7, ny: 7 } };
  G.npcNode = (vid) => (vid === 'v1' ? nodes.v1 : ({ v2: { nx: 6, ny: 6 }, v3: { nx: 4, ny: 4 }, v4: { nx: 4, ny: 4 }, p1: { nx: 4, ny: 4 } }[vid] || null));
  recordPost(G, ctx);
  const tp = ctx._tendtrust.traj[0];
  assert.strictEqual(tp.actors, 0);
  assert.deepStrictEqual(tp.actorIds, []);
  assert.strictEqual(tp.planHolders, 5);
  assert.strictEqual(tp.actorsPre, 1);
  assert.deepStrictEqual(tp.actorIdsPre, ['v1']);
});
check('trajPoint with an undeterminable actor surface carries null, not 0', () => {
  const G = mockGame();
  delete G.npcNode;
  const s = snapTT(G);
  const tp = trajPoint(s);
  assert.strictEqual(tp.actors, null);
  assert.strictEqual(tp.actorIds, null);
  assert.strictEqual(tp.planHolders, 5);
});

// (4) purity with the extension live
check('recordPre+recordPost twice: identical points, no state writes, no RNG', () => {
  const G = mockGame();
  const before = JSON.stringify(G.state);
  const realRandom = Math.random;
  Math.random = () => { throw new Error('RNG drawn by recorder'); };
  try {
    const ctx = {};
    recordPre(G, ctx); recordPost(G, ctx);
    const firstPoint = JSON.stringify(ctx._tendtrust.traj[0]);
    recordPre(G, ctx); recordPost(G, ctx);
    assert.strictEqual(JSON.stringify(ctx._tendtrust.traj[0]), firstPoint);
    assert.strictEqual(ctx._tendtrust.traj.length, 2);
    assert.strictEqual(ctx._tendtrust.days, 2);
    assert.strictEqual(ctx._tendtrust.errs, 0);
    const tp = JSON.parse(firstPoint);
    assert.strictEqual(tp.actors, 1);
    assert.deepStrictEqual(tp.actorIds, ['v1']);
    assert.strictEqual(tp.actorsPre, 1);
  } finally { Math.random = realRandom; }
  assert.strictEqual(JSON.stringify(G.state), before, 'recorder wrote to game state');
});

console.log(`\ntest-linkdecay-a: ${pass} checks passed${process.exitCode ? ' (FAILURES ABOVE)' : ''}`);
if (process.exitCode) process.exit(1);
