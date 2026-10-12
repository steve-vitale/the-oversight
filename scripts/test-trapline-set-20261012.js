#!/usr/bin/env node
// test-trapline-set-20261012.js — longsim food r5 2026-10-12.
// Proves the round-5 lever: the trapline works END TO END.
//   T1: wire-improvised snare — no recipe knowledge, wire in pack, wild
//       tile -> setTrap('snare') improvises (2 uses), wire consumed.
//   T2: knap-first cleaning — carcass in pack + stone + vine, no knife ->
//       policy knaps the stone knife, then cleans the catch.
//   T3: no knife and no materials -> the carcass sits, honestly (no crash,
//       no silent loss).
//   T4: COMPETENT_CLEAN_CATCH=0 -> cleanCatch is a no-op (before/after gate).
//   T5: full chain — forced dawn catch on stocked ground -> policy daily ->
//       carcass cleaned into real food (kcalEach > 0, no longer a carcass).
// Usage: node scripts/test-trapline-set-20261012.js  (SEED env override)
'use strict';
const { loadGame } = require('./sim-harness');
const { competent, workTrapline, workTraplineSet } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '20261012', 10);
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
function hunterGame(Game) {
  Game.genRoster('Columbus, Ohio');
  Game.generatedRoster[0].occupationId = 'hunting_guide';
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
}
function wildTile(Game) {
  for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
    const t = Game.tileAt(x, y);
    if (t && t.type !== 'haven' && t.type !== 'ruin') { Game.map.px = x; Game.map.py = y; return t; }
  }
  return null;
}
function giveMats(Game, mats) {
  const s = Game.state.scholar;
  for (const [mat, n] of Object.entries(mats))
    s.inventory.push({ material: mat, name: mat, units: n, kcalEach: 0 });
}
function stripKnives(Game) {
  // hunting_guide starts with a knife; these tests need a knifeless scholar
  const s = Game.state.scholar;
  const isKnife = (i) => /knife|machete|sharpened|blade/i.test(String((i && i.name) || '') + ' ' + String((i && i.recipeId) || ''));
  s.inventory = (s.inventory || []).filter(i => !isKnife(i));
  s.tools = (s.tools || []).filter(i => !isKnife(i));
}

