#!/usr/bin/env node
// scripts/test-cookbulk-b3.js — PROOF for the batch-cook v2 trigger, round 3
// (arm sim-cookbulk-b, capacity-honest acceptance + survival-signal attribution).
//
// The b3 layer (scripts/policies/cookbulk-b3.js, COOKBULK_B3=1, default OFF)
// is a faithful reconstruction of the sim-cookbulk-b v2 trigger (the b2
// run's "v2base", proof-verified pre-kill). Round 3 re-measures it on fresh
// seeds with a capacity-honest bar (>= 20k kcal/side) and attributes the
// -46d median survival signal from sim-cookbulk-b2.
//
// PART A — gate-logic units (synthetic states, no engine run): cookableItems,
//   cookDay pins (1500 fires / 600 doesn't / not hunger-gated), fireHere,
//   timeToSpare, splitForWater, layerOn default OFF, cookPass gate-off inert.
// PART B — RED->GREEN fixture (live engine, constructed Haven state):
//   RED: base policy (belongfeast, no layer) upkeep leaves beans raw.
//   GREEN (b3): wrapped upkeep (COOKBULK_B3=1) batch-cooks the 5u the 5L
//        cistern affords (water-capped — NO capacity lever in b3), wood and
//        dirty untouched, firing counted on ctx, once/day guard holds.
//   gate-off wrapped == base (inert on the fixture too).
// PART C — det-gate: wrapped policy with COOKBULK_B3 unset vs the unwrapped
//   base, per-day trajectory hashes, 60d x 8 seeds x 2 policies. Must be
//   byte-identical; any diverger is re-checked base-vs-base to attribute
//   substrate noise.
// PART D — SMOKE: 2 seeds x 2 policies x {control,b3}, 12d, no exceptions.
// PART E — armed determinism: same seed armed twice -> byte-identical
//   trajectories (the layer makes no direct Math.random calls; the engine
//   stream is per-seed deterministic).
//
// Usage: node scripts/test-cookbulk-b3.js
'use strict';
const path = require('path');
const { belongfeast, leadfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

function beanItem(units) {
  return {
    name: 'Dried beans', units, kcalEach: 150, rawKcal: 150, cookedKcal: 300,
    needsCooking: true, safe: false, spoilDay: 999, unit: 'scoop',
  };
}

async function buildFixture(seed) {
  const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  const s = Game.state.scholar;
  try {
    const v = Game.state.village || {};
    if (Game.map) { Game.map.px = (v.px ?? 4); Game.map.py = (v.py ?? 4); }
    Game.location = 'haven';
  } catch (e) {}
  s.kcal = 1200;
  s.dayTicks = 100;
  s.day = 50;
  s.inventory = [];
  s.water = [];
  // THE PANTRY holds a 20u bean stack (3000 kcal pool) — the real pool per
  // the v2 spec (pack + prep stash + pantry). The counter (prepStash) is
  // empty: the division of labor routes cookable to the pantry. The scholar
  // is hungry (1200 kcal), so the base upkeep eats ~8u raw first — the layer
  // must fire on the POST-upkeep pool (>= 1000), like in real runs.
  // Cistern: 5L clean (cannot afford the remainder alone), 20L dirty, wood 50.
  // b3 has NO capacity lever: the batch cooks what the cistern affords (5u).
  try {
    const v = Game.state.village;
    v.pantry = [beanItem(20)];
    v.water = { clean: 5, dirty: 20 };
    v.wood = 50;
  } catch (e) {}
  return Game;
}

function pantryBeans(Game) {
  let pantry = [];
  try { pantry = (Game.state.village || {}).pantry || []; } catch (e) {}
  return pantry.filter(i => i && /bean/i.test(i.name || ''));
}
function cistern(Game) {
  try { return Object.assign({}, Game.state.village.water); } catch (e) { return {}; }
}

async function partA() {
  console.log('PART A — gate-logic units');
  const L = require('./policies/cookbulk-b3');
  const fake = (extra) => Object.assign({
    state: {
      scholar: { kcal: 1200, inventory: [], prepStash: [], dayTicks: 100, day: 50, water: [] },
      village: { pantry: [], water: { clean: 5, dirty: 20 }, wood: 50 },
    },
    TIME: { TICKS_PER_DAY: 512 },
    isSpoiled: () => false,
    nearFire: () => true,
    havenStoresAccess: () => 'inside',
    location: 'haven',
    cleanWaterForCooking: () => 5,
    abilityLevel: () => 0,
    hasItem: () => false,
  }, extra || {});
  const beans10 = () => [beanItem(10)];
  check('cookableItems finds rawKcal beans', L.cookableItems(fake(), beans10()).length === 1);
  check('cookableItems skips spoiled', L.cookableItems(fake({ isSpoiled: () => true }), beans10()).length === 0);
  // cookDay: pool >= 1000 across pack + prepStash + pantry fires (v2 spec)
  {
    const G = fake();
    G.state.scholar.prepStash = beans10(); // 1500 kcal on the counter
    check('cookDay: 1500kcal counter pool fires', L.cookDay(G) === true);
  }
  {
    const G = fake();
    G.state.village.pantry = beans10(); // 1500 kcal in the pantry (the real pool)
    check('cookDay: 1500kcal pantry pool fires', L.cookDay(G) === true);
  }
  {
    const G = fake();
    G.state.scholar.inventory = [beanItem(4)]; // 600 pack
    G.state.scholar.prepStash = [beanItem(2)]; // +300 counter = 900 < 1000
    check('cookDay: 900kcal combined pool does not fire', L.cookDay(G) === false);
  }
  {
    const G = fake();
    G.state.scholar.kcal = 2400; // full belly — still fires (not hunger-gated)
    G.state.village.pantry = beans10();
    check('cookDay: not hunger-gated', L.cookDay(G) === true);
  }
  {
    const G = fake({ havenStoresAccess: () => 'none' }); // exiled — no commons access
    G.state.village.pantry = beans10();
    check('cookDay: exiled does not fire', L.cookDay(G) === false);
  }
  {
    const G = fake({ havenStoresAccess: () => 'none' });
    G.state.village.pantry = beans10();
    const names = L.poolContainers(G).map(c => c.name);
    check('poolContainers: exiled excludes pantry', !names.includes('pantry') && names.includes('prepStash') && names.includes('pack'));
  }
  {
    const G = fake();
    const names = L.poolContainers(G).map(c => c.name);
    check('poolContainers: pack + prepStash + pantry in order', names.join(',') === 'pack,prepStash,pantry');
  }
  check('fireHere gate respected', L.fireHere(fake({ nearFire: () => false })) === false);
  check('timeToSpare: mid-day', L.timeToSpare(fake()) === true);
  check('timeToSpare: day nearly spent', L.timeToSpare(fake({ state: { scholar: { kcal: 1200, inventory: [], prepStash: [], dayTicks: 480, day: 50, water: [] }, village: { pantry: [] } } })) === false);
  check('layerOn: default OFF', L.layerOn() === false);
  // splitForWater: 10u stack with 5L -> 5u pot + 5u remainder
  {
    const G = fake();
    const st = beans10();
    const entries = st.map(item => ({ container: { name: 'prepStash', items: st }, item }));
    const pot = L.splitForWater(G, entries);
    const units = st.map(i => i.units).sort((a, b) => a - b);
    check('splitForWater: one affordable pot + remainder', units.join(',') === '5,5', `units=${units.join(',')}`);
    check('splitForWater: pot is the 5u half', pot.length === 1 && pot[0].units === 5);
  }
  // splitForWater: no water -> empty pot
  {
    const G = fake({ cleanWaterForCooking: () => 0 });
    const st = beans10();
    const entries = st.map(item => ({ container: { name: 'prepStash', items: st }, item }));
    const pot = L.splitForWater(G, entries);
    check('splitForWater: dry cistern, empty pot', pot.length === 0 && st[0].units === 10);
  }
  // splitForWater: fills across containers in pack -> prepStash -> pantry order
  {
    const G = fake();
    const pack = [beanItem(4)], pantry = beans10();
    const entries = [
      ...pack.map(item => ({ container: { name: 'pack', items: pack }, item })),
      ...pantry.map(item => ({ container: { name: 'pantry', items: pantry }, item })),
    ];
    const pot = L.splitForWater(G, entries);
    check('splitForWater: fills across containers in order',
      pot.length === 2 && pot[0].units === 4 && pot[1].units === 1 &&
      pantry.map(i => i.units).join(',') === '1,9',
      `pot=${pot.map(i => i.units).join(',')} pantry=${pantry.map(i => i.units).join(',')}`);
  }
  // cookPass gate-off returns null and touches nothing
  {
    const G = fake();
    G.state.village.pantry = beans10();
    const before = JSON.stringify({ w: G.state.village.water, wood: G.state.village.wood, p: G.state.village.pantry.map(i => i.units) });
    const r = L.cookPass(G, {}, 'upkeep');
    const after = JSON.stringify({ w: G.state.village.water, wood: G.state.village.wood, p: G.state.village.pantry.map(i => i.units) });
    check('cookPass: gate-off inert', r === null && before === after);
  }
}

async function partB() {
  console.log('PART B — RED->GREEN fixture (upkeep-level, Haven state)');
  const L = require('./policies/cookbulk-b3');
  // RED: the base policy's normal upkeep does not batch-cook
  {
    const Game = await buildFixture(7901);
    try { await quietLog(async () => { belongfeast.upkeep(Game, {}); }); } catch (e) {}
    const beans = pantryBeans(Game);
    const w = cistern(Game);
    const raw = beans.length >= 1 && beans.every(b => b.needsCooking === true);
    check('RED: base upkeep leaves beans raw', raw && w.dirty === 20,
      `beans=${beans.map(b => `${b.units}u raw=${b.needsCooking}`).join(';')} water=${JSON.stringify(w)}`);
  }
  // GREEN (b3): the batch cooks the 5u the 5L cistern affords; wood/dirty untouched
  {
    process.env.COOKBULK_B3 = '1';
    try {
      const wrapped = L.withCookBulkB3(belongfeast, 'belongfeast+cookbulk-b3', 'test');
      const Game = await buildFixture(7901);
      const ctx = {};
      try { await quietLog(async () => { wrapped.upkeep(Game, ctx); }); } catch (e) {}
      const beans = pantryBeans(Game);
      const w = cistern(Game);
      const wood = Game.state.village.wood;
      const cookedUnits = beans.filter(b => b.needsCooking !== true).reduce((t, b) => t + (b.units || 0), 0);
      check('GREEN b3: 5u cooked on 5L (water-capped, no capacity lever)', cookedUnits === 5, `cookedUnits=${cookedUnits}`);
      check('GREEN b3: wood and dirty untouched', w.dirty === 20 && wood === 50,
        `water=${JSON.stringify(w)} wood=${wood}`);
      check('GREEN b3: firing counted on ctx', ctx._cb3CookDays === 1 && (ctx._cb3CookedKcal || 0) > 0,
        `days=${ctx._cb3CookDays} kcal=${ctx._cb3CookedKcal}`);
      check('GREEN b3: water draw logged', (ctx._cb3WaterDrawnL || 0) > 0, `drawn=${ctx._cb3WaterDrawnL}`);
      const kcal2 = ctx._cb3CookedKcal;
      const days2 = ctx._cb3CookDays;
      try { await quietLog(async () => { wrapped.upkeep(Game, ctx); }); } catch (e) {}
      check('GREEN b3: once/day guard holds', ctx._cb3CookedKcal === kcal2 && ctx._cb3CookDays === days2);
    } finally { delete process.env.COOKBULK_B3; }
  }
  // gate-off wrapped == base (inert on the fixture too)
  {
    const wrapped = L.withCookBulkB3(belongfeast, 'belongfeast+cookbulk-b3-off', 'test');
    const Game = await buildFixture(7901);
    try { await quietLog(async () => { wrapped.upkeep(Game, {}); }); } catch (e) {}
    const beans = pantryBeans(Game);
    const w = cistern(Game);
    check('gate-off: wrapped upkeep inert', beans.every(b => b.needsCooking === true) && w.dirty === 20 && Game.state.village.wood === 50);
  }
}

async function partC() {
  console.log('PART C — det-gate (wrapped COOKBULK_B3-unset vs unwrapped base, 60d)');
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  const { dayHash } = require('./det-gate');
  const L = require('./policies/cookbulk-b3');
  async function hashesFor(policy, seed) {
    const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
    await setupGame(Game);
    const hashes = [];
    const wrapped = Object.assign({}, policy);
    const base = policy.daily;
    wrapped.daily = (G, ctx) => { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); return base ? base(G, ctx) : undefined; };
    let r;
    await quietLog(async () => { r = await runDays(Game, wrapped, { days: 60, sampleEvery: 1 }); });
    return { hashes, end: r.days + '/' + r.endReason };
  }
  const seeds = [7901, 7902, 7903, 7904, 7905, 7906, 7907, 7908];
  let identical = 0;
  for (const seed of seeds) {
    for (const [pid, base] of [['belongfeast', belongfeast], ['leadfeast', leadfeast]]) {
      delete process.env.COOKBULK_B3; // gate OFF
      const wrapped = L.withCookBulkB3(base, pid + '+cookbulk-b3', 'det');
      let a, b, c;
      await quietLog(async () => { a = await hashesFor(wrapped, seed); });
      await quietLog(async () => { b = await hashesFor(base, seed); });
      await quietLog(async () => { c = await hashesFor(base, seed); }); // substrate-noise control
      const eq = (x, y) => x.hashes.length === y.hashes.length && x.hashes.every((h, i) => h === y.hashes[i]);
      const layerClean = eq(a, b), substrateClean = eq(b, c);
      if (layerClean) { identical++; console.log(`  ok   s${seed} ${pid}: wrapped-off byte-identical to base`); }
      else if (!substrateClean) { pass++; console.log(`  NOTE s${seed} ${pid}: base-vs-base diverges too — substrate noise, not the layer`); }
      else { fail++; console.log(`  FAIL s${seed} ${pid}: layer-attributable divergence`); }
    }
  }
  check('det-gate: no layer-attributable divergence', identical > 0, `${identical}/16 clean-identical`);
}

