#!/usr/bin/env node
// test-mootgate-a.js — proof for the moot-convening gate instrument
// + the gate itself (sim-mootgate-a).
//
// Unit leg (fast, always): the mootgate diag extension (dead-case
// classifier + name extraction, LIVE-line accused-set extraction,
// kindOf 'dead-case', window classification) + the mootgate driver
// analysis on synthetic instances (5-day follow-up with case
// identity + dead-case resolution, overlap flag, still-open flag,
// loop-day primary rates, held-open stall measure).
// Integration leg (60 loop-days, bankfood variant leg, WOODWARM=0):
// runs the driver once with STRANDNARR=1 and once with
// STRANDNARR=0 on seed 17021 and asserts
//   (a) det-gate: bankfood evenings/mornings/first-upkeep kcal series
//       identical ON vs OFF (the recorder + position reads + case
//       snapshots change no trajectory);
//   (b) 17021 CURRENT-SUBSTRATE FACTS (re-pin, verified on this
//       master 2026-11-06 before the proof was written): 60d
//       SURVIVED, 0 stranded nights;
//   (c) non-stranded anchor: seed 15003 loop-day 7 sleep window
//       contains a 'Word gets around the haven' line, classified
//       non-stranded sleep with the scholar inside Haven at fire
//       time (the strandnarr-a §2 known hit).
// Gate leg (added with the fix commit, in the same file): convening
// skipped while the scholar is away, fires on return; det-gate
// ON-vs-OFF identical on a non-moot seed; anchor seed 48006
// loop-day 9 must NOT summon after the fix.
// Usage: node scripts/test-mootgate-a.js
// Env (the bankfood substrate gates, as in mootgate-trace-a.js):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY=nighttravel WOODCARRY=1 WOODWARM=0 BANKFOOD=1
'use strict';
const mm = require('./policies/mootsummon-diag');
const sn = require('./policies/strandnarr-diag');
const gc = require('./policies/gossipcensus-diag');
const { oneInstance, analyzeInstance, sleepPair } = require('./mootgate-trace-a');

let checks = 0, fails = 0;
function check(name, cond, detail) {
  checks++;
  if (cond) console.log('ok   ' + name);
  else { fails++; console.log('FAIL ' + name + ' :: ' + (detail || '')); }
}

// ---- unit leg: diag extension ----
const SUMMONS = 'The moot turns to you. Your vote matters here — and everyone will remember it.';
const LIVE3 = '🔴 LIVE! THE MOOT! The fire\'s built HIGH and the whole GALAXY is watching!';
const LIVE_ACC3 = 'TONIGHT: NIKOLAI, DANTE AND PAUL stand accused — CRIMES AGAINST THE VILLAGE! The gamblers are FRENZIED! Place your bets, place your bets!';
const LIVE_ACC1 = 'TONIGHT: NIKOLAI stands accused — CRIMES AGAINST THE VILLAGE! The gamblers are FRENZIED! Place your bets, place your bets!';
const LIVE_YOU = 'TONIGHT: YOU stand accused — CRIMES AGAINST THE VILLAGE! The gamblers are FRENZIED! Place your bets, place your bets!';
const CALL_TRIAL = 'Giuseppe calls the moot. The fire gets built up — word travels fast, and almost everyone comes.';
const BACKSTOP = 'The moot doesn\'t wait forever. Two days of silence from the fire\'s edge — the count is taken without you.';
const DEADCASE = 'Nikolai is gone — the moot doesn\'t try the dead. The case dies with the accused; the fire remembers the rest.';
const DEADCASE_MULTI = 'Dante is gone — the moot doesn\'t try the dead. The cases die with the accused; the fire remembers the rest.';
const VCOUNT = 'Marta counts on their fingers, twice, like they don\'t trust the first number. Then, to the fire: "4 for guilty. 9 against."';

