#!/usr/bin/env node
// test-ability-gift-line-20261014.js — chooseAbility's "watching you figure
// things out all week" line plays only for the arrival gift.
//
// Bug: every offer (contest prize, aid gift, poison/pellet offer) ended with
// the arrival-week line, even on day 60.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('ability-gift-line');

(async () => {
  const Game = await K.load({ seed: 1014 });
  K.newRun(Game);
  K.openSlots(Game, 6);
  const s = Game.state.scholar;
  // ABILITY LANES (2026-10-14): System gifts are magic; skill-lane ids
  // (tracker, diplomat...) are taught as skills and never reach this line.
  const def = Game.data.abilities.find(a => a.unlock && a.unlock.type === 'system_offer' && a.lane !== 'skill');
  const def2 = Game.data.abilities.find(a => a.unlock && a.unlock.type === 'system_offer' && a.lane !== 'skill' && a.id !== def.id);
  const week = (l) => /all week/.test(l);

  let says = K.captureSays(Game);
  s.abilityChoices = [{ id: def.id, name: def.name, description: def.description }];
  Game.chooseAbility(def.id);
  says.restore();
  T.ok('a non-arrival offer does not claim "all week"', !says.some(week), says.join(' | '));
  T.ok('the gift still lands', s.abilities.some(a => a.id === def.id));

  says = K.captureSays(Game);
  s.abilityChoices = [{ id: def2.id, name: def2.name, description: def2.description, src: 'arrival' }];
  Game.chooseAbility(def2.id);
  says.restore();
  T.ok('the arrival gift keeps its "all week" line', says.some(week));
  T.done();
})().catch(e => { console.error(e); process.exitCode = 2; });
