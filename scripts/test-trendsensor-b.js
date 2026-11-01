#!/usr/bin/env node
// test-trendsensor-b.js — proof test for sim-trendsensor-b (DIAG ONLY).
// Pure unit checks for the trend rule (no game load, no RNG), plus an
// optional --live replay check that reads the committed depositgate armed
// pilot corpus and asserts census validity + analyzer shape only.
// The --live check NEVER asserts the prereg GO bars: the bars are judged
// in the evidence file, not baked into the test.
// Usage: node scripts/test-trendsensor-b.js [--live]
'use strict';
const fs = require('fs');
const path = require('path');
const { isTrendDay, analyzeSeed, extractSense } = require('./analyze-trendsensor-b');

let checks = 0, failures = 0;
function check(name, cond, extra) {
  checks++;
  if (cond) { console.log('ok ' + checks + ' ' + name); }
  else { failures++; console.log('FAIL ' + checks + ' ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}
// Build evening rows from a pantry list; engaged defaults true.
function rowsFrom(pantry, engaged) {
  return pantry.map((p, i) => ({
    loopDay: i + 1, pantryKcal: p,
    gateEngaged: engaged ? engaged[i] : true,
    freshDays: 10, hungryStreak: 0, alive: 10,
  }));
}

// 1. Slide shape: flat history, then a 5-day fall with 3 consecutive falls.
//    Series: 6x20000, then 19400, 18202, 14811, 12900, 12460, 9518.
//    Row for 12900 is index 9: P(9)=12900 <= 0.80*P(4)=16000, and falls at
//    indices 7,8,9 (19400->18202->14811->12900... wait: falls ending at 9
//    are deltas 7,8,9: 20000->19400, 19400->18202, 18202->14811? No:
//    index: 0-5 = 20000, 6 = 19400, 7 = 18202, 8 = 14811, 9 = 12900.
//    Falls ending at 9: delta9 = 12900-14811 <0, delta8 = 14811-18202 <0,
//    delta7 = 18202-19400 <0 -> 3 falls. 5-day: P9 vs P4 = 20000 -> 12900
//    = 35.5% fall -> trend day at index 9.
const slide = rowsFrom([20000, 20000, 20000, 20000, 20000, 20000, 19400, 18202, 14811, 12900, 12460, 9518]);
check('slide: index 9 is a trend day', isTrendDay(slide, 9) === true);
check('slide: index 8 is also a trend day (14811 vs 20000 = 25.9% fall, 3 falls)', isTrendDay(slide, 8) === true);
// Correct the record: index 8 also qualifies (5-day window P3=20000).
// First trend day in the run is therefore index 8, not 9 — the analyzer
// takes the FIRST, which is the conservative-earliest reading.
const slideSeed = { seed: 99999, arm: 'armed', endReason: 'village-lost', daysAlive: 13,
  rows: slide.concat([{ loopDay: 13, pantryKcal: 4000, gateEngaged: false, freshDays: 2, hungryStreak: 0, alive: 9 }]) };
const slideA = analyzeSeed(slideSeed);
check('slide: trendDay is loopDay 9 (index 8)', slideA.trendDay === 9, slideA.trendDay);
check('slide: level stand-down is loopDay 13', slideA.levelStandDown === 13, slideA.levelStandDown);
check('slide: earliness is 4', slideA.earliness === 4, slideA.earliness);
check('slide: census valid (13 rows == daysAlive)', slideA.censusValid === true);

// 2. Threshold boundary: exactly 20% fall triggers, 19% does not.
const exact = rowsFrom([10000, 10000, 10000, 10000, 10000, 10000, 9000, 8500, 8000]);
check('boundary: exactly 20% fall at index 8 triggers', isTrendDay(exact, 8) === true);
const under = rowsFrom([10000, 10000, 10000, 10000, 10000, 10000, 9000, 8500, 8100]);
check('boundary: 19% fall at index 8 does not trigger', isTrendDay(under, 8) === false);

// 3. A rise breaks the 3-fall chain even with a big 5-day fall.
const broken = rowsFrom([20000, 20000, 20000, 20000, 20000, 20000, 15000, 16000, 14000]);
check('broken chain: rise at index 7 blocks trend at index 8', isTrendDay(broken, 8) === false);

// 4. Flat / rising series never trends.
const flat = rowsFrom([10000, 10000, 10100, 10200, 10300, 10400, 10500, 10600, 10700]);
check('flat/rising: no trend day anywhere', flat.every((_, i) => !isTrendDay(flat, i)));

// 5. Null pantry breaks the chain and is never a trend day.
const withNull = rowsFrom([20000, 20000, 20000, 20000, 20000, 20000, 19400, 18202, null, 12900]);
check('null: index 9 is not a trend day (null in window)', isTrendDay(withNull, 9) === false);

// 6. Disengaged evenings never count (rule iv).
const dis = rowsFrom([20000, 20000, 20000, 20000, 20000, 20000, 19400, 18202, 14811], [true, true, true, true, true, true, true, true, false]);
check('disengaged: index 8 blocked by gateEngaged false', isTrendDay(dis, 8) === false);

// 7. Survivor with a trend day in its final run counts as false stand-down;
//    survivor ending engaged with no trend day does not.
const survFalse = { seed: 88888, arm: 'armed', endReason: 'survived', daysAlive: 9, rows: slide.slice(0, 9) };
check('survivor with trend day counts false', analyzeSeed(survFalse).falseStandDown === true);
const survClean = { seed: 77777, arm: 'armed', endReason: 'survived', daysAlive: 9, rows: flat };
check('survivor without trend day is not false', analyzeSeed(survClean).falseStandDown === false);

// 8. Seed ending engaged has no level stand-down (earliness null).
const endsEngaged = { seed: 66666, arm: 'armed', endReason: 'survived', daysAlive: 12, rows: slide };
check('ends-engaged: level stand-down null', analyzeSeed(endsEngaged).levelStandDown === null);
check('ends-engaged: earliness null', analyzeSeed(endsEngaged).earliness === null);

// 9. Sense extraction picks the right lines and nothing else.
const senseSeed = { sayLines: [
  { day: 12, line: 'Mara checks the pantry before heading out — the shelves are full, ~9 days of fresh on hand' },
  { day: 13, line: 'Nikolai taps the pantry door — full to bursting — and keeps the day\'s share in hand.' },
  { day: 14, line: 'Ordinary line about foraging.' },
  { day: 22, line: 'Leo starved. Slowly. Nobody eats much tonight. The pot stays full and nobody touches it.' },
] };
const sense = extractSense(senseSeed);
check('sense: 2 full lines found', sense.fullLines.length === 2, sense.fullLines.length);
check('sense: pot line found on day 22', sense.potLine != null && sense.potLine.day === 22, sense.potLine);

// 10. Census-validity: rows != daysAlive, or non-boolean gateEngaged, fails.
const badCount = { seed: 55555, arm: 'armed', endReason: 'survived', daysAlive: 5, rows: flat.slice(0, 3) };
check('validity: row count mismatch fails', analyzeSeed(badCount).censusValid === false);
const badFlag = { seed: 44444, arm: 'armed', endReason: 'survived', daysAlive: 1,
  rows: [{ loopDay: 1, pantryKcal: 10000, gateEngaged: null }] };
check('validity: non-boolean gateEngaged fails', analyzeSeed(badFlag).censusValid === false);

if (process.argv.includes('--live')) {
  const corpus = path.join(__dirname, '..', 'evidence', '2026-11-01', 'sim-depositgate-b-armed.jsonl');
  const lines = fs.readFileSync(corpus, 'utf8').split('\n').filter((l) => l.trim());
  check('live: pilot corpus has 8 seed lines', lines.length === 8, lines.length);
  const seeds = lines.map((l) => JSON.parse(l));
  check('live: all pilot seeds census-valid', seeds.every((s) => analyzeSeed(s).censusValid), seeds.map((s) => s.seed + ':' + analyzeSeed(s).censusValid));
  check('live: pilot seeds are 51101-51108 armed', seeds.map((s) => s.seed).join(',') === '51101,51102,51103,51104,51105,51106,51107,51108' && seeds.every((s) => s.arm === 'armed'));
  const a51101 = analyzeSeed(seeds[0]);
  console.log('live 51101: end=' + a51101.endReason + ' trendDay=' + a51101.trendDay +
    ' levelStandDown=' + a51101.levelStandDown + ' earliness=' + a51101.earliness +
    ' finalRun=' + JSON.stringify(a51101.finalRun));
  for (const s of seeds) {
    const a = analyzeSeed(s);
    console.log('live seed ' + a.seed + ': end=' + a.endReason + ' trendDay=' + a.trendDay +
      ' levelStandDown=' + a.levelStandDown + ' earliness=' + a.earliness + ' false=' + a.falseStandDown);
  }
}

console.log('test-trendsensor-b: ' + checks + ' checks, ' + failures + ' failures');
process.exit(failures ? 1 : 0);
