#!/usr/bin/env node
// probe3-cookbulk-b.js — engagement-ceiling census for the cook-bulk redesign.
// Measures on EVERY day (lean and not): scholar at Haven? fire? water? time?
// pantry cookable pool kcal? This bounds the max honest batch-cooking a
// policy-side layer can do on fresh seeds.
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/probe3-cookbulk-b.js
'use strict';
const { belongfeast, leadfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SEEDS = [9210, 9211, 9212, 9213];
const POLICIES = { leadfeast, belongfeast };

const kcalOf = (arr) => (arr || []).filter(i => i && (i.needsCooking || i.rawKcal) && (i.units || 0) > 0)
  .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);

async function oneRun(seed, pid) {
  const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  const base = POLICIES[pid];
  const t = {
    days: 0, lean: 0, haven: 0, havenFire: 0, havenFireWater: 0,
    poolSum: 0, poolHavenSum: 0, poolHavenFireSum: 0, poolHavenFireWaterSum: 0,
    poolMax: 0, waterSum: 0, waterN: 0, knowCook: null,
  };
  const oDaily = base.daily;
  base.daily = (G, ctx) => {
    try {
      const s = G.state.scholar || {};
      const cap = (G.kcalCap ? G.kcalCap() : 2400) || 2400;
      const pool = kcalOf((G.state.village || {}).pantry);
      let atHaven = G.location === 'haven';
      try { const pt = G.playerTile ? G.playerTile() : null; if (pt && pt.type === 'haven') atHaven = true; } catch (e) {}
      let fire = false, water = 0, spare = false;
      try { fire = !!(G.nearFire && G.nearFire()); } catch (e) {}
      try { water = G.cleanWaterForCooking ? G.cleanWaterForCooking() : 0; } catch (e) {}
      try {
        const T = (G.TIME || {}).TICKS_PER_DAY || 512;
        spare = ((s.dayTicks || 0) + 16 + 64) < T;
      } catch (e) {}
      t.days++;
      if ((s.kcal || 0) < cap * 0.5) t.lean++;
      t.poolSum += pool;
      if (pool > t.poolMax) t.poolMax = pool;
      t.waterSum += water; t.waterN++;
      if (atHaven) {
        t.haven++;
        t.poolHavenSum += pool;
        if (fire) {
          t.havenFire++;
          t.poolHavenFireSum += pool;
          if (water >= 1 && spare) {
            t.havenFireWater++;
            t.poolHavenFireWaterSum += pool;
          }
        }
      }
    } catch (e) {}
    return oDaily ? oDaily(G, ctx) : undefined;
  };
  const res = await quietLog(async () => {
    const r = await runDays(Game, base, { days: 180, sampleEvery: 60 });
    try { t.knowCook = Game.knowsTechnique('cook'); } catch (e) {}
    return r;
  });
  base.daily = oDaily;
  console.log(JSON.stringify({
    seed, pid, days: res.gameDays, end: res.endReason,
    lean: t.lean, haven: t.haven, havenFire: t.havenFire, havenFireWaterSpare: t.havenFireWater,
    poolAvg: Math.round(t.poolSum / Math.max(1, t.days)),
    poolHavenAvg: t.haven ? Math.round(t.poolHavenSum / t.haven) : 0,
    poolHavenFireAvg: t.havenFire ? Math.round(t.poolHavenFireSum / t.havenFire) : 0,
    poolHavenFireWaterAvg: t.havenFireWater ? Math.round(t.poolHavenFireWaterSum / t.havenFireWater) : 0,
    poolMax: Math.round(t.poolMax),
    waterAvg: t.waterN ? +(t.waterSum / t.waterN).toFixed(1) : 0,
    knowCook: t.knowCook,
  }));
}

(async () => {
  for (const k of ['FEASTSCALE_R13']) {
    if (process.env[k] !== '1') { console.error(`PROBE STOP: ${k}=1 required.`); process.exit(2); }
  }
  if (process.env.SEATDRIVE !== '0') { console.error('PROBE STOP: SEATDRIVE=0 required.'); process.exit(2); }
  for (const seed of SEEDS) for (const pid of Object.keys(POLICIES)) await oneRun(seed, pid);
})().catch(e => { console.error('PROBE FAILED', e); process.exit(1); });
