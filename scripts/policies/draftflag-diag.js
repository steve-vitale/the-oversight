// draftflag-diag — siege-draft / siege-flag lifecycle recorder for
// sim-draftflag-a (2026-10-30, flesh-out loop, axis scale-onramp,
// DIAG ONLY: zero src/js changes, policy-side recorder only).
//
// QUESTION (from sim-removal-a / sim-scholarmelt-a): two wild wave-4
// chains bridge to the siege by an event that was never recorded —
// the draft itself. s75116 suburb uid 29 (1285, roaming) is a 960
// lingerer at (4,4) by its d159 removal, and s75116 audit uid 28
// (spawned d132 at 1100) is an 825 lingerer at (4,4) by its d133
// census. Both bridges rest on toll signature + uid continuity.
// This recorder dates the draft directly.
//
// MECHANISM, READ FROM CODE (havenGrowth.js havenRaidTick, never
// invented): havenRaidTick runs from the progDaily wrap every
// endDay. On a fired raid it picks the raidN nearest living world
// monsters to the haven tile, sets raidBorn=true, moves each to
// the haven tile, and — if palisade (havenTier() >= 2) — charges
// wall = round(maxHp * 0.25), hp = max(1, hp - wall). The toll is
// on maxHp, not current hp. Later in the SAME function, raiders
// nobody meets flip lingering=true (defenders loop / pending
// collision branch). raidBorn is set ONLY in this function (the
// sole `raidBorn =` in src/js), and lingering is set true ONLY in
// this function (havenGrowthDaily re-pins and clears, never sets).
// So a before/after diff across one havenRaidTick call IS the draft
// event: no other hook is needed for the draft step. Per-raider
// order INSIDE one call is not hooked (one wrap covers the whole
// loop) — all raiders in a call share the call's day + seq, and
// the verdict granularity is per-call, stated as such.
//
// SECONDARY LEG (removal-a open question): tbEnd restores a lifted
// lingering worldOrigin only if the origin tile is unoccupied
// (game.js tbEnd: worldMonsters().indexOf(o) < 0 &&
// !monsterAt(o.tx, o.ty)). The tbEnd wrap captures the guard
// inputs before delegating (origin snapshot, monsterAt occupant
// or null, in-world flag) and the restore outcome after, so a
// not-restored lingerer can be explained as tile-occupied or
// otherwise. Reported as secondary, never judged with the primary.
//
// OBSERVATIONAL ONLY. DRAFTFLAG=1 is the only on-switch. Unset
// delegates byte-identically: no wraps installed, no ctx surface,
// no record. The wraps write nothing to game state (store arrays
// + a module-side WeakMap only, or the caller-supplied uidFn),
// draw no RNG, never throw into the engine (recording errors are
// counted, and an engine throw is recorded and RETHROWN
// unchanged), and return the original value untouched. Monster
// OBJECT references are kept in a module-side WeakMap keyed by
// store — never inside the serialized store — so JSON.stringify
// of a sweep row cannot drag a world object (or a cycle) into the
// corpus. Uids: the sweep passes the removal store's uidFn so
// draft uids == census uids == removal uids; standalone use falls
// back to this module's own per-store WeakMap. Stack frames are
// recorded on raid events (caller chain proves the progDaily /
// endDay path). Only FIRED raid calls produce events (the draft
// loop sits after every early return, so an unfired call cannot
// draft); unfired calls are counted in the diag block only.
'use strict';

const MAX_EVENTS = 40000;

