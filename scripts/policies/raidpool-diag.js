// raidpool-diag — raid/pool census recorder, NEW for sim-raidpool-a
// (2026-10-26, flesh-out loop, axis scale-onramp). DIAG ONLY.
//
// QUESTION (not a claim): the driftwide arm (sim-driftwide-a)
// left the raids/pool drift unadjudicated — plain rows carry no
// raftdraft census, so raids 85→91 / raiders 352→404 / pool
// 1527→1346 between the 0126Z and 301 bands, plus the
// true-current colA band's wholly unmeasured raids/pool, are
// open residue. This recorder re-measures all three columns
// under ONE stated counting definition (see the evidence
// header), independently of scripts/policies/raftdraft-diag.js
// (which is NOT edited, NOT imported, NOT depended on here —
// the reproduction test against the published bands is what
// proves the definitions coincide).
//
// COUNTING DEFINITION (read from src/js/havenGrowth.js
// havenRaidTick, never invented):
//   - raids: FIRED havenRaidTick calls only — a call counts iff
//     village.lastRaidDay changes across the call. The engine
//     sets it only on the raid path, after the gates: 3+ living
//     world monsters, pantry >= 3000 kcal, >= 7 days since last
//     raid (overtime knobs may shorten it), ~18% roll (skip
//     0.82), no raids while the table sits.
//   - raiders: per fired raid, living world monsters sorted by
//     Manhattan distance to Haven, first raidN taken, raidN =
//     min(5, 3 + (pantry > 12000) + (pantry > 24000)).
//   - pool: per fired raid, livingN = count of living (hp > 0)
//     world monsters in the PRE-CALL pool snapshot. The band
//     pool number is the SUM of livingN over fired raids — the
//     same monster counts again at every raid it survives to.
//     It is NOT a distinct-monster count and NOT a final-day
//     census.
//   - wave via Game.crisisWaveOf (m.wave is never on the
//     entity); fallback 1, as the engine's own callers do.
//
// OBSERVATIONAL ONLY. RAIDPOOL=1 is the only on-switch.
// Unset delegates byte-identically: no wraps installed, no ctx
// surface, no daily record. The havenRaidTick wrap snapshots
// the pool BEFORE delegating (the draft mutates tx/ty/hp) and
// reads lastRaidDay/pantry/havenTier AFTER delegating. The say
// wrap is CAPTURE-ONLY: it records the line, then calls the
// original (the harness's silenced no-op) untouched, so
// narration capture cannot change a trajectory. The wraps
// write nothing to game state, draw no RNG, never throw into
// the engine (recording errors are counted in diag.errs).
//
// COMPOSE UPON (never edit): tableseat-nowait (which wraps
// leanlinkrescue). POLICY-SIDE ONLY — zero src/js changes,
// no default flips, no combat-code changes.
//
// KNOWN LIMITS (stated, not hidden):
// - World entities carry no stable instance id; raiders are
//   identified by pre-call pool position (index + type id +
//   hp + tile). No post-call matching is attempted here —
//   counts need only the pre-call draft, which is exact.
// - The ~18% roll leaves no trace, so non-firing calls are
//   not recorded at all (they contribute nothing to any
//   count); only fired raids appear in store.raids.
// - Say capture only sees lines spoken while the policy daily
//   runs (install happens in daily, before delegation). Lines
//   spoken during setup are not captured; raids only fire
//   during day ticks, so no raid line is missed by this.
// - Pantry for raidN is read AFTER delegating, as in
//   raftdraft-diag: the tick itself consumes no pantry, so
//   post-call pantry equals the pantry the engine drafted
//   against (lingering gorges happen in havenGrowthDaily,
//   a different tick).
'use strict';

const MAX_EVENTS = 40000;

