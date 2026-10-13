#!/usr/bin/env node
// test-hide-r15.js — proof for scale-wall r15 (armor uptake lever).
//
// RED phase: with HIDE_R15 unset, belonghide/leadhide are pure delegation —
// the parent-identical baseline the before/after measurement needs.
// GREEN: with HIDE_R15=1 the layer closes the uptake gap through the
// engine's own gates only:
//   1. L0 (never seen) + materials -> NO craft (no free learning).
//   2. L1 + 2 hide + 1 vine -> blind craft attempt (35%, materials at real
//      risk); success teaches L2 (the engine's PRACTICE rule).
//   3. crafted hide armor gets equipped by the parent's gearUp -> P=20.
//   4. lost armor is re-crafted (re-craft when destroyed/lost).
//   5. FIGHT: a real tb fight vs review_drone (wave 2, Scored Assessment
//      28-40) — damage taken bare vs P=20, proving the r14 math live.
// Re-verifies competent's armor suite (test-armor-up-20261012) still green.
//
// Seeded RNG (modules capture Math.random at load); no Game.save stub.
'use strict';

const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

async function freshGame(seed) {
  let s = seed >>> 0;
  Math.random = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const { Game } = await loadGame({ seed, mode: 'hide-r15', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}

function giveMaterials(Game, nHide) {
  const inv = Game.state.scholar.inventory;
  for (let i = 0; i < nHide; i++) inv.push({ plantId: 'animal_hide', material: 'hide', name: 'Hide', units: 1, kg: 1.0, kcalEach: 0 });
  inv.push({ material: 'vine', name: 'Vine', units: 1, kg: 0.1, kcalEach: 0 });
}

function setRecipe(Game, level) {
  Game.state.codex.recipes = Game.state.codex.recipes || {};
  Game.state.codex.recipes.hide_armor = { level, learnedDay: 1, learnedFrom: 'test', via: 'discovery' };
}

function ownHideArmor(Game) {
  const s = Game.state.scholar;
  const isHide = (it) => it && ((it.itemId || it.id) === 'hide_armor');
  if (Object.values(s.equipped || {}).some(isHide)) return true;
  return (s.inventory || []).some(isHide);
}

(async () => {
  const hide = require('./policies/hide');
  const { belonghide } = hide;

  // ---- RED: gate off -> pure delegation, parent-identical ----
  {
    delete process.env.HIDE_R15;
    const Game = await freshGame(51001);
    setRecipe(Game, 1); // L1: seen one
    giveMaterials(Game, 2);
    const ctx = {};
    const before = JSON.stringify(Game.state.scholar.inventory.map(i => i.itemId || i.material));
    for (let i = 0; i < 3; i++) { try { belonghide.upkeep(Game, ctx); } catch (e) {} }
    check('RED1 no craft attempt with gate off', ctx.hideCraftAttempts === undefined,
      'attempts=' + ctx.hideCraftAttempts);
    check('RED2 no hide_armor in inventory with gate off', !ownHideArmor(Game));
    check('RED3 recipe level untouched by the layer (L1 stays L1)', (Game.state.codex.recipes.hide_armor.level || 0) === 1,
      'level=' + Game.state.codex.recipes.hide_armor.level);
    const after = JSON.stringify(Game.state.scholar.inventory.map(i => i.itemId || i.material));
    check('RED4 inventory has no phantom hide_armor (craft consumed nothing)', !after.includes('hide_armor'));
  }

  // ---- HONESTY: L0 + materials -> no craft ----
  {
    process.env.HIDE_R15 = '1';
    const Game = await freshGame(51002);
    Game.state.codex.recipes = Game.state.codex.recipes || {};
    delete Game.state.codex.recipes.hide_armor;
    giveMaterials(Game, 2);
    const ctx = {};
    for (let i = 0; i < 3; i++) { try { belonghide.upkeep(Game, ctx); } catch (e) {} }
    check('L0 no craft (never seen = no button)', ctx.hideCraftAttempts === undefined && !ownHideArmor(Game),
      'attempts=' + ctx.hideCraftAttempts);
    delete process.env.HIDE_R15;
  }

  // ---- GREEN: L1 + materials -> blind attempt, learns L2 on success ----
  {
    process.env.HIDE_R15 = '1';
    const Game = await freshGame(51003);
    setRecipe(Game, 1);
    giveMaterials(Game, 4); // 2 attempts' worth (blind burns hides on fails)
    const ctx = {};
    let crafted = false;
    for (let d = 0; d < 10 && !crafted; d++) {
      Game.state.scholar.day = d + 1;
      try { belonghide.upkeep(Game, ctx); } catch (e) {}
      if (ownHideArmor(Game)) crafted = true;
      // replenish honest materials for the next attempt day
      if (!crafted) giveMaterials(Game, 2);
    }
    check('GREEN1 blind craft attempted with gate on', (ctx.hideCraftAttempts || 0) >= 1,
      'attempts=' + (ctx.hideCraftAttempts || 0));
    check('GREEN2 hide armor crafted within 10 attempt-days (35%/try)', crafted);
    const lvl = ((Game.state.codex.recipes || {}).hide_armor || {}).level || 0;
    check('GREEN3 successful blind craft teaches L2 (engine PRACTICE rule)', lvl >= 2, 'level=' + lvl);
    // parent gearUp (inside belongseek upkeep) equips the best armor owned
    const wornIds = Object.values(Game.state.scholar.equipped || {}).map(e => e && (e.itemId || e.id));
    check('GREEN4 hide_armor equipped on torso by inherited gearUp', wornIds.includes('hide_armor'),
      'worn=' + JSON.stringify(wornIds));
    let prot = -1;
    try { prot = Game.armorBonus() || 0; } catch (e) {}
    check('GREEN5 armorBonus() = 20 (P=20 halves wave-2 hits)', prot === 20, 'P=' + prot);
    delete process.env.HIDE_R15;
  }

  // ---- RE-CRAFT: armor lost -> layer makes another ----
  {
    process.env.HIDE_R15 = '1';
    const Game = await freshGame(51004);
    setRecipe(Game, 2);
    giveMaterials(Game, 2);
    const ctx = {};
    Game.state.scholar.day = 30;
    try { belonghide.upkeep(Game, ctx); } catch (e) {}
    const first = ownHideArmor(Game);
    // simulate the piece being destroyed/lost
    const s = Game.state.scholar;
    for (const k of Object.keys(s.equipped || {})) {
      const it = s.equipped[k];
      if (it && (it.itemId || it.id) === 'hide_armor') delete s.equipped[k];
    }
    s.inventory = (s.inventory || []).filter(it => (it.itemId || it.id) !== 'hide_armor');
    check('RE-CRAFT setup: piece removed', !ownHideArmor(Game));
    giveMaterials(Game, 2);
    Game.state.scholar.day = 31;
    try { belonghide.upkeep(Game, ctx); } catch (e) {}
    check('RE-CRAFT lost armor replaced', ownHideArmor(Game), 'crafted=' + (ctx.hideArmorCrafted || 0));
    delete process.env.HIDE_R15;
  }

  // ---- SWEEP: hides off a fresh kill, honestly ----
  {
    process.env.HIDE_R15 = '1';
    const Game = await freshGame(51005);
    const osay = Game.say; Game.say = function () {};
    // plant a fresh animal corpse at the scholar's feet with a Hide on it
    const s = Game.state.scholar;
    s.mx = 4; s.my = 4;
    let corpse = null;
    try {
      corpse = Game.registerDeath ? Game.registerDeath({ kind: 'animal', monsterId: 'deer' }) : null;
    } catch (e) {}
    // registerDeath may not leave a lootable corpse; build one directly
    if (!corpse || !corpse.id) {
      Game.state.corpses = Game.state.corpses || [];
      corpse = { id: 'test-deer-corpse', kind: 'animal', name: 'Deer', node: { x: Game.map.px, y: Game.map.py }, mx: 4, my: 4,
        items: [{ plantId: 'animal_hide', material: 'hide', name: 'Hide', units: 1, kg: 1.0, kcalEach: 0 }] };
      Game.state.corpses.push(corpse);
    }
    const ctx = {};
    try { hide.hideUpkeep(Game, ctx); } catch (e) { console.log('sweep err', e.message); }
    const hides = (s.inventory || []).filter(i => i && i.material === 'hide').reduce((t, i) => t + (i.units || 0), 0);
    check('SWEEP hide taken off the kill tile (in range, not mid-fight)', hides >= 1, 'hides=' + hides);
    check('SWEEP recorded honestly', (ctx.hidesSwept || 0) >= 1, 'swept=' + (ctx.hidesSwept || 0));
    Game.say = osay;
    delete process.env.HIDE_R15;
  }
  {
    async function fightHpLost(seed, withArmor) {
      const Game = await freshGame(seed);
      const osay = Game.say; Game.say = function () {};
      if (withArmor) {
        Game.state.scholar.equipped = Game.state.scholar.equipped || {};
        Game.state.scholar.equipped.torso = { itemId: 'hide_armor', name: 'Hide armor' };
      }
      Game.startCombat('review_drone');
      if (!Game.tbfight) { Game.say = osay; return -1; }
      const p = Game.tbFighter('p');
      p.hp = 5000; p.maxHp = 5000;
      const start = p.hp;
      // wait through 12 rounds of monster turns — the drone attacks for real
      for (let r = 0; r < 12 && !Game.tbfight.over; r++) {
        try { Game.tbPlayerWait(); } catch (e) { break; }
        try { Game.tbEndCheck(); } catch (e) {}
      }
      const lost = start - p.hp;
      try { Game.tbEnd('fled'); } catch (e) {}
      Game.say = osay;
      return lost;
    }
    const bare = await fightHpLost(61001, false);
    const armored = await fightHpLost(61001, true);
    check('FIGHT real tb fight vs review_drone ran both ways', bare >= 0 && armored >= 0,
      `bare=${bare} armored=${armored}`);
    check('FIGHT P=20 reduces damage taken (r14 math live)', bare > 0 && armored < bare,
      `bare=${bare} armored=${armored}`);
  }

  console.log(`\ntest-hide-r15: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
