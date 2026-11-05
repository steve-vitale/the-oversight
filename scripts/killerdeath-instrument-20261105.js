// killerdeath-instrument-20261105.js — wave-4 killer retention instrument
// (arm sim-killerdeath-b, run fleshout-loop-b-20261105T0330Z). Scripts only,
// zero src/js. Pure-read wrappers + daily snapshots + killer tracking; zero
// game-state writes, zero RNG draws. Wrappers never throw into game code: a
// recording failure is counted in instrumentErrors and the original call's
// result is returned untouched. Adapted from vetprod-instrument-20261104
// (proven neutral on its band) with three additions:
//  (1) recordWaveKill wrapper — kill-time scholar capture, so killer channel
//      (player vs NPC) does not depend on a daily snapshot taken after a
//      possible intraday mantle pass;
//  (2) playerDeath wrapper — scholar-death context (cause arg, at-haven,
//      in-combat, pending-encounter) captured BEFORE the mantle passes, so
//      the fallen 'the wild' residual can be split by location/combat state
//      instead of cited as a cause;
//  (3) daily killer tracker — for every wave-4+ killer so far, one row per
//      day: is-scholar, at-haven (scholar only), health, on-expedition.
// Usage: const INST = require('./killerdeath-instrument-20261105');
//   const inst = INST.install(Game); inst.snapshot(); ... inst.finalize(); inst.uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function install(Game) {
  const t = { fights: [], daily: [], killsLive: [], scholarDeaths: [], killerTrack: [], instrumentErrors: [] };
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

  const origStart = Game.startCombat;
  const origField = Game.fieldFight;
  if (typeof origStart === 'function') {
    Game.startCombat = function () {
      const mid = arguments.length ? arguments[0] : null;
      let ret;
      try { ret = origStart.apply(this, arguments); }
      catch (e) { throw e; }
      try {
        t.fights.push({ day: dayOf(Game), channel: 'player-tb', fighter: null, mid: mid || null, wave: waveOf(mid, null), optsKeys: [], outcome: null });
      } catch (e) { t.instrumentErrors.push('startCombat-record: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { t.instrumentErrors.push('startCombat-missing'); }
  if (typeof origField === 'function') {
    Game.fieldFight = function (vid, mdef, m, opts) {
      let ret;
      try { ret = origField.apply(this, arguments); }
      catch (e) { throw e; }
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

  const origRecordKill = Game.recordWaveKill;
  if (typeof origRecordKill === 'function') {
    Game.recordWaveKill = function (monsterId, killerVid, via, detail) {
      let scholarAtKill = null;
      try { scholarAtKill = Game.villagerId || null; } catch (e) {}
      let ret;
      try { ret = origRecordKill.apply(this, arguments); }
      catch (e) { throw e; }
      try {
        const mdef = ((Game.data || {}).monsters || []).find(function (m) { return m && m.id === monsterId; }) || null;
        t.killsLive.push({ day: dayOf(Game), mid: monsterId || null, wave: waveOf(monsterId, mdef), by: killerVid || null, via: via || null, scholarAtKill: scholarAtKill, scholarChannel: !!(scholarAtKill && killerVid && scholarAtKill === killerVid) });
      } catch (e) { t.instrumentErrors.push('recordWaveKill-record: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { t.instrumentErrors.push('recordWaveKill-missing'); }

  const origPlayerDeath = Game.playerDeath;
  if (typeof origPlayerDeath === 'function') {
    Game.playerDeath = function (cause) {
      let ctx = null;
      try {
        ctx = { day: dayOf(Game), scholarId: Game.villagerId || null, causeArg: cause || null,
          atHaven: (typeof Game.playerAtHaven === 'function') ? !!Game.playerAtHaven() : null,
          mapX: (Game.map && Game.map.px != null) ? Game.map.px : null,
          mapY: (Game.map && Game.map.py != null) ? Game.map.py : null,
          inCombat: !!Game.tbfight, pendingEncounter: !!Game.pendingEncounter };
      } catch (e) { t.instrumentErrors.push('playerDeath-ctx: ' + String(e.message).slice(0, 80)); }
      let ret;
      try { ret = origPlayerDeath.apply(this, arguments); }
      catch (e) { throw e; }
      try { if (ctx) t.scholarDeaths.push(ctx); } catch (e2) { t.instrumentErrors.push('playerDeath-record: ' + String(e2.message).slice(0, 80)); }
      return ret;
    };
  } else { t.instrumentErrors.push('playerDeath-missing'); }

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
    // Probe-observability fields (pure reads): scholar position, at-haven,
    // and whether the retention window is active for the current scholar
    // (same rule as the probe policy: a wave-4+ kill by the scholar within
    // the last 30 days, exclusive of the kill day itself). These let the
    // analyzer verify the probe actually applied, since runDays does not
    // return the policy ctx.
    try {
      snap.mapX = (Game.map && Game.map.px != null) ? Game.map.px : null;
      snap.mapY = (Game.map && Game.map.py != null) ? Game.map.py : null;
      snap.scholarAtHaven = (typeof Game.playerAtHaven === 'function') ? !!Game.playerAtHaven() : null;
      const log2 = ((Game.state || {}).waveKillLog) || [];
      let latest = null;
      log2.forEach(function (e2) { if (e2 && e2.by === snap.scholarId && ((e2.w | 0) >= 4)) { if (latest == null || (e2.d | 0) > latest) latest = (e2.d | 0); } });
      snap.retentionActive = (latest != null) && (snap.day - latest > 0) && (snap.day - latest <= 30);
    } catch (e) { snap.mapX = null; snap.mapY = null; snap.scholarAtHaven = null; snap.retentionActive = null; }
    t.daily.push(snap);
    // Killer tracker: one row per wave-4+ killer per snapshot day (pure reads).
    try {
      const log = ((Game.state || {}).waveKillLog) || [];
      const killers = {};
      log.forEach(function (e2) { if (((e2 && e2.w) | 0) >= 4 && e2.by) killers[e2.by] = true; });
      const fallen = (((Game.state || {}).village || {}).fallen) || [];
      const health = (((Game.state || {}).village || {}).health) || {};
      let exped = null;
      try { const ag = (typeof Game.agencyState === 'function') ? Game.agencyState() : null; exped = ag ? ag.exped : null; } catch (e) { exped = null; }
      Object.keys(killers).forEach(function (by) {
        const dead = fallen.some(function (f) { return f.villagerId === by; });
        const isScholar = (by === snap.scholarId);
        let atHaven = null;
        try { if (isScholar && typeof Game.playerAtHaven === 'function') atHaven = !!Game.playerAtHaven(); } catch (e) {}
        t.killerTrack.push({ day: snap.day, by: by, isScholar: isScholar, deadInFallen: dead,
          atHaven: atHaven, health: (health[by] != null) ? health[by] : null,
          onExped: !!(exped && exped[by]) });
      });
    } catch (e) { t.instrumentErrors.push('killerTrack: ' + String(e.message).slice(0, 80)); }
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
    // Authoritative alive-at-end map: data villagers' dead flags (independent
    // of the fallen roll, which misses some contest deaths of the scholar).
    try {
      const dead = {};
      ((Game.data || {}).villagers || []).forEach(function (p) { if (p && p.id) dead[p.id] = !!p.dead; });
      ((Game.data || {}).background_survivors || []).forEach(function (p) { if (p && p.id && dead[p.id] === undefined) dead[p.id] = !!p.dead; });
      out.deadMap = dead;
      out.endScholarId = Game.villagerId || null;
    } catch (e) { out.deadMap = null; out.endScholarId = null; t.instrumentErrors.push('deadMap: ' + String(e.message).slice(0, 80)); }
    return out;
  }

  function uninstall() {
    try { if (typeof origStart === 'function') Game.startCombat = origStart; } catch (e) {}
    try { if (typeof origField === 'function') Game.fieldFight = origField; } catch (e) {}
    try { if (typeof origRecordKill === 'function') Game.recordWaveKill = origRecordKill; } catch (e) {}
    try { if (typeof origPlayerDeath === 'function') Game.playerDeath = origPlayerDeath; } catch (e) {}
  }

  return { t: t, snapshot: snapshot, finalize: finalize, uninstall: uninstall };
}

module.exports = { install: install };
