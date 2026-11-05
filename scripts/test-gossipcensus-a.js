#!/usr/bin/env node
// test-gossipcensus-a.js — proof for the gossip-census instrument +
// the anchor reproduction (sim-gossipcensus-a).
//
// Unit leg (fast, always): burst classifiers (both templates, all
// rotLine variants, exclusions, settle line) + window classification
// (burst-collapse to one event, position resolution) on fixtures.
// Integration leg (60 loop-days, bankfood variant leg, WOODWARM=0):
// runs the driver once with STRANDNARR=1 and once with
// STRANDNARR=0 on seed 17021 and asserts
//   (a) det-gate: bankfood evenings/mornings/first-upkeep kcal series
//       identical ON vs OFF (the recorder + position reads change no
//       trajectory);
//   (b) stranded anchor — REVISED 2026-11-05 for SUBSTRATE DRIFT
//       (see evidence/2026-11-05/sim-gossipcensus-a.md "Substrate
//       drift"): the strandnarr-a 17021 anchor (thicket out-of-reach
//       strandings, loop-days 51-53) does NOT reproduce on current
//       master. Proven by rerunning the ORIGINAL strandnarr-trace-b.js
//       on this master (seed 17021): 0 stranded nights, daysAlive 57,
//       village-lost — identical to this driver's result, so the
//       driver is faithful and the substrate moved. First evening
//       divergence is loopDay 30 (old: walk-interrupted-combat at
//       (8,1); new: walk completed to haven (4,7)). Likely causes are
//       the post-2026-11-04 game.js travel/combat changes
//       (d29e663a9 triggerbuild-b PARTING TURN in travelTo;
//       1de41ff6f patient_aim round-start-HP fix) — the bankfood
//       gate widening (c51e0fc9d) cannot explain a pre-day-51
//       divergence (the old run had no stranded evenings before 51)
//       and banksnap-a (99ea43530) is recorder-only by its own
//       comment. The proof therefore pins the CURRENT-substrate
//       17021 facts (57 days, village-lost, 0 stranded) as a
//       regression pin, and the census's stranded windows are
//       established by the pilot+screen itself, not by this anchor.
//       The non-stranded 15003 anchor below DID reproduce.
//   (c) non-stranded anchor: seed 15003 loop-day 7 sleep window
//       contains a 'Word gets around the haven' line, classified
//       non-stranded sleep with the scholar inside Haven at fire
//       time (the strandnarr-a §2 known hit).
// Usage: node scripts/test-gossipcensus-a.js
// Env (the bankfood substrate gates, as in gossipcensus-trace-a.js):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY=nighttravel WOODCARRY=1 WOODWARM=0 BANKFOOD=1
'use strict';
const gc = require('./policies/gossipcensus-diag');
const { oneInstance, analyzeInstance } = require('./gossipcensus-trace-a');

let checks = 0, fails = 0;
function check(name, cond, detail) {
  checks++;
  if (cond) console.log('ok   ' + name);
  else { fails++; console.log('FAIL ' + name + ' :: ' + (detail || '')); }
}

