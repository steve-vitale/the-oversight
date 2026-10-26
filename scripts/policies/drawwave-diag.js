// drawwave-diag — unlockedWave-at-draw-time recorder for the
// scale-onramp axis (sim-drawwave-a, 2026-10-26, flesh-out loop,
// DIAG ONLY: zero src/js changes, policy-side only).
//
// GAP IT CLOSES (sim-feastdraw-a, 0017Z): the feastdraw recorder
// records a draw's wave (from the monster def) but NOT the
// unlocked wave at draw time, so "wave-appropriate" was proven
// only by distribution (w1 1, w2 2, w3 1, w4 1), never per draw.
// This recorder wraps drawFeastScavenger ONLY and records, BEFORE
// delegating, the engine's unlockedWave() and the monsterWavePool()
// wave-count distribution (the cast pool the draw is drawn from),
// plus raw standing components via villageStanding() where
// available; AFTER delegating it records the draw result, the
// drawn monster's def wave, the post-call unlockedWave()
// (stability check), and whether the drawn id was in the
// pre-call pool.
//
// READ SAFETY (from code, not assumed): unlockedWave() reads
// villageStandingTotal(), which can set the one-way standing
// peak and fire release/hold beats — but both are day-throttled
// and idempotent (hold beats at most once per 7 days per wave;
// the release beat fires once when the peak is set, then the
// peak test blocks repeats), and the engine itself calls
// unlockedWave() many times per day (pool, spawns, loot). The
// neutrality pair in the sweep is the proof: armed vs plain
// trajectories identical, or the recorder is fixed and
// everything re-run.
//
// OBSERVATIONAL ONLY. DRAWWAVE=1 is the only on-switch. Unset
// delegates byte-identically: no wraps installed, no ctx
// surface, no record. The wrap records BEFORE and AFTER
// delegating, writes nothing to game state (store arrays only,
// plus the same installed-flag class the other recorders use),
// draws no RNG, never throws into the engine (recording errors
// are counted; an engine throw is recorded and rethrown
// unchanged), and returns the original value untouched.
//
// PURE READS ONLY: this recorder NEVER calls feastedActive() or
// feastDrawPending() (both can clear state). It reads
// s.feastDraw directly only for the join key (monsterId + day).
'use strict';

const MAX_EVENTS = 20000;

