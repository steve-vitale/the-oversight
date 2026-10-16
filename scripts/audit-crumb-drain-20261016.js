#!/usr/bin/env node
// One-off drain audit for sim-crumbs-b (not committed as a proof test):
// counts crumb-take firings and their extra pantry cost directly, by
// wrapping pantryDraw and reading out.crumbTakes.
// Usage: CRUMBFIX=1 node scripts/audit-crumb-drain-20261016.js [seed] [days]
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');

async function main() {
  const seed = parseInt(process.argv[2] || '33', 10);
  const days = parseInt(process.argv[3] || '180', 10);
  const { Game } = await loadGame({ seed, mode: 'crumb-drain-audit', fullTelemetry: false });
  await setupGame(Game);
  const oDraw = Game.pantryDraw;
  let fires = 0, fireKcal = 0, calls = 0, takenTotal = 0;
  Game.pantryDraw = function (v, want, opts) {
    calls++;
    const out = oDraw.apply(this, arguments);
    takenTotal += out.taken || 0;
    if (out.crumbTakes) {
      fires += out.crumbTakes;
      // extra cost of this firing vs pristine: the last item taken whole.
      const last = out.items[out.items.length - 1];
      if (last) fireKcal += last.units * last.effectiveKcal;
    }
    return out;
  };
  const policy = Object.assign({}, leadcourt);
  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 }); });
  Game.pantryDraw = oDraw;
  console.log(`seed=${seed} days=${result.days} pantryDraw calls=${calls} crumbTakes=${fires}`);
  console.log(`crumb-take kcal=${Math.round(fireKcal)} total taken=${Math.round(takenTotal)} share=${(fireKcal / Math.max(1, takenTotal) * 100).toFixed(2)}%`);
  console.log(`fires per 100 villager-meals: ${(fires / Math.max(1, calls) * 100).toFixed(2)}`);
}

if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });
