// REPO=<wt> SEED=99 node titanprobe.js — titan omens/musters/slain at run end
const path = require('path');
const REPO = process.env.REPO;
const { loadGame, setupGame, runDays } = require(path.join(REPO, 'scripts/sim-harness'));
const { capable } = require(path.join(REPO, 'scripts/policies/capable'));
(async () => {
  const seed = +process.env.SEED || 99;
  const { Game, manifest } = await loadGame({ seed, mode: 'titanprobe', fullTelemetry: false });
  await setupGame(Game);
  const seen = {};
  const _tp = Game.startCombat;
  Game.startCombat = function (id) { if (Game.isTitan && Game.isTitan(id)) seen[id] = (seen[id] || 0) + 1; return _tp.apply(this, arguments); };
  const r = await runDays(Game, Object.assign({}, capable), { days: +process.env.DAYS || 150, manifest, sampleEvery: 10 });
  const st = Game.state.titans || {};
  const om = {};
  for (const [k, v] of Object.entries(st.omens || {})) om[k] = { stage: v.stage, day: v.day };
  const mus = {};
  for (const [k, v] of Object.entries(st.musters || {})) mus[k] = v ? ((v.allies || []).length + '+' + (v.haven || []).length) : null;
  console.log(JSON.stringify({ seed, days: r.days, end: r.endReason, cast: st.cast, omens: om, musters: mus, slain: st.slain, titanFightsStarted: seen, onMap: (Game.state.worldMonsters || []).filter(m => m.titan).map(m => m.id) }));
})();
