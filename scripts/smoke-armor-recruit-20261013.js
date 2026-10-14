#!/usr/bin/env node
// SMOKE (armor+recruit fixes 2026-10-13, MEASUREMENT.md Stage 0):
// 3 seeds x 30 days, competent policy. Do the new code paths FIRE in a real
// sim? Reports: bark_armor L1 day (oldCuirassBeat), hide_armor L1 day
// (hide-handling), recruits (auto-recruit), crashes.
// This is a wiring check, not a lever measurement — no baseline comparison.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = [11, 22, 33];
const DAYS = 30;

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const { Game } = await loadGame({ seed });
    await setupGame(Game);
    let crashed = null;
    let result = null;
    try {
      result = await runDays(Game, competent, { days: DAYS, sampleEvery: 5 });
    } catch (e) {
      crashed = e.message;
    }
    const rec = (Game.state && Game.state.codex && Game.state.codex.recipes) || {};
    const bark = rec.bark_armor || {};
    const hide = rec.hide_armor || {};
    const v = (Game.state && Game.state.village) || {};
    const roster = v.roster || [];
    const recruits = roster.filter(id => /^visjoin_/.test(id)).length;
    let arrivals = 0;
    try { arrivals = (Game.mshipState().arrivals || []).length; } catch (e) {}
    rows.push({
      seed,
      days: result ? result.days : 0,
      endReason: crashed ? ('CRASH: ' + crashed) : (result && result.endReason),
      barkL1day: bark.level >= 1 ? bark.learnedDay : '-',
      barkVia: bark.via || '-',
      hideL1day: hide.level >= 1 ? hide.learnedDay : '-',
      hideVia: hide.via || '-',
      pop: roster.length,
      visRecruits: recruits,
      appArrivals: arrivals,
    });
  }
  console.log('seed | days | endReason | barkL1day (via) | hideL1day (via) | pop | visRecruits | appArrivals');
  for (const r of rows) {
    console.log(`${r.seed} | ${r.days} | ${r.endReason} | ${r.barkL1day} (${r.barkVia}) | ${r.hideL1day} (${r.hideVia}) | ${r.pop} | ${r.visRecruits} | ${r.appArrivals}`);
  }
})().catch(e => { console.error('SMOKE CRASH', e); process.exit(2); });
