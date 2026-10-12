#!/usr/bin/env node
// probe-deathpack-leak-20261012.js — reproduce the r10 death-pack leak flag.
// Prints the dead bearer's inventory, the corpse's items, and the successor's
// inventory side by side, with owners/bonded flags, to see what "leaked".
'use strict';
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
(async () => {
  const { Game } = await loadGame({ seed: 601, mode: 'probe-deathpack', fullTelemetry: true });
  Game.say = () => {};
  await setupGame(Game);
  await runDays(Game, competent, { days: 16 });
  const s0 = Game.state.scholar;
  const oldId = Game.villagerId;
  const dump = (it) => `${it.name || it.itemId} owner=${it.owner || '-'} bonded=${!!it.bonded} sentimental=${!!it.sentimental}`;
  console.log('BEARER INVENTORY BEFORE DEATH:');
  for (const it of (s0.inventory || [])) console.log('  ' + dump(it));
  console.log('BEARER EQUIPPED BEFORE DEATH:');
  for (const k of Object.keys(s0.equipped || {})) console.log('  [' + k + '] ' + dump(s0.equipped[k]));
  Game.playerDeath('a hushwolf');
  const s1 = Game.state.scholar;
  const corpse = (Game.corpses ? Game.corpses() : []).find(c => c.villagerId === oldId);
  console.log('CORPSE ITEMS:');
  for (const it of ((corpse && corpse.items) || [])) console.log('  ' + (it.name || it.itemId));
  console.log('SUCCESSOR INVENTORY:');
  for (const it of (s1.inventory || [])) console.log('  ' + dump(it));
  console.log('SUCCESSOR EQUIPPED:');
  for (const k of Object.keys(s1.equipped || {})) console.log('  [' + k + '] ' + dump(s1.equipped[k]));
})().catch(e => { console.error('THREW: ' + e.stack); process.exit(1); });
