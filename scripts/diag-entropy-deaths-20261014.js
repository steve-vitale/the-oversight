'use strict';
// diag-entropy-deaths-20261014.js — compare the DEATH event streams between
// two in-process runs. Who dies, when, of what? Catches a divergent pair.
process.env.FEASTSCALE_R13 = '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

async function one(seed) {
  const { Game } = await loadGame({ seed, mode: 'entropy-deaths' });
  await setupGame(Game);
  const r = await runDays(Game, leadfeast, { days: 180, sampleEvery: 10 });
  const deaths = (r.samples.deaths || []).map(d => d.day + ':' + d.kind + ':' + (d.player ? 'P' : 'V') + ':' + (d.cause || '?'));
  return { deaths, days: r.days, endReason: r.endReason };
}

(async () => {
  for (let attempt = 1; attempt <= 6; attempt++) {
    const a = await one(44), b = await one(44);
    const div = (a.days !== b.days) || (a.endReason !== b.endReason);
    console.log('attempt', attempt, 'endA', a.days + '/' + a.endReason, 'endB', b.days + '/' + b.endReason, div ? 'DIVERGED' : 'identical');
    if (!div) continue;
    console.log('deaths A (' + a.deaths.length + '):', a.deaths.join(' | '));
    console.log('deaths B (' + b.deaths.length + '):', b.deaths.join(' | '));
    const n = Math.min(a.deaths.length, b.deaths.length);
    for (let i = 0; i < n; i++) {
      if (a.deaths[i] !== b.deaths[i]) {
        console.log('FIRST DEATH DIFF at idx', i, '\n  A:', a.deaths[i], '\n  B:', b.deaths[i]);
        break;
      }
    }
    if (a.deaths.length !== b.deaths.length) console.log('death COUNT differs');
    break;
  }
})().catch(e => { console.error('FAIL', e); process.exit(1); });
