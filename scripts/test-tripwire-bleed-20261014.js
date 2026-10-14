#!/usr/bin/env node
// test-tripwire-bleed-20261014.js — Tripwire deepening 2 ("Barbed wire. The
// prone monster also bleeds.") actually applies bleed; level 1 does not.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('tripwire-bleed');
(async () => {
  const Game = await K.load({ seed: 1015 });
  for (const lvl of [1, 2]) {
    K.newRun(Game); K.openSlots(Game, 6);
    K.giveAbility(Game, 'tripwire', { level: lvl, force: true });
    const m = K.fight(Game, 'hushwolf', { hp: 500 });
    Game.tbfight._tripwireSet = true;
    const p = Game.tbFighter('p');
    try { Game.tbStepToward(m, p.mx, p.my); } catch (e) {}
    const bleeding = !!(Game.hasStatus && Game.hasStatus(m, 'bleed'));
    T.ok(`tripwire L${lvl}: monster ${lvl >= 2 ? 'bleeds' : 'does not bleed'}`, bleeding === (lvl >= 2), 'bleeding=' + bleeding);
  }
  T.done();
})().catch(e => { console.error(e); process.exitCode = 2; });
