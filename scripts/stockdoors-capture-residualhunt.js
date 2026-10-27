#!/usr/bin/env node
// stockdoors-capture-residualhunt.js — VENDORED COPY (read-only) of
// sim-stockdoors-b:scripts/stockdoors-capture.js (branch sim-stockdoors-b,
// tip b55b484ec), for sim-residualhunt-b. Body byte-identical to the
// branch version except this header. DO NOT edit the body: the later
// stockdoors landing owns that file. The stockdoors branch is untouched.
//
// The driedpath arm (evidence/2026-10-26/sim-driedpath-b.md) proved the
// (dried) transformation path is fully captured (893 events, 0 unlinked)
// but family ledgers still fail because TWO more pantry doors are
// unrecorded:
//   (a) stockSurplus (game.js ~28794) pushing villager shared surplus
//       directly into the pantry as 'Foraged food' 200-kcal units — the
//       fourth inflow door;
//   (b) direct pantry consumption bypassing pantryDraw: NPC pantry
//       eating (inline unit decrements in npcTakeAction / npcChildAction,
//       game.js ~20561 / ~20721), alien pantry raids (apPlaygroundRaid,
//       alienPlayers.js ~2448), and Light Fingers lifts (thief.steal_pantry,
//       abilityActions.js ~1654).
//
// This module builds BOTH recorders. The stockSurplus half REUSES
// scripts/stockdoor-capture.js UNCHANGED (the sim-stockdoor-b recorder:
// wraps Game.stockSurplus, records give/stored/spoilDay per call). The
// direct-consumption half is new here and wraps, AFTER loadGame and
// BEFORE setupGame, exactly like the sibling recorders: each wrapper
// snapshots the village pantry BEFORE the call, delegates with
// identical arguments, `this`, and return value, snapshots AFTER,
// and records ONLY unit decreases (unitsLost x pre-call kcalEach).
// It writes ONLY to the caller's arrays. No Game.state write, no RNG
// consumption, no say/log write.
//
// Why snapshot-diff, not a method wrap, for the NPC eats: the eats
// are INLINE code (item.units -= 1; splice) inside npcTakeAction /
// npcChildAction, not a called method — there is no method to wrap.
// The same holds for the raid (inline loop over v.pantry) and the
// lift (inline units decrement). Snapshot-diff around the enclosing
// method is the only honest recorder for inline code.
//
// Double-count guard: npcChildAction is dispatched ONLY through
// npcTakeAction (game.js ~20493; the only call site in src/js).
// Wrapping both naively would record every child eat twice. So the
// npcTakeAction wrapper holds a depth counter, and the npcChildAction
// wrapper records NOTHING while inside an npcTakeAction call (it
// counts the nested call, and the outer wrapper records the diff);
// a direct npcChildAction call (depth 0) records normally. Either
// route, each eat is recorded exactly once.
//
// Disjointness from mealdraw-capture: mealdraw wraps pantryDraw /
// drawSpoiled. None of the methods wrapped here call pantryDraw for
// the recorded decreases (all are inline decrements), and none of
// the mealdraw methods touch the pantry except through pantryDraw /
// drawSpoiled — so a kcal is never recorded by both instruments.
// The proof asserts the method sets are disjoint.
//
// Bonus paths wrapped honestly (reported per-path, never claimed if
// absent): Game._evTakePantryKcal (event/tribute takes, game.js
// ~25133 — the mealdraw evidence's unexplained-removal candidate),
// Game.takeFromPantry / takeFromPantryBulk (player takes, game.js
// ~15730 / ~15886 — direct pantry consumption bypassing pantryDraw).
// A path with zero calls on the band is reported as zero, not as a
// claim.
//
// Per direct record: {seq, day, path, vid, villager, items:
//   [{name, kcalEach, units, kcal, spoilDay, granaryDays, foodState}],
//   totalKcal, retTaken (event-take only), retMismatch (event-take only)}.
// Calls with no pantry decrease push NO record (counters still count
// every call, so a zero-record path is distinguishable from an
// unwrapped path). Counters: {calls, callsWithDecrease, records}
// per path, plus wrappedPaths / missingPaths lists.
'use strict';

const { branchDay } = require('./plainvoice-capture');
const { installStockdoorCapture } = require('./stockdoor-capture');

function pantrySnap(Game) {
  const out = [];
  try {
    const pantry = (Game.state.village || {}).pantry || [];
    for (const it of pantry) {
      if (!it) continue;
      out.push({
        name: (it.name == null ? null : String(it.name)),
        kcalEach: (it.kcalEach || 0),
        units: (it.units || 1),
        spoilDay: (it.spoilDay == null ? null : it.spoilDay),
        granaryDays: (it.granaryDays == null ? null : it.granaryDays),
        foodState: (it.foodState == null ? null : String(it.foodState)),
        _ref: it,
      });
    }
  } catch (e) {}
  return out;
}

function diffDecreases(pre, post) {
  const postByRef = new Map(post.map(s => [s._ref, s]));
  const items = [];
  for (const pr of pre) {
    const po = postByRef.get(pr._ref);
    const postUnits = po ? (po.units || 0) : 0;
    const lost = (pr.units || 0) - postUnits;
    if (lost > 0) {
      items.push({
        name: pr.name, kcalEach: pr.kcalEach, units: lost,
        kcal: lost * (pr.kcalEach || 0),
        spoilDay: pr.spoilDay, granaryDays: pr.granaryDays, foodState: pr.foodState,
      });
    }
  }
  return items;
}

