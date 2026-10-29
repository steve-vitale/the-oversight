// returns-diag — deliberate-returns recorder (sim-returns-a, 2026-10-29,
// flesh-out loop, axis scale-onramp, DIAG ONLY: zero src/js changes,
// policy-side recorder only).
//
// QUESTION (from sim-chainkill-a, run 2115Z): chains were accidental
// re-meetings, never deliberate returns — but the chainkill corpus
// records no travel intent, so "never deliberate" was an inference
// from absence, not a measurement. This recorder supplies the
// missing channel: for every field fight, the leader's LIVE travel
// intent (current objective, HUNT provenance) and fight memory
// (monsterSightings) as they stood BEFORE the fight, plus every
// HUNT departure (objDepart) and every spent memory (drop record
// = a HUNT arrival at a remembered tile whose quarry is gone —
// objDropMonsterSighting's only caller in src/js is the HUNT
// arrival path in villager-objectives.js objAwayStep).
//
// DELIBERATE, per the prereg, is NEVER inferred from the outcome:
// leader objective kind HUNT, state 'out', huntMid == meeting mid,
// AND a pre-meeting sighting for that mid strictly before the
// meeting's (day, dayPart). The classifier lives in
// scripts/test-returns-a.js, never here: this file only records.
//
// OBSERVATIONAL ONLY. RETURNS=1 is the only on-switch. Unset
// delegates byte-identically: no wraps installed, no ctx surface,
// no record. Wraps record AFTER delegating where the record needs
// the result (fieldFight post-fields) and BEFORE where the record
// must predate the engine (fieldFight pre-reads, departure post-
// call copy, drop args); pre-reads are pure state reads taken
// before the call, never writes (objectives read via
// state.village.objectives[vid] directly — NEVER objOf(), which
// CREATES entries; nodePos read directly — never npcNode(), which
// CREATES entries), draw no RNG, never throw into the engine
// (recording errors are counted, and an engine throw is recorded
// and RETHROWN unchanged), and return the original value
// untouched. Installed at sweep setup alongside
// fieldparty-form-diag (both wrap fieldFight; stacking order is
// irrelevant because both pre-reads are pure and both post-
// writes touch only their own store).
//
// PART SCALES, READ CAREFULLY: the meeting record carries BOTH
// `part` (this recorder's own advancePart counter, the
// chainkill-style ordering scale) AND `dayPart` (Game.dayPart,
// the scale objNoteMonsterSighting stamps into memory entries).
// The pre-meeting test in the analyzer compares (day, dayPart)
// of a sighting against (day, dayPart) of the meeting — never
// the recorder counter against a memory stamp. A sighting whose
// (day, dayPart) is not strictly before the meeting's is NOT
// pre-meeting (the meeting's own memory write happens after
// the fight and must never classify its own meeting).
'use strict';

const MAX_EVENTS = 60000;

