#!/usr/bin/env node
// scripts/test-tableline-a.js — sim-tableline-a proof (DIAG, zero src/js).
// Re-runs the analyzer over the harvested corpus in
// evidence/2026-10-26/perseed-sim-tableline-a/ and asserts the exact
// counts this arm reports. If the corpus changes, the proof fails —
// the numbers below are the report, not a tolerance band.
//
// What is asserted:
//   - Coverage: 8/8 band seeds, no missing row (a missing row is a
//     coverage miss, and the proof fails rather than counting zero).
//   - Census totals: 91 fireside lines, 18 table-talk, 73 other.
//   - Template counts: T0 6, T1 1, T2 2, T3 2, T4 4, T5 3.
//   - Per-seed table talk: 73672 holds all 18; the other 7 hold 0.
//   - Reproduction leg: 73672's T0 fires are exactly days
//     75, 80, 84, 91, 114, 154 with speakers Gustavo, Gustavo, Ingrid,
//     Aria, Ingrid, Khalil — the tablenat observation, verbatim.
//   - Situation scope: every table-talk line is seatState waiting;
//     zero table-talk lines occur in entered state (no data there,
//     not a zero claim about entered talk in general).
//   - Band corroboration: wins 2/8, table 3/8, entered 2/8,
//     national-ever 6/8, median 166d (same band as tablenat).
// Usage: node scripts/test-tableline-a.js
'use strict';
const { analyze } = require('./sim-tableline-a-analyze');

function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function main() {
  const a = analyze([73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678]);
  const fails = [];
  const check = (name, cond, got) => { if (!cond) fails.push(`${name}: got ${JSON.stringify(got)}`); };

  check('seedsMissing', eq(a.seedsMissing, []), a.seedsMissing);
  check('seedsCovered', eq(a.seedsCovered, [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678]), a.seedsCovered);
  check('totalFireside', a.totalFireside === 91, a.totalFireside);
  check('totalTableTalk', a.totalTableTalk === 18, a.totalTableTalk);
  check('otherFiresideCount', a.otherFiresideCount === 73, a.otherFiresideCount);
  check('templateCounts', eq(a.templateCounts, { T4: 4, T0: 6, T1: 1, T3: 2, T5: 3, T2: 2 }) || eq(a.templateCounts, { T0: 6, T1: 1, T2: 2, T3: 2, T4: 4, T5: 3 }), a.templateCounts);
  for (const [seed, want] of [[73671, 0], [73672, 18], [73673, 0], [73674, 0], [73675, 0], [73676, 0], [73677, 0], [73678, 0]]) {
    check(`perSeed ${seed} tableTalk`, a.perSeed[seed].tableTalkCount === want, a.perSeed[seed].tableTalkCount);
  }
  const t0 = a.lines.filter(l => l.seed === 73672 && l.template === 'T0')
    .sort((x, y) => x.day - y.day);
  check('T0 days', eq(t0.map(l => l.day), [75, 80, 84, 91, 114, 154]), t0.map(l => l.day));
  check('T0 speakers', eq(t0.map(l => l.speaker), ['Gustavo', 'Gustavo', 'Ingrid', 'Aria', 'Ingrid', 'Khalil']), t0.map(l => l.speaker));
  check('T0 listeners', eq(t0.map(l => l.listener), ['Dale', 'Dale', 'Gustavo', 'Ingrid', 'Petra', 'Ingrid']), t0.map(l => l.listener));
  const tableLines = a.lines.filter(l => l.template !== 'OTHER');
  check('all table-talk waiting', tableLines.every(l => l.situation.seatState === 'waiting'), tableLines.map(l => l.situation.seatState));
  check('no entered table-talk', tableLines.filter(l => l.situation.seatState === 'entered').length === 0, tableLines.filter(l => l.situation.seatState === 'entered').length);
  const band = { wins: 0, table: 0, entered: 0, nationalEver: 0 };
  const days = [];
  for (const seed of Object.keys(a.perSeed)) {
    const s = a.perSeed[seed];
    if (s.won) band.wins++;
    if (s.table) band.table++;
    if (s.entered) band.entered++;
    if (['national', 'global'].includes(s.maxRank)) band.nationalEver++;
    days.push(s.days);
  }
  days.sort((x, y) => x - y);
  check('band wins', band.wins === 2, band.wins);
  check('band table', band.table === 3, band.table);
  check('band entered', band.entered === 2, band.entered);
  check('band nationalEver', band.nationalEver === 6, band.nationalEver);
  check('band medianDays', days[Math.floor(days.length / 2)] === 166, days);

  if (fails.length) {
    console.error('TABLELINE PROOF FAILS:\n  ' + fails.join('\n  '));
    process.exit(1);
  }
  console.log('TABLELINE PROOF PASS: 8/8 seeds, 91 fireside, 18 table-talk (T0 6, T1 1, T2 2, T3 2, T4 4, T5 3), all on 73672, T0 reproduction exact (days 75/80/84/91/114/154), all table-talk in waiting state, band wins 2/table 3/entered 2/national-ever 6/median 166d.');
}
if (require.main === module) main();
