// w4melt-diag — TB-fight settlement recorder for wave-4 entities
// (sim-w4melt-a, 2026-10-27, flesh-out loop, axis scale-onramp).
//
// QUESTION (not a claim): the w4funnel-repin census found 5 wave-4
// arrivals ending as player-fight-melts, all after lost TB fights.
// What IS a melt, mechanically? This recorder answers it per fight:
// was the melted entity the fight's own monster or a bystander
// lifted by another fight? What was its lingerer/titan state at
// lift? Why did tbEnd not restore it? What HP path did it take?
// And what removal kind + day followed?
//
// MECHANISM, READ FROM CODE (src/js/game.js, never invented):
//   - startCombat lifts the player-tile monster ONLY when it IS
//     one of this fight's monsters (_originIsFighter, by fighter
//     id or mdef id match; journey-scale r42 bystander hold). A
//     bystander stays on its tile and gets no worldOrigin.
//   - tbfight.worldOrigin is set ONLY for a lifted fighter that is
//     a titan or lingering (besieging raider).
//   - tbEnd restores worldOrigin only on result !== 'won'; a
//     lingerer restores ONLY on 'fled'/'lost'; a titan restores on
//     any non-won result if still standing. Restore requires a
//     standing fighter of the origin's id AND the origin tile
//     unoccupied. A restored lingerer comes back wounded (fighter
//     HP, floored at 1); a restored titan comes back full.
//   - Every other lifted monster is never put back: it melts.
//
// READS (pure, never writes to game state):
//   - The pre-fight tile monster is read via monsterAt(map.px,
//     map.py) — a pure scan — NEVER via playerMonster(), which can
//     adopt a debug-set scholar.monster into the world list.
//   - Fight monster fighters are read from tbfight.fighters after
//     startCombat returns (kind 'monster' ids via mdef/monsterId).
//   - tbEnd pre-call reads worldOrigin presence, the monster
//     fighters' alive/hp, and origin-tile occupancy via monsterAt.
//   - tbEnd post-call reads restored presence + HP from the
//     world list. Daily snapshots record wave-4 present entities
//     (the post-fight HP path for restored entities; for melts
//     the series ends at the fight).
//   - The recorder draws no RNG, throws nothing into the engine
//     (recording errors are counted), returns every original
//     value untouched, and NEVER calls villageStandingTotal(),
//     unlockedWave(), or any other gated standing function
//     mid-run (w5births vetkill discipline).
//
// OBSERVATIONAL ONLY. W4MELT=1 is the only on-switch. Unset
// delegates byte-identically: no wraps installed, no ctx
// surface, no record. COMPOSE UPON (never edit):
// tableseat-nowait + raftdraft-diag + spawnsrc-diag +
// oldcore-diag + defwound-diag + w5births-diag. POLICY-SIDE
// ONLY — zero src/js changes (DIAG ONLY).
//
// KNOWN LIMITS (stated, not hidden):
// - A startCombat that throws before returning records its
//   pre-call tile monster but no post-call row (the throw
//   propagates untouched; the fight never started).
// - A tbEnd with no tbfight (already over) records nothing;
//   oldcore's tbEnd wrap has the same guard.
// - Raider history beyond the lift row is NOT asserted from
//   raftdraft rows (that recorder's raiders carry no seq):
//   the lingerer flag + lingerSince at lift IS the raider-state
//   evidence. Any raid-pool join is analysis-side type/hp/tile
//   matching, never seq proof.
// - Daily snapshots run on the policy daily hook; a fight that
//   starts and settles between two daily points still gets its
//   full lift + settlement rows (those are event rows, not
//   daily rows) — the HP path between fights comes from the
//   daily series, the fight itself from the event rows.
'use strict';

const MAX_EVENTS = 80000;