function layerOn() { try { return process.env.RAIDPOOL === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }

function newStore() {
  return {
    raids: [],
    sayCount: 0, saySample: [], raidLines: [],
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

function havenXY(Game) {
  let hx = 4, hy = 4;
  try {
    const v = (Game.state || {}).village || {};
    if (v.px !== undefined && v.px !== null) hx = v.px;
    if (v.py !== undefined && v.py !== null) hy = v.py;
  } catch (e) { /* defaults */ }
  return { hx: hx, hy: hy };
}

function waveOf(Game, m) {
  try {
    if (typeof Game.crisisWaveOf === 'function') {
      const w = Game.crisisWaveOf(m);
      if (w && isFinite(w)) return w | 0;
    }
  } catch (e) { /* fall through to 1, as the engine does */ }
  return 1;
}

// Pure-read pool snapshot: COPIES of live entries (never the live
// list, never sorted in place).
function snapPool(Game, hx, hy) {
  const out = [];
  try {
    const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
    for (let i = 0; i < list.length; i++) {
      const m = list[i];
      if (!m) continue;
      const hp = roundHp(m.hp), maxHp = roundHp(m.maxHp);
      out.push({
        idx: i, id: m.id || null, hp: hp, maxHp: maxHp,
        tx: m.tx, ty: m.ty,
        dist: (m.tx != null && m.ty != null) ? (Math.abs(m.tx - hx) + Math.abs(m.ty - hy)) : null,
        wave: waveOf(Game, m), living: (m.hp || 0) > 0,
      });
    }
  } catch (e) { /* snapshot best-effort; caller records the error */ }
  return out;
}

function installRaidpoolDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._raidpoolDiagStore === store && Game._raidpoolDiagInstalled) return Game._raidpoolDiagUninstall || function () {};
  const uninstalls = [];
  const wrap = (name, fn) => {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = Game[name];
      Game[name] = fn(orig);
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  };

  // say: capture-only, delegate untouched.
  wrap('say', (orig) => function () {
    let text = '';
    try { text = Array.prototype.slice.call(arguments).join(' '); } catch (e) { noteErr(store, 'say.join', e); }
    try {
      store.sayCount++;
      const day = dayOf(Game);
      if (store.saySample.length < 50) store.saySample.push({ day: day, text: text });
      if (text.indexOf('🐗') !== -1 || text.indexOf('RAID') !== -1) {
        pushCapped(store, 'raidLines', { day: day, text: text });
      }
    } catch (e) { noteErr(store, 'say.rec', e); }
    return orig.apply(this, arguments);
  });

  // havenRaidTick: pool BEFORE, fired/read AFTER.
  wrap('havenRaidTick', (orig) => function () {
    let prePool = null, hx = 4, hy = 4, lastBefore = null;
    try {
      const xy = havenXY(Game);
      hx = xy.hx; hy = xy.hy;
      prePool = snapPool(Game, hx, hy);
      try { lastBefore = ((Game.state || {}).village || {}).lastRaidDay || 0; } catch (e) { lastBefore = 0; }
    } catch (e) { noteErr(store, 'raid.pre', e); }
    const r = orig.apply(this, arguments);
    try {
      const day = dayOf(Game);
      let pantry = null, tier = null, lastAfter = null;
      try {
        const v = (Game.state || {}).village || {};
        lastAfter = v.lastRaidDay || 0;
        if (typeof Game.pantryKcalLive === 'function') pantry = Game.pantryKcalLive(v);
        if (typeof Game.havenTier === 'function') tier = Game.havenTier();
      } catch (e) { noteErr(store, 'raid.postRead', e); }
      const fired = (lastAfter !== lastBefore) && lastAfter != null && lastAfter !== 0;
      if (fired) {
        const living = (prePool || []).filter(p => p.living);
        const sorted = living.slice().sort((a, b) => (a.dist == null ? 1e9 : a.dist) - (b.dist == null ? 1e9 : b.dist));
        const raidN = Math.min(5, 3 + (pantry > 12000 ? 1 : 0) + (pantry > 24000 ? 1 : 0));
        const drafted = sorted.slice(0, raidN);
        const countByWave = (arr) => {
          const c = {};
          for (const x of arr) { const w = x.wave || 1; c[w] = (c[w] || 0) + 1; }
          return c;
        };
        pushCapped(store, 'raids', {
          day: day, pantry: pantry, havenTier: tier, palisade: (tier != null ? tier : 0) >= 2,
          raidN: raidN, draftedN: drafted.length, hx: hx, hy: hy,
          poolN: (prePool || []).length, livingN: living.length,
          poolByWave: countByWave(living),
          draftedByWave: countByWave(drafted),
          raiders: drafted.map((d, rank) => ({
            rank: rank, type: d.id, wave: d.wave, dist: d.dist,
            preTx: d.tx, preTy: d.ty, preHp: d.hp, maxHp: d.maxHp,
          })),
        });
      }
    } catch (e) { noteErr(store, 'raid.rec', e); }
    return r;
  });

  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._raidpoolDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._raidpoolDiagStore = store;
    Game._raidpoolDiagInstalled = true;
    Game._raidpoolDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withRaidpoolDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      // Install BEFORE delegating: raids fire during this day's
      // tick, so the wraps must already be in place. The say wrap
      // delegates to the original untouched, so install order
      // cannot change a trajectory (proven by the det-gate).
      if (layerOn()) {
        try { installRaidpoolDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._raidpool = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return inner.daily ? inner.daily(Game, ctx) : undefined;
    },
  });
}

module.exports = { layerOn, newStore, installRaidpoolDiag, withRaidpoolDiag, snapPool, MAX_EVENTS };
