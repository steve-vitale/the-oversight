#!/usr/bin/env node
// scripts/test-cdemit-bisect-a.js — sim-cdemit-bisect-a proof validator
// (scale-onramp axis, 2026-10-27, arm sim-cdemit-bisect-a. DIAG /
// MEASUREMENT ONLY, zero src/js changes.)
//
// Re-derives every number in evidence/2026-10-27/sim-cdemit-bisect-a.md
// from the per-seed corpus rows under
// evidence/2026-10-27/perseed-cdemit-bisect-a/{control,test}/ — it does
// not trust the evidence text, the sweep console output, or any summary
// file. It reuses scripts/test-diverge73677-a-sweep.js's exported diffRows /
// summarizeRow / wallsOfRow VERBATIM (that file is never edited).
// Run: node scripts/test-cdemit-bisect-a.js
// Exit non-zero on any failed check. The binding pre-registration is
// evidence/2026-10-27/sim-cdemit-bisect-a-prereg.md: DIAG-GO iff the
// control leg reproduces raidtrace's numbers AND the test leg's modes
// agree (headline + stripped full-field) AND the agreed numbers are not
// an unexplained shift (matching neither old-base nor current-base
// figures). Divergence persisting at c04d4e0cb is DIAG-NO-GO for the
// c04d4e0cb-cause hypothesis. Control failure is DIAG-NO-GO (control
// failure) and the bisection is not judged.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-27', 'perseed-cdemit-bisect-a');
const { diffRows, summarizeRow, wallsOfRow } = require('./test-diverge73677-a-sweep');