function layerOn() { try { return process.env.W4MELT === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function newStore() {
  return {
    fights: [], settlements: [], dailyW4: [],
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

function roundHp(v) { try { return (v != null && isFinite(v)) ? Math.round(v) : null; } catch (e) { return null; } }

function waveOf(Game, m) {
  try {
    if (m && m.wave != null && isFinite(m.wave)) return m.wave | 0;
    if (typeof Game.crisisWaveOf === 'function') {
      const w = Game.crisisWaveOf(m);
      if (w && isFinite(w)) return w | 0;
    }
  } catch (e) { /* fall through */ }
  return 1;
}

function seqOf(mon) {
  try { return (mon && mon._spawnSeq != null) ? mon._spawnSeq : null; } catch (e) { return null; }
}

function monShape(Game, m) {
  if (!m) return null;
  try {
    return {
      seq: seqOf(m), type: m.id || null, wave: waveOf(Game, m),
      hp: roundHp(m.hp), maxHp: roundHp(m.maxHp),
      titan: !!m.titan, lingering: !!m.lingering,
      lingerSince: (m.lingerSince != null) ? m.lingerSince : null,
      tx: (m.tx != null) ? m.tx : null, ty: (m.ty != null) ? m.ty : null,
    };
  } catch (e) { return null; }
}

function fighterMonsters(tf) {
  try {
    const out = [];
    for (const f of ((tf && tf.fighters) || [])) {
      if (!f || f.kind !== 'monster') continue;
      out.push({
        id: ((f.mdef || {}).id || f.monsterId || f.id || null),
        alive: !!f.alive, hp: roundHp(f.hp),
      });
    }
    return out;
  } catch (e) { return []; }
}

function tileMonster(Game) {
  try {
    const px = (Game.map || {}).px, py = (Game.map || {}).py;
    if (px == null || py == null) return null;
    if (typeof Game.monsterAt !== 'function') return null;
    return Game.monsterAt(px, py);
  } catch (e) { return null; }
}

function inWorld(Game, mon) {
  try { return (typeof Game.worldMonsters === 'function') && Game.worldMonsters().indexOf(mon) >= 0; } catch (e) { return false; }
}

function installW4meltDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._w4meltDiagStore === store && Game._w4meltDiagInstalled) return Game._w4meltDiagUninstall || function () {};
  const uninstalls = [];
  const wrap = (name, fn) => {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = Game[name];
      Game[name] = fn(orig);
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  };

  // startCombat: pre-call tile monster (pure monsterAt scan), then
  // post-call lift + fighter + worldOrigin reads.
  wrap('startCombat', (orig) => function () {
    let pre = null, preMon = null;
    try {
      preMon = tileMonster(Game);
      pre = monShape(Game, preMon);
    } catch (e) { noteErr(store, 'startCombat.pre', e); }
    let r;
    try { r = orig.apply(this, arguments); } catch (e) { throw e; }
    try {
      let tf = null;
      try { tf = this.tbfight || Game.tbfight || null; } catch (e) {}
      const fighters = fighterMonsters(tf);
      const fids = fighters.map(f => f.id);
      const lifted = (preMon != null) ? !inWorld(Game, preMon) : null;
      let origin = null;
      try { origin = tf ? tf.worldOrigin : null; } catch (e) {}
      pushCapped(store, 'fights', {
        day: dayOf(Game),
        tileMon: pre,
        fighterIds: fids,
        fighters: fighters,
        lifted: lifted,
        isFighter: (pre && pre.type) ? fids.indexOf(pre.type) >= 0 : null,
        worldOriginSet: !!origin,
        worldOriginSeq: origin ? seqOf(origin) : null,
        worldOriginType: origin ? (origin.id || null) : null,
      });
    } catch (e) { noteErr(store, 'startCombat.post', e); }
    return r;
  });

  // tbEnd: pre-call settlement inputs, post-call restored state.
  wrap('tbEnd', (orig) => function (result) {
    let pre = null;
    try {
      let tf = null;
      try { tf = this.tbfight || Game.tbfight || null; } catch (e) {}
      let origin = null;
      try { origin = tf ? tf.worldOrigin : null; } catch (e) {}
      const fighters = fighterMonsters(tf);
      let tileOccupied = null, tileOccupant = null;
      if (origin && origin.tx != null && origin.ty != null && typeof Game.monsterAt === 'function') {
        try {
          const occ = Game.monsterAt(origin.tx, origin.ty);
          tileOccupied = !!occ;
          tileOccupant = occ ? (occ.id || null) : null;
        } catch (e) {}
      }
      pre = {
        result: (result != null) ? String(result) : null,
        worldOriginSet: !!origin,
        origin: monShape(Game, origin),
        fighters: fighters,
        tileOccupied: tileOccupied, tileOccupant: tileOccupant,
      };
    } catch (e) { noteErr(store, 'tbEnd.pre', e); }
    const r = orig.apply(this, arguments);
    try {
      let origin = null;
      if (pre && pre.origin) {
        // Re-resolve the origin object: the pre-call shape carries
        // the seq; the live object is found in the world list (for
        // the restored check) — but identity is what tbEnd used, so
        // prefer the tbfight's worldOrigin object when still
        // reachable via the pre-call reference. The pre-call shape
        // cannot hold the reference, so re-find by seq in the world
        // list; restored=false when absent either way.
        try {
          const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
          origin = list.filter(m => seqOf(m) === pre.origin.seq && pre.origin.seq !== null)[0] || null;
          if (!origin && pre.origin.seq === null) origin = null;
        } catch (e) {}
      }
      const restored = (pre && pre.origin && pre.origin.seq !== null) ? !!origin : null;
      pushCapped(store, 'settlements', {
        day: dayOf(Game),
        result: (pre && pre.result) || ((result != null) ? String(result) : null),
        worldOriginSet: pre ? pre.worldOriginSet : null,
        origin: pre ? pre.origin : null,
        fighters: pre ? pre.fighters : [],
        tileOccupied: pre ? pre.tileOccupied : null,
        tileOccupant: pre ? pre.tileOccupant : null,
        restored: restored,
        hpAfter: origin ? roundHp(origin.hp) : null,
      });
    } catch (e) { noteErr(store, 'tbEnd.post', e); }
    return r;
  });

  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._w4meltDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._w4meltDiagStore = store;
    Game._w4meltDiagInstalled = true;
    Game._w4meltDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function snapshotW4melt(Game, store) {
  try {
    const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
    const w4 = [];
    for (const m of list) {
      let w = 1;
      try { w = waveOf(Game, m); } catch (e) {}
      if (w !== 4) continue;
      w4.push(monShape(Game, m));
    }
    pushCapped(store, 'dailyW4', { day: dayOf(Game), present: w4 });
  } catch (e) { noteErr(store, 'snapshot', e); }
}

function withW4meltDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installW4meltDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._w4melt = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
        try { snapshotW4melt(Game, st); } catch (e) { noteErr(st, 'daily.snapshot', e); }
      }
      return r;
    },
  });
}

module.exports = { layerOn, newStore, installW4meltDiag, withW4meltDiag, snapshotW4melt, MAX_EVENTS };
