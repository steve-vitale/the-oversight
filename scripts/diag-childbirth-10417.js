#!/usr/bin/env node
// diag-childbirth-10417.js — one-seed diagnostic re-run (NOT a judged
// probe: the verdict was already computed by analyze-childbirth-b.js).
// Replicates the sweep's seed-10417 run exactly (same seed, policy,
// horizon, capture install) and dumps every distant roster member
// with birthDay set, to resolve whether the Ashford day-293 baby
// lived or died before the end census.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { installStockdoorsCapture } = require('./stockdoors-capture');
(async () => {
  const { Game } = await loadGame({ seed: 10417, mode: 'childbirth-b-competent-nofeast', fullTelemetry: false });
  installStockdoorsCapture(Game);
  await setupGame(Game);
  const result = await runDays(Game, competent, { days: 300, manifest: null });
  console.log('days=' + result.days + ' end=' + result.endReason);
  for (const vil of (Game.state.otherVillages || [])) {
    if (!vil.roster) continue;
    const born = vil.roster.filter(p => p.birthDay !== undefined && p.birthDay !== null);
    const news = (vil.news || []).filter(l => /baby was born/i.test(String(l)));
    console.log('village=' + vil.name + ' day=' + vil.day + ' roster=' + vil.roster.length +
      ' living=' + vil.roster.filter(p => p.alive).length +
      ' bornMembers=' + JSON.stringify(born.map(p => ({ age: p.age, alive: p.alive, birthDay: p.birthDay, deathDay: p.deathDay || null, cause: p.cause || null }))) +
      ' news=' + JSON.stringify(news));
  }
})().catch(e => { console.error('DIAG CRASH', e); process.exit(2); });
