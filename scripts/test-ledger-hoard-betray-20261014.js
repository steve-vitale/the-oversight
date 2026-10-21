#!/usr/bin/env node
// scripts/test-ledger-hoard-betray-20261014.js — the Table's two dark ledger
// inputs that nothing wrote (audit 2026-10-14):
//   foodHoarded: only hoardFood() wrote it and nothing called hoardFood. Now
//     takeFromPantryBulk's net-taker hoard detector (observe('hoard')) calls it.
//   betrayed: zero ledgerAdd('betrayed') calls. Now playerAttacks() on a
//     party member / follower records it (attacking a non-member does not).
'use strict';
const K = require('./godpath/lib');
(async () => {
  const T = K.reporter('test-ledger-hoard-betray-20261014');
  const Game = await K.load({ seed: 7 });
  K.newRun(Game);
  const v = Game.state.village;
  const vid = Game.state.scholar.villagerId;
  const L = () => Game.ledger();

  // --- foodHoarded ---
  T.section('foodHoarded');
  const food = () => ({ name: 'test jerky', kcalEach: 1000, units: 10, kg: 0.1, safe: true, unit: 'item', spoilDay: 999 });
  v.pantry = [food()];
  v.gives = {}; v.takes = {}; v.takes[vid] = 20000;   // long-run net taker
  // (sim-thiefcooldown-b 2026-10-20: the bulk hoard detector is now the
  // trailing-7d NET take rate vs the 3000 kcal/day abuse bar, not the
  // cumulative ledger — a single pack-out no longer reads as hoarding.
  // Seed the dated history so the detector trips under the new bar.)
  Game.recordTakeHist(vid, 22000);
  const h0 = L().foodHoarded | 0;
  Game.takeFromPantryBulk({ 0: 3 });
  T.ok('net taker bulk take of 3000 kcal -> foodHoarded +3', (L().foodHoarded | 0) - h0 === 3, 'delta=' + ((L().foodHoarded | 0) - h0));

  v.pantry = [food()];
  v.gives = {}; v.gives[vid] = 50000; v.takes = {};   // net giver
  v.takeHist = {}; v.giveHist = {};                   // no recent take rate
  const h1 = L().foodHoarded | 0;
  Game.takeFromPantryBulk({ 0: 2 });
  T.ok('net giver bulk take -> foodHoarded unchanged', (L().foodHoarded | 0) === h1);

  // --- betrayed ---
  T.section('betrayed');
  const others = (v.roster || []).filter(id => id !== vid);
  T.ok('setup: roster has at least 2 others', others.length >= 2);
  const ps = Game.partyState();
  ps.party = [others[0]];
  T.ok('setup: victim is in party', Game.inParty(others[0]));
  const b0 = L().betrayed | 0;
  Game.playerAttacks(others[0]);
  T.ok('player attacks a party member -> betrayed +1', (L().betrayed | 0) - b0 === 1, 'delta=' + ((L().betrayed | 0) - b0));
  if (Game.tbfight && !Game.tbfight.over) {
    try { Game.tbEnd('fled'); } catch (e) { console.warn('tbEnd failed', e.message); }
  }
  Game.tbfight = null;

  ps.party = []; ps.followers = [];
  const b1 = L().betrayed | 0;
  Game.playerAttacks(others[1]);
  T.ok('player attacks a non-member -> betrayed unchanged', (L().betrayed | 0) === b1);
  T.done();
})();
