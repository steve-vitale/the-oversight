#!/usr/bin/env node
// test-gap-batch13-deadpromises.js — gap batch item 13: old-saves
// corpse cases are not retroactively closed.
//
// Live deaths release open promises at removal time (betrayal.js
// removeVillager, break-it social r9), but a save written before that
// code — or a death whose removal never ran the release — can carry a
// still-open promise to someone who is already a corpse. Loading such
// a save never closed it: the journal showed it OPEN forever.
// Game.migrateDeadPromises(), called at the end of Game.load(),
// releases exactly those cases, keyed on save-persisted death
// evidence. This script proves it on constructed old-save states:
//
//   A. deathSeen[vid] (registerDeath's persisted mark) -> released.
//   B. a person-corpse naming vid -> released.
//   C. a dead-marked rosterChars record under true load conditions
//      (cast re-injected from rosterChars, no live data record to
//      shadow it) -> released via deadMarked.
//   D. Guards: an already-kept promise is untouched; a living holder
//      with no death evidence is untouched; a promise naming the
//      living bearer is untouched even with a stray deathSeen mark.
//   E. After migration the journal row reads 'released'.
//   F. Boundary, mirroring live death: favorLedger is untouched
//      (still 'promised') — the call-time backstop still speaks for
//      the favor itself, as after a live death.
//   G. Idempotence: a second migration call releases 0.
//
// Usage: node scripts/test-gap-batch13-deadpromises.js
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

(async () => {
  const { Game } = await loadGame({ seed: 42, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village || {};
  const bearer = Game.villagerId;
  const X = (v.roster || []).find(id => id !== bearer && Game.getPerson(id));
  ok(!!X, 'setup: a living non-bearer villager exists');
  if (!X) { console.log(`\ntest-gap-batch13-deadpromises: ${pass} passed, ${fail} failed`); process.exit(1); }
  v.promises = v.promises || {};
  v.favorLedger = v.favorLedger || {};
  v.deathSeen = v.deathSeen || {};
  Game.state.corpses = Game.state.corpses || [];

  function setOpenPromise() {
    v.favorLedger[X] = { id: 'gap13-favor', vid: X, kind: 'food_share', state: 'promised',
      task: 'Share a meal', goal: 'Share a meal', askedDay: 1, promisedDay: 1, deadline: 99 };
    v.promises[X] = { goal: 'Share a meal', day: 1, kept: false, maker: bearer,
      favorId: 'gap13-favor', favorTask: 'Share a meal', favorDeadline: 99 };
  }
  function clearCase() {
    delete v.promises[X];
    delete v.favorLedger[X];
    delete v.deathSeen[X];
    Game.state.corpses = Game.state.corpses.filter(c => !c || c.villagerId !== X);
    if (v.rosterChars) delete v.rosterChars[X];
  }
  function journalStatus() {
    try {
      const entry = (Game.state.codex && Game.state.codex.people && Game.state.codex.people[X]) || null;
      const row = Game.journalPromises(X, entry).find(p => p.favorId === 'gap13-favor');
      return row ? row.status : null;
    } catch (e) { return 'THREW:' + e.message; }
  }

  // A. deathSeen mark.
  setOpenPromise();
  v.deathSeen[X] = 5;
  ok(Game.migrateDeadPromises() === 1, 'A: deathSeen case releases exactly 1');
  ok(v.promises[X].kept === 'released', 'A: promise kept=released', 'got: ' + v.promises[X].kept);
  ok(journalStatus() === 'released', 'E: journal row reads released after migration', 'got: ' + journalStatus());
  ok(v.favorLedger[X].state === 'promised', 'F: favorLedger untouched (still promised)');
  ok(Game.migrateDeadPromises() === 0, 'G: second migration releases 0 (idempotent)');
  clearCase();

  // B. person-corpse naming vid.
  setOpenPromise();
  Game.state.corpses.push({ id: 'corpse_test', kind: 'villager', villagerId: X, dayDied: 5 });
  ok(Game.migrateDeadPromises() === 1, 'B: corpse case releases exactly 1');
  ok(v.promises[X].kept === 'released', 'B: promise kept=released');
  clearCase();

  // C. rosterChars dead under load conditions: no live data record to
  // shadow it (fresh page load re-injects rosterChars into data).
  setOpenPromise();
  const dataIdx = (Game.data.villagers || []).findIndex(r => r.id === X);
  const savedRec = dataIdx >= 0 ? Game.data.villagers.splice(dataIdx, 1)[0] : null;
  v.rosterChars = v.rosterChars || {};
  v.rosterChars[X] = { id: X, dead: true };
  let cReleased = -1;
  try { cReleased = Game.migrateDeadPromises(); } catch (e) { cReleased = -99; }
  ok(cReleased === 1, 'C: rosterChars-dead case releases exactly 1 (load conditions)',
    'got: ' + cReleased + ', deadMarked=' + (Game.deadMarked ? Game.deadMarked(X) : 'n/a'));
  ok(v.promises[X].kept === 'released', 'C: promise kept=released');
  if (savedRec) Game.data.villagers.push(savedRec);
  clearCase();

  // D. Guards.
  setOpenPromise();
  ok(Game.migrateDeadPromises() === 0, 'D: living holder with no death evidence is untouched');
  ok(v.promises[X].kept === false, 'D: living promise stays open');
  v.promises[X].kept = true;
  v.deathSeen[X] = 5;
  ok(Game.migrateDeadPromises() === 0, 'D: already-kept promise is untouched even with a death mark');
  ok(v.promises[X].kept === true, 'D: kept promise stays kept');
  clearCase();
  v.promises[bearer] = { goal: 'Share a meal', day: 1, kept: false, maker: bearer,
    favorId: 'gap13-bearer', favorTask: 'Share a meal', favorDeadline: 99 };
  v.deathSeen[bearer] = 5;
  ok(Game.migrateDeadPromises() === 0, 'D: bearer promise untouched despite a stray deathSeen mark');
  ok(v.promises[bearer].kept === false, 'D: bearer promise stays open');
  delete v.promises[bearer];
  delete v.deathSeen[bearer];
  clearCase();

  console.log(`\ntest-gap-batch13-deadpromises: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('FATAL: ' + (e && e.stack || e)); process.exit(1); });
