#!/usr/bin/env node
// diag-path-r154.js — why does the bot's flee move fail on the Haven node?
// Prints scholar pos, detail grid (blocked cells), and findPath results to
// each edge tile. Usage: SEED=13601 node scripts/diag-path-r154.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const SEED = parseInt(process.env.SEED || '13601', 10);
(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-delayed-r70', fullTelemetry: true });
  await setupGame(Game, 'Denver, Colorado');
  const sc = Game.state.scholar;
  console.log('scholar mx,my:', sc.mx, sc.my, 'map px,py:', Game.map.px, Game.map.py, 'health:', sc.health);
  const detail = Game.genDetail(Game.map.px, Game.map.py);
  console.log('detail grid (X=blocks, .=open, P=player):');
  for (let y = 0; y < 9; y++) {
    let row = '';
    for (let x = 0; x < 9; x++) {
      if (x === sc.mx && y === sc.my) { row += 'P'; continue; }
      const cell = detail[y] && detail[y][x];
      row += Game.cellProps(cell).blocks ? 'X' : '.';
    }
    console.log(row + '  ' + JSON.stringify(detail[y]));
  }
  for (const [tx, ty] of [[0, sc.my], [8, sc.my], [sc.mx, 0], [sc.mx, 8], [0, 0], [8, 8]]) {
    const path = Game.findPath(sc.mx, sc.my, tx, ty);
    console.log('findPath to', tx + ',' + ty, ':', path ? ('len ' + path.length + ' ' + JSON.stringify(path.slice(0, 4))) : 'NULL');
  }
  console.log('tbGridMax:', (typeof Game.tbGridMax === 'function') ? Game.tbGridMax() : 'n/a');
})();
