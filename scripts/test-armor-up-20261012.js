#!/usr/bin/env node
// test-armor-up-20261012.js — proof for longsim combat r6 (armor competence).
// The competent policy's gearUp:
//   A. equips the BEST armor owned (old code: first armor-def item in
//      inventory order, only when every armor slot was empty — sims caught
//      a P=2 flannel worn over a P=10 bark armor sitting in the pack).
//   B. crafts bark armor when the recipe is known and bark 3 + vine 2 are
//      on hand (craft() enforces the knowledge gate itself).
// Run twice: COMPETENT_CRAFT_ARMOR=0 (legacy path) must FAIL A and B — the
// RED baseline proving the blanks; default env must PASS both.
// Seeded RNG (modules capture Math.random at load); no Game.save stub.
'use strict';

const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

async function freshGame(seed) {
  // Seed BEFORE eval: modules capture Math.random at load time.
  let s = seed >>> 0;
  const rng = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  Math.random = rng;
  const { Game } = await loadGame({ seed, mode: 'competent', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}

function wornProt(Game) {
  try { return Game.armorBonus() || 0; } catch (e) { return -1; }
}

(async () => {
  const { competent } = require('./policies/competent');
  const legacy = process.env.COMPETENT_CRAFT_ARMOR === '0';
  console.log('mode: ' + (legacy ? 'LEGACY (expect RED)' : 'NEW (expect GREEN)'));

  // ---- A. best-armor upgrade ----
  {
    const Game = await freshGame(424242);
    const s = Game.state.scholar;
    s.equipped = s.equipped || {};
    s.equipped.torso = { itemId: 'flannel_shirt', name: 'Flannel shirt' }; // P=2
    s.inventory = s.inventory || [];
    s.inventory.push({ itemId: 'bark_armor', name: 'Bark armor', units: 1 }); // P=10
    const before = wornProt(Game);
    try { competent.upkeep(Game, {}); } catch (e) {}
    const after = wornProt(Game);
    const wornIds = Object.values(s.equipped || {}).map(e => e && (e.itemId || e.id));
    check('A1 wears bark_armor after upkeep (was flannel P=2)', wornIds.includes('bark_armor'),
      'worn=' + JSON.stringify(wornIds) + ' prot ' + before + '->' + after);
    check('A2 protection rose (2 -> 10+)', after >= 10, 'prot=' + after);
  }

  // ---- B. craft bark armor when known + materials ----
  {
    const Game = await freshGame(777001);
    const s = Game.state.scholar;
    s.equipped = {};
    s.inventory = [
      { name: 'bark strips', material: 'bark', units: 12 },
      { name: 'vines', material: 'vine', units: 12 },
    ];
    try { Game.learnRecipe('bark_armor', 3); } catch (e) {}
    let crafted = false;
    for (let i = 0; i < 6 && !crafted; i++) {
      try { competent.upkeep(Game, {}); } catch (e) {}
      crafted = (s.inventory || []).some(it => (it.itemId || it.id) === 'bark_armor') ||
        Object.values(s.equipped || {}).some(e => e && (e.itemId || e.id) === 'bark_armor');
    }
    const wornIds = Object.values(s.equipped || {}).map(e => e && (e.itemId || e.id));
    check('B1 bark armor crafted and/or worn within 6 upkeeps (L3, 85%/try)', crafted,
      'inv=' + JSON.stringify((s.inventory || []).map(i => i.itemId || i.id)));
    check('B2 bark armor is worn (prot >= 10)', wornIds.includes('bark_armor') && wornProt(Game) >= 10,
      'worn=' + JSON.stringify(wornIds) + ' prot=' + wornProt(Game));
  }

  // ---- C. no regression: no materials, no recipe -> no phantom craft ----
  {
    const Game = await freshGame(31337);
    const s = Game.state.scholar;
    s.equipped = {};
    s.inventory = [];
    try { competent.upkeep(Game, {}); } catch (e) {}
    const hasArmor = (s.inventory || []).concat(Object.values(s.equipped || {}))
      .some(it => it && (it.itemId || it.id) === 'bark_armor');
    check('C1 knifeless/material-less sits honestly (no bark armor conjured)', !hasArmor);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