check('dead-case: closure line classified', mm.isDeadCaseLine(DEADCASE) && mm.kindOf(DEADCASE) === 'dead-case');
check('dead-case: multi-case closure line classified', mm.isDeadCaseLine(DEADCASE_MULTI) && mm.kindOf(DEADCASE_MULTI) === 'dead-case');
check('dead-case: backstop is NOT a dead-case line', !mm.isDeadCaseLine(BACKSTOP));
check('dead-case: name extracted', mm.deadCaseName(DEADCASE) === 'Nikolai');
check('dead-case: multi-case name extracted', mm.deadCaseName(DEADCASE_MULTI) === 'Dante');
check('dead-case: no name on a plain line', mm.deadCaseName('Dawn. You wake stiff and cold.') === null);
check('accused-set: three names parsed', (() => {
  const s = mm.accusedSetFromLive(LIVE_ACC3);
  return Array.isArray(s) && s.length === 3 && s[0] === 'NIKOLAI' && s[1] === 'DANTE' && s[2] === 'PAUL';
})());
check('accused-set: one name parsed', (() => {
  const s = mm.accusedSetFromLive(LIVE_ACC1);
  return Array.isArray(s) && s.length === 1 && s[0] === 'NIKOLAI';
})());
check('accused-set: YOU kept as a token', (() => {
  const s = mm.accusedSetFromLive(LIVE_YOU);
  return Array.isArray(s) && s.length === 1 && s[0] === 'YOU';
})());
check('accused-set: non-LIVE line gives null', mm.accusedSetFromLive(CALL_TRIAL) === null);
check('window: dead-case line counted in the window tallies', (() => {
  const lines = [
    { idx: 1, loopDay: 12, phase: 'sleep', part: 0, text: LIVE3 },
    { idx: 2, loopDay: 12, phase: 'sleep', part: 0, text: CALL_TRIAL },
    { idx: 3, loopDay: 12, phase: 'sleep', part: 0, text: SUMMONS },
    { idx: 4, loopDay: 13, phase: 'sleep', part: 0, text: DEADCASE },
  ];
  const w = mm.classifyMootWindow(lines, []);
  return w.perKind['dead-case'].lines === 1 && w.perKind['dead-case'].windows === 1
    && w.perKind['summons'].windows === 1;
})());

