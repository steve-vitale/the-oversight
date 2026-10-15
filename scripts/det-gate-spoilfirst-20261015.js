#!/usr/bin/env node
// scripts/det-gate-spoilfirst-20261015.js — det-gate for SIM-SPOILFIRST.
// 16 seed-policy combos (8 seeds x spoilLead/spoilBelong), each run TWICE
// at 40d, per-day state hashes compared. 16/16 bit-identical required per
// condition before trusting the pilot's before/after (r27 rule); run both
// conditions for 32/32.
//
// Control condition: SFDRIVER=1 (SPOILFIRST unset) — driver fires, current
// ordering. Armed: SFDRIVER=1 + SPOILFIRST=1 — driver fires, spoil-first.
//
// Usage:
//   SFDRIVER=1 node scripts/det-gate-spoilfirst-20261015.js
//   SFDRIVER=1 SPOILFIRST=1 node scripts/det-gate-spoilfirst-20261015.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

if (process.env.SFDRIVER !== '1') {
  console.log('INFO-SKIP: det-gate needs SFDRIVER=1 (control) or SFDRIVER=1 SPOILFIRST=1 (armed)');
  process.exit(0);
}
const ARMED = process.env.SPOILFIRST === '1';
let SF = null;
try { SF = require('./policies/spoilfirst'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: spoilfirst driver deleted per kill protocol (KILLED AT PILOT); det-gate status in evidence/2026-10-15/sim-spoilfirst-b.md');
    process.exit(0);
  }
  throw e;
}
const REGISTRY = { spoilLead: SF.spoilLead, spoilBelong: SF.spoilBelong };

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const PIDS = ['spoilLead', 'spoilBelong'];

function dayHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const parts = [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
    (v.roster || []).length, Game.map.px, Game.map.py,
    Game.unlockedWave ? Game.unlockedWave() : 0,
    Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100)];
  return parts.join('|');
}

async function runHashes(pid, seed, days) {
  const base = REGISTRY[pid];
  const { Game } = await loadGame({ seed, mode: 'spoilfirst-det-' + pid });
  await setupGame(Game);
  const hashes = [];
  const wrapped = Object.assign({}, base);
  const bDaily = base.daily, bSetup = base.setup, bUpkeep = base.upkeep;
  wrapped.daily = (G, ctx) => {
    hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
    return bDaily ? bDaily(G, ctx) : undefined;
  };
  wrapped.upkeep = (G, ctx) => { return bUpkeep ? bUpkeep(G, ctx) : undefined; };
  wrapped.setup = undefined;
  const ctx = { policyId: pid, notes: [] };
  await quietLog(async () => {
    if (bSetup) await bSetup(Game, ctx);
    await runDays(Game, wrapped, { days, sampleEvery: days + 1 });
  });
  return hashes.join('\n');
}

(async () => {
  console.log(`== spoilfirst det-gate (${ARMED ? 'armed' : 'control'}): 16 combos x2 ==`);
  let pass = 0, fail = 0;
  for (const pid of PIDS) for (const seed of SEEDS) {
    const a = await runHashes(pid, seed, 40);
    const b = await runHashes(pid, seed, 40);
    const same = a === b;
    if (same) pass++; else fail++;
    console.log(`  ${same ? 'PASS' : 'FAIL'} ${pid} s${seed} (${a.split('\n').length}d)`);
    if (!same) {
      const al = a.split('\n'), bl = b.split('\n');
      const i = al.findIndex((h, k) => h !== bl[k]);
      console.log(`    first divergence at row ${i}: A=${al[i]} B=${bl[i]}`);
    }
  }
  console.log(fail ? `\nDET-GATE: ${fail} DIVERGED — do not trust comparisons` : `\nDET-GATE: ${pass}/16 bit-identical — comparisons controlled`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
