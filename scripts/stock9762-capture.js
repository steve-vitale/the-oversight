#!/usr/bin/env node
// stock9762-capture.js — pantry-composition snapshot recorder (DIAG only,
// sim-stock9762-b). Installed AFTER loadGame, AFTER garden-capture and
// throttledays-capture, BEFORE setupGame, alongside inflow-capture (all
// reused UNCHANGED). Wraps Game.resolveOneAssignment a further time: the
// wrapper reads state, delegates with identical arguments, `this`, and
// return value, and writes ONLY to the caller's arrays. No Game.state
// write, no RNG consumption, no say/log write.
//
// What it records (one record per garden resolution, at entry — the same
// moment garden-capture and throttledays-capture read their flags, so
// the three flags must agree):
//   throttle:    Game.prodThrottleEngaged() (pure read)
//   freshKcal:   Game.pantryFreshKcal() (the throttle's numerator)
//   freshRebuilt: sum of the snapshot buckets' freshKcal — must equal
//                 freshKcal (cross-check; both sum the same items)
//   totalKcal:   sum of (kcalEach||0)*(units||1) over the whole pantry
//   roster:      (village.roster || []).length at entry
//   buckets:     per item-name channel {channel, freshKcal, nonFreshKcal,
//                 spoiledKcal, stacks} — fresh/nonFresh/spoiled use the
//                 SAME rule as pantryFreshKcal: nonFresh = foodState
//                 'preserved'/'rendered' or foodKind 'pemmican';
//                 spoiled = Game.isSpoiled(it) true (when available);
//                 fresh = everything else pantryFreshKcal counts.
// snapshotPantry() is also exported for the sweep's day-end snapshots
// (same bucket shape, same classification).
//
// Classification errors are recorded on the record's `error` field, never
// swallowed silently and never thrown into the game.
'use strict';

const { branchDay } = require('./plainvoice-capture');

function classifyBucket(it, Game) {
  const kcal = (it.kcalEach || 0) * (it.units || 1);
  if (it.foodState === 'preserved' || it.foodState === 'rendered' ||
      (it.foodKind || '') === 'pemmican') return ['nonFresh', kcal];
  try {
    if (typeof Game.isSpoiled === 'function' && Game.isSpoiled(it)) return ['spoiled', kcal];
  } catch (e) { return ['error', kcal, String(e && e.message)]; }
  return ['fresh', kcal];
}

function snapshotPantry(Game) {
  const snap = { freshKcal: null, freshRebuilt: 0, totalKcal: 0,
    roster: null, buckets: [], error: null };
  try {
    const v = Game.state.village || {};
    snap.roster = (v.roster || []).length;
    try { snap.freshKcal = Game.pantryFreshKcal(); } catch (e) { snap.error = 'freshKcal: ' + String(e && e.message); }
    const byName = new Map();
    for (const it of (v.pantry || [])) {
      if (!it) continue;
      const kcal = (it.kcalEach || 0) * (it.units || 1);
      snap.totalKcal += kcal;
      const channel = (it.name == null ? 'unnamed' : String(it.name));
      let b = byName.get(channel);
      if (!b) { b = { channel, freshKcal: 0, nonFreshKcal: 0, spoiledKcal: 0, stacks: 0 }; byName.set(channel, b); }
      b.stacks += 1;
      const cls = classifyBucket(it, Game);
      if (cls[0] === 'fresh') { b.freshKcal += kcal; snap.freshRebuilt += kcal; }
      else if (cls[0] === 'nonFresh') b.nonFreshKcal += kcal;
      else if (cls[0] === 'spoiled') b.spoiledKcal += kcal;
      else { snap.error = (snap.error ? snap.error + '; ' : '') + 'classify ' + channel + ': ' + (cls[2] || 'unknown'); }
    }
    snap.buckets = Array.from(byName.values()).sort((a, b) => (b.freshKcal - a.freshKcal) || (b.channel < a.channel ? -1 : 1));
  } catch (e) { snap.error = (snap.error ? snap.error + '; ' : '') + 'snapshot: ' + String(e && e.message); }
  return snap;
}

function installStock9762Capture(Game, opts) {
  opts = opts || {};
  const ev = { resolutions: [] };
  const counters = { resolutionSeen: 0 };
  function dayOf() { try { return branchDay(Game); } catch (e) { return 1; } }
  const orig = Game.resolveOneAssignment;
  if (typeof orig !== 'function') throw new Error('stock9762-capture: Game.resolveOneAssignment is not a function');
  if (orig.__stock9762Installed) throw new Error('stock9762-capture: Game.resolveOneAssignment already stock9762-wrapped');
  const wrapped = function (...args) {
    const a = args[1] || {};
    const isGarden = a.task === 'garden';
    let rec = null;
    if (isGarden) {
      const snap = snapshotPantry(Game);
      rec = { day: dayOf(), vid: String(args[0]), throttle: null,
        freshKcal: snap.freshKcal, freshRebuilt: snap.freshRebuilt,
        totalKcal: snap.totalKcal, roster: snap.roster,
        buckets: snap.buckets, error: snap.error };
      try { rec.throttle = !!Game.prodThrottleEngaged(); } catch (e) { rec.error = (rec.error ? rec.error + '; ' : '') + 'throttle: ' + String(e && e.message); }
    }
    const ret = orig.apply(this, args);
    if (rec) { counters.resolutionSeen++; ev.resolutions.push(rec); }
    return ret;
  };
  wrapped.__stock9762Installed = true;
  Game.resolveOneAssignment = wrapped;
  return { events: ev, counters, snapshotPantry: () => snapshotPantry(Game) };
}

module.exports = { installStock9762Capture, snapshotPantry };