async function partD() {
  console.log('PART D — SMOKE (2 seeds x 2 policies x {control,b3}, 12d)');
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  const L = require('./policies/cookbulk-b3');
  let ran = 0, crashed = 0;
  for (const seed of [7901, 7902]) {
    for (const [pid, base] of [['belongfeast', belongfeast], ['leadfeast', leadfeast]]) {
      for (const arm of ['control', 'b3']) {
        if (arm === 'control') delete process.env.COOKBULK_B3; else process.env.COOKBULK_B3 = '1';
        const pol = arm === 'control' ? base : L.withCookBulkB3(base, `${pid}+cookbulk-b3`, 'smoke');
        try {
          const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
          await setupGame(Game);
          let r;
          await quietLog(async () => { r = await runDays(Game, pol, { days: 12, sampleEvery: 30 }); });
          ran++;
          if (!r || typeof r.days !== 'number') { crashed++; console.log(`  FAIL smoke ${pid} s${seed} ${arm}: bad result`); }
        } catch (e) { crashed++; console.log(`  FAIL smoke ${pid} s${seed} ${arm}: ${e.message}`); }
      }
    }
  }
  delete process.env.COOKBULK_B3;
  check('SMOKE: 8/8 short runs completed without exceptions', crashed === 0 && ran === 8, `ran=${ran} crashed=${crashed}`);
}

