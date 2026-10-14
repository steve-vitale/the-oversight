#!/usr/bin/env node
// scripts/test-slot-moments-20261014.js — every ability-slot unlock is
// announced (audit 2026-10-14). abilitySlots() opens slots at integration
// 20/35/50/65/80, but the slot line (game.js integrate) only ran inside the
// 20/40/60/80 stage loop and the slot moments fire at 20/40/60/70/80, so the
// 3rd/4th/5th slots arrived in silence. Now any slot gain is announced; the
// 40/60/70 moments (mentor, trial + sentiment, creep) are unchanged.
'use strict';
const K = require('./godpath/lib');
(async () => {
  const T = K.reporter('test-slot-moments-20261014');
  const Game = await K.load({ seed: 7 });
  K.newRun(Game);
  Game.state.systemArrived = true;
  const s = Game.state.scholar;
  const pg = Game.progState();
  pg.slotMoments = {};
  const says = [];
  const origSay = Game.say;
  Game.say = function (m) { says.push(String(m)); return origSay.apply(this, arguments); };

  s.integration = 30; s.lastIntegration = 20;
  T.ok('at 30: 2 slots', Game.abilitySlots() === 2);
  says.length = 0;
  Game.integrate(6, 'test');
  T.ok('crossed 35: abilitySlots() == 3', Game.abilitySlots() === 3, 'slots=' + Game.abilitySlots());
  T.ok('crossed 35: a new-slot line names 3 slots', says.some(m => /ability slots: 3\b/i.test(m)), says.join(' | ').slice(0, 200));

  s.integration = 48; s.lastIntegration = 40; says.length = 0;
  Game.integrate(3, 'test');
  T.ok('crossed 50: 4 slots announced', Game.abilitySlots() === 4 && says.some(m => /ability slots: 4\b/i.test(m)));

  s.integration = 63; s.lastIntegration = 60; says.length = 0;
  Game.integrate(3, 'test');
  T.ok('crossed 65: 5 slots announced', Game.abilitySlots() === 5 && says.some(m => /ability slots: 5\b/i.test(m)));

  // sentiment still taught at 60, not moved
  pg.sentimentTaught = false; delete pg.slotMoments[60];
  s.integration = 58; s.lastIntegration = 40; says.length = 0;
  Game.integrate(3, 'test');
  T.ok('crossing 60 still teaches sentiment', pg.sentimentTaught === true);

  // one ladder: no progression.js override of abilitySlots
  const src = K.readSrc('src/js/progression.js');
  T.ok('progression.js no longer redefines abilitySlots', !/Game\.abilitySlots\s*=/.test(src));
  Game.say = origSay;
  T.done();
})();