function stripItem(s) {
  const o = {};
  for (const k of Object.keys(s)) if (k !== '_ref') o[k] = s[k];
  return o;
}

function installStockdoorsCapture(Game, opts) {
  opts = opts || {};
  const stockdoor = installStockdoorCapture(Game, opts);
  const directRecords = [];
  const counters = {
    calls: {}, callsWithDecrease: {}, records: 0, seq: 0,
    wrappedPaths: [], missingPaths: [], nestedChildCalls: 0,
  };
  const bump = (m, path) => { m[path] = (m[path] || 0) + 1; };
  function dayOf() { try { return branchDay(Game); } catch (e) { return (Game.state.scholar || {}).day || 0; } }
  function displayName(vid) {
    try { return (typeof Game.displayName === 'function') ? String(Game.displayName(vid)) : String(vid); }
    catch (e) { return String(vid); }
  }
  function isChild(vid) {
    try { return (typeof Game.npcAge === 'function') ? Game.npcAge(vid) < 15 : false; }
    catch (e) { return false; }
  }

  let npcDepth = 0;

  function recordDecrease(path, meta, items, extra) {
    if (!items.length) return;
    const rec = Object.assign({
      seq: ++counters.seq, day: dayOf(), path,
      vid: meta.vid != null ? String(meta.vid) : null,
      villager: meta.villager != null ? String(meta.villager) : null,
      items: items.map(stripItem),
      totalKcal: items.reduce((t, i) => t + (i.kcal || 0), 0),
    }, extra || {});
    directRecords.push(rec);
    counters.records++;
    bump(counters.callsWithDecrease, path);
  }

  // Generic snapshot-diff wrapper. pathOf(args, ret) -> path string (or
  // null to skip recording even on a decrease — unused by the paths
  // below, which always record). guardBefore(args) -> true when the
  // wrapper must delegate WITHOUT recording (npcChildAction nesting).
  function wrapMethod(methodName, pathOf, opts2) {
    opts2 = opts2 || {};
    const orig = Game[methodName];
    if (typeof orig !== 'function') { counters.missingPaths.push(methodName); return false; }
    if (orig.__stockdoorsInstalled) throw new Error('stockdoors-capture: Game.' + methodName + ' already stockdoors-wrapped');
    const wrapped = function (...args) {
      const skipRecord = opts2.guardBefore ? opts2.guardBefore(args) : false;
      if (opts2.before) opts2.before(args);
      const pre = skipRecord ? null : pantrySnap(Game);
      let ret;
      try { ret = orig.apply(this, args); }
      finally { if (opts2.after) opts2.after(args); }
      if (skipRecord) return ret;
      try {
        const path = pathOf(args, ret);
        if (path == null) return ret;
        bump(counters.calls, path);
        const post = pantrySnap(Game);
        const items = diffDecreases(pre, post);
        const extra = opts2.extra ? opts2.extra(args, ret, items) : null;
        recordDecrease(path, opts2.meta ? opts2.meta(args, ret) : {}, items, extra);
      } catch (e) {}
      return ret;
    };
    wrapped.__stockdoorsInstalled = true;
    Game[methodName] = wrapped;
    counters.wrappedPaths.push(methodName);
    return true;
  }

  // NPC pantry eats (adult + child, via npcTakeAction dispatch).
  wrapMethod('npcTakeAction', (args) => {
    const rid = args[0];
    return isChild(rid) ? 'npc-child-pantry' : 'npc-adult-pantry';
  }, {
    before: () => { npcDepth++; },
    after: () => { npcDepth--; },
    meta: (args) => ({ vid: args[0], villager: displayName(args[0]) }),
  });
  // Direct child calls (depth 0 only; nested calls counted, not recorded).
  wrapMethod('npcChildAction', (args) => 'npc-child-pantry', {
    guardBefore: () => {
      if (npcDepth > 0) { counters.nestedChildCalls++; return true; }
      return false;
    },
    meta: (args) => ({ vid: args[0], villager: displayName(args[0]) }),
  });
  // Alien pantry raids.
  wrapMethod('apPlaygroundRaid', () => 'alien-raid', {
    meta: (args) => ({ vid: args[0], villager: null }),
  });
  // Ability pantry effects (Light Fingers lifts + any other ability
  // that moves the pantry; tagged by ability key, never aggregated
  // across keys).
  wrapMethod('useAbility', (args) => String(args[0]) + '.' + String(args[1]), {
    meta: () => ({ vid: null, villager: 'player' }),
  });
  // Event / tribute takes from the pantry.
  wrapMethod('_evTakePantryKcal', () => 'event-take', {
    meta: () => ({ vid: null, villager: null }),
    extra: (args, ret, items) => {
      const sum = items.reduce((t, i) => t + (i.kcal || 0), 0);
      const retTaken = Math.round(ret || 0);
      return { retTaken, retMismatch: (sum !== retTaken) };
    },
  });
  // Player takes from the pantry.
  wrapMethod('takeFromPantry', () => 'player-take', {
    meta: () => ({ vid: null, villager: 'player' }),
  });
  wrapMethod('takeFromPantryBulk', () => 'player-take-bulk', {
    meta: () => ({ vid: null, villager: 'player' }),
  });

  return {
    stockdoorRecords: stockdoor.stockdoorRecords,
    stockdoorCounters: stockdoor.counters,
    stockdoorTruncated: stockdoor.stockdoorTruncated,
    directRecords, counters,
    directTruncated: () => false,
    uninstall() {
      stockdoor.uninstall();
    },
  };
}

module.exports = { installStockdoorsCapture, pantrySnap, diffDecreases };