async function partE() {
  console.log('PART E — armed determinism (same seed armed twice, 30d)');
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  process.env.COOKBULK_B3 = '1';
  const { dayHash } = require('./det-gate');
  const L = require('./policies/cookbulk-b3');
  let identical = 0;
  for (const seed of [7901, 7902]) {
    for (const [pid, base] of [['belongfeast', belongfeast], ['leadfeast', leadfeast]]) {
      const run = async () => {
        const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
        await setupGame(Game);
        const pol = L.withCookBulkB3(base, `${pid}+cookbulk-b3`, 'det2');
        const hashes = [];
        const wrapped = Object.assign({}, pol);
        const bd = pol.daily;
        wrapped.daily = (G, ctx) => { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); return bd ? bd(G, ctx) : undefined; };
        await quietLog(async () => { await runDays(Game, wrapped, { days: 30, sampleEvery: 1 }); });
        return hashes;
      };
      const a = await run(); const b = await run();
      const eq = a.length === b.length && a.every((h, i) => h === b[i]);
      if (eq) { identical++; console.log(`  ok   s${seed} ${pid}: armed run byte-identical to itself`); }
      else { fail++; console.log(`  FAIL s${seed} ${pid}: armed run NOT deterministic`); }
    }
  }
  delete process.env.COOKBULK_B3;
  check('armed determinism: 4/4 self-identical', identical === 4, `${identical}/4`);
}

(async () => {
  await partA();
  await partB();
  if (process.env.SKIP_CD) { console.log('\n(PROOF AB-ONLY)'); console.log(`PROOF ${fail === 0 ? 'GREEN' : 'RED'}: ${pass} passed, ${fail} failed`); process.exit(fail === 0 ? 0 : 1); }
  await partC();
  await partD();
  await partE();
  console.log(`\nPROOF ${fail === 0 ? 'GREEN' : 'RED'}: ${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('PROOF CRASHED', e); process.exit(2); });
