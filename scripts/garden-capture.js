#!/usr/bin/env node
// garden-capture.js — garden plot-state + duty-event recorder (DIAG only,
// sim-gardenstate-b). Installed AFTER loadGame, BEFORE setupGame, alongside
// scripts/inflow-capture.js (installed first; this file wraps the
// inflow-wrapped pantry doors a second time and records ONLY the
// gardenShares flag — it never re-installs the inflow capture).
//
// Every wrapper delegates with identical arguments, `this`, and return
// value, and writes ONLY to the caller's arrays. No Game.state write, no
// RNG consumption, no say/log write. Snapshot reads are try/catch
// isolated; a throwing read yields a flagged partial snapshot, never a
// game write. prodThrottleEngaged() is a documented pure read
// (game.js:15655) and is recorded on garden resolutions only.
//
// Events recorded:
//   assigns:      assignTask calls with task === 'garden'
//   keeperTurns:  gardenKeeperTurn calls (standing caretaker's daily turn)
//   resolutions:  resolveOneAssignment entries with task === 'garden',
//                 each with the pure-read throttle flag at entry
//   makes:        makePlot calls (bed creation)
//   sows:         sowPlot calls (player sows)
//   npcSows:      villagerSowPlot calls (NPC duty sows; result string kept)
//   keeperSets:   setGardenKeeper calls
//   gardenInflows: pantry-door calls carrying gardenShares, or the named
//                 'Garden harvest' stock call (any door, any name)
//   sayLines:     Game.say lines mentioning the garden (marker lines),
//                 capped — the sense-transcript source
// snapshotGarden(Game, day): end-of-day plot state — per-plot pid / dead /
// ripe / growthLeft / plantedDay / lastHarvest, plus keeper identity,
// garden assignments on the books, and counts.
'use strict';

const { branchDay } = require('./plainvoice-capture');

