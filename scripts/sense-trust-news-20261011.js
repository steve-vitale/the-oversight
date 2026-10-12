#!/usr/bin/env node
// sense-trust-news-20261011.js — capture departure/return/gossip lines from a
// live 30-day run for human reading (SENSE-TESTING LAW).
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

(async () => {
  const seed = parseInt(process.env.SEED || '424242', 10);
  const { Game, manifest } = await loadGame({ seed, mode: 'sense', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  Game.say = function (t) { lines.push('d' + (Game.state.scholar.day) + ':' + this.dayPart + ' ' + String(t)); };
  const result = await runDays(Game, competent, { days: 30, manifest, sampleEvery: 30 });
  const keep = lines.filter(l =>
    l.includes('🎒') || l.includes('🧭') || l.includes('Did you hear?') ||
    l.includes('is back') || l.includes('fragments by the fire') ||
    l.includes('just walked away') || l.includes('Walked in like'));
  console.log('days=' + result.days + ' endReason=' + result.endReason + ' captured=' + lines.length + ' kept=' + keep.length);
  for (const l of keep.slice(0, 40)) console.log(l);
})();
