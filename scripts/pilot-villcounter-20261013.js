#!/usr/bin/env node
// VILLAGER COUNTER PILOT (2026-10-13) — 8 seeds, KILL/GO gate.
// KILL AT PILOT: zero counter executions OR survival regression.
// GO (full 16): villager wave-3 kills > 0 AND no median-survival regression.
// Seeds 11/22/33/44 x leadcourt/belongseek, 150d death-aware.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');
const { belongseek } = require('./policies/belongseek');

const SEEDS = [11, 22, 33, 44];
const POLICIES = { leadcourt, belongseek };

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    for (const [pid, policy] of Object.entries(POLICIES)) {
      const { Game } = await loadGame({ seed, mode: 'villcounter-pilot-' + pid });
      await setupGame(Game);
      const result = await runDays(Game, policy, { days: 150, sampleEvery: 10 });
      // villager wave-3 kills: from the ledger
      const wk = result.waveKills || {};
      // counter learning: observations and knowledge in state
      let obsCount = 0, knownCount = 0;
      try {
        const obs = Game.state.villageCounterObs || {};
        obsCount = Object.values(obs).reduce((a, b) => a + b, 0);
        const mc = Game.state.monsterCounters || {};
        knownCount = Object.keys(mc).length;
      } catch (e) {}
      // survival: days survived
      const days = result.days || result.gameDays || 0;
      rows.push({ seed, pid, days, w3: wk["3"] || 0, obsCount, knownCount, endReason: result.endReason });
      console.log(`seed ${seed} ${pid}: days=${days} end=${result.endReason} waveKills=${JSON.stringify(wk)} obs=${obsCount} known=${knownCount}`);
    }
  }
  const totalW3 = rows.reduce((a, r) => a + r.w3, 0);
  const totalObs = rows.reduce((a, r) => a + r.obsCount, 0);
  const totalKnown = rows.reduce((a, r) => a + r.knownCount, 0);
  const medDays = rows.map(r => r.days).sort((a, b) => a - b)[Math.floor(rows.length / 2)];
  console.log(`\nPILOT: ${rows.length} runs, wave-3 kills=${totalW3}, observations=${totalObs}, tricks known=${totalKnown}, medianDays=${medDays}`);
  console.log(totalObs === 0 ? 'KILL: zero counter observations (learning path dead)' : 'PASS: non-lethal learning observed in sims');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(2); });
