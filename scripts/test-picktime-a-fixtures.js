#!/usr/bin/env node
// scripts/test-picktime-a-fixtures.js — sim-picktime-a fixture proof.
// Pure functions from scripts/test-picktime-a.js over synthetic
// rows (no game, no RNG). Proves, before any judged corpus is
// read: (1) the corrected link rule rejects a GUARD departure
// carrying the same huntMid/huntDay (holdsjoin-a flagged
// over-link); (2) a HUNT departure links with dayPart stamps
// carried; (3) a verdict overwrite in-window reclassifies a
// pick-only SUPERSEDED reading; (4) a departed evaluation at
// the departure part cross-checks; (5) a death-day departure
// stays UNKNOWN; (6) an overwrite for a DIFFERENT huntDay
// (same beast, re-picked) does not leak into the window.
// Usage: node scripts/test-picktime-a-fixtures.js
// Exit 0 only when all fixtures pass.
'use strict';
const { joinPick } = require('./test-picktime-a');
let n = 0, fails = [];
function check(name, cond, detail) {
  n++;
  if (cond) console.log(`  ok ${name}`);
  else { fails.push(name); console.log(`  FAIL ${name} ${detail || ''}`); }
}
function pick(vid, mid, huntDay, day, part, dayPart) {
  return { vid, day, part, dayPart, hx: 4, hy: 4,
    chosen: { kind: 'HUNT', huntMid: mid, huntDay },
    preSightings: [], postSightings: [], candidate: null, gates: {} };
}
function row(seed, picks, deps, drops, evals, deaths) {
  return { seed, days: 180, funnel: { picks, notes: [] },
    returns: { departures: deps, drops: drops || [], meetings: [] },
    departhold: { evaluations: evals || [] }, deathsList: deaths || [] };
}
function dep(vid, kind, mid, huntDay, day, part, dayPart) {
  return { vid, day, part, dayPart,
    objective: { kind, huntMid: mid, huntDay } };
}
function ev(vid, action, mid, huntDay, day, part, verdict, score) {
  return { vid, day, part, dayPart: 0, action, sub: null,
    pre: { kind: 'HUNT', huntMid: mid, huntDay },
    post: { kind: 'HUNT', huntMid: mid, huntDay },
    danger: verdict ? [{ vid, tx: 5, ty: 3, score, verdict }] : [] };
}
// 1. GUARD over-link rejected.
{
  const p = pick('v1', 'eulogy', 132, 135, 536, 0);
  const next = { vid: 'v1', day: 135, part: 539, dayPart: 3,
    chosen: { kind: 'WATER', huntMid: null, huntDay: null }, preSightings: [] };
  const r = row(75106, [p, next], [dep('v1', 'GUARD', 'eulogy', 132, 135, 538, 2)], [], [], []);
  const c = joinPick(r, p);
  check('guard-overlink-rejected', c.overlinkCandidates.length === 1
    && c.overlinkCandidates[0].kind === 'GUARD' && c.joinedCls === 'SUPERSEDED',
    JSON.stringify(c));
}
// 2. HUNT departure links, dayPart stamps carried.
{
  const p = pick('v2', 'eulogy', 132, 10, 100, 1);
  const r = row(75106, [p], [dep('v2', 'HUNT', 'eulogy', 132, 11, 102, 2)],
    [{ vid: 'v2', mid: 'eulogy', part: 103, day: 11, dayPart: 3, dropped: true }], [], []);
  const c = joinPick(r, p);
  // Ages are day - huntDay, negative for this synthetic
  // fixture's invented days (real corpus: huntDay <= pick day).
  // The fixture asserts the arithmetic, not the sign.
  check('hunt-departure-links', c.joinedCls === 'DEPARTED-PICK-LINKED'
    && c.lagDays === 1 && c.lagParts === 2 && c.pickDayPart === 1 && c.depDayPart === 2
    && c.dropped === true && c.ageAtPick === -122 && c.ageAtDeparture === -121, JSON.stringify(c));
}
// 3. Overwrite reclassifies a pick-only SUPERSEDED reading.
{
  const p = pick('v3', 'murkcap', 106, 108, 428, 0);
  const next = { vid: 'v3', day: 108, part: 431, dayPart: 3,
    chosen: { kind: 'FORAGE', huntMid: null, huntDay: null }, preSightings: [] };
  const r = row(75106, [p, next], [], [], [ev('v3', 'overwritten', 'murkcap', 106, 108, 429, 'tighten', 4)], []);
  const c = joinPick(r, p);
  check('overwrite-reclassifies', c.lagCls === 'SUPERSEDED'
    && c.joinedCls === 'OVERWRITTEN-BY-VERDICT' && c.reclassified === true
    && c.overwrite && c.overwrite.verdict === 'tighten' && c.overwrite.score === 4, JSON.stringify(c));
}
// 4. Departed evaluation cross-checks at the departure part.
{
  const p = pick('v4', 'gallowdeer', 133, 136, 540, 0);
  const r = row(75106, [p], [dep('v4', 'HUNT', 'gallowdeer', 133, 136, 540, 0)], [],
    [ev('v4', 'departed', 'gallowdeer', 133, 136, 540, 'go', 1)], []);
  const c = joinPick(r, p);
  check('departed-eval-matches', c.joinedCls === 'DEPARTED-PICK-LINKED'
    && c.departedEval && c.departedEval.partMatchesDep === true, JSON.stringify(c));
}
// 5. Death-day departure stays UNKNOWN.
{
  const p = pick('v5', 'eulogy', 132, 50, 500, 0);
  const r = row(75106, [p], [dep('v5', 'HUNT', 'eulogy', 132, 50, 505, 1)], [],
    [], [{ day: 50, who: 'v5', cause: 'the wild', player: false }]);
  const c = joinPick(r, p);
  check('death-day-unknown', c.joinedCls === 'UNKNOWN' && c.depDayPart === 1, JSON.stringify(c));
}
// 6. Overwrite for a different huntDay does not leak in.
{
  const p = pick('v6', 'eulogy', 132, 108, 100, 0);
  const next = { vid: 'v6', day: 108, part: 110, dayPart: 3,
    chosen: { kind: 'EAT', huntMid: null, huntDay: null }, preSightings: [] };
  const r = row(75106, [p, next], [], [], [ev('v6', 'overwritten', 'eulogy', 140, 108, 105, 'tighten', 5)], []);
  const c = joinPick(r, p);
  check('other-huntDay-excluded', c.joinedCls === 'SUPERSEDED'
    && c.overwrite === null && c.evalCount === 0, JSON.stringify(c));
}
console.log(`FIXTURES: ${n - fails.length}/${n} pass`);
if (fails.length) { console.log('PICKTIME-FIXTURES FAIL: ' + fails.join(', ')); process.exit(1); }
console.log('PICKTIME-FIXTURES PASS');
