#!/usr/bin/env node
// smoke-eq-capture.js — morning-smoke recorder (DIAG only).
//
// sim-smoke-eq-b, 2026-10-26, oversight-flesh-out-loop-b.
// The 2029 arm (sim-mealdraw-reprereg-b) proved the two-term
// window equation omits the morning smoke: window 28's gap is
// exactly 1400 kcal, and day 29's worked cook line gains exactly
// 1737 dried kcal incl. 7x160 = 1120 = 1400 x 0.80 rough yield.
// The morning cook smokes the surplus BEFORE the first-cook
// snapshot (the resid capture snapshots the pantry inside the
// say wrapper, after game code has converted and said the
// line). This module evidences that smoke directly, per cook
// duty, so the three-term equation (writes - draws - smoke)
// can be judged from records alone.
//
// Wraps, AFTER loadGame and AFTER the substrate/inflow/resid/
// stockdoor/mealdraw captures, exactly like those recorders:
// each wrapper calls the original with identical arguments,
// `this`, and return value, and writes ONLY to the caller's
// array. No Game.state write, no RNG consumption, no say/log
// write (the say wrapper only COUNTS cook-frame lines and
// remembers their texts; it never writes a line). Snapshot
// reads are try/catch isolated.
//
// Mechanism (game.js resolveOneAssignment, cook branch): the
// cook duty converts fresh pantry surplus about to spoil into
// preserved stock (reserve ~2 nights of pantry draw kept
// fresh, soonest-spoiling first, budget ~4000 kcal, rough
// 0.80x / specialist 0.95+0.02*skill), THEN says the cook
// line. So a cook duty's village-pantry changes are its smoke
// conversions only (the branch credits haven gives, not the
// pantry). Wrapping the duty with before/after pantry
// aggregates gives the exact fresh kcal smoked per class,
// including partial-stack splits (aggregate units catch both
// the in-place convert and the split-push cases).
//
// Window rule: a cook duty belongs to the pre-first-line set
// of day D+1 iff its cookLinesSeenBefore == 0 for that day.
// That covers the duty that says the first line itself (its
// conversion precedes its line) and any duty that smokes
// without saying a line (the counter stays 0 until the first
// line, so such smoke is still counted, correctly).
//
// Records (one array, per cook duty):
//  - {seq, day, dayAfter, vid, task, cookSeenBefore,
//    cookSeenAfter, lines: [{frame, text, keptKcal}],
//    deltas: [{name, kcalEach, spoilDay, granaryDays,
//    foodState, beforeUnits, afterUnits, deltaUnits,
//    beforeKcal, afterKcal, deltaKcal}],
//    freshKcalLost, preservedKcalGained, keptKcalTotal,
//    hasSmoke}
'use strict';

const { COOK_FRAME_RE, WORKED_RE, RACKS_FULL_RE, branchDay } = require('./plainvoice-capture');

function classKey(it) {
  return [
    (it.name == null ? null : String(it.name)),
    (it.kcalEach || 0),
    (it.spoilDay == null ? null : it.spoilDay),
    (it.granaryDays == null ? null : it.granaryDays),
    (it.foodState == null ? null : String(it.foodState)),
  ].join('|');
}

function snapshotPantry(Game) {
  const map = new Map();
  try {
    const pantry = ((Game.state || {}).village || {}).pantry || [];
    for (const it of pantry) {
      if (!it) continue;
      const k = classKey(it);
      const e = map.get(k) || {
        name: (it.name == null ? null : String(it.name)),
        kcalEach: (it.kcalEach || 0),
        spoilDay: (it.spoilDay == null ? null : it.spoilDay),
        granaryDays: (it.granaryDays == null ? null : it.granaryDays),
        foodState: (it.foodState == null ? null : String(it.foodState)),
        units: 0, kcal: 0,
      };
      e.units += (it.units || 0);
      e.kcal += (it.kcalEach || 0) * (it.units || 0);
      map.set(k, e);
    }
  } catch (e) {}
  return map;
}

