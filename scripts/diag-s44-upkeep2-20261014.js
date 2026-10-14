#!/usr/bin/env node
// Corrected sampler: CHAINS the real competent upkeep (the earlier sampler
// clobbered it, invalidating those runs). Samples contest + fight state.
'use strict';
process.env.FOURTHLINK = '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { fourthlink } = require('./policies/fourthlink');

(async () => {
  const t0 = Date.now();
  const { Game } = await loadGame({ seed: 44, mode: 'succession-upkeep2-44' });
  await setupGame(Game);
  const policy = Object.assign({}, fourthlink);
  const origUpkeep = policy.upkeep;
  const origDaily = policy.daily;
  let n = 0, lastPrint = 0;
  policy.upkeep = (G, ctx) => {
    if (origUpkeep) origUpkeep(G, ctx); // CHAIN the real upkeep
    n++;
    const now = Date.now();
    const f = G.tbfight;
    if (f && !f.over && now - lastPrint > 5000) {
      lastPrint = now;
      const ac = G.state.activeContest ? (G.state.activeContest.id || G.state.activeContest.kind || 'ACTIVE') : 'none';
      console.error(`[UP2] wall=${((now - t0) / 1000).toFixed(0)}s n=${n} fight LIVE r=${f.round} contest=${ac} ` +
        `mons=${(f.fighters || []).filter(x => x.kind === 'monster').map(m => (m.mdef ? m.mdef.id : m.key) + ':' + Math.round(m.hp || 0)).join(',')}`);
    }
  };
  policy.daily = (G, ctx) => {
    if (origDaily) origDaily(G, ctx);
    const gd = (G.state.scholar || {}).day || 0;
    const f = G.tbfight;
    const ac = G.state.activeContest ? 'ACTIVE' : 'none';
    console.error(`[D2] gday=${gd} wall=${((Date.now() - t0) / 1000).toFixed(0)}s fight=${f ? (f.over ? 'over' : 'LIVE r=' + f.round) : 'none'} contest=${ac}`);
  };
  const w = setTimeout(() => { console.error('WALL 150s'); process.exit(3); }, 150000);
  w.unref();
  const result = await runDays(Game, policy, { days: 70, sampleEvery: 10 });
  console.error(`runDays returned: days=${result.days} endReason=${result.endReason} elapsed=${((Date.now() - t0) / 1000).toFixed(0)}s`);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
