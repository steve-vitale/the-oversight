// godpathfirst-instrument-20261111.js — godpath / godhood first-numbers
// recorder (arm sim-godpathfirst-a, run fleshout-20261111T1115Z).
// Scripts only, zero src/js.
//
// Records, per seed:
//   (1) LEVEL-UP SHEETS (kitSheet): every call — holder, track, level,
//       offers (id + path + subclass), _leaned/_jobLeaned, day.
//       The instrument never calls kitSheet itself.
//   (2) PICKS (chooseAbility / buildDecide / npcLearnAbility): every
//       player pick (id, path, return), every villager pick (vid,
//       offers, decision), every villager learn (vid, id, path,
//       source). Villagers learn all three offers before picking.
//   (3) RECOGNITION (recognizeClass): every call — who, return
//       (path/subclass/since or null), day. Ledger path only: the
//       dawn/acquisition path calls the godpath.js closure directly,
//       so tele 'class_recognized' is the reliable recorder.
//   (4) ASCENSION (S.Godhood.checkGodhood / checkVillagerGodhood):
//       every call — returns (newly completed ids), day.
//       (Game.checkPlayerGodhoodAscension /
//       checkVillagerGodhoodAscension): every call — attempts, day.
//       (S.Godhood.recognitionCeremony / villagerRecognitionCeremony):
//       every call — god id, witnesses, day.
//   (5) CAPSTONE GIFTS (maybeGrantCapstoneItem): every call —
//       vid/isPlayer, capstoneGifted diff (god -> item), day.
//   (6) GOD VERBS (useAbility, path-tagged magic only): every call —
//       ability id, path, verb, return, day. (S.Godpath.villagerCast):
//       every call — vid, return, day. (S.Godhood capstone verbs:
//       raiseEcho / chooseTerms / feedMultitude / turnPain /
//       noLiesCheck / namePrice / buyOff / walkHorizon / phaseOut /
//       takeWound): every call — args, return, day. The engine calls
//       the villagerCast closure, so tele 'godpath_verb' is the
//       reliable villager-cast recorder.
//   (7) TELEMETRY CROSS-CHECK (tele, if present):
//       'class_recognized', 'godpath_deed', 'godpath_verb',
//       'godpath_bribe', 'godpath_feed_camp', 'godpath_lifeline',
//       'godpath_ember', 'villager_level_up', 'track_level_empty'.
//   (8) DAILY SNAPSHOT (RAW READS + PURE READS ONLY — the snapshot
//       never calls a method that writes: no checkGodhood (marks
//       recognised), no maybeGrantCapstoneItem (GRANTS the item), no
//       kitSheet (draws the sheet), no chooseAbility / buildDecide
//       (PICK). Pure reads used: godpathClass, godpathDeedStatus,
//       godhoodCloseness, villagerGodhoodCloseness, playerMythicId,
//       villagerMythicId, godhoodBargaining — all computations over
//       state, verified pure in the proof): pantry kcal, roster,
//       standing, scaleRank, nationalLive, wave, bearer; scholar —
//       abilities, tracks, levelUpQueue, abilityChoices, trackStats,
//       godpath class, godhood store, activeSynergies, capstone
//       items in inventory, mythic id, deed status + closeness per
//       god, table leverage; per villager — npcAbilities, godpath
//       class, npcGodhood store, npcSynergies, capstone items on the
//       person, mythic id, deed status + closeness per god (only
//       for villagers with >=3 npcAbilities); village — godpathDeeds
//       book (raw), switchboard holder (socialite deed), systemArrived;
//       table — progState tableAnnounced/tableWaiting/tableDone +
//       progState().table raw.
//
// All wraps are record-only: call the original, return its value
// unchanged, never alter state, never consume RNG. Any failure in
// the RECORDING path is logged to instrumentErrors, never thrown
// into the game.
//
// KNOWN WRAP RISK (secondlink-a / diplo-a lesson): a wrap records
// nothing if the engine calls the closure instead of the Game /
// namespace method. The proof (scripts/test-godpathfirst-a.js)
// verifies EACH wrapped method's call path is live on a fixture
// or live miniature; a wrap with no live call observed is marked
// dead in the evidence and its zero is never treated as evidence.
//
// Usage: const GP = require('./godpathfirst-instrument-20261111');
//   const gp = GP.install(Game); gp.snapshot(); ... gp.uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function stackText(skip) {
  try { return (new Error().stack || '').split('\n').slice(skip || 0).join(' | '); } catch (e) { return ''; }
}
function clone(o) { try { return JSON.parse(JSON.stringify(o || {})); } catch (e) { return {}; } }
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce(function (t, i) { return t + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) { return null; }
}
function retStr(ret) {
  if (ret == null) return null;
  try {
    if (Array.isArray(ret)) return 'arr[' + ret.map(function (x) { return String(x); }).join(',') + ']';
    if (typeof ret === 'object') return JSON.stringify(ret).slice(0, 120);
    return String(ret).slice(0, 80);
  } catch (e) { return '[unstringable]'; }
}

