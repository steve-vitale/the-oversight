// regionalstep-instrument-20261107.js — the regional-gate recorder
// (arm sim-regionalstep-b, run fleshout-loop-b-20261107T0930Z). Scripts only,
// zero src/js. DIAG: replay the frozen staged policy and record, EVERY
// day, the full regional gate as live state — scale, links and their
// states, first-accord day, 21-day seasoning progress, networkLive,
// diplomacy totals, standing, and whether the policy ever attempts the
// diplomacy verbs at all.
//
// This module REUSES the sitstep instrument verbatim (require, not a
// copy — which itself reuses the stageally instrument) and adds:
//   (1) regional-gate fields on every daily snapshot: scale rank,
//       networkLive / networkLiveDay, _regionalPending, pendingAccord
//       (day), accordUnanswered, pendingCounter (target/day),
//       scaleRefused, the full link list (id, other village, kind,
//       status, formation day, age, trust, tribute, arrears,
//       conquered), active/broken/ever link counts, oldest active
//       link age + days-to-dawn, first-link day, first-accord day,
//       standing breakdown (villageStanding(): total / war /
//       diplomacy / plenty / links / feasts), per-village rows (id,
//       name, known-to-scholar, opinion, codex studied,
//       courtship-declined day, linked, deterministic judge score +
//       band for the as-primary and as-subordinate offers),
//       raise-eligible villager count (the npcLinkRaiseTick
//       precondition), pending link raises + decided/expired raise
//       history, and scholar talk targets per day.
//   (2) counting wraps on Game.proposeLink / answerCounter /
//       answerAccord / acceptLinkRaise / declineLinkRaise /
//       proposeCovenant / proposeTrade / raidVillage / talkTo: every
//       call recorded with day + return shape. The wraps return the
//       original result untouched and never throw into game code.
//   (3) classifyGate(row): the pure per-day classifier — the FIRST
//       failing link in the regional chain (know → courtship →
//       attempt → counter → link → gesture → seasoning → dawn).
//       Exported so the proof and the analyzer use the same rule.
//
// Pure reads + counting wraps only; zero game-state writes, zero RNG
// draws. judgeLink itself draws RNG (R() * 20 - 10), so the recorder
// NEVER calls it live: it recomputes the deterministic components
// (base 38 + rep standing/2 + opinion/2 + ally +15 + strength term /
// subordinate +10 + generosity +8) and reports the ±10 band. A
// recording failure is counted in instrumentErrors and the original
// call's result is returned untouched.
// Usage: const INST = require('./regionalstep-instrument-20261107');
//   const inst = INST.install(Game); inst.snapshot(); ... inst.finalize(); inst.uninstall();
'use strict';
const SITSTEP = require('./sitstep-instrument-20261107');

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// detJudge(Game, ov): deterministic judgeLink components for one village,
// WITHOUT calling judgeLink (it draws RNG). Returns { prim, sub } — the
// deterministic score for the as-primary and as-subordinate offers —
// or null when the inputs are unreadable. Tribute 4,000 kcal/week is the
// app.js default offer, so the as-subordinate generosity term (+8 when
// opinion >= 5) applies at that tribute.
function detJudge(Game, ov) {
  try {
    var opinion = (ov && (ov.opinion | 0)) || 0;
    var repS = 0;
    try { var rep = (typeof Game.representative === 'function') ? Game.representative() : null; if (rep) repS = (rep.standing | 0) || 0; } catch (e) {}
    var repTerm = Math.min(20, repS / 2);
    var allied = 0;
    try { if (typeof Game.isAllied === 'function' && Game.isAllied('haven', ov.id)) allied = 15; } catch (e) {}
    var ourS = 0, theirS = 0;
    try { ourS = (typeof Game.regionalStanding === 'function') ? (Game.regionalStanding() | 0) : 0; } catch (e) {}
    try { theirS = (typeof Game.villageStandingOf === 'function') ? (Game.villageStandingOf(ov.id) | 0) : 0; } catch (e) {}
    var strength = (ourS > theirS) ? Math.min(15, (ourS - theirS) / 5) : -10;
    var prim = 38 + repTerm + opinion / 2 + allied + strength;
    var sub = 38 + repTerm + opinion / 2 + allied + 10 + (opinion >= 5 ? 8 : 0);
    return { prim: Math.round(prim * 10) / 10, sub: Math.round(sub * 10) / 10 };
  } catch (e) { return null; }
}

