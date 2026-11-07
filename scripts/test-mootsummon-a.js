#!/usr/bin/env node
// test-mootsummon-a.js — proof for the moot-summons census
// instrument + the anchor reproduction (sim-mootsummon-a).
//
// Unit leg (fast, always): moot classifiers (summons, LIVE,
// trial/petition call lines, backstop, exiled, verdict-count,
// verdict, vote-cast, vote-lands, return) + kind classification
// (trial vs petition vs unknown) + window classification (summons
// windows, firing-time rule via post-return) + per-summons
// follow-up tracking on a synthetic instance.
// Integration leg (60 loop-days, bankfood variant leg, WOODWARM=0):
// runs the driver once with STRANDNARR=1 and once with
// STRANDNARR=0 on seed 17021 and asserts
//   (a) det-gate: bankfood evenings/mornings/first-upkeep kcal series
//       identical ON vs OFF (the recorder + position reads change no
//       trajectory);
//   (b) 17021 CURRENT-SUBSTRATE FACTS (re-pin, verify — see prereg):
//       the enddaybeats-a re-pin says 17021 is 60d SURVIVED, 0
//       stranded nights. If this master gives anything else, that
//       is substrate drift reported as a finding — a miss moves
//       this proof to FAIL.
//   (c) non-stranded anchor: seed 15003 loop-day 16 sleep window
//       contains a 'Word gets around the haven' line, classified
//       non-stranded sleep with the scholar inside Haven at fire
//       time (the strandnarr-a §2 known hit, re-pinned 2026-11-07:
//       the ld7 day went stale on current master — the ld16 window
//       holds TWO word lines, both inside Haven, verified live by
//       scripts/probe-gossip-anchor-a.js on base 6a59ed7f; the
//       0715Z "no re-pin available on 15003" read the trimmed
//       corpus, which discards non-stranded sleep-window gossip
//       lines by design — see evidence/2026-11-07/sim-mootsummon-a.md).
// Usage: node scripts/test-mootsummon-a.js
// Env (the bankfood substrate gates, as in mootsummon-trace-a.js):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY=nighttravel WOODCARRY=1 WOODWARM=0 BANKFOOD=1
'use strict';
const mm = require('./policies/mootsummon-diag');
const sn = require('./policies/strandnarr-diag');
const gc = require('./policies/gossipcensus-diag');
const { oneInstance, analyzeInstance, sleepPair } = require('./mootsummon-trace-a');

let checks = 0, fails = 0;
function check(name, cond, detail) {
  checks++;
  if (cond) console.log('ok   ' + name);
  else { fails++; console.log('FAIL ' + name + ' :: ' + (detail || '')); }
}

// ---- unit leg ----
const SUMMONS = 'The moot turns to you. Your vote matters here — and everyone will remember it.';
const LIVE = '🔴 LIVE! THE MOOT! The fire\'s built HIGH and the whole GALAXY is watching!';
const CALL_TRIAL = 'Giuseppe calls the moot. The fire gets built up — word travels fast, and almost everyone comes.';
const CALL_TRIAL_YOU = 'You call a moot. The fire gets built up. Word travels fast — almost everyone comes, even the ones who\'d rather not.';
const CALL_PETITION = 'You call a moot on it. The fire gets built up. The petitioners sit just outside the light, trying not to look like they\'re listening.';
const TALKING = 'Lorenzo has been talking at the fires. Enough voices — tonight they call a moot.';
const BACKSTOP = 'The moot doesn\'t wait forever. Two days of silence from the fire\'s edge — the count is taken without you.';
const EXILED = 'The moot doesn\'t wait for the exiled. The count is taken without you.';
const VCOUNT = 'Marta counts on their fingers, twice, like they don\'t trust the first number. Then, to the fire: "4 for guilty. 9 against."';
const VGUILTY = 'A pause long enough to live in. Someone\'s breath catches. Then: "Guilty." Nobody looks at anybody.';
const VACQUIT = 'A long exhale moves around the fire like weather. "Not guilty — this time."';
const VCAST = 'Counted.';
const VLANDS = 'Your "guilty" lands in the count, out loud, in front of everyone. The accused hear exactly who said it.';
const RETURN = 'You walk back into Haven. 14 Codex entries. The village is glad to see you.';
check('summons: summons line', mm.isSummonsLine(SUMMONS) && mm.kindOf(SUMMONS) === 'summons');
check('summons: plain narration is not summons', !mm.isSummonsLine('Dawn. You wake stiff and cold.'));
check('summons: vote-matters without the moot-turns shape is not summons', !mm.isSummonsLine('Your vote matters here — and everyone will remember it.'));
check('live: LIVE line', mm.isMootLiveLine(LIVE) && mm.kindOf(LIVE) === 'moot-live');
check('call: trial call (NPC)', mm.isMootCallTrialLine(CALL_TRIAL) && mm.kindOf(CALL_TRIAL) === 'moot-call-trial');
check('call: trial call (you)', mm.isMootCallTrialLine(CALL_TRIAL_YOU) && mm.kindOf(CALL_TRIAL_YOU) === 'moot-call-trial');
check('call: petition call', mm.isMootCallPetitionLine(CALL_PETITION) && mm.kindOf(CALL_PETITION) === 'moot-call-petition' && !mm.isMootCallTrialLine(CALL_PETITION));
check('call: "talking at the fires" is NOT a call line', !mm.isMootCallLine(TALKING) && mm.kindOf(TALKING) === null);
check('backstop: backstop line', mm.isBackstopLine(BACKSTOP) && mm.kindOf(BACKSTOP) === 'backstop');
check('exiled: exiled line', mm.isExiledLine(EXILED) && mm.kindOf(EXILED) === 'exiled' && !mm.isBackstopLine(EXILED));
check('verdict: count line', mm.isVerdictCountLine(VCOUNT) && mm.kindOf(VCOUNT) === 'verdict-count');
check('verdict: guilty line', mm.isVerdictLine(VGUILTY) && mm.kindOf(VGUILTY) === 'verdict');
check('verdict: acquit line', mm.isVerdictLine(VACQUIT) && mm.kindOf(VACQUIT) === 'verdict');
check('vote: cast line', mm.isVoteCastLine(VCAST) && mm.kindOf(VCAST) === 'vote-cast');
check('vote: lands line', mm.isVoteLandsLine(VLANDS) && mm.kindOf(VLANDS) === 'vote-lands');
check('return: return line', mm.isReturnLine(RETURN) && mm.kindOf(RETURN) === 'return');
check('kindOf: null', mm.kindOf('Dawn. You wake stiff and cold.') === null);

