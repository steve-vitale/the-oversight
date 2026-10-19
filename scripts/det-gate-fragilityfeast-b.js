#!/usr/bin/env node
// scripts/det-gate-fragilityfeast-b.js — det-gate for SIM-FRAGILITYFEAST.
// 16 seed-policy combos (8 seeds x fragleadfeast/fragbelongfeast), each run
// TWICE at 40d, per-day state hashes compared. 16/16 bit-identical required
// before trusting the pilot's before/after (r27 rule). Side selected by
// FRAGFEAST=1 (armed) vs unset (control: pure delegation to
// leadfeast/belongfeast — the R1 pin). FEASTSCALE_R13=1 on both sides.
//
// Usage:
//   FEASTSCALE_R13=1 node scripts/det-gate-fragilityfeast-b.js            # control
//   FEASTSCALE_R13=1 FRAGFEAST=1 node scripts/det-gate-fragilityfeast-b.js # armed
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

let FF = null;
try { FF = require('./policies/fragilityfeast'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: fragilityfeast layer deleted per kill protocol (KILLED AT PILOT); det-gate status in evidence/2026-10-19/sim-fragilityfeast-b.md');
    process.exit(0);
  }
  throw e;
}
const ARMED = process.env.FRAGFEAST === '1';
const REGISTRY = {
  fragleadfeast: FF.fragleadfeast,
  fragbelongfeast: FF.fragbelongfeast,
};

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const PIDS = ['fragleadfeast', 'fragbelongfeast'];

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
  const { Game } = await loadGame({ seed, mode: 'fragilityfeast-det-' + pid });
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
  console.log(`== fragilityfeast det-gate (${ARMED ? 'armed' : 'control'}): 16 combos x2 ==`);
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
      console.log(`    first divergence at row ${i}: A=${al[i]} B=${bl[k]}`);
    }
  }
  console.log(fail ? `\nRESULT: ${fail} FAILURES` : `\nRESULT: det-gate GREEN ${pass}/16 bit-identical`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
