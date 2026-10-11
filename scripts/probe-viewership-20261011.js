#!/usr/bin/env node
// probe-viewership-20261011.js — viewership trajectory probe for the travel lever.
// Records havenViewership DAILY + recordMoment calls/day on one seed, 200 days.
// SEED=1 node scripts/probe-viewership-20261011.js
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { winseek } = require('./policies/winseek');

const SEED = parseInt(process.env.SEED || '1', 10);
const DAYS = parseInt(process.env.DAYS || '200', 10);

async function main() {
  const { Game, manifest: mf } = await loadGame({ seed: SEED, mode: 'travelwinseek', fullTelemetry: false });
  await setupGame(Game);

  // wrap recordMoment: count calls per day
  const dayCounts = {};
  let curDay = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  const _rm = Game.recordMoment;
  Game.recordMoment = function (text) {
    const d = curDay();
    dayCounts[d] = (dayCounts[d] || 0) + 1;
    return _rm.call(Game, text);
  };

  const trace = [];
  const policy = Object.assign({}, winseek, {
    id: 'viewprobe',
    daily(Game, ctx) {
      try { if (winseek.daily) winseek.daily(Game, ctx); } catch (e) {}
      try {
        const d = curDay();
        let vw = null, vwRaw = null;
        try { vw = Game.havenViewership(); } catch (e) {}
        try { vwRaw = (Game.state.village || {}).viewership; } catch (e) {}
        let base = null;
        try {
          const v = Game.state.village, pg = Game.progState();
          base = (v.pantryKcal || 0) / 2000 + Game.codexBreadth() * 1.5 + (pg.arc || 1) * 5 + (Game.ledger().showmanship || 0);
        } catch (e) {}
        let pantry = 0; try { pantry = Game.state.village.pantryKcal || 0; } catch (e) {}
        let cx = 0; try { cx = Game.codexBreadth(); } catch (e) {}
        let arc = 0; try { arc = Game.progState().arc; } catch (e) {}
        let sho = 0; try { sho = Game.ledger().showmanship || 0; } catch (e) {}
        trace.push({ d, vw: vw == null ? null : +vw.toFixed(1), vwRaw, base: base == null ? null : +base.toFixed(1), pantry: Math.round(pantry), cx, arc, sho });
      } catch (e) {}
    },
  });
  const res = await runDays(Game, policy, { days: DAYS, manifest: mf });

  // print trace decimated: days 1-14 every day, then every 7
  console.log('day\tvw\tbase\tpantry\tcx\tarc\tsho\tmoments');
  for (const t of trace) {
    if (t.d <= 14 || t.d % 7 === 0) {
      const m = dayCounts[t.d] || 0;
      console.log(`${t.d}\t${t.vw}\t${t.base}\t${t.pantry}\t${t.cx}\t${t.arc}\t${t.sho}\t${m}`);
    }
  }
  // summary: avg moments/day per week
  console.log('--- moments/day by week ---');
  for (let w = 0; w * 7 < DAYS; w++) {
    let sum = 0, n = 0;
    for (let d = w * 7 + 1; d <= Math.min(DAYS, w * 7 + 7); d++) { sum += dayCounts[d] || 0; n++; }
    console.log(`week${w + 1}: ${(sum / n).toFixed(1)}/day`);
  }
  console.log('endReason:', res.endReason, 'gameDays:', res.gameDays);
  try {
    const v = Game.state.village || {};
    console.log('final viewership:', v.viewership, 'national:', !!Game.state.nationalLive, 'global:', !!Game.state.globalLive);
  } catch (e) {}
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
