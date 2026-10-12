#!/usr/bin/env node
// diag-tablefinals-20261012.js — why the finals prompt is never answered (winpath r5).
// Logs tableChoices presence at daily start/end, chooseTableOption calls,
// bearer/mantle state, and Game.over per day from day 65 on.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { fedseek } = require('./policies/winseek');

const seed = +process.argv[2] || 1;
const DAYS = +process.argv[3] || 200;

(async () => {
  const { Game } = await loadGame({ seed });
  await setupGame(Game);
  const ev = [];
  const dayOf = () => ((Game.state || {}).scholar || {}).day || 0;
  if (typeof Game.chooseTableOption === 'function') {
    const orig = Game.chooseTableOption.bind(Game);
    Game.chooseTableOption = function (id) {
      const T = (typeof Game.tableState === 'function' ? Game.tableState() : {}) || {};
      ev.push(`d${dayOf()} CHOOSE ${id} (phase before=${T.phase})`);
      const r = orig(id);
      const T2 = (typeof Game.tableState === 'function' ? Game.tableState() : {}) || {};
      ev.push(`d${dayOf()}   -> phase after=${T2.phase} path=${T2.path || '-'} beat=${T2.beat | 0} won=${!!Game.won}`);
      return r;
    };
  }
  const p = Object.assign({}, fedseek);
  const origDaily = fedseek.daily;
  p.daily = (G, ctx) => {
    const day = dayOf();
    if (day >= 65) {
      const s = (G.state || {}).scholar || {};
      const T = (typeof G.tableState === 'function' ? G.tableState() : {}) || {};
      const tc = s.tableChoices;
      const alive = (G.state.villagers || []).filter(v => !v.dead).length;
      ev.push(`d${day} daily-start: tc=${tc ? tc.frame + ':' + (tc.options || []).map(o => o.id).join(',') : 'none'} phase=${T.phase || '-'} bearer=${s.name || '?'} bearerDead=${!!s.dead} alive=${alive} over=${!!G.over}`);
    }
    if (origDaily) { try { origDaily(G, ctx); } catch (e) { ev.push(`d${day} daily ERROR ${e.message}`); } }
    if (day >= 65) {
      const s = (G.state || {}).scholar || {};
      const tc = s.tableChoices;
      ev.push(`d${day} daily-end: tc=${tc ? 'PENDING:' + (tc.options || []).map(o => o.id).join(',') : 'none'}`);
    }
  };
  const res = await runDays(Game, p, { days: DAYS, seed });
  console.log(`seed=${seed} days=${res.days} end=${res.endReason} won=${!!Game.won}`);
  for (const e of ev) if (!e.includes('daily-start: tc=none') || true) console.log(e);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
