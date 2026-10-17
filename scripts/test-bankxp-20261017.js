#!/usr/bin/env node
// test-bankxp-20261017.js — proof for the BANKXP craft-XP drive (sim-bankxp-b).
// RED: with BANKXP_B unset the drive is a no-op on a fully primed Game.
// GREEN: with BANKXP_B=1 the drive cooks one raw item and knaps one stone
// knife through the REAL engine verbs (cookFood/craft), crediting the
// engine's own deed caps; gates (starving / thin pantry / empty pack) refuse.
// Fixture: real loaded Game (sim-harness), state primed, no mocks.
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');
// KILLED ARM (2026-10-17): the layer this test proves was deleted zero-trace
// (sim-bankxp-b NO-GO — the drive never engaged on the courtship substrate;
// see evidence/2026-10-17/sim-bankxp-b.md). The test is retained as an
// instrument documenting the drive's proven mechanics; it exits cleanly
// when the layer is absent.
let bankxp = null;
try { bankxp = require('./policies/bankxp'); } catch (e) { bankxp = null; }

function item(o) { return Object.assign({ units: 1 }, o); }

async function primedGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'bankxp-proof', fullTelemetry: false });
  await setupGame(Game);
  const s = Game.state.scholar, v = Game.state.village;
  // fed, healthy, home
  s.kcal = Game.kcalCap(); s.hp = s.maxHp || 100;
  assert(Game.playerAtHaven(), 'fixture: scholar must start at haven');
  assert(Game.nearFire(), 'fixture: haven fire must be near');
  // secure pantry: needTrip(Game, ctx) must be false
  v.pantry = [item({ id: 'grain_store', name: 'Grain store', kcalEach: 30000 })];
  v.water = { clean: 10, dirty: 0 };
  // a kept raw supper + knapping materials in the pack
  s.inventory.push(item({ id: 'meat_test', name: 'Test meat', foodState: 'raw', needsCooking: true, rawKcal: 400, kcalEach: 0 }));
  s.inventory.push(item({ id: 'stone', name: 'Stone', material: 'stone' }));
  s.inventory.push(item({ id: 'vine', name: 'Vine', material: 'vine' }));
  // the hands know the knife (universal recipe, granted honestly)
  Game.grantKnowledge('recipe', 'stone_knife', 3);
  assert(!Game.hasCuttingTool(), 'fixture: scholar must start knifeless');
  return Game;
}
const craftXP = (Game) => (((Game.state.scholar.tracks || {}).craft) || {}).xp || 0;
const deeds = (Game) => ({
  cook: ((Game.state.scholar.deedDay || {}).cooking || {}).n || 0,
  craft: ((Game.state.scholar.deedDay || {}).crafting || 0).n || 0,
});

