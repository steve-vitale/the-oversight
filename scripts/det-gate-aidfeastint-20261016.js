#!/usr/bin/env node
// scripts/det-gate-aidfeastint-20261016.js — det-gate for SIM-AIDFEASTINT-B.
// 8 seeds x 40d, per-day state hashes. Two conditions per wrapper:
//   (a) gates OFF: wrapper byte-identical to its road parent;
//   (b) gates ON: armed determinism (run twice, bit-identical).
// Wrappers: aidBelong, feastBelongDrawdown (belong road), aidFeastBoth
// (lead road composition), aidFeastBothBelong (belong road composition).
// The lead-road single wrappers are det-gated by the kept 20261015 scripts.
// Env: FEASTSCALE_R13=1 (the factorial road); flip AIDDRAIN/FEASTDRAWDOWN
// per condition. SEATDRIVE=0 like the sweep.
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
let AD = null, FD = null;
try {
  AD = require('./policies/aiddrain');
  FD = require('./policies/feastdrawdown');
} catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: aid/feast drivers absent (diagnostic layers deleted post-measurement); status in evidence/2026-10-16/sim-aidfeastint-b.md');
    process.exit(0);
  }
  throw e;
}
const { belongfeast, leadfeast } = require('./policies/feastscale');

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const CELLS = [
  { name: 'aidBelong', policy: AD.aidBelong, parent: belongfeast, gates: { AIDDRAIN: '1' } },
  { name: 'feastBelongDrawdown', policy: FD.feastBelongDrawdown, parent: belongfeast, gates: { FEASTDRAWDOWN: '1' } },
  { name: 'aidFeastBoth', policy: AD.withAidDrain(FD.feastDrawdown, 'aidFeastBoth'), parent: leadfeast, gates: { AIDDRAIN: '1', FEASTDRAWDOWN: '1' } },
  { name: 'aidFeastBothBelong', policy: AD.withAidDrain(FD.feastBelongDrawdown, 'aidFeastBothBelong'), parent: belongfeast, gates: { AIDDRAIN: '1', FEASTDRAWDOWN: '1' } },
];

function setGates(gates) {
  delete process.env.AIDDRAIN; delete process.env.FEASTDRAWDOWN;
  if (gates) for (const k of Object.keys(gates)) process.env[k] = gates[k];
}
function dayHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const parts = [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
    (v.roster || []).length, Game.map.px, Game.map.py,
    Game.unlockedWave ? Game.unlockedWave() : 0,
    Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100)];
  return parts.join('|');
}
async function runHashes(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'aidfeastint-det' });
  await setupGame(Game);
  const hashes = [];
  const wrapped = Object.assign({}, policy);
  const bDaily = policy.daily, bUpkeep = policy.upkeep;
  wrapped.daily = (G, ctx) => {
    hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
    if (bDaily) return bDaily(G, ctx);
  };
  wrapped.upkeep = (G, ctx) => { if (bUpkeep) return bUpkeep(G, ctx); };
  await quietLog(async () => { await runDays(Game, wrapped, { days, sampleEvery: 1 }); });
  return hashes;
}

(async () => {
  if (process.env.FEASTSCALE_R13 !== '1') { console.log('FEASTSCALE_R13=1 required'); process.exit(1); }
  process.env.SEATDRIVE = '0';
  const fails = [];
  for (const c of CELLS) {
    // (a) gates off: byte-identical to parent
    setGates(null);
    let okAll = true;
    for (const seed of SEEDS) {
      const h1 = await runHashes(c.policy, seed, 40);
      const h2 = await runHashes(c.parent, seed, 40);
      const ok = h1.length === h2.length && h1.every((h, i) => h === h2[i]);
      if (!ok) { okAll = false; fails.push(`${c.name}/off/s${seed}`); }
    }
    console.log(`  ${okAll ? 'PASS' : 'FAIL'} ${c.name} gates-off byte-identical to parent (8/8 seeds)`);
    // (b) gates on: armed determinism
    setGates(c.gates);
    okAll = true;
    for (const seed of SEEDS) {
      const h1 = await runHashes(c.policy, seed, 40);
      const h2 = await runHashes(c.policy, seed, 40);
      const ok = h1.length === h2.length && h1.every((h, i) => h === h2[i]);
      if (!ok) { okAll = false; fails.push(`${c.name}/on/s${seed}`); }
    }
    console.log(`  ${okAll ? 'PASS' : 'FAIL'} ${c.name} armed determinism (8/8 seeds)`);
  }
  console.log(fails.length ? `\nDET-GATE: ${fails.length} FAILURE(S) — ${fails.join(', ')}` : '\nDET-GATE: all cells green');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
