'use strict';
// test-journey-deepening-r116-analyzer-20261107.js -- R116 analyzer proof
// (runs the REAL analyzer on synthetic seed JSONs).
// summarizeLangArc: the driver's langArcSittings / langArcEnd join with
// langGateDecisions. Cases:
//   (1) sittings at comm 'none' with exposure 0->1 (open-only, no
//       listens), 0 flips -> ARC-UNEXERCISED;
//   (2) a sitting flips a language (22 -> 25) and a decision on a holder
//       of that language follows -> ARC-FIRES, postFlipDecisions 1;
//   (3) a flip with no decisions after it -> ARC-FLIPS-NO-PAYOFF;
//   (4) no sittings at all -> NO-CONTACT;
//   (5) a decision BEFORE the flip does not count as post-flip
//       (flip day 50, decision day 40 -> ARC-FLIPS-NO-PAYOFF);
//   (6) an end-state flip (learned at seed end, no sitting flip) counts
//       as a flip (via end-state);
//   (7) listens / speak_backs are counted from the picks pressed.
// summarizeGoalJoin: goalSnaps x goalLineDays. Cases:
//   (8) capture hits > 0 -> HEALTHY; (9) lined + departed, 0 capture
//       hits -> COUNTER-FAULT; (10) tops exist, never lined -> GOALS-FAULT;
//   (11) no tops at all -> NO-DATA; (12) lined but never departed
//       (idle objective), 0 capture -> GOALS-FAULT (the goal annotates
//       but never moves the villager out the door).
// summarizeRequests talkedSittings join (r114 metric-review proposal):
//   (13) a request talked to ONLY via a sitting (no talkTo event) counts
//       as talked-while-live; (14) control: no sitting, no talkTo ->
//       expiredTalkableUntalked counts it.
const A = require('./analyze-journey-deepening-r116-20261107.js');
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function seedJSON(over) {
  const base = { seed: 96401, census: [{ id: 'v_h1' }, { id: 'v_h2' }], deaths: [],
    bond: { tele: [], proposals: [], decisions: [], links: [], sayLines: [], daily: [], convoEvents: [], errors: [] },
    talkReqSnaps: [], langGateOffers: [], langGateDecisions: [],
    langArcSittings: [], langArcDays: [], talkedSittings: [],
    langArcEnd: { langs: [], learned: {} }, goalSnaps: [], goalLineDays: [],
    goalLines: { counts: {}, total: 0 } };
  return Object.assign(base, over || {});
}
function sitting(day, vid, lang, expBefore, expAfter, commBefore, commAfter, picks) {
  return { day, vid, lang, expBefore, expAfter, commBefore, commAfter, picks: picks || ['leave'] };
}
// (1) ARC-UNEXERCISED: open-only sittings, no flips.
{
  const s = seedJSON();
  s.langArcSittings = [
    sitting(45, 'v_h1', 'ukrainian', 0, 1, 'none', 'none'),
    sitting(60, 'v_h1', 'ukrainian', 1, 2, 'none', 'none'),
    sitting(60, 'v_h2', 'french', 0, 1, 'none', 'none'),
  ];
  const r = A.summarizeLangArc(s);
  ok('Q1-ARC (1) sittings counted', r.sittings === 3, JSON.stringify(r));
  ok('Q1-ARC (1) max exposure tracked per language', r.langs.ukrainian.maxExp === 2 && r.langs.french.maxExp === 1, JSON.stringify(r.langs));
  ok('Q1-ARC (1) verdict ARC-UNEXERCISED', r.verdict === 'ARC-UNEXERCISED', r.verdict);
  ok('Q1-ARC (1) 0 flips', r.flips === 0, JSON.stringify(r));
}
// (2) ARC-FIRES: flip then a decision on the flipped language.
{
  const s = seedJSON();
  s.langArcSittings = [
    sitting(45, 'v_h1', 'spanish', 0, 13, 'none', 'none', ['nv:listen', 'nv:listen', 'nv:listen', 'nv:listen', 'leave']),
    sitting(60, 'v_h1', 'spanish', 13, 25, 'none', 'partial', ['nv:listen', 'nv:listen', 'nv:listen', 'nv:listen', 'leave']),
  ];
  s.langGateDecisions = [{ day: 62, fn: 'acceptBondProposal', vid: 'v_h1', comm: 'partial' }];
  const r = A.summarizeLangArc(s);
  ok('Q1-ARC (2) verdict ARC-FIRES', r.verdict === 'ARC-FIRES', r.verdict);
  ok('Q1-ARC (2) 1 flip', r.flips === 1, JSON.stringify(r));
  ok('Q1-ARC (2) 1 post-flip decision', r.postFlipDecisions === 1, JSON.stringify(r));
  ok('Q1-ARC (2) listens counted from picks', r.langs.spanish.listens === 8, JSON.stringify(r.langs.spanish));
}
// (3) ARC-FLIPS-NO-PAYOFF: flip, no decisions.
{
  const s = seedJSON();
  s.langArcSittings = [sitting(60, 'v_h2', 'french', 10, 25, 'none', 'partial', ['nv:listen', 'nv:listen', 'nv:listen', 'nv:listen', 'nv:listen', 'leave'])];
  const r = A.summarizeLangArc(s);
  ok('Q1-ARC (3) verdict ARC-FLIPS-NO-PAYOFF', r.verdict === 'ARC-FLIPS-NO-PAYOFF', r.verdict);
  ok('Q1-ARC (3) 1 flip, 0 post-flip decisions', r.flips === 1 && r.postFlipDecisions === 0, JSON.stringify(r));
}
// (4) NO-CONTACT: no sittings.
{
  const s = seedJSON();
  const r = A.summarizeLangArc(s);
  ok('Q1-ARC (4) verdict NO-CONTACT', r.verdict === 'NO-CONTACT', r.verdict);
}
// (5) A decision BEFORE the flip does not count as post-flip.
{
  const s = seedJSON();
  s.langArcSittings = [sitting(50, 'v_h1', 'spanish', 22, 25, 'none', 'partial', ['nv:listen', 'leave'])];
  s.langGateDecisions = [{ day: 40, fn: 'declineBondProposal', vid: 'v_h1', comm: 'none' }];
  const r = A.summarizeLangArc(s);
  ok('Q1-ARC (5) pre-flip decision is not post-flip', r.postFlipDecisions === 0, JSON.stringify(r));
  ok('Q1-ARC (5) verdict ARC-FLIPS-NO-PAYOFF', r.verdict === 'ARC-FLIPS-NO-PAYOFF', r.verdict);
}
// (6) End-state flip counts (wake-up scene path, no sitting flip).
{
  const s = seedJSON();
  s.langArcEnd = { langs: [{ lang: 'french', exposure: 25, learned: 1 }], learned: { french: 1 } };
  const r = A.summarizeLangArc(s);
  ok('Q1-ARC (6) end-state flip counted', r.flips === 1, JSON.stringify(r));
  ok('Q1-ARC (6) verdict ARC-FLIPS-NO-PAYOFF', r.verdict === 'ARC-FLIPS-NO-PAYOFF', r.verdict);
}
// (7) speak_back counted from picks.
{
  const s = seedJSON();
  s.langArcSittings = [sitting(45, 'v_h1', 'spanish', 3, 9, 'none', 'none', ['speak_back', 'nv:listen', 'leave'])];
  const r = A.summarizeLangArc(s);
  ok('Q1-ARC (7) speak_back counted', r.langs.spanish.speakBacks === 1, JSON.stringify(r.langs.spanish));
  ok('Q1-ARC (7) gain summed', r.langs.spanish.gain === 6, JSON.stringify(r.langs.spanish));
}
function snap(day, villagers) { return { day, villagers }; }
function villager(vid, top, objKind, objGoal, objGoalLine, objState) {
  return { vid, name: vid, top, objKind, objGoal, objGoalLine, objState };
}
// (8) HEALTHY: capture hits > 0.
{
  const s = seedJSON();
  s.goalSnaps = [snap(45, [villager('v_h1', 'party_up', 'VISIT', 'party_up', 'Company makes the road shorter.', 'active')])];
  s.goalLineDays = [{ day: 45, counts: { party_up: 2, food_security: 0, bonds: 0, knowledge: 0, safety: 0, bank_veterans: 0, build_standing: 0, gear_up: 0 }, total: 2 }];
  const r = A.summarizeGoalJoin(s);
  ok('Q2-JOIN (8) party_up HEALTHY with capture hits', r.byTrack.party_up.verdict === 'HEALTHY', JSON.stringify(r.byTrack.party_up));
}
// (9) COUNTER-FAULT: lined + departed, 0 capture hits.
{
  const s = seedJSON();
  s.goalSnaps = [snap(45, [villager('v_h1', 'food_security', 'FORAGE', 'food_security', "The pantry won't fill itself.", 'returning')])];
  s.goalLineDays = [{ day: 45, counts: { party_up: 0, food_security: 0, bonds: 0, knowledge: 0, safety: 0, bank_veterans: 0, build_standing: 0, gear_up: 0 }, total: 0 }];
  const r = A.summarizeGoalJoin(s);
  ok('Q2-JOIN (9) food_security COUNTER-FAULT (departed, never captured)', r.byTrack.food_security.verdict === 'COUNTER-FAULT', JSON.stringify(r.byTrack.food_security));
}
// (10) GOALS-FAULT: tops exist, never lined.
{
  const s = seedJSON();
  s.goalSnaps = [snap(45, [villager('v_h1', 'safety', 'HAVEN_CHORE', null, null, 'active')])];
  s.goalLineDays = [{ day: 45, counts: { party_up: 0, food_security: 0, bonds: 0, knowledge: 0, safety: 0, bank_veterans: 0, build_standing: 0, gear_up: 0 }, total: 0 }];
  const r = A.summarizeGoalJoin(s);
  ok('Q2-JOIN (10) safety GOALS-FAULT (tops, never lined)', r.byTrack.safety.verdict === 'GOALS-FAULT', JSON.stringify(r.byTrack.safety));
}
// (11) NO-DATA: no tops at all.
{
  const s = seedJSON();
  s.goalSnaps = [snap(45, [villager('v_h1', 'food_security', 'FORAGE', 'food_security', "The pantry won't fill itself.", 'active')])];
  s.goalLineDays = [{ day: 45, counts: { party_up: 0, food_security: 1, bonds: 0, knowledge: 0, safety: 0, bank_veterans: 0, build_standing: 0, gear_up: 0 }, total: 1 }];
  const r = A.summarizeGoalJoin(s);
  ok('Q2-JOIN (11) knowledge NO-DATA (no tops)', r.byTrack.knowledge.verdict === 'NO-DATA', JSON.stringify(r.byTrack.knowledge));
}
// (12) Lined but never departed -> GOALS-FAULT (annotates, never leaves).
{
  const s = seedJSON();
  s.goalSnaps = [snap(45, [villager('v_h1', 'bonds', 'HAVEN_CHORE', 'bonds', "They've been meaning to check on their people.", 'idle')])];
  s.goalLineDays = [{ day: 45, counts: { party_up: 0, food_security: 0, bonds: 0, knowledge: 0, safety: 0, bank_veterans: 0, build_standing: 0, gear_up: 0 }, total: 0 }];
  const r = A.summarizeGoalJoin(s);
  ok('Q2-JOIN (12) bonds GOALS-FAULT (lined, never departed)', r.byTrack.bonds.verdict === 'GOALS-FAULT', JSON.stringify(r.byTrack.bonds));
  ok('Q2-JOIN (12) lined counted even when never departed', r.byTrack.bonds.lined === 1, JSON.stringify(r.byTrack.bonds));
}
// (13) talkedSittings: a request talked to ONLY via a sitting counts.
{
  const s = seedJSON();
  s.bond.tele = [
    { day: 10, outcome: 'staged', kind: 'person', initiator: 'v_h1', target: 'scholar1', scholarId: 'scholar1' },
    { day: 13, outcome: 'expired', kind: 'person', initiator: 'v_h1', target: 'scholar1', scholarId: 'scholar1' },
  ];
  s.bond.daily = [{ day: 10, roster: ['v_h1', 'v_h2'] }];
  s.talkReqSnaps = [{ day: 10, bond: [{ vid: 'v_h1', day: 10, kind: 'bond' }], link: [], talk: [] }];
  s.talkedSittings = [{ day: 11, vid: 'v_h1', q1Request: true }];
  const r = A.summarizeRequests(s);
  ok('Q1-REQ (13) sitting counts as talked-while-live', JSON.stringify(r.requests[0].talkedWhileLive) === '[11]', JSON.stringify(r.requests[0]));
  ok('Q1-REQ (13) expired-talkable-untalked is 0 with the sitting', r.expiredTalkableUntalked === 0, JSON.stringify(r));
}
// (14) Control: no sitting, no talkTo -> untalked.
{
  const s = seedJSON();
  s.bond.tele = [
    { day: 10, outcome: 'staged', kind: 'person', initiator: 'v_h1', target: 'scholar1', scholarId: 'scholar1' },
    { day: 13, outcome: 'expired', kind: 'person', initiator: 'v_h1', target: 'scholar1', scholarId: 'scholar1' },
  ];
  s.bond.daily = [{ day: 10, roster: ['v_h1', 'v_h2'] }];
  s.talkReqSnaps = [{ day: 10, bond: [{ vid: 'v_h1', day: 10, kind: 'bond' }], link: [], talk: [] }];
  const r = A.summarizeRequests(s);
  ok('Q1-REQ (14) control: talkedWhileLive empty without sitting or talkTo', r.requests[0].talkedWhileLive.length === 0, JSON.stringify(r.requests[0]));
  ok('Q1-REQ (14) control: expired-talkable-untalked counts it', r.expiredTalkableUntalked === 1, JSON.stringify(r));
}
console.log(`\nR116 analyzer proof: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
