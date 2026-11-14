// standing99107-instrument-20261114.js — standing-accumulation
// decomposition instrument (arm sim-standing99107-b, run
// fleshout-loop-b-20261114T1430Z). Scripts only, zero src/js.
// Daily per-day standing decomposition: war points per wave (3/4/5)
// + per-type ledger (cap-aware), diplomacy per link (seasoned?
// regional+? kind? tribute marker), plenty per feast (day, quality,
// bundle), raw, capped, plenty-cap bite, peak, deferral5,
// readiness-5/-4 bars, w4/w5 faced, w3 rung, scale rank, ladder
// track totals (context: tracks feed the ladder, not standing),
// and an INDEPENDENT veteran recount from state.waveKillLog.
// The snapshot NEVER calls villageStandingTotal() or unlockedWave()
// — both are side-effecting (they record the peak and fire
// release/hold beats). Door-open events are observed as the ENGINE
// announces them (release say-lines + peak transitions), never
// manufactured by the instrument. The driver calls unlockedWave()
// once AFTER the run and reports it separately.
// Kill events: recordWaveKill + recordPyrrhicKill wraps (wave>=3
// rows kept — war counts w3+; all-wave counts in wrapCounts).
// Feast events: hostFeast wrap (return value + feastLog delta).
// Death causes: tele 'death' hook (same as the w4convert/ready5
// instruments). Say/sysSay wraps capture standing/hold/release /
// ledger / feast lines only (capped), never full transcripts. All
// wraps are call-through and RNG-neutral; every catch reports into
// t.instrumentErrors, never silently.
// Usage: const INST = require('./standing99107-instrument-20261114');
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
const SAY_RE = /fifth draft|producers|RATINGS|released into|still waiting|stays in the wings|bread alone|next act|ready to FIGHT|standing|wave 5|Wave 5|WAVE LEDGER|feast|BUNDLE|tribute/i;

function linkKey(l) {
  try {
    const a = l.primary || l.a || '?', b = l.subordinate || l.b || '?';
    return (l.kind || '?') + '|' + a + '|' + b;
  } catch (e) { return '?'; }
}

function install(Game) {
  const t = {
    daily: [], killEvents: [], unlinkedKillRows: [], deathEvents: [],
    feastEvents: [], standingLines: [], saySample: [],
    instrumentErrors: [], wrapCounts: {},
  };
  const orig = {};
  function count(n) { t.wrapCounts[n] = (t.wrapCounts[n] || 0) + 1; }
  function err(where, e) { try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e).slice(0, 100)); } catch (e2) {} }

  // --- kill events (wave>=3 only kept; log-length cross-check) ---
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
        if (w != null && w >= 3) {
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

  // --- feast events (hostFeast wrap: return value + feastLog delta) ---
  if (typeof Game.hostFeast === 'function') {
    orig.hostFeast = Game.hostFeast;
    Game.hostFeast = function (opts) {
      count('hostFeast');
      let logBefore = null;
      try { logBefore = ((Game.state || {}).feastLog || []).length; } catch (e) {}
      let r;
      try { r = orig.hostFeast.apply(this, arguments); } catch (e) { throw e; }
      try {
        const log = ((Game.state || {}).feastLog || []);
        const added = (logBefore != null) ? log.slice(logBefore) : [];
        for (const f of added) {
          t.feastEvents.push({ day: dayOf(Game), quality: (f && f.quality) | 0,
            bundle: !!(f && f.bundle), bundleStage: (f && f.bundleStage) | 0,
            feastDay: (f && f.day) | 0, ok: !!(r && r.ok) });
        }
        if (!added.length && r && r.ok) {
          // Feast succeeded but no log row appeared: flag, never hide.
          t.feastEvents.push({ day: dayOf(Game), quality: null, bundle: false,
            bundleStage: 0, feastDay: dayOf(Game), ok: true, unlogged: true });
        }
      } catch (e) { err('hostFeast-row', e); }
      return r;
    };
  } else { err('install.hostFeast', new Error('not a function')); }

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

  // --- standing / hold / release / ledger / feast lines (say + sysSay) ---
  function wrapSay(fnName) {
    if (typeof Game[fnName] !== 'function') return;
    orig[fnName] = Game[fnName];
    Game[fnName] = function () {
      const arg = arguments.length ? arguments[0] : null;
      try {
        if (typeof arg === 'string' && SAY_RE.test(arg)) {
          if (t.standingLines.length < 400) t.standingLines.push({ day: dayOf(Game), via: fnName, line: String(arg).slice(0, 600) });
          if (t.saySample.length < 200) t.saySample.push({ day: dayOf(Game), via: fnName, line: String(arg).slice(0, 300) });
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
    try { snap.deferral4 = Game.standingDeferral ? Game.standingDeferral(4) : null; } catch (e) { snap.deferral4 = null; err('deferral4', e); }
    // --- war detail: per-wave ledger points + per-type (cap-aware) ---
    try {
      const wl = (typeof Game.ledgerState === 'function') ? Game.ledgerState() : ((Game.state || {}).waveLedger || {});
      snap.ledger = {};
      for (const w of [3, 4, 5]) {
        const e = (wl && wl[w]) || {};
        snap.ledger[w] = { points: (e.points | 0) || 0,
          perType: Object.assign({}, e.perType || {}),
          perTypeX: Object.assign({}, e.perTypeX || {}) };
      }
    } catch (e) { snap.ledger = null; err('ledger', e); }
    // --- diplomacy detail: per-link seasoned / regional+ / tribute marker ---
    try {
      const ls = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
      snap.links = ls.map(function (l) {
        let seasoned = false, regionalPlus = false;
        try { seasoned = (typeof Game._linkSeasoned === 'function') ? !!Game._linkSeasoned(l, !!l.conquered) : false; } catch (e) {}
        try { regionalPlus = (typeof Game._linkRegionalPlus === 'function') ? !!Game._linkRegionalPlus(l) : false; } catch (e) {}
        return { key: linkKey(l), kind: l.kind || null, status: l.status || null,
          day: (l.day | 0) || 0, trust: (l.trust | 0) || 0,
          seasoned: seasoned, regionalPlus: regionalPlus,
          counts: (seasoned && regionalPlus),
          tributePaidWeek: (l.tributePaidWeek == null ? null : (l.tributePaidWeek | 0)) };
      });
    } catch (e) { snap.links = null; err('links', e); }
    // --- plenty detail: the feast log itself ---
    try {
      const log = ((Game.state || {}).feastLog || []);
      snap.feasts = log.map(function (f) { return { day: (f && f.day) | 0, quality: (f && f.quality) | 0, bundle: !!(f && f.bundle), bundleStage: (f && f.bundleStage) | 0 }; });
    } catch (e) { snap.feasts = null; err('feasts', e); }
    // --- ladder tracks (context: tracks feed the ladder, NOT standing) ---
    try {
      const lad = (typeof Game.villageLadder === 'function') ? Game.villageLadder() : null;
      snap.ladder = lad ? { total: lad.total | 0, counted: lad.counted | 0, stage: lad.stage | 0,
        stageName: lad.stageName || null, tracks: Object.assign({}, lad.tracks || {}),
        countedTracks: Object.assign({}, lad.countedTracks || {}),
        bundleBonus: ((lad.detail || {}).bundleBonus | 0) || 0 } : null;
    } catch (e) { snap.ladder = null; err('ladder', e); }
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
  return { t: t, snapshot: snapshot, uninstall: uninstall, linkKey: linkKey };
}

module.exports = { install: install, dayOf: dayOf, waveOf: waveOf, SAY_RE: SAY_RE, linkKey: linkKey };
