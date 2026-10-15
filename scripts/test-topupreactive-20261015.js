#!/usr/bin/env node
// scripts/test-topupreactive-20261015.js — proof test for the middaytopup
// reactive pantry top-up layer (loop B, 2026-10-15, sim-findings #314
// SCHOLAR DAILY DEFICIT, claims the named next "the pantry-draw side").
//
// PART A — gate + reactive-fire fixtures (mock Game, no engine), ~12:
//   A1 gate off: wrapPolicy(base) === base (same reference); named export
//      is the base leadcourt.
//   A2 gate on: wrapped id 'topup-leadcourt', base untouched; named export
//      wrapped.
//   A3 fires: pack empty + projection uncovered -> ONE take + honest eat
//      (kcal rises, voiced, audit row).
//   A4 silent when the pack already has food (#169 pre-fill ban).
//   A5 silent when the projection covers the night.
//   A6 silent on non-mid-day parts (0/2/3).
//   A7 at most one take per day (second call same day silent).
//   A8 honest refusal (weight cap) honored: counted, no eat, no retry.
//   A9 cap-bounded: no room to the kcal cap -> no take (counted); an item
//      bigger than the room is skipped by the index picker.
//   A10 pantry empty of takeable food -> honest no-op (counted).
//   A11 index scoring: cooked preferred, human meat never, raw meat last.
//   A12 burn-loop EWMA closes (learns, 0.7/0.3 updates, clamps negative).
// PART B — live engine, constructed states (REAL RED):
//   B1 RED: kcal=2100 (ABOVE competentEat's 2040 line), pack EMPTY, pantry
//      stocked, burnAvg 500 -> proj 1600 < 2300. The layer takes ONE unit
//      and eats (kcal rises, voiced); the BASE policy's upkeep does NOT
//      eat (kcal does not rise).
//   B2: layer silent when the pack has food (pantry untouched).
//   B3: layer silent when the projection covers (2400, burn 50).
//   B4: burn-loop EWMA closes live (mid-day -> dusk upkeep).
// PART C — det-gate: 30d x 8 seeds x 2 policies, base vs wrapped(gate on)
//   with the pack seeded full at every upkeep (the layer's fire gate can
//   never pass). Trajectories must be BYTE-IDENTICAL while the projection
//   / log / EWMA machinery runs hot (fires=false rows present) — the
//   trigger machinery is trajectory-neutral; the ONLY lever effect is the
//   honest take+eat.
// SMOKE=1 — instrument-honesty: 1 seed x 25d armed; policy.daily fired,
//   _tuLog entries present with fires booleans, trigger count consistent,
//   every take beat-voiced.
//
// Node harness: full src/js list in index.html order (minus DOM-only), via
// sim-harness. Math.random seeded BEFORE eval (mulberry32).
//
// Usage: node scripts/test-topupreactive-20261015.js
//        SMOKE=1 node scripts/test-topupreactive-20261015.js
'use strict';

const SMOKE = process.env.SMOKE === '1';
let failures = 0;
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) failures++;
}

