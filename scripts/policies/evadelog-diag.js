// evadelog-diag — evade-log recorder (sim-evadeshape-a, 2026-10-30,
// flesh-out loop, axis scale-onramp, DIAG ONLY: zero src/js changes,
// policy-side recorder only).
//
// QUESTION: w4dpr-diag stores the full fieldFight rec.log ONLY for
// wave 3/4 fights, so waves 1/2/5 evade log lines are absent from
// the verbatim w4meet recorder stack's corpus (verified: a wave-2
// evade row carries log = null, a wave-3 evade row carries its
// line). The evadeshape sense leg requires EVERY evade line, all
// waves. This recorder supplies exactly that, and nothing else.
//
// OBSERVATIONAL ONLY. EVADELOG=1 is the only on-switch. Unset
// delegates byte-identically: no wraps installed, no ctx surface,
// no record. Wraps record AFTER delegating (the record needs the
// result, including rec.log), pre-reads are pure state reads taken
// before the call, never writes, draw no RNG, never throw into the
// engine (recording errors are counted, and an engine throw is
// recorded and RETHROWN unchanged), and return the original value
// untouched. Installed alongside the verbatim stack (all wrap
// fieldFight; stacking order is irrelevant because every
// recorder's pre-reads are pure and post-writes touch only their
// own store).
//
// WHAT IS STORED: one entry per fieldFight call whose result is
// outcome 'evade', in call order: {day, part, vid, mid, wave, log
// verbatim}. Non-evade fights store nothing, so the store stays
// small. The analyzer does NOT index-join this store (its order
// is evade-only); it cross-checks the store's (day, vid, mid)
// multiset against the joined corpus's evade rows and requires
// equality. Wave is read from the monster def / crisisWaveOf, the
// same waveOf logic as fieldparty-form-diag and w4dpr-diag.
'use strict';

const MAX_EVENTS = 60000;

function layerOn() { try { return process.env.EVADELOG === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

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

function installEvadelogDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._evadelogDiagStore === store && Game._evadelogDiagInstalled) return Game._evadelogDiagUninstall || function () {};
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
      pre = {
        day: dayOf(Game), part: store.partCounter,
        vid: vid != null ? String(vid) : null,
        mid: (live && live.id) || (defObj && defObj.id) || null,
        wave: waveOf(Game, live || defObj),
      };
    } catch (e) { noteErr(store, 'fieldFight.pre', e); }
    let rec = null;
    try { rec = orig.apply(this, arguments); }
    catch (e) { throw e; }
    try {
      if (pre && rec && rec.outcome === 'evade') {
        const log = (rec && Array.isArray(rec.log)) ? rec.log.map(l => String(l)) : [];
        pre.log = log;
        pre.logLines = log.length;
        pushCapped(store, 'meetings', pre);
      }
    } catch (e) { noteErr(store, 'fieldFight.rec', e); }
    return rec;
  });

  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._evadelogDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._evadelogDiagStore = store;
    Game._evadelogDiagInstalled = true;
    Game._evadelogDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

module.exports = { layerOn, newStore, installEvadelogDiag, MAX_EVENTS };
