// REPO=<worktree> SEED=16 DAYS=150 node waveprobe.js -> one JSON line
const path = require('path');
const REPO = process.env.REPO;
const { loadGame, setupGame, runDays } = require(path.join(REPO, 'scripts/sim-harness'));
const { capable } = require(path.join(REPO, 'scripts/policies/capable'));
(async () => {
  const seed = +process.env.SEED || 16, days = +process.env.DAYS || 150;
  const { Game, manifest } = await loadGame({ seed, mode: 'waveprobe', fullTelemetry: false });
  await setupGame(Game);
  const pol = Object.assign({}, capable);
  const unlock = {}; const worldW3Days = new Set(); let atHaven = 0, dailies = 0;
  const spawns = {};
  const _sw = Game.spawnWorldMonster;
  Game.spawnWorldMonster = function (mdef) { try { const id = typeof mdef === 'string' ? mdef : mdef.id; const md = (Game.data.monsters || []).find(m => m.id === id) || {}; spawns[md.wave || 1] = (spawns[md.wave || 1] || 0) + 1; } catch (e) { /* probe */ } return _sw.apply(this, arguments); };
  const facedDay = {};
  pol.daily = (G, ctx) => {
    try {
      const d = G.state.scholar.day; dailies++;
      if (G.map.px === 4 && G.map.py === 4) atHaven++;
      const uw = G.unlockedWave();
      for (let w = 2; w <= uw; w++) if (unlock[w] == null) unlock[w] = d;
      for (const m of G.worldMonsters()) { const md = (G.data.monsters || []).find(x => x.id === m.id) || {}; if (md.wave === 3) worldW3Days.add(d); }
      const f = G.deedState().wavesFaced || {};
      for (const k of Object.keys(f)) if (facedDay[k] == null) facedDay[k] = d + ':w' + f[k];
    } catch (e) { /* probe */ }
    return capable.daily(G, ctx);
  };
  const r = await runDays(Game, pol, { days, manifest, sampleEvery: 10 });
  let seat = {}; try { seat = Game.tableSeat(); } catch (e) { /* probe */ }
  const w3faced = Object.entries(facedDay).filter(([, v]) => /w3$/.test(v)).map(([k, v]) => k + '@' + v.split(':')[0]);
  console.log(JSON.stringify({ seed, days: r.days, end: r.endReason, unlock, worldW3Days: worldW3Days.size, spawnsByWave: spawns, atHavenFrac: +(atHaven / Math.max(1, dailies)).toFixed(2), w3faced, seat: seat.seat, det: seat.detail, won: !!(Game.state.scholar && Game.progState().tableDone) }));
})();
