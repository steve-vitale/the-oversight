#!/usr/bin/env node
'use strict';
// diag-w5reach2-window.js — trace the wave-4 window on s151 armed:
// daily unlockedWave, hp%, kcal, tableBusy, and the huntLeg gate inputs.
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const W5R = require('./policies/wave5reach');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`DIAG STOP: ${k}=1 required.`); process.exit(2); }
}
process.env.WAVE5REACH = '1';

(async () => {
  const { Game } = await loadGame({ seed: 151, mode: 'w5reach2-window-diag' });
  await setupGame(Game);
  const base = W5R.belongseat;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  let runCtx = null;
  policy.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
  const oDaily = base.daily;
  const trace = [];
  policy.daily = (G, ctx) => {
    try {
      const uw = (G.unlockedWave ? G.unlockedWave() : 1) | 0;
      const s = (G.state || {}).scholar || {};
      const maxHp = G.maxHealth ? G.maxHealth() : 100;
      const hpPct = (s.hp || s.health || 100) / Math.max(1, maxHp);
      const kcal = s.kcal || 0;
      let tableBusy = false;
      try { const pg = G.progState ? G.progState() : {}; tableBusy = !!(pg.tableDone || pg.tableWaiting); } catch (e) {}
      const prev = trace.length ? trace[trace.length - 1].uw : 1;
      const hunts = ctx.w5Hunts || 0;
      trace.push({ day: s.day || 0, uw, hpPct: +hpPct.toFixed(2), kcal: Math.round(kcal), tableBusy, hunts });
      if (uw !== prev || tableBusy) {
        console.log(`  d${s.day}: uw=${uw} hpPct=${hpPct.toFixed(2)} kcal=${Math.round(kcal)} tableBusy=${tableBusy} hunts=${hunts}`);
      }
    } catch (e) {}
    return oDaily ? oDaily(G, ctx) : undefined;
  };
  const r = await quietLog(async () => runDays(Game, policy, { days: 180, sampleEvery: 30 }));
  // summarize the wave-4 window
  const w4days = trace.filter(t => t.uw === 4);
  console.log(`\nend=${r.endReason} gameDays=${r.gameDays} w4windowDays=${w4days.length}`);
  console.log(`hunts=${(runCtx && runCtx.w5Hunts) || 0} engaged=${(runCtx && runCtx.w5HuntEngaged) || 0}`);
  if (w4days.length) {
    const first = w4days[0], last = w4days[w4days.length - 1];
    console.log(`w4 window: d${first.day}..d${last.day}`);
    const unhealthy = w4days.filter(t => t.hpPct < 0.6).length;
    const hungry = w4days.filter(t => t.kcal < 200).length;
    const busy = w4days.filter(t => t.tableBusy).length;
    console.log(`  w4 days with hpPct<0.6: ${unhealthy}/${w4days.length}, kcal<200: ${hungry}/${w4days.length}, tableBusy: ${busy}/${w4days.length}`);
  }
})().catch(e => { console.error('DIAG CRASH:', e); process.exit(2); });
