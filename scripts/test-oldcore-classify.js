#!/usr/bin/env node
// scripts/test-oldcore-classify.js — unit proof for the oldcore removal
// classifier (sim-oldcore-a). No harness, no game load: requires the
// policy module's pure classifyRemoval() and asserts every branch.
// Exit 1 on any failure.
'use strict';
const { classifyRemoval } = require('./policies/oldcore-diag');
const M = (o) => Object.assign({ id: 'bulldozer', hp: 20 }, o || {});
const cases = [
  // [mon, flagStack, hint, fledHeld, expected]
  [M(), ['combat-lift'], '', false, 'combat-lift'],
  [M(), ['raid-defense'], 'resolveWildMonsterEncounter', false, 'raid-defense-kill'],
  [M(), ['villager-fight'], 'resolveWildMonsterEncounter', false, 'villager-fight-kill'],
  [M(), ['patrol'], 'resolvePatrol', false, 'villager-fight-kill'],
  [M(), ['aid-crisis'], 'aidFight', false, 'aid-crisis-kill'],
  [M(), [], 'lingererSortie,havenGrowthDaily', false, 'raid-lingerer-sortie-kill'],
  [M({ lostSight: 7 }), [], 'monsterTurn,worldTick', false, 'departure-lost-trail'],
  [M({ watchTurns: 2 }), [], 'monsterTurn,worldTick', false, 'departure-watched-away'],
  [M({ fearTurns: 4 }), [], 'monsterTurn,worldTick', true, 'fled-record'],
  [M({ fearTurns: 4 }), [], 'monsterTurn,worldTick', false, 'fled-record'],
  [M(), [], 'monsterTurn,worldTick', false, 'monsterTurn-departure'],
  [M({ gwTrap: true }), [], 'monsterTurn,worldTick', false, 'trap-capture'],
  [M(), [], 'someFinale,finaleCampaign', false, 'scripted-clear'],
  [M(), [], 'networkCleanup,network-campaign', false, 'scripted-clear'],
  [M(), [], 'titanCleanup,titans', false, 'scripted-clear'],
  [M(), [], 'weirdHelper,gameLoop', false, 'other-named:weirdHelper'],
  [M(), [], '', false, 'unclassified'],
  // flag precedence: raid-defense flag beats a stack hint
  [M(), ['raid-defense'], 'lingererSortie', false, 'raid-defense-kill'],
  // fledHeld outside monsterTurn still classifies fled-record
  [M(), [], 'travelTo,worldTick', true, 'fled-record'],
];
let fail = 0;
for (const [mon, stack, hint, fled, want] of cases) {
  const got = classifyRemoval(mon, stack, hint, fled);
  const ok = got === want;
  if (!ok) fail++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'} classifyRemoval(${JSON.stringify(stack)}, '${hint}', fled=${fled}) = '${got}' (want '${want}')`);
}
if (fail) { console.error(`CLASSIFY: ${fail} failures`); process.exit(1); }
console.log(`CLASSIFY: ${cases.length}/${cases.length} pass`);
