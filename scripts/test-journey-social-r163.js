// test-journey-social-r163.js -- proof for the r163 social driver/analyzer
// helpers (Lane B, 2026-11-07). Fixture-driven, no game load.
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
//   (4) summarizeCounters: fresh vs blocked proposeLink split
//       (pendingBefore), settle→link counts, answers by how, tribute
//       and pantry-at-settle rollup, pendingCounterEnd passthrough.
//   (5) tallyRecap: recap presses per conversation (driver field, with
//       transcript fallback), cap failures (6+ presses) and
//       offered-after-cap detection.
// Usage: node scripts/test-journey-social-r159.js
// RED: run against a helpers file without these functions (require fails).
// GREEN: all fixture assertions pass.
'use strict';
const { aggregateNightlyNews, summarizeBondProposed, tallyOffered, summarizeCounters, tallyRecap, tallyReoffers, tallyDroppedThreads, tallyNarrDup } =
  require('./journey-social-r163-helpers');
let failures = 0;
const fail = (m) => { console.error(`FAIL: ${m}`); failures++; };
const eq = (got, want, what) => { if (got !== want) fail(`${what}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); };
const ok = (cond, what) => { if (!cond) fail(what); };

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
// r154 (D): person-kind max is scored separately from the mixed max —
// vA's 4 mixed proposals are 2 person + 2 link, so the amendment-5
// person-kind cap reads 2, not 4.
eq(bonds.personPerInitiator['villager:vA'], 2, 'bonds personPerInitiator vA');
eq(bonds.maxPerInitiatorPerson, 2, 'bonds maxPerInitiatorPerson');
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

// --- (4) counter summary: fresh vs blocked, settles, answers ---
// d6 fresh counter (pendingBefore false) stages the negotiation; d10/d18
// are the "offer on the table" guard (pendingBefore true) — no fresh
// scoring. The d11 settle accepts and forms the link; the d19 settle is
// a blocked-away null (linkFormed false). A covenant call is not a link.
const cs = summarizeCounters(
  [
    { day: 6, method: 'proposeLink', targetId: 'village_2', pendingBefore: false, pendingAfter: true, result: '"counter"' },
    { day: 10, method: 'proposeLink', targetId: 'village_1', pendingBefore: true, pendingAfter: true, result: '"counter"' },
    { day: 18, method: 'proposeLink', targetId: 'village_2', pendingBefore: true, pendingAfter: true, result: '"counter"' },
    { day: 25, method: 'proposeLink', targetId: 'village_0', pendingBefore: false, pendingAfter: false, result: 'null' },
    { day: 26, method: 'proposeCovenant', targetId: 'village_3', pendingBefore: false, pendingAfter: false, result: '"counter"' },
  ],
  [
    { day: 11, targetId: 'village_2', tribute: 5000, pantryKcalAtSettle: 9000, linkFormed: true, result: '{"ok":true}' },
    { day: 19, targetId: 'village_1', tribute: 5000, pantryKcalAtSettle: 1200, linkFormed: false, result: 'null' },
  ],
  [
    { day: 11, how: 'accept', targetId: 'village_2', tribute: 5000, linkFormed: true, result: '{"ok":true}' },
    { day: 19, how: 'accept', targetId: 'village_1', tribute: 5000, linkFormed: false, result: 'null' },
  ],
  { targetId: 'village_1', tribute: 5000, day: 10 });
eq(cs.proposeLinkCalls, 4, 'counters proposeLinkCalls (covenant excluded)');
eq(cs.proposeLinkCounter, 3, 'counters proposeLinkCounter');
eq(cs.freshCalls, 2, 'counters freshCalls');
eq(cs.freshCounter, 1, 'counters freshCounter (only d6 staged)');
eq(cs.blockedCalls, 2, 'counters blockedCalls');
eq(cs.blockedCounter, 2, 'counters blockedCounter (guard returns, no scoring)');
eq(cs.unknownPendingCalls, 0, 'counters unknownPendingCalls');
eq(cs.settles, 2, 'counters settles');
eq(cs.settlesLinkFormed, 1, 'counters settlesLinkFormed');
eq(cs.settlesLinkFailed, 1, 'counters settlesLinkFailed');
eq(cs.answers, 2, 'counters answers');
eq(cs.answersByHow.accept, 2, 'counters answersByHow accept');
eq(cs.answersLinkFormed, 1, 'counters answersLinkFormed');
eq(cs.minPantryAtSettle, 1200, 'counters minPantryAtSettle');
eq(cs.tributes.length, 2, 'counters tributes length');
eq(cs.pendingCounterEnd.targetId, 'village_1', 'counters pendingCounterEnd passthrough');
const csEmpty = summarizeCounters([], [], [], null);
eq(csEmpty.proposeLinkCalls, 0, 'counters empty proposeLinkCalls');
eq(csEmpty.settles, 0, 'counters empty settles');
eq(csEmpty.minPantryAtSettle, null, 'counters empty minPantryAtSettle');
eq(csEmpty.pendingCounterEnd, null, 'counters empty pendingCounterEnd');

// --- (5) recap tally: driver field + transcript fallback, cap failures ---
const rc = tallyRecap([
  { tag: 'friendship', vid: 'v1', day: 12, recapPresses: 3, recapOfferedAfterCap: false, transcript: [] },
  { tag: 'talk request', vid: 'v2', day: 20, recapPresses: 6, recapOfferedAfterCap: true, transcript: [] },
  // no driver field: fallback counts YOU lines carrying the recap label.
  { tag: 'talk request', vid: 'v3', day: 30, transcript: [
    { who: 'NPC', text: '"We were talking about the hunt."' },
    { who: 'YOU', text: '"Wait — what were we talking about?"' },
    { who: 'NPC', text: '"Still on the hunt."' },
    { who: 'YOU', text: '"Wait — what were we talking about?"' },
  ] },
  { tag: 'first meeting', vid: 'v4', day: 5, recapPresses: 0, recapOfferedAfterCap: false, transcript: [] },
]);
eq(rc.maxRecapPresses, 6, 'recap maxRecapPresses');
eq(rc.totalPresses, 11, 'recap totalPresses (3+6+2 fallback+0)');
eq(rc.offeredAfterCap, 1, 'recap offeredAfterCap');
eq(rc.capFailures.length, 1, 'recap capFailures length');
eq(rc.capFailures[0].vid, 'v2', 'recap capFailure vid');
eq(rc.capFailures[0].presses, 6, 'recap capFailure presses');
eq(tallyRecap([]).maxRecapPresses, 0, 'recap empty maxRecapPresses');
eq(tallyRecap(null).totalPresses, 0, 'recap null totalPresses');


// (6) r159 tallyReoffers: an id offered on 2+ turns in one conversation
// is a re-offer; ids offered once (even across turns) are not.
const re = tallyReoffers([
  { tag: 'friendship', vid: 'v1', offered: [['doubt', 'more'], ['leave'], ['doubt', 'joke']] },
  { tag: 'talk request', vid: 'v2', offered: [['more'], ['leave']] },
  { tag: 'moot', vid: 'v3', offered: [['more', 'more']] },
]);
eq(re.panelMax, 2, 're-offer panelMax (doubt offered on 2 turns)');
eq(re.rows.length, 1, 're-offer rows (only v1 re-offers; v3 repeats within one turn only)');
eq(re.rows[0].vid, 'v1', 're-offer row vid');
eq(re.rows[0].id, 'doubt', 're-offer row id');
eq(re.rows[0].maxReoffer, 2, 're-offer row max');
eq(tallyReoffers([]).panelMax, 0, 're-offer empty panelMax');

// (7) r159 tallyDroppedThreads: a "lost my train of thought" line is a
// drop; the next sitting with the same vid is listed for the resurface
// read; a vid with no later sitting gets nextSitting null.
const dr = tallyDroppedThreads([
  { tag: 'friendship', vid: 'v1', transcript: [
    { who: 'NPC', text: '"I kept a photo of my sister."' },
    { who: 'NPC', text: '"...Sorry, lost my train of thought."' },
    { who: 'YOU', text: '"Go on."' },
  ] },
  { tag: 'talk request', vid: 'v1', transcript: [
    { who: 'NPC', text: '"About the photo — I never told anyone."' },
    { who: 'YOU', text: '"Tell me more."' },
  ] },
  { tag: 'first meeting', vid: 'v2', transcript: [
    { who: 'NPC', text: '"...Sorry, lost my train of thought."' },
  ] },
]);
eq(dr.nDrops, 2, 'dropped-thread count');
eq(dr.rows[0].vid, 'v1', 'dropped-thread row 0 vid');
ok(dr.rows[0].nextSitting !== null, 'dropped-thread v1 has a next sitting');
eq(dr.rows[0].nextSitting.tag, 'talk request', 'dropped-thread v1 next sitting tag');
ok(dr.rows[0].nextSitting.opening[0].indexOf('photo') !== -1, 'dropped-thread v1 next sitting re-opens the photo topic');
eq(dr.rows[1].vid, 'v2', 'dropped-thread row 1 vid');
eq(dr.rows[1].nextSitting, null, 'dropped-thread v2 has no next sitting');
eq(tallyDroppedThreads([]).nDrops, 0, 'dropped-thread empty count');

// (8) r163 (C2) furniture filter: 'leave'/'silence' offered every turn
// dominate the raw panelMax; the filtered max is the meaningful signal.
const re2 = tallyReoffers([
  { tag: 'friendship', vid: 'v1', offered: [['doubt', 'leave'], ['leave'], ['doubt', 'leave'], ['doubt', 'leave'], ['leave']] },
  { tag: 'talk request', vid: 'v2', offered: [['silence'], ['silence'], ['silence']] },
]);
eq(re2.panelMax, 5, 're-offer raw panelMax (leave on 5 turns)');
eq(re2.panelMaxFurnitureFree, 3, 're-offer furniture-free panelMax (doubt on 3 turns)');
eq(re2.rows[0].id, 'leave', 're-offer row raw id is furniture');
eq(re2.rows[0].idFurnitureFree, 'doubt', 're-offer row furniture-free id is doubt');
eq(re2.rows[0].maxReofferFurnitureFree, 3, 're-offer row furniture-free max');
eq(re2.rows[1].maxReofferFurnitureFree, 0, 're-offer furniture-only conversation has FF max 0');
eq(tallyReoffers([]).panelMaxFurnitureFree, 0, 're-offer empty furniture-free panelMax');

// (9) r163 (C3) NARR near-dup scan: a verbatim coach repeat in one
// sitting is flagged (the M10 instrument); distinct coach variants are
// not; a same-opening NARR pair flags as a near-dup.
const nd = tallyNarrDup([
  { tag: 'friendship', vid: 'v1', transcript: [
    { who: 'NARR', text: '*They\'ve deflected you before. The evidence needs to be heavier this time — one more thread before you speak.*' },
    { who: 'NPC', text: '"I never said that."' },
    { who: 'NARR', text: '*They\'ve deflected you before. The evidence needs to be heavier this time — one more thread before you speak.*' },
  ] },
  { tag: 'talk request', vid: 'v2', transcript: [
    { who: 'NARR', text: '*Confessions need weight behind them. What you have right now is a thread.*' },
    { who: 'NARR', text: '*Confessions need weight behind them. Find the rope, not the thread.*' },
  ] },
  { tag: 'first meeting', vid: 'v3', transcript: [
    { who: 'NARR', text: '*They glance toward the fire, toward the others — checking who\'s listening.*' },
    { who: 'NARR', text: '*You\'ve pulled a confession before — they come when the evidence is heavy.*' },
  ] },
]);
eq(nd.nVerbatimRepeats, 1, 'narr-dup verbatim repeats (v1 coach x2)');
eq(nd.panelMaxSameNarr, 2, 'narr-dup panel max same text in one sitting');
ok(nd.rows.some(r => r.kind === 'verbatim-repeat' && r.vid === 'v1'), 'narr-dup verbatim row for v1');
ok(nd.rows.some(r => r.kind === 'same-opening' && r.vid === 'v2'), 'narr-dup same-opening flag for v2');
eq(nd.nNearDupFlags, 1, 'narr-dup near-dup flags (only the v2 pair)');
eq(tallyNarrDup([]).nVerbatimRepeats, 0, 'narr-dup empty verbatim repeats');
eq(tallyNarrDup([]).panelMaxSameNarr, 0, 'narr-dup empty panel max');

if (failures) { console.error(`RESULT: FAIL (${failures} assertion(s))`); process.exit(1); }
console.log('RESULT: PASS — M6 strict/gate divergence exact on the radius-1 ring, bond summary splits correct, offered tally + continuer runs correct, counter fresh/blocked split + settle rollup correct, recap cap tally correct, re-offer + dropped-thread tallies correct, furniture-filtered re-offer + NARR near-dup scan correct');
