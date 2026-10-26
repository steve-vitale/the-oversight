#!/usr/bin/env node
// driedpath-capture.js — (dried) transformation-path recorder (DIAG only,
// sim-driedpath-b). Installed AFTER loadGame, BEFORE setupGame, alongside
// inflow-capture, mealdraw-capture, and spoilvol-capture (all reused
// UNCHANGED). Wraps Game.resolveOneAssignment once (the village cook's
// smoke-racks duty lives inside it: src/js/game.js, task 'cook' —
// fresh pantry surplus about to spoil is converted IN PLACE to
// foodState 'preserved' with a ' (dried)' / ' (smoked)' name suffix,
// with SPLIT copies for partial stacks) and Game.preserveFood once
// (the player's own smoking path, src/js/food.js ~870, pack/prep).
// Each wrapper snapshots the relevant containers BEFORE the call,
// delegates with identical arguments, `this`, and return value,
// snapshots AFTER, and records the delta. It writes ONLY to the
// caller's arrays. No Game.state write, no RNG consumption, no
// say/log write.
//
// A transformation is:
//   - an in-place conversion: a live stack present before AND after
//     whose name gains a trailing ' (dried)' / ' (smoked)', or whose
//     foodState becomes 'preserved'. The converted PORTION is the
//     post-call units: the racks' reserve split carves a fresh share
//     off the same stack inside the same call (pre units 8, post
//     units 2), so preKcal is post.units x pre.kcalEach — NOT the
//     whole pre-call stack kcal, which would count the surviving
//     fresh share as "lost". The fresh share stays in the pantry
//     under the base name and is counted in closing stock.
//   - a split-created conversion: a NEW live stack after the call
//     with foodState 'preserved' and a dried/smoked name, linked to
//     the pre-call source stack with the same base name whose units
//     fell by the new stack's units (the racks' budget/reserve
//     splits). Unlinked split stacks are recorded with linked:false
//     and preKcal:null — counted separately, never silently given
//     a made-up pre-kcal.
// Fresh-share split copies (base name, not preserved) are NOT events.
// Stacks that merely leave the pantry during a call are NOT events.
//
// Per event: day, path, villager id + display name (cook-racks) or
// 'player', container, before/after {name, kcalEach, units, kcal,
// foodState, spoilDay}, preKcal, postKcal, lossKcal (pre - post;
// null when unlinked).
//
// snapshotPantry() is exported for the sweep's OPENING stock snapshot
// (after setupGame, before the first policy day) and for day-end use
// if needed. Classification errors are recorded on the record's
// `error` field, never swallowed silently and never thrown into
// the game.
'use strict';

const { branchDay } = require('./plainvoice-capture');

function stackKcal(it) { return (it.kcalEach || 0) * (it.units || 1); }
function baseName(nm) {
  return String(nm || '').replace(/ \((dried|smoked)\)$/, '');
}
function isDriedName(nm) { return / \((dried|smoked)\)$/.test(String(nm || '')); }

function snapshotContainer(Game, items, container) {
  const out = [];
  if (!Array.isArray(items)) return out;
  for (const it of items) {
    if (!it) continue;
    let spoiled = false;
    try { spoiled = (typeof Game.isSpoiled === 'function') ? !!Game.isSpoiled(it) : false; } catch (e) {}
    out.push({
      channel: (it.name == null ? 'unnamed' : String(it.name)),
      kcalEach: it.kcalEach || 0,
      units: it.units || 1,
      kcal: stackKcal(it),
      spoilDay: (it.spoilDay === undefined || it.spoilDay === null) ? null : it.spoilDay,
      spoiled,
      foodState: it.foodState || null,
      foodKind: it.foodKind || null,
      container,
      _ref: it,
    });
  }
  return out;
}

function pantryOf(Game) {
  try { return (Game.state.village || {}).pantry || []; } catch (e) { return []; }
}
function packOf(Game) {
  try { return (Game.state.scholar || {}).inventory || []; } catch (e) { return []; }
}
function prepOf(Game) {
  try { return (typeof Game.prepStash === 'function') ? (Game.prepStash() || []) : []; } catch (e) { return []; }
}

function snapshotAll(Game, containers) {
  const snap = { day: null, pack: [], prep: [], pantry: [], error: null };
  try {
    try { snap.day = branchDay(Game); } catch (e) { snap.day = null; }
    if (snap.day == null) { try { snap.day = (Game.state.scholar || {}).day || 0; } catch (e) { snap.day = 0; } }
    if (!containers || containers.indexOf('pack') >= 0) snap.pack = snapshotContainer(Game, packOf(Game), 'pack');
    if (!containers || containers.indexOf('prep') >= 0) snap.prep = snapshotContainer(Game, prepOf(Game), 'prep');
    if (!containers || containers.indexOf('pantry') >= 0) snap.pantry = snapshotContainer(Game, pantryOf(Game), 'pantry');
  } catch (e) { snap.error = 'snapshotAll: ' + String(e && e.message); }
  return snap;
}

function stripStack(s) {
  const o = {};
  for (const k of Object.keys(s)) if (k !== '_ref') o[k] = s[k];
  return o;
}

