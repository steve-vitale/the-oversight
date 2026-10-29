#!/usr/bin/env node
// scripts/test-homebody-a-fixtures.js — sim-homebody-a unit fixtures.
// Synthetic pick/triple tables only (no game state, no corpus):
// every range class reachable, maxD-0 vs merely-out-of-range vs
// other-gate separation, counterfactual counting, and the
// neutrality-compare shape used by the analyzer.
// Exit 0 with FIXTURES PASS, non-zero on any failure.
'use strict';
const { classifyFreshPick, cheb, rangeClass } = require('./test-homebody-a');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL ${name}${extra ? ' :: ' + extra : ''}`); }
}
function pick(o) {
  return Object.assign({
    day: 10, part: 100, hx: 4, hy: 4,
    preSightings: [['eulogy', 5, 4, 9, 3]],
    candidate: null,
    gates: { armed: true, sheltered: false, postFleeResting: false, maxD: 1 },
  }, o);
}
// cheb / rangeClass basics.
check('cheb same tile 0', cheb(4, 4, 4, 4) === 0);
check('cheb diagonal 1', cheb(5, 5, 4, 4) === 1);
check('cheb far', cheb(8, 4, 4, 4) === 4);
check('rangeClass 0', rangeClass(0) === '0');
check('rangeClass 1', rangeClass(1) === '1');
check('rangeClass 2', rangeClass(2) === '2');
check('rangeClass 3+', rangeClass(5) === '>=3');
check('rangeClass null', rangeClass(null) === 'unknown');
// HOMEBODY: fresh entry, maxD 0, other gates green, candidate null.
{
  const d = classifyFreshPick(pick({ gates: { armed: true, sheltered: false, postFleeResting: false, maxD: 0 } }), 'eulogy');
  check('homebody fresh', d.fresh === true);
  check('homebody blocked', d.homebodyBlocked === true);
  check('homebody not outOfRange', d.outOfRangeBlocked === false);
  check('homebody not otherGate', d.otherGate === false);
}
// HOMEBODY even when the tile is adjacent: distance 1 still fails
// 1 <= d <= 0, so maxD 0 blocks regardless of tile.
{
  const d = classifyFreshPick(pick({ preSightings: [['eulogy', 5, 4, 10, 3]], gates: { armed: true, sheltered: false, postFleeResting: false, maxD: 0 } }), 'eulogy');
  check('homebody adjacent still blocked', d.homebodyBlocked === true && d.distances[0] === 1);
}
// OUT-OF-RANGE (non-homebody): maxD 1, tile at distance 2.
{
  const d = classifyFreshPick(pick({ preSightings: [['eulogy', 6, 4, 9, 3]], gates: { armed: true, sheltered: false, postFleeResting: false, maxD: 1 } }), 'eulogy');
  check('outOfRange blocked', d.outOfRangeBlocked === true);
  check('outOfRange not homebody', d.homebodyBlocked === false);
}
// IN-RANGE offered: maxD 3, tile at distance 1, candidate present.
{
  const d = classifyFreshPick(pick({ candidate: { mid: 'eulogy', tx: 5, ty: 4, day: 9 }, gates: { armed: true, sheltered: false, postFleeResting: false, maxD: 3 } }), 'eulogy');
  check('offered', d.offered === true);
  check('offered not blocked', d.homebodyBlocked === false && d.outOfRangeBlocked === false);
}
// OTHER-GATE outranks range: maxD 0 + post-flee rest => otherGate,
// NOT homebodyBlocked (the rest is the binding block at this pick).
{
  const d = classifyFreshPick(pick({ gates: { armed: true, sheltered: false, postFleeResting: true, maxD: 0 } }), 'eulogy');
  check('otherGate post-flee', d.otherGate === true);
  check('otherGate not homebody', d.homebodyBlocked === false);
}
// OTHER-GATE unarmed, maxD > 0.
{
  const d = classifyFreshPick(pick({ gates: { armed: false, sheltered: false, postFleeResting: false, maxD: 3 } }), 'eulogy');
  check('otherGate unarmed', d.otherGate === true && d.homebodyBlocked === false && d.outOfRangeBlocked === false);
}
// STALE: entry age 4 is not fresh; no block is claimed.
{
  const d = classifyFreshPick(pick({ preSightings: [['eulogy', 5, 4, 6, 3]] }), 'eulogy');
  check('stale not fresh', d.fresh === false);
  check('stale no block', d.homebodyBlocked === false && d.outOfRangeBlocked === false && d.otherGate === false);
}
// FRESH boundary: age 3 is fresh, age 0 is fresh.
{
  const d3 = classifyFreshPick(pick({ preSightings: [['eulogy', 5, 4, 7, 3]], gates: { armed: true, sheltered: false, postFleeResting: false, maxD: 0 } }), 'eulogy');
  const d0 = classifyFreshPick(pick({ preSightings: [['eulogy', 5, 4, 10, 3]], gates: { armed: true, sheltered: false, postFleeResting: false, maxD: 0 } }), 'eulogy');
  check('age 3 fresh', d3.fresh === true && d3.homebodyBlocked === true);
  check('age 0 fresh', d0.fresh === true && d0.homebodyBlocked === true);
}
// NO ENTRY for the mid: nothing claimed.
{
  const d = classifyFreshPick(pick({ preSightings: [['callback', 5, 4, 9, 3]] }), 'eulogy');
  check('no entry', d.hasEntry === false && d.fresh === false);
}
// DISTANCE-0 (same tile) is out of range by the 1 <= d rule.
{
  const d = classifyFreshPick(pick({ preSightings: [['eulogy', 4, 4, 9, 3]], gates: { armed: true, sheltered: false, postFleeResting: false, maxD: 3 } }), 'eulogy');
  check('distance 0 out of range', d.outOfRangeBlocked === true && d.distances[0] === 0);
}
// Counterfactual counting on a synthetic triple table: only
// homebodyFreshBlocked triples count toward the upper bound;
// a maxD-0 villager who died before picking does NOT count.
{
  const table = [
    { vid: 'a', homebodyFreshBlocked: true },
    { vid: 'b', homebodyFreshBlocked: true },
    { vid: 'c', homebodyFreshBlocked: false }, // lottery-lost, maxD 3
    { vid: 'd', homebodyFreshBlocked: false }, // died before pick, maxD 0
  ];
  const upper = table.filter(t => t.homebodyFreshBlocked);
  check('upper bound counts blocked only', upper.length === 2);
  check('died-before-pick excluded', !upper.some(t => t.vid === 'd'));
}
// Offered-by-class counting shape: maxD-0 offered must be 0.
{
  const picks = [
    pick({ gates: { armed: true, sheltered: false, postFleeResting: false, maxD: 0 } }),
    pick({ candidate: { mid: 'eulogy' }, gates: { armed: true, sheltered: false, postFleeResting: false, maxD: 1 } }),
  ];
  const byClass = {};
  for (const p of picks) {
    const c = rangeClass(p.gates.maxD);
    byClass[c] = byClass[c] || { picks: 0, offered: 0 };
    byClass[c].picks++;
    if (p.candidate) byClass[c].offered++;
  }
  check('maxD0 offered 0 in shape', (byClass['0'] || {}).offered === 0);
  check('maxD1 offered 1 in shape', (byClass['1'] || {}).offered === 1);
}
console.log(`FIXTURES: ${pass} passed, ${fail} failed`);
if (fail) { console.log('HOMEBODY-FIXTURES: FAIL'); process.exit(1); }
console.log('HOMEBODY-FIXTURES: PASS');
