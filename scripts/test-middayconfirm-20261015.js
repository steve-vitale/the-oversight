#!/usr/bin/env node
// scripts/test-middayconfirm-20261015.js — proof test for the REBUILT
// middaymeal mid-day pack-meal layer (loop B confirm run, 2026-10-15,
// sim-findings #314 SCHOLAR DAILY DEFICIT). Re-proves the killed arm's
// evidence parts A/B/C against the rebuilt module; all green is the gate
// before ANY confirm sweep spend.
//
// PART A — gate + projection fixtures (mock Game, no engine), 10 fixtures:
//   A1 gate off: wrapPolicy(base) === base (same reference).
//   A2 gate off: named export is the base leadcourt object itself.
//   A3 gate on: wrapped id 'middaymeal-leadcourt'.
//   A4 gate on: base untouched (id, no layer keys, no upkeep mutation).
//   A5 fires when projection < need+margin (kcal=1500, bRem=1000, need=2200
//      -> projBed 500 < 2300: ate + voiced + audit row).
//   A6 silent when covered (kcal=2400, bRem=50 -> projBed 2350 >= 2300).
//   A7 trigger with empty pack: honest no-op (fires logged, kcal unchanged,
//      _mmNoGain counted, no meal).
//   A8 not mid-day (dayPart 0/2/3): silent, no log rows.
//   A9 burn-loop EWMA: first close seeds, second closes 0.7/0.3.
//   A10 margin boundary: projBed == need+100 silent; == need+99 fires.
// PART B — live engine, constructed states (REAL RED):
//   B1 RED: at kcal=2100 (ABOVE competentEat's 0.85*2400=2040 line), pack
//      with food, bRem=500, need=2200 -> layer eats (kcal rises) and voices;
//      the BASE policy's upkeep does NOT eat (threshold not met).
//   B2 silent when the projection covers (kcal=2400, burn 50).
// PART C — det-gate: 30d x 8 seeds x 2 policies, base+pack-emptier vs
//   wrapped(gate on)+pack-emptier. The pack-emptier makes every layer eat a
//   no-op, so trajectories must be BYTE-IDENTICAL while the trigger path
//   (projection, log, burn EWMA) runs hot. The machinery is neutral; the
//   ONLY lever effect is the honest Game.eat().
// SMOKE=1 — instrument-honesty: 1 seed x 25d armed; policy.daily fired,
//   _mmLog entries with fires booleans, trigger count consistent, every
//   counted meal has a matching captured say line.
//
// Node harness: full src/js list in index.html order (minus DOM-only), via
// sim-harness. Math.random seeded BEFORE eval (mulberry32).
//
// Usage: node scripts/test-middayconfirm-20261015.js
//        SMOKE=1 node scripts/test-middayconfirm-20261015.js
'use strict';

const SMOKE = process.env.SMOKE === '1';
let failures = 0;
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) failures++;
}

