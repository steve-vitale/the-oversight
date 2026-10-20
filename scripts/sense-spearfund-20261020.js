#!/usr/bin/env node
// scripts/sense-spearfund-20261020.js — SENSE-TESTING for the spearfund loot
// leg: place a spear-bearing villager corpse next to the scholar in a live
// harness game, run the drive, and print the narration. Judges: does the
// beat read as a coherent, honest, in-fiction moment — or as a policy
// artifact? (Steve 2026-10-11 SENSE-TESTING LAW.)
//
// Usage: node scripts/sense-spearfund-20261020.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const sf = require('./policies/spearfund');

(async () => {
  process.env.SPEARFUND = '1';
  const { Game } = await loadGame({ seed: 64004, mode: 'sf-sense' });
  await setupGame(Game);
  const s = Game.state.scholar;
  const px = Game.map.px, py = Game.map.py;
  // A dead villager at the scholar's feet, spear in the pack.
  Game.state.corpses = Game.state.corpses || [];
  Game.state.corpses.push({
    id: 'sense-corpse-1', kind: 'villager', villagerId: 'dale_hoffman',
    buried: false, node: { x: px, y: py }, mx: s.mx == null ? 4 : s.mx, my: s.my == null ? 4 : s.my,
    items: [
      { itemId: 'hunting_spear', name: 'Hunting spear', units: 1, kg: 0.9 },
      { plantId: 'dried_meat', name: 'Dried meat', units: 2, kcalEach: 120 },
    ],
  });
  const lines = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (t, ...r) { try { lines.push(String(t).slice(0, 300)); } catch (e) {} return origSay(t, ...r); };
  const ctx = {};
  sf.spearfundDrive(Game, ctx);
  console.log('ctx:', JSON.stringify(ctx));
  console.log('recipe level now:', (((Game.state.codex || {}).recipes || {}).hunting_spear || {}).level);
  console.log('spear in inventory:', (s.inventory || []).some(i => i && i.itemId === 'hunting_spear'));
  console.log('corpse items left:', JSON.stringify((Game.state.corpses[0].items || []).map(i => i.itemId || i.plantId)));
  console.log('\n--- narration ---');
  for (const l of lines) console.log(l + '\n');
  delete process.env.SPEARFUND;
})().catch(e => { console.error('SENSE FAIL', e); process.exit(2); });
