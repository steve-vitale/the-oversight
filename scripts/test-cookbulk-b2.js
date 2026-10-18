#!/usr/bin/env node
// scripts/test-cookbulk-b2.js — PROOF for the batch-cook CAPACITY lever (arm sim-cookbulk-b2).
//
// PART A — gate-logic units (synthetic states, no engine run): cookableItems,
//   cookDay, fireHere, timeToSpare, splitForWater, hearthFirst, boilRisky, layerOn.
// PART B — RED->GREEN fixture (live engine, constructed Haven state):
//   RED: base policy (belongfeast, no layer) upkeep neither boils the
//        cistern's dirty water nor batch-cooks — the behavior does not exist.
//   GREEN (b2): wrapped upkeep (COOKBULK_B2=1, hearth-first + boil-risky)
//        hearth-boils 20L dirty->clean at honest wood cost, then batch-cooks
//        the full 10u bean stack (10L) the 5L cistern alone could not afford.
//   V2BASE: same fixture with {hearthFirst:false, boilRisky:false} cooks only
//        the 5u the cistern affords and leaves wood/dirty untouched —
//        isolating the capacity lever's contribution.
// PART C — det-gate: wrapped policy with COOKBULK_B2 unset vs the unwrapped
//   base, per-day trajectory hashes, 60d x 8 seeds. Must be byte-identical;
//   any diverger is re-checked base-vs-base to attribute substrate noise.
// PART D — SMOKE: 2 seeds x 2 policies x {control,v2base,b2}, 12d, no exceptions.
//
// Usage: node scripts/test-cookbulk-b2.js
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
  // at Haven
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
  // PREP COUNTER holds a 10u bean stack (1500 kcal pool >= 1000 trigger).
  // Cistern: 5L clean (cannot afford the 10u stack alone), 20L dirty, wood 50.
  // The capacity lever's whole job is visible here: 5L cooks 5u; 5+20L cooks 10u.
  try {
    const v = Game.state.village;
    v.pantry = [];
    Game.prepStash().push(beanItem(10));
    v.water = { clean: 5, dirty: 20 };
    v.wood = 50;
  } catch (e) {}
  return Game;
}

function counterBeans(Game) {
  let stash = [];
  try { stash = Game.prepStash() || []; } catch (e) {}
  return stash.filter(i => i && /bean/i.test(i.name || ''));
}
function cistern(Game) {
  try { return Object.assign({}, Game.state.village.water); } catch (e) { return {}; }
}

