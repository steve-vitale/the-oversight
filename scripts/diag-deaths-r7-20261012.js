#!/usr/bin/env node
// diag-deaths-r7-20261012.js — death-cause shares + survival, before/after.
// COMPETENT_FEAST=0 in env => before (legacy). Default => after.
// Usage: SEEDS="11,22,..." DAYS=200 OUT=/tmp/deaths-r7.json node scripts/diag-deaths-r7-20261012.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const SEEDS = (process.env.SEEDS || '11,22,33,44,55,66,77,88,99,111,222,333').split(',').map(Number);
const DAYS = parseInt(process.env.DAYS || '200', 10);
const OUT = process.env.OUT || '/tmp/deaths-r7.json';
(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const { Game } = await loadGame({ seed, mode: 'competent' });
    await setupGame(Game);
    const p = Object.assign({}, competent);
    const result = await runDays(Game, p, { days: DAYS });
    const causes = {};
    for (const ev of (result.telemetry || [])) {
      if (ev && (ev.ev === 'death' || ev.type === 'death')) {
        const c = String(ev.cause || (ev.data && ev.data.cause) || 'unknown').slice(0, 40);
        causes[c] = (causes[c] || 0) + 1;
      }
    }
    rows.push({ seed, days: result.days, endReason: result.endReason, causes });
    console.log(`seed=${seed} days=${result.days} end=${result.endReason} causes=${JSON.stringify(causes)}`);
  }
  require('fs').writeFileSync(OUT, JSON.stringify({ meta: { seeds: SEEDS, days: DAYS, gate: process.env.COMPETENT_FEAST || 'on' }, rows }, null, 1));
  console.log('wrote ' + OUT);
})();
