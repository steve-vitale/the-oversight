#!/usr/bin/env node
// scripts/det-gate-siegeroster-20261015.js — determinism gate for SIEGEROSTER.
//
// Runs the armed policy twice on the same seeds and asserts identical
// trajectories (days + endReason + postVillagerCombatDeaths). The layer
// uses no RNG (threat detection, travel, assignments, beats are all
// deterministic), so armed runs must be bit-identical.
// Run: node scripts/det-gate-siegeroster-20261015.js
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.SIEGEROSTER = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { siegerosterleadfeast } = require('./policies/siegeroster');

const SEEDS = [11, 22];
const DAYS = 60;

async function fingerprint(seed) {
  const { Game } = await loadGame({ seed, mode: 'siegeroster-det', fullTelemetry: true });
  await setupGame(Game);
  const policy = Object.assign({}, siegerosterleadfeast);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 10 }); });
  const deaths = (result.samples.deaths || []).filter(d =>
    (d.kind === 'villager' || d.kind === 'person') && !d.player &&
    (d.cause === 'monster' || d.cause === 'combat'));
  return `${result.days}|${result.endReason}|${deaths.length}|${deaths.map(d => d.day + ':' + d.who).join(',')}`;
}

(async () => {
  let fail = 0;
  for (const seed of SEEDS) {
    const a = await fingerprint(seed);
    const b = await fingerprint(seed);
    const ok = a === b;
    console.log(`  ${ok ? 'PASS' : 'FAIL'} seed ${seed} deterministic — ${a.slice(0, 60)}`);
    if (!ok) { fail++; console.log(`    run1: ${a}`); console.log(`    run2: ${b}`); }
  }
  // Gate-off determinism: unset gate == pure leadfeast (already proven by
  // the proof's RED phase; the wrapper delegates).
  console.log(fail ? `\nDET-GATE FAIL: ${fail} seed(s)` : '\nDET-GATE GREEN — armed runs bit-identical');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
