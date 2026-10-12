#!/usr/bin/env node
// sense-feast-r7-20261012.js — capture feast transcripts for sense-testing.
// Records every Game.say matching feast/channel/keepsake/FEASTED/draw,
// plus villager remember/gossip traces around feast days.
// Usage: SEEDS="11,66,77" DAYS=120 OUT=/tmp/sense-feast-r7.txt node scripts/sense-feast-r7-20261012.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const SEEDS = (process.env.SEEDS || '11,66,77').split(',').map(Number);
const DAYS = parseInt(process.env.DAYS || '120', 10);
const OUT = process.env.OUT || '/tmp/sense-feast-r7.txt';
const RE = /feast|keepsake|channel|feasted|surge|draw|circling|edge of the light|cookfire|fire burns low/i;
(async () => {
  const out = [];
  for (const seed of SEEDS) {
    const { Game } = await loadGame({ seed, mode: 'competent' });
    await setupGame(Game);
    const lines = [];
    const ogSay = Game.say.bind(Game);
    Game.say = function (msg) {
      try {
        const day = ((Game.state || {}).scholar || {}).day || 0;
        if (RE.test(String(msg))) lines.push(`[seed ${seed} d${day}] ${String(msg).slice(0, 500)}`);
      } catch (e) {}
      return ogSay(msg);
    };
    const p = Object.assign({}, competent);
    await runDays(Game, p, { days: DAYS });
    out.push(`================ SEED ${seed} ================`);
    out.push(...lines);
    out.push('');
    console.log(`seed ${seed}: ${lines.length} feast lines`);
  }
  require('fs').writeFileSync(OUT, out.join('\n'));
  console.log('wrote ' + OUT);
})();
