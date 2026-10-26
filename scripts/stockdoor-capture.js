#!/usr/bin/env node
// stockdoor-capture.js — fourth-door pantry recorder (DIAG only).
//
// sim-stockdoor-b, 2026-10-26, oversight-flesh-out-loop-b.
// The 1730Z resid arm (sim-preservesched-resid-b) established that
// the seed 9750 day-83 eligible pile is a meal-surplus stack written
// by the nightly meal's stockSurplus path on day 82 — a pantry write
// that bypasses all three doors of scripts/inflow-capture.js
// (stockPantry, depositPantryPieces, pantryAdd). This module records
// that fourth door so the residual pair can be judged from inflow
// records alone, without dayPantry snapshot archaeology.
//
// Wraps Game.stockSurplus(v, give) AFTER loadGame, before
// setupGame, exactly like the inflow doors: the wrapper calls the
// original with identical arguments, `this`, and return value, and
// writes ONLY to the caller's array. No Game.state write, no RNG
// consumption, no say/log write. Snapshot reads (day, v.day) are
// try/catch isolated; a throwing read yields day 1 / vDay null,
// never a game write.
//
// Record: {seq, day, vDay, door: 'stockSurplus',
//   name: 'Foraged food', give: Math.round(give||0),
//   kcal: <original's return: kcal actually stored>,
//   spoilDay: (vDay != null ? vDay + 3 : day + 3)}.
// The spoilDay is the freshDay stockSurplus itself stamps
// (game.js: freshDay = v.day + 3) — NO granary bonus: stockSurplus
// pushes stacks without granaryDays, which is exactly why the
// day-82 meal-surplus stack reads spoilDay 85 with no granaryDays
// on day 83. The wrapper records the stamped clock, it does not
// re-derive it from the pantry (a pantry scan would merge with
// same-clock stock and could not attribute units to this call).
// Calls that store nothing (give <= 0, cap refusal, sub-unit
// remainder carry) record kcal 0 and do NOT count as inflow —
// the analyzer counts only kcal > 0 records, matching the
// counted-inflow rule of analyze-preservesched-b.js.
'use strict';

const { branchDay } = require('./plainvoice-capture');

function installStockdoorCapture(Game, opts) {
  opts = opts || {};
  const stockdoorCap = (opts.stockdoorCap != null) ? opts.stockdoorCap : 50000;
  const orig = Game.stockSurplus;
  if (typeof orig !== 'function') throw new Error('stockdoor-capture: Game.stockSurplus is not a function');
  if (orig.__stockdoorInstalled) throw new Error('stockdoor-capture: Game.stockSurplus is already stockdoor-wrapped');
  const stockdoorRecords = [];
  const counters = { stockdoorSeen: 0, seq: 0 };
  function dayOf() {
    try { return branchDay(Game); } catch (e) { return 1; }
  }
  const wrapped = function (v, give) {
    const ret = orig.apply(this, arguments);
    try {
      counters.stockdoorSeen++;
      let vDay = null;
      try { vDay = (v && v.day != null) ? v.day : null; } catch (e) { vDay = null; }
      const day = dayOf();
      const spoilDay = (vDay != null) ? vDay + 3 : day + 3;
      if (stockdoorRecords.length < stockdoorCap) {
        stockdoorRecords.push({
          seq: ++counters.seq, day, vDay, door: 'stockSurplus',
          name: 'Foraged food',
          give: Math.round(give || 0),
          kcal: Math.round(ret || 0),
          spoilDay,
        });
      }
    } catch (e) {}
    return ret;
  };
  wrapped.__stockdoorInstalled = true;
  Game.stockSurplus = wrapped;
  return {
    stockdoorRecords, counters,
    stockdoorTruncated: () => counters.stockdoorSeen > stockdoorCap,
    uninstall() {
      if (Game.stockSurplus === wrapped) Game.stockSurplus = orig;
    },
  };
}

module.exports = { installStockdoorCapture };