// ---- unit leg: driver analysis on synthetic instances ----
check('follow-up: dead-case line naming an accused resolves the case', (() => {
  const markers = [
    { idx: 0, kind: 'sleep-start', loopDay: 5, part: 0, inside: false, mx: 0, my: 8, tile: 'forest_floor' },
    { idx: 10, kind: 'sleep-end', loopDay: 5, part: 0, inside: false, mx: 0, my: 8, tile: 'forest_floor' },
  ];
  const lines = [
    { idx: 1, loopDay: 5, phase: 'sleep', part: 0, text: LIVE3 },
    { idx: 2, loopDay: 5, phase: 'sleep', part: 0, text: 'TONIGHT: NIKOLAI, DANTE AND PAUL stand accused — CRIMES AGAINST THE VILLAGE! The gamblers are FRENZIED! Place your bets, place your bets!' },
    { idx: 3, loopDay: 5, phase: 'sleep', part: 0, text: CALL_TRIAL },
    { idx: 4, loopDay: 5, phase: 'sleep', part: 0, text: SUMMONS },
    { idx: 20, loopDay: 6, phase: 'sleep', part: 0, text: DEADCASE },
  ];
  const inst = {
    transcript: { lines, markers },
    evenings: [
      { loopDay: 5, gameDay: 5, eveningOutcome: 'out-of-reach', inside: false, tile: 'forest_floor', cases: [] },
      { loopDay: 6, gameDay: 6, eveningOutcome: 'policy-no-record', inside: true, tile: 'haven', cases: [] },
    ],
    mornings: [],
  };
  const a = analyzeInstance(inst);
  if (a.summonsEvents.length !== 1) return false;
  const ev = a.summonsEvents[0];
  return ev.accusedSet && ev.accusedSet.length === 3 && ev.accusedSet[0] === 'NIKOLAI'
    && ev.resolution.deadCase && ev.resolution.deadCase.name === 'Nikolai'
    && ev.resolution.deadCase.matchesAccused === true
    && ev.resolved === true && ev.stillOpen === false
    && ev.resolution.backstop === null
    && ev.eveningsAfter.length === 5;
})());
check('follow-up: dead-case line naming a NON-accused does not resolve', (() => {
  const markers = [
    { idx: 0, kind: 'sleep-start', loopDay: 5, part: 0, inside: false, mx: 0, my: 8, tile: 'forest_floor' },
    { idx: 10, kind: 'sleep-end', loopDay: 5, part: 0, inside: false, mx: 0, my: 8, tile: 'forest_floor' },
  ];
  const lines = [
    { idx: 1, loopDay: 5, phase: 'sleep', part: 0, text: LIVE3 },
    { idx: 2, loopDay: 5, phase: 'sleep', part: 0, text: LIVE_ACC1 },
    { idx: 3, loopDay: 5, phase: 'sleep', part: 0, text: CALL_TRIAL },
    { idx: 4, loopDay: 5, phase: 'sleep', part: 0, text: SUMMONS },
    { idx: 20, loopDay: 6, phase: 'sleep', part: 0, text: DEADCASE_MULTI },
  ];
  const inst = {
    transcript: { lines, markers },
    evenings: [
      { loopDay: 5, gameDay: 5, eveningOutcome: 'out-of-reach', inside: false, tile: 'forest_floor', cases: [] },
      { loopDay: 6, gameDay: 6, eveningOutcome: 'policy-no-record', inside: true, tile: 'haven', cases: [] },
    ],
    mornings: [],
  };
  const a = analyzeInstance(inst);
  if (a.summonsEvents.length !== 1) return false;
  const ev = a.summonsEvents[0];
  return ev.resolution.deadCase && ev.resolution.deadCase.name === 'Dante'
    && ev.resolution.deadCase.matchesAccused === false
    && ev.resolved === false && ev.stillOpen === true;
})());
check('follow-up: backstop on day +5 is inside the window, day +6 is not', (() => {
  const mk = (backstopDay) => {
    const markers = [
      { idx: 0, kind: 'sleep-start', loopDay: 5, part: 0, inside: true, mx: 4, my: 4, tile: 'haven' },
      { idx: 10, kind: 'sleep-end', loopDay: 5, part: 0, inside: true, mx: 4, my: 4, tile: 'haven' },
    ];
    const lines = [
      { idx: 1, loopDay: 5, phase: 'sleep', part: 0, text: LIVE3 },
      { idx: 2, loopDay: 5, phase: 'sleep', part: 0, text: CALL_TRIAL },
      { idx: 3, loopDay: 5, phase: 'sleep', part: 0, text: SUMMONS },
      { idx: 20, loopDay: backstopDay, phase: 'sleep', part: 0, text: BACKSTOP },
      { idx: 21, loopDay: backstopDay, phase: 'sleep', part: 0, text: VCOUNT },
    ];
    return {
      transcript: { lines, markers },
      evenings: [
        { loopDay: 5, gameDay: 5, eveningOutcome: 'policy-no-record', inside: true, tile: 'haven', cases: [] },
        { loopDay: 6, gameDay: 6, eveningOutcome: 'policy-no-record', inside: true, tile: 'haven', cases: [] },
        { loopDay: 7, gameDay: 7, eveningOutcome: 'policy-no-record', inside: true, tile: 'haven', cases: [] },
        { loopDay: 8, gameDay: 8, eveningOutcome: 'policy-no-record', inside: true, tile: 'haven', cases: [] },
        { loopDay: 9, gameDay: 9, eveningOutcome: 'policy-no-record', inside: true, tile: 'haven', cases: [] },
        { loopDay: 10, gameDay: 10, eveningOutcome: 'policy-no-record', inside: true, tile: 'haven', cases: [] },
        { loopDay: 11, gameDay: 11, eveningOutcome: 'policy-no-record', inside: true, tile: 'haven', cases: [] },
      ],
      mornings: [],
    };
  };
  const inWin = analyzeInstance(mk(10)).summonsEvents[0];
  const outWin = analyzeInstance(mk(11)).summonsEvents[0];
  return inWin.resolution.backstop && inWin.resolution.backstop.loopDay === 10
    && inWin.resolved === true && inWin.stillOpen === false
    && outWin.resolution.backstop === null && outWin.resolved === false
    && outWin.stillOpen === true;
})());
check('follow-up: two summonses with different accused sets flag overlap', (() => {
  const lines = [
    { idx: 1, loopDay: 5, phase: 'sleep', part: 0, text: LIVE3 },
    { idx: 2, loopDay: 5, phase: 'sleep', part: 0, text: LIVE_ACC1 },
    { idx: 3, loopDay: 5, phase: 'sleep', part: 0, text: SUMMONS },
    { idx: 4, loopDay: 7, phase: 'sleep', part: 0, text: LIVE3 },
    { idx: 5, loopDay: 7, phase: 'sleep', part: 0, text: 'TONIGHT: DANTE stands accused — CRIMES AGAINST THE VILLAGE! The gamblers are FRENZIED! Place your bets, place your bets!' },
    { idx: 6, loopDay: 7, phase: 'sleep', part: 0, text: SUMMONS },
  ];
  const inst = {
    transcript: { lines, markers: [] },
    evenings: [
      { loopDay: 5, gameDay: 5, eveningOutcome: 'policy-no-record', inside: true, tile: 'haven', cases: [] },
      { loopDay: 7, gameDay: 7, eveningOutcome: 'policy-no-record', inside: true, tile: 'haven', cases: [] },
    ],
    mornings: [],
  };
  const a = analyzeInstance(inst);
  return a.summonsEvents.length === 2
    && a.summonsEvents[0].overlap === true && a.summonsEvents[1].overlap === true
    && a.summonsEvents[0].accusedSet[0] === 'NIKOLAI'
    && a.summonsEvents[1].accusedSet[0] === 'DANTE';
})());
check('loop-day rates: stranded loop-day with a summons counts once, any phase', (() => {
  const lines = [
    { idx: 1, loopDay: 3, phase: 'harness', part: 0, text: LIVE3 },
    { idx: 2, loopDay: 3, phase: 'harness', part: 0, text: CALL_TRIAL },
    { idx: 3, loopDay: 3, phase: 'harness', part: 0, text: SUMMONS },
  ];
  const inst = {
    transcript: { lines, markers: [] },
    evenings: [
      { loopDay: 1, gameDay: 1, eveningOutcome: 'policy-no-record', inside: true, tile: 'haven', cases: [] },
      { loopDay: 2, gameDay: 2, eveningOutcome: 'out-of-reach', inside: false, tile: 'forest_floor', cases: [] },
      { loopDay: 3, gameDay: 3, eveningOutcome: 'out-of-reach', inside: false, tile: 'forest_floor', cases: [] },
      { loopDay: 4, gameDay: 4, eveningOutcome: 'policy-no-record', inside: true, tile: 'haven', cases: [] },
    ],
    mornings: [],
  };
  const a = analyzeInstance(inst);
  return a.loopDayRates.strandedLoopDays === 2
    && a.loopDayRates.strandedLoopDaysWithSummons === 1
    && a.loopDayRates.nonStrandedLoopDays === 2
    && a.loopDayRates.nonStrandedLoopDaysWithSummons === 0;
})());
check('stall: case resolving without trial stops counting on its resolution day', (() => {
  // Regression test for the stall-fix 2026-11-06: the first version
  // used the last evening as the end day for every never-convened
  // case, overstating a 2-day hold as 49 days (48040 case_2).
  const row = (status, resolution) => ({ id: 'c9', status, day: 10, mootIn: 3,
    accused: ['v_aria'], target: 'v_farid', playerRole: null,
    trial: false, trialDay: null, awaitingPlayerVote: null, resolution });
  const evenings = [];
  for (let ld = 10; ld <= 17; ld++) {
    const resolved = ld >= 13;
    evenings.push({ loopDay: ld, gameDay: ld, eveningOutcome: 'policy-no-record', inside: true,
      tile: 'haven', cases: [row(resolved ? 'resolved' : 'open', resolved ? 'accused_died' : null)] });
  }
  const inst = { transcript: { lines: [], markers: [] }, evenings, mornings: [] };
  const a = analyzeInstance(inst);
  const c9 = a.stall.cases.find((c) => c.id === 'c9');
  return c9 && c9.heldDays === 0 && c9.conveneLoopDay === null
    && a.stall.resolvedWithoutTrial.length === 1
    && a.stall.openAtEnd.length === 0;
})());
check('stall: held days + stranded days during hold + open-at-end', (() => {
  const caseRow = (trial) => ({ id: 'c1', status: 'open', day: 10, mootIn: 3,
    accused: ['v_nikolai'], target: 'v_dante', playerRole: null,
    trial, trialDay: trial ? 16 : null, awaitingPlayerVote: trial || null,
    resolution: null });
  const openRow = { id: 'c2', status: 'open', day: 12, mootIn: 3,
    accused: ['v_paul'], target: 'v_dante', playerRole: null,
    trial: false, trialDay: null, awaitingPlayerVote: null, resolution: null };
  const evenings = [];
  for (let ld = 10; ld <= 17; ld++) {
    const outcome = (ld === 13 || ld === 14) ? 'out-of-reach' : 'policy-no-record';
    const inside = (ld === 13 || ld === 14) ? false : true;
    evenings.push({ loopDay: ld, gameDay: ld, eveningOutcome: outcome, inside,
      tile: inside ? 'haven' : 'forest_floor',
      cases: [caseRow(ld >= 16), openRow] });
  }
  const inst = { transcript: { lines: [], markers: [] }, evenings, mornings: [] };
  const a = analyzeInstance(inst);
  const c1 = a.stall.cases.find((c) => c.id === 'c1');
  const c2 = a.stall.cases.find((c) => c.id === 'c2');
  return c1 && c1.heldDays === 3 && c1.strandedDaysDuringHold === 2
    && c1.conveneLoopDay === 16
    && a.stall.heldWhileAway.length === 1
    && a.stall.maxHeldWhileAway === 3 && a.stall.medianHeldWhileAway === 3
    && c2 && c2.openAtEnd === true && c2.heldDays === 2
    && c2.strandedDaysDuringHold === 0
    && a.stall.openAtEnd.length === 1;
})());

