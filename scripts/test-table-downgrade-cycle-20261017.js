#!/usr/bin/env node
// test-table-downgrade-cycle-20261017.js — proof for the journey-endgame r15
// blank fill (2026-10-17).
//
// THE BLANK: tableFail's downgrade offer excluded only the CURRENT path, so
// a run that failed every door could cycle the same doors forever
// (measured: cascade seed s8921 — feared→defiant→assimilated→defiant→feared,
// defiant and feared each offered twice after failing). TABLE.md law 4 says
// failure RESOLVES the story — an unbounded failure loop is silent
// non-resolution. The fix: a failed door is spent (T.failedDoors, reset per
// sitting in tableScene); the downgrade offer never re-offers one; when no
// door remains the run resolves at rock-bottom (Assimilated on the table's
// terms, or the plain ending if Assimilated already failed).
//
// RED (before the fix): the second downgrade prompt re-offers the first
// failed door.
// GREEN (after): prompts shrink [b,c] -> [c] -> rock-bottom; no repeats;
// the all-failed run terminates with phase 'done'.
//
// Usage: node scripts/test-table-downgrade-cycle-20261017.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

function fail(msg) { console.error('FAIL: ' + msg); process.exit(1); }
function ok(msg) { console.log('ok: ' + msg); }

async function main() {
  const { Game } = await loadGame({ seed: 777, mode: 'downgrade-cycle-proof' });
  await setupGame(Game);
  Game.state.scholar.day = 95; // past the win-day floor

  // ---- rig: three fake earned doors + captured prompts ----
  const doors = [
    { id: 'a', name: 'Door A', earned: true, strength: 60 },
    { id: 'b', name: 'Door B', earned: true, strength: 50 },
    { id: 'c', name: 'Door C', earned: true, strength: 40 },
  ];
  Game.tableEarnedPaths = () => doors;
  const prompts = [];
  Game.tablePrompt = function (html, options, frame) {
    prompts.push({ frame, options: (options || []).map(o => o.id) });
    return null;
  };
  Game.save = function () { return true; };
  let wiped = false;
  Game.wipe = function () { wiped = true; };
  let runBeatCalls = 0;
  Game.tableRunBeat = function () { runBeatCalls++; };

  const T = Game.tableState();
  T.failedDoors = []; // as tableScene sets per sitting
  T.weakened = 0;

  const offered = () => (prompts.length ? prompts[prompts.length - 1].options : []);

  // ---- fail door a: offer must be [b, c], never a ----
  T.phase = 'challenge'; T.path = 'a'; T.beat = 1;
  Game.tableFail('unit test failure one');
  if (prompts.length !== 1) fail(`expected 1 downgrade prompt after first fail, got ${prompts.length}`);
  let o = offered();
  if (o.indexOf('downgrade:a') >= 0) fail('RED: failed door a re-offered in the first downgrade prompt');
  if (!(o.indexOf('downgrade:b') >= 0 && o.indexOf('downgrade:c') >= 0 && o.length === 2))
    fail(`first downgrade prompt should offer exactly [b, c], got ${JSON.stringify(o)}`);
  ok('after failing a, the offer is [b, c] — the failed door is spent');

  // ---- fail door b: offer must be [c] only ----
  T.phase = 'challenge'; T.path = 'b'; T.beat = 1;
  Game.tableFail('unit test failure two');
  if (prompts.length !== 2) fail(`expected 2 downgrade prompts after second fail, got ${prompts.length}`);
  o = offered();
  if (o.indexOf('downgrade:a') >= 0 || o.indexOf('downgrade:b') >= 0)
    fail(`RED: failed door re-offered in the second downgrade prompt: ${JSON.stringify(o)}`);
  if (!(o.length === 1 && o[0] === 'downgrade:c'))
    fail(`second downgrade prompt should offer exactly [c], got ${JSON.stringify(o)}`);
  ok('after failing b, the offer is [c] — no previously-failed door returns');

  // ---- fail door c: no doors remain -> rock-bottom (assimilated on the table's terms) ----
  T.phase = 'challenge'; T.path = 'c'; T.beat = 1;
  Game.tableFail('unit test failure three');
  if (prompts.length !== 2) fail(`rock-bottom must not prompt another downgrade offer (prompts=${prompts.length})`);
  if (T.path !== 'assimilated' || T.phase !== 'challenge')
    fail(`expected rock-bottom assimilated walk (path=${T.path} phase=${T.phase})`);
  ok('all doors failed -> rock-bottom: Assimilated on the table\'s terms');

  // ---- fail the rock-bottom assimilated walk: the plain ending, phase done ----
  T.path = 'assimilated';
  Game.tableFail('unit test failure four');
  if (T.phase !== 'done') fail(`expected phase 'done' after the rock-bottom fail, got '${T.phase}'`);
  if (!Game.over || !Game.won) fail('the plain ending must resolve the run (over && won)');
  if (!wiped) fail('the plain ending must wipe (run resolved, not stranded)');
  ok('failing the rock-bottom walk ends plainly: phase done, run resolved, never deleted mid-story');

  // ---- failedDoors accumulated across the sitting ----
  const fd = T.failedDoors || [];
  for (const d of ['a', 'b', 'c', 'assimilated'])
    if (fd.indexOf(d) < 0) fail(`failedDoors missing '${d}': ${JSON.stringify(fd)}`);
  ok(`failedDoors tracked the sitting: ${JSON.stringify(fd)}`);

  console.log('\nALL GREEN: the downgrade can no longer cycle — every failure resolves.');
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
