'use strict';
// diag-entropy-disease-20261014.js — capture the FULL disease events on
// days 105-115 in both runs of a divergent pair.
process.env.FEASTSCALE_R13 = '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

async function one(seed) {
  const { Game } = await loadGame({ seed, mode: 'entropy-disease', fullTelemetry: true });
  await setupGame(Game);
  const r = await runDays(Game, leadfeast, { days: 180, sampleEvery: 10 });
  const evs = (Game.state.telemetry || [])
    .filter(e => e.day >= 105 && e.day <= 115 && e.type === 'disease')
    .map(e => ({ day: e.day, id: e.id, pool: e.pool, target: e.target, source: e.source }));
  return { evs, days: r.days, endReason: r.endReason };
}

(async () => {
  for (let attempt = 1; attempt <= 6; attempt++) {
    const a = await one(44), b = await one(44);
    const div = (a.days !== b.days) || (a.endReason !== b.endReason);
    console.log('attempt', attempt, 'endA', a.days + '/' + a.endReason, 'endB', b.days + '/' + b.endReason, div ? 'DIVERGED' : 'identical');
    if (!div) continue;
    console.log('disease events A:', JSON.stringify(a.evs));
    console.log('disease events B:', JSON.stringify(b.evs));
    break;
  }
})().catch(e => { console.error('FAIL', e); process.exit(1); });
