#!/usr/bin/env node
// probe-cookbulk-b.js — substrate probe for the cook-bulk layer (NOT committed evidence).
// Answers before lever design:
//   1. On lean days, where are cookable (needsCooking/rawKcal) beans/rice? pack / prepStash / pantry?
//   2. Does the scholar know technique 'cook'?
//   3. Is there a fire at Haven (nearFire at Haven tile)?
//   4. What's village.water.clean on lean days?
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/probe-cookbulk-b.js
'use strict';
const { belongfeast, leadfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SEEDS = [7901, 7902, 7903];
const POLICIES = { leadfeast, belongfeast };

const cookableOf = (arr) => (arr || []).filter(i => i && (i.needsCooking || i.rawKcal) &&
  (i.foodKind === 'plant' || i.foodKind === undefined || (i.foodKind === 'meat' && i.foodState === 'cleaned')));
const kcalOf = (arr) => cookableOf(arr).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);

async function oneRun(seed, pid) {
  const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  const base = POLICIES[pid];
  const t = { lean: 0, packKcal: 0, stashKcal: 0, pantryKcal: 0, leanFire: 0, leanHaven: 0, leanWater: [] };
  const oDaily = base.daily;
  base.daily = (G, ctx) => {
    try {
      const s = G.state.scholar || {};
      const cap = (G.kcalCap ? G.kcalCap() : 2400) || 2400;
      if ((s.kcal || 0) < cap * 0.5) {
        t.lean++;
        t.packKcal += kcalOf(s.inventory);
        t.stashKcal += kcalOf(G.prepStash ? G.prepStash() : []);
        t.pantryKcal += kcalOf((G.state.village || {}).pantry);
        try { if (G.nearFire && G.nearFire()) t.leanFire++; } catch (e) {}
        try {
          let atHaven = G.location === 'haven';
          const pt = G.playerTile ? G.playerTile() : null;
          if (pt && pt.type === 'haven') atHaven = true;
          if (atHaven) t.leanHaven++;
        } catch (e) {}
        try { t.leanWater.push(G.cleanWaterForCooking ? G.cleanWaterForCooking() : -1); } catch (e) {}
      }
    } catch (e) {}
    return oDaily ? oDaily(G, ctx) : undefined;
  };
  let knowCook = null;
  const res = await quietLog(async () => {
    const r = await runDays(Game, base, { days: 60, sampleEvery: 60 });
    try { knowCook = Game.knowsTechnique('cook'); } catch (e) {}
    return r;
  });
  base.daily = oDaily;
  console.log(`[${pid} s${seed}] days=${res.gameDays} leanDays=${t.lean} ` +
    `packCookKcal=${Math.round(t.packKcal)} stashCookKcal=${Math.round(t.stashKcal)} pantryCookKcal=${Math.round(t.pantryKcal)} ` +
    `leanFire=${t.leanFire} leanHaven=${t.leanHaven} knowCook=${knowCook} ` +
    `waterLeanAvg=${t.leanWater.length ? (t.leanWater.reduce((a,b)=>a+b,0)/t.leanWater.length).toFixed(1) : 'n/a'}`);
  return t;
}

(async () => {
  for (const k of ['FEASTSCALE_R13']) {
    if (process.env[k] !== '1') { console.error(`PROBE STOP: ${k}=1 required.`); process.exit(2); }
  }
  if (process.env.SEATDRIVE !== '0') { console.error('PROBE STOP: SEATDRIVE=0 required.'); process.exit(2); }
  for (const seed of SEEDS) for (const pid of Object.keys(POLICIES)) await oneRun(seed, pid);
})().catch(e => { console.error('PROBE FAILED', e); process.exit(1); });
