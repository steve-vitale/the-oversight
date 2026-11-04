// linkseek-analyze-20261104.js — link-seeking diag analyzer
// (arm sim-linkseek-b). Wraps scripts/diplo-analyze-20261104.js
// (base stage summary + proposal classifier) and adds:
//   - first-known / first-opinion / first-opinion-10 days,
//   - pending-ever flags (counter/accord/national/global/raid/
//     aidOffer/aidBeg),
//   - the offer-point table (all link channels + the non-link
//     aid channel, reported separately),
//   - the critical-path stall stage (pre-registered in
//     sim-linkseek-b-prereg.md): first zero stage on
//     S0 -> S1 -> S4 -> S5 -> S6 -> S7 -> S8, where S4 means
//     zero offer points across ALL channels (S2 opinion and
//     S3 travel are context stages, not stall candidates),
//   - stall-majority judgeGo (DIAG-GO iff one stall stage on
//     >= 6/8 seeds AND instrument errors 0 on all judged
//     seeds; INSUFFICIENT-DATA only if > 2 seeds carry
//     instrument errors or zero otherVillages at day 1).
// Pure functions over a per-seed JSON corpus: no Game, no harness.
'use strict';
const BASE = require('./diplo-analyze-20261104');

const LINK_MENU_RE = /link|bond|covenant|alliance|primacy/i;

function countFn(events, fn) {
  return (events || []).filter(function (e) { return e.fn === fn; }).length;
}

function offerPoints(out) {
  const dec = out.decisionEvents || [];
  const convo = out.convoEvents || [];
  const court = out.courtshipEvents || [];
  const props = out.proposalEvents || [];
  const daily = out.daily || [];
  const pendingEver = {
    counter: daily.some(function (s) { return s.pending && s.pending.counter; }),
    accord: daily.some(function (s) { return s.pending && s.pending.accord; }),
    national: daily.some(function (s) { return s.pending && s.pending.national; }),
    global: daily.some(function (s) { return s.pending && s.pending.global; }),
    raid: daily.some(function (s) { return s.pending && s.pending.raid; }),
    aidOffer: daily.some(function (s) { return s.pending && s.pending.aidOffer; }),
    aidBeg: daily.some(function (s) { return s.pending && s.pending.aidBeg; }),
  };
  const proposeCalls = props.filter(function (e) { return e.fn !== 'proposeAlliance'; }).length;
  const allianceCalls = props.filter(function (e) { return e.fn === 'proposeAlliance'; }).length;
  const raidCalls = countFn(dec, 'raidVillage');
  const answerRaidCalls = countFn(dec, 'answerRaid');
  const bidCalls = countFn(dec, 'bidForPrimacy');
  const answerCounterCalls = countFn(court, 'answerCounter');
  const answerAccordCalls = countFn(court, 'answerAccord');
  const answerNationalCalls = countFn(court, 'answerNationalChoice');
  const answerDefenseCalls = countFn(court, 'answerDefenseCall');
  const aidOfferAnswers = countFn(dec, 'answerAidOffer');
  const aidBegAnswers = countFn(dec, 'answerAidBeg');
  const talkToCalls = countFn(dec, 'talkTo');
  const endConvoCalls = countFn(dec, 'endConvo');
  const convoTurnCalls = convo.length;
  const convoLinkMenus = convo.filter(function (e) {
    return (e.menuIds || []).some(function (id) { return id && LINK_MENU_RE.test(String(id)); });
  }).length;
  const convoLinkPicks = convo.filter(function (e) { return e.pick && LINK_MENU_RE.test(String(e.pick)); }).length;
  // A pending state with no answering call is still an offer
  // point the policy faced (reported as pending-unanswered).
  const pendingUnanswered =
    ((pendingEver.counter && answerCounterCalls === 0) ? 1 : 0) +
    ((pendingEver.accord && answerAccordCalls === 0) ? 1 : 0) +
    ((pendingEver.raid && answerRaidCalls === 0) ? 1 : 0);
  const total = proposeCalls + raidCalls + answerRaidCalls + bidCalls +
    answerCounterCalls + answerAccordCalls + convoLinkMenus + pendingUnanswered;
  return {
    proposeCalls: proposeCalls, allianceCalls: allianceCalls,
    raidCalls: raidCalls, answerRaidCalls: answerRaidCalls,
    bidCalls: bidCalls, answerCounterCalls: answerCounterCalls,
    answerAccordCalls: answerAccordCalls,
    answerNationalCalls: answerNationalCalls,
    answerDefenseCalls: answerDefenseCalls,
    pendingEver: pendingEver, pendingUnanswered: pendingUnanswered,
    aidOfferAnswers: aidOfferAnswers, aidBegAnswers: aidBegAnswers,
    talkToCalls: talkToCalls, endConvoCalls: endConvoCalls,
    convoTurnCalls: convoTurnCalls, convoLinkMenus: convoLinkMenus,
    convoLinkPicks: convoLinkPicks,
    total: total,
  };
}

