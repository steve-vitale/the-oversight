#!/usr/bin/env node
// test-barrier-grid-bound-20261014.js — tbBarrierExit uses the fight's real
// grid bound. Titan fights run 12x12 (tbGridSize); the old edge test was
// hard-coded to tile 8, so on a 12x12 grid the real edge (11) never counted
// as an exit and the interior line 8 did. On the normal 9x9 grid nothing
// changes.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('test-barrier-grid-bound-20261014');

function setup(Game, grid, px) {
  K.newRun(Game);
  Game.map.px = 4; Game.map.py = 6; // off-haven, room to cross east
  K.fight(Game, 'belltoad', { px, py: 4, mx: 2, my: 4, hp: 100 });
  if (grid) Game.tbfight.gridSize = grid;
  const pf = Game.tbFighter('p'); pf.mx = px; pf.my = 4; pf.moveLeft = 3; pf.acted = false;
}

(async () => {
  const Game = await K.load({ seed: 11 });

  T.section('12x12 grid (titan fights)');
  setup(Game, 12, 11);
  T.ok('player turn', Game.tbIsPlayerTurn());
  T.ok('tbGridMax() is 11', Game.tbGridMax() === 11);
  let from = Game.map.px;
  let r = Game.tbBarrierExit(1, 0);
  T.ok('push from tile 11 (the real edge) is accepted', r === true);
  T.ok('...and crosses to the next node', Game.map.px === from + 1, `px ${from} -> ${Game.map.px}`);

  setup(Game, 12, 8);
  from = Game.map.px;
  r = Game.tbBarrierExit(1, 0);
  T.ok('push from tile 8 on a 12x12 grid is NOT an exit (interior)', r === false && Game.map.px === from, `r=${r} px ${from} -> ${Game.map.px}`);

  T.section('9x9 grid (normal fights) unchanged');
  setup(Game, null, 8);
  T.ok('tbGridMax() is 8', Game.tbGridMax() === 8);
  from = Game.map.px;
  r = Game.tbBarrierExit(1, 0);
  T.ok('push from tile 8 crosses', r === true && Game.map.px === from + 1, `r=${r} px ${from} -> ${Game.map.px}`);

  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
