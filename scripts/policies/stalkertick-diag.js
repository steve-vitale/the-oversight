// stalkertick-diag — stalker-tick recorder for sim-stalkertick-a
// (2026-10-30, flesh-out loop, axis scale-onramp, DIAG ONLY: zero src/js
// changes, policy-side recorder only).
//
// QUESTION: do vanished wave-4 beasts accumulate lostSight ticks toward
// the >6 removal threshold? Mechanism, read from code (game.js, never
// invented): spawnWorldMonster sets lostSight: 0; monsterTurn() — which
// runs ONLY for the scholar-tile monster (playerMonster(), on player
// move/wait/batch actions) — is the only place lostSight moves in the
// world-monster path (unseen: +1, removed when > 6; seen: reset to 0;
// hummice: reset to 0). wanderWorldMonsters() moves monsters between
// tiles but never touches lostSight; villagerMonsterTick() never
// touches it. CONSEQUENCE: a beast that never shares the scholar's
// tile can never accumulate ticks; its census lostSight stays 0.
// This recorder captures BOTH the daily census value AND the intra-day
// monsterTurn events, because a beast can tick 0→7 and vanish between
// two daily censuses.
//
// OBSERVATIONAL ONLY. STALKERTICK=1 is the only on-switch. Unset
// delegates byte-identically: no wraps installed, no ctx surface, no
// record. The wraps record AFTER delegating where it matters, write
// nothing to game state (store arrays only, plus the same installed-
// flag class the other recorders use), draw no RNG, never throw into
// the engine (recording errors are counted, and an engine throw is
// recorded and RETHROWN unchanged), and return the original value
// untouched. The scholar-tile monster is read via monsterAt(map.px,
// map.py) with a scholar mx/my fallback — a pure scan, NEVER via
// playerMonster(), which can adopt a detached alias and would mutate
// state on a refused call. Monster OBJECT references are kept in a
// module-side WeakMap keyed by store — never inside the serialized
// store — so JSON.stringify of a sweep row cannot drag a world object
// (or a cycle) into the corpus. Instance keys (i1, i2, …) are assigned
// at first observation and are stable across lifts/restores (same
// object); a fresh spawn is a fresh object and a fresh key. In node
// sims Game.say is stubbed to a no-op by sim-harness.js, so evidence
// here is structured trace, not say transcript.
'use strict';

const MAX_EVENTS = 20000;

