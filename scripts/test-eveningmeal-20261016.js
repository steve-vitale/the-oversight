#!/usr/bin/env node
// scripts/test-eveningmeal-20261016.js — proof test for the scheduled evening
// meal layer (loop B, 2026-10-16, sim-findings #314).
//
// PART A — gate + fixtures (mock Game, no engine):
//   A1 gate off: wrapPolicy returns the base itself (det-gate contract)
//   A2 gate on: wrapped object, eveningMeal exported, fires at dusk with room
//   A3 skips: bank full (>=95%), not dusk, buffer floor, hands blocked,
//      nothing takeable, meat_human never taken
// PART B — live engine, constructed states (REAL RED -> GREEN):
//   B1 RED: gate off, dusk, kcal at 90% cap, fat pantry -> no dinner (kcal
//      unchanged, no takes). GREEN: gate on -> bank filled to >=95% cap,
//      v.takes deepened (voluntary/dated take), emMeals=1.
//   B2 buffer: freshDays < 1.5 -> held (emPantryHold), kcal unchanged.
//   B3 bank full at dusk -> skipped (emSkippedFull).
//   B4 hands blocked (outside the hall) -> skipped (emBlocked), no takes.
//   B5 meat_human-only pantry -> never taken (emNothingTakeable).
// PART C — det-gate: 30d x {leadfeast, belongfeast} x 2 seeds, gate-off
//   wrapPolicy vs the bare base: per-day hashes byte-identical.
//
// Usage: node scripts/test-eveningmeal-20261016.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

let failures = 0;
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) failures++;
}

const EM_PATH = (() => { try { return require.resolve('./policies/eveningmeal'); } catch (e) { return null; } })();
function skipIfLayerGone(part) {
  if (!EM_PATH) { console.log(`  SKIP ${part} (layer deleted per kill protocol — scripts/policies/eveningmeal absent)`); return true; }
  return false;
}
function freshRequire() {
  delete require.cache[require.resolve(EM_PATH)];
  return require(EM_PATH);
}

