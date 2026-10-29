#!/usr/bin/env node
// scripts/test-funnel-a-fixtures.js — sim-funnel-a taxonomy fixtures.
// Synthetic traces only (no sim corpus needed). Proves every
// taxonomy class is reachable, the stage priority order holds
// (a later departure beats an earlier lottery loss; a deliberate
// meeting beats everything), episode boundaries behave (eviction
// closes, refresh re-opens), and the pick/note record shapes carry
// the fields the analyzer reads. Exit 1 on any failure.
// The live-harness pick-capture proof (recorder installed on a
// real game, memory seeded, objPick driven, pick record asserted)
// lives in scripts/test-funnel-a-sense.js S2 — a fixture that
// needs the engine, not a unit table.
'use strict';
const { classifyTriple, buildEpisodesFromNotes, diagnosePick, isPostAnchorPick } = require('./test-funnel-a');
const { copySightingsCompact, compactObjective } = require('./policies/funnel-diag');

let pass = 0, fail = 0;
function check(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) { pass++; }
  else { fail++; console.log(`FAIL ${name}: got ${JSON.stringify(got)} want ${JSON.stringify(want)}`); }
}
// Sightings tuples: [mid, tx, ty, day, part].
function pick(day, part, opts) {
  const o = opts || {};
  return {
    day, part, dayPart: o.dayPart != null ? o.dayPart : 1, vid: 'v1',
    hx: 4, hy: 4, node: { nx: 4, ny: 4 },
    chosen: o.chosen || { kind: 'FORAGE', purpose: 'forage', state: 'out', tx: 5, ty: 5, huntMid: null, huntTx: null, huntTy: null, huntDay: null, indoor: false, targetVid: null },
    preSightings: o.pre || [],
    postSightings: o.post || o.pre || [],
    candidate: o.candidate || null, candidateErr: null,
    gates: o.gates || { armed: true, sheltered: false, postFleeResting: false, maxD: 3 },
  };
}
function note(day, part, post, evicted) {
  return { day, part, dayPart: 1, vid: 'v1', mid: 'eulogy', tx: 5, ty: 3, refreshed: false, listLenAfter: post.length, evicted: evicted || [], postSightings: post };
}
function dep(day, part, kind, huntMid, huntDay, huntTx, huntTy) {
  return { day, part, dayPart: 1, vid: 'v1',
    objective: { kind, purpose: kind === 'HUNT' ? 'hunt' : kind.toLowerCase(), state: 'out', tx: huntTx, ty: huntTy, huntMid: huntMid || null, huntTx: huntTx || null, huntTy: huntTy || null, huntDay: huntDay != null ? huntDay : null, indoor: false, targetVid: null } };
}
function drop(day, part, mid, tx, ty) {
  return { day, part, dayPart: 1, vid: 'v1', mid, tx, ty, dropped: true };
}
function baseTrace(over) {
  const t = {
    seed: 75106, vid: 'v1', mid: 'eulogy',
    anchor: { day: 100, part: 1000, rt: { day: 100, dayPart: 1, part: 1000 }, fp: {} },
    picks: [], departures: [], drops: [], notes: [], meetings: [], deaths: [], leaves: [],
  };
  return Object.assign(t, over || {});
}
const EULOGY_53 = ['eulogy', 5, 3, 100, 1];

// --- record shapes ---
check('copySightingsCompact', copySightingsCompact([{ mid: 'eulogy', tx: 5, ty: 3, day: 100, part: 1 }, { mid: null }, null]), [['eulogy', 5, 3, 100, 1]]);
check('compactObjective hunt fields', compactObjective({ kind: 'HUNT', purpose: 'hunt', state: 'ready', tx: 5, ty: 3, huntMid: 'eulogy', huntTx: 5, huntTy: 3, huntDay: 100, indoor: false, targetVid: null }),
  { kind: 'HUNT', purpose: 'hunt', state: 'ready', tx: 5, ty: 3, huntMid: 'eulogy', huntTx: 5, huntTy: 3, huntDay: 100, indoor: false, targetVid: null });
check('compactObjective null', compactObjective(null), null);

// --- isPostAnchorPick ---
check('pick later part is post-anchor', isPostAnchorPick(pick(101, 1001, { pre: [] }), 1000, { day: 100, dayPart: 1 }, 'eulogy'), true);
check('pick earlier part is not post-anchor', isPostAnchorPick(pick(99, 999, { pre: [] }), 1000, { day: 100, dayPart: 1 }, 'eulogy'), false);
check('same-part pick with anchor stamp is post-anchor', isPostAnchorPick(pick(100, 1000, { pre: [['eulogy', 5, 3, 100, 1]] }), 1000, { day: 100, dayPart: 1 }, 'eulogy'), true);
check('same-part pick without anchor stamp is not post-anchor', isPostAnchorPick(pick(100, 1000, { pre: [['eulogy', 5, 3, 99, 1]] }), 1000, { day: 100, dayPart: 1 }, 'eulogy'), false);

