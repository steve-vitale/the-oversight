#!/usr/bin/env node
// diag-pantry-starve-20261011.js — CRISIS LEG diagnostic: catch villagers
// starving (ate < 60% of need) on a day the pantry holds real kcal, then
// dump exactly what the pantry contains so we can see WHY the draw failed.
// Usage: SEED=105 DAYS=40 node scripts/diag-pantry-starve-20261011.js
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

const SEED = parseInt(process.env.SEED || '105', 10);
const DAYS = parseInt(process.env.DAYS || '60', 10);

function pantrySummary(Game, v) {
  return (v.pantry || []).map(it => {
    let spoiled = '?';
    try { spoiled = !!(Game.isSpoiled && Game.isSpoiled(it)); } catch (e) {}
    return {
      name: it.name, kcalEach: it.kcalEach, units: it.units,
      foodState: it.foodState, foodKind: it.foodKind,
      rawKcal: it.rawKcal, needsCooking: !!it.needsCooking,
      safe: it.safe, spoilDay: it.spoilDay, spoiled,
    };
  });
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'diag-pantry', fullTelemetry: false });
  await setupGame(Game);
  const events = [];
  const _vmd = Game.villagerMealDay;
  Game.villagerMealDay = function (vid, person, v, ctx) {
    const r = _vmd ? _vmd.apply(this, arguments) : { ate: 0, gave: 0 };
    try {
      const need = (person.kcalPerDay || 2000);
      // What pantryDraw CAN see (the draw's own filter), vs what the
      // pantryKcal() counter CLAIMS.
      const claim = (v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
      const drawable = (v.pantry || [])
        .filter(it => it && (it.kcalEach || 0) > 0 && (it.units || 0) > 0 && !(Game.isSpoiled && Game.isSpoiled(it)))
        .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 0), 0);
      const away = !!((v.away || {})[vid]);
      if ((r.ate || 0) < need * 0.6 && claim > 300 && events.length < 12) {
        let name = vid;
        try { name = (person.name || vid).split(' ')[0]; } catch (e) {}
        events.push({
          day: (Game.state.scholar || {}).day, name,
          ate: Math.round(r.ate || 0), need, away,
          hunger: ((this.villagerNeeds && this.villagerNeeds(vid)) || {}).hunger,
          pantryClaim: Math.round(claim), pantryDrawable: Math.round(drawable),
          nItems: (v.pantry || []).length,
          items: pantrySummary(Game, v).slice(0, 12),
        });
      }
    } catch (e) { events.push({ hookErr: String(e && e.message) }); }
    return r;
  };
  const r = await runDays(Game, oracleV2, { days: DAYS });
  const v = Game.state.village || {};
  console.log(JSON.stringify({
    seed: SEED, loopDays: r.days, gameDay: (Game.state.scholar || {}).day,
    over: !!Game.over, roster: (v.roster || []).length,
    starveWithFood: events,
  }, null, 1));
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
