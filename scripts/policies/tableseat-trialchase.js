// tableseat-trialchase — tableseat-nowait + a TRIAL-CHASING player layer
// (sim-rule3trial-a, axis scale-onramp, run fleshout-20261027T1940Z).
//
// POLICY-SIDE ONLY. ZERO src/js. Default OFF: TRIALCHASE unset or not '1'
// → daily delegates to tableseat-nowait.daily EXACTLY (the det-gate in
// scripts/test-rule3trial-a-sweep.js pins that: trial-off days equal
// tableseat-nowait days on the det-gate seed).
//
// WHY: the 1816Z next-blank (evidence/2026-10-27/sim-lowdef-a.md, metric
// review) orders a TRIAL-COMPLETING PLAYER substrate for the live rule-(3)
// test, not another courtship variant: "build a trial-completing player (a
// policy that chases active trials: haul hard and identify fast while a
// trial is open) and pre-register it as a NEW substrate with its own
// det-gate". Lowdef proved defiance at seating IS trial expiries
// (diagnostic seeds: 7/7 and 11/11 expiries, 0 arena / 0 declined /
// 0 refused) — so a substrate that completes trials instead of expiring
// them is the only mechanism left that can produce a no-defiance seating.
//
// WHAT THE CHASE DOES (only while Game.progState().trial is active):
//   Pantry trial (haul 1,000 / 3,000 kcal in 3 days): after the base
//     daily, run ONE extra forage trip, sort the haul, and donate the
//     pack's donation-ready food with keepKcal 0 — every edible bite the
//     player carries goes to the pantry while the trial is open, because
//     pantry GROWTH (net of the village drain) is what the trial measures.
//   Identify trial (3 plants to knowledge level 3 in 3 days): after the
//     base daily, run one extra forage trip, sort the haul, then eat
//     level-2 plants from the pack with eatOne — eating a level-2 plant
//     is what advances it (3 tastings at level 2 → level 3, game.js
//     eatOne). Only safe, identified, ready food is eaten (no disease /
//     poison / parasite risk, not spoiled, not in-shell, no cooking
//     needed); a full scholar eats nothing (recorded, not forced).
// This is genuine play, not a trial cheat: the player spends real
// day-parts foraging again, donates real food, eats real food. No
// trial state is read to alter the trial itself, no ledger is touched,
// no door is forced. Trials the player cannot complete still expire
// (recorded as expired, with the ledger deltas to prove it).
//
// TELEMETRY (ctx, prefix tr): trTrials[] — one record per trial instance
// seen in daily {key, kind, need, expires, offeredDay, endDay, outcome,
// defianceDelta, showmanshipDelta}; trCompleted / trExpired counts;
// trChasePantry / trChaseIdentify (chase days by kind); trPantryGain
// (pantry kcal gained across the chase step, summed).
//
// NEVER edit tableseat-nowait.js, tablepaths-defiant.js,
// leanlinkrescue.js, competent.js, or any src/js file.
'use strict';
const { tableseatNowait } = require('./tableseat-nowait');
const { leanlinkrescue } = require('./leanlinkrescue');
const { forageTripSeedFirst, sortHaul, donateSurplus } = require('./competent');

function trLayerOn() {
  try { return String((typeof process !== 'undefined' && process.env && process.env.TRIALCHASE) || '0') === '1'; } catch (e) { return false; }
}
function trGday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function trPantryKcal(Game) {
  try { return ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; }
}
function trTrialOf(Game) {
  try { const pg = Game.progState ? Game.progState() : {}; return pg.trial || null; } catch (e) { return null; }
}
function trLedgerOf(Game) {
  try { const L = Game.ledger ? Game.ledger() : {}; return { defiance: L.defiance || 0, showmanship: L.showmanship || 0 }; } catch (e) { return { defiance: 0, showmanship: 0 }; }
}
function trCodexLevel(Game, pid) {
  try { return (((Game.state.codex || {}).plants || {})[pid] || {}).level || 0; } catch (e) { return 0; }
}
function trIsSpoiled(Game, it) { try { return Game.isSpoiled ? !!Game.isSpoiled(it) : false; } catch (e) { return false; } }

