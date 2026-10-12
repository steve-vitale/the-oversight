#!/usr/bin/env node
// diag-tableloop-20261012.js — why policy.daily stops after d72 (winpath r5).
// Logs loop-iteration vs scholar.day divergence, Game.over, pop.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const H = require('./sim-harness');
const { fedseek } = require('./policies/winseek');

const seed = +process.argv[2] || 1;

(async () => {
  const { Game } = await H.loadGame({ seed });
  await H.setupGame(Game);
  const p = Object.assign({}, fedseek);
  const origDaily = fedseek.daily;
  let iters = 0;
  p.daily = (G, ctx) => {
    iters++;
    const day = ((G.state || {}).scholar || {}).day || 0;
    if (day >= 65) console.log(`iter#${iters} scholar.day=${day} over=${!!G.over} pop=${((G.state.village || {}).roster || []).length}`);
    if (origDaily) { try { origDaily(G, ctx); } catch (e) { console.log('daily ERR', e.message); } }
  };
  const res = await H.runDays(Game, p, { days: 200, seed });
  console.log(`result: days=${res.days} gameDays=${res.gameDays} end=${res.endReason} won=${!!Game.won} iters-with-daily=${iters}`);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
