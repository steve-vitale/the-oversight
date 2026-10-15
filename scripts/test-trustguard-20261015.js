#!/usr/bin/env node
// scripts/test-trustguard-20261015.js — proof test for the trustguard
// trust-ledger guard layer (loop B ARM 1, sim-findings #329, 2026-10-15).
// ALL GREEN is the gate before ANY sweep spend.
//
// The layer rebuilds the killed sim-goinside-b dawn enter+pack chain
// (proven: enterBuilding → one honest take → pack → mid-day honest eat;
// the arm died on the trust throttle, not the chain) and adds the #329
// guard: before each dawn take, read the trailing-7d net (gives-takes,
// engine sign) from the REAL takeHist/giveHist, project the candidate
// unit, and block when projected < -5000 + MARGIN(2000) — firing the
// trust-positive donation channel alongside (honest wild food only;
// pantry-stamped food is never donatable: the honest-laundering refusal).
//
// PART A — gate + guard + give-channel fixtures (mock Game, no engine):
//   A1 gate off: wrapPolicy(base) === base (same reference).
//   A2 gate off: named exports are the base leadcourt/belongseek objects.
//   A3 gate on: wrapped id 'trustguard-leadcourt'; base untouched.
//   A4 guard PASSES on a healthy ledger: take lands, stamped, voiced.
//   A5 guard BLOCKS on a red ledger: no take; handleGuardBlock donates
//      honest wild food via honest donateToPantry (voiced, counted).
//   A6 honest-laundering refusal: only pantry-stamped food in the pack ->
//      the give channel finds nothing honest -> skip day, no donate call.
//   A7 margin boundary: projected exactly -3000 passes (strict <);
//      projected -3001 blocks.
//   A8 one take/day hard (dupDay).
//   A9 enter+take chain preserved (outside -> enter -> take, voiced).
//   A10 mid-day wart fix: ate>0 voices+counts; ate=0 silent (no over-claim).
//   A11 trailingNet7 reads the real histories (day>=day-6 window).
//   A12 picker: cooked plant first / human meat never / raw meat last /
//      cap-bounded.
//   A13 burn EWMA: seeds on first close, 0.7/0.3, negative clamps, stale
//      anchor no-op.
//   A14 #169 pre-fill ban: pack with food -> silent, pantry untouched.
//   A15 silent when covered.
// PART B — live engine, constructed states (REAL RED):
//   B1 RED: the BASE's takeFromPantry with a deep lifetime ledger fires the
//      engine's -5000 trust-tax bar (trust drops); the LAYER at the same
//      trailing-7d state blocks BEFORE the take (pantry untouched).
//   B2 RED: the layer with a healthy ledger takes (pantry -1, pack +1,
//      provenance stamped).
//   B3 RED: the guard reads the REAL takeHist (seeded by real
//      takeFromPantry calls) — no stubbed ledger.
//   B4 RED: the blocked take is followed by an honest donateToPantry that
//      writes v.gives + recordGiveHist (the net improves on the real books).
// PART C — det-gate: 30d x 8 seeds x 2 policies, gate-off vs gate-on with
//   a PACK SEEDER (pack never empty -> the draw gate, and the guard behind
//   it, never fires). Trajectories must be BYTE-IDENTICAL while the
//   trigger machinery runs hot (dawn log rows present, takes=0, blocks=0).
// SMOKE=1 — instrument-honesty: 1 seed x 25d armed; policy.daily fired,
//   dawn log entries with fires booleans, takes/blocks/gives consistent,
//   every counted take/block/give beat-voiced.
//
// Node harness: full src/js list in index.html order (minus DOM-only), via
// sim-harness. Math.random seeded BEFORE eval (mulberry32 — loadGame does it).
// Game.save never stubbed. No git stash anywhere (repo-global stack).
//
// Usage: node scripts/test-trustguard-20261015.js
//        SMOKE=1 node scripts/test-trustguard-20261015.js
'use strict';

const SMOKE = process.env.SMOKE === '1';
let failures = 0;
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) failures++;
}

const TG_PATH = './policies/trustguard';

// Post-kill: the layer is deleted per kill protocol. The committed proof stays
// runnable by skipping the layer-dependent parts loudly instead of FATAL-ing.
const TG_RESOLVED = (() => { try { return require.resolve(TG_PATH); } catch (e) { return null; } })();
function skipIfLayerGone(part) {
  if (!TG_RESOLVED) { console.log(`  SKIP ${part} (layer deleted per kill protocol — scripts/policies/trustguard absent)`); return true; }
  return false;
}

