#!/usr/bin/env node
// diag-scholar-deaths-r1.js — count scholar (bearer) deaths via villagerId
// changes, plus population trajectory. The death telemetry doesn't record
// bearer deaths (tb player-death branch has no registerDeath).
// Usage: COMPETENT_DIRECTIONAL_FLEE=1 SEEDS="44" node scripts/diag-scholar-deaths-r1.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { POLICY_REGISTRY } = require('./sweep-compare');

(async () => {
  const seeds = (process.env.SEEDS || '44').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const gate = process.env.COMPETENT_DIRECTIONAL_FLEE === '1' ? 'AFTER' : 'BEFORE';
  for (const seed of seeds) {
    const { Game } = await loadGame({ seed, mode: 'scholardeaths' });
    await setupGame(Game);
    const base = Object.assign({}, POLICY_REGISTRY['competent']);
    const origDaily = base.daily;
    let lastBearer = null, scholarDeaths = 0;
    const popTrace = [];
    base.daily = (G, ctx) => {
      try {
        const b = G.villagerId;
        if (lastBearer !== null && b !== lastBearer) {
          scholarDeaths++;
        }
        lastBearer = b;
        const pop = ((G.state.village || {}).roster || []).length;
        const day = (G.state.scholar || {}).day || 0;
        popTrace.push([day, pop]);
      } catch (e) {}
      try { return origDaily(G, ctx); } catch (e) {}
    };
    const result = await runDays(Game, base, { days: 150, sampleEvery: 150 });
    const first = popTrace[0], last = popTrace[popTrace.length - 1];
    console.log(`${gate} seed ${seed}: days=${result.days} end=${result.endReason} scholarDeaths=${scholarDeaths} pop ${first[1]}->${last[1]}`);
    // show when population dropped
    let prev = first[1];
    const drops = [];
    for (const [d, p] of popTrace) {
      if (p < prev) drops.push(`d${d}:${prev}->${p}`);
      prev = p;
    }
    console.log(`  pop drops: ${drops.join(' ') || '(none recorded)'}`);
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
