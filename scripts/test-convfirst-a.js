// test-convfirst-a.js — proof test for the conversations first-numbers arm
// (arm sim-convfirst-a, run fleshout-20261111T0815Z). Proves the
// instrument (convfirst wraps + classification + request lifecycle)
// and the measurement (convfirst analyzer: opens/turns/requests
// classification, neutrality, GO bar).
//
// Legs: (a) classifyChoice maps every prereg taxonomy id to its
// kind and returns 'other' for unknown ids (RED: an unknown id is
// counted unclassified by the analyzer); (b) stackClass attributes
// keepPromiseSocial / deepTalk / talkRound callers; (c) analyzer
// fixtures: open classification, turn classification, request
// source+fate reconstruction (initiative-delivered, expired,
// bond/link flags, betrayal-day1, invitation, pending-at-end,
// unknown source/fate); (c2) v2: diffTalkRequests pure-function
// tests (overwrite staged+superseded) and analyzer v2 fixture
// (superseded + decided fates via bond tele); (c3) v2 purge:
// analyzer fixture (purged fate via playerDeath event, delivered
// survives purge); (d) live harness
// miniatures (12d, seed 190201): flag-OFF default run records opens
// with zero instrument errors and every held turn (if any)
// attributed to keepPromiseSocial; flag-ON run takes real held
// turns (proves the convoTurn wrap live) and is deterministic;
// expireTalkRequests wrap proves live on a directly-staged request;
// instrument ON vs OFF is identical on days + end pantry kcal +
// deaths (miniature neutrality proof); (d2) v2: Game bond/link verb
// wraps prove live by direct calls, and the snapshot supersession
// watch fires on an overwritten request. (d3) v2 purge: the
// playerDeath wrap proves live on a real death — the successor's
// staged request is purged and recorded once, kind
// successor-self, every other request untouched.
// Usage: node scripts/test-convfirst-a.js
'use strict';
const path = require('path');
const assert = require('assert');
const INST = require(path.join(__dirname, 'convfirst-instrument-20261111'));
const AN = require(path.join(__dirname, 'convfirst-analyze-20261111'));
const DRV = require(path.join(__dirname, 'convfirst-driver-20261111'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(__dirname, 'sim-harness'));
const { competent, talkOn } = require(path.join(__dirname, 'policies', 'competent'));

let pass = 0;
function ok(name, fn) { fn(); pass++; console.log('ok ' + pass + ' - ' + name); }
async function aok(name, fn) { await fn(); pass++; console.log('ok ' + pass + ' - ' + name); }

ok('classifyChoice: every prereg taxonomy id maps to its kind', function () {
  const cases = {
    'ans:grief:yes': 'ans', 'gq:yn:yes': 'gq', 'ask:gossip': 'ask',
    'follow:goal': 'follow', 'skill_learn:herbal_remedy': 'skill_learn',
    'skill_teach:cooking': 'skill_teach', 'bond:accept': 'bond',
    'link:decline': 'link', 'dlg:commit': 'dlg', 'nv:bow': 'nv',
    'react:smile': 'react', 'alive:yes': 'alive',
    'betrayal:confront': 'betrayal', 'confront:quiet': 'confront',
    'agency:help': 'agency', 'secret:share': 'secret',
    'rumor:type:theft': 'rumor',
    leave: 'leave', goon: 'goon', deflect_q: 'deflect_q', more: 'more',
    recap: 'recap', observe: 'observe', offer_help: 'offer_help',
    trade: 'trade', trade_yes: 'trade_yes', trade_no: 'trade_no',
    callout_quiet: 'callout_quiet', callout_public: 'callout_public',
    hawker: 'hawker', hawker_yes: 'hawker_yes', hawker_no: 'hawker_no',
    teach: 'teach', speak_back: 'speak_back', invite_party: 'invite_party',
    theorize: 'theorize', compare_maps: 'compare_maps', agree: 'agree',
    joke: 'joke', silence: 'silence', subject: 'subject',
  };
  Object.keys(cases).forEach(function (id) {
    assert.strictEqual(INST.classifyChoice(id), cases[id], id);
  });
});

ok('classifyChoice: unknown ids are other (RED: analyzer counts them unclassified)', function () {
  assert.strictEqual(INST.classifyChoice('bogus_choice'), 'other');
  assert.strictEqual(INST.classifyChoice(''), 'other');
  assert.strictEqual(INST.classifyChoice(null), 'other');
  assert.strictEqual(INST.classifyChoice('menu:more'), 'other');
});

ok('stackClass: keepPromiseSocial beats deepTalk beats talkRound', function () {
  // stackClass reads the live stack: call it from helpers named to
  // exercise each branch. The helper names must appear in the stack.
  function keepPromiseSocial() { return INST.stackClass(); }
  function deepTalk() { return INST.stackClass(); }
  function talkRound() { return INST.stackClass(); }
  assert.strictEqual(keepPromiseSocial(), 'keepPromiseSocial');
  assert.strictEqual(deepTalk(), 'deepTalk');
  assert.strictEqual(talkRound(), 'talkRound');
  assert.strictEqual(INST.stackClass(), 'other');
});

// --- Analyzer fixtures ---
function fakeSeed(opts) {
  const base = {
    seed: 190201, days: 30, gameDays: 30, endReason: 'horizon', won: false,
    scaleRank: 'regional', maxWave: 3, standing: 50, linkTotal: 0,
    endPantryKcal: 12345, instrumentErrors: [], bondEvents: [],
    stageCalls: [], acceptCalls: [], declineCalls: [], proposeCalls: [],
    linkTickCalls: 0, daily: [], convSays: [], sayCount: 0, deaths: [],
    talk: {
      talkToCalls: 0, convoTurnCalls: 0, endConvoCalls: 0,
      initiativeCalls: 0, expireCalls: 0,
      talkOpens: [], turnEvents: [], endEvents: [],
      expireEvents: [], initiativeEvents: [],
      hawkerOffers: [], hawkerBuys: [], compareMapsCalls: [],
    },
  };
  return Object.assign(base, opts || {});
}
function fakeDay(day, extra) {
  return Object.assign({
    day: day, scholarId: 'scholar1', standing: 50, scaleRank: 'regional',
    pantryKcal: 12000, rosterSize: 8, rosterAlive: 8,
    talkRequests: [], pendingRaises: [], talkedTrust: {},
    answeredTotal: 0, sittingsTotal: 0, rumors: [],
  }, extra || {});
}

ok('analyzer: open classification (thread / question / generic / request / other)', function () {
  const j = fakeSeed({
    talk: {
      talkToCalls: 5, convoTurnCalls: 0, endConvoCalls: 5,
      initiativeCalls: 0, expireCalls: 0,
      talkOpens: [
        { day: 2, vid: 'ana', opened: true, caller: 'talkRound', convo: { thread: 'village', pendingQ: null, genericQ: null }, talkReq: null, pendingRaise: false },
        { day: 3, vid: 'ben', opened: true, caller: 'talkRound', convo: { thread: null, pendingQ: 'origin', genericQ: null }, talkReq: null, pendingRaise: false },
        { day: 4, vid: 'cid', opened: true, caller: 'talkRound', convo: { thread: null, pendingQ: null, genericQ: 'yn' }, talkReq: null, pendingRaise: false },
        { day: 5, vid: 'dee', opened: true, caller: 'talkRound', convo: { thread: null, pendingQ: null, genericQ: null }, talkReq: { day: 5, delivered: true }, pendingRaise: false },
        { day: 6, vid: 'eli', opened: true, caller: 'talkRound', convo: { thread: null, pendingQ: null, genericQ: null }, talkReq: null, pendingRaise: false },
        { day: 7, vid: 'fay', opened: false, caller: 'talkRound', convo: null, talkReq: null, pendingRaise: false },
      ],
      turnEvents: [], endEvents: [],
      expireEvents: [], initiativeEvents: [],
      hawkerOffers: [], hawkerBuys: [], compareMapsCalls: [],
    },
    daily: [fakeDay(2), fakeDay(7)],
  });
  const r = AN.analyzeSeed(j);
  assert.strictEqual(r.opens.recorded, 6);
  assert.strictEqual(r.opens.byClass['thread:village'], 1);
  assert.strictEqual(r.opens.byClass['question:origin'], 1);
  assert.strictEqual(r.opens.byClass['generic:yn'], 1);
  assert.strictEqual(r.opens.byClass.request, 1);
  assert.strictEqual(r.opens.byClass['failed-open'], 1);
  assert.strictEqual(r.opens.unclassified, 1);
  assert.strictEqual(r.opens.failedOpens, 1);
});

ok('analyzer: turn classification + ask/ans/gq/skill splits, other counted', function () {
  const j = fakeSeed({
    talk: {
      talkToCalls: 1, convoTurnCalls: 5, endConvoCalls: 1,
      initiativeCalls: 0, expireCalls: 0,
      talkOpens: [{ day: 2, vid: 'ana', opened: true, caller: 'keepPromiseSocial', convo: { thread: 'goal' }, talkReq: null, pendingRaise: false }],
      turnEvents: [
        { day: 2, vid: 'ana', choiceId: 'ans:origin:home', kind: 'ans', caller: 'keepPromiseSocial', thread: 'goal' },
        { day: 2, vid: 'ana', choiceId: 'teach', kind: 'teach', caller: 'keepPromiseSocial', thread: 'goal' },
        { day: 2, vid: 'ana', choiceId: 'ask:gossip', kind: 'ask', caller: 'keepPromiseSocial', thread: 'goal' },
        { day: 2, vid: 'ana', choiceId: 'gq:yn:yes', kind: 'gq', caller: 'keepPromiseSocial', thread: 'goal' },
        { day: 2, vid: 'ana', choiceId: 'bogus_choice', kind: 'other', caller: 'keepPromiseSocial', thread: 'goal' },
      ],
      endEvents: [{ day: 2, vid: 'ana', how: 'natural', caller: 'keepPromiseSocial', convo: { exchanges: 4 } }],
      expireEvents: [], initiativeEvents: [],
      hawkerOffers: [], hawkerBuys: [], compareMapsCalls: [],
    },
    daily: [fakeDay(2)],
  });
  const r = AN.analyzeSeed(j);
  assert.strictEqual(r.turns.recorded, 5);
  assert.strictEqual(r.turns.byKind.ans, 1);
  assert.strictEqual(r.turns.byKind.teach, 1);
  assert.strictEqual(r.turns.byKind.ask, 1);
  assert.strictEqual(r.turns.byKind.gq, 1);
  assert.strictEqual(r.turns.unclassified, 1);
  assert.deepStrictEqual(r.turns.unclassifiedIds, ['bogus_choice']);
  assert.strictEqual(r.turns.askTopics.gossip, 1);
  assert.strictEqual(r.turns.ansIds.origin, 1);
  assert.strictEqual(r.turns.gqKinds.yn, 1);
  assert.strictEqual(r.turns.byCaller.keepPromiseSocial, 5);
  assert.strictEqual(r.endings.byHow.natural, 1);
  assert.strictEqual(r.endings.exchanges3plus, 1);
});

ok('analyzer: request reconstruction — delivered, expired, pending, bond/link/day1/invitation', function () {
  const j = fakeSeed({
    talk: {
      talkToCalls: 3, convoTurnCalls: 0, endConvoCalls: 3,
      initiativeCalls: 2, expireCalls: 1,
      talkOpens: [
        { day: 5, vid: 'ana', opened: true, caller: 'talkRound', convo: { thread: 'village' }, talkReq: { day: 4, delivered: true }, talkReqLine: '"Can we talk?" __NAME__ sits down near you. "Just... talk. Like people used to."', pendingRaise: false },
      ],
      turnEvents: [], endEvents: [],
      expireEvents: [{ day: 8, vid: 'ben', age: 3, delivered: false, bondProposal: false, linkRaise: false }],
      initiativeEvents: [
        { day: 4, vid: 'ana', line: '"Can we talk?" __NAME__ sits down near you. "Just... talk. Like people used to."', bondProposal: false, linkRaise: false, superseded: null },
        { day: 5, vid: 'ben', line: '"Can we talk?" __NAME__ glances around first. "People are saying things. About you. Is any of it true?"', bondProposal: false, linkRaise: false, superseded: null },
      ],
      supersedeEvents: [],
      hawkerOffers: [], hawkerBuys: [], compareMapsCalls: [],
    },
    bondEvents: [],
    daily: [
      fakeDay(1, { talkRequests: [{ vid: 'cid', day: 1, delivered: false, bondProposal: false, linkRaise: false, line: '"Hey." __NAME__ settles near you, not too close. "Day one. Everyone\'s pretending they\'re fine. ...Can we talk? Just talk — like people used to."' }] }),
      fakeDay(4, { talkRequests: [{ vid: 'ana', day: 4, delivered: false, bondProposal: false, linkRaise: false, line: '"Can we talk?" __NAME__ sits down near you. "Just... talk. Like people used to."' }] }),
      fakeDay(5, {
        talkRequests: [
          { vid: 'ana', day: 4, delivered: true, bondProposal: false, linkRaise: false, line: '"Can we talk?" __NAME__ sits down near you. "Just... talk. Like people used to."' },
          { vid: 'ben', day: 5, delivered: false, bondProposal: false, linkRaise: false, line: '"Can we talk?" __NAME__ glances around first. "People are saying things. About you. Is any of it true?"' },
          { vid: 'dee', day: 5, delivered: false, bondProposal: true, linkRaise: false, line: '__NAME__: "I\'d like us to be closer."' },
          { vid: 'eli', day: 5, delivered: false, bondProposal: false, linkRaise: true, line: '__NAME__: "We should ask them."' },
          { vid: 'fay', day: 5, delivered: false, bondProposal: false, linkRaise: false, line: '__NAME__: "Hey — come here. You should hear this."' },
        ],
      }),
      fakeDay(8, { talkRequests: [
        { vid: 'dee', day: 5, delivered: false, bondProposal: true, linkRaise: false, line: '__NAME__: "I\'d like us to be closer."' },
        { vid: 'eli', day: 5, delivered: false, bondProposal: false, linkRaise: true, line: '__NAME__: "We should ask them."' },
        { vid: 'fay', day: 5, delivered: false, bondProposal: false, linkRaise: false, line: '__NAME__: "Hey — come here. You should hear this."' },
      ] }),
    ],
  });
  const r = AN.analyzeSeed(j);
  assert.strictEqual(r.requests.total, 6);
  assert.strictEqual(r.requests.bySource.villagerInitiative, 2);
  assert.strictEqual(r.requests.bySource['betrayal-day1'], 1);
  assert.strictEqual(r.requests.bySource.bondProposal, 1);
  assert.strictEqual(r.requests.bySource.linkRaise, 1);
  assert.strictEqual(r.requests.bySource.invitation, 1);
  assert.strictEqual(r.requests.unclassifiedSource, 0);
  assert.strictEqual(r.requests.byFate.delivered, 1);
  assert.strictEqual(r.requests.byFate.expired, 1);
  assert.strictEqual(r.requests.byFate['pending-at-end'], 3);
  // cid (day-1) is neither delivered nor expired nor in the last
  // snapshot: it expired silently between snapshots — unknown fate.
  // That is honest: the fixture proves unknown fates are counted,
  // and the pilot must show zero of them (GO bar).
  assert.strictEqual(r.requests.unknownFate, 1);
  assert.strictEqual(r.requests.byFate.unknown, 1);
});

ok('analyzer: unknown source + unknown fate are counted (RED)', function () {
  const j = fakeSeed({
    talk: {
      talkToCalls: 0, convoTurnCalls: 0, endConvoCalls: 0,
      initiativeCalls: 0, expireCalls: 0,
      talkOpens: [], turnEvents: [], endEvents: [],
      expireEvents: [], initiativeEvents: [],
      hawkerOffers: [], hawkerBuys: [], compareMapsCalls: [],
    },
    daily: [fakeDay(9, { talkRequests: [{ vid: 'zed', day: 9, delivered: false, bondProposal: false, linkRaise: false, line: '???' }] })],
  });
  const r = AN.analyzeSeed(j);
  assert.strictEqual(r.requests.total, 1);
  assert.strictEqual(r.requests.unclassifiedSource, 1);
  assert.strictEqual(r.requests.byFate['pending-at-end'], 1);
});

ok('analyzer: reasonKind classifies talkReason lines', function () {
  assert.strictEqual(AN.reasonKind('"Can we talk?" __NAME__ glances around first. "People are saying things. About you. Is any of it true?"'), 'gossip');
  assert.strictEqual(AN.reasonKind('"Can we talk?" __NAME__ sits down near you. "Just... talk. Like people used to."'), 'just-talk');
  assert.strictEqual(AN.reasonKind('"Can we talk?" __NAME__ keeps their voice low. "The stores. Have you looked at the stores? We\'re running thin."'), 'pantry-low');
  assert.strictEqual(AN.reasonKind('unrelated line'), null);
});

ok('diffTalkRequests: new key staged, overwrite staged+superseded, unchanged silent', function () {
  const d = INST.diffTalkRequests;
  const fp = INST.requestFingerprint;
  assert.strictEqual(fp({ day: 4, line: 'a' }), '4|a|');
  assert.strictEqual(fp({ day: 4, line: 'a', bondProposal: true }), '4|a|B');
  assert.strictEqual(fp(null), null);
  // New key.
  let r = d({}, { ana: { day: 4, line: 'hello', bondProposal: false, linkRaise: false } });
  assert.strictEqual(r.staged.length, 1);
  assert.strictEqual(r.staged[0].vid, 'ana');
  assert.strictEqual(r.staged[0].superseded, null);
  assert.strictEqual(r.superseded.length, 0);
  // Unchanged: nothing.
  r = d({ ana: { day: 4, line: 'hello' } }, { ana: { day: 4, line: 'hello' } });
  assert.strictEqual(r.staged.length, 0);
  assert.strictEqual(r.superseded.length, 0);
  // Overwrite: new staged + old superseded (v1 key-set diff missed this).
  r = d({ ana: { day: 4, line: 'hello' } }, { ana: { day: 5, line: 'goodbye' } });
  assert.strictEqual(r.staged.length, 1);
  assert.strictEqual(r.staged[0].day, 5);
  assert.strictEqual(r.staged[0].superseded.day, 4);
  assert.strictEqual(r.staged[0].superseded.line, 'hello');
  assert.strictEqual(r.superseded.length, 1);
  assert.strictEqual(r.superseded[0].oldDay, 4);
  assert.strictEqual(r.superseded[0].newDay, 5);
  // Delivered flag change alone (same fingerprint): nothing staged.
  r = d({ ana: { day: 4, line: 'hello', delivered: false } }, { ana: { day: 4, line: 'hello', delivered: true } });
  assert.strictEqual(r.staged.length, 0);
  assert.strictEqual(r.superseded.length, 0);
});

ok('analyzer v2: superseded (overwrite) + decided (bond tele) fates are classified, not unknown', function () {
  const j = fakeSeed({
    talk: {
      talkToCalls: 1, convoTurnCalls: 0, endConvoCalls: 1,
      initiativeCalls: 2, expireCalls: 0,
      talkOpens: [],
      turnEvents: [], endEvents: [],
      expireEvents: [],
      initiativeEvents: [
        { day: 4, vid: 'ana', line: '"Can we talk?" first ask.', bondProposal: false, linkRaise: false, superseded: null },
        { day: 5, vid: 'ana', line: '"Can we talk?" second ask.', bondProposal: false, linkRaise: false, superseded: { day: 4, line: '"Can we talk?" first ask.' } },
      ],
      supersedeEvents: [
        { day: 5, vid: 'ana', oldDay: 4, oldLine: '"Can we talk?" first ask.', newDay: 5, newLine: '"Can we talk?" second ask.', by: 'villagerInitiative' },
      ],
      hawkerOffers: [], hawkerBuys: [], compareMapsCalls: [],
    },
    bondEvents: [
      { day: 6, initiator: 'ben', target: 'scholar1', kind: 'person', outcome: 'staged', chance: null, reason: null },
      { day: 7, initiator: 'ben', target: 'scholar1', kind: 'person', outcome: 'accepted', chance: null, reason: null },
      { day: 6, initiator: 'cid', target: 'stonebridge', kind: 'link', outcome: 'staged', chance: null, reason: null },
      { day: 9, initiator: 'cid', target: 'stonebridge', kind: 'link', outcome: 'expired', chance: null, reason: null },
    ],
    daily: [
      fakeDay(4, { talkRequests: [{ vid: 'ana', day: 4, delivered: false, bondProposal: false, linkRaise: false, line: '"Can we talk?" first ask.' }] }),
      fakeDay(6, {
        talkRequests: [
          { vid: 'ana', day: 5, delivered: false, bondProposal: false, linkRaise: false, line: '"Can we talk?" second ask.' },
          { vid: 'ben', day: 6, delivered: false, bondProposal: true, linkRaise: false, line: '__NAME__: "I\'d like us to be closer."' },
          { vid: 'cid', day: 6, delivered: false, bondProposal: false, linkRaise: true, line: '__NAME__: "We should link with them."' },
        ],
      }),
      fakeDay(9, { talkRequests: [] }),
    ],
  });
  const r = AN.analyzeSeed(j);
  assert.strictEqual(r.requests.total, 4);
  assert.strictEqual(r.requests.byFate.superseded, 1);
  assert.strictEqual(r.requests.byFate.decided, 1);
  assert.strictEqual(r.requests.byFate.expired, 1);
  assert.strictEqual(r.requests.byFate.unknown, 1);
  // ana day 4 superseded (overwritten day 5); ben decided-accepted;
  // cid expired via tele; ana day 5 vanished with no event = unknown.
  const byKey = {};
  r.requests.detail.forEach(function (q) { byKey[q.vid + '|' + q.day] = q; });
  assert.strictEqual(byKey['ana|4'].fate, 'superseded');
  assert.strictEqual(byKey['ben|6'].fate, 'decided');
  assert.strictEqual(byKey['ben|6'].decidedOutcome, 'accepted');
  assert.strictEqual(byKey['cid|6'].fate, 'expired');
  assert.strictEqual(byKey['ana|5'].fate, 'unknown');
  assert.strictEqual(r.requests.unknownFate, 1);
});

ok('analyzer v2: purged fate (playerDeath self-request purge) is classified, delivered survives purge', function () {
  // Two deaths: ana inherits day 6 (her undelivered request is
  // purged); ben inherits day 8 (his already-delivered record is
  // purged, but the delivery already happened — fate stays
  // delivered). Both are real engine paths (ledger.js r133 deletes
  // the successor's request whatever its delivered flag).
  const j = fakeSeed({
    talk: {
      talkToCalls: 0, convoTurnCalls: 0, endConvoCalls: 0,
      initiativeCalls: 2, expireCalls: 0,
      talkOpens: [],
      turnEvents: [], endEvents: [],
      expireEvents: [],
      initiativeEvents: [
        { day: 4, vid: 'ana', line: '"Can we talk?" __NAME__ sits down near you. "Just... talk. Like people used to."', bondProposal: false, linkRaise: false, superseded: null },
        { day: 4, vid: 'ben', line: '"Can we talk?" __NAME__ glances around first. "People are saying things. About you. Is any of it true?"', bondProposal: false, linkRaise: false, superseded: null },
      ],
      supersedeEvents: [],
      purgeEvents: [
        { day: 6, vid: 'ana', oldDay: 4, oldLine: '"Can we talk?" first ask.', delivered: false, bondProposal: false, linkRaise: false, successor: 'ana', kind: 'successor-self', cause: 'the wild' },
        { day: 8, vid: 'ben', oldDay: 4, oldLine: '"Can we talk?" second ask.', delivered: true, bondProposal: false, linkRaise: false, successor: 'ben', kind: 'successor-self', cause: 'the wild' },
      ],
      playerDeathCalls: 2,
      hawkerOffers: [], hawkerBuys: [], compareMapsCalls: [],
    },
    bondEvents: [],
    daily: [
      fakeDay(4, { talkRequests: [
        { vid: 'ana', day: 4, delivered: false, bondProposal: false, linkRaise: false, line: '"Can we talk?" first ask.' },
        { vid: 'ben', day: 4, delivered: false, bondProposal: false, linkRaise: false, line: '"Can we talk?" second ask.' },
      ] }),
      fakeDay(5, { talkRequests: [
        { vid: 'ana', day: 4, delivered: false, bondProposal: false, linkRaise: false, line: '"Can we talk?" first ask.' },
        { vid: 'ben', day: 4, delivered: true, bondProposal: false, linkRaise: false, line: '"Can we talk?" second ask.' },
      ] }),
      fakeDay(7, { talkRequests: [
        { vid: 'ben', day: 4, delivered: true, bondProposal: false, linkRaise: false, line: '"Can we talk?" second ask.' },
      ] }),
      fakeDay(9, { talkRequests: [] }),
    ],
  });
  const r = AN.analyzeSeed(j);
  assert.strictEqual(r.requests.total, 2);
  assert.strictEqual(r.requests.byFate.purged, 1);
  assert.strictEqual(r.requests.byFate.delivered, 1);
  assert.strictEqual(r.requests.unknownFate, 0);
  assert.strictEqual(r.requests.playerDeathCalls, 2);
  assert.strictEqual(r.requests.purgeEvents, 2);
  const byKey = {};
  r.requests.detail.forEach(function (q) { byKey[q.vid + '|' + q.day] = q; });
  assert.strictEqual(byKey['ana|4'].fate, 'purged');
  assert.strictEqual(byKey['ana|4'].purgedDay, 6);
  assert.strictEqual(byKey['ana|4'].purgedKind, 'successor-self');
  assert.strictEqual(byKey['ben|4'].fate, 'delivered');
});

async function runMiniature(seed, days, flagOn, withInstrument) {
  if (flagOn) process.env.COMPETENT_TALK = '1';
  else delete process.env.COMPETENT_TALK;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-convfirst-test', fullTelemetry: false });
  await setupGame(Game);
  const inst = withInstrument ? INST.install(Game) : null;
  let lastCtx = null;
  const wrapped = Object.assign({}, competent, {
    daily: function (Gm, ctx) {
      lastCtx = ctx;
      try { return competent.daily(Gm, ctx); } finally {
        if (inst) { try { inst.installTeleLazy(); inst.snapshot(); } catch (e) {} }
      }
    },
  });
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: days, manifest: undefined, sampleEvery: 30 }); });
  if (inst) { try { inst.snapshot(); } catch (e) {} try { inst.uninstall(); } catch (e) {} }
  let standing = null;
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
  let pantry = null;
  try {
    const v = (Game.state || {}).village || {};
    pantry = (v.pantry || []).reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) {}
  const deaths = ((result && result.samples && result.samples.deaths) || []).length;
  delete process.env.COMPETENT_TALK;
  return {
    days: result.days, standing: standing, pantryKcal: pantry, deaths: deaths,
    deepTurns: (lastCtx && lastCtx.deepTurns) || 0,
    deepConvos: (lastCtx && lastCtx.deepConvos) || 0,
    inst: inst ? inst.t : null,
  };
}

