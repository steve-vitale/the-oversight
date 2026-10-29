#!/usr/bin/env node
// scripts/test-returns-a-fixtures.js — sim-returns-a analyzer correctness
// on synthetic fixtures (no sim corpus needed). Proves the prereg
// classification cannot be gamed by its own meeting: a sighting
// stamped at the meeting's own (day, dayPart) never counts as
// pre-meeting, and a deliberate return requires BOTH a live HUNT
// objective AND a strictly-earlier memory. Exit 1 on any failure.
'use strict';
const { isPreMeeting, classifyMeeting, buildChains, huntTileClass } = require('./test-returns-a');

let pass = 0, fail = 0;
function check(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) { pass++; }
  else { fail++; console.log(`FAIL ${name}: got ${JSON.stringify(got)} want ${JSON.stringify(want)}`); }
}
function joinedMid(obj, sightings, opts) {
  const o = opts || {};
  return { fp: { mid: o.mid || 'influencer', joinedAllyVid: o.allyVid || null, mTile: o.mTile || { tx: 4, ty: 4 } },
    rt: { day: o.day != null ? o.day : 100, dayPart: o.dayPart != null ? o.dayPart : 2,
      leaderObjective: obj, leaderSightings: sightings || [],
      allySightings: o.allySightings || {}, mTile: o.mTile || { tx: 4, ty: 4 } } };
}
const HUNT_OUT = { kind: 'HUNT', purpose: 'hunt', state: 'out', tx: 4, ty: 4, huntMid: 'influencer', huntTx: 4, huntTy: 4, huntDay: 99 };
const HUNT_READY = { kind: 'HUNT', purpose: 'hunt', state: 'ready', tx: 4, ty: 4, huntMid: 'influencer', huntTx: 4, huntTy: 4, huntDay: 99 };
const FORAGE = { kind: 'FORAGE', purpose: 'forage', state: 'out', tx: 5, ty: 5, huntMid: null, huntTx: null, huntTy: null, huntDay: null };

// isPreMeeting
check('pre earlier day', isPreMeeting({ day: 99, part: 3 }, { day: 100, dayPart: 0 }), true);
check('pre same day earlier part', isPreMeeting({ day: 100, part: 0 }, { day: 100, dayPart: 2 }), true);
check('not-pre same day later part', isPreMeeting({ day: 100, part: 3 }, { day: 100, dayPart: 2 }), false);
check('not-pre same day equal part (own write)', isPreMeeting({ day: 100, part: 2 }, { day: 100, dayPart: 2 }), false);
check('not-pre same day null parts', isPreMeeting({ day: 100, part: null }, { day: 100, dayPart: null }), false);
check('not-pre later day', isPreMeeting({ day: 101, part: 0 }, { day: 100, dayPart: 2 }), false);
check('not-pre null day', isPreMeeting({ day: null, part: 0 }, { day: 100, dayPart: 2 }), false);

