#!/usr/bin/env node
// scripts/diag-rng-s11-20261014.js — where does the RNG stream split on s11?
// Counts ALL mulberry32 draws per day; runs twice in-process.
'use strict';
process.env.FEASTSCALE_R13 = '1';
const { leadfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays } = require('./sim-harness');

function pantryKcal(Game) {
  try { return Math.round(((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)); }
  catch (e) { return -1; }
}

async function runOnce() {
  global.__countRng = true; global.__rngDraws = 0;
  const { Game } = await loadGame({ seed: 11, mode: 'rng-s11' });
  await setupGame(Game);
  const per = [];
  const wrapped = Object.assign({}, leadfeast);
  const base = leadfeast.daily;
  wrapped.daily = (G, ctx) => {
    const day = (Game.state.scholar || {}).day || 0;
    per.push({ day, draws: global.__rngDraws, pantry: pantryKcal(Game) });
    return base(G, ctx);
  };
  const r = await runDays(Game, wrapped, { days: 180, sampleEvery: 1 });
  global.__countRng = false;
  return { per, days: r.days, endReason: r.endReason };
}

async function main() {
  const A = await runOnce();
  const B = await runOnce();
  console.log(`A: ${A.days}/${A.endReason} B: ${B.days}/${B.endReason}`);
  const n = Math.min(A.per.length, B.per.length);
  let firstDrawDiv = -1, firstPantryDiv = -1;
  for (let i = 0; i < n; i++) {
    if (firstDrawDiv < 0 && A.per[i].draws !== B.per[i].draws) firstDrawDiv = i;
    if (firstPantryDiv < 0 && A.per[i].pantry !== B.per[i].pantry) firstPantryDiv = i;
    if (firstDrawDiv >= 0 && firstPantryDiv >= 0) break;
  }
  console.log('first draw-count divergence at idx', firstDrawDiv,
    firstDrawDiv >= 0 ? JSON.stringify(A.per[firstDrawDiv]) + ' vs ' + JSON.stringify(B.per[firstDrawDiv]) : '');
  console.log('first pantry divergence at idx', firstPantryDiv,
    firstPantryDiv >= 0 ? JSON.stringify(A.per[firstPantryDiv]) + ' vs ' + JSON.stringify(B.per[firstPantryDiv]) : '');
  if (firstDrawDiv >= 0) {
    console.log('--- draw counts around split (A vs B) ---');
    for (let i = Math.max(0, firstDrawDiv - 3); i <= firstDrawDiv + 2 && i < n; i++) {
      console.log(`  idx${i} d${A.per[i].day}: draws ${A.per[i].draws} vs ${B.per[i].draws} | pantry ${A.per[i].pantry} vs ${B.per[i].pantry}`);
    }
  }
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
