// vetbar-instrument-20261103.js — veterans-bar autopsy instrument (arm
// sim-vetbar-a, run fleshout-loop-a-20261103T1415Z). Wraps the two kill
// choke points (recordWaveKill, recordPyrrhicKill) and snapshots the
// veteran-conversion state daily: waveKillLog wave-4+ entries, per-killer
// liveness under the gate's own terms, waveCombatReadiness(5) bars, and
// scholar succession. Pure helpers exported for the proof test.
// Usage: const INST = require('./vetbar-instrument-20261103'); const inst = INST.install(Game);
//   inst.snapshot(); ... inst.uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function waveOf(Game, mid) {
  try {
    const m = (Game.data.monsters || []).find(function (x) { return x && x.id === mid; });
    if (m) return m.wave || 1;
  } catch (e) {}
  return null;
}
function killerInfo(Game, by) {
  const info = { by: by, isScholarNow: false, inRoster: false, vpFound: false, vpDead: false };
  try { info.isScholarNow = (by != null && by === Game.villagerId); } catch (e) {}
  try { info.inRoster = (((Game.state || {}).village || {}).roster || []).indexOf(by) >= 0; } catch (e) {}
  try {
    const inData = (Game.data.villagers || []).some(function (x) { return x && x.id === by; });
    const rc = ((Game.state || {}).village || {}).rosterChars || {};
    info.vpFound = inData || Object.prototype.hasOwnProperty.call(rc, by);
  } catch (e) {}
  try { info.vpDead = !!((typeof Game.vpOf === 'function' ? Game.vpOf(by) : null) || {}).dead; } catch (e) {}
  // Gate's own liveness rule (standing.js isLiving): current scholar is
  // living; otherwise vpOf not dead. NOTE vpOf falls back to {} for
  // unknown ids, so unknown ids read as living — replicated faithfully.
  info.aliveRecount = info.isScholarNow ? true : !info.vpDead;
  return info;
}

function install(Game) {
  const t = { killRows: [], daily: [], deathDays: {}, instrumentErrors: [], wrapCounts: { recordWaveKill: 0, recordPyrrhicKill: 0 } };
  const orig = {};
  const prevAlive = {}; // by -> true while observed alive
  function wrapKill(fnName, pyrrhic) {
    if (typeof Game[fnName] !== 'function') { t.instrumentErrors.push(fnName + ': not a function, skipped'); return; }
    orig[fnName] = Game[fnName];
    Game[fnName] = function (monsterId, killerVid, via, detail) {
      t.wrapCounts[fnName]++;
      let before = null;
      try { before = ((Game.state || {}).waveKillLog || []).length; } catch (e) {}
      let r;
      try { r = orig[fnName].apply(this, arguments); } catch (e) { t.instrumentErrors.push(fnName + ': ' + String(e.message).slice(0, 80)); throw e; }
      try {
        const after = ((Game.state || {}).waveKillLog || []).length;
        const w = waveOf(Game, monsterId);
        if (w != null && w >= 4) {
          t.killRows.push({
            day: dayOf(Game), fn: fnName, pyrrhic: !!pyrrhic, mid: monsterId, wave: w,
            by: (killerVid == null ? null : killerVid), via: via || 'unknown',
            trick: (detail == null ? null : detail),
            scholarAtKill: Game.villagerId || null,
            wasScholar: (killerVid != null && killerVid === Game.villagerId),
            logLenBefore: before, logLenAfter: after, entryAdded: (before != null && after != null && after > before),
          });
        }
      } catch (e) { t.instrumentErrors.push(fnName + '-row: ' + String(e.message).slice(0, 80)); }
      return r;
    };
  }
  wrapKill('recordWaveKill', false);
  wrapKill('recordPyrrhicKill', true);

  function snapshot() {
    const snap = { day: dayOf(Game) };
    try { snap.scholarId = Game.villagerId || null; } catch (e) { snap.scholarId = null; }
    try { snap.roster = (((Game.state || {}).village || {}).roster || []).slice(); } catch (e) { snap.roster = []; }
    try {
      const log = ((Game.state || {}).waveKillLog || []).filter(function (e) { return e && (e.w | 0) >= 4; });
      snap.logW4 = log.map(function (e) { return { d: e.d, mid: e.mid, w: e.w, by: e.by, via: e.via, trick: e.trick }; });
    } catch (e) { snap.logW4 = null; }
    try { snap.readiness5 = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null; } catch (e) { snap.readiness5 = null; }
    try { snap.readiness4 = Game.waveCombatReadiness ? Game.waveCombatReadiness(4) : null; } catch (e) { snap.readiness4 = null; }
    try {
      const killers = {};
      (snap.logW4 || []).forEach(function (e) {
        const k = killers[e.by] || (killers[e.by] = { kills: 0, firstDay: e.d, lastDay: e.d, vias: {} });
        k.kills++; if (e.d < k.firstDay) k.firstDay = e.d; if (e.d > k.lastDay) k.lastDay = e.d;
        k.vias[e.via || 'unknown'] = (k.vias[e.via || 'unknown'] || 0) + 1;
      });
      snap.killers = {};
      Object.keys(killers).forEach(function (by) {
        const info = killerInfo(Game, by);
        snap.killers[by] = Object.assign({}, killers[by], info);
        if (prevAlive[by] && !info.aliveRecount && t.deathDays[by] == null) t.deathDays[by] = snap.day;
        prevAlive[by] = info.aliveRecount;
      });
      // Gate replication: distinct by with w>=4 kills, alive per gate rule.
      snap.gateSet = Object.keys(snap.killers).filter(function (by) { return snap.killers[by].aliveRecount; });
      snap.gateCount = snap.gateSet.length;
    } catch (e) { t.instrumentErrors.push('snapshot-killers: ' + String(e.message).slice(0, 80)); snap.killers = null; }
    t.daily.push(snap);
    return snap;
  }

  function uninstall() {
    Object.keys(orig).forEach(function (n) { Game[n] = orig[n]; });
  }
  return { t: t, snapshot: snapshot, uninstall: uninstall };
}

module.exports = { install: install, dayOf: dayOf, waveOf: waveOf, killerInfo: killerInfo };
