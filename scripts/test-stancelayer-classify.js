#!/usr/bin/env node
// test-stancelayer-classify.js — unit proof for
// scripts/stancelayer-classify.js: every daily label + gate sub-label
// + decision order, on stub traces. No game load, no I/O.
'use strict';
const { classifyDay } = require('./stancelayer-classify');

let pass = 0, fail = 0;
function eq(name, got, want) {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) { pass++; }
  else { fail++; console.log('FAIL ' + name + ': got ' + g + ' want ' + w); }
}
function trace(day, phase, same, dist, coinc, stance) {
  return { day: day, phase: phase, same: same, dist: dist, detailCoincide: coinc, hstance: stance || null };
}
function call(day, preStance, preDist, preLost, postStance, postDist, postLost, postCoinc, delta, sleeping, tier, table, preCoinc) {
  return { day: day, sleeping: !!sleeping, havenTier: tier || null, tableActive: !!table,
    pre: { stance: preStance, dist: preDist, lost: preLost, coinc: !!preCoinc, tile: { x: 5, y: 4 } },
    post: { stance: postStance, dist: postDist, lost: postLost, coinc: postCoinc, watch: null },
    attemptDelta: delta || 0 };
}
function ctx(traces, arrivals, calls, attempts) {
  const g = function (rows) { const o = {}; for (const r of rows) (o[r.day] = o[r.day] || []).push(r); return o; };
  return { tracesByDay: g(traces), arrivalsByDay: g(arrivals), callsByDay: g(calls), attemptsByDay: g(attempts) };
}

// ATTEMPT / COINCIDED-AT-DAWN (first firing call started coincided)
eq('attempt-dawn', classifyDay(78, ctx(
  [trace(78, 'pre', true, 0, true, 'hungry'), trace(78, 'post', false, 1, false, 'hungry')],
  [], [call(78, 'hungry', 0, 0, 'hungry', 0, 0, true, 1, false, null, false, true)], [{ day: 78 }])).sub, 'COINCIDED-AT-DAWN');
// ATTEMPT / CLOSED-IN-DAY (first firing call closed the distance)
eq('attempt-closed', classifyDay(80, ctx(
  [trace(80, 'pre', true, 0, false, 'hungry'), trace(80, 'post', false, 1, false, 'hungry')],
  [], [call(80, 'hungry', 1, 0, 'hungry', 0, 0, true, 1, false, null, false, false)], [{ day: 80 }])).sub, 'CLOSED-IN-DAY');
// ATTEMPT / CLOSED-IN-DAY even when the pre trace coincided (the pre
// trace is post-wait state: a pre coincidence must not outrank the
// firing call's own pre state — the 97301 days 78/89 shape).
eq('attempt-closed-beats-precoinc', classifyDay(81, ctx(
  [trace(81, 'pre', true, 0, true, 'hungry')],
  [], [call(81, 'hungry', 1, 0, 'hungry', 0, 0, true, 1, false, null, false, false)], [{ day: 81 }])).sub, 'CLOSED-IN-DAY');
// ATTEMPT / ATTEMPT-UNRESOLVED (attempt row, no closing call row)
eq('attempt-unresolved', classifyDay(81, ctx(
  [trace(81, 'pre', true, 0, false, 'hungry')], [], [], [{ day: 81 }])).sub, 'ATTEMPT-UNRESOLVED');
// STEP / NO_TURN (arrival, zero shared calls)
eq('step-noturn', classifyDay(73, ctx(
  [trace(73, 'pre', false, 1, false, null), trace(73, 'post', false, 1, false, null)],
  [{ day: 73, stance: null, watch: null }], [], [])).sub, 'NO_TURN');
eq('step-noturn-label', classifyDay(73, ctx(
  [trace(73, 'pre', false, 1, false, null)],
  [{ day: 73, stance: null, watch: null }], [], [])).label, 'STEP_NO_ESCALATION');
