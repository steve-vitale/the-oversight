#!/usr/bin/env node
// test-enddaybeats-a.js — proof for the endday-beats census
// instrument + the anchor reproduction (sim-enddaybeats-a).
//
// Unit leg (fast, always): family classifiers (raid call/line/
// aftermath, overhear, fragments, pantry deposit + plenty pools,
// pantry-triage exclusion, tale, witness) + window classification
// (raid collapse to one event, per-kind window tallies, position
// resolution) on fixtures.
// Integration leg (60 loop-days, bankfood variant leg, WOODWARM=0):
// runs the driver once with STRANDNARR=1 and once with
// STRANDNARR=0 on seed 17021 and asserts
//   (a) det-gate: bankfood evenings/mornings/first-upkeep kcal series
//       identical ON vs OFF (the recorder + position reads change no
//       trajectory);
//   (b) 17021 CURRENT-SUBSTRATE FACTS (re-pin, verify — see prereg):
//       the gossipfix anchor re-pin (coordinator evidence
//       evidence/2026-11-05/sim-adoption-round-1715.md) says 17021
//       is now 60d SURVIVED, not the gossipcensus pin of 57d
//       village-lost (drift verified from r140 master, not the fix).
//       If this master gives anything else, that is substrate drift
//       reported as a finding — a miss moves this proof to FAIL.
//   (c) non-stranded anchor: seed 15003 loop-day 7 sleep window
//       contains a 'Word gets around the haven' line, classified
//       non-stranded sleep with the scholar inside Haven at fire
//       time (the strandnarr-a §2 known hit, reproduced by
//       gossipcensus-a).
// Usage: node scripts/test-enddaybeats-a.js
// Env (the bankfood substrate gates, as in enddaybeats-trace-a.js):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY=nighttravel WOODCARRY=1 WOODWARM=0 BANKFOOD=1
'use strict';
const eb = require('./policies/enddaybeats-diag');
const { oneInstance, analyzeInstance } = require('./enddaybeats-trace-a');

let checks = 0, fails = 0;
function check(name, cond, detail) {
  checks++;
  if (cond) console.log('ok   ' + name);
  else { fails++; console.log('FAIL ' + name + ' :: ' + (detail || '')); }
}

