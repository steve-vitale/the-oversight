#!/usr/bin/env node
// test-journey-landing-r129-pocket.js — proof test for the r129 POCKET fix
// (journey-landing r129 2026-11-13).
//
// The defect (probe, seed 1209 d13 vs The Static Kite, BEFORE code): the
// scholar travels west into tile (2,1) and travelTo lands them at (8,0)
// via findWalkableEntry(2, 1, 8, 0). The tile's corner region
// {(8,0),(7,0),(6,0),(7,1),(5,0),(5,1)} is sealed by trees — no
// findPath-legal step leaves it — so the fight's 32 close attempts all
// refuse "No path there." (4 stuck turns, 0 moves; the fight is won
// anyway when the kite dips low). Root cause, read in code AND proved by
// the probe trace: findWalkableEntry's hasExit counted ANY walkable
// neighbor as an exit — (7,0) is walkable but inside the SAME sealed
// region. The guard's own comment promised "travel never strands the
// player in a pocket with zero grid moves"; the code didn't deliver it
// under findPath's diagonal corner-cutting rule.
//
// The fix: findWalkableEntry BFSes the tile's connected components once,
// with findPath's own step rules (orthogonal, or diagonal with both
// orthogonal sides clear), and prefers the nearest walkable cell in the
// LARGEST component. A sealed pocket is never the largest component on a
// real tile; the fallback (nearest walkable anywhere) only fires when the
// whole tile is pockets.
//
// Cases (each runs in its own process so a case cannot leak state into
// another; the Game method is borrowed from a real loaded game and called
// with a stubbed genDetail returning the case grid — findWalkableEntry
// reads only genDetail + cellProps, so no full game state is needed):
//   pocket-1209    : the exact 1209 tile-(2,1) grid, want (8,0) — BEFORE
//             returns (8,0) (the pocket); AFTER returns a main-region
//             cell, (8,2), nearest to (8,0) in the main region.
//   open-entry     : same grid, want (4,4) — returned as-is (control:
//             the untouched path still lands where asked).
//   diagonal-only  : synthetic grid — the wanted cell's ONLY walkable
//             neighbor is a diagonal whose orthogonal sides both block
//             (the hasExit-vs-findPath inconsistency in miniature) —
//             AFTER returns a main-region cell, never the pocket cell.
//   one-cell-pocket: wanted cell walkable with zero walkable neighbors —
//             the old hasExit already handled this one (it was the case
//             the guard was written for), so it passes on BOTH versions:
//             it pins the preserved behavior, not the fix. AFTER returns
//             a main-region cell, (6,4), same as before.
//   no-walkable    : all-tree grid — fallback (4,4).
//   stacked-spawn  : (separate harness case, see below) the world monster
//             standing ON the scholar's tile must NOT spawn stacked on
//             the player — the first monster fighter lands on a distinct
//             free cell.
//
// "FAIL on unfixed code": pocket-1209, diagonal-only and stacked-spawn
// fail on unfixed code (the pocket cell is returned / the monster spawns
// stacked); one-cell-pocket and no-walkable pass on both versions (they
// pin preserved behavior); open-entry is the untouched-path control.
//
// Usage: node scripts/test-journey-landing-r129-pocket.js [case]
//   Default (no arg): runs all cases, spawning children for the
//   non-default cases (separate processes).
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');

let fails = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails++;
}

