#!/usr/bin/env node
// scripts/test-kitchen-r12.js — proof tests for the kitchen policy layer
// (longsim scale-wall r12, 2026-10-13). Lever 0 (food economy) AS A LENS on
// the scale wall. r11's open blank: the fight->food chain ends at "revealed"
// — scholar-eaten monster-meat kcal = 0 on all arms because competent's
// cookPack only cooks foodState === 'raw', so revealed cleaned meat
// (edible:true, foodState 'cleaned', ~2-day shelf) rots uncooked.
//
// Proves:
//  (1) RED: the baseline haul policy's real upkeep beat (fire near, scholar
//      full so eat() can't mask it) leaves REVEALED cleaned monster meat
//      uncooked while the raw control gets cooked — cookPack is raw-only.
//      This is r11's measured gap, exercised, not asserted.
//  (2) RED: with the kitchen layer present but COMPETENT_KITCHEN unset,
//      cookRevealedMeat is inert (the opt-in gate is honest).
//  (3) GREEN: gate ON — the kitchen layer cooks revealed cleaned monster
//      meat: foodState 'cooked', honest kcal kept, diseaseRisk cleared,
//      shelf extended (cleaned ~2d -> cooked ~5d).
//  (4) GREEN: the cooked monster meat is EATEN by Game.eat() (hungry
//      scholar): kcal flows, and NO mundane-disease event fires on the
//      cooked meal (cooked-through clears diseaseRisk — DISEASES.md).
//  (5) GREEN: edible:false monster meat (unknown flesh) is NEVER touched,
//      gate on — the r10 discovery chain owns it (cautious-test reveal).
//  (6) GREEN: meat_human is never cooked — trembles: cooking does not kill
//      prions (docs/DISEASES.md); the corruption slope is not a snack.
//  (7) GREEN: withKitchen delegates the base policy's hooks and counts its
//      own cooking in ctx (no silent work).
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');
const { belongseekHaul } = require('./policies/haul');
const { withKitchen, cookRevealedMeat, belongseekHaulKitchen } = require('./policies/kitchen');

function revealedMeat(mid, kcal) {
  return { plantId: 'meat_' + mid, foodKind: 'meat', foodState: 'cleaned',
    edible: true, units: 1, kcalEach: kcal, hiddenKcal: null,
    diseaseRisk: { p: 0.3, dmg: 5, note: 'risky: raw' },
    spoilDay: 99, kg: 0.5, name: mid + ' meat (cleaned)', prep: 'Cook it, or preserve it.' };
}
function unknownFlesh(mid, hiddenK) {
  return { plantId: 'meat_' + mid, foodKind: 'meat', foodState: 'cleaned',
    edible: false, units: 1, kcalEach: 0, hiddenKcal: hiddenK,
    spoilDay: 99, kg: 0.5, name: 'Unknown flesh (cleaned)' };
}
function rawPlant() {
  // rawKcal is the engine's "cookable" marker (origCookFood refuses without
  // it: "Nothing to cook there."). Cooked => rawKcal null (observable).
  return { plantId: 'dandelion', foodKind: 'plant', foodState: 'raw',
    edible: true, units: 1, kcalEach: 40, rawKcal: 80,
    spoilDay: 99, kg: 0.1, name: 'Dandelion greens' };
}
function humanMeat() {
  return { plantId: 'meat_human', foodKind: 'meat', foodState: 'cleaned',
    edible: true, units: 1, kcalEach: 500, spoilDay: 99, kg: 0.5, name: 'Human meat (cleaned)' };
}
const find = (Game, pid) => (Game.state.scholar.inventory || []).find(i => i && i.plantId === pid);

