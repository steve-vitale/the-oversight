// ready5-instrument-20261103.js — readiness-5 release re-measurement
// instrument (arm sim-ready5-a, run fleshout-20261103T2315Z).
// Scripts only, zero src/js. Daily per-day readiness-5 bar table:
// gate bars (waveCombatReadiness(5) + (4)), standing breakdown
// (villageStanding + capped total), peak ratchet, deferral, wave-4
// faced, wave-3 rung, scale rank, and an INDEPENDENT veteran recount
// from state.waveKillLog (distinct by, wave>=4, living by the gate's
// own living test) so a gate miscount cannot hide inside the gate.
// The snapshot NEVER calls villageStandingTotal() or unlockedWave()
// — both are side-effecting (they record the peak and fire
// release/hold beats). Door-open events are observed as the ENGINE
// announces them (release say-lines + peak transitions), never
// manufactured by the instrument. The driver calls unlockedWave()
// once AFTER the run and reports it separately.
// Kill events: recordWaveKill + recordPyrrhicKill wraps (wave>=4
// rows kept; all-wave counts in wrapCounts). Death causes: tele
// 'death' hook (same as the w4convert instrument). Say/sysSay wraps
// capture standing/hold/release lines only (capped), never full
// transcripts. All wraps are call-through and RNG-neutral; every
// catch reports into t.instrumentErrors, never silently.
// Usage: const INST = require('./ready5-instrument-20261103');
//   const inst = INST.install(Game); inst.snapshot(); ... inst.uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function waveOf(Game, mid) {
  try {
    const m = (Game.data.monsters || []).find(function (x) { return x && x.id === mid; });
    if (m) return m.wave || 1;
  } catch (e) {}
  return null;
}
const SAY_RE = /fifth draft|producers|RATINGS|released into|still waiting|stays in the wings|bread alone|next act|ready to FIGHT|standing|wave 5|Wave 5/i;

