// funnel-diag — survivor-funnel PICK-TIME recorder (sim-funnel-a,
// 2026-10-29, flesh-out loop, axis scale-onramp, DIAG ONLY: zero
// src/js changes, policy-side recorder only).
//
// QUESTION (from sim-returns-a, run 20261029T0002Z): of 19 survivor
// triples (seed, villager, wave-4 beast) only 1 ever got a HUNT
// departure, and returns-a proved PICK time differs from departure
// time (seed 75106 visjoin_115: huntDay 132, departure day 137).
// Departure records alone cannot decompose the 18 losses: the
// funnel must be traced at PICK time — what the villager chose at
// each dawn/idle pick, what fight memories they held before the
// pick, whether a HUNT was offerable at that pick, and when each
// memory was formed (objNoteMonsterSighting write) or evicted.
//
// This recorder supplies the two missing channels:
//   picks: one record per objPick call where the villager held a
//     wave-4 fight memory before the pick, or chose a wave-4 HUNT.
//     Each record carries the pre-pick memory list, the chosen
//     objective (compact), the HUNT candidate recomputed at pick
//     time with the pick's own (hx, hy), and the candidate's gate
//     flags (armed, sheltered, post-flee resting, maxD, node).
//   notes: one record per objNoteMonsterSighting call (all waves —
//     small volume, and a wave-4 memory is evicted by other-wave
//     notes under the cap-4 store): the memory-formation event
//     itself, whether it refreshed an existing entry or created a
//     new one, the list length after, and whether the write
//     evicted an entry (cap-4 oldest-drop).
//
// OBSERVATIONAL ONLY. FUNNEL=1 is the only on-switch. Unset
// delegates byte-identically: no wraps installed, no ctx surface,
// no record. Wraps record AFTER delegating where the record needs
// the result (note post-list, pick post-choice) and read state
// BEFORE where the record must predate the engine (pick pre-
// memories). Pre-reads are DIRECT state reads only —
// state.village.monsterSightings[vid] copied by hand — NEVER
// objOf(), which CREATES entries, and never npcNode(), which
// CREATES entries. The candidate recompute calls
// Game.objHuntCandidate, a pure read function (no RNG draws: it
// reads armed/sheltered/resting/range/sightings only), AFTER the
// pick — and the pick itself already computed the villager's
// range profile, so the recompute is a cache hit, not a new
// write. Gate-flag reads (objVillagerArmed, isSheltered,
// isPostFleeResting, npcMaxDist) are likewise pure reads. No wrap
// draws RNG, writes game state, or throws into the engine
// (recording errors are counted; an engine throw is recorded
// where applicable and RETHROWN unchanged). This recorder wraps
// NO fieldFight function, so it cannot perturb the returns
// channels by wrap order; it stacks alongside fieldparty-form-
// diag and returns-diag, both reused verbatim.
//
// PART SCALES, READ CAREFULLY: the pick/note record carries BOTH
// `part` (this recorder's own advancePart counter, the
// returns-style ordering scale — both recorders increment once
// per advancePart call, so the counters agree at every event)
// AND `dayPart` (Game.dayPart, the scale objNoteMonsterSighting
// stamps into memory entries). Joins to returns departures use
// the partCounter scale on both sides; freshness ages use
// (day, dayPart) against memory stamps, never the counter
// against a stamp. A memory's (day, part) stamp comes from
// Game.dayPart at note time; a pick's dayPart is Game.dayPart
// at pick time — same scale, comparable.
'use strict';

const MAX_EVENTS = 200000;

