'use strict';
// diag-entropy-vitals2-20261014.js — vitals + deaths for a divergent pair.
// Finds when the roster first differs and what the deaths were.
process.env.FEASTSCALE_R13 = '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

async function one(seed, runNo) {
  const vitals = [];
  const { Game } = await loadGame({ seed, mode: 'entropy-vitals2' });
  await setupGame(Game);
  const base = leadfeast.daily;
  const policy = Object.assign({}, leadfeast);
  policy.daily = (G, ctx) => {
    const day = (Game.state.scholar || {}).day || 0;
    if (day >= 100 && day <= 115) {
      try {
        vitals.push({
          day,
          rosterLen: ((Game.state.village || {}).roster || []).length,
          codexPlants: Object.keys((Game.state.codex || {}).plants || {}).length,
        });
      } catch (e) {}
    }
    return base(G, ctx);
  };
  const r = await runDays(Game, leadfeast, { days: 180, sampleEvery: 10 });
  const deaths = (r.samples.deaths || []).map(d => d.day + ':' + d.kind + ':' + (d.player ? 'P' : 'V') + ':' + (d.cause || '?'));
  return { vitals, deaths, days: r.days, endReason: r.endReason };
}

(async () => {
  for (let attempt = 1; attempt <= 6; attempt++) {
    const a = await one(44, 0), b = await one(44, 1);
    const div = (a.days !== b.days) || (a.endReason !== b.endReason);
    console.log('attempt', attempt, 'endA', a.days + '/' + a.endReason, 'endB', b.days + '/' + b.endReason, div ? 'DIVERGED' : 'identical');
    if (!div) continue;
    const A = a.vitals, B = b.vitals;
    for (let i = 0; i < Math.min(A.length, B.length); i++) {
      if (A[i].rosterLen !== B[i].rosterLen || A[i].codexPlants !== B[i].codexPlants) {
        console.log('FIRST VITALS DIFF at day', A[i].day, 'A:', JSON.stringify(A[i]), 'B:', JSON.stringify(B[i]));
        break;
      }
    }
    console.log('deaths A:', a.deaths.join(' | '));
    console.log('deaths B:', b.deaths.join(' | '));
    break;
  }
})().catch(e => { console.error('FAIL', e); process.exit(1); });
