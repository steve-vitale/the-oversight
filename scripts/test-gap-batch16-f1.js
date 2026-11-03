#!/usr/bin/env node
// test-gap-batch16-f1.js — gap batch item 16(a): r107 F1, the favor
// call-time cause blank ("favor call-time cause — blank stays OPEN").
// Journey-crisis r107 (evidence/2026-11-02/journey-crisis-r107.md §F1):
// across 24 driven convos, convoFavorAction never returned 'They are
// no longer available to receive help.', so the blank stayed OPEN for
// a tenth consecutive panel. The r107 probe wraps convoFavorAction
// during driven convos (engine menu calls + post-convo probes) — a
// population of living convo partners, who by construction can
// essentially never produce the line. This script tests the mechanism
// end to end in the harness, stage by stage:
//
//   1. A living villager's open food_share favor: the availability
//      gate PASSES (the call does not return the unavailable line).
//   2. The same favor after the villager dies (real removeVillager
//      path): the call returns exactly 'They are no longer available
//      to receive help.'; the promise is RELEASED (kept='released',
//      the r9 design: a promise to the removed is neither kept nor
//      broken), and the journal row reads 'released' — which is why
//      the journal never sits open-with-a-dead-person after a live
//      death, and why driven panels see zero.
//   3. The same favor with the villager away on the road: the call
//      must NOT tell the player to walk next to someone miles away.
//      It returns a road line naming that they are out and the
//      promise must wait for their return. (Pre-fix this returned
//      the walk-to-them line — the broken half of this item.)
//   4. Delegated kinds use their own unavailable wording, not the
//      generic line: forage_help, water_haul, stay_close each return
//      a partner/person-unavailable reason when the partner is dead.
//      (This is why an exact-string probe on the generic line alone
//      would also miss delegated kinds.)
//   5. Old-save stale state, built WITHOUT removeVillager (a death
//      that predates the r9 release code: dead-marked, off-roster,
//      promise still open, favor still promised): the journal row
//      stays OPEN and its requirements name the unavailable cause.
//      That residual is item 13's migration target — this stage pins
//      the pre-migration behavior; the item-13 proof flips it.
//
// Usage: node scripts/test-gap-batch16-f1.js
// Exit 0 on all green, 1 on any failure.
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0;
function ok(cond, label, extra) {
  if (cond) { pass++; console.log('PASS: ' + label); }
  else { fail++; console.log('FAIL: ' + label + (extra != null ? ' :: ' + extra : '')); }
}

const UNAVAIL = 'They are no longer available to receive help.';
const ROAD = 'They are out on the road, miles from here. Find them when they are back.';