(async function () {
  await aok('live: flag-OFF 12d records opens, zero instrument errors, turns only via keepPromiseSocial', async function () {
    const m = await runMiniature(190201, 12, false, true);
    assert.strictEqual(m.inst.instrumentErrors.length, 0, 'instrument errors: ' + JSON.stringify(m.inst.instrumentErrors));
    assert.ok(m.inst.talkToCalls > 0, 'opens recorded, talkToCalls=' + m.inst.talkToCalls);
    assert.ok(m.inst.talkOpens.length > 0, 'open events recorded');
    m.inst.turnEvents.forEach(function (ev) {
      assert.strictEqual(ev.caller, 'keepPromiseSocial', 'held turn under default play must come via keepPromiseSocial, got ' + ev.caller + ' for ' + ev.choiceId);
    });
    m.inst.talkOpens.forEach(function (ev) {
      assert.ok(ev.caller === 'talkRound' || ev.caller === 'keepPromiseSocial', 'open caller must be talkRound or keepPromiseSocial, got ' + ev.caller);
    });
    console.log('    (12d flag-OFF: days=' + m.days + ' opens=' + m.inst.talkToCalls + ' turns=' + m.inst.convoTurnCalls + ' ends=' + m.inst.endConvoCalls + ' deepTurns=' + m.deepTurns + ')');
  });

  await aok('live: flag-ON 12d takes real held turns (convoTurn wrap live), deterministic', async function () {
    const a = await runMiniature(190201, 12, true, true);
    const b = await runMiniature(190201, 12, true, true);
    assert.strictEqual(a.inst.instrumentErrors.length, 0, 'errors: ' + JSON.stringify(a.inst.instrumentErrors));
    assert.ok(a.deepTurns > 0, 'held turns taken, deepTurns=' + a.deepTurns);
    assert.ok(a.inst.convoTurnCalls > 0, 'convoTurn calls recorded, calls=' + a.inst.convoTurnCalls);
    assert.deepStrictEqual(
      { days: a.days, standing: a.standing, turns: a.inst.convoTurnCalls, opens: a.inst.talkToCalls },
      { days: b.days, standing: b.standing, turns: b.inst.convoTurnCalls, opens: b.inst.talkToCalls },
      'flag-on 12d deterministic');
    console.log('    (12d flag-ON: days=' + a.days + ' opens=' + a.inst.talkToCalls + ' turns=' + a.inst.convoTurnCalls + ' deepTurns=' + a.deepTurns + ')');
  });

  await aok('live: expireTalkRequests wrap proves live on a directly-staged request', async function () {
    delete process.env.COMPETENT_TALK;
    const { Game } = await loadGame({ seed: 190201, mode: 'competent-convfirst-test', fullTelemetry: false });
    await setupGame(Game);
    const inst = INST.install(Game);
    const roster = ((Game.state || {}).village || {}).roster || [];
    const vid = roster.filter(function (id) { return id !== Game.villagerId; })[0];
    assert.ok(vid, 'roster has a non-scholar villager');
    const v = Game.state.village;
    v.talkRequests = v.talkRequests || {};
    // Stage a request 5 days old: the next expireTalkRequests call
    // must prune it (undelivered + age > 2) and record the expiry.
    v.talkRequests[vid] = { line: '"Can we talk?" fixture request.', day: ((Game.state.scholar || {}).day || 1) - 5 };
    assert.strictEqual(typeof Game.expireTalkRequests, 'function', 'expireTalkRequests exists');
    Game.expireTalkRequests();
    assert.strictEqual(inst.t.expireCalls, 1, 'expire wrap fired once');
    assert.strictEqual(inst.t.expireEvents.length, 1, 'one expiry recorded');
    assert.strictEqual(inst.t.expireEvents[0].vid, vid);
    assert.strictEqual(inst.t.expireEvents[0].delivered, false);
    assert.strictEqual(v.talkRequests[vid], undefined, 'request actually pruned by the engine');
    assert.strictEqual(inst.t.instrumentErrors.length, 0, 'errors: ' + JSON.stringify(inst.t.instrumentErrors));
    inst.uninstall();
    console.log('    (expire fixture: vid=' + vid + ' pruned, expireEvents=1)');
  });

  await aok('live: instrument ON vs OFF 12d identical on days + pantry + deaths (miniature neutrality)', async function () {
    const on = await runMiniature(190201, 12, false, true);
    const off = await runMiniature(190201, 12, false, false);
    assert.strictEqual(on.days, off.days, 'days match');
    assert.strictEqual(on.pantryKcal, off.pantryKcal, 'end pantry kcal match');
    assert.strictEqual(on.deaths, off.deaths, 'death count match');
    console.log('    (12d neutrality: days=' + on.days + ' pantry=' + on.pantryKcal + ' deaths=' + on.deaths + ')');
  });

  await aok('live: villagerInitiative wrap fires (call count recorded, zero errors)', async function () {
    const m = await runMiniature(190201, 12, false, true);
    assert.strictEqual(m.inst.instrumentErrors.length, 0, 'errors: ' + JSON.stringify(m.inst.instrumentErrors));
    assert.ok(m.inst.initiativeCalls > 0, 'villagerInitiative called, calls=' + m.inst.initiativeCalls);
    console.log('    (12d initiative: calls=' + m.inst.initiativeCalls + ' staged=' + m.inst.initiativeEvents.length + ')');
  });

  await aok('live: Game bond/link verb wraps prove live by direct calls (0 under competent is real)', async function () {
    delete process.env.COMPETENT_TALK;
    const { Game } = await loadGame({ seed: 190201, mode: 'competent-convfirst-test', fullTelemetry: false });
    await setupGame(Game);
    const inst = INST.install(Game);
    const roster = ((Game.state || {}).village || {}).roster || [];
    const vid = roster.filter(function (id) { return id !== Game.villagerId; })[0];
    assert.ok(vid, 'roster has a non-scholar villager');
    const ovs = (Game.state || {}).otherVillages || [];
    const villageId = ovs.length ? ovs[0].id : 'emberhold';
    // Each verb is called once; the wrap records the call whatever
    // the engine returns (gates may refuse — the RECORD proves the
    // wrap is live, the return proves the gate ran).
    try { Game.stageLinkRaise(vid, villageId); } catch (e) {}
    try { Game.acceptLinkRaise(vid); } catch (e) {}
    try { Game.declineLinkRaise(vid); } catch (e) {}
    try { Game.stageBondProposal(vid); } catch (e) {}
    try { Game.acceptBondProposal(vid); } catch (e) {}
    try { Game.declineBondProposal(vid); } catch (e) {}
    try { Game.npcBondTick(); } catch (e) {}
    try { Game.npcLinkRaiseTick(); } catch (e) {}
    assert.strictEqual(inst.t.stageCalls.length, 1, 'stageLinkRaise wrap fired');
    assert.strictEqual(inst.t.acceptCalls.length, 1, 'acceptLinkRaise wrap fired');
    assert.strictEqual(inst.t.declineCalls.length, 1, 'declineLinkRaise wrap fired');
    assert.strictEqual(inst.t.stageBondCalls.length, 1, 'stageBondProposal wrap fired');
    assert.strictEqual(inst.t.acceptBondCalls.length, 1, 'acceptBondProposal wrap fired');
    assert.strictEqual(inst.t.declineBondCalls.length, 1, 'declineBondProposal wrap fired');
    assert.strictEqual(inst.t.bondTickCalls, 1, 'npcBondTick wrap fired');
    assert.strictEqual(inst.t.linkTickCalls, 1, 'npcLinkRaiseTick wrap fired');
    assert.strictEqual(inst.t.instrumentErrors.length, 0, 'errors: ' + JSON.stringify(inst.t.instrumentErrors));
    inst.uninstall();
    console.log('    (verb wraps: all 8 fired once on direct calls)');
  });

  await aok('live: snapshot supersession watch fires on an overwritten request', async function () {
    delete process.env.COMPETENT_TALK;
    const { Game } = await loadGame({ seed: 190201, mode: 'competent-convfirst-test', fullTelemetry: false });
    await setupGame(Game);
    const inst = INST.install(Game);
    const roster = ((Game.state || {}).village || {}).roster || [];
    const vid = roster.filter(function (id) { return id !== Game.villagerId; })[0];
    assert.ok(vid, 'roster has a non-scholar villager');
    const v = Game.state.village;
    v.talkRequests = v.talkRequests || {};
    const day = ((Game.state.scholar || {}).day || 1);
    v.talkRequests[vid] = { line: '"Can we talk?" first ask.', day: day };
    inst.snapshot();
    // Overwrite the live request (what invitations and
    // villagerInitiative do): same vid, new line + day.
    v.talkRequests[vid] = { line: '"Can we talk?" second ask.', day: day };
    inst.snapshot();
    assert.strictEqual(inst.t.supersedeEvents.length, 1, 'one supersession recorded, got ' + JSON.stringify(inst.t.supersedeEvents));
    assert.strictEqual(inst.t.supersedeEvents[0].vid, vid);
    assert.strictEqual(inst.t.supersedeEvents[0].by, 'snapshot');
    assert.strictEqual(inst.t.instrumentErrors.length, 0, 'errors: ' + JSON.stringify(inst.t.instrumentErrors));
    inst.uninstall();
    console.log('    (supersede watch: vid=' + vid + ' overwritten request recorded)');
  });

  await aok('live: playerDeath wrap records exactly the successor-self purge (r133, ledger.js)', async function () {
    delete process.env.COMPETENT_TALK;
    const { Game } = await loadGame({ seed: 190201, mode: 'competent-convfirst-test', fullTelemetry: false });
    await setupGame(Game);
    const inst = INST.install(Game);
    const oldBearer = Game.villagerId;
    const roster = ((Game.state || {}).village || {}).roster || [];
    const others = roster.filter(function (id) { return id !== oldBearer; });
    assert.ok(others.length >= 2, 'roster has non-scholar villagers, got ' + others.length);
    const v = Game.state.village;
    v.talkRequests = v.talkRequests || {};
    const day = ((Game.state.scholar || {}).day || 1);
    // Stage a request for EVERY possible successor, so whoever
    // inherits, theirs is the one purged (ledger.js r133).
    others.forEach(function (vid) {
      v.talkRequests[vid] = { line: '"Can we talk?" purge fixture.', day: day };
    });
    assert.strictEqual(typeof Game.playerDeath, 'function', 'playerDeath exists');
    Game.playerDeath('test-cause');
    const newBearer = Game.villagerId;
    assert.notStrictEqual(newBearer, oldBearer, 'mantle passed to a successor');
    assert.strictEqual(inst.t.playerDeathCalls, 1, 'playerDeath wrap fired once');
    assert.strictEqual(inst.t.purgeEvents.length, 1, 'exactly one request purged, got ' + JSON.stringify(inst.t.purgeEvents));
    const ev = inst.t.purgeEvents[0];
    assert.strictEqual(ev.vid, newBearer, 'purged vid is the successor');
    assert.strictEqual(ev.successor, newBearer);
    assert.strictEqual(ev.kind, 'successor-self');
    assert.strictEqual(ev.oldDay, day);
    assert.strictEqual(v.talkRequests[newBearer], undefined, 'successor request actually purged by the engine');
    others.filter(function (id) { return id !== newBearer; }).forEach(function (vid) {
      assert.ok(v.talkRequests[vid], 'other villager request untouched: ' + vid);
    });
    assert.strictEqual(inst.t.instrumentErrors.length, 0, 'errors: ' + JSON.stringify(inst.t.instrumentErrors));
    inst.uninstall();
    console.log('    (purge live: old=' + oldBearer + ' new=' + newBearer + ' purgeEvents=1 kind=successor-self)');
  });

  console.log('PASS ' + pass + '/' + pass);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
