#!/usr/bin/env node
// diag-teachplant-needs.js — diagnostic: why don't the r6 need-frames fire
// in competent+ask sims? Records player breadth/health/hunger at each
// agencyTeachPlant call, plus the computed need.
// Usage: SEEDS="1,2,3" DAYS=100 node scripts/diag-teachplant-needs.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

function askRound(Game) {
  let n = 0;
  try {
    const v = Game.state.village || {};
    const news = v.explorerNews || {};
    const ids = Object.keys(news).filter(id => id !== Game.villagerId);
    for (const vid of ids) {
      try {
        if (!((v.roster || []).includes(vid))) continue;
        const st = Game.startConvo(vid);
        if (!st) continue;
        const choices = Game.convoChoices(vid) || [];
        const ac = choices.find(c => c.id && String(c.id).indexOf('agency:') === 0);
        if (ac) { try { Game.convoTurn(vid, ac.id); n++; } catch (e) {} }
        try { Game.endConvo(vid, 'left'); } catch (e) {}
      } catch (e) {}
    }
  } catch (e) {}
  return n;
}

(async () => {
  const seeds = (process.env.SEEDS || '1,2,3').split(',').map(Number);
  const days = parseInt(process.env.DAYS || '100', 10);
  for (const seed of seeds) {
    const { Game, manifest } = await loadGame({ seed, mode: 'competent+ask', fullTelemetry: false });
    await setupGame(Game);
    const pid = Game.villagerId;
    const _tp = Game.agencyTeachPlant;
    Game.agencyTeachPlant = function (vid) {
      // snapshot player state BEFORE the call (need is computed inside)
      let breadth = -1, health = -1, hunger = -1;
      try { breadth = Object.keys((Game.state.codex || {}).plants || {}).length; } catch (e) {}
      try { health = ((Game.state.village || {}).health || {})[pid]; } catch (e) {}
      try { hunger = Game.npcNeeds(pid).hunger; } catch (e) {}
      const r = _tp.call(this, vid);
      if (r) {
        const day = (Game.state.scholar || {}).day || 0;
        console.log(`seed=${seed} day=${day} breadth=${breadth} health=${health} hunger=${hunger} -> taught`);
      }
      return r;
    };
    const policy = Object.assign({}, competent);
    const origDaily = competent.daily;
    policy.daily = (G, ctx) => {
      if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
      try { askRound(G); } catch (e) {}
    };
    await runDays(Game, policy, { days, manifest, sampleEvery: 999 });
  }
})();
