#!/usr/bin/env node
// scripts/test-mergereval-20261017.js — sim-mergereval-b proof (#455).
//
// stockSurplus merged its 200-kcal units into ANY same-clock 'Foraged food'
// stack, revaluing them at the resident kcalEach (±100-600 kcal/call).
// The fix gates the merge on stacksMatch (the established fungibility gate,
// food.js, Steve 2026-10-08): units join only a truly identical stack.
//
// RED fixtures run the legacy path (MERGEREVAL=0) and prove the revaluation
// exists (pantry delta != nominal give); GREEN fixtures run the fix (env
// unset) and prove exact conservation (0.00%).
//
// Usage: node scripts/test-mergereval-20261017.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let PASS = 0, FAIL = 0;
const check = (name, cond, detail) => {
  if (cond) { PASS++; console.log(`  PASS ${name}`); }
  else { FAIL++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
};

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'mergereval-proof' });
  await setupGame(Game);
  const v = Game.state.village;
  v.day = 30; v.pantry = []; // clean pantry, fresh clock = day 33
  return { Game, v };
}

// plant a resident 'Foraged food' stack with today's fresh clock (day+3),
// mimicking stockPantry's pieceMax-split writes (arbitrary kcalEach).
const plant = (Game, v, kcalEach, units) =>
  v.pantry.push({ name: 'Foraged food', kcalEach, units, spoilDay: v.day + 3, safe: true, kg: Math.max(0.05, Math.round(kcalEach / 5) / 1000) });

async function sectionLegacy() {
  process.env.MERGEREVAL = '0';
  console.log('== RED: legacy path (MERGEREVAL=0) must show revaluation ==');
  // F1: merge 2x200 into a pk=300 stack -> pantry gains 600, not 400
  {
    const { Game, v } = await freshGame(9101);
    plant(Game, v, 300, 1); // resident 300-kcal piece, today's clock
    const before = Game.pantryKcal();
    const r = Game.stockSurplus(v, 400);
    const delta = Game.pantryKcal() - before;
    check('legacy pk=300 revalues 400 nominal -> 600 stored', delta === 600 && r === 600, `delta=${delta} r=${r}`);
  }
  // F2: merge 2x200 into a pk=150 stack -> pantry gains 300, not 400
  {
    const { Game, v } = await freshGame(9102);
    plant(Game, v, 150, 2);
    const before = Game.pantryKcal();
    const r = Game.stockSurplus(v, 400);
    const delta = Game.pantryKcal() - before;
    check('legacy pk=150 revalues 400 nominal -> 300 stored', delta === 300 && r === 300, `delta=${delta} r=${r}`);
  }
  // F3: pristine Math.round rounding path still intact under legacy
  {
    const { Game, v } = await freshGame(9103);
    const before = Game.pantryKcal();
    const r = Game.stockSurplus(v, 610); // round(610/200)=3 units
    const delta = Game.pantryKcal() - before;
    check('legacy rounding path intact (610 -> 3 units -> 600)', delta === 600 && r === 600, `delta=${delta} r=${r}`);
  }
  delete process.env.MERGEREVAL;
}

