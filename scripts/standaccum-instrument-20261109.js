// standaccum-instrument-20261109.js — standing-accumulation diag instrument
// (arm sim-standaccum-b, run fleshout-loop-b-20261109T1830Z). Scripts only,
// zero src/js. Daily snapshots of the standing breakdown (raw + gated),
// the ledger points per wave, the FULL active link roll with the reason
// each link does or does not count, the feast log, and waveCombatReadiness(5).
// The engine records no separate standing-event log, so gain/loss events
// are derived by the analyzer from consecutive-snapshot transitions —
// that derivation is stated in the prereg, not hidden.
// Usage: const INST = require('./standaccum-instrument-20261109');
//   const inst = INST.install(Game); inst.snapshot(); ... inst.uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function otherOf(Game, l) {
  try { if (typeof Game._linkOther === 'function') return Game._linkOther(l, 'haven'); } catch (e) {}
  if (l.primary === 'haven') return l.subordinate || null;
  if (l.subordinate === 'haven') return l.primary || null;
  if (l.a === 'haven') return l.b || null;
  if (l.b === 'haven') return l.a || null;
  return null;
}

function linkKey(l, other) {
  return (other || '?') + '|' + (l.kind || '?') + '|' + (l.primary || '') + '>' + (l.subordinate || '') + '|' + (l.a || '') + ':' + (l.b || '');
}

function snapshotLink(Game, l) {
  const day = dayOf(Game);
  const other = otherOf(Game, l);
  let seasoned = false, regional = false;
  try { seasoned = (typeof Game._linkSeasoned === 'function') ? !!Game._linkSeasoned(l, !!l.conquered) : false; } catch (e) { seasoned = false; }
  try { regional = (typeof Game._linkRegionalPlus === 'function') ? !!Game._linkRegionalPlus(l) : false; } catch (e) { regional = false; }
  const age = day - ((l.day || 0) | 0);
  let reason = 'counts';
  if (l.status !== 'active') reason = 'inactive';
  else if (!seasoned) reason = (age < 30) ? 'too-young' : 'low-trust';
  else if (!regional) reason = 'not-regional';
  return {
    key: linkKey(l, other), other: other, kind: l.kind || null,
    primary: l.primary || null, subordinate: l.subordinate || null,
    a: l.a || null, b: l.b || null,
    age: age, trust: (l.trust || 0) | 0, conquered: !!l.conquered,
    status: l.status || null, seasoned: seasoned, regional: regional, reason: reason,
  };
}

function install(Game) {
  const t = { daily: [], instrumentErrors: [] };
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
      snap.standing = Game.villageStanding ? Game.villageStanding() : null;
      if (snap.standing) {
        snap.standing.raw = snap.standing.total;
        snap.standing.plentyGate = Math.min(snap.standing.plenty | 0, 100);
      }
    } catch (e) { snap.standing = null; t.instrumentErrors.push('standing: ' + String(e.message).slice(0, 80)); }
    try { snap.gated = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) { snap.gated = null; t.instrumentErrors.push('gated: ' + String(e.message).slice(0, 80)); }
    try {
      const cfg = Game.standingCfg ? Game.standingCfg() : null;
      snap.cfg = cfg ? { t4: cfg.t4, t5: cfg.t5, warPerKill: cfg.warPerKill, diplomacyPerLink: cfg.diplomacyPerLink, plentyPerFeast: cfg.plentyPerFeast, plentyCapT5: cfg.plentyCapT5 } : null;
    } catch (e) { snap.cfg = null; }
    try {
      const led = {};
      [3, 4, 5].forEach(function (w) { led[w] = Game.waveLedgerPoints ? (Game.waveLedgerPoints(w) | 0) : null; });
      snap.ledger = led;
      try {
        const L = (typeof Game.ledgerState === 'function') ? Game.ledgerState() : {};
        const perType = {};
        [3, 4, 5].forEach(function (w) { perType[w] = ((L[w] || {}).perType) || {}; });
        snap.ledgerPerType = perType;
      } catch (e) { snap.ledgerPerType = null; }
    } catch (e) { snap.ledger = null; t.instrumentErrors.push('ledger: ' + String(e.message).slice(0, 80)); }
    try {
      const ls = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
      snap.links = ls.filter(function (l) { return l && l.status === 'active'; }).map(function (l) { return snapshotLink(Game, l); });
      snap.linkTotal = ls.length;
    } catch (e) { snap.links = null; snap.linkTotal = null; t.instrumentErrors.push('links: ' + String(e.message).slice(0, 80)); }
    try {
      const log = ((Game.state || {}).feastLog || []).slice();
      snap.feasts = {
        total: log.length,
        qualifying: log.filter(function (f) { return ((f && f.quality) | 0) >= 1; }).length,
        subquality: log.filter(function (f) { return ((f && f.quality) | 0) < 1; }).length,
        entries: log.map(function (f) { return { day: (f && f.day) || 0, quality: (f && f.quality) | 0 }; }),
      };
    } catch (e) { snap.feasts = null; t.instrumentErrors.push('feasts: ' + String(e.message).slice(0, 80)); }
    try { snap.readiness5 = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null; } catch (e) { snap.readiness5 = null; t.instrumentErrors.push('readiness5: ' + String(e.message).slice(0, 80)); }
    try { snap.w4faced = (typeof Game.waveEngaged === 'function') ? (Game.waveEngaged(4) > 0) : null; } catch (e) { snap.w4faced = null; }
    try { snap.peakWave = (typeof Game._standingPeakWave === 'function') ? Game._standingPeakWave() : null; } catch (e) { snap.peakWave = null; }
    try { snap.standingLine = (typeof Game.standingLine === 'function') ? Game.standingLine() : null; } catch (e) { snap.standingLine = null; }
    t.daily.push(snap);
    return snap;
  }
  return { t: t, snapshot: snapshot, uninstall: function () {} };
}

module.exports = { install: install, snapshotLink: snapshotLink, linkKey: linkKey };
