#!/usr/bin/env node
// wave4encounter-instrument-20261103.js — stage-decomposition instrument
// for the wave-5 faced-wall diagnostic (run
// fleshout-20261103T0203Z, axis scale-onramp). Wave-5 generalization
// of the 1915Z wave-4 instrument: identical row capture, snapshots
// extended with wave-5 pool/world/faced/readiness plus the wave-4
// gate fields (wave-4 faced at wave-5 unlock). Measurement only.
//
// install(Game) wraps, read-only, call-through: zero RNG draws of its
// own, zero game-state writes (all counts live in the returned `t`
// object, never on Game.state). Every wrapper calls the original and
// returns its value untouched. uninstall() restores the originals.
//
// Stages recorded (see scripts/wave4encounter-diag-prereg-20261103.md):
//   targetRows  — spawnWaveTarget() calls (target wave, pool top wave)
//   castRows    — castMonster() returns (id, wave)
//   spawnRows   — spawnWorldMonster() placements (id, wave, tile,
//                 distance to player tile / home tile, caller)
//   triggerRows — triggerEncounter() calls (id, wave)
//   startRows   — startCombat() player-TB starts (id, wave, provenance:
//                 pending:<id> vs world:<id> vs other, read BEFORE the
//                 call — startCombat instantiates by id, so a start at
//                 the home tile is usually a faced pending, not a
//                 world-tile fight)
//   tbEndRows   — tbEnd() results (result, monster id if readable)
//   fieldRows   — fieldFight() villager fights (vid, id, wave, outcome)
//   removeRows  — removeWorldMonster() removals (id, wave, hp, caller,
//                 fight-start vs other)
//   says        — full Game.say capture (to /tmp via the driver, never
//                 committed), for the sense read
//   daily       — one snapshot per sim day (driver calls snapshot())
// Caller attribution comes from the call stack's first known game
// function name; anything else reads 'other'. It is attribution, not
// proof of a code path — the analyzer reports it as such.
'use strict';

const KNOWN_CALLERS = [
  'maintainWorldMonsters', 'checkEncounter', 'moveWanderer',
  'triggerEncounter', 'startCombat', 'fieldFight',
  'resolveWildMonsterEncounter', 'villagerMonsterTick', 'monsterTurn',
  'wanderWorldMonsters', 'worldTick', 'tbEnd', 'tbBeginTurn',
  'checkSystemArrival', 'wandererFindsYou', 'wandererTentBreach',
];

function callerFromStack() {
  try {
    const stack = new Error().stack || '';
    const lines = stack.split('\n').slice(2);
    for (const ln of lines) {
      for (const name of KNOWN_CALLERS) {
        if (ln.indexOf(name) !== -1) return name;
      }
    }
    return 'other';
  } catch (e) { return 'unknown'; }
}

