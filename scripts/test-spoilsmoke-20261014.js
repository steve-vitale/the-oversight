#!/usr/bin/env node
// test-spoilsmoke-20261014.js — SPOILSMOKE arm proof test.
//
// ARM 1 (food economy): the duty-time cook drive's eligible loop filters
//   `if (sd - day > 2) continue;` — which lets `sd < day` (already spoiled)
//   through. convert() then resets spoilDay and marks the stack safe=true:
//   rot laundered onto the racks. Canon (PRESERVATION.md): "Rot can't be
//   smoked back into food."
//
// Phase A (RED on pristine): pantry = one 4,000 kcal spoiled stack (sd=day-1),
//   bigger than the duty reserve (250 kcal/person x 12 = 3,000) so the split
//   path must fire. Pristine smokes the overflow -> laundered >= 1 -> FAIL.
//   Fixed: the stack is excluded -> laundered == 0 -> PASS.
// Phase B (legit flow, must hold BOTH sides): pantry = one 4,000 kcal
//   about-to-rot stack (sd=day+1). dutyPreserved >= 500 on pristine AND fixed —
//   the exclusion must not kill the legitimate 0..2-day about-to-rot flow.
// Invariant: the cook narration still fires ("cooked for the haven").
// Node harness: full src/js list in index.html order, Math.random seeded
// before eval (sim-harness), Game.save never stubbed.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

function stack(name, day, sdOffset, units, kcalEach, tag) {
  const s = { name, kcalEach, units, spoilDay: day + sdOffset, foodKind: 'meat',
    foodState: 'fresh', safe: false, diseaseRisk: 0.1, kg: 0.2, unit: 'portion' };
  if (tag) s._testSpoiled = true;
  return s;
}

function runCookDuty(Game) {
  const v = Game.state.village;
  const vid = (v.roster || [])[0];
  const lines = [];
  Game.say = (s) => { lines.push(String(s)); };
  const presKcal = () => (v.pantry || [])
    .filter(i => i.foodState === 'preserved' || i.foodState === 'rendered')
    .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  const before = presKcal();
  Game.resolveOneAssignment(vid, { task: 'cook' });
  const after = presKcal();
  const laundered = (v.pantry || [])
    .filter(i => i._testSpoiled && (i.foodState === 'preserved' || i.foodState === 'rendered')).length;
  const dinnerCooked = lines.some(l => /cooked for the haven/.test(l));
  return { dutyPreserved: after - before, laundered, dinnerCooked,
           roster: (v.roster || []).length };
}

(async () => {
  const { Game } = await loadGame({ seed: 42, mode: 'proof-spoilsmoke', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village;
  const day = (Game.state.scholar || {}).day || 1;

  let fail = 0;
  const check = (name, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name); if (!cond) fail++; };

  // Phase A: spoiled stack (4,000 kcal > 3,000 reserve -> partial split).
  v.pantry = [];
  v.pantry.push(stack('Old fish', day, -1, 40, 100, true));
  const A = runCookDuty(Game);
  console.log(`PhaseA roster=${A.roster} dutyPreserved=${A.dutyPreserved}kcal laundered=${A.laundered} dinnerCooked=${A.dinnerCooked}`);
  check('PhaseA: no spoiled stack smoked onto the racks (laundered==0)', A.laundered === 0);
  check('PhaseA: duty drive still cooks dinner', A.dinnerCooked);

  // Phase B: about-to-rot stack (sd=day+1) — legit flow must survive the fix.
  v.pantry = [];
  v.pantry.push(stack('Deer meat', day, 1, 40, 100, false));
  const B = runCookDuty(Game);
  console.log(`PhaseB roster=${B.roster} dutyPreserved=${B.dutyPreserved}kcal laundered=${B.laundered} dinnerCooked=${B.dinnerCooked}`);
  check('PhaseB: about-to-rot stack still hits the racks (dutyPreserved>=500)', B.dutyPreserved >= 500);
  check('PhaseB: duty drive still cooks dinner', B.dinnerCooked);

  process.exit(fail ? 1 : 0);
})();
