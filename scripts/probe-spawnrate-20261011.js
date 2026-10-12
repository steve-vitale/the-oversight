#!/usr/bin/env node
// probe-spawnrate-20261011.js — measure the SPAWN-level (not fight) rate of
// giant_mosquito / alien_tick: patch pickSpawnMonster + castMonster, count
// picks by wave and id across competent runs.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const SEEDS = (process.env.SEEDS || '7,42,99,2026,4242,987654').split(',').map(Number);
const DAYS = parseInt(process.env.DAYS || '200', 10);

async function one(seed) {
  const { Game } = await loadGame({ seed, mode: 'probe', fullTelemetry: true });
  await setupGame(Game);
  const picks = { total: 0, byWave: {}, ids: {} };
  const origPick = Game.pickSpawnMonster.bind(Game);
  Game.pickSpawnMonster = function (mdefs) {
    const r = origPick(mdefs);
    picks.total++;
    if (r) {
      const w = r.wave || 1;
      picks.byWave[w] = (picks.byWave[w] || 0) + 1;
      picks.ids[r.id] = (picks.ids[r.id] || 0) + 1;
    }
    return r;
  };
  const castPicks = {};
  const origCast = Game.castMonster.bind(Game);
  Game.castMonster = function () {
    const r = origCast();
    const id = (r && r.id) || r;
    castPicks[id] = (castPicks[id] || 0) + 1;
    return r;
  };
  const res = await runDays(Game, competent, { days: DAYS });
  let maxWave = 1;
  try { maxWave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  const endDay = (Game.state.scholar || {}).day || 0;
  return { seed, days: endDay, maxWave, picks, castPicks };
}

(async () => {
  for (const s of SEEDS) {
    try { console.log(JSON.stringify(await one(s))); }
    catch (e) { console.log(JSON.stringify({ seed: s, error: e.message })); }
  }
})();
