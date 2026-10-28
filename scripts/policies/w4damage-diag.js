// w4damage-diag — wave-4 inter-fight damage tracer (sim-w4damage-a,
// 2026-10-28, flesh-out loop, axis scale-onramp, DIAG ONLY: zero
// src/js changes, policy-side recorder only).
//
// QUESTION (from sim-w4lethality-rebase, 0221Z): five wave-4
// world instances show HP drops between recorded field fights
// with no recorded fight row between them (-160/-225/-250/-300/
// -300), plus a same-day 65-HP wobble (740 field vs 675 TB).
// The lethality analyzer's field chains used defwound rows only
// (resolve-routed fights) and never joined raftdraft raid rows
// into the chain, so two suspect classes were never tested at
// event level:
//   (1) the palisade raid toll (havenGrowth.js havenRaidTick:
//       wall = round(maxHp * 0.25), hp = max(1, hp - wall)) —
//       raftdraft records it only as a COMPUTED value plus a
//       post-call index match, never as a per-object event;
//   (2) direct fieldFight callers that bypass
//       resolveWildMonsterEncounter — resolvePatrol, aidFight,
//       lingererSortie — which defwound never sees at all.
// This recorder closes both, at event level, with seq linkage:
//   (a) wraps Game.fieldFight (the choke point — every router
//       funnels through it): pre-HP, rec damage/end-HP, and a
//       caller-stack classification (resolve / patrol / aid /
//       sortie / other), keyed by the spawnsrc seq tag;
//   (b) wraps Game.havenRaidTick: per-OBJECT pre/post HP (live
//       object references, keyed to seq — never an index match
//       and never a computed value), with the toll wall the
//       code formula predicts, so a toll row is an observed
//       event, not arithmetic;
//   (c) daily world-HP snapshots (policy daily, after
//       delegating): seq -> {type, wave, hp, maxHp} for every
//       world monster, so any delta covered by neither (a) nor
//       (b) is bracketed to a day and reported as residual.
// NOTE: an older recorder scripts/policies/w4dmg-diag.js (from
// sim-w4dmg-a, 2026-10-26) already wraps fieldFight for a
// different arm's decomposition question. This file is separate
// and does NOT reuse or edit it: this arm's trace must be
// self-contained (caller classification + per-object raidTick +
// snapshots in one store), and composing both would double-wrap
// fieldFight for no benefit. The older file is left untouched
// and is NOT in this arm's composition.
// OBSERVATIONAL ONLY. W4DMG=1 is the only on-switch. Unset
// delegates byte-identically: no wraps installed, no ctx
// surface, no record. Wraps record AFTER delegating (raidTick:
// before + after), write nothing to game state, draw no RNG,
// never throw into the engine (recording errors are counted),
// and return the original value untouched.
'use strict';

const MAX_EVENTS = 40000;

