// grind-instrument-20261106.js — field-grind recorder (arm sim-grind-a,
// run fleshout-loop-a-20261106T2256Z). Scripts only, zero src/js. DIAG ONLY:
// characterization, no lever.
//
// Layers on the partydamage instrument (which layers stageally, which
// layers bankkiller/killerdeath) and adds FIELD-FIGHT recording, the half
// of the grind the TB traces cannot see:
//
//  - FIELD ROWS: every Game.fieldFight call, any wave, with day, fighter
//    vid, monster id + wave, entry HP/frac, rounds, outcome, vTaken,
//    mDealt, vHpLeft, mHpLeft, volley, contact-finish attempt/kill,
//    committed-finish (twoblow), cornered hold, and the fight log.
//  - INSTANCE IDENTITY: a WeakMap assigns one stable id per world-monster
//    entity object, shared between fieldFight's `m` arg and the TB
//    trace's monster fighters — so re-fights of the SAME beast are
//    provable across channels instead of trail-read. When TB spawns a
//    fresh copy per fight the id is fresh and the analyzer falls back to
//    trail-chaining (next entry == prev mHpLeft, same mid+maxHp), a rule
//    validated on the 87008 fixture. A field row whose entry HP exceeds
//    the same instance's previous mHpLeft is flagged `regenSuspect`
//    (heal / despawn-respawn), never silently smoothed over.
//  - SCHOLAR FLAG: whether the field fighter is the current scholar, so
//    scholar deaths inside grind windows are countable from the same rows.
//
// Wrappers never throw into game code: a recording failure is counted in
// instrumentErrors and the original call's result is returned untouched.
// The wrapper adds zero RNG draws and zero game-state writes.
//
// Usage: const INST = require('./grind-instrument-20261106');
//   const inst = INST.install(Game); inst.snapshot(); ... inst.finalize(); inst.uninstall();
//   inst.t.fieldFights holds the field rows; inst.t.traces the TB traces.
'use strict';
const PARTYDAMAGE = require('./partydamage-instrument-20261106'); // unchanged base

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function scholarIdOf(Game) {
  try {
    const st = Game.state || {};
    return (st.scholar && st.scholar.id) || Game.villagerId || null;
  } catch (e) { return null; }
}