// classifyGate(row): first failing link in the regional chain. Row fields:
//   scale ('village'|'regional'|... — snapshot scaleRankSnap), networkLive,
//   knownCount, bestDet (best deterministic judge score over known
//   villages, either offer), bestVillageId, proposeCalls,
//   acceptLinkRaiseCalls, proposeCounter (counters ever staged),
//   answerCounterCalls, pendingCounter (null or object), activeLinks,
//   everLinks, oldestActiveAge. Returns { gate, missing[] } with gate in:
//   'regional' | 'no-known-village' | 'known-no-courtship' |
//   'courtship-no-attempt' | 'counter-unanswered' | 'attempted-no-link' |
//   'link-broken' | 'link-young' | 'seasoned-no-dawn' | 'regional-unknown'.
//
// ORDER NOTE (proof-found, pre-judged fix): link state is checked BEFORE
// attempt history. A live (or ever-formed) link entails that the attempt
// happened — the chain's attempt/counter/link links are passed the moment
// a link exists, so a young link must classify 'link-young' even when the
// attempt counters read 0 (e.g. a fixture link, or a link formed through
// a path the wraps did not see). The chain order in the prereg is the
// order things must happen; the classifier reads state, and link
// existence is the strongest evidence the earlier links passed.
function classifyGate(row) {
  row = row || {};
  if (row.networkLive || (row.scale && row.scale !== 'village')) return { gate: 'regional', missing: [] };
  if (((row.knownCount | 0)) === 0) return { gate: 'no-known-village', missing: ['scholar knows no other village'] };
  if (row.bestDet == null || (row.bestDet + 10) < 35) {
    return { gate: 'known-no-courtship', missing: ['known ' + (row.knownCount | 0) + ' village(s), best deterministic judge ' + (row.bestDet == null ? '?' : row.bestDet) + ' — even at +10 RNG below the 35 counter band'] };
  }
  if (((row.everLinks | 0)) > 0) {
    if (((row.activeLinks | 0)) === 0) {
      return { gate: 'link-broken', missing: ['link(s) formed (' + (row.everLinks | 0) + ' ever) but none active — broke before the Dawn (first link day ' + (row.firstLinkDay == null ? '?' : row.firstLinkDay) + ')'] };
    }
    var age = (row.oldestActiveAge == null) ? 0 : (row.oldestActiveAge | 0);
    if (age < 21) {
      return { gate: 'link-young', missing: ['oldest active bond ' + age + 'd old (' + (row.oldestActiveId || '?') + '), ' + (21 - age) + 'd to the Dawn' + (row.accordUnanswered ? '; accord unanswered' : '') + (row.regionalPending ? '; Dawn pending' : '')] };
    }
    return { gate: 'seasoned-no-dawn', missing: ['oldest active bond ' + age + 'd old (≥21) but networkLive false' + (row.regionalPending ? ' (Dawn pending)' : ' (NO _regionalPending — _checkRegional has nothing to fire)') + (row.accordUnanswered ? ' (accord unanswered)' : '')] };
  }
  if (row.pendingCounter || (((row.proposeCounter | 0)) > 0 && ((row.answerCounterCalls | 0)) === 0)) {
    return { gate: 'counter-unanswered', missing: ['counter staged' + (row.pendingCounter ? ' with ' + (row.pendingCounter.targetId || '?') : '') + ', 0 answerCounter calls'] };
  }
  if (((row.proposeCalls | 0)) > 0 || ((row.acceptLinkRaiseCalls | 0)) > 0) {
    return { gate: 'attempted-no-link', missing: [((row.proposeCalls | 0)) + ' proposeLink call(s), ' + ((row.acceptLinkRaiseCalls | 0)) + ' accepted raise(s), 0 links ever formed'] };
  }
  return { gate: 'courtship-no-attempt', missing: ['best deterministic judge ' + row.bestDet + ' (' + (row.bestVillageId || '?') + ', ' + (row.bestOffer || '?') + ') could counter-or-better, 0 proposeLink calls, 0 accepted link raises'] };
}

