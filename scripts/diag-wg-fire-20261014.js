#!/usr/bin/env node
// Trace guard firings: run (seed x policy) with the guard on, log every
// 'routed'-via-comes-apart (day, monsters alive, bodies on ground).
'use strict';
process.env.FOURTHLINK = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { fourthlink } = require('./policies/fourthlink');
const { belongseek } = require('./policies/belongseek');

const SEED = parseInt(process.env.SEED || '33', 10);
const POLICY = process.env.POLICY || 'leadcourt';
const DAYS = parseInt(process.env.DAYS || '100', 10);

(async () => {
  const t0 = Date.now();
  const { Game } = await loadGame({ seed: SEED, mode: 'wg-fire-' + POLICY });
  await setupGame(Game);
  const policy = POLICY === 'belongseek' ? belongseek : fourthlink;
  const origSay = Game.say.bind(Game);
  Game.say = function (msg) {
    try {
      if (/comes apart — no one in reach/.test(String(msg))) {
        const f = Game.tbfight;
        const gd = (Game.state.scholar || {}).day || 0;
        const alive = (f.fighters || []).filter(x => x.kind === 'monster' && x.alive && !x.fled)
          .map(m => (m.mdef ? m.mdef.id : m.key) + ':' + Math.round(m.hp || 0)).join(',');
        const bodies = (f.fighters || []).filter(x => x.kind === 'monster' && !x.alive)
          .map(m => (m.mdef ? m.mdef.id : m.key)).join(',');
        const p = Game.tbFighter('p');
        console.error(`[GUARD-FIRE] day=${gd} round=${f.round} alive=[${alive}] bodies=[${bodies}] php=${p ? Math.round(p.hp) : '?'}`);
      }
    } catch (e) {}
    return origSay(msg);
  };
  const result = await runDays(Game, policy, { days: DAYS, sampleEvery: 10 });
  console.error(`done days=${result.days} end=${result.endReason} elapsed=${((Date.now() - t0) / 1000).toFixed(0)}s`);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
