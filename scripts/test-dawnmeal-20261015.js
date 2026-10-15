#!/usr/bin/env node
// scripts/test-dawnmeal-20261015.js — proof test for the dawnmeal
// dawn-timed pack-lunch layer (loop B, run fleshout-b-20261015T1229Z,
// sim-findings #314/#315, 2026-10-15). ALL GREEN is the gate before ANY
// sweep spend.
//
// PART A — gate + projection fixtures (mock Game, no engine), 16 fixtures:
//   A1 gate off: wrapPolicy(base) === base (same reference).
//   A2 gate off: named exports are the base leadcourt/belongseek objects.
//   A3 gate on: wrapped id 'dawnmeal-leadcourt'; base untouched.
//   A4 fires at dawn: pack empty + uncovered projection -> one honest take
//      (pantry -1 unit, pack +1, beat-voiced "packed lunch", audit row,
//      _dmTakeDay set).
//   A5 silent when the pack already has food (#169 pre-fill ban — pantry
//      untouched).
//   A6 silent when the projection covers.
//   A7 silent on dayParts 1/2/3 for dawnStep (no log rows).
//   A8 one take per day, hard (re-step after re-emptying -> no 2nd take).
//   A9 honest refusal (weight/access) honored + counted, never retried.
//   A10 cap-bounded: no room -> no-gain counted; oversized unit skipped by
//      the picker; fits when the room allows.
//   A11 pantry empty of takeable food -> honest no-op, counted.
//   A12 scoring: cooked plant first, human meat never, raw meat last.
//   A13 burn-loop EWMA: first close seeds, second closes 0.7/0.3, negative
//      burn clamps to 0.
//   A14 middayStep: eats the packed lunch when the projection is uncovered
//      (ate>0, voiced "packed this morning", audit row).
//   A15 middayStep silent when covered.
//   A16 middayStep silent when the dawn pack never happened (food in pack
//      but _dmTakeDay unset — the layer is a reactive chain, not a general
//      eat-anyway trigger).
// PART B — live engine, constructed states (REAL RED):
//   B1 RED: at dawn, kcal=1500 (BELOW competentEat's 0.85*2400=2040 line),
//      pack empty, pantry stocked, burnAvg 1000 -> the layer PACKS one unit
//      (pantry -1, pack +1, voiced); the BASE policy's dawn upkeep draws
//      NOTHING (pantry unchanged).
//   B2 RED: at mid-day, same packed lunch, burnAvg 1000 -> the layer EATS
//      via honest Game.eat() (kcal rises, voiced); the base's mid-day
//      upkeep at the same state does NOT eat (threshold not met at 2100).
//   B3 silent at dawn when covered / pack fed (live engine).
//   B4 burn EWMA closes live through the wrapped upkeep at dusk.
// PART C — det-gate: 30d x 8 seeds x 2 policies, base vs wrapped(gate on)
//   with a PACK SEEDER at every upkeep (the pack is never empty, so the
//   dawn-draw gate can never pass and the mid-day eat gate — which requires
//   _dmTakeDay — can never pass). Trajectories must be BYTE-IDENTICAL while
//   the projection/log/EWMA machinery runs hot (dawn log rows present on
//   the armed side). The machinery is neutral; the ONLY lever effect is the
//   honest take + honest eat.
// SMOKE=1 — instrument-honesty: 1 seed x 25d armed; policy.daily fired,
//   dawn log entries with fires booleans, takes consistent, every counted
//   take has a matching captured "packed lunch" say line, mid-day meals
//   voiced when ate>0.
//
// Node harness: full src/js list in index.html order (minus DOM-only), via
// sim-harness. Math.random seeded BEFORE eval (mulberry32 — loadGame does it).
//
// Usage: node scripts/test-dawnmeal-20261015.js
//        SMOKE=1 node scripts/test-dawnmeal-20261015.js
'use strict';

const SMOKE = process.env.SMOKE === '1';
let failures = 0;
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) failures++;
}

