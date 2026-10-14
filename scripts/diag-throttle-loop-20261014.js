#!/usr/bin/env node
// diag-throttle-loop-20261014.js — diagnose WHY prodthrottle costs survival.
// Day-by-day: burn (measured), pantryFreshKcal, pantryFreshDays,
// throttle engaged?, hungry villagers, roster size.
// Hypothesis: measured burn is endogenous to starvation — hungry villages
// eat less -> burn drops -> freshDays rises -> MORE throttling -> death spiral.
'use strict';
const { loadGame, setupGame, quietLog, driveFights, driveContests } = require('./sim-harness');
const competent = require('./policies/competent');

async function diag(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'diag-throttle' });
  await quietLog(async () => { await setupGame(Game, 'wilds', null); });
  const policy = competent;
  const ctx = {};
  const rows = [];
  for (let day = 1; day <= days; day++) {
    await quietLog(async () => {
      for (let p = 0; p < 3; p++) {
        try { if (policy.upkeep) policy.upkeep(Game, ctx); } catch (e) {}
        try { driveFights(Game, policy, ctx); } catch (e) {}
        try { driveContests(Game, policy, ctx); } catch (e) {}
        if (Game.over) break;
        try { Game.doAction('wait'); } catch (e) {}
        try { driveFights(Game, policy, ctx); } catch (e) {}
        try { driveContests(Game, policy, ctx); } catch (e) {}
        if (Game.over) break;
      }
      if (!Game.over) {
        try { if (policy.daily) policy.daily(Game, ctx); } catch (e) {}
        try { Game.sleep(); } catch (e) {}
        try { driveContests(Game, policy, ctx); } catch (e) {}
      }
    });
    if (Game.over) { rows.push({ d: day, over: true }); break; }
    const v = Game.state.village || {};
    const hist = (v.burnHistory || []).filter(x => x > 0);
    const burn = hist.length ? hist.reduce((a, b) => a + b, 0) / hist.length : 0;
    let fk = 0, fd = 0, eng = false;
    try { fk = Game.pantryFreshKcal(); } catch (e) {}
    try { fd = Game.pantryFreshDays(); } catch (e) {}
    try { eng = Game.prodThrottleEngaged(); } catch (e) {}
    const roster = (v.roster || []).length;
    // hungry: villagers who ate < 60% of need (same signal as villageEats)
    let hungry = 0;
    try {
      for (const id of (v.roster || [])) {
        const person = Game.getPerson(id);
        if (!person || person.dead) continue;
        const ate = (person.lastAte || 0);
        const need = (person.kcalPerDay || 2000);
        if (ate < need * 0.6) hungry++;
      }
    } catch (e) {}
    rows.push({ d: day, burn: Math.round(burn), fk: Math.round(fk), fd: +fd.toFixed(1), eng: eng ? 1 : 0, roster, hungry });
  }
  return rows;
}

(async () => {
  const seeds = (process.env.SEEDS || '11,22').split(',').map(Number);
  const days = parseInt(process.env.DAYS || '60', 10);
  for (const seed of seeds) {
    console.log(`=== seed ${seed} ===`);
    console.log('day burn fk freshDays eng roster hungry');
    const rows = await diag(seed, days);
    let lastEng = -1;
    for (const r of rows) {
      if (r.over) { console.log(`day ${r.d}: OVER`); break; }
      if (r.d % 10 === 0 || r.eng !== lastEng || r.hungry > 0) {
        console.log(`${r.d} ${r.burn} ${r.fk} ${r.fd} ${r.eng} ${r.roster} ${r.hungry}`);
      }
      lastEng = r.eng;
    }
  }
})().catch(e => { console.error('FATAL', e); process.exit(1); });
