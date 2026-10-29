#!/usr/bin/env node
// recallpolicy-instrument-b.js — cliff-triggered expedition-recall POLICY
// instrument for sim-recallpolicy-b (flesh-out loop B, run
// fleshout-loop-b-20261029T1130Z, axis food-economy).
//
// PREREG: evidence/2026-10-29/sim-recallpolicy-b-prereg.md (committed
// BEFORE any judged leg). Trigger = RECALL-TRIGGER v1 Rule A ONLY,
// reused verbatim from scripts/taxonomy-recalldiag-b.js (required, not
// copied — one implementation, no drift).
//
// POLICY-SIDE ONLY: zero src/js changes, default OFF (gate env
// RECALLPOLICY_B=1; unset/anything-else = observe-only control leg).
// No driver adopts it: the sweep-compare registry is untouched; only
// scripts/sweep-recallpolicy-b.js loads this file.
//
// MECHANISM (legal travel only, docs/MAP.md §6 NO-TELEPORT law):
//   * meal-row capture (villagerMealDay wrap, post-call pure reads —
//     the starvechan shape: ate/drawn/gave/fasting/away/produced/
//     expected/need) + trigger evaluation per villager-day.
//   * on first fire in an away-episode, the villager is marked
//     RECALLED (instrument memory only).
//   * WALK HOME: npcSetNode wrap. For a recalled villager, the
//     engine's requested destination is replaced by the next step
//     of a BFS path from the current node to haven (orthogonal
//     steps, 0..8 grid, each edge checked with the engine's own
//     Game.travelBlockage — the eveningdetour BFS mechanics,
//     mirrored here, not imported from a sibling-owned file).
//     No BFS path -> HOLD (skip the move, record it). Node already
//     at haven -> HOLD any move away from haven (so the next leg
//     cannot walk them back out before the return completes).
//     SNAP DETECTOR: a requested move with Chebyshev distance > 1
//     from the current node is a base-return/admin snap, NOT a leg
//     step — it passes through untouched (the engine's own return
//     snap is engine behavior, never rewritten by this instrument).
//   * ARRIVAL: at the next sleep boundary, a recalled villager
//     whose node IS haven has village.away[vid] cleared — exactly
//     what the engine's own base return does — so the next
//     agencyTick completes the return through the engine's own
//     expeditionReturn (haul, trust, pre-existing return narration).
//     A recalled villager whose away flag was cleared by the base
//     return (duration elapsed mid-walk) is recorded as a
//     natural-duration completion, NOT a strict rescue.
//   * GUARDS: dead -> no action; engaged (isEngaged) -> no move
//     (recorded skipped); no agency expedition record (objective
//     departure, no ex entry) -> scope-excluded, no move; the
//     instrument NEVER calls say() (no new narration), NEVER reads
//     the pantry for the trigger (Rule B excluded by design — the
//     away villager cannot see the pantry), consumes 0 Math.random
//     calls, and performs 0 game-state writes when OFF.
//   * SAY CAPTURE (observer-only): say lines are buffered per day
//     and, at finalize, kept ONLY for recall-event days (fire /
//     walk / arrival / death-of-recalled) for the sense-testing
//     read. Nothing else is kept.
//
// KNOWABILITY (prereg clause): the trigger uses ONLY the villager's
// own away flag, own production history, own pack draws, own need.
// The pantry is never an input to the trigger in either leg.
//
// Usage (same env as the sweep):
//   const RP = require('./recallpolicy-instrument-b');
//   const { K, uninstall } = RP.install(Game);   // gate read at install
//   ... runDays ...
//   const out = RP.finalize(Game, K, dcFinalize); uninstall();
'use strict';
var triggerModule = null;
try { triggerModule = require('./taxonomy-recalldiag-b'); } catch (e) { triggerModule = null; }