async function sectionFixed() {
  delete process.env.MERGEREVAL;
  console.log('== GREEN: fixed path must conserve exactly ==');
  // G1: pk=300 resident + 2x200 -> separate 200-stack, delta exactly 400
  {
    const { Game, v } = await freshGame(9201);
    plant(Game, v, 300, 1);
    const before = Game.pantryKcal();
    const r = Game.stockSurplus(v, 400);
    const delta = Game.pantryKcal() - before;
    const stacks = v.pantry.filter(p => p.name === 'Foraged food' && p.spoilDay === v.day + 3);
    const units200 = stacks.filter(s => (s.kcalEach || 0) === 200).reduce((t, s) => t + (s.units || 0), 0);
    check('fixed pk=300: delta==400, return==400', delta === 400 && r === 400, `delta=${delta} r=${r}`);
    check('fixed pk=300: resident 300-stack untouched (1 unit)', v.pantry.find(p => (p.kcalEach || 0) === 300).units === 1, JSON.stringify(v.pantry));
    check('fixed pk=300: new units ride a separate 200-stack (2 units)', units200 === 2, `units200=${units200}`);
  }
  // G2: pk=150 resident + 2x200 -> delta exactly 400 (no down-revaluation)
  {
    const { Game, v } = await freshGame(9202);
    plant(Game, v, 150, 2);
    const before = Game.pantryKcal();
    const r = Game.stockSurplus(v, 400);
    const delta = Game.pantryKcal() - before;
    check('fixed pk=150: delta==400, return==400 (no down-reval)', delta === 400 && r === 400, `delta=${delta} r=${r}`);
  }
  // G3: identical own-shape stack merges (no stack explosion)
  {
    const { Game, v } = await freshGame(9203);
    v.pantry.push({ name: 'Foraged food', kcalEach: 200, units: 3, spoilDay: v.day + 3, safe: true, kg: 0.2 }); // own shape
    const before = Game.pantryKcal();
    const r = Game.stockSurplus(v, 400);
    const delta = Game.pantryKcal() - before;
    const stacks = v.pantry.filter(p => p.name === 'Foraged food' && p.spoilDay === v.day + 3 && (p.kcalEach || 0) === 200);
    check('fixed own-shape: merges (1 stack, 5 units), delta==400', delta === 400 && r === 400 && stacks.length === 1 && stacks[0].units === 5, `delta=${delta} r=${r} stacks=${stacks.length} units=${stacks[0] && stacks[0].units}`);
  }
  // G4: conservation across many mixed deposits is exact (0.00%)
  // NOTE (2026-10-17 coordinator repair): the landed phantomfood remainder-carry
  // (v._surplusRemainder, Math.floor((rem+give)/200)) is active on this base, so the
  // per-give expectation is the carry-aware deposit, not Math.round(g/200)*200.
  // The remainder is preserved on the village, never lost — conservation holds
  // across the whole sequence, and the final remainder (< 200) is asserted, not hidden.
  {
    const { Game, v } = await freshGame(9204);
    let expected = 0, delta = 0, rem = 0;
    const gives = [400, 200, 800, 610, 150, 200, 1000, 390];
    for (const g of gives) {
      // rotate resident piece sizes to force mixed merges
      v.pantry.push({ name: 'Foraged food', kcalEach: [300, 150, 500, 250][gives.indexOf(g) % 4], units: 1, spoilDay: v.day + 3, safe: true, kg: 0.05 });
      const total = rem + g;
      const dep = Math.floor(total / 200) * 200;
      rem = total - dep;
      const before = Game.pantryKcal();
      const r = Game.stockSurplus(v, g);
      delta += Game.pantryKcal() - before;
      expected += dep;
      if (r !== dep) check(`fixed mixed: return matches carry-aware deposit for give ${g}`, false, `r=${r} dep=${dep}`);
    }
    const err = Math.abs(delta - expected);
    check('fixed mixed: conservation exact (0.00%)', err === 0, `delta=${delta} expected=${expected} err=${err}`);
    check('fixed mixed: remainder preserved, not lost', (Number(v._surplusRemainder) || 0) === rem, `rem=${v._surplusRemainder} expected=${rem}`);
  }
  // G5: the merge is unvoiced — stockSurplus never says anything
  {
    const { Game, v } = await freshGame(9205);
    plant(Game, v, 300, 1);
    let says = 0;
    const oSay = Game.say ? Game.say.bind(Game) : null;
    Game.say = function (m) { says++; return oSay ? oSay(m) : m; };
    Game.stockSurplus(v, 400);
    check('fixed merge stays unvoiced (0 say calls)', says === 0, `says=${says}`);
  }
  // G6: cap door behavior untouched — refuses at cap
  {
    const { Game, v } = await freshGame(9206);
    try {
      const cap = Game.pantryCapKcal();
      plant(Game, v, 500, Math.ceil(cap / 500) + 2); // over cap
    } catch (e) { /* no cap fn: skip */ }
    const r = Game.stockSurplus(v, 400);
    check('fixed cap refusal unchanged (r==0 at cap)', r === 0, `r=${r}`);
  }
  // G7: spoiled-clock stacks never merge (spoilDay gate intact)
  {
    const { Game, v } = await freshGame(9207);
    v.pantry.push({ name: 'Foraged food', kcalEach: 200, units: 2, spoilDay: v.day + 1, safe: true, kg: 0.2 }); // old clock
    const before = Game.pantryKcal();
    Game.stockSurplus(v, 400);
    const delta = Game.pantryKcal() - before;
    const oldStack = v.pantry.find(p => p.spoilDay === v.day + 1);
    check('fixed: old-clock 200-stack not merged (delta==400, old stack 2u)', delta === 400 && oldStack.units === 2, `delta=${delta} oldUnits=${oldStack && oldStack.units}`);
  }
}

(async () => {
  try { await sectionLegacy(); await sectionFixed(); }
  catch (e) { FAIL++; console.log('THREW: ' + (e && e.stack || e)); }
  console.log(`\nmergereval proof: ${PASS} pass, ${FAIL} fail`);
  process.exit(FAIL ? 1 : 0);
})();