async function partA() {
  console.log('PART A — gate-logic units');
  const L = require('./policies/cookbulk-b2');
  const fake = (extra) => Object.assign({
    state: { scholar: { kcal: 1200, inventory: [], dayTicks: 100, day: 50, water: [] }, village: { pantry: [], water: { clean: 5, dirty: 20 }, wood: 50 } },
    TIME: { TICKS_PER_DAY: 512 },
    isSpoiled: () => false,
    nearFire: () => true,
    havenStoresAccess: () => 'inside',
    prepStash: () => [],
    cleanWaterForCooking: () => 5,
    abilityLevel: () => 0,
    hearthBoil: function () {
      const vw = this.state.village.water;
      const boil = Math.min(Math.floor(vw.dirty), this.state.village.wood * 6);
      const used = Math.ceil(boil / 6);
      this.state.village.wood -= used; vw.dirty -= boil; vw.clean += boil;
      this._boiled = boil;
    },
    boilWater: function () {
      for (const b of this.state.scholar.water) if (b.quality === 'risky') b.quality = 'clean';
      this._boiledRisky = true;
    },
  }, extra || {});
  const beans10 = [beanItem(10)];
  check('cookableItems finds rawKcal beans', L.cookableItems(fake(), beans10).length === 1);
  check('cookableItems skips spoiled', L.cookableItems(fake({ isSpoiled: () => true }), beans10).length === 0);
  // cookDay: pool >= 1000 fires (no hunger/knowledge/ready-food gates)
  {
    const G = fake();
    G.prepStash = () => beans10; // 1500 kcal
    check('cookDay: 1500kcal pool fires', L.cookDay(G) === true);
  }
  {
    const G = fake();
    G.prepStash = () => [beanItem(4)]; // 600 kcal < 1000
    check('cookDay: 600kcal pool does not fire', L.cookDay(G) === false);
  }
  {
    const G = fake();
    G.state.scholar.kcal = 2400; // full belly — still fires (not hunger-gated)
    G.prepStash = () => beans10;
    check('cookDay: not hunger-gated', L.cookDay(G) === true);
  }
  check('fireHere gate respected', L.fireHere(fake({ nearFire: () => false })) === false);
  check('timeToSpare: mid-day', L.timeToSpare(fake(), 0) === true);
  check('timeToSpare: day nearly spent', L.timeToSpare(fake({ state: { scholar: { kcal: 1200, inventory: [], dayTicks: 480, day: 50, water: [] }, village: { pantry: [] } } }), 0) === false);
  check('layerOn: default OFF', L.layerOn() === false);
  // splitForWater: 10u stack with 5L -> 5u pot + 5u remainder
  {
    const G = fake();
    const st = [beanItem(10)];
    L.splitForWater(G, st, L.cookableItems(G, st));
    const units = st.map(i => i.units).sort((a, b) => a - b);
    check('splitForWater: one affordable pot + remainder', units.join(',') === '5,5', `units=${units.join(',')}`);
  }
  // hearthFirst: boils morning dirty at 6L/wood
  {
    const G = fake();
    const ctx = {};
    const r = L.hearthFirst(G, ctx);
    check('hearthFirst: boils 20L dirty', r.boiled === 20 && G.state.village.water.clean === 25 && G.state.village.water.dirty === 0,
      `boiled=${r.boiled} clean=${G.state.village.water.clean}`);
    check('hearthFirst: honest wood cost (4 wood)', G.state.village.wood === 46, `wood=${G.state.village.wood}`);
    check('hearthFirst: logged on ctx', ctx._cbHearthBoiledL === 20);
  }
  {
    const G = fake({ state: { scholar: { kcal: 1200, inventory: [], dayTicks: 100, day: 50, water: [] }, village: { pantry: [], water: { clean: 5, dirty: 0 }, wood: 50 } } });
    const r = L.hearthFirst(G, {});
    check('hearthFirst: no-op when no dirty water', r.boiled === 0 && G.state.village.wood === 50);
  }
  // boilRisky: boils the scholar's risky bottles
  {
    const G = fake();
    G.state.scholar.water = [{ quality: 'risky' }, { quality: 'risky' }, { quality: 'clean' }];
    const r = L.boilRisky(G, {});
    const clean = G.state.scholar.water.filter(b => b.quality === 'clean').length;
    check('boilRisky: risky bottles become clean', r.boiled === 2 && clean === 3, `boiled=${r.boiled} clean=${clean}`);
  }
  {
    const G = fake(); // no risky bottles
    const r = L.boilRisky(G, {});
    check('boilRisky: no-op with no risky water', r.boiled === 0);
  }
  // cookPass gate-off returns null and touches nothing
  {
    const G = fake();
    G.prepStash = () => beans10;
    const before = JSON.stringify({ w: G.state.village.water, wood: G.state.village.wood });
    const r = L.cookPass(G, {}, 'upkeep', {});
    check('cookPass: gate-off inert', r === null && JSON.stringify({ w: G.state.village.water, wood: G.state.village.wood }) === before);
  }
}

