#!/usr/bin/env node
// test-counterbtn-20261102.js — player counter-test button proof.
// BEFORE (HEAD app.js): stashActionsHtml offers no test action for counter
// flesh, and no wiring passes the prep stash to testMonsterMeat — so a
// player holding unknown counter flesh has no way to test it on the
// counter (takePrepFood refuses it: it is not finished food; cooking it
// does not teach). AFTER: the counter row offers "Test cautiously" for
// exactly the flesh the villager beat tests (cleaned-or-cooked monster
// flesh, still unknown), wired to testMonsterMeat(idx, prepStash).
//
// app.js is DOM-only and is NOT loaded by the node harness, so the UI
// half of the proof reads src/js/app.js text (button + wiring present,
// guarded exactly like the villager counter scan). The engine half runs
// the wired call itself — Game.testMonsterMeat(idx, Game.prepStash()) —
// on identical seeds for a safe monster and a toxic one, and checks the
// outcome family matches the villager beat's (villagerExperimentBeat
// on the same setup): safe -> foodSafe + revealed edible flesh;
// toxic -> foodTested 'poison', foodSafe false, poison label, a real cost.
// Stdout only; writes nothing.
'use strict';
const fs = require('fs');
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
  // --- UI half: the button + wiring in app.js ---
  const app = fs.readFileSync(path.join(ROOT, 'src/js/app.js'), 'utf8');
  // The button must live in stashActionsHtml (the counter row), not just
  // anywhere in the file: slice from its definition to the next top-level
  // function after it (renderBuildIndicator).
  const start = app.indexOf('function stashActionsHtml');
  const end = app.indexOf('function renderBuildIndicator', start);
  const row = (start >= 0 && end > start) ? app.slice(start, end) : '';
  ok('UI counter row offers a test button', row.includes('data-stash-meattest'),
    'no data-stash-meattest in stashActionsHtml');
  ok('UI button guarded like villager counter scan (cleaned/cooked + gated + unknown)',
    /foodState === 'cleaned'/.test(row) && row.includes('data-stash-meattest')
      && row.includes('monsterMeatGated') && row.includes('monsterFoodSafe'),
    'guard incomplete');
  ok('UI button excludes raw carcass / non-monster flesh (guard requires cleaned|cooked + gated)',
    row.includes("foodState === 'cooked'") && row.includes('monsterMeatGated'),
    'cooked/gated guard missing');
  ok('UI wiring passes the prep stash to testMonsterMeat',
    app.includes('data-stash-meattest') && /testMonsterMeat\(\+b\.dataset\.stashMeattest,\s*stashOf\(\)\)/.test(app),
    'no testMonsterMeat(idx, stashOf()) wiring');
  // A raw deer carcass on the counter must NOT qualify under the guard:
  // the guard is evaluated here in miniature (same conditions as the row).
  const deer = { foodKind: 'meat', foodState: 'carcass', edible: false, plantId: 'meat_deer' };
  const { Game: G0 } = await loadGame({ seed: 20261102, mode: 'counterbtn' });
  await setupGame(G0);
  const deerQualifies = deer.foodKind === 'meat' && deer.edible === false
    && (deer.foodState === 'cleaned' || deer.foodState === 'cooked')
    && G0.monsterMeatGated(String(deer.plantId).replace(/^meat_/, ''));
  ok('UI guard excludes raw animal carcass', !deerQualifies,
    'deer carcass would qualify');

  // --- Engine half, identical seeds: player test on the counter ---
  // C1: safe monster flesh (hushwolf), player path.
  {
    const { Game } = await loadGame({ seed: 20261110, mode: 'counterbtn' });
    await setupGame(Game);
    const day = (Game.state.scholar || {}).day || 0;
    Game.state.codex.monsters = {};
    Game.state.scholar.inventory = [];
    Game.state.scholar.prepStash = [counterFlesh('hushwolf', 1400, day + 2)];
    const before = Game.monsterFoodSafe('hushwolf');
    const ret = Game.testMonsterMeat(0, Game.prepStash());
    const it = (Game.state.scholar.prepStash || [])[0];
    ok('C1 player test on counter flesh marks it food (safe monster)',
      !before && Game.monsterFoodSafe('hushwolf') && !!ret,
      `safe=${Game.monsterFoodSafe('hushwolf')} ret=${!!ret}`);
    ok('C1 revealed counter flesh is edible with real calories',
      it && it.edible === true && (it.kcalEach || 0) > 0,
      it ? `edible=${it.edible} kcalEach=${it.kcalEach}` : 'item gone');
    // After the reveal the flesh is edible but still 'cleaned' — the cook
    // decision remains (test -> cook -> pack is the designed channel, and
    // cooking alone never teaches). What the test changes is the guard:
    // monsterFoodSafe is now true, so the button correctly disappears.
    ok('C1 after testing, the test button guard closes (already known)',
      (() => { try {
        const mid = String(it.plantId || '').replace(/^meat_/, '');
        return !(it.foodKind === 'meat' && it.edible === false
          && (it.foodState === 'cleaned' || it.foodState === 'cooked')
          && mid && Game.monsterMeatGated(mid) && !Game.monsterFoodSafe(mid));
      } catch (e) { return false; } })(),
      'button would still offer a test for known flesh');
  }
  // C2: same setup, villager beat — the outcome family to match.
  {
    const { Game } = await loadGame({ seed: 20261110, mode: 'counterbtn' });
    await setupGame(Game);
    const day = (Game.state.scholar || {}).day || 0;
    Game.state.codex.monsters = {};
    Game.state.scholar.inventory = [];
    Game.state.scholar.prepStash = [counterFlesh('hushwolf', 1400, day + 2)];
    Game.state.village.pantry = [];
    Game.state.village.lastExperimentDay = -1;
    Game.villagerExperimentBeat(true);
    const it = (Game.state.scholar.prepStash || [])[0];
    ok('C2 villager beat on same setup marks it food too (parity family)',
      Game.monsterFoodSafe('hushwolf') && it && it.edible === true,
      `safe=${Game.monsterFoodSafe('hushwolf')} edible=${it && it.edible}`);
  }
  // C3: toxic monster flesh (belltoad), player path — honest risk.
  {
    const { Game } = await loadGame({ seed: 20261111, mode: 'counterbtn' });
    await setupGame(Game);
    const day = (Game.state.scholar || {}).day || 0;
    Game.state.codex.monsters = {};
    Game.state.scholar.inventory = [];
    Game.state.scholar.prepStash = [counterFlesh('belltoad', 300, day + 2)];
    const e0 = (Game.state.scholar || {}).energy;
    const ret = Game.testMonsterMeat(0, Game.prepStash());
    const codex = (Game.state.codex.monsters || {}).belltoad || {};
    const it = (Game.state.scholar.prepStash || [])[0];
    const e1 = (Game.state.scholar || {}).energy;
    ok('C3 player test on toxic counter flesh marks poison, not food',
      codex.foodTested === 'poison' && codex.foodSafe === false && ret === null,
      `tested=${codex.foodTested} safe=${codex.foodSafe} ret=${ret}`);
    ok('C3 poison flesh is labelled poison on the counter',
      it && String(it.prep || '').indexOf('POISON') >= 0,
      it ? `prep=${it.prep}` : 'item gone');
    ok('C3 toxic test costs the player (energy drops, same as pack test)',
      typeof e0 === 'number' && typeof e1 === 'number' && e1 < e0,
      `energy ${e0} -> ${e1}`);
    ok('C3 poison flesh stays inedible (never becomes packable food)',
      it && it.edible === false,
      it ? `edible=${it.edible}` : 'item gone');
  }
  // C4: before-behaviour guard — takePrepFood refuses unknown counter flesh.
  {
    const { Game } = await loadGame({ seed: 20261112, mode: 'counterbtn' });
    await setupGame(Game);
    const day = (Game.state.scholar || {}).day || 0;
    Game.state.codex.monsters = {};
    Game.state.scholar.prepStash = [counterFlesh('hushwolf', 1400, day + 2)];
    let refused = false;
    try { const r = Game.takePrepFood(0); refused = !!(r && !r.ok); } catch (e) { refused = true; }
    ok('C4 takePrepFood still refuses unknown counter flesh (the gap the button closes)',
      refused, 'unknown flesh packable without testing');
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('ERROR', e && e.stack || e); process.exit(2); });
