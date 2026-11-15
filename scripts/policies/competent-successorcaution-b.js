// competent-successorcaution-b — the SUCCESSOR-CAUTION lever (arm
// sim-successorcaution-b, run fleshout-loop-b-20261115T0621Z, axis
// winnability chain).
//
// POLICY-SIDE ONLY. ZERO src/js changes, zero default flips, no changes
// to any existing policy file. This is a measurement instrument, not a
// play recommendation: it composes onto competent-answercourt-b (which
// composes onto competent-scaleclimb-b onto the frozen competent base)
// and adds exactly ONE thing: after a succession, the new scholar stays
// at/near Haven for their first N days instead of starting a solo
// forage trip.
//
// THE RULE (frozen in the prereg — do not tune), N = 2:
//   Succession is detected from policy-visible state alone:
//   Game.villagerId changes across daily() calls (playerDeath reassigns
//   it to the highest-trust living roster member; ledger.js). The
//   successor's first N daily() calls are CAUTION days. On a caution
//   day the policy runs a HAVEN DAY instead of the wrapped daily:
//     1. answerNationalBeat — the court is still answered same-day.
//     2. scaleClimb — proposes/tends still run (Haven verbs).
//     3. Haven chores, each in try/catch: keepPromises, sortHaul,
//        competentEat, talkRound, gearUp (the successor checks their
//        OWN kit — the dead bearer's gear stays on the corpse).
//     4. If not at Haven, walkHome honestly toward Haven.
//     5. One voiced Game.say line on the first caution day per
//        succession, so the stay reads in the transcript.
//   upkeep (eat/drink per part) and fight are inherited unchanged: the
//   scholar still eats and drinks on caution days, and a breach fight
//   at Haven is still fought normally (the designed crisis; out of
//   scope). What a caution day SKIPS is the whole wrapped
//   competent.daily — the solo forage trip, stoneRun, counterPlay,
//   workTrapline, vinebank.
//
// SUPPRESSION ACCOUNTING (honest): a caution day counts as "trip
// suppressed" ONLY when needTrip(Game, ctx) is true that day — the
// trip would actually have happened. Days the bot wouldn't have
// tripped anyway are caution days, not suppressions.
//
// WHAT IT DOES NOT DO:
//   - No party formation (the persistent-party program is separate).
//   - No flee, fight, toughness, gear, or ability change.
//   - No Math.random in this file: the caution decision is a vid
//     compare plus day arithmetic. The haven chores draw from the
//     policy RNG stream exactly as the wrapped daily would — the same
//     class of stream divergence as any policy arm.
//
// LIMITS (stated so the pilot cannot be misread — see the prereg's
// ceiling section): a daily-level gate can never prevent a death
// inside the death day's OWN daily() call (the rest of daily() keeps
// running with the new bearer after a mid-trip succession — that is
// the same-day cascade), nor deaths by bearers who survived 3+ days
// (the window has expired). The ceiling analysis puts the best
// possible P1 at 0.737x control; the assigned 0.6x bar stands as
// judge and sits below that ceiling.
//
// COUNTERS: module-level stats (resetSuccessorcautionStats /
// successorcautionStats) so the driver can capture per-seed numbers
// without reaching into harness ctx. Detection state lives in the
// run's ctx (resets naturally per run).
'use strict';
const { answercourtPolicy, answercourtStats, resetAnswercourtStats, answerNationalBeat } = require('./competent-answercourt-b');
const { scaleClimb } = require('./competent-scaleclimb-b');
const { competent, competentEat, keepPromises, sortHaul, talkRound, gearUp, needTrip, walkHome } = require('./competent');

// CAUTION_DAYS (pre-registered N) — the successor's first N daily()
// calls are caution days. Frozen; do not tune.
const CAUTION_DAYS = 2;

const STATS = { successionsDetected: 0, cautionDays: 0,
  tripsSuppressed: 0, tripsNotNeeded: 0, havenDays: 0,
  courtAnswersOnCaution: 0, walkHomeCalls: 0, sayLines: 0,
  errors: 0, events: [] };
function resetSuccessorcautionStats() {
  STATS.successionsDetected = 0; STATS.cautionDays = 0;
  STATS.tripsSuppressed = 0; STATS.tripsNotNeeded = 0; STATS.havenDays = 0;
  STATS.courtAnswersOnCaution = 0; STATS.walkHomeCalls = 0; STATS.sayLines = 0;
  STATS.errors = 0;
  STATS.events = [];
}
function successorcautionStats() { return JSON.parse(JSON.stringify(STATS)); }

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function scholarId(Game) { try { return Game.villagerId || null; } catch (e) { return null; } }
function scholarName(Game) {
  try {
    const id = scholarId(Game);
    const rec = ((Game.data || {}).villagers || []).find(function (p) { return p && p.id === id; })
      || ((Game.data || {}).background_survivors || []).find(function (p) { return p && p.id === id; });
    return (rec && rec.name) || null;
  } catch (e) { return null; }
}
function event(day, kind, extra) {
  var e = { day: day, kind: kind };
  if (extra) { for (var k in extra) { if (k !== 'day' && k !== 'kind') e[k] = extra[k]; } }
  STATS.events.push(e);
  if (STATS.events.length > 400) STATS.events.splice(0, STATS.events.length - 400);
}