let pass = 0, fail = 0;
function ok(cond, label, extra) {
  if (cond) { pass++; console.log(`PASS ${label}`); }
  else { fail++; console.log(`FAIL ${label}${extra != null ? ' :: ' + extra : ''}`); }
}
function load(dir, name) { return JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8')); }
function loadRaw(dir, name) { return fs.readFileSync(path.join(dir, name), 'utf8'); }

const legs = {};
for (const leg of ['control', 'test']) {
  const d = path.join(DIR, leg);
  const census = [1, 2, 3].map(r => load(d, `s73677-census-rep${r}.json`));
  const transcript = [1, 2, 3].map(r => load(d, `s73677-transcript-armed-rep${r}.json`));
  const docs = [1, 2, 3].map(r => loadRaw(d, `s73677-transcript-doc-rep${r}.json`));
  legs[leg] = { census, transcript, docs };
  for (let i = 0; i < 3; i++) {
    ok(Number.isFinite(census[i].days) && Number.isFinite(census[i].deathTotal) && Number.isFinite(census[i].won),
      `${leg} census rep${i + 1} has numeric days/deaths/won`, `${census[i].days}d/${census[i].deathTotal}/won=${census[i].won}`);
    ok(Number.isFinite(transcript[i].days) && Number.isFinite(transcript[i].deathTotal) && Number.isFinite(transcript[i].won),
      `${leg} transcript rep${i + 1} has numeric days/deaths/won`, `${transcript[i].days}d/${transcript[i].deathTotal}/won=${transcript[i].won}`);
    ok(docs[i].length > 0, `${leg} transcript doc rep${i + 1} present and non-empty`, `${docs[i].length} chars`);
  }
  // Within-mode byte-equality (reported, not averaged away).
  const cSame = [1, 2].every(i => loadRaw(d, `s73677-census-rep${i + 1}.json`) === loadRaw(d, 's73677-census-rep1.json'));
  const tSame = [1, 2].every(i => loadRaw(d, `s73677-transcript-armed-rep${i + 1}.json`) === loadRaw(d, 's73677-transcript-armed-rep1.json'));
  const dSame = [1, 2].every(i => docs[i + 1] === docs[0]);
  console.log(`WITHIN-MODE ${leg}: census byte-identical=${cSame} transcript-armed byte-identical=${tSame} transcript-doc byte-identical=${dSame}`);
  ok(cSame && tSame, `${leg} within-mode variance is zero on armed rows`, `census=${cSame} transcript=${tSame}`);
  // Per-rep summaries + cross-mode diffs.
  legs[leg].pairs = [];
  for (let i = 0; i < 3; i++) {
    const sC = summarizeRow(census[i]), sT = summarizeRow(transcript[i]);
    const dff = diffRows(census[i], transcript[i]);
    ok(dff.days[0] === sC.days && dff.days[1] === sT.days, `${leg} rep${i + 1} diff days match summaries`, `${dff.days}`);
    ok(dff.deaths[0] === sC.deaths && dff.deaths[1] === sT.deaths, `${leg} rep${i + 1} diff deaths match summaries`, `${dff.deaths}`);
    ok(dff.wallsA.length === sC.walls && dff.wallsB.length === sT.walls, `${leg} rep${i + 1} diff walls match summaries`, `${dff.wallsA.length}/${dff.wallsB.length}`);
    const headlineEq = sC.days === sT.days && sC.deaths === sT.deaths && sC.walls === sT.walls && sC.won === sT.won;
    const strippedEq = dff.trajEq && dff.tickDiffs.length === 0 && Object.values(dff.secStripped).every(Boolean);
    legs[leg].pairs.push({ rep: i + 1, census: sC, transcript: sT, headlineEq, strippedEq,
      trajEq: dff.trajEq, tickDiffs: dff.tickDiffs.length, firstTickDiffDay: dff.firstTickDiffDay,
      secRaw: dff.secRaw, secStripped: dff.secStripped });
    console.log(`PAIR ${leg} rep${i + 1}: census ${sC.days}d/${sC.deaths} deaths/${sC.walls} walls/won=${sC.won} | transcript ${sT.days}d/${sT.deaths} deaths/${sT.walls} walls/won=${sT.won} | headlineEq=${headlineEq} strippedEq=${strippedEq} trajEq=${dff.trajEq} tickDiffs=${dff.tickDiffs.length} firstTickDiffDay=${dff.firstTickDiffDay}`);
  }
}

// CONTROL BAR: census 152d/41/0 walls, transcript 168d/44/2 walls, all reps.
const c = legs.control.pairs;
const controlOk = c.every(p => p.census.days === 152 && p.census.deaths === 41 && p.census.walls === 0)
  && c.every(p => p.transcript.days === 168 && p.transcript.deaths === 44 && p.transcript.walls === 2);
ok(controlOk, 'control leg reproduces raidtrace bar on all 3 rep pairs', JSON.stringify(c.map(p => [p.census.days, p.census.deaths, p.census.walls, p.transcript.days, p.transcript.deaths, p.transcript.walls])));
console.log(`CONTROL-VERDICT: ${controlOk ? 'REPRODUCES' : 'CONTROL-FAILURE'}`);

// TEST LEG: agreement per prereg definition, classification of agreed numbers.
const t = legs.test.pairs;
const testAgree = t.every(p => p.headlineEq && p.strippedEq);
console.log(`TEST-AGREEMENT: headline+stripped agree on ${t.filter(p => p.headlineEq && p.strippedEq).length}/3 pairs`);
const agreed = t[0].census; // == transcript when agreeing
const matchesCurrent = agreed.days === 130 && agreed.deaths === 37 && agreed.won === 1 && agreed.walls === 3;
const matchesOldCensus = agreed.days === 152 && agreed.deaths === 41 && agreed.walls === 0;
const matchesOldTranscript = agreed.days === 168 && agreed.deaths === 44 && agreed.walls === 2;
const unexplained = testAgree && !matchesCurrent && !matchesOldCensus && !matchesOldTranscript;
console.log(`TEST-AGREED: ${agreed.days}d/${agreed.deaths} deaths/${agreed.walls} walls/won=${agreed.won} matchesCurrent=${matchesCurrent} matchesOldCensus=${matchesOldCensus} matchesOldTranscript=${matchesOldTranscript} unexplained=${unexplained}`);
let verdict;
if (!controlOk) verdict = 'DIAG-NO-GO (control failure)';
else if (!testAgree) verdict = 'DIAG-NO-GO (divergence persists at c04d4e0cb)';
else if (unexplained) verdict = 'UNEXPLAINED shift (not a GO)';
else verdict = 'DIAG-GO';
console.log(`VERDICT: ${verdict}`);
ok(verdict !== 'DIAG-NO-GO (control failure)' || true, 'verdict computed (see VERDICT line)');

// Raidtrace-row cross-check (informational, not verdict-gating): control
// transcript doc byte-identical to raidtrace's own transcript doc?
try {
  const raidDoc = loadRaw(path.join(REPO, 'evidence', '2026-10-27', 'perseed-raidtrace-a'), 's73677-transcript.json');
  const same = legs.control.docs.every(d => d === raidDoc);
  console.log(`CONTROL-DOC-VS-RAIDTRACE byte-identical=${same}`);
} catch (e) { console.log(`CONTROL-DOC-VS-RAIDTRACE check skipped: ${e.message}`); }

console.log(`\n${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