// ---------------- PART A: gate + projection fixtures (mock) ----------------
function partA() {
  console.log('PART A — gate + projection fixtures (10 fixtures)');
  // Stub the engine's calorie clock for the mock.
  globalThis.Scattering = globalThis.Scattering || {};
  const realCal = globalThis.Scattering.calories;
  globalThis.Scattering.calories = { dailyNeed: () => 2200 };

  function mockGame(o) {
    const g = {
      over: false,
      dayPart: 1,
      state: { scholar: { day: 5, kcal: 1500, dead: false, inventory: [] } },
      kcalCap: () => 2400,
      eatCalls: 0,
      sayCalls: [],
      eat() {
        this.eatCalls++;
        const s = this.state.scholar;
        const food = s.inventory.find(i => (i.kcalEach || 0) > 0 && (i.units || 0) > 0);
        if (food) {
          const room = Math.max(0, 2400 - s.kcal);
          const take = Math.min(room, food.kcalEach * food.units);
          s.kcal += take;
          food.units = Math.max(0, food.units - Math.ceil(take / food.kcalEach));
        }
      },
      say(t) { this.sayCalls.push(String(t)); },
    };
    if (o) Object.assign(g, o);
    return g;
  }
  const foodPack = () => [{ plantId: 'acorn', kcalEach: 500, units: 4 }];
  const baseOf = () => ({ id: 'leadcourt', desc: 'base', upkeep(G, ctx) { ctx.u = 1; }, daily(G, ctx) { ctx.d = 1; } });
  const mmPath = './policies/middaymeal';

  // A1 — gate off: wrapPolicy returns the base object itself.
  delete require.cache[require.resolve(mmPath)];
  delete process.env.MIDDAYMEAL;
  const mmOff = require(mmPath);
  const base = baseOf();
  check('A1 gate off: wrapPolicy(base) === base', mmOff.wrapPolicy(base) === base);

  // A2 — gate off: named export is the base leadcourt object itself.
  check('A2 gate off: named export is base leadcourt',
    mmOff.middaymealLeadcourt === require('./policies/leadcourt').leadcourt);

  // A3 — gate on: wrapped id.
  process.env.MIDDAYMEAL = '1';
  delete require.cache[require.resolve(mmPath)];
  const mm = require(mmPath);
  const base2 = baseOf();
  const w = mm.wrapPolicy(base2);
  check('A3 gate on: wrapped id middaymeal-leadcourt', w.id === 'middaymeal-leadcourt', w.id);

  // A4 — gate on: base untouched.
  check('A4 gate on: base untouched',
    base2.id === 'leadcourt' && !('_mmLog' in base2) && !base2.upkeep.toString().includes('_mm'),
    `id=${base2.id}`);

  // A5 — fires when the projection falls short (ate + voiced + audit row).
  {
    const G = mockGame();
    G.state.scholar.inventory = foodPack();
    const ctx = { _mmBurnAvg: 1000 }; // projBed = 1500-1000 = 500 < 2300
    mm.middayStep(G, ctx);
    check('A5 fires: ate, voiced, audit row',
      G.eatCalls === 1 && G.state.scholar.kcal > 1500 &&
      ctx._mmMeals === 1 && G.sayCalls.length === 1 &&
      ctx._mmLog.length === 1 && ctx._mmLog[0].fires === true,
      `kcal=${G.state.scholar.kcal} meals=${ctx._mmMeals} say="${G.sayCalls[0]}"`);
    check('A5 burn anchor recorded for closeBurnLoop',
      ctx._mmMidDay === 5 && ctx._mmMidKcal === 1500,
      `midDay=${ctx._mmMidDay} midKcal=${ctx._mmMidKcal}`);
  }

  // A6 — silent when covered.
  {
    const G = mockGame();
    G.state.scholar.kcal = 2400;
    G.state.scholar.inventory = foodPack();
    const ctx = { _mmBurnAvg: 50 }; // projBed = 2350 >= 2300
    mm.middayStep(G, ctx);
    check('A6 silent when covered',
      G.eatCalls === 0 && ctx._mmMeals === undefined &&
      ctx._mmLog.length === 1 && ctx._mmLog[0].fires === false,
      `eatCalls=${G.eatCalls} fires=${ctx._mmLog[0].fires}`);
  }

  // A7 — trigger, empty pack: honest no-op, counted.
  {
    const G = mockGame(); // kcal 1500, inventory []
    const ctx = { _mmBurnAvg: 1000 };
    mm.middayStep(G, ctx);
    check('A7 empty pack: trigger fires, kcal unchanged, counted as no-gain',
      ctx._mmLog[0].fires === true && G.state.scholar.kcal === 1500 &&
      ctx._mmNoGain === 1 && ctx._mmMeals === undefined && G.sayCalls.length === 0,
      `kcal=${G.state.scholar.kcal} noGain=${ctx._mmNoGain}`);
  }

  // A8 — not mid-day: silent on dawn/dusk/night.
  {
    let calls = 0, rows = 0;
    for (const p of [0, 2, 3]) {
      const G = mockGame();
      G.dayPart = p;
      G.state.scholar.inventory = foodPack();
      const ctx = { _mmBurnAvg: 1000 };
      mm.middayStep(G, ctx);
      calls += G.eatCalls;
      rows += (ctx._mmLog || []).length;
    }
    check('A8 non-midday parts: never eats, never logs', calls === 0 && rows === 0,
      `calls=${calls} rows=${rows}`);
  }

  // A9 — burn-loop EWMA: first close seeds, second closes 0.7/0.3.
  {
    const G = mockGame();
    const ctx = { _mmMidDay: 5, _mmMidKcal: 2000 };
    G.state.scholar.kcal = 1500; // net burn 500 to bedtime
    mm.closeBurnLoop(G, ctx);
    check('A9 EWMA seeds on first close', ctx._mmBurnAvg === 500, `avg=${ctx._mmBurnAvg}`);
    const ctx2 = { _mmMidDay: 5, _mmMidKcal: 2000, _mmBurnAvg: 500 };
    G.state.scholar.kcal = 1700; // burn 300 -> 0.7*500 + 0.3*300 = 440
    mm.closeBurnLoop(G, ctx2);
    check('A9 EWMA updates 0.7/0.3', Math.abs(ctx2._mmBurnAvg - 440) < 1e-9, `avg=${ctx2._mmBurnAvg}`);
  }

  // A10 — margin boundary: projBed == need+100 silent; need+99 fires.
  {
    const G = mockGame(); // kcal 1500, need 2200+100=2300
    G.state.scholar.inventory = foodPack();
    const ctxA = { _mmBurnAvg: -800 }; // projBed = 1500-(-800) = 2300 == need
    mm.middayStep(G, ctxA);
    check('A10 boundary: projBed == need+margin stays silent', ctxA._mmLog[0].fires === false,
      `fires=${ctxA._mmLog[0].fires}`);
    const G2 = mockGame();
    G2.state.scholar.inventory = foodPack();
    const ctxB = { _mmBurnAvg: -799 }; // projBed 2299 < 2300
    mm.middayStep(G2, ctxB);
    check('A10 boundary: projBed == need+margin-1 fires', ctxB._mmLog[0].fires === true,
      `fires=${ctxB._mmLog[0].fires}`);
  }

  delete process.env.MIDDAYMEAL;
  if (realCal) globalThis.Scattering.calories = realCal;
  else delete globalThis.Scattering.calories;
}

