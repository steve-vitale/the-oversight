#!/usr/bin/env node
// scripts/det-gate-trajclose-20261016.js — det-gate for SIM-TRAJCLOSE-B.
// 8 seeds (the original aidspoil seeds) x trajLead, each run TWICE at 40d,
// per-day state hashes compared. 8/8 bit-identical required before
// trusting the sweep's before/after (r27 rule).
//
// Armed condition: TRAJCLOSE=1 (+ FEASTSCALE_R13=1, the road the driver
// rides). Gate-off byte-identical is pinned by the proof's R1
// (scripts/test-trajclose-20261016.js).
//
// Usage:
//   TRAJCLOSE=1 FEASTSCALE_R13=1 node scripts/det-gate-trajclose-20261016.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

if (process.env.TRAJCLOSE !== '1') {
  console.log('INFO-SKIP: det-gate needs TRAJCLOSE=1 (+ FEASTSCALE_R13=1)');
  process.exit(0);
}
let TC = null;
try { TC = require('./policies/trajclose'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: trajclose driver absent; det-gate status in evidence/2026-10-16/sim-trajclose-b.md');
    process.exit(0);
  }
  throw e;
}

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];

function dayHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const parts = [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
    (v.roster || []).length, Game.map.px, Game.map.py,
    Game.unlockedWave ? Game.unlockedWave() : 0,
    Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100)];
  return parts.join('|');
}

async function runHashes(seed, days) {
  const base = TC.trajLead;
  const { Game } = await loadGame({ seed, mode: 'trajclose-det' });
  await setupGame(Game);
  const hashes = [];
  const wrapped = Object.assign({}, base);
  const bDaily = base.daily, bSetup = base.setup, bUpkeep = base.upkeep;
  wrapped.setup = (G, ctx) => { if (bSetup) return bSetup(G, ctx); };
  wrapped.upkeep = (G, ctx) => { if (bUpkeep) return bUpkeep(G, ctx); };
  wrapped.daily = (G, ctx) => {
    hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
    if (bDaily) return bDaily(G, ctx);
  };
  await quietLog(async () => { await runDays(Game, wrapped, { days, sampleEvery: 1 }); });
  return hashes;
}

(async () => {
  console.log('== trajclose det-gate (ARMED: TRAJCLOSE=1 + FEASTSCALE_R13=1) ==');
  const fails = [];
  for (const seed of SEEDS) {
    const h1 = await runHashes(seed, 40);
    const h2 = await runHashes(seed, 40);
    const ok = h1.length === h2.length && h1.every((h, i) => h === h2[i]);
    console.log(`  ${ok ? 'PASS' : 'FAIL'} seed ${seed} — n=${h1.length}/${h2.length}`);
    if (!ok) fails.push(seed);
  }
  console.log(fails.length
    ? `\nDET-GATE: ${fails.length} FAILURE(S) — seeds ${fails.join(', ')}`
    : `\nDET-GATE: ${SEEDS.length}/${SEEDS.length} bit-identical (armed)`);
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