function on() { return process.env.RECALLPOLICY_B === '1'; }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function dayPartOf(Game) { try { var p = Game.dayPart; return (p === undefined || p === null) ? null : p; } catch (e) { return null; } }
function villageOf(Game) { try { return (Game.state || {}).village || null; } catch (e) { return null; } }
function havenOf(Game) {
  var v = villageOf(Game); if (!v) return { hx: 4, hy: 4 };
  return { hx: (v.px === undefined ? 4 : v.px), hy: (v.py === undefined ? 4 : v.py) };
}
function nodeOf(Game, vid) {
  try { var n = Game.npcNode ? Game.npcNode(vid) : null; if (n) return { nx: n.nx, ny: n.ny }; } catch (e) {}
  var v = villageOf(Game); var hx = 4, hy = 4;
  if (v) { hx = (v.px === undefined ? 4 : v.px); hy = (v.py === undefined ? 4 : v.py); }
  return { nx: hx, ny: hy };
}
function expedOf(Game, vid) {
  try {
    var v = villageOf(Game); if (!v) return null;
    var ag = v.agency || null; if (!ag || !ag.exped) return null;
    return ag.exped[vid] || null;
  } catch (e) { return null; }
}
function awayOf(Game, vid) {
  try { var v = villageOf(Game); return (v && v.away && v.away[vid]) || null; } catch (e) { return null; }
}
function isDead(Game, vid) {
  try { var vp = Game.vpOf ? Game.vpOf(vid) : null; return !!(vp && vp.dead); } catch (e) { return false; }
}
function isEngaged(Game, vid) {
  try { return Game.isEngaged ? !!Game.isEngaged(vid) : false; } catch (e) { return false; }
}
function displayName(Game, vid) {
  try { return Game.displayName ? String(Game.displayName(vid)) : String(vid); } catch (e) { return String(vid); }
}
function pushErr(K, msg) { try { K.errors.push(String(msg).slice(0, 200)); } catch (e) {} }

// BFS path (orthogonal, 0..8, blockage-clean via Game.travelBlockage).
// Returns an array of {nx, ny} steps from start (exclusive) to haven
// (inclusive), or null when no legal path exists. Deterministic:
// fixed neighbor order, no RNG. A missing travelBlockage is treated
// as "everything blocked" (conservative: hold, never step blind).
function bfsPath(Game, sx, sy, hx, hy) {
  try {
    if (sx === hx && sy === hy) return [];
    if (typeof Game.travelBlockage !== 'function') return null;
    var N = 9;
    var key = function (x, y) { return x + ',' + y; };
    var prev = {}; prev[key(sx, sy)] = null;
    var q = [[sx, sy]];
    var DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    while (q.length) {
      var cur = q.shift(); var x = cur[0], y = cur[1];
      if (x === hx && y === hy) break;
      for (var i = 0; i < DIRS.length; i++) {
        var nx = x + DIRS[i][0], ny = y + DIRS[i][1];
        if (nx < 0 || ny < 0 || nx >= N || ny >= N || (key(nx, ny) in prev)) continue;
        var blocked = true;
        try { blocked = !!Game.travelBlockage(nx, ny, x, y); } catch (e) { blocked = true; }
        if (blocked) continue;
        prev[key(nx, ny)] = [x, y];
        q.push([nx, ny]);
      }
    }
    if (!(key(hx, hy) in prev)) return null;
    var path = []; var c = [hx, hy];
    while (!(c[0] === sx && c[1] === sy)) { path.unshift({ nx: c[0], ny: c[1] }); c = prev[key(c[0], c[1])]; }
    return path;
  } catch (e) { return null; }
}

