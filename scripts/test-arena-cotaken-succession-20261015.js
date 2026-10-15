#!/usr/bin/env node
// test-arena-cotaken-succession-20261015.js — a bearer who dies in a Blood
// arena must not hand the mantle to a co-taken contestant whose own fate is
// still unresolved (evidence/2026-10-15/diagnosis-deaths.md).
//
// The bug: tbEnd('lost') in the arena ran playerDeath first; the mantle
// passed (sometimes to a villager taken into the same contest); THEN
// _contestArenaAfter resolved the co-taken fates through the villager
// engine, which killed the brand-new bearer in the same beat (hurtVillager
// -> playerDeath('contest')). Two bearer deaths in one tick; the successor
// never got a turn. Seen 1-2x per 16 seeds (seed 1 d41, seed 5 d58).
// The fix: resolve the co-taken fates before the mantle passes.
'use strict';
const K = require('./godpath/lib');

const T = K.reporter('test-arena-cotaken-succession-20261015');

(async () => {
  const Game = await K.load({ seed: 7 });
  K.newRun(Game);
  const v = Game.state.village;
  const bearer = Game.villagerId;
  const co = (v.roster || []).find(id => id !== bearer);
  T.ok('fixture: a second villager exists', !!co, JSON.stringify(v.roster));
  v.roster = [bearer, co]; // the co-taken contestant is the only possible successor

  // the co-taken contestant's off-screen arena goes badly (fixture: died)
  const realResolve = Game.contestResolveVillager;
  // (as contestEngine's blood fight does: real wounds through hurtVillager)
  Game.contestResolveVillager = function (pid) { this.hurtVillager(pid, 500, 'contest'); return { outcome: 'died', detail: 'the beast', log: [] }; };
  const deaths = [];
  const realDeath = Game.playerDeath;
  Game.playerDeath = function (cause) { deaths.push({ cause, bearer: Game.villagerId }); return realDeath.apply(this, arguments); };

  try {
    K.fight(Game, 'hushwolf', { px: 4, py: 4, mx: 5, my: 4, hp: 100, party: true });
    Game.state.activeContest = { contestId: 'gauntlet', participant: 'player', others: [co], phase: 'live', phaseIdx: 2, phases: [], arenaSuspended: true };
    Game.state.arenaContest = { contestId: 'gauntlet', waves: ['hushwolf'], waveIdx: 0 };
    const p = Game.tbFighter('p'); p.hp = 0; p.alive = false;
    Game.tbEnd('lost');
  } finally {
    Game.contestResolveVillager = realResolve;
    Game.playerDeath = realDeath;
  }
  T.ok('the bearer died once in the arena', deaths.length >= 1 && deaths[0].cause === 'combat' && deaths[0].bearer === bearer, JSON.stringify(deaths));
  T.ok('the co-taken contestant did not die AS the new bearer', !deaths.some(d => d.bearer === co), JSON.stringify(deaths));
  T.ok('exactly one bearer death in the beat', deaths.length === 1, JSON.stringify(deaths));
  T.ok('the co-taken fate still resolved (they are gone)', (v.roster || []).indexOf(co) < 0, JSON.stringify(v.roster));
  T.done();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