function install(Game) {
  const bk = SITSTEP.install(Game);
  const t = bk.t;
  t.regionalAttempts = [];
  t._regSeq = 0;
  t._linkIdsSeen = {};
  t._firstLinkDay = null;
  t._firstAccordDay = null;
  t.talkCalls = [];

  function recordCall(call, result, targetId) {
    try {
      t._regSeq += 1;
      var shape = null;
      try {
        if (result == null) shape = 'null';
        else if (typeof result === 'string') shape = 'str:' + result;
        else if (typeof result === 'boolean') shape = 'bool:' + result;
        else if (typeof result === 'object') shape = result.id ? 'link:' + String(result.id) : 'obj';
        else shape = typeof result;
      } catch (e) { shape = '?'; }
      t.regionalAttempts.push({ seq: t._regSeq, day: dayOf(Game), call: call, target: targetId || null, result: shape });
    } catch (e) { t.instrumentErrors.push('reg-record: ' + String(e.message).slice(0, 80)); }
  }

  // --- (2) counting wraps: record the call, return the original result.
  var wrapNames = ['proposeLink', 'answerCounter', 'answerAccord', 'acceptLinkRaise', 'declineLinkRaise', 'proposeCovenant', 'proposeTrade', 'raidVillage'];
  var origFns = {};
  wrapNames.forEach(function (name) {
    try {
      var orig = Game[name];
      if (typeof orig !== 'function') { t.instrumentErrors.push('regwrap-missing-' + name); return; }
      origFns[name] = orig;
      Game[name] = function () {
        var ret;
        try { ret = orig.apply(this, arguments); }
        catch (e) { throw e; }
        try {
          var tid = null;
          try { if (arguments.length && typeof arguments[0] === 'string') tid = arguments[0]; else if (arguments.length && arguments[0] && arguments[0].targetId) tid = arguments[0].targetId; } catch (e2) {}
          recordCall(name, ret, tid);
        } catch (e2) { t.instrumentErrors.push('regwrap-record: ' + String(e2.message).slice(0, 80)); }
        return ret;
      };
    } catch (e) { t.instrumentErrors.push('regwrap-install-' + name + ': ' + String(e.message).slice(0, 80)); }
  });
  // talkTo wrap: record who the scholar talks to each day (raise-window read).
  try {
    var origTalk = Game.talkTo;
    if (typeof origTalk === 'function') {
      origFns.talkTo = origTalk;
      Game.talkTo = function (vid) {
        var ret;
        try { ret = origTalk.apply(this, arguments); }
        catch (e) { throw e; }
        try { t.talkCalls.push({ day: dayOf(Game), vid: vid || null }); } catch (e2) { t.instrumentErrors.push('talk-record: ' + String(e2.message).slice(0, 80)); }
        return ret;
      };
    } else { t.instrumentErrors.push('regwrap-missing-talkTo'); }
  } catch (e) { t.instrumentErrors.push('regwrap-install-talkTo: ' + String(e.message).slice(0, 80)); }

  function attemptCount(name) {
    try { return t.regionalAttempts.filter(function (a) { return a.call === name; }).length; } catch (e) { return 0; }
  }
  function attemptFormed() {
    try { return t.regionalAttempts.filter(function (a) { return a.call === 'proposeLink' && a.result && a.result.indexOf('link:') === 0; }).length; } catch (e) { return 0; }
  }
  function attemptCounter() {
    try { return t.regionalAttempts.filter(function (a) { return a.call === 'proposeLink' && a.result === 'str:counter'; }).length; } catch (e) { return 0; }
  }

  // --- (1) snapshot wrap: regional-gate fields on every daily row.
  var origSnapshot = bk.snapshot;
  bk.snapshot = function () {
    var snap = origSnapshot();
    try {
      var st = Game.state || {};
      var day = dayOf(Game);
      snap.scale = snap.scaleRankSnap || null;
      try { snap.networkLive = !!st.networkLive; } catch (e) { snap.networkLive = null; }
      try { snap.networkLiveDay = (st.networkLiveDay == null) ? null : (st.networkLiveDay | 0); } catch (e) { snap.networkLiveDay = null; }
      try { snap.regionalPending = !!st._regionalPending; } catch (e) { snap.regionalPending = null; }
      try { snap.pendingAccordDay = (st.pendingAccord && st.pendingAccord.day != null) ? (st.pendingAccord.day | 0) : null; } catch (e) { snap.pendingAccordDay = null; }
      try { snap.accordUnanswered = !!st.accordUnanswered; } catch (e) { snap.accordUnanswered = null; }
      try { snap.pendingCounter = st.pendingCounter ? { targetId: st.pendingCounter.targetId || null, day: (st.pendingCounter.day | 0), kind: st.pendingCounter.kind || 'link' } : null; } catch (e) { snap.pendingCounter = null; }
      try { snap.scaleRefused = !!st.scaleRefused; } catch (e) { snap.scaleRefused = null; }
      // Links, verbatim from hierarchyState().
      var links = [];
      try {
        var raw = (typeof Game.hierarchyState === 'function') ? (Game.hierarchyState() || []) : [];
        raw.forEach(function (l) {
          if (!l) return;
          var other = null;
          try {
            if (l.kind === 'covenant' || l.kind === 'trade') other = (l.a === 'haven') ? l.b : l.a;
            else other = (l.primary === 'haven') ? l.subordinate : l.primary;
          } catch (e) {}
          links.push({ id: l.id || null, other: other || null, kind: l.kind || 'link',
            status: l.status || null, day: (l.day == null) ? null : (l.day | 0),
            age: (l.day == null) ? null : (day - (l.day | 0)),
            trust: (l.trust == null) ? null : (l.trust | 0),
            tribute: (l.tributeKcalPerWeek == null) ? null : (l.tributeKcalPerWeek | 0),
            arrears: (l.arrears == null) ? null : (l.arrears | 0),
            conquered: !!l.conquered });
          try { if (l.id) t._linkIdsSeen[l.id] = true; } catch (e) {}
        });
      } catch (e) { t.instrumentErrors.push('links: ' + String(e.message).slice(0, 80)); }
      snap.links = links;
      var active = links.filter(function (l) { return l.status === 'active'; });
      var broken = links.filter(function (l) { return l.status === 'broken'; });
      snap.activeLinks = active.length;
      snap.brokenLinks = broken.length;
      snap.everLinks = Object.keys(t._linkIdsSeen).length;
      var oldest = null;
      active.forEach(function (l) { if (l.age != null && (oldest == null || l.age > oldest.age)) oldest = l; });
      snap.oldestActiveAge = oldest ? oldest.age : null;
      snap.oldestActiveId = oldest ? oldest.id : null;
      snap.oldestActiveOther = oldest ? oldest.other : null;
      snap.daysToDawn = oldest ? Math.max(0, 21 - oldest.age) : null;
      if (active.length && t._firstLinkDay == null) {
        var fd = null;
        active.forEach(function (l) { if (l.day != null && (fd == null || l.day < fd)) fd = l.day; });
        t._firstLinkDay = fd;
      }
      snap.firstLinkDay = t._firstLinkDay;
      if ((snap.pendingAccordDay != null || snap.regionalPending) && t._firstAccordDay == null) t._firstAccordDay = day;
      snap.firstAccordDay = t._firstAccordDay;
      // Standing breakdown (war / diplomacy / plenty).
      try {
        var vs = (typeof Game.villageStanding === 'function') ? Game.villageStanding() : null;
        snap.standingBreakdown = vs ? { total: (vs.total | 0), war: (vs.war | 0), diplomacy: (vs.diplomacy | 0), plenty: (vs.plenty | 0), links: (vs.links | 0), feasts: (vs.feasts | 0) } : null;
      } catch (e) { snap.standingBreakdown = null; }
      // Per-village rows: knowledge, opinion, courtship, deterministic judge.
      var villages = [];
      try {
        var ovs = st.otherVillages || [];
        ovs.forEach(function (ov) {
          if (!ov || !ov.id) return;
          var known = null;
          try { known = (typeof Game.knowsVillage === 'function') ? !!Game.knowsVillage(ov) : null; } catch (e) {}
          var dj = detJudge(Game, ov);
          var linked = null;
          try { linked = (typeof Game.linkWith === 'function') ? !!Game.linkWith(ov.id) : null; } catch (e) {}
          villages.push({ id: ov.id, name: ov.name || ov.id, known: known,
            opinion: (ov.opinion == null) ? null : (ov.opinion | 0),
            codex: !!ov._codexOpinionGiven,
            courtshipDeclined: (ov.courtshipDeclined == null) ? null : (ov.courtshipDeclined | 0),
            linked: linked,
            detPrim: dj ? dj.prim : null, detSub: dj ? dj.sub : null });
        });
      } catch (e) { t.instrumentErrors.push('villages: ' + String(e.message).slice(0, 80)); }
      snap.villages = villages;
      var knownVs = villages.filter(function (v) { return v.known; });
      snap.knownCount = knownVs.length;
      snap.knownIds = knownVs.map(function (v) { return v.id; });
      var best = null, bestOffer = null;
      knownVs.forEach(function (v) {
        [['prim', v.detPrim], ['sub', v.detSub]].forEach(function (pair) {
          if (pair[1] != null && (best == null || pair[1] > best)) { best = pair[1]; bestOffer = pair[0]; snap.bestVillageId = v.id; }
        });
      });
      snap.bestDet = best;
      snap.bestOffer = bestOffer;
      // Raise-eligible villagers (the npcLinkRaiseTick precondition).
      var eligible = 0;
      try {
        var roster = (((st.village || {}).roster) || []);
        var me = Game.villagerId;
        roster.forEach(function (vid) {
          if (!vid || vid === me) return;
          try { var p = (typeof Game.getPerson === 'function') ? Game.getPerson(vid) : null; if (p && p.dead) return; } catch (e) {}
          var tr = null;
          try { tr = (((st.village || {}).trust) || {})[vid]; } catch (e) {}
          if (tr == null || tr < 20) return;
          var w = null;
          try { w = (typeof Game.vgoalWeights === 'function') ? Game.vgoalWeights(vid) : null; } catch (e) {}
          if (!w || ((w.build_standing | 0)) < 1) return;
          var lore = null;
          try { lore = (typeof Game.villageLoreOf === 'function') ? Game.villageLoreOf(vid) : null; } catch (e) {}
          if (!lore || !Object.keys(lore).length) return;
          eligible += 1;
        });
      } catch (e) { t.instrumentErrors.push('eligible: ' + String(e.message).slice(0, 80)); }
      snap.raiseEligible = eligible;
      // Pending + decided link raises (verbatim state).
      try {
        var lr = ((st.village || {}).linkRaises) || {};
        snap.pendingRaises = Object.keys(lr).map(function (vid) {
          return { vid: vid, villageId: (lr[vid] && lr[vid].villageId) || null, day: (lr[vid] && lr[vid].day != null) ? (lr[vid].day | 0) : null };
        });
      } catch (e) { snap.pendingRaises = null; }
      try {
        var lrs = ((st.village || {}).linkRaiseState) || {};
        snap.raiseHistory = Object.keys(lrs).map(function (k) {
          return { key: k, day: (lrs[k] && lrs[k].day != null) ? (lrs[k].day | 0) : null, outcome: (lrs[k] && lrs[k].outcome) || null };
        });
      } catch (e) { snap.raiseHistory = null; }
      // Talk targets today (raise-window read).
      try { snap.talkTargetsToday = t.talkCalls.filter(function (c) { return c.day === day; }).map(function (c) { return c.vid; }); } catch (e) { snap.talkTargetsToday = null; }
      // Cumulative diplomacy-attempt counters.
      snap.proposeCalls = attemptCount('proposeLink');
      snap.proposeFormed = attemptFormed();
      snap.proposeCounter = attemptCounter();
      snap.answerCounterCalls = attemptCount('answerCounter');
      snap.answerAccordCalls = attemptCount('answerAccord');
      snap.acceptLinkRaiseCalls = attemptCount('acceptLinkRaise');
      snap.declineLinkRaiseCalls = attemptCount('declineLinkRaise');
      snap.proposeCovenantCalls = attemptCount('proposeCovenant');
      snap.proposeTradeCalls = attemptCount('proposeTrade');
      snap.raidCalls = attemptCount('raidVillage');
      try { snap.gate = classifyGate(snap).gate; } catch (e) { snap.gate = null; }
    } catch (e) { t.instrumentErrors.push('snapshot-regional: ' + String(e.message).slice(0, 80)); }
    return snap;
  };

  var origFinalize = bk.finalize;
  bk.finalize = function () {
    var out = origFinalize();
    try { out.regionalAttempts = t.regionalAttempts.slice(); } catch (e) { out.regionalAttempts = null; }
    try { out.talkCalls = t.talkCalls.slice(); } catch (e) { out.talkCalls = null; }
    try { out.firstLinkDay = t._firstLinkDay; out.firstAccordDay = t._firstAccordDay; } catch (e) {}
    return out;
  };

  var origUninstall = bk.uninstall;
  bk.uninstall = function () {
    try {
      Object.keys(origFns).forEach(function (name) { if (origFns[name]) Game[name] = origFns[name]; });
    } catch (e) {}
    try { origUninstall(); } catch (e) {}
  };
  return bk;
}

module.exports = { install: install, classifyGate: classifyGate, detJudge: detJudge };