// The exact tile-(2,1) detail grid from the 1209 probe (pocketGrid dump).
// Rows y=0..8, cols x=0..8. The pocket is (8,0),(7,0),(6,0),(7,1),(5,0),
// (5,1) — sealed by trees at (2,0),(4,0),(4,1),(6,1),(8,1),(5,2),(7,2).
const GRID_1209 = [
  ['grass', 'dirt', 'tree', 'grass', 'tree', 'dirt', 'dirt', 'plant', 'grass'],
  ['grass', 'plant', 'grass', 'dirt', 'tree', 'grass', 'tree', 'dirt', 'tree'],
  ['grass', 'plant', 'grass', 'tree', 'grass', 'tree', 'grass', 'tree', 'grass'],
  ['grass', 'tree', 'dirt', 'tree', 'grass', 'grass', 'plant', 'grass', 'grass'],
  ['plant', 'grass', 'tree', 'grass', 'dirt', 'tree', 'dirt', 'grass', 'dirt'],
  ['tree', 'grass', 'grass', 'grass', 'grass', 'plant', 'tree', 'tree', 'tree'],
  ['dirt', 'grass', 'plant', 'grass', 'plant', 'grass', 'dirt', 'grass', 'dirt'],
  ['tree', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass'],
  ['plant', 'tree', 'dirt', 'tree', 'grass', 'grass', 'grass', 'tree', 'tree'],
];
const POCKET_1209 = new Set(['8,0', '7,0', '6,0', '7,1', '5,0', '5,1']);

const BLOCKS = { wall: 1, water: 1, bigtree: 1, tree: 1, tent: 1, fire: 1 };
function regionSize(grid, sx, sy) {
  const walkable = (x, y) => x >= 0 && x <= 8 && y >= 0 && y <= 8 && grid[y] && grid[y][x] && !BLOCKS[grid[y][x]];
  if (!walkable(sx, sy)) return 0;
  const seen = new Set([sx + ',' + sy]);
  const q = [[sx, sy]];
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  while (q.length) {
    const [x, y] = q.shift();
    for (const [dx, dy] of DIRS) {
      const nx = x + dx, ny = y + dy;
      if (!walkable(nx, ny) || seen.has(nx + ',' + ny)) continue;
      if (dx !== 0 && dy !== 0 && (!walkable(x, ny) || !walkable(nx, y))) continue;
      seen.add(nx + ',' + ny);
      q.push([nx, ny]);
    }
  }
  return seen.size;
}

async function loadEntryFn() {
  const { loadGame } = require('./sim-harness');
  const { Game } = await loadGame({ seed: 1209, fullTelemetry: false });
  if (typeof Game.findWalkableEntry !== 'function') throw new Error('findWalkableEntry missing');
  return Game;
}

function entryWithGrid(Game, grid, wantX, wantY) {
  const ctx = {
    genDetail: () => grid,
    cellProps: (cell) => Game.cellProps(cell),
  };
  return Game.findWalkableEntry.call(ctx, 0, 0, wantX, wantY);
}

async function runCase(name) {
  const Game = await loadEntryFn();
  if (name === 'pocket-1209') {
    const r = entryWithGrid(Game, GRID_1209, 8, 0);
    check('pocket-1209 not the pocket cell', !(r.x === 8 && r.y === 0), `got (${r.x},${r.y})`);
    check('pocket-1209 not in the sealed region', !POCKET_1209.has(r.x + ',' + r.y), `got (${r.x},${r.y})`);
    check('pocket-1209 in the main region', regionSize(GRID_1209, r.x, r.y) > 6, `region=${regionSize(GRID_1209, r.x, r.y)}`);
    check('pocket-1209 nearest main cell', r.x === 8 && r.y === 2, `got (${r.x},${r.y}), expected (8,2)`);
  } else if (name === 'open-entry') {
    const r = entryWithGrid(Game, GRID_1209, 4, 4);
    check('open-entry as-is', r.x === 4 && r.y === 4, `got (${r.x},${r.y})`);
  } else if (name === 'diagonal-only') {
    // Wanted cell (4,4) grass; its only walkable neighbor is the diagonal
    // (5,5) grass, with (5,4) and (4,5) both trees — hasExit (old code)
    // is satisfied by the diagonal, but findPath cannot step there.
    // The main region is the open ground at the bottom-right.
    const g = Array.from({ length: 9 }, () => Array(9).fill('tree'));
    g[4][4] = 'grass'; g[5][5] = 'grass';
    for (let y = 6; y < 9; y++) for (let x = 6; x < 9; x++) g[y][x] = 'grass';
    const r = entryWithGrid(Game, g, 4, 4);
    check('diagonal-only not the pocket cell', !(r.x === 4 && r.y === 4), `got (${r.x},${r.y})`);
    check('diagonal-only in the main region', regionSize(g, r.x, r.y) === 9, `region=${regionSize(g, r.x, r.y)}`);
  } else if (name === 'one-cell-pocket') {
    const g = Array.from({ length: 9 }, () => Array(9).fill('grass'));
    // Wall off (4,4) on all 8 sides with trees; the rest stays open.
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) g[4 + dy][4 + dx] = 'tree';
    const r = entryWithGrid(Game, g, 4, 4);
    check('one-cell-pocket not the pocket cell', !(r.x === 4 && r.y === 4), `got (${r.x},${r.y})`);
    check('one-cell-pocket in the main region', regionSize(g, r.x, r.y) > 70, `region=${regionSize(g, r.x, r.y)}`);
  } else if (name === 'no-walkable') {
    const g = Array.from({ length: 9 }, () => Array(9).fill('tree'));
    const r = entryWithGrid(Game, g, 8, 0);
    check('no-walkable fallback (4,4)', r.x === 4 && r.y === 4, `got (${r.x},${r.y})`);
  } else if (name === 'stacked-spawn') {
    // Drives the real startCombat on a loaded game: scholar at (4,4),
    // world monster (s.monster) standing ON the scholar's tile. BEFORE
    // the fix the first monster fighter spawns at (4,4) — stacked on
    // the player. AFTER it lands on a distinct free cell.
    const { setupGame } = require('./sim-harness');
    await setupGame(Game);
    const s = Game.state.scholar;
    s.mx = 4; s.my = 4;
    Game.map.px = 4; Game.map.py = 4;
    s.monster = { id: 'statickite', mx: 4, my: 4, hp: 82, maxHp: 82, veteran: false };
    Game.pendingMonsterId = null;
    Game.pendingEncounter = null;
    let spawned = null;
    try {
      Game.startCombat('statickite');
      const f = Game.tbfight;
      const m = f && f.fighters.find(x => x && x.kind === 'monster');
      spawned = m ? [m.mx, m.my] : null;
      try { if (f && !f.over) Game.tbEnd('won'); } catch (e) {}
    } catch (e) {
      console.log('FAIL stacked-spawn startCombat threw — ' + (e && e.message));
      fails++;
      return;
    }
    check('stacked-spawn monster not on scholar tile', !!spawned && !(spawned[0] === 4 && spawned[1] === 4), `monster at ${JSON.stringify(spawned)}`);
  } else {
    console.log('unknown case: ' + name);
    process.exit(2);
  }
}

