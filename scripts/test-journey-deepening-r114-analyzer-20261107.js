'use strict';
// test-journey-deepening-r114-analyzer-20261107.js -- R114 analyzer proof
// (runs the REAL analyzer on synthetic seed JSONs + transcripts).
// summarizeLangGate: the driver's langGateOffers / langGateDecisions join.
// Cases:
//   (1) a decision at comm 'none' -> DEFECT-CONFIRMED (and the record
//       names it); (2) decisions all 'partial'/'full' -> NOT-REPRODUCED;
//   (3) 0 decisions -> NO-DECISIONS; (4) offers at 'none' counted
//       separately from decisions (exposure vs defect).
// scanDecidedAskReplay: a bond/link ask re-spoken after the decision.
// Cases:
//   (5) Grace day-27 shape (opener bond line, bond:decline pick, goon
//       re-speaks the line verbatim) -> 1 replay, kind 'bond';
//   (6) same sitting shape with no re-speak after the pick -> 0;
//   (7) link ask replayed -> 1 replay, kind 'link';
//   (8) bond pick with no pool line before it -> 0 (no ask to replay);
//   (9) the accept resolution line after the pick is NOT a replay.
const A = require('./analyze-journey-deepening-r114-20261107.js');
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function seedJSON(over) {
  const base = { seed: 96201, census: [{ id: 'v_h1' }, { id: 'v_h2' }], deaths: [],
    bond: { tele: [], proposals: [], decisions: [], links: [], sayLines: [], daily: [], convoEvents: [], errors: [] },
    talkReqSnaps: [], langGateOffers: [], langGateDecisions: [] };
  return Object.assign(base, over || {});
}
// (1) DEFECT-CONFIRMED: one 'none' decision among others.
{
  const s = seedJSON();
  s.langGateDecisions = [
    { day: 44, fn: 'acceptBondProposal', vid: 'v_h1', comm: 'full' },
    { day: 75, fn: 'acceptBondProposal', vid: 'v_h2', comm: 'none' },
  ];
  s.langGateOffers = [
    { day: 44, vid: 'v_h1', comm: 'full', offered: ['bond:accept', 'bond:decline'], picked: 'bond:accept' },
    { day: 75, vid: 'v_h2', comm: 'none', offered: ['bond:accept', 'bond:decline'], picked: 'bond:accept' },
  ];
  const r = A.summarizeLangGate(s);
  ok('Q1-LANG (1) decisions counted', r.decisions === 2, JSON.stringify(r));
  ok("Q1-LANG (1) 'none' decision counted", r.decisionsNone === 1, JSON.stringify(r));
  ok("Q1-LANG (1) non-'none' decision counted", r.decisionsNonNone === 1, JSON.stringify(r));
  ok('Q1-LANG (1) verdict DEFECT-CONFIRMED', r.verdict === 'DEFECT-CONFIRMED', r.verdict);
  ok('Q1-LANG (1) the none-decision record names vid + day', r.decisionsNoneList.length === 1 && r.decisionsNoneList[0].vid === 'v_h2' && r.decisionsNoneList[0].day === 75, JSON.stringify(r.decisionsNoneList));
}
// (2) NOT-REPRODUCED: decisions exist, none at 'none'.
{
  const s = seedJSON();
  s.langGateDecisions = [
    { day: 27, fn: 'acceptLinkRaise', vid: 'v_h1', comm: 'partial' },
    { day: 60, fn: 'declineBondProposal', vid: 'v_h2', comm: 'full' },
  ];
  const r = A.summarizeLangGate(s);
  ok('Q1-LANG (2) verdict NOT-REPRODUCED', r.verdict === 'NOT-REPRODUCED', r.verdict);
  ok('Q1-LANG (2) decisionsNone 0', r.decisionsNone === 0, JSON.stringify(r));
}
// (3) NO-DECISIONS: no decisions at all.
{
  const s = seedJSON();
  s.langGateOffers = [{ day: 50, vid: 'v_h1', comm: 'none', offered: ['bond:accept', 'bond:decline'], picked: null }];
  const r = A.summarizeLangGate(s);
  ok('Q1-LANG (3) verdict NO-DECISIONS', r.verdict === 'NO-DECISIONS', r.verdict);
  ok('Q1-LANG (3) offers at none still counted (exposure)', r.offersNone === 1, JSON.stringify(r));
}
// (4) Offers vs decisions are separate counts.
{
  const s = seedJSON();
  s.langGateOffers = [
    { day: 10, vid: 'v_h1', comm: 'none', offered: ['bond:accept', 'bond:decline'], picked: 'bond:decline' },
    { day: 11, vid: 'v_h1', comm: 'none', offered: ['bond:accept', 'bond:decline'], picked: 'bond:decline' },
  ];
  s.langGateDecisions = [{ day: 10, fn: 'declineBondProposal', vid: 'v_h1', comm: 'none' }];
  const r = A.summarizeLangGate(s);
  ok('Q1-LANG (4) two none-offers, one none-decision', r.offersNone === 2 && r.decisionsNone === 1, JSON.stringify(r));
}
// (5) Grace day-27 shape: decline, then goon re-speaks the ask.
{
  const t = { seed: '96201', day: 27, vid: 'grace_obi', text:
    '=== seed 96201 day 27 — conversation with Grace (grace_obi) ===\n' +
    'THEM: Grace: "I\'ve been thinking. You and me — we should be bonded. Not just neighbors. Will you stick with me?"\n' +
    '(offered=bond:accept,bond:decline,gq:yn:yes,leave)\n' +
    'YOU: [bond:decline] "Not like that. Not yet."\n' +
    'THEM: "Right — another time."\n' +
    '(offered=dlg:more,goon,leave)\n' +
    'YOU: [goon] "And?"\n' +
    'THEM: "I\'ve been thinking. You and me — we should be bonded. Not just neighbors. Will you stick with me?"\n' +
    'YOU: (leave)\n' };
  const r = A.scanDecidedAskReplay([t]);
  ok('Q2-REPLAY (5) Grace shape -> 1 replay, kind bond', r.length === 1 && r[0].kind === 'bond' && r[0].day === 27, JSON.stringify(r));
}
// (6) Same shape, no re-speak after the pick -> 0.
{
  const t = { seed: '96201', day: 44, vid: 'grace_obi', text:
    'THEM: Grace: "I\'ve been thinking. You and me — we should be bonded. Not just neighbors. Will you stick with me?"\n' +
    '(offered=bond:accept,bond:decline,leave)\n' +
    'YOU: [bond:accept] "Yes. Stick together."\n' +
    'THEM: "Stick together, then." They look steadier already.\n' +
    '(offered=dlg:more,leave)\n' +
    'YOU: (leave)\n' };
  const r = A.scanDecidedAskReplay([t]);
  ok('Q2-REPLAY (6) decided ask, no re-speak -> 0', r.length === 0, JSON.stringify(r));
}
// (7) Link ask replayed.
{
  const t = { seed: '96202', day: 60, vid: 'v_h1', text:
    'THEM: "We should link with Aldergate. I know them. We\'d be stronger together."\n' +
    '(offered=link:accept,link:decline,leave)\n' +
    'YOU: [link:decline] "Not them. Not now."\n' +
    'THEM: "Not them. Not now."\n' +
    '(offered=goon,leave)\n' +
    'YOU: [goon] "And?"\n' +
    'THEM: "We should link with Aldergate. I know them. We\'d be stronger together."\n' +
    'YOU: (leave)\n' };
  const r = A.scanDecidedAskReplay([t]);
  ok('Q2-REPLAY (7) link replay -> 1 replay, kind link', r.length === 1 && r[0].kind === 'link', JSON.stringify(r));
}
// (8) Bond pick with no pool line before it -> 0 (no ask to replay).
{
  const t = { seed: '96203', day: 30, vid: 'v_h2', text:
    'THEM: "The stores are thin. Have you looked?"\n' +
    '(offered=bond:accept,bond:decline,leave)\n' +
    'YOU: [bond:accept] "Yes. Stick together."\n' +
    'THEM: "Stick together, then." They look steadier already.\n' +
    'YOU: (leave)\n' };
  const r = A.scanDecidedAskReplay([t]);
  ok('Q2-REPLAY (8) pick with no ask line before it -> 0', r.length === 0, JSON.stringify(r));
}
// (9) The accept resolution line after the pick is NOT a replay.
{
  const t = { seed: '96204', day: 50, vid: 'v_h1', text:
    'THEM: "Hey. I want to ask it plain: will you be my bonded friend? I\'ll watch your back if you watch mine."\n' +
    '(offered=bond:accept,bond:decline,leave)\n' +
    'YOU: [bond:accept] "Yes. Stick together."\n' +
    'THEM: "Stick together, then." They look steadier already.\n' +
    '(offered=dlg:more,leave)\n' +
    'YOU: [dlg:more] "Tell me more."\n' +
    'THEM: "Stick together, then." They look steadier already.\n' +
    'YOU: (leave)\n' };
  const r = A.scanDecidedAskReplay([t]);
  ok('Q2-REPLAY (9) resolution line repeated is NOT a replay', r.length === 0, JSON.stringify(r));
}
console.log(`\nR114 analyzer proof: ${pass} passed, ${fail} failed`);
if (fail) process.exitCode = 1;
