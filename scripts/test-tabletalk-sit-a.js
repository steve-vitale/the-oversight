#!/usr/bin/env node
// scripts/test-tabletalk-sit-a.js — sim-tabletalk-sit-a proof (DIAG,
// zero src/js). Re-runs the analyzer over the harvested corpus in
// evidence/2026-10-26/perseed-sim-tabletalk-sit-a/ and asserts the
// exact numbers this arm reports. If the corpus changes, the proof
// fails — the numbers below are the report, not a tolerance band.
//
// What is asserted:
//   - Coverage: 8/8 band seeds, no missing row; the wrapper
//     intercepted tableWaitTalk on all 8 seeds (all waiting seeds
//     included — the analyzer itself exits 1 otherwise).
//   - Fires: 18 total, all on 73672; template counts T0 6, T1 1,
//     T2 2, T3 2, T4 4, T5 3.
//   - Fire reproduction: the 18 fires match the sim-tableline-a
//     corpus exactly (day + template + speaker), proving the
//     instrument did not perturb the waiting village's trajectory.
//   - DIAG bar leg 1: snapshot complete (pantry + waitDur + seatKind
//     + stage) on 18/18 fires (100% >= 90%).
//   - DIAG bar leg 2: the per-template gap is enumerated for all 6
//     templates; every template's mentioned list is empty (no template
//     states any situation value) and every template's
//     readable-but-unused list contains pantryKcal, pelletOnline,
//     nationProdFired, overtimeTier, waitDurDays, seatKind, stage.
//   - Picker-native gap (reported, not a second gate): picker-native
//     completeness is 0/18, and no stored waiting-since field is
//     present on any fire — the wait duration is observer-derived,
//     not picker-native.
//   - Band as measured on current master + its exact delta vs the
//     1816Z (806ef430e) table: wins 2, nationalEver 6, nationalFinal
//     5, entered 2, wave3 8, wave4 6, wave5 0, starvation 1 (all
//     unchanged); table 4 (was 3), median 152d (was 166d), deaths
//     307 (was 338). The proof PINS the delta; a different delta
//     fails it, so a silently re-derived band cannot pass.
//   - Pick-time pantry refinement: the day-114 T0 fire reads pantry
//     0 (empty) at pick time — not the tableline daily snapshot's
//     2,510 — and the day-75 T0 fire reads 10,305 (agreeing).
//   - Coverage notes (not gates, asserted as structure): 73677 waits
//     22 days with 0 fires (dice: ~6 cooldown-eligible calls at
//     22%); every fire's seat kind is lesser and stage is 3, so
//     full-seat and entered-state talk have zero occurrences here.
// Usage: node scripts/test-tabletalk-sit-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const { analyze } = require('./sim-tabletalk-sit-a-analyze');