function layerOn() { try { return process.env.FUNNEL === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function dayPartOf(Game) { try { return (Game.dayPart != null) ? (Game.dayPart | 0) : null; } catch (e) { return null; } }

function newStore() {
  return { picks: [], notes: [], partCounter: 0, errs: 0, errors: [], overflow: {}, installed: false };
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

// Compact copy of a monsterSightings list: [mid, tx, ty, day, part]
// tuples only — the analyzer needs identity, tile, and stamp, and
// nothing else. Direct read, never a Game call.
function copySightingsCompact(list) {
  if (!Array.isArray(list)) return [];
  const out = [];
  for (const e of list) {
    if (!e || !e.mid) continue;
    out.push([e.mid, (e.tx != null) ? e.tx : null, (e.ty != null) ? e.ty : null,
      (e.day != null) ? e.day : null, (e.part != null) ? e.part : null]);
  }
  return out;
}

function compactObjective(o) {
  if (!o || typeof o !== 'object') return null;
  return {
    kind: o.kind || null, purpose: o.purpose || null, state: o.state || null,
    tx: (o.tx != null) ? o.tx : null, ty: (o.ty != null) ? o.ty : null,
    huntMid: o.huntMid || null, huntTx: (o.huntTx != null) ? o.huntTx : null,
    huntTy: (o.huntTy != null) ? o.huntTy : null, huntDay: (o.huntDay != null) ? o.huntDay : null,
    indoor: !!o.indoor, targetVid: o.targetVid || null,
  };
}

function waveOf(Game, mid) {
  try {
    const defs = ((Game.data || {}).monsters) || [];
    for (const d of defs) if (d && d.id === mid) return (d.wave | 0) || null;
  } catch (e) { /* fall through */ }
  return null;
}

function installFunnelDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._funnelDiagStore === store && Game._funnelDiagInstalled) return Game._funnelDiagUninstall || function () {};
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

  // Memory-formation events: every objNoteMonsterSighting write.
  wrap('objNoteMonsterSighting', (orig) => function (vid, mid, tx, ty) {
    let preList = null;
    let preHad = false;
    try {
      const village = (Game.state && Game.state.village) || {};
      const list = ((village.monsterSightings || {})[vid]) || null;
      preList = list ? list.slice() : null;
      preHad = !!(list && list.some(e => e && e.mid === mid && e.tx === tx && e.ty === ty));
    } catch (e) { noteErr(store, 'objNoteMonsterSighting.pre', e); }
    let r = null;
    try { r = orig.apply(this, arguments); }
    catch (e) { throw e; }
    try {
      const village = (Game.state && Game.state.village) || {};
      const list = ((village.monsterSightings || {})[vid]) || [];
      const evicted = [];
      if (preList) {
        for (const e of preList) {
          if (!e || !e.mid) continue;
          const still = list.some(x => x && x.mid === e.mid && x.tx === e.tx && x.ty === e.ty);
          if (!still) evicted.push([e.mid, e.tx, e.ty, e.day, e.part]);
        }
      }
      pushCapped(store, 'notes', {
        day: dayOf(Game), part: store.partCounter, dayPart: dayPartOf(Game),
        vid: vid != null ? String(vid) : null,
        mid: mid || null, tx: (tx != null) ? tx : null, ty: (ty != null) ? ty : null,
        refreshed: preHad,
        listLenAfter: list.length,
        evicted: evicted,
        postSightings: copySightingsCompact(list),
      });
    } catch (e) { noteErr(store, 'objNoteMonsterSighting.rec', e); }
    return r;
  });

  // Pick events: pre-pick memories (direct read only) + post-pick
  // choice + candidate-at-pick + gate flags. Recorded only for
  // wave-4 memory holders and wave-4 HUNT choosers (the judged
  // universe); other picks are noise for this arm.
  wrap('objPick', (orig) => function (vid, hx, hy) {
    let preSightings = [];
    try {
      const village = (Game.state && Game.state.village) || {};
      preSightings = copySightingsCompact(((village.monsterSightings || {})[vid]) || []);
    } catch (e) { noteErr(store, 'objPick.pre', e); }
    let r = null;
    try { r = orig.apply(this, arguments); }
    catch (e) { throw e; }
    try {
      const chosen = compactObjective(r);
      let postSightings = preSightings;
      try {
        const village = (Game.state && Game.state.village) || {};
        postSightings = copySightingsCompact(((village.monsterSightings || {})[vid]) || []);
      } catch (e) { /* keep pre-pick copy */ }
      const preHasW4 = preSightings.some(s => waveOf(Game, s[0]) === 4);
      const choseW4Hunt = !!(chosen && chosen.kind === 'HUNT' && waveOf(Game, chosen.huntMid) === 4);
      if (!preHasW4 && !choseW4Hunt) return r;
      let candidate = null;
      let candidateErr = null;
      try {
        if (typeof Game.objHuntCandidate === 'function') {
          const c = Game.objHuntCandidate(vid, hx, hy);
          candidate = c ? { mid: c.mid || null, tx: (c.tx != null) ? c.tx : null, ty: (c.ty != null) ? c.ty : null, day: (c.day != null) ? c.day : null } : null;
        }
      } catch (e) { candidateErr = String((e && e.message) || e).slice(0, 120); }
      let armed = null, sheltered = null, postFlee = null, maxD = null, node = null;
      try { armed = (typeof Game.objVillagerArmed === 'function') ? !!Game.objVillagerArmed(vid) : null; } catch (e) { armed = null; }
      try { sheltered = (typeof Game.isSheltered === 'function') ? !!Game.isSheltered(vid) : null; } catch (e) { sheltered = null; }
      try { postFlee = (typeof Game.isPostFleeResting === 'function') ? !!Game.isPostFleeResting(vid) : null; } catch (e) { postFlee = null; }
      try { maxD = (typeof Game.npcMaxDist === 'function') ? (Game.npcMaxDist(vid) | 0) : null; } catch (e) { maxD = null; }
      try {
        const np = ((Game.state && Game.state.village) || {}).nodePos || {};
        const n = np[vid] || null;
        node = n ? { nx: n.nx, ny: n.ny } : null;
      } catch (e) { node = null; }
      pushCapped(store, 'picks', {
        day: dayOf(Game), part: store.partCounter, dayPart: dayPartOf(Game),
        vid: vid != null ? String(vid) : null,
        hx: (hx != null) ? hx : null, hy: (hy != null) ? hy : null,
        node: node,
        chosen: chosen,
        preSightings: preSightings,
        postSightings: postSightings,
        candidate: candidate, candidateErr: candidateErr,
        gates: { armed: armed, sheltered: sheltered, postFleeResting: postFlee, maxD: maxD },
      });
    } catch (e) { noteErr(store, 'objPick.rec', e); }
    return r;
  });

  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._funnelDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._funnelDiagStore = store;
    Game._funnelDiagInstalled = true;
    Game._funnelDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withFunnelDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installFunnelDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._funnel = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

module.exports = { layerOn, newStore, installFunnelDiag, withFunnelDiag, MAX_EVENTS, copySightingsCompact, compactObjective };
