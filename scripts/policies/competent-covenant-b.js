// competent-covenant-b — the COVENANT-ROAD lever (arm sim-onlylead-b
// Stage 2, run fleshout-loop-b-20261115T1055Z, axis winnability chain).
//
// POLICY-SIDE ONLY. ZERO src/js changes, zero default flips, no changes
// to any existing policy file. This is a measurement instrument, not a
// play recommendation: it composes onto the FROZEN competent base
// (scripts/policies/competent.js, unmodified) and walks ONLY the
// covenant road — the league of equals — so the Founding Council beat
// gets a chance to stage without the lead road shadowing it by
// priority (lead → belong → covenant → trade; a lead polity would
// stage first and set nationalLive, swallowing every later shape).
//
// WHY THIS LEVER (Stage 1 DIAG, band 100401–100408): covenant never
// staged because it was never walked — 0 covenant peer links ever
// formed on either leg, 0 proposeCovenant calls by policy OR engine,
// 0 _formPeerLink events. The engine has the whole road wired
// (hierarchy.js _proposePeer ≥55 accept / 35–54 counter / <35 decline;
// _judgePeer base 38 + rep/2 + opinion/2 + allied 15 + equals 10 +
// R()*20−10; _formPeerLink trust 30; tendLink accepts peer links,
// 1,500 kcal → +8 trust weekly; answerCounter('accept') forms a peer
// counter's link; answerNationalChoice('pact') sits the council).
// The road is unwalked, not unwired.
//
// THE VERBS (frozen in the Stage 2 prereg addendum — do not tune),
// once per day each, in order, after competent.daily:
//   1. Answer a staged national beat FIRST (the answercourt answer
//      map, reused verbatim: lead feast / conquest mercy / belong
//      swear / covenant pact / trade sign; unknown shape never
//      answered; 'refuse'/'walk' never chosen; global beats NOT
//      answered). A covenant beat, when it stages, is answered the
//      next morning with 'pact'.
//   2. Answer a pending counter: answerCounter('accept') — a peer
//      counter forms the peer link (hierarchy.js answerCounter).
//   3. Tend COVENANT links below the seasoned bar: weekly, for each
//      active covenant peer link with age < 30 days OR trust < 40,
//      when pantry > 20,000 kcal: tendLink(link.id) (1,500 kcal ->
//      +8 trust). Seasoned links (30+ days AND trust 40+) are NOT
//      tended. Same gates as scaleclimb's lead tend.
//   4. Propose COVENANT directly: once per day, from day 10, when no
//      counter/national beat is pending, pantry > 12,000 kcal, and
//      fewer than 3 covenant links stand — the best courtship-ready
//      KNOWN village (deterministic peer judge >= 45) gets
//      proposeCovenant(vid). Threshold 45, not 55: the engine adds
//      R()*20-10 to the score, so det >= 45 guarantees >= 35 after
//      the draw — the counter floor, never a cold decline (-5
//      opinion, banks courtshipDeclined). A declined village is not
//      re-proposed within 7 days. Cap: 3 covenant links.
//      THE OPINION GATE (smoke finding, 2026-11-15): the engine ALSO
//      requires opinion 10+ before a peer binding is even proposed
//      ("barely know Haven's name" — no proposal, no -5). The policy
//      does NOT filter on opinion: it attempts the propose and lets
//      the engine refuse aloud, so the pilot MEASURES the gate
//      instead of hiding behind it. A prerequisite refusal counts
//      as proposePrereq (no cooldown — the village isn't declining,
//      it just doesn't know Haven yet); a real decline counts as
//      proposeDeclined and cools the village 7 days.
//
// WHAT IT DOES NOT DO (stated so the census cannot be misread):
//   - No proposeLink (no lead road — lead can never qualify, so it
//     can never shadow covenant by priority). No proposeTrade (trade
//     is the next road, not this arm). No raidVillage (conquest is
//     not this arm). No seat-taking (tableTakeSeat) — OUT OF SCOPE,
//     a Steve-call.
//   - No accord answers: peer links never stage a pendingAccord
//     (_formPeerLink stages none — the accord is a _formLink
//     first-gesture), and no lead link can ever form on this leg, so
//     no accord can ever be pending.
//   - No defense-call / trade-call answers (those exist only after
//     national; not needed to stage the beat). No global-beat
//     answers. No banking step, no pack changes, no tribute change.
//   - No villageStandingTotal() / unlockedWave() calls in the policy.
//   - The only new RNG draws in the covenant leg are the engine's
//     own (judgePeer inside proposeCovenant) — the lever, not the
//     instrument. Candidate ranking is deterministic (score desc,
//     village id asc); no Math.random in this file.
//
// COUNTERS: per-run ctx counters (cc*) plus module-level stats
// (resetCovenantStats / covenantStats) so the driver can capture
// per-seed numbers without reaching into harness ctx. The answer
// half reuses the answercourt stats module (answerNationalBeat
// updates it) so the driver reads pendingNationalDays / answers
// per shape through the same counters as the DIAG legs.
'use strict';
const { competent } = require('./competent');
const { answerNationalBeat, resetAnswercourtStats, answercourtStats } = require('./competent-answercourt-b');

