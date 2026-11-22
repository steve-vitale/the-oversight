#!/usr/bin/env node
'use strict';
// Proof: the r264 driver instruments count no-path failures by source and
// dump the oracle ctx (journey-crisis r264).
//
// THE GAPS (r263 run note, corrected at r264 run start):
// (1) "No path there." has exactly two emitters — tbPlayerMove
// (game.js:38213, fight) and beginPathWalk (game.js:15115, travel) — but
// the analyzer counted sayLines, so a travel stall (r263 seed 14598 d94:
// 236 failed path-walks, no fight) read as a fight stall. The wraps count
// failed calls per source per day, and capture the caller stack when a
// source first reaches 10 failures on a day.
// (2) fled_unreachable was ABSENT from the per-seed JSONs (the driver
// never dumped the oracle ctx), so r263's "flee never fired" rested on
// absence. mergePolicyCtx sums the per-day ctx counters into run totals
// and appends the day's _stuckTrace entries.
//
// GREEN: recordNopath counts per source/day and stores the stack exactly
// at the 10th failure; installNopathWraps counts stubbed failures, never
// counts successes, preserves returns, and reports false when the methods
// are absent; mergePolicyCtx sums counters across days, appends trace
// entries, and caps the appended trace at 5000 (overflow counted).
//
// The driver module is required, never run (require.main guard). The
// wraps are exercised against stubbed Game methods on a loaded game, so
// this proves the instrument logic, not the game geometry (already
// proven by the game's own movement tests).
// Exits nonzero on failure.
const assert = require('assert');
const K = require('./godpath/lib');
const driver = require('./journey-crisis-r264-delayed-20261122');

