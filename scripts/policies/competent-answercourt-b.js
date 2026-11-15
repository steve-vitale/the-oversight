// competent-answercourt-b — the FIRST-COURT ANSWER lever (arm
// sim-answercourt-b, run fleshout-loop-b-20261114T1945Z, axis
// winnability chain).
//
// POLICY-SIDE ONLY. ZERO src/js changes, zero default flips, no changes
// to any existing policy file. This is a measurement instrument, not a
// play recommendation: it composes onto the RECOVERED scaleclimb policy
// (scripts/policies/competent-scaleclimb-b.js, byte-identical to commit
// 29a794df6 — the baseline) and adds exactly ONE thing: answering every
// staged national beat with the shape-mapped answer from leadcourt.js.
// It isolates the court answer from holdpantry's banking+answers
// bundle (banking: none here; global answers: none here).
//
// THE ADDITION (frozen in the prereg — do not tune), at the START of
// the armed daily, BEFORE scaleclimb's daily (so the same day's
// propose/tend can proceed once the beat is answered):
//   pendingNational shape -> answerNationalChoice(how):
//     lead     -> 'feast'  (5,000 kcal, +10 trust each sub — the
//                            generous answer that also feeds the hold)
//     conquest -> 'mercy'  (yoke eased to courtship terms, +8 trust,
//                            mercyUntil day+30 grace)
//     belong   -> 'swear'  (3,000 kcal oath, +12 trust)
//     covenant -> 'pact'   (war-pact sworn, +8 each; the shared pool
//                            opens beside it either way)
//     trade    -> 'sign'   (charter sealed at the table rate, +6 each)
//   Unknown shape -> do NOT answer (the engine itself returns null for
//   an unknown shape and never sets nationalLive). Counts as an
//   instrument error.
//   'refuse' is NEVER chosen (permanent scale refusal). 'walk' is
//   NEVER chosen (belong-walk refuses the scale permanently).
//   GLOBAL beats (pendingGlobal) are NOT answered by this arm: the
//   global beat can only stage after national is already live, so it
//   cannot move the primary metric, and pendingGlobal does not block
//   scaleclimb proposes. Strict isolation — see the prereg.
//
// WHAT IT DOES NOT DO (stated so the pilot cannot be misread):
//   - No banking step (no sort/cook/forage/donate), no pack changes,
//     no tend-predicate or tend-gate change, no tribute change.
//   - No seat-taking (tableTakeSeat) — OUT OF SCOPE, a Steve-call.
//   - No proposeCovenant / proposeTrade / raidVillage. No
//     defense-call answers. No global-beat answers.
//   - The courtship core is scaleclimb VERBATIM (propose day 10,
//     detJudge >= 45, SUB_CAP 3, tend below the seasoned bar only).
//   - No Math.random in this file: the answer mapping is a fixed
//     table; the only new RNG draws in the armed leg are the engine's
//     own (inside answerNationalChoice's host/serve branches, which
//     this mapping never selects — feast/swear/mercy/pact/sign draw
//     no RNG beyond the engine's own trust/proportional rules).
//
// COUNTERS: module-level stats (resetAnswercourtStats /
// answercourtStats) so the driver can capture per-seed numbers
// without reaching into harness ctx. The scaleclimb counters live in
// the wrapped policy's own stats (scaleclimbStats), untouched.
'use strict';
const { scaleclimbPolicy, scaleclimbStats, resetScaleclimbStats } = require('./competent-scaleclimb-b');

// Per-shape answer mapping — PRE-REGISTERED (prereg §"THE ADDITION"),
// copied from leadcourt.js. Do not tune.
const NATIONAL_ANSWERS = {
  lead: 'feast',
  conquest: 'mercy',
  belong: 'swear',
  covenant: 'pact',
  trade: 'sign',
};

const STATS = { nationalAnswers: 0,
  nationalAnswersByShape: { lead: 0, conquest: 0, belong: 0, covenant: 0, trade: 0 },
  nationalUnknownShape: 0, pendingNationalDays: 0, globalPendingDays: 0,
  errors: 0, events: [] };
function resetAnswercourtStats() {
  STATS.nationalAnswers = 0;
  STATS.nationalAnswersByShape = { lead: 0, conquest: 0, belong: 0, covenant: 0, trade: 0 };
  STATS.nationalUnknownShape = 0; STATS.pendingNationalDays = 0;
  STATS.globalPendingDays = 0; STATS.errors = 0;
  STATS.events = [];
}
function answercourtStats() { return JSON.parse(JSON.stringify(STATS)); }

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function event(day, kind, shape, answer, extra) {
  var e = { day: day, kind: kind, shape: shape || null, answer: answer || null };
  if (extra) { for (var k in extra) { if (k !== 'day' && k !== 'kind' && k !== 'shape' && k !== 'answer') e[k] = extra[k]; } }
  STATS.events.push(e);
  if (STATS.events.length > 400) STATS.events.splice(0, STATS.events.length - 400);
}

// answerNationalBeat: answer ONE staged national beat with the
// pre-registered per-shape answer. Exported for the proof test (a
// fake Game can stage a pendingNational per shape without a full run).
// Returns the answer given, 'unknown-shape' (not answered), or null
// (no beat pending).
function answerNationalBeat(Game, ctx) {
  try {
    if (Game.over) return null;
    var day = dayOf(Game);
    var st = Game.state || {};
    if (st.pendingNational) STATS.pendingNationalDays += 1;
    if (st.pendingGlobal) STATS.globalPendingDays += 1;
    if (!st.pendingNational) return null;
    if (typeof Game.answerNationalChoice !== 'function') { STATS.errors += 1; return null; }
    var shape = st.pendingNational.shape;
    var how = NATIONAL_ANSWERS[shape];
    if (!how) {
      // Unknown shape — defensive: never set nationalLive on a beat we
      // don't understand (mirrors the engine's own defensive branch).
      STATS.nationalUnknownShape += 1;
      STATS.errors += 1;
      event(day, 'national-unknown-shape', shape, null, { villages: (st.pendingNational.villages || []).length });
      return 'unknown-shape';
    }
    var ret = null;
    try { ret = Game.answerNationalChoice(how); } catch (e) { STATS.errors += 1; return null; }
    STATS.nationalAnswers += 1;
    STATS.nationalAnswersByShape[shape] += 1;
    event(day, 'national-answer', shape, how, { result: (ret === true ? 'sat' : (ret === null ? 'died-aloud' : String(ret).slice(0, 40))) });
    return how;
  } catch (e) { STATS.errors += 1; return null; }
}

const answercourtPolicy = Object.assign({}, scaleclimbPolicy, {
  id: 'competent-answercourt-b',
  desc: 'competent-scaleclimb-b + answer EVERY staged national beat (lead feast / conquest mercy / belong swear / covenant pact / trade sign); no banking, no global answers, policy-side probe only',
  daily(Game, ctx) {
    try { answerNationalBeat(Game, ctx); } catch (e) {}
    try { scaleclimbPolicy.daily(Game, ctx); } catch (e) {}
  },
});

module.exports = { answercourtPolicy: answercourtPolicy,
  resetAnswercourtStats: resetAnswercourtStats, answercourtStats: answercourtStats,
  answerNationalBeat: answerNationalBeat, NATIONAL_ANSWERS: NATIONAL_ANSWERS };
