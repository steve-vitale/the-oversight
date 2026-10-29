// w4dpr-diag — wave-4 per-round damage/survival recorder (sim-w4dpr2,
// 2026-10-29, flesh-out loop, axis scale-onramp, DIAG ONLY: zero
// src/js changes, policy-side recorder only).
//
// QUESTION (from sim-fieldability-a, sim-sortiedpr-a, sim-staying-a,
// sim-chainkill-a): field fights are judged only on totals (mDealt,
// rounds, outcome). This recorder supplies the missing channel: the
// engine's own round transcript (fieldFight's rec.log, stored
// verbatim) plus fight-time loadout, so the analyzer can decompose
// each wave-4 field fight per round — damage dealt/taken per round
// by composition/loadout, survival rounds, and the break reason —
// without re-simulating or modeling anything.
//
// OBSERVATIONAL ONLY. W4DPR=1 is the only on-switch. Unset
// delegates byte-identically: no wraps installed, no ctx surface,
// no record. Wraps record AFTER delegating (the record needs the
// result, including rec.log), pre-reads are pure state reads taken
// before the call, never writes (equipped read via the villager
// record's own equipped object, never a setter; nodePos never
// touched here at all), draw no RNG, never throw into the engine
// (recording errors are counted, and an engine throw is recorded
// and RETHROWN unchanged), and return the original value
// untouched. Installed alongside fieldparty-form-diag (both wrap
// fieldFight; stacking order is irrelevant because both pre-reads
// are pure and both post-writes touch only their own store).
//
// WHAT IS STORED: one entry per fieldFight call, in call order
// (the analyzer joins to the fieldparty record by fight-order
// index and verifies mid/vid/day at every index — the returns
// join method). Minimal fields for every fight (so the join
// index aligns); full detail (rec.log verbatim, loadout,
// rec flags) only for wave 3/4 fights, which bound the corpus
// size. Wave is read from the monster def / crisisWaveOf, the
// same waveOf logic as fieldparty-form-diag and returns-diag.
// Loadout is recorded pre AND post fight: fieldFight calls
// gearUp at entry, which can change equipped, so the post
// fight equipped is the closer read of what the fight used;
// the analyzer prefers post, falls back to pre, and discloses
// which it used. Spear-in-ranged-slot competition is visible
// in these ids (a spear in ranged + no melee = spear config;
// a bow carried but not equipped shows in carriedWeaponIds).
'use strict';

const MAX_EVENTS = 60000;
const MAX_LOG_LINES = 500;

