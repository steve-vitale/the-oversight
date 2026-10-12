#!/usr/bin/env node
// sense-knife-r6-20261012.js — sense-testing transcript capture (lever 0 r6).
// Hooks Game.say, runs competent policy 200d on a few seeds, dumps every
// message about the knife beat: knap/clean/rubble/catch/trap/gossip.
// Usage: SEEDS="11,44" DAYS=200 OUT=/tmp/sense-r6.txt node scripts/sense-knife-r6-20261012.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const fs = require('fs');

const SEEDS = (process.env.SEEDS || '11,44,77').split(',').map(Number);
const DAYS = parseInt(process.env.DAYS || '200', 10);
const OUT = process.env.OUT || '/tmp/sense-r6.txt';

const HIT = /knife|knap|stone|rubble|carcass|clean|snare|trapline|trap/i;
const GOSSIP = /said|gossip|told|whisper|laughed|shook|grumbled|mutter/i;

(async () => {
  const lines = [];
  for (const seed of SEEDS) {
    const { Game } = await loadGame({ seed, mode: 'competent' });
    const keep = [];
    const origSay = Game.say;
    Game.say = function (msg) {
      const m = String(msg || '');
      if (HIT.test(m)) keep.push(`[d${(Game.state.scholar || {}).day || '?'}] ${m}`);
      return origSay.apply(this, arguments);
    };
    await setupGame(Game);
    await runDays(Game, competent, DAYS);
    lines.push(`\n===== SEED ${seed} (end day ${Game.state.scholar && Game.state.scholar.day}, ${Game.over ? 'DIED' : 'survived'}) =====`);
    lines.push(...keep);
    // villager talk sample: dump some gossip/journal lines if any carry knife words
    lines.push(`----- gossip scan seed ${seed} -----`);
    try {
      const j = (Game.state.scholar || {}).journal || [];
      for (const e of j) {
        const m = String((e && (e.text || e.msg || '')) || '');
        if (HIT.test(m) && GOSSIP.test(m)) lines.push(`[journal] ${m}`);
      }
    } catch (e) {}
  }
  fs.writeFileSync(OUT, lines.join('\n') + '\n');
  console.log('wrote', OUT, lines.length, 'lines');
})();
