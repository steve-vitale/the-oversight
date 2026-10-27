// finalloss-diag — final-loss restore-path recorder for
// sim-finalloss-adopt-a (2026-10-27, flesh-out loop, axis
// scale-onramp; adoption of the dead sim-finalloss-a arm,
// run fleshout-20261027T0105Z, adopted under run
// fleshout-20261027T0615Z with run-id adaptation only).
// DIAG ONLY: zero src/js changes, policy-side only.
//
// WHAT IT RECORDS (binding prereg:
// evidence/2026-10-27/sim-finalloss-adopt-a-prereg.md,
// adopted from sim-finalloss-a):
// - tbEnd wrap: BEFORE delegating, the fight's worldOrigin
//   object (id/seq/src/hp/maxHp/tile/lingering/titan, scalars
//   copied), the monster fighters of that origin id (alive
//   + hp), the occupant of the origin tile (monsterAt, the
//   F1 check — origin tile BEFORE any lingerer Haven
//   reassignment), the occupant of the Haven tile (recorded
//   separately, never F1), and whether the origin object is
//   already in the world list. AFTER delegating, whether
//   the origin object is in the world list and its hp/tile.
//   console.warn messages issued DURING the call are
//   captured AND forwarded to the original warn, so sweep
//   logs are unchanged; a '[titan] piece restore' warn
//   during that exact call is the F7 discriminator.
// - removeWorldMonster wrap: the entity snapshot + caller
//   stack BEFORE delegating, still-present flag AFTER.
//   The stack names the remover for F8/F9 (startCombat
//   lift, field-fight vKill, sortie vKill, watch-turn
//   expiry, raid defense, or other — the stack decides).
//
// TICK EPOCHS (removal-vs-verdict-tick discriminator):
// the seq51gap tick runs after the inner policy's daily
// work, before sleep. This recorder's daily runs its
// post-inner bookkeeping after the tick, so each row's
// tickEpoch counts ticks already recorded. A removal with
// tickEpoch < tickEpochAfter[verdictTickDay] happened
// before that day's tick; a night removal after the tick
// carries the tick in its epoch and is excluded. The
// analyzer falls back to day comparison when a day has no
// daily bookkeeping (harness day-jumps) and says so.
//
// OBSERVATIONAL ONLY. FINALLOSS=1 is the only on-switch.
// Unset delegates byte-identically: no wraps installed, no
// ctx surface, no record. The wraps write nothing to game
// state, draw no RNG, never throw into the engine (an
// engine throw from tbEnd/removeWorldMonster itself is
// recorded and RETHROWN unchanged), and return the
// original's value untouched. They never call
// villageStandingTotal() or unlockedWave() mid-run.
// Installed BEFORE the inner policy's daily work (so
// day-1 fights are covered) and idempotent across days.
'use strict';

const MAX_EVENTS = 20000;

