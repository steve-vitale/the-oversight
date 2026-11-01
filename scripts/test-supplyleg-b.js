#!/usr/bin/env node
// test-supplyleg-b.js — pure proof tests for the supplyleg classifier
// (DIAG ONLY; sim-supplyleg-b). No game load, no file writes, no RNG.
// Run: node scripts/test-supplyleg-b.js
'use strict';
const assert = require('assert');
const { classifyEvent, dominanceVerdict, analyzeSeed } = require('./analyze-supplyleg-b');

let n = 0;
function check(actual, expected, label) {
  n++;
  assert.strictEqual(actual, expected, label + ': got ' + actual + ', want ' + expected);
}

// Stock names.
check(classifyEvent({ t: 'stock', name: 'Expedition haul', stack: 'x' }), 'expedition', 'expedition haul');
check(classifyEvent({ t: 'stock', name: 'Expedition meat', stack: 'x' }), 'expedition', 'expedition meat');
check(classifyEvent({ t: 'stock', name: 'Hauled meat', stack: 'at foo haulKcal bar' }), 'expedition', 'field meat via stack');
check(classifyEvent({ t: 'stock', name: 'Venison', stack: 'at expeditionReturn (villager-agency.js:606)' }), 'expedition', 'expedition via stack');
check(classifyEvent({ t: 'stock', name: 'Fish catch', stack: 'x' }), 'fish', 'fish');
check(classifyEvent({ t: 'stock', name: 'Snared meat', stack: 'x' }), 'traps', 'snared');
check(classifyEvent({ t: 'stock', name: 'Pit meat (deadfall)', stack: 'x' }), 'traps', 'pit');
check(classifyEvent({ t: 'stock', name: 'Foraged food', stack: 'x' }), 'npc-forage', 'npc forage');
check(classifyEvent({ t: 'stock', name: 'Garden harvest', stack: 'x' }), 'garden', 'garden name');
check(classifyEvent({ t: 'stock', name: 'Foraged food', garden: true, stack: 'x' }), 'garden', 'garden flag wins');
check(classifyEvent({ t: 'stock', name: 'Weregild', stack: 'x' }), 'other-supply', 'other name');
check(classifyEvent({ t: 'stock', name: 'System-replicated stew', stack: 'x' }), 'other-supply', 'system meal');
// Deposit stacks.
check(classifyEvent({ t: 'deposit', name: 'Acorn', stack: 'at returnToVillage (game.js:8813)' }), 'scholar-unload', 'unload');
check(classifyEvent({ t: 'deposit', name: 'Acorn', stack: 'at donateToPantry (game.js:15851)' }), 'scholar-donate', 'donate');
check(classifyEvent({ t: 'deposit', name: 'Acorn', stack: 'at favorForageDeliver (favor-forage.js:226)' }), 'favor-delivery', 'favor');
check(classifyEvent({ t: 'deposit', name: 'Acorn', garden: true, stack: 'at returnToVillage (game.js:8813)' }), 'garden', 'garden deposit flag wins');
// PantryAdd / surplus.
check(classifyEvent({ t: 'pantryAdd', name: 'Cooked stew', stack: 'at putAwayFinished (food.js:2747)' }), 'processing', 'processing');
check(classifyEvent({ t: 'pantryAdd', name: 'Contest share', stack: 'at contestPrize (contests.js:4880)' }), 'contest-prize', 'contest');
check(classifyEvent({ t: 'surplus', name: null, stack: 'x' }), 'meal-surplus', 'surplus');
// Direct pushes.
check(classifyEvent({ t: 'direct', name: 'Acorn', kcal: 500, stack: 'at preserveFood smoke (game.js:7229)' }), 'transform-skip', 'smoking split skipped');
check(classifyEvent({ t: 'direct', name: 'Foraged food', kcal: 20400, stack: 'at Object.resolveOneAssignment (src/js/game.js:7229:24)' }), 'transform-skip', 'smoke-racks split via duty name');
check(classifyEvent({ t: 'direct', name: 'Foraged food (dried)', kcal: 6336, stack: 'at Object.resolveOneAssignment (src/js/game.js:7264:24)' }), 'transform-skip', 'smoke-racks convert via duty name');
check(classifyEvent({ t: 'direct', name: 'Unknown flesh', kcal: 0, kcalEach: 0, units: 2, stack: 'at expeditionReturn (villager-agency.js:620)' }), 'zero-kcal', 'unknown flesh');
check(classifyEvent({ t: 'direct', name: 'Tribute grain from X', kcal: 1000, stack: 'at tribute (hierarchy.js:3274)' }), 'tribute', 'tribute');
check(classifyEvent({ t: 'direct', name: 'Prize share', kcal: 800, stack: 'at contestAward (contests.js:4881)' }), 'contest-prize', 'contest direct');
check(classifyEvent({ t: 'direct', name: 'Mystery item', kcal: 300, stack: 'at unknownFn (game.js:1)' }), 'direct-other', 'direct other');

// Seed analysis: shares sum to 1, buckets exact, zero-kcal excluded.
const seed = analyzeSeed({
  seed: 51101, daysAlive: 30, endReason: 'survived', decisions: [{}, {}],
  events: [
    { t: 'stock', name: 'Expedition haul', kcal: 6000, stack: 'x' },
    { t: 'stock', name: 'Foraged food', kcal: 2000, stack: 'x' },
    { t: 'surplus', kcal: 1000, stack: 'x' },
    { t: 'direct', name: 'Unknown flesh', kcal: 0, kcalEach: 0, units: 3, stack: 'x' },
    { t: 'direct', name: 'Acorn', kcal: 400, stack: 'at preserveFood smoke (game.js:7229)' },
  ],
});
check(seed.totalInflowKcal, 9000, 'seed total excludes zero + transform');
check(seed.byLeg.expedition, 6000, 'seed expedition');
check(seed.topSupplyLeg, 'expedition', 'seed top leg');
check(Math.abs(seed.shares.expedition - 6000 / 9000) < 1e-9, true, 'seed share');
check(seed.zeroKcalUnits, 3, 'seed zero units');
check(seed.transformSkipped, 1, 'seed transform skipped');

// Dominance rule: needs top on >= 6/8 AND mean >= 35%.
const mk = (top, share) => {
  const shares = {};
  for (const l of ['expedition', 'npc-forage', 'meal-surplus']) shares[l] = 0;
  shares[top] = share;
  return { shares };
};
const domSeeds = [];
for (let i = 0; i < 7; i++) domSeeds.push(mk('expedition', 0.5));
domSeeds.push(mk('npc-forage', 0.6));
const v1 = dominanceVerdict(domSeeds, ['expedition', 'npc-forage', 'meal-surplus']);
check(v1.verdict, 'dominant', 'dominant verdict');
check(v1.leg, 'expedition', 'dominant leg');
const flatSeeds = [];
for (let i = 0; i < 8; i++) flatSeeds.push(mk(i % 2 ? 'npc-forage' : 'expedition', 0.3));
const v2 = dominanceVerdict(flatSeeds, ['expedition', 'npc-forage', 'meal-surplus']);
check(v2.verdict, 'no dominant leg', 'flat verdict');

console.log('test-supplyleg-b: ' + n + ' checks passed');