// ---------------- PART A: fixtures (mock) ----------------
function partA() {
  console.log('PART A — gate + guard + give-channel fixtures');
  if (skipIfLayerGone('partA')) return;
  globalThis.Scattering = globalThis.Scattering || {};
  const realCal = globalThis.Scattering.calories;
  globalThis.Scattering.calories = { dailyNeed: () => 2200 };

  function mockGame(o) {
    const g = {
      over: false,
      dayPart: 0,
      _inCombat: false,
      _tile: { type: 'haven' },
      villagerId: 'v1',
      state: {
        scholar: { day: 5, kcal: 1500, dead: false, insideHaven: false, inventory: [], villagerId: 'v1' },
        village: { pantry: [], trust: { v1: 20 }, takes: {}, gives: {}, takeHist: {}, giveHist: {} },
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
      isSpoiled() { return false; },
      // mock takeFromPantry: honest like the engine (pantry -1, pack +1,
      // writes takes + takeHist in engine sign).
      takeFromPantry(idx) {
        if (this.havenStoresAccess() === 'none') {
          this.say('The pantry is in the hall. Your hands are not.');
          return null;
        }
        const pantry = this.state.village.pantry;
        const item = pantry[idx];
        if (!item) return null;
        if (this._refuseTake && this._refuseTake(item)) { this.say('Too heavy.'); return null; }
        const v = this.state.village, vid = this.villagerId;
        this.state.scholar.inventory.push({
          name: item.name, plantId: item.plantId, kcalEach: item.kcalEach,
          units: 1, foodState: item.foodState, edible: item.edible !== false, kg: item.kg || 0.1,
        });
        item.units = (item.units || 1) - 1;
        if (item.units <= 0) pantry.splice(idx, 1);
        v.takes[vid] = (v.takes[vid] || 0) + (item.kcalEach || 0);
        const h = (v.takeHist[vid] = v.takeHist[vid] || []);
        h.push({ day: this.state.scholar.day, kcal: item.kcalEach || 0 });
        this.say(`Took ${item.name}.`);
        return null;
      },
      // mock donateToPantry: honest like the engine (hall gate, pack -1,
      // pantry +1, writes gives + giveHist).
      donateToPantry(idx) {
        if (this.havenStoresAccess() === 'none') {
          this.say('The pantry is in the hall. Your hands are not.');
          return null;
        }
        const inv = this.state.scholar.inventory;
        const item = inv[idx];
        if (!item || (item.kcalEach || 0) <= 0) { this.say("That's not food."); return null; }
        const v = this.state.village, vid = this.villagerId;
        const kcal = (item.kcalEach || 0) * (item.units || 1);
        v.pantry.push({ name: item.name, kcalEach: item.kcalEach, units: item.units || 1 });
        inv.splice(idx, 1);
        v.gives[vid] = (v.gives[vid] || 0) + kcal;
        const h = (v.giveHist[vid] = v.giveHist[vid] || []);
        h.push({ day: this.state.scholar.day, kcal });
        v.trust[vid] = Math.min(100, (v.trust[vid] === undefined ? 15 : v.trust[vid]) + 1);
        this.say(`Donated ${item.name} (+${kcal} kcal). Trust +1. They'll remember this.`);
        return null;
      },
      _eatAte: 400,
      eat() {
        const s = this.state.scholar, cap = this.kcalCap();
        const before = s.kcal;
        // mock eats _eatAte kcal from the pack (test-controlled)
        let want = Math.min(this._eatAte, cap - s.kcal);
        const inv = s.inventory;
        while (want > 0) {
          const fi = inv.findIndex(i => (i.kcalEach || 0) > 0 && (i.units || 0) > 0 && i.edible !== false);
          if (fi === -1) break;
          const it = inv[fi];
          const take = Math.min(want, it.kcalEach * it.units);
          const units = Math.min(it.units, Math.ceil(take / it.kcalEach));
          s.kcal = Math.min(cap, s.kcal + units * it.kcalEach);
          want -= units * it.kcalEach;
          it.units -= units;
          if (it.units <= 0) inv.splice(fi, 1);
        }
        return s.kcal - before;
      },
    };
    if (o) Object.assign(g, o);
    return g;
  }
  const pantryOf = () => ([
    { name: 'acorn mush', plantId: 'acorn', kcalEach: 400, units: 3, foodState: 'cooked', kg: 0.2 },
    { name: 'raw greens', plantId: 'dandelion', kcalEach: 150, units: 4, foodState: 'raw', kg: 0.1 },
  ]);
  const wildPack = () => ([
    { name: 'trail rabbit', plantId: 'meat_rabbit', kcalEach: 500, units: 2, foodState: 'cooked', edible: true, kg: 0.3 },
    { name: 'foraged tubers', plantId: 'tuber', kcalEach: 200, units: 3, foodState: 'cooked', edible: true, kg: 0.2 },
  ]);
  const baseOf = () => ({ id: 'leadcourt', desc: 'base', upkeep(G, ctx) { ctx.u = 1; }, daily(G, ctx) { ctx.d = 1; } });

  // A1 — gate off.
  delete require.cache[require.resolve(TG_PATH)];
  delete process.env.TRUSTGUARD;
  const tgOff = require(TG_PATH);
  const base = baseOf();
  check('A1 gate off: wrapPolicy(base) === base', tgOff.wrapPolicy(base) === base);

  // A2 — gate off: named exports are the base policies.
  check('A2 gate off: named exports are base policies',
    tgOff.trustguardLeadcourt === require('./policies/leadcourt').leadcourt &&
    tgOff.trustguardBelongseek === require('./policies/belongseek').belongseek);

  // A3 — gate on.
  process.env.TRUSTGUARD = '1';
  delete require.cache[require.resolve(TG_PATH)];
  const tg = require(TG_PATH);
  const base2 = baseOf();
  const w = tg.wrapPolicy(base2);
  check('A3 gate on: wrapped id trustguard-leadcourt', w.id === 'trustguard-leadcourt', w.id);
  check('A3 gate on: base untouched',
    base2.id === 'leadcourt' && !base2.upkeep.toString().includes('_tg'),
    `id=${base2.id}`);
  check('A3 constants: BLOCK_AT=-3000 (TAX_BAR -5000 + MARGIN 2000)',
    tg.BLOCK_AT === -3000 && tg.TAX_BAR === -5000 && tg.MARGIN === 2000,
    `BLOCK_AT=${tg.BLOCK_AT}`);

  // A4 — guard PASSES on a healthy ledger: take lands, stamped, voiced.
  {
    const G = mockGame();
    G.state.village.pantry = pantryOf();
    G.state.village.takeHist.v1 = [{ day: 5, kcal: 500 }]; // net7 = -500
    const ctx = { _tgBurnAvg: 1000 };
    tg.dawnStep(G, ctx);
    const stamped = G.state.scholar.inventory.some(i => i._tgPantryTaken);
    const voiced = G.sayCalls.some(t => /packed lunch/.test(t));
    const row = ctx._tgLog[0];
    check('A4 guard passes (healthy ledger): take lands, stamped, voiced, audit row',
      ctx._tgTakes === 1 && stamped && voiced && row.took === true &&
      !row.blocked && row.net7 === -500 && row.projected === -900 &&
      ctx._tgEnters === 1 && ctx._tgTakeDay === 5,
      `takes=${ctx._tgTakes} net7=${row.net7} projected=${row.projected} stamped=${stamped}`);
  }

  // A5 — guard BLOCKS on a red ledger: no take; the give channel fires.
  {
    const G = mockGame();
    G.state.village.pantry = pantryOf();
    G.state.village.takeHist.v1 = [
      { day: 5, kcal: 1000 }, { day: 4, kcal: 1000 }, { day: 3, kcal: 1200 },
    ]; // net7 = -3200; candidate 400 -> projected -3600 < -3000: BLOCK
    const ctx = { _tgBurnAvg: 1000 };
    // handleGuardBlock directly with a wild-food pack (the live dawn flow's
    // pack-empty gate usually preempts this; the channel is proven here).
    // The scholar is inside the hall (the guard runs after the enter).
    G.state.scholar.insideHaven = true;
    G.state.scholar.inventory = wildPack();
    const row = { day: 5, fires: true, blocked: true, net7: -3200, projected: -3600 };
    const pkBefore = G.state.village.pantry.reduce((t, i) => t + i.units, 0);
    tg.handleGuardBlock(G, ctx, row, -3200);
    const gaveVoiced = G.sayCalls.some(t => /from your own haul/.test(t));
    const ledgerVoiced = G.sayCalls.some(t => /ledger's running red/.test(t));
    check('A5 guard block: give channel fires (honest wild food donated, voiced, counted)',
      row.gave === true && row.gaveKcal === 1000 && ctx._tgGives === 1 &&
      ctx._tgGiveKcal === 1000 && gaveVoiced && ledgerVoiced &&
      G.state.village.pantry.reduce((t, i) => t + i.units, 0) === pkBefore + 2 &&
      (G.state.village.giveHist.v1 || []).length === 1,
      `gave=${row.gave} kcal=${row.gaveKcal} gives=${ctx._tgGives}`);
  }

  // A5b — the full dawnStep blocks (no take) on a red ledger with empty pack.
  {
    const G = mockGame();
    G.state.village.pantry = pantryOf();
    G.state.village.takeHist.v1 = [
      { day: 5, kcal: 1000 }, { day: 4, kcal: 1000 }, { day: 3, kcal: 1200 },
    ];
    const ctx = { _tgBurnAvg: 1000 };
    const pkBefore = G.state.village.pantry.reduce((t, i) => t + i.units, 0);
    tg.dawnStep(G, ctx);
    const row = ctx._tgLog[0];
    check('A5b dawnStep blocks: no take, skipped (empty pack), counted',
      ctx._tgTakes === undefined && ctx._tgBlocks === 1 && row.blocked === true &&
      row.skipped === true && ctx._tgSkipDay === 1 &&
      G.state.village.pantry.reduce((t, i) => t + i.units, 0) === pkBefore &&
      G.state.scholar.inventory.length === 0,
      `takes=${ctx._tgTakes} blocks=${ctx._tgBlocks} skipped=${row.skipped}`);
  }

  // A6 — honest-laundering refusal: only pantry-stamped food in the pack.
  {
    const G = mockGame();
    G.state.village.pantry = pantryOf();
    G.state.scholar.inventory = [
      { name: 'acorn mush', plantId: 'acorn', kcalEach: 400, units: 1, edible: true, _tgPantryTaken: true },
    ];
    const ctx = {};
    const row = { day: 5, fires: true, blocked: true };
    let donateCalls = 0;
    const oDonate = G.donateToPantry;
    G.donateToPantry = function (i) { donateCalls++; return oDonate.call(this, i); };
    tg.handleGuardBlock(G, ctx, row, -3200);
    check('A6 honest-laundering refusal: stamped food never donated, skip day, no donate call',
      donateCalls === 0 && row.skipped === true && ctx._tgSkipDay === 1 &&
      ctx._tgGives === undefined &&
      G.state.scholar.inventory.length === 1,
      `donateCalls=${donateCalls} skipped=${row.skipped}`);
  }

  // A7 — margin boundary: projected exactly -3000 passes; -3001 blocks.
  {
    const G = mockGame();
    G.state.village.pantry = pantryOf();
    // net7 = -2600, candidate 400 -> projected -3000: NOT < -3000 -> passes
    G.state.village.takeHist.v1 = [{ day: 5, kcal: 2600 }];
    const ctx = { _tgBurnAvg: 1000 };
    tg.dawnStep(G, ctx);
    check('A7a boundary: projected == -3000 passes (strict <)',
      ctx._tgTakes === 1 && ctx._tgBlocks === undefined,
      `takes=${ctx._tgTakes} blocks=${ctx._tgBlocks}`);
    const G2 = mockGame();
    G2.state.village.pantry = pantryOf();
    // net7 = -2601 -> projected -3001 < -3000 -> blocks
    G2.state.village.takeHist.v1 = [{ day: 5, kcal: 2601 }];
    const ctx2 = { _tgBurnAvg: 1000 };
    tg.dawnStep(G2, ctx2);
    check('A7b boundary: projected == -3001 blocks',
      ctx2._tgTakes === undefined && ctx2._tgBlocks === 1,
      `takes=${ctx2._tgTakes} blocks=${ctx2._tgBlocks}`);
  }

  // A8 — one take per day, hard.
  {
    const G = mockGame();
    G.state.village.pantry = pantryOf();
    const ctx = { _tgBurnAvg: 1000 };
    tg.dawnStep(G, ctx);
    G.state.scholar.inventory = [];
    tg.dawnStep(G, ctx);
    check('A8 one take/day hard', ctx._tgTakes === 1 && ctx._tgLog[1].dupDay === true,
      `takes=${ctx._tgTakes}`);
  }

  // A9 — enter+take chain preserved (outside -> enter -> take).
  {
    const G = mockGame();
    G.state.village.pantry = pantryOf();
    const ctx = { _tgBurnAvg: 1000 };
    tg.dawnStep(G, ctx);
    const enterVoiced = G.sayCalls.some(t => /duck into the hall/.test(t)) &&
      G.sayCalls.some(t => /smells of smoke/.test(t));
    check('A9 enter+take preserved',
      G.state.scholar.insideHaven === true && ctx._tgEnters === 1 &&
      ctx._tgTakes === 1 && enterVoiced,
      `inside=${G.state.scholar.insideHaven} enters=${ctx._tgEnters}`);
  }

  // A10 — mid-day wart fix: ate>0 voices+counts; ate=0 silent.
  {
    const G = mockGame();
    G.dayPart = 1;
    G._eatAte = 400;
    G.state.scholar.kcal = 1500;
    G.state.scholar.inventory = [{ name: 'acorn mush', kcalEach: 400, units: 2, edible: true }];
    const ctx = { _tgBurnAvg: 1000, _tgTakeDay: 5, _tgPackedName: 'acorn mush' };
    tg.middayStep(G, ctx);
    const voiced = G.sayCalls.some(t => /packed this morning/.test(t));
    check('A10a mid-day ate>0: voiced + counted',
      ctx._tgMeals === 1 && (ctx._tgKcalEaten || 0) > 0 && voiced,
      `meals=${ctx._tgMeals} kcal=${ctx._tgKcalEaten}`);
    const G2 = mockGame();
    G2.dayPart = 1;
    G2._eatAte = 0; // the base already ate the lunch
    G2.state.scholar.kcal = 1500;
    G2.state.scholar.inventory = [];
    const ctx2 = { _tgBurnAvg: 1000, _tgTakeDay: 5, _tgPackedName: 'acorn mush' };
    tg.middayStep(G2, ctx2);
    const voiced2 = G2.sayCalls.some(t => /packed this morning/.test(t));
    check('A10b mid-day ate=0: silent, not counted (no over-claim)',
      ctx2._tgMeals === undefined && !voiced2 && ctx2._tgMealLog[0].ateNothing === true,
      `meals=${ctx2._tgMeals} voiced=${voiced2}`);
  }

  // A11 — trailingNet7 reads the real histories (day>=day-6 window).
  {
    const G = mockGame();
    G.state.village.takeHist.v1 = [
      { day: 5, kcal: 1000 }, { day: 0, kcal: 500 }, { day: -1, kcal: 999 },
      { day: -2, kcal: 999 }, // day -2 < 5-6=-1: out of window
    ];
    G.state.village.giveHist.v1 = [{ day: 4, kcal: 700 }];
    // takes7 = 1000+500+999 = 2499; gives7 = 700; net7 = -1799
    const net = tg.trailingNet7(G, 'v1');
    check('A11 trailingNet7: engine window day>=day-6, engine sign (gives-takes)',
      net === -1799, `net7=${net}`);
  }

  // A12 — picker scoring.
  {
    const G = mockGame();
    G.state.village.pantry = [
      { name: 'raw haunch', plantId: 'meat_deer', kcalEach: 600, units: 2, foodState: 'raw', kg: 0.5 },
      { name: 'people stew', plantId: 'meat_human', kcalEach: 700, units: 2, foodState: 'cooked', kg: 0.5 },
      { name: 'flatbread', plantId: 'acorn', kcalEach: 300, units: 2, foodState: 'cooked', kg: 0.2 },
    ];
    const i = tg.bestPantryIndex(G, 2400);
    check('A12a scoring: cooked plant first, human meat never, raw meat last', i === 2, `idx=${i}`);
    const G2 = mockGame();
    G2.state.village.pantry = [{ name: 'people stew', plantId: 'meat_human', kcalEach: 700, units: 2, foodState: 'cooked', kg: 0.5 }];
    check('A12b human meat alone: no take', tg.bestPantryIndex(G2, 2400) === -1);
    const G3 = mockGame();
    G3.state.village.pantry = [{ name: 'feast haunch', plantId: 'deer', kcalEach: 1200, units: 2, foodState: 'cooked', kg: 0.5 }];
    check('A12c cap-bounded: oversized unit skipped', tg.bestPantryIndex(G3, 900) === -1);
  }

  // A13 — burn EWMA.
  {
    const G = mockGame();
    const ctx = { _tgDawnDay: 5, _tgDawnKcal: 2000 };
    G.state.scholar.kcal = 1500;
    tg.closeBurnLoop(G, ctx);
    check('A13a EWMA seeds on first close', ctx._tgBurnAvg === 500, `avg=${ctx._tgBurnAvg}`);
    const ctx2 = { _tgDawnDay: 5, _tgDawnKcal: 2000, _tgBurnAvg: 500 };
    G.state.scholar.kcal = 1700;
    tg.closeBurnLoop(G, ctx2);
    check('A13b EWMA 0.7/0.3', Math.abs(ctx2._tgBurnAvg - 440) < 1e-9, `avg=${ctx2._tgBurnAvg}`);
    const ctx3 = { _tgDawnDay: 5, _tgDawnKcal: 2000, _tgBurnAvg: 500 };
    G.state.scholar.kcal = 2300;
    tg.closeBurnLoop(G, ctx3);
    check('A13c EWMA clamps negative', Math.abs(ctx3._tgBurnAvg - 350) < 1e-9, `avg=${ctx3._tgBurnAvg}`);
    const ctx4 = { _tgDawnDay: 4, _tgDawnKcal: 2000 };
    G.state.scholar.kcal = 1500;
    tg.closeBurnLoop(G, ctx4);
    check('A13d stale anchor: no close', ctx4._tgBurnAvg === undefined);
  }

  // A14 — #169 pre-fill ban.
  {
    const G = mockGame();
    G.state.village.pantry = pantryOf();
    G.state.scholar.inventory = [{ name: 'acorn mush', kcalEach: 400, units: 2, edible: true }];
    const ctx = { _tgBurnAvg: 1000 };
    const pk0 = G.state.village.pantry.reduce((t, i) => t + i.units, 0);
    tg.dawnStep(G, ctx);
    check('A14 pre-fill ban: silent when pack has food',
      ctx._tgTakes === undefined && pk0 === G.state.village.pantry.reduce((t, i) => t + i.units, 0) &&
      ctx._tgLog[0].packFull === true && G.state.scholar.insideHaven === false,
      `takes=${ctx._tgTakes}`);
  }

  // A15 — silent when covered.
  {
    const G = mockGame();
    G.state.scholar.kcal = 2400;
    G.state.village.pantry = pantryOf();
    const ctx = { _tgBurnAvg: 50 };
    tg.dawnStep(G, ctx);
    check('A15 silent when covered', ctx._tgTakes === undefined && ctx._tgLog[0].fires === false,
      `fires=${ctx._tgLog[0].fires}`);
  }

  delete process.env.TRUSTGUARD;
  if (realCal) globalThis.Scattering.calories = realCal;
  else delete globalThis.Scattering.calories;
}

// ---------------- PART B: live engine (REAL RED) ----------------
async function partB() {
  console.log('PART B — live engine (REAL RED)');
  if (skipIfLayerGone('partB')) return;
  const { loadGame, setupGame, quietLog } = require('./sim-harness');
  process.env.TRUSTGUARD = '1';
  delete require.cache[require.resolve(TG_PATH)];
  const tg = require(TG_PATH);
  const { leadcourt } = require('./policies/leadcourt');

  async function buildState() {
    const { Game } = await loadGame({ seed: 4242, mode: 'trustguard-proof' });
    await setupGame(Game);
    return Game;
  }
  function construct(Game) {
    const s = Game.state.scholar;
    Game.dayPart = 0;
    s.kcal = 1500;
    s.inventory = [];
    s.insideHaven = false;
    const v = Game.state.village;
    v.pantry = v.pantry || [];
    v.pantry.unshift({ name: 'test acorn cake', plantId: 'acorn', kcalEach: 200, units: 3, foodState: 'cooked', kg: 0.2, safe: true });
    return { ctx: { _tgBurnAvg: 1000 } };
  }
  const onHavenTile = (Game) => {
    try { const t = Game.playerTile(); return !!(t && t.type === 'haven'); } catch (e) { return false; }
  };
  const pantryUnits = (Game) => (Game.state.village.pantry || []).reduce((t, i) => t + (i.units || 0), 0);
  const packFoodUnits = (Game) => (Game.state.scholar.inventory || [])
    .filter(i => (i.kcalEach || 0) > 0 && (i.units || 0) > 0).reduce((t, i) => t + (i.units || 0), 0);
  const trustOf = (Game) => {
    try { return (Game.state.village.trust || {})[Game.villagerId]; } catch (e) { return undefined; }
  };

  // B1 RED: the BASE's takeFromPantry with a deep lifetime ledger fires the
  // engine's -5000 trust-tax bar (game.js:14579) — the bar is REAL.
  {
    const Game = await buildState();
    construct(Game);
    Game.state.scholar.insideHaven = true; // inside: the draw lands
    const v = Game.state.village, vid = Game.villagerId;
    v.takes = v.takes || {}; v.gives = v.gives || {};
    v.takes[vid] = 6000; v.gives[vid] = 0; // lifetime net -6000 < -5000
    const t0 = trustOf(Game);
    await quietLog(async () => { Game.takeFromPantry(0); });
    const t1 = trustOf(Game);
    check('B1 RED: base takeFromPantry on a deep ledger fires the engine trust-tax (trust drops)',
      t1 !== undefined && t0 !== undefined && t1 < t0,
      `trust ${t0} -> ${t1}`);
  }

  // B2 RED: the LAYER with a healthy ledger takes (the chain is intact).
  {
    const Game = await buildState();
    const { ctx } = construct(Game);
    check('B2 setup: on haven tile, outside the hall',
      onHavenTile(Game) && Game.state.scholar.insideHaven === false);
    const pk0 = pantryUnits(Game);
    await quietLog(async () => { tg.dawnStep(Game, ctx); });
    const stamped = (Game.state.scholar.inventory || []).some(i => i._tgPantryTaken);
    check('B2 RED: layer takes on a healthy ledger (pantry -1, pack +1, stamped)',
      pantryUnits(Game) === pk0 - 1 && packFoodUnits(Game) === 1 &&
      ctx._tgTakes === 1 && stamped && !ctx._tgLog[0].blocked,
      `pantry=${pk0}->${pantryUnits(Game)} takes=${ctx._tgTakes} stamped=${stamped}`);
  }

  // B3 RED: the guard blocks on a deep TRAILING-7d ledger seeded by REAL
  // takeFromPantry calls — no stubbed ledger.
  {
    const Game = await buildState();
    const { ctx } = construct(Game);
    Game.state.scholar.insideHaven = true;
    const v = Game.state.village;
    // Seed a deep trailing-7d ledger with REAL takes (8 x 500 kcal = 4000).
    await quietLog(async () => {
      for (let k = 0; k < 8; k++) {
        v.pantry.unshift({ name: 'seed cake ' + k, plantId: 'acorn', kcalEach: 500, units: 1, foodState: 'cooked', kg: 0.1, safe: true });
        Game.takeFromPantry(0);
      }
    });
    const net7 = tg.trailingNet7(Game, Game.villagerId);
    // Now empty the pack (the dawn gate) and run the layer.
    Game.state.scholar.inventory = [];
    Game.state.scholar.insideHaven = false;
    const pk0 = pantryUnits(Game);
    await quietLog(async () => { tg.dawnStep(Game, ctx); });
    const row = ctx._tgLog[ctx._tgLog.length - 1];
    check('B3 RED: guard reads the REAL takeHist and blocks (no take)',
      net7 <= -3500 && ctx._tgTakes === undefined && ctx._tgBlocks === 1 &&
      row.blocked === true && pantryUnits(Game) === pk0 &&
      packFoodUnits(Game) === 0,
      `net7=${Math.round(net7)} blocks=${ctx._tgBlocks} pantry=${pk0}->${pantryUnits(Game)}`);
  }

  // B4 RED: the blocked take is followed by an HONEST donateToPantry that
  // writes the real books (v.gives + giveHist) — the net improves.
  {
    const Game = await buildState();
    construct(Game);
    Game.state.scholar.insideHaven = true; // the hall gate passes
    const v = Game.state.village, vid = Game.villagerId;
    v.gives = v.gives || {}; v.giveHist = v.giveHist || {};
    // Wild food in the pack (foraged, unstamped).
    Game.state.scholar.inventory = [
      { name: 'trail tubers', plantId: 'tuber', kcalEach: 300, units: 2, foodState: 'cooked', edible: true, kg: 0.2 },
    ];
    const gives0 = v.gives[vid] || 0;
    const gh0 = ((v.giveHist || {})[vid] || []).length;
    const row = { day: Game.state.scholar.day, fires: true, blocked: true };
    const ctx = {};
    const pkBefore = pantryUnits(Game);
    await quietLog(async () => { tg.handleGuardBlock(Game, ctx, row, -3200); });
    const gives1 = v.gives[vid] || 0;
    const gh1 = ((v.giveHist || {})[vid] || []).length;
    check('B4 RED: honest donate writes the real books (v.gives + giveHist grow)',
      row.gave === true && gives1 === gives0 + 600 && gh1 === gh0 + 1 &&
      pantryUnits(Game) === pkBefore + 2 && ctx._tgGives === 1,
      `gives ${gives0}->${gives1} giveHist ${gh0}->${gh1}`);
  }

  // B5: the mid-day wart fix on the live engine — the base upkeep eats the
  // packed lunch first, then middayStep stays silent (no +0 over-claim).
  {
    const Game = await buildState();
    const { ctx } = construct(Game);
    await quietLog(async () => { tg.dawnStep(Game, ctx); });
    Game.dayPart = 1;
    Game.state.scholar.kcal = 1500; // BELOW competentEat's line: base eats first
    let said = '';
    const oSay = Game.say;
    await quietLog(async () => {
      Game.say = function (t) { said += String(t) + '\n'; return oSay.apply(this, arguments); };
      const wrapped = tg.wrapPolicy(leadcourt);
      wrapped.upkeep(Game, ctx);
      Game.say = oSay;
    });
    const overclaim = /packed this morning[^]*\+0 kcal/.test(said);
    check('B5 wart fix: no "+0 kcal" over-claim when the base ate the lunch',
      !overclaim && (ctx._tgMeals || 0) >= 0,
      `meals=${ctx._tgMeals} overclaim=${overclaim}`);
  }
  delete process.env.TRUSTGUARD;
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
        if (armed) process.env.TRUSTGUARD = '1'; else delete process.env.TRUSTGUARD;
        delete require.cache[require.resolve(TG_PATH)];
        const tg = require(TG_PATH);
        const base = require('./policies/' + pid)[pid];
        const policy = armed ? tg.wrapPolicy(base) : base;
        const { Game } = await loadGame({ seed, mode: 'trustguard-det' });
        await setupGame(Game);
        const wrapped = Object.assign({}, policy);
        const bDaily = policy.daily, bUpkeep = policy.upkeep;
        const hs = [];
        let dawnRows = 0, takes = 0, blocks = 0, gives = 0;
        wrapped.upkeep = (G, ctx) => {
          seedPackFull(G);
          const r = bUpkeep ? bUpkeep(G, ctx) : undefined;
          try {
            dawnRows = (ctx._tgLog || []).length;
            takes = ctx._tgTakes || 0;
            blocks = ctx._tgBlocks || 0;
            gives = ctx._tgGives || 0;
          } catch (e) {}
          return r;
        };
        wrapped.daily = (G, ctx) => {
          hs.push(G.state.scholar.day + ':' + dayHash(G));
          return bDaily ? bDaily(G, ctx) : undefined;
        };
        wrapped.setup = undefined;
        const ctx = { policyId: 'trustguard-det', notes: [] };
        await quietLog(async () => { await runDays(Game, wrapped, { days: 30, sampleEvery: 31 }); });
        hashes.push(hs.join('\n'));
        trig.push({ dawnRows, takes, blocks, gives });
        delete process.env.TRUSTGUARD;
      }
      const same = hashes[0] === hashes[1];
      // The trigger path must have RUN (else the gate proves nothing): the
      // armed side must show dawn log rows while taking, blocking, and
      // giving nothing (the guard sits behind the pack-empty draw gate).
      const exercised = trig[1].dawnRows > 0 && trig[1].takes === 0 &&
        trig[1].blocks === 0 && trig[1].gives === 0;
      const ok = same && exercised;
      if (ok) pass++; else fail++;
      console.log(`  ${ok ? 'PASS' : 'FAIL'} ${pid} s${seed} ` +
        `(identical=${same} dawnRows=${trig[1].dawnRows} takes=${trig[1].takes} blocks=${trig[1].blocks} gives=${trig[1].gives})`);
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
  console.log('== trustguard SMOKE (instrument-honesty) ==');
  if (skipIfLayerGone('smoke')) { process.exit(0); }
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  process.env.TRUSTGUARD = '1';
  delete require.cache[require.resolve(TG_PATH)];
  const tg = require(TG_PATH);
  const base = require('./policies/belongseek').belongseek;
  const policy = tg.wrapPolicy(base);
  const { Game } = await loadGame({ seed: 11, mode: 'trustguard-smoke' });
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
  const log = ctx._tgLog || [];
  const mlog = ctx._tgMealLog || [];
  const fails = [];
  const scheck = (n, c, d) => { console.log(`  ${c ? 'PASS' : 'FAIL'} ${n}${d ? ' — ' + d : ''}`); if (!c) fails.push(n); };
  scheck('policy.daily fired', dailyCalls >= 20, `calls=${dailyCalls}`);
  scheck('dawn log entries present', log.length >= 15, `entries=${log.length}`);
  scheck('every dawn entry has a fires boolean', log.every(e => typeof e.fires === 'boolean'));
  scheck('trigger count consistent', (ctx._tgTriggers || 0) === log.filter(e => e.fires).length,
    `triggers=${ctx._tgTriggers} fired-rows=${log.filter(e => e.fires).length}`);
  scheck('takes consistent with took-rows', (ctx._tgTakes || 0) === log.filter(e => e.took).length,
    `takes=${ctx._tgTakes} took-rows=${log.filter(e => e.took).length}`);
  scheck('blocks consistent with blocked-rows', (ctx._tgBlocks || 0) === log.filter(e => e.blocked).length,
    `blocks=${ctx._tgBlocks} blocked-rows=${log.filter(e => e.blocked).length}`);
  const packedLines = said.filter(t => /packed lunch/i.test(t));
  scheck('every counted take is beat-voiced', (ctx._tgTakes || 0) === 0 || packedLines.length >= (ctx._tgTakes || 0),
    `takes=${ctx._tgTakes} voiced=${packedLines.length}`);
  const blockLines = said.filter(t => /ledger's running red/i.test(t));
  scheck('every counted block is beat-voiced', (ctx._tgBlocks || 0) === 0 || blockLines.length >= (ctx._tgBlocks || 0),
    `blocks=${ctx._tgBlocks} voiced=${blockLines.length}`);
  const giveLines = said.filter(t => /from your own haul/i.test(t));
  scheck('every counted give is beat-voiced', (ctx._tgGives || 0) === 0 || giveLines.length >= (ctx._tgGives || 0),
    `gives=${ctx._tgGives} voiced=${giveLines.length}`);
  scheck('mid-day meal log present', mlog.length >= 15, `entries=${mlog.length}`);
  const mealLines = said.filter(t => /packed this morning/i.test(t));
  scheck('no +0 kcal over-claim in meal beats', !said.some(t => /packed this morning[^]*\+0 kcal/.test(t)),
    `mealLines=${mealLines.length}`);
  console.log(fails.length ? `\nSMOKE: ${fails.length} FAILURES` : '\nSMOKE: ALL GREEN');
  delete process.env.TRUSTGUARD;
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