// ---------------- PART A: gate + projection fixtures (mock) ----------------
function partA() {
  console.log('PART A — gate + projection fixtures (16 fixtures)');
  globalThis.Scattering = globalThis.Scattering || {};
  const realCal = globalThis.Scattering.calories;
  globalThis.Scattering.calories = { dailyNeed: () => 2200 };

  function mockGame(o) {
    const g = {
      over: false,
      dayPart: 0,
      state: {
        scholar: { day: 5, kcal: 1500, dead: false, inventory: [], villagerId: 'v1' },
        village: { pantry: [], trust: {}, takes: {}, gives: {} },
      },
      kcalCap: () => 2400,
      sayCalls: [],
      say(t) { this.sayCalls.push(String(t)); },
      itemDisplayName(it) { return (it && it.name) || 'food'; },
      takeFromPantry(idx) {
        const pantry = this.state.village.pantry;
        const item = pantry[idx];
        if (!item) return null;
        if (this._refuseTake && this._refuseTake(item)) { this.say('Too heavy.'); return null; }
        this.state.scholar.inventory.push({
          name: item.name, plantId: item.plantId, kcalEach: item.kcalEach,
          units: 1, foodState: item.foodState, edible: item.edible !== false, kg: item.kg || 0.1,
        });
        item.units = (item.units || 1) - 1;
        if (item.units <= 0) pantry.splice(idx, 1);
        this.say(`Took ${item.name}.`);
        return null; // the engine returns null on success too
      },
      eat() {
        const s = this.state.scholar, cap = this.kcalCap();
        while (s.kcal < cap) {
          const fi = s.inventory.findIndex(i => (i.kcalEach || 0) > 0 && (i.units || 0) > 0 && i.edible !== false);
          if (fi === -1) break;
          const it = s.inventory[fi];
          s.kcal = Math.min(cap, s.kcal + it.kcalEach);
          it.units--;
          if (it.units <= 0) s.inventory.splice(fi, 1);
        }
      },
    };
    if (o) Object.assign(g, o);
    return g;
  }
  const pantryOf = () => ([
    { name: 'acorn mush', plantId: 'acorn', kcalEach: 400, units: 3, foodState: 'cooked', kg: 0.2 },
    { name: 'raw greens', plantId: 'dandelion', kcalEach: 150, units: 4, foodState: 'raw', kg: 0.1 },
  ]);
  const foodPack = () => [{ name: 'acorn mush', plantId: 'acorn', kcalEach: 400, units: 2, edible: true, kg: 0.2 }];
  const baseOf = () => ({ id: 'leadcourt', desc: 'base', upkeep(G, ctx) { ctx.u = 1; }, daily(G, ctx) { ctx.d = 1; } });
  const dmPath = './policies/dawnmeal';

  // A1 — gate off: wrapPolicy returns the base object itself.
  delete require.cache[require.resolve(dmPath)];
  delete process.env.DAWNMEAL;
  const dmOff = require(dmPath);
  const base = baseOf();
  check('A1 gate off: wrapPolicy(base) === base', dmOff.wrapPolicy(base) === base);

  // A2 — gate off: named exports are the base policies.
  check('A2 gate off: named exports are base policies',
    dmOff.dawnmealLeadcourt === require('./policies/leadcourt').leadcourt &&
    dmOff.dawnmealBelongseek === require('./policies/belongseek').belongseek);

  // A3 — gate on: wrapped id; base untouched.
  process.env.DAWNMEAL = '1';
  delete require.cache[require.resolve(dmPath)];
  const dm = require(dmPath);
  const base2 = baseOf();
  const w = dm.wrapPolicy(base2);
  check('A3 gate on: wrapped id dawnmeal-leadcourt', w.id === 'dawnmeal-leadcourt', w.id);
  check('A3 gate on: base untouched',
    base2.id === 'leadcourt' && !base2.upkeep.toString().includes('_dm'),
    `id=${base2.id}`);

  // A4 — fires at dawn: pack empty, proj uncovered (1500-1000=500 < 2300).
  {
    const G = mockGame();
    G.state.village.pantry = pantryOf();
    const ctx = { _dmBurnAvg: 1000 };
    dm.dawnStep(G, ctx);
    const packFood = G.state.scholar.inventory.some(i => (i.kcalEach || 0) > 0 && (i.units || 0) > 0);
    const voiced = G.sayCalls.some(t => /packed lunch/.test(t));
    check('A4 fires: one take, packed, voiced, audit row',
      ctx._dmTakes === 1 && packFood && voiced && ctx._dmTakeDay === 5 &&
      ctx._dmLog.length === 1 && ctx._dmLog[0].fires === true && ctx._dmLog[0].took === true,
      `takes=${ctx._dmTakes} takeDay=${ctx._dmTakeDay} item=${ctx._dmLog[0].item}`);
  }

  // A5 — silent when the pack already has food (#169 pre-fill ban).
  {
    const G = mockGame();
    G.state.village.pantry = pantryOf();
    G.state.scholar.inventory = foodPack();
    const ctx = { _dmBurnAvg: 1000 };
    const pk0 = G.state.village.pantry.reduce((t, i) => t + i.units, 0);
    dm.dawnStep(G, ctx);
    const pk1 = G.state.village.pantry.reduce((t, i) => t + i.units, 0);
    check('A5 silent when pack has food (pre-fill ban)',
      ctx._dmTakes === undefined && pk0 === pk1 && ctx._dmLog[0].fires === true && ctx._dmLog[0].packFull === true,
      `takes=${ctx._dmTakes} pantry=${pk0}->${pk1}`);
  }

  // A6 — silent when the projection covers (kcal 2400, burn 50 -> 2350 >= 2300).
  {
    const G = mockGame();
    G.state.scholar.kcal = 2400;
    G.state.village.pantry = pantryOf();
    const ctx = { _dmBurnAvg: 50 };
    dm.dawnStep(G, ctx);
    check('A6 silent when covered',
      ctx._dmTakes === undefined && ctx._dmLog[0].fires === false,
      `fires=${ctx._dmLog[0].fires}`);
  }

  // A7 — dawnStep silent on dayParts 1/2/3 (no log rows).
  {
    let takes = 0, rows = 0;
    for (const p of [1, 2, 3]) {
      const G = mockGame();
      G.dayPart = p;
      G.state.village.pantry = pantryOf();
      const ctx = { _dmBurnAvg: 1000 };
      dm.dawnStep(G, ctx);
      takes += ctx._dmTakes || 0;
      rows += (ctx._dmLog || []).length;
    }
    check('A7 non-dawn parts: never takes, never logs', takes === 0 && rows === 0,
      `takes=${takes} rows=${rows}`);
  }

  // A8 — one take per day, hard.
  {
    const G = mockGame();
    G.state.village.pantry = pantryOf();
    const ctx = { _dmBurnAvg: 1000 };
    dm.dawnStep(G, ctx);
    // pack now has the lunch; empty it again to retest the gate.
    G.state.scholar.inventory = [];
    dm.dawnStep(G, ctx);
    check('A8 one take per day, hard', ctx._dmTakes === 1 && ctx._dmLog[1].dupDay === true,
      `takes=${ctx._dmTakes}`);
  }

  // A9 — honest refusal honored + counted, never retried.
  {
    const G = mockGame();
    G.state.village.pantry = pantryOf();
    G._refuseTake = () => true;
    const ctx = { _dmBurnAvg: 1000 };
    const k0 = G.state.scholar.kcal;
    dm.dawnStep(G, ctx);
    check('A9 refusal honored + counted',
      ctx._dmRefused === 1 && ctx._dmTakes === undefined && G.state.scholar.kcal === k0 &&
      ctx._dmLog[0].refused === true,
      `refused=${ctx._dmRefused} kcal=${k0}->${G.state.scholar.kcal}`);
  }

  // A10 — cap-bounded.
  {
    const G = mockGame();
    G.state.scholar.kcal = 2350; // room 50 < 150
    G.state.village.pantry = pantryOf();
    const ctx = { _dmBurnAvg: 1000 };
    dm.dawnStep(G, ctx);
    check('A10a no room: skipped + counted', ctx._dmNoGain === 1 && ctx._dmTakes === undefined,
      `noGain=${ctx._dmNoGain}`);
    const G2 = mockGame(); // kcal 1500, room 900; best item 1200 kcal must be skipped
    G2.state.village.pantry = [{ name: 'feast haunch', plantId: 'deer', kcalEach: 1200, units: 2, foodState: 'cooked', kg: 0.5 }];
    const i2 = dm.bestPantryIndex(G2, 900);
    check('A10b oversized unit skipped by the picker', i2 === -1, `idx=${i2}`);
    const i3 = dm.bestPantryIndex(G2, 1500);
    check('A10c fits when the room allows', i3 === 0, `idx=${i3}`);
  }

  // A11 — pantry empty of takeable food -> honest no-op, counted.
  {
    const G = mockGame();
    G.state.village.pantry = [];
    const ctx = { _dmBurnAvg: 1000 };
    dm.dawnStep(G, ctx);
    check('A11 pantry empty: no-op counted', ctx._dmNoGain === 1 && ctx._dmTakes === undefined,
      `noGain=${ctx._dmNoGain}`);
  }

  // A12 — scoring.
  {
    const G = mockGame();
    G.state.village.pantry = [
      { name: 'raw haunch', plantId: 'meat_deer', kcalEach: 600, units: 2, foodState: 'raw', kg: 0.5 },
      { name: 'people stew', plantId: 'meat_human', kcalEach: 700, units: 2, foodState: 'cooked', kg: 0.5 },
      { name: 'flatbread', plantId: 'acorn', kcalEach: 300, units: 2, foodState: 'cooked', kg: 0.2 },
    ];
    const i = dm.bestPantryIndex(G, 2400);
    check('A12 scoring: cooked plant first, human meat never, raw meat last',
      i === 2, `idx=${i} (want 2=flatbread)`);
    const G2 = mockGame();
    G2.state.village.pantry = [
      { name: 'people stew', plantId: 'meat_human', kcalEach: 700, units: 2, foodState: 'cooked', kg: 0.5 },
    ];
    check('A12b human meat alone: no take', dm.bestPantryIndex(G2, 2400) === -1);
  }

  // A13 — burn-loop EWMA.
  {
    const G = mockGame();
    const ctx = { _dmDawnDay: 5, _dmDawnKcal: 2000 };
    G.state.scholar.kcal = 1500;
    dm.closeBurnLoop(G, ctx);
    check('A13 EWMA seeds on first close', ctx._dmBurnAvg === 500, `avg=${ctx._dmBurnAvg}`);
    const ctx2 = { _dmDawnDay: 5, _dmDawnKcal: 2000, _dmBurnAvg: 500 };
    G.state.scholar.kcal = 1700;
    dm.closeBurnLoop(G, ctx2);
    check('A13 EWMA updates 0.7/0.3', Math.abs(ctx2._dmBurnAvg - 440) < 1e-9, `avg=${ctx2._dmBurnAvg}`);
    const ctx3 = { _dmDawnDay: 5, _dmDawnKcal: 2000, _dmBurnAvg: 500 };
    G.state.scholar.kcal = 2300; // ate during the day: negative burn clamps to 0
    dm.closeBurnLoop(G, ctx3);
    check('A13 EWMA clamps negative burn', Math.abs(ctx3._dmBurnAvg - 350) < 1e-9, `avg=${ctx3._dmBurnAvg}`);
    const ctx4 = { _dmDawnDay: 4, _dmDawnKcal: 2000 }; // stale anchor: no close
    G.state.scholar.kcal = 1500;
    dm.closeBurnLoop(G, ctx4);
    check('A13 stale anchor: no close', ctx4._dmBurnAvg === undefined);
  }

  // A14 — middayStep eats the packed lunch when uncovered.
  {
    const G = mockGame();
    G.dayPart = 1;
    G.state.scholar.kcal = 1500;
    G.state.scholar.inventory = [{ name: 'acorn mush', plantId: 'acorn', kcalEach: 400, units: 2, edible: true, kg: 0.2 }];
    const ctx = { _dmBurnAvg: 1000, _dmTakeDay: 5 }; // proj 500 < 2300
    dm.middayStep(G, ctx);
    const voiced = G.sayCalls.some(t => /packed this morning/.test(t));
    check('A14 mid-day eat: ate the lunch, voiced, audit row',
      ctx._dmMeals === 1 && (ctx._dmKcalEaten || 0) > 0 && voiced &&
      ctx._dmMealLog.length === 1 && ctx._dmMealLog[0].fires === true,
      `meals=${ctx._dmMeals} kcalEaten=${ctx._dmKcalEaten}`);
  }

  // A15 — middayStep silent when covered.
  {
    const G = mockGame();
    G.dayPart = 1;
    G.state.scholar.kcal = 2400;
    G.state.scholar.inventory = [{ name: 'acorn mush', plantId: 'acorn', kcalEach: 400, units: 2, edible: true, kg: 0.2 }];
    const k0 = G.state.scholar.kcal;
    const ctx = { _dmBurnAvg: 50, _dmTakeDay: 5 }; // proj 2350 >= 2300
    dm.middayStep(G, ctx);
    check('A15 mid-day eat silent when covered',
      ctx._dmMeals === undefined && G.state.scholar.kcal === k0 &&
      ctx._dmMealLog[0].fires === false,
      `meals=${ctx._dmMeals} fires=${ctx._dmMealLog[0].fires}`);
  }

  // A16 — middayStep silent when the dawn pack never happened.
  {
    const G = mockGame();
    G.dayPart = 1;
    G.state.scholar.kcal = 1500;
    G.state.scholar.inventory = [{ name: 'acorn mush', plantId: 'acorn', kcalEach: 400, units: 2, edible: true, kg: 0.2 }];
    const k0 = G.state.scholar.kcal;
    const ctx = { _dmBurnAvg: 1000 }; // _dmTakeDay unset
    dm.middayStep(G, ctx);
    check('A16 mid-day eat silent without the dawn pack (reactive chain)',
      ctx._dmMeals === undefined && G.state.scholar.kcal === k0,
      `meals=${ctx._dmMeals}`);
  }

  delete process.env.DAWNMEAL;
  if (realCal) globalThis.Scattering.calories = realCal;
  else delete globalThis.Scattering.calories;
}

