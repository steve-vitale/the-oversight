// competent-succpolity-b — the SUCCGRACE-BEAT ANSWER lever (arm
// sim-succpolity-b, run fleshout-loop-b-20261114T2345Z, axis
// winnability chain).
//
// POLICY-SIDE ONLY. ZERO src/js changes, zero default flips, no changes
// to any existing policy file. This is a measurement instrument, not a
// play recommendation: it composes onto the RECOVERED answercourt policy
// (scripts/policies/competent-answercourt-b.js, byte-identical to
// ed6df749e — the answered court) and adds exactly ONE thing: answering
// SUCCGRACE renegotiation beats — and ONLY succgrace beats — with the
// gift, so the SUCCGRACE=1 env lever is actually exercised.
//
// WHY A POLICY ADDITION IS NEEDED: SUCCGRACE=1 stages an answerable
// renegotiation beat (link.pendingRenegotiation with succgrace: true)
// for a Haven-primary link below the seasoned bar at a succession that
// would dissolve the realm aloud. The beat does nothing unanswered —
// it expires after 7 days and the realm dissolves exactly as today.
// The answercourt policy does NOT answer renegotiation beats (verified:
// no Renegot in either recovered policy; the corpus's armed 100203
// file carries 0 answerRenegotiation verb events), and the engine's
// _answermailDriveDaily (the only other answerer) is DEFAULT-OFF and
// unset in the corpus env. Without this addition the SUCCGRACE leg
// would be indistinguishable from its baseline.
//
// THE ADDITION (frozen in the prereg — do not tune), at the START of
// the armed daily, BEFORE the national-beat answer:
//   for each active link with link.pendingRenegotiation &&
//   link.pendingRenegotiation.succgrace === true:
//     answerRenegotiation(link.id, 'gift')
//   Young-link renegotiation beats (succgrace falsy) are LEFT to lapse
//   exactly as the baseline does — that isolates the SUCCGRACE lever
//   from the young-link grace idiom. The driver joins verbEvents to the
//   series' prSg field, so any answer landing on a non-succgrace beat
//   is an instrument error (G1).
//
// ANSWER CHOICE 'gift' (1,500 kcal, trust +8): matches the engine's own
// answermail-drive precedent (answers every renegotiation beat with
// grain, never silence); strongest trust gain (+8 vs visit's +5 — a
// link at 32–39 after the −8 haircut needs +8 to cross the 40 bar);
// no speaker absence during the funeral week (visit rides the speaker
// out for 2 days); 'wait' is the lapse (−6) and is never chosen.
// The gift's cost is real food from a possibly thin pantry — the cost
// bar in the prereg judges that.
//
// WHAT IT DOES NOT DO:
//   - No change to the courtship core, the national-beat answers, the
//     tend predicate/gate, tribute, banking, seat-taking, or any other
//     verb. The answercourt policy is required verbatim and called
//     after the succgrace answers.
//   - No Math.random in this file: the answer is a fixed table (gift
//     for every succgrace beat); the only new RNG draws in the armed
//     legs are the engine's own (inside answerRenegotiation's
//     proportional-trust rule and the tribute-leverage path, which the
//     gift answer never takes).
//
// COUNTERS: module-level stats (resetSuccpolityStats /
// succpolityStats) so the driver can capture per-seed numbers without
// reaching into harness ctx. The answercourt/scaleclimb counters live
// in the wrapped policies' own stats, untouched.
'use strict';
const { answercourtPolicy, answercourtStats, resetAnswercourtStats, answerNationalBeat } = require('./competent-answercourt-b');

const STATS = { succgraceAnswers: 0, succgraceGiftKcal: 0,
  succgraceBeatsSeen: 0, youngBeatsSeen: 0, errors: 0, events: [] };
function resetSuccpolityStats() {
  STATS.succgraceAnswers = 0; STATS.succgraceGiftKcal = 0;
  STATS.succgraceBeatsSeen = 0; STATS.youngBeatsSeen = 0;
  STATS.errors = 0; STATS.events = [];
}
function succpolityStats() { return JSON.parse(JSON.stringify(STATS)); }

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce(function (t, i) { return t + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) { return 0; }
}
function event(day, kind, linkId, answer, extra) {
  var e = { day: day, kind: kind, linkId: linkId || null, answer: answer || null };
  if (extra) { for (var k in extra) { if (k !== 'day' && k !== 'kind' && k !== 'linkId' && k !== 'answer') e[k] = extra[k]; } }
  STATS.events.push(e);
  if (STATS.events.length > 400) STATS.events.splice(0, STATS.events.length - 400);
}

// answerSuccgraceBeats: answer every staged SUCCGRACE renegotiation beat
// with the pre-registered 'gift'. Exported for the proof test (a fake
// Game can stage a pendingRenegotiation per kind without a full run).
// Returns the number of beats answered. Young-link beats are counted
// (youngBeatsSeen) and deliberately NOT answered.
function answerSuccgraceBeats(Game, ctx) {
  try {
    if (Game.over) return 0;
    var day = dayOf(Game);
    var st = Game.state || {};
    var links = [];
    try { links = (typeof Game.hierarchyState === 'function') ? (Game.hierarchyState() || []) : []; } catch (e) { STATS.errors += 1; return 0; }
    var answered = 0;
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      if (!link || link.status !== 'active' || !link.pendingRenegotiation) continue;
      if (link.pendingRenegotiation.succgrace) {
        STATS.succgraceBeatsSeen += 1;
        if (typeof Game.answerRenegotiation !== 'function') { STATS.errors += 1; continue; }
        var before = pantryKcal(Game);
        var ret = null;
        try { ret = Game.answerRenegotiation(link.id, 'gift'); } catch (e) { STATS.errors += 1; continue; }
        var after = pantryKcal(Game);
        STATS.succgraceAnswers += 1;
        STATS.succgraceGiftKcal += Math.max(0, before - after);
        answered += 1;
        event(day, 'succgrace-answer', link.id, 'gift', { result: String(ret).slice(0, 40), paidKcal: Math.max(0, before - after) });
      } else {
        STATS.youngBeatsSeen += 1;
        event(day, 'young-beat-seen-not-answered', link.id, null, {});
      }
    }
    return answered;
  } catch (e) { STATS.errors += 1; return 0; }
}

const succpolityPolicy = Object.assign({}, answercourtPolicy, {
  id: 'competent-succpolity-b',
  desc: 'competent-answercourt-b + answer ONLY succgrace renegotiation beats with the gift (young-link beats left to lapse); policy-side probe for the SUCCGRACE=1 env lever',
  daily(Game, ctx) {
    try { answerSuccgraceBeats(Game, ctx); } catch (e) {}
    try { answercourtPolicy.daily(Game, ctx); } catch (e) {}
  },
});

module.exports = { succpolityPolicy: succpolityPolicy,
  resetSuccpolityStats: resetSuccpolityStats, succpolityStats: succpolityStats,
  answerSuccgraceBeats: answerSuccgraceBeats, answerNationalBeat: answerNationalBeat };
