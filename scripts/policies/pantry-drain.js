// policies/pantry-drain.js — the pantry-drain pressure policy (crisis leg r28, 2026-10-19).
//
// Built for the crisis leg's named next question: is the schism crisis
// reachable? Schism fires only on exile (moot verdict 'exile', freeloader
// vote-out, or exilePlayer('moot')). r25: 0/4 competent (oracleV2) seeds fired
// it. The documented exile-producing regime (longsim scale-wall r6,
// scripts/policies/selfeed.js): ~1,000 kcal/day communal-pantry takes with
// gives=0 trip theftConfrontation's cumulative-4000 bar -> 'hoard'
// observations -> grievances -> moot theft case -> conviction -> exile.
// This policy reproduces exactly that regime on a competent survival base:
//   1. DONATE DISABLED: donateToPantry is a no-op for the day (gives stay 0).
//   2. DRAIN: after competent.daily, take pantry items one at a time until
//      today's takes >= 1300 kcal (or pantry empty / carry full).
// Deterministic: take order is pantry index order; no unseeded randomness
// beyond what competent already does.
'use strict';
const { competent } = require('./competent');

const DAILY_TARGET = parseInt(process.env.DRAIN_TARGET || '3500', 10);

function todayTakes(Game, vid) {
  try {
    const day = (Game.state.scholar || {}).day || 0;
    const h = ((Game.state.village || {}).takeHist || {})[vid] || [];
    let sum = 0;
    for (const e of h) if (e && e.day === day) sum += e.kcal || 0;
    return sum;
  } catch (e) { return 0; }
}

const pantryDrain = {
  desc: 'competent base + ~1300 kcal/day pantry takes, never donates: the documented exile-producing drain regime',
  daily(Game, ctx) {
    // Disable donations for the day (gives must stay 0).
    const origDonate = Game.donateToPantry ? Game.donateToPantry.bind(Game) : null;
    let donateAttempts = 0;
    if (origDonate) {
      Game.donateToPantry = function () { donateAttempts++; return null; };
    }
    try { competent.daily(Game, ctx); } catch (e) {}
    if (origDonate) Game.donateToPantry = origDonate;
    ctx.donateAttempts = (ctx.donateAttempts || 0) + donateAttempts;

    // Drain: go inside the hall (takeFromPantry requires insideHaven), then
    // take until today's takes hit the target.
    const me = Game.villagerId;
    let drained = 0;
    try {
      try { if (Game.playerAtHaven && Game.playerAtHaven() && !Game.state.scholar.insideHaven && Game.enterBuilding) Game.enterBuilding(); } catch (e) {}
      let guard = 0;
      while (todayTakes(Game, me) < DAILY_TARGET && guard++ < 40) {
        const pantry = (Game.state.village || {}).pantry || [];
        if (!pantry.length) break;
        // richest item first (index order is fine; pantry is small)
        let idx = -1, best = 0;
        for (let i = 0; i < pantry.length; i++) {
          const it = pantry[i];
          const k = (it && it.kcalEach || 0) * (it && it.units || 1);
          if (k > best) { best = k; idx = i; }
        }
        if (idx < 0) break;
        const before = todayTakes(Game, me);
        try { Game.takeFromPantry(idx); } catch (e) { break; }
        const after = todayTakes(Game, me);
        if (after <= before) break; // carry full or refused
        drained += (after - before);
      }
    } catch (e) {}
    ctx.drainedToday = drained;
  },
};

module.exports = { pantryDrain };
