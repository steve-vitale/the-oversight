// removal-diag — unexplained-removal recorder for sim-removal-a
// (2026-10-30, flesh-out loop, axis scale-onramp, DIAG ONLY: zero src/js
// changes, policy-side recorder only).
//
// QUESTION (from sim-scholarmelt-a / sim-spawnhp-a): 2 wild wave-4 chains
// vanish with no scholar fight and no villager story, and 3 (4,4) census
// drops arrive with no recorded meeting. Which code path removes (or
// wounds) each beast? Every engine removal path calls
// Game.removeWorldMonster (game.js: it splices state.worldMonsters;
// grep confirms no direct splice of that array in src/js outside debug
// scenarios), so wrapping that one method + spawnWorldMonster sees
// every removal and every birth. tbEnd restores push the lifted object
// directly (game.js tbEnd worldOrigin path) and do NOT call
// spawnWorldMonster, so a reappearance with no spawn row is a restore,
// not a birth; fled-monster re-entry DOES call spawnWorldMonster
// (game.js fled recovery) and carries wounded hp.
//
// OBSERVATIONAL ONLY. REMOVAL=1 is the only on-switch. Unset delegates
// byte-identically: no wraps installed, no ctx surface, no record.
// The wraps record AFTER delegating where the object exists (spawn)
// and BEFORE+AFTER for removals (pre-removal fields + post-call
// fledMonsters snapshot), write nothing to game state (store arrays
// + a module-side WeakMap only), draw no RNG, never throw into the
// engine (recording errors are counted, and an engine throw is
// recorded and RETHROWN unchanged), and return the original value
// untouched. Monster OBJECT references are kept in a module-side
// WeakMap keyed by store — never inside the serialized store — so
// JSON.stringify of a sweep row cannot drag a world object (or a
// cycle) into the corpus. Uids are per-seed sequential integers
// assigned on first sight (spawn wrap, removal wrap, or the sweep's
// census snapshot via uidFor), so a census trajectory is a uid's
// day-by-day path, never a hp+tile adjacency guess. The recorder
// never reads Game.say (node-sim stubs it to no-op anyway); the
// structured row IS the transcript-equivalent evidence.
'use strict';

const MAX_EVENTS = 40000;

function layerOn() { try { return process.env.REMOVAL === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }

function newStore() {
  return { events: [], errs: 0, errors: [], overflow: {}, installed: false };
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

// Module-side state per store (never serialized): uid counter +
// object->uid WeakMap, and the global event seq counter.
const sideState = new WeakMap();
function side(store) {
  let s = sideState.get(store);
  if (!s) { s = { nextSeq: 1, nextUid: 1, uidMap: new WeakMap() }; sideState.set(store, s); }
  return s;
}
function uidFor(store, obj) {
  if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) return null;
  const s = side(store);
  let u = s.uidMap.get(obj);
  if (u == null) { u = s.nextUid++; s.uidMap.set(obj, u); }
  return u;
}

function waveOf(Game, m) {
  try { if (m && Number.isFinite(m.wave)) return m.wave | 0; } catch (e) {}
  try {
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === m.id);
    if (def && (def.wave | 0)) return def.wave | 0;
  } catch (e) {}
  return 1;
}

function snapMonster(Game, store, m) {
  if (!m) return null;
  return {
    id: m.id != null ? String(m.id) : null,
    uid: uidFor(store, m),
    wave: waveOf(Game, m),
    hp: roundHp(m.hp), maxHp: roundHp(m.maxHp),
    tx: (m.tx != null ? m.tx : null), ty: (m.ty != null ? m.ty : null),
    mx: (m.mx != null ? m.mx : null), my: (m.my != null ? m.my : null),
    stance: m.stance != null ? String(m.stance) : null,
    lostSight: (m.lostSight != null ? m.lostSight : null),
    fearTurns: (m.fearTurns != null ? m.fearTurns : null),
    watchTurns: (m.watchTurns != null ? m.watchTurns : null),
    lingering: !!m.lingering, titan: !!m.titan, veteran: !!m.veteran,
  };
}

function fledSnapshot(Game) {
  try {
    const fm = ((Game.state || {}).fledMonsters) || {};
    const out = {};
    for (const k of Object.keys(fm)) {
      const e = fm[k] || {};
      out[k] = { id: e.id != null ? String(e.id) : null, hp: roundHp(e.hp), maxHp: roundHp(e.maxHp) };
    }
    return out;
  } catch (e) { return {}; }
}

