#!/usr/bin/env node
// scripts/belonghunger-instrument.js — pantry-attribution instrumentation for
// the belong-road hunger diagnostic (fleshout loop B, 2026-10-19,
// arm sim-belonghunger-b).
//
// BEHAVIOR-NEUTRAL by construction: every wrapper only observes (pantry
// deltas, engine return values, say-text) and draws no RNG. All wrappers
// restore via finally. The det-gate (scripts/det-gate-belonghunger-b.js)
// proves bit-identity, and the pilot cross-validates against the
// fragilityfeast control corpus (identical seeds must reproduce days /
// endReason / hungryDays / death causes exactly).
//
// Channels:
//   OUT: tribute (payTribute return), tend (tendLink return),
//        feast (hostFeast pantry delta), raid (raidPillage return),
//        mealsV (villageEats pantry delta, grossed past granary+surplus),
//        mealP (villageMeal pantry delta), takeP (takeFromPantry pantry delta),
//        rot (sweepSpoiled pantry delta)
//   IN:  in (item-scan, name-tagged: 'surplus' = villager-meal surplus via
//        stockSurplus skip-credits; else item names), in-granary
//        (drawLeaguePool return; the scan skips 'League granary draw' items)
// Per-day ledger: W.days[day] = { day, start, ch:{}, hungry, granaryFed,
// freshDays, sayWin } — hungry counts v.hungryDays increments observed in
// villageEats; sayWin is the captured say-text window around the event.
'use strict';

function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 0), 0);
  } catch (e) { return 0; }
}
function gday(Game) {
  try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; }
}
function freshDays(Game) {
  try { return (typeof Game.pantryFreshDays === 'function') ? +Game.pantryFreshDays().toFixed(1) : null; }
  catch (e) { return null; }
}

function dayRec(W, Game) {
  const d = gday(Game);
  if (!W.days[d]) W.days[d] = { day: d, start: null, ch: {}, hungry: 0, granaryFed: 0, freshDays: null, sayWin: null };
  return W.days[d];
}
function addCh(W, Game, ch, kcal, tag) {
  if (!(kcal > 0)) return;
  const r = dayRec(W, Game);
  r.ch[ch] = (r.ch[ch] || 0) + Math.round(kcal);
  if (tag) {
    r.tags = r.tags || {};
    r.tags[ch] = r.tags[ch] || [];
    if (r.tags[ch].length < 12) r.tags[ch].push(tag);
  }
}

// Wrap a Game method, recording (before - after) pantry delta as `ch`
// (positive delta = outflow). Returns a restore function.
function wrapDelta(Game, W, name, ch) {
  const o = Game[name];
  if (typeof o !== 'function') { W.missing = W.missing || []; W.missing.push(name); return function () {}; }
  Game[name] = function () {
    const b = pantryKcal(Game);
    let r;
    try { r = o.apply(this, arguments); }
    finally {
      const a = pantryKcal(Game);
      addCh(W, Game, ch, b - a);
    }
    return r;
  };
  return function () { Game[name] = o; };
}

// Wrap a Game method, recording its numeric return value as `ch`.
function wrapReturn(Game, W, name, ch, tagFn) {
  const o = Game[name];
  if (typeof o !== 'function') { W.missing = W.missing || []; W.missing.push(name); return function () {}; }
  Game[name] = function () {
    const r = o.apply(this, arguments);
    try {
      if (typeof r === 'number' && r > 0) addCh(W, Game, ch, r, tagFn ? tagFn(arguments, r) : null);
    } catch (e) {}
    return r;
  };
  return function () { Game[name] = o; };
}

