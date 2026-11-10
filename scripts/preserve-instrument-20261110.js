// preserve-instrument-20261110.js — preservation first-numbers recorder
// (arm sim-preserve-a, run fleshout-20261110T2215Z). Scripts only, zero src/js.
//
// Records, per seed:
//   (1) SCHOLAR-FIRE PRESERVATION (preserveFood / renderFat /
//       makePemmican wraps): per-item pre/post snapshots with spoilDay,
//       kcalEach, foodState — net shelf-days gained per event, kcal in/out,
//       knows vs blind (solid vs rough), spoiled-refusals, about-to-rot
//       rescues (spoilDay - day <= 2).
//   (2) DUTY RACKS, EXACT (resolveOneAssignment wrap, cook task only):
//       pantry identity diff pre/post per cook resolution — converted
//       items (in-place + split stacks), kcal in/out, shelf gained,
//       about-to-rot kcal present/converted/left, racks-full signal
//       (computed rackCap vs preserved stock). Cross-checked against the
//       _haulcount tap (batches/kcal); the tap and the diff must agree.
//   (3) SPECIALIST (askSpecialist wrap): preserver jobs — task,
//       specialist id/occupation/skill, pre/post.
//   (4) TECHNIQUE LEARNS (learnTechnique wrap): rung + source.
//   (5) EATING (eatOne + eatStashOne + eat wraps + tele('eat') capture):
//       eaten kcal attributed by foodState — the preserved / rendered /
//       pemmican share. (Machinery as cookfirst-a.)
//   (6) VILLAGE MEAL (pantryDraw wrap): cook flag, kcal drawn by
//       foodState; drawn pantry objects are remembered (in-memory Set)
//       so the vanish classifier never mistakes a drawn stack for rot.
//   (7) DEEDS (noteDeed + creditDeed wraps): 'preserving' deeds only.
//   (8) DAILY SNAPSHOT: pantry roll by foodState (counts + kcal + min
//       spoilDay for preserved/rendered/pemmican), pack roll likewise,
//       scholar techniques, cook-duty holders (id/occupation/preserver
//       skill/foodXp), villager foodXp by task, _haulcount tap deltas,
//       pantry-object tracking (vanish events: spoiled-lost preserved
//       kcal, draw-reconciled).
//   (9) EXOGENOUS SOURCES: the river-trader gift creates 'preserved'
//       items without a transform (game.js:26994). No wrap covers it;
//       the snapshot series shows the stock jump and the say sample
//       carries the gift line. It is counted as stock, never as a
//       transform — the analyzer must not attribute it to any method.
//
// All wraps are record-only: call the original, return its value
// unchanged, never alter state, never consume RNG. Any failure in the
// RECORDING path is logged to instrumentErrors, never thrown into the
// game.
//
// KNOWN WRAP RISK (secondlink-a / diplo-a / cookfirst-a lesson): a wrap
// records nothing if the engine calls the closure instead of the Game
// method. The proof (scripts/test-preserve-a.js) verifies EACH wrapped
// method's call path is live on a fixture or live miniature; a wrap
// with no live call observed is marked dead in the evidence and its
// zero is never treated as evidence. The resolveOneAssignment wrap is
// the duty backstop: if the _haulcount tap ever disagrees with it, the
// tap is the suspect, not the diff.
//
// Usage: const PI = require('./preserve-instrument-20261110');
//   const pi = PI.install(Game); pi.snapshot(); ... pi.uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function stackText(skip) {
  try { return (new Error().stack || '').split('\n').slice(skip || 0).join(' | '); } catch (e) { return ''; }
}

// First engine frame in the stack (after the wrap + this helper).
function firstFrame(stack) {
  try {
    const lines = String(stack || '').split(' | ');
    for (const ln of lines) {
      if (ln.indexOf('preserve-instrument') !== -1) continue;
      const m = ln.match(/at (\S+)/);
      if (m && m[1] !== 'Object.<anonymous>') return m[1];
    }
    return null;
  } catch (e) { return null; }
}

// Caller-path classification for a direct method call (preserveFood etc.).
// Distinguishes the policy's own calls from engine-internal ones by the
// first non-instrument frame: policy files live under scripts/policies/.
function classifyMethodPath(stack) {
  if (!stack) return 'unknown';
  if (stack.indexOf('scripts/policies') !== -1 || stack.indexOf('policies/') !== -1) return 'policy';
  if (stack.indexOf('askSpecialist') !== -1) return 'specialist';
  if (stack.indexOf('pantryDraw') !== -1) return 'village-meal';
  if (stack.indexOf('cookAll') !== -1) return 'batch';
  return 'internal';
}

