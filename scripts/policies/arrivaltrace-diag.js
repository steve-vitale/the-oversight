// arrivaltrace-diag — trace ONE 1-HP world-entity arrival to its source
// (sim-arrivaltrace-a, 2026-10-24, flesh-out loop, axis scale-onramp).
//
// QUESTION (not a claim): sim-fieldfinish-a proved wounded wave-3+
// entities arrive at exactly 1 HP with no recorded field fight and no
// tb fight in between (73675 chorus_line 43 d91 -> 1 d93; 73678 spool
// 28 d73 -> 1 d82). Something outside the field/tb streams puts a
// wounded entity at exactly 1 HP.
//
// CANDIDATES, VERIFIED IN CODE BEFORE INSTRUMENTING (see the evidence
// pre-registration for line-level citations):
//   (a) tb door-flee stash floor: reengageWaitingMonsters() sets
//       mf.hp = Math.max(1, min(maxHp, w.hp)) — creates 1 only from a
//       stashed hp <= 1; otherwise preserves. Instrumented to confirm.
//   (b) trap / wanderer respawn: spawnWorldMonster() defaults to FULL
//       hp; fled-monster recovery respawns with hp: fled.hp verbatim.
//       Neither writes 1 unless the source hp already was 1.
//   (c) second entity of the same type: worldMonsters() is a flat
//       list and prior linkage was by TYPE, so interleaving entities
//       could fake an arrival. Only a daily census excludes this.
//   (d) palisade raid toll (found in code audit, pre-registered):
//       havenRaidTick() with havenTier() >= 2 sets every drafted
//       raider to Math.max(1, hp - round(maxHp*0.25)). chorus_line
//       (maxHp 300, wall 75): 43-75 -> 1. spool (maxHp 280, wall 70):
//       28-70 -> 1, and 167-70 = 97. A raid drafting the focus entity
//       between fights predicts the arrival exactly.
//
// OBSERVATIONAL ONLY. ARRIVATRACE=1 is the only on-switch. Unset
// delegates byte-identically: no wraps installed, no ctx surface, no
// daily record. Wraps record AFTER delegating (fieldFight,
// havenRaidTick, spawnWorldMonster, reengageWaitingMonsters) or
// capture pre-state BEFORE delegating and read post-state from the
// live world list (tbEnd worldOrigin restore — the restored entity
// is pushed back into worldMonsters(), so a post-call scan finds it;
// the fight object itself is never read post-call). Start hp comes
// from the entity argument BEFORE delegating; field end hp/rounds
// come from the RETURNED record. The wraps write nothing to game
// state, draw no RNG, never throw into the engine (recording errors
// are counted), and return the original's value untouched.
// havenTier() is a pure read of village.havenTier. Daily census is a
// pure read of worldMonsters() entries (copied field by field).
//
// COMPOSE UPON (never edit): tableseat-nowait (which wraps
// leanlinkrescue). POLICY-SIDE ONLY — zero src/js changes, no
// default flips, no combat-code changes (DIAG ONLY).
//
// KNOWN LIMITS (stated, not hidden):
// - World entities carry no stable instance id: linkage is by type +
//   hp arithmetic + census continuity (one live entity of the type
//   across the arrival window). A census showing two live entities of
//   the focus type in the window weakens a chain to "a" entity, and
//   the evidence says so.
// - havenRaidTick's drafted raiders are identified by pre-call list
//   position (id + tx/ty + hp): the raid moves raiders to the haven
//   tile, so post-call matching is by list index + id, never by tile.
// - tbEnd's worldOrigin restore for non-lingerer titans sets full hp;
//   only the lingerer branch can write a floored value, and only when
//   no standing fighter exists. The wrap records both branches.
'use strict';

const MAX_EVENTS = 40000;

function layerOn() { return process.env.ARRIVATRACE === '1'; }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }

