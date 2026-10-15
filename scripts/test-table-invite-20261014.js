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

  // NO SPOILERS (Steve: "Not just greyed out before 90, nonexistent.")
  const said = K.captureSays(Game);
  s.day = 50; Game.tableAnnounce();
  T.ok('day 50: no announcement, no modal, nothing started', !pg.tableAnnounced && !s.tableChoices && !pg.tableDone && !said.some(l => /table/i.test(l)), said.join(' | '));
  T.ok('day 50: no Haven preview (the table does not exist yet)', Game.tablePreview() === null);
  T.ok('day 50: the seat cannot be taken', Game.tableTakeSeat().ok === false && !pg.tableDone);
  pg.arcSeen = pg.arcSeen || {}; delete pg.arcSeen[4];
  Game.arcBeat(4);
  T.ok('day 50: Arc IV beat never names the table', !said.some(l => /table/i.test(l)), said.join(' | '));
  s.day = 91; Game.tableAnnounce(); Game.tableAnnounce();
  T.ok('day 91: announced exactly once', said.filter(l => /TABLE IS SET/.test(l)).length === 1 && pg.tableAnnounced === true);
  said.restore();
  let pv = Game.tablePreview();
  T.ok('day 91: Haven preview exists (lesser seat, Feared door)', pv && pv.seat === 'lesser' && pv.doors[0] === 'Feared', JSON.stringify(pv));
  seatNow = 'full'; s.day = 95;
  pv = Game.tablePreview();
  T.ok('the preview re-prices live (now a full seat)', pv && pv.seat === 'full', JSON.stringify(pv));
  const r = Game.tableTakeSeat();
  T.ok('taking the seat locks the table (tableDone, phase paths, seat full)',
    r.ok && pg.tableDone === true && Game.tableState().phase === 'paths' && Game.tableState().seat === 'full');
  T.ok('no preview once seated', Game.tablePreview() === null);
  T.done();
})().catch(e => { console.error(e); process.exitCode = 2; });