function tbInfo(Game) {
  try {
    const tb = Game.tbfight || null;
    if (!tb || tb.over) return { tbActive: false, fightMonsterIds: [] };
    const ids = [];
    for (const f of (tb.fighters || [])) {
      if (f && f.kind === 'monster') ids.push(String(((f.mdef || {}).id || f.monsterId || f.id)));
    }
    return { tbActive: true, fightMonsterIds: ids };
  } catch (e) { return { tbActive: false, fightMonsterIds: [] }; }
}

// stackInfo(): V8 stack frames starting at the wrapper's caller.
// Frame 0 is this function, 1 is the wrapper, 2+ are the real call
// chain. Each frame keeps its raw text (trimmed) plus a parsed
// function token and file:line, so the analyzer can classify by
// enclosing function name without trusting line numbers (which
// drift daily — the analyzer matches on function tokens, and
// reports the raw frame alongside every class).
function stackInfo() {
  try {
    const st = new Error('removal-diag').stack || '';
    const lines = st.split('\n').slice(3, 11);
    const frames = lines.map(s => s.trim().slice(0, 200));
    const funcs = frames.map(f => {
      const m = f.match(/at (?:async )?([^\s(]+)/);
      let fn = m ? m[1] : null;
      if (fn) fn = fn.replace(/^Object\./, '').replace(/^Game\./, '');
      return fn;
    }).filter(Boolean);
    return { frames, funcs };
  } catch (e) { return { frames: [], funcs: [] }; }
}

function installRemovalDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._removalDiagStore === store && Game._removalDiagInstalled) return Game._removalDiagUninstall || function () {};
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

  wrap('removeWorldMonster', (orig) => function (m) {
    let pre = null, fledBefore = null;
    try {
      pre = snapMonster(Game, store, m);
      fledBefore = fledSnapshot(Game);
    } catch (e) { noteErr(store, 'removeWorldMonster.pre', e); }
    const tb = tbInfo(Game);
    const stack = stackInfo();
    let ret = null;
    try { ret = orig.apply(this, arguments); }
    catch (e) {
      try {
        if (pre || m == null) pushCapped(store, { type: 'removal', seq: st.nextSeq++, day: dayOf(Game),
          monster: pre, nullArg: m == null, threw: true,
          fledBefore, fledAfter: fledSnapshot(Game),
          tbActive: tb.tbActive, fightMonsterIds: tb.fightMonsterIds, stack });
      } catch (e2) { noteErr(store, 'removeWorldMonster.throwRec', e2); }
      throw e;
    }
    try {
      pushCapped(store, { type: 'removal', seq: st.nextSeq++, day: dayOf(Game),
        monster: pre, nullArg: m == null, threw: false,
        fledBefore, fledAfter: fledSnapshot(Game),
        tbActive: tb.tbActive, fightMonsterIds: tb.fightMonsterIds, stack });
    } catch (e) { noteErr(store, 'removeWorldMonster.post', e); }
    return ret;
  });

  wrap('spawnWorldMonster', (orig) => function () {
    const args = Array.prototype.slice.call(arguments);
    const stack = stackInfo();
    let ret = null;
    try { ret = orig.apply(this, arguments); }
    catch (e) {
      try {
        const reqId = (typeof args[0] === 'string') ? args[0] : ((args[0] || {}).id || null);
        pushCapped(store, { type: 'spawn', seq: st.nextSeq++, day: dayOf(Game),
          monster: null, requestedId: reqId != null ? String(reqId) : null,
          requestedTx: args[1] != null ? args[1] : null, requestedTy: args[2] != null ? args[2] : null,
          threw: true, stack });
      } catch (e2) { noteErr(store, 'spawnWorldMonster.throwRec', e2); }
      throw e;
    }
    try {
      const snap = snapMonster(Game, store, ret);
      const opts = args[3] || {};
      pushCapped(store, { type: 'spawn', seq: st.nextSeq++, day: dayOf(Game),
        monster: snap,
        requestedId: snap ? snap.id : null,
        requestedTx: args[1] != null ? args[1] : null, requestedTy: args[2] != null ? args[2] : null,
        optsHp: (opts.hp != null ? roundHp(opts.hp) : null),
        optsMaxHp: (opts.maxHp != null ? roundHp(opts.maxHp) : null),
        threw: false, stack });
    } catch (e) { noteErr(store, 'spawnWorldMonster.post', e); }
    return ret;
  });

  try {
    Game._removalDiagStore = store;
    Game._removalDiagInstalled = true;
    Game._removalDiagUninstall = () => { try { for (const u of uninstalls) u(); } catch (e) {} try { Game._removalDiagInstalled = false; } catch (e) {} };
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return Game._removalDiagUninstall || function () {};
}

module.exports = { layerOn, newStore, installRemovalDiag, uidFor, MAX_EVENTS };
