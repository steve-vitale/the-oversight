#!/usr/bin/env node
// scripts/test-departhold-a-fixtures.js — sim-departhold-a fixtures.
// Synthetic only (no sim corpus needed). Proves: every derived
// maybe action is reachable (departed / tighten-overwrite /
// defer-overwrite / held-ready x {heal-sat-out, no-attempt,
// other-held} / skipped-not-at-haven / repicked / other); the
// classifyPick priority order holds (departure beats overwrite,
// overwrite beats supersession, needs beats candidate-null);
// the DEPARTHOLD env gate installs nothing when unset and wraps
// when set. Exit 1 on any failure.
'use strict';
const { deriveMaybeAction, compactObjective, layerOn, withDepartholdDiag, newStore } = require('./policies/departhold-diag');
const { classifyPick } = require('./test-departhold-a');

let pass = 0, fail = 0;
function check(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) { pass++; }
  else { fail++; console.log(`FAIL ${name}: got ${JSON.stringify(got)} want ${JSON.stringify(want)}`); }
}
const HUNT_READY = { kind: 'HUNT', purpose: 'hunt', state: 'ready', tx: 5, ty: 3, huntMid: 'eulogy', huntTx: 5, huntTy: 3, huntDay: 100, indoor: false, targetVid: null };
const HUNT_OUT = Object.assign({}, HUNT_READY, { state: 'out' });
const CHORE = { kind: 'HAVEN_CHORE', purpose: 'chore', state: 'indoor', tx: 4, ty: 4, huntMid: null, huntTx: null, huntTy: null, huntDay: null, indoor: true, targetVid: null };
const IDLE = { kind: 'idle', purpose: null, state: 'idle', tx: null, ty: null, huntMid: null, huntTx: null, huntTy: null, huntDay: null, indoor: false, targetVid: null };
const noSubs = { danger: [], heal: [], tighten: [], depart: [] };

// --- record shape ---
check('compactObjective hunt fields', compactObjective(HUNT_READY),
  { kind: 'HUNT', purpose: 'hunt', state: 'ready', tx: 5, ty: 3, huntMid: 'eulogy', huntTx: 5, huntTy: 3, huntDay: 100, indoor: false, targetVid: null, tightened: false });
check('compactObjective null', compactObjective(null), null);

// --- deriveMaybeAction ---
check('departed', deriveMaybeAction(HUNT_READY, HUNT_OUT, noSubs, true, null),
  { action: 'departed', sub: null, reason: null });
check('tighten-overwrite', deriveMaybeAction(HUNT_READY, CHORE,
  { danger: [{ verdict: 'tighten', score: 4 }], heal: [], tighten: [{ preKind: 'HUNT', postKind: 'HAVEN_CHORE' }], depart: [] }, true, null),
  { action: 'overwritten', sub: 'tighten-overwrite', reason: null });
check('defer-overwrite', deriveMaybeAction(HUNT_READY, CHORE,
  { danger: [{ verdict: 'defer', score: 6 }], heal: [], tighten: [], depart: [] }, true, null),
  { action: 'overwritten', sub: 'defer-overwrite', reason: null });
check('ask-fallthrough-overwrite is tighten subtype', deriveMaybeAction(HUNT_READY, CHORE,
  { danger: [{ verdict: 'ask', score: 3 }], heal: [], tighten: [{ preKind: 'HUNT', postKind: 'HAVEN_CHORE' }], depart: [] }, true, null),
  { action: 'overwritten', sub: 'tighten-overwrite', reason: null });
check('held heal-sat-out', deriveMaybeAction(HUNT_READY, HUNT_READY,
  { danger: [{ verdict: 'go', score: 1 }], heal: [{ satOut: true, cached: false }], tighten: [], depart: [{ ret: false }] }, true, null),
  { action: 'held-ready', sub: 'heal-sat-out', reason: null });
check('held no-attempt sick', deriveMaybeAction(HUNT_READY, HUNT_READY, noSubs, true, 'sick'),
  { action: 'held-ready', sub: 'no-attempt-early-return', reason: 'sick' });
check('held other-held', deriveMaybeAction(HUNT_READY, HUNT_READY,
  { danger: [{ verdict: 'go', score: 1 }], heal: [], tighten: [], depart: [] }, true, null),
  { action: 'held-ready', sub: 'other-held', reason: null });
check('skipped-not-at-haven', deriveMaybeAction(HUNT_READY, HUNT_READY, noSubs, false, null),
  { action: 'skipped-not-at-haven', sub: null, reason: null });
check('repicked', deriveMaybeAction(HUNT_READY,
  { kind: 'FORAGE', purpose: 'forage', state: 'ready', tx: 5, ty: 5, huntMid: null, huntTx: null, huntTy: null, huntDay: null, indoor: false, targetVid: null },
  noSubs, true, null),
  { action: 'repicked', sub: null, reason: null });
check('other changed-while-away', deriveMaybeAction(HUNT_READY, CHORE, noSubs, false, null),
  { action: 'other', sub: null, reason: 'changed-while-away' });
check('fresh-pick held', deriveMaybeAction(IDLE, HUNT_READY,
  { danger: [{ verdict: 'go', score: 1 }], heal: [{ satOut: true, cached: false }], tighten: [], depart: [{ ret: false }] }, true, null),
  { action: 'held-ready', sub: 'heal-sat-out', reason: null });

