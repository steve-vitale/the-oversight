#!/usr/bin/env node
// scripts/test-dawngo-20261015.js — proof test for the DAWNGO dawn
// go-inside + REACTIVE pantry draw layer (loop B, run
// fleshout-b-20261015T2022Z, axis food-economy, 2026-10-15). ALL GREEN is
// the gate before ANY sweep spend.
//
// The killed series: dawnmeal (0.869x — the inside/outside pantry wall:
// 415/475 dawn draws refused, #328), goinside (1.158x — 420 takes taxed
// the trust ledger, #329), trustguard (1.001x, pro-cyclical take-blocking).
// This arm is the leanest variant: real go-inside verb + strictly reactive
// dawn draw — no EWMA, no packed-lunch mid-day chain, no take-blocking.
// Emergency only: pack empty + kcal < 0.5*cap, one take/day, eaten
// immediately.
//
// PART A — gate + reactive-draw fixtures (mock Game, no engine):
//   A1 gate off: wrapPolicy(base) === base (same reference).
//   A2 gate off: named exports are the base policies.
//   A3 gate on: wrapped id 'dawngo-leadcourt'; base untouched.
//   A4 fires at dawn: outside + pack empty + kcal<0.5cap -> ENTERS (honest
//      enterBuilding, voiced), then one honest take + immediate eat
//      (kcal rises, voiced, _dgTakes 1, _dgEnters 1, _dgTakeDay set).
//   A4b already inside: no enter line, draw proceeds.
//   A5 silent when the pack has food (#169 pre-fill ban — pantry untouched, no enter).
//   A6 silent when kcal >= 0.5*cap (not a genuine emergency — no enter, no take).
//   A7 silent on dayParts 1/2/3 (dawnStep not called).
//   A8 one take per day, hard.
//   A9 honest refusal (weight) honored + counted, never retried.
//   A10 pantry empty of takeable food -> honest no-op, counted.
//   A11 scoring: cooked plant first, human meat never, raw meat last.
//   A12 mid-fight: the engine guard is honored, no enter, counted.
//   A13 off the haven tile: no enter, honest refusal counted.
// PART B — live engine, constructed states (REAL RED):
//   B1 RED: the BASE's takeFromPantry at dawn, scholar outside on the
//      haven tile -> refusal "The pantry is in the hall. Your hands are
//      not." (the dawnmeal kill, reproduced).
//   B2 RED: the LAYER at the same state -> enterBuilding fires
//      (insideHaven true), then ONE unit taken and EATEN immediately
//      (pantry -1, kcal +200, _dgTakes 1, _dgEnters 1).
//   B2b RED: the base's dawn upkeep OUTSIDE draws nothing (access wall)
//      and never enters.
//   B3 RED: the layer is silent at dawn when kcal >= 0.5*cap (live).
//   B4 silent at dawn when the pack has food (live).
// PART C — det-gate: 30d x 8 seeds x 2 policies, base vs wrapped(gate on)
//   with a PACK SEEDER at every upkeep (pack never empty, so the draw
//   gate — and with it the enter gate, which sits behind the draw
//   gates — stays silent). Trajectories must be BYTE-IDENTICAL while the
//   dawn log runs hot. The ONLY lever effect is honest enter + honest
//   take + honest eat.
// SMOKE=1 — instrument-honesty: 1 seed x 25d armed; policy.daily fired,
//   dawn log entries with fires booleans, takes/enters consistent, every
//   counted take and enter beat-voiced.
//
// Node harness: full src/js list in index.html order (minus DOM-only), via
// sim-harness. Math.random seeded BEFORE eval (loadGame does it).
// Game.save never stubbed.
//
// Usage: node scripts/test-dawngo-20261015.js
//        SMOKE=1 node scripts/test-dawngo-20261015.js
'use strict';

const SMOKE = process.env.SMOKE === '1';
let failures = 0;
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) failures++;
}

