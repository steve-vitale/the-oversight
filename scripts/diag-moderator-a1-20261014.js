#!/usr/bin/env node
// Trace how the leadcourt/55 Moderator fight ends WITHOUT the guard.
'use strict';
process.env.FOURTHLINK = '1';
process.env.WHIFFGUARD = '0';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { fourthlink } = require('./policies/fourthlink');

(async () => {
  const t0 = Date.now();
  const { Game } = await loadGame({ seed: 55, mode: 'mod-a1-55' });
  await setupGame(Game);
  const origEnd = Game.tbEnd.bind(Game);
  Game.tbEnd = function (res) {
    try {
      const f = Game.tbfight;
      if (f) {
        const mons = (f.fighters || []).filter(x => x.kind === 'monster')
          .map(m => (m.mdef ? m.mdef.id : m.key)).join(',');
        if (/moderator/.test(mons)) {
          const gd = (Game.state.scholar || {}).day || 0;
          console.error(`[MOD-END] day=${gd} round=${f.round} result=${res} mons=[${mons}]`);
        }
      }
    } catch (e) {}
    return origEnd(res);
  };
  const policy = Object.assign({}, fourthlink);
  const origDaily = policy.daily;
  policy.daily = (G, ctx) => {
    if (origDaily) origDaily(G, ctx);
    const f = G.tbfight;
    if (f && !f.over) {
      const mons = (f.fighters || []).filter(x => x.kind === 'monster')
        .map(m => (m.mdef ? m.mdef.id : m.key)).join(',');
      if (/moderator/.test(mons) && (f.round % 500 === 0)) {
        const gd = (G.state.scholar || {}).day || 0;
        console.error(`[MOD-LIVE] day=${gd} round=${f.round}`);
      }
    }
  };
  const result = await runDays(Game, policy, { days: 100, sampleEvery: 10 });
  console.error(`done days=${result.days} end=${result.endReason} elapsed=${((Date.now() - t0) / 1000).toFixed(0)}s`);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
