#!/usr/bin/env node
// scripts/det-gate-aidspoil-20261015.js — det-gate for SIM-AIDSPOIL.
// 8 seed-policy combos (8 seeds x aidLead), each run TWICE at 40d,
// per-day state hashes compared. 8/8 bit-identical required per
// condition before trusting the pilot's before/after (r27 rule); run
// both conditions for 16/16.
//
// Control condition: AIDDRIVER=1 (SPOILFIRST unset) — driver fires,
// current ordering. Armed: AIDDRIVER=1 + SPOILFIRST=1 — driver fires,
// spoil-first aid ordering.
//
// Usage:
//   AIDDRIVER=1 node scripts/det-gate-aidspoil-20261015.js
//   AIDDRIVER=1 SPOILFIRST=1 node scripts/det-gate-aidspoil-20261015.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

if (process.env.AIDDRIVER !== '1') {
  console.log('INFO-SKIP: det-gate needs AIDDRIVER=1 (control) or AIDDRIVER=1 SPOILFIRST=1 (armed)');
  process.exit(0);
}
const ARMED = process.env.SPOILFIRST === '1';
let AS = null;
try { AS = require('./policies/aidspoil'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: aidspoil driver absent; det-gate status in evidence/2026-10-15/sim-aidspoil-b.md');
    process.exit(0);
  }
  throw e;
}

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const PID = 'aidLead';

function dayHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const parts = [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
    (v.roster || []).length, Game.map.px, Game.map.py,
    Game.unlockedWave ? Game.unlockedWave() : 0,
    Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100)];
  return parts.join('|');
}

async function runHashes(seed, days) {
  const base = AS.aidLead;
  const { Game } = await loadGame({ seed, mode: 'aidspoil-det' });
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
  console.log(`== aidspoil det-gate (${ARMED ? 'ARMED: AIDDRIVER=1 + SPOILFIRST=1' : 'CONTROL: AIDDRIVER=1'}) ==`);
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
    : `\nDET-GATE: ${SEEDS.length}/${SEEDS.length} bit-identical (${ARMED ? 'armed' : 'control'})`);
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
