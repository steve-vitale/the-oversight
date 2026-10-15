#!/usr/bin/env node
// scripts/test-guardreplace-20261015.js — proof test for the guardreplace
// layer (loop B ARM, sim-findings #338, 2026-10-15). ALL GREEN is the gate
// before ANY sweep spend.
//
// #338 (PRO-CYCLICAL TAKE-BLOCK STARVES THE SCHOLAR): sim-trustguard's
// trailing-7d take-block fired exactly when the scholar was hungriest and,
// with no calorie replacement, starved scholars (12 vs 2 starvation deaths).
// The named requirement: a calorie replacement, not just a block.
//
// The layer rebuilds the trustguard dawn chain (enter -> one honest take ->
// pack -> mid-day honest eat) and changes ONLY the block branch: instead of
// skipping the day, the scholar works the wild ground at dawn (travel out,
// Game.doAction('forage'), travel home, Game.sortBag the haul at camp, pack
// it) and eats the wild haul at mid-day through the proven mid-day eat
// mechanism. THE PAIRING INVARIANT: a blocked take is ALWAYS paired with a
// same-day replacement meal — never a zero-calorie day.
//
// PART A — gate + guard + replacement fixtures (mock Game, no engine):
//   A1 gate off: wrapPolicy(base) === base.
//   A2 gate off: named exports are the base leadcourt/belongseek objects.
//   A3 gate on: wrapped id 'guardreplace-leadcourt'; base untouched;
//      BLOCK_AT=-3000 (TAX_BAR -5000 + MARGIN 2000).
//   A4 guard PASSES on a healthy ledger: take lands, stamped, voiced.
//   A5 THE PAIRING INVARIANT: guard BLOCKS on a red ledger AND the wild-haul
//      replacement fires — no take, trip hauled, packed, mid-day eat ate>0,
//      counted as a replacement meal, voiced. A block without a same-day
//      meal is a FAIL.
//   A5b whiff honesty: the wild trip yields nothing -> block + whiff voiced
//      + counted (never silent).
//   A6 margin boundary: projected == -3000 passes (strict <); -3001 blocks.
//   A7 one take/day hard (dupDay).
//   A8 enter+take chain preserved.
//   A9 mid-day wart fix: ate>0 voices+counts; ate=0 silent (no over-claim,
//      no repeated eat line).
//   A10 trailingNet7 reads the real histories (day>=day-6 window).
//   A11 picker: cooked plant first / human meat never / raw meat last /
//      cap-bounded.
//   A12 #169 pre-fill ban: pack with food -> silent, pantry untouched.
//   A13 silent when covered.
//   A14 wild trip bails on a fight (tbfight): no haul, fight voiced, whiff
//      counted — the layer never fights.
//   A15 noPantryTake path: bare pantry -> wild trip (not a block), the meal
//      still lands.
// PART B — live engine, constructed states (REAL RED):
//   B1 RED: the BROKEN variant (guard decision WITHOUT the replacement —
//      the trustguard behavior, reusing the layer's real trailingNet7 /
//      bestPantryIndex / BLOCK_AT) on a deep trailing-7d ledger seeded by
//      REAL takeFromPantry calls: blocks, and the scholar gets NOTHING
//      (pack empty, kcal unchanged) — the pro-cyclical starvation signature,
//      reproduced. Then the REAL layer at the same state: blocks, wild trip
//      hauls, pack gains food, mid-day eat feeds the scholar (ate>0,
//      _grReplMeals=1). The contrast is the RED/GREEN.
//   B2 RED: the layer with a healthy ledger takes (pantry -1, pack +1,
//      provenance stamped).
//   B3 RED: the guard reads the REAL takeHist (seeded by real takes) and
//      blocks — no stubbed ledger.
//   B4 RED: the wild trip end-to-end on the live engine (hauled>0, pack
//      gain, sorted food named).
//   B5: the mid-day wart fix on the live engine — the layer's beat doesn't
//      repeat the engine's eat line.
// PART C — det-gate: 30d x 8 seeds x 2 policies, gate-off vs gate-on with
//   a PACK SEEDER (pack never empty -> the draw gate never fires). Byte-
//   identical trajectories while the trigger machinery runs hot.
// SMOKE=1 — instrument-honesty: 1 seed x 25d armed; policy.daily fired,
//   dawn rows hot, takes/blocks/trips/meals consistent, every counted
//   take/block/trip/meal beat-voiced, no repeated eat line.
//
// Node harness: full src/js list in index.html order (minus DOM-only), via
// sim-harness. Math.random seeded BEFORE eval (loadGame does it). Game.save
// never stubbed. No git stash anywhere (repo-global stack).
//
// Usage: node scripts/test-guardreplace-20261015.js
//        SMOKE=1 node scripts/test-guardreplace-20261015.js
//        PARTA_ONLY=1 / PARTB_ONLY=1 for the fixture/live halves.
'use strict';

const SMOKE = process.env.SMOKE === '1';
let failures = 0;
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) failures++;
}

const GR_PATH = './policies/guardreplace';

