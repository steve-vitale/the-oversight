'use strict';
// test-journey-deepening-r118-analyzer-20261107.js -- R118 analyzer proof
// (runs the REAL analyzer on synthetic seed JSONs + transcripts).
// summarizeLangArc (grant-event flips; r116 metric-review #1):
//   (1) a GRANT event is a flip, and a decision on a holder after the
//       grant day counts post-flip -> ARC-FIRES;
//   (2) an end-state learned language with NO grant event is NOT a flip
//       (a succession-granted tongue is not an arc flip) -> NO-CONTACT
//       when there are no sittings, 0 flips;
//   (3) a sitting that reaches exp>=25 / comm leaves 'none' with NO grant
//       event is an instrument gap (unmatchedFlips), not a flip ->
//       ARC-UNEXERCISED, flips 0, unmatchedFlips 1;
//   (4) a grant with no decision after it -> ARC-FLIPS-NO-PAYOFF;
//   (5) a decision BEFORE the grant day does not count as post-flip.
// summarizeGoalJoin (indoorLined):
//   (6) a safety-top villager lined indoors counts indoorLined;
//   (7) capture hits > 0 -> HEALTHY (with indoorLined still reported);
//   (8) lined + departed, 0 capture -> COUNTER-FAULT.
// scanMenuFlip:
//   (9) a transcript whose menu loses nv: after listen turns reports one
//       flip at the right turn;
//   (10) a transcript that keeps offering nv:listen every turn reports
//       no flip and counts the listen turns;
//   (11) a verbal transcript (never offers nv:listen) is not a
//       nonverbal sitting at all.
const A = require('./analyze-journey-deepening-r118-20261107.js');
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function seedJSON(over) {
  const base = { seed: 96601, census: [{ id: 'v_h1' }, { id: 'v_h2' }], deaths: [],
    bond: { tele: [], proposals: [], decisions: [], links: [], sayLines: [], daily: [], convoEvents: [], errors: [] },
    talkReqSnaps: [], langGateOffers: [], langGateDecisions: [],
    langArcSittings: [], langArcDays: [], talkedSittings: [], langGrants: [],
    langArcEnd: { langs: [], learned: {} }, goalSnaps: [], goalLineDays: [],
    goalLines: { counts: {}, total: 0 } };
  return Object.assign(base, over || {});
}
function sitting(day, vid, lang, expBefore, expAfter, commBefore, commAfter, picks) {
  return { day, vid, lang, expBefore, expAfter, commBefore, commAfter, picks: picks || ['leave'] };
}
// (1) ARC-FIRES: grant event + a decision on the holder after the grant.
{
  const s = seedJSON();
  s.langArcSittings = [sitting(60, 'v_h1', 'turkish', 20, 23, 'none', 'none', ['nv:listen', 'nv:listen'])];
  s.langGrants = [{ day: 61, vid: 'v_h1', lang: 'turkish', expAfter: 25 }];
  s.langGateDecisions = [{ day: 62, vid: 'v_h1', fn: 'bond', comm: 'partial' }];
  s.langArcEnd = { langs: [{ lang: 'turkish', learned: 1, exposure: 26 }], learned: { turkish: 1 } };
  const r = A.summarizeLangArc(s);
  ok('Q1-ARC (1) grant counted as a flip', r.flips === 1, JSON.stringify(r));
  ok('Q1-ARC (1) post-flip decision counted', r.postFlipDecisions === 1, JSON.stringify(r));
  ok('Q1-ARC (1) verdict ARC-FIRES', r.verdict === 'ARC-FIRES', r.verdict);
  ok('Q1-ARC (1) end-state language reported but not double-counted',
    r.endLearnedLangs.length === 1 && r.flips === 1, JSON.stringify(r.endLearnedLangs));
}
// (2) End-state learned, NO grant, NO sittings: not a flip.
{
  const s = seedJSON();
  s.langArcEnd = { langs: [{ lang: 'turkish', learned: 1, exposure: 30 }], learned: { turkish: 1 } };
  const r = A.summarizeLangArc(s);
  ok('Q1-ARC (2) end-state alone is 0 flips', r.flips === 0, JSON.stringify(r));
  ok('Q1-ARC (2) verdict NO-CONTACT', r.verdict === 'NO-CONTACT', r.verdict);
  ok('Q1-ARC (2) the learned language is still reported', r.endLearnedLangs.length === 1, JSON.stringify(r.endLearnedLangs));
}
// (3) Sitting reaches 25 with no grant event: instrument gap, not a flip.
{
  const s = seedJSON();
  s.langArcSittings = [sitting(50, 'v_h2', 'arabic', 24, 27, 'none', 'partial', ['nv:listen'])];
  const r = A.summarizeLangArc(s);
  ok('Q1-ARC (3) no grant means 0 flips', r.flips === 0, JSON.stringify(r));
  ok('Q1-ARC (3) unmatchedFlips records the gap', r.unmatchedFlips.length === 1, JSON.stringify(r.unmatchedFlips));
  ok('Q1-ARC (3) verdict ARC-UNEXERCISED', r.verdict === 'ARC-UNEXERCISED', r.verdict);
}
// (4) Grant with no decision after it -> ARC-FLIPS-NO-PAYOFF.
{
  const s = seedJSON();
  s.langArcSittings = [sitting(60, 'v_h1', 'turkish', 22, 25, 'none', 'partial', ['nv:listen'])];
  s.langGrants = [{ day: 60, vid: 'v_h1', lang: 'turkish', expAfter: 25 }];
  const r = A.summarizeLangArc(s);
  ok('Q1-ARC (4) verdict ARC-FLIPS-NO-PAYOFF', r.verdict === 'ARC-FLIPS-NO-PAYOFF', r.verdict);
}
// (5) A decision BEFORE the grant day does not count as post-flip.
{
  const s = seedJSON();
  s.langArcSittings = [sitting(50, 'v_h1', 'turkish', 22, 25, 'none', 'partial', ['nv:listen'])];
  s.langGrants = [{ day: 50, vid: 'v_h1', lang: 'turkish', expAfter: 25 }];
  s.langGateDecisions = [{ day: 40, vid: 'v_h1', fn: 'bond', comm: 'partial' }];
  const r = A.summarizeLangArc(s);
  ok('Q1-ARC (5) pre-grant decision not post-flip', r.postFlipDecisions === 0, JSON.stringify(r));
  ok('Q1-ARC (5) verdict ARC-FLIPS-NO-PAYOFF', r.verdict === 'ARC-FLIPS-NO-PAYOFF', r.verdict);
}
// (6) indoorLined: a safety-top villager lined indoors.
{
  const s = seedJSON();
  s.goalSnaps = [{ day: 45, villagers: [
    { name: 'A', top: 'safety', objGoal: 'safety', objGoalLine: 'Better close to the fire today.', objState: 'indoor', objKind: 'HAVEN_CHORE' },
    { name: 'B', top: 'safety', objGoal: 'safety', objGoalLine: 'Better close to the fire today.', objState: 'returning', objKind: 'HAVEN_CHORE' },
  ] }];
  s.goalLineDays = [{ day: 45, counts: { safety: 0 } }];
  const r = A.summarizeGoalJoin(s);
  const T = r.byTrack.safety;
  ok('Q2-JOIN (6) safety tops counted', T.tops === 2, JSON.stringify(T));
  ok('Q2-JOIN (6) safety lined counted', T.lined === 2, JSON.stringify(T));
  ok('Q2-JOIN (6) indoorLined counts the indoor one', T.indoorLined === 1, JSON.stringify(T));
  ok('Q2-JOIN (6) departedLined counts the returning one', T.departedLined === 1, JSON.stringify(T));
}
// (7) capture hits > 0 -> HEALTHY, indoorLined still reported.
{
  const s = seedJSON();
  s.goalSnaps = [{ day: 45, villagers: [
    { name: 'A', top: 'safety', objGoal: 'safety', objGoalLine: 'Better close to the fire today.', objState: 'indoor', objKind: 'HAVEN_CHORE' },
  ] }];
  s.goalLineDays = [{ day: 45, counts: { safety: 1 } }];
  const r = A.summarizeGoalJoin(s);
  const T = r.byTrack.safety;
  ok('Q2-JOIN (7) verdict HEALTHY on capture', T.verdict === 'HEALTHY', JSON.stringify(T));
  ok('Q2-JOIN (7) indoorLined still 1', T.indoorLined === 1, JSON.stringify(T));
}
// (8) lined + departed, 0 capture -> COUNTER-FAULT.
{
  const s = seedJSON();
  s.goalSnaps = [{ day: 45, villagers: [
    { name: 'B', top: 'safety', objGoal: 'safety', objGoalLine: 'Better close to the fire today.', objState: 'returning', objKind: 'HAVEN_CHORE' },
  ] }];
  s.goalLineDays = [{ day: 45, counts: { safety: 0 } }];
  const r = A.summarizeGoalJoin(s);
  ok('Q2-JOIN (8) verdict COUNTER-FAULT', r.byTrack.safety.verdict === 'COUNTER-FAULT', JSON.stringify(r.byTrack.safety));
}
// (9) MENU-FLIP: menu loses nv: after listen turns.
{
  const text = [
    '(offered=nv:nod,nv:smile,nv:pointself,nv:listen,leave)',
    'YOU: [(gesture)]',
    '(offered=nv:nod,nv:smile,nv:pointself,nv:listen,leave)',
    'YOU: [(gesture)]',
    '(offered=dlg:subject,leave)',
    'YOU: ["I should go."]',
  ].join('\n');
  const r = A.scanMenuFlip([{ seed: '96601', day: 60, vid: 'v_h1', text }]);
  ok('MENU-FLIP (9) one nonverbal sitting scanned', r.length === 1, JSON.stringify(r));
  ok('MENU-FLIP (9) flip found', r[0].flip != null, JSON.stringify(r));
  ok('MENU-FLIP (9) flip at turn 2 with 2 listen turns',
    r[0].flip && r[0].flip.turn === 2 && r[0].flip.listenTurns === 2, JSON.stringify(r[0].flip));
}
// (10) No flip when nv:listen is offered every turn.
{
  const text = [
    '(offered=nv:nod,nv:smile,nv:pointself,nv:listen,leave)',
    'YOU: [(gesture)]',
    '(offered=nv:nod,nv:smile,nv:pointself,nv:listen,leave)',
    'YOU: [(gesture)]',
    '(offered=nv:nod,nv:smile,nv:pointself,nv:listen,leave)',
    'YOU: [(gesture)]',
    '(offered=nv:nod,nv:smile,nv:pointself,nv:listen,leave)',
    'YOU: [(gesture)]',
    '(offered=nv:nod,nv:smile,nv:pointself,nv:listen,leave)',
    'YOU: [(gesture)]',
    '(offered=leave)',
    'YOU: ["I should go."]',
  ].join('\n');
  const r = A.scanMenuFlip([{ seed: '96601', day: 60, vid: 'v_h1', text }]);
  ok('MENU-FLIP (10) no flip in a fixed sitting', r.length === 1 && r[0].flip == null, JSON.stringify(r));
  ok('MENU-FLIP (10) 5 listen turns counted', r.length === 1 && r[0].listenTurns === 5, JSON.stringify(r));
}
// (11) A verbal transcript is not a nonverbal sitting.
{
  const text = [
    '(offered=dlg:more,dlg:details,goon,leave)',
    'YOU: [Tell me more.]',
    '(offered=dlg:subject,leave)',
    'YOU: ["I should go."]',
  ].join('\n');
  const r = A.scanMenuFlip([{ seed: '96601', day: 60, vid: 'v_h1', text }]);
  ok('MENU-FLIP (11) verbal transcript excluded', r.length === 0, JSON.stringify(r));
}
console.log(fail === 0 ? `R118 analyzer: ${pass} passed` : `R118 analyzer: ${pass} passed, ${fail} FAILED`);
process.exit(fail === 0 ? 0 : 1);
