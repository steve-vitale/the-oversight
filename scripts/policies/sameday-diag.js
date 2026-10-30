// sameday-diag — part/sequence-stamp recorder for sim-sameday-a
// (2026-10-30, flesh-out loop, axis scale-onramp, DIAG ONLY: zero src/js
// changes, policy-side recorder only).
//
// QUESTION (from sim-scholarmelt-a / sim-removal-a): s75102 algorithm
// 959 has a scholar fight on the SAME day as its last villager field
// meeting (d71, fightSeq 21, lift 959, lost, no restore). Scholarmelt
// judged it INSUFFICIENT-DATA under a strictly-after window; removal
// classified it SCHOLAR-MELT (EDGE) under a removal-row window. This
// recorder gives a provable within-day order between (a) the day's
// villager field-meeting log for the chain beast and (b) the scholar
// fight start for the same beast, so a follow-up prereg can admit
// same-day fights ONLY when the meeting provably precedes the fight.
//
// WHAT THE STAMP IS (stated honestly, never fabricated):
//   - dayPart: the ENGINE's own Game.dayPart value (0 dawn, 1 midday,
//     2 dusk, 3 night — game.js advancePart comment and the dayPart
//     clock; advancePart runs ONLY from tickAction's boundary
//     crossing, 4 parts per day). Recorded numeric (primary) plus
//     its name from that same 0-3 clock.
//   - seq: a global event sequence number assigned by THIS recorder
//     at pre-record time, in pre-record execution order, per seed.
//     Node sims are single-threaded, so pre-record execution order
//     IS engine event-entry order for the two wrapped entry points.
//     Sequence order within a day IS the stamp when day-parts tie;
//     the day-part is the human-readable phase when they differ.
//   - partCounter: this recorder's own advancePart count (same
//     pattern as w4dpr's advancePart wrap). An auxiliary monotonic
//     clock, never equated to w4dpr's counter (different install
//     moments) — the analyzer joins on index + (day,vid,mid,mHpStart)
//     for meetings and index + (day,intendedMid,lift) for fights,
//     never on partCounter equality.
//
// OBSERVATIONAL ONLY. SAMEDAY=1 is the only on-switch. Unset
// delegates byte-identically: no wraps installed, no ctx surface,
// no record. The wraps record AFTER delegating where the result is
// needed (fieldFight post fields), write nothing to game state
// (store arrays + a module-side counter only), draw no RNG, never
// throw into the engine (recording errors are counted, and an
// engine throw is recorded and RETHROWN unchanged), and return the
// original value untouched. The tile monster is read via
// monsterAt(map.px, map.py) with a scholar mx/my fallback — the
// same pure scan scholarmelt-diag uses, NEVER via playerMonster(),
// which can adopt a detached alias and would mutate state on a
// refused call. No object references are kept in the serialized
// store (snapshots only), so JSON.stringify of a sweep row cannot
// drag a world object (or a cycle) into the corpus. Install order
// matters and is fixed by the sweep: sameday is installed AFTER
// scholarmelt, so for startCombat the sameday wrap is outermost
// (its pre-record runs before scholarmelt's pre-record, its
// post-record after); for fieldFight it is outermost over the
// w4dpr/fieldparty wraps for the same reason. The stamp is taken
// at entry (pre-record), before any fight state changes.
'use strict';

const MAX_EVENTS = 60000;
const DAY_PART_NAMES = ['dawn', 'midday', 'dusk', 'night'];

