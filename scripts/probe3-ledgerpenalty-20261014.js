#!/usr/bin/env node
// probe3-ledgerpenalty-20261014.js — clean takes/location/pantry timeline.
// Tracks daily: vid, trust, v.takes, scholar location, pantryInReach,
// pantry kcal, bar, meal kcal (say). Both sides via revert.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { belongseek } = require('./policies/belongseek');
const SEED = parseInt(process.env.SEED || '11', 10);

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'ledgerpenalty-probe3' });
  await setupGame(Game);
  const vid = Game.villagerId;
  const rows = [];
  let mealKcal = 0;
  const origSay = Game.say;
  Game.say = function (msg) {
    try {
      const m = String(msg);
      const mm = m.match(/Village meal: \+([\d,]+) kcal/);
      if (mm) mealKcal += parseInt(mm[1].replace(/,/g, ''), 10);
      if (/no pantry meal|camp wild/i.test(m)) mealKcal -= 1; // marker: no meal
    } catch (e) {}
    return origSay.apply(this, arguments);
  };
  const base = belongseek;
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const s = G.state.scholar || {}, vv = G.state.village || {};
      let inReach = '?';
      try { inReach = G.pantryInReach() ? 1 : 0; } catch (e) {}
      const pk = ((vv.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0));
      rows.push({ day: s.day, trust: (vv.trust || {})[vid],
        takes: (vv.takes || {})[vid] || 0,
        px: G.map.px, py: G.map.py, inReach,
        pantryKcal: Math.round(pk), bar: Math.round(s.kcal || 0), mealKcal });
      mealKcal = 0;
    } catch (e) { rows.push({ err: e.message }); }
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  const r = await runDays(Game, policy, { days: 60, sampleEvery: 1 });
  Game.say = origSay;
  console.log(`seed=${SEED} days=${r.days} end=${r.endReason}`);
  for (const row of rows.filter(x => x.day <= 15 || x.day % 10 === 0)) {
    console.log(`d${row.day}: trust=${row.trust} takes=${row.takes} at(${row.px},${row.py}) inReach=${row.inReach} pantry=${row.pantryKcal} bar=${row.bar} meal=${row.mealKcal}`);
  }
}
main().catch(e => { console.error('THREW', e); process.exit(2); });
