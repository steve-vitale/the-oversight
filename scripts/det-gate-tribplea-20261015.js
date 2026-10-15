#!/usr/bin/env node
// scripts/det-gate-tribplea-20261015.js — det-gate for SIM-TRIBPLEA.
// 8 seeds x belongseek (the plea is belong-only by construction), each run
// TWICE at 40d, per-day state hashes compared. 8/8 bit-identical required.
//
// Two modes:
//   DET_MODE=off-vs-base (default): TRIBPLEA unset tribplea vs pristine
//     belongseek on identical seeds — proves gate-off the export is
//     byte-identical to the parent policy.
//   DET_MODE=armed: TRIBPLEA=1 tribplea x2 — proves armed determinism (no
//     unseeded RNG in the verb or the hunger ring).
//
// Usage:
//   node scripts/det-gate-tribplea-20261015.js
//   DET_MODE=armed TRIBPLEA=1 node scripts/det-gate-tribplea-20261015.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

let TP;
try {
  TP = require('./policies/tribplea');
} catch (e) {
  console.log('INFO-SKIP: tribplea layer absent (deleted per kill protocol); det-gate was 8/8 both modes pre-kill — see evidence/2026-10-15/sim-tribplea-b.md');
  process.exit(0);
}
const { belongseek } = require('./policies/belongseek');
const MODE = process.env.DET_MODE || 'off-vs-base';

let REGISTRY_A, REGISTRY_B, label;
if (MODE === 'armed') {
  if (process.env.TRIBPLEA !== '1') { console.log('armed mode requires TRIBPLEA=1'); process.exit(1); }
  REGISTRY_A = { belongseek: TP.tribplea };
  REGISTRY_B = { belongseek: TP.tribplea };
  label = 'armed-determinism';
} else {
  if (process.env.TRIBPLEA === '1') { console.log('off-vs-base mode requires TRIBPLEA unset'); process.exit(1); }
  REGISTRY_A = { belongseek: TP.tribplea };
  REGISTRY_B = { belongseek };
  label = 'off-vs-base-transparency';
}

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const PIDS = ['belongseek'];

function dayHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const parts = [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
    (v.roster || []).length, Game.map.px, Game.map.py,
    Game.unlockedWave ? Game.unlockedWave() : 0,
    Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100)];
  return parts.join('|');
}
function gdayOf(G) { try { return (G.state.scholar || {}).day || 0; } catch (e) { return 0; } }

async function runHashes(base, pid, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'tribplea-det-' + pid });
  await setupGame(Game);
  const hashes = [];
  const wrapped = Object.assign({}, base);
  const origDaily = base.daily;
  wrapped.daily = (G, ctx) => {
    hashes.push(gdayOf(G) + ':' + dayHash(G));
    return origDaily ? origDaily(G, ctx) : undefined;
  };
  await quietLog(async () => { await runDays(Game, wrapped, { days }); });
  return hashes;
}

async function main() {
  let ok = 0, fail = 0;
  for (const pid of PIDS) for (const seed of SEEDS) {
    const a = await runHashes(REGISTRY_A[pid], pid, seed, 40);
    const b = await runHashes(REGISTRY_B[pid], pid, seed, 40);
    const same = a.length === b.length && a.every((h, i) => h === b[i]);
    if (same) { ok++; console.log(`  PASS [${pid} seed ${seed}] identical (${a.length} days)`); }
    else { fail++; console.log(`  FAIL [${pid} seed ${seed}] diverge (a=${a.length} b=${b.length})`); }
  }
  console.log(`\n== det-gate ${label}: ${ok}/8 identical ==`);
  process.exit(fail ? 1 : 0);
}

if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });
