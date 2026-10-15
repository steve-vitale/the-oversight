#!/usr/bin/env node
// test-capable-greedy-20261015.js — two opt-in capable-bot modes from
// evidence/2026-10-15/diagnosis-endgame.md.
//
//  1. CAPABLE_GREEDY=1: the bot keeps the Table waiting (Overtime) while the
//     run is strong, and sits with the key, when Haven weakens, at the tier
//     cap or near the horizon. Off: never waits (the dashboard's bot).
//  2. CAPABLE_READ_STAKES=1: the bot reads the build option's "(needs X N+)"
//     label against the live meter, instead of picking it on its words.
//  3. In a real run, greedy waits through Overtime (tier >= 1) on a seed the
//     plain bot seats at once.
'use strict';
const K = require('./godpath/lib');
const H = K.H;
const T = K.reporter('test-capable-greedy-20261015');

function fakeGame(o) {
  return {
    state: { scholar: { day: o.day || 100, health: o.hp == null ? 100 : o.hp, maxHealth: 100 }, village: { roster: new Array(o.roster == null ? 8 : o.roster).fill('v') } },
  };
}

(async () => {
  global.__policyRandom = H.mulberry32(77);
  const cap = require('./policies/capable');
  const pv = (o) => Object.assign({ ready: true, overtime: 0, losses: 0, key: false }, o || {});

  T.section('1. greedy waits only when asked, and only while strong');
  delete process.env.CAPABLE_GREEDY;
  T.ok('off: never waits', cap.greedyWaits(fakeGame({}), pv()) === false);
  process.env.CAPABLE_GREEDY = '1';
  T.ok('on, strong run: waits', cap.greedyWaits(fakeGame({}), pv()) === true);
  T.ok('the key: sits', cap.greedyWaits(fakeGame({}), pv({ key: true })) === false);
  T.ok('tier cap (4): sits', cap.greedyWaits(fakeGame({}), pv({ overtime: 4 })) === false);
  T.ok('3 lost while waiting: sits', cap.greedyWaits(fakeGame({}), pv({ losses: 3 })) === false);
  T.ok('Haven under 5: sits', cap.greedyWaits(fakeGame({ roster: 4 }), pv()) === false);
  T.ok('bearer under 40% HP: sits', cap.greedyWaits(fakeGame({ hp: 30 }), pv()) === false);
  T.ok('near the horizon (day 145): sits', cap.greedyWaits(fakeGame({ day: 145 }), pv()) === false);

  T.section('2. the stake on the label is read');
  const opt = { id: 'build', label: 'Feed the Multitude. Answer as The Living Garden. (needs terror 4+)' };
  delete process.env.CAPABLE_READ_STAKES;
  const off = cap.scoreTableOption({}, opt, { meters: { terror: 3 } });
  process.env.CAPABLE_READ_STAKES = '1';
  const shortSc = cap.scoreTableOption({}, opt, { meters: { terror: 3 } });
  const okSc = cap.scoreTableOption({}, opt, { meters: { terror: 4 } });
  const cageShort = cap.scoreTableOption({}, { id: 'build', label: 'Sign it. (needs cage ≤4)' }, { meters: { cage: 5 } });
  T.ok('off: the short build option still scores on its words', off > 0, off.toFixed(1));
  T.ok('on: short of the stake, never picked', shortSc < -40 && cageShort < -40, shortSc.toFixed(1) + ' / ' + cageShort.toFixed(1));
  T.ok('on: affordable, preferred', okSc > off, okSc.toFixed(1) + ' vs ' + off.toFixed(1));
  delete process.env.CAPABLE_READ_STAKES;

  T.section('3. a real run waits through Overtime');
  // seed 1, capable, 150 days: the plain bot sits on day 93 (dashboard-diag-base16).
  process.env.CAPABLE_GREEDY = '1';
  const { Game, manifest } = await H.quietLog(() => H.loadGame({ seed: 1, mode: 'test-greedy' }));
  // MULTI-REGION WORLD (region-wave1 2026-10-14): more than one region is
  // playable now, so pickLandingRegion draws randomly. This is a behavioral
  // regression test with a fixed seed — pin the landing to the woodlands.
  Game.debugRegion = 'na_eastern_woodlands';
  // MONSTER POOL (region-wave1 2026-10-14): monsterWavePool() is wave-scoped,
  // not region-scoped (WORLD-REGIONS.md §11: monster variants and spawn
  // weights are an engine follow-up), so a new region's variants join the
  // global pool and shift this seeded run. regions.json's `monsters` field
  // names each region's variants (designed, not read by the engine yet) —
  // emulate the intended scoping by excluding region-claimed variants here.
  // On pre-wave-1 data this is a no-op (no region claims monsters).
  const claimed = new Set();
  for (const r of (Game.data.regions || [])) for (const m of (r.monsters || [])) claimed.add(typeof m === 'string' ? m : m.id);
  Game.data.monsters = (Game.data.monsters || []).filter(m => !claimed.has(m.id));
  await H.setupGame(Game);
  let maxTier = 0, satDay = null;
  const pol = Object.assign({}, cap.capable);
  pol.daily = (G, ctx) => {
    const r = cap.capable.daily(G, ctx);
    try { maxTier = Math.max(maxTier, G.overtimeTier()); if (satDay == null && G.progState().tableDone) satDay = G.state.scholar.day; } catch (e) { console.warn('probe', e.message); }
    return r;
  };
  await H.quietLog(() => H.runDays(Game, pol, { days: 150, manifest, sampleEvery: 10 }));
  T.ok('greedy reached Overtime >= 1 before sitting', maxTier >= 1, 'tier ' + maxTier + ', sat day ' + satDay);
  T.ok('and then sat', satDay != null && satDay > 93, 'sat day ' + satDay);
  delete process.env.CAPABLE_GREEDY;

  T.done();
})();
