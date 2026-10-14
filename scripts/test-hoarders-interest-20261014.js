#!/usr/bin/env node
// test-hoarders-interest-20261014.js — Hoarder's Interest actually pays, and
// the Trophy Room mark resets daily for everyone.
//
// Bug: BA.onDayTick called game.addPantryKcal (doesn't exist; the throw was
// swallowed) and then narrated "your stores earned N kcal" anyway. The daily
// trophy-mark reset lived inside that hoarders_interest-guarded tick, so a
// Trophy Room player without Hoarder's Interest kept the mark forever.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('hoarders-interest');

(async () => {
  const Game = await K.load({ seed: 1014 });
  K.newRun(Game);
  K.openSlots(Game, 6);
  const BA = globalThis.Scattering.buildarounds;
  const v = Game.state.village;
  v.pantry = [];
  Game.stockPantry(2000, 'Test grain');
  const before = Game.pantryKcal();
  K.giveAbility(Game, 'hoarders_interest');
  const says = K.captureSays(Game);
  BA.onDayTick(Game);
  says.restore();
  const after = Game.pantryKcal();
  T.ok('pantry grows overnight with Hoarder\'s Interest', after > before, `${before} -> ${after}`);
  const line = says.find(l => /HOARDER'S INTEREST/.test(l)) || '';
  const n = Number((line.match(/earned (\d+) kcal/) || [])[1] || -1);
  T.ok('the narrated amount is what actually arrived', n === after - before, `said ${n}, got ${after - before}`);

  // Full pantry: no phantom interest.
  const cap = Game.pantryCapKcal();
  v.pantry = [];
  Game.stockPantry(cap, 'Full bins');
  const full = Game.pantryKcal();
  BA.onDayTick(Game);
  T.ok('a full pantry earns nothing past its cap', Game.pantryKcal() <= Math.max(cap, full), `${full} -> ${Game.pantryKcal()} (cap ${cap})`);

  // Trophy Room without Hoarder's Interest: mark resets at day tick.
  K.newRun(Game);
  K.openSlots(Game, 6);
  K.giveAbility(Game, 'trophy_room');
  const s = Game.state.scholar;
  s.buildaround = { trophyMark: 'hushwolf' };
  BA.onDayTick(Game);
  T.ok('trophy mark resets daily without Hoarder\'s Interest', !s.buildaround.trophyMark, JSON.stringify(s.buildaround));
  T.done();
})().catch(e => { console.error(e); process.exitCode = 2; });
