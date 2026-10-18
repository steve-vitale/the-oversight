#!/usr/bin/env node
// detgate-racksanswer-b.js — gate-off determinism: wrapped+RACKSANSWER-unset
// must be byte-identical to the unwrapped base policy over 40d, and two
// wrapped+unset runs must be byte-identical to each other.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');
const { withRacksAnswer } = require('./policies/racksanswer-b');

const wrapped = withRacksAnswer(leadfeast, 'leadfeast+windfall', 't');

async function run(seed, policy) {
  const { Game } = await loadGame({ seed, mode: 'detgate-racksanswer', fullTelemetry: false });
  await setupGame(Game);
  const r = await runDays(Game, policy, { days: 40, manifest: null });
  // Canonical end-state: days, pantry kcal, roster, scholar kcal/day.
  const v = Game.state.village || {};
  const pk = (v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  return JSON.stringify({
    days: r.days, pk: Math.round(pk), roster: (v.roster || []).length,
    sk: Math.round((Game.state.scholar || {}).kcal || 0),
    sd: (Game.state.scholar || {}).day || 0,
  });
}

(async () => {
  delete process.env.RACKSANSWER;
  let fail = 0;
  for (const seed of [4801, 4802]) {
    const a = await run(seed, wrapped);
    const b = await run(seed, wrapped);
    const c = await run(seed, leadfeast);
    const same1 = a === b, same2 = a === c;
    console.log(`seed=${seed} wrapped==wrapped: ${same1}  wrapped==base: ${same2}`);
    console.log(`  ${a}`);
    if (!same1 || !same2) fail++;
  }
  console.log(fail ? 'DET-GATE FAIL' : 'DET-GATE GREEN');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('DETGATE ERROR', e); process.exit(2); });
