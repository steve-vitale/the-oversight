#!/usr/bin/env node
// scripts/capdraw-lib-20261015.js — cap-draw waste instrument (loop B ARM 1,
// 2026-10-15, sim-findings #313/#315).
//
// Instruments the bug's own footprint: per scholar evening meal, records the
// GROSS pantry draw (taken), the room in the bank (room), the banked amount,
// and the cap-destroyed excess = max(0, taken - room). On pristine code the
// excess vanishes silently (no beat names it); on fixed code it is returned
// to the pantry as leftovers and named by a beat.
//
// Wraps Game.pantryDraw (reentrancy-flagged during villageMeal, so the gross
// draw is observable on BOTH code states — v.lastPlayerMeal is gross on
// pristine, net on fixed) + Game.villageMeal (beat capture). Pure
// observation — the det-gate asserts it does not perturb trajectories.
'use strict';

function installCapDraw(Game) {
  const track = {
    meals: [], // one per villageMeal call
    _inMeal: false,
    _lastTaken: 0,
    oPantryDraw: Game.pantryDraw,
    oVillageMeal: Game.villageMeal,
  };
  Game.pantryDraw = function (v, want, opts) {
    const out = track.oPantryDraw.apply(this, arguments);
    if (track._inMeal) track._lastTaken = out.taken || 0;
    return out;
  };
  Game.villageMeal = function () {
    const s = this.state.scholar || {}, v = this.state.village || {};
    const day = s.day || 0;
    const k0 = s.kcal || 0;
    let cap = 2400;
    try { cap = this.kcalCap(); } catch (e) {}
    const room = Math.max(0, cap - k0);
    let trust = 10;
    try { trust = (v.trust && v.trust[s.villagerId] !== undefined) ? v.trust[s.villagerId] : 10; } catch (e) {}
    const beats = [];
    const oSay = this.say;
    this.say = function (t) { try { beats.push(String(t)); } catch (e) {} return oSay.apply(this, arguments); };
    track._inMeal = true; track._lastTaken = 0;
    let out;
    try { out = track.oVillageMeal.apply(this, arguments); }
    finally { track._inMeal = false; this.say = oSay; }
    const taken = track._lastTaken; track._lastTaken = 0;
    const text = beats.join('\n');
    // joined-village branch: abstract pantry, beat carries the meal amount
    const joined = /Village meal at /.test(text);
    let joinedMeal = 0, joinedWaste = 0;
    if (joined) {
      const mm = text.match(/Village meal at [^:]*: \+([\d,]+) kcal/);
      if (mm) joinedMeal = Number(mm[1].replace(/,/g, '')) || 0;
      joinedWaste = Math.max(0, joinedMeal - room);
    }
    const banked = Math.min(taken, room);
    const excess = Math.max(0, taken - banked);
    const voiced = /leftovers|went back in the bins/i.test(text);
    track.meals.push({
      day, trust, cap, room, kcalBefore: Math.round(k0),
      taken: Math.round(taken), banked: Math.round(banked), excess: Math.round(excess),
      joined, joinedMeal: Math.round(joinedMeal), joinedWaste: Math.round(joinedWaste),
      voiced, beats: text.slice(0, 1200),
    });
    return out;
  };
  track.uninstall = function () {
    try { if (Game.pantryDraw !== track.oPantryDraw) Game.pantryDraw = track.oPantryDraw; } catch (e) {}
    try { if (Game.villageMeal !== track.oVillageMeal) Game.villageMeal = track.oVillageMeal; } catch (e) {}
  };
  return track;
}

function summarizeCapDraw(track) {
  const meals = track.meals || [];
  let excessTotal = 0, silentKcal = 0, voicedKcal = 0, excessEvents = 0;
  let joinedWasteTotal = 0;
  for (const m of meals) {
    excessTotal += m.excess || 0;
    joinedWasteTotal += m.joinedWaste || 0;
    if ((m.excess || 0) > 0) {
      excessEvents++;
      if (m.voiced) voicedKcal += m.excess;
      else silentKcal += m.excess;
    }
  }
  return {
    mealCount: meals.length,
    excessEvents,
    excessTotal: Math.round(excessTotal),
    silentKcal: Math.round(silentKcal),
    voicedKcal: Math.round(voicedKcal),
    joinedWasteTotal: Math.round(joinedWasteTotal),
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { installCapDraw, summarizeCapDraw };
}
