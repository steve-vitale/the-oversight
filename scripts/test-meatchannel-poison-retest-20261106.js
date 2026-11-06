#!/usr/bin/env node
// test-meatchannel-poison-retest-20261106.js — known-poison flesh must NOT
// be re-tested by the villager experiment beat.
// PROOF (journey-landing r109, seed 1027): belltoad ("Big Big") flesh was
// tasted SIX times in one village in one month (Onni, Marcus, Anna, Elif,
// Onni again, Brian) after the Codex already knew it was poison — the
// narration promises "You will not make this mistake twice" and the beat
// makes it six times. Root cause: the three meat scans in
// villagerExperimentBeat guard only on !monsterFoodSafe(mid), and
// monsterFoodSafe is false for known-poison flesh (foodSafe=false), so a
// proven-poison mid stays a test candidate forever. Each re-test costs a
// villager 15 HP and burns the day's one experiment.
// S1/S2/S3 FAIL before the fix (beat re-tests the poison piece in the
// counter / pantry / inventory), PASS after. S4 is the positive control
// (unknown flesh still gets tested) and passes before+after.
// Stdout only; writes nothing.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require(ROOT + '/scripts/sim-harness');
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`ok   ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
function counterFlesh(mid, gross, spoilDay) {
  return { name: 'Unknown flesh', foodKind: 'meat', foodState: 'cleaned',
    plantId: 'meat_' + mid, edible: false, kcalEach: 0, hiddenKcal: gross,
    units: 2, unit: 'portion', kg: 0.4, spoilDay,
    prep: 'Unknown flesh. Test it cautiously.', diseaseRisk: 'rawMeat' };
}
(async () => {
  // S1: known-poison belltoad on the counter is NOT re-tested.
  {
    const { Game } = await loadGame({ seed: 20261108, mode: 'meat-poison-retest' });
    await setupGame(Game);
    const day = (Game.state.scholar || {}).day || 0;
    Game.state.codex.monsters = { belltoad: { foodSafe: false, foodTested: 'poison', foodTestedBy: 'Onni' } };
    Game.state.scholar.inventory = [];
    Game.state.scholar.prepStash = [counterFlesh('belltoad', 300, day + 2)];
    Game.state.village.pantry = [];
    Game.state.village.lastExperimentDay = -1;
    Game.villagerExperimentBeat(true);
    const codex = (Game.state.codex.monsters || {}).belltoad || {};
    const it = (Game.state.scholar.prepStash || [])[0];
    ok('S1 known-poison counter flesh not re-tested', Game.state.village.lastExperimentDay === -1
      && it && it.edible === false && it.prep === 'Unknown flesh. Test it cautiously.'
      && codex.foodTestedBy === 'Onni',
      `lastExp=${Game.state.village.lastExperimentDay} prep=${it && it.prep} testedBy=${codex.foodTestedBy}`);
  }
  // S2: known-poison belltoad in the pantry is NOT re-tested.
  {
    const { Game } = await loadGame({ seed: 20261109, mode: 'meat-poison-retest' });
    await setupGame(Game);
    const day = (Game.state.scholar || {}).day || 0;
    Game.state.codex.monsters = { belltoad: { foodSafe: false, foodTested: 'poison', foodTestedBy: 'Marcus' } };
    Game.state.scholar.inventory = [];
    Game.state.scholar.prepStash = [];
    Game.state.village.pantry = [counterFlesh('belltoad', 300, day + 2)];
    Game.state.village.lastExperimentDay = -1;
    Game.villagerExperimentBeat(true);
    const codex = (Game.state.codex.monsters || {}).belltoad || {};
    const it = (Game.state.village.pantry || [])[0];
    ok('S2 known-poison pantry flesh not re-tested', Game.state.village.lastExperimentDay === -1
      && it && it.edible === false && codex.foodTestedBy === 'Marcus',
      `lastExp=${Game.state.village.lastExperimentDay} testedBy=${codex.foodTestedBy}`);
  }
  // S3: known-poison belltoad in the pack is NOT re-tested.
  {
    const { Game } = await loadGame({ seed: 20261110, mode: 'meat-poison-retest' });
    await setupGame(Game);
    const day = (Game.state.scholar || {}).day || 0;
    Game.state.codex.monsters = { belltoad: { foodSafe: false, foodTested: 'poison', foodTestedBy: 'Anna' } };
    Game.state.scholar.inventory = [counterFlesh('belltoad', 300, day + 2)];
    Game.state.scholar.prepStash = [];
    Game.state.village.pantry = [];
    Game.state.village.lastExperimentDay = -1;
    Game.villagerExperimentBeat(true);
    const codex = (Game.state.codex.monsters || {}).belltoad || {};
    const it = (Game.state.scholar.inventory || [])[0];
    ok('S3 known-poison pack flesh not re-tested', Game.state.village.lastExperimentDay === -1
      && it && it.edible === false && codex.foodTestedBy === 'Anna',
      `lastExp=${Game.state.village.lastExperimentDay} testedBy=${codex.foodTestedBy}`);
  }
  // S4 (positive control): UNKNOWN belltoad flesh IS still tested.
  {
    const { Game } = await loadGame({ seed: 20261111, mode: 'meat-poison-retest' });
    await setupGame(Game);
    const day = (Game.state.scholar || {}).day || 0;
    Game.state.codex.monsters = {};
    Game.state.scholar.inventory = [];
    Game.state.scholar.prepStash = [counterFlesh('belltoad', 300, day + 2)];
    Game.state.village.pantry = [];
    Game.state.village.lastExperimentDay = -1;
    Game.villagerExperimentBeat(true);
    const codex = (Game.state.codex.monsters || {}).belltoad || {};
    ok('S4 unknown flesh still tested (control)', Game.state.village.lastExperimentDay !== -1
      && codex.foodTested === 'poison' && codex.foodSafe === false,
      `lastExp=${Game.state.village.lastExperimentDay} tested=${codex.foodTested} safe=${codex.foodSafe}`);
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF FATAL', e); process.exit(1); });
