#!/usr/bin/env node
// w5faced-competent-instrument-20261103.js — stage-decomposition instrument
// for the competent-policy wave-5-fought population diagnostic (run
// fleshout-20261103T0940Z, arm sim-w5faced-a, 0815Z blank 3). Adaptation of
// scripts/wave5encounter-instrument-20261103.js (0316Z) with three
// corrections required by the 0316Z closeout and the 0815Z metric review:
//
//   (1) Spawn rows carry campaignOnly from the monster def, so the
//       analyzer can split fight-candidate spawns from campaignOnly
//       spawns (finale_crew / finale_opening) instead of inflating the
//       spawn stage as the 0316Z analyzer did.
//   (2) Fight identity is captured at fight START and tbEnd identity is
//       captured BEFORE the original call runs. The 0815Z failure was a
//       wrap that read Game.tbfight.id AFTER the wrapped call returned,
//       when node combat had already nulled tbfight — such a wrap can
//       never fire. This instrument never reads fight identity after a
//       call returns: startRows are written before orig.startCombat,
//       tbEndRows are written before orig.tbEnd (pre-call fighter
//       snapshot: monster fighter ids, alive, hp). A post-return read
//       appears nowhere in this file.
//   (3) Every wrapper increments t.wrapCounts, so any zero cited from a
//       stage is reported with its wrapper's fire count: a zero w5 count
//       with a zero wrapper count is a broken instrument, not a finding.
//
// install(Game) wraps, read-only, call-through: zero RNG draws of its own,
// zero game-state writes (all counts live in the returned `t` object,
// never on Game.state). Every wrapper calls the original and returns its
// value untouched. uninstall() restores the originals.
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

function defOf(Game, mid) {
  try {
    const defs = (Game.data && Game.data.monsters) || [];
    return defs.find(function (m) { return m && m.id === mid; }) || null;
  } catch (e) { return null; }
}

function waveOf(Game, mid, fallback) {
  const d = defOf(Game, mid);
  if (d) return d.wave || 1;
  return fallback || 1;
}

function campaignOnlyOf(Game, mid) {
  const d = defOf(Game, mid);
  return !!(d && d.campaignOnly);
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
    wrapCounts: { target: 0, cast: 0, spawn: 0, trigger: 0, start: 0, tbEnd: 0, field: 0, remove: 0 },
  };
  const live = new Map();
  let spawnSeq = 0, startSeq = 0;
  let fightStartDepth = 0;
  const openFights = []; // startSeq values pushed at fight start, popped at tbEnd
  const orig = {};
  const errs = t.instrumentErrors;
  function wrap(name, fn) {
    if (typeof Game[name] !== 'function') { errs.push(name + ': not a function, skipped'); return; }
    orig[name] = Game[name];
    Game[name] = fn;
  }

  wrap('spawnWaveTarget', function (pool) {
    t.wrapCounts.target++;
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
    t.wrapCounts.cast++;
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
    t.wrapCounts.spawn++;
    const mon = orig.spawnWorldMonster.apply(this, arguments);
    try {
      const pt = playerTile(Game), ht = homeTile(Game);
      const seq = spawnSeq++;
      const mid = mon ? mon.id : (typeof mdef === 'string' ? mdef : (mdef && mdef.id));
      if (mon && typeof mon === 'object') live.set(mon, { spawnSeq: seq, day: dayOf(Game) });
      t.spawnRows.push({
        day: dayOf(Game), spawnSeq: seq, id: mid,
        wave: mon ? (mon.wave || waveOf(Game, mid)) : waveOf(Game, mid),
        campaignOnly: campaignOnlyOf(Game, mid),
        tx: tx, ty: ty, distPlayer: manhattan({ x: tx, y: ty }, pt),
        distHome: manhattan({ x: tx, y: ty }, ht),
        caller: callerFromStack(),
      });
    } catch (e) { errs.push('spawnWorldMonster: ' + String(e.message).slice(0, 80)); }
    return mon;
  });

  wrap('removeWorldMonster', function (m) {
    t.wrapCounts.remove++;
    try {
      const info = (m && live.has(m)) ? live.get(m) : null;
      const pt = playerTile(Game), ht = homeTile(Game);
      t.removeRows.push({
        day: dayOf(Game), spawnSeq: info ? info.spawnSeq : null,
        id: m ? m.id : null, wave: m ? (m.wave || waveOf(Game, m.id)) : null,
        campaignOnly: m ? campaignOnlyOf(Game, m.id) : false,
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
    t.wrapCounts.trigger++;
    try { t.triggerRows.push({ day: dayOf(Game), id: mid, wave: waveOf(Game, mid) }); } catch (e) { errs.push('triggerEncounter: ' + String(e.message).slice(0, 80)); }
    return orig.triggerEncounter.apply(this, arguments);
  });

  wrap('startCombat', function (mid) {
    t.wrapCounts.start++;
    // PRE-CALL capture: everything about this fight's identity is read
    // here, before orig.startCombat runs. Never re-read after return.
    const seq = startSeq++;
    try {
      let worldId = null, pendingId = null, feastId = null;
      try { const s = Game.state.scholar || {}; if (s.monster) worldId = s.monster.id || null; } catch (e) {}
      try { pendingId = Game.pendingMonsterId || null; } catch (e) {}
      try { const s = Game.state.scholar || {}; if (s.feastDraw) feastId = s.feastDraw.monsterId || null; } catch (e) {}
      const effId = mid || pendingId || 'bulldozer';
      t.startRows.push({ day: dayOf(Game), startSeq: seq, id: effId, wave: waveOf(Game, effId), playerTile: playerTile(Game),
        provenance: (Game.pendingEncounter && pendingId) ? ('pending:' + pendingId) : (worldId ? ('world:' + worldId) : 'other'),
        pendingLive: !!Game.pendingEncounter, worldMonsterId: worldId, feastDrawId: feastId });
    } catch (e) { errs.push('startCombat: ' + String(e.message).slice(0, 80)); }
    openFights.push(seq);
    fightStartDepth++;
    try { return orig.startCombat.apply(this, arguments); }
    finally { fightStartDepth--; }
  });

  wrap('tbEnd', function (result) {
    t.wrapCounts.tbEnd++;
    // PRE-CALL capture: the fighter snapshot is read here, before the
    // original runs (the original nulls/overwrites tbfight state). A
    // post-return read of Game.tbfight would see the cleared fight.
    let fightSeq = null;
    try {
      const f = Game.tbfight || {};
      let mid = f.monsterId || f.mid || f.monster || null;
      if (mid && typeof mid === 'object') mid = mid.id || null;
      const fighters = [];
      try {
        for (const x of (f.fighters || [])) {
          if (!x || x.kind !== 'monster') continue;
          const fid = ((x.mdef || {}).id || x.monsterId || x.id) || null;
          fighters.push({ id: fid, alive: !!x.alive, hp: (x.hp != null ? x.hp : null) });
        }
      } catch (e2) {}
      fightSeq = openFights.length ? openFights[openFights.length - 1] : null;
      t.tbEndRows.push({ day: dayOf(Game), result: result, monsterId: mid,
        monsterIdReadable: mid != null, fighters: fighters, fightSeq: fightSeq });
    } catch (e) { errs.push('tbEnd: ' + String(e.message).slice(0, 80)); }
    if (openFights.length) openFights.pop();
    return orig.tbEnd.apply(this, arguments);
  });

  wrap('fieldFight', function (vid, mdef, m, opts) {
    t.wrapCounts.field++;
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