// classifyMeeting
check('DELIBERATE', classifyMeeting(joinedMid(HUNT_OUT, [{ mid: 'influencer', tx: 4, ty: 4, day: 99, part: 1 }])).cls, 'DELIBERATE');
check('DELIBERATE same-day earlier part', classifyMeeting(joinedMid(HUNT_OUT, [{ mid: 'influencer', tx: 4, ty: 4, day: 100, part: 0 }])).cls, 'DELIBERATE');
check('ORPHANED (hunt, no memory)', classifyMeeting(joinedMid(HUNT_OUT, [])).cls, 'DELIBERATE-ORPHANED');
check('ORPHANED (memory is own write)', classifyMeeting(joinedMid(HUNT_OUT, [{ mid: 'influencer', tx: 4, ty: 4, day: 100, part: 2 }])).cls, 'DELIBERATE-ORPHANED');
check('HUNT-READY-NOT-OUT', classifyMeeting(joinedMid(HUNT_READY, [{ mid: 'influencer', tx: 4, ty: 4, day: 99, part: 1 }])).cls, 'HUNT-READY-NOT-OUT');
check('MEMORY-ONLY', classifyMeeting(joinedMid(FORAGE, [{ mid: 'influencer', tx: 4, ty: 4, day: 99, part: 1 }])).cls, 'MEMORY-ONLY');
check('ACCIDENTAL', classifyMeeting(joinedMid(null, [])).cls, 'ACCIDENTAL');
check('ACCIDENTAL other-mid memory does not count', classifyMeeting(joinedMid(FORAGE, [{ mid: 'eulogy', tx: 4, ty: 4, day: 99, part: 1 }])).cls, 'ACCIDENTAL');
check('ALLY-KNOWER flag', classifyMeeting(joinedMid(null, [], { allyVid: 'ally1', allySightings: { ally1: [{ mid: 'influencer', tx: 4, ty: 4, day: 99, part: 1 }] } })).flags, ['ALLY-KNOWER']);
check('ALLY-KNOWER not flagged for own-write sighting', classifyMeeting(joinedMid(null, [], { allyVid: 'ally1', allySightings: { ally1: [{ mid: 'influencer', tx: 4, ty: 4, day: 100, part: 2 }] } })).flags, []);
check('HUNT-OTHER-MID flag', classifyMeeting(joinedMid({ kind: 'HUNT', state: 'out', huntMid: 'eulogy', huntTx: 1, huntTy: 1 }, [])).flags, ['HUNT-OTHER-MID']);
check('huntTile EXACT', huntTileClass(HUNT_OUT, { tx: 4, ty: 4 }), 'EXACT');
check('huntTile NEAR (chebyshev 2)', huntTileClass(HUNT_OUT, { tx: 6, ty: 4 }), 'NEAR');
check('huntTile FAR (chebyshev 3)', huntTileClass(HUNT_OUT, { tx: 7, ty: 4 }), 'FAR');
check('huntTile null on missing coords', huntTileClass(HUNT_OUT, null), null);
check('DELIBERATE huntTile EXACT', classifyMeeting(joinedMid(HUNT_OUT, [{ mid: 'influencer', tx: 4, ty: 4, day: 99, part: 1 }])).huntTile, 'EXACT');

// buildChains (chainkill rule): HP link, singleton, ambiguous, kill class.
function m(seed, day, part, vid, mid, start, left, outcome) {
  return { seed, day, part, vid, mid, mHpStart: start, mHpLeft: left, outcome, mTile: { tx: 4, ty: 4 }, caller: 'resolve', rounds: 3, mDealt: (start - left) };
}
const built = buildChains([
  m(1, 10, 0, 'a', 'influencer', 850, 817, 'vFlee'),
  m(1, 10, 1, 'b', 'influencer', 817, 790, 'vFlee'),
  m(1, 11, 0, 'c', 'eulogy', 900, 900, 'vFlee'),
  m(1, 12, 0, 'd', 'influencer', 790, 0, 'vKill'),
]);
check('chains found', built.chains.length, 1);
check('chain length', built.chains[0].length, 3);
check('chain class KILL', built.chains[0].cls, 'KILL');
check('chain terminal HP', built.chains[0].terminalHp, 0);
check('singletons', built.singletons.length, 1);
check('singleton mid', built.singletons[0].mid, 'eulogy');
const amb = buildChains([
  m(2, 10, 0, 'a', 'eulogy', 900, 890, 'vFlee'),
  m(2, 10, 1, 'b', 'eulogy', 900, 890, 'vFlee'),
  m(2, 11, 0, 'c', 'eulogy', 890, 890, 'vFlee'),
]);
check('ambiguous link flagged', amb.links[0].flags.indexOf('AMBIGUOUS') >= 0, true);
check('ambiguous chain still one chain', amb.chains.length, 1);
const zero = buildChains([
  m(3, 10, 0, 'a', 'eulogy', 900, 900, 'vFlee'),
  m(3, 10, 1, 'b', 'eulogy', 900, 900, 'vDie'),
]);
check('zero-damage chain links (prereg rule)', zero.chains.length, 1);
check('zero-damage chain class', zero.chains[0].cls, 'STILL-ALIVE');

console.log(`FIXTURES: pass=${pass} fail=${fail}`);
if (fail > 0) { console.log('FIXTURES: FAIL'); process.exit(1); }
console.log('FIXTURES: PASS');
