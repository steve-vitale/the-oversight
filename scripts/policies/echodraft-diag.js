// echodraft-diag — raid-draft distance + wound-state recorder
// (sim-echodraft-a, 2026-10-25, flesh-out loop, axis scale-onramp,
// DIAG ONLY: zero src/js changes, policy-side recorder only).
//
// QUESTION (carried blank, sim-defwound-a Stage 1): defender-wounded
// entities are re-met 10.3 times each vs 4.1 for field-wounded ones
// (577/56 vs 293/72). Hypothesis (UNCONFIRMED): defender-wounded
// entities stay near Haven and the nearest-first raid draft keeps
// re-pulling them. This recorder traces the draft itself — it does
// not re-derive the re-meet counts (defwound-diag already owns
// those) and it changes no rule.
//
// MECHANISM, READ FROM CODE (never invented):
//   - havenRaidTick (havenGrowth.js): living world monsters sorted
//     by Manhattan distance |tx-hx| + |ty-hy| to Haven (v.px ?? 4,
//     v.py ?? 4), first raidN taken, raidN = min(5, 3 +
//     (pantry > 12000) + (pantry > 24000)). Drafted raiders are then
//     TELEPORTED to the Haven tile (tx=hx, ty=hy) and, with a
//     palisade, take the toll (hp = max(1, hp - round(maxHp*0.25))).
//     A post-tick read therefore CANNOT see draft distance: the
//     recorder snapshots the pool BEFORE delegating, exactly as
//     raftdraft-diag does, and additionally records the instance
//     seq (m._spawnSeq, written by spawnsrc-diag) so each drafted
//     entity can be joined to its defwound fight history.
//   - Wound state at draft: pre-toll HP fraction vs the break line
//     (fieldFights.js mBreak: 0.15 wave>=2, 0.25 wave 1). An entity
//     below the line at draft time is a phantom-to-be: its defender
//     fight will end rounds-0 mFlee (defwound Stage 1: every
//     start-below-line defender fight ends mFlee, none ends vKill).
//   - Draft order vs pool order: the recorder recomputes the sort
//     with the engine's exact comparator (stable sort, distance
//     ascending) on its own pre-call snapshot. The drafted set
//     equalling the sorted first-raidN is therefore a CONSTRUCTION
//     check (recorder fidelity), not independent evidence about
//     the rule — the independent evidence is the distance
//     distribution of drafted vs pool entities and the
//     distance-by-wound-history splits in the analyzer.
//
// OBSERVATIONAL ONLY. ECHODRAFT=1 is the only on-switch. Unset
// delegates byte-identically: no wraps installed, no ctx surface,
// no daily record. The wrap records BEFORE delegating (pool
// snapshot) and reads pantry/tier AFTER delegating only to
// recompute raidN the way raftdraft-diag does; it writes nothing
// to game state, draws no RNG, never throws into the engine
// (recording errors are counted), and returns the original's
// value untouched.
//
// COMPOSE UPON (never edit): tableseat-nowait, raftdraft-diag,
// spawnsrc-diag, defwound-diag. POLICY-SIDE ONLY.
//
// KNOWN LIMITS (stated, not hidden):
// - Position is observed ONLY at draft snapshots. Between raids
//   an entity may wander (wanderWorldMonsters, 35%/tick, steering
//   clear of safe tiles); the trace sees where it is at the next
//   draft, not the path between drafts. A dist-0 reading at draft
//   time means "still at Haven when drafted", not "never moved".
// - Same-day ordering: a draft's own defender fights are same-day
//   defwound rows. The analyzer's prior-history class therefore
//   uses rows with day STRICTLY before the draft day, so a
//   draft's own fights never classify its own draft.
// - Untagged pool entries (seq null: spawned before spawnsrc
//   installed, or a clone that dropped the tag) are counted
//   separately and never merged into a species bucket.
'use strict';

const MAX_RAIDS = 5000;

