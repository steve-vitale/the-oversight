#!/usr/bin/env node
// mealdraw-capture.js — meal-draw recorder (DIAG only).
//
// sim-mealdraw-b, 2026-10-26, oversight-flesh-out-loop-b.
// The stockdoor arm (sim-stockdoor-b) proved the night meal eats
// from its own stockSurplus write (night 82: 2,800 kcal written,
// 2,000 surviving) but could only locate the 800-kcal gap by
// window inference — it recorded no draw. This module records
// the draws so gross write vs surviving pile reconcile from
// records alone.
//
// Wraps, AFTER loadGame and AFTER the substrate/inflow/resid/
// stockdoor captures, exactly like those recorders: each wrapper
// calls the original with identical arguments, `this`, and
// return value, and writes ONLY to the caller's array. No
// Game.state write, no RNG consumption, no say/log write
// (the say wrapper only COUNTS cook-frame lines; it never
// writes a line). Snapshot reads are try/catch isolated.
//
// Context: Game.villagerMealDay is wrapped to push a per-call
// context (vid, home/away from v.away[vid] at entry) for the
// call's duration; Game.villageMeal is wrapped the same way
// with context 'player'. A pantryDraw/drawSpoiled call inside
// a meal context is tagged with that context; any other call
// is tagged 'other'. Meal contexts nest safely via a stack
// (villagerMealDay never nests in practice, but the stack
// makes that an observation, not an assumption).
//
// Window stamps: the say wrapper counts cook-frame lines per
// scholar day with the SAME regex as the resid capture, and
// every draw record carries cookLinesSeenToday at draw time.
// A draw belongs to window W (first-cook day D to first-cook
// day D+1) iff (day == D and cookLinesSeenToday >= 1) or
// (day == D+1 and cookLinesSeenToday == 0).
//
// Records (one array, kind-tagged):
//  - pantryDraw: {kind, seq, mealSeq, day, vDay, context, vid,
//    want, taken, shortOfFresh, cookLinesSeenToday, items:
//    [{name, kcalEach, units, effectiveKcal, cooked, spoilDay,
//    granaryDays, foodState, foodKind}]} — item fields are
//    snapshotted at return time from the returned draw list
//    (the live item's units are already decremented; the drawn
//    units come from the returned list, never re-read).
//  - drawSpoiled: {kind, seq, mealSeq, day, vDay, context, vid,
//    want, got, cookLinesSeenToday, items} — items from a
//    before/after aggregate diff of pantry stacks (key
//    name|kcalEach|spoilDay|granaryDays|foodState), so spoiled
//    draws are itemized; got must equal the diff sum.
//  - mealCall: {kind, seq, day, vDay, context, vid, freshTaken,
//    spoiledGot, ret: {ate, gave, drawn, fasting} or null} —
//    the cross-check anchor: for villager-home calls,
//    freshTaken + spoiledGot must equal ret.drawn.
'use strict';

const { branchDay, COOK_FRAME_RE } = require('./plainvoice-capture');

function aggKey(it) {
  return [
    (it.name == null ? null : String(it.name)),
    (it.kcalEach || 0),
    (it.spoilDay == null ? null : it.spoilDay),
    (it.granaryDays == null ? null : it.granaryDays),
    (it.foodState == null ? null : String(it.foodState)),
  ].join('|');
}

function snapshotPantry(v) {
  const map = new Map();
  try {
    const pantry = (v && v.pantry) || [];
    for (const it of pantry) {
      if (!it) continue;
      const k = aggKey(it);
      const e = map.get(k) || {
        name: (it.name == null ? null : String(it.name)),
        kcalEach: (it.kcalEach || 0), spoilDay: (it.spoilDay == null ? null : it.spoilDay),
        granaryDays: (it.granaryDays == null ? null : it.granaryDays),
        foodState: (it.foodState == null ? null : String(it.foodState)),
        units: 0,
      };
      e.units += (it.units || 0);
      map.set(k, e);
    }
  } catch (e) {}
  return map;
}

