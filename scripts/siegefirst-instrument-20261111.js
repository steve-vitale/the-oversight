// siegefirst-instrument-20261111.js — siege first-numbers recorder
// (arm sim-siegefirst-a, run fleshout-20261111T1118Z). Scripts only, zero src/js.
//
// The coverage audit found siege SUBSTRATE-MISSING: no siege system is known
// to exist to measure. This instrument takes the first census of the
// siege-ADJACENT substrate that DOES exist, in the five senses the code
// audit found (see evidence/2026-11-11/sim-siegefirst-a.md):
//   (1) the siege CONTEST (blood/extreme, wave-3-gated, 3-wave arena hold),
//   (2) THE SIEGE crisis (raid crisis resolved 'fought' -> fireCrisis),
//   (3) lingering raiders / the treeline siege (reactive raids, nightly
//       gorge, ~6-night drift, palisade wall damage, sortie offer),
//   (4) the shelter/evacuate verb (wave-4+ threat near Haven),
//   (5) wave-6 heralds (network_tower/limb/heart — data only, no spawn
//       path found in code read this run).
//
// Records, per seed:
//   (1) RAIDS (havenRaidTick wrap): every tick call with pre-state (pantry,
//       lastRaidDay, haven tier/palisade, living world-monster count, table
//       active) and post-state (fired or not + the classified reason;
//       raiders drafted with id/wave/hp-before/hp-after so palisade wall
//       damage is measured, not inferred).
//   (2) PILLAGES (raidPillage wrap): every kcal draw with caller frame
//       (linger gorge vs raid vs other) + returned kcal actually taken.
//   (3) LINGERERS (havenGrowthDaily wrap): pre/post snapshots of every
//       lingering world monster (key, id, wave, hp, lingerSince, tile) so
//       the analyzer can build per-entity episodes: nights gorged, kcal
//       total, ending (drifted / killed / routed / fled-kept / still
//       lingering at run end).
//   (4) AID CRISES (raiseAidCrisis + resolveAidCrisis wraps): raised with
//       raiders flag + tier; resolved with how ('fought' / 'moved-on' /
//       other) + raiders flag. The 'fought' + raiders combination is the
//       only path to THE SIEGE.
//   (5) CRISIS FIRES (fireCrisis wrap): every kind fired + dedupe state
//       (already in prog.crises or fresh). 'the-siege' is the prize.
//   (6) CONTESTS (fireContest + contestTick wraps + tele 'contest_fired'):
//       every contest fired with id + participants; siege specifically.
//   (7) SHELTER (shelterVillagers / shelterEveryoneBut / shelterMuster /
//       releaseShelter / shelterAllClear wraps): every verb call with vid
//       count + the wave-4+ threat read at call time.
//   (8) SPAWNS (spawnWorldMonster wrap): every spawn with id/wave/veteran
//       + caller — the wave-6 herald watch.
//   (9) FIGHTS + DEATHS (tele wrap): combat_start (vs, wave, php, the
//       lingering ids live at fight start for linger-fight attribution),
//       combat_end (result, php), death (day/kind/who/cause/player +
//       LOCATION STAMP: scholar tile vs Haven tile, atHaven; victim node
//       via npcNode when the victim is a villager id — home vs away is
//       the roster-level wall question, §14c).
//   (10) DAILY SNAPSHOT: haven tier/palisade, pantry kcal, roster alive,
//       sheltered count, lingering list, world monsters by wave, scholar
//       at Haven, prog.crises keys, unlocked wave, scale rank, standing,
//       contests seen (siege count), aid crisis present, last lingerer
//       offer.
//
// All wraps are record-only: call the original, return its value
// unchanged, never alter state, never consume RNG. Any failure in the
// RECORDING path is logged to instrumentErrors, never thrown into the
// game.
//
// KNOWN WRAP RISK (secondlink-a / diplo-a lesson, restated by trapfirst-a):
// a wrap records nothing if the engine calls the closure instead of the
// Game method. The proof (scripts/test-siegefirst-a.js) verifies EACH
// wrapped method's call path is live on a fixture or live miniature; a
// wrap with no live call observed is marked dead in the evidence and its
// zero is never treated as evidence.
//
// INSTRUMENT GAPS FOUND BY THE PROOF (2026-11-11, fixed in-instrument
// where possible — see test B1d/B2b/B3b):
//  - Monster identity is object identity (WeakMap), NOT id@tile: twins
//    share an id and lingerers are re-pinned to the Haven tile, so
//    id@tile collides and goes stale when a raider moves. The engine
//    admits the same in lingerKeyFor.
//  - Raid raiders are read off pre-tick object refs, so re-drafted
//    raiders (a repeat raid drafts the nearest monsters — lingerers at
//    Haven are nearest) and raiders killed mid-raid are recorded, not
//    just fresh survivors. A re-drafted raider that takes NO damage
//    (no palisade, unmet) changes nothing observable and is still
//    missed — noted in the evidence, not hidden.
//  - raiseAidCrisis rows are corrected by the raid post hook: the engine
//    sets crisis.raiders = true only AFTER raise returns, and stores the
//    wave as `wave`, not `tier`. Echo raises (crisis already open,
//    created:false) are flagged, not counted as new raises.
//  - firstFrame returns the bare function name: stack frames carry a
//    varying receiver prefix ('Object.havenGrowthDaily').
//
// Usage: const SI = require('./siegefirst-instrument-20261111');
//   const si = SI.install(Game); si.snapshot(); ... si.uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function stackText(skip) {
  try { return (new Error().stack || '').split('\n').slice(skip || 0).join(' | '); } catch (e) { return ''; }
}

