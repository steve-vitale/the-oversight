#!/usr/bin/env node
// scripts/test-defwound-diag.js — unit proof for analyzeDefwound
// (sim-defwound-a Stage 1, pure: synthetic rows, no harness).
// Drives every analyzer branch the Stage 1 verdict depends on:
// manufactured vs pre-wounded split, untagged exclusion, re-meet
// linkage (later row, same seq, any context), vKill finish,
// rounds-0 counting, hp-rise detection, and all four fate classes.
'use strict';
const { analyzeDefwound } = require('./policies/defwound-diag');
let pass = 0, fail = 0;
function eq(name, got, want) {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + ' got=' + g + ' want=' + w); }
}
// Rows: day, seq, mid, wave, raid, outcome, rounds, start/end fracs.
// d1: defender mFlee manufactured (0.50 -> 0.10, wave 1, line 0.25).
// d2: defender mFlee pre-wounded (0.10 -> 0.05, wave 1).
// d3: defender mFlee below-line, untagged (seq null).
// d4: defender vKill (not a wound event).
// d5: field mFlee manufactured (0.60 -> 0.12, wave 2, line 0.15).
// Re-meets of seq 11 (d1's entity): day 9 field mFlee rounds-0,
// day 20 raid vKill (finished). Re-meet of seq 12 (d2's entity):
// day 30 field mFlee (still below line, never finished).
// seq 13 (field-manufactured) never re-met.
const rows = [
  { day: 8, seq: 11, mid: 'tanuki', wave: 1, raid: true, context: 'raid', outcome: 'mFlee', rounds: 3, mHpStartFrac: 0.50, mHpEndFrac: 0.10, belowLineStart: false, belowLineEnd: true, manufactured: true, preWounded: false, rounds0: false },
  { day: 8, seq: 12, mid: 'tanuki', wave: 1, raid: true, context: 'raid', outcome: 'mFlee', rounds: 0, mHpStartFrac: 0.10, mHpEndFrac: 0.05, belowLineStart: true, belowLineEnd: true, manufactured: false, preWounded: true, rounds0: true },
  { day: 8, seq: null, mid: 'tanuki', wave: 1, raid: true, context: 'raid', outcome: 'mFlee', rounds: 2, mHpStartFrac: 0.80, mHpEndFrac: 0.20, belowLineStart: false, belowLineEnd: true, manufactured: true, preWounded: false, rounds0: false },
  { day: 9, seq: 14, mid: 'hushwolf', wave: 1, raid: true, context: 'raid', outcome: 'vKill', rounds: 4, mHpStartFrac: 1.00, mHpEndFrac: 0.00, belowLineStart: false, belowLineEnd: true, manufactured: false, preWounded: false, rounds0: false },
  { day: 10, seq: 15, mid: 'chorus', wave: 2, raid: false, context: 'field', outcome: 'mFlee', rounds: 2, mHpStartFrac: 0.60, mHpEndFrac: 0.12, belowLineStart: false, belowLineEnd: true, manufactured: true, preWounded: false, rounds0: false },
  { day: 9, seq: 11, mid: 'tanuki', wave: 1, raid: false, context: 'field', outcome: 'mFlee', rounds: 0, mHpStartFrac: 0.10, mHpEndFrac: 0.10, belowLineStart: true, belowLineEnd: true, manufactured: false, preWounded: true, rounds0: true },
  { day: 20, seq: 11, mid: 'tanuki', wave: 1, raid: true, context: 'raid', outcome: 'vKill', rounds: 2, mHpStartFrac: 0.10, mHpEndFrac: 0.00, belowLineStart: true, belowLineEnd: true, manufactured: false, preWounded: false, rounds0: false },
  { day: 30, seq: 12, mid: 'tanuki', wave: 1, raid: false, context: 'field', outcome: 'mFlee', rounds: 0, mHpStartFrac: 0.05, mHpEndFrac: 0.05, belowLineStart: true, belowLineEnd: true, manufactured: false, preWounded: true, rounds0: true },
];
const oldStore = { removals: [
  { day: 40, seq: 12, kind: 'monsterTurn-departure' },
  { day: 50, seq: 15, kind: 'player-fight-melt' },
] };
const finalPresent = [{ seq: 15 }];
const a = analyzeDefwound({ resolveFights: rows }, oldStore, finalPresent);
eq('defender fights', a.defender.fights, 5);
eq('defender mFlee below-line', a.defender.mFleeBelowLine, 3);
eq('defender manufactured', a.defender.manufactured, 2);
eq('defender pre-wounded', a.defender.preWounded, 1);
eq('defender untagged below-line', a.defender.untaggedBelowLine, 1);
eq('defender start-below-line', a.defender.startBelowLine, 2);
eq('field manufactured', a.field.manufactured, 1);
eq('remeet events (defender wounds, tagged)', a.remeet.events, 2);
eq('remeet distinct entities', a.remeet.distinctEntities, 2);
eq('remeet all events', a.remeet.all.events, 2);
eq('remeet all re-met', a.remeet.all.reMetAtLeastOnce, 2);
eq('remeet all rate', a.remeet.all.reMetRate, 1);
eq('remeet all total re-meets', a.remeet.all.totalReMeets, 3);
eq('remeet all finished', a.remeet.all.finishedEntities, 1);
eq('remeet all rounds-0 re-meets', a.remeet.all.rounds0ReMeets, 2);
eq('remeet manufactured events', a.remeet.manufactured.events, 1);
eq('remeet manufactured finished', a.remeet.manufactured.finishedEntities, 1);
eq('remeet pre-wounded finished', a.remeet.preWounded.finishedEntities, 0);
eq('remeet median days to first', a.remeet.all.medianDaysToFirst, 22);
eq('fates', a.fates, { 'finished-by-fight': 1, 'removed:monsterTurn-departure': 1 });
eq('fate detail seq 11', a.fateDetail.find(f => f.seq === 11).fate, 'finished-by-fight');
eq('fate detail seq 12', a.fateDetail.find(f => f.seq === 12).fate, 'removed:monsterTurn-departure');
// Still-present beats removal: seq 15 is field-only (not a defender
// wound), so it must NOT appear in defender fates; add a defender
// wound for it in a second analysis to prove the precedence.
const rows2 = rows.concat([
  { day: 5, seq: 15, mid: 'chorus', wave: 2, raid: true, context: 'raid', outcome: 'mFlee', rounds: 2, mHpStartFrac: 0.90, mHpEndFrac: 0.10, belowLineStart: false, belowLineEnd: true, manufactured: true, preWounded: false, rounds0: false },
]);
const a2 = analyzeDefwound({ resolveFights: rows2 }, oldStore, finalPresent);
eq('still-present beats removal', a2.fateDetail.find(f => f.seq === 15).fate, 'still-present');
// Vanished: a defender wound with no later row, no removal, not present.
const rows3 = rows.concat([
  { day: 60, seq: 99, mid: 'deer', wave: 1, raid: true, context: 'raid', outcome: 'mFlee', rounds: 1, mHpStartFrac: 0.70, mHpEndFrac: 0.20, belowLineStart: false, belowLineEnd: true, manufactured: true, preWounded: false, rounds0: false },
]);
const a3 = analyzeDefwound({ resolveFights: rows3 }, oldStore, finalPresent);
eq('vanished fate', a3.fateDetail.find(f => f.seq === 99).fate, 'vanished');
// HP rise: a later row starting above the previous end fraction.
const rows4 = [
  { day: 1, seq: 7, mid: 'x', wave: 1, raid: true, context: 'raid', outcome: 'mFlee', rounds: 1, mHpStartFrac: 0.90, mHpEndFrac: 0.10, belowLineStart: false, belowLineEnd: true, manufactured: true, preWounded: false, rounds0: false },
  { day: 2, seq: 7, mid: 'x', wave: 1, raid: false, context: 'field', outcome: 'mFlee', rounds: 1, mHpStartFrac: 0.50, mHpEndFrac: 0.40, belowLineStart: false, belowLineEnd: false, manufactured: false, preWounded: false, rounds0: false },
];
const a4 = analyzeDefwound({ resolveFights: rows4 }, null, []);
eq('hp rise detected', a4.remeet.all.hpRiseEvents, 1);
console.log(`\ntest-defwound-diag: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
