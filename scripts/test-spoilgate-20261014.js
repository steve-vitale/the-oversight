#!/usr/bin/env node
// test-spoilgate-20261014.js — SPOILGATE arm proof test.
//
// FINDING #89 (sim-findings.md): competentEat scores pantry stacks by
// foodState only, never spoilage — a spoiled stack can be the BEST-scoring
// option (cooked = 10) and get taken-and-attempted silently.
//
// Phase A (RED on pristine / gate OFF): pantry = one spoiled cooked-meat
// stack (score 10, spoilDay = day-1) + one fresh raw plant (score 2).
// Base behavior takes the spoiled stack first — spoiledTakes >= 1 -> FAIL
// the "no spoiled takes" assertion, demonstrating the blank on pristine.
// Phase B (GREEN, SPOILGATE=1): same pantry. The gate skips the spoiled
// stack, the scholar eats the fresh option honestly, and when nothing but
// spoiled food remains the honest beat fires ("You leave the off ...").
//   spoiledTakes == 0 -> PASS; beat fired -> PASS.
// Phase C (gate OFF again, beat-silence check): no beat text when the gate
// is off — the layer is truly opt-in.
// Invariant: the scholar still eats fresh food (no starvation regression at
// the mechanism level).
//
// Node harness: full src/js list via sim-harness (Math.random seeded before
// eval), Game.save never stubbed. The gate reads process.env.SPOILGATE at
// call time, so both phases run in one process; the RED phase runs with the
// gate disabled, which is byte-identical behavior to pristine.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const { competentEat } = require('./policies/competent');

function spoiledMeat(day) {
  return { name: 'Old venison', kcalEach: 300, units: 5, spoilDay: day - 1,
    foodKind: 'meat', foodState: 'cooked', plantId: 'meat_deer',
    edible: true, safe: true, kg: 0.3, unit: 'portion' };
}
function freshPlant(day) {
  return { name: 'Dandelion greens', kcalEach: 100, units: 3, spoilDay: day + 5,
    foodKind: 'plant', foodState: 'raw', plantId: 'dandelion',
    edible: true, safe: true, kg: 0.2, unit: 'handful' };
}

function scenario(Game, day) {
  const s = Game.state.scholar, v = Game.state.village;
  s.kcal = 0; s.health = 100; s.inventory = [];
  v.pantry = [spoiledMeat(day), freshPlant(day)];
}

function drive(Game) {
  const lines = [];
  const origSay = Game.say;
  Game.say = (t) => { lines.push(String(t)); };
  const takes = { spoiled: 0, total: 0 };
  const origTake = Game.takeFromPantry;
  Game.takeFromPantry = function (idx) {
    const pantry = (Game.state.village || {}).pantry || [];
    const it = pantry[idx];
    if (it) {
      takes.total++;
      try { if (Game.isSpoiled && Game.isSpoiled(it)) takes.spoiled++; } catch (e) {}
    }
    return origTake.call(this, idx);
  };
  try { competentEat(Game); } catch (e) { console.log('competentEat threw: ' + e.message); }
  Game.say = origSay;
  Game.takeFromPantry = origTake;
  return { lines, takes, kcal: Game.state.scholar.kcal, health: Game.state.scholar.health };
}

(async () => {
  const { Game } = await loadGame({ seed: 42, mode: 'proof-spoilgate', fullTelemetry: false });
  await setupGame(Game);
  const day = (Game.state.scholar || {}).day || 1;
  const cap = Game.kcalCap();
  let fail = 0;
  const check = (name, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name); if (!cond) fail++; };

  // Phase A: RED — gate OFF. Base takes the spoiled stack (score 10 wins).
  delete process.env.SPOILGATE;
  delete Game._spoilgateBeatDay;
  scenario(Game, day);
  const A = drive(Game);
  console.log(`PhaseA(gate OFF): spoiledTakes=${A.takes.spoiled}/${A.takes.total} kcal=${A.kcal} health=${A.health}`);
  check('PhaseA RED: base takes the spoiled stack (spoiledTakes >= 1)', A.takes.spoiled >= 1);
  check('PhaseA RED: no honest beat when gate is off',
    !A.lines.some(l => /You leave the off/.test(l)));

  // Phase B: GREEN — gate ON. Spoiled stack skipped, fresh eaten, beat fires.
  process.env.SPOILGATE = '1';
  delete Game._spoilgateBeatDay;
  scenario(Game, day);
  const B = drive(Game);
  console.log(`PhaseB(gate ON): spoiledTakes=${B.takes.spoiled}/${B.takes.total} kcal=${B.kcal} health=${B.health}`);
  check('PhaseB GREEN: no spoiled stack taken (spoiledTakes == 0)', B.takes.spoiled === 0);
  check('PhaseB GREEN: honest beat fired', B.lines.some(l => /You leave the off Old venison/.test(l)));
  check('PhaseB: scholar still eats the fresh option (kcal > 0)', B.kcal > 0);
  check('PhaseB: no health loss from spoiled food', B.health === 100);

  // Phase C: gate OFF again — beat must not fire (opt-in truly off).
  delete process.env.SPOILGATE;
  delete Game._spoilgateBeatDay;
  scenario(Game, day);
  // pantry = ONLY the spoiled stack: base loops takes until guard exhausts
  Game.state.village.pantry = [spoiledMeat(day)];
  const C = drive(Game);
  console.log(`PhaseC(gate OFF, spoiled-only pantry): spoiledTakes=${C.takes.spoiled}/${C.takes.total} beat=${C.lines.some(l => /You leave the off/.test(l))}`);
  check('PhaseC: no beat with gate off even when only spoiled food remains',
    !C.lines.some(l => /You leave the off/.test(l)));

  // Phase D: gate ON, spoiled-only pantry — beat fires, scholar goes hungry honestly.
  process.env.SPOILGATE = '1';
  delete Game._spoilgateBeatDay;
  const s = Game.state.scholar;
  s.kcal = 0; s.health = 100; s.inventory = [];
  Game.state.village.pantry = [spoiledMeat(day)];
  const D = drive(Game);
  console.log(`PhaseD(gate ON, spoiled-only pantry): spoiledTakes=${D.takes.spoiled}/${D.takes.total} kcal=${D.kcal}`);
  check('PhaseD: no spoiled take when it is the only option', D.takes.spoiled === 0);
  check('PhaseD: honest beat fired (goes hungry honestly)',
    D.lines.some(l => /You leave the off Old venison\. They'd cost you more than they'd feed\./.test(l)));
  check('PhaseD: scholar goes hungry (kcal == 0)', D.kcal === 0);

  delete process.env.SPOILGATE;
  console.log(fail === 0 ? '\nALL GREEN' : `\n${fail} FAILURES`);
  process.exit(fail ? 1 : 0);
})();
