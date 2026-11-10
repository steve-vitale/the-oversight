// R122 FLEELOOP analyzer (journey-landing r122, Q1 PRIMARY) — read-only
// before/after comparison of the flee execution on matched seeds.
// For each census in a corpus dir, reads fights81 fightLogs and counts:
//   fights           — fights with a fightLog
//   scholarDeaths    — fights where the scholar died (playerHpEnd <= 0)
//   fleeLoopDeaths   — scholar died with 0 player-strikes AND >=3
//     player-moves logged (the r121 1143/1148 shape: the scholar spends
//     every turn walking toward / standing on the flee edge and never
//     strikes, never pushes the barrier, never falls through to fighting)
//   movePattern per flee-loop death:
//     noop-same-tile — every logged move targets the same tile (the 1148
//       shape: 9x tbPlayerMove(0,0) from (0,0), findPath returns [[0,0]],
//       a successful no-op) — walk-toward-edge otherwise (the 1143 shape)
// Usage:
//   node scripts/analyze-landing-r122-fleeloop.js <beforeDir> <afterDir>
//   node scripts/analyze-landing-r122-fleeloop.js <dir>   (single corpus)
'use strict';
const fs = require('fs');
const path = require('path');

function analyzeDir(dir) {
  const out = { dir, seeds: 0, fights: 0, scholarDeaths: 0, fleeLoopDeaths: 0, cases: [] };
  if (!dir || !fs.existsSync(dir)) { out.missing = true; return out; }
  const files = fs.readdirSync(dir)
    .filter(f => /^journey-landing-r62-census-\d+\.json$/.test(f)).sort();
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { continue; }
    out.seeds++;
    const fights = d.fights81 || [];
    for (const x of fights) {
      const log = x.fightLog || [];
      out.fights++;
      const strikes = log.filter(e => e.turn === 'player-strike').length;
      const moves = log.filter(e => e.turn === 'player-move');
      const died = x.playerHpEnd != null && x.playerHpEnd <= 0;
      if (died) out.scholarDeaths++;
      if (died && strikes === 0 && moves.length >= 3) {
        out.fleeLoopDeaths++;
        const tiles = moves.map(e => (e.to || []).join(','));
        const pattern = new Set(tiles).size === 1 ? 'noop-same-tile' : 'walk-toward-edge';
        const mon = ((x.monsters || [])[0] || {}).name || x.monsterArg || '?';
        out.cases.push({
          seed: d.seed, day: x.day, monster: mon, rounds: x.rounds,
          moves: moves.length, tiles, pattern, end: x.endResult || null,
        });
      }
    }
  }
  return out;
}

function printSide(label, r) {
  console.log(`=== ${label} ===`);
  if (r.missing) { console.log('MISSING DIR: ' + r.dir); return; }
  console.log(`seeds=${r.seeds} fights=${r.fights} scholarDeaths=${r.scholarDeaths} fleeLoopDeaths=${r.fleeLoopDeaths}`);
  for (const c of r.cases) {
    console.log(`  FLEELOOP seed ${c.seed} d${c.day} ${c.monster} rounds=${c.rounds} moves=${c.moves} pattern=${c.pattern} tiles=[${c.tiles.join('; ')}] end=${c.end}`);
  }
}

const beforeDir = process.argv[2];
const afterDir = process.argv[3] || null;
if (!beforeDir) { console.error('usage: node analyze-landing-r122-fleeloop.js <beforeDir> [afterDir]'); process.exit(2); }
const b = analyzeDir(beforeDir);
printSide('BEFORE', b);
let a = null;
if (afterDir) {
  a = analyzeDir(afterDir);
  printSide('AFTER', a);
  console.log(`Q1-FLEELOOP: fleeLoopDeaths before=${b.fleeLoopDeaths} after=${a.fleeLoopDeaths} scholarDeaths before=${b.scholarDeaths} after=${a.scholarDeaths}`);
}