function layerOn() { try { return process.env.W4DPR === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }

function newStore() {
  return { meetings: [], partCounter: 0, errs: 0, errors: [], overflow: {}, installed: false };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

function pushCapped(store, list, item) {
  if (store[list].length >= MAX_EVENTS) { store.overflow[list] = (store.overflow[list] || 0) + 1; return false; }
  store[list].push(item);
  return true;
}

function seqOf(m) {
  try { return (m && m._spawnSeq != null) ? m._spawnSeq : null; } catch (e) { return null; }
}
function waveOf(Game, m) {
  try {
    if (m && m.id && typeof Game.crisisWaveOf === 'function') {
      const w = Game.crisisWaveOf(m) | 0;
      if (w) return w;
    }
  } catch (e) { /* fall through */ }
  try {
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === (m && m.id));
    if (def && (def.wave | 0)) return def.wave | 0;
  } catch (e) { /* fall through */ }
  return 1;
}

// First-name as the fight log prints it: mirrors fieldFights.js
// refName (firstRef for non-scholar villagers, else displayName
// first token). Used ONLY to attribute log lines to leader vs
// ally in the analyzer; never fed back into the engine.
function firstName(Game, vid) {
  try {
    if (vid && vid !== Game.villagerId && typeof Game.firstRef === 'function') {
      const f = Game.firstRef(vid);
      if (f) return String(f);
    }
  } catch (e) { /* fall through */ }
  try {
    if (vid && typeof Game.displayName === 'function') return String(Game.displayName(vid)).split(' ')[0];
  } catch (e) { /* fall through */ }
  return 'Someone';
}

function vpOf(Game, vid) {
  try {
    const vs = (Game.data && Game.data.villagers) || [];
    const bs = (Game.data && Game.data.background_survivors) || [];
    for (const list of [vs, bs]) {
      const hit = list.find(x => x && x.id === vid);
      if (hit) return hit;
    }
  } catch (e) { /* null stands */ }
  return null;
}

function itemIdOf(e) {
  if (!e) return null;
  if (typeof e === 'string') return e;
  return e.itemId || e.id || null;
}

// Equipped weapon ids + carried weapon ids, pure reads only.
function loadoutOf(Game, vid) {
  const out = { melee: null, ranged: null, carriedWeapons: [] };
  try {
    if (vid === Game.villagerId || vid === 'player') {
      try {
        const ew = (typeof Game.equippedWeapon === 'function') ? Game.equippedWeapon() : null;
        out.melee = ew ? (ew.id || ew.itemId || null) : null;
      } catch (e) { /* null stands */ }
      try {
        const inv = ((Game.state && Game.state.scholar && Game.state.scholar.inventory) || []);
        const defs = (Game.data && Game.data.items) || [];
        for (const e of inv) {
          const iid = itemIdOf(e);
          const def = defs.find(d => d && d.id === iid);
          if (def && def.weapon && out.carriedWeapons.indexOf(iid) < 0) out.carriedWeapons.push(iid);
        }
      } catch (e) { /* keep */ }
      return out;
    }
    const vp = vpOf(Game, vid);
    if (!vp) return out;
    const eq = vp.equipped || {};
    out.melee = itemIdOf(eq.melee || eq.weapon);
    out.ranged = itemIdOf(eq.ranged);
    try {
      const defs = (Game.data && Game.data.items) || [];
      for (const e of (vp.items || [])) {
        const iid = itemIdOf(e);
        const def = defs.find(d => d && d.id === iid);
        if (def && def.weapon && out.carriedWeapons.indexOf(iid) < 0) out.carriedWeapons.push(iid);
      }
    } catch (e) { /* keep */ }
  } catch (e) { /* nulls stand */ }
  return out;
}

function installW4dprDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._w4dprDiagStore === store && Game._w4dprDiagInstalled) return Game._w4dprDiagUninstall || function () {};
  const uninstalls = [];
  const wrap = (name, fn) => {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = Game[name];
      Game[name] = fn(orig);
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  };

  wrap('advancePart', (orig) => function () {
    const r = orig.apply(this, arguments);
    try { store.partCounter++; } catch (e) { noteErr(store, 'advancePart.counter', e); }
    return r;
  });

  wrap('fieldFight', (orig) => function (vid, mdef, m, opts) {
    let pre = null;
    try {
      const live = m || null;
      const defObj = mdef || null;
      const mid = (live && live.id) || (defObj && defObj.id) || null;
      pre = {
        day: dayOf(Game), part: store.partCounter,
        vid: vid != null ? String(vid) : null,
        seq: seqOf(live) != null ? seqOf(live) : seqOf(defObj),
        mid: mid, wave: waveOf(Game, live || defObj),
        mHpStart: (live && live.hp != null) ? roundHp(live.hp) : null,
        leaderFirst: firstName(Game, vid),
        loadoutPre: loadoutOf(Game, vid),
        allyVids: (opts && Array.isArray(opts.allyVids)) ? opts.allyVids.slice().map(a => (a != null ? String(a) : null)) : [],
        engineAllies: (opts && opts.allies != null) ? (opts.allies | 0) : null,
        allyFromStart: !!(opts && opts.allyFromStart),
        cornered: !!(opts && opts.cornered),
      };
    } catch (e) { noteErr(store, 'fieldFight.pre', e); }
    let rec = null;
    try { rec = orig.apply(this, arguments); }
    catch (e) {
      try { if (pre) { pre.threw = true; pre.error = String((e && e.message) || e).slice(0, 120); pushCapped(store, 'meetings', pre); } } catch (e2) { noteErr(store, 'fieldFight.throwRec', e2); }
      throw e;
    }
    try {
      if (pre) {
        pre.outcome = rec ? (rec.outcome || null) : null;
        pre.rounds = rec ? (rec.rounds | 0) : null;
        pre.mDealt = rec ? (rec.mDealt | 0) : null;
        pre.vTaken = rec ? (rec.vTaken | 0) : null;
        pre.mHpLeft = rec ? roundHp(rec.mHpLeft) : null;
        pre.vHpLeft = rec ? roundHp(rec.vHpLeft) : null;
        pre.intent = rec ? (rec.intent || null) : null;
        pre.intentWhy = rec ? (rec.intentWhy || null) : null;
        pre.everHopeless = rec ? !!rec.everHopeless : null;
        pre.everWinning = rec ? !!rec.everWinning : null;
        pre.fleeLearn = rec ? !!rec.fleeLearn : null;
        pre.fleeHopeless = rec ? !!rec.fleeHopeless : null;
        pre.fleeWise = rec ? !!rec.fleeWise : null;
        pre.fleeHpFrac = (rec && rec.fleeHpFrac != null) ? rec.fleeHpFrac : null;
        pre.minHpFrac = (rec && rec.minHpFrac != null) ? rec.minHpFrac : null;
        pre.calledHelp = rec ? !!rec.calledHelp : null;
        pre.joinedAllyVid = (rec && rec.allyVid != null) ? String(rec.allyVid) : null;
        pre.allyDealt = rec ? (rec.allyDealt | 0) : null;
        pre.allyTaken = rec ? (rec.allyTaken | 0) : null;
        pre.allyHpLeft = rec ? roundHp(rec.allyHpLeft) : null;
        pre.trickLog = rec ? ((rec.trickLog || []).slice()) : null;
        pre.allyFirst = pre.joinedAllyVid ? firstName(Game, pre.joinedAllyVid) : null;
        pre.loadoutPost = loadoutOf(Game, vid);
        // Full log verbatim ONLY for wave 3/4 (the decomposition +
        // contrast universes); other waves stay minimal so the
        // join index still aligns without bloating the corpus.
        if (pre.wave === 3 || pre.wave === 4) {
          try {
            const log = (rec && Array.isArray(rec.log)) ? rec.log.slice(0, MAX_LOG_LINES) : [];
            pre.log = log.map(l => String(l));
            pre.logTruncated = (rec && Array.isArray(rec.log) && rec.log.length > MAX_LOG_LINES);
          } catch (e) { pre.log = []; pre.logTruncated = false; noteErr(store, 'fieldFight.logCopy', e); }
        }
        pushCapped(store, 'meetings', pre);
      }
    } catch (e) { noteErr(store, 'fieldFight.rec', e); }
    return rec;
  });

  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._w4dprDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._w4dprDiagStore = store;
    Game._w4dprDiagInstalled = true;
    Game._w4dprDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withW4dprDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installW4dprDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._w4dpr = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

module.exports = { layerOn, newStore, installW4dprDiag, withW4dprDiag, MAX_EVENTS };