(async () => {
  const { Game } = await loadGame({ seed: 4242, mode: 'kitchen-proof' });
  await setupGame(Game);
  const s = Game.state.scholar;
  assert(Game.nearFire(), 'precondition: fire near at haven (the honest setup)');
  // the species is REVEALED (the r10 chain's output): codex foodSafe true.
  Game.state.codex.monsters = Game.state.codex.monsters || {};
  Game.state.codex.monsters.nightcourt = { foodSafe: true };
  const cap = Game.kcalCap ? Game.kcalCap() : 2400;

  // ---------- (1) RED: baseline upkeep leaves revealed meat uncooked ----------
  delete process.env.COMPETENT_KITCHEN;
  s.inventory = [revealedMeat('nightcourt', 180), rawPlant()];
  s.inventory[0].spoilDay = s.day + 2;
  s.kcal = cap; // full: competentEat early-returns, can't mask the gap
  belongseekHaul.upkeep(Game, {});
  const rm1 = find(Game, 'meat_nightcourt');
  const rp1 = find(Game, 'dandelion');
  assert(rp1 && rp1.rawKcal == null, 'control: the raw plant was cooked (rawKcal consumed = fire near, cook step ran)');
  assert(rm1 && rm1.foodState === 'cleaned', 'RED: revealed cleaned monster meat is NOT cooked by the baseline cook step');
  console.log('PASS 1 (RED): baseline upkeep cooks raw, leaves revealed-cleaned meat — the r11 gap');

  // ---------- (2) RED: gate off => layer inert ----------
  delete process.env.COMPETENT_KITCHEN;
  s.inventory = [revealedMeat('nightcourt', 180)];
  const n2 = cookRevealedMeat(Game, {});
  assert(n2 === 0, 'gate off must cook nothing');
  assert(find(Game, 'meat_nightcourt').foodState === 'cleaned', 'gate off: meat untouched');
  console.log('PASS 2 (RED): COMPETENT_KITCHEN unset => kitchen layer inert (opt-in honest)');

  // ---------- (3) GREEN: gate on => revealed meat gets cooked ----------
  process.env.COMPETENT_KITCHEN = '1';
  try { Game.learnTechnique('cook', 'trial'); } catch (e) {}
  const realRandom = Math.random;
  Math.random = () => 0.1; // perfect outcome, deterministic
  s.inventory = [revealedMeat('nightcourt', 180)];
  s.inventory[0].spoilDay = s.day + 2;
  s.inventory[0].diseaseRisk = { p: 0.3, dmg: 5, note: 'risky: raw' };
  s.kcal = cap;
  const n3 = cookRevealedMeat(Game, {});
  Math.random = realRandom;
  const rm3 = find(Game, 'meat_nightcourt');
  assert(n3 === 1, 'gate on must cook the revealed meat, cooked ' + n3);
  assert(rm3 && rm3.foodState === 'cooked', 'foodState must be cooked, got ' + (rm3 && rm3.foodState));
  assert(rm3.kcalEach > 0, 'honest kcal kept through the fire, got ' + rm3.kcalEach);
  assert(rm3.diseaseRisk == null, 'cooked-through clears diseaseRisk (disease-safe now)');
  assert(rm3.spoilDay > s.day + 2, 'shelf extended past the 2-day cleaned window, spoilDay ' + rm3.spoilDay);
  console.log('PASS 3 (GREEN): kitchen cooks revealed meat — cooked, honest kcal, disease-safe, +shelf');

  // ---------- (4) GREEN: the cooked meat is EATEN, no disease ----------
  let diseases = [];
  const origContract = Game.contractDisease;
  Game.contractDisease = function (id, opts) {
    diseases.push({ id: String(id), source: String((opts && opts.source) || '?') });
    return origContract.apply(this, arguments);
  };
  s.kcal = 0; // hungry: the eat beat fires
  const kcalBefore = s.kcal;
  try { Game.eat(); } catch (e) {}
  Game.contractDisease = origContract;
  assert(s.kcal > kcalBefore + 50, 'the scholar ate the cooked monster meat, kcal ' + kcalBefore + ' -> ' + s.kcal);
  const foodDz = diseases.filter(d => /disease|gutrot|trichinosis|wound/i.test(d.id + ' ' + d.source));
  assert(foodDz.length === 0, 'no mundane-disease event on the cooked meal, got ' + JSON.stringify(foodDz));
  console.log('PASS 4 (GREEN): cooked monster meat eaten, kcal flows, zero disease events');

  // ---------- (5) GREEN: unknown flesh NEVER touched ----------
  process.env.COMPETENT_KITCHEN = '1';
  s.inventory = [unknownFlesh('gallowdeer', 700)];
  const n5 = cookRevealedMeat(Game, {});
  const uf = find(Game, 'meat_gallowdeer');
  assert(n5 === 0, 'unknown flesh must not be cooked, cooked ' + n5);
  assert(uf && uf.foodState === 'cleaned' && uf.edible === false && uf.hiddenKcal === 700,
    'unknown flesh byte-identical: still the r10 chain\u2019s to reveal');
  console.log('PASS 5 (GREEN): edible:false flesh untouched — discovery chain owns it');

  // ---------- (6) GREEN: human meat never cooked ----------
  s.inventory = [humanMeat()];
  const n6 = cookRevealedMeat(Game, {});
  const hm = find(Game, 'meat_human');
  assert(n6 === 0 && hm && hm.foodState === 'cleaned', 'meat_human must never see the fire (trembles)');
  console.log('PASS 6 (GREEN): meat_human skipped — prions don\u2019t cook out');

  // ---------- (7) GREEN: withKitchen delegates + counts ----------
  s.inventory = [revealedMeat('nightcourt', 180)];
  s.kcal = cap;
  const realRandom2 = Math.random;
  Math.random = () => 0.1;
  const ctx7 = {};
  belongseekHaulKitchen.upkeep(Game, ctx7);
  Math.random = realRandom2;
  assert(typeof belongseekHaulKitchen.daily === 'function', 'daily delegated');
  assert(typeof belongseekHaulKitchen.fight === 'function' || belongseekHaul.fight === undefined, 'fight path intact');
  assert((ctx7.kitchenCooked || 0) >= 1, 'kitchen counts its own cooking in ctx, got ' + ctx7.kitchenCooked);
  assert(find(Game, 'meat_nightcourt').foodState === 'cooked', 'layered upkeep cooks before the base beat');
  delete process.env.COMPETENT_KITCHEN;
  console.log('PASS 7 (GREEN): withKitchen delegates the base policy, cooks first, counts honestly');

  console.log('\nkitchen-r12 proof: 7/7 green (2 RED phases demonstrated, 5 GREEN)');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
