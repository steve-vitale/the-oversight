#!/usr/bin/env node
// gardenb-instrument-20261110.js — gardening first-numbers recorder
// (arm sim-garden-b, run fleshout-loop-b-20261111T0025Z). Scripts only, zero src/js.
//
// Records, per seed:
//   (1) HARVESTS (gardenHarvestTaken wrap — the kcal choke point): every
//       plot harvest with pid, nominal kcal (plotYieldKcal BEFORE the call
//       resets the plot), units, origin shares (ordinary/assisted/legacy/
//       legacyAssisted), weeds, legacy flag, caller path from the stack:
//       player-harvest (harvestGarden) / npc-duty (resolveOneAssignment).
//       'other' is a failure, not a class.
//   (2) ACTIONS: makePlot, sowPlot (pid, guided?, guide vid), tendGarden,
//       reclaimGarden (vid, dead-before), gardenMaintain (vid, plots
//       changed, throttle flag at entry), cultivateGarden (vid, plan
//       source/cost/growth/yield, beds affected), harvestGarden
//       (ripe-before, took), cookFood + shellNuts on gardenShares items
//       only (the policy's prepareGardenFood step).
//   (3) TEACHING (teachPlant wrap): teacher vid, plant, outcome,
//       caller path (sowPlot -> guided-sow, else first frame).
//   (4) EATING (eatOne + eat wraps + tele('eat') capture): eaten kcal
//       attributed by gardenShares (object-identity pre/post diff),
//       scholar pack vs village meal split.
//   (5) VILLAGE MEAL (pantryDraw wrap): cook flag, kcal drawn, garden
//       kcal drawn (drawn items carrying gardenShares).
//   (6) DEEDS (noteDeed + creditDeed wraps): 'gardening' deeds only.
//   (7) REUSED CAPTURES: scripts/inflow-capture.js (all pantry inflows
//       by name — the garden-vs-forage share) and scripts/garden-capture.js
//       (gardenstate-b: assigns / keeperTurns / resolutions with throttle
//       flag / makes / sows / npcSows / keeperSets / gardenInflows /
//       sayLines / snapshotGarden — plot-state snapshots).
//   (8) DAILY SNAPSHOT: garden-capture snapshotGarden + pantry/pack
//       gardenShares kcal (by origin class) + scholar codex plant levels
//       + villager practice 'garden' reps/steps + known-plants counts +
//       Green Thumb/Whisper levels + foodXp map + cumulative inflow by
//       name + garden-duty holders.
//
// All wraps are record-only: call the original, return its value
// unchanged, never alter state, never consume RNG. Any failure in the
// RECORDING path is logged to instrumentErrors, never thrown into the
// game.
//
// KNOWN WRAP RISK (secondlink-a / diplo-a / cookfirst-a lesson): a wrap
// records nothing if the engine calls the closure instead of the Game
// method. The proof (scripts/test-garden-b.js) verifies EACH wrapped
// method's call path is live on a fixture or live miniature; a wrap
// with no live call observed is marked dead in the evidence and its
// zero is never treated as evidence. gardenHarvestTaken is the backstop
// for yield provenance: if the harvestGarden / duty wraps are dead,
// the kcal are still counted from the choke point's stack.
//
// Usage: const GI = require('./gardenb-instrument-20261110');
//   const gi = GI.install(Game); gi.snapshot(); ... gi.uninstall();
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { installInflowCapture } = require(path.join(REPO, 'scripts', 'inflow-capture'));
const { installGardenCapture } = require(path.join(REPO, 'scripts', 'garden-capture'));

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function stackText(skip) {
  try { return (new Error().stack || '').split('\n').slice(skip || 0).join(' | '); } catch (e) { return ''; }
}

// First engine frame in the stack (after the wrap + this helper).
// Skips any frame from this instrument file itself.
function firstFrame(stack) {
  try {
    const lines = String(stack || '').split(' | ');
    for (const ln of lines) {
      if (ln.indexOf('gardenb-instrument') !== -1) continue;
      const m = ln.match(/at (\S+)/);
      if (m && m[1] !== 'Object.<anonymous>') return m[1];
    }
    return null;
  } catch (e) { return null; }
}