async function main() {
  const arg = process.argv[2];
  const cases = ['pocket-1209', 'open-entry', 'diagonal-only', 'one-cell-pocket', 'no-walkable', 'stacked-spawn'];
  if (!arg) {
    // Parent: run each case in its own process (separate node, no shared
    // harness state — sim-harness forbids two harnesses in one process).
    let allOk = true;
    for (const c of cases) {
      try {
        const out = execFileSync(process.execPath, [path.join(__dirname, 'test-journey-landing-r129-pocket.js'), c], { encoding: 'utf8' });
        process.stdout.write(out);
        if (/^FAIL /m.test(out)) allOk = false;
      } catch (e) {
        process.stdout.write((e.stdout || '') + (e.stderr || ''));
        console.log('FAIL case ' + c + ' (child exit non-zero)');
        allOk = false;
      }
    }
    console.log(allOk ? 'test-journey-landing-r129-pocket: ALL GREEN' : 'test-journey-landing-r129-pocket: FAILURES');
    process.exit(allOk ? 0 : 1);
  }
  if (!cases.includes(arg)) { console.log('unknown case: ' + arg); process.exit(2); }
  await runCase(arg);
  console.log(fails === 0 ? 'case ' + arg + ': GREEN' : 'case ' + arg + ': ' + fails + ' FAILURES');
  process.exit(fails === 0 ? 0 : 1);
}

main().catch(e => { console.log('FAIL harness error — ' + (e && e.stack || e)); process.exit(1); });
