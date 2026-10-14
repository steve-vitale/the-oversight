#!/usr/bin/env node
// Bisect 3: pure runDays (no instruments) on s44 — does it stall?
'use strict';
process.env.FOURTHLINK = '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { fourthlink } = require('./policies/fourthlink');

(async () => {
  const t0 = Date.now();
  const { Game } = await loadGame({ seed: 44, mode: 'succession-bisect3' });
  await setupGame(Game);
  console.log('starting pure runDays...');
  const result = await runDays(Game, fourthlink, { days: 70, sampleEvery: 10 });
  console.log(`runDays returned: days=${result.days} endReason=${result.endReason} elapsed=${((Date.now() - t0) / 1000).toFixed(0)}s`);
  process.exit(0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
setTimeout(() => { console.log('WALL TIMEOUT 90s'); process.exit(3); }, 90000).unref();
