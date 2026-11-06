// test-journey-social-r149.js -- proof for the r149 social driver/analyzer
// helpers (Lane B, 2026-11-06). Fixture-driven, no game load.
//   (1) aggregateNightlyNews: strict (on-tile scholarAtHaven) vs gate
//       (radius-1 playerAtHaven) classification diverges EXACTLY on the
//       radius-1 ring: a line emitted one tile out (atHaven=false,
//       atHavenGate=true) counts strict-away but NOT gate-away; a line
//       emitted further out counts both; a line at home counts neither.
//       Missing flags read as at-Haven (old r141/r145 rows contribute 0).
//   (2) summarizeBondProposed: counts by initiatorKind/kind/outcome,
//       villager-person accepted split, link raises, per-initiator totals
//       and maxPerInitiator (amendment-5 cap check input).
//   (3) tallyOffered: offered-id counts (more vs react vs follow:goal:0)
//       and the longest run of consecutive player continuer presses,
//       where the goal follow-up label breaks the run.
// Usage: node scripts/test-journey-social-r149.js
// RED: run against a helpers file without these functions (require fails).
// GREEN: all fixture assertions pass.
'use strict';
const { aggregateNightlyNews, summarizeBondProposed, tallyOffered } =
  require('./journey-social-r149-helpers');
let failures = 0;
const fail = (m) => { console.error(`FAIL: ${m}`); failures++; };
const eq = (got, want, what) => { if (got !== want) fail(`${what}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); };

// --- (1) M6 gate classification ---
// One tile out (the r145 discrepancy): strict-away, NOT gate-away.
const ring = aggregateNightlyNews([
  { kind: 'burst', atHaven: false, atHavenGate: true },
  { kind: 'settle', atHaven: false, atHavenGate: true },
]);
eq(ring.burstAway, 1, 'ring burst strict-away');
eq(ring.burstAwayGate, 0, 'ring burst gate-away');
eq(ring.settleAway, 1, 'ring settle strict-away');
eq(ring.settleAwayGate, 0, 'ring settle gate-away');
// Far out: both classifications away.
const far = aggregateNightlyNews([
  { kind: 'burst', atHaven: false, atHavenGate: false },
  { kind: 'witness', atHaven: false, atHavenGate: false },
  { kind: 'tale', atHaven: false, atHavenGate: false },
]);
eq(far.burstAway, 1, 'far burst strict-away');
eq(far.burstAwayGate, 1, 'far burst gate-away');
eq(far.witnessAwayGate, 1, 'far witness gate-away');
eq(far.taleAwayGate, 1, 'far tale gate-away');
// At home: neither. Missing flags (old rows): neither.
const home = aggregateNightlyNews([
  { kind: 'burst', atHaven: true, atHavenGate: true },
  { kind: 'settle', atHaven: true }, // no gate flag at all
  { kind: 'burst' }, // no flags at all
]);
eq(home.burst, 2, 'home burst total');
eq(home.burstAway, 0, 'home burst strict-away');
eq(home.burstAwayGate, 0, 'home burst gate-away');
eq(home.settleAwayGate, 0, 'home settle gate-away (missing flag)');
// Unknown kinds are ignored, not counted.
const junk = aggregateNightlyNews([{ kind: 'chat', atHaven: false, atHavenGate: false }]);
eq(junk.burst, 0, 'junk kind ignored');

// --- (2) bond_proposed summary ---
const bonds = summarizeBondProposed([
  { day: 7, initiator: 'vA', initiatorKind: 'villager', target: 'vB', kind: 'person', outcome: 'accepted', chance: 0.6 },
  { day: 9, initiator: 'vA', initiatorKind: 'villager', target: 'vC', kind: 'person', outcome: 'refused', chance: 0.3 },
  { day: 12, initiator: 'vD', initiatorKind: 'villager', target: 'scholar', kind: 'person', outcome: 'staged', chance: null },
  { day: 15, initiator: 'scholar', initiatorKind: 'scholar', target: 'vE', kind: 'person', outcome: 'accepted', chance: 0.7 },
  { day: 20, initiator: 'vA', initiatorKind: 'villager', target: 'Stonebridge', kind: 'link', outcome: 'staged', chance: null },
  { day: 33, initiator: 'vA', initiatorKind: 'villager', target: 'Stonebridge', kind: 'link', outcome: 'accepted', chance: null },
  { day: 40, initiator: 'vF', initiatorKind: 'villager', target: 'vG', kind: 'person', outcome: 'expired', chance: null },
]);
eq(bonds.total, 7, 'bonds total');
eq(bonds.byInitiatorKind.villager, 6, 'bonds byInitiatorKind villager');
eq(bonds.byInitiatorKind.scholar, 1, 'bonds byInitiatorKind scholar');
eq(bonds.byKind.person, 5, 'bonds byKind person');
eq(bonds.byKind.link, 2, 'bonds byKind link');
eq(bonds.byOutcome.accepted, 3, 'bonds byOutcome accepted');
eq(bonds.villagerPerson, 4, 'bonds villagerPerson');
eq(bonds.villagerPersonAccepted, 1, 'bonds villagerPersonAccepted');
eq(bonds.scholarPerson, 1, 'bonds scholarPerson');
eq(bonds.linkRaises, 2, 'bonds linkRaises');
eq(bonds.linkAccepted, 1, 'bonds linkAccepted');
eq(bonds.perInitiator['villager:vA'], 4, 'bonds perInitiator vA');
eq(bonds.maxPerInitiator, 4, 'bonds maxPerInitiator');
eq(summarizeBondProposed([]).total, 0, 'bonds empty total');
eq(summarizeBondProposed(null).total, 0, 'bonds null total');

// --- (3) offered tally + continuer runs ---
const tall = tallyOffered([
  { tag: 'talk request', vid: 'v1', offered: [['more', 'follow:goal:0', 'agree'], ['more', 'joke'], ['more', 'silence']],
    transcript: [
      { who: 'NPC', text: '"I want to lead the next hunt."' },
      { who: 'YOU', text: '"Tell me more."' },
      { who: 'NPC', text: '"I have done this before, back home."' },
      { who: 'YOU', text: '"Go on."' },
      { who: 'NPC', text: '"One step at a time, that is all anyone can do."' },
      { who: 'YOU', text: '"Take your time."' },
      { who: 'NPC', text: '"I should get back to it."' },
    ] },
  { tag: 'friendship', vid: 'v2', offered: [['more', 'follow:goal:0', 'agree']],
    transcript: [
      { who: 'NPC', text: '"I want to be the one who keeps the fire."' },
      { who: 'YOU', text: '"Tell me more about what you want to do."' },
      { who: 'NPC', text: '"It is the thing that gets me up in the morning."' },
      { who: 'YOU', text: '"You\'re right."' },
    ] },
]);
eq(tall.moreOffers, 4, 'tally moreOffers');
eq(tall.reactOffers, 4, 'tally reactOffers (agree+joke+silence+agree)');
eq(tall.goalFollowOffers, 2, 'tally goalFollowOffers');
eq(tall.counts.more, 4, 'tally counts.more');
eq(tall.counts.agree, 2, 'tally counts.agree');
eq(tall.longestMoreRun, 3, 'tally longestMoreRun (3 continuers, follow-up breaks the run)');

if (failures) { console.error(`RESULT: FAIL (${failures} assertion(s))`); process.exit(1); }
console.log('RESULT: PASS — M6 strict/gate divergence exact on the radius-1 ring, bond summary splits correct, offered tally + continuer runs correct');
