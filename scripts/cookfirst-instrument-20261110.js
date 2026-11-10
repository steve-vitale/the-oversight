// cookfirst-instrument-20261110.js — cooking first-numbers recorder
// (arm sim-cookfirst-a, run fleshout-20261110T1915Z). Scripts only, zero src/js.
//
// Records, per seed:
//   (1) COOK TRANSFORMS (cookTransform wrap — the kcal backstop): every
//       raw->cooked conversion with rawTotal/cookedTotal, outcome key,
//       knows flag, caller path from the stack: scholar-fire / specialist
//       (askSpecialist) / batch (cookAll) / village-meal (pantryDraw
//       cook:true). 'other' is a failure, not a class.
//   (2) METHOD CALLS: cookFood, cookAll, cleanCarcass, preserveFood,
//       renderFat, makePemmican, askSpecialist — pre/post item snapshots,
//       spoiled-refusals, about-to-rot rescues (spoilDay - day <= 2).
//   (3) TECHNIQUE LEARNS (learnTechnique wrap): rung + source
//       (trial/watched/grant-implied) + day.
//   (4) EATING (eatOne + eatStashOne + eat wraps + tele('eat')
//       capture): eaten kcal attributed by foodState, scholar pack vs
//       village meal split.
//   (5) VILLAGE MEAL (pantryDraw wrap): cook flag, kcal drawn by
//       foodState, cooked-flag kcal.
//   (6) DEEDS (noteDeed + creditDeed wraps): 'cooking' / 'preserving'
//       deeds, who earned them.
//   (7) DAILY SNAPSHOT: pantry roll by foodState, scholar techniques,
//       cook-duty holders (id/occupation/preserver skill/foodXp),
//       villager foodXp by task, _haulcount tap deltas (villager duty
//       batches/kcal — the racks convert has no method call of its own).
//
// All wraps are record-only: call the original, return its value
// unchanged, never alter state, never consume RNG. Any failure in the
// RECORDING path is logged to instrumentErrors, never thrown into the
// game.
//
// KNOWN WRAP RISK (secondlink-a / diplo-a lesson): a wrap records
// nothing if the engine calls the closure instead of the Game method.
// The proof (scripts/test-cookfirst-a.js) verifies EACH wrapped
// method's call path is live on a fixture or live miniature; a wrap
// with no live call observed is marked dead in the evidence and its
// zero is never treated as evidence. cookTransform is the backstop
// for kcal provenance: if the cookFood/cookAll wraps are dead, the
// kcal are still counted from the transform stack.
//
// Usage: const CI = require('./cookfirst-instrument-20261110');
//   const ci = CI.install(Game); ci.snapshot(); ... ci.uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function stackText(skip) {
  try { return (new Error().stack || '').split('\n').slice(skip || 0).join(' | '); } catch (e) { return ''; }
}

// First engine frame in the stack (after the wrap + this helper).
// Skips any frame from this instrument file itself (the wrap frames
// live here and are named Game.<computed>).
function firstFrame(stack) {
  try {
    const lines = String(stack || '').split(' | ');
    for (const ln of lines) {
      if (ln.indexOf('cookfirst-instrument') !== -1) continue;
      const m = ln.match(/at (\S+)/);
      if (m && m[1] !== 'Object.<anonymous>') return m[1];
    }
    return null;
  } catch (e) { return null; }
}

// Caller-path classification for cookTransform. Priority order is a
// priority order, not a guess: pantryDraw is the only path that cooks
// inside a draw; askSpecialist is the only specialist path; cookAll is
// the only batch path; cookFood is the per-item scholar path.
function classifyTransformPath(stack) {
  if (!stack) return 'other';
  if (stack.indexOf('pantryDraw') !== -1) return 'village-meal';
  if (stack.indexOf('askSpecialist') !== -1) return 'specialist';
  if (stack.indexOf('cookAll') !== -1) return 'batch';
  if (stack.indexOf('cookFood') !== -1) return 'scholar-fire';
  return 'other';
}

