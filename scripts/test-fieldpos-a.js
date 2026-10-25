#!/usr/bin/env node
// scripts/test-fieldpos-a.js — unit proof for the fieldpos analyzer
// (sim-fieldpos-a). Pure: synthetic rows only, no Game, no sim.
// Run: node scripts/test-fieldpos-a.js  (exit 1 on any failure)
'use strict';
const { analyzeFieldpos, verdictOf } = require('./policies/fieldpos-diag');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}
function approx(a, b, tol) { return a != null && b != null && Math.abs(a - b) <= tol; }

// Synthetic corpus: two wounded entities + one healthy + one killed.
// seq 1: defender-manufactured (raid fight d5, 1.0 -> 0.10), then
//   field re-meets d6 at Haven (dist 0), d9 dist 1, d20 dist 0.
// seq 2: field-manufactured (field fight d3, 1.0 -> 0.20), then
//   field re-meets d8 dist 4, d12 dist 3.
// seq 3: arrived-wounded (field fight d4 starts below line 0.10,
//   ends 0.10), then field re-meet d10 dist 2.
// seq 4: vKill at full health (never a wound event, never re-met).
// seq 5: field fight with tx null (position gap row, counted).
// seq 6: vFlee-manufactured wound (field fight, villager fled, the
//   monster keeps a below-line wound) — a wound event by the
//   living-entity rule; then one field re-meet at dist 5.
function row(day, seq, raid, outcome, startFrac, endFrac, tx, ty, hx, hy) {
  const bl = 0.25;
  return {
    day: day, vid: 'v1', seq: seq, mid: 'test_beast', wave: 1, raid: raid,
    context: raid ? 'raid' : 'field',
    mHpStartFrac: startFrac, mHpEndFrac: endFrac, outcome: outcome,
    rounds: outcome === 'mFlee' && startFrac < bl ? 0 : 2,
    belowLineStart: startFrac != null && startFrac < bl,
    belowLineEnd: endFrac != null && endFrac < bl,
    manufactured: startFrac != null && endFrac != null && startFrac >= bl && endFrac < bl,
    preWounded: startFrac != null && endFrac != null && startFrac < bl && endFrac < bl,
    tx: tx, ty: ty, txPost: tx, tyPost: ty, moved: false,
    hx: hx, hy: hy,
    dist: (tx != null && ty != null) ? (Math.abs(tx - hx) + Math.abs(ty - hy)) : null,
    atHaven: tx != null && ty != null && (Math.abs(tx - hx) + Math.abs(ty - hy)) === 0,
    lingering: false,
  };
}
const HX = 4, HY = 4;
const rows = [
  row(3, 2, false, 'mFlee', 1.0, 0.20, 8, 4, HX, HY),   // seq2 field-manufactured, dist 4
  row(4, 3, false, 'mFlee', 0.10, 0.10, 6, 4, HX, HY),   // seq3 arrived-wounded, dist 2
  row(5, 1, true, 'mFlee', 1.0, 0.10, 4, 4, HX, HY),    // seq1 defender-manufactured, dist 0 (raid)
  row(5, 4, false, 'vKill', 1.0, 0.0, 5, 5, HX, HY),    // seq4 killed outright — NOT a wound event
  row(6, 1, false, 'mFlee', 0.10, 0.10, 4, 4, HX, HY),   // seq1 field re-meet, dist 0
  row(8, 2, false, 'mFlee', 0.20, 0.20, 8, 4, HX, HY),   // seq2 field re-meet, dist 4
  row(9, 1, false, 'mFlee', 0.10, 0.10, 5, 4, HX, HY),   // seq1 field re-meet, dist 1
  row(10, 3, false, 'mFlee', 0.10, 0.10, 6, 4, HX, HY),  // seq3 field re-meet, dist 2
  row(12, 2, false, 'mFlee', 0.20, 0.20, 7, 4, HX, HY),  // seq2 field re-meet, dist 3
  row(20, 1, false, 'mFlee', 0.10, 0.10, 4, 4, HX, HY),  // seq1 field re-meet, dist 0
  row(21, 5, false, 'mFlee', 1.0, 0.90, null, null, HX, HY), // seq5 healthy fight, no position
  row(22, 6, false, 'vFlee', 1.0, 0.20, 9, 4, HX, HY),   // seq6 vFlee-manufactured, dist 5
  row(23, 6, false, 'mFlee', 0.20, 0.20, 9, 4, HX, HY),  // seq6 field re-meet, dist 5
];
const a = analyzeFieldpos(rows, 30);

check('fight counts', a.fights === 13 && a.raidFights === 1 && a.fieldFights === 12, a);
check('wounded entities = 4 (vKill excluded, vFlee included)', a.woundedEntities === 4, a.woundedEntities);
check('first-wound sources', a.firstWoundSourceCounts['raid'] === 1
  && a.firstWoundSourceCounts['field'] === 2
  && a.firstWoundSourceCounts['arrived-wounded'] === 1, a.firstWoundSourceCounts);
check('field re-meets by source', a.fieldReMeets === 7
  && a.fieldReMeetsBySource['raid'] === 3 && a.fieldReMeetsBySource['field'] === 3
  && a.fieldReMeetsBySource['arrived-wounded'] === 1, a.fieldReMeetsBySource);
check('raid fight itself is not a re-meet', a.fieldReMeetsBySource['raid'] === 3, a.fieldReMeetsBySource);
check('defender-first re-meet positions (0,1,0)', a.posBySource['raid'].n === 3
  && approx(a.posBySource['raid'].atHavenShare, 2 / 3, 1e-9) && a.posBySource['raid'].median === 0, a.posBySource['raid']);
check('field-first re-meet positions (4,3,5)', a.posBySource['field'].n === 3
  && a.posBySource['field'].atHavenShare === 0 && a.posBySource['field'].median === 4, a.posBySource['field']);
check('missing position counted', a.fightsMissingPos === 1 && a.fightsWithPos === 12, a);
check('raid at-Haven sanity', a.raidPos.atHavenShare === 1, a.raidPos);
check('exposure seq1: 3 re-meets over 25 days (d5->d30)', approx(a.exposureBySource['raid'].meanReMeetsPerDayAlive, 3 / 25, 1e-9), a.exposureBySource['raid']);
check('exposure field source: seq2 2/27 + seq6 1/8, mean of rates', approx(a.exposureBySource['field'].meanReMeetsPerDayAlive, ((2 / 27) + (1 / 8)) / 2, 1e-9), a.exposureBySource['field']);

// Verdict branches (synthetic positions/exposures, not the corpus).
check('verdict lingering-confirmed', verdictOf(
  { atHavenShare: 0.6, median: 0 }, { atHavenShare: 0.2, median: 3 }, 0.5, 0.1
).verdict === 'lingering-confirmed');
check('verdict counting-structure-confirmed', verdictOf(
  { atHavenShare: 0.30, median: 2 }, { atHavenShare: 0.32, median: 2 }, 0.10, 0.09
).verdict === 'counting-structure-confirmed');
check('verdict lingering-refuted (neither leg)', verdictOf(
  { atHavenShare: 0.30, median: 2 }, { atHavenShare: 0.32, median: 2 }, 0.20, 0.05
).verdict === 'lingering-refuted');
check('verdict lingering-refuted (shares far apart, no clustering)', verdictOf(
  { atHavenShare: 0.10, median: 4 }, { atHavenShare: 0.40, median: 2 }, 0.10, 0.10
).verdict === 'lingering-refuted');

console.log(`\ntest-fieldpos-a: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
