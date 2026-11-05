// encounterprod-instrument-20261105.js — wave-4 encounter-production diag
// instrument (arm sim-encounterprod2-b, run fleshout-loop-b-20261105T0330Z).
// Scripts only, zero src/js. Pure-read wrappers + daily snapshots; zero
// game-state writes, zero RNG draws. Wrappers never throw into game code:
// a recording failure is counted in instrumentErrors and the original
// call's result is returned untouched.
//
// Spawn/cast/fight wrappers follow trigger-instrument-20261104's proven
// pattern (stack-classified source, object-reference instance tracking).
// Daily snapshots EXTEND the vetprod snapshot with the wave-4 unlock
// components, so the unlock day is DERIVED offline and unlockedWave() is
// NEVER called mid-run (standaccum parity: villageStandingTotal is
// already side-effecting via the gated snapshot; an extra unlockedWave
// call would double-call it and could shift hold beats).
//   unlock day (derived) = first snapshot day with day >= 25 AND
//   w2pts >= bar[2] (5, from waveLedgerCfg) AND gated >= t4 (100, from
//   standingCfg). Cross-checked offline against finalize unlockedWave.
// Usage: const INST = require('./encounterprod-instrument-20261105');
//   const inst = INST.install(Game); inst.snapshot(); ... inst.finalize(); inst.uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function stackFn() {
  try {
    const lines = (new Error().stack || '').split('\n').slice(1);
    for (const ln of lines) {
      if (ln.indexOf('encounterprod-instrument') >= 0) continue;
      const m = ln.match(/at (?:async )?([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)?)/);
      if (m) return m[1];
    }
    return null;
  } catch (e) { return null; }
}
function stackHas(needle) {
  try {
    const st = new Error().stack || '';
    const lines = st.split('\n').slice(1).filter(function (ln) { return ln.indexOf('encounterprod-instrument') < 0; });
    return lines.some(function (ln) { return ln.indexOf(needle) >= 0; });
  } catch (e) { return false; }
}
function classifyFight(st) {
  if (/contest/i.test(st)) return 'contest';
  if (/feast/i.test(st)) return 'feast';
  if (/trap/i.test(st)) return 'trap';
  if (/monsterTurn|resolveWildMonsterEncounter|villagerMonsterTick|checkEncounter|worldTick/i.test(st)) return 'world';
  return 'other';
}

function install(Game) {
  const t = { spawns: [], casts: [], fights: [], daily: [], instrumentErrors: [] };
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

  const instances = new Map();
  let seqCounter = 0;

  function playerTile() {
    try { return { px: Game.map.px, py: Game.map.py }; } catch (e) { return { px: null, py: null }; }
  }

  const origSpawn = Game.spawnWorldMonster;
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
          onPlayerTile: (pt.px != null && mon) ? (mon.tx === pt.px && mon.ty === pt.py) : null,
          source: source, veteran: !!(mon && mon.veteran),
        });
      } catch (e) { t.instrumentErrors.push('spawn-record: ' + String(e.message).slice(0, 80)); }
      return mon;
    };
  } else { t.instrumentErrors.push('spawnWorldMonster-missing'); }

  if (typeof origCast === 'function') {
    Game.castMonster = function () {
      let ret = null;
      try { ret = origCast.apply(this, arguments); } catch (e) { throw e; }
      try {
        const fn = stackFn();
        let source = 'other';
        if (fn && fn.indexOf('checkEncounter') >= 0) source = 'wanderer-cast';
        else if (stackHas('checkEncounter')) source = 'wanderer-cast';
        const id = (ret && ret.id) || (typeof ret === 'string' ? ret : null);
        t.casts.push({ day: dayOf(Game), id: id, wave: waveOf(id, null), source: source, veteran: !!(ret && ret.veteran) });
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
        const st = (new Error().stack || '');
        const tileMon = (typeof Game.monsterAt === 'function' && playerTile().px != null) ? Game.monsterAt(playerTile().px, playerTile().py) : null;
        const seq = (tileMon && instances.get(tileMon)) || null;
        t.fights.push({ day: dayOf(Game), channel: 'player-tb', fighter: null, mid: mid || null, wave: waveOf(mid, null), cls: classifyFight(st), seq: seq, outcome: null });
      } catch (e) { t.instrumentErrors.push('startCombat-record: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { t.instrumentErrors.push('startCombat-missing'); }

  if (typeof origField === 'function') {
    Game.fieldFight = function (vid, mdef, m, opts) {
      let ret;
      try { ret = origField.apply(this, arguments); } catch (e) { throw e; }
      try {
        const st = (new Error().stack || '');
        const mid = (mdef && mdef.id) || (m && m.id) || null;
        const seq = (m && instances.get(m)) || null;
        let outcome = null;
        try { outcome = (ret && (ret.outcome || ret.result)) || null; } catch (e2) { t.instrumentErrors.push('fieldFight-outcome: ' + String(e2.message).slice(0, 80)); }
        t.fights.push({ day: dayOf(Game), channel: 'field', fighter: vid || null, mid: mid, wave: waveOf(mid, mdef), cls: classifyFight(st), seq: seq, outcome: outcome });
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
    try { snap.gated = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) { snap.gated = null; t.instrumentErrors.push('gated: ' + String(e.message).slice(0, 80)); }
    try { snap.w2pts = (typeof Game.waveLedgerPoints === 'function') ? (Game.waveLedgerPoints(2) | 0) : null; } catch (e) { snap.w2pts = null; t.instrumentErrors.push('w2pts: ' + String(e.message).slice(0, 80)); }
    try {
      const cfg = (typeof Game.waveLedgerCfg === 'function') ? Game.waveLedgerCfg() : null;
      snap.bar2 = (cfg && cfg.barsPerWave && cfg.barsPerWave[2] != null) ? (cfg.barsPerWave[2] | 0) : 5;
      snap.dayFloor = (cfg && cfg.dayFloor != null) ? (cfg.dayFloor | 0) : 25;
    } catch (e) { snap.bar2 = 5; snap.dayFloor = 25; }
    try {
      const sc = (typeof Game.standingCfg === 'function') ? Game.standingCfg() : null;
      snap.t4 = (sc && sc.t4 != null) ? (sc.t4 | 0) : 100;
    } catch (e) { snap.t4 = 100; }
    try { snap.scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { snap.scaleRank = null; }
    try { snap.readiness5 = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null; } catch (e) { snap.readiness5 = null; t.instrumentErrors.push('readiness5: ' + String(e.message).slice(0, 80)); }
    try {
      const log = ((Game.state || {}).waveKillLog) || [];
      const w4 = log.filter(function (e2) { return ((e2 && e2.w) | 0) >= 4; });
      snap.w4kills = w4.length;
      const seen = {};
      w4.forEach(function (e2) { if (e2 && e2.by) seen[e2.by] = true; });
      snap.w4killers = Object.keys(seen).length;
    } catch (e) { snap.w4kills = null; snap.w4killers = null; t.instrumentErrors.push('killlog-snap: ' + String(e.message).slice(0, 80)); }
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
    return out;
  }

  function uninstall() {
    try { if (typeof origSpawn === 'function') Game.spawnWorldMonster = origSpawn; } catch (e) {}
    try { if (typeof origCast === 'function') Game.castMonster = origCast; } catch (e) {}
    try { if (typeof origStart === 'function') Game.startCombat = origStart; } catch (e) {}
    try { if (typeof origField === 'function') Game.fieldFight = origField; } catch (e) {}
  }

  return { t: t, snapshot: snapshot, finalize: finalize, uninstall: uninstall };
}

module.exports = { install: install, classifyFight: classifyFight };
