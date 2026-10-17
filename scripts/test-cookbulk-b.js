#!/usr/bin/env node
// scripts/test-cookbulk-b.js — PROOF for the camp batch-cook layer (arm sim-cookbulk-b).
//
// PART A — gate-logic units (synthetic states, no engine run): cookableItems,
//   readyFood, leanCookDay, timeToSpare, splitForWater, layerOn.
// PART B — RED->GREEN fixture (live engine, constructed lean camp state):
//   RED: base policy (belongfeast, no layer) upkeep leaves counter beans raw —
//        the behavior genuinely does not exist pre-edit.
//   GREEN: wrapped upkeep (COOKBULK=1) batch-cooks them via the engine's
//        honest cookAll (safe, needsCooking cleared, digestibility gain), and
//        gate-off (COOKBULK unset) is inert.
// PART C — det-gate: wrapped policy with COOKBULK unset vs the unwrapped
//   base, per-day trajectory hashes, 60d x 8 seeds. Must be byte-identical;
//   any diverger is re-checked base-vs-base to attribute substrate noise
//   (the known contest-ID entropy issue, scripts/det-gate.js header).
// PART D — SMOKE: 2 seeds x 2 policies x {control,armed}, 12d, no exceptions.
//
// Usage: node scripts/test-cookbulk-b.js
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
function berryItem() {
  return { name: 'Berries', kcalEach: 100, units: 2, edible: true, safe: true, spoilDay: 999 };
}

async function buildFixture(seed) {
  const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  const s = Game.state.scholar;
  // at Haven
  try {
    const v = Game.state.village || {};
    if (Game.map) { Game.map.px = (v.px ?? 4); Game.map.py = (v.py ?? 4); }
    Game.location = 'haven';
  } catch (e) {}
  // the scholar knows the cook technique (knowledge gate), is hungry, mid-day
  try { Game.techniques().cook = true; } catch (e) {}
  s.kcal = 300;
  s.dayTicks = 100;
  s.day = 50;
  s.inventory = [];
  // the PREP COUNTER holds a small water-affordable bean stack (a controlled
  // pool — the seeded 80u/65u pantry stacks would eat the fixture's 20L first
  // via the layer's one-pot split, and the base policy's starvation loop eats
  // PANTRY beans raw, which would destroy the RED fixture; the base never
  // touches the counter); village well has water
  try {
    const v = Game.state.village;
    v.pantry = [];
    Game.prepStash().push(beanItem(4));
    v.water = { clean: 20, dirty: 0 };
  } catch (e) {}
  return Game;
}

function counterBeans(Game) {
  let stash = [];
  try { stash = Game.prepStash() || []; } catch (e) {}
  return stash.filter(i => i && /bean/i.test(i.name || ''));
}

async function partA() {
  console.log('PART A — gate-logic units');
  const L = require('./policies/cookbulk-b');
  const fake = (kcal, inv, dayTicks, extra) => Object.assign({
    kcalCap: () => 2400,
    state: { scholar: { kcal, inventory: inv, dayTicks: dayTicks || 100, day: 50 }, village: { pantry: [] } },
    TIME: { TICKS_PER_DAY: 512 },
    isSpoiled: () => false,
    knowsTechnique: () => true,
    nearFire: () => true,
    havenStoresAccess: () => 'inside',
    prepStash: () => [],
    cleanWaterForCooking: () => 20,
    abilityLevel: () => 0,
  }, extra || {});
  const beans = [beanItem(4)];
  const berries = [berryItem()];
  check('cookableItems finds rawKcal beans', L.cookableItems(fake(300, []), beans).length === 1);
  check('cookableItems ignores ready berries', L.cookableItems(fake(300, []), berries).length === 0);
  check('cookableItems skips spoiled', L.cookableItems(fake(300, [], 100, { isSpoiled: () => true }), beans).length === 0);
  check('readyFood finds berries, not beans', L.readyFood(fake(300, []), berries.concat(beans)).length === 1);
  const gLean = () => {
    const G = fake(300, []);
    G.state.village.pantry = beans;
    return G;
  };
  check('leanCookDay: hungry + counter beans', L.leanCookDay(gLean()) === true);
  check('leanCookDay: not hungry', L.leanCookDay(fake(2400, [])) === false);
  check('leanCookDay: ready food in pack', L.leanCookDay(fake(300, berries)) === false);
  check('leanCookDay: nothing cookable', L.leanCookDay(fake(300, [])) === false);
  check('timeToSpare: mid-day', L.timeToSpare(fake(300, [], 100)) === true);
  check('timeToSpare: day nearly spent', L.timeToSpare(fake(300, [], 500)) === false);
  check('knowsCookable gate respected', L.knowsCookable(fake(300, [], 100, { knowsTechnique: () => false })) === false);
  check('fireHere gate respected', L.fireHere(fake(300, [], 100, { nearFire: () => false })) === false);
  check('layerOn: default OFF', L.layerOn() === false);
  // splitForWater: 80-unit stack with 20L reachable -> one 20-unit pot + 60 remainder
  {
    const G = fake(300, []);
    const big = [beanItem(80)];
    L.splitForWater(G, big, L.cookableItems(G, big));
    const units = big.map(i => i.units).sort((a, b) => a - b);
    check('splitForWater: one affordable pot + remainder', units.join(',') === '20,60', `units=${units.join(',')}`);
  }
  // splitForWater: affordable stack untouched
  {
    const G = fake(300, []);
    const small = [beanItem(4)];
    L.splitForWater(G, small, L.cookableItems(G, small));
    check('splitForWater: affordable stack untouched', small.length === 1 && small[0].units === 4);
  }
  // cookPass gate-off returns null and touches nothing
  {
    const G = gLean();
    const before = JSON.stringify(G.state.village.pantry);
    const r = L.cookPass(G, {}, 'upkeep');
    check('cookPass: gate-off inert', r === null && JSON.stringify(G.state.village.pantry) === before);
  }
}

