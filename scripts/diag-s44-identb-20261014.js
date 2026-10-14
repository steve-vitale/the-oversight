#!/usr/bin/env node
// Identify the s44 infinite-fight monster from INSIDE runDays.
'use strict';
process.env.FOURTHLINK = '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { fourthlink } = require('./policies/fourthlink');

(async () => {
  const { Game } = await loadGame({ seed: 44, mode: 'succession-ident44b' });
  await setupGame(Game);
  const policy = Object.assign({}, fourthlink);
  const origDaily = policy.daily;
  let done = false;
  policy.daily = (G, ctx) => {
    if (origDaily) origDaily(G, ctx);
    const f = G.tbfight;
    if (!done && f && !f.over && (f.round | 0) > 5000) {
      done = true;
      console.error(`day=${(G.state.scholar || {}).day} fight id=${f.id} round=${f.round}`);
      for (const x of (f.fighters || [])) {
        console.error(`  fighter: ${x.name || x.key} kind=${x.kind} hp=${Math.round(x.hp || 0)}/${Math.round(x.maxHp || 0)} pos=${x.mx},${x.my}`);
      }
      try { console.error(`  scholar hp=${(G.state.scholar || {}).hp} pos=${(G.state.scholar || {}).x},${(G.state.scholar || {}).y}`); } catch (e) {}
      process.exit(0);
    }
  };
  const t0 = Date.now();
  const w = setTimeout(() => { console.error('WALL 100s: fight never reached 5000 rounds in-daily (day clock may be frozen before daily)'); process.exit(3); }, 100000);
  w.unref();
  await runDays(Game, policy, { days: 70, sampleEvery: 10 });
  console.error('runDays returned without a long fight');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