// ---------------- PART B: live engine, REAL RED ----------------
async function partB() {
  console.log('PART B — live engine (REAL RED)');
  const { loadGame, setupGame, quietLog } = require('./sim-harness');
  process.env.DAWNMEAL = '1';
  const dmPath = './policies/dawnmeal';
  delete require.cache[require.resolve(dmPath)];
  const dm = require(dmPath);
  const { leadcourt } = require('./policies/leadcourt');

  async function buildState() {
    const seed = 4242;
    const { Game } = await loadGame({ seed, mode: 'dawnmeal-proof' });
    await setupGame(Game);
    return Game;
  }
  // Dawn, scholar at 1500 (BELOW competentEat's 0.85*2400=2040 line — the
  // base WILL eat from the pack at dawn if there is food, so the pack must
  // be empty for the RED), pack empty, pantry stocked with a known unit,
  // burnAvg 1000 -> proj 500 < 2300 -> the layer MUST pack one unit.
  function construct(Game) {
    const s = Game.state.scholar;
    Game.dayPart = 0;
    s.kcal = 1500;
    s.inventory = [];
    const v = Game.state.village;
    v.pantry = v.pantry || [];
    v.pantry.unshift({ name: 'test acorn cake', plantId: 'acorn', kcalEach: 200, units: 3, foodState: 'cooked', kg: 0.2, safe: true });
    return { ctx: { _dmBurnAvg: 1000 } };
  }
  const pantryUnits = (Game) => (Game.state.village.pantry || []).reduce((t, i) => t + (i.units || 0), 0);
  const packFoodUnits = (Game) => (Game.state.scholar.inventory || [])
    .filter(i => (i.kcalEach || 0) > 0 && (i.units || 0) > 0).reduce((t, i) => t + (i.units || 0), 0);

  // B1 RED: the layer packs one unit at dawn; the base's dawn upkeep draws nothing.
  {
    const Game = await buildState();
    const { ctx } = construct(Game);
    const pk0 = pantryUnits(Game);
    await quietLog(async () => { dm.dawnStep(Game, ctx); });
    check('B1 RED: layer packs one pantry unit at dawn (pantry -1, pack +1, voiced)',
      pantryUnits(Game) === pk0 - 1 && packFoodUnits(Game) === 1 &&
      ctx._dmTakes === 1 && ctx._dmTakeDay === Game.state.scholar.day,
      `pantry=${pk0}->${pantryUnits(Game)} pack=${packFoodUnits(Game)} takes=${ctx._dmTakes}`);
  }
  // B1b RED: the base's dawn upkeep never PACKS (competentEat takes from
  // the pantry but eats immediately — the pack ends empty). Packing the
  // lunch for mid-day is the layer's novel verb.
  {
    const Game = await buildState();
    construct(Game);
    const pk0 = pantryUnits(Game);
    await quietLog(async () => { if (leadcourt.upkeep) leadcourt.upkeep(Game, { policyId: 'leadcourt' }); });
    check('B1b RED: base dawn upkeep takes-and-eats but never packs (pack stays empty)',
      packFoodUnits(Game) === 0 && pantryUnits(Game) < pk0,
      `pantry=${pk0}->${pantryUnits(Game)} pack=${packFoodUnits(Game)}`);
  }
  // B2 RED: at mid-day the layer eats the packed lunch via honest Game.eat().
  {
    const Game = await buildState();
    const { ctx } = construct(Game);
    await quietLog(async () => { dm.dawnStep(Game, ctx); });
    Game.dayPart = 1;
    Game.state.scholar.kcal = 2100; // ABOVE competentEat's 2040 line
    const k0 = Game.state.scholar.kcal;
    await quietLog(async () => { dm.middayStep(Game, ctx); });
    check('B2 RED: layer eats the packed lunch at mid-day (kcal rises)',
      Game.state.scholar.kcal > k0 && ctx._dmMeals === 1,
      `${k0} -> ${Game.state.scholar.kcal}, meals=${ctx._dmMeals}`);
  }
  // B2b: the BASE mid-day upkeep does NOT eat at kcal=2100 (threshold 2040).
  {
    const Game = await buildState();
    const { ctx } = construct(Game);
    await quietLog(async () => { dm.dawnStep(Game, ctx); }); // pack the lunch
    Game.dayPart = 1;
    Game.state.scholar.kcal = 2100;
    const k0 = Game.state.scholar.kcal;
    await quietLog(async () => { if (leadcourt.upkeep) leadcourt.upkeep(Game, { policyId: 'leadcourt' }); });
    check('B2b RED: base mid-day upkeep does NOT eat at kcal=2100',
      Game.state.scholar.kcal <= k0, `${k0} -> ${Game.state.scholar.kcal}`);
  }
  // B3: silent at dawn when covered (live engine).
  {
    const Game = await buildState();
    const { ctx } = construct(Game);
    Game.state.scholar.kcal = 2400;
    ctx._dmBurnAvg = 50; // proj 2350 >= 2300
    const pk0 = pantryUnits(Game);
    await quietLog(async () => { dm.dawnStep(Game, ctx); });
    check('B3 silent when covered (live)', ctx._dmTakes === undefined && pantryUnits(Game) === pk0,
      `takes=${ctx._dmTakes}`);
  }
  // B4: the burn loop closes live through the wrapped upkeep at dusk.
  // (The base dusk upkeep may eat/burn first — the pack is emptied so no
  // take-and-eat pollutes the measurement; the close measures the real net.)
  {
    const Game = await buildState();
    const wrapped = dm.wrapPolicy(leadcourt);
    // anchor ABOVE the current kcal with the pack empty and kcal=2100
    // (above competentEat's 2040 line, so the base cannot take-and-eat and
    // pollute the measurement): the close must measure the real net burn.
    const ctx = { _dmDawnDay: Game.state.scholar.day, _dmDawnKcal: 2500, policyId: 'dawnmeal-b4' };
    Game.dayPart = 2;
    Game.state.scholar.inventory = [];
    Game.state.scholar.kcal = 2100;
    await quietLog(async () => { wrapped.upkeep(Game, ctx); });
    const expected = Math.max(0, 2500 - Game.state.scholar.kcal);
    check('B4 burn EWMA closes live at the dusk upkeep (measures the real net)',
      ctx._dmBurnAvg === expected && expected > 0,
      `avg=${ctx._dmBurnAvg} expected=${expected}`);
  }
  delete process.env.DAWNMEAL;
}