// ---- unit leg ----
const WORD1 = 'Word gets around the haven. Whatever that thing was — everyone\'s talking about it now.';
const WORD2 = 'Word gets around the haven. Whatever that thing was — the haven\'s talking about nothing else.';
const WORD3 = 'Word gets around the haven. Whatever that thing was — every fire has a theory tonight.';
const DEBATE1 = 'Back at the haven the argument starts: Mara is calling it "Old Loud." They\'ll fight it out — weigh in if you want.';
const DEBATE2 = 'Back at the haven the argument starts: Mara is calling it "Old Loud." Nobody agrees yet — weigh in if you want.';
const DEBATE3 = 'Back at the haven the argument starts: Mara is calling it "Old Loud." The name\'s up for grabs — weigh in if you want.';
check('word regex: variant 1', gc.isGossipWordLine(WORD1));
check('word regex: variant 2', gc.isGossipWordLine(WORD2));
check('word regex: variant 3', gc.isGossipWordLine(WORD3));
check('debate regex: variant 1', gc.isDebateLine(DEBATE1));
check('debate regex: variant 2', gc.isDebateLine(DEBATE2));
check('debate regex: variant 3', gc.isDebateLine(DEBATE3));
check('burst: word is burst', gc.isGossipBurstLine(WORD1));
check('burst: debate is burst', gc.isGossipBurstLine(DEBATE1));
check('exclusion: teachGossip bare phrase', !gc.isGossipBurstLine('Mara showed June the snare — "remember it." Word gets around.'));
check('exclusion: back-name line', !gc.isGossipBurstLine('You back "Old Loud." Word gets around.'));
check('exclusion: haven-feeds line', !gc.isGossipBurstLine('(Word gets around: Haven feeds travelers. Village trust +8.)'));
check('exclusion: village variant', !gc.isGossipBurstLine('Word gets around Emberhold: you sat with their book and treated it like it mattered. They noticed.'));
check('exclusion: fire variant', !gc.isGossipBurstLine('Word gets around the fire: you pushed Mara hard, and Mara pushed back. People file that away.'));
check('exclusion: plain narration', !gc.isGossipBurstLine('You settle into the cold ground. Sleep takes you.'));
check('settle: settle line', gc.isSettleLine('It\'s settled. The village is calling it "Old Loud." The Codex keeps it.'));
check('settle: not a burst line', !gc.isGossipBurstLine('It\'s settled. The village is calling it "Old Loud." The Codex keeps it.'));
check('kindOf: word', gc.kindOf(WORD2) === 'word');
check('kindOf: debate', gc.kindOf(DEBATE3) === 'debate');
check('kindOf: settle', gc.kindOf('It\'s settled. The village is calling it "X."') === 'settle');
check('kindOf: null', gc.kindOf('Dawn. You wake stiff and cold.') === null);
check('burst collapse: word+debate adjacent = 1 event', (() => {
  const markers = [{ idx: 0, kind: 'sleep-start', loopDay: 7, part: 0, inside: true, mx: 4, my: 4, tile: 'haven' }];
  const lines = [
    { idx: 10, loopDay: 7, phase: 'sleep', part: 0, text: WORD1 },
    { idx: 11, loopDay: 7, phase: 'sleep', part: 0, text: DEBATE1 },
  ];
  const w = gc.classifyGossipWindow(lines, markers);
  return w.events === 1 && w.burstLines === 2 && w.hits.length === 2
    && w.hits[0].position && w.hits[0].position.inside === true
    && w.hits[0].position.mx === 4 && w.hits[0].position.tile === 'haven';
})());
check('burst collapse: lone word = 1 event', (() => {
  const w = gc.classifyGossipWindow(
    [{ idx: 5, loopDay: 3, phase: 'upkeep', part: 1, text: WORD3 }], []);
  return w.events === 1 && w.burstLines === 1;
})());
check('burst collapse: two separate bursts = 2 events', (() => {
  const lines = [
    { idx: 5, loopDay: 3, phase: 'daily', part: 0, text: WORD1 },
    { idx: 6, loopDay: 3, phase: 'daily', part: 0, text: DEBATE1 },
    { idx: 40, loopDay: 5, phase: 'daily', part: 0, text: WORD2 },
    { idx: 41, loopDay: 5, phase: 'daily', part: 0, text: DEBATE2 },
  ];
  const w = gc.classifyGossipWindow(lines, []);
  return w.events === 2 && w.burstLines === 4;
})());
check('positionAt: nearest preceding marker', (() => {
  const markers = [
    { idx: 0, kind: 'daily-start', loopDay: 7, part: 0, inside: true, mx: 4, my: 4, tile: 'haven' },
    { idx: 100, kind: 'sleep-start', loopDay: 7, part: 0, inside: false, mx: 9, my: 2, tile: 'thicket' },
  ];
  const p1 = gc.positionAt(markers, 50);
  const p2 = gc.positionAt(markers, 150);
  return p1 && p1.inside === true && p1.tile === 'haven'
    && p2 && p2.inside === false && p2.mx === 9 && p2.tile === 'thicket';
})());
check('positionAt: no preceding marker = null', gc.positionAt(
  [{ idx: 10, kind: 'sleep-start', loopDay: 1, part: 0 }], 5) === null);

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
  check('stranded anchor (current substrate): 17021 has 0 stranded nights',
    a.stranded.length === 0,
    'stranded=' + JSON.stringify(a.stranded.map((s) => s.loopDay)));
  check('stranded anchor (current substrate): 17021 runs 57 days, village-lost',
    on.daysAlive === 57 && on.endReason === 'village-lost',
    'daysAlive=' + on.daysAlive + ' end=' + on.endReason);
  check('stranded anchor (current substrate): 0 stranded sleep windows, 0 bursts',
    a.strandedSleepWindows === 0 && a.strandedEvents === 0,
    'sleepWindows=' + a.strandedSleepWindows + ' events=' + a.strandedEvents);

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
  console.log('gossipcensus proof: ' + (checks - fails) + '/' + checks + ' checks pass');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error('PROOF CRASH', e && (e.stack || e)); process.exit(2); });
