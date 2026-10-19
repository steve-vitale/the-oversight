#!/usr/bin/env node
// test-palisade-sleep-20261015.js — the Palisade's promise, "the watch holds
// at night (sleep is never interrupted)" (havenGrowth.js tier 2), must hold
// against raiders already pinned to the Haven tile
// (evidence/2026-10-15/diagnosis-deaths.md).
//
// The bug: havenRaidTick pins raiders (and lingering gorgers) to the Haven
// tile. During sleep(), tickAction -> monsterTurn let a raider on the
// player's tile walk up and startCombat: 5 of 99 bearer combat deaths on 32
// seeds were bearers killed in their sleep at Haven with the palisade up.
// The fix: while the bearer sleeps at Haven behind a palisade, the monster
// on the tile takes no turn. Without a palisade, a raider can still reach a
// sleeper (the raid's own design), and awake bearers still meet it.
'use strict';
const K = require('./lib');

const T = K.reporter('test-palisade-sleep-20261015');

function setup(Game, tier, sleeping) {
  K.newRun(Game);
  Game.map.px = 4; Game.map.py = 4;
  const s = Game.state.scholar;
  s.mx = 4; s.my = 4;
  Game.state.village.havenTier = tier;
  // a hungry raider pinned to Haven, one step from the bearer
  const m = Game.spawnWorldMonster({ id: 'hushwolf' }, 4, 4, { mx: 4, my: 5 });
  m.stance = 'hungry';
  Game._sleeping = sleeping ? { quality: 'bed' } : null;
  let started = 0;
  const real = Game.startCombat;
  Game.startCombat = function () { started++; return real.apply(this, arguments); };
  try { for (let i = 0; i < 3 && !started; i++) Game.monsterTurn(); } finally { Game.startCombat = real; Game._sleeping = null; }
  if (Game.tbfight && !Game.tbfight.over) Game.tbEnd('fled');
  return started;
}

(async () => {
  const Game = await K.load({ seed: Number(process.env.SEED || 7) });
  K.newRun(Game);
  T.ok('fixture: Haven is a safe tile', Game.isSafeTile(4, 4));
  T.ok('asleep behind the palisade: the raider takes no turn', setup(Game, 2, true) === 0);
  T.ok('asleep, no palisade: the raider still reaches the sleeper', setup(Game, 0, true) >= 1);
  T.ok('awake behind the palisade: the raider still engages', setup(Game, 2, false) >= 1);
  T.done();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
