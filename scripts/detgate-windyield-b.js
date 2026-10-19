#!/usr/bin/env node
// detgate-windyield-b.js — gate-off determinism (sim-windyield-b):
// wrapped+WINDYIELD-unset must be byte-identical to the unwrapped base
// policy over 40d, and two wrapped+unset runs must be byte-identical to each
// other (2 seeds x 2 policies).
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
let withWindyield;
try { ({ withWindyield } = require('./policies/windyield')); }
catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: sim-windyield-b layer killed per protocol; det-gate vacuous, exit 0.');
    process.exit(0);
  }
  throw e;
}

const wrappedLead = withWindyield(leadfeast, 'leadwindyield', 't');
const wrappedBelong = withWindyield(belongfeast, 'belongwindyield', 't');

async function run(seed, policy) {
  const { Game } = await loadGame({ seed, mode: 'detgate-windyield', fullTelemetry: false });
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
  delete process.env.WINDYIELD;
  let fail = 0;
  for (const seed of [6901, 6902]) {
    for (const [name, wrapped, base] of [['lead', wrappedLead, leadfeast], ['belong', wrappedBelong, belongfeast]]) {
      const a = await run(seed, wrapped);
      const b = await run(seed, wrapped);
      const c = await run(seed, base);
      const same1 = a === b, same2 = a === c;
      console.log(`seed=${seed} policy=${name} wrapped==wrapped: ${same1}  wrapped==base: ${same2}`);
      if (!same1 || !same2) fail++;
    }
  }
  console.log(fail ? 'DET-GATE FAIL' : 'DET-GATE GREEN');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('DETGATE ERROR', e); process.exit(2); });