function dayOf(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

function waveOf(Game, mid, fallback) {
  try {
    const defs = (Game.data && Game.data.monsters) || [];
    const d = defs.find(function (m) { return m && m.id === mid; });
    if (d) return d.wave || 1;
  } catch (e) {}
  return fallback || 1;
}

function playerTile(Game) {
  try { return { x: Game.map.px, y: Game.map.py }; } catch (e) { return { x: null, y: null }; }
}

function homeTile(Game) {
  try {
    const v = Game.state.village || {};
    if (v.px != null && v.py != null) return { x: v.px, y: v.py };
  } catch (e) {}
  return { x: 4, y: 4 };
}

function manhattan(a, b) {
  if (a.x == null || b.x == null) return null;
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function install(Game) {
  const t = {
    targetRows: [], castRows: [], spawnRows: [], triggerRows: [],
    startRows: [], tbEndRows: [], fieldRows: [], removeRows: [],
    says: [], daily: [], instrumentErrors: [],
  };
  const live = new Map(); // world-monster object -> { spawnSeq, day }
  let spawnSeq = 0;
  let fightStartDepth = 0;
  const orig = {};
  const errs = t.instrumentErrors;
  function wrap(name, fn) {
    if (typeof Game[name] !== 'function') { errs.push(name + ': not a function, skipped'); return; }
    orig[name] = Game[name];
    Game[name] = fn;
  }

  wrap('spawnWaveTarget', function (pool) {
    const r = orig.spawnWaveTarget.apply(this, arguments);
    try {
      let top = 1;
      for (const m of (pool || [])) top = Math.max(top, m.wave || 1);
      let unlocked = null;
      try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) {}
      t.targetRows.push({ day: dayOf(Game), target: r, poolTop: top, unlocked: unlocked });
    } catch (e) { errs.push('spawnWaveTarget: ' + String(e.message).slice(0, 80)); }
    return r;
  });

  wrap('castMonster', function () {
    const r = orig.castMonster.apply(this, arguments);
    try {
      const id = (r && r.id) || r || null;
      let unlocked = null;
      try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) {}
      t.castRows.push({ day: dayOf(Game), id: id, wave: waveOf(Game, id), veteran: !!(r && r.veteran), unlocked: unlocked, caller: callerFromStack() });
    } catch (e) { errs.push('castMonster: ' + String(e.message).slice(0, 80)); }
    return r;
  });

  wrap('spawnWorldMonster', function (mdef, tx, ty, opts) {
    const mon = orig.spawnWorldMonster.apply(this, arguments);
    try {
      const pt = playerTile(Game), ht = homeTile(Game);
      const seq = spawnSeq++;
      if (mon && typeof mon === 'object') live.set(mon, { spawnSeq: seq, day: dayOf(Game) });
      t.spawnRows.push({
        day: dayOf(Game), spawnSeq: seq, id: mon ? mon.id : (typeof mdef === 'string' ? mdef : (mdef && mdef.id)),
        wave: mon ? (mon.wave || waveOf(Game, mon.id)) : waveOf(Game, typeof mdef === 'string' ? mdef : (mdef && mdef.id)),
        tx: tx, ty: ty, distPlayer: manhattan({ x: tx, y: ty }, pt),
        distHome: manhattan({ x: tx, y: ty }, ht),
        caller: callerFromStack(),
      });
    } catch (e) { errs.push('spawnWorldMonster: ' + String(e.message).slice(0, 80)); }
    return mon;
  });

  wrap('removeWorldMonster', function (m) {
    try {
      const info = (m && live.has(m)) ? live.get(m) : null;
      const pt = playerTile(Game), ht = homeTile(Game);
      t.removeRows.push({
        day: dayOf(Game), spawnSeq: info ? info.spawnSeq : null,
        id: m ? m.id : null, wave: m ? (m.wave || waveOf(Game, m.id)) : null,
        tx: m ? m.tx : null, ty: m ? m.ty : null, hp: m ? m.hp : null,
        distPlayer: m ? manhattan({ x: m.tx, y: m.ty }, pt) : null,
        distHome: m ? manhattan({ x: m.tx, y: m.ty }, ht) : null,
        ageDays: info ? (dayOf(Game) - info.day) : null,
        cls: fightStartDepth > 0 ? 'fight-start' : 'other',
        caller: fightStartDepth > 0 ? 'startCombat' : callerFromStack(),
        inTbFight: !!(Game.tbfight && !Game.tbfight.over),
      });
      if (m && live.has(m)) live.delete(m);
    } catch (e) { errs.push('removeWorldMonster: ' + String(e.message).slice(0, 80)); }
    return orig.removeWorldMonster.apply(this, arguments);
  });

  wrap('triggerEncounter', function (mid) {
    try { t.triggerRows.push({ day: dayOf(Game), id: mid, wave: waveOf(Game, mid) }); } catch (e) { errs.push('triggerEncounter: ' + String(e.message).slice(0, 80)); }
    return orig.triggerEncounter.apply(this, arguments);
  });

  wrap('startCombat', function (mid) {
    try {
      let worldId = null, pendingId = null, feastId = null;
      try { const s = Game.state.scholar || {}; if (s.monster) worldId = s.monster.id || null; } catch (e) {}
      try { pendingId = Game.pendingMonsterId || null; } catch (e) {}
      try { const s = Game.state.scholar || {}; if (s.feastDraw) feastId = s.feastDraw.monsterId || null; } catch (e) {}
      const effId = mid || pendingId || 'bulldozer';
      t.startRows.push({ day: dayOf(Game), id: effId, wave: waveOf(Game, effId), playerTile: playerTile(Game),
        provenance: (Game.pendingEncounter && pendingId) ? ('pending:' + pendingId) : (worldId ? ('world:' + worldId) : 'other'),
        pendingLive: !!Game.pendingEncounter, worldMonsterId: worldId, feastDrawId: feastId });
    } catch (e) { errs.push('startCombat: ' + String(e.message).slice(0, 80)); }
    fightStartDepth++;
    try { return orig.startCombat.apply(this, arguments); }
    finally { fightStartDepth--; }
  });

  wrap('tbEnd', function (result) {
    try {
      let mid = null;
      try {
        const f = Game.tbfight || {};
        mid = f.monsterId || f.mid || f.monster || null;
        if (mid && typeof mid === 'object') mid = mid.id || null;
      } catch (e) {}
      t.tbEndRows.push({ day: dayOf(Game), result: result, monsterId: mid });
    } catch (e) { errs.push('tbEnd: ' + String(e.message).slice(0, 80)); }
    return orig.tbEnd.apply(this, arguments);
  });

  wrap('fieldFight', function (vid, mdef, m, opts) {
    const rec = orig.fieldFight.apply(this, arguments);
    try {
      const mid = (m && m.id) || (mdef && mdef.id) || null;
      t.fieldRows.push({
        day: dayOf(Game), vid: vid, id: mid, wave: m ? (m.wave || waveOf(Game, mid)) : waveOf(Game, mid),
        outcome: rec ? rec.outcome : null,
        tx: m ? m.tx : null, ty: m ? m.ty : null,
        caller: callerFromStack(),
      });
    } catch (e) { errs.push('fieldFight: ' + String(e.message).slice(0, 80)); }
    return rec;
  });

  // Game.say is silenced by the harness (no-op) unless narration is on;
  // the driver wraps it after install, so capture here only if it is a
  // real function that is not the harness no-op. The driver owns the
  // say capture; this hook records nothing on its own.
  function snapshot() {
    const snap = { day: dayOf(Game) };
    try { snap.unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { snap.unlocked = null; }
    try { snap.standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) { snap.standing = null; }
    try { snap.readiness4 = Game.waveCombatReadiness ? Game.waveCombatReadiness(4) : null; } catch (e) { snap.readiness4 = null; }
    try { snap.readiness5 = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null; } catch (e) { snap.readiness5 = null; }
    try {
      const pool = Game.monsterWavePool ? Game.monsterWavePool() : [];
      snap.poolByWave = {};
      for (const m of pool) { const w = m.wave || 1; snap.poolByWave[w] = (snap.poolByWave[w] || 0) + 1; }
      snap.poolW4 = (pool || []).filter(function (m) { return (m.wave || 1) === 4; }).map(function (m) { return m.id; });
      snap.poolW5 = (pool || []).filter(function (m) { return (m.wave || 1) === 5; }).map(function (m) { return m.id; });
    } catch (e) { snap.poolByWave = null; snap.poolW4 = null; snap.poolW5 = null; }
    try {
      const wms = Game.worldMonsters ? Game.worldMonsters() : [];
      const pt = playerTile(Game), ht = homeTile(Game);
      snap.worldByWave = {};
      for (const m of wms) { const w = m.wave || waveOf(Game, m.id); snap.worldByWave[w] = (snap.worldByWave[w] || 0) + 1; }
      snap.worldW4 = wms.filter(function (m) { return (m.wave || waveOf(Game, m.id)) === 4; }).map(function (m) {
        const info = live.get(m) || {};
        return { id: m.id, tx: m.tx, ty: m.ty, hp: m.hp, distPlayer: manhattan({ x: m.tx, y: m.ty }, pt), distHome: manhattan({ x: m.tx, y: m.ty }, ht), spawnDay: info.day != null ? info.day : null, spawnSeq: info.spawnSeq != null ? info.spawnSeq : null };
      });
      snap.worldW5 = wms.filter(function (m) { return (m.wave || waveOf(Game, m.id)) === 5; }).map(function (m) {
        const info = live.get(m) || {};
        return { id: m.id, tx: m.tx, ty: m.ty, hp: m.hp, distPlayer: manhattan({ x: m.tx, y: m.ty }, pt), distHome: manhattan({ x: m.tx, y: m.ty }, ht), spawnDay: info.day != null ? info.day : null, spawnSeq: info.spawnSeq != null ? info.spawnSeq : null };
      });
    } catch (e) { snap.worldByWave = null; snap.worldW4 = null; snap.worldW5 = null; }
    try {
      const w = Game.wanderer || null;
      const pt = playerTile(Game);
      snap.wanderer = w ? { id: w.monsterId, wave: waveOf(Game, w.monsterId), x: w.x, y: w.y, distPlayer: manhattan({ x: w.x, y: w.y }, pt) } : null;
    } catch (e) { snap.wanderer = null; }
    try {
      snap.pending = Game.pendingEncounter
        ? { id: Game.pendingMonsterId || null, wave: waveOf(Game, Game.pendingMonsterId) }
        : null;
    } catch (e) { snap.pending = null; }
    try {
      const ds = Game.deedState ? Game.deedState() : null;
      const faced = (ds && ds.wavesFaced) || {};
      snap.facedByWave = {};
      snap.facedW4 = [];
      snap.facedW5 = [];
      for (const mid of Object.keys(faced)) {
        const w = faced[mid] | 0;
        snap.facedByWave[w] = (snap.facedByWave[w] || 0) + 1;
        if (w === 4) snap.facedW4.push(mid);
        if (w === 5) snap.facedW5.push(mid);
      }
    } catch (e) { snap.facedByWave = null; snap.facedW4 = null; snap.facedW5 = null; }
    try { snap.playerTile = playerTile(Game); snap.homeTile = homeTile(Game); } catch (e) {}
    t.daily.push(snap);
    return snap;
  }

  function uninstall() {
    for (const name of Object.keys(orig)) Game[name] = orig[name];
  }

  return { t: t, uninstall: uninstall, snapshot: snapshot, liveCount: function () { return live.size; } };
}

module.exports = { install: install };
