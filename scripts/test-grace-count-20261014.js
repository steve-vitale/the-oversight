#!/usr/bin/env node
// test-grace-count-20261014.js — Battlefield Grace triggers on the heal
// count abilities.json documents: 3 heals (2 at deepening L2).
//
// Bug: the code triggered on the 2nd heal at every level, while the ability
// text says "Heal the same ally 3 times". (The free action itself is still
// unwired — grantFreeAction doesn't exist; see buildarounds.js KNOWN GAP.)
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('grace-count');

(async () => {
  const Game = await K.load({ seed: 1014 });
  K.newRun(Game);
  K.openSlots(Game, 6);
  K.giveAbility(Game, 'battlefield_grace', { level: 1 });
  K.fight(Game, 'hushwolf', { hp: 100 });
  const p = Game.tbFighter('p');
  const heal = () => { p.hp = 10; Game.addHealth(5); };
  const says = K.captureSays(Game);
  const graced = () => says.filter(l => /BATTLEFIELD GRACE/.test(l)).length;
  heal(); heal();
  T.ok('L1: no grace after 2 heals', graced() === 0, says.filter(l => /GRACE/.test(l)).join(' | '));
  heal();
  T.ok('L1: grace on the 3rd heal', graced() === 1);

  K.fight(Game, 'hushwolf', { hp: 100 });
  const ab = Game.state.scholar.abilities.find(a => a.id === 'battlefield_grace');
  ab.level = 2;
  const p2 = Game.tbFighter('p');
  const before = graced();
  p2.hp = 10; Game.addHealth(5); p2.hp = 10; Game.addHealth(5);
  T.ok('L2 deepening: grace on the 2nd heal', graced() === before + 1);
  says.restore();
  T.done();
})().catch(e => { console.error(e); process.exitCode = 2; });
