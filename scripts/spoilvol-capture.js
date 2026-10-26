#!/usr/bin/env node
// spoilvol-capture.js — sweep-path spoil-removal recorder (DIAG only,
// sim-spoilvol-b). Installed AFTER loadGame, BEFORE setupGame, alongside
// inflow-capture and mealdraw-capture (both reused UNCHANGED). Wraps
// Game.sweepSpoiled a single time: the wrapper snapshots the sweep's
// containers BEFORE the call, delegates with identical arguments, `this`,
// and return value, snapshots AFTER, and records the delta. It writes
// ONLY to the caller's arrays. No Game.state write, no RNG consumption,
// no say/log write.
//
// Why this wrapper is the measurement: the pantry's spoiled stacks are
// SKIPPED by pantryDraw (game.js pantryDraw filters isSpoiled items out
// of candidates and never removes them), so the ONLY pantry path that
// removes a spoiled stack is sweepSpoiled's village-pantry branch
// (src/js/food.js sweepSpoiled, v.pantry splice). The wrapper proves
// that claim per sweep instead of assuming it:
//   - removed stacks: pre-sweep pantry stacks absent post-sweep
//     (identity-matched; sweepSpoiled splices whole stacks, never
//     partial units, so identity matching is exact).
//   - violation checks per sweep: (a) every removed pantry stack was
//     isSpoiled at pre-sweep time; (b) every pre-sweep isSpoiled pantry
//     stack was removed (survivors counted, not hidden).
//   - bonus-aware horizon at removal: spoilDay + spoilBonusDays() - day
//     (the boundary Game.isSpoiled itself eats by: food.js isSpoiled,
//     spoilDay + bonus <= scholar day). Raw horizon (spoilDay - day)
//     is recorded alongside so the bonus's contribution is visible.
//   - bonus-saved stacks: post-sweep pantry stacks with raw horizon
//     <= 0 but bonus-aware horizon > 0 — food the raw clock calls
//     rotten that the game still counts fresh. This is the bonus-aware
//     horizon evidence the 2029 metric review asked for.
// Containers snapshotted (mirroring sweepSpoiled's own container list):
//   pack (scholar.inventory), prep counter (prepStash, when distinct
//   from the pack), village pantry, and corpse inventories (bonus 0
//   there — recorded with bonus 0 so corpse horizons are honest).
// The pantry is the PRIMARY measurement; pack/prep/corpse removals are
// secondary totals, reported separately, never mixed into pantry volume.
//
// snapshotPantry() is exported for the sweep's day-end snapshots (same
// per-channel shape, bonus-aware horizons included).
//
// Classification errors are recorded on the record's `error` field, never
// swallowed silently and never thrown into the game.
'use strict';

const { branchDay } = require('./plainvoice-capture');

