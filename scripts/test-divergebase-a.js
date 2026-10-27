#!/usr/bin/env node
// scripts/test-divergebase-a.js — sim-divergebase-a proof validator
// (scale-onramp axis, 2026-10-27, arm sim-divergebase-a. DIAG /
// MEASUREMENT ONLY, zero src/js changes.)
//
// Re-derives every number in evidence/2026-10-27/sim-divergebase-a.md
// from the per-seed corpus rows under
// evidence/2026-10-27/perseed-divergebase-a/ — it does not trust the
// evidence text, the sweep console output, or any summary file. It
// reuses scripts/test-diverge73677-a-sweep.js's exported diffRows /
// summarizeRow / wallsOfRow VERBATIM (that file is never edited).
// Run: node scripts/test-divergebase-a.js
// Exit non-zero on any failed check. The binding pre-registration is
// evidence/2026-10-27/sim-divergebase-a-prereg.md: DIAG-GO iff census
// and transcript differ on deaths or walls in the majority of rep
// pairs (>= 2 of 3) AND the direction matches raidtrace's recorded
// direction (transcript MORE deaths and/or MORE walls).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-27', 'perseed-divergebase-a');
const { diffRows, summarizeRow, wallsOfRow } = require('./test-diverge73677-a-sweep');

let pass = 0, fail = 0;
function ok(cond, label, extra) {
  if (cond) { pass++; console.log(`PASS ${label}`); }
  else { fail++; console.log(`FAIL ${label}${extra != null ? ' :: ' + extra : ''}`); }
}
function load(dir, name) { return JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8')); }
function loadBase(name) { return load(DIR, name); }

const census = [1, 2, 3].map(r => loadBase(`s73677-census-rep${r}.json`));
const transcript = [1, 2, 3].map(r => loadBase(`s73677-transcript-armed-rep${r}.json`));
const docs = [1, 2, 3].map(r => loadBase(`s73677-transcript-doc-rep${r}.json`));
// Raidtrace corpus (the values this arm attempted to reproduce on the
// old base) lives in evidence/2026-10-27/perseed-raidtrace-a/ — read
// directly, never edited.
const raidDir = path.join(REPO, 'evidence', '2026-10-27', 'perseed-raidtrace-a');
const raidC = load(raidDir, 's73677-armed.json');
const raidT = load(raidDir, 's73677-transcript-armed.json');

// 1. Raidtrace reference values as recorded (the reproduction target).
ok(raidC.days === 152 && raidC.deathTotal === 41, 'raidtrace census row is 152d/41 deaths', `${raidC.days}d/${raidC.deathTotal}`);
ok(wallsOfRow(raidC).length === 0, 'raidtrace census row has 0 walls', `${wallsOfRow(raidC).length}`);
ok(raidT.days === 168 && raidT.deathTotal === 44, 'raidtrace transcript row is 168d/44 deaths', `${raidT.days}d/${raidT.deathTotal}`);
ok(wallsOfRow(raidT).length === 2, 'raidtrace transcript row has 2 walls', `${wallsOfRow(raidT).length}`);

// 2. Rep counts and field presence: 3 reps per mode, transcript docs present.
ok(census.length === 3 && transcript.length === 3, 'rep counts: 3 census, 3 transcript');
for (let i = 0; i < 3; i++) {
  for (const [label, row] of [['census', census[i]], ['transcript', transcript[i]]]) {
    ok(Number.isFinite(row.days) && Number.isFinite(row.deathTotal) && Number.isFinite(row.won),
      `${label} rep${i + 1} has numeric days/deaths/won`, `${row.days}d/${row.deathTotal}/won=${row.won}`);
  }
  ok(Number.isFinite(docs[i].totalLines) || docs[i].lines != null || Object.keys(docs[i]).length > 0,
    `transcript doc rep${i + 1} present and non-empty`);
}

// 3. Per-rep summaries and pair comparisons, recomputed from the rows.
const pairs = [];
for (let i = 0; i < 3; i++) {
  const sC = summarizeRow(census[i]), sT = summarizeRow(transcript[i]);
  const d = diffRows(census[i], transcript[i]);
  ok(d.days[0] === sC.days && d.days[1] === sT.days, `rep${i + 1} diff days match summaries`, `${d.days}`);
  ok(d.deaths[0] === sC.deaths && d.deaths[1] === sT.deaths, `rep${i + 1} diff deaths match summaries`, `${d.deaths}`);
  ok(d.wallsA.length === sC.walls && d.wallsB.length === sT.walls, `rep${i + 1} diff walls match summaries`, `${d.wallsA.length}/${d.wallsB.length}`);
  const differs = (sC.deaths !== sT.deaths) || (sC.walls !== sT.walls);
  const directionOk = (sT.deaths >= sC.deaths && sT.walls >= sC.walls) && (sT.deaths > sC.deaths || sT.walls > sC.walls);
  pairs.push({ rep: i + 1, census: sC, transcript: sT, differs, directionOk,
    trajEq: d.trajEq, tickDiffs: d.tickDiffs.length, firstTickDiffDay: d.firstTickDiffDay });
  console.log(`PAIR rep${i + 1}: census ${sC.days}d/${sC.deaths} deaths/${sC.walls} walls/won=${sC.won} | transcript ${sT.days}d/${sT.deaths} deaths/${sT.walls} walls/won=${sT.won} | differs=${differs} directionOk=${directionOk} trajEq=${d.trajEq} firstTickDiffDay=${d.firstTickDiffDay}`);
}

// 4. Verdict fields, derived by the pre-registered rule (never hand-set).
const differingPairs = pairs.filter(p => p.differs).length;
const directionPairs = pairs.filter(p => p.differs && p.directionOk).length;
const verdict = (differingPairs >= 2 && directionPairs >= 2) ? 'DIAG-GO' : 'DIAG-NO-GO';
console.log(`VERDICT FIELDS: differingPairs=${differingPairs}/3 directionPairs=${directionPairs}/3 verdict=${verdict}`);
ok(differingPairs >= 0 && differingPairs <= 3, 'differing-pair count in range', `${differingPairs}`);
ok(directionPairs <= differingPairs, 'direction-pair count <= differing-pair count', `${directionPairs}/${differingPairs}`);
ok(verdict === 'DIAG-GO' || verdict === 'DIAG-NO-GO', 'verdict is a valid DIAG verdict', verdict);
if (verdict === 'DIAG-GO') {
  ok(differingPairs >= 2 && directionPairs >= 2, 'DIAG-GO implies majority differing pairs in raidtrace direction');
} else {
  ok(!(differingPairs >= 2 && directionPairs >= 2), 'DIAG-NO-GO implies the GO bar is not met');
}

// 5. Within-mode variance, reported (not assumed): distinct summaries per mode.
const cDistinct = new Set(pairs.map(p => JSON.stringify(p.census))).size;
const tDistinct = new Set(pairs.map(p => JSON.stringify(p.transcript))).size;
console.log(`WITHIN-MODE: census distinct summaries=${cDistinct}/3 transcript distinct summaries=${tDistinct}/3`);
ok(cDistinct >= 1 && cDistinct <= 3 && tDistinct >= 1 && tDistinct <= 3, 'within-mode distinct counts in range', `${cDistinct}/${tDistinct}`);

// 6. Reproduction check against raidtrace's own values (reported, not judged
// beyond the verdict rule above): does any rep equal the raidtrace row?
const censusRepro = pairs.some(p => p.census.days === 152 && p.census.deaths === 41 && p.census.walls === 0);
const transcriptRepro = pairs.some(p => p.transcript.days === 168 && p.transcript.deaths === 44 && p.transcript.walls === 2);
console.log(`REPRODUCTION: census matches raidtrace 152/41/0 in any rep: ${censusRepro}; transcript matches raidtrace 168/44/2 in any rep: ${transcriptRepro}`);
ok(typeof censusRepro === 'boolean' && typeof transcriptRepro === 'boolean', 'reproduction flags computed');

// 7. Prereg + evidence files exist (the run's paper trail, not its numbers).
for (const f of ['sim-divergebase-a-prereg.md', 'sim-divergebase-a.md']) {
  ok(fs.existsSync(path.join(REPO, 'evidence', '2026-10-27', f)), `evidence file present: ${f}`);
}

console.log(`\n${pass} PASS, ${fail} FAIL`);
console.log(`FINAL VERDICT: ${verdict} (differingPairs=${differingPairs}, directionPairs=${directionPairs})`);
if (fail) process.exit(1);