function itemSnap(it) {
  if (!it) return null;
  return {
    name: it.name || null, foodKind: it.foodKind || null,
    foodState: it.foodState || null, plantId: it.plantId || null,
    kcalEach: (typeof it.kcalEach === 'number' ? it.kcalEach : null),
    units: (typeof it.units === 'number' ? it.units : null),
    rawKcal: (typeof it.rawKcal === 'number' ? it.rawKcal : null),
    hiddenKcal: (typeof it.hiddenKcal === 'number' ? it.hiddenKcal : null),
    spoilDay: (typeof it.spoilDay === 'number' ? it.spoilDay : null),
    needsCooking: !!it.needsCooking, undercooked: !!it.undercooked,
    burnt: !!it.burnt, safe: it.safe === true,
  };
}

function containerRoll(inv) {
  const roll = {};
  try {
    for (const it of (inv || [])) {
      if (!it) continue;
      const st = it.foodState || 'none';
      const k = (it.kcalEach || 0) * (it.units || 0);
      const e = roll[st] || (roll[st] = { count: 0, units: 0, kcal: 0, minSpoilDay: null });
      e.count++; e.units += (it.units || 0); e.kcal += k;
      if (typeof it.spoilDay === 'number' && it.spoilDay < 9999) {
        if (e.minSpoilDay === null || it.spoilDay < e.minSpoilDay) e.minSpoilDay = it.spoilDay;
      }
    }
  } catch (e) {}
  return roll;
}