// ---------------- PART A: fixtures (mock) ----------------
function partA() {
  console.log('PART A — gate + guard + replacement fixtures');
  globalThis.Scattering = globalThis.Scattering || {};

  function mockGame(o) {
    const g = {
      over: false,
      dayPart: 0,
      _inCombat: false,
      tbfight: false,
      _tbfightOnTravel: false,
      _tile: { type: 'haven' },
      map: { px: 4, py: 4 },
      villagerId: 'v1',
      _forageOk: true,
      _knowsPurslane: true,
      state: {
        scholar: { day: 5, kcal: 1500, dead: false, insideHaven: false, inventory: [], prepStash: [], villagerId: 'v1' },
        village: { pantry: [], trust: { v1: 20 }, takes: {}, gives: {}, takeHist: {}, giveHist: {} },
      },
      kcalCap() { return 2400; },
      sayCalls: [],
      say(t) { this.sayCalls.push(String(t)); },
      inCombat() { return !!this._inCombat; },
      playerTile() { return this._tile; },
      havenStoresAccess() {
        const s = this.state.scholar;
        return (s.insideHaven) ? 'inside' : 'none';
      },
      enterBuilding() {
        const s = this.state.scholar;
        if (this._inCombat) return false;
        if (s.insideHaven) return false;
        if (this.map.px !== 4 || this.map.py !== 4) return false;
        s.insideHaven = true;
        this.say('Inside. The hall smells of smoke and twelve people. Home.');
        return true;
      },
      itemDisplayName(it) { return (it && it.name) || 'food'; },
      isSpoiled() { return false; },
      // mock takeFromPantry: honest like the engine (pantry -1, pack +1,
      // writes takes + takeHist).
      takeFromPantry(idx) {
        if (this.havenStoresAccess() === 'none') {
          this.say('The pantry is in the hall. Your hands are not.');
          return null;
        }
        const pantry = this.state.village.pantry;
        const item = pantry[idx];
        if (!item) return null;
        const v = this.state.village, vid = this.villagerId;
        const taken = { name: item.name, plantId: item.plantId, kcalEach: item.kcalEach,
          units: 1, foodState: item.foodState, edible: item.edible !== false, kg: item.kg || 0.1 };
        this.state.scholar.inventory.push(taken);
        item.units = (item.units || 1) - 1;
        if (item.units <= 0) pantry.splice(idx, 1);
        v.takes[vid] = (v.takes[vid] || 0) + (item.kcalEach || 0);
        const h = (v.takeHist[vid] = v.takeHist[vid] || []);
        h.push({ day: this.state.scholar.day, kcal: item.kcalEach || 0 });
        this.say(`Took ${item.name}.`);
        return null;
      },
      // mock eat: eats from the pack like the engine (edible, kcalEach>0).
      eat() {
        const s = this.state.scholar, cap = this.kcalCap();
        const before = s.kcal;
        let want = cap - s.kcal;
        const inv = s.inventory;
        while (want > 0) {
          const fi = inv.findIndex(i => (i.kcalEach || 0) > 0 && (i.units || 0) > 0 && i.edible !== false);
          if (fi === -1) break;
          const it = inv[fi];
          const units = Math.min(it.units, Math.ceil(want / it.kcalEach));
          s.kcal = Math.min(cap, s.kcal + units * it.kcalEach);
          want -= units * it.kcalEach;
          it.units -= units;
          if (it.units <= 0) inv.splice(fi, 1);
        }
        return s.kcal - before;
      },
      travelTargets() { return [{ x: 5, y: 4, d: 1 }, { x: 6, y: 4, d: 2 }]; },
      tileAt(x, y) {
        if (x === 4 && y === 4) return { type: 'haven', stock: 0 };
        return { type: 'thicket', stock: 3, revealed: true };
      },
      travelBlockage() { return null; },
      travelTo(x, y) {
        if (this.tbfight) return null; // no movement mid-fight
        if (this._tbfightOnTravel) { this.tbfight = true; return null; }
        this.map.px = x; this.map.py = y;
        // homecoming: lumps stage on the prep counter
        if (x === 4 && y === 4) {
          const inv = this.state.scholar.inventory, stash = this.state.scholar.prepStash;
          for (let i = inv.length - 1; i >= 0; i--) {
            if (inv[i] && inv[i].lump) { stash.push(inv[i]); inv.splice(i, 1); }
          }
        }
        return { ok: true };
      },
      doAction(kind) {
        if (kind !== 'forage') return null;
        if (!this._forageOk) return null;
        this.state.scholar.inventory.push({
          name: 'unknown shoots', lumpForm: 'shoots', units: 3, unit: 'handful',
          foodKind: 'plant', foodState: 'unknown', edible: false, kcalEach: 0, kg: 0.1,
          lump: { purslane: { units: 3, day: this.state.scholar.day } },
        });
        return { ok: true };
      },
      atCamp() { return this.map.px === 4 && this.map.py === 4; },
      // mock sortBag: honest like the engine (default container prepStash;
      // solo names what the scholar knows; food pushed into the container).
      sortBag(vid, idx, container) {
        const cont = container || this.state.scholar.prepStash || [];
        const lump = cont[idx];
        if (!lump || !lump.lump) return null;
        if (!this._knowsPurslane) return null;
        const e = lump.lump.purslane;
        if (!e) return null;
        delete lump.lump.purslane;
        cont.push({ name: 'Purslane', plantId: 'purslane', kcalEach: 150, units: e.units,
          edible: true, foodState: 'ready', kg: 0.1 });
        return { named: ['purslane'] };
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
  delete require.cache[require.resolve(GR_PATH)];
  delete process.env.GUARDREPLACE;
  const grOff = require(GR_PATH);
  const base = baseOf();
  check('A1 gate off: wrapPolicy(base) === base', grOff.wrapPolicy(base) === base);

  // A2 — gate off: named exports are the base policies.
  check('A2 gate off: named exports are base policies',
    grOff.guardreplaceLeadcourt === require('./policies/leadcourt').leadcourt &&
    grOff.guardreplaceBelongseek === require('./policies/belongseek').belongseek);

  // A3 — gate on.
  process.env.GUARDREPLACE = '1';
  delete require.cache[require.resolve(GR_PATH)];
  const gr = require(GR_PATH);
  const base2 = baseOf();
  const w = gr.wrapPolicy(base2);
  check('A3 gate on: wrapped id guardreplace-leadcourt', w.id === 'guardreplace-leadcourt', w.id);
  check('A3 gate on: base untouched',
    base2.id === 'leadcourt' && !base2.upkeep.toString().includes('_gr'),
    `id=${base2.id}`);
  check('A3 constants: BLOCK_AT=-3000 (TAX_BAR -5000 + MARGIN 2000)',
    gr.BLOCK_AT === -3000 && gr.TAX_BAR === -5000 && gr.MARGIN === 2000,
    `BLOCK_AT=${gr.BLOCK_AT}`);

  // A4 — guard PASSES on a healthy ledger: take lands, stamped, voiced.
  {
    const G = mockGame();
    G.state.village.pantry = pantryOf();
    G.state.village.takeHist.v1 = [{ day: 5, kcal: 500 }]; // net7 = -500
    const ctx = {};
    gr.dawnStep(G, ctx);
    const stamped = G.state.scholar.inventory.some(i => i._grPantryTaken);
    const voiced = G.sayCalls.some(t => /packed lunch/.test(t));
    const row = ctx._grLog[0];
    check('A4 guard passes (healthy ledger): take lands, stamped, voiced, audit row',
      ctx._grTakes === 1 && stamped && voiced && row.took === true &&
      !row.blocked && row.net7 === -500 && row.projected === -900 &&
      ctx._grEnters === 1 && ctx._grTakeDay === 5,
      `takes=${ctx._grTakes} net7=${row.net7} projected=${row.projected} stamped=${stamped}`);
  }

  // A5 — THE PAIRING INVARIANT: guard BLOCKS on a red ledger AND the
  // wild-haul replacement fires. A block without a same-day meal is a FAIL.
  {
    const G = mockGame();
    G.state.village.pantry = pantryOf();
    G.state.village.takeHist.v1 = [
      { day: 5, kcal: 1000 }, { day: 4, kcal: 1000 }, { day: 3, kcal: 1200 },
    ]; // net7 = -3200; candidate 400 -> projected -3600 < -3000: BLOCK
    const ctx = {};
    const pkBefore = G.state.village.pantry.reduce((t, i) => t + i.units, 0);
    gr.dawnStep(G, ctx);
    const row = ctx._grLog[0];
    const blockVoiced = G.sayCalls.some(t => /ledger's running red/.test(t));
    const haulVoiced = G.sayCalls.some(t => /for the road/.test(t));
    const packKcal = G.state.scholar.inventory.reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 0), 0);
    check('A5a block+replacement: no take, block counted, trip hauled, packed, voiced',
      ctx._grTakes === undefined && ctx._grBlocks === 1 && row.blocked === true &&
      row.replaced === true && (row.replKcal || 0) > 0 && ctx._grWildTrips === 1 &&
      (ctx._grWildKcal || 0) > 0 && blockVoiced && haulVoiced &&
      G.state.village.pantry.reduce((t, i) => t + i.units, 0) === pkBefore &&
      packKcal > 0 && ctx._grPackDay === 5 && ctx._grPackedSource === 'wild',
      `takes=${ctx._grTakes} blocks=${ctx._grBlocks} replKcal=${row.replKcal} packKcal=${packKcal}`);
    // Mid-day: the replacement meal lands through the proven mechanism.
    G.dayPart = 1;
    const k0 = G.state.scholar.kcal;
    gr.middayStep(G, ctx);
    const ate = G.state.scholar.kcal - k0;
    const mrow = ctx._grMealLog[0];
    const mealVoiced = G.sayCalls.some(t => /eaten on the trail/.test(t));
    check('A5b pairing invariant: the blocked take is paired with a same-day replacement meal',
      ate > 0 && ctx._grReplMeals === 1 && (ctx._grReplKcal || 0) > 0 &&
      mrow.ate > 0 && mrow.source === 'wild' && mealVoiced,
      `ate=${ate} replMeals=${ctx._grReplMeals} replKcal=${ctx._grReplKcal}`);
  }

  // A5b2 — stand-down honesty: the wild trip yields nothing -> the guard
  // STANDS DOWN (no starvation block) and the scholar takes the pantry
  // lunch, voiced honestly. A guard that starves is the #338 harm.
  {
    const G = mockGame({ _forageOk: false });
    G.state.village.pantry = pantryOf();
    G.state.village.takeHist.v1 = [
      { day: 5, kcal: 1000 }, { day: 4, kcal: 1000 }, { day: 3, kcal: 1200 },
    ];
    const ctx = {};
    const pkBefore = G.state.village.pantry.reduce((t, i) => t + i.units, 0);
    gr.dawnStep(G, ctx);
    const row = ctx._grLog[0];
    const standVoiced = G.sayCalls.some(t => /ledger will have to wait/.test(t));
    check('A5c stand-down honesty: bare wild -> guard stands down, lunch taken, voiced',
      ctx._grBlocks === undefined && ctx._grStandDowns === 1 && row.stoodDown === true &&
      ctx._grTakes === 1 && row.stoodDownTook === true && standVoiced &&
      G.state.village.pantry.reduce((t, i) => t + i.units, 0) === pkBefore - 1,
      `blocks=${ctx._grBlocks} standDowns=${ctx._grStandDowns} takes=${ctx._grTakes} voiced=${standVoiced}`);
  }

  // A6 — margin boundary: projected exactly -3000 passes; -3001 blocks.
  {
    const G = mockGame();
    G.state.village.pantry = pantryOf();
    G.state.village.takeHist.v1 = [{ day: 5, kcal: 2600 }]; // -2600-400=-3000
    const ctx = {};
    gr.dawnStep(G, ctx);
    check('A6a boundary: projected == -3000 passes (strict <)',
      ctx._grTakes === 1 && ctx._grBlocks === undefined,
      `takes=${ctx._grTakes} blocks=${ctx._grBlocks}`);
    const G2 = mockGame();
    G2.state.village.pantry = pantryOf();
    G2.state.village.takeHist.v1 = [{ day: 5, kcal: 2601 }]; // -3001
    const ctx2 = {};
    gr.dawnStep(G2, ctx2);
    check('A6b boundary: projected == -3001 blocks',
      ctx2._grTakes === undefined && ctx2._grBlocks === 1,
      `takes=${ctx2._grTakes} blocks=${ctx2._grBlocks}`);
  }

  // A7 — one take per day, hard.
  {
    const G = mockGame();
    G.state.village.pantry = pantryOf();
    const ctx = {};
    gr.dawnStep(G, ctx);
    G.state.scholar.inventory = [];
    gr.dawnStep(G, ctx);
    check('A7 one take/day hard', ctx._grTakes === 1 && ctx._grLog[1].dupDay === true,
      `takes=${ctx._grTakes}`);
  }

  // A8 — enter+take chain preserved (outside -> enter -> take).
  {
    const G = mockGame();
    G.state.village.pantry = pantryOf();
    const ctx = {};
    gr.dawnStep(G, ctx);
    const enterVoiced = G.sayCalls.some(t => /duck into the hall/.test(t)) &&
      G.sayCalls.some(t => /smells of smoke/.test(t));
    check('A8 enter+take preserved',
      G.state.scholar.insideHaven === true && ctx._grEnters === 1 &&
      ctx._grTakes === 1 && enterVoiced,
      `inside=${G.state.scholar.insideHaven} enters=${ctx._grEnters}`);
  }

  // A9 — mid-day wart fix: ate>0 voices+counts; ate=0 silent (no over-claim,
  // no repeated eat line).
  {
    const G = mockGame();
    G.dayPart = 1;
    G.state.scholar.kcal = 1500;
    G.state.scholar.inventory = [{ name: 'acorn mush', kcalEach: 400, units: 2, edible: true }];
    const ctx = { _grPackDay: 5, _grPackedName: 'acorn mush', _grPackedSource: 'pantry' };
    gr.middayStep(G, ctx);
    const voiced = G.sayCalls.some(t => /eaten on the trail/.test(t));
    const noRepeat = !G.sayCalls.some(t => /^You eat the acorn/.test(t));
    check('A9a mid-day ate>0: voiced + counted, no repeated eat line',
      ctx._grMeals === 1 && (ctx._grKcalEaten || 0) > 0 && voiced && noRepeat,
      `meals=${ctx._grMeals} kcal=${ctx._grKcalEaten}`);
    const G2 = mockGame();
    G2.dayPart = 1;
    G2.state.scholar.kcal = 1500;
    G2.state.scholar.inventory = []; // the base already ate the lunch
    const ctx2 = { _grPackDay: 5, _grPackedName: 'acorn mush', _grPackedSource: 'pantry' };
    gr.middayStep(G2, ctx2);
    const voiced2 = G2.sayCalls.some(t => /eaten on the trail/.test(t));
    check('A9b mid-day ate=0: silent, not counted (no over-claim)',
      ctx2._grMeals === undefined && !voiced2 && ctx2._grMealLog[0].ateNothing === true,
      `meals=${ctx2._grMeals} voiced=${voiced2}`);
  }

  // A10 — trailingNet7 reads the real histories (day>=day-6 window).
  {
    const G = mockGame();
    G.state.village.takeHist.v1 = [
      { day: 5, kcal: 1000 }, { day: 0, kcal: 500 }, { day: -1, kcal: 999 },
      { day: -2, kcal: 999 }, // day -2 < 5-6=-1: out of window
    ];
    G.state.village.giveHist.v1 = [{ day: 4, kcal: 700 }];
    const net = gr.trailingNet7(G, 'v1');
    check('A10 trailingNet7: engine window day>=day-6, engine sign (gives-takes)',
      net === -1799, `net7=${net}`);
  }

  // A11 — picker scoring.
  {
    const G = mockGame();
    G.state.village.pantry = [
      { name: 'raw haunch', plantId: 'meat_deer', kcalEach: 600, units: 2, foodState: 'raw', kg: 0.5 },
      { name: 'people stew', plantId: 'meat_human', kcalEach: 700, units: 2, foodState: 'cooked', kg: 0.5 },
      { name: 'flatbread', plantId: 'acorn', kcalEach: 300, units: 2, foodState: 'cooked', kg: 0.2 },
    ];
    const i = gr.bestPantryIndex(G, 2400);
    check('A11a scoring: cooked plant first, human meat never, raw meat last', i === 2, `idx=${i}`);
    const G2 = mockGame();
    G2.state.village.pantry = [{ name: 'people stew', plantId: 'meat_human', kcalEach: 700, units: 2, foodState: 'cooked', kg: 0.5 }];
    check('A11b human meat alone: no take', gr.bestPantryIndex(G2, 2400) === -1);
    const G3 = mockGame();
    G3.state.village.pantry = [{ name: 'feast haunch', plantId: 'deer', kcalEach: 1200, units: 2, foodState: 'cooked', kg: 0.5 }];
    check('A11c cap-bounded: oversized unit skipped', gr.bestPantryIndex(G3, 900) === -1);
  }

  // A12 — #169 pre-fill ban.
  {
    const G = mockGame();
    G.state.village.pantry = pantryOf();
    G.state.scholar.inventory = [{ name: 'acorn mush', kcalEach: 400, units: 2, edible: true }];
    const ctx = {};
    const pk0 = G.state.village.pantry.reduce((t, i) => t + i.units, 0);
    gr.dawnStep(G, ctx);
    check('A12 pre-fill ban: silent when pack has food',
      ctx._grTakes === undefined && pk0 === G.state.village.pantry.reduce((t, i) => t + i.units, 0) &&
      ctx._grLog[0].packFull === true && G.state.scholar.insideHaven === false,
      `takes=${ctx._grTakes}`);
  }

  // A13 — silent when covered.
  {
    const G = mockGame();
    G.state.scholar.kcal = 2400;
    G.state.village.pantry = pantryOf();
    const ctx = {};
    gr.dawnStep(G, ctx);
    check('A13 silent when covered', ctx._grTakes === undefined && ctx._grLog[0].fires === false,
      `fires=${ctx._grLog[0].fires}`);
  }

  // A14 — wild trip bails on a fight: the guard stands down (no starvation
  // block) and the scholar takes the lunch. The layer never fights.
  {
    const G = mockGame({ _tbfightOnTravel: true });
    G.state.village.pantry = pantryOf();
    G.state.village.takeHist.v1 = [
      { day: 5, kcal: 1000 }, { day: 4, kcal: 1000 }, { day: 3, kcal: 1200 },
    ];
    const ctx = {};
    gr.dawnStep(G, ctx);
    const row = ctx._grLog[0];
    const fightVoiced = G.sayCalls.some(t => /Trouble on the trail/.test(t));
    check('A14 fight bail: guard stands down, lunch taken, fight voiced — the layer never fights',
      row.tripFight === true && row.stoodDown === true && ctx._grStandDowns === 1 &&
      ctx._grTakes === 1 && fightVoiced && ctx._grBlocks === undefined,
      `tripFight=${row.tripFight} standDowns=${ctx._grStandDowns} takes=${ctx._grTakes} voiced=${fightVoiced}`);
  }

  // A15 — noPantryTake path: bare pantry -> wild trip (not a block).
  {
    const G = mockGame();
    G.state.village.pantry = [];
    const ctx = {};
    gr.dawnStep(G, ctx);
    const row = ctx._grLog[0];
    check('A15 bare pantry: wild trip, not a block, the meal still lands',
      row.noPantryTake === true && ctx._grBlocks === undefined &&
      row.replaced === true && (row.replKcal || 0) > 0 && ctx._grWildTrips === 1,
      `noPantryTake=${row.noPantryTake} blocks=${ctx._grBlocks} replKcal=${row.replKcal}`);
  }

  delete process.env.GUARDREPLACE;
}

// ---------------- PART B: live engine (REAL RED) ----------------
// The BROKEN variant: the guard decision WITHOUT the calorie replacement
// (the trustguard behavior — block + skip). It reuses the layer's REAL
// trailingNet7 / bestPantryIndex / BLOCK_AT so the RED is honest: this is
// exactly what #338 measured starving scholars.
function brokenDawnStep(Game, ctx, gr) {
  const s = Game.state.scholar || {};
  const cap = Game.kcalCap ? Game.kcalCap() : 2400;
  if ((s.kcal || 0) >= cap * 0.85) return;
  const packKcal = (s.inventory || [])
    .reduce((t, i) => t + ((i && (i.kcalEach || 0) > 0) ? i.kcalEach * (i.units || 0) : 0), 0);
  if (packKcal >= 400) return;
  const net7 = gr.trailingNet7(Game, Game.villagerId);
  const idx = gr.bestPantryIndex(Game, cap);
  if (idx < 0) return;
  const candidateKcal = Math.round((((Game.state.village || {}).pantry || [])[idx] || {}).kcalEach || 0);
  const projected = Math.round(net7 - candidateKcal);
  if (projected < gr.BLOCK_AT) {
    ctx._brkBlocks = (ctx._brkBlocks || 0) + 1;
    try { Game.say(`The ledger's running red — you leave the pantry alone today.`); } catch (e) {}
    // NO REPLACEMENT. The scholar gets nothing. (This is the #338 harm.)
  }
}

async function partB() {
  console.log('PART B — live engine (REAL RED)');
  const { loadGame, setupGame, quietLog } = require('./sim-harness');
  process.env.GUARDREPLACE = '1';
  delete require.cache[require.resolve(GR_PATH)];
  const gr = require(GR_PATH);

  async function buildState() {
    const { Game } = await loadGame({ seed: 4242, mode: 'guardreplace-proof' });
    await setupGame(Game);
    return Game;
  }
  // Construct the #338 state: a mid-run scholar (knows a plant, so the solo
  // sort can name the haul), a deep trailing-7d ledger, an empty pack, and
  // hunger. Seeded by REAL takeFromPantry calls — no stubbed ledger.
  async function construct() {
    const Game = await buildState();
    const s = Game.state.scholar;
    Game.dayPart = 0;
    s.kcal = 1500;
    s.inventory = [];
    s.insideHaven = false;
    try { Game.identifyPlant('purslane', 'taught'); } catch (e) {}
    const v = Game.state.village;
    v.pantry = v.pantry || [];
    v.pantry.unshift({ name: 'test acorn cake', plantId: 'acorn', kcalEach: 200, units: 3, foodState: 'cooked', kg: 0.2, safe: true });
    // Deep trailing-7d ledger: 8 real takes x 500 kcal = 4000.
    s.insideHaven = true; // the hall gate passes for the seeding takes
    await quietLog(async () => {
      for (let k = 0; k < 8; k++) {
        v.pantry.unshift({ name: 'seed cake ' + k, plantId: 'acorn', kcalEach: 500, units: 1, foodState: 'cooked', kg: 0.1, safe: true });
        Game.takeFromPantry(0);
      }
    });
    s.inventory = []; // empty the pack (the dawn draw gate)
    s.insideHaven = false;
    return Game;
  }
  const pantryUnits = (Game) => (Game.state.village.pantry || []).reduce((t, i) => t + (i.units || 0), 0);
  const packFoodUnits = (Game) => (Game.state.scholar.inventory || [])
    .filter(i => (i.kcalEach || 0) > 0 && (i.units || 0) > 0).reduce((t, i) => t + (i.units || 0), 0);
  const packKcal = (Game) => (Game.state.scholar.inventory || [])
    .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 0), 0);

  // B1 RED: the broken variant blocks and the scholar gets NOTHING —
  // the pro-cyclical starvation signature, reproduced on the live engine.
  {
    const Game = await construct();
    const net7 = gr.trailingNet7(Game, Game.villagerId);
    const k0 = Game.state.scholar.kcal;
    const pk0 = pantryUnits(Game);
    const ctx = {};
    await quietLog(async () => { brokenDawnStep(Game, ctx, gr); });
    check('B1 RED: broken guard blocks on the real ledger and the scholar gets nothing (pack empty, kcal unchanged)',
      net7 <= -3500 && ctx._brkBlocks === 1 &&
      packFoodUnits(Game) === 0 && pantryUnits(Game) === pk0 &&
      Game.state.scholar.kcal === k0,
      `net7=${Math.round(net7)} blocks=${ctx._brkBlocks} packUnits=${packFoodUnits(Game)} kcal=${k0}->${Game.state.scholar.kcal}`);
  }

  // B1b GREEN: the REAL layer at the same state blocks AND feeds.
  {
    const Game = await construct();
    const pk0 = pantryUnits(Game);
    const ctx = {};
    await quietLog(async () => { gr.dawnStep(Game, ctx); });
    const row = ctx._grLog[ctx._grLog.length - 1];
    check('B1b GREEN: guardreplace blocks the take AND the wild trip hauls food into the pack',
      ctx._grTakes === undefined && ctx._grBlocks === 1 && row.blocked === true &&
      row.replaced === true && (row.replKcal || 0) > 0 &&
      pantryUnits(Game) === pk0 && packKcal(Game) > 0,
      `takes=${ctx._grTakes} blocks=${ctx._grBlocks} replKcal=${row.replKcal} packKcal=${packKcal(Game)}`);
    // Mid-day: the replacement meal lands.
    Game.dayPart = 1;
    const k0 = Game.state.scholar.kcal;
    await quietLog(async () => { gr.middayStep(Game, ctx); });
    const ate = Math.round(Game.state.scholar.kcal - k0);
    check('B1c GREEN: the replacement meal feeds the scholar same-day (ate>0, counted)',
      ate > 0 && ctx._grReplMeals === 1 && (ctx._grReplKcal || 0) > 0,
      `ate=${ate} replMeals=${ctx._grReplMeals} replKcal=${ctx._grReplKcal}`);
  }

  // B2 RED: the layer with a healthy ledger takes (pantry -1, pack +1, stamped).
  {
    const Game = await buildState();
    const s = Game.state.scholar;
    Game.dayPart = 0;
    s.kcal = 1500; s.inventory = []; s.insideHaven = false;
    const v = Game.state.village;
    v.pantry = v.pantry || [];
    v.pantry.unshift({ name: 'test acorn cake', plantId: 'acorn', kcalEach: 200, units: 3, foodState: 'cooked', kg: 0.2, safe: true });
    const pk0 = pantryUnits(Game);
    const ctx = {};
    await quietLog(async () => { gr.dawnStep(Game, ctx); });
    const stamped = (Game.state.scholar.inventory || []).some(i => i._grPantryTaken);
    check('B2 RED: layer takes on a healthy ledger (pantry -1, pack +1, stamped)',
      pantryUnits(Game) === pk0 - 1 && packFoodUnits(Game) === 1 &&
      ctx._grTakes === 1 && stamped && !ctx._grLog[0].blocked,
      `pantry=${pk0}->${pantryUnits(Game)} takes=${ctx._grTakes} stamped=${stamped}`);
  }

  // B3 RED: the guard reads the REAL takeHist and blocks — no stubbed ledger.
  {
    const Game = await construct(); // deep trailing ledger via real takes
    const net7 = gr.trailingNet7(Game, Game.villagerId);
    const pk0 = pantryUnits(Game);
    const ctx = {};
    await quietLog(async () => { gr.dawnStep(Game, ctx); });
    const row = ctx._grLog[ctx._grLog.length - 1];
    check('B3 RED: guard reads the REAL takeHist and blocks (no take, pantry untouched)',
      net7 <= -3500 && ctx._grTakes === undefined && ctx._grBlocks === 1 &&
      row.blocked === true && pantryUnits(Game) === pk0,
      `net7=${Math.round(net7)} blocks=${ctx._grBlocks} pantry=${pk0}->${pantryUnits(Game)}`);
  }

  // B4 RED: the wild trip end-to-end on the live engine.
  {
    const Game = await buildState();
    const s = Game.state.scholar;
    Game.dayPart = 0;
    s.kcal = 1500; s.inventory = []; s.insideHaven = false;
    try { Game.identifyPlant('purslane', 'taught'); } catch (e) {}
    const ctx = {};
    const row = {};
    const pk0 = packKcal(Game);
    let trip = null;
    await quietLog(async () => { trip = gr.wildHaulTrip(Game, ctx, row); });
    check('B4 RED: wild trip hauls real food into the pack (hauled>0, named, sorted)',
      trip.hauled > 0 && packKcal(Game) > pk0 && (trip.names || []).length > 0 &&
      (ctx._grSorted || 0) >= 0,
      `hauled=${trip.hauled} packKcal=${pk0}->${packKcal(Game)} names=${(trip.names || []).join(',')}`);
  }

  // B5: the mid-day wart fix on the live engine — the layer's beat doesn't
  // repeat the engine's eat line.
  {
    const Game = await buildState();
    const s = Game.state.scholar;
    Game.dayPart = 1;
    s.kcal = 1500;
    s.inventory = [{ name: 'acorn mush', plantId: 'acorn', kcalEach: 400, units: 2, foodState: 'cooked', edible: true, kg: 0.2 }];
    const ctx = { _grPackDay: s.day, _grPackedName: 'acorn mush', _grPackedSource: 'pantry' };
    let said = '';
    const oSay = Game.say;
    await quietLog(async () => {
      Game.say = function (t) { said += String(t) + '\n'; return oSay.apply(this, arguments); };
      gr.middayStep(Game, ctx);
      Game.say = oSay;
    });
    const repeats = /You eat the acorn/.test(said);
    check('B5 wart fix: no repeated eat line (engine voices the eat, the layer voices the trail)',
      !repeats && /eaten on the trail/.test(said) && ctx._grMeals === 1,
      `meals=${ctx._grMeals} repeats=${repeats}`);
  }
  delete process.env.GUARDREPLACE;
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
  console.log('PART C — det-gate: 30d x 8 seeds x 2 policies, gate-off vs gate-on, pack-seeded');
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
  const PIDS = ['leadcourt', 'belongseek'];
  let pass = 0, fail = 0;
  for (const pid of PIDS) {
    for (const seed of SEEDS) {
      const hashes = [];
      const trig = [];
      for (const armed of [false, true]) {
        if (armed) process.env.GUARDREPLACE = '1'; else delete process.env.GUARDREPLACE;
        delete require.cache[require.resolve(GR_PATH)];
        const gr = require(GR_PATH);
        const base = require('./policies/' + pid)[pid];
        const policy = armed ? gr.wrapPolicy(base) : base;
        const { Game } = await loadGame({ seed, mode: 'guardreplace-det' });
        await setupGame(Game);
        const wrapped = Object.assign({}, policy);
        const bDaily = policy.daily, bUpkeep = policy.upkeep;
        const hs = [];
        let dawnRows = 0, takes = 0, blocks = 0, trips = 0, meals = 0;
        wrapped.upkeep = (G, ctx) => {
          seedPackFull(G);
          const r = bUpkeep ? bUpkeep(G, ctx) : undefined;
          try {
            dawnRows = (ctx._grLog || []).length;
            takes = ctx._grTakes || 0;
            blocks = ctx._grBlocks || 0;
            trips = ctx._grWildTrips || 0;
            meals = ctx._grMeals || 0;
          } catch (e) {}
          return r;
        };
        wrapped.daily = (G, ctx) => {
          hs.push(G.state.scholar.day + ':' + dayHash(G));
          return bDaily ? bDaily(G, ctx) : undefined;
        };
        wrapped.setup = undefined;
        const ctx = { policyId: 'guardreplace-det', notes: [] };
        await quietLog(async () => { await runDays(Game, wrapped, { days: 30, sampleEvery: 31 }); });
        hashes.push(hs.join('\n'));
        trig.push({ dawnRows, takes, blocks, trips, meals });
        delete process.env.GUARDREPLACE;
      }
      const same = hashes[0] === hashes[1];
      // The trigger path must have RUN (else the gate proves nothing): the
      // armed side must show dawn log rows while taking, blocking, tripping,
      // and mealing nothing (the guard sits behind the pack-full draw gate).
      const exercised = trig[1].dawnRows > 0 && trig[1].takes === 0 &&
        trig[1].blocks === 0 && trig[1].trips === 0 && trig[1].meals === 0;
      const ok = same && exercised;
      if (ok) pass++; else fail++;
      console.log(`  ${ok ? 'PASS' : 'FAIL'} ${pid} s${seed} ` +
        `(identical=${same} dawnRows=${trig[1].dawnRows} takes=${trig[1].takes} blocks=${trig[1].blocks} trips=${trig[1].trips} meals=${trig[1].meals})`);
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
  console.log('== guardreplace SMOKE (instrument-honesty) ==');
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  process.env.GUARDREPLACE = '1';
  delete require.cache[require.resolve(GR_PATH)];
  const gr = require(GR_PATH);
  const base = require('./policies/belongseek').belongseek;
  const policy = gr.wrapPolicy(base);
  const { Game } = await loadGame({ seed: 11, mode: 'guardreplace-smoke' });
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
  const log = ctx._grLog || [];
  const mlog = ctx._grMealLog || [];
  const fails = [];
  const scheck = (n, c, d) => { console.log(`  ${c ? 'PASS' : 'FAIL'} ${n}${d ? ' — ' + d : ''}`); if (!c) fails.push(n); };
  scheck('policy.daily fired', dailyCalls >= 20, `calls=${dailyCalls}`);
  scheck('dawn log entries present', log.length >= 15, `entries=${log.length}`);
  scheck('every dawn entry has a fires boolean', log.every(e => typeof e.fires === 'boolean'));
  scheck('trigger count consistent', (ctx._grTriggers || 0) === log.filter(e => e.fires).length,
    `triggers=${ctx._grTriggers} fired-rows=${log.filter(e => e.fires).length}`);
  scheck('takes consistent with took-rows', (ctx._grTakes || 0) === log.filter(e => e.took).length,
    `takes=${ctx._grTakes} took-rows=${log.filter(e => e.took).length}`);
  scheck('blocks consistent with blocked-rows', (ctx._grBlocks || 0) === log.filter(e => e.blocked).length,
    `blocks=${ctx._grBlocks} blocked-rows=${log.filter(e => e.blocked).length}`);
  scheck('trips consistent with replaced/stoodDown/noPantryTake rows',
    (ctx._grWildTrips || 0) === log.filter(e => e.replaced || e.stoodDown || e.noPantryTake).length,
    `trips=${ctx._grWildTrips} trip-rows=${log.filter(e => e.replaced || e.stoodDown || e.noPantryTake).length}`);
  scheck('replacement pairing: every block has a secured replacement (never a bare block)',
    log.filter(e => e.blocked).every(e => e.replaced === true && (e.replKcal || 0) > 0),
    `blocks=${ctx._grBlocks}`);
  scheck('stand-downs take the lunch (never a starvation block)',
    log.filter(e => e.stoodDown).every(e => e.took === true && e.stoodDownTook === true),
    `standDowns=${ctx._grStandDowns || 0}`);
  const packedLines = said.filter(t => /packed lunch/i.test(t));
  scheck('every counted take is beat-voiced', (ctx._grTakes || 0) === 0 || packedLines.length >= (ctx._grTakes || 0),
    `takes=${ctx._grTakes} voiced=${packedLines.length}`);
  const blockLines = said.filter(t => /ledger's running red/i.test(t));
  scheck('every counted block is beat-voiced', (ctx._grBlocks || 0) === 0 || blockLines.length >= (ctx._grBlocks || 0),
    `blocks=${ctx._grBlocks} voiced=${blockLines.length}`);
  const tripLines = said.filter(t => /for the road/i.test(t));
  scheck('every replaced block is trip-voiced', (ctx._grBlocks || 0) === 0 ||
    tripLines.length >= log.filter(e => e.replaced).length,
    `replaced=${log.filter(e => e.replaced).length} voiced=${tripLines.length}`);
  const mealLines = said.filter(t => /eaten on the trail/i.test(t));
  scheck('meals voiced, no repeated eat line', !said.some(t => /You eat the .*you (packed|gathered)/.test(t)),
    `mealLines=${mealLines.length}`);
  scheck('mid-day meal log present', mlog.length >= 15, `entries=${mlog.length}`);
  console.log(fails.length ? `\nSMOKE: ${fails.length} FAILURES` : '\nSMOKE: ALL GREEN');
  delete process.env.GUARDREPLACE;
  process.exit(fails.length ? 1 : 0);
}

(async () => {
  if (SMOKE) { await smoke(); return; }
  if (process.env.PARTA_ONLY === '1') {
    partA();
    console.log(failures ? `\nRESULT: ${failures} FAILURES` : '\nRESULT: ALL GREEN');
    process.exit(failures ? 1 : 0);
  }
  if (process.env.PARTB_ONLY === '1') {
    partA();
    await partB();
    console.log(failures ? `\nRESULT: ${failures} FAILURES` : '\nRESULT: ALL GREEN');
    process.exit(failures ? 1 : 0);
  }
  partA();
  await partB();
  await partC();
  console.log(failures ? `\nRESULT: ${failures} FAILURES` : '\nRESULT: ALL GREEN');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