// Caller-path classification for a garden harvest. Priority order is a
// priority order, not a guess: harvestGarden is the only player path;
// resolveOneAssignment is the only NPC-duty path.
function classifyHarvestPath(stack) {
  if (!stack) return 'other';
  if (stack.indexOf('harvestGarden') !== -1) return 'player-harvest';
  if (stack.indexOf('resolveOneAssignment') !== -1) return 'npc-duty';
  return 'other';
}

// Caller-path classification for a direct method call. Distinguishes
// the policy's own calls from engine-internal ones by the first
// non-instrument frame: policy files live under scripts/policies/.
function classifyMethodPath(stack) {
  if (!stack) return 'unknown';
  if (stack.indexOf('scripts/policies') !== -1 || stack.indexOf('policies/') !== -1) return 'policy';
  if (stack.indexOf('resolveOneAssignment') !== -1) return 'duty';
  if (stack.indexOf('harvestGarden') !== -1) return 'player-harvest';
  return 'internal';
}

// Caller-path classification for a teaching event.
function classifyTeachPath(stack) {
  if (!stack) return 'unknown';
  if (stack.indexOf('sowPlot') !== -1) return 'guided-sow';
  if (stack.indexOf('fireside') !== -1) return 'fireside';
  if (stack.indexOf('word of mouth') !== -1 || stack.indexOf('wordOfMouth') !== -1) return 'word-of-mouth';
  return firstFrame(stack) || 'unknown';
}