// ---------------- PART A: gate + reactive-fire fixtures (mock) ----------------
function partA() {
  console.log('PART A — gate + reactive-fire fixtures');
  globalThis.Scattering = globalThis.Scattering || {};
  const realCal = globalThis.Scattering.calories;
  globalThis.Scattering.calories = { dailyNeed: () => 2200 };

  function mockGame(o) {
    const g = {
      over: false,
      dayPart: 1,
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

  const tuPath = './policies/middaytopup';
  delete require.cache[require.resolve(tuPath)];
  delete process.env.TOPUP;
  const tuOff = require(tuPath);
  const base = { id: 'leadcourt', desc: 'base' };
  check('A1 gate off: wrapPolicy returns the base object itself', tuOff.wrapPolicy(base) === base);
  check('A1 gate off: named export is the base leadcourt',
    tuOff.topupLeadcourt === require('./policies/leadcourt').leadcourt);

  process.env.TOPUP = '1';
  delete require.cache[require.resolve(tuPath)];
  const tu = require(tuPath);
  const w = tu.wrapPolicy(base);
  check('A2 gate on: wrapped id', w.id === 'topup-leadcourt', w.id);
  check('A2 gate on: base untouched', base.id === 'leadcourt' && !base.upkeep);
  check('A2 gate on: named export wrapped',
    tu.topupLeadcourt && tu.topupLeadcourt.id === 'topup-leadcourt');

  // A3: fires — kcal 1500, burnAvg 500, need 2200 -> proj 1000 < 2300; pack empty.
  {
    const G = mockGame();
    G.state.village.pantry = pantryOf();
    const ctx = { _tuBurnAvg: 500 };
    tu.topupStep(G, ctx);
    const voiced = G.sayCalls.some(t => /evening bowl won't cover/.test(t));
    check('A3 fires: one take + honest eat', ctx._tuTakes === 1 && G.state.scholar.kcal === 1900,
      `takes=${ctx._tuTakes} kcal=${G.state.scholar.kcal}`);
    check('A3 fires: meal counted + beat-voiced', ctx._tuMeals === 1 && voiced,
      G.sayCalls.filter(t => /evening bowl/.test(t))[0]);
    check('A3 fires: audit row', ctx._tuLog.length === 1 && ctx._tuLog[0].fires === true && ctx._tuLog[0].took === true,
      JSON.stringify(ctx._tuLog[0]));
  }
  // A4: silent when the pack already has food (#169 pre-fill ban).
  {
    const G = mockGame();
    G.state.village.pantry = pantryOf();
    G.state.scholar.inventory = foodPack();
    const ctx = { _tuBurnAvg: 500 };
    const pk0 = G.state.village.pantry.reduce((t, i) => t + i.units, 0);
    tu.topupStep(G, ctx);
    const pk1 = G.state.village.pantry.reduce((t, i) => t + i.units, 0);
    check('A4 silent when pack has food', ctx._tuTakes === undefined && pk0 === pk1 && ctx._tuLog[0].fires === false,
      `takes=${ctx._tuTakes} pantryUnits=${pk0}->${pk1}`);
  }
  // A5: silent when the projection covers (kcal 2400, burn 50 -> 2350 >= 2300).
  {
    const G = mockGame();
    G.state.scholar.kcal = 2400;
    G.state.village.pantry = pantryOf();
    const ctx = { _tuBurnAvg: 50 };
    tu.topupStep(G, ctx);
    check('A5 silent when covered', ctx._tuTakes === undefined && ctx._tuLog[0].fires === false,
      `fires=${ctx._tuLog[0].fires}`);
  }
  // A6: non-mid-day parts silent.
  {
    let takes = 0;
    for (const p of [0, 2, 3]) {
      const G = mockGame();
      G.dayPart = p;
      G.state.village.pantry = pantryOf();
      const ctx = { _tuBurnAvg: 500 };
      tu.topupStep(G, ctx);
      takes += ctx._tuTakes || 0;
      if ((ctx._tuLog || []).length) check(`A6 dayPart ${p}: no log`, false, 'logged');
    }
    check('A6 non-midday parts: never takes', takes === 0);
  }
  // A7: at most one take per day.
  {
    const G = mockGame();
    G.state.village.pantry = pantryOf();
    const ctx = { _tuBurnAvg: 500 };
    tu.topupStep(G, ctx);
    // pack now empty again? The eat consumed the unit; re-empty to retest the gate.
    G.state.scholar.inventory = [];
    G.state.scholar.day = 5;
    tu.topupStep(G, ctx);
    check('A7 one take per day, hard', ctx._tuTakes === 1, `takes=${ctx._tuTakes}`);
  }
  // A8: honest refusal (weight cap) honored — counted, no eat, no retry.
  {
    const G = mockGame();
    G.state.village.pantry = pantryOf();
    G._refuseTake = () => true;
    const ctx = { _tuBurnAvg: 500 };
    const k0 = G.state.scholar.kcal;
    tu.topupStep(G, ctx);
    check('A8 refusal honored + counted', ctx._tuRefused === 1 && ctx._tuTakes === undefined && G.state.scholar.kcal === k0,
      `refused=${ctx._tuRefused} kcal=${k0}->${G.state.scholar.kcal}`);
  }
  // A9: cap-bounded — no room -> no take; oversized unit skipped.
  {
    const G = mockGame();
    G.state.scholar.kcal = 2350; // room 50 < 150
    G.state.village.pantry = pantryOf();
    const ctx = { _tuBurnAvg: 500 };
    tu.topupStep(G, ctx);
    check('A9a no room: skipped + counted', ctx._tuNoRoom === 1 && ctx._tuTakes === undefined,
      `noRoom=${ctx._tuNoRoom}`);
    const G2 = mockGame(); // kcal 1500, room 900; best item 1200 kcal must be skipped
    G2.state.village.pantry = [{ name: 'feast haunch', plantId: 'deer', kcalEach: 1200, units: 2, foodState: 'cooked', kg: 0.5 }];
    const i2 = tu.bestPantryIndex(G2, 900);
    check('A9b oversized unit skipped by the picker', i2 === -1, `idx=${i2}`);
    const i3 = tu.bestPantryIndex(G2, 1500);
    check('A9c fits when the room allows', i3 === 0, `idx=${i3}`);
  }
  // A10: pantry empty of takeable food -> honest no-op, counted.
  {
    const G = mockGame();
    G.state.village.pantry = [];
    const ctx = { _tuBurnAvg: 500 };
    tu.topupStep(G, ctx);
    check('A10 pantry empty: no-op counted', ctx._tuNoGain === 1 && ctx._tuTakes === undefined,
      `noGain=${ctx._tuNoGain}`);
  }
  // A11: index scoring.
  {
    const G = mockGame();
    G.state.village.pantry = [
      { name: 'raw haunch', plantId: 'meat_deer', kcalEach: 600, units: 2, foodState: 'raw', kg: 0.5 },
      { name: 'people stew', plantId: 'meat_human', kcalEach: 700, units: 2, foodState: 'cooked', kg: 0.5 },
      { name: 'flatbread', plantId: 'acorn', kcalEach: 300, units: 2, foodState: 'cooked', kg: 0.2 },
    ];
    const i = tu.bestPantryIndex(G, 2400);
    check('A11 scoring: cooked plant first, human meat never, raw meat last',
      i === 2, `idx=${i} (want 2=flatbread)`);
  }
  // A12: burn-loop EWMA.
  {
    const G = mockGame();
    const ctx = { _tuMidDay: 5, _tuMidKcal: 2000 };
    G.state.scholar.kcal = 1500;
    tu.closeBurnLoop(G, ctx);
    check('A12 EWMA learns the burn', ctx._tuBurnAvg === 500, `avg=${ctx._tuBurnAvg}`);
    const ctx2 = { _tuMidDay: 5, _tuMidKcal: 2000, _tuBurnAvg: 500 };
    G.state.scholar.kcal = 1700;
    tu.closeBurnLoop(G, ctx2);
    check('A12 EWMA updates (0.7/0.3)', Math.abs(ctx2._tuBurnAvg - 440) < 1e-9, `avg=${ctx2._tuBurnAvg}`);
    const ctx3 = { _tuMidDay: 5, _tuMidKcal: 2000, _tuBurnAvg: 500 };
    G.state.scholar.kcal = 2300; // ate at mid-day: negative burn clamps to 0
    tu.closeBurnLoop(G, ctx3);
    check('A12 EWMA clamps negative burn', Math.abs(ctx3._tuBurnAvg - 350) < 1e-9, `avg=${ctx3._tuBurnAvg}`);
  }

  delete process.env.TOPUP;
  if (realCal) globalThis.Scattering.calories = realCal;
  else delete globalThis.Scattering.calories;
}

// ---------------- PART B: live engine, REAL RED ----------------
async function partB() {
  console.log('PART B — live engine (REAL RED)');
  const { loadGame, setupGame, quietLog } = require('./sim-harness');
  process.env.TOPUP = '1';
  const tuPath = './policies/middaytopup';
  delete require.cache[require.resolve(tuPath)];
  const tu = require(tuPath);
  const { leadcourt } = require('./policies/leadcourt');

  // Deterministic constructed state: mid-day, kcal 2100 (ABOVE competentEat's
  // 0.85*2400=2040 line so the base policy will NOT eat), pack EMPTY of
  // edible food, pantry stocked with a known unit, burnAvg 500 -> proj
  // 1600 < 2300. The layer MUST take+eat; the base MUST NOT.
  async function buildState() {
    const { Game } = await loadGame({ seed: 4242, mode: 'topup-proof' });
    await setupGame(Game);
    const s = Game.state.scholar;
    Game.dayPart = 1;
    s.kcal = 2100;
    s.inventory = (s.inventory || []).filter(i => !((i.kcalEach || 0) > 0 && (i.units || 0) > 0));
    const pantry = ((Game.state || {}).village || {}).pantry || [];
    pantry.push({ plantId: 'test_acorn', name: 'test acorn cake', kcalEach: 200, units: 5, edible: true, foodState: 'cooked', kg: 0.1, spoilDay: 99999 });
    return Game;
  }

  // B1 RED: the layer takes once and eats where the base waits.
  {
    const Game = await buildState();
    const lines = [];
    const oSay = Game.say;
    Game.say = function (t) { try { lines.push(String(t)); } catch (e) {} return oSay.apply(this, arguments); };
    const ctx = { _tuBurnAvg: 500 };
    const k0 = Game.state.scholar.kcal;
    const pk0 = Game.state.village.pantry.reduce((t, i) => t + (i.units || 0), 0);
    await quietLog(async () => { tu.topupStep(Game, ctx); });
    Game.say = oSay;
    const k1 = Game.state.scholar.kcal;
    const pk1 = Game.state.village.pantry.reduce((t, i) => t + (i.units || 0), 0);
    check('B1 RED: layer takes ONE pantry unit', ctx._tuTakes === 1 && pk0 - pk1 === 1,
      `takes=${ctx._tuTakes} pantryUnits=${pk0}->${pk1}`);
    check('B1 RED: scholar eats (kcal rises)', k1 > k0, `${k0} -> ${k1}`);
    check('B1 RED: beat-voiced as a person packing lunch',
      lines.some(l => /evening bowl won't cover the night/.test(l)),
      lines.filter(l => /evening bowl|draw/.test(l))[0] || lines.slice(-3).join(' | '));
  }
  // B1c: the BASE policy does NOT eat here (threshold 2040 not met).
  {
    const Game = await buildState();
    const k0 = Game.state.scholar.kcal;
    await quietLog(async () => { if (leadcourt.upkeep) leadcourt.upkeep(Game, { policyId: 'leadcourt' }); });
    const k1 = Game.state.scholar.kcal;
    check('B1c RED: base upkeep does NOT eat at kcal=2100 (pack empty, threshold 2040)', k1 <= k0,
      `${k0} -> ${k1} (other upkeep verbs may burn a little; eating would raise it)`);
  }
  // B2: silent when the pack already has food (pantry untouched).
  {
    const Game = await buildState();
    Game.state.scholar.inventory.push({ plantId: 'test_acorn', name: 'test acorn cake', kcalEach: 200, units: 5, edible: true, foodState: 'cooked', kg: 0.1, spoilDay: 99999 });
    const ctx = { _tuBurnAvg: 500 };
    const pk0 = Game.state.village.pantry.reduce((t, i) => t + (i.units || 0), 0);
    await quietLog(async () => { tu.topupStep(Game, ctx); });
    const pk1 = Game.state.village.pantry.reduce((t, i) => t + (i.units || 0), 0);
    check('B2 silent with food in the pack (#169)', ctx._tuTakes === undefined && pk0 === pk1,
      `takes=${ctx._tuTakes} pantryUnits=${pk0}->${pk1}`);
  }
  // B3: silent when the projection covers.
  {
    const Game = await buildState();
    Game.state.scholar.kcal = 2400;
    const ctx = { _tuBurnAvg: 50 };
    await quietLog(async () => { tu.topupStep(Game, ctx); });
    check('B3 silent when covered (2400, burn 50)', ctx._tuTakes === undefined && ctx._tuLog[0].fires === false,
      `fires=${ctx._tuLog && ctx._tuLog[0].fires}`);
  }
  // B4: the burn loop closes live through the wrapped upkeep.
  {
    const Game = await buildState();
    const wrapped = tu.wrapPolicy(leadcourt);
    const ctx = { _tuMidDay: 5, _tuMidKcal: 2000, policyId: 'topup-b4' };
    Game.dayPart = 2;
    Game.state.scholar.day = 5;
    Game.state.scholar.kcal = 1500;
    await quietLog(async () => { wrapped.upkeep(Game, ctx); });
    check('B4 burn EWMA closes live at the dusk upkeep', ctx._tuBurnAvg === 500, `avg=${ctx._tuBurnAvg}`);
  }
  delete process.env.TOPUP;
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
// the layer's pack-empty gate can never pass (the layer stays silent while
// its projection/log/EWMA machinery runs hot). Deterministic both sides.
function seedPackFull(Game) {
  try {
    const s = Game.state.scholar || {};
    let kcal = 0;
    for (const i of (s.inventory || [])) {
      if ((i.kcalEach || 0) > 0 && (i.units || 0) > 0 && i.edible !== false) kcal += i.kcalEach * i.units;
    }
    if (kcal < 2000) {
      (s.inventory = s.inventory || []).push({
        plantId: 'test_acorn', name: 'test acorn cake', kcalEach: 400, units: 5,
        edible: true, foodState: 'cooked', kg: 0.05, spoilDay: 99999,
      });
    }
  } catch (e) {}
}
async function partC() {
  console.log('PART C — det-gate: 30d x 8 seeds x 2 policies, base vs wrapped(gate on), pack seeded full');
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
  const PIDS = ['leadcourt', 'belongseek'];
  let pass = 0, fail = 0;
  for (const pid of PIDS) {
    for (const seed of SEEDS) {
      const hashes = [];
      const probe = [];
      for (const armed of [false, true]) {
        if (armed) process.env.TOPUP = '1'; else delete process.env.TOPUP;
        const tuPath = './policies/middaytopup';
        delete require.cache[require.resolve(tuPath)];
        const tu = require(tuPath);
        const base = require('./policies/' + pid)[pid];
        const policy = armed ? tu.wrapPolicy(base) : base;
        const { Game } = await loadGame({ seed, mode: 'topup-det' });
        await setupGame(Game);
        const wrapped = Object.assign({}, policy);
        const bDaily = policy.daily, bUpkeep = policy.upkeep;
        const hs = [];
        let ctxRef = null;
        wrapped.upkeep = (G, ctx) => {
          ctxRef = ctx; // runDays builds its own ctx — capture the live one
          seedPackFull(G); // the pack-empty gate can never pass
          return bUpkeep ? bUpkeep(G, ctx) : undefined;
        };
        wrapped.daily = (G, ctx) => {
          ctxRef = ctx;
          hs.push(G.state.scholar.day + ':' + dayHash(G));
          return bDaily ? bDaily(G, ctx) : undefined;
        };
        wrapped.setup = undefined;
        await quietLog(async () => { await runDays(Game, wrapped, { days: 30, sampleEvery: 31 }); });
        hashes.push(hs.join('\n'));
        const ctx = ctxRef || {};
        const log = ctx._tuLog || [];
        probe.push({
          takes: ctx._tuTakes || 0,
          logRows: log.length,
          firedRows: log.filter(r => r.fires).length,
          silentRows: log.filter(r => !r.fires).length,
        });
        delete process.env.TOPUP;
      }
      const same = hashes[0] === hashes[1];
      // The machinery must have RUN (silent projection rows) without taking.
      const exercised = probe[1].logRows > 0 && probe[1].takes === 0;
      const ok = same && exercised;
      if (ok) pass++; else fail++;
      console.log(`  ${ok ? 'PASS' : 'FAIL'} ${pid} s${seed} ` +
        `(identical=${same} logRows=${probe[1].logRows} silent=${probe[1].silentRows} takes=${probe[1].takes})`);
      if (!same) {
        const a = hashes[0].split('\n'), b = hashes[1].split('\n');
        const i = a.findIndex((h, k) => h !== b[k]);
        console.log(`    first divergence at row ${i}: A=${a[i]} B=${b[i]}`);
      }
      if (!exercised) console.log(`    NOTE: projection machinery never ran or a take fired — gate is weak on this seed`);
    }
  }
  check('det-gate 16/16 byte-identical with trigger machinery exercised', fail === 0, `${pass}/16`);
}

// ---------------- SMOKE ----------------
async function smoke() {
  console.log('== topupreactive SMOKE (instrument-honesty) ==');
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  process.env.TOPUP = '1';
  const tuPath = './policies/middaytopup';
  delete require.cache[require.resolve(tuPath)];
  const tu = require(tuPath);
  const base = require('./policies/belongseek').belongseek;
  const policy = tu.wrapPolicy(base);
  const { Game } = await loadGame({ seed: 11, mode: 'topup-smoke' });
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
  const log = ctx._tuLog || [];
  const fails = [];
  const scheck = (n, c, d) => { console.log(`  ${c ? 'PASS' : 'FAIL'} ${n}${d ? ' — ' + d : ''}`); if (!c) fails.push(n); };
  scheck('policy.daily fired', dailyCalls >= 20, `calls=${dailyCalls}`);
  scheck('mid-day projection log entries present', log.length >= 10, `entries=${log.length}`);
  scheck('every entry has a fires boolean', log.every(e => typeof e.fires === 'boolean'));
  scheck('trigger count consistent with fired rows',
    (ctx._tuTriggers || 0) === log.filter(e => e.fires).length,
    `triggers=${ctx._tuTriggers} fired-rows=${log.filter(e => e.fires).length}`);
  const voiced = said.filter(t => /evening bowl won't cover the night/.test(t));
  scheck('every take beat-voiced', (ctx._tuTakes || 0) === voiced.length,
    `takes=${ctx._tuTakes} voiced=${voiced.length}`);
  console.log(fails.length ? `\nSMOKE: ${fails.length} FAILURES` : '\nSMOKE: ALL GREEN');
  delete process.env.TOPUP;
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