function layerOn() { try { return process.env.ECHODRAFT === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }
function breakLineOf(wave) { return (wave | 0) >= 2 ? 0.15 : 0.25; }

function newStore() {
  return { raids: [], errs: 0, errors: [], overflow: { raids: 0 }, installed: false };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
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
// list, never sorted in place). Includes the instance seq so the
// analyzer can join to defwound fight history.
function snapPool(Game, hx, hy) {
  const out = [];
  try {
    const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
    for (let i = 0; i < list.length; i++) {
      const m = list[i];
      if (!m) continue;
      const hp = roundHp(m.hp), maxHp = roundHp(m.maxHp);
      const frac = (hp != null && maxHp) ? (hp / maxHp) : null;
      const wave = waveOf(Game, m);
      out.push({
        idx: i, seq: (m._spawnSeq != null ? m._spawnSeq : null), id: m.id || null,
        hp: hp, maxHp: maxHp, frac: frac, tx: m.tx, ty: m.ty,
        dist: (m.tx != null && m.ty != null) ? (Math.abs(m.tx - hx) + Math.abs(m.ty - hy)) : null,
        wave: wave, breakLine: breakLineOf(wave),
        belowLine: (frac != null) ? (frac < breakLineOf(wave)) : null,
        living: (m.hp || 0) > 0,
      });
    }
  } catch (e) { /* snapshot best-effort; caller records the error */ }
  return out;
}

function installEchodraftDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._echodraftDiagStore === store && Game._echodraftDiagInstalled) return Game._echodraftDiagUninstall || function () {};
  const uninstalls = [];
  const wrap = (name, fn) => {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = Game[name];
      Game[name] = fn(orig);
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  };

  // havenRaidTick: pool BEFORE, everything else AFTER.
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
      if (!fired) return r;
      const living = (prePool || []).filter(p => p.living);
      // Engine's exact sort: distance ascending, stable (JS sort is
      // stable; ties keep pool order). Recomputed on OUR snapshot.
      const sorted = living.slice().sort((a, b) => (a.dist == null ? 1e9 : a.dist) - (b.dist == null ? 1e9 : b.dist));
      const raidN = Math.min(5, 3 + (pantry > 12000 ? 1 : 0) + (pantry > 24000 ? 1 : 0));
      const drafted = sorted.slice(0, raidN);
      const pool = sorted.map((p, rank) => ({
        rank: rank, drafted: rank < raidN, seq: p.seq, type: p.id,
        wave: p.wave, dist: p.dist, preTx: p.tx, preTy: p.ty,
        preHp: p.hp, maxHp: p.maxHp, frac: p.frac,
        breakLine: p.breakLine, belowLine: p.belowLine, poolIdx: p.idx,
      }));
      if (store.raids.length >= MAX_RAIDS) { store.overflow.raids++; return r; }
      store.raids.push({
        day: day, hx: hx, hy: hy, pantry: pantry, havenTier: tier,
        raidN: raidN, poolN: (prePool || []).length, livingN: living.length,
        untaggedPool: living.filter(p => p.seq == null).length,
        untaggedDrafted: drafted.filter(p => p.seq == null).length,
        pool: pool,
        drafted: drafted.map((p, rank) => ({
          rank: rank, seq: p.seq, type: p.id, wave: p.wave, dist: p.dist,
          preTx: p.tx, preTy: p.ty, preHp: p.hp, maxHp: p.maxHp, frac: p.frac,
          breakLine: p.breakLine, belowLine: p.belowLine, poolIdx: p.idx,
        })),
      });
    } catch (e) { noteErr(store, 'raid.rec', e); }
    return r;
  });

  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._echodraftDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._echodraftDiagStore = store;
    Game._echodraftDiagInstalled = true;
    Game._echodraftDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withEchodraftDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installEchodraftDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._echodraft = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

module.exports = { layerOn, newStore, installEchodraftDiag, withEchodraftDiag, snapPool, breakLineOf, MAX_RAIDS };