const REPO = path.join(__dirname, '..');
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function main() {
  const a = analyze([73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678]);
  const fails = [];
  const check = (name, cond, got) => { if (!cond) fails.push(`${name}: got ${JSON.stringify(got)}`); };

  check('seedsMissing', eq(a.seedsMissing, []), a.seedsMissing);
  check('seedsCovered', eq(a.seedsCovered, [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678]), a.seedsCovered);
  check('totalFires', a.totalFires === 18, a.totalFires);
  check('templateCounts', eq(a.templateCounts, { T4: 4, T0: 6, T1: 1, T3: 2, T5: 3, T2: 2 }) || eq(a.templateCounts, { T0: 6, T1: 1, T2: 2, T3: 2, T4: 4, T5: 3 }), a.templateCounts);
  for (const [seed, want] of [[73671, 0], [73672, 18], [73673, 0], [73674, 0], [73675, 0], [73676, 0], [73677, 0], [73678, 0]]) {
    check(`perSeed ${seed} fires`, a.perSeed[seed].firesCount === want, a.perSeed[seed].firesCount);
  }
  // Fire reproduction vs the tableline corpus (day + template + speaker).
  const ta = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-tableline-a', 'analysis.json'), 'utf8'));
  const tlFires = ta.lines.filter(l => l.template !== 'OTHER').map(l => ({ day: l.day, template: l.template, speaker: l.speaker }));
  const myFires = a.fires.map(f => ({ day: f.day, template: f.template, speaker: f.speaker }));
  check('fires match tableline corpus', eq(myFires, tlFires), { mine: myFires, tableline: tlFires });
  // DIAG bar leg 1.
  check('snapshot complete 18/18', a.snapshotCompleteness.complete === 18 && a.snapshotCompleteness.total === 18, a.snapshotCompleteness);
  check('snapshot pct >= 0.90', a.snapshotCompleteness.pct >= 0.90, a.snapshotCompleteness.pct);
  // DIAG bar leg 2: gap enumerated per template.
  const mustUnused = ['pantryKcal', 'pelletOnline', 'nationProdFired', 'overtimeTier', 'waitDurDays', 'seatKind', 'stage'];
  for (const t of ['T0', 'T1', 'T2', 'T3', 'T4', 'T5']) {
    const g = a.perTemplate[t];
    check(`${t} gap present`, !!g, null);
    check(`${t} mentioned empty`, eq(g.mentioned, []), g.mentioned);
    for (const fact of mustUnused) check(`${t} unused includes ${fact}`, g.readableButUnused.some(u => u.startsWith(fact)), g.readableButUnused);
  }
  // Picker-native gap.
  check('picker-native complete 0/18', a.pickerNativeCompleteness.complete === 0, a.pickerNativeCompleteness);
  check('no stored waiting-since field ever', a.storedWaitingSinceFieldEverPresent === false, a.storedWaitingSinceFieldEverPresent);
  // Band as measured + exact delta vs 1816Z.
  const sum = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-tabletalk-sit-a', 'summary.json'), 'utf8'));
  const b = sum.band;
  check('band wins', b.wins === 2, b.wins);
  check('band nationalEver', b.nationalEver === 6, b.nationalEver);
  check('band nationalFinal', b.nationalFinal === 5, b.nationalFinal);
  check('band entered', b.entered === 2, b.entered);
  check('band wave3', b.wave3 === 8, b.wave3);
  check('band wave4', b.wave4 === 6, b.wave4);
  check('band wave5', b.wave5 === 0, b.wave5);
  check('band starvation', b.starvationTotal === 1, b.starvationTotal);
  check('band table (delta +1 vs 1816Z)', b.table === 4, b.table);
  check('band medianDays (delta -14 vs 1816Z)', b.medianDays === 152, b.medianDays);
  check('band deathTotal (delta -31 vs 1816Z)', b.deathTotal === 307, b.deathTotal);
  // Pick-time pantry refinement.
  const f114 = a.fires.find(f => f.day === 114 && f.template === 'T0');
  check('day-114 T0 pick-time pantry 0', f114 && f114.snapshot.pantryKcal === 0 && f114.snapshot.pantryClass === 'empty', f114 && f114.snapshot);
  const f75 = a.fires.find(f => f.day === 75 && f.template === 'T0');
  check('day-75 T0 pick-time pantry 10305', f75 && f75.snapshot.pantryKcal === 10305, f75 && f75.snapshot);
  // Structure notes.
  check('73677 waits 22d, 0 fires', a.perSeed[73677].waitingDays === 22 && a.perSeed[73677].firesCount === 0, a.perSeed[73677]);
  check('all fires lesser seat', a.fires.every(f => f.snapshot.seatKind === 'lesser'), a.fires.map(f => f.snapshot.seatKind));
  check('all fires stage 3', a.fires.every(f => f.snapshot.stage === 3), a.fires.map(f => f.snapshot.stage));

  if (fails.length) {
    console.error('TABLETALK-SIT PROOF FAILS:\n  ' + fails.join('\n  '));
    process.exit(1);
  }
  console.log('TABLETALK-SIT PROOF PASS: 8/8 seeds, 18 fires all on 73672 (T0 6, T1 1, T2 2, T3 2, T4 4, T5 3) matching the tableline corpus exactly; snapshot complete 18/18 (100%); gap enumerated for all 6 templates (mentioned: none; all 7 core facts readable-but-unused per template); picker-native 0/18 with no stored waiting-since field; band wins 2/natEver 6/natFinal 5/entered 2/wave4 6/wave5 0 with pinned delta table 4/median 152d/deaths 307 vs 1816Z.');
}
if (require.main === module) main();
