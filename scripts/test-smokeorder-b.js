#!/usr/bin/env node
// test-smokeorder-b.js — SMOKE-ORDER CHARACTERIZATION (sim-racksanswer-b).
//
// The brief's option (a): "policy-side smoke prioritization (smoke
// spoilDay-urgent fresh first, stop low-urgency fresh occupying racks)".
// This test characterizes the ENGINE's smoke order on a pinned fixture.
// If the engine already smokes urgency-first, a policy-side prioritization
// layer is a mathematical no-op and the option is dead.
//
// Fixture (roster 12 -> dinner reserve 3000 kcal, budget 4000 kcal):
//   A: 2000 kcal, sd=day+1 (most urgent)   -> reserve keeps it fresh
//   B: 2000 kcal, sd=day+1 (most urgent)   -> 1000 reserve / 1000 excess
//   C: 2000 kcal, sd=day+2 (less urgent)   -> excess
//   D: 2000 kcal, sd=day+2 (less urgent)   -> excess
// Excess = 5000 kcal, budget = 4000 kcal, so 1000 kcal stays fresh.
// URGENCY-FIRST predicts the unsmoked 1000 is D (least urgent).
// LEAST-URGENT-FIRST (the hypothesized inefficiency) predicts the unsmoked
// 1000 is B-excess (most urgent) — i.e. B would stay fresh while D smokes.
//
// PASS = engine already smokes urgency-first => the policy lever is a no-op.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

function stack(day, tag, units, kcalEach, spoilIn) {
  return { name: 'Meat-' + tag, kcalEach, units, spoilDay: day + spoilIn,
           foodKind: 'meat', foodState: 'fresh', safe: false, kg: 0.2,
           unit: 'portion', _tag: tag };
}

async function runOnce(seed) {
  const { Game } = await loadGame({ seed, mode: 'proof-smokeorder', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village;
  const day = (Game.state.scholar || {}).day || 1;
  const roster = (v.roster || []).length || 12;
  const vid = (v.roster || [])[0];

  // Pinned pantry: ONLY the fixture (setupGame leftovers would pollute).
  v.pantry = [];
  v.pantry.push(stack(day, 'A', 10, 200, 1)); // 2000 kcal, sd=day+1
  v.pantry.push(stack(day, 'B', 10, 200, 1)); // 2000 kcal, sd=day+1
  v.pantry.push(stack(day, 'C', 10, 200, 2)); // 2000 kcal, sd=day+2
  v.pantry.push(stack(day, 'D', 10, 200, 2)); // 2000 kcal, sd=day+2
  const spoiled = { name: 'Old fish', kcalEach: 100, units: 5, spoilDay: day - 1,
    foodKind: 'fish', foodState: 'fresh', safe: false, _testSpoiled: true };
  v.pantry.push(spoiled);

  Game.say = () => {};
  Game.resolveOneAssignment(vid, { task: 'cook' });

  // Tally units by tag x foodState.
  const tally = {};
  for (const it of (v.pantry || [])) {
    if (!it || !it._tag) continue;
    const key = it._tag + ':' + (it.foodState || 'fresh');
    tally[key] = (tally[key] || 0) + (it.units || 1);
  }
  const laundered = (v.pantry || []).filter(i => i._testSpoiled &&
    (i.foodState === 'preserved' || i.foodState === 'rendered')).length;
  return { tally, laundered, roster };
}

(async () => {
  let fail = 0;
  const check = (name, cond, extra) => {
    console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (extra ? ' [' + extra + ']' : ''));
    if (!cond) fail++;
  };

  const r1 = await runOnce(4242);
  console.log('roster=' + r1.roster + ' tally=' + JSON.stringify(r1.tally));

  // Reserve (3000) keeps the most-urgent fresh: A all 10 units + B 5 units.
  check('reserve keeps most-urgent A fresh (A:fresh==10)', r1.tally['A:fresh'] === 10,
    'got ' + r1.tally['A:fresh']);
  check('reserve split B (B:fresh==5)', r1.tally['B:fresh'] === 5,
    'got ' + r1.tally['B:fresh']);
  // The budget smokes the excess urgency-first: B-excess, C, then D-partial.
  check('most-urgent excess B fully smoked (B:preserved==5)', r1.tally['B:preserved'] === 5,
    'got ' + r1.tally['B:preserved']);
  check('C fully smoked (C:preserved==10)', r1.tally['C:preserved'] === 10,
    'got ' + r1.tally['C:preserved']);
  check('D partially smoked (D:preserved==5)', r1.tally['D:preserved'] === 5,
    'got ' + r1.tally['D:preserved']);
  // THE DECISIVE ASSERTION: the 1000 kcal the budget could not cover stayed
  // fresh from D (sd=day+2, least urgent) — NOT from B (sd=day+1).
  // A least-urgent-first engine would show D:preserved==10 and B:fresh==10.
  check('unsmoked excess is least-urgent D (D:fresh==5)', r1.tally['D:fresh'] === 5,
    'got ' + r1.tally['D:fresh']);
  check('no laundering (spoiled untouched)', r1.laundered === 0);

  // Determinism: same seed, same order.
  const r2 = await runOnce(4242);
  check('deterministic across runs',
    JSON.stringify(r1.tally) === JSON.stringify(r2.tally));

  console.log(fail ? 'SMOKEORDER: FAIL' : 'SMOKEORDER: GREEN — engine already smokes urgency-first; a policy-side prioritization layer is a no-op.');
  process.exit(fail ? 1 : 0);
})();
