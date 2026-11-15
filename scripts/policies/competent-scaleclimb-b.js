// competent-scaleclimb-b — the SCALE-CLIMB lever (arm sim-scaleclimb-b,
// run fleshout-loop-b-20261114T1430Z, axis winnability chain).
//
// POLICY-SIDE ONLY. ZERO src/js changes, zero default flips, no changes
// to any existing policy file. This is a measurement instrument, not a
// play recommendation: it composes onto the FROZEN competent base
// (scripts/policies/competent.js, unmodified — the scale-free baseline)
// and adds the ask the diplo-verb DIAG pinned as the mechanism:
// propose LEAD links, answer the first-gesture accord with the gift,
// tend below the seasoned bar — until three Haven-primary seasoned
// subs stand under one head (the polity bar: diplomacy = 34 x counted
// links, else 0).
//
// THE VERBS (frozen in the prereg — do not tune), once per day each,
// in order, after competent.daily:
//   1. Answer a pending counter: answerCounter('accept') — their terms.
//      A pending counter blocks further proposes, so it is answered
//      first, the day it stages. ENGINE RULE (hierarchy.js
//      _stageCounter): a counter to ANY propose always flips to
//      asSubordinate — the accepted counter forms a BELONG link, never
//      a LEAD link. BELONG links are counted separately and never
//      toward the 3-sub polity bar.
//   2. Answer a pending first accord: answerAccord('gift') — 2,000 kcal
//      -> +10 trust (partial pantry pays partial, proportional trust —
//      the engine's rule). The crossing verb: 24 of 30 first-crossings
//      in the diplo-verb band.
//   3. Tend LEAD links below the seasoned bar: weekly, for each active
//      Haven-primary link with age < 30 days OR trust < 40, when pantry
//      > 20,000 kcal: tendLink(link.id) (1,500 kcal -> +8 trust).
//      Seasoned links (30+ days AND trust 40+) are NOT tended
//      (tendseason-b predicate). The maintenance verb.
//   4. Propose LEAD directly: once per day, from day 10, when no
//      counter/accord/national beat is pending, pantry > 12,000 kcal,
//      and fewer than 3 Haven-primary subs stand — the best
//      courtship-ready KNOWN village (deterministic as-PRIMARY judge
//      >= 45, no RNG draw — the recorder's detJudge rule) gets
//      proposeLink(vid, { asSubordinate: false,
//      tributeKcalPerWeek: 4000 }). Threshold 45, not 55: the engine
//      adds R()*20-10 to the score, so det >= 45 guarantees >= 35
//      after the draw — the counter floor, never a cold decline (-5
//      opinion, banks courtshipDeclined). A declined village is not
//      re-proposed within 7 days. Cap: 3 Haven-primary subs.
//
// WHAT IT DOES NOT DO (stated so the census cannot be misread):
//   - No seat-taking (tableTakeSeat) — OUT OF SCOPE, a Steve-call.
//   - No national/global beat answers (leadcourt answers them; this
//     lever does not — endgame beats, not diplomacy verbs).
//   - No defense-call answers. No link-raise answers in conversation
//     (capable's corpus shows no raise-formed links; raises are
//     linkdrive's arm, not this one).
//   - No proposeCovenant / proposeTrade (peer links are a separate
//     corpus), no raidVillage (the conquest road is not this arm).
//   - No villageStandingTotal() / unlockedWave() calls in the policy.
//   - The only new RNG draws in the armed leg are the engine's own
//     (judgeLink inside proposeLink) — the lever, not the instrument.
//     Candidate ranking is deterministic (score desc, village id asc);
//     no Math.random in this file.
//
// COUNTERS: per-run ctx counters (sc*) plus module-level stats
// (resetScaleclimbStats / scaleclimbStats) so the driver can capture
// per-seed numbers without reaching into harness ctx.
'use strict';
const { competent } = require('./competent');

const PROPOSE_DAY = 10;
const PROPOSE_PANTRY = 12000;
const TEND_PANTRY = 20000;
const SUB_CAP = 3;
const REASK_DAYS = 7;
const COURT_READY = 45;
const PROPOSE_TRIBUTE = 4000;

const STATS = { proposeCalls: 0, proposeAccepted: 0, proposeCounter: 0,
  proposeDeclined: 0, proposeShut: 0, proposeBlockedPantry: 0,
  proposeBlockedCap: 0, proposeBlockedPending: 0, proposeBlockedDay: 0,
  proposeNoCandidate: 0, proposeNotReady: 0, counterAnswers: 0,
  accordAnswers: 0, tends: 0, tendsBlockedPantry: 0, tendsPaidKcal: 0,
  nationalPendingDays: 0, errors: 0, events: [] };
