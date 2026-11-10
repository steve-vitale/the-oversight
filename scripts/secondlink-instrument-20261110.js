// secondlink-instrument-20261110.js — second-link road recorder
// (arm sim-secondlink-a, run fleshout-20261110T0415Z). Scripts only,
// zero src/js. Records link-raise stagings on the road so the band
// can answer: are second raises never staged, or staged and lost?
//
// Two independent records of the same lifecycle, cross-checked by
// the analyzer:
//   (1) DAILY SNAPSHOTS: pending raises (state.village.linkRaises),
//       decided/expired record (state.village.linkRaiseState), the
//       full active link roll (standaccum snapshotLink), a per-day
//       raise-eligibility census (per roster villager: alive,
//       person-trust, build_standing weight, villages known via
//       villageLoreOf, known-but-unlinked villages, cooldown
//       villages, has-pending-raise, talk-request-blocked, eligible
//       boolean + blocking-gate list), the known-village roll,
//       scholar lore keys, the day's bondRoll('linktick') lottery
//       value (read-only hash roll — no RNG consumed), scaleRank /
//       standing total / polityOf('haven') / pendingCounter /
//       pendingAccord.
//   (2) METHOD WRAPS (call original, return its value unchanged,
//       record only — never alter state, never consume RNG):
//       stageLinkRaise / acceptLinkRaise / declineLinkRaise /
//       proposeLink (return class: formed / counter /
//       declined-null, plus whether a link appeared in the roll) /
//       npcLinkRaiseTick (call count).
//   (3) tele('bond_proposed') capture via a LAZY wrap installed on
//       the first daily call: the harness installs its own Game.tele
//       wrapper inside runDays, AFTER the instrument installs — so
//       the instrument chains onto the live wrapper at first daily,
//       not at install time. The wrap calls the live tele and
//       returns its value.
//
// The analyzer reconciles (1) vs (2)/(3): every link-kind tele
// event must match a snapshot transition (staged = appears in
// linkRaises; accepted/refused/expired = leaves linkRaises with
// the matching linkRaiseState entry). Irreconcilable events are
// listed, not hidden.
//
// Usage: const INST = require('./secondlink-instrument-20261110');
//   const inst = INST.install(Game); inst.snapshot(); ...
//   inst.installTeleLazy(); // called from the policy daily wrapper
//   ... inst.uninstall();
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