(async () => {
  const { Game } = await loadGame({ seed: 42, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village || {};
  const bearer = Game.villagerId;
  const X = (v.roster || []).find(id => id !== bearer && Game.getPerson(id));
  ok(!!X, 'setup: a living non-bearer villager exists', 'roster=' + (v.roster || []).length);
  if (!X) { console.log(`\ntest-gap-batch16-f1: ${pass} passed, ${fail} failed`); process.exit(1); }
  const name = (() => { try { return Game.displayName(X); } catch (e) { return X; } })();

  function setFavor(kind, task) {
    v.favorLedger = v.favorLedger || {};
    v.promises = v.promises || {};
    const f = { id: 'gap16-' + kind, vid: X, kind, state: 'promised', task,
      goal: task, askedDay: 1, promisedDay: 1, deadline: 99 };
    if (kind === 'forage_help' || kind === 'water_haul') f.meetDay = 1;
    if (kind === 'stay_close') { f.companyVersion = 1; f.companyNight = 99; }
    v.favorLedger[X] = f;
    v.promises[X] = { goal: task, day: 1, kept: false, maker: bearer,
      favorId: f.id, favorTask: task, favorDeadline: 99 };
    return f;
  }
  function clearFavor() { delete v.favorLedger[X]; delete v.promises[X]; }
  function revive() {
    if (!(v.roster || []).includes(X)) (v.roster || []).push(X);
    const p = Game.getPerson(X);
    if (p) p.dead = false;
    try {
      const vr = (Game.data.villagers || []).find(r => r.id === X);
      if (vr) delete vr.dead;
      const br = (Game.data.background_survivors || []).find(r => r.id === X);
      if (br) delete br.dead;
    } catch (e) {}
    if (v.away) delete v.away[X];
  }
  function placeBeside() {
    try {
      const s = Game.state.scholar;
      v.nodePos = v.nodePos || {};
      v.nodePos[X] = { nx: Game.map.px, ny: Game.map.py };
      v.positions = v.positions || {};
      const mx = (s.mx ?? 4) + 1;
      v.positions[X] = { mx: mx > 8 ? (s.mx ?? 4) - 1 : mx, my: s.my ?? 4 };
      v.npcInside = v.npcInside || {};
      v.npcInside[X] = (s.insideHaven !== false);
    } catch (e) {}
  }
  function journalRow() {
    try {
      const entry = (Game.state.codex && Game.state.codex.people && Game.state.codex.people[X]) || null;
      const rows = Game.journalPromises(X, entry);
      return rows.find(p => p.favorId === 'gap16-food_share') || null;
    } catch (e) { return { _threw: String(e.message) }; }
  }

  // Stage 1: living partner, generic kind — availability gate passes.
  setFavor('food_share', 'Share a meal with ' + name);
  placeBeside();
  let r1 = null;
  try { r1 = Game.convoFavorAction(X, v.favorLedger[X]); } catch (e) { r1 = { ready: false, reason: 'THREW: ' + e.message }; }
  ok(r1 && r1.reason !== UNAVAIL, '1: living food_share favor does NOT return the unavailable line',
    'got: ' + JSON.stringify(r1 && r1.reason));
  ok(!!(r1 && (r1.ready || r1.reason)), '1: living call returns a usable action/reason',
    'got: ' + JSON.stringify(r1));

  // Stage 2: the partner dies via the real removal path.
  Game.removeVillager(X, 'killed');
  ok(v.promises[X] && v.promises[X].kept === 'released',
    '2: death RELEASES the open promise (kept=released, r9 design)',
    'got: ' + JSON.stringify(v.promises[X] && v.promises[X].kept));
  let r2 = null;
  try { r2 = Game.convoFavorAction(X, v.favorLedger[X]); } catch (e) { r2 = { ready: false, reason: 'THREW: ' + e.message }; }
  ok(r2 && r2.reason === UNAVAIL, '2: dead food_share favor returns exactly the unavailable line',
    'got: ' + JSON.stringify(r2 && r2.reason));
  const row2 = journalRow();
  ok(row2 && row2.status === 'released', '2: journal row reads released after death (not open)',
    'got: ' + JSON.stringify(row2 && row2.status));

  // Stage 3: living again but away on the road — road line, not walk-to-them.
  revive();
  placeBeside();
  v.away = v.away || {}; v.away[X] = true;
  let r3 = null;
  try { r3 = Game.convoFavorAction(X, v.favorLedger[X]); } catch (e) { r3 = { ready: false, reason: 'THREW: ' + e.message }; }
  ok(r3 && r3.reason === ROAD, '3: away food_share favor returns the road line',
    'got: ' + JSON.stringify(r3 && r3.reason));
  delete v.away[X];

  // Stage 4: delegated kinds speak their own unavailable wording.
  revive();
  placeBeside();
  const delegated = [
    ['forage_help', 'Forage together with ' + name, 'no longer available for this outing'],
    ['water_haul', 'Haul water with ' + name, null],
    ['stay_close', 'Spend the night beside ' + name, 'no longer available'],
  ];
  for (const [kind, task, needle] of delegated) {
    clearFavor();
    setFavor(kind, task);
    Game.removeVillager(X, 'killed');
    let r = null;
    try { r = Game.convoFavorAction(X, v.favorLedger[X]); } catch (e) { r = { ready: false, reason: 'THREW: ' + e.message }; }
    const reason = (r && r.reason) || '';
    ok(!!(r && !r.ready && reason.length > 0 && reason !== UNAVAIL),
      '4: dead ' + kind + ' favor returns its own unavailable reason (not the generic line)',
      'got: ' + JSON.stringify(reason));
    if (needle) ok(reason.includes(needle), '4: dead ' + kind + ' reason names unavailability',
      'got: ' + JSON.stringify(reason));
    revive();
    placeBeside();
  }
  clearFavor();

  // Stage 5: old-save stale state (no removeVillager): dead-marked,
  // off-roster, promise still open, favor still promised.
  setFavor('food_share', 'Share a meal with ' + name);
  const p5 = Game.getPerson(X);
  if (p5) p5.dead = true;
  v.roster = (v.roster || []).filter(id => id !== X);
  if (v.positions) delete v.positions[X];
  if (v.nodePos) delete v.nodePos[X];
  const row5 = journalRow();
  ok(row5 && row5.status === 'open', '5: stale old-save row stays OPEN before migration',
    'got: ' + JSON.stringify(row5 && row5.status));
  ok(row5 && String(row5.requirements || '').includes(UNAVAIL),
    '5: stale old-save requirements name the unavailable cause',
    'got: ' + JSON.stringify(row5 && row5.requirements));

  console.log(`\ntest-gap-batch16-f1: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('FATAL: ' + (e && e.stack || e)); process.exit(1); });
