#!/usr/bin/env node
// freshdays-capture.js — pantryFreshDays decomposition recorder (DIAG only).
//
// sim-freshdays-b, 2026-10-26, oversight-flesh-out-loop-b run
// fleshout-loop-b-20261026T1730Z, axis food-economy. Zero game-code change:
// wraps Game.say AFTER loadGame (install after substrate-capture so the
// chain is say -> substrate -> freshdays -> original; each wrapper calls
// the previous one with identical arguments, `this`, and return value).
// Say-only: NO engine function is wrapped. Every snapshot query is
// try/catch isolated and read-only; the recorder writes ONLY to the
// caller's arrays.
//
// What it records:
//  - policyDaily snapshots: one per policy.daily call (the sweep's wrapped
//    policy calls snapshotDay() after delegating to competent.daily).
//  - cook snapshots: one per cook-frame say line (same COOK_FRAME_RE as
//    substrate-capture), so a preservesched first-bound-line freshDays
//    value can be decomposed at the exact line that quoted it.
// Each snapshot decomposes the live pantry with the SAME rules as
// Game.pantryFreshKcal() (game.js): skip foodState 'preserved' /
// 'rendered' / foodKind 'pemmican', skip isSpoiled items, sum
// (kcalEach || 0) * (units || 1) over the rest — then splits the counted
// sum into cross-cutting buckets (by foodState, by spoil class, by
// edible flag, monster-meat vs plant vs other, zero-unit stacks) and
// records the denominator (burnHistory positive-mean, roster size) so
// reported freshDays can be rebuilt as freshKcal / burnMean and compared
// against roster x 2000. Full per-item detail is stored ONLY for
// snapshots with reported freshDays >= 50 (the high-value days this arm
// must explain); all other snapshots carry bucket sums + top-10 items.
'use strict';

const { COOK_FRAME_RE, WORKED_RE, RACKS_FULL_RE, branchDay } = require('./plainvoice-capture');

const HIGH_DAY = 50;

