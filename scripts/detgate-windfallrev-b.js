#!/usr/bin/env node
// detgate-windfallrev-b.js — gate-off determinism (sim-windfallrev-b):
// wrapped+PORTIONWINDFALL-unset must be byte-identical to the unwrapped base
// policy over 40d, and two wrapped+unset runs must be byte-identical to each
// other. Also pins that the reconciliation flags change nothing when the
// layer is off (set to junk values — still pure delegation).
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');
let withPortionWindfall;
try { ({ withPortionWindfall } = require('./policies/portionwindfall')); }
catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: sim-windfallrev-b layer killed per protocol; det-gate vacuous, exit 0.');
    process.exit(0);
  }
  throw e;
}

const wrapped = withPortionWindfall(leadfeast, 'leadwindfallrev', 't');

async function run(seed, policy) {
  const { Game } = await loadGame({ seed, mode: 'detgate-windfallrev', fullTelemetry: false });
  await setupGame(Game);
  const r = await runDays(Game, policy, { days: 40, manifest: null });
  const v = Game.state.village || {};
  const pk = (v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  return JSON.stringify({
    days: r.days, pk: Math.round(pk), roster: (v.roster || []).length,
    sk: Math.round((Game.state.scholar || {}).kcal || 0),
    sd: (Game.state.scholar || {}).day || 0,
  });
}

(async () => {
  delete process.env.PORTIONWINDFALL;
  process.env.WINDFALL_RECONCILE = '1';   // junk-when-off: must not matter
  process.env.WINDFALL_YIELD_SMOKE = '0'; // junk-when-off: must not matter
  let fail = 0;
  for (const seed of [6801, 6802]) {
    const a = await run(seed, wrapped);
    const b = await run(seed, wrapped);
    const c = await run(seed, leadfeast);
    const same1 = a === b, same2 = a === c;
    console.log(`seed=${seed} wrapped==wrapped: ${same1}  wrapped==base: ${same2}`);
    console.log(`  ${a}`);
    if (!same1 || !same2) fail++;
  }
  delete process.env.WINDFALL_RECONCILE;
  delete process.env.WINDFALL_YIELD_SMOKE;
  console.log(fail ? 'DET-GATE FAIL' : 'DET-GATE GREEN');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('DETGATE ERROR', e); process.exit(2); });
