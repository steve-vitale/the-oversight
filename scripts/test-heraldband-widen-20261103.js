#!/usr/bin/env node
// test-heraldband-widen-20261103.js — proof for the widened herald
// screen (Loop A 20261103, run fleshout-20261103T0011Z, axis
// scale-onramp). Proves the yield / titan-class counting used on the
// 98201-98208 band, on FIXTURE rows shaped exactly like the landed
// fightoutcome recorder's per-seed JSON (scripts/
// fightoutcome-recorder-20261102.js via fightoutcome-driver-20261102.js).
// No game code, no re-simulation, no repo reads: fixtures only, so
// this proof is independent of whatever the judged sims produced.
// Classification priority (matches the widen evidence):
//   1. fight-positive: >= 1 titan TB fight row joined to a slain/fled
//      titan outcome record (same titan, same endDay, normalized ==
//      outcome). Class slain if any joined slain, else fled. Yield 1.
//   2. refused-only: no joined fight, >= 1 titan REFUSED attempt.
//      (Widen seed 98207 proves why refused outranks the call field:
//      23 refused attempts with callDay null and callHeard false —
//      refused attempts are positive herald contact even when no
//      CALL line was recorded. The call-day column still reports
//      the null honestly; the class follows the attempts.)
//   3. no-call: callDay null and no titan attempts at all.
//   4. still-pending-at-cap: call present, no fight, no outcome, last
//      dailyTrace entry still shows the herald present.
//   5. departed-silent-or-pending: call present, no fight, no outcome,
//      herald gone from the last dailyTrace entry.
//   6. Anything else with a call but no trace: call-no-trace (flag,
//      never silently folded into another class).
// A titan fight row with NO joined outcome, and a slain/fled record
// with NO fight row, are both non-yielding (the analyzer's leg-1c
// problems would catch them in the real corpus; here they must not
// inflate yield).
'use strict';
const assert = require('assert');

function joinedTitanFights(rec) {
  const slainFled = (rec.titanOutcomesEnd || []).filter(
    o => o.outcome === 'slain' || o.outcome === 'fled');
  return (rec.tbFights || []).filter(f => f.titan && slainFled.some(
    o => o.titan === f.mid && o.day === f.endDay && o.outcome === f.normalized));
}

function classify(rec) {
  const joined = joinedTitanFights(rec);
  if (joined.length) {
    return joined.some(f => f.normalized === 'slain') ? 'slain' : 'fled';
  }
  const refused = (rec.attempts || []).some(a => a.titan && a.cls === 'REFUSED');
  if (refused) return 'refused-only';
  if (rec.callDay == null) return 'no-call';
  const trace = rec.dailyTrace || [];
  if (!trace.length) return 'call-no-trace';
  return trace[trace.length - 1].heraldPresent
    ? 'still-pending-at-cap' : 'departed-silent-or-pending';
}

function yieldOf(recs) {
  return recs.filter(r => {
    const c = classify(r);
    return c === 'slain' || c === 'fled';
  }).length;
}

function wall(recs) {
  const survivals = recs.map(r => r.gameDays).sort((a, b) => a - b);
  const mid = survivals.length % 2
    ? survivals[(survivals.length - 1) / 2]
    : (survivals[survivals.length / 2 - 1] + survivals[survivals.length / 2]) / 2;
  return {
    national: recs.filter(r => r.national).length,
    won: recs.filter(r => r.won).length,
    wave4: recs.filter(r => r.maxWave >= 4).length,
    wave5: recs.filter(r => r.maxWave >= 5).length,
    medianSurvival: mid,
  };
}

function tbFight(day, mid, normalized) {
  return { fightSeq: 1, day, endDay: day, mid, titan: true,
    engineResult: normalized === 'fled' ? 'routed' : 'won', normalized };
}
function outcome(day, titan, outcome) {
  return { titan, day, outcome, detail: {}, endDay: day, result: 'routed' };
}
function rec(seed, over) {
  return Object.assign({ seed, callDay: null, attempts: [], tbFights: [],
    titanOutcomesEnd: [], dailyTrace: [], national: 0, won: 0,
    maxWave: 3, gameDays: 90 }, over);
}

let passed = 0;
function check(name, fn) { fn(); passed++; console.log('ok - ' + name); }

// 1. Fight-positive slain joins and yields.
check('slain join yields + class slain', () => {
  const r = rec(1, { callDay: 50, tbFights: [tbFight(52, 'herald', 'slain')],
    titanOutcomesEnd: [outcome(52, 'herald', 'slain')] });
  assert.strictEqual(classify(r), 'slain');
  assert.strictEqual(yieldOf([r]), 1);
});

// 2. Fight-positive fled (pilot 98102 shape) yields + class fled.
check('fled join yields + class fled', () => {
  const r = rec(2, { callDay: 66, tbFights: [tbFight(68, 'herald', 'fled')],
    titanOutcomesEnd: [outcome(68, 'herald', 'fled')],
    attempts: [{ titan: true, cls: 'FOUGHT', day: 68 },
      { titan: true, cls: 'REFUSED', day: 69 }] });
  assert.strictEqual(classify(r), 'fled'); // fight beats later refusals
  assert.strictEqual(yieldOf([r]), 1);
});

// 3. Refused-only: call, refused attempts, no fight, no outcome.
check('refused-only, no yield', () => {
  const r = rec(3, { callDay: 70,
    attempts: [{ titan: true, cls: 'REFUSED', day: 71 }],
    dailyTrace: [{ day: 70, heraldPresent: true }] });
  assert.strictEqual(classify(r), 'refused-only');
  assert.strictEqual(yieldOf([r]), 0);
});

