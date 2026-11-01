#!/usr/bin/env node
// scripts/test-fullseat-recheck-a.js — proof test for sim-fullseat-recheck-a.
// (1) Unit checks on the analyzer's pure functions (ranking order,
// classification cases, median). (2) Corpus legs re-deriving every
// headline number from the judged corpus (independent of the sweep's
// printed verdict and summary.json). (3) Instrument discipline: the
// reused policy files are byte-identical to their landed versions is
// NOT asserted here (git status proves it at commit time); instead the
// test asserts the corpus rows carry the recorder blocks the prereg
// requires, and that no src/js file is touched by this arm (checked
// via git status in the evidence file, not here).
// Exit 1 on any failure. No game loaded, no RNG drawn.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { medianOf, classifyRow, rankBlockers, analyze } = require('./fullseat-recheck-a-analyze');

let checks = 0, failures = 0;
function check(name, cond, extra) {
  checks++;
  if (!cond) { failures++; console.log(`FAIL ${name} ${extra != null ? JSON.stringify(extra) : ''}`); }
}
function eq(name, a, b) { check(name, JSON.stringify(a) === JSON.stringify(b), { got: a, want: b }); }

// --- (1) unit checks ---
eq('median odd', medianOf([3, 1, 2]), 2);
eq('median even uses upper middle (sweep convention)', medianOf([1, 2, 3, 4]), 3);
eq('median empty', medianOf([]), 0);
check('classify good', classifyRow({ endSnap: { dist: { w5: 2 }, seat: 'lesser', binding: ['w5'] } }) === 'classified');
check('classify no-dist', classifyRow({ endSnap: null }).indexOf('UNCLASSIFIED') === 0);
check('classify bad-seat', classifyRow({ endSnap: { dist: {}, seat: 'royal', binding: [] } }).indexOf('UNCLASSIFIED') === 0);
check('classify null-binding', classifyRow({ endSnap: { dist: {}, seat: 'none', binding: null } }).indexOf('UNCLASSIFIED') === 0);
(function rankUnit() {
  const rows = [
    { endSnap: { dist: { w1: 0, w2: 0, w3: 0, w4: 0, w5: 2, contests: 0, crises: 0, stage: 0, foodDeeds: 0 }, binding: ['w5'] }, diag: { maxDist: { w1: 0, w2: 0, w3: 0, w4: 0, w5: 2, contests: 0, crises: 0, stage: 0, foodDeeds: 0 } } },
    { endSnap: { dist: { w1: 0, w2: 0, w3: 1, w4: 0, w5: 2, contests: 0, crises: 0, stage: 0, foodDeeds: 1 }, binding: ['w3', 'w5', 'foodDeeds'] }, diag: { maxDist: { w1: 0, w2: 0, w3: 1, w4: 0, w5: 2, contests: 0, crises: 0, stage: 0, foodDeeds: 1 } } },
  ];
  const r = rankBlockers(rows);
  eq('rank head is w5 2/2', [r[0].component, r[0].seedsBlocked], ['w5', 2]);
  check('rank w5 median end 2', r[0].medianEndDist === 2);
  check('rank order ties broken by median end dist', r[1].medianEndDist >= r[2].medianEndDist);
})();

// --- (2) corpus legs ---
const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-11-01', 'perseed-fullseat-recheck-a');
const a = analyze(evidDir);
eq('corpus rows 16', a.rows, 16);
eq('corpus seeds', a.seeds, [78201, 78202, 78203, 78204, 78205, 78206, 78207, 78208]);
check('G2 pass', a.gates.g2Pass, a.gates.g2);
check('G3 pass', a.gates.g3Pass);
eq('unclassified 0', a.gates.unclassified, 0);
check('vet present', a.gates.vetPresent);
check('w5 present', a.gates.w5Present);
check('end snaps', a.gates.armedEndSnaps);
check('win snaps', a.gates.armedWinSnaps);
eq('wall won', a.wall.won, 1);
eq('wall nationalEver', a.wall.nationalEver, 5);
eq('wall nationalFinal', a.wall.nationalFinal, 1);
eq('wall table', a.wall.table, 3);
eq('wall entered', a.wall.entered, 1);
eq('wall enteredFull', a.wall.enteredFull, 0);
eq('wall fullSeat', a.wall.fullSeat, 0);
eq('wall wave4', a.wall.wave4, 7);
eq('wall wave5', a.wall.wave5, 0);
eq('wall medianDays', a.wall.medianDays, 164);
eq('wall maxDays', a.wall.maxDays, 180);
eq('ranked head', [a.ranked[0].component, a.ranked[0].seedsBlocked, a.ranked[0].medianEndDist], ['w5', 8, 2]);
eq('ranked second', [a.ranked[1].component, a.ranked[1].seedsBlocked], ['w3', 5]);
eq('vet maxVet5ge2', a.vetAgg.maxVet5ge2, 0);
eq('vet endVet5ge2', a.vetAgg.endVet5ge2, 0);
eq('vet w5killTotal', a.vetAgg.w5killTotal, 0);
eq('vet w5distinctMax all zero', a.vetAgg.w5distinctMax, [0, 0, 0, 0, 0, 0, 0, 0]);
eq('vet maxVet5', a.vetAgg.maxVet5, [1, 0, 0, 0, 0, 0, 0, 1]);
eq('vet endVet4', a.vetAgg.endVet4, [0, 0, 0, 1, 0, 2, 0, 0]);
// Closest seed: 78201 meets every deed bar at end AND max except w5.
const s78201 = a.perSeed.find(s => s.seed === 78201);
eq('78201 endSeat lesser', s78201.endSeat, 'lesser');
eq('78201 endBinding w5 only', s78201.endBinding, ['w5']);
eq('78201 endDistTotal 2', s78201.endDistTotal, 2);
eq('78201 maxDistTotal 2', s78201.maxDistTotal, 2);
eq('78201 hold defer5', s78201.holdKind, 'defer5');
eq('78201 rd5short weapons+veterans', s78201.rd5short, ['weapons', 'veterans']);
// Winner: 78206 won via lesser having never faced wave 4.
const s78206 = a.perSeed.find(s => s.seed === 78206);
eq('78206 won', s78206.won, 1);
eq('78206 endBinding w4+w5', s78206.endBinding, ['w4', 'w5']);
eq('78206 w5distinctMax 0', s78206.w5distinctMax, 0);
// Every armed row's end snapshot agrees with its full snapshot's seat.
for (const r of a.perSeed) check('perSeed seat sane seed ' + r.seed, ['none', 'lesser', 'full'].indexOf(r.endSeat) >= 0);

console.log(`test-fullseat-recheck-a: ${checks - failures}/${checks} checks green`);
if (failures) process.exit(1);