// ---- integration leg ----
(async () => {
  for (const g of ['COMPETENT_FEAST', 'SEATDRIVE', 'PLENTYDEPRI']) {
    if (process.env[g] !== '0') { console.log('SKIP integration: ' + g + '=0 required'); process.exit(fails ? 1 : 0); }
  }
  if (process.env.DEPOSITGATE !== '1' || process.env.POLICY !== 'nighttravel'
    || process.env.WOODCARRY !== '1' || process.env.WOODWARM !== '0' || process.env.BANKFOOD !== '1') {
    console.log('SKIP integration: substrate gates not set (see header)'); process.exit(fails ? 1 : 0);
  }
  process.env.STRANDNARR = '1';
  const on = await oneInstance(17021, { days: 60 });
  process.env.STRANDNARR = '0';
  const off = await oneInstance(17021, { days: 60 });
  const key = (inst) => JSON.stringify({
    evenings: inst.evenings.map((e) => [e.loopDay, e.eveningOutcome, e.tile, e.inside,
      e.bankfoodEvening ? [e.bankfoodEvening.mode, e.bankfoodEvening.skip, e.bankfoodEvening.kcalBefore] : null,
      e.bankfoodMorning ? [e.bankfoodMorning.kcalBefore, e.bankfoodMorning.kcalAfterEat] : null]),
    firstUpkeeps: (inst.bankfoodStore.firstUpkeeps || []).map((f) => [f.scholarDay, f.kcal]),
  });
  check('det-gate: ON vs OFF trajectories identical', key(on) === key(off));
  check('det-gate: transcript errs 0', on.transcript.errs === 0, 'errs=' + on.transcript.errs + ' ' + JSON.stringify(on.transcript.errors));
  const a = analyzeInstance(on);
  check('17021 re-pin (current substrate): 0 stranded nights',
    a.stranded.length === 0,
    'stranded=' + JSON.stringify(a.stranded.map((s) => s.loopDay)));
  check('17021 re-pin (current substrate): 60 days, survived',
    on.daysAlive === 60 && on.endReason === 'survived',
    'daysAlive=' + on.daysAlive + ' end=' + on.endReason);
  check('17021 re-pin (current substrate): 0 stranded sleep windows, 0 summons',
    a.strandedSleepWindows === 0 && a.strandedSleepTallies['summonsWindows'].windows === 0,
    'sleepWindows=' + a.strandedSleepWindows + ' summonsWindows=' + a.strandedSleepTallies['summonsWindows'].windows);
  check('17021: loop-day rates well-formed, 0 stranded loop-days',
    a.loopDayRates && a.loopDayRates.strandedLoopDays === 0
      && a.loopDayRates.strandedLoopDaysWithSummons === 0,
    JSON.stringify(a.loopDayRates));
  check('17021: summonsEvents well-formed with mootgate fields',
    Array.isArray(a.summonsEvents) && a.summonsEvents.every((ev) => ev.resolution
      && 'backstop' in ev.resolution && 'deadCase' in ev.resolution
      && 'verdictCount' in ev.resolution && 'voteCast' in ev.resolution
      && 'accusedSet' in ev && 'overlap' in ev && 'resolved' in ev
      && 'stillOpen' in ev && ev.eveningsAfter.length === 5),
    'events=' + a.summonsEvents.length);
  check('17021: stall measure well-formed',
    a.stall && Array.isArray(a.stall.cases) && 'maxHeldWhileAway' in a.stall
      && 'openAtEnd' in a.stall && 'resolvedWithoutTrial' in a.stall,
    'stallCases=' + (a.stall && a.stall.cases.length));

  process.env.STRANDNARR = '1';
  const s15003 = await oneInstance(15003, { days: 60 });
  const pair7 = sleepPair(s15003.transcript.markers, 7);
  let wordHit = null;
  if (pair7) {
    const wlines = sn.windowLines(s15003.transcript, pair7.start, pair7.end);
    const gw = gc.classifyGossipWindow(wlines, s15003.transcript.markers);
    wordHit = (gw.hits || []).find((h) => h.kind === 'word');
  }
  check('non-stranded anchor: 15003 loop-day-7 sleep window has a Word-gets-around line',
    !!wordHit, 'pair7=' + !!pair7);
  check('non-stranded anchor: that hit fires inside Haven',
    !!wordHit && wordHit.position && wordHit.position.inside === true,
    JSON.stringify(wordHit && wordHit.position));
  console.log('---');
  console.log('mootgate proof: ' + (checks - fails) + '/' + checks + ' checks pass');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error('PROOF CRASH', e && (e.stack || e)); process.exit(2); });
