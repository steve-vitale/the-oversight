#!/usr/bin/env node
// Trace runDays on s44: FIGHTTRACE per driveFights + tbEnd/watchdog hooks +
// daily spy (fight round, contest). Find where wall time goes.
'use strict';
process.env.FOURTHLINK = '1';
process.env.FIGHTTRACE = '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { fourthlink } = require('./policies/fourthlink');

(async () => {
  const t0 = Date.now();
  const { Game } = await loadGame({ seed: 44, mode: 'succession-trace44' });
  await setupGame(Game);
  // watchdog hook: log tbEnd calls
  const origTbEnd = Game.tbEnd.bind(Game);
  Game.tbEnd = (r) => { console.error(`[TBEND] tbEnd('${r}') at wall=${((Date.now() - t0) / 1000).toFixed(0)}s`); return origTbEnd(r); };
  // slow-call hooks on doAction/sleep
  const origDo = Game.doAction.bind(Game);
  Game.doAction = (...a) => { const s = Date.now(); try { return origDo(...a); } finally { const ms = Date.now() - s; if (ms > 1000) console.error(`[SLOW] doAction(${a[0]}) ${ms}ms`); } };
  const origSleep = Game.sleep.bind(Game);
  Game.sleep = (...a) => { const s = Date.now(); try { return origSleep(...a); } finally { const ms = Date.now() - s; if (ms > 1000) console.error(`[SLOW] sleep ${ms}ms`); } };
  const policy = Object.assign({}, fourthlink);
  const origDaily = policy.daily;
  let lastDay = -1;
  policy.daily = (G, ctx) => {
    if (origDaily) origDaily(G, ctx);
    const gd = (G.state.scholar || {}).day || 0;
    if (gd !== lastDay) {
      lastDay = gd;
      const f = G.tbfight;
      const ac = G.state.activeContest ? (G.state.activeContest.id || G.state.activeContest.type || 'active') : 'none';
      console.error(`[DAY] gday=${gd} wall=${((Date.now() - t0) / 1000).toFixed(0)}s fight=${f ? (f.over ? 'over' : 'LIVE r=' + f.round) : 'none'} contest=${ac} freezeCleared=${ctx.timeFreezeCleared || 0}`);
    }
  };
  const w = setTimeout(() => { console.error('WALL 150s'); process.exit(3); }, 150000);
  w.unref();
  const result = await runDays(Game, policy, { days: 70, sampleEvery: 10 });
  console.error(`runDays returned: days=${result.days} endReason=${result.endReason} elapsed=${((Date.now() - t0) / 1000).toFixed(0)}s`);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
