// spawnfate-diag — daily world-monster census for the spawnfate question
// (journey-scale r41, lane A, 2026-10-26).
//
// QUESTION (from sim-wave4enc-a, 1920Z round): 24/33 wave-4 spawns are
// never fought. The wave4enc sweep counts the never-fought class but
// cannot say WHY: it records births (spawnsrc-diag) and fight starts
// (wave4enc-diag, nonworldkill-diag) but nothing about a spawn's life
// between birth and the end of the run. This recorder fills that gap
// with a once-a-day census of the living world list, so the analyzer
// can join each wave-4 spawn sequence to exactly one fate:
//   fought-field / fought-tb (a fight row names its seq), alive-at-end
//   (still on the census on the last day), or vanished (seen, then
//   gone with no fight row) — with last-seen position and
//   closest-approach-to-player distance for every vanished spawn.
//
// MECHANISM, READ FROM CODE (never invented):
//   - The living world list is Game.worldMonsters() (state.worldMonsters);
//     monsters persist when the player leaves and wander between tiles
//     (src/js/game.js worldMonsters() header + AGENTS.md map note).
//   - A monster's tile is (m.tx, m.ty): nonworldkill-diag matches the
//     player-tile monster with m.tx === Game.map.px && m.ty === Game.map.py,
//     so Manhattan distance on (tx, ty) vs (map.px, map.py) is the
//     encounter-relevant distance.
//   - The spawn sequence is the spawnsrc-diag birth tag (m._spawnSeq);
//     untagged entities (spawned before the recorder installed) get a
//     stable per-run id from a WeakMap, never a position guess — two
//     different monsters on one tile are still two census rows.
//   - Wave is m.wave when present, else Game.crisisWaveOf(m), else 1 —
//     the same fallback chain spawnsrc-diag uses.
//
// OBSERVATIONAL ONLY. SPAWNFATE=1 is the only on-switch. Unset
// delegates byte-identically: no snapshot, no ctx surface, no record.
// The snapshot runs AFTER the inner policy's daily work (end-of-day
// state), draws no RNG, writes nothing to game state, never throws
// into the engine (recording errors are counted in errs/errors),
// and returns the inner daily's value untouched.
//
// KNOWN LIMITS (stated, not hidden):
//   - A monster removed and re-added as the SAME object (fled-monster
//     recovery, combat restore) keeps its fate id, so it reads as one
//     continuous life, not a death and rebirth. That matches the
//     engine: it IS the same object.
//   - A monster that leaves the world list during a tb fight and is
//     restored afterwards shows as absent for the fight's days; the
//     analyzer joins on fight rows, so a fought spawn is never
//     misread as vanished — but its last-seen day may predate the
//     fight by the fight's length. Vanished classification requires
//     NO fight row for the seq, so this gap cannot create a false
//     vanished spawn.
//   - Census is once a day: a spawn born and removed within one day
//     may never appear. Such a spawn still appears in the spawnsrc
//     birth list; the analyzer counts it as unclassified, never as
//     vanished, and the fully-partitioned gate counts it against GO.
'use strict';

const MAX_DAYS = 400;
const MAX_MONSTERS_PER_DAY = 300;

function layerOn() { try { return process.env.SPAWNFATE === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function newStore() {
  return {
    days: [],
    errs: 0, errors: [], overflow: { days: 0, monsters: 0 },
    installed: false, seq: 0,
    byObj: new WeakMap(),
  };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

function waveOf(Game, m) {
  try {
    if (m && m.wave != null && isFinite(m.wave)) return m.wave | 0;
    if (typeof Game.crisisWaveOf === 'function') {
      const w = Game.crisisWaveOf(m);
      if (w && isFinite(w)) return w | 0;
    }
  } catch (e) { noteErr(null, 'waveOf', e); }
  return 1;
}

function fateIdOf(store, m) {
  try {
    if (m && m._spawnSeq != null && isFinite(m._spawnSeq)) return 's' + (m._spawnSeq | 0);
  } catch (e) { /* fall through to the WeakMap id */ }
  try {
    if (m && store.byObj.has(m)) return store.byObj.get(m);
  } catch (e) { /* fall through to assignment */ }
  try {
    store.seq++;
    const id = 'u' + store.seq;
    if (m) store.byObj.set(m, id);
    return id;
  } catch (e) { noteErr(store, 'fateId', e); return 'u?'; }
}

function snapshot(Game, store) {
  let list = [];
  try {
    list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : ((Game.state || {}).worldMonsters || []);
  } catch (e) { noteErr(store, 'worldList', e); list = []; }
  let px = null, py = null;
  try { px = Game.map.px; py = Game.map.py; } catch (e) { noteErr(store, 'playerTile', e); }
  const day = dayOf(Game);
  const monsters = [];
  for (const m of (Array.isArray(list) ? list : [])) {
    if (monsters.length >= MAX_MONSTERS_PER_DAY) { store.overflow.monsters++; break; }
    try {
      const tx = (m && isFinite(m.tx)) ? (m.tx | 0) : null;
      const ty = (m && isFinite(m.ty)) ? (m.ty | 0) : null;
      const dist = (tx != null && ty != null && px != null && py != null)
        ? (Math.abs(tx - px) + Math.abs(ty - py)) : null;
      monsters.push({
        fate: fateIdOf(store, m),
        seq: (m && m._spawnSeq != null && isFinite(m._spawnSeq)) ? (m._spawnSeq | 0) : null,
        type: (m && m.id != null) ? String(m.id) : null,
        wave: waveOf(Game, m),
        veteran: !!(m && m.veteran),
        tx, ty, dist,
      });
    } catch (e) { noteErr(store, 'monsterRow', e); }
  }
  if (store.days.length >= MAX_DAYS) { store.overflow.days++; return; }
  store.days.push({ day, player: (px != null && py != null) ? [px, py] : null, monsters });
}

function withSpawnfateDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { snapshot(Game, st); } catch (e) { noteErr(st, 'daily.snapshot', e); }
        try { ctx._spawnfate = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

module.exports = { layerOn, newStore, withSpawnfateDiag, snapshot, waveOf, MAX_DAYS };