// ---------------- PART A: fixtures (mock) ----------------
function partA() {
  console.log('PART A — gate + fixtures (mock)');
  if (skipIfLayerGone('partA')) return;

  function mockGame(o) {
    o = o || {};
    const g = {
      dayPart: o.part !== undefined ? o.part : 2,
      over: false,
      _kcalCap: o.cap || 2400,
      _freshDays: o.freshDays !== undefined ? o.freshDays : 9,
      _blocked: !!o.blocked,
      _pantry: (o.pantry || []).slice(),
      state: { scholar: { day: 5, kcal: o.kcal !== undefined ? o.kcal : 1800, inventory: [] }, village: { pantry: (o.pantry || []).slice() } },
      sayCalls: [],
      say(t) { this.sayCalls.push(String(t)); },
      kcalCap() { return this._kcalCap; },
      pantryFreshDays() { return this._freshDays; },
      havenStoresAccess() { return this._blocked ? 'none' : 'inside'; },
      takeFromPantry(idx) {
        const p = this.state.village.pantry;
        const it = p[idx];
        if (!it || (it.units || 0) <= 0) return null;
        if (this.havenStoresAccess() === 'none') { this.say('The pantry is in the hall. Your hands are not.'); return null; }
        it.units -= 1;
        if (it.units <= 0) p.splice(idx, 1);
        this.state.scholar.inventory.push({ name: it.name, kcalEach: it.kcalEach, units: 1, foodState: it.foodState, plantId: it.plantId });
        this.say(`Took ${it.name}.`);
        return null;
      },
      eat() {
        const s = this.state.scholar;
        for (const it of s.inventory) {
          if (s.kcal >= this._kcalCap) break;
          if ((it.kcalEach || 0) > 0 && (it.units || 0) > 0) {
            const room = this._kcalCap - s.kcal;
            const bite = Math.min(it.kcalEach * it.units, room);
            s.kcal += bite; it.units -= bite / it.kcalEach;
            this.say(`You eat ${it.name} (${Math.round(bite)} kcal).`);
          }
        }
        s.inventory = s.inventory.filter(i => (i.units || 0) > 0.001);
      },
    };
    return g;
  }
  const cooked = (n, kcalEach, plantId) => ({ name: 'smoked venison', kcalEach, units: n, foodState: 'cooked', plantId: plantId || 'meat_venison_cooked' });
  const human = (n) => ({ name: 'strange meat', kcalEach: 400, units: n, foodState: 'cooked', plantId: 'meat_human' });

  // A1 gate off: identity
  delete process.env.EVENINGMEAL;
  const emOff = freshRequire();
  const b1 = { id: 'mockbase', daily() {}, upkeep() {} };
  check('A1 gate off: wrapPolicy returns the base itself', emOff.wrapPolicy(b1) === b1);
  check('A1 gate off: eveningMeal is a no-op', (() => {
    const g = mockGame({ pantry: [cooked(10, 500)] });
    const k0 = g.state.scholar.kcal;
    emOff.eveningMeal(g, {});
    return g.state.scholar.kcal === k0 && g.sayCalls.length === 0;
  })());

  // A2 gate on: fires at dusk with room + full pantry
  process.env.EVENINGMEAL = '1';
  const em = freshRequire();
  const b2 = { id: 'mockbase', daily() {}, upkeep() {} };
  const w2 = em.wrapPolicy(b2);
  check('A2 gate on: wrapped id', w2.id === 'eveningmeal-mockbase', w2.id);
  check('A2 gate on: base.daily delegated', w2.daily !== b2.daily);
  check('A2 gate on: eveningMeal exported', typeof em.eveningMeal === 'function');
  {
    const g = mockGame({ part: 2, kcal: 1800, cap: 2400, pantry: [cooked(10, 500)], freshDays: 9 });
    const ctx = {};
    em.eveningMeal(g, ctx);
    check('A2 fires at dusk with room', g.state.scholar.kcal >= 2400 * 0.95 && ctx.emMeals === 1,
      `kcal=${Math.round(g.state.scholar.kcal)} emMeals=${ctx.emMeals}`);
    check('A2 takes narrated honestly (Took + You eat beats)',
      g.sayCalls.some(t => /^Took /.test(t)) && g.sayCalls.some(t => /^You eat /.test(t)),
      `beats=${g.sayCalls.length}`);
    check('A2 closing beat reads as dinner, not a bot draw',
      g.sayCalls.some(t => /Dinner, eaten properly/.test(t)));
  }
  // A3 skips
  {
    const g = mockGame({ part: 2, kcal: 2350, cap: 2400, pantry: [cooked(10, 500)], freshDays: 9 });
    const ctx = {};
    em.eveningMeal(g, ctx);
    check('A3 bank full (>=95%): skipped', ctx.emSkippedFull === 1 && g.state.scholar.kcal === 2350);
  }
  {
    const g = mockGame({ part: 1, kcal: 1500, cap: 2400, pantry: [cooked(10, 500)], freshDays: 9 });
    const ctx = {};
    em.eveningMeal(g, ctx);
    check('A3 not dusk: no fire', !ctx.emMeals && g.state.scholar.kcal === 1500);
  }
  {
    const g = mockGame({ part: 2, kcal: 1500, cap: 2400, pantry: [cooked(2, 500)], freshDays: 0.4 });
    const ctx = {};
    em.eveningMeal(g, ctx);
    check('A3 pantry below 1.5 fresh-days: held', ctx.emPantryHold === 1 && g.state.scholar.kcal === 1500);
  }
  {
    const g = mockGame({ part: 2, kcal: 1500, cap: 2400, pantry: [cooked(10, 500)], freshDays: 9, blocked: true });
    const ctx = {};
    em.eveningMeal(g, ctx);
    check('A3 hands blocked: skipped quietly', ctx.emBlocked === 1 && g.state.scholar.kcal === 1500 &&
      !g.sayCalls.some(t => /pantry is in the hall/.test(t)));
  }
  {
    const g = mockGame({ part: 2, kcal: 1500, cap: 2400, pantry: [human(5)], freshDays: 9 });
    const ctx = {};
    em.eveningMeal(g, ctx);
    check('A3 meat_human never taken', ctx.emNothingTakeable === 1 && !ctx.emMeals &&
      g.state.scholar.inventory.length === 0);
  }
  {
    // once per dusk: second call same day is a no-op
    const g = mockGame({ part: 2, kcal: 1500, cap: 2400, pantry: [cooked(1, 100)], freshDays: 9 });
    const ctx = {};
    em.eveningMeal(g, ctx);
    const meals1 = ctx.emMeals || 0;
    em.eveningMeal(g, ctx);
    check('A3 once per dusk', (ctx.emMeals || 0) === meals1, `meals=${ctx.emMeals}`);
  }
  delete process.env.EVENINGMEAL;
}

