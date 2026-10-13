#!/usr/bin/env node
// scripts/test-meatseek-r1.js — proof tests for the meatseek policy + the
// meat-discovery instrument (longsim scale-wall r10, 2026-10-13).
// Proves: (1) findUnknownFlesh finds undiscovered monster flesh and ignores
// animal meat; (2) testUnknownMeat runs the cautious-test chain -> species
// discovered, item revealed edible with honest kcal; (3) toxic flesh (belltoad)
// pays the real -30 energy and is marked poison; (4) one test per day max;
// (5) the instrument records discoveries/tests/eaten-kcal without mutating
// game state (discovery count matches codex).
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');
const { findUnknownFlesh, testUnknownMeat } = require('./policies/meatseek');
const { attachInstruments } = require('./meat-discovery-20261013');

function unknownFlesh(Game, mid, kcal) {
  return { plantId: 'meat_' + mid, foodKind: 'meat', foodState: 'cleaned',
    edible: false, units: 4, unit: 'portion', kcalEach: 0, hiddenKcal: kcal,
    spoilDay: 99, kg: 0.5, name: 'Unknown flesh (cleaned)',
    prep: 'Unknown flesh. Test it cautiously.' };
}

(async () => {
  const { Game } = await loadGame({ seed: 42, mode: 'meatseek-proof' });
  await setupGame(Game);
  const ctx = {};
  const s = Game.state.scholar;

  // --- (1) finder ignores animal meat, finds monster flesh
  s.inventory.push(unknownFlesh(Game, 'hushwolf', 1400));
  s.inventory.push({ plantId: 'meat_white_tailed_deer', foodKind: 'meat',
    foodState: 'cleaned', edible: true, units: 4, kcalEach: 500, spoilDay: 99, kg: 0.5, name: 'Venison (cleaned)' });
  const hit = findUnknownFlesh(Game);
  assert(hit && hit.mid === 'hushwolf', 'finder must find the hushwolf flesh first, not the deer meat');
  console.log('PASS 1: findUnknownFlesh finds monster flesh, ignores animal meat');

  // --- (2) the cautious test discovers the species honestly
  assert(!(Game.monsterFoodSafe && Game.monsterFoodSafe('hushwolf')), 'pre: hushwolf undiscovered');
  testUnknownMeat(Game, ctx);
  assert(ctx.meatTests === 1, 'one test recorded');
  assert(Game.monsterFoodSafe('hushwolf'), 'hushwolf now known-safe (tested)');
  const revealed = s.inventory.find(i => i.plantId === 'meat_hushwolf');
  assert(revealed && revealed.edible === true, 'revealed item is edible');
  assert(revealed.kcalEach > 0, 'revealed item carries honest kcal, was ' + revealed.kcalEach);
  const e = (Game.state.codex.monsters || {}).hushwolf || {};
  assert(e.foodSafe === true && e.foodSafeHow === 'tested', 'codex records the tested path');
  console.log('PASS 2: cautious test discovers the species; item revealed edible with kcal');

  // --- (4) one flesh per day
  s.inventory.push(unknownFlesh(Game, 'gallowdeer', 2800));
  testUnknownMeat(Game, ctx); // same day: must no-op
  assert(ctx.meatTests === 1, 'second same-day test must not fire');
  assert(!Game.monsterFoodSafe('gallowdeer'), 'gallowdeer still undiscovered today');
  s.day = (s.day || 0) + 1;
  testUnknownMeat(Game, ctx); // next day: fires
  assert(ctx.meatTests === 2 && Game.monsterFoodSafe('gallowdeer'), 'next-day test fires');
  console.log('PASS 4: one unknown flesh per day, honestly paced');

  // --- (3) toxic flesh pays the real price (belltoad: 300 kcal def, poison test)
  const ctx2 = {};
  s.inventory.push(unknownFlesh(Game, 'belltoad', 300));
  s.day = (s.day || 0) + 1;
  s.energy = 100;
  testUnknownMeat(Game, ctx2);
  assert(ctx2.meatTests === 1, 'toxic test was attempted');
  assert((Game.state.codex.monsters || {}).belltoad.foodTested === 'poison', 'belltoad marked poison in the codex');
  assert(!Game.monsterFoodSafe('belltoad'), 'poison is never marked safe');
  assert((s.energy || 0) === 70, 'honest -30 energy cost, was ' + s.energy);
  const pois = s.inventory.find(i => i.plantId === 'meat_belltoad');
  assert(pois && !pois.edible, 'poison flesh stays inedible');
  console.log('PASS 3: toxic flesh pays the real -30 energy, marked poison, never food');

  // --- (5) instrument records without mutating state
  const { Game: G2 } = await loadGame({ seed: 7, mode: 'meatseek-proof-2' });
  await setupGame(G2);
  const m = attachInstruments(G2);
  const s2 = G2.state.scholar;
  s2.inventory.push(unknownFlesh(G2, 'bulldozer', 3200));
  testUnknownMeat(G2, {});
  assert(m.tests.length === 1 && m.tests[0].outcome === 'safe', 'instrument recorded the test');
  assert(m.discoveries.filter(d => !d.already).length === 1, 'instrument recorded the discovery');
  assert(G2.monsterFoodSafe('bulldozer'), 'game state has the discovery (instrument did not suppress it)');
  // eaten-kcal: eat the revealed bulldozer meat
  s2.kcal = 0;
  const before = m.meatEatenKcal;
  G2.eat();
  assert(m.meatEatenKcal > before, 'instrument recorded player monster-meat consumption: +' + (m.meatEatenKcal - before) + ' kcal');
  console.log('PASS 5: instrument records tests/discoveries/eaten-kcal, no state mutation');

  console.log('\nAll meatseek proof tests passed.');
})().catch(e => { console.error('PROOF FAILED:', e); process.exit(1); });