function install(Game) {
  const t = {
    daily: [], killEvents: [], unlinkedKillRows: [], deathEvents: [],
    standingLines: [], instrumentErrors: [], wrapCounts: {},
  };
  const orig = {};
  function count(n) { t.wrapCounts[n] = (t.wrapCounts[n] || 0) + 1; }
  function err(where, e) { try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e).slice(0, 100)); } catch (e2) {} }

  // --- kill events (wave>=4 only kept; log-length cross-check) ---
  function wrapKill(fnName, pyrrhic) {
    if (typeof Game[fnName] !== 'function') { err('install.' + fnName, new Error('not a function')); return; }
    orig[fnName] = Game[fnName];
    Game[fnName] = function (monsterId, killerVid, via, detail) {
      count(fnName);
      let before = null, after = null;
      try { before = ((Game.state || {}).waveKillLog || []).length; } catch (e) {}
      let r;
      try { r = orig[fnName].apply(this, arguments); } catch (e) { throw e; }
      try {
        after = ((Game.state || {}).waveKillLog || []).length;
        const w = waveOf(Game, monsterId);
        if (w != null && w >= 4) {
          t.killEvents.push({ day: dayOf(Game), fn: fnName, pyrrhic: !!pyrrhic,
            mid: monsterId, wave: w, by: (killerVid == null ? null : killerVid),
            via: via || 'unknown', logLenBefore: before, logLenAfter: after,
            entryAdded: (before != null && after != null && after > before) });
        }
      } catch (e) { err(fnName + '-row', e); }
      return r;
    };
  }
  wrapKill('recordWaveKill', false);
  wrapKill('recordPyrrhicKill', true);

  // --- engine-recorded death causes (tele 'death' hook) ---
  if (typeof Game.tele === 'function') {
    orig.tele = Game.tele;
    Game.tele = function (type, data) {
      let r;
      try { r = orig.tele.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (type === 'death' && data && typeof data === 'object') {
          t.deathEvents.push({ day: dayOf(Game), kind: data.kind || null, who: data.who || null, cause: data.cause || null, player: !!data.player });
        }
      } catch (e) { err('tele', e); }
      return r;
    };
  } else { err('install.tele', new Error('not a function')); }

  // --- standing / hold / release lines (say + sysSay) ---
  function wrapSay(fnName) {
    if (typeof Game[fnName] !== 'function') return;
    orig[fnName] = Game[fnName];
    Game[fnName] = function () {
      const arg = arguments.length ? arguments[0] : null;
      try {
        if (typeof arg === 'string' && SAY_RE.test(arg) && t.standingLines.length < 400) {
          t.standingLines.push({ day: dayOf(Game), via: fnName, line: String(arg).slice(0, 600) });
        }
      } catch (e) { err(fnName + '-wrap', e); }
      return orig[fnName].apply(this, arguments);
    };
  }
  wrapSay('say');
  wrapSay('sysSay');

  function isLiving(Game, vid, scholarId) {
    if (vid === scholarId) return true;
    try {
      const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(vid) : null;
      return !!(vp && !vp.dead);
    } catch (e) { return false; }
  }

  function snapshot() {
    const snap = { day: dayOf(Game) };
    try { snap.scholarId = Game.villagerId || null; } catch (e) { snap.scholarId = null; }
    try { snap.roster = (((Game.state || {}).village || {}).roster || []).slice(); } catch (e) { snap.roster = []; }
    try { snap.readiness5 = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null; } catch (e) { snap.readiness5 = null; err('readiness5', e); }
    try { snap.readiness4 = Game.waveCombatReadiness ? Game.waveCombatReadiness(4) : null; } catch (e) { snap.readiness4 = null; err('readiness4', e); }
    try { snap.standing = Game.villageStanding ? Game.villageStanding() : null; } catch (e) { snap.standing = null; err('standing', e); }
    try { snap.capped = Game.standingPlentyCappedTotal ? Game.standingPlentyCappedTotal() : null; } catch (e) { snap.capped = null; err('capped', e); }
    try { snap.peak = Game._standingPeakWave ? Game._standingPeakWave() : null; } catch (e) { snap.peak = null; err('peak', e); }
    try { snap.deferral5 = Game.standingDeferral ? Game.standingDeferral(5) : null; } catch (e) { snap.deferral5 = null; err('deferral5', e); }
    try { snap.w4faced = Game.waveEngaged ? Game.waveEngaged(4) : null; } catch (e) { snap.w4faced = null; err('w4faced', e); }
    try { snap.w5faced = Game.waveEngaged ? Game.waveEngaged(5) : null; } catch (e) { snap.w5faced = null; err('w5faced', e); }
    try {
      const cfg = Game.waveLedgerCfg ? Game.waveLedgerCfg() : {};
      const bars = (cfg && cfg.barsPerWave) || {};
      snap.w3rung = { day: snap.day, pts2: Game.waveLedgerPoints ? (Game.waveLedgerPoints(2) | 0) : null,
        dayFloor: (cfg && cfg.dayFloor != null) ? cfg.dayFloor : null, bar2: (bars[2] != null ? bars[2] : null),
        met: (snap.day >= ((cfg && cfg.dayFloor != null) ? cfg.dayFloor : 25)) && ((Game.waveLedgerPoints ? (Game.waveLedgerPoints(2) | 0) : 0) >= ((bars[2] != null) ? bars[2] : 4)) };
    } catch (e) { snap.w3rung = null; err('w3rung', e); }
    try { snap.scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { snap.scaleRank = null; err('scaleRank', e); }
    try {
      const log = ((Game.state || {}).waveKillLog || []).filter(function (e) { return e && (e.w | 0) >= 4; });
      snap.logW4 = log.map(function (e) { return { d: e.d, mid: e.mid, w: e.w, by: e.by, via: e.via }; });
      const vets = {};
      log.forEach(function (e) { if (e.by) vets[e.by] = true; });
      snap.veteranVids = Object.keys(vets).filter(function (vid) { return isLiving(Game, vid, snap.scholarId); });
      snap.veteranVidsAll = Object.keys(vets);
      snap.veteranRecount = snap.veteranVids.length;
      snap.veteranMismatch = (snap.readiness5 && snap.readiness5.veterans != null)
        ? (snap.veteranRecount !== (snap.readiness5.veterans | 0)) : null;
    } catch (e) { snap.logW4 = null; snap.veteranVids = null; err('veterans', e); }
    try {
      snap.livingCount = snap.roster.filter(function (vid) { return isLiving(Game, vid, snap.scholarId); }).length;
    } catch (e) { snap.livingCount = null; err('livingCount', e); }
    t.daily.push(snap);
    return snap;
  }

  function uninstall() { Object.keys(orig).forEach(function (n) { try { Game[n] = orig[n]; } catch (e) {} }); }
  return { t: t, snapshot: snapshot, uninstall: uninstall };
}

module.exports = { install: install, dayOf: dayOf, waveOf: waveOf, SAY_RE: SAY_RE };