function installSmokeEqCapture(Game, opts) {
  opts = opts || {};
  const cap = (opts.smokeEqCap != null) ? opts.smokeEqCap : 50000;
  const origDuty = Game.resolveOneAssignment;
  const origSay = Game.say;
  if (typeof origDuty !== 'function') throw new Error('smoke-eq-capture: Game.resolveOneAssignment is not a function');
  if (typeof origSay !== 'function') throw new Error('smoke-eq-capture: Game.say is not a function');
  if (origDuty.__smokeeqInstalled || origSay.__smokeeqInstalled) {
    throw new Error('smoke-eq-capture: resolveOneAssignment or say is already smoke-eq-wrapped');
  }
  const records = [];
  const counters = { smokeEqSeen: 0, seq: 0 };
  const cookSeen = new Map();
  const cookLines = [];
  function dayOf() {
    try { return branchDay(Game); } catch (e) { return 1; }
  }
  function cookSeenToday(day) {
    return cookSeen.get(day) || 0;
  }
  function push(rec) {
    counters.smokeEqSeen++;
    if (records.length < cap) records.push(rec);
  }

  const wrappedSay = function () {
    try {
      let text = '';
      try { text = Array.prototype.slice.call(arguments).map(String).join(' '); }
      catch (e) { text = ''; }
      if (text && COOK_FRAME_RE.exec(text)) {
        const day = dayOf();
        cookSeen.set(day, (cookSeen.get(day) || 0) + 1);
        let frame = 'plain';
        if (WORKED_RE.test(text)) frame = 'worked';
        else if (RACKS_FULL_RE.test(text)) frame = 'racksFull';
        let keptKcal = null;
        if (frame === 'worked') {
          const m = /\(\s*~?\s*([\d,]+)\s*kcal/.exec(text);
          if (m) keptKcal = parseInt(m[1].replace(/,/g, ''), 10);
        }
        cookLines.push({ day, frame, text: text.slice(0, 240), keptKcal });
      }
    } catch (e) {}
    return origSay.apply(this, arguments);
  };

  const wrappedDuty = function (vid, a) {
    const task = a ? a.task : null;
    if (task !== 'cook') return origDuty.apply(this, arguments);
    const day = dayOf();
    const beforeCook = cookSeenToday(day);
    const sayBefore = cookLines.length;
    let before = null;
    try { before = snapshotPantry(Game); } catch (e) { before = new Map(); }
    let ret = null, err = null;
    try {
      ret = origDuty.apply(this, arguments);
    } catch (e) { err = e; }
    let after = new Map();
    try { after = snapshotPantry(Game); } catch (e) { after = new Map(); }
    let dayAfter = day;
    try { dayAfter = dayOf(); } catch (e) {}
    const afterCook = cookSeenToday(day);
    try {
      const lines = cookLines.slice(sayBefore);
      const deltas = [];
      const keys = new Set([...before.keys(), ...after.keys()]);
      for (const k of keys) {
        const b = before.get(k) || null;
        const a2 = after.get(k) || null;
        const bUnits = b ? b.units : 0, aUnits = a2 ? a2.units : 0;
        const bKcal = b ? b.kcal : 0, aKcal = a2 ? a2.kcal : 0;
        if (aUnits === bUnits && aKcal === bKcal) continue;
        const tpl = b || a2;
        deltas.push({
          name: tpl.name, kcalEach: tpl.kcalEach, spoilDay: tpl.spoilDay,
          granaryDays: tpl.granaryDays, foodState: tpl.foodState,
          beforeUnits: bUnits, afterUnits: aUnits, deltaUnits: aUnits - bUnits,
          beforeKcal: bKcal, afterKcal: aKcal, deltaKcal: aKcal - bKcal,
        });
      }
      let freshKcalLost = 0, preservedKcalGained = 0;
      for (const d of deltas) {
        if (d.deltaKcal < 0) freshKcalLost += -d.deltaKcal;
        if (d.deltaKcal > 0 && d.foodState === 'preserved') preservedKcalGained += d.deltaKcal;
      }
      let keptKcalTotal = 0;
      for (const l of lines) if (l.keptKcal != null) keptKcalTotal += l.keptKcal;
      push({
        seq: ++counters.seq, day, dayAfter,
        vid: (vid == null ? null : String(vid)), task,
        cookSeenBefore: beforeCook, cookSeenAfter: afterCook,
        lines: lines.map(l => ({ frame: l.frame, text: l.text, keptKcal: l.keptKcal })),
        deltas, freshKcalLost, preservedKcalGained, keptKcalTotal,
        hasSmoke: deltas.length > 0,
      });
    } catch (e) {}
    if (err) throw err;
    return ret;
  };
  wrappedDuty.__smokeeqInstalled = true;
  wrappedSay.__smokeeqInstalled = true;
  Game.resolveOneAssignment = wrappedDuty;
  Game.say = wrappedSay;
  return {
    smokeEqRecords: records, counters,
    smokeEqTruncated: () => counters.smokeEqSeen > cap,
    uninstall() {
      if (Game.resolveOneAssignment === wrappedDuty) Game.resolveOneAssignment = origDuty;
      if (Game.say === wrappedSay) Game.say = origSay;
    },
  };
}

module.exports = { installSmokeEqCapture };