let pass = 0;
function check(name, condition, extra) {
  assert(condition, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

function freshRec() {
  return { nopathBySource: { fight: {}, travel: {} }, nopathStacks: [], oracleCtx: {}, stuckTrace: [], stuckTraceDropped: 0 };
}

async function main() {
  // ---- 1. recordNopath: counts per source/day, stack at the 10th. ----
  {
    const rec = freshRec();
    for (let i = 1; i <= 9; i++) driver.recordNopath(rec, 'fight', 12, 'stack-' + i);
    check('record: 9 failures counted, no stack stored yet',
      rec.nopathBySource.fight[12] === 9 && rec.nopathStacks.length === 0,
      JSON.stringify(rec.nopathBySource.fight) + ' stacks=' + rec.nopathStacks.length);
    driver.recordNopath(rec, 'fight', 12, 'Error\n    at Game.tbPlayerMove (game.js:38213:1)\n    at callerA (oracleV2.js:1:1)\n    at callerB (oracleV2.js:2:2)');
    check('record: 10th failure stores the stack with caller frames',
      rec.nopathStacks.length === 1 && rec.nopathStacks[0].source === 'fight' && rec.nopathStacks[0].day === 12
      && rec.nopathStacks[0].stack[0].indexOf('tbPlayerMove') !== -1
      && rec.nopathStacks[0].stack[1].indexOf('callerA') !== -1,
      JSON.stringify(rec.nopathStacks));
    driver.recordNopath(rec, 'fight', 12, 'Error\n    at other');
    check('record: 11th failure stores no second stack for the same day',
      rec.nopathStacks.length === 1 && rec.nopathBySource.fight[12] === 11,
      'stacks=' + rec.nopathStacks.length);
    driver.recordNopath(rec, 'travel', 12, 'Error\n    at Game.beginPathWalk');
    check('record: sources are counted separately',
      rec.nopathBySource.travel[12] === 1 && rec.nopathBySource.fight[12] === 11,
      JSON.stringify(rec.nopathBySource));
    driver.recordNopath(rec, 'fight', 13, '');
    check('record: days are counted separately',
      rec.nopathBySource.fight[13] === 1, JSON.stringify(rec.nopathBySource.fight));
  }

  // ---- 2. recordNopath: the stack list is capped at 60. ----
  {
    const rec = freshRec();
    for (let d = 1; d <= 61; d++) {
      for (let i = 1; i <= 10; i++) driver.recordNopath(rec, 'fight', d, i === 10 ? 'Error\n    at x' : '');
    }
    check('record: 61 stall days attempt 61 stacks, capped at 60',
      rec.nopathStacks.length === 60, 'stacks=' + rec.nopathStacks.length);
  }

  // ---- 3. installNopathWraps: counts failures, never successes, no double-count. ----
  {
    const Game = await K.load({ seed: parseInt(process.env.SEED || '4242', 10) });
    K.newRun(Game);
    const rec = freshRec();
    // Stub the two methods BEFORE installing, so the wrap proves its own
    // counting against known outcomes (not the game geometry).
    Game.beginPathWalk = () => [1, 2, 3]; // always succeeds
    Game.tbPlayerMove = () => false; // always fails
    check('install: wraps install on a game exposing both methods',
      driver.installNopathWraps(Game, rec) === true, '');
    const day = ((Game.state || {}).scholar || {}).day || 0;
    const pw = Game.beginPathWalk(1, 1);
    check('install: a successful beginPathWalk is not counted and its return is preserved',
      Array.isArray(pw) && pw.length === 3 && Object.keys(rec.nopathBySource.travel).length === 0,
      'pw=' + JSON.stringify(pw));
    const mv = Game.tbPlayerMove(3, 3);
    check('install: a failing move is counted as fight and its false return is preserved',
      mv === false && rec.nopathBySource.fight[day] === 1,
      'mv=' + mv + ' ' + JSON.stringify(rec.nopathBySource.fight));
    check('install: reinstalling does not double-wrap (second install is a no-op)',
      driver.installNopathWraps(Game, rec) === true, '');
    Game.tbPlayerMove(3, 3);
    check('install: after a reinstall the same failure still counts once',
      rec.nopathBySource.fight[day] === 2, JSON.stringify(rec.nopathBySource.fight));
  }

  // ---- 4. installNopathWraps: absent methods report false. ----
  {
    const rec = freshRec();
    check('install: a game without the methods reports false',
      driver.installNopathWraps({}, rec) === false, '');
  }

  // ---- 5. mergePolicyCtx: sums counters, appends the trace, caps it. ----
  {
    const rec = freshRec();
    driver.mergePolicyCtx(rec, { fled: 1, fled_unreachable: 0, struck: 3, _stuckTrace: [{ k: 'start', d: 5, key: 'a@d5', s: 0 }] });
    driver.mergePolicyCtx(rec, { fled: 2, fled_unreachable: 1, struck: 4, engagedFavored: 1, _stuckTrace: [{ k: 'inc', d: 6, key: 'a@d6', s: 1 }, { k: 'flee', d: 6, key: 'a@d6', s: 3 }] });
    check('merge: counters sum across days (fled 1+2, unreachable 0+1, struck 3+4)',
      rec.oracleCtx.fled === 3 && rec.oracleCtx.fled_unreachable === 1 && rec.oracleCtx.struck === 7
      && rec.oracleCtx.engagedFavored === 1,
      JSON.stringify(rec.oracleCtx));
    check('merge: trace entries append in day order',
      rec.stuckTrace.length === 3 && rec.stuckTrace[0].k === 'start' && rec.stuckTrace[2].k === 'flee',
      JSON.stringify(rec.stuckTrace));
    check('merge: a null ctx is a no-op, not a crash',
      (() => { driver.mergePolicyCtx(rec, null); return rec.oracleCtx.fled === 3; })(), '');
    // Cap: 6000 entries offered, 5000 kept. The rec already held 3 trace
    // entries from the merges above, so room was 4997 and the overflow
    // counted is 6000 - 4997 = 1003.
    const big = [];
    for (let i = 0; i < 6000; i++) big.push({ k: 'start', d: 7, key: 'b@d7', s: 0 });
    driver.mergePolicyCtx(rec, { _stuckTrace: big });
    check('merge: the appended trace caps at 5000 with the overflow counted',
      rec.stuckTrace.length === 5000 && rec.stuckTraceDropped === 1003,
      'len=' + rec.stuckTrace.length + ' dropped=' + rec.stuckTraceDropped);
  }

  console.log(`\nRESULT: ${pass} pass, 0 fail`);
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
