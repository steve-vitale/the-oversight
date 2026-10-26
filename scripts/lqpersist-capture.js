#!/usr/bin/env node
// lqpersist-capture.js — spoil/slab snapshot recorder (DIAG only,
// sim-lqpersist-b). Installed AFTER loadGame, AFTER garden-capture,
// throttledays-capture, and stock9762-capture, BEFORE setupGame,
// alongside inflow-capture (all reused UNCHANGED). Wraps
// Game.resolveOneAssignment a further time: the wrapper reads state,
// delegates with identical arguments, `this`, and return value, and
// writes ONLY to the caller's arrays. No Game.state write, no RNG
// consumption, no say/log write.
//
// What it records (one record per garden resolution, at entry — the
// same moment stock9762-capture reads its snapshot, so the two agree
// on the pantry):
//   throttle: Game.prodThrottleEngaged() (pure read)
//   channels: per item-name channel {channel, freshKcal, spoiledKcal,
//     stacks, slabFreshKcal, horizonMin, horizonMed, horizonMax,
//     horizonN, horizonNullStacks} where:
//     - fresh/nonFresh/spoiled use the SAME rule as stock9762-capture:
//       nonFresh = foodState 'preserved'/'rendered' or foodKind
//       'pemmican'; spoiled = Game.isSpoiled(it) true (when
//       available); fresh = everything else pantryFreshKcal counts.
//     - slabFreshKcal = fresh kcal in stacks with kcalEach > 2000
//       (the pantryDraw SLAB_KCAL: slabs ride last in the draw sort).
//     - horizon = spoilDay - day over FRESH stacks with non-null
//       spoilDay; horizonMed is the stack-median (conventional
//       median); horizonN counts those stacks; horizonNullStacks
//       counts fresh stacks with null spoilDay.
// snapshotPantry() is also exported for the sweep's day-end snapshots
// (same channel shape, same classification).
//
// Classification errors are recorded on the record's `error` field, never
// swallowed silently and never thrown into the game.
'use strict';

const { branchDay } = require('./plainvoice-capture');

const SLAB_KCAL = 2000;

function medianOf(xs) {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function isNonFresh(it) {
  return it.foodState === 'preserved' || it.foodState === 'rendered' ||
    (it.foodKind || '') === 'pemmican';
}

function snapshotPantry(Game) {
  const snap = { freshKcal: null, channels: [], error: null, day: null };
  try {
    try { snap.day = branchDay(Game); } catch (e) { snap.day = null; }
    const v = Game.state.village || {};
    try { snap.freshKcal = Game.pantryFreshKcal(); } catch (e) { snap.error = 'freshKcal: ' + String(e && e.message); }
    const byName = new Map();
    for (const it of (v.pantry || [])) {
      if (!it) continue;
      const kcal = (it.kcalEach || 0) * (it.units || 1);
      const channel = (it.name == null ? 'unnamed' : String(it.name));
      let b = byName.get(channel);
      if (!b) {
        b = { channel, freshKcal: 0, spoiledKcal: 0, stacks: 0,
          slabFreshKcal: 0, horizons: [], horizonNullStacks: 0 };
        byName.set(channel, b);
      }
      b.stacks += 1;
      if (isNonFresh(it)) continue;
      let spoiled = false;
      try {
        if (typeof Game.isSpoiled === 'function' && Game.isSpoiled(it)) spoiled = true;
      } catch (e) { snap.error = (snap.error ? snap.error + '; ' : '') + 'classify ' + channel + ': ' + String(e && e.message); }
      if (spoiled) { b.spoiledKcal += kcal; continue; }
      b.freshKcal += kcal;
      if ((it.kcalEach || 0) > SLAB_KCAL) b.slabFreshKcal += kcal;
      if (it.spoilDay == null) b.horizonNullStacks += 1;
      else b.horizons.push(it.spoilDay - (snap.day == null ? 0 : snap.day));
    }
    snap.channels = Array.from(byName.values()).map(b => {
      const hs = [...b.horizons].sort((a, b2) => a - b2);
      return {
        channel: b.channel, freshKcal: b.freshKcal, spoiledKcal: b.spoiledKcal,
        stacks: b.stacks, slabFreshKcal: b.slabFreshKcal,
        horizonMin: hs.length ? hs[0] : null,
        horizonMed: medianOf(b.horizons),
        horizonMax: hs.length ? hs[hs.length - 1] : null,
        horizonN: b.horizons.length,
        horizonNullStacks: b.horizonNullStacks,
      };
    }).sort((a, b) => (b.freshKcal - a.freshKcal) || (b.channel < a.channel ? -1 : 1));
  } catch (e) { snap.error = (snap.error ? snap.error + '; ' : '') + 'snapshot: ' + String(e && e.message); }
  return snap;
}

function installLqpersistCapture(Game, opts) {
  opts = opts || {};
  const ev = { resolutions: [] };
  const counters = { resolutionSeen: 0 };
  function dayOf() { try { return branchDay(Game); } catch (e) { return 1; } }
  const orig = Game.resolveOneAssignment;
  if (typeof orig !== 'function') throw new Error('lqpersist-capture: Game.resolveOneAssignment is not a function');
  if (orig.__lqpersistInstalled) throw new Error('lqpersist-capture: Game.resolveOneAssignment already lqpersist-wrapped');
  const wrapped = function (...args) {
    const a = args[1] || {};
    const isGarden = a.task === 'garden';
    let rec = null;
    if (isGarden) {
      const snap = snapshotPantry(Game);
      rec = { day: dayOf(), vid: String(args[0]), throttle: null,
        freshKcal: snap.freshKcal, channels: snap.channels, error: snap.error };
      try { rec.throttle = !!Game.prodThrottleEngaged(); } catch (e) { rec.error = (rec.error ? rec.error + '; ' : '') + 'throttle: ' + String(e && e.message); }
    }
    const ret = orig.apply(this, args);
    if (rec) { counters.resolutionSeen++; ev.resolutions.push(rec); }
    return ret;
  };
  wrapped.__lqpersistInstalled = true;
  Game.resolveOneAssignment = wrapped;
  return { events: ev, counters, snapshotPantry: () => snapshotPantry(Game) };
}

module.exports = { installLqpersistCapture, snapshotPantry };
