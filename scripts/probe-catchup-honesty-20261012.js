#!/usr/bin/env node
// probe-catchup-honesty-20261012.js — is catchUpSim honest? Snapshot a distant
// village before/after approach: days lived, roster deaths with names, pantry,
// news. Proves the design rule "on approach, the game runs a catch-up sim of
// all days since start" is real in practice, not just code.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { winseek } = require('./policies/winseek');
const SEED = parseInt(process.env.SEED || '12', 10);
const policy = Object.assign({}, winseek, {
  id: 'travelwinseek',
  daily(Game, ctx) {
    try { if (winseek.daily) winseek.daily(Game, ctx); } catch (e) {}
    try {
      if (!Game._cu) {
        Game._cu = { snaps: [] };
        const oc = Game.catchUpSim.bind(Game);
        Game.catchUpSim = function (v) {
          try {
            const day = (Game.state.scholar || {}).day || 0;
            const before = {
              id: v.id, name: v.name, day: v.day, pop: v.population,
              pantry: Math.round(v.pantryKcal || 0),
              roster: (v.roster || []).length,
              alive: (v.roster || []).filter(p => p.alive).length,
              news: (v.news || []).length,
              generated: !!v.generated,
            };
            const r = oc(v);
            const after = {
              day: v.day, pop: v.population,
              pantry: Math.round(v.pantryKcal || 0),
              alive: (v.roster || []).filter(p => p.alive).length,
              news: (v.news || []).length,
              dead: (v.roster || []).filter(p => !p.alive).map(p => p.name || p.id),
              sampleNews: (v.news || []).slice(-2),
            };
            if (day >= 20 && !v.generated || Game._cu.snaps.length < 12)
              Game._cu.snaps.push({ gameDay: day, before, after });
          } catch (e) {}
          return undefined;
        };
      }
    } catch (e) {}
  },
});
(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'travelwinseek', fullTelemetry: false });
  await setupGame(Game);
  await runDays(Game, policy, { days: 200 });
  const snaps = (Game._cu || {}).snaps || [];
  for (const s of snaps.slice(0, 14)) {
    console.log(JSON.stringify(s));
  }
  console.log('total catch-up calls:', (Game._cu || {}).total || '?');
})().catch(e => { console.error('FATAL', e); process.exit(2); });
