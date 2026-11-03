'use strict';
// smoke-win-intel-20261103.js — organic smoke for the win-intel landing:
// a fresh game, N days under the competent policy, must not crash and
// must not die out. Prints one JSON line: survival, deaths, and the
// win-plan counters fired organically (drives acting in real play, not
// just in fixtures). Usage: node scripts/smoke-win-intel-20261103.js [seed] [days]
const path = require('path');
// Repo override (like the proof script) so the same smoke runs against
// master as a control without touching the main tree.
const repo = process.env.WININTEL_REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require(path.join(repo, 'scripts', 'sim-harness'));
const { competent } = require(path.join(repo, 'scripts', 'policies', 'competent'));

(async () => {
  const seed = Number(process.argv[2] || 11);
  const days = Number(process.argv[3] || 30);
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  let result = null, err = null;
  try {
    result = await runDays(Game, competent, { days, manifest: null });
  } catch (e) { err = (e && e.stack) || String(e); }
  let stats = {};
  try { stats = Game.winPlanStats ? JSON.parse(JSON.stringify(Game.winPlanStats())) : {}; } catch (e) {}
  const deaths = (result && result.samples && result.samples.deaths) || [];
  console.log(JSON.stringify({
    seed, err,
    daysAlive: result ? result.days : 0,
    endReason: result ? result.endReason : 'crashed',
    villageLost: !!Game.villageLost, over: !!Game.over, won: !!Game.won,
    deaths: deaths.length,
    winPlanStats: stats,
  }));
  process.exit(err ? 1 : 0);
})().catch(e => { console.log(JSON.stringify({ seed: Number(process.argv[2] || 11), err: (e && e.stack) || String(e) })); process.exit(1); });