function layerOn() { try { return process.env.DRAWWAVE === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function newStore() {
  return {
    rows: [],
    errs: 0, errors: [], overflow: { rows: 0 },
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

function snapDraw(Game) {
  try {
    const d = ((Game.state || {}).scholar || {}).feastDraw || null;
    if (!d || !d.monsterId) return null;
    return { monsterId: String(d.monsterId), veteran: !!d.veteran, day: d.day || 0 };
  } catch (e) { return null; }
}

function waveOf(Game, mid) {
  try {
    const def = ((Game.data && Game.data.monsters) || []).find(d => d && d.id === mid);
    return def ? (def.wave | 0) : null;
  } catch (e) { return null; }
}

// Pre-delegation gate snapshot. Every field is best-effort and
// null on failure — a failed read is recorded as null, never
// guessed, never thrown.
function snapGate(Game) {
  const out = { unlockedWave: null, unlockedWaveErr: null, poolWaves: null, poolIds: null, standing: null };
  try {
    out.unlockedWave = (typeof Game.unlockedWave === 'function') ? (Game.unlockedWave() | 0) : null;
  } catch (e) { out.unlockedWave = null; out.unlockedWaveErr = String((e && e.message) || e).slice(0, 120); }
  try {
    const pool = (typeof Game.monsterWavePool === 'function') ? Game.monsterWavePool() : null;
    if (Array.isArray(pool)) {
      const waves = {};
      const ids = [];
      for (const m of pool) {
        if (!m) continue;
        const w = (m.wave || 1) | 0;
        waves['w' + w] = (waves['w' + w] || 0) + 1;
        if (m.id != null) ids.push(String(m.id));
      }
      out.poolWaves = waves;
      out.poolIds = ids;
    }
  } catch (e) { out.poolWaves = null; out.poolIds = null; }
  try {
    const s = (typeof Game.villageStanding === 'function') ? Game.villageStanding() : null;
    if (s && typeof s === 'object') {
      out.standing = {
        total: (s.total != null ? s.total : null),
        war: (s.war != null ? s.war : null),
        diplomacy: (s.diplomacy != null ? s.diplomacy : null),
        plenty: (s.plenty != null ? s.plenty : null),
      };
    }
  } catch (e) { out.standing = null; }
  return out;
}

function installDrawwaveDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._drawwaveDiagStore === store && Game._drawwaveDiagInstalled) return Game._drawwaveDiagUninstall || function () {};
  const uninstalls = [];
  function wrap(name, fn) {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = Game[name];
      Game[name] = fn(orig);
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  }

  wrap('drawFeastScavenger', (orig) => function () {
    let preGate = null, preDraw = null;
    try { preGate = snapGate(Game); } catch (e) { noteErr(store, 'draw.preGate', e); preGate = { unlockedWave: null, poolWaves: null, poolIds: null, standing: null }; }
    try { preDraw = snapDraw(Game); } catch (e) { noteErr(store, 'draw.preDraw', e); }
    let result, threw = null;
    try { result = orig.apply(this, arguments); }
    catch (e) { threw = e; }
    try {
      const r = (result && typeof result === 'object') ? result : {};
      const mid = (r.monsterId != null ? String(r.monsterId) : null);
      let postUw = null;
      try { postUw = (typeof Game.unlockedWave === 'function') ? (Game.unlockedWave() | 0) : null; } catch (e) { postUw = null; }
      const postDraw = snapDraw(Game);
      pushCapped(store, 'rows', {
        day: dayOf(Game), drawn: !!r.drawn, monsterId: mid,
        veteran: !!r.veteran,
        wave: mid ? waveOf(Game, mid) : null,
        why: (r.why != null ? String(r.why).slice(0, 160) : null),
        preUnlockedWave: preGate ? preGate.unlockedWave : null,
        preUnlockedWaveErr: preGate ? preGate.unlockedWaveErr : null,
        prePoolWaves: preGate ? preGate.poolWaves : null,
        prePoolHasDrawn: (preGate && preGate.poolIds && mid) ? (preGate.poolIds.indexOf(mid) >= 0) : null,
        preStanding: preGate ? preGate.standing : null,
        postUnlockedWave: postUw,
        preDraw: preDraw, postDraw: postDraw,
        threw: threw ? String((threw && threw.message) || threw).slice(0, 160) : null,
      });
    } catch (e) { noteErr(store, 'draw.rec', e); }
    if (threw) throw threw;
    return result;
  });

  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._drawwaveDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._drawwaveDiagStore = store;
    Game._drawwaveDiagInstalled = true;
    Game._drawwaveDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withDrawwaveDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installDrawwaveDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._drawwave = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

// analyzeDrawwave(dwStore, fdStore, nwkStore): pure over one
// seed's stores. fdStore may be null (then the feastdraw join
// is empty, never guessed); nwkStore is accepted for signature
// symmetry and ignored (fight joins live in the feastdraw
// analyzer, reused by the sweep). Classification (fixed in the
// evidence pre-registration, repeated here):
//   APPROPRIATE = spawned, wave != null, unlockedWave != null,
//     draw wave <= unlockedWave.
//   EARLY = spawned, draw wave > unlockedWave.
//   IMPOSSIBLE = spawned, drawn id NOT in the pre-call pool
//     (prePoolHasDrawn false; null when the pool read failed —
//     null is NOT impossible, it is unclassified-adjacent and
//     reported in poolUnknown, never counted as impossible).
//   UNCLASSIFIED = spawned with unlockedWave null, or draw wave
//     null, or no joined feastdraw draw row (monsterId + day).
// Not-spawned rows (drawn false) carry unlockedWave for
// completeness but are NOT in the appropriateness denominator.
function analyzeDrawwave(dwStore, fdStore) {
  const rows = (dwStore && dwStore.rows) || [];
  const spawned = rows.filter(r => r.drawn);
  const notSpawned = rows.filter(r => !r.drawn);
  const fdDraws = (fdStore && fdStore.draws) || [];
  const fdKeys = new Set(fdDraws.filter(d => d.drawn).map(d => d.monsterId + '|' + d.day));
  const perDraw = [];
  for (const r of spawned) {
    const joined = fdKeys.has(r.monsterId + '|' + r.day);
    let verdict = null;
    if (r.preUnlockedWave == null || r.wave == null || !joined) verdict = 'unclassified';
    else if ((r.wave | 0) > (r.preUnlockedWave | 0)) verdict = 'early';
    else verdict = 'appropriate';
    const impossible = (r.prePoolHasDrawn === false);
    const poolUnknown = (r.prePoolHasDrawn == null);
    perDraw.push({
      day: r.day, monsterId: r.monsterId, wave: r.wave, veteran: r.veteran,
      unlockedWave: r.preUnlockedWave, postUnlockedWave: r.postUnlockedWave,
      gateMoved: (r.preUnlockedWave != null && r.postUnlockedWave != null) ? (r.preUnlockedWave !== r.postUnlockedWave) : null,
      poolWaves: r.prePoolWaves, poolHasDrawn: r.prePoolHasDrawn,
      standing: r.preStanding, joinedFeastdraw: joined,
      verdict: verdict, impossible: impossible, poolUnknown: poolUnknown,
    });
  }
  const byVerdict = perDraw.reduce((m, o) => { m[o.verdict] = (m[o.verdict] || 0) + 1; return m; }, {});
  return {
    calls: rows.length, spawned: spawned.length, notSpawned: notSpawned.length,
    perDraw: perDraw,
    appropriate: byVerdict.appropriate || 0, early: byVerdict.early || 0,
    unclassified: byVerdict.unclassified || 0,
    impossible: perDraw.filter(o => o.impossible).length,
    poolUnknown: perDraw.filter(o => o.poolUnknown).length,
    gateMoved: perDraw.filter(o => o.gateMoved === true).length,
    notSpawnedRows: notSpawned.map(r => ({ day: r.day, why: r.why, unlockedWave: r.preUnlockedWave })),
    unclassifiedDraws: perDraw.filter(o => o.verdict === 'unclassified').map(o => ({ day: o.day, monsterId: o.monsterId, wave: o.wave, unlockedWave: o.unlockedWave, joined: o.joinedFeastdraw })),
  };
}

module.exports = { layerOn, newStore, installDrawwaveDiag, withDrawwaveDiag, analyzeDrawwave, MAX_EVENTS };
