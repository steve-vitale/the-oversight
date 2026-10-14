#!/usr/bin/env node
// scripts/diag-fifthlink-hang-20261014.js — find where armed s44 stalls.
// Runs the armed policy day-by-day with progress prints and a per-day
// watchdog: if a single day takes >20s, dump what the layer did that day.
'use strict';
process.env.FOURTHLINK = '1';
process.env.FIFTHLINK = '1';
const { loadGame, setupGame } = require('./sim-harness');
const { fifthlink, fifthlinkLayer } = require('./policies/fifthlink');

const SEED = parseInt(process.env.SEED || '44', 10);
const DAY_BUDGET_MS = 20000;

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'fifthlink-hang' });
  await setupGame(Game);
  // wrap the layer to log its actions
  const layerCalls = [];
  const origAnswer = Game.answerRenegotiation;
  Game.answerRenegotiation = function (id, how) {
    layerCalls.push({ day: (Game.state.scholar || {}).day, op: 'answerRenegotiation', id, how });
    return origAnswer.call(Game, id, how);
  };
  const origTend = Game.tendLink;
  Game.tendLink = function (id) {
    const r = origTend.call(Game, id);
    layerCalls.push({ day: (Game.state.scholar || {}).day, op: 'tendLink', id, paid: r | 0 });
    return r;
  };
  const policy = Object.assign({}, fifthlink);
  const ctx = {};
  let day = 0;
  const t0 = Date.now();
  while (day < 180) {
    day++;
    Game.state.scholar.day = day;
    const d0 = Date.now();
    // drive one day manually: policy daily + endDay machinery via runDays-like step
    try {
      // minimal day step: policy daily, then the engine's endDay
      policy.daily(Game, ctx);
      if (typeof Game.endDay === 'function') await Game.endDay();
      else if (typeof Game.advanceDay === 'function') await Game.advanceDay();
      else break;
    } catch (e) { console.log(`day ${day} threw: ${e.message}`); break; }
    const dt = Date.now() - d0;
    if (dt > DAY_BUDGET_MS) {
      console.log(`DAY ${day} TOOK ${dt}ms — layer calls that day:`);
      for (const c of layerCalls.filter(c => c.day === day)) console.log('   ', JSON.stringify(c));
      console.log('stopping diagnosis here');
      break;
    }
    if (day % 10 === 0) console.log(`day ${day} ok (${((Date.now() - t0) / 1000).toFixed(0)}s total)`);
    // stop if village dead
    try { if (Game.isVillageDead && Game.isVillageDead()) { console.log(`village dead at day ${day}`); break; } } catch (e) {}
  }
  console.log('diagnosis complete');
  process.exit(0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
