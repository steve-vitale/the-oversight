#!/usr/bin/env node
// test-dinreserve-20261013.js — DINRESERVE arm proof test.
//
// RED phase (pristine tree): the duty-time cook drive reserves 250 kcal/person
// of soonest-spoiling fresh as "dinner reserve" — 2x the measured ~125 draw.
// With a 12-person roster and 3,000 kcal of near-expiry fresh in the pantry,
// pristine keeps the WHOLE pile fresh (reserve=3,000) and preserves 0;
// armed (reserve=125/person=1,500) preserves ~1,500.
//   RED:  assert dutyPreserved >= 1000   (fails on pristine: 0)
//   GREEN: same assertion passes after the lever.
// Invariants (must hold both sides — no laundering, dinner still cooked):
//   - no spoiled stack exits the cook resolution as preserved
//   - the cook narration still fires ("cooked for the haven")
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

function nearExpiryStack(day, units, kcalEach) {
  return { name: 'Deer meat', kcalEach, units, spoilDay: day + 2, foodKind: 'meat',
           foodState: 'fresh', safe: false, diseaseRisk: 0.1, kg: 0.2, unit: 'portion' };
}

(async () => {
  const { Game } = await loadGame({ seed: 42, mode: 'proof-dinreserve', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village;
  const day = (Game.state.scholar || {}).day || 1;
  const roster = (v.roster || []);
  const vid = roster[0];
  console.log('roster=' + roster.length + ' day=' + day);

  // Crafted pantry: 3,000 kcal of near-expiry fresh + one spoiled stack.
  v.pantry = v.pantry || [];
  v.pantry.push(nearExpiryStack(day, 10, 100), nearExpiryStack(day, 10, 100), nearExpiryStack(day, 10, 100));
  const spoiled = { name: 'Old fish', kcalEach: 100, units: 5, spoilDay: day - 1,
    foodKind: 'fish', foodState: 'fresh', safe: false, _testSpoiled: true };
  v.pantry.push(spoiled);

  const lines = [];
  Game.say = (s) => { lines.push(String(s)); };

  const presBefore = v.pantry.filter(i => i.foodState === 'preserved' || i.foodState === 'rendered')
    .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  Game.resolveOneAssignment(vid, { task: 'cook' });
  const presAfter = v.pantry.filter(i => i.foodState === 'preserved' || i.foodState === 'rendered')
    .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  const dutyPreserved = presAfter - presBefore;

  const laundered = v.pantry.filter(i => i._testSpoiled && (i.foodState === 'preserved' || i.foodState === 'rendered'));
  const dinnerCooked = lines.some(l => /cooked for the haven/.test(l));

  console.log('dutyPreserved=' + dutyPreserved + 'kcal  laundered=' + laundered.length + '  dinnerCooked=' + dinnerCooked);

  let fail = 0;
  const check = (name, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name); if (!cond) fail++; };

  // THE RED/GREEN ASSERTION: armed reserve (125/person) must let the drive
  // preserve the excess; pristine (250/person) keeps everything fresh.
  check('reserve lets the cook preserve the excess (dutyPreserved>=1000)', dutyPreserved >= 1000);
  // Invariants — must hold on both sides.
  check('no spoiled stack smoked onto the racks', laundered.length === 0);
  check('duty drive still cooks dinner', dinnerCooked);

  process.exit(fail ? 1 : 0);
})();
