#!/usr/bin/env node
// scripts/test-fullseat-superset-20261014.js — the FULL seat is a superset of
// the lesser seat's integration-stage and food-deed bars.
// Bug (audit 2026-10-14): deedGateReady().ok checked waves+contests+crises
// only, so a run with every wave faced but integration stage 0 and no food
// deeds sat at the FULL seat while missing bars the LESSER seat requires.
// (Scale is untouched: the full seat still has no rank bar — design question.)
// UPDATE 2026-10-27 (sim-scalegate-a, Steve ruling): the design question is
// answered — the full seat now REQUIRES national/global scale, so the
// fixture below sets nationalLive before asserting full. The scale term
// itself is proven exhaustively by scripts/test-scalegate-a.js.
'use strict';
const K = require('./godpath/lib');
(async () => {
  const T = K.reporter('test-fullseat-superset-20261014');
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
  Game.state.systemArrived = false;            // integration stage 0
  pg.sentimentTaught = false;
  Game.state.scholar.prog = Game.state.scholar.prog || {};
  Game.state.scholar.prog.feastSurgeUsed = false;
  T.ok('setup: integration stage 0', Game.integrationStage() === 0);
  let g = Game.deedGateReady();
  T.ok('setup: waves/contests/crises bars all met', g.waves && g.contests && g.crises);
  T.ok('stage 0 + no food deeds -> deedGateReady NOT ok', !g.ok);
  T.ok('stage 0 + no food deeds -> seat is not full', Game.tableSeat().seat !== 'full', 'seat=' + Game.tableSeat().seat);

  // food deeds alone are not enough
  pg.sentimentTaught = true; Game.state.scholar.prog.feastSurgeUsed = true;
  T.ok('food deeds but stage 0 -> not full', !Game.deedGateReady().ok);

  // stage 2 + food deeds -> full (national standing required since 2026-10-27)
  Game.state.systemArrived = true; Game.state.scholar.integration = 45;
  Game.state.nationalLive = true;
  T.ok('setup: integration stage 2', Game.integrationStage() === 2);
  T.ok('setup: scaleRank national', Game.scaleRank() === 'national');
  T.ok('stage 2 + food deeds + bars -> full', Game.deedGateReady().ok && Game.tableSeat().seat === 'full');

  // stage 2 but missing a food deed -> not full
  Game.state.scholar.prog.feastSurgeUsed = false;
  T.ok('stage 2, no feast surge -> not full', !Game.deedGateReady().ok);
  T.done();
})();