function layerOn() { try { return process.env.DRAFTFLAG === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }

function newStore() {
  return { events: [], raidCalls: 0, raidFired: 0, tbEndTotal: 0, tbEndWithOrigin: 0,
    errs: 0, errors: [], overflow: {}, installed: false };
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

// Module-side state per store (never serialized): event seq counter
// + fallback uid counter/WeakMap (used only when no uidFn is given).
const sideState = new WeakMap();
function side(store) {
  let s = sideState.get(store);
  if (!s) { s = { nextSeq: 1, nextUid: 1, uidMap: new WeakMap() }; sideState.set(store, s); }
  return s;
}
function fallbackUidFor(store, obj) {
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

function snapMonster(Game, uidFn, m) {
  if (!m) return null;
  return {
    id: m.id != null ? String(m.id) : null,
    uid: uidFn(m),
    wave: waveOf(Game, m),
    hp: roundHp(m.hp), maxHp: roundHp(m.maxHp),
    tx: (m.tx != null ? m.tx : null), ty: (m.ty != null ? m.ty : null),
    lingering: !!m.lingering, raidBorn: !!m.raidBorn, titan: !!m.titan,
  };
}

function stackInfo() {
  try {
    const st = new Error('draftflag-diag').stack || '';
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

function havenTileOf(Game) {
  try {
    const v = (Game.state || {}).village || {};
    return { hx: (v.px !== undefined && v.px !== null) ? v.px : 4,
             hy: (v.py !== undefined && v.py !== null) ? v.py : 4 };
  } catch (e) { return { hx: 4, hy: 4 }; }
}

function installDraftflagDiag(Game, store, uidFnOpt) {
  if (!Game || !store) return function () {};
  if (Game._draftflagDiagStore === store && Game._draftflagDiagInstalled) return Game._draftflagDiagUninstall || function () {};
  const uidFn = (typeof uidFnOpt === 'function') ? uidFnOpt : ((m) => fallbackUidFor(store, m));
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

  wrap('havenRaidTick', (orig) => function () {
    store.raidCalls++;
    let before = null, beforeCtx = null;
    try {
      const wms = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
      before = wms.map(m => ({ obj: m, snap: snapMonster(Game, uidFn, m) }));
      let palisade = null, pantry = null, lastRaidDay = null;
      try { palisade = (typeof Game.havenTier === 'function') ? (Game.havenTier() >= 2) : null; } catch (e) {}
      try { pantry = (typeof Game.pantryKcalLive === 'function') ? Game.pantryKcalLive(Game.state.village) : null; } catch (e) {}
      try { lastRaidDay = ((Game.state || {}).village || {}).lastRaidDay || 0; } catch (e) {}
      beforeCtx = { palisade, pantry, lastRaidDay, living: before.length, haven: havenTileOf(Game) };
    } catch (e) { noteErr(store, 'havenRaidTick.pre', e); }
    const stack = stackInfo();
    let ret = null;
    try { ret = orig.apply(this, arguments); }
    catch (e) {
      try {
        pushCapped(store, { type: 'raid', seq: st.nextSeq++, day: dayOf(Game),
          fired: false, threw: true, beforeCtx, drafts: [], stack });
      } catch (e2) { noteErr(store, 'havenRaidTick.throwRec', e2); }
      throw e;
    }
    try {
      if (ret) {
        store.raidFired++;
        const drafts = [];
        if (before) {
          const wmsAfter = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
          for (const b of before) {
            if (!b.snap) continue;
            const after = snapMonster(Game, uidFn, b.obj);
            if (!after) continue;
            const changed = (after.tx !== b.snap.tx) || (after.ty !== b.snap.ty) ||
              (after.hp !== b.snap.hp) || (after.lingering !== b.snap.lingering) ||
              (after.raidBorn !== b.snap.raidBorn);
            if (!changed) continue;
            const tollExpected = (beforeCtx && beforeCtx.palisade)
              ? Math.round((b.snap.maxHp || b.snap.hp || 20) * 0.25) : 0;
            drafts.push({
              uid: b.snap.uid, id: b.snap.id, wave: b.snap.wave,
              hpBefore: b.snap.hp, hpAfter: after.hp, maxHp: b.snap.maxHp,
              toll: ((b.snap.hp != null && after.hp != null) ? (b.snap.hp - after.hp) : null),
              tollExpected, tollExact: ((b.snap.hp != null && after.hp != null)
                ? ((b.snap.hp - after.hp) === tollExpected) : false),
              txBefore: b.snap.tx, tyBefore: b.snap.ty, txAfter: after.tx, tyAfter: after.ty,
              lingeringBefore: b.snap.lingering, lingeringAfter: after.lingering,
              raidBornBefore: b.snap.raidBorn, raidBornAfter: after.raidBorn,
              inWorldAfter: wmsAfter.indexOf(b.obj) >= 0,
            });
          }
        }
        let lastRaidDayAfter = null;
        try { lastRaidDayAfter = ((Game.state || {}).village || {}).lastRaidDay || 0; } catch (e) {}
        pushCapped(store, { type: 'raid', seq: st.nextSeq++, day: dayOf(Game),
          fired: true, threw: false, beforeCtx, lastRaidDayAfter, drafts, stack });
      }
    } catch (e) { noteErr(store, 'havenRaidTick.post', e); }
    return ret;
  });

  wrap('tbEnd', (orig) => function () {
    store.tbEndTotal++;
    const resultArg = (arguments.length ? arguments[0] : null);
    let pre = null;
    try {
      const f = Game.tbfight || null;
      const o = (f && f.worldOrigin) ? f.worldOrigin : null;
      if (o) {
        store.tbEndWithOrigin++;
        let occupant = null, occupantObj = null;
        try {
          occupantObj = (typeof Game.monsterAt === 'function') ? Game.monsterAt(o.tx, o.ty) : null;
          occupant = occupantObj ? snapMonster(Game, uidFn, occupantObj) : null;
        } catch (e) { occupant = null; }
        let inWorld = -1;
        try { inWorld = ((typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : []).indexOf(o); } catch (e) {}
        pre = { origin: snapMonster(Game, uidFn, o), occupant, occupantSameAsOrigin: (occupantObj === o),
          originInWorldBefore: inWorld, result: (resultArg != null ? String(resultArg) : null) };
      }
    } catch (e) { noteErr(store, 'tbEnd.pre', e); }
    let ret = null;
    try { ret = orig.apply(this, arguments); }
    catch (e) {
      try {
        if (pre) pushCapped(store, { type: 'tbend', seq: st.nextSeq++, day: dayOf(Game),
          threw: true, origin: pre.origin, occupantBefore: pre.occupant,
          originInWorldBefore: pre.originInWorldBefore, result: pre.result });
      } catch (e2) { noteErr(store, 'tbEnd.throwRec', e2); }
      throw e;
    }
    try {
      if (pre) {
        let inWorldAfter = -1, occupantAfter = null;
        // NOTE: origin object identity is not serialized, so re-derive
        // in-world status from the post-call world list by uid: the
        // origin uid is unique per object in this seed's run.
        try {
          const wms = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
          const found = wms.filter(m => uidFn(m) === pre.origin.uid);
          inWorldAfter = found.length ? wms.indexOf(found[0]) : -1;
          if (inWorldAfter >= 0) occupantAfter = null; // restored origin itself occupies the tile
          else {
            let occ = null;
            try { occ = (typeof Game.monsterAt === 'function') ? Game.monsterAt(pre.origin.tx, pre.origin.ty) : null; } catch (e) {}
            occupantAfter = occ ? snapMonster(Game, uidFn, occ) : null;
          }
        } catch (e) { noteErr(store, 'tbEnd.postList', e); }
        pushCapped(store, { type: 'tbend', seq: st.nextSeq++, day: dayOf(Game),
          threw: false, origin: pre.origin, occupantBefore: pre.occupant,
          occupantSameAsOriginBefore: pre.occupantSameAsOrigin,
          originInWorldBefore: pre.originInWorldBefore, result: pre.result,
          restored: inWorldAfter >= 0, originInWorldAfter: inWorldAfter,
          occupantAfter });
      }
    } catch (e) { noteErr(store, 'tbEnd.post', e); }
    return ret;
  });

  try {
    Game._draftflagDiagStore = store;
    Game._draftflagDiagInstalled = true;
    Game._draftflagDiagUninstall = () => { try { for (const u of uninstalls) u(); } catch (e) {} try { Game._draftflagDiagInstalled = false; } catch (e) {} };
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return Game._draftflagDiagUninstall || function () {};
}

module.exports = { layerOn, newStore, installDraftflagDiag, MAX_EVENTS };