// Observe the trial lifecycle once per daily call. A trial instance is
// keyed by kind + expires (cooldown 4-5 days, window 3 days, so expires
// is unique per instance). When a previously seen trial is gone, its
// outcome is read off the ledger deltas: expiry adds defiance +1,
// completion adds showmanship +3 — on this substrate the arena-defiance
// channel is closed (harness contests answer option 0), so a defiance
// rise across a trial's life is an expiry signature, not noise.
function trObserve(Game, ctx) {
  try {
    const t = trTrialOf(Game);
    const led = trLedgerOf(Game);
    const day = trGday(Game);
    if (t) {
      const key = String(t.kind) + ':' + String(t.expires);
      if (!ctx._trPrev || ctx._trPrev.key !== key) {
        // Close any previous instance first (it vanished between dailies).
        if (ctx._trPrev) trClose(Game, ctx, day);
        ctx._trPrev = { key, kind: t.kind, need: t.need, expires: t.expires, offeredDay: (t.expires || day) - 3, defiance0: led.defiance, showmanship0: led.showmanship };
        ctx.trTrials = ctx.trTrials || [];
        ctx.trTrials.push(Object.assign({}, ctx._trPrev, { outcome: 'open' }));
      }
      return t;
    }
    if (ctx._trPrev) trClose(Game, ctx, day);
    return null;
  } catch (e) { ctx.trObserveErr = String(e && e.message).slice(0, 80); return null; }
}
function trClose(Game, ctx, day) {
  try {
    const prev = ctx._trPrev; if (!prev) return;
    const led = trLedgerOf(Game);
    const dDef = led.defiance - (prev.defiance0 || 0);
    const dSho = led.showmanship - (prev.showmanship0 || 0);
    let outcome = 'unknown';
    if (dDef > 0) outcome = 'expired';
    else if (dSho > 0) outcome = 'completed';
    const rec = (ctx.trTrials || []).find(r => r.key === prev.key);
    if (rec) { rec.outcome = outcome; rec.endDay = day; rec.defianceDelta = dDef; rec.showmanshipDelta = dSho; }
    if (outcome === 'completed') ctx.trCompleted = (ctx.trCompleted || 0) + 1;
    if (outcome === 'expired') ctx.trExpired = (ctx.trExpired || 0) + 1;
    ctx._trPrev = null;
  } catch (e) { ctx.trCloseErr = String(e && e.message).slice(0, 80); }
}

// The chase itself: runs AFTER the base daily, only with an active trial.
// Returns nothing; all effects are counted in ctx.
function trialChase(Game, ctx) {
  try {
    if (Game.over) return;
    const t = trObserve(Game, ctx);
    if (!t) return;
    const pkBefore = trPantryKcal(Game);
    if (t.kind === 'pantry') {
      ctx.trChasePantry = (ctx.trChasePantry || 0) + 1;
      try { forageTripSeedFirst(Game, ctx); } catch (e) {}
      if (!Game.over && !Game.tbfight) { try { sortHaul(Game, ctx); } catch (e) {} }
      if (!Game.over) { try { donateSurplus(Game, ctx, { keepKcal: 0 }); } catch (e) {} }
    } else if (t.kind === 'identify') {
      ctx.trChaseIdentify = (ctx.trChaseIdentify || 0) + 1;
      try { forageTripSeedFirst(Game, ctx); } catch (e) {}
      if (!Game.over && !Game.tbfight) { try { sortHaul(Game, ctx); } catch (e) {} }
      // Eat level-2 plants toward level 3 (3 tastings at L2 → L3).
      try {
        const s = Game.state.scholar || {};
        let bites = 0;
        const inv = s.inventory || [];
        for (let i = inv.length - 1; i >= 0 && bites < 12; i--) {
          if (Game.over || Game.tbfight) break;
          const it = inv[i];
          if (!it || !it.plantId || (it.kcalEach || 0) <= 0 || (it.units || 0) <= 0) continue;
          if (it.edible === false || it.safe === false || it.diseaseRisk || it.poisonRisk || it.parasiteRisk) continue;
          if (it.needsCooking || it.foodState === 'in_shell' || trIsSpoiled(Game, it)) continue;
          if (trCodexLevel(Game, it.plantId) !== 2) continue;
          const entry = ((Game.state.codex || {}).plants || {})[it.plantId] || {};
          const need = Math.max(0, 3 - (entry.tastings || 0));
          for (let b = 0; b < need && bites < 12; b++) {
            if ((Game.state.scholar.kcal || 0) >= (Game.kcalCap ? Game.kcalCap() : 2400)) { ctx.trEatFull = (ctx.trEatFull || 0) + 1; break; }
            const beforeUnits = it.units;
            try { Game.eatOne(i); } catch (e) { break; }
            if (it.units === beforeUnits) break; // refused (full, spoiled, inedible) — no bite spent
            bites++;
            ctx.trEatL2Bites = (ctx.trEatL2Bites || 0) + 1;
            if (trCodexLevel(Game, it.plantId) === 3) { ctx.trL2toL3 = (ctx.trL2toL3 || 0) + 1; break; }
          }
        }
      } catch (e) { ctx.trEatErr = String(e && e.message).slice(0, 80); }
    } else {
      ctx.trChaseOther = (ctx.trChaseOther || 0) + 1;
    }
    const pkAfter = trPantryKcal(Game);
    ctx.trPantryGain = (ctx.trPantryGain || 0) + (pkAfter - pkBefore);
  } catch (e) { ctx.trChaseErr = String(e && e.message).slice(0, 80); }
}

const tableseatTrialchase = Object.assign({}, tableseatNowait, {
  id: 'tableseat-trialchase',
  desc: 'tableseat-nowait + trial-chasing player (extra forage + donate-all on pantry trials, eat L2 plants on identify trials; default off = tableseat-nowait)',
  daily(Game, ctx) {
    if (!trLayerOn()) return tableseatNowait.daily(Game, ctx);
    const r = tableseatNowait.daily(Game, ctx);
    trialChase(Game, ctx);
    return r;
  },
});

module.exports = { tableseatTrialchase, trLayerOn, trialChase, trObserve };
