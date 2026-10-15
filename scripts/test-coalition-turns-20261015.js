#!/usr/bin/env node
// test-coalition-turns-20261015.js — coalition blades take turns.
//
// Bug (diagnosis-endgame 2026-10-15): titans.js titanInjectAllies pushed the
// coalition into tbfight.fighters AFTER startCombat built tbfight.order, and
// never added their keys to the order. The turn loop walks f.order, so every
// titan, Finale and Network blade stood still for the whole fight: 20 blades
// at the first Network mast, 0 turns, the player alone against ~4300 HP.
// (finale-campaign.js injectMonster already pushes its key; allies did not.)
//
//  1. Real path: THE NETWORK scenario, first node — every injected blade is
//     in the turn order.
//  2. After a few rounds, blades have moved or struck (they act).
//  3. Direct injection keeps working on a fight with no order (old tests).
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('coalition-turns');

(async () => {
  const Game = await K.load({ seed: 1015 });
  K.newRun(Game);
  Game.say = () => {}; Game.sysSay = () => {};
  Game.debugScenario('network');

  T.section('1. the Network: blades are in the turn order');
  const node = Game.networkNodes()[0];
  Game.startCombat(node.monster);
  const f = Game.tbfight;
  T.ok('the node fight started', !!f && !f.over);
  const allies = f ? f.fighters.filter(x => x.kind === 'ally') : [];
  const inOrder = allies.filter(a => f.order.indexOf(a.key) >= 0).length;
  T.ok('20 blades injected', allies.length === 20, 'got ' + allies.length);
  T.ok('every blade is in the turn order', inOrder === allies.length && allies.length > 0, inOrder + '/' + allies.length);

  T.section('2. blades act');
  const start = {};
  for (const a of allies) start[a.key] = a.mx + ',' + a.my + ':' + a.hp;
  const mons = f.fighters.filter(x => x.kind === 'monster');
  const monHp0 = mons.reduce((t, m) => t + (m.hp || 0), 0);
  for (let i = 0; i < 4 && Game.tbfight && !Game.tbfight.over; i++) {
    if (Game.tbIsPlayerTurn()) {
      const p = Game.tbFighter('p');
      p.moveLeft = 0; p.acted = true;
      Game.tbAfterPlayerAction();
    } else Game.tbAdvance();
  }
  const moved = allies.filter(a => (a.mx + ',' + a.my + ':' + a.hp) !== start[a.key]).length;
  const monHp1 = mons.reduce((t, m) => t + (m.hp || 0), 0);
  T.ok('blades moved or took part within 4 player turns', moved > 0, moved + ' moved');
  T.ok('the coalition hurt the node (player only waited)', monHp1 < monHp0, monHp0 + ' -> ' + monHp1);
  try { if (Game.tbfight) Game.tbEnd('fled'); } catch (e) { console.warn('cleanup', e.message); }

  T.section('3. direct injection without an order (back-compat)');
  Game.state.titans.musters.herald = { allies: [{ villageId: 'v', vid: 'b1', name: 'B1', hp: 100, outfitted: [], gearValue: 0 }], haven: [], day: 100, outfitted: {} };
  Game.tbfight = { fighters: [{ key: 'p', kind: 'player', name: 'You', hp: 200, mx: 4, my: 4, alive: true }] };
  let threw = null;
  try { Game._titanTest.titanInjectAllies('herald'); } catch (e) { threw = e.message; }
  T.ok('no throw, the blade is injected', !threw && Game.tbfight.fighters.some(x => x.kind === 'ally'), threw || '');
  Game.tbfight = null;

  T.done();
})();
