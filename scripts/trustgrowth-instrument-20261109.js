// trustgrowth-instrument-20261109.js — trust-growth + polity probe
// instrument (arm sim-trustgrowth-b, run fleshout-loop-b-20261110T0122Z).
// Scripts only, zero src/js. A daily link-trust recorder: per seed, per
// link, the trust trajectory by day, age, seasoned?, polity membership,
// plus trust-change events attributed by cause. Gains are captured live
// by wrapping Game._trustGain (the single choke point for gains —
// hierarchy.js header); losses are attributed by the analyzer from the
// link's own history notes (link.history, capped at 40 and shifting,
// so the instrument snapshots NEW entries each day and nothing is lost).
// The wrap records, never alters: it calls the original and returns its
// value. Uninstall restores the original.
// Usage: const INST = require('./trustgrowth-instrument-20261109');
//   const inst = INST.install(Game); inst.snapshot(); ... inst.uninstall();
'use strict';
const SA = require('./standaccum-instrument-20261109');

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function otherOf(Game, l) {
  try { if (typeof Game._linkOther === 'function') return Game._linkOther(l, 'haven'); } catch (e) {}
  if (l.primary === 'haven') return l.subordinate || null;
  if (l.subordinate === 'haven') return l.primary || null;
  if (l.a === 'haven') return l.b || null;
  if (l.b === 'haven') return l.a || null;
  return null;
}

function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce(function (t, i) { return t + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) { return null; }
}

function politySummary(Game, fn) {
  try {
    const p = (typeof Game[fn] === 'function') ? Game[fn]() : null;
    if (!p) return null;
    return { shape: p.shape || null, size: (p.size != null ? p.size : null), villages: Array.isArray(p.villages) ? p.villages.slice() : null };
  } catch (e) { return { error: String(e.message).slice(0, 80) }; }
}

