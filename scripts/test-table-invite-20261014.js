#!/usr/bin/env node
// test-table-invite-20261014.js — Steve 2026-10-14: "The table should all be
// relative until actually entering it when it locks."
// Qualifying sends an invitation; the seat is priced live; entering locks.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('table-invite');
(async () => {
  const Game = await K.load({ seed: 1017 });
  K.newRun(Game);
  const s = Game.state.scholar, pg = Game.progState();
  Game.state.systemArrived = true;
  let seatNow = 'lesser';
  Game.tableSeat = () => ({ seat: seatNow, detail: {} });
  Game.tableEarnedPaths = () => [{ id: 'feared', name: 'Feared', earned: true, why: 'test' }];
  pg.tableWaiting = true;

  s.day = 50; Game.tableInvite();
  const opts50 = ((s.tableChoices || {}).options || []).map(o => o.id);
  T.ok('day 50: invitation shown, table does NOT start', !pg.tableDone && /lesser/.test((s.tableChoices || {}).prompt || ''), JSON.stringify(opts50));
  T.ok('day 50: no "Take your seat" before day 90', !opts50.includes('invite:enter'), opts50.join(','));
  Game.chooseTableOption('invite:later');
  T.ok('dismissing does not lock anything', !pg.tableDone && !s.tableChoices);

  seatNow = 'full';
  s.day = 95; Game.tableInvite(true);
  T.ok('the preview re-prices live (now a full seat)', /full/.test((s.tableChoices || {}).prompt || ''));
  const opts95 = ((s.tableChoices || {}).options || []).map(o => o.id);
  T.ok('day 95: "Take your seat" offered', opts95.includes('invite:enter'), opts95.join(','));
  Game.chooseTableOption('invite:enter');
  T.ok('entering locks the table (tableDone, phase paths, seat full)', pg.tableDone === true && Game.tableState().phase === 'paths' && Game.tableState().seat === 'full',
    JSON.stringify({ done: pg.tableDone, phase: Game.tableState().phase, seat: Game.tableState().seat }));
  T.done();
})().catch(e => { console.error(e); process.exitCode = 2; });
