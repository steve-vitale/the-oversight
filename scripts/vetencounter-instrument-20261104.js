// vetencounter-instrument-20261104.js — veterans-encounter diag instrument
// (arm sim-vetencounter-b, run fleshout-loop-b-20261104T2125Z). Scripts only,
// zero src/js. Pure-read wrappers + daily snapshots; zero game-state
// writes, zero RNG draws. Instance identity by object reference in a
// per-seed Map — no fields are written onto game objects. Wrappers never
// throw into game code: a recording failure is counted in
// instrumentErrors and the original call's result is returned untouched.
// Usage: const INST = require('./vetencounter-instrument-20261104');
//   const inst = INST.install(Game); inst.snapshot(); ... inst.finalize(); inst.uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// First non-instrument stack frame's function token, e.g. "checkEncounter".
function stackFn() {
  try {
    const lines = (new Error().stack || '').split('\n').slice(1);
    for (const ln of lines) {
      if (ln.indexOf('vetencounter-instrument') >= 0) continue;
      const m = ln.match(/at (?:async )?([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)?)/);
      if (m) return m[1];
    }
    return null;
  } catch (e) { return null; }
}
function stackHas(needle) {
  try {
    const st = new Error().stack || '';
    const lines = st.split('\n').slice(1).filter(function (ln) { return ln.indexOf('vetencounter-instrument') < 0; });
    return lines.some(function (ln) { return ln.indexOf(needle) >= 0; });
  } catch (e) { return false; }
}