function install(Game) {
  const t = { daily: [], gains: [], instrumentErrors: [] };
  const seenHistory = {}; // linkId -> Set of 'day|kind|note' tuples already reported
  let origTrustGain = null;
  let gainWrapped = false;
  try {
    if (typeof Game._trustGain === 'function') {
      origTrustGain = Game._trustGain;
      const selfGame = Game;
      Game._trustGain = function trustGrowthTrustGain(link, n) {
        let stack = '';
        try { stack = (new Error().stack || '').split('\n').slice(2, 8).join(' | '); } catch (e) { stack = ''; }
        let applied = 0;
        try { applied = origTrustGain.call(selfGame, link, n); } catch (e) { t.instrumentErrors.push('_trustGain-call: ' + String(e.message).slice(0, 80)); }
        try {
          t.gains.push({
            day: dayOf(selfGame),
            linkId: (link && link.id) || null,
            other: otherOf(selfGame, link || {}),
            requested: (n | 0),
            applied: (applied | 0),
            stack: stack,
          });
        } catch (e) { t.instrumentErrors.push('_trustGain-log: ' + String(e.message).slice(0, 80)); }
        return applied;
      };
      gainWrapped = true;
    } else {
      t.instrumentErrors.push('_trustGain-missing: Game._trustGain is not a function');
    }
  } catch (e) { t.instrumentErrors.push('_trustGain-wrap: ' + String(e.message).slice(0, 80)); }

  function snapshot() {
    const snap = { day: dayOf(Game) };
    try { snap.pantryKcal = pantryKcal(Game); } catch (e) { snap.pantryKcal = null; }
    try {
      snap.standing = Game.villageStanding ? Game.villageStanding() : null;
      if (snap.standing) snap.standing.raw = snap.standing.total;
    } catch (e) { snap.standing = null; t.instrumentErrors.push('standing: ' + String(e.message).slice(0, 80)); }
    try { snap.gated = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) { snap.gated = null; }
    try {
      let lead = null;
      try { const p = Game.polityOf ? Game.polityOf('haven') : null; lead = p ? { shape: p.shape || null, size: (p.size != null ? p.size : null), villages: Array.isArray(p.villages) ? p.villages.slice() : null } : null; } catch (e) { lead = { error: String(e.message).slice(0, 80) }; }
      snap.polity = {
        haven: politySummary(Game, '_havenPolity'),
        lead: lead,
        belong: politySummary(Game, '_belongPolity'),
        covenant: politySummary(Game, '_covenantPolity'),
        trade: politySummary(Game, '_tradePolity'),
      };
    } catch (e) { snap.polity = snap.polity || null; t.instrumentErrors.push('polity: ' + String(e.message).slice(0, 80)); }
    try { snap.scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { snap.scaleRank = null; }
    try { snap.nationalLive = !!(Game.state || {}).nationalLive; } catch (e) { snap.nationalLive = null; }
    try {
      const st = Game.state || {};
      snap.pending = { counter: !!st.pendingCounter, accord: !!st.pendingAccord, national: !!st.pendingNational, global: !!st.pendingGlobal };
    } catch (e) { snap.pending = null; }
    try {
      const ls = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
      snap.links = ls.map(function (l) {
        const base = SA.snapshotLink(Game, l);
        let seasonedPolity = false;
        try { seasonedPolity = (typeof Game._linkSeasoned === 'function') ? !!Game._linkSeasoned(l, !!l.conquered, true) : false; } catch (e) { seasonedPolity = false; }
        let subPantry = null;
        try { const sov = (typeof Game._otherVillage === 'function') ? Game._otherVillage(otherOf(Game, l)) : null; subPantry = sov ? Math.max(0, Math.round(sov.pantryKcal || 0)) : null; } catch (e) { subPantry = null; }
        const lid = l.id || base.key;
        if (!seenHistory[lid]) seenHistory[lid] = {};
        const hist = Array.isArray(l.history) ? l.history : [];
        const historyNew = [];
        hist.forEach(function (h) {
          const tuple = ((h && h.day) || 0) + '|' + ((h && h.kind) || '') + '|' + ((h && h.note) || '');
          if (!seenHistory[lid][tuple]) { seenHistory[lid][tuple] = true; historyNew.push({ day: (h && h.day) || 0, kind: (h && h.kind) || null, note: String((h && h.note) || '').slice(0, 400) }); }
        });
        return Object.assign(base, {
          id: l.id || null,
          seasonedPolity: seasonedPolity,
          arrears: (l.arrears || 0) | 0,
          tributePaidWeek: (l.tributePaidWeek != null ? l.tributePaidWeek : null),
          tributePaidKcal: (l.tributePaidKcal != null ? l.tributePaidKcal : null),
          tributeKcalPerWeek: (l.tributeKcalPerWeek != null ? l.tributeKcalPerWeek : null),
          lastKeptDay: (l.lastKeptDay != null ? l.lastKeptDay : null),
          mourningUntil: (l.mourningUntil != null ? l.mourningUntil : null),
          tendedWeek: (l.tendedWeek != null ? l.tendedWeek : null),
          theirSpeaker: l.theirSpeaker || null,
          subPantryKcal: subPantry,
          historyNew: historyNew,
          historyLen: hist.length,
        });
      });
      snap.linkTotal = ls.length;
      snap.activeLinks = snap.links.filter(function (l) { return l.status === 'active'; }).length;
    } catch (e) { snap.links = null; snap.linkTotal = null; t.instrumentErrors.push('links: ' + String(e.message).slice(0, 80)); }
    t.daily.push(snap);
    return snap;
  }

  function uninstall() {
    try { if (gainWrapped && origTrustGain) Game._trustGain = origTrustGain; } catch (e) { t.instrumentErrors.push('uninstall: ' + String(e.message).slice(0, 80)); }
  }

  return { t: t, snapshot: snapshot, uninstall: uninstall, gainWrapped: gainWrapped };
}

module.exports = { install: install, otherOf: otherOf };
