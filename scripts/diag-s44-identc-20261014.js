#!/usr/bin/env node
// Ident C: runDays on s44 with a daily fight-spy — prints the live fight's
// roster, per-monster HP, and round count when the fight exceeds thresholds.
'use strict';
process.env.FOURTHLINK = '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { fourthlink } = require('./policies/fourthlink');

(async () => {
  const t0 = Date.now();
  const { Game } = await loadGame({ seed: 44, mode: 'succession-ident44c' });
  await setupGame(Game);
  const policy = Object.assign({}, fourthlink);
  const origDaily = policy.daily;
  let lastSnap = '';
  policy.daily = (G, ctx) => {
    if (origDaily) origDaily(G, ctx);
    const f = G.tbfight;
    if (f && !f.over) {
      const sig = (f.fighters || []).map(x =>
        `${x.name || x.key}[${x.kind}] hp=${Math.round(x.hp || 0)}/${Math.round(x.maxHp || 0)} @${x.mx},${x.my} alive=${!!x.alive} fled=${!!x.fled} atk=${(x.mdef && x.mdef.attack && x.mdef.attack.name) || '?'}`).join(' | ');
      const key = `day=${(G.state.scholar || {}).day} round=${f.round} :: ${sig}`;
      if (key !== lastSnap) {
        lastSnap = key;
        console.error(key);
      }
    }
  };
  const w = setTimeout(() => { console.error('WALL 150s'); process.exit(3); }, 150000);
  w.unref();
  const result = await runDays(Game, policy, { days: 70, sampleEvery: 10 });
  console.error(`runDays returned: days=${result.days} endReason=${result.endReason} elapsed=${((Date.now() - t0) / 1000).toFixed(0)}s`);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