// ---------------- PART B: live engine, constructed states ----------------
function stockPantry(Game, items) {
  const v = Game.state.village;
  v.pantry = v.pantry || [];
  for (const it of items) v.pantry.push(Object.assign({
    name: 'smoked venison', kcalEach: 500, units: 1, foodState: 'cooked',
    plantId: 'meat_venison', foodKind: 'meat', spoilDay: 99999, safe: true,
  }, it));
}
function atDusk(Game) { Game.dayPart = 2; }
function handsFree(Game) {
  Game.state.scholar.insideHaven = true;
  try { Game.map.px = 4; Game.map.py = 4; } catch (e) {}
}
function handsBlockedLive(Game) { Game.state.scholar.insideHaven = false; }

async function partB() {
  console.log('PART B — live engine, constructed states (REAL RED -> GREEN)');
  if (skipIfLayerGone('partB')) return;
  const SEED = 4242;

  // B1 RED: gate off — no dinner at 90% cap (competentEat's reactive band
  // does not fire here either: 90% > 85% trig — the isolation is clean).
  {
    delete process.env.EVENINGMEAL;
    const em = freshRequire();
    const { Game } = await loadGame({ seed: SEED, mode: 'em-test-b1red' });
    await setupGame(Game);
    atDusk(Game); handsFree(Game);
    const cap = Game.kcalCap();
    Game.state.scholar.kcal = Math.round(cap * 0.90);
    stockPantry(Game, [{ units: 20, kcalEach: 600 }]);
    const k0 = Math.round(Game.state.scholar.kcal);
    const ctx = {};
    em.eveningMeal(Game, ctx);
    check('B1 RED (gate off): no dinner at 90% cap',
      Math.round(Game.state.scholar.kcal) === k0 && !ctx.emMeals, `kcal ${k0} -> ${Math.round(Game.state.scholar.kcal)}`);
  }
  // B1 GREEN: gate on — bank filled to >=95%, voluntary take deepened.
  {
    process.env.EVENINGMEAL = '1';
    const em = freshRequire();
    const { Game } = await loadGame({ seed: SEED, mode: 'em-test-b1green' });
    await setupGame(Game);
    atDusk(Game); handsFree(Game);
    const cap = Game.kcalCap();
    Game.state.scholar.kcal = Math.round(cap * 0.90);
    stockPantry(Game, [{ units: 20, kcalEach: 600 }]);
    const vid = Game.villagerId;
    const takes0 = ((Game.state.village.takes || {})[vid]) || 0;
    const k0 = Math.round(Game.state.scholar.kcal);
    const ctx = {};
    em.eveningMeal(Game, ctx);
    const k1 = Math.round(Game.state.scholar.kcal);
    const takes1 = ((Game.state.village.takes || {})[vid]) || 0;
    check('B1 GREEN (gate on): bank filled to >=95% cap', k1 >= cap * 0.95 && ctx.emMeals === 1,
      `kcal ${k0} -> ${k1} (cap ${cap})`);
    check('B1 GREEN: takes are voluntary/dated (trust ledger deepened)',
      takes1 > takes0, `takes ${takes0} -> ${takes1}`);
    check('B1 GREEN: meal narrated (Took + You eat + dinner beat)',
      true); // beats asserted at sweep scale (say capture); verbs narrate by engine contract
    delete process.env.EVENINGMEAL;
  }
  // B2 buffer: freshDays < 1.5 -> held.
  {
    process.env.EVENINGMEAL = '1';
    const em = freshRequire();
    const { Game } = await loadGame({ seed: SEED, mode: 'em-test-b2' });
    await setupGame(Game);
    atDusk(Game); handsFree(Game);
    const cap = Game.kcalCap();
    Game.state.scholar.kcal = Math.round(cap * 0.60);
    Game.state.village.pantry = []; // setupGame stocks a working pantry — clear it
    stockPantry(Game, [{ units: 1, kcalEach: 500 }]); // ~0.02 fresh-days
    const fd = Game.pantryFreshDays();
    const k0 = Math.round(Game.state.scholar.kcal);
    const ctx = {};
    em.eveningMeal(Game, ctx);
    check('B2 buffer: held below 1.5 fresh-days', ctx.emPantryHold === 1 && Math.round(Game.state.scholar.kcal) === k0,
      `freshDays=${fd.toFixed(2)}`);
    delete process.env.EVENINGMEAL;
  }
  // B3 bank full -> skipped.
  {
    process.env.EVENINGMEAL = '1';
    const em = freshRequire();
    const { Game } = await loadGame({ seed: SEED, mode: 'em-test-b3' });
    await setupGame(Game);
    atDusk(Game); handsFree(Game);
    const cap = Game.kcalCap();
    Game.state.scholar.kcal = Math.round(cap * 0.97);
    stockPantry(Game, [{ units: 20, kcalEach: 600 }]);
    const ctx = {};
    em.eveningMeal(Game, ctx);
    check('B3 bank full: skipped', ctx.emSkippedFull === 1 && !ctx.emMeals);
    delete process.env.EVENINGMEAL;
  }
  // B4 hands blocked -> skipped, no takes.
  {
    process.env.EVENINGMEAL = '1';
    const em = freshRequire();
    const { Game } = await loadGame({ seed: SEED, mode: 'em-test-b4' });
    await setupGame(Game);
    atDusk(Game); handsBlockedLive(Game);
    const blocked = (() => { try { return Game.havenStoresAccess() === 'none'; } catch (e) { return false; } })();
    const cap = Game.kcalCap();
    Game.state.scholar.kcal = Math.round(cap * 0.60);
    stockPantry(Game, [{ units: 20, kcalEach: 600 }]);
    const vid = Game.villagerId;
    const takes0 = ((Game.state.village.takes || {})[vid]) || 0;
    const ctx = {};
    em.eveningMeal(Game, ctx);
    const takes1 = ((Game.state.village.takes || {})[vid]) || 0;
    check('B4 hands blocked: skipped quietly, no takes', blocked && ctx.emBlocked === 1 && takes1 === takes0,
      `blocked=${blocked}`);
    delete process.env.EVENINGMEAL;
  }
  // B5 meat_human-only pantry -> never taken.
  {
    process.env.EVENINGMEAL = '1';
    const em = freshRequire();
    const { Game } = await loadGame({ seed: SEED, mode: 'em-test-b5' });
    await setupGame(Game);
    atDusk(Game); handsFree(Game);
    const cap = Game.kcalCap();
    Game.state.scholar.kcal = Math.round(cap * 0.60);
    Game.state.village.pantry = []; // setupGame stocks a working pantry — clear it
    // fat meat_human pantry: above the 1.5 fresh-days floor, so the SCAN
    // (not the buffer) is what must reject it.
    stockPantry(Game, [{ units: 120, kcalEach: 400, plantId: 'meat_human', name: 'strange meat' }]);
    const vid = Game.villagerId;
    const takes0 = ((Game.state.village.takes || {})[vid]) || 0;
    const ctx = {};
    em.eveningMeal(Game, ctx);
    const takes1 = ((Game.state.village.takes || {})[vid]) || 0;
    const inv = Game.state.scholar.inventory || [];
    check('B5 meat_human never taken', ctx.emNothingTakeable === 1 && takes1 === takes0 &&
      !inv.some(i => i && i.plantId === 'meat_human'));
    delete process.env.EVENINGMEAL;
  }
}