// 4. Still-pending-at-cap (pilot 98107 shape).
check('still-pending-at-cap, no yield', () => {
  const r = rec(4, { callDay: 89,
    dailyTrace: [{ day: 89, heraldPresent: true },
      { day: 90, heraldPresent: true }] });
  assert.strictEqual(classify(r), 'still-pending-at-cap');
  assert.strictEqual(yieldOf([r]), 0);
});

// 5. Departed-silent-or-pending: herald gone from last trace, no record.
check('departed-silent-or-pending, no yield', () => {
  const r = rec(5, { callDay: 60,
    dailyTrace: [{ day: 60, heraldPresent: true },
      { day: 75, heraldPresent: false }] });
  assert.strictEqual(classify(r), 'departed-silent-or-pending');
  assert.strictEqual(yieldOf([r]), 0);
});

// 6. No-call (pilot 98101 shape).
check('no-call, no yield', () => {
  assert.strictEqual(classify(rec(6, {})), 'no-call');
  assert.strictEqual(yieldOf([rec(6, {})]), 0);
});

// 7. Orphan outcome (no fight row) must NOT yield.
check('orphan slain record does not yield', () => {
  const r = rec(7, { callDay: 50,
    titanOutcomesEnd: [outcome(52, 'herald', 'slain')] });
  assert.strictEqual(classify(r), 'call-no-trace');
  assert.strictEqual(yieldOf([r]), 0);
});

// 8. Unjoined titan fight (no outcome record) must NOT yield.
check('unjoined titan fight does not yield', () => {
  const r = rec(8, { callDay: 50, tbFights: [tbFight(52, 'herald', 'fled')],
    dailyTrace: [{ day: 52, heraldPresent: true }] });
  assert.strictEqual(classify(r), 'still-pending-at-cap');
  assert.strictEqual(yieldOf([r]), 0);
});

// 9. Join requires same day AND same normalized outcome.
check('wrong-day / wrong-outcome joins do not yield', () => {
  const wrongDay = rec(9, { callDay: 50, tbFights: [tbFight(52, 'herald', 'fled')],
    titanOutcomesEnd: [outcome(53, 'herald', 'fled')],
    dailyTrace: [{ day: 53, heraldPresent: true }] });
  const wrongOut = rec(10, { callDay: 50, tbFights: [tbFight(52, 'herald', 'fled')],
    titanOutcomesEnd: [outcome(52, 'herald', 'slain')],
    dailyTrace: [{ day: 52, heraldPresent: true }] });
  assert.strictEqual(yieldOf([wrongDay, wrongOut]), 0);
});

// 10. Yield per called vs per band, combined 16-seed context.
check('yield per called, per band, combined', () => {
  const band = [
    rec(11, {}), // no-call
    rec(12, { callDay: 66, tbFights: [tbFight(68, 'herald', 'fled')],
      titanOutcomesEnd: [outcome(68, 'herald', 'fled')] }), // fight+
    rec(13, { callDay: 70, attempts: [{ titan: true, cls: 'REFUSED', day: 71 }],
      dailyTrace: [{ day: 71, heraldPresent: true }] }), // refused-only
  ];
  const called = band.filter(r => r.callDay != null);
  assert.strictEqual(yieldOf(band), 1);
  assert.strictEqual(called.length, 2);
  assert.strictEqual(yieldOf(called), 1);
  // Pilot band yield 1 + this fixture band yield 1 = combined 2/16.
  assert.strictEqual(1 + yieldOf(band), 2);
});

// 11. Wall numbers: counts + median on an even band.
check('wall numbers + even median', () => {
  const band = [
    rec(21, { national: 1, won: 1, maxWave: 5, gameDays: 90 }),
    rec(22, { national: 0, won: 0, maxWave: 4, gameDays: 66 }),
    rec(23, { national: 0, won: 1, maxWave: 4, gameDays: 90 }),
    rec(24, { national: 0, won: 0, maxWave: 3, gameDays: 95 }),
  ];
  const w = wall(band);
  assert.deepStrictEqual(w, { national: 1, won: 2, wave4: 3, wave5: 1,
    medianSurvival: 90 });
});

// 12b. Refused attempts with NO recorded call (widen 98207 shape)
// still classify refused-only, not no-call.
check('refused-only without a recorded call line', () => {
  const r = rec(32, {
    attempts: [{ titan: true, cls: 'REFUSED', day: 77 },
      { titan: true, cls: 'REFUSED', day: 78 }],
    titanOutcomesEnd: [{ titan: 'herald', day: 77, outcome: 'refused',
      detail: { gate: 'muster', have: 0, need: 10 }, endDay: 77 }] });
  assert.strictEqual(r.callDay, null);
  assert.strictEqual(classify(r), 'refused-only');
  assert.strictEqual(yieldOf([r]), 0);
});

// 12. A seed counts once even with two joined titan fights.
check('one seed counts once for yield', () => {
  const r = rec(31, { callDay: 50,
    tbFights: [tbFight(52, 'herald', 'fled'),
      Object.assign(tbFight(60, 'herald', 'slain'), { fightSeq: 2 })],
    titanOutcomesEnd: [outcome(52, 'herald', 'fled'),
      outcome(60, 'herald', 'slain')] });
  assert.strictEqual(classify(r), 'slain');
  assert.strictEqual(yieldOf([r, r]), 2); // two seeds, not two fights
});

console.log('test-heraldband-widen-20261103: ' + passed + ' passed, 0 failed');
