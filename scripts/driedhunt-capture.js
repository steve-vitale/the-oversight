#!/usr/bin/env node
// driedhunt-capture.js — mechanism probe for sim-driedhunt-b (DIAG only).
//
// Installed AFTER loadGame and BEFORE setupGame, alongside the reused
// 0049Z/2030Z captures (which it does NOT modify). Two additions:
//   (a) a snapshot-diff wrapper on Game._removePantryKcal (hierarchy.js:
//       the pantry take used by payTribute, tendLink, linkTick arrears,
//       accord gifts/sweeteners, betrayal and comms takes, and
//       lingererSortie rations). The wrapper delegates identically and
//       records day, returned amount, per-stack units lost (pre-call
//       kcalEach, pre-call spoilDay), and the caller function name
//       parsed from the call stack. It writes ONLY to the caller's
//       array. No Game.state write, no RNG consumption, no say/log
//       write. _removePantryKcal is the ONLY unwrapped pantry-removal
//       method reachable on a rank-village band: every other
//       pantry-removal site in src/js is already wrapped by the
//       reused instruments (npcTakeAction, npcChildAction,
//       apPlaygroundRaid, useAbility, _evTakePantryKcal,
//       takeFromPantry, takeFromPantryBulk, pantryDraw, drawSpoiled,
//       sweepSpoiled), and table-defiant's local tributeKcal fires
//       only in the Defiant endgame path, which this band never
//       reaches (see the prereg's reachability exclusion).
//   (b) snapshotStacks(): a pure-read per-stack pantry list
//       (name, kcalEach, units, spoilDay, foodState, granaryDays),
//       for the sweep's day-end snapshots. The reused spoilvol
//       snapshotPantry aggregates by channel; the hunt needs
//       per-stack disappearance days, which channel aggregates
//       cannot give.
// Stack traces are read-only diagnostics (no state, no RNG).
'use strict';

const { pantrySnap, diffDecreases } = require('./stockdoors-capture');

function callerFrames() {
  try {
    const st = new Error().stack || '';
    return st.split('\n').slice(1, 9).map(s => s.trim());
  } catch (e) { return []; }
}

function callerOf(frames) {
  for (const ln of frames) {
    if (/driedhunt-capture/.test(ln)) continue;
    if (/callerOf|callerFrames/.test(ln)) continue;
    const m = /at\s+([A-Za-z_$][\w$.<>]*)/.exec(ln);
    if (!m) continue;
    const name = m[1];
    if (name === 'Object.<anonymous>') continue;
    return name;
  }
  return null;
}

function stripStack(s) {
  const o = {};
  for (const k of Object.keys(s)) if (k !== '_ref') o[k] = s[k];
  return o;
}

function installDriedhuntCapture(Game) {
  const takes = [];
  let wrapped = false;
  const orig = Game._removePantryKcal;
  if (typeof orig === 'function' && !orig.__driedhuntInstalled) {
    const wrappedFn = function (...args) {
      const pre = pantrySnap(Game);
      let day = null;
      try { day = (Game.state.scholar || {}).day || 0; } catch (e) {}
      const frames = callerFrames();
      const caller = callerOf(frames);
      const ret = orig.apply(this, args);
      try {
        const post = pantrySnap(Game);
        const items = diffDecreases(pre, post);
        if (items.length) {
          takes.push({ day, caller, stack: frames, asked: Math.round(args[0] || 0),
            ret: Math.round(ret || 0), items: items.map(stripStack) });
        }
      } catch (e) {}
      return ret;
    };
    wrappedFn.__driedhuntInstalled = true;
    Game._removePantryKcal = wrappedFn;
    wrapped = true;
  }
  return {
    takes,
    wrapped,
    snapshotStacks: () => {
      try { return pantrySnap(Game).map(stripStack); }
      catch (e) { return []; }
    },
  };
}

module.exports = { installDriedhuntCapture };
