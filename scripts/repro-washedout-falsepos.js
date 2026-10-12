#!/usr/bin/env node
// repro-washedout-falsepos.js — reproduce Steve's false "washed-out gap" warning.
// Steve (live, on phone): "random false washed out path warnings. Frequently
// the west node from haven. If you go south then around, you can see that
// nothing blocking exists in the other side."
//
// Hypothesis under test: world-gen (game.js, BLOCKED ROADS) guards the WRONG
// neighbor when skipping haven/ruin. Blockages are created as:
//     const [dx, dy] = DIRS[rand]; const nx = x+dx, ny = y+dy;
//     if (tiles[ny][nx].type === 'haven') continue;   // skip
//     t.blockFrom = { dx: -dx, dy: -dy, type };
// But travelBlockage() treats blockFrom as the direction you come FROM, i.e.
// the guarded approach origin is (x + bf.dx, y + bf.dy) = (x-dx, y-dy) — the
// OPPOSITE side from the checked neighbor (x+dx, y+dy). So a tile west of
// haven can roll a blockage guarding the HAVEN approach, which the design
// comment ("never block haven") forbids. The warning is then "false" in the
// design sense, and going around (entering from another side) shows no
// blockage — exactly Steve's report.
//
// This script: generate N worlds, count blockages whose guarded approach
// origin is haven or ruin. Any count > 0 reproduces the bug.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

function mulberry(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

(async () => {
  const N = parseInt(process.env.SEEDS || '40', 10);
  let havenGuards = 0, ruinGuards = 0, totalBlockages = 0;
  let westOfHavenWashed = 0;
  const examples = [];
  for (let seed = 1; seed <= N; seed++) {
    Math.random = mulberry(seed);
    const { Game } = await loadGame({ seed, mode: 'competent', fullTelemetry: false });
    await setupGame(Game);
    const tiles = Game.map.tiles;
    for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
      const t = tiles[y][x];
      if (!t.blockFrom) continue;
      totalBlockages++;
      // guarded approach origin per travelBlockage semantics:
      // blocked iff bf.dx === -sign(dest.x - origin.x)  =>  origin = dest + bf
      const ox = x + t.blockFrom.dx, oy = y + t.blockFrom.dy;
      const origin = (ox >= 0 && ox < 9 && oy >= 0 && oy < 9) ? tiles[oy][ox] : null;
      const otype = origin ? origin.type : 'off-map';
      if (otype === 'haven') {
        havenGuards++;
        if (x === 3 && y === 4 && t.blockFrom.type === 'washed_out') westOfHavenWashed++;
        if (examples.length < 5) examples.push(
          `seed ${seed}: tile (${x},${y})[${t.type}] blockFrom ${t.blockFrom.type} guards HAVEN approach`);
      }
      if (otype === 'ruin') {
        ruinGuards++;
        if (examples.length < 5) examples.push(
          `seed ${seed}: tile (${x},${y})[${t.type}] blockFrom ${t.blockFrom.type} guards RUIN approach`);
      }
    }
  }
  console.log(`worlds: ${N}, total blockages: ${totalBlockages}`);
  console.log(`blockages guarding a HAVEN approach (design says never): ${havenGuards}`);
  console.log(`blockages guarding a RUIN approach (design says never): ${ruinGuards}`);
  console.log(`west-of-haven (3,4) washed_out guarding haven: ${westOfHavenWashed}`);
  for (const e of examples) console.log('  ex: ' + e);

  // Steve's exact scenario: force the west-of-haven washed_out, then check
  // the nearby-panel code path (travelBlockage from haven) and the go-around.
  Math.random = mulberry(7);
  const { Game } = await loadGame({ seed: 7, mode: 'competent', fullTelemetry: false });
  await setupGame(Game);
  const t = Game.map.tiles[4][3]; // (3,4): west of haven
  t.blockFrom = { dx: 1, dy: 0, type: 'washed_out' }; // guards haven approach
  Game.map.px = 4; Game.map.py = 4; // standing at haven
  const offered = Game.travelBlockage(3, 4); // what the nearby panel checks
  console.log('\nforced scenario: tile (3,4) washed_out guarding haven approach, player at haven');
  console.log('  nearby panel would offer "Cross the washed-out gap":', !!offered,
    offered ? `(${offered.blockType})` : '');
  // go around: enter (3,4) from the south (3,5)
  const around = Game.travelBlockage(3, 4, 3, 5);
  console.log('  entering (3,4) from the south instead — blocked:', !!around,
    '(Steve: "nothing blocking exists in the other side")');

  const reproduced = havenGuards > 0 || ruinGuards > 0;
  console.log('\n' + (reproduced
    ? 'REPRODUCED: world-gen creates blockages guarding haven/ruin approaches.'
    : 'NOT reproduced in ' + N + ' worlds.'));
  process.exit(reproduced ? 0 : 1);
})();