const PROPOSE_DAY = 10;
const PROPOSE_PANTRY = 12000;
const TEND_PANTRY = 20000;
const COV_CAP = 3;
const REASK_DAYS = 7;
const COURT_READY = 45;

const STATS = { proposeCalls: 0, proposeAccepted: 0, proposeCounter: 0,
  proposeDeclined: 0, proposeShut: 0, proposePrereq: 0, proposeBlockedPantry: 0,
  proposeBlockedCap: 0, proposeBlockedPending: 0, proposeBlockedDay: 0,
  proposeNoCandidate: 0, proposeNotReady: 0, counterAnswers: 0,
  tends: 0, tendsBlockedPantry: 0, tendsPaidKcal: 0,
  nationalPendingDays: 0, errors: 0, events: [] };
function resetCovenantStats() {
  STATS.proposeCalls = 0; STATS.proposeAccepted = 0; STATS.proposeCounter = 0;
  STATS.proposeDeclined = 0; STATS.proposeShut = 0; STATS.proposePrereq = 0;
  STATS.proposeBlockedPantry = 0;
  STATS.proposeBlockedCap = 0; STATS.proposeBlockedPending = 0; STATS.proposeBlockedDay = 0;
  STATS.proposeNoCandidate = 0; STATS.proposeNotReady = 0; STATS.counterAnswers = 0;
  STATS.tends = 0; STATS.tendsBlockedPantry = 0; STATS.tendsPaidKcal = 0;
  STATS.nationalPendingDays = 0; STATS.errors = 0;
  STATS.events = [];
}
function covenantStats() { return JSON.parse(JSON.stringify(STATS)); }

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce(function (t, i) { return t + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) { return 0; }
}
function weekOf(Game) { try { return Game._week ? (Game._week() | 0) : 0; } catch (e) { return 0; } }

