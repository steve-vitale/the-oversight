#!/usr/bin/env node
// scripts/det-gate-belongfeast-20261015.js — det-gate for SIM-BELONGFEAST.
// 16 combos (8 seeds x control/armed), each run TWICE at 40d, per-day state
// hashes compared. 16/16 bit-identical required before trusting the sweep's
// before/after (r27 rule). Side selected by OVERDRAWFLOOR=1 (armed:
// overbelongfloor) vs unset (control: belongseek).
//
// INFO-SKIP: missing overdrawfloor layer -> exit 0, never MODULE_NOT_FOUND.
//
// Usage:
//   node scripts/det-gate-belongfeast-20261015.js          # control
//   OVERDRAWFLOOR=1 node scripts/det-gate-belongfeast-20261015.js  # armed
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

let ODF = null;
try { ODF = require('./policies/overdrawfloor'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: overdrawfloor layer absent (killed lineage); det-gate cannot run');
    process.exit(0);
  }
  throw e;
}
const ARMED = process.env.OVERDRAWFLOOR === '1';
// NAMED-EXPORT UNWRAP (finding #69 gate): never Object.assign({}, require(...)).
const POLICY = ARMED ? ODF.overbelongfloor : require('./policies/belongseek').belongseek;

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
  const { Game } = await loadGame({ seed, mode: 'belongfeast-det' });
  await setupGame(Game);
  const hashes = [];
  const wrapped = Object.assign({}, POLICY);
  const bDaily = POLICY.daily, bSetup = POLICY.setup;
  wrapped.daily = (G, ctx) => {
    hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
    return bDaily ? bDaily(G, ctx) : undefined;
  };
  // setup runs once, manually — not through runDays (avoids double say-wrap
  // install; the harness-side ctx is irrelevant to the hashes).
  wrapped.setup = undefined;
  const ctx = { policyId: 'belongfeast', notes: [] };
  let result = null;
  await quietLog(async () => {
    if (bSetup) await bSetup(Game, ctx);
    result = await runDays(Game, wrapped, { days, sampleEvery: days + 1 });
  });
  return hashes.join('\n');
}

(async () => {
  console.log(`== belongfeast det-gate (${ARMED ? 'armed' : 'control'}): 8 seeds x2 ==`);
  let pass = 0, fail = 0;
  for (const seed of SEEDS) {
    const a = await runHashes(seed, 40);
    const b = await runHashes(seed, 40);
    const same = a === b;
    if (same) pass++; else fail++;
    console.log(`  ${same ? 'PASS' : 'FAIL'} s${seed} (${a.split('\n').length}d)`);
    if (!same) {
      const al = a.split('\n'), bl = b.split('\n');
      const i = al.findIndex((h, k) => h !== bl[k]);
      console.log(`    first divergence at row ${i}: A=${al[i]} B=${bl[i]}`);
    }
  }
  console.log(fail ? `\nDET-GATE: ${fail} DIVERGED — do not trust comparisons` : `\nDET-GATE: ${pass}/8 bit-identical — comparisons controlled`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
