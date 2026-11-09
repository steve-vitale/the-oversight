// scalecourt-traderoad-r113-linkraise — journey-scale r113 POLICY ARM
// (2026-11-09, lane A). POLICY-SIDE ONLY. ZERO src/js changes. Clone of
// scalecourt-nogate-morntrace3-linkraise.js (frozen; untouched) with
// EXACTLY TWO changes, both pre-registered in
// evidence/2026-11-09/journey-scale-r113-prereg.md (Q1, the trade road):
//   (1) requires the trade-road base (scalecourt-traderoad-r113.js)
//       instead of scalecourt-nogate-morntrace3.js;
//   (2) SUB-CAP GUARD: a raise whose answer would form a 2nd
//       Haven-primary subordinate is left pending (counted as
//       raisesSkippedSubCap) while the trade window is open (unsealed,
//       before day 120) — lead needs 3 subs to qualify, and lead cannot be
//       walked from, so holding subs at 1 keeps the village budget for
//       trade routes. The raise expires; the villager may re-raise
//       after the 14-day cooldown. Once the window closes or the charter
//       seals, the guard lifts and raises are answered exactly as in the
//       base. (Pilot addendum 2: the count-rule guard never engaged —
//       only 4 villages were known at the 3rd raise and the 5th arrived
//       later — so the window, not the count, decides.)
// Everything else — the raise-answer shape (in conversation, link:accept
// only when offered, courtship-ready only, never the bare verb, never
// link:decline), the counters, the raise-talk record — is byte-identical
// to the base. See the base file's header for the full shape.
//
// WHAT IT DOES (frozen in the prereg — do not tune), once per day, after
// scalecourt.daily:
//   Answer pending link raises, IN CONVERSATION: for each pending raise
//   (oldest first, at most one answer per day), the scholar talks to the
//   raiser (talkTo + up to 5 real turns via chooseConversationChoice —
//   answer their question first, continue their story, navigate to the
//   subject — the linkdrive shape) and picks link:accept ONLY when the
//   raised village is courtship-ready (det sub >= 55 — the score can
//   never decline; worst case a played counter, which the scale driver's
//   own courtship answers the next day). The raise itself is the
//   perception event: the villager walked up with the idea and the
//   village they personally know. NEVER the bare acceptLinkRaise verb,
//   NEVER link:decline — a decline is the player's call, not the
//   policy's. A raise for a not-yet-ready village is left pending (it
//   expires; the villager may re-raise after the 14-day cooldown). A
//   raise whose raiser is dead, exiled, or off-roster is skipped.
//
// COUNTERS: per-run ctx counters (lr*) plus module-level stats
// (resetLinkraiseStats / linkraiseStats) so the driver can capture
// per-seed numbers without reaching into harness ctx.
'use strict';
const TR = require('./scalecourt-traderoad-r113');
const { scalecourt } = TR;
const LD = require('./competent-linkdrive-b'); // detJudge + answerRaiseInConversation (require, not a copy)

const COURT_READY = LD.COURT_READY; // 55, the linkdrive courtship-ready rule

const STATS = { raisesSeen: 0, raisesAnswered: 0, raisesLinked: 0, raisesCountered: 0,
  raisesSkippedNotReady: 0, raisesSkippedNoRaiser: 0, raisesSkippedNoVillage: 0,
  raisesSkippedSubCap: 0,
  raisesSkippedLinked: 0, raisesTalkFailed: 0, raisesNotOffered: 0,
  firstRaiseTalkDay: null, firstRaiseAnswerDay: null,
  errors: 0, events: [], raiseTalks: [] };