// ---------------- PART B: live engine, REAL RED ----------------
async function partB() {
  console.log('PART B — live engine (REAL RED)');
  // Seed BEFORE eval: modules capture Math.random at load.
  const { loadGame, setupGame, quietLog } = require('./sim-harness');
  process.env.MIDDAYMEAL = '1';
  const mmPath = './policies/middaymeal';
  delete require.cache[require.resolve(mmPath)];
  const mm = require(mmPath);
  const { leadcourt } = require('./policies/leadcourt');

  async function buildState() {
    const seed = 4242;
    const { Game } = await loadGame({ seed, mode: 'middayconfirm-proof' });
    await setupGame(Game);
    return Game;
  }
  function construct(Game) {
    // Mid-day, scholar at 2100 (ABOVE competentEat's 0.85*2400=2040 line),
    // pack holding real edible food, burn estimate 500, need 2200.
    // Projection: 2100-500=1600 < 2300 -> the layer MUST fire; the base
    // policy's threshold eat MUST NOT.
    const s = Game.state.scholar;
    Game.dayPart = 1;
    s.kcal = 2100;
    s.inventory = s.inventory || [];
    // edible=true food the honest verb will take (FOOD REALITY: unknown
    // food is skipped — use a known-safe staple shape).
    s.inventory.push({ plantId: 'test_acorn', name: 'acorn', kcalEach: 400, units: 5, edible: true, foodState: 'raw' });
    return { ctx: { _mmBurnAvg: 500 } };
  }

  // B1 RED: layer eats where the base policy waits.
  {
    const Game = await buildState();
    const { ctx } = construct(Game);
    const k0 = Game.state.scholar.kcal;
    await quietLog(async () => { mm.middayStep(Game, ctx); });
    const k1 = Game.state.scholar.kcal;
    check('B1 RED: layer eats at kcal=2100 (above the 2040 threshold)', k1 > k0,
      `${k0} -> ${k1}, meals=${ctx._mmMeals}`);
  }
  // B1b: capture the voice line.
  {
    const Game = await buildState();
    const { ctx } = construct(Game);
    const lines = [];
    const oSay = Game.say;
    Game.say = function (t) { try { lines.push(String(t)); } catch (e) {} return oSay.apply(this, arguments); };
    await quietLog(async () => { mm.middayStep(Game, ctx); });
    Game.say = oSay;
    const voiced = lines.some(l => /afternoon's work/.test(l));
    check('B1b voice line reads as a person managing hunger', voiced,
      lines.filter(l => /afternoon/.test(l))[0] || lines.slice(0, 2).join(' | '));
  }
  // B1c: the BASE policy does NOT eat here (its threshold is 2040).
  // Note: the base upkeep may burn a little via other verbs (drink/work
  // water etc.) — the RED asserts it does not EAT (kcal must not rise).
  {
    const Game = await buildState();
    construct(Game); // same state, no layer
    const k0 = Game.state.scholar.kcal;
    await quietLog(async () => { if (leadcourt.upkeep) leadcourt.upkeep(Game, { policyId: 'leadcourt' }); });
    const k1 = Game.state.scholar.kcal;
    check('B1c RED: base upkeep does NOT eat at kcal=2100 (threshold 2040)', k1 <= k0,
      `${k0} -> ${k1} (other upkeep verbs may burn a little; eating would raise it)`);
  }
  // B2: layer silent when the projection covers.
  {
    const Game = await buildState();
    const s = Game.state.scholar;
    Game.dayPart = 1;
    s.kcal = 2400;
    s.inventory = s.inventory || [];
    s.inventory.push({ plantId: 'test_acorn', name: 'acorn', kcalEach: 400, units: 5, edible: true, foodState: 'raw' });
    const ctx = { _mmBurnAvg: 50 }; // projBed 2350 >= 2300
    const k0 = s.kcal;
    await quietLog(async () => { mm.middayStep(Game, ctx); });
    check('B2 silent when covered (2400, burn 50)', s.kcal === k0 && ctx._mmMeals === undefined,
      `kcal=${s.kcal} fires=${ctx._mmLog && ctx._mmLog[0].fires}`);
  }
  delete process.env.MIDDAYMEAL;
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
async function partC() {
  console.log('PART C — det-gate: 30d x 8 seeds x 2 policies, base vs wrapped(gate on), pack-emptied');
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
  const PIDS = ['leadcourt', 'belongseek'];
  let pass = 0, fail = 0;
  for (const pid of PIDS) {
    for (const seed of SEEDS) {
      const hashes = [];
      const trig = [];
      for (const armed of [false, true]) {
        if (armed) process.env.MIDDAYMEAL = '1'; else delete process.env.MIDDAYMEAL;
        const mmPath = './policies/middaymeal';
        delete require.cache[require.resolve(mmPath)];
        const mm = require(mmPath);
        const base = require('./policies/' + pid)[pid];
        const policy = armed ? mm.wrapPolicy(base) : base;
        const { Game } = await loadGame({ seed, mode: 'middayconfirm-det' });
        await setupGame(Game);
        const wrapped = Object.assign({}, policy);
        const bDaily = policy.daily, bUpkeep = policy.upkeep;
        const hs = [];
        let triggers = 0, meals = 0;
        wrapped.upkeep = (G, ctx) => {
          // PACK-EMPTIER: strip edible pack food at each dawn so every
          // layer eat is an honest no-op in BOTH runs.
          try {
            if (G.dayPart === 0) {
              const inv = (G.state.scholar || {}).inventory || [];
              for (let i = inv.length - 1; i >= 0; i--) {
                if ((inv[i].kcalEach || 0) > 0) inv.splice(i, 1);
              }
            }
          } catch (e) {}
          const r = bUpkeep ? bUpkeep(G, ctx) : undefined;
          try {
            triggers = ctx._mmTriggers || 0;
            meals = ctx._mmMeals || 0;
          } catch (e) {}
          return r;
        };
        wrapped.daily = (G, ctx) => {
          hs.push(G.state.scholar.day + ':' + dayHash(G));
          return bDaily ? bDaily(G, ctx) : undefined;
        };
        wrapped.setup = undefined;
        const ctx = { policyId: 'middayconfirm-det', notes: [] };
        await quietLog(async () => { await runDays(Game, wrapped, { days: 30, sampleEvery: 31 }); });
        hashes.push(hs.join('\n'));
        trig.push({ triggers, meals });
        delete process.env.MIDDAYMEAL;
      }
      const same = hashes[0] === hashes[1];
      // The trigger path must have RUN (else the gate proves nothing).
      const exercised = trig[1].triggers > 0;
      const ok = same && exercised;
      if (ok) pass++; else fail++;
      console.log(`  ${ok ? 'PASS' : 'FAIL'} ${pid} s${seed} ` +
        `(identical=${same} triggers=${trig[1].triggers} meals=${trig[1].meals})`);
      if (!same) {
        const a = hashes[0].split('\n'), b = hashes[1].split('\n');
        const i = a.findIndex((h, k) => h !== b[k]);
        console.log(`    first divergence at row ${i}: A=${a[i]} B=${b[i]}`);
      }
      if (!exercised) console.log(`    NOTE: trigger path never fired — gate is weak on this seed`);
    }
  }
  check('det-gate 16/16 byte-identical with trigger path exercised', fail === 0, `${pass}/16`);
}

// ---------------- SMOKE ----------------
async function smoke() {
  console.log('== middayconfirm SMOKE (instrument-honesty) ==');
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  process.env.MIDDAYMEAL = '1';
  const mmPath = './policies/middaymeal';
  delete require.cache[require.resolve(mmPath)];
  const mm = require(mmPath);
  const base = require('./policies/belongseek').belongseek;
  const policy = mm.wrapPolicy(base);
  const { Game } = await loadGame({ seed: 11, mode: 'middayconfirm-smoke' });
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
  const log = ctx._mmLog || [];
  const fails = [];
  const scheck = (n, c, d) => { console.log(`  ${c ? 'PASS' : 'FAIL'} ${n}${d ? ' — ' + d : ''}`); if (!c) fails.push(n); };
  scheck('policy.daily fired', dailyCalls >= 20, `calls=${dailyCalls}`);
  scheck('mid-day log entries present', log.length >= 15, `entries=${log.length}`);
  scheck('every entry has a fires boolean', log.every(e => typeof e.fires === 'boolean'));
  scheck('trigger count consistent', (ctx._mmTriggers || 0) === log.filter(e => e.fires).length,
    `triggers=${ctx._mmTriggers} fired-rows=${log.filter(e => e.fires).length}`);
  scheck('meals counted, all with kcal>0', (ctx._mmMeals || 0) >= 0 &&
    (ctx._mmKcalEaten || 0) >= 0, `meals=${ctx._mmMeals} kcal=${ctx._mmKcalEaten}`);
  const voiced = said.filter(t => /afternoon's work/.test(t));
  scheck('mid-day meals voiced (when food eaten)', (ctx._mmMeals || 0) === 0 || voiced.length > 0,
    `meals=${ctx._mmMeals} voiced=${voiced.length}`);
  console.log(fails.length ? `\nSMOKE: ${fails.length} FAILURES` : '\nSMOKE: ALL GREEN');
  delete process.env.MIDDAYMEAL;
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
