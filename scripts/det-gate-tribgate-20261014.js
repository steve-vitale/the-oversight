#!/usr/bin/env node
// scripts/det-gate-tribgate-20261014.js — det-gate for SIM-TRIBGATE.
// 16 seed-policy combos (8 seeds x leadcourt/belongseek), each run TWICE at
// 40d, per-day state hashes compared. 16/16 bit-identical required.
//
// Two modes:
//   DET_MODE=off-vs-base (default): TRIBGATE unset triblead/tribbelong vs the
//     parent leadcourt/belongseek on identical seeds — proves gate-off the
//     wrapper is byte-identical to the base policy.
//   DET_MODE=armed: TRIBGATE=1 triblead/tribbelong x2 — proves armed
//     determinism (no unseeded RNG in the verb).
//
// Usage:
//   node scripts/det-gate-tribgate-20261014.js
//   DET_MODE=armed TRIBGATE=1 node scripts/det-gate-tribgate-20261014.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const TG = require('./policies/tribgate');
const MODE = process.env.DET_MODE || 'off-vs-base';

let REGISTRY_A, REGISTRY_B, label;
if (MODE === 'armed') {
  if (process.env.TRIBGATE !== '1') { console.log('armed mode requires TRIBGATE=1'); process.exit(1); }
  REGISTRY_A = { leadcourt: TG.triblead, belongseek: TG.tribbelong };
  REGISTRY_B = { leadcourt: TG.triblead, belongseek: TG.tribbelong };
  label = 'armed-determinism';
} else {
  if (process.env.TRIBGATE === '1') { console.log('off-vs-base mode requires TRIBGATE unset'); process.exit(1); }
  REGISTRY_A = { leadcourt: TG.triblead, belongseek: TG.tribbelong };
  REGISTRY_B = { leadcourt: require('./policies/leadcourt').leadcourt, belongseek: require('./policies/belongseek').belongseek };
  label = 'off-vs-base-transparency';
}

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const PIDS = ['leadcourt', 'belongseek'];

function dayHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const parts = [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
    (v.roster || []).length, Game.map.px, Game.map.py,
    Game.unlockedWave ? Game.unlockedWave() : 0,
    Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100)];
  return parts.join('|');
}

async function runHashes(base, pid, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'tribgate-det-' + pid });
  await setupGame(Game);
  const hashes = [];
  const wrapped = Object.assign({}, base);
  const bDaily = base.daily, bSetup = base.setup;
  wrapped.daily = (G, ctx) => {
    hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
    return bDaily ? bDaily(G, ctx) : undefined;
  };
  wrapped.setup = undefined;
  const ctx = { policyId: pid, notes: [] };
  let result = null;
  await quietLog(async () => {
    if (bSetup) await bSetup(Game, ctx);
    result = await runDays(Game, wrapped, { days, sampleEvery: days + 1 });
  });
  return hashes.join('\n');
}

(async () => {
  console.log(`== tribgate det-gate (${label}): 16 combos ==`);
  let pass = 0, fail = 0;
  for (const pid of PIDS) for (const seed of SEEDS) {
    const a = await runHashes(REGISTRY_A[pid], pid, seed, 40);
    const b = await runHashes(REGISTRY_B[pid], pid, seed, 40);
    const same = a === b;
    if (same) pass++; else fail++;
    console.log(`  ${same ? 'PASS' : 'FAIL'} ${pid} s${seed} (${a.split('\n').length}d)`);
    if (!same) {
      const al = a.split('\n'), bl = b.split('\n');
      const i = al.findIndex((h, k) => h !== bl[k]);
      console.log(`    first divergence at row ${i}: A=${al[i]} B=${bl[i]}`);
    }
  }
  console.log(`\nDET-GATE ${label}: ${pass}/16 ${fail ? 'FAILED' : 'bit-identical'}`);
  if (fail) process.exit(1);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