function layerOn() { try { return process.env.W4DMG === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }

function newStore() {
  return {
    fieldFights: [], raidTicks: [], snapshots: [],
    errs: 0, errors: [], overflow: {},
    installed: false,
  };
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
// Order matters: aidFight is called FROM resolve paths, so aid
// must be checked before resolve; sortie/patrol call fieldFight
// directly, so they appear without a resolve frame.
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
  return { cls: cls, stack: names.slice(0, 10).join(',') };
}

function snapshotWorld(Game) {
  const out = [];
  try {
    const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
    for (const m of list) {
      if (!m) continue;
      out.push({
        seq: seqOf(m), type: m.id || null, wave: waveOf(Game, m),
        hp: roundHp(m.hp), maxHp: roundHp(m.maxHp),
        tx: m.tx, ty: m.ty, lingering: !!m.lingering,
      });
    }
  } catch (e) { /* snapshot best-effort; caller records the error */ }
  return out;
}

function installW4damageDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._w4damageDiagStore === store && Game._w4damageDiagInstalled) return Game._w4damageDiagUninstall || function () {};
  const uninstalls = [];
  const wrap = (name, fn) => {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = Game[name];
      Game[name] = fn(orig);
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  };

  // (a) fieldFight: every router, seq-linked, caller-classified.
  // Signature (vid, mdef, m, opts). The villager-agency outdoor
  // call passes the monster object as mdef and null as m — so seq
  // is read from m first, then from mdef when m is null.
  wrap('fieldFight', (orig) => function (vid, mdef, m, opts) {
    const caller = classifyCaller();
    let preHp = null, preMax = null, seq = null, mid = null, wave = 1;
    try {
      const live = m || null;
      const defObj = mdef || null;
      seq = seqOf(live);
      if (seq == null) seq = seqOf(defObj);
      mid = (live && live.id) || (defObj && defObj.id) || null;
      if (live && live.hp != null) { preHp = roundHp(live.hp); preMax = roundHp(live.maxHp); }
      else if (defObj && defObj.hp != null) { preHp = roundHp(defObj.hp); preMax = roundHp(defObj.maxHp); }
      wave = waveOf(Game, live || defObj);
    } catch (e) { noteErr(store, 'fieldFight.pre', e); }
    const rec = orig.apply(this, arguments);
    try {
      let postHp = null;
      try {
        if (m && m.hp != null) postHp = roundHp(m.hp);
        else if (rec && rec.mHpLeft != null) postHp = roundHp(rec.mHpLeft);
      } catch (e) { /* post best-effort */ }
      pushCapped(store, 'fieldFights', {
        day: dayOf(Game), vid: vid != null ? String(vid) : null,
        seq: seq, mid: mid, wave: wave,
        caller: caller.cls, stack: caller.stack,
        worldMonster: !!m,
        mHpStart: preHp, mHpMax: preMax,
        outcome: rec ? (rec.outcome || null) : null,
        rounds: rec ? (rec.rounds | 0) : null,
        mDealt: rec ? (rec.mDealt | 0) : null,
        mHpLeft: rec ? roundHp(rec.mHpLeft) : null,
        mHpPost: postHp,
      });
    } catch (e) { noteErr(store, 'fieldFight.rec', e); }
    return rec;
  });

  // (b) havenRaidTick: per-object pre/post HP across the tick.
  // The pre snapshot holds live object references; the post read
  // re-reads those SAME objects, so a toll row is observed on
  // that object, never matched by index and never computed.
  // Field fights that run inside the tick window are counted
  // (start/end row indices) so the analyzer can tell a pure toll
  // (no fieldFight row for the seq in-window) from a toll-plus-
  // fight (a fieldFight row in-window for the seq).
  wrap('havenRaidTick', (orig) => function () {
    let pre = null, ffStart = store.fieldFights.length, day = dayOf(Game);
    try {
      const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
      pre = list.map(m => ({
        obj: m, seq: seqOf(m), type: m.id || null, wave: waveOf(Game, m),
        hp: roundHp(m.hp), maxHp: roundHp(m.maxHp), tx: m.tx, ty: m.ty,
      }));
    } catch (e) { noteErr(store, 'raid.pre', e); }
    const r = orig.apply(this, arguments);
    try {
      day = dayOf(Game);
      const ffEnd = store.fieldFights.length;
      let palisade = null;
      try { palisade = (typeof Game.havenTier === 'function') ? (Game.havenTier() >= 2) : null; } catch (e) { palisade = null; }
      const changes = [];
      for (const p of (pre || [])) {
        let postHp = null, postTx = null, postTy = null, present = false;
        try {
          if (p.obj) { present = true; postHp = roundHp(p.obj.hp); postTx = p.obj.tx; postTy = p.obj.ty; }
        } catch (e) { present = false; }
        if (present && postHp !== p.hp) {
          const wall = (palisade && p.maxHp != null) ? Math.round(p.maxHp * 0.25) : 0;
          changes.push({
            seq: p.seq, type: p.type, wave: p.wave,
            preHp: p.hp, maxHp: p.maxHp, postHp: postHp,
            delta: (postHp != null && p.hp != null) ? (postHp - p.hp) : null,
            wall: wall, tollExact: (palisade && p.hp != null && postHp != null && (postHp - p.hp) === -wall),
            preTx: p.tx, preTy: p.ty, postTx: postTx, postTy: postTy,
          });
        }
      }
      const inWindow = store.fieldFights.slice(ffStart, ffEnd);
      pushCapped(store, 'raidTicks', {
        day: day, palisade: palisade,
        ffWindowStart: ffStart, ffWindowEnd: ffEnd,
        ffInWindow: inWindow.map(f => ({ seq: f.seq, mid: f.mid, caller: f.caller, outcome: f.outcome, mDealt: f.mDealt })),
        changes: changes,
      });
    } catch (e) { noteErr(store, 'raid.rec', e); }
    return r;
  });

  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._w4damageDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._w4damageDiagStore = store;
    Game._w4damageDiagInstalled = true;
    Game._w4damageDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function snapshotW4damage(Game, store) {
  try {
    pushCapped(store, 'snapshots', { day: dayOf(Game), present: snapshotWorld(Game) });
  } catch (e) { noteErr(store, 'snapshot', e); }
}

function withW4damageDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installW4damageDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._w4damage = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
        try { snapshotW4damage(Game, st); } catch (e) { noteErr(st, 'daily.snapshot', e); }
      }
      return r;
    },
  });
}

module.exports = { layerOn, newStore, installW4damageDiag, withW4damageDiag, snapshotW4damage, classifyCaller, MAX_EVENTS };
