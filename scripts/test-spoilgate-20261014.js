#!/usr/bin/env node
// test-spoilgate-20261014.js — SPOILGATE arm proof (repaired by coordinator 2026-10-14).
//
// Verdict: KILLED AT PILOT. This proof documents WHY, and only claims what
// it can drive. (The previously committed version drove competentEat through
// a non-existent export — `competentEat is not a function` — so all of its
// phase claims were unverifiable. Replaced, not patched.)
//
// 1. THE CODE BLANK IS REAL (by inspection): competentEat's pantry scoring
//    loop (scripts/policies/competent.js) selects the take by foodState score
//    only — cooked/smoked/preserved/rendered = 10, raw meat = -10, else 1/2.
//    There is no spoilage term. Asserted statically on the function's source:
//    the loop must not reference isSpoiled or spoilDay.
// 2. THE EXPOSURE WINDOW IS STRUCTURALLY ZERO: the village's dawn sweep
//    sweepSpoiled() (src/js/food.js, called in the dawn path game.js:27654)
//    clears spoiled pantry stacks before the policy's upkeep runs. Plant a
//    spoiled stack + a fresh stack, run the sweep, assert the spoiled one is
//    gone and the fresh one stays.
// 3. THE INSTRUMENT IS LIVE: a short honest sim with the takeFromPantry
//    wrap records real pantry takes with 0 spoiled takes — the same
//    instrument behind the 16-run kill measurement (0/23,168 spoiled,
//    independently re-verified by the coordinator on 2 fresh 180d runs:
//    2,599 takes, 0 spoiled).
//
// Node harness: full src/js list via sim-harness (Math.random seeded before
// eval), Game.save never stubbed.
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const leadcourt = require('./policies/leadcourt').leadcourt;

(async () => {
  let fail = 0;
  const check = (name, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name); if (!cond) fail++; };

  // --- 1. static: competentEat's scoring loop has no spoilage term ---
  const src = fs.readFileSync(require('path').join(__dirname, 'policies/competent.js'), 'utf8');
  const m = src.match(/function competentEat\(Game\) \{([\s\S]*?)\n\}\n/);
  check('competentEat found in policies/competent.js', !!m);
  if (m) {
    const body = m[1];
    const hasScoreLoop = /pantry\[i\]/.test(body) && /bestScore/.test(body);
    check('competentEat scores pantry stacks by foodState (the blank under test)', hasScoreLoop);
    check('competentEat scoring loop references no isSpoiled/spoilDay (blank is real)', !/isSpoiled|spoilDay/.test(body));
  }

  // --- 2. dynamic: the dawn sweep owns the spoiled-pantry window ---
  const { Game } = await loadGame({ seed: 42, mode: 'proof-spoilgate', fullTelemetry: false });
  await setupGame(Game);
  const day = (Game.state.scholar || {}).day || 1;
  const spoiled = { name: 'Old venison', kcalEach: 300, units: 5, spoilDay: day - 1, foodKind: 'meat', foodState: 'cooked', plantId: 'meat_deer', edible: true };
  const fresh = { name: 'Dandelion greens', kcalEach: 100, units: 3, spoilDay: day + 5, foodKind: 'plant', foodState: 'raw', plantId: 'dandelion', edible: true };
  Game.state.village.pantry = [spoiled, fresh];
  check('planted pantry has 2 stacks', Game.state.village.pantry.length === 2);
  check('isSpoiled agrees the planted stack was spoiled', Game.isSpoiled(spoiled) === true);
  Game.sweepSpoiled();
  const after = Game.state.village.pantry || [];
  check('dawn sweep removes the spoiled stack', after.length === 1 && after[0].name === 'Dandelion greens');
  check('dawn sweep keeps the fresh stack', after.some(it => it.name === 'Dandelion greens'));

  // --- 3. dynamic: the take instrument is live; honest sims show 0 spoiled takes ---
  const { Game: G2 } = await loadGame({ seed: 44, mode: 'proof-spoilgate-live', fullTelemetry: false });
  await setupGame(G2);
  const W = { spoiled: 0, total: 0 };
  const oTake = G2.takeFromPantry;
  if (typeof oTake === 'function') G2.takeFromPantry = function (idx) {
    try {
      const it = ((G2.state.village || {}).pantry || [])[idx];
      if (it) { W.total++; if (G2.isSpoiled && G2.isSpoiled(it)) W.spoiled++; }
    } catch (e) {}
    return oTake.call(this, idx);
  };
  await runDays(G2, leadcourt, { days: 30, manifest: null });
  check('instrument fired: pantry takes recorded in a 30d honest sim', W.total > 0);
  check('honest sim: 0 spoiled takes (the kill measurement, mechanism level)', W.spoiled === 0);
  console.log(`  (30d leadcourt s44: takes=${W.total}, spoiled=${W.spoiled})`);

  console.log(fail === 0 ? '\nALL GREEN' : `\n${fail} FAILURES`);
  process.exit(fail === 0 ? 0 : 1);
})();
