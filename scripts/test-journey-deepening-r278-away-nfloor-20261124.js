// test-journey-deepening-r278-away-nfloor-20261124.js -- Q3-AWAY n-floor
// proof (r278 prereg): the A2 share bar now reads THIN-PROBE when total
// servings < 10 (was < 3). A share verdict on fewer than 10 servings
// overstates: r272 read REPETITIVE at 4/6 over a 4-variant pool, r275
// read VARIED at 0.44 on n=9. This test proves the floor change does
// exactly that and nothing else:
//   A. r272 shape (6 servings, 4/2 split): OLD analyzer says REPETITIVE,
//      NEW analyzer says THIN-PROBE.
//   B. Full r275 corpus on disk (11 servings): BOTH analyzers say VARIED
//      with identical totals — the floor changes no verdict at n>=10.
//   C. Boundary: 9 servings at a 5/4 split -> THIN-PROBE under NEW;
//      10 servings at a 5/5 split -> REPETITIVE under NEW (floor is
//      < 10, not <= 10).
// Run: node scripts/test-journey-deepening-r278-away-nfloor-20261124.js
// Exits non-zero on any failure; prints PASS/FAIL per case.
'use strict';
const fs = require('fs');
const path = require('path');
const OLD = require('./analyze-journey-deepening-r275-20261123.js');
const NEW = require('./analyze-journey-deepening-r278-20261124.js');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name + (extra ? ' :: ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

// The four away-line wordings, verbatim from the analyzer patterns.
const OUTROAD = '"I\'m out on the road, away from Haven — no dawn meet while I\'m out, I\'m afraid. Catch me when I\'m back and we\'ll set it then."';
const DAWNMEET = '"Out on the road, away from Haven. A dawn meet\'s not something I can promise while I\'m out — when I\'m back, find me, and we\'ll set it then."';
const WAIT = '"Wait — I\'m away from Haven, out on the road. I can\'t promise a dawn meet while I\'m out — find me when I\'m back, and we\'ll set it then."';
const RIGHTNOW = '"Wait — I\'m away from Haven right now, out on the road. I can\'t promise a dawn meet from out here — find me when I\'m back and we\'ll set it then."';

function sitting(seed, day, vid, lines) {
  return { seed, day, vid, text: lines.map(l => 'THEM: ' + l).join('\n') };
}

// A. r272 shape: 6 servings, 4 outroad / 2 dawnmeet, one per sitting.
const r272shape = [
  sitting(1, 45, 'a', [OUTROAD]), sitting(1, 60, 'b', [OUTROAD]),
  sitting(2, 45, 'c', [OUTROAD]), sitting(2, 60, 'd', [OUTROAD]),
  sitting(3, 45, 'e', [DAWNMEET]), sitting(3, 60, 'f', [DAWNMEET]),
];
const oldA = OLD.summarizeAwayLineVariety(r272shape);
const newA = NEW.summarizeAwayLineVariety(r272shape);
check('A old analyzer reads r272 shape REPETITIVE', oldA.verdict === 'REPETITIVE', JSON.stringify({ total: oldA.total, verdict: oldA.verdict }));
check('A new analyzer reads r272 shape THIN-PROBE', newA.verdict === 'THIN-PROBE', JSON.stringify({ total: newA.total, verdict: newA.verdict }));
check('A totals agree between analyzers', oldA.total === 6 && newA.total === 6, `old=${oldA.total} new=${newA.total}`);

// B. Full r275 corpus on disk: both analyzers, identical inputs.
const EVIDIR23 = path.join(__dirname, '..', '..', '..', 'goals', 'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-11-23');
const transRe = /^journey-deepening-r275-transcript-(\d+)-day(\d+)-(.+)\.txt$/;
const corpus = [];
for (const f of fs.readdirSync(EVIDIR23).filter(f => transRe.test(f)).sort()) {
  const m = transRe.exec(f);
  corpus.push({ seed: parseInt(m[1], 10), day: parseInt(m[2], 10), vid: m[3], text: fs.readFileSync(path.join(EVIDIR23, f), 'utf8') });
}
check('B r275 corpus loads transcripts', corpus.length >= 100, `n=${corpus.length}`);
const oldB = OLD.summarizeAwayLineVariety(corpus);
const newB = NEW.summarizeAwayLineVariety(corpus);
check('B old analyzer on r275 corpus is VARIED', oldB.verdict === 'VARIED', JSON.stringify({ total: oldB.total, verdict: oldB.verdict }));
check('B new analyzer on r275 corpus is VARIED', newB.verdict === 'VARIED', JSON.stringify({ total: newB.total, verdict: newB.verdict }));
check('B totals/patterns identical between analyzers', oldB.total === newB.total && JSON.stringify(oldB.patternCounts) === JSON.stringify(newB.patternCounts),
  `old total=${oldB.total} new total=${newB.total} old=${JSON.stringify(oldB.patternCounts)} new=${JSON.stringify(newB.patternCounts)}`);
check('B r275 corpus total is 11 (committed log said 9 — stale read, see prereg)', newB.total === 11, `total=${newB.total}`);

// C. Boundary: 9 servings -> THIN-PROBE; 10 servings at 5/5 -> REPETITIVE.
const nine = [];
for (let i = 0; i < 5; i++) nine.push(sitting(1, 40 + i, 'v' + i, [OUTROAD]));
for (let i = 0; i < 4; i++) nine.push(sitting(2, 40 + i, 'w' + i, [DAWNMEET]));
const newC9 = NEW.summarizeAwayLineVariety(nine);
check('C 9 servings at 5/4 reads THIN-PROBE under new', newC9.verdict === 'THIN-PROBE', JSON.stringify({ total: newC9.total, verdict: newC9.verdict }));
const ten = nine.concat([sitting(3, 50, 'x', [DAWNMEET])]);
const newC10 = NEW.summarizeAwayLineVariety(ten);
check('C 10 servings at 5/5 reads REPETITIVE under new', newC10.verdict === 'REPETITIVE', JSON.stringify({ total: newC10.total, verdict: newC10.verdict }));
const oldC10 = OLD.summarizeAwayLineVariety(ten);
check('C 10 servings at 5/5 reads REPETITIVE under old too (floor is the only change)', oldC10.verdict === 'REPETITIVE', JSON.stringify({ total: oldC10.total, verdict: oldC10.verdict }));
// Sanity: the other two wordings still classify (no pattern loss in the fork).
const all4 = [sitting(1, 45, 'a', [OUTROAD]), sitting(1, 60, 'b', [DAWNMEET]), sitting(2, 45, 'c', [WAIT]), sitting(2, 60, 'd', [RIGHTNOW])];
const newAll4 = NEW.summarizeAwayLineVariety(all4);
check('C all four wordings classify under new', newAll4.total === 4 && newAll4.distinct === 4, JSON.stringify({ total: newAll4.total, distinct: newAll4.distinct }));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
