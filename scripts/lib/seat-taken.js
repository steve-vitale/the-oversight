// seat-taken.js — the aligned-seat rule (sim-sitmetric-b, 2026-11-08).
//
// The sitstep instrument's `finalSeat` is the seat the table PRICES at
// end of run (Game.tableSeat()), whether or not any seat was taken —
// seed 53004 priced "lesser" with takeseatStats.seatTaken 0, and every
// analyzer that counted `finalSeat !== 'none'` as a sit re-tripped the
// same misread. A priced seat is not a taken seat.
//
// alignedSeat(row) returns the seat actually TAKEN ('full' | 'lesser' |
// 'none'). seatTakenOf(row) returns true / false / null (null = the row
// carries no taken/not-taken signal at all, so the priced reading stands
// as-is and the caller must say so — never invent a verdict).
//
// Signals, strongest first:
//   1. row.seatTaken (boolean, written by the fixed instrument finalize)
//      — the recorder's own verdict.
//   2. row.takeseatStats.seatTaken > 0 — the sit drive's counted sits
//      (the same counter the fightloop evidence reads as "sits").
//   3. a row.sitAttempts entry with ok true — the instrument's recorded
//      tableTakeSeat verb call (tableTakeSeat returns ok only when
//      progState().tableDone is set, src/js/table.js tableTakeSeat).
//   4. a row.daily entry with tableDone true — the engine's own sat
//      flag, ever set (covers sits via any path, including the dawn
//      tableScene, and survives the win-day-floor deferral clearing
//      tableDone at end of run).
// A sit recorded by ANY signal counts. A row whose present signals all
// say "no" is not-taken. Pure functions over JSON rows; no game code.
'use strict';

function pricedSeatOf(row) {
  if (!row || typeof row !== 'object') return null;
  const f = row.finalSeat;
  if (typeof f === 'string') return f || null;
  if (f && typeof f === 'object') {
    return (typeof f.seat === 'string' && f.seat) ? f.seat : null;
  }
  return null;
}

function seatTakenOf(row) {
  if (!row || typeof row !== 'object') return null;
  if (typeof row.seatTaken === 'boolean') return row.seatTaken;
  let signal = false;
  const ts = row.takeseatStats;
  if (ts && typeof ts === 'object') {
    signal = true;
    if ((ts.seatTaken | 0) > 0) return true;
  }
  if (Array.isArray(row.sitAttempts)) {
    signal = true;
    if (row.sitAttempts.some(function (a) { return a && a.ok; })) return true;
  }
  if (Array.isArray(row.daily)) {
    signal = true;
    if (row.daily.some(function (d) { return d && d.tableDone; })) return true;
  }
  return signal ? false : null;
}

function alignedSeat(row) {
  const priced = pricedSeatOf(row);
  const taken = seatTakenOf(row);
  if (taken === true) return priced;
  if (taken === false) return 'none';
  return priced;
}

module.exports = { pricedSeatOf: pricedSeatOf, seatTakenOf: seatTakenOf, alignedSeat: alignedSeat };