function install(Game) {
  const t = { spawns: [], removals: [], casts: [], fights: [], daily: [], instrumentErrors: [] };
  const waveById = {};
  try {
    const mons = ((Game.data || {}).monsters) || [];
    mons.forEach(function (m) { if (m && m.id) waveById[m.id] = (m.wave | 0) || 1; });
  } catch (e) { t.instrumentErrors.push('monster-map: ' + String(e.message).slice(0, 80)); }

  function waveOf(mid, mdef) {
    if (mdef && (mdef.wave | 0)) return (mdef.wave | 0);
    if (mid && waveById[mid]) return waveById[mid];
    return null;
  }

  // Instance tracking by object reference.
  const instances = new Map();
  let seqCounter = 0;
  let npcsOnNodeMissing = false;
  try {
    if (typeof Game.npcsOnNode !== 'function') { npcsOnNodeMissing = true; t.instrumentErrors.push('npcsOnNode-missing'); }
  } catch (e) { npcsOnNodeMissing = true; t.instrumentErrors.push('npcsOnNode-check: ' + String(e.message).slice(0, 80)); }
  let npcErrCount = 0;

  function playerTile() {
    try { return { px: Game.map.px, py: Game.map.py }; } catch (e) { return { px: null, py: null }; }
  }

  const origSpawn = Game.spawnWorldMonster;
  const origRemove = Game.removeWorldMonster;
  const origCast = Game.castMonster;
  const origStart = Game.startCombat;
  const origField = Game.fieldFight;

  if (typeof origSpawn === 'function') {
    Game.spawnWorldMonster = function (mdef, tx, ty, opts) {
      let mon = null;
      try { mon = origSpawn.apply(this, arguments); } catch (e) { throw e; }
      try {
        const pt = playerTile();
        const fn = stackFn();
        let source = 'other';
        if (fn && fn.indexOf('maintainWorldMonsters') >= 0) source = 'background';
        else if (fn && fn.indexOf('checkEncounter') >= 0) source = 'checkEncounter';
        else if (stackHas('maintainWorldMonsters')) source = 'background';
        else if (stackHas('checkEncounter')) source = 'checkEncounter';
        const id = (mon && mon.id) || ((typeof mdef === 'string') ? mdef : (mdef && mdef.id)) || null;
        const wave = (mon && mon.wave != null) ? (mon.wave | 0) : waveOf(id, (typeof mdef === 'object') ? mdef : null);
        seqCounter++;
        if (mon && typeof mon === 'object') instances.set(mon, seqCounter);
        t.spawns.push({
          seq: seqCounter, day: dayOf(Game), id: id, wave: wave,
          tx: (mon && mon.tx != null) ? mon.tx : tx, ty: (mon && mon.ty != null) ? mon.ty : ty,
          px: pt.px, py: pt.py,
          dist: (pt.px != null && mon) ? (Math.abs(mon.tx - pt.px) + Math.abs(mon.ty - pt.py)) : null,
          onPlayerTile: (pt.px != null && mon) ? (mon.tx === pt.px && mon.ty === pt.py) : null,
          source: source, stackFn: fn, veteran: !!(mon && mon.veteran),
        });
      } catch (e) { t.instrumentErrors.push('spawn-record: ' + String(e.message).slice(0, 80)); }
      return mon;
    };
  } else { t.instrumentErrors.push('spawnWorldMonster-missing'); }

  if (typeof origRemove === 'function') {
    Game.removeWorldMonster = function (m) {
      const seq = (m && typeof m === 'object' && instances.has(m)) ? instances.get(m) : null;
      let ret;
      try { ret = origRemove.apply(this, arguments); } catch (e) { throw e; }
      try {
        const fn = stackFn();
        let rclass = 'other';
        if (fn && /startCombat|fieldFight|resolveWild|resolvePatrol|villagerMonsterTick|patrol/.test(fn)) rclass = 'fight-settlement';
        t.removals.push({ seq: seq, day: dayOf(Game), id: (m && m.id) || null, stackFn: fn, rclass: rclass });
      } catch (e) { t.instrumentErrors.push('remove-record: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { t.instrumentErrors.push('removeWorldMonster-missing'); }

  if (typeof origCast === 'function') {
    Game.castMonster = function () {
      let ret = null;
      try { ret = origCast.apply(this, arguments); } catch (e) { throw e; }
      try {
        const fn = stackFn();
        let source = 'other';
        if (fn && fn.indexOf('checkEncounter') >= 0) source = 'wanderer-cast';
        else if (stackHas('contest')) source = 'contest-cast';
        else if (stackHas('checkEncounter')) source = 'wanderer-cast';
        const id = (ret && typeof ret === 'object') ? ret.id : ret;
        t.casts.push({ day: dayOf(Game), id: id || null, wave: waveOf(id, null), veteran: !!(ret && typeof ret === 'object' && ret.veteran), source: source, stackFn: fn });
      } catch (e) { t.instrumentErrors.push('cast-record: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { t.instrumentErrors.push('castMonster-missing'); }

  if (typeof origStart === 'function') {
    Game.startCombat = function () {
      const mid = arguments.length ? arguments[0] : null;
      let ret;
      try { ret = origStart.apply(this, arguments); } catch (e) { throw e; }
      try {
        t.fights.push({ day: dayOf(Game), channel: 'player-tb', fighter: null, mid: mid || null, wave: waveOf(mid, null), optsKeys: [], outcome: null });
      } catch (e) { t.instrumentErrors.push('startCombat-record: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { t.instrumentErrors.push('startCombat-missing'); }
  if (typeof origField === 'function') {
    Game.fieldFight = function (vid, mdef, m, opts) {
      let ret;
      try { ret = origField.apply(this, arguments); } catch (e) { throw e; }
      try {
        const mid = (mdef && mdef.id) || (m && m.id) || null;
        const keys = opts ? Object.keys(opts).sort() : [];
        let outcome = null;
        try { outcome = (ret && (ret.outcome || ret.result)) || null; } catch (e2) {}
        t.fights.push({ day: dayOf(Game), channel: 'field', fighter: vid || null, mid: mid, wave: waveOf(mid, mdef), optsKeys: keys, outcome: outcome });
      } catch (e) { t.instrumentErrors.push('fieldFight-record: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { t.instrumentErrors.push('fieldFight-missing'); }

  function snapshot() {
    const snap = { day: dayOf(Game) };
    try { snap.scholarId = Game.villagerId || null; } catch (e) { snap.scholarId = null; }
    try {
      const roster = (((Game.state || {}).village || {}).roster || []).slice();
      snap.rosterSize = roster.length;
      let living = 0;
      roster.forEach(function (vid) {
        if (vid === snap.scholarId) { living++; return; }
        try { const p = (typeof Game.getPerson === 'function') ? Game.getPerson(vid) : null; if (p && !p.dead) living++; } catch (e) {}
      });
      snap.living = living;
    } catch (e) { snap.rosterSize = null; snap.living = null; t.instrumentErrors.push('roster: ' + String(e.message).slice(0, 80)); }
    try {
      const st = Game.villageStanding ? Game.villageStanding() : null;
      snap.raw = st ? (st.total | 0) : null;
    } catch (e) { snap.raw = null; t.instrumentErrors.push('standing: ' + String(e.message).slice(0, 80)); }
    // villageStandingTotal + unlockedWave carry the same side-effect
    // class as standaccum's daily standing calls (peak release + hold
    // beats); the neutrality leg proves no trajectory perturbation.
    try { snap.gated = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) { snap.gated = null; t.instrumentErrors.push('gated: ' + String(e.message).slice(0, 80)); }
    try { snap.unlockedWave = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { snap.unlockedWave = null; t.instrumentErrors.push('unlockedWave: ' + String(e.message).slice(0, 80)); }
    try { snap.readiness5 = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null; } catch (e) { snap.readiness5 = null; t.instrumentErrors.push('readiness5: ' + String(e.message).slice(0, 80)); }
    try { snap.worldCap = Game.worldMonsterCap ? Game.worldMonsterCap() : null; } catch (e) { snap.worldCap = null; }
    const pt = playerTile();
    snap.px = pt.px; snap.py = pt.py;
    try {
      const w = (typeof Game.wanderer !== 'undefined' && Game.wanderer) ? { id: Game.wanderer.monsterId || null, veteran: !!Game.wanderer.veteran } : null;
      snap.wanderer = w;
    } catch (e) { snap.wanderer = null; }
    try {
      const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
      snap.world = list.map(function (m) {
        let npcCount = null;
        if (!npcsOnNodeMissing) {
          try { npcCount = Game.npcsOnNode(m.tx, m.ty).length; }
          catch (e) { if (npcErrCount < 3) { npcErrCount++; t.instrumentErrors.push('npcsOnNode: ' + String(e.message).slice(0, 80)); } }
        }
        return {
          seq: instances.has(m) ? instances.get(m) : null, id: m.id, wave: (m.wave | 0) || waveOf(m.id, null),
          tx: m.tx, ty: m.ty,
          dist: (pt.px != null) ? (Math.abs(m.tx - pt.px) + Math.abs(m.ty - pt.py)) : null,
          onPlayerTile: (pt.px != null) ? (m.tx === pt.px && m.ty === pt.py) : null,
          npcCount: npcCount,
        };
      });
    } catch (e) { snap.world = null; t.instrumentErrors.push('world-snap: ' + String(e.message).slice(0, 80)); }
    try { snap.w4facedTypes = (typeof Game.waveEngaged === 'function') ? (Game.waveEngaged(4) | 0) : null; } catch (e) { snap.w4facedTypes = null; }
    t.daily.push(snap);
    return snap;
  }

  function finalize() {
    const out = {};
    try { out.waveKillLog = (((Game.state || {}).waveKillLog) || []).slice(); } catch (e) { out.waveKillLog = null; t.instrumentErrors.push('killlog-final: ' + String(e.message).slice(0, 80)); }
    try { out.fallen = (((Game.state || {}).village || {}).fallen || []).slice(); } catch (e) { out.fallen = null; t.instrumentErrors.push('fallen-final: ' + String(e.message).slice(0, 80)); }
    try {
      const ds = (typeof Game.deedState === 'function') ? Game.deedState() : null;
      out.wavesFaced = (ds && ds.wavesFaced) || null;
    } catch (e) { out.wavesFaced = null; t.instrumentErrors.push('deed-final: ' + String(e.message).slice(0, 80)); }
    try { out.scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { out.scaleRank = null; }
    try { out.unlockedWave = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { out.unlockedWave = null; }
    try { out.standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) { out.standing = null; }
    try { out.readiness5 = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null; } catch (e) { out.readiness5 = null; }
    try {
      const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
      out.finalWorld = list.map(function (m) { return { seq: instances.has(m) ? instances.get(m) : null, id: m.id, wave: (m.wave | 0) || waveOf(m.id, null), tx: m.tx, ty: m.ty }; });
    } catch (e) { out.finalWorld = null; }
    return out;
  }

  function uninstall() {
    try { if (typeof origSpawn === 'function') Game.spawnWorldMonster = origSpawn; } catch (e) {}
    try { if (typeof origRemove === 'function') Game.removeWorldMonster = origRemove; } catch (e) {}
    try { if (typeof origCast === 'function') Game.castMonster = origCast; } catch (e) {}
    try { if (typeof origStart === 'function') Game.startCombat = origStart; } catch (e) {}
    try { if (typeof origField === 'function') Game.fieldFight = origField; } catch (e) {}
  }

  return { t: t, snapshot: snapshot, finalize: finalize, uninstall: uninstall };
}

module.exports = { install: install };