function newStore() {
  return {
    census: [], fieldFights: [], raids: [], spawns: [],
    reengages: [], tbRestores: [],
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

function snapWorld(Game) {
  const out = [];
  try {
    const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
    for (let i = 0; i < list.length; i++) {
      const m = list[i];
      if (!m) continue;
      out.push({ idx: i, id: m.id || null, hp: roundHp(m.hp), maxHp: roundHp(m.maxHp), tx: m.tx, ty: m.ty, lingering: !!m.lingering, veteran: !!m.veteran });
    }
  } catch (e) { /* snapshot best-effort; caller counts errors separately */ }
  return out;
}

function installArrivaltraceDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._arrivaltraceDiagStore === store && Game._arrivaltraceDiagInstalled) return Game._arrivaltraceDiagUninstall || function () {};
  const uninstalls = [];
  const wrap = (name, fn) => {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = Game[name];
      Game[name] = fn(orig);
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  };
  // fieldFight: start hp BEFORE delegating, end hp/rounds from RETURNED rec.
  wrap('fieldFight', (orig) => function (vid, mdef, m, opts) {
    let startHp = null, startMax = null;
    try {
      if (m && m.hp != null) startHp = roundHp(m.hp);
      if (m && m.maxHp != null) startMax = roundHp(m.maxHp);
      if (startMax == null && mdef && mdef.hp && mdef.hp.length === 2) startMax = roundHp(mdef.hp[1]);
    } catch (e) { noteErr(store, 'fieldFight.start', e); }
    const rec = orig.apply(this, arguments);
    try {
      const md = mdef || {};
      pushCapped(store, 'fieldFights', {
        day: dayOf(Game), vid: vid != null ? String(vid) : null,
        mid: md.id || null, wave: (md.wave | 0) || 1,
        startHp: startHp, startMax: startMax,
        endHp: rec ? roundHp(rec.mHpLeft) : null,
        outcome: rec ? (rec.outcome || null) : null,
        rounds: rec ? (rec.rounds | 0) : null,
        mDealt: rec ? (rec.mDealt | 0) : null,
      });
    } catch (e) { noteErr(store, 'fieldFight.rec', e); }
    return rec;
  });
  // havenRaidTick: pre snapshot BEFORE delegating (list index + id),
  // post snapshot AFTER; diff per index. Tier is a pure read.
  wrap('havenRaidTick', (orig) => function () {
    let pre = null, tier = null;
    try { pre = snapWorld(Game); } catch (e) { noteErr(store, 'raid.pre', e); }
    try { tier = (typeof Game.havenTier === 'function') ? Game.havenTier() : null; } catch (e) { tier = null; }
    const r = orig.apply(this, arguments);
    try {
      const post = snapWorld(Game);
      const diffs = [];
      const n = Math.max(pre ? pre.length : 0, post.length);
      for (let i = 0; i < n; i++) {
        const a = pre ? pre[i] : null, b = post[i];
        if (!a && !b) continue;
        if (a && b && a.id === b.id && a.hp !== b.hp) {
          diffs.push({ idx: i, id: b.id, preHp: a.hp, postHp: b.hp, maxHp: b.maxHp, wall: b.maxHp != null ? Math.round(b.maxHp * 0.25) : null, preTx: a.tx, preTy: a.ty, postTx: b.tx, postTy: b.ty });
        } else if (!a && b) {
          diffs.push({ idx: i, id: b.id, preHp: null, postHp: b.hp, maxHp: b.maxHp, wall: null, spawnedDuringRaid: true });
        }
      }
      // A raid row is recorded only when something actually changed:
      // havenRaidTick returns false on cooldown/roll/minimum misses,
      // and a no-change call is not a raid. diffs.length > 0 is the
      // firing test (raiders always move to the haven tile, so a real
      // raid always changes tx/ty even without a palisade toll — the
      // tx/ty move is captured via postTx/postTy on hp diffs, and
      // moved-but-unwounded raiders are visible in the daily census).
      if (diffs.length) pushCapped(store, 'raids', { day: dayOf(Game), tier: tier, returned: r === undefined ? null : !!r, diffs: diffs });
    } catch (e) { noteErr(store, 'raid.rec', e); }
    return r;
  });
  // spawnWorldMonster: record the spawn as the engine made it.
  wrap('spawnWorldMonster', (orig) => function (mdef, tx, ty, opts) {
    let optsHp = null, optsHpPresent = false;
    try { optsHpPresent = !!(opts && opts.hp !== undefined); optsHp = optsHpPresent ? roundHp(opts.hp) : null; } catch (e) { noteErr(store, 'spawn.opts', e); }
    const mon = orig.apply(this, arguments);
    try {
      pushCapped(store, 'spawns', {
        day: dayOf(Game), id: mon ? (mon.id || null) : null,
        hp: mon ? roundHp(mon.hp) : null, maxHp: mon ? roundHp(mon.maxHp) : null,
        tx: mon ? mon.tx : null, ty: mon ? mon.ty : null,
        optsHpPresent: optsHpPresent, optsHp: optsHp,
        mdefId: (typeof mdef === 'string') ? mdef : (mdef && mdef.id) || null,
      });
    } catch (e) { noteErr(store, 'spawn.rec', e); }
    return mon;
  });
  // reengageWaitingMonsters: stash BEFORE, fighter hp AFTER (tbfight
  // is live after startCombat inside the original; reading fighter hp
  // post-call is a read of the live fight, not a resurrection — the
  // original already started it).
  wrap('reengageWaitingMonsters', (orig) => function (waiting) {
    let stash = null;
    try {
      stash = (waiting || []).map(w => (w ? { id: w.id || null, hp: roundHp(w.hp), bearer: w.bearer != null ? String(w.bearer) : null } : null));
    } catch (e) { noteErr(store, 'reengage.pre', e); }
    const r = orig.apply(this, arguments);
    try {
      let fighters = null;
      try {
        const f = Game.tbfight;
        fighters = f ? (f.fighters || []).filter(x => x && (x.kind === 'monster' || x.kind === 'hostile')).map(x => ({ monsterId: x.monsterId || (x.mdef && x.mdef.id) || null, hp: roundHp(x.hp), maxHp: roundHp(x.maxHp) })) : null;
      } catch (e) { fighters = null; }
      pushCapped(store, 'reengages', { day: dayOf(Game), stash: stash, fighters: fighters });
    } catch (e) { noteErr(store, 'reengage.rec', e); }
    return r;
  });
  // tbEnd: worldOrigin + standing fighter hp BEFORE delegating; the
  // restored entity is found in the live world list AFTER delegating.
  wrap('tbEnd', (orig) => function (result) {
    let pre = null;
    try {
      const f = Game.tbfight;
      if (f && !f.over && f.worldOrigin) {
        const o = f.worldOrigin;
        const standing = (f.fighters || []).filter(x => x && x.kind === 'monster' && x.alive && (x.hp || 0) > 0).map(x => ({ monsterId: x.monsterId || (x.mdef && x.mdef.id) || null, hp: roundHp(x.hp) }));
        pre = { originId: o.id || null, originHp: roundHp(o.hp), originMaxHp: roundHp(o.maxHp), originTx: o.tx, originTy: o.ty, lingering: !!o.lingering, standing: standing };
      }
    } catch (e) { noteErr(store, 'tbEnd.pre', e); pre = null; }
    const r = orig.apply(this, arguments);
    try {
      if (pre) {
        const post = snapWorld(Game).filter(m => m.id === pre.originId);
        pushCapped(store, 'tbRestores', { day: dayOf(Game), result: result || null, pre: pre, postWorldSameId: post });
      }
    } catch (e) { noteErr(store, 'tbEnd.rec', e); }
    return r;
  });
  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._arrivaltraceDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._arrivaltraceDiagStore = store;
    Game._arrivaltraceDiagInstalled = true;
    Game._arrivaltraceDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function ensureAT(ctx, store) {
  let D = ctx._arrivaltrace;
  if (!D) D = ctx._arrivaltrace = { store: store };
  return D;
}

function censusDay(Game, store) {
  try {
    const list = snapWorld(Game);
    pushCapped(store, 'census', { day: dayOf(Game), world: list });
  } catch (e) { noteErr(store, 'census', e); }
}

function withArrivaltraceDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installArrivaltraceDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ensureAT(ctx, st); } catch (e) { noteErr(st, 'daily.ctx', e); }
        try { censusDay(Game, st); } catch (e) { noteErr(st, 'daily.census', e); }
      }
      return r;
    },
  });
}

module.exports = { layerOn, newStore, installArrivaltraceDiag, withArrivaltraceDiag, censusDay, snapWorld, MAX_EVENTS };