// cautionState(Game, ctx): the pure decision — exported for the proof
// test. Returns { caution: bool, daysLeft: number, successorDay: number }
// and updates ctx detection state. A vid change means a succession
// happened since the last daily() call; the window covers this daily()
// call and the next CAUTION_DAYS - 1.
function cautionState(Game, ctx) {
  var day = dayOf(Game);
  var vid = scholarId(Game);
  if (!ctx) ctx = {};
  if (ctx._scVid === undefined) {
    // First daily() call of the run: record the founding bearer. No
    // succession has happened yet — no caution.
    ctx._scVid = vid;
    ctx._scCautionUntilDay = 0;
    ctx._scSaidFor = null;
    return { caution: false, daysLeft: 0, successorDay: 0 };
  }
  if (vid !== null && vid !== ctx._scVid) {
    // SUCCESSION: the Codex passed to a new bearer since the last
    // daily() call. The window covers this daily() call and the next
    // CAUTION_DAYS - 1.
    var prev = ctx._scVid;
    ctx._scVid = vid;
    ctx._scCautionUntilDay = day + CAUTION_DAYS - 1;
    ctx._scSaidFor = null;
    STATS.successionsDetected += 1;
    event(day, 'succession', { from: prev, to: vid, cautionUntilDay: ctx._scCautionUntilDay });
    return { caution: true, daysLeft: CAUTION_DAYS, successorDay: day };
  }
  var until = ctx._scCautionUntilDay || 0;
  if (day <= until) {
    return { caution: true, daysLeft: (until - day) + 1, successorDay: (until - CAUTION_DAYS) + 1 };
  }
  return { caution: false, daysLeft: 0, successorDay: 0 };
}

function atHaven(Game) {
  try { return !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) { return false; }
}

// havenDay(Game, ctx, st): the caution day. Court + climb still run;
// the scholar stays at/near Haven and does Haven work. Returns nothing.
function havenDay(Game, ctx, st) {
  var day = dayOf(Game);
  STATS.cautionDays += 1;
  STATS.havenDays += 1;
  // 1. The court is still answered same-day — caution never delays
  // national.
  try {
    var answered = answerNationalBeat(Game, ctx);
    if (answered && answered !== 'unknown-shape' && answered !== null) STATS.courtAnswersOnCaution += 1;
  } catch (e) { STATS.errors += 1; }
  // 5. One voiced line, first caution day per succession only, so the
  // stay reads in the transcript instead of going silent.
  try {
    if (ctx && ctx._scSaidFor !== ctx._scVid && typeof Game.say === 'function') {
      var name = scholarName(Game);
      var first = name ? name.split(' ')[0] : 'The new bearer';
      Game.say(first + ' stays by the fire today — the Codex is heavy, and the wild can wait a day. (The village mourns; the new bearer stays home.)');
      ctx._scSaidFor = ctx._scVid;
      STATS.sayLines += 1;
    }
  } catch (e) { STATS.errors += 1; }
  // 4. If the successor did not wake at Haven, walk home honestly
  // (the safe direction — the same walk the normal day ends with).
  try {
    if (!atHaven(Game) && !Game.over && !Game.tbfight) {
      var v = (Game.state || {}).village || {};
      var hx = (v.px === undefined ? 4 : v.px), hy = (v.py === undefined ? 4 : v.py);
      walkHome(Game, hx, hy);
      STATS.walkHomeCalls += 1;
    }
  } catch (e) { STATS.errors += 1; }
  // 2. Scale verbs still run (Haven verbs).
  try { scaleClimb(Game, ctx); } catch (e) { STATS.errors += 1; }
  // 3. Haven chores: promises, sort, eat, talk, check the new kit.
  try { keepPromises(Game, ctx); } catch (e) { STATS.errors += 1; }
  try { sortHaul(Game, ctx); } catch (e) { STATS.errors += 1; }
  try { competentEat(Game); } catch (e) { STATS.errors += 1; }
  try { talkRound(Game, ctx); } catch (e) { STATS.errors += 1; }
  try { gearUp(Game, ctx); } catch (e) { STATS.errors += 1; }
  event(day, 'caution-day', { daysLeft: st.daysLeft, atHaven: atHaven(Game) });
}

const successorcautionPolicy = Object.assign({}, answercourtPolicy, {
  id: 'competent-successorcaution-b',
  desc: 'competent-answercourt-b + successor caution: the new scholar stays at Haven (no solo forage trip) for their first 2 days after succession; court + climb still run; policy-side probe only',
  daily(Game, ctx) {
    var st = null;
    try { st = cautionState(Game, ctx); } catch (e) { STATS.errors += 1; st = { caution: false, daysLeft: 0, successorDay: 0 }; }
    if (!st || !st.caution) {
      try { answercourtPolicy.daily(Game, ctx); } catch (e) {}
      return;
    }
    // Caution day: count the suppression honestly — only when the trip
    // would actually have happened.
    try {
      if (needTrip(Game, ctx)) STATS.tripsSuppressed += 1;
      else STATS.tripsNotNeeded += 1;
    } catch (e) { STATS.errors += 1; }
    try { havenDay(Game, ctx, st); } catch (e) { STATS.errors += 1; }
  },
});

module.exports = { successorcautionPolicy: successorcautionPolicy,
  resetSuccessorcautionStats: resetSuccessorcautionStats,
  successorcautionStats: successorcautionStats,
  cautionState: cautionState, havenDay: havenDay,
  CAUTION_DAYS: CAUTION_DAYS };