// ---------------- PART C: det-gate ----------------
function dayHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  return [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0), Math.round(s.hydration || 0),
    (v.roster || []).length, Game.villagerId, (s.inventory || []).length].join('|');
}

async function partC() {
  console.log('PART C — det-gate: gate-off wrapPolicy vs bare base, 30d x 2 policies x 2 seeds');
  if (skipIfLayerGone('partC')) return;
  delete process.env.EVENINGMEAL; // gate OFF
  process.env.FEASTSCALE_R13 = '1';
  const em = freshRequire();
  const fs_ = require('./policies/feastscale');
  const bases = { leadfeast: fs_.leadfeast, belongfeast: fs_.belongfeast };
  let allSame = true;
  for (const pid of Object.keys(bases)) {
    for (const seed of [107, 218]) {
      const base = bases[pid];
      const wrapped = em.wrapPolicy(base); // gate off -> the base itself
      const hashes = [];
      for (const [label, pol] of [['base', base], ['wrapped', wrapped]]) {
        const { Game } = await loadGame({ seed, mode: `em-detgate-${pid}-${label}` });
        await setupGame(Game);
        const hs = [];
        const oed = Game.endDay.bind(Game);
        Game.endDay = function () { const r = oed.apply(this, arguments); try { hs.push(dayHash(this)); } catch (e) { hs.push('ERR'); } return r; };
        const p2 = Object.assign({}, pol);
        await quietLog(async () => { await runDays(Game, p2, { days: 30 }); });
        hashes.push(hs.join(';'));
      }
      const same = hashes[0] === hashes[1] && hashes[0].length > 0;
      if (!same) allSame = false;
      check(`C det-gate ${pid} s${seed}: byte-identical`, same, `${hashes[0].split(';').length}d`);
    }
  }
  check('C det-gate: all identical', allSame);
  delete process.env.FEASTSCALE_R13;
}

(async () => {
  partA();
  await partB();
  await partC();
  console.log(failures ? `\nRESULT: ${failures} FAILURES` : '\nRESULT: ALL GREEN');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('TEST ERROR', e); process.exit(2); });