function install(Game) {
  const t = {
    methodCalls: [], // {day, method, path, actor, pre, post, spoiledRefused, rescuedKcal, shelfGained, kcalIn, kcalOut, ...}
    dutyResolutions: [], // {day, vid, occ, skill, converted[], batches, kcalIn, kcalOut, shelfGained, aboutToRotBefore, aboutToRotAfter, racksFull, rackCap, preservedKcalPre}
    learns: [], // {day, tech, source, via}
    eats: [], // {day, via, foodState, kcalEach, units, ateKcal, purgedKcal}
    draws: [], // {day, cook, want, taken, byState, cookedKcal, caller}
    deeds: [], // {day, deed, who}
    daily: [], // snapshots
    vanishes: [], // {day, state, kcal, spoilDay, drawn, spoiledLost}
    instrumentErrors: [],
    wrapLive: {}, // name -> true once a wrapped call is observed live
    sayLines: [],
  };
  const wrapped = {};
  let _pendingEat = null; // eatOne record awaiting its tele('eat')
  let _lastHaul = { batches: 0, kcal: 0 };
  // In-memory only, never serialized: pantry objects the village meal drew
  // (so a drawn stack vanishing is never mistaken for rot), and the pantry
  // object tracker (last-seen state per object identity).
  const drawnObjects = new Set();
  const pantryObjects = new Map();

  function err(site, e) {
    try { t.instrumentErrors.push(site + ': ' + String((e && e.message) || e).slice(0, 120)); } catch (e2) {}
  }

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

  function spoiledOf(Game, it) {
    try { return !!(it && Game.isSpoiled && Game.isSpoiled(it)); } catch (e) { return false; }
  }
  function rescuedKcalOf(day, it) {
    try {
      if (!it || typeof it.spoilDay !== 'number') return 0;
      const left = it.spoilDay - day;
      if (left <= 2 && left > 0) return (it.kcalEach || 0) * (it.units || 0);
      return 0;
    } catch (e) { return 0; }
  }
  function containerOf(args, idx) {
    try {
      const c = args[idx];
      if (Array.isArray(c)) return c;
      return (Game.state && Game.state.scholar && Game.state.scholar.inventory) || [];
    } catch (e) { return []; }
  }

  // (1) Per-item / batch preservation methods: preserveFood + renderFat.
  // Both take (idx?, container?) and transform MULTIPLE items when idx is
  // undefined, so the pre/post record is a whole-container identity diff,
  // not a single index. Items that vanish are spoiled-refusals (the engine
  // splices rotten items honestly); items whose foodState becomes
  // 'preserved'/'rendered' are conversions with net shelf gained.
  // inKcalOf: the input energy of an item. Raw fat carries kcalEach 0 with
  // the real value in hiddenKcal (renderFat's input IS hiddenKcal); cleaned
  // meat's input is its kcalEach (its hiddenKcal is the butcher gross,
  // which would overstate the smoke's input).
  function preserveMethod(name, outState, inKcalOf) {
    wrapMethod(name, {
      pre: function (args) {
        const inv = containerOf(args, 1);
        const map = new Map();
        try {
          for (const it of inv) {
            if (it) map.set(it, itemSnap(it));
          }
        } catch (e) { err(name + '-premap', e); }
        return { day: dayOf(Game), stack: stackText(3), map: map, idx: args[0] };
      },
      post: function (args, r, threw, pre) {
        const day = (pre && pre.day) || dayOf(Game);
        const inv = containerOf(args, 1);
        const converted = [];
        let refusedKcal = 0, refusedN = 0;
        try {
          const seen = new Set(inv);
          // Vanished items = spoiled refusals (spliced by the engine).
          if (pre && pre.map) {
            for (const entry of pre.map) {
              const it = entry[0], snap = entry[1];
              if (!seen.has(it)) {
                refusedN++;
                refusedKcal += (snap.kcalEach || 0) * (snap.units || 0);
              }
            }
          }
          // Converted items: same object, new foodState.
          if (pre && pre.map) {
            for (const it of inv) {
              if (!it || !pre.map.has(it)) continue;
              const snap = pre.map.get(it);
              if (it.foodState === outState && snap.foodState !== outState) {
                const kcalIn = inKcalOf(snap);
                const kcalOut = (it.kcalEach || 0) * (it.units || 0);
                converted.push({
                  name: snap.name, foodKind: snap.foodKind,
                  fromState: snap.foodState,
                  kcalIn: kcalIn, kcalOut: kcalOut,
                  spoilDayBefore: snap.spoilDay, spoilDayAfter: it.spoilDay,
                  shelfGained: (typeof it.spoilDay === 'number' && typeof snap.spoilDay === 'number')
                    ? (it.spoilDay - snap.spoilDay) : null,
                  rescuedKcal: rescuedKcalOf(day, snap),
                  units: it.units || 0,
                });
              }
            }
          }
        } catch (e) { err(name + '-diff', e); }
        let kcalIn = 0, kcalOut = 0, shelfGained = 0, rescuedKcal = 0;
        for (const c of converted) {
          kcalIn += c.kcalIn; kcalOut += c.kcalOut;
          if (typeof c.shelfGained === 'number') shelfGained += c.shelfGained;
          rescuedKcal += c.rescuedKcal;
        }
        t.methodCalls.push({
          day: day, method: name,
          path: classifyMethodPath((pre && pre.stack) || ''),
          converted: converted, convertedN: converted.length,
          kcalIn: kcalIn, kcalOut: kcalOut,
          shelfGained: shelfGained, rescuedKcal: rescuedKcal,
          spoiledRefused: refusedN > 0, refusedN: refusedN, refusedKcal: refusedKcal,
          threw: !!threw, retNull: (r === null || r === undefined),
        });
      },
    });
  }
  preserveMethod('preserveFood', 'preserved', function (snap) { return (snap.kcalEach || 0) * (snap.units || 0); });
  preserveMethod('renderFat', 'rendered', function (snap) { return ((snap.hiddenKcal || snap.kcalEach) || 0) * (snap.units || 0); });

  // makePemmican: count new pemmican bars by object identity, and read the
  // plan (pure preview, no state change, no RNG) for per-set inKcal and
  // the inputs' remaining shelf — the net shelf gained per set.
  wrapMethod('makePemmican', {
    pre: function (args) {
      const inv = containerOf(args, 0);
      let plan = null;
      try { plan = (typeof Game.pemmicanPlan === 'function') ? Game.pemmicanPlan(inv) : null; } catch (e) { err('makePemmican-plan', e); }
      const sets = [];
      try {
        for (const s of (plan || [])) {
          let minSpoil = null, inKcal = s.inKcal || 0;
          for (const p of (s.picks || [])) {
            if (p.it && typeof p.it.spoilDay === 'number' && p.it.spoilDay < 9999) {
              if (minSpoil === null || p.it.spoilDay < minSpoil) minSpoil = p.it.spoilDay;
            }
          }
          sets.push({ bars: s.bars, kcalEach: s.kcalEach, inKcal: inKcal, minInputSpoilDay: minSpoil });
        }
      } catch (e) { err('makePemmican-sets', e); }
      return { day: dayOf(Game), stack: stackText(3), before: new Set(inv), beforeRoll: containerRoll(inv), sets: sets };
    },
    post: function (args, r, threw, pre) {
      const day = (pre && pre.day) || dayOf(Game);
      const inv = containerOf(args, 0);
      let bars = 0, barKcal = 0;
      try {
        for (const it of inv) {
          if (pre && pre.before && !pre.before.has(it) && it && it.foodState === 'pemmican') {
            bars += (it.units || 0); barKcal += (it.kcalEach || 0) * (it.units || 0);
          }
        }
      } catch (e) { err('makePemmican-diff', e); }
      let inKcal = 0, shelfGained = 0;
      try {
        for (const s of ((pre && pre.sets) || [])) {
          inKcal += s.inKcal || 0;
          // Net shelf gained per set: 120 days from today minus the
          // shortest remaining shelf among the inputs.
          if (typeof s.minInputSpoilDay === 'number') shelfGained += 120 - (s.minInputSpoilDay - day);
        }
      } catch (e) { err('makePemmican-shelf', e); }
      t.methodCalls.push({
        day: day, method: 'makePemmican',
        path: classifyMethodPath((pre && pre.stack) || ''),
        pre: (pre && pre.beforeRoll) || null, post: containerRoll(inv),
        sets: (pre && pre.sets) || [],
        bars: bars, barKcal: barKcal, kcalIn: inKcal, kcalOut: barKcal,
        shelfGained: shelfGained, rescuedKcal: 0,
        spoiledRefused: false, refusedN: 0, refusedKcal: 0,
        threw: !!threw, retNull: (r === null || r === undefined),
      });
    },
  });

  // askSpecialist: who preserved what, at what skill.
  wrapMethod('askSpecialist', {
    pre: function (args) {
      const inv = containerOf(args, 2);
      const it = inv[args[1]];
      let task = args[3] || null; // forceTask wins, exactly as the engine reads it
      try {
        if (!task && it) {
          if (it.foodState === 'carcass') task = 'butcher';
          else if (it.foodKind === 'meat' && (it.foodState === 'cleaned' || it.foodState === 'cooked')) task = 'preserver';
          else if (it.rawKcal || it.needsCooking || (it.foodKind === 'meat' && it.foodState === 'cleaned')) task = 'cook';
        }
      } catch (e) {}
      let skill = null, occ = null;
      try {
        const ppl = (typeof Game.villagePeople === 'function') ? Game.villagePeople() : [];
        const person = ppl.find(function (p) { return p && p.id === args[0]; });
        if (person && task) {
          const skTask = task === 'butcher' ? 'butcher' : task === 'preserver' ? 'preserver' : 'cook';
          skill = (typeof Game.specialistSkill === 'function') ? Game.specialistSkill(person, skTask) : null;
          occ = person.formerOccupation || null;
        }
      } catch (e) { err('askSpecialist-skill', e); }
      return { day: dayOf(Game), stack: stackText(3), pre: itemSnap(it), task: task, skill: skill, occ: occ, vid: args[0] };
    },
    post: function (args, r, threw, pre) {
      const day = (pre && pre.day) || dayOf(Game);
      const inv = containerOf(args, 2);
      const post = itemSnap(inv[args[1]]);
      let shelfGained = null, kcalIn = null, kcalOut = null, rescuedKcal = 0;
      try {
        if (pre && pre.pre && post) {
          kcalIn = (pre.pre.kcalEach || 0) * (pre.pre.units || 0);
          kcalOut = (post.kcalEach || 0) * (post.units || 0);
          if (typeof post.spoilDay === 'number' && typeof pre.pre.spoilDay === 'number') {
            shelfGained = post.spoilDay - pre.pre.spoilDay;
          }
          rescuedKcal = rescuedKcalOf(day, pre.pre);
        }
      } catch (e) { err('askSpecialist-shelf', e); }
      t.methodCalls.push({
        day: day, method: 'askSpecialist',
        path: 'specialist',
        specialistId: (pre && pre.vid) || null,
        specialistOcc: (pre && pre.occ) || null,
        specialistSkill: (pre && typeof pre.skill === 'number' ? pre.skill : null),
        task: (pre && pre.task) || null,
        pre: (pre && pre.pre) || null, post: post,
        kcalIn: kcalIn, kcalOut: kcalOut, shelfGained: shelfGained, rescuedKcal: rescuedKcal,
        spoiledRefused: false, refusedN: 0, refusedKcal: 0,
        threw: !!threw, retNull: (r === null || r === undefined),
      });
    },
  });

  // (2) DUTY RACKS, EXACT — resolveOneAssignment wrap (cook task only).
  // The cook branch never recurses (the only recursion in this function is
  // the prod-throttle redirect for forage/garden/fish), so one wrap call
  // is one resolution.
  wrapMethod('resolveOneAssignment', {
    pre: function (args) {
      const a = args[1] || {};
      if (a.task !== 'cook') return null;
      const day = dayOf(Game);
      const v = (Game.state && Game.state.village) || {};
      const pantry = v.pantry || [];
      const map = new Map();
      try {
        for (const it of pantry) { if (it) map.set(it, itemSnap(it)); }
      } catch (e) { err('duty-premap', e); }
      let preservedKcalPre = 0, aboutToRotBefore = 0;
      try {
        for (const it of pantry) {
          if (!it) continue;
          const k = (it.kcalEach || 0) * (it.units || 0);
          if (it.foodState === 'preserved' || it.foodState === 'rendered') preservedKcalPre += k;
          if (aboutToRot(it, day)) aboutToRotBefore += k;
        }
      } catch (e) { err('duty-precalc', e); }
      let skill = null, occ = null;
      try {
        const person = (typeof Game.getPerson === 'function') ? Game.getPerson(args[0]) : null;
        if (person) {
          occ = person.formerOccupation || null;
          skill = (typeof Game.specialistSkill === 'function') ? Game.specialistSkill(person, 'preserver') : null;
        }
      } catch (e) { err('duty-skill', e); }
      let rackCap = null, racksFull = null;
      try {
        const rosterN = ((v.roster || []).length || 10);
        const ownShelf = (skill > 0) ? (30 + 5 * skill) : 15;
        rackCap = 125 * rosterN * Math.max(1, ownShelf - 2);
        racksFull = preservedKcalPre >= rackCap;
      } catch (e) { err('duty-cap', e); }
      const hcBefore = { batches: 0, kcal: 0 };
      try {
        const hc = Game._haulcount || { villagerPreserveBatches: 0, villagerPreserveKcal: 0 };
        hcBefore.batches = hc.villagerPreserveBatches || 0;
        hcBefore.kcal = hc.villagerPreserveKcal || 0;
      } catch (e) {}
      return { day: day, vid: args[0], occ: occ, skill: skill, map: map,
        preservedKcalPre: preservedKcalPre, aboutToRotBefore: aboutToRotBefore,
        rackCap: rackCap, racksFull: racksFull, hcBefore: hcBefore };
    },
    post: function (args, r, threw, pre) {
      if (!pre) return;
      const day = pre.day;
      const v = (Game.state && Game.state.village) || {};
      const pantry = v.pantry || [];
      const converted = [];
      let aboutToRotAfter = 0;
      try {
        for (const it of pantry) {
          if (!it) continue;
          if (aboutToRot(it, day)) aboutToRotAfter += (it.kcalEach || 0) * (it.units || 0);
        }
      } catch (e) { err('duty-postcalc', e); }
      try {
        const seen = new Set(pantry);
        // In-place conversions: same object, new foodState.
        for (const it of pantry) {
          if (!it || !pre.map.has(it)) continue;
          const snap = pre.map.get(it);
          if (it.foodState === 'preserved' && snap.foodState !== 'preserved') {
            const kcalIn = (snap.kcalEach || 0) * (snap.units || 0);
            const kcalOut = (it.kcalEach || 0) * (it.units || 0);
            converted.push({
              name: snap.name, foodKind: snap.foodKind, split: false,
              fromState: snap.foodState,
              kcalIn: kcalIn, kcalOut: kcalOut,
              spoilDayBefore: snap.spoilDay, spoilDayAfter: it.spoilDay,
              shelfGained: (typeof it.spoilDay === 'number' && typeof snap.spoilDay === 'number')
                ? (it.spoilDay - snap.spoilDay) : null,
              rescuedKcal: rescuedKcalOf(day, snap),
              units: it.units || 0,
            });
          }
        }
        // Split-stack conversions: a NEW object whose name is a pre item's
        // name + ' (smoked)' / ' (dried)'. kcalIn is estimated from the
        // matched pre item's per-unit kcal (the engine copies the stack,
        // then converts the copy — same per-unit value pre-conversion).
        for (const it of pantry) {
          if (!it || pre.map.has(it)) continue;
          if (it.foodState !== 'preserved') continue;
          const nm = String(it.name || '');
          let match = null;
          for (const entry of pre.map) {
            const snap = entry[1];
            if (!snap || !snap.name) continue;
            if (nm === snap.name + ' (smoked)' || nm === snap.name + ' (dried)') { match = snap; break; }
          }
          if (!match) continue;
          const kcalIn = (match.kcalEach || 0) * (it.units || 0);
          const kcalOut = (it.kcalEach || 0) * (it.units || 0);
          converted.push({
            name: match.name, foodKind: match.foodKind, split: true,
            fromState: match.foodState,
            kcalIn: kcalIn, kcalOut: kcalOut,
            spoilDayBefore: match.spoilDay, spoilDayAfter: it.spoilDay,
            shelfGained: (typeof it.spoilDay === 'number' && typeof match.spoilDay === 'number')
              ? (it.spoilDay - match.spoilDay) : null,
            rescuedKcal: rescuedKcalOf(day, match),
            units: it.units || 0,
          });
        }
        // Keep the pantry-object tracker honest: split copies are new
        // objects the snapshot will see next time; nothing to do here.
        void seen;
      } catch (e) { err('duty-diff', e); }
      let kcalIn = 0, kcalOut = 0, shelfGained = 0, rescuedKcal = 0;
      for (const c of converted) {
        kcalIn += c.kcalIn; kcalOut += c.kcalOut;
        if (typeof c.shelfGained === 'number') shelfGained += c.shelfGained;
        rescuedKcal += c.rescuedKcal;
      }
      let tapBatches = 0, tapKcal = 0;
      try {
        const hc = Game._haulcount || { villagerPreserveBatches: 0, villagerPreserveKcal: 0 };
        tapBatches = (hc.villagerPreserveBatches || 0) - (pre.hcBefore.batches || 0);
        tapKcal = (hc.villagerPreserveKcal || 0) - (pre.hcBefore.kcal || 0);
      } catch (e) { err('duty-tap', e); }
      t.dutyResolutions.push({
        day: day, vid: pre.vid, occ: pre.occ, skill: pre.skill,
        converted: converted, batches: converted.length,
        kcalIn: kcalIn, kcalOut: kcalOut,
        shelfGained: shelfGained, rescuedKcal: rescuedKcal,
        aboutToRotBefore: pre.aboutToRotBefore, aboutToRotAfter: aboutToRotAfter,
        leftToRot: Math.max(0, aboutToRotAfter),
        racksFull: pre.racksFull, rackCap: pre.rackCap,
        preservedKcalPre: pre.preservedKcalPre,
        tapBatches: tapBatches, tapKcal: tapKcal,
        tapAgrees: (tapBatches === converted.length && tapKcal === kcalOut),
        threw: !!threw,
      });
    },
  });

  // About-to-rot, same shape as the engine's duty eligibility (spoilDay
  // within 2 days, not already spoiled, not already preserved/rendered,
  // real kcal). Bonded/keepsake items are rare in the pantry; the wrap
  // does not replicate those two exclusions and says so in the evidence.
  function aboutToRot(it, day) {
    try {
      if (!it || (it.kcalEach || 0) <= 0 || (it.units || 0) <= 0) return false;
      if (it.foodState === 'preserved' || it.foodState === 'rendered') return false;
      if ((it.foodKind || '') === 'pemmican') return false;
      const sd = it.spoilDay;
      if (sd === undefined || sd === null || sd >= 9999) return false;
      if (spoiledOf(Game, it)) return false;
      if (sd - day > 2) return false;
      return true;
    } catch (e) { return false; }
  }

  // (4) Technique learns.
  wrapMethod('learnTechnique', {
    pre: function (args) { return { day: dayOf(Game), stack: stackText(3) }; },
    post: function (args, r, threw, pre) {
      t.learns.push({
        day: (pre && pre.day) || dayOf(Game), tech: args[0] || null,
        source: args[1] || null, learned: r === true,
        via: firstFrame((pre && pre.stack) || ''),
      });
    },
  });

  // (5) Eating. tele('eat') is captured below; the kcal delta on the
  // scholar is the robust attribution (tele carries no foodState).
  function scholarKcal() { try { return ((Game.state || {}).scholar || {}).kcal || 0; } catch (e) { return 0; } }
  wrapMethod('eatOne', {
    pre: function (args) {
      const inv = (Game.state && Game.state.scholar && Game.state.scholar.inventory) || [];
      return { day: dayOf(Game), kcalBefore: scholarKcal(), item: itemSnap(inv[args[0]]) };
    },
    post: function (args, r, threw, pre) {
      const ate = Math.max(0, scholarKcal() - ((pre && pre.kcalBefore) || 0));
      const rec = {
        day: (pre && pre.day) || dayOf(Game), via: 'eatOne',
        foodState: (pre && pre.item && pre.item.foodState) || null,
        foodKind: (pre && pre.item && pre.item.foodKind) || null,
        name: (pre && pre.item && pre.item.name) || null,
        kcalEach: (pre && pre.item && pre.item.kcalEach) || null,
        ateKcal: ate, threw: !!threw,
      };
      t.eats.push(rec);
      _pendingEat = rec;
    },
  });
  wrapMethod('eatStashOne', {
    pre: function (args) {
      let stash = [];
      try { stash = (typeof Game.prepStash === 'function') ? Game.prepStash() : []; } catch (e) {}
      return { day: dayOf(Game), kcalBefore: scholarKcal(), item: itemSnap(stash[args[0]]) };
    },
    post: function (args, r, threw, pre) {
      const ate = Math.max(0, scholarKcal() - ((pre && pre.kcalBefore) || 0));
      const rec = {
        day: (pre && pre.day) || dayOf(Game), via: 'eatStashOne',
        foodState: (pre && pre.item && pre.item.foodState) || null,
        foodKind: (pre && pre.item && pre.item.foodKind) || null,
        name: (pre && pre.item && pre.item.name) || null,
        kcalEach: (pre && pre.item && pre.item.kcalEach) || null,
        ateKcal: ate, threw: !!threw,
      };
      t.eats.push(rec);
      _pendingEat = rec;
    },
  });
  wrapMethod('eat', {
    pre: function (args) {
      const inv = (Game.state && Game.state.scholar && Game.state.scholar.inventory) || [];
      const snap = inv.map(function (it) {
        return { it: it, key: (it.name || '') + '|' + (it.foodState || '') + '|' + (it.kcalEach || 0), units: it.units || 0, spoiled: spoiledOf(Game, it), foodState: it.foodState || null, kcalEach: it.kcalEach || 0 };
      });
      return { day: dayOf(Game), kcalBefore: scholarKcal(), snap: snap };
    },
    post: function (args, r, threw, pre) {
      const inv = (Game.state && Game.state.scholar && Game.state.scholar.inventory) || [];
      const after = {};
      try {
        for (const it of inv) {
          const k = (it.name || '') + '|' + (it.foodState || '') + '|' + (it.kcalEach || 0);
          after[k] = (after[k] || 0) + (it.units || 0);
        }
      } catch (e) { err('eat-after', e); }
      const ate = Math.max(0, scholarKcal() - ((pre && pre.kcalBefore) || 0));
      let purgedKcal = 0;
      try {
        for (const s of ((pre && pre.snap) || [])) {
          const left = after[s.key] || 0;
          const gone = Math.max(0, (s.units || 0) - left);
          if (!gone) continue;
          if (s.spoiled) { purgedKcal += gone * (s.kcalEach || 0); continue; }
          t.eats.push({
            day: (pre && pre.day) || dayOf(Game), via: 'eat',
            foodState: s.foodState, foodKind: null, name: s.key.split('|')[0] || null,
            kcalEach: s.kcalEach, units: gone,
            ateKcal: Math.round(gone * (s.kcalEach || 0)), threw: !!threw,
          });
        }
      } catch (e) { err('eat-diff', e); }
      if (purgedKcal > 0) {
        t.eats.push({ day: (pre && pre.day) || dayOf(Game), via: 'eat-purge', foodState: null, foodKind: null, name: null, kcalEach: null, units: null, ateKcal: 0, purgedKcal: purgedKcal, threw: !!threw });
      }
    },
  });

  // tele('eat') capture: reconciles the wrap attribution against the
  // engine's own ateKcal.
  wrapMethod('tele', {
    pre: function (args) { return { type: args[0] }; },
    post: function (args, r, threw, pre) {
      try {
        if (args[0] === 'eat' && args[1] && typeof args[1].ateKcal === 'number') {
          if (_pendingEat) _pendingEat.teleAteKcal = args[1].ateKcal;
          t.eats.push({ day: dayOf(Game), via: 'tele-eat', foodState: null, foodKind: null, name: null, kcalEach: null, units: null, ateKcal: args[1].ateKcal, spoiled: !!args[1].spoiled, threw: false });
        }
      } catch (e) { err('tele-eat', e); }
    },
  });

  // (6) Village meal draw.
  wrapMethod('pantryDraw', {
    pre: function (args) {
      const v = args[0] || {};
      const byObj = new Map();
      try {
        for (const it of (v.pantry || [])) byObj.set(it, it.foodState || null);
      } catch (e) { err('pantryDraw-pre', e); }
      return { day: dayOf(Game), stack: stackText(3), byObj: byObj, cook: !!(args[2] && args[2].cook), want: args[1] };
    },
    post: function (args, r, threw, pre) {
      const byState = {};
      let cookedKcal = 0;
      try {
        for (const entry of ((r && r.items) || [])) {
          let st;
          if (pre && pre.byObj && pre.byObj.has(entry.item)) st = pre.byObj.get(entry.item) || 'none';
          else st = (entry.item && entry.item.foodState) || 'unknown';
          const k = (entry.units || 0) * (entry.effectiveKcal || 0);
          byState[st] = (byState[st] || 0) + k;
          if (entry.cooked) cookedKcal += k;
          // Remember the drawn object so the vanish classifier never
          // mistakes a drawn stack for rot.
          try { if (entry.item) drawnObjects.add(entry.item); } catch (e) {}
        }
      } catch (e) { err('pantryDraw-post', e); }
      t.draws.push({
        day: (pre && pre.day) || dayOf(Game),
        cook: !!(pre && pre.cook), want: (pre && typeof pre.want === 'number' ? pre.want : null),
        taken: (r && typeof r.taken === 'number' ? r.taken : null),
        byState: byState, cookedKcal: cookedKcal,
        caller: firstFrame((pre && pre.stack) || ''),
        threw: !!threw,
      });
    },
  });

  // (7) Deeds — 'preserving' only.
  wrapMethod('noteDeed', {
    pre: function (args) { return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      if (args[0] === 'preserving') {
        t.deeds.push({ day: (pre && pre.day) || dayOf(Game), deed: args[0], who: 'player' });
      }
    },
  });
  wrapMethod('creditDeed', {
    pre: function (args) { return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      if (args[1] === 'preserving') {
        t.deeds.push({ day: (pre && pre.day) || dayOf(Game), deed: args[1], who: args[0] || null });
      }
    },
  });

  // (8) Daily snapshot + pantry-object tracking.
  function snapshot() {
    const snap = { day: dayOf(Game) };
    try {
      const v = (Game.state && Game.state.village) || {};
      snap.pantry = containerRoll(v.pantry || []);
      snap.pantryKcal = Object.keys(snap.pantry).reduce(function (a, k) { return a + (snap.pantry[k].kcal || 0); }, 0);
      snap.spoiledPresentKcal = 0;
      try {
        for (const it of (v.pantry || [])) {
          if (it && Game.isSpoiled && Game.isSpoiled(it)) snap.spoiledPresentKcal += (it.kcalEach || 0) * (it.units || 0);
        }
      } catch (e) {}
      snap.scholarKcal = scholarKcal();
      snap.pack = containerRoll((Game.state && Game.state.scholar && Game.state.scholar.inventory) || []);
    } catch (e) { snap.pantry = null; err('snap-pantry', e); }
    try {
      snap.techniques = Object.assign({}, ((Game.state || {}).codex || {}).techniques || {});
    } catch (e) { snap.techniques = null; err('snap-tech', e); }
    try {
      const asg = ((Game.state || {}).village || {}).assignments || {};
      snap.cookDuty = [];
      for (const vid of Object.keys(asg)) {
        if (asg[vid] && asg[vid].task === 'cook') {
          let occ = null, preserver = null, foodXp = null;
          try {
            const person = (typeof Game.getPerson === 'function') ? Game.getPerson(vid) : null;
            if (person) {
              occ = person.formerOccupation || null;
              preserver = (typeof Game.specialistSkill === 'function') ? Game.specialistSkill(person, 'preserver') : null;
              foodXp = person.foodXp || (person._src && person._src.foodXp) || null;
            }
          } catch (e) {}
          snap.cookDuty.push({ vid: vid, occ: occ, preserver: preserver, foodXp: foodXp });
        }
      }
    } catch (e) { snap.cookDuty = null; err('snap-duty', e); }
    try {
      // foodXp movers: every roster person, task XP (small roster).
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
      const hc = Game._haulcount || { villagerPreserveBatches: 0, villagerPreserveKcal: 0 };
      snap.dutyBatches = (hc.villagerPreserveBatches || 0) - _lastHaul.batches;
      snap.dutyKcal = (hc.villagerPreserveKcal || 0) - _lastHaul.kcal;
      snap.dutyCumBatches = hc.villagerPreserveBatches || 0;
      snap.dutyCumKcal = hc.villagerPreserveKcal || 0;
      _lastHaul = { batches: hc.villagerPreserveBatches || 0, kcal: hc.villagerPreserveKcal || 0 };
    } catch (e) { snap.dutyBatches = null; err('snap-haul', e); }
    // Pantry-object tracking: vanish classification. An object that was
    // here at the last snapshot and is gone now, with spoilDay <= today
    // and a preserved-family state, and NEVER drawn by pantryDraw, is
    // spoiled-lost. (Drawn objects are excluded via the persistent
    // drawnObjects set; a partially-drawn-then-rotted stack is therefore
    // counted as drawn, not lost — a known, small undercount, recorded
    // in the evidence.)
    try {
      const v = (Game.state && Game.state.village) || {};
      const pantry = v.pantry || [];
      const present = new Set(pantry);
      let lostKcal = 0, lostDrawnKcal = 0, lostRawKcal = 0, lostN = 0;
      for (const entry of pantryObjects) {
        const obj = entry[0], last = entry[1];
        if (present.has(obj)) continue;
        const st = last.foodState;
        if (st === 'preserved' || st === 'rendered' || st === 'pemmican') {
          const k = (last.kcalEach || 0) * (last.units || 0);
          lostRawKcal += k;
          if (drawnObjects.has(obj)) { lostDrawnKcal += k; }
          else if (typeof last.spoilDay === 'number' && last.spoilDay <= snap.day) {
            lostKcal += k; lostN++;
            t.vanishes.push({ day: snap.day, state: st, kcal: k, spoilDay: last.spoilDay, drawn: false, spoiledLost: true });
          } else {
            // Vanished preserved stock with shelf left and never drawn:
            // traded/gifted away, or consumed by a non-draw path. Counted
            // separately so the analyzer never silently folds it into rot.
            t.vanishes.push({ day: snap.day, state: st, kcal: k, spoilDay: last.spoilDay, drawn: false, spoiledLost: false });
          }
        }
        pantryObjects.delete(obj);
      }
      for (const it of pantry) {
        if (it) pantryObjects.set(it, { foodState: it.foodState || null, spoilDay: (typeof it.spoilDay === 'number' ? it.spoilDay : null), kcalEach: it.kcalEach || 0, units: it.units || 0 });
      }
      snap.vanishPresLostKcal = lostKcal;
      snap.vanishPresLostN = lostN;
      snap.vanishPresDrawnKcal = lostDrawnKcal;
      snap.vanishPresRawKcal = lostRawKcal;
    } catch (e) { snap.vanishPresLostKcal = null; err('snap-vanish', e); }
    t.daily.push(snap);
    return snap;
  }

  function uninstall() {
    Object.keys(wrapped).forEach(function (name) {
      try { Game[name] = wrapped[name]; } catch (e) { err('uninstall-' + name, e); }
    });
  }

  return { t: t, snapshot: snapshot, uninstall: uninstall };
}

module.exports = {
  install: install,
  classifyMethodPath: classifyMethodPath,
};