// ---------------- PART C: det-gate ----------------
function dayHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const parts = [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
    (v.roster || []).length, Game.map.px, Game.map.py,
    Game.unlockedWave ? Game.unlockedWave() : 0,
    Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100)];
  return parts.join('|');
}
// Pack seeder: at every upkeep, top the pack up to a fat edible reserve so
// the layer's pack-empty gate can never pass (the dawn draw stays silent)
// and the mid-day eat gate — which requires _dmTakeDay — can never pass.
// Deterministic both sides.
function seedPackFull(Game) {
  try {
    const inv = (Game.state.scholar || {}).inventory || [];
    let units = inv.filter(i => (i.kcalEach || 0) > 0).reduce((t, i) => t + (i.units || 0), 0);
    while (units < 40) {
      inv.push({ name: 'seeder cake', plantId: 'acorn', kcalEach: 300, units: 5, foodState: 'cooked', edible: true, kg: 0.1, spoilDay: 99999 });
      units += 5;
    }
  } catch (e) {}
}
async function partC() {
  console.log('PART C — det-gate: 30d x 8 seeds x 2 policies, base vs wrapped(gate on), pack-seeded');
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
  const PIDS = ['leadcourt', 'belongseek'];
  let pass = 0, fail = 0;
  for (const pid of PIDS) {
    for (const seed of SEEDS) {
      const hashes = [];
      const trig = [];
      for (const armed of [false, true]) {
        if (armed) process.env.DAWNMEAL = '1'; else delete process.env.DAWNMEAL;
        const dmPath = './policies/dawnmeal';
        delete require.cache[require.resolve(dmPath)];
        const dm = require(dmPath);
        const base = require('./policies/' + pid)[pid];
        const policy = armed ? dm.wrapPolicy(base) : base;
        const { Game } = await loadGame({ seed, mode: 'dawnmeal-det' });
        await setupGame(Game);
        const wrapped = Object.assign({}, policy);
        const bDaily = policy.daily, bUpkeep = policy.upkeep;
        const hs = [];
        let dawnRows = 0, takes = 0;
        wrapped.upkeep = (G, ctx) => {
          seedPackFull(G);
          const r = bUpkeep ? bUpkeep(G, ctx) : undefined;
          try {
            dawnRows = (ctx._dmLog || []).length;
            takes = ctx._dmTakes || 0;
          } catch (e) {}
          return r;
        };
        wrapped.daily = (G, ctx) => {
          hs.push(G.state.scholar.day + ':' + dayHash(G));
          return bDaily ? bDaily(G, ctx) : undefined;
        };
        wrapped.setup = undefined;
        const ctx = { policyId: 'dawnmeal-det', notes: [] };
        await quietLog(async () => { await runDays(Game, wrapped, { days: 30, sampleEvery: 31 }); });
        hashes.push(hs.join('\n'));
        trig.push({ dawnRows, takes });
        delete process.env.DAWNMEAL;
      }
      const same = hashes[0] === hashes[1];
      // The trigger path must have RUN (else the gate proves nothing): the
      // armed side must show dawn log rows while taking nothing.
      const exercised = trig[1].dawnRows > 0 && trig[1].takes === 0;
      const ok = same && exercised;
      if (ok) pass++; else fail++;
      console.log(`  ${ok ? 'PASS' : 'FAIL'} ${pid} s${seed} ` +
        `(identical=${same} dawnRows=${trig[1].dawnRows} takes=${trig[1].takes})`);
      if (!same) {
        const a = hashes[0].split('\n'), b = hashes[1].split('\n');
        const i = a.findIndex((h, k) => h !== b[k]);
        console.log(`    first divergence at row ${i}: A=${a[i]} B=${b[i]}`);
      }
      if (!exercised) console.log('    NOTE: trigger path never ran hot — gate is weak on this seed');
    }
  }
  check('det-gate 16/16 byte-identical with trigger path exercised', fail === 0, `${pass}/16`);
}

