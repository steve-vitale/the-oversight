#!/usr/bin/env node
// test-table-invite-20261014.js — the Table seat (Steve 2026-10-14):
// "relative until actually entering it when it locks" + "Make it an option
// in haven once unlocked" (no daily prompt).
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('table-seat');
(async () => {
  const Game = await K.load({ seed: 1017 });
  K.newRun(Game);
  const s = Game.state.scholar, pg = Game.progState();
  Game.state.systemArrived = true;
  let seatNow = 'lesser';
  Game.tableSeat = () => ({ seat: seatNow, detail: {} });
  Game.tableEarnedPaths = () => [{ id: 'feared', name: 'Feared', earned: true, why: 'test' }];
  pg.tableWaiting = true;

  s.day = 50; Game.tableAnnounce();
  T.ok('announced once, no modal, table not started', pg.tableAnnounced === true && !s.tableChoices && !pg.tableDone);
  Game.tableAnnounce();
  T.ok('no repeat prompt the next morning', !s.tableChoices);
  let pv = Game.tablePreview();
  T.ok('Haven preview: lesser seat, Feared door, not ready before day 90', pv && pv.seat === 'lesser' && pv.doors[0] === 'Feared' && pv.ready === false, JSON.stringify(pv));
  T.ok('taking the seat before day 90 is refused', Game.tableTakeSeat().ok === false && !pg.tableDone);

  seatNow = 'full'; s.day = 95;
  pv = Game.tablePreview();
  T.ok('the preview re-prices live (full seat, ready)', pv && pv.seat === 'full' && pv.ready === true, JSON.stringify(pv));
  const r = Game.tableTakeSeat();
  T.ok('taking the seat locks the table (tableDone, phase paths, seat full)',
    r.ok && pg.tableDone === true && Game.tableState().phase === 'paths' && Game.tableState().seat === 'full');
  T.ok('no preview once seated', Game.tablePreview() === null);
  T.done();
})().catch(e => { console.error(e); process.exitCode = 2; });