check('summonsKind: LIVE + trial call before summons = trial', (() => {
  const lines = [
    { idx: 10, text: LIVE },
    { idx: 11, text: CALL_TRIAL },
    { idx: 12, text: SUMMONS },
  ];
  return mm.summonsKind(lines, 12) === 'trial';
})());
check('summonsKind: petition call before summons = petition', (() => {
  const lines = [
    { idx: 10, text: CALL_PETITION },
    { idx: 11, text: SUMMONS },
  ];
  return mm.summonsKind(lines, 11) === 'petition';
})());
check('summonsKind: no context lines = unknown', (() => {
  const lines = [{ idx: 10, text: SUMMONS }];
  return mm.summonsKind(lines, 10) === 'unknown';
})());
check('window: summons in a stranded window, trial kind, not post-return', (() => {
  const markers = [{ idx: 0, kind: 'sleep-start', loopDay: 12, part: 0, inside: false, mx: 0, my: 8, tile: 'forest_floor' }];
  const lines = [
    { idx: 1, loopDay: 12, phase: 'sleep', part: 0, text: LIVE },
    { idx: 2, loopDay: 12, phase: 'sleep', part: 0, text: CALL_TRIAL },
    { idx: 3, loopDay: 12, phase: 'sleep', part: 0, text: SUMMONS },
  ];
  const w = mm.classifyMootWindow(lines, markers);
  return w.summonsWindows === 1 && w.summonsAtFiring === 1
    && w.summonsHits.length === 1 && w.summonsHits[0].mootKind === 'trial'
    && w.summonsHits[0].postReturn === false
    && w.summonsHits[0].position && w.summonsHits[0].position.inside === false
    && w.perKind['summons'].windows === 1 && w.perKind['moot-live'].windows === 1;
})());
check('window: summons AFTER a mid-window return is post-return, not at-firing', (() => {
  const markers = [{ idx: 0, kind: 'sleep-start', loopDay: 8, part: 0, inside: false, mx: 7, my: 0, tile: 'wetland' }];
  const lines = [
    { idx: 1, loopDay: 8, phase: 'sleep', part: 0, text: RETURN },
    { idx: 2, loopDay: 8, phase: 'sleep', part: 0, text: LIVE },
    { idx: 3, loopDay: 8, phase: 'sleep', part: 0, text: CALL_TRIAL },
    { idx: 4, loopDay: 8, phase: 'sleep', part: 0, text: SUMMONS },
  ];
  const w = mm.classifyMootWindow(lines, markers);
  return w.summonsWindows === 1 && w.summonsAtFiring === 0
    && w.summonsHits.length === 1 && w.summonsHits[0].postReturn === true
    && w.perKind['summons'].windows === 1;
})());
check('window: two summons in one window = 1 window, 2 lines', (() => {
  const lines = [
    { idx: 5, loopDay: 6, phase: 'sleep', part: 0, text: SUMMONS },
    { idx: 6, loopDay: 6, phase: 'sleep', part: 0, text: SUMMONS },
  ];
  const w = mm.classifyMootWindow(lines, []);
  return w.perKind['summons'].windows === 1 && w.perKind['summons'].lines === 2
    && w.summonsWindows === 1;
})());
check('follow-up: synthetic stranded summons resolves via backstop + verdict', (() => {
  // Minimal instance: one stranded evening (loop-day 5), a trial
  // summons in its sleep window, backstop + verdict-count on
  // loop-day 7, scholar back inside Haven on the loop-day-6 evening.
  const markers = [
    { idx: 0, kind: 'sleep-start', loopDay: 5, part: 0, inside: false, mx: 0, my: 8, tile: 'forest_floor' },
    { idx: 10, kind: 'sleep-end', loopDay: 5, part: 0, inside: false, mx: 0, my: 8, tile: 'forest_floor' },
  ];
  const lines = [
    { idx: 1, loopDay: 5, phase: 'sleep', part: 0, text: LIVE },
    { idx: 2, loopDay: 5, phase: 'sleep', part: 0, text: CALL_TRIAL },
    { idx: 3, loopDay: 5, phase: 'sleep', part: 0, text: SUMMONS },
    { idx: 20, loopDay: 7, phase: 'sleep', part: 0, text: BACKSTOP },
    { idx: 21, loopDay: 7, phase: 'sleep', part: 0, text: VCOUNT },
    { idx: 22, loopDay: 7, phase: 'sleep', part: 0, text: VGUILTY },
  ];
  const inst = {
    transcript: { lines, markers },
    evenings: [
      { loopDay: 5, eveningOutcome: 'out-of-reach', inside: false, tile: 'forest_floor' },
      { loopDay: 6, eveningOutcome: 'policy-no-record', inside: true, tile: 'haven' },
      { loopDay: 7, eveningOutcome: 'policy-no-record', inside: true, tile: 'haven' },
    ],
    mornings: [],
  };
  const a = analyzeInstance(inst);
  if (a.strandedSleepWindows !== 1) return false;
  if (a.strandedSleepTallies['summonsWindows'].windows !== 1) return false;
  if (a.summonsEvents.length !== 1) return false;
  const ev = a.summonsEvents[0];
  return ev.stranded === true && ev.mootKind === 'trial'
    && ev.resolution.backstop && ev.resolution.backstop.loopDay === 7
    && ev.resolution.verdictCount && ev.resolution.verdictCount.loopDay === 7
    && ev.resolution.verdict && ev.resolution.voteCast === null
    && ev.returnedWithin2 === true
    && ev.eveningsAfter.length === 3 && ev.eveningsAfter[0].inside === true;
})());
check('follow-up: petition summons kind resolves from its own call line', (() => {
  const markers = [
    { idx: 0, kind: 'sleep-start', loopDay: 9, part: 0, inside: true, mx: 4, my: 4, tile: 'haven' },
    { idx: 10, kind: 'sleep-end', loopDay: 9, part: 0, inside: true, mx: 4, my: 4, tile: 'haven' },
  ];
  const lines = [
    { idx: 1, loopDay: 9, phase: 'sleep', part: 0, text: CALL_PETITION },
    { idx: 2, loopDay: 9, phase: 'sleep', part: 0, text: SUMMONS },
  ];
  const inst = {
    transcript: { lines, markers },
    evenings: [{ loopDay: 9, eveningOutcome: 'policy-no-record', inside: true, tile: 'haven' }],
    mornings: [],
  };
  const a = analyzeInstance(inst);
  return a.summonsEvents.length === 1 && a.summonsEvents[0].mootKind === 'petition'
    && a.summonsEvents[0].stranded === false
    && a.summonsEvents[0].resolution.backstop === null;
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
  check('17021: summonsEvents well-formed',
    Array.isArray(a.summonsEvents) && a.summonsEvents.every((ev) => ev.resolution
      && 'backstop' in ev.resolution && 'verdictCount' in ev.resolution
      && 'voteCast' in ev.resolution && ev.eveningsAfter.length === 3),
    'events=' + a.summonsEvents.length);

  process.env.STRANDNARR = '1';
  const s15003 = await oneInstance(15003, { days: 60 });
  const pair16 = sleepPair(s15003.transcript.markers, 16);
  let wordHit = null;
  if (pair16) {
    const wlines = sn.windowLines(s15003.transcript, pair16.start, pair16.end);
    const gw = gc.classifyGossipWindow(wlines, s15003.transcript.markers);
    wordHit = (gw.hits || []).find((h) => h.kind === 'word');
  }
  check('non-stranded anchor: 15003 loop-day-16 sleep window has a Word-gets-around line',
    !!wordHit, 'pair16=' + !!pair16);
  check('non-stranded anchor: that hit fires inside Haven',
    !!wordHit && wordHit.position && wordHit.position.inside === true,
    JSON.stringify(wordHit && wordHit.position));
  console.log('---');
  console.log('mootsummon proof: ' + (checks - fails) + '/' + checks + ' checks pass');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error('PROOF CRASH', e && (e.stack || e)); process.exit(2); });
