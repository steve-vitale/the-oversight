#!/usr/bin/env node
// diag-feastdraw-inflow.js — why does the arm backfire on glut seeds?
// Measures total pantry INFLOW per side on lead 6206 (the 1.87x backfire).
// Wraps the pantry-add paths and sums kcal in.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');
const { withFeastDraw } = require('./policies/feastdraw');

const wrapped = withFeastDraw(leadfeast, 'leadfeastdraw', 'diag');

async function run(side) {
  if (side === 'armed') process.env.FEASTDRAW = '1'; else delete process.env.FEASTDRAW;
  const { Game } = await loadGame({ seed: 6206, mode: 'diag-inflow', fullTelemetry: false });
  await setupGame(Game);
  const W = { inflow: 0, secondsOut: 0, dinnerOut: 0 };
  // pantry inflow: stockPantry is the funnel for hauled/produced food
  const oStock = Game.stockPantry;
  if (typeof oStock === 'function') Game.stockPantry = function (kcal, name) {
    try { if (typeof kcal === 'number' && kcal > 0) W.inflow += kcal; } catch (e) {}
    return oStock.apply(this, arguments);
  };
  // outflow split: wrap pantryDraw, attribute by caller via a stack sniff —
  // simpler: count the seconds pass draws separately via serveSeconds wrap
  const L = require('./policies/feastdraw');
  const oServe = L.serveSeconds;
  // (serveSeconds is called inside the wrapper; count via ctx telemetry instead)
  const policy = Object.assign({}, side === 'armed' ? wrapped : leadfeast);
  let ctx = null;
  const oSetup = policy.setup;
  policy.setup = (G, c) => { ctx = c; if (oSetup) return oSetup(G, c); };
  await runDays(Game, policy, { days: 180, manifest: null });
  const v = Game.state.village || {};
  const pk = (v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  console.log(`${side}: inflow(stockPantry)=${Math.round(W.inflow / 1000)}k  fdNights=${(ctx && ctx._fdNights) || 0}  fdKcal=${Math.round(((ctx && ctx._fdKcal) || 0) / 1000)}k  pkEnd=${Math.round(pk / 1000)}k`);
}

(async () => {
  process.env.FEASTSCALE_R13 = '1'; process.env.SEATDRIVE = '0';
  await run('control');
  await run('armed');
})().catch(e => { console.error('DIAG CRASH', e); process.exit(2); });