function install(Game) {
  const base = PARTYDAMAGE.install(Game);
  const t = base.t;
  t.fieldFights = [];
  t._ffSeq = 0;
  t._instSeq = 0;
  t._instIds = new WeakMap(); // world-monster entity object -> 'w<n>'
  t._instLastLeft = {}; // instId -> last recorded mHpLeft (regen detection)
  t._instOff = false;

  function instIdOf(obj) {
    if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) return null;
    try {
      let id = t._instIds.get(obj);
      if (!id) { t._instSeq += 1; id = 'w' + t._instSeq; t._instIds.set(obj, id); }
      return id;
    } catch (e) { return null; }
  }
  // Tag the TB trace's monster fighters with the same instance ids, so a
  // TB fight against a persistent world beast shares the id with the
  // field rows for that beast. Runs at trace open (startCombat already
  // wrapped by the base — we hook the trace object after the base's
  // wrapper returns, via our own startCombat wrap OUTSIDE the base's).
  // NOTE: the base restores startCombat on uninstall; our wrap sits
  // outside it and is removed first, so ordering is safe.
  const origStart = Game.startCombat;
  if (typeof origStart === 'function') {
    Game.startCombat = function () {
      let ret;
      try { ret = origStart.apply(this, arguments); }
      catch (e) { throw e; }
      try {
        if (!t._instOff && t._trace) {
          const f = Game.tbfight;
          const ids = [];
          if (f && Array.isArray(f.fighters)) {
            f.fighters.forEach(function (o) {
              if (o && (o.kind === 'monster' || o.kind === 'hostile')) ids.push(instIdOf(o));
            });
          }
          t._trace.instIds = ids;
          // The world entity behind a TB fight: the first monster fighter
          // is the entity when the fight is a wanderer meeting; record
          // its id as the trace's primary instance.
          t._trace.instId = ids.length ? ids[0] : null;
        }
      } catch (e) { t.instrumentErrors.push('startCombat-inst: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { t.instrumentErrors.push('startCombat-missing-grind'); }

  // ---- fieldFight: the field-grind row ----
  const origFF = Game.fieldFight;
  if (typeof origFF === 'function') {
    Game.fieldFight = function (vid, mdef, m, opts) {
      const d0 = dayOf(Game);
      const scholar = scholarIdOf(Game);
      let entryHp = null, entryMaxHp = null, instId = null, instIds = [];
      try {
        if (m && typeof m === 'object') {
          if (m.hp != null) entryHp = m.hp;
          if (m.maxHp != null) entryMaxHp = m.maxHp;
          instId = instIdOf(m);
          if (instId) instIds.push(instId);
        }
        // Pack members share the lead's entity; tag them too when present.
        if (m && Array.isArray(m.members)) {
          m.members.forEach(function (mm) { const id = instIdOf(mm); if (id && instIds.indexOf(id) < 0) instIds.push(id); });
        }
      } catch (e) { t.instrumentErrors.push('fieldFight-entry: ' + String(e.message).slice(0, 80)); }
      let rec = null;
      try { rec = origFF.apply(this, arguments); }
      catch (e) { throw e; }
      try {
        if (!t._instOff) {
          t._ffSeq += 1;
          const wave = (mdef && mdef.wave != null) ? (mdef.wave | 0) : null;
          const mHpLeft = (rec && rec.mHpLeft != null) ? rec.mHpLeft : null;
          let regenSuspect = false;
          if (instId && entryHp != null && t._instLastLeft[instId] != null && entryHp > t._instLastLeft[instId]) regenSuspect = true;
          if (instId && mHpLeft != null) t._instLastLeft[instId] = mHpLeft;
          const row = {
            seq: t._ffSeq, day: d0,
            vid: vid != null ? String(vid) : null,
            isScholar: scholar != null && vid != null && String(vid) === String(scholar),
            scholarAtFight: scholar,
            mid: (mdef && mdef.id) || null, wave: wave,
            instId: instId, instIds: instIds,
            entryHp: entryHp, entryMaxHp: entryMaxHp,
            entryFrac: (entryHp != null && entryMaxHp > 0) ? +(entryHp / entryMaxHp).toFixed(3) : null,
            regenSuspect: regenSuspect,
            rounds: (rec && rec.rounds != null) ? (rec.rounds | 0) : null,
            outcome: (rec && rec.outcome != null) ? String(rec.outcome) : null,
            vTaken: (rec && rec.vTaken != null) ? rec.vTaken : null,
            mDealt: (rec && rec.mDealt != null) ? rec.mDealt : null,
            vHpLeft: (rec && rec.vHpLeft != null) ? rec.vHpLeft : null,
            mHpLeft: mHpLeft,
            mHpLeftFrac: (mHpLeft != null && entryMaxHp > 0) ? +(mHpLeft / entryMaxHp).toFixed(3) : null,
            volley: (rec && rec.volley) ? rec.volley : null,
            contactFinishAttempted: !!(rec && rec.contactFinishAttempted),
            contactFinishKill: !!(rec && rec.contactFinishKill),
            contactFinishBeastHp: (rec && rec.contactFinishBeastHp != null) ? rec.contactFinishBeastHp : null,
            contactFinishDmg: (rec && rec.contactFinishDmg != null) ? rec.contactFinishDmg : null,
            committedFinish: !!(rec && rec.committedFinish),
            corneredHold: !!(rec && rec.corneredHold),
            optsKeys: opts ? Object.keys(opts) : [],
            log: (rec && Array.isArray(rec.log)) ? rec.log.slice() : [],
          };
          t.fieldFights.push(row);
        }
      } catch (e) { t.instrumentErrors.push('fieldFight-row: ' + String(e.message).slice(0, 80)); }
      return rec;
    };
  } else { t.instrumentErrors.push('fieldFight-missing'); }

  const origUninstall = base.uninstall;
  base.uninstall = function () {
    try { t._instOff = true; } catch (e) {}
    // Our startCombat wrapper calls the base's wrapper, which calls the
    // original. Restoring the base's wrapper directly is correct: the
    // base uninstall then restores the original. Restore fieldFight only
    // if it is still our wrapper (progression.js may have re-wrapped it
    // after install — never break its wrapper).
    try { if (typeof origStart === 'function') Game.startCombat = origStart; } catch (e) {}
    try { if (typeof origFF === 'function' && Game.fieldFight && Game.fieldFight.toString().indexOf('fieldFight-row') >= 0) Game.fieldFight = origFF; } catch (e) {}
    try { origUninstall(); } catch (e) {}
  };

  return base;
}

module.exports = { install: install };
