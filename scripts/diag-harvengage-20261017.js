#!/usr/bin/env node
// Diagnostic: does the harvstop trigger engage on real trajectories?
// Runs the ARMED layer 60d on 1 seed, reports pin/hot/stand-down days and
// the inflow7/burn7 ratio distribution. Informs the flow-bar calibration.
'use strict';
process.env.HARVSTOP = '1';
process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';
process.env.LEANWINTER_LIB = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { belongfeast } = require('./policies/feastscale');
const HS = require('./policies/harvstop');

(async () => {
  const seed = parseInt(process.env.SEED || '4401', 10);
  const { Game } = await loadGame({ seed, mode: 'harvstop-engage' });
  await setupGame(Game);
  let liveCtx = null;
  const pol = Object.assign({}, HS.harvbelong);
  const oSetup = HS.harvbelong.setup;
  pol.setup = (G, ctx) => { liveCtx = ctx; if (oSetup) return oSetup(G, ctx); };
  const ratios = [];
  const oDaily = HS.harvbelong.daily;
  pol.daily = (G, ctx) => {
    try {
      const i7 = HS.inflow7(G, ctx), b7 = HS.burn7(G);
      if (b7 > 0) ratios.push(+(i7 / b7).toFixed(2));
    } catch (e) {}
    return oDaily(G, ctx);
  };
  await quietLog(async () => { await runDays(Game, pol, { days: 60, sampleEvery: 60 }); });
  ratios.sort((a, b) => a - b);
  const q = (p) => ratios.length ? ratios[Math.min(ratios.length - 1, Math.floor(ratios.length * p))] : 0;
  console.log(JSON.stringify({
    seed, pinDays: liveCtx.hsPinDays || 0, hotDays: liveCtx.hsHotDays || 0,
    standDowns: liveCtx.hsStandDowns || 0, declined: liveCtx.hsDeclined || 0,
    inflowRatio_p50: q(0.5), inflowRatio_p75: q(0.75), inflowRatio_p90: q(0.9),
    inflowRatio_max: q(1.0), n: ratios.length,
  }));
})();
