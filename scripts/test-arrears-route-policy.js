#!/usr/bin/env node
// test-arrears-route-policy.js — unit proof for the arrears-route
// state machine (scripts/policies/arrears-route.js) on stub
// readiness objects. No game load, no sim, no RNG. Prereg:
// evidence/2026-11-02/sim-arrears-route-a-prereg.md.
// Usage: node scripts/test-arrears-route-policy.js
'use strict';
const assert = require('assert');
const AR = require('./policies/arrears-route');

let n = 0;
function check(name, cond, detail) {
  n++;
  assert.ok(cond, name + (detail !== undefined ? ' :: ' + JSON.stringify(detail) : ''));
  console.log('ok ' + n + ' ' + name);
}
function link(name, trust, opinion, arrears, wouldRefuse) {
  return { villageId: name, name: name, trust: trust, opinion: opinion, arrears: arrears, wouldRefuse: wouldRefuse };
}
function readiness(links, total, ready) {
  return { links: links, alliesProj: 0, havenProj: 3, total: total, ready: ready, generatedNow: [], errors: [] };
}

// 1. Arrears-only block: refusing link with trust/opinion passing,
// arrears > 0, total short of need.
{
  const r = readiness([
    link('Emberhold', 72, 20, 3000, true),
    link('Stonebridge', 50, 5, 0, false),
  ], 9, false);
  check('arrears-only block true', AR.isArrearsOnlyBlock(r) === true, r);
  const bl = AR.firstArrearsLink(r);
  check('first arrears link named with debt', bl && bl.name === 'Emberhold' && bl.arrears === 3000, bl);
}
// 2. Trust refusal anywhere -> NOT arrears-only.
{
  const r = readiness([
    link('Emberhold', 72, 20, 3000, true),
    link('Thornfield', 20, 5, 0, true),
  ], 6, false);
  check('trust refusal vetoes arrears-only', AR.isArrearsOnlyBlock(r) === false, r);
}
// 3. Opinion refusal anywhere -> NOT arrears-only.
{
  const r = readiness([
    link('Emberhold', 72, 20, 3000, true),
    link('Hungry Road', 50, -20, 0, true),
  ], 6, false);
  check('opinion refusal vetoes arrears-only', AR.isArrearsOnlyBlock(r) === false, r);
}
// 4. Ready -> NOT a block at all.
{
  const r = readiness([link('Emberhold', 72, 20, 3000, true)], 12, true);
  check('ready is not a block', AR.isArrearsOnlyBlock(r) === false, r);
}
// 5. Not ready with NO refusing link (just too few blades) -> NOT
// arrears-only (nothing to wait out).
{
  const r = readiness([link('Stonebridge', 50, 5, 0, false)], 5, false);
  check('no-refusal shortfall is not arrears-only', AR.isArrearsOnlyBlock(r) === false, r);
}
// 6. Arrears link that passes trust/opinion but does NOT refuse
// (arrears 0) is not a blocker.
{
  const r = readiness([
    link('Emberhold', 72, 20, 0, false),
    link('Stonebridge', 50, 5, 0, false),
  ], 5, false);
  check('clean links are not arrears-only', AR.isArrearsOnlyBlock(r) === false, r);
}
// 7. Deferral lifecycle: defer at day 100, ticks at 107/114/121/128,
// no tick early, sound on ready tick 2, terminal after.
{
  const st = AR.newState();
  check('starts idle', st.status === 'idle');
  const rBlock = readiness([link('Emberhold', 72, 20, 3000, true)], 9, false);
  check('no tick while idle', AR.dueTick(st, 100) === null);
  check('arrears-only refusal defers', AR.observeRefusal(st, 100, rBlock) === 'defer' && st.status === 'deferring' && st.deferDay === 100, st);
  check('no tick on day 106', AR.dueTick(st, 106) === null);
  check('tick 1 due day 107', AR.dueTick(st, 107) === 1);
  check('tick 1 not-ready stays deferring', AR.onTickResult(st, 1, 'not-ready') === 'deferring' && st.tickIndex === 1);
  check('no tick before day 114', AR.dueTick(st, 113) === null);
  check('tick 2 due day 114', AR.dueTick(st, 114) === 2);
  check('tick 2 ready sounds', AR.onTickResult(st, 2, 'sounded') === 'sounded');
  check('terminal after sounded: no tick', AR.dueTick(st, 121) === null);
  check('terminal after sounded: refusal ignored', AR.observeRefusal(st, 122, rBlock) === 'none' && st.status === 'sounded');
}
// 8. Stand-down: four not-ready ticks, terminal, no restart.
{
  const st = AR.newState();
  const rBlock = readiness([link('Emberhold', 72, 20, 3000, true)], 9, false);
  AR.observeRefusal(st, 50, rBlock);
  AR.onTickResult(st, 1, 'not-ready');
  AR.onTickResult(st, 2, 'not-ready');
  AR.onTickResult(st, 3, 'not-ready');
  check('tick 4 not-ready stands down', AR.onTickResult(st, 4, 'not-ready') === 'stood-down');
  check('terminal after stand-down', AR.dueTick(st, 100) === null && AR.observeRefusal(st, 100, rBlock) === 'none');
}
// 9. Ready-but-absent at tick 4 also stands down (no muster, no
// refusal penalty, no sound counted).
{
  const st = AR.newState();
  const rBlock = readiness([link('Emberhold', 72, 20, 3000, true)], 9, false);
  AR.observeRefusal(st, 50, rBlock);
  AR.onTickResult(st, 1, 'not-ready');
  AR.onTickResult(st, 2, 'not-ready');
  AR.onTickResult(st, 3, 'not-ready');
  check('ready-absent at tick 4 stands down', AR.onTickResult(st, 4, 'ready-absent') === 'stood-down');
}
// 10. Ready-but-absent before tick 4 keeps waiting.
{
  const st = AR.newState();
  const rBlock = readiness([link('Emberhold', 72, 20, 3000, true)], 9, false);
  AR.observeRefusal(st, 50, rBlock);
  check('ready-absent tick 1 stays deferring', AR.onTickResult(st, 1, 'ready-absent') === 'deferring');
  check('tick 2 still due', AR.dueTick(st, 64) === 2);
}
// 11. observeRefusal never mutates the readiness object.
{
  const st = AR.newState();
  const rBlock = readiness([link('Emberhold', 72, 20, 3000, true)], 9, false);
  const before = JSON.stringify(rBlock);
  AR.observeRefusal(st, 50, rBlock);
  check('readiness object untouched by observeRefusal', JSON.stringify(rBlock) === before);
}
// 12. Non-arrears block while idle starts NO deferral.
{
  const st = AR.newState();
  const rTrust = readiness([link('Thornfield', 20, 5, 0, true)], 4, false);
  check('trust block does not defer', AR.observeRefusal(st, 60, rTrust) === 'none' && st.status === 'idle');
}
// 13. Ready first check starts NO deferral.
{
  const st = AR.newState();
  const rReady = readiness([link('Stonebridge', 80, 20, 0, false)], 12, true);
  check('ready first check does not defer', AR.observeRefusal(st, 60, rReady) === 'none' && st.status === 'idle');
}
// 14. Tick offsets are exactly 7/14/21/28.
{
  check('tick offsets 7/14/21/28', JSON.stringify(AR.tickOffsets) === JSON.stringify([7, 14, 21, 28]), AR.tickOffsets);
}
console.log('arrears-route policy unit proof: ' + n + '/' + n + ' passed');
