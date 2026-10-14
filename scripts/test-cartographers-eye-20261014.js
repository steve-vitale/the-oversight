#!/usr/bin/env node
// test-cartographers-eye-20261014.js — Cartographer's Eye reads the real
// revealed-tile count.
//
// Bug: BA.cartographerDodge called game.revealedTileCount, which never
// existed, so the dodge bonus was always 0. Revealed tiles live on
// game.map.tiles[y][x].revealed (game.reveal).
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('cartographers-eye');

(async () => {
  const Game = await K.load({ seed: 1014 });
  K.newRun(Game);
  K.openSlots(Game, 6);
  const BA = globalThis.Scattering.buildarounds;
  for (const row of Game.map.tiles) for (const t of row) t.revealed = true;
  T.ok('no bonus without the ability', BA.cartographerDodge(Game) === 0);
  K.giveAbility(Game, 'cartographers_eye');
  const n = Game.map.tiles.reduce((a, r) => a + r.filter(t => t.revealed).length, 0);
  const d = BA.cartographerDodge(Game);
  T.ok('fully revealed region gives +1% per 10 tiles', Math.abs(d - Math.min(Math.floor(n / 10) * 0.01, 0.15)) < 1e-9 && d > 0, `tiles=${n} dodge=${d}`);
  for (const row of Game.map.tiles) for (const t of row) t.revealed = false;
  T.ok('nothing revealed gives nothing', BA.cartographerDodge(Game) === 0);
  T.done();
})().catch(e => { console.error(e); process.exitCode = 2; });
