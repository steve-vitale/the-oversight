#!/usr/bin/env node
// diag-tableseq-20261012.js — instrumented table-sequence diagnostic (winpath r5).
// Wraps chooseTableOption + samples tableState daily to see where the
// fired table stalls before the win flag. Run: node scripts/diag-tableseq-20261012.js <policy> <seed> [days]
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { winseek, fedseek } = require('./policies/winseek');
const { competent } = require('./policies/competent');

const POLICIES = { winseek, fedseek, competent };
const policyId = process.argv[2] || 'fedseek';
const seed = +process.argv[3] || 1;
const DAYS = +process.argv[4] || 200;

(async () => {
  const pol = Object.assign({}, POLICIES[policyId]);
  const { Game } = await loadGame({ seed });
  await setupGame(Game);
  const answers = [];
  // wrap tablePrompt to see what's offered
  if (typeof Game.tablePrompt === 'function') {
    const orig = Game.tablePrompt.bind(Game);
    Game.tablePrompt = function (promptHtml, options, frame) {
      const day = ((Game.state || {}).scholar || {}).day || 0;
      answers.push({ day, type: 'prompt', frame, options: (options || []).map(o => o.id + '|' + o.label).slice(0, 12) });
      return orig(promptHtml, options, frame);
    };
  }
  if (typeof Game.chooseTableOption === 'function') {
    const orig = Game.chooseTableOption.bind(Game);
    Game.chooseTableOption = function (id) {
      const day = ((Game.state || {}).scholar || {}).day || 0;
      answers.push({ day, type: 'answer', id });
      return orig(id);
    };
  }
  const p = Object.assign({}, pol);
  const origDaily = pol.daily;
  const log = [];
  p.daily = (G, ctx) => {
    if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
    try {
      const day = ((G.state || {}).scholar || {}).day || 0;
      const pg = G.progState ? G.progState() : {};
      let T = {};
      try { T = (typeof G.tableState === 'function' ? G.tableState() : {}) || {}; } catch (e) {}
      const prev = log.length ? log[log.length - 1] : null;
      const sig = [day, !!pg.tableDone, T.phase || '-', T.path || '-', T.beat | 0, G.over || false].join('|');
      if (!prev || prev.sig !== sig) {
        const s = (T.meters ? Object.keys(T.meters).map(k => k + '=' + JSON.stringify(T.meters[k])).join(',') : '');
        log.push({ sig, line: `d${day} phase=${T.phase || '-'} path=${T.path || '-'} beat=${T.beat | 0} seat=${T.seat || '-'} over=${!!G.over} branch=${T.branch || '-'} meters={${s}}` });
      }
    } catch (e) {}
  };
  const res = await runDays(Game, p, { days: DAYS, seed });
  console.log(`policy=${policyId} seed=${seed} days=${res.days} end=${res.endReason} won=${!!Game.won}`);
  console.log('--- table-state transitions ---');
  for (const l of log) if (l.line.includes('phase=') && !l.line.includes('phase=-')) console.log(l.line);
  console.log('--- prompts & answers ---');
  for (const a of answers) {
    if (a.type === 'prompt') console.log(`d${a.day} PROMPT[${a.frame}] options: ${a.options.join(' ; ')}`);
    else console.log(`d${a.day} ANSWER ${a.id}`);
  }
  // how many villagers alive at table fire vs end
  console.log('--- deaths ---');
  try {
    const ds = (Game.state.village && Game.state.village.deaths) || [];
    console.log('total deaths: ' + ds.length);
    const byCause = {};
    for (const d of ds) { const c = d.cause || d.how || '?'; byCause[c] = (byCause[c] || 0) + 1; }
    console.log(JSON.stringify(byCause, null, 1).slice(0, 2000));
  } catch (e) { console.log('death read failed', e.message); }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
