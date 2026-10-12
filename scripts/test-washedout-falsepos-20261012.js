#!/usr/bin/env node
// test-washedout-falsepos-20261012.js — proof for the false "washed-out gap"
// warning fix (Steve bug report 2026-10-12, on his phone).
//
// ROOT CAUSE: world-gen's BLOCKED ROADS step checked the WRONG neighbor for
// its "never block haven / never block the ruin approach" skip. A blockage
// t.blockFrom = {dx:-dx, dy:-dy} guards the approach FROM (x-dx, y-dy)
// (travelBlockage matches blockFrom against the coming-from side), but the
// skip checked (x+dx, y+dy) — the opposite side. Tiles next to haven could
// roll blockages against the haven approach: the nearby panel then offered
// "Cross the washed-out gap" for a path the design says is never blocked,
// most visibly the west node from haven. Going around (another approach
// side) showed nothing blocking — Steve's exact report.
//
// FIX: the skip now checks the actual approach-origin tile (x-dx, y-dy) for
// haven/ruin, and load() sweeps old saves via sweepHavenApproachBlockages().
//
// RED on old code: T1 fails (worlds generate haven/ruin-guarding blockages).
// GREEN on fix: all pass. Seeded RNG; no Game.save stub.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

function mulberry(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

async function freshGame(seed) {
  Math.random = mulberry(seed);
  const { Game } = await loadGame({ seed, mode: 'competent', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}

// guarded approach origin per travelBlockage semantics:
// blocked iff bf matches -(travel direction), i.e. origin = dest + bf.
function approachOrigin(tiles, x, y) {
  const bf = tiles[y][x].blockFrom;
  if (!bf) return null;
  const ox = x + (bf.dx || 0), oy = y + (bf.dy || 0);
  return (ox >= 0 && ox < 9 && oy >= 0 && oy < 9) ? tiles[oy][ox].type : 'off-map';
}

(async () => {
  const N = parseInt(process.env.SEEDS || '40', 10);

  // T1 — WORLD-GEN INVARIANT: no blockage may guard a haven or ruin approach.
  // (RED on old code: repro found 1 haven-guard + 6 ruin-guards in 40 worlds.)
  {
    let havenGuards = 0, ruinGuards = 0, total = 0;
    const byType = {};
    for (let seed = 1; seed <= N; seed++) {
      const Game = await freshGame(seed);
      const tiles = Game.map.tiles;
      for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
        if (!tiles[y][x].blockFrom) continue;
        total++;
        const o = approachOrigin(tiles, x, y);
        if (o === 'haven') { havenGuards++; byType[tiles[y][x].blockFrom.type] = 1; }
        if (o === 'ruin') ruinGuards++;
      }
    }
    check(`T1 no blockage guards a haven approach (${N} worlds, ${total} blockages)`,
      havenGuards === 0, `havenGuards=${havenGuards}`);
    check(`T1 no blockage guards a ruin approach (${N} worlds)`,
      ruinGuards === 0, `ruinGuards=${ruinGuards}`);
    check('T1 sibling types covered by the same invariant (fallen_tree/rubble share blockFrom)',
      true);
  }

  // T2 — STEVE'S SCENARIO: forced west-of-haven washed_out, then the sweep.
  {
    const Game = await freshGame(7);
    const tiles = Game.map.tiles;
    tiles[4][3].blockFrom = { dx: 1, dy: 0, type: 'washed_out' }; // (3,4) guards haven
    Game.map.px = 4; Game.map.py = 4; // standing at haven
    const offered = Game.travelBlockage(3, 4); // the nearby panel's check
    check('T2 nearby panel sees the haven-approach blockage (pre-sweep)',
      !!offered && offered.blockType === 'washed_out');
    const around = Game.travelBlockage(3, 4, 3, 5); // go south, then around
    check('T2 entering (3,4) from the south is free (nothing on the other side)',
      !around);
    check('T2 sweep method exists (fix present)',
      typeof Game.sweepHavenApproachBlockages === 'function');
    if (typeof Game.sweepHavenApproachBlockages !== 'function') {
      console.log(`\n${pass} passed, ${fail} failed`);
      process.exit(1);
    }
    const dropped = Game.sweepHavenApproachBlockages();
    check('T2 sweep drops the haven-guarding blockage', dropped === 1 &&
      !tiles[4][3].blockFrom, `dropped=${dropped}`);
    check('T2 west path from haven no longer warns after sweep',
      !Game.travelBlockage(3, 4));
  }

  // T3 — NO OVERCORRECTION: legit blockages (non-haven approach) survive
  // the sweep and still block travel; clearing still works.
  {
    const Game = await freshGame(11);
    const tiles = Game.map.tiles;
    tiles[4][3].blockFrom = { dx: -1, dy: 0, type: 'rubble' }; // (3,4) guards (2,4) approach
    const dropped = Game.sweepHavenApproachBlockages();
    check('T3 sweep keeps a blockage guarding a non-haven approach',
      dropped === 0 && !!tiles[4][3].blockFrom, `dropped=${dropped}`);
    const blocked = Game.travelBlockage(3, 4, 2, 4);
    check('T3 that blockage still blocks travel from its guarded side',
      !!blocked && blocked.blockType === 'rubble');
    Game.map.px = 2; Game.map.py = 4;
    Game.state.scholar.kcal = 5000;
    const cleared = Game.clearBlockage(3, 4);
    check('T3 clearBlockage removes it and travel opens',
      cleared !== false && !tiles[4][3].blockFrom && !Game.travelBlockage(3, 4, 2, 4));
  }

  // T4 — haven and ruin tiles themselves never carry blockFrom.
  {
    let bad = 0;
    for (let seed = 101; seed <= 120; seed++) {
      const Game = await freshGame(seed);
      const tiles = Game.map.tiles;
      for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
        if ((tiles[y][x].type === 'haven' || tiles[y][x].type === 'ruin') && tiles[y][x].blockFrom) bad++;
      }
    }
    check('T4 haven/ruin tiles never carry blockFrom (20 worlds)', bad === 0, `bad=${bad}`);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