function resetLinkraiseStats() {
  STATS.raisesSeen = 0; STATS.raisesAnswered = 0; STATS.raisesLinked = 0; STATS.raisesCountered = 0;
  STATS.raisesSkippedNotReady = 0; STATS.raisesSkippedNoRaiser = 0; STATS.raisesSkippedNoVillage = 0; STATS.raisesSkippedSubCap = 0;
  STATS.raisesSkippedLinked = 0; STATS.raisesTalkFailed = 0; STATS.raisesNotOffered = 0;
  STATS.firstRaiseTalkDay = null; STATS.firstRaiseAnswerDay = null;
  STATS.errors = 0; STATS.events = []; STATS.raiseTalks = [];
}
function linkraiseStats() { return JSON.parse(JSON.stringify(STATS)); }

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function otherVillage(Game, vid) {
  try {
    var ovs = (Game.state || {}).otherVillages || [];
    for (var i = 0; i < ovs.length; i++) if (ovs[i] && ovs[i].id === vid) return ovs[i];
  } catch (e) {}
  return null;
}
function event(day, kind, village, outcome, extra) {
  var e = { day: day, kind: kind, village: village || null, outcome: outcome || null };
  if (extra) { for (var k in extra) { if (k !== 'day' && k !== 'kind' && k !== 'village' && k !== 'outcome') e[k] = extra[k]; } }
  STATS.events.push(e);
  if (STATS.events.length > 400) STATS.events.splice(0, STATS.events.length - 400);
}

