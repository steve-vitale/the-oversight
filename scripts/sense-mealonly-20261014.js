#!/usr/bin/env node
// sense-mealonly-20261014.js — sense-test slice: belongseek s22 armed, 60d.
// Captures say lines around the discipline break + meal beats; read for
// meaning, coherence, relevance (SENSE-TESTING LAW).
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const mo = require('./policies/mealonly');
(async () => {
  process.env.POLICY = 'belongseek'; process.env.MEALONLY = '1';
  const { Game } = await loadGame({ seed: 22, mode: 'mealonly-sense' });
  await setupGame(Game);
  const lines = [];
  const os = Game.say.bind(Game);
  Game.say = function (m) { lines.push('d' + ((Game.state.scholar || {}).day || 0) + ': ' + String(m)); return os(m); };
  const policy = mo.policyForRun();
  await quietLog(() => runDays(Game, policy, { days: 60 }));
  const re = /discipline breaks|Half ration|Hunger gnaws|starving|STARVING|No food in the pantry|camp wild/i;
  const interesting = lines.filter(l => re.test(l));
  console.log('total say lines:', lines.length, '| flagged:', interesting.length);
  interesting.slice(0, 30).forEach(l => console.log(l));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