function installMealDrawCapture(Game, opts) {
  opts = opts || {};
  const cap = (opts.mealdrawCap != null) ? opts.mealdrawCap : 50000;
  const origMealDay = Game.villagerMealDay;
  const origVillageMeal = Game.villageMeal;
  const origDraw = Game.pantryDraw;
  const origSpoiled = Game.drawSpoiled;
  const origSay = Game.say;
  if (typeof origDraw !== 'function') throw new Error('mealdraw-capture: Game.pantryDraw is not a function');
  if (typeof origSpoiled !== 'function') throw new Error('mealdraw-capture: Game.drawSpoiled is not a function');
  if (typeof origMealDay !== 'function') throw new Error('mealdraw-capture: Game.villagerMealDay is not a function');
  if (typeof origVillageMeal !== 'function') throw new Error('mealdraw-capture: Game.villageMeal is not a function');
  if (typeof origSay !== 'function') throw new Error('mealdraw-capture: Game.say is not a function');
  if (origDraw.__mealdrawInstalled || origSpoiled.__mealdrawInstalled ||
      origMealDay.__mealdrawInstalled || origVillageMeal.__mealdrawInstalled ||
      origSay.__mealdrawInstalled) {
    throw new Error('mealdraw-capture: a meal function is already mealdraw-wrapped');
  }
  const records = [];
  const counters = { mealdrawSeen: 0, seq: 0 };
  const stack = [];
  const cookSeen = new Map();
  function dayOf() {
    try { return branchDay(Game); } catch (e) { return 1; }
  }
  function cookSeenToday(day) {
    return cookSeen.get(day) || 0;
  }
  function push(rec) {
    counters.mealdrawSeen++;
    if (records.length < cap) records.push(rec);
  }
  function ctxOf() {
    return stack.length ? stack[stack.length - 1] : null;
  }
  function snapItem(d) {
    const it = d.item || {};
    let name = null, kcalEach = 0, spoilDay = null, granaryDays = null, foodState = null, foodKind = null;
    try { name = (it.name == null ? null : String(it.name)); } catch (e) {}
    try { kcalEach = (it.kcalEach || 0); } catch (e) {}
    try { spoilDay = (it.spoilDay == null ? null : it.spoilDay); } catch (e) {}
    try { granaryDays = (it.granaryDays == null ? null : it.granaryDays); } catch (e) {}
    try { foodState = (it.foodState == null ? null : String(it.foodState)); } catch (e) {}
    try { foodKind = (it.foodKind == null ? null : String(it.foodKind)); } catch (e) {}
    return {
      name, kcalEach, units: (d.units || 0),
      effectiveKcal: (d.effectiveKcal || 0), cooked: !!d.cooked,
      spoilDay, granaryDays, foodState, foodKind,
    };
  }

  const wrappedDraw = function (v, want, o) {
    const ret = origDraw.apply(this, arguments);
    try {
      const ctx = ctxOf();
      const day = dayOf();
      let vDay = null;
      try { vDay = (v && v.day != null) ? v.day : null; } catch (e) {}
      const items = [];
      try {
        for (const d of (ret.items || [])) items.push(snapItem(d));
      } catch (e) {}
      push({
        kind: 'pantryDraw', seq: ++counters.seq,
        mealSeq: ctx ? ctx.mealSeq : null, day, vDay,
        context: ctx ? ctx.context : 'other', vid: ctx ? ctx.vid : null,
        want: Math.round(want || 0), taken: Math.round(ret.taken || 0),
        shortOfFresh: !!ret.shortOfFresh, cookLinesSeenToday: cookSeenToday(day),
        items,
      });
      if (ctx) ctx.fresh += Math.round(ret.taken || 0);
    } catch (e) {}
    return ret;
  };
  const wrappedSpoiled = function (v, want, exposure) {
    let before = null;
    try { before = snapshotPantry(v); } catch (e) { before = new Map(); }
    const ret = origSpoiled.apply(this, arguments);
    try {
      const ctx = ctxOf();
      const day = dayOf();
      let vDay = null;
      try { vDay = (v && v.day != null) ? v.day : null; } catch (e) {}
      const after = snapshotPantry(v);
      const items = [];
      let diffSum = 0;
      for (const [k, b] of before) {
        const a = after.get(k);
        const delta = b.units - (a ? a.units : 0);
        if (delta > 0) {
          items.push({
            name: b.name, kcalEach: b.kcalEach, units: delta,
            effectiveKcal: b.kcalEach, cooked: false,
            spoilDay: b.spoilDay, granaryDays: b.granaryDays,
            foodState: b.foodState, foodKind: null,
          });
          diffSum += delta * (b.kcalEach || 0);
        }
      }
      push({
        kind: 'drawSpoiled', seq: ++counters.seq,
        mealSeq: ctx ? ctx.mealSeq : null, day, vDay,
        context: ctx ? ctx.context : 'other', vid: ctx ? ctx.vid : null,
        want: Math.round(want || 0), got: Math.round(ret || 0),
        diffSum: Math.round(diffSum),
        cookLinesSeenToday: cookSeenToday(day), items,
      });
      if (ctx) ctx.spoiled += Math.round(ret || 0);
    } catch (e) {}
    return ret;
  };
  const wrappedMealDay = function (vid, person, v, ctxArg) {
    const mealSeq = ++counters.seq;
    let away = false;
    try { away = !!((v && v.away) && v.away[vid]); } catch (e) {}
    const ctx = {
      mealSeq, context: away ? 'villager-away' : 'villager-home',
      vid: (vid == null ? null : String(vid)), fresh: 0, spoiled: 0,
    };
    stack.push(ctx);
    let ret;
    try {
      ret = origMealDay.apply(this, arguments);
    } finally {
      if (stack.length && stack[stack.length - 1] === ctx) stack.pop();
      else { const ix = stack.indexOf(ctx); if (ix >= 0) stack.splice(ix, 1); }
    }
    try {
      const day = dayOf();
      let vDay = null;
      try { vDay = (v && v.day != null) ? v.day : null; } catch (e) {}
      push({
        kind: 'mealCall', seq: mealSeq, day, vDay,
        context: ctx.context, vid: ctx.vid,
        freshTaken: ctx.fresh, spoiledGot: ctx.spoiled,
        ret: ret ? {
          ate: (ret.ate == null ? null : Math.round(ret.ate)),
          gave: (ret.gave == null ? null : Math.round(ret.gave)),
          drawn: (ret.drawn == null ? null : Math.round(ret.drawn)),
          fasting: !!ret.fasting,
        } : null,
        cookLinesSeenToday: cookSeenToday(day),
      });
    } catch (e) {}
    return ret;
  };
  const wrappedVillageMeal = function () {
    const mealSeq = ++counters.seq;
    const ctx = { mealSeq, context: 'player', vid: null, fresh: 0, spoiled: 0 };
    stack.push(ctx);
    let ret;
    try {
      ret = origVillageMeal.apply(this, arguments);
    } finally {
      if (stack.length && stack[stack.length - 1] === ctx) stack.pop();
      else { const ix = stack.indexOf(ctx); if (ix >= 0) stack.splice(ix, 1); }
    }
    try {
      const day = dayOf();
      push({
        kind: 'mealCall', seq: mealSeq, day, vDay: null,
        context: 'player', vid: null,
        freshTaken: ctx.fresh, spoiledGot: ctx.spoiled, ret: null,
        cookLinesSeenToday: cookSeenToday(day),
      });
    } catch (e) {}
    return ret;
  };
  const wrappedSay = function () {
    try {
      let text = '';
      try { text = Array.prototype.slice.call(arguments).map(String).join(' '); }
      catch (e) { text = ''; }
      if (text && COOK_FRAME_RE.exec(text)) {
        const day = dayOf();
        cookSeen.set(day, (cookSeen.get(day) || 0) + 1);
      }
    } catch (e) {}
    return origSay.apply(this, arguments);
  };
  wrappedDraw.__mealdrawInstalled = true;
  wrappedSpoiled.__mealdrawInstalled = true;
  wrappedMealDay.__mealdrawInstalled = true;
  wrappedVillageMeal.__mealdrawInstalled = true;
  wrappedSay.__mealdrawInstalled = true;
  Game.pantryDraw = wrappedDraw;
  Game.drawSpoiled = wrappedSpoiled;
  Game.villagerMealDay = wrappedMealDay;
  Game.villageMeal = wrappedVillageMeal;
  Game.say = wrappedSay;
  return {
    mealDrawRecords: records, counters,
    mealdrawTruncated: () => counters.mealdrawSeen > cap,
    uninstall() {
      if (Game.pantryDraw === wrappedDraw) Game.pantryDraw = origDraw;
      if (Game.drawSpoiled === wrappedSpoiled) Game.drawSpoiled = origSpoiled;
      if (Game.villagerMealDay === wrappedMealDay) Game.villagerMealDay = origMealDay;
      if (Game.villageMeal === wrappedVillageMeal) Game.villageMeal = origVillageMeal;
      if (Game.say === wrappedSay) Game.say = origSay;
    },
  };
}

module.exports = { installMealDrawCapture };