(async () => {
  const ARMED = process.env.BANKXP_B === '1';
  console.log('BANKXP_B=' + (process.env.BANKXP_B || '(unset)') + ' — ' + (ARMED ? 'armed assertions' : 'RED assertions'));

  if (!bankxp) {
    console.log('LAYER ABSENT (killed arm) — mechanics documented in evidence/2026-10-17/sim-bankxp-b.md; nothing to run.');
    return;
  }

  // T1: disarmed drive is a no-op on a primed game (env forced off for this case)
  {
    delete process.env.BANKXP_B;
    const Game = await primedGame(1701);
    const xp0 = craftXP(Game), n0 = Game.state.scholar.inventory.length;
    bankxp.drive(Game, {});
    const d = deeds(Game);
    assert.strictEqual(d.cook, 0, 'T1 disarmed: no cooking deed');
    assert.strictEqual(d.craft, 0, 'T1 disarmed: no crafting deed');
    assert.strictEqual(craftXP(Game), xp0, 'T1 disarmed: craft XP unchanged');
    assert.strictEqual(Game.state.scholar.inventory.length, n0, 'T1 disarmed: inventory untouched');
    console.log('T1 PASS (disarmed no-op)');
  }

  if (!ARMED) {
    // RED: the armed behavior must NOT be present yet
    const Game = await primedGame(1702);
    bankxp.drive(Game, {});
    const d = deeds(Game);
    assert.strictEqual(d.cook + d.craft, 0, 'RED: drive must not fire while disarmed');
    console.log('RED PASS — drive is inert with BANKXP_B unset (now arm it: BANKXP_B=1)');
    return;
  }
  process.env.BANKXP_B = '1'; // re-arm after T1's forced disarm

  // T2: armed drive cooks + crafts through real verbs (85% craft success —
  // retry across days; four straight 15% failures is ~0.05%)
  {
    const Game = await primedGame(1703);
    const xp0 = craftXP(Game);
    let cooked = 0, crafted = 0, tries = 0;
    while ((cooked === 0 || crafted === 0) && tries < 4) {
      Game.state.scholar.day = 1 + tries; // a fresh deed day each attempt
      bankxp.drive(Game, {});
      const d = deeds(Game);
      cooked = Math.max(cooked, d.cook); crafted = Math.max(crafted, d.craft);
      tries++;
    }
    assert.strictEqual(cooked, 1, 'T2 armed: exactly one cooking deed, got ' + cooked);
    assert(crafted >= 1, 'T2 armed: at least one crafting deed, got ' + crafted);
    assert.strictEqual(craftXP(Game) - xp0, cooked + crafted, 'T2 armed: craft XP rose by exactly the deeds');
    const tools = (Game.state.scholar.tools || []).map(t => t.recipeId || t.id);
    assert(Game.hasCuttingTool(), 'T2 armed: the knapped knife is real gear (hasCuttingTool true)');
    console.log('T2 PASS (cook+craft through real verbs, deeds=' + cooked + '+' + crafted + ', tries=' + tries + ')');
  }

  // T3: starving scholar still cooks (sustenance) but does no optional craft work
  {
    const Game = await primedGame(1704);
    Game.state.scholar.kcal = Game.kcalCap() * 0.2;
    const xp0 = craftXP(Game);
    bankxp.drive(Game, {});
    const d = deeds(Game);
    assert.strictEqual(d.cook, 1, 'T3 starving: the supper still cooks');
    assert.strictEqual(d.craft, 0, 'T3 starving: no craft deed (optional work)');
    assert.strictEqual(craftXP(Game) - xp0, 1, 'T3 starving: XP rose by the cooking deed only');
    console.log('T3 PASS (starving gate: cooks, does not craft)');
  }

  // T4: thin pantry (needTrip true) — the scholar still eats, but the food
  // run comes before optional craft work
  {
    const Game = await primedGame(1705);
    Game.state.village.pantry = [];
    const xp0 = craftXP(Game);
    bankxp.drive(Game, {});
    const d = deeds(Game);
    assert.strictEqual(d.cook, 1, 'T4 thin pantry: the supper still cooks');
    assert.strictEqual(d.craft, 0, 'T4 thin pantry: no craft deed (trip needed)');
    assert.strictEqual(craftXP(Game) - xp0, 1, 'T4 thin pantry: XP rose by the cooking deed only');
    console.log('T4 PASS (pantry-security gate: cooks, does not craft)');
  }

  // T5: nothing to work with — empty pack fires nothing
  {
    const Game = await primedGame(1706);
    Game.state.scholar.inventory = Game.state.scholar.inventory.filter(i => !(i.material || i.foodState === 'raw'));
    const xp0 = craftXP(Game);
    bankxp.drive(Game, {});
    const d = deeds(Game);
    assert.strictEqual(d.cook + d.craft, 0, 'T5 empty pack: no deeds');
    assert.strictEqual(craftXP(Game), xp0, 'T5 empty pack: XP unchanged');
    console.log('T5 PASS (no-materials gate)');
  }

  console.log('ALL GREEN — bankxp drive proven on the real engine');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
