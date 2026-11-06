'use strict';
// competent-longday-a.js — LONG-DAY VARIANT of competent policy
// (sim-spandraw-census-a, loop A food-economy arm, 2026-11-06).
//
// Prereg: evidence/2026-11-06/sim-spandraw-census-a-prereg.md
// (committed BEFORE any judged sim; evening-work design amended
// by the smoke diagnostic, see below). Policy-side arm: a NEW
// policy file, default OFF (nothing loads it unless a driver
// names it), ZERO src/js changes, ZERO edits to
// scripts/policies/competent.js, ZERO policy-default flips.
//
// WHY IT EXISTS (playpath-b's named follow-up): real-play evening
// taps land at median dayTicks 405, max 478 — never within any
// key's cost of the 512-tick boundary — so day-crossing spans stay
// unproven in real play. This variant's days run longer through
// MORE EVENING WORK, not clock-setting: after competent.daily, the
// scholar works one more honest evening — a second forage trip,
// then haven chores (sort, garden, talk) — while there is strength
// and food to work with. The tap then happens after that work, at
// whatever dayTicks the work left — recorded, never chosen. No
// dayTicks/dayPart setting, no tickAction call, no wait-to-dusk,
// no kcal/health top-up.
//
// SMOKE DIAGNOSTIC (2026-11-06, before any judged sim): the
// first evening-work shape (garden + talk only) added ~1 tick
// per round — the garden is already worked by competent.daily,
// so workGarden is a no-op in the evening and taps stayed at
// max 476. A second forage trip is the evening work that actually
// spends time (travel + a 16-tick forage + the walk home), so the
// design now leads with one extra trip per evening, then haven
// chores. The prereg amendment records this; no judged corpus
// exists yet, so no verdict is re-scored.
//
// STOP RULES (resource grounds, never a clock target): energy < 20,
// kcal < 800, a round adding 0 ticks (work exhausted), the day
// rolling inside evening work (the tap then lands the next
// morning, as in playpath-b), combat, game over, or 6 rounds.
// Nothing here steers the tap toward the boundary: evening work
// ends when the work or the worker is done, and the tap's
// position is the consequence.
const { competent, workGarden, talkRound, forageTripSeedFirst, sortHaul } = require('./competent');

function eveningWork(Game, ctx) {
  let rounds = 0;
  try {
    while (rounds < 6) {
      const s = Game.state.scholar;
      if (!s || Game.over) break;
      if (Game.inCombat && Game.inCombat()) break;
      if (Game.pendingEncounter) break;
      if ((s.energy == null ? 100 : s.energy) < 20) break;
      if ((s.kcal || 0) < 800) break;
      const dayBefore = s.day;
      const t0 = s.dayTicks || 0;
      if (rounds === 0) {
        // One more honest trip in the evening: the same forage
        // work competent.daily already does, repeated while there
        // is light. The trip walks home at the end (or walks home
        // on a fight); with no stocked ground it spends nothing
        // and the evening falls back to haven chores below.
        try { forageTripSeedFirst(Game, ctx); } catch (e) { /* trip failure is a missed evening, not a crash */ }
        try { sortHaul(Game, ctx); } catch (e) {}
      }
      // Haven chores after the trip (garden is a no-op once
      // worked; talk is a short sitting) — the quiet end of a
      // long day, not the work that makes it long.
      try { if (Game.playerAtHaven && Game.playerAtHaven()) workGarden(Game, ctx); } catch (e) {}
      try { talkRound(Game, ctx); } catch (e) {}
      const s2 = Game.state.scholar || {};
      const t1 = s2.dayTicks || 0;
      rounds++;
      ctx.longdayRounds = (ctx.longdayRounds || 0) + 1;
      // A day roll resets dayTicks to 0: the day ended inside the
      // work, so the tap lands next morning. Record it, stop here.
      if (s2.day !== dayBefore) { ctx.longdayDayRolls = (ctx.longdayDayRolls || 0) + 1; break; }
      const added = t1 - t0;
      ctx.longdayTicksAdded = (ctx.longdayTicksAdded || 0) + Math.max(0, added);
      if (added <= 0) break; // no progress: the work is done for today
    }
  } catch (e) {
    ctx.longdayError = String(e && e.message).slice(0, 120);
  }
  ctx.longdayEveningRounds = rounds;
}

const competentLongday = Object.assign({}, competent, {
  daily(Game, ctx) {
    competent.daily(Game, ctx);
    if (Game.over) return;
    eveningWork(Game, ctx);
  },
});

module.exports = { competentLongday, eveningWork };
