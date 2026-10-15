#!/usr/bin/env node
// test-capable-water-route-20261015.js — the capable bot goes around a
// blocked path and walks home to drink (tuning 2026-10-15,
// evidence/2026-10-15/tuning-log.md round 1).
//
// The bug: competent.walkTo stopped at the first refused step, so a fallen
// tree guarding Haven's approach left the bearer one tile from home for days;
// and nothing sent a fed-but-parched bearer home. 18 of 64 baseline runs had
// a player dehydration death; after the fix, 4 deaths in 64 runs.
//   1. walkTo + COMPETENT_ROUTE_AROUND: from (3,5) with Haven's west side
//      blocked, the bot reaches Haven by a side step. Without the gate it
//      stays put (legacy policies unchanged).
//   2. capable.daily: no water carried, hydration 20, away from Haven ->
//      walks home and drinks (thirstHome fires, hydration rises).
'use strict';
const K = require('./godpath/lib');
const H = K.H;
const C = require('./policies/competent');
const { capable } = require('./policies/capable');

const T = K.reporter('test-capable-water-route-20261015');

function blockHavenWest(Game) {
  const h = Game.tileAt(4, 4);
  h.blockFrom = { type: 'fallen_tree', dx: -1, dy: 0 }; // guards entries from the west
}

(async () => {
  global.__policyRandom = H.mulberry32(4242);
  const Game = await K.load({ seed: 7 });

  T.section('1. route around a fallen tree');
  {
    K.newRun(Game);
    blockHavenWest(Game);
    Game.map.px = 3; Game.map.py = 5;
    T.ok('the direct step is blocked', !!Game.travelBlockage(4, 4), JSON.stringify(Game.travelBlockage(4, 4)));
    const prev = process.env.COMPETENT_ROUTE_AROUND;
    delete process.env.COMPETENT_ROUTE_AROUND;
    C.walkTo(Game, 4, 4);
    T.ok('legacy walkTo (gate off) stays put', Game.map.px === 3 && Game.map.py === 5, `at ${Game.map.px},${Game.map.py}`);
    process.env.COMPETENT_ROUTE_AROUND = '1';
    C.walkTo(Game, 4, 4);
    T.ok('route-around walkTo reaches Haven', Game.map.px === 4 && Game.map.py === 4, `at ${Game.map.px},${Game.map.py}`);
    if (prev === undefined) delete process.env.COMPETENT_ROUTE_AROUND; else process.env.COMPETENT_ROUTE_AROUND = prev;
  }

  T.section('2. thirsty and dry: walk home and drink');
  {
    K.newRun(Game);
    blockHavenWest(Game);
    Game.map.px = 3; Game.map.py = 5;
    const s = Game.state.scholar;
    s.water = [];
    s.hydration = 20;
    const v = Game.state.village;
    v.water = { clean: 30, dirty: 0 };
    const ctx = { notes: [] };
    try { capable.daily(Game, ctx); } catch (e) { T.ok('daily ran without throwing', false, e.message); }
    T.ok('thirstHome fired', (ctx.thirstHome || 0) >= 1, JSON.stringify({ thirstHome: ctx.thirstHome, err: ctx.thirstHomeErr }));
    T.ok('hydration rose (drank)', (s.hydration || 0) > 20, 'hydration ' + s.hydration);
    T.ok('process env restored after the bot call', process.env.COMPETENT_ROUTE_AROUND === undefined);
  }

  T.done();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
