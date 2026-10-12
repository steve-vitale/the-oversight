#!/usr/bin/env node
// diag-tablechain-20261012.js — instrumented single-seed table-chain diagnostic
// (winpath r5). Tracks per-day: seat, arc, tableWaiting, tableDone,
// tableScene fire, withdraw, death. Run: node scripts/diag-tablechain-20261012.js <policy> <seed> [days]
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
  const p = Object.assign({}, pol);
  const origDaily = pol.daily;
  const log = [];
  p.daily = (G, ctx) => {
    if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
    try {
      const day = ((G.state || {}).scholar || {}).day || 0;
      const pg = G.progState ? G.progState() : {};
      const seat = (typeof G.tableSeat === 'function') ? G.tableSeat() : { seat: 'none', detail: {} };
      const arc = pg.arc || 1;
      const prev = log.length ? log[log.length - 1] : null;
      const changed = !prev || prev.seat !== seat.seat || prev.arc !== arc ||
        !!prev.tw !== !!pg.tableWaiting || !!prev.td !== !!pg.tableDone || !!prev.over !== !!G.over;
      if (changed) log.push({ day, seat: seat.seat, arc, tw: !!pg.tableWaiting, td: !!pg.tableDone, over: !!G.over, rank: (typeof G.scaleRank === 'function' ? G.scaleRank() : '?'), w: seat.detail && [seat.detail.w1, seat.detail.w2, seat.detail.w3].join('/') });
    } catch (e) {}
  };
  const { Game } = await loadGame({ seed });
  await setupGame(Game);
  // wrap tableScene to log exact fire/withdraw
  const events = [];
  if (typeof Game.tableScene === 'function') {
    const orig = Game.tableScene.bind(Game);
    Game.tableScene = function () {
      const day = ((Game.state || {}).scholar || {}).day || 0;
      const r = orig();
      events.push({ day, event: 'tableScene-called', seatAfter: (Game.tableSeat ? Game.tableSeat().seat : '?'), tw: !!Game.progState().tableWaiting, td: !!Game.progState().tableDone });
      return r;
    };
  }
  const res = await runDays(Game, p, { days: DAYS, seed });
  console.log(`policy=${policyId} seed=${seed} days=${res.days} end=${res.endReason} won=${!!Game.won}`);
  console.log('--- chain transitions ---');
  for (const l of log) console.log(`d${l.day} seat=${l.seat} arc=${l.arc} tableWaiting=${l.tw} tableDone=${l.td} over=${l.over} rank=${l.rank} waves=${l.w}`);
  console.log('--- tableScene events ---');
  for (const e of events) console.log(JSON.stringify(e));
  const pg = Game.progState ? Game.progState() : {};
  console.log('end: tableWaiting=' + !!pg.tableWaiting + ' tableDone=' + !!pg.tableDone);
  try {
    const sd = Game.tableSeat();
    console.log('end seat: ' + JSON.stringify(sd));
  } catch (e) {}
})().catch(e => { console.error('FATAL', e); process.exit(1); });
