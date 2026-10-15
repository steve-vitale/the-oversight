#!/usr/bin/env node
// scripts/test-goinside-20261015.js — proof test for the goinside
// dawn go-inside pack-lunch layer (loop B, sim-findings #314/#315/#328,
// 2026-10-15). ALL GREEN is the gate before ANY sweep spend.
//
// The killed sim-dawnmeal-b arm proved the pack-lunch mechanism sound but
// dead at the inside/outside wall (415/475 dawn takes refused at
// havenStoresAccess()==='none' — scholar on the haven tile, outside the
// hall). This layer adds the REAL Game.enterBuilding() verb before the
// dawn draw. The load-bearing RED: base refuses the draw outside; the
// layer enters, then draws.
//
// PART A — gate + projection + go-inside fixtures (mock Game, no engine):
//   A1 gate off: wrapPolicy(base) === base (same reference).
//   A2 gate off: named exports are the base leadcourt/belongseek objects.
//   A3 gate on: wrapped id 'goinside-leadcourt'; base untouched.
//   A4 fires at dawn: outside + pack empty + uncovered -> ENTERS (honest
//      enterBuilding, voiced), then one honest take (pantry -1, pack +1,
//      "packed lunch" beat, _giTakeDay set, _giEnters 1).
//   A4b no double-enter: already inside -> no enter line, draw proceeds.
//   A5 silent when the pack has food (#169 pre-fill ban, pantry untouched).
//   A6 silent when covered.
//   A7 silent on dayParts 1/2/3 (no log rows).
//   A8 one take per day, hard.
//   A9 honest refusal (weight) honored + counted, never retried.
//   A10 cap-bounded: no room -> no-gain; oversized unit skipped by the
//      picker; fits when room allows.
//   A11 pantry empty of takeable food -> honest no-op, counted.
//   A12 scoring: cooked plant first, human meat never, raw meat last.
//   A13 burn-loop EWMA: first close seeds, 0.7/0.3, negative clamps, stale
//      anchor no-op.
//   A14 middayStep: eats the packed lunch when uncovered.
//   A15 middayStep silent when covered.
//   A16 middayStep silent when the dawn pack never happened.
//   A17 no enter off the haven tile -> draw refused honestly, counted.
//   A18 no enter mid-fight (engine guard honored) -> refused, counted.
// PART B — live engine, constructed states (REAL RED):
//   B1 RED: the BASE's takeFromPantry at dawn, scholar outside on the
//      haven tile -> refusal "The pantry is in the hall. Your hands are
//      not." (the dawnmeal kill, reproduced).
//   B2 RED: the LAYER at the same state -> enterBuilding fires
//      (insideHaven true, 'Inside...' voiced), then ONE unit lands in the
//      pack (pantry -1, voiced, _giTakes 1).
//   B2b RED: the base's dawn upkeep takes-and-eats but never PACKS.
//   B3 RED: at mid-day the layer eats the packed lunch via honest
//      Game.eat() (kcal rises, voiced); the base's mid-day upkeep does
//      NOT eat at 2100.
//   B4 silent at dawn when covered (live engine).
//   B5 burn EWMA closes live through the wrapped upkeep at dusk.
// PART C — det-gate: 30d x 8 seeds x 2 policies, base vs wrapped(gate on)
//   with a PACK SEEDER at every upkeep (the pack is never empty, so the
//   draw gate — and with it the enter gate — can never pass). Trajectories
//   must be BYTE-IDENTICAL while the projection/log/EWMA machinery runs
//   hot (dawn log rows present on the armed side). The machinery is
//   neutral; the ONLY lever effect is honest enter + honest take +
//   honest eat.
// SMOKE=1 — instrument-honesty: 1 seed x 25d armed; policy.daily fired,
//   dawn log entries with fires booleans, takes consistent, every counted
//   take has a matching "packed lunch" say line, enters beat-voiced.
//
// Node harness: full src/js list in index.html order (minus DOM-only), via
// sim-harness. Math.random seeded BEFORE eval (mulberry32 — loadGame does it).
// Game.save never stubbed.
//
// Usage: node scripts/test-goinside-20261015.js
//        SMOKE=1 node scripts/test-goinside-20261015.js
'use strict';

