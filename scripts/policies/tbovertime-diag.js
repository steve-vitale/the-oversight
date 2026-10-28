// tbovertime-diag — TB overtime-tier recorder for sim-tbovertime-a
// (flesh-out loop, axis scale-onramp, 2026-10-28, DIAG ONLY: zero
// src/js changes, policy-side only).
//
// QUESTION (tracker blank 3, flagged by sim-fighterconstruct-a):
// the 75103 d178 suburb fight's START was already 3688/3688 on
// construction 1475 x2.5 overtime, so part of w4convert's "TB
// scales the monster up" reading was pre-fight overtime scaling
// at start, not growth inside the fight. This recorder supplies
// the missing direct instrument: the overtime tier AT FIGHT
// TIME, read from the engine itself (Game.overtimeTier()), so
// the construction -> start -> end join never has to infer the
// tier from the HP ratio alone. It records:
//   (a) at startCombat pre: overtimeTier() + overtimeActive();
//   (b) at startCombat post: tier again, f.otTier, and every
//       fighter's otTier flag + hp/maxHp (the post-overtime,
//       post-opening-turns snapshot moment, same moment as the
//       nonworldkill post-start snapshot);
//   (c) at tbEnd pre: tier again + the fight-end fighter
//       snapshot (same moment as the tbdmg tbEnds snapshot).
// The analyzer joins (a)/(b)/(c) to the fighterconstruct
// construction snapshot, the nonworldkill start, and the
// tbdmg tbEnd by fightId, and checks the direct tier against
// the ratio-inferred tier (t_inf = round((startMax/constrMax
// - 1) / 0.25)) and against startMax = round(constrMax *
// (1 + 0.25*t_rec)).
//
// OBSERVATIONAL ONLY. TBOVERTIME=1 is the only on-switch.
// Unset it delegates byte-identically: no wraps installed, no
// ctx surface, no record. The wraps record pure reads only,
// write nothing to game state (store arrays only, plus the
// same installed-flag class the other recorders use), draw no
// RNG, never throw into the engine (recording errors are
// counted), and return the original value untouched.
// Refused startCombat calls (a fight already live) are
// flagged liveFightPre and carry no new-fight post fighters:
// their post snapshot would describe the OLD live fight, so
// the analyzer excludes them from the tier map.
'use strict';

const MAX_EVENTS = 20000;

function layerOn() { try { return process.env.TBOVERTIME === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }

function newStore() {
  return {
    starts: [], ends: [],
    errs: 0, errors: [],
    overflow: { starts: 0, ends: 0 },
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
  if (store[list].length >= MAX_EVENTS) { store.overflow[list]++; return false; }
  store[list].push(item);
  return true;
}

function readTier(Game) {
  try {
    if (typeof Game.overtimeTier !== 'function') { return { tier: null, missing: true }; }
    const t = Game.overtimeTier();
    return { tier: (t == null || !isFinite(t)) ? null : (t | 0), missing: false };
  } catch (e) { return { tier: null, missing: false, error: String((e && e.message) || e).slice(0, 120) }; }
}

function readActive(Game) {
  try {
    if (typeof Game.overtimeActive !== 'function') return null;
    return !!Game.overtimeActive();
  } catch (e) { return null; }
}

function snapFighters(Game) {
  try {
    const f = Game.tbfight;
    if (!f) return { fightId: null, fightOtTier: null, fighters: [] };
    return {
      fightId: f.id || null,
      fightOtTier: (f.otTier == null) ? null : (f.otTier | 0),
      fighters: (f.fighters || []).map(x => (x ? {
        key: x.key || null, kind: x.kind || null,
        monsterId: x.monsterId || (x.mdef && x.mdef.id) || null,
        villagerId: x.villagerId || null, hp: roundHp(x.hp), maxHp: roundHp(x.maxHp),
        otTier: (x.otTier == null) ? null : (x.otTier | 0),
        alive: (x.alive === undefined) ? null : !!x.alive,
        fled: (x.fled === undefined) ? null : !!x.fled,
      } : null)),
    };
  } catch (e) { return { fightId: null, fightOtTier: null, fighters: [], snapError: String((e && e.message) || e).slice(0, 120) }; }
}

function installTbovertimeDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._tbovertimeDiagStore === store && Game._tbovertimeDiagInstalled) return Game._tbovertimeDiagUninstall || function () {};
  const uninstalls = [];
  function wrap(name, fn) {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = Game[name];
      Game[name] = fn(orig);
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  }

  wrap('startCombat', (orig) => function (monsterId, options) {
    const day = dayOf(Game);
    const liveFightPre = !!((Game.tbfight) && !Game.tbfight.over);
    const preFightId = (Game.tbfight && Game.tbfight.id) || null;
    const preTier = readTier(Game);
    const preActive = readActive(Game);
    if (preTier.missing) noteErr(store, 'tier.missing', new Error('no overtimeTier'));
    let result, threw = null;
    try { result = orig.apply(this, arguments); }
    catch (e) { threw = e; }
    try {
      const post = snapFighters(Game);
      const postTier = readTier(Game);
      pushCapped(store, 'starts', {
        day: day,
        arg: (monsterId === undefined || monsterId === null) ? null : String(monsterId),
        liveFightPre: liveFightPre, preFightId: preFightId,
        tierPre: preTier.tier, activePre: preActive,
        tierPost: postTier.tier,
        fightId: post.fightId, fightOtTier: post.fightOtTier,
        endedInCall: !Game.tbfight,
        threw: threw ? String((threw && threw.message) || threw).slice(0, 160) : null,
        resultNull: (result === null || result === undefined),
        fighters: liveFightPre ? [] : post.fighters,
        snapError: post.snapError || null,
      });
    } catch (e) { noteErr(store, 'start.post', e); }
    if (threw) throw threw;
    return result;
  });

  wrap('tbEnd', (orig) => function (result) {
    try {
      const pre = snapFighters(Game);
      const tier = readTier(Game);
      pushCapped(store, 'ends', {
        day: dayOf(Game), fightId: pre.fightId, fightOtTier: pre.fightOtTier,
        tierAtEnd: tier.tier, result: (result === undefined || result === null) ? null : String(result),
        fighters: pre.fighters, snapError: pre.snapError || null,
      });
    } catch (e) { noteErr(store, 'tbEnd.rec', e); }
    return orig.apply(this, arguments);
  });

  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._tbovertimeDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._tbovertimeDiagStore = store;
    Game._tbovertimeDiagInstalled = true;
    Game._tbovertimeDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withTbovertimeDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installTbovertimeDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._tbovertime = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

module.exports = { layerOn, newStore, installTbovertimeDiag, withTbovertimeDiag, MAX_EVENTS };