function layerOn() { try { return process.env.RETURNS === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function dayPartOf(Game) { try { return (Game.dayPart != null) ? (Game.dayPart | 0) : null; } catch (e) { return null; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }

function newStore() {
  return { meetings: [], departures: [], drops: [], partCounter: 0, errs: 0, errors: [], overflow: {}, installed: false };
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

// Caller classification from the Error stack at wrap entry.
// Same classifier as fieldparty-form-diag (order matters:
// aid before resolve; sortie/patrol call fieldFight directly).
// This copy is a backup only — the analyzer joins to the
// fieldparty record's caller for the judged universe.
function classifyCaller() {
  let stack = '';
  try { stack = (new Error()).stack || ''; } catch (e) { stack = ''; }
  const names = [];
  try {
    for (const line of stack.split('\n')) {
      const m = line.match(/at\s+(?:Object\.)?([A-Za-z_$][\w$]*)/);
      if (m && names.indexOf(m[1]) < 0) names.push(m[1]);
    }
  } catch (e) { /* names best-effort */ }
  let cls = 'other';
  if (names.indexOf('lingererSortie') >= 0) cls = 'sortie';
  else if (names.indexOf('resolvePatrol') >= 0) cls = 'patrol';
  else if (names.indexOf('aidFight') >= 0) cls = 'aid';
  else if (names.indexOf('resolveWildMonsterEncounter') >= 0) cls = 'resolve';
  return { cls: cls, stack: names.slice(0, 20).join(','), expedition: /expedition/i.test(stack) };
}

function copyObjective(o) {
  if (!o || typeof o !== 'object') return null;
  return {
    kind: o.kind || null, purpose: o.purpose || null, state: o.state || null,
    tx: (o.tx != null) ? o.tx : null, ty: (o.ty != null) ? o.ty : null,
    huntMid: o.huntMid || null, huntTx: (o.huntTx != null) ? o.huntTx : null,
    huntTy: (o.huntTy != null) ? o.huntTy : null, huntDay: (o.huntDay != null) ? o.huntDay : null,
    indoor: !!o.indoor, targetVid: o.targetVid || null,
  };
}
function copySightings(list) {
  if (!Array.isArray(list)) return [];
  return list.filter(e => e && e.mid).map(e => ({
    mid: e.mid, tx: (e.tx != null) ? e.tx : null, ty: (e.ty != null) ? e.ty : null,
    day: (e.day != null) ? e.day : null, part: (e.part != null) ? e.part : null,
  }));
}

function installReturnsDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._returnsDiagStore === store && Game._returnsDiagInstalled) return Game._returnsDiagUninstall || function () {};
  const uninstalls = [];
  let raidDepth = 0;
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

  wrap('havenRaidTick', (orig) => function () {
    raidDepth++;
    try { return orig.apply(this, arguments); }
    finally { raidDepth--; }
  });

  wrap('fieldFight', (orig) => function (vid, mdef, m, opts) {
    const caller = classifyCaller();
    const inRaid = raidDepth > 0;
    let pre = null;
    try {
      const live = m || null;
      const defObj = mdef || null;
      const mid = (live && live.id) || (defObj && defObj.id) || null;
      const village = (Game.state && Game.state.village) || {};
      const objectives = village.objectives || {};
      const sightings = village.monsterSightings || {};
      const nodePos = village.nodePos || {};
      const mTile = (live && typeof live.tx === 'number' && typeof live.ty === 'number')
        ? { tx: live.tx, ty: live.ty } : null;
      const allyVids = (opts && Array.isArray(opts.allyVids)) ? opts.allyVids.slice() : [];
      const allySightings = {};
      for (const av of allyVids) {
        try { allySightings[String(av)] = copySightings(sightings[av]); } catch (e) { allySightings[String(av)] = []; }
      }
      const leaderNode = nodePos[vid] || null;
      pre = {
        day: dayOf(Game), part: store.partCounter, dayPart: dayPartOf(Game),
        vid: vid != null ? String(vid) : null,
        seq: seqOf(live) != null ? seqOf(live) : seqOf(defObj), mid: mid, wave: waveOf(Game, live || defObj),
        caller: caller.cls, stack: caller.stack,
        channel: (!m && caller.expedition) ? 'other' : (inRaid ? 'raid' : 'field'),
        mTile: mTile,
        mHpStart: (live && live.hp != null) ? roundHp(live.hp) : null,
        leaderObjective: copyObjective(objectives[vid]),
        leaderSightings: copySightings(sightings[vid]),
        allySightings: allySightings,
        leaderNode: leaderNode ? { nx: leaderNode.nx, ny: leaderNode.ny } : null,
        allyVids: allyVids.map(a => (a != null ? String(a) : null)),
        engineAllies: (opts && opts.allies != null) ? (opts.allies | 0) : null,
        cornered: !!(opts && opts.cornered),
        allyFromStart: !!(opts && opts.allyFromStart),
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
        pre.calledHelp = rec ? !!rec.calledHelp : null;
        pre.joinedAllyVid = (rec && rec.allyVid != null) ? String(rec.allyVid) : null;
        pushCapped(store, 'meetings', pre);
      }
    } catch (e) { noteErr(store, 'fieldFight.rec', e); }
    return rec;
  });

  // HUNT departures: post-call objective copy is the departure truth.
  wrap('objDepart', (orig) => function (vid, obj, hx, hy, playerAtHaven) {
    let r = null;
    try { r = orig.apply(this, arguments); }
    catch (e) { throw e; }
    try {
      pushCapped(store, 'departures', {
        day: dayOf(Game), part: store.partCounter, dayPart: dayPartOf(Game),
        vid: vid != null ? String(vid) : null,
        objective: copyObjective(obj),
      });
    } catch (e) { noteErr(store, 'objDepart.rec', e); }
    return r;
  });

  // Spent memories: the HUNT-arrival path is this function's only caller.
  wrap('objDropMonsterSighting', (orig) => function (vid, mid, tx, ty) {
    let r = null;
    try { r = orig.apply(this, arguments); }
    catch (e) { throw e; }
    try {
      pushCapped(store, 'drops', {
        day: dayOf(Game), part: store.partCounter, dayPart: dayPartOf(Game),
        vid: vid != null ? String(vid) : null,
        mid: mid || null, tx: (tx != null) ? tx : null, ty: (ty != null) ? ty : null,
        dropped: !!r,
      });
    } catch (e) { noteErr(store, 'objDropMonsterSighting.rec', e); }
    return r;
  });

  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._returnsDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._returnsDiagStore = store;
    Game._returnsDiagInstalled = true;
    Game._returnsDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withReturnsDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installReturnsDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._returns = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

module.exports = { layerOn, newStore, installReturnsDiag, withReturnsDiag, MAX_EVENTS };