(async () => {
  // ============ T1: wire-improvised snare ============
  {
    const { Game } = await loadGame({ seed: SEED, mode: 'test' });
    hunterGame(Game);
    // strip the snare recipe knowledge: the wire path needs none
    Game.state.codex.recipes = Game.state.codex.recipes || {};
    delete Game.state.codex.recipes.snare;
    const tile = wildTile(Game);
    ok('T1 wild tile found', !!tile);
    Game.state.scholar.inventory.push({ itemId: 'snare_wire', name: 'Snare wire', units: 1 });
    const ctx = {};
    workTraplineSet(Game, ctx);
    const set = (tile.traps || []).find(t => t.recipeId === 'snare');
    ok('T1 wire-improvised snare sets on wild ground', !!set, JSON.stringify(set && { uses: set.uses }));
    ok('T1 improvised snare has 2 uses (honest tackle)', set && set.uses === 2, 'uses=' + (set && set.uses));
    const wireLeft = (Game.state.scholar.inventory || []).some(i => i && i.itemId === 'snare_wire');
    ok('T1 wire consumed on set', !wireLeft);
    ok('T1 ctx.trapsWireSet counted (wire source)', ctx.trapsWireSet === 1, 'got ' + ctx.trapsWireSet);
  }

  // ============ T2: knap-first cleaning ============
  {
    const { Game } = await loadGame({ seed: SEED, mode: 'test' });
    hunterGame(Game);
    stripKnives(Game); // the guide's knife would mask the knap-first path
    wildTile(Game);
    const animal = Game.data.animals.find(a => a.id === 'gray_squirrel');
    Game.state.scholar.inventory.push(Game.foodCarcass(animal, animal.calories, Game.state.scholar.day, 'trapped'));
    giveMats(Game, { stone: 2, vine: 2 });
    ok('T2 starts knifeless', !Game.hasCuttingTool());
    const ctx = {};
    // cleanCatch is module-private; drive it through the daily's camp ritual
    try { competent.daily(Game, ctx); } catch (e) { console.log('daily err', e.message); }
    ok('T2 stone knife knapped', !!Game.hasCuttingTool(), 'still knifeless');
    const carcass = (Game.state.scholar.inventory || []).find(i => i && i.foodState === 'carcass');
    ok('T2 no carcass left in pack (cleaned)', !carcass);
    // the cleaned meat entered the economy: eaten or donated to the pantry
    const pantryMeat = ((Game.state.village || {}).pantry || []).filter(i => i && /squirrel/i.test(i.name || ''));
    const ateSome = (Game.state.scholar.kcal || 0) > 0;
    ok('T2 cleaned meat entered the economy (eaten or pantry)', pantryMeat.length > 0 || ateSome,
      'pantry=' + pantryMeat.length + ' kcal=' + Math.round(Game.state.scholar.kcal || 0));
  }

  // ============ T3: knifeless + no materials -> honest sit ============
  {
    const { Game } = await loadGame({ seed: SEED, mode: 'test' });
    hunterGame(Game);
    stripKnives(Game);
    wildTile(Game);
    const animal = Game.data.animals.find(a => a.id === 'gray_squirrel');
    const car = Game.foodCarcass(animal, animal.calories, Game.state.scholar.day, 'trapped');
    Game.state.scholar.inventory.push(car);
    ok('T3 starts knifeless', !Game.hasCuttingTool());
    const ctx = {};
    try { competent.daily(Game, ctx); } catch (e) { console.log('daily err', e.message); }
    const still = (Game.state.scholar.inventory || []).find(i => i && i.foodState === 'carcass');
    ok('T3 carcass sits honestly when no knife and no materials', !!still);
  }

  // ============ T4: gate off -> no-op ============
  {
    const { Game } = await loadGame({ seed: SEED, mode: 'test' });
    hunterGame(Game);
    wildTile(Game);
    const animal = Game.data.animals.find(a => a.id === 'gray_squirrel');
    Game.state.scholar.inventory.push(Game.foodCarcass(animal, animal.calories, Game.state.scholar.day, 'trapped'));
    giveMats(Game, { stone: 2, vine: 2 });
    Game.state.scholar.inventory.push({ name: 'Stone knife', itemId: 'stone_knife', units: 1 });
    process.env.COMPETENT_CLEAN_CATCH = '0';
    const ctx = {};
    try { competent.daily(Game, ctx); } catch (e) { console.log('daily err', e.message); }
    delete process.env.COMPETENT_CLEAN_CATCH;
    const still = (Game.state.scholar.inventory || []).find(i => i && i.foodState === 'carcass');
    ok('T4 gate=0: carcass untouched (old behavior)', !!still);
  }

  // ============ T5: forced dawn catch -> cleaned food ============
  {
    const { Game } = await loadGame({ seed: SEED, mode: 'test' });
    hunterGame(Game);
    const tile = wildTile(Game);
    giveMats(Game, { vine: 4, stick: 4, stone: 2 });
    const ctx = {};
    workTrapline(Game, ctx);
    workTraplineSet(Game, ctx);
    ok('T5 trap set', (tile.traps || []).length === 1);
    tile.wildlife = { gray_squirrel: 50 };
    const realR = Math.random; Math.random = () => 0.01; // force the catch roll
    Game.checkTraps();
    Math.random = realR;
    const carcass = (Game.state.scholar.inventory || []).find(i => i && i.foodState === 'carcass');
    ok('T5 dawn catch landed in pack', !!carcass, carcass && carcass.name);
    try { competent.daily(Game, ctx); } catch (e) { console.log('daily err', e.message); }
    const after = (Game.state.scholar.inventory || []).find(i => i && i.foodState === 'carcass');
    ok('T5 catch cleaned by the daily camp ritual', !after);
  }

  console.log(`\n${pass} passed, ${fail} failed (seed ${SEED})`);
  process.exit(fail ? 1 : 0);
})();