// ---- unit leg ----
const RAID_CALL = '🚨 The Redactor, Night Court, Lockpick, Big Big, Loud-Eyes is at Haven\'s door. The village looks to you. Four ways to call: a RUNNER (slow, dangerous), a SIGNAL FIRE (fast, loud, everyone sees), the SYSTEM RELAY (if it can carry voices), or an ABILITY CRY (if your build has one). Each with honest costs.';
const RAID_LINE = '🐗 RAID — 5 raiders hit Haven in the night, drawn by the smell of the pantry! (Names: ...).';
const RAID_AFTER = '🕯️ The treeline is still torn up from the raid when the System\'s light comes for them. Nobody is ready. The light doesn\'t wait.';
const OVERHEAR = 'You overhear it at the fire, and stop pretending not to listen. Riders from Emberhold are telling the deer story again — with your name attached this time.';
const FRAGMENTS = 'You catch fragments by the fire — Dmitri telling Leonard about you. The story\'s getting bigger than what happened.';
const PANTRY_DEP = '🍽️ Catalina looks at the full shelves and waves off the day\'s share. "No more into the store — we eat at the fire, and the shelves keep."';
const PANTRY_DEP2 = '🍽️ Hassan taps the pantry door — full to bursting — and keeps the day\'s share in hand. "Dinner\'s on me tonight, then."';
const PANTRY_PLEN = '🍽️ Henriette eyes the groaning pantry shelves and packs light today. "No point hauling what\'ll rot. Mending the nets instead."';
const PANTRY_PLEN2 = '🍽️ Waluyo takes one look at the full shelves and unshoulders the pack. "Leave the wild standing. Hauling water for the cistern."';
const PANTRY_TRIAGE = '🍽️ Mara checks the pantry before heading out — ~9 days of fresh on hand, but someone has gone hungry three days running. The hungry eat first: keeps working the creek instead of turning to other work.';
const TALE = '🔥 The fire settles. Barbara has been quiet all evening, and now everyone knows why. "Loud-Eyes — I put it down today." A beat of silence, then the questions come all at once. Leonard mutters "And you\'re still standing." Someone at the edge of the light says what everyone\'s thinking: "So — what are we calling it?"';
const WITNESS = 'Barbara came back from the treeline white-faced. Saw it too. Whatever it is, it\'s still out there.';
check('raid: call line', eb.isRaidCallLine(RAID_CALL) && eb.kindOf(RAID_CALL) === 'raid-call');
check('raid: raid line', eb.isRaidLine(RAID_LINE) && eb.kindOf(RAID_LINE) === 'raid-line');
check('raid: aftermath line', eb.isRaidAftermathLine(RAID_AFTER) && eb.kindOf(RAID_AFTER) === 'raid-aftermath');
check('raid: plain narration is not raid', !eb.isRaidCallLine('Dawn. You wake stiff and cold.'));
check('overhear: overhear line', eb.isOverhearLine(OVERHEAR) && eb.kindOf(OVERHEAR) === 'overhear');
check('fragments: fragments line', eb.isFragmentsLine(FRAGMENTS) && eb.kindOf(FRAGMENTS) === 'fragments');
check('pantry: deposit pool 1', eb.pantryKind(PANTRY_DEP) === 'deposit' && eb.kindOf(PANTRY_DEP) === 'pantry-deposit');
check('pantry: deposit pool 2', eb.pantryKind(PANTRY_DEP2) === 'deposit');
check('pantry: plenty pool 1', eb.pantryKind(PANTRY_PLEN) === 'plenty' && eb.kindOf(PANTRY_PLEN) === 'pantry-plenty');
check('pantry: plenty pool 2', eb.pantryKind(PANTRY_PLEN2) === 'plenty');
check('pantry: triage line is NOT a day-voice line', eb.pantryKind(PANTRY_TRIAGE) === null && !eb.isPantryLine(PANTRY_TRIAGE));
check('pantry: bare emoji line is not pantry', eb.pantryKind('🍽️ You eat pemmican (400 kcal).') === null);
check('pantry: non-emoji full-shelves text is not pantry', eb.pantryKind('Catalina looks at the full shelves and waves off the day\'s share.') === null);
check('tale: tale prose', eb.isTaleLine(TALE) && eb.kindOf(TALE) === 'tale');
check('tale: fire-settles without the quiet-evening shape is not tale', !eb.isTaleLine('The fire settles. Night comes down like a lid.'));
check('witness: witness line', eb.isWitnessLine(WITNESS) && eb.kindOf(WITNESS) === 'witness');
check('kindOf: null', eb.kindOf('Dawn. You wake stiff and cold.') === null);
check('raid collapse: raid line + call in one window = 1 raid event', (() => {
  const markers = [{ idx: 0, kind: 'sleep-start', loopDay: 34, part: 0, inside: false, mx: 0, my: 8, tile: 'trail_edge' }];
  const lines = [
    { idx: 10, loopDay: 34, phase: 'sleep', part: 0, text: RAID_LINE },
    { idx: 11, loopDay: 34, phase: 'sleep', part: 0, text: RAID_CALL },
    { idx: 12, loopDay: 34, phase: 'sleep', part: 0, text: FRAGMENTS },
  ];
  const w = eb.classifyEnddayWindow(lines, markers);
  return w.raidEvent === 1 && w.perKind['raid-call'].windows === 1
    && w.perKind['raid-line'].windows === 1 && w.perKind['fragments'].windows === 1
    && w.hits.length === 3
    && w.hits[1].position && w.hits[1].position.inside === false
    && w.hits[1].position.tile === 'trail_edge';
})());
check('window tallies: two pantry lines in one window = 1 window, 2 lines', (() => {
  const lines = [
    { idx: 5, loopDay: 6, phase: 'sleep', part: 0, text: PANTRY_DEP },
    { idx: 6, loopDay: 6, phase: 'sleep', part: 0, text: PANTRY_DEP2 },
  ];
  const w = eb.classifyEnddayWindow(lines, []);
  return w.perKind['pantry-deposit'].windows === 1 && w.perKind['pantry-deposit'].lines === 2
    && w.perKind['pantry-plenty'].windows === 0;
})());
check('window tallies: tale + burst control in one window', (() => {
  const lines = [
    { idx: 5, loopDay: 6, phase: 'sleep', part: 0, text: TALE },
    { idx: 6, loopDay: 6, phase: 'sleep', part: 0, text: 'Word gets around the haven. Whatever that thing was — everyone\'s talking about it now.' },
    { idx: 7, loopDay: 6, phase: 'sleep', part: 0, text: 'Back at the haven the argument starts: Mara is calling it "Old Loud." They\'ll fight it out — weigh in if you want.' },
  ];
  const w = eb.classifyEnddayWindow(lines, []);
  return w.perKind['tale'].windows === 1 && w.burstEvents === 1 && w.burstLines === 2
    && w.settleLines === 0;
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
  check('17021 re-pin (current substrate): 0 stranded sleep windows, 0 burst events',
    a.strandedSleepWindows === 0 && a.strandedSleepTallies['burst-event'].windows === 0,
    'sleepWindows=' + a.strandedSleepWindows + ' burstWindows=' + a.strandedSleepTallies['burst-event'].windows);

  process.env.STRANDNARR = '1';
  const s15003 = await oneInstance(15003, { days: 60 });
  const a15003 = analyzeInstance(s15003);
  const hit7 = (a15003.nonStranded.sleepHits || []).find((h) => h.loopDay === 7 && h.kind === 'word');
  check('non-stranded anchor: 15003 loop-day-7 sleep window has a Word-gets-around line',
    !!hit7, 'sleepHits=' + JSON.stringify((a15003.nonStranded.sleepHits || []).map((h) => [h.loopDay, h.kind])));
  check('non-stranded anchor: that hit fires inside Haven',
    !!hit7 && hit7.position && hit7.position.inside === true,
    JSON.stringify(hit7 && hit7.position));
  console.log('---');
  console.log('enddaybeats proof: ' + (checks - fails) + '/' + checks + ' checks pass');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error('PROOF CRASH', e && (e.stack || e)); process.exit(2); });
