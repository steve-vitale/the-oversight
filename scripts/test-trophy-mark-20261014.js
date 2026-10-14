#!/usr/bin/env node
// test-trophy-mark-20261014.js — Trophy Room can mark a monster after a kill,
// and the mark boosts damage against that monster's fighters.
//
// Bugs: 'trophy_room.mark' read state.codex.monsterKills, which nothing ever
// writes ("no kills recorded yet" forever). trophyMult matched the mark
// against target.monsterType || target.name; fighters carry monsterId and a
// display name (village name / descriptor), so a mark by id never matched.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('trophy-mark');

(async () => {
  const Game = await K.load({ seed: 1014 });
  K.newRun(Game);
  K.openSlots(Game, 6);
  K.giveAbility(Game, 'trophy_room');
  const s = Game.state.scholar;
  s.kcal = Math.max(s.kcal || 0, 3000);
  const impl = globalThis.AbilityActionImpls['trophy_room.mark'];
  const BA = globalThis.Scattering.buildarounds;

  // A real kill through the kill choke point.
  Game.recordWaveKill('hushwolf', s.villagerId || 'player', 'player');
  const says = K.captureSays(Game);
  const ok = impl(Game);
  says.restore();
  T.ok('mark succeeds after a kill', ok === true, says.join(' | '));
  T.ok('the killed type is marked', (s.buildaround || {}).trophyMark === 'hushwolf', JSON.stringify(s.buildaround));

  const mf = K.fight(Game, 'hushwolf');
  T.ok('fight started', !!mf);
  T.ok('marked monster takes bonus damage', BA.trophyMult(Game, mf) > 1, `mult=${BA.trophyMult(Game, mf)} id=${mf && mf.monsterId} name=${mf && mf.name}`);
  const other = { kind: 'monster', monsterId: 'belltoad', name: 'something' };
  T.ok('unmarked monster takes no bonus', BA.trophyMult(Game, other) === 1);
  T.done();
})().catch(e => { console.error(e); process.exitCode = 2; });
