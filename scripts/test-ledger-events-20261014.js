#!/usr/bin/env node
// test-ledger-events-20261014.js — world deeds reach the Table's ledger.
// Before: ledgerAdd('hierarchy'|'titan'|'comms'|'villageAgency', 'kind:..')
// was dropped (not a dimension). Now the event is logged and translated.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('ledger-events');
(async () => {
  const Game = await K.load({ seed: 1016 });
  K.newRun(Game);
  const L = Game.ledger();
  const before = { might: L.might, protected: L.protected, brokerage: L.brokerage, fractured: L.fractured };
  Game.ledgerAdd('titan', 'slew:herald');
  T.ok('titan slain → might +3, protected +2', L.might === before.might + 3 && L.protected === before.protected + 2, JSON.stringify(L));
  Game.ledgerAdd('hierarchy', 'conquered:v2');
  T.ok('conquest → might +2', L.might === before.might + 5);
  Game.ledgerAdd('hierarchy', 'linked:v3:prim');
  T.ok('a link → brokerage +1', L.brokerage === before.brokerage + 1);
  Game.ledgerAdd('hierarchy', 'stir:rumor');
  T.ok('ambiguous kinds are logged but score nothing', L.fractured === before.fractured);
  const ev = (Game.progState().ledgerEvents || []);
  T.ok('every string event is logged', ev.length === 4 && ev[0].sys === 'titan', JSON.stringify(ev.slice(0, 2)));
  Game.ledgerAdd('might', 1);
  T.ok('numeric writes still work', L.might === before.might + 6);
  // conversation style: real movement only
  const s = Game.state.scholar; s.disposition = 0;
  const m0 = L.might, p0 = L.protected;
  Game.shiftDisposition(-1);
  T.ok('a cruel shift adds might', L.might === m0 + 1);
  Game.shiftDisposition(+2);
  T.ok('a kind shift adds protected by the real movement', L.protected === p0 + 2);
  s.disposition = 3; const p1 = L.protected;
  Game.shiftDisposition(+1);
  T.ok('no ledger credit when clamped at the edge (no farming)', L.protected === p1);
  T.done();
})().catch(e => { console.error(e); process.exitCode = 2; });