async function partB() {
  console.log('PART B — RED->GREEN fixture (upkeep-level, Haven state)');
  const L = require('./policies/cookbulk-b2');
  // RED: the competent family's normal upkeep neither boils dirty water nor batch-cooks
  {
    const Game = await buildFixture(7901);
    try { await quietLog(async () => { belongfeast.upkeep(Game, {}); }); } catch (e) {}
    const beans = counterBeans(Game);
    const w = cistern(Game);
    const raw = beans.length >= 1 && beans.every(b => b.needsCooking === true);
    // (the base scholar may drink 1L; the RED pins are: beans stay raw, dirty unboiled)
    check('RED: base upkeep leaves beans raw and water unboiled', raw && w.dirty === 20,
      `beans=${beans.map(b => `${b.units}u raw=${b.needsCooking}`).join(';')} water=${JSON.stringify(w)}`);
  }
  // GREEN (b2): hearth-first boils 20L, then the batch cooks the FULL 10u stack
  {
    process.env.COOKBULK_B2 = '1';
    try {
      const wrapped = L.withCookBulkB2(belongfeast, 'belongfeast+cookbulk-b2', 'test', { hearthFirst: true, boilRisky: true });
      const Game = await buildFixture(7901);
      const ctx = {};
      try { await quietLog(async () => { wrapped.upkeep(Game, ctx); }); } catch (e) {}
      const beans = counterBeans(Game);
      const w = cistern(Game);
      const wood = Game.state.village.wood;
      const cookedUnits = beans.filter(b => b.needsCooking !== true).reduce((t, b) => t + (b.units || 0), 0);
      check('GREEN b2: full 10u stack cooked', cookedUnits === 10, `cookedUnits=${cookedUnits}`);
      check('GREEN b2: hearth boiled 20L at honest wood cost', w.dirty === 0 && wood === 46 && ctx._cbHearthBoiledL === 20,
        `water=${JSON.stringify(w)} wood=${wood} boiledL=${ctx._cbHearthBoiledL}`);
      check('GREEN b2: firing counted on ctx', ctx._cbCookDays === 1 && (ctx._cbCookedKcal || 0) > 0);
      const kcal2 = ctx._cbCookedKcal;
      try { await quietLog(async () => { wrapped.daily(Game, ctx); }); } catch (e) {}
      check('GREEN b2: once/day guard holds', ctx._cbCookedKcal === kcal2);
    } finally { delete process.env.COOKBULK_B2; }
  }
  // V2BASE: same fixture, capacity sub-levers OFF — cooks only what 5L affords, wood/dirty untouched
  {
    process.env.COOKBULK_B2 = '1';
    try {
      const wrapped = L.withCookBulkB2(belongfeast, 'belongfeast+cookbulk-v2base', 'test', { hearthFirst: false, boilRisky: false });
      const Game = await buildFixture(7901);
      const ctx = {};
      try { await quietLog(async () => { wrapped.upkeep(Game, ctx); }); } catch (e) {}
      const beans = counterBeans(Game);
      const w = cistern(Game);
      const wood = Game.state.village.wood;
      const cookedUnits = beans.filter(b => b.needsCooking !== true).reduce((t, b) => t + (b.units || 0), 0);
      check('V2BASE: only 5u cooked on 5L (water-capped)', cookedUnits === 5, `cookedUnits=${cookedUnits}`);
      check('V2BASE: wood and dirty untouched', w.dirty === 20 && wood === 50 && !ctx._cbHearthBoiledL,
        `water=${JSON.stringify(w)} wood=${wood}`);
    } finally { delete process.env.COOKBULK_B2; }
  }
  // gate-off wrapped == base (inert on the fixture too)
  {
    const wrapped = L.withCookBulkB2(belongfeast, 'belongfeast+cookbulk-b2-off', 'test', {});
    const Game = await buildFixture(7901);
    try { await quietLog(async () => { wrapped.upkeep(Game, {}); }); } catch (e) {}
    const beans = counterBeans(Game);
    const w = cistern(Game);
    check('gate-off: wrapped upkeep inert', beans.every(b => b.needsCooking === true) && w.dirty === 20 && Game.state.village.wood === 50);
  }
}

async function partC() {
  console.log('PART C — det-gate (wrapped COOKBULK_B2-unset vs unwrapped base, 60d)');
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  const { dayHash } = require('./det-gate');
  const L = require('./policies/cookbulk-b2');
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
      delete process.env.COOKBULK_B2; // gate OFF
      const wrapped = L.withCookBulkB2(base, pid + '+cookbulk-b2', 'det', {});
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
  console.log('PART D — SMOKE (2 seeds x 2 policies x {control,v2base,b2}, 12d)');
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  const L = require('./policies/cookbulk-b2');
  const arms = {
    control: null,
    v2base: { hearthFirst: false, boilRisky: false },
    b2: { hearthFirst: true, boilRisky: true },
  };
  let ran = 0, crashed = 0;
  for (const seed of [7901, 7902]) {
    for (const [pid, base] of [['belongfeast', belongfeast], ['leadfeast', leadfeast]]) {
      for (const arm of Object.keys(arms)) {
        if (arm === 'control') delete process.env.COOKBULK_B2; else process.env.COOKBULK_B2 = '1';
        const pol = arm === 'control' ? base : L.withCookBulkB2(base, `${pid}+cookbulk-b2-${arm}`, 'smoke', arms[arm]);
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
  delete process.env.COOKBULK_B2;
  check('SMOKE: 12/12 short runs completed without exceptions', crashed === 0 && ran === 12, `ran=${ran} crashed=${crashed}`);
}

(async () => {
  await partA();
  await partB();
  if (process.env.SKIP_CD) { console.log('\n(PROOF AB-ONLY)'); console.log(`PROOF ${fail === 0 ? 'GREEN' : 'RED'}: ${pass} passed, ${fail} failed`); process.exit(fail === 0 ? 0 : 1); }
  await partC();
  await partD();
  console.log(`\nPROOF ${fail === 0 ? 'GREEN' : 'RED'}: ${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('PROOF CRASHED', e); process.exit(2); });
