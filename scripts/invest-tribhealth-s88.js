#!/usr/bin/env node
// one-off investigation: armed leadcourt seed 88 — trace early pays vs hunger
// spiral, day by day.
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
let TH = null, leadcourtPol = null;
try {
  TH = require('./policies/tribhealth');
  leadcourtPol = require('./policies/leadcourt').leadcourt;
} catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: tribhealth layer deleted per kill protocol — the s88 investigation result stands in evidence/2026-10-15/sim-tribhealth-b.md');
    process.exit(0);
  }
  throw e;
}

(async () => {
  const { Game } = await loadGame({ seed: 88, mode: 'tribhealth-invest', fullTelemetry: false });
  await setupGame(Game);
  process.env.TRIBHEALTH = '1';
  const policy = Object.assign({}, TH.tribhealthlead);
  let runCtx = null;
  const oSetup = policy.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
  const origDaily = policy.daily;
  const rows = [];
  policy.daily = (G, ctx) => {
    const d = (G.state.scholar || {}).day || 0;
    const v = G.state.village || {};
    const e0 = ctx.thEarly || 0;
    const r = origDaily(G, ctx);
    const e1 = ctx.thEarly || 0;
    rows.push({ day: d, streak: v.hungryDays || 0, pantry: Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 1000), pop: (v.roster || []).length, earlyFired: e1 - e0, starve: (G.state.telemetry || []).filter(e => e.type === 'death' && e.day === d && /starv/i.test(String(e.cause || e.kind || ''))).length });
    return r;
  };
  await quietLog(async () => { await runDays(Game, policy, { days: 90, sampleEvery: 91 }); });
  console.log('day | streak pop pantryK early starved');
  for (const r of rows) {
    if (r.earlyFired || r.starve || r.streak >= 3 || r.day % 15 === 0) {
      console.log(`${r.day} | ${r.streak} ${r.pop} ${r.pantry}k ${r.earlyFired ? 'EARLY' : ''} ${r.starve ? 'STARVEDx' + r.starve : ''}`);
    }
  }
  // link lifetimes
  try {
    for (const l of (Game.hierarchyState() || [])) {
      if (l && l.subordinate === 'haven') {
        console.log(`link ${l.id}: day=${l.day} trust=${l.trust} tributePaidWeek=${l.tributePaidWeek} arrears=${Math.round(l.arrears || 0)}`);
      }
    }
  } catch (e) {}
})().catch(e => { console.error('FATAL', e); process.exit(1); });