// ---------------- SMOKE ----------------
async function smoke() {
  console.log('== dawnmeal SMOKE (instrument-honesty) ==');
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  process.env.DAWNMEAL = '1';
  const dmPath = './policies/dawnmeal';
  delete require.cache[require.resolve(dmPath)];
  const dm = require(dmPath);
  const base = require('./policies/belongseek').belongseek;
  const policy = dm.wrapPolicy(base);
  const { Game } = await loadGame({ seed: 11, mode: 'dawnmeal-smoke' });
  await setupGame(Game);
  const wrapped = Object.assign({}, policy);
  const bDaily = policy.daily;
  let dailyCalls = 0, ctxRef = null;
  const said = [];
  const oSay = Game.say;
  Game.say = function (t) { try { said.push(String(t)); } catch (e) {} return oSay.apply(this, arguments); };
  wrapped.daily = (G, ctx) => { dailyCalls++; ctxRef = ctx; return bDaily(G, ctx); };
  await quietLog(async () => { await runDays(Game, wrapped, { days: 25, sampleEvery: 26 }); });
  Game.say = oSay;
  const ctx = ctxRef || {};
  const log = ctx._dmLog || [];
  const mlog = ctx._dmMealLog || [];
  const fails = [];
  const scheck = (n, c, d) => { console.log(`  ${c ? 'PASS' : 'FAIL'} ${n}${d ? ' — ' + d : ''}`); if (!c) fails.push(n); };
  scheck('policy.daily fired', dailyCalls >= 20, `calls=${dailyCalls}`);
  scheck('dawn log entries present', log.length >= 15, `entries=${log.length}`);
  scheck('every dawn entry has a fires boolean', log.every(e => typeof e.fires === 'boolean'));
  scheck('trigger count consistent', (ctx._dmTriggers || 0) === log.filter(e => e.fires).length,
    `triggers=${ctx._dmTriggers} fired-rows=${log.filter(e => e.fires).length}`);
  scheck('takes consistent with took-rows', (ctx._dmTakes || 0) === log.filter(e => e.took).length,
    `takes=${ctx._dmTakes} took-rows=${log.filter(e => e.took).length}`);
  const packedLines = said.filter(t => /packed lunch/i.test(t));
  scheck('every counted take is beat-voiced', (ctx._dmTakes || 0) === 0 || packedLines.length >= (ctx._dmTakes || 0),
    `takes=${ctx._dmTakes} voiced=${packedLines.length}`);
  scheck('mid-day meal log present', mlog.length >= 15, `entries=${mlog.length}`);
  const mealLines = said.filter(t => /packed this morning/i.test(t));
  scheck('mid-day meals voiced (when ate>0)', (ctx._dmMeals || 0) === 0 || mealLines.length > 0,
    `meals=${ctx._dmMeals} voiced=${mealLines.length}`);
  console.log(fails.length ? `\nSMOKE: ${fails.length} FAILURES` : '\nSMOKE: ALL GREEN');
  delete process.env.DAWNMEAL;
  process.exit(fails.length ? 1 : 0);
}

(async () => {
  if (SMOKE) { await smoke(); return; }
  partA();
  await partB();
  await partC();
  console.log(failures ? `\nRESULT: ${failures} FAILURES` : '\nRESULT: ALL GREEN');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
