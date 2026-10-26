#!/usr/bin/env node
// throttledays-capture.js — garden-resolution denominator recorder (DIAG only,
// sim-throttledays-b). Installed AFTER loadGame, AFTER garden-capture, BEFORE
// setupGame, alongside scripts/inflow-capture.js and scripts/garden-capture.js
// (both reused UNCHANGED). Wraps Game.resolveOneAssignment a further time:
// the wrapper reads state, delegates to the garden-wrapped function with
// identical arguments, `this`, and return value, and writes ONLY to the
// caller's arrays. No Game.state write, no RNG consumption, no say/log
// write. All reads are try/catch isolated; a throwing read yields null
// fields on that record, never a game write.
//
// What it records (one record per garden resolution, at entry — the same
// moment garden-capture reads its throttle flag, so the two flags must
// agree):
//   throttle:       Game.prodThrottleEngaged() (pure read)
//   hungryStreak:   progState().hungryStreak (the hunger exemption input)
//   hungerExempt:   Game.prodThrottleHungerExempt() (stand-down flag)
//   freshKcal:      Game.pantryFreshKcal() (the SHARED numerator)
//   freshDays:      Game.pantryFreshDays() (the DRAIN clock)
//   burnMean/burnN: mean + count of positive village burnHistory entries
//   roster:         (village.roster || []).length at entry
//   needDays:       freshKcal / (roster * 2000), null if roster is 0 or
//                   freshKcal is null (the NEED clock; same numerator,
//                   full-need denominator — the freshdays arm's
//                   "fallbackDays" computed at resolution entry)
//   totalKcal:      sum of (kcalEach||0)*(units||1) over the whole pantry
//                   (context only: total-pantry need-days)
//   fallback:       true when burnN is 0, i.e. the drain clock falls back
//                   to roster x 2000 and drain == need by construction
// The analyzer (scripts/analyze-throttledays-b.js) judges coverage and
// disagreement from these records; it never re-derives a denominator
// from anything else.
'use strict';

const { branchDay } = require('./plainvoice-capture');

function installThrottledaysCapture(Game, opts) {
  opts = opts || {};
  const ev = { resolutions: [] };
  const counters = { resolutionSeen: 0 };
  function dayOf() { try { return branchDay(Game); } catch (e) { return 1; } }
  const orig = Game.resolveOneAssignment;
  if (typeof orig !== 'function') throw new Error('throttledays-capture: Game.resolveOneAssignment is not a function');
  if (orig.__throttledaysInstalled) throw new Error('throttledays-capture: Game.resolveOneAssignment already throttledays-wrapped');
  const wrapped = function (...args) {
    const a = args[1] || {};
    const isGarden = a.task === 'garden';
    let rec = null;
    if (isGarden) {
      rec = { day: dayOf(), vid: String(args[0]), throttle: null, hungryStreak: null,
        hungerExempt: null, freshKcal: null, freshDays: null, burnMean: null,
        burnN: null, roster: null, needDays: null, totalKcal: null,
        totalNeedDays: null, fallback: null };
      try { rec.throttle = !!Game.prodThrottleEngaged(); } catch (e) {}
      try {
        const pg = (typeof Game.progState === 'function') ? Game.progState() : null;
        rec.hungryStreak = (pg && pg.hungryStreak != null) ? pg.hungryStreak : null;
      } catch (e) {}
      try { rec.hungerExempt = !!Game.prodThrottleHungerExempt(); } catch (e) {}
      try { rec.freshKcal = Game.pantryFreshKcal(); } catch (e) {}
      try { rec.freshDays = Game.pantryFreshDays(); } catch (e) {}
      try {
        const v = Game.state.village || {};
        const hist = Array.isArray(v.burnHistory) ? v.burnHistory : [];
        const pos = hist.filter((x) => x > 0);
        rec.burnN = pos.length;
        rec.burnMean = pos.length ? pos.reduce((x, y) => x + y, 0) / pos.length : null;
        rec.roster = (v.roster || []).length;
        rec.fallback = (pos.length === 0);
        if (rec.freshKcal != null && rec.roster > 0) rec.needDays = rec.freshKcal / (rec.roster * 2000);
        let total = 0;
        for (const it of (v.pantry || [])) {
          if (!it) continue;
          total += (it.kcalEach || 0) * (it.units || 1);
        }
        rec.totalKcal = total;
        if (rec.roster > 0) rec.totalNeedDays = total / (rec.roster * 2000);
      } catch (e) {}
    }
    const ret = orig.apply(this, args);
    try {
      if (isGarden && rec) { counters.resolutionSeen++; ev.resolutions.push(rec); }
    } catch (e) {}
    return ret;
  };
  wrapped.__throttledaysInstalled = true;
  Game.resolveOneAssignment = wrapped;
  return { events: ev, counters };
}

module.exports = { installThrottledaysCapture };
