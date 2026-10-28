// partyfinish-diag — sim-partyfinish-a gear/party recorder (measurement only).
//
// Wraps Game.fieldFight at sweep install time (same pattern as
// w4damage-diag, which is NEVER edited). For EVERY field fight it
// records, pre-call: party size (opts.allies + 1), opts.cornered,
// and the leader's gear computed the same way fieldFight does
// (wb = round((melee + ranged) / 2) via S.equipment.weaponBonusOf,
// armor P via S.equipment.armorOf; both null when the equipment API
// is unavailable — a null-gear row can never count toward GO).
// Post-call: outcome, rounds, mDealt, mHpLeft, rec.corneredHold.
// The recorder changes nothing: it never writes game state, draws
// no RNG, and never throws into the engine (all reads best-effort).
'use strict';

const MAX_EVENTS = 60000;

function newStore() {
  return { fights: [], errs: 0, errors: [], overflow: {}, installed: false };
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
function dayOf(Game) {
  try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; }
}
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
function resolveEquipment() {
  // Equipment publishes to window.S (the global S namespace in the
  // node harness, where window === global at eval) AND to
  // globalThis.Scattering.equipment (the 2026-10-09 bridge). fieldFight
  // reads _g.S.equipment; mirror that resolution order here.
  try {
    const gt = (typeof globalThis !== 'undefined') ? globalThis : {};
    if (gt.S && gt.S.equipment && gt.S.equipment.weaponBonusOf) return gt.S.equipment;
    if (gt.Scattering && gt.Scattering.equipment && gt.Scattering.equipment.weaponBonusOf) return gt.Scattering.equipment;
    if (gt.Scattering && gt.Scattering.S && gt.Scattering.S.equipment && gt.Scattering.S.equipment.weaponBonusOf) return gt.Scattering.S.equipment;
  } catch (e) { /* fall through */ }
  return null;
}
function gearOf(Game, vid) {
  // Mirror of fieldFight's gear-up reads. Returns { wb, armor } with
  // nulls (never invented numbers) when the API or villager is missing.
  try {
    const eq = resolveEquipment();
    if (!eq || !eq.weaponBonusOf || !eq.armorOf) return { wb: null, armor: null };
    const S = { equipment: eq };
    const data = Game.data || {};
    const vp = ((data.villagers || []).find(x => x && x.id === vid) ||
      (data.background_survivors || []).find(x => x && x.id === vid)) || {};
    const items = data.items || [];
    const melee = S.equipment.weaponBonusOf(vp, items, 'melee') || 0;
    const ranged = S.equipment.weaponBonusOf(vp, items, 'ranged') || 0;
    return { wb: Math.round((melee + ranged) / 2), armor: S.equipment.armorOf(vp, items) || 0 };
  } catch (e) { return { wb: null, armor: null }; }
}

function installPartyfinishDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._partyfinishDiagStore === store && Game._partyfinishDiagInstalled) return Game._partyfinishDiagUninstall || function () {};
  const uninstalls = [];
  try {
    if (typeof Game.fieldFight !== 'function') { noteErr(store, 'fieldFight.missing', new Error('no fieldFight')); return function () {}; }
    const orig = Game.fieldFight;
    Game.fieldFight = function (vid, mdef, m, opts) {
      const caller = classifyCaller();
      let pre = null;
      try {
        const live = m || null;
        const defObj = mdef || null;
        const gear = gearOf(Game, vid);
        pre = {
          day: dayOf(Game), vid: vid != null ? String(vid) : null,
          seq: seqOf(live) != null ? seqOf(live) : seqOf(defObj),
          mid: (live && live.id) || (defObj && defObj.id) || null,
          wave: (defObj && defObj.wave) || (live && live.wave) || 1,
          caller: caller.cls, stack: caller.stack,
          worldMonster: !!m,
          mHpStart: (live && live.hp != null) ? Math.round(live.hp) : ((defObj && defObj.hp != null) ? Math.round(defObj.hp) : null),
          mHpMax: (live && live.maxHp != null) ? Math.round(live.maxHp) : ((defObj && defObj.maxHp != null) ? Math.round(defObj.maxHp) : null),
          allies: (opts && opts.allies) || 0,
          partySize: ((opts && opts.allies) || 0) + 1,
          cornered: !!(opts && opts.cornered),
          wb: gear.wb, armor: gear.armor,
        };
      } catch (e) { noteErr(store, 'fieldFight.pre', e); }
      const rec = orig.apply(this, arguments);
      try {
        if (pre) {
          pre.outcome = rec ? (rec.outcome || null) : null;
          pre.rounds = rec ? (rec.rounds | 0) : null;
          pre.mDealt = rec ? (rec.mDealt | 0) : null;
          pre.mHpLeft = rec ? Math.round(rec.mHpLeft) : null;
          pre.corneredHold = !!(rec && rec.corneredHold);
          pushCapped(store, 'fights', pre);
        }
      } catch (e) { noteErr(store, 'fieldFight.rec', e); }
      return rec;
    };
    uninstalls.push(() => { try { Game.fieldFight = orig; } catch (e) {} });
  } catch (e) { noteErr(store, 'fieldFight.wrap', e); }
  Game._partyfinishDiagStore = store;
  Game._partyfinishDiagInstalled = true;
  Game._partyfinishDiagUninstall = function () { for (const u of uninstalls) { try { u(); } catch (e) {} } Game._partyfinishDiagInstalled = false; };
  store.installed = true;
  return Game._partyfinishDiagUninstall;
}

function layerOn() { try { return process.env.PARTYDIAG === '1'; } catch (e) { return false; } }

function withPartyfinishDiag(inner, id, desc, store) {
  const st = store || newStore();
  const out = Object.assign({}, inner, { id: id, desc: desc });
  const origDaily = inner.daily ? inner.daily.bind(inner) : null;
  out.daily = function (Game, ctx) {
    const r = origDaily ? origDaily(Game, ctx) : undefined;
    if (layerOn()) {
      try { installPartyfinishDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
      try { ctx._partyfinish = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
    }
    return r;
  };
  return out;
}

module.exports = { layerOn, newStore, installPartyfinishDiag, withPartyfinishDiag, MAX_EVENTS };
