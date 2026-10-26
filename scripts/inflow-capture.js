#!/usr/bin/env node
// inflow-capture.js — pantry-inflow recorder (DIAG only, sim-inflow-b).
//
// Wraps THREE pantry doors AFTER loadGame, before setupGame. Each
// wrapper delegates with identical arguments, `this`, and return
// value, and writes ONLY to the caller's array. No Game.state write,
// no RNG consumption, no say/log write. Snapshot reads (day) are
// try/catch isolated; a throwing day read yields day 1, never a
// game write.
//
// Doors (see havenGrowth.js comment: stockPantry, donateToPantry,
// pantryAdd are the three pantry doors; donateToPantry deposits via
// depositPantryPieces, which is the function actually wrapped):
//  - Game.stockPantry(kcal, name, opts): record {day, door:'stock',
//    name verbatim, kcal: Math.round(kcal||0)} — the engine itself
//    rounds and early-returns on kcal<=0, so the wrapper records
//    the called value and the sweep's attribution counts only
//    kcal>0 records as inflow (a <=0 call stocks nothing).
//  - Game.depositPantryPieces(v, src, pieceKcal): record {day,
//    door:'deposit', name: src.name verbatim,
//    kcal: (src.kcalEach||0)*(src.units||0)}.
//  - Game.pantryAdd(item): record {day, door:'pantryAdd',
//    name: item.name verbatim, kcal, added: <return value>} —
//    only added===true records count as inflow (cap refusal stocks
//    nothing); the wrapper must call the original FIRST and record
//    its return value, so the added flag is honest.
// Direct pantry pushes (starting stock, tribute, raid spoils,
// favor repayments, league draws) bypass all three doors and are
// NOT recorded — a named limitation, not a silent gap.
'use strict';

const { branchDay } = require('./plainvoice-capture');

function installInflowCapture(Game, opts) {
  opts = opts || {};
  const inflowCap = (opts.inflowCap != null) ? opts.inflowCap : 50000;
  const origStock = Game.stockPantry;
  const origDeposit = Game.depositPantryPieces;
  const origPantryAdd = Game.pantryAdd;
  if (typeof origStock !== 'function') throw new Error('inflow-capture: Game.stockPantry is not a function');
  if (typeof origDeposit !== 'function') throw new Error('inflow-capture: Game.depositPantryPieces is not a function');
  if (typeof origPantryAdd !== 'function') throw new Error('inflow-capture: Game.pantryAdd is not a function');
  if (origStock.__inflowInstalled || origDeposit.__inflowInstalled || origPantryAdd.__inflowInstalled) {
    throw new Error('inflow-capture: a pantry door is already inflow-wrapped');
  }
  const inflows = [];
  const counters = { inflowSeen: 0, seq: 0 };
  function dayOf() {
    try { return branchDay(Game); } catch (e) { return 1; }
  }
  function push(rec) {
    counters.inflowSeen++;
    if (inflows.length < inflowCap) inflows.push(rec);
  }
  const wrappedStock = function (kcal, name, o) {
    try {
      push({ seq: ++counters.seq, day: dayOf(), door: 'stock',
        name: (name == null ? null : String(name)),
        kcal: Math.round(kcal || 0) });
    } catch (e) {}
    return origStock.apply(this, arguments);
  };
  const wrappedDeposit = function (v, src, pieceKcal) {
    try {
      const s = src || {};
      push({ seq: ++counters.seq, day: dayOf(), door: 'deposit',
        name: (s.name == null ? null : String(s.name)),
        kcal: Math.round((s.kcalEach || 0) * (s.units || 0)) });
    } catch (e) {}
    return origDeposit.apply(this, arguments);
  };
  const wrappedPantryAdd = function (item) {
    const ret = origPantryAdd.apply(this, arguments);
    try {
      const it = item || {};
      push({ seq: ++counters.seq, day: dayOf(), door: 'pantryAdd',
        name: (it.name == null ? null : String(it.name)),
        kcal: Math.round((it.kcalEach || 0) * (it.units || 0)),
        added: !!ret });
    } catch (e) {}
    return ret;
  };
  wrappedStock.__inflowInstalled = true;
  wrappedDeposit.__inflowInstalled = true;
  wrappedPantryAdd.__inflowInstalled = true;
  Game.stockPantry = wrappedStock;
  Game.depositPantryPieces = wrappedDeposit;
  Game.pantryAdd = wrappedPantryAdd;
  return {
    inflows, counters,
    inflowTruncated: () => counters.inflowSeen > inflowCap,
    uninstall() {
      if (Game.stockPantry === wrappedStock) Game.stockPantry = origStock;
      if (Game.depositPantryPieces === wrappedDeposit) Game.depositPantryPieces = origDeposit;
      if (Game.pantryAdd === wrappedPantryAdd) Game.pantryAdd = origPantryAdd;
    },
  };
}

module.exports = { installInflowCapture };
