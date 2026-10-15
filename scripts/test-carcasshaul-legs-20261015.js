#!/usr/bin/env node
// PROOF TEST (sim-carcasshaul 2026-10-15) — belltoad legs on expedition kills.
//
// BUG: mapmemNoteKill used the singular monsterMeatEntry, so an expedition
// belltoad kill left only the poisonous body — the safe legs (2/3 of the
// gross, Steve 2026-10-13) vanished. The patrol path (game.js:6650) already
// used the plural monsterCarcassEntries. This test proves the expedition
// path now matches.
//
// RED: with the old code, the expedition corpse holds 1 meat item (body
// only, no legs). GREEN: with the fix, it holds body + legs as separate
// items, with the honest 1/3–2/3 kcal split (no energy created).
//
// Run RED via: git stash-free patch flow (see evidence file).
// Node harness: sim-harness seeds Math.random BEFORE eval. Never stubs Game.save.
'use strict';
const assert = require('assert');

async function main() {
  const { loadGame, setupGame } = require('./sim-harness');
  const { Game } = await loadGame({ seed: 20261015, mode: 'carcasshaul-legs-proof' });
  await setupGame(Game);

  const v = Game.state.village;
  const vid = (v.roster || []).find(id => id !== Game.villagerId);
  assert(vid, 'need a villager');

  // a belltoad entity as the expedition encounter would hand it over
  const mdef = (Game.data.monsters || []).find(m => m.id === 'belltoad');
  assert(mdef && mdef.edible, 'need an edible belltoad def');
  const gross = mdef.edible.calories;
  assert(gross > 0, 'belltoad must have positive gross kcal');

  // the expedition encounter hands over the mdef itself (villager-agency.js:
  // m comes from monsterWavePool()/data.monsters — it carries .edible)
  const m = mdef;
  const node = { nx: 4, ny: 4 };
  const site = Game.mapmemNoteKill(vid, m, node);
  assert(site, 'mapmemNoteKill must return a remembered site');

  const corpses = Game.corpses().filter(c => c.id === site.ref);
  assert(corpses.length === 1, 'the expedition kill must leave exactly one real corpse');
  const corpse = corpses[0];
  const meats = (corpse.items || []).filter(it => it && it.foodKind === 'meat' && it.foodState === 'carcass');
  console.log('meat items on the expedition corpse:', meats.map(it => `${it.plantId} (${it.hiddenKcal} kcal)`).join(', '));

  const legs = meats.find(it => it.plantId === 'meat_belltoad_legs');
  const body = meats.find(it => it.plantId === 'meat_belltoad');
  assert(legs, 'GREEN: the legs must drop as a separate item');
  assert(body, 'GREEN: the body must still be there');
  const total = (legs.hiddenKcal || 0) + (body.hiddenKcal || 0);
  assert(total === gross, `GREEN: no energy created or lost (${total} vs gross ${gross})`);
  assert(legs.hiddenKcal === Math.round(gross * 2 / 3), 'GREEN: legs carry 2/3 of gross');
  assert(legs.spoilDay === body.spoilDay, 'GREEN: legs share the body\'s spoil clock');

  // the remembered site still estimates honestly
  assert(site.estKcal > 0, 'site estimates kcal');
  console.log(`\nAll belltoad-legs proof checks passed (gross ${gross} -> legs ${legs.hiddenKcal} + body ${body.hiddenKcal}).`);
}

main().then(() => process.exit(0)).catch(e => {
  console.error('PROOF FAILED:', e.message);
  process.exit(1);
});