function resetScaleclimbStats() {
  STATS.proposeCalls = 0; STATS.proposeAccepted = 0; STATS.proposeCounter = 0;
  STATS.proposeDeclined = 0; STATS.proposeShut = 0; STATS.proposeBlockedPantry = 0;
  STATS.proposeBlockedCap = 0; STATS.proposeBlockedPending = 0; STATS.proposeBlockedDay = 0;
  STATS.proposeNoCandidate = 0; STATS.proposeNotReady = 0; STATS.counterAnswers = 0;
  STATS.accordAnswers = 0; STATS.tends = 0; STATS.tendsBlockedPantry = 0; STATS.tendsPaidKcal = 0;
  STATS.nationalPendingDays = 0; STATS.errors = 0;
  STATS.events = [];
}
function scaleclimbStats() { return JSON.parse(JSON.stringify(STATS)); }

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce(function (t, i) { return t + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) { return 0; }
}
function weekOf(Game) { try { return Game._week ? (Game._week() | 0) : 0; } catch (e) { return 0; } }

// detJudgePrim(Game, ov): deterministic as-PRIMARY judgeLink components
// for one village, WITHOUT calling judgeLink (it draws RNG). Same rule as
// the regionalstep recorder (scripts/regionalstep-instrument-20261107.js)
// and competent-linkdrive-b's detJudge, prim leg: base 38 + rep
// standing/2 (max 20) + opinion/2 + ally +15 + strength term (Haven
// stronger: min(15, diff/5); weaker: -10). The engine then adds
// R()*20-10, so det >= 45 guarantees a post-draw score >= 35 — the
// counter floor, never a cold decline.
function detJudgePrim(Game, ov) {
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
    return Math.round((38 + repTerm + opinion / 2 + allied + strength) * 10) / 10;
  } catch (e) { return null; }
}

function activeLinks(Game) {
  try {
    var links = (typeof Game.hierarchyState === 'function') ? (Game.hierarchyState() || []) : [];
    return links.filter(function (l) { return l && l.status === 'active'; });
  } catch (e) { return []; }
}
function isSeasoned(link, day) {
  try { return ((day - (link.day | 0)) >= 30) && ((link.trust | 0) >= 40); } catch (e) { return false; }
}
function event(day, kind, village, outcome, extra) {
  var e = { day: day, kind: kind, village: village || null, outcome: outcome || null };
  if (extra) { for (var k in extra) { if (k !== 'day' && k !== 'kind' && k !== 'village' && k !== 'outcome') e[k] = extra[k]; } }
  STATS.events.push(e);
  if (STATS.events.length > 400) STATS.events.splice(0, STATS.events.length - 400);
}

