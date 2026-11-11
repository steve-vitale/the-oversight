// standing199-instrument-20261110.js — standing-199 plateau read instrument
// (arm sim-standing199-a, run fleshout-20261111T0215Z). Scripts only,
// zero src/js. Daily snapshots of the standing breakdown (raw + gated +
// plenty-capped), the ledger points per wave, the FULL active link roll
// with the reason each link does or does not count, the feast log, and
// waveCombatReadiness(4) AND (5) with per-bar counts vs demand, plus the
// living wave-4+ killer vids each day (for veteran-death derivation and
// the near-miss structure). The engine records no separate standing-event
// log, so gain/loss events and hold kinds are derived by the analyzer
// from consecutive-snapshot transitions — that derivation is stated in
// the prereg, not hidden. Hold kinds recompute from snapshot fields by
// the same logic as villageStandingTotal() (standing.js:177-186):
//   cap    := raw >= 200 && capped < 200
//   defer5 := capped >= 200 && !rd5.ready
//   defer4 := raw >= 100 && !rd4.ready   (peak < 4; snapshot carries peak)
// cap and defer5 are mutually exclusive on one day (defer5 needs
// capped >= 200, cap needs capped < 200), so a 199-pin day has exactly
// one first-pin kind; mixed-199 is a day-split across the run.
// Usage: const INST = require('./standing199-instrument-20261110');
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

// livingVeteranVids(Game): distinct vids with a wave-4+ kill in
// state.waveKillLog who are alive right now (scholar counts as living:
// the scholar is the current adventurer). Mirrors the veterans bar's
// own read in waveCombatReadiness (standing.js:283-302, default
// living-only shape) so the instrument and the gate can never drift.
function livingVeteranVids(Game) {
  const out = [];
  try {
    const log = ((Game.state || {}).waveKillLog) || [];
    const scholarId = Game.villagerId || null;
    const seen = {};
    for (let i = 0; i < log.length; i++) {
      const e = log[i];
      if (!e || !e.by || ((e.w | 0) < 4)) continue;
      if (seen[e.by]) continue;
      let alive = false;
      if (e.by === scholarId) alive = true;
      else {
        try { const p = (typeof Game.getPerson === 'function') ? Game.getPerson(e.by) : (typeof Game.vpOf === 'function' ? Game.vpOf(e.by) : null); alive = !!(p && !p.dead); } catch (err) { alive = false; }
      }
      if (alive) { seen[e.by] = true; out.push(e.by); }
    }
  } catch (e) { /* fail-closed: empty list; the readiness bar is the authority */ }
  out.sort();
  return out;
}

// holdKind(snap): recompute the hold kind for one snapshot from its own
// fields, by the villageStandingTotal() logic. Returns 'cap' | 'defer5' |
// 'defer4' | 'none'. Peak-gated: no hold applies once the peak ratchet
// has released that wave.
function holdKind(snap) {
  try {
    if (!snap || !snap.standing) return 'none';
    const peak = (snap.peakWave | 0) || 0;
    const raw = (snap.standing.total | 0) || 0;
    const capped = (snap.capped != null) ? (snap.capped | 0) : null;
    if (peak < 5 && capped != null && raw >= 200 && capped < 200) return 'cap';
    if (peak < 5 && capped != null && capped >= 200 && snap.readiness5 && !snap.readiness5.ready) return 'defer5';
    if (peak < 4 && raw >= 100 && snap.readiness4 && !snap.readiness4.ready) return 'defer4';
    return 'none';
  } catch (e) { return 'none'; }
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
      if (snap.standing) snap.standing.raw = snap.standing.total;
    } catch (e) { snap.standing = null; t.instrumentErrors.push('standing: ' + String(e.message).slice(0, 80)); }
    try { snap.capped = Game.standingPlentyCappedTotal ? Game.standingPlentyCappedTotal() : null; } catch (e) { snap.capped = null; t.instrumentErrors.push('capped: ' + String(e.message).slice(0, 80)); }
    try { snap.gated = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) { snap.gated = null; t.instrumentErrors.push('gated: ' + String(e.message).slice(0, 80)); }
    try {
      const cfg = Game.standingCfg ? Game.standingCfg() : null;
      snap.cfg = cfg ? { t4: cfg.t4, t5: cfg.t5, warPerKill: cfg.warPerKill, diplomacyPerLink: cfg.diplomacyPerLink, plentyPerFeast: cfg.plentyPerFeast, plentyCapT5: cfg.plentyCapT5, readyDemand: cfg.readyDemand } : null;
    } catch (e) { snap.cfg = null; }
    try {
      const led = {};
      [3, 4, 5].forEach(function (w) { led[w] = Game.waveLedgerPoints ? (Game.waveLedgerPoints(w) | 0) : null; });
      snap.ledger = led;
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
      };
    } catch (e) { snap.feasts = null; t.instrumentErrors.push('feasts: ' + String(e.message).slice(0, 80)); }
    try { snap.readiness4 = Game.waveCombatReadiness ? Game.waveCombatReadiness(4) : null; } catch (e) { snap.readiness4 = null; t.instrumentErrors.push('readiness4: ' + String(e.message).slice(0, 80)); }
    try { snap.readiness5 = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null; } catch (e) { snap.readiness5 = null; t.instrumentErrors.push('readiness5: ' + String(e.message).slice(0, 80)); }
    try { snap.veteranVids = livingVeteranVids(Game); } catch (e) { snap.veteranVids = null; t.instrumentErrors.push('veteranVids: ' + String(e.message).slice(0, 80)); }
    try { snap.w4faced = (typeof Game.waveEngaged === 'function') ? (Game.waveEngaged(4) > 0) : null; } catch (e) { snap.w4faced = null; }
    try { snap.peakWave = (typeof Game._standingPeakWave === 'function') ? Game._standingPeakWave() : null; } catch (e) { snap.peakWave = null; }
    try { snap.standingLine = (typeof Game.standingLine === 'function') ? Game.standingLine() : null; } catch (e) { snap.standingLine = null; }
    t.daily.push(snap);
    return snap;
  }
  return { t: t, snapshot: snapshot, uninstall: function () {} };
}

module.exports = { install: install, snapshotLink: snapshotLink, linkKey: linkKey, livingVeteranVids: livingVeteranVids, holdKind: holdKind };