function firstDays(out) {
  const daily = out.daily || [];
  let firstKnown = null, firstOpinion = null, firstOpinion10 = null;
  for (const snap of daily) {
    for (const ov of (snap.ovs || [])) {
      if (firstKnown == null && ov.known) firstKnown = snap.day;
      if (firstOpinion == null && ov.opinion != null) firstOpinion = snap.day;
      if (firstOpinion10 == null && ov.opinion != null && ov.opinion >= 10) firstOpinion10 = snap.day;
    }
    if (firstKnown != null && firstOpinion != null && firstOpinion10 != null) break;
  }
  return { firstKnownDay: firstKnown, firstOpinionDay: firstOpinion, firstOpinion10Day: firstOpinion10 };
}

function stallOf(s, op) {
  if (!s.ovMax) return 'S0';
  if (!s.knownEver) return 'S1';
  if (!op.total) return 'S4';
  const judged = (s.proposalOutcomes || {});
  const judgedN = (judged.accepted || 0) + (judged.countered || 0) + (judged.declined || 0);
  if (!s.linksFormed && !judgedN) return 'S4-refused';
  if (!s.linksFormed) return 'S5-declined';
  if (!s.seasonedEver) return 'S7';
  if (!s.regionalEver) return 'S8';
  return 'S8+';
}

function summarizeSeed(out) {
  const s = BASE.summarizeSeed(out);
  const op = offerPoints(out);
  const fd = firstDays(out);
  s.offerPoints = op;
  s.firstKnownDay = fd.firstKnownDay;
  s.firstOpinionDay = fd.firstOpinionDay;
  s.firstOpinion10Day = fd.firstOpinion10Day;
  s.stall = stallOf(s, op);
  const daily = out.daily || [];
  const last = daily[daily.length - 1] || null;
  s.finalLinkTotal = last ? (last.linkTotal == null ? null : last.linkTotal) : null;
  s.finalEverFormed = last ? (last.everFormed == null ? null : last.everFormed) : null;
  s.maxLinkTotal = daily.reduce(function (m, snap) { return Math.max(m, snap.linkTotal || 0); }, 0);
  s.maxEverFormed = daily.reduce(function (m, snap) { return Math.max(m, snap.everFormed || 0); }, 0);
  s.maxDiplomacy = null;
  for (const snap of daily) {
    const st = snap.standing;
    const d = st && (st.diplomacy != null ? st.diplomacy : null);
    if (typeof d === 'number' && (s.maxDiplomacy == null || d > s.maxDiplomacy)) s.maxDiplomacy = d;
  }
  return s;
}

function judgeGo(summaries) {
  const counts = {};
  summaries.forEach(function (s) { counts[s.stall] = (counts[s.stall] || 0) + 1; });
  let best = null, bestN = 0;
  Object.keys(counts).forEach(function (k) { if (counts[k] > bestN) { bestN = counts[k]; best = k; } });
  const totalErrors = summaries.reduce(function (a, s) { return a + (s.instrumentErrors || 0); }, 0);
  const bad = summaries.filter(function (s) { return (s.instrumentErrors || 0) > 0 || (s.ovAtDay1 || 0) === 0; }).length;
  let verdict;
  if (bad > 2) verdict = 'INSUFFICIENT-DATA';
  else if (bestN >= 6 && totalErrors === 0) verdict = 'DIAG-GO';
  else verdict = 'DIAG-NO-CANDIDATE';
  return { counts: counts, majorityStage: best, majorityN: bestN, total: summaries.length,
    totalErrors: totalErrors, insufficientData: bad > 2, badSeeds: bad, verdict: verdict };
}

module.exports = { summarizeSeed: summarizeSeed, classifyProposal: BASE.classifyProposal, judgeGo: judgeGo, offerPoints: offerPoints, LINK_MENU_RE: LINK_MENU_RE };