// Diff one container's pre/post snapshots into transformation events.
// `meta` carries day/path/villager/container for the event records.
function diffContainer(pre, post, meta) {
  const events = [];
  const preByRef = new Map(pre.map(s => [s._ref, s]));
  const postByRef = new Map(post.map(s => [s._ref, s]));
  // In-place conversions.
  for (const [ref, pr] of preByRef) {
    const po = postByRef.get(ref);
    if (!po) continue;
    const nameGained = isDriedName(po.channel) && !isDriedName(pr.channel);
    const stateGained = po.foodState === 'preserved' && pr.foodState !== 'preserved';
    if (!nameGained && !stateGained) continue;
    // Converted portion = post-call units (see header: the reserve
    // split carves a fresh share off inside the same call).
    const preKcal = po.units * pr.kcalEach;
    events.push(Object.assign({}, meta, {
      kind: 'in-place',
      before: stripStack(pr), after: stripStack(po),
      preKcal, postKcal: po.kcal, lossKcal: preKcal - po.kcal,
      linked: true,
    }));
  }
  // Split-created conversions: new preserved dried/smoked stacks.
  const preList = pre;
  for (const po of post) {
    if (preByRef.has(po._ref)) continue;
    if (po.foodState !== 'preserved' || !isDriedName(po.channel)) continue;
    const base = baseName(po.channel);
    // Link: a pre stack with the base name, still present post, whose
    // units fell by exactly the new stack's units (exact first).
    let link = null;
    for (const pr of preList) {
      if (pr.channel !== base) continue;
      const poSrc = postByRef.get(pr._ref);
      if (!poSrc) continue;
      if (pr.units - poSrc.units === po.units) { link = pr; break; }
    }
    if (!link) {
      for (const pr of preList) {
        if (pr.channel !== base) continue;
        const poSrc = postByRef.get(pr._ref);
        if (!poSrc) continue;
        if (pr.units - poSrc.units > 0 && pr.units - poSrc.units >= po.units) { link = pr; break; }
      }
    }
    const preKcal = link ? po.units * link.kcalEach : null;
    events.push(Object.assign({}, meta, {
      kind: 'split',
      before: link ? stripStack(link) : null,
      after: stripStack(po),
      preKcal, postKcal: po.kcal,
      lossKcal: preKcal == null ? null : preKcal - po.kcal,
      linked: !!link,
    }));
  }
  return events;
}

function snapshotPantry(Game) {
  const snap = snapshotAll(Game, ['pantry']);
  const byName = new Map();
  for (const s of snap.pantry) {
    let b = byName.get(s.channel);
    if (!b) { b = { channel: s.channel, freshKcal: 0, spoiledKcal: 0, stacks: 0 }; byName.set(s.channel, b); }
    b.stacks += 1;
    if (s.spoiled) b.spoiledKcal += s.kcal; else b.freshKcal += s.kcal;
  }
  const channels = Array.from(byName.values())
    .sort((a, b) => (b.freshKcal - a.freshKcal) || (b.channel < a.channel ? -1 : 1));
  return { day: snap.day,
    freshKcal: channels.reduce((t, c) => t + c.freshKcal, 0),
    spoiledKcal: channels.reduce((t, c) => t + c.spoiledKcal, 0),
    channels, error: snap.error };
}

function installDriedpathCapture(Game, opts) {
  opts = opts || {};
  const ev = { events: [] };
  const counters = { resolveCalls: 0, preserveCalls: 0, cookCalls: 0 };
  function dayOf() { try { return branchDay(Game); } catch (e) { return (Game.state.scholar || {}).day || 0; } }
  function displayName(vid) {
    try { return (typeof Game.displayName === 'function') ? String(Game.displayName(vid)) : String(vid); }
    catch (e) { return String(vid); }
  }

  const origResolve = Game.resolveOneAssignment;
  if (typeof origResolve !== 'function') throw new Error('driedpath-capture: Game.resolveOneAssignment is not a function');
  if (origResolve.__driedpathInstalled) throw new Error('driedpath-capture: Game.resolveOneAssignment already driedpath-wrapped');
  const wrappedResolve = function (...args) {
    const vid = args[0];
    const a = args[1] || {};
    const task = a.task || '?';
    const pre = snapshotAll(Game, ['pantry']);
    const ret = origResolve.apply(this, args);
    const post = snapshotAll(Game, ['pantry']);
    counters.resolveCalls++;
    if (task === 'cook') counters.cookCalls++;
    try {
      const meta = { day: dayOf(), scholarDay: (Game.state.scholar || {}).day || 0,
        path: task === 'cook' ? 'cook-racks' : 'other-task',
        task, vid: vid == null ? null : String(vid),
        villager: task === 'cook' ? displayName(vid) : null,
        container: 'pantry', error: pre.error || post.error || null };
      const evs = diffContainer(pre.pantry, post.pantry, meta);
      for (const e of evs) {
        if (e.kind === 'split') e.path = task === 'cook' ? 'cook-racks-split' : 'other-task-split';
        ev.events.push(e);
      }
    } catch (e) {}
    return ret;
  };
  wrappedResolve.__driedpathInstalled = true;
  Game.resolveOneAssignment = wrappedResolve;

  const origPreserve = Game.preserveFood;
  if (typeof origPreserve === 'function' && !origPreserve.__driedpathInstalled) {
    const wrappedPreserve = function (...args) {
      const pre = snapshotAll(Game, ['pack', 'prep', 'pantry']);
      const ret = origPreserve.apply(this, args);
      const post = snapshotAll(Game, ['pack', 'prep', 'pantry']);
      counters.preserveCalls++;
      try {
        for (const cont of ['pack', 'prep', 'pantry']) {
          const meta = { day: dayOf(), scholarDay: (Game.state.scholar || {}).day || 0,
            path: 'player-preserve', task: 'preserveFood', vid: null, villager: 'player',
            container: cont, error: pre.error || post.error || null };
          for (const e of diffContainer(pre[cont], post[cont], meta)) ev.events.push(e);
        }
      } catch (e) {}
      return ret;
    };
    wrappedPreserve.__driedpathInstalled = true;
    Game.preserveFood = wrappedPreserve;
  }

  return { events: ev, counters, snapshotPantry: () => snapshotPantry(Game) };
}

module.exports = { installDriedpathCapture, snapshotPantry, baseName, isDriedName };
