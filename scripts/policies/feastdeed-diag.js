// feastdeed-diag — food-thesis deed recorder for the scale-onramp
// axis (sim-deedtest-a follow-up, 2026-10-26, DIAG ONLY: zero
// src/js changes, policy-side only).
//
// QUESTION (left open by the deedtest band): clean 73678 lands
// the Strike deed on day 120 (world-bump, same counter) and
// beats the control on every lesser-seat bar EXCEPT foodDeeds
// (control foodDeeds true, clean false) — so which half of
// the food-thesis deed failed on clean: sentimentTaught, or
// feastSurgeUsed?
//
// MECHANISM, READ FROM CODE (never invented):
//   - foodDeeds = pg.sentimentTaught && scholar.prog
//     .feastSurgeUsed (tableSeat(), progression deedGateReady()).
//   - sentimentTaught is set by teachSentiment() (progression.js),
//     fired at the integration milestone t=60 (the trial beat).
//   - feastSurgeUsed is set by _spendFeastedPower() (feastBuff.js)
//     when a feasted blow lands in real TB combat (game.js
//     tbDamage hook) or a feasted ability resolves in combat —
//     "a feast that warms no blades marks nothing and spends
//     nothing." A world-bump fight on a day with no live feast
//     buff cannot spend anything.
//
// OBSERVATIONAL ONLY. FEASTDEED=1 is the only on-switch. Unset
// delegates byte-identically: no wraps installed, no ctx surface,
// no record. Wraps record AFTER delegating, read scholar.prog
// fields directly (never progState() which would create state,
// never feastedActive() which self-cleans), draw no RNG, never
// throw into the engine, and return the original value untouched.
'use strict';

function layerOn() { try { return process.env.FEASTDEED === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function progOf(Game) { try { return ((Game.state || {}).scholar || {}).prog || {}; } catch (e) { return {}; } }
function buffUsedOf(Game) { try { const b = ((Game.state || {}).scholar || {}).feastBuff; return b ? !!b.used : null; } catch (e) { return null; } }

function newStore() {
  return { sentiment: [], spends: [], notes: [],
    errs: 0, errors: [], overflow: { sentiment: 0, spends: 0 }, installed: false };
}
function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) {}
}
function pushCapped(store, list, item) {
  if (store[list].length >= 20000) { store.overflow[list]++; return false; }
  store[list].push(item);
  return true;
}

function installFeastdeedDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._feastdeedDiagStore === store && Game._feastdeedDiagInstalled) return Game._feastdeedDiagUninstall || function () {};
  const uninstalls = [];
  function wrap(name, fn) {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = Game[name];
      Game[name] = fn(orig);
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  }
  wrap('teachSentiment', (orig) => function () {
    let result, threw = null;
    try { result = orig.apply(this, arguments); } catch (e) { threw = e; }
    try {
      pushCapped(store, 'sentiment', { day: dayOf(Game), sentimentTaught: !!progOf(Game).sentimentTaught,
        threw: threw ? String((threw && threw.message) || threw).slice(0, 160) : null });
    } catch (e) { noteErr(store, 'sentiment.rec', e); }
    if (threw) throw threw;
    return result;
  });
  wrap('_spendFeastedPower', (orig) => function (kind, bonusHp) {
    let preSurge = null, preUsed = null;
    try { preSurge = !!progOf(Game).feastSurgeUsed; preUsed = buffUsedOf(Game); } catch (e) { noteErr(store, 'spend.pre', e); }
    let result, threw = null;
    try { result = orig.apply(this, arguments); } catch (e) { threw = e; }
    try {
      pushCapped(store, 'spends', { day: dayOf(Game), kind: (kind == null ? null : String(kind)),
        bonusHp: (bonusHp == null ? null : bonusHp),
        preSurge: preSurge, postSurge: !!progOf(Game).feastSurgeUsed,
        preUsed: preUsed, postUsed: buffUsedOf(Game),
        marked: (!preSurge && !!progOf(Game).feastSurgeUsed),
        threw: threw ? String((threw && threw.message) || threw).slice(0, 160) : null });
    } catch (e) { noteErr(store, 'spend.rec', e); }
    if (threw) throw threw;
    return result;
  });
  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._feastdeedDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._feastdeedDiagStore = store;
    Game._feastdeedDiagInstalled = true;
    Game._feastdeedDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withFeastdeedDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installFeastdeedDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._feastdeed = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

module.exports = { layerOn, newStore, installFeastdeedDiag, withFeastdeedDiag };
