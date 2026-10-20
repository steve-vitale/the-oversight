#!/usr/bin/env node
// scan-crisis-b4.js — find a proof-leg config where the crisis gate fires.
// Runs 90d armed on candidate seeds and reports engSurCalls + bypassed kcal.
// Usage: FEASTSCALE_R13=1 node scripts/scan-crisis-b4.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadretagrot4, belongretagrot4 } = require('./policies/retagrot-b4');

async function scan(policy, policyName, seed, days) {
  const saved = process.env.RETAGROT_B4;
  process.env.RETAGROT_B4 = '1';
  try {
    const { Game } = await loadGame({ seed, mode: 'scan-crisis-b4', fullTelemetry: false });
    await setupGame(Game);
    let engSur = 0, bypassed = 0;
    const oSur = Game.stockSurplus;
    Game.stockSurplus = function () { engSur++; return oSur.apply(this, arguments); };
    const ctx = {};
    const origDaily = policy.daily;
    const P = Object.assign({}, policy, { daily: (G, c) => { Object.assign(ctx, c); return origDaily(G, c); } });
    await runDays(Game, P, { days, manifest: null, sampleEvery: 181 });
    bypassed = Math.round(ctx._rgBypassedKcal || 0);
    const moved = Math.round(ctx._rgMovedKcal || 0);
    console.log(`${policyName} s${seed} ${days}d: engSurCalls=${engSur} bypassedKcal=${bypassed} movedKcal=${moved}`);
  } finally {
    if (saved === undefined) delete process.env.RETAGROT_B4; else process.env.RETAGROT_B4 = saved;
  }
}

(async () => {
  for (const seed of [5401, 5402]) {
    await scan(leadretagrot4, 'lead', seed, 90);
    await scan(belongretagrot4, 'belong', seed, 90);
  }
})().catch(e => { console.error('SCAN CRASH:', e); process.exit(2); });
