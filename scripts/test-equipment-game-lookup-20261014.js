#!/usr/bin/env node
// test-equipment-game-lookup-20261014.js — equipment.js looks item defs up
// through Scattering.Game (there is no global Game). Before the fix both
// lookups saw no items: blockedSlots missed data-driven fullBody armor, and
// migrateEquipment sent every legacy weapon to melee, even a ranged one.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('equipment-game-lookup');
(async () => {
  const Game = await K.load({ seed: 1014 });
  K.newRun(Game);
  const E = globalThis.Scattering.equipment;
  // The browser has no global `Game` (every script keeps it inside an IIFE);
  // sim-harness adds one for convenience, which hides this bug. Mirror the browser.
  const harnessGame = global.Game;
  delete global.Game;

  const blocked = E.blockedSlots({ torso: { itemId: 'second_skin_suit', name: 'Second skin' } });
  T.ok('fullBody torso (second_skin_suit) blocks other body slots', blocked.length > 0, JSON.stringify(blocked));

  const person = { equipped: { weapon: { itemId: 'searcaster', name: 'Searcaster' } } };
  E.migrateEquipment(person);
  T.ok('legacy ranged weapon (searcaster, range 8) migrates to ranged',
    !!person.equipped.ranged && !person.equipped.melee, JSON.stringify(Object.keys(person.equipped)));
  global.Game = harnessGame;
  T.done();
})().catch(e => { console.error(e); process.exitCode = 2; });