function layerOn() { try { return process.env.SAMEDAY === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function dayPartOf(Game) {
  try {
    const p = Game.dayPart;
    return (Number.isFinite(p) ? (p | 0) : null);
  } catch (e) { return null; }
}
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }

function newStore() {
  return { events: [], errs: 0, errors: [], overflow: {}, installed: false, partCounter: 0 };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

function pushCapped(store, item) {
  if (store.events.length >= MAX_EVENTS) { store.overflow.events = (store.overflow.events || 0) + 1; return false; }
  store.events.push(item);
  return true;
}

// Module-side state per store (never serialized): the global seq counter.
const sideState = new WeakMap();
function side(store) {
  let s = sideState.get(store);
  if (!s) { s = { nextSeq: 1 }; sideState.set(store, s); }
  return s;
}

function tileMonsterOf(Game) {
  try {
    let px = null, py = null;
    try { if (Game.map && Game.map.px != null) { px = Game.map.px; py = Game.map.py; } } catch (e) {}
    if (px == null) { try { const sc = (Game.state || {}).scholar || {}; px = sc.mx; py = sc.my; } catch (e) {} }
    if (px == null) return { mon: null, px: null, py: null };
    if (typeof Game.monsterAt === 'function') {
      const m = Game.monsterAt(px, py);
      if (m) return { mon: m, px, py };
    }
    const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
    const m = (list || []).find(x => x && x.tx === px && x.ty === py) || null;
    return { mon: m, px, py };
  } catch (e) { return { mon: null, px: null, py: null }; }
}

function snapMonster(m) {
  if (!m) return null;
  return {
    id: m.id != null ? String(m.id) : null,
    hp: roundHp(m.hp), maxHp: roundHp(m.maxHp),
    tx: (m.tx != null ? m.tx : null), ty: (m.ty != null ? m.ty : null),
    titan: !!m.titan, lingering: !!m.lingering, veteran: !!m.veteran,
  };
}

function installSamedayDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._samedayDiagStore === store && Game._samedayDiagInstalled) return Game._samedayDiagUninstall || function () {};
  const uninstalls = [];
  const wrap = (name, fn) => {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = Game[name];
      Game[name] = fn(orig);
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  };
  const st = side(store);

  wrap('advancePart', (orig) => function () {
    const r = orig.apply(this, arguments);
    try { store.partCounter++; } catch (e) { noteErr(store, 'advancePart.counter', e); }
    return r;
  });

  wrap('fieldFight', (orig) => function (vid, mdef, m, opts) {
    let ev = null;
    try {
      const live = m || null;
      const mid = (live && live.id) || (mdef && mdef.id) || null;
      const dp = dayPartOf(Game);
      ev = {
        seq: st.nextSeq++,
        kind: 'field-meeting',
        day: dayOf(Game),
        dayPart: dp,
        dayPartName: (dp != null && DAY_PART_NAMES[dp]) ? DAY_PART_NAMES[dp] : null,
        partCounter: store.partCounter,
        vid: vid != null ? String(vid) : null,
        mid: mid != null ? String(mid) : null,
        mHpStart: (live && live.hp != null) ? roundHp(live.hp) : null,
        mHpLeft: null, outcome: null, rounds: null, mDealt: null,
        threw: false,
      };
      pushCapped(store, ev);
    } catch (e) { noteErr(store, 'fieldFight.pre', e); }
    let rec = null;
    try { rec = orig.apply(this, arguments); }
    catch (e) {
      try { if (ev) ev.threw = true; } catch (e2) { noteErr(store, 'fieldFight.throwRec', e2); }
      throw e;
    }
    try {
      if (ev && rec) {
        ev.mHpLeft = roundHp(rec.mHpLeft);
        ev.outcome = rec.outcome || null;
        ev.rounds = (rec.rounds != null ? (rec.rounds | 0) : null);
        ev.mDealt = (rec.mDealt != null ? (rec.mDealt | 0) : null);
      }
    } catch (e) { noteErr(store, 'fieldFight.post', e); }
    return rec;
  });

  wrap('startCombat', (orig) => function () {
    const args = Array.prototype.slice.call(arguments);
    let ev = null;
    try {
      const live = !!(Game.tbfight && !Game.tbfight.over);
      const tm = tileMonsterOf(Game);
      const intended = args[0] || null;
      let pendingId = null;
      try { pendingId = Game.pendingMonsterId || null; } catch (e) {}
      const dp = dayPartOf(Game);
      ev = {
        seq: st.nextSeq++,
        kind: live ? 'scholar-fight-refused' : 'scholar-fight-start',
        day: dayOf(Game),
        dayPart: dp,
        dayPartName: (dp != null && DAY_PART_NAMES[dp]) ? DAY_PART_NAMES[dp] : null,
        partCounter: store.partCounter,
        intendedMid: intended != null ? String(intended) : (pendingId != null ? String(pendingId) : 'bulldozer'),
        tilePx: tm.px, tilePy: tm.py,
        lift: snapMonster(tm.mon),
        threw: false,
      };
      pushCapped(store, ev);
    } catch (e) { noteErr(store, 'startCombat.pre', e); }
    let ret = null;
    try { ret = orig.apply(this, arguments); }
    catch (e) {
      try { if (ev) ev.threw = true; } catch (e2) { noteErr(store, 'startCombat.throwRec', e2); }
      throw e;
    }
    return ret;
  });

  try {
    Game._samedayDiagStore = store;
    Game._samedayDiagInstalled = true;
    Game._samedayDiagUninstall = () => { try { for (const u of uninstalls) u(); } catch (e) {} try { Game._samedayDiagInstalled = false; } catch (e) {} };
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return Game._samedayDiagUninstall || function () {};
}

module.exports = { layerOn, newStore, installSamedayDiag, DAY_PART_NAMES, MAX_EVENTS };
