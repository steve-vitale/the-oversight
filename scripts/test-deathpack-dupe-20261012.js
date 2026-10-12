#!/usr/bin/env node
// test-deathpack-dupe-20261012.js — PROOF for journey-succession r10.
//
// BLANK: the death pack deduped on itemId — a Bearer <redacted> two stone
// knives (one in hand, one in the pack) left only ONE on the corpse; the
// second was silently destroyed. The body didn't keep what it carried
// (Steve 2026-10-09 loot-as-action law).
//
// RED on pristine HEAD: two distinct stone-knife objects -> one corpse item.
// GREEN post-fix: dedupe is by object identity — two distinct copies both
// ride home; the SAME object listed twice (worn AND carried) still packs once.
//
// Usage: node scripts/test-deathpack-dupe-20261012.js
'use strict';
const { loadGame, setupGame, runDays, mulberry32 } = require('./sim-harness');
const { competent } = require('./policies/competent');

let pass = 0, fail = 0;
function check(id, ok, detail) {
  if (ok) { pass++; console.log(`  [OK] ${id}`); }
  else { fail++; console.log(`  [FAIL] ${id}${detail ? ' — ' + detail : ''}`); }
}

async function main() {
  Math.random = mulberry32(4242);
  const { Game } = await loadGame({ seed: 4242, mode: 'deathpack-dupe', fullTelemetry: false });
  Game.say = () => {};
  await setupGame(Game);
  await runDays(Game, competent, { days: 6 });

  const s0 = Game.state.scholar;
  const oldId = Game.villagerId;
  // two DISTINCT stone knives: one in the pack, one equipped
  const knifeInv = { itemId: 'stone_knife', name: 'Stone knife', units: 1, kg: 0.4, kcalEach: 0 };
  const knifeWorn = { itemId: 'stone_knife', name: 'Stone knife', units: 1, kg: 0.4, kcalEach: 0 };
  s0.inventory.push(knifeInv);
  s0.equipped = s0.equipped || {};
  s0.equipped.melee = knifeWorn;
  // a bonded keepsake: dies with them, never on the corpse
  s0.inventory.push({ itemId: 'keepsake_x', name: "Mother's ring", bonded: true, sentimental: true, units: 1, kg: 0.05, kcalEach: 0 });

  Game.playerDeath('a hushwolf');
  const corpse = (Game.corpses ? Game.corpses() : []).find(c => c.villagerId === oldId);
  check('corpse-made', !!corpse, corpse ? `corpse ${corpse.id}` : 'no corpse');
  const knives = ((corpse && corpse.items) || []).filter(i => (i.itemId || i.id) === 'stone_knife');
  check('two-knives-two-slots', knives.length === 2,
    `stone knives on corpse: ${knives.length} (want 2 — one carried, one worn)`);
  const keepsake = ((corpse && corpse.items) || []).find(i => i.itemId === 'keepsake_x');
  check('sentimental-not-lootable', !keepsake, 'bonded keepsake stays out of the death pack');

  // the legitimate dedupe: the SAME object in inventory and equipped packs once
  Math.random = mulberry32(4243);
  const g2 = await loadGame({ seed: 4243, mode: 'deathpack-dupe2', fullTelemetry: false });
  const G = g2.Game;
  G.say = () => {};
  await setupGame(G);
  await runDays(G, competent, { days: 6 });
  const t0 = G.state.scholar, tOld = G.villagerId;
  const shared = { itemId: 'stone_axe', name: 'Stone axe', units: 1, kg: 0.8, kcalEach: 0 };
  t0.inventory.push(shared);
  t0.equipped = t0.equipped || {};
  t0.equipped.melee = shared; // same object twice
  G.playerDeath('a hushwolf');
  const c2 = (G.corpses ? G.corpses() : []).find(c => c.villagerId === tOld);
  const axes = ((c2 && c2.items) || []).filter(i => (i.itemId || i.id) === 'stone_axe');
  check('same-object-packs-once', axes.length === 1,
    `stone axes on corpse: ${axes.length} (want 1 — same object, not two)`);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('THREW: ' + e.stack); process.exit(1); });
