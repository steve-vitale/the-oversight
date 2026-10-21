#!/usr/bin/env node
// probe: how many System abilities/tracks does a competent bearer earn by day N?
// Usage: SEED=11101 DAYS=40 node scripts/probe-build-curve-20261021.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '11101', 10);
const DAYS = parseInt(process.env.DAYS || '40', 10);

function abilSummary(Game) {
  const s = Game.state.scholar || {};
  const abs = s.abilities || [];
  return {
    count: abs.length,
    ids: abs.map(a => (a && (a.id || a.evolvedFrom)) || '?'),
    tracks: Object.keys(s.tracks || {}).length,
    levelUpQueue: (s.levelUpQueue || []).length,
    progArc: ((s.prog || {}).arc),
  };
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'probe-build-curve' });
  await setupGame(Game);
  const E = console.error;
  E(`seed ${SEED}: d1 abilities: ${JSON.stringify(abilSummary(Game))}`);
  for (const mark of [10, 20, 30, 40, 50]) {
    if (Game.over) break;
    while ((Game.state.scholar.day || 0) < Math.min(mark, DAYS)) {
      await runDays(Game, competent, { days: 1 });
      if (Game.over) break;
    }
    E(`seed ${SEED}: d${Game.state.scholar.day} over=${!!Game.over} abilities: ${JSON.stringify(abilSummary(Game))}`);
  }
  if (!Game.over) E(`seed ${SEED}: alive, villager=${Game.villagerId}`);
  console.log(JSON.stringify({ seed: SEED, day: Game.state.scholar.day, over: !!Game.over, ...abilSummary(Game) }));
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
