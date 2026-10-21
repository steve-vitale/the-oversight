#!/usr/bin/env node
// beats-dump-20261021.js — one-off: capture homecoming say() beats for the
// SENSE-TESTING read. 40d leadfeast seed 8951, writes beats JSON.
'use strict';
const path = require('path');
const fs = require('fs');
process.chdir(path.join(__dirname, '..'));
const { loadGame, setupGame, runDays, manifest, quietLog } = require('./sim-harness');
const { install, assertSubstrate } = require('./scholarhome-conservation-20261021');
const { leadfeast } = require('./policies/feastscale');
assertSubstrate();
(async () => {
  const { Game } = await loadGame({ seed: 8951, mode: 'scholarhome-beats' });
  await setupGame(Game);
  const S = install(Game);
  await quietLog(async () => { await runDays(Game, leadfeast, { days: 40, manifest: manifest(8951, 'leadfeast') }); });
  const out = path.join('/tmp', 'scholarhome-beats-20261021.json');
  fs.writeFileSync(out, JSON.stringify(S.beats.slice(0, 12), null, 1));
  console.log('wrote', out, 'nBeats=' + S.beats.length, 'nDeposits=' + S.inflowEvents.length);
})().catch(e => { console.error(e); process.exit(1); });