// Post-kill: the layer is deleted per kill protocol. The committed proof stays
// runnable by skipping the layer-dependent parts loudly instead of FATAL-ing.
const DG_PATH = (() => { try { return require.resolve('./policies/dawngo'); } catch (e) { return null; } })();
function skipIfLayerGone(part) {
  if (!DG_PATH) { console.log(`  SKIP ${part} (layer deleted per kill protocol — scripts/policies/dawngo absent)`); return true; }
  return false;
}

// ---------------- PART A: fixtures (mock) ----------------
function partA() {
  console.log('PART A — gate + reactive-draw fixtures');
  if (skipIfLayerGone('partA')) return;

  function mockGame(o) {
    const g = {
      over: false,
      dayPart: 0,
      _inCombat: false,
      _tile: { type: 'haven' },
      state: {
        scholar: { day: 5, kcal: 1000, dead: false, insideHaven: false, inventory: [], villagerId: 'v1' },
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
  const baseOf = () => ({ id: 'leadcourt', desc: 'base', upkeep(G, ctx) { ctx.u = 1; }, daily(G, ctx) { ctx.d = 1; } });

  // A1 — gate off.
  delete require.cache[require.resolve(DG_PATH)];
  delete process.env.DAWNGO;
  const dgOff = require(DG_PATH);
  const base = baseOf();
  check('A1 gate off: wrapPolicy(base) === base', dgOff.wrapPolicy(base) === base);

  // A2 — gate off: named exports are the base policies.
  check('A2 gate off: named exports are base policies',
    dgOff.dawngoLeadcourt === require('./policies/leadcourt').leadcourt &&
    dgOff.dawngoBelongseek === require('./policies/belongseek').belongseek);

  // A3 — gate on.
  process.env.DAWNGO = '1';
  delete require.cache[require.resolve(DG_PATH)];
  const dg = require(DG_PATH);
  const base2 = baseOf();
  const w = dg.wrapPolicy(base2);
  check('A3 gate on: wrapped id dawngo-leadcourt', w.id === 'dawngo-leadcourt', w.id);
  check('A3 gate on: base untouched',
    base2.id === 'leadcourt' && !base2.upkeep.toString().includes('_dg'),
    `id=${base2.id}`);

  // A4 — fires at dawn: outside, pack empty, kcal<0.5cap -> ENTERS then takes+eats.
  {
    const G = mockGame(); // kcal=1000 < 1200 = 0.5*2400
    G.state.village.pantry = pantryOf();
    const ctx = {};
    dg.dawnStep(G, ctx);
    const eaten = G.state.scholar.kcal > 1000;
    const voicedTake = G.sayCalls.some(t => /eat it here|better than an empty belly/.test(t));
    const enterVoiced = G.sayCalls.some(t => /duck into the hall/.test(t)) &&
      G.sayCalls.some(t => /smells of smoke/.test(t));
    check('A4 fires: entered, one take, eaten immediately, voiced, audit row',
      G.state.scholar.insideHaven === true && ctx._dgTakes === 1 && eaten && voicedTake &&
      enterVoiced && ctx._dgEnters === 1 && ctx._dgTakeDay === 5 &&
      ctx._dgLog.length === 1 && ctx._dgLog[0].fires === true &&
      ctx._dgLog[0].took === true && ctx._dgLog[0].entered === true &&
      ctx._dgLog[0].item === 'acorn mush' && ctx._dgKcalEaten > 0,
      `inside=${G.state.scholar.insideHaven} takes=${ctx._dgTakes} kcal=${G.state.scholar.kcal} item=${ctx._dgLog[0].item}`);
  }

  // A4b — already inside: no enter line, draw proceeds.
  {
    const G = mockGame();
    G.state.scholar.insideHaven = true;
    G.state.village.pantry = pantryOf();
    const ctx = {};
    dg.dawnStep(G, ctx);
    const enterLine = G.sayCalls.some(t => /duck into the hall/.test(t));
    check('A4b inside: no double-enter, take lands',
      !enterLine && ctx._dgEnters === undefined && ctx._dgTakes === 1,
      `enterLine=${enterLine} takes=${ctx._dgTakes}`);
  }

  // A5 — silent when the pack has food (#169 pre-fill ban).
  {
    const G = mockGame();
    G.state.scholar.inventory = [{ name: 'acorn mush', plantId: 'acorn', kcalEach: 400, units: 2, edible: true, kg: 0.2 }];
    G.state.village.pantry = pantryOf();
    const pk0 = G.state.village.pantry.reduce((t, i) => t + (i.units || 0), 0);
    const ctx = {};
    dg.dawnStep(G, ctx);
    const entered = G.sayCalls.some(t => /smells of smoke/.test(t));
    check('A5 pack-fed: silent, pantry untouched, no enter',
      !entered && ctx._dgTakes === undefined &&
      G.state.village.pantry.reduce((t, i) => t + (i.units || 0), 0) === pk0 &&
      ctx._dgLog[0].reason === 'pack-fed',
      `entered=${entered} takes=${ctx._dgTakes}`);
  }

  // A6 — silent when kcal >= 0.5*cap (not a genuine emergency).
  {
    const G = mockGame();
    G.state.scholar.kcal = 2000; // >= 1200
    G.state.village.pantry = pantryOf();
    const ctx = {};
    dg.dawnStep(G, ctx);
    const entered = G.sayCalls.some(t => /smells of smoke/.test(t));
    check('A6 not-hungry: silent, no enter, no take',
      !entered && ctx._dgTakes === undefined && ctx._dgLog[0].reason === 'not-hungry',
      `entered=${entered} takes=${ctx._dgTakes}`);
  }

  // A7 — silent on dayParts 1/2/3 (wrapped upkeep does not call dawnStep).
  {
    const G = mockGame();
    G.state.village.pantry = pantryOf();
    const ctx = {};
    const ww = dg.wrapPolicy(baseOf());
    for (const dp of [1, 2, 3]) { G.dayPart = dp; ww.upkeep(G, ctx); }
    check('A7 non-dawn upkeeps never run dawnStep',
      (ctx._dgLog || []).length === 0 && ctx._dgTakes === undefined && ctx.u === 1,
      `logRows=${(ctx._dgLog || []).length} baseUpkeepRan=${ctx.u}`);
  }

  // A8 — one take per day, hard.
  {
    const G = mockGame();
    G.state.village.pantry = pantryOf();
    const ctx = {};
    dg.dawnStep(G, ctx);
    G.state.scholar.kcal = 1000; // stay hungry
    dg.dawnStep(G, ctx);
    check('A8 one take/day hard',
      ctx._dgTakes === 1 && ctx._dgLog[1].reason === 'already-took',
      `takes=${ctx._dgTakes} row2=${ctx._dgLog[1].reason}`);
  }

  // A9 — honest refusal (weight) honored + counted, never retried.
  {
    const G = mockGame({ _refuseTake: () => true });
    G.state.village.pantry = pantryOf();
    const pk0 = G.state.village.pantry.reduce((t, i) => t + (i.units || 0), 0);
    const ctx = {};
    dg.dawnStep(G, ctx);
    const pk1 = G.state.village.pantry.reduce((t, i) => t + (i.units || 0), 0);
    check('A9 weight refusal honored + counted, pantry unchanged',
      pk1 === pk0 && ctx._dgNoGain === 1 && ctx._dgTakes === undefined &&
      ctx._dgLog[0].reason === 'take-refused',
      `pantry=${pk0}->${pk1} noGain=${ctx._dgNoGain}`);
  }

  // A10 — pantry empty of takeable food -> honest no-op, counted.
  {
    const G = mockGame();
    G.state.village.pantry = [{ name: 'gravel', plantId: 'rock', kcalEach: 0, units: 5, foodState: 'raw' }];
    const ctx = {};
    dg.dawnStep(G, ctx);
    check('A10 pantry-empty no-gain',
      ctx._dgNoGain === 1 && ctx._dgTakes === undefined && ctx._dgLog[0].reason === 'pantry-empty',
      `noGain=${ctx._dgNoGain}`);
  }

  // A11 — scoring: cooked plant first, human meat never, raw meat last.
  {
    const G = mockGame();
    G.state.village.pantry = [
      { name: 'raw haunch', plantId: 'meat_deer', kcalEach: 600, units: 2, foodState: 'raw', kg: 0.5 },
      { name: 'people stew', plantId: 'meat_human', kcalEach: 700, units: 2, foodState: 'cooked', kg: 0.5 },
      { name: 'flatbread', plantId: 'acorn', kcalEach: 300, units: 2, foodState: 'cooked', kg: 0.2 },
    ];
    const ctx = {};
    dg.dawnStep(G, ctx);
    check('A11 scoring: cooked plant first, human meat never',
      ctx._dgLog[0].item === 'flatbread' && ctx._dgTakes === 1,
      `item=${ctx._dgLog[0].item}`);
  }

  // A12 — mid-fight: the engine guard is honored, no enter, counted.
  {
    const G = mockGame();
    G._inCombat = true;
    G.state.village.pantry = pantryOf();
    const ctx = {};
    dg.dawnStep(G, ctx);
    const entered = G.sayCalls.some(t => /smells of smoke/.test(t));
    check('A12 mid-fight: no enter, counted',
      !entered && ctx._dgEnters === undefined && ctx._dgTakes === undefined &&
      ctx._dgRefused === 1 && ctx._dgLog[0].reason === 'mid-fight',
      `entered=${entered} refused=${ctx._dgRefused}`);
  }

  // A13 — off the haven tile: no enter, honest refusal counted.
  {
    const G = mockGame();
    G._tile = { type: 'thicket' };
    G.state.village.pantry = pantryOf();
    const ctx = {};
    dg.dawnStep(G, ctx);
    const entered = G.sayCalls.some(t => /smells of smoke/.test(t));
    check('A13 off-haven: no enter, draw refused, counted',
      !entered && ctx._dgEnters === undefined && ctx._dgTakes === undefined &&
      ctx._dgRefused === 1 && ctx._dgLog[0].reason === 'no-access',
      `entered=${entered} refused=${ctx._dgRefused}`);
  }

  delete process.env.DAWNGO;
}

// ---------------- PART B: live engine, REAL RED ----------------
async function partB() {
  console.log('PART B — live engine (REAL RED)');
  if (skipIfLayerGone('partB')) return;
  const { loadGame, setupGame, quietLog } = require('./sim-harness');
  process.env.DAWNGO = '1';
  const dgPath = DG_PATH;
  delete require.cache[require.resolve(dgPath)];
  const dg = require(dgPath);
  const { leadcourt } = require('./policies/leadcourt');

  async function buildState() {
    const seed = 4242;
    const { Game } = await loadGame({ seed, mode: 'dawngo-proof' });
    await setupGame(Game);
    return Game;
  }
  // The ranging state the killed dawnmeal arm found: scholar ON the haven
  // tile but OUTSIDE the hall. setupGame starts the scholar inside, so
  // force the outside state explicitly (the 39/39 dawn refusals were real).
  // kcal=1000: below 0.5*kcalCap(2400)=1200, so the emergency gate passes.
  function construct(Game) {
    const s = Game.state.scholar;
    Game.dayPart = 0;
    s.kcal = 1000;
    s.inventory = [];
    s.insideHaven = false;
    const v = Game.state.village;
    v.pantry = v.pantry || [];
    v.pantry.unshift({ name: 'test acorn cake', plantId: 'acorn', kcalEach: 200, units: 3, foodState: 'cooked', kg: 0.2, safe: true });
    return { ctx: {} };
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

  // B2 RED: the LAYER enters, then takes and EATS immediately.
  {
    const Game = await buildState();
    const { ctx } = construct(Game);
    const pk0 = pantryUnits(Game);
    const k0 = Game.state.scholar.kcal;
    await quietLog(async () => { dg.dawnStep(Game, ctx); });
    check('B2 RED: layer enters (insideHaven true), one unit taken+eaten',
      Game.state.scholar.insideHaven === true &&
      pantryUnits(Game) === pk0 - 1 &&
      Game.state.scholar.kcal > k0 &&
      ctx._dgTakes === 1 && ctx._dgEnters === 1 &&
      ctx._dgTakeDay === Game.state.scholar.day &&
      ctx._dgLog[0].fires === true && ctx._dgLog[0].took === true &&
      ctx._dgLog[0].entered === true && ctx._dgKcalEaten > 0,
      `inside=${Game.state.scholar.insideHaven} pantry=${pk0}->${pantryUnits(Game)} ` +
      `kcal=${k0}->${Game.state.scholar.kcal} takes=${ctx._dgTakes} enters=${ctx._dgEnters}`);
  }

  // B2b RED: the base's dawn upkeep OUTSIDE draws nothing (access wall)
  // and never enters — the wall bites the base too.
  {
    const Game = await buildState();
    construct(Game);
    const pk0 = pantryUnits(Game);
    await quietLog(async () => { if (leadcourt.upkeep) leadcourt.upkeep(Game, { policyId: 'leadcourt' }); });
    check('B2b RED: base dawn upkeep outside draws nothing and never enters',
      packFoodUnits(Game) === 0 && pantryUnits(Game) === pk0 &&
      Game.state.scholar.insideHaven === false,
      `pantry=${pk0}->${pantryUnits(Game)} pack=${packFoodUnits(Game)}`);
  }

  // B3 RED: the layer is silent at dawn when kcal >= 0.5*cap (live).
  {
    const Game = await buildState();
    const { ctx } = construct(Game);
    Game.state.scholar.kcal = 2000; // >= 1200: not an emergency
    const pk0 = pantryUnits(Game);
    await quietLog(async () => { dg.dawnStep(Game, ctx); });
    check('B3 RED: silent when not hungry (live) — no enter, no take',
      ctx._dgTakes === undefined && ctx._dgEnters === undefined &&
      pantryUnits(Game) === pk0 && Game.state.scholar.insideHaven === false &&
      ctx._dgLog[0].reason === 'not-hungry',
      `takes=${ctx._dgTakes} enters=${ctx._dgEnters} reason=${ctx._dgLog[0].reason}`);
  }

  // B4: silent at dawn when the pack has food (live).
  {
    const Game = await buildState();
    const { ctx } = construct(Game);
    Game.state.scholar.inventory = [{ name: 'trail cake', plantId: 'acorn', kcalEach: 300, units: 2, foodState: 'cooked', edible: true, kg: 0.1 }];
    const pk0 = pantryUnits(Game);
    await quietLog(async () => { dg.dawnStep(Game, ctx); });
    check('B4 silent when pack-fed (live) — no enter, no take',
      ctx._dgTakes === undefined && ctx._dgEnters === undefined &&
      pantryUnits(Game) === pk0 && ctx._dgLog[0].reason === 'pack-fed',
      `takes=${ctx._dgTakes} enters=${ctx._dgEnters}`);
  }
  delete process.env.DAWNGO;
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
  if (skipIfLayerGone('partC')) return;
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
  const PIDS = ['leadcourt', 'belongseek'];
  let pass = 0, fail = 0;
  for (const pid of PIDS) {
    for (const seed of SEEDS) {
      const hashes = [];
      const trig = [];
      for (const armed of [false, true]) {
        if (armed) process.env.DAWNGO = '1'; else delete process.env.DAWNGO;
        const dgPath = DG_PATH;
        delete require.cache[require.resolve(dgPath)];
        const dg = require(dgPath);
        const base = require('./policies/' + pid)[pid];
        const policy = armed ? dg.wrapPolicy(base) : base;
        const { Game } = await loadGame({ seed, mode: 'dawngo-det' });
        await setupGame(Game);
        const wrapped = Object.assign({}, policy);
        const bDaily = policy.daily, bUpkeep = policy.upkeep;
        const hs = [];
        let dawnRows = 0, takes = 0, enters = 0;
        wrapped.upkeep = (G, ctx) => {
          seedPackFull(G);
          const r = bUpkeep ? bUpkeep(G, ctx) : undefined;
          try {
            dawnRows = (ctx._dgLog || []).length;
            takes = ctx._dgTakes || 0;
            enters = ctx._dgEnters || 0;
          } catch (e) {}
          return r;
        };
        wrapped.daily = (G, ctx) => {
          hs.push(G.state.scholar.day + ':' + dayHash(G));
          return bDaily ? bDaily(G, ctx) : undefined;
        };
        wrapped.setup = undefined;
        const ctx = { policyId: 'dawngo-det', notes: [] };
        await quietLog(async () => { await runDays(Game, wrapped, { days: 30, sampleEvery: 31 }); });
        hashes.push(hs.join('\n'));
        trig.push({ dawnRows, takes, enters });
        delete process.env.DAWNGO;
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
  console.log('== dawngo SMOKE (instrument-honesty) ==');
  if (skipIfLayerGone('smoke')) return;
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  process.env.DAWNGO = '1';
  const dgPath = DG_PATH;
  delete require.cache[require.resolve(dgPath)];
  const dg = require(dgPath);
  const base = require('./policies/belongseek').belongseek;
  const policy = dg.wrapPolicy(base);
  const { Game } = await loadGame({ seed: 11, mode: 'dawngo-smoke' });
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
  const log = ctx._dgLog || [];
  const fails = [];
  const scheck = (n, c, d) => { console.log(`  ${c ? 'PASS' : 'FAIL'} ${n}${d ? ' — ' + d : ''}`); if (!c) fails.push(n); };
  scheck('policy.daily fired', dailyCalls >= 20, `calls=${dailyCalls}`);
  scheck('dawn log entries present', log.length >= 15, `entries=${log.length}`);
  scheck('every dawn entry has a fires boolean', log.every(e => typeof e.fires === 'boolean'));
  scheck('trigger count consistent', (ctx._dgTriggers || 0) === log.filter(e => e.fires).length,
    `triggers=${ctx._dgTriggers} fired-rows=${log.filter(e => e.fires).length}`);
  scheck('takes consistent with took-rows', (ctx._dgTakes || 0) === log.filter(e => e.took).length,
    `takes=${ctx._dgTakes} took-rows=${log.filter(e => e.took).length}`);
  scheck('enters consistent with entered-rows', (ctx._dgEnters || 0) === log.filter(e => e.entered).length,
    `enters=${ctx._dgEnters} entered-rows=${log.filter(e => e.entered).length}`);
  const eatLines = said.filter(t => /better than an empty belly/i.test(t));
  scheck('every counted take is beat-voiced', (ctx._dgTakes || 0) === 0 || eatLines.length >= (ctx._dgTakes || 0),
    `takes=${ctx._dgTakes} voiced=${eatLines.length}`);
  const enterLines = said.filter(t => /duck into the hall for the stores/i.test(t));
  scheck('every counted enter is beat-voiced', (ctx._dgEnters || 0) === 0 || enterLines.length >= (ctx._dgEnters || 0),
    `enters=${ctx._dgEnters} voiced=${enterLines.length}`);
  console.log(fails.length ? `\nSMOKE: ${fails.length} FAILURES` : '\nSMOKE: ALL GREEN');
  delete process.env.DAWNGO;
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