var CAPSTONE_VERBS = ['raiseEcho', 'chooseTerms', 'feedMultitude', 'turnPain',
  'noLiesCheck', 'namePrice', 'buyOff', 'walkHorizon', 'phaseOut', 'takeWound'];
var TELE_TYPES = {
  class_recognized: 1, godpath_deed: 1, godpath_verb: 1, godpath_bribe: 1,
  godpath_feed_camp: 1, godpath_lifeline: 1, godpath_ember: 1,
  villager_level_up: 1, track_level_empty: 1,
};

function install(Game) {
  const t = {
    sheetEvents: [], pickEvents: [], villagerPickEvents: [], learnEvents: [],
    recognitionEvents: [], ascensionEvents: [], ceremonyEvents: [],
    capstoneGiftEvents: [], verbUseEvents: [], villagerCastEvents: [],
    capstoneVerbEvents: [], teleEvents: [],
    daily: [], instrumentErrors: [], wrapLive: {}, wrapCounts: {},
  };
  let seq = 0;
  const origs = {};
  const origNs = {}; // namespace originals: { nsName: { fn: orig } }

  function mark(name) {
    t.wrapLive[name] = true;
    t.wrapCounts[name] = (t.wrapCounts[name] || 0) + 1;
  }
  function err(where, msg) {
    try { t.instrumentErrors.push(where + ': ' + String(msg).slice(0, 100)); } catch (e) {}
  }
  function wrap(name, fn) {
    try {
      if (typeof Game[name] !== 'function') { err(name + '-missing', 'Game.' + name + ' is not a function'); return; }
      origs[name] = Game[name];
      Game[name] = fn;
    } catch (e) { err(name + '-wrap', e.message); }
  }
  function wrapNs(nsName, fnName, fn) {
    try {
      const S = globalThis.Scattering || {};
      const ns = S[nsName];
      if (!ns || typeof ns[fnName] !== 'function') { err(nsName + '.' + fnName + '-missing', nsName + '.' + fnName + ' is not a function'); return; }
      origNs[nsName] = origNs[nsName] || {};
      origNs[nsName][fnName] = ns[fnName];
      ns[fnName] = fn;
    } catch (e) { err(nsName + '.' + fnName + '-wrap', e.message); }
  }
  function abilityDef(Game, id) {
    try {
      const all = (Game.data && Game.data.abilities) || [];
      for (let i = 0; i < all.length; i++) if (all[i] && all[i].id === id) return all[i];
      return null;
    } catch (e) { return null; }
  }
  function abilityPath(Game, id) {
    const d = abilityDef(Game, id);
    if (!d) return { path: null, subclass: null, lane: null };
    return { path: d.path || null, subclass: d.subclass || null, lane: d.lane || null };
  }
  function godhoods(Game) {
    try {
      const S = globalThis.Scattering || {};
      if (S.Godhood && typeof S.Godhood.godhoods === 'function') return S.Godhood.godhoods() || [];
      return [];
    } catch (e) { return []; }
  }
  function capstoneItemIds(Game) {
    try {
      const S = globalThis.Scattering || {};
      const out = {};
      godhoods(Game).forEach(function (gh) {
        try {
          if (S.Godhood && typeof S.Godhood.capstoneItemFor === 'function') {
            const id = S.Godhood.capstoneItemFor(gh);
            if (id) out[id] = gh.id;
          }
        } catch (e) {}
        (gh.capstoneItems || []).forEach(function (id) { out[id] = gh.id; });
      });
      return out;
    } catch (e) { return {}; }
  }
  function giftedStore(Game, who) {
    try {
      if (who === 'player') return clone(((Game.state || {}).scholar || {}).godhood || {});
      const v = (Game.state || {}).village || {};
      return clone(((v.npcGodhood || {})[who]) || {});
    } catch (e) { return {}; }
  }

  // ---- (1) level-up sheets ----
  wrap('kitSheet', function (cands, who, track, level) {
    mark('kitSheet');
    const stack = stackText(2);
    let ret = null;
    try { ret = origs.kitSheet.apply(Game, arguments); } catch (e) { err('kitSheet-call', e.message); }
    try {
      const offers = (Array.isArray(ret) ? ret : []).map(function (d) {
        return d ? { id: d.id || null, path: d.path || null, subclass: d.subclass || null } : null;
      });
      t.sheetEvents.push({ seq: ++seq, day: dayOf(Game), who: who || null,
        track: track || null, level: (level == null ? null : level),
        offers: offers, leaned: !!(ret && ret._leaned), jobLeaned: !!(ret && ret._jobLeaned),
        stack: stack, via: 'kitSheet' });
    } catch (e) { err('kitSheet-log', e.message); }
    return ret;
  });

  // ---- (2) picks ----
  wrap('chooseAbility', function (id) {
    mark('chooseAbility');
    const stack = stackText(2);
    let ret = null;
    try { ret = origs.chooseAbility.apply(Game, arguments); } catch (e) { err('chooseAbility-call', e.message); }
    try {
      const p = abilityPath(Game, id);
      t.pickEvents.push({ seq: ++seq, day: dayOf(Game), who: 'player', id: id || null,
        path: p.path, subclass: p.subclass, ret: retStr(ret), stack: stack, via: 'chooseAbility' });
    } catch (e) { err('chooseAbility-log', e.message); }
    return ret;
  });

  wrap('buildDecide', function (vid, offers) {
    mark('buildDecide');
    const stack = stackText(2);
    let ret = null;
    try { ret = origs.buildDecide.apply(Game, arguments); } catch (e) { err('buildDecide-call', e.message); }
    try {
      const offs = (Array.isArray(offers) ? offers : []).map(function (o) {
        const id = (o && o.id) || (typeof o === 'string' ? o : null);
        const p = id ? abilityPath(Game, id) : { path: null, subclass: null };
        return { id: id, path: p.path, subclass: p.subclass };
      });
      t.villagerPickEvents.push({ seq: ++seq, day: dayOf(Game), vid: vid || null,
        offers: offs, decision: clone(ret || {}), ret: retStr(ret), stack: stack, via: 'buildDecide' });
    } catch (e) { err('buildDecide-log', e.message); }
    return ret;
  });

  wrap('npcLearnAbility', function (vid, id, level, source) {
    mark('npcLearnAbility');
    const stack = stackText(2);
    let ret;
    try { ret = origs.npcLearnAbility.apply(Game, arguments); } catch (e) { err('npcLearnAbility-call', e.message); }
    try {
      const p = abilityPath(Game, id);
      t.learnEvents.push({ seq: ++seq, day: dayOf(Game), vid: vid || null, id: id || null,
        path: p.path, subclass: p.subclass, level: (level == null ? null : level),
        source: source || null, ret: retStr(ret), stack: stack, via: 'npcLearnAbility' });
    } catch (e) { err('npcLearnAbility-log', e.message); }
    return ret;
  });

  // ---- (3) recognition ----
  wrap('recognizeClass', function (who) {
    mark('recognizeClass');
    const stack = stackText(2);
    let ret = null;
    try { ret = origs.recognizeClass.apply(Game, arguments); } catch (e) { err('recognizeClass-call', e.message); }
    try {
      t.recognitionEvents.push({ seq: ++seq, day: dayOf(Game), who: who || null,
        path: (ret && ret.path) || null, subclass: (ret && ret.subclass) || null,
        since: (ret && ret.since == null ? null : (ret && ret.since)), god: (ret && ret.god) || null,
        ret: retStr(ret), stack: stack, via: 'recognizeClass' });
    } catch (e) { err('recognizeClass-log', e.message); }
    return ret;
  });

  // ---- (4) ascension (namespace + Game) ----
  wrapNs('Godhood', 'checkGodhood', function (sch, day) {
    mark('Godhood.checkGodhood');
    const stack = stackText(2);
    let ret = null;
    try { ret = origNs.Godhood.checkGodhood.apply(this, arguments); } catch (e) { err('Godhood.checkGodhood-call', e.message); }
    try {
      t.ascensionEvents.push({ seq: ++seq, day: dayOf(Game), who: 'player',
        kind: 'checkGodhood', paramDay: (day == null ? null : day),
        fresh: Array.isArray(ret) ? ret.slice() : null, ret: retStr(ret),
        stack: stack, via: 'Godhood.checkGodhood' });
    } catch (e) { err('Godhood.checkGodhood-log', e.message); }
    return ret;
  });

  wrapNs('Godhood', 'checkVillagerGodhood', function (game, vid) {
    mark('Godhood.checkVillagerGodhood');
    const stack = stackText(2);
    let ret = null;
    try { ret = origNs.Godhood.checkVillagerGodhood.apply(this, arguments); } catch (e) { err('Godhood.checkVillagerGodhood-call', e.message); }
    try {
      t.ascensionEvents.push({ seq: ++seq, day: dayOf(Game), who: vid || null,
        kind: 'checkVillagerGodhood',
        fresh: Array.isArray(ret) ? ret.slice() : null, ret: retStr(ret),
        stack: stack, via: 'Godhood.checkVillagerGodhood' });
    } catch (e) { err('Godhood.checkVillagerGodhood-log', e.message); }
    return ret;
  });

  wrap('checkPlayerGodhoodAscension', function () {
    mark('checkPlayerGodhoodAscension');
    const stack = stackText(2);
    let ret;
    try { ret = origs.checkPlayerGodhoodAscension.apply(Game, arguments); } catch (e) { err('checkPlayerGodhoodAscension-call', e.message); }
    try {
      t.ascensionEvents.push({ seq: ++seq, day: dayOf(Game), who: 'player',
        kind: 'checkPlayerGodhoodAscension', fresh: null, ret: retStr(ret),
        stack: stack, via: 'checkPlayerGodhoodAscension' });
    } catch (e) { err('checkPlayerGodhoodAscension-log', e.message); }
    return ret;
  });

  wrap('checkVillagerGodhoodAscension', function (vid) {
    mark('checkVillagerGodhoodAscension');
    const stack = stackText(2);
    let ret;
    try { ret = origs.checkVillagerGodhoodAscension.apply(Game, arguments); } catch (e) { err('checkVillagerGodhoodAscension-call', e.message); }
    try {
      t.ascensionEvents.push({ seq: ++seq, day: dayOf(Game), who: vid || null,
        kind: 'checkVillagerGodhoodAscension', fresh: null, ret: retStr(ret),
        stack: stack, via: 'checkVillagerGodhoodAscension' });
    } catch (e) { err('checkVillagerGodhoodAscension-log', e.message); }
    return ret;
  });

  wrapNs('Godhood', 'recognitionCeremony', function (game, ghId, witnesses, dayPart) {
    mark('Godhood.recognitionCeremony');
    const stack = stackText(2);
    let ret;
    try { ret = origNs.Godhood.recognitionCeremony.apply(this, arguments); } catch (e) { err('Godhood.recognitionCeremony-call', e.message); }
    try {
      t.ceremonyEvents.push({ seq: ++seq, day: dayOf(Game), who: 'player', god: ghId || null,
        witnesses: Array.isArray(witnesses) ? witnesses.length : null,
        dayPart: dayPart || null, ret: retStr(ret), stack: stack, via: 'Godhood.recognitionCeremony' });
    } catch (e) { err('Godhood.recognitionCeremony-log', e.message); }
    return ret;
  });

  wrapNs('Godhood', 'villagerRecognitionCeremony', function (game, vid, ghId, witnesses) {
    mark('Godhood.villagerRecognitionCeremony');
    const stack = stackText(2);
    let ret;
    try { ret = origNs.Godhood.villagerRecognitionCeremony.apply(this, arguments); } catch (e) { err('Godhood.villagerRecognitionCeremony-call', e.message); }
    try {
      t.ceremonyEvents.push({ seq: ++seq, day: dayOf(Game), who: vid || null, god: ghId || null,
        witnesses: Array.isArray(witnesses) ? witnesses.length : null,
        ret: retStr(ret), stack: stack, via: 'Godhood.villagerRecognitionCeremony' });
    } catch (e) { err('Godhood.villagerRecognitionCeremony-log', e.message); }
    return ret;
  });

  // ---- (5) capstone gifts ----
  wrap('maybeGrantCapstoneItem', function (vid, isPlayer) {
    mark('maybeGrantCapstoneItem');
    const stack = stackText(2);
    const who = isPlayer ? 'player' : (vid || null);
    const before = giftedStore(Game, who);
    let ret;
    try { ret = origs.maybeGrantCapstoneItem.apply(Game, arguments); } catch (e) { err('maybeGrantCapstoneItem-call', e.message); }
    try {
      const after = giftedStore(Game, who);
      const giftedBefore = (before.capstoneGifted || {});
      const giftedAfter = (after.capstoneGifted || {});
      const newly = Object.keys(giftedAfter).filter(function (k) { return giftedAfter[k] && !giftedBefore[k]; });
      t.capstoneGiftEvents.push({ seq: ++seq, day: dayOf(Game), who: who,
        isPlayer: !!isPlayer, newlyGifted: newly, ret: retStr(ret),
        stack: stack, via: 'maybeGrantCapstoneItem' });
    } catch (e) { err('maybeGrantCapstoneItem-log', e.message); }
    return ret;
  });

  // ---- (6) god verbs ----
  wrap('useAbility', function (abilityId) {
    mark('useAbility');
    const stack = stackText(2);
    const p = abilityPath(Game, abilityId);
    const inScope = !!(p.path && p.lane === 'magic');
    let ret = null;
    try { ret = origs.useAbility.apply(Game, arguments); } catch (e) { err('useAbility-call', e.message); }
    try {
      if (inScope) {
        let verb = null, hasVerb = false;
        try {
          const d = abilityDef(Game, abilityId);
          const acts = (d && d.actions) || [];
          hasVerb = acts.some(function (a) { return a && a.do; });
          verb = acts.length && acts[0] && acts[0].do ? acts[0].do : (abilityId || null);
        } catch (e) {}
        t.verbUseEvents.push({ seq: ++seq, day: dayOf(Game), who: 'player',
          ability: abilityId || null, path: p.path, subclass: p.subclass,
          verb: verb, hasVerb: hasVerb, ret: retStr(ret), stack: stack, via: 'useAbility' });
      }
    } catch (e) { err('useAbility-log', e.message); }
    return ret;
  });

  wrapNs('Godpath', 'villagerCast', function (game, v) {
    mark('Godpath.villagerCast');
    const stack = stackText(2);
    let ret = null;
    try { ret = origNs.Godpath.villagerCast.apply(this, arguments); } catch (e) { err('Godpath.villagerCast-call', e.message); }
    try {
      const vid = (v && (v.villagerId || v.id)) || null;
      t.villagerCastEvents.push({ seq: ++seq, day: dayOf(Game), vid: vid,
        ret: retStr(ret), stack: stack, via: 'Godpath.villagerCast' });
    } catch (e) { err('Godpath.villagerCast-log', e.message); }
    return ret;
  });

  CAPSTONE_VERBS.forEach(function (name) {
    wrapNs('Godhood', name, function () {
      mark('Godhood.' + name);
      const stack = stackText(2);
      const args = Array.prototype.slice.call(arguments).map(function (a) {
        return (a == null ? null : String(a).slice(0, 60));
      });
      let ret = null;
      try { ret = origNs.Godhood[name].apply(this, arguments); } catch (e) { err('Godhood.' + name + '-call', e.message); }
      try {
        t.capstoneVerbEvents.push({ seq: ++seq, day: dayOf(Game), verb: name,
          args: args, ret: retStr(ret), stack: stack, via: 'Godhood.' + name });
      } catch (e) { err('Godhood.' + name + '-log', e.message); }
      return ret;
    });
  });

  // ---- (7) telemetry cross-check ----
  try {
    if (typeof Game.tele === 'function') {
      origs.tele = Game.tele;
      Game.tele = function (type, data) {
        let ret;
        try { ret = origs.tele.call(Game, type, data); } catch (e) { err('tele-call', e.message); }
        try {
          if (TELE_TYPES[type]) {
            t.teleEvents.push({ seq: ++seq, day: dayOf(Game), type: type, data: clone(data || {}) });
          }
          mark('tele');
        } catch (e) { err('tele-log', e.message); }
        return ret;
      };
    }
  } catch (e) { err('tele-wrap', e.message); }

  // ---- (8) daily snapshot (RAW + PURE READS ONLY — see header) ----
  function snapshot() {
    const snap = { day: dayOf(Game), seq: seq };
    try { snap.pantryKcal = pantryKcal(Game); } catch (e) { snap.pantryKcal = null; }
    try { snap.standing = Game.villageStanding ? Game.villageStanding() : null; } catch (e) { snap.standing = null; }
    try { snap.gated = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) { snap.gated = null; }
    try { snap.scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { snap.scaleRank = null; }
    try { snap.nationalLive = !!((Game.state || {}).nationalLive); } catch (e) { snap.nationalLive = null; }
    try { snap.wave = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { snap.wave = null; }
    try { snap.bearer = Game.villagerId || null; } catch (e) { snap.bearer = null; }
    try { snap.systemArrived = !!((Game.state || {}).systemArrived); } catch (e) { snap.systemArrived = null; }
    try {
      const pg = (typeof Game.progState === 'function') ? Game.progState() : {};
      snap.tableAnnounced = !!pg.tableAnnounced;
      snap.tableWaiting = !!pg.tableWaiting;
      snap.tableDone = !!pg.tableDone;
      snap.table = pg.table ? clone(pg.table) : null;
    } catch (e) { err('snapshot-prog', e.message); }
    const S = globalThis.Scattering || {};
    const ghs = godhoods(Game);
    const capItems = capstoneItemIds(Game);
    // Scholar (player).
    try {
      const s = Game.state.scholar || {};
      const abilities = (s.abilities || []).slice();
      snap.player = {
        abilities: abilities,
        paths: abilities.map(function (id) { const p = abilityPath(Game, id); return p.path; }),
        tracks: clone(s.tracks || {}),
        levelUpQueue: ((s.levelUpQueue || []).length),
        abilityChoices: ((s.abilityChoices || []).map(function (c) { return (c && c.id) || c || null; })),
        trackStats: clone(s.trackStats || {}),
        synergies: (s.activeSynergies || []).slice(),
        godhood: clone(s.godhood || {}),
        class: null, mythic: null, bargaining: null,
        deedStatus: {}, closeness: {},
        capstoneItems: ((s.inventory || []).filter(function (it) { return it && capItems[it.itemId]; })
          .map(function (it) { return it.itemId; })),
      };
      try { snap.player.class = (typeof Game.godpathClass === 'function') ? clone(Game.godpathClass('player') || null) : null; } catch (e) {}
      try { snap.player.mythic = (S.Godhood && typeof S.Godhood.playerMythicId === 'function') ? (S.Godhood.playerMythicId(s) || null) : null; } catch (e) {}
      try { snap.player.bargaining = (S.Godhood && typeof S.Godhood.godhoodBargaining === 'function') ? (S.Godhood.godhoodBargaining(s) || 0) : null; } catch (e) {}
      const day = snap.day;
      ghs.forEach(function (gh) {
        try {
          if (typeof Game.godpathDeedStatus === 'function') {
            const st = Game.godpathDeedStatus('player', gh.id, day);
            snap.player.deedStatus[gh.id] = st ? { complete: !!st.complete, observed: !!st.observed, pending: !!st.pending, day: (st.day == null ? null : st.day) } : null;
          }
        } catch (e) {}
        try {
          if (S.Godhood && typeof S.Godhood.godhoodCloseness === 'function') {
            const cl = S.Godhood.godhoodCloseness(s, gh, day);
            snap.player.closeness[gh.id] = cl ? {
              kit: cl.kit, needKit: cl.needKit, coreHit: !!cl.coreHit, classOk: !!cl.classOk,
              synergy: !!cl.synergy, dayOk: !!cl.dayOk, complete: !!cl.complete,
              close: !!cl.close, readyForCapstone: !!cl.readyForCapstone } : null;
          }
        } catch (e) {}
      });
    } catch (e) { err('snapshot-player', e.message); }
    // Villagers.
    try {
      const v = Game.state.village || {};
      const roster = (v.roster || []).slice();
      snap.roster = roster;
      snap.villagers = {};
      roster.forEach(function (vid) {
        try {
          const abs = ((v.npcAbilities || {})[vid] || []).slice();
          const rec = {
            abilities: abs,
            paths: abs.map(function (id) { const p = abilityPath(Game, id); return p.path; }),
            synergies: ((v.npcSynergies || {})[vid] || []).slice(),
            godhood: clone(((v.npcGodhood || {})[vid]) || {}),
            class: null, mythic: null, deedStatus: {}, closeness: {},
            capstoneItems: [],
          };
          try { rec.class = (typeof Game.godpathClass === 'function') ? clone(Game.godpathClass(vid) || null) : null; } catch (e) {}
          try {
            if (S.Godhood && typeof S.Godhood.villagerMythicId === 'function') {
              rec.mythic = S.Godhood.villagerMythicId(Game, vid) || null;
            }
          } catch (e) {}
          try {
            const person = (typeof Game.getPerson === 'function') ? Game.getPerson(vid) : null;
            rec.capstoneItems = ((person && person.items) || []).filter(function (it) {
              return it && typeof it === 'string' && capItems[it];
            }).slice();
          } catch (e) {}
          if (abs.length >= 3) {
            const day = snap.day;
            ghs.forEach(function (gh) {
              try {
                if (typeof Game.godpathDeedStatus === 'function') {
                  const st = Game.godpathDeedStatus(vid, gh.id, day);
                  rec.deedStatus[gh.id] = st ? { complete: !!st.complete, observed: !!st.observed, pending: !!st.pending, day: (st.day == null ? null : st.day) } : null;
                }
              } catch (e) {}
              try {
                if (S.Godhood && typeof S.Godhood.villagerGodhoodCloseness === 'function') {
                  const cl = S.Godhood.villagerGodhoodCloseness(Game, vid, gh);
                  rec.closeness[gh.id] = cl ? {
                    kit: cl.kit, needKit: cl.needKit, coreHit: !!cl.coreHit, classOk: !!cl.classOk,
                    synergy: !!cl.synergy, dayOk: !!cl.dayOk, complete: !!cl.complete,
                    close: !!cl.close, readyForCapstone: !!cl.readyForCapstone } : null;
                }
              } catch (e) {}
            });
          }
          snap.villagers[vid] = rec;
        } catch (e) { err('snapshot-villager-' + vid, e.message); }
      });
      snap.godpathDeeds = clone(v.godpathDeeds || {});
      try {
        const sw = (Game.state || {}).switchboard;
        snap.switchboard = sw ? { holderId: sw.holderId || null, stage: sw.stage || null,
          appointedDay: (sw.appointedDay == null ? null : sw.appointedDay) } : null;
      } catch (e) { snap.switchboard = null; }
    } catch (e) { err('snapshot-villagers', e.message); }
    t.daily.push(snap);
    return snap;
  }

  function uninstall() {
    try {
      Object.keys(origs).forEach(function (name) {
        try { Game[name] = origs[name]; } catch (e) { err('uninstall-' + name, e.message); }
      });
    } catch (e) { err('uninstall', e.message); }
    try {
      Object.keys(origNs).forEach(function (nsName) {
        const S = globalThis.Scattering || {};
        const ns = S[nsName];
        if (!ns) return;
        Object.keys(origNs[nsName]).forEach(function (fnName) {
          try { ns[fnName] = origNs[nsName][fnName]; } catch (e) { err('uninstall-' + nsName + '.' + fnName, e.message); }
        });
      });
    } catch (e) { err('uninstall-ns', e.message); }
  }

  return { t: t, snapshot: snapshot, uninstall: uninstall };
}

module.exports = { install: install, CAPSTONE_VERBS: CAPSTONE_VERBS, TELE_TYPES: TELE_TYPES };