function layerOn() { try { return process.env.FINALLOSS === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }

function newStore() {
  return {
    tbEnds: [], removals: [],
    errs: 0, errors: [], overflow: { tbEnds: 0, removals: 0 },
    installed: false, rowIdx: 0,
    tbEndSkipped: 0,
    tickEpoch: 0, lastEpochDay: null, tickEpochAfter: {},
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

function havenXY(Game) {
  let hx = 4, hy = 4;
  try {
    const v = (Game.state || {}).village || {};
    if (v.px !== undefined && v.px !== null) hx = v.px;
    if (v.py !== undefined && v.py !== null) hy = v.py;
  } catch (e) { /* engine fallback 4,4 */ }
  return { hx: hx, hy: hy };
}

function entSnap(m) {
  if (!m) return null;
  return {
    id: m.id || null,
    seq: (m._spawnSeq != null) ? (m._spawnSeq | 0) : null,
    src: (m._spawnsrc != null) ? String(m._spawnsrc) : null,
    hp: roundHp(m.hp), maxHp: roundHp(m.maxHp),
    tx: (m.tx != null) ? (m.tx | 0) : null, ty: (m.ty != null) ? (m.ty | 0) : null,
    lingering: !!m.lingering, titan: !!m.titan, veteran: !!m.veteran,
  };
}

function stackInfo() {
  const names = [], lines = [];
  try {
    const st = (new Error()).stack || '';
    for (const line of st.split('\n')) {
      const t = line.trim();
      if (!t || t.indexOf('stackInfo') >= 0) continue;
      if (lines.length < 6) lines.push(t.slice(0, 180));
      const m = t.match(/at\s+(?:Object\.)?([A-Za-z_$][\w$]*)/);
      if (m) {
        const fn = m[1];
        if (fn === 'Error') continue;
        if (names.indexOf(fn) < 0) names.push(fn);
      }
      if (names.length >= 12) break;
    }
  } catch (e) { /* stack capture must never throw */ }
  return { names: names.join(','), lines: lines };
}

function worldList(Game) {
  try { return (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : []; } catch (e) { return []; }
}

function installFinallossDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._finallossDiagStore === store && Game._finallossDiagInstalled) return Game._finallossDiagUninstall || function () {};
  const uninstalls = [];
  try {
    if (typeof Game.tbEnd === 'function') {
      const orig = Game.tbEnd;
      Game.tbEnd = function (result) {
        const f = Game.tbfight;
        // The engine returns early (no restore block) when
        // there is no live fight; such a call is not a tbEnd
        // event and is counted, not rowed, so chains stay
        // clean.
        if (!f || f.over) { store.tbEndSkipped++; return orig.apply(this, arguments); }
        const pre = { day: dayOf(Game), tickEpoch: store.tickEpoch, rowIdx: store.rowIdx++ };
        let originRef = null;
        try {
          pre.fightId = f.id || null;
          pre.round = (f.round != null) ? (f.round | 0) : null;
          pre.result = (result === undefined || result === null) ? null : String(result);
          originRef = f.worldOrigin || null;
          pre.origin = entSnap(originRef);
          const fighters = (f.fighters || []).map(x => {
            if (!x) return null;
            const matchId = ((x.mdef || {}).id || x.monsterId || x.id) || null;
            return { key: x.key || null, kind: x.kind || null, matchId: matchId,
              monsterId: x.monsterId || null, villagerId: x.villagerId || null,
              hp: roundHp(x.hp), maxHp: roundHp(x.maxHp), alive: !!x.alive, fled: !!x.fled };
          });
          pre.fighters = fighters;
          if (originRef) {
            const mine = fighters.filter(x => x && x.kind === 'monster' && x.matchId === originRef.id);
            pre.mineCount = mine.length;
            pre.standing = mine.filter(x => x.alive && (x.hp || 0) > 0).map(x => x.hp);
            pre.stillUp = !mine.length || pre.standing.length > 0;
            try {
              const list = worldList(Game);
              pre.alreadyPresent = list.indexOf(originRef) >= 0;
            } catch (e) { pre.alreadyPresent = null; }
            try {
              pre.originTileOccupant = (typeof Game.monsterAt === 'function')
                ? entSnap(Game.monsterAt(originRef.tx, originRef.ty)) : null;
            } catch (e) { pre.originTileOccupant = null; noteErr(store, 'tbEnd.originTile', e); }
            try {
              const h = havenXY(Game);
              pre.havenTile = [h.hx, h.hy];
              pre.havenTileOccupant = (typeof Game.monsterAt === 'function')
                ? entSnap(Game.monsterAt(h.hx, h.hy)) : null;
            } catch (e) { pre.havenTileOccupant = null; noteErr(store, 'tbEnd.havenTile', e); }
          } else {
            pre.mineCount = null; pre.standing = null; pre.stillUp = null;
            pre.alreadyPresent = null; pre.originTileOccupant = null; pre.havenTileOccupant = null;
          }
        } catch (e) { noteErr(store, 'tbEnd.pre', e); }
        // Warn capture: forward every warn to the original
        // AND keep a copy, so the sweep log is unchanged.
        const origWarn = console.warn;
        const warns = [];
        try { console.warn = function () { try { warns.push(Array.prototype.map.call(arguments, function (a) { return String(a); }).join(' ')); } catch (e2) {} return origWarn.apply(console, arguments); }; } catch (e) {}
        let r, threw = null;
        try { r = orig.apply(this, arguments); }
        catch (e) { threw = e; }
        finally { try { console.warn = origWarn; } catch (e) {} }
        try {
          const post = { tickEpoch: store.tickEpoch };
          if (originRef) {
            try {
              const list = worldList(Game);
              post.present = list.indexOf(originRef) >= 0;
            } catch (e) { post.present = null; }
            post.origin = entSnap(originRef);
          } else { post.present = null; post.origin = null; }
          post.warns = warns.slice(0, 10).map(w => String(w).slice(0, 200));
          post.titanWarns = warns.filter(w => String(w).indexOf('[titan] piece restore') >= 0).map(w => String(w).slice(0, 200));
          post.threw = threw ? String((threw && threw.message) || threw).slice(0, 160) : null;
          pushCapped(store, 'tbEnds', Object.assign(pre, { post: post }));
        } catch (e) { noteErr(store, 'tbEnd.rec', e); }
        if (threw) throw threw;
        return r;
      };
      uninstalls.push(() => { try { Game.tbEnd = orig; } catch (e) {} });
    } else { noteErr(store, 'tbEnd.missing', new Error('no tbEnd')); }
  } catch (e) { noteErr(store, 'tbEnd.wrap', e); }
  try {
    if (typeof Game.removeWorldMonster === 'function') {
      const orig = Game.removeWorldMonster;
      Game.removeWorldMonster = function (m) {
        const pre = { day: dayOf(Game), tickEpoch: store.tickEpoch, rowIdx: store.rowIdx++ };
        try {
          pre.entity = entSnap(m);
          const si = stackInfo();
          pre.stack = si.names; pre.stackLines = si.lines;
        } catch (e) { noteErr(store, 'remove.pre', e); }
        let r, threw = null;
        try { r = orig.apply(this, arguments); }
        catch (e) { threw = e; }
        try {
          let still = null;
          if (m) {
            try {
              const list = worldList(Game);
              still = list.indexOf(m) >= 0;
              if (!still) still = list.some(x => x && x.tx === m.tx && x.ty === m.ty && x.id === m.id);
            } catch (e) { still = null; }
          }
          pushCapped(store, 'removals', Object.assign(pre, {
            stillPresent: still,
            threw: threw ? String((threw && threw.message) || threw).slice(0, 160) : null,
          }));
        } catch (e) { noteErr(store, 'remove.rec', e); }
        if (threw) throw threw;
        return r;
      };
      uninstalls.push(() => { try { Game.removeWorldMonster = orig; } catch (e) {} });
    } else { noteErr(store, 'remove.missing', new Error('no removeWorldMonster')); }
  } catch (e) { noteErr(store, 'remove.wrap', e); }
  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._finallossDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._finallossDiagStore = store;
    Game._finallossDiagInstalled = true;
    Game._finallossDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withFinallossDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      // Install BEFORE the inner policy's daily work, so
      // day-1 fights are covered (unlike the fight recorders,
      // which install after their inner daily).
      if (layerOn()) {
        try { installFinallossDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
      }
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        // Post-inner bookkeeping runs AFTER the seq51gap
        // tick (which snapshots after the inner daily), so
        // tickEpoch counts ticks already recorded.
        try {
          const d = dayOf(Game);
          if (st.lastEpochDay !== d) { st.tickEpoch++; st.lastEpochDay = d; st.tickEpochAfter[d] = st.tickEpoch; }
        } catch (e) { noteErr(st, 'daily.epoch', e); }
        try { ctx._finalloss = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

module.exports = { layerOn, newStore, installFinallossDiag, withFinallossDiag, MAX_EVENTS };
