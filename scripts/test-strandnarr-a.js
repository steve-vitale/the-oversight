#!/usr/bin/env node
// test-strandnarr-a.js — proof for the strandnarr instrument + the
// anchor adjudication (sim-strandnarr-a).
//
// Unit leg (fast, always): classifier regexes + window slicing on
// fixtures.
// Integration leg (seed 17021, 60 loop-days, bankfood variant leg,
// WOODWARM=0 — the leg that reproduces the anchor): runs the driver
// once with STRANDNARR=1 and once with STRANDNARR=0 and asserts
//   (a) det-gate: bankfood evenings/mornings/first-upkeep kcal series
//       identical ON vs OFF (the recorder changes no trajectory);
//   (b) anchor: evenings 51-53 are thicket out-of-reach flip/0-action/
//       no-gather-target strandings, each with bedding-down lines in
//       its sleep window;
//   (c) anchor breakfast: morning loop-day 53 has first-upkeep kcal
//       128, daily-entry kcalBefore 2310, and its upkeep window
//       contains "You eat Muscadine Grapes (270 kcal)".
// Usage: node scripts/test-strandnarr-a.js
// Env (the bankfood substrate gates, as in strandnarr-trace-b.js):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY=nighttravel WOODCARRY=1 WOODWARM=0 BANKFOOD=1
'use strict';
const sn = require('./policies/strandnarr-diag');
const { oneInstance, analyzeInstance, sleepPair } = require('./strandnarr-trace-b');

let checks = 0, fails = 0;
function check(name, cond, detail) {
  checks++;
  if (cond) console.log('ok   ' + name);
  else { fails++; console.log('FAIL ' + name + ' :: ' + (detail || '')); }
}

// ---- unit leg ----
check('bedding regex: settle', sn.isBeddingLine('You settle into the cold ground. Sleep takes you.'));
check('bedding regex: rough', sn.isBeddingLine('Sleeping rough means the cold ground — heal ~16.'));
check('bedding regex: negative', !sn.isBeddingLine('Dawn. You wake stiff and cold.'));
check('night-out regex', sn.isNightOutLine('Dawn. You wake stiff and cold. (...) You spent the night out here, away from Haven — and you\'re still out here at dawn.'));
check('meal beat parse', (() => { const b = sn.mealBeat('You eat Muscadine Grapes (270 kcal).'); return b && b.what === 'Muscadine Grapes' && b.kcal === 270; })());
check('meal beat: bank suffix', (() => { const b = sn.mealBeat('You eat Blackberry (52 kcal). Past full — the bank takes it.'); return b && b.kcal === 52; })());
check('meal beat: negative', sn.mealBeat('Nothing to eat. The pantry of your pack is empty.') === null);
check('window slice bounds', (() => {
  const store = { lines: [{ idx: 0, text: 'a' }, { idx: 1, text: 'b' }, { idx: 2, text: 'c' }] };
  const w = sn.windowLines(store, { idx: 1 }, { idx: 3 });
  return w.length === 2 && w[0].text === 'b' && w[1].text === 'c';
})());
check('sleep window classify', (() => {
  const w = sn.classifySleepWindow([{ text: 'You settle into the cold ground. Sleep takes you.' }, { text: 'Dawn. You wake rested. You spent the night out here, away from Haven.' }]);
  return w.bedding.length === 1 && w.nightOut.length === 1 && w.refused.length === 0;
})());
check('upkeep window classify', (() => {
  const w = sn.classifyUpkeepWindow([{ text: 'You eat Muscadine Grapes (270 kcal).', part: 1 }, { text: 'The pantry is in the hall. Your hands are not.', part: 2 }]);
  return w.mealKcal === 270 && w.pantryHall.length === 1;
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
  for (const ld of [51, 52, 53]) {
    const s = a.stranded.find((x) => x.loopDay === ld);
    check('anchor evening ' + ld + ' thicket out-of-reach flip/0/no-gather-target',
      !!s && s.tile === 'thicket' && s.outcome === 'out-of-reach'
      && s.evening && s.evening.mode === 'flip' && s.evening.skip === 'no-gather-target'
      && (s.evening.actions || []).length === 0,
      JSON.stringify(s && { tile: s.tile, outcome: s.outcome, evening: s.evening }));
    check('anchor evening ' + ld + ' bedding-down lines in sleep window',
      !!s && s.sleptThrough === true && s.sleepWindow && s.sleepWindow.bedding.length >= 1,
      JSON.stringify(s && s.sleepWindow));
  }
  const m53 = a.mornings.find((x) => x.loopDay === 52 + 1);
  check('anchor morning 53 first-upkeep 128 -> daily 2310',
    !!m53 && m53.firstUpkeepKcal === 128 && m53.dailyKcalBefore === 2310,
    JSON.stringify(m53 && { fu: m53.firstUpkeepKcal, daily: m53.dailyKcalBefore }));
  check('anchor morning 53 upkeep window has Muscadine 270 beat',
    !!m53 && m53.meals.some((x) => x.what === 'Muscadine Grapes' && x.kcal === 270),
    JSON.stringify(m53 && m53.meals.filter((x) => x.what === 'Muscadine Grapes')));
  console.log('---');
  console.log('strandnarr proof: ' + (checks - fails) + '/' + checks + ' checks pass');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error('PROOF CRASH', e && (e.stack || e)); process.exit(2); });