function layerOn() { try { return process.env.STALKERTICK === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }

function newStore() {
  return { turns: [], removals: [], errs: 0, errors: [], overflow: {}, installed: false };
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

// Module-side state per store (never serialized): instance keys by
// object identity, and the in-monsterTurn flag for removal attribution.
const sideState = new WeakMap();
function side(store) {
  let s = sideState.get(store);
  if (!s) { s = { nextInst: 1, keys: new WeakMap(), inMonsterTurn: false }; sideState.set(store, s); }
  return s;
}

function keyFor(store, mon) {
  if (!mon || typeof mon !== 'object') return null;
  const st = side(store);
  let k = st.keys.get(mon);
  if (!k) { k = 'i' + (st.nextInst++); st.keys.set(mon, k); }
  return k;
}

function waveOf(Game, m) {
  try {
    if (m && (m.wave | 0)) return m.wave | 0;
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === m.id);
    if (def && (def.wave | 0)) return def.wave | 0;
  } catch (e) { /* fall through */ }
  return 1;
}

function snapMonster(Game, store, m) {
  if (!m) return null;
  return {
    inst: keyFor(store, m),
    id: m.id != null ? String(m.id) : null,
    wave: waveOf(Game, m),
    tx: (m.tx != null ? m.tx : null), ty: (m.ty != null ? m.ty : null),
    mx: (m.mx != null ? m.mx : null), my: (m.my != null ? m.my : null),
    hp: roundHp(m.hp), maxHp: roundHp(m.maxHp),
    lostSight: (m.lostSight != null ? m.lostSight : null),
    titan: !!m.titan, lingering: !!m.lingering, veteran: !!m.veteran,
  };
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

function scholarTileOf(Game) {
  try {
    if (Game.map && Game.map.px != null) return { px: Game.map.px, py: Game.map.py };
    const sc = (Game.state || {}).scholar || {};
    if (sc.mx != null) return { px: sc.mx, py: sc.my };
  } catch (e) {}
  return { px: null, py: null };
}

function dayPartOf(Game) {
  try {
    if (Game.dayPart != null) return Game.dayPart;
    const sc = (Game.state || {}).scholar || {};
    if (sc.dayPart != null) return sc.dayPart;
  } catch (e) {}
  return null;
}

// snapshotWorldMonsters(Game, store): the daily census snapshot body
// (called by the sweep's daily hook, same phase as scholarmelt's
// census: BEFORE base.daily runs). Assigns instance keys via the
// shared WeakMap so census, turn, and removal records join on inst.
function snapshotWorldMonsters(Game, store) {
  const out = [];
  try {
    const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
    for (const m of (list || [])) {
      const s = snapMonster(Game, store, m);
      if (s) out.push(s);
    }
  } catch (e) { noteErr(store, 'snapshot', e); }
  return out;
}

function installStalkertickDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._stalkertickDiagStore === store && Game._stalkertickDiagInstalled) return Game._stalkertickDiagUninstall || function () {};
  const uninstalls = [];
  const st = side(store);
  const wrap = (name, fn) => {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = Game[name];
      Game[name] = fn(orig);
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  };

  wrap('monsterTurn', (orig) => function () {
    let pre = null, preMon = null, preTile = null;
    try {
      const tm = tileMonsterOf(Game);
      preMon = tm.mon; preTile = { px: tm.px, py: tm.py };
      if (preMon) pre = snapMonster(Game, store, preMon);
    } catch (e) { noteErr(store, 'monsterTurn.pre', e); }
    if (!preMon) {
      // No scholar-tile monster: monsterTurn can move no lostSight.
      // Record nothing (this is the common case; recording it would
      // bloat the corpus with non-events).
      return orig.apply(this, arguments);
    }
    st.inMonsterTurn = true;
    let ret = null, threw = null;
    try { ret = orig.apply(this, arguments); }
    catch (e) { threw = e; }
    st.inMonsterTurn = false;
    if (threw) {
      noteErr(store, 'monsterTurn.engineThrow', threw);
      throw threw;
    }
    try {
      const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
      const stillThere = preMon ? list.indexOf(preMon) >= 0 : false;
      const post = snapMonster(Game, store, preMon);
      const sTile = scholarTileOf(Game);
      pushCapped(store, 'turns', {
        day: dayOf(Game), dayPart: dayPartOf(Game),
        scholarTile: sTile, monsterTile: preTile,
        inst: pre ? pre.inst : null, id: pre ? pre.id : null,
        wave: pre ? pre.wave : null,
        lostSightBefore: pre ? pre.lostSight : null,
        lostSightAfter: post ? post.lostSight : null,
        hpBefore: pre ? pre.hp : null, hpAfter: post ? post.hp : null,
        removed: !stillThere,
        titan: pre ? pre.titan : false, lingering: pre ? pre.lingering : false,
      });
    } catch (e) { noteErr(store, 'monsterTurn.post', e); }
    return ret;
  });

  wrap('removeWorldMonster', (orig) => function () {
    const m = arguments.length ? arguments[0] : null;
    let pre = null, wasInWorld = false, inTurn = false, tbLive = false;
    try {
      if (m) {
        pre = snapMonster(Game, store, m);
        const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
        wasInWorld = list.indexOf(m) >= 0;
        inTurn = !!st.inMonsterTurn;
        tbLive = !!(Game.tbfight && !Game.tbfight.over);
      }
    } catch (e) { noteErr(store, 'removeWorldMonster.pre', e); }
    let ret = null, threw = null;
    try { ret = orig.apply(this, arguments); }
    catch (e) { threw = e; }
    if (threw) {
      noteErr(store, 'removeWorldMonster.engineThrow', threw);
      throw threw;
    }
    try {
      if (m && pre) {
        const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
        const sTile = scholarTileOf(Game);
        pushCapped(store, 'removals', {
          day: dayOf(Game), dayPart: dayPartOf(Game), scholarTile: sTile,
          inst: pre.inst, id: pre.id, wave: pre.wave,
          tx: pre.tx, ty: pre.ty, hp: pre.hp,
          lostSight: pre.lostSight,
          titan: pre.titan, lingering: pre.lingering, veteran: pre.veteran,
          wasInWorld, gone: list.indexOf(m) < 0,
          inMonsterTurn: inTurn, tbfightLive: tbLive,
        });
      }
    } catch (e) { noteErr(store, 'removeWorldMonster.post', e); }
    return ret;
  });

  try {
    Game._stalkertickDiagStore = store;
    Game._stalkertickDiagInstalled = true;
    Game._stalkertickDiagUninstall = () => { try { for (const u of uninstalls) u(); } catch (e) {} try { Game._stalkertickDiagInstalled = false; } catch (e) {} };
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return Game._stalkertickDiagUninstall || function () {};
}

function withStalkertickDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installStalkertickDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._stalkertick = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

module.exports = { layerOn, newStore, installStalkertickDiag, withStalkertickDiag, snapshotWorldMonsters, snapMonster, keyFor, MAX_EVENTS };