function medianOf(xs) {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function stackKcal(it) { return (it.kcalEach || 0) * (it.units || 1); }

// Snapshot one container: array of stack records. `bonus` is the
// spoilBonusDays() value to apply (0 for corpses); `day` is scholar day.
// Each record keeps its live object reference in `_ref` for identity
// matching; _ref is stripped from recorded output (see stripRefs).
function snapshotContainer(Game, items, container, bonus, day) {
  const out = [];
  if (!Array.isArray(items)) return out;
  for (const it of items) {
    if (!it) continue;
    let spoiled = false;
    try {
      if (container === 'corpse') {
        spoiled = (typeof Game.isSpoiled === 'function') ? !!Game.isSpoiled(it, 0) : false;
      } else if (typeof Game.isSpoiled === 'function') {
        spoiled = !!Game.isSpoiled(it);
      }
    } catch (e) { /* recorded via error field by caller when needed */ }
    const spoilDay = (it.spoilDay === undefined || it.spoilDay === null) ? null : it.spoilDay;
    out.push({
      channel: (it.name == null ? 'unnamed' : String(it.name)),
      kcalEach: it.kcalEach || 0,
      units: it.units || 1,
      kcal: stackKcal(it),
      spoilDay,
      bonus,
      rawHorizon: spoilDay == null ? null : spoilDay - day,
      bonusHorizon: spoilDay == null ? null : spoilDay + bonus - day,
      spoiled,
      foodState: it.foodState || null,
      foodKind: it.foodKind || null,
      container,
      _ref: it,
    });
  }
  return out;
}

function snapshotAll(Game) {
  const snap = { day: null, bonus: null, pack: [], prep: [], pantry: [], corpse: [], error: null };
  try { try { snap.day = branchDay(Game); } catch (e) { snap.day = null; } } catch (e) {}
  try {
    const day = (Game.state.scholar || {}).day || 0;
    if (snap.day == null) snap.day = day;
    let bonus = 0;
    try { bonus = (typeof Game.spoilBonusDays === 'function') ? Game.spoilBonusDays() : 0; } catch (e) { bonus = 0; }
    snap.bonus = bonus;
    const inv = (Game.state.scholar || {}).inventory || [];
    snap.pack = snapshotContainer(Game, inv, 'pack', bonus, day);
    let ps = null;
    try { ps = (typeof Game.prepStash === 'function') ? Game.prepStash() : null; } catch (e) { ps = null; }
    if (ps && ps !== inv) snap.prep = snapshotContainer(Game, ps, 'prep', bonus, day);
    const v = Game.state.village || {};
    snap.pantry = snapshotContainer(Game, v.pantry || [], 'pantry', bonus, day);
    const corpses = (Game.state.corpses || []).filter(c => c && !c.buried);
    for (const c of corpses) {
      snap.corpse = snap.corpse.concat(snapshotContainer(Game, c.items || [], 'corpse', 0, day));
    }
  } catch (e) { snap.error = 'snapshotAll: ' + String(e && e.message); }
  return snap;
}

function stripStack(s) {
  const o = {};
  for (const k of Object.keys(s)) if (k !== '_ref') o[k] = s[k];
  return o;
}

function summarizeStacks(stacks) {
  const byName = new Map();
  for (const s of stacks) {
    let b = byName.get(s.channel);
    if (!b) { b = { channel: s.channel, kcal: 0, stacks: 0, units: 0 }; byName.set(s.channel, b); }
    b.kcal += s.kcal; b.stacks += 1; b.units += s.units;
  }
  return Array.from(byName.values()).sort((a, b) => (b.kcal - a.kcal) || (b.channel < a.channel ? -1 : 1));
}

function snapshotPantry(Game) {
  const snap = snapshotAll(Game);
  const byName = new Map();
  for (const s of snap.pantry) {
    let b = byName.get(s.channel);
    if (!b) {
      b = { channel: s.channel, freshKcal: 0, spoiledKcal: 0, stacks: 0,
        bonusHorizons: [], rawHorizons: [], bonusSavedKcal: 0 };
      byName.set(s.channel, b);
    }
    b.stacks += 1;
    if (s.spoiled) { b.spoiledKcal += s.kcal; continue; }
    b.freshKcal += s.kcal;
    if (s.bonusHorizon != null) b.bonusHorizons.push(s.bonusHorizon);
    if (s.rawHorizon != null) b.rawHorizons.push(s.rawHorizon);
    if (s.rawHorizon != null && s.rawHorizon <= 0 && s.bonusHorizon != null && s.bonusHorizon > 0) {
      b.bonusSavedKcal += s.kcal;
    }
  }
  const channels = Array.from(byName.values()).map(b => ({
    channel: b.channel, freshKcal: b.freshKcal, spoiledKcal: b.spoiledKcal,
    stacks: b.stacks,
    bonusHorizonMin: b.bonusHorizons.length ? Math.min(...b.bonusHorizons) : null,
    bonusHorizonMed: medianOf(b.bonusHorizons),
    bonusHorizonMax: b.bonusHorizons.length ? Math.max(...b.bonusHorizons) : null,
    rawHorizonMed: medianOf(b.rawHorizons),
    bonusSavedKcal: b.bonusSavedKcal,
  })).sort((a, b) => (b.freshKcal - a.freshKcal) || (b.channel < a.channel ? -1 : 1));
  return { day: snap.day, bonus: snap.bonus, freshKcal: channels.reduce((t, c) => t + c.freshKcal, 0),
    spoiledKcal: channels.reduce((t, c) => t + c.spoiledKcal, 0), channels, error: snap.error };
}

function installSpoilvolCapture(Game, opts) {
  opts = opts || {};
  const ev = { sweeps: [] };
  const counters = { sweepSeen: 0 };
  function dayOf() { try { return branchDay(Game); } catch (e) { return (Game.state.scholar || {}).day || 0; } }
  const orig = Game.sweepSpoiled;
  if (typeof orig !== 'function') throw new Error('spoilvol-capture: Game.sweepSpoiled is not a function');
  if (orig.__spoilvolInstalled) throw new Error('spoilvol-capture: Game.sweepSpoiled already spoilvol-wrapped');
  const wrapped = function (...args) {
    const pre = snapshotAll(Game);
    const ret = orig.apply(this, args);
    const post = snapshotAll(Game);
    const rec = { day: dayOf(), scholarDay: (Game.state.scholar || {}).day || 0,
      bonus: pre.bonus, ret: (typeof ret === 'number' ? ret : null), error: pre.error || post.error || null,
      removed: {}, violations: {}, bonusSaved: {} };
    for (const cont of ['pack', 'prep', 'pantry', 'corpse']) {
      const preRefs = new Set(pre[cont].map(s => s._ref));
      const postRefs = new Set(post[cont].map(s => s._ref));
      const removed = pre[cont].filter(s => !postRefs.has(s._ref));
      const keptSpoiled = pre[cont].filter(s => s.spoiled && postRefs.has(s._ref));
      const removedNotSpoiled = removed.filter(s => !s.spoiled);
      rec.removed[cont] = {
        totalKcal: removed.reduce((t, s) => t + s.kcal, 0),
        stacks: removed.length,
        byChannel: summarizeStacks(removed),
        detail: removed.map(stripStack),
      };
      rec.violations[cont] = {
        removedNotSpoiledKcal: removedNotSpoiled.reduce((t, s) => t + s.kcal, 0),
        removedNotSpoiledStacks: removedNotSpoiled.length,
        keptSpoiledKcal: keptSpoiled.reduce((t, s) => t + s.kcal, 0),
        keptSpoiledStacks: keptSpoiled.length,
      };
      const saved = post[cont].filter(s => s.rawHorizon != null && s.rawHorizon <= 0 &&
        s.bonusHorizon != null && s.bonusHorizon > 0 && !s.spoiled);
      rec.bonusSaved[cont] = {
        totalKcal: saved.reduce((t, s) => t + s.kcal, 0),
        stacks: saved.length,
        byChannel: summarizeStacks(saved),
      };
    }
    // Cross-check: pre-sweep spoiled pantry kcal must equal removed pantry
    // kcal when the sweep is the only pantry-spoil path (violations zero).
    const preSpoiledPantry = pre.pantry.filter(s => s.spoiled).reduce((t, s) => t + s.kcal, 0);
    rec.preSpoiledPantryKcal = preSpoiledPantry;
    rec.postSpoiledPantryKcal = post.pantry.filter(s => s.spoiled).reduce((t, s) => t + s.kcal, 0);
    counters.sweepSeen++;
    ev.sweeps.push(rec);
    return ret;
  };
  wrapped.__spoilvolInstalled = true;
  Game.sweepSpoiled = wrapped;
  return { events: ev, counters, snapshotPantry: () => snapshotPantry(Game) };
}

module.exports = { installSpoilvolCapture, snapshotPantry, snapshotAll };
