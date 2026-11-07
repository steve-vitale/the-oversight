'use strict';
// test-journey-deepening-r113-analyzer-20261107.js -- R113 analyzer proof
// (runs the REAL analyzer on synthetic seed JSONs + transcripts).
// Q1 summarizeRequests: the staged -> talked-while-live -> decided/expired
// join over bond.tele + bond.convoEvents + talkReqSnaps. Cases:
//   (1) bond staged, holder talkable, never talked while live, expired ->
//       POLICY-GAP (and the request record carries the evidence);
//   (2) bond staged, talked on a live day, accepted -> REACHED;
//   (3) nothing staged -> GAME-GAP; (4) holder dead before staging ->
//       untalkable, expired -> GAME-GAP; (5) link raise staged, expired,
//       talkable, untalked -> POLICY-GAP (kind 'link', target = village).
// scanBondChoices: offered bond:accept + no pick -> unanswered (choice gap
// live); offered + a YOU [bond:accept] pick -> answered.
// scanAwayLines: old "miles away" line -> oldLine=1, newLine=0; new "away
// from Haven" line -> newLine=1, oldLine=0; action-site away reason and
// adjacency reason counted separately.
// D-THING revised: pocketed thread + later sitting with ONLY the
// `pocketed` want label -> mentioned=false, mentionedOld=true; + a later
// THEM line naming "that small thing" -> mentioned=true.
// G-STICK distribution: 3 sample days, villagers with 1 / 2 distinct tops
// -> distinctTopsDist {1:.., 2:..} alongside the old stuck count.
const A = require('./analyze-journey-deepening-r113-20261107.js');
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function seedJSON(over) {
  const base = { seed: 95601, census: [{ id: 'v_h1' }, { id: 'v_h2' }, { id: 'v_h3' }], deaths: [],
    bond: { tele: [], proposals: [], decisions: [], links: [], sayLines: [], daily: [], convoEvents: [], errors: [] },
    talkReqSnaps: [] };
  return Object.assign(base, over || {});
}
const SCH = 'scholar_1';
// (1) POLICY-GAP: bond staged day 50, holder v_h1 talkable, never talked, expired day 53.
{
  const s = seedJSON();
  s.bond.tele = [
    { day: 50, scholarId: SCH, initiator: 'v_h1', target: SCH, kind: 'person', outcome: 'staged', chance: null },
    { day: 53, scholarId: SCH, initiator: 'v_h1', target: SCH, kind: 'person', outcome: 'expired', chance: null },
  ];
  s.bond.convoEvents = [{ day: 51, fn: 'talkTo', target: 'v_h2' }]; // talked to someone else
  s.talkReqSnaps = [{ day: 50, bond: [{ vid: 'v_h1', day: 50, kind: 'bond' }], link: [], talk: [{ vid: 'v_h1', day: 50, bondProposal: true, linkRaise: false, delivered: false }] },
    { day: 51, bond: [{ vid: 'v_h1', day: 50, kind: 'bond' }], link: [], talk: [{ vid: 'v_h1', day: 50, bondProposal: true, linkRaise: false, delivered: false }] },
    { day: 52, bond: [{ vid: 'v_h1', day: 50, kind: 'bond' }], link: [], talk: [{ vid: 'v_h1', day: 50, bondProposal: true, linkRaise: false, delivered: false }] },
    { day: 53, bond: [], link: [], talk: [] }];
  const r = A.summarizeRequests(s);
  ok('Q1 (1) one staged request recorded', r.staged === 1 && r.requests.length === 1, JSON.stringify(r));
  ok('Q1 (1) outcome expired, expiredDay 53', r.requests[0].outcome === 'expired' && r.requests[0].expiredDay === 53, JSON.stringify(r.requests[0]));
  ok('Q1 (1) holder talkable at staging', r.requests[0].talkableAtStaging === true, JSON.stringify(r.requests[0]));
  ok('Q1 (1) never talked while live', r.requests[0].talkedWhileLive.length === 0, JSON.stringify(r.requests[0]));
  ok('Q1 (1) verdict POLICY-GAP', r.verdict === 'POLICY-GAP', r.verdict);
}
// (2) REACHED: talked on a live day, accepted.
{
  const s = seedJSON();
  s.bond.tele = [
    { day: 60, scholarId: SCH, initiator: 'v_h2', target: SCH, kind: 'person', outcome: 'staged', chance: null },
    { day: 61, scholarId: SCH, initiator: 'v_h2', target: SCH, kind: 'person', outcome: 'accepted', chance: null },
  ];
  s.bond.convoEvents = [{ day: 61, fn: 'talkTo', target: 'v_h2' }, { day: 61, fn: 'endConvo', target: 'v_h2' }];
  const r = A.summarizeRequests(s);
  ok('Q1 (2) talked-while-live day recorded', r.requests[0].talkedWhileLive.length === 1 && r.requests[0].talkedWhileLive[0] === 61, JSON.stringify(r.requests[0]));
  ok('Q1 (2) outcome accepted, decidedDay 61', r.requests[0].outcome === 'accepted' && r.requests[0].decidedDay === 61, JSON.stringify(r.requests[0]));
  ok('Q1 (2) verdict REACHED', r.verdict === 'REACHED', r.verdict);
}
// (3) GAME-GAP: nothing staged.
{
  const r = A.summarizeRequests(seedJSON());
  ok('Q1 (3) 0 staged -> GAME-GAP', r.staged === 0 && r.verdict === 'GAME-GAP', r.verdict);
}
// (4) GAME-GAP: holder dead before staging, expired.
{
  const s = seedJSON();
  s.deaths = [{ day: 40, who: 'v_h3', cause: 'monster', kind: 'monster' }];
  s.bond.tele = [
    { day: 50, scholarId: SCH, initiator: 'v_h3', target: SCH, kind: 'person', outcome: 'staged', chance: null },
    { day: 53, scholarId: SCH, initiator: 'v_h3', target: SCH, kind: 'person', outcome: 'expired', chance: null },
  ];
  const r = A.summarizeRequests(s);
  ok('Q1 (4) dead holder is untalkable', r.requests[0].talkableAtStaging === false && r.requests[0].deathDay === 40, JSON.stringify(r.requests[0]));
  ok('Q1 (4) verdict GAME-GAP', r.verdict === 'GAME-GAP', r.verdict);
}
// (5) Link raise: staged to a village, expired, talkable, untalked -> POLICY-GAP.
{
  const s = seedJSON();
  s.bond.tele = [
    { day: 70, scholarId: SCH, initiator: 'v_h1', target: 'village_0', kind: 'link', outcome: 'staged', chance: null },
    { day: 73, scholarId: SCH, initiator: 'v_h1', target: 'village_0', kind: 'link', outcome: 'expired', chance: null },
  ];
  const r = A.summarizeRequests(s);
  ok('Q1 (5) link raise staged + expired', r.staged === 1 && r.requests[0].kind === 'link' && r.requests[0].village === 'village_0' && r.requests[0].outcome === 'expired', JSON.stringify(r.requests[0]));
  ok('Q1 (5) link verdict POLICY-GAP', r.verdict === 'POLICY-GAP', r.verdict);
}
// (6) Repeat staging: same holder + same village staged twice (after the
// 14-day cooldown) counts as TWO requests, each with its own window.
{
  const s = seedJSON();
  s.bond.tele = [
    { day: 10, scholarId: SCH, initiator: 'v_h1', target: 'village_0', kind: 'link', outcome: 'staged', chance: null },
    { day: 13, scholarId: SCH, initiator: 'v_h1', target: 'village_0', kind: 'link', outcome: 'expired', chance: null },
    { day: 30, scholarId: SCH, initiator: 'v_h1', target: 'village_0', kind: 'link', outcome: 'staged', chance: null },
    { day: 33, scholarId: SCH, initiator: 'v_h1', target: 'village_0', kind: 'link', outcome: 'expired', chance: null },
  ];
  const r = A.summarizeRequests(s);
  ok('Q1 (6) repeat staging counts twice', r.staged === 2 && r.requests.length === 2, JSON.stringify(r.requests));
  ok('Q1 (6) each repeat keeps its own window', r.requests[0].stagedDay === 10 && r.requests[0].expiredDay === 13 && r.requests[1].stagedDay === 30 && r.requests[1].expiredDay === 33, JSON.stringify(r.requests));
}
// (7) Roster-at-staging: holder on the daily roster at staging but OFF
// the final census (died later, removed from the roster) is talkable.
{
  const s = seedJSON();
  s.census = [{ id: 'v_h2' }, { id: 'v_h3' }]; // v_h1 gone from the final roster
  s.deaths = [{ day: 43, who: 'v_h1', cause: 'monster', kind: 'monster' }];
  s.bond.daily = [{ day: 5, roster: ['v_h1', 'v_h2', 'v_h3'] }, { day: 44, roster: ['v_h2', 'v_h3'] }];
  s.bond.tele = [
    { day: 5, scholarId: SCH, initiator: 'v_h1', target: SCH, kind: 'person', outcome: 'staged', chance: null },
    { day: 8, scholarId: SCH, initiator: 'v_h1', target: SCH, kind: 'person', outcome: 'expired', chance: null },
  ];
  const r = A.summarizeRequests(s);
  ok('Q1 (7) holder alive + on-roster at staging is talkable despite later death/removal',
    r.requests[0].talkableAtStaging === true && r.requests[0].onRoster === true && r.requests[0].deathDay === 43, JSON.stringify(r.requests[0]));
  ok('Q1 (7) verdict POLICY-GAP (not mislabeled untalkable)', r.verdict === 'POLICY-GAP', r.verdict);
}
// (8) Corroboration is bounded to the request's own live window: a
// later re-staging by the same villager must not inflate the first
// request's lastSeenStaged.
{
  const s = seedJSON();
  s.bond.daily = [
    { day: 12, roster: ['v_h1', 'v_h2', 'v_h3'], bond: [], link: [{ vid: 'v_h1', day: 12, village: 'village_0' }] },
    { day: 13, roster: ['v_h1', 'v_h2', 'v_h3'], bond: [], link: [{ vid: 'v_h1', day: 12, village: 'village_0' }] },
    { day: 14, roster: ['v_h1', 'v_h2', 'v_h3'], bond: [], link: [{ vid: 'v_h1', day: 12, village: 'village_0' }] },
    { day: 92, roster: ['v_h1', 'v_h2', 'v_h3'], bond: [], link: [{ vid: 'v_h1', day: 92, village: 'village_1' }] },
  ];
  s.talkReqSnaps = [
    { day: 12, bond: [], link: [{ vid: 'v_h1', day: 12, village: 'village_0' }], talk: [] },
    { day: 13, bond: [], link: [{ vid: 'v_h1', day: 12, village: 'village_0' }], talk: [] },
    { day: 14, bond: [], link: [{ vid: 'v_h1', day: 12, village: 'village_0' }], talk: [] },
    { day: 92, bond: [], link: [{ vid: 'v_h1', day: 92, village: 'village_1' }], talk: [] },
  ];
  s.bond.tele = [
    { day: 12, scholarId: SCH, initiator: 'v_h1', target: 'village_0', kind: 'link', outcome: 'staged', chance: null },
    { day: 15, scholarId: SCH, initiator: 'v_h1', target: 'village_0', kind: 'link', outcome: 'expired', chance: null },
    { day: 92, scholarId: SCH, initiator: 'v_h1', target: 'village_1', kind: 'link', outcome: 'staged', chance: null },
    { day: 95, scholarId: SCH, initiator: 'v_h1', target: 'village_1', kind: 'link', outcome: 'expired', chance: null },
  ];
  const r = A.summarizeRequests(s);
  ok('Q1 (8) first request lastSeenStaged stays inside its own window', r.requests[0].lastSeenStaged === 14, JSON.stringify(r.requests[0]));
  ok('Q1 (8) second request lastSeenStaged is its own day', r.requests[1].lastSeenStaged === 92, JSON.stringify(r.requests[1]));
}
// scanBondChoices: offered, unanswered vs answered.
{
  const unanswered = [{ seed: '95601', day: 45, vid: 'v_h1', text:
    '=== seed 95601 day 45 — conversation with A (v_h1) ===\nTHEM: "Can I ask you something? ... I want us to stick together."\n(offered=bond:accept,bond:decline,dlg:subject,leave)\nYOU: [dlg:subject] "Tell me more."\nTHEM: "Anyway."\nYOU: (leave)\n' }];
  const bc = A.scanBondChoices(unanswered);
  ok('CHOICE (1) bond offered, never picked -> unanswered', bc.length === 1 && bc[0].offeredBond === true && bc[0].answered === false, JSON.stringify(bc));
  const answered = [{ seed: '95601', day: 45, vid: 'v_h1', text:
    '=== seed 95601 day 45 — conversation with A (v_h1) ===\nTHEM: "Can I ask you something? ... I want us to stick together."\n(offered=bond:accept,bond:decline,dlg:subject,leave)\nYOU: [bond:accept] "Yes. Stick together."\nTHEM: "Stick together, then."\n' }];
  const bc2 = A.scanBondChoices(answered);
  ok('CHOICE (2) bond offered + picked -> answered', bc2.length === 1 && bc2[0].answered === true && bc2[0].picked[0] === 'bond:accept', JSON.stringify(bc2));
  const none = [{ seed: '95601', day: 45, vid: 'v_h1', text: 'THEM: "Hello."\n(offered=dlg:subject,leave)\nYOU: (leave)\n' }];
  ok('CHOICE (3) no bond offered -> no row', A.scanBondChoices(none).length === 0);
}
// scanAwayLines: old vs new line, action reason vs adjacency reason.
{
  const t = [{ seed: '95601', day: 80, vid: 'v_h1', text:
    'THEM: "Wait — I\'m out on the road. I can\'t ask you to meet me at dawn when I\'m miles away. Find me when I\'m back, and we\'ll set it then."\n' }];
  const aw = A.scanAwayLines(t);
  ok('AWAY (1) old line counted, new line 0', aw.length === 1 && aw[0].oldLine === 1 && aw[0].newLine === 0, JSON.stringify(aw));
  const t2 = [{ seed: '95601', day: 80, vid: 'v_h1', text:
    'THEM: "Wait — I\'m away from Haven, out on the road. I can\'t promise a dawn meet while I\'m out — find me when I\'m back, and we\'ll set it then."\n' }];
  const aw2 = A.scanAwayLines(t2);
  ok('AWAY (2) new line counted, old line 0', aw2.length === 1 && aw2[0].newLine === 1 && aw2[0].oldLine === 0, JSON.stringify(aw2));
  const t3 = [{ seed: '95601', day: 80, vid: 'v_h1', text:
    'THEM: "They are out on the road, miles from here. Find them when they are back."\nTHEM: "Move next to them, on the same side of the Haven door, to help."\n' }];
  const aw3 = A.scanAwayLines(t3);
  ok('AWAY (3) action reason + adjacency reason counted separately', aw3.length === 1 && aw3[0].actionAwayReason === 1 && aw3[0].adjacencyReason === 1, JSON.stringify(aw3));
}
// D-THING revised: label-only later sitting is NOT a mention; a named line is.
{
  const open = { seed: '95601', day: 45, vid: 'v_h1', text: 'THEM: "Another time, then." A small thing, pocketed.\n' };
  const labelOnly = { seed: '95601', day: 60, vid: 'v_h1', text: 'want: pocketed (stage 1)\nTHEM: "I still have it. The thing."\n' };
  const named = { seed: '95601', day: 80, vid: 'v_h1', text: 'want: pocketed (stage 1)\nTHEM: "About that small thing I pocketed — here. It\'s yours."\n' };
  const r1 = A.classifyPocketedThreads([open, labelOnly]);
  ok('D-THING (1) label-only later sitting -> mentioned=false, mentionedOld=true',
    r1.length === 1 && r1[0].testable === true && r1[0].mentioned === false && r1[0].mentionedOld === true, JSON.stringify(r1));
  const r2 = A.classifyPocketedThreads([open, labelOnly, named]);
  ok('D-THING (2) named line later -> mentioned=true', r2.length === 1 && r2[0].mentioned === true, JSON.stringify(r2));
}
// G-STICK distribution: 3 sample days.
{
  const s = { goalSnaps: [
    { day: 45, villagers: [{ vid: 'a', name: 'A', top: 'food_security' }, { vid: 'b', name: 'B', top: 'party_up' }] },
    { day: 60, villagers: [{ vid: 'a', name: 'A', top: 'food_security' }, { vid: 'b', name: 'B', top: 'bonds' }] },
    { day: 80, villagers: [{ vid: 'a', name: 'A', top: 'food_security' }, { vid: 'b', name: 'B', top: 'bonds' }] },
  ], goalLines: {} };
  const g = A.summarizeGoals(s);
  ok('G-STICK (1) distribution counts distinct tops', g.stick && g.stick.distinctTopsDist[1] === 1 && g.stick.distinctTopsDist[2] === 1, JSON.stringify(g.stick));
  ok('G-STICK (2) old stuck count still reported', g.stick && g.stick.stuck === 1, JSON.stringify(g.stick));
}
console.log(`\nR113 analyzer proof: ${pass} passed, ${fail} failed`);
if (fail) process.exitCode = 1;
