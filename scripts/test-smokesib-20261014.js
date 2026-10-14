#!/usr/bin/env node
// test-smokesib-20261014.js — SMOKE-SIBLINGS arm proof test.
//
// ARM 1 sibling audit (food economy): the G.cookAll batch wrapper's meat
// pipeline (food.js) converts 'cleaned'/'undercooked' items with NO spoiled
// check — a spoiled cleaned stack gets foodState='cooked', safe=true, and
// spoilDay rewritten to day+5: rot laundered by the batch button, the same
// class as the landed duty-drive spoilsmoke fix. All other convert/preserve
// entry points were audited and already guard (see comments below).
//
// Phase A (RED on pristine): inventory = one spoiled cleaned-meat stack
//   (sd=day-1). cookAll() -> pristine cooks it (spoilDay=day+5, safe=true)
//   -> laundered == 1 -> FAIL on pristine. Fixed: the stack is discarded,
//   nothing is cooked -> PASS.
// Phase B (legit flow, must hold BOTH sides): one about-to-rot cleaned stack
//   (sd=day+1, not spoiled under the bonus-aware boundary). cookAll() cooks
//   it -> PASS on pristine AND fixed — the exclusion must not kill the
//   legit batch flow.
// SENSE check: the rot-discard narration fires with the per-item guard's
//   voice ("cooking won't save it ... leave it for the flies").
// Node harness: sim-harness loadGame (full src/js list, Math.random seeded
// before eval), Game.save never stubbed. nearFire is stubbed true only to
// reach the fire-gated batch path in headless node.
//
// AUDIT RESULT (all convert/preserve entry points, 2026-10-14):
//   GUARDED: duty cook drive eligible loop (game.js, landed spoilsmoke fix);
//     preserveFood dropRotten (food.js); renderFat !isSpoiled filter;
//     makePemmican/pemmicanPlan/pemmicanSets isSpoiled filters;
//     cleanCarcass dropRotten; G.cookFood per-item guard (2026-10-08);
//     askSpecialist any-task guard (2026-10-08); tribute arrival (fresh
//     spoil-dated grain, hierarchy.js); tribute payment (removes
//     freshest-first, no preservation); stockPantry/granary (additive only);
//     corpses loot (honest clocks).
//   UNGUARDED (this arm): G.cookAll batch meat pipeline (food.js).
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

function meatStack(name, day, sdOffset, units, kcalEach, tag) {
  return { name, kcalEach, units, spoilDay: day + sdOffset, foodKind: 'meat',
    foodState: 'cleaned', plantId: 'meat_deer', safe: false, diseaseRisk: 0.1,
    kg: 0.2, unit: 'portion', _testSpoiled: !!tag };
}

function runBatchCook(Game, inv) {
  const s = Game.state.scholar;
  s.inventory = inv;
  const lines = [];
  const origSay = Game.say;
  Game.say = (m) => { lines.push(String(m)); };
  Game.nearFire = () => true; // headless: grant the fire the wrapper requires
  let threw = null;
  try { Game.cookAll(); } catch (e) { threw = e; }
  Game.say = origSay;
  const cooked = inv.filter(i => i && i.foodState === 'cooked' && i._testSpoiled).length;
  const laundered = inv.filter(i => i && i._testSpoiled && i.foodState === 'cooked'
    && i.safe === true && i.spoilDay > (s.day || 1)).length;
  const discarded = !inv.some(i => i && i._testSpoiled);
  const rotSaid = lines.some(l => /cooking won't save it|went bad/.test(l));
  const batchSaid = lines.some(l => /Cooked \d+/.test(l));
  return { cooked, laundered, discarded, rotSaid, batchSaid, threw,
    invSize: inv.length };
}

(async () => {
  const { Game } = await loadGame({ seed: 42, mode: 'proof-smokesib', fullTelemetry: false });
  await setupGame(Game);
  const day = (Game.state.scholar || {}).day || 1;

  let fail = 0;
  const check = (name, cond, extra) => {
    console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (extra ? ' [' + extra + ']' : ''));
    if (!cond) fail++;
  };

  // Phase A: spoiled cleaned stack.
  const invA = [meatStack('Old deer (cleaned)', day, -1, 8, 500, true)];
  const A = runBatchCook(Game, invA);
  console.log(`PhaseA: thrown=${A.threw ? A.threw.message : 'none'} laundered=${A.laundered} discarded=${A.discarded} rotSaid=${A.rotSaid} batchSaid=${A.batchSaid}`);
  check('PhaseA: no laundering (laundered==0)', A.laundered === 0, 'laundered=' + A.laundered);
  check('PhaseA: spoiled stack discarded honestly', A.discarded, 'invSize=' + A.invSize);
  check('PhaseA: rot refusal is said aloud', A.rotSaid);

  // Phase B: about-to-rot cleaned stack (sd=day+1) — legit batch flow.
  const invB = [meatStack('Deer (cleaned)', day, 1, 8, 500, true)];
  const B = runBatchCook(Game, invB);
  console.log(`PhaseB: thrown=${B.threw ? B.threw.message : 'none'} cooked=${B.cooked} batchSaid=${B.batchSaid}`);
  check('PhaseB: about-to-rot stack still batch-cooks (cooked==1)', B.cooked === 1, 'cooked=' + B.cooked);
  check('PhaseB: cooked with fresh spoilDay', (invB[0] || {}).spoilDay === day + 5,
    'spoilDay=' + ((invB[0] || {}).spoilDay));

  process.exit(fail ? 1 : 0);
})();
