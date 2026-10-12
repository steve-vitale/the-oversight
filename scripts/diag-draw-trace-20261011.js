#!/usr/bin/env node
// diag-draw-trace-20261011.js — CRISIS LEG: trace a single pantryDraw inside
// villagerMealDay when a home villager starves with pantryClaim > 10000.
// Usage: SEED=1 DAY=19 node scripts/diag-draw-trace-20261011.js
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

const SEED = parseInt(process.env.SEED || '1', 10);
const TARGET_DAY = parseInt(process.env.DAY || '19', 10);
const DAYS = TARGET_DAY + 2;

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'diag-trace', fullTelemetry: false });
  await setupGame(Game);
  const traces = [];
  const _pd = Game.pantryDraw;
  Game.pantryDraw = function (v, want, opts) {
    const day = (Game.state.scholar || {}).day;
    const before = (v.pantry || []).length;
    const r = _pd ? _pd.apply(this, arguments) : { taken: 0, items: [] };
    if (day === TARGET_DAY && opts && opts.round === 'floor1' && r.taken < want * 0.6 && want > 300) {
      const items = (v.pantry || []).slice(0, 10).map(it => {
        let spoiled = '?';
        try { spoiled = !!(Game.isSpoiled && Game.isSpoiled(it)); } catch (e) {}
        return { name: it.name, kcalEach: it.kcalEach, units: it.units, foodState: it.foodState, rawKcal: it.rawKcal, safe: it.safe, spoiled };
      });
      traces.push({
        want: Math.round(want), taken: Math.round(r.taken),
        nCandsBefore: before, shortOfFresh: !!r.shortOfFresh,
        nItemsDrawn: (r.items || []).length,
        pantryAfter: items,
      });
    }
    return r;
  };
  await runDays(Game, oracleV2, { days: DAYS });
  console.log(JSON.stringify({ seed: SEED, day: TARGET_DAY, traces: traces.slice(0, 6) }, null, 1));
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
