#!/usr/bin/env node
// test-vinebank-20261014.js — sim-vinebank arm (lever loop B, 2026-10-14).
// ARM: materials-banking policy layer for the blind trapline (snaregate's
// named next), scripts/policies/vinebank.js, opt-in VINEBANK=1.
//
// The question (evidence/2026-10-14/sim-snaregate.md): the 2+2 blind band
// never fired because the pack never co-banked vine>=2 AND stick>=2 — vine
// drains to knives/armor (the policy's own keepKnife/armUp/gearUp crafts),
// stick drains to arrows. The layer banks: while the snare recipe is L1
// and the bank is not full, competing crafts defer; the forage trip biases
// to thickets (vine) / groves (stick); at 2+2 the blind band spends one
// honest attempt/day below the base 3+3 band.
//
// RED (VINEBANK unset — hooks present, layer off): no deferral anywhere
// (knife knaps, arrow knaps, bark armor knaps), 2+2 produces ZERO snare
// attempts (the base 3+3 gate holds). Default-off is byte-identical.
// GREEN (VINEBANK=1): the bank forms (deferrals hold), the blind band fires
// exactly once/day at 2+2 through the honest Game.craft path (1+1 consumed
// win or lose), L2+ untouched, L0 untouched, 3+3 still exactly 1 attempt
// (base band; the layer skips it — no double attempt).
//
// Usage: node scripts/test-vinebank-20261014.js            (RED assertions)
//        VINEBANK=1 node scripts/test-vinebank-20261014.js  (GREEN assertions)
//        SEED env override.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const { vinebank } = require('./policies/vinebank');
// Named-export unwrap (finding #69): never Object.assign({}, require(...)).
const { keepKnife, armUp, gearUp, workTrapline } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '20261014', 10);
const ARMED = process.env.VINEBANK === '1';
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`ok   ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
function mats(Game, m) {
  return ((Game.state.scholar || {}).inventory || [])
    .filter(i => i && i.material === m).reduce((t, i) => t + (i.units || 0), 0);
}
const VINE = { material: 'vine', units: 0, name: 'Vine', kcalEach: 0, spoilDay: 9999, kg: 0.1 };
const STICK = { material: 'stick', units: 0, name: 'Stick', kcalEach: 0, spoilDay: 9999, kg: 0.2 };
const STONE = { material: 'stone', units: 0, name: 'Stone', kcalEach: 0, spoilDay: 9999, kg: 0.3 };
const FIBER = { material: 'fiber', units: 0, name: 'Fiber', kcalEach: 0, spoilDay: 9999, kg: 0.05 };
const BARK = { material: 'bark', units: 0, name: 'Bark', kcalEach: 0, spoilDay: 9999, kg: 0.2 };
function mat(t, units) { const m = Object.assign({}, t); m.units = units; return m; }

// Fresh game + deterministic test rig: snare recipe level, materials, and
// no cutting tool (strip starting blades so knifeNeeded() is driven by the
// test's own carcass trigger, not by gen luck).
async function fresh(seed, { snare = 1, inv = [] } = {}) {
  const { Game } = await loadGame({ seed, mode: 'vinebank-proof' });
  await setupGame(Game);
  Game.state.codex = Game.state.codex || {};
  Game.state.codex.recipes = Game.state.codex.recipes || {};
  if (snare >= 1) Game.state.codex.recipes.snare = { level: snare };
  else delete Game.state.codex.recipes.snare;
  const s = Game.state.scholar;
  const bladeRe = /knife|machete|sharpened|blade/i;
  s.inventory = (s.inventory || []).filter(i =>
    !bladeRe.test(String((i && i.name) || '') + ' ' + String((i && i.itemId) || '') + ' ' + String((i && i.recipeId) || '')));
  s.tools = (s.tools || []).filter(t =>
    !bladeRe.test(String((t && t.name) || '') + ' ' + String((t && t.itemId) || '') + ' ' + String((t && t.recipeId) || '')));
  for (const m of inv) s.inventory.push(m);
  Game.state.scholar.day = 5;
  return Game;
}
function carcass() {
  return { itemId: 'rabbit_carcass_test', name: 'Rabbit carcass', foodState: 'carcass', kcalEach: 0, units: 1, kg: 0.8 };
}
function wrapCraft(Game) {
  let attempts = 0, successes = 0;
  const _craft = Game.craft.bind(Game);
  Game.craft = function (id) {
    if (id === 'snare') attempts++;
    const r = _craft.apply(this, arguments);
    if (id === 'snare' && r) successes++;
    return r;
  };
  return () => ({ attempts, successes });
}

(async () => {
  console.log(`VINEBANK=${ARMED ? '1 (armed)' : 'off (baseline)'} seed=${SEED}`);

  // ---------- module shape ----------
  ok('vinebank named export unwraps', !!vinebank && typeof vinebank.blindBand === 'function'
    && typeof vinebank.defersCraft === 'function' && typeof vinebank.tripBoost === 'function');

  // ---------- R1/G1: the knife deferral ----------
  {
    const Game = await fresh(SEED, { snare: 1, inv: [mat(STONE, 1), mat(VINE, 1), carcass()] });
    ok('precondition: no cutting tool on the rig', !Game.hasCuttingTool());
    const ctx = {};
    keepKnife(Game, ctx);
    const knapped = (ctx.knivesKnapped || 0) + (ctx.knapFailed || 0);
    if (!ARMED) {
      ok('R1 gate off: knife knaps (vine 1 -> 0, no deferral)', knapped === 1 && mats(Game, 'vine') === 0,
        `knapped=${knapped} vine=${mats(Game, 'vine')}`);
    } else {
      ok('G1 gate on: knife DEFERS while banking (vine stays 1)', knapped === 0 && mats(Game, 'vine') === 1,
        `knapped=${knapped} vine=${mats(Game, 'vine')}`);
      ok('G1 deferral counted', (ctx.vinebankDeferKnife || 0) === 1, `deferKnife=${ctx.vinebankDeferKnife || 0}`);
    }
  }

  // ---------- R2/G2: the blind band at 2+2 ----------
  {
    const Game = await fresh(SEED, { snare: 1, inv: [mat(VINE, 2), mat(STICK, 2)] });
    const ctx = {};
    const count = wrapCraft(Game);
    vinebank.blindBand(Game, ctx); // daily() order: layer reads pre-base inventory
    workTrapline(Game, ctx);      // base 3+3 gate: must not fire at 2+2
    const { attempts, successes } = count();
    if (!ARMED) {
      ok('R2 gate off: 2+2 produces ZERO attempts (base gate holds)', attempts === 0, `attempts=${attempts}`);
      ok('R2 materials untouched', mats(Game, 'vine') === 2 && mats(Game, 'stick') === 2);
    } else {
      ok('G2 gate on: 2+2 produces exactly 1 attempt', attempts === 1, `attempts=${attempts}`);
      ok('G2 materials at risk through the honest path (1+1 consumed)',
        mats(Game, 'vine') + mats(Game, 'stick') === 2, `vine=${mats(Game, 'vine')} stick=${mats(Game, 'stick')}`);
      ok('G2 at most one snare results', successes <= 1, `successes=${successes}`);
      // same-day double call: still 1
      vinebank.blindBand(Game, ctx); workTrapline(Game, ctx);
      ok('G2 same-day double call: still 1 attempt', count().attempts === 1, `attempts=${count().attempts}`);
      ok('G2 attempt counted', (ctx.vinebankBlindAttempts || 0) === 1, `blindAttempts=${ctx.vinebankBlindAttempts || 0}`);
    }
  }

  // ---------- R3/G3: the arrow deferral (stick bank) ----------
  {
    const mk = async (stick, vineU) => {
      const Game = await fresh(SEED + 7, { snare: 1, inv: [{ itemId: 'bow', name: 'Bow', units: 1, kg: 0.5 }, mat(STONE, 1), mat(FIBER, 1), mat(STICK, stick), mat(VINE, vineU)] });
      Game.state.codex.recipes.arrow = { level: 3 };
      return Game;
    };
    const wrapId = (Game, id) => {
      let n = 0;
      const _c = Game.craft.bind(Game);
      Game.craft = function (rid) { if (rid === id) n++; return _c.apply(this, arguments); };
      return () => n;
    };
    if (!ARMED) {
      const Game = await mk(3, 5);
      const ctx = {};
      const arrowTries = wrapId(Game, 'arrow');
      gearUp(Game, ctx);
      ok('R3 gate off: arrow craft attempted (stick 3 -> 1, no deferral)', mats(Game, 'stick') === 1 && arrowTries() === 1,
        `stick=${mats(Game, 'stick')} arrowTries=${arrowTries()}`);
    } else {
      const Game = await mk(1, 5); // stick-binding: banking
      const ctx = {};
      const arrowTries = wrapId(Game, 'arrow');
      gearUp(Game, ctx);
      ok('G3 gate on: arrow DEFERS while stick-binding (stick stays 1, no craft call)',
        mats(Game, 'stick') === 1 && arrowTries() === 0,
        `stick=${mats(Game, 'stick')} arrowTries=${arrowTries()}`);
      ok('G3 deferral counted', (ctx.vinebankDeferArrow || 0) === 1, `deferArrow=${ctx.vinebankDeferArrow || 0}`);
      const Game2 = await mk(3, 5); // bank full: release
      const ctx2 = {};
      const arrowTries2 = wrapId(Game2, 'arrow');
      gearUp(Game2, ctx2);
      ok('G3 bank full: arrow craft attempted again (stick 3 -> 1)', mats(Game2, 'stick') === 1 && arrowTries2() === 1,
        `stick=${mats(Game2, 'stick')} arrowTries=${arrowTries2()}`);
    }
  }

  // ---------- R4/G4: the bark-armor deferral (vine bank) ----------
  {
    const mk = async (stickU) => {
      const Game = await fresh(SEED + 13, { snare: 1, inv: [mat(BARK, 3), mat(VINE, 2), mat(STICK, stickU)] });
      Game.state.codex.recipes.bark_armor = { level: 1 };
      return Game;
    };
    const wrapId = (Game, id) => {
      let n = 0;
      const _c = Game.craft.bind(Game);
      Game.craft = function (rid) { if (rid === id) n++; return _c.apply(this, arguments); };
      return () => n;
    };
    if (!ARMED) {
      const Game = await mk(0);
      const ctx = {};
      const armorTries = wrapId(Game, 'bark_armor');
      gearUp(Game, ctx);
      ok('R4 gate off: bark armor craft attempted (vine 2 -> 0)', mats(Game, 'vine') === 0 && armorTries() === 1,
        `vine=${mats(Game, 'vine')} armorTries=${armorTries()}`);
    } else {
      const Game = await mk(0); // stick-binding: banking, armor must wait
      const ctx = {};
      const armorTries = wrapId(Game, 'bark_armor');
      gearUp(Game, ctx);
      ok('G4 gate on: bark armor DEFERS while banking (vine stays 2, no craft call)',
        mats(Game, 'vine') === 2 && armorTries() === 0,
        `vine=${mats(Game, 'vine')} armorTries=${armorTries()}`);
      ok('G4 deferral counted', (ctx.vinebankDeferArmor || 0) === 1, `deferArmor=${ctx.vinebankDeferArmor || 0}`);
    }
  }

  // ---------- R5/G5: the base 3+3 band is untouched ----------
  {
    const Game = await fresh(SEED, { snare: 1, inv: [mat(VINE, 3), mat(STICK, 3)] });
    const ctx = {};
    const count = wrapCraft(Game);
    vinebank.blindBand(Game, ctx); // daily() order: layer first, skips 3+3
    workTrapline(Game, ctx);       // base band fires
    ok(`${ARMED ? 'G5' : 'R5'} 3+3: exactly 1 attempt (base band; layer skips — no double)`,
      count().attempts === 1, `attempts=${count().attempts}`);
  }

  // ---------- G6: release at full bank; G7: L2 retires the layer ----------
  if (ARMED) {
    {
      const Game = await fresh(SEED + 21, { snare: 1, inv: [mat(STONE, 1), mat(VINE, 2), mat(STICK, 2), carcass()] });
      const ctx = {};
      keepKnife(Game, ctx);
      ok('G6 bank full: knife knaps (deferral releases; vine 2 -> 1)',
        ((ctx.knivesKnapped || 0) + (ctx.knapFailed || 0)) === 1 && mats(Game, 'vine') === 1,
        `vine=${mats(Game, 'vine')}`);
      const count = wrapCraft(Game);
      vinebank.blindBand(Game, ctx);
      ok('G6 after the knife: bank 1+2 — no blind attempt yet', count().attempts === 0, `attempts=${count().attempts}`);
    }
    {
      const Game = await fresh(SEED + 22, { snare: 2, inv: [mat(STONE, 1), mat(VINE, 1), carcass()] });
      const ctx = {};
      keepKnife(Game, ctx);
      ok('G7 L2: layer retires — knife knaps, no deferral',
        ((ctx.knivesKnapped || 0) + (ctx.knapFailed || 0)) === 1 && mats(Game, 'vine') === 0,
        `vine=${mats(Game, 'vine')} deferKnife=${ctx.vinebankDeferKnife || 0}`);
    }
    {
      const Game = await fresh(SEED + 23, { snare: 2, inv: [mat(VINE, 2), mat(STICK, 2)] });
      const ctx = {};
      const count = wrapCraft(Game);
      vinebank.blindBand(Game, ctx);
      ok('G7 L2: blindBand is a no-op (base 1+1 band owns L2)', count().attempts === 0, `attempts=${count().attempts}`);
    }
    {
      const Game = await fresh(SEED + 24, { snare: 0, inv: [mat(VINE, 5), mat(STICK, 5)] });
      const ctx = {};
      const count = wrapCraft(Game);
      vinebank.blindBand(Game, ctx);
      ok('G7 L0: knowledge gate holds — no attempt', count().attempts === 0, `attempts=${count().attempts}`);
      ok('G7 L0: not banking without knowledge', vinebank.banking(Game) === false);
    }
    // trip boost shape
    {
      const Game = await fresh(SEED + 25, { snare: 1, inv: [mat(VINE, 1), mat(STICK, 0)] });
      const b = vinebank.tripBoost(Game);
      ok('G8 trip boost: vine+stick both wanted while both binding', b.vine === true && b.stick === true,
        JSON.stringify(b));
      const Game2 = await fresh(SEED + 26, { snare: 1, inv: [mat(VINE, 2), mat(STICK, 2)] });
      const b2 = vinebank.tripBoost(Game2);
      ok('G8 trip boost: quiet at full bank', b2.vine === false && b2.stick === false, JSON.stringify(b2));
    }
  } else {
    // default-off module functions stay inert
    const Game = await fresh(SEED + 25, { snare: 1, inv: [mat(VINE, 1), mat(STICK, 0)] });
    ok('R6 gate off: banking() false, defersCraft null, tripBoost quiet',
      vinebank.banking(Game) === false && vinebank.defersCraft(Game, 'stone_knife') === null &&
      vinebank.tripBoost(Game).vine === false,
      `banking=${vinebank.banking(Game)}`);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
