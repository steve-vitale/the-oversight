// trustgrowth-instrument-20261109.js — trust-growth + polity probe
// instrument, v3 (arm sim-answermail-a, run fleshout-20261110T0615Z).
// Scripts only, zero src/js. A daily link-trust recorder: per seed, per
// link, the trust trajectory by day, age, seasoned?, polity membership,
// plus EVERY trust-change event attributed by cause.
//
// v3 (this arm, prereg amendment 4): the _trustGain wrap used to log
// the RETURN value of Game._trustGain as `applied` — but _trustGain
// returns the REQUESTED amount even when the 100-cap absorbs it
// (hierarchy.js: `link.trust = Math.min(100, link.trust + n); return n;`),
// so a +1 landing on a capped link logged a phantom +1 with no setter
// twin (the setter skips no-op writes). The confirm band hit this 6
// times and the analyzer correctly flagged 6 unattributed downs. The
// wrap now records the ACTUAL move (trust after − trust before) as
// `applied` and keeps the return value as `returned` for audit; a
// cap-absorbed gain logs applied 0 and the analyzer already drops
// applied-0 wraps (blockedGains) instead of counting a phantom event.
//
// v1 wrapped Game._trustGain only; the v1 pilot proved that premise
// false — comms.js (aid), safetynets.js (aid offers/begs) and
// titans.js write link.trust DIRECTLY, bypassing the choke. v2
// therefore intercepts the property itself: at every daily snapshot
// each link object gets a trust getter/setter (Object.defineProperty,
// configurable, enumerable, value in a closure; a WeakSet keeps
// installation idempotent). Every write is logged as one event:
// {seq, day, linkId, other, old, new, delta, stack, via:'setter'}.
// The setter never alters a value. Known gap, stated in the prereg
// amendment: a write landing between a link's formation and its first
// snapshot is not setter-logged; the _trustGain wrap below still
// catches choke gains in that window.
//
// The _trustGain wrap is kept (cross-check + gap cover), now also
// stamping seq. The analyzer dedupes wrap vs setter events. A global
// sequence counter increments on every logged event; each snapshot
// records seq, so the analyzer attributes events to the exact
// snapshot interval (prevSnap.seq, curSnap.seq] — no day arithmetic,
// no phase assumptions (settlement gains log under day d but first
// appear in the snapshot of day d+1).
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
  const t = { daily: [], gains: [], events: [], instrumentErrors: [] };
  const seenHistory = {}; // linkId -> Set of 'day|kind|note' tuples already reported
  const instrumentedLinks = new WeakSet();
  let seq = 0;
  let origTrustGain = null;
  let gainWrapped = false;

  function stackFrames(skip) {
    try { return (new Error().stack || '').split('\n').slice(skip, skip + 6).join(' | '); } catch (e) { return ''; }
  }

  function instrumentLink(l) {
    try {
      if (!l || typeof l !== 'object' || instrumentedLinks.has(l)) return;
      if (!('trust' in l)) return;
      let cur = l.trust;
      instrumentedLinks.add(l);
      Object.defineProperty(l, 'trust', {
        configurable: true, enumerable: true,
        get: function () { return cur; },
        set: function (v) {
          try {
            if (v !== cur) {
              const ev = {
                seq: ++seq, day: dayOf(Game), linkId: l.id || null, other: otherOf(Game, l),
                old: cur, new: v, delta: v - cur,
                stack: stackFrames(2), via: 'setter',
              };
              cur = v;
              t.events.push(ev);
            } else { cur = v; }
          } catch (e) { try { cur = v; } catch (e2) {} t.instrumentErrors.push('setter-log: ' + String(e.message).slice(0, 80)); }
        },
      });
    } catch (e) { t.instrumentErrors.push('instrumentLink: ' + String(e.message).slice(0, 80)); }
  }

  try {
    if (typeof Game._trustGain === 'function') {
      origTrustGain = Game._trustGain;
      const selfGame = Game;
      Game._trustGain = function trustGrowthTrustGain(link, n) {
        const stack = stackFrames(2);
        let returned = 0, before = null, after = null;
        try { before = link ? link.trust : null; } catch (e) { before = null; }
        try { returned = origTrustGain.call(selfGame, link, n); } catch (e) { t.instrumentErrors.push('_trustGain-call: ' + String(e.message).slice(0, 80)); }
        try { after = link ? link.trust : null; } catch (e) { after = null; }
        // v3: applied is the ACTUAL trust move, not the return value
        // (the return lies at the 100 cap). Fall back to the return
        // only if the link's trust could not be read.
        const actual = (typeof before === 'number' && typeof after === 'number') ? (after - before) : (returned | 0);
        try {
          t.gains.push({
            seq: ++seq, day: dayOf(selfGame),
            linkId: (link && link.id) || null,
            other: otherOf(selfGame, link || {}),
            requested: (n | 0),
            applied: actual,
            returned: (returned | 0),
            stack: stack, via: 'trustgain-wrap',
          });
        } catch (e) { t.instrumentErrors.push('_trustGain-log: ' + String(e.message).slice(0, 80)); }
        return returned;
      };
      gainWrapped = true;
    } else {
      t.instrumentErrors.push('_trustGain-missing: Game._trustGain is not a function');
    }
  } catch (e) { t.instrumentErrors.push('_trustGain-wrap: ' + String(e.message).slice(0, 80)); }

  function snapshot() {
    const snap = { day: dayOf(Game), seq: seq };
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
      ls.forEach(instrumentLink);
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
    // The trust setters stay installed: restoring the plain value would
    // lose the link's live trust. They are inert post-run (no more
    // writes), and the links are never serialized by the harness.
  }

  return { t: t, snapshot: snapshot, uninstall: uninstall, gainWrapped: gainWrapped, instrumentLink: instrumentLink };
}

module.exports = { install: install, otherOf: otherOf };