// First engine frame in the stack (after the wrap + this helper).
// Returns the bare function name ('havenGrowthDaily', not
// 'Object.havenGrowthDaily' — the frame's receiver prefix varies with
// how the method was defined, and callers classify on the name).
function firstFrame(stack) {
  try {
    const lines = String(stack || '').split(' | ');
    for (const ln of lines) {
      if (ln.indexOf('siegefirst-instrument') !== -1) continue;
      const m = ln.match(/at (\S+)/);
      if (m && m[1] !== 'Object.<anonymous>') {
        const full = m[1];
        const dot = full.lastIndexOf('.');
        return dot === -1 ? full : full.slice(dot + 1);
      }
    }
    return null;
  } catch (e) { return null; }
}

function havenXY(Game) {
  try {
    const v = (Game.state || {}).village || {};
    return { x: (v.px !== undefined && v.px !== null) ? v.px : 4, y: (v.py !== undefined && v.py !== null) ? v.py : 4 };
  } catch (e) { return { x: 4, y: 4 }; }
}

function waveOf(Game, m) {
  try { if (typeof Game.crisisWaveOf === 'function') return Game.crisisWaveOf(m); } catch (e) {}
  try {
    const def = ((Game.data || {}).monsters || []).find(function (d) { return d && d.id === (m && m.id); }) || {};
    return (typeof def.wave === 'number' ? def.wave : null);
  } catch (e) { return null; }
}

// Stable per-entity monster identity. World monsters carry NO unique id
// (m.id is the def id — twins share it — and havenGrowthDaily re-pins
// lingerers to the Haven tile, so id@tile does not disambiguate either;
// the engine says so itself in lingerKeyFor). Object identity is the only
// stable key: a WeakMap stamps each monster object once ('m1', 'm2', ...)
// and the stamp survives tile moves, HP changes, and death (the object
// lives on in the instrument's pre-tick snapshot even after the engine
// removes it from worldMonsters()). An engine-stamped m.key, if present,
// is preferred as the engine's own identity.
const _objKeys = new WeakMap();
let _objSeq = 0;
function monsterKey(m) {
  try {
    if (m && m.key) return String(m.key);
    if (!m || typeof m !== 'object') return '?';
    let k = _objKeys.get(m);
    if (!k) { k = 'm' + (++_objSeq); _objKeys.set(m, k); }
    return k;
  } catch (e) { return '?'; }
}

