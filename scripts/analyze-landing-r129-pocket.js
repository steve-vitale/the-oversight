// R129 POCKET analyzer (landing r129, Q1 instrument).
// Usage: node analyze-landing-r129-pocket.js <census-dir>
// Reads journey-landing-r62-census-*.json and reports, per fight:
//   - stuck TURNS (r128 lesson: raw failed-move counts inflate by
//     construction once the close fix sweeps up to 8 attempts per turn.
//     A turn is a maximal run of consecutive 'player-move' entries in
//     the fightLog — between turns the log holds monster-turn /
//     player-strike entries. A stuck turn has >=1 failed move and 0
//     successful moves.)
//   - the POCKET shape (M-Q1b): a living scholar, >=3 stuck turns, and
//     the scholar NEVER moved in the whole fight (posMoved true == 0).
//   - the sealed region (only when the r129 probe's pocketGrid is on the
//     fight entry): BFS from the scholar's fight-start cell over
//     findPath-legal steps (orthogonal, or diagonal with both orthogonal
//     sides walkable) and report the region size + whether the monster's
//     start cell is inside the region. A region of a few cells with the
//     monster outside it is the terrain pocket, named, not guessed.
// A fight with no fightLog prints "no move data" and exits 0 for that
// seed — absence of the instrument, never a pass.
const fs = require('fs');
const path = require('path');
const dir = process.argv[2];
if (!dir) { console.error('usage: node analyze-landing-r129-pocket.js <census-dir>'); process.exit(2); }
const files = fs.readdirSync(dir).filter(f => /census-.*\.json$/.test(f)).sort();

function regionOf(grid, sx, sy) {
  // BFS over findPath-legal steps. Returns {size, cells:Set}.
  const walkable = (x, y) => {
    if (x < 0 || x > 8 || y < 0 || y > 8) return false;
    const cell = grid[y] && grid[y][x];
    if (!cell) return false;
    return !({ wall: 1, water: 1, bigtree: 1, tree: 1, tent: 1, fire: 1 }[cell]);
  };
  if (!walkable(sx, sy)) return { size: 0, cells: new Set() };
  const seen = new Set([sx + ',' + sy]);
  const q = [[sx, sy]];
  const DIRS = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
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
  return { size: seen.size, cells: seen };
}

let panelFights = 0, fightsWithData = 0, pocketFights = 0, totalStuckTurns = 0;
const pockets = [];
const regions = [];
for (const f of files) {
  const c = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const fights = c.fights81 || null;
  if (!fights) { console.log('\n=== seed ' + c.seed + ' ===\nfights81: MISSING (instrument did not run)'); continue; }
  panelFights += fights.length;
  for (const x of fights) {
    const log = x.fightLog || [];
    const moves = log.filter(e => e.turn === 'player-move');
    if (!moves.length) continue;
    fightsWithData++;
    // Split the log into player-turn segments at non-move entries.
    let stuckTurns = 0, curFailed = 0, curOk = 0, inTurn = false;
    const flush = () => { if (inTurn && curFailed > 0 && curOk === 0) stuckTurns++; curFailed = 0; curOk = 0; inTurn = false; };
    for (const e of log) {
      if (e.turn === 'player-move') { inTurn = true; if (e.posMoved) curOk++; else curFailed++; }
      else flush();
    }
    flush();
    totalStuckTurns += stuckTurns;
    const movedEver = moves.some(e => e.posMoved);
    const strikes = log.filter(e => e.turn === 'player-strike').length;
    const living = (x.playerHpEnd == null || x.playerHpEnd > 0);
    // Sealed region from the probe grid, when present.
    let region = null, monsterInRegion = null;
    if (x.pocketGrid && x.pocketGrid.grid && x.pocketGrid.scholar) {
      const [sx, sy] = x.pocketGrid.scholar;
      region = regionOf(x.pocketGrid.grid, sx, sy);
      const m = (x.pocketGrid.monsters || [])[0];
      monsterInRegion = m ? region.cells.has(m.mx + ',' + m.my) : null;
      regions.push({ seed: c.seed, day: x.day, region: region.size, monsterInRegion: monsterInRegion,
        scholar: [sx, sy], tile: x.pocketGrid.tileType });
    }
    if (stuckTurns >= 3 && !movedEver && living) {
      pocketFights++;
      pockets.push({ seed: c.seed, day: x.day, stuckTurns: stuckTurns, strikes: strikes,
        rounds: (x.rounds != null ? x.rounds : null), end: x.endResult, hpEnd: x.playerHpEnd,
        monster: x.monsterArg || '?', region: region ? region.size : null,
        monsterInRegion: monsterInRegion });
    }
  }
}
console.log('PANEL: fights=' + panelFights + ' fightsWithMoveData=' + fightsWithData);
console.log('stuckTurns(total, all fights)=' + totalStuckTurns);
console.log('pocketFights(living scholar, >=3 stuck turns, never moved)=' + pocketFights);
for (const p of pockets) console.log('  POCKET seed ' + p.seed + ' d' + p.day + ' stuckTurns=' + p.stuckTurns + ' strikes=' + p.strikes + ' rounds=' + p.rounds + ' end=' + p.end + ' hpEnd=' + p.hpEnd + ' vs ' + p.monster + ' region=' + p.region + ' monsterInRegion=' + p.monsterInRegion);
console.log('sealedRegions(from pocketGrid, when present): ' + regions.length);
for (const r of regions) console.log('  REGION seed ' + r.seed + ' d' + r.day + ' tile=' + r.tile + ' scholar=' + JSON.stringify(r.scholar) + ' regionSize=' + r.region + ' monsterInRegion=' + r.monsterInRegion);
if (!fightsWithData) console.log('no move data — the r128 wraps did not run on this corpus; the pocket question is UNTESTED here.');