// --- classifyPick priority ---
const WAVES = { eulogy: 4, deer: 1 };
function pick(day, part, opts) {
  const o = opts || {};
  return {
    day, part, dayPart: 1, vid: 'v1', hx: 4, hy: 4,
    chosen: o.chosen || { kind: 'HUNT', huntMid: 'eulogy', huntDay: 100, huntTx: 5, huntTy: 3 },
    preSightings: o.pre || [['eulogy', 5, 3, 100, 1]],
    postSightings: o.pre || [['eulogy', 5, 3, 100, 1]],
    candidate: o.candidate !== undefined ? o.candidate : { mid: 'eulogy', tx: 5, ty: 3, day: 100 },
    gates: o.gates || { armed: true, sheltered: false, postFleeResting: false, maxD: 3 },
  };
}
function dep(part, day) {
  return { day, part, dayPart: 1, vid: 'v1', objective: { kind: 'HUNT', huntMid: 'eulogy', state: 'out' } };
}
function ev(part, action, dangerVerdict) {
  return {
    part, day: 100, dayPart: 1, vid: 'v1', atHaven: true, freshPickInCall: false,
    pre: HUNT_READY, post: action === 'overwritten' ? CHORE : HUNT_READY,
    danger: dangerVerdict ? [{ verdict: dangerVerdict, score: 4 }] : [],
    heal: [], tighten: action === 'overwritten' ? [{ preKind: 'HUNT', postKind: 'HAVEN_CHORE' }] : [], depart: [],
    action, sub: action === 'overwritten' ? 'tighten-overwrite' : null, reason: null,
  };
}
function row(over) {
  return Object.assign({
    funnel: { picks: [] }, returns: { departures: [] },
    departhold: { evaluations: [] }, deathsList: [],
  }, over || {});
}
const P = pick(100, 1000);
check('departed-pick-linked', classifyPick(row({
  funnel: { picks: [P] }, returns: { departures: [dep(1010, 101)] },
}), P, WAVES).cls, 'departed-pick-linked');
check('intervening pick breaks linkage -> superseded-by-needs-pick', classifyPick(row({
  funnel: { picks: [P, pick(100, 1005, { chosen: { kind: 'EAT', huntMid: null } })] },
  returns: { departures: [dep(1010, 101)] },
}), P, WAVES).cls, 'superseded-by-needs-pick');
check('overwritten-danger beats later needs pick', classifyPick(row({
  funnel: { picks: [P, pick(101, 1020, { chosen: { kind: 'EAT', huntMid: null } })] },
  departhold: { evaluations: [ev(1010, 'overwritten', 'tighten')] },
}), P, WAVES).cls, 'overwritten-danger');
check('overwrite after first later pick belongs to new objective', classifyPick(row({
  funnel: { picks: [P, pick(101, 1020, { chosen: { kind: 'HUNT', huntMid: 'eulogy', huntDay: 100 } })] },
  departhold: { evaluations: [ev(1030, 'overwritten', 'defer')] },
}), P, WAVES).cls, 'superseded-by-re-pick');
check('candidate-null age gate', classifyPick(row({
  funnel: { picks: [P, pick(104, 1100, { chosen: { kind: 'SEEK', huntMid: null }, candidate: null })] },
}), P, WAVES).cls, 'candidate-null-after-pick');
check('held-ready-at-end', classifyPick(row({
  funnel: { picks: [P] },
  departhold: { evaluations: [Object.assign(ev(1010, 'held-ready', null), { sub: 'no-attempt-early-return', reason: 'sick' })] },
}), P, WAVES).cls, 'held-ready-at-end');
check('gate-blocked', classifyPick(row({
  funnel: { picks: [pick(100, 1000, { gates: { armed: true, sheltered: false, postFleeResting: true, maxD: 3 } })] },
}), pick(100, 1000, { gates: { armed: true, sheltered: false, postFleeResting: true, maxD: 3 } }), WAVES).cls, 'gate-blocked');
check('horizon', classifyPick(row({ funnel: { picks: [P] } }), P, WAVES).cls, 'horizon');

// --- env gate ---
function fakeGame() {
  return {
    state: { scholar: { day: 1 }, village: {} }, dayPart: 1,
    advancePart: function () {}, objDanger: function () { return { score: 0, verdict: 'go' }; },
    objHealGate: function () { return true; }, objTightenOrDefer: function () {},
    objDepart: function () { return true; }, objMaybeDepart: function () {},
  };
}
const savedEnv = process.env.DEPARTHOLD;
delete process.env.DEPARTHOLD;
check('layerOn unset', layerOn(), false);
{
  const g = fakeGame();
  const before = [g.advancePart, g.objDanger, g.objMaybeDepart];
  const pol = withDepartholdDiag({ daily: function () {} }, 'x', 'x', newStore());
  pol.daily(g, {});
  check('gate unset installs nothing', [g.advancePart, g.objDanger, g.objMaybeDepart], before);
}
process.env.DEPARTHOLD = '1';
check('layerOn set', layerOn(), true);
{
  const g = fakeGame();
  const st = newStore();
  const pol = withDepartholdDiag({ daily: function () {} }, 'x', 'x', st);
  pol.daily(g, {});
  check('gate set installs wraps', g.objMaybeDepart !== fakeGame().objMaybeDepart && st.installed, true);
}
if (savedEnv === undefined) delete process.env.DEPARTHOLD; else process.env.DEPARTHOLD = savedEnv;

console.log(`DEPARTHOLD-FIXTURES: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
