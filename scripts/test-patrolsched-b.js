#!/usr/bin/env node
// test-patrolsched-b.js — pure proof for sim-patrolsched-b (no Game load).
// Proves: (1) the deed-weekly patrol day set is exactly day%7==1,
// (2) weeklyPatrol fires only on that set, honors the kcal gate and
// the once-per-day guard, and visits farthest-first up to 4 targets,
// (3) the awayeve end-cause / return-story classifiers (reused
// verbatim) classify a deed-weekly away evening as no-return-step
// and a next-day haven evening as walked-home-next-day.
// Usage: node scripts/test-patrolsched-b.js
'use strict';
const assert = require('assert');
const { deedWeekly, weeklyPatrol, isPatrolDay, PATROL_DAYS } = require('./policies/deed-weekly');
const { deedSeeking } = require('./policies/deed-seeking');
const { endCauseOf, returnStoryOf } = require('./analyze-awayeve-b');

// (1) Day set: exactly [1]; deed-seeking's [1,3,5] is the contrast.
assert.deepStrictEqual(PATROL_DAYS, [1]);
for (const d of [1, 8, 15, 22, 29]) assert.strictEqual(isPatrolDay(d), true, 'day ' + d);
for (const d of [2, 3, 4, 5, 6, 7, 10, 12, 17]) assert.strictEqual(isPatrolDay(d), false, 'day ' + d);
assert.strictEqual(deedWeekly.id, 'deed-weekly');
assert.strictEqual(typeof deedWeekly.daily, 'function');
assert.strictEqual(deedSeeking.id, 'deed-seeking');

// (2) weeklyPatrol on a stub Game (no full harness, no RNG).
function stubGame(day, kcal) {
  const travels = [], forages = [];
  return {
    travels, forages,
    over: false, tbfight: false,
    state: { scholar: { day, kcal } },
    kcalCap: () => 2000,
    travelTargets: () => [{ x: 5, y: 3, d: 9 }, { x: 1, y: 1, d: 2 }, { x: 9, y: 9, d: 12 }],
    tileAt: () => ({ type: 'forest_floor' }),
    travelTo(x, y) { travels.push([x, y]); },
    doAction(a) { forages.push(a); },
  };
}
{ // patrol day: fires, farthest-first, forage each, ctx.patrols = 1
  const g = stubGame(8, 1500); const ctx = {};
  weeklyPatrol(g, ctx);
  assert.deepStrictEqual(g.travels, [[9, 9], [5, 3], [1, 1]]);
  assert.strictEqual(g.forages.length, 3);
  assert.strictEqual(ctx.patrols, 1);
  const n = g.travels.length;
  weeklyPatrol(g, ctx); // once-per-day guard
  assert.strictEqual(g.travels.length, n);
}
{ // non-patrol days (deed-seeking's 3 and 5): silent
  for (const day of [10, 12]) {
    const g = stubGame(day, 1500); const ctx = {};
    weeklyPatrol(g, ctx);
    assert.strictEqual(g.travels.length, 0, 'day ' + day + ' must not patrol');
    assert.strictEqual(ctx.patrols || 0, 0);
  }
}
{ // kcal gate: day 8 but starving -> no patrol
  const g = stubGame(8, 100); const ctx = {};
  weeklyPatrol(g, ctx);
  assert.strictEqual(g.travels.length, 0);
}

// (3) Census classifiers on a deed-weekly-shaped evening.
{
  const eve = { eveningOutcome: 'policy-no-record', inCombat: false, insideTent: false };
  assert.deepStrictEqual(endCauseOf(eve, {}), { cause: 'no-return-step', subkind: null });
  const base = { vesselId: 'v1' };
  const next = { dec: { morning: { vesselId: 'v1', insideHaven: false, tile: 'forest_floor', mapPx: 5, mapPy: 3 } }, eve: { insideHaven: true, tile: 'haven' } };
  // returnStoryOf reads next morning via atHaven (insideHaven true OR tile haven OR node):
  // morning here is away, evening is haven -> walked-home-next-day.
  const story = returnStoryOf(base, next, 'survived');
  assert.strictEqual(story.story, 'walked-home-next-day');
}
console.log('test-patrolsched-b: PASS (day set [1], stub patrol gating/farthest-first/once-per-day/kcal gate, no-return-step + walked-home-next-day classification)');