function install(Game) {
  const t = {
    harvests: [], // {day, pid, path, kcalNominal, units, origin, weeds, legacy, growthLeft}
    actions: [], // {day, action, vid, pid, ok, ...}
    teaches: [], // {day, teacher, plant, outcome, path}
    preps: [], // {day, method, pid, name, ok}
    eats: [], // {day, via, garden, kcalEach, units, ateKcal, name, plantId}
    draws: [], // {day, cook, want, taken, gardenKcal, byState, caller}
    deeds: [], // {day, deed, who}
    daily: [], // snapshots
    instrumentErrors: [],
    wrapLive: {}, // name -> true once a wrapped call is observed live
    sayLines: [],
  };
  const wrapped = {};
  let inflow = null;
  let gardenCap = null;

  function err(site, e) {
    try { t.instrumentErrors.push(site + ': ' + String((e && e.message) || e).slice(0, 120)); } catch (e2) {}
  }

  // (7) Reused captures first: inflow doors, then garden-capture on top
  // (it wraps the inflow-wrapped doors a second time and records ONLY
  // the gardenShares flag — see its header).
  try { inflow = installInflowCapture(Game, { inflowCap: 50000 }); } catch (e) { err('inflow-install', e); }
  try { gardenCap = installGardenCapture(Game, { sayCap: 300 }); } catch (e) { err('garden-capture-install', e); }

  function wrapMethod(name, record) {
    try {
      const orig = Game[name];
      if (typeof orig !== 'function') { t.instrumentErrors.push(name + '-missing: not a function'); return; }
      wrapped[name] = orig;
      const selfGame = Game;
      Game[name] = function () {
        let r, threw = null;
        let pre = null;
        try { pre = record.pre ? record.pre(Array.prototype.slice.call(arguments)) : null; } catch (e) { err(name + '-pre', e); }
        try { r = orig.apply(selfGame, arguments); } catch (e) { threw = e; }
        try {
          t.wrapLive[name] = true;
          if (record.post) record.post(Array.prototype.slice.call(arguments), r, threw, pre);
        } catch (e) { err(name + '-record', e); }
        if (threw) throw threw;
        return r;
      };
    } catch (e) { err(name + '-wrap', e); }
  }

  function scholarKcal() { try { return ((Game.state || {}).scholar || {}).kcal || 0; } catch (e) { return 0; } }
  function plotInfo(plot) {
    const info = { pid: null, kcalNominal: null, units: null, origin: null, weeds: null, legacy: null, growthLeft: null };
    try {
      if (!plot) return info;
      info.pid = plot.pid || null;
      info.weeds = (typeof plot.weeds === 'number' ? plot.weeds : null);
      try { info.kcalNominal = Game.plotYieldKcal(plot); } catch (e) {}
      try { info.units = Game.gardenHarvestUnits(plot); } catch (e) {}
      try { info.origin = Game.gardenHarvestOrigin(plot); } catch (e) {}
      try { info.legacy = !!(Game.gardenCropProfile(plot) || {}).legacy; } catch (e) {}
      try { info.growthLeft = Game.gardenGrowthLeft(plot, dayOf(Game)); } catch (e) {}
    } catch (e) { err('plotInfo', e); }
    return info;
  }
  function personOcc(vid) {
    try {
      const p = (typeof Game.getPerson === 'function') ? Game.getPerson(vid) : null;
      return (p && (p.formerOccupation || null)) || null;
    } catch (e) { return null; }
  }

  // (1) gardenHarvestTaken — the kcal choke point. Pre-call reads are
  // essential: the call itself resets magicYield / lastHarvest.
  wrapMethod('gardenHarvestTaken', {
    pre: function (args) {
      return { day: dayOf(Game), stack: stackText(3), info: plotInfo(args[0]) };
    },
    post: function (args, r, threw, pre) {
      const info = (pre && pre.info) || {};
      t.harvests.push({
        day: (pre && pre.day) || dayOf(Game),
        pid: info.pid || null,
        path: classifyHarvestPath((pre && pre.stack) || ''),
        kcalNominal: (typeof info.kcalNominal === 'number' ? info.kcalNominal : null),
        units: (typeof info.units === 'number' ? info.units : null),
        origin: info.origin || null,
        weeds: info.weeds,
        legacy: !!info.legacy,
        growthLeft: info.growthLeft,
        threw: !!threw,
      });
    },
  });

  // (2) Actions.
  wrapMethod('harvestGarden', {
    pre: function (args) {
      let ripe = null;
      try { ripe = (Game.gardenPlots() || []).filter(function (p) { return Game.plotRipe(p, dayOf(Game)); }).length; } catch (e) {}
      return { day: dayOf(Game), stack: stackText(3), ripeBefore: ripe, harvestsBefore: t.harvests.length };
    },
    post: function (args, r, threw, pre) {
      t.actions.push({
        day: (pre && pre.day) || dayOf(Game), action: 'harvestGarden',
        path: classifyMethodPath((pre && pre.stack) || ''),
        ripeBefore: (pre && pre.ripeBefore),
        plotsTaken: t.harvests.length - ((pre && pre.harvestsBefore) || 0),
        threw: !!threw, retNull: (r === null || r === undefined),
      });
    },
  });
  wrapMethod('tendGarden', {
    pre: function (args) {
      let live = null;
      try { live = (Game.gardenPlots() || []).filter(function (p) { return p.pid && !p.dead; }).length; } catch (e) {}
      return { day: dayOf(Game), stack: stackText(3), liveBefore: live, kcalBefore: scholarKcal() };
    },
    post: function (args, r, threw, pre) {
      t.actions.push({
        day: (pre && pre.day) || dayOf(Game), action: 'tendGarden',
        path: classifyMethodPath((pre && pre.stack) || ''),
        liveBefore: (pre && pre.liveBefore),
        kcalPaid: Math.max(0, ((pre && pre.kcalBefore) || 0) - scholarKcal()),
        threw: !!threw, retNull: (r === null || r === undefined),
      });
    },
  });
  wrapMethod('makePlot', {
    pre: function (args) {
      let beds = null;
      try { beds = (Game.gardenPlots() || []).length; } catch (e) {}
      return { day: dayOf(Game), stack: stackText(3), bedsBefore: beds };
    },
    post: function (args, r, threw, pre) {
      let beds = null;
      try { beds = (Game.gardenPlots() || []).length; } catch (e) {}
      t.actions.push({
        day: (pre && pre.day) || dayOf(Game), action: 'makePlot',
        path: classifyMethodPath((pre && pre.stack) || ''),
        bedsBefore: (pre && pre.bedsBefore), bedsAfter: beds,
        ok: beds != null && (pre && pre.bedsBefore) != null && beds > pre.bedsBefore,
        threw: !!threw, retNull: (r === null || r === undefined),
      });
    },
  });
  wrapMethod('sowPlot', {
    pre: function (args) {
      let known = null, guide = null;
      try { known = (typeof Game.plantKnown === 'function') ? !!Game.plantKnown(args[0]) : null; } catch (e) {}
      try { guide = (typeof Game.guideForPlant === 'function') ? (Game.guideForPlant(args[0]) || null) : null; } catch (e) {}
      return { day: dayOf(Game), stack: stackText(3), pid: args[0] ? String(args[0]) : null, knownBefore: known, guide: guide };
    },
    post: function (args, r, threw, pre) {
      t.actions.push({
        day: (pre && pre.day) || dayOf(Game), action: 'sowPlot',
        path: classifyMethodPath((pre && pre.stack) || ''),
        pid: (pre && pre.pid) || null,
        guided: !!(pre && !pre.knownBefore && pre.guide),
        guide: (pre && pre.guide) || null,
        knownBefore: (pre && pre.knownBefore),
        ok: (r !== null && r !== undefined && r !== false),
        threw: !!threw, retNull: (r === null || r === undefined),
      });
    },
  });
  wrapMethod('cultivateGarden', {
    pre: function (args) {
      const vid = args[0] || null;
      let plan = null, magicBefore = 0;
      try { plan = (typeof Game.gardenMagicPlan === 'function') ? Game.gardenMagicPlan(vid) : null; } catch (e) {}
      try {
        const d = dayOf(Game);
        magicBefore = (Game.gardenPlots() || []).filter(function (p) { return p.pid && !p.dead && p.magicDay === d; }).length;
      } catch (e) {}
      return { day: dayOf(Game), stack: stackText(3), vid: vid, plan: plan, magicBefore: magicBefore };
    },
    post: function (args, r, threw, pre) {
      let magicAfter = 0;
      try {
        const d = dayOf(Game);
        magicAfter = (Game.gardenPlots() || []).filter(function (p) { return p.pid && !p.dead && p.magicDay === d; }).length;
      } catch (e) {}
      const plan = (pre && pre.plan) || null;
      t.actions.push({
        day: (pre && pre.day) || dayOf(Game), action: 'cultivateGarden',
        path: classifyMethodPath((pre && pre.stack) || ''),
        vid: (pre && pre.vid) || null,
        source: (plan && plan.source) || null,
        costKcal: (plan && plan.costKcal) || null,
        growth: (plan && plan.growth) || null,
        yieldMult: (plan && plan.yield) || null,
        bedsAffected: Math.max(0, magicAfter - ((pre && pre.magicBefore) || 0)),
        ok: (r !== false && r !== null && r !== undefined),
        threw: !!threw, retNull: (r === null || r === undefined),
      });
    },
  });
  wrapMethod('reclaimGarden', {
    pre: function (args) {
      let dead = null;
      try { dead = (Game.gardenPlots() || []).filter(function (p) { return p.dead; }).length; } catch (e) {}
      return { day: dayOf(Game), stack: stackText(3), vid: args[0] || null, deadBefore: dead };
    },
    post: function (args, r, threw, pre) {
      t.actions.push({
        day: (pre && pre.day) || dayOf(Game), action: 'reclaimGarden',
        path: classifyMethodPath((pre && pre.stack) || ''),
        vid: (pre && pre.vid) || null,
        deadBefore: (pre && pre.deadBefore),
        ok: (r === true),
        threw: !!threw, retNull: (r === null || r === undefined),
      });
    },
  });
  wrapMethod('gardenMaintain', {
    pre: function (args) {
      let throttle = null;
      try { throttle = (typeof Game.prodThrottleEngaged === 'function') ? !!Game.prodThrottleEngaged() : null; } catch (e) {}
      return { day: dayOf(Game), stack: stackText(3), vid: args[0] || null, throttle: throttle };
    },
    post: function (args, r, threw, pre) {
      t.actions.push({
        day: (pre && pre.day) || dayOf(Game), action: 'gardenMaintain',
        path: classifyMethodPath((pre && pre.stack) || ''),
        vid: (pre && pre.vid) || null,
        occ: (pre && pre.vid) ? personOcc(pre.vid) : null,
        plotsChanged: (typeof r === 'number' ? r : null),
        throttle: (pre && pre.throttle),
        threw: !!threw,
      });
    },
  });

  // (3) Teaching.
  wrapMethod('teachPlant', {
    pre: function (args) {
      return { day: dayOf(Game), stack: stackText(3), teacher: args[0] ? String(args[0]) : null, plant: args[1] ? String(args[1]) : null };
    },
    post: function (args, r, threw, pre) {
      let outcome = 'null';
      try {
        if (r === true) outcome = 'taught';
        else if (r === null || r === undefined) outcome = 'null';
        else if (typeof r === 'string') outcome = 'wrong:' + r.slice(0, 80);
        else if (r && typeof r === 'object') outcome = 'object:' + JSON.stringify(r).slice(0, 80);
        else outcome = String(r).slice(0, 80);
      } catch (e) { outcome = 'unreadable'; }
      t.teaches.push({
        day: (pre && pre.day) || dayOf(Game),
        teacher: (pre && pre.teacher) || null,
        plant: (pre && pre.plant) || null,
        outcome: outcome,
        path: classifyTeachPath((pre && pre.stack) || ''),
        threw: !!threw,
      });
    },
  });

  // (2b) Garden prep: cookFood / shellNuts on gardenShares items only.
  function prepItemSnap(inv, idx) {
    const it = inv && inv[idx];
    if (!it) return null;
    return { name: it.name || null, plantId: it.plantId || null, garden: !!it.gardenShares,
      foodState: it.foodState || null, kcalEach: (typeof it.kcalEach === 'number' ? it.kcalEach : null) };
  }
  wrapMethod('cookFood', {
    pre: function (args) {
      const inv = (Game.state && Game.state.scholar && Game.state.scholar.inventory) || [];
      return { day: dayOf(Game), stack: stackText(3), item: prepItemSnap(inv, args[0]) };
    },
    post: function (args, r, threw, pre) {
      if (pre && pre.item && pre.item.garden) {
        t.preps.push({ day: (pre && pre.day) || dayOf(Game), method: 'cookFood',
          path: classifyMethodPath((pre && pre.stack) || ''),
          pid: (pre.item.plantId || null), name: pre.item.name,
          threw: !!threw, retNull: (r === null || r === undefined) });
      }
    },
  });
  wrapMethod('shellNuts', {
    pre: function (args) {
      const inv = (args[1] && Array.isArray(args[1])) ? args[1] : ((Game.state && Game.state.scholar && Game.state.scholar.inventory) || []);
      return { day: dayOf(Game), stack: stackText(3), item: prepItemSnap(inv, args[0]) };
    },
    post: function (args, r, threw, pre) {
      if (pre && pre.item && pre.item.garden) {
        t.preps.push({ day: (pre && pre.day) || dayOf(Game), method: 'shellNuts',
          path: classifyMethodPath((pre && pre.stack) || ''),
          pid: (pre.item.plantId || null), name: pre.item.name,
          threw: !!threw, retNull: (r === null || r === undefined) });
      }
    },
  });

  // (4) Eating. Object-identity pre/post diff so gardenShares is
  // attributed exactly, even when two stacks share name/state/kcal.
  let _pendingEat = null;
  wrapMethod('eatOne', {
    pre: function (args) {
      const inv = (Game.state && Game.state.scholar && Game.state.scholar.inventory) || [];
      const it = inv[args[0]] || null;
      return { day: dayOf(Game), kcalBefore: scholarKcal(), item: it ? {
        name: it.name || null, plantId: it.plantId || null, garden: !!it.gardenShares,
        foodState: it.foodState || null, kcalEach: (typeof it.kcalEach === 'number' ? it.kcalEach : null),
        units: (typeof it.units === 'number' ? it.units : null),
      } : null };
    },
    post: function (args, r, threw, pre) {
      const ate = Math.max(0, scholarKcal() - ((pre && pre.kcalBefore) || 0));
      const rec = {
        day: (pre && pre.day) || dayOf(Game), via: 'eatOne',
        garden: !!(pre && pre.item && pre.item.garden),
        name: (pre && pre.item && pre.item.name) || null,
        plantId: (pre && pre.item && pre.item.plantId) || null,
        foodState: (pre && pre.item && pre.item.foodState) || null,
        kcalEach: (pre && pre.item && pre.item.kcalEach) || null,
        units: (pre && pre.item && pre.item.units) || null,
        ateKcal: ate, threw: !!threw,
      };
      t.eats.push(rec);
      _pendingEat = rec;
    },
  });
  wrapMethod('eat', {
    pre: function (args) {
      const inv = (Game.state && Game.state.scholar && Game.state.scholar.inventory) || [];
      const snap = new Map();
      try {
        for (const it of inv) {
          if (!it) continue;
          snap.set(it, { units: it.units || 0, garden: !!it.gardenShares, kcalEach: it.kcalEach || 0,
            name: it.name || null, plantId: it.plantId || null, foodState: it.foodState || null });
        }
      } catch (e) { err('eat-pre', e); }
      return { day: dayOf(Game), kcalBefore: scholarKcal(), snap: snap };
    },
    post: function (args, r, threw, pre) {
      const inv = (Game.state && Game.state.scholar && Game.state.scholar.inventory) || [];
      const after = new Map();
      try { for (const it of inv) after.set(it, it.units || 0); } catch (e) { err('eat-after', e); }
      try {
        for (const entry of (((pre && pre.snap) || new Map()).entries())) {
          const it = entry[0], s = entry[1];
          const left = after.has(it) ? after.get(it) : 0;
          const gone = Math.max(0, (s.units || 0) - left);
          if (!gone) continue;
          t.eats.push({
            day: (pre && pre.day) || dayOf(Game), via: 'eat',
            garden: !!s.garden, name: s.name, plantId: s.plantId,
            foodState: s.foodState, kcalEach: s.kcalEach, units: gone,
            ateKcal: Math.round(gone * (s.kcalEach || 0)), threw: !!threw,
          });
        }
      } catch (e) { err('eat-diff', e); }
    },
  });
  wrapMethod('tele', {
    pre: function (args) { return { type: args[0] }; },
    post: function (args, r, threw, pre) {
      try {
        if (args[0] === 'eat' && args[1] && typeof args[1].ateKcal === 'number') {
          if (_pendingEat) _pendingEat.teleAteKcal = args[1].ateKcal;
          t.eats.push({ day: dayOf(Game), via: 'tele-eat', garden: null, name: null, plantId: null,
            foodState: null, kcalEach: null, units: null, ateKcal: args[1].ateKcal,
            spoiled: !!args[1].spoiled, threw: false });
        }
      } catch (e) { err('tele-eat', e); }
    },
  });

  // (5) Village meal draw.
  wrapMethod('pantryDraw', {
    pre: function (args) {
      return { day: dayOf(Game), stack: stackText(3), cook: !!(args[2] && args[2].cook), want: args[1] };
    },
    post: function (args, r, threw, pre) {
      const byState = {};
      let cookedKcal = 0, gardenKcal = 0;
      try {
        for (const entry of ((r && r.items) || [])) {
          const it = entry.item || {};
          const st = it.foodState || 'none';
          const k = (entry.units || 0) * (entry.effectiveKcal || 0);
          byState[st] = (byState[st] || 0) + k;
          if (entry.cooked) cookedKcal += k;
          if (it.gardenShares) gardenKcal += k;
        }
      } catch (e) { err('pantryDraw-post', e); }
      t.draws.push({
        day: (pre && pre.day) || dayOf(Game),
        cook: !!(pre && pre.cook), want: (pre && typeof pre.want === 'number' ? pre.want : null),
        taken: (r && typeof r.taken === 'number' ? r.taken : null),
        byState: byState, cookedKcal: cookedKcal, gardenKcal: gardenKcal,
        caller: firstFrame((pre && pre.stack) || ''),
        threw: !!threw,
      });
    },
  });

  // (6) Deeds.
  wrapMethod('noteDeed', {
    pre: function (args) { return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      if (args[0] === 'gardening') {
        t.deeds.push({ day: (pre && pre.day) || dayOf(Game), deed: args[0], who: 'player' });
      }
    },
  });
  wrapMethod('creditDeed', {
    pre: function (args) { return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      if (args[1] === 'gardening') {
        t.deeds.push({ day: (pre && pre.day) || dayOf(Game), deed: args[1], who: args[0] || null });
      }
    },
  });

  // (8) Daily snapshot.
  function gardenKcalOf(items) {
    let total = 0; const byOrigin = {};
    try {
      for (const it of (items || [])) {
        if (!it || !it.gardenShares) continue;
        const k = (it.kcalEach || 0) * (it.units || 1);
        total += k;
        for (const key of Object.keys(it.gardenShares || {})) byOrigin[key] = (byOrigin[key] || 0) + k * (it.gardenShares[key] || 0);
      }
    } catch (e) { err('snap-gardenkcal', e); }
    return { total: total, byOrigin: byOrigin };
  }
  function snapshot() {
    const snap = { day: dayOf(Game) };
    try {
      snap.plots = gardenCap ? gardenCap.snapshotGarden(snap.day) : null;
    } catch (e) { snap.plots = null; err('snap-plots', e); }
    try {
      const v = (Game.state && Game.state.village) || {};
      snap.pantryGarden = gardenKcalOf(v.pantry || []);
      snap.pantryKcal = (v.pantry || []).reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0);
      snap.packGarden = gardenKcalOf((Game.state && Game.state.scholar && Game.state.scholar.inventory) || []);
      snap.scholarKcal = scholarKcal();
    } catch (e) { snap.pantryGarden = null; err('snap-stock', e); }
    try {
      // Scholar codex plant levels (gardenable forms only).
      snap.scholarPlants = {};
      const codexPlants = ((Game.state || {}).codex || {}).plants || {};
      const forms = {};
      try { for (const p of (Game.data.plants || [])) forms[p.id] = p.form; } catch (e) {}
      for (const pid of Object.keys(codexPlants)) {
        if (!['shoots', 'berries', 'roots'].includes(forms[pid])) continue;
        const lv = (codexPlants[pid] && codexPlants[pid].level) || 0;
        if (lv > 0) snap.scholarPlants[pid] = lv;
      }
    } catch (e) { snap.scholarPlants = null; err('snap-scholarplants', e); }
    try {
      // Gardeners: practice reps/steps, known-plants counts, magic held.
      snap.gardeners = {};
      const roster = (((Game.state || {}).village || {}).roster || []);
      for (const vid of roster) {
        try {
          const person = (typeof Game.getPerson === 'function') ? Game.getPerson(vid) : null;
          if (!person) continue;
          const practice = (person.practice || (person._src && person._src.practice) || {});
          const reps = practice.garden || 0;
          let steps = null;
          try { steps = (typeof Game.villagerPracticeSteps === 'function') ? Game.villagerPracticeSteps(person, 'garden') : null; } catch (e) {}
          let known = null;
          try { known = (typeof Game.villagerKnowsPlants === 'function') ? (Game.villagerKnowsPlants(vid) || []).length : null; } catch (e) {}
          let magic = null;
          try {
            const abs = ((Game.state.village || {}).npcAbilities || {})[vid] || [];
            const held = abs.filter(function (a) { return a && (a.id === 'green_thumb' || a.id === 'green_whisper' || a.id === 'cornucopia'); })
              .map(function (a) { return a.id + ':' + (a.level || 1); });
            if (held.length) magic = held;
          } catch (e) {}
          if (reps > 0 || known > 0 || magic) {
            snap.gardeners[vid] = { occ: person.formerOccupation || null, reps: reps, steps: steps, known: known, magic: magic };
          }
        } catch (e) {}
      }
      // Scholar magic held.
      try {
        const sAbs = ((Game.state || {}).scholar || {}).abilities || [];
        snap.scholarMagic = sAbs.filter(function (a) { return a && (a.id === 'green_thumb' || a.id === 'green_whisper' || a.id === 'cornucopia'); })
          .map(function (a) { return a.id + ':' + (a.level || 1); });
      } catch (e) { snap.scholarMagic = null; }
    } catch (e) { snap.gardeners = null; err('snap-gardeners', e); }
    try {
      // Garden-duty holders today (assignments), with occupation.
      const asg = ((Game.state || {}).village || {}).assignments || {};
      snap.gardenDuty = [];
      for (const vid of Object.keys(asg)) {
        if (asg[vid] && asg[vid].task === 'garden') {
          snap.gardenDuty.push({ vid: vid, occ: personOcc(vid) });
        }
      }
      snap.keeper = ((Game.state || {}).village || {}).gardenKeeper || null;
    } catch (e) { snap.gardenDuty = null; err('snap-duty', e); }
    try {
      // foodXp map (to show the gardener-task absence in the pilot).
      snap.foodXp = {};
      const roster = (((Game.state || {}).village || {}).roster || []);
      for (const vid of roster) {
        try {
          const person = (typeof Game.getPerson === 'function') ? Game.getPerson(vid) : null;
          const xp = person && (person.foodXp || (person._src && person._src.foodXp));
          if (xp && Object.keys(xp).length) snap.foodXp[vid] = Object.assign({}, xp);
        } catch (e) {}
      }
    } catch (e) { snap.foodXp = null; err('snap-foodxp', e); }
    try {
      // Cumulative inflow by name (inflow capture).
      const byName = {};
      for (const rec of ((inflow && inflow.inflows) || [])) {
        if ((rec.door === 'pantryAdd' && !rec.added) || (rec.kcal || 0) <= 0) continue;
        byName[rec.name || '?'] = (byName[rec.name || '?'] || 0) + (rec.kcal || 0);
      }
      snap.inflowByName = byName;
      snap.inflowCount = (inflow && inflow.inflows ? inflow.inflows.length : 0);
      snap.inflowTruncated = !!(inflow && inflow.inflowTruncated && inflow.inflowTruncated());
    } catch (e) { snap.inflowByName = null; err('snap-inflow', e); }
    t.daily.push(snap);
    return snap;
  }

  function uninstall() {
    Object.keys(wrapped).forEach(function (name) {
      try { Game[name] = wrapped[name]; } catch (e) { err('uninstall-' + name, e); }
    });
    try { if (inflow && inflow.uninstall) inflow.uninstall(); } catch (e) { err('uninstall-inflow', e); }
    // garden-capture ships no uninstall; its wraps stay on this Game
    // object, which is discarded after the seed (loadGame is per-seed).
  }

  return {
    t: t, snapshot: snapshot, uninstall: uninstall,
    gardenEvents: function () { return gardenCap ? gardenCap.events : null; },
    gardenCounters: function () { return gardenCap ? gardenCap.counters : null; },
    inflows: function () { return inflow ? inflow.inflows : null; },
    inflowTruncated: function () { return !!(inflow && inflow.inflowTruncated && inflow.inflowTruncated()); },
  };
}

module.exports = {
  install: install,
  classifyHarvestPath: classifyHarvestPath,
  classifyMethodPath: classifyMethodPath,
  classifyTeachPath: classifyTeachPath,
};