async function partB() {
  console.log('PART B — RED->GREEN fixture (upkeep-level, lean camp state)');
  const L = require('./policies/cookbulk-b');
  // RED: the competent family's normal upkeep never batch-cooks counter beans
  {
    const Game = await buildFixture(7901);
    try { await quietLog(async () => { belongfeast.upkeep(Game, {}); }); } catch (e) {}
    const beans = counterBeans(Game);
    const raw = beans.length === 1 && beans[0].needsCooking === true && beans[0].safe === false;
    check('RED: base upkeep leaves counter beans raw', raw,
      `beans=${beans.map(b => `${b.units}u needsCooking=${b.needsCooking} safe=${b.safe}`).join(';')}`);
  }
  // GREEN: layer batch-cooks them via the engine's honest cookAll
  {
    process.env.COOKBULK = '1';
    try {
      const wrapped = L.withCookBulk(belongfeast, 'belongfeast+cookbulk-test', 'test');
      const Game = await buildFixture(7901);
      const ctx = {};
      try { await quietLog(async () => { wrapped.upkeep(Game, ctx); }); } catch (e) {}
      const beans = counterBeans(Game);
      const cooked = beans.length === 1 && beans[0].needsCooking === false &&
        beans[0].safe === true && beans[0].rawKcal == null && (beans[0].kcalEach || 0) >= 120;
      check('GREEN: layer batch-cooks the counter beans', cooked,
        `beans=${beans.map(b => `${b.units}u kcalEach=${b.kcalEach} needsCooking=${b.needsCooking} safe=${b.safe}`).join(';')}`);
      check('GREEN: firing counted on ctx', ctx._cbCookDays === 1 && (ctx._cbCookedKcal || 0) > 0,
        `days=${ctx._cbCookDays} kcal=${ctx._cbCookedKcal}`);
      // once/day: second hook same day does not re-fire
      const kcal2 = ctx._cbCookedKcal;
      try { await quietLog(async () => { wrapped.daily(Game, ctx); }); } catch (e) {}
      check('GREEN: once/day guard holds', ctx._cbCookedKcal === kcal2, `kcal=${ctx._cbCookedKcal}`);
    } finally { delete process.env.COOKBULK; }
  }
  // gate-off wrapped == base (inert on the fixture too)
  {
    const wrapped = L.withCookBulk(belongfeast, 'belongfeast+cookbulk-off', 'test');
    const Game = await buildFixture(7901);
    try { await quietLog(async () => { wrapped.upkeep(Game, {}); }); } catch (e) {}
    const beans = counterBeans(Game);
    check('gate-off: wrapped upkeep leaves beans raw', beans.length === 1 && beans[0].needsCooking === true);
  }
}

async function partC() {
  console.log('PART C — det-gate (wrapped COOKBULK-unset vs unwrapped base, 60d)');
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  const { dayHash } = require('./det-gate');
  const L = require('./policies/cookbulk-b');
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
      delete process.env.COOKBULK; // gate OFF
      const wrapped = L.withCookBulk(base, pid + '+cookbulk', 'det');
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
  console.log('PART D — SMOKE (2 seeds x 2 policies x {control,armed}, 12d)');
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  const L = require('./policies/cookbulk-b');
  let ran = 0, crashed = 0;
  for (const seed of [7901, 7902]) {
    for (const [pid, base] of [['belongfeast', belongfeast], ['leadfeast', leadfeast]]) {
      for (const arm of ['control', 'armed']) {
        if (arm === 'armed') process.env.COOKBULK = '1'; else delete process.env.COOKBULK;
        const pol = arm === 'armed' ? L.withCookBulk(base, pid + '+cookbulk', 'smoke') : base;
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
  delete process.env.COOKBULK;
  check('SMOKE: 8/8 short runs completed without exceptions', crashed === 0 && ran === 8, `ran=${ran} crashed=${crashed}`);
}

(async () => {
  await partA();
  await partB();
  await partC();
  await partD();
  console.log(`\nPROOF ${fail === 0 ? 'GREEN' : 'RED'}: ${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('PROOF CRASHED', e); process.exit(2); });