// Caller-path classification for a direct method call (cookFood etc.).
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
      const e = roll[st] || (roll[st] = { count: 0, units: 0, kcal: 0 });
      e.count++; e.units += (it.units || 0); e.kcal += k;
    }
  } catch (e) {}
  return roll;
}

function install(Game) {
  const t = {
    transforms: [], // {day, path, foodKind, foodState, name, knows, outcome, rawTotal, cookedTotal, skillMult}
    methodCalls: [], // {day, method, path, actor, pre, post, spoiledRefused, rescuedKcal, ...}
    learns: [], // {day, tech, source, via}
    eats: [], // {day, via, foodState, kcalEach, units, ateKcal, purgedKcal}
    draws: [], // {day, cook, want, taken, byState, cookedKcal, caller}
    deeds: [], // {day, deed, who}
    daily: [], // snapshots
    instrumentErrors: [],
    wrapLive: {}, // name -> true once a wrapped call is observed live
    sayLines: [],
  };
  const wrapped = {};
  let _pendingEat = null; // eatOne record awaiting its tele('eat')
  let _lastHaul = { batches: 0, kcal: 0 };

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

  // (1) cookTransform — the kcal backstop.
  wrapMethod('cookTransform', {
    pre: function (args) {
      return { item: itemSnap(args[0]), stack: stackText(3) };
    },
    post: function (args, r, threw, pre) {
      const stack = (pre && pre.stack) || '';
      const path = classifyTransformPath(stack);
      // 'other' is recorded, not error-logged: the analyzer's
      // transformOther count is the GO check (a direct test call has no
      // caller path by construction; an engine path landing here in the
      // pilot is a real gap and fails GO on the count alone).
      const opts = args[1] || {};
      t.transforms.push({
        day: dayOf(Game), path: path,
        foodKind: (pre && pre.item && pre.item.foodKind) || null,
        foodState: (pre && pre.item && pre.item.foodState) || null,
        name: (pre && pre.item && pre.item.name) || null,
        knows: !!opts.knows,
        outcome: (r && r.outcome && r.outcome.key) || null,
        rawTotal: (r && typeof r.rawTotal === 'number' ? r.rawTotal : null),
        cookedTotal: (r && typeof r.cookedTotal === 'number' ? r.cookedTotal : null),
        skillMult: (typeof opts.skillMult === 'number' ? opts.skillMult : null),
        threw: !!threw,
      });
    },
  });

  // (2) Per-item / batch / ladder method calls.
  function itemMethod(name, containerArg) {
    wrapMethod(name, {
      pre: function (args) {
        const inv = containerOf(args, containerArg);
        const it = inv[args[0]];
        return { day: dayOf(Game), stack: stackText(3), inv: inv, idx: args[0], pre: itemSnap(it), spoiled: spoiledOf(Game, it), rescued: rescuedKcalOf(dayOf(Game), it) };
      },
      post: function (args, r, threw, pre) {
        const inv = (pre && pre.inv) || [];
        const post = itemSnap(inv[pre ? pre.idx : args[0]]);
        t.methodCalls.push({
          day: (pre && pre.day) || dayOf(Game), method: name,
          path: classifyMethodPath((pre && pre.stack) || ''),
          pre: (pre && pre.pre) || null, post: post,
          spoiledRefused: !!(pre && pre.spoiled),
          rescuedKcal: (pre && pre.rescued) || 0,
          threw: !!threw, retNull: (r === null || r === undefined),
        });
      },
    });
  }
  itemMethod('cookFood', 1);
  itemMethod('cleanCarcass', 1);
  itemMethod('preserveFood', 1);
  itemMethod('renderFat', 1);

  // cookAll: container-level; record the roll before/after.
  wrapMethod('cookAll', {
    pre: function (args) {
      const inv = containerOf(args, 0);
      return { day: dayOf(Game), stack: stackText(3), before: containerRoll(inv), beforeN: inv.length };
    },
    post: function (args, r, threw, pre) {
      const inv = containerOf(args, 0);
      t.methodCalls.push({
        day: (pre && pre.day) || dayOf(Game), method: 'cookAll',
        path: classifyMethodPath((pre && pre.stack) || ''),
        pre: (pre && pre.before) || null, post: containerRoll(inv),
        spoiledRefused: false, rescuedKcal: 0,
        threw: !!threw, retNull: (r === null || r === undefined),
      });
    },
  });

  // makePemmican: count new pemmican bars by object identity.
  wrapMethod('makePemmican', {
    pre: function (args) {
      const inv = containerOf(args, 0);
      return { day: dayOf(Game), stack: stackText(3), before: new Set(inv), beforeRoll: containerRoll(inv) };
    },
    post: function (args, r, threw, pre) {
      const inv = containerOf(args, 0);
      let bars = 0, barKcal = 0;
      try {
        for (const it of inv) {
          if (pre && pre.before && !pre.before.has(it) && it && it.foodState === 'pemmican') {
            bars += (it.units || 0); barKcal += (it.kcalEach || 0) * (it.units || 0);
          }
        }
      } catch (e) { err('makePemmican-diff', e); }
      t.methodCalls.push({
        day: (pre && pre.day) || dayOf(Game), method: 'makePemmican',
        path: classifyMethodPath((pre && pre.stack) || ''),
        pre: (pre && pre.beforeRoll) || null, post: containerRoll(inv),
        bars: bars, barKcal: barKcal,
        spoiledRefused: false, rescuedKcal: 0,
        threw: !!threw, retNull: (r === null || r === undefined),
      });
    },
  });

  // askSpecialist: who taught/cooked what, at what skill.
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
      const inv = containerOf(args, 2);
      t.methodCalls.push({
        day: (pre && pre.day) || dayOf(Game), method: 'askSpecialist',
        path: 'specialist',
        specialistId: (pre && pre.vid) || null,
        specialistOcc: (pre && pre.occ) || null,
        specialistSkill: (pre && typeof pre.skill === 'number' ? pre.skill : null),
        task: (pre && pre.task) || null,
        pre: (pre && pre.pre) || null,
        post: itemSnap(inv[args[1]]),
        spoiledRefused: false, rescuedKcal: 0,
        threw: !!threw, retNull: (r === null || r === undefined),
      });
    },
  });

  // (3) Technique learns.
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

  // (4) Eating. tele('eat') is captured below; the kcal delta on the
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
      if (ate === 0 && !(pre && pre.snap && pre.snap.length)) { /* nothing eaten, nothing to record */ }
    },
  });

  // tele('eat') capture: reconciles the wrap attribution against the
  // engine's own ateKcal. The harness wraps tele AFTER install, so this
  // wrap sits underneath it in the chain and still fires.
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

  // (5) Village meal draw.
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
          // A Map hit of null means the item genuinely carries no
          // foodState (pantry staples) — 'none', not 'unknown'.
          // 'unknown' is reserved for an item the pre-snapshot never saw.
          let st;
          if (pre && pre.byObj && pre.byObj.has(entry.item)) st = pre.byObj.get(entry.item) || 'none';
          else st = (entry.item && entry.item.foodState) || 'unknown';
          const k = (entry.units || 0) * (entry.effectiveKcal || 0);
          byState[st] = (byState[st] || 0) + k;
          if (entry.cooked) cookedKcal += k;
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

  // (6) Deeds.
  wrapMethod('noteDeed', {
    pre: function (args) { return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      if (args[0] === 'cooking' || args[0] === 'preserving') {
        t.deeds.push({ day: (pre && pre.day) || dayOf(Game), deed: args[0], who: 'player' });
      }
    },
  });
  wrapMethod('creditDeed', {
    pre: function (args) { return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      if (args[1] === 'cooking' || args[1] === 'preserving') {
        t.deeds.push({ day: (pre && pre.day) || dayOf(Game), deed: args[1], who: args[0] || null });
      }
    },
  });

  // (7) Daily snapshot.
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
  classifyTransformPath: classifyTransformPath,
  classifyMethodPath: classifyMethodPath,
};