// detJudgePeer(Game, ov): deterministic peer-judge components for one
// village, WITHOUT calling _judgePeer (it draws RNG). Mirrors the
// engine's _judgePeer (hierarchy.js): base 38 + rep standing/2 (max 20)
// + opinion/2 + allied +15 + equals-at-the-table +10. The engine then
// adds R()*20-10, so det >= 45 guarantees a post-draw score >= 35 —
// the counter floor, never a cold decline.
function detJudgePeer(Game, ov) {
  try {
    var opinion = (ov && (ov.opinion | 0)) || 0;
    var repS = 0;
    try { var rep = (typeof Game.representative === 'function') ? Game.representative() : null; if (rep) repS = (rep.standing | 0) || 0; } catch (e) {}
    var repTerm = Math.min(20, repS / 2);
    var allied = 0;
    try { if (typeof Game.isAllied === 'function' && Game.isAllied('haven', ov.id)) allied = 15; } catch (e) {}
    return Math.round((38 + repTerm + opinion / 2 + allied + 10) * 10) / 10;
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

function covenantClimb(Game, ctx) {
  try {
    if (Game.over) return;
    var day = dayOf(Game);
    var st = Game.state || {};
    if (st.pendingNational) STATS.nationalPendingDays += 1;

    // 1. Answer a pending counter — their terms, the peer link forms.
    try {
      if (st.pendingCounter && typeof Game.answerCounter === 'function') {
        var ctr = st.pendingCounter;
        try { Game.answerCounter('accept'); } catch (e) {}
        STATS.counterAnswers += 1;
        event(day, 'counter-answer', ctr.targetId || null, 'accept', { kind: ctr.kind || null });
      }
    } catch (e) { STATS.errors += 1; }

    // 2. Tend COVENANT links below the seasoned bar — weekly, pantry-gated.
    try {
      if (!Game.over) {
        var week = weekOf(Game);
        var links = activeLinks(Game);
        for (var li = 0; li < links.length; li++) {
          var link = links[li];
          if (!link || link.kind !== 'covenant') continue;
          if (isSeasoned(link, day)) continue;
          if (link.tendedWeek === week) continue;
          if (pantryKcal(Game) <= TEND_PANTRY) { STATS.tendsBlockedPantry += 1; continue; }
          var trustBefore = (link.trust | 0);
          var paid = 0;
          try { paid = (typeof Game.tendLink === 'function') ? (Game.tendLink(link.id) || 0) : 0; } catch (e) { STATS.errors += 1; continue; }
          if (paid > 0) {
            STATS.tends += 1; STATS.tendsPaidKcal += paid;
            event(day, 'tend', link.b || link.a || null, 'covenant-below-bar', { linkId: link.id, paid: paid, trustBefore: trustBefore, age: day - (link.day | 0) });
          }
        }
      }
    } catch (e) { STATS.errors += 1; }

    // 3. Propose COVENANT directly — once per day, from day 10.
    try {
      if (Game.over) return;
      st = Game.state || {};
      if (day < PROPOSE_DAY) { STATS.proposeBlockedDay += 1; return; }
      var blocked = null;
      if (st.pendingCounter || st.pendingNational) blocked = 'pending';
      else if (pantryKcal(Game) <= PROPOSE_PANTRY) blocked = 'pantry';
      else if (activeLinks(Game).filter(function (l) { return l.kind === 'covenant'; }).length >= COV_CAP) blocked = 'cap';
      if (blocked === 'pending') STATS.proposeBlockedPending += 1;
      else if (blocked === 'pantry') STATS.proposeBlockedPantry += 1;
      else if (blocked === 'cap') STATS.proposeBlockedCap += 1;
      if (!blocked) {
        var cool = (ctx && ctx._ccDeclined) || {};
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
            var d = detJudgePeer(Game, v);
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
          try { res = Game.proposeCovenant(best); } catch (e) { res = null; STATS.errors += 1; }
          var oc = 'declined';
          try {
            if (res && typeof res === 'object' && res.id) oc = 'accepted';
            else if (res === 'counter') oc = 'counter';
            else if (bestOv && ((bestOv.opinion | 0) <= -20)) oc = 'shut';
            // Prerequisite refusal (opinion <10): the engine refused
            // before judging — no decline, no -5, no cooldown. Count
            // it separately so the pilot can name the gate.
            else if (bestOv && ((bestOv.opinion | 0) < 10)) oc = 'prereq';
            else oc = 'declined';
          } catch (e) {}
          if (oc === 'accepted') STATS.proposeAccepted += 1;
          else if (oc === 'counter') STATS.proposeCounter += 1;
          else if (oc === 'shut') STATS.proposeShut += 1;
          else if (oc === 'prereq') STATS.proposePrereq += 1;
          else {
            STATS.proposeDeclined += 1;
            if (ctx) { ctx._ccDeclined = ctx._ccDeclined || {}; ctx._ccDeclined[best] = day; }
          }
          event(day, 'propose', best, oc, { detPeer: bestScore, offer: 'covenant' });
        }
      }
    } catch (e) { STATS.errors += 1; }
  } catch (e) { STATS.errors += 1; }
}

const covenantPolicy = Object.assign({}, competent, {
  id: 'competent-covenant-b',
  desc: 'competent + COVENANT-road scale climb: propose covenant peer links from day 10 (judged >=45, opinion >=10), answer peer counters, tend covenant links below the seasoned bar, answer EVERY staged national beat (lead feast / conquest mercy / belong swear / covenant pact / trade sign); no lead proposes, no trade, no raids — policy-side probe only',
  daily(Game, ctx) {
    try { answerNationalBeat(Game, ctx); } catch (e) {}
    try { competent.daily(Game, ctx); } catch (e) {}
    covenantClimb(Game, ctx);
  },
});

module.exports = { covenantPolicy: covenantPolicy,
  resetCovenantStats: resetCovenantStats, covenantStats: covenantStats,
  resetAnswercourtStats: resetAnswercourtStats, answercourtStats: answercourtStats,
  covenantClimb: covenantClimb, detJudgePeer: detJudgePeer, isSeasoned: isSeasoned,
  PROPOSE_DAY: PROPOSE_DAY, PROPOSE_PANTRY: PROPOSE_PANTRY,
  TEND_PANTRY: TEND_PANTRY, COV_CAP: COV_CAP, REASK_DAYS: REASK_DAYS,
  COURT_READY: COURT_READY };