function install(Game) {
  var enabled = on();
  var K = {
    enabled: enabled,
    meals: [],                 // per villagerMealDay call (observer, both legs)
    rowsByVid: new Map(),      // vid -> Map(d -> row) (trigger input)
    awayOpen: {},              // vid -> episodeId currently open
    episodes: [],              // {id, vid, name, fireDay, fireNode, fireDist, awayRec, steps[], outcome}
    epByVid: {},               // vid -> episode object (open recalled episode, ON leg only)
    firedFor: {},              // vid -> away-episode id already fired in (both legs: one episode per away-episode)
    steps: [],                 // every recall walk decision (both legs: ON moves, OFF would-moves are NOT taken)
    holds: [],                 // no-path / at-haven holds
    skipped: [],               // engaged/dead/scope-excluded skips
    completions: [],           // arrival completions (recall-cleared / natural-duration)
    sayByDay: {},              // d -> [lines] (filtered at finalize)
    errors: [],
  };
  var epSeq = 0;
  var wrapped = [];
  function wrap(name, fn) {
    try {
      var o = Game[name];
      if (typeof o !== 'function') return;
      var bound = o.bind(Game);
      Game[name] = fn(bound);
      wrapped.push([name, o, bound]);
    } catch (e) { pushErr(K, 'install:' + name + ': ' + String((e && e.message) || e)); }
  }
  function uninstall() {
    for (var i = wrapped.length - 1; i >= 0; i--) {
      try { Game[wrapped[i][0]] = wrapped[i][1]; } catch (e) {}
    }
    wrapped = [];
  }

  // ---- meal rows + trigger evaluation (both legs; pure reads) ----
  wrap('villagerMealDay', function (oMeal) {
    return function (vid) {
      var r = oMeal.apply(this, arguments);
      try {
        var d = dayOf(Game);
        var v = villageOf(Game);
        var cl = (v && v.contribLog && v.contribLog[vid]) || {};
        var person = null;
        try { person = Game.getPerson ? Game.getPerson(vid) : null; } catch (e) {}
        var need = (person && person.kcalPerDay) || 2000;
        var away = !!awayOf(Game, vid);
        var row = { d: d, vid: String(vid), ate: Math.round((r && r.ate) || 0),
          drawn: Math.round((r && r.drawn) || 0), gave: Math.round((r && r.gave) || 0),
          fasting: !!((r && r.fasting)), away: away,
          produced: Math.round(cl.produced || 0), expected: Math.round(cl.expected || 0),
          need: Math.round(need) };
        K.meals.push(row);
        var vs = String(vid);
        if (!K.rowsByVid.has(vs)) K.rowsByVid.set(vs, new Map());
        K.rowsByVid.get(vs).set(d, row);
        // Episode open/close bookkeeping (observer, both legs).
        if (away && K.awayOpen[vs] === undefined) { K.awayOpen[vs] = ++epSeq; }
        if (!away && K.awayOpen[vs] !== undefined) {
          // Came home without a sleep-boundary completion record
          // (e.g. run ended, or base return between meals): close
          // the episode id so the next departure is a new episode.
          // The completion itself is recorded at the sleep boundary
          // (or at finalize as unresolved); this only retires the id.
          delete K.awayOpen[vs];
        }
        // Trigger evaluation (Rule A only; pantry NEVER passed).
        if (away && triggerModule && triggerModule.triggerDay) {
          var t = triggerModule.triggerDay(K.rowsByVid.get(vs), new Map(), d, false);
          if (t && t.fire && K.firedFor[vs] !== K.awayOpen[vs]) {
            K.firedFor[vs] = K.awayOpen[vs];
            var hv = havenOf(Game); var nd = nodeOf(Game, vs);
            var ex = expedOf(Game, vs); var aw = awayOf(Game, vs);
            var ep = { id: K.awayOpen[vs] || ++epSeq, vid: vs, name: displayName(Game, vs),
              fireDay: d, fireNode: nd, fireDist: Math.abs(nd.nx - hv.hx) + Math.abs(nd.ny - hv.hy),
              baseline: t.baseline, ratio: t.ratio,
              awayRec: aw ? { sinceDay: aw.sinceDay, sincePart: aw.sincePart, duration: aw.duration } : null,
              hasExped: !!ex, steps: [], outcome: null, outcomeDay: null };
            K.episodes.push(ep);
            if (enabled && ex && !isDead(Game, vs)) {
              K.epByVid[vs] = ep;
            } else if (enabled && !ex) {
              K.skipped.push({ d: d, vid: vs, name: ep.name, reason: 'scope-excluded-no-expedition' });
              ep.outcome = 'scope-excluded'; ep.outcomeDay = d;
            } else if (enabled && isDead(Game, vs)) {
              K.skipped.push({ d: d, vid: vs, name: ep.name, reason: 'dead-at-fire' });
              ep.outcome = 'dead-at-fire'; ep.outcomeDay = d;
            }
            // OFF leg: trigger recorded, no recall state — the
            // episode stays a would-fire for the control comparison.
          }
        }
      } catch (e) { pushErr(K, 'meal: ' + String((e && e.message) || e)); }
      return r;
    };
  });

  // ---- walk home: npcSetNode reroute (ON leg only; OFF passes through) ----
  wrap('npcSetNode', function (oSet) {
    return function (vid, nx, ny, allowBeyond) {
      try {
        var vs = String(vid);
        var ep = K.epByVid[vs];
        if (!enabled || !ep) return oSet.apply(this, arguments);
        if (vs === String(Game.villagerId)) return oSet.apply(this, arguments);
        if (isDead(Game, vs)) { K.skipped.push({ d: dayOf(Game), vid: vs, name: ep.name, reason: 'dead-skip-move' }); return oSet.apply(this, arguments); }
        if (isEngaged(Game, vs)) { K.skipped.push({ d: dayOf(Game), vid: vs, name: ep.name, reason: 'engaged-skip-move' }); return; }
        var cur = nodeOf(Game, vs);
        var hv = havenOf(Game);
        if (cur.nx === hv.hx && cur.ny === hv.hy) {
          // At haven: hold any move away; a haven-bound move is a no-op.
          if (nx === hv.hx && ny === hv.hy) return oSet.apply(this, arguments);
          K.holds.push({ d: dayOf(Game), vid: vs, name: ep.name, reason: 'at-haven-hold', from: cur, requested: { nx: nx, ny: ny } });
          return;
        }
        var cheb = Math.max(Math.abs(nx - cur.nx), Math.abs(ny - cur.ny));
        if (cheb > 1) {
          // Base-return/admin snap (distance > 1 cannot be a leg
          // step): pass through untouched — engine behavior preserved.
          K.steps.push({ d: dayOf(Game), vid: vs, name: ep.name, kind: 'snap-passthrough', from: cur, to: { nx: nx, ny: ny } });
          return oSet.apply(this, arguments);
        }
        var path = bfsPath(Game, cur.nx, cur.ny, hv.hx, hv.hy);
        if (!path || !path.length) {
          K.holds.push({ d: dayOf(Game), vid: vs, name: ep.name, reason: 'no-path-hold', from: cur, requested: { nx: nx, ny: ny } });
          ep.steps.push({ d: dayOf(Game), kind: 'hold-no-path', from: cur });
          return;
        }
        var next = path[0];
        var step = { d: dayOf(Game), vid: vs, name: ep.name, kind: 'recall-step',
          from: cur, to: { nx: next.nx, ny: next.ny }, pathLen: path.length,
          requested: { nx: nx, ny: ny } };
        K.steps.push(step); ep.steps.push(step);
        return oSet.call(this, vs, next.nx, next.ny, allowBeyond);
      } catch (e) { pushErr(K, 'npcSetNode: ' + String((e && e.message) || e)); return oSet.apply(this, arguments); }
    };
  });

  // ---- arrival completion at the sleep boundary (ON leg only) ----
  wrap('sleep', function (oSleep) {
    return function () {
      var r = oSleep.apply(this, arguments);
      try {
        if (!enabled) return r;
        var hv = havenOf(Game);
        var d = dayOf(Game); var part = dayPartOf(Game);
        Object.keys(K.epByVid).forEach(function (vs) {
          var ep = K.epByVid[vs];
          try {
            if (isDead(Game, vs)) {
              ep.outcome = 'died-en-route'; ep.outcomeDay = d;
              K.completions.push({ d: d, vid: vs, name: ep.name, kind: 'died-while-recalled' });
              delete K.epByVid[vs]; return;
            }
            var aw = awayOf(Game, vs);
            var nd = nodeOf(Game, vs);
            if (!aw) {
              // Base return cleared the flag mid-walk (duration
              // elapsed): natural-duration completion, never a
              // strict rescue (the schedule test below fails it).
              var kind = (nd.nx === hv.hx && nd.ny === hv.hy) ? 'natural-duration' : 'natural-duration-node-wild';
              ep.outcome = kind; ep.outcomeDay = d;
              K.completions.push({ d: d, vid: vs, name: ep.name, kind: kind, node: nd });
              delete K.epByVid[vs]; return;
            }
            if (nd.nx === hv.hx && nd.ny === hv.hy) {
              var v = villageOf(Game);
              if (v && v.away) delete v.away[vs];
              var sinceDay = ep.awayRec ? ep.awayRec.sinceDay : d;
              var sincePart = (ep.awayRec && ep.awayRec.sincePart !== undefined) ? ep.awayRec.sincePart : 0;
              var dur = (ep.awayRec && ep.awayRec.duration !== undefined) ? ep.awayRec.duration : null;
              var partNow = (part === null || part === undefined) ? 3 : part;
              var partsAway = (d - (sinceDay || d)) * 4 + (partNow - sincePart);
              var strict = (dur !== null) && (partsAway < dur);
              ep.outcome = strict ? 'rescued-strict' : 'arrived-after-schedule';
              ep.outcomeDay = d; ep.partsAway = partsAway; ep.scheduledDuration = dur;
              K.completions.push({ d: d, vid: vs, name: ep.name, kind: 'recall-cleared',
                node: nd, partsAway: partsAway, scheduledDuration: dur, strict: strict });
              delete K.epByVid[vs];
            }
          } catch (e2) { pushErr(K, 'sleep-ep:' + String((e2 && e2.message) || e2)); }
        });
      } catch (e) { pushErr(K, 'sleep: ' + String((e && e.message) || e)); }
      return r;
    };
  });

  // ---- say capture (observer-only, both legs; filtered at finalize) ----
  wrap('say', function (oSay) {
    return function () {
      var r = oSay.apply(this, arguments);
      try {
        var d = dayOf(Game);
        var line = ''; try { line = String(arguments[0]); } catch (e) {}
        if (!K.sayByDay[d]) K.sayByDay[d] = [];
        if (K.sayByDay[d].length < 300) K.sayByDay[d].push(line);
      } catch (e) {}
      return r;
    };
  });

  return { K: K, uninstall: uninstall };
}