function decompose(Game) {
  const v = ((Game.state || {}).village) || {};
  const scholar = (Game.state || {}).scholar || {};
  const day = scholar.day || 0;
  let bonus = 0;
  try { bonus = (typeof Game.spoilBonusDays === 'function') ? (Game.spoilBonusDays() || 0) : 0; } catch (e) { bonus = 0; }
  const spoiled = (it) => {
    try {
      if (typeof Game.isSpoiled === 'function') return !!Game.isSpoiled(it);
    } catch (e) {}
    return it && it.spoilDay !== undefined && it.spoilDay !== null && it.spoilDay <= day;
  };
  const pantry = v.pantry || [];
  const byState = {};
  const bySpoil = { noSpoilDay: 0, immortal: 0, dated: 0 };
  const byKind = { meat: 0, plant: 0, fat: 0, other: 0 };
  let edibleFalse = 0, edibleTrue = 0, edibleUnset = 0;
  let monsterMeat = 0, zeroUnit = 0;
  let countedSum = 0, countedN = 0;
  const excluded = { preserved: 0, rendered: 0, pemmicanKind: 0, spoiled: 0 };
  const excludedN = { preserved: 0, rendered: 0, pemmicanKind: 0, spoiled: 0 };
  let totalKcal = 0;
  const scored = [];
  for (const it of pantry) {
    if (!it) continue;
    const kcal = (it.kcalEach || 0) * (it.units || 1);
    totalKcal += kcal;
    // Mirror pantryFreshKcal() exclusion order exactly.
    if (it.foodState === 'preserved') { excluded.preserved += kcal; excludedN.preserved++; continue; }
    if (it.foodState === 'rendered') { excluded.rendered += kcal; excludedN.rendered++; continue; }
    if ((it.foodKind || '') === 'pemmican') { excluded.pemmicanKind += kcal; excludedN.pemmicanKind++; continue; }
    if (spoiled(it)) { excluded.spoiled += kcal; excludedN.spoiled++; continue; }
    countedSum += kcal; countedN++;
    const st = it.foodState || 'missing';
    byState[st] = (byState[st] || 0) + kcal;
    if (it.spoilDay === undefined || it.spoilDay === null) bySpoil.noSpoilDay += kcal;
    else if (it.spoilDay >= 9999) bySpoil.immortal += kcal;
    else bySpoil.dated += kcal;
    const kind = it.foodKind || 'missing';
    if (kind === 'meat') byKind.meat += kcal;
    else if (kind === 'plant') byKind.plant += kcal;
    else if (kind === 'fat') byKind.fat += kcal;
    else byKind.other += kcal;
    if (it.edible === false) edibleFalse += kcal;
    else if (it.edible === true) edibleTrue += kcal;
    else edibleUnset += kcal;
    if (kind === 'meat') monsterMeat += kcal;
    if (!it.units || it.units <= 0) zeroUnit += kcal;
    scored.push({ name: String(it.name || it.plantId || it.itemId || kind), state: st, kind,
      kcal, units: it.units || 0, kcalEach: it.kcalEach || 0,
      spoilDay: (it.spoilDay === undefined ? null : it.spoilDay),
      edible: (it.edible === undefined ? null : !!it.edible) });
  }
  scored.sort((a, b) => b.kcal - a.kcal);
  let freshKcalReported = null, freshDaysReported = null;
  try { freshKcalReported = (typeof Game.pantryFreshKcal === 'function') ? Game.pantryFreshKcal() : null; } catch (e) {}
  try { freshDaysReported = (typeof Game.pantryFreshDays === 'function') ? Game.pantryFreshDays() : null; } catch (e) {}
  const hist = Array.isArray(v.burnHistory) ? v.burnHistory.slice() : [];
  const pos = hist.filter((x) => x > 0);
  const burnMean = pos.length ? pos.reduce((a, b) => a + b, 0) / pos.length : null;
  const roster = (v.roster || []).length;
  const snap = {
    day, freshKcalReported, freshDaysReported,
    countedSum, countedN, totalKcal,
    diff: (freshKcalReported == null ? null : countedSum - freshKcalReported),
    coverage: (freshKcalReported ? countedSum / freshKcalReported : null),
    burnHistory: hist, burnMean, burnN: pos.length, roster,
    fallbackDays: roster ? countedSum / (roster * 2000) : null,
    rebuiltDays: (burnMean ? countedSum / burnMean : null),
    byState, bySpoil, byKind,
    edibleFalse, edibleTrue, edibleUnset,
    monsterMeat, zeroUnit,
    excluded, excludedN,
    top: scored.slice(0, 10),
  };
  if (freshDaysReported != null && freshDaysReported >= HIGH_DAY) snap.items = scored;
  return snap;
}

function installFreshdaysCapture(Game, opts) {
  opts = opts || {};
  const cookCap = (opts.cookCap != null) ? opts.cookCap : 2000;
  const orig = Game.say;
  if (typeof orig !== 'function') throw new Error('freshdays-capture: Game.say is not a function');
  const daily = [];
  const cook = [];
  const counters = { cookSeen: 0 };
  const ordinal = new Map();
  const wrapped = function () {
    let text = '';
    try { text = Array.prototype.slice.call(arguments).map(String).join(' '); } catch (e) { text = ''; }
    try {
      const day = branchDay(Game);
      const cm = text && COOK_FRAME_RE.exec(text);
      if (cm) counters.cookSeen++;
      if (cm && cook.length < cookCap) {
        const cookName = cm[1];
        const key = cookName + '|' + day;
        const resIndex = (ordinal.get(key) || 0) + 1;
        ordinal.set(key, resIndex);
        let frame = 'plain';
        if (WORKED_RE.test(text)) frame = 'worked';
        else if (RACKS_FULL_RE.test(text)) frame = 'racksFull';
        const snap = decompose(Game);
        snap.label = 'cook';
        snap.cook = cookName; snap.frame = frame; snap.resIndex = resIndex;
        snap.text = text.slice(0, 240);
        cook.push(snap);
      }
    } catch (e) {}
    return orig.apply(this, arguments);
  };
  Game.say = wrapped;
  return {
    daily, cook, counters,
    cookTruncated: () => counters.cookSeen > cookCap,
    snapshotDay(label) {
      try {
        const snap = decompose(Game);
        snap.label = label || 'policyDaily';
        daily.push(snap);
        return snap;
      } catch (e) { return null; }
    },
    decompose,
    uninstall() { if (Game.say === wrapped) Game.say = orig; },
  };
}

module.exports = { installFreshdaysCapture, decompose, HIGH_DAY };
