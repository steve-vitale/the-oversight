#!/usr/bin/env node
// scripts/probe-harvvol-20261017.js — volume probe for the harvstop arm
// (sim-harvstop-b, 2026-10-17, food-economy axis).
//
// QUESTION (pre-registration volume-sanity): on the FEASTSCALE_R13=1 /
// SEATDRIVE=0 courtship substrate, how much scholar-side forage hauling
// happens on throttle-engaged days (the engine's own prodthrottle:
// pantryFreshDays() > 4 — duty forage/garden/fish already stands down)?
// The harvstop layer can only avoid THIS volume. If it is too small to
// move rot-per-pantry-kcal by 25%, the primary is NO-COVERAGE, honest.
//
// 3 seeds x {belongfeast, leadfeast}, 180d death-aware, instruments only —
// no layer. Prints per-run: throttleDays, scholarTrips, tripsOnThrottle,
// scholarDonationKcal (total + on throttle days), inflowKcal (stockPantry),
// freshRot, packRot, pantryKcal-days.
'use strict';
process.env.LEANWINTER_LIB = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

const SEEDS = (process.env.SEEDS || '4401,4402,4403').split(',').map(s => parseInt(s, 10));

function gday(G) { try { return (G.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function pantryKcal(G) {
  try { return ((G.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; }
}
function isSpoiled(G, it) { try { return G.isSpoiled ? !!G.isSpoiled(it) : false; } catch (e) { return false; } }
function freshItem(it) {
  if (!it || (it.kcalEach || 0) <= 0 || (it.units || 0) <= 0) return false;
  if (it.foodState === 'preserved' || it.foodState === 'rendered' || (it.foodKind || '') === 'pemmican') return false;
  return true;
}

async function oneRun(seed, policyId) {
  process.env.FEASTSCALE_R13 = '1'; process.env.SEATDRIVE = '0';
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const { Game } = await loadGame({ seed, mode: `harvvol-${policyId}`, fullTelemetry: false });
  await setupGame(Game);

  const t = {
    throttleDays: 0, trips: 0, tripsOnThrottle: 0,
    donKcal: 0, donKcalOnThrottle: 0,
    harvKcal: 0, harvKcalOnThrottle: 0, // scholar pack inflow from forage verb
    inflowKcal: 0, surplusKcal: 0, freshRot: 0, packRot: 0,
    pantryKcalDays: 0, dayCount: 0,
  };
  const packKcalNow = () => {
    try { return ((Game.state.scholar || {}).inventory || []).reduce((a, i) => a + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; }
  };
  // harvest instrument: pack-kcal delta around the scholar's forage verb
  const origAct = Game.doAction ? Game.doAction.bind(Game) : null;
  if (origAct) {
    Game.doAction = function (kind, opts) {
      const before = kind === 'forage' ? packKcalNow() : 0;
      const r = origAct.apply(this, arguments);
      if (kind === 'forage') {
        try {
          const d = packKcalNow() - before;
          if (d > 0) {
            t.harvKcal += Math.round(d);
            if (t._throttleNow) t.harvKcalOnThrottle += Math.round(d);
          }
        } catch (e) {}
      }
      return r;
    };
  }
  // inflow instrument: wrap stockPantry (duty/engine inflow) + stockSurplus
  // (villager shared surplus — the ambient meal loop's inflow)
  const origStock = Game.stockPantry ? Game.stockPantry.bind(Game) : null;
  if (origStock) {
    Game.stockPantry = function (kcal, name) {
      try { if (typeof kcal === 'number' && kcal > 0) t.inflowKcal += Math.round(kcal); } catch (e) {}
      return origStock.apply(this, arguments);
    };
  }
  const origSurplus = Game.stockSurplus ? Game.stockSurplus.bind(Game) : null;
  if (origSurplus) {
    Game.stockSurplus = function (v, give) {
      try { if (typeof give === 'number' && give > 0) { t.inflowKcal += Math.round(give); t.surplusKcal += Math.round(give); } } catch (e) {}
      return origSurplus.apply(this, arguments);
    };
  }
  // donation instrument: scholar-side inflow
  const origDon = Game.donateToPantry ? Game.donateToPantry.bind(Game) : null;
  if (origDon) {
    Game.donateToPantry = function (idx) {
      let k = 0;
      try { const it = (Game.state.scholar || {}).inventory[idx]; if (it) k = Math.round((it.kcalEach || 0) * (it.units || 1)); } catch (e) {}
      const r = origDon.apply(this, arguments);
      if (r && k > 0) {
        t.donKcal += k;
        try { if (t._throttleNow) t.donKcalOnThrottle += k; } catch (e) {}
      }
      return r;
    };
  }
  // rot instrument (trig6 convention): scan just before sweepSpoiled
  const origSweep = Game.sweepSpoiled ? Game.sweepSpoiled.bind(Game) : null;
  if (origSweep) {
    Game.sweepSpoiled = function () {
      try {
        const scan = (arr, which) => {
          for (const it of (arr || [])) {
            if (!freshItem(it) || !isSpoiled(Game, it)) continue;
            const k = Math.round((it.kcalEach || 0) * (it.units || 1));
            if (which === 'pantry') t.freshRot += k; else t.packRot += k;
          }
        };
        scan((Game.state.scholar || {}).inventory, 'pack');
        try { const ps = Game.prepStash ? Game.prepStash() : null; if (ps && ps !== Game.state.scholar.inventory) scan(ps, 'pack'); } catch (e) {}
        scan((Game.state.village || {}).pantry, 'pantry');
      } catch (e) {}
      return origSweep.apply(this, arguments);
    };
  }

  const policy = Object.assign({}, base);
  let runCtx = null;
  const oSetup = base.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
  const oDaily = base.daily;
  let prevTrips = 0;
  policy.daily = (G, ctx) => {
    let throttleNow = false;
    try { throttleNow = !!G.prodThrottleEngaged && G.prodThrottleEngaged(); } catch (e) {}
    t._throttleNow = throttleNow;
    if (throttleNow) t.throttleDays++;
    t.pantryKcalDays += pantryKcal(G);
    t.dayCount++;
    const r = oDaily ? oDaily(G, ctx) : undefined;
    const trips = (ctx.forageTrips || 0);
    const delta = trips - prevTrips; prevTrips = trips;
    t.trips += delta;
    if (delta > 0 && throttleNow) t.tripsOnThrottle += delta;
    t._throttleNow = false;
    return r;
  };

  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, sampleEvery: 30 }); });
  console.log(JSON.stringify({
    seed, policy: policyId, days: result && result.days,
    throttleDays: t.throttleDays, trips: t.trips, tripsOnThrottle: t.tripsOnThrottle,
    donKcal: t.donKcal, donKcalOnThrottle: t.donKcalOnThrottle,
    harvKcal: t.harvKcal, harvKcalOnThrottle: t.harvKcalOnThrottle,
    inflowKcal: t.inflowKcal, surplusKcal: t.surplusKcal, freshRotPantry: t.freshRot, packRot: t.packRot,
    pantryKcalDays: Math.round(t.pantryKcalDays), dayCount: t.dayCount,
  }));
}

(async () => {
  for (const seed of SEEDS) for (const pid of ['belongfeast', 'leadfeast']) {
    try { await oneRun(seed, pid); } catch (e) { console.log(JSON.stringify({ seed, policy: pid, error: String(e && e.message).slice(0, 160) })); }
  }
})();