function install(Game) {
  const t = {
    raids: [],       // {day, fired, reason, pantryKcal, lastRaidDay, tier, palisade, livingMonsters, tableActive, raiders, wmax, bigRaider}
    pillages: [],    // {day, wantKcal, gotKcal, caller, threw}
    lingerDays: [],  // {day, before, after, offer} — lingering snapshots around havenGrowthDaily
    aidCrises: [],   // {day, verb, raiders, tier, how, threw}
    crisisFires: [], // {day, kind, deduped, threw}
    contests: [],    // {day, verb, id, participants, threw}
    contestTicks: 0, // null returns counted, not stored
    shelter: [],     // {day, verb, count, threat, threw}
    spawns: [],      // {day, id, wave, veteran, caller, threw}
    fights: [],      // {day, vs, wave, php, lingeringAtStart, threw}
    fightEnds: [],   // {day, result, php, threw}
    deaths: [],      // {day, kind, who, cause, player, loc, scholarAtHaven, scholarTile, havenTile, victimNode, threw}
    contestFiredTele: [], // {day, id}
    daily: [],       // snapshots
    instrumentErrors: [],
    wrapLive: {},
  };
  const wrapped = {};

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

  function livingMonsters() {
    try { return (Game.worldMonsters ? Game.worldMonsters() : []).filter(function (m) { return m && (m.hp || 0) > 0; }); } catch (e) { return []; }
  }
  function lingeringList() {
    try {
      return (Game.worldMonsters ? Game.worldMonsters() : [])
        .filter(function (m) { return m && m.lingering && (m.hp || 0) > 0; })
        .map(function (m) {
          let lk = null;
          try { lk = Game.lingerKeyFor ? Game.lingerKeyFor(m) : null; } catch (e) {}
          return {
            key: monsterKey(m), id: m.id || null, wave: waveOf(Game, m),
            lingerKey: lk,
            hp: (typeof m.hp === 'number' ? m.hp : null),
            maxHp: (typeof m.maxHp === 'number' ? m.maxHp : null),
            lingerSince: (typeof m.lingerSince === 'number' ? m.lingerSince : null),
            tx: (m.tx !== undefined ? m.tx : null), ty: (m.ty !== undefined ? m.ty : null),
          };
        });
    } catch (e) { err('lingeringList', e); return []; }
  }
  function pantryKcal() {
    try { return (typeof Game.pantryKcalLive === 'function') ? (Game.pantryKcalLive((Game.state || {}).village) || 0) : 0; } catch (e) { return 0; }
  }
  function havenTier() { try { return (typeof Game.havenTier === 'function') ? Game.havenTier() : 0; } catch (e) { return null; } }
  function scholarAtHaven() { try { return !!(Game.scholarAtHaven && Game.scholarAtHaven()); } catch (e) { return null; } }
  function scholarTile() {
    try {
      const mp = Game.map || {};
      return { x: (mp.px !== undefined ? mp.px : null), y: (mp.py !== undefined ? mp.py : null) };
    } catch (e) { return { x: null, y: null }; }
  }
  function progCrises() {
    try {
      const p = (typeof Game.progState === 'function') ? Game.progState() : ((Game.state || {}).scholar || {}).prog || {};
      return Object.keys((p && p.crises) || {});
    } catch (e) { return []; }
  }
  function threatNearHaven() {
    try {
      if (typeof Game.shelterThreatNearHaven !== 'function') return null;
      const th = Game.shelterThreatNearHaven(2);
      return th ? { name: th.name || null, wave: th.wave || null, dist: th.dist || null } : null;
    } catch (e) { return null; }
  }

  // (1) havenRaidTick — the reactive raid. Pre-state classifies a non-fire.
  wrapMethod('havenRaidTick', {
    pre: function () {
      const pre = { day: dayOf(Game) };
      try {
        pre.pantryKcal = pantryKcal();
        const v = (Game.state || {}).village || {};
        pre.lastRaidDay = (typeof v.lastRaidDay === 'number' ? v.lastRaidDay : null);
        pre.tier = havenTier();
        pre.palisade = (pre.tier !== null && pre.tier >= 2);
        pre.livingMonsters = livingMonsters().length;
        pre.tableActive = !!(Game.tableActive && Game.tableActive());
        // Per-monster snapshot by OBJECT REFERENCE (not by key map): the
        // post hook reads the same objects back, so a raider that moved
        // to Haven, took fight damage, or died mid-tick is still matched
        // — the engine removes dead raiders from worldMonsters(), so a
        // post-tick enumeration would lose them entirely.
        pre.monsters = [];
        for (const m of livingMonsters()) {
          pre.monsters.push({
            ref: m, key: monsterKey(m),
            hp: (typeof m.hp === 'number' ? m.hp : null),
            maxHp: (typeof m.maxHp === 'number' ? m.maxHp : null),
            raidBorn: !!m.raidBorn,
          });
        }
      } catch (e) { err('raidTick-pre', e); }
      return pre;
    },
    post: function (args, r, threw, pre) {
      const rec = {
        day: (pre && pre.day) || dayOf(Game),
        fired: !!r, reason: null,
        pantryKcal: (pre && pre.pantryKcal !== undefined ? pre.pantryKcal : null),
        lastRaidDay: (pre && pre.lastRaidDay !== undefined ? pre.lastRaidDay : null),
        tier: (pre && pre.tier !== undefined ? pre.tier : null),
        palisade: !!(pre && pre.palisade),
        livingMonsters: (pre && pre.livingMonsters !== undefined ? pre.livingMonsters : null),
        tableActive: !!(pre && pre.tableActive),
        raiders: [], wmax: null, bigRaider: null, threw: !!threw,
      };
      try {
        if (!r) {
          // Classify the non-fire from pre-state (gates in havenGrowth.js order).
          if (rec.tableActive) rec.reason = 'table-active';
          else if (pre && typeof pre.day === 'number' && typeof pre.lastRaidDay === 'number' && (pre.day - pre.lastRaidDay) < 7) rec.reason = 'cooldown';
          else if (rec.livingMonsters !== null && rec.livingMonsters < 3) rec.reason = 'too-few-monsters';
          else if (rec.pantryKcal !== null && rec.pantryKcal < 3000) rec.reason = 'pantry-too-low';
          else rec.reason = 'roll'; // all gates passed — the 18% roll said no
        } else {
          // Raiders, read off the pre-tick object references:
          //  - FRESH: raidBorn flipped false -> true this call.
          //  - RE-DRAFT: already raidBorn, but HP dropped during the
          //    tick. Within havenRaidTick the only HP changes are the
          //    palisade cut and defender/player fights, all of which
          //    touch drafted raiders only — so a drop proves a re-draft
          //    (a repeat raid re-drafts the nearest monsters, and
          //    lingerers sitting at Haven are nearest). A re-drafted
          //    raider that takes NO damage (no palisade, unmet) changes
          //    nothing observable and is NOT recorded — known gap, see
          //    header. Dead raiders ARE recorded (hpAfter 0): the pre
          //    refs survive the engine removing them from
          //    worldMonsters().
          const hv = havenXY(Game);
          let wmax = 0, big = null;
          const seen = {};
          const pushRaider = function (pm, m, redraft) {
            const w = waveOf(Game, m);
            const curHp = (m && typeof m.hp === 'number') ? m.hp : null;
            rec.raiders.push({
              key: pm.key, id: (m && m.id) || null, wave: w,
              hpBefore: pm.hp, hpAfter: curHp,
              maxHp: (m && typeof m.maxHp === 'number') ? m.maxHp : pm.maxHp,
              atHaven: !!(m && m.tx === hv.x && m.ty === hv.y),
              redraft: !!redraft,
            });
            seen[pm.key] = true;
            if (typeof w === 'number' && w > wmax) { wmax = w; big = (m && m.id) || null; }
          };
          for (const pm of ((pre && pre.monsters) || [])) {
            const m = pm.ref;
            if (!m) continue;
            const curHp = (typeof m.hp === 'number') ? m.hp : null;
            if (m.raidBorn && !pm.raidBorn) pushRaider(pm, m, false);
            else if (pm.raidBorn && curHp !== null && pm.hp !== null && curHp < pm.hp) pushRaider(pm, m, true);
          }
          // Belt-and-braces: a monster spawned mid-tick and drafted
          // would not be in the pre snapshot; livingMonsters() catches it.
          for (const m of livingMonsters()) {
            if (!m.raidBorn) continue;
            const k = monsterKey(m);
            if (seen[k]) continue;
            pushRaider({ key: k, hp: null, maxHp: (typeof m.maxHp === 'number' ? m.maxHp : null) }, m, false);
          }
          rec.wmax = wmax || null;
          rec.bigRaider = big;
          // AID-CRISIS FIXUP: havenRaidTick calls raiseAidCrisis and
          // THEN sets crisis.raiders = true on the returned object —
          // after the raise wrap already recorded the row. Correct the
          // same-day raise row from live state (echo rows, created
          // false because a crisis was already open, are left alone).
          try {
            const ac = (Game.state || {}).aidCrisis || null;
            if (ac) {
              for (let i = t.aidCrises.length - 1; i >= 0; i--) {
                const a = t.aidCrises[i];
                if (a.verb === 'raise' && a.day === rec.day && a.created !== false) {
                  a.raiders = !!ac.raiders;
                  if (typeof ac.wave === 'number') a.tier = ac.wave;
                  break;
                }
              }
            }
          } catch (e) { err('raidTick-crisis-fixup', e); }
        }
      } catch (e) { err('raidTick-post', e); }
      t.raids.push(rec);
    },
  });

  // (2) raidPillage — every kcal draw, caller-classified.
  wrapMethod('raidPillage', {
    pre: function (args) { return { day: dayOf(Game), stack: stackText(3) }; },
    post: function (args, r, threw, pre) {
      t.pillages.push({
        day: (pre && pre.day) || dayOf(Game),
        wantKcal: (typeof args[1] === 'number' ? args[1] : null),
        gotKcal: (typeof r === 'number' ? r : null),
        caller: firstFrame((pre && pre.stack) || ''),
        threw: !!threw,
      });
    },
  });

  // (3) havenGrowthDaily — lingerer episode bookkeeping around the gorge.
  wrapMethod('havenGrowthDaily', {
    pre: function () {
      return { day: dayOf(Game), before: lingeringList() };
    },
    post: function (args, r, threw, pre) {
      let offer = null;
      try { offer = (Game.state || {}).lastLingererOffer || null; } catch (e) {}
      t.lingerDays.push({
        day: (pre && pre.day) || dayOf(Game),
        before: (pre && pre.before) || [],
        after: lingeringList(),
        offer: offer ? { key: offer.key || null, name: offer.name || null, day: offer.day || null } : null,
        threw: !!threw,
      });
    },
  });

  // (4a) raiseAidCrisis — the raid raises the village's call for help.
  wrapMethod('raiseAidCrisis', {
    pre: function (args) { return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      let raiders = null, tier = null;
      try {
        const c = (Game.state || {}).aidCrisis || null;
        // The engine stores the wave as `wave`, not `tier`; `raiders`
        // is set by havenRaidTick AFTER this returns — the raid post
        // hook corrects it (see raidTick-crisis-fixup). `created` is
        // false when a crisis was already open and raise returned null.
        if (c) {
          raiders = !!c.raiders;
          tier = (typeof c.wave === 'number' ? c.wave : (typeof c.tier === 'number' ? c.tier : null));
        }
      } catch (e) {}
      t.aidCrises.push({
        day: (pre && pre.day) || dayOf(Game), verb: 'raise',
        raiders: raiders, tier: tier, how: null, threw: !!threw,
        created: !!r,
      });
    },
  });

  // (4b) resolveAidCrisis — 'fought' + raiders is the only road to THE SIEGE.
  wrapMethod('resolveAidCrisis', {
    pre: function (args) {
      let raiders = null;
      try { const c = (Game.state || {}).aidCrisis || null; if (c) raiders = !!c.raiders; } catch (e) {}
      return { day: dayOf(Game), raiders: raiders };
    },
    post: function (args, r, threw, pre) {
      t.aidCrises.push({
        day: (pre && pre.day) || dayOf(Game), verb: 'resolve',
        raiders: (pre && pre.raiders !== undefined ? pre.raiders : null),
        tier: null, how: args[0] || null, threw: !!threw,
      });
    },
  });

  // (5) fireCrisis — every crisis kind fired + dedupe state.
  wrapMethod('fireCrisis', {
    pre: function (args) {
      let already = null;
      try { already = progCrises().indexOf(args[0]) !== -1; } catch (e) {}
      return { day: dayOf(Game), already: already };
    },
    post: function (args, r, threw, pre) {
      t.crisisFires.push({
        day: (pre && pre.day) || dayOf(Game),
        kind: args[0] || null,
        deduped: (pre && pre.already === true),
        threw: !!threw,
      });
    },
  });

  // (6a) fireContest — every contest fired, siege specifically.
  wrapMethod('fireContest', {
    pre: function (args) { return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      const c = args[0] || {};
      t.contests.push({
        day: (pre && pre.day) || dayOf(Game), verb: 'fire',
        id: c.id || null, participants: (typeof c.participants === 'number' ? c.participants : null),
        threw: !!threw,
      });
    },
  });

  // (6b) contestTick — counts null returns; records fired contests.
  wrapMethod('contestTick', {
    pre: function () { return { day: dayOf(Game) }; },
    post: function (args, r, threw, pre) {
      if (!r) { t.contestTicks++; return; }
      t.contests.push({
        day: (pre && pre.day) || dayOf(Game), verb: 'tick',
        id: (r && r.id) || (r && r.contest && r.contest.id) || null,
        participants: null, threw: !!threw,
      });
    },
  });

  // (7) Shelter verbs.
  ['shelterVillagers', 'shelterEveryoneBut', 'shelterMuster', 'releaseShelter', 'shelterAllClear'].forEach(function (verb) {
    wrapMethod(verb, {
      pre: function (args) {
        return { day: dayOf(Game), threat: threatNearHaven() };
      },
      post: function (args, r, threw, pre) {
        let count = null;
        try {
          if (Array.isArray(args[0])) count = args[0].length;
          else if (verb === 'shelterMuster' || verb === 'shelterAllClear') count = null;
        } catch (e) {}
        t.shelter.push({
          day: (pre && pre.day) || dayOf(Game), verb: verb,
          count: count, threat: (pre && pre.threat) || null, threw: !!threw,
        });
      },
    });
  });

  // (8) spawnWorldMonster — the wave-6 herald watch.
  wrapMethod('spawnWorldMonster', {
    pre: function (args) { return { day: dayOf(Game), stack: stackText(3) }; },
    post: function (args, r, threw, pre) {
      try {
        const mdef = args[0] || {};
        const id = (typeof mdef === 'string' ? mdef : (mdef.id || null));
        let wave = null;
        try {
          const def = ((Game.data || {}).monsters || []).find(function (d) { return d && d.id === id; }) || {};
          wave = (typeof def.wave === 'number' ? def.wave : null);
        } catch (e) {}
        t.spawns.push({
          day: (pre && pre.day) || dayOf(Game), id: id, wave: wave,
          veteran: !!(r && r.veteran),
          caller: firstFrame((pre && pre.stack) || ''),
          threw: !!threw,
        });
      } catch (e) { err('spawn-record', e); }
    },
  });

  // (9) tele — fights, fight ends, deaths (+location stamp), contest fires.
  wrapMethod('tele', {
    pre: function (args) {
      const pre = { type: args[0] || null };
      try {
        if (args[0] === 'combat_start') {
          pre.lingeringAtStart = lingeringList().map(function (m) { return { key: m.key, id: m.id, wave: m.wave }; });
        }
        if (args[0] === 'death') {
          pre.scholarTile = scholarTile();
          pre.havenTile = havenXY(Game);
          pre.atHaven = scholarAtHaven();
          const d = args[1] || {};
          pre.who = d.who || null;
          pre.victimNode = null;
          try {
            if (d.who && typeof Game.npcNode === 'function') {
              const n = Game.npcNode(d.who);
              if (n) pre.victimNode = { x: (n.px !== undefined ? n.px : (n.x !== undefined ? n.x : null)), y: (n.py !== undefined ? n.py : (n.y !== undefined ? n.y : null)) };
            }
          } catch (e) {}
        }
      } catch (e) { err('tele-pre', e); }
      return pre;
    },
    post: function (args, r, threw, pre) {
      try {
        const ty = args[0];
        const d = args[1] || {};
        if (ty === 'combat_start') {
          t.fights.push({
            day: dayOf(Game), vs: d.vs || null, wave: (typeof d.wave === 'number' ? d.wave : null),
            php: (typeof d.php === 'number' ? d.php : null),
            lingeringAtStart: (pre && pre.lingeringAtStart) || [],
            threw: !!threw,
          });
        } else if (ty === 'combat_end') {
          t.fightEnds.push({
            day: dayOf(Game), result: d.result || null,
            php: (typeof d.php === 'number' ? d.php : null), threw: !!threw,
          });
        } else if (ty === 'death') {
          const hv = (pre && pre.havenTile) || havenXY(Game);
          const st = (pre && pre.scholarTile) || scholarTile();
          let loc = 'unknown';
          try {
            const vn = pre && pre.victimNode;
            if (vn && typeof vn.x === 'number' && typeof vn.y === 'number') {
              loc = (vn.x === hv.x && vn.y === hv.y) ? 'home' : 'away';
            } else if (st && typeof st.x === 'number' && typeof st.y === 'number') {
              // No victim node (scholar death, or node unreadable): the
              // scholar's tile is the death tile for player deaths.
              loc = (st.x === hv.x && st.y === hv.y) ? 'home' : 'away';
            }
          } catch (e) {}
          t.deaths.push({
            day: dayOf(Game), kind: d.kind || null, who: d.who || null,
            cause: d.cause || null, player: !!d.player, loc: loc,
            scholarAtHaven: (pre && pre.atHaven !== undefined ? pre.atHaven : null),
            scholarTile: st, havenTile: hv,
            victimNode: (pre && pre.victimNode) || null,
            threw: !!threw,
          });
        } else if (ty === 'contest_fired') {
          t.contestFiredTele.push({ day: dayOf(Game), id: d.id || null });
        }
      } catch (e) { err('tele-record', e); }
    },
  });

  // (10) Daily snapshot.
  function snapshot() {
    const snap = { day: dayOf(Game) };
    try { snap.havenTier = havenTier(); snap.palisade = (snap.havenTier !== null && snap.havenTier >= 2); } catch (e) { snap.havenTier = null; err('snap-tier', e); }
    try { snap.pantryKcal = pantryKcal(); } catch (e) { snap.pantryKcal = null; err('snap-pantry', e); }
    try {
      const v = (Game.state || {}).village || {};
      snap.rosterAlive = 0; snap.rosterTotal = 0;
      const roster = v.roster || [];
      snap.rosterTotal = roster.length;
      for (const vid of roster) {
        try {
          const alive = !(v.dead && v.dead[vid]);
          if (alive) snap.rosterAlive++;
        } catch (e) {}
      }
      snap.sheltered = [];
      try {
        if (typeof Game.shelteredVillagers === 'function') snap.sheltered = Game.shelteredVillagers() || [];
        else if (v.sheltered) snap.sheltered = Object.keys(v.sheltered).filter(function (k) { return v.sheltered[k]; });
      } catch (e) {}
    } catch (e) { snap.rosterAlive = null; err('snap-roster', e); }
    try { snap.lingering = lingeringList(); } catch (e) { snap.lingering = null; err('snap-lingering', e); }
    try {
      snap.worldByWave = {};
      snap.worldTotal = 0;
      for (const m of livingMonsters()) {
        const w = waveOf(Game, m);
        const k = (w === null || w === undefined) ? 'unknown' : String(w);
        snap.worldByWave[k] = (snap.worldByWave[k] || 0) + 1;
        snap.worldTotal++;
      }
    } catch (e) { snap.worldByWave = null; err('snap-world', e); }
    try {
      snap.scholarAtHaven = scholarAtHaven();
      snap.scholarTile = scholarTile();
      snap.havenTile = havenXY(Game);
    } catch (e) { snap.scholarAtHaven = null; err('snap-scholar', e); }
    try { snap.progCrises = progCrises(); } catch (e) { snap.progCrises = null; err('snap-crises', e); }
    try { snap.unlockedWave = (typeof Game.unlockedWave === 'function') ? Game.unlockedWave() : null; } catch (e) { snap.unlockedWave = null; }
    try { snap.scaleRank = (typeof Game.scaleRank === 'function') ? Game.scaleRank() : null; } catch (e) { snap.scaleRank = null; }
    try { snap.standing = (typeof Game.villageStandingTotal === 'function') ? Game.villageStandingTotal() : null; } catch (e) { snap.standing = null; }
    try { snap.contestsSeen = Object.assign({}, (Game.state || {}).contestsSeen || {}); } catch (e) { snap.contestsSeen = null; }
    try {
      const ac = (Game.state || {}).aidCrisis || null;
      snap.aidCrisis = ac ? { raiders: !!ac.raiders, tier: (typeof ac.tier === 'number' ? ac.tier : null) } : null;
    } catch (e) { snap.aidCrisis = null; }
    try { snap.lastLingererOffer = (Game.state || {}).lastLingererOffer || null; } catch (e) { snap.lastLingererOffer = null; }
    try { snap.threatNearHaven = threatNearHaven(); } catch (e) { snap.threatNearHaven = null; }
    try {
      const pg = (typeof Game.progState === 'function') ? Game.progState() : null;
      snap.tableDone = !!(pg && pg.tableDone);
      snap.tableActive = !!(Game.tableActive && Game.tableActive());
    } catch (e) { snap.tableDone = null; snap.tableActive = null; }
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
};