function install(Game) {
  const t = {
    daily: [], bondEvents: [], stageCalls: [], acceptCalls: [],
    declineCalls: [], proposeCalls: [], linkTickCalls: 0,
    instrumentErrors: [],
  };
  let teleWrapped = false;
  let origTele = null;
  const wrapped = {}; // name -> original fn (for uninstall)

  function stackFrames(skip) {
    try { return (new Error().stack || '').split('\n').slice(skip, skip + 5).join(' | '); } catch (e) { return ''; }
  }

  function linkKeys(Game) {
    try {
      const ls = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
      return ls.map(function (l) { return SA.snapshotLink(Game, l).key; });
    } catch (e) { return null; }
  }

  // Wrap a Game method: call the original first, record, return its
  // value unchanged. Any failure in the RECORDING path is logged,
  // never thrown into the game.
  function wrapMethod(name, record) {
    try {
      const orig = Game[name];
      if (typeof orig !== 'function') { t.instrumentErrors.push(name + '-missing: not a function'); return; }
      wrapped[name] = orig;
      const selfGame = Game;
      Game[name] = function () {
        let r, threw = null;
        try { r = orig.apply(selfGame, arguments); } catch (e) { threw = e; }
        try { record(Array.prototype.slice.call(arguments), r, threw); } catch (e) { t.instrumentErrors.push(name + '-record: ' + String(e.message).slice(0, 80)); }
        if (threw) throw threw;
        return r;
      };
    } catch (e) { t.instrumentErrors.push(name + '-wrap: ' + String(e.message).slice(0, 80)); }
  }

  wrapMethod('stageLinkRaise', function (args, r) {
    t.stageCalls.push({
      day: dayOf(Game), vid: args[0] || null, villageId: args[1] || null,
      staged: !!(r && r.villageId), stack: stackFrames(3),
    });
  });
  wrapMethod('acceptLinkRaise', function (args, r) {
    t.acceptCalls.push({ day: dayOf(Game), vid: args[0] || null, ok: !!(r && r.ok), villageId: (r && r.villageId) || null });
  });
  wrapMethod('declineLinkRaise', function (args, r) {
    t.declineCalls.push({ day: dayOf(Game), vid: args[0] || null, ok: !!(r && r.ok) });
  });
  wrapMethod('proposeLink', function (args, r) {
    let cls = 'declined-null';
    if (r === 'counter') cls = 'counter';
    else if (r && typeof r === 'object') cls = 'formed';
    t.proposeCalls.push({
      day: dayOf(Game), villageId: args[0] || null, outcome: cls,
      stack: stackFrames(3),
    });
  });
  wrapMethod('npcLinkRaiseTick', function () { t.linkTickCalls++; });

  // Lazy tele capture: chain onto whatever Game.tele is NOW (the
  // harness wrapper, installed by runDays before the first daily).
  function installTeleLazy() {
    if (teleWrapped) return;
    try {
      const cur = Game.tele;
      if (typeof cur !== 'function') { t.instrumentErrors.push('tele-missing: Game.tele is not a function at first daily'); teleWrapped = true; return; }
      origTele = cur;
      const selfGame = Game;
      Game.tele = function (type, data) {
        let r;
        try { r = origTele.apply(selfGame, arguments); } catch (e) { throw e; }
        try {
          if (type === 'bond_proposed' && data && typeof data === 'object') {
            t.bondEvents.push({
              day: dayOf(selfGame),
              initiator: data.initiator || null, target: data.target || null,
              kind: data.kind || null, outcome: data.outcome || null,
              chance: (data.chance != null ? data.chance : null),
              reason: data.reason ? String(data.reason).slice(0, 200) : null,
            });
          }
        } catch (e) { t.instrumentErrors.push('tele-record: ' + String(e.message).slice(0, 80)); }
        return r;
      };
      teleWrapped = true;
    } catch (e) { t.instrumentErrors.push('tele-wrap: ' + String(e.message).slice(0, 80)); teleWrapped = true; }
  }

  function snapshot() {
    const snap = { day: dayOf(Game) };
    try { snap.scholarId = Game.villagerId || null; } catch (e) { snap.scholarId = null; }
    try { snap.standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) { snap.standing = null; }
    try { snap.scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { snap.scaleRank = null; }
    try {
      const p = Game.polityOf ? Game.polityOf('haven') : null;
      snap.polity = p ? { shape: p.shape || null, size: (p.size != null ? p.size : null), villages: Array.isArray(p.villages) ? p.villages.slice() : null } : null;
    } catch (e) { snap.polity = null; t.instrumentErrors.push('polity: ' + String(e.message).slice(0, 80)); }
    try {
      const st = Game.state || {};
      snap.pending = { counter: !!st.pendingCounter, accord: !!st.pendingAccord, national: !!st.pendingNational, global: !!st.pendingGlobal };
    } catch (e) { snap.pending = null; }
    // Pending raises + decided/expired record, verbatim (small).
    try {
      const lr = ((Game.state || {}).village || {}).linkRaises || {};
      snap.pendingRaises = Object.keys(lr).map(function (vid) {
        const p = lr[vid] || {};
        return { vid: vid, villageId: p.villageId || null, day: (p.day != null ? p.day : null), line: p.line ? String(p.line).slice(0, 300) : null };
      });
    } catch (e) { snap.pendingRaises = null; t.instrumentErrors.push('pendingRaises: ' + String(e.message).slice(0, 80)); }
    try {
      const lrs = ((Game.state || {}).village || {}).linkRaiseState || {};
      snap.raiseState = Object.keys(lrs).map(function (k) {
        const r = lrs[k] || {};
        return { key: k, day: (r.day != null ? r.day : null), outcome: r.outcome || null };
      });
    } catch (e) { snap.raiseState = null; t.instrumentErrors.push('raiseState: ' + String(e.message).slice(0, 80)); }
    // Active link roll.
    try {
      const ls = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
      snap.links = ls.map(function (l) { return SA.snapshotLink(Game, l); });
      snap.linkTotal = ls.length;
    } catch (e) { snap.links = null; snap.linkTotal = null; t.instrumentErrors.push('links: ' + String(e.message).slice(0, 80)); }
    // Known-village roll + scholar lore.
    try {
      const ovs = ((Game.state || {}).otherVillages || []);
      snap.villages = ovs.map(function (ov) {
        let linked = false;
        try { linked = !!(Game.linkWith && Game.linkWith(ov.id)); } catch (e) {}
        return { id: ov.id, name: ov.name || null, opinion: (ov.opinion != null ? ov.opinion : null), linked: linked };
      });
    } catch (e) { snap.villages = null; t.instrumentErrors.push('villages: ' + String(e.message).slice(0, 80)); }
    try {
      const lore = (typeof Game.villageLoreOf === 'function') ? (Game.villageLoreOf(snap.scholarId) || {}) : {};
      snap.scholarLore = Object.keys(lore);
    } catch (e) { snap.scholarLore = null; t.instrumentErrors.push('scholarLore: ' + String(e.message).slice(0, 80)); }
    // The day's link-raise lottery value (read-only hash roll).
    try { snap.linkTickRoll = (typeof Game.bondRoll === 'function') ? Game.bondRoll('linktick', snap.day) : null; } catch (e) { snap.linkTickRoll = null; }
    // Per-villager raise-eligibility census.
    try {
      const v = (Game.state || {}).village || {};
      const roster = (v.roster || []).slice();
      const trust = v.trust || {};
      const lrs = v.linkRaiseState || {};
      const lr = v.linkRaises || {};
      const treq = v.talkRequests || {};
      snap.raisers = roster.map(function (vid) {
        const rec = { vid: vid };
        try {
          const p = (typeof Game.getPerson === 'function') ? Game.getPerson(vid) : null;
          rec.alive = !(p && p.dead) && !(typeof Game.deadMarked === 'function' && Game.deadMarked(vid));
        } catch (e) { rec.alive = null; }
        rec.isScholar = (vid === snap.scholarId);
        rec.trust = (trust[vid] != null ? trust[vid] : null);
        try {
          const w = (typeof Game.vgoalWeights === 'function') ? (Game.vgoalWeights(vid) || {}) : {};
          rec.buildStanding = (w.build_standing != null ? w.build_standing : null);
        } catch (e) { rec.buildStanding = null; }
        try {
          const lore = (typeof Game.villageLoreOf === 'function') ? (Game.villageLoreOf(vid) || {}) : {};
          rec.lore = Object.keys(lore);
        } catch (e) { rec.lore = []; }
        rec.unlinkedKnown = (rec.lore || []).filter(function (id) {
          try { return !(Game.linkWith && Game.linkWith(id)); } catch (e) { return true; }
        });
        // Cooldown villages for this raiser: keys are bondKey(vid, village).
        rec.cooldown = Object.keys(lrs).filter(function (k) {
          try {
            const r = lrs[k] || {};
            if (snap.day - ((r.day || 0)) >= 14) return false;
            const parts = String(k).split('|');
            return parts.indexOf(String(vid)) !== -1;
          } catch (e) { return false; }
        }).map(function (k) {
          const parts = String(k).split('|');
          return parts[0] === String(vid) ? parts[1] : parts[0];
        });
        rec.hasPending = !!lr[vid];
        try { const tq = treq[vid]; rec.talkBlocked = !!(tq && !tq.delivered); } catch (e) { rec.talkBlocked = null; }
        // Gate list, in stageLinkRaise order.
        const gates = [];
        if (!rec.alive) gates.push('dead');
        if (rec.isScholar) gates.push('scholar');
        if (rec.trust == null || rec.trust < 20) gates.push('trust<20');
        if (rec.buildStanding == null || rec.buildStanding < 1) gates.push('no-build-standing');
        if (!rec.lore.length) gates.push('no-lore');
        else if (!rec.unlinkedKnown.length) gates.push('all-known-linked');
        else {
          const open = rec.unlinkedKnown.filter(function (id) { return rec.cooldown.indexOf(id) === -1; });
          if (!open.length) gates.push('all-open-cooldown');
        }
        if (rec.hasPending) gates.push('has-pending');
        if (rec.talkBlocked) gates.push('talk-blocked');
        rec.gates = gates;
        rec.eligible = gates.length === 0;
        return rec;
      });
      snap.eligibleRaisers = snap.raisers.filter(function (r) { return r.eligible; }).length;
    } catch (e) { snap.raisers = null; snap.eligibleRaisers = null; t.instrumentErrors.push('raisers: ' + String(e.message).slice(0, 80)); }
    t.daily.push(snap);
    return snap;
  }

  function uninstall() {
    try { if (teleWrapped && origTele) Game.tele = origTele; } catch (e) { t.instrumentErrors.push('uninstall-tele: ' + String(e.message).slice(0, 80)); }
    Object.keys(wrapped).forEach(function (name) {
      try { Game[name] = wrapped[name]; } catch (e) { t.instrumentErrors.push('uninstall-' + name + ': ' + String(e.message).slice(0, 80)); }
    });
  }

  return { t: t, snapshot: snapshot, installTeleLazy: installTeleLazy, uninstall: uninstall, linkKeys: linkKeys };
}

module.exports = { install: install, otherOf: otherOf };