function installGardenCapture(Game, opts) {
  opts = opts || {};
  const sayCap = opts.sayCap != null ? opts.sayCap : 300;
  const ev = {
    assigns: [], keeperTurns: [], resolutions: [],
    makes: [], sows: [], npcSows: [], keeperSets: [],
    gardenInflows: [], sayLines: [],
  };
  const counters = { assignSeen: 0, keeperTurnSeen: 0, resolutionSeen: 0 };
  function dayOf() { try { return branchDay(Game); } catch (e) { return 1; } }
  function wrap(name, fn) {
    const orig = Game[name];
    if (typeof orig !== 'function') throw new Error('garden-capture: Game.' + name + ' is not a function');
    if (orig.__gardenInstalled) throw new Error('garden-capture: Game.' + name + ' already garden-wrapped');
    const w = function (...args) { return fn.call(this, orig, args); };
    w.__gardenInstalled = true;
    Game[name] = w;
  }

  wrap('assignTask', function (orig, args) {
    const ret = orig.apply(this, args);
    try {
      const [vid, task] = args;
      if (task === 'garden') {
        counters.assignSeen++;
        ev.assigns.push({ day: dayOf(), vid: String(vid), ok: !!(ret && ret.ok) });
      }
    } catch (e) {}
    return ret;
  });

  wrap('gardenKeeperTurn', function (orig, args) {
    let keeperBefore = null;
    try { keeperBefore = (Game.state.village || {}).gardenKeeper || null; } catch (e) {}
    const ret = orig.apply(this, args);
    try {
      // Only a turn WITH a keeper counts as a garden-duty signal: the
      // no-keeper early return is not duty, and logging it would poison
      // the pre-registered (e) class (no duty ever) on day 1.
      if (keeperBefore) {
        counters.keeperTurnSeen++;
        ev.keeperTurns.push({ day: dayOf(), keeper: String(keeperBefore) });
      }
    } catch (e) {}
    return ret;
  });

  wrap('resolveOneAssignment', function (orig, args) {
    const a = args[1] || {};
    const isGarden = a.task === 'garden';
    let throttle = null;
    if (isGarden) {
      try { throttle = !!Game.prodThrottleEngaged(); } catch (e) { throttle = null; }
    }
    const ret = orig.apply(this, args);
    try {
      if (isGarden) {
        counters.resolutionSeen++;
        ev.resolutions.push({ day: dayOf(), vid: String(args[0]), throttle });
      }
    } catch (e) {}
    return ret;
  });

  wrap('makePlot', function (orig, args) {
    let before = null;
    try { before = Game.gardenPlots().length; } catch (e) {}
    const ret = orig.apply(this, args);
    try {
      let after = null;
      try { after = Game.gardenPlots().length; } catch (e) {}
      ev.makes.push({ day: dayOf(), before, after, ok: after != null && before != null && after > before });
    } catch (e) {}
    return ret;
  });

  wrap('sowPlot', function (orig, args) {
    const ret = orig.apply(this, args);
    try { ev.sows.push({ day: dayOf(), pid: args[0] ? String(args[0]) : null, ok: ret !== false && ret != null }); } catch (e) {}
    return ret;
  });

  wrap('villagerSowPlot', function (orig, args) {
    const ret = orig.apply(this, args);
    try { ev.npcSows.push({ day: dayOf(), vid: String(args[0]), msg: typeof ret === 'string' ? ret.slice(0, 200) : null }); } catch (e) {}
    return ret;
  });

  wrap('setGardenKeeper', function (orig, args) {
    const ret = orig.apply(this, args);
    try { ev.keeperSets.push({ day: dayOf(), vid: args[0] ? String(args[0]) : null, ok: !!ret }); } catch (e) {}
    return ret;
  });

  // Pantry doors: record ONLY garden-origin calls (gardenShares present,
  // or the named 'Garden harvest' stock call). Delegates to the
  // inflow-wrapped door, so the inflow instrument still sees everything.
  wrap('stockPantry', function (orig, args) {
    const ret = orig.apply(this, args);
    try {
      const [kcal, name, o] = args;
      const gs = !!(o && o.gardenShares);
      if (gs || name === 'Garden harvest') {
        ev.gardenInflows.push({ day: dayOf(), door: 'stock', name: name == null ? null : String(name),
          kcal: Math.round(kcal || 0), gardenShares: gs });
      }
    } catch (e) {}
    return ret;
  });

  wrap('depositPantryPieces', function (orig, args) {
    const ret = orig.apply(this, args);
    try {
      const src = args[1] || {};
      if (src.gardenShares) {
        ev.gardenInflows.push({ day: dayOf(), door: 'deposit', name: src.name == null ? null : String(src.name),
          kcal: Math.round((src.kcalEach || 0) * (src.units || 0)), gardenShares: true });
      }
    } catch (e) {}
    return ret;
  });

  wrap('pantryAdd', function (orig, args) {
    const ret = orig.apply(this, args);
    try {
      const it = args[0] || {};
      if (it.gardenShares) {
        ev.gardenInflows.push({ day: dayOf(), door: 'pantryAdd', name: it.name == null ? null : String(it.name),
          kcal: Math.round((it.kcalEach || 0) * (it.units || 0)), gardenShares: true, added: !!ret });
      }
    } catch (e) {}
    return ret;
  });

  wrap('say', function (orig, args) {
    const ret = orig.apply(this, args);
    try {
      const line = args[0];
      if (typeof line === 'string' && ev.sayLines.length < sayCap &&
          (line.includes('\u{1F331}') || /\bgarden\b/i.test(line) || /\bbeds\b/i.test(line))) {
        ev.sayLines.push({ day: dayOf(), line: line.slice(0, 300) });
      }
    } catch (e) {}
    return ret;
  });

  function snapshotGarden(day) {
    const snap = { day, plots: [], keeper: null, keeperDay: null, gardenAssigned: [],
      beds: 0, planted: 0, ripe: 0, ripeSafe: 0, ripeUnsafe: 0, unplanted: 0, dead: 0, error: null };
    try {
      const v = Game.state.village || {};
      snap.keeper = v.gardenKeeper || null;
      snap.keeperDay = (v.gardenKeeperDay == null) ? null : v.gardenKeeperDay;
      try {
        snap.gardenAssigned = Object.entries(v.assignments || {})
          .filter(([, a]) => a && a.task === 'garden').map(([id]) => id);
      } catch (e) {}
      const plots = Game.gardenPlots();
      snap.beds = plots.length;
      for (const p of plots) {
        let ripe = false, growthLeft = null, edibility = null;
        try { ripe = !!Game.plotRipe(p, day); } catch (e) {}
        try { growthLeft = Game.gardenGrowthLeft(p, day); } catch (e) {}
        try {
          const plant = (Game.data.plants || []).find(x => x.id === p.pid);
          edibility = plant ? (plant.edibility || null) : null;
        } catch (e) {}
        snap.plots.push({ pid: p.pid || null, dead: !!p.dead, ripe, growthLeft,
          edibility, plantedDay: p.plantedDay || 0, lastHarvest: p.lastHarvest || 0,
          lastTend: p.lastTend || 0, weeds: p.weeds || 0 });
        if (p.dead) snap.dead++;
        else if (!p.pid) snap.unplanted++;
        else {
          snap.planted++;
          if (ripe) {
            snap.ripe++;
            if (edibility === 'safe') snap.ripeSafe++; else snap.ripeUnsafe++;
          }
        }
      }
    } catch (e) { snap.error = String(e.message).slice(0, 200); }
    return snap;
  }

  return { events: ev, counters, snapshotGarden };
}

module.exports = { installGardenCapture };