// --- episodes ---
const eps1 = buildEpisodesFromNotes([
  note(100, 1000, [EULOGY_53]),
  note(101, 1010, [EULOGY_53]),
  note(102, 1020, [], [['eulogy', 5, 3, 100, 1]]),
], [], 'eulogy');
check('episode opens and closes by eviction', eps1.map(e => e.closeKind), ['evicted']);
check('episode notes counted', eps1[0].notes, 3);
const eps2 = buildEpisodesFromNotes([
  note(100, 1000, [EULOGY_53]),
  note(105, 1050, [EULOGY_53]),
], [], 'eulogy');
check('open episode stays horizon', eps2.map(e => e.closeKind), ['horizon']);

// --- diagnosePick ---
check('diagnose fresh+offered (no reasons)', diagnosePick(pick(101, 1001, { pre: [EULOGY_53], candidate: { mid: 'eulogy', tx: 5, ty: 3, day: 100 } }), 'eulogy').fresh, true);
check('diagnose stale', diagnosePick(pick(104, 1001, { pre: [EULOGY_53] }), 'eulogy').stale, true);
check('diagnose unarmed', diagnosePick(pick(101, 1001, { pre: [EULOGY_53], gates: { armed: false, sheltered: false, postFleeResting: false, maxD: 3 } }), 'eulogy').reasons, ['UNARMED']);
check('diagnose out-of-range', diagnosePick(pick(101, 1001, { pre: [['eulogy', 8, 8, 100, 1]], gates: { armed: true, sheltered: false, postFleeResting: false, maxD: 3 } }), 'eulogy').reasons, ['OUT-OF-RANGE']);
check('diagnose shadowed', diagnosePick(pick(101, 1001, { pre: [EULOGY_53], candidate: { mid: 'influencer', tx: 5, ty: 4, day: 101 } }), 'eulogy').reasons, ['SHADOWED']);
check('diagnose no entry', diagnosePick(pick(101, 1001, { pre: [] }), 'eulogy').hasEntry, false);