function linkRaiseDrive(Game, ctx) {
  try {
    if (Game.over) return;
    var day = dayOf(Game);
    var st = Game.state || {};
    var raises = [];
    try {
      var lr = ((st.village || {}).linkRaises) || {};
      Object.keys(lr).forEach(function (vid) {
        if (lr[vid]) raises.push({ vid: vid, villageId: lr[vid].villageId || null, day: (lr[vid].day == null) ? null : (lr[vid].day | 0) });
      });
    } catch (e) { STATS.errors += 1; event(day, 'raise-read', null, 'error', { message: String(e && e.message || e).slice(0, 80) }); return; }
    raises.sort(function (a, b) { return (a.day || 0) - (b.day || 0); });
    STATS.raisesSeen += raises.length;
    var answeredOne = false;
    for (var ri = 0; ri < raises.length; ri++) {
      if (answeredOne) break;
      if (Game.over) break;
      var r = raises[ri];
      // The raiser must be a living roster villager the scholar can talk to.
      var raiserOk = false;
      try {
        var roster = ((st.village || {}).roster) || [];
        if (roster.indexOf(r.vid) !== -1) {
          var p = (typeof Game.getPerson === 'function') ? Game.getPerson(r.vid) : null;
          raiserOk = !p || !p.dead;
        }
      } catch (e) { STATS.errors += 1; }
      if (!raiserOk) { STATS.raisesSkippedNoRaiser += 1; event(day, 'raise-skip', r.villageId, 'no-raiser', { vid: r.vid }); continue; }
      var ov = otherVillage(Game, r.villageId);
      if (!ov) { STATS.raisesSkippedNoVillage += 1; event(day, 'raise-skip', r.villageId, 'no-village', { vid: r.vid }); continue; }
      // Already linked (formed through another path) — nothing to answer.
      try {
        if (typeof Game.linkWith === 'function' && Game.linkWith(r.villageId)) {
          STATS.raisesSkippedLinked += 1; event(day, 'raise-skip', r.villageId, 'already-linked', { vid: r.vid }); continue;
        }
      } catch (e) { STATS.errors += 1; }
      // TRADE-ROAD r113 SUB-CAP GUARD (pilot addendum 2): a raise answer
      // forms a Haven-primary subordinate (proposeLink asSubordinate).
      // Lead needs 3 subs and cannot be walked from, so while the trade
      // window is open (unsealed, before day 120) hold subs at 1 — the
      // first link only. Every further raise is left pending (it
      // expires; the villager may re-raise after the 14-day cooldown —
      // holding costs time, not the road), keeping the village budget
      // for trade routes. Once the window closes or the charter seals,
      // the guard lifts and raises are answered as in the base.
      try {
        if (TR.subCount(Game) >= 1 && TR.tradeWindowOpen(Game, day)) {
          STATS.raisesSkippedSubCap += 1;
          event(day, 'raise-skip', r.villageId, 'sub-cap', { vid: r.vid, subs: TR.subCount(Game) });
          continue;
        }
      } catch (e) { STATS.errors += 1; }
      var dj = null;
      try { dj = LD.detJudge(Game, ov); } catch (e) { STATS.errors += 1; }
      if (!dj || dj.sub < COURT_READY) {
        STATS.raisesSkippedNotReady += 1;
        event(day, 'raise-skip', r.villageId, 'not-ready', { vid: r.vid, detSub: dj ? dj.sub : null });
        continue;
      }
      // First raise-talk day: the purity guard's divergence floor (the
      // armed leg must not diverge from the replayed baseline before it).
      if (STATS.firstRaiseTalkDay == null) STATS.firstRaiseTalkDay = day;
      var out = 'error';
      try { out = LD.answerRaiseInConversation(Game, ctx, r.vid, r.villageId); } catch (e) { STATS.errors += 1; out = 'error'; }
      if (out === 'accepted') {
        STATS.raisesAnswered += 1; STATS.raisesLinked += 1; answeredOne = true;
        if (STATS.firstRaiseAnswerDay == null) STATS.firstRaiseAnswerDay = day;
        event(day, 'raise-answer', r.villageId, 'linked', { vid: r.vid, detSub: dj.sub });
      } else if (out === 'counter') {
        STATS.raisesAnswered += 1; STATS.raisesCountered += 1; answeredOne = true;
        if (STATS.firstRaiseAnswerDay == null) STATS.firstRaiseAnswerDay = day;
        event(day, 'raise-answer', r.villageId, 'counter', { vid: r.vid, detSub: dj.sub });
      } else if (out === 'not-offered') {
        STATS.raisesNotOffered += 1;
        event(day, 'raise-answer', r.villageId, 'not-offered', { vid: r.vid, detSub: dj.sub });
      } else if (out === 'talk-failed') {
        STATS.raisesTalkFailed += 1;
        event(day, 'raise-answer', r.villageId, 'talk-failed', { vid: r.vid, detSub: dj.sub });
      } else {
        STATS.errors += 1;
        event(day, 'raise-answer', r.villageId, 'error', { vid: r.vid, detSub: dj.sub });
      }
      // R109: record the raise-answer talk (READ-ONLY — the transcript is
      // the engine's own record; endConvo keeps it, and runConversation
      // reads it the same way after endConvo). No RNG, no state mutation,
      // and both legs share this file so before/after purity is preserved.
      // The people check reads ALL raise talks from this record, not one
      // probe. A record failure is never a run error.
      try {
        var _cg = null;
        try { _cg = (typeof Game.convoGet === 'function') ? Game.convoGet(r.vid) : null; } catch (e) {}
        var _tr = (_cg && Array.isArray(_cg.transcript)) ? _cg.transcript : [];
        STATS.raiseTalks.push({ day: day, vid: r.vid, village: r.villageId, outcome: out,
          lines: _tr.map(function (e) { return { who: (e && e.who) || '?', text: String((e && e.text) || '') }; }) });
        if (STATS.raiseTalks.length > 40) STATS.raiseTalks.splice(0, STATS.raiseTalks.length - 40);
      } catch (e) {}
    }
  } catch (e) { STATS.errors += 1; event(dayOf(Game), 'raise-drive', null, 'error', { message: String(e && e.message || e).slice(0, 80) }); }
}

const linkraisePolicy = Object.assign({}, scalecourt, {
  id: 'scalecourt-traderoad-r113-linkraise',
  desc: 'competent + TRADE-road scale courtship (r113: trade-first in the d120 window, covenant walks while the window is open, sub-cap 1 on raises) + r108 link-raise answers in conversation (policy-side probe only)',
  daily(Game, ctx) {
    try { scalecourt.daily(Game, ctx); } catch (e) { STATS.errors += 1; event(dayOf(Game), 'scalecourt-daily', null, 'error', { message: String(e && e.message || e).slice(0, 80) }); }
    linkRaiseDrive(Game, ctx);
  },
});

module.exports = { linkraisePolicy: linkraisePolicy,
  resetLinkraiseStats: resetLinkraiseStats, linkraiseStats: linkraiseStats,
  linkRaiseDrive: linkRaiseDrive, COURT_READY: COURT_READY };
