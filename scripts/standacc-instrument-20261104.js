// standacc-instrument-20261104.js — standing accumulation instrument
// (arm sim-standacc-b, run fleshout-loop-b-20261104T0550Z).
// Scripts only, zero src/js. Daily standing decomposition snapshots:
// villageStanding breakdown (war/diplomacy/plenty, warPts, links,
// feasts), raw, capped (standingPlentyCappedTotal), peak ratchet,
// readiness-5/4 bars, deferral-5, wave-4/5 faced, wave-3 rung, scale
// rank, PLUS the two funnel decompositions that make a "missing
// income" claim checkable: (a) diplomacy funnel — hierarchy links
// classified total/active/seasoned/regional+ via the game's OWN
// read-only reads (hierarchyState, _linkSeasoned, _linkRegionalPlus
// — the same reads villageStanding makes); (b) war headroom —
// ledger points per wave 3/4/5, per-type points vs perTypeCap,
// max earnable points per wave (monster defs of that wave x cap).
// The snapshot NEVER calls villageStandingTotal() or unlockedWave()
// (both side-effecting: peak recording + beats). Door-open events
// are observed as the ENGINE announces them (release say-lines +
// peak transitions). Kill events: recordWaveKill + recordPyrrhicKill
// wraps, wave>=3 rows kept (war attribution). Death causes: tele
// 'death' hook. Say/sysSay wraps capture strict hold/release lines
// + standing-word lines (draft/standing-line readout/veteran/feast/
// bond/polity/realm) — the ready5 "standing"-substring pantry flood
// is avoided by requiring the "Standing N (" readout shape for the
// bare word. All wraps are call-through and RNG-neutral; every catch
// reports into t.instrumentErrors, never silently.
// Usage: const INST = require('./standacc-instrument-20261104');
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
const SAY_RE = /fifth draft|producers|RATINGS|stays in the wings|bread alone|next act|ready to FIGHT|talent has been released|greenlit|veteran|feast|polity|realm|\bStanding \d+ \(/i;

function install(Game) {
  const t = {
    daily: [], killEvents: [], unlinkedKillRows: [], deathEvents: [],
    standingLines: [], instrumentErrors: [], wrapCounts: {},
  };
  const orig = {};
  function count(n) { t.wrapCounts[n] = (t.wrapCounts[n] || 0) + 1; }
  function err(where, e) { try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e).slice(0, 100)); } catch (e2) {} }

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
    // Diplomacy funnel: same reads villageStanding makes, classified.
    try {
      const ls = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
      const funnel = { total: ls.length, active: 0, seasoned: 0, regionalPlus: 0, seasonedNotRegional: 0, detail: [] };
      for (const l of ls) {
        const active = (l && l.status === 'active');
        if (active) funnel.active++;
        let seasoned = false, regional = false;
        try { seasoned = (typeof Game._linkSeasoned === 'function') ? !!Game._linkSeasoned(l, !!(l && l.conquered)) : false; } catch (e) {}
        try { regional = (typeof Game._linkRegionalPlus === 'function') ? !!Game._linkRegionalPlus(l) : false; } catch (e) {}
        if (seasoned) funnel.seasoned++;
        if (seasoned && regional) funnel.regionalPlus++;
        if (seasoned && !regional) funnel.seasonedNotRegional++;
        if (funnel.detail.length < 30) funnel.detail.push({ kind: l && l.kind, primary: l && l.primary, subordinate: l && l.subordinate, status: l && l.status, seasoned: seasoned, regionalPlus: regional });
      }
      snap.linkFunnel = funnel;
    } catch (e) { snap.linkFunnel = null; err('linkFunnel', e); }
    // War headroom: ledger points per wave + per-type cap saturation.
    try {
      const cfg = Game.waveLedgerCfg ? Game.waveLedgerCfg() : {};
      const cap = (cfg && cfg.perTypeCap != null) ? (cfg.perTypeCap | 0) : 2;
      const L = (typeof Game.ledgerState === 'function') ? Game.ledgerState() : {};
      const defs = (Game.data && Game.data.monsters) || [];
      const ledger = {};
      for (const w of [3, 4, 5]) {
        const entry = L[w] || {};
        const perType = entry.perType || {};
        const defsW = defs.filter(function (m) { return m && (m.wave | 0) === w; }).length;
        let typesTouched = 0, typesAtCap = 0, pts = 0;
        for (const k of Object.keys(perType)) { typesTouched++; pts += (perType[k] | 0); if ((perType[k] | 0) >= cap) typesAtCap++; }
        ledger['w' + w] = { points: (Game.waveLedgerPoints ? (Game.waveLedgerPoints(w) | 0) : pts),
          typesTouched: typesTouched, typesAtCap: typesAtCap, defsOfWave: defsW,
          maxPoints: defsW * cap, headroomPts: Math.max(0, defsW * cap - ((Game.waveLedgerPoints ? (Game.waveLedgerPoints(w) | 0) : pts))) };
      }
      ledger.perTypeCap = cap;
      snap.ledger = ledger;
    } catch (e) { snap.ledger = null; err('ledger', e); }
    try {
      const log = ((Game.state || {}).feastLog || []);
      snap.feastLog = { total: log.length, major: log.filter(function (f) { return f && ((f.quality | 0) >= 1); }).length };
    } catch (e) { snap.feastLog = null; err('feastLog', e); }
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
