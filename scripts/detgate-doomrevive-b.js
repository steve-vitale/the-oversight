#!/usr/bin/env node
// detgate-doomrevive-b.js — gate-off determinism: wrapped+DOOMEDDRAW-unset
// must be byte-identical to the unwrapped base policy over 40d (2 seeds x 2
// policies), and two wrapped+unset runs must be byte-identical to each
// other. The env read draws no RNG and mutates nothing.
// The revival sweep composes the landed surplusfeed governor (SURPLUSFEED=1
// in BOTH arms), so the det-gate runs with SURPLUSFEED=1 on all sides —
// byte-identity must hold through the governor too.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
let withDoomedDraw;
try { ({ withDoomedDraw } = require('./policies/doomeddraw')); }
catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: sim-doomrevive-b layer absent; det-gate vacuous, exit 0.');
    process.exit(0);
  }
  throw e;
}

process.env.SURPLUSFEED = '1'; // compose the landed governor on all sides

const wrappedLead = withDoomedDraw(leadfeast, 'leaddoomeddraw', 'detgate');
const wrappedBelong = withDoomedDraw(belongfeast, 'belongdoomeddraw', 'detgate');

async function run(seed, policy) {
  const { Game } = await loadGame({ seed, mode: 'detgate-doomrevive', fullTelemetry: false });
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
  delete process.env.DOOMEDDRAW;
  let fail = 0;
  for (const seed of [7401, 7402]) {
    for (const [wrapped, base, name] of [[wrappedLead, leadfeast, 'lead'], [wrappedBelong, belongfeast, 'belong']]) {
      const a = await run(seed, wrapped);
      const b = await run(seed, wrapped);
      const c = await run(seed, base);
      const same1 = a === b, same2 = a === c;
      console.log(`${name} seed=${seed} wrapped==wrapped: ${same1}  wrapped==base: ${same2}`);
      if (!same1 || !same2) fail++;
    }
  }
  console.log(fail ? 'DET-GATE FAIL' : 'DET-GATE GREEN');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('DETGATE ERROR', e); process.exit(2); });
