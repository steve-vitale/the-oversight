// probe-loss-r109-20261106.js -- diagnostic probe (NOT a metric): re-run a
// seed with the base competent policy and print Game.villageDebrief() at the
// end, attributing a village-lost trigger the r109 driver does not record
// (the driver's seed JSON carries endReason but not the debrief). R109
// RESULT: DIVERGED on both seeds (92905 reproduced village-lost at day 74
// vs panel day 33; 92907 at day 21 vs panel day 25) — the driver's policy
// wraps move the trajectory, so the base policy cannot attribute driver
// losses. Kept as the documented negative result: loss attribution needs
// the debrief captured INSIDE the driver run (Game.villageDebrief() at
// seed end), proposed as a tooling follow-up in the r109 metric review.
// Usage: SEEDS=92905,92907 node scripts/probe-loss-r109-20261106.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const EXPECTED = { 92905: { end: 'village-lost', day: 33 }, 92907: { end: 'village-lost', day: 25 } };

(async () => {
  const seeds = (process.env.SEEDS || '92905,92907').split(',').map(s => parseInt(s, 10));
  let bad = 0;
  for (const seed of seeds) {
    const { Game } = await loadGame({ seed, mode: 'probe-loss-r109', fullTelemetry: true });
    await setupGame(Game);
    const result = await runDays(Game, competent, { days: 100, manifest: { seed, mode: 'probe-loss-r109', date: '2026-11-06', node: process.version } });
    const exp = EXPECTED[seed];
    console.log(`seed ${seed}: reproduced end=${result.endReason} day=${result.gameDays} over=${!!Game.over} villageLost=${!!Game.villageLost}`);
    if (!exp || result.endReason !== exp.end || result.gameDays !== exp.day) {
      console.log(`  DIVERGED from panel record (expected ${exp.end} day ${exp.day}) — NO attribution claimed`);
      bad++;
      continue;
    }
    let debrief = null;
    try { debrief = Game.villageDebrief ? Game.villageDebrief() : null; } catch (e) { debrief = 'ERR ' + e.message; }
    console.log(`  debrief: ${JSON.stringify(debrief)}`);
    try { console.log(`  hungryDays=${(Game.state.village || {}).hungryDays} scattered=${!!(Game.state.village || {}).scattered} extinct=${!!(Game.state.village || {}).extinct}`); } catch (e) {}
  }
  if (bad) { console.log(`RESULT: ${bad} DIVERGED — attribution refused`); process.exit(1); }
  console.log('RESULT: reproduced, debriefs above');
})().catch(e => { console.error('PROBE FAIL', e); process.exit(1); });
