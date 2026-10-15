// REPO=<wt> SEED=n node gateprobe.js — full deed gate at run end
const path = require('path');
const REPO = process.env.REPO;
const { loadGame, setupGame, runDays } = require(path.join(REPO, 'scripts/sim-harness'));
const { capable } = require(path.join(REPO, 'scripts/policies/capable'));
(async () => {
  const seed = +process.env.SEED || 9;
  const { Game, manifest } = await loadGame({ seed, mode: 'gateprobe', fullTelemetry: false });
  await setupGame(Game);
  const r = await runDays(Game, Object.assign({}, capable), { days: 150, manifest, sampleEvery: 10 });
  const g = Game.deedGateReady();
  console.log(JSON.stringify({ seed, days: r.days, end: r.endReason, seat: Game.tableSeat().seat, w: [g.w1, g.w2, g.w3, g.w4, g.w5].join('/'), contests: g.contestsN, crises: g.crisesN, food: g.foodDeeds, rank: g.rank, uw: Game.unlockedWave(), standing: Game.villageStandingTotal ? Game.villageStandingTotal() : null, w2pts: Game.waveLedgerPoints ? Game.waveLedgerPoints(2) : null }));
})();
