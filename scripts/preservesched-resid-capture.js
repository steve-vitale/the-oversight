#!/usr/bin/env node
// preservesched-resid-capture.js — residual-pair instrument (DIAG only).
//
// sim-preservesched-resid-b, 2026-10-26, oversight-flesh-out-loop-b.
// Extends the preservesched instrument with the two fields the
// 1630Z corpus lacked: (1) the per-stack spoilDays of the eligible
// pile at each cook line, and (2) the haven tier (granary tier).
//
// Installed AFTER substrate-capture: this wraps Game.say a second
// time (outer wrapper). Both wrappers see the same say lines in the
// same order, so the per-cook-per-day resIndex computed here matches
// substrate-capture's exactly, and resid lines join to cook lines on
// (cook, day, resIndex). Delegates with identical arguments, `this`,
// and return value. Writes ONLY to the caller's array; every snapshot
// query is try/catch isolated and read-only. No Game.state write, no
// RNG consumption, no say/log write.
//
// Eligibility rules mirror plainvoice-capture.recomputeContext
// exactly (same predicates, same order): skip bonded, preserved /
// rendered, pemmican, keepsakes; skip spoilDay undefined/null/>=9999;
// skip spoiled (Game.isSpoiled(it, 0)); keep only spoilDay - day <= 2.
// The recompute's eligibleKcal is ALSO recorded (via recomputeContext)
// so the analyzer can cross-check this module's per-stack sum against
// the independent recompute on every line — a mismatch flags an
// eligibility-rule drift, never a silent divergence.
'use strict';

const { COOK_FRAME_RE, WORKED_RE, RACKS_FULL_RE, branchDay, recomputeContext } = require('./plainvoice-capture');

function eligibleStacks(Game, day) {
  const stacks = [];
  try {
    const pantry = ((Game.state || {}).village || {}).pantry || [];
    for (const it of pantry) {
      if (!it || (it.kcalEach || 0) <= 0 || (it.units || 0) <= 0) continue;
      if (it.bonded) continue;
      if (it.foodState === 'preserved' || it.foodState === 'rendered') continue;
      if ((it.foodKind || '') === 'pemmican') continue;
      try { if (Game.isKeepsake && Game.isKeepsake(it)) continue; } catch (e) {}
      const sd = it.spoilDay;
      if (sd === undefined || sd === null || sd >= 9999) continue;
      let spoiled = false;
      try { spoiled = Game.isSpoiled ? !!Game.isSpoiled(it, 0) : (sd <= day); }
      catch (e) { spoiled = (sd <= day); }
      if (spoiled) continue;
      if (sd - day > 2) continue;
      stacks.push({
        name: (it.name == null ? null : String(it.name)),
        kcalEach: it.kcalEach || 0, units: it.units || 0,
        kcal: (it.kcalEach || 0) * (it.units || 1),
        spoilDay: sd,
        foodState: (it.foodState == null ? null : String(it.foodState)),
        foodKind: (it.foodKind == null ? null : String(it.foodKind)),
        granaryDays: (it.granaryDays == null ? null : it.granaryDays),
      });
    }
  } catch (e) {}
  return stacks;
}

function installResidCapture(Game, opts) {
  opts = opts || {};
  const cap = (opts.cap != null) ? opts.cap : 4000;
  const orig = Game.say;
  if (typeof orig !== 'function') throw new Error('preservesched-resid-capture: Game.say is not a function');
  if (orig.__residInstalled) throw new Error('preservesched-resid-capture: Game.say is already resid-wrapped');
  const residLines = [];
  const dayPantry = [];
  const dayPantrySeen = new Set();
  const counters = { residSeen: 0 };
  const ordinal = new Map();
  const wrapped = function () {
    let text = '';
    try { text = Array.prototype.slice.call(arguments).map(String).join(' '); }
    catch (e) { text = ''; }
    try {
      const cm = text && COOK_FRAME_RE.exec(text);
      if (cm) {
        counters.residSeen++;
        if (residLines.length < cap) {
          const cook = cm[1];
          const day = branchDay(Game);
          const key = cook + '|' + day;
          const resIndex = (ordinal.get(key) || 0) + 1;
          ordinal.set(key, resIndex);
          let frame = 'plain';
          if (WORKED_RE.test(text)) frame = 'worked';
          else if (RACKS_FULL_RE.test(text)) frame = 'racksFull';
          let havenTier = null, granaryBonus = null;
          try { havenTier = (typeof Game.havenTier === 'function') ? Game.havenTier() : null; }
          catch (e) { havenTier = null; }
          try { granaryBonus = (typeof Game.granarySpoilBonus === 'function') ? Game.granarySpoilBonus() : null; }
          catch (e) { granaryBonus = null; }
          const stacks = eligibleStacks(Game, day);
          let stacksKcal = 0;
          for (const s of stacks) stacksKcal += s.kcal;
          let ctx = null;
          try { ctx = recomputeContext(Game, cook); } catch (e) { ctx = null; }
          let pantryStacks = null;
          try { pantryStacks = (((Game.state || {}).village || {}).pantry || []).length; }
          catch (e) { pantryStacks = null; }
          // Day pantry: full stack list at the FIRST cook line of each
          // day only (stack-lifecycle tracing: which stacks persist,
          // get eaten, or get re-stamped across days). Bounded: one
          // snapshot per day, pantry is tens of stacks.
          if (!dayPantrySeen.has(day)) {
            dayPantrySeen.add(day);
            try {
              const pantry = (((Game.state || {}).village || {}).pantry || []);
              const stacks = [];
              for (const it of pantry) {
                if (!it) continue;
                stacks.push({
                  name: (it.name == null ? null : String(it.name)),
                  kcalEach: it.kcalEach || 0, units: it.units || 0,
                  kcal: (it.kcalEach || 0) * (it.units || 1),
                  spoilDay: (it.spoilDay == null ? null : it.spoilDay),
                  foodState: (it.foodState == null ? null : String(it.foodState)),
                  foodKind: (it.foodKind == null ? null : String(it.foodKind)),
                  granaryDays: (it.granaryDays == null ? null : it.granaryDays),
                });
              }
              dayPantry.push({ day, havenTier, granaryBonus, stacks });
            } catch (e) {}
          }
          residLines.push({
            day, cook, frame, resIndex, text: text.slice(0, 240),
            havenTier, granaryBonus, pantryStacks,
            eligibleStacks: stacks, eligibleStacksKcal: stacksKcal,
            ctxEligibleKcal: ctx ? (ctx.eligibleKcal != null ? ctx.eligibleKcal : null) : null,
            ctxOk: !!(ctx && ctx.ok),
            ctxKcalMatch: (ctx && ctx.ok && ctx.eligibleKcal != null) ? (ctx.eligibleKcal === stacksKcal) : null,
          });
        }
      }
    } catch (e) {}
    return orig.apply(this, arguments);
  };
  wrapped.__residInstalled = true;
  Game.say = wrapped;
  return {
    residLines, counters, dayPantry,
    residTruncated: () => counters.residSeen > cap,
    uninstall() { if (Game.say === wrapped) Game.say = orig; },
  };
}

module.exports = { installResidCapture, eligibleStacks };