function finalize(Game, K, dcFin) {
  // Sweep up unresolved recalled episodes (run ended / village lost
  // before a sleep boundary could complete them).
  Object.keys(K.epByVid || {}).forEach(function (vs) {
    var ep = K.epByVid[vs];
    try {
      if (isDead(Game, vs)) { ep.outcome = 'died-en-route'; ep.outcomeDay = dayOf(Game); }
      else if (!awayOf(Game, vs)) { ep.outcome = ep.outcome || 'arrived-unresolved'; ep.outcomeDay = dayOf(Game); }
      else { ep.outcome = 'unresolved-at-horizon'; ep.outcomeDay = dayOf(Game); }
      K.completions.push({ d: dayOf(Game), vid: vs, name: ep.name, kind: 'finalize-sweep', outcome: ep.outcome });
    } catch (e) {}
  });
  // Join deaths: a triggered villager who died while their episode
  // was open (death day >= fire day) is a triggered-death.
  var deaths = [];
  try { deaths = (dcFin && dcFin.deaths) || []; } catch (e) {}
  K.episodes.forEach(function (ep) {
    var hit = null;
    for (var i = 0; i < deaths.length; i++) {
      var dr = deaths[i];
      if (String(dr.vid) === String(ep.vid) && dr.day >= ep.fireDay) { hit = dr; break; }
    }
    if (hit) {
      ep.death = { day: hit.day, cause: hit.cause, pclass: hit.pclass };
      // ON leg only: a death while recalled is died-en-route. OFF
      // episodes keep outcome null (control deaths are read off
      // ep.death by the analyzer, never relabeled as route deaths).
      if (K.enabled && (!ep.outcome || ep.outcome === 'unresolved-at-horizon')) { ep.outcome = 'died-en-route'; ep.outcomeDay = hit.day; }
    }
  });
  // Sense corpus: say lines ONLY on recall-event days.
  var eventDays = {};
  K.episodes.forEach(function (ep) {
    eventDays[ep.fireDay] = true;
    if (ep.outcomeDay) eventDays[ep.outcomeDay] = true;
    (ep.steps || []).forEach(function (s) { if (s.d) eventDays[s.d] = true; });
  });
  var senseLines = [];
  Object.keys(eventDays).forEach(function (d) {
    (K.sayByDay[d] || []).forEach(function (line) { senseLines.push({ d: +d, line: line }); });
  });
  var rescued = K.episodes.filter(function (e) { return e.outcome === 'rescued-strict'; }).length;
  var triggered = K.episodes.filter(function (e) { return e.outcome !== 'scope-excluded' && e.outcome !== 'dead-at-fire'; }).length;
  return {
    enabled: K.enabled,
    haven: havenOf(Game),
    episodes: K.episodes,
    triggered: triggered,
    rescuedStrict: rescued,
    rescueRate: triggered ? +(rescued / triggered).toFixed(3) : null,
    steps: K.steps,
    holds: K.holds,
    skipped: K.skipped,
    completions: K.completions,
    errors: K.errors,
    mealRows: K.meals.length,
    senseLines: senseLines,
  };
}

module.exports = { install: install, finalize: finalize, bfsPath: bfsPath, on: on };
