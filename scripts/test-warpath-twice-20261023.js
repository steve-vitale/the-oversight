#!/usr/bin/env node
// test-warpath-twice-20261023.js — journey-endgame r43 blank fix (lane B).
//
// BEFORE: two kills of the same monster by the same killer on the same day
// voiced as the identical sentence twice — seed 85014's audit:
// "On day 108, Roman put down Big Loud. On day 108, Roman put down Big Loud
// — and 3 more tooths after." The r39 engagements branch already dedupes
// ("faced X twice"); the kills branch did not.
//
// AFTER: the same tooth twice back-to-back names ONCE with a count —
// "On day 108, you put down Big Loud twice. 3 more tooths after that."
// Distinct kills are untouched.
//
// Drives the real Game.tableDeedLines() (src/js/table.js, pure render of
// tableDeedRecords) on a live setupGame scholar with a crafted waveKillLog.
// Zero new RNG draws; the framing pick is a dedicated mulberry32 stream.
// Run: node scripts/test-warpath-twice-20261023.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; failures.push(name); console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

(async () => {
  const { Game } = await loadGame({ seed: 85014, mode: 'warpath-twice', fullTelemetry: false });
  await setupGame(Game);
  Game.save = () => {}; Game.wipe = () => {};

  const w4 = (Game.data.monsters || []).filter(m => (m.wave | 0) === 4).map(m => m.id);
  ok(w4.length >= 3, 'fixture: >=3 wave-4 monster ids', w4.length + ' found');
  const [mA, mB, mC] = w4;

  console.log('— 1. same tooth twice back-to-back: named once with a count —');
  Game.state.waveKillLog = [
    { mid: mA, d: 108, by: 'p', via: 'fight', w: 4 },
    { mid: mA, d: 108, by: 'p', via: 'fight', w: 4 },
    { mid: mB, d: 100, by: 'p', via: 'fight', w: 4 },
    { mid: mC, d: 95, by: 'p', via: 'fight', w: 4 },
    { mid: mB, d: 90, by: 'p', via: 'fight', w: 4 },
  ];
  const lines = Game.tableDeedLines().join('\n');
  const warLine = lines.split('\n').find(l => l.indexOf('◈ THE WAR PATH') === 0) || '';
  ok(/twice\./.test(warLine), 'double kill voiced with "twice"', warLine.slice(0, 140));
  // the identical sentence must not appear twice
  const firstSentence = warLine.split('twice.')[0];
  const noun = firstSentence.split('put down ')[1] || '';
  const occurrences = noun ? warLine.split(noun).length - 1 : 0;
  ok(occurrences <= 2, 'monster noun not stuttered (named in "twice" + remainder only)', `occurrences=${occurrences}`);
  ok(/3 more tooths after that/.test(warLine), 'remainder count honest (3 more)', warLine.slice(0, 200));

  console.log('— 2. distinct kills: untouched —');
  Game.state.waveKillLog = [
    { mid: mA, d: 108, by: 'p', via: 'fight', w: 4 },
    { mid: mB, d: 100, by: 'p', via: 'fight', w: 4 },
    { mid: mC, d: 95, by: 'p', via: 'fight', w: 4 },
  ];
  const lines2 = Game.tableDeedLines().join('\n');
  const warLine2 = lines2.split('\n').find(l => l.indexOf('◈ THE WAR PATH') === 0) || '';
  ok(!/twice\./.test(warLine2), 'no "twice" for distinct kills', warLine2.slice(0, 140));
  ok(/1 more tooth after\./.test(warLine2), 'remainder count honest (1 more)', warLine2.slice(0, 200));

  console.log('— 3. exactly two identical kills: "twice", no remainder —');
  Game.state.waveKillLog = [
    { mid: mA, d: 108, by: 'p', via: 'fight', w: 4 },
    { mid: mA, d: 108, by: 'p', via: 'fight', w: 4 },
  ];
  const lines3 = Game.tableDeedLines().join('\n');
  const warLine3 = lines3.split('\n').find(l => l.indexOf('◈ THE WAR PATH') === 0) || '';
  ok(/twice\./.test(warLine3), 'two identical kills voiced with "twice"', warLine3.slice(0, 140));
  ok(!/more tooth/.test(warLine3), 'no remainder clause for exactly two', warLine3.slice(0, 200));

  console.log(`\n${pass} pass, ${fail} fail`);
  if (failures.length) { console.log('FAILURES:\n' + failures.join('\n')); process.exit(1); }
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });
