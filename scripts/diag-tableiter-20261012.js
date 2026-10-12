#!/usr/bin/env node
// diag-tableiter-20261012.js — array-collected iteration log (survives quietLog).
// Logs every loop-iteration's policy.daily call: iter#, scholar.day, over,
// pop, tableChoices pending?, plus CHOOSE calls.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const H = require('./sim-harness');
const { fedseek } = require('./policies/winseek');

const seed = +process.argv[2] || 1;

(async () => {
  const { Game } = await H.loadGame({ seed });
  await H.setupGame(Game);
  const ev = [];
  let iter = 0;
  const p = Object.assign({}, fedseek);
  const origDaily = fedseek.daily;
  p.daily = (G, ctx) => {
    iter++;
    const s = (G.state || {}).scholar || {};
    const tc = s.tableChoices;
    if (iter >= 60) ev.push(`iter#${iter} day=${s.day} over=${!!G.over} pop=${((G.state.village || {}).roster || []).length} tc=${tc ? tc.frame + ':' + (tc.options || []).map(o => o.id).join(',') : 'none'}`);
    if (origDaily) { try { origDaily(G, ctx); } catch (e) { ev.push(`iter#${iter} daily ERR ${e.message}`); } }
  };
  const origChoose = Game.chooseTableOption.bind(Game);
  Game.chooseTableOption = function (id) {
    ev.push(`iter#${iter} CHOOSE ${id}`);
    return origChoose(id);
  };
  const res = await H.runDays(Game, p, { days: 200, seed });
  console.log(`result: days=${res.days} gameDays=${res.gameDays} end=${res.endReason} won=${!!Game.won}`);
  for (const e of ev) console.log(e);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