// STEP / CURIOUS_FAR
eq('step-curious-far', classifyDay(74, ctx(
  [trace(74, 'pre', false, 1, false, null)],
  [{ day: 74, stance: 'curious', watch: 0 }],
  [call(74, 'curious', 5, 0, 'curious', 4, 0, false, 0)], [])).sub, 'CURIOUS_FAR');
// STEP / CURIOUS_WATCHING
eq('step-curious-watching', classifyDay(75, ctx(
  [trace(75, 'pre', false, 1, false, null)],
  [{ day: 75, stance: 'curious', watch: 1 }],
  [call(75, 'curious', 2, 0, 'curious', 2, 0, false, 0)], [])).sub, 'CURIOUS_WATCHING');
// STEP / HUNGRY_OPEN
eq('step-hungry-open', classifyDay(76, ctx(
  [trace(76, 'pre', false, 1, false, 'hungry')],
  [{ day: 76, stance: 'hungry', watch: 0 }],
  [call(76, 'hungry', 3, 0, 'hungry', 2, 0, false, 0)], [])).sub, 'HUNGRY_OPEN');
// STEP / BLIND (lostSight rose)
eq('step-blind', classifyDay(77, ctx(
  [trace(77, 'pre', false, 1, false, 'curious')],
  [{ day: 77, stance: 'curious', watch: 0 }],
  [call(77, 'curious', 4, 0, 'curious', 4, 1, false, 0)], [])).sub, 'BLIND');
// STEP / SLEEP_GUARD (sleeping at haven tile, tier>=2)
(function () {
  const c = call(78, 'hungry', 0, 0, 'hungry', 0, 0, true, 0, true, 2, false);
  c.pre.tile = { x: 4, y: 4 };
  eq('step-sleep-guard', classifyDay(78, ctx(
    [trace(78, 'pre', true, 0, true, 'hungry')],
    [{ day: 78, stance: 'hungry', watch: 0 }], [c], [])).sub, 'SLEEP_GUARD');
})();
// STEP / TABLE_GUARD
eq('step-table-guard', classifyDay(79, ctx(
  [trace(79, 'pre', true, 0, true, 'hungry')],
  [{ day: 79, stance: 'hungry', watch: 0 }],
  [call(79, 'hungry', 0, 0, 'hungry', 0, 0, true, 0, false, null, true)], [])).sub, 'TABLE_GUARD');
// STEP / GATE-UNRESOLVED (hungry + coincided, no attempt — contradiction)
eq('step-unresolved', classifyDay(82, ctx(
  [trace(82, 'pre', false, 1, false, 'hungry')],
  [{ day: 82, stance: 'hungry', watch: 0 }],
  [call(82, 'hungry', 1, 0, 'hungry', 0, 0, true, 0)], [])).sub, 'GATE-UNRESOLVED');
// SHARED_NO_ESCALATION (shared at pre, no arrival, no attempt)
eq('shared-label', classifyDay(74, ctx(
  [trace(74, 'pre', true, 0, false, 'curious')],
  [], [call(74, 'curious', 2, 0, 'curious', 2, 0, false, 0)], [])).label, 'SHARED_NO_ESCALATION');
// SCHOLAR_NEAR / APART / UNCLASSIFIED
eq('near', classifyDay(60, ctx([trace(60, 'pre', false, 2, false, null)], [], [], [])).label, 'SCHOLAR_NEAR');
eq('apart', classifyDay(61, ctx([trace(61, 'pre', false, 5, false, null)], [], [], [])).label, 'APART');
eq('unclassified', classifyDay(62, ctx([], [], [], [])).label, 'UNCLASSIFIED');
// ORDER: attempt beats step on the same day
eq('order-attempt-first', classifyDay(78, ctx(
  [trace(78, 'pre', true, 0, true, 'hungry')],
  [{ day: 78, stance: 'hungry', watch: 0 }],
  [call(78, 'hungry', 0, 0, 'hungry', 0, 0, true, 1)], [{ day: 78 }])).label, 'ATTEMPT');

console.log('stancelayer-classify: ' + pass + ' pass, ' + fail + ' fail');
process.exit(fail ? 1 : 0);