// --- taxonomy classes ---
// S0 died
check('S0 DIED-BEFORE-PICK', classifyTriple(baseTrace({ notes: [note(100, 1000, [EULOGY_53])], deaths: [{ day: 102, who: 'v1', cause: 'monster', player: false }] })).cls, 'DIED-BEFORE-PICK');
// S0 left
check('S0 LEFT-BEFORE-PICK', classifyTriple(baseTrace({ notes: [note(100, 1000, [EULOGY_53])], leaves: [dep(103, 1030, 'LEAVE')] })).cls, 'LEFT-BEFORE-PICK');
// S0 no pick
check('S0 NO-PICK-RECORDED', classifyTriple(baseTrace({ notes: [note(100, 1000, [EULOGY_53])] })).cls, 'NO-PICK-RECORDED');
// S1 overwritten: episode evicted, picks in an earlier stale state are
// superseded by the eviction close only when the LAST episode closed
// by eviction — here a single episode with a stale pick, then eviction.
check('S1 MEMORY-OVERWRITTEN', classifyTriple(baseTrace({
  notes: [note(100, 1000, [EULOGY_53]), note(104, 1040, [], [['eulogy', 5, 3, 100, 1]])],
  picks: [pick(101, 1001, { pre: [EULOGY_53] })],
})).cls, 'MEMORY-OVERWRITTEN');
// S1 stale: episode open at horizon, all picks stale.
check('S1 MEMORY-STALE-AT-PICK', classifyTriple(baseTrace({
  notes: [note(100, 1000, [EULOGY_53])],
  picks: [pick(104, 1040, { pre: [EULOGY_53] }), pick(105, 1050, { pre: [EULOGY_53] })],
})).cls, 'MEMORY-STALE-AT-PICK');
// S1 gate: fresh pick, candidate null, unarmed.
check('S1 GATE-BLOCKED-AT-PICK', classifyTriple(baseTrace({
  notes: [note(100, 1000, [EULOGY_53])],
  picks: [pick(101, 1001, { pre: [EULOGY_53], gates: { armed: false, sheltered: false, postFleeResting: false, maxD: 3 } })],
})).cls, 'GATE-BLOCKED-AT-PICK');
// S2 lottery: candidate offered, chosen FORAGE.
check('S2 LOTTERY-LOST', classifyTriple(baseTrace({
  notes: [note(100, 1000, [EULOGY_53])],
  picks: [pick(101, 1001, { pre: [EULOGY_53], candidate: { mid: 'eulogy', tx: 5, ty: 3, day: 100 } })],
})).cls, 'LOTTERY-LOST');
// S3 picked never departed, superseded.
check('S3 PICKED-NEVER-DEPARTED superseded', classifyTriple(baseTrace({
  notes: [note(100, 1000, [EULOGY_53])],
  picks: [
    pick(101, 1001, { pre: [EULOGY_53], chosen: { kind: 'HUNT', purpose: 'hunt', state: 'ready', tx: 5, ty: 3, huntMid: 'eulogy', huntTx: 5, huntTy: 3, huntDay: 100, indoor: false, targetVid: null } }),
    pick(102, 1020, { pre: [EULOGY_53] }),
  ],
})).cls, 'PICKED-NEVER-DEPARTED');
// S3 picked never departed, died while holding.
check('S3 PICKED-NEVER-DEPARTED died', classifyTriple(baseTrace({
  notes: [note(100, 1000, [EULOGY_53])],
  picks: [pick(101, 1001, { pre: [EULOGY_53], chosen: { kind: 'HUNT', purpose: 'hunt', state: 'ready', tx: 5, ty: 3, huntMid: 'eulogy', huntTx: 5, huntTy: 3, huntDay: 100, indoor: false, targetVid: null } })],
  deaths: [{ day: 102, who: 'v1', cause: 'monster', player: false }],
})).cls, 'PICKED-NEVER-DEPARTED');
// S4 empty tile: pick + departure + drop.
check('S4 DEPARTED-EMPTY-TILE', classifyTriple(baseTrace({
  notes: [note(100, 1000, [EULOGY_53])],
  picks: [pick(101, 1001, { pre: [EULOGY_53], chosen: { kind: 'HUNT', purpose: 'hunt', state: 'ready', tx: 5, ty: 3, huntMid: 'eulogy', huntTx: 5, huntTy: 3, huntDay: 100, indoor: false, targetVid: null } })],
  departures: [dep(101, 1002, 'HUNT', 'eulogy', 100, 5, 3)],
  drops: [drop(102, 1020, 'eulogy', 5, 3)],
})).cls, 'DEPARTED-EMPTY-TILE');
// S4 no meeting: pick + departure, no drop.
check('S4 DEPARTED-NO-MEETING', classifyTriple(baseTrace({
  notes: [note(100, 1000, [EULOGY_53])],
  picks: [pick(101, 1001, { pre: [EULOGY_53], chosen: { kind: 'HUNT', purpose: 'hunt', state: 'ready', tx: 5, ty: 3, huntMid: 'eulogy', huntTx: 5, huntTy: 3, huntDay: 100, indoor: false, targetVid: null } })],
  departures: [dep(101, 1002, 'HUNT', 'eulogy', 100, 5, 3)],
})).cls, 'DEPARTED-NO-MEETING');
// S5 deliberate meeting beats a departure.
check('S5 DELIBERATE-MEETING', classifyTriple(baseTrace({
  notes: [note(100, 1000, [EULOGY_53])],
  picks: [pick(101, 1001, { pre: [EULOGY_53], chosen: { kind: 'HUNT', purpose: 'hunt', state: 'ready', tx: 5, ty: 3, huntMid: 'eulogy', huntTx: 5, huntTy: 3, huntDay: 100, indoor: false, targetVid: null } })],
  departures: [dep(101, 1002, 'HUNT', 'eulogy', 100, 5, 3)],
  meetings: [{ day: 102, part: 1020, vid: 'v1', mid: 'eulogy', outcome: 'vFlee', retClass: 'DELIBERATE' }],
})).cls, 'DELIBERATE-MEETING');
// Priority: departure beats lottery loss (an earlier offered pick
// that lost, then a later HUNT pick that departed).
check('priority departure beats lottery', classifyTriple(baseTrace({
  notes: [note(100, 1000, [EULOGY_53])],
  picks: [
    pick(101, 1001, { pre: [EULOGY_53], candidate: { mid: 'eulogy', tx: 5, ty: 3, day: 100 } }),
    pick(102, 1020, { pre: [EULOGY_53], chosen: { kind: 'HUNT', purpose: 'hunt', state: 'ready', tx: 5, ty: 3, huntMid: 'eulogy', huntTx: 5, huntTy: 3, huntDay: 100, indoor: false, targetVid: null } }),
  ],
  departures: [dep(102, 1021, 'HUNT', 'eulogy', 100, 5, 3)],
  drops: [drop(103, 1030, 'eulogy', 5, 3)],
})).cls, 'DEPARTED-EMPTY-TILE');

console.log(`FIXTURES: pass=${pass} fail=${fail}`);
if (fail > 0) { console.log('FIXTURES: FAIL'); process.exit(1); }
console.log('FIXTURES: PASS');