const SMOKE = process.env.SMOKE === '1';
let failures = 0;
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) failures++;
}

// ---------------- PART A: fixtures (mock) ----------------
function partA() {
  console.log('PART A — gate + projection + go-inside fixtures');
  globalThis.Scattering = globalThis.Scattering || {};
  const realCal = globalThis.Scattering.calories;
  globalThis.Scattering.calories = { dailyNeed: () => 2200 };

  function mockGame(o) {
    const g = {
      over: false,
      dayPart: 0,
      _inCombat: false,
      _tile: { type: 'haven' },
      state: {
        scholar: { day: 5, kcal: 1500, dead: false, insideHaven: false, inventory: [], villagerId: 'v1' },
        village: { pantry: [], trust: {}, takes: {}, gives: {} },
      },
      kcalCap: () => 2400,
      sayCalls: [],
      say(t) { this.sayCalls.push(String(t)); },
      inCombat() { return !!this._inCombat; },
      playerTile() { return this._tile; },
      havenStoresAccess() {
        const s = this.state.scholar;
        const t = this._tile;
        return (s.insideHaven && t && t.type === 'haven') ? 'inside' : 'none';
      },
      enterBuilding() {
        const s = this.state.scholar;
        if (this._inCombat) { this.say('Not mid-fight — the barrier is the way out.'); return false; }
        if (s.insideHaven) { this.say("You're already inside."); return false; }
        const t = this.playerTile();
        if (!t || t.type !== 'haven') return false;
        s.insideHaven = true;
        this.say('Inside. The hall smells of smoke and twelve people. Home.');
        return true;
      },
      itemDisplayName(it) { return (it && it.name) || 'food'; },
      takeFromPantry(idx) {
        if (this.havenStoresAccess() === 'none') {
          this.say('The pantry is in the hall. Your hands are not.');
          return null;
        }
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
  const giPath = './policies/goinside';

  // A1 — gate off.
  delete require.cache[require.resolve(giPath)];
  delete process.env.GOINSIDE;
  const giOff = require(giPath);
  const base = baseOf();
  check('A1 gate off: wrapPolicy(base) === base', giOff.wrapPolicy(base) === base);

  // A2 — gate off: named exports are the base policies.
  check('A2 gate off: named exports are base policies',
    giOff.goinsideLeadcourt === require('./policies/leadcourt').leadcourt &&
    giOff.goinsideBelongseek === require('./policies/belongseek').belongseek);

  // A3 — gate on.
  process.env.GOINSIDE = '1';
  delete require.cache[require.resolve(giPath)];
  const gi = require(giPath);
  const base2 = baseOf();
  const w = gi.wrapPolicy(base2);
  check('A3 gate on: wrapped id goinside-leadcourt', w.id === 'goinside-leadcourt', w.id);
  check('A3 gate on: base untouched',
    base2.id === 'leadcourt' && !base2.upkeep.toString().includes('_gi'),
    `id=${base2.id}`);

  // A4 — fires at dawn: outside, pack empty, proj uncovered -> ENTERS then takes.
  {
    const G = mockGame();
    G.state.village.pantry = pantryOf();
    const ctx = { _giBurnAvg: 1000 };
    gi.dawnStep(G, ctx);
    const packFood = G.state.scholar.inventory.some(i => (i.kcalEach || 0) > 0 && (i.units || 0) > 0);
    const voiced = G.sayCalls.some(t => /packed lunch/.test(t));
    const enterVoiced = G.sayCalls.some(t => /duck into the hall/.test(t)) &&
      G.sayCalls.some(t => /smells of smoke/.test(t));
    check('A4 fires: entered, one take, packed, voiced, audit row',
      G.state.scholar.insideHaven === true && ctx._giTakes === 1 && packFood && voiced &&
      enterVoiced && ctx._giEnters === 1 && ctx._giTakeDay === 5 &&
      ctx._giLog.length === 1 && ctx._giLog[0].fires === true &&
      ctx._giLog[0].took === true && ctx._giLog[0].entered === true,
      `inside=${G.state.scholar.insideHaven} takes=${ctx._giTakes} enters=${ctx._giEnters} item=${ctx._giLog[0].item}`);
  }

  // A4b — already inside: no enter line, draw proceeds.
  {
    const G = mockGame();
    G.state.scholar.insideHaven = true;
    G.state.village.pantry = pantryOf();
    const ctx = { _giBurnAvg: 1000 };
    gi.dawnStep(G, ctx);
    const enterLine = G.sayCalls.some(t => /duck into the hall/.test(t));
    check('A4b inside: no double-enter, take lands',
      !enterLine && ctx._giEnters === undefined && ctx._giTakes === 1,
      `enterLine=${enterLine} takes=${ctx._giTakes}`);
  }

  // A5 — silent when the pack has food (#169 pre-fill ban).
  {
    const G = mockGame();
    G.state.village.pantry = pantryOf();
    G.state.scholar.inventory = foodPack();
    const ctx = { _giBurnAvg: 1000 };
    const pk0 = G.state.village.pantry.reduce((t, i) => t + i.units, 0);
    gi.dawnStep(G, ctx);
    const pk1 = G.state.village.pantry.reduce((t, i) => t + i.units, 0);
    check('A5 silent when pack has food (pre-fill ban)',
      ctx._giTakes === undefined && pk0 === pk1 && ctx._giLog[0].fires === true &&
      ctx._giLog[0].packFull === true && G.state.scholar.insideHaven === false,
      `takes=${ctx._giTakes} pantry=${pk0}->${pk1} inside=${G.state.scholar.insideHaven}`);
  }

  // A6 — silent when covered.
  {
    const G = mockGame();
    G.state.scholar.kcal = 2400;
    G.state.village.pantry = pantryOf();
    const ctx = { _giBurnAvg: 50 };
    gi.dawnStep(G, ctx);
    check('A6 silent when covered',
      ctx._giTakes === undefined && ctx._giLog[0].fires === false,
      `fires=${ctx._giLog[0].fires}`);
  }

  // A7 — non-dawn parts: never steps, never logs.
  {
    let takes = 0, rows = 0;
    for (const p of [1, 2, 3]) {
      const G = mockGame();
      G.dayPart = p;
      G.state.village.pantry = pantryOf();
      const ctx = { _giBurnAvg: 1000 };
      gi.dawnStep(G, ctx);
      takes += ctx._giTakes || 0;
      rows += (ctx._giLog || []).length;
    }
    check('A7 non-dawn parts: never takes, never logs', takes === 0 && rows === 0,
      `takes=${takes} rows=${rows}`);
  }

  // A8 — one take per day, hard.
  {
    const G = mockGame();
    G.state.village.pantry = pantryOf();
    const ctx = { _giBurnAvg: 1000 };
    gi.dawnStep(G, ctx);
    G.state.scholar.inventory = [];
    gi.dawnStep(G, ctx);
    check('A8 one take per day, hard', ctx._giTakes === 1 && ctx._giLog[1].dupDay === true,
      `takes=${ctx._giTakes}`);
  }

  // A9 — honest refusal honored + counted, never retried.
  {
    const G = mockGame();
    G.state.village.pantry = pantryOf();
    G._refuseTake = () => true; // weight refusal on the draw
    const ctx = { _giBurnAvg: 1000 };
    const k0 = G.state.scholar.kcal;
    gi.dawnStep(G, ctx);
    check('A9 refusal honored + counted',
      ctx._giRefused === 1 && ctx._giTakes === undefined && G.state.scholar.kcal === k0 &&
      ctx._giLog[0].refused === true && ctx._giEnters === 1,
      `refused=${ctx._giRefused} kcal=${k0}->${G.state.scholar.kcal}`);
  }

  // A10 — cap-bounded.
  {
    const G = mockGame();
    G.state.scholar.kcal = 2350; // room 50 < 150
    G.state.village.pantry = pantryOf();
    const ctx = { _giBurnAvg: 1000 };
    gi.dawnStep(G, ctx);
    check('A10a no room: skipped + counted', ctx._giNoGain === 1 && ctx._giTakes === undefined,
      `noGain=${ctx._giNoGain}`);
    const G2 = mockGame();
    G2.state.village.pantry = [{ name: 'feast haunch', plantId: 'deer', kcalEach: 1200, units: 2, foodState: 'cooked', kg: 0.5 }];
    const i2 = gi.bestPantryIndex(G2, 900);
    check('A10b oversized unit skipped by the picker', i2 === -1, `idx=${i2}`);
    const i3 = gi.bestPantryIndex(G2, 1500);
    check('A10c fits when the room allows', i3 === 0, `idx=${i3}`);
  }

  // A11 — pantry empty -> honest no-op, counted.
  {
    const G = mockGame();
    G.state.village.pantry = [];
    const ctx = { _giBurnAvg: 1000 };
    gi.dawnStep(G, ctx);
    check('A11 pantry empty: no-op counted', ctx._giNoGain === 1 && ctx._giTakes === undefined,
      `noGain=${ctx._giNoGain}`);
  }

  // A12 — scoring.
  {
    const G = mockGame();
    G.state.village.pantry = [
      { name: 'raw haunch', plantId: 'meat_deer', kcalEach: 600, units: 2, foodState: 'raw', kg: 0.5 },
      { name: 'people stew', plantId: 'meat_human', kcalEach: 700, units: 2, foodState: 'cooked', kg: 0.5 },
      { name: 'flatbread', plantId: 'acorn', kcalEach: 300, units: 2, foodState: 'cooked', kg: 0.2 },
    ];
    const i = gi.bestPantryIndex(G, 2400);
    check('A12 scoring: cooked plant first, human meat never, raw meat last',
      i === 2, `idx=${i} (want 2=flatbread)`);
    const G2 = mockGame();
    G2.state.village.pantry = [
      { name: 'people stew', plantId: 'meat_human', kcalEach: 700, units: 2, foodState: 'cooked', kg: 0.5 },
    ];
    check('A12b human meat alone: no take', gi.bestPantryIndex(G2, 2400) === -1);
  }

  // A13 — burn-loop EWMA.
  {
    const G = mockGame();
    const ctx = { _giDawnDay: 5, _giDawnKcal: 2000 };
    G.state.scholar.kcal = 1500;
    gi.closeBurnLoop(G, ctx);
    check('A13 EWMA seeds on first close', ctx._giBurnAvg === 500, `avg=${ctx._giBurnAvg}`);
    const ctx2 = { _giDawnDay: 5, _giDawnKcal: 2000, _giBurnAvg: 500 };
    G.state.scholar.kcal = 1700;
    gi.closeBurnLoop(G, ctx2);
    check('A13 EWMA updates 0.7/0.3', Math.abs(ctx2._giBurnAvg - 440) < 1e-9, `avg=${ctx2._giBurnAvg}`);
    const ctx3 = { _giDawnDay: 5, _giDawnKcal: 2000, _giBurnAvg: 500 };
    G.state.scholar.kcal = 2300;
    gi.closeBurnLoop(G, ctx3);
    check('A13 EWMA clamps negative burn', Math.abs(ctx3._giBurnAvg - 350) < 1e-9, `avg=${ctx3._giBurnAvg}`);
    const ctx4 = { _giDawnDay: 4, _giDawnKcal: 2000 };
    G.state.scholar.kcal = 1500;
    gi.closeBurnLoop(G, ctx4);
    check('A13 stale anchor: no close', ctx4._giBurnAvg === undefined);
  }

  // A14 — middayStep eats the packed lunch when uncovered.
  {
    const G = mockGame();
    G.dayPart = 1;
    G.state.scholar.kcal = 1500;
    G.state.scholar.inventory = [{ name: 'acorn mush', plantId: 'acorn', kcalEach: 400, units: 2, edible: true, kg: 0.2 }];
    const ctx = { _giBurnAvg: 1000, _giTakeDay: 5 };
    gi.middayStep(G, ctx);
    const voiced = G.sayCalls.some(t => /packed this morning/.test(t));
    check('A14 mid-day eat: ate the lunch, voiced, audit row',
      ctx._giMeals === 1 && (ctx._giKcalEaten || 0) > 0 && voiced &&
      ctx._giMealLog.length === 1 && ctx._giMealLog[0].fires === true,
      `meals=${ctx._giMeals} kcalEaten=${ctx._giKcalEaten}`);
  }

  // A15 — middayStep silent when covered.
  {
    const G = mockGame();
    G.dayPart = 1;
    G.state.scholar.kcal = 2400;
    G.state.scholar.inventory = [{ name: 'acorn mush', plantId: 'acorn', kcalEach: 400, units: 2, edible: true, kg: 0.2 }];
    const k0 = G.state.scholar.kcal;
    const ctx = { _giBurnAvg: 50, _giTakeDay: 5 };
    gi.middayStep(G, ctx);
    check('A15 mid-day eat silent when covered',
      ctx._giMeals === undefined && G.state.scholar.kcal === k0 &&
      ctx._giMealLog[0].fires === false,
      `meals=${ctx._giMeals} fires=${ctx._giMealLog[0].fires}`);
  }

  // A16 — middayStep silent when the dawn pack never happened.
  {
    const G = mockGame();
    G.dayPart = 1;
    G.state.scholar.kcal = 1500;
    G.state.scholar.inventory = [{ name: 'acorn mush', plantId: 'acorn', kcalEach: 400, units: 2, edible: true, kg: 0.2 }];
    const k0 = G.state.scholar.kcal;
    const ctx = { _giBurnAvg: 1000 };
    gi.middayStep(G, ctx);
    check('A16 mid-day eat silent without the dawn pack (reactive chain)',
      ctx._giMeals === undefined && G.state.scholar.kcal === k0,
      `meals=${ctx._giMeals}`);
  }

  // A17 — off the haven tile: no enter, honest refusal counted.
  {
    const G = mockGame();
    G._tile = { type: 'thicket' };
    G.state.village.pantry = pantryOf();
    const ctx = { _giBurnAvg: 1000 };
    gi.dawnStep(G, ctx);
    const entered = G.sayCalls.some(t => /smells of smoke/.test(t));
    check('A17 off-haven: no enter, draw refused, counted',
      !entered && ctx._giEnters === undefined && ctx._giTakes === undefined &&
      ctx._giNoGain === 1 && ctx._giLog[0].noAccess === true,
      `entered=${entered} noGain=${ctx._giNoGain}`);
  }

  // A18 — mid-fight: the engine guard is honored, no enter, counted.
  {
    const G = mockGame();
    G._inCombat = true;
    G.state.village.pantry = pantryOf();
    const ctx = { _giBurnAvg: 1000 };
    gi.dawnStep(G, ctx);
    const entered = G.sayCalls.some(t => /smells of smoke/.test(t));
    check('A18 mid-fight: no enter, counted',
      !entered && ctx._giEnters === undefined && ctx._giTakes === undefined &&
      ctx._giNoGain === 1,
      `entered=${entered} noGain=${ctx._giNoGain}`);
  }

  delete process.env.GOINSIDE;
  if (realCal) globalThis.Scattering.calories = realCal;
  else delete globalThis.Scattering.calories;
}

// ---------------- PART B: live engine, REAL RED ----------------
async function partB() {
  console.log('PART B — live engine (REAL RED)');
  const { loadGame, setupGame, quietLog } = require('./sim-harness');
  process.env.GOINSIDE = '1';
  const giPath = './policies/goinside';
  delete require.cache[require.resolve(giPath)];
  const gi = require(giPath);
  const { leadcourt } = require('./policies/leadcourt');

  async function buildState() {
    const seed = 4242;
    const { Game } = await loadGame({ seed, mode: 'goinside-proof' });
    await setupGame(Game);
    return Game;
  }
  // The ranging state the killed dawnmeal arm found: scholar ON the haven
  // tile but OUTSIDE the hall. setupGame starts the scholar inside, so
  // force the outside state explicitly (the 39/39 dawn refusals were real).
  function construct(Game) {
    const s = Game.state.scholar;
    Game.dayPart = 0;
    s.kcal = 1500;
    s.inventory = [];
    s.insideHaven = false;
    const v = Game.state.village;
    v.pantry = v.pantry || [];
    v.pantry.unshift({ name: 'test acorn cake', plantId: 'acorn', kcalEach: 200, units: 3, foodState: 'cooked', kg: 0.2, safe: true });
    return { ctx: { _giBurnAvg: 1000 } };
  }
  const onHavenTile = (Game) => {
    try { const t = Game.playerTile(); return !!(t && t.type === 'haven'); } catch (e) { return false; }
  };
  const pantryUnits = (Game) => (Game.state.village.pantry || []).reduce((t, i) => t + (i.units || 0), 0);
  const packFoodUnits = (Game) => (Game.state.scholar.inventory || [])
    .filter(i => (i.kcalEach || 0) > 0 && (i.units || 0) > 0).reduce((t, i) => t + (i.units || 0), 0);

  // B1 RED: the BASE's honest verb refuses outside the hall — the dawnmeal kill.
  {
    const Game = await buildState();
    construct(Game);
    check('B1 setup: scholar on the haven tile, outside the hall',
      onHavenTile(Game) && Game.state.scholar.insideHaven === false,
      `haven=${onHavenTile(Game)} inside=${Game.state.scholar.insideHaven}`);
    const pk0 = pantryUnits(Game);
    let said = '';
    await quietLog(async () => {
      const oSay = Game.say;
      Game.say = function (t) { said += String(t) + '\n'; return oSay.apply(this, arguments); };
      Game.takeFromPantry(0);
      Game.say = oSay;
    });
    check('B1 RED: base takeFromPantry outside refuses (the dawnmeal kill)',
      pantryUnits(Game) === pk0 && packFoodUnits(Game) === 0 &&
      /The pantry is in the hall\. Your hands are not\./.test(said),
      `pantry=${pk0}->${pantryUnits(Game)}`);
  }

  // B2 RED: the LAYER enters, then draws — the honest verb chain.
  {
    const Game = await buildState();
    const { ctx } = construct(Game);
    const pk0 = pantryUnits(Game);
    await quietLog(async () => { gi.dawnStep(Game, ctx); });
    check('B2 RED: layer enters (insideHaven true) then packs one unit',
      Game.state.scholar.insideHaven === true &&
      pantryUnits(Game) === pk0 - 1 && packFoodUnits(Game) === 1 &&
      ctx._giTakes === 1 && ctx._giEnters === 1 &&
      ctx._giTakeDay === Game.state.scholar.day,
      `inside=${Game.state.scholar.insideHaven} pantry=${pk0}->${pantryUnits(Game)} ` +
      `pack=${packFoodUnits(Game)} takes=${ctx._giTakes} enters=${ctx._giEnters}`);
  }

  // B2b RED: the base's dawn upkeep OUTSIDE cannot draw either — the
  // access wall bites the base too (competentEat's pantry fallback goes
  // through the same honest verb).
  {
    const Game = await buildState();
    construct(Game);
    const pk0 = pantryUnits(Game);
    await quietLog(async () => { if (leadcourt.upkeep) leadcourt.upkeep(Game, { policyId: 'leadcourt' }); });
    check('B2b RED: base dawn upkeep outside draws nothing (access wall) and never packs',
      packFoodUnits(Game) === 0 && pantryUnits(Game) === pk0,
      `pantry=${pk0}->${pantryUnits(Game)} pack=${packFoodUnits(Game)}`);
  }
  // B2c RED: the base's dawn upkeep INSIDE takes-and-eats from the pantry
  // but never PACKS — packing the lunch for mid-day is the layer's novel verb.
  {
    const Game = await buildState();
    construct(Game);
    Game.state.scholar.insideHaven = true;
    const pk0 = pantryUnits(Game);
    await quietLog(async () => { if (leadcourt.upkeep) leadcourt.upkeep(Game, { policyId: 'leadcourt' }); });
    check('B2c RED: base dawn upkeep inside takes-and-eats but never packs (pack stays empty)',
      packFoodUnits(Game) === 0 && pantryUnits(Game) < pk0,
      `pantry=${pk0}->${pantryUnits(Game)} pack=${packFoodUnits(Game)}`);
  }

  // B3 RED: at mid-day the layer eats the packed lunch via honest Game.eat().
  {
    const Game = await buildState();
    const { ctx } = construct(Game);
    await quietLog(async () => { gi.dawnStep(Game, ctx); });
    Game.dayPart = 1;
    Game.state.scholar.kcal = 2100; // ABOVE competentEat's 2040 line
    const k0 = Game.state.scholar.kcal;
    await quietLog(async () => { gi.middayStep(Game, ctx); });
    check('B3 RED: layer eats the packed lunch at mid-day (kcal rises)',
      Game.state.scholar.kcal > k0 && ctx._giMeals === 1,
      `${k0} -> ${Game.state.scholar.kcal}, meals=${ctx._giMeals}`);
    // B3b: the BASE mid-day upkeep does NOT eat at kcal=2100.
    Game.state.scholar.kcal = 2100;
    const k1 = Game.state.scholar.kcal;
    await quietLog(async () => { if (leadcourt.upkeep) leadcourt.upkeep(Game, { policyId: 'leadcourt' }); });
    check('B3b RED: base mid-day upkeep does NOT eat at kcal=2100',
      Game.state.scholar.kcal <= k1, `${k1} -> ${Game.state.scholar.kcal}`);
  }

  // B4: silent at dawn when covered (live engine).
  {
    const Game = await buildState();
    const { ctx } = construct(Game);
    Game.state.scholar.kcal = 2400;
    ctx._giBurnAvg = 50; // proj 2350 >= 2300
    const pk0 = pantryUnits(Game);
    await quietLog(async () => { gi.dawnStep(Game, ctx); });
    check('B4 silent when covered (live)', ctx._giTakes === undefined && pantryUnits(Game) === pk0 &&
      ctx._giEnters === undefined,
      `takes=${ctx._giTakes} enters=${ctx._giEnters}`);
  }

  // B5: the burn loop closes live through the wrapped upkeep at dusk.
  {
    const Game = await buildState();
    const wrapped = gi.wrapPolicy(leadcourt);
    const ctx = { _giDawnDay: Game.state.scholar.day, _giDawnKcal: 2500, policyId: 'goinside-b5' };
    Game.dayPart = 2;
    Game.state.scholar.inventory = [];
    Game.state.scholar.kcal = 2100; // above the 2040 line: base cannot eat
    await quietLog(async () => { wrapped.upkeep(Game, ctx); });
    const expected = Math.max(0, 2500 - Game.state.scholar.kcal);
    check('B5 burn EWMA closes live at the dusk upkeep (measures the real net)',
      ctx._giBurnAvg === expected && expected > 0,
      `avg=${ctx._giBurnAvg} expected=${expected}`);
  }
  delete process.env.GOINSIDE;
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
// the layer's pack-empty gate can never pass (the dawn draw — and with it
// the enter gate, which sits behind the draw gates — stays silent).
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
        if (armed) process.env.GOINSIDE = '1'; else delete process.env.GOINSIDE;
        const giPath = './policies/goinside';
        delete require.cache[require.resolve(giPath)];
        const gi = require(giPath);
        const base = require('./policies/' + pid)[pid];
        const policy = armed ? gi.wrapPolicy(base) : base;
        const { Game } = await loadGame({ seed, mode: 'goinside-det' });
        await setupGame(Game);
        const wrapped = Object.assign({}, policy);
        const bDaily = policy.daily, bUpkeep = policy.upkeep;
        const hs = [];
        let dawnRows = 0, takes = 0, enters = 0;
        wrapped.upkeep = (G, ctx) => {
          seedPackFull(G);
          const r = bUpkeep ? bUpkeep(G, ctx) : undefined;
          try {
            dawnRows = (ctx._giLog || []).length;
            takes = ctx._giTakes || 0;
            enters = ctx._giEnters || 0;
          } catch (e) {}
          return r;
        };
        wrapped.daily = (G, ctx) => {
          hs.push(G.state.scholar.day + ':' + dayHash(G));
          return bDaily ? bDaily(G, ctx) : undefined;
        };
        wrapped.setup = undefined;
        const ctx = { policyId: 'goinside-det', notes: [] };
        await quietLog(async () => { await runDays(Game, wrapped, { days: 30, sampleEvery: 31 }); });
        hashes.push(hs.join('\n'));
        trig.push({ dawnRows, takes, enters });
        delete process.env.GOINSIDE;
      }
      const same = hashes[0] === hashes[1];
      // The trigger path must have RUN (else the gate proves nothing): the
      // armed side must show dawn log rows while taking and entering nothing.
      const exercised = trig[1].dawnRows > 0 && trig[1].takes === 0 && trig[1].enters === 0;
      const ok = same && exercised;
      if (ok) pass++; else fail++;
      console.log(`  ${ok ? 'PASS' : 'FAIL'} ${pid} s${seed} ` +
        `(identical=${same} dawnRows=${trig[1].dawnRows} takes=${trig[1].takes} enters=${trig[1].enters})`);
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
  console.log('== goinside SMOKE (instrument-honesty) ==');
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  process.env.GOINSIDE = '1';
  const giPath = './policies/goinside';
  delete require.cache[require.resolve(giPath)];
  const gi = require(giPath);
  const base = require('./policies/belongseek').belongseek;
  const policy = gi.wrapPolicy(base);
  const { Game } = await loadGame({ seed: 11, mode: 'goinside-smoke' });
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
  const log = ctx._giLog || [];
  const mlog = ctx._giMealLog || [];
  const fails = [];
  const scheck = (n, c, d) => { console.log(`  ${c ? 'PASS' : 'FAIL'} ${n}${d ? ' — ' + d : ''}`); if (!c) fails.push(n); };
  scheck('policy.daily fired', dailyCalls >= 20, `calls=${dailyCalls}`);
  scheck('dawn log entries present', log.length >= 15, `entries=${log.length}`);
  scheck('every dawn entry has a fires boolean', log.every(e => typeof e.fires === 'boolean'));
  scheck('trigger count consistent', (ctx._giTriggers || 0) === log.filter(e => e.fires).length,
    `triggers=${ctx._giTriggers} fired-rows=${log.filter(e => e.fires).length}`);
  scheck('takes consistent with took-rows', (ctx._giTakes || 0) === log.filter(e => e.took).length,
    `takes=${ctx._giTakes} took-rows=${log.filter(e => e.took).length}`);
  const packedLines = said.filter(t => /packed lunch/i.test(t));
  scheck('every counted take is beat-voiced', (ctx._giTakes || 0) === 0 || packedLines.length >= (ctx._giTakes || 0),
    `takes=${ctx._giTakes} voiced=${packedLines.length}`);
  const enterLines = said.filter(t => /duck into the hall/i.test(t));
  scheck('every counted enter is beat-voiced', (ctx._giEnters || 0) === 0 || enterLines.length >= (ctx._giEnters || 0),
    `enters=${ctx._giEnters} voiced=${enterLines.length}`);
  scheck('mid-day meal log present', mlog.length >= 15, `entries=${mlog.length}`);
  const mealLines = said.filter(t => /packed this morning/i.test(t));
  scheck('mid-day meals voiced (when ate>0)', (ctx._giMeals || 0) === 0 || mealLines.length > 0,
    `meals=${ctx._giMeals} voiced=${mealLines.length}`);
  console.log(fails.length ? `\nSMOKE: ${fails.length} FAILURES` : '\nSMOKE: ALL GREEN');
  delete process.env.GOINSIDE;
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
