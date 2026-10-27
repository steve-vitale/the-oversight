#!/usr/bin/env node
// scripts/test-scalegate-a.js — unit proof for the 2026-10-27 full-seat
// scale enforcement (sim-scalegate-a, axis scale-onramp).
//
// Steve's ruling 2026-10-27 (3), plain words: national standing IS
// required for the full seat — deedGateReady() must enforce scale in
// `ok` (previously reported in the breakdown but excluded from `ok`).
//
// Method: a REAL loaded Game (scripts/godpath/lib harness, seed 7),
// with every full-seat bar set on real state — wavesFaced 5/5/4/3/2
// distinct, contestsSurvived 3, crises 3, integration stage 2,
// sentimentTaught + feastSurgeUsed — and rank driven through the REAL
// scaleRank() flags (state.networkLive / nationalLive / globalLive).
// No gate function is stubbed; only state flags are set, exactly as
// the superset proof (test-fullseat-superset-20261014.js) does.
//
// Assertions (each rank, all other bars passing):
//   village  -> ok false, breakdown scale false, seat not full
//   regional -> ok false, breakdown scale false, seat lesser
//     (regional meets the lesser seat's own scale bar and its lower
//     wave/contest/crisis bars — the downgrade, not a loss)
//   national -> ok true,  breakdown scale true,  seat full
//   global   -> ok true,  breakdown scale true,  seat full
// Plus: in the village/regional cases the bars-only recomputation
// (waves && contests && crises && stageOk && foodDeeds, from the
// breakdown's own fields) stays TRUE — proving the ok flip is
// exactly the scale term, nothing else. And the breakdown still
// reports scale honestly (false/true) in every case.
// Plus: tableSeatLine for the national case names the full seat.
//
// Usage: node scripts/test-scalegate-a.js
// Exit 0 only if every assertion passes.
'use strict';
const K = require('./godpath/lib');
(async () => {
  const T = K.reporter('test-scalegate-a');
  const Game = await K.load({ seed: 7 });
  K.newRun(Game);
  const byWave = {};
  for (const m of Game.data.monsters || []) (byWave[m.wave || 1] = byWave[m.wave || 1] || []).push(m.id);
  const need = { 1: 5, 2: 5, 3: 4, 4: 3, 5: 2 };
  const d = Game.deedState();
  for (const w of Object.keys(need)) for (const id of byWave[w].slice(0, need[w])) d.wavesFaced[id] = +w;
  d.contestsSurvived = 3;
  const pg = Game.progState();
  pg.crises = { a: 1, b: 1, c: 1 };
  pg.sentimentTaught = true;
  Game.state.scholar.prog = Game.state.scholar.prog || {};
  Game.state.scholar.prog.feastSurgeUsed = true;
  Game.state.systemArrived = true;
  Game.state.scholar.integration = 45;
  T.ok('setup: integration stage 2', Game.integrationStage() === 2);

  function setRank(rank) {
    Game.state.networkLive = false;
    Game.state.nationalLive = false;
    Game.state.globalLive = false;
    if (rank === 'regional') Game.state.networkLive = true;
    if (rank === 'national') Game.state.nationalLive = true;
    if (rank === 'global') Game.state.globalLive = true;
  }
  function checkRank(rank, expectOk, expectSeat) {
    setRank(rank);
    T.ok('setup: scaleRank() is ' + rank, Game.scaleRank() === rank);
    const g = Game.deedGateReady();
    const barsOnly = !!(g.waves && g.contests && g.crises && g.stageOk && g.foodDeeds);
    T.ok(rank + ': all non-scale bars pass', barsOnly, JSON.stringify(g));
    T.ok(rank + ': breakdown scale reports honestly (' + (rank === 'national' || rank === 'global') + ')',
      g.scale === (rank === 'national' || rank === 'global'));
    T.ok(rank + ': deedGateReady().ok is ' + expectOk, g.ok === expectOk, 'ok=' + g.ok);
    const seat = Game.tableSeat();
    T.ok(rank + ': tableSeat() is ' + expectSeat, seat.seat === expectSeat, 'seat=' + seat.seat);
    return g;
  }

  checkRank('village', false, 'none');
  checkRank('regional', false, 'lesser');
  const nat = checkRank('national', true, 'full');
  T.ok('national: seat line names a full seat',
    /full seat/i.test(Game.tableSeatLine({ seat: 'full', detail: nat })));
  checkRank('global', true, 'full');
  T.done();
})();