function instrument(Game) {
  const W = {
    days: {}, missing: [],
    hungryEvents: [],   // {day, hungryDays}
    sayBuf: [],         // rolling {day, text} ring (cap 600)
    tributeWeeks: [],   // {day, kcal} from payTribute
    tendWeeks: [],      // {day, kcal} from tendLink
    feasts: [],         // {day, kcal}
    raids: [],          // {day, kcal}
  };
  const restores = [];
  const R = (fn) => restores.push(fn);

  // --- outflows ---
  R(wrapReturn(Game, W, 'payTribute', 'tribute', (args, r) => {
    W.tributeWeeks.push({ day: gday(Game), kcal: Math.round(r) });
    return null;
  }));
  // _removePantryKcal catch-all: direct callers (aid, demands, sorties,
  // extortion, betrayal, membership) bypass the named verbs. Stack-tagged by
  // caller; SKIPPED when reached via payTribute/tendLink (already attributed
  // as tribute/tend — no double count). Rare calls; stack cost negligible.
  const oRem = Game._removePantryKcal;
  if (typeof oRem === 'function') {
    Game._removePantryKcal = function () {
      const r = oRem.apply(this, arguments);
      try {
        if (typeof r === 'number' && r > 0) {
          const stack = new Error().stack || '';
          if (!/payTribute|tendLink/.test(stack)) {
            let caller = 'unknown';
            const frames = stack.match(/at [A-Za-z0-9_$.<>]+/g) || [];
            for (const f of frames) {
              const nm = f.replace(/^at /, '').split('.').pop();
              if (/^(Object|Error|Game|_removePantryKcal)$/.test(nm)) continue;
              caller = nm.replace(/[^A-Za-z0-9_]/g, '').slice(0, 32) || 'unknown';
              break;
            }
            addCh(W, Game, 'out-' + caller, r);
          }
        }
      } catch (e) {}
      return r;
    };
    R(() => { Game._removePantryKcal = oRem; });
  } else { W.missing.push('_removePantryKcal'); }
  R(wrapReturn(Game, W, 'tendLink', 'tend', (args, r) => {
    W.tendWeeks.push({ day: gday(Game), kcal: Math.round(r) });
    return null;
  }));
  // feast: hostFeast's only pantry mutation is its pantryDraw.
  const oFeast = Game.hostFeast;
  if (typeof oFeast === 'function') {
    Game.hostFeast = function () {
      const b = pantryKcal(Game);
      let r;
      try { r = oFeast.apply(this, arguments); }
      finally {
        const cost = b - pantryKcal(Game);
        if (cost > 0) { addCh(W, Game, 'feast', cost); W.feasts.push({ day: gday(Game), kcal: Math.round(cost) }); }
      }
      return r;
    };
    R(() => { Game.hostFeast = oFeast; });
  } else { W.missing.push('hostFeast'); }
  R(wrapReturn(Game, W, 'raidPillage', 'raid', (args, r) => {
    W.raids.push({ day: gday(Game), kcal: Math.round(r) });
    return null;
  }));
  // villageEats: GROSS daily consumption + hungry-day detection + granary flag.
  // (The league-granary famine draw and the villager-meal surplus deposit both
  // fire inside villageEats; they are recorded separately as in-granary and
  // in/surplus, so mealsV is grossed back up to keep the channel signs
  // consistent: delta = in - out.)
  const oEats = Game.villageEats;
  if (typeof oEats === 'function') {
    Game.villageEats = function () {
      const v = (this.state || {}).village || {};
      const hBefore = v.hungryDays || 0;
      const b = pantryKcal(Game);
      const g0 = (dayRec(W, Game).ch['in-granary'] || 0);
      const s0 = W.surplusTotal || 0;
      let r;
      try { r = oEats.apply(this, arguments); }
      finally {
        const a = pantryKcal(Game);
        const g1 = (dayRec(W, Game).ch['in-granary'] || 0);
        const s1 = W.surplusTotal || 0;
        addCh(W, Game, 'mealsV', (b - a) + (g1 - g0) + (s1 - s0));
        try {
          const vv = (Game.state || {}).village || {};
          const hAfter = vv.hungryDays || 0;
          if (hAfter > hBefore) {
            const d = gday(Game);
            const rec = dayRec(W, Game);
            rec.hungry += (hAfter - hBefore);
            rec.sayWin = W.sayBuf.slice(-40).map(e => `[d${e.day}] ${e.text}`);
            try { rec.freshDays = freshDays(Game); } catch (e) {}
            W.hungryEvents.push({ day: d, hungryDays: hAfter });
          }
          if (vv._granaryFedDay === gday(Game)) {
            dayRec(W, Game).granaryFed = 1;
          }
        } catch (e) {}
      }
      return r;
    };
    R(() => { Game.villageEats = oEats; });
  } else { W.missing.push('villageEats'); }
  R(wrapDelta(Game, W, 'villageMeal', 'mealP'));
  R(wrapDelta(Game, W, 'takeFromPantry', 'takeP'));
  R(wrapDelta(Game, W, 'sweepSpoiled', 'rot'));

  // --- inflows: ITEM-LEVEL SCAN (not arg wrappers) ---
  // Direct pantry pushes (tribute grain, tariffs, spoils, favors, villager
  // haul deposits via depositPantryPieces, stockPantry merges) bypass
  // stockPantry's arg — and stockPantry MERGES into existing stacks, so an
  // arg-wrapper would double-count against any item scan. The scan is the
  // SOLE inflow measurer: new item identities + units/kcalEach growth on
  // known identities, tagged by item name. 'League granary draw' is excluded
  // (kept as the wrapped in-granary channel so mealsV's net stays consistent).
  R(wrapReturn(Game, W, 'drawLeaguePool', 'in-granary'));
  // stockSurplus: the villager-meal surplus deposit (game.js). Return-based
  // ('in' tagged 'surplus') — it MERGES into existing stacks, so the item
  // scan would double-count the growth. The wrapper records per-item skip
  // credits the scan consumes.
  W._skipGrowth = new Map(); // item -> units of growth the scan must ignore
  const oSS = Game.stockSurplus;
  if (typeof oSS === 'function') {
    Game.stockSurplus = function (v, give) {
      const vv = v || ((this.state || {}).village || {});
      const beforeU = new Map((vv.pantry || []).map(it => [it, (it && it.units) || 0]));
      let r = 0;
      try { r = oSS.apply(this, arguments); }
      finally {
        try {
          for (const it of (vv.pantry || [])) {
            if (!it) continue;
            const g = (it.units || 0) - (beforeU.get(it) || 0);
            if (g > 0) W._skipGrowth.set(it, (W._skipGrowth.get(it) || 0) + g);
          }
          if (typeof r === 'number' && r > 0) {
            addCh(W, Game, 'in', r, 'surplus');
            W.surplusTotal = (W.surplusTotal || 0) + r;
          }
        } catch (e) {}
      }
      return r;
    };
    R(() => { Game.stockSurplus = oSS; });
  } else { W.missing.push('stockSurplus'); }
  W._seen = new Map(); // item -> {u, ke}
  W.scanInflows = function (silent) {
    try {
      const pantry = ((Game.state || {}).village || {}).pantry || [];
      const seen = W._seen;
      for (const it of pantry) {
        if (!it) continue;
        const nm = String(it.name || '?');
        const u = it.units || 0, ke = it.kcalEach || 0;
        const prev = seen.get(it);
        // skip credits: growth already counted by the stockSurplus wrapper
        const skip0 = W._skipGrowth.get(it) || 0;
        if (nm === 'League granary draw') { seen.set(it, { u, ke }); continue; }
        if (!silent) {
          if (!prev) {
            const countable = Math.max(0, u - Math.min(skip0, u));
            if (countable > 0 && ke > 0) addCh(W, Game, 'in', countable * ke, nm.slice(0, 44));
            if (skip0 > 0) W._skipGrowth.set(it, Math.max(0, skip0 - u));
          } else {
            const g = u - prev.u;
            const countable = Math.max(0, g - Math.min(skip0, Math.max(0, g)));
            if (skip0 > 0) W._skipGrowth.set(it, Math.max(0, skip0 - Math.max(0, g)));
            if (countable > 0 && ke > 0) addCh(W, Game, 'in', countable * ke, nm.slice(0, 44));
            else if (ke > prev.ke && u > 0) addCh(W, Game, 'in', (ke - prev.ke) * u, nm.slice(0, 44) + '~ke');
          }
        }
        seen.set(it, { u, ke });
      }
      if (seen.size > 8000) {
        const alive = new Set(pantry);
        for (const k of seen.keys()) if (!alive.has(k)) seen.delete(k);
      }
    } catch (e) {}
  };
  // SILENT SEED: the starting pantry is not an inflow — populate _seen now
  // (instrument() is called after setupGame, before runDays).
  try { W.scanInflows(true); } catch (e) {}

  // --- say buffer (sense-testing; rolling ring, no behavior change) ---
  const oSay = Game.say;
  if (typeof oSay === 'function') {
    Game.say = function (text) {
      try {
        W.sayBuf.push({ day: gday(Game), text: String(text).slice(0, 300) });
        if (W.sayBuf.length > 600) W.sayBuf.splice(0, W.sayBuf.length - 600);
      } catch (e) {}
      return oSay.apply(this, arguments);
    };
    R(() => { Game.say = oSay; });
  }

  W.restore = () => { for (const fn of restores) { try { fn(); } catch (e) {} } };
  return W;
}

// Mark the day boundary from the policy.daily wrapper: records the day's
// opening pantry + fresh-days, and runs the inflow item scan (items deposited
// since the last scan are attributed by name). Call at policy.daily ENTRY.
function markDayStart(W, Game) {
  try {
    const r = dayRec(W, Game);
    if (r.start === null) r.start = Math.round(pantryKcal(Game));
    if (r.freshDays === null) r.freshDays = freshDays(Game);
    if (typeof W.scanInflows === 'function') W.scanInflows();
  } catch (e) {}
}

module.exports = { instrument, markDayStart, pantryKcal, gday, freshDays };