function scaleClimb(Game, ctx) {
  try {
    if (Game.over) return;
    var day = dayOf(Game);
    var st = Game.state || {};
    if (st.pendingNational) STATS.nationalPendingDays += 1;

    // 1. Answer a pending counter — their terms, the link forms BELONG.
    try {
      if (st.pendingCounter && typeof Game.answerCounter === 'function') {
        var ctr = st.pendingCounter;
        try { Game.answerCounter('accept'); } catch (e) {}
        STATS.counterAnswers += 1;
        event(day, 'counter-answer', ctr.targetId || null, 'accept', {});
      }
    } catch (e) { STATS.errors += 1; }

    // 2. Answer a pending first accord — the gift.
    try {
      if (st.pendingAccord && typeof Game.answerAccord === 'function') {
        var acc = st.pendingAccord;
        try { Game.answerAccord('gift'); } catch (e) {}
        STATS.accordAnswers += 1;
        event(day, 'accord-answer', null, 'gift', { linkId: acc.linkId || null });
      }
    } catch (e) { STATS.errors += 1; }

    // 3. Tend LEAD links below the seasoned bar — weekly, pantry-gated.
    try {
      if (!Game.over) {
        var week = weekOf(Game);
        var links = activeLinks(Game);
        for (var li = 0; li < links.length; li++) {
          var link = links[li];
          if (!link || link.primary !== 'haven') continue;
          if (isSeasoned(link, day)) continue;
          if (link.tendedWeek === week) continue;
          if (pantryKcal(Game) <= TEND_PANTRY) { STATS.tendsBlockedPantry += 1; continue; }
          var trustBefore = (link.trust | 0);
          var paid = 0;
          try { paid = (typeof Game.tendLink === 'function') ? (Game.tendLink(link.id) || 0) : 0; } catch (e) { STATS.errors += 1; continue; }
          if (paid > 0) {
            STATS.tends += 1; STATS.tendsPaidKcal += paid;
            event(day, 'tend', link.subordinate || null, 'lead-below-bar', { linkId: link.id, paid: paid, trustBefore: trustBefore, age: day - (link.day | 0) });
          }
        }
      }
    } catch (e) { STATS.errors += 1; }

    // 4. Propose LEAD directly — once per day, from day 10.
    try {
      if (Game.over) return;
      st = Game.state || {};
      if (day < PROPOSE_DAY) { STATS.proposeBlockedDay += 1; return; }
      var blocked = null;
      if (st.pendingCounter || st.pendingAccord || st.pendingNational) blocked = 'pending';
      else if (pantryKcal(Game) <= PROPOSE_PANTRY) blocked = 'pantry';
      else if (activeLinks(Game).filter(function (l) { return l.primary === 'haven' && !l.conquered; }).length >= SUB_CAP) blocked = 'cap';
      if (blocked === 'pending') STATS.proposeBlockedPending += 1;
      else if (blocked === 'pantry') STATS.proposeBlockedPantry += 1;
      else if (blocked === 'cap') STATS.proposeBlockedCap += 1;
      if (!blocked) {
        var cool = (ctx && ctx._scDeclined) || {};
        var best = null, bestScore = null, bestOv = null;
        var readyCount = 0;
        try {
          var ovs = (st.otherVillages || []);
          for (var i = 0; i < ovs.length; i++) {
            var v = ovs[i];
            if (!v || !v.id || v.id === 'haven') continue;
            var known = false;
            try { known = (typeof Game.knowsVillage === 'function') ? !!Game.knowsVillage(v) : false; } catch (e) {}
            if (!known) continue;
            try { if (typeof Game.linkWith === 'function' && Game.linkWith(v.id)) continue; } catch (e) {}
            var d = detJudgePrim(Game, v);
            if (d === null || d === undefined) continue;
            if (d < COURT_READY) continue;
            readyCount += 1;
            if ((cool[v.id] || 0) + REASK_DAYS > day) continue;
            if (bestScore == null || d > bestScore || (d === bestScore && v.id < best)) {
              best = v.id; bestScore = d; bestOv = v;
            }
          }
        } catch (e) { STATS.errors += 1; }
        if (!best) {
          if (readyCount === 0) STATS.proposeNotReady += 1;
          else STATS.proposeNoCandidate += 1;
        } else {
          STATS.proposeCalls += 1;
          var res = null;
          try { res = Game.proposeLink(best, { asSubordinate: false, tributeKcalPerWeek: PROPOSE_TRIBUTE }); } catch (e) { res = null; STATS.errors += 1; }
          var oc = 'declined';
          try {
            if (res && typeof res === 'object' && res.id) oc = 'accepted';
            else if (res === 'counter') oc = 'counter';
            else if (bestOv && ((bestOv.opinion | 0) <= -20)) oc = 'shut';
            else oc = 'declined';
          } catch (e) {}
          if (oc === 'accepted') STATS.proposeAccepted += 1;
          else if (oc === 'counter') STATS.proposeCounter += 1;
          else if (oc === 'shut') STATS.proposeShut += 1;
          else {
            STATS.proposeDeclined += 1;
            if (ctx) { ctx._scDeclined = ctx._scDeclined || {}; ctx._scDeclined[best] = day; }
          }
          event(day, 'propose', best, oc, { detPrim: bestScore, offer: 'lead' });
        }
      }
    } catch (e) { STATS.errors += 1; }
  } catch (e) { STATS.errors += 1; }
}

const scaleclimbPolicy = Object.assign({}, competent, {
  id: 'competent-scaleclimb-b',
  desc: 'competent + LEAD-road scale climb: propose subordinates from day 10 (judged >=45), answer first accord with the gift, tend LEAD links below the seasoned bar (policy-side probe only)',
  daily(Game, ctx) {
    try { competent.daily(Game, ctx); } catch (e) {}
    scaleClimb(Game, ctx);
  },
});

module.exports = { scaleclimbPolicy: scaleclimbPolicy,
  resetScaleclimbStats: resetScaleclimbStats, scaleclimbStats: scaleclimbStats,
  scaleClimb: scaleClimb, detJudgePrim: detJudgePrim, isSeasoned: isSeasoned,
  PROPOSE_DAY: PROPOSE_DAY, PROPOSE_PANTRY: PROPOSE_PANTRY,
  TEND_PANTRY: TEND_PANTRY, SUB_CAP: SUB_CAP, REASK_DAYS: REASK_DAYS,
  COURT_READY: COURT_READY, PROPOSE_TRIBUTE: PROPOSE_TRIBUTE };
