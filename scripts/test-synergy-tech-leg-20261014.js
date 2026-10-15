#!/usr/bin/env node
// test-synergy-tech-leg-20261014.js — technique-leg synergies can ACTIVATE.
//
// Bug: recomputeActiveSynergies / _synergyPassiveLegHeld read
// scholar.codex.techniques, but techniques are only ever written to
// state.codex.techniques. So the 7 synergies with a `tech:` leg (tidecaller,
// wildreader, trailblazers_promise, stones_remember, smokehouse,
// green_highway, read_the_patch) could be discovered but never turn on.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('synergy-tech-leg');

(async () => {
  const Game = await K.load({ seed: 1014 });
  K.newRun(Game);
  K.openSlots(Game, 6);
  const s = Game.state.scholar;
  K.giveAbility(Game, 'pathfinder', { level: 1 });
  s.synergies = (s.synergies || []).concat(['trailblazers_promise']);

  Game.state.codex.techniques = Game.state.codex.techniques || {};
  delete Game.state.codex.techniques.trail_blazing;
  Game.recomputeActiveSynergies();
  T.ok('without the technique, trailblazers_promise is inactive',
    !(s.activeSynergies || []).includes('trailblazers_promise'));

  Game.state.codex.techniques.trail_blazing = { level: 1 };
  Game.recomputeActiveSynergies();
  T.ok('with the technique in state.codex, trailblazers_promise activates',
    (s.activeSynergies || []).includes('trailblazers_promise'), JSON.stringify(s.activeSynergies));
  T.done();
})().catch(e => { console.error(e); process.exitCode = 2; });
