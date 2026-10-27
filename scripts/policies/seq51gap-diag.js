// seq51gap-diag — daily world-entity HP tick recorder for
// sim-seq51gap-a (2026-10-26, flesh-out loop, axis scale-onramp).
// DIAG ONLY: zero src/js changes, policy-side only.
//
// WHAT IT RECORDS: once per scholar day, at policy.daily time
// (which the harness runs after the day's actions and BEFORE
// sleep(); sleep rolls the day and runs progDaily, i.e.
// havenGrowthDaily + havenRaidTick), a snapshot of EVERY world
// monster entity: monster type, hp, maxHp, tile (tx,ty), lingering
// flag, lingerSince, and the recorder seq tag the spawnsrc
// recorder stamped on the object (_spawnSeq; null when the
// entity predates spawnsrc installation), plus the tick-day
// village context (lastRaidDay, havenTier). Consecutive ticks
// therefore bracket exactly one night's progDaily plus one day's
// actions, and a tick-to-tick HP change joins to that day's
// field rows (w4dmg/wave4enc/fieldfinish) and tb-start tile
// reads (nonworldkill) by seq + day.
//
// WHY A SEPARATE RECORDER (and why it must compose OUTERMOST):
// the w4dmg-a recorders capture fights, not the world list
// between fights. A raid-night palisade deduction, a tbEnd
// restore, or a spawn replacement changes world HP with no
// fight row at all — only a daily list snapshot sees it. The
// sweep composes this recorder outermost so its snapshot runs
// AFTER the inner policy's daily work, still before sleep.
//
// OBSERVATIONAL ONLY. SEQ51GAP=1 is the only on-switch. Unset
// delegates byte-identically: no snapshot, no ctx surface, no
// record. The snapshot copies scalar fields only (never the
// live objects), writes nothing to game state, draws no RNG,
// never throws into the engine (recording errors are counted),
// and returns the inner daily's value untouched. It never calls
// villageStandingTotal() or unlockedWave() mid-run. One tick
// per scholar day: repeated policy.daily calls on the same
// scholar day collapse to a single row (the first), so a frozen
// day cannot inflate tick coverage; the sweep's post-run
// pure-read snapshot closes the tail.
'use strict';

const MAX_TICKS = 20000;

function layerOn() { try { return process.env.SEQ51GAP === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }

function newStore() {
  return {
    ticks: [],
    errs: 0, errors: [], overflow: 0,
    installed: false, lastTickDay: null,
  };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

// snapshotWorld(Game): pure read of the world list + village
// raid context. Returns a tick row, or null when the day was
// already ticked (collapse rule above).
// raid context. Returns a tick row, or null when the day was
// already ticked (collapse rule above).
function snapshotWorld(Game, store) {
  const day = dayOf(Game);
  if (store.lastTickDay === day && store.ticks.length) return null;
  const tick = { day: day, lastRaidDay: null, havenTier: null, hx: 4, hy: 4, entities: [] };
  try {
    const v = (Game.state || {}).village || {};
    tick.lastRaidDay = (v.lastRaidDay != null) ? (v.lastRaidDay | 0) : null;
    if (v.px != null) tick.hx = v.px | 0;
    if (v.py != null) tick.hy = v.py | 0;
  } catch (e) { noteErr(store, 'tick.lastRaidDay', e); }
  try {
    tick.havenTier = (typeof Game.havenTier === 'function') ? (Game.havenTier() | 0) : null;
  } catch (e) { noteErr(store, 'tick.havenTier', e); }
  try {
    const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
    for (const m of list) {
      if (!m) continue;
      let wave = null;
      try {
        if (m.wave != null && isFinite(m.wave)) wave = m.wave | 0;
        else {
          const def = ((Game.data && Game.data.monsters) || []).find(d => d && d.id === m.id);
          if (def && def.wave != null) wave = def.wave | 0;
        }
      } catch (e) { /* wave best-effort */ }
      tick.entities.push({
        id: m.id || null,
        seq: (m._spawnSeq != null) ? (m._spawnSeq | 0) : null,
        src: (m._spawnsrc != null) ? String(m._spawnsrc) : null,
        wave: wave,
        hp: roundHp(m.hp), maxHp: roundHp(m.maxHp),
        tx: (m.tx != null) ? (m.tx | 0) : null, ty: (m.ty != null) ? (m.ty | 0) : null,
        lingering: !!m.lingering,
        lingerSince: (m.lingerSince != null) ? (m.lingerSince | 0) : null,
        titan: !!m.titan, veteran: !!m.veteran,
      });
    }
  } catch (e) { noteErr(store, 'tick.entities', e); }
  if (store.ticks.length >= MAX_TICKS) { store.overflow++; return tick; }
  store.ticks.push(tick);
  store.lastTickDay = day;
  return tick;
}

// snapshotWorldForce(Game, store): like snapshotWorld but always
// pushes (used for the post-run tail snapshot, where the scholar
// day may equal the last tick day yet the world list may have
// moved since that tick).
function snapshotWorldForce(Game, store) {
  const saved = store.lastTickDay;
  store.lastTickDay = null;
  const tick = snapshotWorld(Game, store);
  if (tick) tick.source = 'postrun';
  else store.lastTickDay = saved;
  return tick;
}

function installSeq51gapDiag(Game, store) {
  // No Game-method wraps: this recorder is daily-snapshot only.
  // install() exists so the sweep's install pattern (and the
  // det-gate's "no wraps installed" check) has a uniform shape:
  // it sets the installed flag and nothing else.
  if (!Game || !store) return function () {};
  store.installed = true;
  try { Game._seq51gapDiagInstalled = true; } catch (e) {}
  return function () { try { Game._seq51gapDiagInstalled = false; } catch (e) {} store.installed = false; };
}

function withSeq51gapDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { snapshotWorld(Game, st); } catch (e) { noteErr(st, 'daily.snapshot', e); }
        try { ctx._seq51gap = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

module.exports = { layerOn, newStore, installSeq51gapDiag, withSeq51gapDiag, snapshotWorld, snapshotWorldForce, MAX_TICKS };
